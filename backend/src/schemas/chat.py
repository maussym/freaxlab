from pydantic import BaseModel


class ChatMessageRequest(BaseModel):
    session_id: str | None = None
    message: str


class DiagnosisItemOut(BaseModel):
    rank: int
    diagnosis: str
    icd10_code: str
    explanation: str


class ChatMessageResponse(BaseModel):
    session_id: str
    message_id: str
    content: str
    diagnoses: list[DiagnosisItemOut]


class ChatMessage(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    diagnoses: list[DiagnosisItemOut]
    created_at: str
