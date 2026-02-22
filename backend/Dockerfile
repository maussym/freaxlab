FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc g++ curl git \
    && rm -rf /var/lib/apt/lists/*

RUN pip install uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY src/ ./src/

# Скачиваем модели при сборке образа
RUN uv run python -c "\
from sentence_transformers import SentenceTransformer, CrossEncoder; \
print('Загрузка bge-m3...'); \
SentenceTransformer('BAAI/bge-m3'); \
print('Загрузка reranker...'); \
CrossEncoder('BAAI/bge-reranker-v2-m3'); \
print('Готово!')"

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 8000
ENTRYPOINT ["./docker-entrypoint.sh"]