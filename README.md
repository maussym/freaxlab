# FREAX.LAB

AI-система клинической диагностики на основе клинических протоколов Министерства Здравоохранения Республики Казахстан.

**Datasaur 2026 | QazCode Challenge**

---

## Что делает

Пользователь вводит симптомы пациента в свободной форме — система возвращает:
- Top-N вероятных диагнозов, ранжированных по вероятности
- Коды МКБ-10 для каждого диагноза
- Клинические пояснения на основе протоколов МЗ РК

## Стек

### Frontend
- **React 19** + TypeScript
- **Vite 7** (сборка)
- **Tailwind CSS v4**
- **UnicornStudio** (WebGL-анимация на лендинге)
- **Web Speech API** (голосовой ввод)

### Backend
- **FastAPI** + Uvicorn
- **OpenAI SDK** (GPT-OSS через QazCode Hub)
- **pydantic-settings** (конфигурация)

### Деплой
- **Docker** (multi-stage: Node + Python в одном образе)
- **Vercel** (фронтенд) / **Render** (бекенд) — опционально

---

## Возможности

- Мультиязычный интерфейс (KK / RU / EN)
- Голосовой ввод симптомов (русский, казахский, английский)
- Quick-чипы для быстрого ввода симптомов
- Карточки диагнозов с confidence bar и аккордеоном
- Кнопка копирования диагноза
- История чатов с поиском (localStorage)
- Адаптивный сайдбар (desktop + mobile hamburger)
- Лендинг с секциями: Hero, How It Works, About, Partners, Footer
- Оптимизированные анимации (IntersectionObserver, content-visibility)

---

## Быстрый старт

### Локальная разработка

**Backend:**
```bash
cd backend
uv sync
cp .env.example .env  # добавить QAZCODE_API_KEY
uv run uvicorn src.main:app --host 127.0.0.1 --port 8080
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Открыть http://localhost:5173 — Vite проксирует `/diagnose` на `localhost:8080`.

### Docker (полная сборка)

```bash
docker build -t freaxlab .
docker run -p 8000:8000 -e QAZCODE_API_KEY=your_key freaxlab
```

Открыть http://localhost:8000.

---

## Структура проекта

```
datasaur_freaks/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/       # UI-компоненты
│   │   │   ├── HeroSection   # Лендинг + UnicornStudio canvas
│   │   │   ├── ChatWindow    # Окно чата с сообщениями
│   │   │   ├── ChatInput     # Ввод + голос + чипы
│   │   │   ├── ChatSidebar   # Сайдбар с историей сессий
│   │   │   ├── DiagnosisCard # Карточка диагноза
│   │   │   ├── HowItWorks    # Секция "Как это работает"
│   │   │   ├── AboutProject  # Секция "О проекте"
│   │   │   ├── Partners      # Технологии и партнёры
│   │   │   ├── Footer        # Подвал
│   │   │   └── LanguageSwitcher
│   │   ├── hooks/            # useSessions, useInView
│   │   ├── i18n/             # Переводы (KK/RU/EN)
│   │   ├── api.ts            # HTTP-клиент
│   │   ├── types.ts          # TypeScript-типы
│   │   └── App.tsx           # Роутинг hero ↔ chat
│   ├── vite.config.ts
│   └── package.json
├── backend/                  # FastAPI сервер
│   ├── src/
│   │   ├── main.py           # Эндпоинты + раздача SPA
│   │   ├── config.py         # Настройки из .env
│   │   ├── logger.py         # Логирование
│   │   └── services/
│   │       └── ml_service.py # RAG-диагностика (GPT-OSS)
│   ├── data/                 # Тестовые данные
│   ├── notebooks/            # Jupyter-примеры
│   ├── Dockerfile            # Backend-only образ
│   └── pyproject.toml
├── Dockerfile                # Production multi-stage
├── vercel.json               # Vercel-деплой фронтенда
└── .dockerignore
```

---

## API

### POST /diagnose

Основной эндпоинт диагностики.

**Request:**
```json
{
  "symptoms": "Головная боль, температура 38.5, боль в горле"
}
```

**Response:**
```json
{
  "diagnoses": [
    {
      "rank": 1,
      "diagnosis": "Острый бронхит",
      "icd10_code": "J20.9",
      "explanation": "Симптомы соответствуют острому бронхиту."
    }
  ]
}
```

### GET /health

Healthcheck. Возвращает `{"status": "ok"}`.

---

## Переменные окружения

| Переменная | Описание | Где |
|------------|----------|-----|
| `QAZCODE_API_KEY` | API-ключ QazCode Hub (GPT-OSS) | Backend `.env` |
| `QAZCODE_BASE_URL` | URL API (по умолчанию `https://hub.qazcode.ai/v1`) | Backend `.env` |
| `VITE_API_BASE` | URL бекенда для фронтенда (пустой = same-origin) | Vercel env |

---

## Деплой

### Docker (Railway / Render / VPS)

Корневой `Dockerfile` собирает всё в один образ:
1. Stage 1: `node:20-slim` — билд фронтенда
2. Stage 2: `python:3.12-slim` — бекенд + статика

```bash
docker build -t freaxlab .
docker run -p 8000:8000 -e QAZCODE_API_KEY=... freaxlab
```

### Vercel + Render (раздельно)

**Frontend (Vercel):** `vercel.json` уже настроен. Добавить `VITE_API_BASE` в Environment Variables.

**Backend (Render):** New Web Service → Root Directory: `backend` → Runtime: Docker.

---

## Команда

**freaks** — Datasaur 2026 | QazCode Challenge
