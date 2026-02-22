import aiosqlite
from fastapi import APIRouter, Depends, HTTPException, Query, status

from src.database import get_db
from src.api.deps import get_current_user
from src.schemas.history import PaginatedResponse, SessionDetail
from src.services.history_service import delete_session, get_session, list_sessions

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=PaginatedResponse)
async def get_history(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    return await list_sessions(db, user_id, page, per_page)


@router.get("/{session_id}", response_model=SessionDetail)
async def get_history_detail(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    session = await get_session(db, session_id, user_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_history(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    deleted = await delete_session(db, session_id, user_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
