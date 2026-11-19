import { LevelDefinition } from '../../components/GameLayout';

export const FORENSICS_LEVELS: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: 'Anatomy of a Stack Trace',
    topic: 'Call Stack & Exceptions',
    learningObjective: 'Examine a simulated stack trace, catch NullPointerException, and print the pinpointed culprit method.',
    scenario: 'A production microservice just collapsed! Inspect the call frames and prevent the unchecked exception.',
    initialCode: `public class IncidentInvestigation {
    public static void inspectServer(String hostConfig) {
        if (hostConfig == null) {
            throw new NullPointerException("hostConfig is null");
        }
    }

    public static void main(String[] args) {
        try {
            inspectServer(null);
        } catch (NullPointerException e) {
            System.out.println("FORENSIC EVIDENCE ACQUIRED: NullPointerException intercepted!");
            System.out.println("CASE STATUS: Culprit identified in inspectServer()");
        }
    }
}
`,
    solutionHint: 'Wrap inspectServer call in a try-catch block catching NullPointerException.'
  },
  {
    levelNumber: 2,
    title: 'Off-By-One Array Breach',
    topic: 'Bounds Checking & Array Indices',
    learningObjective: 'Fix the off-by-one loop boundary that causes ArrayIndexOutOfBoundsException.',
    scenario: 'A network packet sniffer crashed mid-scan. Correct the boundary condition from <= to < length.',
    initialCode: `public class PacketSniffer {
    public static void main(String[] args) {
        int[] packets = { 101, 204, 308, 415, 590 };

        // Fix loop boundary: change <= packets.length to < packets.length
        for (int i = 0; i < packets.length; i++) {
            System.out.println("Packet [" + i + "]: ID #" + packets[i]);
        }

        System.out.println("AUDIT SUCCESS: All packets inspected without memory fault!");
    }
}
`,
    solutionHint: 'Change loop comparison to i < packets.length.'
  },
  {
    levelNumber: 3,
    title: 'The Silent Zero-Division Exploit',
    topic: 'ArithmeticException & Defensive Guarding',
    learningObjective: 'Prevent a server denial-of-service crash by guarding against division by zero.',
    scenario: 'Attackers sent 0 as the worker pool count, causing an uncaught ArithmeticException.',
    initialCode: `public class TransactionNode {
    public static double calculateLoad(int totalTxs, int nodeCount) {
        if (nodeCount == 0) {
            System.out.println("DEFENSIVE GUARD: Node count is 0. Rerouting to emergency pool.");
            return 0.0;
        }
        return (double) totalTxs / nodeCount;
    }

    public static void main(String[] args) {
        double load = calculateLoad(15000, 0);
        System.out.println("Calculated Safe Load: " + load);
        System.out.println("EXPLOIT DEFLECTED: Service maintained uptime.");
    }
}
`,
    solutionHint: 'Verify nodeCount == 0 and return 0.0 before performing division.'
  },
  {
    levelNumber: 4,
    title: 'The Vanishing Reference',
    topic: 'Optional<T> & Null Safety',
    learningObjective: 'Refactor user token lookup to return Optional<String> and eliminate null hazards.',
    scenario: 'Eliminate null return values from security token lookups using java.util.Optional.',
    initialCode: `import java.util.Optional;

public class SecurityRegistry {
    public static Optional<String> findSessionToken(String userId) {
        if ("agent_007".equals(userId)) {
            return Optional.of("SEC_TOKEN_ALPHA_99182");
        }
        return Optional.empty();
    }

    public static void main(String[] args) {
        Optional<String> token = findSessionToken("agent_007");
        System.out.println("Agent Token: " + token.orElse("REVOKED"));
        System.out.println("NULL HAZARD ELIMINATED WITH OPTIONAL<T>");
    }
}
`,
    solutionHint: 'Return Optional.of(...) when present and Optional.empty() when absent.'
  },
  {
    levelNumber: 5,
    title: 'Heap Memory Leak Forensics',
    topic: 'Garbage Collection & Static Leaks',
    learningObjective: 'Demonstrate how unbounded static collections cause memory leaks and purge them properly.',
    scenario: 'The server OOM killer killed the JVM process. Clear retained static cache references.',
    initialCode: `import java.util.ArrayList;
import java.util.List;

public class MemoryLeakInvestigator {
    private static final List<byte[]> telemetryCache = new ArrayList<>();

    public static void simulateIngestion() {
        for (int i = 0; i < 5; i++) {
            telemetryCache.add(new byte[1024]);
        }
        System.out.println("Current heap cached objects: " + telemetryCache.size());

        telemetryCache.clear();
        System.out.println("FORENSIC REMEDIATION: Cache cleared. Leaked objects unpinned!");
    }

    public static void main(String[] args) {
        simulateIngestion();
    }
}
`,
    solutionHint: 'Call telemetryCache.clear() to remove strong references and allow garbage collection.'
  },
  {
    levelNumber: 6,
    title: 'Garbage Collection & WeakReferences',
    topic: 'WeakReference & GC Lifecycle',
    learningObjective: 'Create a WeakReference that allows GC to reclaim cached data under memory pressure.',
    scenario: 'Hold bitmap images in memory without preventing GC reclamation during high load.',
    initialCode: `import java.lang.ref.WeakReference;

public class GarbageCollectionDemo {
    public static void main(String[] args) {
        String sensitiveReport = new String("TOP_SECRET_CRIME_DOSSIER");
        WeakReference<String> weakRef = new WeakReference<>(sensitiveReport);

        System.out.println("Before GC: " + weakRef.get());
        sensitiveReport = null; // Clear strong reference

        System.out.println("Strong reference cleared. Object eligible for garbage collection.");
        System.out.println("WEAK_REFERENCE FORENSICS VERIFIED.");
    }
}
`,
    solutionHint: 'Wrap the object in WeakReference and nullify the strong reference.'
  },
  {
    levelNumber: 7,
    title: 'Thread Deadlock Dissection',
    topic: 'Thread Dumps & Monitor States',
    learningObjective: 'Analyze simulated jstack thread dump lines to identify BLOCKED state and circular wait.',
    scenario: 'Two worker threads locked each other out. Dissect the dump and diagnose the root cause.',
    initialCode: `public class ThreadDumpAnalyzer {
    public static void main(String[] args) {
        String dump = 
            "Thread-1 [BLOCKED] waiting to lock <0x77ab81> held by Thread-2\\n" +
            "Thread-2 [BLOCKED] waiting to lock <0x77ab99> held by Thread-1\\n";

        System.out.println("=== THREAD DUMP FORENSIC ANALYSIS ===");
        System.out.print(dump);

        if (dump.contains("BLOCKED") && dump.contains("held by")) {
            System.out.println("CRITICAL VULNERABILITY: Circular Thread Deadlock Detected!");
        }
    }
}
`,
    solutionHint: 'Detect the mutual circular lock holding relationship.'
  },
  {
    levelNumber: 8,
    title: 'ClassNotFound vs NoClassDefFoundError',
    topic: 'ClassLoader & Runtime Linkage',
    learningObjective: 'Catch ClassNotFoundException and understand the difference from fatal LinkageError.',
    scenario: 'A plugin dynamic load failed. Diagnose whether it is a runtime lookup or bytecode linkage failure.',
    initialCode: `public class ClassLoaderDebugger {
    public static void main(String[] args) {
        String missingClass = "com.corpo.shadow.NonExistentDriver";

        try {
            Class.forName(missingClass);
        } catch (ClassNotFoundException e) {
            System.out.println("DIAGNOSIS: ClassNotFoundException caught!");
            System.out.println("REASON: Missing from classpath at runtime.");
        }

        System.out.println("CLASSLOADER INTEGRITY: DIAGNOSED");
    }
}
`,
    solutionHint: 'Catch ClassNotFoundException when invoking Class.forName.'
  },
  {
    levelNumber: 9,
    title: 'Bytecode Disassembly Analysis',
    topic: 'Java Bytecode & JVM Opcodes',
    learningObjective: 'Trace JVM bytecode instructions (bipush, istore, iload, iadd) to calculate stack results.',
    scenario: 'Reverse-engineer compiled class bytecode to inspect operand stack calculations.',
    initialCode: `public class BytecodeInspector {
    public static void main(String[] args) {
        System.out.println("=== DISASSEMBLING METHOD ===");
        System.out.println("0: bipush 25");
        System.out.println("2: bipush 75");
        System.out.println("4: iadd");

        int result = 25 + 75;
        System.out.println("SIMULATED JVM OPERAND STACK RESULT: " + result);
        System.out.println("BYTECODE REVERSE-ENGINEERING: 100% COMPLETE");
    }
}
`,
    solutionHint: 'Compute the sum pushed onto the operand stack.'
  },
  {
    levelNumber: 10,
    title: 'Forensic Case File: Case Solved',
    topic: 'Full Security Post-Mortem',
    learningObjective: 'Produce the complete cyber incident post-mortem resolving all bugs, leaks, and deadlocks.',
    scenario: 'All threats eliminated! Certify the forensic investigation complete.',
    initialCode: `public class CyberForensicsMaster {
    public static void main(String[] args) {
        System.out.println("=========================================");
        System.out.println("   CYBER INCIDENT RESPONSE UNIT (CIRU)   ");
        System.out.println("=========================================");
        System.out.println("[OK] Stack Traces Analyzed & Intercepted");
        System.out.println("[OK] Array Off-by-One Bounds Hardened");
        System.out.println("[OK] Zero-Division Guards Implemented");
        System.out.println("[OK] Heap Static References Deallocated");
        System.out.println("CASE REPORT: SYSTEM SECURED. FORENSICS INVESTIGATION COMPLETE!");
    }
}
`,
    solutionHint: 'Execute the final incident report.'
  }
];
