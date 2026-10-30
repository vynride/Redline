"""SarvamLLM retry/error handling — distinguishes truncated output from empty content."""
from __future__ import annotations

from types import SimpleNamespace

import pytest
from pydantic import BaseModel

from app.services.llm import _MAX_GENERATE_ATTEMPTS, SarvamLLM


class _Reply(BaseModel):
    utterance: str


def _completion(content: str | None, finish_reason: str) -> SimpleNamespace:
    message = SimpleNamespace(content=content)
    return SimpleNamespace(choices=[SimpleNamespace(message=message, finish_reason=finish_reason)])


class _FakeCompletions:
    def __init__(self, responses: list[SimpleNamespace]) -> None:
        self._responses = list(responses)
        self.calls = 0

    async def create(self, **_kwargs):
        self.calls += 1
        return self._responses.pop(0)


def _llm(responses: list[SimpleNamespace]) -> tuple[SarvamLLM, _FakeCompletions]:
    completions = _FakeCompletions(responses)
    llm = SarvamLLM.__new__(SarvamLLM)  # skip __init__: no API key or network needed
    llm._client = SimpleNamespace(chat=SimpleNamespace(completions=completions))
    llm._model = "test-model"
    return llm, completions


async def _generate(llm: SarvamLLM) -> _Reply:
    return await llm.generate(system="s", messages=[{"role": "user", "content": "hi"}], response_schema=_Reply)


async def test_retries_then_returns_valid_reply():
    llm, completions = _llm([_completion(None, "stop"), _completion('{"utterance": "ok"}', "stop")])
    assert (await _generate(llm)).utterance == "ok"
    assert completions.calls == 2


async def test_truncation_reports_token_budget():
    llm, _ = _llm([_completion('{"utter', "length")] * _MAX_GENERATE_ATTEMPTS)
    with pytest.raises(RuntimeError, match="output-token budget"):
        await _generate(llm)


async def test_empty_content_is_not_reported_as_token_budget():
    llm, _ = _llm([_completion(None, "stop")] * _MAX_GENERATE_ATTEMPTS)
    with pytest.raises(RuntimeError) as exc:
        await _generate(llm)
    message = str(exc.value)
    assert "empty" in message
    assert "test-model" in message
    assert "output-token budget" not in message
