from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import diagnose

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
    app.include_router(health.router, prefix="/api/v1", tags=["Системные"])
    app.include_router(diagnose.router, prefix="/api/v1", tags=["Диагностика"])

    return app

app = create_app()

# Точка входа для локальной отладки без использования команды терминала uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
