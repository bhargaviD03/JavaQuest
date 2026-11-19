from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from database.repositories.game_level_repository import GameLevelRepository
from models.game_level import GameLevel

def seed_default_game_levels(db: Session) -> int:
    """Ensure all 60 game levels across the 6 worlds exist in the database."""
    count = db.query(GameLevel).count()
    if count >= 60:
        return count

    # Generate complete 60 levels
    try:
        from scripts.generate_all_60_game_levels import build_all_levels
        levels = build_all_levels()
    except Exception as e:
        print(f"Warning building levels from script: {e}")
        levels = []

    # Overlay rich handcrafted levels if available
    try:
        from scripts.seed_postgres_database import GAME_LEVELS_CATALOG
        levels_map = {(l["game_id"], l["level_number"]): l for l in levels}
        for rich_l in GAME_LEVELS_CATALOG:
            levels_map[(rich_l["game_id"], rich_l["level_number"])] = rich_l
        levels = list(levels_map.values())
    except Exception as e:
        print(f"Warning importing GAME_LEVELS_CATALOG: {e}")

    if levels:
        seeded = GameLevelRepository.bulk_seed(db, levels)
        print(f"[Seed] Successfully seeded {seeded} game levels into database.")
        return seeded
    return count

class GameService:
    seed_default_game_levels = staticmethod(seed_default_game_levels)

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
