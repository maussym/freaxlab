import time
import logging
from fastapi import APIRouter, HTTPException

from schemas.diagnosis import DiagnoseRequest, DiagnoseResponse
from services.ml_service import get_diagnosis

# Настройка базового логгера
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post(
    "/diagnose", 
    response_model=DiagnoseResponse, 
    summary="Получить гипотетические диагнозы", 
    description="Анализирует переданный текст симптомов и возвращает возможные диагнозы, "
                "соответствующие клиническим протоколам РК."
)
async def diagnose_patient(request: DiagnoseRequest) -> DiagnoseResponse:
    """
    Основной эндпоинт для предсказания диагноза на основе анамнеза.
    Включает замер времени выполнения для демонстрации жюри скорости работы API.
    """
    # Фиксируем время начала обработки
    start_time = time.perf_counter()
    
    try:
        # Вызов ML-сервиса (асинхронно, не блокируя воркеры FastAPI)
        symptoms_text = request.symptoms or ""
        diagnoses = await get_diagnosis(symptoms_text)
        
        # Вычисляем время выполнения в миллисекундах
        end_time = time.perf_counter()
        processing_time_ms = round((end_time - start_time) * 1000, 2)
        
        return DiagnoseResponse(
            diagnoses=diagnoses,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        # Логируем ошибку с трейсом, чтобы быстро отладить проблемы с моделью
        logger.error(f"Внутренняя ошибка при обработке симптомов: {e}", exc_info=True)
        # Отдаём клиенту безопасную 500 ошибку
        raise HTTPException(
            status_code=500,
            detail="Внутренняя ошибка сервера при обработке симптомов. Проверьте логи ML-сервиса."
        )
