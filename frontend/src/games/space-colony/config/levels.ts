import { LevelDefinition } from '../../components/GameLayout';

export const SPACE_COLONY_LEVELS: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: 'Base Subsystem Interfaces',
    topic: 'Interfaces & Contracts',
    learningObjective: 'Implement the Subsystem interface with initialize() and getStatus() methods for the Colony Oxygen Generator.',
    scenario: 'Ares Base is coming online. Implement subsystem interfaces so all life-support modules adhere to a unified communication protocol.',
    initialCode: `interface Subsystem {
    void initialize();
    String getStatus();
}

class OxygenGenerator implements Subsystem {
    private boolean active = false;

    @Override
    public void initialize() {
        this.active = true;
        System.out.println("OXYGEN GENERATOR: Online. Calibrating pressure...");
    }

    @Override
    public String getStatus() {
        return active ? "STATUS: NORMAL (101 kPa)" : "STATUS: OFFLINE";
    }
}

public class AresBase {
    public static void main(String[] args) {
        Subsystem oxy = new OxygenGenerator();
        oxy.initialize();
        System.out.println(oxy.getStatus());
    }
}
`,
    solutionHint: 'Implement Subsystem using "implements Subsystem" and override initialize() and getStatus().'
  },
  {
    levelNumber: 2,
    title: 'Cargo Bay Storage Vault',
    topic: 'Generics (<T>)',
    learningObjective: 'Create a generic CargoPod<T> class that safely stores and retrieves different resources.',
    scenario: 'The space outpost logistics bay needs to store mineral crates, battery packs, and science probes safely.',
    initialCode: `class CargoPod<T> {
    private T item;

    public void store(T item) {
        this.item = item;
        System.out.println("Stored cargo item: " + item);
    }

    public T retrieve() {
        return this.item;
    }
}

public class ColonyLogistics {
    public static void main(String[] args) {
        CargoPod<String> mineralPod = new CargoPod<>();
        mineralPod.store("500kg Refined Titanium");

        System.out.println("Cargo Bay 1 contains: " + mineralPod.retrieve());
    }
}
`,
    solutionHint: 'Declare class CargoPod<T> with private T item, and methods store(T) and T retrieve().'
  },
  {
    levelNumber: 3,
    title: 'Atmospheric Sensor Streams',
    topic: 'Stream API (filter, map, collect)',
    learningObjective: 'Filter Martian sensor readings below freeze thresholds and collect alert sectors using Java Streams.',
    scenario: 'Outer perimeter sensors report sub-zero telemetry. Filter critical hazard sectors using declarative streams.',
    initialCode: `import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

class SensorNode {
    String sector;
    int tempCelsius;
    public SensorNode(String s, int t) { this.sector = s; this.tempCelsius = t; }
}

public class AtmosphereTelemetry {
    public static void main(String[] args) {
        List<SensorNode> readings = Arrays.asList(
            new SensorNode("Dome Alpha", -45),
            new SensorNode("Hydroponics Bay", 21),
            new SensorNode("North Airlock", -72),
            new SensorNode("Perimeter Trench", -85)
        );

        List<String> freezeHazards = readings.stream()
            .filter(node -> node.tempCelsius < -60)
            .map(node -> node.sector + " (" + node.tempCelsius + "C)")
            .collect(Collectors.toList());

        System.out.println("CRITICAL COLD SECTORS: " + freezeHazards.size());
        freezeHazards.forEach(h -> System.out.println("ALERT: " + h));
    }
}
`,
    solutionHint: 'Use stream().filter(node -> node.tempCelsius < -60).map(...).collect(Collectors.toList()).'
  },
  {
    levelNumber: 4,
    title: 'Mission Flight Blackbox',
    topic: 'File I/O & Streams',
    learningObjective: 'Simulate writing telemetry packets to the colony flight blackbox log buffer.',
    scenario: 'Solar flares risk data loss. Buffer mission logs safely to telemetry streams.',
    initialCode: `import java.io.ByteArrayOutputStream;
import java.io.PrintStream;

public class ColonyBlackbox {
    public static void main(String[] args) {
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        PrintStream writer = new PrintStream(buffer);

        writer.println("SOL 142: Atmospheric scrubbing optimal.");
        writer.println("SOL 142: Solar flare detected - battery online.");
        writer.flush();

        System.out.println("=== DECODING BLACKBOX LOG ===");
        System.out.print(buffer.toString());
        System.out.println("LOG INTEGRITY: 100% VERIFIED");
    }
}
`,
    solutionHint: 'Write telemetry lines to the stream and flush to verify log output.'
  },
  {
    levelNumber: 5,
    title: 'Power Grid Dual-Generators',
    topic: 'Threads & Runnable',
    learningObjective: 'Run parallel threads for Solar and Fusion generators to balance colony power loads.',
    scenario: 'The habitat requires synchronized power generation from both solar banks and nuclear fusion.',
    initialCode: `class SolarArray implements Runnable {
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println("[SOLAR] Charging cell cluster #" + i);
        }
    }
}

class FusionReactor implements Runnable {
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println("[FUSION] Core pulse cycle #" + i);
        }
    }
}

public class ColonyPowerStation {
    public static void main(String[] args) throws InterruptedException {
        Thread solar = new Thread(new SolarArray());
        Thread fusion = new Thread(new FusionReactor());

        solar.start();
        fusion.start();
        solar.join();
        fusion.join();

        System.out.println("POWER GRID SYNCHRONIZED: Base energized!");
    }
}
`,
    solutionHint: 'Create Threads passing Runnable instances, start them, and join to await completion.'
  },
  {
    levelNumber: 6,
    title: 'Oxygen Scrubber Synchronization',
    topic: 'Thread Safety & Synchronized',
    learningObjective: 'Safeguard the shared oxygen reserve from race conditions when two habitat domes draw oxygen simultaneously.',
    scenario: 'Two domes are drawing life support from a shared oxygen manifold. Synchronize the deduction method.',
    initialCode: `class SharedOxygenBank {
    private int oxygenLiters = 1000;

    public synchronized void consume(String dome, int amount) {
        if (oxygenLiters >= amount) {
            oxygenLiters -= amount;
            System.out.println(dome + " drew " + amount + "L O2. Remaining: " + oxygenLiters + "L");
        }
    }

    public int getRemaining() { return oxygenLiters; }
}

public class OxygenNetwork {
    public static void main(String[] args) throws InterruptedException {
        SharedOxygenBank bank = new SharedOxygenBank();
        Thread t1 = new Thread(() -> bank.consume("Dome Alpha", 300));
        Thread t2 = new Thread(() -> bank.consume("Dome Beta", 250));

        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("Final Tank Reserve: " + bank.getRemaining() + "L");
    }
}
`,
    solutionHint: 'Mark the method synchronized so concurrent access to oxygenLiters is atomic.'
  },
  {
    levelNumber: 7,
    title: 'Autonomous Rover Dispatcher',
    topic: 'AtomicInteger & Concurrency Utilities',
    learningObjective: 'Issue thread-safe mission IDs to rovers using AtomicInteger incrementAndGet().',
    scenario: 'Fleet rovers explore the Martian dunes. Guarantee sequential non-colliding mission tracking numbers.',
    initialCode: `import java.util.concurrent.atomic.AtomicInteger;

public class RoverDispatcher {
    private static final AtomicInteger seq = new AtomicInteger(100);

    public static void dispatch(String name) {
        int id = seq.incrementAndGet();
        System.out.println("DISPATCH: " + name + " assigned Mission #" + id);
    }

    public static void main(String[] args) {
        dispatch("Curiosity-IV");
        dispatch("Perseverance-X");
        System.out.println("Current Mission Counter: " + seq.get());
    }
}
`,
    solutionHint: 'Call seq.incrementAndGet() to atomically increment without explicit locks.'
  },
  {
    levelNumber: 8,
    title: 'Meteor Defense Pipeline',
    topic: 'Parallel Streams & Threat Sorting',
    learningObjective: 'Sort incoming space debris by speed descending and trigger planetary defense laser locks.',
    scenario: 'Martian radar picks up high-velocity meteor fragments. Lock targets in order of greatest velocity.',
    initialCode: `import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

class Meteor {
    String name;
    int velocity;
    public Meteor(String n, int v) { name = n; velocity = v; }
}

public class PlanetaryDefense {
    public static void main(String[] args) {
        List<Meteor> radar = Arrays.asList(
            new Meteor("Asteroid-99X", 42),
            new Meteor("Debris-12", 15),
            new Meteor("CometFragment-Alpha", 68)
        );

        radar.stream()
            .filter(m -> m.velocity > 20)
            .sorted(Comparator.comparingInt((Meteor m) -> m.velocity).reversed())
            .forEach(target -> System.out.println("DEFENSE LOCK: " + target.name + " (" + target.velocity + " km/s)"));

        System.out.println("THREATS NEUTRALIZED: Colony safe.");
    }
}
`,
    solutionHint: 'Use sorted(Comparator.comparingInt(...).reversed()) to sort fastest threats first.'
  },
  {
    levelNumber: 9,
    title: 'Coolant Loop Deadlock Prevention',
    topic: 'ReentrantLock & Deadlock Avoidance',
    learningObjective: 'Prevent circular wait deadlock by acquiring Pump A and Pump B locks in strict global order.',
    scenario: 'Two maintenance droids manage dual coolant pumps. Enforce lock ordering to prevent permanent hang.',
    initialCode: `import java.util.concurrent.locks.ReentrantLock;

public class CoolantSystem {
    private static final ReentrantLock pumpA = new ReentrantLock();
    private static final ReentrantLock pumpB = new ReentrantLock();

    public static void runCycle(String worker) {
        pumpA.lock();
        try {
            pumpB.lock();
            try {
                System.out.println(worker + " cycling coolant smoothly.");
            } finally {
                pumpB.unlock();
            }
        } finally {
            pumpA.unlock();
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> runCycle("Droid-1"));
        Thread t2 = new Thread(() -> runCycle("Droid-2"));
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println("DEADLOCK PREVENTED: Pumps nominal.");
    }
}
`,
    solutionHint: 'Always acquire pumpA before pumpB and unlock inside finally blocks.'
  },
  {
    levelNumber: 10,
    title: 'Ares Station Autonomous Nexus',
    topic: 'Colony Capstone System',
    learningObjective: 'Integrate life support telemetry, power distribution, and rover automation into a capstone supervisor.',
    scenario: 'Sol 500 milestone achieved! Confirm full autonomous Martian station operation.',
    initialCode: `public class AresNexus {
    public static void main(String[] args) {
        System.out.println("=== ARES COLONY NEXUS ACTIVE ===");
        System.out.println("Telemetry: Atmospheric Scrubbers @ 100%");
        System.out.println("Power Grid: Dual-Fusion Core stabilized at 450MW");
        System.out.println("Robotic Fleet: Autonomous rovers collecting Martian core samples");
        System.out.println("ARES BASE STATUS: FULLY SELF-SUSTAINING. COLONY CONQUERED!");
    }
}
`,
    solutionHint: 'Verify all colony subsystems are initialized and report full self-sustaining status.'
  }
];
