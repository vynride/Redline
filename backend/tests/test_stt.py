"""STT segment draining — a paused turn must keep every segment, not just the first."""
from __future__ import annotations

import asyncio
import json

import pytest

import app.services.stt as stt


class FakeWS:
    """Minimal stand-in for the Saaras websocket: hand back queued messages, then idle."""

    def __init__(self, messages: list[str]) -> None:
        self._messages = list(messages)

    async def recv(self):
        if self._messages:
            return self._messages.pop(0)
        await asyncio.sleep(10)  # nothing left → recv blocks so wait_for times out (idle gap)
        raise AssertionError("unreachable")  # cancelled by wait_for before this


@pytest.fixture(autouse=True)
def _fast_timeouts(monkeypatch):
    # Keep the idle-gap logic but make the test instant.
    monkeypatch.setattr(stt, "STT_FIRST_SEGMENT_TIMEOUT", 0.05)
    monkeypatch.setattr(stt, "STT_SEGMENT_GAP_TIMEOUT", 0.05)


def _data(transcript: str) -> str:
    return json.dumps({"type": "data", "data": {"transcript": transcript}})


def test_drain_keeps_all_segments_across_a_pause():
    ws = FakeWS([_data("The database is down right now."),
                 _data("It started after the afternoon deploy.")])
    segments = asyncio.run(stt._drain_segments(ws))
    assert segments == ["The database is down right now.", "It started after the afternoon deploy."]


def test_drain_ignores_non_data_and_empty_messages():
    ws = FakeWS([json.dumps({"type": "metadata"}), _data(""), _data("real words")])
    segments = asyncio.run(stt._drain_segments(ws))
    assert segments == ["real words"]


def test_drain_returns_empty_when_no_segments():
    ws = FakeWS([])
    assert asyncio.run(stt._drain_segments(ws)) == []
