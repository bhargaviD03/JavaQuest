import json
import os
import sys

# Ensure parent directory in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import SessionLocal
from models.question_bank import QuestionBank, QuestionAttempt, QuestionBookmark

def sync_mnc_questions():
    json_path = os.path.join("backend", "seed_data", "mnc_250_questions.json")
    if not os.path.exists(json_path):
        json_path = os.path.join("seed_data", "mnc_250_questions.json")

    with open(json_path, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    db = SessionLocal()
    try:
        print("Cleaning old mock questions from question_bank...")
        # Clear child attempts and bookmarks first to respect foreign keys
        db.query(QuestionAttempt).delete()
        db.query(QuestionBookmark).delete()
        deleted_count = db.query(QuestionBank).delete()
        db.commit()
        print(f"Removed {deleted_count} old mock questions.")

        print(f"Importing {len(questions_data)} curated MNC interview questions...")
        for q in questions_data:
            qb = QuestionBank(
                canonical_id=q["canonical_id"],
                title=f"{q['prompt'][:80]}...",
                topic=q["domain"],
                difficulty=q["difficulty"],
                question_type="Coding" if q["level"] >= 6 else ("Code design" if q["level"] >= 4 else "Predict output"),
                prompt=q["prompt"],
                hint=f"Focus on {q['domain']} principles asked by {', '.join(q['companies'][:3])}.",
                learning_objectives=[q["learning_objective"]],
                solution_guidance=q["solution"],
                source_type=q["source"],
                external_reference=f"{q['source']} ({', '.join(q['companies'][:3])})",
                language="Java",
                is_ai_generated=False,
                is_active=True
            )
            db.add(qb)

        db.commit()
        total = db.query(QuestionBank).count()
        print(f"Successfully seeded {total} top MNC questions into database!")

        # Also update javaquest_question_bank_v1.json so future seeds are canonical
        canonical_seed_path = os.path.join("backend", "seed_data", "javaquest_question_bank_v1.json")
        canonical_dict = {
            "version": "2.0-mnc",
            "description": "250 Curated Top MNC Interview Questions",
            "questions": [
                {
                    "canonical_id": q["canonical_id"],
                    "title": q["prompt"][:80],
                    "topic": q["domain"],
                    "difficulty": q["difficulty"],
                    "question_type": "Coding" if q["level"] >= 6 else "Predict output",
                    "prompt": q["prompt"],
                    "hint": f"Frequently asked at {', '.join(q['companies'][:3])}",
                    "solution_guidance": q["solution"],
                    "source_type": q["source"],
                    "external_reference": f"{q['source']} ({', '.join(q['companies'][:3])})"
                }
                for q in questions_data
            ],
            "external_practice": []
        }
        with open(canonical_seed_path, "w", encoding="utf-8") as f:
            json.dump(canonical_dict, f, indent=2)
        print("Updated javaquest_question_bank_v1.json.")

    finally:
        db.close()

if __name__ == "__main__":
    sync_mnc_questions()
