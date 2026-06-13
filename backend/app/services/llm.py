"""LLM access — an injectable structured-output interface and a Sarvam adapter.

The rest of the app depends only on the ``LLMClient`` protocol, never on the
Sarvam SDK directly. This keeps the scenario engine and debrief service testable
with a fake client (no network, no keys) while the real adapter talks to Sarvam's
OpenAI-compatible chat endpoint with a strict JSON-schema response format.
"""
from __future__ import annotations

import json
from functools import lru_cache
from typing import Protocol, TypedDict, TypeVar

from pydantic import BaseModel

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("redline.llm")

# sarvam-30b is a reasoning model: it spends completion tokens "thinking" before it emits
# the structured JSON, and that reasoning shares the output budget. Too small a budget
# (the provider default is 2048) gets swallowed by reasoning on larger outputs like the
# debrief, leaving empty/truncated content — so the budget is configurable via
# ``settings.sarvam_max_tokens`` (4096, the starter-tier ceiling, by default).

T = TypeVar("T", bound=BaseModel)


class ChatMessage(TypedDict):
    role: str  # "user" | "assistant"
    content: str


class LLMClient(Protocol):
    """Returns an instance of ``response_schema`` from a structured completion."""

    async def generate(self, *, system: str, messages: list[ChatMessage], response_schema: type[T]) -> T:
        ...


class SarvamLLM:
    """Real adapter backed by Sarvam's OpenAI-compatible structured outputs."""

    def __init__(self) -> None:
        from openai import AsyncOpenAI

        if not settings.sarvam_api_key:
            raise RuntimeError("Sarvam is not configured (set SARVAM_API_KEY).")
        # Sarvam speaks the OpenAI wire protocol; only the base URL and key differ.
        self._client = AsyncOpenAI(
            base_url=settings.sarvam_base_url,
            api_key=settings.sarvam_api_key,
        )
        self._model = settings.sarvam_chat_model

    async def generate(self, *, system: str, messages: list[ChatMessage], response_schema: type[T]) -> T:
        completion = await self._client.chat.completions.create(
            model=self._model,
            messages=[{"role": "system", "content": system}, *messages],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": response_schema.__name__,
                    "schema": response_schema.model_json_schema(),
                },
            },
            temperature=0.8,
            max_tokens=settings.sarvam_max_tokens,
        )
        choice = completion.choices[0]
        if choice.finish_reason == "length":
            raise RuntimeError(
                "Sarvam hit the output-token limit before completing the response "
                f"(max_tokens={settings.sarvam_max_tokens}). Raise SARVAM_MAX_TOKENS "
                "(requires a higher Sarvam plan) or shorten the input."
            )
        content = choice.message.content
        if not content:
            raise RuntimeError("Sarvam returned an empty structured response.")
        try:
            return response_schema.model_validate_json(content)
        except ValueError:  # tolerate the odd code-fenced payload
            return response_schema.model_validate(json.loads(_strip_fence(content)))


def _strip_fence(text: str) -> str:
    """Drop a leading/trailing Markdown code fence if the model wrapped its JSON."""
    t = text.strip()
    if t.startswith("```"):
        t = t.split("\n", 1)[-1] if "\n" in t else t
        if t.endswith("```"):
            t = t[: -len("```")]
    return t.strip()


@lru_cache(maxsize=1)
def get_llm_client() -> LLMClient:
    """FastAPI dependency — the process-wide Sarvam client.

    Overridden with a fake in tests via ``app.dependency_overrides``.
    """
    return SarvamLLM()
