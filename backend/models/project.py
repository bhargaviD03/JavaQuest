from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    level = Column(String(50), default="beginner")  # 'beginner', 'intermediate', 'advanced'
    objective = Column(Text, nullable=False)
    requirements = Column(JSON, nullable=False)  # list of requirement strings
    concepts_covered = Column(JSON, nullable=False)  # list of concept strings
    starter_code = Column(Text, nullable=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    milestones = relationship("ProjectMilestone", back_populates="project", cascade="all, delete-orphan")

class ProjectMilestone(Base):
    __tablename__ = "project_milestones"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    milestone_index = Column(Integer, default=1, nullable=False)
    milestone_title = Column(String(200), nullable=False)
    is_completed = Column(Boolean, default=False)
    learner_code = Column(Text, nullable=True)
    learner_reflection = Column(Text, nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    __table_args__ = (
        UniqueConstraint("project_id", "user_id", "milestone_index", name="uq_project_user_milestone"),
    )

    project = relationship("Project", back_populates="milestones")
    user = relationship("User", back_populates="project_milestones")
