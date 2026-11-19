# JavaQuest — Gamified Java Learning Platform

> **"Don't build another platform that teaches Java. Build a platform that helps someone become confident in Java."**

JavaQuest is a complete, full-stack, production-minded Java learning companion designed to complement classroom learning at an institute. It empowers learners to log what was taught in class each day, practice with canonical challenges, receive progressive AI mentoring, and study alongside a companion with independent progress tracking.

---

## 🌟 Key Features

1. **Today's Institute Topic (Core Focus)**
   - Log today's lecture topic, what the instructor covered, and what felt difficult.
   - Automatically generates a structured 9-step pedagogical session:
     `Concept breakdown` &rarr; `Real-world analogy` &rarr; `Java code example` &rarr; `Line-by-line explanation` &rarr; `Predict-the-output` &rarr; `Spot the bug` &rarr; `Curated bank challenge` &rarr; `Rapid knowledge check` &rarr; `Reflection & milestone celebration`.
2. **Companion Mode (Pair Learning)**
   - Separate accounts for the **Learner** and **Companion**.
   - Shared learning spaces with 8-character invite codes.
   - **Blind Dual Submission Lock**: Both users submit challenge solutions independently. Neither can see the other's code until *both* have submitted, unlocking side-by-side comparison and design discussion.
3. **Canonical Question Bank (32 Curated Questions)**
   - Pre-seeded from `javaquest_question_bank_v1.json` covering all 12 Java curriculum modules.
   - Search by keyword/ID, filter by Topic, Difficulty, Question Type, and Completion Status.
   - **Solution Reveal Gating**: Solution guidance is hidden by default and only unlocked after submitting an attempt.
4. **Context-Aware AI Java Mentor (6 Modes)**
   - **Explain Mode**: Beginner-friendly explanations with real-world analogies.
   - **Python vs Java Mode**: Side-by-side syntax and runtime comparisons for Python programmers.
   - **Debug Mode**: Step-by-step compiler error breakdown and guided troubleshooting.
   - **Progressive Hint Mode**: One small nudge at a time without spoiling the answer.
   - **Quiz Mode**: Socratic questions directly linked to the curriculum.
   - **Explain It Back Mode**: Student explains in own words; AI evaluates and provides feedback.
5. **12-Module Progressive Java Roadmap**
   - OOP Foundations, Encapsulation, Inheritance, Polymorphism, Abstraction, Core Java, Java Essentials, DSA, JDBC & SQL, Spring Boot, Backend Engineering, and Capstone Projects.
   - Flexible topic status tracking (`not_started`, `in_progress`, `practising`, `needs_revision`, `mastered`).
6. **Project Lab**
   - Hands-on engineering scaffolds: *Student Management System*, *Bank Account Management*, *JDBC CRUD Database Application*, and *Spring Boot REST API*.
   - Interactive milestone checklist with learner code submission and reflection logs (+35 XP each).
7. **Auditable Gamification Engine**
   - Formulaic leveling: `Level = 1 + (Total XP // 200)`.
   - Dedicated `xp_transactions` ledger with unique database constraint `(user_id, reference_type, reference_id)` preventing duplicate reward exploits.
   - Achievement badges and confetti milestone celebrations.
8. **External Coding Practice**
   - Curated official external links to HackerRank and LeetCode domains.
   - Zero scraping of copyrighted problem sets; tracks attempt status and notes.

---

## 🛠️ Technology Stack & Structure

Matching clean root-folder project architectures (e.g. `campus-ai`):
- **Backend**: Python 3.13, FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, PyJWT, Bcrypt
  - Starts directly via `python main.py` or `uvicorn main:app --reload`
  - Modular organization directly in `backend/` (`core/`, `models/`, `schemas/`, `services/`, `api/`, `main.py`) with zero unnecessary `app/` nesting.
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas-Confetti
  - Managed under `frontend/` (`src/`, `package.json`, `npm run dev`, `npm run build`)
- **Database**: PostgreSQL 16 (Production / Docker) & SQLite (Zero-config local development)
- **AI Engine**: Provider-independent abstraction supporting Google Gemini 1.5 Flash, OpenAI GPT-4o-mini, or Smart Offline Expert Mock

---

## 🚀 Quick Start Guide

### Option A: Local Development (Instant Startup with SQLite)

#### 1. Backend Setup
```powershell
cd D:\Java\backend

# Install dependencies
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\pip install email-validator

# Run database migrations and seed data
.\venv\Scripts\alembic upgrade head
.\venv\Scripts\python seed_data\seed_runner.py

# Start Backend directly with main.py:
.\venv\Scripts\python main.py
```
Backend API will be running at `http://localhost:8000` with Swagger docs at `http://localhost:8000/docs`.

#### 2. Frontend Setup
In a second terminal:
```powershell
cd D:\Java\frontend
npm install
npm run dev
```
Frontend application will be accessible at `http://localhost:5173`.

---

### Option B: Docker Compose (Full Stack with PostgreSQL)

```powershell
cd D:\Java
docker-compose up --build
```
- Frontend: `http://localhost:5173` (or `http://localhost:80`)
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## 🧪 Running Automated Tests

### Backend Pytest Suite:
```powershell
cd D:\Java\backend
.\venv\Scripts\pytest
```
*Result: 8/8 automated tests pass with 100% success.*

### Frontend Production Build Verification:
```powershell
cd D:\Java\frontend
npm run build
```
*Result: Clean compilation and bundle generation in under 1 second.*

---

## 👤 Quick Demo Accounts

You can register a new account on the UI or use the pre-configured demo profiles:

| Account Type | Username / Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Learner** | `java_learner` / `learner@javaquest.dev` | `SecretPassword123!` | Primary Student |
| **Companion** | `py_companion` / `companion@javaquest.dev` | `SecretPassword123!` | Pair Learning Partner |

*(Quick Demo buttons on the `/login` page allow one-click autofill for testing).*
