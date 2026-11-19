from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.project import Project, ProjectMilestone
from models.user import User
from services.gamification_service import award_xp, unlock_achievement

PROJECTS_SEED = [
    {
        "title": "Student Management System",
        "slug": "student-management-system",
        "level": "beginner",
        "objective": "Design an in-memory console application to register, query, and manage student academic records.",
        "requirements": [
            "Create a Student domain class with encapsulated fields (id, name, email, gpa)",
            "Validate email format and GPA bounds (0.0 to 4.0)",
            "Maintain an ArrayList of students with CRUD operations",
            "Handle NoSuchStudentException when searching non-existent IDs"
        ],
        "concepts_covered": ["OOP Encapsulation", "ArrayList Collections", "Custom Exceptions", "Validation"],
        "starter_code": "// Student Management System Starter\npublic class Student {\n    private String id;\n    private String name;\n    private double gpa;\n    // Implement constructor and methods\n}\n",
        "order_index": 1,
        "milestones": [
            "Milestone 1: Create Student class with validated getters/setters",
            "Milestone 2: Build StudentRepository using ArrayList",
            "Milestone 3: Implement search, update, and exception handling",
            "Milestone 4: Write interactive menu and verify edge cases"
        ]
    },
    {
        "title": "Bank Account Management System",
        "slug": "bank-account-management",
        "level": "beginner",
        "objective": "Build a multi-account banking system supporting SavingsAccount and CheckingAccount with interest and overdraft rules.",
        "requirements": [
            "Abstract base class Account with account number, balance, and transaction history",
            "SavingsAccount subclass with minimum balance and interest compounding",
            "CheckingAccount subclass with overdraft fee rules",
            "Polymorphic transaction execution engine"
        ],
        "concepts_covered": ["Abstract Classes", "Inheritance", "Polymorphism", "Encapsulation"],
        "starter_code": "public abstract class Account {\n    protected String accountNumber;\n    protected double balance;\n    public abstract boolean withdraw(double amount);\n}\n",
        "order_index": 2,
        "milestones": [
            "Milestone 1: Design Account hierarchy with super calls",
            "Milestone 2: Implement withdraw validation and overdraft",
            "Milestone 3: Add transaction audit logging",
            "Milestone 4: Test edge cases (overdraft limit, negative deposits)"
        ]
    },
    {
        "title": "JDBC CRUD Database Application",
        "slug": "jdbc-crud-application",
        "level": "intermediate",
        "objective": "Connect Java to a relational database using JDBC, PreparedStatements, and transactions.",
        "requirements": [
            "Initialize connection via DriverManager or HikariCP pool",
            "Perform parameterized CRUD queries to prevent SQL injection",
            "Execute multi-table funds transfer inside an ACID transaction with rollback",
            "Implement try-with-resources for Connection and PreparedStatement cleanup"
        ],
        "concepts_covered": ["JDBC", "PreparedStatements", "ACID Transactions", "Resource Management"],
        "starter_code": "public class DatabaseManager {\n    private static final String URL = \"jdbc:postgresql://localhost:5432/appdb\";\n    // Implement connection and DAO methods\n}\n",
        "order_index": 3,
        "milestones": [
            "Milestone 1: Establish database connection with try-with-resources",
            "Milestone 2: Implement UserDAO with PreparedStatements",
            "Milestone 3: Implement atomic transaction rollback on failure",
            "Milestone 4: Write test cases verifying resilience"
        ]
    },
    {
        "title": "Spring Boot RESTful Course API",
        "slug": "spring-boot-rest-api",
        "level": "intermediate",
        "objective": "Create an enterprise REST API using Spring Boot, Spring Data JPA, and Jakarta validation.",
        "requirements": [
            "Configure @RestController with GET, POST, PUT, DELETE mappings",
            "Apply Jakarta Bean Validation annotations (@NotBlank, @Min) to DTOs",
            "Create Spring Data JPA CourseRepository interface",
            "Implement global exception handler using @ControllerAdvice"
        ],
        "concepts_covered": ["Spring MVC", "Spring Data JPA", "DTO Validation", "Global Exception Handling"],
        "starter_code": "@RestController\n@RequestMapping(\"/api/courses\")\npublic class CourseController {\n    // Implement REST endpoints\n}\n",
        "order_index": 4,
        "milestones": [
            "Milestone 1: Setup Course entity and CourseRepository",
            "Milestone 2: Create CourseRequestDTO with @Valid annotations",
            "Milestone 3: Implement Service layer with business invariants",
            "Milestone 4: Configure GlobalExceptionHandler for 400 & 404 responses"
        ]
    }
]

def seed_projects(db: Session):
    for p_data in PROJECTS_SEED:
        existing = db.query(Project).filter(Project.slug == p_data["slug"]).first()
        if not existing:
            project = Project(
                title=p_data["title"],
                slug=p_data["slug"],
                level=p_data["level"],
                objective=p_data["objective"],
                requirements=p_data["requirements"],
                concepts_covered=p_data["concepts_covered"],
                starter_code=p_data["starter_code"],
                order_index=p_data["order_index"]
            )
            db.add(project)
    db.commit()

def get_projects_for_user(db: Session, user: User) -> List[dict]:
    projects = db.query(Project).order_by(Project.order_index).all()
    user_milestones = db.query(ProjectMilestone).filter(ProjectMilestone.user_id == user.id).all()
    user_ms_map = {(m.project_id, m.milestone_index): m for m in user_milestones}

    result = []
    for p in projects:
        # Each project has 4 default milestones
        ms_list = []
        completed_count = 0
        
        # Find matching seed milestones
        seed_item = next((s for s in PROJECTS_SEED if s["slug"] == p.slug), None)
        ms_titles = seed_item["milestones"] if seed_item else [f"Milestone {i}" for i in range(1, 5)]

        for idx, title in enumerate(ms_titles, start=1):
            user_record = user_ms_map.get((p.id, idx))
            is_comp = user_record.is_completed if user_record else False
            if is_comp:
                completed_count += 1
            ms_list.append({
                "id": user_record.id if user_record else idx,
                "milestone_index": idx,
                "milestone_title": title,
                "is_completed": is_comp,
                "learner_code": user_record.learner_code if user_record else None,
                "learner_reflection": user_record.learner_reflection if user_record else None,
                "completed_at": user_record.completed_at if user_record else None
            })

        total = len(ms_titles)
        result.append({
            "id": p.id,
            "title": p.title,
            "slug": p.slug,
            "level": p.level,
            "objective": p.objective,
            "requirements": p.requirements,
            "concepts_covered": p.concepts_covered,
            "starter_code": p.starter_code,
            "order_index": p.order_index,
            "user_completed_milestones": completed_count,
            "total_milestones": total,
            "is_completed": (completed_count == total and total > 0),
            "milestones": ms_list
        })
    return result

def update_project_milestone(
    db: Session,
    user: User,
    project_id: int,
    milestone_index: int,
    learner_code: Optional[str] = None,
    learner_reflection: Optional[str] = None
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise ValueError("Project not found")

    milestone = db.query(ProjectMilestone).filter(
        ProjectMilestone.project_id == project_id,
        ProjectMilestone.user_id == user.id,
        ProjectMilestone.milestone_index == milestone_index
    ).first()

    if not milestone:
        seed_item = next((s for s in PROJECTS_SEED if s["slug"] == project.slug), None)
        ms_titles = seed_item["milestones"] if seed_item else []
        title = ms_titles[milestone_index - 1] if len(ms_titles) >= milestone_index else f"Milestone {milestone_index}"

        milestone = ProjectMilestone(
            project_id=project_id,
            user_id=user.id,
            milestone_index=milestone_index,
            milestone_title=title,
            is_completed=True,
            learner_code=learner_code,
            learner_reflection=learner_reflection,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(milestone)
    else:
        milestone.is_completed = True
        milestone.learner_code = learner_code
        milestone.learner_reflection = learner_reflection
        milestone.completed_at = datetime.now(timezone.utc)

    db.commit()

    # Award milestone XP
    xp_to_award = 35
    awarded = award_xp(
        db=db,
        user=user,
        amount=xp_to_award,
        reason=f"Completed {project.title} - Milestone {milestone_index}",
        reference_type="project_milestone",
        reference_id=f"proj_{project_id}_ms_{milestone_index}"
    )

    unlock_achievement(db, user.id, "project_builder")
    return {"status": "success", "xp_awarded": xp_to_award if awarded else 0}
