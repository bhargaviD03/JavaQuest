import { LevelDefinition } from '../../components/GameLayout';

export const GAME_STUDIO_LEVELS: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: 'The Core Game Loop',
    topic: 'Game Loop Architecture & Delta Time',
    learningObjective: 'Implement the GameEngine tick(double delta) method that updates game uptime and processes frame ticks.',
    scenario: 'Welcome Game Architect! Every video game begins with a game loop executing update logic at 60 FPS.',
    initialCode: `public class GameEngine {
    private double totalTime = 0.0;
    private int frameCount = 0;

    public void tick(double deltaTime) {
        totalTime += deltaTime;
        frameCount++;
        System.out.printf("TICK #%d | Delta: %.3fs | Engine Uptime: %.3fs\\n", frameCount, deltaTime, totalTime);
    }

    public static void main(String[] args) {
        GameEngine engine = new GameEngine();
        engine.tick(0.016);
        engine.tick(0.016);
        System.out.println("GAME ENGINE RUNTIME: OPERATIONAL AT 60 FPS");
    }
}
`,
    solutionHint: 'Increment totalTime by deltaTime and increment frameCount in each tick.'
  },
  {
    levelNumber: 2,
    title: 'Entity Component Architecture',
    topic: 'Composition over Inheritance',
    learningObjective: 'Build a GameObject with Position and Velocity components that updates coordinates on each frame step.',
    scenario: 'Break free from deep inheritance hierarchies. Compose entities from Position and Velocity components.',
    initialCode: `class Position {
    public double x, y;
    public Position(double x, double y) { this.x = x; this.y = y; }
}

class Velocity {
    public double vx, vy;
    public Velocity(double vx, double vy) { this.vx = vx; this.vy = vy; }
}

class HeroEntity {
    public String name;
    public Position pos;
    public Velocity vel;

    public HeroEntity(String name, double x, double y, double vx, double vy) {
        this.name = name;
        this.pos = new Position(x, y);
        this.vel = new Velocity(vx, vy);
    }

    public void update(double dt) {
        pos.x += vel.vx * dt;
        pos.y += vel.vy * dt;
        System.out.printf("%s moved to (%.1f, %.1f)\\n", name, pos.x, pos.y);
    }
}

public class GamePhysics {
    public static void main(String[] args) {
        HeroEntity hero = new HeroEntity("PixelKnight", 100, 200, 50, 0);
        hero.update(1.0);
    }
}
`,
    solutionHint: 'Add velocity multiplied by delta time to update the position coordinates.'
  },
  {
    levelNumber: 3,
    title: 'Input Strategy Pattern',
    topic: 'Strategy Design Pattern',
    learningObjective: 'Implement KeyboardControl and GamepadControl strategies that satisfy the MovementStrategy interface.',
    scenario: 'Allow players to switch between keyboard and gamepad controls seamlessly using the Strategy pattern.',
    initialCode: `interface MovementStrategy {
    String getDirection();
}

class KeyboardArrows implements MovementStrategy {
    public String getDirection() { return "MOVING RIGHT (ArrowKey Pressed)"; }
}

class JoystickController implements MovementStrategy {
    public String getDirection() { return "MOVING JUMP (Analog Tilt)"; }
}

public class ControllerBridge {
    public static void main(String[] args) {
        MovementStrategy input = new KeyboardArrows();
        System.out.println("Strategy: " + input.getDirection());
    }
}
`,
    solutionHint: 'Implement MovementStrategy in both KeyboardArrows and JoystickController.'
  },
  {
    levelNumber: 4,
    title: 'Enemy AI State Machine',
    topic: 'State Design Pattern & Enums',
    learningObjective: 'Create an enemy AI state machine with PATROL, CHASE, and ATTACK states switching based on player distance.',
    scenario: 'Program intelligent goblin mob behavior transitioning between patrolling dungeon halls and charging the player.',
    initialCode: `enum AIState { PATROL, CHASE, ATTACK }

class EnemyMob {
    AIState state = AIState.PATROL;

    public void evaluatePlayerDistance(double distance) {
        if (distance < 5.0) {
            state = AIState.ATTACK;
        } else if (distance < 20.0) {
            state = AIState.CHASE;
        } else {
            state = AIState.PATROL;
        }
        System.out.println("Distance: " + distance + "m -> AI State: " + state);
    }
}

public class AIStateMachine {
    public static void main(String[] args) {
        EnemyMob goblin = new EnemyMob();
        goblin.evaluatePlayerDistance(12.0);
    }
}
`,
    solutionHint: 'Update state depending on distance thresholds.'
  },
  {
    levelNumber: 5,
    title: 'AABB Collision Detection',
    topic: '2D Bounding Box Geometry',
    learningObjective: 'Implement Axis-Aligned Bounding Box (AABB) intersection check between Player and Coin sprite.',
    scenario: 'Determine if the player touches collectible power-ups or hazardous floor spikes.',
    initialCode: `class BoundingBox {
    double x, y, width, height;
    public BoundingBox(double x, double y, double w, double h) {
        this.x = x; this.y = y; this.width = w; this.height = h;
    }

    public boolean intersects(BoundingBox other) {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

public class CollisionDetector {
    public static void main(String[] args) {
        BoundingBox player = new BoundingBox(10, 10, 32, 32);
        BoundingBox coin = new BoundingBox(20, 20, 16, 16);
        System.out.println("Player hits Coin? " + player.intersects(coin));
    }
}
`,
    solutionHint: 'Return true when all 4 boundary intersection comparisons hold.'
  },
  {
    levelNumber: 6,
    title: 'Power-Up Decorators',
    topic: 'Decorator Design Pattern',
    learningObjective: 'Wrap the base character with SpeedBoost and Shield decorators to dynamically enhance stats.',
    scenario: 'Pick up temporary shields without altering the underlying character class.',
    initialCode: `interface CharacterStats {
    int getDefense();
}

class BasePlayer implements CharacterStats {
    public int getDefense() { return 5; }
}

class ShieldBuff implements CharacterStats {
    private CharacterStats inner;
    public ShieldBuff(CharacterStats inner) { this.inner = inner; }
    public int getDefense() { return inner.getDefense() + 25; }
}

public class PowerUpLab {
    public static void main(String[] args) {
        CharacterStats player = new ShieldBuff(new BasePlayer());
        System.out.println("Buffed Defense: " + player.getDefense());
    }
}
`,
    solutionHint: 'Wrap the inner CharacterStats and return modified defense stats.'
  },
  {
    levelNumber: 7,
    title: 'Game Event Bus',
    topic: 'Observer Design Pattern',
    learningObjective: 'Implement an EventBus where audio and particle systems subscribe to game events.',
    scenario: 'Decouple gameplay logic from visual feedback using the pub/sub Observer pattern.',
    initialCode: `import java.util.ArrayList;
import java.util.List;

interface GameEventListener {
    void onEvent(String eventName);
}

class EventBus {
    private List<GameEventListener> listeners = new ArrayList<>();
    public void register(GameEventListener l) { listeners.add(l); }
    public void publish(String event) {
        for (GameEventListener l : listeners) l.onEvent(event);
    }
}

public class AudioAndParticleBus {
    public static void main(String[] args) {
        EventBus bus = new EventBus();
        bus.register(e -> System.out.println("[SFX] Playing sound: " + e));
        bus.publish("EXPLOSION");
    }
}
`,
    solutionHint: 'Iterate over registered listeners in publish() and invoke onEvent().'
  },
  {
    levelNumber: 8,
    title: 'Enemy Factory Spawner',
    topic: 'Factory Design Pattern',
    learningObjective: 'Implement EnemyFactory that instantiates Slime, Skeleton, or Dragon enemies.',
    scenario: 'Spawn level waves without scattering "new Slime()" statements throughout level scripts.',
    initialCode: `abstract class Enemy { abstract String attack(); }

class Slime extends Enemy { String attack() { return "Slime squirts acid (10 dmg)"; } }
class Dragon extends Enemy { String attack() { return "Dragon breathes inferno (80 dmg)"; } }

class EnemyFactory {
    public static Enemy spawn(String type) {
        if ("dragon".equalsIgnoreCase(type)) return new Dragon();
        return new Slime();
    }
}

public class DungeonSpawner {
    public static void main(String[] args) {
        Enemy e = EnemyFactory.spawn("dragon");
        System.out.println(e.attack());
    }
}
`,
    solutionHint: 'Use the Factory method to instantiate the requested Enemy subclass.'
  },
  {
    levelNumber: 9,
    title: 'Arcade Leaderboard Ranking',
    topic: 'Comparable & Comparator Sorting',
    learningObjective: 'Sort high scores using Collections.sort and display top arcade ranks.',
    scenario: 'Rank top retro arcade speedrunners in descending score order.',
    initialCode: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class PlayerScore implements Comparable<PlayerScore> {
    String name;
    int score;
    public PlayerScore(String n, int s) { name = n; score = s; }

    public int compareTo(PlayerScore other) {
        return Integer.compare(other.score, this.score);
    }
}

public class ArcadeLeaderboard {
    public static void main(String[] args) {
        List<PlayerScore> scores = new ArrayList<>();
        scores.add(new PlayerScore("Alice", 4500));
        scores.add(new PlayerScore("Bob", 8900));
        Collections.sort(scores);

        System.out.printf("#1 %s - %d pts\\n", scores.get(0).name, scores.get(0).score);
    }
}
`,
    solutionHint: 'Implement Comparable<PlayerScore> and sort descending by score.'
  },
  {
    levelNumber: 10,
    title: 'Playable Arcade Capstone',
    topic: 'Complete Game Architecture',
    learningObjective: 'Launch the complete mini-game loop with hero physics, enemies, and victory conditions.',
    scenario: 'Publish your game to the JavaQuest Arcade Hall with all engine subsystems running.',
    initialCode: `public class GameStudioMaster {
    public static void main(String[] args) {
        System.out.println("=== JAVA GAME STUDIO ENGINE v2.5 ===");
        System.out.println("Status: 60 FPS loop running smoothly");
        System.out.println("Patterns: Factory, Strategy, Observer, Decorator engaged");
        System.out.println("STAGE 1 CLEARED: Game Published to Arcade Hall!");
    }
}
`,
    solutionHint: 'Execute the published arcade game engine.'
  }
];
