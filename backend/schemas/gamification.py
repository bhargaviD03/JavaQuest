from datetime import datetime, date
from typing import Optional, List, Any
from pydantic import BaseModel

class XPTransactionResponse(BaseModel):
    id: int
    amount: int
    reason: str
    reference_type: str
    reference_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class AchievementResponse(BaseModel):
    id: int
    code: str
    title: str
    description: str
    icon: str
    xp_reward: int
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DailyActivityResponse(BaseModel):
    activity_date: date
    minutes_spent: int
    questions_attempted: int
    xp_earned: int

    class Config:
        from_attributes = True

class DashboardStats(BaseModel):
    greeting: str
    username: str
    role: str
    level: int
    total_xp: int
    current_streak: int
    xp_to_next_level: int
    progress_to_next_level: int  # percentage
    today_institute_topic: Optional[str] = None
    daily_challenge: Optional[Any] = None
    current_module: Optional[str] = None
    solution_accuracy: float = 0.0
    total_solved_questions: int = 0
    weekly_commits: int = 0
    learning_topics: List[str] = []
    revision_topics: List[str] = []
    recent_achievements: List[AchievementResponse] = []
    recent_attempts: List[Any] = []
    weekly_activity: List[DailyActivityResponse] = []
    companion_activity: Optional[Any] = None
