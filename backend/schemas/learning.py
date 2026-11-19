from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel

class LessonProgressUpdate(BaseModel):
    status: str  # 'not_started', 'in_progress', 'practising', 'needs_revision', 'mastered'

class LessonResponse(BaseModel):
    id: int
    topic_id: int
    title: str
    content_markdown: str
    order_index: int
    estimated_minutes: int
    user_status: Optional[str] = "not_started"

    class Config:
        from_attributes = True

class TopicResponse(BaseModel):
    id: int
    module_id: int
    title: str
    slug: str
    description: Optional[str] = None
    order_index: int
    lessons_count: int = 0
    completed_count: int = 0
    status: str = "not_started"  # computed aggregate
    lessons: List[LessonResponse] = []

    class Config:
        from_attributes = True

class ModuleResponse(BaseModel):
    id: int
    code: str
    title: str
    description: Optional[str] = None
    order_index: int
    topics: List[TopicResponse] = []

    class Config:
        from_attributes = True
