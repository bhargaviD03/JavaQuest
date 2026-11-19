from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field

class CompanionSessionCreate(BaseModel):
    space_id: int
    question_id: int
    title: Optional[str] = "Shared Challenge Session"

class CompanionSubmissionCreate(BaseModel):
    answer: str = Field(..., min_length=1)
    reasoning: Optional[str] = None
    reflection_notes: Optional[str] = None

class SubmissionDetail(BaseModel):
    user_id: int
    username: str
    avatar: str
    role: str
    answer: Optional[str] = None  # None if not revealed yet
    reasoning: Optional[str] = None  # None if not revealed yet
    reflection_notes: Optional[str] = None
    submitted_at: datetime
    has_submitted: bool = True

class CompanionSessionResponse(BaseModel):
    id: int
    space_id: int
    question_id: int
    title: str
    status: str  # 'open', 'one_submitted', 'both_revealed', 'completed'
    created_at: datetime
    revealed_at: Optional[datetime] = None
    question: Optional[Any] = None
    can_reveal: bool = False
    both_submitted: bool = False
    current_user_submitted: bool = False
    submissions: List[SubmissionDetail] = []

    class Config:
        from_attributes = True
