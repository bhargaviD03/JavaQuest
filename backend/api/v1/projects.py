from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User
from schemas.project import ProjectResponse, MilestoneUpdate
from services.auth_service import get_current_user
from services.project_service import get_projects_for_user, update_project_milestone

router = APIRouter(prefix="/projects", tags=["Project Lab"])

@router.get("/", response_model=list[ProjectResponse])
def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_projects_for_user(db, current_user)

@router.post("/{project_id}/milestones/{milestone_index}")
def complete_milestone(
    project_id: int,
    milestone_index: int,
    data: MilestoneUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return update_project_milestone(
        db=db,
        user=current_user,
        project_id=project_id,
        milestone_index=milestone_index,
        learner_code=data.learner_code,
        learner_reflection=data.learner_reflection
    )
