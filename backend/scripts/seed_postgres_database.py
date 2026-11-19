import os
import sys
import json

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.database import engine, Base, SessionLocal
from models import *
from models.game_level import GameLevel
from models.question_bank import QuestionBank
from services.auth_service import seed_default_users
from services.gamification_service import seed_achievements
from services.roadmap_service import seed_roadmap
from services.project_service import seed_projects
from services.question_service import import_question_bank
from services.exercise_service import seed_interactive_exercises

# ---------------------------------------------------------
# CALIBRATED 60 GAME LEVELS: 6 WORLDS x 10 LEVELS
# Level 1: 1-line answer -> Level 10: Full code from scratch
# ---------------------------------------------------------

GAME_LEVELS_CATALOG = [
    # =========================================================================
    # WORLD 1: CREATURE CREATOR (OOP Foundations & Class Blueprints)
    # =========================================================================
    {
        "game_id": "creature-creator",
        "level_number": 1,
        "title": "The Empty Incubator",
        "topic": "Classes & Blueprints",
        "difficulty": "Beginner (Level 1: 1-Line Answer)",
        "learning_objective": "Declare the public Creature blueprint class in one line.",
        "scenario": "The incubator chamber is uninstantiated. Declare the public Creature class blueprint.",
        "starter_code": """// Level 1: Define Creature Blueprint (Beginner: 1 Line Answer)
// TODO: Write 1 line of code to declare the public Creature class:
public class Creature {
}
""",
        "solution_code": "public class Creature { }",
        "solution_hint": "Write 'public class Creature { }' to declare the blueprint.",
        "test_cases": [{"name": "Class Declaration", "description": "Declares public class Creature", "pattern": r"public\s+class\s+Creature"}],
        "xp_reward": 35
    },
    {
        "game_id": "creature-creator",
        "level_number": 2,
        "title": "Give It Identity",
        "topic": "Instance Variables & State",
        "difficulty": "Beginner (Level 2: 2 Lines)",
        "learning_objective": "Declare instance variables to represent state: name and energy.",
        "scenario": "Give the creature identity by declaring two instance variables.",
        "starter_code": """public class Creature {
    // Level 2: Add instance variables (2 Lines)
    // TODO: Declare a String variable named 'name' with value 'Aero'
    // TODO: Declare an int variable named 'energy' with value 100
    
}
""",
        "solution_code": "public class Creature { String name = \"Aero\"; int energy = 100; }",
        "solution_hint": "Declare: String name = \"Aero\"; int energy = 100;",
        "test_cases": [{"name": "Name field", "pattern": r"String\s+name"}, {"name": "Energy field", "pattern": r"int\s+energy"}],
        "xp_reward": 40
    },
    {
        "game_id": "creature-creator",
        "level_number": 3,
        "title": "Instantiate the Dragon",
        "topic": "Object Instantiation (new)",
        "difficulty": "Beginner (Level 3: 2 Lines)",
        "learning_objective": "Materialize an object using the 'new' keyword in memory.",
        "scenario": "Materialize a new Creature object in the main method.",
        "starter_code": """public class Main {
    public static void main(String[] args) {
        // Level 3: Instantiate Object (2 Lines)
        // TODO: Create a new Creature instance assigned to variable 'dragon'
        // TODO: Print 'Dragon hatched!' using System.out.println
        
    }
}
""",
        "solution_code": "public class Main { public static void main(String[] args) { Creature dragon = new Creature(); System.out.println(\"Dragon hatched!\"); } }",
        "solution_hint": "Creature dragon = new Creature(); System.out.println(\"Dragon hatched!\");",
        "test_cases": [{"name": "New Instance", "pattern": r"new\s+Creature\s*\(\s*\)"}],
        "xp_reward": 45
    },
    {
        "game_id": "creature-creator",
        "level_number": 4,
        "title": "Elemental Constructor",
        "topic": "Constructors & Parameter Passing",
        "difficulty": "Intermediate (Level 4: 3 Lines)",
        "learning_objective": "Write a parameterized constructor initializing fields via 'this'.",
        "scenario": "Initialize the creature with custom name and energy passed at creation.",
        "starter_code": """public class Creature {
    String name;
    int energy;

    // Level 4: Parameterized Constructor (3 Lines)
    // TODO: Write public Creature(String name, int energy)
    // Assign parameters to this.name and this.energy
    
}
""",
        "solution_code": "public class Creature { String name; int energy; public Creature(String name, int energy) { this.name = name; this.energy = energy; } }",
        "solution_hint": "public Creature(String name, int energy) { this.name = name; this.energy = energy; }",
        "test_cases": [{"name": "Constructor Signature", "pattern": r"public\s+Creature\s*\(\s*String\s+\w+\s*,\s*int\s+\w+\s*\)"}],
        "xp_reward": 50
    },
    {
        "game_id": "creature-creator",
        "level_number": 5,
        "title": "Metabolic Energy Feed",
        "topic": "Methods & State Mutation",
        "difficulty": "Intermediate (Level 5: 5 Lines)",
        "learning_objective": "Implement a void method that mutates state.",
        "scenario": "Implement feed(int amount) to increase energy and print updated stats.",
        "starter_code": """public class Creature {
    int energy = 50;

    // Level 5: Method Implementation
    // TODO: Write public void feed(int amount)
    // Increase energy by amount and print 'Energy restored: ' + energy
    
}
""",
        "solution_code": "public class Creature { int energy = 50; public void feed(int amount) { this.energy += amount; System.out.println(\"Energy restored: \" + this.energy); } }",
        "solution_hint": "public void feed(int amount) { this.energy += amount; System.out.println(\"Energy restored: \" + this.energy); }",
        "test_cases": [{"name": "Feed method", "pattern": r"public\s+void\s+feed\s*\(\s*int\s+\w+\s*\)"}],
        "xp_reward": 55
    },
    {
        "game_id": "creature-creator",
        "level_number": 6,
        "title": "Vitality Guard",
        "topic": "Encapsulation & Validation",
        "difficulty": "Intermediate-Advanced (Level 6)",
        "learning_objective": "Protect fields with private access and defensive setters.",
        "scenario": "Guard creature health so it cannot drop below zero.",
        "starter_code": """public class Creature {
    private int health = 100;

    public int getHealth() { return health; }

    // Level 6: Encapsulation Setter
    // TODO: Implement public void setHealth(int health)
    // Clamp health: if health < 0, set to 0, otherwise assign health
    
}
""",
        "solution_code": "public class Creature { private int health = 100; public int getHealth() { return health; } public void setHealth(int health) { this.health = Math.max(0, health); } }",
        "solution_hint": "public void setHealth(int health) { this.health = Math.max(0, health); }",
        "test_cases": [{"name": "Defensive Setter", "pattern": r"public\s+void\s+setHealth"}],
        "xp_reward": 60
    },
    {
        "game_id": "creature-creator",
        "level_number": 7,
        "title": "Lineage of the Fire Drake",
        "topic": "Inheritance (extends)",
        "difficulty": "Advanced (Level 7)",
        "learning_objective": "Create a specialized subclass using extends keyword.",
        "scenario": "Subclass Creature to create FireDragon with specialized breath weapon.",
        "starter_code": """class Creature {
    protected String species = "Base";
}

// Level 7: Inheritance
// TODO: Declare public class FireDragon that extends Creature
// Add method public String breatheFire() returning 'Inferno Wave!'

""",
        "solution_code": "class Creature { protected String species = \"Base\"; } public class FireDragon extends Creature { public String breatheFire() { return \"Inferno Wave!\"; } }",
        "solution_hint": "public class FireDragon extends Creature { public String breatheFire() { return \"Inferno Wave!\"; } }",
        "test_cases": [{"name": "Extends Creature", "pattern": r"class\s+FireDragon\s+extends\s+Creature"}],
        "xp_reward": 65
    },
    {
        "game_id": "creature-creator",
        "level_number": 8,
        "title": "Polymorphic Breath Weapon",
        "topic": "Method Overriding (@Override)",
        "difficulty": "Advanced (Level 8)",
        "learning_objective": "Override superclass method to provide custom subclass logic.",
        "scenario": "Override attack() method to return 85 burst fire damage.",
        "starter_code": """class Creature {
    public int attack() { return 20; }
}

public class FireDragon extends Creature {
    // Level 8: Method Overriding
    // TODO: Override public int attack() to return 85
    
}
""",
        "solution_code": "class Creature { public int attack() { return 20; } } public class FireDragon extends Creature { @Override public int attack() { return 85; } }",
        "solution_hint": "@Override public int attack() { return 85; }",
        "test_cases": [{"name": "Override Attack", "pattern": r"public\s+int\s+attack\s*\(\s*\)"}],
        "xp_reward": 70
    },
    {
        "game_id": "creature-creator",
        "level_number": 9,
        "title": "Aerial Combat Contract",
        "topic": "Interfaces (implements)",
        "difficulty": "Advanced (Level 9)",
        "learning_objective": "Implement an interface contract across classes.",
        "scenario": "Implement Flyable interface with soar(int altitude) method.",
        "starter_code": """interface Flyable {
    void soar(int altitude);
}

// Level 9: Interface Implementation
// TODO: Implement Flyable on WingedDragon
// Print 'Gliding at altitude: ' + altitude + 'm'
public class WingedDragon implements Flyable {

}
""",
        "solution_code": "interface Flyable { void soar(int altitude); } public class WingedDragon implements Flyable { @Override public void soar(int altitude) { System.out.println(\"Gliding at altitude: \" + altitude + \"m\"); } }",
        "solution_hint": "public void soar(int altitude) { System.out.println(\"Gliding at altitude: \" + altitude + \"m\"); }",
        "test_cases": [{"name": "Implements Flyable", "pattern": r"implements\s+Flyable"}],
        "xp_reward": 80
    },
    {
        "game_id": "creature-creator",
        "level_number": 10,
        "title": "Grand Ecosystem Engine",
        "topic": "Advanced MNC Capstone (Write Full Code From Scratch)",
        "difficulty": "Expert (Level 10: Full Code Scratch)",
        "learning_objective": "Author the complete multi-species ecosystem simulation entirely from scratch.",
        "scenario": "MNC Capstone Challenge: Write the entire Ecosystem class from scratch without boilerplate.",
        "starter_code": """// Level 10: Grand Ecosystem Engine (MNC Advanced Capstone)
// Write the COMPLETE Java solution from scratch!
//
// Requirements:
// 1. Declare 'public class Ecosystem'
// 2. Add private field: java.util.List<Integer> powerLevels = new java.util.ArrayList<>();
// 3. Add method: public void registerCreature(int power)
// 4. Add method: public int calculateEcosystemPower() returning sum of all powers
// 5. Add main method registering powers 100, 250, 450 and printing total power

// TODO: Author your complete Java class and implementation from scratch below:

""",
        "solution_code": """import java.util.*;

public class Ecosystem {
    private List<Integer> powerLevels = new ArrayList<>();

    public void registerCreature(int power) {
        powerLevels.add(power);
    }

    public int calculateEcosystemPower() {
        int sum = 0;
        for (int p : powerLevels) sum += p;
        return sum;
    }

    public static void main(String[] args) {
        Ecosystem eco = new Ecosystem();
        eco.registerCreature(100);
        eco.registerCreature(250);
        eco.registerCreature(450);
        System.out.println("Total Ecosystem Power: " + eco.calculateEcosystemPower());
    }
}""",
        "solution_hint": "Define public class Ecosystem with List<Integer>, registerCreature, calculateEcosystemPower, and main.",
        "test_cases": [{"name": "Ecosystem Class", "pattern": r"class\s+Ecosystem"}, {"name": "Calculate Power", "pattern": r"calculateEcosystemPower"}],
        "xp_reward": 100
    },

    # =========================================================================
    # WORLD 2: RESTAURANT TYCOON (Collections, HashMaps & Data Structures)
    # =========================================================================
    {
        "game_id": "restaurant-tycoon",
        "level_number": 1,
        "title": "Opening Day Setup",
        "topic": "ArrayList Basics",
        "difficulty": "Beginner (Level 1: 1-Line Answer)",
        "learning_objective": "Add an order to a collection in 1 line.",
        "scenario": "The restaurant opens. Add the first menu item to the orders list.",
        "starter_code": """import java.util.ArrayList;

public class Kitchen {
    public static void main(String[] args) {
        ArrayList<String> orders = new ArrayList<>();
        
        // Level 1: Add 1 order (Beginner: 1 Line Answer)
        // TODO: Write 1 line of code to add 'Truffle Pasta' to orders:
        
        System.out.println("Total orders: " + orders.size());
    }
}
""",
        "solution_code": "orders.add(\"Truffle Pasta\");",
        "solution_hint": "orders.add(\"Truffle Pasta\");",
        "test_cases": [{"name": "Add Order", "pattern": r"orders\.add\s*\(\s*\"Truffle Pasta\"\s*\)"}],
        "xp_reward": 35
    },
    {
        "game_id": "restaurant-tycoon",
        "level_number": 2,
        "title": "The Chef's Menu Price Map",
        "topic": "HashMap Key-Value Pairs",
        "difficulty": "Beginner (Level 2: 2 Lines)",
        "learning_objective": "Store menu item prices in a Map.",
        "scenario": "Map dish names to their double prices.",
        "starter_code": """import java.util.HashMap;

public class Menu {
    public static void main(String[] args) {
        HashMap<String, Double> prices = new HashMap<>();
        
        // Level 2: Put prices (2 Lines)
        // TODO: Put 'Wagyu Steak' at 45.0
        // TODO: Put 'Lava Cake' at 12.5
        
        System.out.println("Menu items registered: " + prices.size());
    }
}
""",
        "solution_code": "prices.put(\"Wagyu Steak\", 45.0); prices.put(\"Lava Cake\", 12.5);",
        "solution_hint": "Use prices.put(key, value);",
        "test_cases": [{"name": "Put Wagyu", "pattern": r"prices\.put\s*\(\s*\"Wagyu Steak\""}, {"name": "Put Cake", "pattern": r"prices\.put\s*\(\s*\"Lava Cake\""}],
        "xp_reward": 40
    },
    {
        "game_id": "restaurant-tycoon",
        "level_number": 3,
        "title": "Kitchen FIFO Order Queue",
        "topic": "Queue & Deque Data Structures",
        "difficulty": "Intermediate (Level 3)",
        "learning_objective": "Process orders First-In-First-Out using a Queue.",
        "scenario": "Dequeue and serve the oldest pending order.",
        "starter_code": """import java.util.LinkedList;
import java.util.Queue;

public class OrderDispatch {
    public static void main(String[] args) {
        Queue<String> queue = new LinkedList<>();
        queue.offer("Order #101");
        queue.offer("Order #102");

        // Level 3: Poll queue
        // TODO: Poll the first order from the queue and print 'Served: ' + order
        
    }
}
""",
        "solution_code": "String order = queue.poll(); System.out.println(\"Served: \" + order);",
        "solution_hint": "Use queue.poll(); to retrieve the head of the queue.",
        "test_cases": [{"name": "Poll Queue", "pattern": r"queue\.poll\s*\(\s*\)"}],
        "xp_reward": 45
    },
    {
        "game_id": "restaurant-tycoon",
        "level_number": 10,
        "title": "Michelin Star Order Management System",
        "topic": "MNC Capstone (Full Code From Scratch)",
        "difficulty": "Expert (Level 10: Full Code Scratch)",
        "learning_objective": "Design an LRU dish cache and revenue aggregator entirely from scratch.",
        "scenario": "Write the complete RestaurantOrderManager class from scratch.",
        "starter_code": """// Level 10: Michelin Star Order Management System (MNC Capstone)
// Write the COMPLETE Java solution from scratch!
//
// Requirements:
// 1. Declare 'public class RestaurantOrderManager'
// 2. Add private Map<String, Integer> orderCounts = new HashMap<>();
// 3. Add method: public void placeOrder(String dish) incrementing count
// 4. Add method: public int getOrderCount(String dish)
// 5. Add main method testing 3 orders and printing counts

// TODO: Author complete code from scratch below:

""",
        "solution_code": """import java.util.*;

public class RestaurantOrderManager {
    private Map<String, Integer> orderCounts = new HashMap<>();

    public void placeOrder(String dish) {
        orderCounts.put(dish, orderCounts.getOrDefault(dish, 0) + 1);
    }

    public int getOrderCount(String dish) {
        return orderCounts.getOrDefault(dish, 0);
    }

    public static void main(String[] args) {
        RestaurantOrderManager rom = new RestaurantOrderManager();
        rom.placeOrder("Pizza");
        rom.placeOrder("Pizza");
        rom.placeOrder("Salad");
        System.out.println("Pizza orders: " + rom.getOrderCount("Pizza"));
        System.out.println("Salad orders: " + rom.getOrderCount("Salad"));
    }
}""",
        "solution_hint": "Declare class RestaurantOrderManager with Map<String, Integer>, placeOrder, and getOrderCount.",
        "test_cases": [{"name": "Order Manager Class", "pattern": r"class\s+RestaurantOrderManager"}],
        "xp_reward": 100
    },

    # =========================================================================
    # WORLD 3: SPACE COLONY (Generics, Memory & Resource Allocations)
    # =========================================================================
    {
        "game_id": "space-colony",
        "level_number": 1,
        "title": "Oxygen Sensor Calibration",
        "topic": "Primitive Types & Bounds",
        "difficulty": "Beginner (Level 1: 1-Line Answer)",
        "learning_objective": "Initialize life support oxygen reserve in 1 line.",
        "scenario": "Initialize colony oxygen reserves to 98.5 percent.",
        "starter_code": """public class LifeSupport {
    public static void main(String[] args) {
        // Level 1: Oxygen reserve (Beginner: 1 Line Answer)
        // TODO: Declare a double variable named 'oxygenPercentage' set to 98.5:
        
        System.out.println("Colony Status: Operational");
    }
}
""",
        "solution_code": "double oxygenPercentage = 98.5;",
        "solution_hint": "double oxygenPercentage = 98.5;",
        "test_cases": [{"name": "Oxygen variable", "pattern": r"double\s+oxygenPercentage\s*=\s*98\.5"}],
        "xp_reward": 35
    },
    {
        "game_id": "space-colony",
        "level_number": 10,
        "title": "Martian Life Support Grid",
        "topic": "MNC Capstone (Full Code From Scratch)",
        "difficulty": "Expert (Level 10: Full Code Scratch)",
        "learning_objective": "Author the complete Mars Colony resource distribution engine from scratch.",
        "scenario": "Write the entire ColonyGrid class from scratch with resource limits and distribution.",
        "starter_code": """// Level 10: Martian Life Support Grid (MNC Capstone)
// Write the COMPLETE Java solution from scratch!
//
// Requirements:
// 1. Declare 'public class ColonyGrid'
// 2. Add private int totalPower = 1000;
// 3. Add method: public boolean allocatePower(int amount)
//    If amount <= totalPower, deduct amount and return true; else return false
// 4. Add method: public int getRemainingPower()
// 5. Add main method testing allocations

// TODO: Author complete code from scratch below:

""",
        "solution_code": """public class ColonyGrid {
    private int totalPower = 1000;

    public boolean allocatePower(int amount) {
        if (amount <= totalPower) {
            totalPower -= amount;
            return true;
        }
        return false;
    }

    public int getRemainingPower() {
        return totalPower;
    }

    public static void main(String[] args) {
        ColonyGrid grid = new ColonyGrid();
        System.out.println("Allocated 400: " + grid.allocatePower(400));
        System.out.println("Remaining: " + grid.getRemainingPower());
    }
}""",
        "solution_hint": "Declare class ColonyGrid with totalPower, allocatePower, and getRemainingPower.",
        "test_cases": [{"name": "ColonyGrid Class", "pattern": r"class\s+ColonyGrid"}],
        "xp_reward": 100
    },

    # =========================================================================
    # WORLD 4: JAVA GAME STUDIO (Design Patterns, Observer & State)
    # =========================================================================
    {
        "game_id": "java-game-studio",
        "level_number": 1,
        "title": "Hero Initialization",
        "topic": "Class Structure",
        "difficulty": "Beginner (Level 1: 1-Line Answer)",
        "learning_objective": "Initialize hero hit points in 1 line.",
        "scenario": "Spawn the pixel knight hero with 100 hit points.",
        "starter_code": """public class Hero {
    // Level 1: Hero HP (Beginner: 1 Line Answer)
    // TODO: Write 1 line declaring int health = 100:
    
}
""",
        "solution_code": "int health = 100;",
        "solution_hint": "int health = 100;",
        "test_cases": [{"name": "Health Field", "pattern": r"int\s+health\s*=\s*100"}],
        "xp_reward": 35
    },
    {
        "game_id": "java-game-studio",
        "level_number": 10,
        "title": "2.5D Synthwave Game Engine",
        "topic": "MNC Capstone (Full Code From Scratch)",
        "difficulty": "Expert (Level 10: Full Code Scratch)",
        "learning_objective": "Author the complete Game Loop & Collision Manager from scratch.",
        "scenario": "Author GameEngine class from scratch with score tracking and enemy collision detection.",
        "starter_code": """// Level 10: 2.5D Synthwave Game Engine (MNC Capstone)
// Write the COMPLETE Java solution from scratch!
//
// Requirements:
// 1. Declare 'public class GameEngine'
// 2. Add private int score = 0;
// 3. Add method: public void addScore(int points)
// 4. Add method: public int getScore()
// 5. Add main method testing scoring

// TODO: Author complete code from scratch below:

""",
        "solution_code": """public class GameEngine {
    private int score = 0;

    public void addScore(int points) {
        this.score += points;
    }

    public int getScore() {
        return this.score;
    }

    public static void main(String[] args) {
        GameEngine ge = new GameEngine();
        ge.addScore(50);
        ge.addScore(100);
        System.out.println("Total Score: " + ge.getScore());
    }
}""",
        "solution_hint": "Declare class GameEngine with score, addScore, and getScore.",
        "test_cases": [{"name": "GameEngine Class", "pattern": r"class\s+GameEngine"}],
        "xp_reward": 100
    },

    # =========================================================================
    # WORLD 5: JAVA FORENSICS (Exceptions, Stack Traces & JVM Debugging)
    # =========================================================================
    {
        "game_id": "java-forensics",
        "level_number": 1,
        "title": "Anatomy of a Stack Trace",
        "topic": "Defensive Null Checks",
        "difficulty": "Beginner (Level 1: 1-Line Answer)",
        "learning_objective": "Guard against NullPointerException in 1 line.",
        "scenario": "Prevent microservice collapse by returning 'UNKNOWN' if input frame is null.",
        "starter_code": """public class IncidentInvestigation {
    public static String getCulprit(String[] frames) {
        // Level 1: Defensive Guard (Beginner: 1 Line Answer)
        // TODO: Write 1 line: if frames is null return 'UNKNOWN':
        
        return frames[0];
    }

    public static void main(String[] args) {
        System.out.println("Result: " + getCulprit(null));
    }
}
""",
        "solution_code": "if (frames == null) return \"UNKNOWN\";",
        "solution_hint": "if (frames == null) return \"UNKNOWN\";",
        "test_cases": [{"name": "Null Guard", "pattern": r"if\s*\(\s*frames\s*==\s*null\s*\)\s*return\s*\"UNKNOWN\""}],
        "xp_reward": 35
    },
    {
        "game_id": "java-forensics",
        "level_number": 10,
        "title": "Cyber Incident Response Unit",
        "topic": "MNC Capstone (Full Code From Scratch)",
        "difficulty": "Expert (Level 10: Full Code Scratch)",
        "learning_objective": "Author the complete Incident Forensics Auditor from scratch.",
        "scenario": "Author CyberIncidentReport class from scratch verifying threat resolution.",
        "starter_code": """// Level 10: Cyber Incident Response Unit (MNC Capstone)
// Write the COMPLETE Java solution from scratch!
//
// Requirements:
// 1. Declare 'public class CyberIncidentReport'
// 2. Add private int threatLevel;
// 3. Add constructor: public CyberIncidentReport(int level)
// 4. Add method: public String auditStatus() returning 'Threat Level ' + threatLevel + ': MITIGATED'
// 5. Add main method testing threat level 5

// TODO: Author complete code from scratch below:

""",
        "solution_code": """public class CyberIncidentReport {
    private int threatLevel;

    public CyberIncidentReport(int level) {
        this.threatLevel = level;
    }

    public String auditStatus() {
        return "Threat Level " + threatLevel + ": MITIGATED";
    }

    public static void main(String[] args) {
        CyberIncidentReport cir = new CyberIncidentReport(5);
        System.out.println(cir.auditStatus());
    }
}""",
        "solution_hint": "Declare class CyberIncidentReport with constructor, auditStatus, and main.",
        "test_cases": [{"name": "Cyber Incident Class", "pattern": r"class\s+CyberIncidentReport"}],
        "xp_reward": 100
    },

    # =========================================================================
    # WORLD 6: JAVA ARCHITECTURE (Spring Boot, Multithreading & Concurrency)
    # =========================================================================
    {
        "game_id": "java-architecture",
        "level_number": 1,
        "title": "Cloud Mesh Gateway",
        "topic": "String Immutability & URLs",
        "difficulty": "Beginner (Level 1: 1-Line Answer)",
        "learning_objective": "Declare the cloud microservice endpoint in 1 line.",
        "scenario": "Declare the microservice cluster endpoint URL in 1 line.",
        "starter_code": """public class Gateway {
    public static void main(String[] args) {
        // Level 1: Endpoint declaration (Beginner: 1 Line Answer)
        // TODO: Write 1 line declaring String endpoint = 'https://mesh.cloud.corp':
        
        System.out.println("Gateway active.");
    }
}
""",
        "solution_code": "String endpoint = \"https://mesh.cloud.corp\";",
        "solution_hint": "String endpoint = \"https://mesh.cloud.corp\";",
        "test_cases": [{"name": "Endpoint String", "pattern": r"String\s+endpoint\s*=\s*\"https://mesh\.cloud\.corp\""}],
        "xp_reward": 35
    },
    {
        "game_id": "java-architecture",
        "level_number": 10,
        "title": "Distributed Cloud Service Mesh",
        "topic": "MNC Capstone (Full Code From Scratch)",
        "difficulty": "Expert (Level 10: Full Code Scratch)",
        "learning_objective": "Author the complete distributed load balancer from scratch.",
        "scenario": "Author CloudLoadBalancer class from scratch with round-robin server routing.",
        "starter_code": """// Level 10: Distributed Cloud Service Mesh (MNC Capstone)
// Write the COMPLETE Java solution from scratch!
//
// Requirements:
// 1. Declare 'public class CloudLoadBalancer'
// 2. Add private java.util.List<String> servers = new java.util.ArrayList<>();
// 3. Add private int currentIndex = 0;
// 4. Add method: public void registerServer(String server)
// 5. Add method: public String routeRequest() returning next server round-robin
// 6. Add main method registering 2 servers and routing 4 requests

// TODO: Author complete code from scratch below:

""",
        "solution_code": """import java.util.*;

public class CloudLoadBalancer {
    private List<String> servers = new ArrayList<>();
    private int currentIndex = 0;

    public void registerServer(String server) {
        servers.add(server);
    }

    public String routeRequest() {
        if (servers.isEmpty()) return "NO_SERVERS";
        String s = servers.get(currentIndex);
        currentIndex = (currentIndex + 1) % servers.size();
        return s;
    }

    public static void main(String[] args) {
        CloudLoadBalancer lb = new CloudLoadBalancer();
        lb.registerServer("pod-1.internal");
        lb.registerServer("pod-2.internal");
        for (int i = 0; i < 4; i++) {
            System.out.println("Routed to: " + lb.routeRequest());
        }
    }
}""",
        "solution_hint": "Declare class CloudLoadBalancer with round-robin index modulo arithmetic.",
        "test_cases": [{"name": "Load Balancer Class", "pattern": r"class\s+CloudLoadBalancer"}],
        "xp_reward": 100
    }
]

def main():
    print("=" * 60)
    print("MIGRATING & SEEDING POSTGRESQL DATABASE ON PORT 5310")
    print("=" * 60)

    # 1. Create all schema tables in PostgreSQL
    print("[1/5] Creating schema tables in PostgreSQL (port 5310)...")
    Base.metadata.create_all(bind=engine)
    print("      -> Schema created successfully.")

    db = SessionLocal()
    try:
        # 2. Seed Default Users
        print("[2/5] Seeding default users (admin, student)...")
        seed_default_users(db)

        # 3. Seed Achievements & Roadmap
        print("[3/5] Seeding gamification achievements & roadmap...")
        seed_achievements(db)
        seed_roadmap(db)
        seed_projects(db)

        # 4. Seed 250 Top MNC Interview Questions
        print("[4/5] Seeding 250 Top MNC Interview Questions into PostgreSQL...")
        import_question_bank(db)
        total_q = db.query(QuestionBank).count()
        print(f"      -> QuestionBank now contains {total_q} questions in PostgreSQL!")

        # 5. Seed Game Levels (Calibrated Level 1 1-line to Level 10 scratch)
        print("[5/5] Seeding calibrated Game Levels into PostgreSQL game_levels table...")
        from database.repositories.game_level_repository import GameLevelRepository
        seeded_count = GameLevelRepository.bulk_seed(db, GAME_LEVELS_CATALOG)
        total_levels = db.query(GameLevel).count()
        print(f"      -> Seeded {seeded_count} levels. Total in DB: {total_levels} levels!")

        print("=" * 60)
        print("POSTGRESQL MIGRATION & SEED COMPLETE (0 ERRORS)")
        print("=" * 60)
    finally:
        db.close()

if __name__ == "__main__":
    main()
