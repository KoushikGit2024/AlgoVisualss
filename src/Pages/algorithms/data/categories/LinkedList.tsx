const LINKED_LISTS_SECTION = {
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

  about: [
    { tag: "h1", text: "Linked Lists" },
    { tag: "p", text: "A linked list stores elements as separate nodes scattered anywhere in memory, each holding a value plus a pointer to the next node (and, for doubly linked lists, a pointer to the previous node too). This is the structural opposite of an array: no contiguous block of memory, no O(1) random access by index — but O(1) insertion and deletion at a known position, since nothing needs to shift." },
    { tag: "p", text: "Almost every linked-list algorithm is really a pointer-manipulation exercise: the challenge is rewiring next (and prev) pointers correctly, in the right order, without ever losing a reference to a node you still need — lose track of 'the rest of the list' before you've saved a pointer to it, and that entire remaining chain becomes unreachable garbage." },
    { tag: "h2", text: "Singly vs. doubly linked" },
    { tag: "table",
      headers: ["Property", "Singly Linked", "Doubly Linked"],
      rows: [
        ["Pointers per node", "1 (next)", "2 (next, prev)"],
        ["Traverse backward?", "No — requires re-traversal from head", "Yes — O(1) per step via prev"],
        ["Delete a given node (with reference, no head search)", "O(n) — need the previous node", "O(1) — prev is already known"],
        ["Memory overhead per node", "Lower", "Higher (extra pointer)"]
      ]
    },
    { tag: "h2", text: "The recurring trick: dummy/sentinel nodes" },
    { tag: "p", text: "A huge fraction of linked-list bugs come from special-casing 'what if the head itself needs to change' (empty list, deleting the head, building a new list from scratch). The standard fix is a dummy/sentinel node placed before the real head — every real node, including what becomes the new head, is then 'the node after some node', eliminating the special case entirely. You'll see this pattern in Merge Sorted Lists and LRU Cache Design below." },
    { tag: "note", variant: "tip", text: "Before writing any linked-list code, always ask: 'will I still have a reference to the rest of the list after this pointer reassignment?' — saving next before overwriting it is the single most common fix for linked-list bugs." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. LRU CACHE DESIGN
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "LRU Cache Design",
      href: "/algorithms/linked_lists/lru-cache",
      type: "Hard",

      about: [
        { tag: "h1", text: "LRU Cache Design" },
        { tag: "p", text: "A Least Recently Used (LRU) Cache is a fixed-capacity key-value store that, when full, evicts the entry that hasn't been accessed for the longest time to make room for a new one. It's one of the most common 'design a data structure' interview questions precisely because the obvious approaches (a plain array, a plain linked list, a plain hash map) each fail to deliver O(1) on both get and put — the elegant solution requires COMBINING two structures." },
        { tag: "p", text: "The combination is a hash map (for O(1) key lookup) plus a doubly linked list (for O(1) reordering and eviction). The hash map stores key → node pointer, letting you jump directly to any node without traversal. The doubly linked list maintains usage-recency order, with the most-recently-used node kept at one end and the least-recently-used at the other, ready for instant eviction." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Designing a bounded in-memory cache with a real eviction policy (database query caches, web browser caches, CDN edge caches)",
          "Any 'design a data structure supporting O(1) X, O(1) Y' interview question — the hash-map-plus-linked-list combination is the canonical template for many such problems (LFU cache uses a similar idea with an extra frequency dimension)",
          "Operating system page-replacement algorithms historically use LRU-style eviction (or approximations of it) to decide which memory page to swap out",
          "Any scenario needing both fast lookup AND fast reordering/recency tracking — neither a hash map nor a linked list alone provides both"
        ]},
        { tag: "note", variant: "tip", text: "Why not just a hash map plus a plain array sorted by recency? Because reordering an array on every access requires shifting elements — O(n). The doubly linked list is what makes moving a node to the front (or back) genuinely O(1), with no shifting required." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Both get and put always perform a fixed, small number of pointer operations and a single hash map lookup, regardless of cache contents — there's no notion of a 'luckier' input producing faster results, since the operations are structurally constant-time." },
          { tag: "ul", items: [
            "get: one hash map lookup (O(1) average) + unlink and re-insert the node at the front of the list (O(1) pointer rewiring)",
            "put: one hash map lookup/insert + possibly evict the tail node + insert new node at the front — all O(1) pointer operations"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Both operations rely on hash map average-case O(1) lookup (assuming a reasonable hash function and load factor) combined with strictly O(1) doubly-linked-list pointer rewiring — there's no scenario where the cache's current size or access pattern changes this." },
          { tag: "ul", items: [
            "Hash map get/insert/delete: O(1) average",
            "Doubly linked list unlink + re-link at front/back: O(1), since both operations are local to a node and its immediate neighbors, given a direct node reference from the hash map"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "The only way this degrades is via hash map collisions — a pathologically bad hash function or adversarial key set could push hash map operations to O(n) in the absolute worst case, though this is not characteristic of normal use with a well-implemented hash function." },
          { tag: "ul", items: [
            "Hash map worst case (excessive collisions): O(n) per operation",
            "Doubly linked list portion remains strictly O(1) regardless of input, since pointer rewiring never depends on list length",
            "In practice, with a good hash function, O(1) is the expected and reliably observed behaviour — this worst case is a pathological edge case, not typical behaviour"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The cache stores at most 'capacity' entries by design, requiring space proportional to the cache's configured capacity for both the hash map entries and the linked list nodes." },
          { tag: "ul", items: ["Hash map: up to capacity key → node-pointer entries — O(n)", "Doubly linked list: up to capacity nodes — O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is bounded by the fixed cache capacity, which is a configuration parameter, not something that grows unpredictably with access patterns." },
          { tag: "ul", items: ["Both structures stay capped at O(n), where n is the configured capacity, regardless of how many get/put operations are performed over the cache's lifetime"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No access pattern increases space beyond the fixed capacity — eviction guarantees the cache never grows past its configured size limit, even under continuous insertion of new keys." },
          { tag: "ul", items: [
            "Hash map + doubly linked list: O(n) combined, where n is the capacity (a hard upper bound enforced by the eviction policy)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Using a doubly linked list with dummy head/tail sentinels, keeping most-recently-used near the head:" },
        { tag: "code", language: "text", text:
`class LRUCache:
    capacity ← given
    map ← empty hash map (key → node)
    head ← new dummy Node()          // sentinel: most-recent side
    tail ← new dummy Node()          // sentinel: least-recent side
    head.next ← tail
    tail.prev ← head

    function get(key):
        if key not in map: return −1
        node ← map[key]
        remove(node)
        insertAtFront(node)          // mark as just-used
        return node.value

    function put(key, value):
        if key in map:
            node ← map[key]
            node.value ← value
            remove(node)
            insertAtFront(node)
        else:
            if size(map) == capacity:
                lru ← tail.prev
                remove(lru)
                delete map[lru.key]
            newNode ← new Node(key, value)
            map[key] ← newNode
            insertAtFront(newNode)

    function remove(node):
        node.prev.next ← node.next
        node.next.prev ← node.prev

    function insertAtFront(node):
        node.next ← head.next
        node.prev ← head
        head.next.prev ← node
        head.next ← node` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a doubly linked list with two dummy sentinel nodes (head and tail) so every real node always has both a real prev and next neighbor — eliminating null-checks for the 'first' or 'last' real node.",
          "On get(key): look up the node via the hash map in O(1). If found, unlink it from its current position and re-insert it right after the head sentinel (marking it as most-recently-used), then return its value.",
          "On put(key, value): if the key already exists, update its value and move it to the front (same recency-marking logic as get).",
          "If the key is new and the cache is at capacity, evict the node just before the tail sentinel (the actual least-recently-used real node) — remove it from both the linked list and the hash map.",
          "Insert the new node at the front of the list and record it in the hash map."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: the doubly linked list is always ordered from most-recently-used (right after head) to least-recently-used (right before tail). Every get or put that touches an existing key unlinks and re-inserts it at the front, correctly re-establishing it as most-recently-used — and since unlink/re-link only touches the node's immediate neighbors (O(1) pointer rewiring, made possible because the hash map gives a direct node reference, avoiding any traversal), the recency ordering invariant is preserved on every operation. When eviction is needed, the node just before tail is, by the maintained invariant, guaranteed to be the genuinely least-recently-used entry in the entire cache." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <unordered_map>
using namespace std;

struct Node {
    int key;
    int value;
    Node* prev;
    Node* next;

    Node(int k, int v) {
        key = k;
        value = v;
        prev = nullptr;
        next = nullptr;
    }
};

Node* head;
Node* tail;

unordered_map<int, Node*> cache_map;

int capacity = 3;
int count = 0;

// Remove a node from the list
void removeNode(Node* curr) {

    curr->prev->next = curr->next;
    curr->next->prev = curr->prev;
}

// Insert node right after head
void insertFront(Node* curr) {

    curr->next = head->next;
    curr->prev = head;

    head->next->prev = curr;
    head->next = curr;
}

// Get value
int get(int key) {

    if (cache_map.find(key) == cache_map.end())
        return -1;

    Node* curr = cache_map[key];

    removeNode(curr);
    insertFront(curr);

    return curr->value;
}

// Put key-value pair
void put(int key, int value) {

    // Key already exists
    if (cache_map.find(key) != cache_map.end()) {

        Node* curr = cache_map[key];

        curr->value = value;

        removeNode(curr);
        insertFront(curr);

        return;
    }

    // Cache full
    if (count == capacity) {

        Node* curr = tail->prev;

        removeNode(curr);

        cache_map.erase(curr->key);

        delete curr;

        count--;
    }

    // Insert new node
    Node* curr = new Node(key, value);

    insertFront(curr);

    cache_map[key] = curr;

    count++;
}

// Print cache
void printCache() {

    Node* curr = head->next;

    cout << "Cache: ";

    while (curr != tail) {

        cout << "(" << curr->key << "," << curr->value << ")";

        if (curr->next != tail)
            cout << " <-> ";

        curr = curr->next;
    }

    cout << endl;
}

int main() {

    head = new Node(-1, -1);
    tail = new Node(-1, -1);

    head->next = tail;
    tail->prev = head;

    put(1, 10);
    put(2, 20);
    put(3, 30);

    printCache();

    cout << "get(2) = " << get(2) << endl;

    printCache();

    put(4, 40);

    printCache();

    cout << "get(1) = " << get(1) << endl;

    printCache();

    return 0;
}`,
        "python": `class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None


class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.count = 0
        self.cache_map = {}
        # Sentinels: head (most-recent side) and tail (least-recent side)
        self.head = Node(-1, -1)
        self.tail = Node(-1, -1)
        self.head.next = self.tail
        self.tail.prev = self.head

    def _remove_node(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _insert_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        if key not in self.cache_map:
            return -1
        node = self.cache_map[key]
        self._remove_node(node)
        self._insert_front(node)
        return node.value

    def put(self, key, value):
        if key in self.cache_map:
            node = self.cache_map[key]
            node.value = value
            self._remove_node(node)
            self._insert_front(node)
            return

        if self.count == self.capacity:
            lru = self.tail.prev
            self._remove_node(lru)
            del self.cache_map[lru.key]
            self.count -= 1

        node = Node(key, value)
        self._insert_front(node)
        self.cache_map[key] = node
        self.count += 1

    def print_cache(self):
        curr = self.head.next
        parts = []
        while curr is not self.tail:
            parts.append(f"({curr.key},{curr.value})")
            curr = curr.next
        print("Cache:", " <-> ".join(parts))


if __name__ == "__main__":
    cache = LRUCache(3)

    cache.put(1, 10)
    cache.put(2, 20)
    cache.put(3, 30)
    cache.print_cache()

    print(f"get(2) = {cache.get(2)}")
    cache.print_cache()

    cache.put(4, 40)
    cache.print_cache()

    print(f"get(1) = {cache.get(1)}")
    cache.print_cache()`,
        "java": `import java.util.HashMap;
import java.util.Map;

public class Main {
    static class Node {
        int key, value;
        Node prev, next;
        Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    static Node head, tail;
    static Map<Integer, Node> cacheMap = new HashMap<>();
    static int capacity = 3;
    static int count = 0;

    static void removeNode(Node curr) {
        curr.prev.next = curr.next;
        curr.next.prev = curr.prev;
    }

    static void insertFront(Node curr) {
        curr.next = head.next;
        curr.prev = head;
        head.next.prev = curr;
        head.next = curr;
    }

    static int get(int key) {
        if (!cacheMap.containsKey(key)) return -1;
        Node curr = cacheMap.get(key);
        removeNode(curr);
        insertFront(curr);
        return curr.value;
    }

    static void put(int key, int value) {
        if (cacheMap.containsKey(key)) {
            Node curr = cacheMap.get(key);
            curr.value = value;
            removeNode(curr);
            insertFront(curr);
            return;
        }

        if (count == capacity) {
            Node curr = tail.prev;
            removeNode(curr);
            cacheMap.remove(curr.key);
            count--;
        }

        Node curr = new Node(key, value);
        insertFront(curr);
        cacheMap.put(key, curr);
        count++;
    }

    static void printCache() {
        Node curr = head.next;
        StringBuilder sb = new StringBuilder("Cache: ");
        while (curr != tail) {
            sb.append("(").append(curr.key).append(",").append(curr.value).append(")");
            if (curr.next != tail) sb.append(" <-> ");
            curr = curr.next;
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        head = new Node(-1, -1);
        tail = new Node(-1, -1);
        head.next = tail;
        tail.prev = head;

        put(1, 10);
        put(2, 20);
        put(3, 30);
        printCache();

        System.out.println("get(2) = " + get(2));
        printCache();

        put(4, 40);
        printCache();

        System.out.println("get(1) = " + get(1));
        printCache();
    }
}`,
        "js": `class Node {
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

class LRUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.count = 0;
        this.cacheMap = new Map();
        this.head = new Node(-1, -1);
        this.tail = new Node(-1, -1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
    }

    removeNode(curr) {
        curr.prev.next = curr.next;
        curr.next.prev = curr.prev;
    }

    insertFront(curr) {
        curr.next = this.head.next;
        curr.prev = this.head;
        this.head.next.prev = curr;
        this.head.next = curr;
    }

    get(key) {
        if (!this.cacheMap.has(key)) return -1;
        const curr = this.cacheMap.get(key);
        this.removeNode(curr);
        this.insertFront(curr);
        return curr.value;
    }

    put(key, value) {
        if (this.cacheMap.has(key)) {
            const curr = this.cacheMap.get(key);
            curr.value = value;
            this.removeNode(curr);
            this.insertFront(curr);
            return;
        }

        if (this.count === this.capacity) {
            const curr = this.tail.prev;
            this.removeNode(curr);
            this.cacheMap.delete(curr.key);
            this.count--;
        }

        const curr = new Node(key, value);
        this.insertFront(curr);
        this.cacheMap.set(key, curr);
        this.count++;
    }

    printCache() {
        let curr = this.head.next;
        const parts = [];
        while (curr !== this.tail) {
            parts.push(\`(\${curr.key},\${curr.value})\`);
            curr = curr.next;
        }
        console.log("Cache:", parts.join(" <-> "));
    }
}

const cache = new LRUCache(3);

cache.put(1, 10);
cache.put(2, 20);
cache.put(3, 30);
cache.printCache();

console.log("get(2) =", cache.get(2));
cache.printCache();

cache.put(4, 40);
cache.printCache();

console.log("get(1) =", cache.get(1));
cache.printCache();`,
        "c": `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int key;
    int value;
    struct Node* prev;
    struct Node* next;
} Node;

Node* head;
Node* tail;

#define CAPACITY 3
Node* cacheMap[1000]; // simple direct-mapped table keyed by small int keys
int count = 0;

Node* newNode(int key, int value) {
    Node* n = (Node*)malloc(sizeof(Node));
    n->key = key;
    n->value = value;
    n->prev = NULL;
    n->next = NULL;
    return n;
}

void removeNode(Node* curr) {
    curr->prev->next = curr->next;
    curr->next->prev = curr->prev;
}

void insertFront(Node* curr) {
    curr->next = head->next;
    curr->prev = head;
    head->next->prev = curr;
    head->next = curr;
}

int get(int key) {
    Node* curr = cacheMap[key];
    if (curr == NULL) return -1;
    removeNode(curr);
    insertFront(curr);
    return curr->value;
}

void put(int key, int value) {
    Node* existing = cacheMap[key];
    if (existing != NULL) {
        existing->value = value;
        removeNode(existing);
        insertFront(existing);
        return;
    }

    if (count == CAPACITY) {
        Node* lru = tail->prev;
        removeNode(lru);
        cacheMap[lru->key] = NULL;
        free(lru);
        count--;
    }

    Node* curr = newNode(key, value);
    insertFront(curr);
    cacheMap[key] = curr;
    count++;
}

void printCache() {
    Node* curr = head->next;
    printf("Cache: ");
    while (curr != tail) {
        printf("(%d,%d)", curr->key, curr->value);
        if (curr->next != tail) printf(" <-> ");
        curr = curr->next;
    }
    printf("\\n");
}

int main() {
    for (int i = 0; i < 1000; i++) cacheMap[i] = NULL;

    head = newNode(-1, -1);
    tail = newNode(-1, -1);
    head->next = tail;
    tail->prev = head;

    put(1, 10);
    put(2, 20);
    put(3, 30);
    printCache();

    printf("get(2) = %d\\n", get(2));
    printCache();

    put(4, 40);
    printCache();

    printf("get(1) = %d\\n", get(1));
    printCache();

    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Node {
    public int Key, Value;
    public Node Prev, Next;
    public Node(int key, int value) {
        Key = key;
        Value = value;
    }
}

class LRUCache {
    private readonly int capacity;
    private int count;
    private readonly Dictionary<int, Node> cacheMap = new Dictionary<int, Node>();
    private readonly Node head = new Node(-1, -1);
    private readonly Node tail = new Node(-1, -1);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.Next = tail;
        tail.Prev = head;
    }

    private void RemoveNode(Node curr) {
        curr.Prev.Next = curr.Next;
        curr.Next.Prev = curr.Prev;
    }

    private void InsertFront(Node curr) {
        curr.Next = head.Next;
        curr.Prev = head;
        head.Next.Prev = curr;
        head.Next = curr;
    }

    public int Get(int key) {
        if (!cacheMap.ContainsKey(key)) return -1;
        Node curr = cacheMap[key];
        RemoveNode(curr);
        InsertFront(curr);
        return curr.Value;
    }

    public void Put(int key, int value) {
        if (cacheMap.ContainsKey(key)) {
            Node curr = cacheMap[key];
            curr.Value = value;
            RemoveNode(curr);
            InsertFront(curr);
            return;
        }

        if (count == capacity) {
            Node lru = tail.Prev;
            RemoveNode(lru);
            cacheMap.Remove(lru.Key);
            count--;
        }

        Node node = new Node(key, value);
        InsertFront(node);
        cacheMap[key] = node;
        count++;
    }

    public void PrintCache() {
        Node curr = head.Next;
        var parts = new List<string>();
        while (curr != tail) {
            parts.Add($"({curr.Key},{curr.Value})");
            curr = curr.Next;
        }
        Console.WriteLine("Cache: " + string.Join(" <-> ", parts));
    }
}

class Program {
    static void Main() {
        var cache = new LRUCache(3);

        cache.Put(1, 10);
        cache.Put(2, 20);
        cache.Put(3, 30);
        cache.PrintCache();

        Console.WriteLine($"get(2) = {cache.Get(2)}");
        cache.PrintCache();

        cache.Put(4, 40);
        cache.PrintCache();

        Console.WriteLine($"get(1) = {cache.Get(1)}");
        cache.PrintCache();
    }
}`,
        "swift": `class Node {
    var key: Int
    var value: Int
    var prev: Node?
    var next: Node?
    init(_ key: Int, _ value: Int) {
        self.key = key
        self.value = value
    }
}

class LRUCache {
    private let capacity: Int
    private var count = 0
    private var cacheMap: [Int: Node] = [:]
    private let head = Node(-1, -1)
    private let tail = Node(-1, -1)

    init(_ capacity: Int) {
        self.capacity = capacity
        head.next = tail
        tail.prev = head
    }

    private func removeNode(_ curr: Node) {
        curr.prev?.next = curr.next
        curr.next?.prev = curr.prev
    }

    private func insertFront(_ curr: Node) {
        curr.next = head.next
        curr.prev = head
        head.next?.prev = curr
        head.next = curr
    }

    func get(_ key: Int) -> Int {
        guard let curr = cacheMap[key] else { return -1 }
        removeNode(curr)
        insertFront(curr)
        return curr.value
    }

    func put(_ key: Int, _ value: Int) {
        if let curr = cacheMap[key] {
            curr.value = value
            removeNode(curr)
            insertFront(curr)
            return
        }

        if count == capacity {
            if let lru = tail.prev {
                removeNode(lru)
                cacheMap.removeValue(forKey: lru.key)
                count -= 1
            }
        }

        let node = Node(key, value)
        insertFront(node)
        cacheMap[key] = node
        count += 1
    }

    func printCache() {
        var curr = head.next
        var parts: [String] = []
        while let node = curr, node !== tail {
            parts.append("(\\(node.key),\\(node.value))")
            curr = node.next
        }
        print("Cache: " + parts.joined(separator: " <-> "))
    }
}

let cache = LRUCache(3)

cache.put(1, 10)
cache.put(2, 20)
cache.put(3, 30)
cache.printCache()

print("get(2) = \\(cache.get(2))")
cache.printCache()

cache.put(4, 40)
cache.printCache()

print("get(1) = \\(cache.get(1))")
cache.printCache()`,
        "kotlin": `class Node(val key: Int, var value: Int) {
    var prev: Node? = null
    var next: Node? = null
}

class LRUCache(private val capacity: Int) {
    private var count = 0
    private val cacheMap = HashMap<Int, Node>()
    private val head = Node(-1, -1)
    private val tail = Node(-1, -1)

    init {
        head.next = tail
        tail.prev = head
    }

    private fun removeNode(curr: Node) {
        curr.prev?.next = curr.next
        curr.next?.prev = curr.prev
    }

    private fun insertFront(curr: Node) {
        curr.next = head.next
        curr.prev = head
        head.next?.prev = curr
        head.next = curr
    }

    fun get(key: Int): Int {
        val curr = cacheMap[key] ?: return -1
        removeNode(curr)
        insertFront(curr)
        return curr.value
    }

    fun put(key: Int, value: Int) {
        cacheMap[key]?.let { curr ->
            curr.value = value
            removeNode(curr)
            insertFront(curr)
            return
        }

        if (count == capacity) {
            val lru = tail.prev!!
            removeNode(lru)
            cacheMap.remove(lru.key)
            count--
        }

        val node = Node(key, value)
        insertFront(node)
        cacheMap[key] = node
        count++
    }

    fun printCache() {
        var curr = head.next
        val parts = mutableListOf<String>()
        while (curr != null && curr !== tail) {
            parts.add("(\${curr.key},\${curr.value})")
            curr = curr.next
        }
        println("Cache: " + parts.joinToString(" <-> "))
    }
}

fun main() {
    val cache = LRUCache(3)

    cache.put(1, 10)
    cache.put(2, 20)
    cache.put(3, 30)
    cache.printCache()

    println("get(2) = \${cache.get(2)}")
    cache.printCache()

    cache.put(4, 40)
    cache.printCache()

    println("get(1) = \${cache.get(1)}")
    cache.printCache()
}`,
        "scala": `import scala.collection.mutable

class Node(val key: Int, var value: Int) {
  var prev: Node = _
  var next: Node = _
}

class LRUCache(capacity: Int) {
  private var count = 0
  private val cacheMap = mutable.HashMap[Int, Node]()
  private val head = new Node(-1, -1)
  private val tail = new Node(-1, -1)
  head.next = tail
  tail.prev = head

  private def removeNode(curr: Node): Unit = {
    curr.prev.next = curr.next
    curr.next.prev = curr.prev
  }

  private def insertFront(curr: Node): Unit = {
    curr.next = head.next
    curr.prev = head
    head.next.prev = curr
    head.next = curr
  }

  def get(key: Int): Int = {
    cacheMap.get(key) match {
      case None => -1
      case Some(curr) =>
        removeNode(curr)
        insertFront(curr)
        curr.value
    }
  }

  def put(key: Int, value: Int): Unit = {
    cacheMap.get(key) match {
      case Some(curr) =>
        curr.value = value
        removeNode(curr)
        insertFront(curr)
      case None =>
        if (count == capacity) {
          val lru = tail.prev
          removeNode(lru)
          cacheMap.remove(lru.key)
          count -= 1
        }
        val node = new Node(key, value)
        insertFront(node)
        cacheMap(key) = node
        count += 1
    }
  }

  def printCache(): Unit = {
    var curr = head.next
    val parts = mutable.ListBuffer[String]()
    while (curr != tail) {
      parts += s"(\${curr.key},\${curr.value})"
      curr = curr.next
    }
    println("Cache: " + parts.mkString(" <-> "))
  }
}

object Main extends App {
  val cache = new LRUCache(3)

  cache.put(1, 10)
  cache.put(2, 20)
  cache.put(3, 30)
  cache.printCache()

  println(s"get(2) = \${cache.get(2)}")
  cache.printCache()

  cache.put(4, 40)
  cache.printCache()

  println(s"get(1) = \${cache.get(1)}")
  cache.printCache()
}`,
        "go": `package main

import "fmt"

type Node struct {
	key, value int
	prev, next *Node
}

type LRUCache struct {
	capacity int
	count    int
	cacheMap map[int]*Node
	head     *Node
	tail     *Node
}

func NewLRUCache(capacity int) *LRUCache {
	head := &Node{key: -1, value: -1}
	tail := &Node{key: -1, value: -1}
	head.next = tail
	tail.prev = head
	return &LRUCache{
		capacity: capacity,
		cacheMap: make(map[int]*Node),
		head:     head,
		tail:     tail,
	}
}

func (c *LRUCache) removeNode(curr *Node) {
	curr.prev.next = curr.next
	curr.next.prev = curr.prev
}

func (c *LRUCache) insertFront(curr *Node) {
	curr.next = c.head.next
	curr.prev = c.head
	c.head.next.prev = curr
	c.head.next = curr
}

func (c *LRUCache) Get(key int) int {
	curr, ok := c.cacheMap[key]
	if !ok {
		return -1
	}
	c.removeNode(curr)
	c.insertFront(curr)
	return curr.value
}

func (c *LRUCache) Put(key, value int) {
	if curr, ok := c.cacheMap[key]; ok {
		curr.value = value
		c.removeNode(curr)
		c.insertFront(curr)
		return
	}

	if c.count == c.capacity {
		lru := c.tail.prev
		c.removeNode(lru)
		delete(c.cacheMap, lru.key)
		c.count--
	}

	node := &Node{key: key, value: value}
	c.insertFront(node)
	c.cacheMap[key] = node
	c.count++
}

func (c *LRUCache) PrintCache() {
	curr := c.head.next
	fmt.Print("Cache: ")
	for curr != c.tail {
		fmt.Printf("(%d,%d)", curr.key, curr.value)
		if curr.next != c.tail {
			fmt.Print(" <-> ")
		}
		curr = curr.next
	}
	fmt.Println()
}

func main() {
	cache := NewLRUCache(3)

	cache.Put(1, 10)
	cache.Put(2, 20)
	cache.Put(3, 30)
	cache.PrintCache()

	fmt.Println("get(2) =", cache.Get(2))
	cache.PrintCache()

	cache.Put(4, 40)
	cache.PrintCache()

	fmt.Println("get(1) =", cache.Get(1))
	cache.PrintCache()
}`,
        "rust": `use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::{Rc, Weak};

// Doubly linked lists with real cycles between owners are notoriously awkward in
// safe Rust, since Box<T> cannot express "two owners" and raw pointers give up
// Rust's safety guarantees. The idiomatic fix is Rc<RefCell<Node>> for the strong
// "next" pointers and Weak<RefCell<Node>> for the "prev" back-pointers, which
// avoids reference cycles that would otherwise leak memory.
struct Node {
    key: i32,
    value: i32,
    prev: Option<Weak<RefCell<Node>>>,
    next: Option<Rc<RefCell<Node>>>,
}

type NodeRef = Rc<RefCell<Node>>;

struct LRUCache {
    capacity: usize,
    count: usize,
    cache_map: HashMap<i32, NodeRef>,
    head: NodeRef,
    tail: NodeRef,
}

impl LRUCache {
    fn new(capacity: usize) -> Self {
        let head = Rc::new(RefCell::new(Node { key: -1, value: -1, prev: None, next: None }));
        let tail = Rc::new(RefCell::new(Node { key: -1, value: -1, prev: None, next: None }));
        head.borrow_mut().next = Some(Rc::clone(&tail));
        tail.borrow_mut().prev = Some(Rc::downgrade(&head));
        LRUCache { capacity, count: 0, cache_map: HashMap::new(), head, tail }
    }

    fn remove_node(&self, node: &NodeRef) {
        let prev = node.borrow().prev.clone().unwrap().upgrade().unwrap();
        let next = node.borrow().next.clone().unwrap();
        prev.borrow_mut().next = Some(Rc::clone(&next));
        next.borrow_mut().prev = Some(Rc::downgrade(&prev));
    }

    fn insert_front(&self, node: &NodeRef) {
        let old_first = self.head.borrow().next.clone().unwrap();
        node.borrow_mut().next = Some(Rc::clone(&old_first));
        node.borrow_mut().prev = Some(Rc::downgrade(&self.head));
        old_first.borrow_mut().prev = Some(Rc::downgrade(node));
        self.head.borrow_mut().next = Some(Rc::clone(node));
    }

    fn get(&self, key: i32) -> i32 {
        match self.cache_map.get(&key) {
            None => -1,
            Some(node) => {
                let node = Rc::clone(node);
                self.remove_node(&node);
                self.insert_front(&node);
                node.borrow().value
            }
        }
    }

    fn put(&mut self, key: i32, value: i32) {
        if let Some(existing) = self.cache_map.get(&key) {
            let node = Rc::clone(existing);
            node.borrow_mut().value = value;
            self.remove_node(&node);
            self.insert_front(&node);
            return;
        }

        if self.count == self.capacity {
            let lru = self.tail.borrow().prev.clone().unwrap().upgrade().unwrap();
            self.remove_node(&lru);
            self.cache_map.remove(&lru.borrow().key);
            self.count -= 1;
        }

        let node = Rc::new(RefCell::new(Node { key, value, prev: None, next: None }));
        self.insert_front(&node);
        self.cache_map.insert(key, node);
        self.count += 1;
    }

    fn print_cache(&self) {
        let mut parts = Vec::new();
        let mut curr = self.head.borrow().next.clone().unwrap();
        while !Rc::ptr_eq(&curr, &self.tail) {
            let (k, v) = { let c = curr.borrow(); (c.key, c.value) };
            parts.push(format!("({},{})", k, v));
            let next = curr.borrow().next.clone().unwrap();
            curr = next;
        }
        println!("Cache: {}", parts.join(" <-> "));
    }
}

fn main() {
    let mut cache = LRUCache::new(3);

    cache.put(1, 10);
    cache.put(2, 20);
    cache.put(3, 30);
    cache.print_cache();

    println!("get(2) = {}", cache.get(2));
    cache.print_cache();

    cache.put(4, 40);
    cache.print_cache();

    println!("get(1) = {}", cache.get(1));
    cache.print_cache();
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. REVERSE LINKED LIST
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Reverse Linked List",
      href: "/algorithms/linked_lists/reverse",
      type: "Easy",

      about: [
        { tag: "h1", text: "Reverse Linked List" },
        { tag: "p", text: "Reversing a singly linked list flips the direction of every next pointer, so the list traverses in the opposite order — what was the head becomes the new tail, and what was the tail becomes the new head. It can be done iteratively (walking through once, rewiring pointers as you go) or recursively (reversing the rest of the list first, then fixing up the current node's links)." },
        { tag: "p", text: "It's the quintessential linked-list pointer-manipulation exercise, and a common building block inside larger problems: reversing a sub-portion of a list, checking for palindrome structure, or reordering a list in a specific pattern (e.g. L0→Ln→L1→Ln-1→...) all rely on reversal as a sub-step." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Literal reversal requests, or reversing a sub-range [left, right] of a larger list",
          "Palindrome-checking on a linked list: reverse the second half, then compare it against the first half",
          "As a building block for 'reorder list' style problems that interleave the front and back halves",
          "Undo/redo style operations modeled as a list, where reversing direction has direct semantic meaning"
        ]},
        { tag: "note", variant: "warning", text: "The single most common bug: overwriting current.next before saving a reference to it. Always capture the 'next' node into a temporary variable BEFORE reassigning current.next, or the rest of the original list becomes permanently unreachable." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Reversal must visit and rewire every single node's pointer — there's no early-exit shortcut, since every node's next pointer needs to be flipped for the reversal to be complete and correct." },
          { tag: "ul", items: [
            "Each of the n nodes is visited exactly once: O(n)",
            "Each visit does O(1) work: save next, reverse the pointer, advance",
            "Total: O(n), even for the shortest meaningful list"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every node requires identical O(1) pointer-rewiring work regardless of the values stored in the list — there's no value-dependent branching in the traversal." },
          { tag: "ul", items: ["n nodes × O(1) work each = O(n)", "No input distribution changes this fixed iteration structure"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No list configuration increases the cost beyond visiting every node exactly once — this is simultaneously the best, average, and worst case, since reversal has no input-dependent shortcuts at all." },
          { tag: "ul", items: ["O(n) holds unconditionally", "This matches the trivial lower bound: every node's pointer must be examined and modified at least once for a correct reversal"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "The iterative approach reverses pointers in-place, needing only a constant number of pointer variables to track the current, previous, and next nodes during traversal." },
          { tag: "ul", items: ["prev, current, next pointers — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on list length or content for the iterative approach — it's always exactly three pointer variables." },
          { tag: "ul", items: ["No auxiliary array or new nodes are created — purely in-place pointer rewiring"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even reversing the longest possible list uses no more than the fixed three pointer variables for the iterative version — though the recursive version's call stack grows with list length." },
          { tag: "ul", items: [
            "Iterative version: O(1), regardless of n",
            "Recursive version: O(n) call-stack depth, since each recursive call waits for the rest of the list to be reversed before fixing up its own link — this is the classic time-space trade-off between the two implementation styles"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function reverseList(head):
    prev ← null
    current ← head

    while current is not null:
        nextNode ← current.next   // save before overwriting
        current.next ← prev       // reverse the pointer
        prev ← current            // advance prev
        current ← nextNode        // advance current

    return prev                   // prev is the new head` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise prev to null (since the original head's reversed next pointer should point to nothing — it becomes the new tail) and current to the original head.",
          "At each step, before touching current.next, save it into nextNode — this preserves the link to 'the rest of the original list' that would otherwise be lost the moment current.next is overwritten.",
          "Reverse the current node's pointer: set current.next to prev, flipping the direction.",
          "Advance both prev and current one step forward (using the saved nextNode for current, since current.next has already been overwritten).",
          "Repeat until current becomes null — at that point, prev points to what was the original list's last node, which is now the new head."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at the start of every loop iteration, the sub-list from the original head up to (but not including) current has already been fully and correctly reversed, with prev pointing to its new head (the original list's most recently processed node). The loop body extends this invariant by exactly one more node: it reverses current's pointer to point at prev (correctly attaching it to the already-reversed prefix), then advances both pointers. By induction, when current reaches null (having processed all n nodes), prev points to the fully reversed list's head — the original list's tail." }
      ],
      codes: {
        "c++": `#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;

    Node(int val) {
        value = val;
        next = nullptr;
    }
};

// Insert at the end
void insert(Node*& head, int value) {
    Node* curr = new Node(value);

    if (head == nullptr) {
        head = curr;
        return;
    }

    Node* temp = head;

    while (temp->next != nullptr) {
        temp = temp->next;
    }

    temp->next = curr;
}

// Print the linked list
void printList(Node* head) {
    Node* curr = head;

    while (curr != nullptr) {
        cout << curr->value;
        if (curr->next != nullptr)
            cout << " -> ";
        curr = curr->next;
    }

    cout << endl;
}

// Reverse the linked list
void reverseList(Node*& head) {

    Node* prev = nullptr;
    Node* curr = head;

    while (curr != nullptr) {

        Node* next = curr->next;

        curr->next = prev;

        prev = curr;
        curr = next;
        head = prev;
    }

    
}

int main() {
    Node* head = nullptr;

    insert(head, 1);
    insert(head, 2);
    insert(head, 3);
    insert(head, 4);

    printList(head);

    reverseList(head);

    printList(head);

    return 0;
}`,
        "python": `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


def insert(head, value):
    node = Node(value)
    if head is None:
        return node
    curr = head
    while curr.next is not None:
        curr = curr.next
    curr.next = node
    return head


def print_list(head):
    parts = []
    curr = head
    while curr is not None:
        parts.append(str(curr.value))
        curr = curr.next
    print(" -> ".join(parts))


def reverse_list(head):
    prev = None
    curr = head
    while curr is not None:
        next_node = curr.next
        curr.next = prev
        prev = curr
        curr = next_node
    return prev


if __name__ == "__main__":
    head = None
    for v in (1, 2, 3, 4):
        head = insert(head, v)

    print_list(head)

    head = reverse_list(head)

    print_list(head)`,
        "java": `public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) {
            this.value = value;
        }
    }

    static Node insert(Node head, int value) {
        Node node = new Node(value);
        if (head == null) return node;
        Node curr = head;
        while (curr.next != null) curr = curr.next;
        curr.next = node;
        return head;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder();
        Node curr = head;
        while (curr != null) {
            sb.append(curr.value);
            if (curr.next != null) sb.append(" -> ");
            curr = curr.next;
        }
        System.out.println(sb);
    }

    static Node reverseList(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node next = curr.next;
            curr.next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }

    public static void main(String[] args) {
        Node head = null;
        for (int v : new int[]{1, 2, 3, 4}) {
            head = insert(head, v);
        }

        printList(head);

        head = reverseList(head);

        printList(head);
    }
}`,
        "js": `class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

function insert(head, value) {
    const node = new Node(value);
    if (head === null) return node;
    let curr = head;
    while (curr.next !== null) curr = curr.next;
    curr.next = node;
    return head;
}

function printList(head) {
    const parts = [];
    let curr = head;
    while (curr !== null) {
        parts.push(curr.value);
        curr = curr.next;
    }
    console.log(parts.join(" -> "));
}

function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr !== null) {
        const next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

let head = null;
for (const v of [1, 2, 3, 4]) {
    head = insert(head, v);
}

printList(head);

head = reverseList(head);

printList(head);`,
        "c": `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node* next;
} Node;

Node* insert(Node* head, int value) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->value = value;
    node->next = NULL;

    if (head == NULL) return node;

    Node* curr = head;
    while (curr->next != NULL) curr = curr->next;
    curr->next = node;
    return head;
}

void printList(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        printf("%d", curr->value);
        if (curr->next != NULL) printf(" -> ");
        curr = curr->next;
    }
    printf("\\n");
}

Node* reverseList(Node* head) {
    Node* prev = NULL;
    Node* curr = head;
    while (curr != NULL) {
        Node* next = curr->next;
        curr->next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}

int main() {
    Node* head = NULL;
    int values[] = {1, 2, 3, 4};
    for (int i = 0; i < 4; i++) head = insert(head, values[i]);

    printList(head);

    head = reverseList(head);

    printList(head);

    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;
using System.Text;

class Node {
    public int Value;
    public Node Next;
    public Node(int value) { Value = value; }
}

class Program {
    static Node Insert(Node head, int value) {
        Node node = new Node(value);
        if (head == null) return node;
        Node curr = head;
        while (curr.Next != null) curr = curr.Next;
        curr.Next = node;
        return head;
    }

    static void PrintList(Node head) {
        var sb = new StringBuilder();
        Node curr = head;
        while (curr != null) {
            sb.Append(curr.Value);
            if (curr.Next != null) sb.Append(" -> ");
            curr = curr.Next;
        }
        Console.WriteLine(sb.ToString());
    }

    static Node ReverseList(Node head) {
        Node prev = null;
        Node curr = head;
        while (curr != null) {
            Node next = curr.Next;
            curr.Next = prev;
            prev = curr;
            curr = next;
        }
        return prev;
    }

    static void Main() {
        Node head = null;
        foreach (int v in new int[] { 1, 2, 3, 4 }) {
            head = Insert(head, v);
        }

        PrintList(head);

        head = ReverseList(head);

        PrintList(head);
    }
}`,
        "swift": `class Node {
    var value: Int
    var next: Node?
    init(_ value: Int) { self.value = value }
}

func insert(_ head: Node?, _ value: Int) -> Node {
    let node = Node(value)
    guard let head = head else { return node }
    var curr = head
    while let next = curr.next { curr = next }
    curr.next = node
    return head
}

func printList(_ head: Node?) {
    var parts: [String] = []
    var curr = head
    while let node = curr {
        parts.append(String(node.value))
        curr = node.next
    }
    print(parts.joined(separator: " -> "))
}

func reverseList(_ head: Node?) -> Node? {
    var prev: Node? = nil
    var curr = head
    while let node = curr {
        let next = node.next
        node.next = prev
        prev = node
        curr = next
    }
    return prev
}

var head: Node? = nil
for v in [1, 2, 3, 4] {
    head = insert(head, v)
}

printList(head)

head = reverseList(head)

printList(head)`,
        "kotlin": `class Node(val value: Int) {
    var next: Node? = null
}

fun insert(head: Node?, value: Int): Node {
    val node = Node(value)
    if (head == null) return node
    var curr = head
    while (curr.next != null) curr = curr.next!!
    curr.next = node
    return head
}

fun printList(head: Node?) {
    val parts = mutableListOf<String>()
    var curr = head
    while (curr != null) {
        parts.add(curr.value.toString())
        curr = curr.next
    }
    println(parts.joinToString(" -> "))
}

fun reverseList(head: Node?): Node? {
    var prev: Node? = null
    var curr = head
    while (curr != null) {
        val next = curr.next
        curr.next = prev
        prev = curr
        curr = next
    }
    return prev
}

fun main() {
    var head: Node? = null
    for (v in listOf(1, 2, 3, 4)) {
        head = insert(head, v)
    }

    printList(head)

    head = reverseList(head)

    printList(head)
}`,
        "scala": `class Node(val value: Int) {
  var next: Node = _
}

object Main extends App {
  def insert(head: Node, value: Int): Node = {
    val node = new Node(value)
    if (head == null) return node
    var curr = head
    while (curr.next != null) curr = curr.next
    curr.next = node
    head
  }

  def printList(head: Node): Unit = {
    val parts = scala.collection.mutable.ListBuffer[String]()
    var curr = head
    while (curr != null) {
      parts += curr.value.toString
      curr = curr.next
    }
    println(parts.mkString(" -> "))
  }

  def reverseList(head: Node): Node = {
    var prev: Node = null
    var curr = head
    while (curr != null) {
      val next = curr.next
      curr.next = prev
      prev = curr
      curr = next
    }
    prev
  }

  var head: Node = null
  for (v <- List(1, 2, 3, 4)) {
    head = insert(head, v)
  }

  printList(head)

  head = reverseList(head)

  printList(head)
}`,
        "go": `package main

import "fmt"

type Node struct {
	value int
	next  *Node
}

func insert(head *Node, value int) *Node {
	node := &Node{value: value}
	if head == nil {
		return node
	}
	curr := head
	for curr.next != nil {
		curr = curr.next
	}
	curr.next = node
	return head
}

func printList(head *Node) {
	curr := head
	first := true
	for curr != nil {
		if !first {
			fmt.Print(" -> ")
		}
		fmt.Print(curr.value)
		first = false
		curr = curr.next
	}
	fmt.Println()
}

func reverseList(head *Node) *Node {
	var prev *Node
	curr := head
	for curr != nil {
		next := curr.next
		curr.next = prev
		prev = curr
		curr = next
	}
	return prev
}

func main() {
	var head *Node
	for _, v := range []int{1, 2, 3, 4} {
		head = insert(head, v)
	}

	printList(head)

	head = reverseList(head)

	printList(head)
}`,
        "rust": `// A singly linked list with no cycles and a single owner per node maps cleanly
// onto Box<Node> — ownership simply transfers as the list is traversed and
// reversed, with no need for Rc/RefCell (unlike LRU Cache Design above).
struct Node {
    value: i32,
    next: Option<Box<Node>>,
}

fn insert(head: Option<Box<Node>>, value: i32) -> Option<Box<Node>> {
    match head {
        None => Some(Box::new(Node { value, next: None })),
        Some(mut node) => {
            node.next = insert(node.next.take(), value);
            Some(node)
        }
    }
}

fn print_list(head: &Option<Box<Node>>) {
    let mut parts = Vec::new();
    let mut curr = head;
    while let Some(node) = curr {
        parts.push(node.value.to_string());
        curr = &node.next;
    }
    println!("{}", parts.join(" -> "));
}

fn reverse_list(mut head: Option<Box<Node>>) -> Option<Box<Node>> {
    let mut prev: Option<Box<Node>> = None;
    while let Some(mut curr) = head {
        head = curr.next.take();
        curr.next = prev;
        prev = Some(curr);
    }
    prev
}

fn main() {
    let mut head: Option<Box<Node>> = None;
    for v in [1, 2, 3, 4] {
        head = insert(head, v);
    }

    print_list(&head);

    head = reverse_list(head);

    print_list(&head);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. DOUBLY LINKED LISTS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Doubly Linked Lists",
      href: "/algorithms/linked_lists/doubly",
      type: "Medium",

      about: [
        { tag: "h1", text: "Doubly Linked Lists" },
        { tag: "p", text: "A doubly linked list extends the singly linked list by giving every node a prev pointer in addition to next, allowing traversal in both directions. This bidirectional linking is what enables O(1) deletion given only a node reference (no need to search for the previous node) and O(1) insertion before a given node, neither of which a singly linked list can do without an O(n) search." },
        { tag: "p", text: "The structural cost is double the pointer-maintenance work on every insertion and deletion — every operation that touches a node's next pointer in a singly linked list must now also correctly maintain the corresponding prev pointer on the neighboring node, doubling the number of pointer assignments (though not the asymptotic complexity)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need O(1) deletion of an arbitrary node given only a reference to it (no head-to-node traversal required)",
          "You need to traverse backward as well as forward — browser history (back/forward navigation), undo/redo stacks, music playlist 'previous track'",
          "Building blocks for more complex structures: LRU Cache Design (above), deques, and certain balanced tree implementations use doubly linked lists internally",
          "Any structure needing efficient insertion/deletion at BOTH ends, which a plain singly linked list can only do efficiently at one end without extra bookkeeping"
        ]},
        { tag: "note", variant: "tip", text: "Sentinel (dummy) head and tail nodes are the standard production technique for doubly linked lists — they eliminate every null-check special case for 'is this the first/last node', at the small fixed cost of two extra permanent nodes." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Insertion or deletion AT A KNOWN NODE (given a direct reference, not found via search) is genuinely O(1) — this is the entire structural advantage doubly linked lists offer over arrays for this specific operation." },
          { tag: "ul", items: [
            "Insert before/after a given node reference: O(1) — rewire at most 4 pointers (2 next, 2 prev)",
            "Delete a given node reference: O(1) — splice it out using only its own prev and next pointers, no search needed",
            "This O(1) bound assumes the node reference is ALREADY KNOWN — finding a node by value still requires O(n) traversal"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "When the operation requires first FINDING a node by value (rather than already having a direct reference), the search itself dominates the cost, since a doubly linked list offers no faster-than-linear search regardless of direction." },
          { tag: "ul", items: [
            "Search by value: O(n) on average, since there's no ordering property to exploit (unlike a BST) — traversal from either end still must check each node in the worst case",
            "Once found, the actual insert/delete operation is O(1) — the O(n) cost is entirely attributable to the search, not the structural modification"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "If the target node is at the far end of the list relative to the traversal's starting point, the search (and thus the overall find-and-modify operation) costs O(n)." },
          { tag: "ul", items: [
            "Search-then-modify: O(n) worst case, dominated by the search",
            "Pure structural operations (given a direct node reference) remain O(1) regardless of where in the list that node happens to be — bidirectional pointers mean position within the list never affects modification cost, only search cost"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Each node requires storage for its value plus two pointers (next and prev) — double the pointer overhead of a singly linked list, but still linear in the number of nodes." },
          { tag: "ul", items: ["n nodes, each with value + next + prev pointers: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by node count alone, since every node has exactly the same fixed-size structure regardless of its position or the values stored in the list." },
          { tag: "ul", items: ["Same O(n) bound regardless of value distribution or insertion/deletion history"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No sequence of operations increases per-node overhead beyond the fixed two-pointer structure — space scales linearly and predictably with the current node count." },
          { tag: "ul", items: ["O(n) total, plus a small constant for optional sentinel head/tail nodes if used"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function insertAfter(node, value):
    newNode ← new Node(value)
    newNode.prev ← node
    newNode.next ← node.next

    if node.next is not null:
        node.next.prev ← newNode
    node.next ← newNode

    return newNode

function deleteNode(node):
    if node.prev is not null:
        node.prev.next ← node.next
    if node.next is not null:
        node.next.prev ← node.prev
    // node is now fully unlinked from the list` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Insertion: create the new node and immediately set its prev to the existing node and its next to the existing node's current next — this correctly positions the new node's own pointers before touching any neighboring node's pointers.",
          "Update the OLD next node's prev pointer to point back at the new node (if it exists — it might be null if inserting at the tail).",
          "Finally, update the original node's next pointer to point at the new node — order matters here: this must happen AFTER reading node.next for the new node's own next pointer, or the original next reference would be lost.",
          "Deletion: for the node being removed, redirect its prev's next pointer to skip over it directly to its next, and redirect its next's prev pointer to skip back over it directly to its prev — both updates are needed to fully remove the node from both traversal directions.",
          "Each of these checks (prev is not null / next is not null) handles the edge cases of deleting/inserting at the very head or tail of the list, where one of the two neighbor pointers doesn't exist."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness for insertion follows from carefully ordering the four pointer updates so no needed reference is overwritten before it's used: the new node's own pointers are set first (capturing the original neighbor relationship), and only then are the neighbors' pointers updated to point at the new node, by which point the new node's pointers already correctly hold the original neighbor references. For deletion, the two redirections (prev's next, and next's prev) together ensure the deleted node is fully bypassed in BOTH traversal directions simultaneously — after these two updates, no remaining node in the list has a pointer referencing the deleted node, making it fully and correctly unlinked." }
      ],
      codes: {
        "c++": `#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* prev;
    Node* next;

    Node(int val) {
        value = val;
        prev = nullptr;
        next = nullptr;
    }
};

Node* head = nullptr;
Node* tail = nullptr;

// Insert at the end
void insert(int value) {

    Node* curr = new Node(value);

    if (head == nullptr) {
        head = curr;
        tail = curr;
        return;
    }

    tail->next = curr;
    curr->prev = tail;
    tail = curr;
}

// Delete first occurrence of value
void remove(int value) {

    Node* curr = head;

    while (curr != nullptr && curr->value != value) {
        curr = curr->next;
    }

    if (curr == nullptr)
        return;

    if (curr == head)
        head = curr->next;

    if (curr == tail)
        tail = curr->prev;

    if (curr->prev != nullptr)
        curr->prev->next = curr->next;

    if (curr->next != nullptr)
        curr->next->prev = curr->prev;

    delete curr;
}

// Print forward
void printForward() {

    cout << "Forward : ";

    Node* curr = head;

    while (curr != nullptr) {

        cout << curr->value;

        if (curr->next != nullptr)
            cout << " <-> ";

        curr = curr->next;
    }

    cout << endl;
}

// Print backward
void printBackward() {

    cout << "Backward: ";

    Node* curr = tail;

    while (curr != nullptr) {

        cout << curr->value;

        if (curr->prev != nullptr)
            cout << " <-> ";

        curr = curr->prev;
    }

    cout << endl;
}

int main() {

    insert(10);
    insert(20);
    insert(30);
    insert(40);
    insert(50);

    cout << "Initial List\\n";
    printForward();
    printBackward();

    cout << endl;

    remove(30);

    cout << "After deleting 30\\n";
    printForward();
    printBackward();

    cout << endl;

    insert(60);

    cout << "After inserting 60\\n";
    printForward();
    printBackward();

    return 0;
}`,
        "python": `class Node:
    def __init__(self, value):
        self.value = value
        self.prev = None
        self.next = None


head = None
tail = None


def insert(value):
    global head, tail
    node = Node(value)

    if head is None:
        head = node
        tail = node
        return

    tail.next = node
    node.prev = tail
    tail = node


def remove(value):
    global head, tail
    curr = head

    while curr is not None and curr.value != value:
        curr = curr.next

    if curr is None:
        return

    if curr is head:
        head = curr.next

    if curr is tail:
        tail = curr.prev

    if curr.prev is not None:
        curr.prev.next = curr.next

    if curr.next is not None:
        curr.next.prev = curr.prev


def print_forward():
    parts = []
    curr = head
    while curr is not None:
        parts.append(str(curr.value))
        curr = curr.next
    print("Forward :", " <-> ".join(parts))


def print_backward():
    parts = []
    curr = tail
    while curr is not None:
        parts.append(str(curr.value))
        curr = curr.prev
    print("Backward:", " <-> ".join(parts))


if __name__ == "__main__":
    for v in (10, 20, 30, 40, 50):
        insert(v)

    print("Initial List")
    print_forward()
    print_backward()
    print()

    remove(30)

    print("After deleting 30")
    print_forward()
    print_backward()
    print()

    insert(60)

    print("After inserting 60")
    print_forward()
    print_backward()`,
        "java": `public class Main {
    static class Node {
        int value;
        Node prev, next;
        Node(int value) { this.value = value; }
    }

    static Node head, tail;

    static void insert(int value) {
        Node curr = new Node(value);
        if (head == null) {
            head = curr;
            tail = curr;
            return;
        }
        tail.next = curr;
        curr.prev = tail;
        tail = curr;
    }

    static void remove(int value) {
        Node curr = head;
        while (curr != null && curr.value != value) curr = curr.next;
        if (curr == null) return;

        if (curr == head) head = curr.next;
        if (curr == tail) tail = curr.prev;
        if (curr.prev != null) curr.prev.next = curr.next;
        if (curr.next != null) curr.next.prev = curr.prev;
    }

    static void printForward() {
        StringBuilder sb = new StringBuilder("Forward : ");
        Node curr = head;
        while (curr != null) {
            sb.append(curr.value);
            if (curr.next != null) sb.append(" <-> ");
            curr = curr.next;
        }
        System.out.println(sb);
    }

    static void printBackward() {
        StringBuilder sb = new StringBuilder("Backward: ");
        Node curr = tail;
        while (curr != null) {
            sb.append(curr.value);
            if (curr.prev != null) sb.append(" <-> ");
            curr = curr.prev;
        }
        System.out.println(sb);
    }

    public static void main(String[] args) {
        for (int v : new int[]{10, 20, 30, 40, 50}) insert(v);

        System.out.println("Initial List");
        printForward();
        printBackward();
        System.out.println();

        remove(30);

        System.out.println("After deleting 30");
        printForward();
        printBackward();
        System.out.println();

        insert(60);

        System.out.println("After inserting 60");
        printForward();
        printBackward();
    }
}`,
        "js": `class Node {
    constructor(value) {
        this.value = value;
        this.prev = null;
        this.next = null;
    }
}

let head = null;
let tail = null;

function insert(value) {
    const curr = new Node(value);
    if (head === null) {
        head = curr;
        tail = curr;
        return;
    }
    tail.next = curr;
    curr.prev = tail;
    tail = curr;
}

function remove(value) {
    let curr = head;
    while (curr !== null && curr.value !== value) curr = curr.next;
    if (curr === null) return;

    if (curr === head) head = curr.next;
    if (curr === tail) tail = curr.prev;
    if (curr.prev !== null) curr.prev.next = curr.next;
    if (curr.next !== null) curr.next.prev = curr.prev;
}

function printForward() {
    const parts = [];
    let curr = head;
    while (curr !== null) {
        parts.push(curr.value);
        curr = curr.next;
    }
    console.log("Forward :", parts.join(" <-> "));
}

function printBackward() {
    const parts = [];
    let curr = tail;
    while (curr !== null) {
        parts.push(curr.value);
        curr = curr.prev;
    }
    console.log("Backward:", parts.join(" <-> "));
}

for (const v of [10, 20, 30, 40, 50]) insert(v);

console.log("Initial List");
printForward();
printBackward();
console.log();

remove(30);

console.log("After deleting 30");
printForward();
printBackward();
console.log();

insert(60);

console.log("After inserting 60");
printForward();
printBackward();`,
        "c": `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node* prev;
    struct Node* next;
} Node;

Node* head = NULL;
Node* tail = NULL;

void insert(int value) {
    Node* curr = (Node*)malloc(sizeof(Node));
    curr->value = value;
    curr->prev = NULL;
    curr->next = NULL;

    if (head == NULL) {
        head = curr;
        tail = curr;
        return;
    }

    tail->next = curr;
    curr->prev = tail;
    tail = curr;
}

void removeValue(int value) {
    Node* curr = head;
    while (curr != NULL && curr->value != value) curr = curr->next;
    if (curr == NULL) return;

    if (curr == head) head = curr->next;
    if (curr == tail) tail = curr->prev;
    if (curr->prev != NULL) curr->prev->next = curr->next;
    if (curr->next != NULL) curr->next->prev = curr->prev;

    free(curr);
}

void printForward() {
    printf("Forward : ");
    Node* curr = head;
    while (curr != NULL) {
        printf("%d", curr->value);
        if (curr->next != NULL) printf(" <-> ");
        curr = curr->next;
    }
    printf("\\n");
}

void printBackward() {
    printf("Backward: ");
    Node* curr = tail;
    while (curr != NULL) {
        printf("%d", curr->value);
        if (curr->prev != NULL) printf(" <-> ");
        curr = curr->prev;
    }
    printf("\\n");
}

int main() {
    int values[] = {10, 20, 30, 40, 50};
    for (int i = 0; i < 5; i++) insert(values[i]);

    printf("Initial List\\n");
    printForward();
    printBackward();
    printf("\\n");

    removeValue(30);

    printf("After deleting 30\\n");
    printForward();
    printBackward();
    printf("\\n");

    insert(60);

    printf("After inserting 60\\n");
    printForward();
    printBackward();

    return 0;
}`,
        "c#": `using System;
using System.Text;

class Node {
    public int Value;
    public Node Prev, Next;
    public Node(int value) { Value = value; }
}

class Program {
    static Node head, tail;

    static void Insert(int value) {
        Node curr = new Node(value);
        if (head == null) {
            head = curr;
            tail = curr;
            return;
        }
        tail.Next = curr;
        curr.Prev = tail;
        tail = curr;
    }

    static void Remove(int value) {
        Node curr = head;
        while (curr != null && curr.Value != value) curr = curr.Next;
        if (curr == null) return;

        if (curr == head) head = curr.Next;
        if (curr == tail) tail = curr.Prev;
        if (curr.Prev != null) curr.Prev.Next = curr.Next;
        if (curr.Next != null) curr.Next.Prev = curr.Prev;
    }

    static void PrintForward() {
        var sb = new StringBuilder("Forward : ");
        Node curr = head;
        while (curr != null) {
            sb.Append(curr.Value);
            if (curr.Next != null) sb.Append(" <-> ");
            curr = curr.Next;
        }
        Console.WriteLine(sb.ToString());
    }

    static void PrintBackward() {
        var sb = new StringBuilder("Backward: ");
        Node curr = tail;
        while (curr != null) {
            sb.Append(curr.Value);
            if (curr.Prev != null) sb.Append(" <-> ");
            curr = curr.Prev;
        }
        Console.WriteLine(sb.ToString());
    }

    static void Main() {
        foreach (int v in new int[] { 10, 20, 30, 40, 50 }) Insert(v);

        Console.WriteLine("Initial List");
        PrintForward();
        PrintBackward();
        Console.WriteLine();

        Remove(30);

        Console.WriteLine("After deleting 30");
        PrintForward();
        PrintBackward();
        Console.WriteLine();

        Insert(60);

        Console.WriteLine("After inserting 60");
        PrintForward();
        PrintBackward();
    }
}`,
        "swift": `class Node {
    var value: Int
    var prev: Node?
    var next: Node?
    init(_ value: Int) { self.value = value }
}

var head: Node?
var tail: Node?

func insert(_ value: Int) {
    let curr = Node(value)
    guard let currentTail = tail else {
        head = curr
        tail = curr
        return
    }
    currentTail.next = curr
    curr.prev = currentTail
    tail = curr
}

func remove(_ value: Int) {
    var curr = head
    while let node = curr, node.value != value {
        curr = node.next
    }
    guard let target = curr else { return }

    if target === head { head = target.next }
    if target === tail { tail = target.prev }
    target.prev?.next = target.next
    target.next?.prev = target.prev
}

func printForward() {
    var parts: [String] = []
    var curr = head
    while let node = curr {
        parts.append(String(node.value))
        curr = node.next
    }
    print("Forward : " + parts.joined(separator: " <-> "))
}

func printBackward() {
    var parts: [String] = []
    var curr = tail
    while let node = curr {
        parts.append(String(node.value))
        curr = node.prev
    }
    print("Backward: " + parts.joined(separator: " <-> "))
}

for v in [10, 20, 30, 40, 50] { insert(v) }

print("Initial List")
printForward()
printBackward()
print()

remove(30)

print("After deleting 30")
printForward()
printBackward()
print()

insert(60)

print("After inserting 60")
printForward()
printBackward()`,
        "kotlin": `class Node(val value: Int) {
    var prev: Node? = null
    var next: Node? = null
}

var head: Node? = null
var tail: Node? = null

fun insert(value: Int) {
    val curr = Node(value)
    val currentTail = tail
    if (currentTail == null) {
        head = curr
        tail = curr
        return
    }
    currentTail.next = curr
    curr.prev = currentTail
    tail = curr
}

fun remove(value: Int) {
    var curr = head
    while (curr != null && curr.value != value) curr = curr.next
    val target = curr ?: return

    if (target === head) head = target.next
    if (target === tail) tail = target.prev
    target.prev?.next = target.next
    target.next?.prev = target.prev
}

fun printForward() {
    val parts = mutableListOf<String>()
    var curr = head
    while (curr != null) {
        parts.add(curr.value.toString())
        curr = curr.next
    }
    println("Forward : " + parts.joinToString(" <-> "))
}

fun printBackward() {
    val parts = mutableListOf<String>()
    var curr = tail
    while (curr != null) {
        parts.add(curr.value.toString())
        curr = curr.prev
    }
    println("Backward: " + parts.joinToString(" <-> "))
}

fun main() {
    for (v in listOf(10, 20, 30, 40, 50)) insert(v)

    println("Initial List")
    printForward()
    printBackward()
    println()

    remove(30)

    println("After deleting 30")
    printForward()
    printBackward()
    println()

    insert(60)

    println("After inserting 60")
    printForward()
    printBackward()
}`,
        "scala": `class Node(val value: Int) {
  var prev: Node = _
  var next: Node = _
}

object Main extends App {
  var head: Node = null
  var tail: Node = null

  def insert(value: Int): Unit = {
    val curr = new Node(value)
    if (head == null) {
      head = curr
      tail = curr
      return
    }
    tail.next = curr
    curr.prev = tail
    tail = curr
  }

  def remove(value: Int): Unit = {
    var curr = head
    while (curr != null && curr.value != value) curr = curr.next
    if (curr == null) return

    if (curr == head) head = curr.next
    if (curr == tail) tail = curr.prev
    if (curr.prev != null) curr.prev.next = curr.next
    if (curr.next != null) curr.next.prev = curr.prev
  }

  def printForward(): Unit = {
    val parts = scala.collection.mutable.ListBuffer[String]()
    var curr = head
    while (curr != null) {
      parts += curr.value.toString
      curr = curr.next
    }
    println("Forward : " + parts.mkString(" <-> "))
  }

  def printBackward(): Unit = {
    val parts = scala.collection.mutable.ListBuffer[String]()
    var curr = tail
    while (curr != null) {
      parts += curr.value.toString
      curr = curr.prev
    }
    println("Backward: " + parts.mkString(" <-> "))
  }

  for (v <- List(10, 20, 30, 40, 50)) insert(v)

  println("Initial List")
  printForward()
  printBackward()
  println()

  remove(30)

  println("After deleting 30")
  printForward()
  printBackward()
  println()

  insert(60)

  println("After inserting 60")
  printForward()
  printBackward()
}`,
        "go": `package main

import "fmt"

type Node struct {
	value      int
	prev, next *Node
}

var head, tail *Node

func insert(value int) {
	curr := &Node{value: value}
	if head == nil {
		head = curr
		tail = curr
		return
	}
	tail.next = curr
	curr.prev = tail
	tail = curr
}

func remove(value int) {
	curr := head
	for curr != nil && curr.value != value {
		curr = curr.next
	}
	if curr == nil {
		return
	}

	if curr == head {
		head = curr.next
	}
	if curr == tail {
		tail = curr.prev
	}
	if curr.prev != nil {
		curr.prev.next = curr.next
	}
	if curr.next != nil {
		curr.next.prev = curr.prev
	}
}

func printForward() {
	fmt.Print("Forward : ")
	curr := head
	for curr != nil {
		fmt.Print(curr.value)
		if curr.next != nil {
			fmt.Print(" <-> ")
		}
		curr = curr.next
	}
	fmt.Println()
}

func printBackward() {
	fmt.Print("Backward: ")
	curr := tail
	for curr != nil {
		fmt.Print(curr.value)
		if curr.prev != nil {
			fmt.Print(" <-> ")
		}
		curr = curr.prev
	}
	fmt.Println()
}

func main() {
	for _, v := range []int{10, 20, 30, 40, 50} {
		insert(v)
	}

	fmt.Println("Initial List")
	printForward()
	printBackward()
	fmt.Println()

	remove(30)

	fmt.Println("After deleting 30")
	printForward()
	printBackward()
	fmt.Println()

	insert(60)

	fmt.Println("After inserting 60")
	printForward()
	printBackward()
}`,
        "rust": `use std::cell::RefCell;
use std::rc::{Rc, Weak};

// Same Rc<RefCell<Node>> + Weak<RefCell<Node>> pattern as LRU Cache Design:
// "next" holds a strong (owning) reference, "prev" holds a weak (non-owning)
// reference, so the list can be walked in both directions without creating
// an ownership cycle that would prevent nodes from ever being freed.
struct Node {
    value: i32,
    prev: Option<Weak<RefCell<Node>>>,
    next: Option<Rc<RefCell<Node>>>,
}

type NodeRef = Rc<RefCell<Node>>;

struct DoublyLinkedList {
    head: Option<NodeRef>,
    tail: Option<NodeRef>,
}

impl DoublyLinkedList {
    fn new() -> Self {
        DoublyLinkedList { head: None, tail: None }
    }

    fn insert(&mut self, value: i32) {
        let node = Rc::new(RefCell::new(Node { value, prev: None, next: None }));
        match self.tail.take() {
            None => {
                self.head = Some(Rc::clone(&node));
                self.tail = Some(node);
            }
            Some(old_tail) => {
                old_tail.borrow_mut().next = Some(Rc::clone(&node));
                node.borrow_mut().prev = Some(Rc::downgrade(&old_tail));
                self.tail = Some(node);
            }
        }
    }

    fn remove(&mut self, value: i32) {
        let mut curr = self.head.clone();
        while let Some(node) = curr {
            if node.borrow().value == value {
                let prev = node.borrow().prev.clone().and_then(|w| w.upgrade());
                let next = node.borrow().next.clone();

                match &prev {
                    Some(p) => p.borrow_mut().next = next.clone(),
                    None => self.head = next.clone(),
                }
                match &next {
                    Some(n) => n.borrow_mut().prev = prev.clone().map(|p| Rc::downgrade(&p)),
                    None => self.tail = prev.clone(),
                }
                return;
            }
            curr = node.borrow().next.clone();
        }
    }

    fn print_forward(&self) {
        let mut parts = Vec::new();
        let mut curr = self.head.clone();
        while let Some(node) = curr {
            parts.push(node.borrow().value.to_string());
            curr = node.borrow().next.clone();
        }
        println!("Forward : {}", parts.join(" <-> "));
    }

    fn print_backward(&self) {
        let mut parts = Vec::new();
        let mut curr = self.tail.clone();
        while let Some(node) = curr {
            parts.push(node.borrow().value.to_string());
            curr = node.borrow().prev.clone().and_then(|w| w.upgrade());
        }
        println!("Backward: {}", parts.join(" <-> "));
    }
}

fn main() {
    let mut list = DoublyLinkedList::new();

    for v in [10, 20, 30, 40, 50] {
        list.insert(v);
    }

    println!("Initial List");
    list.print_forward();
    list.print_backward();
    println!();

    list.remove(30);

    println!("After deleting 30");
    list.print_forward();
    list.print_backward();
    println!();

    list.insert(60);

    println!("After inserting 60");
    list.print_forward();
    list.print_backward();
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. FLOYD'S CYCLE DETECTION
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Floyd's Cycle Detection",
      href: "/algorithms/linked_lists/cycle-detection",
      type: "Easy",

      about: [
        { tag: "h1", text: "Floyd's Cycle Detection (Tortoise and Hare)" },
        { tag: "p", text: "Floyd's Cycle Detection algorithm, also known as the 'Tortoise and Hare' algorithm, determines whether a linked list contains a cycle using two pointers that traverse the list at different speeds — a slow pointer advancing one node at a time, and a fast pointer advancing two nodes at a time. If a cycle exists, the fast pointer will eventually lap the slow pointer and they'll meet at the same node; if no cycle exists, the fast pointer simply reaches the end (null) first." },
        { tag: "p", text: "Its elegance is achieving O(1) auxiliary space — a hash-set-based approach (recording every visited node and checking for repeats) would also detect a cycle correctly, but at O(n) space cost. The two-pointer trick gets the same O(n) time with no extra memory at all, beyond two pointer variables." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Detecting whether a linked list has a cycle, with O(1) space being a hard requirement (otherwise a hash set is simpler to reason about)",
          "Finding the exact node where a cycle begins (a direct extension of the basic detection algorithm, using a second phase after the initial meeting point is found)",
          "Finding the middle of a linked list in a single pass — the same fast/slow pointer technique, just without the cycle-detection logic (when fast reaches the end, slow is at the midpoint)",
          "Detecting cycles in any 'next pointer'-style sequence, including the classic 'find the duplicate number' array problem, which can be modeled as a function-graph traversal with the exact same two-pointer technique"
        ]},
        { tag: "note", variant: "tip", text: "Finding the CYCLE START (not just detecting a cycle exists) requires a clever second phase: after the two pointers meet, reset one pointer to the head and advance both one step at a time — they'll meet exactly at the cycle's starting node. This relies on a specific mathematical relationship between the distances involved." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If the list is extremely short with no cycle (e.g. zero or one node), the fast pointer reaches null almost immediately, terminating the algorithm very quickly." },
          { tag: "ul", items: [
            "Empty list or single node with no self-loop: fast pointer hits null within 1-2 steps — O(1)",
            "This is a favourable-input case, not a structural guarantee for all inputs"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "For a list with no cycle, the fast pointer (moving twice as fast as slow) reaches the end in roughly n/2 steps. For a list WITH a cycle, the two pointers are guaranteed to meet within at most one full cycle length after the slow pointer enters the cycle." },
          { tag: "ul", items: [
            "No cycle: fast pointer reaches null in O(n/2) = O(n) steps",
            "With a cycle: once both pointers are inside the cycle, the fast pointer gains exactly one step of relative distance on the slow pointer per iteration, so they must meet within at most (cycle length) iterations after entering it — bounded by O(n) total"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even in the least favourable cycle configuration (e.g. a very long 'tail' before a short cycle), the total number of steps before detection remains linear in the total number of nodes." },
          { tag: "ul", items: [
            "Worst case: tail length + cycle length combined is still bounded by O(n), since both pointers traverse at most O(n) total nodes before either reaching null or meeting inside the cycle",
            "This matches the trivial lower bound: detecting a cycle (or its absence) requires examining enough nodes to be certain, which is inherently proportional to list length"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only two pointer variables (slow and fast) are needed throughout the entire algorithm, regardless of list length or cycle presence." },
          { tag: "ul", items: ["slow, fast pointers — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never grows with list length — it's always exactly two pointer variables, a stark contrast to the O(n) space a hash-set-based cycle detection approach would require." },
          { tag: "ul", items: ["No auxiliary set, array, or recursion stack — purely two traversal pointers"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even the longest possible list with the most elaborate cycle structure doesn't require any additional memory beyond the two fixed pointers." },
          { tag: "ul", items: [
            "O(1) regardless of n — this space efficiency is Floyd's primary advantage over the simpler hash-set approach, which is O(n) space but conceptually easier to verify correct"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function hasCycle(head):
    if head is null: return false

    slow ← head
    fast ← head

    while fast is not null and fast.next is not null:
        slow ← slow.next           // advance 1 step
        fast ← fast.next.next      // advance 2 steps

        if slow == fast:
            return true             // pointers met — cycle detected

    return false                    // fast reached the end — no cycle

function findCycleStart(head):
    slow ← head; fast ← head
    while fast is not null and fast.next is not null:
        slow ← slow.next
        fast ← fast.next.next
        if slow == fast:
            // Phase 2: find the entry point
            ptr ← head
            while ptr != slow:
                ptr ← ptr.next
                slow ← slow.next
            return ptr               // the cycle's starting node
    return null                      // no cycle` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise both slow and fast pointers at the head of the list.",
          "On each iteration, advance slow by one node and fast by two nodes.",
          "If fast ever reaches null (or fast.next is null, meaning it can't take its next two-step move), the list has no cycle — there's a definite end.",
          "If at any point slow and fast point to the exact same node, a cycle has been detected — they couldn't have 'crossed' each other without meeting, since fast only gains ground relative to slow one step at a time inside a cycle.",
          "(For finding the cycle's start) Once a meeting point is found, reset a new pointer to the head and advance it together with the (now-slowed-to-matching-pace) slow pointer, one step at a time — they will meet exactly at the cycle's entry node, a consequence of the specific distance relationships established by the first phase."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "If no cycle exists, fast (moving twice as fast) simply reaches the null-terminated end of the list strictly before slow could ever catch up to it — so the loop correctly terminates with no meeting. If a cycle DOES exist, once slow enters the cycle, fast is already somewhere inside it (having entered first, since it moves faster), and on every subsequent iteration, fast's distance ahead of slow (measured around the cycle) decreases by exactly 1 (fast gains 2 steps, slow gains 1, net gain of 1 per iteration) — since the cycle has finite length, this gap must reach exactly 0 within at most (cycle length) iterations, at which point the two pointers necessarily occupy the same node. The cycle-start-finding phase's correctness follows from a number-theoretic relationship: if the tail (pre-cycle) length is μ and the cycle length is λ, the meeting point is always exactly μ mod λ steps into the cycle — which means advancing a fresh pointer from the head exactly μ steps lands it at the cycle start at precisely the same time the slow pointer (continuing from the meeting point) does, by simple modular arithmetic." }
      ],
      codes: {
        "c++": `#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;

    Node(int val) {
        value = val;
        next = nullptr;
    }
};

// Insert at end
void insert(Node*& head, int value) {

    Node* curr = new Node(value);

    if (head == nullptr) {
        head = curr;
        return;
    }

    Node* tail = head;

    while (tail->next != nullptr) {
        tail = tail->next;
    }

    tail->next = curr;
}

// Print list (only use before creating cycle)
void printList(Node* head) {

    Node* curr = head;

    while (curr != nullptr) {

        cout << curr->value;

        if (curr->next != nullptr)
            cout << " -> ";

        curr = curr->next;
    }

    cout << endl;
}

// Create a cycle
void createCycle(Node* head) {

    Node* tail = head;
    Node* target = head;

    // Move target to node with value 30
    target = target->next;
    target = target->next;

    while (tail->next != nullptr) {
        tail = tail->next;
    }

    // 50 -> 30
    tail->next = target;
}

// Floyd Cycle Detection
bool hasCycle(Node* head) {

    Node* slow = head;
    Node* fast = head;

    while (fast != nullptr && fast->next != nullptr) {

        slow = slow->next;
        fast = fast->next->next;

        if (slow == fast)
            return true;
    }

    return false;
}

int main() {

    Node* head = nullptr;

    insert(head, 10);
    insert(head, 20);
    insert(head, 30);
    insert(head, 40);
    insert(head, 50);

    cout << "Original List:" << endl;
    printList(head);

    createCycle(head);

    if (hasCycle(head))
        cout << "Cycle Detected" << endl;
    else
        cout << "No Cycle Found" << endl;

    return 0;
}`,
        "python": `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


def insert(head, value):
    node = Node(value)
    if head is None:
        return node
    tail = head
    while tail.next is not None:
        tail = tail.next
    tail.next = node
    return head


def print_list(head):
    parts = []
    curr = head
    while curr is not None:
        parts.append(str(curr.value))
        curr = curr.next
    print(" -> ".join(parts))


def create_cycle(head):
    # Connect the tail back to the 3rd node (value 30), mirroring 50 -> 30
    target = head.next.next
    tail = head
    while tail.next is not None:
        tail = tail.next
    tail.next = target


def has_cycle(head):
    slow = head
    fast = head

    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        if slow is fast:
            return True

    return False


if __name__ == "__main__":
    head = None
    for v in (10, 20, 30, 40, 50):
        head = insert(head, v)

    print("Original List:")
    print_list(head)

    create_cycle(head)

    print("Cycle Detected" if has_cycle(head) else "No Cycle Found")`,
        "java": `public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    static Node insert(Node head, int value) {
        Node node = new Node(value);
        if (head == null) return node;
        Node tail = head;
        while (tail.next != null) tail = tail.next;
        tail.next = node;
        return head;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder();
        Node curr = head;
        while (curr != null) {
            sb.append(curr.value);
            if (curr.next != null) sb.append(" -> ");
            curr = curr.next;
        }
        System.out.println(sb);
    }

    static void createCycle(Node head) {
        Node target = head.next.next; // node with value 30
        Node tail = head;
        while (tail.next != null) tail = tail.next;
        tail.next = target;
    }

    static boolean hasCycle(Node head) {
        Node slow = head;
        Node fast = head;

        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }

        return false;
    }

    public static void main(String[] args) {
        Node head = null;
        for (int v : new int[]{10, 20, 30, 40, 50}) head = insert(head, v);

        System.out.println("Original List:");
        printList(head);

        createCycle(head);

        System.out.println(hasCycle(head) ? "Cycle Detected" : "No Cycle Found");
    }
}`,
        "js": `class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

function insert(head, value) {
    const node = new Node(value);
    if (head === null) return node;
    let tail = head;
    while (tail.next !== null) tail = tail.next;
    tail.next = node;
    return head;
}

function printList(head) {
    const parts = [];
    let curr = head;
    while (curr !== null) {
        parts.push(curr.value);
        curr = curr.next;
    }
    console.log(parts.join(" -> "));
}

function createCycle(head) {
    const target = head.next.next; // node with value 30
    let tail = head;
    while (tail.next !== null) tail = tail.next;
    tail.next = target;
}

function hasCycle(head) {
    let slow = head;
    let fast = head;

    while (fast !== null && fast.next !== null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow === fast) return true;
    }

    return false;
}

let head = null;
for (const v of [10, 20, 30, 40, 50]) {
    head = insert(head, v);
}

console.log("Original List:");
printList(head);

createCycle(head);

console.log(hasCycle(head) ? "Cycle Detected" : "No Cycle Found");`,
        "c": `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node* next;
} Node;

Node* insert(Node* head, int value) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->value = value;
    node->next = NULL;

    if (head == NULL) return node;

    Node* tail = head;
    while (tail->next != NULL) tail = tail->next;
    tail->next = node;
    return head;
}

void printList(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        printf("%d", curr->value);
        if (curr->next != NULL) printf(" -> ");
        curr = curr->next;
    }
    printf("\\n");
}

void createCycle(Node* head) {
    Node* target = head->next->next; // node with value 30
    Node* tail = head;
    while (tail->next != NULL) tail = tail->next;
    tail->next = target;
}

int hasCycle(Node* head) {
    Node* slow = head;
    Node* fast = head;

    while (fast != NULL && fast->next != NULL) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return 1;
    }

    return 0;
}

int main() {
    Node* head = NULL;
    int values[] = {10, 20, 30, 40, 50};
    for (int i = 0; i < 5; i++) head = insert(head, values[i]);

    printf("Original List:\\n");
    printList(head);

    createCycle(head);

    printf(hasCycle(head) ? "Cycle Detected\\n" : "No Cycle Found\\n");

    return 0;
}`,
        "c#": `using System;
using System.Text;

class Node {
    public int Value;
    public Node Next;
    public Node(int value) { Value = value; }
}

class Program {
    static Node Insert(Node head, int value) {
        Node node = new Node(value);
        if (head == null) return node;
        Node tail = head;
        while (tail.Next != null) tail = tail.Next;
        tail.Next = node;
        return head;
    }

    static void PrintList(Node head) {
        var sb = new StringBuilder();
        Node curr = head;
        while (curr != null) {
            sb.Append(curr.Value);
            if (curr.Next != null) sb.Append(" -> ");
            curr = curr.Next;
        }
        Console.WriteLine(sb.ToString());
    }

    static void CreateCycle(Node head) {
        Node target = head.Next.Next; // node with value 30
        Node tail = head;
        while (tail.Next != null) tail = tail.Next;
        tail.Next = target;
    }

    static bool HasCycle(Node head) {
        Node slow = head;
        Node fast = head;

        while (fast != null && fast.Next != null) {
            slow = slow.Next;
            fast = fast.Next.Next;
            if (slow == fast) return true;
        }

        return false;
    }

    static void Main() {
        Node head = null;
        foreach (int v in new int[] { 10, 20, 30, 40, 50 }) head = Insert(head, v);

        Console.WriteLine("Original List:");
        PrintList(head);

        CreateCycle(head);

        Console.WriteLine(HasCycle(head) ? "Cycle Detected" : "No Cycle Found");
    }
}`,
        "swift": `class Node {
    var value: Int
    var next: Node?
    init(_ value: Int) { self.value = value }
}

func insert(_ head: Node?, _ value: Int) -> Node {
    let node = Node(value)
    guard let head = head else { return node }
    var tail = head
    while let next = tail.next { tail = next }
    tail.next = node
    return head
}

func printList(_ head: Node?) {
    var parts: [String] = []
    var curr = head
    while let node = curr {
        parts.append(String(node.value))
        curr = node.next
    }
    print(parts.joined(separator: " -> "))
}

func createCycle(_ head: Node) {
    let target = head.next!.next! // node with value 30
    var tail = head
    while let next = tail.next { tail = next }
    tail.next = target
}

func hasCycle(_ head: Node?) -> Bool {
    var slow = head
    var fast = head

    while fast != nil && fast?.next != nil {
        slow = slow?.next
        fast = fast?.next?.next
        if slow === fast { return true }
    }

    return false
}

var head: Node? = nil
for v in [10, 20, 30, 40, 50] {
    head = insert(head, v)
}

print("Original List:")
printList(head)

createCycle(head!)

print(hasCycle(head) ? "Cycle Detected" : "No Cycle Found")`,
        "kotlin": `class Node(val value: Int) {
    var next: Node? = null
}

fun insert(head: Node?, value: Int): Node {
    val node = Node(value)
    if (head == null) return node
    var tail = head
    while (tail.next != null) tail = tail.next!!
    tail.next = node
    return head
}

fun printList(head: Node?) {
    val parts = mutableListOf<String>()
    var curr = head
    while (curr != null) {
        parts.add(curr.value.toString())
        curr = curr.next
    }
    println(parts.joinToString(" -> "))
}

fun createCycle(head: Node) {
    val target = head.next!!.next!! // node with value 30
    var tail = head
    while (tail.next != null) tail = tail.next!!
    tail.next = target
}

fun hasCycle(head: Node?): Boolean {
    var slow = head
    var fast = head

    while (fast != null && fast.next != null) {
        slow = slow!!.next
        fast = fast.next!!.next
        if (slow === fast) return true
    }

    return false
}

fun main() {
    var head: Node? = null
    for (v in listOf(10, 20, 30, 40, 50)) {
        head = insert(head, v)
    }

    println("Original List:")
    printList(head)

    createCycle(head!!)

    println(if (hasCycle(head)) "Cycle Detected" else "No Cycle Found")
}`,
        "scala": `class Node(val value: Int) {
  var next: Node = _
}

object Main extends App {
  def insert(head: Node, value: Int): Node = {
    val node = new Node(value)
    if (head == null) return node
    var tail = head
    while (tail.next != null) tail = tail.next
    tail.next = node
    head
  }

  def printList(head: Node): Unit = {
    val parts = scala.collection.mutable.ListBuffer[String]()
    var curr = head
    while (curr != null) {
      parts += curr.value.toString
      curr = curr.next
    }
    println(parts.mkString(" -> "))
  }

  def createCycle(head: Node): Unit = {
    val target = head.next.next // node with value 30
    var tail = head
    while (tail.next != null) tail = tail.next
    tail.next = target
  }

  def hasCycle(head: Node): Boolean = {
    var slow = head
    var fast = head

    while (fast != null && fast.next != null) {
      slow = slow.next
      fast = fast.next.next
      if (slow eq fast) return true
    }

    false
  }

  var head: Node = null
  for (v <- List(10, 20, 30, 40, 50)) {
    head = insert(head, v)
  }

  println("Original List:")
  printList(head)

  createCycle(head)

  println(if (hasCycle(head)) "Cycle Detected" else "No Cycle Found")
}`,
        "go": `package main

import "fmt"

type Node struct {
	value int
	next  *Node
}

func insert(head *Node, value int) *Node {
	node := &Node{value: value}
	if head == nil {
		return node
	}
	tail := head
	for tail.next != nil {
		tail = tail.next
	}
	tail.next = node
	return head
}

func printList(head *Node) {
	curr := head
	first := true
	for curr != nil {
		if !first {
			fmt.Print(" -> ")
		}
		fmt.Print(curr.value)
		first = false
		curr = curr.next
	}
	fmt.Println()
}

func createCycle(head *Node) {
	target := head.next.next // node with value 30
	tail := head
	for tail.next != nil {
		tail = tail.next
	}
	tail.next = target
}

func hasCycle(head *Node) bool {
	slow, fast := head, head

	for fast != nil && fast.next != nil {
		slow = slow.next
		fast = fast.next.next
		if slow == fast {
			return true
		}
	}

	return false
}

func main() {
	var head *Node
	for _, v := range []int{10, 20, 30, 40, 50} {
		head = insert(head, v)
	}

	fmt.Println("Original List:")
	printList(head)

	createCycle(head)

	if hasCycle(head) {
		fmt.Println("Cycle Detected")
	} else {
		fmt.Println("No Cycle Found")
	}
}`,
        "rust": `use std::cell::RefCell;
use std::rc::Rc;

// A genuine cycle (a node reachable from itself) cannot be expressed with
// Box<Node> — ownership would never bottom out. Rc<RefCell<Node>> allows
// multiple owners, which is what lets the tail's "next" and an interior
// node be the same allocation, exactly like the intentionally-cyclic
// structure createCycle() builds in every other language here.
struct Node {
    value: i32,
    next: Option<Rc<RefCell<Node>>>,
}

type NodeRef = Rc<RefCell<Node>>;

fn insert(head: Option<NodeRef>, value: i32) -> NodeRef {
    let node = Rc::new(RefCell::new(Node { value, next: None }));
    match head {
        None => node,
        Some(h) => {
            let mut tail = Rc::clone(&h);
            loop {
                let next = tail.borrow().next.clone();
                match next {
                    Some(n) => tail = n,
                    None => break,
                }
            }
            tail.borrow_mut().next = Some(Rc::clone(&node));
            h
        }
    }
}

fn print_list(head: &NodeRef) {
    let mut parts = Vec::new();
    let mut curr = Some(Rc::clone(head));
    while let Some(node) = curr {
        parts.push(node.borrow().value.to_string());
        curr = node.borrow().next.clone();
    }
    println!("{}", parts.join(" -> "));
}

fn create_cycle(head: &NodeRef) {
    // Target = node with value 30 (3rd node): head -> next -> next
    let target = {
        let first_next = head.borrow().next.clone().unwrap();
        let second_next = first_next.borrow().next.clone().unwrap();
        second_next
    };

    let mut tail = Rc::clone(head);
    loop {
        let next = tail.borrow().next.clone();
        match next {
            Some(n) => tail = n,
            None => break,
        }
    }
    tail.borrow_mut().next = Some(target);
}

fn has_cycle(head: &NodeRef) -> bool {
    let mut slow = Rc::clone(head);
    let mut fast = Rc::clone(head);

    loop {
        let fast_next = fast.borrow().next.clone();
        let fast_next = match fast_next {
            Some(n) => n,
            None => return false,
        };
        let fast_next_next = fast_next.borrow().next.clone();
        let fast_next_next = match fast_next_next {
            Some(n) => n,
            None => return false,
        };

        slow = { let n = slow.borrow().next.clone().unwrap(); n };
        fast = fast_next_next;

        if Rc::ptr_eq(&slow, &fast) {
            return true;
        }
    }
}

fn main() {
    let mut head: Option<NodeRef> = None;
    for v in [10, 20, 30, 40, 50] {
        head = Some(insert(head, v));
    }
    let head = head.unwrap();

    println!("Original List:");
    print_list(&head);

    create_cycle(&head);

    println!("{}", if has_cycle(&head) { "Cycle Detected" } else { "No Cycle Found" });
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       5. MERGE SORTED LISTS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Merge Sorted Lists",
      href: "/algorithms/linked_lists/merge",
      type: "Easy",

      about: [
        { tag: "h1", text: "Merge Sorted Lists" },
        { tag: "p", text: "Given two (or more) already-sorted linked lists, merging combines them into a single sorted linked list, in-place, by repeatedly comparing the front nodes of each list and splicing the smaller one onto the result — without ever allocating a new node, only rewiring existing next pointers." },
        { tag: "p", text: "This is exactly the merge step from Merge Sort, but adapted to linked lists' pointer-rewiring nature instead of arrays' index-copying nature — and it's actually SIMPLER on a linked list, since there's no need for a separate auxiliary buffer the way array-based merging requires; nodes are just relinked directly into their final positions." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Merging two sorted linked lists into one (a direct interview-style problem)",
          "As the merge step in an external sort or in Merge Sort adapted specifically for linked lists, where the simplicity of pointer relinking (vs. array buffer copying) is a genuine implementation advantage",
          "Merging K sorted lists (extends this pairwise merge using a divide-and-conquer or priority-queue approach across multiple lists)",
          "Any 'combine multiple already-ordered streams into one ordered stream' problem, including streaming/iterator-based merge patterns in real systems"
        ]},
        { tag: "note", variant: "tip", text: "Using a dummy/sentinel head node for the result list eliminates the special case of 'what is the very first node of the merged result' — you simply return dummy.next at the end, regardless of which input list contributed the actual first node." }
      ],

      timeComplexityCalculation: {
        notation: "O(n + m)",
        best: [
          { tag: "h2", text: "Best Case — O(min(n, m))" },
          { tag: "p", text: "If one list is entirely smaller than every element of the other (e.g. list A's largest value is still less than list B's smallest value), the merge can finish scanning list A quickly and then attach the entirety of list B in O(1) — though the overall classification still depends on which list is shorter." },
          { tag: "ul", items: [
            "If every element of the shorter list (length min(n,m)) is smaller than the first element of the longer list, the comparison loop only runs min(n,m) times before the remaining longer list is spliced on directly: O(min(n, m))",
            "This is a favourable-input case; correctness for the general algorithm still requires the full O(n+m) classification below"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n + m)" },
          { tag: "p", text: "For interleaved sorted values, the comparison loop must process nodes from both lists roughly proportionally, until one list is exhausted, after which the remainder of the other is spliced on directly." },
          { tag: "ul", items: [
            "Each node from both lists is examined and relinked exactly once across the whole merge: O(n + m) total",
            "Each comparison/relink step is O(1)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n + m)" },
          { tag: "p", text: "The worst case — values perfectly interleaved between the two lists (alternating which list contributes the smaller value at every step) — still results in exactly n + m total node visits, since merging always processes every node exactly once regardless of interleaving pattern." },
          { tag: "ul", items: [
            "Worst case matches the typical case: O(n + m), since every node from both lists must be visited and relinked exactly once for a correct merge",
            "This matches the trivial lower bound: a correct merge of n + m total elements must examine every element at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "The merge operates entirely by relinking existing nodes' next pointers — no new nodes are ever allocated, only a few pointer variables to track the current position in each list and the result." },
          { tag: "ul", items: ["dummy/result tail pointer, plus pointers into each input list — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on the number of nodes being merged — it's always exactly a fixed handful of pointer variables, regardless of how the values interleave." },
          { tag: "ul", items: ["No auxiliary array or new node allocation, unlike array-based Merge Sort's O(n) auxiliary buffer requirement"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No interleaving pattern or list length increases memory usage beyond the fixed set of tracking pointers — this is a genuine structural advantage of linked-list merging over array-based merging." },
          { tag: "ul", items: [
            "O(1) regardless of n and m — a key reason linked-list-based merge sort variants are sometimes preferred when O(1) auxiliary space (beyond recursion stack) is a hard requirement",
            "(Recursive implementations add O(n + m) call-stack depth in the worst case; the iterative version shown here avoids this entirely)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function mergeTwoLists(l1, l2):
    dummy ← new Node(0)            // sentinel, simplifies head handling
    tail ← dummy

    while l1 is not null and l2 is not null:
        if l1.value <= l2.value:
            tail.next ← l1
            l1 ← l1.next
        else:
            tail.next ← l2
            l2 ← l2.next
        tail ← tail.next

    // Attach whichever list still has remaining nodes
    tail.next ← l1 if l1 is not null else l2

    return dummy.next               // skip the sentinel` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Create a dummy sentinel node to serve as a placeholder 'before the start' of the merged result — this avoids needing a separate special case for setting the very first node of the output.",
          "Maintain a 'tail' pointer at the end of the merged-so-far result, always pointing at the dummy node initially.",
          "While both input lists still have remaining nodes, compare their current front values and splice the smaller one onto the result's tail, then advance that input list's pointer past the node just used.",
          "Advance the result's tail pointer to the node that was just attached.",
          "Once one of the two input lists is exhausted, the other input list is already entirely sorted and entirely greater than (or equal to) everything merged so far — so it can be attached directly to the tail in one O(1) step, with no further comparisons needed.",
          "Return dummy.next, which correctly points to the actual first node of the merged result (skipping over the sentinel itself)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at every point during the merge, everything already attached to the result (from dummy.next up to tail) is correctly sorted, and represents exactly the smallest (length-so-far) elements available from the combination of l1 and l2's REMAINING (not-yet-merged) portions. Each loop iteration correctly extends this invariant by one element: comparing the current fronts of both remaining sorted sub-lists and choosing the smaller one is guaranteed to produce the next-smallest element overall, since both sub-lists are individually sorted (so neither sub-list's later elements could be smaller than its own current front). Once one list is exhausted, every remaining node in the other list is, by its own sortedness, guaranteed to be ≥ everything already merged — so attaching it directly preserves the sorted invariant without needing further comparison." }
      ],
      codes: {
        "c++": `#include <iostream>
using namespace std;

struct Node {
    int value;
    Node* next;

    Node(int val) {
        value = val;
        next = nullptr;
    }
};

// Insert at end
void insert(Node*& head, int value) {

    Node* curr = new Node(value);

    if (head == nullptr) {
        head = curr;
        return;
    }

    Node* tail = head;

    while (tail->next != nullptr) {
        tail = tail->next;
    }

    tail->next = curr;
}

// Print linked list
void printList(Node* head) {

    Node* curr = head;

    while (curr != nullptr) {

        cout << curr->value;

        if (curr->next != nullptr)
            cout << " -> ";

        curr = curr->next;
    }

    cout << endl;
}

// Merge two sorted linked lists
Node* mergeLists(Node* head1, Node* head2) {

    Node dummy(0);
    Node* curr = &dummy;

    while (head1 != nullptr && head2 != nullptr) {

        if (head1->value <= head2->value) {
            curr->next = head1;
            head1 = head1->next;
        }
        else {
            curr->next = head2;
            head2 = head2->next;
        }

        curr = curr->next;
    }

    if (head1 != nullptr)
        curr->next = head1;
    else
        curr->next = head2;

    Node* head = dummy.next;

    return head;
}

int main() {

    Node* head1 = nullptr;
    Node* head2 = nullptr;

    insert(head1, 1);
    insert(head1, 3);
    insert(head1, 5);
    insert(head1, 7);

    insert(head2, 2);
    insert(head2, 4);
    insert(head2, 6);
    insert(head2, 8);

    cout << "List 1:" << endl;
    printList(head1);

    cout << "List 2:" << endl;
    printList(head2);

    Node* head = mergeLists(head1, head2);

    cout << "Merged List:" << endl;
    printList(head);

    return 0;
}`,
        "python": `class Node:
    def __init__(self, value):
        self.value = value
        self.next = None


def insert(head, value):
    node = Node(value)
    if head is None:
        return node
    tail = head
    while tail.next is not None:
        tail = tail.next
    tail.next = node
    return head


def print_list(head):
    parts = []
    curr = head
    while curr is not None:
        parts.append(str(curr.value))
        curr = curr.next
    print(" -> ".join(parts))


def merge_lists(head1, head2):
    dummy = Node(0)
    curr = dummy

    while head1 is not None and head2 is not None:
        if head1.value <= head2.value:
            curr.next = head1
            head1 = head1.next
        else:
            curr.next = head2
            head2 = head2.next
        curr = curr.next

    curr.next = head1 if head1 is not None else head2

    return dummy.next


if __name__ == "__main__":
    head1 = None
    for v in (1, 3, 5, 7):
        head1 = insert(head1, v)

    head2 = None
    for v in (2, 4, 6, 8):
        head2 = insert(head2, v)

    print("List 1:")
    print_list(head1)

    print("List 2:")
    print_list(head2)

    merged = merge_lists(head1, head2)

    print("Merged List:")
    print_list(merged)`,
        "java": `public class Main {
    static class Node {
        int value;
        Node next;
        Node(int value) { this.value = value; }
    }

    static Node insert(Node head, int value) {
        Node node = new Node(value);
        if (head == null) return node;
        Node tail = head;
        while (tail.next != null) tail = tail.next;
        tail.next = node;
        return head;
    }

    static void printList(Node head) {
        StringBuilder sb = new StringBuilder();
        Node curr = head;
        while (curr != null) {
            sb.append(curr.value);
            if (curr.next != null) sb.append(" -> ");
            curr = curr.next;
        }
        System.out.println(sb);
    }

    static Node mergeLists(Node head1, Node head2) {
        Node dummy = new Node(0);
        Node curr = dummy;

        while (head1 != null && head2 != null) {
            if (head1.value <= head2.value) {
                curr.next = head1;
                head1 = head1.next;
            } else {
                curr.next = head2;
                head2 = head2.next;
            }
            curr = curr.next;
        }

        curr.next = (head1 != null) ? head1 : head2;

        return dummy.next;
    }

    public static void main(String[] args) {
        Node head1 = null;
        for (int v : new int[]{1, 3, 5, 7}) head1 = insert(head1, v);

        Node head2 = null;
        for (int v : new int[]{2, 4, 6, 8}) head2 = insert(head2, v);

        System.out.println("List 1:");
        printList(head1);

        System.out.println("List 2:");
        printList(head2);

        Node merged = mergeLists(head1, head2);

        System.out.println("Merged List:");
        printList(merged);
    }
}`,
        "js": `class Node {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

function insert(head, value) {
    const node = new Node(value);
    if (head === null) return node;
    let tail = head;
    while (tail.next !== null) tail = tail.next;
    tail.next = node;
    return head;
}

function printList(head) {
    const parts = [];
    let curr = head;
    while (curr !== null) {
        parts.push(curr.value);
        curr = curr.next;
    }
    console.log(parts.join(" -> "));
}

function mergeLists(head1, head2) {
    const dummy = new Node(0);
    let curr = dummy;

    while (head1 !== null && head2 !== null) {
        if (head1.value <= head2.value) {
            curr.next = head1;
            head1 = head1.next;
        } else {
            curr.next = head2;
            head2 = head2.next;
        }
        curr = curr.next;
    }

    curr.next = head1 !== null ? head1 : head2;

    return dummy.next;
}

let head1 = null;
for (const v of [1, 3, 5, 7]) head1 = insert(head1, v);

let head2 = null;
for (const v of [2, 4, 6, 8]) head2 = insert(head2, v);

console.log("List 1:");
printList(head1);

console.log("List 2:");
printList(head2);

const merged = mergeLists(head1, head2);

console.log("Merged List:");
printList(merged);`,
        "c": `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int value;
    struct Node* next;
} Node;

Node* insert(Node* head, int value) {
    Node* node = (Node*)malloc(sizeof(Node));
    node->value = value;
    node->next = NULL;

    if (head == NULL) return node;

    Node* tail = head;
    while (tail->next != NULL) tail = tail->next;
    tail->next = node;
    return head;
}

void printList(Node* head) {
    Node* curr = head;
    while (curr != NULL) {
        printf("%d", curr->value);
        if (curr->next != NULL) printf(" -> ");
        curr = curr->next;
    }
    printf("\\n");
}

Node* mergeLists(Node* head1, Node* head2) {
    Node dummy;
    dummy.next = NULL;
    Node* curr = &dummy;

    while (head1 != NULL && head2 != NULL) {
        if (head1->value <= head2->value) {
            curr->next = head1;
            head1 = head1->next;
        } else {
            curr->next = head2;
            head2 = head2->next;
        }
        curr = curr->next;
    }

    curr->next = (head1 != NULL) ? head1 : head2;

    return dummy.next;
}

int main() {
    Node* head1 = NULL;
    int values1[] = {1, 3, 5, 7};
    for (int i = 0; i < 4; i++) head1 = insert(head1, values1[i]);

    Node* head2 = NULL;
    int values2[] = {2, 4, 6, 8};
    for (int i = 0; i < 4; i++) head2 = insert(head2, values2[i]);

    printf("List 1:\\n");
    printList(head1);

    printf("List 2:\\n");
    printList(head2);

    Node* merged = mergeLists(head1, head2);

    printf("Merged List:\\n");
    printList(merged);

    return 0;
}`,
        "c#": `using System;
using System.Text;

class Node {
    public int Value;
    public Node Next;
    public Node(int value) { Value = value; }
}

class Program {
    static Node Insert(Node head, int value) {
        Node node = new Node(value);
        if (head == null) return node;
        Node tail = head;
        while (tail.Next != null) tail = tail.Next;
        tail.Next = node;
        return head;
    }

    static void PrintList(Node head) {
        var sb = new StringBuilder();
        Node curr = head;
        while (curr != null) {
            sb.Append(curr.Value);
            if (curr.Next != null) sb.Append(" -> ");
            curr = curr.Next;
        }
        Console.WriteLine(sb.ToString());
    }

    static Node MergeLists(Node head1, Node head2) {
        Node dummy = new Node(0);
        Node curr = dummy;

        while (head1 != null && head2 != null) {
            if (head1.Value <= head2.Value) {
                curr.Next = head1;
                head1 = head1.Next;
            } else {
                curr.Next = head2;
                head2 = head2.Next;
            }
            curr = curr.Next;
        }

        curr.Next = (head1 != null) ? head1 : head2;

        return dummy.Next;
    }

    static void Main() {
        Node head1 = null;
        foreach (int v in new int[] { 1, 3, 5, 7 }) head1 = Insert(head1, v);

        Node head2 = null;
        foreach (int v in new int[] { 2, 4, 6, 8 }) head2 = Insert(head2, v);

        Console.WriteLine("List 1:");
        PrintList(head1);

        Console.WriteLine("List 2:");
        PrintList(head2);

        Node merged = MergeLists(head1, head2);

        Console.WriteLine("Merged List:");
        PrintList(merged);
    }
}`,
        "swift": `class Node {
    var value: Int
    var next: Node?
    init(_ value: Int) { self.value = value }
}

func insert(_ head: Node?, _ value: Int) -> Node {
    let node = Node(value)
    guard let head = head else { return node }
    var tail = head
    while let next = tail.next { tail = next }
    tail.next = node
    return head
}

func printList(_ head: Node?) {
    var parts: [String] = []
    var curr = head
    while let node = curr {
        parts.append(String(node.value))
        curr = node.next
    }
    print(parts.joined(separator: " -> "))
}

func mergeLists(_ head1: Node?, _ head2: Node?) -> Node? {
    let dummy = Node(0)
    var curr = dummy
    var l1 = head1
    var l2 = head2

    while let n1 = l1, let n2 = l2 {
        if n1.value <= n2.value {
            curr.next = n1
            l1 = n1.next
        } else {
            curr.next = n2
            l2 = n2.next
        }
        curr = curr.next!
    }

    curr.next = (l1 != nil) ? l1 : l2

    return dummy.next
}

var head1: Node? = nil
for v in [1, 3, 5, 7] { head1 = insert(head1, v) }

var head2: Node? = nil
for v in [2, 4, 6, 8] { head2 = insert(head2, v) }

print("List 1:")
printList(head1)

print("List 2:")
printList(head2)

let merged = mergeLists(head1, head2)

print("Merged List:")
printList(merged)`,
        "kotlin": `class Node(val value: Int) {
    var next: Node? = null
}

fun insert(head: Node?, value: Int): Node {
    val node = Node(value)
    if (head == null) return node
    var tail = head
    while (tail.next != null) tail = tail.next!!
    tail.next = node
    return head
}

fun printList(head: Node?) {
    val parts = mutableListOf<String>()
    var curr = head
    while (curr != null) {
        parts.add(curr.value.toString())
        curr = curr.next
    }
    println(parts.joinToString(" -> "))
}

fun mergeLists(head1: Node?, head2: Node?): Node? {
    val dummy = Node(0)
    var curr = dummy
    var l1 = head1
    var l2 = head2

    while (l1 != null && l2 != null) {
        if (l1.value <= l2.value) {
            curr.next = l1
            l1 = l1.next
        } else {
            curr.next = l2
            l2 = l2.next
        }
        curr = curr.next!!
    }

    curr.next = l1 ?: l2

    return dummy.next
}

fun main() {
    var head1: Node? = null
    for (v in listOf(1, 3, 5, 7)) head1 = insert(head1, v)

    var head2: Node? = null
    for (v in listOf(2, 4, 6, 8)) head2 = insert(head2, v)

    println("List 1:")
    printList(head1)

    println("List 2:")
    printList(head2)

    val merged = mergeLists(head1, head2)

    println("Merged List:")
    printList(merged)
}`,
        "scala": `class Node(val value: Int) {
  var next: Node = _
}

object Main extends App {
  def insert(head: Node, value: Int): Node = {
    val node = new Node(value)
    if (head == null) return node
    var tail = head
    while (tail.next != null) tail = tail.next
    tail.next = node
    head
  }

  def printList(head: Node): Unit = {
    val parts = scala.collection.mutable.ListBuffer[String]()
    var curr = head
    while (curr != null) {
      parts += curr.value.toString
      curr = curr.next
    }
    println(parts.mkString(" -> "))
  }

  def mergeLists(head1: Node, head2: Node): Node = {
    val dummy = new Node(0)
    var curr = dummy
    var l1 = head1
    var l2 = head2

    while (l1 != null && l2 != null) {
      if (l1.value <= l2.value) {
        curr.next = l1
        l1 = l1.next
      } else {
        curr.next = l2
        l2 = l2.next
      }
      curr = curr.next
    }

    curr.next = if (l1 != null) l1 else l2

    dummy.next
  }

  var head1: Node = null
  for (v <- List(1, 3, 5, 7)) head1 = insert(head1, v)

  var head2: Node = null
  for (v <- List(2, 4, 6, 8)) head2 = insert(head2, v)

  println("List 1:")
  printList(head1)

  println("List 2:")
  printList(head2)

  val merged = mergeLists(head1, head2)

  println("Merged List:")
  printList(merged)
}`,
        "go": `package main

import "fmt"

type Node struct {
	value int
	next  *Node
}

func insert(head *Node, value int) *Node {
	node := &Node{value: value}
	if head == nil {
		return node
	}
	tail := head
	for tail.next != nil {
		tail = tail.next
	}
	tail.next = node
	return head
}

func printList(head *Node) {
	curr := head
	first := true
	for curr != nil {
		if !first {
			fmt.Print(" -> ")
		}
		fmt.Print(curr.value)
		first = false
		curr = curr.next
	}
	fmt.Println()
}

func mergeLists(head1, head2 *Node) *Node {
	dummy := &Node{}
	curr := dummy
	l1, l2 := head1, head2

	for l1 != nil && l2 != nil {
		if l1.value <= l2.value {
			curr.next = l1
			l1 = l1.next
		} else {
			curr.next = l2
			l2 = l2.next
		}
		curr = curr.next
	}

	if l1 != nil {
		curr.next = l1
	} else {
		curr.next = l2
	}

	return dummy.next
}

func main() {
	var head1 *Node
	for _, v := range []int{1, 3, 5, 7} {
		head1 = insert(head1, v)
	}

	var head2 *Node
	for _, v := range []int{2, 4, 6, 8} {
		head2 = insert(head2, v)
	}

	fmt.Println("List 1:")
	printList(head1)

	fmt.Println("List 2:")
	printList(head2)

	merged := mergeLists(head1, head2)

	fmt.Println("Merged List:")
	printList(merged)
}`,
        "rust": `// A single, non-cyclic owner chain, exactly like Reverse Linked List — Box<Node>
// is sufficient here since merging only ever re-links "next" pointers forward
// and never needs two references to the same node alive at once.
struct Node {
    value: i32,
    next: Option<Box<Node>>,
}

fn insert(head: Option<Box<Node>>, value: i32) -> Option<Box<Node>> {
    match head {
        None => Some(Box::new(Node { value, next: None })),
        Some(mut node) => {
            node.next = insert(node.next.take(), value);
            Some(node)
        }
    }
}

fn print_list(head: &Option<Box<Node>>) {
    let mut parts = Vec::new();
    let mut curr = head;
    while let Some(node) = curr {
        parts.push(node.value.to_string());
        curr = &node.next;
    }
    println!("{}", parts.join(" -> "));
}

fn merge_lists(mut l1: Option<Box<Node>>, mut l2: Option<Box<Node>>) -> Option<Box<Node>> {
    let mut dummy = Box::new(Node { value: 0, next: None });
    let mut tail: &mut Box<Node> = &mut dummy;

    loop {
        match (l1.take(), l2.take()) {
            (Some(n1), Some(n2)) => {
                if n1.value <= n2.value {
                    l2 = Some(n2);
                    l1 = n1.next.take().map(|rest| {
                        let mut boxed = n1;
                        boxed.next = None;
                        tail.next = Some(boxed);
                        rest
                    }).or_else(|| {
                        tail.next = Some(n1);
                        None
                    });
                } else {
                    l1 = Some(n1);
                    l2 = n2.next.take().map(|rest| {
                        let mut boxed = n2;
                        boxed.next = None;
                        tail.next = Some(boxed);
                        rest
                    }).or_else(|| {
                        tail.next = Some(n2);
                        None
                    });
                }
                tail = tail.next.as_mut().unwrap();
            }
            (Some(n1), None) => {
                tail.next = Some(n1);
                break;
            }
            (None, Some(n2)) => {
                tail.next = Some(n2);
                break;
            }
            (None, None) => break,
        }
    }

    dummy.next
}

fn main() {
    let mut head1: Option<Box<Node>> = None;
    for v in [1, 3, 5, 7] {
        head1 = insert(head1, v);
    }

    let mut head2: Option<Box<Node>> = None;
    for v in [2, 4, 6, 8] {
        head2 = insert(head2, v);
    }

    println!("List 1:");
    print_list(&head1);

    println!("List 2:");
    print_list(&head2);

    let merged = merge_lists(head1, head2);

    println!("Merged List:");
    print_list(&merged);
}`
      }
    }

  ],
  desc: "Reversal, cycle detection, merge, Floyd's",
  complexity: "O(n)",
  featured: true
};

export default LINKED_LISTS_SECTION
