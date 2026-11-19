import os
import json
from core.database import SessionLocal, Base, engine
from models.game_level import GameLevel

GAMES_CONFIG = [
    {
        "id": "creature-creator",
        "name": "Creature Creator",
        "topic": "OOP Foundations & Blueprints",
        "l1_todo": "public class Creature { }",
        "l1_starter": "// Level 1: Beginner (1-Line Answer)\n// TODO: Write 1 line declaring public class Creature:\npublic class Creature {\n}\n",
        "l10_title": "Grand Biome Ecosystem Engine",
        "l10_desc": "Write the entire Ecosystem class from scratch with polymorphic creature evaluation."
    },
    {
        "id": "restaurant-tycoon",
        "name": "Restaurant Tycoon",
        "topic": "Collections, Maps & Data Structures",
        "l1_todo": "orders.add(\"Truffle Pasta\");",
        "l1_starter": "import java.util.ArrayList;\n\npublic class Kitchen {\n    public static void main(String[] args) {\n        ArrayList<String> orders = new ArrayList<>();\n        // Level 1: Beginner (1-Line Answer)\n        // TODO: Write 1 line to add 'Truffle Pasta' to orders:\n        \n        System.out.println(\"Total orders: \" + orders.size());\n    }\n}\n",
        "l10_title": "Michelin Star Order Management System",
        "l10_desc": "Author the complete RestaurantOrderManager class from scratch with Map order counts."
    },
    {
        "id": "space-colony",
        "name": "Space Colony",
        "topic": "Generics, Memory & Life Support",
        "l1_todo": "double oxygenPercentage = 98.5;",
        "l1_starter": "public class LifeSupport {\n    public static void main(String[] args) {\n        // Level 1: Beginner (1-Line Answer)\n        // TODO: Declare double oxygenPercentage = 98.5:\n        \n        System.out.println(\"Colony Status: Online\");\n    }\n}\n",
        "l10_title": "Martian Life Support Grid",
        "l10_desc": "Author ColonyGrid class from scratch with dynamic power allocation and telemetry."
    },
    {
        "id": "java-game-studio",
        "name": "Java Game Studio",
        "topic": "Design Patterns, Observer & State",
        "l1_todo": "int health = 100;",
        "l1_starter": "public class Hero {\n    // Level 1: Beginner (1-Line Answer)\n    // TODO: Write 1 line declaring int health = 100:\n    \n}\n",
        "l10_title": "2.5D Synthwave Game Engine",
        "l10_desc": "Author GameEngine class from scratch with scoring and enemy collision handling."
    },
    {
        "id": "java-forensics",
        "name": "Java Forensics",
        "topic": "Exceptions, Stack Traces & JVM Debugging",
        "l1_todo": "if (frames == null) return \"UNKNOWN\";",
        "l1_starter": "public class IncidentInvestigation {\n    public static String getCulprit(String[] frames) {\n        // Level 1: Beginner (1-Line Answer)\n        // TODO: Write 1 line returning 'UNKNOWN' if frames is null:\n        \n        return frames[0];\n    }\n\n    public static void main(String[] args) {\n        System.out.println(\"Result: \" + getCulprit(null));\n    }\n}\n",
        "l10_title": "Cyber Incident Response Unit",
        "l10_desc": "Author CyberIncidentReport class from scratch with defensive verification and audit status."
    },
    {
        "id": "java-architecture",
        "name": "Java Architecture",
        "topic": "Spring Boot, Microservices & Concurrency",
        "l1_todo": "String endpoint = \"https://mesh.cloud.corp\";",
        "l1_starter": "public class Gateway {\n    public static void main(String[] args) {\n        // Level 1: Beginner (1-Line Answer)\n        // TODO: Declare String endpoint = 'https://mesh.cloud.corp':\n        \n        System.out.println(\"Gateway active.\");\n    }\n}\n",
        "l10_title": "Distributed Cloud Service Mesh",
        "l10_desc": "Author CloudLoadBalancer class from scratch with round-robin server routing."
    }
]

def build_all_levels():
    all_levels = []
    for g in GAMES_CONFIG:
        gid = g["id"]
        gname = g["name"]
        gtopic = g["topic"]

        for lvl in range(1, 11):
            if lvl == 1:
                title = f"{gname}: Initiation"
                diff = "Beginner (Level 1: 1-Line Answer)"
                learning = f"Solve foundational {gtopic} challenge with a single line of code."
                scenario = f"Chamber initialization requires 1 line of Java syntax."
                starter = g["l1_starter"]
            elif lvl == 2:
                title = f"{gname}: State Variables"
                diff = "Beginner (Level 2: 2 Lines)"
                learning = f"Declare state variables for {gtopic}."
                scenario = f"Add fields to represent core entity attributes."
                starter = f"public class Solution {{\n    // Level 2: 2 Lines\n    // TODO: Declare 2 state variables\n    String name = \"Alpha\";\n    int value = 100;\n}}\n"
            elif lvl == 3:
                title = f"{gname}: Object Instantiation"
                diff = "Beginner (Level 3: 2-3 Lines)"
                learning = f"Instantiate objects and invoke methods."
                scenario = f"Materialize the component in the runtime environment."
                starter = f"public class Main {{\n    public static void main(String[] args) {{\n        // Level 3: 2-3 Lines\n        // TODO: Instantiate Solution and print status\n        Solution s = new Solution();\n        System.out.println(\"Instantiated: \" + s);\n    }}\n}}\n"
            elif lvl == 4:
                title = f"{gname}: Parameterized Initialization"
                diff = "Intermediate (Level 4: 3-4 Lines)"
                learning = f"Implement constructors with parameter validation."
                scenario = f"Accept initial attributes during creation."
                starter = f"public class Solution {{\n    private String id;\n    // Level 4: Constructor\n    // TODO: Write constructor public Solution(String id) {{ this.id = id; }}\n}}\n"
            elif lvl == 5:
                title = f"{gname}: Domain Operations"
                diff = "Intermediate (Level 5: Method Body)"
                learning = f"Implement core domain method logic."
                scenario = f"Mutate entity state according to business rules."
                starter = f"public class Solution {{\n    private int balance = 100;\n    // Level 5: Method\n    // TODO: Implement public void update(int delta) {{ balance += delta; }}\n}}\n"
            elif lvl == 6:
                title = f"{gname}: Encapsulation & Guards"
                diff = "Intermediate-Advanced (Level 6)"
                learning = f"Protect invariants using defensive checks."
                scenario = f"Enforce non-negative boundary conditions."
                starter = f"public class Solution {{\n    private int metric;\n    // Level 6: Setter\n    // TODO: Implement setMetric(int m) guarding m >= 0\n}}\n"
            elif lvl == 7:
                title = f"{gname}: Structural Inheritance"
                diff = "Advanced (Level 7: Subclassing)"
                learning = f"Extend abstract contracts or base classes."
                scenario = f"Create specialized sub-modules."
                starter = f"class Base {{\n    protected int id = 1;\n}}\n// Level 7: Inheritance\n// TODO: class Child extends Base\npublic class Child extends Base {{\n}}\n"
            elif lvl == 8:
                title = f"{gname}: Polymorphic Overriding"
                diff = "Advanced (Level 8: Overriding)"
                learning = f"Override methods with @Override annotation."
                scenario = f"Provide specialized execution behavior."
                starter = f"class Base {{\n    public int compute() {{ return 10; }}\n}}\npublic class Child extends Base {{\n    // Level 8: Override compute() to return 50\n    @Override\n    public int compute() {{ return 50; }}\n}}\n"
            elif lvl == 9:
                title = f"{gname}: Concurrency & Collections"
                diff = "Advanced (Level 9: Concurrency/Data Structures)"
                learning = f"Handle asynchronous tasks and thread-safe collections."
                scenario = f"Prevent race conditions and optimize data retrieval."
                starter = f"import java.util.concurrent.*;\n\npublic class Solution {{\n    // Level 9: Concurrency\n    // TODO: Use ConcurrentHashMap or AtomicInteger\n}}\n"
            else:
                title = g["l10_title"]
                diff = "Expert (Level 10: Full Code Scratch)"
                learning = f"Author the complete production class and algorithm from scratch."
                scenario = f"MNC Capstone Challenge: {g['l10_desc']}"
                starter = f"// Level 10: MNC Capstone Challenge - {gname}\n// Write the COMPLETE Java solution from scratch!\n// Requirement: {g['l10_desc']}\n\n// TODO: Author your complete Java class and implementation from scratch below:\n\n"

            all_levels.append({
                "game_id": gid,
                "level_number": lvl,
                "title": title,
                "topic": gtopic,
                "difficulty": diff,
                "learning_objective": learning,
                "scenario": scenario,
                "starter_code": starter,
                "solution_code": "public class Solution { }",
                "solution_hint": f"Apply {gtopic} standards to solve Stage {lvl}.",
                "test_cases": [{"name": f"Stage {lvl} Validation", "pattern": r"class\s+\w+"}],
                "expected_output": "Verified",
                "xp_reward": 30 + lvl * 10
            })

    return all_levels

def main():
    levels = build_all_levels()
    print(f"Total levels generated: {len(levels)}")

    db = SessionLocal()
    try:
        from database.repositories.game_level_repository import GameLevelRepository
        count = GameLevelRepository.bulk_seed(db, levels)
        print(f"Successfully seeded {count} calibrated levels into PostgreSQL database!")
        total = db.query(GameLevel).count()
        print(f"Total game_levels in PostgreSQL: {total}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
