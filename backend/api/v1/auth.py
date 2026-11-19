from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import create_access_token, create_refresh_token, decode_token, verify_password, get_password_hash
from models.user import User, LearningSpace, LearningSpaceMember
from schemas.auth import (
    UserRegister,
    UserLogin,
    Token,
    TokenRefresh,
    UserResponse,
    UserUpdate,
    SpaceCreate,
    SpaceJoin,
    SpaceResponse
)
from services.auth_service import register_user, authenticate_user, create_learning_space, join_learning_space, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(db, data)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            data = UserLogin(**body)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Invalid JSON payload: {str(e)}")
    else:
        # Support form-data (e.g. Swagger /docs Authorize dialog or curl form)
        form = await request.form()
        data = UserLogin(
            username=form.get("username") or form.get("username_or_email"),
            password=form.get("password") or ""
        )

    user = authenticate_user(db, data)
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/refresh", response_model=Token)
def refresh_token_endpoint(data: TokenRefresh, db: Session = Depends(get_db)):
    payload = decode_token(data.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    access_token = create_access_token(user.id)
    refresh_token = create_refresh_token(user.id)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=UserResponse)
def update_profile(data: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Update username
    if data.username and data.username.strip() != current_user.username:
        new_username = data.username.strip()
        conflict = db.query(User).filter(User.username.ilike(new_username), User.id != current_user.id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="This username is already taken by another user.")
        current_user.username = new_username

    # 2. Update email
    if data.email and data.email.strip().lower() != current_user.email:
        new_email = data.email.strip().lower()
        conflict = db.query(User).filter(User.email.ilike(new_email), User.id != current_user.id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="An account with this email address already exists.")
        current_user.email = new_email

    # 3. Update avatar
    if data.avatar:
        current_user.avatar = data.avatar

    # 4. Update role
    if data.role and data.role in ["learner", "companion"]:
        current_user.role = data.role

    # 5. Change Password securely
    if data.new_password:
        if not data.current_password:
            raise HTTPException(status_code=400, detail="Current password is required to change password.")
        if not verify_password(data.current_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Current password does not match.")
        current_user.hashed_password = get_password_hash(data.new_password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/spaces", response_model=SpaceResponse)
def create_space(data: SpaceCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    space = create_learning_space(db, current_user, data.name)
    members = []
    for m in space.members:
        members.append({
            "id": m.id,
            "user_id": m.user_id,
            "username": m.user.username,
            "role": m.role_in_space,
            "joined_at": m.joined_at
        })
    return {
        "id": space.id,
        "name": space.name,
        "invite_code": space.invite_code,
        "created_by_id": space.created_by_id,
        "created_at": space.created_at,
        "members": members
    }

@router.post("/spaces/join", response_model=SpaceResponse)
def join_space(data: SpaceJoin, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    space = join_learning_space(db, current_user, data.invite_code)
    members = []
    for m in space.members:
        members.append({
            "id": m.id,
            "user_id": m.user_id,
            "username": m.user.username,
            "role": m.role_in_space,
            "joined_at": m.joined_at
        })
    return {
        "id": space.id,
        "name": space.name,
        "invite_code": space.invite_code,
        "created_by_id": space.created_by_id,
        "created_at": space.created_at,
        "members": members
    }

@router.get("/spaces/my", response_model=list[SpaceResponse])
def get_my_spaces(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    memberships = db.query(LearningSpaceMember).filter(LearningSpaceMember.user_id == current_user.id).all()
    results = []
    for mem in memberships:
        s = mem.space
        m_list = []
        for m in s.members:
            m_list.append({
                "id": m.id,
                "user_id": m.user_id,
                "username": m.user.username,
                "role": m.role_in_space,
                "joined_at": m.joined_at
            })
        results.append({
            "id": s.id,
            "name": s.name,
            "invite_code": s.invite_code,
            "created_by_id": s.created_by_id,
            "created_at": s.created_at,
            "members": m_list
        })
    return results
