import sys
import os

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import SessionLocal, Base, engine
from services.gamification_service import seed_achievements
from services.roadmap_service import seed_roadmap
from services.project_service import seed_projects
from services.question_service import import_question_bank
from models.question_bank import QuestionBank

def run_seed():
    print("Creating tables if not present...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("Seeding achievements...")
        seed_achievements(db)

        print("Seeding Java roadmap modules & topics...")
        seed_roadmap(db)

        print("Seeding Project Lab projects...")
        seed_projects(db)

        print("Importing canonical question bank...")
        result = import_question_bank(db)
        print(f"Question bank imported successfully: {result}")

        count = db.query(QuestionBank).count()
        print(f"Total canonical questions in database: {count}")
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
