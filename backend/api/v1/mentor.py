from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.mentor import MentorConversation, MentorMessage
from schemas.mentor import ConversationCreate, MessageCreate, ConversationResponse, MessageResponse
from services.auth_service import get_current_user
from services.ai_service import AIMentorService

router = APIRouter(prefix="/mentor", tags=["AI Java Mentor"])

@router.post("/conversations", response_model=ConversationResponse)
def create_conversation(
    data: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = MentorConversation(
        user_id=current_user.id,
        title=data.title or f"{data.mode.capitalize()} - {data.topic_context}",
        mode=data.mode,
        topic_context=data.topic_context,
        is_private=True
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)

    # Add initial greeting message from Mentor
    initial_prompt = (
        f"Hi {current_user.username}! I am your JavaQuest Mentor. "
        f"We are in **{data.mode.upper().replace('_', ' ')}** focusing on **{data.topic_context}**.\n"
        "How can I help you strengthen your understanding today?"
    )
    msg = MentorMessage(
        conversation_id=conv.id,
        role="assistant",
        content=initial_prompt
    )
    db.add(msg)
    db.commit()
    db.refresh(conv)
    return conv

@router.get("/conversations", response_model=list[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(MentorConversation).filter(
        MentorConversation.user_id == current_user.id
    ).order_by(MentorConversation.updated_at.desc()).all()

@router.get("/conversations/{conv_id}", response_model=ConversationResponse)
def get_conversation(
    conv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(MentorConversation).filter(
        MentorConversation.id == conv_id,
        MentorConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv

@router.post("/conversations/{conv_id}/messages", response_model=MessageResponse)
async def send_message(
    conv_id: int,
    data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(MentorConversation).filter(
        MentorConversation.id == conv_id,
        MentorConversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Save user message
    user_msg = MentorMessage(
        conversation_id=conv.id,
        role="user",
        content=data.content,
        code_snippet=data.code_snippet,
        hint_level=data.hint_level or 0
    )
    db.add(user_msg)
    db.commit()

    # Build history for AI
    history = [
        {"role": m.role, "content": m.content}
        for m in conv.messages
    ]

    # Generate AI mentor response
    reply_text = await AIMentorService.generate_response(
        mode=conv.mode,
        topic_context=conv.topic_context,
        messages_history=history,
        new_user_message=data.content,
        hint_level=data.hint_level or 0
    )

    assistant_msg = MentorMessage(
        conversation_id=conv.id,
        role="assistant",
        content=reply_text,
        hint_level=data.hint_level or 0
    )
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)
    return assistant_msg
