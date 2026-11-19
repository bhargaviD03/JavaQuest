from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from models.daily_session import DailySession, DailySessionItem
from models.question_bank import QuestionBank
from models.user import User
from schemas.daily_session import DailySessionCreate
from services.gamification_service import award_xp, unlock_achievement

def create_daily_session(db: Session, user: User, data: DailySessionCreate) -> DailySession:
    session = DailySession(
        user_id=user.id,
        institute_topic=data.institute_topic,
        taught_summary=data.taught_summary,
        understood_summary=data.understood_summary,
        difficulty_notes=data.difficulty_notes,
        additional_notes=data.additional_notes,
        planned_minutes=data.planned_minutes,
        actual_minutes=0,
        status="active"
    )
    db.add(session)
    db.flush()

    # Find matching question from canonical bank
    search_term = f"%{data.institute_topic.split()[0]}%"
    matching_q = db.query(QuestionBank).filter(
        (QuestionBank.topic.ilike(search_term)) | 
        (QuestionBank.title.ilike(search_term))
    ).first()

    if not matching_q:
        matching_q = db.query(QuestionBank).first()

    topic = data.institute_topic
    difficulty = data.difficulty_notes or "Understanding the core concept and differences"

    # Step 1: Beginner-Friendly Explanation
    item1 = DailySessionItem(
        session_id=session.id,
        item_type="explanation",
        title="1. Beginner-Friendly Concept Breakdown",
        order_index=1,
        content=f"### What is {topic}?\n\nIn Java, **{topic}** is an essential Object-Oriented mechanism.\n\nYour instructor introduced this to help write modular, maintainable code. Here is the simplest way to understand it without confusing jargon: it provides structure so your code behaves predictably.",
        code_snippet=None
    )

    # Step 2: Real-World Analogy
    item2 = DailySessionItem(
        session_id=session.id,
        item_type="analogy",
        title="2. Real-World Analogy",
        order_index=2,
        content=f"### Real-World Picture\n\nThink of **{topic}** like a **Universal Remote Control** vs **Specific Device Actions**.\n\n- The remote defines the common button (`power()`, `volume()`).\n- Whether it controls a Television, Soundbar, or Projector, each device responds according to its specific implementation, but the user presses the same button.\n- This mirrors how Java decouples invocation from specific internal logic.",
        code_snippet=None
    )

    # Step 3: Java Code Examples
    item3 = DailySessionItem(
        session_id=session.id,
        item_type="code_example",
        title="3. Practical Java Code Example",
        order_index=3,
        content="### Clean Java Implementation\nStudy this code carefully. Notice how types and methods are declared:",
        code_snippet=(
            "// Java Example for: " + topic + "\n"
            "public class PaymentService {\n"
            "    // Overloaded method: accepts double amount\n"
            "    public void pay(double amount) {\n"
            "        System.out.println(\"Processing cash/card payment of $\" + amount);\n"
            "    }\n"
            "\n"
            "    // Overloaded method: accepts amount and coupon\n"
            "    public void pay(double amount, String couponCode) {\n"
            "        System.out.println(\"Applying coupon \" + couponCode + \" to payment of $\" + amount);\n"
            "    }\n"
            "}\n"
        )
    )

    # Step 4: Line-by-Line Walkthrough
    item4 = DailySessionItem(
        session_id=session.id,
        item_type="line_by_line",
        title="4. Line-by-Line Code Breakdown",
        order_index=4,
        content=(
            "### Line-by-Line Walkthrough\n"
            "- **Line 1**: Class definition establishing our service boundary.\n"
            "- **Line 3**: First method signature `pay(double)`. The compiler registers this signature.\n"
            "- **Line 8**: Overloaded version `pay(double, String)`. Different parameter list, same method name!\n"
            "- **Notice**: The compiler distinguishes them strictly by parameter count and types at compile time."
        )
    )

    # Step 5: Predict-the-Output Challenge
    item5 = DailySessionItem(
        session_id=session.id,
        item_type="predict_output",
        title="5. Predict-the-Output Challenge",
        order_index=5,
        content="### What will this print?\nTrace the execution mentally before typing your prediction.",
        code_snippet=(
            "PaymentService service = new PaymentService();\n"
            "service.pay(100.0);\n"
            "service.pay(100.0, \"JAVA2026\");"
        ),
        metadata_json={
            "expected_answer": "Processing cash/card payment of $100.0\nApplying coupon JAVA2026 to payment of $100.0",
            "explanation": "Java matches each call to the appropriate overloaded method based on argument count."
        }
    )

    # Step 6: Debugging Challenge
    item6 = DailySessionItem(
        session_id=session.id,
        item_type="debugging",
        title="6. Spot the Bug & Fix It",
        order_index=6,
        content=f"### Find and explain the compilation error\nThis snippet attempts to implement {topic} but has a subtle mistake:",
        code_snippet=(
            "public class Calculator {\n"
            "    public int add(int a, int b) { return a + b; }\n"
            "    public double add(int a, int b) { return a + b; } // Bug here!\n"
            "}"
        ),
        metadata_json={
            "bug": "In Java, methods cannot be overloaded based solely on return type. The parameter list must differ.",
            "hint": "Check the parameter lists of both add methods."
        }
    )

    # Step 7: Relevant Questions from Fixed Question Bank
    bank_info = {
        "canonical_id": matching_q.canonical_id if matching_q else "JQ-001",
        "title": matching_q.title if matching_q else "OOP Practice",
        "prompt": matching_q.prompt if matching_q else "Practice prompt",
        "hint": matching_q.hint if matching_q else "Review core concepts"
    }
    item7 = DailySessionItem(
        session_id=session.id,
        item_type="bank_challenge",
        title=f"7. Curated Practice Challenge ({bank_info['canonical_id']})",
        order_index=7,
        content=f"### Practice from Question Bank: {bank_info['title']}\n\n**Prompt:**\n{bank_info['prompt']}\n\n*Hint:* {bank_info['hint']}",
        metadata_json=bank_info
    )

    # Step 8: Knowledge Check
    item8 = DailySessionItem(
        session_id=session.id,
        item_type="knowledge_check",
        title="8. Rapid Knowledge Check",
        order_index=8,
        content=(
            f"### Quick Check: {topic}\n"
            "Question: When does Java verify method overloading vs method overriding?\n\n"
            "A) Both at runtime\n"
            "B) Overloading at compile-time; Overriding at runtime\n"
            "C) Overloading at runtime; Overriding at compile-time\n"
            "D) Both at compile-time"
        ),
        metadata_json={
            "correct_option": "B",
            "explanation": "Overloading is resolved statically by the compiler based on method signature. Overriding is resolved dynamically at runtime by JVM Dynamic Dispatch based on object instance."
        }
    )

    # Step 9: Reflection Activity
    item9 = DailySessionItem(
        session_id=session.id,
        item_type="reflection",
        title="9. Learning Reflection & Session Recap",
        order_index=9,
        content=(
            f"### Great job completing today's study on {topic}!\n\n"
            "Take 2 minutes to summarize in your own words:\n"
            "1. What is the one thing you understand now that was confusing in class?\n"
            "2. How will you explain this to your companion?\n\n"
            "Submit your reflection below to claim your Session XP!"
        )
    )

    db.add_all([item1, item2, item3, item4, item5, item6, item7, item8, item9])
    db.commit()
    db.refresh(session)
    return session

def complete_session_item(db: Session, session_id: int, item_id: int, user_response: Optional[str] = None):
    item = db.query(DailySessionItem).filter(
        DailySessionItem.id == item_id,
        DailySessionItem.session_id == session_id
    ).first()
    if not item:
        raise ValueError("Item not found")

    item.is_completed = True
    item.user_response = user_response
    item.completed_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(item)
    return item

def finish_daily_session(db: Session, user: User, session_id: int):
    session = db.query(DailySession).filter(
        DailySession.id == session_id,
        DailySession.user_id == user.id
    ).first()
    if not session:
        raise ValueError("Session not found")

    session.status = "completed"
    session.completed_at = datetime.now(timezone.utc)
    db.commit()

    # Award session completion XP
    xp_amount = 50
    awarded = award_xp(
        db=db,
        user=user,
        amount=xp_amount,
        reason=f"Completed Daily Institute Practice: {session.institute_topic}",
        reference_type="session_completion",
        reference_id=f"session_{session.id}"
    )

    unlock_achievement(db, user.id, "institute_sync")
    return {"status": "completed", "xp_awarded": xp_amount if awarded else 0}
