from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from models.gamification import Achievement, UserAchievement, XPTransaction
from schemas.gamification import AchievementResponse, XPTransactionResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/gamification", tags=["Gamification & Rewards"])

@router.get("/achievements", response_model=list[AchievementResponse])
def get_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    all_achs = db.query(Achievement).all()
    user_map = {
        ua.achievement_id: ua.unlocked_at
        for ua in db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).all()
    }

    results = []
    for ach in all_achs:
        unlocked = ach.id in user_map
        results.append({
            "id": ach.id,
            "code": ach.code,
            "title": ach.title,
            "description": ach.description,
            "icon": ach.icon,
            "xp_reward": ach.xp_reward,
            "unlocked": unlocked,
            "unlocked_at": user_map.get(ach.id)
        })
    return results

@router.get("/transactions", response_model=list[XPTransactionResponse])
def get_xp_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(XPTransaction).filter(
        XPTransaction.user_id == current_user.id
    ).order_by(XPTransaction.created_at.desc()).all()
