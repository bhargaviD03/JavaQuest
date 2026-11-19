from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel

class QuestionAttemptCreate(BaseModel):
    submitted_answer: str
    self_assessment: Optional[str] = "understood"  # 'understood', 'struggled', 'needs_revision'

class QuestionAttemptResponse(BaseModel):
    id: int
    question_id: int
    submitted_answer: str
    is_correct: bool
    self_assessment: Optional[str] = None
    ai_feedback: Optional[str] = None
    xp_awarded: int
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionBankItem(BaseModel):
    id: int
    canonical_id: str
    title: str
    topic: str
    difficulty: str
    question_type: str
    prompt: str
    hint: Optional[str] = None
    learning_objectives: Optional[List[str]] = None
    solution_guidance: Optional[str] = None  # None until attempted
    source_type: str
    language: str
    has_attempted: bool = False
    is_bookmarked: bool = False
    latest_attempt: Optional[QuestionAttemptResponse] = None

    class Config:
        from_attributes = True

class ExternalChallengeResponse(BaseModel):
    id: int
    platform: str
    title: str
    url: str
    topic: str
    difficulty: str
    user_status: str = "not_started"
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class ExternalProgressUpdate(BaseModel):
    status: str  # 'not_started', 'attempted', 'solved', 'needs_revision'
    notes: Optional[str] = None
