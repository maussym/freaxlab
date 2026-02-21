from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    version: str

@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Проверка работоспособности API",
    description="Эндпоинт для проверки статуса сервиса (Health Check). Полезно для Docker и балансировщиков нагрузки."
)
async def health_check():
    """
    Возвращает статус сервера.
    """
    return HealthResponse(status="ok", version="1.0.0")
