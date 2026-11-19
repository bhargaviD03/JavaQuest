import json
import os
import sys

# Ensure parent directory in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import SessionLocal
from models.question_bank import QuestionBank

def build_rich_explanation(canonical_id, prompt, domain, difficulty, raw_solution):
    """
    Builds a structured 4-part beginner-friendly tutorial explanation:
    1. Core Concept Breakdown
    2. Code Example & Implementation
    3. Execution & Memory Walkthrough
    4. Common Pitfalls & MNC Gotchas
    """
    # Domain-specific rich template generator
    return f"""### Core Concept Breakdown
{generate_concept_breakdown(canonical_id, prompt, domain, difficulty)}

### Code Example & Implementation
```java
{generate_code_example(canonical_id, prompt, raw_solution)}
```

### Execution & Memory Walkthrough
{generate_walkthrough(canonical_id, prompt, domain)}

### Common Pitfalls & MNC Gotchas
{generate_pitfalls(canonical_id, prompt, domain)}"""

def generate_conceptual_hint(canonical_id, prompt, domain):
    p = prompt.lower()
    if "jdk" in p and "jre" in p:
        return "Hint: Think of Russian nesting dolls: JDK contains development tools + JRE. JRE contains runtime libraries + JVM. JVM executes bytecode."
    if "platform independent" in p:
        return "Hint: 'Write Once, Run Anywhere' applies to bytecode (.class files), but the JVM itself must be compiled natively for each specific OS."
    if "main method" in p:
        return "Hint: Think about who calls main(): the JVM without creating an instance (static), from anywhere outside the package (public), and with no return expected (void)."
    if "primitive" in p and "wrapper" in p:
        return "Hint: Primitives live on the Stack as raw bit values (like int, 4 bytes). Wrappers are full objects living on the Heap with methods and nullability."
    if "autoboxing" in p:
        return "Hint: Autoboxing calls Integer.valueOf(x), while unboxing calls x.intValue(). If x is null during unboxing, what method gets called on null?"
    if "==" in p and "equals" in p:
        return "Hint: == compares references (memory addresses). .equals() compares logical content. Strings created with 'new' get distinct memory addresses in Heap."
    if "string constant pool" in p:
        return "Hint: In Java 7+, the String Pool moved out of PermGen and into standard Heap memory to avoid OutOfMemoryError and allow GC cleanup."
    if "immutable" in p and "string" in p:
        return "Hint: Security (file paths, sockets), HashCode caching (used in HashMaps), and multithreading (shareable without locks) all rely on String immutability."
    if "stringbuilder" in p or "stringbuffer" in p:
        return "Hint: String concatenation (+) creates intermediate String objects. StringBuilder uses an internal char/byte buffer. StringBuffer is synchronized (slower)."
    if "type casting" in p:
        return "Hint: Widening (e.g. int -> double) is automatic and safe. Narrowing (e.g. double -> int) truncates decimals and requires explicit cast: (int)d."
    if "integer caching" in p:
        return "Hint: Java pre-caches Integer objects from -128 to 127 in IntegerCache. Values in this range reuse the same heap object!"
    if "pass-by-value" in p:
        return "Hint: Java is strictly 100% Pass-by-Value. When you pass an object, you pass a copy of the reference pointer, NOT the object itself."
    if "final" in p and "finally" in p:
        return "Hint: 'final' is a keyword for constants/immutability. 'finally' is a try-catch cleanup block. 'finalize()' was an old GC destructor (now deprecated)."
    if "two sum" in p:
        return "Hint: Instead of checking every pair with O(n^2) nested loops, use a HashMap to remember each number's complement (target - num) in O(n) single pass."
    if "palindrome" in p:
        return "Hint: Use two pointers: one at the start moving right, one at the end moving left. Compare characters while skipping non-alphanumerics."
    if "stock" in p:
        return "Hint: Track the minimum price seen so far as you iterate once through the array, and compute profit at every day."
    if "subarray" in p or "kadane" in p:
        return "Hint: Kadane's algorithm: At each index, decide whether to add the current number to the existing subarray sum or start fresh from current number."
    if "3sum" in p:
        return "Hint: Sort the array first! Fix one element nums[i], then use two pointers (left and right) to find pairs that sum to -nums[i]. Skip duplicates."
    if "water" in p:
        return "Hint: Area is bounded by the shorter line: (right - left) * min(height[left], height[right]). Move the shorter pointer inward."
    if "sliding window" in p or "longest substring" in p:
        return "Hint: Maintain a sliding window [start, end]. Use a Map to track the last seen index of each character to jump start forward on repeats."
    if "hashmap" in p:
        return "Hint: In Java 8, when a bucket has >= 8 elements and table capacity >= 64, the linked list converts to a Red-Black tree for O(log n) lookups."
    if "volatile" in p:
        return "Hint: volatile forces all reads and writes directly to main RAM instead of CPU L1/L2 caches. It guarantees visibility, but not atomic compound operations (like i++)."
    if "deadlock" in p:
        return "Hint: Deadlock occurs with circular lock acquisition (Thread 1: Lock A then B; Thread 2: Lock B then A). Always acquire locks in uniform global order."
    if "stream" in p:
        return "Hint: Stream operations are lazy: intermediate steps (filter, map) do no work until a terminal operation (collect, forEach, count) triggers the pipeline."
    if "cycle" in p or "linked list" in p:
        return "Hint: Floyd's Cycle Detection (Tortoise and Hare): Fast pointer moves 2 steps, slow moves 1 step. If they ever collide, a cycle exists."
    
    return f"Hint: Break the problem down step-by-step. Focus on the core mechanics of {domain} and consider both time/space complexity."

def generate_concept_breakdown(canonical_id, prompt, domain, difficulty):
    p = prompt.lower()
    if "jdk" in p and "jre" in p:
        return """- **JDK (Java Development Kit)**: The complete developer toolbox. It contains the Java Compiler (`javac`), debugger, monitoring tools, and the JRE. You need the JDK to write and compile Java source code (`.java` -> `.class`).
- **JRE (Java Runtime Environment)**: The runtime bundle needed to *run* compiled Java bytecode. It packages the JVM together with core Java class libraries (like `java.lang`, `java.util`). It cannot compile code.
- **JVM (Java Virtual Machine)**: The abstract computing engine that actually executes bytecode. It translates universal bytecode instructions into native CPU instructions for the specific operating system."""
    
    if "platform independent" in p:
        return """- **Write Once, Run Anywhere (WORA)**: When you compile a Java file, `javac` produces intermediate platform-neutral **bytecode** (`.class` files), not machine code.
- **Why JVM is Platform Dependent**: Bytecode is an instruction set for a virtual computer. To run on physical hardware, an x86 Windows computer needs a Windows JVM to translate bytecode into Windows system calls, while an ARM Mac needs an Apple Silicon JVM. The bytecode is universal; the translator (JVM) is OS-specific."""

    if "main method" in p:
        return """- **public**: The entry point must be accessible by the JVM process from outside any package.
- **static**: The JVM invokes `Main.main()` before any objects of the class are instantiated. A static method belongs to the class itself.
- **void**: The program returns no exit code via method return (system exit codes are communicated via `System.exit(int)`).
- **String[] args**: Command-line arguments passed to the program at startup as an array of Strings."""

    if "pass-by-value" in p:
        return """- **The Golden Rule**: Java is **STRICTLY 100% Pass-by-Value**. There is no pass-by-reference in Java.
- **What is Passed**:
  - When passing **primitives** (e.g. `int x = 10`), a fresh copy of the literal value `10` is copied onto the method's stack frame.
  - When passing **objects** (e.g. `Person p = new Person()`), the variable `p` holds a 64-bit reference address (memory pointer). Java copies the *value of that pointer* into the method parameter.
- **The Result**: Inside the method, you can mutate the object's internal fields (because both pointers reference the same heap object), but reassigning the parameter (`p = new Person()`) only alters the local copy of the pointer, leaving the caller unaffected."""

    if "two sum" in p:
        return """- **The Intuition**: For every number `num` in the array, there is exactly one partner value `complement = target - num` that makes their sum equal to `target`.
- **Brute Force (O(n²))**: Check all pairs with two nested loops.
- **Optimal Hash Map (O(n))**: As you traverse the array, query a HashMap to see if the complement was already seen. If found, return both indices immediately. If not, save current `nums[i]` and index `i` into the map."""

    if "lru cache" in p or "least recently used" in p:
        return """- **The Problem**: Cache with fixed capacity where reading (`get`) or writing (`put`) an element marks it as most recently used. When capacity is exceeded, the least recently used element must be evicted in O(1) time.
- **The Data Structure Combination**:
  - **HashMap**: Provides O(1) key-to-node lookup.
  - **Doubly Linked List (DLL)**: Allows O(1) node removal and O(1) insertion to head.
  - Together, they achieve strict O(1) runtime for both `get()` and `put()`."""

    if "hashmap" in p:
        return """- **Buckets & Array of Nodes**: HashMap uses an array of `Node<K, V>` buckets (default initial capacity 16, load factor 0.75).
- **Index Calculation**: `index = (n - 1) & hash(key.hashCode())` computes the bucket slot.
- **Collision Handling**: Collisions are placed in a linked list in that bucket.
- **Java 8 Treeification**: When bucket length reaches **8** and table capacity is >= **64**, the bucket converts from a LinkedList into a **Red-Black Tree** (`TreeNode`), reducing worst-case lookup from O(n) to O(log n)."""

    if "volatile" in p:
        return """- **Memory Visibility**: Modern CPUs cache variables in high-speed L1/L2 caches. If Thread 1 updates a variable, Thread 2 running on another CPU core might continue reading stale data from its own cache.
- **The `volatile` Guarantee**: Declaring a field `volatile` instructs the JVM and CPU to write all updates directly to Main Memory (RAM) and invalidate CPU caches on reads.
- **Crucial Limitation**: `volatile` does NOT provide atomicity! Compound operations like `count++` (which is read -> increment -> write) still suffer from race conditions unless synchronized or wrapped in `AtomicInteger`."""

    return f"""- **Core Concept**: This challenge tests your mastery of {domain}.
- **Engineering Principle**: In production and MNC interview rounds, candidates must understand not just syntactic usage, but underlying memory, time complexity, and edge cases.
- **Target Goal**: Write clean, resilient, and optimized Java code adhering to standard conventions."""

def generate_code_example(canonical_id, prompt, raw_solution):
    # If raw solution already has clean multi-line code, format it nicely
    if raw_solution and len(raw_solution) > 50 and not raw_solution.strip().startswith("//"):
        return raw_solution.strip()
    
    p = prompt.lower()
    if "jdk" in p and "jre" in p:
        return """public class ArchitectureDemo {
    public static void main(String[] args) {
        // Checking the runtime environment properties
        System.out.println("Java Version: " + System.getProperty("java.version"));
        System.out.println("JVM Vendor:    " + System.getProperty("java.vm.vendor"));
        System.out.println("JVM Name:      " + System.getProperty("java.vm.name"));
        
        // JVM Runtime memory details
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory() / (1024 * 1024);
        System.out.println("Max JVM Heap:  " + maxMemory + " MB");
    }
}"""
    if "pass-by-value" in p:
        return """public class PassByValueDemo {
    static class Person {
        String name;
        Person(String name) { this.name = name; }
    }

    public static void modify(Person p, int number) {
        p.name = "Alice";      // MUTATION: Modifies the shared Heap object!
        number = 999;          // LOCAL: Modifies only the stack copy
        p = new Person("Bob"); // REASSIGNMENT: Changes only the local pointer!
    }

    public static void main(String[] args) {
        Person person = new Person("Original");
        int count = 100;

        modify(person, count);

        System.out.println("Person name: " + person.name); // Prints "Alice"
        System.out.println("Count value: " + count);       // Prints 100 (Unchanged)
    }
}"""
    if "two sum" in p:
        return """import java.util.*;

public class TwoSum {
    public static int[] twoSum(int[] nums, int target) {
        // Map stores: Number -> Its Index in the array
        Map<Integer, Integer> seen = new HashMap<>();

        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];

            // If we already saw the required complement, we found our pair!
            if (seen.containsKey(complement)) {
                return new int[] { seen.get(complement), i };
            }

            // Store current number with its index for future lookups
            seen.put(nums[i], i);
        }

        return new int[] {}; // No solution found
    }

    public static void main(String[] args) {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Indices: " + Arrays.toString(result)); // [0, 1]
    }
}"""
    if "valid palindrome" in p:
        return """public class ValidPalindrome {
    public static boolean isPalindrome(String s) {
        int left = 0, right = s.length() - 1;

        while (left < right) {
            // Move left pointer past non-alphanumeric characters
            while (left < right && !Character.isLetterOrDigit(s.charAt(left))) {
                left++;
            }
            // Move right pointer past non-alphanumeric characters
            while (left < right && !Character.isLetterOrDigit(s.charAt(right))) {
                right--;
            }

            // Compare case-insensitively
            if (Character.toLowerCase(s.charAt(left)) != Character.toLowerCase(s.charAt(right))) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }
}"""
    if "volatile" in p:
        return """public class VolatileDemo {
    private static volatile boolean running = true;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long count = 0;
            // Without volatile, the thread might cache 'running = true' in L1 cache
            // and spin forever even after main thread sets running = false!
            while (running) {
                count++;
            }
            System.out.println("Worker thread terminated. Count: " + count);
        });

        worker.start();
        Thread.sleep(100);
        running = false; // Writes immediately to main memory
        worker.join();
        System.out.println("Application finished.");
    }
}"""
    if "hashmap" in p:
        return """import java.util.Objects;

public class CustomKey {
    private final String department;
    private final int id;

    public CustomKey(String department, int id) {
        this.department = department;
        this.id = id;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CustomKey customKey = (CustomKey) o;
        return id == customKey.id && Objects.equals(department, customKey.department);
    }

    @Override
    public int hashCode() {
        return Objects.hash(department, id);
    }
}"""

    # Default code generator from prompt
    clean_solution = raw_solution.strip() if raw_solution else "// Implement solution here"
    return f"""// Standard Java 21 Implementation for: {canonical_id}
public class Solution {{
    {clean_solution}
}}"""

def generate_walkthrough(canonical_id, prompt, domain):
    p = prompt.lower()
    if "pass-by-value" in p:
        return """1. **Method Call**: When `modify(person, count)` is called, the JVM creates a new Stack Frame.
2. **Stack Allocation**: The local variable `person` in `main` has a memory address `0x4A` pointing to Heap object `Person("Original")`. The value `0x4A` is copied into the `p` parameter of `modify`.
3. **Field Mutation**: `p.name = "Alice"` follows pointer `0x4A` into the Heap and mutates the field. The caller sees this because both point to `0x4A`.
4. **Pointer Reassignment**: `p = new Person("Bob")` creates a brand new Heap object `0x7B` and sets local `p = 0x7B`. The caller's `person` in `main` remains unchanged at `0x4A`."""

    if "two sum" in p:
        return """1. **Array Traversal**: We iterate through the array once: `i = 0` to `n - 1`.
2. **Lookup in Hash Table**: For `nums[i] = 2` with `target = 9`, `complement = 7`. The map is empty, so we store `(2 -> 0)`.
3. **Match Found**: When reaching `nums[1] = 7`, `complement = 2`. `seen.containsKey(2)` returns `true` (stored at index 0).
4. **Complexity**:
   - **Time Complexity**: **O(n)** — We iterate through the array of length `n` once, with **O(1)** average HashMap lookups.
   - **Space Complexity**: **O(n)** — In the worst case, we store at most `n` entries in the HashMap."""

    if "jdk" in p or "jre" in p:
        return """1. **Compilation Phase**: Developer writes `App.java`. The JDK compiler (`javac`) compiles it into platform-independent bytecode `App.class`.
2. **Class Loading Phase**: The JVM ClassLoader loads `App.class` into the JVM Metaspace/Method Area.
3. **Execution Phase**: The Execution Engine (Interpreter + JIT Compiler) translates bytecode into machine instructions and executes them on the host CPU."""

    return f"""1. **Initialization**: Variables and data structures are allocated in their designated memory regions (Stack frames vs. Heap memory).
2. **Execution Flow**: The algorithm operates deterministically with predictable state transitions.
3. **Termination & Cleanup**: Once the method returns, its stack frame is popped, and unreferenced heap objects become eligible for Garbage Collection."""

def generate_pitfalls(canonical_id, prompt, domain):
    p = prompt.lower()
    if "pass-by-value" in p:
        return """- **Common Pitfall**: Thinking that passing an object allows you to write a swap method: `swap(Person a, Person b)`. In Java, swapping `a` and `b` inside a method does nothing to the caller's variables!
- **MNC Interview Question**: *"How do you write a method that swaps two integers in Java?"* -> Answer: You cannot swap two primitive integers by passing them directly. You must use an array `int[] arr` or a mutable container object."""

    if "two sum" in p:
        return """- **Common Pitfall**: Using the same element twice (e.g. `target = 6` and `nums = [3, 2, 4]`). If not careful, the algorithm might match index 0 with itself!
- **MNC Follow-up**: *"What if the array is already sorted?"* -> In that case, do NOT use a HashMap! Use the **Two-Pointer technique** (Left = 0, Right = n-1) to solve it in **O(1) extra space**."""

    if "jdk" in p or "jre" in p:
        return """- **Common Pitfall**: Installing only JRE on a development machine and wondering why `javac` is not recognized in the terminal.
- **MNC Follow-up**: *"Can a Java application run without installing JRE on modern cloud servers?"* -> Yes! Using Java 9+ `jlink`, you can package a custom stripped-down runtime containing only the required modules alongside your application JAR."""

    return """- **Edge Cases**: Always verify behavior for null inputs, empty collections, single-element arrays, and boundary values (e.g. `Integer.MIN_VALUE` / `Integer.MAX_VALUE`).
- **MNC Tip**: Interviewers evaluate your ability to discuss trade-offs (e.g. Time vs. Memory Space complexity) and thread-safety implications."""

def enrich_database():
    db = SessionLocal()
    try:
        # Load the 250 question definitions
        json_path = os.path.join("backend", "seed_data", "mnc_250_questions.json")
        if not os.path.exists(json_path):
            json_path = os.path.join("seed_data", "mnc_250_questions.json")

        with open(json_path, "r", encoding="utf-8") as f:
            questions_data = json.load(f)

        print(f"Loaded {len(questions_data)} questions from {json_path}")

        updated_count = 0
        enriched_list = []

        for q in questions_data:
            cid = q["canonical_id"]
            prompt = q["prompt"]
            domain = q["domain"]
            difficulty = q["difficulty"]
            raw_solution = q.get("solution", "")

            # Generate rich explanation and conceptual hint
            rich_explanation = build_rich_explanation(cid, prompt, domain, difficulty, raw_solution)
            conceptual_hint = generate_conceptual_hint(cid, prompt, domain)

            # Update database record
            db_q = db.query(QuestionBank).filter(QuestionBank.canonical_id == cid).first()
            if db_q:
                db_q.solution_guidance = rich_explanation
                db_q.hint = conceptual_hint
                updated_count += 1

            # Update json data object
            q["solution"] = rich_explanation
            q["hint"] = conceptual_hint
            enriched_list.append(q)

        db.commit()
        print(f"Successfully updated {updated_count} questions in PostgreSQL database with rich explanations!")

        # Also write back to JSON seed files
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(enriched_list, f, indent=2)

        # Update javaquest_question_bank_v1.json as well
        v1_path = os.path.join("backend", "seed_data", "javaquest_question_bank_v1.json")
        if not os.path.exists(v1_path):
            v1_path = os.path.join("seed_data", "javaquest_question_bank_v1.json")

        canonical_dict = {
            "version": "2.1-rich-beginner-curriculum",
            "description": "250 Curated Top MNC Interview Questions with Rich 4-Part Beginner Explanations",
            "questions": [
                {
                    "canonical_id": q["canonical_id"],
                    "title": q["prompt"][:80],
                    "topic": q["domain"],
                    "difficulty": q["difficulty"],
                    "question_type": "Coding" if q["level"] >= 6 else "Predict output",
                    "prompt": q["prompt"],
                    "hint": q["hint"],
                    "solution_guidance": q["solution"],
                    "source_type": q["source"],
                    "external_reference": f"{q['source']} ({', '.join(q['companies'][:3])})"
                }
                for q in enriched_list
            ],
            "external_practice": []
        }
        with open(v1_path, "w", encoding="utf-8") as f:
            json.dump(canonical_dict, f, indent=2)
        print(f"Updated {v1_path} with rich beginner curriculum!")

    finally:
        db.close()

if __name__ == "__main__":
    enrich_database()
