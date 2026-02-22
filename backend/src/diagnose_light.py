"""
Лёгкий пайплайн для Railway (без torch/sentence-transformers).
Напрямую вызывает LLM (oss-120b) для диагностики.
"""

import json
import re

from openai import OpenAI

from src.config import API_KEY, HUB_URL, MODEL

TOP_N_DIAGNOSES = 3

SYSTEM_PROMPT = """Ты — главный медицинский эксперт Казахстана. Классифицируй симптомы пациента по МКБ-10.

ПРАВИЛА:
1. ИЩИ ПРИЧИНУ, А НЕ СЛЕДСТВИЕ — выбирай код заболевания, а не симптома.
2. Используй актуальные коды МКБ-10.
3. Давай конкретные объяснения.

ОТВЕТЬ СТРОГО В ФОРМАТЕ JSON:
{
    "diagnoses": [
        {
            "rank": 1,
            "diagnosis": "Полное название диагноза",
            "icd10_code": "Код МКБ-10",
            "explanation": "Почему этот диагноз наиболее вероятен."
        }
    ]
}"""


class DiagnoserLight:
    """LLM-only диагностика (без RAG, без torch)."""

    def __init__(self):
        print(f"[Light] Подключение к ЛЛМ: {HUB_URL}")
        self.llm = OpenAI(base_url=HUB_URL, api_key=API_KEY)

    def _call_llm(self, symptoms: str) -> dict:
        response = self.llm.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Симптомы пациента: {symptoms}\n\nДай топ-{TOP_N_DIAGNOSES} диагноза."},
            ],
            temperature=0.1,
            max_tokens=2048,
        )
        raw = response.choices[0].message.content.strip()
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            match = re.search(r'\{.*"diagnoses"\s*:\s*\[.*?\].*?\}', raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
            raise ValueError(f"ЛЛМ вернула невалидный JSON:\n{raw[:300]}")

    def diagnose(self, symptoms: str) -> dict:
        if not symptoms or not symptoms.strip():
            raise ValueError("Симптомы не могут быть пустыми")
        result = self._call_llm(symptoms)
        if "diagnoses" not in result:
            raise ValueError(f"ЛЛМ вернула неожиданный формат: {result}")
        return result
