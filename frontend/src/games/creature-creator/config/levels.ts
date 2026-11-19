import { LevelDefinition } from '../../components/GameLayout';

export const CREATURE_CREATOR_LEVELS: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: 'The Empty Laboratory',
    topic: 'Classes & Blueprints',
    learningObjective: 'Understand a class as a blueprint. Build the initial Creature class structure.',
    scenario: 'The fantasy laboratory is completely empty. Before we can create any living creatures, the incubator chamber requires a class blueprint defining what a creature is.',
    initialCode: `// Level 1: Define the Creature Blueprint
public class Creature {
    // A class serves as the blueprint for objects
}
`,
    solutionHint: 'In Java, declare a class using "public class Creature { }". Inside the braces, we will later define fields and methods.'
  },
  {
    levelNumber: 2,
    title: 'Give It Identity',
    topic: 'Instance Variables & State',
    learningObjective: 'Declare instance variables to represent an object\'s state: name, age, energy, and species.',
    scenario: 'Now that the blueprint exists, give the creature attributes so individual creatures can maintain their own unique state.',
    initialCode: `public class Creature {
    // Declare instance variables:
    String name = "Aero";
    int age = 1;
    int energy = 100;
    String species = "Dragon";
}
`,
    solutionHint: 'Declare variable types followed by variable names, e.g., String name; int energy = 100;'
  },
  {
    levelNumber: 3,
    title: 'Create Your First Creature',
    topic: 'Object Instantiation (new)',
    learningObjective: 'Instantiate multiple creature objects using the "new" keyword and demonstrate independent state.',
    scenario: 'Use the blueprint to materialize creatures inside the incubation chambers. Demonstrate that c1 and c2 exist independently in memory.',
    initialCode: `public class Main {
    public static void main(String[] args) {
        // Instantiate two creature objects
        Creature c1 = new Creature();
        Creature c2 = new Creature();
        
        System.out.println("Hatched creature 1 and creature 2!");
    }
}
`,
    solutionHint: 'Use the syntax: ClassName variableName = new ClassName();'
  },
  {
    levelNumber: 4,
    title: 'Bring It to Life',
    topic: 'Constructors & Initialization',
    learningObjective: 'Write a parameterized constructor to initialize creature attributes with custom values upon creation.',
    scenario: 'Rather than hardcoding default values, write a constructor that accepts name and species at birth.',
    initialCode: `public class Creature {
    String name;
    int energy;
    String species;

    // Custom Parameterized Constructor
    public Creature(String name, String species) {
        this.name = name;
        this.species = species;
        this.energy = 100;
    }
}
`,
    solutionHint: 'A constructor shares the exact name of the class and has no return type. Use this.field = param;'
  },
  {
    levelNumber: 5,
    title: 'Give It Abilities',
    topic: 'Methods & Behaviors',
    learningObjective: 'Implement methods: eat(), sleep(), run(), and attack() to determine physical creature abilities.',
    scenario: 'Your creature is physically alive, but stationary! Write executable methods that modify energy and return combat damage.',
    initialCode: `public class Creature {
    String name = "IgnisDragon";
    int energy = 100;

    public int attack() {
        if (this.energy >= 20) {
            this.energy -= 20;
            return 50; // Deals 50 plasma damage
        }
        return 0; // Out of energy
    }

    public void eat() {
        this.energy += 30;
    }

    public void sleep() {
        this.energy = 100;
    }
}
`,
    solutionHint: 'Methods define behaviors. Use "public returnType methodName() { ... }".'
  },
  {
    levelNumber: 6,
    title: 'Protect the Creature',
    topic: 'Encapsulation & Access Modifiers',
    learningObjective: 'Make fields private and provide controlled getters and setters with validation rules.',
    scenario: 'Directly modifying creature health can corrupt data! Encapsulate fields to prevent negative energy.',
    initialCode: `public class Creature {
    private String name;
    private int energy;

    public Creature(String name) {
        this.name = name;
        this.energy = 100;
    }

    public int getEnergy() {
        return this.energy;
    }

    public void setEnergy(int energy) {
        if (energy >= 0 && energy <= 200) {
            this.energy = energy;
        }
    }
}
`,
    solutionHint: 'Mark variables as private, and expose public getX() and setX() with validation checks.'
  },
  {
    levelNumber: 7,
    title: 'Discover New Species',
    topic: 'Inheritance & super()',
    learningObjective: 'Extend the Creature class into specialized subclasses: Dragon, Dog, and Phoenix.',
    scenario: 'The laboratory is discovering specialized evolutionary species. Use inheritance to inherit baseline creature behaviors.',
    initialCode: `public class Dragon extends Creature {
    private int fireBreathPower;

    public Dragon(String name, int fireBreathPower) {
        super(name); // Call superclass constructor first
        this.fireBreathPower = fireBreathPower;
    }

    public int breatheFire() {
        return this.fireBreathPower * 2;
    }
}
`,
    solutionHint: 'Use the "extends" keyword. Call super(...) as the very first statement in the child constructor.'
  },
  {
    levelNumber: 8,
    title: 'Different Behaviours',
    topic: 'Method Overriding & Polymorphism',
    learningObjective: 'Override attack() and sound() across different species using @Override for dynamic dispatch.',
    scenario: 'Different creatures must respond uniquely to the same attack() call. The Dragon breathes plasma, while the Golem slams shields!',
    initialCode: `public class Dragon extends Creature {
    public Dragon(String name) { super(name); }

    @Override
    public int attack() {
        return 80; // High elemental burst damage!
    }
}
`,
    solutionHint: 'Use @Override above the method signature. The method name, parameters, and return type must match the superclass.'
  },
  {
    levelNumber: 9,
    title: 'Advanced Creature Architecture',
    topic: 'Abstract Classes & Interfaces',
    learningObjective: 'Declare abstract classes and implement reusable capability interfaces (Flyable, Swimmable).',
    scenario: 'Not all creatures fly or swim. Define capability contracts with interfaces.',
    initialCode: `public interface Flyable {
    void fly(int altitude);
}

public class WingedDragon extends Creature implements Flyable {
    public WingedDragon(String name) { super(name); }

    @Override
    public void fly(int altitude) {
        System.out.println("Soaring at " + altitude + " meters!");
    }
}
`,
    solutionHint: 'Use the "implements" keyword for interfaces and provide concrete method bodies for all abstract methods.'
  },
  {
    levelNumber: 10,
    title: 'Build an Ecosystem',
    topic: 'Full Capstone Ecosystem',
    learningObjective: 'Combine all learned OOP concepts into a functioning multi-species ecosystem simulation.',
    scenario: 'Synthesize your entire laboratory knowledge: instantiate an ecosystem of interacting creatures in the 2.5D world!',
    initialCode: `public class Ecosystem {
    private List<Creature> creatures = new ArrayList<>();

    public void addCreature(Creature c) {
        creatures.add(c);
    }

    public int calculateTotalPower() {
        int total = 0;
        for (Creature c : creatures) {
            total += c.attack();
        }
        return total;
    }
}
`,
    solutionHint: 'Iterate over polymorphic Creature references and invoke overridden attack() methods.'
  }
];
