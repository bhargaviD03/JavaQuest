# Architecture Specification — JavaQuest

## 1. System Overview

JavaQuest is architected as a clean, decoupled client-server web application adhering to modern enterprise design principles.

```
                      +-----------------------------+
                      |       React + Vite PWA      |
                      |   (TypeScript, Tailwind)    |
                      +--------------+--------------+
                                     |
                                REST API
                                 (JSON)
                                     |
                      +--------------v--------------+
                      |       FastAPI Gateway       |
                      |   (CORS, JWT Auth Filters)  |
                      +--------------+--------------+
                                     |
      +------------------------------+------------------------------+
      |                              |                              |
+-----v-----+                  +-----v-----+                  +-----v-----+
| Services  |                  | AI Mentor |                  | Database  |
|  Layer    |                  |  Adapter  |                  | (ORM/SQL) |
+-----+-----+                  +-----+-----+                  +-----+-----+
      |                              |                              |
      | - Roadmap                    | - Gemini 1.5 Flash           | - SQLAlchemy
      | - Question Bank              | - OpenAI GPT-4o-mini         | - Alembic
      | - Daily Sessions             | - Smart Offline Mock         | - PostgreSQL
      | - Gamification                                              |   / SQLite
      | - Companion Mode
```

---

## 2. Directory Structure

```
D:\Java\
├── backend\                         # Backend root (matches campus-ai architecture)
│   ├── api\v1\                      # REST Route Handlers
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── roadmap.py
│   │   ├── daily_session.py
│   │   ├── questions.py
│   │   ├── mentor.py
│   │   ├── companion.py
│   │   ├── projects.py
│   │   ├── external_practice.py
│   │   └── gamification.py
│   ├── core\                        # Core configuration and database connection
│   │   ├── config.py                # Pydantic BaseSettings
│   │   ├── database.py              # Engine, SessionLocal, Base
│   │   └── security.py              # Bcrypt hashing, JWT tokens
│   ├── models\                      # SQLAlchemy 2.0 ORM entities
│   │   ├── user.py
│   │   ├── learning.py
│   │   ├── question_bank.py
│   │   ├── daily_session.py
│   │   ├── mentor.py
│   │   ├── gamification.py
│   │   ├── companion.py
│   │   └── project.py
│   ├── schemas\                     # Pydantic v2 DTO request/response schemas
│   │   ├── auth.py
│   │   ├── learning.py
│   │   ├── question.py
│   │   ├── daily_session.py
│   │   ├── mentor.py
│   │   ├── gamification.py
│   │   ├── companion.py
│   │   └── project.py
│   ├── services\                    # Domain business logic & transactions
│   │   ├── auth_service.py
│   │   ├── roadmap_service.py
│   │   ├── question_service.py
│   │   ├── daily_session_service.py
│   │   ├── ai_service.py
│   │   ├── companion_service.py
│   │   ├── project_service.py
│   │   └── gamification_service.py
│   ├── alembic\                     # Database migration versions
│   │   ├── versions\
│   │   └── env.py
│   ├── seed_data\
│   │   ├── javaquest_question_bank_v1.json  # Canonical practice dataset
│   │   ├── generate_bank.py
│   │   └── seed_runner.py           # Idempotent standalone seed runner
│   ├── tests\
│   │   └── test_api.py              # Pytest automated test suite
│   ├── main.py                      # Direct entrypoint (`python main.py`)
│   ├── alembic.ini
│   ├── pytest.ini
│   ├── requirements.txt
│   └── Dockerfile
├── frontend\                        # Modern React + Vite frontend
│   ├── src\
│   │   ├── components\
│   │   │   ├── common\              # Design system primitives (Button, Card, Badge, CodeBlock, Modal)
│   │   │   └── layout\              # Navbar, Sidebar, AppLayout
│   │   ├── context\
│   │   │   └── AuthContext.tsx      # Auth & Space state provider
│   │   ├── pages\                   # Route view pages
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── TodayInstituteTopicPage.tsx
│   │   │   ├── RoadmapPage.tsx
│   │   │   ├── QuestionBankPage.tsx
│   │   │   ├── ChallengeArenaPage.tsx
│   │   │   ├── AIMentorPage.tsx
│   │   │   ├── CompanionSpacePage.tsx
│   │   │   ├── ProjectLabPage.tsx
│   │   │   ├── ExternalPracticePage.tsx
│   │   │   └── ProfilePage.tsx
│   │   ├── services\
│   │   │   └── api.ts               # Typed fetch client with Bearer auth
│   │   ├── types\
│   │   │   └── index.ts             # TypeScript domain interfaces
│   │   ├── App.tsx                  # BrowserRouter & ProtectedRoutes
│   │   ├── main.tsx
│   │   └── index.css                # Tailwind CSS base and utility directives
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── Dockerfile
├── javaquest_question_bank_v1.json  # Root canonical question bank
├── docker-compose.yml               # Multi-container orchestration
├── .env.example                     # Environment template
└── README.md
```

---

## 3. Direct Execution Model

1. **Backend**:
   - The backend runs directly via `python main.py` or `uvicorn main:app --reload` from `backend/`.
   - Contains an embedded `if __name__ == "__main__":` entrypoint invoking Uvicorn on port 8000.
   - Eliminates nested `app` directory wrapper for immediate clarity matching root projects like `campus-ai`.

2. **Frontend**:
   - The frontend runs directly via `npm run dev` from `frontend/`.
   - Production bundle built via `npm run build` targeting `dist/`.
