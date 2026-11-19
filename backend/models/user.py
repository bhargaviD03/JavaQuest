from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="learner", nullable=False)  # 'learner' or 'companion'
    avatar = Column(String(100), default="cat-coder")
    level = Column(Integer, default=1, nullable=False)
    total_xp = Column(Integer, default=0, nullable=False)
    current_streak = Column(Integer, default=1, nullable=False)
    last_active_at = Column(DateTime(timezone=True), default=utcnow)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    space_memberships = relationship("LearningSpaceMember", back_populates="user", cascade="all, delete-orphan")
    created_spaces = relationship("LearningSpace", back_populates="creator")
    lesson_progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    question_attempts = relationship("QuestionAttempt", back_populates="user", cascade="all, delete-orphan")
    question_bookmarks = relationship("QuestionBookmark", back_populates="user", cascade="all, delete-orphan")
    external_progress = relationship("ExternalChallengeProgress", back_populates="user", cascade="all, delete-orphan")
    daily_sessions = relationship("DailySession", back_populates="user", cascade="all, delete-orphan")
    mentor_conversations = relationship("MentorConversation", back_populates="user", cascade="all, delete-orphan")
    xp_transactions = relationship("XPTransaction", back_populates="user", cascade="all, delete-orphan")
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    daily_activities = relationship("DailyActivity", back_populates="user", cascade="all, delete-orphan")
    companion_submissions = relationship("CompanionSubmission", back_populates="user", cascade="all, delete-orphan")
    project_milestones = relationship("ProjectMilestone", back_populates="user", cascade="all, delete-orphan")

class LearningSpace(Base):
    __tablename__ = "learning_spaces"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    invite_code = Column(String(50), unique=True, index=True, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    creator = relationship("User", back_populates="created_spaces")
    members = relationship("LearningSpaceMember", back_populates="space", cascade="all, delete-orphan")
    companion_sessions = relationship("CompanionChallengeSession", back_populates="space", cascade="all, delete-orphan")

class LearningSpaceMember(Base):
    __tablename__ = "learning_space_members"

    id = Column(Integer, primary_key=True, index=True)
    space_id = Column(Integer, ForeignKey("learning_spaces.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role_in_space = Column(String(50), default="member")  # 'owner', 'learner', 'companion'
    joined_at = Column(DateTime(timezone=True), default=utcnow)

    space = relationship("LearningSpace", back_populates="members")
    user = relationship("User", back_populates="space_memberships")
