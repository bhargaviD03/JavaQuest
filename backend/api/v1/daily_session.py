from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.daily_session import DailySession
from schemas.daily_session import DailySessionCreate, DailySessionResponse, SessionItemComplete
from services.auth_service import get_current_user
from services.daily_session_service import create_daily_session, complete_session_item, finish_daily_session

router = APIRouter(prefix="/daily-session", tags=["Daily Institute Session"])

@router.post("/", response_model=DailySessionResponse)
def start_session(data: DailySessionCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = create_daily_session(db, current_user, data)
    return session

@router.get("/latest", response_model=DailySessionResponse)
def get_latest_session(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(DailySession).filter(
        DailySession.user_id == current_user.id
    ).order_by(DailySession.created_at.desc()).first()

    if not session:
        # Create a default introductory OOP session
        default_data = DailySessionCreate(
            institute_topic="Method Overloading and Method Overriding",
            taught_summary="Instructor explained compile-time polymorphism versus runtime dynamic dispatch in Java.",
            understood_summary="Overloading happens inside one class with different parameters.",
            difficulty_notes="How dynamic method dispatch determines which method executes when using a superclass reference."
        )
        session = create_daily_session(db, current_user, default_data)

    return session

@router.get("/{session_id}", response_model=DailySessionResponse)
def get_session(session_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    session = db.query(DailySession).filter(
        DailySession.id == session_id,
        DailySession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.post("/{session_id}/items/{item_id}/complete")
def complete_item(
    session_id: int,
    item_id: int,
    data: SessionItemComplete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(DailySession).filter(
        DailySession.id == session_id,
        DailySession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    item = complete_session_item(db, session_id, item_id, data.user_response)
    return {"status": "success", "item_id": item.id, "is_completed": item.is_completed}

@router.post("/{session_id}/finish")
def finish_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return finish_daily_session(db, current_user, session_id)
