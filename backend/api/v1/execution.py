from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from core.database import get_db
from services.execution_service import ExecutionService
from services.auth_service import get_current_user
from services.gamification_service import award_xp, unlock_achievement
from models.user import User

router = APIRouter(prefix="/execution", tags=["Java Execution Engine"])

class TestCaseSchema(BaseModel):
    name: str
    description: str
    token: Optional[str] = None
    pattern: Optional[str] = None

class ExecutionRequest(BaseModel):
    code: str
    class_name: Optional[str] = None
    stdin: Optional[str] = None
    test_cases: Optional[List[TestCaseSchema]] = None
    game_id: Optional[str] = None
    level_id: Optional[str] = None

class ExecutionResponse(BaseModel):
    compiled: bool
    output: str
    errors: Optional[str] = None
    execution_time_ms: int
    test_results: Optional[List[Dict[str, Any]]] = None
    xp_awarded: Optional[int] = 0

@router.post("/run", response_model=ExecutionResponse)
def run_code(
    payload: ExecutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tc_dicts = [tc.model_dump() for tc in payload.test_cases] if payload.test_cases else []
    result = ExecutionService.execute_java_code(
        code=payload.code,
        class_name=payload.class_name,
        test_cases=tc_dicts,
        stdin=payload.stdin
    )

    xp_earned = 0
    test_res = result.get("test_results") or []
    all_passed = all(t.get("passed", False) for t in test_res) if test_res else True

    if result.get("compiled") and all_passed and payload.game_id and payload.level_id:
        awarded = award_xp(
            db=db,
            user=current_user,
            amount=35,
            reason=f"Passed {payload.game_id} {payload.level_id}",
            reference_type="game_level",
            reference_id=f"{payload.game_id}_{payload.level_id}"
        )
        if awarded:
            xp_earned = 35
            unlock_achievement(db, current_user.id, "first_step")

    return {
        **result,
        "xp_awarded": xp_earned
    }
