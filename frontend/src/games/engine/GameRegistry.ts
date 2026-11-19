export interface GameMetadata {
  id: string;
  title: string;
  tagline: string;
  theme: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
  topics: string[];
  totalLevels: number;
  icon: string;
  accentColor: string;
  description: string;
}

export const GAME_REGISTRY: Record<string, GameMetadata> = {
  'creature-creator': {
    id: 'creature-creator',
    title: 'Creature Creator',
    tagline: 'Fantasy Creature Laboratory',
    theme: 'Magical Biometric Laboratory',
    difficulty: 'Beginner',
    topics: ['Classes', 'Objects', 'Constructors', 'Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
    totalLevels: 10,
    icon: 'Boxes',
    accentColor: '#10b981',
    description: 'Start with an empty fantasy laboratory. Write Java classes, constructors, and methods to bring magical living creatures to life and watch them react to your code.'
  },
  'restaurant-tycoon': {
    id: 'restaurant-tycoon',
    title: 'Restaurant Tycoon',
    tagline: 'Isometric Restaurant Management',
    theme: 'Busy City Bistro',
    difficulty: 'Beginner',
    topics: ['Variables', 'Operators', 'If-Else', 'Switch', 'Loops', 'Arrays', 'ArrayList', 'Exceptions'],
    totalLevels: 10,
    icon: 'UtensilsCrossed',
    accentColor: '#f59e0b',
    description: 'Manage an isometric restaurant. Code customer bill calculations, stock validation, and kitchen loops using Java collections and exception handling.'
  },
  'space-colony': {
    id: 'space-colony',
    title: 'Space Colony',
    tagline: '2.5D Sci-Fi Colony Simulator',
    theme: 'Ares Deep Space Outpost',
    difficulty: 'Intermediate',
    topics: ['Interfaces', 'Generics', 'Stream API', 'File I/O', 'Multithreading', 'Synchronization', 'AtomicInteger'],
    totalLevels: 10,
    icon: 'Rocket',
    accentColor: '#0ea5e9',
    description: 'Establish a self-sustaining planetary colony. Code life-support systems with interfaces, analyze sensor telemetry with Streams, and coordinate concurrent worker threads.'
  },
  'java-game-studio': {
    id: 'java-game-studio',
    title: 'Java Game Studio',
    tagline: 'Interactive 2.5D Game Dev Studio',
    theme: 'Indie Game Development Loft',
    difficulty: 'Intermediate',
    topics: ['OOP Architecture', 'Entity Systems', 'Interfaces', 'Algorithms', 'Composition', 'Design Patterns'],
    totalLevels: 10,
    icon: 'Gamepad2',
    accentColor: '#a855f7',
    description: 'Build your own playable mini-game. Program player controllers, enemy AI behaviors, and collision systems with clean OOP and design patterns.'
  },
  'java-forensics': {
    id: 'java-forensics',
    title: 'Java Forensics',
    tagline: 'Cyber Incident Command Center',
    theme: 'Dark Operations War Room',
    difficulty: 'Advanced',
    topics: ['Debugging', 'Stack Traces', 'Heap & Stack', 'Garbage Collection', 'Deadlocks', 'Bytecode'],
    totalLevels: 8,
    icon: 'ShieldAlert',
    accentColor: '#f43f5e',
    description: 'Investigate critical enterprise outages. Inspect real stack traces, set breakpoints, fix memory leaks, and resolve thread deadlocks to restore production systems.'
  },
  'java-architecture': {
    id: 'java-architecture',
    title: 'Architecture Architect',
    tagline: 'Enterprise Software Studio',
    theme: 'Futuristic Tech Campus',
    difficulty: 'Master',
    topics: ['SOLID Principles', 'Design Patterns', 'JDBC', 'Spring Boot', 'REST APIs', 'Spring Data JPA', 'Security'],
    totalLevels: 10,
    icon: 'Building2',
    accentColor: '#14b8a6',
    description: 'Design production-grade enterprise backends. Connect databases with JDBC, build REST microservices with Spring Boot, and secure them with JWT authentication.'
  }
};
