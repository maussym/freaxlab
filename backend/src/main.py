from contextlib import asynccontextmanager
from fastapi import FastAPI
from pydantic import BaseModel

from src.config import settings

class DiagnoseRequest(BaseModel):
    symptoms: str

class DiagnosisItem(BaseModel):
    rank: int
    diagnosis: str
    icd10_code: str
    explanation: str

class DiagnoseResponse(BaseModel):
    diagnoses: list[DiagnosisItem]

async def run_ml_pipeline(symptoms: str) -> list[DiagnosisItem]:
    # ML-TEAM: ВАША ЛОГИКА ИНФЕРЕНСА ВСТАВЛЯЕТСЯ СЮДА
    return [
        DiagnosisItem(
            rank=1,
            diagnosis="Острый бронхит",
            icd10_code="J20.9",
            explanation="Симптомы соответствуют острому бронхиту."
        ),
        DiagnosisItem(
            rank=2,
            diagnosis="Пневмония",
            icd10_code="J18.9",
            explanation="Необходим рентген для исключения пневмонии."
        ),
        DiagnosisItem(
            rank=3,
            diagnosis="ОРВИ",
            icd10_code="J06.9",
            explanation="Возможна вирусная инфекция верхних дыхательных путей."
        )
    ]

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ML-TEAM: ИНИЦИАЛИЗАЦИЯ ВЕКТОРНОЙ БАЗЫ И ПРОМПТОВ ЗДЕСЬ (выполняется 1 раз при старте)
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose(request: DiagnoseRequest):
    diagnoses = await run_ml_pipeline(request.symptoms)
    return DiagnoseResponse(diagnoses=diagnoses)
