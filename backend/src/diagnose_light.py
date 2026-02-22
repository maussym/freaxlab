"""
Лёгкий RAG-пайплайн для Railway (без torch/sentence-transformers).
Эмбеддинги через HuggingFace Inference API, поиск в Qdrant Cloud, LLM через QazCode.
"""

import json
import re

import httpx
from openai import OpenAI
from qdrant_client import QdrantClient

from src.config import API_KEY, HUB_URL, MODEL, settings

# ─── Конфигурация ────────────────────────────────────────────────────────────

COLLECTION_NAME = "medical_protocols_v5"
EMBEDDING_MODEL = "BAAI/bge-m3"
TOP_K = 5
TOP_N_DIAGNOSES = 3

QDRANT_URL = settings.QDRANT_URL
QDRANT_API_KEY = settings.QDRANT_API_KEY

HF_INFERENCE_URL = f"https://api-inference.huggingface.co/models/{EMBEDDING_MODEL}"

# ─── Промпт (тот же что в diagnose.py) ──────────────────────────────────────

SYSTEM_PROMPT = """Ты — главный медицинский эксперт. Твоя задача — классификация по протоколам.

ПРАВИЛА ПРИОРИТЕТА:
1. ИЩИ ПРИЧИНУ, А НЕ СЛЕДСТВИЕ: Если в протоколе описано заболевание (например, Остеомиелит или Рак) и его симптом (отек, боль), ты ОБЯЗАН выбрать код заболевания. Запрещено выбирать код симптома (R-коды) или вторичного состояния, если есть основной диагноз.
2. МКБ-10 СТРОГОСТЬ: Используй только те коды, которые явно указаны в поле "ДОПУСТИМЫЕ КОДЫ" предоставленного протокола.
3. НИКАКИХ ВНЕШНИХ ЗНАНИЙ: Если в протоколе написано, что "боль в ноге — это признак Х", пиши "Х", даже если ты "думаешь", что это "Y".

ОТВЕТЬ СТРОГО В ФОРМАТЕ JSON:
{
    "diagnoses": [
        {
            "rank": 1,
            "diagnosis": "Полное название из заголовка протокола",
            "icd10_code": "Код строго из списка этого протокола",
            "explanation": "Конкретная улика из текста протокола."
        }
    ]
}"""


def build_user_prompt(symptoms: str, chunks: list[dict]) -> str:
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        title = chunk.get("title", "Неизвестный протокол")
        text = chunk.get("text", "")
        codes = ", ".join(chunk.get("icd_codes", []))
        context_parts.append(
            f"--- ПРОТОКОЛ №{i} ---\n"
            f"НАЗВАНИЕ: {title}\n"
            f"ДОПУСТИМЫЕ КОДЫ МКБ-10: {codes}\n"
            f"ВЫДЕРЖКА ИЗ ТЕКСТА: {text}\n"
        )
    context = "\n".join(context_parts)
    return f"""СИМПТОМЫ ПАЦИЕНТА:
{symptoms}

ДОСТУПНЫЕ КЛИНИЧЕСКИЕ ПРОТОКОЛЫ ДЛЯ АНАЛИЗА:
{context}

ЗАДАНИЕ:
На основе симптомов выбери топ-{TOP_N_DIAGNOSES} диагноза из списка выше.
Для каждого диагноза обязательно укажи точный код МКБ-10 из списка допустимых кодов этого протокола."""


# ─── Лёгкий Diagnoser ───────────────────────────────────────────────────────

class DiagnoserLight:
    """RAG без torch — эмбеддинги через HuggingFace Inference API."""

    def __init__(self):
        print(f"[Light] Подключение к Qdrant: {QDRANT_URL}")
        self.qdrant = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY or None)

        print(f"[Light] Подключение к ЛЛМ: {HUB_URL}")
        self.llm = OpenAI(base_url=HUB_URL, api_key=API_KEY)

        self._http = httpx.Client(timeout=30.0)

    def _embed_query(self, text: str) -> list[float]:
        """Получить эмбеддинг через HuggingFace Inference API (бесплатно)."""
        enriched = f"Клинический случай для диагностики по МКБ-10: {text}"
        resp = self._http.post(
            HF_INFERENCE_URL,
            json={"inputs": enriched},
            headers={"Content-Type": "application/json"},
        )
        resp.raise_for_status()
        data = resp.json()
        # HF API возвращает [[...]] или [...] в зависимости от модели
        if isinstance(data, list) and len(data) > 0:
            if isinstance(data[0], list):
                return data[0]
            return data
        raise ValueError(f"Неожиданный формат ответа HF API: {type(data)}")

    def _retrieve(self, symptoms: str) -> list[dict]:
        query_vector = self._embed_query(symptoms)
        results = self.qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=TOP_K,
            with_payload=True,
        ).points
        return [r.payload for r in results]

    def _call_llm(self, symptoms: str, chunks: list[dict]) -> dict:
        user_prompt = build_user_prompt(symptoms, chunks)
        response = self.llm.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
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
        chunks = self._retrieve(symptoms)
        if not chunks:
            raise RuntimeError("Qdrant вернул 0 результатов")
        result = self._call_llm(symptoms, chunks)
        if "diagnoses" not in result:
            raise ValueError(f"ЛЛМ вернула неожиданный формат: {result}")
        return result
