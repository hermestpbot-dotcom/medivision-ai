import json, subprocess, os

RENDER_KEY = os.environ.get("RENDER_KEY", "")
OWNER_ID = "tea-d8m61rb7uimc73d1vigg"

# Step 1: Create the web service
payload = {
    "ownerId": OWNER_ID,
    "type": "web_service",
    "name": "medivision-backend",
    "repo": "https://github.com/hermestpbot-dotcom/medivision-ai",
    "branch": "main",
    "rootDir": "backend",
    "runtime": "python3",
    "buildCommand": "pip install -r requirements.txt",
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "plan": "free",
    "serviceDetails": {
        "env": "python",
        "region": "oregon",
        "plan": "free",
        "branch": "main",
        "rootDir": "backend",
        "buildCommand": "pip install -r requirements.txt",
        "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
        "healthCheckPath": "/api/v1/health",
        "envVars": [
            {"key": "CORS_ORIGINS", "value": "*"},
            {"key": "DEBUG", "value": "false"},
            {"key": "SECRET_KEY", "value": "medivision_secret_key_2026_production"}
        ]
    }
}

env = os.environ.copy()
env["RENDER_API_KEY"] = RENDER_KEY

result = subprocess.run(
    ["curl", "-s", "-X", "POST",
     "https://api.render.com/v1/services",
     "-H", "Authorization: Bearer " + RENDER_KEY,
     "-H", "Content-Type: application/json",
     "-d", json.dumps(payload)],
    capture_output=True, text=True, timeout=60,
    env=env
)
print("CREATE SERVICE:")
print(result.stdout[:2000])
if result.stderr:
    print("STDERR:", result.stderr[:500])

# Parse the service ID from response
try:
    data = json.loads(result.stdout)
    if "id" in data:
        service_id = data["id"]
        print(f"\nService ID: {service_id}")
        print(f"Service URL: https://medivision-backend.onrender.com")
    elif "service" in data and "id" in data["service"]:
        service_id = data["service"]["id"]
        print(f"\nService ID: {service_id}")
    else:
        print(f"\nFull response: {json.dumps(data, indent=2)[:1000]}")
except:
    print(f"Could not parse response")
