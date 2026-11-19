from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.question_bank import ExternalChallenge, ExternalChallengeProgress
from schemas.question import ExternalChallengeResponse, ExternalProgressUpdate
from services.auth_service import get_current_user

router = APIRouter(prefix="/external-practice", tags=["External Practice"])

@router.get("/", response_model=list[ExternalChallengeResponse])
def list_external_practice(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenges = db.query(ExternalChallenge).all()
    progress_map = {
        ep.challenge_id: ep for ep in db.query(ExternalChallengeProgress).filter(
            ExternalChallengeProgress.user_id == current_user.id
        ).all()
    }

    results = []
    for c in challenges:
        p = progress_map.get(c.id)
        results.append({
            "id": c.id,
            "platform": c.platform,
            "title": c.title,
            "url": c.url,
            "topic": c.topic,
            "difficulty": c.difficulty,
            "user_status": p.status if p else "not_started",
            "notes": p.notes if p else None
        })
    return results

@router.put("/{challenge_id}/status")
def update_challenge_status(
    challenge_id: int,
    data: ExternalProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(ExternalChallenge).filter(ExternalChallenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=404, detail="External challenge not found")

    p = db.query(ExternalChallengeProgress).filter(
        ExternalChallengeProgress.user_id == current_user.id,
        ExternalChallengeProgress.challenge_id == challenge_id
    ).first()

    now = datetime.now(timezone.utc)
    if not p:
        p = ExternalChallengeProgress(
            user_id=current_user.id,
            challenge_id=challenge_id,
            status=data.status,
            notes=data.notes,
            last_attempted_at=now,
            completed_at=now if data.status == "solved" else None
        )
        db.add(p)
    else:
        p.status = data.status
        if data.notes:
            p.notes = data.notes
        p.last_attempted_at = now
        if data.status == "solved" and not p.completed_at:
            p.completed_at = now

    db.commit()
    return {"status": "success", "challenge_id": challenge_id, "user_status": data.status}
