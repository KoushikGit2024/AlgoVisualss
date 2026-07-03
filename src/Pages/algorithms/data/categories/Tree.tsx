const TREES_SECTION = {
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

  about: [
    { tag: "h1", text: "Trees" },
    { tag: "p", text: "A tree is a connected, acyclic graph with a designated root, where every other vertex has exactly one parent — this hierarchical structure makes trees the natural representation for anything with nested relationships: file systems, organisation charts, expression parsing, and the indexing structures behind nearly every database." },
    { tag: "p", text: "The single number that governs almost every tree algorithm's performance is its height h — the length of the longest path from root to leaf. A perfectly balanced binary tree has h = O(log n), giving fast O(log n) search, insert, and delete. But an unbalanced tree (e.g. one built by inserting already-sorted data into a plain BST) can degrade to h = O(n), turning every operation into a linear scan. This single fact — that height, not node count, determines speed — is why self-balancing trees (AVL, Red-Black) exist at all." },
    { tag: "h2", text: "Why self-balancing trees exist" },
    { tag: "p", text: "A plain Binary Search Tree gives no guarantee about its own shape — it's entirely a function of insertion order. AVL trees and Red-Black trees both solve this by enforcing a structural invariant after every insertion and deletion (rotations to restore balance), guaranteeing h = O(log n) no matter what order operations arrive in. The trade-off between them is rebalancing frequency vs. rebalancing cost — AVL trees are more rigidly balanced (faster lookups) but rebalance more often (slower writes); Red-Black trees are more loosely balanced (slightly slower lookups) but rebalance less often (faster writes)." },
    { tag: "table",
      headers: ["Structure", "Guarantee", "Lookup", "Insert/Delete", "Typical Use"],
      rows: [
        ["Plain BST", "None — height depends on insertion order", "O(log n) avg / O(n) worst", "O(log n) avg / O(n) worst", "Simple ordered maps, teaching"],
        ["AVL Tree", "Strictly balanced: height difference of subtrees ≤ 1", "O(log n) guaranteed", "O(log n) guaranteed", "Read-heavy workloads"],
        ["Red-Black Tree", "Loosely balanced via coloring rules", "O(log n) guaranteed", "O(log n) guaranteed, fewer rotations", "Write-heavy workloads (most language standard libraries)"],
        ["Tree Traversals", "N/A — visits every node", "O(n) to visit all nodes", "N/A", "Serialisation, expression evaluation, search"],
        ["Lowest Common Ancestor", "Depends on tree type", "O(log n) for BST, O(n) general", "N/A", "Family-tree/version-control-style ancestry queries"]
      ]
    },
    { tag: "note", variant: "tip", text: "If you're asked for a self-balancing tree but don't know which kind, Red-Black is almost always the right default — it's what backs C++'s std::map, Java's TreeMap, and the Linux kernel's process scheduler, precisely because of its cheaper rebalancing." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. AVL TREES
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "AVL Trees",
      href: "/algorithms/trees/avl",
      type: "Hard",

      about: [
        { tag: "h1", text: "AVL Trees" },
        { tag: "p", text: "An AVL tree, named after its inventors Georgy Adelson-Velsky and Evgenii Landis (1962), is a self-balancing Binary Search Tree where, for every node, the heights of its left and right subtrees differ by at most 1. This 'balance factor' constraint is checked and restored after every insertion or deletion, guaranteeing the tree's height never exceeds O(log n) regardless of the order operations occur in." },
        { tag: "p", text: "Balance is restored using rotations — single (left or right) and double (left-right or right-left) — applied at the lowest unbalanced ancestor of a newly inserted or deleted node. AVL trees were the first self-balancing BST structure ever invented and remain the standard example for teaching how local structural fixes can maintain a global height guarantee." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Read-heavy workloads where lookups vastly outnumber insertions/deletions — AVL's stricter balance gives slightly faster average lookup than Red-Black trees",
          "Applications needing a hard guarantee on worst-case search time, such as real-time systems",
          "Database indexing and in-memory ordered maps where query latency matters more than update throughput",
          "Anywhere a plain BST is being considered but insertion order can't be guaranteed to be random (e.g. data could arrive pre-sorted, which would degrade a plain BST to O(n))"
        ]},
        { tag: "table",
          headers: ["Rotation Type", "Trigger Condition", "Fix Applied"],
          rows: [
            ["Left-Left (LL)", "Imbalance in the left subtree's left child", "Single right rotation"],
            ["Right-Right (RR)", "Imbalance in the right subtree's right child", "Single left rotation"],
            ["Left-Right (LR)", "Imbalance in the left subtree's right child", "Left rotation on child, then right rotation on node"],
            ["Right-Left (RL)", "Imbalance in the right subtree's left child", "Right rotation on child, then left rotation on node"]
          ]
        },
        { tag: "note", variant: "info", text: "AVL trees rebalance more aggressively than Red-Black trees, which is why they're favoured when lookups dominate — but that same aggressiveness means more rotations per write, which is why write-heavy systems usually prefer Red-Black trees instead." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case — O(log n)" },
          { tag: "p", text: "Even in the most favourable scenario (e.g. searching for the root itself), the asymptotic classification remains O(log n) because the algorithm's structure guarantees this bound for the tree's height regardless of which specific node is targeted." },
          { tag: "ul", items: [
            "AVL's height invariant guarantees h = O(log n) at all times, for any sequence of insertions/deletions",
            "Searching, inserting, or deleting always follows a root-to-leaf path bounded by this height",
            "Best case (target found near the root): still classified O(log n) since the guarantee is structural, not value-dependent"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          { tag: "p", text: "Because the balance invariant is actively enforced after every modification, there's no 'typical' input that produces a worse shape than the guaranteed bound — average case equals the guaranteed worst case." },
          { tag: "ul", items: [
            "Search: traverse from root to a leaf, comparing at each level — O(h) = O(log n)",
            "Insert: search for the insertion point (O(log n)), then rebalance along the path back to the root, performing at most O(log n) rotations — but each rotation is O(1), so total insert cost is O(log n)",
            "Delete: similarly O(log n) for the search plus O(log n) for rebalancing"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n)" },
          { tag: "p", text: "This is AVL's entire purpose: unlike a plain BST, there is no input sequence that can degrade an AVL tree's height beyond its mathematically proven bound." },
          { tag: "ul", items: [
            "Provable bound: an AVL tree of height h has at least F(h+2) − 1 nodes, where F is the Fibonacci sequence — inverting this gives h ≤ 1.44 log₂(n+2), i.e. O(log n)",
            "Search/insert/delete all stay strictly within this bound — there is no adversarial sequence of operations that produces a degenerate (linear-height) shape",
            "This is the key advantage over a plain BST, whose worst case is O(n)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n nodes always requires O(n) space for the node data itself, plus a small constant overhead per node for the balance factor (or height) field used to maintain the invariant." },
          { tag: "ul", items: ["n node objects, each with left/right/parent pointers + a balance factor field: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Total stored data is fixed by n regardless of the tree's exact shape, since the guaranteed-balanced structure doesn't change how many nodes need to be stored." },
          { tag: "ul", items: ["O(n) for node storage", "O(log n) for the recursion stack during operations, due to the guaranteed logarithmic height"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No insertion/deletion sequence increases storage beyond the fixed per-node overhead — this is a hallmark difference from time complexity, since space doesn't depend on tree shape, only on node count." },
          { tag: "ul", items: [
            "O(n) total node storage, identical to a plain BST",
            "O(log n) recursion/call-stack depth during any single operation — guaranteed by the height bound, unlike a plain BST's potential O(n) worst-case stack depth"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function insert(node, key):
    if node is null:
        return new Node(key)

    if key < node.key:
        node.left ← insert(node.left, key)
    else if key > node.key:
        node.right ← insert(node.right, key)
    else:
        return node                          // duplicate key, no-op

    updateHeight(node)
    balance ← getBalanceFactor(node)         // height(left) − height(right)

    // Left-Left case
    if balance > 1 and key < node.left.key:
        return rotateRight(node)
    // Right-Right case
    if balance < −1 and key > node.right.key:
        return rotateLeft(node)
    // Left-Right case
    if balance > 1 and key > node.left.key:
        node.left ← rotateLeft(node.left)
        return rotateRight(node)
    // Right-Left case
    if balance < −1 and key < node.right.key:
        node.right ← rotateRight(node.right)
        return rotateLeft(node)

    return node                              // already balanced

function rotateRight(y):
    x ← y.left
    T2 ← x.right
    x.right ← y
    y.left ← T2
    updateHeight(y)
    updateHeight(x)
    return x                                 // new subtree root` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Insert exactly like a standard BST insertion: recurse left or right based on key comparison until reaching a null spot, then place the new node there.",
          "As the recursion unwinds back up the path to the root, update each ancestor's height and compute its balance factor (left subtree height − right subtree height).",
          "If any node's balance factor exceeds ±1, the AVL invariant has been violated at that node — identify which of the four imbalance cases applies (LL, RR, LR, RL) by comparing the inserted key against the unbalanced node's children.",
          "Apply the corresponding rotation(s) to restore the height invariant at that node. A single rotation suffices for LL/RR cases; a double rotation (rotate the child, then the node) is needed for LR/RL cases.",
          "Because rotations are O(1) and the path back to the root has length O(log n) (the tree's guaranteed height), at most O(log n) rotations are checked, with provably at most 2 actual rotations needed to fully rebalance after any single insertion."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Each rotation is a local, BST-order-preserving restructuring: a right rotation around node y promotes y's left child x to take y's place, while preserving the in-order traversal sequence of all affected nodes (this can be verified by checking that the rotated subtree's in-order traversal is identical before and after). Since BST order is preserved by every rotation, search correctness is never compromised. The height-rebalancing guarantee follows from a classical proof: an AVL tree's minimum node count for height h grows according to the Fibonacci recurrence N(h) = N(h-1) + N(h-2) + 1, and solving this recurrence shows h = O(log n) is the only possibility consistent with the balance-factor-≤1 invariant being maintained after every single insertion or deletion." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <algorithm>
using namespace std;

// Each node stores its own subtree height so balance can be checked in O(1).
struct AVLNode {
    int value;
    int height;
    AVLNode* left;
    AVLNode* right;
};

// Returns the stored height of a node, treating a null pointer as height 0.
int getHeight(AVLNode* node) {
    if (node == nullptr) return 0;
    return node->height;
}

// The balance factor is (left subtree height) - (right subtree height).
// A magnitude greater than 1 means the AVL invariant has been violated.
int getBalanceFactor(AVLNode* node) {
    if (node == nullptr) return 0;
    return getHeight(node->left) - getHeight(node->right);
}

// Allocates a fresh leaf node. A brand-new leaf always has height 1.
AVLNode* createNode(int value) {
    AVLNode* node = new AVLNode();
    node->value = value;
    node->height = 1;
    node->left = nullptr;
    node->right = nullptr;
    return node;
}

// Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
// its left child to become the new subtree root. Used to fix left-heavy imbalance.
AVLNode* rotateRight(AVLNode* unbalancedNode) {
    AVLNode* newRoot = unbalancedNode->left;
    AVLNode* transferredSubtree = newRoot->right;

    // Perform the rotation
    newRoot->right = unbalancedNode;
    unbalancedNode->left = transferredSubtree;

    // Heights must be recomputed bottom-up: the old root first, then the new one
    unbalancedNode->height = max(getHeight(unbalancedNode->left), getHeight(unbalancedNode->right)) + 1;
    newRoot->height = max(getHeight(newRoot->left), getHeight(newRoot->right)) + 1;

    return newRoot;
}

// Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
// its right child to become the new subtree root. Used to fix right-heavy imbalance.
AVLNode* rotateLeft(AVLNode* unbalancedNode) {
    AVLNode* newRoot = unbalancedNode->right;
    AVLNode* transferredSubtree = newRoot->left;

    // Perform the rotation
    newRoot->left = unbalancedNode;
    unbalancedNode->right = transferredSubtree;

    // Heights must be recomputed bottom-up: the old root first, then the new one
    unbalancedNode->height = max(getHeight(unbalancedNode->left), getHeight(unbalancedNode->right)) + 1;
    newRoot->height = max(getHeight(newRoot->left), getHeight(newRoot->right)) + 1;

    return newRoot;
}

// Inserts 'value' into the AVL tree rooted at 'node', rebalancing as needed,
// and returns the (possibly new) root of this subtree.
AVLNode* insert(AVLNode* node, int value) {
    // Standard BST insertion
    if (node == nullptr) {
        return createNode(value);
    }
    if (value < node->value) {
        node->left = insert(node->left, value);
    } else if (value > node->value) {
        node->right = insert(node->right, value);
    } else {
        return node; // duplicate values are ignored
    }

    // Update this node's height now that a child subtree may have grown
    node->height = 1 + max(getHeight(node->left), getHeight(node->right));

    // Check whether this node has become unbalanced
    int balance = getBalanceFactor(node);

    // Left-Left case: left child is heavier, and the new key went further left
    if (balance > 1 && value < node->left->value) {
        return rotateRight(node);
    }
    // Right-Right case: right child is heavier, and the new key went further right
    if (balance < -1 && value > node->right->value) {
        return rotateLeft(node);
    }
    // Left-Right case: left child is heavier, but the new key went right of it
    if (balance > 1 && value > node->left->value) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    // Right-Left case: right child is heavier, but the new key went left of it
    if (balance < -1 && value < node->right->value) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }

    return node; // already balanced, no rotation needed
}

// Prints the tree's values in ascending order (in-order traversal of a BST
// always yields sorted output).
void printInOrder(AVLNode* node) {
    if (node == nullptr) return;
    printInOrder(node->left);
    cout << node->value << " ";
    printInOrder(node->right);
}

int main() {
    AVLNode* root = nullptr;

    // Deliberately insert in ascending order: a plain BST would degrade into
    // a straight line here, but the AVL tree will stay balanced throughout.
    int valuesToInsert[] = {10, 20, 30, 40, 50, 25};
    int valueCount = 6;
    for (int i = 0; i < valueCount; i++) {
        root = insert(root, valuesToInsert[i]);
    }

    cout << "In-order traversal (sorted): ";
    printInOrder(root);
    cout << endl;

    cout << "Root value after rebalancing: " << root->value << endl;
    cout << "Tree height: " << getHeight(root) << endl;

    return 0;
}
`,
        "python": `# Each node stores its own subtree height so balance can be checked in O(1).
class AVLNode:
    def __init__(self, value):
        self.value = value
        self.height = 1
        self.left = None
        self.right = None


def get_height(node):
    """Returns the stored height of a node, treating None as height 0."""
    if node is None:
        return 0
    return node.height


def get_balance_factor(node):
    """The balance factor is (left subtree height) - (right subtree height).
    A magnitude greater than 1 means the AVL invariant has been violated."""
    if node is None:
        return 0
    return get_height(node.left) - get_height(node.right)


def rotate_right(unbalanced_node):
    """Rotates the subtree rooted at 'unbalanced_node' to the right, promoting
    its left child to become the new subtree root. Fixes left-heavy imbalance."""
    new_root = unbalanced_node.left
    transferred_subtree = new_root.right

    # Perform the rotation
    new_root.right = unbalanced_node
    unbalanced_node.left = transferred_subtree

    # Heights must be recomputed bottom-up: the old root first, then the new one
    unbalanced_node.height = 1 + max(get_height(unbalanced_node.left), get_height(unbalanced_node.right))
    new_root.height = 1 + max(get_height(new_root.left), get_height(new_root.right))

    return new_root


def rotate_left(unbalanced_node):
    """Rotates the subtree rooted at 'unbalanced_node' to the left, promoting
    its right child to become the new subtree root. Fixes right-heavy imbalance."""
    new_root = unbalanced_node.right
    transferred_subtree = new_root.left

    # Perform the rotation
    new_root.left = unbalanced_node
    unbalanced_node.right = transferred_subtree

    # Heights must be recomputed bottom-up: the old root first, then the new one
    unbalanced_node.height = 1 + max(get_height(unbalanced_node.left), get_height(unbalanced_node.right))
    new_root.height = 1 + max(get_height(new_root.left), get_height(new_root.right))

    return new_root


def insert(node, value):
    """Inserts 'value' into the AVL tree rooted at 'node', rebalancing as
    needed, and returns the (possibly new) root of this subtree."""
    # Standard BST insertion
    if node is None:
        return AVLNode(value)
    if value < node.value:
        node.left = insert(node.left, value)
    elif value > node.value:
        node.right = insert(node.right, value)
    else:
        return node  # duplicate values are ignored

    # Update this node's height now that a child subtree may have grown
    node.height = 1 + max(get_height(node.left), get_height(node.right))

    # Check whether this node has become unbalanced
    balance = get_balance_factor(node)

    # Left-Left case: left child is heavier, and the new key went further left
    if balance > 1 and value < node.left.value:
        return rotate_right(node)
    # Right-Right case: right child is heavier, and the new key went further right
    if balance < -1 and value > node.right.value:
        return rotate_left(node)
    # Left-Right case: left child is heavier, but the new key went right of it
    if balance > 1 and value > node.left.value:
        node.left = rotate_left(node.left)
        return rotate_right(node)
    # Right-Left case: right child is heavier, but the new key went left of it
    if balance < -1 and value < node.right.value:
        node.right = rotate_right(node.right)
        return rotate_left(node)

    return node  # already balanced, no rotation needed


def print_in_order(node, output):
    """Collects the tree's values in ascending order (in-order traversal of a
    BST always yields sorted output)."""
    if node is None:
        return
    print_in_order(node.left, output)
    output.append(node.value)
    print_in_order(node.right, output)


if __name__ == "__main__":
    root = None

    # Deliberately insert in ascending order: a plain BST would degrade into
    # a straight line here, but the AVL tree will stay balanced throughout.
    values_to_insert = [10, 20, 30, 40, 50, 25]
    for value in values_to_insert:
        root = insert(root, value)

    sorted_output = []
    print_in_order(root, sorted_output)
    print("In-order traversal (sorted):", " ".join(str(v) for v in sorted_output))

    print("Root value after rebalancing:", root.value)
    print("Tree height:", get_height(root))
`,
        "java": `public class AVLTree {

    // Each node stores its own subtree height so balance can be checked in O(1).
    static class AVLNode {
        int value;
        int height;
        AVLNode left;
        AVLNode right;

        AVLNode(int value) {
            this.value = value;
            this.height = 1;
        }
    }

    // Returns the stored height of a node, treating null as height 0.
    static int getHeight(AVLNode node) {
        if (node == null) return 0;
        return node.height;
    }

    // The balance factor is (left subtree height) - (right subtree height).
    // A magnitude greater than 1 means the AVL invariant has been violated.
    static int getBalanceFactor(AVLNode node) {
        if (node == null) return 0;
        return getHeight(node.left) - getHeight(node.right);
    }

    // Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
    // its left child to become the new subtree root. Fixes left-heavy imbalance.
    static AVLNode rotateRight(AVLNode unbalancedNode) {
        AVLNode newRoot = unbalancedNode.left;
        AVLNode transferredSubtree = newRoot.right;

        // Perform the rotation
        newRoot.right = unbalancedNode;
        unbalancedNode.left = transferredSubtree;

        // Heights must be recomputed bottom-up: the old root first, then the new one
        unbalancedNode.height = 1 + Math.max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right));
        newRoot.height = 1 + Math.max(getHeight(newRoot.left), getHeight(newRoot.right));

        return newRoot;
    }

    // Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
    // its right child to become the new subtree root. Fixes right-heavy imbalance.
    static AVLNode rotateLeft(AVLNode unbalancedNode) {
        AVLNode newRoot = unbalancedNode.right;
        AVLNode transferredSubtree = newRoot.left;

        // Perform the rotation
        newRoot.left = unbalancedNode;
        unbalancedNode.right = transferredSubtree;

        // Heights must be recomputed bottom-up: the old root first, then the new one
        unbalancedNode.height = 1 + Math.max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right));
        newRoot.height = 1 + Math.max(getHeight(newRoot.left), getHeight(newRoot.right));

        return newRoot;
    }

    // Inserts 'value' into the AVL tree rooted at 'node', rebalancing as
    // needed, and returns the (possibly new) root of this subtree.
    static AVLNode insert(AVLNode node, int value) {
        // Standard BST insertion
        if (node == null) {
            return new AVLNode(value);
        }
        if (value < node.value) {
            node.left = insert(node.left, value);
        } else if (value > node.value) {
            node.right = insert(node.right, value);
        } else {
            return node; // duplicate values are ignored
        }

        // Update this node's height now that a child subtree may have grown
        node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));

        // Check whether this node has become unbalanced
        int balance = getBalanceFactor(node);

        // Left-Left case: left child is heavier, and the new key went further left
        if (balance > 1 && value < node.left.value) {
            return rotateRight(node);
        }
        // Right-Right case: right child is heavier, and the new key went further right
        if (balance < -1 && value > node.right.value) {
            return rotateLeft(node);
        }
        // Left-Right case: left child is heavier, but the new key went right of it
        if (balance > 1 && value > node.left.value) {
            node.left = rotateLeft(node.left);
            return rotateRight(node);
        }
        // Right-Left case: right child is heavier, but the new key went left of it
        if (balance < -1 && value < node.right.value) {
            node.right = rotateRight(node.right);
            return rotateLeft(node);
        }

        return node; // already balanced, no rotation needed
    }

    // Appends the tree's values in ascending order (in-order traversal of a
    // BST always yields sorted output).
    static void printInOrder(AVLNode node, StringBuilder output) {
        if (node == null) return;
        printInOrder(node.left, output);
        output.append(node.value).append(" ");
        printInOrder(node.right, output);
    }

    public static void main(String[] args) {
        AVLNode root = null;

        // Deliberately insert in ascending order: a plain BST would degrade into
        // a straight line here, but the AVL tree will stay balanced throughout.
        int[] valuesToInsert = {10, 20, 30, 40, 50, 25};
        for (int value : valuesToInsert) {
            root = insert(root, value);
        }

        StringBuilder sortedOutput = new StringBuilder();
        printInOrder(root, sortedOutput);
        System.out.println("In-order traversal (sorted): " + sortedOutput.toString().trim());

        System.out.println("Root value after rebalancing: " + root.value);
        System.out.println("Tree height: " + getHeight(root));
    }
}
`,
        "js": `// Each node stores its own subtree height so balance can be checked in O(1).
class AVLNode {
    constructor(value) {
        this.value = value;
        this.height = 1;
        this.left = null;
        this.right = null;
    }
}

// Returns the stored height of a node, treating null as height 0.
function getHeight(node) {
    if (node === null) return 0;
    return node.height;
}

// The balance factor is (left subtree height) - (right subtree height).
// A magnitude greater than 1 means the AVL invariant has been violated.
function getBalanceFactor(node) {
    if (node === null) return 0;
    return getHeight(node.left) - getHeight(node.right);
}

// Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
// its left child to become the new subtree root. Fixes left-heavy imbalance.
function rotateRight(unbalancedNode) {
    const newRoot = unbalancedNode.left;
    const transferredSubtree = newRoot.right;

    // Perform the rotation
    newRoot.right = unbalancedNode;
    unbalancedNode.left = transferredSubtree;

    // Heights must be recomputed bottom-up: the old root first, then the new one
    unbalancedNode.height = 1 + Math.max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right));
    newRoot.height = 1 + Math.max(getHeight(newRoot.left), getHeight(newRoot.right));

    return newRoot;
}

// Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
// its right child to become the new subtree root. Fixes right-heavy imbalance.
function rotateLeft(unbalancedNode) {
    const newRoot = unbalancedNode.right;
    const transferredSubtree = newRoot.left;

    // Perform the rotation
    newRoot.left = unbalancedNode;
    unbalancedNode.right = transferredSubtree;

    // Heights must be recomputed bottom-up: the old root first, then the new one
    unbalancedNode.height = 1 + Math.max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right));
    newRoot.height = 1 + Math.max(getHeight(newRoot.left), getHeight(newRoot.right));

    return newRoot;
}

// Inserts 'value' into the AVL tree rooted at 'node', rebalancing as needed,
// and returns the (possibly new) root of this subtree.
function insert(node, value) {
    // Standard BST insertion
    if (node === null) {
        return new AVLNode(value);
    }
    if (value < node.value) {
        node.left = insert(node.left, value);
    } else if (value > node.value) {
        node.right = insert(node.right, value);
    } else {
        return node; // duplicate values are ignored
    }

    // Update this node's height now that a child subtree may have grown
    node.height = 1 + Math.max(getHeight(node.left), getHeight(node.right));

    // Check whether this node has become unbalanced
    const balance = getBalanceFactor(node);

    // Left-Left case: left child is heavier, and the new key went further left
    if (balance > 1 && value < node.left.value) {
        return rotateRight(node);
    }
    // Right-Right case: right child is heavier, and the new key went further right
    if (balance < -1 && value > node.right.value) {
        return rotateLeft(node);
    }
    // Left-Right case: left child is heavier, but the new key went right of it
    if (balance > 1 && value > node.left.value) {
        node.left = rotateLeft(node.left);
        return rotateRight(node);
    }
    // Right-Left case: right child is heavier, but the new key went left of it
    if (balance < -1 && value < node.right.value) {
        node.right = rotateRight(node.right);
        return rotateLeft(node);
    }

    return node; // already balanced, no rotation needed
}

// Collects the tree's values in ascending order (in-order traversal of a
// BST always yields sorted output).
function collectInOrder(node, output) {
    if (node === null) return;
    collectInOrder(node.left, output);
    output.push(node.value);
    collectInOrder(node.right, output);
}

let root = null;

// Deliberately insert in ascending order: a plain BST would degrade into
// a straight line here, but the AVL tree will stay balanced throughout.
const valuesToInsert = [10, 20, 30, 40, 50, 25];
for (const value of valuesToInsert) {
    root = insert(root, value);
}

const sortedOutput = [];
collectInOrder(root, sortedOutput);
console.log("In-order traversal (sorted):", sortedOutput.join(" "));

console.log("Root value after rebalancing:", root.value);
console.log("Tree height:", getHeight(root));
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

// Each node stores its own subtree height so balance can be checked in O(1).
typedef struct AVLNode {
    int value;
    int height;
    struct AVLNode* left;
    struct AVLNode* right;
} AVLNode;

// Returns the larger of two integers.
int maxInt(int a, int b) {
    return a > b ? a : b;
}

// Returns the stored height of a node, treating NULL as height 0.
int getHeight(AVLNode* node) {
    if (node == NULL) return 0;
    return node->height;
}

// The balance factor is (left subtree height) - (right subtree height).
// A magnitude greater than 1 means the AVL invariant has been violated.
int getBalanceFactor(AVLNode* node) {
    if (node == NULL) return 0;
    return getHeight(node->left) - getHeight(node->right);
}

// Allocates a fresh leaf node. A brand-new leaf always has height 1.
AVLNode* createNode(int value) {
    AVLNode* node = (AVLNode*)malloc(sizeof(AVLNode));
    node->value = value;
    node->height = 1;
    node->left = NULL;
    node->right = NULL;
    return node;
}

// Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
// its left child to become the new subtree root. Fixes left-heavy imbalance.
AVLNode* rotateRight(AVLNode* unbalancedNode) {
    AVLNode* newRoot = unbalancedNode->left;
    AVLNode* transferredSubtree = newRoot->right;

    newRoot->right = unbalancedNode;
    unbalancedNode->left = transferredSubtree;

    unbalancedNode->height = 1 + maxInt(getHeight(unbalancedNode->left), getHeight(unbalancedNode->right));
    newRoot->height = 1 + maxInt(getHeight(newRoot->left), getHeight(newRoot->right));

    return newRoot;
}

// Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
// its right child to become the new subtree root. Fixes right-heavy imbalance.
AVLNode* rotateLeft(AVLNode* unbalancedNode) {
    AVLNode* newRoot = unbalancedNode->right;
    AVLNode* transferredSubtree = newRoot->left;

    newRoot->left = unbalancedNode;
    unbalancedNode->right = transferredSubtree;

    unbalancedNode->height = 1 + maxInt(getHeight(unbalancedNode->left), getHeight(unbalancedNode->right));
    newRoot->height = 1 + maxInt(getHeight(newRoot->left), getHeight(newRoot->right));

    return newRoot;
}

// Inserts 'value' into the AVL tree rooted at 'node', rebalancing as needed,
// and returns the (possibly new) root of this subtree.
AVLNode* insert(AVLNode* node, int value) {
    if (node == NULL) {
        return createNode(value);
    }
    if (value < node->value) {
        node->left = insert(node->left, value);
    } else if (value > node->value) {
        node->right = insert(node->right, value);
    } else {
        return node; // duplicate values are ignored
    }

    node->height = 1 + maxInt(getHeight(node->left), getHeight(node->right));

    int balance = getBalanceFactor(node);

    if (balance > 1 && value < node->left->value) {
        return rotateRight(node);
    }
    if (balance < -1 && value > node->right->value) {
        return rotateLeft(node);
    }
    if (balance > 1 && value > node->left->value) {
        node->left = rotateLeft(node->left);
        return rotateRight(node);
    }
    if (balance < -1 && value < node->right->value) {
        node->right = rotateRight(node->right);
        return rotateLeft(node);
    }

    return node;
}

// Prints the tree's values in ascending order (in-order traversal of a BST
// always yields sorted output).
void printInOrder(AVLNode* node) {
    if (node == NULL) return;
    printInOrder(node->left);
    printf("%d ", node->value);
    printInOrder(node->right);
}

int main(void) {
    AVLNode* root = NULL;

    // Deliberately insert in ascending order: a plain BST would degrade into
    // a straight line here, but the AVL tree will stay balanced throughout.
    int valuesToInsert[] = {10, 20, 30, 40, 50, 25};
    int valueCount = 6;
    for (int i = 0; i < valueCount; i++) {
        root = insert(root, valuesToInsert[i]);
    }

    printf("In-order traversal (sorted): ");
    printInOrder(root);
    printf("\n");

    printf("Root value after rebalancing: %d\n", root->value);
    printf("Tree height: %d\n", getHeight(root));

    return 0;
}
`,
        "c#": `using System;
using System.Text;

public static class AVLTree {

    // Each node stores its own subtree height so balance can be checked in O(1).
    public class AVLNode {
        public int Value;
        public int Height;
        public AVLNode Left;
        public AVLNode Right;

        public AVLNode(int value) {
            Value = value;
            Height = 1;
        }
    }

    // Returns the stored height of a node, treating null as height 0.
    static int GetHeight(AVLNode node) {
        if (node == null) return 0;
        return node.Height;
    }

    // The balance factor is (left subtree height) - (right subtree height).
    // A magnitude greater than 1 means the AVL invariant has been violated.
    static int GetBalanceFactor(AVLNode node) {
        if (node == null) return 0;
        return GetHeight(node.Left) - GetHeight(node.Right);
    }

    // Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
    // its left child to become the new subtree root. Fixes left-heavy imbalance.
    static AVLNode RotateRight(AVLNode unbalancedNode) {
        AVLNode newRoot = unbalancedNode.Left;
        AVLNode transferredSubtree = newRoot.Right;

        newRoot.Right = unbalancedNode;
        unbalancedNode.Left = transferredSubtree;

        unbalancedNode.Height = 1 + Math.Max(GetHeight(unbalancedNode.Left), GetHeight(unbalancedNode.Right));
        newRoot.Height = 1 + Math.Max(GetHeight(newRoot.Left), GetHeight(newRoot.Right));

        return newRoot;
    }

    // Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
    // its right child to become the new subtree root. Fixes right-heavy imbalance.
    static AVLNode RotateLeft(AVLNode unbalancedNode) {
        AVLNode newRoot = unbalancedNode.Right;
        AVLNode transferredSubtree = newRoot.Left;

        newRoot.Left = unbalancedNode;
        unbalancedNode.Right = transferredSubtree;

        unbalancedNode.Height = 1 + Math.Max(GetHeight(unbalancedNode.Left), GetHeight(unbalancedNode.Right));
        newRoot.Height = 1 + Math.Max(GetHeight(newRoot.Left), GetHeight(newRoot.Right));

        return newRoot;
    }

    // Inserts 'value' into the AVL tree rooted at 'node', rebalancing as
    // needed, and returns the (possibly new) root of this subtree.
    static AVLNode Insert(AVLNode node, int value) {
        if (node == null) {
            return new AVLNode(value);
        }
        if (value < node.Value) {
            node.Left = Insert(node.Left, value);
        } else if (value > node.Value) {
            node.Right = Insert(node.Right, value);
        } else {
            return node; // duplicate values are ignored
        }

        node.Height = 1 + Math.Max(GetHeight(node.Left), GetHeight(node.Right));

        int balance = GetBalanceFactor(node);

        if (balance > 1 && value < node.Left.Value) {
            return RotateRight(node);
        }
        if (balance < -1 && value > node.Right.Value) {
            return RotateLeft(node);
        }
        if (balance > 1 && value > node.Left.Value) {
            node.Left = RotateLeft(node.Left);
            return RotateRight(node);
        }
        if (balance < -1 && value < node.Right.Value) {
            node.Right = RotateRight(node.Right);
            return RotateLeft(node);
        }

        return node;
    }

    // Appends the tree's values in ascending order (in-order traversal of a
    // BST always yields sorted output).
    static void PrintInOrder(AVLNode node, StringBuilder output) {
        if (node == null) return;
        PrintInOrder(node.Left, output);
        output.Append(node.Value).Append(" ");
        PrintInOrder(node.Right, output);
    }

    public static void Main() {
        AVLNode root = null;

        // Deliberately insert in ascending order: a plain BST would degrade into
        // a straight line here, but the AVL tree will stay balanced throughout.
        int[] valuesToInsert = {10, 20, 30, 40, 50, 25};
        foreach (int value in valuesToInsert) {
            root = Insert(root, value);
        }

        var sortedOutput = new StringBuilder();
        PrintInOrder(root, sortedOutput);
        Console.WriteLine("In-order traversal (sorted): " + sortedOutput.ToString().Trim());

        Console.WriteLine("Root value after rebalancing: " + root.Value);
        Console.WriteLine("Tree height: " + GetHeight(root));
    }
}
`,
        "swift": `import Foundation

// Each node stores its own subtree height so balance can be checked in O(1).
final class AVLNode {
    var value: Int
    var height: Int = 1
    var left: AVLNode?
    var right: AVLNode?

    init(_ value: Int) {
        self.value = value
    }
}

// Returns the stored height of a node, treating nil as height 0.
func getHeight(_ node: AVLNode?) -> Int {
    guard let node = node else { return 0 }
    return node.height
}

// The balance factor is (left subtree height) - (right subtree height).
// A magnitude greater than 1 means the AVL invariant has been violated.
func getBalanceFactor(_ node: AVLNode?) -> Int {
    guard let node = node else { return 0 }
    return getHeight(node.left) - getHeight(node.right)
}

// Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
// its left child to become the new subtree root. Fixes left-heavy imbalance.
func rotateRight(_ unbalancedNode: AVLNode) -> AVLNode {
    let newRoot = unbalancedNode.left!
    let transferredSubtree = newRoot.right

    newRoot.right = unbalancedNode
    unbalancedNode.left = transferredSubtree

    unbalancedNode.height = 1 + max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
    newRoot.height = 1 + max(getHeight(newRoot.left), getHeight(newRoot.right))

    return newRoot
}

// Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
// its right child to become the new subtree root. Fixes right-heavy imbalance.
func rotateLeft(_ unbalancedNode: AVLNode) -> AVLNode {
    let newRoot = unbalancedNode.right!
    let transferredSubtree = newRoot.left

    newRoot.left = unbalancedNode
    unbalancedNode.right = transferredSubtree

    unbalancedNode.height = 1 + max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
    newRoot.height = 1 + max(getHeight(newRoot.left), getHeight(newRoot.right))

    return newRoot
}

// Inserts 'value' into the AVL tree rooted at 'node', rebalancing as needed,
// and returns the (possibly new) root of this subtree.
func insert(_ node: AVLNode?, _ value: Int) -> AVLNode {
    guard let node = node else {
        return AVLNode(value)
    }

    if value < node.value {
        node.left = insert(node.left, value)
    } else if value > node.value {
        node.right = insert(node.right, value)
    } else {
        return node // duplicate values are ignored
    }

    node.height = 1 + max(getHeight(node.left), getHeight(node.right))

    let balance = getBalanceFactor(node)

    if balance > 1 && value < node.left!.value {
        return rotateRight(node)
    }
    if balance < -1 && value > node.right!.value {
        return rotateLeft(node)
    }
    if balance > 1 && value > node.left!.value {
        node.left = rotateLeft(node.left!)
        return rotateRight(node)
    }
    if balance < -1 && value < node.right!.value {
        node.right = rotateRight(node.right!)
        return rotateLeft(node)
    }

    return node
}

// Collects the tree's values in ascending order (in-order traversal of a
// BST always yields sorted output).
func collectInOrder(_ node: AVLNode?, _ output: inout [Int]) {
    guard let node = node else { return }
    collectInOrder(node.left, &output)
    output.append(node.value)
    collectInOrder(node.right, &output)
}

var root: AVLNode? = nil

// Deliberately insert in ascending order: a plain BST would degrade into
// a straight line here, but the AVL tree will stay balanced throughout.
let valuesToInsert = [10, 20, 30, 40, 50, 25]
for value in valuesToInsert {
    root = insert(root, value)
}

var sortedOutput: [Int] = []
collectInOrder(root, &sortedOutput)
print("In-order traversal (sorted): \(sortedOutput.map { String($0) }.joined(separator: " "))")

print("Root value after rebalancing: \(root!.value)")
print("Tree height: \(getHeight(root))")
`,
        "kotlin": `// Each node stores its own subtree height so balance can be checked in O(1).
class AVLNode(var value: Int) {
    var height: Int = 1
    var left: AVLNode? = null
    var right: AVLNode? = null
}

// Returns the stored height of a node, treating null as height 0.
fun getHeight(node: AVLNode?): Int {
    return node?.height ?: 0
}

// The balance factor is (left subtree height) - (right subtree height).
// A magnitude greater than 1 means the AVL invariant has been violated.
fun getBalanceFactor(node: AVLNode?): Int {
    if (node == null) return 0
    return getHeight(node.left) - getHeight(node.right)
}

// Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
// its left child to become the new subtree root. Fixes left-heavy imbalance.
fun rotateRight(unbalancedNode: AVLNode): AVLNode {
    val newRoot = unbalancedNode.left!!
    val transferredSubtree = newRoot.right

    newRoot.right = unbalancedNode
    unbalancedNode.left = transferredSubtree

    unbalancedNode.height = 1 + maxOf(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
    newRoot.height = 1 + maxOf(getHeight(newRoot.left), getHeight(newRoot.right))

    return newRoot
}

// Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
// its right child to become the new subtree root. Fixes right-heavy imbalance.
fun rotateLeft(unbalancedNode: AVLNode): AVLNode {
    val newRoot = unbalancedNode.right!!
    val transferredSubtree = newRoot.left

    newRoot.left = unbalancedNode
    unbalancedNode.right = transferredSubtree

    unbalancedNode.height = 1 + maxOf(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
    newRoot.height = 1 + maxOf(getHeight(newRoot.left), getHeight(newRoot.right))

    return newRoot
}

// Inserts 'value' into the AVL tree rooted at 'node', rebalancing as needed,
// and returns the (possibly new) root of this subtree.
fun insert(node: AVLNode?, value: Int): AVLNode {
    if (node == null) {
        return AVLNode(value)
    }

    if (value < node.value) {
        node.left = insert(node.left, value)
    } else if (value > node.value) {
        node.right = insert(node.right, value)
    } else {
        return node // duplicate values are ignored
    }

    node.height = 1 + maxOf(getHeight(node.left), getHeight(node.right))

    val balance = getBalanceFactor(node)

    if (balance > 1 && value < node.left!!.value) {
        return rotateRight(node)
    }
    if (balance < -1 && value > node.right!!.value) {
        return rotateLeft(node)
    }
    if (balance > 1 && value > node.left!!.value) {
        node.left = rotateLeft(node.left!!)
        return rotateRight(node)
    }
    if (balance < -1 && value < node.right!!.value) {
        node.right = rotateRight(node.right!!)
        return rotateLeft(node)
    }

    return node
}

// Collects the tree's values in ascending order (in-order traversal of a
// BST always yields sorted output).
fun collectInOrder(node: AVLNode?, output: MutableList<Int>) {
    if (node == null) return
    collectInOrder(node.left, output)
    output.add(node.value)
    collectInOrder(node.right, output)
}

fun main() {
    var root: AVLNode? = null

    // Deliberately insert in ascending order: a plain BST would degrade into
    // a straight line here, but the AVL tree will stay balanced throughout.
    val valuesToInsert = intArrayOf(10, 20, 30, 40, 50, 25)
    for (value in valuesToInsert) {
        root = insert(root, value)
    }

    val sortedOutput = mutableListOf<Int>()
    collectInOrder(root, sortedOutput)
    println("In-order traversal (sorted): \${sortedOutput.joinToString(" ")}")

    println("Root value after rebalancing: \${root!!.value}")
    println("Tree height: \${getHeight(root)}")
}
`,
        "scala": `// Each node stores its own subtree height so balance can be checked in O(1).
class AVLNode(var value: Int) {
    var height: Int = 1
    var left: AVLNode = null
    var right: AVLNode = null
}

object AVLTree extends App {

    // Returns the stored height of a node, treating null as height 0.
    def getHeight(node: AVLNode): Int = {
        if (node == null) 0 else node.height
    }

    // The balance factor is (left subtree height) - (right subtree height).
    // A magnitude greater than 1 means the AVL invariant has been violated.
    def getBalanceFactor(node: AVLNode): Int = {
        if (node == null) 0 else getHeight(node.left) - getHeight(node.right)
    }

    // Rotates the subtree rooted at 'unbalancedNode' to the right, promoting
    // its left child to become the new subtree root. Fixes left-heavy imbalance.
    def rotateRight(unbalancedNode: AVLNode): AVLNode = {
        val newRoot = unbalancedNode.left
        val transferredSubtree = newRoot.right

        newRoot.right = unbalancedNode
        unbalancedNode.left = transferredSubtree

        unbalancedNode.height = 1 + math.max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
        newRoot.height = 1 + math.max(getHeight(newRoot.left), getHeight(newRoot.right))

        newRoot
    }

    // Rotates the subtree rooted at 'unbalancedNode' to the left, promoting
    // its right child to become the new subtree root. Fixes right-heavy imbalance.
    def rotateLeft(unbalancedNode: AVLNode): AVLNode = {
        val newRoot = unbalancedNode.right
        val transferredSubtree = newRoot.left

        newRoot.left = unbalancedNode
        unbalancedNode.right = transferredSubtree

        unbalancedNode.height = 1 + math.max(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
        newRoot.height = 1 + math.max(getHeight(newRoot.left), getHeight(newRoot.right))

        newRoot
    }

    // Inserts 'value' into the AVL tree rooted at 'node', rebalancing as
    // needed, and returns the (possibly new) root of this subtree.
    def insert(node: AVLNode, value: Int): AVLNode = {
        if (node == null) {
            return new AVLNode(value)
        }

        if (value < node.value) {
            node.left = insert(node.left, value)
        } else if (value > node.value) {
            node.right = insert(node.right, value)
        } else {
            return node // duplicate values are ignored
        }

        node.height = 1 + math.max(getHeight(node.left), getHeight(node.right))

        val balance = getBalanceFactor(node)

        if (balance > 1 && value < node.left.value) {
            return rotateRight(node)
        }
        if (balance < -1 && value > node.right.value) {
            return rotateLeft(node)
        }
        if (balance > 1 && value > node.left.value) {
            node.left = rotateLeft(node.left)
            return rotateRight(node)
        }
        if (balance < -1 && value < node.right.value) {
            node.right = rotateRight(node.right)
            return rotateLeft(node)
        }

        node
    }

    // Collects the tree's values in ascending order (in-order traversal of a
    // BST always yields sorted output).
    def collectInOrder(node: AVLNode, output: scala.collection.mutable.ListBuffer[Int]): Unit = {
        if (node == null) return
        collectInOrder(node.left, output)
        output += node.value
        collectInOrder(node.right, output)
    }

    var root: AVLNode = null

    // Deliberately insert in ascending order: a plain BST would degrade into
    // a straight line here, but the AVL tree will stay balanced throughout.
    val valuesToInsert = Array(10, 20, 30, 40, 50, 25)
    for (value <- valuesToInsert) {
        root = insert(root, value)
    }

    val sortedOutput = scala.collection.mutable.ListBuffer[Int]()
    collectInOrder(root, sortedOutput)
    println(s"In-order traversal (sorted): \${sortedOutput.mkString(" ")}")

    println(s"Root value after rebalancing: \${root.value}")
    println(s"Tree height: \${getHeight(root)}")
}
`,
        "go": `package main

import "fmt"

// AVLNode stores its own subtree height so balance can be checked in O(1).
type AVLNode struct {
    value  int
    height int
    left   *AVLNode
    right  *AVLNode
}

// maxInt returns the larger of two integers.
func maxInt(a, b int) int {
    if a > b {
        return a
    }
    return b
}

// getHeight returns the stored height of a node, treating nil as height 0.
func getHeight(node *AVLNode) int {
    if node == nil {
        return 0
    }
    return node.height
}

// getBalanceFactor is (left subtree height) - (right subtree height).
// A magnitude greater than 1 means the AVL invariant has been violated.
func getBalanceFactor(node *AVLNode) int {
    if node == nil {
        return 0
    }
    return getHeight(node.left) - getHeight(node.right)
}

// rotateRight rotates the subtree rooted at 'unbalancedNode' to the right,
// promoting its left child to become the new subtree root.
func rotateRight(unbalancedNode *AVLNode) *AVLNode {
    newRoot := unbalancedNode.left
    transferredSubtree := newRoot.right

    newRoot.right = unbalancedNode
    unbalancedNode.left = transferredSubtree

    unbalancedNode.height = 1 + maxInt(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
    newRoot.height = 1 + maxInt(getHeight(newRoot.left), getHeight(newRoot.right))

    return newRoot
}

// rotateLeft rotates the subtree rooted at 'unbalancedNode' to the left,
// promoting its right child to become the new subtree root.
func rotateLeft(unbalancedNode *AVLNode) *AVLNode {
    newRoot := unbalancedNode.right
    transferredSubtree := newRoot.left

    newRoot.left = unbalancedNode
    unbalancedNode.right = transferredSubtree

    unbalancedNode.height = 1 + maxInt(getHeight(unbalancedNode.left), getHeight(unbalancedNode.right))
    newRoot.height = 1 + maxInt(getHeight(newRoot.left), getHeight(newRoot.right))

    return newRoot
}

// insert places 'value' into the AVL tree rooted at 'node', rebalancing as
// needed, and returns the (possibly new) root of this subtree.
func insert(node *AVLNode, value int) *AVLNode {
    if node == nil {
        return &AVLNode{value: value, height: 1}
    }
    if value < node.value {
        node.left = insert(node.left, value)
    } else if value > node.value {
        node.right = insert(node.right, value)
    } else {
        return node // duplicate values are ignored
    }

    node.height = 1 + maxInt(getHeight(node.left), getHeight(node.right))

    balance := getBalanceFactor(node)

    if balance > 1 && value < node.left.value {
        return rotateRight(node)
    }
    if balance < -1 && value > node.right.value {
        return rotateLeft(node)
    }
    if balance > 1 && value > node.left.value {
        node.left = rotateLeft(node.left)
        return rotateRight(node)
    }
    if balance < -1 && value < node.right.value {
        node.right = rotateRight(node.right)
        return rotateLeft(node)
    }

    return node
}

// collectInOrder appends the tree's values in ascending order (in-order
// traversal of a BST always yields sorted output).
func collectInOrder(node *AVLNode, output *[]int) {
    if node == nil {
        return
    }
    collectInOrder(node.left, output)
    *output = append(*output, node.value)
    collectInOrder(node.right, output)
}

func main() {
    var root *AVLNode

    // Deliberately insert in ascending order: a plain BST would degrade into
    // a straight line here, but the AVL tree will stay balanced throughout.
    valuesToInsert := []int{10, 20, 30, 40, 50, 25}
    for _, value := range valuesToInsert {
        root = insert(root, value)
    }

    var sortedOutput []int
    collectInOrder(root, &sortedOutput)
    fmt.Println("In-order traversal (sorted):", sortedOutput)

    fmt.Println("Root value after rebalancing:", root.value)
    fmt.Println("Tree height:", getHeight(root))
}
`,
        "rust": `// Each node stores its own subtree height so balance can be checked in O(1).
struct AVLNode {
    value: i32,
    height: i32,
    left: Option<Box<AVLNode>>,
    right: Option<Box<AVLNode>>,
}

impl AVLNode {
    fn new(value: i32) -> Self {
        AVLNode { value, height: 1, left: None, right: None }
    }
}

/// Returns the stored height of a node, treating None as height 0.
fn get_height(node: &Option<Box<AVLNode>>) -> i32 {
    match node {
        Some(n) => n.height,
        None => 0,
    }
}

/// The balance factor is (left subtree height) - (right subtree height).
/// A magnitude greater than 1 means the AVL invariant has been violated.
fn get_balance_factor(node: &AVLNode) -> i32 {
    get_height(&node.left) - get_height(&node.right)
}

/// Recomputes and stores a node's height from its two children.
fn refresh_height(node: &mut AVLNode) {
    node.height = 1 + get_height(&node.left).max(get_height(&node.right));
}

/// Rotates the given subtree to the right, promoting its left child to
/// become the new subtree root. Fixes left-heavy imbalance.
fn rotate_right(mut unbalanced_node: Box<AVLNode>) -> Box<AVLNode> {
    let mut new_root = unbalanced_node.left.take().unwrap();
    let transferred_subtree = new_root.right.take();

    unbalanced_node.left = transferred_subtree;
    refresh_height(&mut unbalanced_node);

    new_root.right = Some(unbalanced_node);
    refresh_height(&mut new_root);

    new_root
}

/// Rotates the given subtree to the left, promoting its right child to
/// become the new subtree root. Fixes right-heavy imbalance.
fn rotate_left(mut unbalanced_node: Box<AVLNode>) -> Box<AVLNode> {
    let mut new_root = unbalanced_node.right.take().unwrap();
    let transferred_subtree = new_root.left.take();

    unbalanced_node.right = transferred_subtree;
    refresh_height(&mut unbalanced_node);

    new_root.left = Some(unbalanced_node);
    refresh_height(&mut new_root);

    new_root
}

/// Inserts value into the AVL tree rooted at node, rebalancing as
/// needed, and returns the (possibly new) root of this subtree.
fn insert(node: Option<Box<AVLNode>>, value: i32) -> Option<Box<AVLNode>> {
    let mut node = match node {
        None => return Some(Box::new(AVLNode::new(value))),
        Some(n) => n,
    };

    if value < node.value {
        node.left = insert(node.left.take(), value);
    } else if value > node.value {
        node.right = insert(node.right.take(), value);
    } else {
        return Some(node); // duplicate values are ignored
    }

    refresh_height(&mut node);

    let balance = get_balance_factor(&node);
    let left_value = node.left.as_ref().map(|n| n.value);
    let right_value = node.right.as_ref().map(|n| n.value);

    // Left-Left case: left child is heavier, and the new key went further left
    if balance > 1 && Some(value) < left_value {
        return Some(rotate_right(node));
    }
    // Right-Right case: right child is heavier, and the new key went further right
    if balance < -1 && Some(value) > right_value {
        return Some(rotate_left(node));
    }
    // Left-Right case: left child is heavier, but the new key went right of it
    if balance > 1 && Some(value) > left_value {
        node.left = Some(rotate_left(node.left.take().unwrap()));
        return Some(rotate_right(node));
    }
    // Right-Left case: right child is heavier, but the new key went left of it
    if balance < -1 && Some(value) < right_value {
        node.right = Some(rotate_right(node.right.take().unwrap()));
        return Some(rotate_left(node));
    }

    Some(node) // already balanced, no rotation needed
}

/// Collects the tree's values in ascending order (in-order traversal of a
/// BST always yields sorted output).
fn collect_in_order(node: &Option<Box<AVLNode>>, output: &mut Vec<i32>) {
    if let Some(n) = node {
        collect_in_order(&n.left, output);
        output.push(n.value);
        collect_in_order(&n.right, output);
    }
}

fn main() {
    let mut root: Option<Box<AVLNode>> = None;

    // Deliberately insert in ascending order: a plain BST would degrade into
    // a straight line here, but the AVL tree will stay balanced throughout.
    let values_to_insert = [10, 20, 30, 40, 50, 25];
    for &value in values_to_insert.iter() {
        root = insert(root, value);
    }

    let mut sorted_output = Vec::new();
    collect_in_order(&root, &mut sorted_output);
    let printable: Vec<String> = sorted_output.iter().map(|v| v.to_string()).collect();
    println!("In-order traversal (sorted): {}", printable.join(" "));

    if let Some(ref root_node) = root {
        println!("Root value after rebalancing: {}", root_node.value);
    }
    println!("Tree height: {}", get_height(&root));
}
`
      }
    },
  ]
};

// const TREES_SECTION2 = {
//   name: "Trees",
//   href: "/algorithms/trees",
//     icon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
//         <circle cx="32" cy="12" r="5"/>
//         <circle cx="18" cy="32" r="5"/>
//         <circle cx="46" cy="32" r="5"/>
//         <circle cx="10" cy="52" r="5"/>
//         <circle cx="26" cy="52" r="5"/>
//         <circle cx="38" cy="52" r="5"/>
//         <circle cx="54" cy="52" r="5"/>
//         <line x1="32" y1="17" x2="18" y2="27"/>
//         <line x1="32" y1="17" x2="46" y2="27"/>
//         <line x1="18" y1="37" x2="10" y2="47"/>
//         <line x1="18" y1="37" x2="26" y2="47"/>
//         <line x1="46" y1="37" x2="38" y2="47"/>
//         <line x1="46" y1="37" x2="54" y2="47"/>
//       </svg>
//     ),
//     hoverIcon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
//         <circle cx="32" cy="12" r="5" stroke="#34D399" fill="#34D399"/>
//         <circle cx="18" cy="32" r="5" stroke="#34D399" fill="#34D399"/>
//         <circle cx="46" cy="32" r="5"/>
//         <circle cx="10" cy="52" r="5" stroke="#34D399" fill="#34D399"/>
//         <circle cx="26" cy="52" r="5"/>
//         <circle cx="38" cy="52" r="5"/>
//         <circle cx="54" cy="52" r="5"/>
//         <line x1="32" y1="17" x2="18" y2="27" stroke="#34D399" strokeWidth="4"/>
//         <line x1="32" y1="17" x2="46" y2="27"/>
//         <line x1="18" y1="37" x2="10" y2="47" stroke="#34D399" strokeWidth="4"/>
//         <line x1="18" y1="37" x2="26" y2="47"/>
//         <line x1="46" y1="37" x2="38" y2="47"/>
//         <line x1="46" y1="37" x2="54" y2="47"/>
//       </svg>
//     ),

//   about: [
//     { tag: "h1", text: "Trees" },
//     { tag: "p", text: "A tree is a connected, acyclic graph with a designated root, where every other vertex has exactly one parent — this hierarchical structure makes trees the natural representation for anything with nested relationships: file systems, organisation charts, expression parsing, and the indexing structures behind nearly every database." },
//     { tag: "p", text: "The single number that governs almost every tree algorithm's performance is its height h — the length of the longest path from root to leaf. A perfectly balanced binary tree has h = O(log n), giving fast O(log n) search, insert, and delete. But an unbalanced tree (e.g. one built by inserting already-sorted data into a plain BST) can degrade to h = O(n), turning every operation into a linear scan. This single fact — that height, not node count, determines speed — is why self-balancing trees (AVL, Red-Black) exist at all." },
//     { tag: "h2", text: "Why self-balancing trees exist" },
//     { tag: "p", text: "A plain Binary Search Tree gives no guarantee about its own shape — it's entirely a function of insertion order. AVL trees and Red-Black trees both solve this by enforcing a structural invariant after every insertion and deletion (rotations to restore balance), guaranteeing h = O(log n) no matter what order operations arrive in. The trade-off between them is rebalancing frequency vs. rebalancing cost — AVL trees are more rigidly balanced (faster lookups) but rebalance more often (slower writes); Red-Black trees are more loosely balanced (slightly slower lookups) but rebalance less often (faster writes)." },
//     { tag: "table",
//       headers: ["Structure", "Guarantee", "Lookup", "Insert/Delete", "Typical Use"],
//       rows: [
//         ["Plain BST", "None — height depends on insertion order", "O(log n) avg / O(n) worst", "O(log n) avg / O(n) worst", "Simple ordered maps, teaching"],
//         ["AVL Tree", "Strictly balanced: height difference of subtrees ≤ 1", "O(log n) guaranteed", "O(log n) guaranteed", "Read-heavy workloads"],
//         ["Red-Black Tree", "Loosely balanced via coloring rules", "O(log n) guaranteed", "O(log n) guaranteed, fewer rotations", "Write-heavy workloads (most language standard libraries)"],
//         ["Tree Traversals", "N/A — visits every node", "O(n) to visit all nodes", "N/A", "Serialisation, expression evaluation, search"],
//         ["Lowest Common Ancestor", "Depends on tree type", "O(log n) for BST, O(n) general", "N/A", "Family-tree/version-control-style ancestry queries"]
//       ]
//     },
//     { tag: "note", variant: "tip", text: "If you're asked for a self-balancing tree but don't know which kind, Red-Black is almost always the right default — it's what backs C++'s std::map, Java's TreeMap, and the Linux kernel's process scheduler, precisely because of its cheaper rebalancing." }
//   ],

//   items: [

//     /* ════════════════════════════════════════════════════════════════════
//        1. AVL TREES
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "AVL Trees",
//       href: "/algorithms/trees/avl",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "AVL Trees" },
//         { tag: "p", text: "An AVL tree, named after its inventors Georgy Adelson-Velsky and Evgenii Landis (1962), is a self-balancing Binary Search Tree where, for every node, the heights of its left and right subtrees differ by at most 1. This 'balance factor' constraint is checked and restored after every insertion or deletion, guaranteeing the tree's height never exceeds O(log n) regardless of the order operations occur in." },
//         { tag: "p", text: "Balance is restored using rotations — single (left or right) and double (left-right or right-left) — applied at the lowest unbalanced ancestor of a newly inserted or deleted node. AVL trees were the first self-balancing BST structure ever invented and remain the standard example for teaching how local structural fixes can maintain a global height guarantee." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Read-heavy workloads where lookups vastly outnumber insertions/deletions — AVL's stricter balance gives slightly faster average lookup than Red-Black trees",
//           "Applications needing a hard guarantee on worst-case search time, such as real-time systems",
//           "Database indexing and in-memory ordered maps where query latency matters more than update throughput",
//           "Anywhere a plain BST is being considered but insertion order can't be guaranteed to be random (e.g. data could arrive pre-sorted, which would degrade a plain BST to O(n))"
//         ]},
//         { tag: "table",
//           headers: ["Rotation Type", "Trigger Condition", "Fix Applied"],
//           rows: [
//             ["Left-Left (LL)", "Imbalance in the left subtree's left child", "Single right rotation"],
//             ["Right-Right (RR)", "Imbalance in the right subtree's right child", "Single left rotation"],
//             ["Left-Right (LR)", "Imbalance in the left subtree's right child", "Left rotation on child, then right rotation on node"],
//             ["Right-Left (RL)", "Imbalance in the right subtree's left child", "Right rotation on child, then left rotation on node"]
//           ]
//         },
//         { tag: "note", variant: "info", text: "AVL trees rebalance more aggressively than Red-Black trees, which is why they're favoured when lookups dominate — but that same aggressiveness means more rotations per write, which is why write-heavy systems usually prefer Red-Black trees instead." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(log n)",
//         best: [
//           { tag: "h2", text: "Best Case — O(log n)" },
//           { tag: "p", text: "Even in the most favourable scenario (e.g. searching for the root itself), the asymptotic classification remains O(log n) because the algorithm's structure guarantees this bound for the tree's height regardless of which specific node is targeted." },
//           { tag: "ul", items: [
//             "AVL's height invariant guarantees h = O(log n) at all times, for any sequence of insertions/deletions",
//             "Searching, inserting, or deleting always follows a root-to-leaf path bounded by this height",
//             "Best case (target found near the root): still classified O(log n) since the guarantee is structural, not value-dependent"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(log n)" },
//           { tag: "p", text: "Because the balance invariant is actively enforced after every modification, there's no 'typical' input that produces a worse shape than the guaranteed bound — average case equals the guaranteed worst case." },
//           { tag: "ul", items: [
//             "Search: traverse from root to a leaf, comparing at each level — O(h) = O(log n)",
//             "Insert: search for the insertion point (O(log n)), then rebalance along the path back to the root, performing at most O(log n) rotations — but each rotation is O(1), so total insert cost is O(log n)",
//             "Delete: similarly O(log n) for the search plus O(log n) for rebalancing"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(log n)" },
//           { tag: "p", text: "This is AVL's entire purpose: unlike a plain BST, there is no input sequence that can degrade an AVL tree's height beyond its mathematically proven bound." },
//           { tag: "ul", items: [
//             "Provable bound: an AVL tree of height h has at least F(h+2) − 1 nodes, where F is the Fibonacci sequence — inverting this gives h ≤ 1.44 log₂(n+2), i.e. O(log n)",
//             "Search/insert/delete all stay strictly within this bound — there is no adversarial sequence of operations that produces a degenerate (linear-height) shape",
//             "This is the key advantage over a plain BST, whose worst case is O(n)"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n)" },
//           { tag: "p", text: "Storing n nodes always requires O(n) space for the node data itself, plus a small constant overhead per node for the balance factor (or height) field used to maintain the invariant." },
//           { tag: "ul", items: ["n node objects, each with left/right/parent pointers + a balance factor field: O(n)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n)" },
//           { tag: "p", text: "Total stored data is fixed by n regardless of the tree's exact shape, since the guaranteed-balanced structure doesn't change how many nodes need to be stored." },
//           { tag: "ul", items: ["O(n) for node storage", "O(log n) for the recursion stack during operations, due to the guaranteed logarithmic height"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "No insertion/deletion sequence increases storage beyond the fixed per-node overhead — this is a hallmark difference from time complexity, since space doesn't depend on tree shape, only on node count." },
//           { tag: "ul", items: [
//             "O(n) total node storage, identical to a plain BST",
//             "O(log n) recursion/call-stack depth during any single operation — guaranteed by the height bound, unlike a plain BST's potential O(n) worst-case stack depth"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function insert(node, key):
//     if node is null:
//         return new Node(key)

//     if key < node.key:
//         node.left ← insert(node.left, key)
//     else if key > node.key:
//         node.right ← insert(node.right, key)
//     else:
//         return node                          // duplicate key, no-op

//     updateHeight(node)
//     balance ← getBalanceFactor(node)         // height(left) − height(right)

//     // Left-Left case
//     if balance > 1 and key < node.left.key:
//         return rotateRight(node)
//     // Right-Right case
//     if balance < −1 and key > node.right.key:
//         return rotateLeft(node)
//     // Left-Right case
//     if balance > 1 and key > node.left.key:
//         node.left ← rotateLeft(node.left)
//         return rotateRight(node)
//     // Right-Left case
//     if balance < −1 and key < node.right.key:
//         node.right ← rotateRight(node.right)
//         return rotateLeft(node)

//     return node                              // already balanced

// function rotateRight(y):
//     x ← y.left
//     T2 ← x.right
//     x.right ← y
//     y.left ← T2
//     updateHeight(y)
//     updateHeight(x)
//     return x                                 // new subtree root` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Insert exactly like a standard BST insertion: recurse left or right based on key comparison until reaching a null spot, then place the new node there.",
//           "As the recursion unwinds back up the path to the root, update each ancestor's height and compute its balance factor (left subtree height − right subtree height).",
//           "If any node's balance factor exceeds ±1, the AVL invariant has been violated at that node — identify which of the four imbalance cases applies (LL, RR, LR, RL) by comparing the inserted key against the unbalanced node's children.",
//           "Apply the corresponding rotation(s) to restore the height invariant at that node. A single rotation suffices for LL/RR cases; a double rotation (rotate the child, then the node) is needed for LR/RL cases.",
//           "Because rotations are O(1) and the path back to the root has length O(log n) (the tree's guaranteed height), at most O(log n) rotations are checked, with provably at most 2 actual rotations needed to fully rebalance after any single insertion."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Each rotation is a local, BST-order-preserving restructuring: a right rotation around node y promotes y's left child x to take y's place, while preserving the in-order traversal sequence of all affected nodes (this can be verified by checking that the rotated subtree's in-order traversal is identical before and after). Since BST order is preserved by every rotation, search correctness is never compromised. The height-rebalancing guarantee follows from a classical proof: an AVL tree's minimum node count for height h grows according to the Fibonacci recurrence N(h) = N(h-1) + N(h-2) + 1, and solving this recurrence shows h = O(log n) is the only possibility consistent with the balance-factor-≤1 invariant being maintained after every single insertion or deletion." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <algorithm>
// using namespace std;

// struct TreeNode {
//     int value;
//     int height;
//     TreeNode* left;
//     TreeNode* right;

//     TreeNode(int value) {
//         this->value = value;
//         height = 1;
//         left = nullptr;
//         right = nullptr;
//     }
// };

// int getHeight(TreeNode* node) {
//     if (node == nullptr)
//         return 0;
//     return node->height;
// }

// int getBalance(TreeNode* node) {
//     if (node == nullptr)
//         return 0;
//     return getHeight(node->left) - getHeight(node->right);
// }

// TreeNode* rightRotate(TreeNode* node) {
//     TreeNode* left = node->left;
//     TreeNode* temp = left->right;

//     left->right = node;
//     node->left = temp;

//     node->height = max(getHeight(node->left), getHeight(node->right)) + 1;
//     left->height = max(getHeight(left->left), getHeight(left->right)) + 1;

//     return left;
// }

// TreeNode* leftRotate(TreeNode* node) {
//     TreeNode* right = node->right;
//     TreeNode* temp = right->left;

//     right->left = node;
//     node->right = temp;

//     node->height = max(getHeight(node->left), getHeight(node->right)) + 1;
//     right->height = max(getHeight(right->left), getHeight(right->right)) + 1;

//     return right;
// }

// TreeNode* insert(TreeNode* node, int value) {
//     if (node == nullptr)
//         return new TreeNode(value);

//     TreeNode* curr = node;

//     if (value < curr->value)
//         curr->left = insert(curr->left, value);
//     else if (value > curr->value)
//         curr->right = insert(curr->right, value);
//     else
//         return curr;

//     curr->height = max(getHeight(curr->left), getHeight(curr->right)) + 1;

//     int balance = getBalance(curr);

//     if (balance > 1 && value < curr->left->value)
//         return rightRotate(curr);

//     if (balance < -1 && value > curr->right->value)
//         return leftRotate(curr);

//     if (balance > 1 && value > curr->left->value) {
//         curr->left = leftRotate(curr->left);
//         return rightRotate(curr);
//     }

//     if (balance < -1 && value < curr->right->value) {
//         curr->right = rightRotate(curr->right);
//         return leftRotate(curr);
//     }

//     return curr;
// }

// void inorder(TreeNode* node) {
//     if (node == nullptr)
//         return;

//     inorder(node->left);
//     cout << node->value << " ";
//     inorder(node->right);
// }

// int main() {
//     TreeNode* root = nullptr;

//     root = insert(root, 45);
//     root = insert(root, 20);
//     root = insert(root, 10);
//     root = insert(root, 30);
//     root = insert(root, 5);
//     root = insert(root, 15);
//     root = insert(root, 25);
//     root = insert(root, 35);
//     root = insert(root, 50);
//     root = insert(root, 58);
//     root = insert(root, 65);
//     root = insert(root, 80);

//     inorder(root);
//     cout << endl;

//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        2. TREE TRAVERSALS
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Tree Traversals",
//       href: "/algorithms/trees/traversals",
//       type: "Easy",

//       about: [
//         { tag: "h1", text: "Tree Traversals" },
//         { tag: "p", text: "A tree traversal visits every node in a tree exactly once, in a specific order. The three classic depth-first orderings — pre-order, in-order, and post-order — differ only in WHEN the current node is processed relative to its children, while breadth-first (level-order) traversal visits nodes layer by layer using a queue, exactly like graph BFS." },
//         { tag: "p", text: "The choice of traversal order isn't arbitrary — each one corresponds to a specific real-world need. In-order traversal of a Binary Search Tree visits nodes in sorted order (a uniquely useful property). Pre-order naturally serialises a tree in a way that can reconstruct its exact shape. Post-order is the only safe order for deleting a tree node-by-node, since it processes children before their parent." },
//         { tag: "h2", text: "The four traversal orders" },
//         { tag: "table",
//           headers: ["Traversal", "Order", "Key Use Case"],
//           rows: [
//             ["Pre-order", "Node → Left → Right", "Serialising a tree's structure for later reconstruction; copying a tree"],
//             ["In-order", "Left → Node → Right", "Retrieving BST elements in sorted order"],
//             ["Post-order", "Left → Right → Node", "Safely deleting a tree (children before parent); evaluating expression trees"],
//             ["Level-order (BFS)", "Layer by layer, left to right", "Finding shortest depth to a node; printing a tree level by level"]
//           ]
//         },
//         { tag: "note", variant: "tip", text: "In-order traversal of a BST always produces sorted output — this single fact underlies many BST algorithms, including validating whether a tree is a correct BST in the first place." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n)" },
//           { tag: "p", text: "Every traversal order must visit all n nodes to be complete — there is no early-exit shortcut for a full traversal, regardless of the tree's shape." },
//           { tag: "ul", items: [
//             "Each node is visited exactly once: O(n)",
//             "Each visit does O(1) work (process the node, recurse into children/enqueue them)",
//             "Total: O(n), even in the most favourably-shaped tree"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n)" },
//           { tag: "p", text: "Visiting every node exactly once with O(1) work per node is a structural property of the traversal, completely independent of the tree's shape or balance." },
//           { tag: "ul", items: [
//             "n node visits × O(1) work each = O(n)",
//             "Tree shape (balanced vs. skewed) affects auxiliary space, not the total time, since every node is still visited exactly once regardless"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n)" },
//           { tag: "p", text: "No tree shape increases the time complexity beyond visiting every node once — a maximally skewed tree (essentially a linked list) still only requires n visits, just with worse space behaviour (see below)." },
//           { tag: "ul", items: [
//             "Worst case matches best/average exactly: O(n)",
//             "This matches the trivial lower bound: a complete traversal must examine every node at least once"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(h)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(log n)" },
//           { tag: "p", text: "For a perfectly balanced tree, the recursion stack (for DFS-style traversals) only ever needs to hold one root-to-leaf path, which is O(log n) deep in a balanced tree." },
//           { tag: "ul", items: ["Recursion stack depth = tree height h = O(log n) for a balanced tree", "Level-order traversal's queue can hold up to O(n/2) nodes at the widest level, regardless of balance"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(h)" },
//           { tag: "p", text: "For DFS-style traversals, space is governed entirely by tree height h, not by the total node count n — this is the key distinction from BFS-style traversal." },
//           { tag: "ul", items: ["Pre/in/post-order recursion stack: O(h), where h depends on the tree's actual shape", "For a random/typical BST, h is usually O(log n) in practice"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "A maximally skewed tree (every node has only one child, forming a linked-list shape) has height h = n − 1, so the recursion stack for DFS traversals can grow to O(n)." },
//           { tag: "ul", items: [
//             "DFS recursion stack: O(h), which can be as bad as O(n) for a degenerate skewed tree",
//             "Level-order (BFS) traversal's queue: up to O(n) at the widest level of a wide/bushy tree, independent of height",
//             "This is why an iterative traversal with an explicit stack (rather than recursion) is preferred for very deep or unbalanced trees, to avoid native call-stack overflow"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function preOrder(node):
//     if node is null: return
//     process(node)
//     preOrder(node.left)
//     preOrder(node.right)

// function inOrder(node):
//     if node is null: return
//     inOrder(node.left)
//     process(node)
//     inOrder(node.right)

// function postOrder(node):
//     if node is null: return
//     postOrder(node.left)
//     postOrder(node.right)
//     process(node)

// function levelOrder(root):
//     if root is null: return
//     queue ← [root]
//     while queue is not empty:
//         node ← dequeue(queue)
//         process(node)
//         if node.left:  enqueue(queue, node.left)
//         if node.right: enqueue(queue, node.right)` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Pre-order: process the current node first, then recurse left, then recurse right — the node is always 'visited' before either of its subtrees.",
//           "In-order: recurse left first, then process the current node, then recurse right — for a BST this guarantees sorted output, since everything in the left subtree is smaller and everything in the right subtree is larger.",
//           "Post-order: recurse left, then recurse right, then process the current node last — both children are fully handled before the parent, which is why it's the safe order for deletion.",
//           "Level-order: use a queue instead of recursion. Start with the root in the queue; repeatedly dequeue a node, process it, then enqueue its children — this naturally produces a layer-by-layer visiting order, identical in mechanism to graph BFS."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "For the three DFS orders, correctness follows directly from the recursive definition: by induction on subtree size, each recursive call correctly traverses its entire subtree in the specified order (process/left/right in some sequence), and since the function is called on the left and right subtrees of every node, every node in the tree is eventually visited exactly once. For level-order, the queue's FIFO property guarantees that all nodes at depth d are dequeued (and their children enqueued) before any node at depth d+1 is dequeued, by the same inductive argument used to prove BFS correctness on graphs." }
//       ],
//       codes:{
//         "c++": `#include <iostream>
// using namespace std;

// struct TreeNode {
//     int id;
//     int value;
//     TreeNode* left;
//     TreeNode* right;

//     TreeNode(int id, int value) {
//         this->id = id;
//         this->value = value;
//         left = nullptr;
//         right = nullptr;
//     }
// };

// void inorder(TreeNode* node) {
//     if (node == nullptr)
//         return;

//     TreeNode* curr = node;

//     inorder(curr->left);

//     cout << curr->value << " ";

//     inorder(curr->right);
// }

// void preorder(TreeNode* node) {
//     if (node == nullptr)
//         return;

//     TreeNode* curr = node;

//     cout << curr->value << " ";

//     preorder(curr->left);
//     preorder(curr->right);
// }

// void postorder(TreeNode* node) {
//     if (node == nullptr)
//         return;

//     TreeNode* curr = node;

//     postorder(curr->left);
//     postorder(curr->right);

//     cout << curr->value << " ";
// }

// int main() {
//     TreeNode* root = new TreeNode(1, 10);

//     root->left = new TreeNode(2, 5);
//     root->right = new TreeNode(3, 20);

//     root->left->left = new TreeNode(4, 2);
//     root->left->right = new TreeNode(5, 8);

//     root->right->left = new TreeNode(6, 15);
//     root->right->right = new TreeNode(7, 30);

//     inorder(root);
//     cout << endl;

//     preorder(root);
//     cout << endl;

//     postorder(root);
//     cout << endl;

//     return 0;
// }`
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        3. BINARY SEARCH TREE
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Binary Search Tree",
//       href: "/algorithms/trees/bst",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Binary Search Tree (BST)" },
//         { tag: "p", text: "A Binary Search Tree maintains the invariant that for every node, all keys in its left subtree are smaller, and all keys in its right subtree are larger. This ordering property allows search, insertion, and deletion to eliminate half the remaining search space at each step — the same logarithmic principle as binary search on a sorted array, but adapted to a dynamic structure that supports efficient insertion and deletion." },
//         { tag: "p", text: "Unlike a sorted array, a BST doesn't guarantee O(log n) operations — its performance depends entirely on the tree's height, which depends entirely on insertion order. A BST built from already-sorted input degenerates into what is effectively a linked list, with O(n) operations. This exact weakness is what motivates self-balancing variants like AVL and Red-Black trees." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "You need an ordered dynamic collection supporting fast search, insert, delete, and in-order (sorted) iteration",
//           "Implementing a simple ordered map/set when insertion order is known to be sufficiently randomised (avoiding the degenerate worst case)",
//           "As the conceptual foundation before reaching for a self-balancing variant (AVL, Red-Black) in production code",
//           "Range queries: 'find all keys between X and Y' is naturally efficient via a BST traversal that prunes subtrees outside the range"
//         ]},
//         { tag: "note", variant: "warning", text: "A plain BST gives no balance guarantee — inserting already-sorted data produces a degenerate O(n)-height tree, silently turning every 'O(log n)' operation into O(n). Production code should use a self-balancing variant unless insertion order is provably randomised." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(log n) avg / O(n) worst",
//         best: [
//           { tag: "h2", text: "Best Case — O(1)" },
//           { tag: "p", text: "The best case for any single operation occurs when the target happens to be the root itself, requiring just one comparison — though this is a property of the specific query, not a structural guarantee of the algorithm." },
//           { tag: "ul", items: [
//             "Searching for the root: 1 comparison — O(1)",
//             "This best case applies per-operation and doesn't reflect the tree's overall behaviour across many operations"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(log n)" },
//           { tag: "p", text: "For a BST built from randomly-ordered insertions, the expected height is provably O(log n) — a well-known result from random BST analysis (the expected height of a randomly built BST on n keys is approximately 2 ln n ≈ 1.39 log₂ n)." },
//           { tag: "ul", items: [
//             "Search/insert/delete all follow a single root-to-leaf path, costing O(h) where h is the current height",
//             "For random insertion order, E[h] = O(log n), giving expected O(log n) per operation",
//             "This is a probabilistic guarantee, not a worst-case one — it depends on the assumption of randomised insertion order"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n)" },
//           { tag: "p", text: "If keys are inserted in already-sorted (or reverse-sorted) order, every new node becomes the rightmost (or leftmost) child of the previous one, producing a tree that is structurally identical to a linked list." },
//           { tag: "ul", items: [
//             "Sorted-order insertion produces a tree of height n − 1",
//             "Every search/insert/delete in this degenerate tree costs O(n), since the 'tree' is effectively a single chain",
//             "This is the fundamental motivation for self-balancing BST variants (AVL, Red-Black), which provably cap height at O(log n) regardless of insertion order"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n)" },
//           { tag: "p", text: "Storing n nodes requires O(n) space for the node data itself, regardless of the tree's shape — this is identical across all cases since it only depends on node count." },
//           { tag: "ul", items: ["n node objects, each with key + left/right pointers: O(n)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n)" },
//           { tag: "p", text: "Total node storage is fixed by n alone, while the recursion stack used during operations scales with the tree's height, which is O(log n) on average for randomly-built trees." },
//           { tag: "ul", items: ["O(n) node storage", "O(log n) expected recursion stack depth for random insertion order"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "In a degenerate (linked-list-shaped) tree, the recursion stack during search/insert/delete can grow to O(n), matching the tree's worst-case height." },
//           { tag: "ul", items: [
//             "O(n) node storage, identical to best/average case",
//             "O(n) recursion stack depth in a degenerate, maximally-skewed tree — this is the same root cause as the O(n) worst-case time complexity"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function search(node, key):
//     if node is null or node.key == key:
//         return node
//     if key < node.key:
//         return search(node.left, key)
//     else:
//         return search(node.right, key)

// function insert(node, key):
//     if node is null:
//         return new Node(key)
//     if key < node.key:
//         node.left ← insert(node.left, key)
//     else if key > node.key:
//         node.right ← insert(node.right, key)
//     // duplicate keys: no-op (or handle per requirements)
//     return node

// function delete(node, key):
//     if node is null:
//         return null
//     if key < node.key:
//         node.left ← delete(node.left, key)
//     else if key > node.key:
//         node.right ← delete(node.right, key)
//     else:
//         // Found the node to delete
//         if node.left is null:  return node.right
//         if node.right is null: return node.left
//         // Two children: replace with in-order successor
//         successor ← findMin(node.right)
//         node.key ← successor.key
//         node.right ← delete(node.right, successor.key)
//     return node` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Search: compare the target key against the current node; if smaller, recurse left; if larger, recurse right; if equal, found. Each comparison eliminates one entire subtree from consideration.",
//           "Insert: follow the same comparison path as search until reaching a null spot, then attach the new node there — this always preserves the BST ordering invariant.",
//           "Delete (leaf node): simply remove it — no children to reattach.",
//           "Delete (one child): replace the node with its single child, splicing it directly into the parent's link.",
//           "Delete (two children): find the in-order successor (the smallest key in the right subtree, found by following left-child pointers from node.right), copy its key into the node being deleted, then recursively delete the successor from the right subtree (which is now an easier 0-or-1-child deletion)."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Search correctness follows directly from the BST invariant: if key < node.key, every key in the right subtree is guaranteed larger than key (by the invariant), so it cannot contain the target — recursing left is safe and complete. Insertion correctness follows because the new node is always placed at a position consistent with the invariant (smaller keys to the left, larger to the right of every ancestor on its path). Deletion's two-child case is the subtle one: replacing the deleted key with its in-order successor (the smallest key greater than it) preserves the invariant, because the successor is guaranteed to be larger than everything in the original left subtree and smaller than everything remaining in the right subtree — exactly the ordering position the deleted node occupied." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// using namespace std;

// struct TreeNode {
//     int id;
//     int value;
//     TreeNode* left;
//     TreeNode* right;

//     TreeNode(int id, int value) {
//         this->id = id;
//         this->value = value;
//         left = nullptr;
//         right = nullptr;
//     }
// };

// TreeNode* insert(TreeNode* node, int id, int value) {
//     if (node == nullptr)
//         return new TreeNode(id, value);

//     TreeNode* curr = node;

//     if (value < curr->value)
//         curr->left = insert(curr->left, id, value);
//     else
//         curr->right = insert(curr->right, id, value);

//     return curr;
// }

// bool search(TreeNode* node, int target) {
//     TreeNode* curr = node;

//     while (curr != nullptr) {
//         if (curr->value == target)
//             return true;

//         if (target < curr->value)
//             curr = curr->left;
//         else
//             curr = curr->right;
//     }

//     return false;
// }

// TreeNode* findMin(TreeNode* node) {
//     TreeNode* curr = node;

//     while (curr->left != nullptr)
//         curr = curr->left;

//     return curr;
// }

// TreeNode* deleteNode(TreeNode* node, int target) {
//     if (node == nullptr)
//         return nullptr;

//     TreeNode* curr = node;

//     if (target < curr->value)
//         curr->left = deleteNode(curr->left, target);
//     else if (target > curr->value)
//         curr->right = deleteNode(curr->right, target);
//     else {
//         if (curr->left == nullptr) {
//             TreeNode* temp = curr->right;
//             delete curr;
//             return temp;
//         }

//         if (curr->right == nullptr) {
//             TreeNode* temp = curr->left;
//             delete curr;
//             return temp;
//         }

//         TreeNode* temp = findMin(curr->right);
//         curr->value = temp->value;
//         curr->id = temp->id;
//         curr->right = deleteNode(curr->right, temp->value);
//     }

//     return curr;
// }

// void inorder(TreeNode* node) {
//     if (node == nullptr)
//         return;

//     inorder(node->left);
//     cout << node->value << " ";
//     inorder(node->right);
// }

// int main() {
//     TreeNode* root = nullptr;

//     root = insert(root, 1, 10);
//     root = insert(root, 2, 5);
//     root = insert(root, 3, 15);
//     root = insert(root, 4, 3);
//     root = insert(root, 5, 8);
//     root = insert(root, 6, 12);
//     root = insert(root, 7, 20);

//     cout << "Inorder : ";
//     inorder(root);
//     cout << endl;

//     cout << "Search 8 : " << search(root, 8) << endl;
//     cout << "Search 25 : " << search(root, 25) << endl;

//     root = deleteNode(root, 5);

//     cout << "After deleting 5 : ";
//     inorder(root);
//     cout << endl;

//     root = deleteNode(root, 15);

//     cout << "After deleting 15 : ";
//     inorder(root);
//     cout << endl;

//     return 0;
// }
        
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        4. LOWEST COMMON ANCESTOR
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Lowest Common Ancestor",
//       href: "/algorithms/trees/lca",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Lowest Common Ancestor (LCA)" },
//         { tag: "p", text: "The Lowest Common Ancestor of two nodes u and v in a tree is the deepest node that has both u and v as descendants (a node is considered a descendant of itself for this definition). It's a fundamental query that comes up anywhere hierarchical relationships matter: finding the common ancestor of two commits in a version-control history graph, the common category of two items in a taxonomy, or the meeting point of two file paths." },
//         { tag: "p", text: "The right algorithm depends heavily on the tree type and query pattern. For a general binary tree with a single query, a recursive post-order approach works in O(n). For a Binary Search Tree specifically, the ordering property allows a much faster O(h) approach that doesn't need to explore both subtrees. For many repeated queries on a static tree, preprocessing techniques (binary lifting, Euler tour + sparse table) achieve O(log n) or even O(1) per query after O(n log n) preprocessing." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Finding the common ancestor of two nodes in any tree structure (file systems, org charts, phylogenetic trees)",
//           "Computing the distance between two nodes in a tree: distance(u, v) = depth(u) + depth(v) − 2 × depth(LCA(u, v))",
//           "Git's merge-base computation (finding the common ancestor commit of two branches) is conceptually an LCA query on the commit DAG",
//           "Range/path queries on trees, where many algorithms first reduce the problem to 'find the LCA, then process the path through it'"
//         ]},
//         { tag: "note", variant: "tip", text: "Don't use the general O(n) binary-tree algorithm on a BST — exploiting the BST ordering property gives O(h) instead, often a dramatic speedup, since you never need to explore the subtree that can't contain either target." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case — O(1)" },
//           { tag: "p", text: "If one of the two target nodes happens to be an ancestor of the other and is found immediately at the root, the search can terminate in constant time — though this depends on the specific tree and query, not a structural guarantee." },
//           { tag: "ul", items: [
//             "If root itself is one of the two targets, it's immediately known to be the LCA (since a node is its own potential ancestor): O(1)",
//             "This is a favourable-input case, not the typical algorithmic guarantee"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n)" },
//           { tag: "p", text: "The general binary-tree LCA algorithm must, in the average case, still explore a substantial fraction of the tree to confirm both targets are found and correctly determine their meeting point, since it doesn't exploit any ordering property." },
//           { tag: "ul", items: [
//             "Post-order recursive search: each node is visited once to check if it equals either target, or to combine results from its children",
//             "On average, a significant portion of the tree must be explored before both targets are located: O(n)",
//             "For a BST specifically, the average case improves to O(log n) by exploiting the ordering invariant, identical to BST search's average case"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n)" },
//           { tag: "p", text: "If the two target nodes are deep in different subtrees (or the entire tree must be searched to locate them), the general algorithm visits every node exactly once in the worst case." },
//           { tag: "ul", items: [
//             "Every node is visited exactly once in a post-order traversal: O(n)",
//             "For a BST, the worst case is O(h), which is O(n) for a degenerate unbalanced tree but O(log n) for a balanced one — same height dependency as plain BST operations",
//             "With O(n) preprocessing (binary lifting / Euler tour + sparse table), each individual query afterward drops to O(log n) or O(1), trading preprocessing cost for fast repeated queries"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(h)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(1)" },
//           { tag: "p", text: "If the LCA is found immediately at the root with no recursion needed, no additional stack space beyond the initial call is used." },
//           { tag: "ul", items: ["Single function call, no recursion: O(1)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(h)" },
//           { tag: "p", text: "The recursive post-order search uses a call stack bounded by the tree's height, since the recursion follows root-to-leaf paths." },
//           { tag: "ul", items: ["Recursion stack depth: O(h), where h is the tree's height — O(log n) for a balanced tree"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "For a degenerate, maximally-skewed tree, the recursion stack can grow to O(n), matching the tree's worst-case height." },
//           { tag: "ul", items: [
//             "Recursion stack: O(h), which is O(n) for a degenerate tree",
//             "Preprocessing-based approaches (binary lifting) trade this for O(n log n) upfront space in exchange for O(log n) query time regardless of tree shape"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "General binary tree LCA (works for any binary tree, not just a BST):" },
//         { tag: "code", language: "text", text:
// `function lowestCommonAncestor(root, p, q):
//     if root is null or root == p or root == q:
//         return root

//     left  ← lowestCommonAncestor(root.left, p, q)
//     right ← lowestCommonAncestor(root.right, p, q)

//     if left is not null and right is not null:
//         return root          // p and q found in different subtrees — root is the LCA
//     return left if left is not null else right` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Base case: if the current node is null, or matches either target node, return it immediately — this is the signal that propagates 'I found one of the targets here' up through the recursion.",
//           "Recurse into both the left and right subtrees, searching for either target in each.",
//           "If both the left and right recursive calls return a non-null result, that means p was found in one subtree and q in the other — the current node is exactly where their paths diverge, making it the LCA.",
//           "If only one side returned a non-null result, that side contains either one or both targets — propagate that result upward unchanged, since the true LCA must be at or above that point.",
//           "The call on the original root eventually returns the LCA once the recursion fully unwinds."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Correctness follows from a key invariant: a non-null return value from a subtree's recursive call means that subtree contains at least one of the two target nodes (possibly both, if it's already found their LCA internally). When a node receives non-null results from BOTH its left and right recursive calls, this proves the two targets are split across its two subtrees — meaning this node is precisely the deepest node with both as descendants, satisfying the definition of LCA. If a node already equals one of the targets, it's correctly returned immediately, since (by definition) any node is its own ancestor, covering the edge case where one target is an ancestor of the other." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// using namespace std;

// struct TreeNode {
//     int id;
//     int value;
//     TreeNode* left;
//     TreeNode* right;

//     TreeNode(int id, int value) {
//         this->id = id;
//         this->value = value;
//         left = nullptr;
//         right = nullptr;
//     }
// };

// TreeNode* lowestCommonAncestor(TreeNode* node, int p, int q) {
//     if (node == nullptr)
//         return nullptr;

//     TreeNode* curr = node;

//     if (curr->value == p || curr->value == q)
//         return curr;

//     TreeNode* left = lowestCommonAncestor(curr->left, p, q);
//     TreeNode* right = lowestCommonAncestor(curr->right, p, q);

//     if (left != nullptr && right != nullptr)
//         return curr;

//     if (left != nullptr)
//         return left;

//     return right;
// }

// int main() {
//     TreeNode* root = new TreeNode(1, 3);

//     root->left = new TreeNode(2, 5);
//     root->right = new TreeNode(3, 1);

//     root->left->left = new TreeNode(4, 6);
//     root->left->right = new TreeNode(5, 2);

//     root->right->left = new TreeNode(6, 0);
//     root->right->right = new TreeNode(7, 8);

//     root->left->right->left = new TreeNode(8, 7);
//     root->left->right->right = new TreeNode(9, 4);

//     TreeNode* ans = lowestCommonAncestor(root, 5, 1);

//     cout << ans->value << endl;

//     ans = lowestCommonAncestor(root, 5, 4);

//     cout << ans->value << endl;

//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        5. RED-BLACK TREES
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Red-Black Trees",
//       href: "/algorithms/trees/red-black",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Red-Black Trees" },
//         { tag: "p", text: "A Red-Black Tree is a self-balancing BST where every node is colored either red or black, and a set of coloring rules guarantees the tree's height never exceeds roughly 2 log₂(n+1) — looser than AVL's stricter balance, but cheaper to maintain. Invented by Rudolf Bayer in 1972 (originally as 'symmetric binary B-trees'), it's the most widely deployed self-balancing tree structure in real-world software." },
//         { tag: "p", text: "The five defining rules are: (1) every node is red or black, (2) the root is always black, (3) every leaf (null/nil) is considered black, (4) a red node never has a red child ('no two reds in a row'), and (5) every path from a given node to any of its descendant null leaves passes through the same number of black nodes ('black-height' is consistent). These rules together guarantee no root-to-leaf path is ever more than twice as long as any other, which is what bounds the height to O(log n)." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Write-heavy workloads — Red-Black trees require fewer rotations per insertion/deletion than AVL trees, making writes cheaper at a small cost to lookup speed",
//           "Implementing language standard library ordered containers — this is what backs C++'s std::map/std::set, Java's TreeMap/TreeSet, and the Linux kernel's completely fair scheduler (CFS)",
//           "Any general-purpose balanced BST need where you don't have a strong reason to prefer AVL's stricter balance",
//           "Interval trees (used for efficient overlap queries) are commonly built as an augmented Red-Black tree"
//         ]},
//         { tag: "table",
//           headers: ["Property", "AVL Tree", "Red-Black Tree"],
//           rows: [
//             ["Balance strictness", "Height difference ≤ 1 (strict)", "Height difference ≤ 2x (looser)"],
//             ["Lookup speed", "Slightly faster (more balanced)", "Slightly slower"],
//             ["Insert/delete speed", "Slower (more rotations)", "Faster (fewer rotations, O(1) amortised recoloring)"],
//             ["Typical use", "Read-heavy", "Write-heavy / general-purpose"]
//           ]
//         },
//         { tag: "note", variant: "info", text: "Red-Black trees are also the structural basis for 2-3-4 trees (a type of B-tree) — there's a direct, well-known correspondence between the two, which is part of why the coloring-based balance rules work at all." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(log n)",
//         best: [
//           { tag: "h2", text: "Best Case — O(log n)" },
//           { tag: "p", text: "Just like AVL trees, the height guarantee is structural and unconditional, so even the most favourable single query is still classified by the algorithm's guaranteed bound, not by luck." },
//           { tag: "ul", items: [
//             "The 5 Red-Black invariants guarantee height ≤ 2 log₂(n+1) at all times, for any insertion/deletion sequence",
//             "Search, insert, and delete all follow a root-to-leaf path bounded by this height: O(log n)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(log n)" },
//           { tag: "p", text: "Because the coloring invariants are actively maintained after every modification, there's no input sequence that produces a worse average shape than the guaranteed bound." },
//           { tag: "ul", items: [
//             "Search: O(h) = O(log n)",
//             "Insert: O(log n) to find the insertion point, plus O(1) amortised recoloring/rotation to restore the invariants (a key advantage over AVL, where rebalancing can require more frequent rotations)",
//             "Delete: O(log n) to find the node, plus a bounded number of rotations (at most 3) to restore the invariants"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(log n)" },
//           { tag: "p", text: "Like AVL trees, this is the entire purpose of the structure: no input sequence can ever produce a Red-Black tree taller than its proven bound." },
//           { tag: "ul", items: [
//             "Provable bound: a Red-Black tree with n internal nodes has height at most 2 log₂(n+1)",
//             "This follows from the black-height invariant: a subtree rooted at any node with black-height bh has at least 2^bh − 1 internal nodes, and the no-two-reds-in-a-row rule means the longest possible path is at most twice the shortest",
//             "No adversarial insertion/deletion sequence can break this bound — it's restored after every single operation"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n)" },
//           { tag: "p", text: "Storing n nodes requires O(n) space, plus a single extra bit per node to store its color — a much smaller per-node overhead than AVL's integer height/balance-factor field." },
//           { tag: "ul", items: ["n node objects, each with left/right/parent pointers + a 1-bit color field: O(n)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n)" },
//           { tag: "p", text: "Total stored data is fixed by n alone, since the guaranteed height bound doesn't change how many nodes need to be stored, only how they're arranged." },
//           { tag: "ul", items: ["O(n) for node storage", "O(log n) for the recursion/iteration depth during any single operation, due to the guaranteed logarithmic height"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "No insertion/deletion sequence increases storage beyond the fixed per-node overhead — exactly like AVL trees, space depends only on node count, not on tree shape." },
//           { tag: "ul", items: [
//             "O(n) total node storage",
//             "O(log n) recursion/iteration depth during any single operation — guaranteed by the height bound"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "High-level insertion logic (full rotation/recoloring case analysis is extensive; the core structure is shown here):" },
//         { tag: "code", language: "text", text:
// `function insert(tree, key):
//     newNode ← new Node(key, color = RED)
//     bstInsert(tree, newNode)              // standard BST insertion
//     fixInsertViolations(tree, newNode)

// function fixInsertViolations(tree, node):
//     while node.parent.color == RED:
//         if node.parent == node.grandparent.left:
//             uncle ← node.grandparent.right
//             if uncle.color == RED:
//                 // Case 1: uncle is red — recolor and move up
//                 node.parent.color ← BLACK
//                 uncle.color ← BLACK
//                 node.grandparent.color ← RED
//                 node ← node.grandparent
//             else:
//                 if node == node.parent.right:
//                     // Case 2: triangle shape — rotate to make it a line
//                     node ← node.parent
//                     rotateLeft(tree, node)
//                 // Case 3: line shape — rotate and recolor
//                 node.parent.color ← BLACK
//                 node.grandparent.color ← RED
//                 rotateRight(tree, node.grandparent)
//         else:
//             // mirror image of the above, swapping left/right
//             ...

//     tree.root.color ← BLACK                // rule: root is always black` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Insert the new node exactly like a standard BST insertion, but always color it red initially — this never violates the black-height rule (rule 5), since a new red leaf doesn't add to any path's black-node count.",
//           "Coloring the new node red CAN violate rule 4 (no two reds in a row) if its parent is also red — this is the only possible violation after a plain BST insertion, and it's fixed by examining the new node's 'uncle' (its grandparent's other child).",
//           "If the uncle is red: recolor the parent and uncle to black and the grandparent to red, then continue the fix-up process treating the grandparent as the new 'node' — this can propagate the red-red violation further up the tree.",
//           "If the uncle is black (or absent): rotations are needed. A 'triangle' shape (node is on the opposite side of its parent than the parent is of the grandparent) is first rotated into a 'line' shape, then a single rotation plus a recolor of the parent/grandparent resolves the violation completely without needing to propagate further up.",
//           "Finally, the root is always recolored black, satisfying rule 2 unconditionally — this can never violate the black-height rule, since lowering one red root to black only ever increases (or leaves unchanged) the black count of paths through it, uniformly across the whole tree."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "The five Red-Black invariants together force a provable height bound: rule 4 (no two consecutive reds) means that on any root-to-leaf path, red nodes can never make up more than half the path, so the longest path is at most twice the length of the shortest. Rule 5 (equal black-height on every path) is what makes 'shortest path' a well-defined, consistent quantity. The fix-up procedure is correct because each of its three cases either resolves the violation completely (cases 2 and 3, via rotation) or provably preserves all other invariants while pushing the violation strictly higher up the tree (case 1, recoloring) — and since the tree has finite height, this propagation must terminate, either by reaching a black parent (no violation) or by reaching the root (which is then simply recolored black, always a safe final fix)." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// using namespace std;

// struct TreeNode {
//     int value;
//     bool red;
//     TreeNode* left;
//     TreeNode* right;
//     TreeNode* parent;

//     TreeNode(int value) {
//         this->value = value;
//         red = true;
//         left = nullptr;
//         right = nullptr;
//         parent = nullptr;
//     }
// };

// TreeNode* leftRotate(TreeNode* root, TreeNode* node) {
//     TreeNode* right = node->right;

//     node->right = right->left;

//     if (right->left != nullptr)
//         right->left->parent = node;

//     right->parent = node->parent;

//     if (node->parent == nullptr)
//         root = right;
//     else if (node == node->parent->left)
//         node->parent->left = right;
//     else
//         node->parent->right = right;

//     right->left = node;
//     node->parent = right;

//     return root;
// }

// TreeNode* rightRotate(TreeNode* root, TreeNode* node) {
//     TreeNode* left = node->left;

//     node->left = left->right;

//     if (left->right != nullptr)
//         left->right->parent = node;

//     left->parent = node->parent;

//     if (node->parent == nullptr)
//         root = left;
//     else if (node == node->parent->left)
//         node->parent->left = left;
//     else
//         node->parent->right = left;

//     left->right = node;
//     node->parent = left;

//     return root;
// }

// void flipColors(TreeNode* node) {
//     node->red = !node->red;

//     if (node->left != nullptr)
//         node->left->red = !node->left->red;

//     if (node->right != nullptr)
//         node->right->red = !node->right->red;
// }

// void inorder(TreeNode* node) {
//     if (node == nullptr)
//         return;

//     inorder(node->left);

//     cout << node->value;

//     if (node->red)
//         cout << "(R) ";
//     else
//         cout << "(B) ";

//     inorder(node->right);
// }

// int main() {
//     TreeNode* root = new TreeNode(20);
//     root->red = false;

//     root->left = new TreeNode(10);
//     root->left->parent = root;

//     root->right = new TreeNode(30);
//     root->right->parent = root;

//     root->right->right = new TreeNode(40);
//     root->right->right->parent = root->right;

//     cout << "Before Rotation:" << endl;
//     inorder(root);
//     cout << endl;

//     root = leftRotate(root, root);

//     cout << "After Left Rotation:" << endl;
//     inorder(root);
//     cout << endl;

//     flipColors(root);

//     cout << "After Color Flip:" << endl;
//     inorder(root);
//     cout << endl;

//     return 0;
// }
// `
//       }
//     }

//   ],
//   desc: "BST, AVL, segment tree, traversals",
//   complexity: "O(log n)",
//   featured: false,
// };

export default TREES_SECTION;