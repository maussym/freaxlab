# FREAX.LAB (MedAssist.KZ)

AI-система клинической диагностики на основе **10 308 клинических протоколов** Министерства Здравоохранения РК.

**Datasaur 2026 | QazCode Challenge**

> **Production:** [freaxlab.up.railway.app](https://freaxlab.up.railway.app)

---

## Как работает

1. Пользователь вводит симптомы (текст или голос)
2. RAG-пайплайн ищет релевантные протоколы МЗ РК в векторной БД (10 308 документов)
3. LLM (GPT-OSS через QazCode Hub) анализирует симптомы + протоколы
4. Возвращает **Top-3 диагноза** с кодами МКБ-10 и пояснениями

## Ключевые фичи

| Фича | Описание |
|------|----------|
| RAG-диагностика | Qdrant Cloud + bge-m3 embeddings + CrossEncoder reranker + LLM |
| Мультиязычность | Казахский / Русский / Английский |
| Голосовой ввод | Web Speech API (KK, RU, EN) |
| Карта тела | Интерактивный body map для выбора области боли |
| История чатов | Сохранение и поиск по сессиям |
| Экспорт PDF | Выгрузка диагноза в PDF |
| Авторизация | JWT-аутентификация |

---

## Стек

| Слой | Технологии |
|------|-----------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS v4, UnicornStudio (WebGL) |
| Backend | FastAPI, Uvicorn, OpenAI SDK, JWT, SQLite |
| ML/RAG | Qdrant Cloud, sentence-transformers (bge-m3), CrossEncoder reranker, GPT-OSS (QazCode Hub) |
| Deploy | Docker (multi-stage), Railway (production), docker-compose (local full stack) |

---

## Быстрый старт

### Docker Compose (полный стек с RAG)

```bash
docker compose up --build
```
Открыть http://localhost:8080

### Локальная разработка

```bash
# Backend
cd backend && uv sync && cp .env.example .env
uv run uvicorn src.main:app --host 127.0.0.1 --port 8080

# Frontend
cd frontend && npm install && npm run dev
```
Открыть http://localhost:5173

---

## API эндпоинты

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/diagnose` | Диагностика по симптомам |
| POST | `/api/auth/register` | Регистрация |
| POST | `/api/auth/login` | Авторизация (JWT) |
| POST | `/api/chat` | Отправка сообщения в чат |
| GET | `/api/history` | История диагнозов |
| GET | `/api/export/pdf/{id}` | Экспорт в PDF |
| POST | `/api/body-map` | Диагностика по области тела |
| GET | `/health` | Healthcheck |

### Пример запроса

```bash
curl -X POST https://freaxlab.up.railway.app/diagnose \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "Головная боль, температура 38.5, боль в горле"}'
```

---

## Архитектура RAG-пайплайна

```
Симптомы → bge-m3 (embeddings) → Qdrant Cloud (10 308 протоколов)
                                         ↓
                                  Top-20 документов
                                         ↓
                              CrossEncoder reranker → Top-5
                                         ↓
                              LLM (GPT-OSS) → Диагнозы + МКБ-10
```

---

## Команда

**FREAKS** — Datasaur 2026 | QazCode Challenge
