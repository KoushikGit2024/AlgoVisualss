const HASH_MAPS_SECTION = {
  name: "Hash Maps",
  href: "/algorithms/hash_maps",
    iconId: "Hashmap",
    hoverIconId: "Hashmap",

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
       1. TWO SUM
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
    seenValueToIndex ← empty hash map        // value → index

    for i from 0 to length(nums) − 1:
        complement ← target − nums[i]
        if complement in seenValueToIndex:
            return [seenValueToIndex[complement], i]
        seenValueToIndex[nums[i]] ← i

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
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

// Returns the indices of the two numbers in nums that add up to target.
// Uses a single pass: for each number, check whether its complement was
// already seen, storing seen numbers -> their index as we go.
vector<int> findTwoSumIndices(const vector<int>& nums, int target) {
    unordered_map<int, int> valueToIndex; // value seen so far -> its index

    for (int currentIndex = 0; currentIndex < (int)nums.size(); currentIndex++) {
        int currentValue = nums[currentIndex];
        int complement = target - currentValue;

        auto foundIt = valueToIndex.find(complement);
        if (foundIt != valueToIndex.end()) {
            // The complement was already seen earlier in the array.
            return {foundIt->second, currentIndex};
        }

        // Record this value so a later element can find it as its complement.
        valueToIndex[currentValue] = currentIndex;
    }

    // No valid pair exists.
    return {-1, -1};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;

    vector<int> result = findTwoSumIndices(nums, target);
    cout << "Indices: " << result[0] << ", " << result[1] << endl;

    return 0;
}
`,
        "python": `def find_two_sum_indices(nums, target):
    """Return the indices of the two numbers in nums that add up to target.

    Scans the array once, using a dictionary to remember every value seen
    so far mapped to its index. For each new number, its complement
    (target - number) is checked against that dictionary.
    """
    value_to_index = {}  # value seen so far -> its index

    for current_index, current_value in enumerate(nums):
        complement = target - current_value

        if complement in value_to_index:
            # The complement was already seen earlier in the array.
            return [value_to_index[complement], current_index]

        # Record this value so a later element can find it as its complement.
        value_to_index[current_value] = current_index

    # No valid pair exists.
    return [-1, -1]


if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9

    result = find_two_sum_indices(nums, target)
    print(f"Indices: {result[0]}, {result[1]}")
`,
        "java": `import java.util.HashMap;
import java.util.Map;

public class Main {

    // Returns the indices of the two numbers in nums that add up to target.
    // Scans the array once, remembering every value seen so far and its index.
    static int[] findTwoSumIndices(int[] nums, int target) {
        Map<Integer, Integer> valueToIndex = new HashMap<>(); // value -> index

        for (int currentIndex = 0; currentIndex < nums.length; currentIndex++) {
            int currentValue = nums[currentIndex];
            int complement = target - currentValue;

            if (valueToIndex.containsKey(complement)) {
                // The complement was already seen earlier in the array.
                return new int[] { valueToIndex.get(complement), currentIndex };
            }

            // Record this value so a later element can find it as its complement.
            valueToIndex.put(currentValue, currentIndex);
        }

        // No valid pair exists.
        return new int[] { -1, -1 };
    }

    public static void main(String[] args) {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;

        int[] result = findTwoSumIndices(nums, target);
        System.out.println("Indices: " + result[0] + ", " + result[1]);
    }
}
`,
        "js": `// Returns the indices of the two numbers in nums that add up to target.
// Scans the array once, remembering every value seen so far and its index.
function findTwoSumIndices(nums, target) {
    const valueToIndex = new Map(); // value seen so far -> its index

    for (let currentIndex = 0; currentIndex < nums.length; currentIndex++) {
        const currentValue = nums[currentIndex];
        const complement = target - currentValue;

        if (valueToIndex.has(complement)) {
            // The complement was already seen earlier in the array.
            return [valueToIndex.get(complement), currentIndex];
        }

        // Record this value so a later element can find it as its complement.
        valueToIndex.set(currentValue, currentIndex);
    }

    // No valid pair exists.
    return [-1, -1];
}

const nums = [2, 7, 11, 15];
const target = 9;

const result = findTwoSumIndices(nums, target);
console.log(\`Indices: \${result[0]}, \${result[1]}\`);
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

#define TABLE_SIZE 1024

// A tiny separate-chaining hash table mapping value -> index, built just
// for this demonstration (C has no built-in hash map in the standard library).
typedef struct HashEntry {
    int value;
    int index;
    struct HashEntry* next;
} HashEntry;

HashEntry* table[TABLE_SIZE];

int hashValue(int value) {
    int bucket = value % TABLE_SIZE;
    if (bucket < 0) bucket += TABLE_SIZE; // handle negative values
    return bucket;
}

void insertValue(int value, int index) {
    int bucket = hashValue(value);
    HashEntry* entry = (HashEntry*)malloc(sizeof(HashEntry));
    entry->value = value;
    entry->index = index;
    entry->next = table[bucket];
    table[bucket] = entry;
}

// Returns the index of 'value' if present, otherwise -1.
int lookupValue(int value) {
    int bucket = hashValue(value);
    for (HashEntry* entry = table[bucket]; entry != NULL; entry = entry->next) {
        if (entry->value == value) return entry->index;
    }
    return -1;
}

void findTwoSumIndices(int* nums, int numsSize, int target, int* firstIndex, int* secondIndex) {
    for (int i = 0; i < TABLE_SIZE; i++) table[i] = NULL;

    for (int currentIndex = 0; currentIndex < numsSize; currentIndex++) {
        int currentValue = nums[currentIndex];
        int complement = target - currentValue;

        int complementIndex = lookupValue(complement);
        if (complementIndex != -1) {
            *firstIndex = complementIndex;
            *secondIndex = currentIndex;
            return;
        }

        insertValue(currentValue, currentIndex);
    }

    *firstIndex = -1;
    *secondIndex = -1;
}

int main() {
    int nums[] = {2, 7, 11, 15};
    int numsSize = 4;
    int target = 9;

    int firstIndex, secondIndex;
    findTwoSumIndices(nums, numsSize, target, &firstIndex, &secondIndex);

    printf("Indices: %d, %d\\n", firstIndex, secondIndex);
    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    // Returns the indices of the two numbers in nums that add up to target.
    // Scans the array once, remembering every value seen so far and its index.
    static int[] FindTwoSumIndices(int[] nums, int target) {
        var valueToIndex = new Dictionary<int, int>(); // value -> index

        for (int currentIndex = 0; currentIndex < nums.Length; currentIndex++) {
            int currentValue = nums[currentIndex];
            int complement = target - currentValue;

            if (valueToIndex.TryGetValue(complement, out int complementIndex)) {
                // The complement was already seen earlier in the array.
                return new int[] { complementIndex, currentIndex };
            }

            // Record this value so a later element can find it as its complement.
            valueToIndex[currentValue] = currentIndex;
        }

        // No valid pair exists.
        return new int[] { -1, -1 };
    }

    static void Main() {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;

        int[] result = FindTwoSumIndices(nums, target);
        Console.WriteLine($"Indices: {result[0]}, {result[1]}");
    }
}
`,
        "swift": `import Foundation

// Returns the indices of the two numbers in nums that add up to target.
// Scans the array once, remembering every value seen so far and its index.
func findTwoSumIndices(_ nums: [Int], _ target: Int) -> [Int] {
    var valueToIndex: [Int: Int] = [:] // value seen so far -> its index

    for (currentIndex, currentValue) in nums.enumerated() {
        let complement = target - currentValue

        if let complementIndex = valueToIndex[complement] {
            // The complement was already seen earlier in the array.
            return [complementIndex, currentIndex]
        }

        // Record this value so a later element can find it as its complement.
        valueToIndex[currentValue] = currentIndex
    }

    // No valid pair exists.
    return [-1, -1]
}

let nums = [2, 7, 11, 15]
let target = 9

let result = findTwoSumIndices(nums, target)
print("Indices: \\(result[0]), \\(result[1])")
`,
        "kotlin": `fun findTwoSumIndices(nums: IntArray, target: Int): IntArray {
    // value seen so far -> its index
    val valueToIndex = HashMap<Int, Int>()

    for (currentIndex in nums.indices) {
        val currentValue = nums[currentIndex]
        val complement = target - currentValue

        val complementIndex = valueToIndex[complement]
        if (complementIndex != null) {
            // The complement was already seen earlier in the array.
            return intArrayOf(complementIndex, currentIndex)
        }

        // Record this value so a later element can find it as its complement.
        valueToIndex[currentValue] = currentIndex
    }

    // No valid pair exists.
    return intArrayOf(-1, -1)
}

fun main() {
    val nums = intArrayOf(2, 7, 11, 15)
    val target = 9

    val result = findTwoSumIndices(nums, target)
    println("Indices: \${result[0]}, \${result[1]}")
}
`,
        "scala": `import scala.collection.mutable

object Main extends App {
    // Returns the indices of the two numbers in nums that add up to target.
    // Scans the array once, remembering every value seen so far and its index.
    def findTwoSumIndices(nums: Array[Int], target: Int): Array[Int] = {
        val valueToIndex = mutable.Map[Int, Int]() // value -> index

        for (currentIndex <- nums.indices) {
            val currentValue = nums(currentIndex)
            val complement = target - currentValue

            valueToIndex.get(complement) match {
                case Some(complementIndex) =>
                    // The complement was already seen earlier in the array.
                    return Array(complementIndex, currentIndex)
                case None =>
                    // Record this value so a later element can find it as its complement.
                    valueToIndex(currentValue) = currentIndex
            }
        }

        // No valid pair exists.
        Array(-1, -1)
    }

    val nums = Array(2, 7, 11, 15)
    val target = 9

    val result = findTwoSumIndices(nums, target)
    println(s"Indices: \${result(0)}, \${result(1)}")
}
`,
        "go": `package main

import "fmt"

// findTwoSumIndices returns the indices of the two numbers in nums that add
// up to target. Scans the slice once, remembering every value seen so far
// and its index.
func findTwoSumIndices(nums []int, target int) (int, int) {
    valueToIndex := make(map[int]int) // value seen so far -> its index

    for currentIndex, currentValue := range nums {
        complement := target - currentValue

        if complementIndex, found := valueToIndex[complement]; found {
            // The complement was already seen earlier in the slice.
            return complementIndex, currentIndex
        }

        // Record this value so a later element can find it as its complement.
        valueToIndex[currentValue] = currentIndex
    }

    // No valid pair exists.
    return -1, -1
}

func main() {
    nums := []int{2, 7, 11, 15}
    target := 9

    firstIndex, secondIndex := findTwoSumIndices(nums, target)
    fmt.Printf("Indices: %d, %d\\n", firstIndex, secondIndex)
}
`,
        "rust": `use std::collections::HashMap;

// Returns the indices of the two numbers in nums that add up to target.
// Scans the slice once, remembering every value seen so far and its index.
fn find_two_sum_indices(nums: &[i32], target: i32) -> (i32, i32) {
    let mut value_to_index: HashMap<i32, usize> = HashMap::new();

    for (current_index, &current_value) in nums.iter().enumerate() {
        let complement = target - current_value;

        if let Some(&complement_index) = value_to_index.get(&complement) {
            // The complement was already seen earlier in the slice.
            return (complement_index as i32, current_index as i32);
        }

        // Record this value so a later element can find it as its complement.
        value_to_index.insert(current_value, current_index);
    }

    // No valid pair exists.
    (-1, -1)
}

fn main() {
    let nums = vec![2, 7, 11, 15];
    let target = 9;

    let (first_index, second_index) = find_two_sum_indices(&nums, target);
    println!("Indices: {}, {}", first_index, second_index);
}
`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       2. LONGEST CONSECUTIVE SEQUENCE
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
`function longestConsecutiveSequence(nums):
    numberSet ← hash set built from nums
    longestRunLength ← 0

    for num in numberSet:
        if (num − 1) not in numberSet:        // true start of a run
            currentRunLength ← 1
            currentNumber ← num
            while (currentNumber + 1) in numberSet:
                currentNumber ← currentNumber + 1
                currentRunLength ← currentRunLength + 1
            longestRunLength ← max(longestRunLength, currentRunLength)

    return longestRunLength` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Insert every number from the input into a hash set, giving O(1) average-case membership checks for any value.",
          "Iterate over the DISTINCT values in the set (not the raw array, so duplicates are never redundantly re-examined). For each number, check whether num − 1 is also in the set. If it IS, this number is somewhere in the MIDDLE or end of a run, not the start — skip it, since it will be correctly counted when processing its run's true starting number.",
          "If num − 1 is NOT in the set, this number is genuinely the start of a consecutive run — begin counting forward: check if num + 1 is in the set, then num + 2, and so on, incrementing the length counter each time.",
          "Once the run breaks (the next consecutive value isn't in the set), record the run's length if it's the longest seen so far.",
          "After checking every number in the set this way, the longest recorded run length is the answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The 'num − 1 not in set' check guarantees that the inner while-loop is entered exactly once per distinct consecutive run in the input, always starting from that run's true minimum value — this is what prevents the same run from being redundantly re-walked from every one of its members. Since every number belongs to exactly one maximal consecutive run, and that run is counted in full exactly once (when its start is processed), the algorithm correctly computes every run's true length and the maximum among them is correctly the longest consecutive sequence present in the input." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <unordered_set>
#include <algorithm>
using namespace std;

// Returns the length of the longest run of consecutive integer values
// present in nums (values need not be adjacent within the array itself).
int longestConsecutiveSequence(const vector<int>& nums) {
    unordered_set<int> numberSet(nums.begin(), nums.end());
    int longestRunLength = 0;

    // Iterate the distinct values only, so duplicates are never re-examined.
    for (int num : numberSet) {
        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if (numberSet.count(num - 1) == 0) {
            int currentNumber = num;
            int currentRunLength = 1;

            while (numberSet.count(currentNumber + 1) > 0) {
                currentNumber += 1;
                currentRunLength += 1;
            }

            longestRunLength = max(longestRunLength, currentRunLength);
        }
    }

    return longestRunLength;
}

int main() {
    vector<int> nums = {100, 4, 200, 1, 3, 2};

    int answer = longestConsecutiveSequence(nums);
    cout << "Longest Consecutive Sequence Length: " << answer << endl;

    return 0;
}
`,
        "python": `def longest_consecutive_sequence(nums):
    """Return the length of the longest run of consecutive integer values
    present in nums (values need not be adjacent within the list itself).
    """
    number_set = set(nums)
    longest_run_length = 0

    # Iterate the distinct values only, so duplicates are never re-examined.
    for num in number_set:
        # Only start counting from a number that is the true beginning
        # of its run -- i.e. one less than it is NOT present.
        if (num - 1) not in number_set:
            current_number = num
            current_run_length = 1

            while (current_number + 1) in number_set:
                current_number += 1
                current_run_length += 1

            longest_run_length = max(longest_run_length, current_run_length)

    return longest_run_length


if __name__ == "__main__":
    nums = [100, 4, 200, 1, 3, 2]

    answer = longest_consecutive_sequence(nums)
    print(f"Longest Consecutive Sequence Length: {answer}")
`,
        "java": `import java.util.HashSet;
import java.util.Set;

public class Main {

    // Returns the length of the longest run of consecutive integer values
    // present in nums (values need not be adjacent within the array itself).
    static int longestConsecutiveSequence(int[] nums) {
        Set<Integer> numberSet = new HashSet<>();
        for (int num : nums) numberSet.add(num);

        int longestRunLength = 0;

        // Iterate the distinct values only, so duplicates are never re-examined.
        for (int num : numberSet) {
            // Only start counting from a number that is the true beginning
            // of its run -- i.e. one less than it is NOT present.
            if (!numberSet.contains(num - 1)) {
                int currentNumber = num;
                int currentRunLength = 1;

                while (numberSet.contains(currentNumber + 1)) {
                    currentNumber += 1;
                    currentRunLength += 1;
                }

                longestRunLength = Math.max(longestRunLength, currentRunLength);
            }
        }

        return longestRunLength;
    }

    public static void main(String[] args) {
        int[] nums = { 100, 4, 200, 1, 3, 2 };

        int answer = longestConsecutiveSequence(nums);
        System.out.println("Longest Consecutive Sequence Length: " + answer);
    }
}
`,
        "js": `// Returns the length of the longest run of consecutive integer values
// present in nums (values need not be adjacent within the array itself).
function longestConsecutiveSequence(nums) {
    const numberSet = new Set(nums);
    let longestRunLength = 0;

    // Iterate the distinct values only, so duplicates are never re-examined.
    for (const num of numberSet) {
        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if (!numberSet.has(num - 1)) {
            let currentNumber = num;
            let currentRunLength = 1;

            while (numberSet.has(currentNumber + 1)) {
                currentNumber += 1;
                currentRunLength += 1;
            }

            longestRunLength = Math.max(longestRunLength, currentRunLength);
        }
    }

    return longestRunLength;
}

const nums = [100, 4, 200, 1, 3, 2];

const answer = longestConsecutiveSequence(nums);
console.log(\`Longest Consecutive Sequence Length: \${answer}\`);
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

#define TABLE_SIZE 2048

// A tiny separate-chaining hash set, built just for this demonstration
// (C has no built-in hash set in the standard library).
typedef struct SetEntry {
    int value;
    struct SetEntry* next;
} SetEntry;

SetEntry* table[TABLE_SIZE];

int hashValue(int value) {
    int bucket = value % TABLE_SIZE;
    if (bucket < 0) bucket += TABLE_SIZE; // handle negative values
    return bucket;
}

void insertValue(int value) {
    int bucket = hashValue(value);
    for (SetEntry* entry = table[bucket]; entry != NULL; entry = entry->next) {
        if (entry->value == value) return; // already present
    }
    SetEntry* newEntry = (SetEntry*)malloc(sizeof(SetEntry));
    newEntry->value = value;
    newEntry->next = table[bucket];
    table[bucket] = newEntry;
}

int containsValue(int value) {
    int bucket = hashValue(value);
    for (SetEntry* entry = table[bucket]; entry != NULL; entry = entry->next) {
        if (entry->value == value) return 1;
    }
    return 0;
}

int longestConsecutiveSequence(int* nums, int numsSize) {
    for (int i = 0; i < TABLE_SIZE; i++) table[i] = NULL;
    for (int i = 0; i < numsSize; i++) insertValue(nums[i]);

    int longestRunLength = 0;

    for (int i = 0; i < numsSize; i++) {
        int num = nums[i];

        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if (!containsValue(num - 1)) {
            int currentNumber = num;
            int currentRunLength = 1;

            while (containsValue(currentNumber + 1)) {
                currentNumber += 1;
                currentRunLength += 1;
            }

            if (currentRunLength > longestRunLength) {
                longestRunLength = currentRunLength;
            }
        }
    }

    return longestRunLength;
}

int main() {
    int nums[] = {100, 4, 200, 1, 3, 2};
    int numsSize = 6;

    int answer = longestConsecutiveSequence(nums, numsSize);
    printf("Longest Consecutive Sequence Length: %d\\n", answer);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    // Returns the length of the longest run of consecutive integer values
    // present in nums (values need not be adjacent within the array itself).
    static int LongestConsecutiveSequence(int[] nums) {
        var numberSet = new HashSet<int>(nums);
        int longestRunLength = 0;

        // Iterate the distinct values only, so duplicates are never re-examined.
        foreach (int num in numberSet) {
            // Only start counting from a number that is the true beginning
            // of its run -- i.e. one less than it is NOT present.
            if (!numberSet.Contains(num - 1)) {
                int currentNumber = num;
                int currentRunLength = 1;

                while (numberSet.Contains(currentNumber + 1)) {
                    currentNumber += 1;
                    currentRunLength += 1;
                }

                longestRunLength = Math.Max(longestRunLength, currentRunLength);
            }
        }

        return longestRunLength;
    }

    static void Main() {
        int[] nums = { 100, 4, 200, 1, 3, 2 };

        int answer = LongestConsecutiveSequence(nums);
        Console.WriteLine($"Longest Consecutive Sequence Length: {answer}");
    }
}
`,
        "swift": `import Foundation

// Returns the length of the longest run of consecutive integer values
// present in nums (values need not be adjacent within the array itself).
func longestConsecutiveSequence(_ nums: [Int]) -> Int {
    let numberSet = Set(nums)
    var longestRunLength = 0

    // Iterate the distinct values only, so duplicates are never re-examined.
    for num in numberSet {
        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if !numberSet.contains(num - 1) {
            var currentNumber = num
            var currentRunLength = 1

            while numberSet.contains(currentNumber + 1) {
                currentNumber += 1
                currentRunLength += 1
            }

            longestRunLength = max(longestRunLength, currentRunLength)
        }
    }

    return longestRunLength
}

let nums = [100, 4, 200, 1, 3, 2]

let answer = longestConsecutiveSequence(nums)
print("Longest Consecutive Sequence Length: \\(answer)")
`,
        "kotlin": `fun longestConsecutiveSequence(nums: IntArray): Int {
    val numberSet = nums.toHashSet()
    var longestRunLength = 0

    // Iterate the distinct values only, so duplicates are never re-examined.
    for (num in numberSet) {
        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if ((num - 1) !in numberSet) {
            var currentNumber = num
            var currentRunLength = 1

            while ((currentNumber + 1) in numberSet) {
                currentNumber += 1
                currentRunLength += 1
            }

            longestRunLength = maxOf(longestRunLength, currentRunLength)
        }
    }

    return longestRunLength
}

fun main() {
    val nums = intArrayOf(100, 4, 200, 1, 3, 2)

    val answer = longestConsecutiveSequence(nums)
    println("Longest Consecutive Sequence Length: $answer")
}
`,
        "scala": `object Main extends App {
    // Returns the length of the longest run of consecutive integer values
    // present in nums (values need not be adjacent within the array itself).
    def longestConsecutiveSequence(nums: Array[Int]): Int = {
        val numberSet = nums.toSet
        var longestRunLength = 0

        // Iterate the distinct values only, so duplicates are never re-examined.
        for (num <- numberSet) {
            // Only start counting from a number that is the true beginning
            // of its run -- i.e. one less than it is NOT present.
            if (!numberSet.contains(num - 1)) {
                var currentNumber = num
                var currentRunLength = 1

                while (numberSet.contains(currentNumber + 1)) {
                    currentNumber += 1
                    currentRunLength += 1
                }

                longestRunLength = math.max(longestRunLength, currentRunLength)
            }
        }

        longestRunLength
    }

    val nums = Array(100, 4, 200, 1, 3, 2)

    val answer = longestConsecutiveSequence(nums)
    println(s"Longest Consecutive Sequence Length: $answer")
}
`,
        "go": `package main

import "fmt"

// longestConsecutiveSequence returns the length of the longest run of
// consecutive integer values present in nums (values need not be adjacent
// within the slice itself).
func longestConsecutiveSequence(nums []int) int {
    numberSet := make(map[int]bool)
    for _, num := range nums {
        numberSet[num] = true
    }

    longestRunLength := 0

    // Iterate the distinct values only, so duplicates are never re-examined.
    for num := range numberSet {
        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if !numberSet[num-1] {
            currentNumber := num
            currentRunLength := 1

            for numberSet[currentNumber+1] {
                currentNumber++
                currentRunLength++
            }

            if currentRunLength > longestRunLength {
                longestRunLength = currentRunLength
            }
        }
    }

    return longestRunLength
}

func main() {
    nums := []int{100, 4, 200, 1, 3, 2}

    answer := longestConsecutiveSequence(nums)
    fmt.Printf("Longest Consecutive Sequence Length: %d\\n", answer)
}
`,
        "rust": `use std::collections::HashSet;

// Returns the length of the longest run of consecutive integer values
// present in nums (values need not be adjacent within the slice itself).
fn longest_consecutive_sequence(nums: &[i32]) -> i32 {
    let number_set: HashSet<i32> = nums.iter().cloned().collect();
    let mut longest_run_length = 0;

    // Iterate the distinct values only, so duplicates are never re-examined.
    for &num in &number_set {
        // Only start counting from a number that is the true beginning
        // of its run -- i.e. one less than it is NOT present.
        if !number_set.contains(&(num - 1)) {
            let mut current_number = num;
            let mut current_run_length = 1;

            while number_set.contains(&(current_number + 1)) {
                current_number += 1;
                current_run_length += 1;
            }

            longest_run_length = longest_run_length.max(current_run_length);
        }
    }

    longest_run_length
}

fn main() {
    let nums = vec![100, 4, 200, 1, 3, 2];

    let answer = longest_consecutive_sequence(&nums);
    println!("Longest Consecutive Sequence Length: {}", answer);
}
`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       3. GROUP ANAGRAMS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Group Anagrams",
      href: "/algorithms/hash_maps/group-anagrams",
      type: "Medium",

      about: [
        { tag: "h1", text: "Group Anagrams" },
        { tag: "p", text: "Given an array of strings, Group Anagrams groups together every string that is an anagram of every other string in its group (i.e. they contain exactly the same characters, just rearranged — 'eat', 'tea', and 'ate' are all anagrams of each other). The key technique is finding a CANONICAL FORM for each string such that two strings are anagrams of each other if and only if they share the same canonical form — then a hash map from canonical form to a list of original strings groups everything in a single pass." },
        { tag: "p", text: "The most common canonical form is the SORTED version of the string (since anagrams, by definition, contain the same multiset of characters, sorting them always produces an identical result). An alternative, often faster canonical form for strings limited to a small fixed alphabet (like lowercase English letters) is a character-frequency count — a 26-element tuple of counts — which avoids the O(k log k) cost of sorting each string entirely, since counting characters is only O(k)." },
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
            "The character-frequency-count alternative (for restricted alphabets, shown as a secondary implementation below) achieves O(nk) instead, avoiding the log k factor entirely by replacing sorting with a linear counting pass"
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
`function groupAnagrams(strings):
    canonicalFormToGroup ← empty hash map     // canonical form → list of original strings

    for str_s in strings:
        canonicalKey ← sortCharacters(str_s)    // canonical form: sorted character sequence
        if canonicalKey not in canonicalFormToGroup:
            canonicalFormToGroup[canonicalKey] ← empty list
        canonicalFormToGroup[canonicalKey].append(str_s)

    return values of canonicalFormToGroup        // list of grouped lists` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "For each string in the input, compute its canonical form — here, the characters sorted into a fixed order (e.g. 'tea' and 'eat' both sort to 'aet').",
          "Use this canonical form as a hash map key. If it's a new key, initialise an empty list for it.",
          "Append the ORIGINAL (unsorted) string to the list associated with its canonical key — this preserves the actual input strings in the output, while using the sorted version purely as the grouping mechanism.",
          "After processing every string, the hash map's values (each a list of original strings) are exactly the anagram groups, since every string in the same list shares the same canonical form by construction."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Two strings are anagrams of each other if and only if they contain the exact same multiset of characters — and sorting a string produces a canonical, order-independent representation of that multiset (any two strings with the same multiset of characters produce identical sorted output, and any two strings with different multisets produce different sorted output). This means the canonical-form hash map key correctly captures the 'is an anagram of' equivalence relation exactly: strings map to the same key if and only if they're anagrams of each other, so grouping by key correctly and completely partitions the input into anagram groups." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

// Groups every string that is an anagram of another into the same list.
// Uses each string's sorted characters as a canonical grouping key.
vector<vector<string>> groupAnagrams(const vector<string>& words) {
    unordered_map<string, vector<string>> canonicalFormToGroup;

    for (const string& word : words) {
        string canonicalKey = word;
        sort(canonicalKey.begin(), canonicalKey.end());

        canonicalFormToGroup[canonicalKey].push_back(word);
    }

    vector<vector<string>> groupedAnagrams;
    for (const auto& entry : canonicalFormToGroup) {
        groupedAnagrams.push_back(entry.second);
    }

    return groupedAnagrams;
}

int main() {
    vector<string> words = {"eat", "tea", "tan", "ate", "nat", "bat"};

    vector<vector<string>> groups = groupAnagrams(words);

    for (const auto& group : groups) {
        cout << "[ ";
        for (const string& word : group) cout << word << " ";
        cout << "]" << endl;
    }

    return 0;
}
`,
        "python": `def group_anagrams(words):
    """Group every string that is an anagram of another into the same list.

    Uses each string's sorted characters as a canonical grouping key.
    """
    canonical_form_to_group = {}

    for word in words:
        canonical_key = "".join(sorted(word))
        canonical_form_to_group.setdefault(canonical_key, []).append(word)

    return list(canonical_form_to_group.values())


if __name__ == "__main__":
    words = ["eat", "tea", "tan", "ate", "nat", "bat"]

    groups = group_anagrams(words)
    for group in groups:
        print(group)
`,
        "java": `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Main {

    // Groups every string that is an anagram of another into the same list.
    // Uses each string's sorted characters as a canonical grouping key.
    static List<List<String>> groupAnagrams(String[] words) {
        Map<String, List<String>> canonicalFormToGroup = new HashMap<>();

        for (String word : words) {
            char[] characters = word.toCharArray();
            java.util.Arrays.sort(characters);
            String canonicalKey = new String(characters);

            canonicalFormToGroup
                .computeIfAbsent(canonicalKey, key -> new ArrayList<>())
                .add(word);
        }

        return new ArrayList<>(canonicalFormToGroup.values());
    }

    public static void main(String[] args) {
        String[] words = { "eat", "tea", "tan", "ate", "nat", "bat" };

        List<List<String>> groups = groupAnagrams(words);
        for (List<String> group : groups) {
            System.out.println(group);
        }
    }
}
`,
        "js": `// Groups every string that is an anagram of another into the same list.
// Uses each string's sorted characters as a canonical grouping key.
function groupAnagrams(words) {
    const canonicalFormToGroup = new Map();

    for (const word of words) {
        const canonicalKey = word.split("").sort().join("");

        if (!canonicalFormToGroup.has(canonicalKey)) {
            canonicalFormToGroup.set(canonicalKey, []);
        }
        canonicalFormToGroup.get(canonicalKey).push(word);
    }

    return Array.from(canonicalFormToGroup.values());
}

const words = ["eat", "tea", "tan", "ate", "nat", "bat"];

const groups = groupAnagrams(words);
for (const group of groups) {
    console.log(group);
}
`,
        "c": `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_WORDS 100
#define MAX_WORD_LEN 32
#define TABLE_SIZE 256

// A tiny separate-chaining hash table mapping a sorted-character canonical
// key to a list of original words, built for this demonstration (C has no
// built-in hash map in the standard library).
typedef struct GroupEntry {
    char canonicalKey[MAX_WORD_LEN];
    char words[MAX_WORDS][MAX_WORD_LEN];
    int wordCount;
    struct GroupEntry* next;
} GroupEntry;

GroupEntry* table[TABLE_SIZE];

int hashKey(const char* key) {
    unsigned int hash = 0;
    for (int i = 0; key[i] != '\\0'; i++) hash = hash * 31 + key[i];
    return hash % TABLE_SIZE;
}

int compareChars(const void* a, const void* b) {
    return (*(char*)a) - (*(char*)b);
}

void sortCharacters(const char* word, char* sortedOut) {
    strcpy(sortedOut, word);
    qsort(sortedOut, strlen(sortedOut), sizeof(char), compareChars);
}

void addToGroup(const char* canonicalKey, const char* originalWord) {
    int bucket = hashKey(canonicalKey);

    for (GroupEntry* entry = table[bucket]; entry != NULL; entry = entry->next) {
        if (strcmp(entry->canonicalKey, canonicalKey) == 0) {
            strcpy(entry->words[entry->wordCount], originalWord);
            entry->wordCount++;
            return;
        }
    }

    GroupEntry* newEntry = (GroupEntry*)malloc(sizeof(GroupEntry));
    strcpy(newEntry->canonicalKey, canonicalKey);
    strcpy(newEntry->words[0], originalWord);
    newEntry->wordCount = 1;
    newEntry->next = table[bucket];
    table[bucket] = newEntry;
}

void groupAnagrams(char words[][MAX_WORD_LEN], int wordCount) {
    for (int i = 0; i < TABLE_SIZE; i++) table[i] = NULL;

    for (int i = 0; i < wordCount; i++) {
        char canonicalKey[MAX_WORD_LEN];
        sortCharacters(words[i], canonicalKey);
        addToGroup(canonicalKey, words[i]);
    }

    for (int i = 0; i < TABLE_SIZE; i++) {
        for (GroupEntry* entry = table[i]; entry != NULL; entry = entry->next) {
            printf("[ ");
            for (int j = 0; j < entry->wordCount; j++) {
                printf("%s ", entry->words[j]);
            }
            printf("]\\n");
        }
    }
}

int main() {
    char words[][MAX_WORD_LEN] = {"eat", "tea", "tan", "ate", "nat", "bat"};
    int wordCount = 6;

    groupAnagrams(words, wordCount);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;
using System.Linq;

class Program {
    // Groups every string that is an anagram of another into the same list.
    // Uses each string's sorted characters as a canonical grouping key.
    static List<List<string>> GroupAnagrams(string[] words) {
        var canonicalFormToGroup = new Dictionary<string, List<string>>();

        foreach (string word in words) {
            char[] characters = word.ToCharArray();
            Array.Sort(characters);
            string canonicalKey = new string(characters);

            if (!canonicalFormToGroup.ContainsKey(canonicalKey)) {
                canonicalFormToGroup[canonicalKey] = new List<string>();
            }
            canonicalFormToGroup[canonicalKey].Add(word);
        }

        return canonicalFormToGroup.Values.ToList();
    }

    static void Main() {
        string[] words = { "eat", "tea", "tan", "ate", "nat", "bat" };

        var groups = GroupAnagrams(words);
        foreach (var group in groups) {
            Console.WriteLine("[ " + string.Join(" ", group) + " ]");
        }
    }
}
`,
        "swift": `import Foundation

// Groups every string that is an anagram of another into the same list.
// Uses each string's sorted characters as a canonical grouping key.
func groupAnagrams(_ words: [String]) -> [[String]] {
    var canonicalFormToGroup: [String: [String]] = [:]

    for word in words {
        let canonicalKey = String(word.sorted())
        canonicalFormToGroup[canonicalKey, default: []].append(word)
    }

    return Array(canonicalFormToGroup.values)
}

let words = ["eat", "tea", "tan", "ate", "nat", "bat"]

let groups = groupAnagrams(words)
for group in groups {
    print(group)
}
`,
        "kotlin": `fun groupAnagrams(words: Array<String>): List<List<String>> {
    val canonicalFormToGroup = HashMap<String, MutableList<String>>()

    for (word in words) {
        val canonicalKey = word.toCharArray().sorted().joinToString("")
        canonicalFormToGroup.getOrPut(canonicalKey) { mutableListOf() }.add(word)
    }

    return canonicalFormToGroup.values.toList()
}

fun main() {
    val words = arrayOf("eat", "tea", "tan", "ate", "nat", "bat")

    val groups = groupAnagrams(words)
    for (group in groups) {
        println(group)
    }
}
`,
        "scala": `import scala.collection.mutable

object Main extends App {
    // Groups every string that is an anagram of another into the same list.
    // Uses each string's sorted characters as a canonical grouping key.
    def groupAnagrams(words: Array[String]): List[List[String]] = {
        val canonicalFormToGroup = mutable.Map[String, mutable.ListBuffer[String]]()

        for (word <- words) {
            val canonicalKey = word.sorted
            canonicalFormToGroup.getOrElseUpdate(canonicalKey, mutable.ListBuffer()) += word
        }

        canonicalFormToGroup.values.map(_.toList).toList
    }

    val words = Array("eat", "tea", "tan", "ate", "nat", "bat")

    val groups = groupAnagrams(words)
    groups.foreach(println)
}
`,
        "go": `package main

import (
    "fmt"
    "sort"
)

// groupAnagrams groups every string that is an anagram of another into the
// same slice. Uses each string's sorted characters as a canonical grouping key.
func groupAnagrams(words []string) [][]string {
    canonicalFormToGroup := make(map[string][]string)

    for _, word := range words {
        runes := []rune(word)
        sort.Slice(runes, func(i, j int) bool { return runes[i] < runes[j] })
        canonicalKey := string(runes)

        canonicalFormToGroup[canonicalKey] = append(canonicalFormToGroup[canonicalKey], word)
    }

    groupedAnagrams := make([][]string, 0, len(canonicalFormToGroup))
    for _, group := range canonicalFormToGroup {
        groupedAnagrams = append(groupedAnagrams, group)
    }

    return groupedAnagrams
}

func main() {
    words := []string{"eat", "tea", "tan", "ate", "nat", "bat"}

    groups := groupAnagrams(words)
    for _, group := range groups {
        fmt.Println(group)
    }
}
`,
        "rust": `use std::collections::HashMap;

// Groups every string that is an anagram of another into the same vector.
// Uses each string's sorted characters as a canonical grouping key.
fn group_anagrams(words: &[&str]) -> Vec<Vec<String>> {
    let mut canonical_form_to_group: HashMap<String, Vec<String>> = HashMap::new();

    for &word in words {
        let mut characters: Vec<char> = word.chars().collect();
        characters.sort();
        let canonical_key: String = characters.into_iter().collect();

        canonical_form_to_group
            .entry(canonical_key)
            .or_insert_with(Vec::new)
            .push(word.to_string());
    }

    canonical_form_to_group.into_values().collect()
}

fn main() {
    let words = vec!["eat", "tea", "tan", "ate", "nat", "bat"];

    let groups = group_anagrams(&words);
    for group in &groups {
        println!("{:?}", group);
    }
}
`
      }
    },

    /* ════════════════════════════════════════════════════════════════════
       4. DESIGN HASHMAP
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Design Hashmap",
      href: "/algorithms/hash_maps/design",
      type: "Medium",

      about: [
        { tag: "h1", text: "Design Hashmap" },
        { tag: "p", text: "Designing a hash map from scratch means implementing put, get, and remove without relying on a language's built-in hash map — forcing an explicit decision about the hash function, the underlying bucket array, and the collision-resolution strategy. The standard approach is SEPARATE CHAINING: an array of buckets, where each bucket holds a list of (key, value) pairs that all happen to hash to that same index." },
        { tag: "p", text: "The hash function's job is converting an arbitrary key into a bucket index, typically via key.hashCode() mod numBuckets (or some bit-mixing variant to better distribute the bits of poor-quality hash codes). Resizing — growing the bucket array and re-distributing all existing entries once the load factor crosses a threshold — is what keeps the average chain length bounded as the map grows, which is the entire mechanism behind the structure's O(1) average-case guarantee. Without resizing, a fixed-size bucket array would degrade toward O(n) average lookup as more entries accumulate, no matter how good the hash function is." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Implementing the hash map ADT from primitives, typically as an interview question testing understanding of hashing, collision resolution, and amortised resizing",
          "Understanding exactly how/why a hash map achieves O(1) average case — essential background before reasoning about hash map performance in any other algorithm in this whole reference",
          "Building a custom hash map variant with non-standard requirements a language's built-in map doesn't support (e.g. a specific eviction policy, as in LRU/LFU Cache Design)",
          "Embedded or resource-constrained environments where a language's standard hash map has more overhead than a minimal custom implementation needs"
        ]},
        { tag: "note", variant: "tip", text: "The resizing trigger (commonly: resize when load factor exceeds ~0.75) is what bounds expected chain length to O(1) as the map grows — the implementation below rebuilds the bucket array at double its previous size and re-hashes every existing entry into it whenever this threshold is crossed, exactly matching the mechanism described above." }
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
            "Resizing itself costs O(n) when triggered (rehashing every entry into the new, larger array), but happens only O(log n) times total across n insertions (since capacity doubles each time), giving amortised O(1) per insertion overall — directly analogous to dynamic array doubling"
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
          { tag: "p", text: "Storing n key-value pairs always requires O(n) space for the entries themselves, plus the bucket array, which is kept sized proportionally to n by the resizing logic in order to maintain a bounded load factor." },
          { tag: "ul", items: ["n entries: O(n)", "Bucket array: O(n) (kept proportional to n by resizing whenever the load factor threshold is crossed)"] }
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
        { tag: "p", text: "Separate chaining with array-of-lists buckets, plus load-factor-triggered resizing:" },
        { tag: "code", language: "text", text:
`class HashMap:
    buckets ← array of empty lists, size = INITIAL_CAPACITY
    entryCount ← 0

    function hashKeyToIndex(key, bucketCount):
        return key.hashCode() mod bucketCount

    function put(key, value):
        bucketIndex ← hashKeyToIndex(key, length(buckets))
        for pair in buckets[bucketIndex]:
            if pair.key == key:
                pair.value ← value          // update existing
                return
        buckets[bucketIndex].append((key, value))   // insert new
        entryCount ← entryCount + 1
        if entryCount / length(buckets) > LOAD_FACTOR_THRESHOLD:
            resize()

    function get(key):
        bucketIndex ← hashKeyToIndex(key, length(buckets))
        for pair in buckets[bucketIndex]:
            if pair.key == key:
                return pair.value
        return NOT_FOUND

    function remove(key):
        bucketIndex ← hashKeyToIndex(key, length(buckets))
        for i, pair in enumerate(buckets[bucketIndex]):
            if pair.key == key:
                remove buckets[bucketIndex][i]
                entryCount ← entryCount − 1
                return

    function resize():
        oldBuckets ← buckets
        buckets ← array of empty lists, size = length(oldBuckets) * 2
        for bucket in oldBuckets:
            for (key, value) in bucket:
                bucketIndex ← hashKeyToIndex(key, length(buckets))
                buckets[bucketIndex].append((key, value))   // re-hash into the new, larger array` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "The hash function converts a key into a bucket index by computing its hash code and taking it modulo the current bucket array size.",
          "put: compute the target bucket, then scan that bucket's chain for an existing entry with the same key (to update in place) — if none is found, append a new entry. If this insertion pushes the load factor (entryCount ÷ bucket count) above a threshold, trigger a resize.",
          "get: compute the target bucket and linearly scan its chain for a matching key, returning its value if found.",
          "remove: compute the target bucket, scan for the matching key, and remove that entry from the chain if found.",
          "resize: allocate a new, larger bucket array (double the size) and re-insert every existing entry by re-computing its hash against the new array size — necessary because the modulo result depends on the bucket count, so every entry's correct bucket changes when that count changes. This directly implements the load-factor-bounding mechanism described in the introduction."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Correctness of lookup follows directly from the hash function being deterministic: any key always maps to the same bucket index given the same bucket array size, so a key inserted into bucketIndex will always be found by computing that same bucketIndex during a later get or remove call (as long as no resize has happened in between, after which a re-hash correctly relocates it to its new appropriate bucket, since resize re-inserts every entry using the new array size before any further operation can query it). The chain-scanning within each bucket correctly handles collisions by checking key equality explicitly, not just hash equality, since multiple distinct keys can legitimately hash to the same bucket index. The O(1) average-case guarantee follows from the load-factor-triggered resizing keeping the ratio of entries to buckets bounded by a constant, which keeps the expected chain length — and therefore the expected scan cost — bounded by a constant as well." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <list>
#include <utility>
using namespace std;

// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
struct SimpleHashMap {
    vector<list<pair<int, int>>> buckets;
    int entryCount;

    static const int INITIAL_CAPACITY = 4;
    static constexpr double LOAD_FACTOR_THRESHOLD = 0.75;

    SimpleHashMap() : buckets(INITIAL_CAPACITY), entryCount(0) {}

    int hashKeyToIndex(int key, int bucketCount) const {
        int index = key % bucketCount;
        if (index < 0) index += bucketCount; // support negative keys
        return index;
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    void resize() {
        int newBucketCount = (int)buckets.size() * 2;
        vector<list<pair<int, int>>> newBuckets(newBucketCount);

        for (const auto& bucket : buckets) {
            for (const auto& entry : bucket) {
                int newIndex = hashKeyToIndex(entry.first, newBucketCount);
                newBuckets[newIndex].push_back(entry);
            }
        }

        buckets = newBuckets;
    }

    void put(int key, int value) {
        int bucketIndex = hashKeyToIndex(key, (int)buckets.size());

        for (auto& entry : buckets[bucketIndex]) {
            if (entry.first == key) {
                entry.second = value; // key already present: update value
                return;
            }
        }

        buckets[bucketIndex].push_back({key, value});
        entryCount++;

        double loadFactor = (double)entryCount / (double)buckets.size();
        if (loadFactor > LOAD_FACTOR_THRESHOLD) {
            resize();
        }
    }

    int get(int key) const {
        int bucketIndex = hashKeyToIndex(key, (int)buckets.size());

        for (const auto& entry : buckets[bucketIndex]) {
            if (entry.first == key) return entry.second;
        }

        return -1; // sentinel meaning "not found"
    }

    void remove(int key) {
        int bucketIndex = hashKeyToIndex(key, (int)buckets.size());
        auto& bucket = buckets[bucketIndex];

        for (auto it = bucket.begin(); it != bucket.end(); ++it) {
            if (it->first == key) {
                bucket.erase(it);
                entryCount--;
                return;
            }
        }
    }
};

int main() {
    SimpleHashMap map;

    map.put(1, 1);
    map.put(2, 2);
    cout << "get(1): " << map.get(1) << endl;
    cout << "get(3): " << map.get(3) << endl;

    map.put(2, 10);
    cout << "get(2): " << map.get(2) << endl;

    map.remove(2);
    cout << "get(2) after remove: " << map.get(2) << endl;

    // Insert enough entries to trigger at least one resize.
    for (int i = 10; i < 20; i++) map.put(i, i * 100);
    cout << "bucket count after growth: " << map.buckets.size() << endl;
    cout << "get(15): " << map.get(15) << endl;

    return 0;
}
`,
        "python": `class SimpleHashMap:
    """A separate-chaining hash map that automatically resizes (doubling its
    bucket array) whenever the load factor crosses a fixed threshold.
    """

    INITIAL_CAPACITY = 4
    LOAD_FACTOR_THRESHOLD = 0.75

    def __init__(self):
        self.buckets = [[] for _ in range(self.INITIAL_CAPACITY)]
        self.entry_count = 0

    def _hash_key_to_index(self, key, bucket_count):
        return hash(key) % bucket_count

    def _resize(self):
        """Doubles the bucket array and re-inserts every existing entry into it."""
        old_buckets = self.buckets
        new_bucket_count = len(old_buckets) * 2
        new_buckets = [[] for _ in range(new_bucket_count)]

        for bucket in old_buckets:
            for key, value in bucket:
                new_index = self._hash_key_to_index(key, new_bucket_count)
                new_buckets[new_index].append((key, value))

        self.buckets = new_buckets

    def put(self, key, value):
        bucket_index = self._hash_key_to_index(key, len(self.buckets))
        bucket = self.buckets[bucket_index]

        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                bucket[i] = (key, value)  # key already present: update value
                return

        bucket.append((key, value))
        self.entry_count += 1

        load_factor = self.entry_count / len(self.buckets)
        if load_factor > self.LOAD_FACTOR_THRESHOLD:
            self._resize()

    def get(self, key):
        bucket_index = self._hash_key_to_index(key, len(self.buckets))

        for existing_key, value in self.buckets[bucket_index]:
            if existing_key == key:
                return value

        return -1  # sentinel meaning "not found"

    def remove(self, key):
        bucket_index = self._hash_key_to_index(key, len(self.buckets))
        bucket = self.buckets[bucket_index]

        for i, (existing_key, _) in enumerate(bucket):
            if existing_key == key:
                del bucket[i]
                self.entry_count -= 1
                return


if __name__ == "__main__":
    hash_map = SimpleHashMap()

    hash_map.put(1, 1)
    hash_map.put(2, 2)
    print(f"get(1): {hash_map.get(1)}")
    print(f"get(3): {hash_map.get(3)}")

    hash_map.put(2, 10)
    print(f"get(2): {hash_map.get(2)}")

    hash_map.remove(2)
    print(f"get(2) after remove: {hash_map.get(2)}")

    # Insert enough entries to trigger at least one resize.
    for i in range(10, 20):
        hash_map.put(i, i * 100)
    print(f"bucket count after growth: {len(hash_map.buckets)}")
    print(f"get(15): {hash_map.get(15)}")
`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {

    // A separate-chaining hash map that automatically resizes (doubling its
    // bucket array) whenever the load factor crosses a fixed threshold.
    static class SimpleHashMap {
        private List<List<int[]>> buckets;
        private int entryCount;

        private static final int INITIAL_CAPACITY = 4;
        private static final double LOAD_FACTOR_THRESHOLD = 0.75;

        SimpleHashMap() {
            buckets = new ArrayList<>();
            for (int i = 0; i < INITIAL_CAPACITY; i++) buckets.add(new ArrayList<>());
            entryCount = 0;
        }

        private int hashKeyToIndex(int key, int bucketCount) {
            int index = key % bucketCount;
            if (index < 0) index += bucketCount; // support negative keys
            return index;
        }

        // Doubles the bucket array and re-inserts every existing entry into it.
        private void resize() {
            List<List<int[]>> oldBuckets = buckets;
            int newBucketCount = oldBuckets.size() * 2;

            List<List<int[]>> newBuckets = new ArrayList<>();
            for (int i = 0; i < newBucketCount; i++) newBuckets.add(new ArrayList<>());

            for (List<int[]> bucket : oldBuckets) {
                for (int[] entry : bucket) {
                    int newIndex = hashKeyToIndex(entry[0], newBucketCount);
                    newBuckets.get(newIndex).add(entry);
                }
            }

            buckets = newBuckets;
        }

        void put(int key, int value) {
            int bucketIndex = hashKeyToIndex(key, buckets.size());
            List<int[]> bucket = buckets.get(bucketIndex);

            for (int[] entry : bucket) {
                if (entry[0] == key) {
                    entry[1] = value; // key already present: update value
                    return;
                }
            }

            bucket.add(new int[] { key, value });
            entryCount++;

            double loadFactor = (double) entryCount / buckets.size();
            if (loadFactor > LOAD_FACTOR_THRESHOLD) {
                resize();
            }
        }

        int get(int key) {
            int bucketIndex = hashKeyToIndex(key, buckets.size());

            for (int[] entry : buckets.get(bucketIndex)) {
                if (entry[0] == key) return entry[1];
            }

            return -1; // sentinel meaning "not found"
        }

        void remove(int key) {
            int bucketIndex = hashKeyToIndex(key, buckets.size());
            List<int[]> bucket = buckets.get(bucketIndex);

            for (int i = 0; i < bucket.size(); i++) {
                if (bucket.get(i)[0] == key) {
                    bucket.remove(i);
                    entryCount--;
                    return;
                }
            }
        }

        int bucketCount() {
            return buckets.size();
        }
    }

    public static void main(String[] args) {
        SimpleHashMap map = new SimpleHashMap();

        map.put(1, 1);
        map.put(2, 2);
        System.out.println("get(1): " + map.get(1));
        System.out.println("get(3): " + map.get(3));

        map.put(2, 10);
        System.out.println("get(2): " + map.get(2));

        map.remove(2);
        System.out.println("get(2) after remove: " + map.get(2));

        // Insert enough entries to trigger at least one resize.
        for (int i = 10; i < 20; i++) map.put(i, i * 100);
        System.out.println("bucket count after growth: " + map.bucketCount());
        System.out.println("get(15): " + map.get(15));
    }
}
`,
        "js": `// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
class SimpleHashMap {
    static INITIAL_CAPACITY = 4;
    static LOAD_FACTOR_THRESHOLD = 0.75;

    constructor() {
        this.buckets = Array.from({ length: SimpleHashMap.INITIAL_CAPACITY }, () => []);
        this.entryCount = 0;
    }

    hashKeyToIndex(key, bucketCount) {
        let index = key % bucketCount;
        if (index < 0) index += bucketCount; // support negative keys
        return index;
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    resize() {
        const oldBuckets = this.buckets;
        const newBucketCount = oldBuckets.length * 2;
        const newBuckets = Array.from({ length: newBucketCount }, () => []);

        for (const bucket of oldBuckets) {
            for (const [key, value] of bucket) {
                const newIndex = this.hashKeyToIndex(key, newBucketCount);
                newBuckets[newIndex].push([key, value]);
            }
        }

        this.buckets = newBuckets;
    }

    put(key, value) {
        const bucketIndex = this.hashKeyToIndex(key, this.buckets.length);
        const bucket = this.buckets[bucketIndex];

        for (const entry of bucket) {
            if (entry[0] === key) {
                entry[1] = value; // key already present: update value
                return;
            }
        }

        bucket.push([key, value]);
        this.entryCount++;

        const loadFactor = this.entryCount / this.buckets.length;
        if (loadFactor > SimpleHashMap.LOAD_FACTOR_THRESHOLD) {
            this.resize();
        }
    }

    get(key) {
        const bucketIndex = this.hashKeyToIndex(key, this.buckets.length);

        for (const [existingKey, value] of this.buckets[bucketIndex]) {
            if (existingKey === key) return value;
        }

        return -1; // sentinel meaning "not found"
    }

    remove(key) {
        const bucketIndex = this.hashKeyToIndex(key, this.buckets.length);
        const bucket = this.buckets[bucketIndex];

        for (let i = 0; i < bucket.length; i++) {
            if (bucket[i][0] === key) {
                bucket.splice(i, 1);
                this.entryCount--;
                return;
            }
        }
    }
}

const map = new SimpleHashMap();

map.put(1, 1);
map.put(2, 2);
console.log(\`get(1): \${map.get(1)}\`);
console.log(\`get(3): \${map.get(3)}\`);

map.put(2, 10);
console.log(\`get(2): \${map.get(2)}\`);

map.remove(2);
console.log(\`get(2) after remove: \${map.get(2)}\`);

// Insert enough entries to trigger at least one resize.
for (let i = 10; i < 20; i++) map.put(i, i * 100);
console.log(\`bucket count after growth: \${map.buckets.length}\`);
console.log(\`get(15): \${map.get(15)}\`);
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

#define INITIAL_CAPACITY 4
#define LOAD_FACTOR_THRESHOLD 0.75

// A single key-value entry in a bucket's singly linked chain.
typedef struct MapEntry {
    int key;
    int value;
    struct MapEntry* next;
} MapEntry;

// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
typedef struct {
    MapEntry** buckets;
    int bucketCount;
    int entryCount;
} SimpleHashMap;

int hashKeyToIndex(int key, int bucketCount) {
    int index = key % bucketCount;
    if (index < 0) index += bucketCount; // support negative keys
    return index;
}

SimpleHashMap* createHashMap() {
    SimpleHashMap* map = (SimpleHashMap*)malloc(sizeof(SimpleHashMap));
    map->bucketCount = INITIAL_CAPACITY;
    map->entryCount = 0;
    map->buckets = (MapEntry**)calloc(map->bucketCount, sizeof(MapEntry*));
    return map;
}

// Doubles the bucket array and re-inserts every existing entry into it.
void resizeHashMap(SimpleHashMap* map) {
    int newBucketCount = map->bucketCount * 2;
    MapEntry** newBuckets = (MapEntry**)calloc(newBucketCount, sizeof(MapEntry*));

    for (int i = 0; i < map->bucketCount; i++) {
        MapEntry* entry = map->buckets[i];
        while (entry != NULL) {
            MapEntry* nextEntry = entry->next; // save before relinking

            int newIndex = hashKeyToIndex(entry->key, newBucketCount);
            entry->next = newBuckets[newIndex];
            newBuckets[newIndex] = entry;

            entry = nextEntry;
        }
    }

    free(map->buckets);
    map->buckets = newBuckets;
    map->bucketCount = newBucketCount;
}

void hashMapPut(SimpleHashMap* map, int key, int value) {
    int bucketIndex = hashKeyToIndex(key, map->bucketCount);

    for (MapEntry* entry = map->buckets[bucketIndex]; entry != NULL; entry = entry->next) {
        if (entry->key == key) {
            entry->value = value; // key already present: update value
            return;
        }
    }

    MapEntry* newEntry = (MapEntry*)malloc(sizeof(MapEntry));
    newEntry->key = key;
    newEntry->value = value;
    newEntry->next = map->buckets[bucketIndex];
    map->buckets[bucketIndex] = newEntry;
    map->entryCount++;

    double loadFactor = (double)map->entryCount / map->bucketCount;
    if (loadFactor > LOAD_FACTOR_THRESHOLD) {
        resizeHashMap(map);
    }
}

int hashMapGet(SimpleHashMap* map, int key) {
    int bucketIndex = hashKeyToIndex(key, map->bucketCount);

    for (MapEntry* entry = map->buckets[bucketIndex]; entry != NULL; entry = entry->next) {
        if (entry->key == key) return entry->value;
    }

    return -1; // sentinel meaning "not found"
}

void hashMapRemove(SimpleHashMap* map, int key) {
    int bucketIndex = hashKeyToIndex(key, map->bucketCount);
    MapEntry* entry = map->buckets[bucketIndex];
    MapEntry* previousEntry = NULL;

    while (entry != NULL) {
        if (entry->key == key) {
            if (previousEntry == NULL) {
                map->buckets[bucketIndex] = entry->next;
            } else {
                previousEntry->next = entry->next;
            }
            free(entry);
            map->entryCount--;
            return;
        }
        previousEntry = entry;
        entry = entry->next;
    }
}

int main() {
    SimpleHashMap* map = createHashMap();

    hashMapPut(map, 1, 1);
    hashMapPut(map, 2, 2);
    printf("get(1): %d\\n", hashMapGet(map, 1));
    printf("get(3): %d\\n", hashMapGet(map, 3));

    hashMapPut(map, 2, 10);
    printf("get(2): %d\\n", hashMapGet(map, 2));

    hashMapRemove(map, 2);
    printf("get(2) after remove: %d\\n", hashMapGet(map, 2));

    // Insert enough entries to trigger at least one resize.
    for (int i = 10; i < 20; i++) hashMapPut(map, i, i * 100);
    printf("bucket count after growth: %d\\n", map->bucketCount);
    printf("get(15): %d\\n", hashMapGet(map, 15));

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
class SimpleHashMap {
    private List<List<(int Key, int Value)>> buckets;
    private int entryCount;

    private const int InitialCapacity = 4;
    private const double LoadFactorThreshold = 0.75;

    public SimpleHashMap() {
        buckets = new List<List<(int, int)>>();
        for (int i = 0; i < InitialCapacity; i++) buckets.Add(new List<(int, int)>());
        entryCount = 0;
    }

    private int HashKeyToIndex(int key, int bucketCount) {
        int index = key % bucketCount;
        if (index < 0) index += bucketCount; // support negative keys
        return index;
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    private void Resize() {
        var oldBuckets = buckets;
        int newBucketCount = oldBuckets.Count * 2;

        var newBuckets = new List<List<(int, int)>>();
        for (int i = 0; i < newBucketCount; i++) newBuckets.Add(new List<(int, int)>());

        foreach (var bucket in oldBuckets) {
            foreach (var entry in bucket) {
                int newIndex = HashKeyToIndex(entry.Key, newBucketCount);
                newBuckets[newIndex].Add(entry);
            }
        }

        buckets = newBuckets;
    }

    public void Put(int key, int value) {
        int bucketIndex = HashKeyToIndex(key, buckets.Count);
        var bucket = buckets[bucketIndex];

        for (int i = 0; i < bucket.Count; i++) {
            if (bucket[i].Key == key) {
                bucket[i] = (key, value); // key already present: update value
                return;
            }
        }

        bucket.Add((key, value));
        entryCount++;

        double loadFactor = (double)entryCount / buckets.Count;
        if (loadFactor > LoadFactorThreshold) {
            Resize();
        }
    }

    public int Get(int key) {
        int bucketIndex = HashKeyToIndex(key, buckets.Count);

        foreach (var entry in buckets[bucketIndex]) {
            if (entry.Key == key) return entry.Value;
        }

        return -1; // sentinel meaning "not found"
    }

    public void Remove(int key) {
        int bucketIndex = HashKeyToIndex(key, buckets.Count);
        var bucket = buckets[bucketIndex];

        for (int i = 0; i < bucket.Count; i++) {
            if (bucket[i].Key == key) {
                bucket.RemoveAt(i);
                entryCount--;
                return;
            }
        }
    }

    public int BucketCount => buckets.Count;
}

class Program {
    static void Main() {
        var map = new SimpleHashMap();

        map.Put(1, 1);
        map.Put(2, 2);
        Console.WriteLine($"get(1): {map.Get(1)}");
        Console.WriteLine($"get(3): {map.Get(3)}");

        map.Put(2, 10);
        Console.WriteLine($"get(2): {map.Get(2)}");

        map.Remove(2);
        Console.WriteLine($"get(2) after remove: {map.Get(2)}");

        // Insert enough entries to trigger at least one resize.
        for (int i = 10; i < 20; i++) map.Put(i, i * 100);
        Console.WriteLine($"bucket count after growth: {map.BucketCount}");
        Console.WriteLine($"get(15): {map.Get(15)}");
    }
}
`,
        "swift": `import Foundation

// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
final class SimpleHashMap {
    private var buckets: [[(key: Int, value: Int)]]
    private var entryCount: Int

    private static let initialCapacity = 4
    private static let loadFactorThreshold = 0.75

    init() {
        buckets = Array(repeating: [], count: SimpleHashMap.initialCapacity)
        entryCount = 0
    }

    private func hashKeyToIndex(_ key: Int, _ bucketCount: Int) -> Int {
        let index = key % bucketCount
        return index < 0 ? index + bucketCount : index // support negative keys
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    private func resize() {
        let oldBuckets = buckets
        let newBucketCount = oldBuckets.count * 2
        var newBuckets: [[(key: Int, value: Int)]] = Array(repeating: [], count: newBucketCount)

        for bucket in oldBuckets {
            for entry in bucket {
                let newIndex = hashKeyToIndex(entry.key, newBucketCount)
                newBuckets[newIndex].append(entry)
            }
        }

        buckets = newBuckets
    }

    func put(_ key: Int, _ value: Int) {
        let bucketIndex = hashKeyToIndex(key, buckets.count)

        for i in 0..<buckets[bucketIndex].count {
            if buckets[bucketIndex][i].key == key {
                buckets[bucketIndex][i].value = value // key already present: update value
                return
            }
        }

        buckets[bucketIndex].append((key, value))
        entryCount += 1

        let loadFactor = Double(entryCount) / Double(buckets.count)
        if loadFactor > SimpleHashMap.loadFactorThreshold {
            resize()
        }
    }

    func get(_ key: Int) -> Int {
        let bucketIndex = hashKeyToIndex(key, buckets.count)

        for entry in buckets[bucketIndex] {
            if entry.key == key { return entry.value }
        }

        return -1 // sentinel meaning "not found"
    }

    func remove(_ key: Int) {
        let bucketIndex = hashKeyToIndex(key, buckets.count)

        for i in 0..<buckets[bucketIndex].count {
            if buckets[bucketIndex][i].key == key {
                buckets[bucketIndex].remove(at: i)
                entryCount -= 1
                return
            }
        }
    }

    var bucketCount: Int { buckets.count }
}

let map = SimpleHashMap()

map.put(1, 1)
map.put(2, 2)
print("get(1): \\(map.get(1))")
print("get(3): \\(map.get(3))")

map.put(2, 10)
print("get(2): \\(map.get(2))")

map.remove(2)
print("get(2) after remove: \\(map.get(2))")

// Insert enough entries to trigger at least one resize.
for i in 10..<20 { map.put(i, i * 100) }
print("bucket count after growth: \\(map.bucketCount)")
print("get(15): \\(map.get(15))")
`,
        "kotlin": `// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
class SimpleHashMap {
    private var buckets: MutableList<MutableList<Pair<Int, Int>>> =
        MutableList(INITIAL_CAPACITY) { mutableListOf() }
    private var entryCount = 0

    companion object {
        const val INITIAL_CAPACITY = 4
        const val LOAD_FACTOR_THRESHOLD = 0.75
    }

    private fun hashKeyToIndex(key: Int, bucketCount: Int): Int {
        val index = key % bucketCount
        return if (index < 0) index + bucketCount else index // support negative keys
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    private fun resize() {
        val oldBuckets = buckets
        val newBucketCount = oldBuckets.size * 2
        val newBuckets = MutableList<MutableList<Pair<Int, Int>>>(newBucketCount) { mutableListOf() }

        for (bucket in oldBuckets) {
            for (entry in bucket) {
                val newIndex = hashKeyToIndex(entry.first, newBucketCount)
                newBuckets[newIndex].add(entry)
            }
        }

        buckets = newBuckets
    }

    fun put(key: Int, value: Int) {
        val bucketIndex = hashKeyToIndex(key, buckets.size)
        val bucket = buckets[bucketIndex]

        for (i in bucket.indices) {
            if (bucket[i].first == key) {
                bucket[i] = key to value // key already present: update value
                return
            }
        }

        bucket.add(key to value)
        entryCount++

        val loadFactor = entryCount.toDouble() / buckets.size
        if (loadFactor > LOAD_FACTOR_THRESHOLD) {
            resize()
        }
    }

    fun get(key: Int): Int {
        val bucketIndex = hashKeyToIndex(key, buckets.size)

        for (entry in buckets[bucketIndex]) {
            if (entry.first == key) return entry.second
        }

        return -1 // sentinel meaning "not found"
    }

    fun remove(key: Int) {
        val bucketIndex = hashKeyToIndex(key, buckets.size)
        val bucket = buckets[bucketIndex]

        for (i in bucket.indices) {
            if (bucket[i].first == key) {
                bucket.removeAt(i)
                entryCount--
                return
            }
        }
    }

    fun bucketCount(): Int = buckets.size
}

fun main() {
    val map = SimpleHashMap()

    map.put(1, 1)
    map.put(2, 2)
    println("get(1): \${map.get(1)}")
    println("get(3): \${map.get(3)}")

    map.put(2, 10)
    println("get(2): \${map.get(2)}")

    map.remove(2)
    println("get(2) after remove: \${map.get(2)}")

    // Insert enough entries to trigger at least one resize.
    for (i in 10 until 20) map.put(i, i * 100)
    println("bucket count after growth: \${map.bucketCount()}")
    println("get(15): \${map.get(15)}")
}
`,
        "scala": `import scala.collection.mutable.ListBuffer

// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
class SimpleHashMap {
    private var buckets: Array[ListBuffer[(Int, Int)]] =
        Array.fill(SimpleHashMap.InitialCapacity)(ListBuffer())
    private var entryCount: Int = 0

    private def hashKeyToIndex(key: Int, bucketCount: Int): Int = {
        val index = key % bucketCount
        if (index < 0) index + bucketCount else index // support negative keys
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    private def resize(): Unit = {
        val oldBuckets = buckets
        val newBucketCount = oldBuckets.length * 2
        val newBuckets = Array.fill(newBucketCount)(ListBuffer[(Int, Int)]())

        for (bucket <- oldBuckets; entry <- bucket) {
            val newIndex = hashKeyToIndex(entry._1, newBucketCount)
            newBuckets(newIndex) += entry
        }

        buckets = newBuckets
    }

    def put(key: Int, value: Int): Unit = {
        val bucketIndex = hashKeyToIndex(key, buckets.length)
        val bucket = buckets(bucketIndex)

        val existingIndex = bucket.indexWhere(_._1 == key)
        if (existingIndex != -1) {
            bucket(existingIndex) = (key, value) // key already present: update value
            return
        }

        bucket += ((key, value))
        entryCount += 1

        val loadFactor = entryCount.toDouble / buckets.length
        if (loadFactor > SimpleHashMap.LoadFactorThreshold) {
            resize()
        }
    }

    def get(key: Int): Int = {
        val bucketIndex = hashKeyToIndex(key, buckets.length)
        buckets(bucketIndex).find(_._1 == key).map(_._2).getOrElse(-1) // -1: "not found"
    }

    def remove(key: Int): Unit = {
        val bucketIndex = hashKeyToIndex(key, buckets.length)
        val bucket = buckets(bucketIndex)
        val existingIndex = bucket.indexWhere(_._1 == key)
        if (existingIndex != -1) {
            bucket.remove(existingIndex)
            entryCount -= 1
        }
    }

    def bucketCount: Int = buckets.length
}

object SimpleHashMap {
    val InitialCapacity = 4
    val LoadFactorThreshold = 0.75
}

object Main extends App {
    val map = new SimpleHashMap()

    map.put(1, 1)
    map.put(2, 2)
    println(s"get(1): \${map.get(1)}")
    println(s"get(3): \${map.get(3)}")

    map.put(2, 10)
    println(s"get(2): \${map.get(2)}")

    map.remove(2)
    println(s"get(2) after remove: \${map.get(2)}")

    // Insert enough entries to trigger at least one resize.
    for (i <- 10 until 20) map.put(i, i * 100)
    println(s"bucket count after growth: \${map.bucketCount}")
    println(s"get(15): \${map.get(15)}")
}
`,
        "go": `package main

import "fmt"

const initialCapacity = 4
const loadFactorThreshold = 0.75

// mapEntry is a single key-value pair stored in a bucket's chain.
type mapEntry struct {
    key   int
    value int
}

// SimpleHashMap is a separate-chaining hash map that automatically resizes
// (doubling its bucket array) whenever the load factor crosses a fixed threshold.
type SimpleHashMap struct {
    buckets    [][]mapEntry
    entryCount int
}

func newSimpleHashMap() *SimpleHashMap {
    buckets := make([][]mapEntry, initialCapacity)
    return &SimpleHashMap{buckets: buckets, entryCount: 0}
}

func hashKeyToIndex(key int, bucketCount int) int {
    index := key % bucketCount
    if index < 0 {
        index += bucketCount // support negative keys
    }
    return index
}

// resize doubles the bucket array and re-inserts every existing entry into it.
func (m *SimpleHashMap) resize() {
    oldBuckets := m.buckets
    newBucketCount := len(oldBuckets) * 2
    newBuckets := make([][]mapEntry, newBucketCount)

    for _, bucket := range oldBuckets {
        for _, entry := range bucket {
            newIndex := hashKeyToIndex(entry.key, newBucketCount)
            newBuckets[newIndex] = append(newBuckets[newIndex], entry)
        }
    }

    m.buckets = newBuckets
}

func (m *SimpleHashMap) Put(key int, value int) {
    bucketIndex := hashKeyToIndex(key, len(m.buckets))
    bucket := m.buckets[bucketIndex]

    for i := range bucket {
        if bucket[i].key == key {
            bucket[i].value = value // key already present: update value
            return
        }
    }

    m.buckets[bucketIndex] = append(bucket, mapEntry{key, value})
    m.entryCount++

    loadFactor := float64(m.entryCount) / float64(len(m.buckets))
    if loadFactor > loadFactorThreshold {
        m.resize()
    }
}

func (m *SimpleHashMap) Get(key int) int {
    bucketIndex := hashKeyToIndex(key, len(m.buckets))

    for _, entry := range m.buckets[bucketIndex] {
        if entry.key == key {
            return entry.value
        }
    }

    return -1 // sentinel meaning "not found"
}

func (m *SimpleHashMap) Remove(key int) {
    bucketIndex := hashKeyToIndex(key, len(m.buckets))
    bucket := m.buckets[bucketIndex]

    for i, entry := range bucket {
        if entry.key == key {
            m.buckets[bucketIndex] = append(bucket[:i], bucket[i+1:]...)
            m.entryCount--
            return
        }
    }
}

func main() {
    hashMap := newSimpleHashMap()

    hashMap.Put(1, 1)
    hashMap.Put(2, 2)
    fmt.Printf("get(1): %d\\n", hashMap.Get(1))
    fmt.Printf("get(3): %d\\n", hashMap.Get(3))

    hashMap.Put(2, 10)
    fmt.Printf("get(2): %d\\n", hashMap.Get(2))

    hashMap.Remove(2)
    fmt.Printf("get(2) after remove: %d\\n", hashMap.Get(2))

    // Insert enough entries to trigger at least one resize.
    for i := 10; i < 20; i++ {
        hashMap.Put(i, i*100)
    }
    fmt.Printf("bucket count after growth: %d\\n", len(hashMap.buckets))
    fmt.Printf("get(15): %d\\n", hashMap.Get(15))
}
`,
        "rust": `// A separate-chaining hash map that automatically resizes (doubling its
// bucket array) whenever the load factor crosses a fixed threshold.
struct SimpleHashMap {
    buckets: Vec<Vec<(i32, i32)>>,
    entry_count: usize,
}

const INITIAL_CAPACITY: usize = 4;
const LOAD_FACTOR_THRESHOLD: f64 = 0.75;

impl SimpleHashMap {
    fn new() -> Self {
        SimpleHashMap {
            buckets: vec![Vec::new(); INITIAL_CAPACITY],
            entry_count: 0,
        }
    }

    fn hash_key_to_index(key: i32, bucket_count: usize) -> usize {
        let index = key.rem_euclid(bucket_count as i32); // support negative keys
        index as usize
    }

    // Doubles the bucket array and re-inserts every existing entry into it.
    fn resize(&mut self) {
        let old_buckets = std::mem::take(&mut self.buckets);
        let new_bucket_count = old_buckets.len() * 2;
        let mut new_buckets: Vec<Vec<(i32, i32)>> = vec![Vec::new(); new_bucket_count];

        for bucket in old_buckets {
            for entry in bucket {
                let new_index = Self::hash_key_to_index(entry.0, new_bucket_count);
                new_buckets[new_index].push(entry);
            }
        }

        self.buckets = new_buckets;
    }

    fn put(&mut self, key: i32, value: i32) {
        let bucket_index = Self::hash_key_to_index(key, self.buckets.len());
        let bucket = &mut self.buckets[bucket_index];

        for entry in bucket.iter_mut() {
            if entry.0 == key {
                entry.1 = value; // key already present: update value
                return;
            }
        }

        bucket.push((key, value));
        self.entry_count += 1;

        let load_factor = self.entry_count as f64 / self.buckets.len() as f64;
        if load_factor > LOAD_FACTOR_THRESHOLD {
            self.resize();
        }
    }

    fn get(&self, key: i32) -> i32 {
        let bucket_index = Self::hash_key_to_index(key, self.buckets.len());

        for &(existing_key, value) in &self.buckets[bucket_index] {
            if existing_key == key {
                return value;
            }
        }

        -1 // sentinel meaning "not found"
    }

    fn remove(&mut self, key: i32) {
        let bucket_index = Self::hash_key_to_index(key, self.buckets.len());
        let bucket = &mut self.buckets[bucket_index];

        if let Some(position) = bucket.iter().position(|&(existing_key, _)| existing_key == key) {
            bucket.remove(position);
            self.entry_count -= 1;
        }
    }

    fn bucket_count(&self) -> usize {
        self.buckets.len()
    }
}

fn main() {
    let mut map = SimpleHashMap::new();

    map.put(1, 1);
    map.put(2, 2);
    println!("get(1): {}", map.get(1));
    println!("get(3): {}", map.get(3));

    map.put(2, 10);
    println!("get(2): {}", map.get(2));

    map.remove(2);
    println!("get(2) after remove: {}", map.get(2));

    // Insert enough entries to trigger at least one resize.
    for i in 10..20 {
        map.put(i, i * 100);
    }
    println!("bucket count after growth: {}", map.bucket_count());
    println!("get(15): {}", map.get(15));
}
`
      }
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
        { tag: "p", text: "The O(1)-per-operation solution requires THREE coordinated structures: a hash map from key to (value, frequency) for O(1) lookup, a hash map from frequency count to a DOUBLY LINKED LIST of keys with that exact frequency (ordered by recency within the frequency group, exactly like an LRU list), and a tracked 'minimum frequency currently in the cache' value to know instantly which frequency-bucket to evict from. The doubly linked list is what makes removing a specific key from the middle of its frequency bucket genuinely O(1) — with only a singly linked list or a plain array, removing an arbitrary element requires an O(k) scan to find it first." },
        { tag: "h2", text: "When to reach for it" },
        { tag: "ul", items: [
          "Designing a cache eviction policy where ACCESS FREQUENCY (not just recency) should determine what gets evicted — content that's accessed very often but happened to be touched a while ago shouldn't be evicted just because something less popular was touched more recently (the failure mode LRU is vulnerable to)",
          "CDN and database buffer pool caching strategies where genuinely 'hot' (frequently accessed) data should be strongly preferred for retention over merely 'recently touched once' data",
          "The natural escalation problem after mastering LRU Cache Design — demonstrates combining MULTIPLE hash maps and linked lists together to track two independent dimensions (frequency and recency) simultaneously, each in O(1)",
          "Adaptive caching systems that blend frequency and recency (e.g. ARC — Adaptive Replacement Cache) build on the same multi-structure foundation established here"
        ]},
        { tag: "note", variant: "warning", text: "The trickiest part of LFU isn't tracking frequency — it's correctly maintaining the 'minimum frequency currently present' value across both increments (when an existing key is accessed) and evictions (when the minimum-frequency bucket becomes empty and the new minimum must be determined), since getting this wrong silently breaks the eviction-order guarantee. A second, equally common implementation mistake is storing each frequency bucket as a plain array or vector and removing a key from it with a linear scan — that silently downgrades every operation from the promised O(1) to O(bucket size), even though the rest of the design looks correct." }
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          { tag: "p", text: "Both get and put always perform a small, fixed number of hash map lookups and doubly-linked-list pointer operations, regardless of the cache's current contents or access history." },
          { tag: "ul", items: [
            "get: O(1) — look up the key's entry, increment its frequency, splice it out of its old frequency bucket's list using a stored iterator/pointer (no scan needed), and splice it into the new frequency bucket's list",
            "put: O(1) — similar lookup/update, plus possibly an O(1) eviction from the minimum-frequency bucket's tail if the cache is full"
          ]}
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          { tag: "p", text: "Every operation performs the same fixed sequence of hash map and doubly-linked-list operations regardless of how access frequencies happen to be distributed across the cache's current entries." },
          { tag: "ul", items: [
            "key → (value, frequency) hash map: O(1) average lookup/update",
            "frequency → doubly-linked-list-of-keys hash map: O(1) average lookup of the correct frequency bucket, plus O(1) unlink/relink within that bucket's list — this O(1) unlink specifically requires storing, for every key, an iterator/pointer directly into its current position in its frequency bucket's list, so no linear scan is ever needed to locate it",
            "Tracking and updating the minimum-frequency value: O(1) amortised, since it only ever needs to be checked or incremented by exactly 1 per operation"
          ]}
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          { tag: "p", text: "Because every structural operation (hash map access, doubly-linked-list splice using a stored iterator) is individually O(1) by construction, no sequence of get/put operations can push any single operation beyond constant time — this mirrors LRU Cache's same guarantee, just with one additional coordinated hash map for frequency tracking." },
          { tag: "ul", items: [
            "All operations remain O(1) regardless of access pattern, assuming well-behaved (non-adversarial) hash functions for both hash maps involved",
            "As with any hash-map-based structure, a pathological hash collision attack could theoretically degrade this, though this isn't characteristic of normal operation",
            "This O(1) guarantee depends critically on using a genuine doubly linked list (with a stored per-key iterator) for each frequency bucket — an implementation that instead scans a plain array or vector to find and erase a key degrades to O(bucket size) per operation, which is no longer O(1)"
          ]}
        ]
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The cache stores at most 'capacity' entries by design, requiring space proportional to capacity across both the key-data hash map and the frequency-bucket structure." },
          { tag: "ul", items: ["key → (value, frequency) map: up to capacity entries — O(n)", "frequency → linked-list map: total entries across all frequency buckets also bounded by capacity — O(n)", "key → list-iterator map: one entry per cached key — O(n)"] }
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          { tag: "p", text: "Space usage is bounded by the fixed cache capacity, which is a configuration parameter, identical in spirit to LRU Cache Design's space bound." },
          { tag: "ul", items: ["All three coordinated structures combined stay capped at O(n), where n is the configured capacity, regardless of how access frequencies happen to distribute"] }
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
    capacity ← given
    minFrequency ← 0
    keyToValueAndFrequency ← empty hash map        // key → (value, frequency)
    frequencyToKeyList ← empty hash map             // frequency → doubly linked list of keys (most-recent first)
    keyToListIterator ← empty hash map              // key → iterator into its current frequency bucket's list

    function get(key):
        if key not in keyToValueAndFrequency: return −1
        (value, frequency) ← keyToValueAndFrequency[key]
        bumpFrequency(key, frequency)
        return value

    function put(key, value):
        if capacity == 0: return
        if key in keyToValueAndFrequency:
            (_, frequency) ← keyToValueAndFrequency[key]
            keyToValueAndFrequency[key] ← (value, frequency)
            bumpFrequency(key, frequency)
            return

        if size(keyToValueAndFrequency) == capacity:
            evictKey ← frequencyToKeyList[minFrequency].removeLeastRecent()   // O(1): remove from list tail
            delete keyToValueAndFrequency[evictKey]
            delete keyToListIterator[evictKey]

        keyToValueAndFrequency[key] ← (value, 1)
        frequencyToKeyList[1].insertMostRecent(key)                          // O(1): insert at list head
        keyToListIterator[key] ← frequencyToKeyList[1].iteratorToHead()
        minFrequency ← 1

    function bumpFrequency(key, oldFrequency):
        frequencyToKeyList[oldFrequency].removeUsingIterator(keyToListIterator[key])   // O(1): no scan needed
        if frequencyToKeyList[oldFrequency] is empty and minFrequency == oldFrequency:
            minFrequency ← minFrequency + 1

        newFrequency ← oldFrequency + 1
        keyToValueAndFrequency[key].frequency ← newFrequency
        frequencyToKeyList[newFrequency].insertMostRecent(key)
        keyToListIterator[key] ← frequencyToKeyList[newFrequency].iteratorToHead()` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain three coordinated structures: a hash map from key to its (value, current frequency); a hash map from a frequency value to a DOUBLY linked list of all keys CURRENTLY at exactly that frequency, ordered by recency (most-recent at the front, exactly like an LRU list within each frequency bucket); and a hash map from each key directly to its ITERATOR (pointer) into wherever it currently sits in its frequency bucket's list.",
          "On get(key) (and on put for an existing key): look up the key's current frequency, use its STORED ITERATOR to remove it from that frequency's list in O(1) (no scanning needed to find it), increment its frequency by one, and insert it at the front of the NEW frequency's list — this correctly 'promotes' the key. Store the new iterator for this key immediately.",
          "If removing the key emptied its OLD frequency bucket, and that old frequency was the tracked minimum, the minimum must now increase by exactly 1 (since the key being bumped was, by definition, originally at the minimum frequency if minFreq == oldFreq).",
          "On put(key, value) for a NEW key: if the cache is at capacity, evict the least-recently-used key from the bucket at minFreq (the globally least-frequently-used group, with ties broken by recency, removed in O(1) from the list's tail) — then insert the new key at frequency 1, and reset minFreq to 1, since a freshly inserted key is always the new minimum."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The frequency-bucket structure correctly groups every cached key by its exact access count, and within each bucket, the doubly linked list correctly orders keys by recency, mirroring LRU Cache Design's own correctness argument but applied independently to each frequency level. Eviction always pulls from frequencyToKeyList[minFrequency], which by the maintained minFrequency invariant is guaranteed to be the genuinely lowest frequency currently present among ANY cached key — and within that bucket, removing from the least-recent end correctly breaks frequency ties using recency, satisfying the full LFU-with-recency-tiebreak specification. The minFrequency invariant itself is correctly maintained because it's only ever decreased to 1 on a fresh insertion (provably correct, since a frequency-1 key is always tied for the minimum) and only ever incremented when its OWN bucket becomes empty due to a bump (provably correct, since an empty bucket can no longer contain the minimum, and the bumped key's new frequency, oldFrequency+1, is the next viable candidate). The per-key stored iterator is what makes every list removal genuinely O(1): rather than searching a bucket's list for the key being moved, the algorithm jumps directly to its exact position using the iterator saved the last time that key was inserted or moved." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <unordered_map>
#include <list>
using namespace std;

// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a doubly linked list per frequency bucket AND a stored
// iterator per key -- so removing a key from its bucket never requires
// scanning the bucket to find it.
struct LFUCache {
    int capacity;
    int minFrequency;

    // key -> (value, frequency)
    unordered_map<int, pair<int, int>> keyToValueAndFrequency;

    // frequency -> list of keys, most-recently-used at the front
    unordered_map<int, list<int>> frequencyToKeyList;

    // key -> iterator into its current frequency bucket's list, enabling O(1) removal
    unordered_map<int, list<int>::iterator> keyToListIterator;

    LFUCache(int cacheCapacity) : capacity(cacheCapacity), minFrequency(0) {}

    // Moves a key from its old frequency bucket to (oldFrequency + 1),
    // updating the recency position and the tracked minimum frequency.
    void bumpFrequency(int key) {
        int value = keyToValueAndFrequency[key].first;
        int oldFrequency = keyToValueAndFrequency[key].second;

        // O(1) removal: jump straight to the key's position using its stored iterator.
        frequencyToKeyList[oldFrequency].erase(keyToListIterator[key]);

        if (frequencyToKeyList[oldFrequency].empty() && minFrequency == oldFrequency) {
            minFrequency++;
        }

        int newFrequency = oldFrequency + 1;
        keyToValueAndFrequency[key] = {value, newFrequency};
        frequencyToKeyList[newFrequency].push_front(key);
        keyToListIterator[key] = frequencyToKeyList[newFrequency].begin();
    }

    int get(int key) {
        if (keyToValueAndFrequency.find(key) == keyToValueAndFrequency.end()) {
            return -1; // sentinel meaning "not found"
        }

        int value = keyToValueAndFrequency[key].first;
        bumpFrequency(key);
        return value;
    }

    void put(int key, int value) {
        if (capacity == 0) return;

        if (keyToValueAndFrequency.find(key) != keyToValueAndFrequency.end()) {
            keyToValueAndFrequency[key].first = value;
            bumpFrequency(key);
            return;
        }

        if ((int)keyToValueAndFrequency.size() == capacity) {
            // Evict the least-recently-used key from the least-frequent bucket.
            int evictKey = frequencyToKeyList[minFrequency].back();
            frequencyToKeyList[minFrequency].pop_back();
            keyToValueAndFrequency.erase(evictKey);
            keyToListIterator.erase(evictKey);
        }

        keyToValueAndFrequency[key] = {value, 1};
        frequencyToKeyList[1].push_front(key);
        keyToListIterator[key] = frequencyToKeyList[1].begin();
        minFrequency = 1; // a freshly inserted key is always at the new minimum frequency
    }
};

int main() {
    LFUCache cache(2);

    cache.put(1, 1);
    cache.put(2, 2);
    cout << "get(1): " << cache.get(1) << endl; // 1, frequency of key 1 becomes 2

    cache.put(3, 3); // capacity reached: evicts key 2 (frequency 1, least recent)
    cout << "get(2): " << cache.get(2) << endl; // -1, evicted
    cout << "get(3): " << cache.get(3) << endl; // 3

    cache.put(4, 4); // capacity reached: evicts key 1 (frequency 2) since key 3 has frequency 2 also but was inserted more recently... actually key 1 freq=2, key3 freq=2, key1 is older -> evicts key 1
    cout << "get(1): " << cache.get(1) << endl; // -1, evicted
    cout << "get(3): " << cache.get(3) << endl; // 3
    cout << "get(4): " << cache.get(4) << endl; // 4

    return 0;
}
`,
        "python": `class LFUCache:
    """A Least Frequently Used cache with true O(1) get/put.

    Achieved by pairing every key with a position inside a doubly linked
    list per frequency bucket, plus a direct pointer from each key to its
    node -- so removing a key from its bucket never requires scanning.
    """

    class _Node:
        __slots__ = ("key", "prev", "next")

        def __init__(self, key=None):
            self.key = key
            self.prev = None
            self.next = None

    class _DoublyLinkedList:
        """A doubly linked list with sentinel head/tail nodes, supporting
        O(1) push-to-front and O(1) removal given a direct node reference.
        """

        def __init__(self):
            self.head = LFUCache._Node()
            self.tail = LFUCache._Node()
            self.head.next = self.tail
            self.tail.prev = self.head
            self.size = 0

        def push_front(self, node):
            node.next = self.head.next
            node.prev = self.head
            self.head.next.prev = node
            self.head.next = node
            self.size += 1

        def remove(self, node):
            node.prev.next = node.next
            node.next.prev = node.prev
            self.size -= 1

        def pop_back(self):
            if self.size == 0:
                return None
            node = self.tail.prev
            self.remove(node)
            return node

        def is_empty(self):
            return self.size == 0

    def __init__(self, capacity):
        self.capacity = capacity
        self.min_frequency = 0
        self.key_to_value = {}                 # key -> value
        self.key_to_frequency = {}              # key -> current frequency
        self.key_to_node = {}                   # key -> its node in its frequency bucket's list
        self.frequency_to_list = {}             # frequency -> doubly linked list of nodes

    def _bump_frequency(self, key):
        """Moves a key from its old frequency bucket to (old_frequency + 1)."""
        old_frequency = self.key_to_frequency[key]
        node = self.key_to_node[key]

        # O(1) removal: the node already knows its own neighbors.
        self.frequency_to_list[old_frequency].remove(node)
        if self.frequency_to_list[old_frequency].is_empty() and self.min_frequency == old_frequency:
            self.min_frequency += 1

        new_frequency = old_frequency + 1
        self.key_to_frequency[key] = new_frequency

        if new_frequency not in self.frequency_to_list:
            self.frequency_to_list[new_frequency] = LFUCache._DoublyLinkedList()

        new_node = LFUCache._Node(key)
        self.frequency_to_list[new_frequency].push_front(new_node)
        self.key_to_node[key] = new_node

    def get(self, key):
        if key not in self.key_to_value:
            return -1  # sentinel meaning "not found"

        value = self.key_to_value[key]
        self._bump_frequency(key)
        return value

    def put(self, key, value):
        if self.capacity == 0:
            return

        if key in self.key_to_value:
            self.key_to_value[key] = value
            self._bump_frequency(key)
            return

        if len(self.key_to_value) == self.capacity:
            # Evict the least-recently-used key from the least-frequent bucket.
            evict_node = self.frequency_to_list[self.min_frequency].pop_back()
            evict_key = evict_node.key
            del self.key_to_value[evict_key]
            del self.key_to_frequency[evict_key]
            del self.key_to_node[evict_key]

        self.key_to_value[key] = value
        self.key_to_frequency[key] = 1

        if 1 not in self.frequency_to_list:
            self.frequency_to_list[1] = LFUCache._DoublyLinkedList()

        node = LFUCache._Node(key)
        self.frequency_to_list[1].push_front(node)
        self.key_to_node[key] = node
        self.min_frequency = 1  # a freshly inserted key is always at the new minimum frequency


if __name__ == "__main__":
    cache = LFUCache(2)

    cache.put(1, 1)
    cache.put(2, 2)
    print(f"get(1): {cache.get(1)}")  # 1, frequency of key 1 becomes 2

    cache.put(3, 3)  # capacity reached: evicts key 2 (frequency 1, least recent)
    print(f"get(2): {cache.get(2)}")  # -1, evicted
    print(f"get(3): {cache.get(3)}")  # 3

    cache.put(4, 4)  # capacity reached: evicts key 1 (older among freq-2 keys)
    print(f"get(1): {cache.get(1)}")  # -1, evicted
    print(f"get(3): {cache.get(3)}")  # 3
    print(f"get(4): {cache.get(4)}")  # 4
`,
        "java": `import java.util.HashMap;
import java.util.Map;

public class Main {

    // A Least Frequently Used cache with true O(1) get/put, achieved by
    // pairing every key with a node inside a doubly linked list per
    // frequency bucket -- so removing a key from its bucket never requires
    // scanning the bucket to find it.
    static class LFUCache {
        private final int capacity;
        private int minFrequency;

        private final Map<Integer, Integer> keyToValue = new HashMap<>();
        private final Map<Integer, Integer> keyToFrequency = new HashMap<>();
        private final Map<Integer, Node> keyToNode = new HashMap<>();
        private final Map<Integer, DoublyLinkedList> frequencyToList = new HashMap<>();

        // A node in a frequency bucket's doubly linked list.
        static class Node {
            int key;
            Node prev, next;
            Node(int key) { this.key = key; }
        }

        // A doubly linked list with sentinel head/tail, supporting O(1)
        // push-to-front and O(1) removal given a direct node reference.
        static class DoublyLinkedList {
            Node head = new Node(-1);
            Node tail = new Node(-1);
            int size = 0;

            DoublyLinkedList() {
                head.next = tail;
                tail.prev = head;
            }

            void pushFront(Node node) {
                node.next = head.next;
                node.prev = head;
                head.next.prev = node;
                head.next = node;
                size++;
            }

            void remove(Node node) {
                node.prev.next = node.next;
                node.next.prev = node.prev;
                size--;
            }

            Node popBack() {
                if (size == 0) return null;
                Node node = tail.prev;
                remove(node);
                return node;
            }

            boolean isEmpty() {
                return size == 0;
            }
        }

        LFUCache(int cacheCapacity) {
            this.capacity = cacheCapacity;
            this.minFrequency = 0;
        }

        // Moves a key from its old frequency bucket to (oldFrequency + 1).
        private void bumpFrequency(int key) {
            int oldFrequency = keyToFrequency.get(key);
            Node node = keyToNode.get(key);

            // O(1) removal: the node already knows its own neighbors.
            frequencyToList.get(oldFrequency).remove(node);
            if (frequencyToList.get(oldFrequency).isEmpty() && minFrequency == oldFrequency) {
                minFrequency++;
            }

            int newFrequency = oldFrequency + 1;
            keyToFrequency.put(key, newFrequency);

            frequencyToList.computeIfAbsent(newFrequency, f -> new DoublyLinkedList());
            Node newNode = new Node(key);
            frequencyToList.get(newFrequency).pushFront(newNode);
            keyToNode.put(key, newNode);
        }

        int get(int key) {
            if (!keyToValue.containsKey(key)) return -1; // sentinel meaning "not found"

            int value = keyToValue.get(key);
            bumpFrequency(key);
            return value;
        }

        void put(int key, int value) {
            if (capacity == 0) return;

            if (keyToValue.containsKey(key)) {
                keyToValue.put(key, value);
                bumpFrequency(key);
                return;
            }

            if (keyToValue.size() == capacity) {
                // Evict the least-recently-used key from the least-frequent bucket.
                Node evictNode = frequencyToList.get(minFrequency).popBack();
                int evictKey = evictNode.key;
                keyToValue.remove(evictKey);
                keyToFrequency.remove(evictKey);
                keyToNode.remove(evictKey);
            }

            keyToValue.put(key, value);
            keyToFrequency.put(key, 1);

            frequencyToList.computeIfAbsent(1, f -> new DoublyLinkedList());
            Node node = new Node(key);
            frequencyToList.get(1).pushFront(node);
            keyToNode.put(key, node);
            minFrequency = 1; // a freshly inserted key is always at the new minimum frequency
        }
    }

    public static void main(String[] args) {
        LFUCache cache = new LFUCache(2);

        cache.put(1, 1);
        cache.put(2, 2);
        System.out.println("get(1): " + cache.get(1)); // 1

        cache.put(3, 3); // evicts key 2
        System.out.println("get(2): " + cache.get(2)); // -1
        System.out.println("get(3): " + cache.get(3)); // 3

        cache.put(4, 4); // evicts key 1
        System.out.println("get(1): " + cache.get(1)); // -1
        System.out.println("get(3): " + cache.get(3)); // 3
        System.out.println("get(4): " + cache.get(4)); // 4
    }
}
`,
        "js": `// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a node inside a doubly linked list per frequency bucket --
// so removing a key from its bucket never requires scanning the bucket.

// A node in a frequency bucket's doubly linked list.
class Node {
    constructor(key) {
        this.key = key;
        this.prev = null;
        this.next = null;
    }
}

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
class DoublyLinkedList {
    constructor() {
        this.head = new Node(-1);
        this.tail = new Node(-1);
        this.head.next = this.tail;
        this.tail.prev = this.head;
        this.size = 0;
    }

    pushFront(node) {
        node.next = this.head.next;
        node.prev = this.head;
        this.head.next.prev = node;
        this.head.next = node;
        this.size++;
    }

    remove(node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
        this.size--;
    }

    popBack() {
        if (this.size === 0) return null;
        const node = this.tail.prev;
        this.remove(node);
        return node;
    }

    isEmpty() {
        return this.size === 0;
    }
}

class LFUCache {
    constructor(capacity) {
        this.capacity = capacity;
        this.minFrequency = 0;
        this.keyToValue = new Map();
        this.keyToFrequency = new Map();
        this.keyToNode = new Map();
        this.frequencyToList = new Map();
    }

    // Moves a key from its old frequency bucket to (oldFrequency + 1).
    bumpFrequency(key) {
        const oldFrequency = this.keyToFrequency.get(key);
        const node = this.keyToNode.get(key);

        // O(1) removal: the node already knows its own neighbors.
        this.frequencyToList.get(oldFrequency).remove(node);
        if (this.frequencyToList.get(oldFrequency).isEmpty() && this.minFrequency === oldFrequency) {
            this.minFrequency++;
        }

        const newFrequency = oldFrequency + 1;
        this.keyToFrequency.set(key, newFrequency);

        if (!this.frequencyToList.has(newFrequency)) {
            this.frequencyToList.set(newFrequency, new DoublyLinkedList());
        }

        const newNode = new Node(key);
        this.frequencyToList.get(newFrequency).pushFront(newNode);
        this.keyToNode.set(key, newNode);
    }

    get(key) {
        if (!this.keyToValue.has(key)) return -1; // sentinel meaning "not found"

        const value = this.keyToValue.get(key);
        this.bumpFrequency(key);
        return value;
    }

    put(key, value) {
        if (this.capacity === 0) return;

        if (this.keyToValue.has(key)) {
            this.keyToValue.set(key, value);
            this.bumpFrequency(key);
            return;
        }

        if (this.keyToValue.size === this.capacity) {
            // Evict the least-recently-used key from the least-frequent bucket.
            const evictNode = this.frequencyToList.get(this.minFrequency).popBack();
            const evictKey = evictNode.key;
            this.keyToValue.delete(evictKey);
            this.keyToFrequency.delete(evictKey);
            this.keyToNode.delete(evictKey);
        }

        this.keyToValue.set(key, value);
        this.keyToFrequency.set(key, 1);

        if (!this.frequencyToList.has(1)) {
            this.frequencyToList.set(1, new DoublyLinkedList());
        }

        const node = new Node(key);
        this.frequencyToList.get(1).pushFront(node);
        this.keyToNode.set(key, node);
        this.minFrequency = 1; // a freshly inserted key is always at the new minimum frequency
    }
}

const cache = new LFUCache(2);

cache.put(1, 1);
cache.put(2, 2);
console.log(\`get(1): \${cache.get(1)}\`); // 1

cache.put(3, 3); // evicts key 2
console.log(\`get(2): \${cache.get(2)}\`); // -1
console.log(\`get(3): \${cache.get(3)}\`); // 3

cache.put(4, 4); // evicts key 1
console.log(\`get(1): \${cache.get(1)}\`); // -1
console.log(\`get(3): \${cache.get(3)}\`); // 3
console.log(\`get(4): \${cache.get(4)}\`); // 4
`,
        "c": `#include <stdio.h>
#include <stdlib.h>

#define MAX_CAPACITY 16
#define MAX_FREQUENCY 64

// A node in a frequency bucket's doubly linked list.
typedef struct Node {
    int key;
    struct Node* prev;
    struct Node* next;
} Node;

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
typedef struct {
    Node head;
    Node tail;
    int size;
} DoublyLinkedList;

void initList(DoublyLinkedList* list) {
    list->head.next = &list->tail;
    list->tail.prev = &list->head;
    list->size = 0;
}

void pushFront(DoublyLinkedList* list, Node* node) {
    node->next = list->head.next;
    node->prev = &list->head;
    list->head.next->prev = node;
    list->head.next = node;
    list->size++;
}

void removeNode(DoublyLinkedList* list, Node* node) {
    node->prev->next = node->next;
    node->next->prev = node->prev;
    list->size--;
}

Node* popBack(DoublyLinkedList* list) {
    if (list->size == 0) return NULL;
    Node* node = list->tail.prev;
    removeNode(list, node);
    return node;
}

// The LFU cache itself. Uses simple fixed-size arrays as "hash maps" keyed
// directly by the integer key, sized generously for this demonstration.
typedef struct {
    int capacity;
    int minFrequency;

    int valueOf[MAX_CAPACITY * 4];
    int frequencyOf[MAX_CAPACITY * 4];
    Node* nodeOf[MAX_CAPACITY * 4];
    int present[MAX_CAPACITY * 4];

    DoublyLinkedList bucketAtFrequency[MAX_FREQUENCY];
} LFUCache;

void initLFUCache(LFUCache* cache, int capacity) {
    cache->capacity = capacity;
    cache->minFrequency = 0;
    for (int i = 0; i < MAX_CAPACITY * 4; i++) {
        cache->present[i] = 0;
        cache->nodeOf[i] = NULL;
    }
    for (int f = 0; f < MAX_FREQUENCY; f++) {
        initList(&cache->bucketAtFrequency[f]);
    }
}

// Moves a key from its old frequency bucket to (oldFrequency + 1).
void bumpFrequency(LFUCache* cache, int key) {
    int oldFrequency = cache->frequencyOf[key];
    Node* node = cache->nodeOf[key];

    // O(1) removal: the node already knows its own neighbors.
    removeNode(&cache->bucketAtFrequency[oldFrequency], node);
    if (cache->bucketAtFrequency[oldFrequency].size == 0 && cache->minFrequency == oldFrequency) {
        cache->minFrequency++;
    }

    int newFrequency = oldFrequency + 1;
    cache->frequencyOf[key] = newFrequency;

    Node* newNode = (Node*)malloc(sizeof(Node));
    newNode->key = key;
    pushFront(&cache->bucketAtFrequency[newFrequency], newNode);
    cache->nodeOf[key] = newNode;

    free(node);
}

int lfuGet(LFUCache* cache, int key) {
    if (!cache->present[key]) return -1; // sentinel meaning "not found"

    int value = cache->valueOf[key];
    bumpFrequency(cache, key);
    return value;
}

int countPresent(LFUCache* cache) {
    int count = 0;
    for (int i = 0; i < MAX_CAPACITY * 4; i++) if (cache->present[i]) count++;
    return count;
}

void lfuPut(LFUCache* cache, int key, int value) {
    if (cache->capacity == 0) return;

    if (cache->present[key]) {
        cache->valueOf[key] = value;
        bumpFrequency(cache, key);
        return;
    }

    if (countPresent(cache) == cache->capacity) {
        // Evict the least-recently-used key from the least-frequent bucket.
        Node* evictNode = popBack(&cache->bucketAtFrequency[cache->minFrequency]);
        int evictKey = evictNode->key;
        cache->present[evictKey] = 0;
        free(evictNode);
    }

    cache->present[key] = 1;
    cache->valueOf[key] = value;
    cache->frequencyOf[key] = 1;

    Node* node = (Node*)malloc(sizeof(Node));
    node->key = key;
    pushFront(&cache->bucketAtFrequency[1], node);
    cache->nodeOf[key] = node;

    cache->minFrequency = 1; // a freshly inserted key is always at the new minimum frequency
}

int main() {
    LFUCache cache;
    initLFUCache(&cache, 2);

    lfuPut(&cache, 1, 1);
    lfuPut(&cache, 2, 2);
    printf("get(1): %d\\n", lfuGet(&cache, 1)); // 1

    lfuPut(&cache, 3, 3); // evicts key 2
    printf("get(2): %d\\n", lfuGet(&cache, 2)); // -1
    printf("get(3): %d\\n", lfuGet(&cache, 3)); // 3

    lfuPut(&cache, 4, 4); // evicts key 1
    printf("get(1): %d\\n", lfuGet(&cache, 1)); // -1
    printf("get(3): %d\\n", lfuGet(&cache, 3)); // 3
    printf("get(4): %d\\n", lfuGet(&cache, 4)); // 4

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

// A node in a frequency bucket's doubly linked list.
class Node {
    public int Key;
    public Node Prev;
    public Node Next;
    public Node(int key) { Key = key; }
}

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
class DoublyLinkedList {
    public Node Head = new Node(-1);
    public Node Tail = new Node(-1);
    public int Size = 0;

    public DoublyLinkedList() {
        Head.Next = Tail;
        Tail.Prev = Head;
    }

    public void PushFront(Node node) {
        node.Next = Head.Next;
        node.Prev = Head;
        Head.Next.Prev = node;
        Head.Next = node;
        Size++;
    }

    public void Remove(Node node) {
        node.Prev.Next = node.Next;
        node.Next.Prev = node.Prev;
        Size--;
    }

    public Node PopBack() {
        if (Size == 0) return null;
        Node node = Tail.Prev;
        Remove(node);
        return node;
    }

    public bool IsEmpty() => Size == 0;
}

// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a node inside a doubly linked list per frequency bucket --
// so removing a key from its bucket never requires scanning the bucket.
class LFUCache {
    private readonly int capacity;
    private int minFrequency;

    private readonly Dictionary<int, int> keyToValue = new();
    private readonly Dictionary<int, int> keyToFrequency = new();
    private readonly Dictionary<int, Node> keyToNode = new();
    private readonly Dictionary<int, DoublyLinkedList> frequencyToList = new();

    public LFUCache(int cacheCapacity) {
        capacity = cacheCapacity;
        minFrequency = 0;
    }

    // Moves a key from its old frequency bucket to (oldFrequency + 1).
    private void BumpFrequency(int key) {
        int oldFrequency = keyToFrequency[key];
        Node node = keyToNode[key];

        // O(1) removal: the node already knows its own neighbors.
        frequencyToList[oldFrequency].Remove(node);
        if (frequencyToList[oldFrequency].IsEmpty() && minFrequency == oldFrequency) {
            minFrequency++;
        }

        int newFrequency = oldFrequency + 1;
        keyToFrequency[key] = newFrequency;

        if (!frequencyToList.ContainsKey(newFrequency)) {
            frequencyToList[newFrequency] = new DoublyLinkedList();
        }

        Node newNode = new Node(key);
        frequencyToList[newFrequency].PushFront(newNode);
        keyToNode[key] = newNode;
    }

    public int Get(int key) {
        if (!keyToValue.ContainsKey(key)) return -1; // sentinel meaning "not found"

        int value = keyToValue[key];
        BumpFrequency(key);
        return value;
    }

    public void Put(int key, int value) {
        if (capacity == 0) return;

        if (keyToValue.ContainsKey(key)) {
            keyToValue[key] = value;
            BumpFrequency(key);
            return;
        }

        if (keyToValue.Count == capacity) {
            // Evict the least-recently-used key from the least-frequent bucket.
            Node evictNode = frequencyToList[minFrequency].PopBack();
            int evictKey = evictNode.Key;
            keyToValue.Remove(evictKey);
            keyToFrequency.Remove(evictKey);
            keyToNode.Remove(evictKey);
        }

        keyToValue[key] = value;
        keyToFrequency[key] = 1;

        if (!frequencyToList.ContainsKey(1)) {
            frequencyToList[1] = new DoublyLinkedList();
        }

        Node insertedNode = new Node(key);
        frequencyToList[1].PushFront(insertedNode);
        keyToNode[key] = insertedNode;
        minFrequency = 1; // a freshly inserted key is always at the new minimum frequency
    }
}

class Program {
    static void Main() {
        var cache = new LFUCache(2);

        cache.Put(1, 1);
        cache.Put(2, 2);
        Console.WriteLine($"get(1): {cache.Get(1)}"); // 1

        cache.Put(3, 3); // evicts key 2
        Console.WriteLine($"get(2): {cache.Get(2)}"); // -1
        Console.WriteLine($"get(3): {cache.Get(3)}"); // 3

        cache.Put(4, 4); // evicts key 1
        Console.WriteLine($"get(1): {cache.Get(1)}"); // -1
        Console.WriteLine($"get(3): {cache.Get(3)}"); // 3
        Console.WriteLine($"get(4): {cache.Get(4)}"); // 4
    }
}
`,
        "swift": `import Foundation

// A node in a frequency bucket's doubly linked list.
final class Node {
    let key: Int
    var prev: Node?
    var next: Node?
    init(_ key: Int) { self.key = key }
}

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
final class DoublyLinkedList {
    let head = Node(-1)
    let tail = Node(-1)
    var size = 0

    init() {
        head.next = tail
        tail.prev = head
    }

    func pushFront(_ node: Node) {
        node.next = head.next
        node.prev = head
        head.next?.prev = node
        head.next = node
        size += 1
    }

    func remove(_ node: Node) {
        node.prev?.next = node.next
        node.next?.prev = node.prev
        size -= 1
    }

    func popBack() -> Node? {
        if size == 0 { return nil }
        let node = tail.prev!
        remove(node)
        return node
    }

    func isEmpty() -> Bool { size == 0 }
}

// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a node inside a doubly linked list per frequency bucket --
// so removing a key from its bucket never requires scanning the bucket.
final class LFUCache {
    private let capacity: Int
    private var minFrequency = 0

    private var keyToValue: [Int: Int] = [:]
    private var keyToFrequency: [Int: Int] = [:]
    private var keyToNode: [Int: Node] = [:]
    private var frequencyToList: [Int: DoublyLinkedList] = [:]

    init(_ cacheCapacity: Int) {
        capacity = cacheCapacity
    }

    // Moves a key from its old frequency bucket to (oldFrequency + 1).
    private func bumpFrequency(_ key: Int) {
        let oldFrequency = keyToFrequency[key]!
        let node = keyToNode[key]!

        // O(1) removal: the node already knows its own neighbors.
        frequencyToList[oldFrequency]!.remove(node)
        if frequencyToList[oldFrequency]!.isEmpty() && minFrequency == oldFrequency {
            minFrequency += 1
        }

        let newFrequency = oldFrequency + 1
        keyToFrequency[key] = newFrequency

        if frequencyToList[newFrequency] == nil {
            frequencyToList[newFrequency] = DoublyLinkedList()
        }

        let newNode = Node(key)
        frequencyToList[newFrequency]!.pushFront(newNode)
        keyToNode[key] = newNode
    }

    func get(_ key: Int) -> Int {
        guard let value = keyToValue[key] else { return -1 } // "not found"

        bumpFrequency(key)
        return value
    }

    func put(_ key: Int, _ value: Int) {
        if capacity == 0 { return }

        if keyToValue[key] != nil {
            keyToValue[key] = value
            bumpFrequency(key)
            return
        }

        if keyToValue.count == capacity {
            // Evict the least-recently-used key from the least-frequent bucket.
            if let evictNode = frequencyToList[minFrequency]?.popBack() {
                let evictKey = evictNode.key
                keyToValue.removeValue(forKey: evictKey)
                keyToFrequency.removeValue(forKey: evictKey)
                keyToNode.removeValue(forKey: evictKey)
            }
        }

        keyToValue[key] = value
        keyToFrequency[key] = 1

        if frequencyToList[1] == nil {
            frequencyToList[1] = DoublyLinkedList()
        }

        let node = Node(key)
        frequencyToList[1]!.pushFront(node)
        keyToNode[key] = node
        minFrequency = 1 // a freshly inserted key is always at the new minimum frequency
    }
}

let cache = LFUCache(2)

cache.put(1, 1)
cache.put(2, 2)
print("get(1): \\(cache.get(1))") // 1

cache.put(3, 3) // evicts key 2
print("get(2): \\(cache.get(2))") // -1
print("get(3): \\(cache.get(3))") // 3

cache.put(4, 4) // evicts key 1
print("get(1): \\(cache.get(1))") // -1
print("get(3): \\(cache.get(3))") // 3
print("get(4): \\(cache.get(4))") // 4
`,
        "kotlin": `// A node in a frequency bucket's doubly linked list.
class Node(val key: Int) {
    var prev: Node? = null
    var next: Node? = null
}

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
class DoublyLinkedList {
    val head = Node(-1)
    val tail = Node(-1)
    var size = 0

    init {
        head.next = tail
        tail.prev = head
    }

    fun pushFront(node: Node) {
        node.next = head.next
        node.prev = head
        head.next?.prev = node
        head.next = node
        size++
    }

    fun remove(node: Node) {
        node.prev?.next = node.next
        node.next?.prev = node.prev
        size--
    }

    fun popBack(): Node? {
        if (size == 0) return null
        val node = tail.prev!!
        remove(node)
        return node
    }

    fun isEmpty(): Boolean = size == 0
}

// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a node inside a doubly linked list per frequency bucket --
// so removing a key from its bucket never requires scanning the bucket.
class LFUCache(private val capacity: Int) {
    private var minFrequency = 0

    private val keyToValue = HashMap<Int, Int>()
    private val keyToFrequency = HashMap<Int, Int>()
    private val keyToNode = HashMap<Int, Node>()
    private val frequencyToList = HashMap<Int, DoublyLinkedList>()

    // Moves a key from its old frequency bucket to (oldFrequency + 1).
    private fun bumpFrequency(key: Int) {
        val oldFrequency = keyToFrequency[key]!!
        val node = keyToNode[key]!!

        // O(1) removal: the node already knows its own neighbors.
        frequencyToList[oldFrequency]!!.remove(node)
        if (frequencyToList[oldFrequency]!!.isEmpty() && minFrequency == oldFrequency) {
            minFrequency++
        }

        val newFrequency = oldFrequency + 1
        keyToFrequency[key] = newFrequency

        frequencyToList.getOrPut(newFrequency) { DoublyLinkedList() }
        val newNode = Node(key)
        frequencyToList[newFrequency]!!.pushFront(newNode)
        keyToNode[key] = newNode
    }

    fun get(key: Int): Int {
        val value = keyToValue[key] ?: return -1 // sentinel meaning "not found"
        bumpFrequency(key)
        return value
    }

    fun put(key: Int, value: Int) {
        if (capacity == 0) return

        if (keyToValue.containsKey(key)) {
            keyToValue[key] = value
            bumpFrequency(key)
            return
        }

        if (keyToValue.size == capacity) {
            // Evict the least-recently-used key from the least-frequent bucket.
            val evictNode = frequencyToList[minFrequency]!!.popBack()
            if (evictNode != null) {
                keyToValue.remove(evictNode.key)
                keyToFrequency.remove(evictNode.key)
                keyToNode.remove(evictNode.key)
            }
        }

        keyToValue[key] = value
        keyToFrequency[key] = 1

        frequencyToList.getOrPut(1) { DoublyLinkedList() }
        val node = Node(key)
        frequencyToList[1]!!.pushFront(node)
        keyToNode[key] = node
        minFrequency = 1 // a freshly inserted key is always at the new minimum frequency
    }
}

fun main() {
    val cache = LFUCache(2)

    cache.put(1, 1)
    cache.put(2, 2)
    println("get(1): \${cache.get(1)}") // 1

    cache.put(3, 3) // evicts key 2
    println("get(2): \${cache.get(2)}") // -1
    println("get(3): \${cache.get(3)}") // 3

    cache.put(4, 4) // evicts key 1
    println("get(1): \${cache.get(1)}") // -1
    println("get(3): \${cache.get(3)}") // 3
    println("get(4): \${cache.get(4)}") // 4
}
`,
        "scala": `import scala.collection.mutable

// A node in a frequency bucket's doubly linked list.
class Node(val key: Int) {
    var prev: Node = null
    var next: Node = null
}

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
class DoublyLinkedList {
    val head = new Node(-1)
    val tail = new Node(-1)
    var size = 0

    head.next = tail
    tail.prev = head

    def pushFront(node: Node): Unit = {
        node.next = head.next
        node.prev = head
        head.next.prev = node
        head.next = node
        size += 1
    }

    def remove(node: Node): Unit = {
        node.prev.next = node.next
        node.next.prev = node.prev
        size -= 1
    }

    def popBack(): Option[Node] = {
        if (size == 0) return None
        val node = tail.prev
        remove(node)
        Some(node)
    }

    def isEmpty: Boolean = size == 0
}

// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a node inside a doubly linked list per frequency bucket --
// so removing a key from its bucket never requires scanning the bucket.
class LFUCache(capacity: Int) {
    private var minFrequency = 0

    private val keyToValue = mutable.Map[Int, Int]()
    private val keyToFrequency = mutable.Map[Int, Int]()
    private val keyToNode = mutable.Map[Int, Node]()
    private val frequencyToList = mutable.Map[Int, DoublyLinkedList]()

    // Moves a key from its old frequency bucket to (oldFrequency + 1).
    private def bumpFrequency(key: Int): Unit = {
        val oldFrequency = keyToFrequency(key)
        val node = keyToNode(key)

        // O(1) removal: the node already knows its own neighbors.
        frequencyToList(oldFrequency).remove(node)
        if (frequencyToList(oldFrequency).isEmpty && minFrequency == oldFrequency) {
            minFrequency += 1
        }

        val newFrequency = oldFrequency + 1
        keyToFrequency(key) = newFrequency

        frequencyToList.getOrElseUpdate(newFrequency, new DoublyLinkedList())
        val newNode = new Node(key)
        frequencyToList(newFrequency).pushFront(newNode)
        keyToNode(key) = newNode
    }

    def get(key: Int): Int = {
        keyToValue.get(key) match {
            case None => -1 // sentinel meaning "not found"
            case Some(value) =>
                bumpFrequency(key)
                value
        }
    }

    def put(key: Int, value: Int): Unit = {
        if (capacity == 0) return

        if (keyToValue.contains(key)) {
            keyToValue(key) = value
            bumpFrequency(key)
            return
        }

        if (keyToValue.size == capacity) {
            // Evict the least-recently-used key from the least-frequent bucket.
            frequencyToList(minFrequency).popBack().foreach { evictNode =>
                keyToValue.remove(evictNode.key)
                keyToFrequency.remove(evictNode.key)
                keyToNode.remove(evictNode.key)
            }
        }

        keyToValue(key) = value
        keyToFrequency(key) = 1

        frequencyToList.getOrElseUpdate(1, new DoublyLinkedList())
        val node = new Node(key)
        frequencyToList(1).pushFront(node)
        keyToNode(key) = node
        minFrequency = 1 // a freshly inserted key is always at the new minimum frequency
    }
}

object Main extends App {
    val cache = new LFUCache(2)

    cache.put(1, 1)
    cache.put(2, 2)
    println(s"get(1): \${cache.get(1)}") // 1

    cache.put(3, 3) // evicts key 2
    println(s"get(2): \${cache.get(2)}") // -1
    println(s"get(3): \${cache.get(3)}") // 3

    cache.put(4, 4) // evicts key 1
    println(s"get(1): \${cache.get(1)}") // -1
    println(s"get(3): \${cache.get(3)}") // 3
    println(s"get(4): \${cache.get(4)}") // 4
}
`,
        "go": `package main

import "fmt"

// node is a single entry in a frequency bucket's doubly linked list.
type node struct {
    key  int
    prev *node
    next *node
}

// doublyLinkedList is a list with sentinel head/tail nodes, supporting
// O(1) push-to-front and O(1) removal given a direct node reference.
type doublyLinkedList struct {
    head *node
    tail *node
    size int
}

func newDoublyLinkedList() *doublyLinkedList {
    head := &node{key: -1}
    tail := &node{key: -1}
    head.next = tail
    tail.prev = head
    return &doublyLinkedList{head: head, tail: tail, size: 0}
}

func (list *doublyLinkedList) pushFront(n *node) {
    n.next = list.head.next
    n.prev = list.head
    list.head.next.prev = n
    list.head.next = n
    list.size++
}

func (list *doublyLinkedList) remove(n *node) {
    n.prev.next = n.next
    n.next.prev = n.prev
    list.size--
}

func (list *doublyLinkedList) popBack() *node {
    if list.size == 0 {
        return nil
    }
    n := list.tail.prev
    list.remove(n)
    return n
}

func (list *doublyLinkedList) isEmpty() bool {
    return list.size == 0
}

// LFUCache is a Least Frequently Used cache with true O(1) get/put,
// achieved by pairing every key with a node inside a doubly linked list
// per frequency bucket -- so removing a key from its bucket never
// requires scanning the bucket to find it.
type LFUCache struct {
    capacity      int
    minFrequency  int
    keyToValue    map[int]int
    keyToFrequency map[int]int
    keyToNode     map[int]*node
    frequencyToList map[int]*doublyLinkedList
}

func newLFUCache(capacity int) *LFUCache {
    return &LFUCache{
        capacity:        capacity,
        minFrequency:    0,
        keyToValue:      make(map[int]int),
        keyToFrequency:  make(map[int]int),
        keyToNode:       make(map[int]*node),
        frequencyToList: make(map[int]*doublyLinkedList),
    }
}

// bumpFrequency moves a key from its old frequency bucket to (oldFrequency + 1).
func (cache *LFUCache) bumpFrequency(key int) {
    oldFrequency := cache.keyToFrequency[key]
    n := cache.keyToNode[key]

    // O(1) removal: the node already knows its own neighbors.
    cache.frequencyToList[oldFrequency].remove(n)
    if cache.frequencyToList[oldFrequency].isEmpty() && cache.minFrequency == oldFrequency {
        cache.minFrequency++
    }

    newFrequency := oldFrequency + 1
    cache.keyToFrequency[key] = newFrequency

    if _, exists := cache.frequencyToList[newFrequency]; !exists {
        cache.frequencyToList[newFrequency] = newDoublyLinkedList()
    }

    newNode := &node{key: key}
    cache.frequencyToList[newFrequency].pushFront(newNode)
    cache.keyToNode[key] = newNode
}

func (cache *LFUCache) Get(key int) int {
    value, found := cache.keyToValue[key]
    if !found {
        return -1 // sentinel meaning "not found"
    }

    cache.bumpFrequency(key)
    return value
}

func (cache *LFUCache) Put(key int, value int) {
    if cache.capacity == 0 {
        return
    }

    if _, found := cache.keyToValue[key]; found {
        cache.keyToValue[key] = value
        cache.bumpFrequency(key)
        return
    }

    if len(cache.keyToValue) == cache.capacity {
        // Evict the least-recently-used key from the least-frequent bucket.
        evictNode := cache.frequencyToList[cache.minFrequency].popBack()
        if evictNode != nil {
            delete(cache.keyToValue, evictNode.key)
            delete(cache.keyToFrequency, evictNode.key)
            delete(cache.keyToNode, evictNode.key)
        }
    }

    cache.keyToValue[key] = value
    cache.keyToFrequency[key] = 1

    if _, exists := cache.frequencyToList[1]; !exists {
        cache.frequencyToList[1] = newDoublyLinkedList()
    }

    insertedNode := &node{key: key}
    cache.frequencyToList[1].pushFront(insertedNode)
    cache.keyToNode[key] = insertedNode
    cache.minFrequency = 1 // a freshly inserted key is always at the new minimum frequency
}

func main() {
    cache := newLFUCache(2)

    cache.Put(1, 1)
    cache.Put(2, 2)
    fmt.Printf("get(1): %d\\n", cache.Get(1)) // 1

    cache.Put(3, 3) // evicts key 2
    fmt.Printf("get(2): %d\\n", cache.Get(2)) // -1
    fmt.Printf("get(3): %d\\n", cache.Get(3)) // 3

    cache.Put(4, 4) // evicts key 1
    fmt.Printf("get(1): %d\\n", cache.Get(1)) // -1
    fmt.Printf("get(3): %d\\n", cache.Get(3)) // 3
    fmt.Printf("get(4): %d\\n", cache.Get(4)) // 4
}
`,
        "rust": `use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;

// A node in a frequency bucket's doubly linked list.
struct Node {
    key: i32,
    prev: Option<Rc<RefCell<Node>>>,
    next: Option<Rc<RefCell<Node>>>,
}

impl Node {
    fn new(key: i32) -> Rc<RefCell<Node>> {
        Rc::new(RefCell::new(Node { key, prev: None, next: None }))
    }
}

// A doubly linked list with sentinel head/tail, supporting O(1)
// push-to-front and O(1) removal given a direct node reference.
struct DoublyLinkedList {
    head: Rc<RefCell<Node>>,
    tail: Rc<RefCell<Node>>,
    size: usize,
}

impl DoublyLinkedList {
    fn new() -> Self {
        let head = Node::new(-1);
        let tail = Node::new(-1);
        head.borrow_mut().next = Some(Rc::clone(&tail));
        tail.borrow_mut().prev = Some(Rc::clone(&head));
        DoublyLinkedList { head, tail, size: 0 }
    }

    fn push_front(&mut self, node: Rc<RefCell<Node>>) {
        let old_first = self.head.borrow().next.clone().unwrap();
        node.borrow_mut().next = Some(Rc::clone(&old_first));
        node.borrow_mut().prev = Some(Rc::clone(&self.head));
        old_first.borrow_mut().prev = Some(Rc::clone(&node));
        self.head.borrow_mut().next = Some(node);
        self.size += 1;
    }

    fn remove(&mut self, node: &Rc<RefCell<Node>>) {
        let prev = node.borrow().prev.clone().unwrap();
        let next = node.borrow().next.clone().unwrap();
        prev.borrow_mut().next = Some(Rc::clone(&next));
        next.borrow_mut().prev = Some(prev);
        self.size -= 1;
    }

    fn pop_back(&mut self) -> Option<Rc<RefCell<Node>>> {
        if self.size == 0 {
            return None;
        }
        let node = self.tail.borrow().prev.clone().unwrap();
        self.remove(&node);
        Some(node)
    }

    fn is_empty(&self) -> bool {
        self.size == 0
    }
}

// A Least Frequently Used cache with true O(1) get/put, achieved by pairing
// every key with a node inside a doubly linked list per frequency bucket --
// so removing a key from its bucket never requires scanning the bucket.
struct LFUCache {
    capacity: usize,
    min_frequency: i32,
    key_to_value: HashMap<i32, i32>,
    key_to_frequency: HashMap<i32, i32>,
    key_to_node: HashMap<i32, Rc<RefCell<Node>>>,
    frequency_to_list: HashMap<i32, DoublyLinkedList>,
}

impl LFUCache {
    fn new(capacity: usize) -> Self {
        LFUCache {
            capacity,
            min_frequency: 0,
            key_to_value: HashMap::new(),
            key_to_frequency: HashMap::new(),
            key_to_node: HashMap::new(),
            frequency_to_list: HashMap::new(),
        }
    }

    // Moves a key from its old frequency bucket to (old_frequency + 1).
    fn bump_frequency(&mut self, key: i32) {
        let old_frequency = *self.key_to_frequency.get(&key).unwrap();
        let node = self.key_to_node.get(&key).unwrap().clone();

        // O(1) removal: the node already knows its own neighbors.
        let old_bucket = self.frequency_to_list.get_mut(&old_frequency).unwrap();
        old_bucket.remove(&node);
        let old_bucket_empty = old_bucket.is_empty();

        if old_bucket_empty && self.min_frequency == old_frequency {
            self.min_frequency += 1;
        }

        let new_frequency = old_frequency + 1;
        self.key_to_frequency.insert(key, new_frequency);

        let new_bucket = self
            .frequency_to_list
            .entry(new_frequency)
            .or_insert_with(DoublyLinkedList::new);

        let new_node = Node::new(key);
        new_bucket.push_front(Rc::clone(&new_node));
        self.key_to_node.insert(key, new_node);
    }

    fn get(&mut self, key: i32) -> i32 {
        match self.key_to_value.get(&key) {
            None => -1, // sentinel meaning "not found"
            Some(&value) => {
                self.bump_frequency(key);
                value
            }
        }
    }

    fn put(&mut self, key: i32, value: i32) {
        if self.capacity == 0 {
            return;
        }

        if self.key_to_value.contains_key(&key) {
            self.key_to_value.insert(key, value);
            self.bump_frequency(key);
            return;
        }

        if self.key_to_value.len() == self.capacity {
            // Evict the least-recently-used key from the least-frequent bucket.
            if let Some(bucket) = self.frequency_to_list.get_mut(&self.min_frequency) {
                if let Some(evict_node) = bucket.pop_back() {
                    let evict_key = evict_node.borrow().key;
                    self.key_to_value.remove(&evict_key);
                    self.key_to_frequency.remove(&evict_key);
                    self.key_to_node.remove(&evict_key);
                }
            }
        }

        self.key_to_value.insert(key, value);
        self.key_to_frequency.insert(key, 1);

        let bucket = self.frequency_to_list.entry(1).or_insert_with(DoublyLinkedList::new);
        let node = Node::new(key);
        bucket.push_front(Rc::clone(&node));
        self.key_to_node.insert(key, node);
        self.min_frequency = 1; // a freshly inserted key is always at the new minimum frequency
    }
}

fn main() {
    let mut cache = LFUCache::new(2);

    cache.put(1, 1);
    cache.put(2, 2);
    println!("get(1): {}", cache.get(1)); // 1

    cache.put(3, 3); // evicts key 2
    println!("get(2): {}", cache.get(2)); // -1
    println!("get(3): {}", cache.get(3)); // 3

    cache.put(4, 4); // evicts key 1
    println!("get(1): {}", cache.get(1)); // -1
    println!("get(3): {}", cache.get(3)); // 3
    println!("get(4): {}", cache.get(4)); // 4
}
`
      }
    }

  ],
  desc: "Frequency count, anagram, LRU cache",
  complexity: "O(1) avg",
  featured: true
};

export default HASH_MAPS_SECTION;
