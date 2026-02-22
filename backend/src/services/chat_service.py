import json
from uuid import uuid4

import aiosqlite

from src.schemas.chat import ChatMessage, ChatMessageResponse, DiagnosisItemOut
from src.services.ml_service import MedicalDiagnosisService


async def create_session(db: aiosqlite.Connection, user_id: str, title: str) -> str:
    session_id = uuid4().hex
    await db.execute(
        "INSERT INTO diagnosis_sessions (id, user_id, title) VALUES (?, ?, ?)",
        (session_id, user_id, title),
    )
    await db.commit()
    return session_id


async def save_message(
    db: aiosqlite.Connection,
    session_id: str,
    role: str,
    content: str,
    diagnoses: list[dict] | None = None,
) -> str:
    msg_id = uuid4().hex
    diagnoses_json = json.dumps(diagnoses, ensure_ascii=False) if diagnoses else None
    await db.execute(
        "INSERT INTO chat_messages (id, session_id, role, content, diagnoses_json) VALUES (?, ?, ?, ?, ?)",
        (msg_id, session_id, role, content, diagnoses_json),
    )
    await db.execute(
        "UPDATE diagnosis_sessions SET updated_at = datetime('now') WHERE id = ?",
        (session_id,),
    )
    await db.commit()
    return msg_id


async def get_messages(db: aiosqlite.Connection, session_id: str) -> list[ChatMessage]:
    cursor = await db.execute(
        "SELECT id, session_id, role, content, diagnoses_json, created_at "
        "FROM chat_messages WHERE session_id = ? ORDER BY created_at",
        (session_id,),
    )
    rows = await cursor.fetchall()
    messages = []
    for row in rows:
        diagnoses = []
        if row["diagnoses_json"]:
            raw = json.loads(row["diagnoses_json"])
            diagnoses = [DiagnosisItemOut(**d) for d in raw]
        messages.append(
            ChatMessage(
                id=row["id"],
                session_id=row["session_id"],
                role=row["role"],
                content=row["content"],
                diagnoses=diagnoses,
                created_at=row["created_at"],
            )
        )
    return messages


async def process_chat_message(
    db: aiosqlite.Connection,
    ml_service: MedicalDiagnosisService,
    user_id: str,
    session_id: str | None,
    message: str,
) -> ChatMessageResponse:
    if not session_id:
        title = message[:60].strip()
        session_id = await create_session(db, user_id, title)

    await save_message(db, session_id, "user", message)

    diagnosis_items = await ml_service.predict(message)
    diagnoses_data = [
        {"rank": d.rank, "diagnosis": d.diagnosis, "icd10_code": d.icd10_code, "explanation": d.explanation}
        for d in diagnosis_items
    ]

    response_lines = []
    for d in diagnosis_items:
        response_lines.append(f"{d.rank}. {d.diagnosis} ({d.icd10_code}) — {d.explanation}")
    response_content = "\n".join(response_lines)

    msg_id = await save_message(db, session_id, "assistant", response_content, diagnoses_data)

    return ChatMessageResponse(
        session_id=session_id,
        message_id=msg_id,
        content=response_content,
        diagnoses=[DiagnosisItemOut(**d) for d in diagnoses_data],
    )
