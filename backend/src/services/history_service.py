import aiosqlite

from src.schemas.history import PaginatedResponse, SessionDetail, SessionListItem
from src.services.chat_service import get_messages


async def list_sessions(
    db: aiosqlite.Connection, user_id: str, page: int = 1, per_page: int = 20
) -> PaginatedResponse:
    count_cursor = await db.execute(
        "SELECT COUNT(*) FROM diagnosis_sessions WHERE user_id = ?", (user_id,)
    )
    total = (await count_cursor.fetchone())[0]

    offset = (page - 1) * per_page
    cursor = await db.execute(
        "SELECT s.id, s.title, s.created_at, s.updated_at, "
        "(SELECT COUNT(*) FROM chat_messages WHERE session_id = s.id) AS message_count "
        "FROM diagnosis_sessions s WHERE s.user_id = ? "
        "ORDER BY s.updated_at DESC LIMIT ? OFFSET ?",
        (user_id, per_page, offset),
    )
    rows = await cursor.fetchall()

    items = [
        SessionListItem(
            id=row["id"],
            title=row["title"],
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            message_count=row["message_count"],
        )
        for row in rows
    ]

    return PaginatedResponse(items=items, total=total, page=page, per_page=per_page)


async def get_session(
    db: aiosqlite.Connection, session_id: str, user_id: str
) -> SessionDetail | None:
    cursor = await db.execute(
        "SELECT id, title, created_at, updated_at FROM diagnosis_sessions WHERE id = ? AND user_id = ?",
        (session_id, user_id),
    )
    row = await cursor.fetchone()
    if not row:
        return None

    messages = await get_messages(db, session_id)

    return SessionDetail(
        id=row["id"],
        title=row["title"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        messages=messages,
    )


async def delete_session(db: aiosqlite.Connection, session_id: str, user_id: str) -> bool:
    cursor = await db.execute(
        "DELETE FROM diagnosis_sessions WHERE id = ? AND user_id = ?",
        (session_id, user_id),
    )
    await db.commit()
    return cursor.rowcount > 0
