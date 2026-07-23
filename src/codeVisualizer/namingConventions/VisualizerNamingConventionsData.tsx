import {
  Network,
  GitMerge,
  Grid,
  List,
  Link as LinkIcon,
  ArrowRightLeft,
  Layers,
  Database,
  Type,
  Binary,
} from "lucide-react";

export const DATA_STRUCTURES = [
  {
    title: "Graphs — <Graph />",
    icon: <Network className="text-accent" size={18} />,
    color: "border-accent/30 bg-accent/5",
    textColor: "text-accent",
    description: "Renders a circular node-edge network.",
    prefixes: [
      { prefix: "adj", example: "vector<vector<int>> adj_list" },
      { prefix: "graph", example: "unordered_map<int, vector<int>> graph_map" },
      { prefix: "network", example: "vector<vector<int>> network_nodes" },
      { prefix: "edges", example: "vector<vector<int>> edges" },
      { prefix: "vertices", example: "vector<Node> vertices" },
      { prefix: "paths", example: "vector<vector<int>> paths" },
    ],
    shape: "Value must be a 2D array (adjacency list). Inherently renders as directed edges.",
    auxiliary: [
      {
        role: "Edge list",
        trigger: "Any variable containing `edge` (e.g., `graph_edges`)",
        notes: "Expected format: `[[u, v], [x, y]]`",
      },
      {
        role: "Visited state",
        trigger: "Any variable containing `visit`",
        notes: "Elements set to `1` pulse with the highlight color",
      },
      {
        role: "Pointer badges",
        trigger: "Any pointer variable or index",
        notes: "Automatically tracked by the engine. Renders as floating badges.",
      },
      {
        role: "Active node",
        trigger: "A variable exactly named `current`",
        notes: "Highlights the node as actively being processed (e.g., in BFS/DFS)",
      },
    ],
  },
  {
    title: "Trees & BSTs — <Tree />",
    icon: <GitMerge className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description:
      "Renders a top-down hierarchical tree. Node coordinates are auto-calculated using an in-order layout algorithm.",
    prefixes: [
      { prefix: "tree", example: "vector<TreeNode> tree_nodes" },
      { prefix: "bst", example: "vector<Node> bst_data" },
      { prefix: "root", example: "TreeNode* root" },
      { prefix: "heap", example: "vector<int> heap" },
      { prefix: "forest", example: "vector<TreeNode> forest" },
      { prefix: "leaves", example: "vector<TreeNode> leaves" },
      { prefix: "nodes", example: "vector<TreeNode> nodes" },
    ],
    shape:
      "Can be a pointer-based tree (struct with `value` + `left`/`right` pointers) OR an array of objects with `id` and `value` fields.",
    auxiliary: [
      {
        role: "Pointers",
        trigger: "Any pointer variable",
        notes: "Automatically tracked by the engine. Stores target node's `id`",
      },
    ],
  },
  {
    title: "Tries — <TrieTree />",
    icon: <Network className="text-ds-trie" size={18} />,
    color: "border-ds-trie/30 bg-ds-trie/5",
    textColor: "text-ds-trie",
    description:
      "Renders an N-ary prefix tree (Trie). Auto-detects child mappings and terminal nodes.",
    prefixes: [
      { prefix: "trie", example: "vector<TrieNode> trie_nodes" },
      { prefix: "prefix_tree", example: "TrieNode* prefix_tree" },
      { prefix: "ptree", example: "TrieNode* ptree" },
      { prefix: "dictionary_tree", example: "TrieNode* dictionary_tree" },
      { prefix: "suffix_tree", example: "TrieNode* suffix_tree" },
    ],
    shape:
      "A struct containing a `children` map/array OR an array of objects with `id`, `value`, and `children`.",
    auxiliary: [
      {
        role: "Pointers",
        trigger: "Any pointer variable",
        notes: "Automatically tracked by the engine.",
      },
    ],
  },
  {
    title: "2D Matrices — <D2Array />",
    icon: <Grid className="text-accent-2" size={18} />,
    color: "border-accent-2/30 bg-accent-2/5",
    textColor: "text-accent-2",
    description:
      "Renders a 2D grid/matrix layout. Automatically handles and aligns jagged/irregular arrays where rows have varying lengths.",
    prefixes: [
      { prefix: "ANY NAME", example: "vector<vector<int>> matrix_data" },
      { prefix: "ANY NAME", example: "int table2d[10][10]" },
    ],
    shape:
      "Value must be a 2D array (array of arrays). Supports jagged/irregular rows. Detection is completely automatic based on structure, no naming prefix is required!",
    auxiliary: [
      {
        role: "Row/Column pointers",
        trigger: "Any variables used as 2D indices (e.g., `mat[r][c]`)",
        notes: "Automatically tracked by the engine during access.",
      },
    ],
  },
  {
    title: "1D Arrays — <D1Array />",
    icon: <List className="text-accent-3" size={18} />,
    color: "border-accent-3/30 bg-accent-3/5",
    textColor: "text-accent-3",
    description: "Renders a linear array.",
    prefixes: [
      { prefix: "ANY NAME", example: "vector<int> arr" },
      { prefix: "ANY NAME", example: "array<int, 5> array_data" },
    ],
    shape:
      "Value must be a flat array of primitives (numbers, strings, booleans). Detection is completely automatic based on structure, no naming prefix is required!",
    auxiliary: [
      {
        role: "Indexers / Pointers",
        trigger: "Any variable used as an index (e.g., `arr[i]`)",
        notes: "Automatically tracked by the engine.",
      },
      {
        role: "Range Highlighting",
        trigger: "Pairs: `left`/`right`, `l`/`r`, `start`/`end`, `low`/`high`, `first`/`last`",
        notes:
          "If a pointer pair exists in the scope, the elements between them are automatically highlighted as a range.",
      },
    ],
  },
  {
    title: "Sorting Bars — <SortBars />",
    icon: <List className="text-accent" size={18} />,
    color: "border-accent/30 bg-accent/5",
    textColor: "text-accent",
    description:
      "Renders an array as vertical bars proportional to their value. Automatically triggered instead of <D1Array /> when the variable is exactly named `arr` and the current page is a sorting algorithm.",
    prefixes: [{ prefix: "arr", example: "vector<int> arr" }],
    shape:
      "Flat numeric array. Triggers automatically based on URL routing (`/algorithms/sorting`).",
    auxiliary: [
      {
        role: "Pointers",
        trigger: "Any variable used as an index",
        notes: "Automatically tracked by the engine.",
      },
    ],
  },
  {
    title: "Linked Lists — <LinkedList />",
    icon: <LinkIcon className="text-accent" size={18} />,
    color: "border-accent/30 bg-accent/5",
    textColor: "text-accent",
    description:
      "Renders a sequence of memory blocks connected by pointers. Detection is completely automatic based on structure, no naming prefix is required!",
    prefixes: [
      { prefix: "ANY NAME", example: "Node* start = new Node(10);" },
      { prefix: "ANY NAME", example: "Node* slow = head;" },
    ],
    shape: "A struct/class containing a 'value' (or 'val') field and a 'next' pointer.",
    auxiliary: [
      {
        role: "All Pointers",
        trigger: "Any variable pointing to a node",
        notes:
          "Regardless of variable name, it will be attached as a floating pointer above the node.",
      },
    ],
  },
  {
    title: "Queues & Deques — <Queue />",
    icon: <ArrowRightLeft className="text-accent-2" size={18} />,
    color: "border-accent-2/30 bg-accent-2/5",
    textColor: "text-accent-2",
    description:
      "Renders a horizontal FIFO tube where items slide in from the right and exit from the left.",
    prefixes: [
      { prefix: "queue", example: "deque<string> queue_names" },
      { prefix: "deque", example: "deque<int> deque_window" },
      { prefix: "buffer", example: "queue<char> buffer" },
      { prefix: "line", example: "queue<int> line" },
      { prefix: "queue_nodes", example: "queue<Node> queue_nodes" },
      { prefix: "tasks", example: "queue<Task> tasks" },
    ],
    shape: "Value must be a flat array of primitives.",
    auxiliary: [
      {
        role: "Pointers",
        trigger: "Any pointer variable",
        notes: "Automatically tracked by the engine.",
      },
    ],
  },
  {
    title: "Stacks — <Stack />",
    icon: <Layers className="text-accent-3" size={18} />,
    color: "border-accent-3/30 bg-accent-3/5",
    textColor: "text-accent-3",
    description: "Renders a vertical LIFO bucket where elements animate strictly top-down.",
    prefixes: [
      { prefix: "stack", example: "vector<string> stack_names" },
      { prefix: "stk", example: "stack<char> stk_chars" },
      { prefix: "history", example: "stack<int> history" },
      { prefix: "undo", example: "stack<Action> undo" },
      { prefix: "frames", example: "stack<Frame> frames" },
    ],
    shape: "Value must be a flat array of primitives.",
    auxiliary: [
      {
        role: "Stack pointers",
        trigger: "Any pointer variable",
        notes: "Automatically tracked by the engine. Pointer badges attach to the right side.",
      },
    ],
  },
  {
    title: "Strings — <String />",
    icon: <Type className="text-ds-string" size={18} />,
    color: "border-ds-string/30 bg-ds-string/5",
    textColor: "text-ds-string",
    description: "Renders characters continuously with distinct text-specific styling.",
    prefixes: [
      { prefix: "ANY NAME", example: "string string_data" },
      { prefix: "ANY NAME", example: "vector<char> chars" },
    ],
    shape:
      "Value must be a Javascript primitive string or an array of characters. Detection is completely automatic based on structure.",
    auxiliary: [
      {
        role: "Indexers",
        trigger: "Any variable used as an index",
        notes: "Automatically tracked by the engine.",
      },
    ],
  },
  {
    title: "Maps — <Map />",
    icon: <Database className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description: "Renders key-value pairs.",
    prefixes: [
      { prefix: "ANY NAME", example: "unordered_map<int, int> map_freq" },
      { prefix: "ANY NAME", example: "map<string, int> dict" },
    ],
    shape: "Value must be a map object internally emitted by the engine. Detection is automatic.",
    auxiliary: [],
  },
  {
    title: "Sets — <Set />",
    icon: <Database className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description: "Renders unique set elements as distinct badges.",
    prefixes: [
      { prefix: "ANY NAME", example: "unordered_set<int> set_data" },
      { prefix: "ANY NAME", example: "set<int> unique_vals" },
    ],
    shape: "Value must be a set object internally emitted by the engine. Detection is automatic.",
    auxiliary: [],
  },
  {
    title: "Bitsets & Masks — <Bitset />",
    icon: <Binary className="text-ds-bitset" size={18} />,
    color: "border-ds-bitset/30 bg-ds-bitset/5",
    textColor: "text-ds-bitset",
    description: "Renders an integer or boolean array as a strip of glowing bits.",
    prefixes: [
      { prefix: "ANY NAME", example: "vector<bool> bits" },
      { prefix: "ANY NAME", example: "bitset<32> b" },
    ],
    shape:
      "Value must be a Javascript primitive number or an array of booleans. Detection is automatic.",
    auxiliary: [],
  },
];
