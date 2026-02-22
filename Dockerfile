# ── Stage 1: Build frontend ──────────────────────────────────
FROM node:20-slim AS frontend

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
ENV VERCEL=0
RUN npm run build -- --outDir dist

# ── Stage 2: Python backend ─────────────────────────────────
FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY backend/pyproject.toml backend/uv.lock ./
# Railway: only base deps (no torch/ML), uses diagnose_light.py via HF API
RUN uv sync --frozen --no-dev

COPY backend/src/ ./src/
COPY --from=frontend /build/dist ./static/

RUN mkdir -p /app/data

ENV PYTHONUNBUFFERED=1

CMD uv run uvicorn src.main:app --host 0.0.0.0 --port ${PORT:-8000}
