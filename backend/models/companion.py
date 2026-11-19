from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class CompanionChallengeSession(Base):
    __tablename__ = "companion_challenge_sessions"

    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(Integer, ForeignKey("learning_spaces.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Shared Challenge Arena Session")
    status = Column(String(50), default="open")  # 'open', 'one_submitted', 'both_revealed', 'completed'
    created_at = Column(DateTime(timezone=True), default=utcnow)
    revealed_at = Column(DateTime(timezone=True), nullable=True)

    space = relationship("LearningSpace", back_populates="companion_sessions")
    question = relationship("QuestionBank", back_populates="companion_sessions")
    submissions = relationship("CompanionSubmission", back_populates="session", cascade="all, delete-orphan")

class CompanionSubmission(Base):
    __tablename__ = "companion_submissions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("companion_challenge_sessions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    answer = Column(Text, nullable=False)
    reasoning = Column(Text, nullable=True)
    reflection_notes = Column(Text, nullable=True)
    submitted_at = Column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (
        UniqueConstraint("session_id", "user_id", name="uq_session_user_submission"),
    )

    session = relationship("CompanionChallengeSession", back_populates="submissions")
    user = relationship("User", back_populates="companion_submissions")
