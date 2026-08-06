import importlib,os
from pathlib import Path
from fastapi.testclient import TestClient

def test_health_and_auth(tmp_path,monkeypatch):
 monkeypatch.setenv("LINKFORGE_DATA_DIR",str(tmp_path)); monkeypatch.setenv("LINKFORGE_API_KEY","test-key")
 import linkforge_api.app as module; importlib.reload(module); client=TestClient(module.app)
 assert client.get("/health").status_code==200
 assert client.post("/v1/captures",json={"source":"x"}).status_code==401
