from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class MentorConversation(Base):
    __tablename__ = "mentor_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(200), default="Java Mentor Session", nullable=False)
    mode = Column(String(50), default="explain", nullable=False)  # 'explain', 'python_vs_java', 'debug', 'progressive_hint', 'quiz', 'explain_back'
    topic_context = Column(String(150), nullable=True)
    is_private = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="mentor_conversations")
    messages = relationship("MentorMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="MentorMessage.id")

class MentorMessage(Base):
    __tablename__ = "mentor_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("mentor_conversations.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), nullable=False)  # 'user', 'assistant', 'system'
    content = Column(Text, nullable=False)
    code_snippet = Column(Text, nullable=True)
    hint_level = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    conversation = relationship("MentorConversation", back_populates="messages")
