import aiosqlite
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response

from src.database import get_db
from src.api.deps import get_current_user
from src.services.export_service import generate_json_export, generate_pdf
from src.services.history_service import get_session

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/{session_id}/pdf")
async def export_pdf(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    session = await get_session(db, session_id, user_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    pdf_bytes = generate_pdf(session.title, session.messages)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="freaxlab-{session_id[:8]}.pdf"'},
    )


@router.get("/{session_id}/json")
async def export_json(
    session_id: str,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    session = await get_session(db, session_id, user_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    json_str = generate_json_export(session.title, session.messages)
    return Response(
        content=json_str,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="freaxlab-{session_id[:8]}.json"'},
    )
