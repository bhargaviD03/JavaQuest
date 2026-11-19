from datetime import datetime, timezone, date
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from models.user import User
from models.gamification import XPTransaction, Achievement, UserAchievement, DailyActivity

def utcnow():
    return datetime.now(timezone.utc)

ACHIEVEMENT_DEFINITIONS = [
    {
        "code": "first_step",
        "title": "First Step",
        "description": "Complete your very first Java challenge or lesson",
        "icon": "footprints",
        "xp_reward": 50
    },
    {
        "code": "institute_sync",
        "title": "Institute Synchronizer",
        "description": "Log and practice today's institute topic",
        "icon": "calendar-check",
        "xp_reward": 75
    },
    {
        "code": "streak_3",
        "title": "Consistent Coder",
        "description": "Maintain a 3-day learning streak",
        "icon": "flame",
        "xp_reward": 100
    },
    {
        "code": "oop_master",
        "title": "Object Architect",
        "description": "Attempt 5 OOP questions in the question bank",
        "icon": "box",
        "xp_reward": 150
    },
    {
        "code": "companion_collab",
        "title": "Pair Programmer",
        "description": "Complete a shared challenge arena session with your companion",
        "icon": "users",
        "xp_reward": 120
    },
    {
        "code": "project_builder",
        "title": "Software Crafter",
        "description": "Complete a Project Lab milestone",
        "icon": "code-2",
        "xp_reward": 100
    },
    {
        "code": "debugging_detective",
        "title": "Bug Hunter",
        "description": "Solve a Java debugging challenge",
        "icon": "bug",
        "xp_reward": 75
    }
]

def seed_achievements(db: Session):
    for ach_data in ACHIEVEMENT_DEFINITIONS:
        existing = db.query(Achievement).filter(Achievement.code == ach_data["code"]).first()
        if not existing:
            ach = Achievement(**ach_data)
            db.add(ach)
    db.commit()

def calculate_level(total_xp: int) -> int:
    return max(1, 1 + (total_xp // 200))

def award_xp(db: Session, user: User, amount: int, reason: str, reference_type: str, reference_id: str) -> bool:
    """
    Awards XP idempotently. Returns True if awarded, False if duplicate transaction.
    """
    existing = db.query(XPTransaction).filter(
        XPTransaction.user_id == user.id,
        XPTransaction.reference_type == reference_type,
        XPTransaction.reference_id == str(reference_id)
    ).first()

    if existing:
        return False

    tx = XPTransaction(
        user_id=user.id,
        amount=amount,
        reason=reason,
        reference_type=reference_type,
        reference_id=str(reference_id)
    )
    db.add(tx)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        return False

    user.total_xp += amount
    user.level = calculate_level(user.total_xp)

    # Record daily activity
    record_daily_activity(db, user.id, minutes=0, questions=0, xp=amount)
    db.commit()
    return True

def unlock_achievement(db: Session, user_id: int, achievement_code: str) -> bool:
    achievement = db.query(Achievement).filter(Achievement.code == achievement_code).first()
    if not achievement:
        return False

    existing = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id,
        UserAchievement.achievement_id == achievement.id
    ).first()

    if existing:
        return False

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return False

    ua = UserAchievement(user_id=user_id, achievement_id=achievement.id)
    db.add(ua)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        return False

    # Award achievement XP
    award_xp(
        db=db,
        user=user,
        amount=achievement.xp_reward,
        reason=f"Achievement Unlocked: {achievement.title}",
        reference_type="achievement",
        reference_id=achievement_code
    )
    db.commit()
    return True

def record_daily_activity(db: Session, user_id: int, minutes: int = 0, questions: int = 0, xp: int = 0):
    today = date.today()
    activity = db.query(DailyActivity).filter(
        DailyActivity.user_id == user_id,
        DailyActivity.activity_date == today
    ).first()

    if not activity:
        activity = DailyActivity(
            user_id=user_id,
            activity_date=today,
            minutes_spent=minutes,
            questions_attempted=questions,
            xp_earned=xp
        )
        db.add(activity)
    else:
        activity.minutes_spent += minutes
        activity.questions_attempted += questions
        activity.xp_earned += xp

    try:
        db.commit()
    except Exception:
        db.rollback()
