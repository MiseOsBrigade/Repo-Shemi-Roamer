# LinkForge API

FastAPI control plane for capture jobs. It validates requests, stores job state
in SQLite, executes LinkForge Core in a bounded subprocess, and serves only
known packet artifacts.

```bash
python -m pip install -e '.[dev]'
export LINKFORGE_API_KEY='replace-me'
uvicorn linkforge_api.app:app --host 127.0.0.1 --port 8787
```

POST `/v1/captures` with `Authorization: Bearer <key>` and
`{"source":"https://example.com"}`.
