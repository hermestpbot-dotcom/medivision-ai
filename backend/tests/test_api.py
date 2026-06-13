"""
Backend API Tests
Run with: pytest tests/ -v
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def auth_headers(client):
    """Register a test user and return auth headers."""
    # Register
    res = await client.post("/api/v1/auth/register", json={
        "email": "test@medivision.ai",
        "password": "testpass123",
        "full_name": "Test User",
        "role": "patient",
    })
    if res.status_code == 201:
        token = res.json()["access_token"]
    else:
        # Login if already exists
        res = await client.post("/api/v1/auth/login", params={
            "email": "test@medivision.ai",
            "password": "testpass123",
        })
        token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ============================================================
# Health Check
# ============================================================
@pytest.mark.anyio
async def test_health_check(client):
    res = await client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "MediVision AI"


@pytest.mark.anyio
async def test_root(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert "MediVision AI" in res.json()["message"]


# ============================================================
# Authentication
# ============================================================
@pytest.mark.anyio
async def test_register(client):
    res = await client.post("/api/v1/auth/register", json={
        "email": "newuser@medivision.ai",
        "password": "password123",
        "full_name": "New User",
        "role": "patient",
    })
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newuser@medivision.ai"


@pytest.mark.anyio
async def test_register_duplicate_email(client):
    # Register first user
    await client.post("/api/v1/auth/register", json={
        "email": "duplicate@medivision.ai",
        "password": "password123",
        "full_name": "User One",
        "role": "patient",
    })
    # Try duplicate
    res = await client.post("/api/v1/auth/register", json={
        "email": "duplicate@medivision.ai",
        "password": "password123",
        "full_name": "User Two",
        "role": "patient",
    })
    assert res.status_code == 409


@pytest.mark.anyio
async def test_login(client):
    # Register first
    await client.post("/api/v1/auth/register", json={
        "email": "login@medivision.ai",
        "password": "password123",
        "full_name": "Login User",
        "role": "patient",
    })
    # Login
    res = await client.post("/api/v1/auth/login", params={
        "email": "login@medivision.ai",
        "password": "password123",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@medivision.ai"


@pytest.mark.anyio
async def test_login_wrong_password(client):
    await client.post("/api/v1/auth/register", json={
        "email": "wrongpass@medivision.ai",
        "password": "password123",
        "full_name": "Wrong Pass User",
        "role": "patient",
    })
    res = await client.post("/api/v1/auth/login", params={
        "email": "wrongpass@medivision.ai",
        "password": "wrongpassword",
    })
    assert res.status_code == 401


@pytest.mark.anyio
async def test_get_me(client, auth_headers):
    res = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["email"] == "test@medivision.ai"


@pytest.mark.anyio
async def test_unauthorized_access(client):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 401


# ============================================================
# Chatbot
# ============================================================
@pytest.mark.anyio
async def test_chatbot_greeting(client, auth_headers):
    res = await client.post("/api/v1/chatbot/chat", json={
        "content": "Hello",
        "language": "english",
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 0


@pytest.mark.anyio
async def test_chatbot_heart_disease_info(client, auth_headers):
    res = await client.post("/api/v1/chatbot/chat", json={
        "content": "What are the symptoms of heart disease?",
        "language": "english",
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "symptom" in data["reply"].lower() or "heart" in data["reply"].lower()


@pytest.mark.anyio
async def test_chatbot_blood_pressure(client, auth_headers):
    res = await client.post("/api/v1/chatbot/chat", json={
        "content": "What is normal blood pressure?",
        "language": "english",
    }, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert "120" in data["reply"] or "blood pressure" in data["reply"].lower()


@pytest.mark.anyio
async def test_chatbot_sessions(client, auth_headers):
    # Create session
    res = await client.post("/api/v1/chatbot/sessions", params={"language": "english"}, headers=auth_headers)
    assert res.status_code == 201
    session_id = res.json()["id"]

    # Get sessions
    res = await client.get("/api/v1/chatbot/sessions", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) > 0

    # Get messages
    res = await client.get(f"/api/v1/chatbot/sessions/{session_id}/messages", headers=auth_headers)
    assert res.status_code == 200


# ============================================================
# Notifications
# ============================================================
@pytest.mark.anyio
async def test_get_notifications(client, auth_headers):
    res = await client.get("/api/v1/notifications", headers=auth_headers)
    assert res.status_code == 200


@pytest.mark.anyio
async def test_mark_all_read(client, auth_headers):
    res = await client.post("/api/v1/notifications/read-all", headers=auth_headers)
    assert res.status_code == 200


# ============================================================
# Analytics
# ============================================================
@pytest.mark.anyio
async def test_analytics_dashboard(client, auth_headers):
    res = await client.get("/api/v1/analytics/dashboard", headers=auth_headers)
    assert res.status_code == 200


# ============================================================
# Rate Limiting (basic check)
# ============================================================
@pytest.mark.anyio
async def test_rate_limit_headers(client):
    res = await client.get("/api/v1/health")
    assert res.status_code == 200
    # Process time header should be present
    assert "X-Process-Time" in res.headers
