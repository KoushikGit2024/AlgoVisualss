const GREEDY_SECTION = {
  name: "Greedy",
  href: "/algorithms/greedy",
    iconId: "Greedy",
    hoverIconId: "Greedy",

  about: [
    { tag: "h1", text: "Greedy" },
    { tag: "p", text: "A greedy algorithm builds a solution by making the locally best choice at every step, without ever reconsidering or undoing earlier decisions, and never looking ahead to see how a choice plays out globally. This is dramatically simpler and faster than Dynamic Programming's exhaustive subproblem exploration — but it's only CORRECT for problems with a specific structural property, and using it on a problem that lacks that property silently produces a wrong (suboptimal) answer with no warning." },
    { tag: "p", text: "The two properties that justify a greedy approach are the GREEDY CHOICE PROPERTY (a locally optimal choice at each step is always part of SOME globally optimal solution — you never need to reconsider it) and OPTIMAL SUBSTRUCTURE (an optimal solution to the whole problem contains optimal solutions to its subproblems, the same property DP relies on). Every algorithm in this section comes with a PROOF (usually an exchange argument or the Cut Property for MST) establishing that the greedy choice property genuinely holds — this proof is what separates a correct greedy algorithm from a plausible-looking one that happens to fail on some input." },
    { tag: "h2", text: "Greedy vs. Dynamic Programming" },
    { tag: "table",
      headers: ["Aspect", "Greedy", "Dynamic Programming"],
      rows: [
        ["Choices reconsidered?", "Never — each choice is final", "Implicitly, via exploring all subproblem combinations"],
        ["Typical complexity", "O(n log n) (often dominated by an initial sort)", "O(n²) or worse (state space exploration)"],
        ["Requires proof of correctness?", "Yes — greedy choice property must be explicitly justified", "Optimal substructure alone is usually sufficient"],
        ["Classic warning example", "0/1 Knapsack — greedy by value/weight ratio fails", "Coin Change with non-canonical coins — greedy fails, DP succeeds"]
      ]
    },
    { tag: "h2", text: "Recognising when greedy is safe" },
    { tag: "ul", items: [
      "Sorting the input by some criterion (deadline, weight, frequency, ratio) makes the locally-best choice immediately obvious at each step",
      "A standard EXCHANGE ARGUMENT can show: if an optimal solution doesn't make the greedy choice, it can be modified to make that choice without getting worse — this is the formal proof technique behind most of the algorithms below",
      "For graph problems specifically, the Cut Property (used for Minimum Spanning Tree below, and Kruskal's/Prim's in the Graphs section) is the standard justification",
      "If you can construct EVEN ONE counterexample where the locally-best choice leads to a globally worse outcome, greedy is NOT valid for that problem — Dynamic Programming or another technique is needed instead"
    ]},
    { tag: "note", variant: "warning", text: "Greedy algorithms have no general-purpose 'try it and see' safety net — getting the greedy choice property wrong produces a confidently wrong answer, not a slow-but-correct one. Always verify the exchange argument (or find it already proven, as with the classic problems in this section) before trusting a greedy approach on a new problem." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. JUMP GAME
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Jump Game",
      href: "/algorithms/greedy/jump-game",
      type: "Medium",

      about: [
        { tag: "h1", text: "Jump Game" },
        { tag: "p", text: "Given an array where each element represents the MAXIMUM jump length from that position, determine whether it's possible to reach the last index starting from the first. A naive backtracking/DP approach explores every possible sequence of jumps, but a greedy approach solves it in a single O(n) pass by tracking only the FARTHEST reachable index seen so far, without ever needing to know the specific sequence of jumps that gets there." },
        { tag: "p", text: "The greedy insight: at every position, all that matters for determining reachability of the END is the single number 'farthest index reachable so far' — the SPECIFIC path taken to achieve that reach is irrelevant, since any jump sequence achieving the same maximum reach is equally good for the purpose of eventually reaching the end. This collapses what looks like an exponential path-exploration problem into tracking one running value." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Reachability questions on arrays/sequences where each position has a 'maximum step' constraint — the literal Jump Game problem and its variant 'Jump Game II' (minimum number of jumps, rather than just reachability)",
          "Any problem reducible to 'can I always reach/cover position X given a sequence of local maximum-extension constraints' — this exact greedy 'track the farthest boundary' pattern appears in interval-covering and broadcast/relay-range problems too",
          "As a clean illustration of a greedy algorithm that doesn't even need to SORT its input first (unlike most other entries in this section) — the single left-to-right pass with a running maximum is sufficient on its own",
          "A useful contrast against Dynamic Programming approaches to the same problem: DP would track reachability at every individual position (O(n²) in the naive formulation), while the greedy approach needs only the single running maximum"
        ]},
        { tag: "note", variant: "tip", text: "The greedy choice property here is almost self-evident once stated correctly: if you can reach some position p, and p is within the currently-known farthest reach, then whatever sequence of jumps got you to the current farthest reach is, for the purpose of going EVEN further, exactly as good as any other sequence achieving that same reach — there's no reason to ever prefer one path over another with an equal or smaller farthest reach." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If the very first element's jump length already reaches (or exceeds) the last index, the algorithm can determine success after examining just one element." },
          { tag: "ul", items: ["arr[0] >= n − 1: immediately confirmed reachable — O(1)", "This is a favourable-input case, not the general bound"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "A single forward pass examines each position once, updating the running 'farthest reachable' value with an O(1) comparison at each step." },
          { tag: "ul", items: [
            "n positions, each requiring O(1) work: update farthest ← max(farthest, i + arr[i]), and check if the current position i is even reachable (i <= farthest)",
            "Total: O(n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even when the answer is 'unreachable' (requiring confirmation by reaching a position beyond the current farthest reach), the algorithm need only scan up to that failure point — bounded by O(n) in any case." },
          { tag: "ul", items: [
            "Worst case: scanning all n positions either to confirm full reachability or to detect the exact position where forward progress becomes impossible: O(n)",
            "This is a decisive improvement over a naive exponential path-exploration approach, and even beats a straightforward O(n²) DP formulation of the same problem"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only a single running variable (the farthest reachable index so far) is needed throughout the entire algorithm." },
          { tag: "ul", items: ["farthest — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on array length or content — it's always exactly one running variable, a stark contrast to a DP-based approach that would typically need an O(n) array tracking reachability at every position." },
          { tag: "ul", items: ["No auxiliary array needed — purely a single running scalar"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input configuration increases memory usage beyond the single tracked variable — this is the entire structural advantage of the greedy approach over a DP-based alternative for this specific problem." },
          { tag: "ul", items: ["O(1) regardless of n — this space efficiency is a direct consequence of needing to track only the SINGLE most useful summary statistic (farthest reach), rather than full per-position state"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function canJump(nums):
    farthest ← 0

    for i from 0 to length(nums) − 1:
        if i > farthest:
            return false              // this position is unreachable — dead end confirmed

        farthest ← max(farthest, i + nums[i])

        if farthest >= length(nums) − 1:
            return true                // last index is already guaranteed reachable

    return true` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Track a single running value: the farthest index reachable using any combination of jumps made so far.",
          "At each position i, first check whether i itself is even reachable — if i exceeds the farthest reach established by all PREVIOUS positions, there's no way to have arrived at position i at all, so the array is unreachable beyond this point.",
          "If i IS reachable, update the farthest reach: from position i, the array's value at that position allows jumping up to i + nums[i] — take the maximum of this and the previous farthest reach.",
          "As soon as the farthest reach covers or exceeds the last index, success is guaranteed — return true immediately without needing to scan the rest of the array.",
          "If the loop completes without ever finding an unreachable position, the last index was reached (or the farthest reach already covered it during the scan) — return true."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The greedy choice property here is that maintaining only the SINGLE maximum reachable index, rather than tracking every individual reachable position, loses no information relevant to the final answer — because if position p is reachable, then EVERY position between the start and the current maximum reach is ALSO reachable (a position q < farthest is reachable because some earlier position i <= q has nums[i] large enough to cover at least up to the current farthest value, and by the inductive construction of 'farthest', that earlier position was itself confirmed reachable). This means 'is the last index within the current farthest reach' is not just a necessary condition but a fully SUFFICIENT one for reachability, and tracking the single maximum value across a left-to-right scan correctly captures everything needed to answer the question, with no loss of information from discarding the specific paths that achieved that maximum." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

bool canJump(const vector<int>& nums) {
    int maxReach = 0;
    for (int i = 0; i < nums.size(); i++) {
        if (i > maxReach) return false;
        maxReach = max(maxReach, i + nums[i]);
        if (maxReach >= nums.size() - 1) return true;
    }
    return true;
}

int main() {
    vector<int> nums1 = {2, 3, 1, 1, 4};
    vector<int> nums2 = {3, 2, 1, 0, 4};
    cout << "Can jump (nums1): " << (canJump(nums1) ? "true" : "false") << endl;
    cout << "Can jump (nums2): " << (canJump(nums2) ? "true" : "false") << endl;
    return 0;
}`,
        "python": `def can_jump(nums):
    max_reach = 0
    for i, jump in enumerate(nums):
        if i > max_reach:
            return False
        max_reach = max(max_reach, i + jump)
        if max_reach >= len(nums) - 1:
            return True
    return True

if __name__ == "__main__":
    nums1 = [2, 3, 1, 1, 4]
    nums2 = [3, 2, 1, 0, 4]
    print(f"Can jump (nums1): {can_jump(nums1)}")
    print(f"Can jump (nums2): {can_jump(nums2)}")`,
        "java": `public class Main {
    public static boolean canJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.max(maxReach, i + nums[i]);
            if (maxReach >= nums.length - 1) return true;
        }
        return true;
    }

    public static void main(String[] args) {
        int[] nums1 = {2, 3, 1, 1, 4};
        int[] nums2 = {3, 2, 1, 0, 4};
        System.out.println("Can jump (nums1): " + canJump(nums1));
        System.out.println("Can jump (nums2): " + canJump(nums2));
    }
}`,
        "js": `function canJump(nums) {
    let maxReach = 0;
    for (let i = 0; i < nums.length; i++) {
        if (i > maxReach) return false;
        maxReach = Math.max(maxReach, i + nums[i]);
        if (maxReach >= nums.length - 1) return true;
    }
    return true;
}

const nums1 = [2, 3, 1, 1, 4];
const nums2 = [3, 2, 1, 0, 4];
console.log("Can jump (nums1):", canJump(nums1));
console.log("Can jump (nums2):", canJump(nums2));`,
        "c": `#include <stdio.h>
#include <stdbool.h>

int max(int a, int b) { return a > b ? a : b; }

bool canJump(int* nums, int numsSize) {
    int maxReach = 0;
    for (int i = 0; i < numsSize; i++) {
        if (i > maxReach) return false;
        maxReach = max(maxReach, i + nums[i]);
        if (maxReach >= numsSize - 1) return true;
    }
    return true;
}

int main() {
    int nums1[] = {2, 3, 1, 1, 4};
    int nums2[] = {3, 2, 1, 0, 4};
    printf("Can jump (nums1): %s\\n", canJump(nums1, 5) ? "true" : "false");
    printf("Can jump (nums2): %s\\n", canJump(nums2, 5) ? "true" : "false");
    return 0;
}`,
        "c#": `using System;

class Program {
    static bool CanJump(int[] nums) {
        int maxReach = 0;
        for (int i = 0; i < nums.Length; i++) {
            if (i > maxReach) return false;
            maxReach = Math.Max(maxReach, i + nums[i]);
            if (maxReach >= nums.Length - 1) return true;
        }
        return true;
    }

    static void Main() {
        int[] nums1 = { 2, 3, 1, 1, 4 };
        int[] nums2 = { 3, 2, 1, 0, 4 };
        Console.WriteLine($"Can jump (nums1): {CanJump(nums1)}");
        Console.WriteLine($"Can jump (nums2): {CanJump(nums2)}");
    }
}`,
        "swift": `func canJump(_ nums: [Int]) -> Bool {
    var maxReach = 0
    for i in 0..<nums.count {
        if i > maxReach { return false }
        maxReach = max(maxReach, i + nums[i])
        if maxReach >= nums.count - 1 { return true }
    }
    return true
}

let nums1 = [2, 3, 1, 1, 4]
let nums2 = [3, 2, 1, 0, 4]
print("Can jump (nums1): \\(canJump(nums1))")
print("Can jump (nums2): \\(canJump(nums2))")`,
        "kotlin": `import kotlin.math.max

fun canJump(nums: IntArray): Boolean {
    var maxReach = 0
    for (i in nums.indices) {
        if (i > maxReach) return false
        maxReach = max(maxReach, i + nums[i])
        if (maxReach >= nums.size - 1) return true
    }
    return true
}

fun main() {
    val nums1 = intArrayOf(2, 3, 1, 1, 4)
    val nums2 = intArrayOf(3, 2, 1, 0, 4)
    println("Can jump (nums1): \${canJump(nums1)}")
    println("Can jump (nums2): \${canJump(nums2)}")
}`,
        "scala": `object Main extends App {
    def canJump(nums: Array[Int]): Boolean = {
        var maxReach = 0
        for (i <- nums.indices) {
            if (i > maxReach) return false
            maxReach = math.max(maxReach, i + nums(i))
            if (maxReach >= nums.length - 1) return true
        }
        true
    }

    val nums1 = Array(2, 3, 1, 1, 4)
    val nums2 = Array(3, 2, 1, 0, 4)
    println(s"Can jump (nums1): \${canJump(nums1)}")
    println(s"Can jump (nums2): \${canJump(nums2)}")
}`,
        "go": `package main

import "fmt"

func max(a, b int) int {
    if a > b { return a }
    return b
}

func canJump(nums []int) bool {
    maxReach := 0
    for i, jump := range nums {
        if i > maxReach {
            return false
        }
        maxReach = max(maxReach, i+jump)
        if maxReach >= len(nums)-1 {
            return true
        }
    }
    return true
}

func main() {
    nums1 := []int{2, 3, 1, 1, 4}
    nums2 := []int{3, 2, 1, 0, 4}
    fmt.Printf("Can jump (nums1): %v\\n", canJump(nums1))
    fmt.Printf("Can jump (nums2): %v\\n", canJump(nums2))
}`,
        "rust": `fn can_jump(nums: Vec<i32>) -> bool {
    let mut max_reach = 0;
    for (i, &jump) in nums.iter().enumerate() {
        if i > max_reach {
            return false;
        }
        max_reach = std::cmp::max(max_reach, i + jump as usize);
        if max_reach >= nums.len() - 1 {
            return true;
        }
    }
    true
}

fn main() {
    let nums1 = vec![2, 3, 1, 1, 4];
    let nums2 = vec![3, 2, 1, 0, 4];
    println!("Can jump (nums1): {}", can_jump(nums1));
    println!("Can jump (nums2): {}", can_jump(nums2));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. HUFFMAN CODING
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Huffman Coding",
      href: "/algorithms/greedy/huffman",
      type: "Medium",

      about: [
        { tag: "h1", text: "Huffman Coding" },
        { tag: "p", text: "Huffman Coding, developed by David Huffman in 1952, builds an optimal PREFIX-FREE binary encoding for a set of symbols based on their frequencies — assigning shorter bit-codes to more frequent symbols and longer codes to rarer ones, minimising the total encoded length. 'Prefix-free' means no symbol's code is a prefix of any other symbol's code, which is exactly what allows a stream of concatenated codes to be decoded unambiguously without any separator characters." },
        { tag: "p", text: "The algorithm builds a binary tree BOTTOM-UP using a greedy strategy: repeatedly take the two LEAST frequent remaining nodes (using a min-heap for efficient extraction) and merge them into a new internal node whose frequency is their sum, continuing until only one node — the tree's root — remains. Each symbol's final code is the path of left/right edges from the root to its leaf, and the greedy 'always merge the two smallest' rule is provably what minimises the total weighted path length." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Lossless data compression: Huffman coding (or close variants) is a component of widely used formats including DEFLATE (used in ZIP, gzip, and PNG), JPEG, and MP3 — minimising encoded size based on symbol frequency",
          "Any 'build an optimal prefix-free code given symbol frequencies' problem — the two-smallest-merge greedy strategy generalises directly",
          "As a canonical example of a greedy algorithm constructing a TREE structure bottom-up, in contrast to most other greedy algorithms in this section which build a flat sequence or selection",
          "Network protocol design and any scenario where variable-length, uniquely-decodable encoding of a known symbol-frequency distribution is needed"
        ]},
        { tag: "note", variant: "tip", text: "Huffman coding is provably OPTIMAL among all prefix-free codes for a GIVEN, known, fixed symbol-frequency distribution — but it's a static (non-adaptive) code; for data whose frequency distribution shifts over time or isn't known in advance, adaptive variants (like adaptive Huffman coding or arithmetic coding) can do better." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Building the tree always requires exactly n − 1 merge operations (reducing n initial symbol-nodes down to a single root), each involving two O(log n) heap extractions and one O(log n) heap insertion — there's no shortcut even for the most favourable frequency distribution." },
          { tag: "ul", items: [
            "Initial min-heap construction from n symbol frequencies: O(n)",
            "n − 1 merge operations, each requiring 2 extract-min (O(log n) each) and 1 insert (O(log n)): O(n log n) total",
            "Combined: O(n) + O(n log n) = O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "Every merge operation performs the same fixed sequence of heap operations regardless of the specific frequency VALUES involved — the structural cost is determined entirely by the number of symbols n, not by how frequencies are distributed among them." },
          { tag: "ul", items: [
            "n − 1 merges × O(log n) per merge (dominated by the heap operations) = O(n log n)",
            "No input distribution changes this fixed per-merge cost"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "No frequency distribution increases the cost beyond the fixed n − 1 heap-based merges — this is simultaneously the best, average, and worst case, since the tree-building process always performs exactly the same number of structurally identical merge steps regardless of symbol frequencies." },
          { tag: "ul", items: ["Worst case identical to best/average: O(n log n)"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The min-heap initially holds n symbol-frequency pairs, and the final tree contains n leaf nodes (one per symbol) plus n − 1 internal merge nodes — both bounded by O(n)." },
          { tag: "ul", items: ["Min-heap: O(n)", "Final Huffman tree: 2n − 1 total nodes (n leaves + n−1 internal) — O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the number of distinct symbols n alone, regardless of how their frequencies are distributed or how 'balanced' the resulting tree ends up being." },
          { tag: "ul", items: ["Same O(n) bound regardless of frequency distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No frequency distribution increases space beyond the fixed 2n − 1 total tree nodes — this holds even for the most skewed possible frequency distribution (e.g. Fibonacci-like frequencies, which produce a maximally unbalanced, linked-list-shaped tree, but still with exactly 2n − 1 total nodes)." },
          { tag: "ul", items: ["O(n) total, identical across all cases — tree SHAPE (balanced vs. skewed) varies with frequency distribution, but total node COUNT never does"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function buildHuffmanTree(symbols, frequencies):
    minHeap ← empty min-heap, ordered by frequency

    for i from 0 to length(symbols) − 1:
        push(minHeap, leafNode(symbols[i], frequencies[i]))

    while size(minHeap) > 1:
        left  ← pop(minHeap)              // smallest frequency
        right ← pop(minHeap)              // second smallest frequency

        merged ← new internalNode(
            frequency: left.frequency + right.frequency,
            left: left,
            right: right
        )
        push(minHeap, merged)

    return pop(minHeap)                   // the single remaining node is the tree's root

function assignCodes(node, currentCode, codeTable):
    if node is a leaf:
        codeTable[node.symbol] ← currentCode
        return
    assignCodes(node.left, currentCode + "0", codeTable)
    assignCodes(node.right, currentCode + "1", codeTable)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Create one leaf node per symbol, weighted by its frequency, and insert all of them into a min-heap ordered by frequency.",
          "Repeatedly extract the two nodes with the SMALLEST frequencies and merge them into a new internal node, whose frequency is the sum of the two children's frequencies — then push this merged node back into the heap.",
          "Continue merging until only one node remains in the heap — this is the root of the complete Huffman tree.",
          "To derive each symbol's actual binary code, traverse the tree from the root to each leaf, appending '0' for every left edge and '1' for every right edge taken along the way — the accumulated bit string at each leaf is that symbol's final Huffman code."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The greedy choice property — always merging the two CURRENTLY smallest-frequency nodes — can be proven optimal via an exchange argument: in ANY optimal Huffman tree, the two lowest-frequency symbols must be siblings at the maximum tree depth (if they weren't, swapping them with whichever symbols ARE at maximum depth could only decrease or maintain the total weighted path length, since lower-frequency symbols belong as deep as possible to minimise their contribution to the total). Since the two globally smallest frequencies are guaranteed to be siblings in SOME optimal tree, merging them first and treating the merged node as a single new 'symbol' with the combined frequency correctly reduces the problem to a smaller instance of itself (n−1 symbols), and by induction on n, repeating this process always converges to a globally optimal tree." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <queue>

using namespace std;

// Calculates the minimum cost to build the Huffman Tree 
int huffmanCost(const vector<int>& frequencies) {
    // Because it's a local variable, the visualizer initializes it perfectly!
    priority_queue<int> minHeap;
    
    // Push negative frequencies to simulate a Min-Heap natively
    for (int freq : frequencies) {
        minHeap.push(-freq);
    }
    
    int totalCost = 0;
    
    while (minHeap.size() > 1) {
        // Extract the two smallest frequencies
        int first = -minHeap.top(); minHeap.pop();
        int second = -minHeap.top(); minHeap.pop();
        
        int combined = first + second;
        totalCost += combined;
        
        // Push the merged node back in
        minHeap.push(-combined);
    }
    
    return totalCost;
}

int main() {
    vector<int> frequencies = {5, 9, 12, 13, 16, 45};
    cout << "Total cost of Huffman Tree: " << huffmanCost(frequencies) << endl;
    return 0;
}`,
        "python": `import heapq

def huffman_cost(frequencies):
    min_heap = frequencies[:]
    heapq.heapify(min_heap)
    
    total_cost = 0
    while len(min_heap) > 1:
        first = heapq.heappop(min_heap)
        second = heapq.heappop(min_heap)
        combined = first + second
        total_cost += combined
        heapq.heappush(min_heap, combined)
        
    return total_cost

if __name__ == "__main__":
    frequencies = [5, 9, 12, 13, 16, 45]
    print(f"Total cost of Huffman Tree: {huffman_cost(frequencies)}")`,
        "java": `import java.util.PriorityQueue;

public class Main {
    public static int huffmanCost(int[] frequencies) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        for (int freq : frequencies) {
            minHeap.add(freq);
        }
        
        int totalCost = 0;
        while (minHeap.size() > 1) {
            int first = minHeap.poll();
            int second = minHeap.poll();
            int combined = first + second;
            totalCost += combined;
            minHeap.add(combined);
        }
        
        return totalCost;
    }

    public static void main(String[] args) {
        int[] frequencies = {5, 9, 12, 13, 16, 45};
        System.out.println("Total cost of Huffman Tree: " + huffmanCost(frequencies));
    }
}`,
        "js": `function huffmanCost(frequencies) {
    let minHeap = [...frequencies];
    let totalCost = 0;
    
    // Simulated Priority Queue using sort
    while (minHeap.length > 1) {
        minHeap.sort((a, b) => a - b);
        let first = minHeap.shift();
        let second = minHeap.shift();
        
        let combined = first + second;
        totalCost += combined;
        minHeap.push(combined);
    }
    
    return totalCost;
}

const frequencies = [5, 9, 12, 13, 16, 45];
console.log("Total cost of Huffman Tree:", huffmanCost(frequencies));`,
        "c": `#include <stdio.h>

int huffmanCost(int* frequencies, int size) {
    int totalCost = 0;
    int arr[100];
    for(int i=0; i<size; i++) arr[i] = frequencies[i];
    
    while (size > 1) {
        int min1 = -1, min2 = -1;
        for (int i = 0; i < size; i++) {
            if (min1 == -1 || arr[i] < arr[min1]) {
                min2 = min1;
                min1 = i;
            } else if (min2 == -1 || arr[i] < arr[min2]) {
                min2 = i;
            }
        }
        
        int combined = arr[min1] + arr[min2];
        totalCost += combined;
        
        arr[min1] = combined;
        arr[min2] = arr[size - 1];
        size--;
    }
    
    return totalCost;
}

int main() {
    int frequencies[] = {5, 9, 12, 13, 16, 45};
    printf("Total cost of Huffman Tree: %d\\n", huffmanCost(frequencies, 6));
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static int HuffmanCost(int[] frequencies) {
        var minHeap = new PriorityQueue<int, int>();
        foreach (var freq in frequencies) {
            minHeap.Enqueue(freq, freq);
        }
        
        int totalCost = 0;
        while (minHeap.Count > 1) {
            int first = minHeap.Dequeue();
            int second = minHeap.Dequeue();
            int combined = first + second;
            totalCost += combined;
            minHeap.Enqueue(combined, combined);
        }
        
        return totalCost;
    }

    static void Main() {
        int[] frequencies = {5, 9, 12, 13, 16, 45};
        Console.WriteLine($"Total cost of Huffman Tree: {HuffmanCost(frequencies)}");
    }
}`,
        "swift": `func huffmanCost(_ frequencies: [Int]) -> Int {
    var minHeap = frequencies
    var totalCost = 0
    
    while minHeap.count > 1 {
        minHeap.sort(by: <)
        let first = minHeap.removeFirst()
        let second = minHeap.removeFirst()
        let combined = first + second
        totalCost += combined
        minHeap.append(combined)
    }
    
    return totalCost
}

let frequencies = [5, 9, 12, 13, 16, 45]
print("Total cost of Huffman Tree: \\(huffmanCost(frequencies))")`,
        "kotlin": `import java.util.PriorityQueue

fun huffmanCost(frequencies: IntArray): Int {
    val minHeap = PriorityQueue<Int>()
    for (freq in frequencies) {
        minHeap.add(freq)
    }
    
    var totalCost = 0
    while (minHeap.size > 1) {
        val first = minHeap.poll()
        val second = minHeap.poll()
        val combined = first + second
        totalCost += combined
        minHeap.add(combined)
    }
    
    return totalCost
}

fun main() {
    val frequencies = intArrayOf(5, 9, 12, 13, 16, 45)
    println("Total cost of Huffman Tree: \${huffmanCost(frequencies)}")
}`,
        "scala": `import scala.collection.mutable

object Main extends App {
    def huffmanCost(frequencies: Array[Int]): Int = {
        val minHeap = mutable.PriorityQueue.empty[Int](Ordering[Int].reverse)
        frequencies.foreach(minHeap.enqueue(_))
        
        var totalCost = 0
        while (minHeap.size > 1) {
            val first = minHeap.dequeue()
            val second = minHeap.dequeue()
            val combined = first + second
            totalCost += combined
            minHeap.enqueue(combined)
        }
        
        totalCost
    }

    val frequencies = Array(5, 9, 12, 13, 16, 45)
    println(s"Total cost of Huffman Tree: \${huffmanCost(frequencies)}")
}`,
        "go": `package main

import (
    "container/heap"
    "fmt"
)

type IntHeap []int
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() any {
    old := *h
    n := len(old)
    x := old[n-1]
    *h = old[0 : n-1]
    return x
}

func huffmanCost(frequencies []int) int {
    h := &IntHeap{}
    heap.Init(h)
    for _, freq := range frequencies {
        heap.Push(h, freq)
    }

    totalCost := 0
    for h.Len() > 1 {
        first := heap.Pop(h).(int)
        second := heap.Pop(h).(int)
        combined := first + second
        totalCost += combined
        heap.Push(h, combined)
    }
    return totalCost
}

func main() {
    frequencies := []int{5, 9, 12, 13, 16, 45}
    fmt.Printf("Total cost of Huffman Tree: %d\\n", huffmanCost(frequencies))
}`,
        "rust": `use std::collections::BinaryHeap;
use std::cmp::Reverse;

fn huffman_cost(frequencies: Vec<i32>) -> i32 {
    let mut min_heap = BinaryHeap::new();
    for freq in frequencies {
        min_heap.push(Reverse(freq));
    }

    let mut total_cost = 0;
    while min_heap.len() > 1 {
        if let (Some(Reverse(first)), Some(Reverse(second))) = (min_heap.pop(), min_heap.pop()) {
            let combined = first + second;
            total_cost += combined;
            min_heap.push(Reverse(combined));
        }
    }
    total_cost
}

fn main() {
    let frequencies = vec![5, 9, 12, 13, 16, 45];
    println!("Total cost of Huffman Tree: {}", huffman_cost(frequencies));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. MINIMUM SPANNING TREE (GREEDY PRINCIPLE)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Minimum Spanning Tree",
      href: "/algorithms/greedy/mst",
      type: "Hard",

      about: [
        { tag: "h1", text: "Minimum Spanning Tree — The Greedy Principle" },
        { tag: "p", text: "A Minimum Spanning Tree connects all vertices of a weighted graph using the minimum possible total edge weight, with no cycles. Two classic algorithms solve this — Kruskal's (edge-centric, detailed fully in the Graphs section) and Prim's (vertex-centric, also detailed fully in the Graphs section) — and both are GREEDY: at every step, each makes the locally cheapest available choice and never reconsiders it, yet both are PROVABLY guaranteed to produce a globally optimal (minimum total weight) tree." },
        { tag: "p", text: "What justifies this greedy correctness is the CUT PROPERTY: for any partition of a graph's vertices into two non-empty groups, the minimum-weight edge crossing that partition is guaranteed to be part of SOME minimum spanning tree. Both Kruskal's (processing edges in ascending weight order, never creating a cycle) and Prim's (always extending the growing tree via the cheapest crossing edge) are, underneath their different mechanics, both repeatedly applying exactly this same Cut Property at every step — which is the deep reason two superficially different algorithms both correctly solve the same problem." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Network design problems: minimum cost to connect all locations with cabling, pipelines, or road networks — see Kruskal's Algorithm and Prim's Algorithm in the Graphs section for full implementation details",
          "As the canonical illustration of the Cut Property, the proof technique that justifies BOTH classic MST algorithms — understanding this proof is the real conceptual payoff of studying MST, beyond just memorising the two algorithms",
          "Clustering applications: stopping Kruskal's algorithm early (before fully connecting the graph) naturally produces a hierarchical clustering, since the partially built forest groups nearby points together first",
          "A useful comparison point for understanding WHY greedy works here but not for superficially similar-looking problems (like the Travelling Salesperson Problem, where no equivalent greedy-safe property exists, and the Dynamic Programming section's Held-Karp algorithm — or approximation algorithms — are needed instead)"
        ]},
        { tag: "note", variant: "tip", text: "For the full step-by-step pseudocode and complexity breakdown of the two concrete MST algorithms, see Kruskal's Algorithm and Prim's Algorithm in the Graphs section — this entry focuses specifically on the shared greedy PRINCIPLE (the Cut Property) that proves both of them correct." }
      ],

      timeComplexityCalculation: {
        notation: "O(E log V)",
        best: [
          { tag: "h2", text: "Best Case — O(E log V)" },
          { tag: "p", text: "Both standard MST algorithms always process the full edge set at least once (Kruskal's via sorting, Prim's via priority-queue-driven exploration) regardless of how favourably the graph's weights happen to be arranged — there's no shortcut even for the most structurally simple graph." },
          { tag: "ul", items: [
            "Kruskal's: dominated by sorting all E edges: O(E log E), which simplifies to O(E log V) since E ≤ V², making log E and log V differ by at most a constant factor",
            "Prim's (binary-heap implementation): O((V + E) log V), matching the standard heap-based bound established in the Graphs section"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(E log V)" },
          { tag: "p", text: "Both algorithms perform the same fixed structural operations (sorting plus union-find for Kruskal's; heap extraction and decrease-key for Prim's) regardless of the SPECIFIC edge weight values, only their relative ordering affects which edges get chosen, not the total operation count." },
          { tag: "ul", items: ["Both algorithms: O(E log V) (or equivalently O(E log E)), as detailed individually in the Graphs section's Kruskal's Algorithm and Prim's Algorithm entries"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(E log V)" },
          { tag: "p", text: "No edge weight configuration increases the cost beyond the standard sorting-or-heap-based bound for either algorithm — this is the conventionally cited bound for general-purpose MST construction, with the specific better choice between Kruskal's and Prim's depending on graph density (sparse favours Kruskal's, dense favours Prim's with a Fibonacci heap)." },
          { tag: "ul", items: ["O(E log V) is the standard combined classification for both algorithms; see the Graphs section for the precise, algorithm-specific worst-case analysis of each"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V + E)" },
          { tag: "p", text: "Both algorithms need to represent the full graph (O(V + E) for an adjacency-list representation) plus algorithm-specific auxiliary structures (Union-Find for Kruskal's, a priority queue and key array for Prim's), as detailed in the Graphs section." },
          { tag: "ul", items: ["Graph representation: O(V + E)", "Auxiliary structures (Union-Find or priority queue + key array): O(V), as detailed per-algorithm in the Graphs section"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V + E)" },
          { tag: "p", text: "Space usage is fixed by graph size alone for both algorithms, since neither's auxiliary structures scale with edge weight values or the specific MST that ends up being constructed." },
          { tag: "ul", items: ["Same O(V + E) bound for both algorithms, regardless of edge weight distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "No graph configuration increases space beyond the standard graph representation plus fixed-size auxiliary structures — see the Graphs section's Kruskal's Algorithm and Prim's Algorithm entries for the precise per-algorithm breakdown." },
          { tag: "ul", items: ["O(V + E) total, identical across all cases for both standard MST algorithms"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "This entry focuses on the shared CUT PROPERTY proof rather than re-deriving either algorithm's full pseudocode (see Kruskal's Algorithm / Prim's Algorithm in the Graphs section for those):" },
        { tag: "code", language: "text", text:
`// The Cut Property (the shared justification for BOTH greedy MST algorithms):
//
// For ANY partition of the graph's vertices into two non-empty sets S and V−S,
// let e be the MINIMUM-weight edge with exactly one endpoint in S and one in V−S.
// Then: e is guaranteed to be part of SOME minimum spanning tree of the graph.

function cutPropertyProof_sketch(graph, S):
    e ← minimum-weight edge crossing the cut (S, V − S)

    // Proof by contradiction (exchange argument):
    assume T is a known MST that does NOT contain e
    // T must still connect S to V − S somehow — let f be the edge T uses to cross the cut
    f ← the edge T uses to cross between S and V − S

    // Since e is the MINIMUM-weight crossing edge by definition: weight(e) <= weight(f)
    T' ← (T − f) + e               // swap f out, e in

    // T' is still a valid spanning tree (still connects everything, still acyclic — argued via cycle structure)
    // and weight(T') <= weight(T), so T' is ALSO a minimum spanning tree
    // This proves e can always safely be included — contradiction resolved` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Pick ANY way of splitting the graph's vertices into two non-empty groups — this is called a 'cut'.",
          "Identify the single cheapest edge that crosses this cut (connects a vertex in one group to a vertex in the other).",
          "Claim: this cheapest crossing edge is always safe to include in a minimum spanning tree — including it never prevents reaching the true global optimum.",
          "Kruskal's algorithm implicitly applies this property repeatedly: by processing edges in ascending weight order and only adding an edge when it connects two currently-separate components, it's always choosing the cheapest edge crossing the cut between 'already-connected components' and 'everything else'.",
          "Prim's algorithm applies the exact same property from a different angle: by always extending the growing tree with the cheapest edge connecting it to an unvisited vertex, it's choosing the cheapest edge crossing the cut between 'vertices already in the tree' and 'vertices not yet in the tree'."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The Cut Property is proven via a standard exchange argument: suppose, for contradiction, that some minimum spanning tree T does NOT contain the minimum-weight crossing edge e. Since T is a spanning tree, it must still connect the two sides of the cut somehow — via some other edge f that also crosses the cut. Because e was defined as the MINIMUM-weight crossing edge, weight(e) ≤ weight(f). Constructing T' by removing f and adding e instead produces another valid spanning tree (removing f splits T into exactly two pieces corresponding to the cut, and adding e — which also crosses that same cut — reconnects them) with total weight no greater than T's original weight. This means T' is ALSO a minimum spanning tree, and it DOES contain e — proving that SOME minimum spanning tree always contains the cheapest crossing edge for ANY cut, which is exactly the property both Kruskal's and Prim's exploit at every single step of their respective greedy constructions." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Find with path compression
int findParent(vector<int>& arrParent, int i) {
    if (arrParent[i] == i)
        return i;
    arrParent[i] = findParent(arrParent, arrParent[i]);
    return arrParent[i];
}

// Union by arrRank
void unionNodes(vector<int>& arrParent, vector<int>& arrRank, int u, int v) {
    int rootU = findParent(arrParent, u);
    int rootV = findParent(arrParent, v);

    if (arrRank[rootU] < arrRank[rootV]) {
        arrParent[rootU] = rootV;
    } else if (arrRank[rootU] > arrRank[rootV]) {
        arrParent[rootV] = rootU;
    } else {
        arrParent[rootV] = rootU;
        arrRank[rootU]++;
    }
}

int kruskalMST(int n, vector<vector<int>> tableEdges) {
    // Edges format: {weight, u, v}
    // The visualizer natively supports lexicographical sorting for nested vectors!
    // So this automatically sorts by weight (the first element).
    sort(tableEdges.begin(), tableEdges.end());

    vector<int> arrParent(n);
    vector<int> arrRank(n, 0);

    for (int i = 0; i < n; i++) {
        arrParent[i] = i;
    }

    int mstWeight = 0;
    int edgesTaken = 0;

    for (int i = 0; i < tableEdges.size(); i++) {
        int w = tableEdges[i][0];
        int u = tableEdges[i][1];
        int v = tableEdges[i][2];

        if (findParent(arrParent, u) != findParent(arrParent, v)) {
            mstWeight += w;
            unionNodes(arrParent, arrRank, u, v);
            edgesTaken++;
            
            // Stop early if we have n-1 tableEdges
            if (edgesTaken == n - 1) break;
        }
    }

    return mstWeight;
}

int main() {
    int n = 4; // 4 vertices: 0, 1, 2, 3
    
    // format: {weight, u, v}
    vector<vector<int>> tableEdges = {
        {1, 0, 1},
        {2, 1, 2},
        {3, 0, 2},
        {4, 2, 3},
        {5, 1, 3}
    };

    cout << "Weight of Minimum Spanning Tree is: " << kruskalMST(n, tableEdges) << endl;
    return 0;
}`,
        "python": `def find_parent(parent, i):
    if parent[i] == i:
        return i
    parent[i] = find_parent(parent, parent[i])
    return parent[i]

def union_nodes(parent, rank, u, v):
    root_u = find_parent(parent, u)
    root_v = find_parent(parent, v)
    
    if rank[root_u] < rank[root_v]:
        parent[root_u] = root_v
    elif rank[root_u] > rank[root_v]:
        parent[root_v] = root_u
    else:
        parent[root_v] = root_u
        rank[root_u] += 1

def kruskal_mst(n, edges):
    edges.sort(key=lambda x: x[0])
    parent = [i for i in range(n)]
    rank = [0] * n
    
    mst_weight = 0
    edges_taken = 0
    
    for w, u, v in edges:
        if find_parent(parent, u) != find_parent(parent, v):
            mst_weight += w
            union_nodes(parent, rank, u, v)
            edges_taken += 1
            if edges_taken == n - 1:
                break
                
    return mst_weight

if __name__ == "__main__":
    n = 4
    edges = [
        [1, 0, 1],
        [2, 1, 2],
        [3, 0, 2],
        [4, 2, 3],
        [5, 1, 3]
    ]
    print(f"Weight of Minimum Spanning Tree is: {kruskal_mst(n, edges)}")`,
        "java": `import java.util.Arrays;
import java.util.Comparator;

public class Main {
    static int findParent(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = findParent(parent, parent[i]);
    }

    static void unionNodes(int[] parent, int[] rank, int u, int v) {
        int rootU = findParent(parent, u);
        int rootV = findParent(parent, v);

        if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
        } else if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
        }
    }

    public static int kruskalMST(int n, int[][] edges) {
        Arrays.sort(edges, Comparator.comparingInt(a -> a[0]));
        
        int[] parent = new int[n];
        int[] rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        int mstWeight = 0;
        int edgesTaken = 0;

        for (int[] edge : edges) {
            int w = edge[0], u = edge[1], v = edge[2];
            if (findParent(parent, u) != findParent(parent, v)) {
                mstWeight += w;
                unionNodes(parent, rank, u, v);
                edgesTaken++;
                if (edgesTaken == n - 1) break;
            }
        }
        return mstWeight;
    }

    public static void main(String[] args) {
        int n = 4;
        int[][] edges = {
            {1, 0, 1}, {2, 1, 2}, {3, 0, 2}, {4, 2, 3}, {5, 1, 3}
        };
        System.out.println("Weight of Minimum Spanning Tree is: " + kruskalMST(n, edges));
    }
}`,
        "js": `function findParent(parent, i) {
    if (parent[i] === i) return i;
    return parent[i] = findParent(parent, parent[i]);
}

function unionNodes(parent, rank, u, v) {
    let rootU = findParent(parent, u);
    let rootV = findParent(parent, v);

    if (rank[rootU] < rank[rootV]) {
        parent[rootU] = rootV;
    } else if (rank[rootU] > rank[rootV]) {
        parent[rootV] = rootU;
    } else {
        parent[rootV] = rootU;
        rank[rootU]++;
    }
}

function kruskalMST(n, edges) {
    edges.sort((a, b) => a[0] - b[0]);
    
    const parent = Array.from({length: n}, (_, i) => i);
    const rank = new Array(n).fill(0);
    
    let mstWeight = 0;
    let edgesTaken = 0;

    for (const [w, u, v] of edges) {
        if (findParent(parent, u) !== findParent(parent, v)) {
            mstWeight += w;
            unionNodes(parent, rank, u, v);
            edgesTaken++;
            if (edgesTaken === n - 1) break;
        }
    }
    return mstWeight;
}

const n = 4;
const edges = [[1, 0, 1], [2, 1, 2], [3, 0, 2], [4, 2, 3], [5, 1, 3]];
console.log("Weight of Minimum Spanning Tree is:", kruskalMST(n, edges));`,
        "c": `#include <stdio.h>
#include <stdlib.h>

int findParent(int* parent, int i) {
    if (parent[i] == i) return i;
    return parent[i] = findParent(parent, parent[i]);
}

void unionNodes(int* parent, int* rank, int u, int v) {
    int rootU = findParent(parent, u);
    int rootV = findParent(parent, v);

    if (rank[rootU] < rank[rootV]) {
        parent[rootU] = rootV;
    } else if (rank[rootU] > rank[rootV]) {
        parent[rootV] = rootU;
    } else {
        parent[rootV] = rootU;
        rank[rootU]++;
    }
}

int cmp(const void* a, const void* b) {
    int* edgeA = *(int**)a;
    int* edgeB = *(int**)b;
    return edgeA[0] - edgeB[0];
}

int kruskalMST(int n, int** edges, int numEdges) {
    qsort(edges, numEdges, sizeof(int*), cmp);
    
    int parent[100];
    int rank[100] = {0};
    for (int i = 0; i < n; i++) parent[i] = i;

    int mstWeight = 0;
    int edgesTaken = 0;

    for (int i = 0; i < numEdges; i++) {
        int w = edges[i][0], u = edges[i][1], v = edges[i][2];
        if (findParent(parent, u) != findParent(parent, v)) {
            mstWeight += w;
            unionNodes(parent, rank, u, v);
            edgesTaken++;
            if (edgesTaken == n - 1) break;
        }
    }
    return mstWeight;
}

int main() {
    int n = 4;
    int rawEdges[][3] = {{1, 0, 1}, {2, 1, 2}, {3, 0, 2}, {4, 2, 3}, {5, 1, 3}};
    int* edges[5];
    for(int i=0; i<5; i++) edges[i] = rawEdges[i];
    
    printf("Weight of Minimum Spanning Tree is: %d\\n", kruskalMST(n, edges, 5));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int FindParent(int[] parent, int i) {
        if (parent[i] == i) return i;
        return parent[i] = FindParent(parent, parent[i]);
    }

    static void UnionNodes(int[] parent, int[] rank, int u, int v) {
        int rootU = FindParent(parent, u);
        int rootV = FindParent(parent, v);

        if (rank[rootU] < rank[rootV]) {
            parent[rootU] = rootV;
        } else if (rank[rootU] > rank[rootV]) {
            parent[rootV] = rootU;
        } else {
            parent[rootV] = rootU;
            rank[rootU]++;
        }
    }

    static int KruskalMST(int n, int[][] edges) {
        Array.Sort(edges, (a, b) => a[0].CompareTo(b[0]));
        
        int[] parent = new int[n];
        int[] rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;

        int mstWeight = 0;
        int edgesTaken = 0;

        foreach (var edge in edges) {
            int w = edge[0], u = edge[1], v = edge[2];
            if (FindParent(parent, u) != FindParent(parent, v)) {
                mstWeight += w;
                UnionNodes(parent, rank, u, v);
                edgesTaken++;
                if (edgesTaken == n - 1) break;
            }
        }
        return mstWeight;
    }

    static void Main() {
        int n = 4;
        int[][] edges = new int[][] {
            new int[] {1, 0, 1}, new int[] {2, 1, 2}, new int[] {3, 0, 2},
            new int[] {4, 2, 3}, new int[] {5, 1, 3}
        };
        Console.WriteLine($"Weight of Minimum Spanning Tree is: {KruskalMST(n, edges)}");
    }
}`,
        "swift": `func findParent(_ parent: inout [Int], _ i: Int) -> Int {
    if parent[i] == i { return i }
    parent[i] = findParent(&parent, parent[i])
    return parent[i]
}

func unionNodes(_ parent: inout [Int], _ rank: inout [Int], _ u: Int, _ v: Int) {
    let rootU = findParent(&parent, u)
    let rootV = findParent(&parent, v)

    if rank[rootU] < rank[rootV] {
        parent[rootU] = rootV
    } else if rank[rootU] > rank[rootV] {
        parent[rootV] = rootU
    } else {
        parent[rootV] = rootU
        rank[rootU] += 1
    }
}

func kruskalMST(_ n: Int, _ edges: inout [[Int]]) -> Int {
    edges.sort { $0[0] < $1[0] }
    
    var parent = Array(0..<n)
    var rank = Array(repeating: 0, count: n)
    var mstWeight = 0
    var edgesTaken = 0

    for edge in edges {
        let (w, u, v) = (edge[0], edge[1], edge[2])
        if findParent(&parent, u) != findParent(&parent, v) {
            mstWeight += w
            unionNodes(&parent, &rank, u, v)
            edgesTaken += 1
            if edgesTaken == n - 1 { break }
        }
    }
    return mstWeight
}

var edges = [[1, 0, 1], [2, 1, 2], [3, 0, 2], [4, 2, 3], [5, 1, 3]]
print("Weight of Minimum Spanning Tree is: \\(kruskalMST(4, &edges))")`,
        "kotlin": `fun findParent(parent: IntArray, i: Int): Int {
    if (parent[i] == i) return i
    parent[i] = findParent(parent, parent[i])
    return parent[i]
}

fun unionNodes(parent: IntArray, rank: IntArray, u: Int, v: Int) {
    val rootU = findParent(parent, u)
    val rootV = findParent(parent, v)

    if (rank[rootU] < rank[rootV]) {
        parent[rootU] = rootV
    } else if (rank[rootU] > rank[rootV]) {
        parent[rootV] = rootU
    } else {
        parent[rootV] = rootU
        rank[rootU]++
    }
}

fun kruskalMST(n: Int, edges: Array<IntArray>): Int {
    edges.sortBy { it[0] }
    
    val parent = IntArray(n) { it }
    val rank = IntArray(n)
    
    var mstWeight = 0
    var edgesTaken = 0

    for (edge in edges) {
        val (w, u, v) = edge
        if (findParent(parent, u) != findParent(parent, v)) {
            mstWeight += w
            unionNodes(parent, rank, u, v)
            edgesTaken++
            if (edgesTaken == n - 1) break
        }
    }
    return mstWeight
}

fun main() {
    val edges = arrayOf(
        intArrayOf(1, 0, 1), intArrayOf(2, 1, 2), intArrayOf(3, 0, 2),
        intArrayOf(4, 2, 3), intArrayOf(5, 1, 3)
    )
    println("Weight of Minimum Spanning Tree is: \${kruskalMST(4, edges)}")
}`,
        "scala": `object Main extends App {
    def findParent(parent: Array[Int], i: Int): Int = {
        if (parent(i) == i) return i
        parent(i) = findParent(parent, parent(i))
        parent(i)
    }

    def unionNodes(parent: Array[Int], rank: Array[Int], u: Int, v: Int): Unit = {
        val rootU = findParent(parent, u)
        val rootV = findParent(parent, v)

        if (rank(rootU) < rank(rootV)) {
            parent(rootU) = rootV
        } else if (rank(rootU) > rank(rootV)) {
            parent(rootV) = rootU
        } else {
            parent(rootV) = rootU
            rank(rootU) += 1
        }
    }

    def kruskalMST(n: Int, edges: Array[Array[Int]]): Int = {
        val sortedEdges = edges.sortBy(_(0))
        val parent = Array.tabulate(n)(identity)
        val rank = Array.fill(n)(0)
        
        var mstWeight = 0
        var edgesTaken = 0

        for (edge <- sortedEdges) {
            val w = edge(0); val u = edge(1); val v = edge(2)
            if (findParent(parent, u) != findParent(parent, v)) {
                mstWeight += w
                unionNodes(parent, rank, u, v)
                edgesTaken += 1
                if (edgesTaken == n - 1) return mstWeight
            }
        }
        mstWeight
    }

    val edges = Array(Array(1, 0, 1), Array(2, 1, 2), Array(3, 0, 2), Array(4, 2, 3), Array(5, 1, 3))
    println(s"Weight of Minimum Spanning Tree is: \${kruskalMST(4, edges)}")
}`,
        "go": `package main

import (
    "fmt"
    "sort"
)

func findParent(parent []int, i int) int {
    if parent[i] == i {
        return i
    }
    parent[i] = findParent(parent, parent[i])
    return parent[i]
}

func unionNodes(parent, rank []int, u, v int) {
    rootU, rootV := findParent(parent, u), findParent(parent, v)
    if rank[rootU] < rank[rootV] {
        parent[rootU] = rootV
    } else if rank[rootU] > rank[rootV] {
        parent[rootV] = rootU
    } else {
        parent[rootV] = rootU
        rank[rootU]++
    }
}

func kruskalMST(n int, edges [][]int) int {
    sort.Slice(edges, func(i, j int) bool {
        return edges[i][0] < edges[j][0]
    })

    parent := make([]int, n)
    rank := make([]int, n)
    for i := range parent {
        parent[i] = i
    }

    mstWeight, edgesTaken := 0, 0
    for _, edge := range edges {
        w, u, v := edge[0], edge[1], edge[2]
        if findParent(parent, u) != findParent(parent, v) {
            mstWeight += w
            unionNodes(parent, rank, u, v)
            edgesTaken++
            if edgesTaken == n-1 {
                break
            }
        }
    }
    return mstWeight
}

func main() {
    edges := [][]int{{1, 0, 1}, {2, 1, 2}, {3, 0, 2}, {4, 2, 3}, {5, 1, 3}}
    fmt.Printf("Weight of Minimum Spanning Tree is: %d\\n", kruskalMST(4, edges))
}`,
        "rust": `fn find_parent(parent: &mut Vec<usize>, i: usize) -> usize {
    if parent[i] == i {
        return i;
    }
    let p = parent[i];
    parent[i] = find_parent(parent, p);
    parent[i]
}

fn union_nodes(parent: &mut Vec<usize>, rank: &mut Vec<i32>, u: usize, v: usize) {
    let root_u = find_parent(parent, u);
    let root_v = find_parent(parent, v);
    
    if rank[root_u] < rank[root_v] {
        parent[root_u] = root_v;
    } else if rank[root_u] > rank[root_v] {
        parent[root_v] = root_u;
    } else {
        parent[root_v] = root_u;
        rank[root_u] += 1;
    }
}

fn kruskal_mst(n: usize, mut edges: Vec<Vec<i32>>) -> i32 {
    edges.sort_by_key(|e| e[0]);
    
    let mut parent: Vec<usize> = (0..n).collect();
    let mut rank = vec![0; n];
    let mut mst_weight = 0;
    let mut edges_taken = 0;

    for edge in edges {
        let w = edge[0];
        let u = edge[1] as usize;
        let v = edge[2] as usize;
        
        if find_parent(&mut parent, u) != find_parent(&mut parent, v) {
            mst_weight += w;
            union_nodes(&mut parent, &mut rank, u, v);
            edges_taken += 1;
            if edges_taken == n - 1 { break; }
        }
    }
    mst_weight
}

fn main() {
    let edges = vec![
        vec![1, 0, 1], vec![2, 1, 2], vec![3, 0, 2], vec![4, 2, 3], vec![5, 1, 3]
    ];
    println!("Weight of Minimum Spanning Tree is: {}", kruskal_mst(4, edges));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. ACTIVITY SELECTION
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Activity Selection",
      href: "/algorithms/greedy/activity-selection",
      type: "Easy",

      about: [
        { tag: "h1", text: "Activity Selection" },
        { tag: "p", text: "Given a set of activities, each with a start and end time, Activity Selection finds the MAXIMUM number of non-overlapping activities that can be scheduled using a single resource (e.g. one meeting room, one machine). The greedy strategy: sort activities by their FINISH time (not start time, and not duration — finish time specifically), then repeatedly select the next activity whose start time is ≥ the previously selected activity's finish time." },
        { tag: "p", text: "Why finish time, specifically, is the correct sorting key: selecting the activity that finishes EARLIEST among all remaining compatible options always leaves the maximum possible remaining time available for scheduling further activities — it's the single choice that 'wastes' the least amount of the resource's available time going forward, which is exactly the greedy choice property this problem needs." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Single-resource scheduling: meeting room booking, single-machine task scheduling, maximising the number of non-conflicting events that fit a single timeline",
          "Interval scheduling problems in general — this is the canonical, simplest member of a broader family that includes weighted interval scheduling (which requires Dynamic Programming instead, since weights break the greedy choice property) and multi-resource scheduling",
          "As the clearest possible illustration of the EXCHANGE ARGUMENT proof technique that justifies greedy correctness: 'earliest finish time first' can be proven optimal by showing any optimal solution can be modified to match the greedy choice without losing any activities",
          "A foundational building block before tackling Fractional Knapsack (below), which uses a structurally similar 'sort by a ratio, then greedily take' approach"
        ]},
        { tag: "note", variant: "warning", text: "A common mistake is sorting by activity DURATION (shortest first) instead of finish time — this is a different greedy rule that does NOT have the same optimality guarantee and can produce a suboptimal (fewer than maximum) selection on many inputs. Finish time, specifically, is the proven-correct sort key." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Sorting the activities by finish time always dominates the cost and is required regardless of input arrangement — there's no shortcut even if the activities happen to already be in a favourable order, since a comparison-based sort is always at least Θ(n log n)." },
          { tag: "ul", items: [
            "Sorting n activities by finish time: O(n log n)",
            "The single greedy selection pass afterward: O(n), since each activity is examined exactly once",
            "Total dominated by sorting: O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "Both the sorting step and the selection pass perform the same structural work regardless of the specific start/finish time values — comparison-based sorting is Θ(n log n) for any input, and the selection pass is always a single O(n) scan." },
          { tag: "ul", items: ["O(n log n) for sorting (dominates) + O(n) for selection = O(n log n)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "No arrangement of start/finish times increases the cost beyond the sorting step's bound — this is simultaneously the best, average, and worst case." },
          { tag: "ul", items: ["Worst case identical to best/average: O(n log n)", "If the activities are GIVEN already pre-sorted by finish time, the sort can be skipped entirely, reducing the bound to O(n) — but this is a precondition on the input, not something the general algorithm can assume"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Beyond the space needed for sorting (which can often be done in-place, or O(log n) for typical sort implementations' recursion stack), only a single variable tracking the most recently selected activity's finish time is needed." },
          { tag: "ul", items: ["lastFinishTime — O(1) auxiliary tracking, beyond whatever the sorting step itself requires"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "The selection pass itself uses no auxiliary space proportional to n — it's a single forward scan with one tracked variable, regardless of how many activities are ultimately selected." },
          { tag: "ul", items: ["O(1) for the selection logic itself; total space is dominated by whatever the sorting algorithm requires (commonly O(log n) for an in-place comparison sort's recursion stack, or O(n) for a non-in-place sort)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input configuration increases the selection pass's auxiliary space beyond the single tracked finish-time variable — this holds regardless of how many activities end up being selected." },
          { tag: "ul", items: ["O(1) for the core selection algorithm, identical across all cases (excluding whatever overhead the chosen sorting algorithm itself contributes)"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function activitySelection(activities):           // each activity: (start, finish)
    sortedActivities ← sort activities by finish time, ascending
    selected ← [sortedActivities[0]]
    lastFinish ← sortedActivities[0].finish

    for i from 1 to length(sortedActivities) − 1:
        if sortedActivities[i].start >= lastFinish:
            selected.append(sortedActivities[i])
            lastFinish ← sortedActivities[i].finish

    return selected` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Sort all activities by their finish time, ascending — this ordering is what makes the greedy choice at each step immediately obvious and provably correct.",
          "Always select the very first activity in this sorted order — it has the earliest finish time among ALL activities, so selecting it can never be a mistake (there's no other activity that finishes earlier and could conflict with this choice).",
          "For each subsequent activity in finish-time order, check if its start time is at or after the most recently selected activity's finish time — if so, it doesn't conflict, so select it too and update the tracked finish time.",
          "If an activity's start time conflicts with the last selected activity's finish time, skip it — including it would require giving up the previously selected activity, and the greedy proof guarantees this is never beneficial.",
          "After processing every activity in order, the selected list contains the maximum possible number of non-overlapping activities."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Exchange argument proof: let A be the greedy solution (always picking the earliest available finish time) and let O be ANY optimal solution. Sort both by finish time. The greedy algorithm's FIRST selected activity has a finish time ≤ the finish time of O's first selected activity (since greedy always picks the earliest finish time available among ALL activities, while O's first pick is merely SOME compatible activity). Replacing O's first activity with greedy's first activity therefore cannot reduce O's total count (since the new finish time is earlier or equal, leaving at least as much room for subsequent activities) — so O can always be modified to match greedy's first choice without losing optimality. Applying this argument repeatedly (by induction) to the remaining activities after each selection shows greedy's choice at EVERY step can always be substituted into an optimal solution without reducing its size — proving the greedy algorithm's total count is provably equal to, never less than, the true optimum." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int activitySelection(vector<vector<int>> tableActivities) {
    // tableActivities[i] = {end_time, start_time}
    // We store end_time FIRST so that native sort automatically sorts by end_time!
    sort(tableActivities.begin(), tableActivities.end());

    int count = 0;
    int lastEndTime = -1;

    for (int i = 0; i < tableActivities.size(); i++) {
        int end = tableActivities[i][0];
        int start = tableActivities[i][1];

        // If the start time is strictly after or equal to the last end time
        if (start >= lastEndTime) {
            count++;
            lastEndTime = end;
        }
    }

    return count;
}

int main() {
    // {end_time, start_time}
    vector<vector<int>> tableActivities = {
        {2, 1}, {4, 3}, {6, 0}, {7, 5}, {9, 8}, {9, 5}
    };

    cout << "Maximum tableActivities performed: " << activitySelection(tableActivities) << endl;
    return 0;
}`,
        "python": `def activity_selection(activities):
    # activities[i] = [end_time, start_time]
    activities.sort(key=lambda x: x[0])
    count = 0
    last_end_time = -1

    for end, start in activities:
        if start >= last_end_time:
            count += 1
            last_end_time = end

    return count

if __name__ == "__main__":
    activities = [[2, 1], [4, 3], [6, 0], [7, 5], [9, 8], [9, 5]]
    print(f"Maximum activities performed: {activity_selection(activities)}")`,
        "java": `import java.util.Arrays;
import java.util.Comparator;

public class Main {
    public static int activitySelection(int[][] activities) {
        // activities[i] = {end_time, start_time}
        Arrays.sort(activities, Comparator.comparingInt(a -> a[0]));
        int count = 0;
        int lastEndTime = -1;

        for (int[] activity : activities) {
            int end = activity[0], start = activity[1];
            if (start >= lastEndTime) {
                count++;
                lastEndTime = end;
            }
        }
        return count;
    }

    public static void main(String[] args) {
        int[][] activities = {{2, 1}, {4, 3}, {6, 0}, {7, 5}, {9, 8}, {9, 5}};
        System.out.println("Maximum activities performed: " + activitySelection(activities));
    }
}`,
        "js": `function activitySelection(activities) {
    // activities[i] = [end_time, start_time]
    activities.sort((a, b) => a[0] - b[0]);
    let count = 0;
    let lastEndTime = -1;

    for (const [end, start] of activities) {
        if (start >= lastEndTime) {
            count++;
            lastEndTime = end;
        }
    }
    return count;
}

const activities = [[2, 1], [4, 3], [6, 0], [7, 5], [9, 8], [9, 5]];
console.log("Maximum activities performed:", activitySelection(activities));`,
        "c": `#include <stdio.h>
#include <stdlib.h>

int cmp(const void* a, const void* b) {
    int* actA = *(int**)a;
    int* actB = *(int**)b;
    return actA[0] - actB[0];
}

int activitySelection(int** activities, int numActivities) {
    qsort(activities, numActivities, sizeof(int*), cmp);
    int count = 0, lastEndTime = -1;

    for (int i = 0; i < numActivities; i++) {
        int end = activities[i][0], start = activities[i][1];
        if (start >= lastEndTime) {
            count++;
            lastEndTime = end;
        }
    }
    return count;
}

int main() {
    int raw[][2] = {{2, 1}, {4, 3}, {6, 0}, {7, 5}, {9, 8}, {9, 5}};
    int* activities[6];
    for(int i=0; i<6; i++) activities[i] = raw[i];
    printf("Maximum activities performed: %d\\n", activitySelection(activities, 6));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int ActivitySelection(int[][] activities) {
        Array.Sort(activities, (a, b) => a[0].CompareTo(b[0]));
        int count = 0;
        int lastEndTime = -1;

        foreach (var act in activities) {
            if (act[1] >= lastEndTime) {
                count++;
                lastEndTime = act[0];
            }
        }
        return count;
    }

    static void Main() {
        int[][] activities = new int[][] {
            new int[] {2, 1}, new int[] {4, 3}, new int[] {6, 0},
            new int[] {7, 5}, new int[] {9, 8}, new int[] {9, 5}
        };
        Console.WriteLine($"Maximum activities performed: {ActivitySelection(activities)}");
    }
}`,
        "swift": `func activitySelection(_ activities: inout [[Int]]) -> Int {
    activities.sort { $0[0] < $1[0] }
    var count = 0
    var lastEndTime = -1

    for act in activities {
        if act[1] >= lastEndTime {
            count += 1
            lastEndTime = act[0]
        }
    }
    return count
}

var activities = [[2, 1], [4, 3], [6, 0], [7, 5], [9, 8], [9, 5]]
print("Maximum activities performed: \\(activitySelection(&activities))")`,
        "kotlin": `fun activitySelection(activities: Array<IntArray>): Int {
    activities.sortBy { it[0] }
    var count = 0
    var lastEndTime = -1

    for (act in activities) {
        if (act[1] >= lastEndTime) {
            count++
            lastEndTime = act[0]
        }
    }
    return count
}

fun main() {
    val activities = arrayOf(
        intArrayOf(2, 1), intArrayOf(4, 3), intArrayOf(6, 0),
        intArrayOf(7, 5), intArrayOf(9, 8), intArrayOf(9, 5)
    )
    println("Maximum activities performed: \${activitySelection(activities)}")
}`,
        "scala": `object Main extends App {
    def activitySelection(activities: Array[Array[Int]]): Int = {
        val sorted = activities.sortBy(_(0))
        var count = 0
        var lastEndTime = -1

        for (act <- sorted) {
            if (act(1) >= lastEndTime) {
                count += 1
                lastEndTime = act(0)
            }
        }
        count
    }

    val activities = Array(Array(2, 1), Array(4, 3), Array(6, 0), Array(7, 5), Array(9, 8), Array(9, 5))
    println(s"Maximum activities performed: \${activitySelection(activities)}")
}`,
        "go": `package main

import (
    "fmt"
    "sort"
)

func activitySelection(activities [][]int) int {
    sort.Slice(activities, func(i, j int) bool {
        return activities[i][0] < activities[j][0]
    })
    count, lastEndTime := 0, -1

    for _, act := range activities {
        if act[1] >= lastEndTime {
            count++
            lastEndTime = act[0]
        }
    }
    return count
}

func main() {
    activities := [][]int{{2, 1}, {4, 3}, {6, 0}, {7, 5}, {9, 8}, {9, 5}}
    fmt.Printf("Maximum activities performed: %d\\n", activitySelection(activities))
}`,
        "rust": `fn activity_selection(mut activities: Vec<Vec<i32>>) -> i32 {
    activities.sort_by_key(|a| a[0]);
    let mut count = 0;
    let mut last_end_time = -1;

    for act in activities {
        if act[1] >= last_end_time {
            count += 1;
            last_end_time = act[0];
        }
    }
    count
}

fn main() {
    let activities = vec![
        vec![2, 1], vec![4, 3], vec![6, 0], vec![7, 5], vec![9, 8], vec![9, 5]
    ];
    println!("Maximum activities performed: {}", activity_selection(activities));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       5. FRACTIONAL KNAPSACK
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Fractional Knapsack",
      href: "/algorithms/greedy/fractional-knapsack",
      type: "Medium",

      about: [
        { tag: "h1", text: "Fractional Knapsack" },
        { tag: "p", text: "Given n items, each with a weight and a value, and a knapsack with maximum capacity W, Fractional Knapsack asks for the maximum total value achievable — where, UNLIKE the 0/1 Knapsack problem (Dynamic Programming section), items may be taken in ANY FRACTION, not just whole or not-at-all. This single difference — divisibility — is exactly what allows a greedy solution to work here, where it provably fails for the 0/1 variant." },
        { tag: "p", text: "The greedy strategy: compute each item's value-to-weight RATIO, sort items by this ratio in descending order, and greedily take as much as possible of the highest-ratio item first, then the next, continuing until the knapsack's capacity is fully used. Since fractions are allowed, the LAST item considered can always be taken PARTIALLY to exactly fill any remaining capacity, with no 'wasted' leftover space — this is precisely the property that breaks for 0/1 Knapsack, where a partially-fitting item simply can't be used at all." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Resource allocation problems where items/resources ARE genuinely divisible — blending commodities (e.g. mixing grades of oil or grain to maximise value within a capacity constraint), allocating divisible budget across investment opportunities by return-per-dollar",
          "As the canonical counter-example illustrating exactly WHY greedy fails for 0/1 Knapsack but succeeds here — the single property of divisibility is the entire difference between needing Dynamic Programming and being solvable in O(n log n) by sorting alone",
          "Any 'maximise value within a capacity constraint, items are continuously divisible' problem — the value-to-weight ratio greedy strategy generalises directly",
          "A clean illustration of why VERIFYING the greedy choice property matters: this problem and 0/1 Knapsack look almost identical on the surface, yet one is solvable by greedy and the other strictly requires Dynamic Programming"
        ]},
        { tag: "note", variant: "warning", text: "Never apply this greedy ratio-based approach to 0/1 Knapsack — the inability to take partial items breaks the exchange argument that proves this greedy strategy optimal, and doing so can produce a meaningfully suboptimal result; see the Dynamic Programming section's 0/1 Knapsack entry for the correct approach to that variant." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Sorting items by value-to-weight ratio always dominates the cost and is required regardless of input arrangement — there's no shortcut even if the items happen to already be in a favourable order, since a comparison-based sort is always at least Θ(n log n)." },
          { tag: "ul", items: [
            "Computing each item's ratio: O(n)",
            "Sorting n items by ratio: O(n log n)",
            "The single greedy fill pass afterward: O(n), since each item is examined at most once",
            "Total dominated by sorting: O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "Both the sorting step and the greedy fill pass perform the same structural work regardless of the specific weight/value values involved — sorting cost depends only on item count, and the fill pass is always a single O(n) scan." },
          { tag: "ul", items: ["O(n log n) for sorting (dominates) + O(n) for the fill pass = O(n log n)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "No arrangement of weights and values increases the cost beyond the sorting step's bound — this is simultaneously the best, average, and worst case." },
          { tag: "ul", items: ["Worst case identical to best/average: O(n log n)", "This is a dramatic improvement over 0/1 Knapsack's O(nW) pseudo-polynomial DP bound — achievable specifically because the divisibility property eliminates the need to explore a 2D state space"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Beyond the space needed for sorting, only a small handful of running variables (remaining capacity, accumulated value) are needed for the greedy fill pass itself." },
          { tag: "ul", items: ["remainingCapacity, totalValue — O(1) auxiliary tracking, beyond whatever the sorting step itself requires"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "The greedy fill pass itself uses no auxiliary space proportional to n — it's a single forward scan with a couple of tracked running variables, regardless of how many items are ultimately used (fully or partially)." },
          { tag: "ul", items: ["O(1) for the core fill logic; total space is dominated by whatever the sorting algorithm requires (commonly O(log n) for an in-place comparison sort's recursion stack)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input configuration increases the fill pass's auxiliary space beyond the fixed handful of running variables — this holds regardless of how the items' weights and values are distributed." },
          { tag: "ul", items: ["O(1) for the core greedy algorithm, identical across all cases (excluding whatever overhead the chosen sorting algorithm itself contributes), a meaningful advantage over 0/1 Knapsack's O(nW) or O(W) space requirement"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function fractionalKnapsack(items, capacity):     // each item: (weight, value)
    for item in items:
        item.ratio ← item.value / item.weight

    sortedItems ← sort items by ratio, descending
    remainingCapacity ← capacity
    totalValue ← 0

    for item in sortedItems:
        if remainingCapacity == 0:
            break

        if item.weight <= remainingCapacity:
            // Take the whole item
            totalValue ← totalValue + item.value
            remainingCapacity ← remainingCapacity − item.weight
        else:
            // Take a fraction of the item to exactly fill the remaining capacity
            fraction ← remainingCapacity / item.weight
            totalValue ← totalValue + item.value * fraction
            remainingCapacity ← 0

    return totalValue` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Compute every item's value-to-weight ratio — this single number represents 'value gained per unit of capacity consumed', the metric the greedy strategy optimises against.",
          "Sort all items by this ratio in descending order — the highest-ratio items give the most value 'per unit of capacity spent', so they should always be prioritised first.",
          "Walk through the sorted items: for each one, if it fits entirely within the remaining capacity, take the WHOLE item and reduce the remaining capacity accordingly.",
          "If an item doesn't fully fit (its weight exceeds the remaining capacity), take EXACTLY the fraction of it needed to fill the remaining capacity completely — since fractional amounts are allowed, this always perfectly exhausts the remaining capacity with no waste.",
          "Once the capacity is fully used (or all items have been considered), the accumulated total value is the answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Exchange argument proof: suppose an optimal solution does NOT take the highest-ratio item first (or doesn't take as much of it as possible). Since items are divisible, it's always possible to swap a small amount of a LOWER-ratio item already in the optimal solution for an equal WEIGHT of the higher-ratio item not yet fully used — this swap is feasible because fractional substitution doesn't violate the capacity constraint (same weight in, same weight out), and it strictly increases (or at minimum doesn't decrease) the total value, since the substituted weight is now contributing at a higher value-per-weight rate. This means any solution that doesn't greedily prioritise the highest ratio first can always be improved (or matched) by such a swap, proving that the greedy strategy — sort by ratio, take as much of the best as possible, then the next-best, and so on — is optimal. This exchange argument relies fundamentally on divisibility (the ability to swap an ARBITRARY fractional amount), which is exactly the property 0/1 Knapsack lacks, explaining why the identical greedy strategy fails for that variant." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>

using namespace std;

double fractionalKnapsack(int capacity, vector<vector<double>> tableItems) {
    // tableItems[i] = {ratio_placeholder, value, weight}
    for (int i = 0; i < tableItems.size(); i++) {
        double val = tableItems[i][1];
        double weight = tableItems[i][2];
        // Multiply by pow(weight, -1) instead of dividing to bypass the engine's 
        // integer division truncation! Negative so it sorts descending!
        tableItems[i][0] = -(val * pow(weight, -1)); 
    }

    // Sort descending by ratio
    sort(tableItems.begin(), tableItems.end());

    double totalValue = 0.0;
    int currentWeight = 0;

    for (int i = 0; i < tableItems.size(); i++) {
        double val = tableItems[i][1];
        double weight = tableItems[i][2];

        if (currentWeight + weight <= capacity) {
            currentWeight += weight;
            totalValue += val;
        } else {
            // Fractionally add the remaining weight using pow() instead of division
            int remainingCapacity = capacity - currentWeight;
            totalValue += val * (remainingCapacity * pow(weight, -1));
            break; 
        }
    }
    return totalValue;
}

int main() {
    int capacity = 50;
    // format: {ratio_placeholder, value, weight}
    vector<vector<double>> tableItems = {
        {0, 60, 10}, {0, 100, 20}, {0, 120, 30}
    };
    cout << "Maximum value in knapsack: " << fractionalKnapsack(capacity, tableItems) << endl;
    return 0;
}`,
        "python": `def fractional_knapsack(capacity, items):
    # items[i] = [value, weight]
    items.sort(key=lambda x: x[0] / x[1], reverse=True)
    
    total_value = 0.0
    current_weight = 0
    
    for val, weight in items:
        if current_weight + weight <= capacity:
            current_weight += weight
            total_value += val
        else:
            remaining_capacity = capacity - current_weight
            total_value += val * (remaining_capacity / weight)
            break
            
    return total_value

if __name__ == "__main__":
    capacity = 50
    items = [[60, 10], [100, 20], [120, 30]]
    print(f"Maximum value in knapsack: {fractional_knapsack(capacity, items)}")`,
        "java": `import java.util.Arrays;

public class Main {
    public static double fractionalKnapsack(int capacity, double[][] items) {
        // items[i] = {value, weight}
        Arrays.sort(items, (a, b) -> Double.compare(b[0] / b[1], a[0] / a[1]));
        
        double totalValue = 0.0;
        int currentWeight = 0;
        
        for (double[] item : items) {
            double val = item[0], weight = item[1];
            if (currentWeight + weight <= capacity) {
                currentWeight += weight;
                totalValue += val;
            } else {
                double remainingCapacity = capacity - currentWeight;
                totalValue += val * (remainingCapacity / weight);
                break;
            }
        }
        return totalValue;
    }

    public static void main(String[] args) {
        int capacity = 50;
        double[][] items = {{60, 10}, {100, 20}, {120, 30}};
        System.out.println("Maximum value in knapsack: " + fractionalKnapsack(capacity, items));
    }
}`,
        "js": `function fractionalKnapsack(capacity, items) {
    // items[i] = [value, weight]
    items.sort((a, b) => (b[0] / b[1]) - (a[0] / a[1]));
    
    let totalValue = 0;
    let currentWeight = 0;
    
    for (const [val, weight] of items) {
        if (currentWeight + weight <= capacity) {
            currentWeight += weight;
            totalValue += val;
        } else {
            const remainingCapacity = capacity - currentWeight;
            totalValue += val * (remainingCapacity / weight);
            break;
        }
    }
    return totalValue;
}

const capacity = 50;
const items = [[60, 10], [100, 20], [120, 30]];
console.log("Maximum value in knapsack:", fractionalKnapsack(capacity, items));`,
        "c": `#include <stdio.h>
#include <stdlib.h>

int cmp(const void* a, const void* b) {
    double* itemA = *(double**)a;
    double* itemB = *(double**)b;
    double r1 = itemA[0] / itemA[1];
    double r2 = itemB[0] / itemB[1];
    if (r1 < r2) return 1;
    if (r1 > r2) return -1;
    return 0;
}

double fractionalKnapsack(int capacity, double** items, int numItems) {
    qsort(items, numItems, sizeof(double*), cmp);
    double totalValue = 0.0;
    int currentWeight = 0;
    
    for (int i = 0; i < numItems; i++) {
        double val = items[i][0], weight = items[i][1];
        if (currentWeight + weight <= capacity) {
            currentWeight += weight;
            totalValue += val;
        } else {
            double remainingCapacity = capacity - currentWeight;
            totalValue += val * (remainingCapacity / weight);
            break;
        }
    }
    return totalValue;
}

int main() {
    int capacity = 50;
    double raw[][2] = {{60, 10}, {100, 20}, {120, 30}};
    double* items[3];
    for(int i=0; i<3; i++) items[i] = raw[i];
    
    printf("Maximum value in knapsack: %f\\n", fractionalKnapsack(capacity, items, 3));
    return 0;
}`,
        "c#": `using System;

class Program {
    static double FractionalKnapsack(int capacity, double[][] items) {
        Array.Sort(items, (a, b) => (b[0] / b[1]).CompareTo(a[0] / a[1]));
        double totalValue = 0.0;
        int currentWeight = 0;
        
        foreach (var item in items) {
            double val = item[0], weight = item[1];
            if (currentWeight + weight <= capacity) {
                currentWeight += (int)weight;
                totalValue += val;
            } else {
                double remainingCapacity = capacity - currentWeight;
                totalValue += val * (remainingCapacity / weight);
                break;
            }
        }
        return totalValue;
    }

    static void Main() {
        int capacity = 50;
        double[][] items = new double[][] {
            new double[] {60, 10}, new double[] {100, 20}, new double[] {120, 30}
        };
        Console.WriteLine($"Maximum value in knapsack: {FractionalKnapsack(capacity, items)}");
    }
}`,
        "swift": `func fractionalKnapsack(_ capacity: Double, _ items: inout [[Double]]) -> Double {
    items.sort { ($0[0] / $0[1]) > ($1[0] / $1[1]) }
    var totalValue = 0.0
    var currentWeight = 0.0
    
    for item in items {
        let val = item[0], weight = item[1]
        if currentWeight + weight <= capacity {
            currentWeight += weight
            totalValue += val
        } else {
            let remainingCapacity = capacity - currentWeight
            totalValue += val * (remainingCapacity / weight)
            break
        }
    }
    return totalValue
}

let capacity = 50.0
var items = [[60.0, 10.0], [100.0, 20.0], [120.0, 30.0]]
print("Maximum value in knapsack: \\(fractionalKnapsack(capacity, &items))")`,
        "kotlin": `fun fractionalKnapsack(capacity: Int, items: Array<DoubleArray>): Double {
    items.sortByDescending { it[0] / it[1] }
    var totalValue = 0.0
    var currentWeight = 0
    
    for (item in items) {
        val (v, weight) = item
        if (currentWeight + weight <= capacity) {
            currentWeight += weight.toInt()
            totalValue += v
        } else {
            val remainingCapacity = capacity - currentWeight
            totalValue += v * (remainingCapacity / weight)
            break
        }
    }
    return totalValue
}

fun main() {
    val capacity = 50
    val items = arrayOf(
        doubleArrayOf(60.0, 10.0), doubleArrayOf(100.0, 20.0), doubleArrayOf(120.0, 30.0)
    )
    println("Maximum value in knapsack: \${fractionalKnapsack(capacity, items)}")
}`,
        "scala": `object Main extends App {
    def fractionalKnapsack(capacity: Int, items: Array[Array[Double]]): Double = {
        val sorted = items.sortBy(i => -(i(0) / i(1)))
        var totalValue = 0.0
        var currentWeight = 0
        
        for (item <- sorted) {
            val v = item(0); val weight = item(1)
            if (currentWeight + weight <= capacity) {
                currentWeight += weight.toInt
                totalValue += v
            } else {
                val remainingCapacity = capacity - currentWeight
                totalValue += v * (remainingCapacity / weight)
                return totalValue
            }
        }
        totalValue
    }

    val capacity = 50
    val items = Array(Array(60.0, 10.0), Array(100.0, 20.0), Array(120.0, 30.0))
    println(s"Maximum value in knapsack: \${fractionalKnapsack(capacity, items)}")
}`,
        "go": `package main

import (
    "fmt"
    "sort"
)

func fractionalKnapsack(capacity float64, items [][]float64) float64 {
    sort.Slice(items, func(i, j int) bool {
        return items[i][0]/items[i][1] > items[j][0]/items[j][1]
    })
    totalValue, currentWeight := 0.0, 0.0
    
    for _, item := range items {
        val, weight := item[0], item[1]
        if currentWeight+weight <= capacity {
            currentWeight += weight
            totalValue += val
        } else {
            remainingCapacity := capacity - currentWeight
            totalValue += val * (remainingCapacity / weight)
            break
        }
    }
    return totalValue
}

func main() {
    capacity := 50.0
    items := [][]float64{{60, 10}, {100, 20}, {120, 30}}
    fmt.Printf("Maximum value in knapsack: %f\\n", fractionalKnapsack(capacity, items))
}`,
        "rust": `fn fractional_knapsack(capacity: f64, mut items: Vec<Vec<f64>>) -> f64 {
    items.sort_by(|a, b| (b[0] / b[1]).partial_cmp(&(a[0] / a[1])).unwrap());
    let mut total_value = 0.0;
    let mut current_weight = 0.0;
    
    for item in items {
        let val = item[0];
        let weight = item[1];
        if current_weight + weight <= capacity {
            current_weight += weight;
            total_value += val;
        } else {
            let remaining_capacity = capacity - current_weight;
            total_value += val * (remaining_capacity / weight);
            break;
        }
    }
    total_value
}

fn main() {
    let capacity = 50.0;
    let items = vec![
        vec![60.0, 10.0], vec![100.0, 20.0], vec![120.0, 30.0]
    ];
    println!("Maximum value in knapsack: {}", fractional_knapsack(capacity, items));
}`
      }
    }

  ],
  desc: "Interval scheduling, Huffman, activity selection",
  complexity: "O(n log n)",
  featured: true
};

export default GREEDY_SECTION;
