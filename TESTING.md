# Testing & Quality Assurance — JavaQuest

This document details the test strategy, automated test coverage, and execution instructions for JavaQuest.

---

## 1. Automated Test Suite Overview

Automated tests are located in `backend/tests/test_api.py` and run via `pytest`.

### Test Coverage Matrix
| Test Case | Module | Description | Verification Method |
| :--- | :--- | :--- | :--- |
| `test_health` | System | Verifies health check endpoint | Returns HTTP 200 and `{"status": "ok"}` |
| `test_auth_and_profile` | Auth | User registration, login, JWT token issue, and `/auth/me` | Bcrypt hash, token payload decode, learner role |
| `test_companion_registration_and_space` | Spaces | Learner creates space with invite code; companion registers and joins | Validates 8-character invite code and multi-user membership |
| `test_question_bank_and_solution_reveal` | Questions | Solution guidance hiding before attempt; solution reveal after attempt; duplicate XP prevention | Asserts `solution_guidance is None` before attempt, unlocked after attempt, and second attempt yields 0 XP |
| `test_daily_institute_session` | Today's Sync | Generates 9-step pedagogical session, completes step, finalizes session | Asserts 9 items generated, item completion flag, and +50 XP award |
| `test_companion_challenge_independent_submissions` | Companion | Dual blind submission lock: User B cannot see User A's answer until User B submits; both unlock upon dual submission | Asserts `"Hidden until both"` in companion view before submission, and unlocked code after submission |
| `test_ai_mentor_conversation` | AI Mentor | Starts Python vs Java session and queries differences in constructors | Asserts contextual AI response explaining constructor differences |
| `test_project_lab_and_external_practice` | Projects & Ext | Retrieves projects, completes milestone, updates external challenge status | Verifies milestone reflection update and external status to `solved` |

---

## 2. Executing Automated Tests

### Running with Pytest:
```powershell
cd D:\Java\backend
.\venv\Scripts\pytest
```

### Pytest Run Results:
```
============================= test session starts =============================
platform win32 -- Python 3.13.2, pytest-9.2.0, pluggy-1.7.0
rootdir: D:\Java\backend
configfile: pytest.ini
plugins: anyio-4.16.0, asyncio-1.4.1
asyncio: mode=Mode.AUTO, debug=False, asyncio_default_fixture_loop_scope=function
collected 8 items

tests\test_api.py ........                                               [100%]

======================== 8 passed, 1 warning in 3.01s =========================
```

---

## 3. Frontend Verification

Frontend compilation is verified via TypeScript compiler and Vite bundler:

```powershell
cd D:\Java\frontend
npm run build
```

### Build Result:
```
✓ 2077 modules transformed.
dist/index.html                   0.45 kB │ gzip:   0.29 kB
dist/assets/index-DX8OSrwv.css   33.99 kB │ gzip:   6.52 kB
dist/assets/index-K-fIxnih.js   407.81 kB │ gzip: 114.92 kB
✓ built in 772ms
```
Zero lint or type errors detected.
