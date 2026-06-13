"""Redline FastAPI application entrypoint."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("redline")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("starting %s (env=%s)", settings.app_name, settings.environment)
    yield
    log.info("shutting down %s", settings.app_name)


def create_app() -> FastAPI:
    app = FastAPI(
        title=f"{settings.app_name} API",
        version=__version__,
        description="AI voice crisis-drill simulator.",
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok", "service": settings.app_name, "version": __version__}

    # Routers are mounted in later stages (auth, scenarios, sessions, ws).

    return app


app = create_app()
