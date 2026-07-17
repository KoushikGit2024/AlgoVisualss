const HEAP_SECTION = {
  name: "Heap",
  href: "/algorithms/heap",
    iconId: "Heap",
    hoverIconId: "Heap",

  about: [
    { tag: "h1", text: "Heap" },
    { tag: "p", text: "A heap is a complete binary tree (array-backed, no pointers needed) satisfying the heap property: in a min-heap, every parent is ≤ its children; in a max-heap, every parent is ≥ its children. This guarantees the minimum (or maximum) element is always at the root, retrievable in O(1), while insertion and removal of that root both cost O(log n) — a heap deliberately gives up full sorted order to get a much cheaper 'give me the extreme element' operation." },
    { tag: "p", text: "The recurring theme across every algorithm in this section is the same trade-off: a heap is the right structure exactly when you repeatedly need 'the current best/smallest/largest of what remains' and don't care about the relative order of everything else. If you needed FULL sorted order, you'd just sort (or use a self-balancing BST); a heap's entire value proposition is being cheaper than full ordering when you only ever need the extreme element, repeatedly." },
    { tag: "h2", text: "The 'k' trick: bounding heap size" },
    { tag: "p", text: "A huge fraction of heap-based algorithms achieve their efficiency by deliberately keeping the heap small — size k, not size n — even when processing n total elements. Maintaining a heap of size k and discarding anything that can't possibly improve the current top-k answer turns an O(n log n) full-sort-based approach into O(n log k), which is a meaningful improvement whenever k is much smaller than n (e.g. finding the top 10 of a billion records)." },
    { tag: "table",
      headers: ["Algorithm", "Heap Type & Size", "Core Technique"],
      rows: [
        ["Kth Largest Element", "Min-heap, size k", "Keep only the k largest seen so far; the heap's root is the answer"],
        ["Merge K Sorted Lists", "Min-heap, size ≤ k", "Always extract the globally smallest 'current front' across k lists"],
        ["Top K Frequent Elements", "Min-heap, size k (by frequency)", "Same size-k-heap trick, keyed by frequency instead of value"],
        ["Find Median from Data Stream", "Two heaps (max-heap + min-heap), combined size n", "Split the stream into a 'lower half' max-heap and 'upper half' min-heap, kept balanced"]
      ]
    },
    { tag: "note", variant: "tip", text: "Watch for the counter-intuitive heap-type choice in 'Kth Largest': a MIN-heap of size k (not a max-heap) is what's used — because the smallest element of the top-k group is exactly the one you want to compare new candidates against, and the smallest element of a min-heap is its O(1)-accessible root." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. KTH LARGEST ELEMENT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Kth Largest Element",
      href: "/algorithms/heap/kth-largest",
      type: "Medium",

      about: [
        { tag: "h1", text: "Kth Largest Element" },
        { tag: "p", text: "Given an unsorted array, find the Kth largest element (the Kth largest VALUE, counting duplicates separately, not the Kth distinct value). Full sorting solves this in O(n log n), but a min-heap of size k achieves O(n log k) — a meaningful improvement whenever k is small relative to n, which is the common case (e.g. 'find the 5th highest score among a million submissions')." },
        { tag: "p", text: "The technique maintains a min-heap containing exactly the k largest elements seen so far. For every new element, if the heap has fewer than k elements, it's added unconditionally; once the heap has k elements, a new element is only added (after evicting the current minimum) if it's larger than the heap's current minimum — meaning it genuinely belongs among the top k. After processing the entire array, the heap's root (its minimum) is exactly the Kth largest element overall." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding the Kth largest (or smallest, with a max-heap instead) element when k is much smaller than n, avoiding the cost of fully sorting the entire dataset",
          "Streaming data scenarios where you need to maintain 'the current Kth largest seen so far' as new elements continuously arrive, without re-sorting from scratch on every new arrival",
          "As the direct foundation for Top K Frequent Elements (below), which applies the exact same size-k-min-heap technique, just keyed by frequency instead of raw value",
          "QuickSelect (a Quick-Sort-partition-based alternative) achieves O(n) average case for this same problem, but with O(n²) worst case and no support for STREAMING input — the heap approach trades some average-case speed for streaming capability and a reliable O(n log k) bound"
        ]},
        { tag: "note", variant: "tip", text: "Don't use a max-heap of the full array for this problem — that would require O(n) heap construction plus k extractions at O(log n) each, giving O(n + k log n), which is WORSE than the size-k min-heap's O(n log k) whenever k is small relative to n." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log k)",
        best: [
          { tag: "h2", text: "Best Case — O(n log k)" },
          { tag: "p", text: "Every element must be at least compared against the heap's current minimum (an O(1) check) to determine whether it belongs in the top k — there's no shortcut even for the most favourable arrangement, since this comparison is required to maintain correctness." },
          { tag: "ul", items: [
            "n elements, each requiring at minimum an O(1) comparison against the heap's root",
            "If most elements are smaller than the current minimum (best case for SKIPPING heap modification), most of those n comparisons are O(1) and only the first k insertions cost O(log k) each: O(k log k) + O(n) = O(n) for very favourable inputs, but classified O(n log k) as the general structural bound"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log k)" },
          { tag: "p", text: "For typical input, a meaningful fraction of the n elements will be large enough to warrant a heap insertion (push + pop of the current min), each costing O(log k)." },
          { tag: "ul", items: [
            "n elements, each requiring an O(1) comparison plus, for elements that qualify, an O(log k) heap insertion-and-eviction: O(n log k) total",
            "Since k ≤ n always, this is never worse than O(n log n), and is strictly better whenever k is meaningfully smaller than n"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log k)" },
          { tag: "p", text: "If the array is sorted in strictly increasing order, every single element from some point onward triggers a heap insertion (since each new element is larger than everything seen before it), maximising the number of O(log k) operations." },
          { tag: "ul", items: [
            "Worst case: up to n elements each requiring an O(log k) heap operation: O(n log k)",
            "This remains the standard bound regardless of input arrangement — no input configuration pushes the cost beyond O(n log k)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(k)" },
          { tag: "p", text: "The heap is deliberately bounded to hold at most k elements at any time, regardless of how many total elements (n) have been processed — this is the entire structural point of the technique." },
          { tag: "ul", items: ["Heap: at most k elements — O(k)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(k)" },
          { tag: "p", text: "Space usage is fixed by k alone, since the algorithm actively evicts the minimum whenever the heap would exceed size k — it never grows proportionally to n." },
          { tag: "ul", items: ["Heap: O(k), regardless of n or value distribution — a dramatic space saving over full-sort approaches when k ≪ n"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(k)" },
          { tag: "p", text: "No input configuration grows the heap beyond k elements — this is an enforced structural invariant, not just a typical-case behaviour." },
          { tag: "ul", items: ["Heap: strictly bounded at O(k), identical across all cases — this is the key advantage over full-array sorting's O(n) space requirement"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function findKthLargest(nums, k):
    queue_minHeap ← empty min-heap

    for num in nums:
        push(queue_minHeap, num)
        if size(queue_minHeap) > k:
            pop(queue_minHeap)            // evict the current smallest of the top-k candidates

    return peek(queue_minHeap)            // the heap's minimum is the Kth largest overall` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a min-heap that is never allowed to exceed size k.",
          "For each new element, push it onto the heap unconditionally — this might temporarily grow the heap to size k+1.",
          "If the heap now exceeds size k, pop the minimum — this correctly evicts whichever element among the current top-(k+1) candidates is the smallest, since a min-heap's pop always removes the minimum.",
          "After processing all n elements, exactly k elements remain in the heap: the k largest elements from the entire array, and the heap's root (its minimum, accessible in O(1)) is, among those k, the smallest — which is exactly the Kth largest element of the original array."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: after processing any prefix of the input, the heap contains exactly the k largest elements seen SO FAR (or fewer than k, if fewer than k elements have been processed yet). This holds by induction: each new element is unconditionally added, and if this would exceed k elements, the single smallest among the current k+1 candidates is removed — correctly restoring the invariant, since removing the smallest of (top-k-so-far plus the new element) is exactly how to determine the new top-k set. By induction, after all n elements are processed, the heap holds exactly the true k largest elements of the entire array, and since it's a min-heap, its root is the smallest of those k — which, by definition, is the Kth largest element overall." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

int findKthLargest(const vector<int>& nums, int k) {
    priority_queue<int, vector<int>, greater<int>> queue_minHeap;

    for (int num : nums) {
        queue_minHeap.push(num);
        if ((int)queue_minHeap.size() > k) {
            queue_minHeap.pop();
        }
    }

    return queue_minHeap.top();
}

int main() {
    vector<int> nums = {3, 2, 1, 5, 6, 4};
    int k = 2;

    cout << "The " << k << "th largest element is: " << findKthLargest(nums, k) << endl;
    return 0;
}
`,
        "python": `import heapq

def find_kth_largest(nums, k):
    min_heap = []

    for num in nums:
        heapq.heappush(min_heap, num)
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    return min_heap[0]

if __name__ == "__main__":
    nums = [3, 2, 1, 5, 6, 4]
    k = 2
    print(f"The {k}th largest element is: {find_kth_largest(nums, k)}")
`,
        "java": `import java.util.PriorityQueue;

public class Main {
    public static int findKthLargest(int[] nums, int k) {
        PriorityQueue<Integer> queue_minHeap = new PriorityQueue<>();

        for (int num : nums) {
            queue_minHeap.offer(num);
            if (queue_minHeap.size() > k) {
                queue_minHeap.poll();
            }
        }

        return queue_minHeap.peek();
    }

    public static void main(String[] args) {
        int[] nums = {3, 2, 1, 5, 6, 4};
        int k = 2;
        System.out.println("The " + k + "th largest element is: " + findKthLargest(nums, k));
    }
}
`,
        "js": `function findKthLargest(nums, k) {
    // Simple array-backed min-heap via sorted insertion is O(n) per op;
    // for clarity we use a binary-heap-backed min-heap here.
    const queue_minHeap = [];

    const siftUp = (heap) => {
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent] <= heap[i]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    const siftDown = (heap) => {
        let i = 0;
        const n = heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && heap[left] < heap[smallest]) smallest = left;
            if (right < n && heap[right] < heap[smallest]) smallest = right;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
    };

    const push = (heap, val) => {
        heap.push(val);
        siftUp(heap);
    };

    const pop = (heap) => {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            siftDown(heap);
        }
        return top;
    };

    for (const num of nums) {
        push(queue_minHeap, num);
        if (queue_minHeap.length > k) {
            pop(queue_minHeap);
        }
    }

    return queue_minHeap[0];
}

const nums = [3, 2, 1, 5, 6, 4];
const k = 2;
console.log(\`The \${k}th largest element is: \${findKthLargest(nums, k)}\`);
`,
        "c": `#include <stdio.h>

// Simple min-heap of fixed capacity k, implemented as an array.
void siftUp(int* heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent] <= heap[i]) break;
        int temp = heap[parent]; heap[parent] = heap[i]; heap[i] = temp;
        i = parent;
    }
}

void siftDown(int* heap, int size) {
    int i = 0;
    while (1) {
        int smallest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < size && heap[left] < heap[smallest]) smallest = left;
        if (right < size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;
        int temp = heap[i]; heap[i] = heap[smallest]; heap[smallest] = temp;
        i = smallest;
    }
}

int findKthLargest(int* nums, int numsSize, int k) {
    int* heap = (int*)malloc(k * sizeof(int));
    int heapSize = 0;

    for (int i = 0; i < numsSize; i++) {
        if (heapSize < k) {
            heap[heapSize++] = nums[i];
            siftUp(heap, heapSize - 1);
        } else if (nums[i] > heap[0]) {
            heap[0] = nums[i];
            siftDown(heap, heapSize);
        }
    }

    int result = heap[0];
    free(heap);
    return result;
}

int main() {
    int nums[] = {3, 2, 1, 5, 6, 4};
    int numsSize = 6;
    int k = 2;
    printf("The %dth largest element is: %d\\n", k, findKthLargest(nums, numsSize, k));
    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static int FindKthLargest(int[] nums, int k) {
        var queue_minHeap = new SortedSet<(int val, int id)>();
        int id = 0;

        foreach (int num in nums) {
            queue_minHeap.Add((num, id++));
            if (queue_minHeap.Count > k) {
                var smallest = queue_minHeap.Min;
                queue_minHeap.Remove(smallest);
            }
        }

        return queue_minHeap.Min.val;
    }

    static void Main() {
        int[] nums = {3, 2, 1, 5, 6, 4};
        int k = 2;
        Console.WriteLine($"The {k}th largest element is: {FindKthLargest(nums, k)}");
    }
}
`,
        "swift": `func findKthLargest(_ nums: [Int], _ k: Int) -> Int {
    var queue_minHeap: [Int] = []

    func siftUp() {
        var i = queue_minHeap.count - 1
        while i > 0 {
            let parent = (i - 1) / 2
            if queue_minHeap[parent] <= queue_minHeap[i] { break }
            queue_minHeap.swapAt(parent, i)
            i = parent
        }
    }

    func siftDown() {
        var i = 0
        let n = queue_minHeap.count
        while true {
            var smallest = i
            let left = 2 * i + 1
            let right = 2 * i + 2
            if left < n && queue_minHeap[left] < queue_minHeap[smallest] { smallest = left }
            if right < n && queue_minHeap[right] < queue_minHeap[smallest] { smallest = right }
            if smallest == i { break }
            queue_minHeap.swapAt(i, smallest)
            i = smallest
        }
    }

    for num in nums {
        queue_minHeap.append(num)
        siftUp()
        if queue_minHeap.count > k {
            queue_minHeap[0] = queue_minHeap.removeLast()
            siftDown()
        }
    }

    return queue_minHeap[0]
}

let nums = [3, 2, 1, 5, 6, 4]
let k = 2
print("The \\(k)th largest element is: \\(findKthLargest(nums, k))")
`,
        "kotlin": `import java.util.PriorityQueue

fun findKthLargest(nums: IntArray, k: Int): Int {
    val queue_minHeap = PriorityQueue<Int>()

    for (num in nums) {
        queue_minHeap.offer(num)
        if (queue_minHeap.size > k) {
            queue_minHeap.poll()
        }
    }

    return queue_minHeap.peek()
}

fun main() {
    val nums = intArrayOf(3, 2, 1, 5, 6, 4)
    val k = 2
    println("The \${k}th largest element is: \${findKthLargest(nums, k)}")
}
`,
        "scala": `import scala.collection.mutable

object Main extends App {
    def findKthLargest(nums: Array[Int], k: Int): Int = {
        val queue_minHeap = mutable.PriorityQueue[Int]()(Ordering.Int.reverse)

        for (num <- nums) {
            queue_minHeap.enqueue(num)
            if (queue_minHeap.size > k) {
                queue_minHeap.dequeue()
            }
        }

        queue_minHeap.head
    }

    val nums = Array(3, 2, 1, 5, 6, 4)
    val k = 2
    println(s"The \${k}th largest element is: \${findKthLargest(nums, k)}")
}
`,
        "go": `package main

import (
    "container/heap"
    "fmt"
)

type IntMinHeap []int

func (h IntMinHeap) Len() int            { return len(h) }
func (h IntMinHeap) Less(i, j int) bool  { return h[i] < h[j] }
func (h IntMinHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *IntMinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *IntMinHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func findKthLargest(nums []int, k int) int {
    queue_minHeap := &IntMinHeap{}
    heap.Init(queue_minHeap)

    for _, num := range nums {
        heap.Push(queue_minHeap, num)
        if queue_minHeap.Len() > k {
            heap.Pop(queue_minHeap)
        }
    }

    return (*queue_minHeap)[0]
}

func main() {
    nums := []int{3, 2, 1, 5, 6, 4}
    k := 2
    fmt.Printf("The %dth largest element is: %d\\n", k, findKthLargest(nums, k))
}
`,
        "rust": `use std::collections::BinaryHeap;
use std::cmp::Reverse;

fn find_kth_largest(nums: &[i32], k: usize) -> i32 {
    let mut min_heap: BinaryHeap<Reverse<i32>> = BinaryHeap::new();

    for &num in nums {
        min_heap.push(Reverse(num));
        if min_heap.len() > k {
            min_heap.pop();
        }
    }

    min_heap.peek().unwrap().0
}

fn main() {
    let nums = vec![3, 2, 1, 5, 6, 4];
    let k = 2;
    println!("The {}th largest element is: {}", k, find_kth_largest(&nums, k));
}
`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. MERGE K SORTED LISTS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Merge K Sorted Lists",
      href: "/algorithms/heap/merge-k",
      type: "Hard",

      about: [
        { tag: "h1", text: "Merge K Sorted Lists" },
        { tag: "p", text: "Given k already-sorted linked lists, this problem asks for a single sorted list containing all their elements combined. Merging them pairwise (merge list 1 with list 2, then merge that result with list 3, and so on) costs O(N·k) in the worst case, where N is the total number of elements across all lists — a min-heap-based approach achieves the better O(N log k)." },
        { tag: "p", text: "The technique generalises the standard two-list merge (from Merge Sort) by replacing the 'compare two front elements' step with 'find the minimum among up to k front elements', using a min-heap to make that minimum-finding step O(log k) instead of O(k). The heap holds at most one node from each of the k lists at any time — specifically, the current 'front' (unprocessed) node of each list that still has remaining elements." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Merging more than 2 sorted sequences simultaneously, where a sequence of pairwise merges would be asymptotically slower",
          "External sorting (merging many sorted runs/chunks too large to fit in memory simultaneously) — database systems and large-scale sort-merge operations use exactly this k-way merge technique",
          "Distributed systems combining sorted result streams from multiple shards/nodes into one globally sorted output",
          "As a direct generalisation of the two-pointer merge technique (see Linked Lists: Merge Sorted Lists) to k inputs instead of 2, using a heap to handle the 'which of k candidates is smallest' decision efficiently"
        ]},
        { tag: "note", variant: "tip", text: "Pairwise merging (merge lists one at a time into a running result) is also O(N log k) if done via DIVIDE AND CONQUER (merge pairs of lists, then merge pairs of results, halving the list count each round) — the heap-based approach achieves the same asymptotic bound with a different, often simpler-to-implement, mechanism." }
      ],

      timeComplexityCalculation: {
        notation: "O(N log k)",
        best: [
          { tag: "h2", text: "Best Case — O(N log k)" },
          { tag: "p", text: "Every one of the N total nodes across all k lists must be extracted from the heap and appended to the result exactly once — there's no shortcut even for the most favourably arranged input values." },
          { tag: "ul", items: [
            "Initial heap construction: insert the first node of each of the k lists — O(k log k)",
            "N total extract-min operations (one per node across all lists), each O(log k) since the heap never holds more than k elements at once: O(N log k)",
            "Combined: O(k log k) + O(N log k) = O(N log k), since N ≥ k always"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(N log k)" },
          { tag: "p", text: "Every node extraction and the corresponding insertion of that list's next node both cost O(log k), regardless of how the N total elements happen to be distributed across the k lists or what their actual values are." },
          { tag: "ul", items: [
            "N extract-min + N insert operations (one pair per node processed), each O(log k): O(N log k) total",
            "No input distribution changes this fixed per-node cost"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(N log k)" },
          { tag: "p", text: "No arrangement of values across the k lists increases the cost beyond the fixed per-node O(log k) heap operations — this is simultaneously the best, average, and worst case, since the heap always maintains exactly the same structural size bound (at most k elements) throughout." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(N log k)",
            "This is a genuine improvement over naive pairwise merging's O(N·k) worst case, achieved entirely by using the heap to find the minimum-of-k-candidates in O(log k) instead of O(k)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(k)" },
          { tag: "p", text: "The heap never holds more than one node per input list at any given time, so its size is structurally bounded by k regardless of how many total elements (N) exist across all lists." },
          { tag: "ul", items: ["Heap: at most k entries (one current-front node per non-exhausted list) — O(k)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(k)" },
          { tag: "p", text: "Space usage is fixed by k alone, since the heap's size invariant (at most one entry per list) doesn't depend on N, the total element count, or how elements are distributed across the lists." },
          { tag: "ul", items: ["Heap: O(k), regardless of N — the merged output itself is typically built by relinking existing nodes (as in Merge Sorted Lists), not allocating new ones, so it doesn't add to auxiliary space"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(k)" },
          { tag: "p", text: "No distribution of values or list lengths grows the heap beyond k elements — this is an enforced structural invariant of the algorithm, just like the Kth Largest Element technique above." },
          { tag: "ul", items: ["Heap: strictly bounded at O(k), identical across all cases"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function mergeKLists(lists):
    queue_minHeap ← empty min-heap          // ordered by node value

    for list in lists:
        if list is not null:
            push(queue_minHeap, list)        // push the head node of each non-empty list

    dummy ← new Node(0)
    tail ← dummy

    while queue_minHeap is not empty:
        smallestNode ← pop(queue_minHeap)    // node with the globally smallest current value
        tail.next ← smallestNode
        tail ← tail.next

        if smallestNode.next is not null:
            push(queue_minHeap, smallestNode.next)   // advance that list, push its new front

    return dummy.next` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise the heap with the head node of every non-empty input list — at most k entries, one per list.",
          "Repeatedly extract the minimum-value node from the heap (this is, among all k lists' current fronts, the globally smallest available value) and append it to the merged result.",
          "If the just-extracted node has a next node in its original list, push THAT node onto the heap — this correctly 'advances' that particular list's contribution by one step.",
          "Repeat until the heap is empty, meaning every node from every list has been extracted and appended to the result exactly once.",
          "Using a dummy sentinel head (exactly as in the two-list merge technique) avoids any special-casing for the very first node of the merged result."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at every point, the heap contains exactly the current 'front' node of every list that still has unprocessed elements, and everything already appended to the result is correctly sorted and represents exactly the globally smallest (length-so-far) elements available across all k lists' remaining portions. Each iteration correctly extends this invariant: the heap's minimum is, by construction, the smallest among all k lists' current fronts — and since every individual list is itself sorted, no list's LATER elements could possibly be smaller than its own current front, so the heap's global minimum really is the smallest element available from the combination of everything not yet merged. By induction over the N total extraction steps, the final result is fully and correctly sorted." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int x) : val(x), next(nullptr) {}
};

struct Compare {
    bool operator()(ListNode* a, ListNode* b) {
        return a->val > b->val;
    }
};

ListNode* mergeKLists(vector<ListNode*>& lists) {
    priority_queue<ListNode*, vector<ListNode*>, Compare> queue_minHeap;

    for (ListNode* node : lists) {
        if (node != nullptr) queue_minHeap.push(node);
    }

    ListNode dummy(0);
    ListNode* tail = &dummy;

    while (!queue_minHeap.empty()) {
        ListNode* smallest = queue_minHeap.top();
        queue_minHeap.pop();

        tail->next = smallest;
        tail = tail->next;

        if (smallest->next != nullptr) queue_minHeap.push(smallest->next);
    }

    return dummy.next;
}

ListNode* createList(const vector<int>& vals) {
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for (int v : vals) {
        curr->next = new ListNode(v);
        curr = curr->next;
    }
    return dummy.next;
}

void printList(ListNode* head) {
    while (head != nullptr) {
        cout << head->val << " -> ";
        head = head->next;
    }
    cout << "NULL" << endl;
}

int main() {
    vector<ListNode*> lists;
    lists.push_back(createList({1, 4, 5}));
    lists.push_back(createList({1, 3, 4}));
    lists.push_back(createList({2, 6}));

    ListNode* mergedHead = mergeKLists(lists);

    cout << "Merged List: ";
    printList(mergedHead);

    return 0;
}
`,
        "python": `import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def merge_k_lists(lists):
    min_heap = []
    for i, node in enumerate(lists):
        if node is not None:
            heapq.heappush(min_heap, (node.val, i, node))

    dummy = ListNode(0)
    tail = dummy

    while min_heap:
        val, i, smallest = heapq.heappop(min_heap)
        tail.next = smallest
        tail = tail.next

        if smallest.next is not None:
            heapq.heappush(min_heap, (smallest.next.val, i, smallest.next))

    return dummy.next

def create_list(vals):
    dummy = ListNode(0)
    curr = dummy
    for v in vals:
        curr.next = ListNode(v)
        curr = curr.next
    return dummy.next

def print_list(head):
    result = []
    while head:
        result.append(str(head.val))
        head = head.next
    print(" -> ".join(result) + " -> NULL")

if __name__ == "__main__":
    lists = [create_list([1, 4, 5]), create_list([1, 3, 4]), create_list([2, 6])]
    merged_head = merge_k_lists(lists)
    print("Merged List: ", end="")
    print_list(merged_head)
`,
        "java": `import java.util.PriorityQueue;

public class Main {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int x) { val = x; }
    }

    static ListNode mergeKLists(ListNode[] lists) {
        PriorityQueue<ListNode> queue_minHeap = new PriorityQueue<>((a, b) -> a.val - b.val);

        for (ListNode node : lists) {
            if (node != null) queue_minHeap.offer(node);
        }

        ListNode dummy = new ListNode(0);
        ListNode tail = dummy;

        while (!queue_minHeap.isEmpty()) {
            ListNode smallest = queue_minHeap.poll();
            tail.next = smallest;
            tail = tail.next;

            if (smallest.next != null) queue_minHeap.offer(smallest.next);
        }

        return dummy.next;
    }

    static ListNode createList(int[] vals) {
        ListNode dummy = new ListNode(0);
        ListNode curr = dummy;
        for (int v : vals) {
            curr.next = new ListNode(v);
            curr = curr.next;
        }
        return dummy.next;
    }

    static void printList(ListNode head) {
        StringBuilder sb = new StringBuilder();
        while (head != null) {
            sb.append(head.val).append(" -> ");
            head = head.next;
        }
        sb.append("NULL");
        System.out.println(sb);
    }

    public static void main(String[] args) {
        ListNode[] lists = {
            createList(new int[]{1, 4, 5}),
            createList(new int[]{1, 3, 4}),
            createList(new int[]{2, 6})
        };

        ListNode mergedHead = mergeKLists(lists);
        System.out.print("Merged List: ");
        printList(mergedHead);
    }
}
`,
        "js": `class ListNode {
    constructor(val, next = null) {
        this.val = val;
        this.next = next;
    }
}

function mergeKLists(lists) {
    // Simple binary min-heap keyed by node.val
    const heap = [];

    const siftUp = () => {
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent].val <= heap[i].val) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    const siftDown = () => {
        let i = 0;
        const n = heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && heap[left].val < heap[smallest].val) smallest = left;
            if (right < n && heap[right].val < heap[smallest].val) smallest = right;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
    };

    const push = (node) => {
        heap.push(node);
        siftUp();
    };

    const pop = () => {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            siftDown();
        }
        return top;
    };

    for (const node of lists) {
        if (node !== null) push(node);
    }

    const dummy = new ListNode(0);
    let tail = dummy;

    while (heap.length > 0) {
        const smallest = pop();
        tail.next = smallest;
        tail = tail.next;

        if (smallest.next !== null) push(smallest.next);
    }

    return dummy.next;
}

function createList(vals) {
    const dummy = new ListNode(0);
    let curr = dummy;
    for (const v of vals) {
        curr.next = new ListNode(v);
        curr = curr.next;
    }
    return dummy.next;
}

function printList(head) {
    const parts = [];
    while (head !== null) {
        parts.push(head.val);
        head = head.next;
    }
    console.log(parts.join(" -> ") + " -> NULL");
}

const lists = [createList([1, 4, 5]), createList([1, 3, 4]), createList([2, 6])];
const mergedHead = mergeKLists(lists);
process.stdout.write("Merged List: ");
printList(mergedHead);
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

typedef struct ListNode {
    int val;
    struct ListNode* next;
} ListNode;

ListNode* createNode(int val) {
    ListNode* node = (ListNode*)malloc(sizeof(ListNode));
    node->val = val;
    node->next = NULL;
    return node;
}

// Simple array-backed min-heap of ListNode pointers.
void siftUp(ListNode** heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent]->val <= heap[i]->val) break;
        ListNode* temp = heap[parent]; heap[parent] = heap[i]; heap[i] = temp;
        i = parent;
    }
}

void siftDown(ListNode** heap, int size) {
    int i = 0;
    while (1) {
        int smallest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < size && heap[left]->val < heap[smallest]->val) smallest = left;
        if (right < size && heap[right]->val < heap[smallest]->val) smallest = right;
        if (smallest == i) break;
        ListNode* temp = heap[i]; heap[i] = heap[smallest]; heap[smallest] = temp;
        i = smallest;
    }
}

ListNode* mergeKLists(ListNode** lists, int k) {
    ListNode** heap = (ListNode**)malloc(k * sizeof(ListNode*));
    int heapSize = 0;

    for (int i = 0; i < k; i++) {
        if (lists[i] != NULL) {
            heap[heapSize++] = lists[i];
            siftUp(heap, heapSize - 1);
        }
    }

    ListNode dummy; dummy.next = NULL;
    ListNode* tail = &dummy;

    while (heapSize > 0) {
        ListNode* smallest = heap[0];
        heap[0] = heap[heapSize - 1];
        heapSize--;
        siftDown(heap, heapSize);

        tail->next = smallest;
        tail = tail->next;

        if (smallest->next != NULL) {
            heap[heapSize++] = smallest->next;
            siftUp(heap, heapSize - 1);
        }
    }

    free(heap);
    return dummy.next;
}

ListNode* createList(int* vals, int n) {
    ListNode dummy; dummy.next = NULL;
    ListNode* curr = &dummy;
    for (int i = 0; i < n; i++) {
        curr->next = createNode(vals[i]);
        curr = curr->next;
    }
    return dummy.next;
}

void printList(ListNode* head) {
    while (head != NULL) {
        printf("%d -> ", head->val);
        head = head->next;
    }
    printf("NULL\\n");
}

int main() {
    int a[] = {1, 4, 5};
    int b[] = {1, 3, 4};
    int c[] = {2, 6};

    ListNode* lists[3];
    lists[0] = createList(a, 3);
    lists[1] = createList(b, 3);
    lists[2] = createList(c, 2);

    ListNode* mergedHead = mergeKLists(lists, 3);
    printf("Merged List: ");
    printList(mergedHead);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class ListNode {
    public int Val;
    public ListNode Next;
    public ListNode(int val) { Val = val; }
}

class Program {
    static ListNode MergeKLists(List<ListNode> lists) {
        var queue_minHeap = new SortedSet<(int val, int id, ListNode node)>();
        int id = 0;

        foreach (var node in lists) {
            if (node != null) queue_minHeap.Add((node.Val, id++, node));
        }

        var dummy = new ListNode(0);
        var tail = dummy;

        while (queue_minHeap.Count > 0) {
            var smallestEntry = queue_minHeap.Min;
            queue_minHeap.Remove(smallestEntry);
            var smallest = smallestEntry.node;

            tail.Next = smallest;
            tail = tail.Next;

            if (smallest.Next != null) queue_minHeap.Add((smallest.Next.Val, id++, smallest.Next));
        }

        return dummy.Next;
    }

    static ListNode CreateList(int[] vals) {
        var dummy = new ListNode(0);
        var curr = dummy;
        foreach (int v in vals) {
            curr.Next = new ListNode(v);
            curr = curr.Next;
        }
        return dummy.Next;
    }

    static void PrintList(ListNode head) {
        var parts = new List<string>();
        while (head != null) {
            parts.Add(head.Val.ToString());
            head = head.Next;
        }
        Console.WriteLine(string.Join(" -> ", parts) + " -> NULL");
    }

    static void Main() {
        var lists = new List<ListNode> {
            CreateList(new[] {1, 4, 5}),
            CreateList(new[] {1, 3, 4}),
            CreateList(new[] {2, 6})
        };

        var mergedHead = MergeKLists(lists);
        Console.Write("Merged List: ");
        PrintList(mergedHead);
    }
}
`,
        "swift": `class ListNode {
    var val: Int
    var next: ListNode?
    init(_ val: Int) { self.val = val }
}

func mergeKLists(_ lists: [ListNode?]) -> ListNode? {
    var heap: [ListNode] = []

    func siftUp() {
        var i = heap.count - 1
        while i > 0 {
            let parent = (i - 1) / 2
            if heap[parent].val <= heap[i].val { break }
            heap.swapAt(parent, i)
            i = parent
        }
    }

    func siftDown() {
        var i = 0
        let n = heap.count
        while true {
            var smallest = i
            let left = 2 * i + 1
            let right = 2 * i + 2
            if left < n && heap[left].val < heap[smallest].val { smallest = left }
            if right < n && heap[right].val < heap[smallest].val { smallest = right }
            if smallest == i { break }
            heap.swapAt(i, smallest)
            i = smallest
        }
    }

    func push(_ node: ListNode) {
        heap.append(node)
        siftUp()
    }

    func pop() -> ListNode {
        let top = heap[0]
        let last = heap.removeLast()
        if !heap.isEmpty {
            heap[0] = last
            siftDown()
        }
        return top
    }

    for node in lists {
        if let node = node { push(node) }
    }

    let dummy = ListNode(0)
    var tail = dummy

    while !heap.isEmpty {
        let smallest = pop()
        tail.next = smallest
        tail = smallest

        if let next = smallest.next { push(next) }
    }

    return dummy.next
}

func createList(_ vals: [Int]) -> ListNode? {
    let dummy = ListNode(0)
    var curr = dummy
    for v in vals {
        curr.next = ListNode(v)
        curr = curr.next!
    }
    return dummy.next
}

func printList(_ head: ListNode?) {
    var parts: [String] = []
    var node = head
    while let n = node {
        parts.append(String(n.val))
        node = n.next
    }
    print(parts.joined(separator: " -> ") + " -> NULL")
}

let lists = [createList([1, 4, 5]), createList([1, 3, 4]), createList([2, 6])]
let mergedHead = mergeKLists(lists)
print("Merged List: ", terminator: "")
printList(mergedHead)
`,
        "kotlin": `import java.util.PriorityQueue

class ListNode(var value: Int) {
    var next: ListNode? = null
}

fun mergeKLists(lists: List<ListNode?>): ListNode? {
    val queue_minHeap = PriorityQueue<ListNode>(compareBy { it.value })

    for (node in lists) {
        if (node != null) queue_minHeap.offer(node)
    }

    val dummy = ListNode(0)
    var tail = dummy

    while (queue_minHeap.isNotEmpty()) {
        val smallest = queue_minHeap.poll()
        tail.next = smallest
        tail = smallest

        smallest.next?.let { queue_minHeap.offer(it) }
    }

    return dummy.next
}

fun createList(vals: List<Int>): ListNode? {
    val dummy = ListNode(0)
    var curr = dummy
    for (v in vals) {
        curr.next = ListNode(v)
        curr = curr.next!!
    }
    return dummy.next
}

fun printList(head: ListNode?) {
    val parts = mutableListOf<String>()
    var node = head
    while (node != null) {
        parts.add(node.value.toString())
        node = node.next
    }
    println(parts.joinToString(" -> ") + " -> NULL")
}

fun main() {
    val lists = listOf(createList(listOf(1, 4, 5)), createList(listOf(1, 3, 4)), createList(listOf(2, 6)))
    val mergedHead = mergeKLists(lists)
    print("Merged List: ")
    printList(mergedHead)
}
`,
        "scala": `import scala.collection.mutable

class ListNode(var value: Int, var next: ListNode = null)

object Main extends App {
    def mergeKLists(lists: List[ListNode]): ListNode = {
        val ord = Ordering.by[ListNode, Int](_.value).reverse
        val queue_minHeap = mutable.PriorityQueue[ListNode]()(ord)

        for (node <- lists if node != null) queue_minHeap.enqueue(node)

        val dummy = new ListNode(0)
        var tail = dummy

        while (queue_minHeap.nonEmpty) {
            val smallest = queue_minHeap.dequeue()
            tail.next = smallest
            tail = smallest

            if (smallest.next != null) queue_minHeap.enqueue(smallest.next)
        }

        dummy.next
    }

    def createList(vals: List[Int]): ListNode = {
        val dummy = new ListNode(0)
        var curr = dummy
        for (v <- vals) {
            curr.next = new ListNode(v)
            curr = curr.next
        }
        dummy.next
    }

    def printList(head: ListNode): Unit = {
        val parts = mutable.ListBuffer[String]()
        var node = head
        while (node != null) {
            parts += node.value.toString
            node = node.next
        }
        println(parts.mkString(" -> ") + " -> NULL")
    }

    val lists = List(createList(List(1, 4, 5)), createList(List(1, 3, 4)), createList(List(2, 6)))
    val mergedHead = mergeKLists(lists)
    print("Merged List: ")
    printList(mergedHead)
}
`,
        "go": `package main

import (
    "container/heap"
    "fmt"
)

type ListNode struct {
    Val  int
    Next *ListNode
}

type NodeHeap []*ListNode

func (h NodeHeap) Len() int            { return len(h) }
func (h NodeHeap) Less(i, j int) bool  { return h[i].Val < h[j].Val }
func (h NodeHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *NodeHeap) Push(x interface{}) { *h = append(*h, x.(*ListNode)) }
func (h *NodeHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func mergeKLists(lists []*ListNode) *ListNode {
    queue_minHeap := &NodeHeap{}
    heap.Init(queue_minHeap)

    for _, node := range lists {
        if node != nil {
            heap.Push(queue_minHeap, node)
        }
    }

    dummy := &ListNode{}
    tail := dummy

    for queue_minHeap.Len() > 0 {
        smallest := heap.Pop(queue_minHeap).(*ListNode)
        tail.Next = smallest
        tail = tail.Next

        if smallest.Next != nil {
            heap.Push(queue_minHeap, smallest.Next)
        }
    }

    return dummy.Next
}

func createList(vals []int) *ListNode {
    dummy := &ListNode{}
    curr := dummy
    for _, v := range vals {
        curr.Next = &ListNode{Val: v}
        curr = curr.Next
    }
    return dummy.Next
}

func printList(head *ListNode) {
    for head != nil {
        fmt.Printf("%d -> ", head.Val)
        head = head.Next
    }
    fmt.Println("NULL")
}

func main() {
    lists := []*ListNode{
        createList([]int{1, 4, 5}),
        createList([]int{1, 3, 4}),
        createList([]int{2, 6}),
    }

    mergedHead := mergeKLists(lists)
    fmt.Print("Merged List: ")
    printList(mergedHead)
}
`,
        "rust": `use std::cmp::Ordering;
use std::collections::BinaryHeap;

#[derive(Eq, PartialEq)]
struct ListNode {
    val: i32,
    next: Option<Box<ListNode>>,
}

impl ListNode {
    fn new(val: i32) -> Self {
        ListNode { val, next: None }
    }
}

// Reverse ordering so BinaryHeap (a max-heap) behaves as a min-heap.
struct HeapEntry(i32, Box<ListNode>);

impl Eq for HeapEntry {}
impl PartialEq for HeapEntry {
    fn eq(&self, other: &Self) -> bool { self.0 == other.0 }
}
impl Ord for HeapEntry {
    fn cmp(&self, other: &Self) -> Ordering { other.0.cmp(&self.0) }
}
impl PartialOrd for HeapEntry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
}

fn merge_k_lists(lists: Vec<Option<Box<ListNode>>>) -> Option<Box<ListNode>> {
    let mut heap: BinaryHeap<HeapEntry> = BinaryHeap::new();

    for node in lists.into_iter().flatten() {
        let val = node.val;
        heap.push(HeapEntry(val, node));
    }

    let mut dummy = Box::new(ListNode::new(0));
    let mut tail: &mut Box<ListNode> = &mut dummy;

    while let Some(HeapEntry(_, mut smallest)) = heap.pop() {
        if let Some(next) = smallest.next.take() {
            heap.push(HeapEntry(next.val, next));
        }
        tail.next = Some(smallest);
        tail = tail.next.as_mut().unwrap();
    }

    dummy.next
}

fn create_list(vals: &[i32]) -> Option<Box<ListNode>> {
    let mut dummy = Box::new(ListNode::new(0));
    let mut tail = &mut dummy;
    for &v in vals {
        tail.next = Some(Box::new(ListNode::new(v)));
        tail = tail.next.as_mut().unwrap();
    }
    dummy.next
}

fn print_list(mut head: Option<&Box<ListNode>>) {
    let mut parts = vec![];
    while let Some(node) = head {
        parts.push(node.val.to_string());
        head = node.next.as_ref();
    }
    println!("{} -> NULL", parts.join(" -> "));
}

fn main() {
    let lists = vec![
        create_list(&[1, 4, 5]),
        create_list(&[1, 3, 4]),
        create_list(&[2, 6]),
    ];

    let merged_head = merge_k_lists(lists);
    print!("Merged List: ");
    print_list(merged_head.as_ref());
}
`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. TOP K FREQUENT ELEMENTS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Top K Frequent Elements",
      href: "/algorithms/heap/top-k-frequent",
      type: "Medium",

      about: [
        { tag: "h1", text: "Top K Frequent Elements" },
        { tag: "p", text: "Given an array, find the k elements that occur most frequently. This problem combines two earlier techniques from this reference directly: a hash map to count each element's frequency in one O(n) pass (exactly like the Hash Maps section's frequency-counting pattern), followed by a size-k min-heap (exactly like Kth Largest Element above, but keyed by FREQUENCY instead of raw value) to extract the top k frequencies in O(n log k)." },
        { tag: "p", text: "This is a clean demonstration of algorithmic COMPOSITION: rather than being a fundamentally new technique, it's the direct combination of two patterns already covered elsewhere in this reference, applied in sequence — count first, then heap-select. Recognising when a problem decomposes into 'apply technique A, then feed the result into technique B' is itself a core algorithmic skill." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding the most common k items in a dataset — trending topics, most-frequent search queries, most-played songs, word-frequency analysis (top k words in a document)",
          "Any 'top-k by some derived/computed metric' problem, where the metric itself (here, frequency) must first be computed via a preliminary pass before the heap-selection step can begin",
          "As a direct illustration of composing the Hash Map frequency-counting pattern with the size-k min-heap pattern — recognising this composition is more valuable long-term than memorising the specific problem",
          "An alternative O(n) average-case approach exists using Bucket Sort (bucket index = frequency, since frequency is bounded by n) when k is close to n or when the O(n log k) heap approach's log factor genuinely matters at scale"
        ]},
        { tag: "note", variant: "tip", text: "If k equals the total number of distinct elements (i.e. you need ALL elements ordered by frequency, not just the top k), a full sort by frequency is simpler and asymptotically no worse — the heap-based size-k approach earns its keep specifically when k is meaningfully smaller than the number of distinct elements." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log k)",
        best: [
          { tag: "h2", text: "Best Case — O(n log k)" },
          { tag: "p", text: "Both phases — frequency counting and heap selection — always process their full input regardless of value distribution: counting always requires one full pass over n elements, and heap selection always requires examining every distinct element found." },
          { tag: "ul", items: [
            "Phase 1 (frequency counting): O(n) — one hash map update per element, unconditionally",
            "Phase 2 (heap selection): O(d log k), where d is the number of distinct elements (d ≤ n) — each distinct element triggers an O(1) comparison and possibly an O(log k) heap operation",
            "Combined: O(n) + O(d log k) = O(n log k) in the standard classification, since d ≤ n"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log k)" },
          { tag: "p", text: "Both phases perform the same fixed structural work regardless of how frequencies happen to be distributed across distinct elements — counting cost depends only on total element count, and heap-selection cost depends only on distinct-element count and k." },
          { tag: "ul", items: [
            "Phase 1: O(n), always a single full pass",
            "Phase 2: O(d log k), where most distinct elements require an O(1) comparison and a fraction require the full O(log k) heap insertion-and-eviction",
            "Total: O(n + d log k), simplified to O(n log k) in the standard worst-case-d classification"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log k)" },
          { tag: "p", text: "If every element in the input is distinct (d = n, the maximum possible number of distinct elements), Phase 2's cost reaches its maximum, dominating the combined bound." },
          { tag: "ul", items: [
            "Worst case: d = n distinct elements, each requiring up to O(log k) heap work in Phase 2: O(n log k)",
            "Combined with Phase 1's O(n): O(n) + O(n log k) = O(n log k)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The frequency-counting hash map must store an entry for every distinct element encountered, which in the best case (few distinct elements) is much smaller than n, though the heap itself stays bounded at O(k) regardless." },
          { tag: "ul", items: ["Frequency hash map: O(d), where d ≤ n is the number of distinct elements", "Heap: O(k)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "The frequency hash map's size scales with the number of distinct elements, which in the average case for typical data is some fraction of n, while the heap remains bounded by k throughout." },
          { tag: "ul", items: ["Frequency hash map: O(d) ≤ O(n)", "Heap: O(k), where k ≤ d ≤ n always"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "If every element in the input is distinct, the frequency hash map must store n separate entries, reaching its maximum possible size." },
          { tag: "ul", items: [
            "Frequency hash map: O(n) when all elements are distinct (d = n)",
            "Heap: O(k), still bounded separately and much smaller than n in typical use",
            "Combined: O(n), dominated by the hash map in the worst case"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function topKFrequent(nums, k):
    freqMap ← empty hash map           // value → count

    for num in nums:
        freqMap[num] ← freqMap.get(num, 0) + 1

    queue_minHeap ← empty min-heap           // ordered by frequency

    for (value, freq) in freqMap:
        push(queue_minHeap, (freq, value))
        if size(queue_minHeap) > k:
            pop(queue_minHeap)                // evict the currently-least-frequent of the top-k candidates

    return [value for (freq, value) in queue_minHeap]` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Phase 1: scan the input array once, building a hash map from each distinct value to its total occurrence count — exactly the standard frequency-counting pattern.",
          "Phase 2: iterate over the distinct (value, frequency) pairs from the hash map, maintaining a min-heap ordered by frequency, capped at size k — exactly the same size-k-min-heap technique as Kth Largest Element, but the comparison key is now frequency rather than raw value.",
          "For each (value, frequency) pair, push it onto the heap; if this exceeds size k, pop the entry with the smallest frequency, correctly evicting whichever of the current top-(k+1) candidates is least frequent.",
          "After processing all distinct elements, the heap contains exactly the k elements with the highest frequencies — extract their values as the final answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Phase 1's correctness is immediate: a hash map correctly and exactly counts the occurrences of every distinct value with a single pass. Phase 2's correctness follows from the exact same invariant argument as Kth Largest Element, applied to frequency instead of raw value: after processing any prefix of the distinct (value, frequency) pairs, the heap contains exactly the k highest-frequency elements seen so far, since each new candidate is added and, if it would exceed size k, the lowest-frequency entry among the current top-(k+1) is correctly evicted. By induction, after processing all distinct elements, the heap holds exactly the true k most frequent elements of the original input." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <unordered_map>
#include <queue>

using namespace std;

vector<int> topKFrequent(const vector<int>& nums, int k) {
    unordered_map<int, int> freqMap;
    for (int num : nums) {
        freqMap[num]++;
    }

    // Min-heap of (frequency, value) pairs, ordered by frequency.
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> queue_minHeap;

    for (const auto& [value, freq] : freqMap) {
        queue_minHeap.push({freq, value});
        if ((int)queue_minHeap.size() > k) {
            queue_minHeap.pop();
        }
    }

    vector<int> result;
    while (!queue_minHeap.empty()) {
        result.push_back(queue_minHeap.top().second);
        queue_minHeap.pop();
    }

    return result;
}

int main() {
    vector<int> nums = {1, 1, 1, 2, 2, 3};
    int k = 2;

    vector<int> res = topKFrequent(nums, k);

    cout << "Top " << k << " frequent elements: ";
    for (int num : res) {
        cout << num << " ";
    }
    cout << endl;

    return 0;
}
`,
        "python": `import heapq
from collections import Counter

def top_k_frequent(nums, k):
    freq_map = Counter(nums)
    min_heap = []

    for value, freq in freq_map.items():
        heapq.heappush(min_heap, (freq, value))
        if len(min_heap) > k:
            heapq.heappop(min_heap)

    return [value for freq, value in min_heap]

if __name__ == "__main__":
    nums = [1, 1, 1, 2, 2, 3]
    k = 2
    res = top_k_frequent(nums, k)
    print(f"Top {k} frequent elements: {res}")
`,
        "java": `import java.util.*;

public class Main {
    public static List<Integer> topKFrequent(int[] nums, int k) {
        Map<Integer, Integer> freqMap = new HashMap<>();
        for (int num : nums) {
            freqMap.merge(num, 1, Integer::sum);
        }

        PriorityQueue<int[]> queue_minHeap = new PriorityQueue<>((a, b) -> a[1] - b[1]);

        for (Map.Entry<Integer, Integer> entry : freqMap.entrySet()) {
            queue_minHeap.offer(new int[]{entry.getKey(), entry.getValue()});
            if (queue_minHeap.size() > k) {
                queue_minHeap.poll();
            }
        }

        List<Integer> result = new ArrayList<>();
        while (!queue_minHeap.isEmpty()) {
            result.add(queue_minHeap.poll()[0]);
        }

        return result;
    }

    public static void main(String[] args) {
        int[] nums = {1, 1, 1, 2, 2, 3};
        int k = 2;
        List<Integer> res = topKFrequent(nums, k);
        System.out.println("Top " + k + " frequent elements: " + res);
    }
}
`,
        "js": `function topKFrequent(nums, k) {
    const freqMap = new Map();
    for (const num of nums) {
        freqMap.set(num, (freqMap.get(num) || 0) + 1);
    }

    // Binary min-heap of [freq, value] pairs, ordered by freq.
    const heap = [];

    const siftUp = () => {
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent][0] <= heap[i][0]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    };

    const siftDown = () => {
        let i = 0;
        const n = heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && heap[left][0] < heap[smallest][0]) smallest = left;
            if (right < n && heap[right][0] < heap[smallest][0]) smallest = right;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
    };

    const push = (entry) => {
        heap.push(entry);
        siftUp();
    };

    const pop = () => {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            siftDown();
        }
        return top;
    };

    for (const [value, freq] of freqMap.entries()) {
        push([freq, value]);
        if (heap.length > k) {
            pop();
        }
    }

    return heap.map(([freq, value]) => value);
}

const nums = [1, 1, 1, 2, 2, 3];
const k = 2;
const res = topKFrequent(nums, k);
console.log(\`Top \${k} frequent elements: \${res}\`);
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

// Simple linear-scan frequency map (bounded input range) + array min-heap of size k.
typedef struct { int value; int freq; } Entry;

void siftUp(Entry* heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent].freq <= heap[i].freq) break;
        Entry temp = heap[parent]; heap[parent] = heap[i]; heap[i] = temp;
        i = parent;
    }
}

void siftDown(Entry* heap, int size) {
    int i = 0;
    while (1) {
        int smallest = i;
        int left = 2 * i + 1;
        int right = 2 * i + 2;
        if (left < size && heap[left].freq < heap[smallest].freq) smallest = left;
        if (right < size && heap[right].freq < heap[smallest].freq) smallest = right;
        if (smallest == i) break;
        Entry temp = heap[i]; heap[i] = heap[smallest]; heap[smallest] = temp;
        i = smallest;
    }
}

int main() {
    int nums[] = {1, 1, 1, 2, 2, 3};
    int n = 6;
    int k = 2;

    // Frequency count via a small hash-free lookup (values assumed small/non-negative here).
    int maxVal = 0;
    for (int i = 0; i < n; i++) if (nums[i] > maxVal) maxVal = nums[i];
    int* freq = (int*)calloc(maxVal + 1, sizeof(int));
    for (int i = 0; i < n; i++) freq[nums[i]]++;

    Entry* heap = (Entry*)malloc(k * sizeof(Entry));
    int heapSize = 0;

    for (int v = 0; v <= maxVal; v++) {
        if (freq[v] == 0) continue;
        Entry e = {v, freq[v]};
        if (heapSize < k) {
            heap[heapSize++] = e;
            siftUp(heap, heapSize - 1);
        } else if (e.freq > heap[0].freq) {
            heap[0] = e;
            siftDown(heap, heapSize);
        }
    }

    printf("Top %d frequent elements: ", k);
    for (int i = 0; i < heapSize; i++) {
        printf("%d ", heap[i].value);
    }
    printf("\\n");

    free(freq);
    free(heap);
    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    static List<int> TopKFrequent(int[] nums, int k) {
        var freqMap = new Dictionary<int, int>();
        foreach (int num in nums) {
            freqMap[num] = freqMap.GetValueOrDefault(num, 0) + 1;
        }

        var queue_minHeap = new SortedSet<(int freq, int value)>();

        foreach (var kvp in freqMap) {
            queue_minHeap.Add((kvp.Value, kvp.Key));
            if (queue_minHeap.Count > k) {
                queue_minHeap.Remove(queue_minHeap.Min);
            }
        }

        return queue_minHeap.Select(entry => entry.value).ToList();
    }

    static void Main() {
        int[] nums = {1, 1, 1, 2, 2, 3};
        int k = 2;
        var res = TopKFrequent(nums, k);
        Console.WriteLine($"Top {k} frequent elements: [{string.Join(", ", res)}]");
    }
}
`,
        "swift": `func topKFrequent(_ nums: [Int], _ k: Int) -> [Int] {
    var freqMap: [Int: Int] = [:]
    for num in nums {
        freqMap[num, default: 0] += 1
    }

    var heap: [(freq: Int, value: Int)] = []

    func siftUp() {
        var i = heap.count - 1
        while i > 0 {
            let parent = (i - 1) / 2
            if heap[parent].freq <= heap[i].freq { break }
            heap.swapAt(parent, i)
            i = parent
        }
    }

    func siftDown() {
        var i = 0
        let n = heap.count
        while true {
            var smallest = i
            let left = 2 * i + 1
            let right = 2 * i + 2
            if left < n && heap[left].freq < heap[smallest].freq { smallest = left }
            if right < n && heap[right].freq < heap[smallest].freq { smallest = right }
            if smallest == i { break }
            heap.swapAt(i, smallest)
            i = smallest
        }
    }

    for (value, freq) in freqMap {
        heap.append((freq, value))
        siftUp()
        if heap.count > k {
            heap[0] = heap.removeLast()
            siftDown()
        }
    }

    return heap.map { $0.value }
}

let nums = [1, 1, 1, 2, 2, 3]
let k = 2
let res = topKFrequent(nums, k)
print("Top \\(k) frequent elements: \\(res)")
`,
        "kotlin": `import java.util.PriorityQueue

fun topKFrequent(nums: IntArray, k: Int): List<Int> {
    val freqMap = HashMap<Int, Int>()
    for (num in nums) {
        freqMap[num] = (freqMap[num] ?: 0) + 1
    }

    val queue_minHeap = PriorityQueue<Pair<Int, Int>>(compareBy { it.second }) // (value, freq)

    for ((value, freq) in freqMap) {
        queue_minHeap.offer(value to freq)
        if (queue_minHeap.size > k) {
            queue_minHeap.poll()
        }
    }

    return queue_minHeap.map { it.first }
}

fun main() {
    val nums = intArrayOf(1, 1, 1, 2, 2, 3)
    val k = 2
    val res = topKFrequent(nums, k)
    println("Top $k frequent elements: $res")
}
`,
        "scala": `import scala.collection.mutable

object Main extends App {
    def topKFrequent(nums: Array[Int], k: Int): List[Int] = {
        val freqMap = mutable.Map[Int, Int]()
        for (num <- nums) {
            freqMap(num) = freqMap.getOrElse(num, 0) + 1
        }

        val ord = Ordering.by[(Int, Int), Int](_._2).reverse // order by freq, min on top
        val queue_minHeap = mutable.PriorityQueue[(Int, Int)]()(ord)

        for ((value, freq) <- freqMap) {
            queue_minHeap.enqueue((value, freq))
            if (queue_minHeap.size > k) {
                queue_minHeap.dequeue()
            }
        }

        queue_minHeap.map(_._1).toList
    }

    val nums = Array(1, 1, 1, 2, 2, 3)
    val k = 2
    val res = topKFrequent(nums, k)
    println(s"Top $k frequent elements: $res")
}
`,
        "go": `package main

import (
    "container/heap"
    "fmt"
)

type Entry struct {
    value int
    freq  int
}

type EntryHeap []Entry

func (h EntryHeap) Len() int            { return len(h) }
func (h EntryHeap) Less(i, j int) bool  { return h[i].freq < h[j].freq }
func (h EntryHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *EntryHeap) Push(x interface{}) { *h = append(*h, x.(Entry)) }
func (h *EntryHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

func topKFrequent(nums []int, k int) []int {
    freqMap := make(map[int]int)
    for _, num := range nums {
        freqMap[num]++
    }

    queue_minHeap := &EntryHeap{}
    heap.Init(queue_minHeap)

    for value, freq := range freqMap {
        heap.Push(queue_minHeap, Entry{value, freq})
        if queue_minHeap.Len() > k {
            heap.Pop(queue_minHeap)
        }
    }

    result := make([]int, queue_minHeap.Len())
    for i := len(result) - 1; i >= 0; i-- {
        result[i] = heap.Pop(queue_minHeap).(Entry).value
    }

    return result
}

func main() {
    nums := []int{1, 1, 1, 2, 2, 3}
    k := 2
    res := topKFrequent(nums, k)
    fmt.Printf("Top %d frequent elements: %v\\n", k, res)
}
`,
        "rust": `use std::cmp::Ordering;
use std::collections::{BinaryHeap, HashMap};

#[derive(Eq, PartialEq)]
struct Entry {
    freq: i32,
    value: i32,
}

// Reverse ordering so BinaryHeap behaves as a min-heap on frequency.
impl Ord for Entry {
    fn cmp(&self, other: &Self) -> Ordering {
        other.freq.cmp(&self.freq)
    }
}
impl PartialOrd for Entry {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

fn top_k_frequent(nums: &[i32], k: usize) -> Vec<i32> {
    let mut freq_map: HashMap<i32, i32> = HashMap::new();
    for &num in nums {
        *freq_map.entry(num).or_insert(0) += 1;
    }

    let mut min_heap: BinaryHeap<Entry> = BinaryHeap::new();

    for (&value, &freq) in freq_map.iter() {
        min_heap.push(Entry { freq, value });
        if min_heap.len() > k {
            min_heap.pop();
        }
    }

    min_heap.into_iter().map(|e| e.value).collect()
}

fn main() {
    let nums = vec![1, 1, 1, 2, 2, 3];
    let k = 2;
    let res = top_k_frequent(&nums, k);
    println!("Top {} frequent elements: {:?}", k, res);
}
`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. FIND MEDIAN FROM DATA STREAM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Find Median from Data Stream",
      href: "/algorithms/heap/median-stream",
      type: "Hard",

      about: [
        { tag: "h1", text: "Find Median from Data Stream" },
        { tag: "p", text: "Given a continuous stream of numbers arriving one at a time, this problem asks for the ability to report the MEDIAN of all numbers seen so far, at any point, efficiently — without re-sorting the entire dataset on every new arrival. The elegant solution uses TWO heaps simultaneously: a max-heap holding the smaller half of the numbers seen so far, and a min-heap holding the larger half, kept balanced in size at every step." },
        { tag: "p", text: "The key insight: the max-heap's root is always the largest of the 'lower half', and the min-heap's root is always the smallest of the 'upper half' — so if the two heaps are kept equal in size (or differing by at most one), the median is either the average of both roots (even total count) or simply the root of whichever heap has one extra element (odd total count), both retrievable in O(1)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Any 'maintain a running median (or running percentile) as data continuously arrives' requirement — real-time analytics dashboards, monitoring systems tracking median latency/response time",
          "Streaming statistics in general: this two-heap balancing technique generalises to tracking other order-statistics of a stream beyond just the median",
          "As the canonical example of using TWO heaps of opposite type together to implicitly maintain a sorted partition of a dataset, without ever fully sorting it",
          "Financial/trading systems tracking a running median price or volume across a continuous feed of transactions"
        ]},
        { tag: "note", variant: "tip", text: "The size-balancing rule (never let the two heaps differ by more than 1 in size) is what makes O(1) median retrieval possible — without that explicit balancing step on every insertion, the median couldn't be read directly from the two roots alone." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n) insert / O(1) query",
        best: [
          { tag: "h2", text: "Best Case — O(log n) insert" },
          { tag: "p", text: "Every insertion requires at least one heap-push operation (into one of the two heaps), and that push always costs O(log n) regardless of the specific value being inserted or the stream's current size — there's no shortcut even for the most favourable value." },
          { tag: "ul", items: [
            "Insert: O(log n) for the heap push into whichever heap the new value belongs to, plus possibly a single O(log n) rebalancing move (popping from one heap and pushing to the other) if sizes become unequal",
            "Query (getMedian): O(1) — simply peek the root(s) of one or both heaps"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n) insert / O(1) query" },
          { tag: "p", text: "Every insertion performs the same fixed sequence of heap operations regardless of where in the stream's distribution the new value falls — one push, and at most one rebalancing pop-and-push pair, both O(log n)." },
          { tag: "ul", items: [
            "Insert: O(log n), where n is the total count of elements inserted so far (the combined size of both heaps)",
            "Query: O(1), always — just read the root(s)",
            "This holds regardless of the actual sequence of values streamed in"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n) insert / O(1) query" },
          { tag: "p", text: "No value or insertion order increases the cost beyond the standard heap-push bound — every insertion requires exactly one O(log n) push and at most one additional O(log n) rebalancing step, regardless of stream content." },
          { tag: "ul", items: [
            "Worst case matches best/average for both operations: O(log n) insert, O(1) query",
            "This is the standard, unavoidable trade-off: maintaining the ability to query a running statistic in O(1) requires paying a logarithmic cost on every insertion to keep the underlying structures correctly balanced"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Every single value from the stream must be stored in one of the two heaps to be available for future median queries — there's no way to discard any value, since any of them could still be needed to compute a future median as the stream continues." },
          { tag: "ul", items: ["Max-heap (lower half) + min-heap (upper half), combined: O(n), where n is the total number of values streamed in so far"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the total number of values received so far, split roughly evenly between the two heaps by the balancing invariant, regardless of the specific value distribution." },
          { tag: "ul", items: ["Combined heap sizes: O(n), split as close to n/2 and n/2 as the balancing rule allows (differing by at most 1)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No value distribution increases space beyond storing every streamed value exactly once across the two heaps — this is an unavoidable cost of the problem itself, not a flaw of this specific algorithm." },
          { tag: "ul", items: [
            "O(n) total, identical across all cases — every algorithm solving this problem must retain all n values in some form, since any value could affect a future median calculation"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`class MedianFinder:
    lowerHalf ← empty max-heap     // holds the smaller half of all values
    upperHalf ← empty min-heap     // holds the larger half of all values

    function addNum(num):
        if lowerHalf is empty or num <= peek(lowerHalf):
            push(lowerHalf, num)
        else:
            push(upperHalf, num)

        // Rebalance: keep sizes equal, or lowerHalf at most 1 larger
        if size(lowerHalf) > size(upperHalf) + 1:
            push(upperHalf, pop(lowerHalf))
        else if size(upperHalf) > size(lowerHalf):
            push(lowerHalf, pop(upperHalf))

    function findMedian():
        if size(lowerHalf) > size(upperHalf):
            return peek(lowerHalf)
        else:
            return (peek(lowerHalf) + peek(upperHalf)) / 2` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain two heaps: a max-heap (lowerHalf) for the smaller half of all values seen, and a min-heap (upperHalf) for the larger half.",
          "On each new value, decide which half it belongs to by comparing it against the current maximum of lowerHalf (or default to lowerHalf if it's currently empty) — this keeps every value in lowerHalf ≤ every value in upperHalf.",
          "After insertion, rebalance if needed: if lowerHalf has grown more than one element larger than upperHalf, move its maximum over to upperHalf; if upperHalf has become larger than lowerHalf at all, move its minimum over to lowerHalf. This keeps the two heaps' sizes equal, or lowerHalf exactly one larger.",
          "To find the median: if lowerHalf has one extra element (odd total count), its maximum (the root) IS the median. If the two heaps are equal in size (even total count), the median is the average of both roots."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The core invariant — every value in lowerHalf is ≤ every value in upperHalf, and the two heaps' sizes differ by at most 1 — is maintained on every insertion by the explicit rebalancing step, and this invariant is exactly what's needed to guarantee correctness: it means lowerHalf contains precisely the smaller half (or smaller-half-plus-one, if odd) of ALL values seen, and upperHalf contains precisely the larger half. Given this partition, the median is, by definition, either the boundary element (lowerHalf's maximum, when there's an odd total count and lowerHalf holds the extra element) or the average of the two boundary elements (when the count is even and the true median lies between them) — exactly what findMedian computes, using only the O(1)-accessible roots of both heaps." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <queue>

using namespace std;

class MedianFinder {
public:
    priority_queue<int> lowerHalf;                                  // max-heap
    priority_queue<int, vector<int>, greater<int>> upperHalf;        // min-heap

    void addNum(int num) {
        if (lowerHalf.empty() || num <= lowerHalf.top()) {
            lowerHalf.push(num);
        } else {
            upperHalf.push(num);
        }

        if (lowerHalf.size() > upperHalf.size() + 1) {
            upperHalf.push(lowerHalf.top());
            lowerHalf.pop();
        } else if (upperHalf.size() > lowerHalf.size()) {
            lowerHalf.push(upperHalf.top());
            upperHalf.pop();
        }
    }

    double findMedian() {
        if (lowerHalf.size() > upperHalf.size()) {
            return lowerHalf.top();
        }
        return (lowerHalf.top() + upperHalf.top()) / 2.0;
    }
};

int main() {
    MedianFinder mf;

    mf.addNum(1);
    mf.addNum(2);
    cout << "Median after adding 1, 2: " << mf.findMedian() << endl;

    mf.addNum(3);
    cout << "Median after adding 3: " << mf.findMedian() << endl;

    mf.addNum(10);
    mf.addNum(20);
    cout << "Median after adding 10, 20: " << mf.findMedian() << endl;

    return 0;
}
`,
        "python": `import heapq

class MedianFinder:
    def __init__(self):
        self.lower_half = []  # max-heap (store negated values)
        self.upper_half = []  # min-heap

    def add_num(self, num):
        if not self.lower_half or num <= -self.lower_half[0]:
            heapq.heappush(self.lower_half, -num)
        else:
            heapq.heappush(self.upper_half, num)

        if len(self.lower_half) > len(self.upper_half) + 1:
            heapq.heappush(self.upper_half, -heapq.heappop(self.lower_half))
        elif len(self.upper_half) > len(self.lower_half):
            heapq.heappush(self.lower_half, -heapq.heappop(self.upper_half))

    def find_median(self):
        if len(self.lower_half) > len(self.upper_half):
            return -self.lower_half[0]
        return (-self.lower_half[0] + self.upper_half[0]) / 2.0

if __name__ == "__main__":
    mf = MedianFinder()

    mf.add_num(1)
    mf.add_num(2)
    print(f"Median after adding 1, 2: {mf.find_median()}")

    mf.add_num(3)
    print(f"Median after adding 3: {mf.find_median()}")

    mf.add_num(10)
    mf.add_num(20)
    print(f"Median after adding 10, 20: {mf.find_median()}")
`,
        "java": `import java.util.PriorityQueue;
import java.util.Collections;

public class Main {
    static class MedianFinder {
        PriorityQueue<Integer> lowerHalf = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
        PriorityQueue<Integer> upperHalf = new PriorityQueue<>();                            // min-heap

        void addNum(int num) {
            if (lowerHalf.isEmpty() || num <= lowerHalf.peek()) {
                lowerHalf.offer(num);
            } else {
                upperHalf.offer(num);
            }

            if (lowerHalf.size() > upperHalf.size() + 1) {
                upperHalf.offer(lowerHalf.poll());
            } else if (upperHalf.size() > lowerHalf.size()) {
                lowerHalf.offer(upperHalf.poll());
            }
        }

        double findMedian() {
            if (lowerHalf.size() > upperHalf.size()) {
                return lowerHalf.peek();
            }
            return (lowerHalf.peek() + upperHalf.peek()) / 2.0;
        }
    }

    public static void main(String[] args) {
        MedianFinder mf = new MedianFinder();

        mf.addNum(1);
        mf.addNum(2);
        System.out.println("Median after adding 1, 2: " + mf.findMedian());

        mf.addNum(3);
        System.out.println("Median after adding 3: " + mf.findMedian());

        mf.addNum(10);
        mf.addNum(20);
        System.out.println("Median after adding 10, 20: " + mf.findMedian());
    }
}
`,
        "js": `class MedianFinder {
    constructor() {
        this.lowerHalf = []; // max-heap (store negated values)
        this.upperHalf = []; // min-heap
    }

    static siftUp(heap) {
        let i = heap.length - 1;
        while (i > 0) {
            const parent = (i - 1) >> 1;
            if (heap[parent] <= heap[i]) break;
            [heap[parent], heap[i]] = [heap[i], heap[parent]];
            i = parent;
        }
    }

    static siftDown(heap) {
        let i = 0;
        const n = heap.length;
        while (true) {
            let smallest = i;
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            if (left < n && heap[left] < heap[smallest]) smallest = left;
            if (right < n && heap[right] < heap[smallest]) smallest = right;
            if (smallest === i) break;
            [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
            i = smallest;
        }
    }

    static push(heap, val) {
        heap.push(val);
        MedianFinder.siftUp(heap);
    }

    static pop(heap) {
        const top = heap[0];
        const last = heap.pop();
        if (heap.length > 0) {
            heap[0] = last;
            MedianFinder.siftDown(heap);
        }
        return top;
    }

    addNum(num) {
        if (this.lowerHalf.length === 0 || num <= -this.lowerHalf[0]) {
            MedianFinder.push(this.lowerHalf, -num);
        } else {
            MedianFinder.push(this.upperHalf, num);
        }

        if (this.lowerHalf.length > this.upperHalf.length + 1) {
            MedianFinder.push(this.upperHalf, -MedianFinder.pop(this.lowerHalf));
        } else if (this.upperHalf.length > this.lowerHalf.length) {
            MedianFinder.push(this.lowerHalf, -MedianFinder.pop(this.upperHalf));
        }
    }

    findMedian() {
        if (this.lowerHalf.length > this.upperHalf.length) {
            return -this.lowerHalf[0];
        }
        return (-this.lowerHalf[0] + this.upperHalf[0]) / 2;
    }
}

const mf = new MedianFinder();

mf.addNum(1);
mf.addNum(2);
console.log(\`Median after adding 1, 2: \${mf.findMedian()}\`);

mf.addNum(3);
console.log(\`Median after adding 3: \${mf.findMedian()}\`);

mf.addNum(10);
mf.addNum(20);
console.log(\`Median after adding 10, 20: \${mf.findMedian()}\`);
`,
        "c": `#include <stdio.h>

// Fixed-capacity array-backed heaps for demonstration purposes.
#define MAX_N 1000

int lowerHalf[MAX_N]; // max-heap
int lowerSize = 0;
int upperHalf[MAX_N]; // min-heap
int upperSize = 0;

void siftUpMax(int* heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent] >= heap[i]) break;
        int t = heap[parent]; heap[parent] = heap[i]; heap[i] = t;
        i = parent;
    }
}

void siftDownMax(int* heap, int size) {
    int i = 0;
    while (1) {
        int largest = i, left = 2 * i + 1, right = 2 * i + 2;
        if (left < size && heap[left] > heap[largest]) largest = left;
        if (right < size && heap[right] > heap[largest]) largest = right;
        if (largest == i) break;
        int t = heap[i]; heap[i] = heap[largest]; heap[largest] = t;
        i = largest;
    }
}

void siftUpMin(int* heap, int i) {
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap[parent] <= heap[i]) break;
        int t = heap[parent]; heap[parent] = heap[i]; heap[i] = t;
        i = parent;
    }
}

void siftDownMin(int* heap, int size) {
    int i = 0;
    while (1) {
        int smallest = i, left = 2 * i + 1, right = 2 * i + 2;
        if (left < size && heap[left] < heap[smallest]) smallest = left;
        if (right < size && heap[right] < heap[smallest]) smallest = right;
        if (smallest == i) break;
        int t = heap[i]; heap[i] = heap[smallest]; heap[smallest] = t;
        i = smallest;
    }
}

void addNum(int num) {
    if (lowerSize == 0 || num <= lowerHalf[0]) {
        lowerHalf[lowerSize++] = num;
        siftUpMax(lowerHalf, lowerSize - 1);
    } else {
        upperHalf[upperSize++] = num;
        siftUpMin(upperHalf, upperSize - 1);
    }

    if (lowerSize > upperSize + 1) {
        int moved = lowerHalf[0];
        lowerHalf[0] = lowerHalf[--lowerSize];
        siftDownMax(lowerHalf, lowerSize);
        upperHalf[upperSize++] = moved;
        siftUpMin(upperHalf, upperSize - 1);
    } else if (upperSize > lowerSize) {
        int moved = upperHalf[0];
        upperHalf[0] = upperHalf[--upperSize];
        siftDownMin(upperHalf, upperSize);
        lowerHalf[lowerSize++] = moved;
        siftUpMax(lowerHalf, lowerSize - 1);
    }
}

double findMedian() {
    if (lowerSize > upperSize) {
        return lowerHalf[0];
    }
    return (lowerHalf[0] + upperHalf[0]) / 2.0;
}

int main() {
    addNum(1);
    addNum(2);
    printf("Median after adding 1, 2: %.1f\\n", findMedian());

    addNum(3);
    printf("Median after adding 3: %.1f\\n", findMedian());

    addNum(10);
    addNum(20);
    printf("Median after adding 10, 20: %.1f\\n", findMedian());

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;
using System.Linq;

class MedianFinder {
    List<int> lowerHalf = new List<int>(); // max-heap semantics via sorted list
    List<int> upperHalf = new List<int>(); // min-heap semantics via sorted list

    void InsertSorted(List<int> list, int val, bool descending) {
        int idx = list.BinarySearch(val, descending
            ? Comparer<int>.Create((a, b) => b.CompareTo(a))
            : Comparer<int>.Default);
        if (idx < 0) idx = ~idx;
        list.Insert(idx, val);
    }

    public void AddNum(int num) {
        if (lowerHalf.Count == 0 || num <= lowerHalf[0]) {
            InsertSorted(lowerHalf, num, true);
        } else {
            InsertSorted(upperHalf, num, false);
        }

        if (lowerHalf.Count > upperHalf.Count + 1) {
            int moved = lowerHalf[0];
            lowerHalf.RemoveAt(0);
            InsertSorted(upperHalf, moved, false);
        } else if (upperHalf.Count > lowerHalf.Count) {
            int moved = upperHalf[0];
            upperHalf.RemoveAt(0);
            InsertSorted(lowerHalf, moved, true);
        }
    }

    public double FindMedian() {
        if (lowerHalf.Count > upperHalf.Count) {
            return lowerHalf[0];
        }
        return (lowerHalf[0] + upperHalf[0]) / 2.0;
    }
}

class Program {
    static void Main() {
        var mf = new MedianFinder();

        mf.AddNum(1);
        mf.AddNum(2);
        Console.WriteLine($"Median after adding 1, 2: {mf.FindMedian()}");

        mf.AddNum(3);
        Console.WriteLine($"Median after adding 3: {mf.FindMedian()}");

        mf.AddNum(10);
        mf.AddNum(20);
        Console.WriteLine($"Median after adding 10, 20: {mf.FindMedian()}");
    }
}
`,
        "swift": `final class MedianFinder {
    private var lowerHalf: [Int] = [] // max-heap (store negated values)
    private var upperHalf: [Int] = [] // min-heap

    private func siftUp(_ heap: inout [Int]) {
        var i = heap.count - 1
        while i > 0 {
            let parent = (i - 1) / 2
            if heap[parent] <= heap[i] { break }
            heap.swapAt(parent, i)
            i = parent
        }
    }

    private func siftDown(_ heap: inout [Int]) {
        var i = 0
        let n = heap.count
        while true {
            var smallest = i
            let left = 2 * i + 1
            let right = 2 * i + 2
            if left < n && heap[left] < heap[smallest] { smallest = left }
            if right < n && heap[right] < heap[smallest] { smallest = right }
            if smallest == i { break }
            heap.swapAt(i, smallest)
            i = smallest
        }
    }

    private func push(_ heap: inout [Int], _ val: Int) {
        heap.append(val)
        siftUp(&heap)
    }

    private func pop(_ heap: inout [Int]) -> Int {
        let top = heap[0]
        let last = heap.removeLast()
        if !heap.isEmpty {
            heap[0] = last
            siftDown(&heap)
        }
        return top
    }

    func addNum(_ num: Int) {
        if lowerHalf.isEmpty || num <= -lowerHalf[0] {
            push(&lowerHalf, -num)
        } else {
            push(&upperHalf, num)
        }

        if lowerHalf.count > upperHalf.count + 1 {
            push(&upperHalf, -pop(&lowerHalf))
        } else if upperHalf.count > lowerHalf.count {
            push(&lowerHalf, -pop(&upperHalf))
        }
    }

    func findMedian() -> Double {
        if lowerHalf.count > upperHalf.count {
            return Double(-lowerHalf[0])
        }
        return Double(-lowerHalf[0] + upperHalf[0]) / 2.0
    }
}

let mf = MedianFinder()

mf.addNum(1)
mf.addNum(2)
print("Median after adding 1, 2: \\(mf.findMedian())")

mf.addNum(3)
print("Median after adding 3: \\(mf.findMedian())")

mf.addNum(10)
mf.addNum(20)
print("Median after adding 10, 20: \\(mf.findMedian())")
`,
        "kotlin": `import java.util.PriorityQueue
import java.util.Collections

class MedianFinder {
    private val lowerHalf = PriorityQueue<Int>(Collections.reverseOrder()) // max-heap
    private val upperHalf = PriorityQueue<Int>()                          // min-heap

    fun addNum(num: Int) {
        if (lowerHalf.isEmpty() || num <= lowerHalf.peek()) {
            lowerHalf.offer(num)
        } else {
            upperHalf.offer(num)
        }

        if (lowerHalf.size > upperHalf.size + 1) {
            upperHalf.offer(lowerHalf.poll())
        } else if (upperHalf.size > lowerHalf.size) {
            lowerHalf.offer(upperHalf.poll())
        }
    }

    fun findMedian(): Double {
        return if (lowerHalf.size > upperHalf.size) {
            lowerHalf.peek().toDouble()
        } else {
            (lowerHalf.peek() + upperHalf.peek()) / 2.0
        }
    }
}

fun main() {
    val mf = MedianFinder()

    mf.addNum(1)
    mf.addNum(2)
    println("Median after adding 1, 2: \${mf.findMedian()}")

    mf.addNum(3)
    println("Median after adding 3: \${mf.findMedian()}")

    mf.addNum(10)
    mf.addNum(20)
    println("Median after adding 10, 20: \${mf.findMedian()}")
}
`,
        "scala": `import scala.collection.mutable

class MedianFinder {
    private val lowerHalf = mutable.PriorityQueue[Int]() // max-heap by default
    private val upperHalf = mutable.PriorityQueue[Int]()(Ordering.Int.reverse) // min-heap

    def addNum(num: Int): Unit = {
        if (lowerHalf.isEmpty || num <= lowerHalf.head) {
            lowerHalf.enqueue(num)
        } else {
            upperHalf.enqueue(num)
        }

        if (lowerHalf.size > upperHalf.size + 1) {
            upperHalf.enqueue(lowerHalf.dequeue())
        } else if (upperHalf.size > lowerHalf.size) {
            lowerHalf.enqueue(upperHalf.dequeue())
        }
    }

    def findMedian(): Double = {
        if (lowerHalf.size > upperHalf.size) {
            lowerHalf.head.toDouble
        } else {
            (lowerHalf.head + upperHalf.head) / 2.0
        }
    }
}

object Main extends App {
    val mf = new MedianFinder()

    mf.addNum(1)
    mf.addNum(2)
    println(s"Median after adding 1, 2: \${mf.findMedian()}")

    mf.addNum(3)
    println(s"Median after adding 3: \${mf.findMedian()}")

    mf.addNum(10)
    mf.addNum(20)
    println(s"Median after adding 10, 20: \${mf.findMedian()}")
}
`,
        "go": `package main

import (
    "container/heap"
    "fmt"
)

// MaxHeap for the lower half.
type MaxHeap []int

func (h MaxHeap) Len() int            { return len(h) }
func (h MaxHeap) Less(i, j int) bool  { return h[i] > h[j] }
func (h MaxHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *MaxHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MaxHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

// MinHeap for the upper half.
type MinHeap []int

func (h MinHeap) Len() int            { return len(h) }
func (h MinHeap) Less(i, j int) bool  { return h[i] < h[j] }
func (h MinHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
func (h *MinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
func (h *MinHeap) Pop() interface{} {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[:n-1]
    return x
}

type MedianFinder struct {
    lowerHalf *MaxHeap
    upperHalf *MinHeap
}

func NewMedianFinder() *MedianFinder {
    lower := &MaxHeap{}
    upper := &MinHeap{}
    heap.Init(lower)
    heap.Init(upper)
    return &MedianFinder{lowerHalf: lower, upperHalf: upper}
}

func (mf *MedianFinder) AddNum(num int) {
    if mf.lowerHalf.Len() == 0 || num <= (*mf.lowerHalf)[0] {
        heap.Push(mf.lowerHalf, num)
    } else {
        heap.Push(mf.upperHalf, num)
    }

    if mf.lowerHalf.Len() > mf.upperHalf.Len()+1 {
        moved := heap.Pop(mf.lowerHalf).(int)
        heap.Push(mf.upperHalf, moved)
    } else if mf.upperHalf.Len() > mf.lowerHalf.Len() {
        moved := heap.Pop(mf.upperHalf).(int)
        heap.Push(mf.lowerHalf, moved)
    }
}

func (mf *MedianFinder) FindMedian() float64 {
    if mf.lowerHalf.Len() > mf.upperHalf.Len() {
        return float64((*mf.lowerHalf)[0])
    }
    return float64((*mf.lowerHalf)[0]+(*mf.upperHalf)[0]) / 2.0
}

func main() {
    mf := NewMedianFinder()

    mf.AddNum(1)
    mf.AddNum(2)
    fmt.Printf("Median after adding 1, 2: %.1f\\n", mf.FindMedian())

    mf.AddNum(3)
    fmt.Printf("Median after adding 3: %.1f\\n", mf.FindMedian())

    mf.AddNum(10)
    mf.AddNum(20)
    fmt.Printf("Median after adding 10, 20: %.1f\\n", mf.FindMedian())
}
`,
        "rust": `use std::cmp::Reverse;
use std::collections::BinaryHeap;

struct MedianFinder {
    lower_half: BinaryHeap<i32>,         // max-heap
    upper_half: BinaryHeap<Reverse<i32>>, // min-heap
}

impl MedianFinder {
    fn new() -> Self {
        MedianFinder {
            lower_half: BinaryHeap::new(),
            upper_half: BinaryHeap::new(),
        }
    }

    fn add_num(&mut self, num: i32) {
        let goes_in_lower = match self.lower_half.peek() {
            None => true,
            Some(&top) => num <= top,
        };

        if goes_in_lower {
            self.lower_half.push(num);
        } else {
            self.upper_half.push(Reverse(num));
        }

        if self.lower_half.len() > self.upper_half.len() + 1 {
            if let Some(moved) = self.lower_half.pop() {
                self.upper_half.push(Reverse(moved));
            }
        } else if self.upper_half.len() > self.lower_half.len() {
            if let Some(Reverse(moved)) = self.upper_half.pop() {
                self.lower_half.push(moved);
            }
        }
    }

    fn find_median(&self) -> f64 {
        if self.lower_half.len() > self.upper_half.len() {
            *self.lower_half.peek().unwrap() as f64
        } else {
            let lower_top = *self.lower_half.peek().unwrap();
            let upper_top = self.upper_half.peek().unwrap().0;
            (lower_top + upper_top) as f64 / 2.0
        }
    }
}

fn main() {
    let mut mf = MedianFinder::new();

    mf.add_num(1);
    mf.add_num(2);
    println!("Median after adding 1, 2: {}", mf.find_median());

    mf.add_num(3);
    println!("Median after adding 3: {}", mf.find_median());

    mf.add_num(10);
    mf.add_num(20);
    println!("Median after adding 10, 20: {}", mf.find_median());
}
`
      }
    }

  ],
  desc: "Min-heap, max-heap, k-way merge, top-k",
  complexity: "O(log n)",
  featured: true
};

export default HEAP_SECTION;
