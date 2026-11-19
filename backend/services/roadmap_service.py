from sqlalchemy.orm import Session
from models.learning import LearningModule, Topic, Lesson, LessonProgress
from models.user import User

ROADMAP_INITIAL_STRUCTURE = [
    {
        "code": "MOD-01",
        "title": "OOP Foundations",
        "description": "Master the core building blocks of Object-Oriented Programming in Java.",
        "order_index": 1,
        "topics": [
            {
                "title": "Classes and Objects",
                "slug": "classes-and-objects",
                "description": "Blueprints versus real-world heap instances.",
                "lessons": [
                    {"title": "Understanding Class as a Blueprint", "content": "# Classes in Java\nA class is a template defining state and behavior.\n\n```java\npublic class Student {\n    String name;\n    int age;\n}\n```"},
                    {"title": "Object Instantiation & Heap Allocation", "content": "# Objects\nWhen you call `new Student()`, memory is allocated on the JVM Heap.\n\n```java\nStudent s = new Student();\n```"}
                ]
            },
            {
                "title": "Constructors & the 'this' Keyword",
                "slug": "constructors-and-this",
                "description": "Initialising instance state properly and constructor chaining.",
                "lessons": [
                    {"title": "Default vs Parameterized Constructors", "content": "# Constructors\nConstructors guarantee fields are properly initialized upon creation.\n\n```java\npublic Student(String name) {\n    this.name = name;\n}\n```"},
                    {"title": "Constructor Chaining with this()", "content": "# Constructor Chaining\nUse `this(...)` as the first statement to reuse constructor logic without duplication."}
                ]
            },
            {
                "title": "Instance vs Static Members",
                "slug": "instance-vs-static",
                "description": "Per-object state versus class-level shared memory.",
                "lessons": [
                    {"title": "Static Variables and Methods", "content": "# Static Members\nStatic members belong to the class, not individual instances."}
                ]
            }
        ]
    },
    {
        "code": "MOD-02",
        "title": "Encapsulation",
        "description": "Data hiding, access protection, and building rock-solid immutable classes.",
        "order_index": 2,
        "topics": [
            {
                "title": "Access Modifiers & Getters/Setters",
                "slug": "access-modifiers-getters-setters",
                "description": "private, default, protected, public and boundary defense.",
                "lessons": [
                    {"title": "The Four Access Modifiers", "content": "# Access Modifiers\nControl visibility across classes, packages, and inheritance trees."},
                    {"title": "Guarded Getters & Setters", "content": "# Guarded Access\nEnforce domain invariants and validation rules inside setters."}
                ]
            },
            {
                "title": "Data Validation & Immutability",
                "slug": "data-validation-immutability",
                "description": "Protecting internal state with defensive copies and final classes.",
                "lessons": [
                    {"title": "Creating Immutable Value Objects", "content": "# Immutability in Java\nMark fields final, class final, and defensively copy mutable objects."}
                ]
            }
        ]
    },
    {
        "code": "MOD-03",
        "title": "Inheritance",
        "description": "Code reuse, specialized hierarchies, and super constructor dispatch.",
        "order_index": 3,
        "topics": [
            {
                "title": "extends, super & Constructor Chaining",
                "slug": "extends-super-chaining",
                "description": "Building hierarchy trees safely with super class initialisation.",
                "lessons": [
                    {"title": "The extends Keyword", "content": "# Inheritance\nDerive specialized behavior while retaining common parent functionality."},
                    {"title": "The super Keyword in Constructors", "content": "# Super\nCalling `super(...)` passes data up to the parent constructor."}
                ]
            },
            {
                "title": "Method Overriding & @Override",
                "slug": "method-overriding",
                "description": "Replacing parent implementation with specialized child logic.",
                "lessons": [
                    {"title": "Rules of Overriding", "content": "# Overriding\nSame method signature, same or covariant return type, no stricter access."}
                ]
            }
        ]
    },
    {
        "code": "MOD-04",
        "title": "Polymorphism",
        "description": "Dynamic dispatch, runtime binding, and compile-time overloading.",
        "order_index": 4,
        "topics": [
            {
                "title": "Method Overloading vs Overriding",
                "slug": "overloading-vs-overriding",
                "description": "Compile-time static binding vs runtime dynamic dispatch.",
                "lessons": [
                    {"title": "Comparing Overloading and Overriding", "content": "# Polymorphism Types\nUnderstand compile-time signature resolution vs runtime heap dispatch."}
                ]
            },
            {
                "title": "Dynamic Method Dispatch",
                "slug": "dynamic-method-dispatch",
                "description": "Upcasting references and polymorphic method execution.",
                "lessons": [
                    {"title": "Dynamic Method Dispatch", "content": "# Dynamic Dispatch\nReference type determines what can be called; Object type determines which version runs."}
                ]
            }
        ]
    },
    {
        "code": "MOD-05",
        "title": "Abstraction and Interfaces",
        "description": "Decoupled architecture, contracts, and abstract design principles.",
        "order_index": 5,
        "topics": [
            {
                "title": "Abstract Classes vs Interfaces",
                "slug": "abstract-classes-vs-interfaces",
                "description": "Template methods vs pure contractual specifications.",
                "lessons": [
                    {"title": "When to Use Abstract Class vs Interface", "content": "# Abstraction\nChoose interfaces for capabilities; choose abstract classes for shared code & state."}
                ]
            },
            {
                "title": "Interface Implementation & Default Methods",
                "slug": "interface-implementation",
                "description": "Multiple interface implementation and default methods.",
                "lessons": [
                    {"title": "Contractual Implementation", "content": "# Interfaces\nDecouple caller from concrete implementation."}
                ]
            }
        ]
    },
    {
        "code": "MOD-06",
        "title": "Core Java",
        "description": "Strings, String Pool, Arrays, Collections Framework, and Generics.",
        "order_index": 6,
        "topics": [
            {
                "title": "Strings & String Pool",
                "slug": "strings-and-pool",
                "description": "String immutability, StringBuilder, and String Constant Pool.",
                "lessons": [
                    {"title": "String Memory Management", "content": "# String Constant Pool\n`==` vs `.equals()` and heap optimization."}
                ]
            },
            {
                "title": "Collections & Generics",
                "slug": "collections-and-generics",
                "description": "List, Set, Map, and type-safe Generic containers.",
                "lessons": [
                    {"title": "Java Collections Overview", "content": "# Collections\nChoosing between ArrayList, HashSet, and HashMap."}
                ]
            }
        ]
    },
    {
        "code": "MOD-07",
        "title": "Java Essentials",
        "description": "Exception handling, Try-with-resources, File I/O, and Streams.",
        "order_index": 7,
        "topics": [
            {
                "title": "Exception Handling & Custom Exceptions",
                "slug": "exception-handling",
                "description": "Checked vs unchecked exceptions and robust error boundaries.",
                "lessons": [
                    {"title": "Try, Catch, Finally & Custom Exceptions", "content": "# Exceptions\nHandling failure gracefully in production code."}
                ]
            },
            {
                "title": "Streams & Lambdas",
                "slug": "streams-and-lambdas",
                "description": "Functional declarative processing of collections.",
                "lessons": [
                    {"title": "Stream Pipelines", "content": "# Streams\nFilter, map, reduce, and collect operations."}
                ]
            }
        ]
    },
    {
        "code": "MOD-08",
        "title": "Data Structures & Algorithms",
        "description": "Searching, sorting, hashing, recursion, and core data structures.",
        "order_index": 8,
        "topics": [
            {
                "title": "Searching and Sorting",
                "slug": "searching-and-sorting",
                "description": "Binary search, quicksort, mergesort, and complexity.",
                "lessons": [
                    {"title": "Binary Search & Big-O Analysis", "content": "# Search Algorithms\nLogarithmic search and edge cases."}
                ]
            },
            {
                "title": "Hashing & Linear Structures",
                "slug": "hashing-and-linear",
                "description": "Stack, Queue, Deque, and Hash collisions.",
                "lessons": [
                    {"title": "Using Deque & Hash Tables", "content": "# Hashing\nO(1) lookups and balance."}
                ]
            }
        ]
    },
    {
        "code": "MOD-09",
        "title": "JDBC and SQL",
        "description": "Database connectivity, CRUD operations, PreparedStatements, and transactions.",
        "order_index": 9,
        "topics": [
            {
                "title": "Database Connections & PreparedStatements",
                "slug": "jdbc-prepared-statements",
                "description": "Preventing SQL injection and managing Connection pools.",
                "lessons": [
                    {"title": "Secure JDBC Execution", "content": "# PreparedStatement\nParameterized queries and connection lifecycle."}
                ]
            },
            {
                "title": "Transactions and ACID Properties",
                "slug": "jdbc-transactions",
                "description": "Manual commit control, rollback, and data integrity.",
                "lessons": [
                    {"title": "Atomic Transactions in JDBC", "content": "# ACID Transactions\n`setAutoCommit(false)` and `rollback()`."}
                ]
            }
        ]
    },
    {
        "code": "MOD-10",
        "title": "Spring Boot",
        "description": "Inversion of Control, Dependency Injection, REST APIs, and Spring Data JPA.",
        "order_index": 10,
        "topics": [
            {
                "title": "Dependency Injection & IoC Container",
                "slug": "spring-di-ioc",
                "description": "Constructor injection, Spring beans, and inversion of control.",
                "lessons": [
                    {"title": "Understanding Dependency Injection", "content": "# Spring DI\nLoose coupling with Constructor Injection."}
                ]
            },
            {
                "title": "REST Controllers & Spring Data JPA",
                "slug": "spring-rest-jpa",
                "description": "Building RESTful web endpoints and automatic JPA repositories.",
                "lessons": [
                    {"title": "Spring MVC Endpoints", "content": "# REST Controllers\n`@RestController`, `@GetMapping`, `@PostMapping`."}
                ]
            }
        ]
    },
    {
        "code": "MOD-11",
        "title": "Backend Engineering",
        "description": "Spring Security, JWT tokens, validation, testing, and clean architecture.",
        "order_index": 11,
        "topics": [
            {
                "title": "Spring Security & JWT Authentication",
                "slug": "security-jwt",
                "description": "Protecting APIs with stateless tokens and filter chains.",
                "lessons": [
                    {"title": "JWT Filter Architecture", "content": "# JWT Authentication\nExtracting, validating tokens, and populating SecurityContext."}
                ]
            },
            {
                "title": "Validation & Testing",
                "slug": "validation-and-testing",
                "description": "Jakarta validation DTOs, unit tests, and Mockito.",
                "lessons": [
                    {"title": "DTO Validation with @Valid", "content": "# Validation\nFail fast on bad input."}
                ]
            }
        ]
    },
    {
        "code": "MOD-12",
        "title": "Capstone Projects",
        "description": "Designing and building complete, enterprise-ready Java backend systems.",
        "order_index": 12,
        "topics": [
            {
                "title": "Enterprise Layered Architecture",
                "slug": "capstone-architecture",
                "description": "Controller, Service, Repository, DTO separation and domain modeling.",
                "lessons": [
                    {"title": "Clean Java Architecture", "content": "# Production Architecture\nSeparation of concerns and testability."}
                ]
            }
        ]
    }
]

def seed_roadmap(db: Session):
    for mod_data in ROADMAP_INITIAL_STRUCTURE:
        module = db.query(LearningModule).filter(LearningModule.code == mod_data["code"]).first()
        if not module:
            module = LearningModule(
                code=mod_data["code"],
                title=mod_data["title"],
                description=mod_data["description"],
                order_index=mod_data["order_index"]
            )
            db.add(module)
            db.flush()

        for t_idx, topic_data in enumerate(mod_data["topics"], start=1):
            topic = db.query(Topic).filter(Topic.slug == topic_data["slug"]).first()
            if not topic:
                topic = Topic(
                    module_id=module.id,
                    title=topic_data["title"],
                    slug=topic_data["slug"],
                    description=topic_data.get("description", ""),
                    order_index=t_idx
                )
                db.add(topic)
                db.flush()

            for l_idx, lesson_data in enumerate(topic_data.get("lessons", []), start=1):
                lesson = db.query(Lesson).filter(Lesson.topic_id == topic.id, Lesson.title == lesson_data["title"]).first()
                if not lesson:
                    lesson = Lesson(
                        topic_id=topic.id,
                        title=lesson_data["title"],
                        content_markdown=lesson_data["content"],
                        order_index=l_idx,
                        estimated_minutes=15
                    )
                    db.add(lesson)

    db.commit()

def get_roadmap_for_user(db: Session, user: User):
    modules = db.query(LearningModule).order_by(LearningModule.order_index).all()
    user_progress_map = {
        lp.lesson_id: lp.status
        for lp in db.query(LessonProgress).filter(LessonProgress.user_id == user.id).all()
    }

    result = []
    for mod in modules:
        mod_topics = []
        for top in mod.topics:
            topic_lessons = []
            completed_in_topic = 0
            for les in top.lessons:
                status = user_progress_map.get(les.id, "not_started")
                if status == "mastered" or status == "completed":
                    completed_in_topic += 1
                topic_lessons.append({
                    "id": les.id,
                    "topic_id": les.topic_id,
                    "title": les.title,
                    "content_markdown": les.content_markdown,
                    "order_index": les.order_index,
                    "estimated_minutes": les.estimated_minutes,
                    "user_status": status
                })

            total_lessons = len(top.lessons)
            topic_status = "not_started"
            if total_lessons > 0:
                if completed_in_topic == total_lessons:
                    topic_status = "mastered"
                elif completed_in_topic > 0:
                    topic_status = "practising"

            mod_topics.append({
                "id": top.id,
                "module_id": top.module_id,
                "title": top.title,
                "slug": top.slug,
                "description": top.description,
                "order_index": top.order_index,
                "lessons_count": total_lessons,
                "completed_count": completed_in_topic,
                "status": topic_status,
                "lessons": topic_lessons
            })

        result.append({
            "id": mod.id,
            "code": mod.code,
            "title": mod.title,
            "description": mod.description,
            "order_index": mod.order_index,
            "topics": mod_topics
        })
    return result
