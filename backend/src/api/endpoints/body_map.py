from fastapi import APIRouter, Depends, Request

import aiosqlite

from src.database import get_db
from src.api.deps import get_current_user
from src.schemas.body_map import BodyMapDiagnoseRequest, BodyZone
from src.schemas.chat import ChatMessageResponse
from src.services.body_map_service import BODY_ZONES, zones_to_symptoms_text
from src.services.chat_service import process_chat_message
from src.services.ml_service import MedicalDiagnosisService

router = APIRouter(tags=["body-map"])


@router.get("/body-map/zones", response_model=list[BodyZone])
async def get_zones():
    return BODY_ZONES


@router.post("/diagnose/by-body-map", response_model=ChatMessageResponse)
async def diagnose_by_body_map(
    body: BodyMapDiagnoseRequest,
    request: Request,
    user_id: str = Depends(get_current_user),
    db: aiosqlite.Connection = Depends(get_db),
):
    symptoms_text = zones_to_symptoms_text(body.zone_ids, body.lang)
    if body.additional_symptoms:
        symptoms_text += f", {body.additional_symptoms}"

    ml_service: MedicalDiagnosisService = request.app.state.ml_service
    return await process_chat_message(db, ml_service, user_id, None, symptoms_text)
