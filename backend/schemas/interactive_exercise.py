from typing import Optional, Any, List, Dict
from pydantic import BaseModel

class ExerciseResponse(BaseModel):
    id: int
    canonical_id: str
    exercise_type: str
    title: str
    topic: str
    difficulty: str
    xp_reward: int
    prompt: str
    starter_code: Optional[str] = None
    scaffold_code: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None
    hint: Optional[str] = None
    is_solved: Optional[bool] = False

    class Config:
        from_attributes = True

class ExerciseSubmission(BaseModel):
    submission_data: Dict[str, Any]

class ExerciseEvaluationResult(BaseModel):
    is_correct: bool
    xp_awarded: int
    feedback: str
    test_results: Optional[List[Dict[str, Any]]] = None
