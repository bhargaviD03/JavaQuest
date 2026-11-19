from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.learning import Lesson, LessonProgress
from schemas.learning import ModuleResponse, LessonProgressUpdate
from services.auth_service import get_current_user
from services.roadmap_service import get_roadmap_for_user
from services.gamification_service import award_xp

router = APIRouter(prefix="/roadmap", tags=["Roadmap"])

@router.get("/", response_model=list[ModuleResponse])
def get_roadmap(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return get_roadmap_for_user(db, current_user)

@router.put("/lessons/{lesson_id}/status")
def update_lesson_status(
    lesson_id: int,
    data: LessonProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson_id
    ).first()

    if not progress:
        progress = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson_id,
            status=data.status
        )
        db.add(progress)
    else:
        progress.status = data.status

    if data.status in ["completed", "mastered"]:
        progress.completed_at = datetime.now(timezone.utc)
        award_xp(
            db=db,
            user=current_user,
            amount=20,
            reason=f"Completed Lesson: {lesson.title}",
            reference_type="lesson",
            reference_id=f"lesson_{lesson.id}"
        )

    db.commit()
    return {"status": "success", "lesson_id": lesson_id, "new_status": data.status}
