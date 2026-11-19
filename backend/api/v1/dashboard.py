from datetime import datetime, date, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User, LearningSpaceMember
from models.daily_session import DailySession
from models.question_bank import QuestionAttempt
from models.gamification import Achievement, UserAchievement, DailyActivity
from models.learning import LessonProgress, Topic
from schemas.gamification import DashboardStats
from services.auth_service import get_current_user
from services.question_service import select_daily_challenge

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Calculate progress to next level
    xp_in_current_level = current_user.total_xp % 200
    xp_to_next = 200 - xp_in_current_level
    progress_pct = int((xp_in_current_level / 200) * 100)

    # Greeting based on time of day
    now = datetime.now()
    if now.hour < 12:
        greeting = f"Good morning, {current_user.username}!"
    elif now.hour < 17:
        greeting = f"Good afternoon, {current_user.username}!"
    else:
        greeting = f"Good evening, {current_user.username}!"

    # Today's institute session
    latest_session = db.query(DailySession).filter(
        DailySession.user_id == current_user.id
    ).order_by(DailySession.created_at.desc()).first()

    today_institute_topic = latest_session.institute_topic if latest_session else None

    # Curated Daily challenge
    daily_challenge = select_daily_challenge(db, current_user)

    # Current module & topics being learned / needing revision
    in_progress_records = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.status.in_(["in_progress", "practising"])
    ).limit(3).all()
    learning_topics = [lp.lesson.topic.title for lp in in_progress_records if lp.lesson and lp.lesson.topic]

    revision_records = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.status == "needs_revision"
    ).limit(3).all()
    revision_topics = [lp.lesson.topic.title for lp in revision_records if lp.lesson and lp.lesson.topic]

    if not learning_topics:
        learning_topics = ["OOP Foundations", "Classes and Objects"]
    if not revision_topics:
        revision_topics = ["Constructors & this keyword"]

    # Recent achievements
    user_achs = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).order_by(UserAchievement.unlocked_at.desc()).limit(3).all()
    
    recent_achievements = [
        {
            "id": ua.achievement.id,
            "code": ua.achievement.code,
            "title": ua.achievement.title,
            "description": ua.achievement.description,
            "icon": ua.achievement.icon,
            "xp_reward": ua.achievement.xp_reward,
            "unlocked": True,
            "unlocked_at": ua.unlocked_at
        } for ua in user_achs
    ]

    # Recent attempts
    recent_attempts_db = db.query(QuestionAttempt).filter(
        QuestionAttempt.user_id == current_user.id
    ).order_by(QuestionAttempt.created_at.desc()).limit(4).all()

    recent_attempts = [
        {
            "id": att.id,
            "canonical_id": att.question.canonical_id,
            "title": att.question.title,
            "topic": att.question.topic,
            "is_correct": att.is_correct,
            "xp_awarded": att.xp_awarded,
            "created_at": att.created_at
        } for att in recent_attempts_db
    ]

    # Weekly activity
    seven_days_ago = date.today() - timedelta(days=6)
    activities = db.query(DailyActivity).filter(
        DailyActivity.user_id == current_user.id,
        DailyActivity.activity_date >= seven_days_ago
    ).all()
    act_map = {a.activity_date: a for a in activities}

    # Real calculated metrics (starts from 0 for brand-new users)
    total_attempts = db.query(QuestionAttempt).filter(QuestionAttempt.user_id == current_user.id).count()
    correct_attempts = db.query(QuestionAttempt).filter(
        QuestionAttempt.user_id == current_user.id,
        QuestionAttempt.is_correct == True
    ).count()
    solution_accuracy = round((correct_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0.0
    total_weekly_solves = sum(a.questions_attempted for a in activities)

    weekly_activity = []
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        a = act_map.get(day)
        weekly_activity.append({
            "activity_date": day,
            "minutes_spent": a.minutes_spent if a else 0,
            "questions_attempted": a.questions_attempted if a else 0,
            "xp_earned": a.xp_earned if a else 0
        })

    # Companion activity
    companion_activity = None
    membership = db.query(LearningSpaceMember).filter(LearningSpaceMember.user_id == current_user.id).first()
    if membership:
        companion_mem = db.query(LearningSpaceMember).filter(
            LearningSpaceMember.space_id == membership.space_id,
            LearningSpaceMember.user_id != current_user.id
        ).first()
        if companion_mem:
            comp_user = companion_mem.user
            companion_activity = {
                "username": comp_user.username,
                "role": comp_user.role,
                "avatar": comp_user.avatar,
                "level": comp_user.level,
                "total_xp": comp_user.total_xp,
                "current_streak": comp_user.current_streak,
                "last_active": comp_user.last_active_at
            }

    return {
        "greeting": greeting,
        "username": current_user.username,
        "role": current_user.role,
        "level": current_user.level,
        "total_xp": current_user.total_xp,
        "current_streak": current_user.current_streak,
        "xp_to_next_level": xp_to_next,
        "progress_to_next_level": progress_pct,
        "solution_accuracy": solution_accuracy,
        "total_solved_questions": correct_attempts,
        "weekly_commits": total_weekly_solves,
        "today_institute_topic": today_institute_topic or "Method Overloading & Overriding",
        "daily_challenge": daily_challenge,
        "current_module": "Module 1: OOP Foundations",
        "learning_topics": learning_topics,
        "revision_topics": revision_topics,
        "recent_achievements": recent_achievements,
        "recent_attempts": recent_attempts,
        "weekly_activity": weekly_activity,
        "companion_activity": companion_activity
    }
