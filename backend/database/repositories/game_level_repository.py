from typing import List, Optional
from sqlalchemy.orm import Session
from models.game_level import GameLevel

class GameLevelRepository:
    @staticmethod
    def get_by_game(db: Session, game_id: str) -> List[GameLevel]:
        return db.query(GameLevel).filter(
            GameLevel.game_id == game_id
        ).order_by(GameLevel.level_number.asc()).all()

    @staticmethod
    def get_by_game_and_level(db: Session, game_id: str, level_number: int) -> Optional[GameLevel]:
        return db.query(GameLevel).filter(
            GameLevel.game_id == game_id,
            GameLevel.level_number == level_number
        ).first()

    @staticmethod
    def upsert_level(db: Session, level_data: dict) -> GameLevel:
        existing = db.query(GameLevel).filter(
            GameLevel.game_id == level_data["game_id"],
            GameLevel.level_number == level_data["level_number"]
        ).first()

        if existing:
            for k, v in level_data.items():
                setattr(existing, k, v)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            new_level = GameLevel(**level_data)
            db.add(new_level)
            db.commit()
            db.refresh(new_level)
            return new_level

    @staticmethod
    def bulk_seed(db: Session, levels: List[dict]) -> int:
        count = 0
        for l in levels:
            GameLevelRepository.upsert_level(db, l)
            count += 1
        return count
