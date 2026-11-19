import pytest
from fastapi.testclient import TestClient
from main import app
from core.database import SessionLocal, Base, engine
from services.exercise_service import seed_interactive_exercises

@pytest.fixture(scope="session", autouse=True)
def setup_exercises_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_interactive_exercises(db)
    finally:
        db.close()
    yield

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers(client):
    client.post("/api/v1/auth/register", json={
        "email": "exercisetester@javaquest.dev",
        "username": "exercise_tester",
        "password": "SecretPassword123!",
        "role": "learner"
    })
    res = client.post("/api/v1/auth/login", json={
        "username_or_email": "exercise_tester",
        "password": "SecretPassword123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_list_exercises(client, auth_headers):
    res = client.get("/api/v1/exercises", headers=auth_headers)
    assert res.status_code == 200
    exercises = res.json()
    assert len(exercises) >= 7
    types = {ex["exercise_type"] for ex in exercises}
    assert "complete_code" in types
    assert "bug_hunt" in types
    assert "parsons_puzzle" in types
    assert "predict_output" in types
    assert "modernize_refactor" in types
    assert "break_code" in types
    assert "keyword_cloze" in types

def test_complete_code_submission(client, auth_headers):
    res = client.get("/api/v1/exercises?exercise_type=complete_code", headers=auth_headers)
    ex = res.json()[0]

    submit_res = client.post(f"/api/v1/exercises/{ex['id']}/submit", json={
        "submission_data": {
            "code": "public boolean withdraw(double amount) { if (amount > 0 && amount <= this.balance) { this.balance -= amount; return true; } return false; }"
        }
    }, headers=auth_headers)
    assert submit_res.status_code == 200
    data = submit_res.json()
    assert data["is_correct"] is True
    assert data["xp_awarded"] > 0

def test_bug_hunt_submission(client, auth_headers):
    res = client.get("/api/v1/exercises?exercise_type=bug_hunt", headers=auth_headers)
    ex = res.json()[0]

    submit_res = client.post(f"/api/v1/exercises/{ex['id']}/submit", json={
        "submission_data": {
            "patch": "this(name);\nSystem.out.println(\"Init student...\");"
        }
    }, headers=auth_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["is_correct"] is True

def test_parsons_submission(client, auth_headers):
    res = client.get("/api/v1/exercises?exercise_type=parsons_puzzle", headers=auth_headers)
    ex = res.json()[0]

    submit_res = client.post(f"/api/v1/exercises/{ex['id']}/submit", json={
        "submission_data": {
            "sequence": ["t1", "t2", "t3", "t4"]
        }
    }, headers=auth_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["is_correct"] is True

def test_output_prediction_submission(client, auth_headers):
    res = client.get("/api/v1/exercises?exercise_type=predict_output", headers=auth_headers)
    ex = res.json()[0]

    submit_res = client.post(f"/api/v1/exercises/{ex['id']}/submit", json={
        "submission_data": {
            "choice": "false true true"
        }
    }, headers=auth_headers)
    assert submit_res.status_code == 200
    assert submit_res.json()["is_correct"] is True
