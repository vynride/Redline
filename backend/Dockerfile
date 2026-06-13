# Redline backend — FastAPI on Python 3.12.
FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# TLS roots for the Sarvam HTTP/WebSocket calls (chat, STT, TTS).
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# Apply migrations, validate/seed the scenario catalog, then serve.
CMD ["sh", "-c", "alembic upgrade head && python -m scripts.seed_scenarios && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
