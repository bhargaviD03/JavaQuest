from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class DailySession(Base):
    __tablename__ = "daily_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    institute_topic = Column(String(200), nullable=False)
    taught_summary = Column(Text, nullable=True)
    understood_summary = Column(Text, nullable=True)
    difficulty_notes = Column(Text, nullable=True)
    additional_notes = Column(Text, nullable=True)
    planned_minutes = Column(Integer, default=45)
    actual_minutes = Column(Integer, default=0)
    status = Column(String(50), default="active")  # 'active', 'completed', 'abandoned'
    created_at = Column(DateTime(timezone=True), default=utcnow)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="daily_sessions")
    items = relationship("DailySessionItem", back_populates="session", cascade="all, delete-orphan", order_by="DailySessionItem.order_index")

class DailySessionItem(Base):
    __tablename__ = "daily_session_items"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("daily_sessions.id", ondelete="CASCADE"), nullable=False)
    item_type = Column(String(50), nullable=False)  # 'explanation', 'analogy', 'code_example', 'line_by_line', 'predict_output', 'debugging', 'bank_challenge', 'knowledge_check', 'reflection'
    title = Column(String(200), nullable=False)
    order_index = Column(Integer, default=0, nullable=False)
    content = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    metadata_json = Column(JSON, nullable=True)  # stores interactive fields, questions, answers, bank question reference
    is_completed = Column(Boolean, default=False)
    user_response = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    session = relationship("DailySession", back_populates="items")
