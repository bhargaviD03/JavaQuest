from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class GameLevel(Base):
    __tablename__ = "game_levels"

    id = Column(Integer, primary_key=True, index=True)
    game_id = Column(String(50), index=True, nullable=False)
    level_number = Column(Integer, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    topic = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), default="Beginner")
    learning_objective = Column(Text, nullable=False)
    scenario = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=False)
    solution_code = Column(Text, nullable=True)
    solution_hint = Column(Text, nullable=True)
    test_cases = Column(JSON, nullable=True)
    expected_output = Column(Text, nullable=True)
    xp_reward = Column(Integer, default=50)
    created_at = Column(DateTime(timezone=True), default=utcnow)
