from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

class ConversationCreate(BaseModel):
    title: Optional[str] = "Java Mentor Session"
    mode: str = Field(default="explain", pattern="^(explain|python_vs_java|debug|progressive_hint|quiz|explain_back)$")
    topic_context: Optional[str] = "OOP Foundations"

class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1)
    code_snippet: Optional[str] = None
    hint_level: Optional[int] = 0

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    code_snippet: Optional[str] = None
    hint_level: int
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    mode: str
    topic_context: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
