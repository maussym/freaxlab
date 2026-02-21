import asyncio
from typing import List
from schemas.diagnosis import Diagnosis

async def get_diagnosis(symptoms: str) -> List[Diagnosis]:
    """
    Асинхронная функция-заглушка для ML-сервиса.
    """
    
    await asyncio.sleep(2.0)
    
    # Фейковый успешный ответ, соответствующий формату из mock_server.py
    fake_diagnoses = [
        Diagnosis(
            rank=1,
            diagnosis="Острый бронхит",
            icd10_code="J20.9",
            explanation=f"Based on symptoms: {symptoms[:100]}..." if symptoms else "No symptoms provided"
        ),
        Diagnosis(
            rank=2,
            diagnosis="Пневмония без уточнения",
            icd10_code="J18.9",
            explanation="Присутствует риск развития пневмонии из-за длительного характера лихорадки."
        )
    ]
    
    return fake_diagnoses
