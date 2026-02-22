# Backend with RAG pipeline (torch + sentence-transformers + Qdrant)
# Used by docker-compose.yml for full deployment
FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --extra ml

COPY src/ ./src/

RUN mkdir -p /app/data

# Pre-download ML models during build
RUN uv run python -c "\
from sentence_transformers import SentenceTransformer, CrossEncoder; \
print('Downloading bge-m3...'); \
SentenceTransformer('BAAI/bge-m3'); \
print('Downloading reranker...'); \
CrossEncoder('BAAI/bge-reranker-v2-m3'); \
print('Done!')"

ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV QDRANT_URL=http://qdrant:6333

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

CMD uv run uvicorn src.main:app --host 0.0.0.0 --port $PORT
