/* ─── Schema v2 — Flexible Content Nodes ─────────────────────────────────────
 *
 *  Why this changed:
 *  The old shape `{ h1: string, p: string, ul: { content, li } }` hard-coded
 *  exactly one heading, one paragraph, and one list per block. Real
 *  explanations need multiple paragraphs, sub-headings, code samples,
 *  comparison tables, and callouts in any order. So every "block" is now an
 *  ORDERED ARRAY of typed nodes. A renderer just maps node.tag -> component.
 *
 *  ContentBlock = ContentNode[]
 *
 *  ContentNode (discriminated by `tag`):
 *    { tag: "h1"|"h2"|"h3"|"h4",            text: string }
 *    { tag: "p",                            text: string }
 *    { tag: "blockquote",                   text: string }
 *    { tag: "ul" | "ol",                    items: string[] }
 *    { tag: "dl",                           items: { term: string, desc: string }[] }
 *    { tag: "code",                         language: string, text: string }
 *    { tag: "table",                        headers: string[], rows: string[][] }
 *    { tag: "note",                         variant: "tip"|"warning"|"info", text: string }
 *    { tag: "katex" | "math",               text: string }   // inline/block math expressions
 *
 *  This is a strict superset of the old shape — a parser can still special-case
 *  "h1"/"p"/"ul" if it wants the old look, but now has room for everything else.
 *
 *  AlgorithmItem = {
 *    name, href, type: "Easy"|"Medium"|"Hard",
 *    about: ContentBlock,
 *    timeComplexityCalculation:  { notation: string, best: ContentBlock, average: ContentBlock, worst: ContentBlock },
 *    spaceComplexityCalculation: { notation: string, best: ContentBlock, average: ContentBlock, worst: ContentBlock },
 *    pseudoCodeandStepexplanation: ContentBlock,
 *  }
 * ─────────────────────────────────────────────────────────────────────────── */

const ARRAYS_SECTION = {
  name: "Arrays",
  href: "/algorithms/arrays",
  about: [
    { tag: "h1", text: "Arrays" },
    { tag: "p", text: "An array stores elements in contiguous memory so that any element can be reached in O(1) time given its index. That single guarantee — constant-time random access — is the foundation every array algorithm exploits, and the reason arrays are usually the first data structure taught and the most frequently used in practice." },
    { tag: "p", text: "For developers building SDE-grade applications, mastering arrays is non-negotiable. Beyond just O(1) indexing, arrays benefit massively from CPU cache spatial locality. When a processor loads an array element into cache, it also loads the adjacent elements. This makes linear scans over arrays significantly faster in practice than traversing node-based structures like Linked Lists, even though both are asymptotically O(n)." },
    { tag: "p", text: "Because the layout is contiguous, arrays trade flexibility for speed: insertion or deletion in the middle costs O(n) since every following element must shift. The size is fixed at allocation time unless you use a dynamic array (like std::vector), which amortizes growth across O(1) average appends. Almost every pattern below exists specifically to work around that rigidity while still exploiting the O(1) access." },
    { tag: "h2", text: "Patterns covered in this section" },
    { tag: "table",
      headers: ["Pattern", "Core Idea", "Typical Time", "Typical Space"],
      rows: [
        ["Two Pointers", "Two indices converge or co-traverse to avoid nested loops", "O(n)", "O(1)"],
        ["Kadane's Algorithm", "Track best running sum, resetting when it turns negative", "O(n)", "O(1)"],
        ["Sliding Window", "Maintain a contiguous range, expanding/contracting its bounds", "O(n)", "O(1) – O(k)"],
        ["Boyer-Moore Majority Vote", "Cancel out non-majority votes against a running candidate", "O(n)", "O(1)"],
        ["Prefix Sum", "Precompute cumulative sums for O(1) range-sum queries", "O(n) build", "O(n)"],
        ["Dutch National Flag", "3-way in-place partition around a pivot in one pass", "O(n)", "O(1)"]
      ]
    },
    { tag: "note", variant: "tip", text: "If a problem mentions a sorted array, a target sum, a contiguous subarray, or asks you to do something 'in-place' with O(1) extra space, it is almost certainly solved by one of the six patterns above." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. TWO POINTERS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Two Pointers",
      href: "/algorithms/arrays/two-pointers",
      type: "Easy",

      about: [
        { tag: "h1", text: "Two Pointers" },
        { tag: "p", text: "The Two Pointers pattern uses two index variables that move through a sequence according to a rule, instead of one index moving alone or two nested loops moving independently. The two most common variants are opposite-direction (one pointer starts at each end and they move toward each other) and same-direction (both pointers start near the beginning and move forward at different rates, sometimes called the 'fast and slow' or 'read/write' variant)." },
        { tag: "p", text: "Its value is asymptotic: a brute-force search for a pair or triplet satisfying a condition typically costs O(n²) or O(n³) with nested loops. In highly concurrent environments — like a server-authoritative multiplayer backend matching game states — nested loops introduce unacceptable latency. Two Pointers exploits sorted order (or a monotonic property) to discard half the remaining search space on every step, collapsing that to O(n)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The array or string is sorted, or can be sorted without breaking the problem's constraints",
          "You're looking for a pair, triplet, or subarray that satisfies a numeric condition — target sum, target product, closest difference",
          "You need an in-place answer with O(1) extra space (removing duplicates, partitioning, reversing)",
          "You're merging two already-sorted sequences",
          "You're checking a structural property like palindrome symmetry"
        ]},
        { tag: "h2", text: "Variant comparison" },
        { tag: "table",
          headers: ["Variant", "Pointer Movement", "Classic Problems"],
          rows: [
            ["Opposite-direction", "left starts at 0, right starts at n−1, they move toward each other", "Two Sum II, Container With Most Water, Valid Palindrome"],
            ["Same-direction (fast/slow)", "Both start at 0; fast advances every step, slow advances conditionally", "Remove Duplicates from Sorted Array, Move Zeroes"],
            ["Three pointers", "One fixed/anchored, two opposite-direction pointers scan the remainder", "3Sum, 3Sum Closest, Dutch National Flag"]
          ]
        },
        { tag: "note", variant: "info", text: "Two Pointers and Sliding Window are siblings: Sliding Window is really 'same-direction Two Pointers' where the region between the pointers represents a window whose contents matter, not just the two boundary values." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Even when the answer is found on the very first comparison, the algorithm is still classified O(n) — Two Pointers has no way to know in advance where the answer lies, so it cannot skip the O(1) setup cost relative to input size n." },
          { tag: "ol", items: [
            "Initialise left = 0 and right = n − 1 — O(1)",
            "arr[left] + arr[right] equals target on the very first check",
            "Loop exits after exactly 1 iteration — O(1) inner work",
            "Classification remains O(n) because correctness depends on the pointers being able to reach any element of an n-sized input"
          ]},
          { tag: "note", variant: "tip", text: "'Best case O(1) work done' and 'best case time complexity classification' are different things — always classify by what the algorithm is capable of needing, not by the luckiest possible input." }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "On a uniformly random sorted array, the expected number of iterations before the pointers meet or the answer is found is proportional to n. Each iteration moves exactly one pointer by one position, so the two pointers can make at most n − 1 combined moves before colliding." },
          { tag: "ul", items: [
            "left only increases, right only decreases — neither pointer revisits a position",
            "Total combined pointer movement across the whole run is bounded by n",
            "Each iteration does O(1) work: one addition, one comparison, one pointer update",
            "n iterations × O(1) per iteration = O(n) average"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "The worst case happens when no valid pair exists at all, or the only valid pair sits at the final possible comparison — the pointers must walk all the way to the middle of the array before the loop condition left < right fails." },
          { tag: "ul", items: [
            "left advances from 0 up to ⌊n/2⌋",
            "right retreats from n − 1 down to ⌈n/2⌉",
            "Total comparisons made: n − 1, which is Θ(n)",
            "This matches the Ω(n) lower bound for any algorithm that must inspect every element at least once in the worst case — Two Pointers is asymptotically optimal here"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Two Pointers operates in-place on the original array. The only memory used is a fixed, small number of scalar variables." },
          { tag: "ul", items: [
            "left index — O(1)",
            "right index — O(1)",
            "a temporary sum/comparison variable — O(1)",
            "no auxiliary arrays, hash sets, or recursive call stack"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on the values inside the array or how many iterations run — it is structurally constant." },
          { tag: "ul", items: [
            "The algorithm reads the input array directly without copying it",
            "Loop variables remain fixed-size integers regardless of n",
            "Iterative implementation — no growing call stack"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even traversing the entire array without success allocates nothing beyond the two index variables already accounted for." },
          { tag: "ul", items: [
            "2 integer pointers + O(1) temporaries, regardless of n",
            "If the caller wants the actual pair returned, that's O(1) to store two indices, not O(n)"
          ]},
          { tag: "note", variant: "warning", text: "If a problem asks you to collect ALL valid pairs (not just one), the output itself can be O(n) or larger — that space belongs to the result set, not to the algorithm's auxiliary footprint." }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Below is the canonical opposite-direction template, solving 'Two-Sum II': given a 1-indexed sorted array, return the positions of the two nums that add up to a target." },
        { tag: "code", language: "text", text:
`function twoSum(arr, target):
    left  ← 0
    right ← length(arr) − 1

    while left < right:
        currentSum ← arr[left] + arr[right]

        if currentSum == target:
            return [left + 1, right + 1]      // found
        else if currentSum < target:
            left ← left + 1                    // need a larger sum
        else:
            right ← right − 1                  // need a smaller sum

    return NOT_FOUND` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise left to the first index (0) and right to the last index (n − 1).",
          "Enter the loop: continue as long as left < right — they haven't crossed or met.",
          "Compute currentSum = arr[left] + arr[right] in O(1).",
          "If currentSum equals target → pair found. Return 1-based indices immediately.",
          "If currentSum is too small, arr[left] is too small. Increment left to move to a strictly larger value (array is sorted ascending).",
          "If currentSum is too large, arr[right] is too large. Decrement right to move to a strictly smaller value.",
          "Each iteration discards at least one index permanently — the search space strictly shrinks.",
          "If the loop exits without returning, no valid pair exists for the given target."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Loop invariant: at the start of every iteration, if a valid pair exists in the original array, at least one such pair lies within arr[left..right]. Each branch only discards index positions that are provably part of no valid pair given the sorted order, so the invariant is preserved until either a pair is found or the search space is exhausted." },
        { tag: "h2", text: "Termination proof" },
        { tag: "p", text: "Every iteration strictly increases left or strictly decreases right by exactly one. The quantity (right − left) therefore strictly decreases on every iteration and starts at a finite value (n − 1), so the loop condition left < right is guaranteed to become false after at most n − 1 iterations." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    int left = 0;
    int right = nums.size() - 1;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        
        if (sum == target) {
            // Returning 1-based indices as per classic Two Sum II rules
            return {left + 1, right + 1};
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return {-1, -1};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> result = twoSum(nums, target);
    cout << "Indices: " << result[0] << ", " << result[1] << endl;
    return 0;
}`,
        "python": `def two_sum(nums, target):
    left, right = 0, len(nums) - 1
    
    while left < right:
        current_sum = nums[left] + nums[right]
        if current_sum == target:
            return [left + 1, right + 1]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
            
    return [-1, -1]

if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    result = two_sum(nums, target)
    print(f"Indices: {result[0]}, {result[1]}")`,
        "java": `import java.util.Arrays;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        int left = 0;
        int right = nums.length - 1;
        
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return new int[]{left + 1, right + 1};
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[]{-1, -1};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Indices: " + result[0] + ", " + result[1]);
    }
}`,
        "js": `function twoSum(nums, target) {
    let left = 0;
    let right = nums.length - 1;
    
    while (left < right) {
        const sum = nums[left] + nums[right];
        if (sum === target) {
            return [left + 1, right + 1];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    return [-1, -1];
}

const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log("Indices:", result[0], ",", result[1]);`,
        "c": `#include <stdio.h>
#include <stdlib.h>

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    int left = 0;
    int right = numsSize - 1;
    int* result = (int*)malloc(2 * sizeof(int));
    *returnSize = 2;
    
    while (left < right) {
        int sum = nums[left] + nums[right];
        if (sum == target) {
            result[0] = left + 1;
            result[1] = right + 1;
            return result;
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    result[0] = -1;
    result[1] = -1;
    return result;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int returnSize;
    int* result = twoSum(nums, 4, target, &returnSize);
    printf("Indices: %d, %d\\n", result[0], result[1]);
    free(result);
    return 0;
}`,
        "c#": `using System;

class Program {
    public static int[] TwoSum(int[] nums, int target) {
        int left = 0;
        int right = nums.Length - 1;
        
        while (left < right) {
            int sum = nums[left] + nums[right];
            if (sum == target) {
                return new int[] { left + 1, right + 1 };
            } else if (sum < target) {
                left++;
            } else {
                right--;
            }
        }
        return new int[] { -1, -1 };
    }

    static void Main() {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = TwoSum(nums, target);
        Console.WriteLine($"Indices: {result[0]}, {result[1]}");
    }
}`,
        "swift": `func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
    var left = 0
    var right = nums.count - 1
    
    while left < right {
        let sum = nums[left] + nums[right]
        if sum == target {
            return [left + 1, right + 1]
        } else if sum < target {
            left += 1
        } else {
            right -= 1
        }
    }
    return [-1, -1]
}

let nums = [2, 7, 11, 15]
let result = twoSum(nums, 9)
print("Indices: \\(result[0]), \\(result[1])")`,
        "kotlin": `fun twoSum(nums: IntArray, target: Int): IntArray {
    var left = 0
    var right = nums.size - 1
    
    while (left < right) {
        val sum = nums[left] + nums[right]
        if (sum == target) {
            return intArrayOf(left + 1, right + 1)
        } else if (sum < target) {
            left++
        } else {
            right--
        }
    }
    return intArrayOf(-1, -1)
}

fun main() {
    val nums = intArrayOf(2, 7, 11, 15)
    val target = 9
    val result = twoSum(nums, target)
    println("Indices: \${result[0]}, \${result[1]}")
}`,
        "scala": `object Main extends App {
    def twoSum(nums: Array[Int], target: Int): Array[Int] = {
        var left = 0
        var right = nums.length - 1
        
        while (left < right) {
            val sum = nums(left) + nums(right)
            if (sum == target) {
                return Array(left + 1, right + 1)
            } else if (sum < target) {
                left += 1
            } else {
                right -= 1
            }
        }
        Array(-1, -1)
    }

    val nums = Array(2, 7, 11, 15)
    val target = 9
    val result = twoSum(nums, target)
    println(s"Indices: \${result(0)}, \${result(1)}")
}`,
        "go": `package main

import "fmt"

func twoSum(nums []int, target int) []int {
    left := 0
    right := len(nums) - 1
    
    for left < right {
        sum := nums[left] + nums[right]
        if sum == target {
            return []int{left + 1, right + 1}
        } else if sum < target {
            left++
        } else {
            right--
        }
    }
    return []int{-1, -1}
}

func main() {
    nums := []int{2, 7, 11, 15}
    target := 9
    result := twoSum(nums, target)
    fmt.Printf("Indices: %d, %d\\n", result[0], result[1])
}`,
        "rust": `fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
    let mut left = 0;
    let mut right = nums.len() - 1;
    
    while left < right {
        let sum = nums[left] + nums[right];
        if sum == target {
            return vec![(left + 1) as i32, (right + 1) as i32];
        } else if sum < target {
            left += 1;
        } else {
            right -= 1;
        }
    }
    vec![-1, -1]
}

fn main() {
    let nums = vec![2, 7, 11, 15];
    let target = 9;
    let result = two_sum(nums, target);
    println!("Indices: {}, {}", result[0], result[1]);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. KADANE'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Kadane's Algorithm",
      href: "/algorithms/arrays/kadanes",
      type: "Medium",

      about: [
        { tag: "h1", text: "Kadane's Algorithm" },
        { tag: "p", text: "Kadane's Algorithm finds the maximum sum of any contiguous subarray within a one-dimensional array of numbers (which may include negatives) in a single linear pass. It was devised by Jay Kadane in 1984 and remains the textbook example of how dynamic programming can collapse an apparently O(n²) problem into O(n) by recognising overlapping subproblems." },
        { tag: "p", text: "In backend architecture, Kadane's can be adapted to find the maximum contiguous burst of server latency, detect peak activity windows over an active Socket.IO connection, or isolate anomalies in telemetry data. At every position, the best subarray ending exactly at that position is either 'extend the previous best subarray' or 'start fresh from here'." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The problem asks for the maximum (or minimum) sum of a contiguous subarray",
          "Negative numbers are present, otherwise the answer would trivially be the whole array",
          "You need O(n) time with O(1) space — Kadane beats both brute force (O(n²)) and the divide-and-conquer approach (O(n log n))",
          "Variants: maximum product subarray, maximum sum circular subarray, maximum sum with at most one deletion"
        ]},
        { tag: "blockquote", text: "Kadane's is a 1-state dynamic program in disguise: dp[i] = max(arr[i], dp[i-1] + arr[i]), with the answer being max(dp). The 'algorithm' is just computing that recurrence without storing the whole dp array." },
        { tag: "note", variant: "info", text: "If every number in the array is negative, the correct answer is the single largest (least negative) element, not zero — a common off-by-logic bug is initialising the running sum to 0 instead of arr[0]." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Kadane's always scans every element exactly once — there is no early-exit condition, because the maximum subarray could end at any position, including the very last index. So best case equals worst case: a single Θ(n) pass." },
          { tag: "ul", items: [
            "Initialise currentSum = arr[0], maxSum = arr[0] — O(1)",
            "For each of the remaining n − 1 elements, do exactly one comparison and one addition",
            "No data pattern allows the loop to terminate early — total work is always n − 1 steps"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Because the algorithm performs identical O(1) work at every index regardless of the values encountered, there is no notion of 'lucky' or 'unlucky' input that changes the iteration count — average case is identical to best and worst." },
          { tag: "ul", items: [
            "Each iteration: currentSum = max(arr[i], currentSum + arr[i]) — O(1)",
            "Each iteration: maxSum = max(maxSum, currentSum) — O(1)",
            "n iterations of O(1) work = O(n) regardless of distribution of positive/negative values"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "The worst case is identical to the average and best case in iteration count, since Kadane's has no conditional early termination — it always processes the full array exactly once." },
          { tag: "ul", items: [
            "All n elements are visited once: Θ(n)",
            "No nested loops or recursion — strictly linear regardless of how many sign changes occur in the array",
            "This matches the Ω(n) lower bound, since any correct algorithm must inspect every element at least once (any unread element could be part of the optimal subarray)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only two scalar accumulators are required: the running sum ending at the current index, and the best sum seen so far." },
          { tag: "ul", items: [
            "currentSum — O(1)",
            "maxSum — O(1)",
            "loop index i — O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage is completely independent of input values — it is always exactly two accumulators." },
          { tag: "ul", items: [
            "No auxiliary array is built, unlike the divide-and-conquer maximum-subarray approach",
            "No recursion stack — the algorithm is a single iterative loop"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even tracking the start/end indices of the optimal subarray (a common follow-up requirement) only adds two more O(1) scalars." },
          { tag: "ul", items: [
            "currentSum, maxSum: O(1)",
            "optional tempStart, bestStart, bestEnd indices: O(1) each",
            "Total auxiliary space remains O(1) regardless of n"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "The pseudocode below returns both the maximum subarray sum and the [start, end] indices that produce it." },
        { tag: "code", language: "text", text:
`function maxSubArray(arr):
    currentSum ← arr[0]
    maxSum     ← arr[0]

    for i from 1 to length(arr) − 1:
        if arr[i] > currentSum + arr[i]:
            currentSum ← arr[i]        // start fresh at i
        else:
            currentSum ← currentSum + arr[i]   // extend previous run

        if currentSum > maxSum:
            maxSum ← currentSum

    return maxSum` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Seed both currentSum and maxSum with arr[0] — a subarray of length 1 is always valid, and initialising to 0 would fail on all-negative arrays.",
          "For every index i from 1 onward, decide: does adding arr[i] to the existing run beat starting a brand-new run at i alone?",
          "If arr[i] > currentSum + arr[i], the existing run is a net drag (currentSum is negative) — discard it and restart from i.",
          "Otherwise, extending is beneficial — add arr[i] to currentSum.",
          "After updating currentSum, compare it to maxSum and update the global best if improved.",
          "Repeat through every element; maxSum after the final iteration holds the answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "By induction: currentSum after processing index i always equals the maximum sum of any subarray that ends exactly at i. The base case (i = 0) holds trivially. For the inductive step, the maximum subarray ending at i either includes index i−1's optimal subarray extended by arr[i], or it is just arr[i] alone — Kadane's explicitly computes max of those two options at every step, so the invariant holds for all i, and maxSum (the running max of all these per-position optima) is therefore the true global maximum." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int maxSubArray(vector<int>& nums) {
    if (nums.empty()) return 0;
    
    // Initialize both to the first element to correctly handle
    // arrays containing exclusively negative numbers.
    int currentSum = nums[0];
    int maxSum = nums[0];
    
    for (size_t i = 1; i < nums.size(); i++) {
        // Is it better to append to the previous subarray,
        // or start a brand new one here?
        currentSum = max(nums[i], currentSum + nums[i]);
        
        // Track the global maximum across all evaluated local maxima.
        maxSum = max(maxSum, currentSum);
    }
    
    return maxSum;
}

int main() {
    vector<int> nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    cout << "Max Subarray Sum: " << maxSubArray(nums) << endl;
    return 0;
}`,
        "python": `def max_sub_array(nums):
    if not nums:
        return 0
        
    current_sum = max_sum = nums[0]
    
    for num in nums[1:]:
        current_sum = max(num, current_sum + num)
        max_sum = max(max_sum, current_sum)
        
    return max_sum

if __name__ == "__main__":
    nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
    print(f"Max Subarray Sum: {max_sub_array(nums)}")`,
        "java": `public class Main {
    public static int maxSubArray(int[] nums) {
        if (nums == null || nums.length == 0) return 0;
        
        int currentSum = nums[0];
        int maxSum = nums[0];
        
        for (int i = 1; i < nums.length; i++) {
            currentSum = Math.max(nums[i], currentSum + nums[i]);
            maxSum = Math.max(maxSum, currentSum);
        }
        
        return maxSum;
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println("Max Subarray Sum: " + maxSubArray(nums));
    }
}`,
        "js": `function maxSubArray(nums) {
    if (nums.length === 0) return 0;
    
    let currentSum = nums[0];
    let maxSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}

const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log("Max Subarray Sum:", maxSubArray(nums));`,
        "c": `#include <stdio.h>

int maxSubArray(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    
    int currentSum = nums[0];
    int maxSum = nums[0];
    
    for (int i = 1; i < numsSize; i++) {
        currentSum = (nums[i] > currentSum + nums[i]) ? nums[i] : currentSum + nums[i];
        if (currentSum > maxSum) maxSum = currentSum;
    }
    
    return maxSum;
}

int main() {
    int nums[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
    printf("Max Subarray Sum: %d\\n", maxSubArray(nums, 9));
    return 0;
}`,
        "c#": `using System;

class Program {
    public static int MaxSubArray(int[] nums) {
        if (nums == null || nums.Length == 0) return 0;
        
        int currentSum = nums[0];
        int maxSum = nums[0];
        
        for (int i = 1; i < nums.Length; i++) {
            currentSum = Math.Max(nums[i], currentSum + nums[i]);
            maxSum = Math.Max(maxSum, currentSum);
        }
        
        return maxSum;
    }

    static void Main() {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        Console.WriteLine($"Max Subarray Sum: {MaxSubArray(nums)}");
    }
}`,
        "swift": `func maxSubArray(_ nums: [Int]) -> Int {
    guard !nums.isEmpty else { return 0 }
    
    var currentSum = nums[0]
    var maxSum = nums[0]
    
    for i in 1..<nums.count {
        currentSum = max(nums[i], currentSum + nums[i])
        maxSum = max(maxSum, currentSum)
    }
    
    return maxSum
}

let nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print("Max Subarray Sum: \\(maxSubArray(nums))")`,
        "kotlin": `import kotlin.math.max

fun maxSubArray(nums: IntArray): Int {
    if (nums.isEmpty()) return 0
    
    var currentSum = nums[0]
    var maxSum = nums[0]
    
    for (i in 1 until nums.size) {
        currentSum = max(nums[i], currentSum + nums[i])
        maxSum = max(maxSum, currentSum)
    }
    
    return maxSum
}

fun main() {
    val nums = intArrayOf(-2, 1, -3, 4, -1, 2, 1, -5, 4)
    println("Max Subarray Sum: \${maxSubArray(nums)}")
}`,
        "scala": `object Main extends App {
    def maxSubArray(nums: Array[Int]): Int = {
        if (nums.isEmpty) return 0
        
        var currentSum = nums(0)
        var maxSum = nums(0)
        
        for (i <- 1 until nums.length) {
            currentSum = math.max(nums(i), currentSum + nums(i))
            maxSum = math.max(maxSum, currentSum)
        }
        
        maxSum
    }

    val nums = Array(-2, 1, -3, 4, -1, 2, 1, -5, 4)
    println(s"Max Subarray Sum: \${maxSubArray(nums)}")
}`,
        "go": `package main

import "fmt"

func maxSubArray(nums []int) int {
    if len(nums) == 0 { return 0 }
    
    currentSum := nums[0]
    maxSum := nums[0]
    
    for i := 1; i < len(nums); i++ {
        if nums[i] > currentSum+nums[i] {
            currentSum = nums[i]
        } else {
            currentSum += nums[i]
        }
        if currentSum > maxSum {
            maxSum = currentSum
        }
    }
    
    return maxSum
}

func main() {
    nums := []int{-2, 1, -3, 4, -1, 2, 1, -5, 4}
    fmt.Printf("Max Subarray Sum: %d\\n", maxSubArray(nums))
}`,
        "rust": `use std::cmp;

fn max_sub_array(nums: Vec<i32>) -> i32 {
    if nums.is_empty() { return 0; }
    
    let mut current_sum = nums[0];
    let mut max_sum = nums[0];
    
    for &num in nums.iter().skip(1) {
        current_sum = cmp::max(num, current_sum + num);
        max_sum = cmp::max(max_sum, current_sum);
    }
    
    max_sum
}

fn main() {
    let nums = vec![-2, 1, -3, 4, -1, 2, 1, -5, 4];
    println!("Max Subarray Sum: {}", max_sub_array(nums));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. SLIDING WINDOW
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Sliding Window",
      href: "/algorithms/arrays/sliding-window",
      type: "Medium",

      about: [
        { tag: "h1", text: "Sliding Window" },
        { tag: "p", text: "Sliding Window maintains a contiguous range [left, right] over an array or string and incrementally adjusts its boundaries instead of recomputing the range's properties from scratch at every position. It comes in two flavours: a fixed-size window (the width never changes — it just slides) and a variable-size window (the width grows and shrinks based on a condition)." },
        { tag: "p", text: "This pattern is incredibly useful in stream processing and IoT environments. For example, maintaining a rolling average of PM2.5 and PM10 air quality readings from a network of low-power sensor nodes, or limiting API requests in a distributed backend (Token Bucket/Sliding Window Log algorithms)." },
        { tag: "p", text: "The technique converts a brute-force O(n·k) (recompute every window of size k from scratch) or O(n²) (try every possible window) into O(n), because each element enters the window exactly once and leaves it at most once — giving amortised O(1) work per index." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The problem mentions a 'contiguous subarray' or 'substring' with some constraint (sum, distinct characters, frequency)",
          "You need the longest/shortest/count of windows satisfying a condition",
          "The window size is either fixed (given directly) or naturally monotonic — once a window becomes invalid, shrinking from the left can only help, never hurt",
          "You're tracking a running aggregate (sum, count, frequency map) that can be updated incrementally rather than recomputed"
        ]},
        { tag: "table",
          headers: ["Window Type", "How it Moves", "Example Problems"],
          rows: [
            ["Fixed-size", "right and left both advance by 1 every step, width stays k", "Max sum subarray of size k, average of subarrays"],
            ["Variable-size (shrinkable)", "right always advances; left only advances while window is invalid/too-big", "Longest substring without repeats, min window substring"],
            ["Variable-size (counting)", "Count all valid windows rather than finding just one extremum", "Number of subarrays with sum exactly K"]
          ]
        }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "The right pointer always sweeps the full array once — there's no early exit, since the longest/shortest valid window could end at the very last index." },
          { tag: "ul", items: [
            "right traverses indices 0 to n − 1 exactly once — n steps",
            "left only ever moves forward, never backward, bounding its total movement across the whole algorithm by n",
            "Best case still requires reading every element at least once to confirm no better window exists later"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "This is the key amortised-analysis argument: although there appear to be two nested-looking pointers, neither pointer ever resets or moves backward, so the combined work across the entire run is linear, not quadratic." },
          { tag: "ul", items: [
            "right makes exactly n forward moves over the whole algorithm",
            "left makes at most n forward moves (it can never exceed right)",
            "Total pointer movements ≤ 2n → O(n)",
            "Per-step work (updating a sum or frequency map by one element) is O(1) amortised"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even in pathological cases — e.g. a string where every character is identical, forcing the window to repeatedly shrink — the total number of left-pointer moves across the entire algorithm is still bounded by n, because left cannot move past right." },
          { tag: "ul", items: [
            "Worst-case total iterations of the outer (right) loop: n",
            "Worst-case total iterations of the inner (left) shrink loop, summed across the whole run: ≤ n",
            "Combined: O(n) + O(n) = O(n), not O(n²) — this is the entire point of the amortised argument"
          ]},
          { tag: "note", variant: "warning", text: "A common implementation mistake is resetting or rescanning the window from scratch after every shrink — that turns the technique back into O(n²) and defeats its purpose." }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1) – O(k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "For numeric-sum windows (e.g. max sum subarray of size k), only the running sum and the two pointers are needed — no auxiliary collection." },
          { tag: "ul", items: [
            "left, right pointers — O(1)",
            "windowSum accumulator — O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(k) or O(Σ)" },
          { tag: "p", text: "When the window must track which elements it contains (distinct characters, frequency counts), a hash map or fixed-size array is needed, bounded by the window size k or the alphabet size Σ." },
          { tag: "ul", items: [
            "Frequency map holds at most min(window size, alphabet size) entries",
            "For ASCII/lowercase-letter problems this is effectively O(1) since Σ ≤ 26 or 128",
            "For arbitrary numeric arrays, the map can grow up to O(k)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(min(n, Σ))" },
          { tag: "p", text: "In the worst case the window grows to cover nearly the entire input before shrinking, so any per-element tracking structure can hold up to that many distinct entries." },
          { tag: "ul", items: [
            "Frequency/count map: up to min(n, alphabet size) entries",
            "Two pointers: O(1)",
            "No recursion — purely iterative"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Variable-size shrinkable window — 'Longest Substring Without Repeating Characters':" },
        { tag: "code", language: "text", text:
`function lengthOfLongestSubstring(str_s):
    seen   ← empty hash set
    left   ← 0
    best   ← 0

    for right from 0 to length(s) − 1:
        while str_s[right] is in seen:
            remove str_s[left] from seen
            left ← left + 1

        add str_s[right] to seen
        best ← max(best, right − left + 1)

    return best` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "right scans forward one character at a time, always trying to extend the current valid window.",
          "Before admitting str_s[right] into the window, check whether it already exists in the 'seen' set — which would create a duplicate.",
          "If a duplicate is found, shrink from the left: remove str_s[left] from the set and advance left. Repeat until the duplicate is gone.",
          "Once the window is valid again (no duplicates), add str_s[right] to the set.",
          "Update best if the current window length (right − left + 1) exceeds the previous best.",
          "Continue until right reaches the end of the string. Return best."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at the top of every outer-loop iteration, str_s[left..right−1] contains no duplicate characters. The inner while-loop restores this invariant whenever adding str_s[right] would violate it, by removing characters from the left until the conflict is resolved — and because left only ever moves forward, no valid window is ever skipped over." }
      ],

      codes: {
  "c++": `#include <iostream>
#include <string>
#include <unordered_set>
#include <algorithm>

using namespace std;

int lengthOfLongestSubstring(string s) {
    unordered_set<char> seen;
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < (int)s.length(); right++) {
        while (seen.count(s[right])) {
            seen.erase(s[left]);
            left++;
        }
        seen.insert(s[right]);
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

int main() {
    string s = "abcabcbb";
    cout << "Longest Substring Length: " << lengthOfLongestSubstring(s) << endl;
    return 0;
}`,

  "python": `def length_of_longest_substring(s: str) -> int:
    window_chars = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        while s[right] in window_chars:
            window_chars.remove(s[left])
            left += 1
            
        window_chars.add(s[right])
        max_length = max(max_length, right - left + 1)
        
    return max_length

if __name__ == "__main__":
    s = "abcabcbb"
    print(f"Longest Substring Length: {length_of_longest_substring(s)}")`,

  "java": `import java.util.HashSet;
import java.util.Set;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        Set<Character> seen = new HashSet<>();
        int left = 0;
        int maxLength = 0;
        
        for (int right = 0; right < s.length(); right++) {
            while (seen.contains(s.charAt(right))) {
                seen.remove(s.charAt(left));
                left++;
            }
            seen.add(s.charAt(right));
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }

    public static void main(String[] args) {
        String s = "abcabcbb";
        System.out.println("Longest Substring Length: " + lengthOfLongestSubstring(s));
    }
}`,

  "js": `function lengthOfLongestSubstring(s) {
    const seen = new Set();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < s.length; right++) {
        while (seen.has(s[right])) {
            seen.delete(s[left]);
            left++;
        }
        seen.add(s[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

const s = "abcabcbb";
console.log("Longest Substring Length:", lengthOfLongestSubstring(s));`,

  "c": `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* s) {
    int map[256] = {0};
    int left = 0, right = 0;
    int maxLength = 0;
    
    while (s[right] != '\\0') {
        while (map[(unsigned char)s[right]] > 0) {
            map[(unsigned char)s[left]]--;
            left++;
        }
        map[(unsigned char)s[right]]++;
        int currentLength = right - left + 1;
        if (currentLength > maxLength) maxLength = currentLength;
        right++;
    }
    return maxLength;
}

int main() {
    char s[] = "abcabcbb";
    printf("Longest Substring Length: %d\\n", lengthOfLongestSubstring(s));
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    public static int LengthOfLongestSubstring(string s) {
        HashSet<char> seen = new HashSet<char>();
        int left = 0, maxLength = 0;
        
        for (int right = 0; right < s.Length; right++) {
            while (seen.Contains(s[right])) {
                seen.Remove(s[left]);
                left++;
            }
            seen.Add(s[right]);
            maxLength = Math.Max(maxLength, right - left + 1);
        }
        return maxLength;
    }

    static void Main() {
        string s = "abcabcbb";
        Console.WriteLine($"Longest Substring Length: {LengthOfLongestSubstring(s)}");
    }
}`,

  "swift": `func lengthOfLongestSubstring(_ s: String) -> Int {
    var seen = Set<Character>()
    var left = s.startIndex
    var maxLength = 0
    
    for right in s.indices {
        while seen.contains(s[right]) {
            seen.remove(s[left])
            left = s.index(after: left)
        }
        seen.insert(s[right])
        let distance = s.distance(from: left, to: right) + 1
        maxLength = max(maxLength, distance)
    }
    return maxLength
}

let s = "abcabcbb"
print("Longest Substring Length: \\(lengthOfLongestSubstring(s))")`,

  "kotlin": `import kotlin.math.max

fun lengthOfLongestSubstring(s: String): Int {
    val seen = mutableSetOf<Char>()
    var left = 0
    var maxLength = 0
    
    for (right in s.indices) {
        while (seen.contains(s[right])) {
            seen.remove(s[left])
            left++
        }
        seen.add(s[right])
        maxLength = max(maxLength, right - left + 1)
    }
    return maxLength
}

fun main() {
    val s = "abcabcbb"
    println("Longest Substring Length: \${lengthOfLongestSubstring(s)}")
}`,

  "scala": `import scala.collection.mutable

object Main extends App {
    def lengthOfLongestSubstring(s: String): Int = {
        val seen = mutable.Set[Char]()
        var left = 0
        var maxLength = 0
        
        for (right <- 0 until s.length) {
            while (seen.contains(s(right))) {
                seen.remove(s(left))
                left += 1
            }
            seen.add(s(right))
            maxLength = math.max(maxLength, right - left + 1)
        }
        maxLength
    }

    val s = "abcabcbb"
    println(s"Longest Substring Length: \${lengthOfLongestSubstring(s)}")
}`,

  "go": `package main

import "fmt"

func lengthOfLongestSubstring(s string) int {
    seen := make(map[byte]bool)
    left := 0
    maxLength := 0
    
    for right := 0; right < len(s); right++ {
        for seen[s[right]] {
            delete(seen, s[left])
            left++
        }
        seen[s[right]] = true
        if right-left+1 > maxLength {
            maxLength = right - left + 1
        }
    }
    return maxLength
}

func main() {
    s := "abcabcbb"
    fmt.Printf("Longest Substring Length: %d\\n", lengthOfLongestSubstring(s))
}`,

  "rust": `use std::collections::HashSet;
use std::cmp;

fn length_of_longest_substring(s: String) -> i32 {
    let chars: Vec<char> = s.chars().collect();
    let mut seen = HashSet::new();
    let mut left = 0;
    let mut max_length = 0;
    
    for right in 0..chars.len() {
        while seen.contains(&chars[right]) {
            seen.remove(&chars[left]);
            left += 1;
        }
        seen.insert(chars[right]);
        max_length = cmp::max(max_length, right - left + 1);
    }
    max_length as i32
}

fn main() {
    let s = String::from("abcabcbb");
    println!("Longest Substring Length: {}", length_of_longest_substring(s));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. BOYER-MOORE MAJORITY VOTE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Boyer-Moore Majority",
      href: "/algorithms/arrays/boyer-moore",
      type: "Medium",

      about: [
        { tag: "h1", text: "Boyer-Moore Majority Vote Algorithm" },
        { tag: "p", text: "Boyer-Moore Majority Vote finds the majority element of an array — the element that appears more than ⌊n/2⌋ times — in a single linear pass using only O(1) extra space, with no hash map required. It was devised by Robert S. Boyer and J Strother Moore in 1981." },
        { tag: "p", text: "The intuition is a 'cancellation' game: keep a running candidate and a counter. Every time you see the candidate again, increment the counter; every time you see something else, decrement it. If the counter hits zero, discard the current candidate and adopt the new element as the candidate. Because the true majority element outnumbers every other element combined, it can never be fully cancelled out." },
        { tag: "p", text: "In distributed backend systems, finding consensus or leader election among nodes often utilizes variations of this logic. Identifying a strict majority allows systems to tolerate failures and continue functioning securely." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The problem guarantees a majority element exists (appears more than n/2 times)",
          "You need O(n) time and O(1) space — beats sorting (O(n log n)) and hash-map counting (O(n) space)",
          "Variant: 'Majority Element II' asks for elements appearing more than ⌊n/3⌋ times, solved with two candidates and two counters tracked simultaneously"
        ]},
        { tag: "note", variant: "warning", text: "Boyer-Moore only finds a candidate — if the problem does not guarantee a majority element exists, you must verify the candidate with a second pass that counts its actual occurrences." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "The algorithm always performs a single full pass through the array to determine the final candidate — there's no shortcut even if the first element happens to be the eventual majority element." },
          { tag: "ul", items: [
            "Initialise candidate = none, count = 0 — O(1)",
            "Iterate all n elements once, doing O(1) work per element",
            "No early exit: even a 'lucky' input still requires the full count mechanism to produce a verified candidate"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every element triggers exactly one comparison and one increment/decrement of the counter (or one candidate reassignment), regardless of the array's value distribution." },
          { tag: "ul", items: [
            "n iterations, O(1) work each: compare element to candidate, then ++count or --count or reassign",
            "Total: O(n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even with maximal candidate-switching (the count hits zero repeatedly), each switch is still O(1), so the total work stays linear." },
          { tag: "ul", items: [
            "If using the two-pass verified version: pass 1 finds the candidate (O(n)), pass 2 confirms its count (O(n))",
            "2 × O(n) = O(n) — constant factor does not change the asymptotic class",
            "Matches the Ω(n) lower bound since every element must be read at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only a candidate variable and an integer counter are maintained — no hash map of element frequencies is ever built." },
          { tag: "ul", items: [
            "candidate — O(1)",
            "count — O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Space usage is completely independent of how many distinct values appear or how often the candidate changes." },
          { tag: "ul", items: [
            "No auxiliary array, set, or map — a direct contrast with the hash-counting approach which needs O(n) space in the worst case"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even in the optional verification pass, only one more integer counter is added." },
          { tag: "ul", items: [
            "candidate, count, verificationCount — all O(1)",
            "Total auxiliary space stays O(1) regardless of n"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Phase 1 finds the surviving candidate; Phase 2 (optional) verifies it when a majority is not guaranteed." },
        { tag: "code", language: "text", text:
`function majorityElement(arr):
    candidate ← null
    count     ← 0

    // Phase 1: find a candidate via cancellation
    for x in arr:
        if count == 0:
            candidate ← x
            count ← 1
        else if x == candidate:
            count ← count + 1
        else:
            count ← count − 1

    // Phase 2 (optional — only needed when majority is not guaranteed):
    verifyCount ← 0
    for x in arr:
        if x == candidate:
            verifyCount ← verifyCount + 1
    if verifyCount > length(arr) / 2:
        return candidate
    else:
        return NO_MAJORITY_EXISTS` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise candidate = null and count = 0.",
          "For each element x: if count is 0, adopt x as the new candidate and set count = 1.",
          "If x matches the current candidate, increment count — x is 'voting' for it.",
          "If x does not match, decrement count — x cancels one vote for the candidate.",
          "After one full pass, the surviving candidate is the only element that could possibly be the majority.",
          "(Optional) Run a second pass to count how many times the candidate actually appears.",
          "If it appears more than n/2 times, return it. Otherwise, no true majority exists."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Think of it as pairing off a non-majority element with a majority element to mutually 'cancel'. Since the majority element occurs more than n/2 times, it cannot be fully cancelled out by all the remaining (fewer than n/2) elements combined — at least one uncancelled instance of the majority element must remain as the final candidate when the array is exhausted." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>

using namespace std;

int majorityElement(vector<int>& nums) {
    int candidate = 0;
    int count = 0;
    
    for (int i=0 ; i < nums.size() ; i++) {
        if (count == 0) {
            // Pick a new candidate when the count drops to 0
            candidate = nums[i];
        }
        // If the current number matches the candidate, increment the vote.
        // Otherwise, decrement the vote (cancelling it out).
        count += (nums[i] == candidate) ? 1 : -1;
    }
    
    return candidate;
}

int main() {
    vector<int> nums = {2, 2, 1, 1, 1, 2, 2};
    cout << "Majority Element: " << majorityElement(nums) << endl;
    return 0;
}`,
        "python": `def majority_element(nums):
    candidate = None
    count = 0
    
    for num in nums:
        if count == 0:
            candidate = num
            
        count += 1 if num == candidate else -1
        
    return candidate

if __name__ == "__main__":
    nums = [2, 2, 1, 1, 1, 2, 2]
    print(f"Majority Element: {majority_element(nums)}")`,
        "java": `public class Main {
    public static int majorityElement(int[] nums) {
        int candidate = 0;
        int count = 0;
        
        for (int num : nums) {
            if (count == 0) {
                candidate = num;
            }
            count += (num == candidate) ? 1 : -1;
        }
        
        return candidate;
    }

    public static void main(String[] args) {
        int[] nums = {2, 2, 1, 1, 1, 2, 2};
        System.out.println("Majority Element: " + majorityElement(nums));
    }
}`,
        "js": `function majorityElement(nums) {
    let candidate = null;
    let count = 0;
    
    for (const num of nums) {
        if (count === 0) {
            candidate = num;
        }
        count += (num === candidate) ? 1 : -1;
    }
    
    return candidate;
}

const nums = [2, 2, 1, 1, 1, 2, 2];
console.log("Majority Element:", majorityElement(nums));`,
        "c": `#include <stdio.h>

int majorityElement(int* nums, int numsSize) {
    int candidate = 0;
    int count = 0;
    
    for (int i = 0; i < numsSize; i++) {
        if (count == 0) {
            candidate = nums[i];
        }
        count += (nums[i] == candidate) ? 1 : -1;
    }
    
    return candidate;
}

int main() {
    int nums[] = {2, 2, 1, 1, 1, 2, 2};
    printf("Majority Element: %d\\n", majorityElement(nums, 7));
    return 0;
}`,
        "c#": `using System;

class Program {
    public static int MajorityElement(int[] nums) {
        int candidate = 0;
        int count = 0;
        
        foreach (int num in nums) {
            if (count == 0) {
                candidate = num;
            }
            count += (num == candidate) ? 1 : -1;
        }
        
        return candidate;
    }

    static void Main() {
        int[] nums = {2, 2, 1, 1, 1, 2, 2};
        Console.WriteLine($"Majority Element: {MajorityElement(nums)}");
    }
}`,
        "swift": `func majorityElement(_ nums: [Int]) -> Int {
    var candidate = 0
    var count = 0
    
    for num in nums {
        if count == 0 {
            candidate = num
        }
        count += (num == candidate) ? 1 : -1
    }
    
    return candidate
}

let nums = [2, 2, 1, 1, 1, 2, 2]
print("Majority Element: \\(majorityElement(nums))")`,
        "kotlin": `fun majorityElement(nums: IntArray): Int {
    var candidate = 0
    var count = 0
    
    for (num in nums) {
        if (count == 0) {
            candidate = num
        }
        count += if (num == candidate) 1 else -1
    }
    
    return candidate
}

fun main() {
    val nums = intArrayOf(2, 2, 1, 1, 1, 2, 2)
    println("Majority Element: \${majorityElement(nums)}")
}`,
        "scala": `object Main extends App {
    def majorityElement(nums: Array[Int]): Int = {
        var candidate = 0
        var count = 0
        
        for (num <- nums) {
            if (count == 0) candidate = num
            if (num == candidate) count += 1 else count -= 1
        }
        
        candidate
    }

    val nums = Array(2, 2, 1, 1, 1, 2, 2)
    println(s"Majority Element: \${majorityElement(nums)}")
}`,
        "go": `package main

import "fmt"

func majorityElement(nums []int) int {
    candidate := 0
    count := 0
    
    for _, num := range nums {
        if count == 0 {
            candidate = num
        }
        if num == candidate {
            count++
        } else {
            count--
        }
    }
    
    return candidate
}

func main() {
    nums := []int{2, 2, 1, 1, 1, 2, 2}
    fmt.Printf("Majority Element: %d\\n", majorityElement(nums))
}`,
        "rust": `fn majority_element(nums: Vec<i32>) -> i32 {
    let mut candidate = 0;
    let mut count = 0;
    
    for num in nums {
        if count == 0 {
            candidate = num;
        }
        if num == candidate { count += 1; } else { count -= 1; }
    }
    
    candidate
}

fn main() {
    let nums = vec![2, 2, 1, 1, 1, 2, 2];
    println!("Majority Element: {}", majority_element(nums));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       5. PREFIX SUM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Prefix Sum",
      href: "/algorithms/arrays/prefix-sum",
      type: "Easy",

      about: [
        { tag: "h1", text: "Prefix Sum" },
        { tag: "p", text: "A prefix sum array precomputes the cumulative sum of all elements up to each index, so that the sum of any contiguous range [i, j] of the original array can be answered in O(1) time afterward, instead of O(j − i) per query." },
        { tag: "p", text: "Formally, arr_prefix[i] = arr[0] + arr[1] + ... + arr[i−1] (with arr_prefix[0] = 0 by convention). The sum of the original range arr[i..j] inclusive is then simply arr_prefix[j+1] − arr_prefix[i] — a single subtraction." },
        { tag: "p", text: "Prefix sums are excellent for offline batch processing before transmission. If a sensor gateway logs offline data metrics and needs to query cumulative totals before dispatching them via long-range networks like LoRa, prefix sums reduce processing time to O(1) per query. It is also heavily used in 2D array analysis, such as validating move bounds or scoring regions on a grid-based game board." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need to answer many range-sum queries on a static (non-changing) array",
          "The problem involves 'subarray sum equals K' — pair with a hash map of prefix sums seen so far to find such subarrays in O(n)",
          "2D variant: precompute a 2D prefix sum to answer rectangle-sum queries in O(1)",
          "Difference-array variant: the same idea in reverse, used for efficient range-update operations"
        ]},
        { tag: "table",
          headers: ["Operation", "Without Prefix Sum", "With Prefix Sum"],
          rows: [
            ["Single range-sum query", "O(j − i)", "O(1) after O(n) preprocessing"],
            ["m range-sum queries", "O(m · n) worst case", "O(n + m)"],
            ["Subarray sum equals K (count)", "O(n²) brute force", "O(n) with hash map of running prefix sums"]
          ]
        },
        { tag: "note", variant: "tip", text: "'Subarray sum equals K' is really a Two Sum problem in disguise: you're looking for two prefix sums whose difference is K. A hash map tracking seen prefixes resolves it in O(n)." }
      ],

      timeComplexityCalculation: {
        notation: "O(n) build / O(1) query",
        best: [
          { tag: "h2", text: "Best Case — O(n) build, O(1) per query" },
          { tag: "p", text: "Building the prefix array always requires visiting every element once — there is no shortcut even for the simplest possible input — and once built, every query is answered with a single subtraction regardless of the range size." },
          { tag: "ul", items: [
            "Build loop: arr_prefix[i] = arr_prefix[i−1] + arr[i−1] for all i — Θ(n)",
            "Each query: arr_prefix[j+1] − arr_prefix[i] — O(1), always exactly one subtraction"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n) build, O(1) per query" },
          { tag: "p", text: "Build cost and per-query cost are both structurally fixed and don't depend on the values in the array, only on its length and the number of queries m." },
          { tag: "ul", items: [
            "Build: n additions, one per index — Θ(n)",
            "m queries × O(1) each = O(m)",
            "Total for n elements and m queries: O(n + m)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n) build, O(1) per query" },
          { tag: "p", text: "There is no input that makes arr_prefix-sum construction or querying slower than the bounds above — both are structurally guaranteed regardless of array contents." },
          { tag: "ul", items: [
            "Build remains Θ(n) in every case — a single linear scan with no conditional branching",
            "Query remains O(1) in every case — always exactly one subtraction",
            "Compare to brute force which is O(n) per query and O(nm) total — prefix sum wins decisively as m grows"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The prefix sum array itself must store one cumulative value per original element (plus one sentinel at index 0), so it always requires Θ(n) space, regardless of the values being summed." },
          { tag: "ul", items: [
            "prefix array of length n + 1 — Θ(n)",
            "No way to avoid this allocation if O(1) queries are required"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is identical for every input of a given length n — it's purely a function of array length, not content." },
          { tag: "ul", items: [
            "1 array of n+1 integers — Θ(n)",
            "Optional hash map for the 'subarray sum = K' variant adds up to O(n) more in the worst case"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input increases the space beyond the fixed prefix array." },
          { tag: "ul", items: [
            "1D prefix sum: O(n)",
            "2D prefix sum: O(rows × cols)",
            "Can be reduced to O(1) extra space if you're allowed to overwrite the input array in place"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Build the prefix array once in O(n), then answer any range-sum query in O(1):" },
        { tag: "code", language: "text", text:
`function buildPrefixSum(arr):
    n ← length(arr)
    arr_prefix ← array of size n + 1, all zero
    for i from 1 to n:
        arr_prefix[i] ← arr_prefix[i − 1] + arr[i − 1]
    return arr_prefix

function rangeSum(arr_prefix, i, j):        // inclusive range [i, j] over original arr
    return arr_prefix[j + 1] − arr_prefix[i]` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Allocate a prefix array of size n + 1 and set arr_prefix[0] = 0 — this sentinel represents 'sum of zero elements', avoiding off-by-one issues.",
          "For each index i from 1 to n, compute arr_prefix[i] = arr_prefix[i-1] + arr[i-1]. This accumulates the running total.",
          "To query the inclusive range [i, j], compute arr_prefix[j+1] − arr_prefix[i].",
          "arr_prefix[j+1] holds the sum of arr[0..j] (everything up to and including j).",
          "arr_prefix[i] holds the sum of arr[0..i-1] (everything before i).",
          "Subtracting removes the unwanted arr_prefix, leaving exactly arr[i..j]."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "By definition, arr_prefix[k] = Σ(arr[0..k-1]). The sum of arr[i..j] is Σ(arr[0..j]) − Σ(arr[0..i-1]) = arr_prefix[j+1] − arr_prefix[i]. This is just basic algebra on cumulative sums — the prefix array is built once in O(n) so that every subsequent query is a single subtraction instead of a fresh O(range length) loop." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>

using namespace std;

// Build phase: O(n) Time, O(n) Space
vector<int> buildPrefixSum(const vector<int>& nums) {
    vector<int> arr_prefix(nums.size() + 1, 0);
    for (size_t i = 0; i < nums.size(); i++) {
        arr_prefix[i + 1] = arr_prefix[i] + nums[i];
    }
    return arr_prefix;
}

// Query phase: O(1) Time
int sumRange(const vector<int>& arr_prefix, int left, int right) {
    return arr_prefix[right + 1] - arr_prefix[left];
}

int main() {
    vector<int> nums = {-2, 0, 3, -5, 2, -1};
    vector<int> arr_prefix = buildPrefixSum(nums);
    
    cout << "Sum [0, 2]: " << sumRange(arr_prefix, 0, 2) << endl;
    cout << "Sum [2, 5]: " << sumRange(arr_prefix, 2, 5) << endl;
    cout << "Sum [0, 5]: " << sumRange(arr_prefix, 0, 5) << endl;
    
    return 0;
}`,

        "python": `def build_prefix_sum(nums):
    arr_prefix = [0] * (len(nums) + 1)
    for i in range(len(nums)):
        arr_prefix[i + 1] = arr_prefix[i] + nums[i]
    return arr_prefix

def sum_range(arr_prefix, left: int, right: int) -> int:
    return arr_prefix[right + 1] - arr_prefix[left]

if __name__ == "__main__":
    nums = [-2, 0, 3, -5, 2, -1]
    arr_prefix = build_prefix_sum(nums)
    
    print(f"Sum [0, 2]: {sum_range(arr_prefix, 0, 2)}")
    print(f"Sum [2, 5]: {sum_range(arr_prefix, 2, 5)}")`,

        "java": `public class Main {
    public static int[] buildPrefixSum(int[] nums) {
        int[] arr_prefix = new int[nums.length + 1];
        for (int i = 0; i < nums.length; i++) {
            arr_prefix[i + 1] = arr_prefix[i] + nums[i];
        }
        return arr_prefix;
    }

    public static int sumRange(int[] arr_prefix, int left, int right) {
        return arr_prefix[right + 1] - arr_prefix[left];
    }

    public static void main(String[] args) {
        int[] nums = {-2, 0, 3, -5, 2, -1};
        int[] arr_prefix = buildPrefixSum(nums);
        
        System.out.println("Sum [0, 2]: " + sumRange(arr_prefix, 0, 2));
        System.out.println("Sum [2, 5]: " + sumRange(arr_prefix, 2, 5));
    }
}`,

        "js": `function buildPrefixSum(nums) {
    const arr_prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i < nums.length; i++) {
        arr_prefix[i + 1] = arr_prefix[i] + nums[i];
    }
    return arr_prefix;
}

function sumRange(arr_prefix, left, right) {
    return arr_prefix[right + 1] - arr_prefix[left];
}

const nums = [-2, 0, 3, -5, 2, -1];
const arr_prefix = buildPrefixSum(nums);

console.log("Sum [0, 2]:", sumRange(arr_prefix, 0, 2));
console.log("Sum [2, 5]:", sumRange(arr_prefix, 2, 5));`,

        "c": `#include <stdio.h>
#include <stdlib.h>

int* buildPrefixSum(int* nums, int numsSize) {
    int* arr_prefix = (int*)malloc((numsSize + 1) * sizeof(int));
    arr_prefix[0] = 0;
    for (int i = 0; i < numsSize; i++) {
        arr_prefix[i + 1] = arr_prefix[i] + nums[i];
    }
    return arr_prefix;
}

int sumRange(int* arr_prefix, int left, int right) {
    return arr_prefix[right + 1] - arr_prefix[left];
}

int main() {
    int nums[] = {-2, 0, 3, -5, 2, -1};
    int* arr_prefix = buildPrefixSum(nums, 6);
    
    printf("Sum [0, 2]: %d\\n", sumRange(arr_prefix, 0, 2));
    printf("Sum [2, 5]: %d\\n", sumRange(arr_prefix, 2, 5));
    
    free(arr_prefix);
    return 0;
}`,

        "c#": `using System;

class Program {
    static int[] BuildPrefixSum(int[] nums) {
        int[] arr_prefix = new int[nums.Length + 1];
        for (int i = 0; i < nums.Length; i++) {
            arr_prefix[i + 1] = arr_prefix[i] + nums[i];
        }
        return arr_prefix;
    }

    static int SumRange(int[] arr_prefix, int left, int right) {
        return arr_prefix[right + 1] - arr_prefix[left];
    }

    static void Main() {
        int[] nums = {-2, 0, 3, -5, 2, -1};
        int[] arr_prefix = BuildPrefixSum(nums);
        
        Console.WriteLine($"Sum [0, 2]: {SumRange(arr_prefix, 0, 2)}");
        Console.WriteLine($"Sum [2, 5]: {SumRange(arr_prefix, 2, 5)}");
    }
}`,

        "swift": `func buildPrefixSum(_ nums: [Int]) -> [Int] {
    var arr_prefix = Array(repeating: 0, count: nums.count + 1)
    for i in 0..<nums.count {
        arr_prefix[i + 1] = arr_prefix[i] + nums[i]
    }
    return arr_prefix
}

func sumRange(_ arr_prefix: [Int], _ left: Int, _ right: Int) -> Int {
    return arr_prefix[right + 1] - arr_prefix[left]
}

let nums = [-2, 0, 3, -5, 2, -1]
let arr_prefix = buildPrefixSum(nums)

print("Sum [0, 2]: \\(sumRange(arr_prefix, 0, 2))")
print("Sum [2, 5]: \\(sumRange(arr_prefix, 2, 5))")`,

        "kotlin": `fun buildPrefixSum(nums: IntArray): IntArray {
    val arr_prefix = IntArray(nums.size + 1)
    for (i in nums.indices) {
        arr_prefix[i + 1] = arr_prefix[i] + nums[i]
    }
    return arr_prefix
}

fun sumRange(arr_prefix: IntArray, left: Int, right: Int): Int {
    return arr_prefix[right + 1] - arr_prefix[left]
}

fun main() {
    val nums = intArrayOf(-2, 0, 3, -5, 2, -1)
    val arr_prefix = buildPrefixSum(nums)
    
    println("Sum [0, 2]: \${sumRange(arr_prefix, 0, 2)}")
    println("Sum [2, 5]: \${sumRange(arr_prefix, 2, 5)}")
}`,

        "scala": `object Main extends App {
    def buildPrefixSum(nums: Array[Int]): Array[Int] = {
        val arr_prefix = new Array[Int](nums.length + 1)
        for (i <- nums.indices) {
            arr_prefix(i + 1) = arr_prefix(i) + nums(i)
        }
        arr_prefix
    }

    def sumRange(arr_prefix: Array[Int], left: Int, right: Int): Int = {
        arr_prefix(right + 1) - arr_prefix(left)
    }

    val nums = Array(-2, 0, 3, -5, 2, -1)
    val arr_prefix = buildPrefixSum(nums)
    
    println(s"Sum [0, 2]: \${sumRange(arr_prefix, 0, 2)}")
    println(s"Sum [2, 5]: \${sumRange(arr_prefix, 2, 5)}")
}`,

        "go": `package main

import "fmt"

func buildPrefixSum(nums []int) []int {
    arr_prefix := make([]int, len(nums)+1)
    for i := 0; i < len(nums); i++ {
        arr_prefix[i+1] = arr_prefix[i] + nums[i]
    }
    return arr_prefix
}

func sumRange(arr_prefix []int, left int, right int) int {
    return arr_prefix[right+1] - arr_prefix[left]
}

func main() {
    nums := []int{-2, 0, 3, -5, 2, -1}
    arr_prefix := buildPrefixSum(nums)
    
    fmt.Printf("Sum [0, 2]: %d\\n", sumRange(arr_prefix, 0, 2))
    fmt.Printf("Sum [2, 5]: %d\\n", sumRange(arr_prefix, 2, 5))
}`,

        "rust": `fn build_prefix_sum(nums: &[i32]) -> Vec<i32> {
    let mut arr_prefix = vec![0; nums.len() + 1];
    for i in 0..nums.len() {
        arr_prefix[i + 1] = arr_prefix[i] + nums[i];
    }
    arr_prefix
}

fn sum_range(arr_prefix: &[i32], left: usize, right: usize) -> i32 {
    arr_prefix[right + 1] - arr_prefix[left]
}

fn main() {
    let nums = vec![-2, 0, 3, -5, 2, -1];
    let arr_prefix = build_prefix_sum(&nums);
    
    println!("Sum [0, 2]: {}", sum_range(&arr_prefix, 0, 2));
    println!("Sum [2, 5]: {}", sum_range(&arr_prefix, 2, 5));
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       6. DUTCH NATIONAL FLAG
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Dutch National Flag",
      href: "/algorithms/arrays/dutch-national-flag",
      type: "Medium",

      about: [
        { tag: "h1", text: "Dutch National Flag Algorithm" },
        { tag: "p", text: "The Dutch National Flag algorithm partitions an array into three contiguous regions — elements less than a pivot, elements equal to the pivot, and elements greater than the pivot — in a single linear pass with O(1) extra space. It was proposed by Edsger Dijkstra, named after the three horizontal bands (red, white, blue) of the Dutch flag, which is exactly the three-way grouping the algorithm produces." },
        { tag: "p", text: "It uses three pointers: left marks the boundary of the 'less than' region, mid scans the unclassified region, and right marks the boundary of the 'greater than' region. Each element is examined once and placed into its correct region via constant-time swaps." },
        { tag: "p", text: "In right-throughput microservices, minimizing memory allocations is vital. By sorting or categorizing priority states (e.g., routing urgent, normal, and left priority data packets) strictly in-place, this algorithm prevents garbage collection spikes and minimizes overall application footprint." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The classic application: 'Sort Colors' — sort an array of 0s, 1s, and 2s in place in one pass",
          "Any 3-way partitioning problem: partition around a pivot for quicksort with many duplicate keys (3-way quicksort avoids O(n²) degeneration on arrays with many equal elements)",
          "You need O(n) time and O(1) space, and a full sort (O(n log n)) would be wasteful for only 3 distinct categories"
        ]},
        { tag: "table",
          headers: ["Pointer", "Meaning", "Invariant"],
          rows: [
            ["left", "Next position to place a 'less than pivot' element", "arr[0 .. left-1] are all < pivot"],
            ["mid", "Current element being classified", "arr[left .. mid-1] are all == pivot"],
            ["right", "Next position (from the right) to place a 'greater than pivot' element", "arr[right+1 .. n-1] are all > pivot"]
          ]
        },
        { tag: "note", variant: "tip", text: "The region arr[mid .. right] is always 'unclassified' — the algorithm's entire job is to shrink that middle region to nothing while maintaining the three sorted bands around it." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Even if the array is already perfectly partitioned, mid must still scan from 0 to right to confirm every element is correctly classified — there is no way to verify a 3-way partition without examining every element." },
          { tag: "ul", items: [
            "mid scans from index 0 toward right — every position is visited exactly once",
            "Each visit does O(1) classification work (one comparison, possibly one swap)",
            "Best case is still Θ(n) because correctness requires inspecting every element at least once"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Unlike a swap-based algorithm where some swaps could 'undo' progress, this algorithm guarantees mid always moves forward except in exactly one case (swap with right), so total work stays linear regardless of the distribution of the three values." },
          { tag: "ul", items: [
            "mid increments after every comparison except when swapping with right (in which case mid stays to re-examine the newly swapped-in element)",
            "left only ever increases, right only ever decreases — together they bound the total number of swaps to at most n",
            "Combined iteration + swap work: O(n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even in the worst arrangement (e.g. the array sorted in exactly the opposite order needed, like all 2s first, then 1s, then 0s) the total work is still bounded by n, because every element is moved at most a constant number of times before settling into its final region." },
          { tag: "ul", items: [
            "mid traverses at most n positions total",
            "Each element is swapped at most once into its final resting region",
            "Total operations bounded by a small constant multiple of n → O(n), matching the Ω(n) lower bound"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "All partitioning happens in-place via swaps within the original array — only three integer pointers are needed." },
          { tag: "ul", items: [
            "left, mid, right — three O(1) integer pointers",
            "one temporary variable used during swap — O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never grows with n — it is always exactly three pointers and a swap temporary, regardless of how the 0/1/2 (or pivot-relative) values are distributed." },
          { tag: "ul", items: [
            "No auxiliary array is ever allocated, unlike a counting-sort-based 3-way partition which would need O(k) extra space for counts"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input increases the auxiliary footprint beyond the fixed three pointers — this holds even for the maximally 'scrambled' input that requires the most swaps." },
          { tag: "ul", items: [
            "left, mid, right, temp — 4 scalars total, O(1)",
            "In-place sorting means the output uses the same memory as the input — no separate result array"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Classic 'Sort Colors' formulation: partition an array of 0s, 1s, and 2s in place." },
        { tag: "code", language: "text", text:
`function sortColors(arr):
    left  ← 0
    mid  ← 0
    right ← length(arr) − 1

    while mid <= right:
        if arr[mid] == 0:
            swap(arr[left], arr[mid])
            left ← left + 1
            mid ← mid + 1
        else if arr[mid] == 1:
            mid ← mid + 1
        else:                              // arr[mid] == 2
            swap(arr[mid], arr[right])
            right ← right − 1
            // mid is NOT incremented here —
            // the newly swapped-in element must still be classified` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise left = 0, mid = 0, right = n − 1.",
          "Loop while mid ≤ right — any elements from mid to right are still unclassified.",
          "Case arr[mid] == 0: swap arr[left] with arr[mid]. The element now at mid came from the boundary of the classified region and is known to be a 1, so it's safe to advance both left and mid.",
          "Case arr[mid] == 1: it's already in the correct middle region. Simply advance mid.",
          "Case arr[mid] == 2: swap arr[mid] with arr[right] and decrement right. Do NOT advance mid — the element just brought from the right end is unknown and must be re-examined next iteration.",
          "When mid > right, the unclassified region is empty. All three invariants hold simultaneously: the array is fully partitioned into [0s][1s][2s]."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Three loop invariants are maintained at all times: arr[0..left-1] are all 0, arr[left..mid-1] are all 1, and arr[right+1..n-1] are all 2. The region arr[mid..right] is always unclassified. Every iteration either shrinks the unclassified region from the left (0 or 1 case) or from the right (2 case), and the loop terminates exactly when the unclassified region is empty (mid > right), at which point the three invariants together describe a fully sorted three-way partition." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

void sortColors(vector<int>& nums) {
    int left = 0;
    int mid = 0;
    int right = nums.size() - 1;
    
    while (mid <= right) {
        if (nums[mid] == 0) {
            // Swap 0 to the front and advance both pointers.
            swap(nums[left], nums[mid]);
            left++;
            mid++;
        } else if (nums[mid] == 1) {
            // 1 is already in the correct middle location.
            mid++;
        } else {
            // Swap 2 to the back. Crucially, do NOT advance mid here,
            // because the element we just pulled from 'right' into 'mid'
            // has not been evaluated yet.
            swap(nums[mid], nums[right]);
            right--;
        }
    }
}

int main() {
    vector<int> nums = {2, 0, 2, 1, 1, 0};
    sortColors(nums);
    
    cout << "Sorted Array: ";
    for (int num : nums) cout << num << " ";
    cout << endl;
    
    return 0;
}`,
        "python": `def sort_colors(nums):
    left, mid, right = 0, 0, len(nums) - 1
    
    while mid <= right:
        if nums[mid] == 0:
            nums[left], nums[mid] = nums[mid], nums[left]
            left += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[right] = nums[right], nums[mid]
            right -= 1

if __name__ == "__main__":
    nums = [2, 0, 2, 1, 1, 0]
    sort_colors(nums)
    print(f"Sorted Array: {nums}")`,
        "java": `import java.util.Arrays;

public class Main {
    public static void sortColors(int[] nums) {
        int left = 0;
        int mid = 0;
        int right = nums.length - 1;
        
        while (mid <= right) {
            if (nums[mid] == 0) {
                int temp = nums[left];
                nums[left] = nums[mid];
                nums[mid] = temp;
                left++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[mid];
                nums[mid] = nums[right];
                nums[right] = temp;
                right--;
            }
        }
    }

    public static void main(String[] args) {
        int[] nums = {2, 0, 2, 1, 1, 0};
        sortColors(nums);
        System.out.println("Sorted Array: " + Arrays.toString(nums));
    }
}`,
        "js": `function sortColors(nums) {
    let left = 0;
    let mid = 0;
    let right = nums.length - 1;
    
    while (mid <= right) {
        if (nums[mid] === 0) {
            [nums[left], nums[mid]] = [nums[mid], nums[left]];
            left++;
            mid++;
        } else if (nums[mid] === 1) {
            mid++;
        } else {
            [nums[mid], nums[right]] = [nums[right], nums[mid]];
            right--;
        }
    }
}

const nums = [2, 0, 2, 1, 1, 0];
sortColors(nums);
console.log("Sorted Array:", nums);`,
        "c": `#include <stdio.h>

void swap(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

void sortColors(int* nums, int numsSize) {
    int left = 0;
    int mid = 0;
    int right = numsSize - 1;
    
    while (mid <= right) {
        if (nums[mid] == 0) {
            swap(&nums[left], &nums[mid]);
            left++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            swap(&nums[mid], &nums[right]);
            right--;
        }
    }
}

int main() {
    int nums[] = {2, 0, 2, 1, 1, 0};
    sortColors(nums, 6);
    
    printf("Sorted Array: ");
    for (int i = 0; i < 6; i++) printf("%d ", nums[i]);
    printf("\\n");
    return 0;
}`,
        "c#": `using System;

class Program {
    public static void SortColors(int[] nums) {
        int left = 0;
        int mid = 0;
        int right = nums.Length - 1;
        
        while (mid <= right) {
            if (nums[mid] == 0) {
                int temp = nums[left];
                nums[left] = nums[mid];
                nums[mid] = temp;
                left++;
                mid++;
            } else if (nums[mid] == 1) {
                mid++;
            } else {
                int temp = nums[mid];
                nums[mid] = nums[right];
                nums[right] = temp;
                right--;
            }
        }
    }

    static void Main() {
        int[] nums = {2, 0, 2, 1, 1, 0};
        SortColors(nums);
        Console.WriteLine("Sorted Array: [" + string.Join(", ", nums) + "]");
    }
}`,
        "swift": `func sortColors(_ nums: inout [Int]) {
    var left = 0
    var mid = 0
    var right = nums.count - 1
    
    while mid <= right {
        if nums[mid] == 0 {
            nums.swapAt(left, mid)
            left += 1
            mid += 1
        } else if nums[mid] == 1 {
            mid += 1
        } else {
            nums.swapAt(mid, right)
            right -= 1
        }
    }
}

var nums = [2, 0, 2, 1, 1, 0]
sortColors(&nums)
print("Sorted Array: \\(nums)")`,
        "kotlin": `fun sortColors(nums: IntArray) {
    var left = 0
    var mid = 0
    var right = nums.size - 1
    
    while (mid <= right) {
        when (nums[mid]) {
            0 -> {
                val temp = nums[left]
                nums[left] = nums[mid]
                nums[mid] = temp
                left++
                mid++
            }
            1 -> mid++
            2 -> {
                val temp = nums[mid]
                nums[mid] = nums[right]
                nums[right] = temp
                right--
            }
        }
    }
}

fun main() {
    val nums = intArrayOf(2, 0, 2, 1, 1, 0)
    sortColors(nums)
    println("Sorted Array: \${nums.joinToString(", ")}")
}`,
        "scala": `object Main extends App {
    def sortColors(nums: Array[Int]): Unit = {
        var left = 0
        var mid = 0
        var right = nums.length - 1
        
        while (mid <= right) {
            if (nums(mid) == 0) {
                val temp = nums(left)
                nums(left) = nums(mid)
                nums(mid) = temp
                left += 1
                mid += 1
            } else if (nums(mid) == 1) {
                mid += 1
            } else {
                val temp = nums(mid)
                nums(mid) = nums(right)
                nums(right) = temp
                right -= 1
            }
        }
    }

    val nums = Array(2, 0, 2, 1, 1, 0)
    sortColors(nums)
    println(s"Sorted Array: \${nums.mkString(", ")}")
}`,
        "go": `package main

import "fmt"

func sortColors(nums []int) {
    left, mid, right := 0, 0, len(nums)-1
    
    for mid <= right {
        if nums[mid] == 0 {
            nums[left], nums[mid] = nums[mid], nums[left]
            left++
            mid++
        } else if nums[mid] == 1 {
            mid++
        } else {
            nums[mid], nums[right] = nums[right], nums[mid]
            right--
        }
    }
}

func main() {
    nums := []int{2, 0, 2, 1, 1, 0}
    sortColors(nums)
    fmt.Printf("Sorted Array: %v\\n", nums)
}`,
        "rust": `fn sort_colors(nums: &mut Vec<i32>) {
    let mut left = 0usize;
    let mut mid = 0usize;
    let mut right = nums.len() - 1;
    
    while mid <= right {
        if nums[mid] == 0 {
            nums.swap(left, mid);
            left += 1;
            mid += 1;
        } else if nums[mid] == 1 {
            mid += 1;
        } else {
            nums.swap(mid, right);
            if right == 0 { break; }
            right -= 1;
        }
    }
}

fn main() {
    let mut nums = vec![2, 0, 2, 1, 1, 0];
    sort_colors(&mut nums);
    println!("Sorted Array: {:?}", nums);
}`
      }
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const SORTING_SECTION = {
  name: "Sorting",
  href: "/algorithms/sorting",
  about: [
    { tag: "h1", text: "Sorting" },
    { tag: "p", text: "Sorting rearranges a collection into a defined order — usually ascending or descending — and is one of the most heavily studied problems in computer science because so many other algorithms (binary search, two pointers, greedy interval scheduling, deduplication) assume sorted input as a precondition." },
    { tag: "p", text: "No single sorting algorithm dominates every situation. The right choice depends on data size, whether the data is mostly sorted already, whether stability matters (equal elements keeping their relative order), memory constraints, and whether the keys are general comparables or small bounded integers that allow non-comparison-based sorting." },
    { tag: "h2", text: "Comparison-based vs. non-comparison-based" },
    { tag: "p", text: "Comparison sorts (bubble, insertion, selection, merge, quick, heap, Timsort, Shell, Introsort) only ever ask 'is A less than B?' and are bounded below by Ω(n log n) — no comparison sort can beat that in the worst case, a fact provable via decision-tree counting arguments. Non-comparison sorts (counting, radix, bucket) sidestep this bound entirely by exploiting structural knowledge of the keys (bounded integer range, fixed digit width, uniform distribution), achieving linear O(n) or O(n + k) time at the cost of restricting the kinds of keys they can sort." },
    { tag: "h2", text: "Quick-reference comparison" },
    { tag: "table",
      headers: ["Algorithm", "Best", "Average", "Worst", "Space", "Stable?"],
      rows: [
        ["Bubble Sort", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
        ["Selection Sort", "O(n²)", "O(n²)", "O(n²)", "O(1)", "No"],
        ["Insertion Sort", "O(n)", "O(n²)", "O(n²)", "O(1)", "Yes"],
        ["Shell Sort", "O(n log n)", "O(n log² n)", "O(n²)", "O(1)", "No"],
        ["Merge Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
        ["Quick Sort", "O(n log n)", "O(n log n)", "O(n²)", "O(log n)", "No"],
        ["Heap Sort", "O(n log n)", "O(n log n)", "O(n log n)", "O(1)", "No"],
        ["Timsort", "O(n)", "O(n log n)", "O(n log n)", "O(n)", "Yes"],
        ["Introsort", "O(n log n)", "O(n log n)", "O(n log n)", "O(log n)", "No"],
        ["Counting Sort", "O(n + k)", "O(n + k)", "O(n + k)", "O(k)", "Yes"],
        ["Radix Sort", "O(d(n + k))", "O(d(n + k))", "O(d(n + k))", "O(n + k)", "Yes"],
        ["Bucket Sort", "O(n + k)", "O(n + k)", "O(n²)", "O(n + k)", "Yes"]
      ]
    },
    { tag: "note", variant: "tip", text: "When the keys are small bounded integers (e.g. sorting exam scores 0–100, or single bytes), counting or radix sort will outperform any comparison sort by skipping the n log n lower bound entirely." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. BUBBLE SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Bubble Sort",
      href: "/algorithms/sorting/bubble-sort",
      type: "Easy",

      about: [
        { tag: "h1", text: "Bubble Sort" },
        { tag: "p", text: "Bubble Sort repeatedly steps through the array, comparing each pair of adjacent elements and swapping them if they're in the wrong order. Larger elements 'bubble up' toward the end of the array on each pass, exactly like air bubbles rising through water — hence the name." },
        { tag: "p", text: "It is rarely used in production code due to its O(n²) average and worst-case time, but it remains pedagogically valuable as the simplest possible sorting algorithm to reason about, and the optimised version (with an early-exit flag) actually achieves O(n) on already-sorted input, which is faster in that one specific case than several 'better' algorithms." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable — equal elements never cross each other since swaps only happen on strict inequality",
          "In-place — O(1) auxiliary space",
          "Adaptive (with the early-exit optimisation) — finishes in O(n) if no swaps occur in a full pass",
          "Each full pass guarantees the largest unsorted element reaches its final position"
        ]},
        { tag: "note", variant: "info", text: "Use it only for teaching, for verifying a tiny array by hand, or when code simplicity matters far more than runtime on inputs of trivial size." }
      ],

      timeComplexityCalculation: {
        notation: "O(n²)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Achieved only with the early-exit optimisation, on an already-sorted array: a single pass makes zero swaps, the 'swapped' flag stays false, and the algorithm terminates immediately." },
          { tag: "ul", items: [
            "One pass of n − 1 comparisons is still required to confirm the array is sorted — Θ(n)",
            "Zero swaps occur",
            "Without the early-exit flag, the naive version always runs all n − 1 passes regardless of input, giving O(n²) even in the best case"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n²)" },
          { tag: "p", text: "For a randomly ordered array, roughly half of all adjacent pairs are initially out of order, and the algorithm needs close to the full n − 1 passes to fully sort, each pass comparing roughly the remaining unsorted length." },
          { tag: "ul", items: [
            "Pass i compares (n − i) adjacent pairs",
            "Total comparisons ≈ (n−1) + (n−2) + ... + 1 = n(n−1)/2",
            "n(n−1)/2 simplifies to O(n²)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          { tag: "p", text: "The worst case is a reverse-sorted array: every single adjacent pair is out of order on every pass, forcing the maximum possible number of comparisons and swaps." },
          { tag: "ul", items: [
            "Full n − 1 passes are required, each shrinking the unsorted region by exactly one element",
            "Total comparisons: n(n−1)/2 → O(n²)",
            "Total swaps also reach the same Θ(n²) bound, since every comparison in this case triggers a swap"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Sorting happens entirely in-place on the original array; only a loop counter and a temporary swap variable are needed." },
          { tag: "ul", items: ["Loop indices i, j — O(1)", "One temp variable for swapping — O(1)", "Boolean swapped flag — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "No auxiliary array is ever created — memory usage is identical regardless of input distribution." },
          { tag: "ul", items: ["Same fixed handful of scalars as best case, independent of n"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even maximal swapping doesn't allocate new memory — swaps happen in-place within the existing array." },
          { tag: "ul", items: ["No recursion, no auxiliary structures — space stays O(1) regardless of swap count"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function bubbleSort(arr):
    n ← length(arr)
    for i from 0 to n − 2:
        swapped ← false
        for j from 0 to n − i − 2:
            if arr[j] > arr[j + 1]:
                swap(arr[j], arr[j + 1])
                swapped ← true
        if not swapped:
            break              // already sorted — early exit
    return arr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Outer loop runs up to n − 1 times, one per guaranteed 'placement' of the next-largest element.",
          "Inner loop scans the still-unsorted prefix, comparing each adjacent pair.",
          "Whenever a pair is out of order, swap them — this pushes the larger value one step closer to its final sorted position.",
          "The inner loop's upper bound shrinks by one each outer iteration (n − i − 2), since the last i elements are already known to be sorted in place.",
          "If an entire inner pass completes with zero swaps, the array is already sorted — exit early."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: after the i-th outer iteration, the i largest elements are in their correct final positions at the end of the array. Each inner pass guarantees the current maximum of the unsorted region 'bubbles' all the way to the right because every adjacent out-of-order pair it encounters gets swapped. By induction, after n − 1 passes the entire array is sorted." }
      ]
,
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    vector<int> arr = {64, 34, 25, 12, 22, 11, 90};
    bubbleSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break

if __name__ == "__main__":
    arr = [64, 34, 25, 12, 22, 11, 90]
    bubble_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        bubbleSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}

const arr = [64, 34, 25, 12, 22, 11, 90];
bubbleSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>

void bubbleSort(int* arr, int n) {
    for (int i = 0; i < n - 1; i++) {
        int swapped = 0;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
                swapped = 1;
            }
        }
        if (!swapped) break;
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void BubbleSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++) {
            bool swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    static void Main() {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        BubbleSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func bubbleSort(_ arr: inout [Int]) {
    let n = arr.count
    for i in 0..<n - 1 {
        var swapped = false
        for j in 0..<n - i - 1 {
            if arr[j] > arr[j + 1] {
                arr.swapAt(j, j + 1)
                swapped = true
            }
        }
        if !swapped { break }
    }
}

var arr = [64, 34, 25, 12, 22, 11, 90]
bubbleSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `fun bubbleSort(arr: IntArray) {
    val n = arr.size
    for (i in 0 until n - 1) {
        var swapped = false
        for (j in 0 until n - i - 1) {
            if (arr[j] > arr[j + 1]) {
                val temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
                swapped = true
            }
        }
        if (!swapped) break
    }
}

fun main() {
    val arr = intArrayOf(64, 34, 25, 12, 22, 11, 90)
    bubbleSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def bubbleSort(arr: Array[Int]): Unit = {
        val n = arr.length
        var i = 0
        while (i < n - 1) {
            var swapped = false
            for (j <- 0 until n - i - 1) {
                if (arr(j) > arr(j + 1)) {
                    val temp = arr(j)
                    arr(j) = arr(j + 1)
                    arr(j + 1) = temp
                    swapped = true
                }
            }
            if (!swapped) i = n
            else i += 1
        }
    }

    val arr = Array(64, 34, 25, 12, 22, 11, 90)
    bubbleSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func bubbleSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        swapped := false
        for j := 0; j < n-i-1; j++ {
            if arr[j] > arr[j+1] {
                arr[j], arr[j+1] = arr[j+1], arr[j]
                swapped = true
            }
        }
        if !swapped {
            break
        }
    }
}

func main() {
    arr := []int{64, 34, 25, 12, 22, 11, 90}
    bubbleSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn bubble_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in 0..n - 1 {
        let mut swapped = false;
        for j in 0..n - i - 1 {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
                swapped = true;
            }
        }
        if !swapped { break; }
    }
}

fn main() {
    let mut arr = vec![64, 34, 25, 12, 22, 11, 90];
    bubble_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. MERGE SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Merge Sort",
      href: "/algorithms/sorting/merge-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Merge Sort" },
        { tag: "p", text: "Merge Sort is a divide-and-conquer algorithm invented by John von Neumann in 1945. It recursively splits the array in half until each piece has one element (trivially sorted), then repeatedly merges sorted halves back together into larger and larger sorted runs until the whole array is sorted." },
        { tag: "p", text: "Its defining strength is a guaranteed O(n log n) bound in every case — best, average, and worst — making it the algorithm of choice whenever predictable performance matters more than average-case speed, and it's the classic example used to teach the Master Theorem for analysing recursive algorithms." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable — the merge step takes from the left run on ties, preserving original relative order",
          "Not in-place — requires O(n) auxiliary space for the merge buffer",
          "Guaranteed O(n log n) regardless of input order — no pathological worst case unlike Quick Sort",
          "Excellent for external sorting (data too large for memory) and for linked lists, where it can run in O(1) extra space"
        ]},
        { tag: "note", variant: "tip", text: "Merge Sort is the standard choice when stability is required and worst-case guarantees matter more than average-case constant factors — e.g. sorting by one key after already having sorted by another." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Merge Sort always recurses to the same depth and always merges every pair of runs in full, regardless of whether the input is already sorted — there's no early exit, so best case equals worst case." },
          { tag: "ul", items: [
            "Recursion depth is always ⌈log₂ n⌉, since the array is halved each level regardless of content",
            "Each of the log n levels performs a full O(n) merge across all sub-arrays at that level",
            "Total: O(n) per level × O(log n) levels = O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "The recurrence T(n) = 2T(n/2) + O(n) — split into two halves, recursively sort each, then merge in linear time — solves to O(n log n) by the Master Theorem, regardless of the values in the array." },
          { tag: "ul", items: [
            "T(n) = 2T(n/2) + cn, with T(1) = O(1)",
            "Master Theorem case 2 (a = 2, b = 2, f(n) = Θ(n^(log_b a))) gives T(n) = Θ(n log n)",
            "This holds for any input distribution, since merging is always linear regardless of value order"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "Unlike Quick Sort, there is no input arrangement that degrades Merge Sort's performance — the divide step always splits evenly by position (not by value), so the recursion tree is always perfectly balanced." },
          { tag: "ul", items: [
            "Recursion tree always has exactly ⌈log₂ n⌉ levels, with total work O(n) per level",
            "No adversarial input can force deeper recursion or costlier merges",
            "O(n log n) is the proven worst case — and this matches the comparison-sort lower bound, making Merge Sort asymptotically optimal"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The merge step needs a temporary buffer to hold the merged result before copying it back, sized to the portion of the array being merged — summing to O(n) across the whole algorithm at any given recursion level." },
          { tag: "ul", items: ["Temporary merge buffer: O(n) total auxiliary array space", "Recursion call stack: O(log n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is identical for every input — it depends only on array length, not on value order, since the merge buffer size is fixed by the algorithm's structure." },
          { tag: "ul", items: ["O(n) auxiliary array (standard top-down implementation)", "O(log n) recursion stack depth"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input increases space usage beyond the standard merge buffer — this is the same in every case, a useful contrast to Quick Sort's space variability." },
          { tag: "ul", items: [
            "O(n) for the auxiliary array used during merging",
            "O(log n) recursion depth, same as best/average case",
            "An in-place merge variant exists but increases time complexity — the standard trade-off is O(n) space for O(n log n) guaranteed time"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function mergeSort(arr):
    if length(arr) <= 1:
        return arr

    mid   ← length(arr) / 2
    left  ← mergeSort(arr[0 .. mid-1])
    right ← mergeSort(arr[mid .. end])
    return merge(left, right)

function merge(left, right):
    result ← empty array
    i ← 0; j ← 0

    while i < length(left) and j < length(right):
        if left[i] <= right[j]:
            append left[i] to result; i ← i + 1
        else:
            append right[j] to result; j ← j + 1

    append remaining left[i..] to result
    append remaining right[j..] to result
    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Base case: an array of length 0 or 1 is trivially already sorted.",
          "Divide: split the array at its midpoint into two halves.",
          "Conquer: recursively sort each half independently.",
          "Combine: merge the two now-sorted halves into one sorted array by repeatedly taking the smaller of the two fronts.",
          "Ties go to the left half (left[i] <= right[j]) — this preserves the original relative order of equal elements, making the sort stable.",
          "Once one half is exhausted, append the remainder of the other half directly, since it's already sorted."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "By strong induction on array length: arrays of length ≤ 1 are trivially sorted (base case). Assuming both halves of length < n are correctly sorted by the recursive calls, the merge step produces a fully sorted array by always selecting the smallest remaining element from the two sorted fronts — a textbook two-pointer merge that's provably correct since both input lists are sorted." }
      ]
,
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp;
    int i = left, j = mid + 1;

    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);
        else temp.push_back(arr[j++]);
    }
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);

    for (int k = 0; k < (int)temp.size(); k++)
        arr[left + k] = temp[k];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

int main() {
    vector<int> arr = {38, 27, 43, 3, 9, 82, 10};
    mergeSort(arr, 0, arr.size() - 1);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

if __name__ == "__main__":
    arr = [38, 27, 43, 3, 9, 82, 10]
    arr = merge_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    public static void mergeSort(int[] arr, int left, int right) {
        if (left >= right) return;
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right)
            temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (int x = 0; x < temp.length; x++)
            arr[left + x] = temp[x];
    }

    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    return merge(left, right);
}

function merge(left, right) {
    const result = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
        if (left[i] <= right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }
    return result.concat(left.slice(i)).concat(right.slice(j));
}

const arr = [38, 27, 43, 3, 9, 82, 10];
const sorted = mergeSort(arr);
console.log("Sorted:", sorted);`,

  "c": `#include <stdio.h>
#include <stdlib.h>

void merge(int* arr, int left, int mid, int right) {
    int n = right - left + 1;
    int* temp = (int*)malloc(n * sizeof(int));
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right)
        temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int x = 0; x < n; x++) arr[left + x] = temp[x];
    free(temp);
}

void mergeSort(int* arr, int left, int right) {
    if (left >= right) return;
    int mid = left + (right - left) / 2;
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
}

int main() {
    int arr[] = {38, 27, 43, 3, 9, 82, 10};
    int n = sizeof(arr) / sizeof(arr[0]);
    mergeSort(arr, 0, n - 1);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void MergeSort(int[] arr, int left, int right) {
        if (left >= right) return;
        int mid = left + (right - left) / 2;
        MergeSort(arr, left, mid);
        MergeSort(arr, mid + 1, right);
        Merge(arr, left, mid, right);
    }

    static void Merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right)
            temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (int x = 0; x < temp.Length; x++)
            arr[left + x] = temp[x];
    }

    static void Main() {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        MergeSort(arr, 0, arr.Length - 1);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func mergeSort(_ arr: [Int]) -> [Int] {
    if arr.count <= 1 { return arr }
    let mid = arr.count / 2
    let left = mergeSort(Array(arr[..<mid]))
    let right = mergeSort(Array(arr[mid...]))
    return merge(left, right)
}

func merge(_ left: [Int], _ right: [Int]) -> [Int] {
    var result = [Int]()
    var i = 0, j = 0
    while i < left.count && j < right.count {
        if left[i] <= right[j] { result.append(left[i]); i += 1 }
        else { result.append(right[j]); j += 1 }
    }
    result.append(contentsOf: left[i...])
    result.append(contentsOf: right[j...])
    return result
}

let arr = [38, 27, 43, 3, 9, 82, 10]
let sorted = mergeSort(arr)
print("Sorted: \\(sorted)")`,

  "kotlin": `fun mergeSort(arr: IntArray): IntArray {
    if (arr.size <= 1) return arr
    val mid = arr.size / 2
    val left = mergeSort(arr.copyOfRange(0, mid))
    val right = mergeSort(arr.copyOfRange(mid, arr.size))
    return merge(left, right)
}

fun merge(left: IntArray, right: IntArray): IntArray {
    val result = mutableListOf<Int>()
    var i = 0; var j = 0
    while (i < left.size && j < right.size) {
        if (left[i] <= right[j]) result.add(left[i++])
        else result.add(right[j++])
    }
    while (i < left.size) result.add(left[i++])
    while (j < right.size) result.add(right[j++])
    return result.toIntArray()
}

fun main() {
    val arr = intArrayOf(38, 27, 43, 3, 9, 82, 10)
    val sorted = mergeSort(arr)
    println("Sorted: \${sorted.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def mergeSort(arr: Array[Int]): Array[Int] = {
        if (arr.length <= 1) return arr
        val mid = arr.length / 2
        val left = mergeSort(arr.slice(0, mid))
        val right = mergeSort(arr.slice(mid, arr.length))
        merge(left, right)
    }

    def merge(left: Array[Int], right: Array[Int]): Array[Int] = {
        var i = 0; var j = 0
        val result = scala.collection.mutable.ArrayBuffer[Int]()
        while (i < left.length && j < right.length) {
            if (left(i) <= right(j)) { result += left(i); i += 1 }
            else { result += right(j); j += 1 }
        }
        result ++= left.drop(i)
        result ++= right.drop(j)
        result.toArray
    }

    val arr = Array(38, 27, 43, 3, 9, 82, 10)
    val sorted = mergeSort(arr)
    println(s"Sorted: \${sorted.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func mergeSort(arr []int) []int {
    if len(arr) <= 1 {
        return arr
    }
    mid := len(arr) / 2
    left := mergeSort(arr[:mid])
    right := mergeSort(arr[mid:])
    return merge(left, right)
}

func merge(left, right []int) []int {
    result := make([]int, 0, len(left)+len(right))
    i, j := 0, 0
    for i < len(left) && j < len(right) {
        if left[i] <= right[j] {
            result = append(result, left[i]); i++
        } else {
            result = append(result, right[j]); j++
        }
    }
    result = append(result, left[i:]...)
    result = append(result, right[j:]...)
    return result
}

func main() {
    arr := []int{38, 27, 43, 3, 9, 82, 10}
    sorted := mergeSort(arr)
    fmt.Println("Sorted:", sorted)
}`,

  "rust": `fn merge_sort(arr: Vec<i32>) -> Vec<i32> {
    if arr.len() <= 1 { return arr; }
    let mid = arr.len() / 2;
    let left = merge_sort(arr[..mid].to_vec());
    let right = merge_sort(arr[mid..].to_vec());
    merge(left, right)
}

fn merge(left: Vec<i32>, right: Vec<i32>) -> Vec<i32> {
    let mut result = Vec::new();
    let mut i = 0; let mut j = 0;
    while i < left.len() && j < right.len() {
        if left[i] <= right[j] { result.push(left[i]); i += 1; }
        else { result.push(right[j]); j += 1; }
    }
    result.extend_from_slice(&left[i..]);
    result.extend_from_slice(&right[j..]);
    result
}

fn main() {
    let arr = vec![38, 27, 43, 3, 9, 82, 10];
    let sorted = merge_sort(arr);
    println!("Sorted: {:?}", sorted);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. TIMSORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Timsort",
      href: "/algorithms/sorting/tim-sort",
      type: "Hard",

      about: [
        { tag: "h1", text: "Timsort" },
        { tag: "p", text: "Timsort is a hybrid stable sorting algorithm derived from Merge Sort and Insertion Sort, designed by Tim Peters in 2002 for CPython. It is the default sort used by Python's sorted()/list.sort(), Java's Arrays.sort() for objects, and Android's platform sort, because real-world data is rarely random — it usually contains long runs of already-sorted (or reverse-sorted) elements that Timsort exploits directly." },
        { tag: "p", text: "Timsort identifies naturally occurring ascending or descending 'runs' in the data, extends short runs up to a minimum length using Insertion Sort, then merges runs together using a carefully tuned merge strategy (galloping mode) that adapts based on how lopsided the two runs being merged are." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable — critical for sorting by multiple keys in sequence (sort by key2, then stably sort by key1)",
          "Adaptive — runs in O(n) on already-sorted or already-reverse-sorted data, far better than plain Merge Sort's unconditional O(n log n)",
          "Hybrid — uses Insertion Sort for small runs (typically 32–64 elements) where its left overhead beats Merge Sort's overhead",
          "'Galloping mode' accelerates merging when one run is consistently 'winning', using exponential search instead of linear comparison"
        ]},
        { tag: "note", variant: "info", text: "Timsort's worst-case O(n log n) guarantee, combined with its excellent real-world performance on partially-sorted data, is why it has become the standard library default in multiple major languages rather than plain Quick Sort or Merge Sort." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "On already fully-sorted (or fully reverse-sorted, which Timsort detects and reverses in O(n)) input, the entire array is identified as a single run, requiring no merging at all." },
          { tag: "ul", items: [
            "Run detection scans the array once, O(n), and finds it is already one giant ascending run",
            "No merge step is needed since there's only one run",
            "Total: O(n) — dramatically better than plain Merge Sort's unconditional O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "For genuinely random data, Timsort behaves like a tuned Merge Sort: it identifies many short runs (extended to a minimum run length via Insertion Sort), then merges them pairwise using a balanced merge strategy." },
          { tag: "ul", items: [
            "Initial run extension: O(n) total, using Insertion Sort on small chunks (cheap since chunk size is bounded, typically ≤ 64)",
            "Merging follows the same recurrence as Merge Sort: O(n) work per 'level' of merging, O(log n) levels",
            "Total: O(n log n), matching the comparison-sort lower bound"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "Timsort's merge strategy uses a 'stack invariant' on run lengths to guarantee balanced merging even on adversarial inputs, preventing the kind of degenerate unbalanced merging that could otherwise blow up the runtime." },
          { tag: "ul", items: [
            "Merge invariants ensure no merge combines two runs of wildly different size in a way that creates O(n²) behaviour",
            "Worst case matches the proven O(n log n) lower bound for comparison sorts",
            "Galloping mode has its own worst case bounded by the same O(n log n) envelope — it never makes things asymptotically worse than standard merging"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Even with a single run requiring no merging, Timsort allocates a temporary merge buffer up front sized for the worst case it might encounter." },
          { tag: "ul", items: ["Temp merge buffer: up to O(n/2) in the standard implementation", "Run-length stack: O(log n) entries"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "The merge buffer size scales with the size of the runs being merged, bounded above by O(n) for the final merge of two roughly-equal halves." },
          { tag: "ul", items: ["Temporary buffer for merging: O(n)", "Run stack tracking pending merges: O(log n)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input increases memory usage beyond the standard merge buffer, which is the same structural cost as plain Merge Sort." },
          { tag: "ul", items: ["O(n) auxiliary space for merge buffers — same as Merge Sort", "O(log n) for the run-tracking stack"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Simplified right-level pseudocode (real implementations include galloping mode and a precise merge-stack invariant, omitted here for clarity):" },
        { tag: "code", language: "text", text:
`MIN_RUN ← 32   // tuned constant, typically 32–64

function timSort(arr):
    n ← length(arr)

    // Step 1: find/extend runs, sort each with insertion sort
    for start from 0 to n − 1 step MIN_RUN:
        end ← min(start + MIN_RUN − 1, n − 1)
        insertionSort(arr, start, end)

    // Step 2: merge runs, doubling the merge size each pass
    size ← MIN_RUN
    while size < n:
        for left from 0 to n − 1 step 2 * size:
            mid   ← min(left + size − 1, n − 1)
            right ← min(left + 2 * size − 1, n − 1)
            if mid < right:
                merge(arr, left, mid, right)
        size ← size * 2

    return arr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Scan the array in chunks of MIN_RUN elements (in practice, Timsort first detects naturally occurring runs and only falls back to fixed-size chunks when needed).",
          "Sort each chunk with Insertion Sort — efficient because chunks are small and Insertion Sort has left constant-factor overhead.",
          "Merge adjacent sorted runs pairwise, doubling the merge size each pass — exactly like the bottom-up iterative version of Merge Sort.",
          "Continue merging until the entire array is covered by a single sorted run."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness follows from two well-established sub-algorithms composed together: Insertion Sort is correct for small runs (proven by its own loop invariant), and the merge step is the same provably-correct two-pointer merge used in Merge Sort. Since merging two sorted sequences always produces a sorted sequence, and the algorithm always merges pairs of already-sorted runs, induction on the number of merge passes shows the whole array ends up sorted." }
      ]
,
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

const int MIN_RUN = 32;

void insertionSort(vector<int>& arr, int left, int right) {
    for (int i = left + 1; i <= right; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= left && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp;
    int i = left, j = mid + 1;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);
        else temp.push_back(arr[j++]);
    }
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);
    for (int k = 0; k < (int)temp.size(); k++)
        arr[left + k] = temp[k];
}

void timSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n; i += MIN_RUN)
        insertionSort(arr, i, min(i + MIN_RUN - 1, n - 1));

    for (int size = MIN_RUN; size < n; size *= 2) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = min(left + size - 1, n - 1);
            int right = min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}

int main() {
    vector<int> arr = {5, 21, 7, 23, 19, 3, 11, 14, 8, 2};
    timSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def insertion_sort(arr, left, right):
    for i in range(left + 1, right + 1):
        key = arr[i]
        j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

def merge(arr, left, mid, right):
    left_part = arr[left:mid + 1]
    right_part = arr[mid + 1:right + 1]
    i = j = 0
    k = left
    while i < len(left_part) and j < len(right_part):
        if left_part[i] <= right_part[j]:
            arr[k] = left_part[i]; i += 1
        else:
            arr[k] = right_part[j]; j += 1
        k += 1
    while i < len(left_part): arr[k] = left_part[i]; i += 1; k += 1
    while j < len(right_part): arr[k] = right_part[j]; j += 1; k += 1

def tim_sort(arr):
    MIN_RUN = 32
    n = len(arr)
    for i in range(0, n, MIN_RUN):
        insertion_sort(arr, i, min(i + MIN_RUN - 1, n - 1))
    size = MIN_RUN
    while size < n:
        for left in range(0, n, 2 * size):
            mid = min(left + size - 1, n - 1)
            right = min(left + 2 * size - 1, n - 1)
            if mid < right:
                merge(arr, left, mid, right)
        size *= 2

if __name__ == "__main__":
    arr = [5, 21, 7, 23, 19, 3, 11, 14, 8, 2]
    tim_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static final int MIN_RUN = 32;

    static void insertionSort(int[] arr, int left, int right) {
        for (int i = left + 1; i <= right; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= left && arr[j] > key) {
                arr[j + 1] = arr[j]; j--;
            }
            arr[j + 1] = key;
        }
    }

    static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right)
            temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (int x = 0; x < temp.length; x++) arr[left + x] = temp[x];
    }

    static void timSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n; i += MIN_RUN)
            insertionSort(arr, i, Math.min(i + MIN_RUN - 1, n - 1));
        for (int size = MIN_RUN; size < n; size *= 2) {
            for (int left = 0; left < n; left += 2 * size) {
                int mid = Math.min(left + size - 1, n - 1);
                int right = Math.min(left + 2 * size - 1, n - 1);
                if (mid < right) merge(arr, left, mid, right);
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {5, 21, 7, 23, 19, 3, 11, 14, 8, 2};
        timSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `const MIN_RUN = 32;

function insertionSort(arr, left, right) {
    for (let i = left + 1; i <= right; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= left && arr[j] > key) {
            arr[j + 1] = arr[j]; j--;
        }
        arr[j + 1] = key;
    }
}

function merge(arr, left, mid, right) {
    const leftPart = arr.slice(left, mid + 1);
    const rightPart = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < leftPart.length && j < rightPart.length) {
        if (leftPart[i] <= rightPart[j]) arr[k++] = leftPart[i++];
        else arr[k++] = rightPart[j++];
    }
    while (i < leftPart.length) arr[k++] = leftPart[i++];
    while (j < rightPart.length) arr[k++] = rightPart[j++];
}

function timSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n; i += MIN_RUN)
        insertionSort(arr, i, Math.min(i + MIN_RUN - 1, n - 1));
    for (let size = MIN_RUN; size < n; size *= 2) {
        for (let left = 0; left < n; left += 2 * size) {
            const mid = Math.min(left + size - 1, n - 1);
            const right = Math.min(left + 2 * size - 1, n - 1);
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}

const arr = [5, 21, 7, 23, 19, 3, 11, 14, 8, 2];
timSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define MIN_RUN 32

void insertionSort(int* arr, int left, int right) {
    for (int i = left + 1; i <= right; i++) {
        int key = arr[i], j = i - 1;
        while (j >= left && arr[j] > key) { arr[j + 1] = arr[j]; j--; }
        arr[j + 1] = key;
    }
}

void merge(int* arr, int left, int mid, int right) {
    int n = right - left + 1;
    int* temp = (int*)malloc(n * sizeof(int));
    int i = left, j = mid + 1, k = 0;
    while (i <= mid && j <= right)
        temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
    while (i <= mid) temp[k++] = arr[i++];
    while (j <= right) temp[k++] = arr[j++];
    for (int x = 0; x < n; x++) arr[left + x] = temp[x];
    free(temp);
}

void timSort(int* arr, int n) {
    for (int i = 0; i < n; i += MIN_RUN)
        insertionSort(arr, i, (i + MIN_RUN - 1 < n - 1) ? i + MIN_RUN - 1 : n - 1);
    for (int size = MIN_RUN; size < n; size *= 2) {
        for (int left = 0; left < n; left += 2 * size) {
            int mid = left + size - 1 < n - 1 ? left + size - 1 : n - 1;
            int right = left + 2 * size - 1 < n - 1 ? left + 2 * size - 1 : n - 1;
            if (mid < right) merge(arr, left, mid, right);
        }
    }
}

int main() {
    int arr[] = {5, 21, 7, 23, 19, 3, 11, 14, 8, 2};
    int n = sizeof(arr) / sizeof(arr[0]);
    timSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    const int MIN_RUN = 32;

    static void InsertionSort(int[] arr, int left, int right) {
        for (int i = left + 1; i <= right; i++) {
            int key = arr[i], j = i - 1;
            while (j >= left && arr[j] > key) { arr[j + 1] = arr[j]; j--; }
            arr[j + 1] = key;
        }
    }

    static void Merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right)
            temp[k++] = (arr[i] <= arr[j]) ? arr[i++] : arr[j++];
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (int x = 0; x < temp.Length; x++) arr[left + x] = temp[x];
    }

    static void TimSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n; i += MIN_RUN)
            InsertionSort(arr, i, Math.Min(i + MIN_RUN - 1, n - 1));
        for (int size = MIN_RUN; size < n; size *= 2) {
            for (int left = 0; left < n; left += 2 * size) {
                int mid = Math.Min(left + size - 1, n - 1);
                int right = Math.Min(left + 2 * size - 1, n - 1);
                if (mid < right) Merge(arr, left, mid, right);
            }
        }
    }

    static void Main() {
        int[] arr = {5, 21, 7, 23, 19, 3, 11, 14, 8, 2};
        TimSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `let MIN_RUN = 32

func insertionSort(_ arr: inout [Int], _ left: Int, _ right: Int) {
    for i in (left + 1)...right {
        let key = arr[i]
        var j = i - 1
        while j >= left && arr[j] > key {
            arr[j + 1] = arr[j]; j -= 1
        }
        arr[j + 1] = key
    }
}

func merge(_ arr: inout [Int], _ left: Int, _ mid: Int, _ right: Int) {
    let leftPart = Array(arr[left...mid])
    let rightPart = Array(arr[(mid + 1)...right])
    var i = 0, j = 0, k = left
    while i < leftPart.count && j < rightPart.count {
        if leftPart[i] <= rightPart[j] { arr[k] = leftPart[i]; i += 1 }
        else { arr[k] = rightPart[j]; j += 1 }
        k += 1
    }
    while i < leftPart.count { arr[k] = leftPart[i]; i += 1; k += 1 }
    while j < rightPart.count { arr[k] = rightPart[j]; j += 1; k += 1 }
}

func timSort(_ arr: inout [Int]) {
    let n = arr.count
    var i = 0
    while i < n {
        insertionSort(&arr, i, min(i + MIN_RUN - 1, n - 1))
        i += MIN_RUN
    }
    var size = MIN_RUN
    while size < n {
        var left = 0
        while left < n {
            let mid = min(left + size - 1, n - 1)
            let right = min(left + 2 * size - 1, n - 1)
            if mid < right { merge(&arr, left, mid, right) }
            left += 2 * size
        }
        size *= 2
    }
}

var arr = [5, 21, 7, 23, 19, 3, 11, 14, 8, 2]
timSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `const val MIN_RUN = 32

fun insertionSort(arr: IntArray, left: Int, right: Int) {
    for (i in left + 1..right) {
        val key = arr[i]; var j = i - 1
        while (j >= left && arr[j] > key) { arr[j + 1] = arr[j]; j-- }
        arr[j + 1] = key
    }
}

fun merge(arr: IntArray, left: Int, mid: Int, right: Int) {
    val temp = IntArray(right - left + 1)
    var i = left; var j = mid + 1; var k = 0
    while (i <= mid && j <= right)
        temp[k++] = if (arr[i] <= arr[j]) arr[i++] else arr[j++]
    while (i <= mid) temp[k++] = arr[i++]
    while (j <= right) temp[k++] = arr[j++]
    for (x in temp.indices) arr[left + x] = temp[x]
}

fun timSort(arr: IntArray) {
    val n = arr.size
    var i = 0
    while (i < n) {
        insertionSort(arr, i, minOf(i + MIN_RUN - 1, n - 1))
        i += MIN_RUN
    }
    var size = MIN_RUN
    while (size < n) {
        var left = 0
        while (left < n) {
            val mid = minOf(left + size - 1, n - 1)
            val right = minOf(left + 2 * size - 1, n - 1)
            if (mid < right) merge(arr, left, mid, right)
            left += 2 * size
        }
        size *= 2
    }
}

fun main() {
    val arr = intArrayOf(5, 21, 7, 23, 19, 3, 11, 14, 8, 2)
    timSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    val MIN_RUN = 32

    def insertionSort(arr: Array[Int], left: Int, right: Int): Unit = {
        for (i <- left + 1 to right) {
            val key = arr(i); var j = i - 1
            while (j >= left && arr(j) > key) { arr(j + 1) = arr(j); j -= 1 }
            arr(j + 1) = key
        }
    }

    def merge(arr: Array[Int], left: Int, mid: Int, right: Int): Unit = {
        val temp = new Array[Int](right - left + 1)
        var i = left; var j = mid + 1; var k = 0
        while (i <= mid && j <= right) {
            temp(k) = if (arr(i) <= arr(j)) { val v = arr(i); i += 1; v }
                      else { val v = arr(j); j += 1; v }
            k += 1
        }
        while (i <= mid) { temp(k) = arr(i); i += 1; k += 1 }
        while (j <= right) { temp(k) = arr(j); j += 1; k += 1 }
        for (x <- temp.indices) arr(left + x) = temp(x)
    }

    def timSort(arr: Array[Int]): Unit = {
        val n = arr.length
        var i = 0
        while (i < n) { insertionSort(arr, i, math.min(i + MIN_RUN - 1, n - 1)); i += MIN_RUN }
        var size = MIN_RUN
        while (size < n) {
            var left = 0
            while (left < n) {
                val mid = math.min(left + size - 1, n - 1)
                val right = math.min(left + 2 * size - 1, n - 1)
                if (mid < right) merge(arr, left, mid, right)
                left += 2 * size
            }
            size *= 2
        }
    }

    val arr = Array(5, 21, 7, 23, 19, 3, 11, 14, 8, 2)
    timSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

const MIN_RUN = 32

func insertionSort(arr []int, left, right int) {
    for i := left + 1; i <= right; i++ {
        key := arr[i]; j := i - 1
        for j >= left && arr[j] > key { arr[j+1] = arr[j]; j-- }
        arr[j+1] = key
    }
}

func merge(arr []int, left, mid, right int) {
    temp := make([]int, right-left+1)
    i, j, k := left, mid+1, 0
    for i <= mid && j <= right {
        if arr[i] <= arr[j] { temp[k] = arr[i]; i++ } else { temp[k] = arr[j]; j++ }
        k++
    }
    for i <= mid { temp[k] = arr[i]; i++; k++ }
    for j <= right { temp[k] = arr[j]; j++; k++ }
    for x := range temp { arr[left+x] = temp[x] }
}

func timSort(arr []int) {
    n := len(arr)
    for i := 0; i < n; i += MIN_RUN {
        end := i + MIN_RUN - 1
        if end > n-1 { end = n - 1 }
        insertionSort(arr, i, end)
    }
    for size := MIN_RUN; size < n; size *= 2 {
        for left := 0; left < n; left += 2 * size {
            mid := left + size - 1
            if mid > n-1 { mid = n - 1 }
            right := left + 2*size - 1
            if right > n-1 { right = n - 1 }
            if mid < right { merge(arr, left, mid, right) }
        }
    }
}

func main() {
    arr := []int{5, 21, 7, 23, 19, 3, 11, 14, 8, 2}
    timSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `const MIN_RUN: usize = 32;

fn insertion_sort(arr: &mut Vec<i32>, left: usize, right: usize) {
    for i in (left + 1)..=right {
        let key = arr[i];
        let mut j = i;
        while j > left && arr[j - 1] > key {
            arr[j] = arr[j - 1];
            j -= 1;
        }
        arr[j] = key;
    }
}

fn merge(arr: &mut Vec<i32>, left: usize, mid: usize, right: usize) {
    let left_part = arr[left..=mid].to_vec();
    let right_part = arr[(mid + 1)..=right].to_vec();
    let mut i = 0; let mut j = 0; let mut k = left;
    while i < left_part.len() && j < right_part.len() {
        if left_part[i] <= right_part[j] { arr[k] = left_part[i]; i += 1; }
        else { arr[k] = right_part[j]; j += 1; }
        k += 1;
    }
    while i < left_part.len() { arr[k] = left_part[i]; i += 1; k += 1; }
    while j < right_part.len() { arr[k] = right_part[j]; j += 1; k += 1; }
}

fn tim_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    let mut i = 0;
    while i < n {
        let end = (i + MIN_RUN - 1).min(n - 1);
        insertion_sort(arr, i, end);
        i += MIN_RUN;
    }
    let mut size = MIN_RUN;
    while size < n {
        let mut left = 0;
        while left < n {
            let mid = (left + size - 1).min(n - 1);
            let right = (left + 2 * size - 1).min(n - 1);
            if mid < right { merge(arr, left, mid, right); }
            left += 2 * size;
        }
        size *= 2;
    }
}

fn main() {
    let mut arr = vec![5, 21, 7, 23, 19, 3, 11, 14, 8, 2];
    tim_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. QUICK SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Quick Sort",
      href: "/algorithms/sorting/quick-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Quick Sort" },
        { tag: "p", text: "Quick Sort, devised by Tony Hoare in 1959, is a divide-and-conquer algorithm that picks a 'pivot' element and partitions the array so that everything smaller than the pivot ends up to its left and everything larger ends up to its right, then recursively sorts each side. Unlike Merge Sort, all the real work happens in the partition (divide) step rather than the combine step — there's nothing left to merge once both sides are sorted." },
        { tag: "p", text: "It is usually the fastest general-purpose comparison sort in practice due to excellent cache locality (in-place partitioning) and left constant factors, despite having a theoretically worse worst case than Merge Sort or Heap Sort." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Not stable in its typical in-place form (equal elements can be reordered during partitioning)",
          "In-place — O(log n) auxiliary space for the recursion stack, not O(n) like Merge Sort",
          "Average O(n log n), but degrades to O(n²) on adversarial or already-sorted input with a naive pivot choice",
          "Pivot selection strategy is critical: random pivot or median-of-three drastically reduces the chance of hitting the worst case"
        ]},
        { tag: "note", variant: "warning", text: "Always-pick-first-element pivoting is a classic interview trap: it degrades to O(n²) on already-sorted arrays, which are extremely common in real-world data. Randomised or median-of-three pivoting avoids this." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n) avg / O(n²) worst",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "The best case occurs when every chosen pivot splits its partition into two exactly equal halves, producing the same balanced recursion tree shape as Merge Sort." },
          { tag: "ul", items: [
            "Each partition step costs O(n) at its level (one full pass to classify elements relative to the pivot)",
            "Balanced splits give a recursion depth of O(log n)",
            "Total: O(n) work per level × O(log n) levels = O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "Even without perfectly balanced splits, a randomly chosen pivot on random or randomised input produces splits that are 'good enough' on average — the expected recursion depth remains O(log n)." },
          { tag: "ul", items: [
            "Expected partition sizes, even with unequal splits, are within a constant factor of balanced on average",
            "Formal analysis (via expected number of comparisons per element, using harmonic-number summation) gives E[comparisons] = O(n log n)",
            "This is why randomised pivot selection is the standard practical safeguard"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          { tag: "p", text: "If the pivot is consistently the smallest or largest remaining element (e.g. always picking the first element on an already-sorted array), each partition only removes one element from consideration, degenerating into something resembling Selection Sort." },
          { tag: "ul", items: [
            "Partition sizes: n, n−1, n−2, ..., 1 — a fully unbalanced recursion tree",
            "Total comparisons: n + (n−1) + ... + 1 = n(n+1)/2 → O(n²)",
            "Mitigated in practice with randomised pivots, median-of-three pivot selection, or switching to Heap Sort if recursion depth exceeds a threshold (this hybrid is exactly Introsort)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(log n)" },
          { tag: "p", text: "Sorting happens in-place via swaps; the only meaningful memory cost is the recursion call stack, which is shallow when partitions are balanced." },
          { tag: "ul", items: ["Balanced recursion: depth O(log n)", "Each stack frame: O(1) — just bounds (left, right)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(log n)" },
          { tag: "p", text: "On average, recursion depth stays logarithmic because tail-call optimisation (recursing on the smaller partition first) bounds the call stack even when splits aren't perfectly even." },
          { tag: "ul", items: ["With the 'recurse on smaller half first' optimisation, stack depth is provably O(log n) even for unequal splits", "No auxiliary array — purely in-place swapping"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "Without the smaller-half-first optimisation, a maximally unbalanced partition sequence (1 element removed per level) produces n levels of recursion." },
          { tag: "ul", items: [
            "Naive recursion on adversarial input: O(n) call stack depth",
            "With the smaller-half-first optimisation: guaranteed O(log n) even in the worst case, since the recursed-into half is always ≤ half the remaining size",
            "This optimisation is standard in production-quality implementations"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Lomuto partition scheme, with the last element as pivot:" },
        { tag: "code", language: "text", text:
`function quickSort(arr, left, right):
    if left < right:
        p ← partition(arr, left, right)
        quickSort(arr, left, p − 1)
        quickSort(arr, p + 1, right)

function partition(arr, left, right):
    pivot ← arr[right]
    i ← left − 1                     // boundary of "< pivot" region

    for j from left to right − 1:
        if arr[j] < pivot:
            i ← i + 1
            swap(arr[i], arr[j])

    swap(arr[i + 1], arr[right])     // place pivot in its final position
    return i + 1` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Choose a pivot — here, the last element of the current sub-array.",
          "Walk through the sub-array with j, maintaining the invariant that everything in arr[left..i] is less than the pivot.",
          "Whenever arr[j] is less than the pivot, expand the 'less than' region by incrementing i and swapping arr[i] with arr[j].",
          "After the scan, swap the pivot into position i+1 — everything to its left is smaller, everything to its right is greater or equal.",
          "Recursively apply the same process to the left sub-array (left to p−1) and the right sub-array (p+1 to right)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Partition invariant: at every point during the scan, arr[left..i] contains only elements less than the pivot, and arr[i+1..j-1] contains only elements ≥ the pivot. When the scan completes, swapping the pivot into position i+1 places it exactly between these two correctly-classified regions. By strong induction, recursively partitioning each side (which never includes the already-placed pivot) eventually sorts the entire array, since every element is correctly positioned relative to every pivot it's ever compared against." }
      ]
,
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int>& arr, int left, int right) {
    int pivot = arr[right];
    int i = left - 1;
    for (int j = left; j < right; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[right]);
    return i + 1;
}

void quickSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int p = partition(arr, left, right);
        quickSort(arr, left, p - 1);
        quickSort(arr, p + 1, right);
    }
}

int main() {
    vector<int> arr = {10, 7, 8, 9, 1, 5};
    quickSort(arr, 0, arr.size() - 1);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def partition(arr, left, right):
    pivot = arr[right]
    i = left - 1
    for j in range(left, right):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[right] = arr[right], arr[i + 1]
    return i + 1

def quick_sort(arr, left, right):
    if left < right:
        p = partition(arr, left, right)
        quick_sort(arr, left, p - 1)
        quick_sort(arr, p + 1, right)

if __name__ == "__main__":
    arr = [10, 7, 8, 9, 1, 5]
    quick_sort(arr, 0, len(arr) - 1)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static int partition(int[] arr, int left, int right) {
        int pivot = arr[right], i = left - 1;
        for (int j = left; j < right; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        int temp = arr[i + 1]; arr[i + 1] = arr[right]; arr[right] = temp;
        return i + 1;
    }

    static void quickSort(int[] arr, int left, int right) {
        if (left < right) {
            int p = partition(arr, left, right);
            quickSort(arr, left, p - 1);
            quickSort(arr, p + 1, right);
        }
    }

    public static void main(String[] args) {
        int[] arr = {10, 7, 8, 9, 1, 5};
        quickSort(arr, 0, arr.length - 1);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function partition(arr, left, right) {
    const pivot = arr[right];
    let i = left - 1;
    for (let j = left; j < right; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
    return i + 1;
}

function quickSort(arr, left, right) {
    if (left < right) {
        const p = partition(arr, left, right);
        quickSort(arr, left, p - 1);
        quickSort(arr, p + 1, right);
    }
}

const arr = [10, 7, 8, 9, 1, 5];
quickSort(arr, 0, arr.length - 1);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>

void swap(int* a, int* b) { int t = *a; *a = *b; *b = t; }

int partition(int* arr, int left, int right) {
    int pivot = arr[right], i = left - 1;
    for (int j = left; j < right; j++)
        if (arr[j] < pivot) { i++; swap(&arr[i], &arr[j]); }
    swap(&arr[i + 1], &arr[right]);
    return i + 1;
}

void quickSort(int* arr, int left, int right) {
    if (left < right) {
        int p = partition(arr, left, right);
        quickSort(arr, left, p - 1);
        quickSort(arr, p + 1, right);
    }
}

int main() {
    int arr[] = {10, 7, 8, 9, 1, 5};
    int n = sizeof(arr) / sizeof(arr[0]);
    quickSort(arr, 0, n - 1);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static int Partition(int[] arr, int left, int right) {
        int pivot = arr[right], i = left - 1;
        for (int j = left; j < right; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        int t = arr[i + 1]; arr[i + 1] = arr[right]; arr[right] = t;
        return i + 1;
    }

    static void QuickSort(int[] arr, int left, int right) {
        if (left < right) {
            int p = Partition(arr, left, right);
            QuickSort(arr, left, p - 1);
            QuickSort(arr, p + 1, right);
        }
    }

    static void Main() {
        int[] arr = {10, 7, 8, 9, 1, 5};
        QuickSort(arr, 0, arr.Length - 1);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func partition(_ arr: inout [Int], _ left: Int, _ right: Int) -> Int {
    let pivot = arr[right]
    var i = left - 1
    for j in left..<right {
        if arr[j] < pivot {
            i += 1
            arr.swapAt(i, j)
        }
    }
    arr.swapAt(i + 1, right)
    return i + 1
}

func quickSort(_ arr: inout [Int], _ left: Int, _ right: Int) {
    if left < right {
        let p = partition(&arr, left, right)
        quickSort(&arr, left, p - 1)
        quickSort(&arr, p + 1, right)
    }
}

var arr = [10, 7, 8, 9, 1, 5]
quickSort(&arr, 0, arr.count - 1)
print("Sorted: \\(arr)")`,

  "kotlin": `fun partition(arr: IntArray, left: Int, right: Int): Int {
    val pivot = arr[right]; var i = left - 1
    for (j in left until right) {
        if (arr[j] < pivot) {
            i++
            val temp = arr[i]; arr[i] = arr[j]; arr[j] = temp
        }
    }
    val temp = arr[i + 1]; arr[i + 1] = arr[right]; arr[right] = temp
    return i + 1
}

fun quickSort(arr: IntArray, left: Int, right: Int) {
    if (left < right) {
        val p = partition(arr, left, right)
        quickSort(arr, left, p - 1)
        quickSort(arr, p + 1, right)
    }
}

fun main() {
    val arr = intArrayOf(10, 7, 8, 9, 1, 5)
    quickSort(arr, 0, arr.size - 1)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def partition(arr: Array[Int], left: Int, right: Int): Int = {
        val pivot = arr(right); var i = left - 1
        for (j <- left until right) {
            if (arr(j) < pivot) {
                i += 1
                val temp = arr(i); arr(i) = arr(j); arr(j) = temp
            }
        }
        val temp = arr(i + 1); arr(i + 1) = arr(right); arr(right) = temp
        i + 1
    }

    def quickSort(arr: Array[Int], left: Int, right: Int): Unit = {
        if (left < right) {
            val p = partition(arr, left, right)
            quickSort(arr, left, p - 1)
            quickSort(arr, p + 1, right)
        }
    }

    val arr = Array(10, 7, 8, 9, 1, 5)
    quickSort(arr, 0, arr.length - 1)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func partition(arr []int, left, right int) int {
    pivot := arr[right]; i := left - 1
    for j := left; j < right; j++ {
        if arr[j] < pivot {
            i++
            arr[i], arr[j] = arr[j], arr[i]
        }
    }
    arr[i+1], arr[right] = arr[right], arr[i+1]
    return i + 1
}

func quickSort(arr []int, left, right int) {
    if left < right {
        p := partition(arr, left, right)
        quickSort(arr, left, p-1)
        quickSort(arr, p+1, right)
    }
}

func main() {
    arr := []int{10, 7, 8, 9, 1, 5}
    quickSort(arr, 0, len(arr)-1)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn partition(arr: &mut Vec<i32>, left: usize, right: usize) -> usize {
    let pivot = arr[right];
    let mut i = left;
    for j in left..right {
        if arr[j] < pivot {
            arr.swap(i, j);
            i += 1;
        }
    }
    arr.swap(i, right);
    i
}

fn quick_sort(arr: &mut Vec<i32>, left: usize, right: usize) {
    if left < right {
        let p = partition(arr, left, right);
        if p > 0 { quick_sort(arr, left, p - 1); }
        quick_sort(arr, p + 1, right);
    }
}

fn main() {
    let mut arr = vec![10, 7, 8, 9, 1, 5];
    let n = arr.len();
    quick_sort(&mut arr, 0, n - 1);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       5. HEAP SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Heap Sort",
      href: "/algorithms/sorting/heap-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Heap Sort" },
        { tag: "p", text: "Heap Sort uses a binary max-heap (a complete binary tree where every parent is ≥ its children) to sort an array in place. It first transforms the array into a max-heap, then repeatedly extracts the maximum element (always at the root) and moves it to the end of the unsorted region, shrinking the heap by one each time." },
        { tag: "p", text: "It guarantees O(n log n) in every case like Merge Sort, but unlike Merge Sort it sorts in-place with O(1) auxiliary space — at the cost of poor cache locality (heap operations jump around memory non-sequentially) and not being stable, which is why Quick Sort or Merge Sort are usually preferred in practice despite Heap Sort's strong worst-case guarantee." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Not stable — heap restructuring can reorder equal elements",
          "In-place — O(1) auxiliary space, unlike Merge Sort's O(n)",
          "Guaranteed O(n log n) in every case — no adversarial worst case like Quick Sort",
          "Poor cache performance relative to Quick Sort/Merge Sort due to non-sequential memory access patterns inherent to heap traversal"
        ]},
        { tag: "note", variant: "tip", text: "Heap Sort's main practical niche is when you need an in-place O(n log n) guarantee with zero risk of O(n²) degradation and can tolerate worse real-world constant factors than Quick Sort." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Building the initial heap and extracting all n elements always costs the same amount of work regardless of the initial array order — there's no early-exit shortcut for sorted input." },
          { tag: "ul", items: [
            "Build-heap phase: O(n) (a tighter bound than the naive O(n log n), due to most nodes being near the bottom of the tree and requiring few sift-down operations)",
            "Extraction phase: n extractions, each costing O(log n) to restore the heap property — O(n log n) total",
            "Combined: O(n) + O(n log n) = O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "Every extraction always requires a full sift-down to restore the heap invariant, and this cost doesn't meaningfully vary with the input's value distribution — it's driven by tree height, which depends only on n." },
          { tag: "ul", items: [
            "Each of the n extract-max operations costs O(log n) for the sift-down restoring heap order",
            "n × O(log n) = O(n log n)",
            "No input distribution produces faster or slower sift-downs in any asymptotic sense"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "Heap Sort has no adversarial input that degrades its performance — sift-down always costs O(log n) bounded strictly by tree height, regardless of value arrangement." },
          { tag: "ul", items: [
            "Tree height is always ⌊log₂ n⌋ for a complete binary tree of n nodes, regardless of input values",
            "Worst-case sift-down still only traverses height-many levels: O(log n)",
            "Total worst case: O(n log n), identical to best and average — this predictability is Heap Sort's main selling point over Quick Sort"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "The heap is built directly within the original array using index arithmetic (parent = (i-1)/2, children = 2i+1, 2i+2) — no separate heap structure is allocated." },
          { tag: "ul", items: ["Heap lives in-place inside arr — O(1) extra", "A few loop counters for sift-down/sift-up — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on input values — it's structurally fixed by the in-place array-based heap representation." },
          { tag: "ul", items: ["No auxiliary array, unlike Merge Sort", "Iterative sift-down avoids recursion-stack growth in standard implementations"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input pattern increases memory beyond the fixed handful of scalars used during heap construction and extraction." },
          { tag: "ul", items: ["O(1) regardless of n — this is Heap Sort's key space advantage over Merge Sort's O(n)"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function heapSort(arr):
    n ← length(arr)

    // Step 1: build max-heap (bottom-up)
    for i from floor(n / 2) − 1 down to 0:
        siftDown(arr, n, i)

    // Step 2: repeatedly extract max
    for end from n − 1 down to 1:
        swap(arr[0], arr[end])     // move current max to its final position
        siftDown(arr, end, 0)      // restore heap property on the shrunk heap

function siftDown(arr, heapSize, i):
    largest ← i
    left ← 2*i + 1
    right ← 2*i + 2

    if left < heapSize and arr[left] > arr[largest]:
        largest ← left
    if right < heapSize and arr[right] > arr[largest]:
        largest ← right

    if largest != i:
        swap(arr[i], arr[largest])
        siftDown(arr, heapSize, largest)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Build phase: starting from the last non-leaf node and working backward to the root, sift each node down so the whole array satisfies the max-heap property (every parent ≥ its children).",
          "The root (index 0) now holds the maximum element of the entire array.",
          "Swap the root with the last element of the current heap region, placing the max in its correct final sorted position.",
          "Shrink the heap by one (exclude the now-sorted last element) and sift down the new root to restore the heap property.",
          "Repeat the extract-and-sift-down step until the heap region has only one element left, at which point the whole array is sorted."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Heap invariant: at every step, arr[0..heapSize-1] satisfies the max-heap property, so arr[0] is guaranteed to be the maximum of that region. After the build phase establishes this invariant once, each extraction correctly removes the true maximum and places it at the end, then siftDown restores the invariant for the now-smaller heap. By induction, after n extractions every element has been placed in its correct sorted position, from largest to smallest." }
      ]
,
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void siftDown(vector<int>& arr, int n, int i) {
    int largest = i, left = 2*i+1, right = 2*i+2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) {
        swap(arr[i], arr[largest]);
        siftDown(arr, n, largest);
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n/2 - 1; i >= 0; i--) siftDown(arr, n, i);
    for (int i = n-1; i > 0; i--) {
        swap(arr[0], arr[i]);
        siftDown(arr, i, 0);
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6, 7};
    heapSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def sift_down(arr, n, i):
    largest = i
    left, right = 2*i+1, 2*i+2
    if left < n and arr[left] > arr[largest]: largest = left
    if right < n and arr[right] > arr[largest]: largest = right
    if largest != i:
        arr[i], arr[largest] = arr[largest], arr[i]
        sift_down(arr, n, largest)

def heap_sort(arr):
    n = len(arr)
    for i in range(n//2 - 1, -1, -1): sift_down(arr, n, i)
    for i in range(n-1, 0, -1):
        arr[0], arr[i] = arr[i], arr[0]
        sift_down(arr, i, 0)

if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6, 7]
    heap_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static void siftDown(int[] arr, int n, int i) {
        int largest = i, left = 2*i+1, right = 2*i+2;
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        if (largest != i) {
            int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
            siftDown(arr, n, largest);
        }
    }

    static void heapSort(int[] arr) {
        int n = arr.length;
        for (int i = n/2 - 1; i >= 0; i--) siftDown(arr, n, i);
        for (int i = n-1; i > 0; i--) {
            int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
            siftDown(arr, i, 0);
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6, 7};
        heapSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function siftDown(arr, n, i) {
    let largest = i, left = 2*i+1, right = 2*i+2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest !== i) {
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        siftDown(arr, n, largest);
    }
}

function heapSort(arr) {
    const n = arr.length;
    for (let i = Math.floor(n/2) - 1; i >= 0; i--) siftDown(arr, n, i);
    for (let i = n-1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        siftDown(arr, i, 0);
    }
}

const arr = [12, 11, 13, 5, 6, 7];
heapSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>

void swap(int* a, int* b) { int t = *a; *a = *b; *b = t; }

void siftDown(int* arr, int n, int i) {
    int largest = i, left = 2*i+1, right = 2*i+2;
    if (left < n && arr[left] > arr[largest]) largest = left;
    if (right < n && arr[right] > arr[largest]) largest = right;
    if (largest != i) { swap(&arr[i], &arr[largest]); siftDown(arr, n, largest); }
}

void heapSort(int* arr, int n) {
    for (int i = n/2-1; i >= 0; i--) siftDown(arr, n, i);
    for (int i = n-1; i > 0; i--) { swap(&arr[0], &arr[i]); siftDown(arr, i, 0); }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6, 7};
    int n = sizeof(arr)/sizeof(arr[0]);
    heapSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void SiftDown(int[] arr, int n, int i) {
        int largest = i, left = 2*i+1, right = 2*i+2;
        if (left < n && arr[left] > arr[largest]) largest = left;
        if (right < n && arr[right] > arr[largest]) largest = right;
        if (largest != i) {
            int temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp;
            SiftDown(arr, n, largest);
        }
    }

    static void HeapSort(int[] arr) {
        int n = arr.Length;
        for (int i = n/2-1; i >= 0; i--) SiftDown(arr, n, i);
        for (int i = n-1; i > 0; i--) {
            int temp = arr[0]; arr[0] = arr[i]; arr[i] = temp;
            SiftDown(arr, i, 0);
        }
    }

    static void Main() {
        int[] arr = {12, 11, 13, 5, 6, 7};
        HeapSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func siftDown(_ arr: inout [Int], _ n: Int, _ i: Int) {
    var largest = i, left = 2*i+1, right = 2*i+2
    if left < n && arr[left] > arr[largest] { largest = left }
    if right < n && arr[right] > arr[largest] { largest = right }
    if largest != i {
        arr.swapAt(i, largest)
        siftDown(&arr, n, largest)
    }
}

func heapSort(_ arr: inout [Int]) {
    let n = arr.count
    for i in stride(from: n/2-1, through: 0, by: -1) { siftDown(&arr, n, i) }
    for i in stride(from: n-1, through: 1, by: -1) {
        arr.swapAt(0, i)
        siftDown(&arr, i, 0)
    }
}

var arr = [12, 11, 13, 5, 6, 7]
heapSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `fun siftDown(arr: IntArray, n: Int, i: Int) {
    var largest = i; val left = 2*i+1; val right = 2*i+2
    if (left < n && arr[left] > arr[largest]) largest = left
    if (right < n && arr[right] > arr[largest]) largest = right
    if (largest != i) {
        val temp = arr[i]; arr[i] = arr[largest]; arr[largest] = temp
        siftDown(arr, n, largest)
    }
}

fun heapSort(arr: IntArray) {
    val n = arr.size
    for (i in n/2-1 downTo 0) siftDown(arr, n, i)
    for (i in n-1 downTo 1) {
        val temp = arr[0]; arr[0] = arr[i]; arr[i] = temp
        siftDown(arr, i, 0)
    }
}

fun main() {
    val arr = intArrayOf(12, 11, 13, 5, 6, 7)
    heapSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def siftDown(arr: Array[Int], n: Int, i: Int): Unit = {
        var largest = i; val left = 2*i+1; val right = 2*i+2
        if (left < n && arr(left) > arr(largest)) largest = left
        if (right < n && arr(right) > arr(largest)) largest = right
        if (largest != i) {
            val temp = arr(i); arr(i) = arr(largest); arr(largest) = temp
            siftDown(arr, n, largest)
        }
    }

    def heapSort(arr: Array[Int]): Unit = {
        val n = arr.length
        for (i <- n/2-1 to 0 by -1) siftDown(arr, n, i)
        for (i <- n-1 to 1 by -1) {
            val temp = arr(0); arr(0) = arr(i); arr(i) = temp
            siftDown(arr, i, 0)
        }
    }

    val arr = Array(12, 11, 13, 5, 6, 7)
    heapSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func siftDown(arr []int, n, i int) {
    largest, left, right := i, 2*i+1, 2*i+2
    if left < n && arr[left] > arr[largest] { largest = left }
    if right < n && arr[right] > arr[largest] { largest = right }
    if largest != i {
        arr[i], arr[largest] = arr[largest], arr[i]
        siftDown(arr, n, largest)
    }
}

func heapSort(arr []int) {
    n := len(arr)
    for i := n/2 - 1; i >= 0; i-- { siftDown(arr, n, i) }
    for i := n - 1; i > 0; i-- {
        arr[0], arr[i] = arr[i], arr[0]
        siftDown(arr, i, 0)
    }
}

func main() {
    arr := []int{12, 11, 13, 5, 6, 7}
    heapSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn sift_down(arr: &mut Vec<i32>, n: usize, i: usize) {
    let mut largest = i;
    let left = 2*i+1; let right = 2*i+2;
    if left < n && arr[left] > arr[largest] { largest = left; }
    if right < n && arr[right] > arr[largest] { largest = right; }
    if largest != i {
        arr.swap(i, largest);
        sift_down(arr, n, largest);
    }
}

fn heap_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in (0..n/2).rev() { sift_down(arr, n, i); }
    for i in (1..n).rev() {
        arr.swap(0, i);
        sift_down(arr, i, 0);
    }
}

fn main() {
    let mut arr = vec![12, 11, 13, 5, 6, 7];
    heap_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       6. COUNTING SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Counting Sort",
      href: "/algorithms/sorting/counting-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Counting Sort" },
        { tag: "p", text: "Counting Sort is a non-comparison sorting algorithm that works by counting the number of occurrences of each distinct key value, then using those counts to determine each element's final position directly — without ever comparing two elements to each other." },
        { tag: "p", text: "Because it sidesteps comparisons entirely, it isn't bound by the Ω(n log n) comparison-sort lower bound, and instead runs in O(n + k) time, where k is the range of possible key values. This makes it extremely fast when k is small relative to n (e.g. sorting grades 0–100, or single-byte values 0–255), but impractical when k is very large or the keys are not small integers." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable, when implemented with the standard cumulative-count placement technique (placing elements from the end of the input, right to left)",
          "Not in-place — requires an O(k) count array and typically an O(n) output array",
          "Best suited to small-range integer keys; impractical for floating-point or very-wide-range keys",
          "Often used as a subroutine inside Radix Sort, which applies Counting Sort digit-by-digit"
        ]},
        { tag: "note", variant: "warning", text: "If k (the range of key values) is much larger than n, Counting Sort's O(n + k) bound becomes worse than a comparison sort's O(n log n) — always check the key range before reaching for it." }
      ],

      timeComplexityCalculation: {
        notation: "O(n + k)",
        best: [
          { tag: "h2", text: "Best Case — O(n + k)" },
          { tag: "p", text: "Counting Sort always performs the same fixed sequence of passes regardless of input order — there's no early-exit or input-dependent branching, so best case equals worst case exactly." },
          { tag: "ul", items: [
            "Pass 1: initialise and populate the count array of size k — O(k)",
            "Pass 2: compute prefix sums over the count array — O(k)",
            "Pass 3: place each of the n elements into its final position using the cumulative counts — O(n)",
            "Total: O(n + k), with no input arrangement making it faster or slower"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n + k)" },
          { tag: "p", text: "Since every step is a straightforward linear scan over either the input (size n) or the count array (size k), there is no concept of 'average' differing from best/worst — the algorithm's cost structure is entirely deterministic given n and k." },
          { tag: "ul", items: [
            "O(n) to scan the input array and increment counts",
            "O(k) to build the cumulative count array",
            "O(n) to place elements into the output array using the cumulative counts",
            "Total: O(n + k), invariant across all input value distributions"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n + k)" },
          { tag: "p", text: "There's no adversarial input that makes Counting Sort slower than its standard bound — every operation is a fixed-cost linear pass, with no comparisons or recursive branching that could blow up." },
          { tag: "ul", items: [
            "All three passes remain Θ(n) or Θ(k) regardless of value distribution",
            "The only way to degrade performance is to increase k itself (a wider key range), which is a parameter of the problem, not the input arrangement",
            "Total worst case: O(n + k), matching best and average exactly"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n + k)" },
          { tag: "p", text: "A count array of size k is always needed to track frequency per key, and a separate output array of size n is typically used to assemble the stable result." },
          { tag: "ul", items: ["Count array: O(k)", "Output array: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n + k)" },
          { tag: "p", text: "Memory usage is fixed by n and k alone, not by the values' distribution within that range." },
          { tag: "ul", items: ["Count array (size k) + output array (size n), both allocated regardless of input order"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n + k)" },
          { tag: "p", text: "No input increases the space beyond the fixed count and output arrays — space usage is entirely a function of the problem parameters n and k." },
          { tag: "ul", items: [
            "O(k) for counts + O(n) for output = O(n + k)",
            "If you only need a non-stable sort and can overwrite counts in place, the output array can sometimes be avoided, reducing space to O(k) plus in-place writes"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function countingSort(arr, k):           // keys assumed in range [0, k]
    count  ← array of size k + 1, all zero
    output ← array of size length(arr)

    // Step 1: count occurrences of each key
    for x in arr:
        count[x] ← count[x] + 1

    // Step 2: transform counts into cumulative (prefix) counts
    for i from 1 to k:
        count[i] ← count[i] + count[i − 1]

    // Step 3: place elements into output, right to left for stability
    for i from length(arr) − 1 down to 0:
        x ← arr[i]
        count[x] ← count[x] − 1
        output[count[x]] ← x

    return output` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Allocate a count array sized to cover every possible key value from 0 to k.",
          "Scan the input once, incrementing count[value] for every element encountered — this gives the raw frequency of each key.",
          "Convert raw counts into cumulative counts: count[i] now represents 'how many elements are ≤ i', which directly tells you the final index range for that key.",
          "Walk the input array from right to left (this order is what guarantees stability), placing each element at position count[value] − 1 in the output, then decrementing that count.",
          "After processing every element, the output array is fully sorted."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "After the cumulative-count step, count[v] correctly represents the number of elements ≤ v, which equals the index (1-indexed) of the last position any element with value v should occupy in sorted order. Processing the input right-to-left and decrementing count[v] after each placement assigns each occurrence of v to a unique, correctly-ordered slot — and because later (rightward) occurrences are placed first into the highest available slot, earlier occurrences end up in lower slots, preserving their original relative order and making the sort stable." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countingSort(vector<int>& arr, int k) {
    vector<int> count(k + 1, 0);
    vector<int> output(arr.size());

    for (int x : arr) count[x]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];
    for (int i = arr.size() - 1; i >= 0; i--) {
        output[--count[arr[i]]] = arr[i];
    }
    arr = output;
}

int main() {
    vector<int> arr = {4, 2, 2, 8, 3, 3, 1};
    int k = *max_element(arr.begin(), arr.end());
    countingSort(arr, k);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def counting_sort(arr, k):
    count = [0] * (k + 1)
    output = [0] * len(arr)

    for x in arr: count[x] += 1
    for i in range(1, k + 1): count[i] += count[i - 1]
    for i in range(len(arr) - 1, -1, -1):
        count[arr[i]] -= 1
        output[count[arr[i]]] = arr[i]
    return output

if __name__ == "__main__":
    arr = [4, 2, 2, 8, 3, 3, 1]
    k = max(arr)
    arr = counting_sort(arr, k)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static int[] countingSort(int[] arr, int k) {
        int[] count = new int[k + 1];
        int[] output = new int[arr.length];

        for (int x : arr) count[x]++;
        for (int i = 1; i <= k; i++) count[i] += count[i - 1];
        for (int i = arr.length - 1; i >= 0; i--)
            output[--count[arr[i]]] = arr[i];
        return output;
    }

    public static void main(String[] args) {
        int[] arr = {4, 2, 2, 8, 3, 3, 1};
        int k = Arrays.stream(arr).max().getAsInt();
        arr = countingSort(arr, k);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function countingSort(arr, k) {
    const count = new Array(k + 1).fill(0);
    const output = new Array(arr.length);

    for (const x of arr) count[x]++;
    for (let i = 1; i <= k; i++) count[i] += count[i - 1];
    for (let i = arr.length - 1; i >= 0; i--)
        output[--count[arr[i]]] = arr[i];
    return output;
}

const arr = [4, 2, 2, 8, 3, 3, 1];
const k = Math.max(...arr);
const sorted = countingSort(arr, k);
console.log("Sorted:", sorted);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void countingSort(int* arr, int n, int k) {
    int* count = (int*)calloc(k + 1, sizeof(int));
    int* output = (int*)malloc(n * sizeof(int));

    for (int i = 0; i < n; i++) count[arr[i]]++;
    for (int i = 1; i <= k; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--)
        output[--count[arr[i]]] = arr[i];
    memcpy(arr, output, n * sizeof(int));
    free(count); free(output);
}

int main() {
    int arr[] = {4, 2, 2, 8, 3, 3, 1};
    int n = sizeof(arr)/sizeof(arr[0]), k = 0;
    for (int i = 0; i < n; i++) if (arr[i] > k) k = arr[i];
    countingSort(arr, n, k);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static int[] CountingSort(int[] arr, int k) {
        int[] count = new int[k + 1];
        int[] output = new int[arr.Length];

        foreach (int x in arr) count[x]++;
        for (int i = 1; i <= k; i++) count[i] += count[i - 1];
        for (int i = arr.Length - 1; i >= 0; i--)
            output[--count[arr[i]]] = arr[i];
        return output;
    }

    static void Main() {
        int[] arr = {4, 2, 2, 8, 3, 3, 1};
        int k = 0;
        foreach (int x in arr) if (x > k) k = x;
        arr = CountingSort(arr, k);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func countingSort(_ arr: [Int], _ k: Int) -> [Int] {
    var count = Array(repeating: 0, count: k + 1)
    var output = Array(repeating: 0, count: arr.count)

    for x in arr { count[x] += 1 }
    for i in 1...k { count[i] += count[i - 1] }
    for i in stride(from: arr.count - 1, through: 0, by: -1) {
        count[arr[i]] -= 1
        output[count[arr[i]]] = arr[i]
    }
    return output
}

let arr = [4, 2, 2, 8, 3, 3, 1]
let k = arr.max()!
let sorted = countingSort(arr, k)
print("Sorted: \\(sorted)")`,

  "kotlin": `fun countingSort(arr: IntArray, k: Int): IntArray {
    val count = IntArray(k + 1)
    val output = IntArray(arr.size)

    for (x in arr) count[x]++
    for (i in 1..k) count[i] += count[i - 1]
    for (i in arr.indices.reversed()) {
        count[arr[i]]--
        output[count[arr[i]]] = arr[i]
    }
    return output
}

fun main() {
    val arr = intArrayOf(4, 2, 2, 8, 3, 3, 1)
    val k = arr.max()!!
    val sorted = countingSort(arr, k)
    println("Sorted: \${sorted.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def countingSort(arr: Array[Int], k: Int): Array[Int] = {
        val count = new Array[Int](k + 1)
        val output = new Array[Int](arr.length)

        for (x <- arr) count(x) += 1
        for (i <- 1 to k) count(i) += count(i - 1)
        for (i <- arr.length - 1 to 0 by -1) {
            count(arr(i)) -= 1
            output(count(arr(i))) = arr(i)
        }
        output
    }

    val arr = Array(4, 2, 2, 8, 3, 3, 1)
    val k = arr.max
    val sorted = countingSort(arr, k)
    println(s"Sorted: \${sorted.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func countingSort(arr []int, k int) []int {
    count := make([]int, k+1)
    output := make([]int, len(arr))

    for _, x := range arr { count[x]++ }
    for i := 1; i <= k; i++ { count[i] += count[i-1] }
    for i := len(arr) - 1; i >= 0; i-- {
        count[arr[i]]--
        output[count[arr[i]]] = arr[i]
    }
    return output
}

func main() {
    arr := []int{4, 2, 2, 8, 3, 3, 1}
    k := 0
    for _, x := range arr { if x > k { k = x } }
    sorted := countingSort(arr, k)
    fmt.Println("Sorted:", sorted)
}`,

  "rust": `fn counting_sort(arr: &Vec<i32>, k: usize) -> Vec<i32> {
    let mut count = vec![0i32; k + 1];
    let mut output = vec![0i32; arr.len()];

    for &x in arr { count[x as usize] += 1; }
    for i in 1..=k { count[i] += count[i - 1]; }
    for i in (0..arr.len()).rev() {
        count[arr[i] as usize] -= 1;
        output[count[arr[i] as usize] as usize] = arr[i];
    }
    output
}

fn main() {
    let arr = vec![4, 2, 2, 8, 3, 3, 1];
    let k = *arr.iter().max().unwrap() as usize;
    let sorted = counting_sort(&arr, k);
    println!("Sorted: {:?}", sorted);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       7. SELECTION SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Selection Sort",
      href: "/algorithms/sorting/selection-sort",
      type: "Easy",

      about: [
        { tag: "h1", text: "Selection Sort" },
        { tag: "p", text: "Selection Sort divides the array into a sorted prefix and an unsorted suffix. On each pass, it scans the entire unsorted suffix to find the minimum element, then swaps it into the next position of the sorted prefix — growing the sorted region by exactly one element per pass." },
        { tag: "p", text: "It is rarely the right choice for large datasets due to its unconditional O(n²) comparisons even on already-sorted input, but it has one genuinely useful property: it performs at most n − 1 swaps total, the fewest of any comparison-based sort, which matters when swaps are expensive (e.g. writing to flash memory or very large records) even though comparisons are cheap." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Not stable in its standard form (the minimum-finding swap can jump an element past an equal one)",
          "In-place — O(1) auxiliary space",
          "Always exactly n − 1 swaps regardless of input — useful when write/swap cost dominates over comparison cost",
          "Not adaptive — always O(n²) comparisons even on already-sorted data, unlike Bubble or Insertion Sort"
        ]},
        { tag: "note", variant: "info", text: "Choose Selection Sort specifically when minimising the NUMBER of writes matters more than minimising comparisons — for example, sorting data on a medium with expensive or limited write cycles." }
      ],

      timeComplexityCalculation: {
        notation: "O(n²)",
        best: [
          { tag: "h2", text: "Best Case — O(n²)" },
          { tag: "p", text: "Selection Sort always scans the entire remaining unsorted suffix to find the minimum, even if the array is already perfectly sorted — there is no early-exit mechanism." },
          { tag: "ul", items: [
            "Pass i still scans all n − i remaining elements to confirm which is the minimum, regardless of whether they're already in order",
            "Total comparisons: (n−1) + (n−2) + ... + 1 = n(n−1)/2 → O(n²)",
            "This is identical to the worst case — Selection Sort has no input-sensitive shortcut"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n²)" },
          { tag: "p", text: "Since the comparison count is fixed by the algorithm's structure (always scan the full remaining suffix) and not by the values encountered, average case is identical to best and worst case in comparison count." },
          { tag: "ul", items: [
            "n(n−1)/2 comparisons total, regardless of value distribution",
            "Swap count varies by distribution (0 to n−1 swaps) but doesn't change the asymptotic class, since comparisons dominate"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          { tag: "p", text: "The comparison count for Selection Sort is provably constant across all inputs of a given length — the algorithm structurally requires scanning the full unsorted suffix every single pass." },
          { tag: "ul", items: [
            "n(n−1)/2 comparisons, identical to best and average case",
            "Maximum n − 1 swaps occurs when the array is in exactly reverse order",
            "O(n²) is both the floor and ceiling for this algorithm's comparison count"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Sorting is entirely in-place — only a few index variables track the current pass boundary and the running minimum's position." },
          { tag: "ul", items: ["minIndex, i, j loop variables — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never grows with n or with input value distribution — it's always the same fixed handful of scalars." },
          { tag: "ul", items: ["No auxiliary array — identical memory footprint regardless of input"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even the maximum possible n − 1 swaps don't require any additional memory beyond a single temp variable used during each swap." },
          { tag: "ul", items: ["minIndex, loop counters, one swap temp — O(1) regardless of n"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function selectionSort(arr):
    n ← length(arr)
    for i from 0 to n − 2:
        minIndex ← i
        for j from i + 1 to n − 1:
            if arr[j] < arr[minIndex]:
                minIndex ← j
        if minIndex != i:
            swap(arr[i], arr[minIndex])
    return arr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Outer loop tracks the boundary between the sorted prefix (indices 0..i-1) and unsorted suffix (indices i..n-1).",
          "Inner loop scans the entire unsorted suffix to find the index of its minimum element.",
          "After the scan, swap the found minimum into position i — extending the sorted prefix by one element.",
          "Repeat for the next position until only one element remains (which is trivially in its correct place)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at the start of iteration i, arr[0..i-1] contains the i smallest elements of the array, in sorted order. The inner loop correctly identifies the true minimum of the remaining elements arr[i..n-1], and swapping it into position i extends the invariant to i+1 elements. By induction, after n − 1 outer iterations, the entire array satisfies the invariant for i = n, meaning it's fully sorted." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        if (minIdx != i) swap(arr[i], arr[minIdx]);
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11};
    selectionSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        if min_idx != i:
            arr[i], arr[min_idx] = arr[min_idx], arr[i]

if __name__ == "__main__":
    arr = [64, 25, 12, 22, 11]
    selection_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++)
                if (arr[j] < arr[minIdx]) minIdx = j;
            if (minIdx != i) {
                int temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 25, 12, 22, 11};
        selectionSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        if (minIdx !== i)
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
}

const arr = [64, 25, 12, 22, 11];
selectionSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>

void selectionSort(int* arr, int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[minIdx]) minIdx = j;
        if (minIdx != i) {
            int temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
        }
    }
}

int main() {
    int arr[] = {64, 25, 12, 22, 11};
    int n = sizeof(arr)/sizeof(arr[0]);
    selectionSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void SelectionSort(int[] arr) {
        int n = arr.Length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++)
                if (arr[j] < arr[minIdx]) minIdx = j;
            if (minIdx != i) {
                int temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp;
            }
        }
    }

    static void Main() {
        int[] arr = {64, 25, 12, 22, 11};
        SelectionSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func selectionSort(_ arr: inout [Int]) {
    let n = arr.count
    for i in 0..<n - 1 {
        var minIdx = i
        for j in (i + 1)..<n {
            if arr[j] < arr[minIdx] { minIdx = j }
        }
        if minIdx != i { arr.swapAt(i, minIdx) }
    }
}

var arr = [64, 25, 12, 22, 11]
selectionSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `fun selectionSort(arr: IntArray) {
    val n = arr.size
    for (i in 0 until n - 1) {
        var minIdx = i
        for (j in i + 1 until n)
            if (arr[j] < arr[minIdx]) minIdx = j
        if (minIdx != i) {
            val temp = arr[i]; arr[i] = arr[minIdx]; arr[minIdx] = temp
        }
    }
}

fun main() {
    val arr = intArrayOf(64, 25, 12, 22, 11)
    selectionSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def selectionSort(arr: Array[Int]): Unit = {
        val n = arr.length
        for (i <- 0 until n - 1) {
            var minIdx = i
            for (j <- i + 1 until n)
                if (arr(j) < arr(minIdx)) minIdx = j
            if (minIdx != i) {
                val temp = arr(i); arr(i) = arr(minIdx); arr(minIdx) = temp
            }
        }
    }

    val arr = Array(64, 25, 12, 22, 11)
    selectionSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func selectionSort(arr []int) {
    n := len(arr)
    for i := 0; i < n-1; i++ {
        minIdx := i
        for j := i + 1; j < n; j++ {
            if arr[j] < arr[minIdx] { minIdx = j }
        }
        if minIdx != i {
            arr[i], arr[minIdx] = arr[minIdx], arr[i]
        }
    }
}

func main() {
    arr := []int{64, 25, 12, 22, 11}
    selectionSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn selection_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    for i in 0..n - 1 {
        let mut min_idx = i;
        for j in i + 1..n {
            if arr[j] < arr[min_idx] { min_idx = j; }
        }
        if min_idx != i { arr.swap(i, min_idx); }
    }
}

fn main() {
    let mut arr = vec![64, 25, 12, 22, 11];
    selection_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       8. RADIX SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Radix Sort",
      href: "/algorithms/sorting/radix-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Radix Sort" },
        { tag: "p", text: "Radix Sort sorts integers (or fixed-length strings) by processing individual digits, from least-significant digit (LSD) to most-significant digit (MSD), using a stable sub-sort — almost always Counting Sort — at each digit position. After processing all d digits, the array is fully sorted." },
        { tag: "p", text: "It is another non-comparison sort, and its runtime O(d(n + k)) can beat O(n log n) when d (the number of digits) is small relative to log n — for example, sorting 32-bit integers takes at most a handful of passes regardless of how many billions of elements there are, as long as a sensible base/radix is chosen." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable, as long as the underlying digit sort (Counting Sort) is stable — this is essential, since LSD radix sort relies on stability across passes",
          "Not in-place — inherits Counting Sort's O(n + k) auxiliary space per pass",
          "Performs best when the key's bit-length/digit-count is small and fixed (fixed-width integers, fixed-length strings)",
          "Choice of base (radix) trades off number of passes (d) against per-pass cost (k) — base 256 (byte-wise) is common for integer sorting"
        ]},
        { tag: "note", variant: "tip", text: "Radix Sort is the standard choice for sorting large arrays of fixed-width integers (IDs, IP addresses, fixed-length strings) where it reliably beats comparison sorts in practice." }
      ],

      timeComplexityCalculation: {
        notation: "O(d(n + k))",
        best: [
          { tag: "h2", text: "Best Case — O(d(n + k))" },
          { tag: "p", text: "Radix Sort always performs exactly d full passes regardless of input order — each pass runs a complete Counting Sort over all n elements, so there is no early-exit shortcut for already-sorted data." },
          { tag: "ul", items: [
            "d = number of digits in the chosen base/radix representation of the largest key",
            "Each pass: O(n + k) for the underlying Counting Sort, where k is the radix (digit range, e.g. 10 or 256)",
            "Total: d × O(n + k) = O(d(n + k)), unconditionally"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(d(n + k))" },
          { tag: "p", text: "Like Counting Sort, every pass of Radix Sort performs the exact same fixed sequence of operations regardless of key value distribution, so there's no meaningful difference between average and worst case." },
          { tag: "ul", items: [
            "Every digit position is processed with an identical-cost Counting Sort pass: O(n + k) each",
            "d such passes: O(d(n + k))",
            "When d and k are treated as constants (e.g. fixed 32-bit integers, base 256 → d = 4), this simplifies to O(n) — linear time"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(d(n + k))" },
          { tag: "p", text: "There is no adversarial input arrangement that increases Radix Sort's cost beyond its standard bound, since every digit pass does fixed O(n + k) work regardless of value order." },
          { tag: "ul", items: [
            "Worst case equals best case equals average case: O(d(n + k))",
            "The only way to increase total cost is to increase d (more digits, e.g. larger keys) or k (a larger radix/base), both of which are problem parameters, not properties of input ordering"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n + k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n + k)" },
          { tag: "p", text: "Each digit pass reuses the same Counting Sort machinery: a count array of size k (the radix) and an output array of size n, both reallocated or reused per pass." },
          { tag: "ul", items: ["Count array per pass: O(k)", "Output array per pass: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n + k)" },
          { tag: "p", text: "Memory usage per pass is fixed by n and k, and passes can reuse the same buffers, so total space doesn't multiply by d — it stays O(n + k) regardless of how many digit passes run." },
          { tag: "ul", items: ["Buffers are reused across the d passes rather than allocated d times, so space stays O(n + k), not O(d(n + k))"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n + k)" },
          { tag: "p", text: "No input increases space beyond the reusable count and output buffers shared across all digit passes." },
          { tag: "ul", items: ["O(n) output buffer + O(k) count buffer, reused per digit pass — O(n + k) total regardless of d"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "LSD (least-significant-digit-first) Radix Sort for non-negative integers:" },
        { tag: "code", language: "text", text:
`function radixSort(arr):
    maxVal ← maximum element in arr
    exp    ← 1                       // current digit place: 1, 10, 100, ...

    while maxVal / exp > 0:
        countingSortByDigit(arr, exp)
        exp ← exp * 10

function countingSortByDigit(arr, exp):
    n      ← length(arr)
    output ← array of size n
    count  ← array of size 10, all zero

    for x in arr:
        digit ← (x / exp) mod 10
        count[digit] ← count[digit] + 1

    for i from 1 to 9:
        count[i] ← count[i] + count[i − 1]

    for i from n − 1 down to 0:
        digit ← (arr[i] / exp) mod 10
        count[digit] ← count[digit] − 1
        output[count[digit]] ← arr[i]

    copy output back into arr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Find the maximum value to determine how many digit positions (d) need processing.",
          "For each digit position, starting from the ones place (exp = 1) and moving toward more significant digits, run a stable Counting Sort keyed on just that digit.",
          "Because Counting Sort is stable, elements that tie on the current digit retain their relative order from the previous (less significant) pass.",
          "After processing the most significant digit, the array is fully sorted — the cumulative effect of d stable sorts, each refining the order established by the previous pass."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness rests on a key claim: after sorting by digit position i (using a stable sort and considering only digits 0..i), the array is correctly sorted with respect to the number formed by digits 0..i, with ties broken by original input order. By induction on i, once digit position d−1 (the most significant) is processed, the array is sorted by the full numeric value, since every more-significant digit dominates the comparison and stability preserves the correct tie-breaking established by all the less-significant passes before it." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void countingSortByDigit(vector<int>& arr, int exp) {
    int n = arr.size();
    vector<int> output(n), count(10, 0);
    for (int x : arr) count[(x / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
    }
    arr = output;
}

void radixSort(vector<int>& arr) {
    int maxVal = *max_element(arr.begin(), arr.end());
    for (int exp = 1; maxVal / exp > 0; exp *= 10)
        countingSortByDigit(arr, exp);
}

int main() {
    vector<int> arr = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def counting_sort_by_digit(arr, exp):
    n = len(arr)
    output = [0] * n
    count = [0] * 10
    for x in arr: count[(x // exp) % 10] += 1
    for i in range(1, 10): count[i] += count[i - 1]
    for i in range(n - 1, -1, -1):
        digit = (arr[i] // exp) % 10
        count[digit] -= 1
        output[count[digit]] = arr[i]
    for i in range(n): arr[i] = output[i]

def radix_sort(arr):
    max_val = max(arr)
    exp = 1
    while max_val // exp > 0:
        counting_sort_by_digit(arr, exp)
        exp *= 10

if __name__ == "__main__":
    arr = [170, 45, 75, 90, 802, 24, 2, 66]
    radix_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static void countingSortByDigit(int[] arr, int exp) {
        int n = arr.length;
        int[] output = new int[n], count = new int[10];
        for (int x : arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = n - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[--count[digit]] = arr[i];
        }
        System.arraycopy(output, 0, arr, 0, n);
    }

    static void radixSort(int[] arr) {
        int maxVal = Arrays.stream(arr).max().getAsInt();
        for (int exp = 1; maxVal / exp > 0; exp *= 10)
            countingSortByDigit(arr, exp);
    }

    public static void main(String[] args) {
        int[] arr = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function countingSortByDigit(arr, exp) {
    const n = arr.length;
    const output = new Array(n), count = new Array(10).fill(0);
    for (const x of arr) count[Math.floor(x / exp) % 10]++;
    for (let i = 1; i < 10; i++) count[i] += count[i - 1];
    for (let i = n - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
    }
    for (let i = 0; i < n; i++) arr[i] = output[i];
}

function radixSort(arr) {
    const maxVal = Math.max(...arr);
    for (let exp = 1; Math.floor(maxVal / exp) > 0; exp *= 10)
        countingSortByDigit(arr, exp);
}

const arr = [170, 45, 75, 90, 802, 24, 2, 66];
radixSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void countingSortByDigit(int* arr, int n, int exp) {
    int* output = (int*)malloc(n * sizeof(int));
    int count[10] = {0};
    for (int i = 0; i < n; i++) count[(arr[i] / exp) % 10]++;
    for (int i = 1; i < 10; i++) count[i] += count[i - 1];
    for (int i = n - 1; i >= 0; i--) {
        int digit = (arr[i] / exp) % 10;
        output[--count[digit]] = arr[i];
    }
    memcpy(arr, output, n * sizeof(int));
    free(output);
}

void radixSort(int* arr, int n) {
    int maxVal = arr[0];
    for (int i = 1; i < n; i++) if (arr[i] > maxVal) maxVal = arr[i];
    for (int exp = 1; maxVal / exp > 0; exp *= 10)
        countingSortByDigit(arr, n, exp);
}

int main() {
    int arr[] = {170, 45, 75, 90, 802, 24, 2, 66};
    int n = sizeof(arr)/sizeof(arr[0]);
    radixSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void CountingSortByDigit(int[] arr, int exp) {
        int n = arr.Length;
        int[] output = new int[n], count = new int[10];
        foreach (int x in arr) count[(x / exp) % 10]++;
        for (int i = 1; i < 10; i++) count[i] += count[i - 1];
        for (int i = n - 1; i >= 0; i--) {
            int digit = (arr[i] / exp) % 10;
            output[--count[digit]] = arr[i];
        }
        Array.Copy(output, arr, n);
    }

    static void RadixSort(int[] arr) {
        int maxVal = 0;
        foreach (int x in arr) if (x > maxVal) maxVal = x;
        for (int exp = 1; maxVal / exp > 0; exp *= 10)
            CountingSortByDigit(arr, exp);
    }

    static void Main() {
        int[] arr = {170, 45, 75, 90, 802, 24, 2, 66};
        RadixSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func countingSortByDigit(_ arr: inout [Int], _ exp: Int) {
    let n = arr.count
    var output = Array(repeating: 0, count: n)
    var count = Array(repeating: 0, count: 10)
    for x in arr { count[(x / exp) % 10] += 1 }
    for i in 1..<10 { count[i] += count[i - 1] }
    for i in stride(from: n - 1, through: 0, by: -1) {
        let digit = (arr[i] / exp) % 10
        count[digit] -= 1
        output[count[digit]] = arr[i]
    }
    arr = output
}

func radixSort(_ arr: inout [Int]) {
    let maxVal = arr.max()!
    var exp = 1
    while maxVal / exp > 0 {
        countingSortByDigit(&arr, exp)
        exp *= 10
    }
}

var arr = [170, 45, 75, 90, 802, 24, 2, 66]
radixSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `fun countingSortByDigit(arr: IntArray, exp: Int) {
    val n = arr.size
    val output = IntArray(n)
    val count = IntArray(10)
    for (x in arr) count[(x / exp) % 10]++
    for (i in 1..9) count[i] += count[i - 1]
    for (i in n - 1 downTo 0) {
        val digit = (arr[i] / exp) % 10
        count[digit]--
        output[count[digit]] = arr[i]
    }
    output.copyInto(arr)
}

fun radixSort(arr: IntArray) {
    val maxVal = arr.max()!!
    var exp = 1
    while (maxVal / exp > 0) {
        countingSortByDigit(arr, exp)
        exp *= 10
    }
}

fun main() {
    val arr = intArrayOf(170, 45, 75, 90, 802, 24, 2, 66)
    radixSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def countingSortByDigit(arr: Array[Int], exp: Int): Unit = {
        val n = arr.length
        val output = new Array[Int](n)
        val count = new Array[Int](10)
        for (x <- arr) count((x / exp) % 10) += 1
        for (i <- 1 until 10) count(i) += count(i - 1)
        for (i <- n - 1 to 0 by -1) {
            val digit = (arr(i) / exp) % 10
            count(digit) -= 1
            output(count(digit)) = arr(i)
        }
        output.copyToArray(arr)
    }

    def radixSort(arr: Array[Int]): Unit = {
        val maxVal = arr.max
        var exp = 1
        while (maxVal / exp > 0) {
            countingSortByDigit(arr, exp)
            exp *= 10
        }
    }

    val arr = Array(170, 45, 75, 90, 802, 24, 2, 66)
    radixSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func countingSortByDigit(arr []int, exp int) {
    n := len(arr)
    output := make([]int, n)
    count := make([]int, 10)
    for _, x := range arr { count[(x/exp)%10]++ }
    for i := 1; i < 10; i++ { count[i] += count[i-1] }
    for i := n - 1; i >= 0; i-- {
        digit := (arr[i] / exp) % 10
        count[digit]--
        output[count[digit]] = arr[i]
    }
    copy(arr, output)
}

func radixSort(arr []int) {
    maxVal := arr[0]
    for _, x := range arr { if x > maxVal { maxVal = x } }
    for exp := 1; maxVal/exp > 0; exp *= 10 {
        countingSortByDigit(arr, exp)
    }
}

func main() {
    arr := []int{170, 45, 75, 90, 802, 24, 2, 66}
    radixSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn counting_sort_by_digit(arr: &mut Vec<i32>, exp: i32) {
    let n = arr.len();
    let mut output = vec![0i32; n];
    let mut count = vec![0usize; 10];
    for &x in arr.iter() { count[((x / exp) % 10) as usize] += 1; }
    for i in 1..10 { count[i] += count[i - 1]; }
    for i in (0..n).rev() {
        let digit = ((arr[i] / exp) % 10) as usize;
        count[digit] -= 1;
        output[count[digit]] = arr[i];
    }
    arr.clone_from_slice(&output);
}

fn radix_sort(arr: &mut Vec<i32>) {
    let max_val = *arr.iter().max().unwrap();
    let mut exp = 1;
    while max_val / exp > 0 {
        counting_sort_by_digit(arr, exp);
        exp *= 10;
    }
}

fn main() {
    let mut arr = vec![170, 45, 75, 90, 802, 24, 2, 66];
    radix_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       9. INSERTION SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Insertion Sort",
      href: "/algorithms/sorting/insertion-sort",
      type: "Easy",

      about: [
        { tag: "h1", text: "Insertion Sort" },
        { tag: "p", text: "Insertion Sort builds the sorted array one element at a time, exactly the way most people sort a hand of playing cards: take the next unsorted card and insert it into its correct position among the already-sorted cards to its left, shifting larger cards rightward to make room." },
        { tag: "p", text: "Despite its O(n²) worst case, it has the best real-world performance of any simple sort on small or nearly-sorted arrays, which is precisely why Timsort and Introsort both fall back to Insertion Sort for small sub-arrays — its left constant factors and adaptiveness beat the overhead of recursive divide-and-conquer algorithms below a certain size threshold." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable — equal elements are never moved past each other, since shifting only happens for strictly-greater elements",
          "In-place — O(1) auxiliary space",
          "Highly adaptive — O(n) on already-sorted or nearly-sorted data, since the inner shifting loop barely runs",
          "Online — can sort a stream of data as it arrives, inserting each new element into the already-sorted portion without needing the full dataset upfront"
        ]},
        { tag: "note", variant: "tip", text: "Insertion Sort is the right default for small arrays (typically under ~16–64 elements) and for data that's already mostly sorted, which is exactly why production sort implementations switch to it below a size threshold." }
      ],

      timeComplexityCalculation: {
        notation: "O(n²)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "On an already-sorted array, every new element is already greater than or equal to everything before it, so the inner shifting loop terminates after a single comparison for each outer iteration." },
          { tag: "ul", items: [
            "Outer loop runs n − 1 times — one per element being inserted",
            "Inner loop performs exactly 1 comparison per outer iteration (immediately finds the correct, already-correct, position)",
            "Total: O(n) comparisons, zero shifts needed"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n²)" },
          { tag: "p", text: "For a randomly ordered array, each new element needs to shift past roughly half of the already-sorted prefix on average before finding its correct position." },
          { tag: "ul", items: [
            "Element at position i is expected to require ~i/2 shifts on average",
            "Summing over all i from 1 to n−1: Σ(i/2) ≈ n²/4 → O(n²)",
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          { tag: "p", text: "The worst case is a reverse-sorted array: every new element is smaller than everything already placed, forcing it to shift all the way to the front of the sorted prefix." },
          { tag: "ul", items: [
            "Element at position i requires exactly i shifts in the worst case",
            "Total shifts: 1 + 2 + ... + (n−1) = n(n−1)/2 → O(n²)",
            "Comparisons follow the same O(n²) bound, since each shift is preceded by a comparison"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Sorting happens entirely in-place by shifting elements within the original array — only one temporary variable holds the element currently being inserted." },
          { tag: "ul", items: ["key (the element being inserted) — O(1)", "i, j loop indices — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage is identical for any input, since shifting elements within the array requires no additional storage proportional to n." },
          { tag: "ul", items: ["No auxiliary array — same fixed footprint as best/worst case"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even when every element requires the maximum possible number of shifts, no extra memory beyond the single key variable is needed." },
          { tag: "ul", items: ["O(1) regardless of the number of shifts performed"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function insertionSort(arr):
    for i from 1 to length(arr) − 1:
        key ← arr[i]
        j ← i − 1

        while j >= 0 and arr[j] > key:
            arr[j + 1] ← arr[j]      // shift element rightward
            j ← j − 1

        arr[j + 1] ← key             // insert key into its correct slot
    return arr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Treat arr[0] as a trivially-sorted prefix of length 1.",
          "For each subsequent element (the 'key'), compare it against elements in the sorted prefix, working right to left.",
          "Shift each larger element one position to the right to make room.",
          "Stop shifting once you find an element ≤ key, or reach the start of the array.",
          "Insert key into the now-vacated slot — the sorted prefix has grown by one element."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at the start of outer-loop iteration i, arr[0..i-1] is sorted. The inner while-loop finds the correct insertion point for arr[i] within that sorted prefix by shifting all elements greater than key one step to the right, then places key into the gap. This extends the sorted prefix to arr[0..i] while preserving sorted order, so by induction the entire array is sorted once the outer loop completes." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    vector<int> arr = {12, 11, 13, 5, 6};
    insertionSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key

if __name__ == "__main__":
    arr = [12, 11, 13, 5, 6]
    insertion_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i], j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j]; j--;
            }
            arr[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 11, 13, 5, 6};
        insertionSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; j--;
        }
        arr[j + 1] = key;
    }
}

const arr = [12, 11, 13, 5, 6];
insertionSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>

void insertionSort(int* arr, int n) {
    for (int i = 1; i < n; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; j--;
        }
        arr[j + 1] = key;
    }
}

int main() {
    int arr[] = {12, 11, 13, 5, 6};
    int n = sizeof(arr)/sizeof(arr[0]);
    insertionSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void InsertionSort(int[] arr) {
        for (int i = 1; i < arr.Length; i++) {
            int key = arr[i], j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j]; j--;
            }
            arr[j + 1] = key;
        }
    }

    static void Main() {
        int[] arr = {12, 11, 13, 5, 6};
        InsertionSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func insertionSort(_ arr: inout [Int]) {
    for i in 1..<arr.count {
        let key = arr[i]
        var j = i - 1
        while j >= 0 && arr[j] > key {
            arr[j + 1] = arr[j]; j -= 1
        }
        arr[j + 1] = key
    }
}

var arr = [12, 11, 13, 5, 6]
insertionSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `fun insertionSort(arr: IntArray) {
    for (i in 1 until arr.size) {
        val key = arr[i]; var j = i - 1
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j]; j--
        }
        arr[j + 1] = key
    }
}

fun main() {
    val arr = intArrayOf(12, 11, 13, 5, 6)
    insertionSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def insertionSort(arr: Array[Int]): Unit = {
        for (i <- 1 until arr.length) {
            val key = arr(i); var j = i - 1
            while (j >= 0 && arr(j) > key) {
                arr(j + 1) = arr(j); j -= 1
            }
            arr(j + 1) = key
        }
    }

    val arr = Array(12, 11, 13, 5, 6)
    insertionSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func insertionSort(arr []int) {
    for i := 1; i < len(arr); i++ {
        key := arr[i]; j := i - 1
        for j >= 0 && arr[j] > key {
            arr[j+1] = arr[j]; j--
        }
        arr[j+1] = key
    }
}

func main() {
    arr := []int{12, 11, 13, 5, 6}
    insertionSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn insertion_sort(arr: &mut Vec<i32>) {
    for i in 1..arr.len() {
        let key = arr[i];
        let mut j = i;
        while j > 0 && arr[j - 1] > key {
            arr[j] = arr[j - 1];
            j -= 1;
        }
        arr[j] = key;
    }
}

fn main() {
    let mut arr = vec![12, 11, 13, 5, 6];
    insertion_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       10. BUCKET SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Bucket Sort",
      href: "/algorithms/sorting/bucket-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Bucket Sort" },
        { tag: "p", text: "Bucket Sort distributes elements into a number of 'buckets' based on their value range, sorts each bucket individually (typically with Insertion Sort, since buckets are expected to be small), and then concatenates the sorted buckets in order to produce the final sorted array." },
        { tag: "p", text: "It achieves linear expected time when the input is uniformly distributed across a known range — each bucket then receives roughly n/k elements, so sorting all buckets costs O(n) total instead of O(n log n). It degrades to O(n²) if all elements land in a single bucket (e.g. highly skewed or clustered data), making the bucket boundary strategy critical to its performance." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Stable, as long as the per-bucket sort used is stable (e.g. Insertion Sort)",
          "Not in-place — requires O(n + k) auxiliary space for the buckets",
          "Best suited to uniformly distributed floating-point or numeric data over a known range",
          "Performance is highly sensitive to the distribution of input values relative to the chosen bucket boundaries"
        ]},
        { tag: "note", variant: "warning", text: "Bucket Sort assumes you know enough about the input distribution to choose sensible bucket ranges — for unknown or adversarial distributions, a comparison sort with a guaranteed bound is safer." }
      ],

      timeComplexityCalculation: {
        notation: "O(n + k)",
        best: [
          { tag: "h2", text: "Best Case — O(n + k)" },
          { tag: "p", text: "When input is uniformly distributed across the bucket ranges, each of the k buckets receives roughly n/k elements, and sorting each small bucket with Insertion Sort is fast since bucket sizes are small." },
          { tag: "ul", items: [
            "Distributing n elements into k buckets: O(n)",
            "Sorting each bucket (expected size n/k) with Insertion Sort: O((n/k)²) per bucket on average, but since buckets are small this stays near-linear in aggregate",
            "Concatenating all k buckets: O(n + k)",
            "Total expected: O(n + k)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n + k)" },
          { tag: "p", text: "For a reasonably uniform distribution, the expected total cost across all buckets remains linear because the sum of squared bucket sizes is minimised when sizes are balanced — a standard result from the analysis of hashing-with-chaining, which Bucket Sort closely resembles." },
          { tag: "ul", items: [
            "Expected per-bucket size: n/k, giving expected per-bucket sort cost of O((n/k)²)",
            "Summed across k buckets: k × O((n/k)²) = O(n²/k), which is O(n) when k is chosen proportional to n",
            "Total average case: O(n + k)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          { tag: "p", text: "If the input distribution is highly skewed and every element lands in the same single bucket, that one bucket must be sorted with Insertion Sort over all n elements, degenerating to the same worst case as plain Insertion Sort." },
          { tag: "ul", items: [
            "All n elements in one bucket → Insertion Sort on n elements: O(n²)",
            "The remaining k − 1 buckets are empty and cost nothing",
            "This worst case can be mitigated by choosing bucket boundaries adaptively based on the actual data distribution rather than fixed a priori"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n + k)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n + k)" },
          { tag: "p", text: "Every element is copied into exactly one bucket, and k bucket containers must be allocated regardless of how the data ends up distributed." },
          { tag: "ul", items: ["n elements total across all buckets: O(n)", "k bucket containers: O(k)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n + k)" },
          { tag: "p", text: "Space usage is fixed by n (total elements) and k (number of buckets), regardless of how evenly the elements are distributed among them." },
          { tag: "ul", items: ["Same O(n + k) bound holds for any distribution, since total element count and bucket count don't change"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n + k)" },
          { tag: "p", text: "Even in the degenerate single-bucket case, total space is unchanged — one bucket simply holds all n elements instead of them being spread out." },
          { tag: "ul", items: ["O(n) for element storage (concentrated or spread) + O(k) for bucket containers — space bound doesn't change even though time degrades"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Bucket Sort for floating-point values uniformly distributed in [0, 1):" },
        { tag: "code", language: "text", text:
`function bucketSort(arr):
    n ← length(arr)
    buckets ← array of n empty lists

    // Step 1: distribute elements into buckets
    for x in arr:
        bucketIndex ← floor(x * n)
        append x to buckets[bucketIndex]

    // Step 2: sort each bucket individually
    for each bucket in buckets:
        insertionSort(bucket)

    // Step 3: concatenate buckets in order
    result ← empty array
    for each bucket in buckets:
        append all elements of bucket to result

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Create n empty buckets, each responsible for a sub-range of the overall value range.",
          "Map each input element to a bucket index based on its value (here, x * n for values uniformly in [0,1)) — elements with similar values land in the same or adjacent buckets.",
          "Sort each bucket individually with a simple algorithm like Insertion Sort, which is efficient because buckets are expected to be small.",
          "Concatenate the sorted buckets in index order — since bucket 0 holds the smallest range and bucket n−1 the largest, the concatenation is already globally sorted."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness depends on two facts: first, the bucket-index function must be monotonic — if x < y then x's bucket index is ≤ y's bucket index, ensuring no element in an earlier bucket is ever greater than an element in a later bucket. Second, each bucket is independently sorted before concatenation. Together, these guarantee that concatenating the buckets in order produces a fully sorted array, since within-bucket order is correct (by the bucket's own sort) and across-bucket order is correct (by the monotonic mapping)." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void bucketSort(vector<float>& arr) {
    int n = arr.size();
    vector<vector<float>> buckets(n);

    for (float x : arr)
        buckets[(int)(x * n)].push_back(x);

    for (auto& bucket : buckets)
        sort(bucket.begin(), bucket.end());

    int idx = 0;
    for (auto& bucket : buckets)
        for (float x : bucket)
            arr[idx++] = x;
}

int main() {
    vector<float> arr = {0.897f, 0.565f, 0.656f, 0.1234f, 0.665f, 0.3434f};
    bucketSort(arr);
    cout << "Sorted: ";
    for (float x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def insertion_sort_bucket(bucket):
    for i in range(1, len(bucket)):
        key = bucket[i]; j = i - 1
        while j >= 0 and bucket[j] > key:
            bucket[j + 1] = bucket[j]; j -= 1
        bucket[j + 1] = key

def bucket_sort(arr):
    n = len(arr)
    buckets = [[] for _ in range(n)]
    for x in arr:
        buckets[int(x * n)].append(x)
    for bucket in buckets:
        insertion_sort_bucket(bucket)
    result = []
    for bucket in buckets:
        result.extend(bucket)
    return result

if __name__ == "__main__":
    arr = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
    arr = bucket_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.*;

public class Main {
    static void bucketSort(float[] arr) {
        int n = arr.length;
        List<List<Float>> buckets = new ArrayList<>();
        for (int i = 0; i < n; i++) buckets.add(new ArrayList<>());

        for (float x : arr) buckets.get((int)(x * n)).add(x);
        for (List<Float> bucket : buckets) Collections.sort(bucket);

        int idx = 0;
        for (List<Float> bucket : buckets)
            for (float x : bucket) arr[idx++] = x;
    }

    public static void main(String[] args) {
        float[] arr = {0.897f, 0.565f, 0.656f, 0.1234f, 0.665f, 0.3434f};
        bucketSort(arr);
        System.out.print("Sorted: ");
        for (float x : arr) System.out.print(x + " ");
        System.out.println();
    }
}`,

  "js": `function bucketSort(arr) {
    const n = arr.length;
    const buckets = Array.from({length: n}, () => []);

    for (const x of arr) buckets[Math.floor(x * n)].push(x);
    for (const bucket of buckets) bucket.sort((a, b) => a - b);

    return buckets.flat();
}

const arr = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434];
const sorted = bucketSort(arr);
console.log("Sorted:", sorted);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

typedef struct Node { float val; struct Node* next; } Node;

void insertSorted(Node** head, float val) {
    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->val = val; newNode->next = NULL;
    if (!*head || (*head)->val >= val) { newNode->next = *head; *head = newNode; return; }
    Node* curr = *head;
    while (curr->next && curr->next->val < val) curr = curr->next;
    newNode->next = curr->next; curr->next = newNode;
}

void bucketSort(float* arr, int n) {
    Node** buckets = (Node**)calloc(n, sizeof(Node*));
    for (int i = 0; i < n; i++) insertSorted(&buckets[(int)(arr[i] * n)], arr[i]);
    int idx = 0;
    for (int i = 0; i < n; i++) {
        Node* curr = buckets[i];
        while (curr) { arr[idx++] = curr->val; Node* tmp = curr; curr = curr->next; free(tmp); }
    }
    free(buckets);
}

int main() {
    float arr[] = {0.897f, 0.565f, 0.656f, 0.1234f, 0.665f, 0.3434f};
    int n = sizeof(arr)/sizeof(arr[0]);
    bucketSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%.4f ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;
using System.Collections.Generic;

class Program {
    static float[] BucketSort(float[] arr) {
        int n = arr.Length;
        var buckets = new List<float>[n];
        for (int i = 0; i < n; i++) buckets[i] = new List<float>();

        foreach (float x in arr) buckets[(int)(x * n)].Add(x);
        foreach (var bucket in buckets) bucket.Sort();

        var result = new List<float>();
        foreach (var bucket in buckets) result.AddRange(bucket);
        return result.ToArray();
    }

    static void Main() {
        float[] arr = {0.897f, 0.565f, 0.656f, 0.1234f, 0.665f, 0.3434f};
        arr = BucketSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func bucketSort(_ arr: [Double]) -> [Double] {
    let n = arr.count
    var buckets = Array(repeating: [Double](), count: n)

    for x in arr { buckets[Int(x * Double(n))].append(x) }
    for i in 0..<n { buckets[i].sort() }

    return buckets.flatMap { $0 }
}

let arr = [0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434]
let sorted = bucketSort(arr)
print("Sorted: \\(sorted)")`,

  "kotlin": `fun bucketSort(arr: FloatArray): FloatArray {
    val n = arr.size
    val buckets = Array(n) { mutableListOf<Float>() }

    for (x in arr) buckets[(x * n).toInt()].add(x)
    for (bucket in buckets) bucket.sort()

    return buckets.flatMap { it }.toFloatArray()
}

fun main() {
    val arr = floatArrayOf(0.897f, 0.565f, 0.656f, 0.1234f, 0.665f, 0.3434f)
    val sorted = bucketSort(arr)
    println("Sorted: \${sorted.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def bucketSort(arr: Array[Double]): Array[Double] = {
        val n = arr.length
        val buckets = Array.fill(n)(scala.collection.mutable.ArrayBuffer[Double]())
        for (x <- arr) buckets((x * n).toInt) += x
        for (b <- buckets) b.sortInPlace()
        buckets.flatMap(identity)
    }

    val arr = Array(0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434)
    val sorted = bucketSort(arr)
    println(s"Sorted: \${sorted.mkString(", ")}")
}`,

  "go": `package main

import (
    "fmt"
    "sort"
)

func bucketSort(arr []float64) []float64 {
    n := len(arr)
    buckets := make([][]float64, n)
    for i := range buckets { buckets[i] = []float64{} }

    for _, x := range arr { idx := int(x * float64(n)); buckets[idx] = append(buckets[idx], x) }
    for i := range buckets { sort.Float64s(buckets[i]) }

    result := []float64{}
    for _, b := range buckets { result = append(result, b...) }
    return result
}

func main() {
    arr := []float64{0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434}
    sorted := bucketSort(arr)
    fmt.Println("Sorted:", sorted)
}`,

  "rust": `fn bucket_sort(arr: Vec<f64>) -> Vec<f64> {
    let n = arr.len();
    let mut buckets: Vec<Vec<f64>> = vec![vec![]; n];

    for &x in &arr {
        let idx = (x * n as f64) as usize;
        let idx = idx.min(n - 1);
        buckets[idx].push(x);
    }
    for bucket in &mut buckets { bucket.sort_by(|a, b| a.partial_cmp(b).unwrap()); }

    buckets.into_iter().flatten().collect()
}

fn main() {
    let arr = vec![0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434];
    let sorted = bucket_sort(arr);
    println!("Sorted: {:?}", sorted);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       11. SHELL SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Shell Sort",
      href: "/algorithms/sorting/shell-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Shell Sort" },
        { tag: "p", text: "Shell Sort, invented by Donald Shell in 1959, is a generalisation of Insertion Sort that first sorts elements far apart from each other (using a large 'gap'), then progressively reduces the gap, sorting closer and closer pairs, until a final gap of 1 performs an ordinary Insertion Sort — but on data that's already nearly sorted, making that final pass very fast." },
        { tag: "p", text: "Its purpose is to fix Insertion Sort's biggest weakness: small out-of-place elements near the end of the array normally require many small shifts to reach their correct position. Sorting with a large gap first lets such elements move long distances in a single comparison-swap, dramatically reducing the total shifting work needed by the time the gap reaches 1." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Not stable — elements can be compared and swapped across different gap-sequence sub-arrays, potentially reordering equal elements",
          "In-place — O(1) auxiliary space",
          "Performance is highly dependent on the chosen gap sequence — the original Shell sequence (n/2, n/4, ..., 1) gives O(n²) worst case, but better sequences (Hibbard, Sedgewick, Knuth) achieve as left as O(n^(4/3)) or O(n log² n)",
          "A genuinely practical middle ground between simple O(n²) sorts and complex O(n log n) sorts for medium-sized arrays"
        ]},
        { tag: "note", variant: "info", text: "Shell Sort's exact complexity is one of the few sorting algorithms whose tight worst-case bound is still an open or sequence-dependent question — the bound quoted depends entirely on which gap sequence is used." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log² n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "On already-sorted input, each gapped Insertion Sort pass requires only a single comparison per element (just like ordinary Insertion Sort's best case), and there are O(log n) gap passes with a well-chosen sequence." },
          { tag: "ul", items: [
            "Each of the O(log n) gap passes does O(n) work in the best case (one comparison per element, no shifts)",
            "Total: O(n) per pass × O(log n) passes = O(n log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log² n)" },
          { tag: "p", text: "With Shell's original gap sequence (halving each time: n/2, n/4, ..., 1), empirical and theoretical analysis gives an average case around O(n^1.5) to O(n log² n) depending on the exact sequence — better gap sequences (e.g. Sedgewick's) tighten this further." },
          { tag: "ul", items: [
            "O(log n) gap passes using the halving sequence",
            "Each pass costs more than O(n) on average since gapped sub-arrays aren't fully sorted yet, but substantially less than a full O(n²) Insertion Sort because most large-distance inversions were already resolved by earlier, larger-gap passes",
            "Commonly cited average bound: O(n log² n) for good gap sequences"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          { tag: "p", text: "With the original Shell gap sequence (powers of 2), certain adversarial inputs can force each gapped pass to do nearly maximal work, giving an O(n²) worst case — better-chosen sequences like Sedgewick's reduce this worst-case bound substantially." },
          { tag: "ul", items: [
            "Shell's original sequence: proven worst case O(n²)",
            "Hibbard's sequence (2^k − 1): worst case O(n^1.5)",
            "Sedgewick's sequence: worst case O(n^(4/3))",
            "The gap sequence choice is the single biggest lever for improving Shell Sort's worst-case guarantee"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Like Insertion Sort, Shell Sort operates entirely in-place — the gap sequence is either computed on the fly or stored in a small fixed-size array." },
          { tag: "ul", items: ["gap, i, j loop variables — O(1)", "Optional precomputed gap sequence array — O(log n), negligible"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage is identical regardless of input values — it depends only on the (typically small, O(log n)) gap sequence, not on n directly for the working memory." },
          { tag: "ul", items: ["No auxiliary array proportional to n — same in-place footprint as Insertion Sort"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input increases memory usage beyond the fixed gap-tracking variables, regardless of how many shifts occur during any given pass." },
          { tag: "ul", items: ["O(1) extra space, identical to best and average case"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function shellSort(arr):
    n ← length(arr)
    gap ← floor(n / 2)

    while gap > 0:
        for i from gap to n − 1:
            temp ← arr[i]
            j ← i

            while j >= gap and arr[j − gap] > temp:
                arr[j] ← arr[j − gap]
                j ← j − gap

            arr[j] ← temp

        gap ← floor(gap / 2)

    return arr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Start with a large gap (commonly n/2).",
          "For each gap value, perform an Insertion Sort, but compare and shift elements that are 'gap' positions apart instead of adjacent — this is equivalent to running Insertion Sort independently on 'gap' interleaved sub-arrays.",
          "After completing a full pass at the current gap, halve the gap and repeat.",
          "When the gap finally reaches 1, perform one ordinary Insertion Sort pass — but by this point, the array is already nearly sorted, so this final pass is fast in practice."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Each gapped pass is, by construction, an ordinary Insertion Sort applied independently to 'gap' separate interleaved sub-sequences of the array (indices 0, gap, 2*gap, ...; indices 1, gap+1, 2*gap+1, ...; and so on) — and Insertion Sort is already proven correct for sorting any single sequence. Crucially, the final pass always uses gap = 1, which is a complete, ordinary Insertion Sort over the entire array — and a correct algorithm applied last always produces a correct final result, regardless of how 'pre-sorted' the input already is from earlier passes." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
using namespace std;

void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}

int main() {
    vector<int> arr = {12, 34, 54, 2, 3};
    shellSort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `def shell_sort(arr):
    n = len(arr)
    gap = n // 2
    while gap > 0:
        for i in range(gap, n):
            temp = arr[i]; j = i
            while j >= gap and arr[j - gap] > temp:
                arr[j] = arr[j - gap]; j -= gap
            arr[j] = temp
        gap //= 2

if __name__ == "__main__":
    arr = [12, 34, 54, 2, 3]
    shell_sort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static void shellSort(int[] arr) {
        int n = arr.length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i], j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap]; j -= gap;
                }
                arr[j] = temp;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {12, 34, 54, 2, 3};
        shellSort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `function shellSort(arr) {
    const n = arr.length;
    for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
        for (let i = gap; i < n; i++) {
            const temp = arr[i]; let j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap]; j -= gap;
            }
            arr[j] = temp;
        }
    }
}

const arr = [12, 34, 54, 2, 3];
shellSort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>

void shellSort(int* arr, int n) {
    for (int gap = n / 2; gap > 0; gap /= 2) {
        for (int i = gap; i < n; i++) {
            int temp = arr[i], j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap]; j -= gap;
            }
            arr[j] = temp;
        }
    }
}

int main() {
    int arr[] = {12, 34, 54, 2, 3};
    int n = sizeof(arr)/sizeof(arr[0]);
    shellSort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    static void ShellSort(int[] arr) {
        int n = arr.Length;
        for (int gap = n / 2; gap > 0; gap /= 2) {
            for (int i = gap; i < n; i++) {
                int temp = arr[i], j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap]; j -= gap;
                }
                arr[j] = temp;
            }
        }
    }

    static void Main() {
        int[] arr = {12, 34, 54, 2, 3};
        ShellSort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `func shellSort(_ arr: inout [Int]) {
    let n = arr.count
    var gap = n / 2
    while gap > 0 {
        for i in gap..<n {
            let temp = arr[i]; var j = i
            while j >= gap && arr[j - gap] > temp {
                arr[j] = arr[j - gap]; j -= gap
            }
            arr[j] = temp
        }
        gap /= 2
    }
}

var arr = [12, 34, 54, 2, 3]
shellSort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `fun shellSort(arr: IntArray) {
    val n = arr.size
    var gap = n / 2
    while (gap > 0) {
        for (i in gap until n) {
            val temp = arr[i]; var j = i
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap]; j -= gap
            }
            arr[j] = temp
        }
        gap /= 2
    }
}

fun main() {
    val arr = intArrayOf(12, 34, 54, 2, 3)
    shellSort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `object Main extends App {
    def shellSort(arr: Array[Int]): Unit = {
        val n = arr.length
        var gap = n / 2
        while (gap > 0) {
            for (i <- gap until n) {
                val temp = arr(i); var j = i
                while (j >= gap && arr(j - gap) > temp) {
                    arr(j) = arr(j - gap); j -= gap
                }
                arr(j) = temp
            }
            gap /= 2
        }
    }

    val arr = Array(12, 34, 54, 2, 3)
    shellSort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import "fmt"

func shellSort(arr []int) {
    n := len(arr)
    for gap := n / 2; gap > 0; gap /= 2 {
        for i := gap; i < n; i++ {
            temp := arr[i]; j := i
            for j >= gap && arr[j-gap] > temp {
                arr[j] = arr[j-gap]; j -= gap
            }
            arr[j] = temp
        }
    }
}

func main() {
    arr := []int{12, 34, 54, 2, 3}
    shellSort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn shell_sort(arr: &mut Vec<i32>) {
    let n = arr.len();
    let mut gap = n / 2;
    while gap > 0 {
        for i in gap..n {
            let temp = arr[i]; let mut j = i;
            while j >= gap && arr[j - gap] > temp {
                arr[j] = arr[j - gap]; j -= gap;
            }
            arr[j] = temp;
        }
        gap /= 2;
    }
}

fn main() {
    let mut arr = vec![12, 34, 54, 2, 3];
    shell_sort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       12. INTROSORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Introsort",
      href: "/algorithms/sorting/intro-sort",
      type: "Hard",

      about: [
        { tag: "h1", text: "Introsort" },
        { tag: "p", text: "Introsort ('introspective sort'), designed by David Musser in 1997, is a hybrid algorithm that begins as Quick Sort but monitors its own recursion depth, switching to Heap Sort if the depth exceeds a threshold (typically 2·log₂ n) to guarantee O(n log n) worst-case time — directly solving Quick Sort's biggest weakness without sacrificing its excellent average-case speed." },
        { tag: "p", text: "It also falls back to Insertion Sort for small sub-arrays (typically below ~16 elements), exactly like Timsort does, since Insertion Sort's left overhead beats recursive divide-and-conquer at small sizes. This three-way hybrid (Quick Sort + Heap Sort + Insertion Sort) is the algorithm behind C++'s std::sort and .NET's Array.Sort, making it arguably the most widely deployed general-purpose comparison sort in production systems today." },
        { tag: "h2", text: "Key properties" },
        { tag: "ul", items: [
          "Not stable — inherits Quick Sort's in-place partitioning, which doesn't preserve relative order of equal elements",
          "In-place — O(log n) auxiliary space (recursion stack), same as Quick Sort",
          "Guaranteed O(n log n) worst case — the Heap Sort fallback eliminates Quick Sort's O(n²) pathological case entirely",
          "Combines the practical speed of Quick Sort, the worst-case safety of Heap Sort, and the small-array efficiency of Insertion Sort"
        ]},
        { tag: "note", variant: "tip", text: "Introsort is the practical answer to 'why not just always use Quick Sort' — it gets Quick Sort's real-world speed with none of its worst-case risk, which is exactly why it backs the standard library sort in C++ and .NET." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Identical to Quick Sort's best case — when partitions are balanced, recursion never approaches the depth threshold, so the algorithm runs as plain Quick Sort with O(n log n) total work." },
          { tag: "ul", items: [
            "Balanced partitions: O(n) work per level × O(log n) levels = O(n log n)",
            "Depth threshold (2 log₂ n) is never reached, so the Heap Sort fallback is never triggered",
            "Small sub-arrays below the cutoff are handled by Insertion Sort, contributing only a lower-order O(n) term"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "For typical inputs, Introsort behaves exactly like Quick Sort with good pivot selection, achieving the same expected O(n log n) bound, while the depth-monitoring safeguard sits idle (or rarely triggers) since random/typical pivots rarely produce pathologically unbalanced splits." },
          { tag: "ul", items: [
            "Expected behaviour matches standard randomised/median-of-three Quick Sort analysis: O(n log n)",
            "Insertion Sort handles the many small sub-arrays generated near the base of the recursion, which is faster in practice than recursing all the way down with Quick Sort alone"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "This is Introsort's entire reason for existing: the moment recursion depth would exceed the threshold (signalling Quick Sort is degenerating toward its O(n²) worst case), the algorithm switches that sub-array to Heap Sort, which has a proven O(n log n) worst-case bound regardless of input." },
          { tag: "ul", items: [
            "Depth threshold guarantees Quick-Sort-style recursion never proceeds past O(log n) levels without triggering the Heap Sort fallback",
            "Heap Sort on the remaining problematic sub-array costs O(m log m) where m is that sub-array's size — never worse than O(n log n) for the whole array",
            "Combined worst case: O(n log n), strictly better than plain Quick Sort's O(n²) worst case"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(log n)" },
          { tag: "p", text: "When operating as Quick Sort with balanced partitions, the recursion stack depth stays logarithmic, identical to Quick Sort's own best case." },
          { tag: "ul", items: ["Recursion stack: O(log n)", "No Heap Sort fallback triggered, so no additional heap-related space needed"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(log n)" },
          { tag: "p", text: "Average space usage matches Quick Sort's, since the depth-limiting mechanism rarely triggers on typical inputs and Heap Sort (when it does trigger) operates in-place with O(1) extra space anyway." },
          { tag: "ul", items: ["O(log n) for the Quick-Sort-style recursion stack", "Heap Sort fallback (if triggered) adds no extra space beyond O(1), since Heap Sort is itself in-place"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(log n)" },
          { tag: "p", text: "Because the depth threshold caps Quick-Sort-style recursion at O(log n) levels before forcing a switch to in-place Heap Sort, the worst-case space never reaches Quick Sort's pathological O(n) call-stack scenario." },
          { tag: "ul", items: [
            "Quick-Sort-style recursion stack: capped at O(log n) by design",
            "Heap Sort fallback: O(1) extra space (it's in-place)",
            "Total worst-case space: O(log n), a direct improvement over plain Quick Sort's worst-case O(n)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function introsort(arr):
    maxDepth ← 2 * floor(log2(length(arr)))
    introsortHelper(arr, 0, length(arr) − 1, maxDepth)

function introsortHelper(arr, left, right, depthLimit):
    size ← right − left + 1

    if size < INSERTION_THRESHOLD:        // e.g. 16
        insertionSort(arr, left, right)
        return

    if depthLimit == 0:
        heapSort(arr, left, right)          // depth exceeded — bail out to safe O(n log n)
        return

    pivotIndex ← partition(arr, left, right)   // Quick Sort partition (e.g. median-of-three pivot)
    introsortHelper(arr, left, pivotIndex − 1, depthLimit − 1)
    introsortHelper(arr, pivotIndex + 1, right, depthLimit − 1)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Compute a depth limit up front, typically 2·⌊log₂ n⌋ — generous enough to allow normal Quick-Sort-style recursion, but tight enough to catch pathological cases before they spiral into O(n²).",
          "At each recursive call, first check if the current sub-array is small enough to hand off to Insertion Sort, which is faster than further recursion at small sizes.",
          "If not small, check whether the remaining depth budget has been exhausted — if so, abandon Quick-Sort-style partitioning entirely and sort this sub-array with Heap Sort, guaranteeing O(m log m).",
          "Otherwise, perform a normal Quick Sort partition step and recurse into both halves with one less depth budget remaining."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Each of the three sub-algorithms (Insertion Sort, Quick Sort's partition-and-recurse, Heap Sort) is independently proven correct for sorting any sub-array passed to it. Introsort's correctness follows immediately because every code path leads to one of these three correct sorting procedures being applied to every sub-array — the depth-limit switch only changes WHICH correct algorithm finishes the job, never whether the result ends up sorted. The worst-case time guarantee follows because the depth limit caps how much 'wasted' unbalanced partitioning work Quick Sort can do before control is handed to the provably-bounded Heap Sort." }
      ],
      codes: {
  "c++": `#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
using namespace std;

const int INSERTION_THRESHOLD = 16;

void insertionSort(vector<int>& arr, int left, int right) {
    for (int i = left + 1; i <= right; i++) {
        int key = arr[i], j = i - 1;
        while (j >= left && arr[j] > key) { arr[j + 1] = arr[j]; j--; }
        arr[j + 1] = key;
    }
}

void siftDown(vector<int>& arr, int n, int i, int offset) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[offset+l] > arr[offset+largest]) largest = l;
    if (r < n && arr[offset+r] > arr[offset+largest]) largest = r;
    if (largest != i) {
        swap(arr[offset+i], arr[offset+largest]);
        siftDown(arr, n, largest, offset);
    }
}

void heapSort(vector<int>& arr, int left, int right) {
    int n = right - left + 1;
    for (int i = n/2-1; i >= 0; i--) siftDown(arr, n, i, left);
    for (int i = n-1; i > 0; i--) {
        swap(arr[left], arr[left+i]);
        siftDown(arr, i, 0, left);
    }
}

int partition(vector<int>& arr, int left, int right) {
    int pivot = arr[right], i = left - 1;
    for (int j = left; j < right; j++)
        if (arr[j] < pivot) { i++; swap(arr[i], arr[j]); }
    swap(arr[i+1], arr[right]);
    return i + 1;
}

void introsortHelper(vector<int>& arr, int left, int right, int depthLimit) {
    int size = right - left + 1;
    if (size < INSERTION_THRESHOLD) { insertionSort(arr, left, right); return; }
    if (depthLimit == 0) { heapSort(arr, left, right); return; }
    int p = partition(arr, left, right);
    introsortHelper(arr, left, p - 1, depthLimit - 1);
    introsortHelper(arr, p + 1, right, depthLimit - 1);
}

void introsort(vector<int>& arr) {
    int maxDepth = 2 * (int)log2(arr.size());
    introsortHelper(arr, 0, arr.size() - 1, maxDepth);
}

int main() {
    vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
    introsort(arr);
    cout << "Sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}`,

  "python": `import math

INSERTION_THRESHOLD = 16

def insertion_sort(arr, left, right):
    for i in range(left + 1, right + 1):
        key = arr[i]; j = i - 1
        while j >= left and arr[j] > key:
            arr[j + 1] = arr[j]; j -= 1
        arr[j + 1] = key

def sift_down(arr, n, i, offset):
    largest = i; l = 2*i+1; r = 2*i+2
    if l < n and arr[offset+l] > arr[offset+largest]: largest = l
    if r < n and arr[offset+r] > arr[offset+largest]: largest = r
    if largest != i:
        arr[offset+i], arr[offset+largest] = arr[offset+largest], arr[offset+i]
        sift_down(arr, n, largest, offset)

def heap_sort(arr, left, right):
    n = right - left + 1
    for i in range(n//2-1, -1, -1): sift_down(arr, n, i, left)
    for i in range(n-1, 0, -1):
        arr[left], arr[left+i] = arr[left+i], arr[left]
        sift_down(arr, i, 0, left)

def partition(arr, left, right):
    pivot = arr[right]; i = left - 1
    for j in range(left, right):
        if arr[j] < pivot:
            i += 1; arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[right] = arr[right], arr[i+1]
    return i + 1

def introsort_helper(arr, left, right, depth_limit):
    size = right - left + 1
    if size < INSERTION_THRESHOLD: insertion_sort(arr, left, right); return
    if depth_limit == 0: heap_sort(arr, left, right); return
    p = partition(arr, left, right)
    introsort_helper(arr, left, p - 1, depth_limit - 1)
    introsort_helper(arr, p + 1, right, depth_limit - 1)

def introsort(arr):
    max_depth = 2 * int(math.log2(len(arr)))
    introsort_helper(arr, 0, len(arr) - 1, max_depth)

if __name__ == "__main__":
    arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
    introsort(arr)
    print("Sorted:", arr)`,

  "java": `import java.util.Arrays;

public class Main {
    static final int INSERTION_THRESHOLD = 16;

    static void insertionSort(int[] arr, int left, int right) {
        for (int i = left + 1; i <= right; i++) {
            int key = arr[i], j = i - 1;
            while (j >= left && arr[j] > key) { arr[j+1] = arr[j]; j--; }
            arr[j+1] = key;
        }
    }

    static void siftDown(int[] arr, int n, int i, int offset) {
        int largest = i, l = 2*i+1, r = 2*i+2;
        if (l < n && arr[offset+l] > arr[offset+largest]) largest = l;
        if (r < n && arr[offset+r] > arr[offset+largest]) largest = r;
        if (largest != i) {
            int temp = arr[offset+i]; arr[offset+i] = arr[offset+largest]; arr[offset+largest] = temp;
            siftDown(arr, n, largest, offset);
        }
    }

    static void heapSort(int[] arr, int left, int right) {
        int n = right - left + 1;
        for (int i = n/2-1; i >= 0; i--) siftDown(arr, n, i, left);
        for (int i = n-1; i > 0; i--) {
            int temp = arr[left]; arr[left] = arr[left+i]; arr[left+i] = temp;
            siftDown(arr, i, 0, left);
        }
    }

    static int partition(int[] arr, int left, int right) {
        int pivot = arr[right], i = left - 1;
        for (int j = left; j < right; j++)
            if (arr[j] < pivot) { i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
        int t = arr[i+1]; arr[i+1] = arr[right]; arr[right] = t;
        return i + 1;
    }

    static void introsortHelper(int[] arr, int left, int right, int depthLimit) {
        int size = right - left + 1;
        if (size < INSERTION_THRESHOLD) { insertionSort(arr, left, right); return; }
        if (depthLimit == 0) { heapSort(arr, left, right); return; }
        int p = partition(arr, left, right);
        introsortHelper(arr, left, p - 1, depthLimit - 1);
        introsortHelper(arr, p + 1, right, depthLimit - 1);
    }

    static void introsort(int[] arr) {
        int maxDepth = 2 * (int)(Math.log(arr.length) / Math.log(2));
        introsortHelper(arr, 0, arr.length - 1, maxDepth);
    }

    public static void main(String[] args) {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
        introsort(arr);
        System.out.println("Sorted: " + Arrays.toString(arr));
    }
}`,

  "js": `const INSERTION_THRESHOLD = 16;

function insertionSort(arr, left, right) {
    for (let i = left + 1; i <= right; i++) {
        const key = arr[i]; let j = i - 1;
        while (j >= left && arr[j] > key) { arr[j+1] = arr[j]; j--; }
        arr[j+1] = key;
    }
}

function siftDown(arr, n, i, offset) {
    let largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[offset+l] > arr[offset+largest]) largest = l;
    if (r < n && arr[offset+r] > arr[offset+largest]) largest = r;
    if (largest !== i) {
        [arr[offset+i], arr[offset+largest]] = [arr[offset+largest], arr[offset+i]];
        siftDown(arr, n, largest, offset);
    }
}

function heapSort(arr, left, right) {
    const n = right - left + 1;
    for (let i = Math.floor(n/2)-1; i >= 0; i--) siftDown(arr, n, i, left);
    for (let i = n-1; i > 0; i--) {
        [arr[left], arr[left+i]] = [arr[left+i], arr[left]];
        siftDown(arr, i, 0, left);
    }
}

function partition(arr, left, right) {
    const pivot = arr[right]; let i = left - 1;
    for (let j = left; j < right; j++)
        if (arr[j] < pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    [arr[i+1], arr[right]] = [arr[right], arr[i+1]];
    return i + 1;
}

function introsortHelper(arr, left, right, depthLimit) {
    const size = right - left + 1;
    if (size < INSERTION_THRESHOLD) { insertionSort(arr, left, right); return; }
    if (depthLimit === 0) { heapSort(arr, left, right); return; }
    const p = partition(arr, left, right);
    introsortHelper(arr, left, p - 1, depthLimit - 1);
    introsortHelper(arr, p + 1, right, depthLimit - 1);
}

function introsort(arr) {
    const maxDepth = 2 * Math.floor(Math.log2(arr.length));
    introsortHelper(arr, 0, arr.length - 1, maxDepth);
}

const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
introsort(arr);
console.log("Sorted:", arr);`,

  "c": `#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#define INSERTION_THRESHOLD 16

void insertionSort(int* arr, int left, int right) {
    for (int i = left + 1; i <= right; i++) {
        int key = arr[i], j = i - 1;
        while (j >= left && arr[j] > key) { arr[j+1] = arr[j]; j--; }
        arr[j+1] = key;
    }
}

void siftDown(int* arr, int n, int i, int offset) {
    int largest = i, l = 2*i+1, r = 2*i+2;
    if (l < n && arr[offset+l] > arr[offset+largest]) largest = l;
    if (r < n && arr[offset+r] > arr[offset+largest]) largest = r;
    if (largest != i) {
        int tmp = arr[offset+i]; arr[offset+i] = arr[offset+largest]; arr[offset+largest] = tmp;
        siftDown(arr, n, largest, offset);
    }
}

void heapSort(int* arr, int left, int right) {
    int n = right - left + 1;
    for (int i = n/2-1; i >= 0; i--) siftDown(arr, n, i, left);
    for (int i = n-1; i > 0; i--) {
        int tmp = arr[left]; arr[left] = arr[left+i]; arr[left+i] = tmp;
        siftDown(arr, i, 0, left);
    }
}

int partition(int* arr, int left, int right) {
    int pivot = arr[right], i = left - 1;
    for (int j = left; j < right; j++)
        if (arr[j] < pivot) { i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    int t = arr[i+1]; arr[i+1] = arr[right]; arr[right] = t;
    return i + 1;
}

void introsortHelper(int* arr, int left, int right, int depthLimit) {
    int size = right - left + 1;
    if (size < INSERTION_THRESHOLD) { insertionSort(arr, left, right); return; }
    if (depthLimit == 0) { heapSort(arr, left, right); return; }
    int p = partition(arr, left, right);
    introsortHelper(arr, left, p - 1, depthLimit - 1);
    introsortHelper(arr, p + 1, right, depthLimit - 1);
}

void introsort(int* arr, int n) {
    int maxDepth = 2 * (int)(log2(n));
    introsortHelper(arr, 0, n - 1, maxDepth);
}

int main() {
    int arr[] = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
    int n = sizeof(arr)/sizeof(arr[0]);
    introsort(arr, n);
    printf("Sorted: ");
    for (int i = 0; i < n; i++) printf("%d ", arr[i]);
    printf("\\n");
    return 0;
}`,

  "c#": `using System;

class Program {
    const int INSERTION_THRESHOLD = 16;

    static void InsertionSort(int[] arr, int left, int right) {
        for (int i = left + 1; i <= right; i++) {
            int key = arr[i], j = i - 1;
            while (j >= left && arr[j] > key) { arr[j+1] = arr[j]; j--; }
            arr[j+1] = key;
        }
    }

    static void SiftDown(int[] arr, int n, int i, int offset) {
        int largest = i, l = 2*i+1, r = 2*i+2;
        if (l < n && arr[offset+l] > arr[offset+largest]) largest = l;
        if (r < n && arr[offset+r] > arr[offset+largest]) largest = r;
        if (largest != i) {
            int tmp = arr[offset+i]; arr[offset+i] = arr[offset+largest]; arr[offset+largest] = tmp;
            SiftDown(arr, n, largest, offset);
        }
    }

    static void HeapSort(int[] arr, int left, int right) {
        int n = right - left + 1;
        for (int i = n/2-1; i >= 0; i--) SiftDown(arr, n, i, left);
        for (int i = n-1; i > 0; i--) {
            int tmp = arr[left]; arr[left] = arr[left+i]; arr[left+i] = tmp;
            SiftDown(arr, i, 0, left);
        }
    }

    static int Partition(int[] arr, int left, int right) {
        int pivot = arr[right], i = left - 1;
        for (int j = left; j < right; j++)
            if (arr[j] < pivot) { i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
        int tmp2 = arr[i+1]; arr[i+1] = arr[right]; arr[right] = tmp2;
        return i + 1;
    }

    static void IntrosortHelper(int[] arr, int left, int right, int depthLimit) {
        int size = right - left + 1;
        if (size < INSERTION_THRESHOLD) { InsertionSort(arr, left, right); return; }
        if (depthLimit == 0) { HeapSort(arr, left, right); return; }
        int p = Partition(arr, left, right);
        IntrosortHelper(arr, left, p - 1, depthLimit - 1);
        IntrosortHelper(arr, p + 1, right, depthLimit - 1);
    }

    static void Introsort(int[] arr) {
        int maxDepth = 2 * (int)Math.Log(arr.Length, 2);
        IntrosortHelper(arr, 0, arr.Length - 1, maxDepth);
    }

    static void Main() {
        int[] arr = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5};
        Introsort(arr);
        Console.WriteLine("Sorted: " + string.Join(", ", arr));
    }
}`,

  "swift": `let INSERTION_THRESHOLD = 16

func insertionSort(_ arr: inout [Int], _ left: Int, _ right: Int) {
    for i in (left + 1)...right {
        let key = arr[i]; var j = i - 1
        while j >= left && arr[j] > key { arr[j+1] = arr[j]; j -= 1 }
        arr[j+1] = key
    }
}

func siftDown(_ arr: inout [Int], _ n: Int, _ i: Int, _ offset: Int) {
    var largest = i; let l = 2*i+1; let r = 2*i+2
    if l < n && arr[offset+l] > arr[offset+largest] { largest = l }
    if r < n && arr[offset+r] > arr[offset+largest] { largest = r }
    if largest != i {
        arr.swapAt(offset+i, offset+largest)
        siftDown(&arr, n, largest, offset)
    }
}

func heapSort(_ arr: inout [Int], _ left: Int, _ right: Int) {
    let n = right - left + 1
    for i in stride(from: n/2-1, through: 0, by: -1) { siftDown(&arr, n, i, left) }
    for i in stride(from: n-1, through: 1, by: -1) {
        arr.swapAt(left, left+i)
        siftDown(&arr, i, 0, left)
    }
}

func partition(_ arr: inout [Int], _ left: Int, _ right: Int) -> Int {
    let pivot = arr[right]; var i = left - 1
    for j in left..<right { if arr[j] < pivot { i += 1; arr.swapAt(i, j) } }
    arr.swapAt(i+1, right); return i + 1
}

func introsortHelper(_ arr: inout [Int], _ left: Int, _ right: Int, _ depthLimit: Int) {
    let size = right - left + 1
    if size < INSERTION_THRESHOLD { insertionSort(&arr, left, right); return }
    if depthLimit == 0 { heapSort(&arr, left, right); return }
    let p = partition(&arr, left, right)
    introsortHelper(&arr, left, p - 1, depthLimit - 1)
    introsortHelper(&arr, p + 1, right, depthLimit - 1)
}

func introsort(_ arr: inout [Int]) {
    let maxDepth = 2 * Int(log2(Double(arr.count)))
    introsortHelper(&arr, 0, arr.count - 1, maxDepth)
}

var arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5]
introsort(&arr)
print("Sorted: \\(arr)")`,

  "kotlin": `import kotlin.math.log2

const val INSERTION_THRESHOLD = 16

fun insertionSort(arr: IntArray, left: Int, right: Int) {
    for (i in left + 1..right) {
        val key = arr[i]; var j = i - 1
        while (j >= left && arr[j] > key) { arr[j+1] = arr[j]; j-- }
        arr[j+1] = key
    }
}

fun siftDown(arr: IntArray, n: Int, i: Int, offset: Int) {
    var largest = i; val l = 2*i+1; val r = 2*i+2
    if (l < n && arr[offset+l] > arr[offset+largest]) largest = l
    if (r < n && arr[offset+r] > arr[offset+largest]) largest = r
    if (largest != i) {
        val tmp = arr[offset+i]; arr[offset+i] = arr[offset+largest]; arr[offset+largest] = tmp
        siftDown(arr, n, largest, offset)
    }
}

fun heapSort(arr: IntArray, left: Int, right: Int) {
    val n = right - left + 1
    for (i in n/2-1 downTo 0) siftDown(arr, n, i, left)
    for (i in n-1 downTo 1) {
        val tmp = arr[left]; arr[left] = arr[left+i]; arr[left+i] = tmp
        siftDown(arr, i, 0, left)
    }
}

fun partition(arr: IntArray, left: Int, right: Int): Int {
    val pivot = arr[right]; var i = left - 1
    for (j in left until right)
        if (arr[j] < pivot) { i++; val t = arr[i]; arr[i] = arr[j]; arr[j] = t }
    val t = arr[i+1]; arr[i+1] = arr[right]; arr[right] = t
    return i + 1
}

fun introsortHelper(arr: IntArray, left: Int, right: Int, depthLimit: Int) {
    val size = right - left + 1
    if (size < INSERTION_THRESHOLD) { insertionSort(arr, left, right); return }
    if (depthLimit == 0) { heapSort(arr, left, right); return }
    val p = partition(arr, left, right)
    introsortHelper(arr, left, p - 1, depthLimit - 1)
    introsortHelper(arr, p + 1, right, depthLimit - 1)
}

fun introsort(arr: IntArray) {
    val maxDepth = (2 * log2(arr.size.toDouble())).toInt()
    introsortHelper(arr, 0, arr.size - 1, maxDepth)
}

fun main() {
    val arr = intArrayOf(3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5)
    introsort(arr)
    println("Sorted: \${arr.joinToString(", ")}")
}`,

  "scala": `import scala.math.log

object Main extends App {
    val INSERTION_THRESHOLD = 16

    def insertionSort(arr: Array[Int], left: Int, right: Int): Unit = {
        for (i <- left + 1 to right) {
            val key = arr(i); var j = i - 1
            while (j >= left && arr(j) > key) { arr(j+1) = arr(j); j -= 1 }
            arr(j+1) = key
        }
    }

    def siftDown(arr: Array[Int], n: Int, i: Int, offset: Int): Unit = {
        var largest = i; val l = 2*i+1; val r = 2*i+2
        if (l < n && arr(offset+l) > arr(offset+largest)) largest = l
        if (r < n && arr(offset+r) > arr(offset+largest)) largest = r
        if (largest != i) {
            val tmp = arr(offset+i); arr(offset+i) = arr(offset+largest); arr(offset+largest) = tmp
            siftDown(arr, n, largest, offset)
        }
    }

    def heapSort(arr: Array[Int], left: Int, right: Int): Unit = {
        val n = right - left + 1
        for (i <- n/2-1 to 0 by -1) siftDown(arr, n, i, left)
        for (i <- n-1 to 1 by -1) {
            val tmp = arr(left); arr(left) = arr(left+i); arr(left+i) = tmp
            siftDown(arr, i, 0, left)
        }
    }

    def partition(arr: Array[Int], left: Int, right: Int): Int = {
        val pivot = arr(right); var i = left - 1
        for (j <- left until right)
            if (arr(j) < pivot) { i += 1; val t = arr(i); arr(i) = arr(j); arr(j) = t }
        val t = arr(i+1); arr(i+1) = arr(right); arr(right) = t
        i + 1
    }

    def introsortHelper(arr: Array[Int], left: Int, right: Int, depthLimit: Int): Unit = {
        val size = right - left + 1
        if (size < INSERTION_THRESHOLD) { insertionSort(arr, left, right); return }
        if (depthLimit == 0) { heapSort(arr, left, right); return }
        val p = partition(arr, left, right)
        introsortHelper(arr, left, p - 1, depthLimit - 1)
        introsortHelper(arr, p + 1, right, depthLimit - 1)
    }

    def introsort(arr: Array[Int]): Unit = {
        val maxDepth = (2 * log(arr.length) / log(2)).toInt
        introsortHelper(arr, 0, arr.length - 1, maxDepth)
    }

    val arr = Array(3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5)
    introsort(arr)
    println(s"Sorted: \${arr.mkString(", ")}")
}`,

  "go": `package main

import (
    "fmt"
    "math"
)

const INSERTION_THRESHOLD = 16

func insertionSort(arr []int, left, right int) {
    for i := left + 1; i <= right; i++ {
        key := arr[i]; j := i - 1
        for j >= left && arr[j] > key { arr[j+1] = arr[j]; j-- }
        arr[j+1] = key
    }
}

func siftDown(arr []int, n, i, offset int) {
    largest, l, r := i, 2*i+1, 2*i+2
    if l < n && arr[offset+l] > arr[offset+largest] { largest = l }
    if r < n && arr[offset+r] > arr[offset+largest] { largest = r }
    if largest != i {
        arr[offset+i], arr[offset+largest] = arr[offset+largest], arr[offset+i]
        siftDown(arr, n, largest, offset)
    }
}

func heapSort(arr []int, left, right int) {
    n := right - left + 1
    for i := n/2 - 1; i >= 0; i-- { siftDown(arr, n, i, left) }
    for i := n - 1; i > 0; i-- {
        arr[left], arr[left+i] = arr[left+i], arr[left]
        siftDown(arr, i, 0, left)
    }
}

func partition(arr []int, left, right int) int {
    pivot := arr[right]; i := left - 1
    for j := left; j < right; j++ {
        if arr[j] < pivot { i++; arr[i], arr[j] = arr[j], arr[i] }
    }
    arr[i+1], arr[right] = arr[right], arr[i+1]
    return i + 1
}

func introsortHelper(arr []int, left, right, depthLimit int) {
    size := right - left + 1
    if size < INSERTION_THRESHOLD { insertionSort(arr, left, right); return }
    if depthLimit == 0 { heapSort(arr, left, right); return }
    p := partition(arr, left, right)
    introsortHelper(arr, left, p-1, depthLimit-1)
    introsortHelper(arr, p+1, right, depthLimit-1)
}

func introsort(arr []int) {
    maxDepth := 2 * int(math.Log2(float64(len(arr))))
    introsortHelper(arr, 0, len(arr)-1, maxDepth)
}

func main() {
    arr := []int{3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5}
    introsort(arr)
    fmt.Println("Sorted:", arr)
}`,

  "rust": `fn insertion_sort(arr: &mut Vec<i32>, left: usize, right: usize) {
    for i in (left + 1)..=right {
        let key = arr[i]; let mut j = i;
        while j > left && arr[j - 1] > key { arr[j] = arr[j - 1]; j -= 1; }
        arr[j] = key;
    }
}

fn sift_down(arr: &mut Vec<i32>, n: usize, i: usize, offset: usize) {
    let mut largest = i; let l = 2*i+1; let r = 2*i+2;
    if l < n && arr[offset+l] > arr[offset+largest] { largest = l; }
    if r < n && arr[offset+r] > arr[offset+largest] { largest = r; }
    if largest != i {
        arr.swap(offset+i, offset+largest);
        sift_down(arr, n, largest, offset);
    }
}

fn heap_sort(arr: &mut Vec<i32>, left: usize, right: usize) {
    let n = right - left + 1;
    for i in (0..n/2).rev() { sift_down(arr, n, i, left); }
    for i in (1..n).rev() {
        arr.swap(left, left+i);
        sift_down(arr, i, 0, left);
    }
}

fn partition(arr: &mut Vec<i32>, left: usize, right: usize) -> usize {
    let pivot = arr[right]; let mut i = left;
    for j in left..right { if arr[j] < pivot { arr.swap(i, j); i += 1; } }
    arr.swap(i, right); i
}

fn introsort_helper(arr: &mut Vec<i32>, left: usize, right: usize, depth_limit: usize) {
    let size = right - left + 1;
    if size < 16 { insertion_sort(arr, left, right); return; }
    if depth_limit == 0 { heap_sort(arr, left, right); return; }
    let p = partition(arr, left, right);
    if p > left { introsort_helper(arr, left, p - 1, depth_limit - 1); }
    introsort_helper(arr, p + 1, right, depth_limit - 1);
}

fn introsort(arr: &mut Vec<i32>) {
    let n = arr.len();
    let max_depth = 2 * (n as f64).log2() as usize;
    introsort_helper(arr, 0, n - 1, max_depth);
}

fn main() {
    let mut arr = vec![3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
    introsort(&mut arr);
    println!("Sorted: {:?}", arr);
}`
      }
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const GRAPHS_SECTION = {
  name: "Graphs",
  href: "/algorithms/graphs",
  desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd",
  complexity: "O(V + E)",
  count: 9,

  about: [
    { tag: "h1", text: "Graphs" },
    { tag: "p", text: "A graph is a collection of vertices (nodes) connected by edges, used to model anything with relationships: road networks, social connections, dependency chains, computer networks, and state-transition systems. Unlike trees, graphs can contain cycles and don't require a single root, which is why graph algorithms must explicitly track visited state to avoid infinite loops." },
    { tag: "p", text: "Most graph algorithms fall into a handful of families: traversal (BFS, DFS — visit every reachable node), shortest path (Dijkstra, Bellman-Ford, Floyd-Warshall — find minimum-cost routes), minimum spanning tree (Kruskal, Prim — connect all nodes at minimum total edge cost), and structural analysis (Topological Sort, Tarjan's SCC — extract ordering or connectivity structure)." },
    { tag: "h2", text: "Representation matters" },
    { tag: "p", text: "Almost every complexity bound below is expressed in terms of V (vertices) and E (edges), and which representation you use changes the constants involved. An adjacency list (array of neighbor lists per vertex) takes O(V + E) space and is the standard choice for sparse graphs. An adjacency matrix (V×V grid of edge weights/booleans) takes O(V²) space but gives O(1) edge-existence checks, which matters for dense graphs and for Floyd-Warshall specifically." },
    { tag: "table",
      headers: ["Algorithm", "Problem Solved", "Time", "Handles Negative Weights?"],
      rows: [
        ["BFS", "Shortest path by edge count (unweighted)", "O(V + E)", "N/A (unweighted)"],
        ["DFS", "Reachability, cycle detection, ordering", "O(V + E)", "N/A (unweighted)"],
        ["Topological Sort", "Linear ordering respecting DAG dependencies", "O(V + E)", "N/A"],
        ["Dijkstra's Algorithm", "Single-source shortest path, non-negative weights", "O((V+E) log V)", "No"],
        ["Bellman-Ford Algorithm", "Single-source shortest path, detects negative cycles", "O(VE)", "Yes"],
        ["Floyd-Warshall Algorithm", "All-pairs shortest path", "O(V³)", "Yes (no negative cycles)"],
        ["Kruskal's Algorithm", "Minimum spanning tree, edge-driven", "O(E log E)", "N/A (MST, not shortest path)"],
        ["Prim's Algorithm", "Minimum spanning tree, vertex-driven", "O((V+E) log V)", "N/A (MST, not shortest path)"],
        ["Tarjan's SCC", "Strongly connected components (directed graphs)", "O(V + E)", "N/A"]
      ]
    },
    { tag: "note", variant: "tip", text: "If edge weights can be negative, Dijkstra silently produces wrong answers without warning — always reach for Bellman-Ford instead when negative weights are possible." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. BREADTH-FIRST SEARCH (BFS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Breadth-First Search (BFS)",
      href: "/algorithms/graphs/bfs",
      type: "Easy",

      about: [
        { tag: "h1", text: "Breadth-First Search (BFS)" },
        { tag: "p", text: "BFS explores a graph level by level: it visits all neighbors of the starting node first, then all neighbors of those neighbors, and so on — expanding outward in concentric 'rings' from the source. It uses a queue (FIFO) to ensure nodes are processed in the order they were discovered, which is exactly what produces the level-by-level expansion pattern." },
        { tag: "p", text: "Its single most important property is that on an unweighted graph, the first time BFS reaches a node is guaranteed to be via a shortest path (fewest edges) from the source — this is why BFS is the standard algorithm for shortest-path-by-hop-count problems, not just generic traversal." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need the shortest path in terms of number of edges (unweighted graph)",
          "You need to find the minimum number of 'moves' or 'steps' in a state-space search (puzzle solving, word ladders, maze shortest path)",
          "You want to process a graph level-by-level (e.g. finding all nodes within k hops of a source)",
          "You need to check bipartiteness (BFS with 2-coloring) or find connected components"
        ]},
        { tag: "note", variant: "info", text: "BFS and DFS share the same O(V + E) time complexity — the choice between them is about what property you need (shortest unweighted path vs. simpler stack-based exploration), not about speed." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "Even if the target node is the very first neighbor discovered, BFS as a full traversal still visits every vertex and edge to maintain the queue-based invariant and avoid revisiting nodes — there's no asymptotic shortcut, though early-exit search variants can stop sooner in practice." },
          { tag: "ul", items: [
            "Every vertex is enqueued and dequeued at most once: O(V)",
            "Every edge is examined exactly once (or twice for undirected graphs, a constant factor): O(E)",
            "Total: O(V + E), even in the most favourable input"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "BFS performs the same fixed sequence of operations (enqueue, mark visited, examine neighbors) regardless of graph shape — the total work is structurally determined by V and E, not by the specific arrangement of edges." },
          { tag: "ul", items: [
            "Each vertex transitions through queue states exactly once: enqueued, then dequeued and processed — O(V) total",
            "Each edge is inspected exactly once per direction it represents — O(E) total",
            "Combined: O(V + E), regardless of graph topology"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "There's no adversarial graph structure that increases BFS's cost beyond visiting every vertex and edge exactly once — a dense graph with E close to V² simply makes the E term dominate, but the bound itself doesn't change form." },
          { tag: "ul", items: [
            "Worst case is identical to best/average in asymptotic form: O(V + E)",
            "For a dense graph (E ≈ V²), this becomes O(V²), but that's purely a consequence of the input's edge count, not algorithmic degeneration",
            "This matches the trivial lower bound: any correct traversal must examine every reachable vertex and edge at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "BFS needs a visited-set and a queue, both of which can hold up to V vertices in the worst layer-width scenario, even in the most favourable graph shape." },
          { tag: "ul", items: ["visited set/array: O(V)", "queue: up to O(V) entries at its widest point"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage scales with the number of vertices regardless of edge density, since the visited-tracking structure must accommodate every vertex." },
          { tag: "ul", items: ["visited array: O(V)", "queue: bounded by O(V) since each vertex enters at most once"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "In a 'star' or very wide graph, an entire layer of the BFS frontier can contain almost all V vertices simultaneously in the queue, but this still stays bounded by O(V) — it never exceeds the vertex count." },
          { tag: "ul", items: [
            "Maximum queue size: O(V) (bounded by total vertex count, can't exceed it)",
            "visited set: O(V)",
            "Total: O(V), independent of E"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function bfs(graph, source):
    visited ← set containing source
    queue   ← empty queue
    enqueue(queue, source)
    distance[source] ← 0

    while queue is not empty:
        current ← dequeue(queue)

        for neighbor in graph.adjacent(current):
            if neighbor not in visited:
                visited.add(neighbor)
                distance[neighbor] ← distance[current] + 1
                parent[neighbor] ← current
                enqueue(queue, neighbor)

    return distance, parent` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Mark the source as visited and enqueue it with distance 0.",
          "Repeatedly dequeue the front of the queue (the 'oldest' discovered, not-yet-expanded node).",
          "For each of its neighbors, if not already visited, mark it visited immediately upon discovery (critical: mark visited at enqueue time, not dequeue time, to avoid duplicate enqueues), record its distance as one more than the current node's, and enqueue it.",
          "Repeat until the queue is empty — every reachable vertex has now been visited exactly once, with the shortest hop-distance recorded."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: the queue, at any point, contains vertices from at most two consecutive 'distance layers' (distance d and d+1), and the queue is ordered so all distance-d vertices are dequeued before any distance-(d+1) vertex. By induction on distance d, this guarantees the first time any vertex is discovered, it's discovered via a path of length equal to its true shortest distance from the source — a vertex at true distance d cannot be discovered before all distance-(d-1) vertices have been fully processed, since it can only be reached through one of them." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. TOPOLOGICAL SORT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Topological Sort",
      href: "/algorithms/graphs/topological-sort",
      type: "Medium",

      about: [
        { tag: "h1", text: "Topological Sort" },
        { tag: "p", text: "Topological Sort produces a linear ordering of the vertices of a Directed Acyclic Graph (DAG) such that for every directed edge u → v, u appears before v in the ordering. It only makes sense for DAGs — a graph with a cycle has no valid topological order, since cyclic dependencies create a contradiction (A must come before B, but B must also come before A)." },
        { tag: "p", text: "Two standard approaches exist: Kahn's algorithm (BFS-based, repeatedly removing nodes with in-degree zero) and DFS-based (post-order traversal, reversed). Both run in O(V + E) and both naturally detect cycles as a side effect — Kahn's by failing to process all vertices, DFS-based by detecting a back-edge." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Build/task scheduling where some tasks depend on others completing first (build systems, package managers, course prerequisite ordering)",
          "Detecting circular dependencies (the algorithm fails or reports a cycle if one exists)",
          "Compiler/spreadsheet dependency resolution — determining the order to evaluate expressions",
          "As a preprocessing step for dynamic programming on DAGs (process nodes in topological order so all dependencies are already resolved)"
        ]},
        { tag: "note", variant: "warning", text: "A topological order is not necessarily unique — any graph with vertices that have no dependency relationship between them admits multiple valid orderings." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "Kahn's algorithm always processes every vertex once and every edge once while decrementing in-degrees, regardless of the DAG's specific shape — there's no early-exit shortcut." },
          { tag: "ul", items: [
            "Initial in-degree computation: scan all edges once — O(E)",
            "Each vertex is enqueued and dequeued exactly once when its in-degree hits zero: O(V)",
            "Each edge is examined exactly once to decrement a neighbor's in-degree: O(E)",
            "Total: O(V + E)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "Both Kahn's and DFS-based approaches perform a fixed, structurally-determined amount of work per vertex and edge — there's no value-dependent branching that changes the iteration count." },
          { tag: "ul", items: [
            "DFS-based: standard DFS traversal cost, O(V + E), plus O(V) to reverse the post-order result",
            "Kahn's: O(V + E) as above",
            "Both approaches are asymptotically identical regardless of graph shape, as long as it's a valid DAG"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "No DAG structure increases the cost beyond visiting every vertex and edge exactly once — even a graph that is 'almost' a total order (a single long chain) costs the same asymptotic O(V + E)." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(V + E)",
            "Cycle detection (when the graph is not actually a DAG) also completes in O(V + E) — Kahn's simply terminates with fewer than V vertices processed",
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Kahn's algorithm needs an in-degree array and a queue, both sized to V; the DFS-based approach needs a visited set and a result stack, also both O(V)." },
          { tag: "ul", items: ["in-degree array: O(V)", "queue: up to O(V)", "result list: O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by the number of vertices, regardless of edge density or graph shape (the adjacency list itself is typically counted as O(V + E) input, not algorithm overhead)." },
          { tag: "ul", items: ["in-degree / visited tracking: O(V)", "output ordering: O(V)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "Even a graph where the entire vertex set is simultaneously 'ready' (in-degree zero) at the start keeps the queue bounded by O(V) — it can never exceed the total vertex count." },
          { tag: "ul", items: ["Maximum queue size: O(V)", "DFS recursion stack (DFS-based variant): up to O(V) in the worst case of a single long chain"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Kahn's algorithm (BFS-based):" },
        { tag: "code", language: "text", text:
`function topologicalSort(graph):
    inDegree ← map of vertex → 0, for all vertices
    for u in graph.vertices:
        for v in graph.adjacent(u):
            inDegree[v] ← inDegree[v] + 1

    queue ← all vertices with inDegree == 0
    result ← empty list

    while queue is not empty:
        u ← dequeue(queue)
        append u to result

        for v in graph.adjacent(u):
            inDegree[v] ← inDegree[v] − 1
            if inDegree[v] == 0:
                enqueue(queue, v)

    if length(result) != number of vertices:
        return CYCLE_DETECTED       // graph is not a DAG

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Compute the in-degree (number of incoming edges) for every vertex by scanning all edges once.",
          "Initialise a queue with every vertex that has in-degree zero — these have no unresolved dependencies and can be processed first.",
          "Repeatedly dequeue a vertex, append it to the result ordering, and 'remove' it from the graph by decrementing the in-degree of each of its neighbors.",
          "Whenever a neighbor's in-degree drops to zero, all its dependencies have now been satisfied — enqueue it.",
          "If the final result contains all V vertices, it's a valid topological order. If fewer vertices were processed, the remaining vertices form a cycle (their in-degree never reaches zero because they depend on each other)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: a vertex is only enqueued once all of its prerequisite vertices (everything with an edge pointing to it) have already been added to the result. This directly enforces the topological-order requirement: every edge u → v has u processed (and removed from consideration) before v's in-degree can reach zero. If the graph has a cycle, every vertex in that cycle perpetually has at least one unresolved incoming edge from within the cycle, so none of them can ever reach in-degree zero — correctly signalling that no valid topological order exists." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. DIJKSTRA'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Dijkstra's Algorithm",
      href: "/algorithms/graphs/dijkstra",
      type: "Medium",

      about: [
        { tag: "h1", text: "Dijkstra's Algorithm" },
        { tag: "p", text: "Dijkstra's Algorithm, devised by Edsger Dijkstra in 1956, finds the shortest path from a single source vertex to every other vertex in a weighted graph with non-negative edge weights. It greedily expands outward from the source, always finalising the closest not-yet-finalised vertex next, using a priority queue (min-heap) to efficiently find that closest vertex at every step." },
        { tag: "p", text: "It can be thought of as a weighted generalisation of BFS: where BFS uses a plain queue and treats every edge as cost 1, Dijkstra uses a priority queue ordered by cumulative path cost, allowing it to correctly handle edges of different weights while still guaranteeing the first-finalised distance for each vertex is its true shortest distance." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Single-source shortest path on a weighted graph with all non-negative edge weights",
          "Routing/navigation problems (e.g. road networks where edge weight = distance or time)",
          "Network routing protocols (e.g. OSPF uses a Dijkstra-based approach)",
          "Any problem reducible to 'minimum cost to reach state X from state Y' where costs are non-negative"
        ]},
        { tag: "note", variant: "warning", text: "Dijkstra produces silently incorrect results in the presence of negative edge weights — it does not raise an error, it just returns a wrong shortest-path value, since its greedy finalisation assumes distances only ever increase." }
      ],

      timeComplexityCalculation: {
        notation: "O((V + E) log V)",
        best: [
          { tag: "h2", text: "Best Case — O((V + E) log V)" },
          { tag: "p", text: "Using a binary heap priority queue, every vertex extraction and every edge relaxation costs O(log V), and the algorithm always processes every reachable vertex and edge at least once — there's no shortcut even for the most favourable weight distribution." },
          { tag: "ul", items: [
            "Each of the V vertices is extracted from the priority queue exactly once: O(V log V)",
            "Each of the E edges can trigger at most one decrease-key/insert operation: O(E log V)",
            "Combined: O((V + E) log V)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O((V + E) log V)" },
          { tag: "p", text: "The binary-heap-based implementation performs the same structural sequence of extract-min and insert/decrease-key operations regardless of the specific edge weight values, only their relative ordering affects which vertex gets extracted when, not the asymptotic operation count." },
          { tag: "ul", items: [
            "V extract-min operations: O(V log V)",
            "Up to E insert/decrease-key operations (one potential relaxation per edge): O(E log V)",
            "Total: O((V + E) log V), the standard binary-heap bound"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O((V + E) log V)" },
          { tag: "p", text: "No edge-weight configuration increases Dijkstra's asymptotic cost beyond the standard bound — even a fully dense graph where every edge triggers a relaxation still fits within this envelope." },
          { tag: "ul", items: [
            "Worst case matches best/average: O((V + E) log V) with a binary heap",
            "Using a Fibonacci heap instead, this improves to O(E + V log V), since decrease-key becomes O(1) amortised — relevant for very dense graphs",
            "For a dense graph (E ≈ V²), an adjacency-matrix-based O(V²) implementation (without a heap) can actually outperform the heap-based version, since the heap overhead isn't worth it when nearly every edge exists"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Dijkstra maintains a distance array, a visited/finalised set, and a priority queue, all sized proportional to the number of vertices." },
          { tag: "ul", items: ["distance array: O(V)", "priority queue: up to O(V) entries", "visited/finalised set: O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count, since the distance and visited tracking structures must accommodate every vertex regardless of how the priority queue churns through insertions." },
          { tag: "ul", items: ["distance[], visited[]: O(V) each", "priority queue contents: bounded by O(V) distinct vertices (with decrease-key) or O(E) lazy entries (with lazy deletion)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "Implementations using 'lazy deletion' (inserting a new priority queue entry on every relaxation instead of updating in place) can grow the queue to O(E) entries in the worst case, though logical vertex-tracking arrays remain O(V)." },
          { tag: "ul", items: [
            "distance[], visited[]: O(V)",
            "Lazy-deletion priority queue: up to O(E) stale entries in the worst case",
            "True decrease-key-based implementations keep the queue strictly at O(V), trading implementation complexity for tighter space"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function dijkstra(graph, source):
    distance ← map of vertex → infinity, for all vertices
    distance[source] ← 0
    pq ← min-priority-queue, ordered by distance
    pq.insert(source, 0)
    visited ← empty set

    while pq is not empty:
        (u, d) ← pq.extractMin()
        if u in visited:
            continue                       // stale entry, skip
        visited.add(u)

        for (v, weight) in graph.adjacent(u):
            if v not in visited:
                newDist ← distance[u] + weight
                if newDist < distance[v]:
                    distance[v] ← newDist
                    pq.insert(v, newDist)   // or decreaseKey(v, newDist)

    return distance` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise every vertex's distance to infinity except the source, which is 0.",
          "Use a priority queue to always extract the not-yet-finalised vertex with the smallest known distance.",
          "Once a vertex is extracted and finalised, its distance is guaranteed correct and will never be updated again — mark it visited.",
          "For each neighbor of the just-finalised vertex, check if reaching it through the current vertex gives a shorter path than previously known — this is called 'relaxing' the edge.",
          "If a shorter path is found, update the neighbor's distance and push the new, better distance onto the priority queue.",
          "Repeat until the priority queue is empty — every reachable vertex has been finalised with its true shortest distance."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The key invariant relies on non-negative weights: when a vertex u is extracted from the priority queue, its current distance value is provably its true shortest distance from the source. This holds because every vertex still in the queue has a distance ≥ u's distance (by the min-heap property), and since all edge weights are non-negative, any path through a not-yet-finalised vertex could only be longer or equal — never shorter — than the direct path already found to u. This greedy 'finalise the closest vertex first' strategy therefore never needs to revisit or correct an already-finalised vertex, which is exactly what breaks down if negative weights are allowed." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. BELLMAN-FORD ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Bellman-Ford Algorithm",
      href: "/algorithms/graphs/bellman-ford",
      type: "Hard",

      about: [
        { tag: "h1", text: "Bellman-Ford Algorithm" },
        { tag: "p", text: "Bellman-Ford, independently developed by Richard Bellman and Lester Ford in the 1950s, finds the shortest path from a single source to all other vertices, and unlike Dijkstra's, it correctly handles negative edge weights. It works by relaxing every edge in the graph, repeated V − 1 times — a brute-force but provably sufficient strategy for propagating correct shortest distances through the graph." },
        { tag: "p", text: "Its second crucial capability is negative cycle detection: after the standard V − 1 rounds of relaxation, a single additional round is run — if any edge can still be relaxed (i.e. distance further decreases), the graph contains a negative-weight cycle reachable from the source, meaning no shortest path is well-defined (you could loop the cycle forever to decrease the path cost indefinitely)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The graph may contain negative edge weights (e.g. financial models with costs and gains, or arbitrage detection in currency exchange graphs)",
          "You need to detect whether a negative-weight cycle exists",
          "Distributed routing protocols where path computation must tolerate cost decreases (the basis of the original distance-vector routing protocols)",
          "When Dijkstra's non-negative-weight assumption can't be guaranteed for the problem domain"
        ]},
        { tag: "note", variant: "tip", text: "Bellman-Ford's V−1-round relaxation is exactly the number of edges in the longest possible simple shortest path (a path visits at most V vertices, hence at most V−1 edges) — that's why exactly V−1 rounds always suffice when no negative cycle exists." }
      ],

      timeComplexityCalculation: {
        notation: "O(VE)",
        best: [
          { tag: "h2", text: "Best Case — O(VE)" },
          { tag: "p", text: "The standard implementation always performs the full V − 1 rounds of relaxing every edge, regardless of how quickly distances actually converge — there's no structural early exit in the basic version, though an optimised variant can detect early convergence." },
          { tag: "ul", items: [
            "V − 1 rounds, each examining all E edges: (V−1) × E = O(VE)",
            "An early-exit optimisation (stop if a full round makes no changes) can reduce this in practice, but the worst-case asymptotic bound remains O(VE)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(VE)" },
          { tag: "p", text: "Every round performs the same fixed amount of work — examining every edge once — regardless of the specific weight values or graph topology, as long as the round count (V−1) is fixed." },
          { tag: "ul", items: [
            "(V − 1) rounds × E edge examinations per round = O(VE)",
            "Each edge relaxation is O(1) — one addition and one comparison",
            "No input distribution changes this structural bound"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(VE)" },
          { tag: "p", text: "The worst case matches the average exactly — there's no graph structure that increases the cost beyond the fixed (V−1) × E relaxation rounds, plus one additional round for negative-cycle detection." },
          { tag: "ul", items: [
            "(V − 1) relaxation rounds + 1 detection round, each O(E): O(VE)",
            "For a dense graph (E ≈ V²), this becomes O(V³), notably worse than Dijkstra's O((V+E) log V) — the price paid for tolerating negative weights"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Only a distance array (and optionally a predecessor array for path reconstruction) is needed, both sized to the number of vertices." },
          { tag: "ul", items: ["distance array: O(V)", "predecessor array (optional): O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count alone — there's no auxiliary structure that grows with edge count or specific weight values." },
          { tag: "ul", items: ["No priority queue or heap needed, unlike Dijkstra — just two flat arrays of size V"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "No graph configuration increases memory usage beyond the fixed distance and predecessor arrays — even maximal edge density doesn't change this." },
          { tag: "ul", items: ["distance[], predecessor[]: O(V) each, regardless of E", "The edge list itself (input, not auxiliary) is O(E)"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function bellmanFord(graph, source):
    distance ← map of vertex → infinity, for all vertices
    distance[source] ← 0

    // Relax all edges V − 1 times
    for i from 1 to numVertices − 1:
        for (u, v, weight) in graph.edges:
            if distance[u] + weight < distance[v]:
                distance[v] ← distance[u] + weight

    // One more pass to detect negative cycles
    for (u, v, weight) in graph.edges:
        if distance[u] + weight < distance[v]:
            return NEGATIVE_CYCLE_DETECTED

    return distance` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise every vertex's distance to infinity except the source, which starts at 0.",
          "Repeat exactly V − 1 times: for every edge (u, v) with weight w, check if going through u gives a shorter path to v than currently known, and update if so. This is 'relaxation'.",
          "After V − 1 full rounds, every shortest path (which can have at most V − 1 edges, since a simple path visits at most V vertices) has been fully propagated, assuming no negative cycle exists.",
          "Run one final round: if any edge can still be relaxed, that means there's a path that keeps getting shorter even after V − 1 rounds — which is only possible if a negative-weight cycle is reachable from the source.",
          "If no further relaxation is possible, the distance array holds the correct shortest path to every vertex."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Inductive claim: after k rounds of relaxing all edges, distance[v] is correct for every vertex v whose true shortest path from the source uses at most k edges. The base case (k=0) holds trivially (only the source, at distance 0, has a 0-edge path). The inductive step holds because if the true shortest path to v uses exactly k edges and ends with edge (u, v), then by the inductive hypothesis distance[u] is already correct after k−1 rounds, so round k's relaxation of edge (u,v) correctly sets distance[v]. Since any simple shortest path has at most V−1 edges, V−1 rounds guarantee correctness for all vertices — and if a valid relaxation is still possible after that, the only explanation is a negative cycle, since no simple shortest path can have more than V−1 edges." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. FLOYD-WARSHALL ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Floyd-Warshall Algorithm",
      href: "/algorithms/graphs/floyd-warshall",
      type: "Hard",

      about: [
        { tag: "h1", text: "Floyd-Warshall Algorithm" },
        { tag: "p", text: "Floyd-Warshall, developed by Robert Floyd and Stephen Warshall in 1962, computes the shortest path between every pair of vertices in a weighted graph simultaneously — an all-pairs shortest path (APSP) algorithm, in contrast to Dijkstra's and Bellman-Ford's single-source focus. It works on a V×V distance matrix using dynamic programming over an 'allowed intermediate vertex' dimension." },
        { tag: "p", text: "The core idea: dist[i][j] using only vertices {1...k} as intermediates is either the same as using only {1...k-1}, or it's improved by routing through vertex k specifically (dist[i][k] + dist[k][j]). By incrementally allowing one more vertex as a possible 'waypoint' at each of V iterations, the algorithm converges to the true shortest path between every pair." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need shortest paths between ALL pairs of vertices, not just from one source",
          "The graph is small to medium-sized (V up to a few hundred/left thousands) — O(V³) becomes prohibitive beyond that",
          "Edge weights can be negative, as long as there are no negative-weight cycles (the algorithm can detect their presence via negative values on the diagonal)",
          "You need transitive closure of a relation (a boolean variant answers 'is there ANY path from i to j')"
        ]},
        { tag: "note", variant: "tip", text: "Running Dijkstra V times (once per source) costs O(V(V+E) log V), which beats Floyd-Warshall's O(V³) for sparse graphs with non-negative weights — Floyd-Warshall's simplicity and negative-weight tolerance are its real advantages, not raw speed." }
      ],

      timeComplexityCalculation: {
        notation: "O(V³)",
        best: [
          { tag: "h2", text: "Best Case — O(V³)" },
          { tag: "p", text: "The algorithm always runs three fully nested loops over all V vertices (for the intermediate vertex k, and for every pair i, j), regardless of the graph's actual connectivity or weight values — there is no early exit." },
          { tag: "ul", items: [
            "Outer loop over intermediate vertex k: V iterations",
            "Middle and inner loops over i and j: V × V = V² iterations each",
            "Total: V × V² = O(V³), unconditionally"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V³)" },
          { tag: "p", text: "Every cell of the V×V distance matrix is checked and potentially updated exactly once per value of k, regardless of how many actual edges exist or what values they carry." },
          { tag: "ul", items: [
            "V values of k × V² (i, j) pairs per k = O(V³) total comparisons",
            "Each comparison/update is O(1)",
            "No input distribution changes this fixed triple-nested-loop structure"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V³)" },
          { tag: "p", text: "No graph configuration increases the cost beyond the fixed triple loop — this is identical to best and average case, a hallmark of dense dynamic-programming algorithms with no data-dependent branching that skips iterations." },
          { tag: "ul", items: [
            "O(V³) is simultaneously the best, average, and worst case — Floyd-Warshall has no adaptive behaviour",
            "This makes it predictable but also means it can't be sped up by 'lucky' input the way Bellman-Ford's early-exit optimisation can"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V²)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V²)" },
          { tag: "p", text: "The algorithm requires a full V×V distance matrix, since it computes and stores the shortest distance between every single pair of vertices." },
          { tag: "ul", items: ["distance matrix: V² entries — O(V²)", "optional next/predecessor matrix for path reconstruction: another O(V²)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V²)" },
          { tag: "p", text: "Matrix size is fixed by vertex count alone, regardless of how many edges actually exist in the original graph — even a sparse graph still produces a dense V×V output matrix." },
          { tag: "ul", items: ["The output is inherently dense (all-pairs distances), so space is always O(V²) regardless of input edge sparsity"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V²)" },
          { tag: "p", text: "No input increases space usage beyond the fixed V×V matrices — this is both the floor and ceiling for the algorithm's memory footprint." },
          { tag: "ul", items: [
            "Distance matrix + optional path-reconstruction matrix: O(V²) total",
            "Can be done in-place (updating the same matrix across all k iterations) without needing separate matrices per iteration"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function floydWarshall(graph):
    dist ← V x V matrix
    for i from 0 to V − 1:
        for j from 0 to V − 1:
            if i == j:
                dist[i][j] ← 0
            else if edge (i, j) exists:
                dist[i][j] ← weight(i, j)
            else:
                dist[i][j] ← infinity

    for k from 0 to V − 1:              // allowed intermediate vertex
        for i from 0 to V − 1:
            for j from 0 to V − 1:
                if dist[i][k] + dist[k][j] < dist[i][j]:
                    dist[i][j] ← dist[i][k] + dist[k][j]

    // Negative cycle check: any dist[i][i] < 0 means a negative cycle exists
    return dist` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise the distance matrix directly from the graph's edge weights, with 0 on the diagonal and infinity for non-adjacent pairs.",
          "For each vertex k from 0 to V−1, treat it as a newly 'allowed' intermediate stopping point.",
          "For every pair (i, j), check whether routing through k — i.e. taking the best known path from i to k, then from k to j — produces a shorter total distance than the current dist[i][j].",
          "If so, update dist[i][j] to this improved value.",
          "After all V values of k have been processed, dist[i][j] holds the true shortest distance from i to j using any vertex as an intermediate — i.e. the full graph."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Inductive claim: after processing intermediate vertex k, dist[i][j] correctly holds the shortest path from i to j using only vertices from {0, 1, ..., k} as possible intermediates. Base case (before any k is processed) holds because dist[i][j] is initialised to the direct edge weight, which is trivially the shortest path using zero intermediates. Inductive step: the shortest path from i to j using vertices up to k either avoids k entirely (so it's already captured by dist[i][j] from the previous iteration) or passes through k exactly once (since revisiting k offers no benefit), in which case it equals dist[i][k] + dist[k][j], both of which are already correctly computed using vertices up to k−1 by the inductive hypothesis. Taking the minimum of these two options correctly updates dist[i][j] for intermediates up to k. By induction, after k = V−1, all pairs are correctly computed using any vertex as an intermediate." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       6. KRUSKAL'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Kruskal's Algorithm",
      href: "/algorithms/graphs/kruskal",
      type: "Medium",

      about: [
        { tag: "h1", text: "Kruskal's Algorithm" },
        { tag: "p", text: "Kruskal's Algorithm, published by Joseph Kruskal in 1956, finds a Minimum Spanning Tree (MST) — a subset of edges connecting all vertices with the minimum possible total edge weight, and no cycles. It is greedy and edge-centric: sort all edges by weight ascending, then repeatedly add the cheapest remaining edge as long as it doesn't create a cycle with edges already chosen." },
        { tag: "p", text: "Cycle detection is handled efficiently using a Union-Find (Disjoint Set Union) data structure: two vertices are in the same 'set' if and only if they're already connected by previously chosen edges, so an edge creates a cycle exactly when its two endpoints are already in the same set." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Network design problems: minimum cost to connect all locations (cabling, pipelines, road networks)",
          "The graph is sparse (E close to V) — Kruskal's E log E sorting cost is then very competitive",
          "You naturally have a list of edges available (rather than needing efficient per-vertex neighbor lookup, which favours Prim's)",
          "Clustering applications: stopping Kruskal's early (before connecting everything) produces a natural hierarchical clustering"
        ]},
        { tag: "note", variant: "tip", text: "Kruskal's is typically preferred for sparse graphs (few edges relative to vertices), while Prim's with a Fibonacci heap is typically preferred for dense graphs — though both have the same theoretical correctness." }
      ],

      timeComplexityCalculation: {
        notation: "O(E log E)",
        best: [
          { tag: "h2", text: "Best Case — O(E log E)" },
          { tag: "p", text: "Sorting all edges always dominates the cost and is required regardless of input structure — there's no shortcut even if the MST happens to be trivially the first V−1 edges in sorted order." },
          { tag: "ul", items: [
            "Sorting E edges: O(E log E)",
            "Processing each edge with Union-Find (near O(1) amortised with path compression and union by rank): O(E · α(V)), where α is the inverse Ackermann function — effectively constant",
            "Total dominated by sorting: O(E log E)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(E log E)" },
          { tag: "p", text: "Both the sorting step and the union-find processing perform the same structural work regardless of edge weight distribution — comparison-based sorting is Θ(E log E) for any input, and Union-Find operations are near-constant regardless of which specific edges form the eventual MST." },
          { tag: "ul", items: [
            "O(E log E) for sorting (dominates)",
            "O(E · α(V)) for the union-find based cycle checks, which is effectively O(E) for all practical purposes",
            "Total: O(E log E)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(E log E)" },
          { tag: "p", text: "No edge weight configuration increases the cost beyond the sorting step's bound — even a graph requiring every single edge to be checked for cycles still fits within this envelope, since Union-Find operations are near-constant time." },
          { tag: "ul", items: [
            "Worst case equals best/average: O(E log E)",
            "Since E ≤ V² always, this can also be expressed as O(E log V) (because log(V²) = 2 log V, a constant factor difference) — both notations are commonly seen in textbooks"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V + E)" },
          { tag: "p", text: "The algorithm needs the full edge list (O(E)) plus a Union-Find structure sized to the vertex count (O(V))." },
          { tag: "ul", items: ["Edge list: O(E)", "Union-Find parent/rank arrays: O(V)", "MST result (at most V−1 edges): O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V + E)" },
          { tag: "p", text: "Memory usage is fixed by graph size alone, since both the edge list and the union-find structure are sized independently of the specific weight values or which edges end up in the MST." },
          { tag: "ul", items: ["Same O(V + E) bound regardless of edge weight distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "No graph configuration increases space beyond storing the full edge list and the fixed-size Union-Find structure." },
          { tag: "ul", items: ["O(E) for edges + O(V) for Union-Find = O(V + E), identical across all cases"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function kruskal(graph):
    mst ← empty list
    sortedEdges ← sort graph.edges by weight ascending

    unionFind ← new DisjointSet(graph.vertices)   // each vertex starts in its own set

    for (u, v, weight) in sortedEdges:
        if unionFind.find(u) != unionFind.find(v):
            mst.append((u, v, weight))
            unionFind.union(u, v)
            if length(mst) == numVertices − 1:
                break                              // MST complete

    return mst` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Sort every edge in the graph by weight, ascending — this lets the algorithm greedily consider the cheapest edges first.",
          "Initialise a Union-Find structure where every vertex starts in its own singleton set.",
          "Process edges in sorted order: for each edge (u, v), check whether u and v are already in the same set (meaning they're already connected via previously chosen MST edges).",
          "If they're in different sets, adding this edge connects two previously separate components without creating a cycle — add it to the MST and merge (union) the two sets.",
          "If they're already in the same set, adding this edge would create a cycle — skip it.",
          "Stop once V − 1 edges have been added (a spanning tree on V vertices always has exactly V − 1 edges)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "This follows from the Cut Property of MSTs: for any partition of the vertices into two non-empty sets, the minimum-weight edge crossing that partition must be part of some MST. Processing edges in ascending weight order and only adding an edge when it connects two different components is exactly choosing, at each step, the minimum-weight edge crossing the cut between 'already-connected components' and 'everything else' — which the Cut Property guarantees is always safe to include. The greedy choice never needs to be undone, and since Union-Find correctly tracks connectivity, every cycle-forming edge is correctly rejected, yielding a true minimum spanning tree." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       7. PRIM'S ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Prim's Algorithm",
      href: "/algorithms/graphs/prim",
      type: "Medium",

      about: [
        { tag: "h1", text: "Prim's Algorithm" },
        { tag: "p", text: "Prim's Algorithm, developed by Robert Prim in 1957 (and earlier by Vojtěch Jarník in 1930), also finds a Minimum Spanning Tree, but is vertex-centric rather than edge-centric: it grows a single tree outward from an arbitrary starting vertex, at each step adding the cheapest edge that connects the current tree to a vertex not yet in it." },
        { tag: "p", text: "Structurally, Prim's is very similar to Dijkstra's Algorithm — both use a priority queue to greedily select the 'next best' vertex — but where Dijkstra's tracks cumulative path distance from the source, Prim's tracks the minimum single edge weight connecting a vertex to the growing tree, which is what makes it build a minimum spanning tree rather than a shortest-path tree." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The graph is dense (E close to V²) — Prim's with a Fibonacci heap achieves O(E + V log V), beating Kruskal's E log E on dense graphs",
          "You have efficient adjacency-list/neighbor access but not necessarily a sorted global edge list",
          "Network design problems identical to Kruskal's use case (minimum cabling/connection cost) — the choice between the two is mostly about graph density and implementation convenience",
          "Real-time/incremental MST construction where you're growing the tree from a fixed starting point"
        ]},
        { tag: "note", variant: "info", text: "Both Prim's and Kruskal's always produce a valid MST (the minimum total weight is unique even when the specific tree structure isn't), so the choice between them is purely about performance characteristics for the given graph density." }
      ],

      timeComplexityCalculation: {
        notation: "O((V + E) log V)",
        best: [
          { tag: "h2", text: "Best Case — O((V + E) log V)" },
          { tag: "p", text: "Using a binary heap, every vertex extraction and edge relaxation costs O(log V), and the algorithm always processes every vertex and edge at least once to build the spanning tree — there's no early exit regardless of edge weight favourability." },
          { tag: "ul", items: [
            "V extract-min operations: O(V log V)",
            "Up to E decrease-key/insert operations: O(E log V)",
            "Total: O((V + E) log V), the standard binary-heap bound, identical to Dijkstra's structure"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O((V + E) log V)" },
          { tag: "p", text: "The priority-queue-driven structure performs the same fixed sequence of operations (extract minimum, examine neighbors, possibly update priority) regardless of the specific edge weight values, only their relative order affects extraction sequence, not operation count." },
          { tag: "ul", items: [
            "V extractions × O(log V) + E potential updates × O(log V) = O((V + E) log V)",
            "No input distribution changes this structural bound for the standard binary-heap implementation"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O((V + E) log V)" },
          { tag: "p", text: "No graph structure increases the cost beyond the standard binary-heap bound — for a dense graph this becomes O(V² log V) with a binary heap, which is exactly why a Fibonacci heap implementation is preferred for dense graphs." },
          { tag: "ul", items: [
            "Binary heap: O((V + E) log V) worst case",
            "Fibonacci heap: O(E + V log V) worst case — significantly better for dense graphs since decrease-key becomes O(1) amortised",
            "Adjacency-matrix-based O(V²) implementation (no heap at all): competitive specifically for very dense graphs where E approaches V²"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "Prim's maintains a key/weight array (cheapest edge weight connecting each vertex to the tree), an in-tree boolean array, and a priority queue, all sized to V." },
          { tag: "ul", items: ["key[] (min edge weight to tree): O(V)", "inTree[] boolean array: O(V)", "priority queue: up to O(V) entries"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count, since the tracking arrays must accommodate every vertex regardless of how densely connected the graph is." },
          { tag: "ul", items: ["key[], inTree[]: O(V) each, independent of E"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V + E)" },
          { tag: "p", text: "Lazy-deletion priority queue implementations (pushing a new entry on every key update rather than updating in place) can grow the queue to O(E) stale entries in the worst case." },
          { tag: "ul", items: [
            "key[], inTree[]: O(V)",
            "Lazy-deletion priority queue: up to O(E) entries in the worst case",
            "Decrease-key-based implementations keep this strictly at O(V)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function prim(graph, start):
    key    ← map of vertex → infinity, for all vertices
    inTree ← map of vertex → false, for all vertices
    key[start] ← 0
    pq ← min-priority-queue, ordered by key
    pq.insert(start, 0)
    mstWeight ← 0

    while pq is not empty:
        (u, k) ← pq.extractMin()
        if inTree[u]:
            continue                    // stale entry, skip
        inTree[u] ← true
        mstWeight ← mstWeight + k

        for (v, weight) in graph.adjacent(u):
            if not inTree[v] and weight < key[v]:
                key[v] ← weight
                pq.insert(v, weight)     // or decreaseKey(v, weight)

    return mstWeight` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Start with an arbitrary vertex; its key (cheapest known edge to the growing tree) is set to 0 since it needs no edge to join itself.",
          "Use a priority queue to always extract the not-yet-included vertex with the smallest key — the cheapest way to connect a new vertex to the existing tree.",
          "Once extracted, mark the vertex as part of the tree and add its key value to the running total MST weight.",
          "For each neighbor not yet in the tree, check if the direct edge to it is cheaper than the neighbor's currently known key — if so, this edge is now the best known way to attach that neighbor to the tree.",
          "Update the neighbor's key and push the new value onto the priority queue.",
          "Repeat until every vertex has been added to the tree."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "This also follows from the Cut Property: at every step, the current tree and the remaining unvisited vertices form a cut of the graph. The algorithm always selects the minimum-weight edge crossing that cut (the smallest key among not-yet-included vertices), which the Cut Property guarantees is safe to add to some MST. Since this greedy choice is repeated for every vertex addition and is always provably safe, the final tree — having connected all V vertices with exactly V − 1 such safe edges — is guaranteed to be a true minimum spanning tree." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       8. DEPTH-FIRST SEARCH (DFS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Depth-First Search (DFS)",
      href: "/algorithms/graphs/dfs",
      type: "Easy",

      about: [
        { tag: "h1", text: "Depth-First Search (DFS)" },
        { tag: "p", text: "DFS explores a graph by going as deep as possible along each branch before backtracking — the opposite exploration order to BFS's level-by-level expansion. It can be implemented recursively (using the call stack implicitly) or iteratively (using an explicit stack), and both produce the same traversal order family." },
        { tag: "p", text: "DFS is the foundation for a remarkably wide range of graph algorithms beyond simple traversal: cycle detection, topological sorting (via post-order), finding connected/strongly-connected components, solving mazes, and backtracking search (subsets, permutations, N-Queens) are all DFS variants or direct applications." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need to explore all paths or all reachable states (backtracking problems)",
          "Cycle detection in directed or undirected graphs",
          "Computing connected components, or as the building block for Tarjan's SCC algorithm",
          "Topological sorting via post-order traversal",
          "Maze-solving or any 'is there a path' connectivity question where the shortest path doesn't matter"
        ]},
        { tag: "note", variant: "warning", text: "Recursive DFS can hit a stack overflow on very deep or very large graphs (e.g. a long chain of millions of vertices) — an iterative implementation with an explicit stack avoids this risk for production code." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "As a full traversal, DFS always visits every reachable vertex and examines every edge exactly once (or twice for undirected graphs) — there's no asymptotic shortcut even for the most favourable graph shape." },
          { tag: "ul", items: [
            "Each vertex is visited and marked exactly once: O(V)",
            "Each edge is examined exactly once when exploring from its source vertex: O(E)",
            "Total: O(V + E), unconditionally"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "DFS performs the same fixed sequence of operations (visit, mark, recurse/push) regardless of graph shape — the total work is structurally determined by V and E alone." },
          { tag: "ul", items: [
            "Each vertex's adjacency list is fully scanned exactly once across the whole traversal: O(E) total across all vertices",
            "Each vertex visit/mark operation: O(V) total",
            "Combined: O(V + E)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "No graph structure increases DFS's cost beyond visiting every vertex and edge exactly once — this matches BFS's bound exactly, since both are exhaustive traversals differing only in exploration order." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(V + E)",
            "For a dense graph, E dominates and the bound becomes O(V²), purely a consequence of edge count, not algorithmic degeneration"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "DFS needs a visited set sized to V, plus a recursion/explicit stack that in the best case (a wide, shallow graph) stays small." },
          { tag: "ul", items: ["visited set: O(V)", "stack depth in a wide/shallow graph: much less than V"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "The visited set always requires O(V) space regardless of graph shape, and stack depth is bounded by the longest simple path in the graph, which is at most V." },
          { tag: "ul", items: ["visited set: O(V)", "stack: bounded by O(V) in the worst nesting case"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "A graph shaped like a single long chain forces the recursion/stack depth to reach V before any backtracking occurs, the maximum possible depth." },
          { tag: "ul", items: [
            "visited set: O(V)",
            "Recursion stack (or explicit stack): up to O(V) in a maximally 'deep' graph (e.g. a straight-line chain of V vertices)",
            "Total: O(V), same asymptotic class as BFS despite the very different access pattern"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Recursive formulation:" },
        { tag: "code", language: "text", text:
`function dfs(graph, source):
    visited ← empty set
    dfsVisit(graph, source, visited)

function dfsVisit(graph, u, visited):
    visited.add(u)
    process(u)                          // e.g. record discovery order

    for v in graph.adjacent(u):
        if v not in visited:
            dfsVisit(graph, v, visited)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Mark the starting vertex as visited and process it (e.g. add to traversal order).",
          "Examine its neighbors one at a time, in whatever order the adjacency list provides.",
          "For the first unvisited neighbor found, recurse into it immediately — going as deep as possible before considering any sibling neighbors.",
          "When a vertex has no unvisited neighbors left, the recursive call returns ('backtracks') to its caller, which then continues checking its own remaining neighbors.",
          "This naturally produces a depth-first exploration order, completing one entire branch before starting the next."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: a vertex is marked visited exactly once, the moment it is first discovered, which prevents infinite loops on cyclic graphs and guarantees each vertex is processed exactly once. By induction on the recursion: dfsVisit(u) correctly visits u and then recursively visits every vertex reachable from u that hasn't already been visited by an earlier call in the traversal — so starting from the source, every vertex reachable from it is eventually visited, since each unvisited neighbor triggers a recursive call that itself is guaranteed (by the inductive hypothesis) to visit everything reachable from that neighbor." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       9. TARJAN'S SCC
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Tarjan's SCC",
      href: "/algorithms/graphs/tarjans",
      type: "Hard",

      about: [
        { tag: "h1", text: "Tarjan's Strongly Connected Components Algorithm" },
        { tag: "p", text: "Tarjan's SCC algorithm, devised by Robert Tarjan in 1972, finds all Strongly Connected Components of a directed graph — maximal groups of vertices where every vertex can reach every other vertex in the group via directed edges — in a single DFS pass, without needing to transpose the graph or run DFS twice (unlike Kosaraju's alternative algorithm)." },
        { tag: "p", text: "It works by tracking two values per vertex during DFS: a discovery index (the order in which vertices are first visited) and a 'left-link' value (the smallest discovery index reachable from that vertex via the DFS tree plus at most one back-edge). A vertex is the 'root' of an SCC exactly when its left-link equals its own discovery index — at that point, every vertex currently on an auxiliary stack above it (inclusive) forms one complete SCC, and they're popped off together." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding strongly connected components in a directed graph (e.g. detecting cyclic dependency clusters, web page clustering, circuit analysis)",
          "Building a condensation graph (collapsing each SCC into a single node) to analyse the DAG of components — useful as a preprocessing step for many directed-graph problems",
          "2-SAT problem solving (boolean satisfiability with implication graphs), which reduces directly to SCC detection",
          "You need a single-pass solution and want to avoid the graph-transpose step required by Kosaraju's algorithm"
        ]},
        { tag: "note", variant: "tip", text: "Every strongly connected component containing more than one vertex necessarily contains at least one cycle — so Tarjan's SCC is also a valid (if somewhat heavyweight) way to detect cycles in a directed graph." }
      ],

      timeComplexityCalculation: {
        notation: "O(V + E)",
        best: [
          { tag: "h2", text: "Best Case — O(V + E)" },
          { tag: "p", text: "Tarjan's algorithm is built on a single DFS pass, augmented with constant extra bookkeeping per vertex and edge — so its cost structure is identical to plain DFS's: every vertex and edge is visited exactly once, with no early-exit shortcut." },
          { tag: "ul", items: [
            "DFS visits each vertex once: O(V)",
            "DFS examines each edge once: O(E)",
            "Low-link updates and stack push/pop operations are O(1) per vertex: adds no extra asymptotic cost",
            "Total: O(V + E), identical structure to plain DFS"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(V + E)" },
          { tag: "p", text: "The discovery-index and left-link tracking, along with the auxiliary stack management, all perform fixed O(1) work per vertex/edge regardless of how the SCCs happen to be structured in the input graph." },
          { tag: "ul", items: [
            "Same O(V + E) DFS backbone as best case",
            "Stack operations (push on discovery, pop on SCC root detection) total O(V) across the whole algorithm, since each vertex is pushed and popped exactly once"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(V + E)" },
          { tag: "p", text: "No graph structure — whether the entire graph is one giant SCC, or every vertex is its own trivial SCC — increases the cost beyond the standard single-pass DFS bound." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(V + E)",
            "This is asymptotically identical to Kosaraju's two-pass algorithm despite Tarjan's needing only one DFS traversal — the single-pass approach mainly offers a better constant factor and avoids the graph-transpose step, not a better Big-O class"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(V)",
        best: [
          { tag: "h2", text: "Best Case Space — O(V)" },
          { tag: "p", text: "The algorithm needs discovery-index and left-link arrays, an 'on-stack' boolean tracker, and the auxiliary stack itself — all sized to V." },
          { tag: "ul", items: ["discoveryIndex[], lowLink[]: O(V) each", "onStack[] boolean array: O(V)", "auxiliary stack: up to O(V)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(V)" },
          { tag: "p", text: "Space usage is fixed by vertex count alone, since every tracking array and the auxiliary stack must accommodate every vertex regardless of how many SCCs the graph actually decomposes into." },
          { tag: "ul", items: ["Same O(V) bound regardless of SCC count or distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(V)" },
          { tag: "p", text: "Even in the degenerate case of one single SCC spanning the entire graph, the auxiliary stack only ever holds each vertex once before it's popped — never exceeding O(V)." },
          { tag: "ul", items: [
            "discoveryIndex[], lowLink[], onStack[]: O(V) each",
            "Auxiliary stack: bounded by O(V), since each vertex is pushed exactly once",
            "DFS recursion stack: up to O(V) in the worst case of a deep graph",
            "Total: O(V)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function tarjanSCC(graph):
    index    ← 0
    stack    ← empty stack
    onStack  ← map of vertex → false
    disc     ← map of vertex → undefined
    left      ← map of vertex → undefined
    sccs     ← empty list

    for v in graph.vertices:
        if disc[v] is undefined:
            strongConnect(v)

    function strongConnect(u):
        disc[u] ← index
        left[u]  ← index
        index ← index + 1
        push u onto stack
        onStack[u] ← true

        for v in graph.adjacent(u):
            if disc[v] is undefined:
                strongConnect(v)
                left[u] ← min(left[u], left[v])
            else if onStack[v]:
                left[u] ← min(left[u], disc[v])

        if left[u] == disc[u]:          // u is the root of an SCC
            newSCC ← empty list
            repeat:
                w ← pop from stack
                onStack[w] ← false
                add w to newSCC
            until w == u
            sccs.append(newSCC)

    return sccs` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Run a standard DFS, but assign each vertex a discovery index (the order it was first visited) and initialise its left-link value to the same index.",
          "Push each vertex onto an auxiliary stack as soon as it's discovered, and mark it as 'on stack'.",
          "When exploring an edge to an already-visited vertex that's still on the stack, that's a 'back edge' (or cross edge to the same component) — update the current vertex's left-link to the minimum of its current left-link and the target's discovery index.",
          "When exploring an edge to an unvisited vertex, recurse into it first, then update the current vertex's left-link using the child's resulting left-link (not its discovery index) — this propagates 'how far back' the subtree can reach.",
          "After processing all of a vertex's neighbors, check if its left-link equals its own discovery index — if so, it's the root of a complete SCC: pop vertices off the stack until (and including) this vertex, and that popped group is exactly one SCC."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The left-link value of a vertex u, by construction, represents the smallest discovery index reachable from u's DFS subtree via tree edges plus at most one back/cross edge to a vertex still on the stack (i.e. still part of an unfinished SCC). A vertex u is the root of its SCC exactly when left[u] == disc[u] — meaning no vertex in u's subtree can reach back to an ancestor of u, so u's subtree (restricted to the still-on-stack vertices) cannot be merged with any SCC further up the DFS tree. Popping the stack down to and including u therefore yields exactly the set of vertices mutually reachable through u, which is by definition u's complete strongly connected component, and this argument applies recursively to every SCC root encountered during the traversal." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const TREES_SECTION = {
  name: "Trees",
  href: "/algorithms/trees",
  desc: "BST, AVL, segment tree, traversals",
  complexity: "O(log n)",
  count: 5,

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
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. TREE TRAVERSALS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Tree Traversals",
      href: "/algorithms/trees/traversals",
      type: "Easy",

      about: [
        { tag: "h1", text: "Tree Traversals" },
        { tag: "p", text: "A tree traversal visits every node in a tree exactly once, in a specific order. The three classic depth-first orderings — pre-order, in-order, and post-order — differ only in WHEN the current node is processed relative to its children, while breadth-first (level-order) traversal visits nodes layer by layer using a queue, exactly like graph BFS." },
        { tag: "p", text: "The choice of traversal order isn't arbitrary — each one corresponds to a specific real-world need. In-order traversal of a Binary Search Tree visits nodes in sorted order (a uniquely useful property). Pre-order naturally serialises a tree in a way that can reconstruct its exact shape. Post-order is the only safe order for deleting a tree node-by-node, since it processes children before their parent." },
        { tag: "h2", text: "The four traversal orders" },
        { tag: "table",
          headers: ["Traversal", "Order", "Key Use Case"],
          rows: [
            ["Pre-order", "Node → Left → Right", "Serialising a tree's structure for later reconstruction; copying a tree"],
            ["In-order", "Left → Node → Right", "Retrieving BST elements in sorted order"],
            ["Post-order", "Left → Right → Node", "Safely deleting a tree (children before parent); evaluating expression trees"],
            ["Level-order (BFS)", "Layer by layer, left to right", "Finding shortest depth to a node; printing a tree level by level"]
          ]
        },
        { tag: "note", variant: "tip", text: "In-order traversal of a BST always produces sorted output — this single fact underlies many BST algorithms, including validating whether a tree is a correct BST in the first place." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every traversal order must visit all n nodes to be complete — there is no early-exit shortcut for a full traversal, regardless of the tree's shape." },
          { tag: "ul", items: [
            "Each node is visited exactly once: O(n)",
            "Each visit does O(1) work (process the node, recurse into children/enqueue them)",
            "Total: O(n), even in the most favourably-shaped tree"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Visiting every node exactly once with O(1) work per node is a structural property of the traversal, completely independent of the tree's shape or balance." },
          { tag: "ul", items: [
            "n node visits × O(1) work each = O(n)",
            "Tree shape (balanced vs. skewed) affects auxiliary space, not the total time, since every node is still visited exactly once regardless"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No tree shape increases the time complexity beyond visiting every node once — a maximally skewed tree (essentially a linked list) still only requires n visits, just with worse space behaviour (see below)." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(n)",
            "This matches the trivial lower bound: a complete traversal must examine every node at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(h)",
        best: [
          { tag: "h2", text: "Best Case Space — O(log n)" },
          { tag: "p", text: "For a perfectly balanced tree, the recursion stack (for DFS-style traversals) only ever needs to hold one root-to-leaf path, which is O(log n) deep in a balanced tree." },
          { tag: "ul", items: ["Recursion stack depth = tree height h = O(log n) for a balanced tree", "Level-order traversal's queue can hold up to O(n/2) nodes at the widest level, regardless of balance"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(h)" },
          { tag: "p", text: "For DFS-style traversals, space is governed entirely by tree height h, not by the total node count n — this is the key distinction from BFS-style traversal." },
          { tag: "ul", items: ["Pre/in/post-order recursion stack: O(h), where h depends on the tree's actual shape", "For a random/typical BST, h is usually O(log n) in practice"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "A maximally skewed tree (every node has only one child, forming a linked-list shape) has height h = n − 1, so the recursion stack for DFS traversals can grow to O(n)." },
          { tag: "ul", items: [
            "DFS recursion stack: O(h), which can be as bad as O(n) for a degenerate skewed tree",
            "Level-order (BFS) traversal's queue: up to O(n) at the widest level of a wide/bushy tree, independent of height",
            "This is why an iterative traversal with an explicit stack (rather than recursion) is preferred for very deep or unbalanced trees, to avoid native call-stack overflow"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function preOrder(node):
    if node is null: return
    process(node)
    preOrder(node.left)
    preOrder(node.right)

function inOrder(node):
    if node is null: return
    inOrder(node.left)
    process(node)
    inOrder(node.right)

function postOrder(node):
    if node is null: return
    postOrder(node.left)
    postOrder(node.right)
    process(node)

function levelOrder(root):
    if root is null: return
    queue ← [root]
    while queue is not empty:
        node ← dequeue(queue)
        process(node)
        if node.left:  enqueue(queue, node.left)
        if node.right: enqueue(queue, node.right)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Pre-order: process the current node first, then recurse left, then recurse right — the node is always 'visited' before either of its subtrees.",
          "In-order: recurse left first, then process the current node, then recurse right — for a BST this guarantees sorted output, since everything in the left subtree is smaller and everything in the right subtree is larger.",
          "Post-order: recurse left, then recurse right, then process the current node last — both children are fully handled before the parent, which is why it's the safe order for deletion.",
          "Level-order: use a queue instead of recursion. Start with the root in the queue; repeatedly dequeue a node, process it, then enqueue its children — this naturally produces a layer-by-layer visiting order, identical in mechanism to graph BFS."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "For the three DFS orders, correctness follows directly from the recursive definition: by induction on subtree size, each recursive call correctly traverses its entire subtree in the specified order (process/left/right in some sequence), and since the function is called on the left and right subtrees of every node, every node in the tree is eventually visited exactly once. For level-order, the queue's FIFO property guarantees that all nodes at depth d are dequeued (and their children enqueued) before any node at depth d+1 is dequeued, by the same inductive argument used to prove BFS correctness on graphs." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. BINARY SEARCH TREE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Binary Search Tree",
      href: "/algorithms/trees/bst",
      type: "Medium",

      about: [
        { tag: "h1", text: "Binary Search Tree (BST)" },
        { tag: "p", text: "A Binary Search Tree maintains the invariant that for every node, all keys in its left subtree are smaller, and all keys in its right subtree are larger. This ordering property allows search, insertion, and deletion to eliminate half the remaining search space at each step — the same logarithmic principle as binary search on a sorted array, but adapted to a dynamic structure that supports efficient insertion and deletion." },
        { tag: "p", text: "Unlike a sorted array, a BST doesn't guarantee O(log n) operations — its performance depends entirely on the tree's height, which depends entirely on insertion order. A BST built from already-sorted input degenerates into what is effectively a linked list, with O(n) operations. This exact weakness is what motivates self-balancing variants like AVL and Red-Black trees." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "You need an ordered dynamic collection supporting fast search, insert, delete, and in-order (sorted) iteration",
          "Implementing a simple ordered map/set when insertion order is known to be sufficiently randomised (avoiding the degenerate worst case)",
          "As the conceptual foundation before reaching for a self-balancing variant (AVL, Red-Black) in production code",
          "Range queries: 'find all keys between X and Y' is naturally efficient via a BST traversal that prunes subtrees outside the range"
        ]},
        { tag: "note", variant: "warning", text: "A plain BST gives no balance guarantee — inserting already-sorted data produces a degenerate O(n)-height tree, silently turning every 'O(log n)' operation into O(n). Production code should use a self-balancing variant unless insertion order is provably randomised." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n) avg / O(n) worst",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "The best case for any single operation occurs when the target happens to be the root itself, requiring just one comparison — though this is a property of the specific query, not a structural guarantee of the algorithm." },
          { tag: "ul", items: [
            "Searching for the root: 1 comparison — O(1)",
            "This best case applies per-operation and doesn't reflect the tree's overall behaviour across many operations"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          { tag: "p", text: "For a BST built from randomly-ordered insertions, the expected height is provably O(log n) — a well-known result from random BST analysis (the expected height of a randomly built BST on n keys is approximately 2 ln n ≈ 1.39 log₂ n)." },
          { tag: "ul", items: [
            "Search/insert/delete all follow a single root-to-leaf path, costing O(h) where h is the current height",
            "For random insertion order, E[h] = O(log n), giving expected O(log n) per operation",
            "This is a probabilistic guarantee, not a worst-case one — it depends on the assumption of randomised insertion order"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "If keys are inserted in already-sorted (or reverse-sorted) order, every new node becomes the rightmost (or leftmost) child of the previous one, producing a tree that is structurally identical to a linked list." },
          { tag: "ul", items: [
            "Sorted-order insertion produces a tree of height n − 1",
            "Every search/insert/delete in this degenerate tree costs O(n), since the 'tree' is effectively a single chain",
            "This is the fundamental motivation for self-balancing BST variants (AVL, Red-Black), which provably cap height at O(log n) regardless of insertion order"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n nodes requires O(n) space for the node data itself, regardless of the tree's shape — this is identical across all cases since it only depends on node count." },
          { tag: "ul", items: ["n node objects, each with key + left/right pointers: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Total node storage is fixed by n alone, while the recursion stack used during operations scales with the tree's height, which is O(log n) on average for randomly-built trees." },
          { tag: "ul", items: ["O(n) node storage", "O(log n) expected recursion stack depth for random insertion order"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "In a degenerate (linked-list-shaped) tree, the recursion stack during search/insert/delete can grow to O(n), matching the tree's worst-case height." },
          { tag: "ul", items: [
            "O(n) node storage, identical to best/average case",
            "O(n) recursion stack depth in a degenerate, maximally-skewed tree — this is the same root cause as the O(n) worst-case time complexity"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function search(node, key):
    if node is null or node.key == key:
        return node
    if key < node.key:
        return search(node.left, key)
    else:
        return search(node.right, key)

function insert(node, key):
    if node is null:
        return new Node(key)
    if key < node.key:
        node.left ← insert(node.left, key)
    else if key > node.key:
        node.right ← insert(node.right, key)
    // duplicate keys: no-op (or handle per requirements)
    return node

function delete(node, key):
    if node is null:
        return null
    if key < node.key:
        node.left ← delete(node.left, key)
    else if key > node.key:
        node.right ← delete(node.right, key)
    else:
        // Found the node to delete
        if node.left is null:  return node.right
        if node.right is null: return node.left
        // Two children: replace with in-order successor
        successor ← findMin(node.right)
        node.key ← successor.key
        node.right ← delete(node.right, successor.key)
    return node` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Search: compare the target key against the current node; if smaller, recurse left; if larger, recurse right; if equal, found. Each comparison eliminates one entire subtree from consideration.",
          "Insert: follow the same comparison path as search until reaching a null spot, then attach the new node there — this always preserves the BST ordering invariant.",
          "Delete (leaf node): simply remove it — no children to reattach.",
          "Delete (one child): replace the node with its single child, splicing it directly into the parent's link.",
          "Delete (two children): find the in-order successor (the smallest key in the right subtree, found by following left-child pointers from node.right), copy its key into the node being deleted, then recursively delete the successor from the right subtree (which is now an easier 0-or-1-child deletion)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Search correctness follows directly from the BST invariant: if key < node.key, every key in the right subtree is guaranteed larger than key (by the invariant), so it cannot contain the target — recursing left is safe and complete. Insertion correctness follows because the new node is always placed at a position consistent with the invariant (smaller keys to the left, larger to the right of every ancestor on its path). Deletion's two-child case is the subtle one: replacing the deleted key with its in-order successor (the smallest key greater than it) preserves the invariant, because the successor is guaranteed to be larger than everything in the original left subtree and smaller than everything remaining in the right subtree — exactly the ordering position the deleted node occupied." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. LOWEST COMMON ANCESTOR
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Lowest Common Ancestor",
      href: "/algorithms/trees/lca",
      type: "Medium",

      about: [
        { tag: "h1", text: "Lowest Common Ancestor (LCA)" },
        { tag: "p", text: "The Lowest Common Ancestor of two nodes u and v in a tree is the deepest node that has both u and v as descendants (a node is considered a descendant of itself for this definition). It's a fundamental query that comes up anywhere hierarchical relationships matter: finding the common ancestor of two commits in a version-control history graph, the common category of two items in a taxonomy, or the meeting point of two file paths." },
        { tag: "p", text: "The right algorithm depends heavily on the tree type and query pattern. For a general binary tree with a single query, a recursive post-order approach works in O(n). For a Binary Search Tree specifically, the ordering property allows a much faster O(h) approach that doesn't need to explore both subtrees. For many repeated queries on a static tree, preprocessing techniques (binary lifting, Euler tour + sparse table) achieve O(log n) or even O(1) per query after O(n log n) preprocessing." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding the common ancestor of two nodes in any tree structure (file systems, org charts, phylogenetic trees)",
          "Computing the distance between two nodes in a tree: distance(u, v) = depth(u) + depth(v) − 2 × depth(LCA(u, v))",
          "Git's merge-base computation (finding the common ancestor commit of two branches) is conceptually an LCA query on the commit DAG",
          "Range/path queries on trees, where many algorithms first reduce the problem to 'find the LCA, then process the path through it'"
        ]},
        { tag: "note", variant: "tip", text: "Don't use the general O(n) binary-tree algorithm on a BST — exploiting the BST ordering property gives O(h) instead, often a dramatic speedup, since you never need to explore the subtree that can't contain either target." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If one of the two target nodes happens to be an ancestor of the other and is found immediately at the root, the search can terminate in constant time — though this depends on the specific tree and query, not a structural guarantee." },
          { tag: "ul", items: [
            "If root itself is one of the two targets, it's immediately known to be the LCA (since a node is its own potential ancestor): O(1)",
            "This is a favourable-input case, not the typical algorithmic guarantee"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "The general binary-tree LCA algorithm must, in the average case, still explore a substantial fraction of the tree to confirm both targets are found and correctly determine their meeting point, since it doesn't exploit any ordering property." },
          { tag: "ul", items: [
            "Post-order recursive search: each node is visited once to check if it equals either target, or to combine results from its children",
            "On average, a significant portion of the tree must be explored before both targets are located: O(n)",
            "For a BST specifically, the average case improves to O(log n) by exploiting the ordering invariant, identical to BST search's average case"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "If the two target nodes are deep in different subtrees (or the entire tree must be searched to locate them), the general algorithm visits every node exactly once in the worst case." },
          { tag: "ul", items: [
            "Every node is visited exactly once in a post-order traversal: O(n)",
            "For a BST, the worst case is O(h), which is O(n) for a degenerate unbalanced tree but O(log n) for a balanced one — same height dependency as plain BST operations",
            "With O(n) preprocessing (binary lifting / Euler tour + sparse table), each individual query afterward drops to O(log n) or O(1), trading preprocessing cost for fast repeated queries"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(h)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If the LCA is found immediately at the root with no recursion needed, no additional stack space beyond the initial call is used." },
          { tag: "ul", items: ["Single function call, no recursion: O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(h)" },
          { tag: "p", text: "The recursive post-order search uses a call stack bounded by the tree's height, since the recursion follows root-to-leaf paths." },
          { tag: "ul", items: ["Recursion stack depth: O(h), where h is the tree's height — O(log n) for a balanced tree"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "For a degenerate, maximally-skewed tree, the recursion stack can grow to O(n), matching the tree's worst-case height." },
          { tag: "ul", items: [
            "Recursion stack: O(h), which is O(n) for a degenerate tree",
            "Preprocessing-based approaches (binary lifting) trade this for O(n log n) upfront space in exchange for O(log n) query time regardless of tree shape"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "General binary tree LCA (works for any binary tree, not just a BST):" },
        { tag: "code", language: "text", text:
`function lowestCommonAncestor(root, p, q):
    if root is null or root == p or root == q:
        return root

    left  ← lowestCommonAncestor(root.left, p, q)
    right ← lowestCommonAncestor(root.right, p, q)

    if left is not null and right is not null:
        return root          // p and q found in different subtrees — root is the LCA
    return left if left is not null else right` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Base case: if the current node is null, or matches either target node, return it immediately — this is the signal that propagates 'I found one of the targets here' up through the recursion.",
          "Recurse into both the left and right subtrees, searching for either target in each.",
          "If both the left and right recursive calls return a non-null result, that means p was found in one subtree and q in the other — the current node is exactly where their paths diverge, making it the LCA.",
          "If only one side returned a non-null result, that side contains either one or both targets — propagate that result upward unchanged, since the true LCA must be at or above that point.",
          "The call on the original root eventually returns the LCA once the recursion fully unwinds."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness follows from a key invariant: a non-null return value from a subtree's recursive call means that subtree contains at least one of the two target nodes (possibly both, if it's already found their LCA internally). When a node receives non-null results from BOTH its left and right recursive calls, this proves the two targets are split across its two subtrees — meaning this node is precisely the deepest node with both as descendants, satisfying the definition of LCA. If a node already equals one of the targets, it's correctly returned immediately, since (by definition) any node is its own ancestor, covering the edge case where one target is an ancestor of the other." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. RED-BLACK TREES
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Red-Black Trees",
      href: "/algorithms/trees/red-black",
      type: "Hard",

      about: [
        { tag: "h1", text: "Red-Black Trees" },
        { tag: "p", text: "A Red-Black Tree is a self-balancing BST where every node is colored either red or black, and a set of coloring rules guarantees the tree's height never exceeds roughly 2 log₂(n+1) — looser than AVL's stricter balance, but cheaper to maintain. Invented by Rudolf Bayer in 1972 (originally as 'symmetric binary B-trees'), it's the most widely deployed self-balancing tree structure in real-world software." },
        { tag: "p", text: "The five defining rules are: (1) every node is red or black, (2) the root is always black, (3) every leaf (null/nil) is considered black, (4) a red node never has a red child ('no two reds in a row'), and (5) every path from a given node to any of its descendant null leaves passes through the same number of black nodes ('black-height' is consistent). These rules together guarantee no root-to-leaf path is ever more than twice as long as any other, which is what bounds the height to O(log n)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Write-heavy workloads — Red-Black trees require fewer rotations per insertion/deletion than AVL trees, making writes cheaper at a small cost to lookup speed",
          "Implementing language standard library ordered containers — this is what backs C++'s std::map/std::set, Java's TreeMap/TreeSet, and the Linux kernel's completely fair scheduler (CFS)",
          "Any general-purpose balanced BST need where you don't have a strong reason to prefer AVL's stricter balance",
          "Interval trees (used for efficient overlap queries) are commonly built as an augmented Red-Black tree"
        ]},
        { tag: "table",
          headers: ["Property", "AVL Tree", "Red-Black Tree"],
          rows: [
            ["Balance strictness", "Height difference ≤ 1 (strict)", "Height difference ≤ 2x (looser)"],
            ["Lookup speed", "Slightly faster (more balanced)", "Slightly slower"],
            ["Insert/delete speed", "Slower (more rotations)", "Faster (fewer rotations, O(1) amortised recoloring)"],
            ["Typical use", "Read-heavy", "Write-heavy / general-purpose"]
          ]
        },
        { tag: "note", variant: "info", text: "Red-Black trees are also the structural basis for 2-3-4 trees (a type of B-tree) — there's a direct, well-known correspondence between the two, which is part of why the coloring-based balance rules work at all." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case — O(log n)" },
          { tag: "p", text: "Just like AVL trees, the height guarantee is structural and unconditional, so even the most favourable single query is still classified by the algorithm's guaranteed bound, not by luck." },
          { tag: "ul", items: [
            "The 5 Red-Black invariants guarantee height ≤ 2 log₂(n+1) at all times, for any insertion/deletion sequence",
            "Search, insert, and delete all follow a root-to-leaf path bounded by this height: O(log n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          { tag: "p", text: "Because the coloring invariants are actively maintained after every modification, there's no input sequence that produces a worse average shape than the guaranteed bound." },
          { tag: "ul", items: [
            "Search: O(h) = O(log n)",
            "Insert: O(log n) to find the insertion point, plus O(1) amortised recoloring/rotation to restore the invariants (a key advantage over AVL, where rebalancing can require more frequent rotations)",
            "Delete: O(log n) to find the node, plus a bounded number of rotations (at most 3) to restore the invariants"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n)" },
          { tag: "p", text: "Like AVL trees, this is the entire purpose of the structure: no input sequence can ever produce a Red-Black tree taller than its proven bound." },
          { tag: "ul", items: [
            "Provable bound: a Red-Black tree with n internal nodes has height at most 2 log₂(n+1)",
            "This follows from the black-height invariant: a subtree rooted at any node with black-height bh has at least 2^bh − 1 internal nodes, and the no-two-reds-in-a-row rule means the longest possible path is at most twice the shortest",
            "No adversarial insertion/deletion sequence can break this bound — it's restored after every single operation"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n nodes requires O(n) space, plus a single extra bit per node to store its color — a much smaller per-node overhead than AVL's integer height/balance-factor field." },
          { tag: "ul", items: ["n node objects, each with left/right/parent pointers + a 1-bit color field: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Total stored data is fixed by n alone, since the guaranteed height bound doesn't change how many nodes need to be stored, only how they're arranged." },
          { tag: "ul", items: ["O(n) for node storage", "O(log n) for the recursion/iteration depth during any single operation, due to the guaranteed logarithmic height"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No insertion/deletion sequence increases storage beyond the fixed per-node overhead — exactly like AVL trees, space depends only on node count, not on tree shape." },
          { tag: "ul", items: [
            "O(n) total node storage",
            "O(log n) recursion/iteration depth during any single operation — guaranteed by the height bound"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "High-level insertion logic (full rotation/recoloring case analysis is extensive; the core structure is shown here):" },
        { tag: "code", language: "text", text:
`function insert(tree, key):
    newNode ← new Node(key, color = RED)
    bstInsert(tree, newNode)              // standard BST insertion
    fixInsertViolations(tree, newNode)

function fixInsertViolations(tree, node):
    while node.parent.color == RED:
        if node.parent == node.grandparent.left:
            uncle ← node.grandparent.right
            if uncle.color == RED:
                // Case 1: uncle is red — recolor and move up
                node.parent.color ← BLACK
                uncle.color ← BLACK
                node.grandparent.color ← RED
                node ← node.grandparent
            else:
                if node == node.parent.right:
                    // Case 2: triangle shape — rotate to make it a line
                    node ← node.parent
                    rotateLeft(tree, node)
                // Case 3: line shape — rotate and recolor
                node.parent.color ← BLACK
                node.grandparent.color ← RED
                rotateRight(tree, node.grandparent)
        else:
            // mirror image of the above, swapping left/right
            ...

    tree.root.color ← BLACK                // rule: root is always black` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Insert the new node exactly like a standard BST insertion, but always color it red initially — this never violates the black-height rule (rule 5), since a new red leaf doesn't add to any path's black-node count.",
          "Coloring the new node red CAN violate rule 4 (no two reds in a row) if its parent is also red — this is the only possible violation after a plain BST insertion, and it's fixed by examining the new node's 'uncle' (its grandparent's other child).",
          "If the uncle is red: recolor the parent and uncle to black and the grandparent to red, then continue the fix-up process treating the grandparent as the new 'node' — this can propagate the red-red violation further up the tree.",
          "If the uncle is black (or absent): rotations are needed. A 'triangle' shape (node is on the opposite side of its parent than the parent is of the grandparent) is first rotated into a 'line' shape, then a single rotation plus a recolor of the parent/grandparent resolves the violation completely without needing to propagate further up.",
          "Finally, the root is always recolored black, satisfying rule 2 unconditionally — this can never violate the black-height rule, since lowering one red root to black only ever increases (or leaves unchanged) the black count of paths through it, uniformly across the whole tree."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The five Red-Black invariants together force a provable height bound: rule 4 (no two consecutive reds) means that on any root-to-leaf path, red nodes can never make up more than half the path, so the longest path is at most twice the length of the shortest. Rule 5 (equal black-height on every path) is what makes 'shortest path' a well-defined, consistent quantity. The fix-up procedure is correct because each of its three cases either resolves the violation completely (cases 2 and 3, via rotation) or provably preserves all other invariants while pushing the violation strictly higher up the tree (case 1, recoloring) — and since the tree has finite height, this propagation must terminate, either by reaching a black parent (no violation) or by reaching the root (which is then simply recolored black, always a safe final fix)." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const DYNAMIC_PROGRAMMING_SECTION = {
  name: "Dynamic Programming",
  href: "/algorithms/dynamic_programming",
  desc: "Memoization, tabulation, optimal substructure",
  complexity: "O(n²)",
  count: 7,

  about: [
    { tag: "h1", text: "Dynamic Programming" },
    { tag: "p", text: "Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems, solving each subproblem exactly once, and reusing those results instead of recomputing them. It applies whenever a problem exhibits two properties: optimal substructure (an optimal solution can be built from optimal solutions to its subproblems) and overlapping subproblems (a naive recursive solution would solve the same subproblem many times)." },
    { tag: "p", text: "Without overlapping subproblems, plain recursion (divide and conquer, like Merge Sort) is already efficient — DP's entire value proposition is eliminating redundant recomputation. The classic illustration is naive recursive Fibonacci: fib(5) calls fib(4) and fib(3), but fib(4) ALSO calls fib(3) — that single redundant call, multiplied across every level of recursion, is what turns an O(n) problem into an O(2ⁿ) nightmare without memoization." },
    { tag: "h2", text: "Two implementation styles" },
    { tag: "table",
      headers: ["Style", "Direction", "How it works", "Trade-off"],
      rows: [
        ["Memoization (top-down)", "Recursive, same as naive solution", "Cache each subproblem's result the first time it's computed; return the cached value on repeat calls", "Easier to write from a recursive definition; pays recursion call-stack overhead"],
        ["Tabulation (bottom-up)", "Iterative, smallest subproblems first", "Fill a table in dependency order so every subproblem's prerequisites are already solved when needed", "Usually faster in practice (no call-stack overhead); requires figuring out the correct fill order upfront"]
      ]
    },
    { tag: "h2", text: "Recognising a DP problem" },
    { tag: "ul", items: [
      "The problem asks for an optimum (minimum/maximum) or a count, and naturally decomposes into smaller versions of itself",
      "A greedy (locally-optimal) choice provably does NOT always lead to a globally optimal answer — if it did, a simpler greedy algorithm would suffice instead",
      "A brute-force recursive solution would revisit the same (state, parameters) combination multiple times along different recursive paths",
      "The problem can be expressed as filling in a 1D or 2D table where each cell depends only on previously-computed cells"
    ]},
    { tag: "note", variant: "tip", text: "Every DP solution starts the same way: define the state (what does dp[i] or dp[i][j] represent?), find the recurrence (how does it relate to smaller states?), and identify the base case. Getting the state definition right is almost always the hardest part — the rest follows mechanically." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. 0/1 KNAPSACK
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "0/1 Knapsack",
      href: "/algorithms/dynamic_programming/knapsack",
      type: "Medium",

      about: [
        { tag: "h1", text: "0/1 Knapsack" },
        { tag: "p", text: "Given n items, each with a weight and a value, and a knapsack with maximum weight capacity W, the 0/1 Knapsack problem asks for the maximum total value achievable without exceeding the capacity — where each item can either be taken whole or left behind entirely ('0/1', as opposed to the Fractional Knapsack variant, which allows taking partial items and is solvable greedily instead)." },
        { tag: "p", text: "It's the canonical example of DP with two-dimensional state: the decision for each item depends not just on which items came before, but on how much capacity remains — so the state must capture both 'which items have been considered' and 'how much weight budget is left'." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Resource allocation under a hard capacity constraint where items are indivisible (can't take 60% of a physical item)",
          "Budget allocation: maximise value/return subject to a fixed total spending limit, with discrete (not fractional) investment options",
          "Subset-sum problems are a special case (value = weight for every item, asking whether some subset sums exactly to a target)",
          "Note: if items CAN be split fractionally, a much simpler O(n log n) greedy algorithm (Fractional Knapsack) solves it instead — always check divisibility before reaching for the DP solution"
        ]},
        { tag: "note", variant: "warning", text: "0/1 Knapsack's O(nW) complexity is pseudo-polynomial — it depends on the numeric VALUE of W, not just the count of items. If W is exponentially large relative to n (e.g. W = 2^64), this DP approach becomes impractical despite the polynomial-looking formula." }
      ],

      timeComplexityCalculation: {
        notation: "O(nW)",
        best: [
          { tag: "h2", text: "Best Case — O(nW)" },
          { tag: "p", text: "The standard tabulation approach always fills the entire n × W table regardless of the specific weights and values involved — there's no early-exit shortcut, since every cell potentially contributes to the final answer." },
          { tag: "ul", items: [
            "Table has (n + 1) rows × (W + 1) columns",
            "Each cell requires O(1) work: one comparison between 'exclude this item' and 'include this item'",
            "Total: O(nW), unconditionally, even for the most favourable item set"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(nW)" },
          { tag: "p", text: "Every cell of the DP table is computed exactly once with constant work, regardless of the specific weight/value distribution of the items — the algorithm's structure doesn't branch based on input values." },
          { tag: "ul", items: [
            "(n+1) × (W+1) cells, O(1) work per cell = O(nW)",
            "No input distribution changes this fixed iteration structure"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(nW)" },
          { tag: "p", text: "No item configuration increases the cost beyond filling the full table — this is simultaneously the best, average, and worst case, since the DP table size is fixed entirely by n and W." },
          { tag: "ul", items: [
            "O(nW) holds unconditionally",
            "This is pseudo-polynomial: if W is given in binary with b bits, W = 2^b, so the 'polynomial-looking' O(nW) is actually O(n · 2^b) — exponential in the INPUT SIZE of W, which is why huge capacity values make this approach impractical"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(nW)",
        best: [
          { tag: "h2", text: "Best Case Space — O(W)" },
          { tag: "p", text: "Since each row of the DP table only depends on the immediately preceding row, the table can be compressed to a single 1D array of size W+1, processed carefully right-to-left to avoid overwriting values still needed." },
          { tag: "ul", items: ["1D rolling array: O(W)", "This space optimisation works for any input, not just favourable ones"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(nW)" },
          { tag: "p", text: "The naive (unoptimised) 2D table implementation always allocates the full n × W grid, regardless of item values, since the recurrence is defined cell-by-cell over both dimensions." },
          { tag: "ul", items: ["Full 2D table: (n+1) × (W+1) = O(nW)", "Needed if you must reconstruct WHICH items were chosen, not just the optimal value"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(nW)" },
          { tag: "p", text: "No item configuration changes the table size — it's fixed entirely by the problem parameters n and W, identical across all cases for the standard 2D implementation." },
          { tag: "ul", items: [
            "O(nW) for the full table, or O(W) with the 1D rolling-array optimisation (at the cost of losing the ability to trace back which items were selected without extra bookkeeping)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function knapsack(weights, values, n, W):
    dp ← 2D array of size (n+1) x (W+1), all zero

    for i from 1 to n:
        for w from 0 to W:
            // Option 1: don't take item i
            dp[i][w] ← dp[i-1][w]

            // Option 2: take item i, if it fits
            if weights[i-1] <= w:
                dp[i][w] ← max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])

    return dp[n][W]` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Define dp[i][w] as 'the maximum value achievable using only the first i items, with total weight at most w'.",
          "Base case: dp[0][w] = 0 for all w — with zero items available, no value can be achieved regardless of capacity.",
          "For each item i and each possible capacity w, two options exist: exclude item i (carry forward dp[i-1][w] unchanged), or include item i if it fits (add its value to the best solution using one less item and w minus item i's weight).",
          "Take the better of these two options as dp[i][w].",
          "After filling the entire table, dp[n][W] holds the answer: the maximum value achievable using any subset of all n items within the full capacity W."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Optimal substructure: the optimal solution using the first i items and capacity w must either include item i or not. If it doesn't include item i, the optimal solution is exactly the optimal solution using the first i-1 items and the same capacity w — by definition. If it does include item i, the remaining budget w − weights[i-1] must be allocated optimally among the first i-1 items, which is exactly dp[i-1][w − weights[i-1]] by the same inductive definition. Since these are the only two possibilities and both are correctly computed by the recurrence (by strong induction on i), taking their maximum correctly computes dp[i][w] for every cell, and the final answer dp[n][W] is therefore provably optimal." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. MATRIX CHAIN MULTIPLICATION
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Matrix Chain Multiplication",
      href: "/algorithms/dynamic_programming/matrix-chain",
      type: "Hard",

      about: [
        { tag: "h1", text: "Matrix Chain Multiplication" },
        { tag: "p", text: "Given a sequence of matrices to multiply together, Matrix Chain Multiplication finds the optimal way to parenthesise the multiplications to minimise the total number of scalar multiplications performed — matrix multiplication is associative, so (AB)C and A(BC) produce the same result matrix, but can require drastically different amounts of computation depending on the matrices' dimensions." },
        { tag: "p", text: "It's the classic example of interval DP: the state is defined over a CONTIGUOUS RANGE [i, j] of the chain rather than a prefix, and the recurrence works by trying every possible 'split point' k within the range where the final multiplication could occur, recursively combining the optimal cost of the left part [i,k] and right part [k+1,j]." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Optimising the order of operations for a chain of matrix multiplications in numerical computing libraries",
          "Any problem requiring optimal parenthesisation/bracketing of a sequence of associative operations with position-dependent cost",
          "The general template for 'interval DP' problems — many other problems (optimal BST construction, palindrome partitioning cost) follow the exact same [i,j]-with-split-point pattern",
          "Compiler optimisation: choosing the optimal order to evaluate a chain of associative operations to minimise computation cost"
        ]},
        { tag: "note", variant: "tip", text: "This algorithm finds the optimal PARENTHESISATION (the order of operations), not the matrix product itself — the actual multiplication still has to be performed afterward according to the discovered optimal order." }
      ],

      timeComplexityCalculation: {
        notation: "O(n³)",
        best: [
          { tag: "h2", text: "Best Case — O(n³)" },
          { tag: "p", text: "The algorithm always evaluates every possible split point for every possible sub-chain length and starting position — there's no early-exit shortcut even for the most favourable matrix dimensions." },
          { tag: "ul", items: [
            "O(n²) distinct sub-chains [i, j] to compute",
            "Each sub-chain's optimal cost requires trying up to O(n) possible split points k",
            "Total: O(n²) sub-chains × O(n) split points each = O(n³)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n³)" },
          { tag: "p", text: "Every (i, j, k) combination is evaluated exactly once with O(1) work per combination, regardless of the actual matrix dimension values — the algorithm's iteration structure is fixed by n alone." },
          { tag: "ul", items: [
            "Three nested considerations: chain length (O(n)), starting index i (O(n)), and split point k (O(n)) combine to O(n³) total operations",
            "Each operation is O(1): one multiplication for the cost calculation, one comparison against the running minimum"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n³)" },
          { tag: "p", text: "No matrix dimension configuration increases the cost beyond the fixed triple-nested iteration over chain length, start position, and split point." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n³)",
            "This is one of the standard examples of interval DP's characteristic O(n³) bound, arising from O(n²) states each requiring an O(n) decision"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n²)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n²)" },
          { tag: "p", text: "The DP table stores the optimal cost for every possible sub-chain [i, j], requiring a 2D table of size n × n regardless of the matrix dimensions involved." },
          { tag: "ul", items: ["Cost table: n × n entries — O(n²)", "Optional split-point table (for reconstructing the actual parenthesisation): another O(n²)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n²)" },
          { tag: "p", text: "Table size is fixed by the number of matrices n alone — it doesn't depend on the specific dimension values of the matrices being multiplied." },
          { tag: "ul", items: ["Same O(n²) bound regardless of matrix dimension distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n²)" },
          { tag: "p", text: "No matrix configuration increases space beyond the fixed n × n cost table — this is both the floor and ceiling for the algorithm's memory footprint." },
          { tag: "ul", items: ["Cost table + split table: O(n²) total, identical across all cases"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Given dimensions array p where matrix i has dimensions p[i-1] × p[i]:" },
        { tag: "code", language: "text", text:
`function matrixChainOrder(p):                 // p has length n+1 for n matrices
    n ← length(p) − 1
    dp ← 2D array of size (n+1) x (n+1), all zero

    for length from 2 to n:                    // chain length being considered
        for i from 1 to n − length + 1:
            j ← i + length − 1
            dp[i][j] ← infinity

            for k from i to j − 1:
                cost ← dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j]
                if cost < dp[i][j]:
                    dp[i][j] ← cost
                    split[i][j] ← k             // remember where to split, for reconstruction

    return dp[1][n]` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Define dp[i][j] as 'the minimum number of scalar multiplications needed to compute the product of matrices i through j'.",
          "Base case (implicit): dp[i][i] = 0 — a single matrix needs no multiplication.",
          "Process sub-chains in order of increasing length, since computing dp[i][j] requires dp[i][k] and dp[k+1][j] for sub-chains shorter than [i,j].",
          "For each sub-chain [i, j], try every possible split point k — the position of the LAST multiplication performed when computing this sub-chain's product.",
          "The cost of splitting at k is: the cost to compute the left part (dp[i][k]), plus the cost to compute the right part (dp[k+1][j]), plus the cost of the final multiplication joining them (p[i-1] × p[k] × p[j], based on the resulting matrix dimensions).",
          "Take the minimum cost over all possible split points as dp[i][j], and remember which k achieved it for later reconstruction of the actual parenthesisation."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Optimal substructure: in any valid parenthesisation of matrices i through j, there must be SOME position k where the final (outermost) multiplication occurs, splitting the chain into a left part [i,k] and right part [k+1,j]. Whatever k is chosen, the optimal way to compute each of those two parts independently must itself be optimal — if a cheaper way to compute [i,k] existed, substituting it would only decrease the total cost, contradicting optimality. By trying every possible k and taking the minimum, the algorithm is guaranteed to consider the true optimal split point among all candidates, and by strong induction on chain length, every dp[i][k] and dp[k+1][j] used in that calculation is already correctly computed (since they represent strictly shorter sub-chains processed earlier)." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. LONGEST COMMON SUBSEQUENCE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Common Subsequence",
      href: "/algorithms/dynamic_programming/lcs",
      type: "Medium",

      about: [
        { tag: "h1", text: "Longest Common Subsequence (LCS)" },
        { tag: "p", text: "Given two sequences, LCS finds the length (and optionally the content) of the longest subsequence common to both — a subsequence preserves relative order but doesn't need to be contiguous (unlike a substring). For example, the LCS of 'ABCBDAB' and 'BDCABA' is 'BCBA', length 4, even though 'BCBA' doesn't appear contiguously in either original string." },
        { tag: "p", text: "It's the foundational two-sequence DP problem — the same [i][j] table-with-two-pointers-walking-backward structure underlies diff tools (computing the minimal edit between two file versions), DNA sequence alignment in bioinformatics, and the Levenshtein edit-distance algorithm, which is essentially LCS with additional operation types." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Comparing two sequences for similarity while allowing gaps (unlike substring matching, which requires contiguity)",
          "Version control diff algorithms (git diff is conceptually built on LCS-style sequence alignment)",
          "Bioinformatics: aligning DNA, RNA, or protein sequences to measure evolutionary similarity",
          "As a building block for related problems: edit distance, shortest common supersequence, and the 'minimum deletions to make two strings equal' family of problems"
        ]},
        { tag: "note", variant: "tip", text: "LCS length directly gives you other useful values: minimum deletions to transform string A into a common subsequence is len(A) − LCS, and the shortest common supersequence length is len(A) + len(B) − LCS." }
      ],

      timeComplexityCalculation: {
        notation: "O(mn)",
        best: [
          { tag: "h2", text: "Best Case — O(mn)" },
          { tag: "p", text: "The standard tabulation approach always fills the entire m × n table regardless of how similar or dissimilar the two input sequences are — there's no early-exit shortcut for the standard algorithm." },
          { tag: "ul", items: [
            "Table has (m+1) rows × (n+1) columns, where m and n are the two sequence lengths",
            "Each cell requires O(1) work: one character comparison plus a max of two or three neighboring cells",
            "Total: O(mn), even for two identical sequences"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(mn)" },
          { tag: "p", text: "Every cell of the DP table is computed exactly once with constant work, regardless of the specific character distribution in the two sequences." },
          { tag: "ul", items: [
            "(m+1) × (n+1) cells, O(1) work per cell = O(mn)",
            "No input distribution changes this fixed iteration structure for the standard tabulation approach"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(mn)" },
          { tag: "p", text: "No pair of input sequences increases the cost beyond filling the full table — this is simultaneously the best, average, and worst case for the standard DP solution." },
          { tag: "ul", items: [
            "O(mn) holds unconditionally for the standard algorithm",
            "Faster algorithms exist for special cases (e.g. Hunt-Szymanski achieves O((m+r) log m) when the number of matching pairs r is small), but the general-purpose DP bound remains O(mn)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(mn)",
        best: [
          { tag: "h2", text: "Best Case Space — O(min(m, n))" },
          { tag: "p", text: "If only the LENGTH of the LCS is needed (not the actual subsequence), the table can be compressed to two rolling 1D arrays of size min(m,n)+1, since each row only depends on the previous row." },
          { tag: "ul", items: ["Two rolling 1D arrays: O(min(m, n))", "This optimisation applies regardless of input content"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(mn)" },
          { tag: "p", text: "The naive (unoptimised) full 2D table is always allocated at size (m+1) × (n+1), since the recurrence is defined cell-by-cell over both dimensions, and reconstructing the actual subsequence requires the full table." },
          { tag: "ul", items: ["Full 2D table: O(mn)", "Required if you need to trace back and output the actual common subsequence, not just its length"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(mn)" },
          { tag: "p", text: "No input pair changes the table size — it's fixed entirely by the two sequence lengths, identical across all cases for the standard 2D implementation." },
          { tag: "ul", items: ["O(mn) for the full table when subsequence reconstruction is needed, or O(min(m,n)) with rolling arrays when only the length is required"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function lcs(A, B):
    m ← length(A); n ← length(B)
    dp ← 2D array of size (m+1) x (n+1), all zero

    for i from 1 to m:
        for j from 1 to n:
            if A[i-1] == B[j-1]:
                dp[i][j] ← dp[i-1][j-1] + 1
            else:
                dp[i][j] ← max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Define dp[i][j] as 'the length of the LCS of A's first i characters and B's first j characters'.",
          "Base case: dp[0][j] = dp[i][0] = 0 — an empty sequence has no common subsequence with anything, by definition.",
          "If the current characters A[i-1] and B[j-1] match, they can both extend a common subsequence — so dp[i][j] = dp[i-1][j-1] + 1, building on the best LCS that didn't include either of these two characters.",
          "If they don't match, the LCS of A[0..i-1] and B[0..j-1] must come from either dropping the current character of A or dropping the current character of B — take the better (longer) of these two options.",
          "After filling the entire table, dp[m][n] holds the length of the LCS of the complete strings A and B."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Optimal substructure: if A[i-1] == B[j-1], this matching character can always be included in SOME longest common subsequence of A[0..i-1] and B[0..j-1] (a standard exchange argument shows that if an optimal LCS doesn't use this match, it can be modified to use it without becoming shorter) — so the problem correctly reduces to 1 + LCS(A[0..i-2], B[0..j-2]). If they don't match, the final characters can't BOTH be part of the LCS, so the optimal solution must exclude at least one of them — meaning the true LCS length equals the best of 'exclude A[i-1]' or 'exclude B[j-1]', exactly what max(dp[i-1][j], dp[i][j-1]) computes. By strong induction on i+j, every smaller subproblem used in these recurrences is already correctly computed." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. LONGEST INCREASING SUBSEQUENCE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Increasing Subsequence",
      href: "/algorithms/dynamic_programming/lis",
      type: "Medium",

      about: [
        { tag: "h1", text: "Longest Increasing Subsequence (LIS)" },
        { tag: "p", text: "Given a sequence of numbers, LIS finds the length of the longest subsequence (not necessarily contiguous) where every element is strictly greater than the one before it. For example, the LIS of [10, 9, 2, 5, 3, 7, 101, 18] is [2, 3, 7, 18] or [2, 3, 7, 101], both length 4." },
        { tag: "p", text: "There are two standard approaches with very different complexity: a straightforward O(n²) DP where dp[i] represents the LIS length ending at index i, and a cleverer O(n log n) approach that maintains an auxiliary array of 'smallest possible tail values' for increasing subsequences of each length, using binary search to find where each new element belongs." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Stock market analysis: longest run of increasing prices (or the related 'patience sorting' card game analogy)",
          "Scheduling problems: finding the maximum number of non-conflicting, chronologically-ordered tasks",
          "Box-stacking / Russian Doll Envelopes style problems, which reduce to LIS after sorting by one dimension",
          "As a building block for the patience sorting algorithm, and a classic example of converting an O(n²) DP into O(n log n) via auxiliary data structure cleverness"
        ]},
        { tag: "note", variant: "tip", text: "The O(n log n) approach's auxiliary 'tails' array is NOT itself a valid LIS — it just tracks the smallest tail value achievable for each subsequence length, which is enough to determine the final LENGTH correctly even though the array's contents don't form an actual increasing subsequence from the input." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case — O(n log n)" },
          { tag: "p", text: "Even on an already strictly-increasing input (where every element extends the current longest run), the O(n log n) algorithm still performs a binary search for each element to determine where it belongs in the auxiliary tails array — there's no shortcut to O(n)." },
          { tag: "ul", items: [
            "n elements processed, each requiring a binary search into the tails array (which has length at most n): O(log n) per element",
            "Total: O(n log n), even for the most favourable (fully sorted) input"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n)" },
          { tag: "p", text: "Each element triggers exactly one binary search into the tails array, regardless of the specific values or their relative ordering — the binary search cost is bounded by the current tails array length, which is at most n." },
          { tag: "ul", items: [
            "n binary searches, each O(log n): O(n log n) total",
            "The simpler O(n²) DP approach instead does n elements × up to n comparisons each = O(n²), always slower asymptotically but sometimes simpler to reason about and implement"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n)" },
          { tag: "p", text: "No input arrangement increases the cost beyond n binary searches — even a strictly decreasing sequence (which produces the shortest possible LIS, length 1) still requires checking each element with a binary search." },
          { tag: "ul", items: [
            "Worst case matches best/average: O(n log n)",
            "This is provably optimal for comparison-based LIS computation, matching known lower bounds for this class of problem"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The tails array can grow up to length n in the best case (a fully increasing sequence), requiring O(n) space to track the smallest tail value for every possible subsequence length." },
          { tag: "ul", items: ["tails array: up to O(n) entries"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is bounded by n regardless of the actual LIS length, since the tails array's maximum possible size is fixed by the input length." },
          { tag: "ul", items: ["tails array: O(n) in the worst case, though it could be smaller for inputs with a short true LIS"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "Even in the case producing the longest possible tails array (a strictly increasing input sequence), space stays bounded by O(n) — it can never exceed the input length." },
          { tag: "ul", items: [
            "tails array: O(n)",
            "If reconstructing the actual LIS (not just its length) is required, an additional O(n) predecessor-tracking array is needed, still O(n) total"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "O(n log n) patience-sorting-based approach:" },
        { tag: "code", language: "text", text:
`function lengthOfLIS(arr):
    tails ← empty array

    for x in arr:
        // Binary search for the leftmost position in tails where x can be placed
        lo ← 0; hi ← length(tails)
        while lo < hi:
            mid ← (lo + hi) / 2
            if tails[mid] < x:
                lo ← mid + 1
            else:
                hi ← mid

        if lo == length(tails):
            append x to tails           // x extends the longest subsequence so far
        else:
            tails[lo] ← x               // x replaces an existing tail with a smaller value

    return length(tails)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain an array 'tails' where tails[k] represents the smallest possible tail value among all increasing subsequences of length k+1 found so far.",
          "For each new element x in the input, binary search 'tails' to find the leftmost position where x could replace an existing value (i.e. the first tail value that is ≥ x).",
          "If x is larger than every value currently in tails, it can extend the longest subsequence found so far — append it, growing the answer length by 1.",
          "Otherwise, x replaces the existing tail at that position — this doesn't change the recorded LENGTH of that subsequence length, but it gives a SMALLER tail value, which makes it easier for future elements to extend that subsequence further.",
          "After processing all elements, the length of the tails array is the length of the longest increasing subsequence."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Key invariant: at every point during the algorithm, tails[k] holds the smallest possible last-element value among all increasing subsequences of length k+1 discovered in the input processed so far. This invariant is maintained because replacing tails[lo] with a smaller x can only ever help future elements (a smaller tail value is strictly easier to extend than a larger one, since 'increasing' comparisons become more permissive), and it never hurts, since the LENGTH represented by that position doesn't change. Appending x when it exceeds every current tail correctly represents a genuinely new, longer subsequence. Because tails is always sorted (each binary search and replacement preserves sortedness, since x replaces the first value ≥ x), binary search correctly finds the right position in O(log n), and the final length of tails accurately reflects the longest increasing subsequence length, even though the contents of tails don't form an actual subsequence from the array themselves." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. COIN CHANGE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Coin Change",
      href: "/algorithms/dynamic_programming/coin-change",
      type: "Medium",

      about: [
        { tag: "h1", text: "Coin Change" },
        { tag: "p", text: "Given a set of coin denominations and a target amount, the Coin Change problem asks for the minimum number of coins needed to make exactly that amount (assuming unlimited supply of each denomination), or reports that it's impossible. A related variant counts the total NUMBER of distinct ways to make the amount, rather than the minimum coin count." },
        { tag: "p", text: "It's a deceptively simple-looking problem that's actually a trap for greedy algorithms: greedily always picking the largest coin that fits works for 'canonical' coin systems like US currency (1, 5, 10, 25), but fails for arbitrary denominations — e.g. with coins [1, 3, 4], greedily making 6 picks [4, 1, 1] (3 coins) when [3, 3] (2 coins) is actually optimal. This is exactly why DP, not greedy, is the generally correct approach." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Making change with an arbitrary (non-canonical) set of denominations where greedy isn't guaranteed correct",
          "Any 'minimum number of items from an unlimited supply to reach an exact target sum' problem — this template generalises far beyond literal currency",
          "The counting variant ('how many ways can you make this amount') is a classic unbounded knapsack-style problem, useful for combinatorics and probability calculations",
          "Verifying whether a greedy currency system is safe to use (if DP and greedy always agree across all reachable amounts, the greedy approach is provably correct for that specific coin set)"
        ]},
        { tag: "note", variant: "warning", text: "Never assume greedy works for coin change unless you've proven the specific coin set is 'canonical' — silently wrong greedy answers are a classic source of subtle bugs in real payment/change-making systems." }
      ],

      timeComplexityCalculation: {
        notation: "O(n·amount)",
        best: [
          { tag: "h2", text: "Best Case — O(n·amount)" },
          { tag: "p", text: "The standard tabulation approach always fills the entire dp array of size amount+1, trying every coin denomination at every amount — there's no early-exit shortcut even if the optimal solution uses very few coins." },
          { tag: "ul", items: [
            "dp array has amount+1 entries",
            "Each entry requires checking all n coin denominations: O(n) per entry",
            "Total: O(n · amount), even for the most favourable coin set"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n·amount)" },
          { tag: "p", text: "Every (amount, coin) combination is checked exactly once with O(1) work, regardless of which coins actually contribute to the optimal solution." },
          { tag: "ul", items: [
            "(amount+1) sub-amounts × n coins each = O(n · amount) total operations",
            "Each operation is O(1): one addition, one comparison against the running minimum"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n·amount)" },
          { tag: "p", text: "No coin denomination configuration increases the cost beyond the fixed nested iteration over amounts and coins." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n · amount)",
            "Like Knapsack, this is pseudo-polynomial — it depends on the numeric VALUE of 'amount', not just the count of coin denominations, so very large target amounts make this approach impractical despite the polynomial-looking formula"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(amount)",
        best: [
          { tag: "h2", text: "Best Case Space — O(amount)" },
          { tag: "p", text: "A single 1D array of size amount+1 is sufficient, since each entry dp[a] only depends on smaller-amount entries dp[a - coin], all of which are already computed when processed in increasing order of amount." },
          { tag: "ul", items: ["dp array: O(amount), regardless of how many coin denominations exist"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(amount)" },
          { tag: "p", text: "Space usage is fixed by the target amount alone, since the 1D dp array's size doesn't depend on the number or values of the coin denominations." },
          { tag: "ul", items: ["Same O(amount) bound regardless of coin set composition"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(amount)" },
          { tag: "p", text: "No coin configuration increases space beyond the fixed-size 1D array — this is both the floor and ceiling for the algorithm's memory footprint." },
          { tag: "ul", items: ["dp array: O(amount), identical across all cases"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Minimum-number-of-coins variant:" },
        { tag: "code", language: "text", text:
`function coinChange(coins, amount):
    dp ← array of size amount + 1, all set to infinity
    dp[0] ← 0                          // base case: 0 coins needed to make amount 0

    for a from 1 to amount:
        for coin in coins:
            if coin <= a:
                dp[a] ← min(dp[a], dp[a - coin] + 1)

    return dp[amount] if dp[amount] != infinity else IMPOSSIBLE` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Define dp[a] as 'the minimum number of coins needed to make exactly amount a', with dp[0] = 0 as the base case.",
          "Process amounts in increasing order from 1 up to the target, since dp[a] depends on dp[a - coin] for various coins, all of which are smaller amounts already computed.",
          "For each amount a, try every available coin denomination: if the coin's value is ≤ a, check whether using that coin (and then optimally making the remaining a − coin) beats the current best known way to make a.",
          "Take the minimum over all coin choices as dp[a].",
          "After filling the entire array, dp[amount] holds the answer — or remains infinity if no combination of coins can make that exact amount."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Optimal substructure: any optimal solution for amount a must use SOME coin as its 'last' coin — call it coin c. Removing that one coin leaves an optimal solution for amount a − c (if it weren't optimal, a cheaper solution for a − c plus that same coin c would produce a cheaper solution for a, contradicting a's optimality). By trying every possible coin c as the 'last coin' and taking the minimum over dp[a − c] + 1, the algorithm is guaranteed to consider the true optimal choice among all coins, and by induction on a (processing amounts in increasing order), every dp[a − c] referenced is already correctly computed before it's needed." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       6. TRAVELLING SALESPERSON (DP / HELD-KARP)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Travelling Salesperson",
      href: "/algorithms/dynamic_programming/tsp",
      type: "Hard",

      about: [
        { tag: "h1", text: "Travelling Salesperson Problem (Held-Karp DP)" },
        { tag: "p", text: "The Travelling Salesperson Problem (TSP) asks for the shortest possible route that visits every city in a given set exactly once and returns to the starting city. It is NP-hard — no known algorithm solves it in polynomial time, and it's widely believed none exists. The naive brute-force approach checks all (n-1)! possible permutations of cities, but the Held-Karp dynamic programming algorithm (1962) improves this dramatically to O(2ⁿ · n²) by exploiting overlapping subproblems in the permutation structure." },
        { tag: "p", text: "The key insight is the state: instead of tracking which SPECIFIC sequence of cities has been visited (which would require remembering full permutations), Held-Karp tracks only the SET of visited cities (as a bitmask) and the current city — since the optimal cost to finish the tour only depends on those two facts, not on the exact order the visited cities were reached in." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Exact TSP solutions for small instances (Held-Karp is practical up to roughly n ≈ 20, after which the exponential 2ⁿ term becomes prohibitive even with the DP speedup)",
          "Vehicle routing, circuit board drilling path optimisation, and other genuine 'visit every point once, minimise total travel' problems at small scale",
          "Understanding bitmask DP — the state-as-bitmask technique used here generalises to many other 'subset of items processed so far' problems",
          "For larger n, this exact approach is impractical — approximation algorithms (nearest neighbor, Christofides) or metaheuristics (genetic algorithms, simulated annealing) are used instead"
        ]},
        { tag: "note", variant: "warning", text: "O(2ⁿ · n²) is still exponential — Held-Karp is a major improvement over brute force's O(n!), but it does NOT make TSP tractable for large n. At n=25, 2²⁵ ≈ 33 million states already strains practical memory and time limits." }
      ],

      timeComplexityCalculation: {
        notation: "O(2ⁿ · n²)",
        best: [
          { tag: "h2", text: "Best Case — O(2ⁿ · n²)" },
          { tag: "p", text: "The algorithm always computes every (visited-set, current-city) state regardless of the specific distances between cities — there's no early-exit shortcut even for the most geometrically favourable city arrangement." },
          { tag: "ul", items: [
            "2ⁿ possible subsets of visited cities × n possible 'current city' values = O(2ⁿ · n) distinct states",
            "Each state's computation tries up to n possible 'next city' transitions: O(n) per state",
            "Total: O(2ⁿ · n) states × O(n) work each = O(2ⁿ · n²)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(2ⁿ · n²)" },
          { tag: "p", text: "Every reachable (subset, city) state is computed exactly once with the same fixed amount of work, regardless of the specific distance values between cities — only the FINAL chosen route changes with different distances, not the number of states examined." },
          { tag: "ul", items: [
            "O(2ⁿ · n) states, each requiring O(n) work to consider all possible transitions: O(2ⁿ · n²) total",
            "No input distribution changes this fixed state-space structure"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(2ⁿ · n²)" },
          { tag: "p", text: "No city configuration increases the cost beyond the fixed bitmask-state-space exploration — this is simultaneously the best, average, and worst case, since every possible subset must be considered to guarantee the global optimum." },
          { tag: "ul", items: [
            "O(2ⁿ · n²) holds unconditionally",
            "This is a dramatic improvement over brute force's O(n!) (for n=20: 2²⁰·400 ≈ 4×10⁸ vs. 20! ≈ 2.4×10¹⁸), but remains exponential and therefore intractable for large n"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(2ⁿ · n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(2ⁿ · n)" },
          { tag: "p", text: "The DP table must store the optimal cost for every (visited-subset, current-city) combination, requiring space proportional to the full state space regardless of input." },
          { tag: "ul", items: ["DP table: 2ⁿ subsets × n possible current cities = O(2ⁿ · n) entries"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(2ⁿ · n)" },
          { tag: "p", text: "Table size is fixed by the number of cities n alone, since every possible subset must have storage allocated regardless of the actual distances between cities." },
          { tag: "ul", items: ["Same O(2ⁿ · n) bound regardless of distance value distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(2ⁿ · n)" },
          { tag: "p", text: "No city configuration changes the table size — it's fixed entirely by n, identical across all cases." },
          { tag: "ul", items: [
            "O(2ⁿ · n) for the full state table",
            "This exponential space requirement is the practical memory bottleneck that limits Held-Karp to roughly n ≤ 20 on typical hardware, even before considering the exponential time cost"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Held-Karp bitmask DP, starting and ending at city 0:" },
        { tag: "code", language: "text", text:
`function tsp(dist, n):
    // dp[mask][i] = min cost to visit exactly the cities in 'mask',
    //               ending at city i, having started at city 0
    dp ← table of size 2^n x n, all infinity
    dp[1][0] ← 0                        // only city 0 visited, starting point

    for mask from 1 to (2^n − 1):
        for i from 0 to n − 1:
            if dp[mask][i] == infinity: continue
            if not (mask has bit i set): continue

            for j from 0 to n − 1:
                if mask has bit j set: continue       // already visited

                newMask ← mask | (1 << j)
                newCost ← dp[mask][i] + dist[i][j]
                if newCost < dp[newMask][j]:
                    dp[newMask][j] ← newCost

    // Close the tour: return to city 0 from every possible final city
    fullMask ← (1 << n) − 1
    answer ← infinity
    for i from 1 to n − 1:
        answer ← min(answer, dp[fullMask][i] + dist[i][0])

    return answer` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Define dp[mask][i] as 'the minimum cost to visit exactly the set of cities represented by the bitmask mask, ending at city i', always starting from city 0.",
          "Base case: dp[{0}][0] = 0 — having visited only the starting city, at cost zero.",
          "For every reachable state (mask, i), try extending the tour to every unvisited city j: compute the new mask (mask with bit j added) and the new cost (current cost plus the distance from i to j).",
          "Update dp[newMask][j] if this route is better than any previously found way to reach that exact state.",
          "After processing all states, the answer requires closing the loop: for every possible final city i (having visited ALL cities), add the cost of returning from i back to the start, and take the minimum over all choices of final city."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The crucial insight enabling this DP is that the future of the tour (which unvisited cities remain to be visited, and how to visit them optimally) depends ONLY on the current city and the SET of cities already visited — not on the specific order in which they were visited. This means many different permutations that happen to visit the same set of cities and end at the same city are correctly collapsed into a single state, which is exactly what eliminates the (n-1)! redundancy of brute force. By induction on the number of bits set in mask, dp[mask][i] is correctly computed as the minimum over all valid ways to reach that exact (visited-set, current-city) combination, since every transition considered builds directly on already-correctly-computed smaller states (states with fewer visited cities)." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       7. FIBONACCI SEQUENCE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Fibonacci Sequence",
      href: "/algorithms/dynamic_programming/fibonacci",
      type: "Easy",

      about: [
        { tag: "h1", text: "Fibonacci Sequence" },
        { tag: "p", text: "The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, ...) is defined by the recurrence F(n) = F(n-1) + F(n-2), with base cases F(0) = 0 and F(1) = 1. It is the textbook first example used to teach dynamic programming, because the difference between the naive recursive solution and the DP solution is so dramatic and so easy to visualise: O(2ⁿ) exponential time collapses to O(n) linear time with a one-line change (caching results)." },
        { tag: "p", text: "The naive recursive implementation recomputes the same F(k) values an enormous number of times — F(5) calls F(4) and F(3), but F(4) itself calls F(3) and F(2), redundantly recomputing F(3) from scratch. This single overlapping-subproblem pattern, multiplied across every level of recursion, is exactly what every other DP problem in this section is also designed to eliminate, just in a more elaborate form." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "As the canonical teaching example for introducing memoization vs. tabulation",
          "Any literal need to compute Fibonacci numbers (rare in production code, but appears in some combinatorial counting problems, golden-ratio-related geometry, and certain recursive data structure analyses like Fibonacci heaps)",
          "As a sanity-check template before tackling more complex 1D DP problems — if you can derive Fibonacci's DP form fluently, the same 'identify state, find recurrence, identify base case' process generalises directly",
          "Matrix exponentiation variant: when F(n) for very large n (e.g. n = 10^9) is needed, an O(log n) matrix-power approach exists, beyond simple linear DP"
        ]},
        { tag: "note", variant: "tip", text: "Fibonacci is the simplest possible illustration of why DP works: identical (sub)problems, multiplied exponentially by naive recursion's branching, are computed exactly once and reused — the entire DP discipline, in miniature." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "The iterative/tabulation DP solution always computes every F(k) value from 2 up to n exactly once — there's no early-exit shortcut, since each value depends on the two immediately preceding it." },
          { tag: "ul", items: [
            "n − 1 iterations (from F(2) to F(n)), each doing O(1) work (one addition)",
            "Total: O(n), even for the smallest meaningful n"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every value of k from 2 to n requires exactly one addition to compute F(k) from F(k-1) and F(k-2) — there's no value-dependent branching that changes this fixed iteration count." },
          { tag: "ul", items: [
            "n iterations, O(1) work each = O(n)",
            "Compare this to naive recursion's average case, which remains O(2ⁿ) without memoization, or O(n) WITH memoization (since memoization makes the recursive version asymptotically identical to the iterative one)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No value of n changes the structure of the computation — it's always exactly n − 1 additions for the DP solution, matching best and average case exactly." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n)",
            "Without memoization, naive recursive Fibonacci's worst case (and ONLY case, since it has no input-dependent branching either) is O(2ⁿ) — specifically, the number of calls follows the Fibonacci sequence itself, giving O(φⁿ) where φ ≈ 1.618 is the golden ratio, often loosely stated as O(2ⁿ)",
            "The contrast between O(2ⁿ) naive recursion and O(n) DP for the exact same problem is the single clearest illustration of DP's value in all of computer science"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Since F(n) only ever depends on the two immediately preceding values, only two scalar variables need to be tracked at any point — no full array is required." },
          { tag: "ul", items: ["prev, curr (the two most recent Fibonacci values): O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never grows with n — it's always exactly two scalar variables, regardless of how large the target index is." },
          { tag: "ul", items: ["No auxiliary array needed for this particular recurrence, unlike most other DP problems which require O(n) or O(n²) tables"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No value of n increases memory usage beyond the two rolling variables — this is one of the rare DP problems where the full O(n) memoization table can be entirely eliminated via the rolling-variable optimisation." },
          { tag: "ul", items: [
            "O(1) for the iterative rolling-variable approach",
            "Naive unmemoized recursion uses O(n) auxiliary space for its call stack (despite the O(2ⁿ) TIME being the bigger problem) — memoized (top-down) DP uses O(n) space for both the cache and the recursion stack"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Bottom-up tabulation with O(1) space (rolling variables):" },
        { tag: "code", language: "text", text:
`function fibonacci(n):
    if n <= 1:
        return n

    prev ← 0       // F(0)
    curr ← 1       // F(1)

    for i from 2 to n:
        next ← prev + curr
        prev ← curr
        curr ← next

    return curr` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Handle the base cases directly: F(0) = 0 and F(1) = 1.",
          "Initialise two rolling variables, prev and curr, representing F(0) and F(1) respectively.",
          "For each index from 2 up to n, compute the next Fibonacci value as the sum of the two preceding ones — this is the core recurrence, applied iteratively rather than recursively.",
          "Slide the window forward: what was 'curr' becomes the new 'prev', and the newly computed value becomes the new 'curr'.",
          "After the loop completes, 'curr' holds F(n)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "This is a direct, mechanical implementation of the mathematical recurrence F(n) = F(n-1) + F(n-2) with base cases F(0)=0, F(1)=1. By induction on i: after the loop body executes for index i, curr correctly holds F(i) and prev correctly holds F(i-1), assuming this was true before that iteration (which holds trivially at i=2, since prev=F(0) and curr=F(1) at initialisation). Since this invariant is preserved through every iteration, when the loop terminates at i=n, curr correctly equals F(n). The O(1) space variant works precisely because the recurrence has 'memory' of only 2, meaning no value of n ever needs to look further back than its two immediate predecessors." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const LINKED_LISTS_SECTION = {
  name: "Linked Lists",
  href: "/algorithms/linked_lists",
  desc: "Reversal, cycle detection, merge, Floyd's",
  complexity: "O(n)",
  count: 5,

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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const STACKS_SECTION = {
  name: "Stacks",
  href: "/algorithms/stacks",
  desc: "Monotonic stack, bracket matching, next greater",
  complexity: "O(n)",
  count: 5,

  about: [
    { tag: "h1", text: "Stacks" },
    { tag: "p", text: "A stack is a Last-In-First-Out (LIFO) structure: the only two operations are push (add to the top) and pop (remove from the top), both O(1). Despite this extreme simplicity, stacks underlie an enormous range of algorithms — anywhere a problem has a 'most recent unmatched/unresolved thing' that needs to be remembered until it's explicitly closed off or superseded, a stack is almost always the right tool." },
    { tag: "p", text: "The single most powerful and recurring stack pattern in this section is the monotonic stack — a stack that's kept strictly increasing or strictly decreasing from bottom to top by popping elements that would violate that order before pushing a new one. It looks like a small variation on a plain stack, but it's what turns an apparently O(n²) 'compare every element to every other element' problem into O(n), because each element is pushed and popped at most once across the entire algorithm." },
    { tag: "h2", text: "Recognising when a stack helps" },
    { tag: "ul", items: [
      "The problem involves matching pairs that must close in the reverse order they opened (brackets, nested tags, function calls)",
      "You need to track 'the most recent X that hasn't been resolved yet', where resolution always happens to the most recent one first",
      "You're looking for the 'next greater/smaller element' for every position in an array — this phrase alone is a strong signal for a monotonic stack",
      "Recursive algorithms can be rewritten iteratively using an explicit stack to manage what would otherwise be call-stack state"
    ]},
    { tag: "table",
      headers: ["Pattern", "Stack Holds", "Typical Problems"],
      rows: [
        ["Bracket matching", "Unmatched opening symbols", "Valid Parentheses, HTML tag validation"],
        ["Min/Max tracking", "Running min/max alongside each element", "Min Stack, Max Stack"],
        ["Monotonic stack (next greater/smaller)", "Indices/values waiting for a 'resolving' element", "Next Greater Element, Daily Temperatures"],
        ["Monotonic stack (area/span)", "Indices bounding a candidate rectangle/span", "Largest Rectangle in Histogram, Maximal Rectangle"]
      ]
    },
    { tag: "note", variant: "tip", text: "If you find yourself wanting to write a nested loop to compare every element against every later element, stop and ask whether a monotonic stack can do it in one pass instead — the answer is yes surprisingly often." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. VALID PARENTHESES
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Valid Parentheses",
      href: "/algorithms/stacks/valid-parentheses",
      type: "Easy",

      about: [
        { tag: "h1", text: "Valid Parentheses" },
        { tag: "p", text: "Given a string containing only bracket characters — (), {}, [] — Valid Parentheses determines whether every opening bracket has a matching closing bracket of the SAME type, in the correct nested order. '({[]})' is valid; '([)]' is not, even though it has equal counts of every bracket type, because the closing order doesn't respect proper nesting." },
        { tag: "p", text: "This is the canonical 'most recent unmatched thing must be resolved first' problem, and it's the simplest possible illustration of why a stack — not just a counter — is needed: a counter alone can verify equal counts of opens and closes, but only a stack can verify the correct NESTING order, since it remembers WHICH type of bracket was most recently opened." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Validating balanced/nested syntax: code brackets, HTML/XML tags, JSON/expression structure",
          "Any 'does this sequence of opens and closes nest correctly' question — the exact same pattern, regardless of the specific symbols involved",
          "As a building block before evaluating or parsing an expression that contains nested groupings (calculator implementations, compilers)",
          "A natural warm-up problem for the more general monotonic-stack family of techniques covered elsewhere in this section"
        ]},
        { tag: "note", variant: "tip", text: "A common trick to simplify the matching logic: push the EXPECTED closing bracket (not the opening one) onto the stack when you see an opener — then a closing bracket is valid exactly when it equals stack.pop(), with no separate lookup table needed at comparison time." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Even if the string is invalid and could theoretically be rejected partway through, a single full pass examining every character is still required in general to detect most invalidity conditions correctly — though an early mismatch can trigger immediate rejection." },
          { tag: "ul", items: [
            "Each character is examined exactly once: O(n)",
            "An immediate mismatch (e.g. the very first character is a closing bracket with an empty stack) can short-circuit and reject in O(1), but this is a favourable-input case, not the general bound"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every character triggers exactly one O(1) operation — either a push (opening bracket) or a pop-and-compare (closing bracket) — regardless of the specific bracket types or nesting depth involved." },
          { tag: "ul", items: [
            "n characters × O(1) work each = O(n)",
            "No input distribution changes this fixed per-character cost"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No string configuration increases the cost beyond examining every character once — even a perfectly valid, maximally nested string (e.g. n/2 opens followed by n/2 matching closes) still requires exactly n character examinations." },
          { tag: "ul", items: [
            "Worst case matches best/average: O(n)",
            "This matches the trivial lower bound: validating a string of length n requires examining every character at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If the string consists entirely of immediately-matching pairs (e.g. '()()()'), the stack never holds more than one element at a time, since each opener is immediately resolved by its closer before the next opener arrives." },
          { tag: "ul", items: ["Stack depth stays at most 1 throughout: O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "For typical nested input, the stack can grow proportionally to the nesting depth, which in the average case is some fraction of the total string length." },
          { tag: "ul", items: ["Stack holds up to O(n) unmatched openers at its deepest point, depending on the specific nesting pattern"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "A string consisting of n/2 consecutive opening brackets followed by n/2 closing brackets (maximal nesting depth) pushes every opener onto the stack before any popping begins." },
          { tag: "ul", items: [
            "Maximum stack depth: O(n), when the entire first half of the string is openers",
            "This is the standard worst case for any bracket-matching/nesting-depth problem"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function isValid(s):
    stack ← empty stack
    pairs ← { ')': '(', ']': '[', '}': '{' }

    for char in s:
        if char in "([{":
            push(stack, char)
        else:                              // char is a closing bracket
            if stack is empty:
                return false               // nothing to match against
            top ← pop(stack)
            if top != pairs[char]:
                return false               // wrong type of opener

    return stack is empty                  // true only if every opener was matched` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Scan the string left to right, one character at a time.",
          "Whenever an opening bracket is encountered, push it onto the stack — it's now 'waiting' to be matched.",
          "Whenever a closing bracket is encountered, check if the stack is empty (meaning there's no opener to match it against — invalid) and otherwise pop the top of the stack and verify it's the corresponding opener type for this closer.",
          "If at any point a mismatch or an empty-stack-pop is encountered, the string is immediately invalid.",
          "After processing every character, the string is valid if and only if the stack is completely empty — any remaining unmatched openers mean the string is invalid (e.g. '(()')."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The stack correctly models the 'most recently opened, not-yet-closed' bracket at every point, because a valid nesting structure REQUIRES that the most recently opened bracket be the next one closed (this is exactly the definition of properly nested/balanced brackets — you cannot close an outer bracket while an inner one remains open). Checking that each closing bracket matches the top of the stack directly enforces this LIFO matching requirement. The final empty-stack check correctly catches the case of unmatched openers (which would otherwise be silently ignored if we only checked closers against pops), and the empty-stack-on-pop check correctly catches the case of an unmatched closer with nothing left to match against." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. MIN STACK
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Min Stack",
      href: "/algorithms/stacks/min-stack",
      type: "Medium",

      about: [
        { tag: "h1", text: "Min Stack" },
        { tag: "p", text: "Min Stack is a stack augmented to support retrieving the minimum element currently in the stack in O(1) time, in addition to the standard O(1) push and pop. The naive approach — scanning the whole stack to find the minimum on demand — is O(n) per query, defeating the purpose; the elegant solution tracks the running minimum incrementally as elements are pushed and popped." },
        { tag: "p", text: "The standard technique uses a second, auxiliary stack that tracks the minimum value at EVERY point in the main stack's history — so popping the main stack and popping the auxiliary stack together always keeps the auxiliary stack's top correctly reflecting the minimum of whatever remains in the main stack." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Any 'design a stack that also supports O(1) getMin()' (or getMax()) interview question — the auxiliary-stack technique is the canonical solution",
          "As a stepping stone to harder problems like 'Max Stack with O(1) popMax' or evaluating expressions where the running min/max must be tracked alongside the actual computation",
          "Sliding window minimum/maximum problems sometimes use TWO Min/Max Stacks together (one for each 'half' of the window) to achieve O(1) amortised window-min queries",
          "Real-time monitoring/logging systems tracking a running minimum (or maximum) over a stream of push/pop-style events"
        ]},
        { tag: "note", variant: "tip", text: "A space-optimised variant only pushes onto the auxiliary stack when the new value is ≤ the current minimum (rather than on every push) — this trades a slightly more complex pop condition for better average-case space usage, while keeping the same O(1) time guarantee." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Every operation — push, pop, top, and getMin — performs a fixed, constant number of stack operations regardless of how many elements are currently stored or what their values are." },
          { tag: "ul", items: [
            "push: O(1) — push onto main stack, push onto auxiliary stack",
            "pop: O(1) — pop from both stacks",
            "getMin: O(1) — simply peek the top of the auxiliary stack"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every operation performs the same fixed number of constant-time sub-operations regardless of the values pushed or the stack's current size — there's no value-dependent branching that changes the operation count." },
          { tag: "ul", items: ["All four operations (push, pop, top, getMin) remain strictly O(1), regardless of stack depth or value distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "No sequence of push/pop operations or value distribution increases any operation's cost beyond a fixed constant — this is one of the cleanest examples of a data structure with genuinely uniform O(1) behaviour across all cases." },
          { tag: "ul", items: ["All operations: O(1), identical across best, average, and worst case — there is no degenerate input for this design"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n elements in the main stack always requires O(n) space for the data itself, plus the auxiliary minimum-tracking stack adds proportional overhead." },
          { tag: "ul", items: ["Main stack: O(n)", "Auxiliary min stack (always-push variant): O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "With the space-optimised variant (only pushing to the auxiliary stack when a new minimum is found), the auxiliary stack's size depends on how often new minimums occur — for randomly ordered pushes, this is typically much smaller than n." },
          { tag: "ul", items: ["Main stack: O(n) always", "Optimised auxiliary stack: expected O(log n) for random insertion order (related to the expected number of left-to-right minima in a random permutation), though still O(n) in the worst case"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "If elements are pushed in strictly decreasing order, every single push sets a new minimum, so even the optimised auxiliary stack grows to match the main stack's full size." },
          { tag: "ul", items: [
            "Main stack: O(n)",
            "Auxiliary stack (worst case, strictly decreasing pushes): O(n) — every push is a new minimum",
            "Total: O(n), the standard bound regardless of which auxiliary-stack variant is used"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`class MinStack:
    mainStack ← empty stack
    minStack  ← empty stack

    function push(value):
        push(mainStack, value)
        if minStack is empty or value <= top(minStack):
            push(minStack, value)
        else:
            push(minStack, top(minStack))   // duplicate current min

    function pop():
        pop(mainStack)
        pop(minStack)

    function top():
        return top(mainStack)

    function getMin():
        return top(minStack)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain two stacks in perfect lockstep: mainStack holds the actual data, and minStack holds, at every position, what the minimum of the main stack was AT THE TIME that position's element was pushed.",
          "On push: always push the new value onto mainStack. For minStack, push the new value if it's a new minimum (≤ the current top of minStack), otherwise push a DUPLICATE of the current minimum — this keeps both stacks exactly the same height at all times.",
          "On pop: pop from both stacks simultaneously — since they're always the same height, this correctly 'rewinds' the minimum tracking back to whatever it was before the popped element was pushed.",
          "getMin simply peeks the top of minStack, which by construction always holds the current minimum of everything still in mainStack."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at every point, minStack.top() equals the minimum value among all elements currently in mainStack. This holds by induction on the sequence of operations: initially (both stacks empty) it holds vacuously. On push, the new minStack top is set to min(new value, previous minStack top) — exactly the new overall minimum after adding the new value. On pop, since both stacks are popped together, minStack's new top correctly reverts to whatever the minimum was immediately before the just-removed element was pushed — which is, by the same invariant applied one step earlier, exactly the correct minimum of the now-smaller mainStack." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. NEXT GREATER ELEMENT
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Next Greater Element",
      href: "/algorithms/stacks/next-greater",
      type: "Medium",

      about: [
        { tag: "h1", text: "Next Greater Element" },
        { tag: "p", text: "For every element in an array, the Next Greater Element problem asks: what is the first element to its right that is strictly greater than it (or -1/none if no such element exists)? The naive brute-force approach checks every later element for every position, costing O(n²) — a monotonic stack solves it in a single O(n) pass." },
        { tag: "p", text: "The key insight: process elements left to right, maintaining a stack of indices whose 'next greater element' hasn't been found yet. When a new element arrives that's larger than the stack's top, it IS the next-greater-element for every index it pops off the stack — because those popped elements were all waiting for exactly this: the first larger value to their right." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Any 'for each element, find the next/previous greater/smaller element' phrasing — this is the single strongest pattern-recognition signal for a monotonic stack",
          "Daily Temperatures (find how many days until a warmer temperature) is the exact same algorithm with indices instead of values",
          "Stock span problems (how many consecutive previous days had a price ≤ today's) use the mirror-image pattern (previous smaller/greater, scanning left to right but looking backward)",
          "As the conceptual foundation before Largest Rectangle in Histogram, which is itself built from two Next-Greater/Smaller-style passes"
        ]},
        { tag: "note", variant: "tip", text: "The monotonic stack here is decreasing from bottom to top — it only ever holds elements for which a 'next greater' hasn't been found yet, and the moment a bigger element shows up, it resolves (pops) every smaller element still waiting." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every element must be pushed onto the stack at least once to be considered — there's no shortcut even for the most favourable arrangement, since the algorithm must still confirm each element's next-greater status." },
          { tag: "ul", items: [
            "n elements, each pushed exactly once: O(n)",
            "Best case still requires the full single pass to correctly resolve every element"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "This is the key amortised-analysis argument: although there's a nested-looking while-loop inside the main for-loop (popping elements off the stack), every single element is pushed exactly once and popped at most once across the ENTIRE algorithm, regardless of how the pops are distributed across iterations." },
          { tag: "ul", items: [
            "Total pushes across the whole algorithm: exactly n (one per element)",
            "Total pops across the whole algorithm: at most n (an element can't be popped more than once, since once popped it's never pushed again)",
            "Combined: O(n) + O(n) = O(n), not O(n²) — despite the inner while-loop's appearance"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even in the input that causes the MOST popping in a single iteration (e.g. a strictly decreasing sequence followed by one large value, which pops everything at once), the total work across the whole algorithm is still bounded by the same amortised argument." },
          { tag: "ul", items: [
            "A single iteration CAN pop up to O(n) elements (e.g. processing the large final element in a mostly-decreasing array), but this is still accounted for within the total budget of n pushes and n pops across the whole run",
            "Worst case: O(n), identical to best/average — this is the defining characteristic of amortised analysis for monotonic stacks"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If the array is in strictly DECREASING order, every new element immediately becomes the new stack top without ever popping anything, but the stack itself still grows to hold all n elements by the end (with no next-greater found for any of them)." },
          { tag: "ul", items: ["This scenario actually maximises stack size, not minimises it — true best-case space (minimal stack depth) occurs for a strictly INCREASING array, where every new element immediately resolves and pops the previous one, keeping the stack at depth 1: O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "The output array (storing the next-greater result for every position) always requires O(n) space regardless of input order, and the stack itself can grow up to O(n) depending on the specific arrangement." },
          { tag: "ul", items: ["Output array: O(n), always required", "Stack: up to O(n), depending on how many elements remain unresolved at any point during the scan"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "A strictly decreasing array (before any final large value, if any) causes every element to be pushed without being popped, growing the stack to its maximum possible size." },
          { tag: "ul", items: [
            "Stack: up to O(n) in the worst case (e.g. an entirely strictly-decreasing array, where nothing ever gets resolved)",
            "Output array: O(n)",
            "Total: O(n)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function nextGreaterElement(arr):
    n ← length(arr)
    result ← array of size n, filled with −1
    stack ← empty stack            // stores INDICES, not values

    for i from 0 to n − 1:
        while stack is not empty and arr[stack.top()] < arr[i]:
            j ← pop(stack)
            result[j] ← arr[i]     // arr[i] is the next greater element for index j

        push(stack, i)

    return result                  // any index left on the stack has no next greater element` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a stack of INDICES (not values), representing elements that are still 'waiting' for their next-greater-element to appear.",
          "For each new element arr[i], check if it's larger than the value at the index currently on top of the stack.",
          "While that's true, pop the stack — the just-popped index has found its answer: arr[i] is its next greater element. Record this in the result array.",
          "Continue popping while the new element keeps beating the (new) stack top, since one large element can resolve many smaller waiting elements at once.",
          "Once the stack top is no longer smaller than arr[i] (or the stack is empty), push i onto the stack — it's now waiting for ITS next greater element.",
          "After processing all elements, any index still left on the stack never found a next greater element, correctly leaving its result entry as -1 (the initialised default)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Stack invariant: at every point, the indices on the stack form a sequence with strictly decreasing values from bottom to top — every element on the stack is genuinely still waiting, because if a larger element had already appeared to its right, it would have been popped and resolved already. When processing arr[i], any index j popped off the stack is correctly resolved because arr[i] is, by construction, the FIRST element to j's right that exceeds arr[j] — every index between j and i (if any) was either already popped before j (meaning it was smaller than something even closer to j, contradicting being 'between' — actually meaning those were already resolved and removed) or simply never violated the monotonic decreasing order, meaning none of them exceeded arr[j] either. This guarantees the very first popping element encountered while scanning left-to-right is indeed the correct, FIRST next-greater element." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. MONOTONIC STACK
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Monotonic Stack",
      href: "/algorithms/stacks/monotonic",
      type: "Medium",

      about: [
        { tag: "h1", text: "Monotonic Stack" },
        { tag: "p", text: "A monotonic stack is a stack maintained so that its elements are always in strictly increasing OR strictly decreasing order from bottom to top — enforced by popping any elements that would violate that order before pushing a new one. It's less a single named algorithm and more a general TECHNIQUE that underlies Next Greater Element, Largest Rectangle in Histogram, Trapping Rain Water, and a wide family of 'find the nearest element satisfying some ordering condition' problems." },
        { tag: "p", text: "Its power comes from a simple amortised-analysis fact: even though popping looks like it could create nested-loop O(n²) behaviour, every single element is pushed exactly once and popped AT MOST once across the algorithm's entire run, no matter how the pops are distributed — guaranteeing O(n) total work regardless of how 'busy' any individual iteration's popping looks." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Any 'next/previous greater/smaller element' problem — the signature use case",
          "Computing, for every position, the boundaries of the largest rectangle/range that position can 'see' in both directions (histogram, trapping rain water)",
          "Removing elements to form the smallest/largest possible result under an ordering constraint (e.g. 'remove k digits to form the smallest number')",
          "Sliding window maximum/minimum problems, which use a monotonic DEQUE (a close cousin — see the Queues section) rather than a plain monotonic stack"
        ]},
        { tag: "table",
          headers: ["Stack Direction", "What It Finds", "Pop Condition"],
          rows: [
            ["Decreasing (top is smallest)", "Next GREATER element to the right", "Pop while new element > stack top's value"],
            ["Increasing (top is largest)", "Next SMALLER element to the right", "Pop while new element < stack top's value"]
          ]
        },
        { tag: "note", variant: "tip", text: "The single recurring template across every monotonic stack problem: for each new element, pop everything from the stack that the new element 'invalidates' or 'resolves', processing each popped element exactly once, then push the new element." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every element must be pushed onto the stack at least once, regardless of how favourable the input arrangement is — there's no structural shortcut to avoid visiting every element." },
          { tag: "ul", items: ["n elements, each pushed exactly once: O(n)", "This holds even for the input arrangement that minimises total popping work"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "This is the amortised-analysis argument that defines the entire technique: regardless of how pops are distributed across iterations (some iterations might pop many elements, others might pop none), the TOTAL number of pops across the whole algorithm can never exceed the total number of pushes, which is exactly n." },
          { tag: "ul", items: [
            "Total pushes across the whole run: exactly n",
            "Total pops across the whole run: at most n (each element, once popped, is gone forever and never pushed again)",
            "Sum of all per-iteration work: O(n) + O(n) = O(n), regardless of the specific pop distribution pattern"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even the input arrangement that concentrates the MOST popping into a single iteration (e.g. a long monotonic run suddenly broken by one extreme value, popping everything at once) doesn't break the O(n) bound, since the amortised argument accounts for ALL pops across the entire run, not per-iteration." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(n)",
            "This O(n) bound is what makes monotonic stack techniques dramatically faster than the O(n²) brute-force 'compare every pair' approach they typically replace"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If every new element immediately resolves and pops the previous stack top (e.g. a strictly monotonic input matching the 'opposite' direction of what's being tracked), the stack never grows beyond depth 1." },
          { tag: "ul", items: ["Stack depth stays at most 1 throughout: O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "For typical input, the stack holds a varying number of 'still waiting to be resolved' elements at any given point, which can range up to O(n) depending on the specific value arrangement." },
          { tag: "ul", items: ["Stack: up to O(n) at its deepest point, depending on input distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "If the input is already monotonic in the 'wrong' direction (never triggering any pops, e.g. strictly decreasing input when looking for next-greater), every element remains on the stack simultaneously by the end." },
          { tag: "ul", items: [
            "Stack: up to O(n), when no element ever gets resolved/popped before the scan completes",
            "Plus an O(n) output/result array in most applications of this technique"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Generic template — finding, for each index, the nearest index to its left with a SMALLER value (a 'previous smaller element' monotonic increasing stack):" },
        { tag: "code", language: "text", text:
`function previousSmallerElement(arr):
    n ← length(arr)
    result ← array of size n, filled with −1
    stack ← empty stack                  // increasing stack of indices

    for i from 0 to n − 1:
        while stack is not empty and arr[stack.top()] >= arr[i]:
            pop(stack)                   // these can never be a "previous smaller" for anything later either

        if stack is not empty:
            result[i] ← arr[stack.top()]

        push(stack, i)

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a stack of indices kept in strictly increasing order of VALUE from bottom to top — the stack only ever holds 'candidates' that could still be a valid previous-smaller-element answer for some future index.",
          "Before processing index i, pop off every stack index whose value is ≥ arr[i] — those values can never be the 'previous smaller element' for index i (since arr[i] itself is smaller or equal), and crucially, they can never be the answer for ANY future index either, since arr[i] is now strictly closer and at least as small.",
          "Once the stack is correctly 'cleaned' (everything remaining is genuinely smaller than arr[i]), whatever remains on top — if anything — is exactly the nearest smaller element to i's left.",
          "Record that answer (or leave -1 if the stack is empty, meaning no smaller element exists to the left), then push i onto the stack as a new candidate for future indices."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The crucial correctness argument is WHY popped elements can be safely discarded forever, not just for the current index: if arr[stack.top()] ≥ arr[i], then for any future index k > i, arr[i] is BOTH closer to k than the popped element AND at least as small — so the popped element could never be the correct (nearest) answer for k either, since arr[i] would always be preferred. This means discarding it permanently loses no correctness. After this cleanup, the stack's new top (if it exists) is, by the maintained increasing-stack invariant, guaranteed to be both smaller than arr[i] and the closest such index to i's left among all currently-valid candidates — exactly the definition of the previous smaller element." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. LARGEST RECTANGLE IN HISTOGRAM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Largest Rectangle in Histogram",
      href: "/algorithms/stacks/histogram",
      type: "Hard",

      about: [
        { tag: "h1", text: "Largest Rectangle in Histogram" },
        { tag: "p", text: "Given an array representing the heights of adjacent bars in a histogram (each bar has width 1), this problem asks for the area of the largest rectangle that can be formed using one or more contiguous bars. The rectangle's height is constrained by the SHORTEST bar within its chosen contiguous range, since a rectangle can't extend above any bar shorter than itself within its span." },
        { tag: "p", text: "The brute-force approach checks every possible contiguous range and finds its limiting (minimum) height, costing O(n²) or worse. The monotonic stack solution achieves O(n) by recognising that for every bar, the maximum rectangle USING THAT BAR AS THE LIMITING HEIGHT is fully determined by how far it can extend left and right before hitting a SHORTER bar — exactly a 'previous smaller element' and 'next smaller element' query for every position." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal histogram-area problem, and its 2D extension 'Maximal Rectangle' (find the largest all-1s rectangle in a binary matrix, solved by treating each row as a histogram and reusing this exact algorithm)",
          "Any 'find the largest contiguous region constrained by a minimum/limiting value' problem — the height-limited-by-shortest-bar pattern generalises surprisingly widely",
          "Trapping Rain Water is a closely related problem (also solvable with a monotonic stack, though the recurrence differs since it's bounded on both sides simultaneously rather than seeking a single limiting minimum)",
          "Demonstrates the deepest practical use of the monotonic stack technique in this section — a genuinely 'Hard'-rated synthesis of the simpler next-greater/smaller patterns"
        ]},
        { tag: "note", variant: "tip", text: "A common trick to avoid special-casing leftover bars still on the stack at the end: append a sentinel bar of height 0 to the end of the input — this guarantees every remaining bar on the stack gets popped and processed during the final iterations, with no separate cleanup loop needed." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every bar must be pushed onto the stack at least once to be considered as a potential limiting height for some rectangle — there's no shortcut even for the most favourable height arrangement." },
          { tag: "ul", items: ["n bars, each pushed exactly once: O(n)", "Best case still requires the full single pass to correctly compute every bar's maximal rectangle"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Identical amortised argument to the general monotonic stack pattern: every bar is pushed exactly once and popped at most once across the entire algorithm, regardless of how pops are distributed across iterations." },
          { tag: "ul", items: [
            "Total pushes: exactly n",
            "Total pops: at most n",
            "Combined: O(n), despite the inner while-loop's nested-looking structure"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even the input arrangement causing the most popping in a single iteration (e.g. a strictly increasing sequence of heights followed by a single very short bar, popping everything at once) doesn't break the amortised O(n) bound." },
          { tag: "ul", items: [
            "Worst case matches best/average: O(n)",
            "This is a dramatic improvement over the O(n²) (or O(n³) for the most naive version) brute-force approach of checking every possible contiguous range directly"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If heights are strictly decreasing, every new bar immediately triggers processing of the previous bar (since it's now shorter than what came before), keeping the stack from growing significantly." },
          { tag: "ul", items: ["For strictly decreasing input, the stack stays shallow throughout: close to O(1) at any given moment, though area calculations still happen on every pop"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "For typical height arrangements, the stack holds a varying number of 'still relevant' bar indices at any point, which can range up to O(n) depending on the specific height pattern." },
          { tag: "ul", items: ["Stack: up to O(n) at its deepest point, depending on the heights array's structure"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "If heights are strictly increasing (a 'staircase' shape), every bar remains on the stack simultaneously until the very end, since no shorter bar ever appears to trigger popping." },
          { tag: "ul", items: [
            "Stack: up to O(n), when heights are in strictly increasing order (e.g. [1, 2, 3, 4, 5]), since nothing gets popped until the scan ends",
            "This is the same structural worst case as the general monotonic stack pattern"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function largestRectangleArea(heights):
    stack ← empty stack             // increasing stack of indices
    maxArea ← 0
    heights ← heights + [0]         // sentinel: forces final cleanup

    for i from 0 to length(heights) − 1:
        while stack is not empty and heights[stack.top()] > heights[i]:
            height ← heights[pop(stack)]
            // width = distance between the new stack top (exclusive)
            // and current index i (exclusive)
            width ← i if stack is empty else i − stack.top() − 1
            maxArea ← max(maxArea, height * width)

        push(stack, i)

    return maxArea` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a stack of indices with strictly increasing heights from bottom to top — every index on the stack represents a bar that COULD still be the limiting (shortest) height for some not-yet-determined rectangle extending further right.",
          "When a new, shorter bar at index i is encountered, it means every taller bar currently on the stack can no longer extend any further right — their rectangle's right boundary is now fixed at i.",
          "Pop each such taller bar and compute the area of the rectangle where IT is the limiting height: the height is the popped bar's own height, and the width spans from just after the new stack top (its left boundary — the nearest shorter bar to its left) to just before i (its right boundary — the nearest shorter bar to its right, which is i itself).",
          "Update the running maximum area with each computed rectangle.",
          "After processing all (real) bars, append a sentinel height-0 bar to force every remaining bar on the stack to be popped and processed, since a height-0 bar is guaranteed shorter than anything still waiting."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "For each bar, the largest rectangle using that bar as the limiting (minimum) height extends exactly as far left as the nearest strictly-shorter bar to its left, and exactly as far right as the nearest strictly-shorter bar to its right — any further in either direction would include a shorter bar, which would make THAT bar (not the original) the true limiting height instead. The monotonic stack correctly identifies both boundaries simultaneously: when a bar is popped because a new shorter bar i arrived, i is by construction its nearest-strictly-shorter-bar-to-the-right (the first one encountered while scanning rightward), and the new stack top after popping is, by the maintained increasing-stack invariant, its nearest-strictly-shorter-bar-to-the-left. Since every bar is eventually popped exactly once (guaranteed by the height-0 sentinel) and its true maximal rectangle is computed at exactly that moment, the algorithm is guaranteed to consider the optimal rectangle for every possible limiting bar, and therefore finds the true global maximum." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const QUEUES_SECTION = {
  name: "Queues",
  href: "/algorithms/queues",
  desc: "Deque, sliding window max, BFS patterns",
  complexity: "O(n)",
  count: 4,

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
      ]
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
      ]
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
      ]
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
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const HASH_MAPS_SECTION = {
  name: "Hash Maps",
  href: "/algorithms/hash_maps",
  desc: "Frequency count, anagram, LRU cache",
  complexity: "O(1) avg",
  count: 5,

  about: [
    { tag: "h1", text: "Hash Maps" },
    { tag: "p", text: "A hash map stores key-value pairs and uses a hash function to convert each key into an array index, giving average-case O(1) insertion, lookup, and deletion — a dramatic improvement over a linear scan's O(n) or a balanced tree's O(log n), at the cost of losing any ordering guarantee on the keys." },
    { tag: "p", text: "The mechanics rest on two ideas: the hash function maps an arbitrary key to a fixed-size integer (the bucket index), and collision handling deals with the inevitable case where two different keys hash to the same bucket (most commonly via chaining — each bucket holds a small list of entries — or open addressing — probing for the next free slot). As long as the hash function distributes keys roughly uniformly and the load factor (entries ÷ buckets) is kept reasonable via resizing, the expected chain length per bucket stays O(1), which is the entire source of hash maps' average-case speed." },
    { tag: "h2", text: "Why 'average case', not 'worst case'" },
    { tag: "p", text: "Every operation in this section lists O(1) as the AVERAGE case, never the worst case. This isn't a minor caveat — it's structural: any fixed hash function can theoretically be defeated by an adversarially chosen set of keys that all collide into the same bucket, degrading that bucket's lookup to O(n) (or O(log n) if the bucket uses a balanced tree internally, as Java's HashMap does since Java 8). In practice, with a well-designed hash function and a non-adversarial key distribution, O(1) average case is what's reliably observed." },
    { tag: "table",
      headers: ["Concept", "Role"],
      rows: [
        ["Hash function", "Maps an arbitrary key to a bucket index — quality determines collision rate"],
        ["Load factor", "entries ÷ buckets — kept below a threshold (commonly ~0.75) by resizing, to bound expected chain length"],
        ["Chaining", "Each bucket holds a list (or tree) of entries that hashed to it — the most common collision-resolution strategy"],
        ["Open addressing", "On collision, probe for the next free slot within the array itself — no extra per-bucket structure needed"]
      ]
    },
    { tag: "note", variant: "tip", text: "Hash maps are the single most common 'turn an O(n²) brute force into O(n)' tool in all of algorithm design — anywhere you're checking 'have I seen this value before' or 'how many times does this appear' inside a loop, a hash map almost certainly eliminates an inner O(n) scan." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. LONGEST CONSECUTIVE SEQUENCE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Consecutive Sequence",
      href: "/algorithms/hash_maps/longest-consecutive",
      type: "Medium",

      about: [
        { tag: "h1", text: "Longest Consecutive Sequence" },
        { tag: "p", text: "Given an unsorted array of integers, this problem asks for the length of the longest run of consecutive integers present in the array (not necessarily contiguous in the array itself — just consecutive as INTEGER VALUES, e.g. [100, 4, 200, 1, 3, 2] contains the consecutive run 1,2,3,4, of length 4). The obvious approach — sort first, then scan for runs — costs O(n log n); a hash-set-based approach achieves O(n)." },
        { tag: "p", text: "The key trick avoiding O(n log n) sorting: put every number into a hash set for O(1) existence checks, then for each number, only START counting a run from it if num−1 is NOT in the set — meaning this number is genuinely the start of its run. This guarantees each run is counted exactly once, from its true beginning, rather than being recounted from every one of its members." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding the longest run of consecutive integer VALUES in an unsorted collection, without needing the O(n log n) cost of actually sorting first",
          "Any problem reducible to 'does a chain of consecutive keys exist, and how long is it' — generalises beyond integers to any totally-ordered, hashable key type with a well-defined 'successor' notion",
          "A clean illustration of how a hash set's O(1) membership check can replace sorting entirely when the only thing that matters is consecutive-value runs, not full ordering",
          "As a building block for interval-merging-style problems where checking 'is the next value already accounted for' needs to be fast"
        ]},
        { tag: "note", variant: "tip", text: "The 'only start counting from num−1 not in set' check is what keeps this O(n) instead of O(n²) — without it, every single number would redundantly re-walk its entire run from scratch, even ones in the middle." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Building the hash set from the input array always requires visiting every element once, regardless of how favourably the values happen to be arranged — there's no shortcut even for the most consecutive-heavy input." },
          { tag: "ul", items: [
            "Inserting n elements into the hash set: O(n) average",
            "Even if the entire array forms one giant consecutive run, every element still needs to be inserted and checked once: O(n)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Although the inner while-loop (walking forward through a run once a start is found) looks like it could create nested-loop behaviour, the 'only start from true run-starts' check ensures every number is visited by the inner loop AT MOST ONCE across the entire algorithm — an amortised argument identical in spirit to the monotonic stack pattern." },
          { tag: "ul", items: [
            "Outer loop: n iterations, one per array element, each doing an O(1) average hash-set lookup to check if it's a run-start",
            "Inner while-loop (only entered for true run-starts): across the WHOLE algorithm, the total number of inner-loop steps equals exactly n, since every number belongs to exactly one run and is visited by the inner loop exactly once when that run is processed",
            "Combined: O(n) + O(n) = O(n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No value arrangement breaks the amortised bound — even an input forming one single run of length n (forcing the inner while-loop to walk all n elements in one shot) still totals exactly n inner-loop steps across the whole algorithm, matching the amortised argument exactly." },
          { tag: "ul", items: [
            "Worst case matches best/average: O(n)",
            "This is a genuine improvement over the O(n log n) sort-based approach, achievable only because hash set membership checks replace the need for sorted adjacency"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The hash set must store every distinct value from the input array, requiring space proportional to the number of distinct elements regardless of how they're arranged." },
          { tag: "ul", items: ["Hash set: up to n entries — O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the number of distinct input values alone, since every value must be inserted into the set regardless of how many consecutive runs they form." },
          { tag: "ul", items: ["Same O(n) bound regardless of how the values cluster into runs"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input configuration increases space beyond storing all distinct values in the hash set — this is both the floor and ceiling for the algorithm's memory footprint." },
          { tag: "ul", items: ["O(n) total, identical across all cases — this is the unavoidable cost of trading O(n log n) sort time for O(n) hash-set-based time"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function longestConsecutive(nums):
    numSet ← hash set built from nums
    longest ← 0

    for num in numSet:
        if (num − 1) not in numSet:        // true start of a run
            length ← 1
            current ← num
            while (current + 1) in numSet:
                current ← current + 1
                length ← length + 1
            longest ← max(longest, length)

    return longest` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Insert every number from the input into a hash set, giving O(1) average-case membership checks for any value.",
          "For each number in the set, check whether num − 1 is also in the set. If it IS, this number is somewhere in the MIDDLE or end of a run, not the start — skip it, since it will be correctly counted when processing its run's true starting number.",
          "If num − 1 is NOT in the set, this number is genuinely the start of a consecutive run — begin counting forward: check if num + 1 is in the set, then num + 2, and so on, incrementing the length counter each time.",
          "Once the run breaks (the next consecutive value isn't in the set), record the run's length if it's the longest seen so far.",
          "After checking every number in the set this way, the longest recorded run length is the answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The 'num − 1 not in set' check guarantees that the inner while-loop is entered exactly once per distinct consecutive run in the input, always starting from that run's true minimum value — this is what prevents the same run from being redundantly re-walked from every one of its members. Since every number belongs to exactly one maximal consecutive run, and that run is counted in full exactly once (when its start is processed), the algorithm correctly computes every run's true length and the maximum among them is correctly the longest consecutive sequence present in the input." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. DESIGN HASHMAP
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Design Hashmap",
      href: "/algorithms/hash_maps/design",
      type: "Medium",

      about: [
        { tag: "h1", text: "Design Hashmap" },
        { tag: "p", text: "Designing a hash map from scratch means implementing put, get, and remove without relying on a language's built-in hash map — forcing an explicit decision about the hash function, the underlying bucket array, and the collision-resolution strategy. The standard approach is SEPARATE CHAINING: an array of buckets, where each bucket holds a list of (key, value) pairs that all happen to hash to that same index." },
        { tag: "p", text: "The hash function's job is converting an arbitrary key into a bucket index, typically via key.hashCode() mod numBuckets (or some bit-mixing variant to better distribute the bits of poor-quality hash codes). Resizing — growing the bucket array and re-distributing all existing entries — is what keeps the average chain length bounded as the map grows, which is the entire mechanism behind the structure's O(1) average-case guarantee." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Implementing the hash map ADT from primitives, typically as an interview question testing understanding of hashing, collision resolution, and amortised resizing",
          "Understanding exactly how/why a hash map achieves O(1) average case — essential background before reasoning about hash map performance in any other algorithm in this whole reference",
          "Building a custom hash map variant with non-standard requirements a language's built-in map doesn't support (e.g. a specific eviction policy, as in LRU/LFU Cache Design)",
          "Embedded or resource-constrained environments where a language's standard hash map has more overhead than a minimal custom implementation needs"
        ]},
        { tag: "note", variant: "tip", text: "The resizing trigger (commonly: resize when load factor exceeds ~0.75) is what bounds expected chain length to O(1) as the map grows — without resizing, a fixed-size bucket array would degrade to O(n) average lookup once enough entries accumulate, no matter how good the hash function is." }
      ],

      timeComplexityCalculation: {
        notation: "O(1) avg",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If a key's bucket has zero collisions (it's the only entry hashed to that index), get/put/remove all complete in a single O(1) bucket-array access plus a trivial 0-or-1-element chain scan." },
          { tag: "ul", items: [
            "Hash computation: O(1) (assuming O(1) key hashing, typical for fixed-size keys like integers or short strings)",
            "Bucket array access: O(1)",
            "Empty or single-element chain scan: O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "With a well-distributed hash function and load factor kept bounded via resizing, the EXPECTED chain length per bucket is O(1) regardless of how many total entries are stored, since the bucket count grows proportionally with entry count." },
          { tag: "ul", items: [
            "Hash computation + bucket access: O(1)",
            "Expected chain length: O(1), assuming uniform hash distribution and load factor maintained below a fixed threshold via periodic resizing",
            "Resizing itself costs O(n) when triggered, but happens only O(log n) times total across n insertions, giving amortised O(1) per insertion overall — directly analogous to dynamic array doubling"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "If every key happens to hash to the SAME bucket (either due to a poor hash function or an adversarially constructed key set designed to defeat a known hash function), that single bucket's chain degrades to a plain linked list of length n, and every operation touching it becomes O(n)." },
          { tag: "ul", items: [
            "Pathological all-collision case: O(n) per operation, since the entire chain must be scanned linearly",
            "Some production hash maps (e.g. Java's HashMap since Java 8) mitigate this by converting sufficiently long chains into a balanced tree, capping the worst case at O(log n) instead of O(n) — a deliberate engineering response to exactly this adversarial scenario"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "Storing n key-value pairs always requires O(n) space for the entries themselves, plus the bucket array, which is typically sized proportionally to n to maintain a bounded load factor." },
          { tag: "ul", items: ["n entries: O(n)", "Bucket array: O(n) (sized to keep load factor bounded)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Total space is fixed by the number of stored entries and the bucket array size, both of which scale linearly with n regardless of how entries distribute across buckets." },
          { tag: "ul", items: ["Same O(n) bound regardless of hash distribution quality"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "Even in the pathological all-same-bucket collision case, total space usage doesn't change — it's still exactly n entries stored somewhere, just all within a single chain instead of distributed across many." },
          { tag: "ul", items: ["O(n) total, identical regardless of collision pattern — the worst case affects TIME complexity dramatically, but not space complexity"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Separate chaining with array-of-lists buckets:" },
        { tag: "code", language: "text", text:
`class HashMap:
    buckets ← array of empty lists, size = INITIAL_CAPACITY
    count   ← 0

    function hash(key):
        return key.hashCode() mod length(buckets)

    function put(key, value):
        idx ← hash(key)
        for pair in buckets[idx]:
            if pair.key == key:
                pair.value ← value          // update existing
                return
        buckets[idx].append((key, value))   // insert new
        count ← count + 1
        if count / length(buckets) > LOAD_FACTOR_THRESHOLD:
            resize()

    function get(key):
        idx ← hash(key)
        for pair in buckets[idx]:
            if pair.key == key:
                return pair.value
        return NOT_FOUND

    function remove(key):
        idx ← hash(key)
        for i, pair in enumerate(buckets[idx]):
            if pair.key == key:
                remove buckets[idx][i]
                count ← count − 1
                return

    function resize():
        oldBuckets ← buckets
        buckets ← array of empty lists, size = length(oldBuckets) * 2
        for bucket in oldBuckets:
            for (key, value) in bucket:
                put(key, value)             // re-hash into the new, larger array` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "The hash function converts a key into a bucket index by computing its hash code and taking it modulo the current bucket array size.",
          "put: compute the target bucket, then scan that bucket's chain for an existing entry with the same key (to update in place) — if none is found, append a new entry. If this insertion pushes the load factor (count ÷ bucket count) above a threshold, trigger a resize.",
          "get: compute the target bucket and linearly scan its chain for a matching key, returning its value if found.",
          "remove: compute the target bucket, scan for the matching key, and remove that entry from the chain if found.",
          "resize: allocate a new, larger bucket array (typically double the size) and re-insert every existing entry by re-computing its hash against the new array size — necessary because the modulo result depends on the bucket count, so every entry's correct bucket changes when that count changes."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness of lookup follows directly from the hash function being deterministic: any key always maps to the same bucket index given the same bucket array size, so a key inserted into bucket idx will always be found by computing that same idx during a later get or remove call (as long as no resize has happened in between, after which a re-hash correctly relocates it to its new appropriate bucket). The chain-scanning within each bucket correctly handles collisions by checking key equality explicitly, not just hash equality, since multiple distinct keys can legitimately hash to the same bucket index. The O(1) average-case guarantee follows from the load-factor-triggered resizing keeping the ratio of entries to buckets bounded by a constant, which keeps the expected chain length — and therefore the expected scan cost — bounded by a constant as well." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. TWO SUM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Two Sum",
      href: "/algorithms/hash_maps/two-sum",
      type: "Easy",

      about: [
        { tag: "h1", text: "Two Sum" },
        { tag: "p", text: "Given an array of integers and a target value, Two Sum asks for the indices of the two numbers that add up to the target. It's one of the most famous interview questions precisely because of the gap between the obvious O(n²) brute-force solution (check every pair) and the elegant O(n) hash-map solution — a single-pass technique that should be immediately recognisable as the 'textbook' use case for a hash map's O(1) average lookup." },
        { tag: "p", text: "The key insight: instead of searching for BOTH numbers of a pair, process the array once, and for each number, check whether its COMPLEMENT (target − current number) has ALREADY been seen. If it has, the pair is found immediately; if not, record the current number (and its index) for future lookups by later elements." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal Two Sum problem — finding a pair summing to a target in unsorted data, without the O(n log n) sort-then-two-pointer alternative (which works but doesn't preserve original indices without extra bookkeeping)",
          "As the foundational template for an entire family of 'k-sum' problems (3Sum, 4Sum often reduce to repeated Two Sum sub-calls after fixing one or more values)",
          "Any 'does there exist a pair (or complement) satisfying X' question over an unsorted, unindexed collection — the hash-map-while-scanning pattern generalises directly",
          "A canonical illustration of trading O(n) space for an O(n²) → O(n) time improvement, the most common trade-off pattern in all of hash-map-based algorithm design"
        ]},
        { tag: "note", variant: "tip", text: "If the array is ALREADY sorted (or sorting it doesn't lose needed information, like original indices), the Two Pointers technique solves this in O(n) time and O(1) space instead — strictly better space, but it requires sorted input or destroys index information, which is exactly why the hash-map approach is preferred when original indices must be returned from unsorted input." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If the very first two elements happen to sum to the target, the algorithm can terminate after just two iterations — though this is a property of the specific input, not a structural guarantee." },
          { tag: "ul", items: ["If arr[0] and arr[1] sum to target: found after processing 2 elements — O(1)", "This is a favourable-input case, not the general bound"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "A single pass through the array is performed, with each element triggering one O(1) average-case hash map lookup (checking for its complement) and one O(1) average-case hash map insertion (recording itself for future lookups)." },
          { tag: "ul", items: [
            "n elements, each with O(1) average hash map lookup + O(1) average insertion: O(n) total",
            "No input distribution changes this fixed per-element work, beyond possibly terminating early if a match is found sooner"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "If no pair sums to the target until the very last element (or no valid pair exists at all), the algorithm must process every element before concluding." },
          { tag: "ul", items: [
            "Worst case: full scan of all n elements, each with O(1) average hash operations: O(n)",
            "This is a decisive improvement over the O(n²) brute-force nested-loop approach"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If the answer is found immediately (e.g. the first two elements form the pair), the hash map holds only one entry at the moment of success." },
          { tag: "ul", items: ["Hash map: as few as 1 entry if the match is found almost immediately — O(1) in this specific scenario"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "The hash map can grow to hold up to n entries (every element processed so far, in the case where the matching pair isn't found until late in the scan)." },
          { tag: "ul", items: ["Hash map: up to O(n) entries in the typical case"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "If no valid pair exists at all, every single element gets inserted into the hash map before the scan concludes with no match found." },
          { tag: "ul", items: ["Hash map: O(n), holding every element when no match is ever found"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function twoSum(nums, target):
    seen ← empty hash map        // value → index

    for i from 0 to length(nums) − 1:
        complement ← target − nums[i]
        if complement in seen:
            return [seen[complement], i]
        seen[nums[i]] ← i

    return NO_SOLUTION` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a hash map from VALUE to its index, built up incrementally as the array is scanned.",
          "For each new element, compute its complement — the value that, added to the current element, would equal the target.",
          "Check if that complement has already been seen (i.e. it's already a key in the hash map, meaning it appeared at some EARLIER index). If so, the pair is found: return the earlier index (from the map) and the current index.",
          "If the complement hasn't been seen yet, record the current element's value and index in the hash map, so that a LATER element can find it as ITS complement.",
          "If the scan completes with no match found, no valid pair exists in the array."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "If a valid pair (i, j) with i < j exists such that nums[i] + nums[j] == target, then by the time the scan reaches index j, nums[i] has ALREADY been inserted into the hash map (since i < j and insertion happens immediately after each element is processed). At index j, the complement check (target − nums[j] == nums[i]) will correctly succeed, finding the pair. Because the algorithm checks for the complement BEFORE inserting the current element, a single element is never paired with itself (e.g. nums[i] == target/2 wouldn't incorrectly match against its own just-inserted entry), correctly handling that edge case as a natural consequence of the check-then-insert ordering." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. GROUP ANAGRAMS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Group Anagrams",
      href: "/algorithms/hash_maps/group-anagrams",
      type: "Medium",

      about: [
        { tag: "h1", text: "Group Anagrams" },
        { tag: "p", text: "Given an array of strings, Group Anagrams groups together every string that is an anagram of every other string in its group (i.e. they contain exactly the same characters, just rearranged — 'eat', 'tea', and 'ate' are all anagrams of each other). The key technique is finding a CANONICAL FORM for each string such that two strings are anagrams of each other if and only if they share the same canonical form — then a hash map from canonical form to a list of original strings groups everything in a single pass." },
        { tag: "p", text: "The most common canonical form is the SORTED version of the string (since anagrams, by definition, contain the same multiset of characters, sorting them always produces an identical result). An alternative, often faster canonical form for strings limited to lowercase English letters is a 26-element character-frequency count, avoiding the O(k log k) cost of sorting each string entirely." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Grouping strings (or any collection) by some equivalence relation where a fast-to-compute CANONICAL FORM exists — anagram-grouping is the classic example, but the technique generalises",
          "Detecting duplicate or rearranged content: file deduplication by content signature, detecting permuted password attempts, bioinformatics sequence comparison after accounting for rearrangement",
          "As a clean illustration of the 'canonical key' hash-map pattern: instead of hashing the raw data directly, hash a TRANSFORMED version of it that's identical for all members of the same equivalence class",
          "Frequency-count canonical forms (rather than sorting) generalise this same technique to an O(nk) solution when the alphabet is small and fixed, avoiding the O(k log k) per-string sorting cost entirely"
        ]},
        { tag: "note", variant: "tip", text: "The sorted-string canonical form is simple but costs O(k log k) per string; for problems specifically restricted to lowercase English letters, a 26-length frequency-count tuple as the key instead reduces this to O(k) per string, improving the overall bound from O(nk log k) to O(nk)." }
      ],

      timeComplexityCalculation: {
        notation: "O(nk log k)",
        best: [
          { tag: "h2", text: "Best Case — O(nk log k)" },
          { tag: "p", text: "Every string must be canonicalised (sorted) and inserted into the hash map regardless of how many actual anagram groups exist — there's no shortcut even if every string happens to be in its own unique group." },
          { tag: "ul", items: [
            "n strings, each requiring O(k log k) to sort (where k is the maximum string length) and O(k) average to hash and insert into the map",
            "Total: O(nk log k), even for the most favourable grouping outcome"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(nk log k)" },
          { tag: "p", text: "Every string undergoes the same fixed sorting and hash-map-insertion process regardless of the actual character content or how strings group together — sorting cost depends only on string length, not on content distribution." },
          { tag: "ul", items: [
            "n strings × O(k log k) sorting each = O(nk log k)",
            "Hash map insertion using the sorted string as key: O(k) average per insertion (for hashing/comparing the key itself), dominated by the sorting cost"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(nk log k)" },
          { tag: "p", text: "No input configuration increases the cost beyond sorting every string and inserting it into the hash map — this is simultaneously the best, average, and worst case, since sorting cost is determined entirely by string length, not content." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(nk log k)",
            "The character-frequency-count alternative (for restricted alphabets) achieves O(nk) instead, avoiding the log k factor entirely by replacing sorting with a linear counting pass"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(nk)",
        best: [
          { tag: "h2", text: "Best Case Space — O(nk)" },
          { tag: "p", text: "The hash map must ultimately store every original string (across all groups) plus their canonical-form keys, requiring space proportional to the total character count across all input strings." },
          { tag: "ul", items: ["Total stored characters across all original strings and their canonical keys: O(nk)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(nk)" },
          { tag: "p", text: "Space usage is fixed by the total input size (n strings of average length k) alone, regardless of how many distinct anagram groups actually form." },
          { tag: "ul", items: ["Same O(nk) bound regardless of grouping distribution — whether all n strings form one giant group or n separate singleton groups"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(nk)" },
          { tag: "p", text: "No grouping configuration increases space beyond storing all original strings and their canonical-form keys exactly once each." },
          { tag: "ul", items: ["O(nk) total, identical across all cases — both the original strings and their sorted-key representations contribute O(nk) combined"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function groupAnagrams(strs):
    groups ← empty hash map         // canonical form → list of original strings

    for s in strs:
        key ← sortCharacters(s)     // canonical form: sorted character sequence
        if key not in groups:
            groups[key] ← empty list
        groups[key].append(s)

    return values of groups          // list of grouped lists` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "For each string in the input, compute its canonical form — here, the characters sorted into a fixed order (e.g. 'tea' and 'eat' both sort to 'aet').",
          "Use this canonical form as a hash map key. If it's a new key, initialise an empty list for it.",
          "Append the ORIGINAL (unsorted) string to the list associated with its canonical key — this preserves the actual input strings in the output, while using the sorted version purely as the grouping mechanism.",
          "After processing every string, the hash map's values (each a list of original strings) are exactly the anagram groups, since every string in the same list shares the same canonical form by construction."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Two strings are anagrams of each other if and only if they contain the exact same multiset of characters — and sorting a string produces a canonical, order-independent representation of that multiset (any two strings with the same multiset of characters produce identical sorted output, and any two strings with different multisets produce different sorted output). This means the canonical-form hash map key correctly captures the 'is an anagram of' equivalence relation exactly: strings map to the same key if and only if they're anagrams of each other, so grouping by key correctly and completely partitions the input into anagram groups." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. LFU CACHE DESIGN
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "LFU Cache Design",
      href: "/algorithms/hash_maps/lfu-cache",
      type: "Hard",

      about: [
        { tag: "h1", text: "LFU Cache Design" },
        { tag: "p", text: "A Least Frequently Used (LFU) Cache is a fixed-capacity key-value store that, when full, evicts the entry with the SMALLEST access count (not the oldest, as in LRU) to make room for a new one — ties between equally-infrequent entries are broken by evicting the least-recently-used among them. It's a strictly harder design problem than LRU Cache (covered in the Linked Lists section), since it requires tracking TWO dimensions simultaneously: frequency count AND recency-within-that-frequency." },
        { tag: "p", text: "The O(1)-per-operation solution requires THREE coordinated structures: a hash map from key to (value, frequency) for O(1) lookup, a hash map from frequency count to a doubly linked list of keys with that exact frequency (ordered by recency within the frequency group, exactly like an LRU list), and a tracked 'minimum frequency currently in the cache' value to know instantly which frequency-bucket to evict from." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Designing a cache eviction policy where ACCESS FREQUENCY (not just recency) should determine what gets evicted — content that's accessed very often but happened to be touched a while ago shouldn't be evicted just because something less popular was touched more recently (the failure mode LRU is vulnerable to)",
          "CDN and database buffer pool caching strategies where genuinely 'hot' (frequently accessed) data should be strongly preferred for retention over merely 'recently touched once' data",
          "The natural escalation problem after mastering LRU Cache Design — demonstrates combining MULTIPLE hash maps and linked lists together to track two independent dimensions (frequency and recency) simultaneously, each in O(1)",
          "Adaptive caching systems that blend frequency and recency (e.g. ARC — Adaptive Replacement Cache) build on the same multi-structure foundation established here"
        ]},
        { tag: "note", variant: "warning", text: "The trickiest part of LFU isn't tracking frequency — it's correctly maintaining the 'minimum frequency currently present' value across both increments (when an existing key is accessed) and evictions (when the minimum-frequency bucket becomes empty and the new minimum must be determined), since getting this wrong silently breaks the eviction-order guarantee." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Both get and put always perform a small, fixed number of hash map lookups and doubly-linked-list pointer operations, regardless of the cache's current contents or access history." },
          { tag: "ul", items: [
            "get: O(1) — look up the key's entry, increment its frequency, move it to the corresponding frequency bucket's recency list",
            "put: O(1) — similar lookup/update, plus possibly an O(1) eviction from the minimum-frequency bucket if the cache is full"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every operation performs the same fixed sequence of hash map and doubly-linked-list operations regardless of how access frequencies happen to be distributed across the cache's current entries." },
          { tag: "ul", items: [
            "key → (value, frequency) hash map: O(1) average lookup/update",
            "frequency → doubly-linked-list-of-keys hash map: O(1) average lookup of the correct frequency bucket, plus O(1) unlink/relink within that bucket's list",
            "Tracking and updating the minimum-frequency value: O(1) amortised, since it only ever needs to be checked or incremented by exactly 1 per operation"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "Because every structural operation (hash map access, doubly-linked-list splice) is individually O(1) by construction, no sequence of get/put operations can push any single operation beyond constant time — this mirrors LRU Cache's same guarantee, just with one additional coordinated hash map for frequency tracking." },
          { tag: "ul", items: [
            "All operations remain O(1) regardless of access pattern, assuming well-behaved (non-adversarial) hash functions for both hash maps involved",
            "As with any hash-map-based structure, a pathological hash collision attack could theoretically degrade this, though this isn't characteristic of normal operation"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The cache stores at most 'capacity' entries by design, requiring space proportional to capacity across both the key-data hash map and the frequency-bucket structure." },
          { tag: "ul", items: ["key → (value, frequency) map: up to capacity entries — O(n)", "frequency → linked-list map: total entries across all frequency buckets also bounded by capacity — O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is bounded by the fixed cache capacity, which is a configuration parameter, identical in spirit to LRU Cache Design's space bound." },
          { tag: "ul", items: ["Both hash maps combined stay capped at O(n), where n is the configured capacity, regardless of how access frequencies happen to distribute"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No access pattern increases space beyond the fixed capacity — eviction guarantees the cache never grows past its configured size limit, and the frequency-bucket structure's total entry count across all buckets always equals the number of cached keys, never more." },
          { tag: "ul", items: [
            "Combined structures: O(n), where n is the capacity — a hard upper bound enforced by the eviction policy, identical in spirit to LRU Cache Design's guarantee"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`class LFUCache:
    capacity   ← given
    minFreq    ← 0
    keyData    ← empty hash map        // key → (value, frequency)
    freqLists  ← empty hash map        // frequency → doubly linked list of keys (most-recent first)

    function get(key):
        if key not in keyData: return −1
        (value, freq) ← keyData[key]
        bumpFrequency(key, freq)
        return value

    function put(key, value):
        if capacity == 0: return
        if key in keyData:
            (_, freq) ← keyData[key]
            keyData[key] ← (value, freq)
            bumpFrequency(key, freq)
            return

        if size(keyData) == capacity:
            evictKey ← freqLists[minFreq].removeLeastRecent()
            delete keyData[evictKey]

        keyData[key] ← (value, 1)
        freqLists[1].insertMostRecent(key)
        minFreq ← 1

    function bumpFrequency(key, oldFreq):
        freqLists[oldFreq].remove(key)
        if freqLists[oldFreq] is empty and minFreq == oldFreq:
            minFreq ← minFreq + 1
        newFreq ← oldFreq + 1
        keyData[key].frequency ← newFreq
        freqLists[newFreq].insertMostRecent(key)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain two coordinated hash maps: one from key to its (value, current frequency), and one from a frequency value to a doubly linked list of all keys CURRENTLY at exactly that frequency, ordered by recency (most-recent at the front, exactly like an LRU list within each frequency bucket).",
          "On get(key) (and on put for an existing key): look up the key's current frequency, remove it from that frequency's list, increment its frequency by one, and insert it at the front of the NEW frequency's list — this correctly 'promotes' the key.",
          "If removing the key emptied its OLD frequency bucket, and that old frequency was the tracked minimum, the minimum must now increase by exactly 1 (since the key being bumped was, by definition, originally at the minimum frequency if minFreq == oldFreq).",
          "On put(key, value) for a NEW key: if the cache is at capacity, evict the least-recently-used key from the bucket at minFreq (the globally least-frequently-used group, with ties broken by recency) — then insert the new key at frequency 1, and reset minFreq to 1, since a freshly inserted key is always the new minimum."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The frequency-bucket structure correctly groups every cached key by its exact access count, and within each bucket, the doubly linked list correctly orders keys by recency, mirroring LRU Cache Design's own correctness argument but applied independently to each frequency level. Eviction always pulls from freqLists[minFreq], which by the maintained minFreq invariant is guaranteed to be the genuinely lowest frequency currently present among ANY cached key — and within that bucket, removing from the least-recent end correctly breaks frequency ties using recency, satisfying the full LFU-with-recency-tiebreak specification. The minFreq invariant itself is correctly maintained because it's only ever decreased to 1 on a fresh insertion (provably correct, since a frequency-1 key is always tied for the minimum) and only ever incremented when its OWN bucket becomes empty due to a bump (provably correct, since an empty bucket can no longer contain the minimum, and the bumped key's new frequency, oldFreq+1, is the next viable candidate)." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const HEAP_SECTION = {
  name: "Heap",
  href: "/algorithms/heap",
  desc: "Min-heap, max-heap, k-way merge, top-k",
  complexity: "O(log n)",
  count: 4,

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
    minHeap ← empty min-heap

    for num in nums:
        push(minHeap, num)
        if size(minHeap) > k:
            pop(minHeap)            // evict the current smallest of the top-k candidates

    return peek(minHeap)            // the heap's minimum is the Kth largest overall` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a min-heap that is never allowed to exceed size k.",
          "For each new element, push it onto the heap unconditionally — this might temporarily grow the heap to size k+1.",
          "If the heap now exceeds size k, pop the minimum — this correctly evicts whichever element among the current top-(k+1) candidates is the smallest, since a min-heap's pop always removes the minimum.",
          "After processing all n elements, exactly k elements remain in the heap: the k largest elements from the entire array, and the heap's root (its minimum, accessible in O(1)) is, among those k, the smallest — which is exactly the Kth largest element of the original array."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: after processing any prefix of the input, the heap contains exactly the k largest elements seen SO FAR (or fewer than k, if fewer than k elements have been processed yet). This holds by induction: each new element is unconditionally added, and if this would exceed k elements, the single smallest among the current k+1 candidates is removed — correctly restoring the invariant, since removing the smallest of (top-k-so-far plus the new element) is exactly how to determine the new top-k set. By induction, after all n elements are processed, the heap holds exactly the true k largest elements of the entire array, and since it's a min-heap, its root is the smallest of those k — which, by definition, is the Kth largest element overall." }
      ]
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
    minHeap ← empty min-heap          // ordered by node value

    for list in lists:
        if list is not null:
            push(minHeap, list)        // push the head node of each non-empty list

    dummy ← new Node(0)
    tail ← dummy

    while minHeap is not empty:
        smallestNode ← pop(minHeap)    // node with the globally smallest current value
        tail.next ← smallestNode
        tail ← tail.next

        if smallestNode.next is not null:
            push(minHeap, smallestNode.next)   // advance that list, push its new front

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
      ]
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

    minHeap ← empty min-heap           // ordered by frequency

    for (value, freq) in freqMap:
        push(minHeap, (freq, value))
        if size(minHeap) > k:
            pop(minHeap)                // evict the currently-least-frequent of the top-k candidates

    return [value for (freq, value) in minHeap]` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Phase 1: scan the input array once, building a hash map from each distinct value to its total occurrence count — exactly the standard frequency-counting pattern.",
          "Phase 2: iterate over the distinct (value, frequency) pairs from the hash map, maintaining a min-heap ordered by frequency, capped at size k — exactly the same size-k-min-heap technique as Kth Largest Element, but the comparison key is now frequency rather than raw value.",
          "For each (value, frequency) pair, push it onto the heap; if this exceeds size k, pop the entry with the smallest frequency, correctly evicting whichever of the current top-(k+1) candidates is least frequent.",
          "After processing all distinct elements, the heap contains exactly the k elements with the highest frequencies — extract their values as the final answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Phase 1's correctness is immediate: a hash map correctly and exactly counts the occurrences of every distinct value with a single pass. Phase 2's correctness follows from the exact same invariant argument as Kth Largest Element, applied to frequency instead of raw value: after processing any prefix of the distinct (value, frequency) pairs, the heap contains exactly the k highest-frequency elements seen so far, since each new candidate is added and, if it would exceed size k, the lowest-frequency entry among the current top-(k+1) is correctly evicted. By induction, after processing all distinct elements, the heap holds exactly the true k most frequent elements of the original input." }
      ]
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
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const RECURSION_SECTION = {
  name: "Recursion",
  href: "/algorithms/recursion",
  desc: "Backtracking, permutations, divide & conquer",
  complexity: "O(2ⁿ)",
  count: 5,

  about: [
    { tag: "h1", text: "Recursion" },
    { tag: "p", text: "Recursion solves a problem by reducing it to one or more smaller instances of the same problem, with explicit base cases that terminate the reduction. This section focuses specifically on BACKTRACKING — a recursive technique for exhaustively exploring a space of candidate solutions, building a partial solution incrementally, and abandoning ('backtracking from') any partial solution as soon as it's determined that it cannot possibly be completed into a valid one." },
    { tag: "p", text: "The defining shape of every backtracking algorithm is the same: make a choice, recurse into the consequence of that choice, then UNDO the choice before trying the next alternative. That undo step — restoring shared state back to exactly what it was before the choice was made — is what allows a single shared data structure (a partial permutation, a partially filled board, a running combination) to be reused across the entire exploration, instead of needing a fresh copy at every recursive call." },
    { tag: "h2", text: "The universal backtracking template" },
    { tag: "code", language: "text", text:
`function backtrack(partialSolution, remainingChoices):
    if partialSolution is complete:
        record(partialSolution)
        return

    for choice in remainingChoices:
        if choice is valid given partialSolution:
            apply choice to partialSolution      // make the choice
            backtrack(partialSolution, updatedRemainingChoices)
            undo choice from partialSolution      // backtrack: restore prior state` },
    { tag: "h2", text: "Pruning: the difference between brute force and backtracking" },
    { tag: "p", text: "Pure brute force would generate every possible candidate FIRST and check validity afterward. Backtracking's actual power comes from PRUNING — checking validity DURING construction and abandoning a branch the moment it becomes provably invalid, rather than continuing to build out a doomed partial solution. This is why N-Queens and Sudoku Solver, despite having factorial/exponential worst-case bounds, run dramatically faster in practice than their raw complexity suggests: most branches are pruned away long before reaching full depth." },
    { tag: "table",
      headers: ["Problem", "What's Being Chosen", "Pruning Check"],
      rows: [
        ["Subsets", "Include or exclude each element", "None needed — every combination is valid"],
        ["Permutations", "Which unused element goes next", "Element must not already be used in this permutation"],
        ["N-Queens", "Which column to place a queen in, per row", "No conflict with any previously placed queen (column, diagonal)"],
        ["Sudoku Solver", "Which digit 1-9 to place in the next empty cell", "Digit must not violate row/column/box constraints"],
        ["Combination Sum", "Include a candidate value (possibly repeated)", "Running sum must not exceed the target"]
      ]
    },
    { tag: "note", variant: "tip", text: "Backtracking time complexities in this section are almost always expressed as the size of the full search tree (2ⁿ, n!, 9^m) — but the ACTUAL runtime is typically far smaller in practice because of pruning, which the asymptotic worst-case bound doesn't capture." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. SUBSETS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Subsets",
      href: "/algorithms/recursion/subsets",
      type: "Medium",

      about: [
        { tag: "h1", text: "Subsets (Power Set)" },
        { tag: "p", text: "Given a set of n distinct elements, generate every possible subset, including the empty set and the full set itself — known as the power set. A set of n elements has exactly 2ⁿ subsets, since each element independently either is or isn't included, giving 2 choices per element and 2ⁿ total combinations." },
        { tag: "p", text: "It's the simplest possible backtracking problem, with no pruning needed at all — EVERY combination of include/exclude choices produces a valid subset, so the entire search tree is explored in full, with no branches ever being abandoned early. This makes it the ideal first example for understanding the bare backtracking template before adding pruning logic for harder problems." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Generating all possible subsets/combinations of a set, with no validity constraint beyond 'is a subset'",
          "As the conceptual foundation before tackling Combination Sum (below), which adds a pruning condition (running sum must not exceed target) on top of this exact same include/exclude recursive structure",
          "Bitmask enumeration: each subset corresponds directly to one of 2ⁿ binary numbers from 0 to 2ⁿ−1, where bit i indicates whether element i is included — an iterative alternative to the recursive approach shown here",
          "Power-set generation appears as a sub-step in many combinatorial and set-cover style problems"
        ]},
        { tag: "note", variant: "tip", text: "Subsets is unique among the problems in this section: it requires NO pruning logic whatsoever, since there's no invalid subset — this makes it the cleanest possible illustration of the raw backtracking template's shape." }
      ],

      timeComplexityCalculation: {
        notation: "O(2ⁿ)",
        best: [
          { tag: "h2", text: "Best Case — O(2ⁿ)" },
          { tag: "p", text: "Since every possible include/exclude combination is a valid subset, the recursion always explores the full binary decision tree regardless of the input elements' values — there's no pruning opportunity, so best case equals worst case exactly." },
          { tag: "ul", items: [
            "Each of the n elements independently doubles the number of partial solutions: 2ⁿ total leaf nodes in the recursion tree",
            "Each leaf corresponds to exactly one complete subset, recorded in O(1) amortised (or O(n) if copying the subset, common when the working array is reused across recursive calls)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(2ⁿ)" },
          { tag: "p", text: "Every input of size n produces exactly the same recursion tree shape (a complete binary tree of depth n), regardless of the actual element values — there's no value-dependent branching since there's no pruning condition at all." },
          { tag: "ul", items: ["2ⁿ total subsets generated, each requiring O(n) to copy out (if subsets are returned as new arrays): O(n · 2ⁿ) total work including output construction, often simplified to O(2ⁿ) when only counting the branching factor"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(2ⁿ)" },
          { tag: "p", text: "No input changes the size of the search tree — it's always exactly 2ⁿ leaves for n elements, since the problem itself (not any specific input value) determines the tree's shape." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(2ⁿ), or O(n · 2ⁿ) including output-copying overhead",
            "This is provably optimal: any correct algorithm must output all 2ⁿ subsets, so Ω(2ⁿ) is an unavoidable lower bound for this problem"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The recursion depth is always exactly n (one recursive call per element's include/exclude decision), and the working 'current subset' array never exceeds n elements." },
          { tag: "ul", items: ["Recursion call stack: O(n)", "Working subset array: up to O(n) elements"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Auxiliary space (excluding the unavoidable O(2ⁿ · n) needed to STORE the full output) is fixed by recursion depth alone, which is always exactly n regardless of input values." },
          { tag: "ul", items: ["O(n) auxiliary space for the recursion stack and working array", "Output storage (if all subsets are collected): O(n · 2ⁿ), since there are 2ⁿ subsets each up to length n — this is typically counted separately as 'output space' rather than algorithmic auxiliary space"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input increases the auxiliary space beyond the fixed recursion depth of n — this is a hallmark of backtracking algorithms where the auxiliary footprint (separate from output) scales with PATH length, not total search tree size." },
          { tag: "ul", items: ["O(n) auxiliary space, identical across all cases, excluding output storage"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function subsets(nums):
    result ← empty list
    current ← empty list

    function backtrack(start):
        result.append(copy of current)        // every partial state is itself a valid subset

        for i from start to length(nums) − 1:
            current.append(nums[i])             // choose: include nums[i]
            backtrack(i + 1)                     // explore
            current.removeLast()                 // un-choose: backtrack

    backtrack(0)
    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Record the current partial subset as a valid result IMMEDIATELY upon entering each recursive call — unlike most backtracking problems, EVERY partial state here (including the empty set) is itself a complete, valid answer.",
          "Then, try including each remaining element (from the current 'start' position onward, to avoid generating duplicate subsets in different orders) one at a time.",
          "For each choice, append it to the current working subset, recurse to explore all subsets that extend from this new state, then remove it again before trying the next candidate — this 'undo' step is what allows the single shared 'current' array to be reused across the entire exploration.",
          "The 'start' parameter (rather than always starting from index 0) is the key device that ensures each subset is generated exactly once, never as a different ordering of the same elements."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Every subset corresponds to exactly one path through the recursion tree, determined entirely by which elements were 'included' along that path — and since the algorithm explores every combination of include-or-skip choices (constrained only by the strictly-increasing 'start' index, which doesn't restrict WHICH subsets are reachable, only ensures each is reached exactly once), every one of the 2ⁿ possible subsets is generated exactly once. The append-before-recursing-then-remove-after pattern correctly restores 'current' to its prior state before trying the next sibling choice, ensuring no element from an abandoned branch incorrectly persists into a later, unrelated branch." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. N-QUEENS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "N-Queens",
      href: "/algorithms/recursion/n-queens",
      type: "Hard",

      about: [
        { tag: "h1", text: "N-Queens" },
        { tag: "p", text: "Place n queens on an n×n chessboard such that no two queens attack each other — meaning no two share a row, column, or diagonal. This is the quintessential constraint-satisfaction backtracking problem: place queens one row at a time, and the moment a placement conflicts with any previously placed queen, abandon that branch immediately rather than continuing to build out a doomed board." },
        { tag: "p", text: "The key efficiency insight is placing exactly ONE queen per row, in row order — this automatically guarantees no two queens ever share a row, reducing the search from 'choose n cells out of n² total' down to 'choose 1 column per row', which is what brings the raw search space down from a much larger binomial coefficient to a more tractable n!-bounded exploration with column and diagonal pruning on top." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal N-Queens problem (counting solutions, or finding/printing all of them) — a classic benchmark for backtracking algorithm implementations and constraint-satisfaction solvers",
          "Any 'place n non-conflicting items on a grid with row/column/diagonal exclusion rules' problem — the one-choice-per-row template generalises directly",
          "As a teaching example for constraint propagation: tracking which columns and diagonals are 'under attack' incrementally (rather than re-scanning the whole board on every placement) is a standard real-world optimisation technique demonstrated here",
          "A canonical benchmark problem for comparing backtracking implementations, constraint solvers, and even genetic/local-search algorithm performance"
        ]},
        { tag: "note", variant: "tip", text: "Diagonal conflicts can be checked in O(1) using two simple invariants: cells on the same 'positive' diagonal share the value (row − col), and cells on the same 'negative' diagonal share the value (row + col) — tracking sets of used (row−col) and (row+col) values avoids any need to re-scan the board for diagonal conflicts." }
      ],

      timeComplexityCalculation: {
        notation: "O(n!)",
        best: [
          { tag: "h2", text: "Best Case — O(n!)" },
          { tag: "p", text: "Even with effective column/diagonal pruning, the algorithm must still explore enough of the search tree to confirm correctness — the n! bound represents the search tree's structural upper bound (each row has at most n column choices, and the first row's choice eliminates options for later rows, roughly bounding the tree by a factorial-like shape), which holds regardless of how favourable the specific n happens to be." },
          { tag: "ul", items: [
            "Row 1: up to n column choices; Row 2: up to n−1 remaining viable columns (after row 1's column is excluded); and so on — bounding total work by roughly n!",
            "Pruning (column and diagonal conflict checks) significantly reduces the ACTUAL explored nodes in practice, but the asymptotic worst-case classification remains O(n!)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n!)" },
          { tag: "p", text: "The standard classification for N-Queens' backtracking search is O(n!), reflecting the structural shape of the full search tree before pruning is accounted for — actual measured runtime is typically dramatically smaller due to early pruning of invalid branches, but this isn't captured by the simplified asymptotic notation conventionally used for this problem." },
          { tag: "ul", items: [
            "Each row's column choice is checked in O(1) against tracked column/diagonal conflict sets",
            "The overall n! bound comes from the search tree's structure (n choices for row 1, at most n−1 for row 2, etc.), not from per-node cost, which stays O(1) thanks to the incremental conflict tracking"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n!)" },
          { tag: "p", text: "No specific value of n increases the asymptotic classification beyond this bound — it's the standard, widely-cited worst-case complexity for backtracking-based N-Queens, representing the size of the search tree being explored, with effective pruning reducing the CONSTANT factor dramatically but not the asymptotic class." },
          { tag: "ul", items: [
            "O(n!) is the conventional bound; note that the TRUE number of valid solutions grows much more slowly than n! (related to a sequence with no simple closed form), but the SEARCH effort (including pruned dead-ends) is what this bound describes"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The recursion depth is always exactly n (one recursive call per row), and the tracking structures for used columns and diagonals are each bounded by n entries." },
          { tag: "ul", items: ["Recursion stack: O(n)", "Column-used set, two diagonal-used sets: O(n) each"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Auxiliary space is fixed by board size n alone, regardless of how many solutions exist or how much pruning occurs during the search." },
          { tag: "ul", items: ["O(n) for recursion depth + conflict-tracking sets, regardless of the number of valid solutions found"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No board size or solution count increases the auxiliary space beyond the fixed per-row tracking structures — this is independent of how many total solutions exist or how deep the search tree's pruned branches extend before being abandoned." },
          { tag: "ul", items: ["O(n) auxiliary space, identical across all cases, excluding the space needed to STORE all found solutions if the problem requires returning every solution rather than just a count"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function solveNQueens(n):
    solutions ← empty list
    colUsed ← empty set
    diag1Used ← empty set            // row − col
    diag2Used ← empty set            // row + col
    placement ← array of size n      // placement[row] = column

    function backtrack(row):
        if row == n:
            solutions.append(copy of placement)
            return

        for col from 0 to n − 1:
            if col in colUsed or (row − col) in diag1Used or (row + col) in diag2Used:
                continue                              // pruned: conflict

            placement[row] ← col
            colUsed.add(col); diag1Used.add(row − col); diag2Used.add(row + col)

            backtrack(row + 1)

            colUsed.remove(col); diag1Used.remove(row − col); diag2Used.remove(row + col)  // undo

    backtrack(0)
    return solutions` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Process the board one row at a time, placing exactly one queen per row — this structurally guarantees no two queens ever share a row.",
          "For each row, try every column from 0 to n−1 as the candidate placement for this row's queen.",
          "Before committing to a column, check the three conflict-tracking sets: is this column already used by an earlier queen, or does this position share a diagonal (either direction) with an earlier queen? If any check fails, skip (prune) this column entirely.",
          "If the placement is valid, commit it: record the column, mark the column and both diagonals as used, then recurse to the next row.",
          "After the recursive call returns (having explored every possibility stemming from this placement), undo the commitment — unmark the column and diagonals — before trying the next column candidate for this row.",
          "When row reaches n, every row has a valid, non-conflicting queen placement — record this complete configuration as one valid solution."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Placing exactly one queen per row, by construction, eliminates row conflicts entirely without needing to check for them. The column-conflict check directly enforces the column constraint. The two diagonal-tracking sets correctly enforce diagonal constraints because cells on the same 'positive-slope' diagonal share an identical (row − col) value, and cells on the same 'negative-slope' diagonal share an identical (row + col) value — these are standard, easily-verified algebraic facts about grid coordinates, so checking membership in these two sets is exactly equivalent to checking for any diagonal conflict with EVERY previously placed queen, in O(1) rather than re-scanning all prior placements. The undo step correctly restores all three tracking sets to their exact prior state before trying the next column, ensuring that an abandoned (pruned or fully-explored) branch's placements never incorrectly persist into a sibling branch's exploration." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. SUDOKU SOLVER
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Sudoku Solver",
      href: "/algorithms/recursion/sudoku",
      type: "Hard",

      about: [
        { tag: "h1", text: "Sudoku Solver" },
        { tag: "p", text: "Given a partially filled 9×9 Sudoku grid, fill in the remaining empty cells with digits 1-9 such that every row, every column, and every 3×3 sub-box contains each digit exactly once. It's solved with the exact same backtracking shape as N-Queens — try a value, recurse, undo if it leads to a dead end — but with THREE simultaneous constraints (row, column, box) instead of N-Queens' three (row, column, diagonal), and a variable number of empty cells (m) instead of a fixed n choices." },
        { tag: "p", text: "The most direct implementation scans for the next empty cell, tries each digit 1-9 that doesn't violate any of the three constraints, recurses, and backtracks on failure. A significant real-world optimisation (constraint propagation / minimum-remaining-values heuristic) instead always picks the EMPTY CELL WITH THE FEWEST valid candidate digits next, which dramatically reduces the practical branching factor compared to always scanning cells in a fixed left-to-right, top-to-bottom order." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal Sudoku-solving problem, and any structurally similar constraint-satisfaction puzzle with row/column/region-style 'each value exactly once' rules",
          "General constraint satisfaction problems (CSPs) — Sudoku is a clean, well-known instance of the broader CSP framework that also includes graph coloring, scheduling with resource constraints, and logic puzzles",
          "As a demonstration of backtracking applied to a problem with MULTIPLE simultaneous constraints checked together (row AND column AND box), compared to N-Queens' simpler row/column/diagonal set",
          "Teaching constraint propagation and heuristic ordering (minimum-remaining-values) as practical optimisations layered on top of the basic backtracking template"
        ]},
        { tag: "note", variant: "tip", text: "Using bitmasks (one integer per row, column, and box, with bit i representing 'digit i+1 is already used') instead of explicit constraint-checking loops can reduce each O(1)-amortised validity check to genuinely O(1) bitwise operations, a meaningful practical speedup for Sudoku solvers despite not changing the asymptotic worst-case bound." }
      ],

      timeComplexityCalculation: {
        notation: "O(9^m)",
        best: [
          { tag: "h2", text: "Best Case — O(9^m)" },
          { tag: "p", text: "The bound 9^m (where m is the number of empty cells) represents the structural size of the search tree if every cell genuinely had all 9 digits as viable candidates — pruning from row/column/box constraints reduces the ACTUAL number of candidates checked per cell in practice, but the conventional worst-case classification doesn't capture this reduction." },
          { tag: "ul", items: [
            "Up to 9 candidate digits per empty cell, with m empty cells total: structurally bounded by 9^m",
            "In practice, the constraint checks (especially with a well-chosen puzzle that has a unique solution) prune the vast majority of this tree almost immediately, making real-world solve times far faster than the raw bound suggests"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(9^m)" },
          { tag: "p", text: "This is the conventionally cited bound for the algorithm's worst-case search tree shape, though real Sudoku puzzles (which are specifically constructed to have unique or near-unique solutions) are typically solved with vastly less effort than this bound implies, due to aggressive constraint-driven pruning at nearly every cell." },
          { tag: "ul", items: [
            "Each cell's candidate check (row + column + box membership) costs O(1) with bitmask tracking, or O(9) with naive linear scanning of each constraint group",
            "The overall 9^m bound comes from the search tree's structural shape, not from per-node cost"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(9^m)" },
          { tag: "p", text: "No specific puzzle configuration increases the asymptotic classification beyond this bound — it represents the absolute structural ceiling of the search tree for m empty cells, with effective constraint pruning dramatically reducing the constant factor in virtually all practical cases without changing the asymptotic class." },
          { tag: "ul", items: [
            "O(9^m) is the standard worst-case bound; a maximally adversarial (or maximally under-constrained) board with very few initially filled cells approaches this bound most closely, since fewer initial constraints mean less early pruning opportunity"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(m)",
        best: [
          { tag: "h2", text: "Best Case Space — O(m)" },
          { tag: "p", text: "The recursion depth is bounded by the number of empty cells m (one recursive call per cell being filled), and the constraint-tracking structures (whether bitmasks or sets) are bounded by the fixed board size (9 rows, 9 columns, 9 boxes), independent of m." },
          { tag: "ul", items: ["Recursion stack: O(m)", "Constraint tracking (bitmasks/sets for 9 rows, 9 columns, 9 boxes): O(1), since the board size is fixed at 9×9 regardless of m"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(m)" },
          { tag: "p", text: "Auxiliary space is fixed by the number of empty cells alone, since the board itself is a fixed-size 9×9 grid and the constraint-tracking overhead doesn't scale with m at all." },
          { tag: "ul", items: ["O(m) recursion depth, regardless of how many candidate digits are tried per cell or how much pruning occurs"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(m)" },
          { tag: "p", text: "No puzzle configuration increases auxiliary space beyond the recursion depth bound of m — this holds regardless of how deep the pruned-and-abandoned branches of the search tree extend before backtracking." },
          { tag: "ul", items: ["O(m) auxiliary space, identical across all cases — the fixed 9×9 board size keeps the constraint-tracking overhead constant regardless of puzzle difficulty"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function solveSudoku(board):
    emptyCell ← findNextEmptyCell(board)
    if emptyCell is null:
        return true                          // no empty cells left — solved

    (row, col) ← emptyCell

    for digit from 1 to 9:
        if isValid(board, row, col, digit):
            board[row][col] ← digit          // make the choice

            if solveSudoku(board):
                return true                  // propagate success upward

            board[row][col] ← EMPTY           // undo: this digit didn't lead to a solution

    return false                              // no digit worked — trigger backtrack in caller

function isValid(board, row, col, digit):
    for i from 0 to 8:
        if board[row][i] == digit: return false       // row conflict
        if board[i][col] == digit: return false       // column conflict

    boxRow ← (row / 3) * 3; boxCol ← (col / 3) * 3
    for r from boxRow to boxRow + 2:
        for c from boxCol to boxCol + 2:
            if board[r][c] == digit: return false      // box conflict

    return true` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Find the next empty cell. If there are none left, the board is completely and validly filled — return success immediately, propagating it back up through every pending recursive call.",
          "For the found empty cell, try each digit 1 through 9 as a candidate.",
          "Before committing a candidate, check all three constraints simultaneously: does this digit already appear in the same row, the same column, or the same 3×3 box? If any check fails, skip this digit.",
          "If valid, place the digit and recurse to solve the rest of the board with this cell now filled.",
          "If the recursive call returns success, propagate that success immediately back up — no further digits need to be tried for this cell, and no further backtracking is needed at this level.",
          "If the recursive call returns failure (this digit led to an unsolvable dead end somewhere deeper), undo the placement (reset the cell to empty) and try the next candidate digit.",
          "If every digit 1-9 has been tried for this cell and all failed, return failure — this signals the CALLER (the cell that was filled one step earlier) that ITS choice was wrong, triggering backtracking one level further up."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The isValid check directly and completely enforces all three Sudoku constraints for the candidate cell against every already-filled cell in its row, column, and box — so any digit that passes this check is guaranteed not to immediately violate the puzzle's rules. The recursive structure ensures that a digit is only considered 'successful' if EVERY remaining empty cell can also be validly filled given this choice (since success only propagates upward when the deepest recursive call — corresponding to the last empty cell — itself succeeds), correctly capturing the requirement that a valid Sudoku solution must satisfy ALL constraints simultaneously across the ENTIRE board, not just locally. The undo-on-failure step correctly ensures that a dead-end branch's placement doesn't incorrectly persist and affect the validity checks of subsequent candidate digits tried for the same cell, or for cells explored after backtracking to an earlier level." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. PERMUTATIONS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Permutations",
      href: "/algorithms/recursion/permutations",
      type: "Medium",

      about: [
        { tag: "h1", text: "Permutations" },
        { tag: "p", text: "Given a collection of n distinct elements, generate every possible ordering (permutation) of them. There are exactly n! distinct permutations of n distinct elements (n choices for the first position, n−1 remaining choices for the second, and so on down to 1 choice for the last position), and backtracking generates each one by building an ordering incrementally, choosing one new 'next element' at a time from whatever hasn't been used yet." },
        { tag: "p", text: "Unlike Subsets (where the 'start index' trick prevents revisiting elements out of order), Permutations genuinely needs every element to be triable at every position, just excluding elements ALREADY USED in the current partial ordering — this is typically tracked with an explicit 'used' boolean array or set, checked and updated at every recursive step." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Generating every possible ordering/arrangement of a set of items — scheduling problems considering every possible task order, generating all possible passwords/codes from a fixed character set",
          "As the conceptual foundation for permutation-based puzzles like the Travelling Salesperson Problem's brute-force baseline (before the Held-Karp DP optimisation covered in the Dynamic Programming section)",
          "Any problem requiring exhaustive exploration of 'in what ORDER could these things happen', as distinct from Subsets/Combinations, which only care about WHICH things are included, not their order",
          "Generating anagrams of a word (a direct, literal application of permutation generation to characters)"
        ]},
        { tag: "note", variant: "warning", text: "If the input contains DUPLICATE elements and the problem asks for UNIQUE permutations only, an extra pruning rule is needed: when iterating candidates at a given recursive level, skip a duplicate value if its identical predecessor in the candidate list was NOT used in this branch — otherwise the same permutation gets generated multiple times redundantly." }
      ],

      timeComplexityCalculation: {
        notation: "O(n · n!)",
        best: [
          { tag: "h2", text: "Best Case — O(n · n!)" },
          { tag: "p", text: "Every permutation of n distinct elements must be generated, and there are exactly n! of them regardless of the specific element values — there's no pruning opportunity (unlike N-Queens or Sudoku), since every ordering of distinct elements is a valid permutation." },
          { tag: "ul", items: [
            "n! total permutations to generate, with no input-dependent variation, since all elements are distinct and every full-length ordering is automatically valid",
            "Each complete permutation takes O(n) to construct/copy out, giving O(n · n!) total"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n · n!)" },
          { tag: "p", text: "The recursion tree's shape and size is fixed entirely by n (it has exactly n! leaves, by the standard factorial-counting argument for permutations), regardless of the actual element values, since there's no pruning condition that could vary by input." },
          { tag: "ul", items: ["n! leaves, each requiring O(n) to copy the completed permutation into the result list: O(n · n!) total"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n · n!)" },
          { tag: "p", text: "No input changes the size of the search tree — it's always exactly n! leaves for n distinct elements, since (unlike N-Queens or Sudoku) there's no constraint that could prune any branch early; every partial ordering of distinct, not-yet-used elements is always extendable to a valid full permutation." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n · n!)",
            "This is provably optimal: any correct algorithm must output all n! permutations, so Ω(n · n!) (accounting for the cost of writing out each permutation) is an unavoidable lower bound"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The recursion depth is always exactly n (one recursive call per position being filled in the permutation), and the 'used' tracking array/set and the working permutation array are each bounded by n elements." },
          { tag: "ul", items: ["Recursion stack: O(n)", "used[] tracking array: O(n)", "Working permutation array: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Auxiliary space (separate from the unavoidable O(n · n!) needed to STORE the full output) is fixed by n alone, since recursion depth and tracking-structure size don't depend on which specific permutation is currently being explored." },
          { tag: "ul", items: ["O(n) auxiliary space for recursion stack, used-tracking, and the working array, regardless of input values"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input increases the auxiliary space beyond the fixed n-deep recursion and n-sized tracking structures — this holds regardless of how many total permutations are eventually generated." },
          { tag: "ul", items: ["O(n) auxiliary space, identical across all cases, excluding the O(n · n!) output storage if all permutations must be collected and returned"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function permute(nums):
    result ← empty list
    current ← empty list
    used ← array of length(nums), all false

    function backtrack():
        if length(current) == length(nums):
            result.append(copy of current)
            return

        for i from 0 to length(nums) − 1:
            if used[i]: continue                // skip already-used elements

            used[i] ← true
            current.append(nums[i])              // choose

            backtrack()

            current.removeLast()                 // un-choose
            used[i] ← false

    backtrack()
    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "When the current partial permutation reaches the full length of the input, it's a complete, valid permutation — record it.",
          "Otherwise, try every element of the input as the NEXT element to append, skipping any element already marked as used in the current partial ordering.",
          "For each unused candidate, mark it used, append it to the current ordering, and recurse to fill the remaining positions.",
          "After the recursive call returns (having explored every completion stemming from this choice), undo it: remove the just-appended element and mark it unused again, before trying the next candidate for this position.",
          "Because every element is tried at every position (subject only to the 'not currently used' restriction, not any fixed starting index like Subsets uses), every possible ORDERING is reachable, not just every combination."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Every permutation corresponds to exactly one root-to-leaf path through the recursion tree, where the path's sequence of choices directly determines the resulting ordering. Since at every recursive level the algorithm tries EVERY currently-unused element (not restricted by any starting index or ordering constraint, unlike Subsets), every possible sequencing of the n elements is reachable as some path through the tree — and the 'used' array correctly ensures no element appears twice within a single permutation, since an element marked used is excluded from consideration until it's explicitly un-marked during backtracking. The choose-recurse-undo pattern correctly restores the used array and current list to their exact prior state before exploring each sibling branch, guaranteeing no cross-contamination between independent permutation candidates." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. COMBINATION SUM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Combination Sum",
      href: "/algorithms/recursion/combination-sum",
      type: "Medium",

      about: [
        { tag: "h1", text: "Combination Sum" },
        { tag: "p", text: "Given a set of distinct candidate numbers and a target value, find every unique combination of candidates that sums exactly to the target — where the SAME candidate number may be reused an unlimited number of times within a single combination (this 'unlimited reuse' is what distinguishes it from a standard Subsets-style problem). For example, with candidates [2, 3, 6, 7] and target 7, valid combinations include [7] and [2, 2, 3]." },
        { tag: "p", text: "This is Subsets' include/exclude template with two key modifications: a PRUNING condition (abandon a branch the moment the running sum exceeds the target, since adding more positive candidates can only increase it further) and ALLOWING REPEAT USE of the same candidate (achieved by recursing with the SAME starting index when a candidate is chosen, rather than advancing past it, since reuse is permitted)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Finding all ways to make a target sum using a given set of values, with unlimited reuse permitted — directly related to (and a generalisation of) the Coin Change problem from the Dynamic Programming section, but here enumerating every combination rather than just counting or minimising",
          "Any 'find all valid combinations satisfying a numeric constraint' backtracking problem, where the running partial-sum naturally provides a pruning signal (abandon as soon as the constraint is provably violated)",
          "As a direct illustration of how a single extra pruning check (running sum > target) transforms the un-prunable Subsets template into a dramatically more efficient search for sum-constrained problems",
          "Demonstrates the same-index-recursion trick for permitting unlimited element reuse, as distinct from Permutations/Subsets' use-once requirement"
        ]},
        { tag: "note", variant: "tip", text: "Sorting the candidates first allows an even stronger pruning rule: once a candidate exceeds the REMAINING target (target minus running sum), every later candidate (being even larger, since the list is sorted) can be skipped immediately too, without even checking them individually." }
      ],

      timeComplexityCalculation: {
        notation: "O(2^target)",
        best: [
          { tag: "h2", text: "Best Case — O(2^target)" },
          { tag: "p", text: "The pruning condition (abandon once running sum exceeds target) can terminate many branches early, but the conventionally cited worst-case bound represents the search tree's structural ceiling without accounting for how much pruning actually occurs for a favourable candidate set." },
          { tag: "ul", items: [
            "Without effective pruning, the search tree's depth is bounded by target (since the smallest candidate value is at least 1, and the running sum strictly increases with each choice), and branching factor is bounded by the number of candidates — loosely bounded by 2^target in the conventional simplified classification",
            "Effective pruning (especially with sorted candidates) can dramatically reduce the actual explored nodes for favourable candidate/target combinations"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(2^target)" },
          { tag: "p", text: "This is the standard conventionally-cited bound for this class of bounded-sum combinatorial search, reflecting the structural worst-case shape of the search tree, though pruning meaningfully reduces typical real-world runtime below this bound for most candidate sets." },
          { tag: "ul", items: [
            "Each recursive call does O(1) work (one comparison against the target, one addition to the running sum) beyond the branching itself",
            "The exponential bound comes from the search tree's structural depth-times-branching-factor shape, not from expensive per-node work"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(2^target)" },
          { tag: "p", text: "No specific candidate set or target value increases the asymptotic classification beyond this conventional bound — it represents the structural ceiling of the bounded-sum search tree, with the running-sum pruning condition reducing the constant factor substantially in most practical cases without changing the worst-case asymptotic class." },
          { tag: "ul", items: ["O(2^target) is the standard worst-case bound conventionally cited for this problem class"] }
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(target)",
        best: [
          { tag: "h2", text: "Best Case Space — O(target / minCandidate)" },
          { tag: "p", text: "The recursion depth is bounded by how many times the SMALLEST candidate value could be added before reaching the target (since that's the maximum possible combination length), and the working combination array is bounded by the same length." },
          { tag: "ul", items: ["Recursion stack: O(target / minCandidate), often simplified to O(target) when the minimum candidate value is treated as a constant", "Working combination array: same bound"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(target)" },
          { tag: "p", text: "Auxiliary space (separate from the output storage needed to collect all valid combinations) is fixed by the maximum possible recursion depth, which depends on the target value and the smallest available candidate, not on the specific combination being explored at any moment." },
          { tag: "ul", items: ["O(target) auxiliary space for recursion stack and working array, conventionally simplified assuming a roughly constant minimum candidate value"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(target)" },
          { tag: "p", text: "No candidate set or target value increases the auxiliary space beyond the bound imposed by the longest possible valid combination — this holds regardless of how many total valid combinations are found." },
          { tag: "ul", items: ["O(target) auxiliary space, identical across all cases, excluding the space needed to store all valid combinations in the final output"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function combinationSum(candidates, target):
    result ← empty list
    current ← empty list

    function backtrack(start, remaining):
        if remaining == 0:
            result.append(copy of current)
            return
        if remaining < 0:
            return                              // pruned: overshot the target

        for i from start to length(candidates) − 1:
            current.append(candidates[i])         // choose
            backtrack(i, remaining − candidates[i])  // same index i: allows reuse of this candidate
            current.removeLast()                  // un-choose

    backtrack(0, target)
    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Track the REMAINING target (target minus the running sum of the current partial combination) rather than the running sum directly — this makes the base case check ('remaining == 0') and the pruning check ('remaining < 0') both simple and direct.",
          "If remaining reaches exactly 0, the current partial combination sums exactly to the original target — record it as a valid result.",
          "If remaining goes negative, this branch has overshot the target and can never recover (since all candidates are positive) — prune immediately by returning without further exploration.",
          "Otherwise, try each candidate from the current 'start' index onward (not from the beginning, to avoid generating the same combination in multiple different orders — e.g. [2,3] and [3,2] should be counted as the same combination, not two different ones).",
          "Critically, when recursing after choosing candidate i, pass i again (not i+1) as the new start index — this is what permits the SAME candidate to be chosen again in a later recursive call, enabling unlimited reuse.",
          "After the recursive call returns, undo the choice (remove the just-appended candidate) before trying the next candidate."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Using the non-decreasing 'start' index (never going backward to a smaller index, while still allowing the SAME index to repeat) guarantees every combination is generated in exactly one canonical non-decreasing order, preventing the same set of values from being counted multiple times as different permutations of themselves. The remaining < 0 pruning check is provably safe because every candidate value is positive (given as a problem constraint) — once remaining goes negative, no further additions of positive candidates could ever bring it back to exactly 0, so abandoning that branch immediately loses no valid solutions. The remaining == 0 base case directly and correctly captures the problem's requirement: the current partial combination sums exactly to the target, which is precisely what's being recorded as a result." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const STRINGS_SECTION = {
  name: "Strings",
  href: "/algorithms/strings",
  desc: "KMP, Rabin-Karp, Z-algorithm, trie patterns",
  complexity: "O(n + m)",
  count: 5,

  about: [
    { tag: "h1", text: "Strings" },
    { tag: "p", text: "String algorithms deal with sequences of characters, and the central recurring problem across this entire field is PATTERN MATCHING: given a text of length n and a pattern of length m, find every occurrence of the pattern within the text. The naive approach checks every possible starting position and compares character by character, costing O(nm) in the worst case — every algorithm in this section exists specifically to beat that bound." },
    { tag: "p", text: "The shared trick behind nearly every advanced string algorithm is the same insight: when a character comparison fails partway through a match attempt, the characters ALREADY MATCHED contain information that can be reused to skip ahead, rather than naively restarting the comparison one position later and re-checking characters that are already known to match. KMP, Z-Algorithm, and Rabin-Karp each exploit this idea in a different way." },
    { tag: "h2", text: "Three approaches to beating O(nm)" },
    { tag: "table",
      headers: ["Algorithm", "Core Idea", "Time"],
      rows: [
        ["KMP (Knuth-Morris-Pratt)", "Precompute a 'failure function' so a failed match can skip ahead without re-comparing known-matching characters", "O(n + m)"],
        ["Z-Algorithm", "Precompute, for every position, the length of the longest substring starting there that matches the string's own prefix", "O(n + m)"],
        ["Rabin-Karp", "Hash the pattern and every text window of the same length; only do a full character comparison when hashes match", "O(n + m) average"]
      ]
    },
    { tag: "h2", text: "When string problems don't need these algorithms" },
    { tag: "p", text: "Not every string problem needs heavyweight pattern-matching machinery. Two Pointers (see the Arrays section) solves palindrome-checking directly. A sliding window with a character-frequency map handles 'longest substring with property X' problems in O(n). Reach for KMP, Z-Algorithm, or Rabin-Karp specifically when the problem is genuinely about finding a fixed PATTERN within a larger TEXT — that's the signal these three algorithms are built for." },
    { tag: "note", variant: "tip", text: "KMP and Z-Algorithm both achieve the same O(n+m) worst-case guarantee via deterministic preprocessing; Rabin-Karp achieves the same bound only on AVERAGE (its worst case is O(nm) under adversarial hash collisions) but generalises more naturally to searching for MULTIPLE patterns simultaneously." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. LONGEST SUBSTRING WITHOUT REPEATS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Substring Without Repeats",
      href: "/algorithms/strings/longest-substring",
      type: "Medium",

      about: [
        { tag: "h1", text: "Longest Substring Without Repeating Characters" },
        { tag: "p", text: "Given a string, find the length of the longest CONTIGUOUS substring that contains no repeated characters. This is a direct application of the Sliding Window technique (covered in depth in the Arrays section) rather than a dedicated pattern-matching algorithm — it's included here because it's one of the most common string-specific interview questions, and it illustrates the sliding window pattern applied specifically to character-uniqueness tracking." },
        { tag: "p", text: "The brute-force approach checks every possible substring for uniqueness, costing O(n³) (O(n²) substrings, each taking O(n) to verify) or O(n²) with a smarter uniqueness check. The sliding window approach achieves O(n): expand the window's right boundary one character at a time, and whenever a duplicate is detected, shrink the window's left boundary just enough to eliminate that duplicate, never re-scanning from the start." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal 'longest substring without repeating characters' problem and its many close variants (longest substring with AT MOST k distinct characters, longest substring with exactly k distinct characters)",
          "Any 'find the longest/shortest contiguous run satisfying a character-uniqueness or character-frequency property' problem — the sliding-window-plus-hash-set/map combination generalises directly",
          "As a reminder that not every string problem needs KMP/Z-Algorithm/Rabin-Karp — this one is solved entirely by the general Sliding Window pattern from the Arrays section, applied to characters instead of numbers",
          "DNA/RNA sequence analysis looking for the longest stretch without a repeated base, a direct bioinformatics application of the identical technique"
        ]},
        { tag: "note", variant: "tip", text: "This problem is cross-referenced in the Arrays section's Sliding Window entry — they're the same algorithm, just framed around strings here. Recognising that a 'string problem' is actually a generic array/sequence technique in disguise is itself a useful pattern-recognition skill." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "The right pointer always sweeps the entire string exactly once — there's no early-exit shortcut, since the longest valid window could potentially end at the very last character." },
          { tag: "ul", items: [
            "right traverses all n character positions exactly once: O(n)",
            "left only ever moves forward, never backward, bounding its total movement across the whole algorithm by n as well"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "This is the same amortised-analysis argument as the general Sliding Window pattern: although there appear to be two nested-looking pointers, neither ever resets, so their combined total movement across the entire algorithm is bounded by 2n, not n²." },
          { tag: "ul", items: [
            "right makes exactly n forward moves total",
            "left makes at most n forward moves total (bounded by right, since it can never exceed it)",
            "Combined: O(n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "Even a pathological input forcing frequent window-shrinking (e.g. a string of all-identical characters) still keeps total left-pointer movement bounded by n across the whole run, since left can never advance past right." },
          { tag: "ul", items: [
            "Worst case matches best/average: O(n)",
            "This is the same bound established in the Arrays section's Sliding Window entry, applied directly to character data here"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(min(n,m))",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "For a very short string, or a string drawn from a tiny alphabet, the character-tracking structure (hash set or fixed-size array) holds very few entries at any point." },
          { tag: "ul", items: ["Character-tracking structure: bounded by the window's current size, which can be as small as O(1) in favourable cases"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(min(n, m))" },
          { tag: "p", text: "The character-tracking structure (hash set, or a fixed-size array if the alphabet is known and bounded, e.g. ASCII or lowercase letters) can hold at most one entry per distinct character within the current window." },
          { tag: "ul", items: ["Bounded by min(n, m), where n is the string length and m is the alphabet size — for ASCII text, this is effectively O(min(n, 128))"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(min(n,m))" },
          { tag: "p", text: "If the entire string consists of distinct characters (the longest possible no-repeat window equals the whole string), the tracking structure grows to hold every distinct character, bounded above by either the string length or the alphabet size, whichever is smaller." },
          { tag: "ul", items: [
            "Worst case: O(min(n, m)), e.g. for lowercase English text, this is capped at 26 regardless of how long the string is — a meaningfully tighter bound than plain O(n) when the alphabet is small and fixed"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function lengthOfLongestSubstring(str_s):
    seen   ← empty hash set
    left   ← 0
    best   ← 0

    for right from 0 to length(s) − 1:
        while str_s[right] is in seen:
            remove str_s[left] from seen
            left ← left + 1

        add str_s[right] to seen
        best ← max(best, right − left + 1)

    return best` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "right scans the string forward one character at a time, always trying to extend the current window.",
          "Before admitting str_s[right] into the window, check whether it would create a duplicate within the window's current contents.",
          "If it would, shrink from the left — removing characters one at a time from the tracking set and advancing left — until the duplicate is eliminated and the window is valid again.",
          "Once the window is confirmed valid (no duplicates), add str_s[right] and check if the current window length is a new best.",
          "Repeat until right reaches the end of the string; the recorded best is the answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at the top of every outer-loop iteration, s[left..right−1] contains no duplicate characters. The inner while-loop correctly restores this invariant whenever adding str_s[right] would violate it, by removing characters from the left one at a time until the specific conflicting character is gone — and because left only ever moves forward (never resets), no valid window is ever skipped over or incorrectly re-examined, exactly matching the general Sliding Window correctness argument from the Arrays section." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. RABIN-KARP ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Rabin-Karp Algorithm",
      href: "/algorithms/strings/rabin-karp",
      type: "Medium",

      about: [
        { tag: "h1", text: "Rabin-Karp Algorithm" },
        { tag: "p", text: "Rabin-Karp, developed by Richard Karp and Michael Rabin in 1987, finds occurrences of a pattern within a text using HASHING rather than direct character comparison: compute a hash of the pattern once, then slide a window of the same length across the text, comparing the WINDOW'S HASH against the pattern's hash — only falling back to an actual character-by-character comparison when the hashes match (a 'candidate match' that needs verification, since different strings can occasionally hash to the same value)." },
        { tag: "p", text: "Its key efficiency trick is a ROLLING HASH: rather than recomputing each window's hash from scratch (which would cost O(m) per window, giving O(nm) overall — no better than brute force), the hash of the next window is computed in O(1) from the hash of the current window, by removing the contribution of the character leaving the window and adding the contribution of the character entering it." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Plagiarism detection and duplicate-content finding: hashing chunks of text (or document fingerprinting more generally) is exactly the rolling-hash technique applied at scale",
          "Searching for MULTIPLE patterns simultaneously: Rabin-Karp generalises naturally by computing multiple pattern hashes upfront and checking each text window's hash against all of them, unlike KMP/Z-Algorithm which are more naturally single-pattern algorithms",
          "Any 'find approximate or exact repeated substrings' problem, since the rolling hash technique extends to detecting repeated/duplicated chunks beyond simple single-pattern search",
          "Bioinformatics: approximate genome sequence matching often builds on rolling-hash techniques closely related to Rabin-Karp"
        ]},
        { tag: "note", variant: "warning", text: "A hash collision (two different strings producing the same hash value) doesn't cause Rabin-Karp to return a WRONG answer, because every hash match is verified with an actual character comparison before being reported — but frequent collisions DO degrade performance, since each false-positive hash match costs an extra O(m) verification that turns out to be wasted." }
      ],

      timeComplexityCalculation: {
        notation: "O(n + m)",
        best: [
          { tag: "h2", text: "Best Case — O(n + m)" },
          { tag: "p", text: "If hash collisions never occur (every hash match is a genuine pattern match, or there are very few false positives), each window comparison costs only O(1) for the hash check, with verification cost only incurred for genuine matches." },
          { tag: "ul", items: [
            "Pattern hash computation: O(m)",
            "Initial window hash computation: O(m)",
            "n − m + 1 subsequent window hash updates, each O(1) via the rolling hash: O(n)",
            "Total (assuming minimal false-positive verification): O(n + m)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n + m)" },
          { tag: "p", text: "With a well-chosen hash function (large prime modulus, good base value), the expected number of false-positive hash collisions across the entire text is small — typically O(1) or O(log n) expected total false positives, each costing O(m) to verify and reject, contributing only a lower-order term to the overall bound." },
          { tag: "ul", items: [
            "O(n) for sliding the window with O(1) rolling hash updates per step",
            "O(m) for the pattern's own hash computation",
            "Expected total verification cost from false positives: typically negligible with a well-designed hash function, keeping the overall average at O(n + m)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(nm)" },
          { tag: "p", text: "If the hash function is poorly chosen (or adversarially defeated), EVERY window could produce a hash collision with the pattern, forcing a full O(m) character-by-character verification at every one of the O(n) window positions." },
          { tag: "ul", items: [
            "Worst case: O(n) window positions × O(m) verification each = O(nm), identical to the naive brute-force bound",
            "This worst case is specifically a hash-quality issue, not a fundamental limitation of the rolling-hash technique itself — using a sufficiently large prime modulus and randomised base value (to defend against adversarially chosen inputs) makes this worst case extremely unlikely in practice"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only a handful of scalar variables are needed: the pattern's hash, the current window's rolling hash, and the precomputed value used to remove a character's contribution when the window slides." },
          { tag: "ul", items: ["patternHash, windowHash, and a small number of helper values: O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on text or pattern length for the core algorithm — it's always exactly a fixed handful of hash-tracking variables, regardless of how many candidate matches are found or verified." },
          { tag: "ul", items: ["No auxiliary array proportional to n or m is needed for the hashing mechanism itself"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even in the pathological all-collisions worst case (where every window requires full verification), no additional memory beyond the fixed hash-tracking variables is needed — the verification step compares characters directly against the original text and pattern, without needing extra storage." },
          { tag: "ul", items: ["O(1) auxiliary space, identical across all cases — a key structural advantage over KMP's O(m) failure-function table"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function rabinKarp(text, pattern):
    n ← length(text); m ← length(pattern)
    if m > n: return []

    BASE ← 256; MOD ← a large prime (e.g. 1_000_000_007)
    highOrder ← BASE^(m−1) mod MOD       // for removing the leading character's contribution

    patternHash ← hash(pattern, BASE, MOD)
    windowHash ← hash(text[0..m−1], BASE, MOD)
    matches ← empty list

    for i from 0 to n − m:
        if windowHash == patternHash:
            if text[i .. i+m−1] == pattern:       // verify to rule out a false-positive collision
                matches.append(i)

        if i < n − m:
            // Roll the hash forward: remove text[i], add text[i+m]
            windowHash ← (windowHash − text[i] * highOrder) * BASE + text[i + m]
            windowHash ← windowHash mod MOD

    return matches` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Compute the pattern's hash once, and the FIRST text window's hash (covering text[0..m-1]) using the same polynomial hash formula.",
          "At each window position, compare the window's hash against the pattern's hash. If they DON'T match, the window definitely isn't the pattern — move on immediately with no character comparison needed.",
          "If the hashes DO match, this is only a CANDIDATE match — verify it with an actual character-by-character comparison, since different strings can occasionally collide to the same hash value.",
          "To advance to the next window, compute its hash in O(1) using the rolling-hash update: subtract the outgoing character's weighted contribution, then shift and add the incoming character — avoiding recomputing the entire window's hash from scratch.",
          "Repeat until every possible window position (0 through n−m) has been checked."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The algorithm never reports a false match, because every hash match is explicitly verified with a direct character comparison before being added to the results — so correctness (no false positives) is guaranteed regardless of hash quality. The algorithm also never MISSES a true match, because a genuine pattern occurrence always produces an identical hash to the pattern itself (since the hash function is deterministic and computed identically for both), guaranteeing the hash comparison passes and triggers verification at every true match position. The rolling hash update formula is correct because polynomial hashing treats the string as coefficients of a polynomial in BASE — removing the leading term's contribution (subtracting text[i] × BASE^(m-1)) and then shifting (multiplying by BASE) and adding the new trailing term (text[i+m]) exactly recomputes what the hash of the new window would be if computed from scratch, by the standard algebraic properties of polynomial evaluation." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. KMP ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "KMP Algorithm",
      href: "/algorithms/strings/kmp",
      type: "Hard",

      about: [
        { tag: "h1", text: "Knuth-Morris-Pratt (KMP) Algorithm" },
        { tag: "p", text: "KMP, developed by Donald Knuth, James Morris, and Vaughan Pratt (published 1977), finds every occurrence of a pattern within a text in genuinely guaranteed O(n + m) time, with no possibility of the O(nm) worst case that Rabin-Karp can fall into under hash collisions. Its key innovation is the FAILURE FUNCTION (also called the 'partial match table' or 'prefix function'): a precomputed array, built from the pattern alone, that tells the algorithm exactly how far to 'skip ahead' after a mismatch, without ever needing to re-examine text characters that are already known to match." },
        { tag: "p", text: "The failure function for the pattern, at position i, stores the length of the longest proper prefix of pattern[0..i] that is ALSO a suffix of pattern[0..i]. This single piece of information is exactly what's needed to know: 'given that the text matched the pattern up to this point and then failed, what's the longest prefix of the pattern that could still possibly match, without having to start the entire comparison over from scratch?'" },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Any single-pattern exact string matching problem where a guaranteed (not just average-case) O(n+m) bound is required — text editors' find functionality, DNA sequence exact-match search, network intrusion detection systems scanning for known signature patterns",
          "Computing the pattern's own internal periodicity/repetition structure (the failure function itself reveals this — useful for problems like 'shortest string whose repetition forms a given string')",
          "As the conceptual foundation that the Z-Algorithm (below) closely parallels — both achieve the same O(n+m) guarantee via a different but related precomputation strategy",
          "Streaming text search, where the text arrives incrementally and re-scanning from the start on every mismatch (as brute force would) is infeasible"
        ]},
        { tag: "note", variant: "tip", text: "A common implementation trick: concatenate pattern + a separator character not in the alphabet + text (e.g. 'pattern#text'), then compute the failure function over the WHOLE combined string — every position where the failure function value equals the pattern's length indicates a full match, unifying preprocessing and searching into a single pass." }
      ],

      timeComplexityCalculation: {
        notation: "O(n + m)",
        best: [
          { tag: "h2", text: "Best Case — O(n + m)" },
          { tag: "p", text: "Both phases — failure function construction and the main text scan — always process their full input regardless of how favourably the pattern or text happens to be arranged, since both phases are structured as single guaranteed linear passes." },
          { tag: "ul", items: [
            "Failure function construction: O(m), a single pass over the pattern",
            "Text scanning: O(n), a single pass over the text, with the failure function ensuring no character is ever re-compared after a mismatch in a way that exceeds the total bound",
            "Total: O(n + m), unconditionally"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n + m)" },
          { tag: "p", text: "This is one of the cleanest examples of an algorithm where best, average, and worst case are ALL identical — the failure-function-driven skip logic guarantees the text pointer NEVER moves backward, and the pattern pointer's total backward movement across the ENTIRE scan is bounded by its total forward movement, regardless of the specific text or pattern content." },
          { tag: "ul", items: [
            "The key amortised argument: the pattern-pointer's position can decrease (via failure-function lookups) at most as many times TOTAL as it increased, since it's bounded below by 0 — this caps total work at O(n) for the scan, regardless of how many mismatches occur"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n + m)" },
          { tag: "p", text: "No text or pattern content increases the cost beyond the guaranteed bound — this is KMP's defining advantage over Rabin-Karp: there is NO adversarial input (no pathological hash collisions are even possible, since KMP doesn't use hashing at all) that can degrade it to anything worse than O(n + m)." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(n + m)",
            "This guaranteed bound (not just average-case) is KMP's primary advantage over Rabin-Karp, at the cost of being restricted to single-pattern search and requiring the O(m) failure-function precomputation upfront"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(m)",
        best: [
          { tag: "h2", text: "Best Case Space — O(m)" },
          { tag: "p", text: "The failure function array always requires exactly one entry per pattern character, regardless of the pattern's specific content." },
          { tag: "ul", items: ["Failure function array: O(m)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(m)" },
          { tag: "p", text: "Space usage is fixed by pattern length alone, since the failure function's size doesn't depend on the text being searched or how many matches are ultimately found." },
          { tag: "ul", items: ["Same O(m) bound regardless of text length n or the pattern's internal repetition structure"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(m)" },
          { tag: "p", text: "No pattern content increases space beyond the fixed one-entry-per-character failure function — this is both the floor and ceiling for the algorithm's auxiliary memory footprint, notably independent of the (potentially much larger) text length n." },
          { tag: "ul", items: ["O(m) total, identical across all cases — a meaningful advantage over algorithms requiring O(n) auxiliary space when m ≪ n"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function buildFailureFunction(pattern):
    m ← length(pattern)
    failure ← array of size m, all zero
    j ← 0                              // length of the previous longest prefix-suffix

    for i from 1 to m − 1:
        while j > 0 and pattern[i] != pattern[j]:
            j ← failure[j − 1]          // fall back to a shorter candidate prefix-suffix
        if pattern[i] == pattern[j]:
            j ← j + 1
        failure[i] ← j

    return failure

function kmpSearch(text, pattern):
    n ← length(text); m ← length(pattern)
    failure ← buildFailureFunction(pattern)
    matches ← empty list
    j ← 0                              // number of pattern characters currently matched

    for i from 0 to n − 1:
        while j > 0 and text[i] != pattern[j]:
            j ← failure[j − 1]          // skip ahead using precomputed knowledge
        if text[i] == pattern[j]:
            j ← j + 1
        if j == m:
            matches.append(i − m + 1)   // full match found
            j ← failure[j − 1]          // continue searching for overlapping matches

    return matches` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Build the failure function once, in O(m): failure[i] stores the length of the longest proper prefix of pattern[0..i] that's also a suffix of it — computed incrementally using ALREADY-COMPUTED failure values for shorter prefixes, exactly like a 1D dynamic program.",
          "Scan the text once, maintaining j = the number of pattern characters currently matched in a row.",
          "On a mismatch (text[i] != pattern[j]) with j > 0, don't restart from j=0 — instead, jump j back to failure[j-1], the longest prefix of the pattern that could STILL be a valid partial match given everything matched so far, then retry the comparison.",
          "On a match, advance j by one — one more pattern character has been successfully matched in sequence.",
          "If j ever reaches m (the full pattern length), a complete match has been found ending at position i — record it, then set j to failure[j-1] to continue searching for any further (possibly overlapping) matches without losing the progress already made."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The failure function correctly captures 'how much of the pattern is reusable' after a mismatch because of the following invariant: if pattern[0..j-1] matched text ending just before the mismatch, and failure[j-1] = k, then pattern[0..k-1] is GUARANTEED to also be a suffix of what was just matched in the text (since it's defined as a suffix of pattern[0..j-1], which IS what was just matched) — meaning the text already contains a valid match for pattern[0..k-1] ending at the current text position, so resuming comparison from pattern[k] (rather than pattern[0]) is provably safe and loses no possible match. The amortised O(n) bound for the main scan follows because i (the text pointer) only ever increases, while j only decreases via failure-function lookups — and since j is always bounded between 0 and its current value, the total decrease across the ENTIRE scan can never exceed the total increase, capping total work at O(n) despite the apparent nested-loop structure." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. VALID PALINDROME
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Valid Palindrome",
      href: "/algorithms/strings/palindrome",
      type: "Easy",

      about: [
        { tag: "h1", text: "Valid Palindrome" },
        { tag: "p", text: "A palindrome reads identically forward and backward. Valid Palindrome checks whether a given string is a palindrome, typically after normalising it (ignoring case, and skipping non-alphanumeric characters like spaces and punctuation) — e.g. 'A man, a plan, a canal: Panama' is a valid palindrome once normalised to 'amanaplanacanalpanama'." },
        { tag: "p", text: "This is a direct, simple application of the Two Pointers technique (covered in depth in the Arrays section): one pointer starts at the beginning, one at the end, and they move toward each other, comparing characters at each step — any mismatch immediately disproves the palindrome property, and the pointers meeting (or crossing) in the middle without any mismatch confirms it." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal palindrome-checking problem, with or without normalisation (case-folding, non-alphanumeric filtering) requirements",
          "As a building block for harder palindrome problems: Longest Palindromic Substring, Palindrome Partitioning, and 'valid palindrome after removing at most one character' all build on this exact same two-pointer comparison core, with additional logic layered on top",
          "Bioinformatics: checking for palindromic sequences in DNA (which have biological significance for restriction enzyme binding sites) uses the identical two-pointer comparison technique",
          "A clean illustration that not every string problem is a 'pattern matching' problem — this one is solved entirely by the general Two Pointers technique from the Arrays section, applied to a single string's own symmetry"
        ]},
        { tag: "note", variant: "tip", text: "This problem is cross-referenced in the Arrays section's Two Pointers entry — they're the same algorithmic technique, just applied here to a string-symmetry check instead of a sorted-array sum search." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If the very first and last characters (after normalisation) already mismatch, the algorithm can reject the string as a non-palindrome after just one comparison." },
          { tag: "ul", items: ["A mismatch at the very first comparison: O(1)", "This is a favourable-input case for REJECTION, not the general bound for confirming a true palindrome"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "For a genuine palindrome, both pointers must traverse all the way to the middle of the string, each doing one comparison per step, before concluding the string is valid." },
          { tag: "ul", items: [
            "left and right together make a combined total of n character visits as they converge toward the middle: O(n)",
            "Each step does O(1) work: one comparison (plus, if normalising on the fly, a constant number of character-class checks)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "The worst case is a true palindrome (or a near-palindrome that fails only at the very last comparison near the middle), forcing the pointers to traverse nearly the entire string before reaching a conclusion." },
          { tag: "ul", items: [
            "Worst case matches average: O(n), since confirming a true palindrome inherently requires checking every symmetric pair of characters",
            "This matches the trivial lower bound: verifying full symmetry requires examining every character at least once"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If normalisation is done ON THE FLY during the two-pointer scan (skipping non-alphanumeric characters and case-folding as comparisons happen, rather than building a separate cleaned string upfront), only the two pointer variables are needed." },
          { tag: "ul", items: ["left, right pointers — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on string length when normalisation is performed in-place during comparison, rather than via a separate preprocessing pass that builds a new cleaned string." },
          { tag: "ul", items: ["No auxiliary array needed if normalisation logic is embedded directly in the comparison loop"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even the longest possible string requires no more than the fixed two pointer variables, given the on-the-fly normalisation approach." },
          { tag: "ul", items: [
            "O(1) for the optimal in-place-normalisation approach",
            "Note: an implementation that first builds a separate cleaned/normalised string before comparing would use O(n) space instead — a common but avoidable inefficiency"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function isPalindrome(s):
    left ← 0
    right ← length(s) − 1

    while left < right:
        while left < right and not isAlphanumeric(str_s[left]):
            left ← left + 1
        while left < right and not isAlphanumeric(str_s[right]):
            right ← right − 1

        if toLowerCase(str_s[left]) != toLowerCase(str_s[right]):
            return false

        left ← left + 1
        right ← right − 1

    return true` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise left at the start and right at the end of the string.",
          "Before comparing, skip past any non-alphanumeric characters from BOTH ends — this performs normalisation on the fly without needing to build a separate cleaned string.",
          "Compare the two characters (case-folded to lowercase) at the current left and right positions. If they differ, the string is definitively not a palindrome — return false immediately.",
          "If they match, move both pointers inward by one and repeat.",
          "If the pointers meet or cross (left >= right) without ever finding a mismatch, every symmetric pair of characters matched — the string is a valid palindrome."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "A string is a palindrome if and only if, for every valid index i, the character at position i equals the character at the mirrored position (length − 1 − i). The two-pointer approach directly checks exactly this condition for every symmetric pair, working from the outside in: left and right always represent a mirrored pair relative to the (normalised) string's center, and since left only increases and right only decreases, every pair is checked exactly once, with no pair skipped or double-checked. Skipping non-alphanumeric characters from both ends before each comparison correctly implements the 'ignore punctuation and spaces' normalisation rule without altering the fundamental mirrored-pair-checking logic." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. Z-ALGORITHM
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Z-Algorithm",
      href: "/algorithms/strings/z-algorithm",
      type: "Hard",

      about: [
        { tag: "h1", text: "Z-Algorithm" },
        { tag: "p", text: "The Z-Algorithm computes, for every position i in a string, the length of the longest substring starting at i that matches a PREFIX of the entire string — this array of values is called the Z-array. Once computed (in O(n) for a string of length n), it can be used directly for pattern matching by concatenating pattern + separator + text and checking which positions in the Z-array equal the pattern's length, exactly indicating a full match." },
        { tag: "p", text: "Like KMP, its efficiency comes from REUSING previously computed information rather than restarting comparisons from scratch — but where KMP's failure function looks at prefix-suffix relationships WITHIN the pattern alone, the Z-array directly compares every position against the string's OWN PREFIX, maintaining a 'Z-box' (the rightmost window known to match the prefix) to avoid redundant character comparisons whenever a new position falls within an already-explored Z-box." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Single-pattern exact string matching, as a direct alternative to KMP, achieving the identical O(n+m) guaranteed bound via a different (some find more intuitive) precomputation strategy",
          "Finding all positions where a string repeats itself, or computing the string's periodicity structure — the Z-array directly exposes this information at every position",
          "Counting distinct substrings, or solving certain string-compression-related problems, where the Z-array's prefix-matching information is directly useful beyond simple pattern search",
          "As an alternative worth knowing alongside KMP specifically because some learners and some specific follow-up problems find the Z-array's direct 'prefix-matching length at every position' framing more natural to reason about than KMP's prefix-suffix failure function"
        ]},
        { tag: "note", variant: "tip", text: "The Z-array's very first entry, Z[0], is conventionally left undefined or set to 0 (or sometimes n) by definition, since 'comparing the string's prefix against itself starting at position 0' is a degenerate/trivial case usually excluded from the algorithm's core logic." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Computing the full Z-array always requires determining a value for every position in the string — there's no early-exit shortcut, since every position's Z-value potentially contributes to the final pattern-matching result." },
          { tag: "ul", items: [
            "n positions, each assigned a Z-value: O(n) positions visited",
            "The Z-box optimisation ensures that even in the best case, no character comparison is wasted — every comparison either extends the current match or is skipped using already-known information"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "This is the same amortised-analysis style argument as KMP: the Z-box's right boundary only ever moves forward (never backward) across the ENTIRE algorithm's execution, which caps the total number of character comparisons performed by direct matching at O(n), regardless of how many times the Z-box itself is updated or reused." },
          { tag: "ul", items: [
            "Total forward movement of the Z-box's right boundary across the whole algorithm: bounded by n",
            "Each position's Z-value computation does O(1) amortised work: either directly reusing a previously computed value (when fully inside an existing Z-box) or extending the Z-box with new character comparisons (whose total cost across the whole algorithm is bounded by the box's total forward movement)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No string content increases the cost beyond the amortised linear bound — this is KMP's same guarantee, achieved via a different (Z-box-based, rather than failure-function-based) bookkeeping mechanism." },
          { tag: "ul", items: [
            "Worst case matches best/average exactly: O(n), or O(n + m) when used for pattern matching via the pattern+separator+text concatenation trick",
            "Like KMP, this is a GUARANTEED bound, with no adversarial input capable of degrading it, unlike Rabin-Karp's hash-collision-dependent worst case"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The Z-array itself always requires exactly one entry per character of the (possibly concatenated, for pattern matching) string, regardless of the string's specific content." },
          { tag: "ul", items: ["Z-array: O(n), where n is the length of the string being processed (or pattern + separator + text combined, for pattern-matching use)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the input length alone, since the Z-array's size doesn't depend on the string's internal repetition structure or content." },
          { tag: "ul", items: ["Same O(n) bound regardless of how many positions have a nonzero (matching) Z-value"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No string content increases space beyond the fixed one-entry-per-position Z-array — this is both the floor and ceiling for the algorithm's memory footprint." },
          { tag: "ul", items: [
            "O(n) total, identical across all cases — note this is larger than KMP's O(m) when used purely for pattern matching, since the Z-array (in the standard concatenation-based usage) spans the COMBINED pattern+separator+text length, not just the pattern alone"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function zArray(s):
    n ← length(s)
    Z ← array of size n, all zero
    left ← 0; right ← 0          // current Z-box boundaries [left, right)

    for i from 1 to n − 1:
        if i < right:
            // i is inside the current Z-box — reuse previously computed info
            Z[i] ← min(right − i, Z[i − left])

        // Try to extend the match beyond what's currently known
        while i + Z[i] < n and s[Z[i]] == s[i + Z[i]]:
            Z[i] ← Z[i] + 1

        // Update the Z-box if this match extends further right than before
        if i + Z[i] > right:
            left ← i
            right ← i + Z[i]

    return Z

function zSearch(text, pattern):
    combined ← pattern + '#' + text       // '#' must not appear in either string
    Z ← zArray(combined)
    matches ← empty list

    for i from length(pattern) + 1 to length(combined) − 1:
        if Z[i] == length(pattern):
            matches.append(i − length(pattern) − 1)    // convert to a position in 'text'

    return matches` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a 'Z-box': the range [left, right) representing the rightmost-extending substring discovered so far that matches the string's own prefix.",
          "For each position i, if it falls WITHIN the current Z-box, its Z-value can be partially inferred from the already-computed Z-value at the MIRRORED position (i − left) within the prefix — bounded by how much of the box remains (right − i), since the match can't be guaranteed to extend beyond the box's known boundary without further checking.",
          "After this initial inference (or starting from 0 if outside any Z-box), try to EXTEND the match further by directly comparing characters beyond what's currently known/guaranteed.",
          "If this extension pushes the match further right than the current Z-box's boundary, update the Z-box to reflect this new, further-reaching match.",
          "For pattern matching specifically: concatenate pattern + a separator character (guaranteed not to appear in either string) + text, compute the Z-array of this combined string, and any position (within the text portion) where the Z-value equals the pattern's length indicates exactly where a full pattern match occurs."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The Z-box-based shortcut is correct because of a key property of prefix-matching: if position i falls within an existing Z-box [left, right) known to match the prefix, then the substring starting at i is GUARANTEED to match the prefix for AT LEAST min(right − i, Z[i − left]) characters — this follows because the substring at i, by virtue of being inside the Z-box, is itself a copy of the corresponding substring starting at (i − left) in the prefix, so whatever the prefix matches starting at (i − left) is mirrored exactly at i, UP TO the point where the Z-box's own boundary might cut off that guarantee. The subsequent direct-comparison extension step correctly verifies and extends beyond this guaranteed minimum where possible. The amortised O(n) bound follows because the Z-box's right boundary, 'right', only ever moves forward across the algorithm's entire execution — every direct character comparison performed during the extension step either successfully extends 'right' further (contributing to its bounded total forward movement) or fails immediately (costing only O(1) and ending that position's extension attempt), so total comparison work across the whole algorithm is provably bounded by O(n)." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const TRIES_SECTION = {
  name: "Tries",
  href: "/algorithms/tries",
  desc: "Prefix trees, autocomplete, word search",
  complexity: "O(m)",
  count: 3,

  about: [
    { tag: "h1", text: "Tries" },
    { tag: "p", text: "A trie (pronounced 'try', from reTRIEval) is a tree where each edge represents one character, and any path from the root spells out a string — every node implicitly represents the prefix formed by the path from the root to that node. This structure makes prefix-based operations (does this prefix exist, what words start with this prefix) genuinely fast, in a way no comparison-based structure can match." },
    { tag: "p", text: "The defining advantage over a hash set of strings: a hash set can only answer 'is this EXACT string present' in O(m) (where m is the string's length), but it CANNOT efficiently answer 'does any string with this PREFIX exist' without scanning every entry. A trie answers both questions in the same O(m) time, because a prefix query is literally just 'can I walk this many characters down from the root' — no scanning required." },
    { tag: "h2", text: "Structure at a glance" },
    { tag: "ul", items: [
      "Each node holds a set of children, one per possible next character (often an array of size 26 for lowercase English letters, or a hash map for a larger/sparser alphabet)",
      "Each node has an 'is end of word' flag, marking whether the path from the root to this node spells a complete, inserted word (as opposed to just being a prefix of some longer word)",
      "The root represents the empty string — every single-character word starts as a direct child of the root",
      "Lookup, insertion, and prefix-checking are all the same fundamental operation: walk down the tree one character at a time, following or creating child links as needed"
    ]},
    { tag: "h2", text: "Why m, not n, is the key variable" },
    { tag: "p", text: "Every operation's complexity in this section is expressed in terms of m, the LENGTH of the word or prefix being processed — NOT n, the number of words stored in the trie. This is the trie's signature property: operations cost the same regardless of how many other words share the structure, because each operation only ever touches the single path corresponding to its own characters, never any other stored word's nodes." },
    { tag: "note", variant: "tip", text: "If a problem mentions 'autocomplete', 'prefix matching', or searching with wildcard characters across many candidate words simultaneously, a trie is almost always the right structure — these are exactly the operations a trie is purpose-built for." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. WORD SEARCH II
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Word Search II",
      href: "/algorithms/tries/word-search-ii",
      type: "Hard",

      about: [
        { tag: "h1", text: "Word Search II" },
        { tag: "p", text: "Given an m×n grid of letters and a list of words, find every word from the list that can be constructed by tracing a path of adjacent cells (horizontally or vertically, never reusing a cell within the same word). The naive approach — run a separate DFS/backtracking search from every cell for EVERY word in the list — repeats an enormous amount of redundant work whenever multiple words share a common prefix." },
        { tag: "p", text: "The trie-based solution eliminates this redundancy by inserting ALL words into a single shared trie first, then performing ONE combined DFS across the grid that walks the trie alongside the grid traversal — as soon as a grid path no longer corresponds to any path in the trie (meaning no remaining word could possibly match), that entire branch is pruned immediately, simultaneously eliminating the dead end for every word that would have shared that prefix." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Searching a grid (or any graph-like adjacency structure) for multiple target words simultaneously — the shared-trie technique is specifically valuable when there are MANY target words, since it shares pruning work across all of them at once",
          "Boggle-style word games, where the brute-force per-word search becomes prohibitively slow as the dictionary grows large",
          "Any 'find all matches from a large word list within a larger structure' problem where words share meaningful prefix overlap — the more shared prefixes, the bigger the advantage over searching for each word independently",
          "As a direct illustration of combining a trie's prefix-pruning power with a backtracking/DFS grid search, two techniques covered separately elsewhere in this reference (Tries: Implement Trie, and Recursion's backtracking template) composed together"
        ]},
        { tag: "note", variant: "tip", text: "A key optimisation: once a word is found during the grid DFS, mark its trie node so it can't be matched again (e.g. clear its 'is end of word' flag), and optionally prune trie leaves with no children after a word is found — this prevents re-discovering the same word via multiple paths and keeps the trie from doing wasted work on already-found words." }
      ],

      timeComplexityCalculation: {
        notation: "O(m · 4 · 3^(L−1))",
        best: [
          { tag: "h2", text: "Best Case — O(m · 4 · 3^(L−1))" },
          { tag: "p", text: "Building the trie always requires inserting every word fully, and the grid DFS always starts from every one of the m grid cells regardless of how favourably the words and grid happen to align — there's no shortcut even for the most prunable input." },
          { tag: "ul", items: [
            "Trie construction: O(W), where W is the total character count across all words in the list (covered by the bound for Implement Trie below)",
            "Grid DFS: starting from each of the m = rows × cols grid cells, exploring up to 4 initial directions and up to 3 subsequent directions per step (excluding the cell just came from) for up to L steps (where L is the maximum word length): O(m · 4 · 3^(L−1))"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(m · 4 · 3^(L−1))" },
          { tag: "p", text: "This is the conventionally cited structural bound for the grid-DFS-with-trie-pruning search tree, representing its shape before accounting for how much actual pruning the trie achieves — real-world performance is typically dramatically better than this bound because most grid paths diverge from every word's prefix very quickly, triggering trie-based pruning almost immediately." },
          { tag: "ul", items: [
            "The trie's prefix-pruning (returning immediately the moment a grid path no longer corresponds to ANY remaining trie path) significantly reduces actual explored nodes in practice, though the conventional worst-case classification doesn't capture this",
            "Per-cell exploration: O(1) trie-lookup check at each step, since following a trie edge is a single O(1) array/hash lookup"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(m · 4 · 3^(L−1))" },
          { tag: "p", text: "No specific grid or word list increases the asymptotic classification beyond this conventional bound, representing the structural ceiling of the combined trie-pruned DFS search across the whole grid." },
          { tag: "ul", items: [
            "This is the standard worst-case bound conventionally cited for this problem; trie-based pruning provides a substantial constant-factor speedup over running L independent DFS searches per word (which would scale with the NUMBER of words, not just their shared structure), without changing the asymptotic class itself"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(N)",
        best: [
          { tag: "h2", text: "Best Case Space — O(N)" },
          { tag: "p", text: "The trie requires space proportional to the total number of distinct characters across all inserted words (with shared prefixes contributing to space only once, not once per word), plus the grid DFS's recursion stack bounded by the maximum word length." },
          { tag: "ul", items: ["Trie: O(N), where N is the total character count across all words after accounting for shared-prefix compression", "DFS recursion stack: O(L), the maximum word length"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(N)" },
          { tag: "p", text: "Trie space is fixed by the total distinct-prefix character count across the word list, which can be substantially smaller than the sum of all individual word lengths when many words share common prefixes." },
          { tag: "ul", items: ["Trie size scales with N, the total UNIQUE prefix-path character count, not the raw sum of word lengths — a meaningful space saving for word lists with significant prefix overlap"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(N)" },
          { tag: "p", text: "If every word shares no characters in common with any other (no prefix overlap at all), the trie's size approaches the raw sum of all word lengths, its structural maximum." },
          { tag: "ul", items: [
            "Trie: up to O(N), where N is the sum of all word lengths in the worst case of zero shared prefixes",
            "DFS recursion/visited-tracking: O(L), bounded by the longest word's length, independent of how many words are in the list"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function findWords(board, words):
    trie ← build a trie from all words (see Implement Trie)
    result ← empty set
    rows ← number of rows in board; cols ← number of columns

    function dfs(r, c, trieNode, pathSoFar):
        if r/c out of bounds or board[r][c] == VISITED_MARKER:
            return

        char ← board[r][c]
        if char not in trieNode.children:
            return                                  // pruned: no word in the trie has this prefix

        nextNode ← trieNode.children[char]
        newPath ← pathSoFar + char

        if nextNode.isEndOfWord:
            result.add(newPath)
            nextNode.isEndOfWord ← false             // avoid re-adding the same word

        temp ← board[r][c]
        board[r][c] ← VISITED_MARKER                  // mark visited for this path
        for (dr, dc) in [(0,1), (0,-1), (1,0), (-1,0)]:
            dfs(r + dr, c + dc, nextNode, newPath)
        board[r][c] ← temp                             // un-mark: backtrack

    for r from 0 to rows − 1:
        for c from 0 to cols − 1:
            dfs(r, c, trie.root, "")

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Build a single shared trie containing every word from the input list — this is the structure that allows pruning to benefit ALL words simultaneously, not just one at a time.",
          "Start a DFS from every cell in the grid, simultaneously tracking a position in both the grid AND the trie.",
          "At each step, check whether the current grid character corresponds to a valid child of the current trie node. If NOT, this path can't possibly extend into any remaining word — prune immediately by returning.",
          "If the trie node at this position marks the end of a word, a complete word has been found via this grid path — record it, and clear the flag to prevent re-discovering the same word through a different path later.",
          "Mark the current cell as visited (temporarily, within this single DFS path) before recursing into its neighbors, and un-mark it after the recursive calls return — exactly the standard backtracking choose-recurse-undo pattern.",
          "Explore all four grid directions from the current cell, continuing to walk both the grid and the trie in lockstep."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Every complete word in the word list corresponds to exactly one path from the trie's root to a node marked isEndOfWord — and the DFS only ever follows a grid path as long as it has a CORRESPONDING path in the trie, since the trie-lookup check at each step prunes any grid path that has diverged from every remaining word's prefix. This means any grid path the DFS continues to explore is, by construction, still a valid prefix of at least one word in the list, and the moment that path reaches a trie node marked as a complete word, the corresponding grid-traced string IS genuinely one of the target words (since it was built by walking exactly the trie's structure, which only contains paths spelling out the inserted words). The visited-marking-and-unmarking ensures no single word-search path reuses the same grid cell twice, correctly enforcing the problem's 'each cell used at most once per word' constraint." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. IMPLEMENT TRIE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Implement Trie",
      href: "/algorithms/tries/implementation",
      type: "Medium",

      about: [
        { tag: "h1", text: "Implement Trie" },
        { tag: "p", text: "Implementing a trie from scratch means building the prefix-tree structure itself: a root node with no associated character, and a set of operations — insert, search (exact word match), and startsWith (prefix match) — each implemented as a simple character-by-character walk down the tree from the root, following or creating child links as needed." },
        { tag: "p", text: "Each trie node typically holds an array (or hash map) of child pointers, one slot per possible next character, plus a boolean flag marking whether the path ending at this node spells a COMPLETE inserted word (as distinct from merely being a prefix of some longer word) — this distinction between 'is a prefix' and 'is a complete word' is what differentiates search() from startsWith()." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Implementing the trie ADT from primitives, typically as a foundational interview question testing understanding of tree-based prefix structures before tackling harder trie-based problems",
          "As the necessary building block before Word Search II (above) or Add and Search Words (below) — both rely on having a working trie implementation as their foundation",
          "Autocomplete and typeahead search systems, where the underlying data structure for 'find all words starting with this prefix' is almost always a trie variant",
          "IP routing tables (longest-prefix-match lookups) use a trie-like structure operating on the BITS of an IP address rather than characters — the same core prefix-tree principle applied to a different alphabet"
        ]},
        { tag: "note", variant: "tip", text: "Using a fixed-size array of 26 children (for lowercase English letters) instead of a hash map per node trades some memory (most slots are unused/null for any given node) for simpler, branch-free O(1) child access — a common, deliberate trade-off in trie implementations restricted to a small, known alphabet." }
      ],

      timeComplexityCalculation: {
        notation: "O(m)",
        best: [
          { tag: "h2", text: "Best Case — O(m)" },
          { tag: "p", text: "Every trie operation must walk the full length of the word or prefix being processed — there's no shortcut even for the most favourable trie structure, since correctness requires confirming every character along the path." },
          { tag: "ul", items: [
            "insert: walk (or create) m nodes, one per character of the word: O(m)",
            "search / startsWith: walk m nodes, following existing child links: O(m)",
            "This holds even in the best case, since the full word/prefix must be traversed to confirm or deny its presence"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(m)" },
          { tag: "p", text: "Every operation performs exactly one O(1) child-lookup per character of the word being processed, regardless of how many other words are already stored in the trie or how deeply nested the relevant path is." },
          { tag: "ul", items: [
            "m character lookups, each O(1) with array-based children (or O(1) average with hash-map-based children): O(m) total",
            "Crucially, this cost is COMPLETELY INDEPENDENT of n, the number of other words stored in the trie — a key structural advantage over a sorted list or balanced tree of strings, where operations typically scale with both word length AND the logarithm of the total word count"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(m)" },
          { tag: "p", text: "No trie size or word content increases the cost beyond the fixed per-character walk — this is simultaneously the best, average, and worst case, since trie traversal has no value-dependent branching or backtracking." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(m)",
            "This matches the trivial lower bound: any operation that must confirm or construct every character of an m-length string requires at least m character-level steps"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(m)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "If inserting a word that's entirely a prefix of an ALREADY-inserted longer word (or shares its entire path with an existing word), no new nodes need to be created at all — only the existing end node's isEndOfWord flag needs to be set." },
          { tag: "ul", items: ["If the word's full path already exists in the trie: O(1) additional space (just flipping a flag)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(m)" },
          { tag: "p", text: "Inserting a word requires creating new nodes only for the portion of its path that DOESN'T already exist in the trie — for typical word lists with some but not complete prefix overlap, this is some fraction of m." },
          { tag: "ul", items: ["New nodes created: up to O(m), depending on how much of the word's prefix path already exists from previously inserted words"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(m)" },
          { tag: "p", text: "If a word shares NO prefix at all with any previously inserted word, every one of its m characters requires a brand new node." },
          { tag: "ul", items: [
            "Worst case (zero shared prefix with existing trie content): O(m) new nodes for a single insertion",
            "Across n total inserted words with total combined length N (sum of all word lengths), the trie's total size is bounded by O(N) in the worst case of no shared prefixes at all, but can be substantially smaller when words share common prefixes"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`class TrieNode:
    children ← array of size 26 (or hash map), all null
    isEndOfWord ← false

class Trie:
    root ← new TrieNode()

    function insert(word):
        node ← root
        for char in word:
            idx ← char − 'a'
            if node.children[idx] is null:
                node.children[idx] ← new TrieNode()
            node ← node.children[idx]
        node.isEndOfWord ← true

    function search(word):
        node ← walkToNode(word)
        return node is not null and node.isEndOfWord

    function startsWith(prefix):
        node ← walkToNode(prefix)
        return node is not null

    function walkToNode(s):
        node ← root
        for char in s:
            idx ← char − 'a'
            if node.children[idx] is null:
                return null                  // path doesn't exist — no word/prefix match
            node ← node.children[idx]
        return node` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "insert: starting from the root, walk the word one character at a time. For each character, if the corresponding child doesn't yet exist, create it. Move into that child, and after processing all characters, mark the final node's isEndOfWord flag as true.",
          "walkToNode (a shared helper for search and startsWith): starting from the root, follow each character's child link. If at any point the required child doesn't exist, the string isn't present (as either a full word or even a partial prefix) — return null immediately.",
          "search: walk to the node corresponding to the full word; it's a valid match only if the walk succeeded AND the final node is explicitly marked as the end of a word (not just a prefix of some longer word).",
          "startsWith: walk to the node corresponding to the prefix; it's a valid prefix match as long as the walk succeeded at all — the isEndOfWord flag is irrelevant here, since ANY successful walk (regardless of whether it ends on a complete word) confirms the prefix exists."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "By construction, a path from the root through a sequence of child links exists in the trie if and only if some inserted word has that exact sequence as a prefix — every insert operation creates exactly the nodes needed to represent the word's full character path, and never removes or alters any other word's path. The isEndOfWord flag correctly distinguishes 'this exact string was inserted as a complete word' from 'this string is merely a prefix of something longer that was inserted' — search() correctly requires this flag (since an exact word match requires both path existence AND being a designated complete-word endpoint), while startsWith() correctly ignores it (since any successful path walk, regardless of endpoint status, confirms that prefix is shared by at least one inserted word)." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. ADD AND SEARCH WORDS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Add and Search Words",
      href: "/algorithms/tries/add-search",
      type: "Medium",

      about: [
        { tag: "h1", text: "Add and Search Words" },
        { tag: "p", text: "This extends the basic trie's search operation to support a WILDCARD character (commonly '.') that can match ANY single character — so search('b.d') should match 'bad', 'bed', 'bid', or any other 3-letter word in the structure starting with 'b' and ending with 'd'. Add operates exactly like a standard trie insert; the wildcard-aware search is what requires a fundamentally different traversal strategy than the simple Implement Trie's deterministic single-path walk." },
        { tag: "p", text: "Since a wildcard could match ANY of up to 26 possible characters at that position, the search can no longer follow a single deterministic path down the trie — instead, it must explore EVERY child branch at a wildcard position, using backtracking/DFS to try each possibility, while still benefiting from the trie's structure to prune branches the moment a definite (non-wildcard) character fails to match." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Wildcard or pattern-based word search across a large word dictionary — word puzzle solvers, regex-lite matching against a known word list",
          "Any 'exact trie lookup, but with some positions allowed to match anything' requirement — the technique generalises to other wildcard semantics (e.g. a wildcard matching any DIGIT instead of any letter, for a numeric-string trie)",
          "As a direct illustration of combining the trie's deterministic prefix-matching speed (Implement Trie) with backtracking-style branch exploration (Recursion section) specifically at the positions where the deterministic approach breaks down",
          "Demonstrates the general principle that most trie-based problems are 'plain trie traversal, except this one wrinkle requires exploring more than one branch at certain positions' — recognising which positions force branching is the key design skill"
        ]},
        { tag: "note", variant: "tip", text: "Without any wildcards in the query, this collapses to the exact same O(m) single-path walk as plain Implement Trie's search() — the wildcard-driven branching only kicks in at positions where a '.' actually appears in the query string." }
      ],

      timeComplexityCalculation: {
        notation: "O(m)",
        best: [
          { tag: "h2", text: "Best Case — O(m)" },
          { tag: "p", text: "A query with NO wildcard characters behaves exactly like a plain trie search — a single deterministic O(m) path walk, with no branching at all." },
          { tag: "ul", items: [
            "Zero wildcards: identical to Implement Trie's search() — O(m), a single linear path walk",
            "This is the best case specifically because no exploration of multiple branches is ever needed"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(m)" },
          { tag: "p", text: "For a query with a SMALL number of wildcards relative to its length (the typical case in practice), the branching factor at each wildcard position is bounded by the alphabet size, but most branches are pruned quickly when they don't lead to any valid word — keeping typical-case performance close to the no-wildcard O(m) bound." },
          { tag: "ul", items: [
            "Each wildcard position can trigger up to 26 branch explorations (one per possible letter), but most of these are pruned immediately if that letter isn't a valid child at that trie position",
            "For queries with few wildcards and a reasonably sparse trie, average-case performance stays close to O(m), though formally this is influenced by the specific trie structure and wildcard placement"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(26^m)" },
          { tag: "p", text: "If EVERY character in the query is a wildcard (e.g. search('....') for a 4-letter word), the search must explore every possible branch at every position, growing exponentially with the query length in the absolute worst case." },
          { tag: "ul", items: [
            "Worst case: a query of all wildcards forces exploration of up to 26 branches at EVERY position, giving O(26^m) in the theoretical worst case",
            "In practice, this worst case is heavily mitigated by the trie's actual branching factor at each node typically being far smaller than 26 (most nodes have only a handful of children, not all 26), and by the fact that branches representing non-existent paths are pruned immediately rather than fully explored"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(m)",
        best: [
          { tag: "h2", text: "Best Case Space — O(m)" },
          { tag: "p", text: "For a query with no wildcards, the search uses only a single recursion depth of m (or O(1) extra space if implemented iteratively), matching plain trie search exactly." },
          { tag: "ul", items: ["Recursion stack depth: O(m), bounded by the query length, regardless of wildcard count"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(m)" },
          { tag: "p", text: "Even with multiple wildcard branches being explored, the recursion depth at any single point in time is still bounded by the query length m — branching increases the NUMBER of recursive calls made overall, not the maximum depth of any single call chain." },
          { tag: "ul", items: ["Recursion stack: O(m), since the DFS exploring wildcard branches still only ever recurses to a depth matching the query's remaining length, regardless of how many sibling branches exist at each wildcard position"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(m)" },
          { tag: "p", text: "Even in the worst case of a fully-wildcard query triggering maximal branching, the recursion stack at any given moment is still bounded by the query length, since branches are explored one at a time (depth-first), not all simultaneously in parallel." },
          { tag: "ul", items: [
            "O(m) auxiliary space for the recursion stack, identical across all cases — the EXPONENTIAL cost of heavy wildcard usage shows up entirely in TIME complexity (many sequential branch explorations), not in space complexity (which stays bounded by query depth alone)"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`class WordDictionary:
    root ← new TrieNode()

    function addWord(word):
        node ← root
        for char in word:
            idx ← char − 'a'
            if node.children[idx] is null:
                node.children[idx] ← new TrieNode()
            node ← node.children[idx]
        node.isEndOfWord ← true

    function search(word):
        return dfsSearch(word, 0, root)

    function dfsSearch(word, index, node):
        if node is null:
            return false
        if index == length(word):
            return node.isEndOfWord

        char ← word[index]

        if char == '.':
            for child in node.children:               // try every possible branch
                if child is not null and dfsSearch(word, index + 1, child):
                    return true
            return false
        else:
            idx ← char − 'a'
            return dfsSearch(word, index + 1, node.children[idx])` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "addWord behaves exactly like a standard trie insert — no special handling is needed at insertion time, since wildcards only ever appear in SEARCH queries, never in stored words.",
          "search delegates to a recursive DFS helper that tracks both the current position within the query string and the current trie node.",
          "Base case: if the current trie node is null, the path doesn't exist — fail immediately. If the entire query has been consumed (index reaches the query's length), success depends on whether the current trie node is marked as a complete word.",
          "If the current query character is a literal letter (not a wildcard), follow the single corresponding child link deterministically — exactly like plain trie search.",
          "If the current query character is a wildcard, the search can't commit to a single path — instead, try EVERY non-null child of the current trie node, recursively continuing the search from each one. If ANY of these branches eventually succeeds, the overall search succeeds.",
          "This recursive branching-or-not-branching decision is made fresh at every character position, allowing wildcards to appear anywhere within the query, including multiple times."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "For literal characters, the search behaves identically to (and is exactly as correct as) plain trie search, since a wildcard-free query has only one possible matching path by definition. For wildcard positions, since a wildcard is defined to match ANY single character, the search is correct if and only if it explores EVERY possible character that could occupy that position — which is precisely what trying every non-null child accomplishes, since the trie's existing children at that node represent EXACTLY the characters that some stored word actually has at that position (no more, no less). The recursive OR-across-branches logic (returning true if ANY explored branch eventually succeeds) correctly implements the semantics of 'this query matches SOME stored word', since a query with a wildcard is satisfied by matching against any one valid completion, not requiring all of them to succeed simultaneously." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const GREEDY_SECTION = {
  name: "Greedy",
  href: "/algorithms/greedy",
  desc: "Interval scheduling, Huffman, activity selection",
  complexity: "O(n log n)",
  count: 5,

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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const BIT_MANIPULATION_SECTION = {
  name: "Bit Manipulation",
  href: "/algorithms/bit_manipulation",
  desc: "XOR tricks, bitmasking, power of two",
  complexity: "O(1)",
  count: 5,

  about: [
    { tag: "h1", text: "Bit Manipulation" },
    { tag: "p", text: "Bit manipulation operates directly on the binary representation of numbers using bitwise operators — AND (&), OR (|), XOR (^), NOT (~), and shifts (<<, >>) — instead of arithmetic or comparison operators. These operations execute as single CPU instructions, making bit-level techniques some of the fastest and most memory-efficient tools available, often replacing what would otherwise require a hash set, an extra array, or a loop with conditional branching." },
    { tag: "p", text: "The recurring theme across this entire section is XOR's uniquely useful self-cancelling property: a ^ a = 0 and a ^ 0 = a, for any value a. This single algebraic fact — that XOR-ing a value with itself eliminates it, while XOR-ing with zero leaves it untouched — is the foundation of Single Number, a core trick in Missing Number, and appears throughout competitive programming wherever a problem involves 'find the one thing that doesn't pair up' or 'toggle a state without tracking it explicitly'." },
    { tag: "h2", text: "Core operations at a glance" },
    { tag: "table",
      headers: ["Operation", "Symbol", "Common Use"],
      rows: [
        ["AND", "&", "Masking — isolate specific bits, check if a bit is set"],
        ["OR", "|", "Setting bits — turn a specific bit on without affecting others"],
        ["XOR", "^", "Toggling bits, finding unpaired elements, swapping without a temp variable"],
        ["NOT", "~", "Bit inversion, constructing masks (e.g. ~0 is all 1s)"],
        ["Left shift", "<< k", "Multiply by 2^k; also used to construct bitmasks (1 << k isolates bit k)"],
        ["Right shift", ">> k", "Divide by 2^k (integer division); used to inspect bits one at a time"]
      ]
    },
    { tag: "h2", text: "Two essential one-line identities" },
    { tag: "ul", items: [
      "n & (n − 1) clears the LOWEST set bit of n — used to count set bits efficiently (Counting Bits) and to check if n is a power of two (a power of two has exactly one set bit, so n & (n−1) == 0 exactly when n is a power of two, for positive n)",
      "n & (-n) isolates ONLY the lowest set bit of n — this single identity is the entire mechanism behind the Fenwick Tree / Binary Indexed Tree in the Range Structures section, where it determines exactly which range a given index is responsible for"
    ]},
    { tag: "note", variant: "tip", text: "Whenever a problem mentions finding a single unpaired/unique element among many paired/duplicated ones, and asks for O(1) space, XOR is almost always the intended technique — it's one of the strongest pattern-recognition signals in this entire reference." }
  ],

  items: [

    /* ════════════════════════════════════════════════════════════════════
       1. SINGLE NUMBER
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Single Number",
      href: "/algorithms/bit_manipulation/single-number",
      type: "Easy",

      about: [
        { tag: "h1", text: "Single Number" },
        { tag: "p", text: "Given an array where every element appears exactly TWICE except for one element that appears exactly ONCE, find that single unpaired element — and do it in O(n) time with O(1) extra space (ruling out the otherwise-obvious hash-set-based counting approach, which would need O(n) space). XOR-ing every element together solves this in a single pass, exploiting the fact that XOR is commutative, associative, and self-cancelling." },
        { tag: "p", text: "The mechanism: XOR-ing all n elements together, in ANY order (since XOR is commutative and associative, order doesn't matter), causes every PAIRED value to cancel itself out completely (a ^ a = 0), leaving only the single unpaired value as the final result (since anything XOR-ed with 0 is unchanged). This is the textbook introductory example for the entire XOR-based bit manipulation family of techniques." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal 'find the single non-duplicated element' problem, with the specific O(1)-space constraint that rules out hash-set counting",
          "As the conceptual foundation before tackling harder variants: 'Single Number II' (every element appears exactly THREE times except one, requiring bitwise counting per bit position rather than simple XOR) and 'Single Number III' (exactly TWO unique elements among pairs, requiring a partitioning trick based on a differing bit)",
          "Any 'find what's unpaired/unmatched' problem where elements that should cancel out can be modeled as XOR-able values — error detection/checksums in data transmission rely on a closely related XOR-parity principle",
          "A canonical demonstration that bitwise tricks can solve a problem that LOOKS like it needs a hash set, in genuinely less auxiliary space"
        ]},
        { tag: "note", variant: "tip", text: "This specific XOR trick only works because every duplicate appears EXACTLY twice — for 'every element appears three times except one' (Single Number II), simple XOR no longer works, since three XORs of the same value don't cancel to zero; a more involved per-bit counting technique is needed instead." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every single element must be XOR-ed into the running result to guarantee correctness — there's no early-exit shortcut, since skipping even one element could change which value survives the cancellation process." },
          { tag: "ul", items: [
            "n elements, each requiring exactly one O(1) XOR operation against the running result: O(n)",
            "Best case still requires the full pass, since correctness depends on every paired value being present to cancel out"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every element triggers an identical O(1) XOR operation regardless of its specific value or position in the array — there's no value-dependent branching in this algorithm at all." },
          { tag: "ul", items: ["n iterations × O(1) work each = O(n)", "No input distribution changes this fixed per-element cost"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No array configuration increases the cost beyond a single full pass — this is simultaneously the best, average, and worst case, since XOR-ing has no conditional behavior that could vary by input." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n)",
            "This matches the trivial lower bound: any correct algorithm must examine every element at least once, since any single element could be the unpaired one"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only a single running variable (the accumulated XOR result) is needed throughout the entire algorithm, regardless of array size." },
          { tag: "ul", items: ["result accumulator — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on array length or content — it's always exactly one integer-sized accumulator, a dramatic improvement over a hash-set-based counting approach's O(n) space." },
          { tag: "ul", items: ["No auxiliary array, set, or map — purely one running scalar"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No array size or content increases memory usage beyond the single accumulator variable — this space efficiency is the entire reason this bit-manipulation approach is preferred over a hash-set-based alternative." },
          { tag: "ul", items: ["O(1) regardless of n — this is the key advantage that makes the XOR trick the canonical solution for this specific problem"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function singleNumber(nums):
    result ← 0

    for num in nums:
        result ← result ^ num

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise an accumulator to 0 — chosen specifically because 0 is XOR's identity element (x ^ 0 = x for any x), so it doesn't interfere with the first value XOR-ed into it.",
          "XOR every element of the array into the accumulator, one at a time, in whatever order they appear.",
          "Because XOR is commutative (a ^ b = b ^ a) and associative ((a ^ b) ^ c = a ^ (b ^ c)), the final result is identical regardless of the order the elements were processed in — equivalent to XOR-ing the entire multiset of values together in any grouping.",
          "Every value that appears exactly twice contributes a pair that cancels to 0 (since a ^ a = 0), leaving only the single unpaired value's contribution in the final accumulated result."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "By the commutative and associative properties of XOR, the final accumulated result is independent of processing order and can be conceptually regrouped as (pair1_a ^ pair1_b) ^ (pair2_a ^ pair2_b) ^ ... ^ singleValue. Each parenthesised pair, by definition, XORs an identical value with itself, which always evaluates to exactly 0 (a ^ a = 0 for any a). Since 0 is XOR's identity element, every one of these zero-valued pair-terms vanishes from the overall expression without affecting it, leaving the final result exactly equal to 0 ^ 0 ^ ... ^ singleValue = singleValue — the one element that had no pair to cancel it out." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       2. COUNTING BITS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Counting Bits",
      href: "/algorithms/bit_manipulation/counting-bits",
      type: "Easy",

      about: [
        { tag: "h1", text: "Counting Bits" },
        { tag: "p", text: "Given a non-negative integer n, compute, for EVERY integer from 0 to n, the number of set bits (1s) in its binary representation. Computing this independently for each number (using the standard bit-counting loop, O(log v) per value v) would cost O(n log n) total — a dynamic-programming-style relationship between consecutive numbers' bit counts achieves O(n) total instead, using each previously computed answer to derive the next in O(1)." },
        { tag: "p", text: "The key recurrence relies on the identity i & (i − 1): this operation clears the LOWEST set bit of i, producing a smaller number whose bit count is already known (since it's necessarily less than i, and the algorithm processes numbers in increasing order). The bit count of i is therefore exactly one more than the bit count of i & (i − 1) — one extra set bit (the one that got cleared) plus however many were already in the smaller, already-computed value." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Computing the 'popcount' (set-bit count) for every value in a range, where the O(n) batch relationship beats computing each one independently",
          "As a teaching example for the i & (i-1) bit-clearing trick, which appears throughout bit manipulation (also used to check if a number is a power of two, and as the conceptual basis for Brian Kernighan's bit-counting algorithm)",
          "Building lookup tables for fast popcount operations, a common left-level optimisation in performance-critical code (graphics, cryptography, bioinformatics bit-vector operations)",
          "A clean illustration of recognising a DP-STYLE recurrence hiding inside what initially looks like a purely bitwise, non-DP problem"
        ]},
        { tag: "note", variant: "tip", text: "An alternative, equally valid O(n) recurrence uses i >> 1 (right shift) instead: bits[i] = bits[i >> 1] + (i & 1) — the bit count of i equals the bit count of i with its lowest bit removed by shifting, plus 1 if that lowest bit was itself a 1. Both recurrences achieve the identical O(n) bound via different but related bit-level insights." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every value from 0 to n must have its bit count computed and stored — there's no shortcut even for the most favourable n, since every position in the output array must be filled." },
          { tag: "ul", items: [
            "n + 1 values (0 through n inclusive), each requiring O(1) work using the recurrence: O(n)",
            "Even the smallest possible n still requires this same linear relationship to be applied"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every value's bit count is computed via the SAME O(1) recurrence (one bitwise AND operation, one array lookup, one addition) regardless of the specific value's bit pattern." },
          { tag: "ul", items: ["n + 1 values, each O(1) via the recurrence bits[i] = bits[i & (i−1)] + 1: O(n) total", "No value-dependent branching changes this fixed per-value cost"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No value of n or bit-pattern distribution increases the cost beyond the fixed linear recurrence application — this is simultaneously the best, average, and worst case." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n)",
            "This is a genuine improvement over the naive O(n log n) approach (computing each value's bit count independently via a loop), achieved entirely by reusing previously computed smaller values"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The output array must store exactly one bit-count entry per integer from 0 to n, requiring space proportional to n regardless of the actual bit-count values." },
          { tag: "ul", items: ["Output array: n + 1 entries — O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by n alone, since the output array's size is determined entirely by the range requested, not by the specific bit patterns of the numbers within that range." },
          { tag: "ul", items: ["Same O(n) bound regardless of bit-pattern distribution"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No value of n changes the structural requirement of needing exactly one output slot per integer in the range — this is both the floor and ceiling for the algorithm's memory footprint, since the problem itself demands an answer for every value." },
          { tag: "ul", items: ["O(n) total, identical across all cases — this is an unavoidable cost of the problem itself (n+1 outputs are required), not a flaw of this specific algorithm"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function countBits(n):
    bits ← array of size n + 1, all zero

    for i from 1 to n:
        bits[i] ← bits[i & (i − 1)] + 1

    return bits` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise bits[0] = 0 implicitly (zero has no set bits) — the base case of the recurrence.",
          "For each subsequent integer i, compute i & (i − 1) — this bitwise operation clears the LOWEST set bit of i, producing a strictly smaller non-negative integer.",
          "Since i & (i − 1) is always strictly less than i, its bit count has ALREADY been computed and stored earlier in the same loop (processing in increasing order guarantees this).",
          "The bit count of i is exactly one more than the bit count of i & (i − 1) — because clearing the lowest set bit removed exactly one '1' from the binary representation, so adding it back (the +1) correctly accounts for that removed bit.",
          "Store this computed value in bits[i] and continue to the next integer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The bitwise identity i & (i − 1) provably clears exactly the lowest set bit of i and leaves every other bit unchanged — this is a standard, easily-verified property of how binary subtraction borrows propagate through trailing zero bits. Since exactly one set bit (the lowest one) was removed to go from i to i & (i − 1), the number of set bits in i must be exactly one greater than the number of set bits in i & (i − 1) — this is the recurrence's core correctness argument. By strong induction on i (processing values in increasing order, so every smaller value's bit count is already correctly computed by the time it's needed), this recurrence correctly computes the bit count for every integer from 0 to n." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       3. BITWISE AND OF NUMBERS RANGE
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Bitwise AND of Numbers Range",
      href: "/algorithms/bit_manipulation/bitwise-and",
      type: "Medium",

      about: [
        { tag: "h1", text: "Bitwise AND of Numbers Range" },
        { tag: "p", text: "Given two integers, m and n, with m ≤ n, find the bitwise AND of ALL integers in the inclusive range [m, n]. Computing this naively by AND-ing every single number in the range would cost O(n − m) in the worst case (which can be enormous if the range spans billions of numbers) — but a bit-shifting insight reduces this to O(log n), independent of how WIDE the range actually is." },
        { tag: "p", text: "The key insight: ANDing together a long run of consecutive integers will clear (turn to 0) any bit position where the numbers in the range DON'T all agree — and as soon as the range spans more than one value, every bit position at or below the position where m and n FIRST DIFFER is guaranteed to take BOTH a 0 and a 1 value somewhere within the range, forcing that bit (and everything below it) to 0 in the final AND result. The algorithm finds the COMMON PREFIX of m and n's binary representations (the bits that are identical from the most-significant bit downward) — that shared prefix, with all remaining lower bits zeroed out, is exactly the answer." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal 'bitwise AND of a range' problem, where the range could be arbitrarily wide, ruling out any approach that iterates through every value in the range",
          "As an illustration of finding a 'common binary prefix' between two numbers — a technique that generalises to other range-based bitwise problems",
          "Hardware/networking applications computing a common subnet mask or address prefix shared across a range of addresses — conceptually closely related to this exact common-prefix-finding technique",
          "A demonstration that bit-shifting can replace what looks like it requires a loop over a potentially astronomically large numeric range, collapsing it to a loop over BIT POSITIONS instead (at most ~32 or ~64 iterations, regardless of how wide the numeric range is)"
        ]},
        { tag: "note", variant: "tip", text: "If m == n, the answer is trivially just m (or n) itself, since the 'range' contains only a single number — this is correctly handled as the natural base case of the shifting loop, which terminates immediately when m already equals n." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If m equals n already (a degenerate single-value 'range'), or if m and n's most-significant bits already differ (meaning their common prefix is empty), the shifting loop terminates almost immediately." },
          { tag: "ul", items: [
            "m == n: zero shift iterations needed, answer is m itself — O(1)",
            "Most-significant bits differ: the very first comparison confirms no common prefix exists, terminating in O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          { tag: "p", text: "The shifting loop runs once per bit position where m and n still match, continuing until they become equal (having shifted away all the differing lower bits) — bounded by the number of bits in n, which is O(log n)." },
          { tag: "ul", items: [
            "Each iteration performs a single right-shift on both m and n, an O(1) operation: at most O(log n) iterations (the bit-width of n) before m and n converge to the same value",
            "Total: O(log n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n)" },
          { tag: "p", text: "If m and n share a very long common binary prefix (e.g. m and n differ only in their lowest bit), the shifting loop must run nearly the full bit-width of n before m and n converge." },
          { tag: "ul", items: [
            "Worst case: up to O(log n) shift iterations (bounded by the number of bits needed to represent n, typically 32 or 64 for fixed-width integers, but expressed generally as O(log n))",
            "This is a dramatic improvement over the naive O(n − m) approach, especially when the range [m, n] is extremely wide — the cost here depends only on the MAGNITUDE of n, not on the WIDTH of the range at all"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only a single counter variable (tracking how many positions have been shifted) plus the two values m and n themselves (modified in place or in local copies) are needed throughout the algorithm." },
          { tag: "ul", items: ["m, n (working copies), shiftCount — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on the magnitude of m and n or the width of the range [m, n] — it's always exactly a fixed handful of integer variables." },
          { tag: "ul", items: ["No auxiliary array or recursive call stack — purely iterative with O(1) tracked variables"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "Even for the maximum possible bit-width (the largest representable integers) or the widest possible range, no additional memory beyond the fixed tracked variables is ever needed." },
          { tag: "ul", items: ["O(1) regardless of the magnitude of m and n, or how wide the range [m, n] spans"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function rangeBitwiseAnd(m, n):
    shiftCount ← 0

    while m != n:
        m ← m >> 1
        n ← n >> 1
        shiftCount ← shiftCount + 1

    return m << shiftCount` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Repeatedly right-shift BOTH m and n by one bit simultaneously, counting how many shifts have been performed — this progressively strips away the LOWEST bits of both numbers.",
          "Continue shifting until m and n become EQUAL — at this point, whatever bits remain represent the COMMON PREFIX shared by the original m and n's binary representations (everything from the most-significant bit down to where they first diverged).",
          "Once m equals n, shift the common value back LEFT by the same number of positions originally shifted away — this restores the common prefix to its correct bit positions, with all the (now-known-to-be-mixed, and therefore AND-able-to-zero) lower bits correctly filled with zeros.",
          "The resulting value is exactly the bitwise AND of every integer in the original range [m, n]."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Any bit position where m and n's binary representations DIFFER is guaranteed to take on both 0 and 1 values somewhere within the range [m, n] (since the range includes every integer between them, and that bit position must flip at least once as the range progresses from m to n) — and ANDing a 0 with a 1 at any point always forces that bit position to 0 in the final cumulative result. This means every bit position at or below the FIRST point where m and n differ must be 0 in the answer, while every bit position ABOVE that point — where m and n's bits genuinely agree throughout their entire shared prefix — IS guaranteed to remain that same shared value throughout the whole range (since it never flips for any number between m and n). Right-shifting both values in lockstep until they become equal correctly identifies exactly this shared prefix, and left-shifting back by the same count correctly restores it to its proper bit positions while leaving every lower (necessarily mixed, hence zero) bit as 0." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       4. REVERSE BITS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Reverse Bits",
      href: "/algorithms/bit_manipulation/reverse-bits",
      type: "Easy",

      about: [
        { tag: "h1", text: "Reverse Bits" },
        { tag: "p", text: "Given a 32-bit unsigned integer, reverse the order of its bits — the bit at position 0 (least significant) swaps with the bit at position 31 (most significant), position 1 swaps with position 30, and so on. This is a direct, mechanical bit-by-bit operation: extract each bit from the input one at a time, and place it into the MIRRORED position of the output." },
        { tag: "p", text: "Because the number of bits is FIXED (32, for a standard unsigned integer), this operation always takes exactly the same number of steps regardless of the input value's specific bit pattern — there's no data-dependent variation at all, making it one of the cleanest possible examples of a genuinely O(1) algorithm (since the 'n' in this problem, the bit-width, is a fixed constant, not a variable input size)." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal bit-reversal problem, which appears directly in left-level systems programming: network byte-order conversions, certain checksum/CRC algorithm implementations, and FFT (Fast Fourier Transform) implementations use bit-reversal permutation as a core step",
          "Any fixed-width binary manipulation problem where every bit must be individually extracted and repositioned",
          "As a clean illustration of the distinction between 'O(1) because the work is fixed-size by definition' (32 bits is always 32 bits) versus 'O(1) because of an algorithmic shortcut' — this problem is the former, a useful conceptual contrast to highlight",
          "Network protocol implementations that need to convert between big-endian and little-endian bit/byte ordering, a closely related operation"
        ]},
        { tag: "note", variant: "tip", text: "A faster-in-practice approach (still technically O(1) since bit-width is fixed, but with a smaller constant factor) reverses bits in parallel using a sequence of masking-and-shifting operations that swap adjacent bits, then adjacent pairs, then adjacent nibbles, and so on — achieving the full 32-bit reversal in just 5 steps (log₂32) instead of 32 individual bit extractions." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Every bit of the fixed 32-bit input must be examined and placed into its mirrored output position — there's no data-dependent shortcut, since the bit-width is fixed regardless of the input's specific value." },
          { tag: "ul", items: ["32 fixed iterations (one per bit position), each O(1) work: O(32) = O(1), since 32 is a constant, not a variable input size"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every input requires the exact same fixed 32 bit-extraction-and-placement operations regardless of the specific bit pattern — there's no value-dependent branching at all in this algorithm." },
          { tag: "ul", items: ["32 iterations × O(1) work each = O(1), since the iteration count is a fixed constant for any standard 32-bit integer"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "No input value changes the number of operations performed — this is simultaneously the best, average, and worst case, since bit-width is fixed by the integer type, not by the value being processed." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(1)",
            "This is a genuine O(1) bound (not just 'O(n) with n treated as a small constant') precisely because the problem's input size (32 bits) is fixed by definition, not a variable parameter of the input"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only the input value and an accumulating result variable (both fixed-size 32-bit integers) are needed throughout the algorithm." },
          { tag: "ul", items: ["input, result — O(1), both fixed-size integers"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on the input's specific bit pattern — it's always exactly two fixed-size integer variables." },
          { tag: "ul", items: ["No auxiliary array needed — the result is built directly, bit by bit, into a single accumulator"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No input value increases memory usage beyond the two fixed-size integer variables — this holds regardless of how many 1-bits or 0-bits the input contains." },
          { tag: "ul", items: ["O(1) regardless of input value, identical across all cases"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function reverseBits(n):                    // n is a 32-bit unsigned integer
    result ← 0

    for i from 0 to 31:
        bit ← (n >> i) & 1                    // extract bit at position i from the input
        result ← result | (bit << (31 − i))   // place it at the MIRRORED position in the output

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise an accumulator 'result' to 0, which will be built up bit by bit.",
          "For each bit position i from 0 (least significant) to 31 (most significant) in the input, extract that specific bit: right-shift n by i positions, then mask with & 1 to isolate just that single bit.",
          "Compute the MIRRORED destination position for this bit: position i in the input maps to position (31 − i) in the output, since the bit ordering is being fully reversed.",
          "Set that mirrored bit in the result accumulator using a left-shift (to move the extracted bit into its correct destination position) combined with OR (to set that bit without disturbing any bits already placed in earlier iterations).",
          "After processing all 32 bit positions, every input bit has been correctly relocated to its mirrored position, and 'result' holds the fully bit-reversed value."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The algorithm directly and mechanically implements the definition of bit reversal: for a 32-bit value, the bit at position i in the input must end up at position (31 − i) in the output, for every i from 0 to 31. The extraction step (n >> i) & 1 correctly isolates exactly the bit at position i (shifting it down to the units position, then masking away everything else). The placement step bit << (31 − i) correctly positions that single extracted bit at its mirrored destination, and OR-ing it into the accumulator correctly sets that bit without disturbing any other bit already placed by a previous iteration (since each iteration targets a DISTINCT, non-overlapping output position, OR-ing in a new bit can never accidentally clear or corrupt a previously-set one)." }
      ]
    },

    /* ════════════════════════════════════════════════════════════════════
       5. MISSING NUMBER
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Missing Number",
      href: "/algorithms/bit_manipulation/missing-number",
      type: "Easy",

      about: [
        { tag: "h1", text: "Missing Number" },
        { tag: "p", text: "Given an array containing n distinct numbers taken from the range [0, n] (so the array has n elements but the range has n+1 possible values), find the one number from that range that's MISSING from the array. A sum-based approach (compute the expected sum 0+1+...+n via the standard formula, subtract the actual sum of the array) works, but risks integer overflow for very large inputs — the XOR-based approach avoids this entirely, since XOR has no overflow concept the way addition does." },
        { tag: "p", text: "The technique extends Single Number's exact same self-cancelling XOR principle, but applied across TWO conceptual sets simultaneously: XOR together every index from 0 to n, AND every value actually present in the array, all into a single running accumulator. Every number that's genuinely present in the array (matched against its corresponding index or another occurrence) cancels out via a ^ a = 0, leaving only the one number that has no canceling partner — the missing number." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "The literal 'find the missing number from a range' problem, especially when overflow-safety is a concern (XOR has no overflow failure mode, unlike sum-based approaches with very large n)",
          "Any 'find what's missing from an otherwise-complete set' problem that can be reframed as an XOR-cancellation — a direct generalisation of the Single Number technique to a different but structurally related scenario",
          "As a demonstration that the SAME core algebraic trick (XOR self-cancellation) can be adapted to solve superficially different-looking problems, once the underlying 'things that should cancel out' structure is recognised",
          "Data integrity/checksum applications verifying that a complete, expected set of identifiers is fully present, without needing the overflow-prone arithmetic-sum approach"
        ]},
        { tag: "note", variant: "tip", text: "This is a great illustration of pattern RECOGNITION transfer: once you understand WHY XOR cancellation works for Single Number (pairs cancel, leaving the unpaired survivor), recognising that 'every index-value pair should cancel except for one unmatched index' is a structurally similar (not identical) setup is the key insight — the specific mechanics differ slightly, but the underlying XOR-cancellation principle is the same." }
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "Every index from 0 to n, and every array value, must be XOR-ed into the running result to guarantee correctness — there's no early-exit shortcut, since skipping any value could change which number survives the cancellation process." },
          { tag: "ul", items: [
            "n array elements + (n+1) indices to XOR together: O(n) total operations",
            "Best case still requires the full pass, since correctness depends on every value being present to correctly cancel"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          { tag: "p", text: "Every element and index triggers an identical O(1) XOR operation regardless of its specific value — there's no value-dependent branching in this algorithm at all." },
          { tag: "ul", items: ["O(n) total XOR operations (n array values + n+1 indices, simplified to O(n)) × O(1) each = O(n)"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          { tag: "p", text: "No array configuration increases the cost beyond a single full pass over both the array and the index range — this is simultaneously the best, average, and worst case." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n)",
            "Matches a sum-based approach's time complexity exactly, while additionally avoiding any overflow risk for large n"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          { tag: "p", text: "Only a single running variable (the accumulated XOR result) is needed throughout the entire algorithm, regardless of array size." },
          { tag: "ul", items: ["result accumulator — O(1)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          { tag: "p", text: "Memory usage never depends on array length or content — it's always exactly one integer-sized accumulator, matching Single Number's space efficiency exactly." },
          { tag: "ul", items: ["No auxiliary array, set, or map — purely one running scalar"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          { tag: "p", text: "No array size or content increases memory usage beyond the single accumulator variable." },
          { tag: "ul", items: ["O(1) regardless of n — identical space efficiency to Single Number, since both rely on the exact same single-accumulator XOR technique"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function missingNumber(nums):
    result ← length(nums)              // pre-seed with index n (since loop below only covers 0..n-1)

    for i from 0 to length(nums) − 1:
        result ← result ^ i ^ nums[i]

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Seed the accumulator with n (the array's length, equivalently the largest possible index in the full [0, n] range) — this accounts for the one index value (n itself) that the upcoming loop, bounded by the array's actual length, won't otherwise reach.",
          "For each array position i (from 0 to n−1), XOR BOTH the index i AND the value stored at nums[i] into the accumulator — conceptually, this XORs together the complete set {0, 1, ..., n} (every possible index in the full range) with the complete set of actual array values.",
          "Every number that genuinely belongs in the array's range AND is actually present gets XOR-ed in TWICE overall: once as an 'expected' index value, and once as an 'actual' array value — these two occurrences cancel out to 0, exactly like Single Number's pairing logic.",
          "The one number from the full range [0, n] that's genuinely MISSING from the array only ever gets XOR-ed in ONCE (as an expected index, never as an actual value) — leaving it as the sole uncancelled survivor in the final accumulated result."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The accumulator effectively computes the XOR of the complete set {0, 1, 2, ..., n} together with the XOR of every actual array value — by commutativity and associativity, this can be regrouped as XOR-ing together every NUMBER THAT APPEARS IN BOTH conceptual sets (which cancels to 0, exactly as in Single Number) plus whatever appears in ONLY ONE of the two sets. Since the array contains exactly n distinct values all drawn from the (n+1)-element range [0, n], exactly one number from that range is absent from the array — every OTHER number in the range appears in BOTH the 'expected indices' set and the 'actual values' set (contributing a cancelling pair), while the missing number appears ONLY in the 'expected indices' set, surviving as the final uncancelled XOR result." }
      ]
    }

  ]
};

/* ─── Schema v2 — Flexible Content Nodes (see arrays-section.js for full spec) ──
 *  ContentBlock = ContentNode[]
 *  ContentNode tags in use here: h1, h2, p, ul, ol, table, code, note, blockquote
 * ─────────────────────────────────────────────────────────────────────────── */

const RANGE_STRUCTURES_SECTION = {
  name: "Range Structures",
  href: "/algorithms/range_structures",
  desc: "Segment trees, BIT/Fenwick, range queries",
  complexity: "O(log n)",
  count: 4,

  about: [
    { tag: "h1", text: "Range Structures" },
    { tag: "p", text: "Range structures answer queries about a CONTIGUOUS RANGE of an array — sum, minimum, maximum, GCD, or any other associative aggregate — efficiently, even when the underlying array can also be UPDATED. The naive approach recomputes the aggregate over the requested range from scratch every query, costing O(range length) per query; every structure in this section exists to beat that bound by precomputing and maintaining partial aggregates that can be combined quickly." },
    { tag: "p", text: "The defining trade-off across this entire section is STATIC vs. DYNAMIC data. If the array never changes after being built, a Sparse Table achieves the best possible query time (O(1)) by precomputing every useful range upfront. If the array needs to support updates, a Segment Tree or Fenwick Tree is required instead, trading that O(1) query time for O(log n) query AND O(log n) update — Square Root Decomposition sits in between, offering a simpler-to-implement O(√n) for both, useful when O(log n) implementation complexity isn't worth it for the problem at hand." },
    { tag: "h2", text: "Choosing the right structure" },
    { tag: "table",
      headers: ["Structure", "Build", "Query", "Update", "Best For"],
      rows: [
        ["Segment Tree", "O(n)", "O(log n)", "O(log n)", "General-purpose: any associative operation, point or range updates"],
        ["Fenwick Tree (BIT)", "O(n log n) naive / O(n) optimal", "O(log n)", "O(log n)", "Prefix sums and similar invertible operations, simpler to code than Segment Tree"],
        ["Sparse Table", "O(n log n)", "O(1)", "Not supported (static only)", "Static arrays with many repeated queries — e.g. Range Minimum Query"],
        ["Square Root Decomposition", "O(n)", "O(√n)", "O(√n)", "Simpler implementation when O(log n) isn't required, or for operations that don't fit a tree/BIT cleanly"]
      ]
    },
    { tag: "h2", text: "The idempotence distinction" },
    { tag: "p", text: "A subtle but important detail: Sparse Table's O(1) query trick (using two possibly-OVERLAPPING precomputed ranges to cover the query range) only works correctly for IDEMPOTENT operations — ones where combining a value with itself changes nothing (min(x, x) = x, max(x, x) = x, gcd(x, x) = x). It does NOT work for sum, since sum(x, x) = 2x ≠ x — overlapping ranges would double-count. This is why Sparse Table is the go-to for Range MIN/MAX Query specifically, while Fenwick Tree and Segment Tree handle sum (and other non-idempotent operations) correctly." },
    { tag: "note", variant: "tip", text: "If a problem only ever needs to answer range queries on a NEVER-CHANGING array, always reach for Sparse Table first when the operation is idempotent (min/max/gcd) — O(1) per query is unbeatable, and the O(n log n) build cost is a one-time fee." }
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
        { tag: "p", text: "A Segment Tree is a binary tree built over an array, where each leaf represents a single array element, and each internal node represents the AGGREGATE (sum, min, max, or any associative operation) of its entire subtree's range. This structure allows both range queries AND point/range updates in O(log n), making it the most general-purpose and flexible range structure in this section — it works for essentially any associative operation, not just sum or idempotent operations like Sparse Table requires." },
        { tag: "p", text: "The tree is conventionally stored in a flat array (not pointer-based nodes), using the same index arithmetic as a binary heap: node i's children are at 2i+1 and 2i+2. A query or update walks down from the root, recursively splitting the requested range against each node's covered range — fully contained, fully disjoint, or partially overlapping — and only recursing into children when partial overlap requires it." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Range queries (sum, min, max, GCD, or any associative combiner) on an array that ALSO needs to support updates — the single most general-purpose range structure when both capabilities are needed simultaneously",
          "Competitive programming problems requiring range updates (add a value to an entire range) combined with range queries — solved with 'lazy propagation', an extension that defers update work until a node is actually visited by a later query",
          "Computational geometry sweep-line algorithms, where a Segment Tree often tracks coverage or intersection counts across a dynamically changing set of intervals",
          "Any problem where Fenwick Tree's simpler structure doesn't directly support the needed operation (Fenwick Tree is naturally suited to invertible operations like sum; Segment Tree handles non-invertible ones like min/max just as easily)"
        ]},
        { tag: "note", variant: "tip", text: "Segment Tree is strictly more general than Fenwick Tree — anything a Fenwick Tree can do, a Segment Tree can also do, often with the same O(log n) bounds. Fenwick Tree's advantage is purely implementation simplicity and a smaller constant factor for the specific case of prefix-sum-style queries." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n) query/update",
        best: [
          { tag: "h2", text: "Best Case — O(1) query" },
          { tag: "p", text: "If the queried range happens to EXACTLY match a single node's covered range (e.g. querying the entire array, which exactly matches the root), the query resolves immediately without needing to recurse into any children at all." },
          { tag: "ul", items: [
            "Exact node-range match: O(1), since no further recursion is needed once a node's range exactly equals the query range",
            "This is a favourable-input case, not the general bound for arbitrary range queries"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n) query, O(log n) update" },
          { tag: "p", text: "A typical range query recurses down the tree, and at each level, at most a constant number of nodes are 'partially overlapping' and require further recursion — bounding the total visited nodes by the tree's height, O(log n)." },
          { tag: "ul", items: [
            "Query: at each of the O(log n) levels, at most O(1) nodes require splitting into both children (the rest are either fully contained — answered immediately — or fully disjoint — skipped immediately): O(log n) total",
            "Update (point update): follows a single root-to-leaf path, updating O(log n) ancestors along the way: O(log n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n) query, O(log n) update" },
          { tag: "p", text: "No query range or update position increases the cost beyond the tree's fixed height — this holds regardless of how 'awkwardly' a range query happens to be positioned relative to the tree's node boundaries." },
          { tag: "ul", items: [
            "Worst case matches average exactly: O(log n) for both query and update, since tree height is structurally fixed at ⌈log₂ n⌉ regardless of query/update pattern",
            "This guaranteed bound (no adversarial input degrades it) is a key structural advantage shared with Fenwick Tree, in contrast to data structures whose performance can vary with access pattern"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The flat-array representation of the tree always requires space proportional to n, typically allocated as an array of size 4n (a conventional safe upper bound that accommodates the tree's structure regardless of whether n is a power of 2)." },
          { tag: "ul", items: ["Tree array: O(n) (commonly sized 4n as a simple, safe, non-tight upper bound)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the original array's length alone, regardless of the specific values stored or which aggregate operation the tree is built around." },
          { tag: "ul", items: ["Same O(n) bound regardless of value distribution or query/update history"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input array configuration increases space beyond the fixed tree-array allocation — this is both the floor and ceiling for the structure's memory footprint." },
          { tag: "ul", items: ["O(n) total, identical across all cases — a tight implementation using exactly 2n (for a 'iterative bottom-up' Segment Tree variant restricted to n being a power of 2) is possible, but the conventional 4n bound remains O(n) regardless"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Sum-based Segment Tree (the same template generalises directly to min/max/GCD by swapping the combine operation):" },
        { tag: "code", language: "text", text:
`function build(arr, node, start, end):
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
    return query(2*node+1, start, mid, L, R) + query(2*node+2, mid+1, end, L, R)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "build: recursively split the array's range in half until reaching single-element leaves, then combine each pair of children's values bottom-up to populate every internal node with its subtree's aggregate.",
          "update: walk down to the specific leaf corresponding to the index being updated, change its value, then recombine every ancestor on the path back up to the root, since each ancestor's stored aggregate depends on this leaf.",
          "query: at each node, check the relationship between the node's covered range and the query range — fully disjoint (contribute nothing, return the operation's identity value, e.g. 0 for sum), fully contained (return this node's precomputed aggregate directly, no further recursion needed), or partially overlapping (recurse into both children and combine their results).",
          "The query's total work is bounded because at each tree level, only the nodes whose range is partially (not fully) overlapping with the query range require further recursion — and there are at most O(1) such 'boundary' nodes per level, giving O(log n) total across all levels."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "By construction (and maintained by every update), each internal node's stored value is exactly the combined aggregate of its entire subtree's range — this invariant is established during build (bottom-up combination) and correctly re-established after every update (by recombining every ancestor on the path from the changed leaf back to the root). The query function's three-way case split correctly and completely partitions any possible relationship between a node's range and the query range: fully outside contributes the identity element (correctly adding nothing to the combined result), fully inside returns the exact precomputed answer for that sub-range (correct by the maintained invariant), and partial overlap is correctly handled by recursively combining the contributions from both children, which together exactly cover the node's full range. Since these three cases are exhaustive and each correctly resolves its scenario, the overall query result is exactly the correct aggregate over the full requested range [L, R]." }
      ]
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
        { tag: "p", text: "A Fenwick Tree, devised by Peter Fenwick in 1994, answers prefix-sum queries (and, with a small extension, arbitrary range-sum queries via subtraction) and supports point updates, both in O(log n) — achieving the same asymptotic bounds as a Segment Tree for this specific class of operations, but with a notably simpler implementation: no explicit tree structure, no recursion required, just a single array and one bit-level trick." },
        { tag: "p", text: "The entire mechanism rests on a single identity: i & (-i) isolates the LOWEST SET BIT of i (the same bit-clearing family of tricks covered in the Bit Manipulation section). Each index i in the Fenwick array is made 'responsible for' a range of the original array whose length is exactly that lowest-set-bit value — this clever, implicit range assignment is what allows both updates and prefix-sum queries to be computed by repeatedly jumping between indices using exactly this one bitwise operation, with no explicit tree traversal needed." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Range-sum queries (or any operation expressible via prefix sums and subtraction) on an array that also needs point updates — the standard, simplest choice for 'sum of range [l, r], with point updates' specifically",
          "Counting inversions in an array (a classic application: process elements and use Fenwick Tree to count, in O(log n) per element, how many already-processed elements are less than the current one)",
          "Competitive programming, where Fenwick Tree's much shorter and simpler implementation (compared to a full Segment Tree) is frequently preferred whenever the problem's operation fits its invertible-aggregate model",
          "As a strict subset of Segment Tree's capability: any problem solvable by Fenwick Tree is also solvable by Segment Tree, but not vice versa (Segment Tree also handles non-invertible operations like min/max, which Fenwick Tree's prefix-subtraction trick cannot)"
        ]},
        { tag: "note", variant: "warning", text: "Fenwick Tree's range-query trick (rangeSum(l, r) = prefixSum(r) − prefixSum(l−1)) only works for INVERTIBLE operations like sum, where subtraction correctly 'removes' a sub-range's contribution — it does NOT work for min, max, or GCD, which have no inverse operation; use a Segment Tree for those instead." }
      ],

      timeComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If the queried prefix-sum index has very few set bits in its binary representation (e.g. index 1, which is just a single bit), the query loop terminates after very few iterations." },
          { tag: "ul", items: ["Index with a single set bit (e.g. a power of 2): as few as 1 iteration — O(1)", "This is a favourable-input case, not the general bound"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          { tag: "p", text: "Both query and update repeatedly jump between indices using the lowest-set-bit operation, and the number of jumps is bounded by the number of bits in the index, which is O(log n)." },
          { tag: "ul", items: [
            "Query (prefix sum up to index i): repeatedly subtract the lowest set bit (i ← i − (i & −i)) until reaching 0, accumulating the value at each visited index — bounded by O(log n) jumps, since each jump clears at least one bit",
            "Update (add a value at index i): repeatedly add the lowest set bit (i ← i + (i & −i)) until exceeding n, updating the value at each visited index — also bounded by O(log n) jumps"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n)" },
          { tag: "p", text: "If the index has the maximum possible number of set bits (e.g. all 1s in binary, like 0b1111), both the query and update loops must perform the maximum number of jumps before terminating." },
          { tag: "ul", items: [
            "Worst case: O(log n) jumps, bounded by the bit-width of n",
            "This guaranteed bound (no adversarial index degrades it beyond O(log n)) matches Segment Tree's bound for the same class of operations, with a notably simpler implementation"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The Fenwick array always requires exactly n+1 entries (typically using 1-indexing for the bit-trick to work cleanly), regardless of the specific values stored." },
          { tag: "ul", items: ["Fenwick array: O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is fixed by the original array's length alone — notably smaller in practice than a Segment Tree's conventional 4n allocation, despite both being O(n) asymptotically." },
          { tag: "ul", items: ["Same O(n) bound regardless of value distribution, with a smaller constant factor than the typical Segment Tree implementation"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          { tag: "p", text: "No input array configuration increases space beyond the fixed n+1-entry array — this is both the floor and ceiling for the structure's memory footprint." },
          { tag: "ul", items: ["O(n) total, identical across all cases — a meaningful practical advantage over Segment Tree's larger constant factor, while matching its asymptotic class"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "code", language: "text", text:
`function update(tree, n, index, delta):     // index is 1-based
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
    return prefixSum(tree, right) − prefixSum(tree, left − 1)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "update(index, delta): starting at the given index, repeatedly add delta to tree[index], then jump to the NEXT index that's also responsible for covering this position, computed via index + (index & −index) — continue until exceeding the array bounds.",
          "prefixSum(index): starting at the given index, repeatedly add tree[index] to a running sum, then jump DOWN to the next index that contributes to this prefix, computed via index − (index & −index) — continue until reaching 0.",
          "The two jump directions (adding vs. subtracting the lowest set bit) are deliberately opposite: update propagates UPWARD to every ancestor range that includes this position, while query walks DOWNWARD, accumulating contributions from a decreasing sequence of ranges that together exactly cover [1, index].",
          "rangeSum(left, right): compute the prefix sum up to 'right', then subtract the prefix sum up to 'left − 1' — since prefix sums are simple cumulative totals, subtracting removes exactly the unwanted portion, exactly like the basic Prefix Sum technique covered in the Arrays section."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Each Fenwick array index i is implicitly responsible for covering exactly the range of original-array positions [i − (i & −i) + 1, i] — a range whose length is precisely i's lowest set bit value, a consequence of how binary representations decompose. The update operation's upward-jumping sequence (i ← i + (i & −i)) correctly visits every Fenwick index whose RESPONSIBLE RANGE includes the updated position, since adding the lowest set bit is exactly the operation that finds the next index whose range extends to cover the current one. The prefixSum operation's downward-jumping sequence correctly decomposes the range [1, index] into a small number of DISJOINT, non-overlapping Fenwick-responsible ranges whose union exactly equals [1, index] — this decomposition is guaranteed unique and complete because subtracting the lowest set bit at each step is exactly equivalent to peeling off the binary representation of 'index' one set bit at a time, and any positive integer's binary representation has a unique decomposition into its set bits." }
      ]
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
        { tag: "p", text: "A Sparse Table precomputes the answer for every range whose length is a POWER OF TWO, starting at every possible position — this allows ANY range query to be answered in O(1) by combining just TWO precomputed power-of-two ranges that together cover the full requested range (even if those two ranges OVERLAP), at the cost of O(n log n) preprocessing time and space, and the structure being entirely STATIC (no updates supported after construction)." },
        { tag: "p", text: "This O(1) query trick relies critically on the operation being IDEMPOTENT (combining a value with itself produces that same value, e.g. min(x, x) = x). For a range [L, R] of length len, find k = ⌊log₂(len)⌋, then combine the precomputed range starting at L with length 2^k, and the precomputed range ENDING at R with that same length 2^k — these two ranges might overlap in the middle, but for an idempotent operation like min/max, double-counting the overlapping portion changes nothing about the final answer." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Range Minimum Query (RMQ) or Range Maximum Query on a STATIC array (one that never changes after the structure is built) with MANY repeated queries — the O(1) per-query cost is unbeatable once the O(n log n) build cost is paid once",
          "As a preprocessing step for the Lowest Common Ancestor problem (Trees section): LCA can be reduced to an RMQ problem via Euler tour technique, and Sparse Table is the standard structure used to answer that resulting RMQ in O(1) per query",
          "GCD range queries on a static array — GCD is also idempotent (gcd(x, x) = x), making it another valid use case alongside min/max",
          "Specifically AVOID Sparse Table for sum queries (not idempotent — overlapping ranges would double-count) or for any scenario requiring updates after construction — Fenwick Tree or Segment Tree are the correct choices in those cases instead"
        ]},
        { tag: "note", variant: "warning", text: "Using Sparse Table's overlapping-range trick for SUM queries is a classic correctness bug — sum(x, x) = 2x, not x, so the overlapping middle portion gets double-counted, silently producing a wrong (inflated) answer. Always verify idempotence before applying this technique to a new operation." }
      ],

      timeComplexityCalculation: {
        notation: "O(n log n) build / O(1) query",
        best: [
          { tag: "h2", text: "Best Case — O(n log n) build, O(1) query" },
          { tag: "p", text: "Building the table always requires computing every power-of-two range's value for every starting position — there's no shortcut even for the most favourable array content, since every table entry potentially contributes to some future query's answer." },
          { tag: "ul", items: [
            "Build: for each of O(log n) power-of-two range LENGTHS, compute the answer for every one of O(n) possible starting positions, each in O(1) by combining two half-length ranges already computed: O(n log n) total",
            "Query: always exactly 2 lookups plus 1 combine operation, regardless of the specific range requested: O(1)"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n log n) build, O(1) query" },
          { tag: "p", text: "Both build and query perform the same fixed structural work regardless of the array's specific values — table construction is a deterministic dynamic program over (length, start-position) pairs, and queries are always a fixed 2-lookup combination." },
          { tag: "ul", items: ["Build: O(n log n), identical regardless of value distribution", "Query: O(1) per query, with m total queries costing O(m) combined"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n log n) build, O(1) query" },
          { tag: "p", text: "No array content increases the build or query cost beyond these fixed structural bounds — this is simultaneously the best, average, and worst case for both operations." },
          { tag: "ul", items: [
            "Worst case identical to best/average: O(n log n) build, O(1) per query",
            "For m total queries after the one-time build: O(n log n + m) overall, which is unbeatable for a static array with a large number of repeated queries, compared to Segment Tree's O(n + m log n) or naive recomputation's O(n·m)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n log n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n log n)" },
          { tag: "p", text: "The table must store a precomputed answer for every (power-of-two length, starting position) combination — O(log n) possible lengths times O(n) possible starting positions, regardless of the array's specific values." },
          { tag: "ul", items: ["2D table: O(log n) length-levels × O(n) starting positions = O(n log n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n log n)" },
          { tag: "p", text: "Space usage is fixed by the array's length alone, since every (length, position) combination must have a stored entry regardless of value distribution." },
          { tag: "ul", items: ["Same O(n log n) bound regardless of array content"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n log n)" },
          { tag: "p", text: "No array configuration increases space beyond the fixed 2D table size — this is the structural cost of trading away update capability and Fenwick/Segment Tree's smaller O(n) footprint for genuinely O(1) queries." },
          { tag: "ul", items: ["O(n log n) total, identical across all cases — notably more space than Fenwick Tree's or Segment Tree's O(n), the direct cost of achieving O(1) query time"] }
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Range Minimum Query (RMQ) Sparse Table:" },
        { tag: "code", language: "text", text:
`function buildSparseTable(arr):
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
    return min(table[L][k], table[R − (1 << k) + 1][k])` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Build the base level (j = 0): every range of length 2^0 = 1 is just a single element, so table[i][0] is trivially arr[i].",
          "Build each subsequent level (j > 0) using the PREVIOUS level: a range of length 2^j starting at i can be split exactly in half into two ranges of length 2^(j-1) — combine their already-computed values (table[i][j-1] and table[i + 2^(j-1)][j-1]) to get this level's value, exactly like a bottom-up dynamic program.",
          "For a query on range [L, R], compute k = ⌊log₂(length)⌋ — the largest power of two that fits within the range's length.",
          "Combine TWO precomputed ranges of length 2^k: one starting at L (covering [L, L + 2^k − 1]), and one ENDING at R (covering [R − 2^k + 1, R]) — together, these two ranges are guaranteed to fully cover [L, R], possibly with some overlap in the middle.",
          "Since min (or max, or gcd) is idempotent, this overlap causes no correctness issue — the combined result of the two overlapping ranges is exactly the same as if the range had been covered without any overlap at all."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The build phase correctly computes table[i][j] as the minimum of the range [i, i + 2^j − 1] by induction on j: the base case (j=0, single elements) is trivially correct, and each subsequent level correctly combines two already-correctly-computed half-length ranges that, together, exactly and exhaustively cover the full 2^j-length range with no gaps. For the query phase, since 2^k ≤ length ≤ 2^(k+1) − 1 (by the definition of k as the largest power of two fitting within the range), the two chosen ranges [L, L+2^k−1] and [R−2^k+1, R] are each fully WITHIN the query range [L, R] (so they only include valid, in-range elements), and their UNION is guaranteed to cover the ENTIRE query range (since their combined length 2×2^k ≥ length, by the choice of k, they cannot fail to meet in the middle). Because the underlying operation is idempotent, the fact that they might overlap and 'double-count' some middle elements has no effect on the final combined value — min(min(A), min(B)) for any two ranges A and B that together cover [L,R], even with overlap, is always exactly min over [L,R]." }
      ]
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
        { tag: "p", text: "Square Root Decomposition divides an array into roughly √n equally-sized BLOCKS, each of size roughly √n, and precomputes an aggregate (sum, min, max, etc.) for each block. A range query combines the FULLY-covered blocks (using their precomputed aggregates, O(1) each) with the PARTIALLY-covered blocks at the range's two ends (scanned element-by-element, O(√n) each) — balancing query cost between the two extremes of 'no precomputation at all' (O(n) per query) and 'full tree-based precomputation' (O(log n) per query, but more complex to implement)." },
        { tag: "p", text: "Its appeal is implementation SIMPLICITY relative to Segment Tree or Fenwick Tree: there's no tree structure, no recursive logic, and no bit-manipulation tricks required — just a flat array of block-aggregates and straightforward index arithmetic (block index = position / blockSize) to determine which block any given position belongs to. This makes it a popular choice when O(√n) is fast enough for the problem's constraints and the reduced implementation complexity is worth the slightly worse asymptotic bound compared to O(log n) structures." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Range queries and updates where O(√n) is provably fast enough for the given constraints, and the simpler implementation (versus Segment Tree or Fenwick Tree) is genuinely valuable — competitive programming time pressure is the classic scenario",
          "Operations that don't cleanly fit a tree or BIT structure, but DO decompose naturally into per-block aggregates — e.g. 'count of distinct elements in a range' (using a per-block frequency structure) is awkward for a Segment Tree but natural for block decomposition",
          "'Mo's Algorithm', a well-known offline query-processing technique for answering MANY range queries efficiently, is built directly on top of the same block-decomposition principle as Square Root Decomposition",
          "As a clean illustration of a recurring algorithmic idea: balancing precomputation against per-query work by choosing block size as the SQUARE ROOT of n specifically minimizes the WORST-CASE combination of 'number of full blocks' and 'size of partial-block scans', a calculus-optimization argument worth understanding on its own"
        ]},
        { tag: "note", variant: "tip", text: "The choice of block size √n isn't arbitrary — it's the value that minimizes max(n / blockSize, blockSize), the sum of 'number of blocks to potentially scan' and 'elements per block to potentially scan'. Any other block size makes one of these two costs worse, which is why √n is specifically optimal for this technique's balanced trade-off." }
      ],

      timeComplexityCalculation: {
        notation: "O(√n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "If the queried range happens to align EXACTLY with block boundaries (starting and ending precisely at block edges), the query can be answered using only the precomputed per-block aggregates, with no partial-block scanning needed at all." },
          { tag: "ul", items: ["Range aligns exactly with block boundaries: O(range length / blockSize) full-block lookups, no partial scanning — can be as fast as O(1) for a single-block-aligned range", "This is a favourable-input case, not the general bound"] }
        ],
        average: [
          { tag: "h2", text: "Average Case — O(√n)" },
          { tag: "p", text: "A typical range query touches some number of fully-covered blocks (each O(1) to incorporate) plus two PARTIALLY-covered blocks at the range's ends (each requiring an O(√n) element-by-element scan, since a block has roughly √n elements)." },
          { tag: "ul", items: [
            "Up to O(√n) fully-covered blocks, each O(1) to incorporate: O(√n) total",
            "Two partial blocks (at the start and end of the range), each scanned element-by-element: O(√n) total",
            "Combined: O(√n)"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(√n)" },
          { tag: "p", text: "Even the least favourable range alignment (maximally misaligned with block boundaries on both ends) still bounds total work by O(√n), since neither the number of full blocks nor the size of each partial-block scan can exceed O(√n) by construction of the block size choice." },
          { tag: "ul", items: [
            "Worst case matches average: O(√n) for both query and update",
            "Update (changing a single element): O(1) to update the element itself plus O(1) to update its block's precomputed aggregate — actually O(1) for point updates, with the O(√n) bound applying specifically to RANGE queries and range updates"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(√n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n + √n)" },
          { tag: "p", text: "The original array itself requires O(n) space, plus an additional array of per-block aggregates requiring O(√n) space (since there are roughly n / √n = √n total blocks)." },
          { tag: "ul", items: ["Original array: O(n)", "Block-aggregate array: O(√n) (number of blocks)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n + √n)" },
          { tag: "p", text: "Space usage is fixed by the array's length and the resulting number of blocks, both determined entirely by n, regardless of the specific values stored." },
          { tag: "ul", items: ["Same O(n + √n) = O(n) bound regardless of value distribution — the auxiliary block structure itself is O(√n), a notably small overhead compared to the original array"] }
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n + √n)" },
          { tag: "p", text: "No array configuration increases space beyond the original array plus the fixed-size block-aggregate structure — this is both the floor and ceiling for the technique's memory footprint." },
          { tag: "ul", items: [
            "O(n) for the original data + O(√n) for block aggregates, conventionally simplified and cited as the auxiliary O(√n) cost specifically, since the O(n) original array storage is typically considered part of the input rather than algorithmic overhead"
          ]}
        ]
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Sum-based Square Root Decomposition:" },
        { tag: "code", language: "text", text:
`function build(arr):
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

    return sum` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Divide the array into blocks of size approximately √n, and precompute the sum of each block.",
          "update: changing a single element requires updating both the element itself and its containing block's precomputed sum — both O(1) operations.",
          "rangeSum: identify which block contains L (the start) and which contains R (the end). If they're the SAME block, just scan the small range directly.",
          "Otherwise, handle three distinct regions: the PARTIAL portion of the starting block (scan element-by-element from L to that block's end), every block FULLY contained between the start and end blocks (use their precomputed sums directly, O(1) each), and the PARTIAL portion of the ending block (scan element-by-element from that block's start to R).",
          "Summing these three contributions together gives the correct total for the full range [L, R]."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The range [L, R] is exhaustively and exactly partitioned into exactly three non-overlapping pieces: the tail-end of the starting block (from L to that block's boundary), zero or more complete blocks in between, and the head of the ending block (from that block's start to R) — every element of [L, R] falls into exactly one of these three categories, with no element double-counted or omitted. The partial-block portions are correctly summed via direct element-by-element scanning, and the fully-covered blocks are correctly summed via their precomputed blockSum values, which by construction (maintained correctly through every update) always hold the exact sum of their entire block's current contents. Since all three regions are correctly and completely accounted for with no overlap, their combined sum is exactly the correct answer for the full requested range." }
      ]
    }

  ]
};

const ALGODATA = [

  /* ══════════════════════════════════════════════════════════════════════════
     ARRAYS
  ══════════════════════════════════════════════════════════════════════════ */
    ARRAYS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     SORTING
  ══════════════════════════════════════════════════════════════════════════ */
    SORTING_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     GRAPHS
  ══════════════════════════════════════════════════════════════════════════ */
    GRAPHS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     TREES
  ══════════════════════════════════════════════════════════════════════════ */
    TREES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     DYNAMIC PROGRAMMING
  ══════════════════════════════════════════════════════════════════════════ */
    DYNAMIC_PROGRAMMING_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     LINKED LISTS
  ══════════════════════════════════════════════════════════════════════════ */
    LINKED_LISTS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     STACKS
  ══════════════════════════════════════════════════════════════════════════ */
    STACKS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     QUEUES
  ══════════════════════════════════════════════════════════════════════════ */
    QUEUES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     HASH MAPS
  ══════════════════════════════════════════════════════════════════════════ */
    HASH_MAPS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     HEAP
  ══════════════════════════════════════════════════════════════════════════ */
    HEAP_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     RECURSION
  ══════════════════════════════════════════════════════════════════════════ */
    RECURSION_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     STRINGS
  ══════════════════════════════════════════════════════════════════════════ */
    STRINGS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     TRIES
  ══════════════════════════════════════════════════════════════════════════ */
    TRIES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     GREEDY
  ══════════════════════════════════════════════════════════════════════════ */
    GREEDY_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     BIT MANIPULATION
  ══════════════════════════════════════════════════════════════════════════ */
    BIT_MANIPULATION_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     RANGE STRUCTURES
  ══════════════════════════════════════════════════════════════════════════ */
    RANGE_STRUCTURES_SECTION,

    /* ══════════════════════════════════════════════════════════════════════════
     MATH
  ══════════════════════════════════════════════════════════════════════════ */
    // MATH_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     ADVANCED DATA STRUCTURES
  ══════════════════════════════════════════════════════════════════════════ */
    // ADVANCED_DATA_STRUCTURES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     MISCELLANEOUS
  ══════════════════════════════════════════════════════════════════════════ */
    // MISCELLANEOUS_SECTION,

];

export default ALGODATA;
