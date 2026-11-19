# Canonical Question Bank Import Guide — JavaQuest

This guide documents the canonical practice bank format, the import engine, and idempotency guarantees for JavaQuest.

---

## 1. Canonical Dataset Specification

The canonical practice dataset is stored in:
- `D:\Java\javaquest_question_bank_v1.json`
- `D:\Java\backend\seed_data\javaquest_question_bank_v1.json`

### Root Structure
```json
{
  "bank_id": "javaquest-core-java-v1",
  "title": "JavaQuest Curated Java Practice Bank",
  "version": "1.0.0",
  "content_policy": "Original practice prompts created for JavaQuest. Not copied from LeetCode or HackerRank.",
  "external_practice": [ ... ],
  "questions": [ ... ]
}
```

### Question Item Schema
Each item in `questions` must adhere to:
```json
{
  "id": "JQ-001",
  "title": "OOP Foundations: Practice 01",
  "topic": "OOP Foundations",
  "difficulty": "Easy",
  "question_type": "Code design",
  "prompt": "Model a `Book` class with title, author, and price. Add a constructor, getters, and a method that prints a formatted description.",
  "hint": "Create a class with private fields, constructor initialisation, accessors, and an instance method.",
  "learning_objectives": [
    "Class",
    "object",
    "fields",
    "constructor",
    "encapsulation"
  ],
  "solution_guidance": "A Book object should retain its own data; do not use static fields.",
  "source_type": "javaquest_original",
  "external_reference": null,
  "language": "Java",
  "is_ai_generated": false,
  "is_active": true
}
```

---

## 2. Importer Implementation Details

The import logic is implemented in `backend/app/services/question_service.py` via `import_question_bank()`.

### Idempotency Logic
1. **Existing Check**: Queries `db.query(QuestionBank).filter(QuestionBank.canonical_id == q["id"]).first()`.
2. **Upsert Behavior**:
   - If found: Updates all mutable fields (title, prompt, hint, objectives, solution guidance) without creating a new record or altering primary key ID.
   - If not found: Inserts a new row with `canonical_id = q["id"]`.
3. **External Challenges**: Queries `ExternalChallenge` by `(platform, title)`. Only inserts if not already present.
4. **Zero AI Hallucination**: AI Mentor is strictly forbidden from writing generated questions into the `question_bank` table.

---

## 3. Running the Importer Manually

To execute the seed script independently:

```powershell
cd D:\Java
.\backend\venv\Scripts\python backend\seed_data\seed_runner.py
```

### Execution Output:
```
Creating tables if not present...
Seeding achievements...
Seeding Java roadmap modules & topics...
Seeding Project Lab projects...
Importing canonical question bank...
Question bank imported successfully: {'status': 'success', 'file_used': 'javaquest_question_bank_v1.json', 'questions_created': 0, 'questions_updated': 32, 'total_questions_in_db': 32, 'external_challenges_created': 0}
Total canonical questions in database: 32
```

---

## 4. Verification & Validation Rules
- **Total Questions Imported**: 32 canonical items.
- **External Challenges Seeded**: 5 official links across HackerRank and LeetCode.
- **Solution Gating**: Verified that solution guidance is not returned to client endpoints unless `question_attempts` contains a completed record for that user.
