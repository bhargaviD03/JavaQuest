import os
from typing import List
from pydantic_settings import BaseSettings

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_FILE = os.path.join(BACKEND_DIR, "javaquest.db").replace("\\", "/")

class Settings(BaseSettings):
    PROJECT_NAME: str = "JavaQuest"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "javaquest-super-secret-production-grade-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Database - Points to Docker PostgreSQL on port 5310 by default
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5310/javaquest")
    
    # AI settings
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "mock")  # 'mock', 'gemini', or 'openai'
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Initial Admin / Learner User (Configurable via ENV / Neon deployment, not hardcoded)
    DEFAULT_USER_EMAIL: str = os.getenv("DEFAULT_USER_EMAIL", "bhargavi.cse03@gmail.com")
    DEFAULT_USER_PASSWORD: str = os.getenv("DEFAULT_USER_PASSWORD", "JavaDev@2602")
    DEFAULT_USER_USERNAME: str = os.getenv("DEFAULT_USER_USERNAME", "bhargavi")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
