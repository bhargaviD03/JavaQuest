# Product Requirements Document (PRD) — JavaQuest

## 1. Product Summary & Vision
JavaQuest is a personalized, gamified Java learning companion designed to complement classroom learning at an institute. Rather than presenting generic quizzes or passive video lectures, JavaQuest helps learners build genuine confidence in Object-Oriented Programming (OOP) and modern enterprise Java.

### Core Philosophy
> **"Don't build another platform that teaches Java. Build a platform that helps someone become confident in Java."**

---

## 2. Target Personas & User Roles

### 2.1 The Learner (Primary Student)
- Currently studying Core Java and Object-Oriented Programming through an institute.
- Needs daily reinforcement matching what the instructor taught that morning.
- Struggles with nuanced concepts like dynamic method dispatch, constructor chaining, covariant return types, and interface contracts.
- Benefits from low-friction practice, progressive hints, and auditable gamification.

### 2.2 The Companion (Peer Learning Partner)
- Learns alongside the student.
- Often comes from a Python background or is reviewing Java fundamentals.
- Benefits from the dedicated **Python vs Java** comparison mode in the AI Mentor.
- Participates in pair study via **Companion Mode**: solves challenges in parallel with separate progress tracking.

---

## 3. Key Functional Modules

### Module A: Authentication, Roles & Shared Learning Spaces
- Email/Username + password registration and login.
- JWT token pair with 24-hour access token and 7-day refresh token.
- Secure password hashing with bcrypt.
- Independent progress isolation: Companion cannot alter learner progress, XP, or lesson statuses.
- Shared Learning Spaces with an 8-character unique invite code.

### Module B: Personalized Dashboard
- Dynamic time-of-day greeting.
- Visual display of Level, Total XP, Day Streak, and Progress to Next Level.
- Prominent **"Start Today's Learning Session"** CTA button.
- Daily Challenge card directly selected from the curated question bank.
- Summary of Active Focus topics and topics scheduled for revision.
- Companion activity status and recent attempts ledger.

### Module C: 12-Module Java Learning Roadmap
1. OOP Foundations (Classes, Objects, Constructors, `this`, Instance vs Static)
2. Encapsulation (Access modifiers, Getters/Setters, Invariants, Immutability)
3. Inheritance (`extends`, `super`, Constructor chaining, Method overriding)
4. Polymorphism (Overloading vs Overriding, Dynamic dispatch, Covariant returns)
5. Abstraction & Interfaces (Abstract classes, Interface contracts, Default methods)
6. Core Java (String Constant Pool, Immutability, Collections Framework, Generics)
7. Java Essentials (Checked vs Unchecked Exceptions, Try-with-resources, Streams & Lambdas)
8. Data Structures & Algorithms (Searching, Sorting, Hashing, Deque, Stack)
9. JDBC & SQL (PreparedStatements, SQL injection prevention, ACID Transactions)
10. Spring Boot (IoC, Constructor Dependency Injection, REST Controllers, Spring Data JPA)
11. Backend Engineering (Spring Security, JWT Filters, Jakarta DTO Validation)
12. Capstone Projects (Enterprise Layered Architecture)

Each topic supports independent status tracking: `not_started`, `in_progress`, `practising`, `needs_revision`, `mastered`.

### Module D: Today's Institute Topic (Core Feature)
- Dedicated input screen capturing:
  - Institute Topic
  - What the instructor taught
  - What the learner understood
  - What the learner found difficult
  - Planned practice duration (default 45 min)
- Generates a structured 9-step pedagogical session:
  1. Beginner-Friendly Concept Breakdown
  2. Real-World Analogy
  3. Practical Java Code Example
  4. Line-by-Line Code Breakdown
  5. Predict-the-Output Challenge
  6. Spot the Bug & Fix It
  7. Curated Practice Challenge (from fixed question bank)
  8. Rapid Knowledge Check
  9. Learning Reflection & Milestone Rewards (+50 XP)

### Module E: Curated Question Bank
- Canonical dataset seeded from `javaquest_question_bank_v1.json`.
- 32+ original practice questions covering all 12 curriculum modules.
- Question types: `Code design`, `Predict output`, `Debugging`, `Explain code`, `Coding`, `Knowledge check`, `Mini design challenge`.
- Strict Solution Reveal Rule: Solution guidance remains hidden until the user submits their first attempt.
- Idempotent seed runner preventing duplicates.

### Module F: External Coding Practice
- Curated official external links to HackerRank (Java Domain, Data Structures, Intro) and LeetCode (Problem Set, Explore).
- Zero unauthorized scraping or redistribution of copyrighted challenge content.
- Personal progress tracking (`not_started`, `attempted`, `solved`, `needs_revision`) and notes.

### Module G: Challenge Arena
- Daily Challenge algorithm selecting unattempted questions from current focus topics.
- Progressive hints (Hint 1 -> Hint 2) preventing answer spoilers.
- Real-time submission, self-review rating, and solution unlocks.

### Module H: AI Java Mentor
- Autonomous pedagogical assistant with 6 specialized modes:
  1. **Explain Mode**: Beginner-friendly explanations with microwave/car analogies.
  2. **Python vs Java Mode**: Side-by-side comparison tables and code for Python programmers.
  3. **Debug Mode**: Compiler error breakdowns and guided questions.
  4. **Progressive Hint Mode**: One small nudge at a time.
  5. **Quiz Mode**: Socratic questions based on canonical concepts.
  6. **Explain It Back Mode**: Student explains in own words; AI evaluates understanding.
- Support for Gemini, OpenAI, or zero-config offline smart mock.

### Module I: Auditable Gamification
- Formula-driven leveling: `Level = 1 + (Total XP // 200)`.
- Auditable `xp_transactions` ledger with unique database constraint `(user_id, reference_type, reference_id)` preventing duplicate reward exploits.
- Achievement badges (First Step, Institute Sync, Consistent Coder, Object Architect, Pair Programmer, Software Crafter, Bug Hunter).

### Module J: Companion Mode (Pair Study)
- Shared challenge sessions in common learning space.
- **Independent Submissions**: Neither user can view the other's code until both have submitted.
- Locked status: `"🔒 [Hidden until both users have submitted]"`.
- Upon dual submission: status transitions to `both_revealed`, unlocking side-by-side comparison, design reasoning, and shared discussion.

### Module K: Project Lab
- Production scaffolds:
  - Student Management System (ArrayList, Validation, Custom Exceptions)
  - Bank Account Management (Abstract Classes, Overdraft, Inheritance)
  - JDBC CRUD Database Application (ACID Transactions, PreparedStatements)
  - Spring Boot REST API (ControllerAdvice, DTO Validation, Spring Data JPA)
- Verified milestone submissions (+35 XP each) and reflection logs.

---

## 4. Non-Functional Requirements
- **Performance**: Sub-50ms API response times on local database; client-side bundle under 450 KB gzipped.
- **Security**: Bcrypt password hashing, stateless JWT authorization, strict backend ownership verification.
- **Reliability**: 100% test pass rate across authentication, roadmap, question bank, daily sessions, and companion mode.
- **Responsiveness**: Fully responsive desktop and mobile layouts using Tailwind CSS.
