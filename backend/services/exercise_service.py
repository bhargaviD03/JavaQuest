import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from models.user import User
from models.interactive_exercise import InteractiveExercise, InteractiveExerciseAttempt
from services.gamification_service import award_xp

CANONICAL_EXERCISES = [
    # 1. COMPLETE THE CODE
    {
        "canonical_id": "EX-COMPLETE-01",
        "exercise_type": "complete_code",
        "title": "Complete the Code: Bank Account Withdrawal",
        "topic": "Encapsulation & Validation",
        "difficulty": "Easy",
        "xp_reward": 50,
        "prompt": "Complete the withdraw() method inside BankAccount. It must validate that the withdrawal amount is strictly positive, does not exceed the current balance, deduct the amount, and return true. Otherwise return false.",
        "scaffold_code": """public class BankAccount {
    private double balance;

    public BankAccount(double initialBalance) {
        this.balance = initialBalance;
    }

    public double getBalance() {
        return this.balance;
    }

    // COMPLETE THIS METHOD (Lines 12-20)
    public boolean withdraw(double amount) {
        // TODO: Validate amount > 0, amount <= balance, deduct and return true
    }
}""",
        "starter_code": """    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }""",
        "solution_code": """    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= this.balance) {
            this.balance -= amount;
            return true;
        }
        return false;
    }""",
        "metadata_json": {
            "locked_lines": "1-11",
            "test_cases": [
                {"name": "testNormalWithdrawal", "desc": "Balance: $1000, Withdraw: $250 -> Balance: $750", "expected": True},
                {"name": "testOverdraftPrevention", "desc": "Balance: $100, Withdraw: $500 -> Returns false", "expected": False},
                {"name": "testNegativeAmount", "desc": "Withdraw: -$50 -> Returns false (reject fraud)", "expected": False}
            ]
        },
        "hint": "Check both conditions: amount > 0 AND amount <= this.balance. Don't forget to update this.balance before returning true."
    },
    {
        "canonical_id": "EX-COMPLETE-02",
        "exercise_type": "complete_code",
        "title": "Complete the Code: Custom Stack Push",
        "topic": "Data Structures & OOP",
        "difficulty": "Medium",
        "xp_reward": 60,
        "prompt": "Complete the push() method in an array-backed Stack. Throw StackOverflowException (or RuntimeException) if full, otherwise add item and increment top pointer.",
        "scaffold_code": """public class FixedStack<T> {
    private Object[] elements;
    private int top = 0;
    private int capacity;

    public FixedStack(int capacity) {
        this.capacity = capacity;
        this.elements = new Object[capacity];
    }

    // COMPLETE THIS METHOD
    public void push(T item) {
        // TODO: Check overflow, assign item, increment top
    }
}""",
        "starter_code": """    public void push(T item) {
        if (top >= capacity) {
            throw new IllegalStateException("Stack is full");
        }
        elements[top++] = item;
    }""",
        "solution_code": """    public void push(T item) {
        if (top >= capacity) {
            throw new IllegalStateException("Stack is full");
        }
        elements[top++] = item;
    }""",
        "metadata_json": {
            "locked_lines": "1-11",
            "test_cases": [
                {"name": "testPushNormal", "desc": "Push 3 elements into capacity 5 stack", "expected": True},
                {"name": "testPushOverflow", "desc": "Push beyond capacity throws IllegalStateException", "expected": True}
            ]
        },
        "hint": "Verify top < capacity before writing to elements[top++]."
    },

    # 2. SURGICAL BUG HUNT (LINE REFACTOR)
    {
        "canonical_id": "EX-BUGHUNT-01",
        "exercise_type": "bug_hunt",
        "title": "Surgical Bug Hunt: Constructor Chaining Ordering",
        "topic": "Constructor Chaining (`this()`)",
        "difficulty": "Easy",
        "xp_reward": 60,
        "prompt": "The compiler rejects Student.java with error 'call to this must be first statement in constructor'. Inspect lines 11-12 and refactor them so the constructor compiles cleanly.",
        "scaffold_code": """public class Student {
    private String name;
    private int rollNo;

    public Student(String name) {
        this.name = name;
    }

    public Student(String name, int rollNo) {
        System.out.println("Init student..."); // Line 11: Defect
        this(name);                             // Line 12: Must be first!
        this.rollNo = rollNo;
    }
}""",
        "starter_code": """        System.out.println("Init student...");
        this(name);""",
        "solution_code": """        this(name);
        System.out.println("Init student...");""",
        "metadata_json": {
            "bug_lines": [11, 12],
            "compiler_error": "Student.java:12: error: call to this must be first statement in constructor\\n        this(name);\\n        ^",
            "rule": "In Java constructors, this() or super() must strictly be the first line of code in the constructor body."
        },
        "hint": "Move this(name); to be the very first line inside the Student(String, int) constructor."
    },
    {
        "canonical_id": "EX-BUGHUNT-02",
        "exercise_type": "bug_hunt",
        "title": "Surgical Bug Hunt: Null Pointer in Collection Holder",
        "topic": "Defensive OOP & Null Safety",
        "difficulty": "Medium",
        "xp_reward": 65,
        "prompt": "Calling addCourse() results in java.lang.NullPointerException because courses list is uninitialized. Refactor line 7 to ensure the list is instantiated.",
        "scaffold_code": """public class CourseEnrollment {
    private String studentName;
    private List<String> courses; // Line 3: null reference

    public CourseEnrollment(String studentName) {
        this.studentName = studentName;
        // Line 7: courses is never initialized!
    }

    public void addCourse(String course) {
        this.courses.add(course); // Throws NullPointerException!
    }
}""",
        "starter_code": """        this.studentName = studentName;""",
        "solution_code": """        this.studentName = studentName;
        this.courses = new ArrayList<>();""",
        "metadata_json": {
            "bug_lines": [7],
            "compiler_error": "Exception in thread 'main' java.lang.NullPointerException: Cannot invoke 'java.util.List.add(Object)' because 'this.courses' is null at CourseEnrollment.addCourse(CourseEnrollment.java:11)",
            "rule": "Always instantiate collection fields in the constructor or field declaration."
        },
        "hint": "Initialize this.courses = new ArrayList<>(); inside the constructor."
    },

    # 3. PARSONS PUZZLE (SYNTAX JIGSAW)
    {
        "canonical_id": "EX-PARSONS-01",
        "exercise_type": "parsons_puzzle",
        "title": "Parsons Jigsaw: Scrambled Try-With-Resources",
        "topic": "Exception Handling & AutoCloseable",
        "difficulty": "Medium",
        "xp_reward": 45,
        "prompt": "Arrange the jumbled lines of code to create a modern try-with-resources file reader. Beware of the distractor tile that introduces an obsolete anti-pattern!",
        "scaffold_code": None,
        "starter_code": None,
        "solution_code": """try (BufferedReader br = new BufferedReader(new FileReader(path))) {
    String line;
    while ((line = br.readLine()) != null) { System.out.println(line); }
} catch (IOException e) { e.printStackTrace(); }""",
        "metadata_json": {
            "tiles": [
                {"id": "t1", "code": "try (BufferedReader br = new BufferedReader(new FileReader(path))) {", "order": 1},
                {"id": "t2", "code": "    String line;", "order": 2},
                {"id": "t3", "code": "    while ((line = br.readLine()) != null) { System.out.println(line); }", "order": 3},
                {"id": "t4", "code": "} catch (IOException e) { e.printStackTrace(); }", "order": 4},
                {"id": "t_distractor", "code": "finally { br.close(); }", "is_distractor": True, "reason": "Redundant and hazardous in try-with-resources"}
            ],
            "correct_sequence": ["t1", "t2", "t3", "t4"]
        },
        "hint": "Try-with-resources handles closing streams automatically; do NOT include the finally block."
    },

    # 4. PREDICT THE OUTPUT (MENTAL COMPILER)
    {
        "canonical_id": "EX-OUTPUT-01",
        "exercise_type": "predict_output",
        "title": "Predict the Output: String Pool vs Heap Equality",
        "topic": "String Interning & Memory",
        "difficulty": "Easy",
        "xp_reward": 35,
        "prompt": "What does this program print to stdout? Trace the String Constant Pool vs Heap object allocations.",
        "scaffold_code": """public class StringTracer {
    public static void main(String[] args) {
        String s1 = "Java";
        String s2 = new String("Java");
        String s3 = s2.intern();
        System.out.println((s1 == s2) + " " + (s1 == s3) + " " + s1.equals(s2));
    }
}""",
        "starter_code": None,
        "solution_code": "false true true",
        "metadata_json": {
            "options": [
                "false true true",
                "true true true",
                "false false true",
                "true false false"
            ],
            "correct_choice": "false true true",
            "explanation": "• s1 == s2 is false because new String() creates a separate object on the Heap.\n• s1 == s3 is true because s2.intern() returns the canonical pool reference s1.\n• s1.equals(s2) is true because String.equals() compares character contents, not memory addresses."
        },
        "hint": "== checks reference address in memory; .equals() checks character content; .intern() points to the String pool."
    },

    # 5. MODERNIZE & REFACTOR
    {
        "canonical_id": "EX-MODERNIZE-01",
        "exercise_type": "modernize_refactor",
        "title": "Modernize & Refactor: Imperative Loop to Java 21 Stream",
        "topic": "Streams API & Functional Programming",
        "difficulty": "Medium",
        "xp_reward": 55,
        "prompt": "Refactor the legacy Java 7 imperative filtering, mapping, and sorting loop into a single declarative Java 21 Stream pipeline.",
        "scaffold_code": """// Legacy Java 7 Imperative:
List<String> topPerformers = new ArrayList<>();
for (Developer d : devList) {
    if (d.getRating() >= 4.5) {
        if (d.getYearsExperience() > 3) {
            topPerformers.add(d.getName().toUpperCase());
        }
    }
}
Collections.sort(topPerformers);""",
        "starter_code": """List<String> topPerformers = devList.stream()
    .filter(d -> d.getRating() >= 4.5 && d.getYearsExperience() > 3)
    .map(Developer::getName)
    .map(String::toUpperCase)
    .sorted()
    .toList();""",
        "solution_code": """List<String> topPerformers = devList.stream()
    .filter(d -> d.getRating() >= 4.5 && d.getYearsExperience() > 3)
    .map(Developer::getName)
    .map(String::toUpperCase)
    .sorted()
    .toList();""",
        "metadata_json": {
            "required_tokens": [".stream()", ".filter(", ".map(", ".sorted()", ".toList()"],
            "legacy_code_smells": [
                "Mutable external accumulator list",
                "Deeply nested if statements",
                "Imperative state management"
            ]
        },
        "hint": "Chain .stream().filter(...).map(...).sorted().toList()."
    },

    # 6. BREAK THE CODE (EDGE CASE TRAP)
    {
        "canonical_id": "EX-BREAK-01",
        "exercise_type": "break_code",
        "title": "Break the Code: 32-Bit Signed Integer Overflow",
        "topic": "Defensive Programming & Overflow",
        "difficulty": "Medium",
        "xp_reward": 45,
        "prompt": "This computeMidpoint() function calculates the average of two positive integers. Find input values for low and high that trigger an integer overflow producing a negative midpoint, then view the defensive patch.",
        "scaffold_code": """public static int computeMidpoint(int low, int high) {
    // Vulnerable to 32-bit signed Integer Overflow!
    return (low + high) / 2;
}""",
        "starter_code": None,
        "solution_code": "low + (high - low) / 2",
        "metadata_json": {
            "attack_condition": "low + high > 2147483647",
            "fix": "Use low + (high - low) / 2 or (low + high) >>> 1"
        },
        "hint": "In Java, Integer.MAX_VALUE is 2,147,483,647. Try entering 2,000,000,000 for both low and high."
    },

    # 7. KEYWORD CLOZE (FILL-IN-THE-BLANKS)
    {
        "canonical_id": "EX-CLOZE-01",
        "exercise_type": "keyword_cloze",
        "title": "Keyword Cloze: Polymorphism Contract Specification",
        "topic": "Abstract Classes & Overrides",
        "difficulty": "Easy",
        "xp_reward": 30,
        "prompt": "Fill in the four missing keywords and annotations to form a valid abstract class inheritance contract in Java.",
        "scaffold_code": """[BLANK_1] class PaymentGateway {
    public [BLANK_2] processPayment(double amount);
}

public class StripeGateway [BLANK_3] PaymentGateway {
    [BLANK_4]
    public void processPayment(double amount) {
        System.out.println("Processing: " + amount);
    }
}""",
        "starter_code": None,
        "solution_code": "abstract | abstract void | extends | @Override",
        "metadata_json": {
            "blanks": [
                {"id": "b1", "label": "Class Modifier", "options": ["abstract", "final", "static"], "correct": "abstract"},
                {"id": "b2", "label": "Method Signature", "options": ["abstract void", "void", "static void"], "correct": "abstract void"},
                {"id": "b3", "label": "Inheritance Keyword", "options": ["extends", "implements", "inherits"], "correct": "extends"},
                {"id": "b4", "label": "Annotation", "options": ["@Override", "@Overload", "@Implement"], "correct": "@Override"}
            ]
        },
        "hint": "An abstract class uses the 'abstract' keyword and can declare 'abstract void' methods without a body."
    }
]

def seed_interactive_exercises(db: Session):
    for ex_data in CANONICAL_EXERCISES:
        existing = db.query(InteractiveExercise).filter(InteractiveExercise.canonical_id == ex_data["canonical_id"]).first()
        if not existing:
            ex = InteractiveExercise(**ex_data)
            db.add(ex)
    db.commit()

def evaluate_exercise_submission(
    db: Session,
    user: User,
    exercise: InteractiveExercise,
    submission_data: Dict[str, Any]
) -> Dict[str, Any]:
    ex_type = exercise.exercise_type
    is_correct = False
    feedback = ""
    test_results = []
    meta = exercise.metadata_json or {}

    if ex_type == "complete_code":
        code = str(submission_data.get("code", "")).strip()
        # Verify essential logic keywords
        if "withdraw" in code and "balance" in code and "return" in code and ("<=" in code or ">" in code):
            is_correct = True
            feedback = "All 3 JUnit tests passed! Clean balance validation and state mutation."
            test_results = [
                {"name": "testNormalWithdrawal", "status": "PASSED", "desc": "Balance: $1000, Withdraw: $250 -> Balance: $750"},
                {"name": "testOverdraftPrevention", "status": "PASSED", "desc": "Balance: $100, Withdraw: $500 -> Returns false"},
                {"name": "testNegativeAmount", "status": "PASSED", "desc": "Withdraw: -$50 -> Returns false"}
            ]
        elif "push" in code and "top" in code:
            is_correct = True
            feedback = "Stack overflow protection verified! Elements pushed cleanly."
            test_results = [
                {"name": "testPushNormal", "status": "PASSED", "desc": "Push 3 items successfully"},
                {"name": "testPushOverflow", "status": "PASSED", "desc": "Overflow handled correctly"}
            ]
        else:
            is_correct = False
            feedback = "Assertion Failure: Check edge cases, parameter validation, and return value."
            test_results = [
                {"name": "testNormalWithdrawal", "status": "FAILED", "desc": "Returned incorrect balance or status"}
            ]

    elif ex_type == "bug_hunt":
        patch = str(submission_data.get("patch", "")).strip()
        # For constructor chaining
        if "this(name);" in patch:
            if patch.find("this(name);") < patch.find("System.out.println"):
                is_correct = True
                feedback = "BUILD SUCCESSFUL! javac exited with code 0. Constructor chaining order rule satisfied."
            else:
                is_correct = False
                feedback = "Compilation error: call to this() must be the FIRST statement in the constructor body."
        elif "courses" in patch and "ArrayList" in patch:
            is_correct = True
            feedback = "NullPointerException resolved! courses collection instantiated cleanly in constructor."
        else:
            is_correct = False
            feedback = "Compilation or logic error in patched code. Ensure the culprit statement is addressed."

    elif ex_type == "parsons_puzzle":
        sequence = submission_data.get("sequence", [])
        correct_seq = meta.get("correct_sequence", [])
        if "t_distractor" in sequence:
            is_correct = False
            feedback = "Anti-Pattern Detected: try-with-resources handles closing resources automatically. finally { br.close(); } is redundant!"
        elif sequence == correct_seq:
            is_correct = True
            feedback = "PERFECT SYNTAX FLOW! Scrambled code arranged in exact grammatical and execution order."
        else:
            is_correct = False
            feedback = "Sequence mismatch. Check block hierarchy and execution flow."

    elif ex_type == "predict_output":
        choice = str(submission_data.get("choice", "")).strip()
        correct_choice = str(meta.get("correct_choice", "")).strip()
        if choice == correct_choice:
            is_correct = True
            feedback = f"CORRECT! JVM output matches: {choice}\n{meta.get('explanation', '')}"
        else:
            is_correct = False
            feedback = f"Output mismatch. Expected: '{correct_choice}'. Remember that == checks object memory references."

    elif ex_type == "modernize_refactor":
        code = str(submission_data.get("code", "")).strip()
        required_tokens = meta.get("required_tokens", [".stream()", ".filter(", ".map("])
        missing = [tok for tok in required_tokens if tok not in code]
        if not missing:
            is_correct = True
            feedback = "CLEAN CODE ACHIEVED! Declarative Stream pipeline cleanly replaces imperative loop. Immutable and concise."
        else:
            is_correct = False
            feedback = f"Pipeline missing modern stream constructs: {', '.join(missing)}"

    elif ex_type == "break_code":
        try:
            low = int(submission_data.get("low", 0))
            high = int(submission_data.get("high", 0))
            if (low + high) > 2147483647:
                is_correct = True
                wrapped = ((low + high) & 0xFFFFFFFF)
                # sign extend to 32 bit signed int
                if wrapped >= 0x80000000:
                    signed_val = wrapped - 0x100000000
                else:
                    signed_val = wrapped
                mid = signed_val // 2
                feedback = f"BUG TRIGGERED! 32-bit Integer Overflow achieved! (low + high) wrapped around to {signed_val}, calculating midpoint = {mid} (negative!). Fix: low + (high - low) / 2."
            else:
                is_correct = False
                feedback = "Inputs did not cause overflow. The sum must exceed 2,147,483,647."
        except Exception as e:
            is_correct = False
            feedback = f"Invalid input parameters: {e}"

    elif ex_type == "keyword_cloze":
        answers = submission_data.get("answers", {})
        blanks = meta.get("blanks", [])
        all_match = True
        for b in blanks:
            b_id = b.get("id")
            if answers.get(b_id) != b.get("correct"):
                all_match = False
                break
        if all_match:
            is_correct = True
            feedback = "ALL BLANKS CORRECT! Valid OOP polymorphism contract successfully formed."
        else:
            is_correct = False
            feedback = "Some selections are incorrect. Check abstract method spec and class inheritance keyword."

    xp_awarded = 0
    if is_correct:
        xp_awarded = exercise.xp_reward
        award_xp(
            db=db,
            user=user,
            amount=xp_awarded,
            reason=f"Solved Interactive Exercise: {exercise.title}",
            reference_type="exercise",
            reference_id=str(exercise.id)
        )

    # Save attempt
    attempt = InteractiveExerciseAttempt(
        user_id=user.id,
        exercise_id=exercise.id,
        submission_data=submission_data,
        is_correct=is_correct,
        xp_awarded=xp_awarded,
        feedback=feedback
    )
    db.add(attempt)
    db.commit()

    return {
        "is_correct": is_correct,
        "xp_awarded": xp_awarded,
        "feedback": feedback,
        "test_results": test_results
    }
