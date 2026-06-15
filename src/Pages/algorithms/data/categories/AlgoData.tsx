/* ─── Data ──────────────────────────────────────────────────────────────────── */
export const ALGORITHMSNAV = [
  {
    name: "Arrays",
    href: "/algorithms/arrays",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
        <rect x="6" y="20" width="12" height="24"/>
        <rect x="20" y="20" width="12" height="24"/>
        <rect x="34" y="20" width="12" height="24"/>
        <rect x="48" y="20" width="12" height="24"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#34D399" strokeWidth="4">
        <rect x="6" y="20" width="12" height="24" fill="#34D399" fillOpacity="0.2"/>
        <rect x="20" y="20" width="12" height="24" fill="#34D399" fillOpacity="0.2"/>
        <rect x="34" y="20" width="12" height="24"/>
        <rect x="48" y="20" width="12" height="24"/>
        {/* Sliding window bracket */}
        <path d="M 4 48 L 4 54 L 34 54 L 34 48" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    items:[
      { name: "Two Pointers", href: "/algorithms/arrays/two-pointers", type: "Easy" },
      { name: "Kadane's Algorithm", href: "/algorithms/arrays/kadanes", type: "Medium" },      
      { name: "Sliding Window", href: "/algorithms/arrays/sliding-window", type: "Medium" },
      { name: "Boyer-Moore Majority", href: "/algorithms/arrays/boyer-moore", type: "Medium" },
      { name: "Prefix Sum", href: "/algorithms/arrays/prefix-sum", type: "Easy" },
      { name: "Dutch National Flag", href: "/algorithms/arrays/dutch-national-flag", type: "Medium" }
    ],
    desc: "Two pointers, sliding window, prefix sums",
    complexity: "O(n)",
    count: 6,
    featured: false,
  },
  {
    name: "Sorting",
    href: "/algorithms/sorting",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <rect x="8" y="36" width="8" height="20"/>
        <rect x="22" y="26" width="8" height="30"/>
        <rect x="36" y="14" width="8" height="42"/>
        <rect x="50" y="6" width="8" height="50"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="#34D399">
        {/* Sorted order */}
        <rect x="8" y="44" width="8" height="12"/>
        <rect x="22" y="32" width="8" height="24"/>
        <rect x="36" y="18" width="8" height="38"/>
        <rect x="50" y="6" width="8" height="50"/>
        {/* Arrow indicating sort */}
        <path d="M 60 56 L 60 16 L 56 22 M 60 16 L 64 22" stroke="#34D399" strokeWidth="2" fill="none"/>
      </svg>
    ),
    items:[
      { name: "Bubble Sort", href: "/algorithms/sorting/bubble", type: "Easy" },
      { name: "Merge Sort", href: "/algorithms/sorting/merge", type: "Medium" },
      { name: "Timsort", href: "/algorithms/sorting/timsort", type: "Hard" },
      { name: "Quick Sort", href: "/algorithms/sorting/quick", type: "Medium" },
      { name: "Heap Sort", href: "/algorithms/sorting/heap", type: "Medium" },
      { name: "Counting Sort", href: "/algorithms/sorting/counting", type: "Medium" },
      { name: "Selection Sort", href: "/algorithms/sorting/selection", type: "Easy" },
      { name: "Radix Sort", href: "/algorithms/sorting/radix", type: "Medium" },
      { name: "Insertion Sort", href: "/algorithms/sorting/insertion", type: "Easy" },
      { name: "Bucket Sort", href: "/algorithms/sorting/bucket", type: "Medium" },
      { name: "Shell Sort", href: "/algorithms/sorting/shell", type: "Medium" },
      { name: "Introsort", href: "/algorithms/sorting/introsort", type: "Hard" }
    ],
    desc: "Bubble, merge, quick, heap, counting sort",
    complexity: "O(n log n)",
    count: 12,
  },
  {
    name: "Graphs",
    href: "/algorithms/graphs",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="32" r="5"/>
        <circle cx="32" cy="12" r="5"/>
        <circle cx="52" cy="32" r="5"/>
        <circle cx="32" cy="52" r="5"/>
        <line x1="12" y1="32" x2="32" y2="12"/>
        <line x1="32" y1="12" x2="52" y2="32"/>
        <line x1="52" y1="32" x2="32" y2="52"/>
        <line x1="32" y1="52" x2="12" y2="32"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="32" r="5" fill="#34D399" stroke="#34D399"/>
        <circle cx="32" cy="12" r="5" fill="#34D399" stroke="#34D399"/>
        <circle cx="52" cy="32" r="5" fill="#34D399" stroke="#34D399"/>
        <circle cx="32" cy="52" r="5"/>
        <line x1="12" y1="32" x2="32" y2="12" stroke="#34D399" strokeWidth="5"/>
        <line x1="32" y1="12" x2="52" y2="32" stroke="#34D399" strokeWidth="5"/>
        <line x1="52" y1="32" x2="32" y2="52"/>
        <line x1="32" y1="52" x2="12" y2="32"/>
      </svg>
    ),
    items:[
      { name: "Breadth-First Search (BFS)", href: "/algorithms/graphs/bfs", type: "Easy" },
      { name: "Topological Sort", href: "/algorithms/graphs/topological-sort", type: "Medium" },
      { name: "Dijkstra's Algorithm", href: "/algorithms/graphs/dijkstra", type: "Medium" },
      { name: "Bellman-Ford Algorithm", href: "/algorithms/graphs/bellman-ford", type: "Hard" },
      { name: "Floyd-Warshall Algorithm", href: "/algorithms/graphs/floyd-warshall", type: "Hard" },
      { name: "Kruskal's Algorithm", href: "/algorithms/graphs/kruskal", type: "Medium" },
      { name: "Prim's Algorithm", href: "/algorithms/graphs/prim", type: "Medium" },
      { name: "Depth-First Search (DFS)", href: "/algorithms/graphs/dfs", type: "Easy" },
      { name: "Tarjan's SCC", href: "/algorithms/graphs/tarjans", type: "Hard" }
    ],
    desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd",
    complexity: "O(V + E)",
    count: 9,
  },
  {
    name: "Trees",
    href: "/algorithms/trees",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <circle cx="38" cy="52" r="5"/>
        <circle cx="54" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <line x1="46" y1="37" x2="38" y2="47"/>
        <line x1="46" y1="37" x2="54" y2="47"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5" stroke="#34D399" fill="#34D399"/>
        <circle cx="18" cy="32" r="5" stroke="#34D399" fill="#34D399"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5" stroke="#34D399" fill="#34D399"/>
        <circle cx="26" cy="52" r="5"/>
        <circle cx="38" cy="52" r="5"/>
        <circle cx="54" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27" stroke="#34D399" strokeWidth="4"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47" stroke="#34D399" strokeWidth="4"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <line x1="46" y1="37" x2="38" y2="47"/>
        <line x1="46" y1="37" x2="54" y2="47"/>
      </svg>
    ),
    items:[
      { name: "AVL Trees", href: "/algorithms/trees/avl", type: "Hard" },
      { name: "Tree Traversals", href: "/algorithms/trees/traversals", type: "Easy" },
      { name: "Binary Search Tree", href: "/algorithms/trees/bst", type: "Medium" },
      { name: "Lowest Common Ancestor", href: "/algorithms/trees/lca", type: "Medium" },
      { name: "Red-Black Trees", href: "/algorithms/trees/red-black", type: "Hard" }
    ],
    desc: "BST, AVL, segment tree, traversals",
    complexity: "O(log n)",
    count: 5,
  },
  {
    name: "Dynamic Programming",
    href: "/algorithms/dynamic_programming",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="16" height="16"/>
        <rect x="24" y="8" width="16" height="16"/>
        <rect x="40" y="8" width="16" height="16"/>
        <rect x="8" y="24" width="16" height="16"/>
        <rect x="24" y="24" width="16" height="16"/>
        <rect x="40" y="24" width="16" height="16"/>
        <rect x="8" y="40" width="16" height="16"/>
        <rect x="24" y="40" width="16" height="16"/>
        <rect x="40" y="40" width="16" height="16"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="16" height="16" fill="#34D399" stroke="#34D399"/>
        <rect x="24" y="8" width="16" height="16"/>
        <rect x="40" y="8" width="16" height="16"/>
        <rect x="8" y="24" width="16" height="16" fill="#34D399" stroke="#34D399"/>
        <rect x="24" y="24" width="16" height="16" fill="#34D399" stroke="#34D399"/>
        <rect x="40" y="24" width="16" height="16"/>
        <rect x="8" y="40" width="16" height="16"/>
        <rect x="24" y="40" width="16" height="16"/>
        <rect x="40" y="40" width="16" height="16" fill="#34D399" stroke="#34D399"/>
      </svg>
    ),
    items:[
      { name: "0/1 Knapsack", href: "/algorithms/dynamic_programming/knapsack", type: "Medium" },
      { name: "Matrix Chain Multiplication", href: "/algorithms/dynamic_programming/matrix-chain", type: "Hard" },
      { name: "Longest Common Subsequence", href: "/algorithms/dynamic_programming/lcs", type: "Medium" },
      { name: "Longest Increasing Subsequence", href: "/algorithms/dynamic_programming/lis", type: "Medium" },
      { name: "Coin Change", href: "/algorithms/dynamic_programming/coin-change", type: "Medium" },
      { name: "Travelling Salesperson", href: "/algorithms/dynamic_programming/tsp", type: "Hard" },
      { name: "Fibonacci Sequence", href: "/algorithms/dynamic_programming/fibonacci", type: "Easy" }
    ],
    desc: "Memoization, tabulation, optimal substructure",
    complexity: "O(n²)",
    count: 7,
  },
  {
    name: "Linked Lists",
    href: "/algorithms/linked_lists",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12" rx="2"/>
        <rect x="26" y="24" width="12" height="12" rx="2"/>
        <rect x="48" y="24" width="12" height="12" rx="2"/>
        <line x1="16" y1="30" x2="26" y2="30"/>
        <line x1="38" y1="30" x2="48" y2="30"/>
        <polyline points="22,26 26,30 22,34"/>
        <polyline points="44,26 48,30 44,34"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="#34D399" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12" rx="2" stroke="currentColor"/>
        <rect x="26" y="24" width="12" height="12" rx="2" stroke="currentColor"/>
        <rect x="48" y="24" width="12" height="12" rx="2" stroke="currentColor"/>
        <line x1="16" y1="30" x2="26" y2="30"/>
        <line x1="38" y1="30" x2="48" y2="30"/>
        <polyline points="20,26 16,30 20,34"/>
        <polyline points="42,26 38,30 42,34"/>
      </svg>
    ),
    items:[
      { name: "LRU Cache Design", href: "/algorithms/linked_lists/lru-cache", type: "Hard" },
      { name: "Reverse Linked List", href: "/algorithms/linked_lists/reverse", type: "Easy" },
      { name: "Doubly Linked Lists", href: "/algorithms/linked_lists/doubly", type: "Medium" },
      { name: "Floyd's Cycle Detection", href: "/algorithms/linked_lists/cycle-detection", type: "Easy" },
      { name: "Merge Sorted Lists", href: "/algorithms/linked_lists/merge", type: "Easy" },
    ],
    desc: "Reversal, cycle detection, merge, Floyd's",
    complexity: "O(n)",
    count: 5,
  },
  {
    name: "Stacks",
    href: "/algorithms/stacks",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="18" y="42" width="28" height="10"/>
        <rect x="18" y="30" width="28" height="10"/>
        <rect x="18" y="18" width="28" height="10"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="18" y="42" width="28" height="10"/>
        <rect x="18" y="30" width="28" height="10"/>
        <rect x="18" y="6" width="28" height="10" fill="#34D399" stroke="#34D399"/>
        {/* Pushing animation indicator */}
        <line x1="32" y1="18" x2="32" y2="28" stroke="#34D399" strokeDasharray="3 3"/>
        <polyline points="28,24 32,28 36,24" stroke="#34D399"/>
      </svg>
    ),
    items:[
      { name: "Valid Parentheses", href: "/algorithms/stacks/valid-parentheses", type: "Easy" },
      { name: "Min Stack", href: "/algorithms/stacks/min-stack", type: "Medium" },
      { name: "Next Greater Element", href: "/algorithms/stacks/next-greater", type: "Medium" },
      { name: "Monotonic Stack", href: "/algorithms/stacks/monotonic", type: "Medium" },
      { name: "Largest Rectangle in Histogram", href: "/algorithms/stacks/histogram", type: "Hard" }
    ],
    desc: "Monotonic stack, bracket matching, next greater",
    complexity: "O(n)",
    count: 5,
  },
  {
    name: "Queues",
    href: "/algorithms/queues",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12"/>
        <rect x="20" y="24" width="12" height="12"/>
        <rect x="36" y="24" width="12" height="12"/>
        <line x1="52" y1="30" x2="60" y2="30"/>
        <polyline points="56,26 60,30 56,34"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="20" y="24" width="12" height="12" fill="#34D399" stroke="#34D399"/>
        <rect x="36" y="24" width="12" height="12"/>
        <rect x="52" y="24" width="12" height="12"/>
        {/* Popping from front, pushing to back */}
        <line x1="4" y1="30" x2="12" y2="30" stroke="#34D399" strokeDasharray="2 2"/>
      </svg>
    ),
    items:[
      { name: "Queue Implementation", href: "/algorithms/queues/implementation", type: "Easy" },
      { name: "Sliding Window Maximum", href: "/algorithms/queues/sliding-window-max", type: "Hard" },
      { name: "Circular Queue", href: "/algorithms/queues/circular", type: "Medium" },
      { name: "Double-ended Queue (Deque)", href: "/algorithms/queues/deque", type: "Medium" }
    ],
    desc: "Deque, sliding window max, BFS patterns",
    complexity: "O(n)",
    count: 4,
  },
  {
    name: "Hash Maps",
    href: "/algorithms/hash_maps",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="20" y1="8" x2="20" y2="56"/>
        <line x1="44" y1="8" x2="44" y2="56"/>
        <line x1="8" y1="20" x2="56" y2="20"/>
        <line x1="8" y1="44" x2="56" y2="44"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="20" y1="8" x2="20" y2="56"/>
        <line x1="44" y1="8" x2="44" y2="56"/>
        <line x1="8" y1="20" x2="56" y2="20"/>
        <line x1="8" y1="44" x2="56" y2="44"/>
        <circle cx="32" cy="32" r="6" fill="#34D399" stroke="none"/>
        <circle cx="12" cy="12" r="3" fill="#34D399" stroke="none"/>
        <circle cx="52" cy="52" r="4" fill="#34D399" stroke="none"/>
      </svg>
    ),
    items:[
      { name: "Longest Consecutive Sequence", href: "/algorithms/hash_maps/longest-consecutive", type: "Medium" },
      { name: "Design Hashmap", href: "/algorithms/hash_maps/design", type: "Medium" },
      { name: "Two Sum", href: "/algorithms/hash_maps/two-sum", type: "Easy" },
      { name: "Group Anagrams", href: "/algorithms/hash_maps/group-anagrams", type: "Medium" },
      { name: "LFU Cache Design", href: "/algorithms/hash_maps/lfu-cache", type: "Hard" }
    ],
    desc: "Frequency count, anagram, LRU cache",
    complexity: "O(1) avg",
    count: 5,
  },
  {
    name: "Heap",
    href: "/algorithms/heap",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="6" fill="#34D399" stroke="#34D399"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <line x1="32" y1="18" x2="18" y2="27"/>
        <line x1="32" y1="18" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <path d="M 38 12 L 44 8 L 44 16 Z" fill="#34D399" stroke="none"/>
      </svg>
    ),
    items:[
      { name: "Kth Largest Element", href: "/algorithms/heap/kth-largest", type: "Medium" },
      { name: "Merge K Sorted Lists", href: "/algorithms/heap/merge-k", type: "Hard" },
      { name: "Top K Frequent Elements", href: "/algorithms/heap/top-k-frequent", type: "Medium" },
      { name: "Find Median from Data Stream", href: "/algorithms/heap/median-stream", type: "Hard" }
    ],
    desc: "Min-heap, max-heap, k-way merge, top-k",
    complexity: "O(log n)",
    count: 4,
  },
  {
    name: "Recursion",
    href: "/algorithms/recursion",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M22 22 A12 12 0 1 1 22 42"/>
        <polyline points="22,16 22,22 28,22"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M22 22 A12 12 0 1 1 22 42"/>
        <polyline points="22,16 22,22 28,22"/>
        <path d="M34 26 A6 6 0 1 1 34 38" stroke="#34D399"/>
        <polyline points="34,22 34,26 38,26" stroke="#34D399"/>
      </svg>
    ),
    items:[
      { name: "Subsets", href: "/algorithms/recursion/subsets", type: "Medium" },
      { name: "N-Queens", href: "/algorithms/recursion/n-queens", type: "Hard" },
      { name: "Sudoku Solver", href: "/algorithms/recursion/sudoku", type: "Hard" },
      { name: "Permutations", href: "/algorithms/recursion/permutations", type: "Medium" },
      { name: "Combination Sum", href: "/algorithms/recursion/combination-sum", type: "Medium" }
    ],
    desc: "Backtracking, permutations, divide & conquer",
    complexity: "O(2ⁿ)",
    count: 5,
  },
  {
    name: "Strings",
    href: "/algorithms/strings",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text x="8" y="42" fontSize="26" fontFamily="monospace">Aa</text>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text x="8" y="42" fontSize="26" fontFamily="monospace">A<tspan fill="#34D399">a</tspan></text>
        <rect x="25" y="46" width="16" height="3" fill="#34D399"/>
      </svg>
    ),
    items:[
      { name: "Longest Substring Without Repeats", href: "/algorithms/strings/longest-substring", type: "Medium" },
      { name: "Rabin-Karp Algorithm", href: "/algorithms/strings/rabin-karp", type: "Medium" },
      { name: "KMP Algorithm", href: "/algorithms/strings/kmp", type: "Hard" },
      { name: "Valid Palindrome", href: "/algorithms/strings/palindrome", type: "Easy" },
      { name: "Z-Algorithm", href: "/algorithms/strings/z-algorithm", type: "Hard" }
    ],
    desc: "KMP, Rabin-Karp, Z-algorithm, trie patterns",
    complexity: "O(n + m)",
    count: 5,
  },
  {
    name: "Tries",
    href: "/algorithms/tries",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <line x1="32" y1="14" x2="16" y2="32"/>
        <line x1="32" y1="14" x2="48" y2="32"/>
        <line x1="16" y1="32" x2="8" y2="52"/>
        <line x1="16" y1="32" x2="24" y2="52"/>
        <line x1="48" y1="32" x2="40" y2="52"/>
        <line x1="48" y1="32" x2="56" y2="52"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4" fill="#34D399" stroke="#34D399"/>
        <line x1="32" y1="14" x2="16" y2="32" stroke="#34D399" strokeWidth="4"/>
        <line x1="32" y1="14" x2="48" y2="32"/>
        <line x1="16" y1="32" x2="8" y2="52"/>
        <line x1="16" y1="32" x2="24" y2="52" stroke="#34D399" strokeWidth="4"/>
        <circle cx="24" cy="52" r="4" fill="#34D399" stroke="#34D399"/>
        <line x1="48" y1="32" x2="40" y2="52"/>
        <line x1="48" y1="32" x2="56" y2="52"/>
      </svg>
    ),
    items:[
      { name: "Word Search II", href: "/algorithms/tries/word-search-ii", type: "Hard" },
      { name: "Implement Trie", href: "/algorithms/tries/implementation", type: "Medium" },
      { name: "Add and Search Words", href: "/algorithms/tries/add-search", type: "Medium" },
    ],
    desc: "Prefix trees, autocomplete, word search",
    complexity: "O(m)",
    count: 3,
  },
  {
    name: "Greedy",
    href: "/algorithms/greedy",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 8l6 14 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 8l6 14 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z" fill="none" stroke="#34D399" strokeWidth="3"/>
        <circle cx="32" cy="36" r="8" fill="#34D399"/>
      </svg>
    ),
    items:[
      { name: "Jump Game", href: "/algorithms/greedy/jump-game", type: "Medium" },
      { name: "Huffman Coding", href: "/algorithms/greedy/huffman", type: "Medium" },
      { name: "Minimum Spanning Tree", href: "/algorithms/greedy/mst", type: "Hard" },
      { name: "Activity Selection", href: "/algorithms/greedy/activity-selection", type: "Easy" },
      { name: "Fractional Knapsack", href: "/algorithms/greedy/fractional-knapsack", type: "Medium" },
    ],
    desc: "Interval scheduling, Huffman, activity selection",
    complexity: "O(n log n)",
    count: 5,
  },
  {
    name: "Bit Manipulation",
    href: "/algorithms/bit_manipulation",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text x="7" y="40" fontSize="18" fontFamily="monospace">1010</text>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text x="7" y="40" fontSize="18" fontFamily="monospace">10<tspan fill="#34D399">01</tspan></text>
      </svg>
    ),
    items:[
      { name: "Single Number", href: "/algorithms/bit_manipulation/single-number", type: "Easy" },
      { name: "Counting Bits", href: "/algorithms/bit_manipulation/counting-bits", type: "Easy" },
      { name: "Bitwise AND of Numbers Range", href: "/algorithms/bit_manipulation/bitwise-and", type: "Medium" },
      { name: "Reverse Bits", href: "/algorithms/bit_manipulation/reverse-bits", type: "Easy" },
      { name: "Missing Number", href: "/algorithms/bit_manipulation/missing-number", type: "Easy" },
    ],
    desc: "XOR tricks, bitmasking, power of two",
    complexity: "O(1)",
    count: 5,
  },
  {
    name: "Range Structures",
    href: "/algorithms/range_structures",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <circle cx="16" cy="30" r="4"/>
        <circle cx="48" cy="30" r="4"/>
        <circle cx="8" cy="50" r="4"/>
        <circle cx="24" cy="50" r="4"/>
        <circle cx="40" cy="50" r="4"/>
        <circle cx="56" cy="50" r="4"/>
        <line x1="32" y1="14" x2="16" y2="26"/>
        <line x1="32" y1="14" x2="48" y2="26"/>
        <line x1="16" y1="34" x2="8" y2="46"/>
        <line x1="16" y1="34" x2="24" y2="46"/>
        <line x1="48" y1="34" x2="40" y2="46"/>
        <line x1="48" y1="34" x2="56" y2="46"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <circle cx="16" cy="30" r="4"/>
        <circle cx="48" cy="30" r="4" fill="#34D399" stroke="#34D399"/>
        <circle cx="8" cy="50" r="4"/>
        <circle cx="24" cy="50" r="4"/>
        <circle cx="40" cy="50" r="4" fill="#34D399" stroke="#34D399"/>
        <circle cx="56" cy="50" r="4" fill="#34D399" stroke="#34D399"/>
        <line x1="32" y1="14" x2="16" y2="26"/>
        <line x1="32" y1="14" x2="48" y2="26"/>
        <line x1="16" y1="34" x2="8" y2="46"/>
        <line x1="16" y1="34" x2="24" y2="46"/>
        <line x1="48" y1="34" x2="40" y2="46" stroke="#34D399" strokeWidth="4"/>
        <line x1="48" y1="34" x2="56" y2="46" stroke="#34D399" strokeWidth="4"/>
      </svg>
    ),
    items:[
      { name: "Segment Tree", href: "/algorithms/range_structures/segment-tree", type: "Hard" },
      { name: "Fenwick Tree (BIT)", href: "/algorithms/range_structures/fenwick", type: "Medium" },
      { name: "Sparse Table", href: "/algorithms/range_structures/sparse-table", type: "Hard" },
      { name: "Square Root Decomposition", href: "/algorithms/range_structures/sqrt-decomp", type: "Hard" }
    ],
    desc: "Segment trees, BIT/Fenwick, range queries",
    complexity: "O(log n)",
    count: 4,
  },
];