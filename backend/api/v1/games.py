from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from services.game_service import GameService
from services.auth_service import get_current_user
from models.user import User

router = APIRouter(prefix="/games", tags=["2.5D Game Worlds"])

@router.get("/{game_id}/levels")
def get_game_levels(
    game_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve all levels dynamically from the PostgreSQL database for a specific game world.
    Each level is calibrated from Beginner (Level 1: 1-line answer) to Advanced (Level 10: author from scratch).
    """
    levels = GameService.get_game_levels(db, game_id)
    if not levels:
        raise HTTPException(
            status_code=404,
            detail=f"No levels found for game '{game_id}'. Ensure database is seeded."
        )
    return {
        "game_id": game_id,
        "total_levels": len(levels),
        "levels": levels
    }

@router.get("/{game_id}/levels/{level_number}")
def get_single_game_level(
    game_id: str,
    level_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve a single calibrated level dynamically from the database.
    """
    level = GameService.get_game_level(db, game_id, level_number)
    if not level:
        raise HTTPException(
            status_code=404,
            detail=f"Level {level_number} for game '{game_id}' not found."
        )
    return level
