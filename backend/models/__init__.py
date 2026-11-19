from core.database import Base
from models.user import User, LearningSpace, LearningSpaceMember
from models.learning import LearningModule, Topic, Lesson, LessonProgress
from models.question_bank import (
    QuestionBank,
    QuestionAttempt,
    QuestionBookmark,
    ExternalChallenge,
    ExternalChallengeProgress
)
from models.daily_session import DailySession, DailySessionItem
from models.mentor import MentorConversation, MentorMessage
from models.gamification import XPTransaction, Achievement, UserAchievement, DailyActivity
from models.companion import CompanionChallengeSession, CompanionSubmission
from models.project import Project, ProjectMilestone
from models.interactive_exercise import InteractiveExercise, InteractiveExerciseAttempt
from models.game_level import GameLevel

__all__ = [
    "Base",
    "User",
    "LearningSpace",
    "LearningSpaceMember",
    "LearningModule",
    "Topic",
    "Lesson",
    "LessonProgress",
    "QuestionBank",
    "QuestionAttempt",
    "QuestionBookmark",
    "ExternalChallenge",
    "ExternalChallengeProgress",
    "DailySession",
    "DailySessionItem",
    "MentorConversation",
    "MentorMessage",
    "XPTransaction",
    "Achievement",
    "UserAchievement",
    "DailyActivity",
    "CompanionChallengeSession",
    "CompanionSubmission",
    "Project",
    "ProjectMilestone",
    "InteractiveExercise",
    "InteractiveExerciseAttempt",
    "GameLevel",
]
