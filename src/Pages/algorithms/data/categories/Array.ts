const ARRAYS_SECTION = {
    name: "Arrays",
    href: "/algorithms/arrays",
    iconId: "Array",
    hoverIconId: "Array",
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
            ["Kadane's Algorithm", "Track the best sum ending at each position, restarting whenever the running total drops below the current element", "O(n)", "O(1)"],
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
                sum_current ← arr[left] + arr[right]

                if sum_current == target:
                    return [left + 1, right + 1]      // found
                else if sum_current < target:
                    left ← left + 1                    // need a larger sum
                else:
                    right ← right − 1                  // need a smaller sum

            return NOT_FOUND` },
                { tag: "h2", text: "Step-by-step reasoning" },
                { tag: "ol", items: [
                "Initialise left to the first index (0) and right to the last index (n − 1).",
                "Enter the loop: continue as long as left < right — they haven't crossed or met.",
                "Compute sum_current = arr[left] + arr[right] in O(1).",
                "If sum_current equals target → pair found. Return 1-based indices immediately.",
                "If sum_current is too small, arr[left] is too small. Increment left to move to a strictly larger value (array is sorted ascending).",
                "If sum_current is too large, arr[right] is too large. Decrement right to move to a strictly smaller value.",
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
    int sum;

    while (left < right) {
        sum = nums[left] + nums[right];
        
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
                    "Initialise sum_current = arr[0], sum_max = arr[0] — O(1)",
                    "For each of the remaining n − 1 elements, do exactly one comparison and one addition",
                    "No data pattern allows the loop to terminate early — total work is always n − 1 steps"
                ]}
                ],
                average: [
                { tag: "h2", text: "Average Case — O(n)" },
                { tag: "p", text: "Because the algorithm performs identical O(1) work at every index regardless of the values encountered, there is no notion of 'lucky' or 'unlucky' input that changes the iteration count — average case is identical to best and worst." },
                { tag: "ul", items: [
                    "Each iteration: sum_current = max(arr[i], sum_current + arr[i]) — O(1)",
                    "Each iteration: sum_max = max(sum_max, sum_current) — O(1)",
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
                    "sum_current — O(1)",
                    "sum_max — O(1)",
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
                    "sum_current, sum_max: O(1)",
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
            sum_current ← arr[0]
            sum_max     ← arr[0]

            for i from 1 to length(arr) − 1:
                if arr[i] > sum_current + arr[i]:
                    sum_current ← arr[i]        // start fresh at i
                else:
                    sum_current ← sum_current + arr[i]   // extend previous run

                if sum_current > sum_max:
                    sum_max ← sum_current

            return sum_max` },
                { tag: "h2", text: "Step-by-step reasoning" },
                { tag: "ol", items: [
                "Seed both sum_current and sum_max with arr[0] — a subarray of length 1 is always valid, and initialising to 0 would fail on all-negative arrays.",
                "For every index i from 1 onward, decide: does adding arr[i] to the existing run beat starting a brand-new run at i alone?",
                "If arr[i] > sum_current + arr[i], the existing run is a net drag (sum_current is negative) — discard it and restart from i.",
                "Otherwise, extending is beneficial — add arr[i] to sum_current.",
                "After updating sum_current, compare it to sum_max and update the global best if improved.",
                "Repeat through every element; sum_max after the final iteration holds the answer."
                ]},
                { tag: "h2", text: "Why it's correct" },
                { tag: "p", text: "By induction: sum_current after processing index i always equals the maximum sum of any subarray that ends exactly at i. The base case (i = 0) holds trivially. For the inductive step, the maximum subarray ending at i either includes index i−1's optimal subarray extended by arr[i], or it is just arr[i] alone — Kadane's explicitly computes max of those two options at every step, so the invariant holds for all i, and sum_max (the running max of all these per-position optima) is therefore the true global maximum." }
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
    int sum_current = nums[0];
    int sum_max = nums[0];
    
    for (size_t i = 1; i < nums.size(); i++) {
        // Is it better to append to the previous subarray,
        // or start a brand new one here?
        sum_current = max(nums[i], sum_current + nums[i]);
        
        // Track the global maximum across all evaluated local maxima.
        sum_max = max(sum_max, sum_current);
    }
    
    return sum_max;
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
        
        int sum_current = nums[0];
        int sum_max = nums[0];
        
        for (int i = 1; i < nums.length; i++) {
            sum_current = Math.max(nums[i], sum_current + nums[i]);
            sum_max = Math.max(sum_max, sum_current);
        }
        
        return sum_max;
    }

    public static void main(String[] args) {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        System.out.println("Max Subarray Sum: " + maxSubArray(nums));
    }
}`,
        "js": `function maxSubArray(nums) {
    if (nums.length === 0) return 0;
    
    let sum_current = nums[0];
    let sum_max = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        sum_current = Math.max(nums[i], sum_current + nums[i]);
        sum_max = Math.max(sum_max, sum_current);
    }
    
    return sum_max;
}

const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
console.log("Max Subarray Sum:", maxSubArray(nums));`,
        "c": `#include <stdio.h>

int maxSubArray(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    
    int sum_current = nums[0];
    int sum_max = nums[0];
    
    for (int i = 1; i < numsSize; i++) {
        sum_current = (nums[i] > sum_current + nums[i]) ? nums[i] : sum_current + nums[i];
        if (sum_current > sum_max) sum_max = sum_current;
    }
    
    return sum_max;
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
        
        int sum_current = nums[0];
        int sum_max = nums[0];
        
        for (int i = 1; i < nums.Length; i++) {
            sum_current = Math.Max(nums[i], sum_current + nums[i]);
            sum_max = Math.Max(sum_max, sum_current);
        }
        
        return sum_max;
    }

    static void Main() {
        int[] nums = {-2, 1, -3, 4, -1, 2, 1, -5, 4};
        Console.WriteLine($"Max Subarray Sum: {MaxSubArray(nums)}");
    }
}`,
        "swift": `func maxSubArray(_ nums: [Int]) -> Int {
    guard !nums.isEmpty else { return 0 }
    
    var sum_current = nums[0]
    var sum_max = nums[0]
    
    for i in 1..<nums.count {
        sum_current = max(nums[i], sum_current + nums[i])
        sum_max = max(sum_max, sum_current)
    }
    
    return sum_max
}

let nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print("Max Subarray Sum: \\(maxSubArray(nums))")`,
        "kotlin": `import kotlin.math.max

fun maxSubArray(nums: IntArray): Int {
    if (nums.isEmpty()) return 0
    
    var sum_current = nums[0]
    var sum_max = nums[0]
    
    for (i in 1 until nums.size) {
        sum_current = max(nums[i], sum_current + nums[i])
        sum_max = max(sum_max, sum_current)
    }
    
    return sum_max
}

fun main() {
    val nums = intArrayOf(-2, 1, -3, 4, -1, 2, 1, -5, 4)
    println("Max Subarray Sum: \${maxSubArray(nums)}")
}`,
        "scala": `object Main extends App {
    def maxSubArray(nums: Array[Int]): Int = {
        if (nums.isEmpty) return 0
        
        var sum_current = nums(0)
        var sum_max = nums(0)
        
        for (i <- 1 until nums.length) {
            sum_current = math.max(nums(i), sum_current + nums(i))
            sum_max = math.max(sum_max, sum_current)
        }
        
        sum_max
    }

    val nums = Array(-2, 1, -3, 4, -1, 2, 1, -5, 4)
    println(s"Max Subarray Sum: \${maxSubArray(nums)}")
}`,
        "go": `package main

import "fmt"

func maxSubArray(nums []int) int {
    if len(nums) == 0 { return 0 }
    
    sum_current := nums[0]
    sum_max := nums[0]
    
    for i := 1; i < len(nums); i++ {
        if nums[i] > sum_current+nums[i] {
            sum_current = nums[i]
        } else {
            sum_current += nums[i]
        }
        if sum_current > sum_max {
            sum_max = sum_current
        }
    }
    
    return sum_max
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

int lengthOfLongestSubstring(string str) {
    unordered_set<char> seen;
    int left = 0;
    int maxLength = 0;
    
    for (int right = 0; right < (int)str.length(); right++) {
        while (seen.count(str[right])) {
            seen.erase(str[left]);
            left++;
        }
        seen.insert(str[right]);
        maxLength = max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

int main() {
    string str = "abcabcbb";
    cout << "Longest Substring Length: " << lengthOfLongestSubstring(str) << endl;
    return 0;
}`,

"python": `def length_of_longest_substring(str: str) -> int:
    window_chars = set()
    left = 0
    max_length = 0
    
    for right in range(len(str)):
        while str[right] in window_chars:
            window_chars.remove(str[left])
            left += 1
            
        window_chars.add(str[right])
        max_length = max(max_length, right - left + 1)
        
    return max_length

if __name__ == "__main__":
    str = "abcabcbb"
    print(f"Longest Substring Length: {length_of_longest_substring(str)}")`,

"java": `import java.util.HashSet;
import java.util.Set;

public class Main {
    public static int lengthOfLongestSubstring(String str) {
        Set<Character> seen = new HashSet<>();
        int left = 0;
        int maxLength = 0;
        
        for (int right = 0; right < str.length(); right++) {
            while (seen.contains(str.charAt(right))) {
                seen.remove(str.charAt(left));
                left++;
            }
            seen.add(str.charAt(right));
            maxLength = Math.max(maxLength, right - left + 1);
        }
        
        return maxLength;
    }

    public static void main(String[] args) {
        String str = "abcabcbb";
        System.out.println("Longest Substring Length: " + lengthOfLongestSubstring(str));
    }
}`,

"js": `function lengthOfLongestSubstring(str) {
    const seen = new Set();
    let left = 0;
    let maxLength = 0;
    
    for (let right = 0; right < str.length; right++) {
        while (seen.has(str[right])) {
            seen.delete(str[left]);
            left++;
        }
        seen.add(str[right]);
        maxLength = Math.max(maxLength, right - left + 1);
    }
    
    return maxLength;
}

const str = "abcabcbb";
console.log("Longest Substring Length:", lengthOfLongestSubstring(str));`,

"c": `#include <stdio.h>
#include <string.h>

int lengthOfLongestSubstring(char* str) {
    int map[256] = {0};
    int left = 0, right = 0;
    int maxLength = 0;
    
    while (str[right] != '\\0') {
        while (map[(unsigned char)str[right]] > 0) {
            map[(unsigned char)str[left]]--;
            left++;
        }
        map[(unsigned char)str[right]]++;
        int currentLength = right - left + 1;
        if (currentLength > maxLength) maxLength = currentLength;
        right++;
    }
    return maxLength;
}

int main() {
    char str[] = "abcabcbb";
    printf("Longest Substring Length: %d\\n", lengthOfLongestSubstring(str));
    return 0;
}`,

"c#": `using System;
using System.Collections.Generic;

class Program {
    public static int LengthOfLongestSubstring(string str) {
        HashSet<char> seen = new HashSet<char>();
        int left = 0, maxLength = 0;
        
        for (int right = 0; right < str.Length; right++) {
            while (seen.Contains(str[right])) {
                seen.Remove(str[left]);
                left++;
            }
            seen.Add(str[right]);
            maxLength = Math.Max(maxLength, right - left + 1);
        }
        return maxLength;
    }

    static void Main() {
        string str = "abcabcbb";
        Console.WriteLine($"Longest Substring Length: {LengthOfLongestSubstring(str)}");
    }
}`,

"swift": `func lengthOfLongestSubstring(_ str: String) -> Int {
    var seen = Set<Character>()
    var left = str.startIndex
    var maxLength = 0
    
    for right in str.indices {
        while seen.contains(str[right]) {
            seen.remove(str[left])
            left = str.index(after: left)
        }
        seen.insert(str[right])
        let distance = str.distance(from: left, to: right) + 1
        maxLength = max(maxLength, distance)
    }
    return maxLength
}

let str = "abcabcbb"
print("Longest Substring Length: \\(lengthOfLongestSubstring(str))")`,

"kotlin": `import kotlin.math.max

fun lengthOfLongestSubstring(str: String): Int {
    val seen = mutableSetOf<Char>()
    var left = 0
    var maxLength = 0
    
    for (right in str.indices) {
        while (seen.contains(str[right])) {
            seen.remove(str[left])
            left++
        }
        seen.add(str[right])
        maxLength = max(maxLength, right - left + 1)
    }
    return maxLength
}

fun main() {
    val str = "abcabcbb"
    println("Longest Substring Length: \${lengthOfLongestSubstring(str)}")
}`,

"scala": `import scala.collection.mutable

object Main extends App {
    def lengthOfLongestSubstring(str: String): Int = {
        val seen = mutable.Set[Char]()
        var left = 0
        var maxLength = 0
        
        for (right <- 0 until str.length) {
            while (seen.contains(str(right))) {
                seen.remove(str(left))
                left += 1
            }
            seen.add(str(right))
            maxLength = math.max(maxLength, right - left + 1)
        }
        maxLength
    }

    val str = "abcabcbb"
    println(s"Longest Substring Length: \${lengthOfLongestSubstring(str)}")
}`,

"go": `package main

import "fmt"

func lengthOfLongestSubstring(str string) int {
    seen := make(map[byte]bool)
    left := 0
    maxLength := 0
    
    for right := 0; right < len(str); right++ {
        for seen[str[right]] {
            delete(seen, str[left])
            left++
        }
        seen[str[right]] = true
        if right-left+1 > maxLength {
            maxLength = right - left + 1
        }
    }
    return maxLength
}

func main() {
    str := "abcabcbb"
    fmt.Printf("Longest Substring Length: %d\\n", lengthOfLongestSubstring(str))
}`,

"rust": `use std::collections::HashSet;
use std::cmp;

fn length_of_longest_substring(str: String) -> i32 {
    let chars: Vec<char> = str.chars().collect();
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
    let str = String::from("abcabcbb");
    println!("Longest Substring Length: {}", length_of_longest_substring(str));
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
    print(f"Sum [2, 5]: {sum_range(arr_prefix, 2, 5)}")
    print(f"Sum [0, 5]: {sum_range(arr_prefix, 0, 5)}")`,

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
        System.out.println("Sum [0, 5]: " + sumRange(arr_prefix, 0, 5));
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
console.log("Sum [2, 5]:", sumRange(arr_prefix, 2, 5));
console.log("Sum [0, 5]:", sumRange(arr_prefix, 0, 5));`,

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
    printf("Sum [0, 5]: %d\\n", sumRange(arr_prefix, 0, 5));
    
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
        Console.WriteLine($"Sum [0, 5]: {SumRange(arr_prefix, 0, 5)}");
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
print("Sum [2, 5]: \\(sumRange(arr_prefix, 2, 5))")
print("Sum [0, 5]: \\(sumRange(arr_prefix, 0, 5))")`,

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
    println("Sum [0, 5]: \${sumRange(arr_prefix, 0, 5)}")
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
    println(s"Sum [0, 5]: \${sumRange(arr_prefix, 0, 5)}")
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
    fmt.Printf("Sum [0, 5]: %d\\n", sumRange(arr_prefix, 0, 5))
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
    println!("Sum [0, 5]: {}", sum_range(&arr_prefix, 0, 5));
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

    // NOTE: 'right' is a usize (unsigned), so it cannot safely go below 0
    // the way a signed int could. The explicit bounds check below prevents
    // an underflow panic when the very last element resolves to color "2" —
    // every other language here relies on a signed int naturally reaching -1
    // to end the loop, which is not a safe option in Rust.
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

    ],
    desc: "Two pointers, sliding window, prefix sums",
    complexity: "O(n)",
    featured: true,
};

export default ARRAYS_SECTION;
