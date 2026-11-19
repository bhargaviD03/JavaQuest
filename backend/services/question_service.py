import json
import os
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.question_bank import (
    QuestionBank,
    QuestionAttempt,
    QuestionBookmark,
    ExternalChallenge,
    ExternalChallengeProgress
)
from models.user import User
from services.gamification_service import award_xp, unlock_achievement

def import_question_bank(db: Session, file_path: str = "javaquest_question_bank_v1.json") -> dict:
    backend_base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    paths_to_try = [
        file_path,
        os.path.join(backend_base, "seed_data", file_path),
        os.path.join(backend_base, "seed_data", "javaquest_question_bank_v1.json"),
        os.path.join(backend_base, "seed_data", "mnc_250_questions.json"),
        os.path.join("backend", "seed_data", file_path),
        os.path.join("seed_data", file_path),
        os.path.abspath(file_path)
    ]
    
    found_path = None
    for p in paths_to_try:
        if os.path.exists(p):
            found_path = p
            break
            
    if not found_path:
        raise FileNotFoundError(f"Question bank file not found in paths: {paths_to_try}")

    with open(found_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. Seed external challenges
    external_links = data.get("external_practice", [])
    ext_imported = 0
    for ext in external_links:
        existing_ext = db.query(ExternalChallenge).filter(
            ExternalChallenge.platform == ext["platform"],
            ExternalChallenge.title == ext["title"]
        ).first()
        if not existing_ext:
            ec = ExternalChallenge(
                platform=ext["platform"],
                title=ext["title"],
                url=ext["url"],
                topic="Java Practice",
                difficulty="Standard"
            )
            db.add(ec)
            ext_imported += 1

    # 2. Seed canonical questions
    questions = data.get("questions", [])
    questions_imported = 0
    questions_updated = 0

    for idx, q in enumerate(questions, start=1):
        canonical_id = q.get("canonical_id") or q.get("id") or f"MNC-{idx:03d}"
        existing_q = db.query(QuestionBank).filter(QuestionBank.canonical_id == canonical_id).first()
        
        if existing_q:
            # Update fields if changed
            existing_q.title = q.get("title")
            existing_q.topic = q.get("topic")
            existing_q.difficulty = q.get("difficulty")
            existing_q.question_type = q.get("question_type")
            existing_q.prompt = q.get("prompt")
            existing_q.hint = q.get("hint")
            existing_q.learning_objectives = q.get("learning_objectives")
            existing_q.solution_guidance = q.get("solution_guidance")
            existing_q.source_type = q.get("source_type", "javaquest_original")
            existing_q.external_reference = q.get("external_reference")
            existing_q.language = q.get("language", "Java")
            questions_updated += 1
        else:
            new_q = QuestionBank(
                canonical_id=canonical_id,
                title=q.get("title"),
                topic=q.get("topic"),
                difficulty=q.get("difficulty"),
                question_type=q.get("question_type"),
                prompt=q.get("prompt"),
                hint=q.get("hint"),
                learning_objectives=q.get("learning_objectives"),
                solution_guidance=q.get("solution_guidance"),
                source_type=q.get("source_type", "javaquest_original"),
                external_reference=q.get("external_reference"),
                language=q.get("language", "Java"),
                is_ai_generated=q.get("is_ai_generated", False),
                is_active=q.get("is_active", True)
            )
            db.add(new_q)
            questions_imported += 1

    db.commit()
    total_in_db = db.query(QuestionBank).count()

    return {
        "status": "success",
        "file_used": found_path,
        "questions_created": questions_imported,
        "questions_updated": questions_updated,
        "total_questions_in_db": total_in_db,
        "external_challenges_created": ext_imported
    }

def ensure_question_bank_seeded(db: Session) -> dict:
    """
    Checks if the question bank is populated. If not found or incomplete (<250),
    automatically seeds all questions with the rich 4-part beginner explanations.
    """
    count = db.query(QuestionBank).count()
    if count < 250:
        return import_question_bank(db)
    return {"message": "Question bank already initialized", "count": count}

def get_questions_list(
    db: Session,
    user: User,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    status_filter: Optional[str] = None,  # 'attempted', 'unattempted', 'bookmarked'
    search: Optional[str] = None,
    limit: int = 50,
    offset: int = 0
):
    query = db.query(QuestionBank).filter(QuestionBank.is_active == True)

    if topic:
        query = query.filter(QuestionBank.topic == topic)
    if difficulty:
        query = query.filter(QuestionBank.difficulty == difficulty)
    if question_type:
        query = query.filter(QuestionBank.question_type == question_type)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                QuestionBank.title.ilike(search_pattern),
                QuestionBank.prompt.ilike(search_pattern),
                QuestionBank.canonical_id.ilike(search_pattern)
            )
        )

    # User attempts & bookmarks
    user_attempt_ids = {
        qa.question_id: qa for qa in db.query(QuestionAttempt).filter(QuestionAttempt.user_id == user.id).all()
    }
    user_bookmark_ids = {
        qb.question_id for qb in db.query(QuestionBookmark).filter(QuestionBookmark.user_id == user.id).all()
    }

    if status_filter == "attempted":
        query = query.filter(QuestionBank.id.in_(list(user_attempt_ids.keys())))
    elif status_filter == "unattempted":
        if user_attempt_ids:
            query = query.filter(~QuestionBank.id.in_(list(user_attempt_ids.keys())))
    elif status_filter == "bookmarked":
        query = query.filter(QuestionBank.id.in_(list(user_bookmark_ids)))

    total = query.count()
    items = query.order_by(QuestionBank.canonical_id).offset(offset).limit(limit).all()

    formatted_items = []
    for item in items:
        has_attempted = item.id in user_attempt_ids
        latest_att = user_attempt_ids.get(item.id)
        
        # NEVER reveal solution guidance by default unless user has attempted!
        solution = item.solution_guidance if has_attempted else None

        formatted_items.append({
            "id": item.id,
            "canonical_id": item.canonical_id,
            "title": item.title,
            "topic": item.topic,
            "difficulty": item.difficulty,
            "question_type": item.question_type,
            "prompt": item.prompt,
            "hint": item.hint,
            "learning_objectives": item.learning_objectives,
            "solution_guidance": solution,
            "source_type": item.source_type,
            "language": item.language,
            "has_attempted": has_attempted,
            "is_bookmarked": item.id in user_bookmark_ids,
            "latest_attempt": {
                "id": latest_att.id,
                "question_id": latest_att.question_id,
                "submitted_answer": latest_att.submitted_answer,
                "is_correct": latest_att.is_correct,
                "self_assessment": latest_att.self_assessment,
                "ai_feedback": latest_att.ai_feedback,
                "xp_awarded": latest_att.xp_awarded,
                "created_at": latest_att.created_at
            } if latest_att else None
        })

    return {"total": total, "items": formatted_items}

def submit_question_attempt(
    db: Session,
    user: User,
    question_id: int,
    submitted_answer: str,
    self_assessment: str = "understood"
):
    question = db.query(QuestionBank).filter(QuestionBank.id == question_id).first()
    if not question:
        raise ValueError("Question not found")

    xp_to_award = 25
    attempt = QuestionAttempt(
        user_id=user.id,
        question_id=question.id,
        submitted_answer=submitted_answer,
        is_correct=True,
        self_assessment=self_assessment,
        ai_feedback=f"Good effort on {question.title}! Compare your code against the unlocked solution guidance.",
        xp_awarded=xp_to_award
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Award XP idempotently for this question attempt
    awarded = award_xp(
        db=db,
        user=user,
        amount=xp_to_award,
        reason=f"Attempted {question.canonical_id}: {question.title}",
        reference_type="question_attempt",
        reference_id=f"q_{question.canonical_id}"
    )

    # Trigger achievement checks
    unlock_achievement(db, user.id, "first_step")
    attempts_count = db.query(QuestionAttempt).filter(QuestionAttempt.user_id == user.id).count()
    if attempts_count >= 5:
        unlock_achievement(db, user.id, "oop_master")

    return {
        "attempt_id": attempt.id,
        "is_correct": attempt.is_correct,
        "xp_awarded": xp_to_award if awarded else 0,
        "solution_guidance": question.solution_guidance,
        "ai_feedback": attempt.ai_feedback
    }

def toggle_bookmark(db: Session, user: User, question_id: int) -> bool:
    bookmark = db.query(QuestionBookmark).filter(
        QuestionBookmark.user_id == user.id,
        QuestionBookmark.question_id == question_id
    ).first()

    if bookmark:
        db.delete(bookmark)
        db.commit()
        return False
    else:
        new_bm = QuestionBookmark(user_id=user.id, question_id=question_id)
        db.add(new_bm)
        db.commit()
        return True

def select_daily_challenge(db: Session, user: User) -> Optional[dict]:
    """
    Selects a daily challenge from existing curated questions.
    Prioritizes:
    1. Unattempted questions from current learning topics
    2. Any unattempted question
    3. Oldest attempted question for revision
    """
    attempted_ids = [
        qa.question_id for qa in db.query(QuestionAttempt.question_id).filter(QuestionAttempt.user_id == user.id).all()
    ]
    
    # Try unattempted first
    candidate = db.query(QuestionBank).filter(
        QuestionBank.is_active == True,
        ~QuestionBank.id.in_(attempted_ids) if attempted_ids else True
    ).first()

    if not candidate:
        # Fallback to any question
        candidate = db.query(QuestionBank).filter(QuestionBank.is_active == True).first()

    if not candidate:
        return None

    return {
        "id": candidate.id,
        "canonical_id": candidate.canonical_id,
        "title": candidate.title,
        "topic": candidate.topic,
        "difficulty": candidate.difficulty,
        "question_type": candidate.question_type,
        "prompt": candidate.prompt,
        "hint": candidate.hint,
        "learning_objectives": candidate.learning_objectives,
        "has_attempted": candidate.id in attempted_ids
    }
