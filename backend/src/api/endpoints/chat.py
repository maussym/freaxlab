import aiosqlite
from fastapi import APIRouter, Depends, Request

from src.database import get_db
from src.api.deps import get_current_user
from src.schemas.chat import ChatMessage, ChatMessageRequest, ChatMessageResponse
from src.services.chat_service import get_messages, process_chat_message
from src.services.ml_service import MedicalDiagnosisService

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/message", response_model=ChatMessageResponse)
async def send_message(
    body: ChatMessageRequest,
    request: Request,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    ml_service: MedicalDiagnosisService = request.app.state.ml_service
    return await process_chat_message(db, ml_service, user_id, body.session_id, body.message)


@router.get("/{session_id}/messages", response_model=list[ChatMessage])
async def list_messages(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    cursor = await db.execute(
        "SELECT id FROM diagnosis_sessions WHERE id = ? AND user_id = ?",
        (session_id, user_id),
    )
    if not await cursor.fetchone():
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    return await get_messages(db, session_id)
