"""Custom scenario generation — author a drill from a free-text prompt via the LLM."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.logging import get_logger
from app.db import get_db
from app.models.user import User
from app.schemas.scenario import Scenario
from app.services.llm import LLMClient, get_llm_client
from app.services.scenario_gen import generate_scenario

router = APIRouter(prefix="/api/generated-scenarios", tags=["generated-scenarios"])
log = get_logger("redline.generated_scenarios")


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=4, max_length=600)


@router.post("", response_model=Scenario, status_code=status.HTTP_201_CREATED)
async def create_generated_scenario(
    payload: GenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
    llm: LLMClient = Depends(get_llm_client),
) -> Scenario:
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Describe the scenario you want.")
    try:
        return await generate_scenario(db=db, user=user, prompt=prompt, llm=llm)
    except Exception:  # noqa: BLE001 — surface a clean message, log the cause
        log.exception("scenario generation failed for user %s", user.id)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Could not generate a scenario right now. Please try again.",
        )
