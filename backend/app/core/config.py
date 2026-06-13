"""Application configuration, loaded from environment / .env.

Every external dependency (Sarvam chat, Saaras STT, Bulbul TTS) is configured here so
the rest of the app never reads ``os.environ`` directly. Sarvam exposes all three behind
a single subscription key. Secrets are supplied via a ``.env`` file (see ``.env.example``)
and never committed.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # --- App ---
    app_name: str = "Redline"
    environment: str = Field(default="development")
    debug: bool = Field(default=True)

    # Comma-separated list of allowed CORS origins.
    cors_origins: str = Field(default="http://localhost:3000")

    # --- Database ---
    database_url: str = Field(default="sqlite:///./redline.db")

    # --- Auth ---
    jwt_secret: str = Field(default="dev-insecure-change-me")
    jwt_algorithm: str = Field(default="HS256")
    access_token_expire_minutes: int = Field(default=60 * 24)

    # --- Sarvam (one key for chat, STT, and TTS) ---
    sarvam_api_key: str = Field(default="")

    # Chat — Sarvam's OpenAI-compatible endpoint (structured JSON output).
    sarvam_base_url: str = Field(default="https://api.sarvam.ai/v1")
    sarvam_chat_model: str = Field(default="sarvam-30b")
    # Output-token ceiling per completion. sarvam-30b is a reasoning model whose
    # "thinking" shares this budget, so it must fit reasoning + the JSON answer.
    # 4096 is the starter-tier maximum; raise this after upgrading the Sarvam plan.
    sarvam_max_tokens: int = Field(default=4096)

    # STT — Saaras streaming over WebSocket.
    sarvam_stt_ws_url: str = Field(default="wss://api.sarvam.ai/speech-to-text-translate/ws")
    sarvam_stt_model: str = Field(default="saaras:v3")
    sarvam_stt_language: str = Field(default="en-IN")

    # TTS — Bulbul streaming over WebSocket.
    sarvam_tts_ws_url: str = Field(default="wss://api.sarvam.ai/text-to-speech/ws")
    sarvam_tts_model: str = Field(default="bulbul:v3")
    sarvam_tts_language: str = Field(default="en-IN")
    sarvam_tts_default_speaker: str = Field(default="aditya")
    sarvam_tts_sample_rate: int = Field(default=24000)

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
