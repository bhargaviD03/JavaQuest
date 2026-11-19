from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class QuestionBank(Base):
    __tablename__ = "question_bank"

    id = Column(Integer, primary_key=True, index=True)
    canonical_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g. "JQ-001"
    title = Column(String(255), nullable=False)
    topic = Column(String(100), index=True, nullable=False)
    difficulty = Column(String(50), index=True, nullable=False)  # 'Easy', 'Medium', 'Hard'
    question_type = Column(String(50), index=True, nullable=False)  # 'Code design', 'Predict output', 'Debugging', 'Explain code', 'Coding', 'Knowledge check', 'Mini design challenge'
    prompt = Column(Text, nullable=False)
    hint = Column(Text, nullable=True)
    learning_objectives = Column(JSON, nullable=True)  # list of strings
    solution_guidance = Column(Text, nullable=True)
    source_type = Column(String(50), default="javaquest_original")
    external_reference = Column(String(255), nullable=True)
    language = Column(String(50), default="Java")
    is_ai_generated = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    attempts = relationship("QuestionAttempt", back_populates="question", cascade="all, delete-orphan")
    bookmarks = relationship("QuestionBookmark", back_populates="question", cascade="all, delete-orphan")
    companion_sessions = relationship("CompanionChallengeSession", back_populates="question")

class QuestionAttempt(Base):
    __tablename__ = "question_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    submitted_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, default=True)
    self_assessment = Column(String(50), nullable=True)  # 'understood', 'struggled', 'needs_revision'
    ai_feedback = Column(Text, nullable=True)
    xp_awarded = Column(Integer, default=20)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="question_attempts")
    question = relationship("QuestionBank", back_populates="attempts")

class QuestionBookmark(Base):
    __tablename__ = "question_bookmarks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("question_bank.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    user = relationship("User", back_populates="question_bookmarks")
    question = relationship("QuestionBank", back_populates="bookmarks")

class ExternalChallenge(Base):
    __tablename__ = "external_challenges"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String(50), nullable=False)  # 'HackerRank', 'LeetCode'
    title = Column(String(255), nullable=False)
    url = Column(String(500), nullable=False)
    topic = Column(String(100), nullable=False)
    difficulty = Column(String(50), default="Practice")

    progress_records = relationship("ExternalChallengeProgress", back_populates="challenge", cascade="all, delete-orphan")

class ExternalChallengeProgress(Base):
    __tablename__ = "external_challenge_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("external_challenges.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(50), default="not_started")  # 'not_started', 'attempted', 'solved', 'needs_revision'
    notes = Column(Text, nullable=True)
    last_attempted_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="external_progress")
    challenge = relationship("ExternalChallenge", back_populates="progress_records")
