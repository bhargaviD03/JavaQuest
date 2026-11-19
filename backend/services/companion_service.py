from datetime import datetime, timezone
from typing import Optional, List
from fastapi import HTTPException
from sqlalchemy.orm import Session
from models.companion import CompanionChallengeSession, CompanionSubmission
from models.user import User, LearningSpace, LearningSpaceMember
from models.question_bank import QuestionBank
from schemas.companion import CompanionSessionCreate, CompanionSubmissionCreate
from services.gamification_service import award_xp, unlock_achievement

def create_companion_session(db: Session, user: User, data: CompanionSessionCreate) -> CompanionChallengeSession:
    # Verify user is member of space
    membership = db.query(LearningSpaceMember).filter(
        LearningSpaceMember.space_id == data.space_id,
        LearningSpaceMember.user_id == user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this learning space.")

    # Verify question exists
    question = db.query(QuestionBank).filter(QuestionBank.id == data.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    session = CompanionChallengeSession(
        space_id=data.space_id,
        question_id=data.question_id,
        title=data.title or f"Shared Challenge: {question.title}",
        status="open"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def submit_companion_challenge(
    db: Session,
    user: User,
    session_id: int,
    data: CompanionSubmissionCreate
) -> CompanionChallengeSession:
    session = db.query(CompanionChallengeSession).filter(CompanionChallengeSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    # Check membership
    membership = db.query(LearningSpaceMember).filter(
        LearningSpaceMember.space_id == session.space_id,
        LearningSpaceMember.user_id == user.id
    ).first()
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this learning space.")

    # Check if user already submitted
    existing = db.query(CompanionSubmission).filter(
        CompanionSubmission.session_id == session_id,
        CompanionSubmission.user_id == user.id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="You have already submitted your answer for this session.")

    submission = CompanionSubmission(
        session_id=session.id,
        user_id=user.id,
        answer=data.answer,
        reasoning=data.reasoning,
        reflection_notes=data.reflection_notes
    )
    db.add(submission)
    db.flush()

    # Check submissions count
    submissions_count = db.query(CompanionSubmission).filter(CompanionSubmission.session_id == session.id).count()

    if submissions_count >= 2:
        session.status = "both_revealed"
        session.revealed_at = datetime.now(timezone.utc)
        
        # Award XP to both users
        all_subs = db.query(CompanionSubmission).filter(CompanionSubmission.session_id == session.id).all()
        for sub in all_subs:
            sub_user = db.query(User).filter(User.id == sub.user_id).first()
            if sub_user:
                award_xp(
                    db=db,
                    user=sub_user,
                    amount=40,
                    reason=f"Completed Shared Challenge: {session.title}",
                    reference_type="companion_collab",
                    reference_id=f"shared_{session.id}"
                )
                unlock_achievement(db, sub_user.id, "companion_collab")
    else:
        session.status = "one_submitted"

    db.commit()
    db.refresh(session)
    return session

def get_companion_session_detail(db: Session, user: User, session_id: int) -> dict:
    session = db.query(CompanionChallengeSession).filter(CompanionChallengeSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")

    submissions = db.query(CompanionSubmission).filter(CompanionSubmission.session_id == session.id).all()
    user_submission = next((s for s in submissions if s.user_id == user.id), None)
    both_submitted = (len(submissions) >= 2)
    current_user_submitted = (user_submission is not None)

    # Format submissions with privacy rules:
    # If both have NOT submitted, current user can only see their OWN answer. Other user's answer is masked!
    formatted_subs = []
    for s in submissions:
        is_self = (s.user_id == user.id)
        show_answer = both_submitted or is_self
        
        sub_user = s.user
        formatted_subs.append({
            "user_id": s.user_id,
            "username": sub_user.username if sub_user else "Companion",
            "avatar": sub_user.avatar if sub_user else "cat-coder",
            "role": sub_user.role if sub_user else "learner",
            "answer": s.answer if show_answer else "[Hidden until both users have submitted]",
            "reasoning": s.reasoning if show_answer else "[Hidden until both users have submitted]",
            "reflection_notes": s.reflection_notes if show_answer else None,
            "submitted_at": s.submitted_at,
            "has_submitted": True
        })

    q = session.question
    return {
        "id": session.id,
        "space_id": session.space_id,
        "question_id": session.question_id,
        "title": session.title,
        "status": session.status,
        "created_at": session.created_at,
        "revealed_at": session.revealed_at,
        "question": {
            "id": q.id,
            "canonical_id": q.canonical_id,
            "title": q.title,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "question_type": q.question_type,
            "prompt": q.prompt,
            "hint": q.hint,
            "solution_guidance": q.solution_guidance if both_submitted else None
        } if q else None,
        "both_submitted": both_submitted,
        "current_user_submitted": current_user_submitted,
        "can_reveal": both_submitted,
        "submissions": formatted_subs
    }
