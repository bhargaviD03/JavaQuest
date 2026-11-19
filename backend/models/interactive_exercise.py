from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class InteractiveExercise(Base):
    __tablename__ = "interactive_exercises"

    id = Column(Integer, primary_key=True, index=True)
    canonical_id = Column(String(50), unique=True, index=True, nullable=False)
    exercise_type = Column(String(50), index=True, nullable=False)
    # Types: 'complete_code', 'bug_hunt', 'parsons_puzzle', 'predict_output', 'modernize_refactor', 'break_code', 'keyword_cloze'
    title = Column(String(255), nullable=False)
    topic = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), index=True, default="Medium")
    xp_reward = Column(Integer, default=50)
    prompt = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=True)
    scaffold_code = Column(Text, nullable=True)
    solution_code = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)
    hint = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    attempts = relationship("InteractiveExerciseAttempt", back_populates="exercise", cascade="all, delete-orphan")

class InteractiveExerciseAttempt(Base):
    __tablename__ = "interactive_exercise_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("interactive_exercises.id", ondelete="CASCADE"), nullable=False)
    submission_data = Column(JSON, nullable=False)
    is_correct = Column(Boolean, default=False)
    xp_awarded = Column(Integer, default=0)
    feedback = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User")
    exercise = relationship("InteractiveExercise", back_populates="attempts")
