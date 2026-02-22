from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, List

if TYPE_CHECKING:
    from src.main import DiagnosisItem

from src.logger import logger


class MedicalDiagnosisService:
    def __init__(self):
        # Try heavy RAG (torch + local models) first
        try:
            from src.diagnose import Diagnoser
            self.diagnoser = Diagnoser()
            self._use_rag = True
            logger.info("RAG Diagnoser initialized (Qdrant + bge-m3 + reranker)")
            return
        except Exception as e:
            logger.warning(f"Heavy RAG unavailable ({e}), trying light version...")

        # Fallback: light RAG (HF Inference API, no torch)
        try:
            from src.diagnose_light import DiagnoserLight
            self.diagnoser = DiagnoserLight()
            self._use_rag = True
            logger.info("Light RAG Diagnoser initialized (HF API + Qdrant Cloud)")
            return
        except Exception as e:
            logger.warning(f"Light RAG also unavailable ({e}), using fallback stub")

        self.diagnoser = None
        self._use_rag = False

    async def predict(self, symptoms: str) -> List[DiagnosisItem]:
        from src.main import DiagnosisItem

        if self._use_rag and self.diagnoser is not None:
            result = await asyncio.to_thread(self.diagnoser.diagnose, symptoms)
            return [
                DiagnosisItem(
                    rank=d.get("rank", i + 1),
                    diagnosis=d.get("diagnosis", ""),
                    icd10_code=d.get("icd10_code", ""),
                    explanation=d.get("explanation", ""),
                )
                for i, d in enumerate(result.get("diagnoses", []))
            ]

        return [
            DiagnosisItem(rank=1, diagnosis="Острый бронхит", icd10_code="J20.9",
                          explanation="Симптомы соответствуют острому бронхиту."),
            DiagnosisItem(rank=2, diagnosis="Пневмония", icd10_code="J18.9",
                          explanation="Необходим рентген для исключения пневмонии."),
            DiagnosisItem(rank=3, diagnosis="ОРВИ", icd10_code="J06.9",
                          explanation="Возможна вирусная инфекция верхних дыхательных путей."),
        ]
