"""Drill session routes — create a run, list history, read detail + transcript."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db import get_db
from app.models.session import DrillSession, SessionStatus
from app.models.turn import Speaker, Turn
from app.models.user import User
from app.schemas.debrief import DebriefOut
from app.schemas.session import SessionCreate, SessionDetail, SessionListItem, SessionOut
from app.services import scenarios as catalog
from app.services.debrief import get_or_create_debrief
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
    scenario = catalog.get_scenario(payload.scenario_id)
    if scenario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scenario not found.")
    if payload.role not in scenario.roles:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="This role is not available for the selected scenario.")
    if payload.difficulty not in scenario.difficulties:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                            detail="This difficulty is not available for the selected scenario.")

    drill = DrillSession(
        user_id=user.id,
        scenario_id=scenario.id,
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
