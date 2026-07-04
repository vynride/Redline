"""In-process per-caller rate limiting for the expensive endpoints.

The abusable routes (LLM-backed scenario generation, WeasyPrint PDF export) are
throttled per authenticated user so a single account can't hammer the Sarvam API or
the PDF renderer; unauthenticated callers (which these routes reject anyway) fall
back to their client IP.

Storage is in-memory and per-process, which matches the single-worker uvicorn
deployment. If the backend is ever scaled to multiple workers/replicas, back this
with a shared store (Redis). Used as a FastAPI dependency:
``dependencies=[Depends(scenario_generation_limit)]``.

Note: the limiter is a closure *function* (not a callable class) on purpose — FastAPI
resolves a dependency's parameter annotations against ``callable.__globals__``, which a
class instance doesn't have, so ``request: Request`` would be misread as a query param.
"""
from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Callable

from fastapi import HTTPException, Request, status

from app.core.security import decode_access_token


def _caller_key(request: Request) -> str:
    auth = request.headers.get("authorization", "")
    if auth.lower().startswith("bearer "):
        sub = decode_access_token(auth[7:].strip())
        if sub:
            return f"user:{sub}"
    client = request.client
    return f"ip:{client.host if client else 'unknown'}"


def rate_limiter(limit: int, window_seconds: int) -> Callable[[Request], None]:
    """Build a FastAPI dependency allowing at most ``limit`` requests per ``window_seconds`` per caller."""
    hits: dict[str, deque[float]] = defaultdict(deque)

    def dependency(request: Request) -> None:
        key = _caller_key(request)
        now = time.monotonic()
        bucket = hits[key]
        cutoff = now - window_seconds
        while bucket and bucket[0] <= cutoff:
            bucket.popleft()
        if len(bucket) >= limit:
            retry_after = int(bucket[0] + window_seconds - now) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please slow down and try again shortly.",
                headers={"Retry-After": str(retry_after)},
            )
        bucket.append(now)

    return dependency


# LLM cost — each call hits the Sarvam chat model.
scenario_generation_limit = rate_limiter(limit=10, window_seconds=60)
# CPU (WeasyPrint) plus a possible debrief LLM call on first export.
pdf_export_limit = rate_limiter(limit=30, window_seconds=60)
