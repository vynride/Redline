# Redline backend

FastAPI service: REST API, realtime voice WebSocket, scenario engine, and coaching.

## Local dev

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # fill in keys
uvicorn app.main:app --reload
```

- API docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Layout

```
app/
├── main.py        # app factory, CORS, lifespan, router mounting
├── core/          # config, logging, security
├── api/           # auth, scenarios, sessions, realtime ws
├── services/      # llm (Sarvam), stt (Saaras), tts (Bulbul), engine, debrief
├── models/        # SQLAlchemy models
├── schemas/       # pydantic request/response models
└── db.py          # engine + session
data/scenarios/    # authored scenario definitions (JSON)
tests/             # pytest suite
```
