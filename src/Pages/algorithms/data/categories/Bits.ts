const BIT_MANIPULATION_SECTION = {
  name: "Bit Manipulation",
  href: "/algorithms/bit_manipulation",
  iconId: "Bits",
  hoverIconId: "Bits",

  about: [
    { tag: "h1", text: "Bit Manipulation" },
    {
      tag: "p",
      text: "Bit manipulation operates directly on the binary representation of numbers using bitwise operators — AND (&), OR (|), XOR (^), NOT (~), and shifts (<<, >>) — instead of arithmetic or comparison operators. These operations execute as single CPU instructions, making bit-level techniques some of the fastest and most memory-efficient tools available, often replacing what would otherwise require a hash set, an extra array, or a loop with conditional branching.",
    },
    {
      tag: "p",
      text: "The recurring theme across this entire section is XOR's uniquely useful self-cancelling property: a ^ a = 0 and a ^ 0 = a, for any value a. This single algebraic fact — that XOR-ing a value with itself eliminates it, while XOR-ing with zero leaves it untouched — is the foundation of Single Number, a core trick in Missing Number, and appears throughout competitive programming wherever a problem involves 'find the one thing that doesn't pair up' or 'toggle a state without tracking it explicitly'.",
    },
    { tag: "h2", text: "Core operations at a glance" },
    {
      tag: "table",
      headers: ["Operation", "Symbol", "Common Use"],
      rows: [
        ["AND", "&", "Masking — isolate specific bits, check if a bit is set"],
        ["OR", "|", "Setting bits — turn a specific bit on without affecting others"],
        ["XOR", "^", "Toggling bits, finding unpaired elements, swapping without a temp variable"],
        ["NOT", "~", "Bit inversion, constructing masks (e.g. ~0 is all 1s)"],
        [
          "Left shift",
          "<< k",
          "Multiply by 2^k; also used to construct bitmasks (1 << k isolates bit k)",
        ],
        [
          "Right shift",
          ">> k",
          "Divide by 2^k (integer division); used to inspect bits one at a time",
        ],
      ],
    },
    { tag: "h2", text: "Two essential one-line identities" },
    {
      tag: "ul",
      items: [
        "n & (n − 1) clears the LOWEST set bit of n — used to count set bits efficiently (Counting Bits) and to check if n is a power of two (a power of two has exactly one set bit, so n & (n−1) == 0 exactly when n is a power of two, for positive n)",
        "n & (-n) isolates ONLY the lowest set bit of n — this single identity is the entire mechanism behind the Fenwick Tree / Binary Indexed Tree in the Range Structures section, where it determines exactly which range a given index is responsible for",
      ],
    },
    {
      tag: "note",
      variant: "tip",
      text: "Whenever a problem mentions finding a single unpaired/unique element among many paired/duplicated ones, and asks for O(1) space, XOR is almost always the intended technique — it's one of the strongest pattern-recognition signals in this entire reference.",
    },
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
        {
          tag: "p",
          text: "Given an array where every element appears exactly TWICE except for one element that appears exactly ONCE, find that single unpaired element — and do it in O(n) time with O(1) extra space (ruling out the otherwise-obvious hash-set-based counting approach, which would need O(n) space). XOR-ing every element together solves this in a single pass, exploiting the fact that XOR is commutative, associative, and self-cancelling.",
        },
        {
          tag: "p",
          text: "The mechanism: XOR-ing all n elements together, in ANY order (since XOR is commutative and associative, order doesn't matter), causes every PAIRED value to cancel itself out completely (a ^ a = 0), leaving only the single unpaired value as the final result (since anything XOR-ed with 0 is unchanged). This is the textbook introductory example for the entire XOR-based bit manipulation family of techniques.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The literal 'find the single non-duplicated element' problem, with the specific O(1)-space constraint that rules out hash-set counting",
            "As the conceptual foundation before tackling harder variants: 'Single Number II' (every element appears exactly THREE times except one, requiring bitwise counting per bit position rather than simple XOR) and 'Single Number III' (exactly TWO unique elements among pairs, requiring a partitioning trick based on a differing bit)",
            "Any 'find what's unpaired/unmatched' problem where elements that should cancel out can be modeled as XOR-able values — error detection/checksums in data transmission rely on a closely related XOR-parity principle",
            "A canonical demonstration that bitwise tricks can solve a problem that LOOKS like it needs a hash set, in genuinely less auxiliary space",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "This specific XOR trick only works because every duplicate appears EXACTLY twice — for 'every element appears three times except one' (Single Number II), simple XOR no longer works, since three XORs of the same value don't cancel to zero; a more involved per-bit counting technique is needed instead.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          {
            tag: "p",
            text: "Every single element must be XOR-ed into the running result to guarantee correctness — there's no early-exit shortcut, since skipping even one element could change which value survives the cancellation process.",
          },
          {
            tag: "ul",
            items: [
              "n elements, each requiring exactly one O(1) XOR operation against the running result: O(n)",
              "Best case still requires the full pass, since correctness depends on every paired value being present to cancel out",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          {
            tag: "p",
            text: "Every element triggers an identical O(1) XOR operation regardless of its specific value or position in the array — there's no value-dependent branching in this algorithm at all.",
          },
          {
            tag: "ul",
            items: [
              "n iterations × O(1) work each = O(n)",
              "No input distribution changes this fixed per-element cost",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          {
            tag: "p",
            text: "No array configuration increases the cost beyond a single full pass — this is simultaneously the best, average, and worst case, since XOR-ing has no conditional behavior that could vary by input.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(n)",
              "This matches the trivial lower bound: any correct algorithm must examine every element at least once, since any single element could be the unpaired one",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          {
            tag: "p",
            text: "Only a single running variable (the accumulated XOR result) is needed throughout the entire algorithm, regardless of array size.",
          },
          { tag: "ul", items: ["result accumulator — O(1)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          {
            tag: "p",
            text: "Memory usage never depends on array length or content — it's always exactly one integer-sized accumulator, a dramatic improvement over a hash-set-based counting approach's O(n) space.",
          },
          { tag: "ul", items: ["No auxiliary array, set, or map — purely one running scalar"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          {
            tag: "p",
            text: "No array size or content increases memory usage beyond the single accumulator variable — this space efficiency is the entire reason this bit-manipulation approach is preferred over a hash-set-based alternative.",
          },
          {
            tag: "ul",
            items: [
              "O(1) regardless of n — this is the key advantage that makes the XOR trick the canonical solution for this specific problem",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function singleNumber(nums):
    result ← 0

    for num in nums:
        result ← result ^ num

    return result`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialise an accumulator to 0 — chosen specifically because 0 is XOR's identity element (x ^ 0 = x for any x), so it doesn't interfere with the first value XOR-ed into it.",
            "XOR every element of the array into the accumulator, one at a time, in whatever order they appear.",
            "Because XOR is commutative (a ^ b = b ^ a) and associative ((a ^ b) ^ c = a ^ (b ^ c)), the final result is identical regardless of the order the elements were processed in — equivalent to XOR-ing the entire multiset of values together in any grouping.",
            "Every value that appears exactly twice contributes a pair that cancels to 0 (since a ^ a = 0), leaving only the single unpaired value's contribution in the final accumulated result.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "By the commutative and associative properties of XOR, the final accumulated result is independent of processing order and can be conceptually regrouped as (pair1_a ^ pair1_b) ^ (pair2_a ^ pair2_b) ^ ... ^ singleValue. Each parenthesised pair, by definition, XORs an identical value with itself, which always evaluates to exactly 0 (a ^ a = 0 for any a). Since 0 is XOR's identity element, every one of these zero-valued pair-terms vanishes from the overall expression without affecting it, leaving the final result exactly equal to 0 ^ 0 ^ ... ^ singleValue = singleValue — the one element that had no pair to cancel it out.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

int singleNumber(vector<int>& nums) {
    int mask = 0;

    for (int curr = 0; curr < nums.size(); curr++)
        mask ^= nums[curr];

    return mask;
}

int main() {
    vector<int> nums = {4, 1, 2, 1, 2};
    cout << singleNumber(nums) << endl;
    return 0;
}`,
        python: `def single_number(nums):
    mask = 0
    for n in nums:
        mask ^= n
    return mask

if __name__ == "__main__":
    nums = [4, 1, 2, 1, 2]
    print(single_number(nums))`,
        java: `public class Main {
    public static int singleNumber(int[] nums) {
        int mask = 0;
        for (int n : nums) {
            mask ^= n;
        }
        return mask;
    }

    public static void main(String[] args) {
        int[] nums = {4, 1, 2, 1, 2};
        System.out.println(singleNumber(nums));
    }
}`,
        js: `function singleNumber(nums) {
    let mask = 0;
    for (let n of nums) {
        mask ^= n;
    }
    return mask;
}

const nums = [4, 1, 2, 1, 2];
console.log(singleNumber(nums));`,
        c: `#include <stdio.h>

int singleNumber(int* nums, int numsSize) {
    int mask = 0;
    for (int i = 0; i < numsSize; i++) {
        mask ^= nums[i];
    }
    return mask;
}

int main() {
    int nums[] = {4, 1, 2, 1, 2};
    printf("%d\\n", singleNumber(nums, 5));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int SingleNumber(int[] nums) {
        int mask = 0;
        foreach (int n in nums) {
            mask ^= n;
        }
        return mask;
    }

    static void Main() {
        int[] nums = {4, 1, 2, 1, 2};
        Console.WriteLine(SingleNumber(nums));
    }
}`,
        swift: `func singleNumber(_ nums: [Int]) -> Int {
    var mask = 0
    for n in nums {
        mask ^= n
    }
    return mask
}

let nums = [4, 1, 2, 1, 2]
print(singleNumber(nums))`,
        kotlin: `fun singleNumber(nums: IntArray): Int {
    var mask = 0
    for (n in nums) {
        mask = mask xor n
    }
    return mask
}

fun main() {
    val nums = intArrayOf(4, 1, 2, 1, 2)
    println(singleNumber(nums))
}`,
        scala: `object Main extends App {
    def singleNumber(nums: Array[Int]): Int = {
        nums.foldLeft(0)(_ ^ _)
    }

    val nums = Array(4, 1, 2, 1, 2)
    println(singleNumber(nums))
}`,
        go: `package main

import "fmt"

func singleNumber(nums []int) int {
    mask := 0
    for _, n := range nums {
        mask ^= n
    }
    return mask
}

func main() {
    nums := []int{4, 1, 2, 1, 2}
    fmt.Println(singleNumber(nums))
}`,
        rust: `fn single_number(nums: Vec<i32>) -> i32 {
    nums.into_iter().fold(0, |acc, x| acc ^ x)
}

fn main() {
    let nums = vec![4, 1, 2, 1, 2];
    println!("{}", single_number(nums));
}`,
      },
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
        {
          tag: "p",
          text: "Given a non-negative integer n, compute, for EVERY integer from 0 to n, the number of set bits (1s) in its binary representation. Computing this independently for each number (using the standard bit-counting loop, O(log v) per value v) would cost O(n log n) total — a dynamic-programming-style relationship between consecutive numbers' bit counts achieves O(n) total instead, using each previously computed answer to derive the next in O(1).",
        },
        {
          tag: "p",
          text: "The key recurrence relies on the identity i & (i − 1): this operation clears the LOWEST set bit of i, producing a smaller number whose bit count is already known (since it's necessarily less than i, and the algorithm processes numbers in increasing order). The bit count of i is therefore exactly one more than the bit count of i & (i − 1) — one extra set bit (the one that got cleared) plus however many were already in the smaller, already-computed value.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Computing the 'popcount' (set-bit count) for every value in a range, where the O(n) batch relationship beats computing each one independently",
            "As a teaching example for the i & (i-1) bit-clearing trick, which appears throughout bit manipulation (also used to check if a number is a power of two, and as the conceptual basis for Brian Kernighan's bit-counting algorithm)",
            "Building lookup tables for fast popcount operations, a common left-level optimisation in performance-critical code (graphics, cryptography, bioinformatics bit-vector operations)",
            "A clean illustration of recognising a DP-STYLE recurrence hiding inside what initially looks like a purely bitwise, non-DP problem",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "An alternative, equally valid O(n) recurrence uses i >> 1 (right shift) instead: bits[i] = bits[i >> 1] + (i & 1) — the bit count of i equals the bit count of i with its lowest bit removed by shifting, plus 1 if that lowest bit was itself a 1. Both recurrences achieve the identical O(n) bound via different but related bit-level insights.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          {
            tag: "p",
            text: "Every value from 0 to n must have its bit count computed and stored — there's no shortcut even for the most favourable n, since every position in the output array must be filled.",
          },
          {
            tag: "ul",
            items: [
              "n + 1 values (0 through n inclusive), each requiring O(1) work using the recurrence: O(n)",
              "Even the smallest possible n still requires this same linear relationship to be applied",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          {
            tag: "p",
            text: "Every value's bit count is computed via the SAME O(1) recurrence (one bitwise AND operation, one array lookup, one addition) regardless of the specific value's bit pattern.",
          },
          {
            tag: "ul",
            items: [
              "n + 1 values, each O(1) via the recurrence bits[i] = bits[i & (i−1)] + 1: O(n) total",
              "No value-dependent branching changes this fixed per-value cost",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          {
            tag: "p",
            text: "No value of n or bit-pattern distribution increases the cost beyond the fixed linear recurrence application — this is simultaneously the best, average, and worst case.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(n)",
              "This is a genuine improvement over the naive O(n log n) approach (computing each value's bit count independently via a loop), achieved entirely by reusing previously computed smaller values",
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
            text: "The output array must store exactly one bit-count entry per integer from 0 to n, requiring space proportional to n regardless of the actual bit-count values.",
          },
          { tag: "ul", items: ["Output array: n + 1 entries — O(n)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n)" },
          {
            tag: "p",
            text: "Space usage is fixed by n alone, since the output array's size is determined entirely by the range requested, not by the specific bit patterns of the numbers within that range.",
          },
          { tag: "ul", items: ["Same O(n) bound regardless of bit-pattern distribution"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "No value of n changes the structural requirement of needing exactly one output slot per integer in the range — this is both the floor and ceiling for the algorithm's memory footprint, since the problem itself demands an answer for every value.",
          },
          {
            tag: "ul",
            items: [
              "O(n) total, identical across all cases — this is an unavoidable cost of the problem itself (n+1 outputs are required), not a flaw of this specific algorithm",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function countBits(n):
    bits ← array of size n + 1, all zero

    for i from 1 to n:
        bits[i] ← bits[i & (i − 1)] + 1

    return bits`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialise bits[0] = 0 implicitly (zero has no set bits) — the base case of the recurrence.",
            "For each subsequent integer i, compute i & (i − 1) — this bitwise operation clears the LOWEST set bit of i, producing a strictly smaller non-negative integer.",
            "Since i & (i − 1) is always strictly less than i, its bit count has ALREADY been computed and stored earlier in the same loop (processing in increasing order guarantees this).",
            "The bit count of i is exactly one more than the bit count of i & (i − 1) — because clearing the lowest set bit removed exactly one '1' from the binary representation, so adding it back (the +1) correctly accounts for that removed bit.",
            "Store this computed value in bits[i] and continue to the next integer.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The bitwise identity i & (i − 1) provably clears exactly the lowest set bit of i and leaves every other bit unchanged — this is a standard, easily-verified property of how binary subtraction borrows propagate through trailing zero bits. Since exactly one set bit (the lowest one) was removed to go from i to i & (i − 1), the number of set bits in i must be exactly one greater than the number of set bits in i & (i − 1) — this is the recurrence's core correctness argument. By strong induction on i (processing values in increasing order, so every smaller value's bit count is already correctly computed by the time it's needed), this recurrence correctly computes the bit count for every integer from 0 to n.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

vector<int> countBits(int n) {
    vector<int> bits(n + 1, 0);
    for (int curr = 1; curr <= n; curr++) {
        bits[curr] = bits[curr >> 1] + (curr & 1);
    }
    return bits;
}

int main() {
    int n = 8;
    vector<int> bits = countBits(n);
    for (int b : bits) cout << b << " ";
    cout << endl;
    return 0;
}`,
        python: `def count_bits(n):
    bits = [0] * (n + 1)
    for curr in range(1, n + 1):
        bits[curr] = bits[curr >> 1] + (curr & 1)
    return bits

if __name__ == "__main__":
    n = 8
    print(count_bits(n))`,
        java: `import java.util.Arrays;

public class Main {
    public static int[] countBits(int n) {
        int[] bits = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            bits[i] = bits[i >> 1] + (i & 1);
        }
        return bits;
    }

    public static void main(String[] args) {
        int n = 8;
        System.out.println(Arrays.toString(countBits(n)));
    }
}`,
        js: `function countBits(n) {
    const bits = new Array(n + 1).fill(0);
    for (let i = 1; i <= n; i++) {
        bits[i] = bits[i >> 1] + (i & 1);
    }
    return bits;
}

const n = 8;
console.log(countBits(n));`,
        c: `#include <stdio.h>
#include <stdlib.h>

int* countBits(int n, int* returnSize) {
    int* bits = (int*)malloc((n + 1) * sizeof(int));
    bits[0] = 0;
    for (int i = 1; i <= n; i++) {
        bits[i] = bits[i >> 1] + (i & 1);
    }
    *returnSize = n + 1;
    return bits;
}

int main() {
    int n = 8;
    int returnSize;
    int* bits = countBits(n, &returnSize);
    for (int i = 0; i < returnSize; i++) {
        printf("%d ", bits[i]);
    }
    printf("\\n");
    free(bits);
    return 0;
}`,
        "c#": `using System;

class Program {
    static int[] CountBits(int n) {
        int[] bits = new int[n + 1];
        for (int i = 1; i <= n; i++) {
            bits[i] = bits[i >> 1] + (i & 1);
        }
        return bits;
    }

    static void Main() {
        int n = 8;
        Console.WriteLine(string.Join(" ", CountBits(n)));
    }
}`,
        swift: `func countBits(_ n: Int) -> [Int] {
    var bits = Array(repeating: 0, count: n + 1)
    if n > 0 {
        for i in 1...n {
            bits[i] = bits[i >> 1] + (i & 1)
        }
    }
    return bits
}

let n = 8
print(countBits(n))`,
        kotlin: `fun countBits(n: Int): IntArray {
    val bits = IntArray(n + 1)
    for (i in 1..n) {
        bits[i] = bits[i shr 1] + (i and 1)
    }
    return bits
}

fun main() {
    val n = 8
    println(countBits(n).joinToString(" "))
}`,
        scala: `object Main extends App {
    def countBits(n: Int): Array[Int] = {
        val bits = new Array[Int](n + 1)
        for (i <- 1 to n) {
            bits(i) = bits(i >> 1) + (i & 1)
        }
        bits
    }

    val n = 8
    println(countBits(n).mkString(" "))
}`,
        go: `package main

import "fmt"

func countBits(n int) []int {
    bits := make([]int, n+1)
    for i := 1; i <= n; i++ {
        bits[i] = bits[i>>1] + (i & 1)
    }
    return bits
}

func main() {
    n := 8
    fmt.Println(countBits(n))
}`,
        rust: `fn count_bits(n: i32) -> Vec<i32> {
    let mut bits = vec![0; (n + 1) as usize];
    for i in 1..=n as usize {
        bits[i] = bits[i >> 1] + (i as i32 & 1);
    }
    bits
}

fn main() {
    let n = 8;
    println!("{:?}", count_bits(n));
}`,
      },
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
        {
          tag: "p",
          text: "Given two integers, m and n, with m ≤ n, find the bitwise AND of ALL integers in the inclusive range [m, n]. Computing this naively by AND-ing every single number in the range would cost O(n − m) in the worst case (which can be enormous if the range spans billions of numbers) — but a bit-shifting insight reduces this to O(log n), independent of how WIDE the range actually is.",
        },
        {
          tag: "p",
          text: "The key insight: ANDing together a long run of consecutive integers will clear (turn to 0) any bit position where the numbers in the range DON'T all agree — and as soon as the range spans more than one value, every bit position at or below the position where m and n FIRST DIFFER is guaranteed to take BOTH a 0 and a 1 value somewhere within the range, forcing that bit (and everything below it) to 0 in the final AND result. The algorithm finds the COMMON PREFIX of m and n's binary representations (the bits that are identical from the most-significant bit downward) — that shared prefix, with all remaining lower bits zeroed out, is exactly the answer.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The literal 'bitwise AND of a range' problem, where the range could be arbitrarily wide, ruling out any approach that iterates through every value in the range",
            "As an illustration of finding a 'common binary prefix' between two numbers — a technique that generalises to other range-based bitwise problems",
            "Hardware/networking applications computing a common subnet mask or address prefix shared across a range of addresses — conceptually closely related to this exact common-prefix-finding technique",
            "A demonstration that bit-shifting can replace what looks like it requires a loop over a potentially astronomically large numeric range, collapsing it to a loop over BIT POSITIONS instead (at most ~32 or ~64 iterations, regardless of how wide the numeric range is)",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "If m == n, the answer is trivially just m (or n) itself, since the 'range' contains only a single number — this is correctly handled as the natural base case of the shifting loop, which terminates immediately when m already equals n.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(log n)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "If m equals n already (a degenerate single-value 'range'), or if m and n's most-significant bits already differ (meaning their common prefix is empty), the shifting loop terminates almost immediately.",
          },
          {
            tag: "ul",
            items: [
              "m == n: zero shift iterations needed, answer is m itself — O(1)",
              "Most-significant bits differ: the very first comparison confirms no common prefix exists, terminating in O(1)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(log n)" },
          {
            tag: "p",
            text: "The shifting loop runs once per bit position where m and n still match, continuing until they become equal (having shifted away all the differing lower bits) — bounded by the number of bits in n, which is O(log n).",
          },
          {
            tag: "ul",
            items: [
              "Each iteration performs a single right-shift on both m and n, an O(1) operation: at most O(log n) iterations (the bit-width of n) before m and n converge to the same value",
              "Total: O(log n)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(log n)" },
          {
            tag: "p",
            text: "If m and n share a very long common binary prefix (e.g. m and n differ only in their lowest bit), the shifting loop must run nearly the full bit-width of n before m and n converge.",
          },
          {
            tag: "ul",
            items: [
              "Worst case: up to O(log n) shift iterations (bounded by the number of bits needed to represent n, typically 32 or 64 for fixed-width integers, but expressed generally as O(log n))",
              "This is a dramatic improvement over the naive O(n − m) approach, especially when the range [m, n] is extremely wide — the cost here depends only on the MAGNITUDE of n, not on the WIDTH of the range at all",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          {
            tag: "p",
            text: "Only a single counter variable (tracking how many positions have been shifted) plus the two values m and n themselves (modified in place or in local copies) are needed throughout the algorithm.",
          },
          { tag: "ul", items: ["m, n (working copies), shiftCount — O(1)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          {
            tag: "p",
            text: "Memory usage never depends on the magnitude of m and n or the width of the range [m, n] — it's always exactly a fixed handful of integer variables.",
          },
          {
            tag: "ul",
            items: [
              "No auxiliary array or recursive call stack — purely iterative with O(1) tracked variables",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          {
            tag: "p",
            text: "Even for the maximum possible bit-width (the largest representable integers) or the widest possible range, no additional memory beyond the fixed tracked variables is ever needed.",
          },
          {
            tag: "ul",
            items: [
              "O(1) regardless of the magnitude of m and n, or how wide the range [m, n] spans",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function rangeBitwiseAnd(m, n):
    shiftCount ← 0

    while m != n:
        m ← m >> 1
        n ← n >> 1
        shiftCount ← shiftCount + 1

    return m << shiftCount`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Repeatedly right-shift BOTH m and n by one bit simultaneously, counting how many shifts have been performed — this progressively strips away the LOWEST bits of both numbers.",
            "Continue shifting until m and n become EQUAL — at this point, whatever bits remain represent the COMMON PREFIX shared by the original m and n's binary representations (everything from the most-significant bit down to where they first diverged).",
            "Once m equals n, shift the common value back LEFT by the same number of positions originally shifted away — this restores the common prefix to its correct bit positions, with all the (now-known-to-be-mixed, and therefore AND-able-to-zero) lower bits correctly filled with zeros.",
            "The resulting value is exactly the bitwise AND of every integer in the original range [m, n].",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Any bit position where m and n's binary representations DIFFER is guaranteed to take on both 0 and 1 values somewhere within the range [m, n] (since the range includes every integer between them, and that bit position must flip at least once as the range progresses from m to n) — and ANDing a 0 with a 1 at any point always forces that bit position to 0 in the final cumulative result. This means every bit position at or below the FIRST point where m and n differ must be 0 in the answer, while every bit position ABOVE that point — where m and n's bits genuinely agree throughout their entire shared prefix — IS guaranteed to remain that same shared value throughout the whole range (since it never flips for any number between m and n). Right-shifting both values in lockstep until they become equal correctly identifies exactly this shared prefix, and left-shifting back by the same count correctly restores it to its proper bit positions while leaving every lower (necessarily mixed, hence zero) bit as 0.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
using namespace std;

int rangeBitwiseAnd(int left, int right) {
    int mask = 0;
    while (left != right) {
        left >>= 1;
        right >>= 1;
        mask++;
    }
    return left << mask;
}

int main() {
    int left = 5, right = 7;
    cout << rangeBitwiseAnd(left, right) << endl;
    return 0;
}`,
        python: `def range_bitwise_and(left: int, right: int) -> int:
    mask = 0
    while left != right:
        left >>= 1
        right >>= 1
        mask += 1
    return left << mask

if __name__ == "__main__":
    left, right = 5, 7
    print(range_bitwise_and(left, right))`,
        java: `public class Main {
    public static int rangeBitwiseAnd(int left, int right) {
        int mask = 0;
        while (left != right) {
            left >>= 1;
            right >>= 1;
            mask++;
        }
        return left << mask;
    }

    public static void main(String[] args) {
        int left = 5, right = 7;
        System.out.println(rangeBitwiseAnd(left, right));
    }
}`,
        js: `function rangeBitwiseAnd(left, right) {
    let mask = 0;
    while (left !== right) {
        left >>= 1;
        right >>= 1;
        mask++;
    }
    return left << mask;
}

const left = 5, right = 7;
console.log(rangeBitwiseAnd(left, right));`,
        c: `#include <stdio.h>

int rangeBitwiseAnd(int left, int right) {
    int mask = 0;
    while (left != right) {
        left >>= 1;
        right >>= 1;
        mask++;
    }
    return left << mask;
}

int main() {
    int left = 5, right = 7;
    printf("%d\\n", rangeBitwiseAnd(left, right));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int RangeBitwiseAnd(int left, int right) {
        int mask = 0;
        while (left != right) {
            left >>= 1;
            right >>= 1;
            mask++;
        }
        return left << mask;
    }

    static void Main() {
        int left = 5, right = 7;
        Console.WriteLine(RangeBitwiseAnd(left, right));
    }
}`,
        swift: `func rangeBitwiseAnd(_ left: Int, _ right: Int) -> Int {
    var l = left
    var r = right
    var mask = 0
    while l != r {
        l >>= 1
        r >>= 1
        mask += 1
    }
    return l << mask
}

let left = 5, right = 7
print(rangeBitwiseAnd(left, right))`,
        kotlin: `fun rangeBitwiseAnd(left: Int, right: Int): Int {
    var l = left
    var r = right
    var mask = 0
    while (l != r) {
        l = l shr 1
        r = r shr 1
        mask++
    }
    return l shl mask
}

fun main() {
    val left = 5
    val right = 7
    println(rangeBitwiseAnd(left, right))
}`,
        scala: `object Main extends App {
    def rangeBitwiseAnd(left: Int, right: Int): Int = {
        var l = left
        var r = right
        var mask = 0
        while (l != r) {
            l >>= 1
            r >>= 1
            mask += 1
        }
        l << mask
    }

    val left = 5
    val right = 7
    println(rangeBitwiseAnd(left, right))
}`,
        go: `package main

import "fmt"

func rangeBitwiseAnd(left int, right int) int {
    mask := 0
    for left != right {
        left >>= 1
        right >>= 1
        mask++
    }
    return left << mask
}

func main() {
    left, right := 5, 7
    fmt.Println(rangeBitwiseAnd(left, right))
}`,
        rust: `fn range_bitwise_and(mut left: i32, mut right: i32) -> i32 {
    let mut mask = 0;
    while left != right {
        left >>= 1;
        right >>= 1;
        mask += 1;
    }
    left << mask
}

fn main() {
    let left = 5;
    let right = 7;
    println!("{}", range_bitwise_and(left, right));
}`,
      },
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
        {
          tag: "p",
          text: "Given a 32-bit unsigned integer, reverse the order of its bits — the bit at position 0 (least significant) swaps with the bit at position 31 (most significant), position 1 swaps with position 30, and so on. This is a direct, mechanical bit-by-bit operation: extract each bit from the input one at a time, and place it into the MIRRORED position of the output.",
        },
        {
          tag: "p",
          text: "Because the number of bits is FIXED (32, for a standard unsigned integer), this operation always takes exactly the same number of steps regardless of the input value's specific bit pattern — there's no data-dependent variation at all, making it one of the cleanest possible examples of a genuinely O(1) algorithm (since the 'n' in this problem, the bit-width, is a fixed constant, not a variable input size).",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The literal bit-reversal problem, which appears directly in left-level systems programming: network byte-order conversions, certain checksum/CRC algorithm implementations, and FFT (Fast Fourier Transform) implementations use bit-reversal permutation as a core step",
            "Any fixed-width binary manipulation problem where every bit must be individually extracted and repositioned",
            "As a clean illustration of the distinction between 'O(1) because the work is fixed-size by definition' (32 bits is always 32 bits) versus 'O(1) because of an algorithmic shortcut' — this problem is the former, a useful conceptual contrast to highlight",
            "Network protocol implementations that need to convert between big-endian and little-endian bit/byte ordering, a closely related operation",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "A faster-in-practice approach (still technically O(1) since bit-width is fixed, but with a smaller constant factor) reverses bits in parallel using a sequence of masking-and-shifting operations that swap adjacent bits, then adjacent pairs, then adjacent nibbles, and so on — achieving the full 32-bit reversal in just 5 steps (log₂32) instead of 32 individual bit extractions.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case — O(1)" },
          {
            tag: "p",
            text: "Every bit of the fixed 32-bit input must be examined and placed into its mirrored output position — there's no data-dependent shortcut, since the bit-width is fixed regardless of the input's specific value.",
          },
          {
            tag: "ul",
            items: [
              "32 fixed iterations (one per bit position), each O(1) work: O(32) = O(1), since 32 is a constant, not a variable input size",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(1)" },
          {
            tag: "p",
            text: "Every input requires the exact same fixed 32 bit-extraction-and-placement operations regardless of the specific bit pattern — there's no value-dependent branching at all in this algorithm.",
          },
          {
            tag: "ul",
            items: [
              "32 iterations × O(1) work each = O(1), since the iteration count is a fixed constant for any standard 32-bit integer",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(1)" },
          {
            tag: "p",
            text: "No input value changes the number of operations performed — this is simultaneously the best, average, and worst case, since bit-width is fixed by the integer type, not by the value being processed.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(1)",
              "This is a genuine O(1) bound (not just 'O(n) with n treated as a small constant') precisely because the problem's input size (32 bits) is fixed by definition, not a variable parameter of the input",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          {
            tag: "p",
            text: "Only the input value and an accumulating result variable (both fixed-size 32-bit integers) are needed throughout the algorithm.",
          },
          { tag: "ul", items: ["input, result — O(1), both fixed-size integers"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          {
            tag: "p",
            text: "Memory usage never depends on the input's specific bit pattern — it's always exactly two fixed-size integer variables.",
          },
          {
            tag: "ul",
            items: [
              "No auxiliary array needed — the result is built directly, bit by bit, into a single accumulator",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          {
            tag: "p",
            text: "No input value increases memory usage beyond the two fixed-size integer variables — this holds regardless of how many 1-bits or 0-bits the input contains.",
          },
          { tag: "ul", items: ["O(1) regardless of input value, identical across all cases"] },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function reverseBits(n):                    // n is a 32-bit unsigned integer
    result ← 0

    for i from 0 to 31:
        bit ← (n >> i) & 1                    // extract bit at position i from the input
        result ← result | (bit << (31 − i))   // place it at the MIRRORED position in the output

    return result`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Initialise an accumulator 'result' to 0, which will be built up bit by bit.",
            "For each bit position i from 0 (least significant) to 31 (most significant) in the input, extract that specific bit: right-shift n by i positions, then mask with & 1 to isolate just that single bit.",
            "Compute the MIRRORED destination position for this bit: position i in the input maps to position (31 − i) in the output, since the bit ordering is being fully reversed.",
            "Set that mirrored bit in the result accumulator using a left-shift (to move the extracted bit into its correct destination position) combined with OR (to set that bit without disturbing any bits already placed in earlier iterations).",
            "After processing all 32 bit positions, every input bit has been correctly relocated to its mirrored position, and 'result' holds the fully bit-reversed value.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The algorithm directly and mechanically implements the definition of bit reversal: for a 32-bit value, the bit at position i in the input must end up at position (31 − i) in the output, for every i from 0 to 31. The extraction step (n >> i) & 1 correctly isolates exactly the bit at position i (shifting it down to the units position, then masking away everything else). The placement step bit << (31 − i) correctly positions that single extracted bit at its mirrored destination, and OR-ing it into the accumulator correctly sets that bit without disturbing any other bit already placed by a previous iteration (since each iteration targets a DISTINCT, non-overlapping output position, OR-ing in a new bit can never accidentally clear or corrupt a previously-set one).",
        },
      ],
      codes: {
        "c++": `#include <iostream>
using namespace std;

uint32_t reverseBits(uint32_t n) {
    uint32_t mask = 0;
    for (int i = 0; i < 32; i++) {
        mask <<= 1;
        mask |= (n & 1);
        n >>= 1;
    }
    return mask;
}

int main() {
    uint32_t n = 43261596;
    cout << reverseBits(n) << endl;
    return 0;
}`,
        python: `def reverse_bits(n: int) -> int:
    mask = 0
    for _ in range(32):
        mask <<= 1
        mask |= (n & 1)
        n >>= 1
    return mask

if __name__ == "__main__":
    n = 43261596
    print(reverse_bits(n))`,
        java: `public class Main {
    public static int reverseBits(int n) {
        int mask = 0;
        for (int i = 0; i < 32; i++) {
            mask <<= 1;
            mask |= (n & 1);
            n >>>= 1; // logical right shift
        }
        return mask;
    }

    public static void main(String[] args) {
        int n = 43261596;
        System.out.println(reverseBits(n));
    }
}`,
        js: `function reverseBits(n) {
    let mask = 0 >>> 0;
    for (let i = 0; i < 32; i++) {
        mask = (mask * 2) + (n & 1);
        n >>>= 1;
    }
    return mask >>> 0;
}

const n = 43261596;
console.log(reverseBits(n));`,
        c: `#include <stdio.h>
#include <stdint.h>

uint32_t reverseBits(uint32_t n) {
    uint32_t mask = 0;
    for (int i = 0; i < 32; i++) {
        mask <<= 1;
        mask |= (n & 1);
        n >>= 1;
    }
    return mask;
}

int main() {
    uint32_t n = 43261596;
    printf("%u\\n", reverseBits(n));
    return 0;
}`,
        "c#": `using System;

class Program {
    static uint ReverseBits(uint n) {
        uint mask = 0;
        for (int i = 0; i < 32; i++) {
            mask <<= 1;
            mask |= (n & 1);
            n >>= 1;
        }
        return mask;
    }

    static void Main() {
        uint n = 43261596;
        Console.WriteLine(ReverseBits(n));
    }
}`,
        swift: `func reverseBits(_ n: Int) -> Int {
    var mask = 0
    var num = n
    for _ in 0..<32 {
        mask <<= 1
        mask |= (num & 1)
        num >>= 1
    }
    return mask
}

let n = 43261596
print(reverseBits(n))`,
        kotlin: `fun reverseBits(n: Int): Int {
    var mask = 0
    var num = n
    for (i in 0..31) {
        mask = mask shl 1
        mask = mask or (num and 1)
        num = num ushr 1
    }
    return mask
}

fun main() {
    val n = 43261596
    println(reverseBits(n))
}`,
        scala: `object Main extends App {
    def reverseBits(n: Int): Int = {
        var mask = 0
        var num = n
        for (_ <- 0 until 32) {
            mask <<= 1
            mask |= (num & 1)
            num >>>= 1
        }
        mask
    }

    val n = 43261596
    println(reverseBits(n))
}`,
        go: `package main

import "fmt"

func reverseBits(n uint32) uint32 {
    var mask uint32 = 0
    for i := 0; i < 32; i++ {
        mask <<= 1
        mask |= (n & 1)
        n >>= 1
    }
    return mask
}

func main() {
    var n uint32 = 43261596
    fmt.Println(reverseBits(n))
}`,
        rust: `fn reverse_bits(mut n: u32) -> u32 {
    let mut mask = 0;
    for _ in 0..32 {
        mask <<= 1;
        mask |= n & 1;
        n >>= 1;
    }
    mask
}

fn main() {
    let n: u32 = 43261596;
    println!("{}", reverse_bits(n));
}`,
      },
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
        {
          tag: "p",
          text: "Given an array containing n distinct numbers taken from the range [0, n] (so the array has n elements but the range has n+1 possible values), find the one number from that range that's MISSING from the array. A sum-based approach (compute the expected sum 0+1+...+n via the standard formula, subtract the actual sum of the array) works, but risks integer overflow for very large inputs — the XOR-based approach avoids this entirely, since XOR has no overflow concept the way addition does.",
        },
        {
          tag: "p",
          text: "The technique extends Single Number's exact same self-cancelling XOR principle, but applied across TWO conceptual sets simultaneously: XOR together every index from 0 to n, AND every value actually present in the array, all into a single running accumulator. Every number that's genuinely present in the array (matched against its corresponding index or another occurrence) cancels out via a ^ a = 0, leaving only the one number that has no canceling partner — the missing number.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "The literal 'find the missing number from a range' problem, especially when overflow-safety is a concern (XOR has no overflow failure mode, unlike sum-based approaches with very large n)",
            "Any 'find what's missing from an otherwise-complete set' problem that can be reframed as an XOR-cancellation — a direct generalisation of the Single Number technique to a different but structurally related scenario",
            "As a demonstration that the SAME core algebraic trick (XOR self-cancellation) can be adapted to solve superficially different-looking problems, once the underlying 'things that should cancel out' structure is recognised",
            "Data integrity/checksum applications verifying that a complete, expected set of identifiers is fully present, without needing the overflow-prone arithmetic-sum approach",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "This is a great illustration of pattern RECOGNITION transfer: once you understand WHY XOR cancellation works for Single Number (pairs cancel, leaving the unpaired survivor), recognising that 'every index-value pair should cancel except for one unmatched index' is a structurally similar (not identical) setup is the key insight — the specific mechanics differ slightly, but the underlying XOR-cancellation principle is the same.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          {
            tag: "p",
            text: "Every index from 0 to n, and every array value, must be XOR-ed into the running result to guarantee correctness — there's no early-exit shortcut, since skipping any value could change which number survives the cancellation process.",
          },
          {
            tag: "ul",
            items: [
              "n array elements + (n+1) indices to XOR together: O(n) total operations",
              "Best case still requires the full pass, since correctness depends on every value being present to correctly cancel",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          {
            tag: "p",
            text: "Every element and index triggers an identical O(1) XOR operation regardless of its specific value — there's no value-dependent branching in this algorithm at all.",
          },
          {
            tag: "ul",
            items: [
              "O(n) total XOR operations (n array values + n+1 indices, simplified to O(n)) × O(1) each = O(n)",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          {
            tag: "p",
            text: "No array configuration increases the cost beyond a single full pass over both the array and the index range — this is simultaneously the best, average, and worst case.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(n)",
              "Matches a sum-based approach's time complexity exactly, while additionally avoiding any overflow risk for large n",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(1)",
        best: [
          { tag: "h2", text: "Best Case Space — O(1)" },
          {
            tag: "p",
            text: "Only a single running variable (the accumulated XOR result) is needed throughout the entire algorithm, regardless of array size.",
          },
          { tag: "ul", items: ["result accumulator — O(1)"] },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(1)" },
          {
            tag: "p",
            text: "Memory usage never depends on array length or content — it's always exactly one integer-sized accumulator, matching Single Number's space efficiency exactly.",
          },
          { tag: "ul", items: ["No auxiliary array, set, or map — purely one running scalar"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(1)" },
          {
            tag: "p",
            text: "No array size or content increases memory usage beyond the single accumulator variable.",
          },
          {
            tag: "ul",
            items: [
              "O(1) regardless of n — identical space efficiency to Single Number, since both rely on the exact same single-accumulator XOR technique",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function missingNumber(nums):
    result ← length(nums)              // pre-seed with index n (since loop below only covers 0..n-1)

    for i from 0 to length(nums) − 1:
        result ← result ^ i ^ nums[i]

    return result`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Seed the accumulator with n (the array's length, equivalently the largest possible index in the full [0, n] range) — this accounts for the one index value (n itself) that the upcoming loop, bounded by the array's actual length, won't otherwise reach.",
            "For each array position i (from 0 to n−1), XOR BOTH the index i AND the value stored at nums[i] into the accumulator — conceptually, this XORs together the complete set {0, 1, ..., n} (every possible index in the full range) with the complete set of actual array values.",
            "Every number that genuinely belongs in the array's range AND is actually present gets XOR-ed in TWICE overall: once as an 'expected' index value, and once as an 'actual' array value — these two occurrences cancel out to 0, exactly like Single Number's pairing logic.",
            "The one number from the full range [0, n] that's genuinely MISSING from the array only ever gets XOR-ed in ONCE (as an expected index, never as an actual value) — leaving it as the sole uncancelled survivor in the final accumulated result.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The accumulator effectively computes the XOR of the complete set {0, 1, 2, ..., n} together with the XOR of every actual array value — by commutativity and associativity, this can be regrouped as XOR-ing together every NUMBER THAT APPEARS IN BOTH conceptual sets (which cancels to 0, exactly as in Single Number) plus whatever appears in ONLY ONE of the two sets. Since the array contains exactly n distinct values all drawn from the (n+1)-element range [0, n], exactly one number from that range is absent from the array — every OTHER number in the range appears in BOTH the 'expected indices' set and the 'actual values' set (contributing a cancelling pair), while the missing number appears ONLY in the 'expected indices' set, surviving as the final uncancelled XOR result.",
        },
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

int missingNumber(vector<int>& nums) {
    int target = nums.size();
    for (int i = 0; i < nums.size(); i++) {
        target ^= i;
        target ^= nums[i];
    }
    return target;
}

int main() {
    vector<int> nums = {3, 0, 1};
    cout << missingNumber(nums) << endl;
    return 0;
}`,
        python: `def missing_number(nums):
    target = len(nums)
    for i, num in enumerate(nums):
        target ^= i ^ num
    return target

if __name__ == "__main__":
    nums = [3, 0, 1]
    print(missing_number(nums))`,
        java: `public class Main {
    public static int missingNumber(int[] nums) {
        int target = nums.length;
        for (int i = 0; i < nums.length; i++) {
            target ^= i ^ nums[i];
        }
        return target;
    }

    public static void main(String[] args) {
        int[] nums = {3, 0, 1};
        System.out.println(missingNumber(nums));
    }
}`,
        js: `function missingNumber(nums) {
    let target = nums.length;
    for (let i = 0; i < nums.length; i++) {
        target ^= i ^ nums[i];
    }
    return target;
}

const nums = [3, 0, 1];
console.log(missingNumber(nums));`,
        c: `#include <stdio.h>

int missingNumber(int* nums, int numsSize) {
    int target = numsSize;
    for (int i = 0; i < numsSize; i++) {
        target ^= i ^ nums[i];
    }
    return target;
}

int main() {
    int nums[] = {3, 0, 1};
    printf("%d\\n", missingNumber(nums, 3));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int MissingNumber(int[] nums) {
        int target = nums.Length;
        for (int i = 0; i < nums.Length; i++) {
            target ^= i ^ nums[i];
        }
        return target;
    }

    static void Main() {
        int[] nums = {3, 0, 1};
        Console.WriteLine(MissingNumber(nums));
    }
}`,
        swift: `func missingNumber(_ nums: [Int]) -> Int {
    var target = nums.count
    for (i, num) in nums.enumerated() {
        target ^= i ^ num
    }
    return target
}

let nums = [3, 0, 1]
print(missingNumber(nums))`,
        kotlin: `fun missingNumber(nums: IntArray): Int {
    var target = nums.size
    for (i in nums.indices) {
        target = target xor i xor nums[i]
    }
    return target
}

fun main() {
    val nums = intArrayOf(3, 0, 1)
    println(missingNumber(nums))
}`,
        scala: `object Main extends App {
    def missingNumber(nums: Array[Int]): Int = {
        var target = nums.length
        for (i <- nums.indices) {
            target ^= i ^ nums(i)
        }
        target
    }

    val nums = Array(3, 0, 1)
    println(missingNumber(nums))
}`,
        go: `package main

import "fmt"

func missingNumber(nums []int) int {
    target := len(nums)
    for i, num := range nums {
        target ^= i ^ num
    }
    return target
}

func main() {
    nums := []int{3, 0, 1}
    fmt.Println(missingNumber(nums))
}`,
        rust: `fn missing_number(nums: Vec<i32>) -> i32 {
    let mut target = nums.len() as i32;
    for (i, &num) in nums.iter().enumerate() {
        target ^= (i as i32) ^ num;
    }
    target
}

fn main() {
    let nums = vec![3, 0, 1];
    println!("{}", missing_number(nums));
}`,
      },
    },
  ],
  desc: "XOR tricks, bitmasking, power of two",
  complexity: "O(1)",
  featured: true,
};

export default BIT_MANIPULATION_SECTION;
