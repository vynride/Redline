"""Realtime drill WebSocket — STT -> engine -> TTS, turn by turn.

Protocol (one connection per drill session):
  client -> server : binary frames of raw PCM audio; JSON {"type":"end_turn"};
                     JSON {"type":"end_session"}
  server -> client : {"type":"transcript", role, text, emotion?}; {"type":"state", state};
                     binary TTS audio frames; {"type":"turn_complete", index};
                     {"type":"session_complete"}; {"type":"error", detail}

Auth is via a ``?token=`` query parameter (the browser cannot set Authorization
headers on a WebSocket); the JWT is resolved with the same helper the REST API uses.
"""
from __future__ import annotations

import json

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.deps import resolve_user_from_token
from app.core.config import settings
from app.core.logging import get_logger
from app.db import SessionLocal
from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker
from app.models.base import utcnow
from app.schemas.common import Emotion
from app.schemas.session import SessionState
from app.schemas.ws import (
    ErrorMsg,
    SessionComplete,
    StateMsg,
    TranscriptMsg,
    TurnComplete,
    dump,
)
from app.services import engine as engine_service
from app.services.debrief import get_or_create_debrief
from app.services.llm import get_llm_client
from app.services.stt import get_stt_service
from app.services.tts import get_tts_service

log = get_logger("redline.ws")

router = APIRouter()


async def _emit_complete(websocket: WebSocket, db, session: DrillSession, llm) -> None:
    """Generate the debrief (if the drill is gradable) and tell the client we're done."""
    ready = False
    if any(t.speaker == Speaker.user for t in session.turns):
        try:
            await get_or_create_debrief(db, session, llm)
            ready = True
        except Exception:  # noqa: BLE001 — a failed debrief should not break the close
            log.exception("debrief generation failed for session %s", session.id)
    await websocket.send_json(dump(SessionComplete(debrief_ready=ready)))


def _state(session: DrillSession) -> SessionState:
    return SessionState(
        severity=session.severity,
        severity_start=session.severity_start,
        confidence=session.confidence,
        objectives_met=list(session.objectives_met or []),
        escalation_timeline=list(session.escalation_timeline or []),
        status=session.status,
    )


@router.websocket("/ws/session/{session_id}")
async def drill_ws(websocket: WebSocket, session_id: str) -> None:
    await websocket.accept()
    db = SessionLocal()
    try:
        token = websocket.query_params.get("token")
        user = resolve_user_from_token(token, db) if token else None
        if user is None:
            await websocket.send_json(dump(ErrorMsg(detail="Not authenticated", code="unauthorized")))
            await websocket.close(code=4401)
            return

        session = db.get(DrillSession, session_id)
        if session is None or session.user_id != user.id:
            await websocket.send_json(dump(ErrorMsg(detail="Session not found", code="not_found")))
            await websocket.close(code=4404)
            return

        try:
            stt_service = get_stt_service()
            tts_service = get_tts_service()
            llm = get_llm_client()
        except RuntimeError as exc:
            await websocket.send_json(dump(ErrorMsg(detail=str(exc), code="not_configured")))
            await websocket.close(code=4500)
            return

        # Send the current state up front so the client can render the HUD on connect.
        await websocket.send_json(dump(StateMsg(state=_state(session))))

        # On a fresh session (no turns yet), generate and stream the persona's opening line.
        if not session.turns:
            opening_output = await engine_service.opening(db, session, llm)
            await websocket.send_json(
                dump(TranscriptMsg(role="persona", text=opening_output.utterance, emotion=opening_output.emotion))
            )
            await websocket.send_json(dump(StateMsg(state=_state(session))))
            async for chunk in tts_service.synthesize(
                opening_output.utterance, voice_id=_voice_id(session), emotion=opening_output.emotion
            ):
                await websocket.send_bytes(chunk)
            await websocket.send_json(dump(TurnComplete(index=0)))

        stream = None
        while True:
            message = await websocket.receive()
            if message.get("type") == "websocket.disconnect":
                break

            audio = message.get("bytes")
            if audio is not None:
                if stream is None:
                    stream = stt_service.stream()
                stream.write(audio)
                continue

            text = message.get("text")
            if text is None:
                continue

            try:
                control = json.loads(text)
            except json.JSONDecodeError:
                continue
            msg_type = control.get("type")

            if msg_type == "end_turn":
                transcript = (await stream.finish()).strip() if stream is not None else ""
                stream = None
                if not transcript:
                    await websocket.send_json(dump(ErrorMsg(detail="No speech detected", code="empty_turn")))
                    continue
                await websocket.send_json(dump(TranscriptMsg(role="user", text=transcript)))

                if session.status != SessionStatus.active:
                    await websocket.send_json(dump(ErrorMsg(detail="Drill already ended", code="ended")))
                    continue

                output = await engine_service.step(db, session, transcript, llm)
                await websocket.send_json(
                    dump(TranscriptMsg(role="persona", text=output.utterance, emotion=output.emotion))
                )
                await websocket.send_json(dump(StateMsg(state=_state(session))))

                async for chunk in tts_service.synthesize(
                    output.utterance, voice_id=_voice_id(session), emotion=output.emotion
                ):
                    await websocket.send_bytes(chunk)

                persona_index = max((t.index for t in session.turns), default=0)
                await websocket.send_json(dump(TurnComplete(index=persona_index)))

                if session.status != SessionStatus.active:
                    await _emit_complete(websocket, db, session, llm)
                    break

            elif msg_type == "end_session":
                if session.status == SessionStatus.active:
                    session.status = SessionStatus.abandoned
                    session.ended_at = utcnow()
                    db.commit()
                await _emit_complete(websocket, db, session, llm)
                break

    except WebSocketDisconnect:
        log.info("ws disconnected for session %s", session_id)
    except Exception as exc:  # noqa: BLE001 — report and close cleanly
        log.exception("ws error for session %s", session_id)
        try:
            await websocket.send_json(dump(ErrorMsg(detail=str(exc), code="internal")))
        except Exception:
            pass
    finally:
        db.close()


def _voice_id(session: DrillSession) -> str:
    """Resolve the persona voice for the session's scenario (fallback to a default)."""
    from app.services import scenarios as catalog

    scenario = catalog.get_scenario(session.scenario_id)
    return scenario.persona.voice_id if scenario else settings.sarvam_tts_default_speaker
