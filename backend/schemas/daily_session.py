from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class DailySessionCreate(BaseModel):
    institute_topic: str = Field(..., min_length=2, max_length=200)
    taught_summary: Optional[str] = None
    understood_summary: Optional[str] = None
    difficulty_notes: Optional[str] = None
    additional_notes: Optional[str] = None
    planned_minutes: int = 45

class DailySessionItemResponse(BaseModel):
    id: int
    session_id: int
    item_type: str
    title: str
    order_index: int
    content: str
    code_snippet: Optional[str] = None
    metadata_json: Optional[Any] = None
    is_completed: bool = False
    user_response: Optional[str] = None

    class Config:
        from_attributes = True

class SessionItemComplete(BaseModel):
    user_response: Optional[str] = None

class DailySessionResponse(BaseModel):
    id: int
    user_id: int
    institute_topic: str
    taught_summary: Optional[str] = None
    understood_summary: Optional[str] = None
    difficulty_notes: Optional[str] = None
    additional_notes: Optional[str] = None
    planned_minutes: int
    actual_minutes: int
    status: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    items: List[DailySessionItemResponse] = []

    class Config:
        from_attributes = True
