"""Custom scenario generation — author a drill from a free-text prompt via the LLM."""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.logging import get_logger
from app.core.ratelimit import scenario_generation_limit
from app.db import get_db
from app.models.generated_scenario import GeneratedScenario
from app.models.user import User
from app.schemas.scenario import Scenario, ScenarioSummary
from app.services.llm import LLMClient, get_llm_client
from app.services.scenario_gen import generate_scenario

router = APIRouter(prefix="/api/generated-scenarios", tags=["generated-scenarios"])
log = get_logger("redline.generated_scenarios")


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=4, max_length=600)


@router.get("", response_model=list[ScenarioSummary])
def list_generated_scenarios(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[ScenarioSummary]:
    """List the custom scenarios this user has generated, newest first."""
    rows = db.scalars(
        select(GeneratedScenario)
        .where(GeneratedScenario.user_id == user.id)
        .order_by(GeneratedScenario.created_at.desc())
    ).all()
    return [ScenarioSummary.from_scenario(Scenario.model_validate(r.scenario_json)) for r in rows]


@router.post(
    "",
    response_model=Scenario,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(scenario_generation_limit)],
)
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
