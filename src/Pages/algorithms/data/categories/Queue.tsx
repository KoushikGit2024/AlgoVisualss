const QUEUES_SECTION = {
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
            <line x1="4" y1="30" x2="12" y2="30" stroke="#34D399" strokeDasharray="2 2"/>
        </svg>
    ),

    about: [
        { tag: "h1", text: "Queues" },
        { tag: "p", text: "A queue is a First-In-First-Out (FIFO) structure: elements are added at the back (enqueue) and removed from the front (dequeue), both ideally O(1). Where a stack models 'handle the most recent thing first', a queue models 'handle things in the order they arrived' — which is exactly why queues are the engine behind BFS traversal, task scheduling, and any system processing requests in arrival order." },
        { tag: "p", text: "A naive array-based queue (shifting every element left after a dequeue) costs O(n) per dequeue — the entire engineering challenge of queue implementations is avoiding that shift. The two standard solutions are a circular buffer (wrap indices around using modulo arithmetic instead of shifting) or a linked list (drop the front node directly, no shifting needed at all)." },
        { tag: "h2", text: "Queue variants in this section" },
        { tag: "table",
            headers: ["Variant", "Adds Capability", "Typical Use"],
            rows: [
                ["Plain Queue", "FIFO enqueue/dequeue", "BFS, task scheduling, producer-consumer buffering"],
                ["Circular Queue", "Fixed-capacity buffer reusing freed slots via wraparound", "Ring buffers, streaming data, OS-level I/O buffers"],
                ["Deque (Double-ended Queue)", "O(1) insertion/removal at BOTH ends", "Sliding window problems, undo/redo with both-direction access"],
                ["Monotonic Deque", "Deque kept in sorted order to track a window's max/min", "Sliding Window Maximum, and the queue-based cousin of the monotonic stack pattern"]
            ]
        },
        { tag: "note", variant: "tip", text: "Whenever a problem mentions 'sliding window' alongside 'maximum' or 'minimum', that combination is the strongest signal in this whole topic area for a monotonic deque — it solves what looks like it needs a heap in O(n) instead of O(n log n)." }
    ],

    items: [

        /* ════════════════════════════════════════════════════════════════════
           1. QUEUE IMPLEMENTATION
        ════════════════════════════════════════════════════════════════════ */
        {
            name: "Queue Implementation",
            href: "/algorithms/queues/implementation",
            type: "Easy",

            about: [
                { tag: "h1", text: "Queue Implementation" },
                { tag: "p", text: "Implementing a queue from scratch means providing O(1) enqueue and O(1) dequeue without resorting to the naive 'shift every remaining element after removing the front' approach, which costs O(n) per dequeue on a plain array. Two genuinely O(1) approaches exist: a linked-list-backed queue (track head and tail pointers directly) and an array-backed circular buffer (track head/tail indices with modulo wraparound, covered in its own entry below)." },
                { tag: "p", text: "The linked-list approach is conceptually the simplest: maintain a pointer to both the front (head) and back (tail) of a singly linked list. Enqueue appends a new node after tail and updates tail; dequeue removes the node at head and updates head — neither operation ever touches any other node, which is exactly what makes both O(1)." },
                { tag: "h2", text: "When to reach for it" },
                { tag: "ul", items: [
                    "Implementing the queue ADT from primitives when your language's standard library doesn't expose one directly, or when you need to understand exactly how it works for an interview",
                    "Choosing between linked-list-backed (unbounded, slightly more memory overhead per element) vs. array-backed circular buffer (bounded capacity, better cache locality and lower per-element overhead)",
                    "As the literal data structure used to implement BFS on graphs and trees",
                    "Producer-consumer pipelines and task scheduling systems, where FIFO ordering directly models real-world arrival order"
                ]},
                { tag: "note", variant: "warning", text: "Implementing a queue with TWO STACKS is a classic interview variant: push everything onto an 'inbox' stack, and when a dequeue is needed, transfer everything to an 'outbox' stack (reversing order) if the outbox is empty, then pop from the outbox. Each individual element migrates between stacks at most once, giving amortised O(1) per operation despite occasional O(n) transfer pauses." }
            ],

            timeComplexityCalculation: {
                notation: "O(1)",
                best: [
                    { tag: "h2", text: "Best Case — O(1)" },
                    { tag: "p", text: "Both enqueue and dequeue on a properly implemented (linked-list or circular-buffer) queue perform a fixed, constant number of pointer/index updates regardless of how many elements are currently in the queue." },
                    { tag: "ul", items: [
                        "Enqueue: create/place a new node at the tail, update the tail pointer — O(1)",
                        "Dequeue: read the head node's value, advance the head pointer — O(1)"
                    ]}
                ],
                average: [
                    { tag: "h2", text: "Average Case — O(1)" },
                    { tag: "p", text: "Every enqueue and dequeue performs the same fixed amount of work regardless of queue size or the specific values stored, since neither operation needs to examine or touch any element other than the one at the relevant end." },
                    { tag: "ul", items: ["No value-dependent branching changes either operation's cost — both remain strictly O(1) for any queue size"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case — O(1)" },
                    { tag: "p", text: "No sequence of enqueue/dequeue operations or queue size increases either operation's cost beyond the fixed constant — this is one of the structurally simplest data structures with genuinely uniform O(1) behaviour, given a correct implementation." },
                    { tag: "ul", items: [
                        "Both operations: O(1), identical across all cases for a correctly implemented linked-list or circular-buffer queue",
                        "The naive shifting-array approach is the only common implementation that fails this bound, with O(n) dequeue — always avoid it in production code"
                    ]}
                ]
            },

            spaceComplexityCalculation: {
                notation: "O(n)",
                best: [
                    { tag: "h2", text: "Best Case Space — O(n)" },
                    { tag: "p", text: "Storing n elements requires O(n) space for the element data itself, plus a small constant overhead for tracking head/tail pointers or indices." },
                    { tag: "ul", items: ["n elements: O(n)", "head, tail tracking: O(1) additional"] }
                ],
                average: [
                    { tag: "h2", text: "Average Case Space — O(n)" },
                    { tag: "p", text: "Space usage is fixed by the number of currently-stored elements alone, regardless of the history of enqueue/dequeue operations that led to the current state." },
                    { tag: "ul", items: ["Same O(n) bound regardless of operation history or element values"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case Space — O(n)" },
                    { tag: "p", text: "No operation sequence increases per-element overhead beyond the fixed node/slot structure — space scales linearly and predictably with the current element count." },
                    { tag: "ul", items: ["O(n) total, where n is the current number of elements in the queue at any given time"] }
                ]
            },

            pseudoCodeandStepexplanation: [
                { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
                { tag: "p", text: "Linked-list-backed implementation:" },
                { tag: "code", language: "text", text:
`class Queue:
    head ← null
    tail ← null
    size ← 0

    function enqueue(value):
        newNode ← new Node(value)
        if tail is null:
            head ← newNode
            tail ← newNode
        else:
            tail.next ← newNode
            tail ← newNode
        size ← size + 1

    function dequeue():
        if head is null:
            return EMPTY_ERROR
        value ← head.value
        head ← head.next
        if head is null:
            tail ← null            // queue is now empty
        size ← size − 1
        return value

    function peek():
        return head.value if head is not null else EMPTY_ERROR` },
                { tag: "h2", text: "Step-by-step reasoning" },
                { tag: "ol", items: [
                    "Maintain two pointers: head (the front, next to be dequeued) and tail (the back, where new elements are added).",
                    "Enqueue: create a new node and link it after the current tail, then update tail to point at the new node. If the queue was empty (tail was null), the new node becomes both head and tail.",
                    "Dequeue: read the value at head, then advance head to head.next, discarding the old head node. If this empties the queue (head becomes null), tail must also be reset to null to keep the two pointers consistent.",
                    "Peek: simply return the head's value without modifying the structure — useful for checking the front element without committing to a removal."
                ]},
                { tag: "h2", text: "Why it's correct" },
                { tag: "p", text: "FIFO ordering is preserved because every enqueue strictly appends to the tail (the most recently added position) and every dequeue strictly removes from the head (the longest-waiting position) — elements are therefore always removed in exactly the order they were added, by construction. Both operations only ever touch the head or tail pointer and at most one node's next pointer, never requiring traversal through the middle of the list, which is precisely what guarantees O(1) cost regardless of how many elements are currently queued." }
            ],
            codes:{
                "c++": `#include <iostream>

using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

struct Queue {
    Node* head = nullptr;
    Node* tail = nullptr;
    int size = 0;
};

bool isEmpty(Queue& q) {
    return q.size == 0;
}

void enqueue(Queue& q, int val) {
    Node* newNode = new Node(val);
    if (!q.tail) {
        q.head = q.tail = newNode;
    } else {
        q.tail->next = newNode;
        q.tail = newNode;
    }
    q.size++;
}

void dequeue(Queue& q) {
    if (isEmpty(q)) {
        cout << "Queue Underflow\\n";
        return;
    }
    Node* temp = q.head;
    q.head = q.head->next;
    if (!q.head) {
        q.tail = nullptr;
    }
    delete temp;
    q.size--;
}

int peek(Queue& q) {
    if (isEmpty(q)) return -1;
    return q.head->val;
}

void display(Queue& q) {
    Node* curr = q.head;
    while (curr) {
        cout << curr->val << " ";
        curr = curr->next;
    }
    cout << "\\n";
}

int main() {
    Queue q;
    enqueue(q, 10);
    enqueue(q, 20);
    enqueue(q, 30);
    display(q);

    dequeue(q);
    display(q);

    enqueue(q, 40);
    display(q);

    cout << "Front: " << peek(q) << "\\n";

    dequeue(q);
    dequeue(q);
    dequeue(q); // Empties the queue
    display(q);

    return 0;
}`,
                "python": `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def create_queue():
    return {'head': None, 'tail': None, 'size': 0}

def is_empty(q):
    return q['size'] == 0

def enqueue(q, val):
    new_node = Node(val)
    if not q['tail']:
        q['head'] = q['tail'] = new_node
    else:
        q['tail'].next = new_node
        q['tail'] = new_node
    q['size'] += 1

def dequeue(q):
    if is_empty(q):
        print("Queue Underflow")
        return
    temp = q['head']
    q['head'] = q['head'].next
    if not q['head']:
        q['tail'] = None
    q['size'] -= 1
    return temp.val

def peek(q):
    if is_empty(q):
        return -1
    return q['head'].val

def display(q):
    curr = q['head']
    res = []
    while curr:
        res.append(str(curr.val))
        curr = curr.next
    print(" ".join(res))

if __name__ == "__main__":
    q = create_queue()
    enqueue(q, 10)
    enqueue(q, 20)
    enqueue(q, 30)
    display(q)
    dequeue(q)
    display(q)`,
                "java": `public class Main {
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    static class QueueState {
        Node head = null;
        Node tail = null;
        int size = 0;
    }

    public static boolean isEmpty(QueueState q) {
        return q.size == 0;
    }

    public static void enqueue(QueueState q, int val) {
        Node newNode = new Node(val);
        if (q.tail == null) {
            q.head = q.tail = newNode;
        } else {
            q.tail.next = newNode;
            q.tail = newNode;
        }
        q.size++;
    }

    public static void dequeue(QueueState q) {
        if (isEmpty(q)) {
            System.out.println("Queue Underflow");
            return;
        }
        q.head = q.head.next;
        if (q.head == null) {
            q.tail = null;
        }
        q.size--;
    }

    public static int peek(QueueState q) {
        if (isEmpty(q)) return -1;
        return q.head.val;
    }

    public static void display(QueueState q) {
        Node curr = q.head;
        while (curr != null) {
            System.out.print(curr.val + " ");
            curr = curr.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        QueueState q = new QueueState();
        enqueue(q, 10);
        enqueue(q, 20);
        enqueue(q, 30);
        display(q);
        dequeue(q);
        display(q);
    }
}`,
                "js": `function createNode(val) {
    return { val, next: null };
}

function createQueue() {
    return { head: null, tail: null, size: 0 };
}

function isEmpty(q) {
    return q.size === 0;
}

function enqueue(q, val) {
    const newNode = createNode(val);
    if (!q.tail) {
        q.head = q.tail = newNode;
    } else {
        q.tail.next = newNode;
        q.tail = newNode;
    }
    q.size++;
}

function dequeue(q) {
    if (isEmpty(q)) {
        console.log("Queue Underflow");
        return;
    }
    const temp = q.head;
    q.head = q.head.next;
    if (!q.head) {
        q.tail = null;
    }
    q.size--;
    return temp.val;
}

function peek(q) {
    if (isEmpty(q)) return -1;
    return q.head.val;
}

function display(q) {
    let curr = q.head;
    let res = [];
    while (curr) {
        res.push(curr.val);
        curr = curr.next;
    }
    console.log(res.join(" "));
}

const q = createQueue();
enqueue(q, 10);
enqueue(q, 20);
enqueue(q, 30);
display(q);
dequeue(q);
display(q);`
            }
        },

        /* ════════════════════════════════════════════════════════════════════
           2. SLIDING WINDOW MAXIMUM
        ════════════════════════════════════════════════════════════════════ */
        {
            name: "Sliding Window Maximum",
            href: "/algorithms/queues/sliding-window-max",
            type: "Hard",

            about: [
                { tag: "h1", text: "Sliding Window Maximum" },
                { tag: "p", text: "Given an array and a window size k, Sliding Window Maximum asks for the maximum value within every contiguous window of size k as it slides from the start of the array to the end. The brute-force approach recomputes the maximum from scratch for every window position, costing O(nk) — a monotonic deque solves it in O(n) total, regardless of k." },
                { tag: "p", text: "The technique maintains a deque of INDICES (not values) kept in strictly decreasing order of their corresponding VALUES from front to back — so the front of the deque always holds the index of the current window's maximum. As the window slides, indices that fall outside the window are removed from the front, and any index whose value is beaten by a new arriving element is removed from the back (since it can never be the maximum again, exactly like the monotonic stack pattern)." },
                { tag: "h2", text: "When to reach for it" },
                { tag: "ul", items: [
                    "The literal sliding-window-maximum (or minimum, with the deque direction flipped) problem",
                    "Any 'maximum/minimum over every window of size k' query — this beats a heap-based O(n log k) approach with a true O(n) bound",
                    "Streaming data analysis where a running max/min over the most recent k data points must be maintained efficiently in real time",
                    "As a building block for more complex sliding-window DP optimisations, where a monotonic deque can shave an O(k) or O(log k) factor off an otherwise slower per-window computation"
                ]},
                { tag: "note", variant: "tip", text: "The monotonic deque here is the natural 'queue version' of the monotonic stack from the Stacks section — same core idea (pop invalidated elements before pushing), but now elements ALSO need to be removed from the opposite end once they age out of the window." }
            ],

            timeComplexityCalculation: {
                notation: "O(n)",
                best: [
                    { tag: "h2", text: "Best Case — O(n)" },
                    { tag: "p", text: "Every element must be pushed onto the deque at least once to be considered as a potential window maximum — there's no shortcut even for the most favourable value arrangement." },
                    { tag: "ul", items: ["n elements, each pushed exactly once: O(n)", "Best case still requires the full single pass to correctly determine every window's maximum"] }
                ],
                average: [
                    { tag: "h2", text: "Average Case — O(n)" },
                    { tag: "p", text: "Identical amortised-analysis argument to the monotonic stack: every element is pushed exactly once and removed (from either the front, due to expiring out of the window, or the back, due to being beaten by a larger value) at most once across the entire algorithm." },
                    { tag: "ul", items: [
                        "Total pushes across the whole run: exactly n",
                        "Total removals (front + back combined) across the whole run: at most n",
                        "Combined: O(n), regardless of how removals are distributed across iterations"
                    ]}
                ],
                worst: [
                    { tag: "h2", text: "Worst Case — O(n)" },
                    { tag: "p", text: "Even the input arrangement causing the most back-removal in a single iteration (e.g. a strictly increasing run suddenly capped, popping many elements at once) doesn't break the amortised O(n) bound, since the total work is accounted for across the entire run, not per iteration." },
                    { tag: "ul", items: [
                        "Worst case matches best/average exactly: O(n)",
                        "This is a dramatic improvement over the brute-force O(nk) approach and even beats a max-heap-based O(n log k) approach"
                    ]}
                ]
            },

            spaceComplexityCalculation: {
                notation: "O(k)",
                best: [
                    { tag: "h2", text: "Best Case Space — O(1)" },
                    { tag: "p", text: "If the array is strictly decreasing, each new element immediately becomes the sole occupant of the deque (since it's smaller than everything already there, it gets appended, but everything BEFORE it that's now within range was already larger and stays — actually for the deque to stay at size 1, values would need to be strictly increasing, immediately invalidating everything before): the deque size is bounded by the window size k in all cases, with O(1) being achievable only in special strictly-favourable sub-cases." },
                    { tag: "ul", items: ["Deque size is always bounded above by k, the window size, regardless of value arrangement — best case can be as small as O(1) for specific patterns"] }
                ],
                average: [
                    { tag: "h2", text: "Average Case Space — O(k)" },
                    { tag: "p", text: "The deque can never hold more than k elements at once, since indices that fall outside the current window are always removed from the front regardless of their value — this caps the deque's size structurally, not just by happenstance." },
                    { tag: "ul", items: ["Deque: bounded by O(k), the window size, regardless of input value distribution", "Output array (one maximum per window): O(n − k + 1) = O(n)"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case Space — O(k)" },
                    { tag: "p", text: "If the array is strictly decreasing within every window (so nothing ever gets removed from the back, only eventually from the front as the window slides), the deque holds close to its maximum possible size of k throughout." },
                    { tag: "ul", items: [
                        "Deque: up to O(k), the structural maximum imposed by the window-boundary removal rule",
                        "Total space including output: O(n + k) = O(n), since k ≤ n always"
                    ]}
                ]
            },

            pseudoCodeandStepexplanation: [
                { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
                { tag: "code", language: "text", text:
`function maxSlidingWindow(arr, k):
    deque ← empty deque             // stores indices, decreasing by value front-to-back
    result ← empty array

    for i from 0 to length(arr) − 1:
        // Remove indices that have fallen out of the window from the front
        while deque is not empty and deque.front() <= i − k:
            popFront(deque)

        // Remove indices from the back whose values are beaten by arr[i]
        while deque is not empty and arr[deque.back()] < arr[i]:
            popBack(deque)

        pushBack(deque, i)

        if i >= k − 1:
            result.append(arr[deque.front()])   // front always holds the current max

    return result` },
                { tag: "h2", text: "Step-by-step reasoning" },
                { tag: "ol", items: [
                    "Maintain a deque of indices kept in strictly decreasing order of their VALUES from front to back — the front always represents the largest value currently within the active window.",
                    "For each new index i, first remove any index from the FRONT of the deque that has aged out of the current window (its index is too far behind i to still be within the k-wide range).",
                    "Next, remove any index from the BACK of the deque whose value is smaller than arr[i] — those values can never be the maximum of any future window that also contains i, since arr[i] is both more recent and at least as large.",
                    "Push the current index i onto the back of the deque.",
                    "Once the window has reached its full size (i ≥ k − 1), the front of the deque holds the index of the current window's maximum — record its value in the result."
                ]},
                { tag: "h2", text: "Why it's correct" },
                { tag: "p", text: "The deque invariant — strictly decreasing values from front to back, containing only indices within the current window — is maintained by two complementary removal rules: front-removal correctly discards indices that have physically left the window's range, and back-removal correctly discards values that can never again be the maximum, since any future window containing both the discarded index and i would prefer i's value (it's both newer, so it stays in range longer, and at least as large). Because every surviving index in the deque is genuinely both in-range and 'still competitive', and the deque remains sorted in decreasing order, the front element is guaranteed to be the maximum of all currently-valid candidates — which is exactly the maximum of the current window." }
            ],
            codes:{
                "c++": `#include <iostream>
#include <vector>
#include <deque>

using namespace std;

vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    deque<int> dq; 
    vector<int> ans;

    for (int i = 0; i < nums.size(); i++) {
        // Remove elements not within the window
        if (!dq.empty() && dq.front() == i - k) {
            dq.pop_front();
        }
        
        // Remove elements smaller than the current element
        while (!dq.empty() && nums[dq.back()] < nums[i]) {
            dq.pop_back();
        }
        
        dq.push_back(i);
        
        // Push the maximum element of the current window
        if (i >= k - 1) {
            ans.push_back(nums[dq.front()]);
        }
    }
    return ans;
}

int main() {
    vector<int> nums = {1, 3, -1, -3, 5, 3, 6, 7};
    int k = 3;
    vector<int> result = maxSlidingWindow(nums, k);
    
    for (int val : result) cout << val << " ";
    cout << "\\n";
    return 0;
}`,
                "python": `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    ans = []
    
    for i in range(len(nums)):
        if dq and dq[0] == i - k:
            dq.popleft()
            
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
            
        dq.append(i)
        
        if i >= k - 1:
            ans.append(nums[dq[0]])
            
    return ans

if __name__ == "__main__":
    nums = [1, 3, -1, -3, 5, 3, 6, 7]
    k = 3
    print(max_sliding_window(nums, k))`,
                "java": `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static List<Integer> maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> dq = new ArrayDeque<>();
        List<Integer> ans = new ArrayList<>();
        
        for (int i = 0; i < nums.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() == i - k) {
                dq.pollFirst();
            }
            
            while (!dq.isEmpty() && nums[dq.peekLast()] < nums[i]) {
                dq.pollLast();
            }
            
            dq.offerLast(i);
            
            if (i >= k - 1) {
                ans.add(nums[dq.peekFirst()]);
            }
        }
        return ans;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        int k = 3;
        List<Integer> result = maxSlidingWindow(nums, k);
        System.out.println(result);
    }
}`,
                "js": `function maxSlidingWindow(nums, k) {
    const dq = [];
    const ans = [];
    let head = 0; // Simulate O(1) popFront
    
    for (let i = 0; i < nums.length; i++) {
        if (head < dq.length && dq[head] === i - k) {
            head++;
        }
        
        while (dq.length > head && nums[dq[dq.length - 1]] < nums[i]) {
            dq.pop();
        }
        
        dq.push(i);
        
        if (i >= k - 1) {
            ans.push(nums[dq[head]]);
        }
    }
    return ans;
}

const nums = [1, 3, -1, -3, 5, 3, 6, 7];
const k = 3;
console.log(maxSlidingWindow(nums, k));`
            }
        },

        /* ════════════════════════════════════════════════════════════════════
           3. CIRCULAR QUEUE
        ════════════════════════════════════════════════════════════════════ */
        {
            name: "Circular Queue",
            href: "/algorithms/queues/circular",
            type: "Medium",

            about: [
                { tag: "h1", text: "Circular Queue" },
                { tag: "p", text: "A circular queue (or 'ring buffer') implements a fixed-capacity FIFO queue using a single underlying array, treating the array's indices as if they wrap around in a circle — when the tail index reaches the end of the array, the next enqueue wraps back around to index 0 (assuming that slot has been freed by an earlier dequeue), reusing space instead of ever needing to shift elements or grow the array." },
                { tag: "p", text: "This solves the naive array-queue's core weakness — repeatedly dequeuing from the front of a plain array either requires an O(n) shift of every remaining element, or wastes ever-growing amounts of space at the front that's never reclaimed. The circular indexing scheme reclaims that freed space automatically, achieving true O(1) enqueue and dequeue within a fixed memory footprint." },
                { tag: "h2", text: "When to reach for it" },
                { tag: "ul", items: [
                    "Fixed-capacity buffering scenarios where the maximum number of in-flight elements is known in advance: audio/video streaming buffers, keyboard/network input buffers, producer-consumer pipelines with a bounded queue",
                    "Operating system kernel I/O buffers (circular buffers are the standard implementation for character device buffers, pipe buffers, and similar OS-level constructs)",
                    "Embedded systems and real-time applications where dynamic memory allocation (as a linked-list queue would need) is undesirable, and a fixed-size array-backed structure is preferred",
                    "Any 'most recent k elements' tracking scenario, since a full circular queue naturally overwrites (or rejects, depending on policy) the oldest element once capacity is reached"
                ]},
                { tag: "note", variant: "warning", text: "The classic circular-queue bug: a naive empty-vs-full check using only head==tail is AMBIGUOUS, since both an empty queue and a full queue can satisfy that condition. Standard fixes: track a separate size/count variable, deliberately waste one array slot, or use a separate isFull flag." }
            ],

            timeComplexityCalculation: {
                notation: "O(1)",
                best: [
                    { tag: "h2", text: "Best Case — O(1)" },
                    { tag: "p", text: "Both enqueue and dequeue perform a fixed, constant number of index updates (a modulo-based increment) regardless of how full the queue currently is or which physical array positions are involved." },
                    { tag: "ul", items: [
                        "Enqueue: write to arr[tail], update tail ← (tail + 1) mod capacity — O(1)",
                        "Dequeue: read arr[head], update head ← (head + 1) mod capacity — O(1)"
                    ]}
                ],
                average: [
                    { tag: "h2", text: "Average Case — O(1)" },
                    { tag: "p", text: "Every enqueue and dequeue performs the same fixed modulo-arithmetic index update regardless of queue size, fill level, or the specific values stored — there's no value-dependent branching that changes either operation's cost." },
                    { tag: "ul", items: ["Both operations remain strictly O(1) for any queue fill level, including near-empty or near-full states"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case — O(1)" },
                    { tag: "p", text: "No sequence of enqueue/dequeue operations increases either operation's cost beyond the fixed constant — the wraparound arithmetic costs the same single modulo operation regardless of how many times the buffer has already wrapped around." },
                    { tag: "ul", items: ["Both operations: O(1), identical across all cases — wraparound is a structural feature with zero additional asymptotic cost"] }
                ]
            },

            spaceComplexityCalculation: {
                notation: "O(n)",
                best: [
                    { tag: "h2", text: "Best Case Space — O(n)" },
                    { tag: "p", text: "A circular queue of capacity n always allocates exactly n slots up front, regardless of how many of those slots are currently occupied — this is the defining trade-off versus a dynamically-growing linked-list queue." },
                    { tag: "ul", items: ["Fixed underlying array: O(n), where n is the configured capacity"] }
                ],
                average: [
                    { tag: "h2", text: "Average Case Space — O(n)" },
                    { tag: "p", text: "Space usage is fixed by the configured capacity alone, since the array is allocated once at creation and never resized — this holds regardless of the actual usage pattern over the queue's lifetime." },
                    { tag: "ul", items: ["Same O(n) bound regardless of how full or empty the queue typically is during operation"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case Space — O(n)" },
                    { tag: "p", text: "No operation sequence increases memory beyond the fixed pre-allocated array — this is both the floor and ceiling for the structure's memory footprint, a deliberate trade-off for predictable, bounded memory use." },
                    { tag: "ul", items: [
                        "O(n) total, fixed at creation time — unlike a linked-list queue, a circular queue cannot grow beyond its configured capacity (enqueue on a full queue must be explicitly handled as an error or overwrite policy)"
                    ]}
                ]
            },

            pseudoCodeandStepexplanation: [
                { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
                { tag: "code", language: "text", text:
`class CircularQueue:
    capacity ← given
    buffer   ← array of size capacity
    head     ← 0
    tail     ← 0
    count    ← 0                      // tracks fill level, resolves the empty/full ambiguity

    function enqueue(value):
        if count == capacity:
            return FULL_ERROR
        buffer[tail] ← value
        tail ← (tail + 1) mod capacity
        count ← count + 1

    function dequeue():
        if count == 0:
            return EMPTY_ERROR
        value ← buffer[head]
        head ← (head + 1) mod capacity
        count ← count − 1
        return value

    function isFull():  return count == capacity
    function isEmpty(): return count == 0` },
                { tag: "h2", text: "Step-by-step reasoning" },
                { tag: "ol", items: [
                    "Allocate a fixed-size array up front, with head and tail both starting at index 0, and an explicit count variable to unambiguously track how many elements are currently stored.",
                    "Enqueue: if the queue isn't full, write the new value at the tail index, then advance tail using modulo arithmetic so it wraps back to 0 after reaching the end of the array, and increment count.",
                    "Dequeue: if the queue isn't empty, read the value at the head index, then advance head using the same modulo wraparound logic, and decrement count.",
                    "The explicit count variable (rather than relying solely on comparing head and tail) is what correctly disambiguates an empty queue from a full one, since both conditions can otherwise produce head == tail."
                ]},
                { tag: "h2", text: "Why it's correct" },
                { tag: "p", text: "The modulo arithmetic (index + 1) mod capacity correctly implements the circular wraparound: once an index reaches capacity − 1, adding 1 and taking the modulo brings it back to 0, exactly modeling a ring of capacity slots. FIFO ordering is preserved because enqueue always writes to (and advances) tail while dequeue always reads from (and advances) head, and these two pointers can never 'pass' each other while the queue has valid (count > 0, count < capacity) state, since enqueue is blocked when count == capacity and dequeue is blocked when count == 0 — the count variable acts as the single source of truth that prevents head and tail from ever producing an ambiguous or incorrect read." }
            ],
            codes:{
                "c++": `#include <iostream>
#include <vector>

using namespace std;

struct CircularQueue {
    vector<int> buffer;
    int head = 0;
    int tail = 0;
    int count = 0;
    int capacity;

    CircularQueue(int cap) {
        capacity = cap;
        buffer.resize(cap);
    }
};

bool isFull(const CircularQueue& q) {
    return q.count == q.capacity;
}

bool isEmpty(const CircularQueue& q) {
    return q.count == 0;
}

void enqueue(CircularQueue& q, int val) {
    if (isFull(q)) {
        cout << "Queue Overflow\\n";
        return;
    }
    q.buffer[q.tail] = val;
    q.tail = (q.tail + 1) % q.capacity;
    q.count++;
}

void dequeue(CircularQueue& q) {
    if (isEmpty(q)) {
        cout << "Queue Underflow\\n";
        return;
    }
    q.head = (q.head + 1) % q.capacity;
    q.count--;
}

int peek(const CircularQueue& q) {
    if (isEmpty(q)) return -1;
    return q.buffer[q.head];
}

int main() {
    CircularQueue q(3);
    enqueue(q, 10);
    enqueue(q, 20);
    enqueue(q, 30);
    enqueue(q, 40); // Will trigger overflow

    dequeue(q);
    enqueue(q, 40); // Works, wraps around

    cout << "Front: " << peek(q) << "\\n"; // Should be 20
    return 0;
}`,
                "python": `def create_circular_queue(capacity):
    return {
        'buffer': [0] * capacity,
        'head': 0,
        'tail': 0,
        'count': 0,
        'capacity': capacity
    }

def is_full(q):
    return q['count'] == q['capacity']

def is_empty(q):
    return q['count'] == 0

def enqueue(q, val):
    if is_full(q):
        print("Queue Overflow")
        return
    q['buffer'][q['tail']] = val
    q['tail'] = (q['tail'] + 1) % q['capacity']
    q['count'] += 1

def dequeue(q):
    if is_empty(q):
        print("Queue Underflow")
        return
    q['head'] = (q['head'] + 1) % q['capacity']
    q['count'] -= 1

def peek(q):
    if is_empty(q):
        return -1
    return q['buffer'][q['head']]

if __name__ == "__main__":
    q = create_circular_queue(3)
    enqueue(q, 10)
    enqueue(q, 20)
    enqueue(q, 30)
    enqueue(q, 40) # Overflow
    
    dequeue(q)
    enqueue(q, 40) # Wraps around
    
    print(f"Front: {peek(q)}")`,
                "java": `public class Main {
    static class CircularQueue {
        int[] buffer;
        int head = 0;
        int tail = 0;
        int count = 0;
        int capacity;

        CircularQueue(int cap) {
            capacity = cap;
            buffer = new int[cap];
        }
    }

    public static boolean isFull(CircularQueue q) {
        return q.count == q.capacity;
    }

    public static boolean isEmpty(CircularQueue q) {
        return q.count == 0;
    }

    public static void enqueue(CircularQueue q, int val) {
        if (isFull(q)) {
            System.out.println("Queue Overflow");
            return;
        }
        q.buffer[q.tail] = val;
        q.tail = (q.tail + 1) % q.capacity;
        q.count++;
    }

    public static void dequeue(CircularQueue q) {
        if (isEmpty(q)) {
            System.out.println("Queue Underflow");
            return;
        }
        q.head = (q.head + 1) % q.capacity;
        q.count--;
    }

    public static int peek(CircularQueue q) {
        if (isEmpty(q)) return -1;
        return q.buffer[q.head];
    }

    public static void main(String[] args) {
        CircularQueue q = new CircularQueue(3);
        enqueue(q, 10);
        enqueue(q, 20);
        enqueue(q, 30);
        enqueue(q, 40); // Overflow
        
        dequeue(q);
        enqueue(q, 40); // Wraps around
        
        System.out.println("Front: " + peek(q));
    }
}`,
                "js": `function createCircularQueue(capacity) {
    return {
        buffer: new Array(capacity).fill(0),
        head: 0,
        tail: 0,
        count: 0,
        capacity: capacity
    };
}

function isFull(q) {
    return q.count === q.capacity;
}

function isEmpty(q) {
    return q.count === 0;
}

function enqueue(q, val) {
    if (isFull(q)) {
        console.log("Queue Overflow");
        return;
    }
    q.buffer[q.tail] = val;
    q.tail = (q.tail + 1) % q.capacity;
    q.count++;
}

function dequeue(q) {
    if (isEmpty(q)) {
        console.log("Queue Underflow");
        return;
    }
    q.head = (q.head + 1) % q.capacity;
    q.count--;
}

function peek(q) {
    if (isEmpty(q)) return -1;
    return q.buffer[q.head];
}

const q = createCircularQueue(3);
enqueue(q, 10);
enqueue(q, 20);
enqueue(q, 30);
enqueue(q, 40); // Overflow

dequeue(q);
enqueue(q, 40); // Wraps around

console.log("Front:", peek(q));`
            }
        },

        /* ════════════════════════════════════════════════════════════════════
           4. DOUBLE-ENDED QUEUE (DEQUE)
        ════════════════════════════════════════════════════════════════════ */
        {
            name: "Double-ended Queue (Deque)",
            href: "/algorithms/queues/deque",
            type: "Medium",

            about: [
                { tag: "h1", text: "Double-ended Queue (Deque)" },
                { tag: "p", text: "A deque (pronounced 'deck') generalises both the stack and the queue: it supports O(1) insertion and removal at BOTH the front and the back, making it strictly more capable than either structure alone — a deque used only via push/pop on one end behaves exactly like a stack, and used via enqueue-at-back/dequeue-at-front behaves exactly like a queue." },
                { tag: "p", text: "It's typically implemented either as a doubly linked list (where O(1) operations at both ends follow directly from having both next and prev pointers — see the Linked Lists section) or as a dynamic circular buffer that can grow/shrink and supports indexing from either end. Most language standard libraries (Python's collections.deque, C++'s std::deque, Java's ArrayDeque) provide a deque as a built-in, general-purpose alternative to a plain queue or stack." },
                { tag: "h2", text: "When to reach for it" },
                { tag: "ul", items: [
                    "You need O(1) operations at BOTH ends — a plain queue or plain stack alone only efficiently supports one end each",
                    "Implementing a monotonic deque for sliding window maximum/minimum problems (see above) — this is the single most common algorithmic use of a deque beyond simply 'queue with extra flexibility'",
                    "Palindrome checking by comparing characters popped simultaneously from both ends",
                    "Undo/redo systems or browser-history-style navigation needing efficient access/insertion from both the 'oldest' and 'newest' ends"
                ]},
                { tag: "note", variant: "tip", text: "When in doubt about whether you need a stack, a queue, or a deque, just use a deque — it's a strict superset of both, and most production language libraries provide an efficient built-in implementation, so there's rarely a real cost to defaulting to it." }
            ],

            timeComplexityCalculation: {
                notation: "O(1)",
                best: [
                    { tag: "h2", text: "Best Case — O(1)" },
                    { tag: "p", text: "All four core operations (push/pop at front, push/pop at back) perform a fixed, constant number of pointer or index updates regardless of the deque's current size or contents." },
                    { tag: "ul", items: [
                        "pushFront / pushBack: O(1) — attach a new node or write to the next available slot",
                        "popFront / popBack: O(1) — detach the relevant end node or advance the relevant boundary index"
                    ]}
                ],
                average: [
                    { tag: "h2", text: "Average Case — O(1)" },
                    { tag: "p", text: "Every operation performs the same fixed amount of work regardless of deque size or the specific values stored, since none of the four core operations ever needs to traverse or examine any element beyond the immediate front or back." },
                    { tag: "ul", items: ["No value-dependent branching changes any operation's cost — all four remain strictly O(1) for any deque size, given a correct doubly-linked-list or dynamic-circular-buffer implementation"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case — O(1)" },
                    { tag: "p", text: "No sequence of front/back operations increases any single operation's cost beyond the fixed constant — both the doubly-linked-list and dynamic-circular-buffer implementations guarantee this uniformly." },
                    { tag: "ul", items: [
                        "All four operations: O(1), identical across all cases",
                        "A dynamic-array-backed deque may occasionally need an O(n) resize (doubling capacity) when it grows beyond its current allocation, but this cost is AMORTISED O(1) per operation across the structure's full usage history, exactly like a standard dynamic array's amortised append"
                    ]}
                ]
            },

            spaceComplexityCalculation: {
                notation: "O(n)",
                best: [
                    { tag: "h2", text: "Best Case Space — O(n)" },
                    { tag: "p", text: "Storing n elements requires O(n) space for the element data itself, plus a small constant overhead per element (two pointers for a doubly-linked-list implementation, or none beyond the array itself for a circular-buffer implementation)." },
                    { tag: "ul", items: ["n elements: O(n)", "Doubly-linked-list overhead: 2 pointers per node, still O(n) total"] }
                ],
                average: [
                    { tag: "h2", text: "Average Case Space — O(n)" },
                    { tag: "p", text: "Space usage is fixed by the number of currently-stored elements alone, regardless of the specific sequence of front/back operations that produced the current state." },
                    { tag: "ul", items: ["Same O(n) bound regardless of operation history or which end elements were added/removed from"] }
                ],
                worst: [
                    { tag: "h2", text: "Worst Case Space — O(n)" },
                    { tag: "p", text: "No operation sequence increases per-element overhead beyond the fixed node/slot structure — a dynamic-array-backed implementation may temporarily over-allocate (e.g. up to 2x) during growth, but this remains O(n) asymptotically." },
                    { tag: "ul", items: ["O(n) total, where n is the current number of elements — any temporary over-allocation from dynamic resizing is a constant factor, not a change in asymptotic class"] }
                ]
            },

            pseudoCodeandStepexplanation: [
                { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
                { tag: "p", text: "Doubly-linked-list-backed implementation (mirrors the Doubly Linked Lists pattern, with explicit front/back tracking):" },
                { tag: "code", language: "text", text:
`class Deque:
    front ← null          // sentinel-free for simplicity here
    back  ← null
    size  ← 0

    function pushFront(value):
        newNode ← new Node(value)
        if front is null:
            front ← newNode; back ← newNode
        else:
            newNode.next ← front
            front.prev ← newNode
            front ← newNode
        size ← size + 1

    function pushBack(value):
        newNode ← new Node(value)
        if back is null:
            front ← newNode; back ← newNode
        else:
            newNode.prev ← back
            back.next ← newNode
            back ← newNode
        size ← size + 1

    function popFront():
        if front is null: return EMPTY_ERROR
        value ← front.value
        front ← front.next
        if front is not null: front.prev ← null
        else: back ← null
        size ← size − 1
        return value

    function popBack():
        if back is null: return EMPTY_ERROR
        value ← back.value
        back ← back.prev
        if back is not null: back.next ← null
        else: front ← null
        size ← size − 1
        return value` },
                { tag: "h2", text: "Step-by-step reasoning" },
                { tag: "ol", items: [
                    "Maintain two pointers, front and back, marking the two ends of an underlying doubly linked list.",
                    "pushFront/pushBack: create a new node and link it at the appropriate end, updating that end's pointer — symmetric operations differing only in which direction the pointers are wired.",
                    "popFront/popBack: read the value at the relevant end, then advance that end's pointer inward by one node (front.next for popFront, back.prev for popBack), correctly nulling out the OTHER end's pointer if the deque becomes empty as a result.",
                    "Each operation only ever touches the node at the relevant end and its immediate neighbor — never requiring traversal through the middle of the structure."
                ]},
                { tag: "h2", text: "Why it's correct" },
                { tag: "p", text: "Because the underlying structure is a doubly linked list, every node has direct O(1) access to both its next and prev neighbors — this is precisely what allows operations at EITHER end to be implemented symmetrically and independently, without one end's operations needing to know anything about how the other end is currently structured. The size tracking and the explicit null-checks when removing the last remaining element ensure front and back stay correctly synchronised (both null exactly when the deque is empty, and pointing at the same single node when exactly one element remains), preserving structural consistency across any sequence of front and back operations." }
            ],
            codes:{
                "c++": `#include <iostream>

using namespace std;

struct Node {
    int val;
    Node* next;
    Node* prev;
    Node(int v) : val(v), next(nullptr), prev(nullptr) {}
};

struct Deque {
    Node* front = nullptr;
    Node* back = nullptr;
    int size = 0;
};

bool isEmpty(const Deque& dq) {
    return dq.size == 0;
}

void pushFront(Deque& dq, int val) {
    Node* newNode = new Node(val);
    if (isEmpty(dq)) {
        dq.front = dq.back = newNode;
    } else {
        newNode->next = dq.front;
        dq.front->prev = newNode;
        dq.front = newNode;
    }
    dq.size++;
}

void pushBack(Deque& dq, int val) {
    Node* newNode = new Node(val);
    if (isEmpty(dq)) {
        dq.front = dq.back = newNode;
    } else {
        newNode->prev = dq.back;
        dq.back->next = newNode;
        dq.back = newNode;
    }
    dq.size++;
}

void popFront(Deque& dq) {
    if (isEmpty(dq)) return;
    Node* temp = dq.front;
    dq.front = dq.front->next;
    if (dq.front) dq.front->prev = nullptr;
    else dq.back = nullptr;
    delete temp;
    dq.size--;
}

void popBack(Deque& dq) {
    if (isEmpty(dq)) return;
    Node* temp = dq.back;
    dq.back = dq.back->prev;
    if (dq.back) dq.back->next = nullptr;
    else dq.front = nullptr;
    delete temp;
    dq.size--;
}

void display(const Deque& dq) {
    Node* curr = dq.front;
    while(curr) {
        cout << curr->val << " ";
        curr = curr->next;
    }
    cout << "\\n";
}

int main() {
    Deque dq;
    pushBack(dq, 20);
    pushBack(dq, 30);
    display(dq);

    pushFront(dq, 10);
    display(dq);

    popBack(dq);
    display(dq);

    popFront(dq);
    display(dq);

    return 0;
}`,
                "python": `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
        self.prev = None

def create_deque():
    return {'front': None, 'back': None, 'size': 0}

def is_empty(dq):
    return dq['size'] == 0

def push_front(dq, val):
    new_node = Node(val)
    if is_empty(dq):
        dq['front'] = dq['back'] = new_node
    else:
        new_node.next = dq['front']
        dq['front'].prev = new_node
        dq['front'] = new_node
    dq['size'] += 1

def push_back(dq, val):
    new_node = Node(val)
    if is_empty(dq):
        dq['front'] = dq['back'] = new_node
    else:
        new_node.prev = dq['back']
        dq['back'].next = new_node
        dq['back'] = new_node
    dq['size'] += 1

def pop_front(dq):
    if is_empty(dq): return
    dq['front'] = dq['front'].next
    if dq['front']: dq['front'].prev = None
    else: dq['back'] = None
    dq['size'] -= 1

def pop_back(dq):
    if is_empty(dq): return
    dq['back'] = dq['back'].prev
    if dq['back']: dq['back'].next = None
    else: dq['front'] = None
    dq['size'] -= 1

def display(dq):
    curr = dq['front']
    res = []
    while curr:
        res.append(str(curr.val))
        curr = curr.next
    print(" ".join(res))

if __name__ == "__main__":
    dq = create_deque()
    push_back(dq, 20)
    push_back(dq, 30)
    display(dq)

    push_front(dq, 10)
    display(dq)

    pop_back(dq)
    display(dq)

    pop_front(dq)
    display(dq)`,
                "java": `public class Main {
    static class Node {
        int val;
        Node next, prev;
        Node(int val) { this.val = val; }
    }

    static class DequeState {
        Node front = null;
        Node back = null;
        int size = 0;
    }

    public static boolean isEmpty(DequeState dq) {
        return dq.size == 0;
    }

    public static void pushFront(DequeState dq, int val) {
        Node newNode = new Node(val);
        if (isEmpty(dq)) {
            dq.front = dq.back = newNode;
        } else {
            newNode.next = dq.front;
            dq.front.prev = newNode;
            dq.front = newNode;
        }
        dq.size++;
    }

    public static void pushBack(DequeState dq, int val) {
        Node newNode = new Node(val);
        if (isEmpty(dq)) {
            dq.front = dq.back = newNode;
        } else {
            newNode.prev = dq.back;
            dq.back.next = newNode;
            dq.back = newNode;
        }
        dq.size++;
    }

    public static void popFront(DequeState dq) {
        if (isEmpty(dq)) return;
        dq.front = dq.front.next;
        if (dq.front != null) dq.front.prev = null;
        else dq.back = null;
        dq.size--;
    }

    public static void popBack(DequeState dq) {
        if (isEmpty(dq)) return;
        dq.back = dq.back.prev;
        if (dq.back != null) dq.back.next = null;
        else dq.front = null;
        dq.size--;
    }

    public static void display(DequeState dq) {
        Node curr = dq.front;
        while (curr != null) {
            System.out.print(curr.val + " ");
            curr = curr.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        DequeState dq = new DequeState();
        pushBack(dq, 20);
        pushBack(dq, 30);
        display(dq);

        pushFront(dq, 10);
        display(dq);

        popBack(dq);
        display(dq);

        popFront(dq);
        display(dq);
    }
}`,
                "js": `function createNode(val) {
    return { val, next: null, prev: null };
}

function createDeque() {
    return { front: null, back: null, size: 0 };
}

function isEmpty(dq) {
    return dq.size === 0;
}

function pushFront(dq, val) {
    const newNode = createNode(val);
    if (isEmpty(dq)) {
        dq.front = dq.back = newNode;
    } else {
        newNode.next = dq.front;
        dq.front.prev = newNode;
        dq.front = newNode;
    }
    dq.size++;
}

function pushBack(dq, val) {
    const newNode = createNode(val);
    if (isEmpty(dq)) {
        dq.front = dq.back = newNode;
    } else {
        newNode.prev = dq.back;
        dq.back.next = newNode;
        dq.back = newNode;
    }
    dq.size++;
}

function popFront(dq) {
    if (isEmpty(dq)) return;
    dq.front = dq.front.next;
    if (dq.front) dq.front.prev = null;
    else dq.back = null;
    dq.size--;
}

function popBack(dq) {
    if (isEmpty(dq)) return;
    dq.back = dq.back.prev;
    if (dq.back) dq.back.next = null;
    else dq.front = null;
    dq.size--;
}

function display(dq) {
    let curr = dq.front;
    let res = [];
    while (curr) {
        res.push(curr.val);
        curr = curr.next;
    }
    console.log(res.join(" "));
}

const dq = createDeque();
pushBack(dq, 20);
pushBack(dq, 30);
display(dq);

pushFront(dq, 10);
display(dq);

popBack(dq);
display(dq);

popFront(dq);
display(dq);`
            }
        }
    ],
    desc: "Deque, sliding window max, BFS patterns",
    complexity: "O(n)",
    featured: false
};

/*
const QUEUES_SECTION = {
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
        <line x1="4" y1="30" x2="12" y2="30" stroke="#34D399" strokeDasharray="2 2"/>
      </svg>
    ),

  about: [
    { tag: "h1", text: "Queues" },
    { tag: "p", text: "A queue is a First-In-First-Out (FIFO) structure: elements are added at the back (enqueue) and removed from the front (dequeue), both ideally O(1). Where a stack models 'handle the most recent thing first', a queue models 'handle things in the order they arrived' — which is exactly why queues are the engine behind BFS traversal, task scheduling, and any system processing requests in arrival order." },
    { tag: "p", text: "A naive array-based queue (shifting every element left after a dequeue) costs O(n) per dequeue — the entire engineering challenge of queue implementations is avoiding that shift. The two standard solutions are a circular buffer (wrap indices around using modulo arithmetic instead of shifting) or a linked list (drop the front node directly, no shifting needed at all)." },
    { tag: "h2", text: "Queue variants in this section" },
    { tag: "table",
      headers: ["Variant", "Adds Capability", "Typical Use"],
      rows: [
        ["Plain Queue", "FIFO enqueue/dequeue", "BFS, task scheduling, producer-consumer buffering"],
        ["Circular Queue", "Fixed-capacity buffer reusing freed slots via wraparound", "Ring buffers, streaming data, OS-level I/O buffers"],
        ["Deque (Double-ended Queue)", "O(1) insertion/removal at BOTH ends", "Sliding window problems, undo/redo with both-direction access"],
        ["Monotonic Deque", "Deque kept in sorted order to track a window's max/min", "Sliding Window Maximum, and the queue-based cousin of the monotonic stack pattern"]
      ]
    },
    { tag: "note", variant: "tip", text: "Whenever a problem mentions 'sliding window' alongside 'maximum' or 'minimum', that combination is the strongest signal in this whole topic area for a monotonic deque — it solves what looks like it needs a heap in O(n) instead of O(n log n)." }
  ],

  items: [

    // ════════════════════════════════════════════════════════════════════
    //    1. QUEUE IMPLEMENTATION
    // ════════════════════════════════════════════════════════════════════
    {
      name: "Queue Implementation",
      href: "/algorithms/queues/implementation",
      type: "Easy",

      about: [
        { tag: "h1", text: "Queue Implementation" },
        { tag: "p", text: "Implementing a queue from scratch means providing O(1) enqueue and O(1) dequeue without resorting to the naive 'shift every remaining element after removing the front' approach, which costs O(n) per dequeue on a plain array. Two genuinely O(1) approaches exist: a linked-list-backed queue (track head and tail pointers directly) and an array-backed circular buffer (track head/tail indices with modulo wraparound, covered in its own entry below)." },
        { tag: "p", text: "The linked-list approach is conceptually the simplest: maintain a pointer to both the front (head) and back (tail) of a singly linked list. Enqueue appends a new node after tail and updates tail; dequeue removes the node at head and updates head — neither operation ever touches any other node, which is exactly what makes both O(1)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Implementing the queue ADT from primitives when your language's standard library doesn't expose one directly, or when you need to understand exactly how it works for an interview",
          "Choosing between linked-list-backed (unbounded, slightly more memory overhead per element) vs. array-backed circular buffer (bounded capacity, better cache locality and lower per-element overhead)",
          "As the literal data structure used to implement BFS on graphs and trees",
          "Producer-consumer pipelines and task scheduling systems, where FIFO ordering directly models real-world arrival order"
        ]},
        { tag: "note", variant: "warning", text: "Implementing a queue with TWO STACKS is a classic interview variant: push everything onto an 'inbox' stack, and when a dequeue is needed, transfer everything to an 'outbox' stack (reversing order) if the outbox is empty, then pop from the outbox. Each individual element migrates between stacks at most once, giving amortised O(1) per operation despite occasional O(n) transfer pauses." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Both enqueue and dequeue on a properly implemented (linked-list or circular-buffer) queue perform a fixed, constant number of pointer/index updates regardless of how many elements are currently in the queue." },
          { tag: "ul", items: [
            "Enqueue: create/place a new node at the tail, update the tail pointer — O(1)",
            "Dequeue: read the head node's value, advance the head pointer — O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every enqueue and dequeue performs the same fixed amount of work regardless of queue size or the specific values stored, since neither operation needs to examine or touch any element other than the one at the relevant end." },
          { tag: "ul", items: ["No value-dependent branching changes either operation's cost — both remain strictly O(1) for any queue size"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "No sequence of enqueue/dequeue operations or queue size increases either operation's cost beyond the fixed constant — this is one of the structurally simplest data structures with genuinely uniform O(1) behaviour, given a correct implementation." },
          { tag: "ul", items: [
            "Both operations: O(1), identical across all cases for a correctly implemented linked-list or circular-buffer queue",
            "The naive shifting-array approach is the only common implementation that fails this bound, with O(n) dequeue — always avoid it in production code"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n elements requires O(n) space for the element data itself, plus a small constant overhead for tracking head/tail pointers or indices." },
          { tag: "ul", items: ["n elements: O(n)", "head, tail tracking: O(1) additional"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the number of currently-stored elements alone, regardless of the history of enqueue/dequeue operations that led to the current state." },
          { tag: "ul", items: ["Same O(n) bound regardless of operation history or element values"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No operation sequence increases per-element overhead beyond the fixed node/slot structure — space scales linearly and predictably with the current element count." },
          { tag: "ul", items: ["O(n) total, where n is the current number of elements in the queue at any given time"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Linked-list-backed implementation:" },
        { tag: "code", language: "text", text:
`class Queue:
    head ← null
    tail ← null
    size ← 0

    function enqueue(value):
        newNode ← new Node(value)
        if tail is null:
            head ← newNode
            tail ← newNode
        else:
            tail.next ← newNode
            tail ← newNode
        size ← size + 1

    function dequeue():
        if head is null:
            return EMPTY_ERROR
        value ← head.value
        head ← head.next
        if head is null:
            tail ← null            // queue is now empty
        size ← size − 1
        return value

    function peek():
        return head.value if head is not null else EMPTY_ERROR` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain two pointers: head (the front, next to be dequeued) and tail (the back, where new elements are added).",
          "Enqueue: create a new node and link it after the current tail, then update tail to point at the new node. If the queue was empty (tail was null), the new node becomes both head and tail.",
          "Dequeue: read the value at head, then advance head to head.next, discarding the old head node. If this empties the queue (head becomes null), tail must also be reset to null to keep the two pointers consistent.",
          "Peek: simply return the head's value without modifying the structure — useful for checking the front element without committing to a removal."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "FIFO ordering is preserved because every enqueue strictly appends to the tail (the most recently added position) and every dequeue strictly removes from the head (the longest-waiting position) — elements are therefore always removed in exactly the order they were added, by construction. Both operations only ever touch the head or tail pointer and at most one node's next pointer, never requiring traversal through the middle of the list, which is precisely what guarantees O(1) cost regardless of how many elements are currently queued." }
      ],
      codes:{
        "c++":`#include <iostream>
#include <vector>
using namespace std;

vector<int> queue;

int front = 0;
int rear = -1;

bool empty() {
    return queue.empty();
}

void enqueue(int value) {

    queue.push_back(value);

    rear++;
} 

void dequeue() {

    if (empty()) {
        cout << "Queue Underflow" << endl;
        return;
    }

    queue.erase(queue.begin());

    if (queue.empty()) {
        front = 0;
        rear = -1;
    } else {
        rear--;
    }
}

int peek() {

    if (empty())
        return -1;

    return queue[front];
}

void display() {

    for (int curr = front; curr <= rear; curr++)
        cout << queue[curr] << " ";

    cout << endl;
}

int main() {

    enqueue(10);
    enqueue(20);
    enqueue(30);

    display();

    dequeue();

    display();

    enqueue(40);

    display();

    cout << "Front : " << peek() << endl;

    dequeue();

    display();

    dequeue();

    display();

    enqueue(50);
    enqueue(60);

    display();

    return 0;
}`
      }
    },

    // ════════════════════════════════════════════════════════════════════
    //    2. SLIDING WINDOW MAXIMUM
    // ════════════════════════════════════════════════════════════════════
    {
      name: "Sliding Window Maximum",
      href: "/algorithms/queues/sliding-window-max",
      type: "Hard",

      about: [
        { tag: "h1", text: "Sliding Window Maximum" },
        { tag: "p", text: "Given an array and a window size k, Sliding Window Maximum asks for the maximum value within every contiguous window of size k as it slides from the start of the array to the end. The brute-force approach recomputes the maximum from scratch for every window position, costing O(nk) — a monotonic deque solves it in O(n) total, regardless of k." },
        { tag: "p", text: "The technique maintains a deque of INDICES (not values) kept in strictly decreasing order of their corresponding VALUES from front to back — so the front of the deque always holds the index of the current window's maximum. As the window slides, indices that fall outside the window are removed from the front, and any index whose value is beaten by a new arriving element is removed from the back (since it can never be the maximum again, exactly like the monotonic stack pattern)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal sliding-window-maximum (or minimum, with the deque direction flipped) problem",
          "Any 'maximum/minimum over every window of size k' query — this beats a heap-based O(n log k) approach with a true O(n) bound",
          "Streaming data analysis where a running max/min over the most recent k data points must be maintained efficiently in real time",
          "As a building block for more complex sliding-window DP optimisations, where a monotonic deque can shave an O(k) or O(log k) factor off an otherwise slower per-window computation"
        ]},
        { tag: "note", variant: "tip", text: "The monotonic deque here is the natural 'queue version' of the monotonic stack from the Stacks section — same core idea (pop invalidated elements before pushing), but now elements ALSO need to be removed from the opposite end once they age out of the window." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every element must be pushed onto the deque at least once to be considered as a potential window maximum — there's no shortcut even for the most favourable value arrangement." },
          { tag: "ul", items: ["n elements, each pushed exactly once: O(n)", "Best case still requires the full single pass to correctly determine every window's maximum"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Identical amortised-analysis argument to the monotonic stack: every element is pushed exactly once and removed (from either the front, due to expiring out of the window, or the back, due to being beaten by a larger value) at most once across the entire algorithm." },
          { tag: "ul", items: [
            "Total pushes across the whole run: exactly n",
            "Total removals (front + back combined) across the whole run: at most n",
            "Combined: O(n), regardless of how removals are distributed across iterations"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even the input arrangement causing the most back-removal in a single iteration (e.g. a strictly increasing run suddenly capped, popping many elements at once) doesn't break the amortised O(n) bound, since the total work is accounted for across the entire run, not per iteration." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(n)",
            "This is a dramatic improvement over the brute-force O(nk) approach and even beats a max-heap-based O(n log k) approach"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If the array is strictly decreasing, each new element immediately becomes the sole occupant of the deque (since it's smaller than everything already there, it gets appended, but everything BEFORE it that's now within range was already larger and stays — actually for the deque to stay at size 1, values would need to be strictly increasing, immediately invalidating everything before): the deque size is bounded by the window size k in all cases, with O(1) being achievable only in special strictly-favourable sub-cases." },
          { tag: "ul", items: ["Deque size is always bounded above by k, the window size, regardless of value arrangement — best case can be as small as O(1) for specific patterns"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(k)" },
          { tag: "p", text: "The deque can never hold more than k elements at once, since indices that fall outside the current window are always removed from the front regardless of their value — this caps the deque's size structurally, not just by happenstance." },
          { tag: "ul", items: ["Deque: bounded by O(k), the window size, regardless of input value distribution", "Output array (one maximum per window): O(n − k + 1) = O(n)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(k)" },
          { tag: "p", text: "If the array is strictly decreasing within every window (so nothing ever gets removed from the back, only eventually from the front as the window slides), the deque holds close to its maximum possible size of k throughout." },
          { tag: "ul", items: [
            "Deque: up to O(k), the structural maximum imposed by the window-boundary removal rule",
            "Total space including output: O(n + k) = O(n), since k ≤ n always"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function maxSlidingWindow(arr, k):
    deque ← empty deque             // stores indices, decreasing by value front-to-back
    result ← empty array

    for i from 0 to length(arr) − 1:
        // Remove indices that have fallen out of the window from the front
        while deque is not empty and deque.front() <= i − k:
            popFront(deque)

        // Remove indices from the back whose values are beaten by arr[i]
        while deque is not empty and arr[deque.back()] < arr[i]:
            popBack(deque)

        pushBack(deque, i)

        if i >= k − 1:
            result.append(arr[deque.front()])   // front always holds the current max

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a deque of indices kept in strictly decreasing order of their VALUES from front to back — the front always represents the largest value currently within the active window.",
          "For each new index i, first remove any index from the FRONT of the deque that has aged out of the current window (its index is too far behind i to still be within the k-wide range).",
          "Next, remove any index from the BACK of the deque whose value is smaller than arr[i] — those values can never be the maximum of any future window that also contains i, since arr[i] is both more recent and at least as large.",
          "Push the current index i onto the back of the deque.",
          "Once the window has reached its full size (i ≥ k − 1), the front of the deque holds the index of the current window's maximum — record its value in the result."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The deque invariant — strictly decreasing values from front to back, containing only indices within the current window — is maintained by two complementary removal rules: front-removal correctly discards indices that have physically left the window's range, and back-removal correctly discards values that can never again be the maximum, since any future window containing both the discarded index and i would prefer i's value (it's both newer, so it stays in range longer, and at least as large). Because every surviving index in the deque is genuinely both in-range and 'still competitive', and the deque remains sorted in decreasing order, the front element is guaranteed to be the maximum of all currently-valid candidates — which is exactly the maximum of the current window." }
      ],
      codes:{
        "c++":`#include <iostream>
#include <vector>
using namespace std;

vector<int> nums = {1,3,-1,-3,5,3,6,7};
vector<int> deque;
vector<int> ans;

int front = 0;
int rear = -1;

bool empty() {
    return deque.empty();
}

void pushBack(int value) {
    deque.push_back(value);
    rear++;
}

void popBack() {
    if (empty()) return;
    deque.pop_back();
    if (deque.empty()) {
        front = 0;
        rear = -1;
    } else {
        rear--;
    }
}

void popFront() {
    if (empty()) return;
    deque.erase(deque.begin());
    if (deque.empty()) {
        front = 0;
        rear = -1;
    } else {
        rear--;
    }
}

int getFront() {
    return deque[front];
}

int getBack() {
    return deque[rear];
}

void maxSlidingWindow(int k) {
    for (int i = 0; i < nums.size(); i++) {
        while (!empty() && getFront() <= i - k)
            popFront();
        while (!empty() && nums[getBack()] <= nums[i])
            popBack();
        pushBack(i);
        if (i >= k - 1)
            ans.push_back(nums[getFront()]);
    }
}

int main() {
    maxSlidingWindow(3);
    for (int curr = 0; curr < ans.size(); curr++)
        cout << ans[curr] << " ";
    cout << endl;
    return 0;
}`
      }
    },

    // ════════════════════════════════════════════════════════════════════
    //    3. CIRCULAR QUEUE
    // ════════════════════════════════════════════════════════════════════
    {
      name: "Circular Queue",
      href: "/algorithms/queues/circular",
      type: "Medium",

      about: [
        { tag: "h1", text: "Circular Queue" },
        { tag: "p", text: "A circular queue (or 'ring buffer') implements a fixed-capacity FIFO queue using a single underlying array, treating the array's indices as if they wrap around in a circle — when the tail index reaches the end of the array, the next enqueue wraps back around to index 0 (assuming that slot has been freed by an earlier dequeue), reusing space instead of ever needing to shift elements or grow the array." },
        { tag: "p", text: "This solves the naive array-queue's core weakness — repeatedly dequeuing from the front of a plain array either requires an O(n) shift of every remaining element, or wastes ever-growing amounts of space at the front that's never reclaimed. The circular indexing scheme reclaims that freed space automatically, achieving true O(1) enqueue and dequeue within a fixed memory footprint." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Fixed-capacity buffering scenarios where the maximum number of in-flight elements is known in advance: audio/video streaming buffers, keyboard/network input buffers, producer-consumer pipelines with a bounded queue",
          "Operating system kernel I/O buffers (circular buffers are the standard implementation for character device buffers, pipe buffers, and similar OS-level constructs)",
          "Embedded systems and real-time applications where dynamic memory allocation (as a linked-list queue would need) is undesirable, and a fixed-size array-backed structure is preferred",
          "Any 'most recent k elements' tracking scenario, since a full circular queue naturally overwrites (or rejects, depending on policy) the oldest element once capacity is reached"
        ]},
        { tag: "note", variant: "warning", text: "The classic circular-queue bug: a naive empty-vs-full check using only head==tail is AMBIGUOUS, since both an empty queue and a full queue can satisfy that condition. Standard fixes: track a separate size/count variable, deliberately waste one array slot, or use a separate isFull flag." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Both enqueue and dequeue perform a fixed, constant number of index updates (a modulo-based increment) regardless of how full the queue currently is or which physical array positions are involved." },
          { tag: "ul", items: [
            "Enqueue: write to arr[tail], update tail ← (tail + 1) mod capacity — O(1)",
            "Dequeue: read arr[head], update head ← (head + 1) mod capacity — O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every enqueue and dequeue performs the same fixed modulo-arithmetic index update regardless of queue size, fill level, or the specific values stored — there's no value-dependent branching that changes either operation's cost." },
          { tag: "ul", items: ["Both operations remain strictly O(1) for any queue fill level, including near-empty or near-full states"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "No sequence of enqueue/dequeue operations increases either operation's cost beyond the fixed constant — the wraparound arithmetic costs the same single modulo operation regardless of how many times the buffer has already wrapped around." },
          { tag: "ul", items: ["Both operations: O(1), identical across all cases — wraparound is a structural feature with zero additional asymptotic cost"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "A circular queue of capacity n always allocates exactly n slots up front, regardless of how many of those slots are currently occupied — this is the defining trade-off versus a dynamically-growing linked-list queue." },
          { tag: "ul", items: ["Fixed underlying array: O(n), where n is the configured capacity"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the configured capacity alone, since the array is allocated once at creation and never resized — this holds regardless of the actual usage pattern over the queue's lifetime." },
          { tag: "ul", items: ["Same O(n) bound regardless of how full or empty the queue typically is during operation"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No operation sequence increases memory beyond the fixed pre-allocated array — this is both the floor and ceiling for the structure's memory footprint, a deliberate trade-off for predictable, bounded memory use." },
          { tag: "ul", items: [
            "O(n) total, fixed at creation time — unlike a linked-list queue, a circular queue cannot grow beyond its configured capacity (enqueue on a full queue must be explicitly handled as an error or overwrite policy)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`class CircularQueue:
    capacity ← given
    buffer   ← array of size capacity
    head     ← 0
    tail     ← 0
    count    ← 0                      // tracks fill level, resolves the empty/full ambiguity

    function enqueue(value):
        if count == capacity:
            return FULL_ERROR
        buffer[tail] ← value
        tail ← (tail + 1) mod capacity
        count ← count + 1

    function dequeue():
        if count == 0:
            return EMPTY_ERROR
        value ← buffer[head]
        head ← (head + 1) mod capacity
        count ← count − 1
        return value

    function isFull():  return count == capacity
    function isEmpty(): return count == 0` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Allocate a fixed-size array up front, with head and tail both starting at index 0, and an explicit count variable to unambiguously track how many elements are currently stored.",
          "Enqueue: if the queue isn't full, write the new value at the tail index, then advance tail using modulo arithmetic so it wraps back to 0 after reaching the end of the array, and increment count.",
          "Dequeue: if the queue isn't empty, read the value at the head index, then advance head using the same modulo wraparound logic, and decrement count.",
          "The explicit count variable (rather than relying solely on comparing head and tail) is what correctly disambiguates an empty queue from a full one, since both conditions can otherwise produce head == tail."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The modulo arithmetic (index + 1) mod capacity correctly implements the circular wraparound: once an index reaches capacity − 1, adding 1 and taking the modulo brings it back to 0, exactly modeling a ring of capacity slots. FIFO ordering is preserved because enqueue always writes to (and advances) tail while dequeue always reads from (and advances) head, and these two pointers can never 'pass' each other while the queue has valid (count > 0, count < capacity) state, since enqueue is blocked when count == capacity and dequeue is blocked when count == 0 — the count variable acts as the single source of truth that prevents head and tail from ever producing an ambiguous or incorrect read." }
      ],
      codes:{
        "c++":`#include <iostream>
#include <vector>
using namespace std;

vector<int> queue;

int front = -1;
int rear = -1;
int capacity = 5;

bool empty() {
    return front == -1;
}

bool full() {
    return (rear + 1) % capacity == front;
}

void enqueue(int value) {

    if (full()) {
        cout << "Queue Overflow" << endl;
        return;
    }

    if (empty()) {
        front = 0;
        rear = 0;
        queue.push_back(value);
        return;
    }

    rear = (rear + 1) % capacity;

    if (rear < queue.size())
        queue[rear] = value;
    else
        queue.push_back(value);
}

void dequeue() {

    if (empty()) {
        cout << "Queue Underflow" << endl;
        return;
    }

    queue.erase(queue.begin());

    if (front == rear) {
        front = -1;
        rear = -1;
    }
    else {
        rear--;
    }
}

int peek() {

    if (empty())
        return -1;

    return queue[front];
}

void display() {

    if (empty()) {
        cout << "Queue Empty" << endl;
        return;
    }

    for (int curr = front; curr <= rear; curr++)
        cout << queue[curr] << " ";

    cout << endl;
}

int main() {

    enqueue(10);
    enqueue(20);
    enqueue(30);
    enqueue(40);

    display();

    dequeue();

    display();

    enqueue(50);

    display();

    dequeue();

    display();

    cout << "Front : " << peek() << endl;

    return 0;
}`
      }
    },

    // ════════════════════════════════════════════════════════════════════
    //    4. DOUBLE-ENDED QUEUE (DEQUE)
    // ════════════════════════════════════════════════════════════════════
    {
      name: "Double-ended Queue (Deque)",
      href: "/algorithms/queues/deque",
      type: "Medium",

      about: [
        { tag: "h1", text: "Double-ended Queue (Deque)" },
        { tag: "p", text: "A deque (pronounced 'deck') generalises both the stack and the queue: it supports O(1) insertion and removal at BOTH the front and the back, making it strictly more capable than either structure alone — a deque used only via push/pop on one end behaves exactly like a stack, and used via enqueue-at-back/dequeue-at-front behaves exactly like a queue." },
        { tag: "p", text: "It's typically implemented either as a doubly linked list (where O(1) operations at both ends follow directly from having both next and prev pointers — see the Linked Lists section) or as a dynamic circular buffer that can grow/shrink and supports indexing from either end. Most language standard libraries (Python's collections.deque, C++'s std::deque, Java's ArrayDeque) provide a deque as a built-in, general-purpose alternative to a plain queue or stack." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need O(1) operations at BOTH ends — a plain queue or plain stack alone only efficiently supports one end each",
          "Implementing a monotonic deque for sliding window maximum/minimum problems (see above) — this is the single most common algorithmic use of a deque beyond simply 'queue with extra flexibility'",
          "Palindrome checking by comparing characters popped simultaneously from both ends",
          "Undo/redo systems or browser-history-style navigation needing efficient access/insertion from both the 'oldest' and 'newest' ends"
        ]},
        { tag: "note", variant: "tip", text: "When in doubt about whether you need a stack, a queue, or a deque, just use a deque — it's a strict superset of both, and most production language libraries provide an efficient built-in implementation, so there's rarely a real cost to defaulting to it." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "All four core operations (push/pop at front, push/pop at back) perform a fixed, constant number of pointer or index updates regardless of the deque's current size or contents." },
          { tag: "ul", items: [
            "pushFront / pushBack: O(1) — attach a new node or write to the next available slot",
            "popFront / popBack: O(1) — detach the relevant end node or advance the relevant boundary index"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every operation performs the same fixed amount of work regardless of deque size or the specific values stored, since none of the four core operations ever needs to traverse or examine any element beyond the immediate front or back." },
          { tag: "ul", items: ["No value-dependent branching changes any operation's cost — all four remain strictly O(1) for any deque size, given a correct doubly-linked-list or dynamic-circular-buffer implementation"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "No sequence of front/back operations increases any single operation's cost beyond the fixed constant — both the doubly-linked-list and dynamic-circular-buffer implementations guarantee this uniformly." },
          { tag: "ul", items: [
            "All four operations: O(1), identical across all cases",
            "A dynamic-array-backed deque may occasionally need an O(n) resize (doubling capacity) when it grows beyond its current allocation, but this cost is AMORTISED O(1) per operation across the structure's full usage history, exactly like a standard dynamic array's amortised append"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n elements requires O(n) space for the element data itself, plus a small constant overhead per element (two pointers for a doubly-linked-list implementation, or none beyond the array itself for a circular-buffer implementation)." },
          { tag: "ul", items: ["n elements: O(n)", "Doubly-linked-list overhead: 2 pointers per node, still O(n) total"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the number of currently-stored elements alone, regardless of the specific sequence of front/back operations that produced the current state." },
          { tag: "ul", items: ["Same O(n) bound regardless of operation history or which end elements were added/removed from"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No operation sequence increases per-element overhead beyond the fixed node/slot structure — a dynamic-array-backed implementation may temporarily over-allocate (e.g. up to 2x) during growth, but this remains O(n) asymptotically." },
          { tag: "ul", items: ["O(n) total, where n is the current number of elements — any temporary over-allocation from dynamic resizing is a constant factor, not a change in asymptotic class"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Doubly-linked-list-backed implementation (mirrors the Doubly Linked Lists pattern, with explicit front/back tracking):" },
        { tag: "code", language: "text", text:
`class Deque:
    front ← null          // sentinel-free for simplicity here
    back  ← null
    size  ← 0

    function pushFront(value):
        newNode ← new Node(value)
        if front is null:
            front ← newNode; back ← newNode
        else:
            newNode.next ← front
            front.prev ← newNode
            front ← newNode
        size ← size + 1

    function pushBack(value):
        newNode ← new Node(value)
        if back is null:
            front ← newNode; back ← newNode
        else:
            newNode.prev ← back
            back.next ← newNode
            back ← newNode
        size ← size + 1

    function popFront():
        if front is null: return EMPTY_ERROR
        value ← front.value
        front ← front.next
        if front is not null: front.prev ← null
        else: back ← null
        size ← size − 1
        return value

    function popBack():
        if back is null: return EMPTY_ERROR
        value ← back.value
        back ← back.prev
        if back is not null: back.next ← null
        else: front ← null
        size ← size − 1
        return value` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain two pointers, front and back, marking the two ends of an underlying doubly linked list.",
          "pushFront/pushBack: create a new node and link it at the appropriate end, updating that end's pointer — symmetric operations differing only in which direction the pointers are wired.",
          "popFront/popBack: read the value at the relevant end, then advance that end's pointer inward by one node (front.next for popFront, back.prev for popBack), correctly nulling out the OTHER end's pointer if the deque becomes empty as a result.",
          "Each operation only ever touches the node at the relevant end and its immediate neighbor — never requiring traversal through the middle of the structure."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Because the underlying structure is a doubly linked list, every node has direct O(1) access to both its next and prev neighbors — this is precisely what allows operations at EITHER end to be implemented symmetrically and independently, without one end's operations needing to know anything about how the other end is currently structured. The size tracking and the explicit null-checks when removing the last remaining element ensure front and back stay correctly synchronised (both null exactly when the deque is empty, and pointing at the same single node when exactly one element remains), preserving structural consistency across any sequence of front and back operations." }
      ],
      codes:{
        "c++":`#include <iostream>
#include <vector>
using namespace std;

vector<int> deque;

int front = 0;
int rear = -1;

bool empty() {
    return deque.empty();
}

void pushFront(int value) {

    deque.insert(deque.begin(), value);

    rear++;
}

void pushBack(int value) {

    deque.push_back(value);

    rear++;
}

void popFront() {

    if (empty()) {
        cout << "Deque Underflow" << endl;
        return;
    }

    deque.erase(deque.begin());

    if (deque.empty()) {
        front = 0;
        rear = -1;
    }
    else {
        rear--;
    }
}

void popBack() {

    if (empty()) {
        cout << "Deque Underflow" << endl;
        return;
    }

    deque.pop_back();

    if (deque.empty()) {
        front = 0;
        rear = -1;
    }
    else {
        rear--;
    }
}

int getFront() {

    if (empty())
        return -1;

    return deque[front];
}

int getBack() {

    if (empty())
        return -1;

    return deque[rear];
}

void display() {

    for (int curr = front; curr <= rear; curr++)
        cout << deque[curr] << " ";

    cout << endl;
}

int main() {

    pushBack(20);
    pushBack(30);

    display();

    pushFront(10);

    display();

    pushFront(5);

    display();

    popBack();

    display();

    popFront();

    display();

    pushBack(40);

    display();

    cout << "Front : " << getFront() << endl;
    cout << "Back : " << getBack() << endl;

    return 0;
}`
      }
    }

  ],
  desc: "Deque, sliding window max, BFS patterns",
  complexity: "O(n)",
  featured: false
};
*/

export default QUEUES_SECTION;