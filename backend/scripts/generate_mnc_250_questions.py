import json
import os
import sys
import html
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    HRFlowable,
    KeepTogether
)

# 10 Domains x 25 Questions = 250 Questions
DOMAINS = [
    {
        "domain": "Java Fundamentals & Language Basics",
        "companies": ["TCS", "Infosys", "Wipro", "Cognizant", "Accenture", "HCL"],
        "source": "GeeksforGeeks & HackerRank",
        "questions": [
            ("Explain the difference between JDK, JRE, and JVM with their architecture.", "Easy", 1, "public class JVMCheck { public static void main(String[] args) { System.out.println(System.getProperty(\"java.version\")); } }"),
            ("Why is Java platform independent, but the JVM is platform dependent?", "Easy", 1, "// Bytecode (.class) is portable; JVM translates bytecode to OS-specific machine instructions."),
            ("Why is the main method in Java declared as public static void main(String[] args)?", "Easy", 1, "// public: accessible by JVM; static: called without instantiation; void: returns no exit code."),
            ("What is the difference between primitive data types and wrapper classes?", "Easy", 1, "int primitiveVal = 42; Integer wrapperVal = Integer.valueOf(42);"),
            ("Explain autoboxing and unboxing with potential NullPointerException risks.", "Easy", 2, "Integer count = null; int unboxed = count; // Throws NullPointerException!"),
            ("What is the difference between == operator and equals() method?", "Easy", 2, "String s1 = new String(\"java\"); String s2 = new String(\"java\"); boolean refEq = (s1 == s2); boolean valEq = s1.equals(s2);"),
            ("What is String constant pool (SCP) and where is it located in memory?", "Easy", 2, "String a = \"hello\"; // stored in Heap String Pool"),
            ("Why are Strings immutable in Java? Explain security, caching, and thread safety benefits.", "Medium", 3, "// Security in classloaders, thread safety without locks, String Pool caching hashcode."),
            ("Difference between String, StringBuilder, and StringBuffer with thread-safety benchmarks.", "Medium", 3, "StringBuilder sb = new StringBuilder(); sb.append(\"fast\").append(\"sync-free\");"),
            ("Explain the concept and internal behavior of Type Casting (Widening vs Narrowing).", "Easy", 1, "double d = 100.04; long l = (long) d; int i = (int) l;"),
            ("What are literal constants in Java and how does integer caching (-128 to 127) work?", "Medium", 3, "Integer a = 127; Integer b = 127; assert a == b; // True due to IntegerCache"),
            ("How does ternary operator work and what are type promotion rules in ternary expressions?", "Easy", 1, "int max = (a > b) ? a : b;"),
            ("Can you override a private or static method in Java? Why or why not?", "Medium", 3, "// No: private methods are not visible; static methods are resolved at compile-time (method hiding)."),
            ("What is the difference between pass-by-value and pass-by-reference? How does Java pass objects?", "Medium", 4, "// Java is strictly Pass-by-Value. Object references are passed by value of the pointer."),
            ("What are variable arguments (varargs) and what restrictions apply to their placement?", "Easy", 2, "public void log(String tag, Object... messages) { /* varargs must be the last parameter */ }"),
            ("What is the difference between final, finally, and finalize in Java?", "Easy", 2, "// final: modifier; finally: cleanup block in try/catch; finalize: deprecated GC callback."),
            ("What happens if you declare a constructor as private?", "Medium", 3, "// Prevents external instantiation (used in Singleton Pattern and Utility Classes)."),
            ("Can an interface have concrete methods in modern Java? Explain default and static methods.", "Medium", 4, "interface Printable { default void print() { System.out.println(\"Default print\"); } }"),
            ("Explain the difference between shallow copy and deep copy with Cloneable.", "Medium", 5, "class Node implements Cloneable { public Node clone() throws CloneNotSupportedException { return (Node) super.clone(); } }"),
            ("How does the assert keyword work and why is it disabled by default in production?", "Easy", 2, "assert balance >= 0 : \"Negative balance!\"; // Run with -ea flag"),
            ("Explain the precedence and short-circuit evaluation of logical operators && and ||.", "Easy", 1, "if (obj != null && obj.isValid()) { /* avoids NPE */ }"),
            ("What are strictfp and transient keywords in Java?", "Medium", 4, "transient String sessionToken; // Excluded from serialization"),
            ("Explain the diamond problem in multiple inheritance and how Java interfaces handle it.", "Medium", 5, "// Resolved via interface name: SuperInterface.super.method();"),
            ("What is the difference between checked and unchecked exceptions?", "Easy", 2, "// Checked inherit Exception (must handle/declare); Unchecked inherit RuntimeException."),
            ("Write a program to demonstrate method overloading vs method overriding with covariant returns.", "Hard", 6, "class Parent { Parent get() { return this; } } class Child extends Parent { @Override Child get() { return this; } }")
        ]
    },
    {
        "domain": "Arrays, Strings & Two-Pointers (Algorithms)",
        "companies": ["Amazon", "Microsoft", "Google", "Meta", "Bloomberg"],
        "source": "LeetCode & HackerRank",
        "questions": [
            ("Two Sum: Find indices of two numbers that add up to target.", "Easy", 2, "Map<Integer, Integer> map = new HashMap<>(); for (int i=0; i<nums.length; i++) { int diff = target - nums[i]; if (map.containsKey(diff)) return new int[]{map.get(diff), i}; map.put(nums[i], i); }"),
            ("Valid Palindrome: Verify alphanumeric string ignores casing and non-alphanumerics.", "Easy", 2, "int l = 0, r = s.length()-1; while(l < r) { while(l<r && !Character.isLetterOrDigit(s.charAt(l))) l++; while(l<r && !Character.isLetterOrDigit(s.charAt(r))) r--; if (Character.toLowerCase(s.charAt(l++)) != Character.toLowerCase(s.charAt(r--))) return false; } return true;"),
            ("Best Time to Buy and Sell Stock (One Transaction).", "Easy", 3, "int minPrice = Integer.MAX_VALUE, maxProfit = 0; for(int p : prices) { minPrice = Math.min(minPrice, p); maxProfit = Math.max(maxProfit, p - minPrice); } return maxProfit;"),
            ("Contains Duplicate: Check if any element appears at least twice.", "Easy", 1, "Set<Integer> set = new HashSet<>(); for(int n : nums) { if(!set.add(n)) return true; } return false;"),
            ("Product of Array Except Self without division in O(n) time.", "Medium", 5, "int[] res = new int[nums.length]; res[0] = 1; for(int i=1; i<nums.length; i++) res[i] = res[i-1] * nums[i-1]; int right = 1; for(int i=nums.length-1; i>=0; i--) { res[i] *= right; right *= nums[i]; } return res;"),
            ("Maximum Subarray (Kadane's Algorithm).", "Medium", 4, "int maxSoFar = nums[0], currMax = nums[0]; for(int i=1; i<nums.length; i++) { currMax = Math.max(nums[i], currMax + nums[i]); maxSoFar = Math.max(maxSoFar, currMax); } return maxSoFar;"),
            ("3Sum: Find all unique triplets that sum to zero.", "Medium", 6, "Arrays.sort(nums); for (int i=0; i<nums.length-2; i++) { if(i>0 && nums[i]==nums[i-1]) continue; int l=i+1, r=nums.length-1; while(l<r) { int sum=nums[i]+nums[l]+nums[r]; if(sum==0) { list.add(Arrays.asList(nums[i], nums[l++], nums[r--])); while(l<r && nums[l]==nums[l-1]) l++; } else if(sum<0) l++; else r--; } }"),
            ("Container With Most Water: Compute max area between vertical lines.", "Medium", 5, "int l=0, r=height.length-1, max=0; while(l<r) { max = Math.max(max, Math.min(height[l], height[r]) * (r - l)); if(height[l] < height[r]) l++; else r--; } return max;"),
            ("Rotate Array: Rotate array to right by k steps in-place.", "Medium", 4, "k %= nums.length; reverse(nums, 0, nums.length-1); reverse(nums, 0, k-1); reverse(nums, k, nums.length-1);"),
            ("Move Zeroes to end maintaining relative order of non-zeroes.", "Easy", 2, "int insert = 0; for(int n : nums) { if(n != 0) nums[insert++] = n; } while(insert < nums.length) nums[insert++] = 0;"),
            ("Longest Substring Without Repeating Characters (Sliding Window).", "Medium", 6, "Map<Character, Integer> map = new HashMap<>(); int maxLen=0, start=0; for(int i=0; i<s.length(); i++) { char c = s.charAt(i); if(map.containsKey(c)) start = Math.max(start, map.get(c) + 1); map.put(c, i); maxLen = Math.max(maxLen, i - start + 1); } return maxLen;"),
            ("Longest Repeating Character Replacement with k flips.", "Medium", 6, "int[] count = new int[26]; int maxCount = 0, maxLen = 0, l = 0; for (int r = 0; r < s.length(); r++) { maxCount = Math.max(maxCount, ++count[s.charAt(r) - 'A']); while (r - l + 1 - maxCount > k) count[s.charAt(l++) - 'A']--; maxLen = Math.max(maxLen, r - l + 1); } return maxLen;"),
            ("Valid Anagram: Check if two strings contain same frequencies.", "Easy", 2, "int[] freq = new int[26]; for(char c : s.toCharArray()) freq[c-'a']++; for(char c : t.toCharArray()) if(--freq[c-'a'] < 0) return false; return true;"),
            ("Group Anagrams: Group strings that share character counts.", "Medium", 5, "Map<String, List<String>> map = new HashMap<>(); for(String w : strs) { char[] ca = w.toCharArray(); Arrays.sort(ca); String k = String.valueOf(ca); map.computeIfAbsent(k, x -> new ArrayList<>()).add(w); } return new ArrayList<>(map.values());"),
            ("Valid Parentheses: Balance check using Deque stack.", "Easy", 3, "Deque<Character> st = new ArrayDeque<>(); for(char c : s.toCharArray()) { if(c=='(') st.push(')'); else if(c=='{') st.push('}'); else if(c=='[') st.push(']'); else if(st.isEmpty() || st.pop()!=c) return false; } return st.isEmpty();"),
            ("Longest Palindromic Substring: Expand around centers.", "Medium", 6, "int start=0, end=0; for(int i=0; i<s.length(); i++) { int len1 = expand(s, i, i), len2 = expand(s, i, i+1); int len = Math.max(len1, len2); if(len > end - start) { start = i - (len-1)/2; end = i + len/2; } } return s.substring(start, end+1);"),
            ("Reverse Words in a String maintaining single spacing.", "Medium", 4, "String[] parts = s.trim().split(\"\\\\s+\"); Collections.reverse(Arrays.asList(parts)); return String.join(\" \", parts);"),
            ("Trapping Rain Water: Two-pointer elevation boundary technique.", "Hard", 8, "int l=0, r=height.length-1, leftMax=0, rightMax=0, total=0; while(l<r) { if(height[l]<height[r]) { if(height[l]>=leftMax) leftMax=height[l]; else total+=leftMax-height[l]; l++; } else { if(height[r]>=rightMax) rightMax=height[r]; else total+=rightMax-height[r]; r--; } } return total;"),
            ("Merge Intervals: Merge overlapping interval ranges.", "Medium", 5, "Arrays.sort(intervals, (a,b) -> Integer.compare(a[0], b[0])); List<int[]> res = new ArrayList<>(); int[] curr = intervals[0]; res.add(curr); for(int[] i : intervals) { if(i[0] <= curr[1]) curr[1] = Math.max(curr[1], i[1]); else { curr = i; res.add(curr); } } return res.toArray(new int[res.size()][]);"),
            ("Insert Interval: Insert new interval and merge if needed.", "Medium", 6, "List<int[]> res = new ArrayList<>(); int i=0, n=intervals.length; while(i<n && intervals[i][1] < newInterval[0]) res.add(intervals[i++]); while(i<n && intervals[i][0] <= newInterval[1]) { newInterval[0]=Math.min(newInterval[0], intervals[i][0]); newInterval[1]=Math.max(newInterval[1], intervals[i++][1]); } res.add(newInterval); while(i<n) res.add(intervals[i++]); return res.toArray(new int[res.size()][]);"),
            ("Non-overlapping Intervals: Minimum intervals to remove.", "Medium", 6, "Arrays.sort(intervals, (a, b) -> Integer.compare(a[1], b[1])); int count=0, end=intervals[0][1]; for(int i=1; i<intervals.length; i++) { if(intervals[i][0] < end) count++; else end=intervals[i][1]; } return count;"),
            ("Spiral Matrix: Print matrix in clock-wise spiral layer traversal.", "Medium", 5, "int top=0, bottom=matrix.length-1, left=0, right=matrix[0].length-1; while(top<=bottom && left<=right) { for(int c=left; c<=right; c++) res.add(matrix[top][c]); top++; for(int r=top; r<=bottom; r++) res.add(matrix[r][right]); right--; if(top<=bottom) for(int c=right; c>=left; c--) res.add(matrix[bottom][c]); bottom--; if(left<=right) for(int r=bottom; r>=top; r--) res.add(matrix[r][left]); left++; }"),
            ("Set Matrix Zeroes in-place using O(1) extra space.", "Medium", 6, "boolean firstRow=false, firstCol=false; for(int r=0; r<R; r++) if(matrix[r][0]==0) firstCol=true; for(int c=0; c<C; c++) if(matrix[0][c]==0) firstRow=true; // use row 0 and col 0 as markers"),
            ("Minimum Window Substring: Finding minimum window containing all target characters.", "Hard", 9, "int[] map = new int[128]; for(char c : t.toCharArray()) map[c]++; int l=0, r=0, count=t.length(), minLen=Integer.MAX_VALUE, start=0; while(r < s.length()) { if(map[s.charAt(r++)]-- > 0) count--; while(count == 0) { if(r - l < minLen) { minLen = r - l; start = l; } if(map[s.charAt(l++)]++ == 0) count++; } } return minLen == Integer.MAX_VALUE ? \"\" : s.substring(start, start + minLen);"),
            ("Median of Two Sorted Arrays in O(log(min(m, n))) time.", "Hard", 10, "Binary search partition on smaller array ensuring maxLeftX <= minRightY and maxLeftY <= minRightX.")
        ]
    },
    {
        "domain": "Object-Oriented Programming (OOP) & Architecture",
        "companies": ["Microsoft", "Morgan Stanley", "Goldman Sachs", "Oracle", "SAP"],
        "source": "MNC Technical Rounds & System Design",
        "questions": [
            ("Explain the 4 Pillars of OOP: Encapsulation, Abstraction, Inheritance, and Polymorphism.", "Easy", 1, "// Encapsulation: data hiding; Abstraction: hiding implementation; Inheritance: code reuse; Polymorphism: multiple behaviors."),
            ("What is Polymorphism? Differentiate Compile-time (Static) vs Runtime (Dynamic) Polymorphism.", "Easy", 2, "class Calc { int add(int a, int b) { return a+b; } double add(double a, double b) { return a+b; } }"),
            ("Can you instantiate an abstract class? What purpose do abstract classes serve?", "Easy", 2, "abstract class Shape { abstract double area(); } // Cannot do new Shape(), acts as contractual blueprint."),
            ("Difference between Abstract Class and Interface in modern Java (Java 8/11/17).", "Medium", 4, "// Abstract classes hold state/constructors; Interfaces define capabilities and multiple inheritances."),
            ("Explain SOLID Principles with a real-world banking software example.", "Medium", 5, "// Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion."),
            ("What is Liskov Substitution Principle (LSP)? Give an example of violating LSP.", "Medium", 5, "// Square extending Rectangle violates LSP if setting width unexpectedly mutates height."),
            ("Explain Composition over Inheritance and why it is preferred in enterprise architecture.", "Medium", 4, "class Car { private final Engine engine; public Car(Engine e) { this.engine = e; } }"),
            ("What is the Diamond Problem and how does Java avoid it in multiple inheritance of classes?", "Medium", 4, "// Disallowing multiple class inheritance prevents ambiguity when two parents implement identical method."),
            ("What is Method Hiding in Java? How does it differ from Method Overriding?", "Medium", 3, "class Parent { static void run() {} } class Child extends Parent { static void run() {} } // Hidden, not overridden"),
            ("What are Sealed Classes in Java 17 and what problem do they solve?", "Medium", 5, "public sealed class Shape permits Circle, Square, Triangle {} // Restricts subclassing"),
            ("Explain Records in Java 16+. How do they simplify immutable DTOs?", "Easy", 3, "public record UserDTO(String id, String email) {} // Auto-generates getters, equals, hashCode, toString"),
            ("What is the role of the super keyword? When must super() be called in constructors?", "Easy", 2, "public Child() { super(); // Must be first statement in constructor }"),
            ("Can a constructor be final, static, or abstract? Explain why.", "Easy", 2, "// No: constructors are not inherited (so cannot be final), cannot be called on class name (cannot be static), must instantiate (cannot be abstract)."),
            ("Explain Constructor Chaining in Java using this() and super().", "Medium", 3, "public Employee(String name) { this(name, 0.0); } public Employee(String name, double salary) { this.name = name; this.salary = salary; }"),
            ("What are Covariant Return Types in method overriding?", "Medium", 4, "class Base { Number get() { return 1; } } class Sub extends Base { @Override Integer get() { return 1; } }"),
            ("Explain the Factory Design Pattern and how it achieves Open/Closed Principle.", "Medium", 5, "class ShapeFactory { public static Shape create(String type) { return type.equals(\"circle\") ? new Circle() : new Square(); } }"),
            ("Explain the Singleton Design Pattern with thread-safe Bill Pugh or Double-Checked Locking.", "Hard", 7, "class Singleton { private static volatile Singleton instance; private Singleton() {} public static Singleton getInstance() { if(instance == null) { synchronized(Singleton.class) { if(instance == null) instance = new Singleton(); } } return instance; } }"),
            ("How to protect a Singleton from breaking via Reflection, Serialization, and Cloning?", "Hard", 7, "// Reflection: check instance in constructor; Serialization: readResolve(); Cloning: throw exception; Or use Enum Singleton!"),
            ("Explain the Builder Design Pattern and why it is preferred over Telescoping Constructors.", "Medium", 5, "User user = new User.Builder().username(\"alice\").email(\"a@b.com\").build();"),
            ("Explain the Observer Pattern and how it decouples event producers from consumers.", "Medium", 5, "interface Observer { void update(String msg); } class Subject { List<Observer> list; void notify(String m) { list.forEach(o -> o.update(m)); } }"),
            ("Explain the Strategy Design Pattern with an order payment gateway example.", "Medium", 5, "interface PaymentStrategy { void pay(int amt); } class Checkout { PaymentStrategy s; void execute(int a) { s.pay(a); } }"),
            ("Explain Adapter Pattern vs Facade Pattern with clear structural differences.", "Medium", 5, "// Adapter converts an incompatible interface; Facade provides a simplified unified facade over complex subsystem."),
            ("What is Dependency Injection and Inversion of Control (IoC)?", "Medium", 4, "// IoC delegates object lifecycle to framework container; DI passes dependencies into constructors/fields."),
            ("How do Immutable Objects work in Java? Write a truly immutable class with mutable Date/List fields.", "Hard", 7, "public final class ImmutablePerson { private final String name; private final List<String> skills; public ImmutablePerson(String n, List<String> s) { this.name = n; this.skills = new ArrayList<>(s); } public List<String> getSkills() { return Collections.unmodifiableList(skills); } }"),
            ("Design an LRU Cache in Java combining HashMap and Doubly Linked List in O(1) time.", "Hard", 10, "class LRUCache { class Node { int k, v; Node prev, next; } Map<Integer, Node> map; Node head, tail; int cap; }")
        ]
    },
    {
        "domain": "Collections Framework & Generics",
        "companies": ["Amazon", "Google", "Walmart", "Adobe", "Paypal"],
        "source": "LeetCode & HackerRank",
        "questions": [
            ("Explain the hierarchy of Java Collection framework (Iterable -> Collection -> List/Set/Queue).", "Easy", 1, "// Collection interface extends Iterable. List preserves order, Set guarantees uniqueness, Queue handles FIFO/priority."),
            ("Internal working of HashMap in Java 8 (buckets, hash code, indexFor, LinkedList -> Red-Black Tree threshold).", "Hard", 7, "// Threshold: when a bucket length >= 8 and total capacity >= 64, linked list transforms into Red-Black Tree (O(log n))."),
            ("Why does HashMap require key class to override both equals() and hashCode() contract?", "Medium", 5, "// If hashCode differs, keys land in different buckets; if equals differs, existing key cannot be recognized or overwritten."),
            ("Difference between HashMap, LinkedHashMap, and TreeMap.", "Medium", 4, "// HashMap: unordered; LinkedHashMap: insertion/access order; TreeMap: sorted order based on Comparator."),
            ("Difference between ArrayList and LinkedList with performance trade-offs.", "Easy", 2, "// ArrayList: dynamic array with O(1) random access; LinkedList: doubly linked list with fast insertion but O(n) traversal."),
            ("How does ArrayList resize internally when capacity is exceeded?", "Medium", 4, "// Creates new array with newCapacity = oldCapacity + (oldCapacity >> 1) [1.5x growth factor], copies elements via System.arraycopy."),
            ("Difference between HashSet, LinkedHashSet, and TreeSet.", "Medium", 4, "// HashSet backed by HashMap; LinkedHashSet maintains insertion order; TreeSet backed by TreeMap with O(log n) lookups."),
            ("What is ConcurrentHashMap and how does it achieve high concurrency without global locking?", "Hard", 8, "// In Java 8: Uses CAS (Compare-And-Swap) for empty buckets and synchronized locking only on bucket head nodes."),
            ("Difference between Fail-Fast and Fail-Safe iterators with ConcurrentModificationException.", "Medium", 5, "// Fail-Fast checks modCount and throws exception immediately; Fail-Safe works on clone/copy of underlying array."),
            ("Explain Comparable vs Comparator with implementation differences.", "Medium", 4, "class AgeComparator implements Comparator<User> { public int compare(User a, User b) { return Integer.compare(a.age, b.age); } }"),
            ("Internal working of PriorityQueue in Java (Min-Heap array representation).", "Medium", 5, "PriorityQueue<Integer> pq = new PriorityQueue<>(Collections.reverseOrder()); // Max Heap"),
            ("Explain CopyOnWriteArrayList: when should it be used and what are its memory implications?", "Hard", 7, "// Creates a fresh copy of array on every write operation; ideal for high read / rare write concurrent scenarios."),
            ("What is the difference between ArrayDeque and LinkedList when implementing a Stack or Queue?", "Medium", 4, "// ArrayDeque is faster than LinkedList and Stack because it has better cache locality and zero node allocation overhead."),
            ("Explain Generics type erasure in Java: what happens at runtime?", "Hard", 7, "// Compiler replaces type parameters with Object or their upper bound, inserting casts. No generic types exist in bytecode."),
            ("What is the difference between <? extends T> and <? super T> (PECS rule)?", "Hard", 7, "// Producer Extends, Consumer Super: read from extends, write to super."),
            ("What is Collections.unmodifiableList() vs List.of() in Java 9+?", "Medium", 4, "// unmodifiableList is a view wrapper around mutable list; List.of() produces a truly immutable compact implementation."),
            ("How to make a custom class safe for use as a HashMap key?", "Medium", 5, "// Make class final, make fields private final, override equals() and hashCode() consistently."),
            ("Explain identityHashMap vs WeakHashMap in Java.", "Hard", 6, "// IdentityHashMap compares keys using == (reference identity); WeakHashMap holds keys via WeakReference eligible for GC."),
            ("Explain BlockingQueue interface and its implementations (ArrayBlockingQueue vs LinkedBlockingQueue).", "Hard", 7, "// BlockingQueue blocks thread on put() when full and take() when empty; fundamental for Producer-Consumer pattern."),
            ("What is EnumMap and EnumSet and why are they extremely performant?", "Medium", 5, "// Internally represented as bit vectors (long/bitmask), offering O(1) performance with zero memory overhead."),
            ("How do you sort a Map by value in Java 8 using Streams?", "Medium", 5, "map.entrySet().stream().sorted(Map.Entry.comparingByValue()).collect(Collectors.toMap(e->e.getKey(), e->e.getValue(), (e1,e2)->e1, LinkedHashMap::new));"),
            ("What is the contract between compareTo and equals method?", "Medium", 4, "// (x.compareTo(y) == 0) should generally be consistent with (x.equals(y))."),
            ("What is Spliterator in Java 8 Collections?", "Hard", 7, "// Parallel-capable iterator that splits underlying data chunks for parallel stream processing."),
            ("Find Top K Frequent Elements using Min-Heap / PriorityQueue in O(n log k).", "Hard", 8, "PriorityQueue<Map.Entry<Integer, Integer>> pq = new PriorityQueue<>((a,b)->a.getValue()-b.getValue()); for(var e : map.entrySet()) { pq.offer(e); if(pq.size() > k) pq.poll(); }"),
            ("Implement an In-Memory Rate Limiter using Token Bucket and ConcurrentHashMap.", "Hard", 10, "class TokenBucketRateLimiter { private final long capacity; private double tokens; private long lastRefillTimestamp; }")
        ]
    },
    {
        "domain": "Multithreading, Concurrency & Synchronization",
        "companies": ["Morgan Stanley", "Goldman Sachs", "Google", "Netflix", "Uber"],
        "source": "LeetCode Concurrency & MNC Systems",
        "questions": [
            ("What is the difference between a Process and a Thread in operating systems and JVM?", "Easy", 1, "// Process has independent address space; threads share process memory heap but have private call stacks."),
            ("Explain Thread Lifecycle in Java: NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED.", "Medium", 4, "// BLOCKED waits for monitor lock; WAITING waits indefinitely via wait()/join(); TIMED_WAITING has timeout."),
            ("Difference between implementing Runnable vs extending Thread class.", "Easy", 2, "// Runnable allows extending another class and decoupling task execution from thread management."),
            ("What is Callable and Future in Java? How do they differ from Runnable?", "Medium", 4, "// Callable returns a generic result and can throw checked exceptions; Future holds pending async result."),
            ("Explain the volatile keyword in Java: Visibility vs Atomicity.", "Hard", 6, "// Guarantees memory visibility across CPU cores preventing caching; does NOT guarantee atomicity for i++."),
            ("What is Java Memory Model (JMM) and Happens-Before Guarantee?", "Hard", 8, "// Specifies legal reorderings by compiler/CPU and guarantees visibility when writes happen before reads."),
            ("Explain synchronized keyword: method synchronization vs synchronized block.", "Medium", 4, "// Synchronized block locks on specific object monitor, minimizing critical section footprint."),
            ("What is a Race Condition and how can it be avoided?", "Medium", 4, "// Occurs when concurrent threads access mutable shared state without coordination. Fix with locks/atomic types."),
            ("Explain Deadlock, Livelock, and Starvation in concurrent systems.", "Medium", 5, "// Deadlock: circular wait for locks; Livelock: threads react to each other without progress; Starvation: low-priority thread starved of CPU."),
            ("Write a program that reliably produces Deadlock and explain how to prevent it.", "Hard", 7, "// Thread 1 locks A then B; Thread 2 locks B then A. Fix: enforce consistent global lock acquisition ordering."),
            ("Explain wait(), notify(), and notifyAll(). Why must they be called inside a synchronized block?", "Medium", 5, "// They manipulate object monitor wait-set. Calling outside synchronized throws IllegalMonitorStateException."),
            ("Why should wait() always be called inside a while loop instead of an if check?", "Medium", 5, "// To guard against Spurious Wakeups where thread wakes up without receiving notify()."),
            ("What is ThreadLocal in Java? Explain memory leak risks with thread pools.", "Hard", 7, "// Provides thread-confined variables. If not removed with remove(), thread pool workers retain references indefinitely."),
            ("Explain ReentrantLock: how does it differ from synchronized keyword?", "Hard", 7, "// Supports tryLock(), timed locks, interruptible lock acquisition, and fair queuing policy."),
            ("Explain ReadWriteLock and StampedLock in Java concurrency.", "Hard", 8, "// Multiple readers can read concurrently if no writer is active. StampedLock supports optimistic read mode."),
            ("Explain AtomicInteger and Compare-And-Swap (CAS) hardware instruction.", "Hard", 7, "// Atomic variables use CPU lock-free primitive cmpxchg ensuring atomic increments without thread blocking."),
            ("Explain ExecutorService and ThreadPoolExecutor parameters (corePoolSize, maxPoolSize, keepAliveTime, WorkQueue, RejectedExecutionHandler).", "Hard", 8, "// Core workers stay alive; excess tasks queue; if queue full, spawn up to maxPoolSize; if still full, reject."),
            ("Explain CompletableFuture in Java 8: supplyAsync, thenApply, thenCompose, and allOf.", "Hard", 8, "CompletableFuture.supplyAsync(() -> fetchUserData()).thenApply(user -> enrich(user));"),
            ("Difference between CountDownLatch and CyclicBarrier.", "Hard", 7, "// CountDownLatch cannot be reset; CyclicBarrier can be reused after barrier is tripped by N threads."),
            ("Explain Semaphore and its use in resource pool throttling.", "Medium", 6, "Semaphore sem = new Semaphore(5); sem.acquire(); try { execute(); } finally { sem.release(); }"),
            ("What is ForkJoinPool and Work-Stealing algorithm in Java 7+?", "Hard", 8, "// Idle worker threads steal tasks from back of deques of busy threads to maximize CPU core throughput."),
            ("Print Numbers in Alternating Threads (Zero Even Odd / FizzBuzz Multi-threaded).", "Hard", 8, "// Use Semaphore or ReentrantLock conditions to coordinate alternating turn sequences."),
            ("Implement a Thread-Safe Bounded Blocking Queue using ReentrantLock and Condition.", "Hard", 9, "class BoundedQueue<T> { Lock lock = new ReentrantLock(); Condition notFull = lock.newCondition(), notEmpty = lock.newCondition(); }"),
            ("Implement Producer-Consumer problem using wait/notify pattern.", "Hard", 8, "synchronized(buffer) { while(buffer.isFull()) buffer.wait(); buffer.add(item); buffer.notifyAll(); }"),
            ("Design a Distributed/Concurrent Rate Limiter or Distributed Lock simulator using AtomicReference.", "Hard", 10, "class ConcurrentSpinLock { private final AtomicReference<Thread> owner = new AtomicReference<>(); }")
        ]
    },
    {
        "domain": "Java 8+ Stream API, Lambdas & Functional Programming",
        "companies": ["Amazon", "Meta", "JPMorgan", "Salesforce", "Intuit"],
        "source": "Modern Java Technical Interviews",
        "questions": [
            ("What is a Functional Interface in Java? Explain @FunctionalInterface annotation.", "Easy", 1, "@FunctionalInterface interface Transformer<T, R> { R transform(T input); }"),
            ("Explain the 4 core built-in functional interfaces: Predicate, Function, Consumer, and Supplier.", "Easy", 2, "Predicate<Integer> isEven = n -> n % 2 == 0; Function<String, Integer> len = String::length;"),
            ("What is the difference between intermediate and terminal operations in Java Streams?", "Easy", 2, "// Intermediate (filter, map) are lazy and return new Stream; Terminal (collect, count) trigger execution pipeline."),
            ("Why are Java Streams lazy? How does laziness optimize execution?", "Medium", 4, "// Processing halts immediately once terminal short-circuiting operation (findFirst, anyMatch) is satisfied."),
            ("Explain method references in Java (Static, Instance of arbitrary object, Instance of specific object, Constructor).", "Easy", 2, "List<String> names = list.stream().map(Person::getName).collect(Collectors.toList());"),
            ("Difference between map() and flatMap() in Stream API.", "Medium", 4, "// map transforms 1-to-1; flatMap flattens Stream of Streams into single flattened stream."),
            ("How to handle NullPointerException using Optional in Java 8?", "Easy", 2, "Optional.ofNullable(user).map(User::getAddress).map(Address::getCity).orElse(\"Default City\");"),
            ("Explain Collectors.groupingBy with downstream collector (e.g. counting, averaging).", "Hard", 6, "Map<Department, Long> countByDept = employees.stream().collect(Collectors.groupingBy(Employee::getDept, Collectors.counting()));"),
            ("Explain Collectors.partitioningBy and how it differs from groupingBy.", "Medium", 4, "// partitioningBy takes Predicate and splits data strictly into Map<Boolean, List<T>>."),
            ("How to find the second highest number in an integer list using Streams?", "Medium", 4, "int second = list.stream().distinct().sorted(Comparator.reverseOrder()).skip(1).findFirst().orElse(-1);"),
            ("Find the longest string in a list of words using Stream reduce or max.", "Easy", 2, "String longest = words.stream().max(Comparator.comparingInt(String::length)).orElse(\"\");"),
            ("Convert a List of Objects into a Map with duplicate key resolution in Collectors.toMap.", "Medium", 5, "Map<Integer, User> map = users.stream().collect(Collectors.toMap(User::getId, u -> u, (u1, u2) -> u1));"),
            ("What is parallelStream() and what thread pool does it use? When should it be avoided?", "Hard", 7, "// Uses common ForkJoinPool. Avoid for I/O operations or small collections due to thread coordination overhead."),
            ("How do you create a custom Collector in Java 8?", "Hard", 8, "Collector.of(ArrayList::new, List::add, (left, right) -> { left.addAll(right); return left; });"),
            ("Explain reduce() method: identity, accumulator, and combiner parameters.", "Medium", 5, "int sum = numbers.stream().reduce(0, (a, b) -> a + b);"),
            ("Find all anagrams in a list of words grouped together using Stream API.", "Hard", 6, "words.stream().collect(Collectors.groupingBy(w -> { char[] c=w.toCharArray(); Arrays.sort(c); return new String(c); }));"),
            ("Count the occurrences of each word in a paragraph using Stream API.", "Medium", 4, "Map<String, Long> freq = Arrays.stream(text.split(\"\\\\s+\")).collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));"),
            ("Explain Stream.iterate() and Stream.generate() for infinite streams with limit().", "Easy", 3, "Stream.iterate(new int[]{0, 1}, f -> new int[]{f[1], f[0] + f[1]}).limit(10).map(f -> f[0]);"),
            ("What is the difference between findFirst() and findAny() in parallel streams?", "Medium", 4, "// findFirst guarantees deterministic first encounter; findAny returns whichever thread finishes first."),
            ("How to join a list of strings with comma and brackets using Collectors.joining()?", "Easy", 1, "String res = list.stream().collect(Collectors.joining(\", \", \"[\", \"]\"));"),
            ("Explain peek() method in Stream API: why is it primarily intended for debugging?", "Easy", 2, "// Designed as an action on elements as they are consumed without mutating the stream."),
            ("Explain default methods in interfaces and how they enabled backward compatibility for Stream API in Java 8.", "Medium", 4, "// Allowed adding stream() method to Collection interface without breaking millions of third-party implementations."),
            ("How to partition numbers into primes and non-primes using custom Predicate stream?", "Medium", 5, "Map<Boolean, List<Integer>> primes = numbers.stream().collect(Collectors.partitioningBy(PrimeChecker::isPrime));"),
            ("Sort employee list by Salary descending, then by Name alphabetically using Comparator chaining.", "Medium", 4, "Comparator<Employee> comp = Comparator.comparing(Employee::getSalary).reversed().thenComparing(Employee::getName);"),
            ("Implement an Event-Driven Reactive Pipeline with Streams and CompletableFuture.", "Hard", 10, "CompletableFuture.allOf(tasks.stream().map(t -> CompletableFuture.supplyAsync(t::run)).toArray(CompletableFuture[]::new));")
        ]
    },
    {
        "domain": "Exception Handling, IO & Serialization",
        "companies": ["Oracle", "Cisco", "IBM", "Infosys", "Deloitte"],
        "source": "Standard MNC Java Certifications",
        "questions": [
            ("Explain the Exception hierarchy in Java (Throwable -> Error & Exception).", "Easy", 1, "// Throwable is root. Error represents fatal system issues (OOM, StackOverflow); Exception represents recoverable errors."),
            ("Explain try-with-resources and AutoCloseable interface introduced in Java 7.", "Easy", 2, "try (BufferedReader br = new BufferedReader(new FileReader(\"data.txt\"))) { return br.readLine(); }"),
            ("What are Suppressed Exceptions in try-with-resources?", "Medium", 4, "// Exceptions thrown when closing resources while another exception is active are attached via addSuppressed()."),
            ("Can finally block override a return statement in the try block? What happens?", "Medium", 3, "try { return 1; } finally { return 2; } // Returns 2! Finally executes before method return."),
            ("What happens if System.exit(0) is executed inside the try block? Does finally run?", "Easy", 2, "// JVM terminates immediately; finally block will NOT execute."),
            ("How to create a Custom Checked and Custom Unchecked Exception in Java?", "Easy", 3, "class CustomNotFoundException extends Exception { public CustomNotFoundException(String m) { super(m); } }"),
            ("What is Exception Chaining and how does initCause() work?", "Medium", 4, "try { parse(); } catch(IOException e) { throw new ServiceException(\"Parse failed\", e); }"),
            ("Explain the difference between throw and throws keywords.", "Easy", 1, "// throw throws an explicit exception instance; throws declares exceptions a method might produce."),
            ("Why is catching Throwable or Error considered a terrible practice?", "Medium", 4, "// OutOfMemoryError and InternalError indicate corrupted JVM state that application code cannot safely recover from."),
            ("What is serialVersionUID and what happens if you don't define it during class schema changes?", "Hard", 6, "// JVM calculates a default UID based on class structure. Any field change causes InvalidClassException during deserialization."),
            ("What is the transient keyword and how does it affect serialization?", "Medium", 4, "private transient String creditCardNumber; // Field is skipped during serialization, default value set on load."),
            ("Difference between Serializable and Externalizable interfaces.", "Hard", 6, "// Externalizable requires writeExternal() and readExternal() giving 100% manual control over stream bytes."),
            ("Explain Byte Streams (InputStream/OutputStream) vs Character Streams (Reader/Writer).", "Easy", 2, "// Byte streams handle raw 8-bit binary data; Character streams handle 16-bit Unicode characters with encodings."),
            ("Difference between BufferedReader and Scanner.", "Easy", 2, "// BufferedReader has larger 8KB buffer and is faster for bulk lines; Scanner parses primitive tokens via regex."),
            ("What is Java NIO (Non-blocking I/O) and how do Channels, Buffers, and Selectors work?", "Hard", 8, "// NIO allows single thread to monitor multiple network channels simultaneously using Selector multiplexing."),
            ("Explain File Channel and Memory-Mapped Files (MappedByteBuffer).", "Hard", 8, "// Maps file directly into virtual memory for blazing fast I/O bypassing OS kernel-to-user space buffer copying."),
            ("How to read a large 10GB file in Java without encountering OutOfMemoryError?", "Hard", 7, "try (Stream<String> lines = Files.lines(Paths.get(\"large.txt\"))) { lines.forEach(this::process); }"),
            ("Explain Path, Paths, and Files utilities introduced in Java 7 NIO.2.", "Easy", 2, "Path path = Paths.get(\"app.log\"); List<String> allLines = Files.readAllLines(path);"),
            ("What is the difference between synchronous blocking I/O and asynchronous I/O (AIO)?", "Hard", 7, "// In AIO, thread initiates I/O operation and provides a CompletionHandler callback without blocking."),
            ("How does Object Serialization handle inheritance? Does parent state serialize if parent is not Serializable?", "Hard", 7, "// If parent does not implement Serializable, its no-arg constructor is called during deserialization to initialize parent fields."),
            ("How to safely serialize a Singleton to prevent duplicate instances?", "Hard", 7, "protected Object readResolve() { return getInstance(); }"),
            ("Explain printStackTrace() vs Logger.error() in production software.", "Easy", 1, "// printStackTrace writes to System.err without structured log metadata; Logger writes formatted logs with levels and timestamps."),
            ("How to implement a file watcher service in Java NIO?", "Medium", 5, "WatchService watcher = FileSystems.getDefault().newWatchService(); path.register(watcher, StandardWatchEventKinds.ENTRY_CREATE);"),
            ("Explain Try-Catch-Finally with multiple catch blocks and the union catch syntax (A | B).", "Easy", 2, "try { work(); } catch (IOException | SQLException e) { log(e); }"),
            ("Build a robust File Streaming Pipeline with custom exception handling and metrics.", "Hard", 10, "try (var in = Files.newInputStream(p); var out = Files.newOutputStream(target)) { in.transferTo(out); }")
        ]
    },
    {
        "domain": "JVM Internals, Memory Management, GC & Performance",
        "companies": ["Google", "Netflix", "LinkedIn", "Amazon", "Twitter"],
        "source": "JVM Engineering & Architecture Interviews",
        "questions": [
            ("Explain the JVM Runtime Data Areas: Method Area, Heap, Stack, PC Register, Native Method Stack.", "Hard", 7, "// Heap: shared object storage; Stack: thread-private frame calls; Method Area: class metadata/code cache."),
            ("What is the difference between Stack Memory and Heap Memory?", "Easy", 2, "// Stack holds primitive local variables and method call frames (fast, short-lived); Heap stores all instantiated objects."),
            ("Explain the generational hypothesis of Java Heap (Young Gen: Eden, S0, S1; Old Gen; Metaspace).", "Hard", 7, "// Most objects die young. Surviving Eden objects move through Survivor spaces S0/S1 before promotion to Tenured."),
            ("What is Metaspace in Java 8+ and how does it differ from PermGen in Java 7?", "Hard", 7, "// PermGen had fixed size triggering OOM; Metaspace allocates natively from OS virtual memory dynamically."),
            ("How does Garbage Collection determine if an object is unreachable? (Reference Counting vs GC Roots Reachability Analysis).", "Hard", 7, "// JVM traverses reference graphs from GC Roots (Thread stacks, static fields, JNI pointers) to avoid circular reference leaks."),
            ("Explain Garbage Collection algorithms: Mark-Sweep, Mark-Sweep-Compact, and Copying.", "Hard", 8, "// Copying moves alive objects to new space; Compact slides living objects together to eliminate fragmentation."),
            ("Explain modern Java Garbage Collectors: Serial, Parallel, CMS, G1GC, and ZGC.", "Hard", 9, "// G1GC splits heap into regional grids; ZGC performs concurrent sub-millisecond pauses across multi-terabyte heaps."),
            ("What is Stop-The-World (STW) pause in Garbage Collection?", "Medium", 5, "// JVM freezes all application execution threads while GC threads inspect or relocate objects safely."),
            ("What causes java.lang.OutOfMemoryError: Java heap space vs GC Overhead Limit Exceeded?", "Medium", 5, "// Heap space: no room for new allocation; GC Overhead: JVM spends >98% time in GC and recovers <2% memory."),
            ("What causes java.lang.StackOverflowError?", "Easy", 1, "// Deep or infinite recursion exhausting the allocated thread stack depth size (-Xss)."),
            ("What is a Memory Leak in Java? Give 3 common causes.", "Hard", 7, "// 1. Static collections holding unused objects; 2. Unclosed I/O/DB connections; 3. Unregistered listeners/ThreadLocals."),
            ("Explain the 4 types of references in Java: Strong, Soft, Weak, and Phantom.", "Hard", 8, "// Strong: never GC'd; Soft: GC'd under OOM pressure; Weak: GC'd at next GC cycle; Phantom: post-mortem cleanup."),
            ("What is JIT (Just-In-Time) Compilation in JVM? Explain C1 and C2 compilers.", "Hard", 8, "// JIT compiles hot bytecode paths into native machine code at runtime. C1 provides quick compilation; C2 does heavy optimizations."),
            ("What is Escape Analysis in JIT compiler?", "Hard", 8, "// If an object doesn't escape method scope, JIT can eliminate heap allocation and allocate fields on the Stack!"),
            ("What is ClassLoader hierarchy in Java (Bootstrap -> Extension/Platform -> Application/System)?", "Hard", 7, "// Bootstrap loads core JDK classes; Application loads user classpath. Child delegates to parent first."),
            ("What is the Delegation Model in ClassLoaders? Can you break it?", "Hard", 8, "// Child delegates to parent before attempting load. Broken in Web containers (Servlet container loads webapp classes first)."),
            ("Difference between ClassNotFoundException and NoClassDefFoundError.", "Medium", 5, "// ClassNotFoundException: runtime dynamic lookup failed; NoClassDefFoundError: class present at compile time missing at runtime."),
            ("What are JVM tuning flags: -Xms, -Xmx, -Xss, -XX:NewRatio, -XX:+UseG1GC?", "Medium", 5, "// -Xms sets initial heap size; -Xmx sets maximum heap size; -Xss sets per-thread stack size."),
            ("How to generate and analyze a Heap Dump and Thread Dump?", "Hard", 7, "// jmap -dump:format=b,file=heap.hprof <pid> or -XX:+HeapDumpOnOutOfMemoryError; Thread dump via jstack <pid>."),
            ("What is Java Bytecode? How do you inspect bytecode using javap -c?", "Medium", 5, "// Disassembles class file into JVM assembly opcodes: iload, istore, invokevirtual, bipush, ireturn."),
            ("What are Compact Strings in Java 9+?", "Medium", 4, "// Strings encode as byte[] with coder flag instead of char[] if all characters fit Latin-1 (saving 50% memory)."),
            ("Explain biased locking, lightweight locking, and heavy locking in JVM monitor states.", "Hard", 8, "// Biased locks optimize single-thread access; Lightweight locks use CAS spin-locking; Heavyweight locks sleep on OS mutex."),
            ("What is False Sharing in multi-core CPU architectures and how does @Contended prevent it?", "Hard", 9, "// Multiple CPU cores modifying adjacent variables on same 64-byte cache line cause continuous cache line invalidation."),
            ("What is Java Native Interface (JNI) and Project Panama?", "Hard", 8, "// JNI bridges C/C++ libraries with Java; Project Panama offers Foreign Function & Memory API for direct off-heap access."),
            ("Design a Zero-Allocation Object Pool for High-Frequency Low-Latency Trading.", "Hard", 10, "class ObjectPool<T> { private final T[] pool; private int tail; public T acquire() { return pool[--tail]; } }")
        ]
    },
    {
        "domain": "Spring Boot, REST APIs & Enterprise Microservices",
        "companies": ["Amazon", "Capital One", "JPMorgan", "Walmart", "Paypal"],
        "source": "MNC Backend Engineering Interviews",
        "questions": [
            ("What is Spring Boot and how does it differ from traditional Spring MVC?", "Easy", 1, "// Provides auto-configuration, starter POMs, embedded Tomcat servlet containers, and production-ready actuators."),
            ("Explain the Spring Bean Lifecycle from instantiation to destruction.", "Hard", 7, "// Instantiate -> Populate properties -> BeanNameAware -> BeanPostProcessor Before -> @PostConstruct -> After -> Ready -> PreDestroy."),
            ("What are Spring Bean Scopes? (Singleton, Prototype, Request, Session, Application).", "Medium", 4, "// Singleton: single instance per Spring container; Prototype: fresh instance created upon every injection."),
            ("Explain Dependency Injection types in Spring (Constructor vs Setter vs Field). Why is Constructor preferred?", "Medium", 4, "// Constructor injection guarantees immutability, facilitates unit testing without Spring, and prevents partial init."),
            ("Difference between @Component, @Service, @Repository, and @Controller annotations.", "Easy", 2, "// All are stereotype annotations. @Repository enables automatic persistence exception translation."),
            ("What is @SpringBootApplication annotation composed of?", "Easy", 2, "// Composed of @Configuration, @EnableAutoConfiguration, and @ComponentScan."),
            ("How does Spring Boot Auto-Configuration work internally (@ConditionalOnClass)?", "Hard", 8, "// Reads spring.factories / AutoConfiguration.imports and evaluates conditions to configure beans automatically."),
            ("Difference between @Controller and @RestController.", "Easy", 1, "// @RestController is convenience annotation combining @Controller and @ResponseBody (returns JSON by default)."),
            ("Explain HTTP Status Codes commonly used in REST APIs (200, 201, 204, 400, 401, 403, 404, 409, 500).", "Easy", 2, "// 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict."),
            ("Difference between PUT and PATCH HTTP methods.", "Easy", 2, "// PUT replaces complete resource entity representation; PATCH applies partial field modifications."),
            ("What is Idempotence in REST APIs and which HTTP verbs are idempotent?", "Medium", 4, "// Making multiple identical requests produces same side-effect on server. GET, PUT, DELETE are idempotent; POST is not."),
            ("How to handle global exceptions in Spring Boot using @ControllerAdvice and @ExceptionHandler?", "Medium", 4, "@RestControllerAdvice public class GlobalHandler { @ExceptionHandler(NotFoundEx.class) public ResponseEntity<?> handle() {} }"),
            ("What is Spring Data JPA and how does JpaRepository generate SQL queries dynamically?", "Medium", 5, "// Uses method name parsing conventions (e.g. findByEmailAndStatus) and generates SQL via Hibernate AST."),
            ("Explain LazyLoading vs EagerLoading in JPA/Hibernate and N+1 Problem.", "Hard", 7, "// Lazy loads relations upon access. N+1 queries occur when fetching parent and firing N queries for children. Fix: JOIN FETCH."),
            ("Explain @Transactional annotation: propagation behaviors (REQUIRED, REQUIRES_NEW) and rollback rules.", "Hard", 7, "// Rollback happens by default on RuntimeException/Error, not checked exceptions unless rollbackFor is specified."),
            ("What is Spring Security Filter Chain and how does JWT authentication integrate with it?", "Hard", 8, "// Requests pass through security filters (OncePerRequestFilter) extracting Bearer token and setting SecurityContextHolder."),
            ("Difference between Authentication and Authorization in Spring Security.", "Easy", 2, "// Authentication verifies identity (who you are); Authorization verifies access permissions (what you are allowed to do)."),
            ("What is Spring Cloud Gateway and what are its core architectural components (Route, Predicate, Filter)?", "Hard", 7, "// Routes client traffic to upstream services, applying authentication, rate limiting, and circuit breaking."),
            ("Explain Circuit Breaker Pattern in Microservices using Resilience4j.", "Hard", 8, "// States: CLOSED (normal), OPEN (fails fast when failure rate exceeds threshold), HALF-OPEN (tests downstream recovery)."),
            ("How do Microservices communicate? Differentiate Synchronous REST vs Asynchronous Event-Driven (Kafka/RabbitMQ).", "Medium", 5, "// REST is blocking request-response; Kafka is decoupled event pub/sub with high-throughput persistent logs."),
            ("Explain Distributed Tracing in Microservices using OpenTelemetry or Spring Cloud Sleuth/Zipkin.", "Hard", 7, "// Propagates TraceID across all microservice hops and SpanID for individual operations to trace latency."),
            ("What is the Saga Pattern in distributed microservices transactions (Choreography vs Orchestration)?", "Hard", 9, "// Coordinates distributed transactions using a sequence of local transactions and compensating rollback actions."),
            ("What is Database per Service pattern and how do you handle cross-service queries (CQRS)?", "Hard", 8, "// Command Query Responsibility Segregation separates read models (Elasticsearch/Read DB) from write models."),
            ("Explain Spring Boot Actuator and how it exposes health, metrics, and prometheus endpoints.", "Medium", 4, "// Exposes /actuator/health, /actuator/metrics for Kubernetes probes and Grafana dashboards."),
            ("Architect a High-Availability Scalable E-Commerce Order Microservice in Spring Boot.", "Hard", 10, "// Design REST Controller -> Idempotency Filter -> Redis Lock -> Order Service -> Kafka Event Publisher -> PostgreSQL.")
        ]
    },
    {
        "domain": "Data Structures, Dynamic Programming & Graph Algorithms",
        "companies": ["Google", "Amazon", "Meta", "Microsoft", "Apple"],
        "source": "LeetCode Medium & Hard MNC Interviews",
        "questions": [
            ("Reverse Linked List (Iterative & Recursive).", "Easy", 2, "ListNode prev = null, curr = head; while(curr != null) { ListNode nxt = curr.next; curr.next = prev; prev = curr; curr = nxt; } return prev;"),
            ("Detect Cycle in a Linked List (Floyd's Tortoise and Hare).", "Easy", 2, "ListNode slow = head, fast = head; while(fast != null && fast.next != null) { slow = slow.next; fast = fast.next.next; if(slow == fast) return true; } return false;"),
            ("Merge Two Sorted Linked Lists into one sorted list.", "Easy", 2, "ListNode dummy = new ListNode(0), tail = dummy; while(l1 != null && l2 != null) { if(l1.val <= l2.val) { tail.next = l1; l1 = l1.next; } else { tail.next = l2; l2 = l2.next; } tail = tail.next; } tail.next = (l1 != null) ? l1 : l2; return dummy.next;"),
            ("Remove Nth Node From End of List in one pass.", "Medium", 4, "ListNode dummy = new ListNode(0, head), fast = dummy, slow = dummy; for(int i=0; i<=n; i++) fast = fast.next; while(fast != null) { fast = fast.next; slow = slow.next; } slow.next = slow.next.next; return dummy.next;"),
            ("Maximum Depth of Binary Tree (DFS).", "Easy", 1, "public int maxDepth(TreeNode root) { return root == null ? 0 : 1 + Math.max(maxDepth(root.left), maxDepth(root.right)); }"),
            ("Invert/Flip Binary Tree (Mirror image).", "Easy", 1, "public TreeNode invertTree(TreeNode root) { if(root == null) return null; TreeNode t = root.left; root.left = invertTree(root.right); root.right = invertTree(t); return root; }"),
            ("Validate Binary Search Tree (BST) using valid range recursion.", "Medium", 5, "private boolean isValid(TreeNode n, Long min, Long max) { if(n == null) return true; if(n.val <= min || n.val >= max) return false; return isValid(n.left, min, (long)n.val) && isValid(n.right, (long)n.val, max); }"),
            ("Lowest Common Ancestor in a Binary Search Tree.", "Medium", 4, "while(root != null) { if(p.val < root.val && q.val < root.val) root = root.left; else if(p.val > root.val && q.val > root.val) root = root.right; else return root; } return null;"),
            ("Binary Tree Level Order Traversal (BFS using Queue).", "Medium", 5, "Queue<TreeNode> q = new LinkedList<>(); q.offer(root); while(!q.isEmpty()) { int size = q.size(); List<Integer> level = new ArrayList<>(); for(int i=0; i<size; i++) { TreeNode curr = q.poll(); level.add(curr.val); if(curr.left != null) q.offer(curr.left); if(curr.right != null) q.offer(curr.right); } res.add(level); }"),
            ("Construct Binary Tree from Preorder and Inorder Traversal.", "Medium", 7, "Map<Integer, Integer> inMap = new HashMap<>(); // Divide and conquer left & right subtrees recursively"),
            ("Kth Smallest Element in a BST using iterative in-order traversal.", "Medium", 5, "Deque<TreeNode> st = new ArrayDeque<>(); while(root != null || !st.isEmpty()) { while(root != null) { st.push(root); root = root.left; } root = st.pop(); if(--k == 0) return root.val; root = root.right; }"),
            ("Climbing Stairs: Distinct ways to reach top using 1 or 2 steps (DP).", "Easy", 2, "int a = 1, b = 2; for(int i = 3; i <= n; i++) { int c = a + b; a = b; b = c; } return n == 1 ? 1 : b;"),
            ("Coin Change: Minimum coins to make amount (DP).", "Medium", 6, "int[] dp = new int[amount + 1]; Arrays.fill(dp, amount + 1); dp[0] = 0; for(int a=1; a<=amount; a++) for(int c : coins) if(a - c >= 0) dp[a] = Math.min(dp[a], 1 + dp[a-c]); return dp[amount] > amount ? -1 : dp[amount];"),
            ("Longest Increasing Subsequence in O(n log n) using patience sorting.", "Medium", 7, "List<Integer> piles = new ArrayList<>(); for(int x : nums) { int idx = Collections.binarySearch(piles, x); if(idx < 0) idx = -(idx + 1); if(idx == piles.size()) piles.add(x); else piles.set(idx, x); } return piles.size();"),
            ("0/1 Knapsack Problem with weights and maximum capacity.", "Medium", 6, "int[][] dp = new int[n+1][W+1]; for(int i=1; i<=n; i++) for(int w=1; w<=W; w++) dp[i][w] = (wt[i-1] <= w) ? Math.max(val[i-1] + dp[i-1][w-wt[i-1]], dp[i-1][w]) : dp[i-1][w];"),
            ("Word Break: Can string be segmented into dictionary words?", "Medium", 6, "boolean[] dp = new boolean[s.length() + 1]; dp[0] = true; for(int i=1; i<=s.length(); i++) for(int j=0; j<i; j++) if(dp[j] && wordDict.contains(s.substring(j, i))) { dp[i] = true; break; } return dp[s.length()];"),
            ("Number of Islands (Grid DFS/BFS).", "Medium", 5, "for(int r=0; r<R; r++) for(int c=0; c<C; c++) if(grid[r][c] == '1') { islands++; dfs(grid, r, c); }"),
            ("Clone Graph: Deep copy of undirected graph using HashMap memoization.", "Medium", 6, "Map<Node, Node> map = new HashMap<>(); public Node cloneGraph(Node n) { if(n == null) return null; if(map.containsKey(n)) return map.get(n); Node copy = new Node(n.val); map.put(n, copy); for(Node neighbor : n.neighbors) copy.neighbors.add(cloneGraph(neighbor)); return copy; }"),
            ("Course Schedule: Detect cycle in directed graph (Topological Sort / Kahn's Algorithm).", "Medium", 7, "int[] inDegree = new int[numCourses]; for(int[] e : prerequisites) inDegree[e[0]]++; Queue<Integer> q = new LinkedList<>(); for(int i=0; i<numCourses; i++) if(inDegree[i] == 0) q.offer(i); while(!q.isEmpty()) { int c = q.poll(); visited++; for(int next : adj.get(c)) if(--inDegree[next] == 0) q.offer(next); } return visited == numCourses;"),
            ("Pacific Atlantic Water Flow: Multi-source BFS/DFS.", "Medium", 7, "Explore from oceans inland to find cells reachable by both Pacific and Atlantic boundaries."),
            ("Word Ladder: Shortest transformation sequence using BFS.", "Hard", 8, "Queue<String> q = new LinkedList<>(); q.offer(beginWord); Set<String> words = new HashSet<>(wordList); int level = 1; while(!q.isEmpty()) { int size = q.size(); for(int i=0; i<size; i++) { String curr = q.poll(); if(curr.equals(endWord)) return level; for(String next : getNeighbors(curr, words)) q.offer(next); } level++; } return 0;"),
            ("Implement Trie (Prefix Tree) with insert, search, and startsWith.", "Medium", 6, "class TrieNode { TrieNode[] children = new TrieNode[26]; boolean isEnd; }"),
            ("Merge k Sorted Lists using PriorityQueue in O(N log k) time.", "Hard", 8, "PriorityQueue<ListNode> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a.val)); for(ListNode l : lists) if(l != null) pq.offer(l); ListNode dummy = new ListNode(0), tail = dummy; while(!pq.isEmpty()) { ListNode min = pq.poll(); tail.next = min; tail = tail.next; if(min.next != null) pq.offer(min.next); } return dummy.next;"),
            ("Serialize and Deserialize Binary Tree into comma-delimited string.", "Hard", 9, "Preorder traversal with '#' for null nodes; deserialization using Queue of token strings."),
            ("Alien Dictionary: Find alphabetical ordering of alien language characters using Topological Sort.", "Hard", 10, "Extract directed ordering edges from adjacent words in alien dictionary and detect invalid cycles.")
        ]
    }
]

def build_pdf_document(all_questions, output_pdf_path):
    doc = SimpleDocTemplate(
        output_pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#0f172a'),
        alignment=1, # Center
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#475569'),
        alignment=1,
        spaceAfter=20
    )

    domain_heading_style = ParagraphStyle(
        'DomainHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#0284c7'),
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    q_title_style = ParagraphStyle(
        'QuestionTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0f172a')
    )

    meta_style = ParagraphStyle(
        'MetaStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#64748b')
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#047857')
    )

    story = []

    # Cover Header
    story.append(Paragraph("JavaQuest: 250 Top MNC Interview Questions", title_style))
    story.append(Paragraph("Curated from LeetCode, HackerRank, GeeksforGeeks & Top FAANG/Tier-1 Interview Archives<br/><b>Master Guide: From Beginner 1-Liners (Level 1) to Advanced System Architectures (Level 10)</b>", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=14))

    # Summary table
    summary_data = [
        [
            Paragraph("<b>Target Companies:</b> Google, Amazon, Microsoft, Meta, Netflix, Morgan Stanley, Goldman Sachs, TCS, Infosys", meta_style),
            Paragraph("<b>Coverage:</b> 10 Comprehensive Core Java & CS Domains (25 Questions each = 250 Total)", meta_style)
        ]
    ]
    t = Table(summary_data, colWidths=[270, 270])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 14))

    question_count = 0
    current_domain = ""

    for item in all_questions:
        question_count += 1
        if item["domain"] != current_domain:
            current_domain = item["domain"]
            story.append(Spacer(1, 10))
            story.append(Paragraph(f"Section {((question_count-1)//25)+1}: {current_domain}", domain_heading_style))
            companies_str = ", ".join(item["companies"])
            story.append(Paragraph(f"<b>Frequently Asked At:</b> {companies_str} | <b>Platform Source:</b> {item['source']}", meta_style))
            story.append(HRFlowable(width="100%", thickness=0.8, color=colors.HexColor('#94a3b8'), spaceAfter=8))

        # Format Question Card
        diff_color = '#15803d' if item['difficulty'] == 'Easy' else ('#d97706' if item['difficulty'] == 'Medium' else '#b91c1c')
        
        safe_prompt = html.escape(item['prompt'])
        safe_solution = html.escape(item['solution'])
        safe_companies = html.escape(', '.join(item['companies'][:3]))

        q_header = f"<b>Q{item['q_number']}.</b> {safe_prompt}"
        q_meta = f"Difficulty: <font color='{diff_color}'><b>{item['difficulty']}</b></font> | Progression: <b>Level {item['level']}/10</b> | Targets: {safe_companies}"
        
        table_rows = [
            [Paragraph(q_header, q_title_style)],
            [Paragraph(q_meta, meta_style)],
            [Paragraph(f"<b>Solution Architecture & Code:</b><br/>{safe_solution}", code_style)]
        ]

        q_table = Table(table_rows, colWidths=[540])
        q_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#ffffff')),
            ('LINELEFT', (0, 0), (0, -1), 3, colors.HexColor(diff_color)),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
            ('TOPPADDING', (0, 0), (-1, -1), 3),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 6),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))

        story.append(KeepTogether([q_table, Spacer(1, 6)]))

    print(f"Compiling PDF document with {question_count} questions...")
    doc.build(story)
    print(f"PDF successfully compiled at: {output_pdf_path}")

def generate_all():
    all_questions = []
    q_counter = 1

    for domain_info in DOMAINS:
        domain_name = domain_info["domain"]
        companies = domain_info["companies"]
        source = domain_info["source"]
        
        for q_tuple in domain_info["questions"]:
            prompt, difficulty, level, solution = q_tuple
            q_obj = {
                "q_number": q_counter,
                "canonical_id": f"MNC-{q_counter:03d}",
                "domain": domain_name,
                "companies": companies,
                "source": source,
                "difficulty": difficulty,
                "level": level,
                "prompt": prompt,
                "solution": solution,
                "learning_objective": f"Master {domain_name} for Tier-1 MNC interview technical rounds."
            }
            all_questions.append(q_obj)
            q_counter += 1

    # 1. Output JSON for database import
    json_path = os.path.join("backend", "seed_data", "mnc_250_questions.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(all_questions, f, indent=2)
    print(f"Saved {len(all_questions)} questions to {json_path}")

    # 2. Output PDF in frontend/public/downloads
    pdf_path = os.path.join("frontend", "public", "downloads", "250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf")
    build_pdf_document(all_questions, pdf_path)

if __name__ == "__main__":
    generate_all()
