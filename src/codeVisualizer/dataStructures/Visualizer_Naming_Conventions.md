# AlgoVisuals Naming Conventions

> The `VisualGround` engine's heuristic detector parses the AST runtime scope and automatically mounts the correct React component based on variable naming prefixes. Follow the conventions below to trigger the right visual for each data structure.

---

## 1. Graphs — `<Graph />`

Renders a circular node-edge network.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `adj` | `vector<vector<int>> adj_list` |
| `graph` | `unordered_map<int, vector<int>> graph_map` |
| `tree` | `tree_edges` |

**Auxiliary Variables (Auto-Bound)**

| Role | Trigger | Notes |
|------|---------|-------|
| Edge list | Any variable containing `edge` (e.g., `graph_edges`, `edges`) | Expected format: `[[u, v], [x, y]]` |
| Visited state | Any variable containing `visit` (e.g., `visited`, `node_visits`) | Elements set to `1` pulse with the highlight color |
| Pointer badge | `node`, `curr`, `u`, `v`, or `ptr_n*` prefix | Renders as a floating badge above the target node ID |

**Example — BFS Graph Walk**

```cpp
void bfs() {
    vector<vector<int>> adj_list;   // Triggers <Graph />
    vector<vector<int>> graph_edges; // Auto-bound: edge list
    vector<int> visited;             // Auto-bound: highlight visited nodes
    int curr_node = 0;               // Auto-bound: floating pointer badge
}
```

---

## 2. 2D Matrices — `<D2Array />`

Renders a 2D grid/matrix layout.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `mat` | `vector<vector<int>> mat_grid` |
| `grid` | `vector<vector<int>> grid` |
| `board` | `char board[8][8]` |
| `dp` | `vector<vector<int>> dp_table` |

**Auxiliary Variables (Auto-Bound)**

Both a row **and** a column variable must exist in the same scope to drop a pointer.

| Role | Trigger |
|------|---------|
| Row | `r`, `row`, `*_r` (e.g., `ptr_r`) |
| Column | `c`, `col`, `*_c` (e.g., `ptr_c`) |

---

## 3. 1D Arrays — `<D1Array />`

Renders a linear array.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `arr` | `vector<int> arr` |
| `vec` | `vector<string> vec_names` |
| `num` | `vector<int> nums` |
| `list` | `int list_items[]` |
| `seq` | `vector<float> seq` |

**Auxiliary Variables (Auto-Bound)**

| Role | Trigger |
|------|---------|
| Generic indexers | `i`, `j`, `k` |
| Algorithmic pointers | `left`, `right`, `mid`, `curr`, `ptr` |
| Composite examples | `ptr_i`, `left_idx` |

---

## 4. Linked Lists — `<LinkedList />`

Renders a horizontal sequence of connected node blocks.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `ll_` | `vector<Node> ll_nodes` |
| `list_` | `list_items` |
| `head` | Engine emits the fully traversed list as `head` |

**Auxiliary Variables (Auto-Bound)**

| Role | Trigger |
|------|---------|
| Standard pointers | `head`, `tail`, `curr`, `prev`, `next` |
| Fast/Slow pointers | `slow`, `fast` |

> Variables must hold the `id` or index of the target node.

**Example — Cycle Detection**

```cpp
void detectCycle() {
    vector<Node> ll_nodes;       // Triggers <LinkedList />
    vector<int> highLightNodes;  // Optional: visual pulse on match
    vector<int> readNodes;       // Optional: mark read nodes

    Node* slow = head;           // Auto-bound: floating pointer
    Node* fast = head;           // Auto-bound: floating pointer

    while (fast && fast->next) {
        if (slow == fast) {
            highLightNodes.push_back(slow->id);
        }
    }
}
```

---

## 5. Queues & Deques — `<Queue />`

Renders a horizontal FIFO tube where items slide in from the right and exit from the left.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `q_` | `queue<int> q_nodes` |
| `queue` | `deque<string> queue_names` |
| `deque` | `deque<int> deque_window` |

**Auxiliary Variables (Auto-Bound)**

| Role | Trigger |
|------|---------|
| Standard ends | `front`, `back`, `rear`, `head`, `tail` |
| General trackers | `curr`, `ptr_front` |

---

## 6. Stacks — `<Stack />`

Renders a vertical LIFO bucket where elements animate strictly top-down.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `st_` | `stack<int> st_nodes` |
| `stack` | `vector<string> stack_names` |

**Auxiliary Variables (Auto-Bound)**

| Role | Trigger |
|------|---------|
| Stack pointers | `top`, `peek` |

> Pointer badges attach to the **right side** of the corresponding element.

---

## 7. Trees & BSTs — `<Tree />`

Renders a top-down hierarchical tree. Node coordinates are auto-calculated using an in-order layout algorithm.

**Primary Structure Prefixes**

| Prefix | Example |
|--------|---------|
| `tree_` | `vector<TreeNode> tree_nodes` |
| `bst_` | `vector<Node> bst_data` |

**Required Node Data Structure**

Each node object must have an `id`, `value`, and optional `left`/`right` child pointers (mapped to other node IDs).

```json
[
  { "id": "0", "value": "10", "left": "1", "right": "2" },
  { "id": "1", "value": "5" },
  { "id": "2", "value": "15" }
]
```

**Auxiliary Variables (Auto-Bound)**

| Role | Trigger |
|------|---------|
| Core pointers | `root`, `curr`, `parent`, `temp` |
| Branch pointers | `left`, `right` |

> Variables must store the target node's `id` (string or number). Badges attach above the target node.

---

## Quick Reference

| Component | Primary Prefixes | Key Auxiliary Variables |
|-----------|-----------------|------------------------|
| `<Graph />` | `adj`, `graph`, `tree` | `*edge*`, `*visit*`, `node`/`curr`/`u`/`v` |
| `<D2Array />` | `mat`, `grid`, `board`, `dp` | `r`/`row`, `c`/`col` (both required) |
| `<D1Array />` | `arr`, `vec`, `num`, `list`, `seq` | `i`, `j`, `k`, `left`, `right`, `mid`, `curr`, `ptr` |
| `<LinkedList />` | `ll_`, `list_`, `head` | `head`, `tail`, `curr`, `prev`, `next`, `slow`, `fast` |
| `<Queue />` | `q_`, `queue`, `deque` | `front`, `back`, `rear`, `head`, `tail`, `curr` |
| `<Stack />` | `st_`, `stack` | `top`, `peek` |
| `<Tree />` | `tree_`, `bst_` | `root`, `curr`, `parent`, `temp`, `left`, `right` |