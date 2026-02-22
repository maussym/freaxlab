"""
Векторная БД Qdrant из JSONL медицинских протоколов.
Модель: BAAI/bge-m3 (8192 токенов, лучше для длинных документов)
Ускорение: MPS (Apple Silicon) → автоматически

Установка:
    pip install qdrant-client sentence-transformers tqdm torch

Запуск Qdrant:
    docker run -p 6333:6333 qdrant/qdrant

Использование:
    python setup_qdrant.py --input protocols.jsonl              # всё сразу
    python setup_qdrant.py --input protocols.jsonl --encode-only
    python setup_qdrant.py --input protocols.jsonl --upload-only
    python setup_qdrant.py --input protocols.jsonl --query "боль в животе желтуха"
"""

import json
import re
import argparse
import hashlib
from pathlib import Path

import torch
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct, OptimizersConfigDiff
from qdrant_client.models import QueryRequest

# ─── Конфигурация ────────────────────────────────────────────────────────────

COLLECTION_NAME = "medical_protocols_v5"
EMBEDDING_MODEL  = "BAAI/bge-m3"
VECTOR_SIZE      = 1024

# bge-m3 поддерживает до 8192 токенов, берём ~3000 символов на чанк (~900 токенов)
MAX_CHARS_PER_CHUNK = 5000
BATCH_SIZE          = 16   # bge-m3 тяжелее чем e5-base

QDRANT_URL  = "http://localhost:6333"
CACHE_FILE  = "points_cache.jsonl"


# ─── Определение устройства (MPS / CUDA / CPU) ───────────────────────────────

def get_device() -> str:
    if torch.backends.mps.is_available():
        print("🍎 Используем MPS (Apple Silicon GPU)")
        return "mps"
    if torch.cuda.is_available():
        print("⚡ Используем CUDA GPU")
        return "cuda"
    print("💻 Используем CPU")
    return "cpu"


# ─── Извлечение клинических секций ───────────────────────────────────────────

_SECTION_PATTERNS = {
    "symptoms": re.compile(
        r"(?:жалоб[ыи]|ЖАЛОБ[ЫИ]|клинические\s+критерии|КЛИНИЧЕСКИЕ\s+КРИТЕРИИ"
        r"|критерии\s+диагностики|КРИТЕРИИ\s+ДИАГНОСТИКИ"
        r"|клиническая\s+картина|КЛИНИЧЕСКАЯ\s+КАРТИНА)(.*?)"
        r"(?=\n\s*\d+\.\d+\s|\nI{1,3}V?\b|\nVII?\b|\Z)",
        re.IGNORECASE | re.DOTALL,
    ),
    "diagnosis": re.compile(
        r"(?:диагностик[аи]|ДИАГНОСТИК[АИ]|лабораторн|ЛАБОРАТОРН"
        r"|инструментальн|ИНСТРУМЕНТАЛЬН)(.*?)"
        r"(?=\nI{1,3}V?\b|\nVII?\b|лечение|ЛЕЧЕНИЕ|\Z)",
        re.IGNORECASE | re.DOTALL,
    ),
    "treatment": re.compile(
        r"(?:лечение|ЛЕЧЕНИЕ|медикаментозн|МЕДИКАМЕНТОЗН"
        r"|хирургическ|ХИРУРГИЧЕСК)(.*?)"
        r"(?=\nV{1,3}\b|\nVII?\b|профилактика|ПРОФИЛАКТИКА|\Z)",
        re.IGNORECASE | re.DOTALL,
    ),
}


def extract_protocol_name(text: str, source_file: str) -> str:
    """Реальное название протокола, не 'Одобрен'."""
    m = re.search(
        r"КЛИНИЧЕСКИЙ ПРОТОКОЛ ДИАГНОСТИКИ И ЛЕЧЕНИЯ\s+([^\n]{5,150})",
        text, re.IGNORECASE,
    )
    if m:
        return m.group(1).strip()
    return source_file.replace(".pdf", "").strip()


def extract_sections(text: str) -> dict[str, str]:
    sections = {}
    for key, pat in _SECTION_PATTERNS.items():
        m = pat.search(text)
        if m:
            sections[key] = m.group(1).strip()[:MAX_CHARS_PER_CHUNK]
    return sections


def build_chunks(record: dict) -> list[tuple[str, dict]]:
    """
    Улучшенная стратегия чанкинга:
    1. Маленькие чанки (до 1000 симв) для четких векторов.
    2. Обязательное включение названия протокола в текст чанка.
    3. Привязка ICD-10 кодов к каждому чанку для LLM.
    """
    raw_text  = record.get("text", "")
    source    = record.get("source_file", "unknown")
    protocol  = record.get("protocol_id", "")
    icd_codes = record.get("icd_codes", [])
    real_name = extract_protocol_name(raw_text, source)

    # Метаданные, которые полетят в Qdrant
    base_payload = {
        "title":       real_name,
        "source_file": source,
        "protocol_id": protocol,
        "icd_codes":   icd_codes,
    }

    sections = extract_sections(raw_text)
    chunks: list[tuple[str, dict]] = []

    # Лимит символов для более точного фокуса вектора
    CHUNK_LIMIT = 1000 

    # 1. Секция КЛИНИКА (симптомы + диагностика) - самая важная для поиска по жалобам
    clinical_text = " ".join(filter(None, [
        sections.get("symptoms", ""),
        sections.get("diagnosis", ""),
    ])).strip()

    if clinical_text:
        # Разбиваем длинную клиническую картину на части, если она огромная
        parts = [clinical_text[i:i+CHUNK_LIMIT] for i in range(0, len(clinical_text), CHUNK_LIMIT)]
        for i, part in enumerate(parts):
            # В текст для эмбеддинга добавляем название, чтобы вектор "знал" о чем речь
            text_for_embedding = f"Протокол: {real_name}. Клиническая картина: {part}"
            
            payload = {**base_payload, "chunk_type": "clinical", "chunk_index": i, "text": part}
            chunks.append((text_for_embedding, payload))

    # 2. Секция ЛЕЧЕНИЕ
    treatment_text = sections.get("treatment", "").strip()
    if treatment_text:
        parts = [treatment_text[i:i+CHUNK_LIMIT] for i in range(0, len(treatment_text), CHUNK_LIMIT)]
        for i, part in enumerate(parts):
            text_for_embedding = f"Протокол: {real_name}. Лечение и тактика: {part}"
            
            payload = {**base_payload, "chunk_type": "treatment", "chunk_index": i, "text": part}
            chunks.append((text_for_embedding, payload))

    # 3. Фолбек (если регексы не сработали)
    if not chunks:
        body = raw_text[600:] # Пропуск бюрократии
        step = 800
        for i, start in enumerate(range(0, min(len(body), 5000), step)):
            part = body[start : start + CHUNK_LIMIT].strip()
            if len(part) < 150: continue
            
            text_for_embedding = f"Протокол: {real_name}. Содержание: {part}"
            payload = {**base_payload, "chunk_type": "sliding", "chunk_index": i, "text": part}
            chunks.append((text_for_embedding, payload))

    return chunks

# ─── Утилиты ─────────────────────────────────────────────────────────────────

def make_id(key: str) -> str:
    h = hashlib.md5(key.encode()).hexdigest()
    return f"{h[:8]}-{h[8:12]}-{h[12:16]}-{h[16:20]}-{h[20:32]}"


def load_jsonl(path: str) -> list[dict]:
    records = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                records.append(json.loads(line))
    print(f"Загружено записей: {len(records)}")
    return records


# ─── Шаг 1: эмбеддинги → кэш ────────────────────────────────────────────────

def encode_and_cache(records: list[dict], model: SentenceTransformer, cache_path: str) -> None:
    cached_ids: set[str] = set()
    if Path(cache_path).exists():
        with open(cache_path, encoding="utf-8") as f:
            for line in f:
                if line.strip():
                    cached_ids.add(json.loads(line)["id"])
        print(f"Найден кэш: {len(cached_ids)} точек, докодируем остальные...")

    all_items: list[tuple[str, str, dict]] = []
    skipped = 0

    for record in tqdm(records, desc="Подготовка чанков"):
        if not record.get("text", "").strip():
            skipped += 1
            continue
        if not record.get("icd_codes"):
            skipped += 1
            continue

        source   = record.get("source_file", "unknown")
        protocol = record.get("protocol_id", "")

        for text, payload in build_chunks(record):
            id_key   = f"{source}__{protocol}__{payload['chunk_index']}__{payload['chunk_type']}"
            point_id = make_id(id_key)
            if point_id in cached_ids:
                continue
            all_items.append((text, point_id, payload))

    if skipped:
        print(f"Пропущено (невалидных): {skipped}")

    if not all_items:
        print("Все точки уже в кэше.")
        return

    print(f"\nКодирование {len(all_items)} чанков (батч={BATCH_SIZE})...")

    with open(cache_path, "a", encoding="utf-8") as cache_f:
        for start in tqdm(range(0, len(all_items), BATCH_SIZE), desc="Эмбеддинги"):
            batch   = all_items[start : start + BATCH_SIZE]
            texts   = [item[0] for item in batch]

            # bge-m3 не требует префиксов "passage:" при индексировании
            vectors = model.encode(
                texts,
                show_progress_bar=False,
                normalize_embeddings=True,
                batch_size=BATCH_SIZE,
                prompt_name="document"
            )

            for (_, point_id, payload), vector in zip(batch, vectors):
                row = {"id": point_id, "vector": vector.tolist(), "payload": payload}
                cache_f.write(json.dumps(row, ensure_ascii=False) + "\n")

    total = len(cached_ids) + len(all_items)
    print(f"✅ Кэш сохранён: {cache_path} ({total} точек)")


# ─── Шаг 2: кэш → Qdrant ─────────────────────────────────────────────────────

def upload_from_cache(client: QdrantClient, cache_path: str) -> None:
    if not Path(cache_path).exists():
        raise FileNotFoundError(f"Кэш не найден: {cache_path}. Запустите --encode-only сначала.")

    print("Проверка уже загруженных точек в Qdrant...")
    existing_ids: set[str] = set()
    offset = None
    while True:
        result, offset = client.scroll(
            collection_name=COLLECTION_NAME,
            limit=1000, offset=offset,
            with_payload=False, with_vectors=False,
        )
        for p in result:
            existing_ids.add(str(p.id))
        if offset is None:
            break
    print(f"  В Qdrant уже {len(existing_ids)} точек.")

    with open(cache_path, encoding="utf-8") as f:
        lines = [l for l in f if l.strip()]

    batch: list[PointStruct] = []
    total_uploaded = 0
    skipped = 0

    for line in tqdm(lines, desc="Загрузка в Qdrant"):
        row = json.loads(line)
        if row["id"] in existing_ids:
            skipped += 1
            continue
        batch.append(PointStruct(id=row["id"], vector=row["vector"], payload=row["payload"]))
        if len(batch) >= 256:
            client.upsert(collection_name=COLLECTION_NAME, points=batch)
            total_uploaded += len(batch)
            batch = []

    if batch:
        client.upsert(collection_name=COLLECTION_NAME, points=batch)
        total_uploaded += len(batch)

    print(f"✅ Загружено: {total_uploaded} новых точек (пропущено: {skipped})")


# ─── Коллекция ───────────────────────────────────────────────────────────────

def create_collection(client: QdrantClient) -> None:
    existing = {c.name for c in client.get_collections().collections}
    if COLLECTION_NAME in existing:
        info = client.get_collection(COLLECTION_NAME)
        size = info.config.params.vectors.size
        if size != VECTOR_SIZE:
            print(f"  ⚠️  Пересоздаём коллекцию (dim={size} → {VECTOR_SIZE})...")
            client.delete_collection(COLLECTION_NAME)
        else:
            print(f"Коллекция '{COLLECTION_NAME}' уже существует (dim={size}).")
            return

    client.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
        optimizers_config=OptimizersConfigDiff(indexing_threshold=20_000),
    )
    print(f"Коллекция '{COLLECTION_NAME}' создана (dim={VECTOR_SIZE}).")


# ─── Поиск ───────────────────────────────────────────────────────────────────

def demo_search(client: QdrantClient, model: SentenceTransformer, query: str) -> None:
    try:
        query_vector = model.encode(query, normalize_embeddings=True, prompt_name="query").tolist()
    except Exception:
        query_vector = model.encode(query, normalize_embeddings=True).tolist()

    results = client.query_points(
        collection_name=COLLECTION_NAME,
        query=query_vector,
        limit=5,
        with_payload=True,
    ).points  # <- .points в конце обязательно

    print(f"\n{'='*60}")
    print(f"Поиск: '{query}'")
    print('='*60)
    for i, r in enumerate(results, 1):
        p = r.payload
        print(f"\n[{i}] score={r.score:.4f}")
        print(f"    📋 {p.get('title', p.get('source_file'))}")
        print(f"    🏥 МКБ: {', '.join(p.get('icd_codes', [])[:5])}")
        print(f"    📄 Тип: {p.get('chunk_type', '?')}")
        print(f"    💬 {p.get('text', '')[:200]}...")


# ─── Точка входа ─────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Загрузка медпротоколов в Qdrant (bge-m3 + MPS)")
    parser.add_argument("--input",       required=True,           help="Путь к .jsonl файлу")
    parser.add_argument("--url",         default=QDRANT_URL,      help="URL Qdrant сервера")
    parser.add_argument("--cache",       default=CACHE_FILE,      help="Путь к кэшу эмбеддингов")
    parser.add_argument("--query",       default=None,            help="Тестовый запрос после загрузки")
    parser.add_argument("--encode-only", action="store_true",     help="Только эмбеддинги, без Qdrant")
    parser.add_argument("--upload-only", action="store_true",     help="Только загрузка из кэша")
    parser.add_argument("--model",       default=EMBEDDING_MODEL, help="Модель эмбеддингов")
    args = parser.parse_args()

    if not Path(args.input).exists():
        raise FileNotFoundError(f"Файл не найден: {args.input}")

    model = None

    if not args.upload_only:
        device = get_device()
        print(f"Загрузка модели: {args.model}")
        model = SentenceTransformer(args.model, device=device)

        if device == "mps":
            print("Прогрев MPS...")
            model.encode(["тест"], show_progress_bar=False)

        records = load_jsonl(args.input)
        encode_and_cache(records, model, args.cache)

    if args.encode_only:
        print(f"\nРежим --encode-only завершён. Кэш: {args.cache}")
        return

    print(f"\nПодключение к Qdrant: {args.url}")
    qdrant_client = QdrantClient(url=args.url)
    create_collection(qdrant_client)
    upload_from_cache(qdrant_client, args.cache)
    print(f"\n✅ Готово! Коллекция: {COLLECTION_NAME}")

    if model is None:
        device = get_device()
        model = SentenceTransformer(args.model, device=device)

    query = args.query or "HELLP синдром лечение"
    demo_search(qdrant_client, model, query)


if __name__ == "__main__":
    main()