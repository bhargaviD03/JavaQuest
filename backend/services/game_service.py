from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from database.repositories.game_level_repository import GameLevelRepository
from models.game_level import GameLevel

class GameService:
    @staticmethod
    def get_game_levels(db: Session, game_id: str) -> List[Dict[str, Any]]:
        levels = GameLevelRepository.get_by_game(db, game_id)
        return [
            {
                "id": l.id,
                "game_id": l.game_id,
                "level_number": l.level_number,
                "title": l.title,
                "topic": l.topic,
                "difficulty": l.difficulty,
                "learning_objective": l.learning_objective,
                "scenario": l.scenario,
                "starter_code": l.starter_code,
                "solution_hint": l.solution_hint,
                "test_cases": l.test_cases or [],
                "expected_output": l.expected_output,
                "xp_reward": l.xp_reward
            }
            for l in levels
        ]

    @staticmethod
    def get_game_level(db: Session, game_id: str, level_number: int) -> Optional[Dict[str, Any]]:
        l = GameLevelRepository.get_by_game_and_level(db, game_id, level_number)
        if not l:
            return None
        return {
            "id": l.id,
            "game_id": l.game_id,
            "level_number": l.level_number,
            "title": l.title,
            "topic": l.topic,
            "difficulty": l.difficulty,
            "learning_objective": l.learning_objective,
            "scenario": l.scenario,
            "starter_code": l.starter_code,
            "solution_hint": l.solution_hint,
            "test_cases": l.test_cases or [],
            "expected_output": l.expected_output,
            "xp_reward": l.xp_reward
        }
