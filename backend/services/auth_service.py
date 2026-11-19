import secrets
from datetime import datetime, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core.database import get_db
from core.config import settings
from core.security import verify_password, get_password_hash, create_access_token, create_refresh_token, decode_token
from models.user import User, LearningSpace, LearningSpaceMember
from schemas.auth import UserRegister, UserLogin

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception
    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user

def register_user(db: Session, reg_data: UserRegister) -> User:
    # Check email and username uniqueness
    existing_email = db.query(User).filter(User.email.ilike(reg_data.email.strip())).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    
    existing_username = db.query(User).filter(User.username.ilike(reg_data.username.strip())).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="This username is already taken.")
    
    hashed_pwd = get_password_hash(reg_data.password)
    user = User(
        email=reg_data.email.strip().lower(),
        username=reg_data.username.strip(),
        hashed_password=hashed_pwd,
        role=reg_data.role,
        avatar=reg_data.avatar or "cat-coder",
        level=1,
        total_xp=0,
        current_streak=1
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, login_data: UserLogin) -> User:
    identifier = login_data.get_identifier()
    if not identifier:
        raise HTTPException(status_code=400, detail="Username or email is required.")
    
    user = db.query(User).filter(
        (User.username.ilike(identifier)) | (User.email.ilike(identifier))
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid email/username or password. Please check your credentials."
        )
    if not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Invalid email/username or password. Please check your credentials."
        )
    
    # Update last_active_at
    user.last_active_at = datetime.now(timezone.utc)
    db.commit()
    return user

def seed_default_users(db: Session):
    """
    Ensures the configured initial admin/learner user and shared learning space exist.
    Credentials are read dynamically from settings / environment variables, never hardcoded.
    """
    # 1. Primary User from settings / env
    primary_email = settings.DEFAULT_USER_EMAIL.strip().lower()
    primary_username = settings.DEFAULT_USER_USERNAME.strip()

    primary_user = db.query(User).filter(
        (User.email.ilike(primary_email)) | (User.username.ilike(primary_username))
    ).first()

    if not primary_user:
        primary_user = User(
            email=primary_email,
            username=primary_username,
            hashed_password=get_password_hash(settings.DEFAULT_USER_PASSWORD),
            role="learner",
            avatar="cat-coder",
            level=5,
            total_xp=955,
            current_streak=3
        )
        db.add(primary_user)
        db.commit()
        db.refresh(primary_user)
    else:
        # Keep password synchronized with configured setting if changed
        if not verify_password(settings.DEFAULT_USER_PASSWORD, primary_user.hashed_password):
            primary_user.hashed_password = get_password_hash(settings.DEFAULT_USER_PASSWORD)
            db.commit()

    # 2. Also ensure java_learner legacy/test account exists for test suites
    test_learner = db.query(User).filter(User.username == "java_learner").first()
    if not test_learner and primary_username != "java_learner":
        test_learner = User(
            email="learner@javaquest.dev",
            username="java_learner",
            hashed_password=get_password_hash("SecretPassword123!"),
            role="learner",
            avatar="cat-coder",
            level=5,
            total_xp=955,
            current_streak=3
        )
        db.add(test_learner)
        db.commit()
        db.refresh(test_learner)

    companion = db.query(User).filter(User.username == "py_companion").first()
    if not companion:
        companion = User(
            email="companion@javaquest.dev",
            username="py_companion",
            hashed_password=get_password_hash("SecretPassword123!"),
            role="companion",
            avatar="dog-coder",
            level=1,
            total_xp=80,
            current_streak=2
        )
        db.add(companion)
        db.commit()
        db.refresh(companion)

    # Ensure shared space exists
    space = db.query(LearningSpace).filter(LearningSpace.invite_code == "JAVA2026").first()
    if not space:
        active_user = primary_user or test_learner
        space = LearningSpace(
            name="Java Pair Study Space",
            invite_code="JAVA2026",
            created_by_id=active_user.id
        )
        db.add(space)
        db.commit()
        db.refresh(space)

        m1 = LearningSpaceMember(space_id=space.id, user_id=active_user.id, role_in_space="learner")
        m2 = LearningSpaceMember(space_id=space.id, user_id=companion.id, role_in_space="companion")
        db.add_all([m1, m2])
        db.commit()

def create_learning_space(db: Session, user: User, name: str) -> LearningSpace:
    invite_code = secrets.token_hex(4).upper()  # 8 characters e.g. "9F4B12A8"
    space = LearningSpace(
        name=name,
        invite_code=invite_code,
        created_by_id=user.id
    )
    db.add(space)
    db.flush()

    member = LearningSpaceMember(
        space_id=space.id,
        user_id=user.id,
        role_in_space="owner"
    )
    db.add(member)
    db.commit()
    db.refresh(space)
    return space

def join_learning_space(db: Session, user: User, invite_code: str) -> LearningSpace:
    space = db.query(LearningSpace).filter(LearningSpace.invite_code == invite_code.strip().upper()).first()
    if not space:
        raise HTTPException(status_code=404, detail="Invalid invitation code. Space not found.")
    
    # Check if already member
    existing = db.query(LearningSpaceMember).filter(
        LearningSpaceMember.space_id == space.id,
        LearningSpaceMember.user_id == user.id
    ).first()
    if existing:
        return space

    role_in_space = "companion" if user.role == "companion" else "learner"
    member = LearningSpaceMember(
        space_id=space.id,
        user_id=user.id,
        role_in_space=role_in_space
    )
    db.add(member)
    db.commit()
    return space
