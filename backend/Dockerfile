# Redline backend — FastAPI on Python 3.12.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# TLS roots for the Sarvam HTTP/WebSocket calls (chat, STT, TTS), plus the
# Pango/Cairo/GDK-PixBuf stack WeasyPrint needs to render the debrief PDF.
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf-2.0-0 \
        libffi8 libharfbuzz0b fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

# Run as an unprivileged user. pip install stays as root so packages land in the
# system site-packages; the app process drops to appuser via USER below.
RUN useradd -r -u 10001 appuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appuser . .

EXPOSE 8000

USER appuser

# Apply migrations, validate/seed the scenario catalog, then serve.
CMD ["sh", "-c", "alembic upgrade head && python -m scripts.seed_scenarios && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
