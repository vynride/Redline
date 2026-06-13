# Redline — Architecture

> AI voice crisis-drill simulator. Voice-first training for on-call engineers, support
> staff, incident commanders, SREs, and ops leads. Live AI voice roleplay → branching
> scenarios → post-drill coaching.

## 1. Scope

**Production-leaning foundation.** Auth, persistent storage, multi-user, multiple
scenarios, full debrief analytics, and deployment config — not a throwaway demo.

## 2. Stack & decisions

| Concern            | Choice                                  | Notes |
|--------------------|-----------------------------------------|-------|
| LLM                | **Sarvam** (`sarvam-30b`)               | OpenAI-compatible chat completions (`https://api.sarvam.ai/v1`) with `json_schema` structured output for persona voicing + state. |
| TTS                | **Bulbul v3**                           | Realtime streaming TTS over WebSocket (`wss://api.sarvam.ai/text-to-speech/ws`, `model=bulbul:v3`, PCM@24k). Emotion → speaking pace. Behind a `tts` adapter with a non-streaming `/text-to-speech` fallback. |
| STT                | **Saaras v3**                           | Streaming speech-to-text over WebSocket (`wss://api.sarvam.ai/speech-to-text-translate/ws`); one WAV-wrapped utterance per turn, finalised with a flush. |
| Realtime transport | **WebSocket, turn-based**               | Browser records a full user turn → WS → backend STT→LLM→TTS → streams audio back. |
| Scenario engine    | **LLM-driven via system prompts**       | Each scenario is a structured system prompt (persona, stakes, hidden facts, severity rules). LLM improvises branching and emits state via structured output. |
| Backend            | **FastAPI**                             | Async, WebSocket-native, SQLAlchemy + Alembic. |
| DB                 | **PostgreSQL** (SQLite for local dev)   | Users, sessions, transcripts, debriefs. |
| Auth               | **JWT** (email/password)                | `python-jose` + `passlib[bcrypt]`; httpOnly cookie or bearer. |
| Frontend           | **Next.js** (App Router) + Tailwind     | Design tokens from `DESIGN.md`. MediaRecorder + Web Audio for capture/playback. |

**Design system:** `DESIGN.md` (repo root) is the source of truth for all frontend
visuals — dark-only, deep violet-black canvas, lavender-gradient pill CTAs, Inter +
JetBrains Mono, "numbers are the hero." Tailwind theme mirrors its tokens exactly.

## 3. The voice loop (turn-based)

```
Browser                         FastAPI  /ws/session/{id}  (JWT-authed)
  │  record user turn (mic, MediaRecorder)
  │  ── audio chunks ──────────►  buffered PCM → Saaras STT (WS, per-turn)
  │  {type:"end_turn"} ────────►  final transcript
  │                               ──► ScenarioEngine.step(session, transcript)
  │                                     ├─ Sarvam chat (system prompt + history)
  │                                     │     → {utterance, emotion, state delta, eval}
  │                                     ├─ apply state (severity, confidence, escalation)
  │                                     ├─ persist turn
  │                                     └─ Bulbul v3 stream(utterance, emotion→pace)
  │  ◄── {type:"transcript"} ───  persona text
  │  ◄── {type:"state"} ────────  severity / confidence / escalation / objectives
  │  ◄── binary audio chunks ───  Bulbul v3 PCM
  │  ◄── {type:"turn_complete"}
  │  play audio, update meters
  ▼  (repeat until end → {type:"session_complete"} → debrief generated)
```

## 4. Scenario model (LLM-driven)

A scenario is authored data that compiles into a system prompt:

```jsonc
{
  "id": "prod-outage-payments",
  "title": "Payment API Outage",
  "archetype": "production_outage",      // outage | payment_failure | security_alert |
                                         // support_escalation | broken_release | latency_spike
  "summary": "Checkout is down; revenue bleeding.",
  "roles": ["on_call_engineer", "incident_commander", "support_lead", "ops_responder", "customer_support_agent"],
  "difficulties": ["warmup", "production_like", "redline"],
  "persona": { "name": "...", "role": "angry_customer", "voice_id": "...", "base_emotion": "frustrated" },
  "stakes": "...",
  "hidden_facts": ["root cause = expired cert", "started 12 min ago"],
  "objectives": ["acknowledge + reassure", "gather impact scope", "escalate correctly", "give clear status"],
  "severity": { "start": 7, "max": 10, "win_below": 3, "lose_at": 10 }
}
```

Per turn the LLM gets the compiled system prompt (persona + stakes + hidden facts +
objectives + severity rules + difficulty modifiers) plus the running transcript, and
returns **structured JSON** (enforced via response_format / tool schema):

```jsonc
{
  "utterance": "what the persona says next",
  "emotion": "angry|calm|confused|urgent|neutral",
  "severity_delta": -1,
  "confidence_delta": +1,
  "objectives_met": ["acknowledge + reassure"],
  "escalation_event": null,            // or a timeline entry
  "turn_eval": { "clarity": 0-5, "deescalation": 0-5, "info_gathering": 0-5, "note": "..." },
  "session_should_end": false
}
```

Difficulty maps to prompt modifiers (patience, ambiguity, time pressure). The engine
applies deltas, clamps severity, appends escalation events, and ends the session on
win/lose/length conditions.

## 5. Debrief (coaching layer)

At session end the full transcript + accumulated per-turn evals go to Sarvam for a
structured debrief: what was handled well, where control was lost (quoted moments),
missed information, escalation correctness, status-communication clarity, and
"a stronger response would have sounded like…" rewrites. Persisted and rendered with a
transcript replay, highlighted moments, and the severity/escalation timeline.

## 6. API surface

REST (JWT):
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET  /api/scenarios` — list (id, title, archetype, roles, difficulties)
- `GET  /api/scenarios/{id}`
- `POST /api/sessions` — `{scenario_id, role, difficulty}` → `{session_id}`
- `GET  /api/sessions` — current user's session history
- `GET  /api/sessions/{id}` — state + transcript (replay)
- `GET  /api/sessions/{id}/debrief`

WebSocket `/ws/session/{id}?token=…`:
- client → server: binary audio chunks; `{type:"end_turn"}`; `{type:"end_session"}`
- server → client: `{type:"transcript", role, text}`; `{type:"state", …}`; binary TTS
  audio; `{type:"turn_complete"}`; `{type:"session_complete"}`; `{type:"error"}`

## 7. Layout

```
redline/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, routers, ws mount, lifespan
│   │   ├── api/               # auth.py, scenarios.py, sessions.py, ws.py, deps.py
│   │   ├── core/              # config (pydantic-settings), security (JWT), logging
│   │   ├── services/          # llm.py, stt.py, tts.py, engine.py, debrief.py
│   │   ├── models/            # SQLAlchemy: user, session, turn, debrief
│   │   ├── schemas/           # pydantic: auth, scenario, session, ws, debrief
│   │   └── db.py              # engine, session, Base
│   ├── data/scenarios/*.json
│   ├── alembic/               # migrations
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/                   # (marketing) landing, (auth) login/register,
│   │   │                      # dashboard, drill/[sessionId], debrief/[sessionId]
│   ├── components/            # ui/ (Button, Card, Pill, StatBlock…) + feature comps
│   ├── lib/                   # api client, ws client, audio capture/playback, auth
│   ├── public/
│   ├── tailwind.config.ts     # tokens mirrored from DESIGN.md
│   └── package.json
├── shared/types/              # TS mirrors of ws + scenario + debrief contracts
├── docs/architecture.md
├── DESIGN.md                  # frontend design source of truth
├── docker-compose.yml         # postgres + backend + frontend
└── README.md
```

## 8. Commit timeline (deliverable)

The git history itself is a deliverable: incremental commits backdated across
**3 May 2026 → 27 May 2026**, each showing real progress. Dates set via
`GIT_AUTHOR_DATE` / `GIT_COMMITTER_DATE`. See plan for the stage→date mapping.

## 9. Risks / verify-at-build

- **Bulbul WS contract** — exact `config`/`text`/`flush` framing, base64 audio, header strip.
  Isolated in `tts.py`; non-streaming `/text-to-speech` fallback keeps audio
  working if streaming details slip.
- **STT endpointing** — turn-based capture + explicit "end turn" sidesteps barge-in.
- **Latency budget** — stream LLM output; begin TTS on the first sentence.
- **Secrets** — the Sarvam key (one for chat/STT/TTS) via env; never committed.
