const RANGE_STRUCTURES_SECTION = {
  name: "Range Structures",
  href: "/algorithms/range_structures",
  iconId: "RangeStructures",
  hoverIconId: "RangeStructures",

  about: [
    { tag: "h1", text: "Range Structures" },
    {
      tag: "p",
      text: "Range structures answer queries about a CONTIGUOUS RANGE of an array — sum, minimum, maximum, GCD, or any other associative aggregate — efficiently, even when the underlying array can also be UPDATED. The naive approach recomputes the aggregate over the requested range from scratch every query, costing O(range length) per query; every structure in this section exists to beat that bound by precomputing and maintaining partial aggregates that can be combined quickly.",
    },
    {
      tag: "p",
      text: "The defining trade-off across this entire section is STATIC vs. DYNAMIC data. If the array never changes after being built, a Sparse Table achieves the best possible query time (O(1)) by precomputing every useful range upfront. If the array needs to support updates, a Segment Tree or Fenwick Tree is required instead, trading that O(1) query time for O(log n) query AND O(log n) update — Square Root Decomposition sits in between, offering a simpler-to-implement O(√n) for both, useful when O(log n) implementation complexity isn't worth it for the problem at hand.",
    },
    { tag: "h2", text: "Choosing the right structure" },
    {
      tag: "table",
      headers: ["Structure", "Build", "Query", "Update", "Best For"],
      rows: [
        [
          "Segment Tree",
          "O(n)",
          "O(log n)",
          "O(log n)",
          "General-purpose: any associative operation, point or range updates",
        ],
        [
          "Fenwick Tree (BIT)",
          "O(n log n) naive / O(n) optimal",
          "O(log n)",
          "O(log n)",
          "Prefix sums and similar invertible operations, simpler to code than Segment Tree",
        ],
        [
          "Sparse Table",
          "O(n log n)",
          "O(1)",
          "Not supported (static only)",
          "Static arrays with many repeated queries — e.g. Range Minimum Query",
        ],
        [
          "Square Root Decomposition",
          "O(n)",
          "O(√n)",
          "O(√n)",
          "Simpler implementation when O(log n) isn't required, or for operations that don't fit a tree/BIT cleanly",
        ],
      ],
    },
    { tag: "h2", text: "The idempotence distinction" },
    {
      tag: "p",
      text: "A subtle but important detail: Sparse Table's O(1) query trick (using two possibly-OVERLAPPING precomputed ranges to cover the query range) only works correctly for IDEMPOTENT operations — ones where combining a value with itself changes nothing (min(x, x) = x, max(x, x) = x, gcd(x, x) = x). It does NOT work for sum, since sum(x, x) = 2x ≠ x — overlapping ranges would double-count. This is why Sparse Table is the go-to for Range MIN/MAX Query specifically, while Fenwick Tree and Segment Tree handle sum (and other non-idempotent operations) correctly.",
    },
    {
      tag: "note",
      variant: "tip",
      text: "If a problem only ever needs to answer range queries on a NEVER-CHANGING array, always reach for Sparse Table first when the operation is idempotent (min/max/gcd) — O(1) per query is unbeatable, and the O(n log n) build cost is a one-time fee.",
    },
  ],

  items: [
    /* ════════════════════════════════════════════════════════════════════
       1. SEGMENT TREE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Segment Tree",
      href: "/algorithms/range_structures/segment-tree",
      type: "Hard",

      about: [
        { tag: "h1", text: "Segment Tree" },
        {
          tag: "p",
          text: "A Segment Tree is a binary tree built over an array, where each leaf represents a single array element, and each internal node represents the AGGREGATE (sum, min, max, or any associative operation) of its entire subtree's range. This structure allows both range queries AND point/range updates in O(log n), making it the most general-purpose and flexible range structure in this section — it works for essentially any associative operation, not just sum or idempotent operations like Sparse Table requires.",
        },
        {
          tag: "p",
          text: "The tree is conventionally stored in a flat array (not pointer-based nodes), using the same index arithmetic as a binary heap: node i's children are at 2i+1 and 2i+2. A query or update walks down from the root, recursively splitting the requested range against each node's covered range — fully contained, fully disjoint, or partially overlapping — and only recursing into children when partial overlap requires it.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Range queries (sum, min, max, GCD, or any associative combiner) on an array that ALSO needs to support updates — the single most general-purpose range structure when both capabilities are needed simultaneously",
            "Competitive programming problems requiring range updates (add a value to an entire range) combined with range queries — solved with 'lazy propagation', an extension that defers update work until a node is actually visited by a later query",
            "Computational geometry sweep-line algorithms, where a Segment Tree often tracks coverage or intersection counts across a dynamically changing set of intervals",
            "Any problem where Fenwick Tree's simpler structure doesn't directly support the needed operation (Fenwick Tree is naturally suited to invertible operations like sum; Segment Tree handles non-invertible ones like min/max just as easily)",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "Segment Tree is strictly more general than Fenwick Tree — anything a Fenwick Tree can do, a Segment Tree can also do, often with the same O(log n) bounds. Fenwick Tree's advantage is purely implementation simplicity and a smaller constant factor for the specific case of prefix-sum-style queries.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(log n) query/update",
        best: [
          { tag: "h2", text: "Best Case — O(1) query" },
          {
            tag: "p",
            text: "If the queried range happens to EXACTLY match a single node's covered range (e.g. querying the entire array, which exactly matches the root), the query resolves immediately without needing to recurse into any children at all.",
          },
          {
            tag: "ul",
            items: [
              "Exact node-range match: O(1), since no further recursion is needed once a node's range exactly equals the query range",
              "This is a favourable-input case, not the general bound for arbitrary range queries",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n) query, O(log n) update" },
          {
            tag: "p",
            text: "A typical range query recurses down the tree, and at each level, at most a constant number of nodes are 'partially overlapping' and require further recursion — bounding the total visited nodes by the tree's height, O(log n).",
          },
          {
            tag: "ul",
            items: [
              "Query: at each of the O(log n) levels, at most O(1) nodes require splitting into both children (the rest are either fully contained — answered immediately — or fully disjoint — skipped immediately): O(log n) total",
              "Update (point update): follows a single root-to-leaf path, updating O(log n) ancestors along the way: O(log n)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n) query, O(log n) update" },
          {
            tag: "p",
            text: "No query range or update position increases the cost beyond the tree's fixed height — this holds regardless of how 'awkwardly' a range query happens to be positioned relative to the tree's node boundaries.",
          },
          {
            tag: "ul",
            items: [
              "Worst case matches average exactly: O(log n) for both query and update, since tree height is structurally fixed at ⌈log₂ n⌉ regardless of query/update pattern",
              "This guaranteed bound (no adversarial input degrades it) is a key structural advantage shared with Fenwick Tree, in contrast to data structures whose performance can vary with access pattern",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          {
            tag: "p",
            text: "The flat-array representation of the tree always requires space proportional to n, typically allocated as an array of size 4n (a conventional safe upper bound that accommodates the tree's structure regardless of whether n is a power of 2).",
          },
          {
            tag: "ul",
            items: [
              "Tree array: O(n) (commonly sized 4n as a simple, safe, non-tight upper bound)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          {
            tag: "p",
            text: "Space usage is fixed by the original array's length alone, regardless of the specific values stored or which aggregate operation the tree is built around.",
          },
          {
            tag: "ul",
            items: ["Same O(n) bound regardless of value distribution or query/update history"],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "No input array configuration increases space beyond the fixed tree-array allocation — this is both the floor and ceiling for the structure's memory footprint.",
          },
          {
            tag: "ul",
            items: [
              "O(n) total, identical across all cases — a tight implementation using exactly 2n (for a 'iterative bottom-up' Segment Tree variant restricted to n being a power of 2) is possible, but the conventional 4n bound remains O(n) regardless",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "p",
          text: "Sum-based Segment Tree (the same template generalises directly to min/max/GCD by swapping the combine operation):",
        },
        {
          tag: "code",
          language: "text",
          text: `function build(arr, node, start, end):
    if start == end:
        tree[node] ← arr[start]
        return
    mid ← (start + end) / 2
    build(arr, 2*node + 1, start, mid)
    build(arr, 2*node + 2, mid + 1, end)
    tree[node] ← tree[2*node + 1] + tree[2*node + 2]

function update(node, start, end, idx, value):
    if start == end:
        tree[node] ← value
        return
    mid ← (start + end) / 2
    if idx <= mid:
        update(2*node + 1, start, mid, idx, value)
    else:
        update(2*node + 2, mid + 1, end, idx, value)
    tree[node] ← tree[2*node + 1] + tree[2*node + 2]

function query(node, start, end, L, R):              // query range [L, R]
    if R < start or end < L:
        return IDENTITY                                // fully disjoint — contributes nothing
    if L <= start and end <= R:
        return tree[node]                               // fully contained — return directly
    mid ← (start + end) / 2
    return query(2*node+1, start, mid, L, R) + query(2*node+2, mid+1, end, L, R)`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "build: recursively split the array's range in half until reaching single-element leaves, then combine each pair of children's values bottom-up to populate every internal node with its subtree's aggregate.",
            "update: walk down to the specific leaf corresponding to the index being updated, change its value, then recombine every ancestor on the path back up to the root, since each ancestor's stored aggregate depends on this leaf.",
            "query: at each node, check the relationship between the node's covered range and the query range — fully disjoint (contribute nothing, return the operation's identity value, e.g. 0 for sum), fully contained (return this node's precomputed aggregate directly, no further recursion needed), or partially overlapping (recurse into both children and combine their results).",
            "The query's total work is bounded because at each tree level, only the nodes whose range is partially (not fully) overlapping with the query range require further recursion — and there are at most O(1) such 'boundary' nodes per level, giving O(log n) total across all levels.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "By construction (and maintained by every update), each internal node's stored value is exactly the combined aggregate of its entire subtree's range — this invariant is established during build (bottom-up combination) and correctly re-established after every update (by recombining every ancestor on the path from the changed leaf back to the root). The query function's three-way case split correctly and completely partitions any possible relationship between a node's range and the query range: fully outside contributes the identity element (correctly adding nothing to the combined result), fully inside returns the exact precomputed answer for that sub-range (correct by the maintained invariant), and partial overlap is correctly handled by recursively combining the contributions from both children, which together exactly cover the node's full range. Since these three cases are exhaustive and each correctly resolves its scenario, the overall query result is exactly the correct aggregate over the full requested range [L, R].",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

struct SegmentTreeNode {
    int start;
    int end;
    int value;
    SegmentTreeNode* left;
    SegmentTreeNode* right;

    SegmentTreeNode(int s, int e) {
        start = s; end = e; value = 0;
        left = nullptr; right = nullptr;
    }
};

SegmentTreeNode* build(vector<int>& arr, int start, int end) {
    SegmentTreeNode* node = new SegmentTreeNode(start, end);
    if (start == end) {
        node->value = arr[start];
        return node;
    }
    int mid = (start + end) / 2;
    node->left = build(arr, start, mid);
    node->right = build(arr, mid + 1, end);
    node->value = node->left->value + node->right->value;
    return node;
}

void update(SegmentTreeNode* node, int idx, int val) {
    if (node->start == node->end) {
        node->value = val;
        return;
    }
    int mid = (node->start + node->end) / 2;
    if (idx <= mid) update(node->left, idx, val);
    else update(node->right, idx, val);
    node->value = node->left->value + node->right->value;
}

int query(SegmentTreeNode* node, int l, int r) {
    if (r < node->start || l > node->end) return 0;
    if (l <= node->start && r >= node->end) return node->value;
    return query(node->left, l, r) + query(node->right, l, r);
}

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11};
    SegmentTreeNode* root = build(arr, 0, arr.size() - 1);
    cout << "Sum [1, 3]: " << query(root, 1, 3) << "\n";
    update(root, 2, 10);
    cout << "Sum [1, 3] after update: " << query(root, 1, 3) << "\n";
    return 0;
}`,
        python: `class SegmentTreeNode:
    def __init__(self, start, end):
        self.start = start
        self.end = end
        self.value = 0
        self.left = None
        self.right = None

def build(arr, start, end):
    node = SegmentTreeNode(start, end)
    if start == end:
        node.value = arr[start]
        return node
    mid = (start + end) // 2
    node.left = build(arr, start, mid)
    node.right = build(arr, mid + 1, end)
    node.value = node.left.value + node.right.value
    return node

def update(node, idx, val):
    if node.start == node.end:
        node.value = val
        return
    mid = (node.start + node.end) // 2
    if idx <= mid:
        update(node.left, idx, val)
    else:
        update(node.right, idx, val)
    node.value = node.left.value + node.right.value

def query(node, l, r):
    if r < node.start or l > node.end:
        return 0
    if l <= node.start and r >= node.end:
        return node.value
    return query(node.left, l, r) + query(node.right, l, r)

if __name__ == "__main__":
    arr = [1, 3, 5, 7, 9, 11]
    root = build(arr, 0, len(arr) - 1)
    print(f"Sum [1, 3]: {query(root, 1, 3)}")
    update(root, 2, 10)
    print(f"Sum [1, 3] after update: {query(root, 1, 3)}")`,
        java: `public class Main {
    static class SegmentTreeNode {
        int start, end, value;
        SegmentTreeNode left, right;
        SegmentTreeNode(int s, int e) { start = s; end = e; }
    }

    static SegmentTreeNode build(int[] arr, int start, int end) {
        SegmentTreeNode node = new SegmentTreeNode(start, end);
        if (start == end) {
            node.value = arr[start];
            return node;
        }
        int mid = (start + end) / 2;
        node.left = build(arr, start, mid);
        node.right = build(arr, mid + 1, end);
        node.value = node.left.value + node.right.value;
        return node;
    }

    static void update(SegmentTreeNode node, int idx, int val) {
        if (node.start == node.end) {
            node.value = val;
            return;
        }
        int mid = (node.start + node.end) / 2;
        if (idx <= mid) update(node.left, idx, val);
        else update(node.right, idx, val);
        node.value = node.left.value + node.right.value;
    }

    static int query(SegmentTreeNode node, int l, int r) {
        if (r < node.start || l > node.end) return 0;
        if (l <= node.start && r >= node.end) return node.value;
        return query(node.left, l, r) + query(node.right, l, r);
    }

    public static void main(String[] args) {
        int[] arr = {1, 3, 5, 7, 9, 11};
        SegmentTreeNode root = build(arr, 0, arr.length - 1);
        System.out.println("Sum [1, 3]: " + query(root, 1, 3));
        update(root, 2, 10);
        System.out.println("Sum [1, 3] after update: " + query(root, 1, 3));
    }
}`,
        js: `class SegmentTreeNode {
    constructor(start, end) {
        this.start = start; this.end = end; this.value = 0;
        this.left = null; this.right = null;
    }
}

function build(arr, start, end) {
    const node = new SegmentTreeNode(start, end);
    if (start === end) {
        node.value = arr[start];
        return node;
    }
    const mid = Math.floor((start + end) / 2);
    node.left = build(arr, start, mid);
    node.right = build(arr, mid + 1, end);
    node.value = node.left.value + node.right.value;
    return node;
}

function update(node, idx, val) {
    if (node.start === node.end) {
        node.value = val;
        return;
    }
    const mid = Math.floor((node.start + node.end) / 2);
    if (idx <= mid) update(node.left, idx, val);
    else update(node.right, idx, val);
    node.value = node.left.value + node.right.value;
}

function query(node, l, r) {
    if (r < node.start || l > node.end) return 0;
    if (l <= node.start && r >= node.end) return node.value;
    return query(node.left, l, r) + query(node.right, l, r);
}

const arr = [1, 3, 5, 7, 9, 11];
const root = build(arr, 0, arr.length - 1);
console.log("Sum [1, 3]:", query(root, 1, 3));
update(root, 2, 10);
console.log("Sum [1, 3] after update:", query(root, 1, 3));`,
        c: `#include <stdio.h>
#include <stdlib.h>

typedef struct SegmentTreeNode {
    int start, end, value;
    struct SegmentTreeNode *left, *right;
} Node;

Node* build(int* arr, int start, int end) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->start = start; node->end = end;
    if (start == end) {
        node->value = arr[start];
        node->left = node->right = NULL;
        return node;
    }
    int mid = (start + end) / 2;
    node->left = build(arr, start, mid);
    node->right = build(arr, mid + 1, end);
    node->value = node->left->value + node->right->value;
    return node;
}

void update(Node* node, int idx, int val) {
    if (node->start == node->end) {
        node->value = val;
        return;
    }
    int mid = (node->start + node->end) / 2;
    if (idx <= mid) update(node->left, idx, val);
    else update(node->right, idx, val);
    node->value = node->left->value + node->right->value;
}

int query(Node* node, int l, int r) {
    if (r < node->start || l > node->end) return 0;
    if (l <= node->start && r >= node->end) return node->value;
    return query(node->left, l, r) + query(node->right, l, r);
}

int main() {
    int arr[] = {1, 3, 5, 7, 9, 11};
    Node* root = build(arr, 0, 5);
    printf("Sum [1, 3]: %d\\n", query(root, 1, 3));
    update(root, 2, 10);
    printf("Sum [1, 3] after update: %d\\n", query(root, 1, 3));
    return 0;
}`,
        "c#": `using System;

class Program {
    class SegmentTreeNode {
        public int start, end, value;
        public SegmentTreeNode left, right;
        public SegmentTreeNode(int s, int e) { start = s; end = e; }
    }

    static SegmentTreeNode Build(int[] arr, int start, int end) {
        var node = new SegmentTreeNode(start, end);
        if (start == end) {
            node.value = arr[start];
            return node;
        }
        int mid = (start + end) / 2;
        node.left = Build(arr, start, mid);
        node.right = Build(arr, mid + 1, end);
        node.value = node.left.value + node.right.value;
        return node;
    }

    static void Update(SegmentTreeNode node, int idx, int val) {
        if (node.start == node.end) {
            node.value = val;
            return;
        }
        int mid = (node.start + node.end) / 2;
        if (idx <= mid) Update(node.left, idx, val);
        else Update(node.right, idx, val);
        node.value = node.left.value + node.right.value;
    }

    static int Query(SegmentTreeNode node, int l, int r) {
        if (r < node.start || l > node.end) return 0;
        if (l <= node.start && r >= node.end) return node.value;
        return Query(node.left, l, r) + Query(node.right, l, r);
    }

    static void Main() {
        int[] arr = {1, 3, 5, 7, 9, 11};
        var root = Build(arr, 0, arr.Length - 1);
        Console.WriteLine($"Sum [1, 3]: {Query(root, 1, 3)}");
        Update(root, 2, 10);
        Console.WriteLine($"Sum [1, 3] after update: {Query(root, 1, 3)}");
    }
}`,
        swift: `class SegmentTreeNode {
    var start: Int, end: Int, value: Int = 0
    var left: SegmentTreeNode?, right: SegmentTreeNode?
    init(_ s: Int, _ e: Int) { start = s; end = e }
}

func build(_ arr: [Int], _ start: Int, _ end: Int) -> SegmentTreeNode {
    let node = SegmentTreeNode(start, end)
    if start == end {
        node.value = arr[start]
        return node
    }
    let mid = (start + end) / 2
    node.left = build(arr, start, mid)
    node.right = build(arr, mid + 1, end)
    node.value = node.left!.value + node.right!.value
    return node
}

func update(_ node: SegmentTreeNode, _ idx: Int, _ val: Int) {
    if node.start == node.end {
        node.value = val
        return
    }
    let mid = (node.start + node.end) / 2
    if idx <= mid { update(node.left!, idx, val) }
    else { update(node.right!, idx, val) }
    node.value = node.left!.value + node.right!.value
}

func query(_ node: SegmentTreeNode, _ l: Int, _ r: Int) -> Int {
    if r < node.start || l > node.end { return 0 }
    if l <= node.start && r >= node.end { return node.value }
    return query(node.left!, l, r) + query(node.right!, l, r)
}

let arr = [1, 3, 5, 7, 9, 11]
let root = build(arr, 0, arr.count - 1)
print("Sum [1, 3]: \\(query(root, 1, 3))")
update(root, 2, 10)
print("Sum [1, 3] after update: \\(query(root, 1, 3))")`,
        kotlin: `class SegmentTreeNode(var start: Int, var end: Int) {
    var value = 0
    var left: SegmentTreeNode? = null
    var right: SegmentTreeNode? = null
}

fun build(arr: IntArray, start: Int, end: Int): SegmentTreeNode {
    val node = SegmentTreeNode(start, end)
    if (start == end) {
        node.value = arr[start]
        return node
    }
    val mid = (start + end) / 2
    node.left = build(arr, start, mid)
    node.right = build(arr, mid + 1, end)
    node.value = node.left!!.value + node.right!!.value
    return node
}

fun update(node: SegmentTreeNode, idx: Int, \`val\`: Int) {
    if (node.start == node.end) {
        node.value = \`val\`
        return
    }
    val mid = (node.start + node.end) / 2
    if (idx <= mid) update(node.left!!, idx, \`val\`)
    else update(node.right!!, idx, \`val\`)
    node.value = node.left!!.value + node.right!!.value
}

fun query(node: SegmentTreeNode, l: Int, r: Int): Int {
    if (r < node.start || l > node.end) return 0
    if (l <= node.start && r >= node.end) return node.value
    return query(node.left!!, l, r) + query(node.right!!, l, r)
}

fun main() {
    val arr = intArrayOf(1, 3, 5, 7, 9, 11)
    val root = build(arr, 0, arr.size - 1)
    println("Sum [1, 3]: \${query(root, 1, 3)}")
    update(root, 2, 10)
    println("Sum [1, 3] after update: \${query(root, 1, 3)}")
}`,
        scala: `class SegmentTreeNode(val start: Int, val end: Int) {
    var value: Int = 0
    var left: SegmentTreeNode = _
    var right: SegmentTreeNode = _
}

object Main extends App {
    def build(arr: Array[Int], start: Int, end: Int): SegmentTreeNode = {
        val node = new SegmentTreeNode(start, end)
        if (start == end) {
            node.value = arr(start)
            return node
        }
        val mid = (start + end) / 2
        node.left = build(arr, start, mid)
        node.right = build(arr, mid + 1, end)
        node.value = node.left.value + node.right.value
        node
    }

    def update(node: SegmentTreeNode, idx: Int, value: Int): Unit = {
        if (node.start == node.end) {
            node.value = value
            return
        }
        val mid = (node.start + node.end) / 2
        if (idx <= mid) update(node.left, idx, value)
        else update(node.right, idx, value)
        node.value = node.left.value + node.right.value
    }

    def query(node: SegmentTreeNode, l: Int, r: Int): Int = {
        if (r < node.start || l > node.end) return 0
        if (l <= node.start && r >= node.end) return node.value
        query(node.left, l, r) + query(node.right, l, r)
    }

    val arr = Array(1, 3, 5, 7, 9, 11)
    val root = build(arr, 0, arr.length - 1)
    println(s"Sum [1, 3]: \${query(root, 1, 3)}")
    update(root, 2, 10)
    println(s"Sum [1, 3] after update: \${query(root, 1, 3)}")
}`,
        go: `package main

import "fmt"

type SegmentTreeNode struct {
    start, end, value int
    left, right       *SegmentTreeNode
}

func build(arr []int, start, end int) *SegmentTreeNode {
    node := &SegmentTreeNode{start: start, end: end}
    if start == end {
        node.value = arr[start]
        return node
    }
    mid := (start + end) / 2
    node.left = build(arr, start, mid)
    node.right = build(arr, mid+1, end)
    node.value = node.left.value + node.right.value
    return node
}

func update(node *SegmentTreeNode, idx, val int) {
    if node.start == node.end {
        node.value = val
        return
    }
    mid := (node.start + node.end) / 2
    if idx <= mid {
        update(node.left, idx, val)
    } else {
        update(node.right, idx, val)
    }
    node.value = node.left.value + node.right.value
}

func query(node *SegmentTreeNode, l, r int) int {
    if r < node.start || l > node.end {
        return 0
    }
    if l <= node.start && r >= node.end {
        return node.value
    }
    return query(node.left, l, r) + query(node.right, l, r)
}

func main() {
    arr := []int{1, 3, 5, 7, 9, 11}
    root := build(arr, 0, len(arr)-1)
    fmt.Printf("Sum [1, 3]: %d\\n", query(root, 1, 3))
    update(root, 2, 10)
    fmt.Printf("Sum [1, 3] after update: %d\\n", query(root, 1, 3))
}`,
        rust: `struct SegmentTreeNode {
    start: usize,
    end: usize,
    value: i32,
    left: Option<Box<SegmentTreeNode>>,
    right: Option<Box<SegmentTreeNode>>,
}

fn build(arr: &[i32], start: usize, end: usize) -> Option<Box<SegmentTreeNode>> {
    let mut node = Box::new(SegmentTreeNode {
        start, end, value: 0, left: None, right: None,
    });
    if start == end {
        node.value = arr[start];
        return Some(node);
    }
    let mid = (start + end) / 2;
    node.left = build(arr, start, mid);
    node.right = build(arr, mid + 1, end);
    node.value = node.left.as_ref().unwrap().value + node.right.as_ref().unwrap().value;
    Some(node)
}

fn update(node: &mut SegmentTreeNode, idx: usize, val: i32) {
    if node.start == node.end {
        node.value = val;
        return;
    }
    let mid = (node.start + node.end) / 2;
    if idx <= mid {
        update(node.left.as_mut().unwrap(), idx, val);
    } else {
        update(node.right.as_mut().unwrap(), idx, val);
    }
    node.value = node.left.as_ref().unwrap().value + node.right.as_ref().unwrap().value;
}

fn query(node: &SegmentTreeNode, l: usize, r: usize) -> i32 {
    if r < node.start || l > node.end { return 0; }
    if l <= node.start && r >= node.end { return node.value; }
    query(node.left.as_ref().unwrap(), l, r) + query(node.right.as_ref().unwrap(), l, r)
}

fn main() {
    let arr = vec![1, 3, 5, 7, 9, 11];
    let mut root = build(&arr, 0, arr.len() - 1).unwrap();
    println!("Sum [1, 3]: {}", query(&root, 1, 3));
    update(&mut root, 2, 10);
    println!("Sum [1, 3] after update: {}", query(&root, 1, 3));
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       2. FENWICK TREE (BIT)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Fenwick Tree (BIT)",
      href: "/algorithms/range_structures/fenwick",
      type: "Medium",

      about: [
        { tag: "h1", text: "Fenwick Tree (Binary Indexed Tree)" },
        {
          tag: "p",
          text: "A Fenwick Tree, devised by Peter Fenwick in 1994, answers prefix-sum queries (and, with a small extension, arbitrary range-sum queries via subtraction) and supports point updates, both in O(log n) — achieving the same asymptotic bounds as a Segment Tree for this specific class of operations, but with a notably simpler implementation: no explicit tree structure, no recursion required, just a single array and one bit-level trick.",
        },
        {
          tag: "p",
          text: "The entire mechanism rests on a single identity: i & (-i) isolates the LOWEST SET BIT of i (the same bit-clearing family of tricks covered in the Bit Manipulation section). Each index i in the Fenwick array is made 'responsible for' a range of the original array whose length is exactly that lowest-set-bit value — this clever, implicit range assignment is what allows both updates and prefix-sum queries to be computed by repeatedly jumping between indices using exactly this one bitwise operation, with no explicit tree traversal needed.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Range-sum queries (or any operation expressible via prefix sums and subtraction) on an array that also needs point updates — the standard, simplest choice for 'sum of range [l, r], with point updates' specifically",
            "Counting inversions in an array (a classic application: process elements and use Fenwick Tree to count, in O(log n) per element, how many already-processed elements are less than the current one)",
            "Competitive programming, where Fenwick Tree's much shorter and simpler implementation (compared to a full Segment Tree) is frequently preferred whenever the problem's operation fits its invertible-aggregate model",
            "As a strict subset of Segment Tree's capability: any problem solvable by Fenwick Tree is also solvable by Segment Tree, but not vice versa (Segment Tree also handles non-invertible operations like min/max, which Fenwick Tree's prefix-subtraction trick cannot)",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Fenwick Tree's range-query trick (rangeSum(l, r) = prefixSum(r) − prefixSum(l−1)) only works for INVERTIBLE operations like sum, where subtraction correctly 'removes' a sub-range's contribution — it does NOT work for min, max, or GCD, which have no inverse operation; use a Segment Tree for those instead.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "If the queried prefix-sum index has very few set bits in its binary representation (e.g. index 1, which is just a single bit), the query loop terminates after very few iterations.",
          },
          {
            tag: "ul",
            items: [
              "Index with a single set bit (e.g. a power of 2): as few as 1 iteration — O(1)",
              "This is a favourable-input case, not the general bound",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          {
            tag: "p",
            text: "Both query and update repeatedly jump between indices using the lowest-set-bit operation, and the number of jumps is bounded by the number of bits in the index, which is O(log n).",
          },
          {
            tag: "ul",
            items: [
              "Query (prefix sum up to index i): repeatedly subtract the lowest set bit (i ← i − (i & −i)) until reaching 0, accumulating the value at each visited index — bounded by O(log n) jumps, since each jump clears at least one bit",
              "Update (add a value at index i): repeatedly add the lowest set bit (i ← i + (i & −i)) until exceeding n, updating the value at each visited index — also bounded by O(log n) jumps",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n)" },
          {
            tag: "p",
            text: "If the index has the maximum possible number of set bits (e.g. all 1s in binary, like 0b1111), both the query and update loops must perform the maximum number of jumps before terminating.",
          },
          {
            tag: "ul",
            items: [
              "Worst case: O(log n) jumps, bounded by the bit-width of n",
              "This guaranteed bound (no adversarial index degrades it beyond O(log n)) matches Segment Tree's bound for the same class of operations, with a notably simpler implementation",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          {
            tag: "p",
            text: "The Fenwick array always requires exactly n+1 entries (typically using 1-indexing for the bit-trick to work cleanly), regardless of the specific values stored.",
          },
          { tag: "ul", items: ["Fenwick array: O(n)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          {
            tag: "p",
            text: "Space usage is fixed by the original array's length alone — notably smaller in practice than a Segment Tree's conventional 4n allocation, despite both being O(n) asymptotically.",
          },
          {
            tag: "ul",
            items: [
              "Same O(n) bound regardless of value distribution, with a smaller constant factor than the typical Segment Tree implementation",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "No input array configuration increases space beyond the fixed n+1-entry array — this is both the floor and ceiling for the structure's memory footprint.",
          },
          {
            tag: "ul",
            items: [
              "O(n) total, identical across all cases — a meaningful practical advantage over Segment Tree's larger constant factor, while matching its asymptotic class",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function update(tree, n, index, delta):     // index is 1-based
    while index <= n:
        tree[index] ← tree[index] + delta
        index ← index + (index & −index)      // jump to the next responsible index

function prefixSum(tree, index):              // sum of elements [1, index]
    sum ← 0
    while index > 0:
        sum ← sum + tree[index]
        index ← index − (index & −index)       // jump to the next contributing index
    return sum

function rangeSum(tree, left, right):          // sum of elements [left, right], 1-based
    return prefixSum(tree, right) − prefixSum(tree, left − 1)`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "update(index, delta): starting at the given index, repeatedly add delta to tree[index], then jump to the NEXT index that's also responsible for covering this position, computed via index + (index & −index) — continue until exceeding the array bounds.",
            "prefixSum(index): starting at the given index, repeatedly add tree[index] to a running sum, then jump DOWN to the next index that contributes to this prefix, computed via index − (index & −index) — continue until reaching 0.",
            "The two jump directions (adding vs. subtracting the lowest set bit) are deliberately opposite: update propagates UPWARD to every ancestor range that includes this position, while query walks DOWNWARD, accumulating contributions from a decreasing sequence of ranges that together exactly cover [1, index].",
            "rangeSum(left, right): compute the prefix sum up to 'right', then subtract the prefix sum up to 'left − 1' — since prefix sums are simple cumulative totals, subtracting removes exactly the unwanted portion, exactly like the basic Prefix Sum technique covered in the Arrays section.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Each Fenwick array index i is implicitly responsible for covering exactly the range of original-array positions [i − (i & −i) + 1, i] — a range whose length is precisely i's lowest set bit value, a consequence of how binary representations decompose. The update operation's upward-jumping sequence (i ← i + (i & −i)) correctly visits every Fenwick index whose RESPONSIBLE RANGE includes the updated position, since adding the lowest set bit is exactly the operation that finds the next index whose range extends to cover the current one. The prefixSum operation's downward-jumping sequence correctly decomposes the range [1, index] into a small number of DISJOINT, non-overlapping Fenwick-responsible ranges whose union exactly equals [1, index] — this decomposition is guaranteed unique and complete because subtracting the lowest set bit at each step is exactly equivalent to peeling off the binary representation of 'index' one set bit at a time, and any positive integer's binary representation has a unique decomposition into its set bits.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

vector<int> bit;
int n;

void update(int idx, int val) {
    for (; idx <= n; idx += idx & -idx) {
        bit[idx] += val;
    }
}

int query(int idx) {
    int sum = 0;
    for (; idx > 0; idx -= idx & -idx) {
        sum += bit[idx];
    }
    return sum;
}

int queryRange(int l, int r) {
    return query(r) - query(l - 1);
}

int main() {
    vector<int> arr = {0, 1, 3, 5, 7, 9, 11}; // 1-based indexing
    n = arr.size() - 1;
    bit.assign(n + 1, 0);
    
    for (int i = 1; i <= n; i++) update(i, arr[i]);
    cout << "Sum [2, 4]: " << queryRange(2, 4) << "\n";
    update(3, 5);
    cout << "Sum [2, 4] after update: " << queryRange(2, 4) << "\n";
    return 0;
}`,
        python: `bit = []
n = 0

def update(idx, val):
    while idx <= n:
        bit[idx] += val
        idx += idx & -idx

def query(idx):
    s = 0
    while idx > 0:
        s += bit[idx]
        idx -= idx & -idx
    return s

def query_range(l, r):
    return query(r) - query(l - 1)

if __name__ == "__main__":
    arr = [0, 1, 3, 5, 7, 9, 11] # 1-based
    n = len(arr) - 1
    bit = [0] * (n + 1)
    
    for i in range(1, n + 1):
        update(i, arr[i])
    print(f"Sum [2, 4]: {query_range(2, 4)}")
    update(3, 5)
    print(f"Sum [2, 4] after update: {query_range(2, 4)}")`,
        java: `public class Main {
    static int[] bit;
    static int n;

    static void update(int idx, int val) {
        for (; idx <= n; idx += idx & -idx) bit[idx] += val;
    }

    static int query(int idx) {
        int sum = 0;
        for (; idx > 0; idx -= idx & -idx) sum += bit[idx];
        return sum;
    }

    static int queryRange(int l, int r) {
        return query(r) - query(l - 1);
    }

    public static void main(String[] args) {
        int[] arr = {0, 1, 3, 5, 7, 9, 11}; // 1-based
        n = arr.length - 1;
        bit = new int[n + 1];
        
        for (int i = 1; i <= n; i++) update(i, arr[i]);
        System.out.println("Sum [2, 4]: " + queryRange(2, 4));
        update(3, 5);
        System.out.println("Sum [2, 4] after update: " + queryRange(2, 4));
    }
}`,
        js: `let bit = [];
let n = 0;

function update(idx, val) {
    for (; idx <= n; idx += idx & -idx) bit[idx] += val;
}

function query(idx) {
    let sum = 0;
    for (; idx > 0; idx -= idx & -idx) sum += bit[idx];
    return sum;
}

function queryRange(l, r) {
    return query(r) - query(l - 1);
}

const arr = [0, 1, 3, 5, 7, 9, 11]; // 1-based
n = arr.length - 1;
bit = new Array(n + 1).fill(0);

for (let i = 1; i <= n; i++) update(i, arr[i]);
console.log("Sum [2, 4]:", queryRange(2, 4));
update(3, 5);
console.log("Sum [2, 4] after update:", queryRange(2, 4));`,
        c: `#include <stdio.h>

int bit[100];
int n;

void update(int idx, int val) {
    for (; idx <= n; idx += idx & -idx) bit[idx] += val;
}

int query(int idx) {
    int sum = 0;
    for (; idx > 0; idx -= idx & -idx) sum += bit[idx];
    return sum;
}

int queryRange(int l, int r) {
    return query(r) - query(l - 1);
}

int main() {
    int arr[] = {0, 1, 3, 5, 7, 9, 11}; // 1-based
    n = 6;
    for (int i = 1; i <= n; i++) bit[i] = 0;
    
    for (int i = 1; i <= n; i++) update(i, arr[i]);
    printf("Sum [2, 4]: %d\\n", queryRange(2, 4));
    update(3, 5);
    printf("Sum [2, 4] after update: %d\\n", queryRange(2, 4));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int[] bit;
    static int n;

    static void Update(int idx, int val) {
        for (; idx <= n; idx += idx & -idx) bit[idx] += val;
    }

    static int Query(int idx) {
        int sum = 0;
        for (; idx > 0; idx -= idx & -idx) sum += bit[idx];
        return sum;
    }

    static int QueryRange(int l, int r) {
        return Query(r) - Query(l - 1);
    }

    static void Main() {
        int[] arr = {0, 1, 3, 5, 7, 9, 11}; // 1-based
        n = arr.Length - 1;
        bit = new int[n + 1];
        
        for (int i = 1; i <= n; i++) Update(i, arr[i]);
        Console.WriteLine($"Sum [2, 4]: {QueryRange(2, 4)}");
        Update(3, 5);
        Console.WriteLine($"Sum [2, 4] after update: {QueryRange(2, 4)}");
    }
}`,
        swift: `var bit = [Int]()
var n = 0

func update(_ index: Int, _ val: Int) {
    var idx = index
    while idx <= n {
        bit[idx] += val
        idx += idx & -idx
    }
}

func query(_ index: Int) -> Int {
    var sum = 0
    var idx = index
    while idx > 0 {
        sum += bit[idx]
        idx -= idx & -idx
    }
    return sum
}

func queryRange(_ l: Int, _ r: Int) -> Int {
    return query(r) - query(l - 1)
}

let arr = [0, 1, 3, 5, 7, 9, 11] // 1-based
n = arr.count - 1
bit = Array(repeating: 0, count: n + 1)

for i in 1...n { update(i, arr[i]) }
print("Sum [2, 4]: \\(queryRange(2, 4))")
update(3, 5)
print("Sum [2, 4] after update: \\(queryRange(2, 4))")`,
        kotlin: `var bit = IntArray(0)
var n = 0

fun update(index: Int, \`val\`: Int) {
    var idx = index
    while (idx <= n) {
        bit[idx] += \`val\`
        idx += idx and -idx
    }
}

fun query(index: Int): Int {
    var sum = 0
    var idx = index
    while (idx > 0) {
        sum += bit[idx]
        idx -= idx and -idx
    }
    return sum
}

fun queryRange(l: Int, r: Int): Int {
    return query(r) - query(l - 1)
}

fun main() {
    val arr = intArrayOf(0, 1, 3, 5, 7, 9, 11) // 1-based
    n = arr.size - 1
    bit = IntArray(n + 1)
    
    for (i in 1..n) update(i, arr[i])
    println("Sum [2, 4]: \${queryRange(2, 4)}")
    update(3, 5)
    println("Sum [2, 4] after update: \${queryRange(2, 4)}")
}`,
        scala: `object Main extends App {
    var bit: Array[Int] = _
    var n: Int = 0

    def update(index: Int, value: Int): Unit = {
        var idx = index
        while (idx <= n) {
            bit(idx) += value
            idx += idx & -idx
        }
    }

    def query(index: Int): Int = {
        var sum = 0
        var idx = index
        while (idx > 0) {
            sum += bit(idx)
            idx -= idx & -idx
        }
        sum
    }

    def queryRange(l: Int, r: Int): Int = {
        query(r) - query(l - 1)
    }

    val arr = Array(0, 1, 3, 5, 7, 9, 11) // 1-based
    n = arr.length - 1
    bit = Array.fill(n + 1)(0)
    
    for (i <- 1 to n) update(i, arr(i))
    println(s"Sum [2, 4]: \${queryRange(2, 4)}")
    update(3, 5)
    println(s"Sum [2, 4] after update: \${queryRange(2, 4)}")
}`,
        go: `package main

import "fmt"

var bit []int
var n int

func update(idx int, val int) {
    for ; idx <= n; idx += idx & -idx {
        bit[idx] += val
    }
}

func query(idx int) int {
    sum := 0
    for ; idx > 0; idx -= idx & -idx {
        sum += bit[idx]
    }
    return sum
}

func queryRange(l, r int) int {
    return query(r) - query(l-1)
}

func main() {
    arr := []int{0, 1, 3, 5, 7, 9, 11} // 1-based
    n = len(arr) - 1
    bit = make([]int, n+1)
    
    for i := 1; i <= n; i++ {
        update(i, arr[i])
    }
    fmt.Printf("Sum [2, 4]: %d\\n", queryRange(2, 4))
    update(3, 5)
    fmt.Printf("Sum [2, 4] after update: %d\\n", queryRange(2, 4))
}`,
        rust: `struct FenwickTree {
    bit: Vec<i32>,
    n: usize,
}

impl FenwickTree {
    fn new(n: usize) -> Self {
        FenwickTree { bit: vec![0; n + 1], n }
    }

    fn update(&mut self, mut idx: usize, val: i32) {
        while idx <= self.n {
            self.bit[idx] += val;
            idx += idx & (!idx + 1); // equivalent to idx & -idx
        }
    }

    fn query(&self, mut idx: usize) -> i32 {
        let mut sum = 0;
        while idx > 0 {
            sum += self.bit[idx];
            idx -= idx & (!idx + 1);
        }
        sum
    }

    fn query_range(&self, l: usize, r: usize) -> i32 {
        self.query(r) - self.query(l - 1)
    }
}

fn main() {
    let arr = vec![0, 1, 3, 5, 7, 9, 11]; // 1-based
    let n = arr.len() - 1;
    let mut ft = FenwickTree::new(n);
    
    for i in 1..=n {
        ft.update(i, arr[i]);
    }
    println!("Sum [2, 4]: {}", ft.query_range(2, 4));
    ft.update(3, 5);
    println!("Sum [2, 4] after update: {}", ft.query_range(2, 4));
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       3. SPARSE TABLE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Sparse Table",
      href: "/algorithms/range_structures/sparse-table",
      type: "Hard",

      about: [
        { tag: "h1", text: "Sparse Table" },
        {
          tag: "p",
          text: "A Sparse Table precomputes the answer for every range whose length is a POWER OF TWO, starting at every possible position — this allows ANY range query to be answered in O(1) by combining just TWO precomputed power-of-two ranges that together cover the full requested range (even if those two ranges OVERLAP), at the cost of O(n log n) preprocessing time and space, and the structure being entirely STATIC (no updates supported after construction).",
        },
        {
          tag: "p",
          text: "This O(1) query trick relies critically on the operation being IDEMPOTENT (combining a value with itself produces that same value, e.g. min(x, x) = x). For a range [L, R] of length len, find k = ⌊log₂(len)⌋, then combine the precomputed range starting at L with length 2^k, and the precomputed range ENDING at R with that same length 2^k — these two ranges might overlap in the middle, but for an idempotent operation like min/max, double-counting the overlapping portion changes nothing about the final answer.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Range Minimum Query (RMQ) or Range Maximum Query on a STATIC array (one that never changes after the structure is built) with MANY repeated queries — the O(1) per-query cost is unbeatable once the O(n log n) build cost is paid once",
            "As a preprocessing step for the Lowest Common Ancestor problem (Trees section): LCA can be reduced to an RMQ problem via Euler tour technique, and Sparse Table is the standard structure used to answer that resulting RMQ in O(1) per query",
            "GCD range queries on a static array — GCD is also idempotent (gcd(x, x) = x), making it another valid use case alongside min/max",
            "Specifically AVOID Sparse Table for sum queries (not idempotent — overlapping ranges would double-count) or for any scenario requiring updates after construction — Fenwick Tree or Segment Tree are the correct choices in those cases instead",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Using Sparse Table's overlapping-range trick for SUM queries is a classic correctness bug — sum(x, x) = 2x, not x, so the overlapping middle portion gets double-counted, silently producing a wrong (inflated) answer. Always verify idempotence before applying this technique to a new operation.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n log n) build / O(1) query",
        best: [
          { tag: "h2", text: "Best Case — O(n log n) build, O(1) query" },
          {
            tag: "p",
            text: "Building the table always requires computing every power-of-two range's value for every starting position — there's no shortcut even for the most favourable array content, since every table entry potentially contributes to some future query's answer.",
          },
          {
            tag: "ul",
            items: [
              "Build: for each of O(log n) power-of-two range LENGTHS, compute the answer for every one of O(n) possible starting positions, each in O(1) by combining two half-length ranges already computed: O(n log n) total",
              "Query: always exactly 2 lookups plus 1 combine operation, regardless of the specific range requested: O(1)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n) build, O(1) query" },
          {
            tag: "p",
            text: "Both build and query perform the same fixed structural work regardless of the array's specific values — table construction is a deterministic dynamic program over (length, start-position) pairs, and queries are always a fixed 2-lookup combination.",
          },
          {
            tag: "ul",
            items: [
              "Build: O(n log n), identical regardless of value distribution",
              "Query: O(1) per query, with m total queries costing O(m) combined",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n) build, O(1) query" },
          {
            tag: "p",
            text: "No array content increases the build or query cost beyond these fixed structural bounds — this is simultaneously the best, average, and worst case for both operations.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(n log n) build, O(1) per query",
              "For m total queries after the one-time build: O(n log n + m) overall, which is unbeatable for a static array with a large number of repeated queries, compared to Segment Tree's O(n + m log n) or naive recomputation's O(n·m)",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n log n)" },
          {
            tag: "p",
            text: "The table must store a precomputed answer for every (power-of-two length, starting position) combination — O(log n) possible lengths times O(n) possible starting positions, regardless of the array's specific values.",
          },
          {
            tag: "ul",
            items: ["2D table: O(log n) length-levels × O(n) starting positions = O(n log n)"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n log n)" },
          {
            tag: "p",
            text: "Space usage is fixed by the array's length alone, since every (length, position) combination must have a stored entry regardless of value distribution.",
          },
          { tag: "ul", items: ["Same O(n log n) bound regardless of array content"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n log n)" },
          {
            tag: "p",
            text: "No array configuration increases space beyond the fixed 2D table size — this is the structural cost of trading away update capability and Fenwick/Segment Tree's smaller O(n) footprint for genuinely O(1) queries.",
          },
          {
            tag: "ul",
            items: [
              "O(n log n) total, identical across all cases — notably more space than Fenwick Tree's or Segment Tree's O(n), the direct cost of achieving O(1) query time",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Range Minimum Query (RMQ) Sparse Table:" },
        {
          tag: "code",
          language: "text",
          text: `function buildSparseTable(arr):
    n ← length(arr)
    K ← floor(log2(n)) + 1
    table ← 2D array of size n x K

    for i from 0 to n − 1:
        table[i][0] ← arr[i]               // ranges of length 2^0 = 1

    for j from 1 to K − 1:
        for i from 0 to n − (1 << j):
            table[i][j] ← min(table[i][j − 1], table[i + (1 << (j − 1))][j − 1])

    return table

function query(table, L, R):                // inclusive range [L, R]
    length ← R − L + 1
    k ← floor(log2(length))
    return min(table[L][k], table[R − (1 << k) + 1][k])`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Build the base level (j = 0): every range of length 2^0 = 1 is just a single element, so table[i][0] is trivially arr[i].",
            "Build each subsequent level (j > 0) using the PREVIOUS level: a range of length 2^j starting at i can be split exactly in half into two ranges of length 2^(j-1) — combine their already-computed values (table[i][j-1] and table[i + 2^(j-1)][j-1]) to get this level's value, exactly like a bottom-up dynamic program.",
            "For a query on range [L, R], compute k = ⌊log₂(length)⌋ — the largest power of two that fits within the range's length.",
            "Combine TWO precomputed ranges of length 2^k: one starting at L (covering [L, L + 2^k − 1]), and one ENDING at R (covering [R − 2^k + 1, R]) — together, these two ranges are guaranteed to fully cover [L, R], possibly with some overlap in the middle.",
            "Since min (or max, or gcd) is idempotent, this overlap causes no correctness issue — the combined result of the two overlapping ranges is exactly the same as if the range had been covered without any overlap at all.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The build phase correctly computes table[i][j] as the minimum of the range [i, i + 2^j − 1] by induction on j: the base case (j=0, single elements) is trivially correct, and each subsequent level correctly combines two already-correctly-computed half-length ranges that, together, exactly and exhaustively cover the full 2^j-length range with no gaps. For the query phase, since 2^k ≤ length ≤ 2^(k+1) − 1 (by the definition of k as the largest power of two fitting within the range), the two chosen ranges [L, L+2^k−1] and [R−2^k+1, R] are each fully WITHIN the query range [L, R] (so they only include valid, in-range elements), and their UNION is guaranteed to cover the ENTIRE query range (since their combined length 2×2^k ≥ length, by the choice of k, they cannot fail to meet in the middle). Because the underlying operation is idempotent, the fact that they might overlap and 'double-count' some middle elements has no effect on the final combined value — min(min(A), min(B)) for any two ranges A and B that together cover [L,R], even with overlap, is always exactly min over [L,R].",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> st;
vector<int> logTable;
int n;

void build(vector<int>& arr) {
    n = arr.size();
    logTable.assign(n + 1, 0);
    for (int i = 2; i <= n; i++) logTable[i] = logTable[i/2] + 1;
    
    int K = logTable[n] + 1;
    st.assign(n, vector<int>(K, 0));

    for (int i = 0; i < n; i++) st[i][0] = arr[i];

    for (int j = 1; (1 << j) <= n; j++) {
        for (int i = 0; i + (1 << j) <= n; i++) {
            st[i][j] = min(st[i][j-1], st[i + (1 << (j - 1))][j - 1]);
        }
    }
}

int query(int L, int R) {
    int j = logTable[R - L + 1];
    return min(st[L][j], st[R - (1 << j) + 1][j]);
}

int main() {
    vector<int> arr = {7, 2, 3, 0, 5, 10};
    build(arr);
    cout << "Min [0, 4]: " << query(0, 4) << "\n";
    cout << "Min [4, 5]: " << query(4, 5) << "\n";
    return 0;
}`,
        python: `import math

st = []
log_table = []

def build(arr):
    global st, log_table
    n = len(arr)
    log_table = [0] * (n + 1)
    for i in range(2, n + 1):
        log_table[i] = log_table[i // 2] + 1
        
    K = log_table[n] + 1
    st = [[0] * K for _ in range(n)]
    
    for i in range(n):
        st[i][0] = arr[i]
        
    j = 1
    while (1 << j) <= n:
        i = 0
        while i + (1 << j) <= n:
            st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1])
            i += 1
        j += 1

def query(L, R):
    j = log_table[R - L + 1]
    return min(st[L][j], st[R - (1 << j) + 1][j])

if __name__ == "__main__":
    arr = [7, 2, 3, 0, 5, 10]
    build(arr)
    print(f"Min [0, 4]: {query(0, 4)}")
    print(f"Min [4, 5]: {query(4, 5)}")`,
        java: `public class Main {
    static int[][] st;
    static int[] logTable;
    static int n;

    static void build(int[] arr) {
        n = arr.length;
        logTable = new int[n + 1];
        for (int i = 2; i <= n; i++) logTable[i] = logTable[i / 2] + 1;
        
        int K = logTable[n] + 1;
        st = new int[n][K];
        
        for (int i = 0; i < n; i++) st[i][0] = arr[i];
        
        for (int j = 1; (1 << j) <= n; j++) {
            for (int i = 0; i + (1 << j) <= n; i++) {
                st[i][j] = Math.min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
            }
        }
    }

    static int query(int L, int R) {
        int j = logTable[R - L + 1];
        return Math.min(st[L][j], st[R - (1 << j) + 1][j]);
    }

    public static void main(String[] args) {
        int[] arr = {7, 2, 3, 0, 5, 10};
        build(arr);
        System.out.println("Min [0, 4]: " + query(0, 4));
        System.out.println("Min [4, 5]: " + query(4, 5));
    }
}`,
        js: `let st = [];
let logTable = [];
let n = 0;

function build(arr) {
    n = arr.length;
    logTable = new Array(n + 1).fill(0);
    for (let i = 2; i <= n; i++) logTable[i] = logTable[Math.floor(i / 2)] + 1;
    
    let K = logTable[n] + 1;
    st = Array.from({length: n}, () => new Array(K).fill(0));
    
    for (let i = 0; i < n; i++) st[i][0] = arr[i];
    
    for (let j = 1; (1 << j) <= n; j++) {
        for (let i = 0; i + (1 << j) <= n; i++) {
            st[i][j] = Math.min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
        }
    }
}

function query(L, R) {
    let j = logTable[R - L + 1];
    return Math.min(st[L][j], st[R - (1 << j) + 1][j]);
}

const arr = [7, 2, 3, 0, 5, 10];
build(arr);
console.log("Min [0, 4]:", query(0, 4));
console.log("Min [4, 5]:", query(4, 5));`,
        c: `#include <stdio.h>
#define MIN(a, b) ((a) < (b) ? (a) : (b))

int st[100][10]; // Adjust size based on constraints
int logTable[100];
int n;

void build(int* arr, int size) {
    n = size;
    logTable[1] = 0;
    for (int i = 2; i <= n; i++) logTable[i] = logTable[i / 2] + 1;
    
    for (int i = 0; i < n; i++) st[i][0] = arr[i];
    
    for (int j = 1; (1 << j) <= n; j++) {
        for (int i = 0; i + (1 << j) <= n; i++) {
            st[i][j] = MIN(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
        }
    }
}

int query(int L, int R) {
    int j = logTable[R - L + 1];
    return MIN(st[L][j], st[R - (1 << j) + 1][j]);
}

int main() {
    int arr[] = {7, 2, 3, 0, 5, 10};
    build(arr, 6);
    printf("Min [0, 4]: %d\\n", query(0, 4));
    printf("Min [4, 5]: %d\\n", query(4, 5));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int[,] st;
    static int[] logTable;
    static int n;

    static void Build(int[] arr) {
        n = arr.Length;
        logTable = new int[n + 1];
        for (int i = 2; i <= n; i++) logTable[i] = logTable[i / 2] + 1;
        
        int K = logTable[n] + 1;
        st = new int[n, K];
        
        for (int i = 0; i < n; i++) st[i, 0] = arr[i];
        
        for (int j = 1; (1 << j) <= n; j++) {
            for (int i = 0; i + (1 << j) <= n; i++) {
                st[i, j] = Math.Min(st[i, j - 1], st[i + (1 << (j - 1)), j - 1]);
            }
        }
    }

    static int Query(int L, int R) {
        int j = logTable[R - L + 1];
        return Math.Min(st[L, j], st[R - (1 << j) + 1, j]);
    }

    static void Main() {
        int[] arr = {7, 2, 3, 0, 5, 10};
        Build(arr);
        Console.WriteLine($"Min [0, 4]: {Query(0, 4)}");
        Console.WriteLine($"Min [4, 5]: {Query(4, 5)}");
    }
}`,
        swift: `var st = [[Int]]()
var logTable = [Int]()
var n = 0

func build(_ arr: [Int]) {
    n = arr.count
    logTable = Array(repeating: 0, count: n + 1)
    if n > 1 {
        for i in 2...n { logTable[i] = logTable[i / 2] + 1 }
    }
    
    let K = logTable[n] + 1
    st = Array(repeating: Array(repeating: 0, count: K), count: n)
    
    for i in 0..<n { st[i][0] = arr[i] }
    
    var j = 1
    while (1 << j) <= n {
        var i = 0
        while i + (1 << j) <= n {
            st[i][j] = min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1])
            i += 1
        }
        j += 1
    }
}

func query(_ L: Int, _ R: Int) -> Int {
    let j = logTable[R - L + 1]
    return min(st[L][j], st[R - (1 << j) + 1][j])
}

let arr = [7, 2, 3, 0, 5, 10]
build(arr)
print("Min [0, 4]: \\(query(0, 4))")
print("Min [4, 5]: \\(query(4, 5))")`,
        kotlin: `import kotlin.math.min

var st = emptyArray<IntArray>()
var logTable = IntArray(0)
var n = 0

fun build(arr: IntArray) {
    n = arr.size
    logTable = IntArray(n + 1)
    for (i in 2..n) logTable[i] = logTable[i / 2] + 1
    
    val K = logTable[n] + 1
    st = Array(n) { IntArray(K) }
    
    for (i in 0 until n) st[i][0] = arr[i]
    
    var j = 1
    while ((1 shl j) <= n) {
        var i = 0
        while (i + (1 shl j) <= n) {
            st[i][j] = min(st[i][j - 1], st[i + (1 shl (j - 1))][j - 1])
            i++
        }
        j++
    }
}

fun query(L: Int, R: Int): Int {
    val j = logTable[R - L + 1]
    return min(st[L][j], st[R - (1 shl j) + 1][j])
}

fun main() {
    val arr = intArrayOf(7, 2, 3, 0, 5, 10)
    build(arr)
    println("Min [0, 4]: \${query(0, 4)}")
    println("Min [4, 5]: \${query(4, 5)}")
}`,
        scala: `object Main extends App {
    var st: Array[Array[Int]] = _
    var logTable: Array[Int] = _
    var n: Int = 0

    def build(arr: Array[Int]): Unit = {
        n = arr.length
        logTable = new Array[Int](n + 1)
        for (i <- 2 to n) logTable(i) = logTable(i / 2) + 1
        
        val K = logTable(n) + 1
        st = Array.ofDim[Int](n, K)
        
        for (i <- 0 until n) st(i)(0) = arr(i)
        
        var j = 1
        while ((1 << j) <= n) {
            var i = 0
            while (i + (1 << j) <= n) {
                st(i)(j) = math.min(st(i)(j - 1), st(i + (1 << (j - 1)))(j - 1))
                i += 1
            }
            j += 1
        }
    }

    def query(L: Int, R: Int): Int = {
        val j = logTable(R - L + 1)
        math.min(st(L)(j), st(R - (1 << j) + 1)(j))
    }

    val arr = Array(7, 2, 3, 0, 5, 10)
    build(arr)
    println(s"Min [0, 4]: \${query(0, 4)}")
    println(s"Min [4, 5]: \${query(4, 5)}")
}`,
        go: `package main

import "fmt"

func min(a, b int) int {
    if a < b { return a }
    return b
}

var st [][]int
var logTable []int
var n int

func build(arr []int) {
    n = len(arr)
    logTable = make([]int, n+1)
    for i := 2; i <= n; i++ {
        logTable[i] = logTable[i/2] + 1
    }
    
    K := logTable[n] + 1
    st = make([][]int, n)
    for i := range st {
        st[i] = make([]int, K)
        st[i][0] = arr[i]
    }
    
    for j := 1; (1 << j) <= n; j++ {
        for i := 0; i+(1<<j) <= n; i++ {
            st[i][j] = min(st[i][j-1], st[i+(1<<(j-1))][j-1])
        }
    }
}

func query(L, R int) int {
    j := logTable[R-L+1]
    return min(st[L][j], st[R-(1<<j)+1][j])
}

func main() {
    arr := []int{7, 2, 3, 0, 5, 10}
    build(arr)
    fmt.Printf("Min [0, 4]: %d\\n", query(0, 4))
    fmt.Printf("Min [4, 5]: %d\\n", query(4, 5))
}`,
        rust: `use std::cmp;

struct SparseTable {
    st: Vec<Vec<i32>>,
    log_table: Vec<usize>,
}

impl SparseTable {
    fn new(arr: &[i32]) -> Self {
        let n = arr.len();
        let mut log_table = vec![0; n + 1];
        for i in 2..=n {
            log_table[i] = log_table[i / 2] + 1;
        }
        
        let k = log_table[n] + 1;
        let mut st = vec![vec![0; k]; n];
        
        for i in 0..n {
            st[i][0] = arr[i];
        }
        
        for j in 1..k {
            let mut i = 0;
            while i + (1 << j) <= n {
                st[i][j] = cmp::min(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);
                i += 1;
            }
        }
        SparseTable { st, log_table }
    }

    fn query(&self, l: usize, r: usize) -> i32 {
        let j = self.log_table[r - l + 1];
        cmp::min(self.st[l][j], self.st[r - (1 << j) + 1][j])
    }
}

fn main() {
    let arr = vec![7, 2, 3, 0, 5, 10];
    let table = SparseTable::new(&arr);
    println!("Min [0, 4]: {}", table.query(0, 4));
    println!("Min [4, 5]: {}", table.query(4, 5));
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       4. SQUARE ROOT DECOMPOSITION
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Square Root Decomposition",
      href: "/algorithms/range_structures/sqrt-decomp",
      type: "Hard",

      about: [
        { tag: "h1", text: "Square Root Decomposition" },
        {
          tag: "p",
          text: "Square Root Decomposition divides an array into roughly √n equally-sized BLOCKS, each of size roughly √n, and precomputes an aggregate (sum, min, max, etc.) for each block. A range query combines the FULLY-covered blocks (using their precomputed aggregates, O(1) each) with the PARTIALLY-covered blocks at the range's two ends (scanned element-by-element, O(√n) each) — balancing query cost between the two extremes of 'no precomputation at all' (O(n) per query) and 'full tree-based precomputation' (O(log n) per query, but more complex to implement).",
        },
        {
          tag: "p",
          text: "Its appeal is implementation SIMPLICITY relative to Segment Tree or Fenwick Tree: there's no tree structure, no recursive logic, and no bit-manipulation tricks required — just a flat array of block-aggregates and straightforward index arithmetic (block index = position / blockSize) to determine which block any given position belongs to. This makes it a popular choice when O(√n) is fast enough for the problem's constraints and the reduced implementation complexity is worth the slightly worse asymptotic bound compared to O(log n) structures.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Range queries and updates where O(√n) is provably fast enough for the given constraints, and the simpler implementation (versus Segment Tree or Fenwick Tree) is genuinely valuable — competitive programming time pressure is the classic scenario",
            "Operations that don't cleanly fit a tree or BIT structure, but DO decompose naturally into per-block aggregates — e.g. 'count of distinct elements in a range' (using a per-block frequency structure) is awkward for a Segment Tree but natural for block decomposition",
            "'Mo's Algorithm', a well-known offline query-processing technique for answering MANY range queries efficiently, is built directly on top of the same block-decomposition principle as Square Root Decomposition",
            "As a clean illustration of a recurring algorithmic idea: balancing precomputation against per-query work by choosing block size as the SQUARE ROOT of n specifically minimizes the WORST-CASE combination of 'number of full blocks' and 'size of partial-block scans', a calculus-optimization argument worth understanding on its own",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "The choice of block size √n isn't arbitrary — it's the value that minimizes max(n / blockSize, blockSize), the sum of 'number of blocks to potentially scan' and 'elements per block to potentially scan'. Any other block size makes one of these two costs worse, which is why √n is specifically optimal for this technique's balanced trade-off.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(√n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "If the queried range happens to align EXACTLY with block boundaries (starting and ending precisely at block edges), the query can be answered using only the precomputed per-block aggregates, with no partial-block scanning needed at all.",
          },
          {
            tag: "ul",
            items: [
              "Range aligns exactly with block boundaries: O(range length / blockSize) full-block lookups, no partial scanning — can be as fast as O(1) for a single-block-aligned range",
              "This is a favourable-input case, not the general bound",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(√n)" },
          {
            tag: "p",
            text: "A typical range query touches some number of fully-covered blocks (each O(1) to incorporate) plus two PARTIALLY-covered blocks at the range's ends (each requiring an O(√n) element-by-element scan, since a block has roughly √n elements).",
          },
          {
            tag: "ul",
            items: [
              "Up to O(√n) fully-covered blocks, each O(1) to incorporate: O(√n) total",
              "Two partial blocks (at the start and end of the range), each scanned element-by-element: O(√n) total",
              "Combined: O(√n)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(√n)" },
          {
            tag: "p",
            text: "Even the least favourable range alignment (maximally misaligned with block boundaries on both ends) still bounds total work by O(√n), since neither the number of full blocks nor the size of each partial-block scan can exceed O(√n) by construction of the block size choice.",
          },
          {
            tag: "ul",
            items: [
              "Worst case matches average: O(√n) for both query and update",
              "Update (changing a single element): O(1) to update the element itself plus O(1) to update its block's precomputed aggregate — actually O(1) for point updates, with the O(√n) bound applying specifically to RANGE queries and range updates",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(√n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n + √n)" },
          {
            tag: "p",
            text: "The original array itself requires O(n) space, plus an additional array of per-block aggregates requiring O(√n) space (since there are roughly n / √n = √n total blocks).",
          },
          {
            tag: "ul",
            items: ["Original array: O(n)", "Block-aggregate array: O(√n) (number of blocks)"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n + √n)" },
          {
            tag: "p",
            text: "Space usage is fixed by the array's length and the resulting number of blocks, both determined entirely by n, regardless of the specific values stored.",
          },
          {
            tag: "ul",
            items: [
              "Same O(n + √n) = O(n) bound regardless of value distribution — the auxiliary block structure itself is O(√n), a notably small overhead compared to the original array",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n + √n)" },
          {
            tag: "p",
            text: "No array configuration increases space beyond the original array plus the fixed-size block-aggregate structure — this is both the floor and ceiling for the technique's memory footprint.",
          },
          {
            tag: "ul",
            items: [
              "O(n) for the original data + O(√n) for block aggregates, conventionally simplified and cited as the auxiliary O(√n) cost specifically, since the O(n) original array storage is typically considered part of the input rather than algorithmic overhead",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Sum-based Square Root Decomposition:" },
        {
          tag: "code",
          language: "text",
          text: `function build(arr):
    n ← length(arr)
    blockSize ← ceil(sqrt(n))
    numBlocks ← ceil(n / blockSize)
    blockSum ← array of size numBlocks, all zero

    for i from 0 to n − 1:
        blockSum[i / blockSize] ← blockSum[i / blockSize] + arr[i]

    return (arr, blockSum, blockSize)

function update(arr, blockSum, blockSize, index, newValue):
    blockSum[index / blockSize] ← blockSum[index / blockSize] − arr[index] + newValue
    arr[index] ← newValue

function rangeSum(arr, blockSum, blockSize, L, R):     // inclusive range [L, R]
    sum ← 0
    startBlock ← L / blockSize
    endBlock ← R / blockSize

    if startBlock == endBlock:
        for i from L to R:
            sum ← sum + arr[i]                          // entire range within one block
        return sum

    for i from L to (startBlock + 1) * blockSize − 1:
        sum ← sum + arr[i]                              // partial first block

    for b from startBlock + 1 to endBlock − 1:
        sum ← sum + blockSum[b]                          // fully-covered blocks

    for i from endBlock * blockSize to R:
        sum ← sum + arr[i]                              // partial last block

    return sum`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Divide the array into blocks of size approximately √n, and precompute the sum of each block.",
            "update: changing a single element requires updating both the element itself and its containing block's precomputed sum — both O(1) operations.",
            "rangeSum: identify which block contains L (the start) and which contains R (the end). If they're the SAME block, just scan the small range directly.",
            "Otherwise, handle three distinct regions: the PARTIAL portion of the starting block (scan element-by-element from L to that block's end), every block FULLY contained between the start and end blocks (use their precomputed sums directly, O(1) each), and the PARTIAL portion of the ending block (scan element-by-element from that block's start to R).",
            "Summing these three contributions together gives the correct total for the full range [L, R].",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The range [L, R] is exhaustively and exactly partitioned into exactly three non-overlapping pieces: the tail-end of the starting block (from L to that block's boundary), zero or more complete blocks in between, and the head of the ending block (from that block's start to R) — every element of [L, R] falls into exactly one of these three categories, with no element double-counted or omitted. The partial-block portions are correctly summed via direct element-by-element scanning, and the fully-covered blocks are correctly summed via their precomputed blockSum values, which by construction (maintained correctly through every update) always hold the exact sum of their entire block's current contents. Since all three regions are correctly and completely accounted for with no overlap, their combined sum is exactly the correct answer for the full requested range.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <cmath>
using namespace std;

vector<int> arr;
vector<int> block;
int blk_sz;

void build(vector<int>& input) {
    int n = input.size();
    arr = input;
    blk_sz = floor(sqrt(n));
    int numBlocks = ceil((double)n / blk_sz);
    block.assign(numBlocks, 0);
    
    for (int i = 0; i < n; i++) {
        block[i / blk_sz] += arr[i];
    }
}

void update(int idx, int val) {
    int blockNumber = idx / blk_sz;
    block[blockNumber] += val - arr[idx];
    arr[idx] = val;
}

int query(int l, int r) {
    int sum = 0;
    int startBlock = l / blk_sz;
    int endBlock = r / blk_sz;
    
    if (startBlock == endBlock) {
        for (int i = l; i <= r; i++) sum += arr[i];
    } else {
        for (int i = l; i < (startBlock + 1) * blk_sz; i++) sum += arr[i];
        for (int i = startBlock + 1; i < endBlock; i++) sum += block[i];
        for (int i = endBlock * blk_sz; i <= r; i++) sum += arr[i];
    }
    return sum;
}

int main() {
    vector<int> input = {1, 5, 2, 4, 6, 1, 3, 5, 7, 10};
    build(input);
    cout << "Sum [3, 8]: " << query(3, 8) << "\n";
    update(8, 0); 
    cout << "Sum [8, 8] after update: " << query(8, 8) << "\n";
    return 0;
}`,
        python: `import math

arr = []
block = []
blk_sz = 0

def build(input_arr):
    global arr, block, blk_sz
    n = len(input_arr)
    arr = list(input_arr)
    blk_sz = math.floor(math.sqrt(n))
    numBlocks = math.ceil(n / blk_sz)
    block = [0] * numBlocks
    
    for i in range(n):
        block[i // blk_sz] += arr[i]

def update(idx, val):
    block_number = idx // blk_sz
    block[block_number] += val - arr[idx]
    arr[idx] = val

def query(l, r):
    total_sum = 0
    start_block = l // blk_sz
    end_block = r // blk_sz
    
    if start_block == end_block:
        for i in range(l, r + 1):
            total_sum += arr[i]
    else:
        for i in range(l, (start_block + 1) * blk_sz):
            total_sum += arr[i]
        for i in range(start_block + 1, end_block):
            total_sum += block[i]
        for i in range(end_block * blk_sz, r + 1):
            total_sum += arr[i]
    return total_sum

if __name__ == "__main__":
    input_arr = [1, 5, 2, 4, 6, 1, 3, 5, 7, 10]
    build(input_arr)
    print(f"Sum [3, 8]: {query(3, 8)}")
    update(8, 0)
    print(f"Sum [8, 8] after update: {query(8, 8)}")`,
        java: `public class Main {
    static int[] arr;
    static int[] block;
    static int blk_sz;

    static void build(int[] input) {
        int n = input.length;
        arr = input.clone();
        blk_sz = (int) Math.floor(Math.sqrt(n));
        int numBlocks = (int) Math.ceil((double) n / blk_sz);
        block = new int[numBlocks];
        
        for (int i = 0; i < n; i++) {
            block[i / blk_sz] += arr[i];
        }
    }

    static void update(int idx, int val) {
        int blockNumber = idx / blk_sz;
        block[blockNumber] += val - arr[idx];
        arr[idx] = val;
    }

    static int query(int l, int r) {
        int sum = 0;
        int startBlock = l / blk_sz;
        int endBlock = r / blk_sz;
        
        if (startBlock == endBlock) {
            for (int i = l; i <= r; i++) sum += arr[i];
        } else {
            for (int i = l; i < (startBlock + 1) * blk_sz; i++) sum += arr[i];
            for (int i = startBlock + 1; i < endBlock; i++) sum += block[i];
            for (int i = endBlock * blk_sz; i <= r; i++) sum += arr[i];
        }
        return sum;
    }

    public static void main(String[] args) {
        int[] input = {1, 5, 2, 4, 6, 1, 3, 5, 7, 10};
        build(input);
        System.out.println("Sum [3, 8]: " + query(3, 8));
        update(8, 0);
        System.out.println("Sum [8, 8] after update: " + query(8, 8));
    }
}`,
        js: `let arr = [];
let block = [];
let blk_sz = 0;

function build(input) {
    const n = input.length;
    arr = [...input];
    blk_sz = Math.floor(Math.sqrt(n));
    const numBlocks = Math.ceil(n / blk_sz);
    block = new Array(numBlocks).fill(0);
    
    for (let i = 0; i < n; i++) {
        block[Math.floor(i / blk_sz)] += arr[i];
    }
}

function update(idx, val) {
    const blockNumber = Math.floor(idx / blk_sz);
    block[blockNumber] += val - arr[idx];
    arr[idx] = val;
}

function query(l, r) {
    let sum = 0;
    const startBlock = Math.floor(l / blk_sz);
    const endBlock = Math.floor(r / blk_sz);
    
    if (startBlock === endBlock) {
        for (let i = l; i <= r; i++) sum += arr[i];
    } else {
        for (let i = l; i < (startBlock + 1) * blk_sz; i++) sum += arr[i];
        for (let i = startBlock + 1; i < endBlock; i++) sum += block[i];
        for (let i = endBlock * blk_sz; i <= r; i++) sum += arr[i];
    }
    return sum;
}

const input = [1, 5, 2, 4, 6, 1, 3, 5, 7, 10];
build(input);
console.log("Sum [3, 8]:", query(3, 8));
update(8, 0);
console.log("Sum [8, 8] after update:", query(8, 8));`,
        c: `#include <stdio.h>
#include <math.h>

int arr[100];
int block[10];
int blk_sz;

void build(int* input, int n) {
    blk_sz = floor(sqrt(n));
    for(int i=0; i<10; i++) block[i] = 0;
    
    for (int i = 0; i < n; i++) {
        arr[i] = input[i];
        block[i / blk_sz] += arr[i];
    }
}

void update(int idx, int val) {
    int blockNumber = idx / blk_sz;
    block[blockNumber] += val - arr[idx];
    arr[idx] = val;
}

int query(int l, int r) {
    int sum = 0;
    int startBlock = l / blk_sz;
    int endBlock = r / blk_sz;
    
    if (startBlock == endBlock) {
        for (int i = l; i <= r; i++) sum += arr[i];
    } else {
        for (int i = l; i < (startBlock + 1) * blk_sz; i++) sum += arr[i];
        for (int i = startBlock + 1; i < endBlock; i++) sum += block[i];
        for (int i = endBlock * blk_sz; i <= r; i++) sum += arr[i];
    }
    return sum;
}

int main() {
    int input[] = {1, 5, 2, 4, 6, 1, 3, 5, 7, 10};
    build(input, 10);
    printf("Sum [3, 8]: %d\\n", query(3, 8));
    update(8, 0);
    printf("Sum [8, 8] after update: %d\\n", query(8, 8));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int[] arr;
    static int[] block;
    static int blk_sz;

    static void Build(int[] input) {
        int n = input.Length;
        arr = (int[])input.Clone();
        blk_sz = (int)Math.Floor(Math.Sqrt(n));
        int numBlocks = (int)Math.Ceiling((double)n / blk_sz);
        block = new int[numBlocks];
        
        for (int i = 0; i < n; i++) {
            block[i / blk_sz] += arr[i];
        }
    }

    static void Update(int idx, int val) {
        int blockNumber = idx / blk_sz;
        block[blockNumber] += val - arr[idx];
        arr[idx] = val;
    }

    static int Query(int l, int r) {
        int sum = 0;
        int startBlock = l / blk_sz;
        int endBlock = r / blk_sz;
        
        if (startBlock == endBlock) {
            for (int i = l; i <= r; i++) sum += arr[i];
        } else {
            for (int i = l; i < (startBlock + 1) * blk_sz; i++) sum += arr[i];
            for (int i = startBlock + 1; i < endBlock; i++) sum += block[i];
            for (int i = endBlock * blk_sz; i <= r; i++) sum += arr[i];
        }
        return sum;
    }

    static void Main() {
        int[] input = {1, 5, 2, 4, 6, 1, 3, 5, 7, 10};
        Build(input);
        Console.WriteLine($"Sum [3, 8]: {Query(3, 8)}");
        Update(8, 0);
        Console.WriteLine($"Sum [8, 8] after update: {Query(8, 8)}");
    }
}`,
        swift: `import Foundation

var arr = [Int]()
var block = [Int]()
var blk_sz = 0

func build(_ input: [Int]) {
    let n = input.count
    arr = input
    blk_sz = Int(floor(sqrt(Double(n))))
    let numBlocks = Int(ceil(Double(n) / Double(blk_sz)))
    block = Array(repeating: 0, count: numBlocks)
    
    for i in 0..<n {
        block[i / blk_sz] += arr[i]
    }
}

func update(_ idx: Int, _ val: Int) {
    let blockNumber = idx / blk_sz
    block[blockNumber] += val - arr[idx]
    arr[idx] = val
}

func query(_ l: Int, _ r: Int) -> Int {
    var sum = 0
    let startBlock = l / blk_sz
    let endBlock = r / blk_sz
    
    if startBlock == endBlock {
        for i in l...r { sum += arr[i] }
    } else {
        for i in l..<((startBlock + 1) * blk_sz) { sum += arr[i] }
        for i in (startBlock + 1)..<endBlock { sum += block[i] }
        for i in (endBlock * blk_sz)...r { sum += arr[i] }
    }
    return sum
}

let input = [1, 5, 2, 4, 6, 1, 3, 5, 7, 10]
build(input)
print("Sum [3, 8]: \\(query(3, 8))")
update(8, 0)
print("Sum [8, 8] after update: \\(query(8, 8))")`,
        kotlin: `import kotlin.math.ceil
import kotlin.math.floor
import kotlin.math.sqrt

var arr = IntArray(0)
var block = IntArray(0)
var blk_sz = 0

fun build(input: IntArray) {
    val n = input.size
    arr = input.clone()
    blk_sz = floor(sqrt(n.toDouble())).toInt()
    val numBlocks = ceil(n.toDouble() / blk_sz).toInt()
    block = IntArray(numBlocks)
    
    for (i in 0 until n) {
        block[i / blk_sz] += arr[i]
    }
}

fun update(idx: Int, \`val\`: Int) {
    val blockNumber = idx / blk_sz
    block[blockNumber] += \`val\` - arr[idx]
    arr[idx] = \`val\`
}

fun query(l: Int, r: Int): Int {
    var sum = 0
    val startBlock = l / blk_sz
    val endBlock = r / blk_sz
    
    if (startBlock == endBlock) {
        for (i in l..r) sum += arr[i]
    } else {
        for (i in l until (startBlock + 1) * blk_sz) sum += arr[i]
        for (i in startBlock + 1 until endBlock) sum += block[i]
        for (i in endBlock * blk_sz..r) sum += arr[i]
    }
    return sum
}

fun main() {
    val input = intArrayOf(1, 5, 2, 4, 6, 1, 3, 5, 7, 10)
    build(input)
    println("Sum [3, 8]: \${query(3, 8)}")
    update(8, 0)
    println("Sum [8, 8] after update: \${query(8, 8)}")
}`,
        scala: `object Main extends App {
    var arr: Array[Int] = _
    var block: Array[Int] = _
    var blk_sz: Int = 0

    def build(input: Array[Int]): Unit = {
        val n = input.length
        arr = input.clone()
        blk_sz = math.floor(math.sqrt(n)).toInt
        val numBlocks = math.ceil(n.toDouble / blk_sz).toInt
        block = Array.fill(numBlocks)(0)
        
        for (i <- 0 until n) {
            block(i / blk_sz) += arr(i)
        }
    }

    def update(idx: Int, value: Int): Unit = {
        val blockNumber = idx / blk_sz
        block(blockNumber) += value - arr(idx)
        arr(idx) = value
    }

    def query(l: Int, r: Int): Int = {
        var sum = 0
        val startBlock = l / blk_sz
        val endBlock = r / blk_sz
        
        if (startBlock == endBlock) {
            for (i <- l to r) sum += arr(i)
        } else {
            for (i <- l until (startBlock + 1) * blk_sz) sum += arr(i)
            for (i <- startBlock + 1 until endBlock) sum += block(i)
            for (i <- endBlock * blk_sz to r) sum += arr(i)
        }
        sum
    }

    val input = Array(1, 5, 2, 4, 6, 1, 3, 5, 7, 10)
    build(input)
    println(s"Sum [3, 8]: \${query(3, 8)}")
    update(8, 0)
    println(s"Sum [8, 8] after update: \${query(8, 8)}")
}`,
        go: `package main

import (
    "fmt"
    "math"
)

var arr []int
var block []int
var blk_sz int

func build(input []int) {
    n := len(input)
    arr = make([]int, n)
    copy(arr, input)
    blk_sz = int(math.Floor(math.Sqrt(float64(n))))
    numBlocks := int(math.Ceil(float64(n) / float64(blk_sz)))
    block = make([]int, numBlocks)
    
    for i := 0; i < n; i++ {
        block[i/blk_sz] += arr[i]
    }
}

func update(idx int, val int) {
    blockNumber := idx / blk_sz
    block[blockNumber] += val - arr[idx]
    arr[idx] = val
}

func query(l, r int) int {
    sum := 0
    startBlock := l / blk_sz
    endBlock := r / blk_sz
    
    if startBlock == endBlock {
        for i := l; i <= r; i++ {
            sum += arr[i]
        }
    } else {
        for i := l; i < (startBlock+1)*blk_sz; i++ {
            sum += arr[i]
        }
        for i := startBlock + 1; i < endBlock; i++ {
            sum += block[i]
        }
        for i := endBlock * blk_sz; i <= r; i++ {
            sum += arr[i]
        }
    }
    return sum
}

func main() {
    input := []int{1, 5, 2, 4, 6, 1, 3, 5, 7, 10}
    build(input)
    fmt.Printf("Sum [3, 8]: %d\\n", query(3, 8))
    update(8, 0)
    fmt.Printf("Sum [8, 8] after update: %d\\n", query(8, 8))
}`,
        rust: `struct SqrtDecomp {
    arr: Vec<i32>,
    block: Vec<i32>,
    blk_sz: usize,
}

impl SqrtDecomp {
    fn new(input: &[i32]) -> Self {
        let n = input.len();
        let blk_sz = (n as f64).sqrt().floor() as usize;
        let num_blocks = (n as f64 / blk_sz as f64).ceil() as usize;
        let mut block = vec![0; num_blocks];
        
        for i in 0..n {
            block[i / blk_sz] += input[i];
        }
        
        SqrtDecomp {
            arr: input.to_vec(),
            block,
            blk_sz,
        }
    }

    fn update(&mut self, idx: usize, val: i32) {
        let block_number = idx / self.blk_sz;
        self.block[block_number] += val - self.arr[idx];
        self.arr[idx] = val;
    }

    fn query(&self, l: usize, r: usize) -> i32 {
        let mut sum = 0;
        let start_block = l / self.blk_sz;
        let end_block = r / self.blk_sz;
        
        if start_block == end_block {
            for i in l..=r { sum += self.arr[i]; }
        } else {
            for i in l..(start_block + 1) * self.blk_sz { sum += self.arr[i]; }
            for i in start_block + 1..end_block { sum += self.block[i]; }
            for i in end_block * self.blk_sz..=r { sum += self.arr[i]; }
        }
        sum
    }
}

fn main() {
    let input = vec![1, 5, 2, 4, 6, 1, 3, 5, 7, 10];
    let mut sq = SqrtDecomp::new(&input);
    println!("Sum [3, 8]: {}", sq.query(3, 8));
    sq.update(8, 0);
    println!("Sum [8, 8] after update: {}", sq.query(8, 8));
}`,
      },
    },
  ],
  desc: "Segment trees, BIT/Fenwick, range queries",
  complexity: "O(log n)",
  featured: true,
};

export default RANGE_STRUCTURES_SECTION;
