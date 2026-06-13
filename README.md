<p align="center">
  <img src="frontend/public/logo.svg" alt="Redline" width="88" height="88" />
</p>

<h1 align="center">Redline</h1>

<p align="center">
  <em>Crisis communication, practiced.</em>
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-8B5CF6?style=flat-square" />
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi&logoColor=white" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
  <img alt="Sarvam" src="https://img.shields.io/badge/Sarvam-sarvam--30b-FF6B35?style=flat-square" />
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
</p>

---

Redline drops you into a live incident — a production outage, a payment failure, a security breach, a broken release — and an AI plays the other side: an angry customer, a confused stakeholder, a teammate asking for updates, or a manager pushing for timelines. You respond **by voice**, in real time. Redline evaluates not just *what* you said but *how* you handled it: clarity, de-escalation, information gathering, escalation judgment, and status communication. Then it hands you a debrief.

## Why

Most teams are bad at crisis communication not because they don't know the process, but because they've never practiced it under pressure. Runbooks don't prepare you for a CTO asking "how long?" at 2 AM. Redline is the training environment.

## What it does

| Capability | Details |
|---|---|
| **Voice roleplay** | Speak into your mic; the AI responds in real time as a scripted persona (customer, manager, outage commander) |
| **Scenario engine** | Sarvam drives branching behavior via structured prompts — stakes, hidden facts, severity rules, escalation triggers |
| **Scenario library** | 20+ authored scenarios across production outages, payment failures, security incidents, support escalations, broken releases, and latency spikes |
| **Post-drill debrief** | Full transcript analysis with per-turn evals across five dimensions, scored 0–10, with rewrite suggestions |
| **Realtime state** | Severity meter, confidence meter, and escalation event timeline update live during the drill |
| **Auth** | Google and GitHub OAuth (JWT-backed) |
| **Speech pipeline** | Saaras v3 Speech-to-Text (streaming WebSocket, 16kHz PCM) → LLM → Bulbul v3 TTS (streaming WebSocket, 24kHz PCM) |

## Scenario categories

- **Production outages** — database, DNS, memory leak, queue backlog, SSO vendor
- **Payment incidents** — double charges, payout failures, fraud lockout, renewal declines
- **Security** — account takeover, dependency compromise, insider access, ransomware in CI
- **Broken releases** — config/auth regression, migration failure, mobile rollout
- **Latency** — cache stampede, search degradation
- **Support escalations** — billing confusion, compliance threats, VIP data loss

## Architecture

Three layers make Redline feel like a training product rather than a chatbot:

1. **Scenario engine** — Creates the crisis, roles, stakes, and branching behavior through LLM-driven structured system prompts. Each scenario defines the persona, hidden facts the AI knows but won't volunteer, objectives, and severity escalation rules.
2. **Voice roleplay layer** — Turn-based WebSocket loop: browser captures mic audio → sends binary PCM → backend runs Saaras STT → feeds transcript to Sarvam → streams response through Bulbul v3 TTS → plays back in browser. State deltas (severity, confidence, events) arrive on the same socket.
3. **Coaching layer** — After the drill, a second LLM pass scores the full transcript across five dimensions (clarity, de-escalation, information gathering, escalation judgment, status communication) and generates rewrite suggestions for weak turns.

```
Browser mic → Binary audio (WS) → Saaras STT
                                       ↓
                             Scenario engine (Sarvam)
                             + state delta (severity, events)
                                       ↓
                             Bulbul v3 TTS (streaming WS)
                                       ↓
                             Audio chunks → browser playback
```

## Tech stack

| Layer | Choice |
|---|---|
| **Frontend** | Next.js 15 (App Router) · React 19 · Tailwind CSS · Framer Motion · Lenis |
| **Backend** | FastAPI · SQLAlchemy 2 · Alembic · Pydantic |
| **Auth** | Google + GitHub OAuth · JWT (python-jose + passlib/bcrypt) |
| **LLM** | Sarvam (`sarvam-30b`, OpenAI-compatible, JSON-schema structured output) |
| **Speech-to-text** | Saaras v3 (streaming WebSocket recognition, 16kHz PCM) |
| **Text-to-speech** | Bulbul v3 (streaming WebSocket, 24kHz PCM) |
| **Database** | PostgreSQL 16 (SQLite for local dev) |
| **Infrastructure** | Docker Compose · nginx |

## Repo layout

```
redline/
├── backend/              # FastAPI service
│   ├── app/
│   │   ├── api/          # Route handlers (auth, scenarios, sessions, websocket)
│   │   ├── core/         # Config, logging, JWT helpers
│   │   ├── models/       # ORM models (User, DrillSession, Turn, Debrief)
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # Business logic (LLM, STT, TTS, engine, debrief)
│   ├── data/scenarios/   # Authored scenario definitions (JSON)
│   └── alembic/          # Database migrations
├── frontend/             # Next.js app (marketing + app shell)
├── shared/               # Shared TypeScript contracts
└── docs/                 # Architecture and design docs
```

## Getting started

### Prerequisites

- Docker and Docker Compose
- Sarvam API key (one key covers chat, STT, and TTS — https://dashboard.sarvam.ai)
- Google and/or GitHub OAuth app credentials

### Quickstart

```bash
git clone https://github.com/vynride/Redline.git
cd Redline

# Configure secrets
cp backend/.env.example backend/.env
# Edit backend/.env — fill in the Sarvam key and OAuth keys

# Run everything
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/docs |

### Local dev (without Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Environment variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (defaults to SQLite for local dev) |
| `JWT_SECRET` | Long random string for JWT signing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth app credentials |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth app credentials |
| `SARVAM_API_KEY` | Sarvam subscription key (chat + Saaras STT + Bulbul TTS) |
| `SARVAM_CHAT_MODEL` | Chat model id (default `sarvam-30b`) |
| `SARVAM_STT_MODEL` | Speech-to-text model id (default `saaras:v3`) |
| `SARVAM_TTS_MODEL` | Text-to-speech model id (default `bulbul:v3`) |
| `SARVAM_TTS_DEFAULT_SPEAKER` | Fallback Bulbul speaker (default `aditya`) |

See [`backend/.env.example`](backend/.env.example) for the full list with comments.

## Further reading

- [`docs/architecture.md`](docs/architecture.md) — Voice loop design, scenario model, debrief layer, stack decisions
- [`DESIGN.md`](DESIGN.md) — Frontend design system (dark canvas, violet accent, component tokens)
- [`backend/README.md`](backend/README.md) — Backend setup, migrations, and local dev guide
