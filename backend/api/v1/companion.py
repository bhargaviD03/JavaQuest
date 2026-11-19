from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.companion import CompanionChallengeSession
from schemas.companion import (
    CompanionSessionCreate,
    CompanionSubmissionCreate,
    CompanionSessionResponse
)
from services.auth_service import get_current_user
from services.companion_service import (
    create_companion_session,
    submit_companion_challenge,
    get_companion_session_detail
)

router = APIRouter(prefix="/companion", tags=["Companion Mode"])

@router.post("/sessions")
def create_session(
    data: CompanionSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = create_companion_session(db, current_user, data)
    return get_companion_session_detail(db, current_user, session.id)

@router.get("/spaces/{space_id}/sessions")
def list_space_sessions(
    space_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(CompanionChallengeSession).filter(
        CompanionChallengeSession.space_id == space_id
    ).order_by(CompanionChallengeSession.created_at.desc()).all()
    return [get_companion_session_detail(db, current_user, s.id) for s in sessions]

@router.get("/sessions/{session_id}")
def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_companion_session_detail(db, current_user, session_id)

@router.post("/sessions/{session_id}/submit")
def submit_answer(
    session_id: int,
    data: CompanionSubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    submit_companion_challenge(db, current_user, session_id, data)
    return get_companion_session_detail(db, current_user, session_id)
