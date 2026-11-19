import os
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.question_bank import QuestionBank, QuestionAttempt
from schemas.question import QuestionAttemptCreate, QuestionAttemptResponse
from services.auth_service import get_current_user
from services.question_service import get_questions_list, submit_question_attempt, toggle_bookmark, select_daily_challenge

router = APIRouter(prefix="/questions", tags=["Question Bank"])

@router.get("/")
def list_questions(
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_questions_list(
        db=db,
        user=current_user,
        topic=topic,
        difficulty=difficulty,
        question_type=question_type,
        status_filter=status_filter,
        search=search,
        limit=limit,
        offset=offset
    )

@router.get("/daily/today")
def get_daily_challenge(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    challenge = select_daily_challenge(db, current_user)
    if not challenge:
        raise HTTPException(status_code=404, detail="No challenge available")
    return challenge

@router.get("/{question_id}")
def get_question(question_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    attempt = db.query(QuestionAttempt).filter(
        QuestionAttempt.user_id == current_user.id,
        QuestionAttempt.question_id == q.id
    ).first()

    has_attempted = (attempt is not None)
    return {
        "id": q.id,
        "canonical_id": q.canonical_id,
        "title": q.title,
        "topic": q.topic,
        "difficulty": q.difficulty,
        "question_type": q.question_type,
        "prompt": q.prompt,
        "hint": q.hint,
        "learning_objectives": q.learning_objectives,
        "solution_guidance": q.solution_guidance if has_attempted else None,
        "source_type": q.source_type,
        "language": q.language,
        "has_attempted": has_attempted,
        "latest_attempt": attempt
    }

@router.post("/{question_id}/attempt")
def submit_attempt(
    question_id: int,
    data: QuestionAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return submit_question_attempt(
        db=db,
        user=current_user,
        question_id=question_id,
        submitted_answer=data.submitted_answer,
        self_assessment=data.self_assessment or "understood"
    )

@router.post("/{question_id}/bookmark")
def bookmark_question(
    question_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    is_bookmarked = toggle_bookmark(db, current_user, question_id)
    return {"status": "success", "question_id": question_id, "is_bookmarked": is_bookmarked}

@router.get("/download/pdf")
def download_mnc_pdf():
    pdf_filename = "250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf"
    possible_paths = [
        os.path.join("frontend", "public", "downloads", pdf_filename),
        os.path.join("..", "frontend", "public", "downloads", pdf_filename),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "downloads", pdf_filename)),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return FileResponse(
                path=p,
                filename=pdf_filename,
                media_type="application/pdf"
            )
    raise HTTPException(status_code=404, detail="MNC Interview Guide PDF not found on server.")
