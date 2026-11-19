from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class MilestoneUpdate(BaseModel):
    is_completed: bool = True
    learner_code: Optional[str] = None
    learner_reflection: Optional[str] = None

class MilestoneResponse(BaseModel):
    id: int
    milestone_index: int
    milestone_title: str
    is_completed: bool
    learner_code: Optional[str] = None
    learner_reflection: Optional[str] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ProjectResponse(BaseModel):
    id: int
    title: str
    slug: str
    level: str
    objective: str
    requirements: List[str]
    concepts_covered: List[str]
    starter_code: Optional[str] = None
    order_index: int
    user_completed_milestones: int = 0
    total_milestones: int = 0
    is_completed: bool = False
    milestones: List[MilestoneResponse] = []

    class Config:
        from_attributes = True
