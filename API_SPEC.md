# API Specification — JavaQuest

Base URL: `/api/v1`

All protected endpoints require an `Authorization: Bearer <access_token>` header.

---

## 1. Authentication & Profile (`/auth`)

### `POST /auth/register`
Creates a new account.
- **Request Body:**
  ```json
  {
    "email": "learner@javaquest.dev",
    "username": "java_learner",
    "password": "SecretPassword123!",
    "role": "learner",
    "avatar": "cat-coder"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "learner@javaquest.dev",
      "username": "java_learner",
      "role": "learner",
      "avatar": "cat-coder",
      "level": 1,
      "total_xp": 0,
      "current_streak": 1,
      "created_at": "2026-11-01T22:00:00Z"
    }
  }
  ```

### `POST /auth/login`
Authenticates with username or email.
- **Request Body:**
  ```json
  {
    "username_or_email": "java_learner",
    "password": "SecretPassword123!"
  }
  ```
- **Response (200 OK):** Token object with access token and user metadata.

### `POST /auth/refresh`
Refreshes an expired access token using a valid refresh token.

### `GET /auth/me`
Retrieves the authenticated user's profile and learning statistics.

### `PUT /auth/me`
Updates avatar and profile settings.

### `POST /auth/spaces`
Creates a shared pair study space and returns an 8-character invite code.
- **Request Body:** `{"name": "Java Pair Study Room"}`
- **Response (200 OK):** `{"id": 1, "name": "...", "invite_code": "9F4B12A8", ...}`

### `POST /auth/spaces/join`
Joins an existing space with an invite code.
- **Request Body:** `{"invite_code": "9F4B12A8"}`

---

## 2. Dashboard (`/dashboard`)

### `GET /dashboard/stats`
Returns personalized dashboard aggregates:
- Greeting
- Level, Total XP, Streak, XP to next level, Progress percentage
- Today's Institute Topic summary
- Daily challenge card selected from canonical bank
- Topics currently being learned & topics scheduled for revision
- Recent achievements & question attempts
- 7-day daily activity graph
- Companion active status and partner progress

---

## 3. Roadmap (`/roadmap`)

### `GET /roadmap/`
Returns all 12 modules, topics, and lessons annotated with the current user's progress status (`not_started`, `in_progress`, `practising`, `needs_revision`, `mastered`).

### `PUT /roadmap/lessons/{lesson_id}/status`
Updates status for a specific lesson and idempotently awards +20 XP upon reaching `mastered`.
- **Request Body:** `{"status": "mastered"}`

---

## 4. Today's Institute Topic (`/daily-session`)

### `POST /daily-session/`
Initializes a personalized 9-step learning session based on today's classroom lecture.
- **Request Body:**
  ```json
  {
    "institute_topic": "Method Overloading and Method Overriding",
    "taught_summary": "Instructor covered static binding vs dynamic method dispatch.",
    "understood_summary": "Overloading takes place inside one class.",
    "difficulty_notes": "Dynamic dispatch when upcasting reference types.",
    "planned_minutes": 45
  }
  ```
- **Response (200 OK):** Session object containing 9 generated pedagogical items.

### `GET /daily-session/latest`
Retrieves the user's latest active or most recent session.

### `POST /daily-session/{session_id}/items/{item_id}/complete`
Records user response for a specific step (e.g. prediction, bug explanation, reflection).
- **Request Body:** `{"user_response": "..."}`

### `POST /daily-session/{session_id}/finish`
Finalizes the daily session and awards +50 XP and the `institute_sync` achievement.

---

## 5. Question Bank (`/questions`)

### `GET /questions/`
Queries canonical question bank with pagination, search, and filters:
- Parameters: `topic`, `difficulty`, `question_type`, `status_filter`, `search`, `limit`, `offset`.
- **Note:** `solution_guidance` is returned as `null` unless the user has attempted the question.

### `GET /questions/daily/today`
Returns the curated Daily Challenge selected by algorithm.

### `GET /questions/{question_id}`
Returns details for a single question.

### `POST /questions/{question_id}/attempt`
Submits solution code, records self-assessment, awards +25 XP (idempotently registered), and unlocks `solution_guidance`.
- **Request Body:**
  ```json
  {
    "submitted_answer": "public class Book { ... }",
    "self_assessment": "understood"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "attempt_id": 12,
    "is_correct": true,
    "xp_awarded": 25,
    "solution_guidance": "A Book object should retain its own data; do not use static fields.",
    "ai_feedback": "Good effort on OOP Foundations: Practice 01! Compare your code against the unlocked solution guidance."
  }
  ```

### `POST /questions/{question_id}/bookmark`
Toggles bookmark status.

---

## 6. AI Java Mentor (`/mentor`)

### `POST /mentor/conversations`
Starts a new mentor session.
- **Request Body:**
  ```json
  {
    "title": "Python vs Java OOP",
    "mode": "python_vs_java",
    "topic_context": "Classes and Constructors"
  }
  ```

### `POST /mentor/conversations/{conv_id}/messages`
Sends user message and returns contextual AI mentor response according to the chosen mode:
- Modes: `explain`, `python_vs_java`, `debug`, `progressive_hint`, `quiz`, `explain_back`.

---

## 7. Companion Mode (`/companion`)

### `POST /companion/sessions`
Launches a shared pair challenge session in a learning space.
- **Request Body:** `{"space_id": 1, "question_id": 2, "title": "Shared Arena Session"}`

### `GET /companion/sessions/{session_id}`
Retrieves session status and submissions.
- **Privacy Lock:** If both partners have not submitted, the partner's submission is masked as `🔒 [Hidden until both users have submitted]`.

### `POST /companion/sessions/{session_id}/submit`
Submits independent answer and reasoning. If both users have submitted, unlocks both answers and awards +40 XP to each partner.

---

## 8. Project Lab & External Practice

### `GET /projects/`
Lists guided software engineering projects with user milestone progress.

### `POST /projects/{project_id}/milestones/{milestone_index}`
Submits milestone implementation code and reflection log, awarding +35 XP.

### `GET /external-practice/`
Lists official HackerRank and LeetCode domains and practice tracks.

### `PUT /external-practice/{challenge_id}/status`
Updates challenge status (`not_started`, `attempted`, `solved`, `needs_revision`) and user notes.

---

## 9. Gamification (`/gamification`)

### `GET /gamification/achievements`
Returns achievements and unlocked timestamps for the user.

### `GET /gamification/transactions`
Returns auditable ledger of all XP transactions.
