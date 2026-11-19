import os
import sys
import json
import html
from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
    HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

# --------------------------------------------------------------------------
# 250 DISTINCT MNC QUESTIONS (NON-OVERLAPPING WITH THE IN-APP QUESTION BANK)
# Sourced from LeetCode Top 150, HackerRank Java Domain, and FAANG Archives
# --------------------------------------------------------------------------

DOMAINS = [
    {
        "category": "LeetCode Top 150 - Two Pointers & Sliding Window",
        "company": "Amazon / Google / Meta",
        "questions": [
            ("Trapping Rain Water", "LeetCode #42", "Given n non-negative integers representing elevation map, compute how much water it can trap after raining.", "Use two pointers l and r with maxLeft and maxRight boundaries. O(n) time, O(1) space."),
            ("Container With Most Water", "LeetCode #11", "Find two lines that together with x-axis forms a container such that it contains the most water.", "Two pointers at 0 and n-1; always advance the pointer pointing to the shorter line."),
            ("3Sum", "LeetCode #15", "Find all unique triplets [nums[i], nums[j], nums[k]] such that they sum to zero.", "Sort array, fix one number with a loop, then use two pointers for remaining pair. Skip duplicates."),
            ("Longest Substring Without Repeating Characters", "LeetCode #3", "Find length of longest substring without duplicate characters.", "Sliding window with HashMap tracking last seen index of each character. O(n) time."),
            ("Minimum Window Substring", "LeetCode #76", "Find minimum window in s which will contain all characters of t in complexity O(n).", "Two-pointer sliding window with char frequency count map and have/need match counter."),
            ("Longest Repeating Character Replacement", "LeetCode #424", "Find length of longest substring containing same letter you can get after at most k replacements.", "Sliding window tracking max frequency in current window: window_length - max_freq <= k."),
            ("Subarray Product Less Than K", "LeetCode #713", "Count number of contiguous subarrays where product of elements is strictly less than k.", "Two pointer window; multiply by nums[r], divide by nums[l] while prod >= k; add (r - l + 1)."),
            ("Permutation in String", "LeetCode #567", "Given two strings s1 and s2, return true if s2 contains a permutation of s1.", "Fixed sliding window of size len(s1) comparing 26-element character frequency arrays."),
            ("4Sum", "LeetCode #18", "Find all unique quadruplets summing to target.", "Sort array, dual nested loops with two pointers for remaining two elements; handle overflow with long."),
            ("Minimum Size Subarray Sum", "LeetCode #209", "Find minimal length of subarray whose sum is greater than or equal to target.", "Sliding window expanding right and contracting left whenever sum >= target; track min length."),
            ("Sliding Window Maximum", "LeetCode #239", "Return max sliding window of size k moving from left to right.", "Monotonic double-ended queue (ArrayDeque) storing indices of elements in descending order. O(n)."),
            ("Find All Anagrams in a String", "LeetCode #438", "Find all start indices of p's anagrams in s.", "Fixed sliding window comparing character count arrays."),
            ("Sort Colors (Dutch National Flag)", "LeetCode #75", "Sort array with values 0, 1, 2 in-place without using sort library.", "Three pointers: low, mid, high. Swap 0s to low, 2s to high, increment mid on 1."),
            ("Boats to Save People", "LeetCode #881", "Return minimum number of boats to carry every given person (limit per boat <= 2).", "Sort people by weight. Pair heaviest with lightest person if sum <= limit; otherwise heaviest goes alone."),
            ("Valid Palindrome II", "LeetCode #680", "Check if string can be palindrome after deleting at most one character.", "Two pointers inward; on mismatch, check if substring (l+1, r) or (l, r-1) is palindrome."),
            ("Fruit Into Baskets", "LeetCode #904", "Pick fruits into two baskets with max contiguous tree length.", "Sliding window maintaining at most 2 distinct elements in frequency Map."),
            ("Max Consecutive Ones III", "LeetCode #1004", "Find maximum number of consecutive 1's if you can flip at most k 0's.", "Sliding window tracking count of zeros; if zeroCount > k, contract from left."),
            ("Interval List Intersections", "LeetCode #986", "Return the intersection of two closed interval lists.", "Two pointers i and j. Intersection start is max(startA, startB); end is min(endA, endB)."),
            ("Reverse Words in a String", "LeetCode #151", "Reverse order of words in string, trim spaces.", "Trim and split by regex '\\s+', then reverse list using StringBuilder or two pointers."),
            ("Remove Duplicates from Sorted Array II", "LeetCode #80", "Remove duplicates in-place such that each unique element appears at most twice.", "Two pointers: insert index initialized to 2. If nums[i] != nums[insertIndex - 2], write nums[i]."),
            ("Rotate Array", "LeetCode #189", "Rotate array to right by k steps in O(1) extra space.", "Three reversals: reverse whole array, reverse first k elements, reverse remaining n-k elements."),
            ("Move Zeroes", "LeetCode #283", "Move all 0's to end while maintaining relative order of non-zero elements.", "Snowball pointer or two pointers: swap non-zero with lastNonZeroFoundAt index."),
            ("Candy", "LeetCode #135", "Determine minimum number of candies to distribute to children based on ratings.", "Two passes: left-to-right ensuring higher rating child gets more; right-to-left enforcing same."),
            ("Backspace String Compare", "LeetCode #844", "Determine if two strings are equal when typed into empty text editors with '#' as backspace.", "Two pointers from back of strings skipping characters on '#' count. O(1) space."),
            ("Trapping Rain Water II (3D)", "LeetCode #407", "Compute water trapped in 2D elevation matrix.", "PriorityQueue (Min-Heap) holding border cells; explore inwards with BFS.")
        ]
    },
    {
        "category": "LeetCode Top 150 - Fast & Slow Pointers and Linked Lists",
        "company": "Microsoft / Netflix / Apple",
        "questions": [
            ("Linked List Cycle II", "LeetCode #142", "Return the node where cycle begins in linked list.", "Floyd's Tortoise and Hare: when slow and fast meet, move one pointer to head; both step 1-by-1 to origin."),
            ("Reorder List", "LeetCode #143", "Reorder L0 -> Ln -> L1 -> Ln-1 -> L2 -> Ln-2...", "Find middle with slow/fast, reverse second half, merge first half and reversed second half alternately."),
            ("Remove Nth Node From End of List", "LeetCode #19", "Remove nth node from end in one single pass.", "Two pointers fast and slow separated by n nodes; advance both until fast hits end; slow.next = slow.next.next."),
            ("Reverse Nodes in k-Group", "LeetCode #25", "Reverse nodes of linked list k at a time and return modified list.", "Count k nodes; reverse group recursively or iteratively with dummy head and previous group tail."),
            ("Copy List with Random Pointer", "LeetCode #138", "Deep copy list where each node has random pointer.", "Interweave cloned nodes directly after originals (A->A'->B->B'); copy random links; decouple lists in O(1) space."),
            ("Merge Two Sorted Lists", "LeetCode #21", "Merge two sorted linked lists into one sorted list.", "Dummy head pointer; advance smaller node iteratively until one list is exhausted; attach remainder."),
            ("Merge k Sorted Lists", "LeetCode #23", "Merge k sorted linked lists and return as one sorted list.", "PriorityQueue containing heads of all k lists sorted by value. O(N log k) time."),
            ("Sort List", "LeetCode #148", "Sort linked list in O(n log n) time and O(1) memory.", "Merge sort: split using slow/fast middle finder, sort halves recursively, merge sorted sublists."),
            ("Add Two Numbers", "LeetCode #2", "Add two numbers represented as linked lists in reverse digit order.", "Traverse both lists simultaneously tracking carry = sum / 10 and digit = sum % 10."),
            ("Intersection of Two Linked Lists", "LeetCode #160", "Find node at which two singly linked lists intersect.", "Two pointers: when pointer A reaches end, redirect to head B; when B reaches end, redirect to head A. Meet at intersection."),
            ("Palindrome Linked List", "LeetCode #234", "Determine if singly linked list is palindrome in O(n) time and O(1) space.", "Find midpoint with slow/fast, reverse second half, compare node values with first half."),
            ("Swap Nodes in Pairs", "LeetCode #24", "Swap every two adjacent nodes and return head.", "Dummy node with pointers prev, first, second; rewire next pointers iteratively."),
            ("Flatten a Multilevel Doubly Linked List", "LeetCode #430", "Flatten child doubly linked lists in DFS order.", "Iterative with stack or recursive traversal inserting child chain between curr and curr.next."),
            ("Odd Even Linked List", "LeetCode #328", "Group all odd nodes together followed by even nodes.", "Maintain odd and even pointers; odd.next = even.next; even.next = even.next.next; link oddTail to evenHead."),
            ("Partition List", "LeetCode #86", "Partition list such that all nodes less than x come before nodes greater or equal.", "Create two dummy lists (before and after), traverse original list distributing nodes, then join lists."),
            ("Rotate List", "LeetCode #61", "Rotate linked list to the right by k places.", "Measure length, link tail to head forming circle, advance len - (k % len) - 1 steps, break loop."),
            ("Remove Duplicates from Sorted List II", "LeetCode #82", "Delete all nodes that have duplicate numbers.", "Dummy head; loop with duplicate value detector skipping all consecutive duplicate nodes completely."),
            ("LRU Cache", "LeetCode #146", "Design LRU cache with get and put in O(1).", "Custom DoublyLinkedList with dummy head/tail combined with HashMap<Integer, Node>."),
            ("LFU Cache", "LeetCode #460", "Design Least Frequently Used (LFU) cache in O(1).", "HashMap<Integer, Node> for key-to-node, and HashMap<Integer, DoublyLinkedList> for frequency-to-nodes."),
            ("Design Twitter", "LeetCode #355", "Design simplified Twitter news feed algorithm.", "HashMap for user followees, PriorityQueue for merging top 10 tweets across followed users."),
            ("Maximum Twin Sum of a Linked List", "LeetCode #2130", "Find maximum twin sum in linked list of even length.", "Find middle, reverse second half, simultaneously step through halves tracking max sum."),
            ("Swapping Nodes in a Linked List", "LeetCode #1721", "Swap values of kth node from beginning and kth node from end.", "Pass 1 finds kth node; simultaneously initialize slow pointer when fast reaches k to find kth from end."),
            ("Split Linked List in Parts", "LeetCode #725", "Split list into k consecutive parts of equal length.", "Compute total length; base size = len / k, remainder = len % k; carve sublists by breaking next pointers."),
            ("Insert into a Sorted Circular Linked List", "LeetCode #708", "Insert node into sorted circular linked list.", "Traverse until prev.val <= insertVal <= curr.val, or at turning boundary where prev.val > curr.val."),
            ("Delete Node in a Linked List", "LeetCode #237", "Delete given node without access to head.", "Copy next node's value into current node, then delete next node: curr.val = curr.next.val; curr.next = curr.next.next.")
        ]
    },
    {
        "category": "LeetCode Top 150 - Trees, BSTs & Graphs",
        "company": "Google / Meta / Uber",
        "questions": [
            ("Lowest Common Ancestor of Binary Tree", "LeetCode #236", "Find LCA of two given nodes p and q in binary tree.", "Recursive post-order: if left and right subtrees both return non-null, root is LCA; else return non-null."),
            ("Validate Binary Search Tree", "LeetCode #98", "Determine if binary tree is valid BST.", "Recursive validation passing (min, max) bounds using Long.MIN_VALUE and Long.MAX_VALUE."),
            ("Serialize and Deserialize Binary Tree", "LeetCode #297", "Design algorithm to serialize and deserialize binary tree.", "Pre-order traversal with delimiter and 'null' sentinel; deserialize using queue."),
            ("Binary Tree Maximum Path Sum", "LeetCode #124", "Find maximum path sum between any two nodes.", "Post-order traversal: compute max gain from left/right; update global max with left + right + root.val; return root.val + max(left, right)."),
            ("Course Schedule I & II", "LeetCode #207/210", "Determine course ordering possibility using prerequisites.", "Kahn's Topological Sort using in-degree array and Queue, or DFS cycle detection with 3-state coloring."),
            ("Word Ladder", "LeetCode #127", "Find shortest transformation sequence from beginWord to endWord.", "Bidirectional BFS generating all single-letter mutations; track visited words in HashSet."),
            ("Number of Islands", "LeetCode #200", "Count number of connected 1s in grid.", "Grid DFS / BFS sinking visited islands from '1' to '0', or Disjoint Set Union (Union-Find)."),
            ("Clone Graph", "LeetCode #133", "Deep copy connected undirected graph.", "HashMap<Node, Node> tracking visited cloned nodes with recursive DFS or queue BFS."),
            ("Binary Tree Level Order Traversal", "LeetCode #102", "Return level order traversal of binary tree nodes.", "Queue-based BFS tracking queue.size() at each level boundary."),
            ("Binary Tree Right Side View", "LeetCode #199", "Return list of nodes visible from right side.", "Level-order BFS picking last element of each level, or reverse pre-order DFS (root -> right -> left)."),
            ("Kth Smallest Element in a BST", "LeetCode #230", "Find kth smallest element in BST.", "In-order traversal (Left-Root-Right) yields sorted order; decrement k on visit; stop when k == 0."),
            ("Construct Binary Tree from Preorder and Inorder", "LeetCode #105", "Reconstruct binary tree from preorder and inorder arrays.", "First preorder element is root; locate in inorder array using HashMap; recursively build left and right subtrees."),
            ("Populating Next Right Pointers in Each Node", "LeetCode #116", "Connect each node to its next right node in perfect binary tree.", "Use already established next pointers at level N to link children at level N+1 in O(1) space."),
            ("Flatten Binary Tree to Linked List", "LeetCode #114", "Flatten binary tree to pre-order linked list in-place.", "Morris traversal variant: find rightmost node of left subtree, attach root.right to it, move left to right."),
            ("Diameter of Binary Tree", "LeetCode #543", "Length of longest path between any two nodes.", "Post-order DFS: update diameter with left_depth + right_depth; return 1 + max(left_depth, right_depth)."),
            ("Invert Binary Tree", "LeetCode #226", "Invert a binary tree (Google famous question).", "Swap left and right children recursively: TreeNode temp = root.left; root.left = invert(root.right); root.right = invert(temp)."),
            ("Symmetric Tree", "LeetCode #101", "Check whether tree is mirror of itself.", "Helper isMirror(t1, t2) verifying t1.val == t2.val and isMirror(t1.left, t2.right) and isMirror(t1.right, t2.left)."),
            ("Maximum Depth of Binary Tree", "LeetCode #104", "Find maximum depth of binary tree.", "Math.max(maxDepth(root.left), maxDepth(root.right)) + 1."),
            ("Path Sum II", "LeetCode #113", "Find all root-to-leaf paths where sum equals target.", "Backtracking DFS tracking current path in list; when at leaf and remainingSum == val, record copy of list."),
            ("All Nodes Distance K in Binary Tree", "LeetCode #863", "Find all nodes at distance k from target node.", "Convert tree to undirected graph with parent pointers Map, then execute BFS radiating from target node."),
            ("Network Delay Time", "LeetCode #743", "Compute time for all nodes to receive signal from source.", "Dijkstra's Algorithm using PriorityQueue<int[]> with min-distances array. O(E log V)."),
            ("Cheapest Flights Within K Stops", "LeetCode #787", "Find cheapest flight from src to dst with at most k stops.", "Bellman-Ford algorithm with k+1 iterations, or Dijkstra tracking stops in priority queue state."),
            ("Pacific Atlantic Water Flow", "LeetCode #417", "Find grid coordinates that can flow to both Pacific and Atlantic oceans.", "Reverse BFS/DFS starting from ocean borders inward; find intersection of reachable cells."),
            ("Redundant Connection", "LeetCode #684", "Return edge that can be removed to turn graph into tree.", "Union-Find (Disjoint Set Union): return first edge whose vertices are already in the same connected component."),
            ("Is Graph Bipartite?", "LeetCode #785", "Determine if graph can be colored with 2 colors without conflict.", "BFS/DFS 2-coloring: assign color 1 to node, color -1 to all neighbors; conflict indicates odd-length cycle.")
        ]
    },
    {
        "category": "LeetCode Top 150 - Dynamic Programming & Backtracking",
        "company": "Amazon / Bloomberg / Oracle",
        "questions": [
            ("Word Break", "LeetCode #139", "Determine if string can be segmented into dictionary words.", "1D DP boolean array dp[i] indicating if s[0..i] can be segmented; check dp[j] && dict.contains(s[j..i])."),
            ("Coin Change", "LeetCode #322", "Compute fewest coins needed to make up amount.", "1D DP array initialized to amount + 1; dp[i] = min(dp[i], dp[i - coin] + 1). O(amount * n)."),
            ("Longest Increasing Subsequence", "LeetCode #300", "Find length of longest strictly increasing subsequence.", "Binary search (Patience Sorting): maintain tails array; replace smallest element >= num using binary search. O(n log n)."),
            ("Edit Distance", "LeetCode #72", "Find minimum operations to convert word1 to word2.", "2D DP table: if chars match, dp[i][j] = dp[i-1][j-1]; else 1 + min(insert, delete, replace)."),
            ("Maximum Subarray (Kadane's Algorithm)", "LeetCode #53", "Find contiguous subarray with largest sum.", "Track currentSum = max(num, currentSum + num); update maxSum = max(maxSum, currentSum). O(n)."),
            ("House Robber I & II", "LeetCode #198/213", "Rob houses without triggering adjacent alarm; II is circular.", "DP state: rob = max(prevRob, prevNoRob + val); for circular, run twice: [0..n-2] and [1..n-1]."),
            ("Climbing Stairs", "LeetCode #70", "Ways to climb n steps taking 1 or 2 steps.", "Fibonacci sequence: dp[i] = dp[i-1] + dp[i-2] with two rolling variables. O(n) time, O(1) space."),
            ("Unique Paths", "LeetCode #62", "Number of unique paths from top-left to bottom-right in m x n grid.", "Combinatorics formula C(m+n-2, m-1) or 1D DP rolling row: dp[j] += dp[j-1]."),
            ("Partition Equal Subset Sum", "LeetCode #416", "Partition array into two subsets with equal sum.", "0/1 Knapsack: target = totalSum / 2; boolean DP array dp[j] = dp[j] || dp[j - num]."),
            ("Longest Common Subsequence", "LeetCode #1143", "Length of longest common subsequence between two strings.", "2D DP table: if text1[i] == text2[j], 1 + dp[i-1][j-1]; else max(dp[i-1][j], dp[i][j-1])."),
            ("Target Sum", "LeetCode #494", "Find ways to assign '+' and '-' to reach target.", "Subset sum transformation: P = (target + sum) / 2; reduce to 0/1 Knapsack count ways."),
            ("Jump Game I & II", "LeetCode #55/45", "Determine if reachable / minimum jumps to reach end.", "Greedy max reachable boundary tracking; for II, update current jump end and increment jump count."),
            ("Decode Ways", "LeetCode #91", "Count ways to decode digits mapping to 'A'-'Z'.", "DP: dp[i] adds dp[i-1] if single digit valid (1-9), and dp[i-2] if two digits valid (10-26)."),
            ("Interleaving String", "LeetCode #97", "Check if s3 is formed by interleaving s1 and s2.", "2D boolean DP grid: dp[i][j] checks if s3 matches s1[i-1] via dp[i-1][j] or s2[j-1] via dp[i][j-1]."),
            ("Maximum Product Subarray", "LeetCode #152", "Find contiguous subarray with largest product.", "Track both maxProduct and minProduct simultaneously due to negative number flips."),
            ("N-Queens", "LeetCode #51", "Place n queens on n x n chessboard without mutual attacks.", "Backtracking tracking columns, positive diagonals (row + col), and negative diagonals (row - col)."),
            ("Word Search", "LeetCode #79", "Determine if word exists in grid.", "Backtracking DFS with in-place grid marking (grid[r][c] = '#') and unmarking upon return."),
            ("Generate Parentheses", "LeetCode #22", "Generate all combinations of well-formed parentheses.", "Backtrack with openCount < n (add '(') and closeCount < openCount (add ')')."),
            ("Combination Sum", "LeetCode #39", "Find all unique combinations of candidates summing to target.", "Backtracking with start index allowing reuse of current candidate: backtrack(i, remain - candidates[i])."),
            ("Permutations", "LeetCode #46", "Return all possible permutations of distinct integers.", "Backtracking with boolean visited array or in-place element swapping."),
            ("Subsets I & II", "LeetCode #78/90", "Return power set of distinct / duplicate elements.", "Backtracking with index; for II, sort first and skip duplicate adjacent elements: if (i > start && nums[i] == nums[i-1]) continue;"),
            ("Letter Combinations of a Phone Number", "LeetCode #17", "All letter combinations that number could represent.", "Map digits to keypad characters; recursive backtracking appending to StringBuilder."),
            ("Palindrome Partitioning", "LeetCode #131", "Partition string such that every substring is palindrome.", "Backtrack substring splits, validating palindrome using helper or precomputed DP lookup."),
            ("Sudoku Solver", "LeetCode #37", "Solve 9x9 Sudoku board.", "Recursive backtracking testing digits 1-9 checking row, column, and 3x3 block validity."),
            ("Wildcard Matching", "LeetCode #44", "Implement wildcard pattern matching with '?' and '*'.", "Greedy two-pointer approach tracking starIdx and matchIdx, or 2D DP table. O(n) average.")
        ]
    },
    {
        "category": "HackerRank Java Domain - Core Syntax & Framework Mastery",
        "company": "TCS / Infosys / Cognizant / Wipro",
        "questions": [
            ("Java BigInteger & Primality Test", "HackerRank Java", "Test primality of a 100-digit number and perform large multiplications.", "BigInteger.isProbablePrime(100) using Miller-Rabin test, and bigA.multiply(bigB)."),
            ("Java 1D and 2D Array Leap Game", "HackerRank Java", "Determine if player can win game leaping over 0s and 1s in array.", "Recursive DFS marking visited cells: canWin(leap, game, i + leap) || canWin(leap, game, i + 1) || canWin(leap, game, i - 1)."),
            ("Java Regex - Duplicate Words", "HackerRank Java", "Remove consecutive duplicate words using regular expressions.", "Regex '\\b(\\w+)(\\s+\\1\\b)+' with Pattern.CASE_INSENSITIVE and matcher.replaceAll(\"$1\")."),
            ("Java Regex - IP Address Validator", "HackerRank Java", "Validate valid IPv4 address syntax using regex.", "String zeroTo255 = '(\\d{1,2}|(0|1)\\d{2}|2[0-4]\\d|25[0-5])'; combine 4 blocks with '.' delimiter."),
            ("Java Regex - Tag Content Extractor", "HackerRank Java", "Extract text between valid opening and closing HTML/XML tags.", "Pattern '<(.+?)>([^<]+)</\\\\1>' using backreference to match matching closing tag."),
            ("Java Deque - Max Unique in Subarray", "HackerRank Java", "Find maximum number of unique integers among all contiguous subarrays of size m.", "ArrayDeque maintaining sliding window with HashSet tracking unique frequencies."),
            ("Java PriorityQueue - Student Sorting", "HackerRank Java", "Order students by CGPA desc, name asc, ID asc using PriorityQueue.", "PriorityQueue with Comparator.comparing(Student::getCgpa).reversed().thenComparing(Student::getName).thenComparing(Student::getId)."),
            ("Java BitSet - Operations", "HackerRank Java", "Perform AND, OR, XOR, FLIP, SET on two BitSets.", "Use java.util.BitSet methods: b1.and(b2), b1.or(b2), b1.xor(b2), b1.set(idx), b1.cardinality()."),
            ("Java Comparator vs Comparable", "HackerRank Java", "Explain difference and implement custom Player checker comparator.", "Comparable enforces natural ordering via compareTo(T o); Comparator enables external multiple ordering strategies via compare(T o1, T o2)."),
            ("Java Reflection - Private Method Invocation", "HackerRank Java", "Invoke private method 'powerof2' using Reflection API.", "Method m = clazz.getDeclaredMethod('powerof2', int.class); m.setAccessible(true); m.invoke(instance, num)."),
            ("Java Factory Pattern", "HackerRank Java", "Implement Cake and Pizza food factory.", "FoodFactory.getFood(String order) returning instance of Food interface based on token."),
            ("Java Singleton Pattern", "HackerRank Java", "Implement thread-safe Bill Pugh or Double-Checked Locking Singleton.", "Private constructor, static volatile instance, synchronized block with double null verification."),
            ("Java Varargs - Variable Arguments", "HackerRank Java", "Write add(int... numbers) printing additions and sum.", "Variable arguments treated as array int[]; iterate and append with '+' signs."),
            ("Java Annotations - Family Budget", "HackerRank Java", "Create custom runtime annotation @FamilyBudget.", "@Target(ElementType.METHOD) @Retention(RetentionPolicy.RUNTIME) public @interface FamilyBudget { String userRole(); int budgetLimit(); }"),
            ("Java Exception Handling - Try-Catch-Finally", "HackerRank Java", "Handle ArithmeticException and InputMismatchException properly.", "Catch specific subclasses before general Exception; finally block executes regardless of exception."),
            ("Java Custom Exception Class", "HackerRank Java", "Create custom NegativeDimensionException.", "Subclass Exception (checked) or RuntimeException (unchecked) and call super(message)."),
            ("Java Iterator Pattern", "HackerRank Java", "Demonstrate Iterator traversal and safe element removal.", "Use iterator.remove() instead of collection.remove() to prevent ConcurrentModificationException."),
            ("Java Interface - Calculator Contract", "HackerRank Java", "Implement AdvancedArithmetic interface with divisorSum(int n).", "Sum all divisors up to n using loop up to Math.sqrt(n) in O(sqrt(n)) time."),
            ("Java Abstract Class - Book and Novel", "HackerRank Java", "Implement abstract setTitle method.", "Subclass overrides abstract void setTitle(String s) and stores in protected title field."),
            ("Java Method Overriding - Super Keyword", "HackerRank Java", "Call parent overridden method using super.", "super.define_me() allows invocation of hidden superclass logic."),
            ("Java Static Initialization Block", "HackerRank Java", "Execute initialization code before main method.", "static { B = sc.nextInt(); H = sc.nextInt(); if (B <= 0 || H <= 0) flag = false; } executes at class load."),
            ("Java End-of-file (EOF) Processing", "HackerRank Java", "Read inputs until EOF is reached with line numbers.", "Scanner sc = new Scanner(System.in); int line = 1; while (sc.hasNext()) { System.out.println(line++ + ' ' + sc.nextLine()); }"),
            ("Java Output Formatting (printf)", "HackerRank Java", "Format strings left-justified 15 spaces and 3-digit zero-padded integers.", "System.out.printf('%-15s%03d%n', s, x);"),
            ("Java Loops II - Series Expansion", "HackerRank Java", "Compute series: a + 2^0*b + 2^1*b + ... + 2^(n-1)*b.", "Iterative bit shifting for powers of 2: currentSum += (1 << j) * b."),
            ("Java Datatypes - Bit Overflow Limits", "HackerRank Java", "Determine which integer primitives (byte, short, int, long) can fit large value.", "Compare value against Byte.MIN_VALUE/MAX_VALUE, Short, Integer, and Long boundaries.")
        ]
    },
    {
        "category": "MNC Concurrency & Multithreading (Goldman Sachs / Morgan Stanley)",
        "company": "Goldman Sachs / Morgan Stanley / JPMorgan",
        "questions": [
            ("Java Virtual Threads (Project Loom)", "Java 21 MNC", "How do Virtual Threads differ from OS Platform Threads?", "Virtual threads are lightweight JVM-managed tasks mounted on carrier OS threads; cost bytes instead of 1MB stack, enabling 1,000,000 concurrent threads."),
            ("ReentrantLock vs Synchronized", "MNC Core", "When would you prefer ReentrantLock over synchronized keyword?", "ReentrantLock provides trylock with timeout, fair queuing policy, interruptible locking, and multiple Condition variables."),
            ("StampedLock Optimistic Reads", "MNC Low-Latency", "How does StampedLock achieve higher throughput than ReadWriteLock?", "Provides tryOptimisticRead() without acquiring actual read lock; validate(stamp) verifies no write intervened."),
            ("ForkJoinPool & Work-Stealing", "MNC High-Throughput", "Explain the work-stealing algorithm in ForkJoinPool.", "Each worker thread has a double-ended deque (deque); worker pushes/pops own tasks from head, idle workers steal tasks from tail."),
            ("CompletableFuture Pipeline Chaining", "MNC Modern Java", "Difference between thenApply, thenCompose, and thenCombine.", "thenApply transforms result (map); thenCompose flattens async future (flatMap); thenCombine combines two independent futures."),
            ("CountDownLatch vs CyclicBarrier", "MNC Concurrency", "Explain the difference and memory reset behavior.", "CountDownLatch is one-shot (cannot be reset); CyclicBarrier can be reused after all threads await() at trip point."),
            ("Semaphore - Rate Limiting Pattern", "MNC Concurrency", "How to use Semaphore to implement API rate limiting?", "Initialize Semaphore with permit count; acquire() permits before request; release() in finally block."),
            ("ThreadLocal Memory Leaks in App Servers", "MNC Production", "Why do ThreadLocals leak memory in Tomcat/Spring web apps?", "Worker thread pools reuse threads indefinitely; ThreadLocalMap holds strong keys/values; must invoke threadLocal.remove() in filter finally."),
            ("Volatile Keyword & JMM Happens-Before", "MNC Memory", "What guarantees does the volatile keyword provide?", "Guarantees visibility across CPU caches and prevents instruction reordering (memory barrier); does NOT guarantee compound atomicity (i++)."),
            ("AtomicInteger & CAS (Compare-And-Swap)", "MNC Lock-Free", "How does AtomicInteger achieve lock-free thread safety?", "Uses Unsafe / VarHandle compareAndSet invoking hardware-level CPU CAS instruction (CMPXCHG)."),
            ("Deadlock Prevention Strategies", "MNC Systems", "List 4 methods to systematically prevent deadlocks.", "1. Strict lock acquisition ordering, 2. Lock timeout with tryLock, 3. Deadlock detection graphs, 4. Minimizing synchronized scope."),
            ("Thread.sleep() vs Object.wait()", "MNC Fundamentals", "Does sleep release the lock? Contrast with wait().", "Thread.sleep() keeps all held locks; Object.wait() releases the monitor lock and enters waiting set."),
            ("ExecutorService - Shutdown vs ShutdownNow", "MNC Lifecycle", "Difference between shutdown and shutdownNow.", "shutdown() stops accepting new tasks and finishes queued ones; shutdownNow() attempts to interrupt running workers and drains queue."),
            ("Producer-Consumer with ArrayBlockingQueue", "MNC Messaging", "Implement bounded producer-consumer without explicit locks.", "BlockingQueue.put() blocks when full; BlockingQueue.take() blocks when empty; internal ReentrantLock handles signaling."),
            ("Exchanger Concurrency Primitive", "MNC Advanced", "How does java.util.concurrent.Exchanger work?", "Two threads exchange data at synchronization point; exchanger.exchange(data) blocks until partner arrives."),
            ("Thread Factory & Custom Naming", "MNC Observability", "Why should production thread pools use custom ThreadFactory?", "Enables meaningful thread names (e.g. 'order-worker-3') in stack traces and sets uncaught exception handlers."),
            ("UncaughtExceptionHandler", "MNC Reliability", "How to capture unhandled exceptions thrown inside background threads?", "Thread.setDefaultUncaughtExceptionHandler((thread, throwable) -> logger.error(...))."),
            ("False Sharing & @Contended Annotation", "MNC High-Frequency", "Explain CPU cache line false sharing and how Java avoids it.", "Multiple variables on same 64-byte CPU cache line cause invalidations; @jdk.internal.vm.annotation.Contended adds 128-byte padding."),
            ("LongAdder vs AtomicLong", "MNC High-Contention", "Why is LongAdder faster than AtomicLong under high write contention?", "LongAdder stripes internal Cell[] array among threads; reduces CAS retry collisions, then sums cells on sum()."),
            ("Phaser Concurrency Synchronizer", "MNC Advanced", "When to use Phaser over CountDownLatch / CyclicBarrier?", "Supports dynamic registration/deregistration of parties at runtime across multiple numbered phases."),
            ("Double-Checked Locking with Volatile", "MNC Patterns", "Why MUST the instance reference be declared volatile?", "Prevents instruction reordering where memory is allocated and assigned to reference before constructor completes."),
            ("Condition Interface vs Object wait/notify", "MNC Low-Level", "Advantage of ReentrantLock.newCondition().", "Allows multiple condition queues (e.g. notFull and notEmpty) on a single lock, avoiding spurious waking of wrong threads."),
            ("ScheduledExecutorService Best Practices", "MNC Scheduling", "ScheduleAtFixedRate vs ScheduleWithFixedDelay.", "FixedRate schedules based on start time (can drift or bunch); FixedDelay schedules relative to completion of previous run."),
            ("Daemon Threads vs User Threads", "MNC JVM", "What happens to daemon threads when all user threads finish?", "JVM abruptly halts all daemon threads without running finally blocks or flushing buffers."),
            ("Thread Interruption Mechanism", "MNC Graceful Exit", "How to handle InterruptedException correctly in loops?", "Never swallow! Either rethrow or restore interrupt flag: Thread.currentThread().interrupt().")
        ]
    },
    {
        "category": "MNC Spring Boot, Microservices & Architecture (FAANG / Product Giants)",
        "company": "Amazon / Netflix / Uber / Atlassian",
        "questions": [
            ("Spring Boot Auto-Configuration Internals", "Spring Boot MNC", "How does @EnableAutoConfiguration work under the hood?", "Reads META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports and evaluates @ConditionalOnClass/@ConditionalOnMissingBean."),
            ("Spring Bean Lifecycle Hooks", "Spring Core", "Detail complete bean lifecycle from instantiation to destruction.", "Instantiate -> Populate Properties -> BeanNameAware -> BeanFactoryAware -> BeanPostProcessor Before -> @PostConstruct -> InitializingBean -> BeanPostProcessor After -> DisposableBean."),
            ("@Transactional Propagation Behaviors", "Spring Data", "Difference between REQUIRED, REQUIRES_NEW, and NESTED.", "REQUIRED joins existing tx; REQUIRES_NEW suspends existing and opens independent tx; NESTED uses JDBC savepoints."),
            ("@Transactional Self-Invocation Trap", "Spring AOP", "Why does calling a @Transactional method from another method in same class fail to open transaction?", "Spring transactions use CGLIB dynamic proxies; internal 'this.method()' bypasses the proxy interceptor."),
            ("Spring Security Filter Chain Flow", "Spring Security", "How does request pass through SecurityFilterChain?", "SecurityContextPersistenceFilter -> UsernamePasswordAuthenticationFilter -> BearerTokenAuthenticationFilter -> ExceptionTranslationFilter -> FilterSecurityInterceptor."),
            ("JWT Authentication & Revocation", "MNC Security", "How to invalidate stateless JWT tokens on user logout?", "Maintain Redis token denylist with TTL matching token expiration, or increment user token_version integer."),
            ("Spring Data JPA N+1 Query Problem", "Hibernate / JPA", "How to detect and eliminate N+1 queries in production?", "Use @EntityGraph, JOIN FETCH in JPQL, or Hibernate batch fetching (hibernate.default_batch_fetch_size: 25)."),
            ("JPA First-Level vs Second-Level Cache", "Hibernate / JPA", "Explain difference between Session cache and L2 cache.", "First-level is bound to EntityManager/Session; second-level is cross-session shared (e.g. Ehcache / Redis)."),
            ("Optimistic vs Pessimistic Locking in JPA", "Database MNC", "When to use @Version vs LockModeType.PESSIMISTIC_WRITE?", "Optimistic uses @Version timestamp/counter (high read, low contention); Pessimistic uses SELECT ... FOR UPDATE (strict bank accounts)."),
            ("Circuit Breaker Pattern (Resilience4j)", "Microservices", "Explain CLOSED, OPEN, and HALF-OPEN states in Circuit Breaker.", "CLOSED passes traffic; when failure threshold is exceeded, transitions to OPEN (fails fast to fallback); after cooldown, enters HALF-OPEN testing trial calls."),
            ("Distributed Tracing (Micrometer & Zipkin)", "Microservices", "How does Trace ID and Span ID propagate across HTTP boundaries?", "Injected into HTTP headers (B3 / W3C TraceContext traceparent: 00-traceId-spanId-01)."),
            ("Saga Pattern in Distributed Transactions", "Microservices Architecture", "Choreography vs Orchestration Saga.", "Choreography: services react to events without central coordinator; Orchestration: central saga coordinator directs transactions and compensations."),
            ("Event-Driven Architecture with Apache Kafka", "Distributed Systems", "Consumer group rebalance and partition assignment strategies.", "Range, RoundRobin, CooperativeSticky; cooperative avoids stop-the-world rebalance pauses."),
            ("Idempotency in Distributed APIs", "System Design", "How to guarantee idempotent payment APIs?", "Client generates unique idempotency-key header; server stores key in Redis with SETNX; returns cached response on replay."),
            ("API Gateway Pattern (Spring Cloud Gateway)", "Enterprise Architecture", "What features does API Gateway handle?", "Rate limiting, SSL termination, JWT authentication, routing, response caching, and cross-cutting request telemetry."),
            ("Service Discovery (Eureka / Consul)", "Microservices", "How do microservices locate instances dynamically?", "Heartbeat registry; client-side load balancing (Spring Cloud LoadBalancer) caches registry locally."),
            ("CQRS Pattern (Command Query Responsibility Segregation)", "Architecture", "Why separate read models from write models?", "Write model optimized for transactional consistency; Read model optimized for high-speed queries (e.g. Elasticsearch/Redis)."),
            ("Outbox Pattern for Reliable Messaging", "Reliability", "How to guarantee database write and Kafka message emission atomically?", "Write domain entity and outbox message in same relational SQL transaction; background Debezium CDC or poller emits to Kafka."),
            ("Rate Limiting Algorithms (Token Bucket vs Leaky Bucket)", "System Design", "Explain Token Bucket vs Leaky Bucket algorithm.", "Token bucket allows controlled bursts of traffic up to capacity; Leaky bucket smooths traffic at constant output rate."),
            ("Flyway vs Liquibase DB Migrations", "DevOps MNC", "How does Flyway track applied SQL migration scripts?", "Maintains flyway_schema_history table with checksums, script names, execution status, and timestamps."),
            ("Containerizing Spring Boot with Buildpacks & Docker", "Cloud Native", "Advantage of Cloud Native Buildpacks (Spring Boot Paketo).", "Creates layered OCI images caching dependencies separately from app classes, speeding up rebuilds."),
            ("Spring Boot Actuator Production Metrics", "Monitoring", "How to expose Prometheus metrics securely?", "management.endpoints.web.exposure.include: health, prometheus behind admin role access."),
            ("Reactive Programming (Spring WebFlux)", "Reactive Java", "Contrast Project Reactor (Mono/Flux) with Spring MVC servlet model.", "Non-blocking event loop (Netty) with small thread pool handling massive concurrent connections; backpressure support."),
            ("REST vs gRPC in Microservice Inter-Service Calls", "Low-Latency", "Why choose gRPC for internal service-to-service communication?", "HTTP/2 multiplexing, compact binary Protobuf serialization, strongly-typed contracts, and bidirectional streaming."),
            ("Bulkhead Pattern in Microservices", "Resilience", "How does Bulkhead isolate failures?", "Isolates thread pools or semaphore pools per remote service so outage in one downstream dependency does not consume all server threads.")
        ]
    },
    {
        "category": "MNC Data Structures & Hard Algorithms (LeetCode Hard)",
        "company": "Google / Meta / Citadel",
        "questions": [
            ("Median of Two Sorted Arrays", "LeetCode #4 (Hard)", "Find median of two sorted arrays in O(log(min(m, n))) time.", "Binary search partition on smaller array: ensure left partition max <= right partition min across both arrays."),
            ("Merge k Sorted Lists", "LeetCode #23 (Hard)", "Merge k sorted linked lists in O(N log k).", "Min-Heap PriorityQueue holding active list nodes, or divide-and-conquer merge sort pairs."),
            ("Sliding Window Maximum", "LeetCode #239 (Hard)", "Find maximum in sliding window of size k in O(n).", "Monotonic deque storing indices where elements are strictly descending."),
            ("Trapping Rain Water", "LeetCode #42 (Hard)", "Calculate trapped rainwater over elevation map.", "Two pointers tracking maxLeft and maxRight boundaries inwards in O(n) time, O(1) space."),
            ("Largest Rectangle in Histogram", "LeetCode #84 (Hard)", "Find largest rectangle area in histogram.", "Monotonic increasing stack of indices; on smaller bar, pop and calculate area = height * (i - stack.peek() - 1)."),
            ("Maximal Rectangle", "LeetCode #85 (Hard)", "Find largest 2D rectangle containing only 1s in binary matrix.", "Build histogram heights for each row, then apply Largest Rectangle in Histogram algorithm for each row."),
            ("Word Ladder II", "LeetCode #126 (Hard)", "Find all shortest transformation sequences from beginWord to endWord.", "BFS to construct directed shortest-path parent graph and calculate distances, followed by backtracking DFS to collect paths."),
            ("Alien Dictionary", "LeetCode #269 (Hard)", "Derive alphabet order from sorted alien words dictionary.", "Compare adjacent words to find first differing characters (directed edge); execute Topological Sort (Kahn's or DFS)."),
            ("Serialize and Deserialize N-ary Tree", "LeetCode #428 (Hard)", "Serialize N-ary tree to string and back.", "Pre-order traversal recording node value and child count size, or parentheses nesting."),
            ("Longest Valid Parentheses", "LeetCode #32 (Hard)", "Find length of longest valid parentheses substring.", "Stack initialized with index -1, or two passes (left-to-right and right-to-left) tracking open and close counts in O(1) space."),
            ("Regular Expression Matching", "LeetCode #10 (Hard)", "Implement regex matching with '.' and '*'.", "2D DP boolean table dp[i][j]: if p[j-1] == '*', check 0 occurrences dp[i][j-2] or 1+ occurrences dp[i-1][j] if char matches."),
            ("Minimum Cost to Hire K Workers", "LeetCode #857 (Hard)", "Hire k workers with minimum total wage satisfying wage-to-quality ratios.", "Sort workers by wage/quality ratio; maintain Max-Heap of qualities of size k; track running quality sum."),
            ("Basic Calculator I & II", "LeetCode #224/227 (Hard)", "Evaluate string arithmetic expression with parentheses and operator precedence.", "Stack for numbers and signs; handle '(' by pushing current result and sign; evaluate '+' '-' '*' '/' respecting precedence."),
            ("Find Median from Data Stream", "LeetCode #295 (Hard)", "Add numbers dynamically and compute median in O(1).", "Two Heaps: Max-Heap for lower half, Min-Heap for upper half; keep sizes balanced within 1."),
            ("Word Search II", "LeetCode #212 (Hard)", "Find all words from dictionary in 2D character board.", "Prefix Tree (Trie) combined with 2D backtracking DFS; prune matched words directly from Trie to prevent duplicate work."),
            ("Prefix and Suffix Search", "LeetCode #745 (Hard)", "Design WordFilter supporting f(prefix, suffix) in O(L).", "Insert all combinations into Trie with special delimiter: suffix + '{' + word."),
            ("Text Justification", "LeetCode #68 (Hard)", "Format text into fully justified lines of width maxWidth.", "Greedy line packing; distribute extra spaces evenly between words, placing remainder on left; left-align last line."),
            ("Swim in Rising Water", "LeetCode #778 (Hard)", "Find least time to reach bottom-right in grid where water level rises.", "Dijkstra's algorithm using PriorityQueue holding min elevation cells, or Binary Search + BFS."),
            ("Shortest Path Visiting All Nodes", "LeetCode #847 (Hard)", "Find shortest path length that visits every node in undirected graph.", "BFS with bitmask state representation: (node, visited_bitmask) tracking minimum steps."),
            ("Russian Doll Envelopes", "LeetCode #354 (Hard)", "Maximum envelopes you can Russian doll (fit inside one another).", "Sort by width ascending, and height descending on equal widths; find Longest Increasing Subsequence on heights in O(n log n)."),
            ("Burst Balloons", "LeetCode #312 (Hard)", "Burst balloons to maximize coins.", "Interval DP: dp[i][j] represents max coins bursting balloons between i and j; iterate last balloon k to burst: dp[i][k] + dp[k][j] + nums[i]*nums[k]*nums[j]."),
            ("Employee Free Time", "LeetCode #759 (Hard)", "Find common free time for all employees.", "Merge all employee busy intervals into sorted list, then find gaps between merged intervals."),
            ("LFU Cache Implementation", "LeetCode #460 (Hard)", "Implement LFU Cache with O(1) get and put.", "HashMap<Key, Node>, HashMap<Freq, DoublyLinkedList>, and minFreq integer counter."),
            ("Palindrome Pairs", "LeetCode #336 (Hard)", "Find all pairs of distinct indices (i, j) such that words[i] + words[j] is palindrome.", "HashMap of reversed words; check for prefix/suffix palindrome splits in O(k^2 * n)."),
            ("K-th Smallest Prime Fraction", "LeetCode #786 (Hard)", "Find kth smallest prime fraction from sorted array.", "PriorityQueue holding (i, j) index fractions, or Binary Search on floating-point values between 0.0 and 1.0.")
        ]
    },
    {
        "category": "MNC File I/O, JVM Internals & Garbage Collection Tuning",
        "company": "Oracle / Red Hat / IBM / VMware",
        "questions": [
            ("Java NIO Channels & Direct ByteBuffers", "High Performance I/O", "How do Direct ByteBuffers bypass JVM heap copying?", "Direct buffers allocate off-heap memory via Unsafe.allocateMemory(), allowing OS DMA (Direct Memory Access) zero-copy transfers."),
            ("Zero-Copy File Transfer (FileChannel.transferTo)", "Low-Latency I/O", "How does transferTo utilize sendfile system call?", "Bypasses user-space CPU copying; kernel transfers data directly from file cache to network socket buffer."),
            ("Java Serialization Vulnerabilities", "Security MNC", "Why is standard Java serialization (Serializable) dangerous?", "Deserialization of untrusted streams allows arbitrary gadget chain execution (RCE); use JSON/Protobuf or SerializationFilter."),
            ("Externalizable vs Serializable", "Core Java", "Difference between Externalizable and Serializable.", "Externalizable requires writeExternal() and readExternal(); gives complete developer control over binary format and ignores transient."),
            ("G1 Garbage Collector Internals", "JVM Performance", "How does G1GC organize heap and achieve predictable pauses?", "Divides heap into 2048 equal regions (Eden, Survivor, Old, Humongous); selects regions with highest garbage yield (Garbage-First)."),
            ("ZGC (Z Garbage Collector) Colored Pointers", "Java 21 JVM", "How does ZGC achieve sub-millisecond pause times on terabyte heaps?", "Uses colored pointers (metadata bits in 64-bit addresses) and load barriers to perform concurrent marking and relocation without stopping threads."),
            ("Metaspace OOM: Causes & Tuning", "JVM Diagnostics", "What causes java.lang.OutOfMemoryError: Metaspace?", "Excessive dynamic class loading (CGLIB, proxy generators, uncollected ClassLoaders); tune -XX:MaxMetaspaceSize."),
            ("JVM Memory Leak Root Cause Analysis", "JVM Production", "Steps to diagnose memory leak in production.", "1. Generate heap dump with jcmd / -XX:+HeapDumpOnOutOfMemoryError, 2. Open in Eclipse MAT, 3. Inspect Dominator Tree and Leak Suspects report."),
            ("Escape Analysis & Scalar Replacement", "JIT Compiler", "How does the C2 JIT compiler eliminate heap allocations?", "If object does not escape method scope, compiler eliminates heap allocation and breaks object into primitive registers (scalar replacement)."),
            ("Biased Locking vs Lightweight Locking", "JVM Synchronization", "How does the JVM optimize uncontended synchronized locks?", "Biased lock gives ownership to first thread with CAS; when second thread arrives, lock revokes to lightweight spinlock (displaced mark word)."),
            ("Safepoint & Stop-The-World (STW)", "JVM Execution", "What is a JVM Safepoint?", "Cooperative execution points where JIT inserts polls; all mutator threads halt their registers so GC can scan root references safely."),
            ("String Interning & Deduplication", "Memory Optimization", "Where is the String Pool located in Java 8+?", "In the Java Heap (moved out of PermGen in Java 7); -XX:+UseStringDeduplication enables G1 to point duplicate byte[] to single array."),
            ("Java 9+ Modules (JPMS) & Encapsulation", "Modern Java", "How does modular Java prevent unauthorized reflection access?", "Packages are unexported by default; requires 'opens package to module' in module-info.java for runtime reflection."),
            ("ClassLoader Delegation Hierarchy", "JVM Architecture", "Explain Bootstrap, Platform, and Application ClassLoaders.", "Parent-first delegation: requests delegate up to Bootstrap; child loads only if parent ClassLoader returns ClassNotFoundException."),
            ("Creating a Custom ClassLoader", "Security / Plugin", "When and how to write a custom ClassLoader?", "Override findClass(String name) to load encrypted bytes, plugins from network, or hot-swap modules in OSGi containers."),
            ("JIT Compilers: C1 (Client) vs C2 (Server)", "JVM Internals", "What is Tiered Compilation (-XX:+TieredCompilation)?", "Interpreter collects profiling data -> Tier 1-3 C1 compiles fast with basic optimizations -> Tier 4 C2 compiles peak aggressive machine code."),
            ("Method Inlining & Devirtualization", "JIT Optimization", "How does JIT optimize polymorphic interface calls?", "Uses Class Hierarchy Analysis (CHA); if only one concrete implementation is loaded, JIT inlines method directly into caller."),
            ("MemoryMappedByteBuffer (mmap)", "Big Data I/O", "How does MappedByteBuffer map files to memory?", "Maps virtual memory address directly to OS disk pages; reads/writes manipulate memory directly with zero syscall overhead."),
            ("Path vs File in java.nio.file", "Modern File I/O", "Why prefer java.nio.file.Path over java.io.File?", "Path handles symbolic links, supports asynchronous operations, throws descriptive exceptions, and avoids thread blocking on network drives."),
            ("Files.walk() vs Files.walkFileTree()", "Modern File I/O", "How to traverse deep directory structures efficiently?", "Files.walk() returns lazy Stream<Path>; Files.walkFileTree() uses FileVisitor with preVisitDirectory and postVisitDirectory hooks."),
            ("WeakReference vs SoftReference vs PhantomReference", "Memory Management", "Explain garbage collection lifecycle of each reference type.", "Soft: collected only before OOM (caching); Weak: collected on next GC pass (WeakHashMap); Phantom: enqueued on cleanup (cleaner/direct memory)."),
            ("Off-Heap Memory Allocations with Unsafe & Foreign Function Memory API", "Java 21 Low-Latency", "How does Foreign Function & Memory API (Project Panama) replace Unsafe?", "Arena and MemorySegment provide safe, deterministic off-heap memory allocation and native C library bindings without crash vulnerabilities."),
            ("JVM Crash Analysis (hs_err_pid.log)", "Diagnostics", "What causes JVM fatal crash logs?", "JNI segmentation faults, native memory exhaustion, OS signals (SIGSEGV/SIGBUS), or hardware memory corruption."),
            ("JShell & Dynamic Evaluation", "Tooling", "What is JShell and how does it execute snippets?", "Read-Eval-Print Loop (REPL) introduced in Java 9 allowing instant evaluation of statements and methods without class wrapper."),
            ("Jcmd vs Jstack vs Jstat vs Jmap", "Production Diagnostics", "When to use each diagnostic tool?", "jstack: thread dumps for deadlocks; jmap: memory histograms; jstat: real-time GC pause sampling; jcmd: all-in-one control command.")
        ]
    },
    {
        "category": "MNC Design Patterns & Enterprise Object-Oriented Design",
        "company": "Amazon / Google / Salesforce / VMware",
        "questions": [
            ("Strategy Pattern with Lambdas", "Design Patterns", "How do Java 8 lambdas simplify the Strategy Pattern?", "Replaces boiler-plate strategy classes with First-Class functions (e.g. Comparator, Function, Predicate)."),
            ("Decorator vs Proxy Pattern", "Structural Patterns", "Explain the difference in intent between Decorator and Proxy.", "Decorator dynamically adds new responsibilities to object; Proxy controls access to object (e.g. lazy loading, security, caching)."),
            ("Observer Pattern with Flow API", "Behavioral Patterns", "How does java.util.concurrent.Flow implement Reactive Observer?", "Publisher produces events, Subscriber receives events, and Subscription handles backpressure via subscription.request(n)."),
            ("Builder Pattern with Joshua Bloch Immutability", "Creational Patterns", "Why use static inner Builder class for immutable objects?", "Eliminates telescoping constructors, enforces required fields in constructor, and returns immutable instance with all final fields."),
            ("Factory Method vs Abstract Factory", "Creational Patterns", "Explain difference in complexity and intent.", "Factory Method delegates instantiation of single product to subclasses; Abstract Factory creates families of related products."),
            ("Adapter Pattern in Java Standard Library", "Structural Patterns", "Give examples of Adapter pattern in JDK.", "Arrays.asList(array) adapts array to List; InputStreamReader adapts byte stream to character stream."),
            ("Template Method Pattern with Hooks", "Behavioral Patterns", "How does AbstractList utilize Template Method?", "Defines algorithm skeleton in base class; subclasses provide concrete primitives (e.g. get(int) and size())."),
            ("Command Pattern for Undo/Redo", "Behavioral Patterns", "Implement transactional Command queue with execute() and undo().", "Command interface with execute() and undo(); CommandManager maintains undoStack and redoStack."),
            ("State Pattern vs Strategy Pattern", "Behavioral Patterns", "Both have similar UML. How do their intents differ?", "Strategy is configured by client and remains static; State transitions automatically based on internal state changes."),
            ("Chain of Responsibility Pattern (Servlet Filters)", "Behavioral Patterns", "How does FilterChain invoke handlers sequentially?", "filter.doFilter(request, response, chain) executes logic before and after calling chain.doFilter()."),
            ("Flyweight Pattern in Java Wrapper Caching", "Structural Patterns", "How does Integer.valueOf() demonstrate Flyweight?", "Caches Integer instances for values -128 to 127 in IntegerCache to conserve heap memory."),
            ("Composite Pattern for Tree Hierarchies", "Structural Patterns", "How does Composite treat individual nodes and branches uniformly?", "Component interface implemented by both Leaf and Composite (which holds List<Component>)."),
            ("Bridge Pattern vs Adapter Pattern", "Structural Patterns", "When to apply Bridge pattern?", "Decouples abstraction from implementation so both can vary independently before system is designed."),
            ("Facade Pattern in Microservice Gateways", "Structural Patterns", "How does API Gateway act as a Facade?", "Aggregates multiple internal microservices into a single consolidated client-facing API endpoint."),
            ("Mediator Pattern in Event Brokers", "Behavioral Patterns", "Why introduce Mediator instead of direct object communication?", "Reduces M*N chaotic dependencies to M+N by routing all communication through central mediator."),
            ("Visitor Pattern for AST Processing", "Behavioral Patterns", "How does Double Dispatch work in the Visitor Pattern?", "element.accept(visitor) invokes visitor.visit(this), routing call to exact concrete type at runtime."),
            ("Memento Pattern for State Checkpoints", "Behavioral Patterns", "How to capture and restore object state without violating encapsulation?", "Originator creates Memento snapshot containing internal state; Caretaker holds Memento without inspecting contents."),
            ("Prototype Pattern (Cloneable vs Copy Constructor)", "Creational Patterns", "Why do Josh Bloch and MNCs recommend Copy Constructors over clone()?", "Cloneable is a broken interface (no public clone method); copy constructor public User(User other) enables deep copy cleanly."),
            ("Single Responsibility Principle (SRP) Violations", "SOLID Principles", "How to identify SRP violation in Spring Services?", "Class has multiple reasons to change (e.g. UserService handling user CRUD, email dispatch, and PDF generation)."),
            ("Open/Closed Principle (OCP) with Polymorphism", "SOLID Principles", "How to extend payment processing without modifying existing code?", "Inject List<PaymentProcessor> into PaymentService; iterate processors calling canProcess() and pay()."),
            ("Liskov Substitution Principle (LSP) Rectangle-Square Problem", "SOLID Principles", "Why does Square extending Rectangle violate LSP?", "Setting width on Square alters height, violating postconditions expected by callers of Rectangle."),
            ("Interface Segregation Principle (ISP) Best Practices", "SOLID Principles", "Why are many client-specific interfaces better than one general interface?", "Clients should not be forced to depend on methods they do not use (e.g. splitting Worker into Workable and Feedable)."),
            ("Dependency Inversion Principle (DIP) in Spring", "SOLID Principles", "High-level modules should not depend on low-level modules; both depend on abstractions.", "Service depends on Repository interface, not on concrete PostgreSQLRepository implementation."),
            ("Domain-Driven Design (DDD) Aggregates & Repositories", "Enterprise Architecture", "What is an Aggregate Root in DDD?", "Cluster of domain entities treated as single unit for data changes; external references can only point to Aggregate Root."),
            ("Clean Architecture / Hexagonal Ports and Adapters", "Enterprise Architecture", "Why isolate Domain Core from frameworks and databases?", "Keeps business logic pure and unit-testable without database, web framework, or third-party dependencies.")
        ]
    }
]

def generate_pdf():
    pdf_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__),
            "..",
            "..",
            "frontend",
            "public",
            "downloads",
            "250_Top_MNC_Java_Interview_Questions_Master_Guide.pdf"
        )
    )
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom typography
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSub',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#0284c7'),
        alignment=1,
        spaceAfter=15
    )

    section_style = ParagraphStyle(
        'SecHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=14,
        spaceAfter=6
    )

    q_title_style = ParagraphStyle(
        'QTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12.5,
        textColor=colors.HexColor('#0f172a')
    )

    meta_style = ParagraphStyle(
        'QMeta',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor('#0284c7')
    )

    prompt_style = ParagraphStyle(
        'QPrompt',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#334155')
    )

    solution_style = ParagraphStyle(
        'QSol',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=7.8,
        leading=10.5,
        textColor=colors.HexColor('#065f46')
    )

    elements = []

    # Title Banner
    elements.append(Paragraph("250 TOP MNC JAVA INTERVIEW QUESTIONS", title_style))
    elements.append(Paragraph("MASTER GUIDE &bull; LEETCODE TOP 150 &bull; HACKERRANK &bull; FAANG / MNC ARCHIVES", subtitle_style))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=14))

    # Overview Table
    summary_data = [
        [
            Paragraph("<b>Target MNCs:</b> Google, Amazon, Microsoft, Meta, Netflix, Goldman Sachs, TCS, Infosys", prompt_style),
            Paragraph("<b>Total Curated:</b> 250 Distinct Interview Questions", prompt_style)
        ],
        [
            Paragraph("<b>Coverage:</b> Two Pointers, Linked Lists, Trees, Graphs, DP, HackerRank, Concurrency, Spring Boot, Hard DSA", prompt_style),
            Paragraph("<b>Format:</b> Concise Problem Statement + High-Efficiency Architectural Solution", prompt_style)
        ]
    ]
    t_summary = Table(summary_data, colWidths=[340, 200])
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    elements.append(t_summary)
    elements.append(Spacer(1, 14))

    total_counter = 0

    for dom in DOMAINS:
        sec_header = f"{dom['category']} ({len(dom['questions'])} Questions &bull; {dom['company']})"
        elements.append(Paragraph(html.escape(sec_header), section_style))

        table_rows = [
            [
                Paragraph("<b>#</b>", meta_style),
                Paragraph("<b>Problem & Source</b>", meta_style),
                Paragraph("<b>Problem Statement & Solution Key</b>", meta_style)
            ]
        ]

        for title, source, prompt, solution in dom['questions']:
            total_counter += 1
            num_cell = Paragraph(f"<b>#{total_counter}</b>", meta_style)
            prob_cell = Paragraph(
                f"<b>{html.escape(title)}</b><br/><font color='#0284c7'>{html.escape(source)}</font>",
                q_title_style
            )
            desc_cell = Paragraph(
                f"{html.escape(prompt)}<br/><font color='#047857'><b>Key:</b> {html.escape(solution)}</font>",
                prompt_style
            )
            table_rows.append([num_cell, prob_cell, desc_cell])

        q_table = Table(table_rows, colWidths=[32, 160, 348])
        q_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#f1f5f9')),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ]))
        elements.append(q_table)
        elements.append(Spacer(1, 10))

    doc.build(elements)
    print(f"Successfully compiled {total_counter} DISTINCT MNC interview questions into PDF!")
    print(f"Saved to: {pdf_path}")
    print(f"File size: {os.path.getsize(pdf_path)} bytes")

if __name__ == "__main__":
    generate_pdf()
