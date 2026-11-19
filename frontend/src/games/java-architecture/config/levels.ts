import { LevelDefinition } from '../../components/GameLayout';

export const ARCHITECTURE_LEVELS: LevelDefinition[] = [
  {
    levelNumber: 1,
    title: 'Single Responsibility Principle',
    topic: 'SOLID - Single Responsibility',
    learningObjective: 'Decouple UserNotificationService from UserPersistenceService so each class has exactly one responsibility.',
    scenario: 'Refactor a monolithic God Class into decoupled single-purpose enterprise service components.',
    initialCode: `class UserPersistenceService {
    public void saveUser(String username) {
        System.out.println("[DB] Persisted user to database: " + username);
    }
}

class UserNotificationService {
    public void sendWelcomeEmail(String email) {
        System.out.println("[MAIL] Dispatched welcome email to: " + email);
    }
}

public class CleanArchitectureApp {
    public static void main(String[] args) {
        UserPersistenceService db = new UserPersistenceService();
        UserNotificationService mail = new UserNotificationService();

        db.saveUser("sarah_dev");
        mail.sendWelcomeEmail("sarah@enterprise.io");
        System.out.println("SRP ARCHITECTURE: Clean separation achieved!");
    }
}
`,
    solutionHint: 'Keep database storage logic separate from email dispatch logic.'
  },
  {
    levelNumber: 2,
    title: 'Dependency Inversion & IoC',
    topic: 'SOLID - Dependency Inversion Principle',
    learningObjective: 'Inject a PaymentGateway interface into CheckoutService rather than coupling concrete implementations.',
    scenario: 'Allow switching payment providers (Stripe, PayPal) without rewriting checkout business logic.',
    initialCode: `interface PaymentGateway {
    void processCharge(double amount);
}

class StripeGateway implements PaymentGateway {
    public void processCharge(double amount) {
        System.out.printf("[STRIPE] Charged $%.2f successfully\\n", amount);
    }
}

class CheckoutService {
    private final PaymentGateway gateway;
    public CheckoutService(PaymentGateway gateway) { this.gateway = gateway; }
    public void checkout(double total) { gateway.processCharge(total); }
}

public class IoCDemo {
    public static void main(String[] args) {
        PaymentGateway stripe = new StripeGateway();
        CheckoutService checkout = new CheckoutService(stripe);
        checkout.checkout(149.99);
        System.out.println("DIP VERIFIED: Decoupled gateway!");
    }
}
`,
    solutionHint: 'Inject PaymentGateway interface through constructor.'
  },
  {
    levelNumber: 3,
    title: 'Data Access Object (DAO)',
    topic: 'DAO & Persistence Abstraction',
    learningObjective: 'Implement UserDao with findById and save methods abstracting raw storage from service consumers.',
    scenario: 'Abstract database operations behind a DAO interface so data sources can be swapped seamlessly.',
    initialCode: `import java.util.HashMap;
import java.util.Map;

class UserRecord {
    public int id;
    public String email;
    public UserRecord(int id, String email) { this.id = id; this.email = email; }
}

interface UserDao {
    UserRecord findById(int id);
    void save(UserRecord user);
}

class InMemoryUserDao implements UserDao {
    private Map<Integer, UserRecord> store = new HashMap<>();
    public UserRecord findById(int id) { return store.get(id); }
    public void save(UserRecord user) {
        store.put(user.id, user);
        System.out.println("[DAO] Stored user #" + user.id);
    }
}

public class DaoPatternApp {
    public static void main(String[] args) {
        UserDao dao = new InMemoryUserDao();
        dao.save(new UserRecord(42, "dev@spring.io"));
        System.out.println("Fetched Email: " + dao.findById(42).email);
    }
}
`,
    solutionHint: 'Implement UserDao interface storing records in a HashMap.'
  },
  {
    levelNumber: 4,
    title: 'REST Controller & DTO Mapping',
    topic: 'Spring REST Endpoints & DTOs',
    learningObjective: 'Simulate a Spring Boot @RestController with GET /api/v1/orders and serialize OrderResponseDTO.',
    scenario: 'Expose RESTful endpoints transforming domain entities into API response DTOs.',
    initialCode: `class OrderResponseDTO {
    public String orderId;
    public double total;

    public OrderResponseDTO(String orderId, double total) {
        this.orderId = orderId;
        this.total = total;
    }
}

public class RestEndpointSimulation {
    public static OrderResponseDTO getOrder(String id) {
        System.out.println("HTTP GET /api/v1/orders/" + id + " [200 OK]");
        return new OrderResponseDTO(id, 249.50);
    }

    public static void main(String[] args) {
        OrderResponseDTO dto = getOrder("ORD-9821");
        System.out.println("ORDER RETRIEVED: " + dto.orderId);
    }
}
`,
    solutionHint: 'Return populated OrderResponseDTO from getOrder.'
  },
  {
    levelNumber: 5,
    title: 'Spring Service Validation Layer',
    topic: 'Service Layer & Business Rules',
    learningObjective: 'Implement business validation in OrderService before calling payment and persistence layers.',
    scenario: 'Prevent invalid or fraudulent orders by enforcing validation guards in the business service.',
    initialCode: `public class OrderValidationService {
    public static void placeOrder(String customerId, double amount) {
        if (customerId == null || customerId.trim().isEmpty()) {
            throw new IllegalArgumentException("customerId cannot be empty");
        }
        if (amount <= 0.0) {
            throw new IllegalArgumentException("amount must be positive");
        }
        System.out.printf("ORDER VALIDATED: Customer %s approved for $%.2f\\n", customerId, amount);
    }

    public static void main(String[] args) {
        placeOrder("CUST-104", 89.95);
        System.out.println("TRANSACTION COMMITTED: Order placed in queue.");
    }
}
`,
    solutionHint: 'Validate arguments and throw IllegalArgumentException on breach.'
  },
  {
    levelNumber: 6,
    title: 'JPA Entity & Repository Abstraction',
    topic: 'Spring Data JPA & ORM',
    learningObjective: 'Model an Account @Entity and simulate JpaRepository findByUsername with SQL generation.',
    scenario: 'Let Spring Data JPA handle object-relational mapping without writing boiler-plate JDBC statements.',
    initialCode: `class AccountEntity {
    public Long id;
    public String username;
    public AccountEntity(Long id, String username) { this.id = id; this.username = username; }
}

public class JpaRepositorySimulation {
    public static AccountEntity findByUsername(String username) {
        System.out.println("Hibernate: SELECT id, username FROM accounts WHERE username = ?");
        return new AccountEntity(1L, username);
    }

    public static void main(String[] args) {
        AccountEntity account = findByUsername("alex_lead");
        System.out.println("JPA Entity Loaded: " + account.username);
    }
}
`,
    solutionHint: 'Simulate generated SQL query and construct AccountEntity.'
  },
  {
    levelNumber: 7,
    title: 'JWT Token Security Filter',
    topic: 'JWT Claims & Security Filter Chains',
    learningObjective: 'Decode and validate a JWT bearer token header before granting resource access.',
    scenario: 'Secure cloud endpoints behind cryptographic token validation in the filter chain.',
    initialCode: `public class JwtSecurityFilter {
    public static boolean validateBearerToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }
        String token = authHeader.substring(7);
        if (token.contains("eyJhbGciOiJIUzI1Ni")) {
            System.out.println("JWT AUTH SUCCESS: Claims verified");
            return true;
        }
        return false;
    }

    public static void main(String[] args) {
        String validHeader = "Bearer eyJhbGciOiJIUzI1Ni.payload.sig";
        System.out.println("Access Granted: " + validateBearerToken(validHeader));
    }
}
`,
    solutionHint: 'Verify the Authorization header begins with Bearer and contains token bytes.'
  },
  {
    levelNumber: 8,
    title: 'Circuit Breaker Resiliency',
    topic: 'Resilience4j & Circuit Breakers',
    learningObjective: 'Implement Circuit Breaker states (CLOSED, OPEN) to isolate failing downstream microservices.',
    scenario: 'Protect upstream clusters from cascade failures when an external payment gateway times out.',
    initialCode: `enum CircuitState { CLOSED, OPEN }

public class CircuitBreakerEngine {
    private CircuitState state = CircuitState.CLOSED;
    private int consecutiveFailures = 0;

    public void recordCall(boolean success) {
        if (!success) {
            consecutiveFailures++;
            if (consecutiveFailures >= 3) {
                state = CircuitState.OPEN;
                System.out.println("CIRCUIT TRIPPED TO OPEN: Downstream isolated!");
            }
        } else {
            consecutiveFailures = 0;
            state = CircuitState.CLOSED;
        }
    }

    public static void main(String[] args) {
        CircuitBreakerEngine cb = new CircuitBreakerEngine();
        cb.recordCall(false);
        cb.recordCall(false);
        cb.recordCall(false);
    }
}
`,
    solutionHint: 'Trip state to OPEN after 3 consecutive failures.'
  },
  {
    levelNumber: 9,
    title: 'API Gateway Routing Matrix',
    topic: 'Microservices & API Gateway',
    learningObjective: 'Route client requests (/api/users, /api/orders) to upstream microservice clusters.',
    scenario: 'Configure reverse-proxy path routing at the cloud edge gateway.',
    initialCode: `public class ApiGatewayRouter {
    public static String route(String path) {
        if (path.startsWith("/api/users")) {
            return "ROUTE -> Upstream: User-Service-Cluster (Port 8081)";
        } else if (path.startsWith("/api/orders")) {
            return "ROUTE -> Upstream: Order-Service-Cluster (Port 8082)";
        }
        return "ROUTE -> 404";
    }

    public static void main(String[] args) {
        System.out.println(route("/api/users/profile"));
        System.out.println(route("/api/orders/checkout"));
    }
}
`,
    solutionHint: 'Map matching path prefixes to upstream microservice cluster ports.'
  },
  {
    levelNumber: 10,
    title: 'Cloud Enterprise Capstone',
    topic: 'Full Production Architecture',
    learningObjective: 'Deploy the complete Spring Boot Cloud ecosystem with Gateway, Security, and JPA persistence.',
    scenario: 'Certify the distributed cloud architecture for enterprise-grade production deployment.',
    initialCode: `public class CloudArchitectureMaster {
    public static void main(String[] args) {
        System.out.println("==============================================");
        System.out.println("   ENTERPRISE JAVA ARCHITECTURE SUITE v3.0    ");
        System.out.println("==============================================");
        System.out.println("[OK] SOLID Principles Enforced");
        System.out.println("[OK] Spring Boot 3 REST Controllers Online");
        System.out.println("[OK] Spring Data JPA & PostgreSQL Active");
        System.out.println("[OK] JWT Bearer Security Chain Engaged");
        System.out.println("[OK] Resilience4j Circuit Breakers Monitoring");
        System.out.println("[OK] Spring Cloud Gateway Routing Traffic");
        System.out.println("ARCHITECTURE STATUS: PRODUCTION-READY CLOUD PLATFORM DEPLOYED!");
    }
}
`,
    solutionHint: 'Deploy the complete production enterprise platform.'
  }
];
