"""Drill session routes — create a run, list history, read detail + transcript."""
from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

from app.api.deps import get_current_user
from app.core.ratelimit import pdf_export_limit
from app.db import get_db
from app.models.generated_scenario import GeneratedScenario
from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker, Turn
from app.models.user import User
from app.schemas.debrief import DebriefOut
from app.schemas.scenario import Scenario
from app.schemas.session import SessionCreate, SessionDetail, SessionListItem, SessionOut
from app.services import scenarios as catalog
from app.services.debrief import get_or_create_debrief
from app.services.debrief_pdf import pdf_filename, render_debrief_pdf
from app.services.llm import LLMClient, get_llm_client

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def load_owned_session(db: Session, session_id: str, user: User) -> DrillSession:
    """Fetch a session owned by ``user`` or raise 404 (reused across routes)."""
    drill = db.get(DrillSession, session_id)
    if drill is None or drill.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found.")
    return drill


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DrillSession:
    # Resolve from the static catalog, then fall back to a scenario this user
    # generated. Generated scenarios are snapshotted onto the session so the live
    # drill is self-contained (see services.scenarios.scenario_for_session).
    scenario = catalog.get_scenario(payload.scenario_id)
    snapshot: dict | None = None
    if scenario is None:
        generated = db.get(GeneratedScenario, payload.scenario_id)
        if generated is None or generated.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
        scenario = Scenario.model_validate(generated.scenario_json)
        snapshot = generated.scenario_json
    if payload.role not in scenario.roles:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="This role is not available for the selected scenario.")
    if payload.difficulty not in scenario.difficulties:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="This difficulty is not available for the selected scenario.")

    drill = DrillSession(
        user_id=user.id,
        scenario_id=scenario.id,
        scenario_json=snapshot,
        role=payload.role.value,
        difficulty=payload.difficulty.value,
        severity=scenario.severity.start,
        severity_start=scenario.severity.start,
        confidence=50,
        objectives_met=[],
        escalation_timeline=[],
    )
    # Seed the persona's opening line as the first turn so replay and the live
    # session both start from the same transcript.
    drill.turns.append(
        Turn(
            index=0,
            speaker=Speaker.persona,
            text=scenario.opening_line,
            emotion=scenario.persona.base_emotion.value,
            severity_after=scenario.severity.start,
            confidence_after=50,
        )
    )
    db.add(drill)
    db.commit()
    db.refresh(drill)
    return drill


@router.get("", response_model=list[SessionListItem])
def list_sessions(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[DrillSession]:
    rows = db.scalars(
        select(DrillSession).where(DrillSession.user_id == user.id).order_by(DrillSession.created_at.desc())
    ).all()
    return list(rows)


@router.get("/{session_id}", response_model=SessionDetail)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> DrillSession:
    return load_owned_session(db, session_id, user)


@router.get("/{session_id}/scenario", response_model=Scenario)
def get_session_scenario(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Scenario:
    """Resolve the scenario a drill is running on.

    Unlike ``/api/scenarios/{id}`` (static catalog only), this honours the
    per-session snapshot, so generated drills resolve correctly.
    """
    drill = load_owned_session(db, session_id, user)
    scenario = catalog.scenario_for_session(drill)
    if scenario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
    return scenario


@router.get("/{session_id}/debrief", response_model=DebriefOut)
async def get_debrief(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
):
    drill = load_owned_session(db, session_id, user)
    if drill.status == SessionStatus.active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="The drill is still active; finish it before requesting a debrief.")
    return await get_or_create_debrief(db, drill, llm)


@router.get("/{session_id}/debrief.pdf", dependencies=[Depends(pdf_export_limit)])
async def export_debrief_pdf(
    session_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
) -> Response:
    """Render the debrief as a polished, self-contained PDF for offline reference."""
    drill = load_owned_session(db, session_id, user)
    if drill.status == SessionStatus.active:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT,
                            detail="The drill is still active; finish it before requesting a debrief.")
    # Reuse the same generate-or-fetch path so an unopened debrief still exports.
    debrief = await get_or_create_debrief(db, drill, llm)
    turns = db.scalars(select(Turn).where(Turn.session_id == drill.id).order_by(Turn.index)).all()
    scenario = catalog.scenario_for_session(drill)

    generated_at = datetime.now()
    # WeasyPrint is CPU-bound; render off the event loop so it doesn't stall other requests.
    pdf_bytes = await run_in_threadpool(
        render_debrief_pdf, drill, debrief, scenario, list(turns), generated_at=generated_at
    )
    filename = pdf_filename(drill, scenario, generated_at=generated_at)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
