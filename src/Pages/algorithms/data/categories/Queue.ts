const QUEUES_SECTION = {
  name: "Queues",
  href: "/algorithms/queues",
  iconId: "Queue",
  hoverIconId: "Queue",

  about: [
    { tag: "h1", text: "Queues" },
    {
      tag: "p",
      text: "A queue is a First-In-First-Out (FIFO) structure: elements are added at the back (enqueue) and removed from the front (dequeue), both ideally O(1). Where a stack models 'handle the most recent thing first', a queue models 'handle things in the order they arrived' — which is exactly why queues are the engine behind BFS traversal, task scheduling, and any system processing requests in arrival order.",
    },
    {
      tag: "p",
      text: "A naive array-based queue (shifting every element left after a dequeue) costs O(n) per dequeue — the entire engineering challenge of queue implementations is avoiding that shift. The two standard solutions are a circular buffer (wrap indices around using modulo arithmetic instead of shifting) or a linked list (drop the front node directly, no shifting needed at all).",
    },
    { tag: "h2", text: "Queue variants in this section" },
    {
      tag: "table",
      headers: ["Variant", "Adds Capability", "Typical Use"],
      rows: [
        [
          "Plain Queue",
          "FIFO enqueue/dequeue",
          "BFS, task scheduling, producer-consumer buffering",
        ],
        [
          "Circular Queue",
          "Fixed-capacity buffer reusing freed slots via wraparound",
          "Ring buffers, streaming data, OS-level I/O buffers",
        ],
        [
          "Deque (Double-ended Queue)",
          "O(1) insertion/removal at BOTH ends",
          "Sliding window problems, undo/redo with both-direction access",
        ],
        [
          "Monotonic Deque",
          "Deque kept in sorted order to track a window's max/min",
          "Sliding Window Maximum, and the queue-based cousin of the monotonic stack pattern",
        ],
      ],
    },
    {
      tag: "note",
      variant: "tip",
      text: "Whenever a problem mentions 'sliding window' alongside 'maximum' or 'minimum', that combination is the strongest signal in this whole topic area for a monotonic deque — it solves what looks like it needs a heap in O(n) instead of O(n log n).",
    },
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
        {
          tag: "p",
          text: "Implementing a queue from scratch requires achieving true O(1) enqueue and dequeue operations. The naive approach—using a standard dynamic array and shifting every remaining element left after popping the front—results in an unacceptable O(n) dequeue cost. To bypass this, engineers rely on two primary structural paradigms: a pointer-based Singly Linked List, or an index-based Circular Buffer.",
        },
        {
          tag: "p",
          text: "The linked-list approach is structurally robust and conceptually elegant. By maintaining persistent pointers to both the front (head) and the back (tail) of the list, elements can be appended to the tail and severed from the head without ever traversing the intermediate nodes. This guarantees strict O(1) performance and allows the queue to grow infinitely (bounded only by heap memory), at the cost of slight memory fragmentation and pointer overhead.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "You need to implement the queue ADT from primitives (a common requirement in system-level C/C++ or technical interviews).",
            "You are building a Breadth-First Search (BFS) algorithm; the queue naturally dictates the level-by-layer exploration order.",
            "Designing producer-consumer pipelines, message brokers, or asynchronous task schedulers where strict First-In-First-Out (FIFO) fairness is mandatory.",
            "When maximum throughput is required and you must avoid the periodic O(n) reallocation pauses associated with dynamic arrays.",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Interview Trap: You will frequently be asked to 'Implement a Queue using Two Stacks'. This requires an 'inbox' stack for pushing and an 'outbox' stack for popping. When the outbox is empty, you flush the inbox into the outbox (which reverses the order into FIFO). While this introduces occasional O(n) flush pauses, the amortized time complexity remains O(1) per operation.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "A properly implemented linked-list queue executes a strictly constant number of instructions regardless of the dataset size.",
          },
          {
            tag: "ul",
            items: [
              "Enqueue: Allocate one node, assign the current tail's next pointer, and reassign the tail pointer — O(1)",
              "Dequeue: Cache the head's value, reassign the head pointer to the next node, and deallocate the old node — O(1)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          {
            tag: "p",
            text: "Performance is deterministic. Neither enqueue nor dequeue relies on value-based branching, traversal, or search operations.",
          },
          {
            tag: "ul",
            items: [
              "Every insertion and deletion executes in bounded time. There are no edge cases that alter the execution path length.",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          {
            tag: "p",
            text: "Unlike a dynamic array (std::vector or ArrayList) which occasionally triggers an O(n) reallocation spike when its capacity is exceeded, a linked-list queue allocates nodes dynamically one at a time. It never requires a bulk memory copy.",
          },
          {
            tag: "ul",
            items: [
              "Both enqueue and dequeue remain strictly O(1).",
              "Note: A naive array implementation fails this bound drastically, degrading to O(n) for every dequeue.",
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
            text: "The space consumed is directly proportional to the number of elements currently residing in the queue, plus the overhead of the tracking pointers.",
          },
          {
            tag: "ul",
            items: [
              "n discrete nodes containing data — O(n)",
              "Global head and tail pointers — O(1) additional",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          {
            tag: "p",
            text: "A linked-list implementation allocates memory exactly as needed. It never 'over-allocates' empty capacity in the way an array-based structure might.",
          },
          {
            tag: "ul",
            items: [
              "The memory footprint perfectly tracks the active element count.",
              "However, each element incurs the hidden O(1) overhead of a 'next' memory pointer, which makes it slightly less memory-dense than an array.",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "Memory scales linearly with the number of enqueued elements until the process hits the system's heap limit.",
          },
          {
            tag: "ul",
            items: [
              "Total space is exactly n nodes. Memory fragmentation may occur over time due to frequent granular allocations and deallocations, but the asymptotic space remains strictly O(n).",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "A standard pointer-backed Singly Linked List implementation:" },
        {
          tag: "code",
          language: "text",
          text: `class Node:
    value
    next ← null

class Queue:
    head ← null
    tail ← null
    size ← 0

    function enqueue(val):
        newNode ← new Node(val)
        if tail is null:
            head ← newNode
            tail ← newNode
        else:
            tail.next ← newNode
            tail ← newNode
        size ← size + 1

    function dequeue():
        if head is null:
            return ERROR_UNDERFLOW
        
        dequeuedValue ← head.value
        head ← head.next
        
        // Critical edge case: If the queue just became empty, update tail
        if head is null:
            tail ← null            
            
        size ← size − 1
        return dequeuedValue

    function peek():
        if head is null:
            return ERROR_UNDERFLOW
        return head.value`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "State Management: The structure relies on two tracking pointers. 'head' monitors the front of the line (next to be processed), and 'tail' monitors the back of the line (where newcomers attach).",
            "Enqueue Logic: A new node is instantiated. If the queue is completely empty (tail is null), both head and tail are pointed at this sole node. Otherwise, the current tail's 'next' pointer is linked to the new node, and the tail pointer is advanced.",
            "Dequeue Logic: Extract the value from the 'head' node. Advance the head pointer to the second node in line (head.next), effectively severing the first node.",
            "Empty State Recovery: If advancing the head pointer results in a null reference, it means the last element was just removed. You must explicitly set 'tail' to null to ensure the queue resets to a clean empty state.",
            "Peek Logic: Simply read and return the value stored at the head pointer without mutating the linked list.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The First-In-First-Out (FIFO) invariant is guaranteed structurally. Elements are exclusively appended to the tail and exclusively severed from the head. Because the elements are physically chained in arrival order, the oldest element is always situated at the head. Furthermore, by maintaining explicit references to both extremes of the chain, the algorithm surgically avoids traversing the sequence, ensuring strict O(1) time complexity regardless of the queue's length.",
        },
      ],
      codes: {
        "c++": `#include <iostream>

using namespace std;

// SHAPE: Contains 'val' and 'next' -> TRIGGERS: <LinkedList /> automatically
struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

// AUTO-BOUND: Any variable pointing to a node attaches as a floating badge
Node* head = nullptr;
Node* tail = nullptr;

// Track size separately (using 'queue_size' to avoid conflict with reserved 'size')
int queue_size = 0;

bool isEmpty() {
    return queue_size == 0;
}

void enqueue(int value) {
    Node* curr = new Node(value); // 'curr' automatically binds as a temporary badge
    if (!tail) {
        head = tail = curr;
    } else {
        tail->next = curr;
        tail = curr;
    }
    queue_size++;
}

void dequeue() {
    if (isEmpty()) {
        cout << "Queue Underflow\\n";
        return;
    }
    Node* temp = head; // 'temp' automatically binds to the node being removed
    head = head->next;
    
    if (!head) {
        tail = nullptr;
    }
    
    delete temp;
    queue_size--;
}

int peek() {
    if (isEmpty()) return -1;
    return head->val;
}

void display() {
    Node* ptr = head; // 'ptr' automatically binds and walks the list
    while (ptr) {
        cout << ptr->val << " ";
        ptr = ptr->next;
    }
    cout << "\\n";
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

    cout << "Front: " << peek() << "\\n";

    dequeue();
    dequeue();
    dequeue(); // Empties the queue
    display();

    return 0;
}`,
        python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

# Global pointers for the visualizer to easily track as floating badges
head = None
tail = None
queue_size = 0

def is_empty():
    global queue_size
    return queue_size == 0

def enqueue(val):
    global head, tail, queue_size
    curr = Node(val)
    if not tail:
        head = tail = curr
    else:
        tail.next = curr
        tail = curr
    queue_size += 1

def dequeue():
    global head, tail, queue_size
    if is_empty():
        print("Queue Underflow")
        return
    temp = head
    head = head.next
    if not head:
        tail = None
    queue_size -= 1
    return temp.val

def peek():
    if is_empty():
        return -1
    return head.val

def display():
    ptr = head
    res = []
    while ptr:
        res.append(str(ptr.val))
        ptr = ptr.next
    print(" ".join(res))

if __name__ == "__main__":
    enqueue(10)
    enqueue(20)
    enqueue(30)
    display()
    
    dequeue()
    display()
    
    enqueue(40)
    display()
    
    print(f"Front: {peek()}")
    
    dequeue()
    dequeue()
    dequeue()
    display()`,
        java: `public class Main {
    // SHAPE: Contains 'val' and 'next' -> TRIGGERS: <LinkedList /> automatically
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    // Static variables mapped directly to the runtime scope for floating badges
    static Node head = null;
    static Node tail = null;
    static int queue_size = 0;

    public static boolean isEmpty() {
        return queue_size == 0;
    }

    public static void enqueue(int val) {
        Node curr = new Node(val);
        if (tail == null) {
            head = tail = curr;
        } else {
            tail.next = curr;
            tail = curr;
        }
        queue_size++;
    }

    public static void dequeue() {
        if (isEmpty()) {
            System.out.println("Queue Underflow");
            return;
        }
        Node temp = head;
        head = head.next;
        if (head == null) {
            tail = null;
        }
        queue_size--;
    }

    public static int peek() {
        if (isEmpty()) return -1;
        return head.val;
    }

    public static void display() {
        Node ptr = head;
        while (ptr != null) {
            System.out.print(ptr.val + " ");
            ptr = ptr.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        enqueue(10);
        enqueue(20);
        enqueue(30);
        display();
        
        dequeue();
        display();
        
        enqueue(40);
        display();
        
        System.out.println("Front: " + peek());
        
        dequeue();
        dequeue();
        dequeue(); // Empties the queue
        display();
    }
}`,
        js: `function createNode(val) {
    return { val, next: null };
}

// Variables mapped directly to the runtime scope for floating badges
let head = null;
let tail = null;
let queue_size = 0;

function isEmpty() {
    return queue_size === 0;
}

function enqueue(val) {
    const curr = createNode(val);
    if (!tail) {
        head = tail = curr;
    } else {
        tail.next = curr;
        tail = curr;
    }
    queue_size++;
}

function dequeue() {
    if (isEmpty()) {
        console.log("Queue Underflow");
        return;
    }
    const temp = head;
    head = head.next;
    if (!head) {
        tail = null;
    }
    queue_size--;
    return temp.val;
}

function peek() {
    if (isEmpty()) return -1;
    return head.val;
}

function display() {
    let ptr = head;
    let res = [];
    while (ptr) {
        res.push(ptr.val);
        ptr = ptr.next;
    }
    console.log(res.join(" "));
}

enqueue(10);
enqueue(20);
enqueue(30);
display();

dequeue();
display();

enqueue(40);
display();

console.log("Front:", peek());

dequeue();
dequeue();
dequeue(); // Empties the queue
display();`,
      },
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
        {
          tag: "p",
          text: "Given an array and a window size k, Sliding Window Maximum asks for the maximum value within every contiguous window of size k as it slides from the start of the array to the end. The brute-force approach recomputes the maximum from scratch for every window position, costing O(nk) — a monotonic deque solves it in O(n) total, regardless of k.",
        },
        {
          tag: "p",
          text: "The technique maintains a deque of INDICES (not values) kept in strictly decreasing order of their corresponding VALUES from front to back — so the front of the deque always holds the index of the current window's maximum. As the window slides, indices that fall outside the window are removed from the front, and any index whose value is beaten by a new arriving element is removed from the back (since it can never be the maximum again, exactly like the monotonic stack pattern).",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The literal sliding-window-maximum (or minimum, with the deque direction flipped) problem",
            "Any 'maximum/minimum over every window of size k' query — this beats a heap-based O(n log k) approach with a true O(n) bound",
            "Streaming data analysis where a running max/min over the most recent k data points must be maintained efficiently in real time",
            "As a building block for more complex sliding-window DP optimisations, where a monotonic deque can shave an O(k) or O(log k) factor off an otherwise slower per-window computation",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "The monotonic deque here is the natural 'queue version' of the monotonic stack from the Stacks section — same core idea (pop invalidated elements before pushing), but now elements ALSO need to be removed from the opposite end once they age out of the window.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          {
            tag: "p",
            text: "Every element must be pushed onto the deque at least once to be considered as a potential window maximum — there's no shortcut even for the most favourable value arrangement.",
          },
          {
            tag: "ul",
            items: [
              "n elements, each pushed exactly once: O(n)",
              "Best case still requires the full single pass to correctly determine every window's maximum",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          {
            tag: "p",
            text: "Identical amortised-analysis argument to the monotonic stack: every element is pushed exactly once and removed (from either the front, due to expiring out of the window, or the back, due to being beaten by a larger value) at most once across the entire algorithm.",
          },
          {
            tag: "ul",
            items: [
              "Total pushes across the whole run: exactly n",
              "Total removals (front + back combined) across the whole run: at most n",
              "Combined: O(n), regardless of how removals are distributed across iterations",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          {
            tag: "p",
            text: "Even the input arrangement causing the most back-removal in a single iteration (e.g. a strictly increasing run suddenly capped, popping many elements at once) doesn't break the amortised O(n) bound, since the total work is accounted for across the entire run, not per iteration.",
          },
          {
            tag: "ul",
            items: [
              "Worst case matches best/average exactly: O(n)",
              "This is a dramatic improvement over the brute-force O(nk) approach and even beats a max-heap-based O(n log k) approach",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          {
            tag: "p",
            text: "If the array is strictly decreasing, each new element immediately becomes the sole occupant of the deque (since it's smaller than everything already there, it gets appended, but everything BEFORE it that's now within range was already larger and stays — actually for the deque to stay at size 1, values would need to be strictly increasing, immediately invalidating everything before): the deque size is bounded by the window size k in all cases, with O(1) being achievable only in special strictly-favourable sub-cases.",
          },
          {
            tag: "ul",
            items: [
              "Deque size is always bounded above by k, the window size, regardless of value arrangement — best case can be as small as O(1) for specific patterns",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(k)" },
          {
            tag: "p",
            text: "The deque can never hold more than k elements at once, since indices that fall outside the current window are always removed from the front regardless of their value — this caps the deque's size structurally, not just by happenstance.",
          },
          {
            tag: "ul",
            items: [
              "Deque: bounded by O(k), the window size, regardless of input value distribution",
              "Output array (one maximum per window): O(n − k + 1) = O(n)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(k)" },
          {
            tag: "p",
            text: "If the array is strictly decreasing within every window (so nothing ever gets removed from the back, only eventually from the front as the window slides), the deque holds close to its maximum possible size of k throughout.",
          },
          {
            tag: "ul",
            items: [
              "Deque: up to O(k), the structural maximum imposed by the window-boundary removal rule",
              "Total space including output: O(n + k) = O(n), since k ≤ n always",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function maxSlidingWindow(arr, k):
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

    return result`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Maintain a deque of indices kept in strictly decreasing order of their VALUES from front to back — the front always represents the largest value currently within the active window.",
            "For each new index i, first remove any index from the FRONT of the deque that has aged out of the current window (its index is too far behind i to still be within the k-wide range).",
            "Next, remove any index from the BACK of the deque whose value is smaller than arr[i] — those values can never be the maximum of any future window that also contains i, since arr[i] is both more recent and at least as large.",
            "Push the current index i onto the back of the deque.",
            "Once the window has reached its full size (i ≥ k − 1), the front of the deque holds the index of the current window's maximum — record its value in the result.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The deque invariant — strictly decreasing values from front to back, containing only indices within the current window — is maintained by two complementary removal rules: front-removal correctly discards indices that have physically left the window's range, and back-removal correctly discards values that can never again be the maximum, since any future window containing both the discarded index and i would prefer i's value (it's both newer, so it stays in range longer, and at least as large). Because every surviving index in the deque is genuinely both in-range and 'still competitive', and the deque remains sorted in decreasing order, the front element is guaranteed to be the maximum of all currently-valid candidates — which is exactly the maximum of the current window.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <deque>

using namespace std;

vector<int> maxSlidingWindow(const vector<int>& nums, int k) {
    deque<int> dequeue; 
    vector<int> ans;

    for (int i = 0; i < nums.size(); i++) {
        // Remove elements not within the window
        if (!dequeue.empty() && dequeue.front() == i - k) {
            dequeue.pop_front();
        }
        
        // Remove elements smaller than the current element
        while (!dequeue.empty() && nums[dequeue.back()] < nums[i]) {
            dequeue.pop_back();
        }
        
        dequeue.push_back(i);
        
        // Push the maximum element of the current window
        if (i >= k - 1) {
            ans.push_back(nums[dequeue.front()]);
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
        python: `from collections import deque

def max_sliding_window(nums, k):
    dequeue = deque()
    ans = []
    
    for i in range(len(nums)):
        if dequeue and dequeue[0] == i - k:
            dequeue.popleft()
            
        while dequeue and nums[dequeue[-1]] < nums[i]:
            dequeue.pop()
            
        dequeue.append(i)
        
        if i >= k - 1:
            ans.append(nums[dequeue[0]])
            
    return ans

if __name__ == "__main__":
    nums = [1, 3, -1, -3, 5, 3, 6, 7]
    k = 3
    print(max_sliding_window(nums, k))`,
        java: `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static List<Integer> maxSlidingWindow(int[] nums, int k) {
        Deque<Integer> dequeue = new ArrayDeque<>();
        List<Integer> ans = new ArrayList<>();
        
        for (int i = 0; i < nums.length; i++) {
            if (!dequeue.isEmpty() && dequeue.peekFirst() == i - k) {
                dequeue.pollFirst();
            }
            
            while (!dequeue.isEmpty() && nums[dequeue.peekLast()] < nums[i]) {
                dequeue.pollLast();
            }
            
            dequeue.offerLast(i);
            
            if (i >= k - 1) {
                ans.add(nums[dequeue.peekFirst()]);
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
        js: `function maxSlidingWindow(nums, k) {
    const dequeue = [];
    const ans = [];
    let head = 0; // Simulate O(1) popFront
    
    for (let i = 0; i < nums.length; i++) {
        if (head < dequeue.length && dequeue[head] === i - k) {
            head++;
        }
        
        while (dequeue.length > head && nums[dequeue[dequeue.length - 1]] < nums[i]) {
            dequeue.pop();
        }
        
        dequeue.push(i);
        
        if (i >= k - 1) {
            ans.push(nums[dequeue[head]]);
        }
    }
    return ans;
}

const nums = [1, 3, -1, -3, 5, 3, 6, 7];
const k = 3;
console.log(maxSlidingWindow(nums, k));`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
           3 CIRCULAR QUEUE (LINKED LIST)
        ════════════════════════════════════════════════════════════════════ */
    {
      name: "Circular Queue (Linked List)",
      href: "/algorithms/queues/circular-linked-list",
      type: "Medium",

      about: [
        { tag: "h1", text: "Circular Queue (Linked List)" },
        {
          tag: "p",
          text: "While a standard linked-list queue requires two pointers (head and tail) to achieve O(1) operations, a Circular Linked List reduces this structural overhead to a single pointer. By linking the last node's 'next' reference back to the first node, the structure forms a closed loop.",
        },
        {
          tag: "p",
          text: "Because of this loop, you only need to track the 'tail' node. The front of the queue (the 'head') is always instantly accessible via `tail.next`. This allows you to enqueue at the back and dequeue from the front seamlessly while maintaining strict O(1) time complexity and infinite dynamic growth (unlike an array-backed circular buffer).",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "When you need an unbounded queue that never triggers array reallocation pauses, but you want to minimize pointer memory overhead.",
            "Round-robin scheduling algorithms (e.g., CPU time slicing, multiplayer turn management) where you continuously cycle through a list of active tasks/players.",
            "Multi-process coordination loops where the 'end' of a sequence naturally flows back into the 'beginning' without requiring edge-case logic.",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "SDE Insight: The single-pointer circular linked list is a classic demonstration of memory efficiency. By sacrificing the implicit 'null' termination of a standard list, you gain cyclical iteration and drop the requirement for a separate head pointer.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "Both enqueue and dequeue perform a strictly bounded sequence of pointer reassignment operations.",
          },
          {
            tag: "ul",
            items: [
              "Enqueue: Allocate node, point it to tail.next (the head), and reassign tail.next to the new node — O(1)",
              "Dequeue: Reassign tail.next to bypass the current head, then deallocate the old head — O(1)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          {
            tag: "p",
            text: "There is no searching or shifting required. The runtime remains flawlessly constant.",
          },
          { tag: "ul", items: ["Strictly O(1) execution time across all queue sizes and loads."] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          {
            tag: "p",
            text: "Like all linked-list paradigms, the structure allocates memory dynamically per element. It avoids the catastrophic O(n) resizing penalties associated with arrays.",
          },
          { tag: "ul", items: ["O(1) continuous performance."] },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          {
            tag: "p",
            text: "The queue consumes memory proportional to the precise number of elements currently stored.",
          },
          {
            tag: "ul",
            items: ["n nodes — O(n)", "Exactly ONE tracking pointer (`tail`) — O(1) overhead"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          {
            tag: "p",
            text: "Memory allocation perfectly mirrors active usage. The structure never allocates phantom space.",
          },
          {
            tag: "ul",
            items: ["The space is O(n), where `n` is the current number of active elements."],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "Memory overhead grows linearly with insertions until the heap is exhausted.",
          },
          { tag: "ul", items: ["Total space is exactly n nodes."] },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `class Node:
    value
    next ← null

class CircularLinkedListQueue:
    tail ← null
    size ← 0

    function enqueue(val):
        newNode ← new Node(val)
        if tail is null:
            tail ← newNode
            tail.next ← tail          // Points to itself to form the loop
        else:
            newNode.next ← tail.next  // New node points to current head
            tail.next ← newNode       // Current tail points to new node
            tail ← newNode            // Advance tail to the new node
        size ← size + 1

    function dequeue():
        if tail is null:
            return ERROR_UNDERFLOW
            
        head ← tail.next
        dequeuedValue ← head.value
        
        if tail == head:
            // Only one element was in the queue
            tail ← null
        else:
            // Bypass the head node
            tail.next ← head.next
            
        size ← size − 1
        return dequeuedValue`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialization: Maintain a single `tail` pointer and a `size` counter.",
            "Enqueue (Empty): If the queue is empty, assign `tail` to the new node, and crucially, point `tail.next` to itself. This establishes the initial closed loop.",
            "Enqueue (Active): The new node needs to become the new tail. It must point to the front of the queue (`tail.next`). Then, the old tail's next pointer is updated to attach the new node. Finally, the `tail` pointer is shifted to the new node.",
            "Dequeue: The item to remove is always at `tail.next` (the head). If `tail` and `tail.next` are the same node, removing it leaves the queue empty (`tail = null`). Otherwise, simply bypass the head by linking `tail.next` to `head.next`.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "By maintaining a continuous loop, the list eliminates the physical boundary between the front and back of the queue. The `tail` pointer acts as a rotating anchor on this ring. Because `tail.next` invariably points to the oldest node, and we append strictly behind `tail`, the FIFO (First-In-First-Out) guarantee is flawlessly maintained.",
        },
      ],
      codes: {
        "c++": `#include <iostream>

using namespace std;

// SHAPE: Contains 'val' and 'next' -> TRIGGERS: <LinkedList /> automatically
struct Node {
    int val;
    Node* next;
    Node(int v) : val(v), next(nullptr) {}
};

// AUTO-BOUND: 'tail' will attach as a floating badge
Node* tail = nullptr;
int queue_size = 0;

bool isEmpty() {
    return tail == nullptr;
}

void enqueue(int val) {
    Node* newNode = new Node(val);
    if (isEmpty()) {
        tail = newNode;
        tail->next = tail; // Loop back to itself
    } else {
        newNode->next = tail->next; // Point new node to head
        tail->next = newNode;       // Link old tail to new node
        tail = newNode;             // Shift tail pointer
    }
    queue_size++;
}

void dequeue() {
    if (isEmpty()) {
        cout << "Queue Underflow\\n";
        return;
    }
    
    Node* head = tail->next; // Temporarily isolate the head
    
    if (tail == head) {
        // Only one node exists
        tail = nullptr;
    } else {
        // Bypass the head node
        tail->next = head->next;
    }
    
    delete head;
    queue_size--;
}

int peek() {
    if (isEmpty()) return -1;
    return tail->next->val; // Head is always tail->next
}

void display() {
    if (isEmpty()) return;
    
    Node* head = tail->next;
    Node* curr = head;
    
    do {
        cout << curr->val << " ";
        curr = curr->next;
    } while (curr != head); // Stop when we loop back to the start
    
    cout << "\\n";
}

int main() {
    enqueue(10);
    enqueue(20);
    enqueue(30);
    display(); // 10 20 30

    dequeue();
    display(); // 20 30

    enqueue(40);
    display(); // 20 30 40

    cout << "Front: " << peek() << "\\n"; // 20

    dequeue();
    dequeue();
    dequeue(); // Empties the queue
    
    enqueue(50);
    display(); // 50
    
    return 0;
}`,
        python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

# Global pointers for visualizer mapping
tail = None
queue_size = 0

def is_empty():
    global tail
    return tail is None

def enqueue(val):
    global tail, queue_size
    new_node = Node(val)
    if is_empty():
        tail = new_node
        tail.next = tail  # Loop back
    else:
        new_node.next = tail.next
        tail.next = new_node
        tail = new_node
    queue_size += 1

def dequeue():
    global tail, queue_size
    if is_empty():
        print("Queue Underflow")
        return
        
    head = tail.next
    if tail == head:
        tail = None
    else:
        tail.next = head.next
        
    queue_size -= 1

def peek():
    global tail
    if is_empty():
        return -1
    return tail.next.val

def display():
    global tail
    if is_empty():
        return
        
    head = tail.next
    curr = head
    res = []
    
    while True:
        res.append(str(curr.val))
        curr = curr.next
        if curr == head:
            break
            
    print(" ".join(res))

if __name__ == "__main__":
    enqueue(10)
    enqueue(20)
    enqueue(30)
    display()
    
    dequeue()
    display()
    
    enqueue(40)
    display()
    
    print(f"Front: {peek()}")
    
    dequeue()
    dequeue()
    dequeue()
    
    enqueue(50)
    display()`,
        java: `public class Main {
    // SHAPE: Contains 'val' and 'next' -> TRIGGERS: <LinkedList />
    static class Node {
        int val;
        Node next;
        Node(int val) { this.val = val; }
    }

    // Static scope variables for visualizer mapping
    static Node tail = null;
    static int queue_size = 0;

    public static boolean isEmpty() {
        return tail == null;
    }

    public static void enqueue(int val) {
        Node newNode = new Node(val);
        if (isEmpty()) {
            tail = newNode;
            tail.next = tail;
        } else {
            newNode.next = tail.next;
            tail.next = newNode;
            tail = newNode;
        }
        queue_size++;
    }

    public static void dequeue() {
        if (isEmpty()) {
            System.out.println("Queue Underflow");
            return;
        }
        
        Node head = tail.next;
        if (tail == head) {
            tail = null;
        } else {
            tail.next = head.next;
        }
        queue_size--;
    }

    public static int peek() {
        if (isEmpty()) return -1;
        return tail.next.val;
    }

    public static void display() {
        if (isEmpty()) return;
        
        Node head = tail.next;
        Node curr = head;
        
        do {
            System.out.print(curr.val + " ");
            curr = curr.next;
        } while (curr != head);
        
        System.out.println();
    }

    public static void main(String[] args) {
        enqueue(10);
        enqueue(20);
        enqueue(30);
        display();
        
        dequeue();
        display();
        
        enqueue(40);
        display();
        
        System.out.println("Front: " + peek());
        
        dequeue();
        dequeue();
        dequeue();
        
        enqueue(50);
        display();
    }
}`,
        js: `function createNode(val) {
    return { val, next: null };
}

// Global scope variables for visualizer tracking
let tail = null;
let queue_size = 0;

function isEmpty() {
    return tail === null;
}

function enqueue(val) {
    const newNode = createNode(val);
    if (isEmpty()) {
        tail = newNode;
        tail.next = tail;
    } else {
        newNode.next = tail.next;
        tail.next = newNode;
        tail = newNode;
    }
    queue_size++;
}

function dequeue() {
    if (isEmpty()) {
        console.log("Queue Underflow");
        return;
    }
    
    const head = tail.next;
    if (tail === head) {
        tail = null;
    } else {
        tail.next = head.next;
    }
    queue_size--;
}

function peek() {
    if (isEmpty()) return -1;
    return tail.next.val;
}

function display() {
    if (isEmpty()) return;
    
    const head = tail.next;
    let curr = head;
    const res = [];
    
    do {
        res.push(curr.val);
        curr = curr.next;
    } while (curr !== head);
    
    console.log(res.join(" "));
}

enqueue(10);
enqueue(20);
enqueue(30);
display();

dequeue();
display();

enqueue(40);
display();

console.log("Front:", peek());

dequeue();
dequeue();
dequeue();

enqueue(50);
display();`,
      },
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
        {
          tag: "p",
          text: "A deque (pronounced 'deck') is a generalized hybrid data structure that provides strictly bounded O(1) insertions and deletions at BOTH the front and the back. It serves as a strict superset of both Stacks and Queues—if you restrict operations to one end, it behaves as a Stack; if you write to one end and read from the other, it behaves identically to a Queue.",
        },
        {
          tag: "p",
          text: "At the systems level, Deques are typically implemented in one of two ways: as a Doubly Linked List (where symmetry is achieved via bidirectional pointers), or as a dynamic Ring Buffer (an array-backed circular queue capable of resizing). While dynamic arrays offer superior CPU cache locality, the Doubly Linked List implementation guarantees worst-case O(1) operations without occasional reallocation latency spikes.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Sliding Window Extremes: The foundation for the 'Monotonic Deque' pattern used to track rolling maximums or minimums in strict O(n) time.",
            "Work-Stealing Schedulers: In multithreaded runtimes (like Go or Java's ForkJoinPool), threads push/pop tasks from the back of their own deque, but idle threads 'steal' tasks from the front of other threads' deques to minimize lock contention.",
            "Undo/Redo Systems & Browser History: Scenarios requiring seamless navigation and truncation from both the oldest and newest boundaries of a dataset.",
            "Palindrome Checkers: A trivial implementation where you consume characters simultaneously from both the front and back, comparing them inward.",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "SDE Insight: When in doubt during a technical interview, default to a Deque over a primitive Stack or Queue. Standard library implementations (like Python's `collections.deque` or Java's `ArrayDeque`) are heavily optimized and mathematically identical in asymptotic cost, but give you the flexibility to adapt if the problem requirements shift.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "A DLL-backed deque executes a fixed sequence of symmetric pointer reassignments regardless of which end is targeted.",
          },
          {
            tag: "ul",
            items: [
              "pushFront / pushBack: Allocate one node, rewire two adjacent node pointers, and update the boundary pointer — O(1)",
              "popFront / popBack: Read the value, advance the boundary pointer inward, nullify the orphaned pointer, and deallocate — O(1)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          {
            tag: "p",
            text: "The architectural symmetry of a Doubly Linked List guarantees that neither boundary operation ever requires traversal into the list's interior.",
          },
          {
            tag: "ul",
            items: [
              "All four core operations remain strictly deterministic and evaluate in constant time.",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          {
            tag: "p",
            text: "Unlike a dynamic-array-backed Deque (which can suffer from amortized O(n) reallocation penalties during capacity expansions), the pointer-based approach avoids bulk memory copies entirely.",
          },
          {
            tag: "ul",
            items: ["The time bound remains perfectly uniform under all theoretical loads."],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          {
            tag: "p",
            text: "The structure allocates memory exclusively for active elements, with no over-provisioning.",
          },
          {
            tag: "ul",
            items: [
              "n discrete nodes containing data — O(n)",
              "However, each node carries a heavier O(1) overhead penalty compared to a standard queue, requiring two tracking pointers (`prev` and `next`).",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          {
            tag: "p",
            text: "Memory allocation scales exactly linearly. The memory footprint dynamically expands and contracts in lockstep with the payload.",
          },
          {
            tag: "ul",
            items: ["O(n) space complexity, constrained only by the operating environment's heap."],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "The asymptotic memory overhead never exceeds linear bounds." },
          {
            tag: "ul",
            items: [
              "Pointer overhead creates a higher constant factor than an array, but it remains fundamentally O(n).",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Doubly-linked-list-backed implementation (Sentinel-free):" },
        {
          tag: "code",
          language: "text",
          text: `class Node:
    value
    next ← null
    prev ← null

class Deque:
    front ← null
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
        if front is null: return ERROR_UNDERFLOW
        
        dequeuedValue ← front.value
        front ← front.next
        
        if front is not null: 
            front.prev ← null
        else: 
            back ← null       // The Deque is now completely empty
            
        size ← size − 1
        return dequeuedValue

    function popBack():
        if back is null: return ERROR_UNDERFLOW
        
        dequeuedValue ← back.value
        back ← back.prev
        
        if back is not null: 
            back.next ← null
        else: 
            front ← null      // The Deque is now completely empty
            
        size ← size − 1
        return dequeuedValue`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Symmetric Boundaries: Establish a `front` pointer and a `back` pointer to anchor the two extremes of the doubly linked chain.",
            "Push Operations: Both `pushFront` and `pushBack` are mirror images. You instantiate a new node, point its inward-facing reference (either `next` or `prev`) to the current boundary node, instruct the boundary node to point back, and finally shift the boundary tracking pointer outward to the new node.",
            "Pop Operations: `popFront` and `popBack` operate on the exact same mirrored logic. Cache the value of the targeted boundary node, shift the boundary pointer one step inward, and explicitly sever the outgoing pointer of the new boundary node.",
            "Crucial Collapse Check: Whenever a pop operation occurs, you must check if the inward shift caused the boundary pointer to become null. If it did, it means the last remaining node was deleted, and you must explicitly nullify the opposite boundary pointer to prevent it from aiming at dead memory.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The architecture relies entirely on local pointer manipulation. Because every node intimately knows both its predecessor and successor, operations executed at the `front` boundary require absolutely zero knowledge of the state, depth, or location of the `back` boundary (and vice versa). This decoupling guarantees constant-time operations, while the simultaneous nullification checks safely bind the two ends back together when the structure empties.",
        },
      ],
      codes: {
        "c++": `#include <iostream>

using namespace std;

// SHAPE: Contains 'val', 'next', and 'prev' -> TRIGGERS: <LinkedList /> automatically
struct Node {
    int val;
    Node* next;
    Node* prev;
    Node(int v) : val(v), next(nullptr), prev(nullptr) {}
};

Node* front = nullptr;
Node* rear = nullptr;
int deque_size = 0;

bool isEmpty() {
    return deque_size == 0;
}

void pushFront(int val) {
    Node* newNode = new Node(val);
    if (isEmpty()) {
        front = rear = newNode;
    } else {
        newNode->next = front;
        front->prev = newNode;
        front = newNode;
    }
    deque_size++;
}

void pushBack(int val) {
    Node* newNode = new Node(val);
    if (isEmpty()) {
        front = rear = newNode;
    } else {
        newNode->prev = rear;
        rear->next = newNode;
        rear = newNode;
    }
    deque_size++;
}

void popFront() {
    if (isEmpty()) {
        cout << "Deque Underflow\\n";
        return;
    }
    Node* temp = front;
    front = front->next;
    
    if (front) {
        front->prev = nullptr;
    } else {
        rear = nullptr; // Queue collapsed to empty
    }
    
    delete temp;
    deque_size--;
}

void popBack() {
    if (isEmpty()) {
        cout << "Deque Underflow\\n";
        return;
    }
    Node* temp = rear;
    rear = rear->prev;
    
    if (rear) {
        rear->next = nullptr;
    } else {
        front = nullptr; // Queue collapsed to empty
    }
    
    delete temp;
    deque_size--;
}

void display() {
    Node* curr = front;
    while(curr) {
        cout << curr->val << " ";
        curr = curr->next;
    }
    cout << "\\n";
}

int main() {
    pushBack(20);
    pushBack(30);
    display(); // 20 30

    pushFront(10);
    display(); // 10 20 30

    popBack();
    display(); // 10 20

    popFront();
    display(); // 20
    
    popFront(); // Empties
    display();

    return 0;
}`,
        python: `class Node:
    def __init__(self, val):
        self.val = val
        self.next = None
        self.prev = None

# Global execution scope variables for VisualGround badge attachment
front = None
rear = None
deque_size = 0

def is_empty():
    global deque_size
    return deque_size == 0

def push_front(val):
    global front, rear, deque_size
    new_node = Node(val)
    if is_empty():
        front = rear = new_node
    else:
        new_node.next = front
        front.prev = new_node
        front = new_node
    deque_size += 1

def push_back(val):
    global front, rear, deque_size
    new_node = Node(val)
    if is_empty():
        front = rear = new_node
    else:
        new_node.prev = rear
        rear.next = new_node
        rear = new_node
    deque_size += 1

def pop_front():
    global front, rear, deque_size
    if is_empty():
        print("Deque Underflow")
        return
        
    temp = front
    front = front.next
    
    if front:
        front.prev = None
    else:
        rear = None
        
    deque_size -= 1

def pop_back():
    global front, rear, deque_size
    if is_empty():
        print("Deque Underflow")
        return
        
    temp = rear
    rear = rear.prev
    
    if rear:
        rear.next = None
    else:
        front = None
        
    deque_size -= 1

def display():
    curr = front
    res = []
    while curr:
        res.append(str(curr.val))
        curr = curr.next
    print(" ".join(res))

if __name__ == "__main__":
    push_back(20)
    push_back(30)
    display()

    push_front(10)
    display()

    pop_back()
    display()

    pop_front()
    display()
    
    pop_front() # Empties queue`,
        java: `public class Main {
    static class Node {
        int val;
        Node next, prev;
        Node(int val) { this.val = val; }
    }

    // Static scope maps directly to runtime tracking for the visualizer
    static Node front = null;
    static Node rear = null;
    static int deque_size = 0;

    public static boolean isEmpty() {
        return deque_size == 0;
    }

    public static void pushFront(int val) {
        Node newNode = new Node(val);
        if (isEmpty()) {
            front = rear = newNode;
        } else {
            newNode.next = front;
            front.prev = newNode;
            front = newNode;
        }
        deque_size++;
    }

    public static void pushBack(int val) {
        Node newNode = new Node(val);
        if (isEmpty()) {
            front = rear = newNode;
        } else {
            newNode.prev = rear;
            rear.next = newNode;
            rear = newNode;
        }
        deque_size++;
    }

    public static void popFront() {
        if (isEmpty()) {
            System.out.println("Deque Underflow");
            return;
        }
        
        front = front.next;
        if (front != null) {
            front.prev = null;
        } else {
            rear = null;
        }
        deque_size--;
    }

    public static void popBack() {
        if (isEmpty()) {
            System.out.println("Deque Underflow");
            return;
        }
        
        rear = rear.prev;
        if (rear != null) {
            rear.next = null;
        } else {
            front = null;
        }
        deque_size--;
    }

    public static void display() {
        Node curr = front;
        while (curr != null) {
            System.out.print(curr.val + " ");
            curr = curr.next;
        }
        System.out.println();
    }

    public static void main(String[] args) {
        pushBack(20);
        pushBack(30);
        display();

        pushFront(10);
        display();

        popBack();
        display();

        popFront();
        display();
        
        popFront(); // Empties
        display();
    }
}`,
        js: `function createNode(val) {
    return { val, next: null, prev: null };
}

// Flat variables for visualizer mapping
let front = null;
let rear = null;
let deque_size = 0;

function isEmpty() {
    return deque_size === 0;
}

function pushFront(val) {
    const newNode = createNode(val);
    if (isEmpty()) {
        front = rear = newNode;
    } else {
        newNode.next = front;
        front.prev = newNode;
        front = newNode;
    }
    deque_size++;
}

function pushBack(val) {
    const newNode = createNode(val);
    if (isEmpty()) {
        front = rear = newNode;
    } else {
        newNode.prev = rear;
        rear.next = newNode;
        rear = newNode;
    }
    deque_size++;
}

function popFront() {
    if (isEmpty()) {
        console.log("Deque Underflow");
        return;
    }
    
    front = front.next;
    if (front) {
        front.prev = null;
    } else {
        rear = null;
    }
    deque_size--;
}

function popBack() {
    if (isEmpty()) {
        console.log("Deque Underflow");
        return;
    }
    
    rear = rear.prev;
    if (rear) {
        rear.next = null;
    } else {
        front = null;
    }
    deque_size--;
}

function display() {
    let curr = front;
    let res = [];
    while (curr) {
        res.push(curr.val);
        curr = curr.next;
    }
    console.log(res.join(" "));
}

pushBack(20);
pushBack(30);
display();

pushFront(10);
display();

popBack();
display();

popFront();
display();

popFront(); // Empties
display();`,
      },
    },
  ],
  desc: "Deque, sliding window max, BFS patterns",
  complexity: "O(n)",
  featured: true,
};

/*
const QUEUES_SECTION = {
  name: "Queues",
  href: "/algorithms/queues",
    iconId: "Queue",
    hoverIconId: "Queue",

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
