from pydantic import BaseModel

from src.schemas.chat import ChatMessage


class SessionListItem(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    message_count: int


class SessionDetail(BaseModel):
    id: str
    title: str
    created_at: str
    updated_at: str
    messages: list[ChatMessage]


class PaginatedResponse(BaseModel):
    items: list[SessionListItem]
    total: int
    page: int
    per_page: int
