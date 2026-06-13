"""Text-to-speech — Bulbul v3 streaming over WebSocket, with a REST fallback.

The persona's utterance is synthesised to raw PCM (24 kHz, mono, 16-bit) and streamed
back to the browser chunk by chunk. The streaming path uses Sarvam's Bulbul WebSocket
(``type: config`` → ``type: text`` → ``type: flush``); if the socket fails we degrade to
the non-streaming ``/text-to-speech`` endpoint. Emotion is mapped to a speaking ``pace``
(and a little sampling ``temperature``) here so callers stay emotion-oriented.
"""
from __future__ import annotations

import base64
import json
from collections.abc import AsyncIterator
from functools import lru_cache
from typing import Protocol

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.common import Emotion

log = get_logger("redline.tts")

SARVAM_TTS_REST_URL = "https://api.sarvam.ai/text-to-speech"

# Desired speaking pace per emotion (Bulbul accepts ~0.5–2.0; 1.0 is the default cadence).
# A stressed stakeholder talks a touch faster; a calm one slows down.
_EMOTION_PACE: dict[Emotion, float] = {
    Emotion.neutral: 1.05,
    Emotion.calm: 0.95,
    Emotion.confused: 1.0,
    Emotion.frustrated: 1.12,
    Emotion.angry: 1.18,
    Emotion.urgent: 1.18,
}
_DEFAULT_PACE = 1.05
_TEMPERATURE = 0.6


def pace_for(emotion: Emotion) -> float:
    """Map emotion → Bulbul speaking pace."""
    return _EMOTION_PACE.get(emotion, _DEFAULT_PACE)


def _strip_wav_header(audio: bytes) -> bytes:
    """Drop a RIFF/WAV header if the codec returned a container instead of raw PCM."""
    return audio[44:] if audio[:4] == b"RIFF" else audio


class TTSService(Protocol):
    def synthesize(self, text: str, *, voice_id: str, emotion: Emotion) -> AsyncIterator[bytes]:
        """Yield raw PCM (24k mono 16-bit) chunks for the given text."""
        ...


class BulbulTTSService:
    """Real adapter for Sarvam Bulbul v3."""

    def __init__(self) -> None:
        if not settings.sarvam_api_key:
            raise RuntimeError("Sarvam is not configured (set SARVAM_API_KEY).")

    async def synthesize(self, text: str, *, voice_id: str, emotion: Emotion) -> AsyncIterator[bytes]:
        pace = pace_for(emotion)
        try:
            async for chunk in self._stream(text, voice_id, pace):
                yield chunk
        except Exception as exc:  # noqa: BLE001 — any socket failure degrades to REST
            log.warning("Bulbul streaming failed (%s); falling back to /text-to-speech", exc)
            async for chunk in self._generate(text, voice_id, pace):
                yield chunk

    async def _stream(self, text: str, speaker: str, pace: float) -> AsyncIterator[bytes]:
        import websockets

        url = f"{settings.sarvam_tts_ws_url}?model={settings.sarvam_tts_model}"
        headers = {"api-subscription-key": settings.sarvam_api_key}
        config = {
            "type": "config",
            "data": {
                "model": settings.sarvam_tts_model,
                "target_language_code": settings.sarvam_tts_language,
                "speaker": speaker,
                "pace": pace,
                "temperature": _TEMPERATURE,
                "speech_sample_rate": str(settings.sarvam_tts_sample_rate),
                "output_audio_codec": "pcm",
            },
        }
        async with websockets.connect(url, additional_headers=headers, max_size=None) as ws:
            await ws.send(json.dumps(config))
            await ws.send(json.dumps({"type": "text", "data": {"text": text}}))
            await ws.send(json.dumps({"type": "flush"}))
            first = True
            async for raw in ws:
                msg = json.loads(raw)
                if msg.get("type") == "audio":
                    encoded = (msg.get("data") or {}).get("audio")
                    if encoded:
                        audio = base64.b64decode(encoded)
                        if first:
                            audio = _strip_wav_header(audio)
                        first = False
                        if audio:
                            yield audio
                elif msg.get("type") in ("flush", "complete", "end"):
                    break

    async def _generate(self, text: str, speaker: str, pace: float) -> AsyncIterator[bytes]:
        import httpx

        payload = {
            "text": text,
            "target_language_code": settings.sarvam_tts_language,
            "model": settings.sarvam_tts_model,
            "speaker": speaker,
            "pace": pace,
            "speech_sample_rate": str(settings.sarvam_tts_sample_rate),
            "output_audio_codec": "linear16",
        }
        headers = {"api-subscription-key": settings.sarvam_api_key, "Content-Type": "application/json"}
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(SARVAM_TTS_REST_URL, json=payload, headers=headers)
            resp.raise_for_status()
            for encoded in resp.json().get("audios", []):
                if encoded:
                    yield _strip_wav_header(base64.b64decode(encoded))


@lru_cache(maxsize=1)
def get_tts_service() -> TTSService:
    return BulbulTTSService()
