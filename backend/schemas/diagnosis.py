from pydantic import BaseModel, Field
from typing import List, Optional

class DiagnoseRequest(BaseModel):
    """
    Модель запроса, содержащая текст анамнеза пациента (симптомы).
    """
    symptoms: Optional[str] = Field(
        "", 
        title="Симптомы пациента", 
        description="Жалобы пациента, история болезни и симптомы"
    )


class Diagnosis(BaseModel):
    """
    Модель отдельного диагноза из результата работы ML.
    """
    rank: int = Field(..., title="Ранг (приоритет)")
    diagnosis: str = Field(..., title="Название диагноза")
    icd10_code: str = Field(..., title="Код МКБ-10")
    explanation: str = Field(
        ..., 
        title="Объяснение", 
        description="Почему модель выбрала этот диагноз на основе симптомов"
    )


class DiagnoseResponse(BaseModel):
    """
    Ответ API со списком возможных диагнозов.
    """
    diagnoses: List[Diagnosis] = Field(..., title="Список диагнозов")
    processing_time_ms: float = Field(default=0.0, title="Время обработки запроса (в миллисекундах)")
