import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture
def auth_headers(client):
    client.post("/api/v1/auth/register", json={
        "email": "execuser@javaquest.dev",
        "username": "exec_tester",
        "password": "SecretPassword123!",
        "role": "learner"
    })
    res = client.post("/api/v1/auth/login", json={
        "username_or_email": "exec_tester",
        "password": "SecretPassword123!"
    })
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_java_execution_clean(client, auth_headers):
    java_code = """
public class Creature {
    private String name = "Dragon";
    private int energy = 100;

    public int attack() {
        return 50;
    }
}
"""
    res = client.post("/api/v1/execution/run", json={
        "code": java_code,
        "class_name": "Creature",
        "test_cases": [
            {"name": "testAttackMethod", "description": "Verify attack method returns damage", "token": "public int attack()"}
        ]
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["compiled"] is True
    assert data["errors"] is None
    assert len(data["test_results"]) == 1
    assert data["test_results"][0]["passed"] is True

def test_java_execution_syntax_error(client, auth_headers):
    java_code = "public class BadCreature { unclosed bracket"
    res = client.post("/api/v1/execution/run", json={
        "code": java_code,
        "class_name": "BadCreature"
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["compiled"] is False
    assert data["errors"] is not None
