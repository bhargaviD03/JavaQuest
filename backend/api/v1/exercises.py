from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.interactive_exercise import InteractiveExercise, InteractiveExerciseAttempt
from schemas.interactive_exercise import ExerciseResponse, ExerciseSubmission, ExerciseEvaluationResult
from services.auth_service import get_current_user
from services.exercise_service import evaluate_exercise_submission

router = APIRouter(prefix="/exercises", tags=["Interactive Exercises"])

@router.get("", response_model=List[ExerciseResponse])
def list_exercises(
    exercise_type: Optional[str] = Query(None, description="Filter by type: complete_code, bug_hunt, parsons_puzzle, predict_output, modernize_refactor, break_code, keyword_cloze"),
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(InteractiveExercise).filter(InteractiveExercise.is_active == True)
    if exercise_type:
        query = query.filter(InteractiveExercise.exercise_type == exercise_type)
    if topic:
        query = query.filter(InteractiveExercise.topic.ilike(f"%{topic}%"))
    if difficulty:
        query = query.filter(InteractiveExercise.difficulty == difficulty)

    exercises = query.order_by(InteractiveExercise.id.asc()).all()

    # Get user's solved exercises
    solved_ids = set(
        att.exercise_id
        for att in db.query(InteractiveExerciseAttempt.exercise_id).filter(
            InteractiveExerciseAttempt.user_id == current_user.id,
            InteractiveExerciseAttempt.is_correct == True
        ).all()
    )

    results = []
    for ex in exercises:
        res = ExerciseResponse.model_validate(ex)
        res.is_solved = (ex.id in solved_ids)
        results.append(res)

    return results

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise_detail(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ex = db.query(InteractiveExercise).filter(InteractiveExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Interactive exercise not found")

    is_solved = db.query(InteractiveExerciseAttempt).filter(
        InteractiveExerciseAttempt.user_id == current_user.id,
        InteractiveExerciseAttempt.exercise_id == ex.id,
        InteractiveExerciseAttempt.is_correct == True
    ).first() is not None

    res = ExerciseResponse.model_validate(ex)
    res.is_solved = is_solved
    return res

@router.post("/{exercise_id}/submit", response_model=ExerciseEvaluationResult)
def submit_exercise(
    exercise_id: int,
    submission: ExerciseSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ex = db.query(InteractiveExercise).filter(InteractiveExercise.id == exercise_id).first()
    if not ex:
        raise HTTPException(status_code=404, detail="Interactive exercise not found")

    result = evaluate_exercise_submission(
        db=db,
        user=current_user,
        exercise=ex,
        submission_data=submission.submission_data
    )
    return result
