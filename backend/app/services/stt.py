"""Speech-to-text — an injectable per-turn streaming interface and a Saaras adapter.

A drill turn is captured as a stream of raw PCM chunks (16-bit, mono, 16 kHz). The
WebSocket handler opens one ``STTStream`` per responder turn, writes audio as it
arrives, then awaits ``finish`` to get the final transcript. The rest of the app
depends only on the protocols here, so a fake stream can stand in for tests.

The real adapter buffers the turn's PCM and transcribes it over Sarvam's Saaras
streaming WebSocket — one WAV-wrapped utterance per turn, finalised with a flush.
"""
from __future__ import annotations

import asyncio
import base64
import io
import json
import wave
from functools import lru_cache
from typing import Protocol

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("redline.stt")

SAMPLE_RATE = 16000
BITS_PER_SAMPLE = 16
CHANNELS = 1

# Saaras emits one "data" message per detected utterance and segments on pauses, so a
# single turn can produce several. There is no end-of-stream marker and the socket stays
# open after the flush, so segments are drained until a short idle gap. FIRST waits out the
# server's processing latency before the first segment; GAP waits for any further segments
# (which arrive back-to-back once processing finishes) before declaring the turn complete.
STT_FIRST_SEGMENT_TIMEOUT = 15.0
STT_SEGMENT_GAP_TIMEOUT = 2.0


class STTStream(Protocol):
    """A single recognition session for one responder turn."""

    def write(self, chunk: bytes) -> None:
        """Push a chunk of raw PCM audio."""
        ...

    async def finish(self) -> str:
        """Close the stream and return the final transcript."""
        ...


class STTService(Protocol):
    def stream(self) -> STTStream:
        ...


def _pcm_to_wav(pcm: bytes) -> bytes:
    """Wrap raw 16-bit mono PCM in a WAV container (Saaras expects ``audio/wav``)."""
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wav:
        wav.setnchannels(CHANNELS)
        wav.setsampwidth(BITS_PER_SAMPLE // 8)
        wav.setframerate(SAMPLE_RATE)
        wav.writeframes(pcm)
    return buf.getvalue()


async def _drain_segments(ws) -> list[str]:
    """Collect every transcript segment Saaras returns for a flushed turn.

    Saaras sends one ``data`` message per utterance (it splits on pauses) and gives no
    end-of-stream signal, so read until the socket goes quiet: wait out processing latency
    for the first segment, then a short gap for any that follow. Without this, a turn with a
    mid-sentence pause loses everything after the first segment.
    """
    import websockets

    segments: list[str] = []
    timeout = STT_FIRST_SEGMENT_TIMEOUT
    while True:
        try:
            raw = await asyncio.wait_for(ws.recv(), timeout=timeout)
        except (asyncio.TimeoutError, websockets.ConnectionClosed):
            break  # idle gap or socket close — the turn is fully drained
        msg = json.loads(raw)
        if msg.get("type") == "data":
            transcript = (msg.get("data") or {}).get("transcript")
            if transcript:
                segments.append(transcript)
            timeout = STT_SEGMENT_GAP_TIMEOUT  # further segments arrive back-to-back
    return segments


class _SaarasSTTStream:
    """Buffers a turn's PCM and transcribes it over the Saaras streaming socket."""

    def __init__(self) -> None:
        self._buffer = bytearray()

    def write(self, chunk: bytes) -> None:
        self._buffer.extend(chunk)

    async def finish(self) -> str:
        if not self._buffer:
            return ""
        try:
            return await asyncio.wait_for(self._transcribe(), timeout=30.0)
        except Exception as exc:  # noqa: BLE001 — any socket/timeout failure degrades to empty
            log.warning("Saaras transcription failed (%s); returning empty transcript", exc)
            return ""

    async def _transcribe(self) -> str:
        import websockets

        url = f"{settings.sarvam_stt_ws_url}?model={settings.sarvam_stt_model}&language-code={settings.sarvam_stt_language}"
        headers = {"api-subscription-key": settings.sarvam_api_key}
        wav_b64 = base64.b64encode(_pcm_to_wav(bytes(self._buffer))).decode("ascii")

        async with websockets.connect(url, additional_headers=headers, max_size=None) as ws:
            await ws.send(json.dumps({
                "audio": {"data": wav_b64, "sample_rate": str(SAMPLE_RATE), "encoding": "audio/wav"}
            }))
            await ws.send(json.dumps({"type": "flush"}))
            segments = await _drain_segments(ws)
        return " ".join(segments).strip()


class SaarasSTTService:
    """Real adapter backed by Sarvam Saaras streaming speech-to-text."""

    def __init__(self) -> None:
        if not settings.sarvam_api_key:
            raise RuntimeError("Sarvam is not configured (set SARVAM_API_KEY).")

    def stream(self) -> STTStream:
        return _SaarasSTTStream()


@lru_cache(maxsize=1)
def get_stt_service() -> STTService:
    return SaarasSTTService()
