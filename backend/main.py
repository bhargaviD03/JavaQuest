import os
from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from core.config import settings
from core.database import engine, Base, SessionLocal
from api.v1 import (
    auth,
    dashboard,
    roadmap,
    daily_session,
    questions,
    mentor,
    companion,
    projects,
    external_practice,
    gamification,
    exercises,
    execution,
    games
)
from services.auth_service import seed_default_users
from services.gamification_service import seed_achievements
from services.roadmap_service import seed_roadmap
from services.project_service import seed_projects
from services.question_service import ensure_question_bank_seeded
from services.exercise_service import seed_interactive_exercises

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    # Run idempotent seeds (detects missing questions / default user and seeds DB automatically)
    db = SessionLocal()
    try:
        seed_default_users(db)
        seed_achievements(db)
        seed_roadmap(db)
        seed_projects(db)
        ensure_question_bank_seeded(db)
        seed_interactive_exercises(db)
    except Exception as e:
        print(f"Warning during seed: {e}")
    finally:
        db.close()
    
    yield
    # Shutdown

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="JavaQuest — Production Gamified Java Learning Platform",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(roadmap.router, prefix=settings.API_V1_STR)
app.include_router(daily_session.router, prefix=settings.API_V1_STR)
app.include_router(questions.router, prefix=settings.API_V1_STR)
app.include_router(mentor.router, prefix=settings.API_V1_STR)
app.include_router(companion.router, prefix=settings.API_V1_STR)
app.include_router(projects.router, prefix=settings.API_V1_STR)
app.include_router(external_practice.router, prefix=settings.API_V1_STR)
app.include_router(gamification.router, prefix=settings.API_V1_STR)
app.include_router(exercises.router, prefix=settings.API_V1_STR)
app.include_router(execution.router, prefix=settings.API_V1_STR)
app.include_router(games.router, prefix=settings.API_V1_STR)

@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.PROJECT_NAME, "version": "1.0.0"}

# --- Static File Serving & Frontend SPA Integration ---
# Look for built frontend assets in several possible paths (local, Docker, or monolithic deploy)
possible_dist_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.path.dirname(__file__), "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "dist")),
]
frontend_dist = next((p for p in possible_dist_paths if os.path.exists(p) and os.path.isdir(p)), None)

if frontend_dist:
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="frontend-assets")

    downloads_dir = os.path.join(frontend_dist, "downloads")
    if os.path.exists(downloads_dir):
        app.mount("/downloads", StaticFiles(directory=downloads_dir), name="frontend-downloads")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Exclude backend API, health, docs, and openapi
        if (
            full_path.startswith("api/")
            or full_path == "api"
            or full_path.startswith("docs")
            or full_path.startswith("openapi.json")
        ):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_file = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Frontend index.html not found")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
