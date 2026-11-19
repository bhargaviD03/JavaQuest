import pytest
from fastapi.testclient import TestClient
from main import app
from core.database import SessionLocal, Base, engine
from services.gamification_service import seed_achievements
from services.roadmap_service import seed_roadmap
from services.project_service import seed_projects
from services.question_service import import_question_bank
from models.question_bank import QuestionBank

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_achievements(db)
        seed_roadmap(db)
        seed_projects(db)
        if db.query(QuestionBank).count() == 0:
            import_question_bank(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

def test_health(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_auth_and_profile(client):
    learner_data = {
        "email": "learner@javaquest.dev",
        "username": "java_learner",
        "password": "SecretPassword123!",
        "role": "learner",
        "avatar": "cat-coder"
    }
    client.post("/api/v1/auth/register", json=learner_data)

    login_res = client.post("/api/v1/auth/login", json={
        "username_or_email": "java_learner",
        "password": "SecretPassword123!"
    })
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    token = data["access_token"]
    assert data["user"]["role"] == "learner"

    headers = {"Authorization": f"Bearer {token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["username"] == "java_learner"

def test_companion_registration_and_space(client):
    login_l = client.post("/api/v1/auth/login", json={
        "username_or_email": "java_learner",
        "password": "SecretPassword123!"
    })
    learner_token = login_l.json()["access_token"]
    learner_headers = {"Authorization": f"Bearer {learner_token}"}

    space_res = client.post("/api/v1/auth/spaces", json={"name": "Java Pair Study Room"}, headers=learner_headers)
    assert space_res.status_code == 200
    space_data = space_res.json()
    invite_code = space_data["invite_code"]
    space_id = space_data["id"]
    assert invite_code is not None

    companion_data = {
        "email": "companion@javaquest.dev",
        "username": "py_companion",
        "password": "SecretPassword123!",
        "role": "companion",
        "avatar": "dog-coder"
    }
    client.post("/api/v1/auth/register", json=companion_data)

    login_c = client.post("/api/v1/auth/login", json={
        "username_or_email": "py_companion",
        "password": "SecretPassword123!"
    })
    companion_token = login_c.json()["access_token"]
    companion_headers = {"Authorization": f"Bearer {companion_token}"}

    join_res = client.post("/api/v1/auth/spaces/join", json={"invite_code": invite_code}, headers=companion_headers)
    assert join_res.status_code == 200
    assert len(join_res.json()["members"]) >= 2

def test_question_bank_and_solution_reveal(client):
    login_l = client.post("/api/v1/auth/login", json={
        "username_or_email": "java_learner",
        "password": "SecretPassword123!"
    })
    headers = {"Authorization": f"Bearer {login_l.json()['access_token']}"}

    list_res = client.get("/api/v1/questions/", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert len(items) > 0

    first_q = items[0]
    q_id = first_q["id"]

    attempt_res = client.post(
        f"/api/v1/questions/{q_id}/attempt",
        json={"submitted_answer": "public class Book { ... }", "self_assessment": "understood"},
        headers=headers
    )
    assert attempt_res.status_code == 200
    attempt_data = attempt_res.json()
    assert attempt_data["solution_guidance"] is not None

    attempt_res_2 = client.post(
        f"/api/v1/questions/{q_id}/attempt",
        json={"submitted_answer": "public class Book retry { ... }", "self_assessment": "understood"},
        headers=headers
    )
    assert attempt_res_2.json()["xp_awarded"] == 0

def test_daily_institute_session(client):
    login_l = client.post("/api/v1/auth/login", json={
        "username_or_email": "java_learner",
        "password": "SecretPassword123!"
    })
    headers = {"Authorization": f"Bearer {login_l.json()['access_token']}"}

    session_payload = {
        "institute_topic": "Polymorphism and Method Overriding",
        "taught_summary": "Covered method signatures, runtime dispatch, and @Override.",
        "understood_summary": "Overriding replaces parent method logic in subclasses.",
        "difficulty_notes": "Covariant return types and superclass references."
    }
    res = client.post("/api/v1/daily-session/", json=session_payload, headers=headers)
    assert res.status_code == 200
    s_data = res.json()
    assert len(s_data["items"]) == 9

    session_id = s_data["id"]
    item_id = s_data["items"][0]["id"]

    complete_res = client.post(
        f"/api/v1/daily-session/{session_id}/items/{item_id}/complete",
        json={"user_response": "Understood the concept breakdown"},
        headers=headers
    )
    assert complete_res.status_code == 200
    assert complete_res.json()["is_completed"] is True

    finish_res = client.post(f"/api/v1/daily-session/{session_id}/finish", headers=headers)
    assert finish_res.status_code == 200
    assert finish_res.json()["status"] == "completed"

def test_companion_challenge_independent_submissions(client):
    login_l = client.post("/api/v1/auth/login", json={"username_or_email": "java_learner", "password": "SecretPassword123!"})
    learner_headers = {"Authorization": f"Bearer {login_l.json()['access_token']}"}

    login_c = client.post("/api/v1/auth/login", json={"username_or_email": "py_companion", "password": "SecretPassword123!"})
    companion_headers = {"Authorization": f"Bearer {login_c.json()['access_token']}"}

    spaces = client.get("/api/v1/auth/spaces/my", headers=learner_headers).json()
    assert len(spaces) > 0
    space_id = spaces[0]["id"]

    q_res = client.get("/api/v1/questions/", headers=learner_headers).json()
    assert len(q_res["items"]) > 0
    q_id = q_res["items"][0]["id"]

    create_res = client.post(
        "/api/v1/companion/sessions",
        json={"space_id": space_id, "question_id": q_id, "title": "OOP Foundations Shared Session"},
        headers=learner_headers
    )
    assert create_res.status_code == 200
    session_id = create_res.json()["id"]

    sub_l = client.post(
        f"/api/v1/companion/sessions/{session_id}/submit",
        json={"answer": "Learner Java Solution", "reasoning": "Used instance fields and constructor"},
        headers=learner_headers
    )
    assert sub_l.status_code == 200
    detail_after_l = sub_l.json()
    assert detail_after_l["both_submitted"] is False

    comp_view = client.get(f"/api/v1/companion/sessions/{session_id}", headers=companion_headers).json()
    assert comp_view["both_submitted"] is False
    assert "Hidden until both" in comp_view["submissions"][0]["answer"]

    sub_c = client.post(
        f"/api/v1/companion/sessions/{session_id}/submit",
        json={"answer": "Companion Python-style Java Solution", "reasoning": "Used getter and setters"},
        headers=companion_headers
    )
    assert sub_c.status_code == 200
    detail_after_c = sub_c.json()
    assert detail_after_c["both_submitted"] is True

    for sub in detail_after_c["submissions"]:
        assert "Hidden until both" not in sub["answer"]

def test_ai_mentor_conversation(client):
    login_l = client.post("/api/v1/auth/login", json={"username_or_email": "java_learner", "password": "SecretPassword123!"})
    headers = {"Authorization": f"Bearer {login_l.json()['access_token']}"}

    conv_res = client.post(
        "/api/v1/mentor/conversations",
        json={"title": "Python vs Java OOP", "mode": "python_vs_java", "topic_context": "Classes and Constructors"},
        headers=headers
    )
    assert conv_res.status_code == 200
    conv_id = conv_res.json()["id"]

    msg_res = client.post(
        f"/api/v1/mentor/conversations/{conv_id}/messages",
        json={"content": "How do constructors differ in Python vs Java?"},
        headers=headers
    )
    assert msg_res.status_code == 200
    reply = msg_res.json()["content"]
    assert len(reply) > 20
    assert "Python" in reply or "Java" in reply

def test_project_lab_and_external_practice(client):
    login_l = client.post("/api/v1/auth/login", json={"username_or_email": "java_learner", "password": "SecretPassword123!"})
    headers = {"Authorization": f"Bearer {login_l.json()['access_token']}"}

    # Project Lab
    projects_res = client.get("/api/v1/projects/", headers=headers)
    assert projects_res.status_code == 200
    projects = projects_res.json()
    assert len(projects) >= 4

    p_id = projects[0]["id"]
    ms_res = client.post(
        f"/api/v1/projects/{p_id}/milestones/1",
        json={"is_completed": True, "learner_code": "public class Student {}", "learner_reflection": "Completed milestone 1"},
        headers=headers
    )
    assert ms_res.status_code == 200
    assert ms_res.json()["status"] == "success"

    # External Practice
    ext_res = client.get("/api/v1/external-practice/", headers=headers)
    assert ext_res.status_code == 200
    ext_items = ext_res.json()
    assert len(ext_items) >= 5

    c_id = ext_items[0]["id"]
    update_res = client.put(
        f"/api/v1/external-practice/{c_id}/status",
        json={"status": "solved", "notes": "Solved basic HackerRank warmup"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["user_status"] == "solved"
