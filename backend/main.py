from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from api.endpoints import diagnose

STATIC_DIR = Path(__file__).resolve().parent / "static"

def create_app() -> FastAPI:
    """
    Фабрика для создания главного приложения FastAPI.
    """
    # Настраиваем красивые названия для Swagger UI, что полезно для презентации
    app = FastAPI(
        title="QazMed AI Assistant API",
        description="""API для прототипа AI-ассистента. 
                       Анализирует текст анамнеза и определяет гипотетические диагнозы 
                       в соответствии с клиническими протоколами Республики Казахстан.""",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # Добавляем CORS middleware (разрешаем всё для удобства фронтенда на хакатоне)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Подключаем роутер с нашими эндпоинтами
    from api.endpoints import diagnose, health
    app.include_router(health.router, tags=["Системные"])
    app.include_router(diagnose.router, tags=["Диагностика"])

    # Раздача фронтенда (собранный Vite-билд)
    if STATIC_DIR.exists():
        app.mount("/assets", StaticFiles(directory=STATIC_DIR / "assets"), name="assets")

        @app.get("/", include_in_schema=False)
        async def serve_spa():
            return FileResponse(STATIC_DIR / "index.html")

    return app

app = create_app()

# Точка входа для локальной отладки без использования команды терминала uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8080, reload=True)
