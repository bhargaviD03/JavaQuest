from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

class UserRegister(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    role: str = Field(default="learner", pattern="^(learner|companion)$")
    avatar: Optional[str] = "cat-coder"

class UserLogin(BaseModel):
    username_or_email: Optional[str] = None
    username: Optional[str] = None
    email: Optional[str] = None
    password: str

    def get_identifier(self) -> str:
        ident = self.username_or_email or self.username or self.email
        return ident.strip() if ident else ""

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class TokenRefresh(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    avatar: str
    level: int
    total_xp: int
    current_streak: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    avatar: Optional[str] = None
    role: Optional[str] = None

class SpaceCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)

class SpaceJoin(BaseModel):
    invite_code: str

class SpaceMemberResponse(BaseModel):
    id: int
    user_id: int
    username: str
    role: str
    joined_at: datetime

class SpaceResponse(BaseModel):
    id: int
    name: str
    invite_code: str
    created_by_id: int
    created_at: datetime
    members: List[SpaceMemberResponse] = []

    class Config:
        from_attributes = True

Token.model_rebuild()
