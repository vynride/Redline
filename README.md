# Redline

> An AI voice crisis-drill simulator that trains technical and support teams for
> high-pressure incidents through realistic crisis drills — live AI voice roleplay,
> branching scenarios, and detailed post-drill coaching.

Redline drops you into a live incident — a production outage, a payment failure, a
security alert, a support escalation, a broken release, a latency spike — and an AI
plays the other side: an angry customer, a confused stakeholder, a teammate asking for
updates, a manager pushing for timelines, or an outage commander. You respond **by
voice**, in real time. Redline grades not just *what* you said but *how* you handled it —
clarity, de-escalation, information gathering, escalation, and status communication —
then hands you a debrief.

## Why

Most teams are bad at crisis communication not because they don't know the process, but
because they've never practiced it under pressure. Redline is the practice environment.

## Architecture at a glance

| Layer        | Choice |
|--------------|--------|
| LLM          | Sarvam |
| Text-to-speech | [Bulbul v3](https://sarvam.ai) (streaming) |
| Speech-to-text | Saaras v3 |
| Realtime     | Turn-based WebSocket (record turn → STT → LLM → TTS → stream back) |
| Backend      | FastAPI + PostgreSQL + SQLAlchemy/Alembic, JWT auth |
| Frontend     | Next.js (App Router) + Tailwind |

Three layers make it feel like a training product rather than a chatbot:

1. **Scenario engine** — creates the crisis, roles, stakes, and branching (LLM-driven via structured system prompts).
2. **Voice roleplay layer** — the AI acts as customer / teammate / manager / commander, naturally, by voice.
3. **Coaching layer** — grades the response and explains what strong incident behavior looks like.

See [`docs/architecture.md`](docs/architecture.md) for the full design, and
[`DESIGN.md`](DESIGN.md) for the frontend design system.

## Repo layout

```
redline/
├── backend/    # FastAPI service (API, realtime WS, services, models)
├── frontend/   # Next.js app (marketing + app shell)
├── shared/     # shared TypeScript contracts
└── docs/       # architecture & design docs
```

## Getting started

```bash
# 1. configure secrets
cp backend/.env.example backend/.env   # fill in the Sarvam API key

# 2. run everything
docker compose up --build
# frontend → http://localhost:3000   backend → http://localhost:8000/docs
```

Local dev without Docker is documented in [`backend/README`](backend) and
[`frontend/README`](frontend).
