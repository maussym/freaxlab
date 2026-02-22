"""
RAG-пайплайн: симптомы → Qdrant → ЛЛМ → диагнозы с ICD-10

Использование как модуль:
    from diagnose import Diagnoser
    diagnoser = Diagnoser()
    result = diagnoser.diagnose("кашель, температура 38, боль в груди")

Использование как FastAPI сервер:
    uv run uvicorn diagnose:app --host 0.0.0.0 --port 8000
"""

import json
import os
import re
from functools import lru_cache

import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from sentence_transformers import CrossEncoder

from config import * 

# ─── Конфигурация ────────────────────────────────────────────────────────────

COLLECTION_NAME = "medical_protocols_v5"
EMBEDDING_MODEL = "BAAI/bge-m3"
VECTOR_SIZE     = 1024
TOP_K           = 5   # сколько чанков тянуть из Qdrant
TOP_N_DIAGNOSES = 3        # сколько диагнозов возвращать

QDRANT_URL  = "http://localhost:6333"

# ─── Промпт ──────────────────────────────────────────────────────────────────

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
    
    # Сортируем или фильтруем уникальные протоколы, чтобы не дублировать
    seen_protocols = set()
    
    for i, chunk in enumerate(chunks, 1):
        p_id = chunk.get("protocol_id")
        # Чтобы не забивать контекст одинаковыми названиями, если выпало много чанков одного протокола
        title = chunk.get("title", "Неизвестный протокол")
        text = chunk.get("text", "") # Это тот самый 'part' из нового build_chunks
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


# ─── Основной класс ──────────────────────────────────────────────────────────

class Diagnoser:
    def __init__(self):
        self.device = self._get_device()
        print(f"Загрузка модели эмбеддингов: {EMBEDDING_MODEL}")
        self.embed_model = SentenceTransformer(EMBEDDING_MODEL, device=self.device)

        print(f"Подключение к Qdrant: {QDRANT_URL}")
        self.qdrant = QdrantClient(url=QDRANT_URL)

        print(f"Подключение к ЛЛМ: {HUB_URL}")
        self.llm = OpenAI(base_url=HUB_URL, api_key=API_KEY)
        self.reranker = CrossEncoder('BAAI/bge-reranker-v2-m3', max_length=512, device=self.device)

    def _get_device(self) -> str:
        if torch.backends.mps.is_available():
            return "mps"
        if torch.cuda.is_available():
            return "cuda"
        return "cpu"

    def _embed_query(self, text: str) -> list[float]:
        enriched = f"Клинический случай для диагностики по МКБ-10: {text}"
        try:
            return self.embed_model.encode(
                enriched,
                normalize_embeddings=True,
                prompt_name="query",
            ).tolist()
        except Exception:
            return self.embed_model.encode(enriched, normalize_embeddings=True).tolist()

    def _retrieve(self, symptoms: str) -> list[dict]:
        # 1. Расширяем запрос (Query Expansion)
        query_vector = self._embed_query(symptoms)
        
        # 2. Берем побольше кандидатов для реранкера
        results = self.qdrant.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=30, # Реранкеру нужно из чего выбирать
            with_payload=True,
        ).points

        # 3. РЕРАНЖИРОВАНИЕ: скармливаем связку [Симптомы, Название + Текст]
        # Это "чит", чтобы реранкер видел заголовок протокола (например, "Остеомиелит")
        pairs = []
        for r in results:
            title = r.payload.get('title', 'Неизвестный протокол')
            text = r.payload.get('text', '')
            pairs.append([symptoms, f"ПРОТОКОЛ: {title}. СОДЕРЖАНИЕ: {text}"])
        
        scores = self.reranker.predict(pairs)
        
        for i in range(len(results)):
            results[i].score = scores[i]
        
        results.sort(key=lambda x: x.score, reverse=True)
        
        # Топ-K теперь реально самые релевантные по смыслу, а не по частоте слов
        return [r.payload for r in results[:TOP_K]]

    def _call_llm(self, symptoms: str, chunks: list[dict]) -> dict:
        user_prompt = build_user_prompt(symptoms, chunks)

        response = self.llm.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_prompt},
            ],
            temperature=0.1,
            max_tokens=2048,  
        )

        raw = response.choices[0].message.content.strip()

        # Убираем markdown
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)

        # Защита от обрезанного JSON — пробуем починить
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            # Ищем хотя бы частичный валидный JSON с diagnoses
            match = re.search(r'\{.*"diagnoses"\s*:\s*\[.*?\].*?\}', raw, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except Exception:
                    pass
            raise ValueError(f"ЛЛМ вернула невалидный JSON:\n{raw[:300]}")

    def diagnose(self, symptoms: str) -> dict:
        """
        Основной метод: симптомы → диагнозы.
        Возвращает dict с ключом 'diagnoses'.
        """
        if not symptoms or not symptoms.strip():
            raise ValueError("Симптомы не могут быть пустыми")

        # Шаг 1: Retrieval
        chunks = self._retrieve(symptoms)
        if not chunks:
            raise RuntimeError("Qdrant вернул 0 результатов — проверь что коллекция заполнена")

        # Шаг 2: Generation
        result = self._call_llm(symptoms, chunks)

        # Валидация структуры
        if "diagnoses" not in result:
            raise ValueError(f"ЛЛМ вернула неожиданный формат: {result}")

        return result


# ─── FastAPI сервер ───────────────────────────────────────────────────────────

app = FastAPI(title="Medical Diagnosis API")

# Инициализируем один раз при старте сервера
@lru_cache(maxsize=1)
def get_diagnoser() -> Diagnoser:
    return Diagnoser()


class DiagnoseRequest(BaseModel):
    symptoms: str


class DiagnoseResponse(BaseModel):
    diagnoses: list[dict]


@app.post("/diagnose", response_model=DiagnoseResponse)
async def diagnose_endpoint(request: DiagnoseRequest):
    try:
        diagnoser = get_diagnoser()
        result = diagnoser.diagnose(request.symptoms)
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok"}


# ─── CLI для быстрого теста ──────────────────────────────────────────────────

if __name__ == "__main__":
    import sys
    import uvicorn

    # Если переданы аргументы — делаем CLI вызов diagnose
    if len(sys.argv) > 1:
        symptoms = " ".join(sys.argv[1:])
        print(f"Симптомы: {symptoms}\n")

        diagnoser = Diagnoser()
        result = diagnoser.diagnose(symptoms)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        # Если аргументов нет — запускаем FastAPI сервер автоматически
        print("Запуск FastAPI сервера на http://0.0.0.0:8000 ...")
        uvicorn.run("diagnose:app", host="0.0.0.0", port=8000, reload=True)