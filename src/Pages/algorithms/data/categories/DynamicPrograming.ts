const DYNAMIC_PROGRAMMING_SECTION = {
  name: "Dynamic Programming",
  href: "/algorithms/dynamic_programming",
  iconId: "DynamicPrograming",
  hoverIconId: "DynamicPrograming",

  about: [
    { tag: "h1", text: "Dynamic Programming" },
    {
      tag: "p",
      text: "Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems, solving each subproblem exactly once, and reusing those results instead of recomputing them. It applies whenever a problem exhibits two properties: optimal substructure (an optimal solution can be built from optimal solutions to its subproblems) and overlapping subproblems (a naive recursive solution would solve the same subproblem many times).",
    },
    {
      tag: "p",
      text: "Without overlapping subproblems, plain recursion (divide and conquer, like Merge Sort) is already efficient — DP's entire value proposition is eliminating redundant recomputation. The classic illustration is naive recursive Fibonacci: fib(5) calls fib(4) and fib(3), but fib(4) ALSO calls fib(3) — that single redundant call, multiplied across every level of recursion, is what turns an O(n) problem into an O(2ⁿ) nightmare without memoization.",
    },
    { tag: "h2", text: "Problems covered in this section" },
    {
      tag: "table",
      headers: ["Problem", "Core Idea", "Typical Time", "Typical Space"],
      rows: [
        [
          "0/1 Knapsack",
          "Two-dimensional state: items considered × remaining capacity",
          "O(nW)",
          "O(nW) — reducible to O(W)",
        ],
        [
          "Matrix Chain Multiplication",
          "Interval DP: try every split point of a contiguous chain [i, j]",
          "O(n³)",
          "O(n²)",
        ],
        [
          "Longest Common Subsequence",
          "Two-pointer 2D state walking both sequences in lockstep",
          "O(mn)",
          "O(mn) — reducible to O(min(m, n))",
        ],
        [
          "Longest Increasing Subsequence",
          "Track the smallest possible 'tail' for every subsequence length seen so far",
          "O(n log n)",
          "O(n)",
        ],
        [
          "Coin Change",
          "1D state over the target amount, trying every denomination at each amount",
          "O(n · amount)",
          "O(amount)",
        ],
        [
          "Travelling Salesperson (Held-Karp)",
          "Bitmask state: which cities are visited + current city",
          "O(2ⁿ · n²)",
          "O(2ⁿ · n)",
        ],
        [
          "Fibonacci Sequence",
          "The canonical 1D recurrence — introduces memoization vs. tabulation",
          "O(n)",
          "O(1) with rolling variables",
        ],
      ],
    },
    { tag: "h2", text: "Two implementation styles" },
    {
      tag: "table",
      headers: ["Style", "Direction", "How it works", "Trade-off"],
      rows: [
        [
          "Memoization (top-down)",
          "Recursive, same as naive solution",
          "Cache each subproblem's result the first time it's computed; return the cached value on repeat calls",
          "Easier to write from a recursive definition; pays recursion call-stack overhead",
        ],
        [
          "Tabulation (bottom-up)",
          "Iterative, smallest subproblems first",
          "Fill a table in dependency order so every subproblem's prerequisites are already solved when needed",
          "Usually faster in practice (no call-stack overhead); requires figuring out the correct fill order upfront",
        ],
      ],
    },
    { tag: "h2", text: "Recognising a DP problem" },
    {
      tag: "ul",
      items: [
        "The problem asks for an optimum (minimum/maximum) or a count, and naturally decomposes into smaller versions of itself",
        "A greedy (locally-optimal) choice provably does NOT always lead to a globally optimal answer — if it did, a simpler greedy algorithm would suffice instead",
        "A brute-force recursive solution would revisit the same (state, parameters) combination multiple times along different recursive paths",
        "The problem can be expressed as filling in a 1D or 2D table where each cell depends only on previously-computed cells",
      ],
    },
    {
      tag: "note",
      variant: "tip",
      text: "Every DP solution starts the same way: define the state (what does dp[i] or dp[i][j] represent?), find the recurrence (how does it relate to smaller states?), and identify the base case. Getting the state definition right is almost always the hardest part — the rest follows mechanically.",
    },
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
        {
          tag: "p",
          text: "Given n items, each with a weight and a value, and a knapsack with maximum weight capacity W, the 0/1 Knapsack problem asks for the maximum total value achievable without exceeding the capacity — where each item can either be taken whole or left behind entirely ('0/1', as opposed to the Fractional Knapsack variant, which allows taking partial items and is solvable greedily instead).",
        },
        {
          tag: "p",
          text: "It's the canonical example of DP with two-dimensional state: the decision for each item depends not just on which items came before, but on how much capacity remains — so the state must capture both 'which items have been considered' and 'how much weight budget is left'.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Resource allocation under a hard capacity constraint where items are indivisible (can't take 60% of a physical item)",
            "Budget allocation: maximise value/return subject to a fixed total spending limit, with discrete (not fractional) investment options",
            "Subset-sum problems are a special case (value = weight for every item, asking whether some subset sums exactly to a target)",
            "Note: if items CAN be split fractionally, a much simpler O(n log n) greedy algorithm (Fractional Knapsack) solves it instead — always check divisibility before reaching for the DP solution",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "0/1 Knapsack's O(nW) complexity is pseudo-polynomial — it depends on the numeric VALUE of W, not just the count of items. If W is exponentially large relative to n (e.g. W = 2^64), this DP approach becomes impractical despite the polynomial-looking formula.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(nW)",
        best: [
          { tag: "h2", text: "Best Case — O(nW)" },
          {
            tag: "p",
            text: "The standard tabulation approach always fills the entire n × W table regardless of the specific weights and values involved — there's no early-exit shortcut, since every cell potentially contributes to the final answer.",
          },
          {
            tag: "ul",
            items: [
              "Table has (n + 1) rows × (W + 1) columns",
              "Each cell requires O(1) work: one comparison between 'exclude this item' and 'include this item'",
              "Total: O(nW), unconditionally, even for the most favourable item set",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(nW)" },
          {
            tag: "p",
            text: "Every cell of the DP table is computed exactly once with constant work, regardless of the specific weight/value distribution of the items — the algorithm's structure doesn't branch based on input values.",
          },
          {
            tag: "ul",
            items: [
              "(n+1) × (W+1) cells, O(1) work per cell = O(nW)",
              "No input distribution changes this fixed iteration structure",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(nW)" },
          {
            tag: "p",
            text: "No item configuration increases the cost beyond filling the full table — this is simultaneously the best, average, and worst case, since the DP table size is fixed entirely by n and W.",
          },
          {
            tag: "ul",
            items: [
              "O(nW) holds unconditionally",
              "This is pseudo-polynomial: if W is given in binary with b bits, W = 2^b, so the 'polynomial-looking' O(nW) is actually O(n · 2^b) — exponential in the INPUT SIZE of W, which is why huge capacity values make this approach impractical",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(nW)",
        best: [
          { tag: "h2", text: "Best Case Space — O(W)" },
          {
            tag: "p",
            text: "Since each row of the DP table only depends on the immediately preceding row, the table can be compressed to a single 1D array of size W+1, processed carefully right-to-left to avoid overwriting values still needed.",
          },
          {
            tag: "ul",
            items: [
              "1D rolling array: O(W)",
              "This space optimisation works for any input, not just favourable ones",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(nW)" },
          {
            tag: "p",
            text: "The naive (unoptimised) 2D table implementation always allocates the full n × W grid, regardless of item values, since the recurrence is defined cell-by-cell over both dimensions.",
          },
          {
            tag: "ul",
            items: [
              "Full 2D table: (n+1) × (W+1) = O(nW)",
              "Needed if you must reconstruct WHICH items were chosen, not just the optimal value",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(nW)" },
          {
            tag: "p",
            text: "No item configuration changes the table size — it's fixed entirely by the problem parameters n and W, identical across all cases for the standard 2D implementation.",
          },
          {
            tag: "ul",
            items: [
              "O(nW) for the full table, or O(W) with the 1D rolling-array optimisation (at the cost of losing the ability to trace back which items were selected without extra bookkeeping)",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function knapsack(weights, values, n, W):
    dp ← 2D array of size (n+1) x (W+1), all zero

    for i from 1 to n:
        for w from 0 to W:
            // Option 1: don't take item i
            dp[i][w] ← dp[i-1][w]

            // Option 2: take item i, if it fits
            if weights[i-1] <= w:
                dp[i][w] ← max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])

    return dp[n][W]`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Define dp[i][w] as 'the maximum value achievable using only the first i items, with total weight at most w'.",
            "Base case: dp[0][w] = 0 for all w — with zero items available, no value can be achieved regardless of capacity.",
            "For each item i and each possible capacity w, two options exist: exclude item i (carry forward dp[i-1][w] unchanged), or include item i if it fits (add its value to the best solution using one less item and w minus item i's weight).",
            "Take the better of these two options as dp[i][w].",
            "After filling the entire table, dp[n][W] holds the answer: the maximum value achievable using any subset of all n items within the full capacity W.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Optimal substructure: the optimal solution using the first i items and capacity w must either include item i or not. If it doesn't include item i, the optimal solution is exactly the optimal solution using the first i-1 items and the same capacity w — by definition. If it does include item i, the remaining budget w − weights[i-1] must be allocated optimally among the first i-1 items, which is exactly dp[i-1][w − weights[i-1]] by the same inductive definition. Since these are the only two possibilities and both are correctly computed by the recurrence (by strong induction on i), taking their maximum correctly computes dp[i][w] for every cell, and the final answer dp[n][W] is therefore provably optimal.",
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int knapsack(int capacity, const vector<int>& arr_weights, const vector<int>& arr_values, int n) {
    // dp[i][j] stores the max value for first 'i' items with weight limit 'j'
    vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= capacity; j++) {
            if (arr_weights[i - 1] <= j) {
                // Include item or exclude item
                dp[i][j] = max(arr_values[i - 1] + dp[i - 1][j - arr_weights[i - 1]], dp[i - 1][j]);
            } else {
                // Exclude item
                dp[i][j] = dp[i - 1][j];
            }
        }
    }
    return dp[n][capacity];
}

int main() {
    vector<int> arr_values = {60, 100, 120};
    vector<int> arr_weights = {10, 20, 30};
    int capacity = 50;
    int n = arr_values.size();

    cout << "Maximum value in Knapsack = " << knapsack(capacity, arr_weights, arr_values, n) << endl;
    return 0;
}`,
        python: `def knapsack(capacity, weights, values, n):
    # dp[i][j] stores the max value for the first i items with weight limit j
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for j in range(1, capacity + 1):
            if weights[i - 1] <= j:
                # Include item or exclude item
                dp[i][j] = max(values[i - 1] + dp[i - 1][j - weights[i - 1]], dp[i - 1][j])
            else:
                # Exclude item
                dp[i][j] = dp[i - 1][j]

    return dp[n][capacity]


if __name__ == "__main__":
    values = [60, 100, 120]
    weights = [10, 20, 30]
    capacity = 50
    n = len(values)

    print(f"Maximum value in Knapsack = {knapsack(capacity, weights, values, n)}")`,
        java: `import java.util.Arrays;

public class Main {
    public static int knapsack(int capacity, int[] weights, int[] values, int n) {
        int[][] dp = new int[n + 1][capacity + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= capacity; j++) {
                if (weights[i - 1] <= j) {
                    dp[i][j] = Math.max(values[i - 1] + dp[i - 1][j - weights[i - 1]], dp[i - 1][j]);
                } else {
                    dp[i][j] = dp[i - 1][j];
                }
            }
        }
        return dp[n][capacity];
    }

    public static void main(String[] args) {
        int[] values = {60, 100, 120};
        int[] weights = {10, 20, 30};
        int capacity = 50;
        int n = values.length;

        System.out.println("Maximum value in Knapsack = " + knapsack(capacity, weights, values, n));
    }
}`,
        js: `function knapsack(capacity, weights, values, n) {
    const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

    for (let i = 1; i <= n; i++) {
        for (let j = 1; j <= capacity; j++) {
            if (weights[i - 1] <= j) {
                dp[i][j] = Math.max(values[i - 1] + dp[i - 1][j - weights[i - 1]], dp[i - 1][j]);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }
    return dp[n][capacity];
}

const values = [60, 100, 120];
const weights = [10, 20, 30];
const capacity = 50;
const n = values.length;

console.log("Maximum value in Knapsack =", knapsack(capacity, weights, values, n));`,
        c: `#include <stdio.h>
#include <stdlib.h>

int max(int a, int b) {
    return (a > b) ? a : b;
}

int knapsack(int capacity, int* weights, int* values, int n) {
    int** dp = (int**)malloc((n + 1) * sizeof(int*));
    for (int i = 0; i <= n; i++) {
        dp[i] = (int*)calloc(capacity + 1, sizeof(int));
    }

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= capacity; j++) {
            if (weights[i - 1] <= j) {
                dp[i][j] = max(values[i - 1] + dp[i - 1][j - weights[i - 1]], dp[i - 1][j]);
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }

    int result = dp[n][capacity];
    for (int i = 0; i <= n; i++) free(dp[i]);
    free(dp);
    return result;
}

int main() {
    int values[] = {60, 100, 120};
    int weights[] = {10, 20, 30};
    int capacity = 50;
    int n = 3;

    printf("Maximum value in Knapsack = %d\\n", knapsack(capacity, weights, values, n));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int Knapsack(int capacity, int[] weights, int[] values, int n) {
        int[,] dp = new int[n + 1, capacity + 1];

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= capacity; j++) {
                if (weights[i - 1] <= j) {
                    dp[i, j] = Math.Max(values[i - 1] + dp[i - 1, j - weights[i - 1]], dp[i - 1, j]);
                } else {
                    dp[i, j] = dp[i - 1, j];
                }
            }
        }
        return dp[n, capacity];
    }

    static void Main() {
        int[] values = { 60, 100, 120 };
        int[] weights = { 10, 20, 30 };
        int capacity = 50;
        int n = values.Length;

        Console.WriteLine($"Maximum value in Knapsack = {Knapsack(capacity, weights, values, n)}");
    }
}`,
        swift: `func knapsack(_ capacity: Int, _ weights: [Int], _ values: [Int], _ n: Int) -> Int {
    var dp = Array(repeating: Array(repeating: 0, count: capacity + 1), count: n + 1)

    for i in 1...n {
        for j in 1...capacity {
            if weights[i - 1] <= j {
                dp[i][j] = max(values[i - 1] + dp[i - 1][j - weights[i - 1]], dp[i - 1][j])
            } else {
                dp[i][j] = dp[i - 1][j]
            }
        }
    }
    return dp[n][capacity]
}

let values = [60, 100, 120]
let weights = [10, 20, 30]
let capacity = 50
let n = values.count

print("Maximum value in Knapsack = \\(knapsack(capacity, weights, values, n))")`,
        kotlin: `fun knapsack(capacity: Int, weights: IntArray, values: IntArray, n: Int): Int {
    val dp = Array(n + 1) { IntArray(capacity + 1) }

    for (i in 1..n) {
        for (j in 1..capacity) {
            dp[i][j] = if (weights[i - 1] <= j) {
                maxOf(values[i - 1] + dp[i - 1][j - weights[i - 1]], dp[i - 1][j])
            } else {
                dp[i - 1][j]
            }
        }
    }
    return dp[n][capacity]
}

fun main() {
    val values = intArrayOf(60, 100, 120)
    val weights = intArrayOf(10, 20, 30)
    val capacity = 50
    val n = values.size

    println("Maximum value in Knapsack = \${knapsack(capacity, weights, values, n)}")
}`,
        scala: `object Main extends App {
    def knapsack(capacity: Int, weights: Array[Int], values: Array[Int], n: Int): Int = {
        val dp = Array.ofDim[Int](n + 1, capacity + 1)

        for (i <- 1 to n) {
            for (j <- 1 to capacity) {
                dp(i)(j) = if (weights(i - 1) <= j) {
                    math.max(values(i - 1) + dp(i - 1)(j - weights(i - 1)), dp(i - 1)(j))
                } else {
                    dp(i - 1)(j)
                }
            }
        }
        dp(n)(capacity)
    }

    val values = Array(60, 100, 120)
    val weights = Array(10, 20, 30)
    val capacity = 50
    val n = values.length

    println(s"Maximum value in Knapsack = \${knapsack(capacity, weights, values, n)}")
}`,
        go: `package main

import "fmt"

func maxInt(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func knapsack(capacity int, weights, values []int, n int) int {
    dp := make([][]int, n+1)
    for i := range dp {
        dp[i] = make([]int, capacity+1)
    }

    for i := 1; i <= n; i++ {
        for j := 1; j <= capacity; j++ {
            if weights[i-1] <= j {
                dp[i][j] = maxInt(values[i-1]+dp[i-1][j-weights[i-1]], dp[i-1][j])
            } else {
                dp[i][j] = dp[i-1][j]
            }
        }
    }
    return dp[n][capacity]
}

func main() {
    values := []int{60, 100, 120}
    weights := []int{10, 20, 30}
    capacity := 50
    n := len(values)

    fmt.Println("Maximum value in Knapsack =", knapsack(capacity, weights, values, n))
}`,
        rust: `fn knapsack(capacity: usize, weights: &[usize], values: &[i32], n: usize) -> i32 {
    let mut dp = vec![vec![0i32; capacity + 1]; n + 1];

    for i in 1..=n {
        for j in 1..=capacity {
            if weights[i - 1] <= j {
                dp[i][j] = std::cmp::max(
                    values[i - 1] + dp[i - 1][j - weights[i - 1]],
                    dp[i - 1][j],
                );
            } else {
                dp[i][j] = dp[i - 1][j];
            }
        }
    }
    dp[n][capacity]
}

fn main() {
    let values = vec![60, 100, 120];
    let weights = vec![10, 20, 30];
    let capacity = 50;
    let n = values.len();

    println!("Maximum value in Knapsack = {}", knapsack(capacity, &weights, &values, n));
}`,
      },
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
        {
          tag: "p",
          text: "Given a sequence of matrices to multiply together, Matrix Chain Multiplication finds the optimal way to parenthesise the multiplications to minimise the total number of scalar multiplications performed — matrix multiplication is associative, so (AB)C and A(BC) produce the same result matrix, but can require drastically different amounts of computation depending on the matrices' dimensions.",
        },
        {
          tag: "p",
          text: "It's the classic example of interval DP: the state is defined over a CONTIGUOUS RANGE [i, j] of the chain rather than a prefix, and the recurrence works by trying every possible 'split point' k within the range where the final multiplication could occur, recursively combining the optimal cost of the left part [i,k] and right part [k+1,j].",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Optimising the order of operations for a chain of matrix multiplications in numerical computing libraries",
            "Any problem requiring optimal parenthesisation/bracketing of a sequence of associative operations with position-dependent cost",
            "The general template for 'interval DP' problems — many other problems (optimal BST construction, palindrome partitioning cost) follow the exact same [i,j]-with-split-point pattern",
            "Compiler optimisation: choosing the optimal order to evaluate a chain of associative operations to minimise computation cost",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "This algorithm finds the optimal PARENTHESISATION (the order of operations), not the matrix product itself — the actual multiplication still has to be performed afterward according to the discovered optimal order.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n³)",
        best: [
          { tag: "h2", text: "Best Case — O(n³)" },
          {
            tag: "p",
            text: "The algorithm always evaluates every possible split point for every possible sub-chain length and starting position — there's no early-exit shortcut even for the most favourable matrix dimensions.",
          },
          {
            tag: "ul",
            items: [
              "O(n²) distinct sub-chains [i, j] to compute",
              "Each sub-chain's optimal cost requires trying up to O(n) possible split points k",
              "Total: O(n²) sub-chains × O(n) split points each = O(n³)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n³)" },
          {
            tag: "p",
            text: "Every (i, j, k) combination is evaluated exactly once with O(1) work per combination, regardless of the actual matrix dimension values — the algorithm's iteration structure is fixed by n alone.",
          },
          {
            tag: "ul",
            items: [
              "Three nested considerations: chain length (O(n)), starting index i (O(n)), and split point k (O(n)) combine to O(n³) total operations",
              "Each operation is O(1): one multiplication for the cost calculation, one comparison against the running minimum",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n³)" },
          {
            tag: "p",
            text: "No matrix dimension configuration increases the cost beyond the fixed triple-nested iteration over chain length, start position, and split point.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(n³)",
              "This is one of the standard examples of interval DP's characteristic O(n³) bound, arising from O(n²) states each requiring an O(n) decision",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n²)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n²)" },
          {
            tag: "p",
            text: "The DP table stores the optimal cost for every possible sub-chain [i, j], requiring a 2D table of size n × n regardless of the matrix dimensions involved.",
          },
          {
            tag: "ul",
            items: [
              "Cost table: n × n entries — O(n²)",
              "Optional split-point table (for reconstructing the actual parenthesisation): another O(n²)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(n²)" },
          {
            tag: "p",
            text: "Table size is fixed by the number of matrices n alone — it doesn't depend on the specific dimension values of the matrices being multiplied.",
          },
          { tag: "ul", items: ["Same O(n²) bound regardless of matrix dimension distribution"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n²)" },
          {
            tag: "p",
            text: "No matrix configuration increases space beyond the fixed n × n cost table — this is both the floor and ceiling for the algorithm's memory footprint.",
          },
          {
            tag: "ul",
            items: ["Cost table + split table: O(n²) total, identical across all cases"],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Given dimensions array p where matrix i has dimensions p[i-1] × p[i]:" },
        {
          tag: "code",
          language: "text",
          text: `function matrixChainOrder(p):                 // p has length n+1 for n matrices
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

    return dp[1][n]`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Define dp[i][j] as 'the minimum number of scalar multiplications needed to compute the product of matrices i through j'.",
            "Base case (implicit): dp[i][i] = 0 — a single matrix needs no multiplication.",
            "Process sub-chains in order of increasing length, since computing dp[i][j] requires dp[i][k] and dp[k+1][j] for sub-chains shorter than [i,j].",
            "For each sub-chain [i, j], try every possible split point k — the position of the LAST multiplication performed when computing this sub-chain's product.",
            "The cost of splitting at k is: the cost to compute the left part (dp[i][k]), plus the cost to compute the right part (dp[k+1][j]), plus the cost of the final multiplication joining them (p[i-1] × p[k] × p[j], based on the resulting matrix dimensions).",
            "Take the minimum cost over all possible split points as dp[i][j], and remember which k achieved it for later reconstruction of the actual parenthesisation.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Optimal substructure: in any valid parenthesisation of matrices i through j, there must be SOME position k where the final (outermost) multiplication occurs, splitting the chain into a left part [i,k] and right part [k+1,j]. Whatever k is chosen, the optimal way to compute each of those two parts independently must itself be optimal — if a cheaper way to compute [i,k] existed, substituting it would only decrease the total cost, contradicting optimality. By trying every possible k and taking the minimum, the algorithm is guaranteed to consider the true optimal split point among all candidates, and by strong induction on chain length, every dp[i][k] and dp[k+1][j] used in that calculation is already correctly computed (since they represent strictly shorter sub-chains processed earlier).",
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>

using namespace std;

int matrixChainOrder(const vector<int>& p) {
    int n = p.size();
    // dp[i][j] stores the min multiplications needed to multiply matrices from i to j
    vector<vector<int>> dp(n, vector<int>(n, 0));

    // L is the chain length
    for (int L = 2; L < n; L++) {
        for (int i = 1; i < n - L + 1; i++) {
            int j = i + L - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k <= j - 1; k++) {
                int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < dp[i][j]) {
                    dp[i][j] = cost;
                }
            }
        }
    }
    return dp[1][n - 1];
}

int main() {
    // Array representing dimensions of matrices
    // A is 1x2, B is 2x3, C is 3x4
    vector<int> arr = {1, 2, 3, 4}; 
    
    cout << "Minimum number of multiplications is = " << matrixChainOrder(arr) << endl;
    return 0;
}`,
        python: `import sys


def matrix_chain_order(p):
    n = len(p)
    # dp[i][j] stores the min multiplications needed to multiply matrices from i to j
    dp = [[0] * n for _ in range(n)]

    # length is the chain length
    for length in range(2, n):
        for i in range(1, n - length + 1):
            j = i + length - 1
            dp[i][j] = sys.maxsize
            for k in range(i, j):
                cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j]
                if cost < dp[i][j]:
                    dp[i][j] = cost

    return dp[1][n - 1]


if __name__ == "__main__":
    # Array representing dimensions of matrices
    # A is 1x2, B is 2x3, C is 3x4
    arr = [1, 2, 3, 4]

    print(f"Minimum number of multiplications is = {matrix_chain_order(arr)}")`,
        java: `public class Main {
    public static int matrixChainOrder(int[] p) {
        int n = p.length;
        int[][] dp = new int[n][n];

        for (int len = 2; len < n; len++) {
            for (int i = 1; i < n - len + 1; i++) {
                int j = i + len - 1;
                dp[i][j] = Integer.MAX_VALUE;
                for (int k = i; k <= j - 1; k++) {
                    int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
                    if (cost < dp[i][j]) {
                        dp[i][j] = cost;
                    }
                }
            }
        }
        return dp[1][n - 1];
    }

    public static void main(String[] args) {
        // A is 1x2, B is 2x3, C is 3x4
        int[] arr = {1, 2, 3, 4};

        System.out.println("Minimum number of multiplications is = " + matrixChainOrder(arr));
    }
}`,
        js: `function matrixChainOrder(p) {
    const n = p.length;
    const dp = Array.from({ length: n }, () => new Array(n).fill(0));

    for (let len = 2; len < n; len++) {
        for (let i = 1; i < n - len + 1; i++) {
            const j = i + len - 1;
            dp[i][j] = Infinity;
            for (let k = i; k <= j - 1; k++) {
                const cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < dp[i][j]) {
                    dp[i][j] = cost;
                }
            }
        }
    }
    return dp[1][n - 1];
}

// A is 1x2, B is 2x3, C is 3x4
const arr = [1, 2, 3, 4];

console.log("Minimum number of multiplications is =", matrixChainOrder(arr));`,
        c: `#include <stdio.h>
#include <limits.h>

int matrixChainOrder(int* p, int n) {
    int dp[10][10] = {0};

    for (int len = 2; len < n; len++) {
        for (int i = 1; i < n - len + 1; i++) {
            int j = i + len - 1;
            dp[i][j] = INT_MAX;
            for (int k = i; k <= j - 1; k++) {
                int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
                if (cost < dp[i][j]) {
                    dp[i][j] = cost;
                }
            }
        }
    }
    return dp[1][n - 1];
}

int main() {
    // A is 1x2, B is 2x3, C is 3x4
    int arr[] = {1, 2, 3, 4};
    int n = 4;

    printf("Minimum number of multiplications is = %d\\n", matrixChainOrder(arr, n));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int MatrixChainOrder(int[] p) {
        int n = p.Length;
        int[,] dp = new int[n, n];

        for (int len = 2; len < n; len++) {
            for (int i = 1; i < n - len + 1; i++) {
                int j = i + len - 1;
                dp[i, j] = int.MaxValue;
                for (int k = i; k <= j - 1; k++) {
                    int cost = dp[i, k] + dp[k + 1, j] + p[i - 1] * p[k] * p[j];
                    if (cost < dp[i, j]) {
                        dp[i, j] = cost;
                    }
                }
            }
        }
        return dp[1, n - 1];
    }

    static void Main() {
        // A is 1x2, B is 2x3, C is 3x4
        int[] arr = { 1, 2, 3, 4 };

        Console.WriteLine($"Minimum number of multiplications is = {MatrixChainOrder(arr)}");
    }
}`,
        swift: `func matrixChainOrder(_ p: [Int]) -> Int {
    let n = p.count
    var dp = Array(repeating: Array(repeating: 0, count: n), count: n)

    for length in 2..<n {
        for i in 1...(n - length) {
            let j = i + length - 1
            dp[i][j] = Int.max
            for k in i..<j {
                let cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j]
                if cost < dp[i][j] {
                    dp[i][j] = cost
                }
            }
        }
    }
    return dp[1][n - 1]
}

// A is 1x2, B is 2x3, C is 3x4
let arr = [1, 2, 3, 4]

print("Minimum number of multiplications is = \\(matrixChainOrder(arr))")`,
        kotlin: `fun matrixChainOrder(p: IntArray): Int {
    val n = p.size
    val dp = Array(n) { IntArray(n) }

    for (len in 2 until n) {
        for (i in 1..(n - len)) {
            val j = i + len - 1
            dp[i][j] = Int.MAX_VALUE
            for (k in i until j) {
                val cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j]
                if (cost < dp[i][j]) {
                    dp[i][j] = cost
                }
            }
        }
    }
    return dp[1][n - 1]
}

fun main() {
    // A is 1x2, B is 2x3, C is 3x4
    val arr = intArrayOf(1, 2, 3, 4)

    println("Minimum number of multiplications is = \${matrixChainOrder(arr)}")
}`,
        scala: `object Main extends App {
    def matrixChainOrder(p: Array[Int]): Int = {
        val n = p.length
        val dp = Array.ofDim[Int](n, n)

        for (len <- 2 until n) {
            for (i <- 1 to (n - len)) {
                val j = i + len - 1
                dp(i)(j) = Int.MaxValue
                for (k <- i until j) {
                    val cost = dp(i)(k) + dp(k + 1)(j) + p(i - 1) * p(k) * p(j)
                    if (cost < dp(i)(j)) {
                        dp(i)(j) = cost
                    }
                }
            }
        }
        dp(1)(n - 1)
    }

    // A is 1x2, B is 2x3, C is 3x4
    val arr = Array(1, 2, 3, 4)

    println(s"Minimum number of multiplications is = \${matrixChainOrder(arr)}")
}`,
        go: `package main

import (
    "fmt"
    "math"
)

func matrixChainOrder(p []int) int {
    n := len(p)
    dp := make([][]int, n)
    for i := range dp {
        dp[i] = make([]int, n)
    }

    for length := 2; length < n; length++ {
        for i := 1; i <= n-length; i++ {
            j := i + length - 1
            dp[i][j] = math.MaxInt32
            for k := i; k < j; k++ {
                cost := dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]
                if cost < dp[i][j] {
                    dp[i][j] = cost
                }
            }
        }
    }
    return dp[1][n-1]
}

func main() {
    // A is 1x2, B is 2x3, C is 3x4
    arr := []int{1, 2, 3, 4}

    fmt.Println("Minimum number of multiplications is =", matrixChainOrder(arr))
}`,
        rust: `fn matrix_chain_order(p: &[i64]) -> i64 {
    let n = p.len();
    let mut dp = vec![vec![0i64; n]; n];

    for length in 2..n {
        for i in 1..=(n - length) {
            let j = i + length - 1;
            dp[i][j] = i64::MAX;
            for k in i..j {
                let cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
                if cost < dp[i][j] {
                    dp[i][j] = cost;
                }
            }
        }
    }
    dp[1][n - 1]
}

fn main() {
    // A is 1x2, B is 2x3, C is 3x4
    let arr = vec![1i64, 2, 3, 4];

    println!("Minimum number of multiplications is = {}", matrix_chain_order(&arr));
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       3. LONGEST COMMON SUBSEQUENCE (LCS)
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Common Subsequence",
      href: "/algorithms/dynamic_programming/lcs",
      type: "Medium",

      about: [
        { tag: "h1", text: "Longest Common Subsequence" },
        {
          tag: "p",
          text: "The Longest Common Subsequence (LCS) problem finds the longest subsequence present in two given sequences. A subsequence is a sequence that appears in the same relative order, but not necessarily contiguously (e.g., 'abc' is a subsequence of 'aXbYc').",
        },
        {
          tag: "p",
          text: "It forms the core of diff tools (like `git diff`), file comparison utilities, and bioinformatics algorithms for DNA sequence alignment. By modeling a 2D state that tracks the indices of both sequences in lockstep, the algorithm evaluates whether to include matching characters or optimally skip non-matching ones.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Comparing two strings or arrays to find out how 'similar' they are structurally",
            "Calculating the minimum number of insertions and deletions to transform string A into string B (Edit Distance variant)",
            "Finding the Longest Palindromic Subsequence (by running LCS on the string and its exact reverse)",
          ],
        },
        {
          tag: "note",
          variant: "tip",
          text: "Do not confuse this with Longest Common Substring. Subsequences can skip characters; substrings must be strictly contiguous.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(mn)",
        best: [
          { tag: "h2", text: "Best Case — O(mn)" },
          {
            tag: "p",
            text: "The tabulation approach visits every cell in an m × n grid once, unconditionally.",
          },
          {
            tag: "ul",
            items: [
              "Table dimensions are exactly (m + 1) × (n + 1)",
              "No early termination is possible because the longest subsequence could span all the way to the final characters",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(mn)" },
          {
            tag: "p",
            text: "Regardless of string similarity, every possible suffix combination is tested exactly once.",
          },
          {
            tag: "ul",
            items: [
              "Work per cell is O(1) (a character comparison and a max function)",
              "m × n iterations of O(1) work = O(mn) total time",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(mn)" },
          {
            tag: "p",
            text: "Identical to best and average cases. There are no pathologically slow inputs.",
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(mn)",
        best: [
          { tag: "h2", text: "Best Case Space — O(min(m, n))" },
          {
            tag: "p",
            text: "If we only need the length of the LCS (not the actual string), space can be heavily optimized.",
          },
          {
            tag: "ul",
            items: [
              "The recurrence `dp[i][j]` only relies on the current row `i` and the previous row `i-1`",
              "We can store just two 1D arrays of size min(m, n) instead of the full 2D matrix",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(mn)" },
          { tag: "p", text: "The classic full-table implementation creates an m × n matrix." },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(mn)" },
          {
            tag: "p",
            text: "Reconstructing the actual matched characters requires backtracking through the entire matrix, making the full O(mn) allocation mandatory.",
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function longestCommonSubsequence(text1, text2):
    m ← length(text1)
    n ← length(text2)
    dp ← 2D array of size (m+1) x (n+1), all zero

    for i from 1 to m:
        for j from 1 to n:
            if text1[i-1] == text2[j-1]:
                dp[i][j] ← 1 + dp[i-1][j-1]
            else:
                dp[i][j] ← max(dp[i-1][j], dp[i][j-1])

    return dp[m][n]`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Define `dp[i][j]` as the length of the LCS for the prefix `text1[0..i-1]` and `text2[0..j-1]`.",
            "Initialize a matrix padded with a 0-row and 0-column to elegantly handle out-of-bounds base cases (comparing an empty string yields length 0).",
            "For each character pair, evaluate: do they match?",
            "If yes (`text1[i-1] == text2[j-1]`), they unconditionally extend the optimal subsequence found up to their previous indices (`dp[i-1][j-1]`). Add 1.",
            "If no, the optimal subsequence up to this point must bypass either the current character of text1 OR text2. Take the max of excluding one or the other (`dp[i-1][j]` or `dp[i][j-1]`).",
            "Return the bottom-right cell `dp[m][n]`.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The state encompasses all possible combinations of string prefixes. Because matching characters strictly extend the subproblem lacking both current characters (`i-1`, `j-1`), and non-matching characters strictly carry forward the best historical result, it is impossible for the optimal configuration to 'escape' evaluation.",
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

using namespace std;

int longestCommonSubsequence(string text1, string text2) {
    int m = text1.length();
    int n = text2.length();
    vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

int main() {
    string text1 = "abcde", text2 = "ace";
    cout << "Length of LCS: " << longestCommonSubsequence(text1, text2) << endl;
    return 0;
}`,
        python: `def longest_common_subsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])

    return dp[m][n]

if __name__ == "__main__":
    text1, text2 = "abcde", "ace"
    print(f"Length of LCS: {longest_common_subsequence(text1, text2)}")`,
        java: `public class Main {
    public static int longestCommonSubsequence(String text1, String text2) {
        int m = text1.length();
        int n = text2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1.charAt(i - 1) == text2.charAt(j - 1)) {
                    dp[i][j] = dp[i - 1][j - 1] + 1;
                } else {
                    dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                }
            }
        }
        return dp[m][n];
    }

    public static void main(String[] args) {
        String text1 = "abcde", text2 = "ace";
        System.out.println("Length of LCS: " + longestCommonSubsequence(text1, text2));
    }
}`,
        js: `function longestCommonSubsequence(text1, text2) {
    const m = text1.length;
    const n = text2.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

const text1 = "abcde", text2 = "ace";
console.log("Length of LCS:", longestCommonSubsequence(text1, text2));`,
        c: `#include <stdio.h>
#include <string.h>

int max(int a, int b) {
    return (a > b) ? a : b;
}

int longestCommonSubsequence(char* text1, char* text2) {
    int m = strlen(text1);
    int n = strlen(text2);
    int dp[1001][1001] = {0}; // Assuming strings length <= 1000

    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[m][n];
}

int main() {
    char text1[] = "abcde";
    char text2[] = "ace";
    printf("Length of LCS: %d\\n", longestCommonSubsequence(text1, text2));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int LongestCommonSubsequence(string text1, string text2) {
        int m = text1.Length;
        int n = text2.Length;
        int[,] dp = new int[m + 1, n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (text1[i - 1] == text2[j - 1]) {
                    dp[i, j] = dp[i - 1, j - 1] + 1;
                } else {
                    dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
                }
            }
        }
        return dp[m, n];
    }

    static void Main() {
        string text1 = "abcde", text2 = "ace";
        Console.WriteLine($"Length of LCS: {LongestCommonSubsequence(text1, text2)}");
    }
}`,
        swift: `func longestCommonSubsequence(_ text1: String, _ text2: String) -> Int {
    let t1 = Array(text1)
    let t2 = Array(text2)
    let m = t1.count
    let n = t2.count
    var dp = Array(repeating: Array(repeating: 0, count: n + 1), count: m + 1)

    for i in 1...max(m, 1) where m > 0 {
        for j in 1...max(n, 1) where n > 0 {
            if t1[i - 1] == t2[j - 1] {
                dp[i][j] = dp[i - 1][j - 1] + 1
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            }
        }
    }
    return dp[m][n]
}

print("Length of LCS: \\(longestCommonSubsequence("abcde", "ace"))")`,
        kotlin: `import kotlin.math.max

fun longestCommonSubsequence(text1: String, text2: String): Int {
    val m = text1.length
    val n = text2.length
    val dp = Array(m + 1) { IntArray(n + 1) }

    for (i in 1..m) {
        for (j in 1..n) {
            if (text1[i - 1] == text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1
            } else {
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
            }
        }
    }
    return dp[m][n]
}

fun main() {
    val text1 = "abcde"
    val text2 = "ace"
    println("Length of LCS: \${longestCommonSubsequence(text1, text2)}")
}`,
        scala: `object Main extends App {
    def longestCommonSubsequence(text1: String, text2: String): Int = {
        val m = text1.length
        val n = text2.length
        val dp = Array.ofDim[Int](m + 1, n + 1)

        for (i <- 1 to m) {
            for (j <- 1 to n) {
                if (text1(i - 1) == text2(j - 1)) {
                    dp(i)(j) = dp(i - 1)(j - 1) + 1
                } else {
                    dp(i)(j) = math.max(dp(i - 1)(j), dp(i)(j - 1))
                }
            }
        }
        dp(m)(n)
    }

    val text1 = "abcde"
    val text2 = "ace"
    println(s"Length of LCS: \${longestCommonSubsequence(text1, text2)}")
}`,
        go: `package main

import "fmt"

func maxInt(a, b int) int {
    if a > b {
        return a
    }
    return b
}

func longestCommonSubsequence(text1 string, text2 string) int {
    m, n := len(text1), len(text2)
    dp := make([][]int, m+1)
    for i := range dp {
        dp[i] = make([]int, n+1)
    }

    for i := 1; i <= m; i++ {
        for j := 1; j <= n; j++ {
            if text1[i-1] == text2[j-1] {
                dp[i][j] = dp[i-1][j-1] + 1
            } else {
                dp[i][j] = maxInt(dp[i-1][j], dp[i][j-1])
            }
        }
    }
    return dp[m][n]
}

func main() {
    text1, text2 := "abcde", "ace"
    fmt.Printf("Length of LCS: %d\\n", longestCommonSubsequence(text1, text2))
}`,
        rust: `use std::cmp;

fn longest_common_subsequence(text1: String, text2: String) -> i32 {
    let t1 = text1.as_bytes();
    let t2 = text2.as_bytes();
    let m = t1.len();
    let n = t2.len();
    let mut dp = vec![vec![0; n + 1]; m + 1];

    for i in 1..=m {
        for j in 1..=n {
            if t1[i - 1] == t2[j - 1] {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = cmp::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    dp[m][n]
}

fn main() {
    let text1 = String::from("abcde");
    let text2 = String::from("ace");
    println!("Length of LCS: {}", longest_common_subsequence(text1, text2));
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       4. LONGEST INCREASING SUBSEQUENCE (LIS)
   ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Increasing Subsequence",
      href: "/algorithms/dynamic_programming/lis",
      type: "Medium",

      about: [
        { tag: "h1", text: "Longest Increasing Subsequence (Linear Patience Sorting)" },
        {
          tag: "p",
          text: "Given an integer array, find the length of the longest strictly increasing subsequence. This specific implementation utilizes an unoptimized Patience Sorting approach. By maintaining a list of 'tails' (the smallest possible ending element for a valid increasing subsequence of length L), it updates the optimal bounds.",
        },
        {
          tag: "p",
          text: "Instead of binary searching the insertion position (which yields an O(n log n) solution), this version performs a linear scan across the actively constructed `tails` array for each element. This degrades the time complexity to O(n²) in the worst case but provides a simpler, loop-based implementation to understand the core logic of the tails array.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "When you need to understand the structural logic of Patience Sorting before optimizing it.",
            "Small constraints where an O(n²) solution is perfectly acceptable without the overhead of binary search logic.",
            "Any problem explicitly requesting the Longest Increasing/Decreasing Subsequence.",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "The `tails` array does NOT store the actual sequence itself! It stores the optimal active bounds. Also note this linear-scan version is strictly less efficient than the binary search equivalent.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n²)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          {
            tag: "p",
            text: "If the input array is strictly decreasing, the `tails` array never grows beyond size 1. The inner loop executes exactly once per element, resulting in linear time.",
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n²)" },
          {
            tag: "p",
            text: "Each element triggers a linear scan over the actively constructed `tails` array, which scales linearly relative to the sequence length, summing to a quadratic bound.",
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n²)" },
          {
            tag: "p",
            text: "If the input array is strictly increasing, the `tails` array grows to size n. The inner loop scans 1, then 2, then 3... up to n times, giving a total of n(n+1)/2 operations.",
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          { tag: "p", text: "The `tails` auxiliary array strictly requires allocation." },
        ],
        average: [{ tag: "h2", text: "Average Case Space — O(n)" }],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "If the input array is strictly increasing, the `tails` array will grow exactly to size n.",
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function lengthOfLIS(nums):
    tails ← empty array
    
    for i from 0 to length(nums) - 1:
        pos ← length(tails)
        
        // Linear search to find insertion point
        for j from 0 to length(tails) - 1:
            if tails[j] >= nums[i]:
                pos ← j
                break
                
        if pos == length(tails):
            tails.append(nums[i])
        else:
            tails[pos] ← nums[i]

    return length(tails)`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Maintain a `tails` array where `tails[j]` stores the smallest tail of all increasing subsequences of length `j+1`.",
            "Iterate through each element `nums[i]` in the input array.",
            "Perform a linear scan over the current `tails` array to find the first element that is >= `nums[i]`.",
            "If `nums[i]` is larger than all elements currently in `tails` (the loop finishes without breaking), extend the longest subsequence by appending `nums[i]` to `tails`.",
            "If `nums[i]` is smaller or equal to an element in `tails`, replace that first found element (`tails[pos]`). This keeps the threshold for extending that specific length sequence as low (optimal) as possible.",
            "The length of the `tails` array represents the length of the Longest Increasing Subsequence.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Even with a linear search, the underlying principle holds true: aggressively tracking the minimal possible tail at each length boundary maximizes the probability that future elements can extend the sequence. Overwriting a value in `tails` just resets the condition for evaluating future values against that specific length milestone.",
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>

using namespace std;

int lengthOfLIS(vector<int>& nums) {
    vector<int> tails;

    for (int i = 0; i < nums.size(); i++) {
        int pos = tails.size();

        // Find the first element >= nums[i]
        for (int j = 0; j < tails.size(); j++) {
            if (tails[j] >= nums[i]) {
                pos = j;
                break;
            }
        }

        if (pos == tails.size()) {
            tails.push_back(nums[i]);
        } else {
            tails[pos] = nums[i];
        }
    }

    return tails.size();
}

int main() {
    vector<int> nums = {10, 9, 2, 5, 3, 7, 101, 18};
    cout << "Length of LIS: " << lengthOfLIS(nums) << endl;
    return 0;
}`,
        python: `def length_of_lis(nums) -> int:
    tails = []
    
    for i in range(len(nums)):
        pos = len(tails)
        
        for j in range(len(tails)):
            if tails[j] >= nums[i]:
                pos = j
                break
                
        if pos == len(tails):
            tails.append(nums[i])
        else:
            tails[pos] = nums[i]
            
    return len(tails)

if __name__ == "__main__":
    nums = [10, 9, 2, 5, 3, 7, 101, 18]
    print(f"Length of LIS: {length_of_lis(nums)}")`,
        java: `public class Main {
    public static int lengthOfLIS(int[] nums) {
        int[] tails = new int[nums.length];
        int size = 0;
        
        for (int i = 0; i < nums.length; i++) {
            int pos = size;
            
            for (int j = 0; j < size; j++) {
                if (tails[j] >= nums[i]) {
                    pos = j;
                    break;
                }
            }
            
            tails[pos] = nums[i];
            if (pos == size) {
                size++;
            }
        }
        return size;
    }

    public static void main(String[] args) {
        int[] nums = {10, 9, 2, 5, 3, 7, 101, 18};
        System.out.println("Length of LIS: " + lengthOfLIS(nums));
    }
}`,
        js: `function lengthOfLIS(nums) {
    const tails = [];
    
    for (let i = 0; i < nums.length; i++) {
        let pos = tails.length;
        
        for (let j = 0; j < tails.length; j++) {
            if (tails[j] >= nums[i]) {
                pos = j;
                break;
            }
        }
        
        if (pos === tails.length) {
            tails.push(nums[i]);
        } else {
            tails[pos] = nums[i];
        }
    }
    
    return tails.length;
}

const nums = [10, 9, 2, 5, 3, 7, 101, 18];
console.log("Length of LIS:", lengthOfLIS(nums));`,
        c: `#include <stdio.h>

int lengthOfLIS(int* nums, int numsSize) {
    int tails[2500]; // Assume max constraint size
    int size = 0;
    
    for (int i = 0; i < numsSize; i++) {
        int pos = size;
        
        for (int j = 0; j < size; j++) {
            if (tails[j] >= nums[i]) {
                pos = j;
                break;
            }
        }
        
        tails[pos] = nums[i];
        if (pos == size) {
            size++;
        }
    }
    
    return size;
}

int main() {
    int nums[] = {10, 9, 2, 5, 3, 7, 101, 18};
    printf("Length of LIS: %d\\n", lengthOfLIS(nums, 8));
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static int LengthOfLIS(int[] nums) {
        List<int> tails = new List<int>();
        
        for (int i = 0; i < nums.Length; i++) {
            int pos = tails.Count;
            
            for (int j = 0; j < tails.Count; j++) {
                if (tails[j] >= nums[i]) {
                    pos = j;
                    break;
                }
            }
            
            if (pos == tails.Count) {
                tails.Add(nums[i]);
            } else {
                tails[pos] = nums[i];
            }
        }
        return tails.Count;
    }

    static void Main() {
        int[] nums = {10, 9, 2, 5, 3, 7, 101, 18};
        Console.WriteLine($"Length of LIS: {LengthOfLIS(nums)}");
    }
}`,
        swift: `func lengthOfLIS(_ nums: [Int]) -> Int {
    var tails = [Int]()
    
    for i in 0..<nums.count {
        var pos = tails.count
        
        for j in 0..<tails.count {
            if tails[j] >= nums[i] {
                pos = j
                break
            }
        }
        
        if pos == tails.count {
            tails.append(nums[i])
        } else {
            tails[pos] = nums[i]
        }
    }
    
    return tails.count
}

print("Length of LIS: \\(lengthOfLIS([10, 9, 2, 5, 3, 7, 101, 18]))")`,
        kotlin: `fun lengthOfLIS(nums: IntArray): Int {
    val tails = mutableListOf<Int>()
    
    for (i in nums.indices) {
        var pos = tails.size
        
        for (j in tails.indices) {
            if (tails[j] >= nums[i]) {
                pos = j
                break
            }
        }
        
        if (pos == tails.size) {
            tails.add(nums[i])
        } else {
            tails[pos] = nums[i]
        }
    }
    
    return tails.size
}

fun main() {
    val nums = intArrayOf(10, 9, 2, 5, 3, 7, 101, 18)
    println("Length of LIS: \${lengthOfLIS(nums)}")
}`,
        scala: `object Main extends App {
    def lengthOfLIS(nums: Array[Int]): Int = {
        val tails = new scala.collection.mutable.ArrayBuffer[Int]()
        
        for (i <- nums.indices) {
            var pos = tails.length
            var found = false
            
            for (j <- tails.indices if !found) {
                if (tails(j) >= nums(i)) {
                    pos = j
                    found = true
                }
            }
            
            if (pos == tails.length) {
                tails.append(nums(i))
            } else {
                tails(pos) = nums(i)
            }
        }
        
        tails.length
    }

    val nums = Array(10, 9, 2, 5, 3, 7, 101, 18)
    println(s"Length of LIS: \${lengthOfLIS(nums)}")
}`,
        go: `package main

import "fmt"

func lengthOfLIS(nums []int) int {
    tails := []int{}
    
    for i := 0; i < len(nums); i++ {
        pos := len(tails)
        
        for j := 0; j < len(tails); j++ {
            if tails[j] >= nums[i] {
                pos = j
                break
            }
        }
        
        if pos == len(tails) {
            tails = append(tails, nums[i])
        } else {
            tails[pos] = nums[i]
        }
    }
    
    return len(tails)
}

func main() {
    nums := []int{10, 9, 2, 5, 3, 7, 101, 18}
    fmt.Println("Length of LIS:", lengthOfLIS(nums))
}`,
        rust: `fn length_of_lis(nums: Vec<i32>) -> i32 {
    let mut tails: Vec<i32> = Vec::new();
    
    for i in 0..nums.len() {
        let mut pos = tails.len();
        
        for j in 0..tails.len() {
            if tails[j] >= nums[i] {
                pos = j;
                break;
            }
        }
        
        if pos == tails.len() {
            tails.push(nums[i]);
        } else {
            tails[pos] = nums[i];
        }
    }
    
    tails.len() as i32
}

fn main() {
    let nums = vec![10, 9, 2, 5, 3, 7, 101, 18];
    println!("Length of LIS: {}", length_of_lis(nums));
}`,
      },
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
        {
          tag: "p",
          text: "Given a set of coin denominations and a target amount, the Coin Change problem asks for the minimum number of coins needed to make exactly that amount (assuming unlimited supply of each denomination), or reports that it's impossible. A related variant counts the total NUMBER of distinct ways to make the amount, rather than the minimum coin count.",
        },
        {
          tag: "p",
          text: "It's a deceptively simple-looking problem that's actually a trap for greedy algorithms: greedily always picking the largest coin that fits works for 'canonical' coin systems like US currency (1, 5, 10, 25), but fails for arbitrary denominations — e.g. with coins [1, 3, 4], greedily making 6 picks [4, 1, 1] (3 coins) when [3, 3] (2 coins) is actually optimal. This is exactly why DP, not greedy, is the generally correct approach.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Making change with an arbitrary (non-canonical) set of denominations where greedy isn't guaranteed correct",
            "Any 'minimum number of items from an unlimited supply to reach an exact target sum' problem — this template generalises far beyond literal currency",
            "The counting variant ('how many ways can you make this amount') is a classic unbounded knapsack-style problem, useful for combinatorics and probability calculations",
            "Verifying whether a greedy currency system is safe to use (if DP and greedy always agree across all reachable amounts, the greedy approach is provably correct for that specific coin set)",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Never assume greedy works for coin change unless you've proven the specific coin set is 'canonical' — silently wrong greedy answers are a classic source of subtle bugs in real payment/change-making systems.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n·amount)",
        best: [
          { tag: "h2", text: "Best Case — O(n·amount)" },
          {
            tag: "p",
            text: "The standard tabulation approach always fills the entire dp array of size amount+1, trying every coin denomination at every amount — there's no early-exit shortcut even if the optimal solution uses very few coins.",
          },
          {
            tag: "ul",
            items: [
              "dp array has amount+1 entries",
              "Each entry requires checking all n coin denominations: O(n) per entry",
              "Total: O(n · amount), even for the most favourable coin set",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n·amount)" },
          {
            tag: "p",
            text: "Every (amount, coin) combination is checked exactly once with O(1) work, regardless of which coins actually contribute to the optimal solution.",
          },
          {
            tag: "ul",
            items: [
              "(amount+1) sub-amounts × n coins each = O(n · amount) total operations",
              "Each operation is O(1): one addition, one comparison against the running minimum",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n·amount)" },
          {
            tag: "p",
            text: "No coin denomination configuration increases the cost beyond the fixed nested iteration over amounts and coins.",
          },
          {
            tag: "ul",
            items: [
              "Worst case identical to best/average: O(n · amount)",
              "Like Knapsack, this is pseudo-polynomial — it depends on the numeric VALUE of 'amount', not just the count of coin denominations, so very large target amounts make this approach impractical despite the polynomial-looking formula",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(amount)",
        best: [
          { tag: "h2", text: "Best Case Space — O(amount)" },
          {
            tag: "p",
            text: "A single 1D array of size amount+1 is sufficient, since each entry dp[a] only depends on smaller-amount entries dp[a - coin], all of which are already computed when processed in increasing order of amount.",
          },
          {
            tag: "ul",
            items: ["dp array: O(amount), regardless of how many coin denominations exist"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(amount)" },
          {
            tag: "p",
            text: "Space usage is fixed by the target amount alone, since the 1D dp array's size doesn't depend on the number or values of the coin denominations.",
          },
          { tag: "ul", items: ["Same O(amount) bound regardless of coin set composition"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(amount)" },
          {
            tag: "p",
            text: "No coin configuration increases space beyond the fixed-size 1D array — this is both the floor and ceiling for the algorithm's memory footprint.",
          },
          { tag: "ul", items: ["dp array: O(amount), identical across all cases"] },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        { tag: "p", text: "Minimum-number-of-coins variant:" },
        {
          tag: "code",
          language: "text",
          text: `function coinChange(coins, amount):
    dp ← array of size amount + 1, all set to infinity
    dp[0] ← 0                          // base case: 0 coins needed to make amount 0

    for a from 1 to amount:
        for coin in coins:
            if coin <= a:
                dp[a] ← min(dp[a], dp[a - coin] + 1)

    return dp[amount] if dp[amount] != infinity else IMPOSSIBLE`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Define dp[a] as 'the minimum number of coins needed to make exactly amount a', with dp[0] = 0 as the base case.",
            "Process amounts in increasing order from 1 up to the target, since dp[a] depends on dp[a - coin] for various coins, all of which are smaller amounts already computed.",
            "For each amount a, try every available coin denomination: if the coin's value is ≤ a, check whether using that coin (and then optimally making the remaining a − coin) beats the current best known way to make a.",
            "Take the minimum over all coin choices as dp[a].",
            "After filling the entire array, dp[amount] holds the answer — or remains infinity if no combination of coins can make that exact amount.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "Optimal substructure: any optimal solution for amount a must use SOME coin as its 'last' coin — call it coin c. Removing that one coin leaves an optimal solution for amount a − c (if it weren't optimal, a cheaper solution for a − c plus that same coin c would produce a cheaper solution for a, contradicting a's optimality). By trying every possible coin c as the 'last coin' and taking the minimum over dp[a − c] + 1, the algorithm is guaranteed to consider the true optimal choice among all coins, and by induction on a (processing amounts in increasing order), every dp[a − c] referenced is already correctly computed before it's needed.",
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

int coinChange(const vector<int>& coins, int amount) {
    // Initialize DP array with a value strictly greater than the maximum possible coins
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (i - coin >= 0) {
                dp[i] = min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

int main() {
    vector<int> coins = {1, 2, 5};
    int amount = 11;
    
    cout << "Minimum coins required = " << coinChange(coins, amount) << endl;
    return 0;
}`,
        python: `def coin_change(coins, amount):
    # Initialize DP array with a value strictly greater than the maximum possible coins
    dp = [amount + 1] * (amount + 1)
    dp[0] = 0

    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)

    return -1 if dp[amount] > amount else dp[amount]


if __name__ == "__main__":
    coins = [1, 2, 5]
    amount = 11

    print(f"Minimum coins required = {coin_change(coins, amount)}")`,
        java: `public class Main {
    public static int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        java.util.Arrays.fill(dp, amount + 1);
        dp[0] = 0;

        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        int[] coins = {1, 2, 5};
        int amount = 11;

        System.out.println("Minimum coins required = " + coinChange(coins, amount));
    }
}`,
        js: `function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(amount + 1);
    dp[0] = 0;

    for (let i = 1; i <= amount; i++) {
        for (const coin of coins) {
            if (i - coin >= 0) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

const coins = [1, 2, 5];
const amount = 11;

console.log("Minimum coins required =", coinChange(coins, amount));`,
        c: `#include <stdio.h>

int min(int a, int b) {
    return (a < b) ? a : b;
}

int coinChange(int* coins, int coinsSize, int amount) {
    int dp[10001];
    for (int i = 0; i <= amount; i++) dp[i] = amount + 1;
    dp[0] = 0;

    for (int i = 1; i <= amount; i++) {
        for (int j = 0; j < coinsSize; j++) {
            if (i - coins[j] >= 0) {
                dp[i] = min(dp[i], dp[i - coins[j]] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}

int main() {
    int coins[] = {1, 2, 5};
    int amount = 11;

    printf("Minimum coins required = %d\\n", coinChange(coins, 3, amount));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int CoinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Array.Fill(dp, amount + 1);
        dp[0] = 0;

        for (int i = 1; i <= amount; i++) {
            foreach (int coin in coins) {
                if (i - coin >= 0) {
                    dp[i] = Math.Min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    static void Main() {
        int[] coins = { 1, 2, 5 };
        int amount = 11;

        Console.WriteLine($"Minimum coins required = {CoinChange(coins, amount)}");
    }
}`,
        swift: `func coinChange(_ coins: [Int], _ amount: Int) -> Int {
    var dp = Array(repeating: amount + 1, count: amount + 1)
    dp[0] = 0

    for i in 1...max(amount, 1) where amount > 0 {
        for coin in coins {
            if i - coin >= 0 {
                dp[i] = min(dp[i], dp[i - coin] + 1)
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount]
}

let coins = [1, 2, 5]
let amount = 11

print("Minimum coins required = \\(coinChange(coins, amount))")`,
        kotlin: `fun coinChange(coins: IntArray, amount: Int): Int {
    val dp = IntArray(amount + 1) { amount + 1 }
    dp[0] = 0

    for (i in 1..amount) {
        for (coin in coins) {
            if (i - coin >= 0) {
                dp[i] = minOf(dp[i], dp[i - coin] + 1)
            }
        }
    }
    return if (dp[amount] > amount) -1 else dp[amount]
}

fun main() {
    val coins = intArrayOf(1, 2, 5)
    val amount = 11

    println("Minimum coins required = \${coinChange(coins, amount)}")
}`,
        scala: `object Main extends App {
    def coinChange(coins: Array[Int], amount: Int): Int = {
        val dp = Array.fill(amount + 1)(amount + 1)
        dp(0) = 0

        for (i <- 1 to amount) {
            for (coin <- coins) {
                if (i - coin >= 0) {
                    dp(i) = math.min(dp(i), dp(i - coin) + 1)
                }
            }
        }
        if (dp(amount) > amount) -1 else dp(amount)
    }

    val coins = Array(1, 2, 5)
    val amount = 11

    println(s"Minimum coins required = \${coinChange(coins, amount)}")
}`,
        go: `package main

import "fmt"

func minInt(a, b int) int {
    if a < b {
        return a
    }
    return b
}

func coinChange(coins []int, amount int) int {
    dp := make([]int, amount+1)
    for i := range dp {
        dp[i] = amount + 1
    }
    dp[0] = 0

    for i := 1; i <= amount; i++ {
        for _, coin := range coins {
            if i-coin >= 0 {
                dp[i] = minInt(dp[i], dp[i-coin]+1)
            }
        }
    }

    if dp[amount] > amount {
        return -1
    }
    return dp[amount]
}

func main() {
    coins := []int{1, 2, 5}
    amount := 11

    fmt.Println("Minimum coins required =", coinChange(coins, amount))
}`,
        rust: `fn coin_change(coins: &[i32], amount: usize) -> i32 {
    let sentinel = (amount + 1) as i32;
    let mut dp = vec![sentinel; amount + 1];
    dp[0] = 0;

    for i in 1..=amount {
        for &coin in coins {
            let coin = coin as usize;
            if coin <= i {
                dp[i] = dp[i].min(dp[i - coin] + 1);
            }
        }
    }

    if dp[amount] > sentinel - 1 {
        -1
    } else {
        dp[amount]
    }
}

fn main() {
    let coins = vec![1, 2, 5];
    let amount = 11;

    println!("Minimum coins required = {}", coin_change(&coins, amount));
}`,
      },
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
        {
          tag: "p",
          text: "The Travelling Salesperson Problem (TSP) asks for the shortest possible route that visits every city in a given set exactly once and returns to the starting city. It is NP-hard — no known algorithm solves it in polynomial time, and it's widely believed none exists. The naive brute-force approach checks all (n-1)! possible permutations of cities, but the Held-Karp dynamic programming algorithm (1962) improves this dramatically to O(2ⁿ · n²) by exploiting overlapping subproblems in the permutation structure.",
        },
        {
          tag: "p",
          text: "The key insight is the state: instead of tracking which SPECIFIC sequence of cities has been visited (which would require remembering full permutations), Held-Karp tracks only the SET of visited cities (as a bitmask) and the current city — since the optimal cost to finish the tour only depends on those two facts, not on the exact order the visited cities were reached in.",
        },
        {
          tag: "p",
          text: "The implementation below uses top-down memoization (a recursive function with a cache) rather than bottom-up tabulation — both express exactly the same recurrence and share the identical O(2ⁿ · n²) time bound, since memoization is simply tabulation computed lazily, on demand, via the call stack instead of via explicit nested loops in a fixed fill order.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Exact TSP solutions for small instances (Held-Karp is practical up to roughly n ≈ 20, after which the exponential 2ⁿ term becomes prohibitive even with the DP speedup)",
            "Vehicle routing, circuit board drilling path optimisation, and other genuine 'visit every point once, minimise total travel' problems at small scale",
            "Understanding bitmask DP — the state-as-bitmask technique used here generalises to many other 'subset of items processed so far' problems",
            "For larger n, this exact approach is impractical — approximation algorithms (nearest neighbor, Christofides) or metaheuristics (genetic algorithms, simulated annealing) are used instead",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "O(2ⁿ · n²) is still exponential — Held-Karp is a major improvement over brute force's O(n!), but it does NOT make TSP tractable for large n. At n=25, 2²⁵ ≈ 33 million states already strains practical memory and time limits.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(2ⁿ · n²)",
        best: [
          { tag: "h2", text: "Best Case — O(2ⁿ · n²)" },
          {
            tag: "p",
            text: "The algorithm always computes every (visited-set, current-city) state regardless of the specific distances between cities — there's no early-exit shortcut even for the most geometrically favourable city arrangement.",
          },
          {
            tag: "ul",
            items: [
              "2ⁿ possible subsets of visited cities × n possible 'current city' values = O(2ⁿ · n) distinct states",
              "Each state's computation tries up to n possible 'next city' transitions: O(n) per state",
              "Total: O(2ⁿ · n) states × O(n) work each = O(2ⁿ · n²)",
            ],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(2ⁿ · n²)" },
          {
            tag: "p",
            text: "Every reachable (subset, city) state is computed exactly once with the same fixed amount of work, regardless of the specific distance values between cities — only the FINAL chosen route changes with different distances, not the number of states examined.",
          },
          {
            tag: "ul",
            items: [
              "O(2ⁿ · n) states, each requiring O(n) work to consider all possible transitions: O(2ⁿ · n²) total",
              "No input distribution changes this fixed state-space structure",
            ],
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(2ⁿ · n²)" },
          {
            tag: "p",
            text: "No city configuration increases the cost beyond the fixed bitmask-state-space exploration — this is simultaneously the best, average, and worst case, since every possible subset must be considered to guarantee the global optimum.",
          },
          {
            tag: "ul",
            items: [
              "O(2ⁿ · n²) holds unconditionally",
              "This is a dramatic improvement over brute force's O(n!) (for n=20: 2²⁰·400 ≈ 4×10⁸ vs. 20! ≈ 2.4×10¹⁸), but remains exponential and therefore intractable for large n",
            ],
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(2ⁿ · n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(2ⁿ · n)" },
          {
            tag: "p",
            text: "The memoization table must store the optimal cost for every (visited-subset, current-city) combination, requiring space proportional to the full state space regardless of input.",
          },
          {
            tag: "ul",
            items: ["Memo table: 2ⁿ subsets × n possible current cities = O(2ⁿ · n) entries"],
          },
        ],
        average: [
          { tag: "h2", text: "Average Case Space — O(2ⁿ · n)" },
          {
            tag: "p",
            text: "Table size is fixed by the number of cities n alone, since every possible subset must have storage allocated regardless of the actual distances between cities.",
          },
          { tag: "ul", items: ["Same O(2ⁿ · n) bound regardless of distance value distribution"] },
        ],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(2ⁿ · n)" },
          {
            tag: "p",
            text: "No city configuration changes the table size — it's fixed entirely by n, identical across all cases.",
          },
          {
            tag: "ul",
            items: [
              "O(2ⁿ · n) for the full state table",
              "This exponential space requirement is the practical memory bottleneck that limits Held-Karp to roughly n ≤ 20 on typical hardware, even before considering the exponential time cost",
              "The recursive memoized version shown in code additionally uses O(n) call-stack depth, a lower-order term that doesn't change the overall O(2ⁿ · n) classification",
            ],
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "p",
          text: "Held-Karp bitmask DP, expressed as top-down memoization starting from city 0. tsp(mask, pos) returns the minimum cost to complete a tour, having already visited exactly the cities in 'mask' and currently standing at city 'pos':",
        },
        {
          tag: "code",
          language: "text",
          text: `function tsp(mask, pos, n, dist, memo):
    if mask == (1 << n) − 1:
        return dist[pos][0]              // all cities visited — return home to city 0

    if memo[mask][pos] is not empty:
        return memo[mask][pos]           // already solved this exact state

    best ← infinity
    for city from 0 to n − 1:
        if mask does not have bit 'city' set:      // city not yet visited
            candidate ← dist[pos][city] + tsp(mask | (1 << city), city, n, dist, memo)
            best ← min(best, candidate)

    memo[mask][pos] ← best
    return best

// Initial call: tsp(1, 0, n, dist, memo)   — mask=1 means only city 0 is visited`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Define tsp(mask, pos) as 'the minimum cost to visit every remaining unvisited city exactly once and return to city 0, given that the cities in mask have already been visited and the tour is currently at city pos'.",
            "Base case: once every bit in mask is set (mask equals (1 << n) − 1, meaning all n cities have been visited), the only remaining step is the direct return trip from pos back to the start, city 0.",
            "Before doing any work, check the memo table — if this exact (mask, pos) state has already been solved, return the cached answer immediately rather than recomputing it.",
            "Otherwise, try visiting every currently-unvisited city next: for each candidate city, compute the cost of travelling there plus the optimal cost of completing the tour from that new state (recursively).",
            "Take the minimum over all these candidate next-city choices, cache it in the memo table for this (mask, pos) state, and return it.",
            "The overall answer is the initial call tsp(1, 0, ...), starting with only city 0 marked visited (mask = 1, since bit 0 is set) and the tour currently positioned at city 0.",
          ],
        },
        { tag: "h2", text: "Why it's correct" },
        {
          tag: "p",
          text: "The crucial insight enabling this DP is that the future of the tour (which unvisited cities remain to be visited, and how to visit them optimally) depends ONLY on the current city and the SET of cities already visited — not on the specific order in which they were visited. This means many different permutations that happen to visit the same set of cities and end at the same city are correctly collapsed into a single state, which is exactly what eliminates the (n-1)! redundancy of brute force. By induction on the number of unset bits in mask (equivalently, the number of cities remaining to be visited), tsp(mask, pos) is correctly computed as the minimum over all valid ways to complete the tour from that exact state, since every recursive call it makes operates on a state with strictly more visited cities (a strictly 'smaller' remaining problem), guaranteeing the recursion terminates and that every subproblem it depends on is itself already correctly solved by the same inductive argument. The memo table guarantees each of the O(2ⁿ · n) distinct states is solved exactly once, regardless of how many different paths in the recursion tree would otherwise reach it.",
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <climits>
#include <algorithm>

using namespace std;

const int INF = 1e9;

int tsp(int mask, int pos, int n, const vector<vector<int>>& dist, vector<vector<int>>& dp) {
    // If all cities have been visited, return cost to go back to the starting city (0)
    if (mask == (1 << n) - 1) {
        return dist[pos][0];
    }
    
    if (dp[mask][pos] != -1) {
        return dp[mask][pos];
    }

    int ans = INF;
    for (int city = 0; city < n; city++) {
        // If the city has not been visited yet
        if ((mask & (1 << city)) == 0) {
            int newAns = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, dp);
            ans = min(ans, newAns);
        }
    }
    return dp[mask][pos] = ans;
}

int main() {
    int n = 4;
    // Distance matrix where dist[i][j] is distance from city i to j
    vector<vector<int>> dist = {
        {0, 10, 15, 20},
        {10, 0, 35, 25},
        {15, 35, 0, 30},
        {20, 25, 30, 0}
    };
    
    // dp array initialized to -1
    // Size is 2^n for rows (bitmask) and n for columns
    vector<vector<int>> dp(1 << n, vector<int>(n, -1));

    // Start at city 0, mask is 1 (city 0 visited)
    cout << "Minimum cost of Travelling Salesperson = " << tsp(1, 0, n, dist, dp) << endl;
    return 0;
}`,
        python: `def tsp(mask, pos, n, dist, memo):
    # If all cities have been visited, return cost to go back to the starting city (0)
    if mask == (1 << n) - 1:
        return dist[pos][0]

    if memo[mask][pos] != -1:
        return memo[mask][pos]

    best = float('inf')
    for city in range(n):
        # If the city has not been visited yet
        if not (mask & (1 << city)):
            candidate = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, memo)
            best = min(best, candidate)

    memo[mask][pos] = best
    return best


if __name__ == "__main__":
    n = 4
    # Distance matrix where dist[i][j] is distance from city i to j
    dist = [
        [0, 10, 15, 20],
        [10, 0, 35, 25],
        [15, 35, 0, 30],
        [20, 25, 30, 0],
    ]

    memo = [[-1] * n for _ in range(1 << n)]

    # Start at city 0, mask is 1 (city 0 visited)
    print(f"Minimum cost of Travelling Salesperson = {tsp(1, 0, n, dist, memo)}")`,
        java: `public class Main {
    static final int INF = Integer.MAX_VALUE / 2;

    static int tsp(int mask, int pos, int n, int[][] dist, int[][] dp) {
        if (mask == (1 << n) - 1) {
            return dist[pos][0];
        }

        if (dp[mask][pos] != -1) {
            return dp[mask][pos];
        }

        int ans = INF;
        for (int city = 0; city < n; city++) {
            if ((mask & (1 << city)) == 0) {
                int newAns = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, dp);
                ans = Math.min(ans, newAns);
            }
        }
        return dp[mask][pos] = ans;
    }

    public static void main(String[] args) {
        int n = 4;
        int[][] dist = {
            {0, 10, 15, 20},
            {10, 0, 35, 25},
            {15, 35, 0, 30},
            {20, 25, 30, 0}
        };

        int[][] dp = new int[1 << n][n];
        for (int[] row : dp) java.util.Arrays.fill(row, -1);

        System.out.println("Minimum cost of Travelling Salesperson = " + tsp(1, 0, n, dist, dp));
    }
}`,
        js: `function tsp(mask, pos, n, dist, memo) {
    if (mask === (1 << n) - 1) {
        return dist[pos][0];
    }

    if (memo[mask][pos] !== -1) {
        return memo[mask][pos];
    }

    let best = Infinity;
    for (let city = 0; city < n; city++) {
        if ((mask & (1 << city)) === 0) {
            const candidate = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, memo);
            best = Math.min(best, candidate);
        }
    }

    memo[mask][pos] = best;
    return best;
}

const n = 4;
const dist = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0],
];

const memo = Array.from({ length: 1 << n }, () => new Array(n).fill(-1));

console.log("Minimum cost of Travelling Salesperson =", tsp(1, 0, n, dist, memo));`,
        c: `#include <stdio.h>
#include <limits.h>

#define N 4
#define INF (INT_MAX / 2)

int dist[N][N] = {
    {0, 10, 15, 20},
    {10, 0, 35, 25},
    {15, 35, 0, 30},
    {20, 25, 30, 0}
};
int dp[1 << N][N];

int min(int a, int b) {
    return (a < b) ? a : b;
}

int tsp(int mask, int pos) {
    if (mask == (1 << N) - 1) {
        return dist[pos][0];
    }

    if (dp[mask][pos] != -1) {
        return dp[mask][pos];
    }

    int ans = INF;
    for (int city = 0; city < N; city++) {
        if ((mask & (1 << city)) == 0) {
            int newAns = dist[pos][city] + tsp(mask | (1 << city), city);
            ans = min(ans, newAns);
        }
    }
    return dp[mask][pos] = ans;
}

int main() {
    for (int i = 0; i < (1 << N); i++) {
        for (int j = 0; j < N; j++) {
            dp[i][j] = -1;
        }
    }

    printf("Minimum cost of Travelling Salesperson = %d\\n", tsp(1, 0));
    return 0;
}`,
        "c#": `using System;

class Program {
    const int INF = int.MaxValue / 2;

    static int Tsp(int mask, int pos, int n, int[,] dist, int[,] dp) {
        if (mask == (1 << n) - 1) {
            return dist[pos, 0];
        }

        if (dp[mask, pos] != -1) {
            return dp[mask, pos];
        }

        int ans = INF;
        for (int city = 0; city < n; city++) {
            if ((mask & (1 << city)) == 0) {
                int newAns = dist[pos, city] + Tsp(mask | (1 << city), city, n, dist, dp);
                ans = Math.Min(ans, newAns);
            }
        }
        return dp[mask, pos] = ans;
    }

    static void Main() {
        int n = 4;
        int[,] dist = {
            { 0, 10, 15, 20 },
            { 10, 0, 35, 25 },
            { 15, 35, 0, 30 },
            { 20, 25, 30, 0 }
        };

        int[,] dp = new int[1 << n, n];
        for (int i = 0; i < (1 << n); i++)
            for (int j = 0; j < n; j++)
                dp[i, j] = -1;

        Console.WriteLine($"Minimum cost of Travelling Salesperson = {Tsp(1, 0, n, dist, dp)}");
    }
}`,
        swift: `let n = 4
let dist = [
    [0, 10, 15, 20],
    [10, 0, 35, 25],
    [15, 35, 0, 30],
    [20, 25, 30, 0]
]
var memo = Array(repeating: Array(repeating: -1, count: n), count: 1 << n)

func tsp(_ mask: Int, _ pos: Int) -> Int {
    if mask == (1 << n) - 1 {
        return dist[pos][0]
    }

    if memo[mask][pos] != -1 {
        return memo[mask][pos]
    }

    var best = Int.max / 2
    for city in 0..<n {
        if mask & (1 << city) == 0 {
            let candidate = dist[pos][city] + tsp(mask | (1 << city), city)
            best = min(best, candidate)
        }
    }

    memo[mask][pos] = best
    return best
}

print("Minimum cost of Travelling Salesperson = \\(tsp(1, 0))")`,
        kotlin: `val n = 4
val dist = arrayOf(
    intArrayOf(0, 10, 15, 20),
    intArrayOf(10, 0, 35, 25),
    intArrayOf(15, 35, 0, 30),
    intArrayOf(20, 25, 30, 0)
)
val memo = Array(1 shl n) { IntArray(n) { -1 } }

fun tsp(mask: Int, pos: Int): Int {
    if (mask == (1 shl n) - 1) {
        return dist[pos][0]
    }

    if (memo[mask][pos] != -1) {
        return memo[mask][pos]
    }

    var best = Int.MAX_VALUE / 2
    for (city in 0 until n) {
        if (mask and (1 shl city) == 0) {
            val candidate = dist[pos][city] + tsp(mask or (1 shl city), city)
            best = minOf(best, candidate)
        }
    }

    memo[mask][pos] = best
    return best
}

fun main() {
    println("Minimum cost of Travelling Salesperson = \${tsp(1, 0)}")
}`,
        scala: `object Main extends App {
    val n = 4
    val dist = Array(
        Array(0, 10, 15, 20),
        Array(10, 0, 35, 25),
        Array(15, 35, 0, 30),
        Array(20, 25, 30, 0)
    )
    val memo = Array.fill(1 << n, n)(-1)

    def tsp(mask: Int, pos: Int): Int = {
        if (mask == (1 << n) - 1) {
            return dist(pos)(0)
        }

        if (memo(mask)(pos) != -1) {
            return memo(mask)(pos)
        }

        var best = Int.MaxValue / 2
        for (city <- 0 until n) {
            if ((mask & (1 << city)) == 0) {
                val candidate = dist(pos)(city) + tsp(mask | (1 << city), city)
                best = math.min(best, candidate)
            }
        }

        memo(mask)(pos) = best
        best
    }

    println(s"Minimum cost of Travelling Salesperson = \${tsp(1, 0)}")
}`,
        go: `package main

import "fmt"

var n = 4
var dist = [][]int{
    {0, 10, 15, 20},
    {10, 0, 35, 25},
    {15, 35, 0, 30},
    {20, 25, 30, 0},
}
var memo [][]int

func minInt(a, b int) int {
    if a < b {
        return a
    }
    return b
}

func tsp(mask, pos int) int {
    if mask == (1<<n)-1 {
        return dist[pos][0]
    }

    if memo[mask][pos] != -1 {
        return memo[mask][pos]
    }

    best := 1 << 30
    for city := 0; city < n; city++ {
        if mask&(1<<city) == 0 {
            candidate := dist[pos][city] + tsp(mask|(1<<city), city)
            best = minInt(best, candidate)
        }
    }

    memo[mask][pos] = best
    return best
}

func main() {
    memo = make([][]int, 1<<n)
    for i := range memo {
        memo[i] = make([]int, n)
        for j := range memo[i] {
            memo[i][j] = -1
        }
    }

    fmt.Println("Minimum cost of Travelling Salesperson =", tsp(1, 0))
}`,
        rust: `use std::collections::HashMap;

fn tsp(mask: u32, pos: usize, n: usize, dist: &Vec<Vec<i32>>, memo: &mut HashMap<(u32, usize), i32>) -> i32 {
    if mask == (1 << n) - 1 {
        return dist[pos][0];
    }

    if let Some(&cached) = memo.get(&(mask, pos)) {
        return cached;
    }

    let mut best = i32::MAX / 2;
    for city in 0..n {
        if mask & (1 << city) == 0 {
            let candidate = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, memo);
            best = best.min(candidate);
        }
    }

    memo.insert((mask, pos), best);
    best
}

fn main() {
    let n = 4;
    let dist = vec![
        vec![0, 10, 15, 20],
        vec![10, 0, 35, 25],
        vec![15, 35, 0, 30],
        vec![20, 25, 30, 0],
    ];

    let mut memo: HashMap<(u32, usize), i32> = HashMap::new();

    println!("Minimum cost of Travelling Salesperson = {}", tsp(1, 0, n, &dist, &mut memo));
}`,
      },
    },

    /* ════════════════════════════════════════════════════════════════════
       7. FIBONACCI SEQUENCE (TABULATION)
    ════════════════════════════════════════════════════════════════════ */

    {
      name: "Fibonacci Sequence",
      href: "/algorithms/dynamic_programming/fibonacci",
      type: "Easy",

      about: [
        { tag: "h1", text: "Fibonacci Sequence (Array Tabulation)" },
        {
          tag: "p",
          text: "The Fibonacci Sequence is the 'Hello World' of Dynamic Programming. The value at step `n` is strictly the sum of the two preceding steps. While a naive recursive implementation branches wildly (creating an O(2ⁿ) time complexity nightmare by recalculating the same subproblems), DP collapses this into linear time by storing previously computed values.",
        },
        {
          tag: "p",
          text: "This specific implementation utilizes Tabulation (a bottom-up approach) by maintaining a full state array `dp`. We iteratively build the solution from base cases `dp[0]` and `dp[1]` all the way up to `dp[n]`. While this takes O(n) space, it provides a foundational understanding of how state history is tracked in 1D Dynamic Programming.",
        },
        { tag: "h2", text: "When to reach for it" },
        {
          tag: "ul",
          items: [
            "Staircase problem (how many ways to climb a staircase taking 1 or 2 steps).",
            "When you need to retain the entire historical sequence of calculations for future queries (e.g., answering multiple queries for different `n` without recalculating).",
            "Tiling problems (how many ways to tile a 2 × n board with 2 × 1 dominoes).",
          ],
        },
        {
          tag: "note",
          variant: "warning",
          text: "Because `f(n)` strictly depends ONLY on `f(n-1)` and `f(n-2)`, maintaining the entire array is technically wasteful if you only need the final answer. It can be optimized to O(1) space using two rolling variables.",
        },
      ],

      timeComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case — O(n)" },
          { tag: "p", text: "To compute the n-th item, n iterations are strictly required." },
        ],
        average: [
          { tag: "h2", text: "Average Case — O(n)" },
          {
            tag: "p",
            text: "The iterative bottom-up loop evaluates strictly in linear time unconditionally.",
          },
        ],
        worst: [
          { tag: "h2", text: "Worst Case — O(n)" },
          {
            tag: "p",
            text: "The constant loop bound means performance is securely capped at O(n).",
          },
        ],
      },

      spaceComplexityCalculation: {
        notation: "O(n)",
        best: [
          { tag: "h2", text: "Best Case Space — O(n)" },
          {
            tag: "p",
            text: "An array of size `n + 1` is strictly allocated to hold the DP table.",
          },
        ],
        average: [{ tag: "h2", text: "Average Case Space — O(n)" }],
        worst: [
          { tag: "h2", text: "Worst Case Space — O(n)" },
          {
            tag: "p",
            text: "Memory allocation scales linearly with `n`. A 1,000,000th Fibonacci element would require an array of 1,000,001 integer slots.",
          },
        ],
      },

      pseudoCodeandStepexplanation: [
        { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
        {
          tag: "code",
          language: "text",
          text: `function fibonacci(n):
    if n == 0: return 0
    
    dp ← empty array of size (n + 1)
    
    dp[0] ← 0
    dp[1] ← 1
    
    for i from 2 to n:
        dp[i] ← dp[i - 1] + dp[i - 2]
        
    return dp[n]`,
        },
        { tag: "h2", text: "Step-by-step reasoning" },
        {
          tag: "ol",
          items: [
            "Immediately handle the base case where `n = 0` to prevent out-of-bounds array initialization.",
            "Allocate an array `dp` of size `n + 1`. This allows the index `i` to correspond directly to the `i`-th Fibonacci number.",
            "Seed the DP table with the known base cases: `dp[0] = 0` and `dp[1] = 1`.",
            "Iterate from `2` up to `n`.",
            "At each step `i`, calculate the current value by summing the two immediate predecessors: `dp[i - 1]` and `dp[i - 2]`.",
            "Return the last element in the array `dp[n]`, which holds the fully constructed target value.",
          ],
        },
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>

using namespace std;

int fibonacci(int n) {
    if (n == 0) return 0;

    vector<int> dp(n + 1);

    dp[0] = 0;
    dp[1] = 1;

    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }

    return dp[n];
}

int main() {
    int n = 10;
    cout << "Fibonacci of " << n << " is: " << fibonacci(n) << endl;
    return 0;
}`,
        python: `def fibonacci(n: int) -> int:
    if n == 0:
        return 0
        
    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
        
    return dp[n]

if __name__ == "__main__":
    n = 10
    print(f"Fibonacci of {n} is: {fibonacci(n)}")`,
        java: `public class Main {
    public static int fibonacci(int n) {
        if (n == 0) return 0;
        
        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        
        return dp[n];
    }

    public static void main(String[] args) {
        int n = 10;
        System.out.println("Fibonacci of " + n + " is: " + fibonacci(n));
    }
}`,
        js: `function fibonacci(n) {
    if (n === 0) return 0;
    
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

const n = 10;
console.log("Fibonacci of", n, "is:", fibonacci(n));`,
        c: `#include <stdio.h>

int fibonacci(int n) {
    if (n == 0) return 0;
    
    int dp[n + 1]; // VLA for C99+
    dp[0] = 0;
    dp[1] = 1;
    
    for (int i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

int main() {
    int n = 10;
    printf("Fibonacci of %d is: %d\\n", n, fibonacci(n));
    return 0;
}`,
        "c#": `using System;

class Program {
    static int Fibonacci(int n) {
        if (n == 0) return 0;
        
        int[] dp = new int[n + 1];
        dp[0] = 0;
        dp[1] = 1;
        
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i - 1] + dp[i - 2];
        }
        
        return dp[n];
    }

    static void Main() {
        int n = 10;
        Console.WriteLine($"Fibonacci of {n} is: {Fibonacci(n)}");
    }
}`,
        swift: `func fibonacci(_ n: Int) -> Int {
    if n == 0 { return 0 }
    
    var dp = Array(repeating: 0, count: n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for i in 2...n {
        dp[i] = dp[i - 1] + dp[i - 2]
    }
    
    return dp[n]
}

let n = 10
print("Fibonacci of \\(n) is: \\(fibonacci(n))")`,
        kotlin: `fun fibonacci(n: Int): Int {
    if (n == 0) return 0
    
    val dp = IntArray(n + 1)
    dp[0] = 0
    dp[1] = 1
    
    for (i in 2..n) {
        dp[i] = dp[i - 1] + dp[i - 2]
    }
    
    return dp[n]
}

fun main() {
    val n = 10
    println("Fibonacci of $n is: \${fibonacci(n)}")
}`,
        scala: `object Main extends App {
    def fibonacci(n: Int): Int = {
        if (n == 0) return 0
        
        val dp = new Array[Int](n + 1)
        dp(0) = 0
        dp(1) = 1
        
        for (i <- 2 to n) {
            dp(i) = dp(i - 1) + dp(i - 2)
        }
        
        dp(n)
    }

    val n = 10
    println(s"Fibonacci of $n is: \${fibonacci(n)}")
}`,
        go: `package main

import "fmt"

func fibonacci(n int) int {
    if n == 0 {
        return 0
    }
    
    dp := make([]int, n+1)
    dp[0] = 0
    dp[1] = 1
    
    for i := 2; i <= n; i++ {
        dp[i] = dp[i - 1] + dp[i - 2]
    }
    
    return dp[n]
}

func main() {
    n := 10
    fmt.Printf("Fibonacci of %d is: %d\\n", n, fibonacci(n))
}`,
        rust: `fn fibonacci(n: usize) -> u32 {
    if n == 0 {
        return 0;
    }
    
    let mut dp = vec![0; n + 1];
    dp[0] = 0;
    dp[1] = 1;
    
    for i in 2..=n {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    dp[n]
}

fn main() {
    let n = 10;
    println!("Fibonacci of {} is: {}", n, fibonacci(n));
}`,
      },
    },
  ],
  desc: "Memoization, tabulation, state transitions, and 1D/2D DP problems",
  complexity: "O(n) - O(2ⁿ)",
  featured: true,
};

export default DYNAMIC_PROGRAMMING_SECTION;

// const DYNAMIC_PROGRAMMING_SECTION = {
//   name: "Dynamic Programming",
//   href: "/algorithms/dynamic_programming",
//     icon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
//         <rect x="8" y="8" width="16" height="16"/>
//         <rect x="24" y="8" width="16" height="16"/>
//         <rect x="40" y="8" width="16" height="16"/>
//         <rect x="8" y="24" width="16" height="16"/>
//         <rect x="24" y="24" width="16" height="16"/>
//         <rect x="40" y="24" width="16" height="16"/>
//         <rect x="8" y="40" width="16" height="16"/>
//         <rect x="24" y="40" width="16" height="16"/>
//         <rect x="40" y="40" width="16" height="16"/>
//       </svg>
//     ),
//     hoverIcon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
//         <rect x="8" y="8" width="16" height="16" fill="#34D399" stroke="#34D399"/>
//         <rect x="24" y="8" width="16" height="16"/>
//         <rect x="40" y="8" width="16" height="16"/>
//         <rect x="8" y="24" width="16" height="16" fill="#34D399" stroke="#34D399"/>
//         <rect x="24" y="24" width="16" height="16" fill="#34D399" stroke="#34D399"/>
//         <rect x="40" y="24" width="16" height="16"/>
//         <rect x="8" y="40" width="16" height="16"/>
//         <rect x="24" y="40" width="16" height="16"/>
//         <rect x="40" y="40" width="16" height="16" fill="#34D399" stroke="#34D399"/>
//       </svg>
//     ),

//   about: [
//     { tag: "h1", text: "Dynamic Programming" },
//     { tag: "p", text: "Dynamic Programming (DP) solves complex problems by breaking them into overlapping subproblems, solving each subproblem exactly once, and reusing those results instead of recomputing them. It applies whenever a problem exhibits two properties: optimal substructure (an optimal solution can be built from optimal solutions to its subproblems) and overlapping subproblems (a naive recursive solution would solve the same subproblem many times)." },
//     { tag: "p", text: "Without overlapping subproblems, plain recursion (divide and conquer, like Merge Sort) is already efficient — DP's entire value proposition is eliminating redundant recomputation. The classic illustration is naive recursive Fibonacci: fib(5) calls fib(4) and fib(3), but fib(4) ALSO calls fib(3) — that single redundant call, multiplied across every level of recursion, is what turns an O(n) problem into an O(2ⁿ) nightmare without memoization." },
//     { tag: "h2", text: "Two implementation styles" },
//     { tag: "table",
//       headers: ["Style", "Direction", "How it works", "Trade-off"],
//       rows: [
//         ["Memoization (top-down)", "Recursive, same as naive solution", "Cache each subproblem's result the first time it's computed; return the cached value on repeat calls", "Easier to write from a recursive definition; pays recursion call-stack overhead"],
//         ["Tabulation (bottom-up)", "Iterative, smallest subproblems first", "Fill a table in dependency order so every subproblem's prerequisites are already solved when needed", "Usually faster in practice (no call-stack overhead); requires figuring out the correct fill order upfront"]
//       ]
//     },
//     { tag: "h2", text: "Recognising a DP problem" },
//     { tag: "ul", items: [
//       "The problem asks for an optimum (minimum/maximum) or a count, and naturally decomposes into smaller versions of itself",
//       "A greedy (locally-optimal) choice provably does NOT always lead to a globally optimal answer — if it did, a simpler greedy algorithm would suffice instead",
//       "A brute-force recursive solution would revisit the same (state, parameters) combination multiple times along different recursive paths",
//       "The problem can be expressed as filling in a 1D or 2D table where each cell depends only on previously-computed cells"
//     ]},
//     { tag: "note", variant: "tip", text: "Every DP solution starts the same way: define the state (what does dp[i] or dp[i][j] represent?), find the recurrence (how does it relate to smaller states?), and identify the base case. Getting the state definition right is almost always the hardest part — the rest follows mechanically." }
//   ],

//   items: [

//     /* ════════════════════════════════════════════════════════════════════
//        1. 0/1 KNAPSACK
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "0/1 Knapsack",
//       href: "/algorithms/dynamic_programming/knapsack",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "0/1 Knapsack" },
//         { tag: "p", text: "Given n items, each with a weight and a value, and a knapsack with maximum weight capacity W, the 0/1 Knapsack problem asks for the maximum total value achievable without exceeding the capacity — where each item can either be taken whole or left behind entirely ('0/1', as opposed to the Fractional Knapsack variant, which allows taking partial items and is solvable greedily instead)." },
//         { tag: "p", text: "It's the canonical example of DP with two-dimensional state: the decision for each item depends not just on which items came before, but on how much capacity remains — so the state must capture both 'which items have been considered' and 'how much weight budget is left'." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Resource allocation under a hard capacity constraint where items are indivisible (can't take 60% of a physical item)",
//           "Budget allocation: maximise value/return subject to a fixed total spending limit, with discrete (not fractional) investment options",
//           "Subset-sum problems are a special case (value = weight for every item, asking whether some subset sums exactly to a target)",
//           "Note: if items CAN be split fractionally, a much simpler O(n log n) greedy algorithm (Fractional Knapsack) solves it instead — always check divisibility before reaching for the DP solution"
//         ]},
//         { tag: "note", variant: "warning", text: "0/1 Knapsack's O(nW) complexity is pseudo-polynomial — it depends on the numeric VALUE of W, not just the count of items. If W is exponentially large relative to n (e.g. W = 2^64), this DP approach becomes impractical despite the polynomial-looking formula." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(nW)",
//         best: [
//           { tag: "h2", text: "Best Case — O(nW)" },
//           { tag: "p", text: "The standard tabulation approach always fills the entire n × W table regardless of the specific weights and values involved — there's no early-exit shortcut, since every cell potentially contributes to the final answer." },
//           { tag: "ul", items: [
//             "Table has (n + 1) rows × (W + 1) columns",
//             "Each cell requires O(1) work: one comparison between 'exclude this item' and 'include this item'",
//             "Total: O(nW), unconditionally, even for the most favourable item set"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(nW)" },
//           { tag: "p", text: "Every cell of the DP table is computed exactly once with constant work, regardless of the specific weight/value distribution of the items — the algorithm's structure doesn't branch based on input values." },
//           { tag: "ul", items: [
//             "(n+1) × (W+1) cells, O(1) work per cell = O(nW)",
//             "No input distribution changes this fixed iteration structure"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(nW)" },
//           { tag: "p", text: "No item configuration increases the cost beyond filling the full table — this is simultaneously the best, average, and worst case, since the DP table size is fixed entirely by n and W." },
//           { tag: "ul", items: [
//             "O(nW) holds unconditionally",
//             "This is pseudo-polynomial: if W is given in binary with b bits, W = 2^b, so the 'polynomial-looking' O(nW) is actually O(n · 2^b) — exponential in the INPUT SIZE of W, which is why huge capacity values make this approach impractical"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(nW)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(W)" },
//           { tag: "p", text: "Since each row of the DP table only depends on the immediately preceding row, the table can be compressed to a single 1D array of size W+1, processed carefully right-to-left to avoid overwriting values still needed." },
//           { tag: "ul", items: ["1D rolling array: O(W)", "This space optimisation works for any input, not just favourable ones"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(nW)" },
//           { tag: "p", text: "The naive (unoptimised) 2D table implementation always allocates the full n × W grid, regardless of item values, since the recurrence is defined cell-by-cell over both dimensions." },
//           { tag: "ul", items: ["Full 2D table: (n+1) × (W+1) = O(nW)", "Needed if you must reconstruct WHICH items were chosen, not just the optimal value"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(nW)" },
//           { tag: "p", text: "No item configuration changes the table size — it's fixed entirely by the problem parameters n and W, identical across all cases for the standard 2D implementation." },
//           { tag: "ul", items: [
//             "O(nW) for the full table, or O(W) with the 1D rolling-array optimisation (at the cost of losing the ability to trace back which items were selected without extra bookkeeping)"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function knapsack(weights, values, n, W):
//     dp ← 2D array of size (n+1) x (W+1), all zero

//     for i from 1 to n:
//         for w from 0 to W:
//             // Option 1: don't take item i
//             dp[i][w] ← dp[i-1][w]

//             // Option 2: take item i, if it fits
//             if weights[i-1] <= w:
//                 dp[i][w] ← max(dp[i][w], dp[i-1][w - weights[i-1]] + values[i-1])

//     return dp[n][W]` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Define dp[i][w] as 'the maximum value achievable using only the first i items, with total weight at most w'.",
//           "Base case: dp[0][w] = 0 for all w — with zero items available, no value can be achieved regardless of capacity.",
//           "For each item i and each possible capacity w, two options exist: exclude item i (carry forward dp[i-1][w] unchanged), or include item i if it fits (add its value to the best solution using one less item and w minus item i's weight).",
//           "Take the better of these two options as dp[i][w].",
//           "After filling the entire table, dp[n][W] holds the answer: the maximum value achievable using any subset of all n items within the full capacity W."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Optimal substructure: the optimal solution using the first i items and capacity w must either include item i or not. If it doesn't include item i, the optimal solution is exactly the optimal solution using the first i-1 items and the same capacity w — by definition. If it does include item i, the remaining budget w − weights[i-1] must be allocated optimally among the first i-1 items, which is exactly dp[i-1][w − weights[i-1]] by the same inductive definition. Since these are the only two possibilities and both are correctly computed by the recurrence (by strong induction on i), taking their maximum correctly computes dp[i][w] for every cell, and the final answer dp[n][W] is therefore provably optimal." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>
// #include <algorithm>

// using namespace std;

// int knapsack(int capacity, const vector<int>& arr_weights, const vector<int>& arr_values, int n) {
//     // dp[i][j] stores the max value for first 'i' items with weight limit 'j'
//     vector<vector<int>> dp(n + 1, vector<int>(capacity + 1, 0));

//     for (int i = 1; i <= n; i++) {
//         for (int j = 1; j <= capacity; j++) {
//             if (arr_weights[i - 1] <= j) {
//                 // Include item or exclude item
//                 dp[i][j] = max(arr_values[i - 1] + dp[i - 1][j - arr_weights[i - 1]], dp[i - 1][j]);
//             } else {
//                 // Exclude item
//                 dp[i][j] = dp[i - 1][j];
//             }
//         }
//     }
//     return dp[n][capacity];
// }

// int main() {
//     vector<int> arr_values = {60, 100, 120};
//     vector<int> arr_weights = {10, 20, 30};
//     int capacity = 50;
//     int n = arr_values.size();

//     cout << "Maximum value in Knapsack = " << knapsack(capacity, arr_weights, arr_values, n) << endl;
//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        2. MATRIX CHAIN MULTIPLICATION
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Matrix Chain Multiplication",
//       href: "/algorithms/dynamic_programming/matrix-chain",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Matrix Chain Multiplication" },
//         { tag: "p", text: "Given a sequence of matrices to multiply together, Matrix Chain Multiplication finds the optimal way to parenthesise the multiplications to minimise the total number of scalar multiplications performed — matrix multiplication is associative, so (AB)C and A(BC) produce the same result matrix, but can require drastically different amounts of computation depending on the matrices' dimensions." },
//         { tag: "p", text: "It's the classic example of interval DP: the state is defined over a CONTIGUOUS RANGE [i, j] of the chain rather than a prefix, and the recurrence works by trying every possible 'split point' k within the range where the final multiplication could occur, recursively combining the optimal cost of the left part [i,k] and right part [k+1,j]." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Optimising the order of operations for a chain of matrix multiplications in numerical computing libraries",
//           "Any problem requiring optimal parenthesisation/bracketing of a sequence of associative operations with position-dependent cost",
//           "The general template for 'interval DP' problems — many other problems (optimal BST construction, palindrome partitioning cost) follow the exact same [i,j]-with-split-point pattern",
//           "Compiler optimisation: choosing the optimal order to evaluate a chain of associative operations to minimise computation cost"
//         ]},
//         { tag: "note", variant: "tip", text: "This algorithm finds the optimal PARENTHESISATION (the order of operations), not the matrix product itself — the actual multiplication still has to be performed afterward according to the discovered optimal order." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n³)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n³)" },
//           { tag: "p", text: "The algorithm always evaluates every possible split point for every possible sub-chain length and starting position — there's no early-exit shortcut even for the most favourable matrix dimensions." },
//           { tag: "ul", items: [
//             "O(n²) distinct sub-chains [i, j] to compute",
//             "Each sub-chain's optimal cost requires trying up to O(n) possible split points k",
//             "Total: O(n²) sub-chains × O(n) split points each = O(n³)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n³)" },
//           { tag: "p", text: "Every (i, j, k) combination is evaluated exactly once with O(1) work per combination, regardless of the actual matrix dimension values — the algorithm's iteration structure is fixed by n alone." },
//           { tag: "ul", items: [
//             "Three nested considerations: chain length (O(n)), starting index i (O(n)), and split point k (O(n)) combine to O(n³) total operations",
//             "Each operation is O(1): one multiplication for the cost calculation, one comparison against the running minimum"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n³)" },
//           { tag: "p", text: "No matrix dimension configuration increases the cost beyond the fixed triple-nested iteration over chain length, start position, and split point." },
//           { tag: "ul", items: [
//             "Worst case identical to best/average: O(n³)",
//             "This is one of the standard examples of interval DP's characteristic O(n³) bound, arising from O(n²) states each requiring an O(n) decision"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n²)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n²)" },
//           { tag: "p", text: "The DP table stores the optimal cost for every possible sub-chain [i, j], requiring a 2D table of size n × n regardless of the matrix dimensions involved." },
//           { tag: "ul", items: ["Cost table: n × n entries — O(n²)", "Optional split-point table (for reconstructing the actual parenthesisation): another O(n²)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n²)" },
//           { tag: "p", text: "Table size is fixed by the number of matrices n alone — it doesn't depend on the specific dimension values of the matrices being multiplied." },
//           { tag: "ul", items: ["Same O(n²) bound regardless of matrix dimension distribution"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n²)" },
//           { tag: "p", text: "No matrix configuration increases space beyond the fixed n × n cost table — this is both the floor and ceiling for the algorithm's memory footprint." },
//           { tag: "ul", items: ["Cost table + split table: O(n²) total, identical across all cases"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "Given dimensions array p where matrix i has dimensions p[i-1] × p[i]:" },
//         { tag: "code", language: "text", text:
// `function matrixChainOrder(p):                 // p has length n+1 for n matrices
//     n ← length(p) − 1
//     dp ← 2D array of size (n+1) x (n+1), all zero

//     for length from 2 to n:                    // chain length being considered
//         for i from 1 to n − length + 1:
//             j ← i + length − 1
//             dp[i][j] ← infinity

//             for k from i to j − 1:
//                 cost ← dp[i][k] + dp[k+1][j] + p[i-1] * p[k] * p[j]
//                 if cost < dp[i][j]:
//                     dp[i][j] ← cost
//                     split[i][j] ← k             // remember where to split, for reconstruction

//     return dp[1][n]` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Define dp[i][j] as 'the minimum number of scalar multiplications needed to compute the product of matrices i through j'.",
//           "Base case (implicit): dp[i][i] = 0 — a single matrix needs no multiplication.",
//           "Process sub-chains in order of increasing length, since computing dp[i][j] requires dp[i][k] and dp[k+1][j] for sub-chains shorter than [i,j].",
//           "For each sub-chain [i, j], try every possible split point k — the position of the LAST multiplication performed when computing this sub-chain's product.",
//           "The cost of splitting at k is: the cost to compute the left part (dp[i][k]), plus the cost to compute the right part (dp[k+1][j]), plus the cost of the final multiplication joining them (p[i-1] × p[k] × p[j], based on the resulting matrix dimensions).",
//           "Take the minimum cost over all possible split points as dp[i][j], and remember which k achieved it for later reconstruction of the actual parenthesisation."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Optimal substructure: in any valid parenthesisation of matrices i through j, there must be SOME position k where the final (outermost) multiplication occurs, splitting the chain into a left part [i,k] and right part [k+1,j]. Whatever k is chosen, the optimal way to compute each of those two parts independently must itself be optimal — if a cheaper way to compute [i,k] existed, substituting it would only decrease the total cost, contradicting optimality. By trying every possible k and taking the minimum, the algorithm is guaranteed to consider the true optimal split point among all candidates, and by strong induction on chain length, every dp[i][k] and dp[k+1][j] used in that calculation is already correctly computed (since they represent strictly shorter sub-chains processed earlier)." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>
// #include <climits>
// #include <algorithm>

// using namespace std;

// int matrixChainOrder(const vector<int>& p) {
//     int n = p.size();
//     // dp[i][j] stores the min multiplications needed to multiply matrices from i to j
//     vector<vector<int>> dp(n, vector<int>(n, 0));

//     // L is the chain length
//     for (int L = 2; L < n; L++) {
//         for (int i = 1; i < n - L + 1; i++) {
//             int j = i + L - 1;
//             dp[i][j] = INT_MAX;
//             for (int k = i; k <= j - 1; k++) {
//                 int cost = dp[i][k] + dp[k + 1][j] + p[i - 1] * p[k] * p[j];
//                 if (cost < dp[i][j]) {
//                     dp[i][j] = cost;
//                 }
//             }
//         }
//     }
//     return dp[1][n - 1];
// }

// int main() {
//     // Array representing dimensions of matrices
//     // A is 1x2, B is 2x3, C is 3x4
//     vector<int> arr = {1, 2, 3, 4};

//     cout << "Minimum number of multiplications is = " << matrixChainOrder(arr) << endl;
//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        3. LONGEST COMMON SUBSEQUENCE
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Longest Common Subsequence",
//       href: "/algorithms/dynamic_programming/lcs",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Longest Common Subsequence (LCS)" },
//         { tag: "p", text: "Given two sequences, LCS finds the length (and optionally the content) of the longest subsequence common to both — a subsequence preserves relative order but doesn't need to be contiguous (unlike a substring). For example, the LCS of 'ABCBDAB' and 'BDCABA' is 'BCBA', length 4, even though 'BCBA' doesn't appear contiguously in either original string." },
//         { tag: "p", text: "It's the foundational two-sequence DP problem — the same [i][j] table-with-two-pointers-walking-backward structure underlies diff tools (computing the minimal edit between two file versions), DNA sequence alignment in bioinformatics, and the Levenshtein edit-distance algorithm, which is essentially LCS with additional operation types." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Comparing two sequences for similarity while allowing gaps (unlike substring matching, which requires contiguity)",
//           "Version control diff algorithms (git diff is conceptually built on LCS-style sequence alignment)",
//           "Bioinformatics: aligning DNA, RNA, or protein sequences to measure evolutionary similarity",
//           "As a building block for related problems: edit distance, shortest common supersequence, and the 'minimum deletions to make two strings equal' family of problems"
//         ]},
//         { tag: "note", variant: "tip", text: "LCS length directly gives you other useful values: minimum deletions to transform string A into a common subsequence is len(A) − LCS, and the shortest common supersequence length is len(A) + len(B) − LCS." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(mn)",
//         best: [
//           { tag: "h2", text: "Best Case — O(mn)" },
//           { tag: "p", text: "The standard tabulation approach always fills the entire m × n table regardless of how similar or dissimilar the two input sequences are — there's no early-exit shortcut for the standard algorithm." },
//           { tag: "ul", items: [
//             "Table has (m+1) rows × (n+1) columns, where m and n are the two sequence lengths",
//             "Each cell requires O(1) work: one character comparison plus a max of two or three neighboring cells",
//             "Total: O(mn), even for two identical sequences"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(mn)" },
//           { tag: "p", text: "Every cell of the DP table is computed exactly once with constant work, regardless of the specific character distribution in the two sequences." },
//           { tag: "ul", items: [
//             "(m+1) × (n+1) cells, O(1) work per cell = O(mn)",
//             "No input distribution changes this fixed iteration structure for the standard tabulation approach"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(mn)" },
//           { tag: "p", text: "No pair of input sequences increases the cost beyond filling the full table — this is simultaneously the best, average, and worst case for the standard DP solution." },
//           { tag: "ul", items: [
//             "O(mn) holds unconditionally for the standard algorithm",
//             "Faster algorithms exist for special cases (e.g. Hunt-Szymanski achieves O((m+r) log m) when the number of matching pairs r is small), but the general-purpose DP bound remains O(mn)"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(mn)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(min(m, n))" },
//           { tag: "p", text: "If only the LENGTH of the LCS is needed (not the actual subsequence), the table can be compressed to two rolling 1D arrays of size min(m,n)+1, since each row only depends on the previous row." },
//           { tag: "ul", items: ["Two rolling 1D arrays: O(min(m, n))", "This optimisation applies regardless of input content"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(mn)" },
//           { tag: "p", text: "The naive (unoptimised) full 2D table is always allocated at size (m+1) × (n+1), since the recurrence is defined cell-by-cell over both dimensions, and reconstructing the actual subsequence requires the full table." },
//           { tag: "ul", items: ["Full 2D table: O(mn)", "Required if you need to trace back and output the actual common subsequence, not just its length"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(mn)" },
//           { tag: "p", text: "No input pair changes the table size — it's fixed entirely by the two sequence lengths, identical across all cases for the standard 2D implementation." },
//           { tag: "ul", items: ["O(mn) for the full table when subsequence reconstruction is needed, or O(min(m,n)) with rolling arrays when only the length is required"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function lcs(A, B):
//     m ← length(A); n ← length(B)
//     dp ← 2D array of size (m+1) x (n+1), all zero

//     for i from 1 to m:
//         for j from 1 to n:
//             if A[i-1] == B[j-1]:
//                 dp[i][j] ← dp[i-1][j-1] + 1
//             else:
//                 dp[i][j] ← max(dp[i-1][j], dp[i][j-1])

//     return dp[m][n]` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Define dp[i][j] as 'the length of the LCS of A's first i characters and B's first j characters'.",
//           "Base case: dp[0][j] = dp[i][0] = 0 — an empty sequence has no common subsequence with anything, by definition.",
//           "If the current characters A[i-1] and B[j-1] match, they can both extend a common subsequence — so dp[i][j] = dp[i-1][j-1] + 1, building on the best LCS that didn't include either of these two characters.",
//           "If they don't match, the LCS of A[0..i-1] and B[0..j-1] must come from either dropping the current character of A or dropping the current character of B — take the better (longer) of these two options.",
//           "After filling the entire table, dp[m][n] holds the length of the LCS of the complete strings A and B."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Optimal substructure: if A[i-1] == B[j-1], this matching character can always be included in SOME longest common subsequence of A[0..i-1] and B[0..j-1] (a standard exchange argument shows that if an optimal LCS doesn't use this match, it can be modified to use it without becoming shorter) — so the problem correctly reduces to 1 + LCS(A[0..i-2], B[0..j-2]). If they don't match, the final characters can't BOTH be part of the LCS, so the optimal solution must exclude at least one of them — meaning the true LCS length equals the best of 'exclude A[i-1]' or 'exclude B[j-1]', exactly what max(dp[i-1][j], dp[i][j-1]) computes. By strong induction on i+j, every smaller subproblem used in these recurrences is already correctly computed." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>
// #include <string>
// #include <algorithm>

// using namespace std;

// int longestCommonSubsequence(string text1, string text2) {
//     int m = text1.length();
//     int n = text2.length();
//     vector<vector<int>> dp(m + 1, vector<int>(n + 1, 0));

//     for (int i = 1; i <= m; i++) {
//         for (int j = 1; j <= n; j++) {
//             if (text1[i - 1] == text2[j - 1]) {
//                 dp[i][j] = 1 + dp[i - 1][j - 1];
//             } else {
//                 dp[i][j] = max(dp[i - 1][j], dp[i][j - 1]);
//             }
//         }
//     }
//     return dp[m][n];
// }

// int main() {
//     string s1 = "abcde";
//     string s2 = "ace";

//     cout << "Length of LCS = " << longestCommonSubsequence(s1, s2) << endl;
//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        4. LONGEST INCREASING SUBSEQUENCE
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Longest Increasing Subsequence",
//       href: "/algorithms/dynamic_programming/lis",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Longest Increasing Subsequence (LIS)" },
//         { tag: "p", text: "Given a sequence of numbers, LIS finds the length of the longest subsequence (not necessarily contiguous) where every element is strictly greater than the one before it. For example, the LIS of [10, 9, 2, 5, 3, 7, 101, 18] is [2, 3, 7, 18] or [2, 3, 7, 101], both length 4." },
//         { tag: "p", text: "There are two standard approaches with very different complexity: a straightforward O(n²) DP where dp[i] represents the LIS length ending at index i, and a cleverer O(n log n) approach that maintains an auxiliary array of 'smallest possible tail values' for increasing subsequences of each length, using binary search to find where each new element belongs." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Stock market analysis: longest run of increasing prices (or the related 'patience sorting' card game analogy)",
//           "Scheduling problems: finding the maximum number of non-conflicting, chronologically-ordered tasks",
//           "Box-stacking / Russian Doll Envelopes style problems, which reduce to LIS after sorting by one dimension",
//           "As a building block for the patience sorting algorithm, and a classic example of converting an O(n²) DP into O(n log n) via auxiliary data structure cleverness"
//         ]},
//         { tag: "note", variant: "tip", text: "The O(n log n) approach's auxiliary 'tails' array is NOT itself a valid LIS — it just tracks the smallest tail value achievable for each subsequence length, which is enough to determine the final LENGTH correctly even though the array's contents don't form an actual increasing subsequence from the input." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n log n)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n log n)" },
//           { tag: "p", text: "Even on an already strictly-increasing input (where every element extends the current longest run), the O(n log n) algorithm still performs a binary search for each element to determine where it belongs in the auxiliary tails array — there's no shortcut to O(n)." },
//           { tag: "ul", items: [
//             "n elements processed, each requiring a binary search into the tails array (which has length at most n): O(log n) per element",
//             "Total: O(n log n), even for the most favourable (fully sorted) input"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n log n)" },
//           { tag: "p", text: "Each element triggers exactly one binary search into the tails array, regardless of the specific values or their relative ordering — the binary search cost is bounded by the current tails array length, which is at most n." },
//           { tag: "ul", items: [
//             "n binary searches, each O(log n): O(n log n) total",
//             "The simpler O(n²) DP approach instead does n elements × up to n comparisons each = O(n²), always slower asymptotically but sometimes simpler to reason about and implement"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n log n)" },
//           { tag: "p", text: "No input arrangement increases the cost beyond n binary searches — even a strictly decreasing sequence (which produces the shortest possible LIS, length 1) still requires checking each element with a binary search." },
//           { tag: "ul", items: [
//             "Worst case matches best/average: O(n log n)",
//             "This is provably optimal for comparison-based LIS computation, matching known lower bounds for this class of problem"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n)" },
//           { tag: "p", text: "The tails array can grow up to length n in the best case (a fully increasing sequence), requiring O(n) space to track the smallest tail value for every possible subsequence length." },
//           { tag: "ul", items: ["tails array: up to O(n) entries"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n)" },
//           { tag: "p", text: "Space usage is bounded by n regardless of the actual LIS length, since the tails array's maximum possible size is fixed by the input length." },
//           { tag: "ul", items: ["tails array: O(n) in the worst case, though it could be smaller for inputs with a short true LIS"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "Even in the case producing the longest possible tails array (a strictly increasing input sequence), space stays bounded by O(n) — it can never exceed the input length." },
//           { tag: "ul", items: [
//             "tails array: O(n)",
//             "If reconstructing the actual LIS (not just its length) is required, an additional O(n) predecessor-tracking array is needed, still O(n) total"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "O(n log n) patience-sorting-based approach:" },
//         { tag: "code", language: "text", text:
// `function lengthOfLIS(arr):
//     tails ← empty array

//     for x in arr:
//         // Binary search for the leftmost position in tails where x can be placed
//         lo ← 0; hi ← length(tails)
//         while lo < hi:
//             mid ← (lo + hi) / 2
//             if tails[mid] < x:
//                 lo ← mid + 1
//             else:
//                 hi ← mid

//         if lo == length(tails):
//             append x to tails           // x extends the longest subsequence so far
//         else:
//             tails[lo] ← x               // x replaces an existing tail with a smaller value

//     return length(tails)` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Maintain an array 'tails' where tails[k] represents the smallest possible tail value among all increasing subsequences of length k+1 found so far.",
//           "For each new element x in the input, binary search 'tails' to find the leftmost position where x could replace an existing value (i.e. the first tail value that is ≥ x).",
//           "If x is larger than every value currently in tails, it can extend the longest subsequence found so far — append it, growing the answer length by 1.",
//           "Otherwise, x replaces the existing tail at that position — this doesn't change the recorded LENGTH of that subsequence length, but it gives a SMALLER tail value, which makes it easier for future elements to extend that subsequence further.",
//           "After processing all elements, the length of the tails array is the length of the longest increasing subsequence."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Key invariant: at every point during the algorithm, tails[k] holds the smallest possible last-element value among all increasing subsequences of length k+1 discovered in the input processed so far. This invariant is maintained because replacing tails[lo] with a smaller x can only ever help future elements (a smaller tail value is strictly easier to extend than a larger one, since 'increasing' comparisons become more permissive), and it never hurts, since the LENGTH represented by that position doesn't change. Appending x when it exceeds every current tail correctly represents a genuinely new, longer subsequence. Because tails is always sorted (each binary search and replacement preserves sortedness, since x replaces the first value ≥ x), binary search correctly finds the right position in O(log n), and the final length of tails accurately reflects the longest increasing subsequence length, even though the contents of tails don't form an actual subsequence from the array themselves." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>
// #include <algorithm>

// using namespace std;

// int longestIncreasingSubsequence(const vector<int>& nums) {
//     if (nums.empty()) return 0;

//     int n = nums.size();
//     vector<int> dp(n, 1);
//     int maxLength = 1;

//     for (int i = 1; i < n; i++) {
//         for (int j = 0; j < i; j++) {
//             if (nums[i] > nums[j]) {
//                 dp[i] = max(dp[i], dp[j] + 1);
//             }
//         }
//         maxLength = max(maxLength, dp[i]);
//     }
//     return maxLength;
// }

// int main() {
//     vector<int> nums = {10, 9, 2, 5, 3, 7, 101, 18};
//     cout << "Length of LIS = " << longestIncreasingSubsequence(nums) << endl;
//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        5. COIN CHANGE
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Coin Change",
//       href: "/algorithms/dynamic_programming/coin-change",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Coin Change" },
//         { tag: "p", text: "Given a set of coin denominations and a target amount, the Coin Change problem asks for the minimum number of coins needed to make exactly that amount (assuming unlimited supply of each denomination), or reports that it's impossible. A related variant counts the total NUMBER of distinct ways to make the amount, rather than the minimum coin count." },
//         { tag: "p", text: "It's a deceptively simple-looking problem that's actually a trap for greedy algorithms: greedily always picking the largest coin that fits works for 'canonical' coin systems like US currency (1, 5, 10, 25), but fails for arbitrary denominations — e.g. with coins [1, 3, 4], greedily making 6 picks [4, 1, 1] (3 coins) when [3, 3] (2 coins) is actually optimal. This is exactly why DP, not greedy, is the generally correct approach." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Making change with an arbitrary (non-canonical) set of denominations where greedy isn't guaranteed correct",
//           "Any 'minimum number of items from an unlimited supply to reach an exact target sum' problem — this template generalises far beyond literal currency",
//           "The counting variant ('how many ways can you make this amount') is a classic unbounded knapsack-style problem, useful for combinatorics and probability calculations",
//           "Verifying whether a greedy currency system is safe to use (if DP and greedy always agree across all reachable amounts, the greedy approach is provably correct for that specific coin set)"
//         ]},
//         { tag: "note", variant: "warning", text: "Never assume greedy works for coin change unless you've proven the specific coin set is 'canonical' — silently wrong greedy answers are a classic source of subtle bugs in real payment/change-making systems." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n·amount)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n·amount)" },
//           { tag: "p", text: "The standard tabulation approach always fills the entire dp array of size amount+1, trying every coin denomination at every amount — there's no early-exit shortcut even if the optimal solution uses very few coins." },
//           { tag: "ul", items: [
//             "dp array has amount+1 entries",
//             "Each entry requires checking all n coin denominations: O(n) per entry",
//             "Total: O(n · amount), even for the most favourable coin set"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n·amount)" },
//           { tag: "p", text: "Every (amount, coin) combination is checked exactly once with O(1) work, regardless of which coins actually contribute to the optimal solution." },
//           { tag: "ul", items: [
//             "(amount+1) sub-amounts × n coins each = O(n · amount) total operations",
//             "Each operation is O(1): one addition, one comparison against the running minimum"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n·amount)" },
//           { tag: "p", text: "No coin denomination configuration increases the cost beyond the fixed nested iteration over amounts and coins." },
//           { tag: "ul", items: [
//             "Worst case identical to best/average: O(n · amount)",
//             "Like Knapsack, this is pseudo-polynomial — it depends on the numeric VALUE of 'amount', not just the count of coin denominations, so very large target amounts make this approach impractical despite the polynomial-looking formula"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(amount)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(amount)" },
//           { tag: "p", text: "A single 1D array of size amount+1 is sufficient, since each entry dp[a] only depends on smaller-amount entries dp[a - coin], all of which are already computed when processed in increasing order of amount." },
//           { tag: "ul", items: ["dp array: O(amount), regardless of how many coin denominations exist"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(amount)" },
//           { tag: "p", text: "Space usage is fixed by the target amount alone, since the 1D dp array's size doesn't depend on the number or values of the coin denominations." },
//           { tag: "ul", items: ["Same O(amount) bound regardless of coin set composition"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(amount)" },
//           { tag: "p", text: "No coin configuration increases space beyond the fixed-size 1D array — this is both the floor and ceiling for the algorithm's memory footprint." },
//           { tag: "ul", items: ["dp array: O(amount), identical across all cases"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "Minimum-number-of-coins variant:" },
//         { tag: "code", language: "text", text:
// `function coinChange(coins, amount):
//     dp ← array of size amount + 1, all set to infinity
//     dp[0] ← 0                          // base case: 0 coins needed to make amount 0

//     for a from 1 to amount:
//         for coin in coins:
//             if coin <= a:
//                 dp[a] ← min(dp[a], dp[a - coin] + 1)

//     return dp[amount] if dp[amount] != infinity else IMPOSSIBLE` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Define dp[a] as 'the minimum number of coins needed to make exactly amount a', with dp[0] = 0 as the base case.",
//           "Process amounts in increasing order from 1 up to the target, since dp[a] depends on dp[a - coin] for various coins, all of which are smaller amounts already computed.",
//           "For each amount a, try every available coin denomination: if the coin's value is ≤ a, check whether using that coin (and then optimally making the remaining a − coin) beats the current best known way to make a.",
//           "Take the minimum over all coin choices as dp[a].",
//           "After filling the entire array, dp[amount] holds the answer — or remains infinity if no combination of coins can make that exact amount."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Optimal substructure: any optimal solution for amount a must use SOME coin as its 'last' coin — call it coin c. Removing that one coin leaves an optimal solution for amount a − c (if it weren't optimal, a cheaper solution for a − c plus that same coin c would produce a cheaper solution for a, contradicting a's optimality). By trying every possible coin c as the 'last coin' and taking the minimum over dp[a − c] + 1, the algorithm is guaranteed to consider the true optimal choice among all coins, and by induction on a (processing amounts in increasing order), every dp[a − c] referenced is already correctly computed before it's needed." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>
// #include <algorithm>

// using namespace std;

// int coinChange(const vector<int>& coins, int amount) {
//     // Initialize DP array with a value strictly greater than the maximum possible coins
//     vector<int> dp(amount + 1, amount + 1);
//     dp[0] = 0;

//     for (int i = 1; i <= amount; i++) {
//         for (int coin : coins) {
//             if (i - coin >= 0) {
//                 dp[i] = min(dp[i], dp[i - coin] + 1);
//             }
//         }
//     }
//     return dp[amount] > amount ? -1 : dp[amount];
// }

// int main() {
//     vector<int> coins = {1, 2, 5};
//     int amount = 11;

//     cout << "Minimum coins required = " << coinChange(coins, amount) << endl;
//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        6. TRAVELLING SALESPERSON (DP / HELD-KARP)
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Travelling Salesperson",
//       href: "/algorithms/dynamic_programming/tsp",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Travelling Salesperson Problem (Held-Karp DP)" },
//         { tag: "p", text: "The Travelling Salesperson Problem (TSP) asks for the shortest possible route that visits every city in a given set exactly once and returns to the starting city. It is NP-hard — no known algorithm solves it in polynomial time, and it's widely believed none exists. The naive brute-force approach checks all (n-1)! possible permutations of cities, but the Held-Karp dynamic programming algorithm (1962) improves this dramatically to O(2ⁿ · n²) by exploiting overlapping subproblems in the permutation structure." },
//         { tag: "p", text: "The key insight is the state: instead of tracking which SPECIFIC sequence of cities has been visited (which would require remembering full permutations), Held-Karp tracks only the SET of visited cities (as a bitmask) and the current city — since the optimal cost to finish the tour only depends on those two facts, not on the exact order the visited cities were reached in." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Exact TSP solutions for small instances (Held-Karp is practical up to roughly n ≈ 20, after which the exponential 2ⁿ term becomes prohibitive even with the DP speedup)",
//           "Vehicle routing, circuit board drilling path optimisation, and other genuine 'visit every point once, minimise total travel' problems at small scale",
//           "Understanding bitmask DP — the state-as-bitmask technique used here generalises to many other 'subset of items processed so far' problems",
//           "For larger n, this exact approach is impractical — approximation algorithms (nearest neighbor, Christofides) or metaheuristics (genetic algorithms, simulated annealing) are used instead"
//         ]},
//         { tag: "note", variant: "warning", text: "O(2ⁿ · n²) is still exponential — Held-Karp is a major improvement over brute force's O(n!), but it does NOT make TSP tractable for large n. At n=25, 2²⁵ ≈ 33 million states already strains practical memory and time limits." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(2ⁿ · n²)",
//         best: [
//           { tag: "h2", text: "Best Case — O(2ⁿ · n²)" },
//           { tag: "p", text: "The algorithm always computes every (visited-set, current-city) state regardless of the specific distances between cities — there's no early-exit shortcut even for the most geometrically favourable city arrangement." },
//           { tag: "ul", items: [
//             "2ⁿ possible subsets of visited cities × n possible 'current city' values = O(2ⁿ · n) distinct states",
//             "Each state's computation tries up to n possible 'next city' transitions: O(n) per state",
//             "Total: O(2ⁿ · n) states × O(n) work each = O(2ⁿ · n²)"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(2ⁿ · n²)" },
//           { tag: "p", text: "Every reachable (subset, city) state is computed exactly once with the same fixed amount of work, regardless of the specific distance values between cities — only the FINAL chosen route changes with different distances, not the number of states examined." },
//           { tag: "ul", items: [
//             "O(2ⁿ · n) states, each requiring O(n) work to consider all possible transitions: O(2ⁿ · n²) total",
//             "No input distribution changes this fixed state-space structure"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(2ⁿ · n²)" },
//           { tag: "p", text: "No city configuration increases the cost beyond the fixed bitmask-state-space exploration — this is simultaneously the best, average, and worst case, since every possible subset must be considered to guarantee the global optimum." },
//           { tag: "ul", items: [
//             "O(2ⁿ · n²) holds unconditionally",
//             "This is a dramatic improvement over brute force's O(n!) (for n=20: 2²⁰·400 ≈ 4×10⁸ vs. 20! ≈ 2.4×10¹⁸), but remains exponential and therefore intractable for large n"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(2ⁿ · n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(2ⁿ · n)" },
//           { tag: "p", text: "The DP table must store the optimal cost for every (visited-subset, current-city) combination, requiring space proportional to the full state space regardless of input." },
//           { tag: "ul", items: ["DP table: 2ⁿ subsets × n possible current cities = O(2ⁿ · n) entries"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(2ⁿ · n)" },
//           { tag: "p", text: "Table size is fixed by the number of cities n alone, since every possible subset must have storage allocated regardless of the actual distances between cities." },
//           { tag: "ul", items: ["Same O(2ⁿ · n) bound regardless of distance value distribution"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(2ⁿ · n)" },
//           { tag: "p", text: "No city configuration changes the table size — it's fixed entirely by n, identical across all cases." },
//           { tag: "ul", items: [
//             "O(2ⁿ · n) for the full state table",
//             "This exponential space requirement is the practical memory bottleneck that limits Held-Karp to roughly n ≤ 20 on typical hardware, even before considering the exponential time cost"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "Held-Karp bitmask DP, starting and ending at city 0:" },
//         { tag: "code", language: "text", text:
// `function tsp(dist, n):
//     // dp[mask][i] = min cost to visit exactly the cities in 'mask',
//     //               ending at city i, having started at city 0
//     dp ← table of size 2^n x n, all infinity
//     dp[1][0] ← 0                        // only city 0 visited, starting point

//     for mask from 1 to (2^n − 1):
//         for i from 0 to n − 1:
//             if dp[mask][i] == infinity: continue
//             if not (mask has bit i set): continue

//             for j from 0 to n − 1:
//                 if mask has bit j set: continue       // already visited

//                 newMask ← mask | (1 << j)
//                 newCost ← dp[mask][i] + dist[i][j]
//                 if newCost < dp[newMask][j]:
//                     dp[newMask][j] ← newCost

//     // Close the tour: return to city 0 from every possible final city
//     fullMask ← (1 << n) − 1
//     answer ← infinity
//     for i from 1 to n − 1:
//         answer ← min(answer, dp[fullMask][i] + dist[i][0])

//     return answer` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Define dp[mask][i] as 'the minimum cost to visit exactly the set of cities represented by the bitmask mask, ending at city i', always starting from city 0.",
//           "Base case: dp[{0}][0] = 0 — having visited only the starting city, at cost zero.",
//           "For every reachable state (mask, i), try extending the tour to every unvisited city j: compute the new mask (mask with bit j added) and the new cost (current cost plus the distance from i to j).",
//           "Update dp[newMask][j] if this route is better than any previously found way to reach that exact state.",
//           "After processing all states, the answer requires closing the loop: for every possible final city i (having visited ALL cities), add the cost of returning from i back to the start, and take the minimum over all choices of final city."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "The crucial insight enabling this DP is that the future of the tour (which unvisited cities remain to be visited, and how to visit them optimally) depends ONLY on the current city and the SET of cities already visited — not on the specific order in which they were visited. This means many different permutations that happen to visit the same set of cities and end at the same city are correctly collapsed into a single state, which is exactly what eliminates the (n-1)! redundancy of brute force. By induction on the number of bits set in mask, dp[mask][i] is correctly computed as the minimum over all valid ways to reach that exact (visited-set, current-city) combination, since every transition considered builds directly on already-correctly-computed smaller states (states with fewer visited cities)." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>
// #include <climits>
// #include <algorithm>

// using namespace std;

// const int INF = 1e9;

// int tsp(int mask, int pos, int n, const vector<vector<int>>& dist, vector<vector<int>>& dp) {
//     // If all cities have been visited, return cost to go back to the starting city (0)
//     if (mask == (1 << n) - 1) {
//         return dist[pos][0];
//     }

//     if (dp[mask][pos] != -1) {
//         return dp[mask][pos];
//     }

//     int ans = INF;
//     for (int city = 0; city < n; city++) {
//         // If the city has not been visited yet
//         if ((mask & (1 << city)) == 0) {
//             int newAns = dist[pos][city] + tsp(mask | (1 << city), city, n, dist, dp);
//             ans = min(ans, newAns);
//         }
//     }
//     return dp[mask][pos] = ans;
// }

// int main() {
//     int n = 4;
//     // Distance matrix where dist[i][j] is distance from city i to j
//     vector<vector<int>> dist = {
//         {0, 10, 15, 20},
//         {10, 0, 35, 25},
//         {15, 35, 0, 30},
//         {20, 25, 30, 0}
//     };

//     // dp array initialized to -1
//     // Size is 2^n for rows (bitmask) and n for columns
//     vector<vector<int>> dp(1 << n, vector<int>(n, -1));

//     // Start at city 0, mask is 1 (city 0 visited)
//     cout << "Minimum cost of Travelling Salesperson = " << tsp(1, 0, n, dist, dp) << endl;
//     return 0;
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        7. FIBONACCI SEQUENCE
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Fibonacci Sequence",
//       href: "/algorithms/dynamic_programming/fibonacci",
//       type: "Easy",

//       about: [
//         { tag: "h1", text: "Fibonacci Sequence" },
//         { tag: "p", text: "The Fibonacci sequence (0, 1, 1, 2, 3, 5, 8, 13, ...) is defined by the recurrence F(n) = F(n-1) + F(n-2), with base cases F(0) = 0 and F(1) = 1. It is the textbook first example used to teach dynamic programming, because the difference between the naive recursive solution and the DP solution is so dramatic and so easy to visualise: O(2ⁿ) exponential time collapses to O(n) linear time with a one-line change (caching results)." },
//         { tag: "p", text: "The naive recursive implementation recomputes the same F(k) values an enormous number of times — F(5) calls F(4) and F(3), but F(4) itself calls F(3) and F(2), redundantly recomputing F(3) from scratch. This single overlapping-subproblem pattern, multiplied across every level of recursion, is exactly what every other DP problem in this section is also designed to eliminate, just in a more elaborate form." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "As the canonical teaching example for introducing memoization vs. tabulation",
//           "Any literal need to compute Fibonacci numbers (rare in production code, but appears in some combinatorial counting problems, golden-ratio-related geometry, and certain recursive data structure analyses like Fibonacci heaps)",
//           "As a sanity-check template before tackling more complex 1D DP problems — if you can derive Fibonacci's DP form fluently, the same 'identify state, find recurrence, identify base case' process generalises directly",
//           "Matrix exponentiation variant: when F(n) for very large n (e.g. n = 10^9) is needed, an O(log n) matrix-power approach exists, beyond simple linear DP"
//         ]},
//         { tag: "note", variant: "tip", text: "Fibonacci is the simplest possible illustration of why DP works: identical (sub)problems, multiplied exponentially by naive recursion's branching, are computed exactly once and reused — the entire DP discipline, in miniature." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n)" },
//           { tag: "p", text: "The iterative/tabulation DP solution always computes every F(k) value from 2 up to n exactly once — there's no early-exit shortcut, since each value depends on the two immediately preceding it." },
//           { tag: "ul", items: [
//             "n − 1 iterations (from F(2) to F(n)), each doing O(1) work (one addition)",
//             "Total: O(n), even for the smallest meaningful n"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n)" },
//           { tag: "p", text: "Every value of k from 2 to n requires exactly one addition to compute F(k) from F(k-1) and F(k-2) — there's no value-dependent branching that changes this fixed iteration count." },
//           { tag: "ul", items: [
//             "n iterations, O(1) work each = O(n)",
//             "Compare this to naive recursion's average case, which remains O(2ⁿ) without memoization, or O(n) WITH memoization (since memoization makes the recursive version asymptotically identical to the iterative one)"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n)" },
//           { tag: "p", text: "No value of n changes the structure of the computation — it's always exactly n − 1 additions for the DP solution, matching best and average case exactly." },
//           { tag: "ul", items: [
//             "Worst case identical to best/average: O(n)",
//             "Without memoization, naive recursive Fibonacci's worst case (and ONLY case, since it has no input-dependent branching either) is O(2ⁿ) — specifically, the number of calls follows the Fibonacci sequence itself, giving O(φⁿ) where φ ≈ 1.618 is the golden ratio, often loosely stated as O(2ⁿ)",
//             "The contrast between O(2ⁿ) naive recursion and O(n) DP for the exact same problem is the single clearest illustration of DP's value in all of computer science"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(1)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(1)" },
//           { tag: "p", text: "Since F(n) only ever depends on the two immediately preceding values, only two scalar variables need to be tracked at any point — no full array is required." },
//           { tag: "ul", items: ["prev, curr (the two most recent Fibonacci values): O(1)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(1)" },
//           { tag: "p", text: "Memory usage never grows with n — it's always exactly two scalar variables, regardless of how large the target index is." },
//           { tag: "ul", items: ["No auxiliary array needed for this particular recurrence, unlike most other DP problems which require O(n) or O(n²) tables"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(1)" },
//           { tag: "p", text: "No value of n increases memory usage beyond the two rolling variables — this is one of the rare DP problems where the full O(n) memoization table can be entirely eliminated via the rolling-variable optimisation." },
//           { tag: "ul", items: [
//             "O(1) for the iterative rolling-variable approach",
//             "Naive unmemoized recursion uses O(n) auxiliary space for its call stack (despite the O(2ⁿ) TIME being the bigger problem) — memoized (top-down) DP uses O(n) space for both the cache and the recursion stack"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "p", text: "Bottom-up tabulation with O(1) space (rolling variables):" },
//         { tag: "code", language: "text", text:
// `function fibonacci(n):
//     if n <= 1:
//         return n

//     prev ← 0       // F(0)
//     curr ← 1       // F(1)

//     for i from 2 to n:
//         next ← prev + curr
//         prev ← curr
//         curr ← next

//     return curr` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Handle the base cases directly: F(0) = 0 and F(1) = 1.",
//           "Initialise two rolling variables, prev and curr, representing F(0) and F(1) respectively.",
//           "For each index from 2 up to n, compute the next Fibonacci value as the sum of the two preceding ones — this is the core recurrence, applied iteratively rather than recursively.",
//           "Slide the window forward: what was 'curr' becomes the new 'prev', and the newly computed value becomes the new 'curr'.",
//           "After the loop completes, 'curr' holds F(n)."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "This is a direct, mechanical implementation of the mathematical recurrence F(n) = F(n-1) + F(n-2) with base cases F(0)=0, F(1)=1. By induction on i: after the loop body executes for index i, curr correctly holds F(i) and prev correctly holds F(i-1), assuming this was true before that iteration (which holds trivially at i=2, since prev=F(0) and curr=F(1) at initialisation). Since this invariant is preserved through every iteration, when the loop terminates at i=n, curr correctly equals F(n). The O(1) space variant works precisely because the recurrence has 'memory' of only 2, meaning no value of n ever needs to look further back than its two immediate predecessors." }
//       ],
//       codes:{
//         "c++":`#include <iostream>
// #include <vector>

// using namespace std;

// // Calculates the nth Fibonacci number
// long long fibonacci(int n) {
//     if (n <= 1) return n;

//     vector<long long> dp(n + 1);
//     dp[0] = 0;
//     dp[1] = 1;

//     for (int i = 2; i <= n; i++) {
//         dp[i] = dp[i - 1] + dp[i - 2];
//     }
//     return dp[n];
// }

// int main() {
//     int n = 10;
//     cout << "Fibonacci of " << n << " is: " << fibonacci(n) << endl;
//     return 0;
// }
// `
//       }
//     }

//   ],
//   desc: "Memoization, tabulation, optimal substructure",
//   complexity: "O(n²)",
//   featured: false
// };

// const HEAP_SECTION = {
//   name: "Heap",
//   href: "/algorithms/heap",
//     icon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
//         <circle cx="32" cy="12" r="5"/>
//         <circle cx="18" cy="32" r="5"/>
//         <circle cx="46" cy="32" r="5"/>
//         <circle cx="10" cy="52" r="5"/>
//         <circle cx="26" cy="52" r="5"/>
//         <line x1="32" y1="17" x2="18" y2="27"/>
//         <line x1="32" y1="17" x2="46" y2="27"/>
//         <line x1="18" y1="37" x2="10" y2="47"/>
//         <line x1="18" y1="37" x2="26" y2="47"/>
//       </svg>
//     ),
//     hoverIcon: (
//       <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
//         <circle cx="32" cy="12" r="6" fill="#34D399" stroke="#34D399"/>
//         <circle cx="18" cy="32" r="5"/>
//         <circle cx="46" cy="32" r="5"/>
//         <circle cx="10" cy="52" r="5"/>
//         <circle cx="26" cy="52" r="5"/>
//         <line x1="32" y1="18" x2="18" y2="27"/>
//         <line x1="32" y1="18" x2="46" y2="27"/>
//         <line x1="18" y1="37" x2="10" y2="47"/>
//         <line x1="18" y1="37" x2="26" y2="47"/>
//         <path d="M 38 12 L 44 8 L 44 16 Z" fill="#34D399" stroke="none"/>
//       </svg>
//     ),

//   about: [
//     { tag: "h1", text: "Heap" },
//     { tag: "p", text: "A heap is a complete binary tree (array-backed, no pointers needed) satisfying the heap property: in a min-heap, every parent is ≤ its children; in a max-heap, every parent is ≥ its children. This guarantees the minimum (or maximum) element is always at the root, retrievable in O(1), while insertion and removal of that root both cost O(log n) — a heap deliberately gives up full sorted order to get a much cheaper 'give me the extreme element' operation." },
//     { tag: "p", text: "The recurring theme across every algorithm in this section is the same trade-off: a heap is the right structure exactly when you repeatedly need 'the current best/smallest/largest of what remains' and don't care about the relative order of everything else. If you needed FULL sorted order, you'd just sort (or use a self-balancing BST); a heap's entire value proposition is being cheaper than full ordering when you only ever need the extreme element, repeatedly." },
//     { tag: "h2", text: "The 'k' trick: bounding heap size" },
//     { tag: "p", text: "A huge fraction of heap-based algorithms achieve their efficiency by deliberately keeping the heap small — size k, not size n — even when processing n total elements. Maintaining a heap of size k and discarding anything that can't possibly improve the current top-k answer turns an O(n log n) full-sort-based approach into O(n log k), which is a meaningful improvement whenever k is much smaller than n (e.g. finding the top 10 of a billion records)." },
//     { tag: "table",
//       headers: ["Algorithm", "Heap Type & Size", "Core Technique"],
//       rows: [
//         ["Kth Largest Element", "Min-heap, size k", "Keep only the k largest seen so far; the heap's root is the answer"],
//         ["Merge K Sorted Lists", "Min-heap, size ≤ k", "Always extract the globally smallest 'current front' across k lists"],
//         ["Top K Frequent Elements", "Min-heap, size k (by frequency)", "Same size-k-heap trick, keyed by frequency instead of value"],
//         ["Find Median from Data Stream", "Two heaps (max-heap + min-heap), combined size n", "Split the stream into a 'lower half' max-heap and 'upper half' min-heap, kept balanced"]
//       ]
//     },
//     { tag: "note", variant: "tip", text: "Watch for the counter-intuitive heap-type choice in 'Kth Largest': a MIN-heap of size k (not a max-heap) is what's used — because the smallest element of the top-k group is exactly the one you want to compare new candidates against, and the smallest element of a min-heap is its O(1)-accessible root." }
//   ],

//   items: [

//     /* ════════════════════════════════════════════════════════════════════
//        1. KTH LARGEST ELEMENT
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Kth Largest Element",
//       href: "/algorithms/heap/kth-largest",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Kth Largest Element" },
//         { tag: "p", text: "Given an unsorted array, find the Kth largest element (the Kth largest VALUE, counting duplicates separately, not the Kth distinct value). Full sorting solves this in O(n log n), but a min-heap of size k achieves O(n log k) — a meaningful improvement whenever k is small relative to n, which is the common case (e.g. 'find the 5th highest score among a million submissions')." },
//         { tag: "p", text: "The technique maintains a min-heap containing exactly the k largest elements seen so far. For every new element, if the heap has fewer than k elements, it's added unconditionally; once the heap has k elements, a new element is only added (after evicting the current minimum) if it's larger than the heap's current minimum — meaning it genuinely belongs among the top k. After processing the entire array, the heap's root (its minimum) is exactly the Kth largest element overall." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Finding the Kth largest (or smallest, with a max-heap instead) element when k is much smaller than n, avoiding the cost of fully sorting the entire dataset",
//           "Streaming data scenarios where you need to maintain 'the current Kth largest seen so far' as new elements continuously arrive, without re-sorting from scratch on every new arrival",
//           "As the direct foundation for Top K Frequent Elements (below), which applies the exact same size-k-min-heap technique, just keyed by frequency instead of raw value",
//           "QuickSelect (a Quick-Sort-partition-based alternative) achieves O(n) average case for this same problem, but with O(n²) worst case and no support for STREAMING input — the heap approach trades some average-case speed for streaming capability and a reliable O(n log k) bound"
//         ]},
//         { tag: "note", variant: "tip", text: "Don't use a max-heap of the full array for this problem — that would require O(n) heap construction plus k extractions at O(log n) each, giving O(n + k log n), which is WORSE than the size-k min-heap's O(n log k) whenever k is small relative to n." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n log k)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n log k)" },
//           { tag: "p", text: "Every element must be at least compared against the heap's current minimum (an O(1) check) to determine whether it belongs in the top k — there's no shortcut even for the most favourable arrangement, since this comparison is required to maintain correctness." },
//           { tag: "ul", items: [
//             "n elements, each requiring at minimum an O(1) comparison against the heap's root",
//             "If most elements are smaller than the current minimum (best case for SKIPPING heap modification), most of those n comparisons are O(1) and only the first k insertions cost O(log k) each: O(k log k) + O(n) = O(n) for very favourable inputs, but classified O(n log k) as the general structural bound"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n log k)" },
//           { tag: "p", text: "For typical input, a meaningful fraction of the n elements will be large enough to warrant a heap insertion (push + pop of the current min), each costing O(log k)." },
//           { tag: "ul", items: [
//             "n elements, each requiring an O(1) comparison plus, for elements that qualify, an O(log k) heap insertion-and-eviction: O(n log k) total",
//             "Since k ≤ n always, this is never worse than O(n log n), and is strictly better whenever k is meaningfully smaller than n"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n log k)" },
//           { tag: "p", text: "If the array is sorted in strictly increasing order, every single element from some point onward triggers a heap insertion (since each new element is larger than everything seen before it), maximising the number of O(log k) operations." },
//           { tag: "ul", items: [
//             "Worst case: up to n elements each requiring an O(log k) heap operation: O(n log k)",
//             "This remains the standard bound regardless of input arrangement — no input configuration pushes the cost beyond O(n log k)"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(k)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(k)" },
//           { tag: "p", text: "The heap is deliberately bounded to hold at most k elements at any time, regardless of how many total elements (n) have been processed — this is the entire structural point of the technique." },
//           { tag: "ul", items: ["Heap: at most k elements — O(k)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(k)" },
//           { tag: "p", text: "Space usage is fixed by k alone, since the algorithm actively evicts the minimum whenever the heap would exceed size k — it never grows proportionally to n." },
//           { tag: "ul", items: ["Heap: O(k), regardless of n or value distribution — a dramatic space saving over full-sort approaches when k ≪ n"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(k)" },
//           { tag: "p", text: "No input configuration grows the heap beyond k elements — this is an enforced structural invariant, not just a typical-case behaviour." },
//           { tag: "ul", items: ["Heap: strictly bounded at O(k), identical across all cases — this is the key advantage over full-array sorting's O(n) space requirement"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function findKthLargest(nums, k):
//     minHeap ← empty min-heap

//     for num in nums:
//         push(minHeap, num)
//         if size(minHeap) > k:
//             pop(minHeap)            // evict the current smallest of the top-k candidates

//     return peek(minHeap)            // the heap's minimum is the Kth largest overall` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Maintain a min-heap that is never allowed to exceed size k.",
//           "For each new element, push it onto the heap unconditionally — this might temporarily grow the heap to size k+1.",
//           "If the heap now exceeds size k, pop the minimum — this correctly evicts whichever element among the current top-(k+1) candidates is the smallest, since a min-heap's pop always removes the minimum.",
//           "After processing all n elements, exactly k elements remain in the heap: the k largest elements from the entire array, and the heap's root (its minimum, accessible in O(1)) is, among those k, the smallest — which is exactly the Kth largest element of the original array."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Invariant: after processing any prefix of the input, the heap contains exactly the k largest elements seen SO FAR (or fewer than k, if fewer than k elements have been processed yet). This holds by induction: each new element is unconditionally added, and if this would exceed k elements, the single smallest among the current k+1 candidates is removed — correctly restoring the invariant, since removing the smallest of (top-k-so-far plus the new element) is exactly how to determine the new top-k set. By induction, after all n elements are processed, the heap holds exactly the true k largest elements of the entire array, and since it's a min-heap, its root is the smallest of those k — which, by definition, is the Kth largest element overall." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <queue>

// using namespace std;

// int findKthLargest(const vector<int>& nums, int k) {
//     priority_queue<int, vector<int>, greater<int>> minHeap;

//     for (int num : nums) {
//         minHeap.push(num);
//         if ((int)minHeap.size() > k) {
//             minHeap.pop();
//         }
//     }

//     return minHeap.top();
// }

// int main() {
//     vector<int> nums = {3, 2, 1, 5, 6, 4};
//     int k = 2;

//     cout << "The " << k << "th largest element is: " << findKthLargest(nums, k) << endl;
//     return 0;
// }
// `,
//         "python": `import heapq

// def find_kth_largest(nums, k):
//     min_heap = []

//     for num in nums:
//         heapq.heappush(min_heap, num)
//         if len(min_heap) > k:
//             heapq.heappop(min_heap)

//     return min_heap[0]

// if __name__ == "__main__":
//     nums = [3, 2, 1, 5, 6, 4]
//     k = 2
//     print(f"The {k}th largest element is: {find_kth_largest(nums, k)}")
// `,
//         "java": `import java.util.PriorityQueue;

// public class Main {
//     public static int findKthLargest(int[] nums, int k) {
//         PriorityQueue<Integer> minHeap = new PriorityQueue<>();

//         for (int num : nums) {
//             minHeap.offer(num);
//             if (minHeap.size() > k) {
//                 minHeap.poll();
//             }
//         }

//         return minHeap.peek();
//     }

//     public static void main(String[] args) {
//         int[] nums = {3, 2, 1, 5, 6, 4};
//         int k = 2;
//         System.out.println("The " + k + "th largest element is: " + findKthLargest(nums, k));
//     }
// }
// `,
//         "js": `function findKthLargest(nums, k) {
//     // Simple array-backed min-heap via sorted insertion is O(n) per op;
//     // for clarity we use a binary-heap-backed min-heap here.
//     const minHeap = [];

//     const siftUp = (heap) => {
//         let i = heap.length - 1;
//         while (i > 0) {
//             const parent = (i - 1) >> 1;
//             if (heap[parent] <= heap[i]) break;
//             [heap[parent], heap[i]] = [heap[i], heap[parent]];
//             i = parent;
//         }
//     };

//     const siftDown = (heap) => {
//         let i = 0;
//         const n = heap.length;
//         while (true) {
//             let smallest = i;
//             const left = 2 * i + 1;
//             const right = 2 * i + 2;
//             if (left < n && heap[left] < heap[smallest]) smallest = left;
//             if (right < n && heap[right] < heap[smallest]) smallest = right;
//             if (smallest === i) break;
//             [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
//             i = smallest;
//         }
//     };

//     const push = (heap, val) => {
//         heap.push(val);
//         siftUp(heap);
//     };

//     const pop = (heap) => {
//         const top = heap[0];
//         const last = heap.pop();
//         if (heap.length > 0) {
//             heap[0] = last;
//             siftDown(heap);
//         }
//         return top;
//     };

//     for (const num of nums) {
//         push(minHeap, num);
//         if (minHeap.length > k) {
//             pop(minHeap);
//         }
//     }

//     return minHeap[0];
// }

// const nums = [3, 2, 1, 5, 6, 4];
// const k = 2;
// console.log(\`The \${k}th largest element is: \${findKthLargest(nums, k)}\`);
// `,
//         "c": `#include <stdio.h>

// // Simple min-heap of fixed capacity k, implemented as an array.
// void siftUp(int* heap, int i) {
//     while (i > 0) {
//         int parent = (i - 1) / 2;
//         if (heap[parent] <= heap[i]) break;
//         int temp = heap[parent]; heap[parent] = heap[i]; heap[i] = temp;
//         i = parent;
//     }
// }

// void siftDown(int* heap, int size) {
//     int i = 0;
//     while (1) {
//         int smallest = i;
//         int left = 2 * i + 1;
//         int right = 2 * i + 2;
//         if (left < size && heap[left] < heap[smallest]) smallest = left;
//         if (right < size && heap[right] < heap[smallest]) smallest = right;
//         if (smallest == i) break;
//         int temp = heap[i]; heap[i] = heap[smallest]; heap[smallest] = temp;
//         i = smallest;
//     }
// }

// int findKthLargest(int* nums, int numsSize, int k) {
//     int* heap = (int*)malloc(k * sizeof(int));
//     int heapSize = 0;

//     for (int i = 0; i < numsSize; i++) {
//         if (heapSize < k) {
//             heap[heapSize++] = nums[i];
//             siftUp(heap, heapSize - 1);
//         } else if (nums[i] > heap[0]) {
//             heap[0] = nums[i];
//             siftDown(heap, heapSize);
//         }
//     }

//     int result = heap[0];
//     free(heap);
//     return result;
// }

// int main() {
//     int nums[] = {3, 2, 1, 5, 6, 4};
//     int numsSize = 6;
//     int k = 2;
//     printf("The %dth largest element is: %d\\n", k, findKthLargest(nums, numsSize, k));
//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class Program {
//     static int FindKthLargest(int[] nums, int k) {
//         var minHeap = new SortedSet<(int val, int id)>();
//         int id = 0;

//         foreach (int num in nums) {
//             minHeap.Add((num, id++));
//             if (minHeap.Count > k) {
//                 var smallest = minHeap.Min;
//                 minHeap.Remove(smallest);
//             }
//         }

//         return minHeap.Min.val;
//     }

//     static void Main() {
//         int[] nums = {3, 2, 1, 5, 6, 4};
//         int k = 2;
//         Console.WriteLine($"The {k}th largest element is: {FindKthLargest(nums, k)}");
//     }
// }
// `,
//         "swift": `func findKthLargest(_ nums: [Int], _ k: Int) -> Int {
//     var minHeap: [Int] = []

//     func siftUp() {
//         var i = minHeap.count - 1
//         while i > 0 {
//             let parent = (i - 1) / 2
//             if minHeap[parent] <= minHeap[i] { break }
//             minHeap.swapAt(parent, i)
//             i = parent
//         }
//     }

//     func siftDown() {
//         var i = 0
//         let n = minHeap.count
//         while true {
//             var smallest = i
//             let left = 2 * i + 1
//             let right = 2 * i + 2
//             if left < n && minHeap[left] < minHeap[smallest] { smallest = left }
//             if right < n && minHeap[right] < minHeap[smallest] { smallest = right }
//             if smallest == i { break }
//             minHeap.swapAt(i, smallest)
//             i = smallest
//         }
//     }

//     for num in nums {
//         minHeap.append(num)
//         siftUp()
//         if minHeap.count > k {
//             minHeap[0] = minHeap.removeLast()
//             siftDown()
//         }
//     }

//     return minHeap[0]
// }

// let nums = [3, 2, 1, 5, 6, 4]
// let k = 2
// print("The \\(k)th largest element is: \\(findKthLargest(nums, k))")
// `,
//         "kotlin": `import java.util.PriorityQueue

// fun findKthLargest(nums: IntArray, k: Int): Int {
//     val minHeap = PriorityQueue<Int>()

//     for (num in nums) {
//         minHeap.offer(num)
//         if (minHeap.size > k) {
//             minHeap.poll()
//         }
//     }

//     return minHeap.peek()
// }

// fun main() {
//     val nums = intArrayOf(3, 2, 1, 5, 6, 4)
//     val k = 2
//     println("The \${k}th largest element is: \${findKthLargest(nums, k)}")
// }
// `,
//         "scala": `import scala.collection.mutable

// object Main extends App {
//     def findKthLargest(nums: Array[Int], k: Int): Int = {
//         val minHeap = mutable.PriorityQueue[Int]()(Ordering.Int.reverse)

//         for (num <- nums) {
//             minHeap.enqueue(num)
//             if (minHeap.size > k) {
//                 minHeap.dequeue()
//             }
//         }

//         minHeap.head
//     }

//     val nums = Array(3, 2, 1, 5, 6, 4)
//     val k = 2
//     println(s"The \${k}th largest element is: \${findKthLargest(nums, k)}")
// }
// `,
//         "go": `package main

// import (
//     "container/heap"
//     "fmt"
// )

// type IntMinHeap []int

// func (h IntMinHeap) Len() int            { return len(h) }
// func (h IntMinHeap) Less(i, j int) bool  { return h[i] < h[j] }
// func (h IntMinHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *IntMinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
// func (h *IntMinHeap) Pop() interface{} {
//     old := *h
//     n := len(old)
//     x := old[n-1]
//     *h = old[:n-1]
//     return x
// }

// func findKthLargest(nums []int, k int) int {
//     minHeap := &IntMinHeap{}
//     heap.Init(minHeap)

//     for _, num := range nums {
//         heap.Push(minHeap, num)
//         if minHeap.Len() > k {
//             heap.Pop(minHeap)
//         }
//     }

//     return (*minHeap)[0]
// }

// func main() {
//     nums := []int{3, 2, 1, 5, 6, 4}
//     k := 2
//     fmt.Printf("The %dth largest element is: %d\\n", k, findKthLargest(nums, k))
// }
// `,
//         "rust": `use std::collections::BinaryHeap;
// use std::cmp::Reverse;

// fn find_kth_largest(nums: &[i32], k: usize) -> i32 {
//     let mut min_heap: BinaryHeap<Reverse<i32>> = BinaryHeap::new();

//     for &num in nums {
//         min_heap.push(Reverse(num));
//         if min_heap.len() > k {
//             min_heap.pop();
//         }
//     }

//     min_heap.peek().unwrap().0
// }

// fn main() {
//     let nums = vec![3, 2, 1, 5, 6, 4];
//     let k = 2;
//     println!("The {}th largest element is: {}", k, find_kth_largest(&nums, k));
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        2. MERGE K SORTED LISTS
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Merge K Sorted Lists",
//       href: "/algorithms/heap/merge-k",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Merge K Sorted Lists" },
//         { tag: "p", text: "Given k already-sorted linked lists, this problem asks for a single sorted list containing all their elements combined. Merging them pairwise (merge list 1 with list 2, then merge that result with list 3, and so on) costs O(N·k) in the worst case, where N is the total number of elements across all lists — a min-heap-based approach achieves the better O(N log k)." },
//         { tag: "p", text: "The technique generalises the standard two-list merge (from Merge Sort) by replacing the 'compare two front elements' step with 'find the minimum among up to k front elements', using a min-heap to make that minimum-finding step O(log k) instead of O(k). The heap holds at most one node from each of the k lists at any time — specifically, the current 'front' (unprocessed) node of each list that still has remaining elements." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Merging more than 2 sorted sequences simultaneously, where a sequence of pairwise merges would be asymptotically slower",
//           "External sorting (merging many sorted runs/chunks too large to fit in memory simultaneously) — database systems and large-scale sort-merge operations use exactly this k-way merge technique",
//           "Distributed systems combining sorted result streams from multiple shards/nodes into one globally sorted output",
//           "As a direct generalisation of the two-pointer merge technique (see Linked Lists: Merge Sorted Lists) to k inputs instead of 2, using a heap to handle the 'which of k candidates is smallest' decision efficiently"
//         ]},
//         { tag: "note", variant: "tip", text: "Pairwise merging (merge lists one at a time into a running result) is also O(N log k) if done via DIVIDE AND CONQUER (merge pairs of lists, then merge pairs of results, halving the list count each round) — the heap-based approach achieves the same asymptotic bound with a different, often simpler-to-implement, mechanism." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(N log k)",
//         best: [
//           { tag: "h2", text: "Best Case — O(N log k)" },
//           { tag: "p", text: "Every one of the N total nodes across all k lists must be extracted from the heap and appended to the result exactly once — there's no shortcut even for the most favourably arranged input values." },
//           { tag: "ul", items: [
//             "Initial heap construction: insert the first node of each of the k lists — O(k log k)",
//             "N total extract-min operations (one per node across all lists), each O(log k) since the heap never holds more than k elements at once: O(N log k)",
//             "Combined: O(k log k) + O(N log k) = O(N log k), since N ≥ k always"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(N log k)" },
//           { tag: "p", text: "Every node extraction and the corresponding insertion of that list's next node both cost O(log k), regardless of how the N total elements happen to be distributed across the k lists or what their actual values are." },
//           { tag: "ul", items: [
//             "N extract-min + N insert operations (one pair per node processed), each O(log k): O(N log k) total",
//             "No input distribution changes this fixed per-node cost"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(N log k)" },
//           { tag: "p", text: "No arrangement of values across the k lists increases the cost beyond the fixed per-node O(log k) heap operations — this is simultaneously the best, average, and worst case, since the heap always maintains exactly the same structural size bound (at most k elements) throughout." },
//           { tag: "ul", items: [
//             "Worst case matches best/average exactly: O(N log k)",
//             "This is a genuine improvement over naive pairwise merging's O(N·k) worst case, achieved entirely by using the heap to find the minimum-of-k-candidates in O(log k) instead of O(k)"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(k)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(k)" },
//           { tag: "p", text: "The heap never holds more than one node per input list at any given time, so its size is structurally bounded by k regardless of how many total elements (N) exist across all lists." },
//           { tag: "ul", items: ["Heap: at most k entries (one current-front node per non-exhausted list) — O(k)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(k)" },
//           { tag: "p", text: "Space usage is fixed by k alone, since the heap's size invariant (at most one entry per list) doesn't depend on N, the total element count, or how elements are distributed across the lists." },
//           { tag: "ul", items: ["Heap: O(k), regardless of N — the merged output itself is typically built by relinking existing nodes (as in Merge Sorted Lists), not allocating new ones, so it doesn't add to auxiliary space"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(k)" },
//           { tag: "p", text: "No distribution of values or list lengths grows the heap beyond k elements — this is an enforced structural invariant of the algorithm, just like the Kth Largest Element technique above." },
//           { tag: "ul", items: ["Heap: strictly bounded at O(k), identical across all cases"] }
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function mergeKLists(lists):
//     minHeap ← empty min-heap          // ordered by node value

//     for list in lists:
//         if list is not null:
//             push(minHeap, list)        // push the head node of each non-empty list

//     dummy ← new Node(0)
//     tail ← dummy

//     while minHeap is not empty:
//         smallestNode ← pop(minHeap)    // node with the globally smallest current value
//         tail.next ← smallestNode
//         tail ← tail.next

//         if smallestNode.next is not null:
//             push(minHeap, smallestNode.next)   // advance that list, push its new front

//     return dummy.next` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Initialise the heap with the head node of every non-empty input list — at most k entries, one per list.",
//           "Repeatedly extract the minimum-value node from the heap (this is, among all k lists' current fronts, the globally smallest available value) and append it to the merged result.",
//           "If the just-extracted node has a next node in its original list, push THAT node onto the heap — this correctly 'advances' that particular list's contribution by one step.",
//           "Repeat until the heap is empty, meaning every node from every list has been extracted and appended to the result exactly once.",
//           "Using a dummy sentinel head (exactly as in the two-list merge technique) avoids any special-casing for the very first node of the merged result."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Invariant: at every point, the heap contains exactly the current 'front' node of every list that still has unprocessed elements, and everything already appended to the result is correctly sorted and represents exactly the globally smallest (length-so-far) elements available across all k lists' remaining portions. Each iteration correctly extends this invariant: the heap's minimum is, by construction, the smallest among all k lists' current fronts — and since every individual list is itself sorted, no list's LATER elements could possibly be smaller than its own current front, so the heap's global minimum really is the smallest element available from the combination of everything not yet merged. By induction over the N total extraction steps, the final result is fully and correctly sorted." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <queue>

// using namespace std;

// struct ListNode {
//     int val;
//     ListNode* next;
//     ListNode(int x) : val(x), next(nullptr) {}
// };

// struct Compare {
//     bool operator()(ListNode* a, ListNode* b) {
//         return a->val > b->val;
//     }
// };

// ListNode* mergeKLists(vector<ListNode*>& lists) {
//     priority_queue<ListNode*, vector<ListNode*>, Compare> minHeap;

//     for (ListNode* node : lists) {
//         if (node != nullptr) minHeap.push(node);
//     }

//     ListNode dummy(0);
//     ListNode* tail = &dummy;

//     while (!minHeap.empty()) {
//         ListNode* smallest = minHeap.top();
//         minHeap.pop();

//         tail->next = smallest;
//         tail = tail->next;

//         if (smallest->next != nullptr) minHeap.push(smallest->next);
//     }

//     return dummy.next;
// }

// ListNode* createList(const vector<int>& vals) {
//     ListNode dummy(0);
//     ListNode* curr = &dummy;
//     for (int v : vals) {
//         curr->next = new ListNode(v);
//         curr = curr->next;
//     }
//     return dummy.next;
// }

// void printList(ListNode* head) {
//     while (head != nullptr) {
//         cout << head->val << " -> ";
//         head = head->next;
//     }
//     cout << "NULL" << endl;
// }

// int main() {
//     vector<ListNode*> lists;
//     lists.push_back(createList({1, 4, 5}));
//     lists.push_back(createList({1, 3, 4}));
//     lists.push_back(createList({2, 6}));

//     ListNode* mergedHead = mergeKLists(lists);

//     cout << "Merged List: ";
//     printList(mergedHead);

//     return 0;
// }
// `,
//         "python": `import heapq

// class ListNode:
//     def __init__(self, val=0, next=None):
//         self.val = val
//         self.next = next

// def merge_k_lists(lists):
//     min_heap = []
//     for i, node in enumerate(lists):
//         if node is not None:
//             heapq.heappush(min_heap, (node.val, i, node))

//     dummy = ListNode(0)
//     tail = dummy

//     while min_heap:
//         val, i, smallest = heapq.heappop(min_heap)
//         tail.next = smallest
//         tail = tail.next

//         if smallest.next is not None:
//             heapq.heappush(min_heap, (smallest.next.val, i, smallest.next))

//     return dummy.next

// def create_list(vals):
//     dummy = ListNode(0)
//     curr = dummy
//     for v in vals:
//         curr.next = ListNode(v)
//         curr = curr.next
//     return dummy.next

// def print_list(head):
//     result = []
//     while head:
//         result.append(str(head.val))
//         head = head.next
//     print(" -> ".join(result) + " -> NULL")

// if __name__ == "__main__":
//     lists = [create_list([1, 4, 5]), create_list([1, 3, 4]), create_list([2, 6])]
//     merged_head = merge_k_lists(lists)
//     print("Merged List: ", end="")
//     print_list(merged_head)
// `,
//         "java": `import java.util.PriorityQueue;

// public class Main {
//     static class ListNode {
//         int val;
//         ListNode next;
//         ListNode(int x) { val = x; }
//     }

//     static ListNode mergeKLists(ListNode[] lists) {
//         PriorityQueue<ListNode> minHeap = new PriorityQueue<>((a, b) -> a.val - b.val);

//         for (ListNode node : lists) {
//             if (node != null) minHeap.offer(node);
//         }

//         ListNode dummy = new ListNode(0);
//         ListNode tail = dummy;

//         while (!minHeap.isEmpty()) {
//             ListNode smallest = minHeap.poll();
//             tail.next = smallest;
//             tail = tail.next;

//             if (smallest.next != null) minHeap.offer(smallest.next);
//         }

//         return dummy.next;
//     }

//     static ListNode createList(int[] vals) {
//         ListNode dummy = new ListNode(0);
//         ListNode curr = dummy;
//         for (int v : vals) {
//             curr.next = new ListNode(v);
//             curr = curr.next;
//         }
//         return dummy.next;
//     }

//     static void printList(ListNode head) {
//         StringBuilder sb = new StringBuilder();
//         while (head != null) {
//             sb.append(head.val).append(" -> ");
//             head = head.next;
//         }
//         sb.append("NULL");
//         System.out.println(sb);
//     }

//     public static void main(String[] args) {
//         ListNode[] lists = {
//             createList(new int[]{1, 4, 5}),
//             createList(new int[]{1, 3, 4}),
//             createList(new int[]{2, 6})
//         };

//         ListNode mergedHead = mergeKLists(lists);
//         System.out.print("Merged List: ");
//         printList(mergedHead);
//     }
// }
// `,
//         "js": `class ListNode {
//     constructor(val, next = null) {
//         this.val = val;
//         this.next = next;
//     }
// }

// function mergeKLists(lists) {
//     // Simple binary min-heap keyed by node.val
//     const heap = [];

//     const siftUp = () => {
//         let i = heap.length - 1;
//         while (i > 0) {
//             const parent = (i - 1) >> 1;
//             if (heap[parent].val <= heap[i].val) break;
//             [heap[parent], heap[i]] = [heap[i], heap[parent]];
//             i = parent;
//         }
//     };

//     const siftDown = () => {
//         let i = 0;
//         const n = heap.length;
//         while (true) {
//             let smallest = i;
//             const left = 2 * i + 1;
//             const right = 2 * i + 2;
//             if (left < n && heap[left].val < heap[smallest].val) smallest = left;
//             if (right < n && heap[right].val < heap[smallest].val) smallest = right;
//             if (smallest === i) break;
//             [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
//             i = smallest;
//         }
//     };

//     const push = (node) => {
//         heap.push(node);
//         siftUp();
//     };

//     const pop = () => {
//         const top = heap[0];
//         const last = heap.pop();
//         if (heap.length > 0) {
//             heap[0] = last;
//             siftDown();
//         }
//         return top;
//     };

//     for (const node of lists) {
//         if (node !== null) push(node);
//     }

//     const dummy = new ListNode(0);
//     let tail = dummy;

//     while (heap.length > 0) {
//         const smallest = pop();
//         tail.next = smallest;
//         tail = tail.next;

//         if (smallest.next !== null) push(smallest.next);
//     }

//     return dummy.next;
// }

// function createList(vals) {
//     const dummy = new ListNode(0);
//     let curr = dummy;
//     for (const v of vals) {
//         curr.next = new ListNode(v);
//         curr = curr.next;
//     }
//     return dummy.next;
// }

// function printList(head) {
//     const parts = [];
//     while (head !== null) {
//         parts.push(head.val);
//         head = head.next;
//     }
//     console.log(parts.join(" -> ") + " -> NULL");
// }

// const lists = [createList([1, 4, 5]), createList([1, 3, 4]), createList([2, 6])];
// const mergedHead = mergeKLists(lists);
// process.stdout.write("Merged List: ");
// printList(mergedHead);
// `,
//         "c": `#include <stdio.h>
// #include <stdlib.h>

// typedef struct ListNode {
//     int val;
//     struct ListNode* next;
// } ListNode;

// ListNode* createNode(int val) {
//     ListNode* node = (ListNode*)malloc(sizeof(ListNode));
//     node->val = val;
//     node->next = NULL;
//     return node;
// }

// // Simple array-backed min-heap of ListNode pointers.
// void siftUp(ListNode** heap, int i) {
//     while (i > 0) {
//         int parent = (i - 1) / 2;
//         if (heap[parent]->val <= heap[i]->val) break;
//         ListNode* temp = heap[parent]; heap[parent] = heap[i]; heap[i] = temp;
//         i = parent;
//     }
// }

// void siftDown(ListNode** heap, int size) {
//     int i = 0;
//     while (1) {
//         int smallest = i;
//         int left = 2 * i + 1;
//         int right = 2 * i + 2;
//         if (left < size && heap[left]->val < heap[smallest]->val) smallest = left;
//         if (right < size && heap[right]->val < heap[smallest]->val) smallest = right;
//         if (smallest == i) break;
//         ListNode* temp = heap[i]; heap[i] = heap[smallest]; heap[smallest] = temp;
//         i = smallest;
//     }
// }

// ListNode* mergeKLists(ListNode** lists, int k) {
//     ListNode** heap = (ListNode**)malloc(k * sizeof(ListNode*));
//     int heapSize = 0;

//     for (int i = 0; i < k; i++) {
//         if (lists[i] != NULL) {
//             heap[heapSize++] = lists[i];
//             siftUp(heap, heapSize - 1);
//         }
//     }

//     ListNode dummy; dummy.next = NULL;
//     ListNode* tail = &dummy;

//     while (heapSize > 0) {
//         ListNode* smallest = heap[0];
//         heap[0] = heap[heapSize - 1];
//         heapSize--;
//         siftDown(heap, heapSize);

//         tail->next = smallest;
//         tail = tail->next;

//         if (smallest->next != NULL) {
//             heap[heapSize++] = smallest->next;
//             siftUp(heap, heapSize - 1);
//         }
//     }

//     free(heap);
//     return dummy.next;
// }

// ListNode* createList(int* vals, int n) {
//     ListNode dummy; dummy.next = NULL;
//     ListNode* curr = &dummy;
//     for (int i = 0; i < n; i++) {
//         curr->next = createNode(vals[i]);
//         curr = curr->next;
//     }
//     return dummy.next;
// }

// void printList(ListNode* head) {
//     while (head != NULL) {
//         printf("%d -> ", head->val);
//         head = head->next;
//     }
//     printf("NULL\\n");
// }

// int main() {
//     int a[] = {1, 4, 5};
//     int b[] = {1, 3, 4};
//     int c[] = {2, 6};

//     ListNode* lists[3];
//     lists[0] = createList(a, 3);
//     lists[1] = createList(b, 3);
//     lists[2] = createList(c, 2);

//     ListNode* mergedHead = mergeKLists(lists, 3);
//     printf("Merged List: ");
//     printList(mergedHead);

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;

// class ListNode {
//     public int Val;
//     public ListNode Next;
//     public ListNode(int val) { Val = val; }
// }

// class Program {
//     static ListNode MergeKLists(List<ListNode> lists) {
//         var minHeap = new SortedSet<(int val, int id, ListNode node)>();
//         int id = 0;

//         foreach (var node in lists) {
//             if (node != null) minHeap.Add((node.Val, id++, node));
//         }

//         var dummy = new ListNode(0);
//         var tail = dummy;

//         while (minHeap.Count > 0) {
//             var smallestEntry = minHeap.Min;
//             minHeap.Remove(smallestEntry);
//             var smallest = smallestEntry.node;

//             tail.Next = smallest;
//             tail = tail.Next;

//             if (smallest.Next != null) minHeap.Add((smallest.Next.Val, id++, smallest.Next));
//         }

//         return dummy.Next;
//     }

//     static ListNode CreateList(int[] vals) {
//         var dummy = new ListNode(0);
//         var curr = dummy;
//         foreach (int v in vals) {
//             curr.Next = new ListNode(v);
//             curr = curr.Next;
//         }
//         return dummy.Next;
//     }

//     static void PrintList(ListNode head) {
//         var parts = new List<string>();
//         while (head != null) {
//             parts.Add(head.Val.ToString());
//             head = head.Next;
//         }
//         Console.WriteLine(string.Join(" -> ", parts) + " -> NULL");
//     }

//     static void Main() {
//         var lists = new List<ListNode> {
//             CreateList(new[] {1, 4, 5}),
//             CreateList(new[] {1, 3, 4}),
//             CreateList(new[] {2, 6})
//         };

//         var mergedHead = MergeKLists(lists);
//         Console.Write("Merged List: ");
//         PrintList(mergedHead);
//     }
// }
// `,
//         "swift": `class ListNode {
//     var val: Int
//     var next: ListNode?
//     init(_ val: Int) { self.val = val }
// }

// func mergeKLists(_ lists: [ListNode?]) -> ListNode? {
//     var heap: [ListNode] = []

//     func siftUp() {
//         var i = heap.count - 1
//         while i > 0 {
//             let parent = (i - 1) / 2
//             if heap[parent].val <= heap[i].val { break }
//             heap.swapAt(parent, i)
//             i = parent
//         }
//     }

//     func siftDown() {
//         var i = 0
//         let n = heap.count
//         while true {
//             var smallest = i
//             let left = 2 * i + 1
//             let right = 2 * i + 2
//             if left < n && heap[left].val < heap[smallest].val { smallest = left }
//             if right < n && heap[right].val < heap[smallest].val { smallest = right }
//             if smallest == i { break }
//             heap.swapAt(i, smallest)
//             i = smallest
//         }
//     }

//     func push(_ node: ListNode) {
//         heap.append(node)
//         siftUp()
//     }

//     func pop() -> ListNode {
//         let top = heap[0]
//         let last = heap.removeLast()
//         if !heap.isEmpty {
//             heap[0] = last
//             siftDown()
//         }
//         return top
//     }

//     for node in lists {
//         if let node = node { push(node) }
//     }

//     let dummy = ListNode(0)
//     var tail = dummy

//     while !heap.isEmpty {
//         let smallest = pop()
//         tail.next = smallest
//         tail = smallest

//         if let next = smallest.next { push(next) }
//     }

//     return dummy.next
// }

// func createList(_ vals: [Int]) -> ListNode? {
//     let dummy = ListNode(0)
//     var curr = dummy
//     for v in vals {
//         curr.next = ListNode(v)
//         curr = curr.next!
//     }
//     return dummy.next
// }

// func printList(_ head: ListNode?) {
//     var parts: [String] = []
//     var node = head
//     while let n = node {
//         parts.append(String(n.val))
//         node = n.next
//     }
//     print(parts.joined(separator: " -> ") + " -> NULL")
// }

// let lists = [createList([1, 4, 5]), createList([1, 3, 4]), createList([2, 6])]
// let mergedHead = mergeKLists(lists)
// print("Merged List: ", terminator: "")
// printList(mergedHead)
// `,
//         "kotlin": `import java.util.PriorityQueue

// class ListNode(var value: Int) {
//     var next: ListNode? = null
// }

// fun mergeKLists(lists: List<ListNode?>): ListNode? {
//     val minHeap = PriorityQueue<ListNode>(compareBy { it.value })

//     for (node in lists) {
//         if (node != null) minHeap.offer(node)
//     }

//     val dummy = ListNode(0)
//     var tail = dummy

//     while (minHeap.isNotEmpty()) {
//         val smallest = minHeap.poll()
//         tail.next = smallest
//         tail = smallest

//         smallest.next?.let { minHeap.offer(it) }
//     }

//     return dummy.next
// }

// fun createList(vals: List<Int>): ListNode? {
//     val dummy = ListNode(0)
//     var curr = dummy
//     for (v in vals) {
//         curr.next = ListNode(v)
//         curr = curr.next!!
//     }
//     return dummy.next
// }

// fun printList(head: ListNode?) {
//     val parts = mutableListOf<String>()
//     var node = head
//     while (node != null) {
//         parts.add(node.value.toString())
//         node = node.next
//     }
//     println(parts.joinToString(" -> ") + " -> NULL")
// }

// fun main() {
//     val lists = listOf(createList(listOf(1, 4, 5)), createList(listOf(1, 3, 4)), createList(listOf(2, 6)))
//     val mergedHead = mergeKLists(lists)
//     print("Merged List: ")
//     printList(mergedHead)
// }
// `,
//         "scala": `import scala.collection.mutable

// class ListNode(var value: Int, var next: ListNode = null)

// object Main extends App {
//     def mergeKLists(lists: List[ListNode]): ListNode = {
//         val ord = Ordering.by[ListNode, Int](_.value).reverse
//         val minHeap = mutable.PriorityQueue[ListNode]()(ord)

//         for (node <- lists if node != null) minHeap.enqueue(node)

//         val dummy = new ListNode(0)
//         var tail = dummy

//         while (minHeap.nonEmpty) {
//             val smallest = minHeap.dequeue()
//             tail.next = smallest
//             tail = smallest

//             if (smallest.next != null) minHeap.enqueue(smallest.next)
//         }

//         dummy.next
//     }

//     def createList(vals: List[Int]): ListNode = {
//         val dummy = new ListNode(0)
//         var curr = dummy
//         for (v <- vals) {
//             curr.next = new ListNode(v)
//             curr = curr.next
//         }
//         dummy.next
//     }

//     def printList(head: ListNode): Unit = {
//         val parts = mutable.ListBuffer[String]()
//         var node = head
//         while (node != null) {
//             parts += node.value.toString
//             node = node.next
//         }
//         println(parts.mkString(" -> ") + " -> NULL")
//     }

//     val lists = List(createList(List(1, 4, 5)), createList(List(1, 3, 4)), createList(List(2, 6)))
//     val mergedHead = mergeKLists(lists)
//     print("Merged List: ")
//     printList(mergedHead)
// }
// `,
//         "go": `package main

// import (
//     "container/heap"
//     "fmt"
// )

// type ListNode struct {
//     Val  int
//     Next *ListNode
// }

// type NodeHeap []*ListNode

// func (h NodeHeap) Len() int            { return len(h) }
// func (h NodeHeap) Less(i, j int) bool  { return h[i].Val < h[j].Val }
// func (h NodeHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *NodeHeap) Push(x interface{}) { *h = append(*h, x.(*ListNode)) }
// func (h *NodeHeap) Pop() interface{} {
//     old := *h
//     n := len(old)
//     x := old[n-1]
//     *h = old[:n-1]
//     return x
// }

// func mergeKLists(lists []*ListNode) *ListNode {
//     minHeap := &NodeHeap{}
//     heap.Init(minHeap)

//     for _, node := range lists {
//         if node != nil {
//             heap.Push(minHeap, node)
//         }
//     }

//     dummy := &ListNode{}
//     tail := dummy

//     for minHeap.Len() > 0 {
//         smallest := heap.Pop(minHeap).(*ListNode)
//         tail.Next = smallest
//         tail = tail.Next

//         if smallest.Next != nil {
//             heap.Push(minHeap, smallest.Next)
//         }
//     }

//     return dummy.Next
// }

// func createList(vals []int) *ListNode {
//     dummy := &ListNode{}
//     curr := dummy
//     for _, v := range vals {
//         curr.Next = &ListNode{Val: v}
//         curr = curr.Next
//     }
//     return dummy.Next
// }

// func printList(head *ListNode) {
//     for head != nil {
//         fmt.Printf("%d -> ", head.Val)
//         head = head.Next
//     }
//     fmt.Println("NULL")
// }

// func main() {
//     lists := []*ListNode{
//         createList([]int{1, 4, 5}),
//         createList([]int{1, 3, 4}),
//         createList([]int{2, 6}),
//     }

//     mergedHead := mergeKLists(lists)
//     fmt.Print("Merged List: ")
//     printList(mergedHead)
// }
// `,
//         "rust": `use std::cmp::Ordering;
// use std::collections::BinaryHeap;

// #[derive(Eq, PartialEq)]
// struct ListNode {
//     val: i32,
//     next: Option<Box<ListNode>>,
// }

// impl ListNode {
//     fn new(val: i32) -> Self {
//         ListNode { val, next: None }
//     }
// }

// // Reverse ordering so BinaryHeap (a max-heap) behaves as a min-heap.
// struct HeapEntry(i32, Box<ListNode>);

// impl Eq for HeapEntry {}
// impl PartialEq for HeapEntry {
//     fn eq(&self, other: &Self) -> bool { self.0 == other.0 }
// }
// impl Ord for HeapEntry {
//     fn cmp(&self, other: &Self) -> Ordering { other.0.cmp(&self.0) }
// }
// impl PartialOrd for HeapEntry {
//     fn partial_cmp(&self, other: &Self) -> Option<Ordering> { Some(self.cmp(other)) }
// }

// fn merge_k_lists(lists: Vec<Option<Box<ListNode>>>) -> Option<Box<ListNode>> {
//     let mut heap: BinaryHeap<HeapEntry> = BinaryHeap::new();

//     for node in lists.into_iter().flatten() {
//         let val = node.val;
//         heap.push(HeapEntry(val, node));
//     }

//     let mut dummy = Box::new(ListNode::new(0));
//     let mut tail: &mut Box<ListNode> = &mut dummy;

//     while let Some(HeapEntry(_, mut smallest)) = heap.pop() {
//         if let Some(next) = smallest.next.take() {
//             heap.push(HeapEntry(next.val, next));
//         }
//         tail.next = Some(smallest);
//         tail = tail.next.as_mut().unwrap();
//     }

//     dummy.next
// }

// fn create_list(vals: &[i32]) -> Option<Box<ListNode>> {
//     let mut dummy = Box::new(ListNode::new(0));
//     let mut tail = &mut dummy;
//     for &v in vals {
//         tail.next = Some(Box::new(ListNode::new(v)));
//         tail = tail.next.as_mut().unwrap();
//     }
//     dummy.next
// }

// fn print_list(mut head: Option<&Box<ListNode>>) {
//     let mut parts = vec![];
//     while let Some(node) = head {
//         parts.push(node.val.to_string());
//         head = node.next.as_ref();
//     }
//     println!("{} -> NULL", parts.join(" -> "));
// }

// fn main() {
//     let lists = vec![
//         create_list(&[1, 4, 5]),
//         create_list(&[1, 3, 4]),
//         create_list(&[2, 6]),
//     ];

//     let merged_head = merge_k_lists(lists);
//     print!("Merged List: ");
//     print_list(merged_head.as_ref());
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        3. TOP K FREQUENT ELEMENTS
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Top K Frequent Elements",
//       href: "/algorithms/heap/top-k-frequent",
//       type: "Medium",

//       about: [
//         { tag: "h1", text: "Top K Frequent Elements" },
//         { tag: "p", text: "Given an array, find the k elements that occur most frequently. This problem combines two earlier techniques from this reference directly: a hash map to count each element's frequency in one O(n) pass (exactly like the Hash Maps section's frequency-counting pattern), followed by a size-k min-heap (exactly like Kth Largest Element above, but keyed by FREQUENCY instead of raw value) to extract the top k frequencies in O(n log k)." },
//         { tag: "p", text: "This is a clean demonstration of algorithmic COMPOSITION: rather than being a fundamentally new technique, it's the direct combination of two patterns already covered elsewhere in this reference, applied in sequence — count first, then heap-select. Recognising when a problem decomposes into 'apply technique A, then feed the result into technique B' is itself a core algorithmic skill." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Finding the most common k items in a dataset — trending topics, most-frequent search queries, most-played songs, word-frequency analysis (top k words in a document)",
//           "Any 'top-k by some derived/computed metric' problem, where the metric itself (here, frequency) must first be computed via a preliminary pass before the heap-selection step can begin",
//           "As a direct illustration of composing the Hash Map frequency-counting pattern with the size-k min-heap pattern — recognising this composition is more valuable long-term than memorising the specific problem",
//           "An alternative O(n) average-case approach exists using Bucket Sort (bucket index = frequency, since frequency is bounded by n) when k is close to n or when the O(n log k) heap approach's log factor genuinely matters at scale"
//         ]},
//         { tag: "note", variant: "tip", text: "If k equals the total number of distinct elements (i.e. you need ALL elements ordered by frequency, not just the top k), a full sort by frequency is simpler and asymptotically no worse — the heap-based size-k approach earns its keep specifically when k is meaningfully smaller than the number of distinct elements." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(n log k)",
//         best: [
//           { tag: "h2", text: "Best Case — O(n log k)" },
//           { tag: "p", text: "Both phases — frequency counting and heap selection — always process their full input regardless of value distribution: counting always requires one full pass over n elements, and heap selection always requires examining every distinct element found." },
//           { tag: "ul", items: [
//             "Phase 1 (frequency counting): O(n) — one hash map update per element, unconditionally",
//             "Phase 2 (heap selection): O(d log k), where d is the number of distinct elements (d ≤ n) — each distinct element triggers an O(1) comparison and possibly an O(log k) heap operation",
//             "Combined: O(n) + O(d log k) = O(n log k) in the standard classification, since d ≤ n"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(n log k)" },
//           { tag: "p", text: "Both phases perform the same fixed structural work regardless of how frequencies happen to be distributed across distinct elements — counting cost depends only on total element count, and heap-selection cost depends only on distinct-element count and k." },
//           { tag: "ul", items: [
//             "Phase 1: O(n), always a single full pass",
//             "Phase 2: O(d log k), where most distinct elements require an O(1) comparison and a fraction require the full O(log k) heap insertion-and-eviction",
//             "Total: O(n + d log k), simplified to O(n log k) in the standard worst-case-d classification"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(n log k)" },
//           { tag: "p", text: "If every element in the input is distinct (d = n, the maximum possible number of distinct elements), Phase 2's cost reaches its maximum, dominating the combined bound." },
//           { tag: "ul", items: [
//             "Worst case: d = n distinct elements, each requiring up to O(log k) heap work in Phase 2: O(n log k)",
//             "Combined with Phase 1's O(n): O(n) + O(n log k) = O(n log k)"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n)" },
//           { tag: "p", text: "The frequency-counting hash map must store an entry for every distinct element encountered, which in the best case (few distinct elements) is much smaller than n, though the heap itself stays bounded at O(k) regardless." },
//           { tag: "ul", items: ["Frequency hash map: O(d), where d ≤ n is the number of distinct elements", "Heap: O(k)"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n)" },
//           { tag: "p", text: "The frequency hash map's size scales with the number of distinct elements, which in the average case for typical data is some fraction of n, while the heap remains bounded by k throughout." },
//           { tag: "ul", items: ["Frequency hash map: O(d) ≤ O(n)", "Heap: O(k), where k ≤ d ≤ n always"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "If every element in the input is distinct, the frequency hash map must store n separate entries, reaching its maximum possible size." },
//           { tag: "ul", items: [
//             "Frequency hash map: O(n) when all elements are distinct (d = n)",
//             "Heap: O(k), still bounded separately and much smaller than n in typical use",
//             "Combined: O(n), dominated by the hash map in the worst case"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `function topKFrequent(nums, k):
//     freqMap ← empty hash map           // value → count

//     for num in nums:
//         freqMap[num] ← freqMap.get(num, 0) + 1

//     minHeap ← empty min-heap           // ordered by frequency

//     for (value, freq) in freqMap:
//         push(minHeap, (freq, value))
//         if size(minHeap) > k:
//             pop(minHeap)                // evict the currently-least-frequent of the top-k candidates

//     return [value for (freq, value) in minHeap]` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Phase 1: scan the input array once, building a hash map from each distinct value to its total occurrence count — exactly the standard frequency-counting pattern.",
//           "Phase 2: iterate over the distinct (value, frequency) pairs from the hash map, maintaining a min-heap ordered by frequency, capped at size k — exactly the same size-k-min-heap technique as Kth Largest Element, but the comparison key is now frequency rather than raw value.",
//           "For each (value, frequency) pair, push it onto the heap; if this exceeds size k, pop the entry with the smallest frequency, correctly evicting whichever of the current top-(k+1) candidates is least frequent.",
//           "After processing all distinct elements, the heap contains exactly the k elements with the highest frequencies — extract their values as the final answer."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "Phase 1's correctness is immediate: a hash map correctly and exactly counts the occurrences of every distinct value with a single pass. Phase 2's correctness follows from the exact same invariant argument as Kth Largest Element, applied to frequency instead of raw value: after processing any prefix of the distinct (value, frequency) pairs, the heap contains exactly the k highest-frequency elements seen so far, since each new candidate is added and, if it would exceed size k, the lowest-frequency entry among the current top-(k+1) is correctly evicted. By induction, after processing all distinct elements, the heap holds exactly the true k most frequent elements of the original input." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <vector>
// #include <unordered_map>
// #include <queue>

// using namespace std;

// vector<int> topKFrequent(const vector<int>& nums, int k) {
//     unordered_map<int, int> freqMap;
//     for (int num : nums) {
//         freqMap[num]++;
//     }

//     // Min-heap of (frequency, value) pairs, ordered by frequency.
//     priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> minHeap;

//     for (const auto& [value, freq] : freqMap) {
//         minHeap.push({freq, value});
//         if ((int)minHeap.size() > k) {
//             minHeap.pop();
//         }
//     }

//     vector<int> result;
//     while (!minHeap.empty()) {
//         result.push_back(minHeap.top().second);
//         minHeap.pop();
//     }

//     return result;
// }

// int main() {
//     vector<int> nums = {1, 1, 1, 2, 2, 3};
//     int k = 2;

//     vector<int> res = topKFrequent(nums, k);

//     cout << "Top " << k << " frequent elements: ";
//     for (int num : res) {
//         cout << num << " ";
//     }
//     cout << endl;

//     return 0;
// }
// `,
//         "python": `import heapq
// from collections import Counter

// def top_k_frequent(nums, k):
//     freq_map = Counter(nums)
//     min_heap = []

//     for value, freq in freq_map.items():
//         heapq.heappush(min_heap, (freq, value))
//         if len(min_heap) > k:
//             heapq.heappop(min_heap)

//     return [value for freq, value in min_heap]

// if __name__ == "__main__":
//     nums = [1, 1, 1, 2, 2, 3]
//     k = 2
//     res = top_k_frequent(nums, k)
//     print(f"Top {k} frequent elements: {res}")
// `,
//         "java": `import java.util.*;

// public class Main {
//     public static List<Integer> topKFrequent(int[] nums, int k) {
//         Map<Integer, Integer> freqMap = new HashMap<>();
//         for (int num : nums) {
//             freqMap.merge(num, 1, Integer::sum);
//         }

//         PriorityQueue<int[]> minHeap = new PriorityQueue<>((a, b) -> a[1] - b[1]);

//         for (Map.Entry<Integer, Integer> entry : freqMap.entrySet()) {
//             minHeap.offer(new int[]{entry.getKey(), entry.getValue()});
//             if (minHeap.size() > k) {
//                 minHeap.poll();
//             }
//         }

//         List<Integer> result = new ArrayList<>();
//         while (!minHeap.isEmpty()) {
//             result.add(minHeap.poll()[0]);
//         }

//         return result;
//     }

//     public static void main(String[] args) {
//         int[] nums = {1, 1, 1, 2, 2, 3};
//         int k = 2;
//         List<Integer> res = topKFrequent(nums, k);
//         System.out.println("Top " + k + " frequent elements: " + res);
//     }
// }
// `,
//         "js": `function topKFrequent(nums, k) {
//     const freqMap = new Map();
//     for (const num of nums) {
//         freqMap.set(num, (freqMap.get(num) || 0) + 1);
//     }

//     // Binary min-heap of [freq, value] pairs, ordered by freq.
//     const heap = [];

//     const siftUp = () => {
//         let i = heap.length - 1;
//         while (i > 0) {
//             const parent = (i - 1) >> 1;
//             if (heap[parent][0] <= heap[i][0]) break;
//             [heap[parent], heap[i]] = [heap[i], heap[parent]];
//             i = parent;
//         }
//     };

//     const siftDown = () => {
//         let i = 0;
//         const n = heap.length;
//         while (true) {
//             let smallest = i;
//             const left = 2 * i + 1;
//             const right = 2 * i + 2;
//             if (left < n && heap[left][0] < heap[smallest][0]) smallest = left;
//             if (right < n && heap[right][0] < heap[smallest][0]) smallest = right;
//             if (smallest === i) break;
//             [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
//             i = smallest;
//         }
//     };

//     const push = (entry) => {
//         heap.push(entry);
//         siftUp();
//     };

//     const pop = () => {
//         const top = heap[0];
//         const last = heap.pop();
//         if (heap.length > 0) {
//             heap[0] = last;
//             siftDown();
//         }
//         return top;
//     };

//     for (const [value, freq] of freqMap.entries()) {
//         push([freq, value]);
//         if (heap.length > k) {
//             pop();
//         }
//     }

//     return heap.map(([freq, value]) => value);
// }

// const nums = [1, 1, 1, 2, 2, 3];
// const k = 2;
// const res = topKFrequent(nums, k);
// console.log(\`Top \${k} frequent elements: \${res}\`);
// `,
//         "c": `#include <stdio.h>
// #include <stdlib.h>

// // Simple linear-scan frequency map (bounded input range) + array min-heap of size k.
// typedef struct { int value; int freq; } Entry;

// void siftUp(Entry* heap, int i) {
//     while (i > 0) {
//         int parent = (i - 1) / 2;
//         if (heap[parent].freq <= heap[i].freq) break;
//         Entry temp = heap[parent]; heap[parent] = heap[i]; heap[i] = temp;
//         i = parent;
//     }
// }

// void siftDown(Entry* heap, int size) {
//     int i = 0;
//     while (1) {
//         int smallest = i;
//         int left = 2 * i + 1;
//         int right = 2 * i + 2;
//         if (left < size && heap[left].freq < heap[smallest].freq) smallest = left;
//         if (right < size && heap[right].freq < heap[smallest].freq) smallest = right;
//         if (smallest == i) break;
//         Entry temp = heap[i]; heap[i] = heap[smallest]; heap[smallest] = temp;
//         i = smallest;
//     }
// }

// int main() {
//     int nums[] = {1, 1, 1, 2, 2, 3};
//     int n = 6;
//     int k = 2;

//     // Frequency count via a small hash-free lookup (values assumed small/non-negative here).
//     int maxVal = 0;
//     for (int i = 0; i < n; i++) if (nums[i] > maxVal) maxVal = nums[i];
//     int* freq = (int*)calloc(maxVal + 1, sizeof(int));
//     for (int i = 0; i < n; i++) freq[nums[i]]++;

//     Entry* heap = (Entry*)malloc(k * sizeof(Entry));
//     int heapSize = 0;

//     for (int v = 0; v <= maxVal; v++) {
//         if (freq[v] == 0) continue;
//         Entry e = {v, freq[v]};
//         if (heapSize < k) {
//             heap[heapSize++] = e;
//             siftUp(heap, heapSize - 1);
//         } else if (e.freq > heap[0].freq) {
//             heap[0] = e;
//             siftDown(heap, heapSize);
//         }
//     }

//     printf("Top %d frequent elements: ", k);
//     for (int i = 0; i < heapSize; i++) {
//         printf("%d ", heap[i].value);
//     }
//     printf("\\n");

//     free(freq);
//     free(heap);
//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;
// using System.Linq;

// class Program {
//     static List<int> TopKFrequent(int[] nums, int k) {
//         var freqMap = new Dictionary<int, int>();
//         foreach (int num in nums) {
//             freqMap[num] = freqMap.GetValueOrDefault(num, 0) + 1;
//         }

//         var minHeap = new SortedSet<(int freq, int value)>();

//         foreach (var kvp in freqMap) {
//             minHeap.Add((kvp.Value, kvp.Key));
//             if (minHeap.Count > k) {
//                 minHeap.Remove(minHeap.Min);
//             }
//         }

//         return minHeap.Select(entry => entry.value).ToList();
//     }

//     static void Main() {
//         int[] nums = {1, 1, 1, 2, 2, 3};
//         int k = 2;
//         var res = TopKFrequent(nums, k);
//         Console.WriteLine($"Top {k} frequent elements: [{string.Join(", ", res)}]");
//     }
// }
// `,
//         "swift": `func topKFrequent(_ nums: [Int], _ k: Int) -> [Int] {
//     var freqMap: [Int: Int] = [:]
//     for num in nums {
//         freqMap[num, default: 0] += 1
//     }

//     var heap: [(freq: Int, value: Int)] = []

//     func siftUp() {
//         var i = heap.count - 1
//         while i > 0 {
//             let parent = (i - 1) / 2
//             if heap[parent].freq <= heap[i].freq { break }
//             heap.swapAt(parent, i)
//             i = parent
//         }
//     }

//     func siftDown() {
//         var i = 0
//         let n = heap.count
//         while true {
//             var smallest = i
//             let left = 2 * i + 1
//             let right = 2 * i + 2
//             if left < n && heap[left].freq < heap[smallest].freq { smallest = left }
//             if right < n && heap[right].freq < heap[smallest].freq { smallest = right }
//             if smallest == i { break }
//             heap.swapAt(i, smallest)
//             i = smallest
//         }
//     }

//     for (value, freq) in freqMap {
//         heap.append((freq, value))
//         siftUp()
//         if heap.count > k {
//             heap[0] = heap.removeLast()
//             siftDown()
//         }
//     }

//     return heap.map { $0.value }
// }

// let nums = [1, 1, 1, 2, 2, 3]
// let k = 2
// let res = topKFrequent(nums, k)
// print("Top \\(k) frequent elements: \\(res)")
// `,
//         "kotlin": `import java.util.PriorityQueue

// fun topKFrequent(nums: IntArray, k: Int): List<Int> {
//     val freqMap = HashMap<Int, Int>()
//     for (num in nums) {
//         freqMap[num] = (freqMap[num] ?: 0) + 1
//     }

//     val minHeap = PriorityQueue<Pair<Int, Int>>(compareBy { it.second }) // (value, freq)

//     for ((value, freq) in freqMap) {
//         minHeap.offer(value to freq)
//         if (minHeap.size > k) {
//             minHeap.poll()
//         }
//     }

//     return minHeap.map { it.first }
// }

// fun main() {
//     val nums = intArrayOf(1, 1, 1, 2, 2, 3)
//     val k = 2
//     val res = topKFrequent(nums, k)
//     println("Top $k frequent elements: $res")
// }
// `,
//         "scala": `import scala.collection.mutable

// object Main extends App {
//     def topKFrequent(nums: Array[Int], k: Int): List[Int] = {
//         val freqMap = mutable.Map[Int, Int]()
//         for (num <- nums) {
//             freqMap(num) = freqMap.getOrElse(num, 0) + 1
//         }

//         val ord = Ordering.by[(Int, Int), Int](_._2).reverse // order by freq, min on top
//         val minHeap = mutable.PriorityQueue[(Int, Int)]()(ord)

//         for ((value, freq) <- freqMap) {
//             minHeap.enqueue((value, freq))
//             if (minHeap.size > k) {
//                 minHeap.dequeue()
//             }
//         }

//         minHeap.map(_._1).toList
//     }

//     val nums = Array(1, 1, 1, 2, 2, 3)
//     val k = 2
//     val res = topKFrequent(nums, k)
//     println(s"Top $k frequent elements: $res")
// }
// `,
//         "go": `package main

// import (
//     "container/heap"
//     "fmt"
// )

// type Entry struct {
//     value int
//     freq  int
// }

// type EntryHeap []Entry

// func (h EntryHeap) Len() int            { return len(h) }
// func (h EntryHeap) Less(i, j int) bool  { return h[i].freq < h[j].freq }
// func (h EntryHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *EntryHeap) Push(x interface{}) { *h = append(*h, x.(Entry)) }
// func (h *EntryHeap) Pop() interface{} {
//     old := *h
//     n := len(old)
//     x := old[n-1]
//     *h = old[:n-1]
//     return x
// }

// func topKFrequent(nums []int, k int) []int {
//     freqMap := make(map[int]int)
//     for _, num := range nums {
//         freqMap[num]++
//     }

//     minHeap := &EntryHeap{}
//     heap.Init(minHeap)

//     for value, freq := range freqMap {
//         heap.Push(minHeap, Entry{value, freq})
//         if minHeap.Len() > k {
//             heap.Pop(minHeap)
//         }
//     }

//     result := make([]int, minHeap.Len())
//     for i := len(result) - 1; i >= 0; i-- {
//         result[i] = heap.Pop(minHeap).(Entry).value
//     }

//     return result
// }

// func main() {
//     nums := []int{1, 1, 1, 2, 2, 3}
//     k := 2
//     res := topKFrequent(nums, k)
//     fmt.Printf("Top %d frequent elements: %v\\n", k, res)
// }
// `,
//         "rust": `use std::cmp::Ordering;
// use std::collections::{BinaryHeap, HashMap};

// #[derive(Eq, PartialEq)]
// struct Entry {
//     freq: i32,
//     value: i32,
// }

// // Reverse ordering so BinaryHeap behaves as a min-heap on frequency.
// impl Ord for Entry {
//     fn cmp(&self, other: &Self) -> Ordering {
//         other.freq.cmp(&self.freq)
//     }
// }
// impl PartialOrd for Entry {
//     fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
//         Some(self.cmp(other))
//     }
// }

// fn top_k_frequent(nums: &[i32], k: usize) -> Vec<i32> {
//     let mut freq_map: HashMap<i32, i32> = HashMap::new();
//     for &num in nums {
//         *freq_map.entry(num).or_insert(0) += 1;
//     }

//     let mut min_heap: BinaryHeap<Entry> = BinaryHeap::new();

//     for (&value, &freq) in freq_map.iter() {
//         min_heap.push(Entry { freq, value });
//         if min_heap.len() > k {
//             min_heap.pop();
//         }
//     }

//     min_heap.into_iter().map(|e| e.value).collect()
// }

// fn main() {
//     let nums = vec![1, 1, 1, 2, 2, 3];
//     let k = 2;
//     let res = top_k_frequent(&nums, k);
//     println!("Top {} frequent elements: {:?}", k, res);
// }
// `
//       }
//     },

//     /* ════════════════════════════════════════════════════════════════════
//        4. FIND MEDIAN FROM DATA STREAM
//     ════════════════════════════════════════════════════════════════════ */
//     {
//       name: "Find Median from Data Stream",
//       href: "/algorithms/heap/median-stream",
//       type: "Hard",

//       about: [
//         { tag: "h1", text: "Find Median from Data Stream" },
//         { tag: "p", text: "Given a continuous stream of numbers arriving one at a time, this problem asks for the ability to report the MEDIAN of all numbers seen so far, at any point, efficiently — without re-sorting the entire dataset on every new arrival. The elegant solution uses TWO heaps simultaneously: a max-heap holding the smaller half of the numbers seen so far, and a min-heap holding the larger half, kept balanced in size at every step." },
//         { tag: "p", text: "The key insight: the max-heap's root is always the largest of the 'lower half', and the min-heap's root is always the smallest of the 'upper half' — so if the two heaps are kept equal in size (or differing by at most one), the median is either the average of both roots (even total count) or simply the root of whichever heap has one extra element (odd total count), both retrievable in O(1)." },
//         { tag: "h2", text: "When to reach for it" },
//         { tag: "ul", items: [
//           "Any 'maintain a running median (or running percentile) as data continuously arrives' requirement — real-time analytics dashboards, monitoring systems tracking median latency/response time",
//           "Streaming statistics in general: this two-heap balancing technique generalises to tracking other order-statistics of a stream beyond just the median",
//           "As the canonical example of using TWO heaps of opposite type together to implicitly maintain a sorted partition of a dataset, without ever fully sorting it",
//           "Financial/trading systems tracking a running median price or volume across a continuous feed of transactions"
//         ]},
//         { tag: "note", variant: "tip", text: "The size-balancing rule (never let the two heaps differ by more than 1 in size) is what makes O(1) median retrieval possible — without that explicit balancing step on every insertion, the median couldn't be read directly from the two roots alone." }
//       ],

//       timeComplexityCalculation: {
//         notation: "O(log n) insert / O(1) query",
//         best: [
//           { tag: "h2", text: "Best Case — O(log n) insert" },
//           { tag: "p", text: "Every insertion requires at least one heap-push operation (into one of the two heaps), and that push always costs O(log n) regardless of the specific value being inserted or the stream's current size — there's no shortcut even for the most favourable value." },
//           { tag: "ul", items: [
//             "Insert: O(log n) for the heap push into whichever heap the new value belongs to, plus possibly a single O(log n) rebalancing move (popping from one heap and pushing to the other) if sizes become unequal",
//             "Query (getMedian): O(1) — simply peek the root(s) of one or both heaps"
//           ]}
//         ],
//         average: [
//           { tag: "h2", text: "Average Case — O(log n) insert / O(1) query" },
//           { tag: "p", text: "Every insertion performs the same fixed sequence of heap operations regardless of where in the stream's distribution the new value falls — one push, and at most one rebalancing pop-and-push pair, both O(log n)." },
//           { tag: "ul", items: [
//             "Insert: O(log n), where n is the total count of elements inserted so far (the combined size of both heaps)",
//             "Query: O(1), always — just read the root(s)",
//             "This holds regardless of the actual sequence of values streamed in"
//           ]}
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case — O(log n) insert / O(1) query" },
//           { tag: "p", text: "No value or insertion order increases the cost beyond the standard heap-push bound — every insertion requires exactly one O(log n) push and at most one additional O(log n) rebalancing step, regardless of stream content." },
//           { tag: "ul", items: [
//             "Worst case matches best/average for both operations: O(log n) insert, O(1) query",
//             "This is the standard, unavoidable trade-off: maintaining the ability to query a running statistic in O(1) requires paying a logarithmic cost on every insertion to keep the underlying structures correctly balanced"
//           ]}
//         ]
//       },

//       spaceComplexityCalculation: {
//         notation: "O(n)",
//         best: [
//           { tag: "h2", text: "Best Case Space — O(n)" },
//           { tag: "p", text: "Every single value from the stream must be stored in one of the two heaps to be available for future median queries — there's no way to discard any value, since any of them could still be needed to compute a future median as the stream continues." },
//           { tag: "ul", items: ["Max-heap (lower half) + min-heap (upper half), combined: O(n), where n is the total number of values streamed in so far"] }
//         ],
//         average: [
//           { tag: "h2", text: "Average Case Space — O(n)" },
//           { tag: "p", text: "Space usage is fixed by the total number of values received so far, split roughly evenly between the two heaps by the balancing invariant, regardless of the specific value distribution." },
//           { tag: "ul", items: ["Combined heap sizes: O(n), split as close to n/2 and n/2 as the balancing rule allows (differing by at most 1)"] }
//         ],
//         worst: [
//           { tag: "h2", text: "Worst Case Space — O(n)" },
//           { tag: "p", text: "No value distribution increases space beyond storing every streamed value exactly once across the two heaps — this is an unavoidable cost of the problem itself, not a flaw of this specific algorithm." },
//           { tag: "ul", items: [
//             "O(n) total, identical across all cases — every algorithm solving this problem must retain all n values in some form, since any value could affect a future median calculation"
//           ]}
//         ]
//       },

//       pseudoCodeandStepexplanation: [
//         { tag: "h1", text: "Pseudocode & Step-by-Step Explanation" },
//         { tag: "code", language: "text", text:
// `class MedianFinder:
//     lowerHalf ← empty max-heap     // holds the smaller half of all values
//     upperHalf ← empty min-heap     // holds the larger half of all values

//     function addNum(num):
//         if lowerHalf is empty or num <= peek(lowerHalf):
//             push(lowerHalf, num)
//         else:
//             push(upperHalf, num)

//         // Rebalance: keep sizes equal, or lowerHalf at most 1 larger
//         if size(lowerHalf) > size(upperHalf) + 1:
//             push(upperHalf, pop(lowerHalf))
//         else if size(upperHalf) > size(lowerHalf):
//             push(lowerHalf, pop(upperHalf))

//     function findMedian():
//         if size(lowerHalf) > size(upperHalf):
//             return peek(lowerHalf)
//         else:
//             return (peek(lowerHalf) + peek(upperHalf)) / 2` },
//         { tag: "h2", text: "Step-by-step reasoning" },
//         { tag: "ol", items: [
//           "Maintain two heaps: a max-heap (lowerHalf) for the smaller half of all values seen, and a min-heap (upperHalf) for the larger half.",
//           "On each new value, decide which half it belongs to by comparing it against the current maximum of lowerHalf (or default to lowerHalf if it's currently empty) — this keeps every value in lowerHalf ≤ every value in upperHalf.",
//           "After insertion, rebalance if needed: if lowerHalf has grown more than one element larger than upperHalf, move its maximum over to upperHalf; if upperHalf has become larger than lowerHalf at all, move its minimum over to lowerHalf. This keeps the two heaps' sizes equal, or lowerHalf exactly one larger.",
//           "To find the median: if lowerHalf has one extra element (odd total count), its maximum (the root) IS the median. If the two heaps are equal in size (even total count), the median is the average of both roots."
//         ]},
//         { tag: "h2", text: "Why it's correct" },
//         { tag: "p", text: "The core invariant — every value in lowerHalf is ≤ every value in upperHalf, and the two heaps' sizes differ by at most 1 — is maintained on every insertion by the explicit rebalancing step, and this invariant is exactly what's needed to guarantee correctness: it means lowerHalf contains precisely the smaller half (or smaller-half-plus-one, if odd) of ALL values seen, and upperHalf contains precisely the larger half. Given this partition, the median is, by definition, either the boundary element (lowerHalf's maximum, when there's an odd total count and lowerHalf holds the extra element) or the average of the two boundary elements (when the count is even and the true median lies between them) — exactly what findMedian computes, using only the O(1)-accessible roots of both heaps." }
//       ],
//       codes: {
//         "c++": `#include <iostream>
// #include <queue>

// using namespace std;

// class MedianFinder {
// public:
//     priority_queue<int> lowerHalf;                                  // max-heap
//     priority_queue<int, vector<int>, greater<int>> upperHalf;        // min-heap

//     void addNum(int num) {
//         if (lowerHalf.empty() || num <= lowerHalf.top()) {
//             lowerHalf.push(num);
//         } else {
//             upperHalf.push(num);
//         }

//         if (lowerHalf.size() > upperHalf.size() + 1) {
//             upperHalf.push(lowerHalf.top());
//             lowerHalf.pop();
//         } else if (upperHalf.size() > lowerHalf.size()) {
//             lowerHalf.push(upperHalf.top());
//             upperHalf.pop();
//         }
//     }

//     double findMedian() {
//         if (lowerHalf.size() > upperHalf.size()) {
//             return lowerHalf.top();
//         }
//         return (lowerHalf.top() + upperHalf.top()) / 2.0;
//     }
// };

// int main() {
//     MedianFinder mf;

//     mf.addNum(1);
//     mf.addNum(2);
//     cout << "Median after adding 1, 2: " << mf.findMedian() << endl;

//     mf.addNum(3);
//     cout << "Median after adding 3: " << mf.findMedian() << endl;

//     mf.addNum(10);
//     mf.addNum(20);
//     cout << "Median after adding 10, 20: " << mf.findMedian() << endl;

//     return 0;
// }
// `,
//         "python": `import heapq

// class MedianFinder:
//     def __init__(self):
//         self.lower_half = []  # max-heap (store negated values)
//         self.upper_half = []  # min-heap

//     def add_num(self, num):
//         if not self.lower_half or num <= -self.lower_half[0]:
//             heapq.heappush(self.lower_half, -num)
//         else:
//             heapq.heappush(self.upper_half, num)

//         if len(self.lower_half) > len(self.upper_half) + 1:
//             heapq.heappush(self.upper_half, -heapq.heappop(self.lower_half))
//         elif len(self.upper_half) > len(self.lower_half):
//             heapq.heappush(self.lower_half, -heapq.heappop(self.upper_half))

//     def find_median(self):
//         if len(self.lower_half) > len(self.upper_half):
//             return -self.lower_half[0]
//         return (-self.lower_half[0] + self.upper_half[0]) / 2.0

// if __name__ == "__main__":
//     mf = MedianFinder()

//     mf.add_num(1)
//     mf.add_num(2)
//     print(f"Median after adding 1, 2: {mf.find_median()}")

//     mf.add_num(3)
//     print(f"Median after adding 3: {mf.find_median()}")

//     mf.add_num(10)
//     mf.add_num(20)
//     print(f"Median after adding 10, 20: {mf.find_median()}")
// `,
//         "java": `import java.util.PriorityQueue;
// import java.util.Collections;

// public class Main {
//     static class MedianFinder {
//         PriorityQueue<Integer> lowerHalf = new PriorityQueue<>(Collections.reverseOrder()); // max-heap
//         PriorityQueue<Integer> upperHalf = new PriorityQueue<>();                            // min-heap

//         void addNum(int num) {
//             if (lowerHalf.isEmpty() || num <= lowerHalf.peek()) {
//                 lowerHalf.offer(num);
//             } else {
//                 upperHalf.offer(num);
//             }

//             if (lowerHalf.size() > upperHalf.size() + 1) {
//                 upperHalf.offer(lowerHalf.poll());
//             } else if (upperHalf.size() > lowerHalf.size()) {
//                 lowerHalf.offer(upperHalf.poll());
//             }
//         }

//         double findMedian() {
//             if (lowerHalf.size() > upperHalf.size()) {
//                 return lowerHalf.peek();
//             }
//             return (lowerHalf.peek() + upperHalf.peek()) / 2.0;
//         }
//     }

//     public static void main(String[] args) {
//         MedianFinder mf = new MedianFinder();

//         mf.addNum(1);
//         mf.addNum(2);
//         System.out.println("Median after adding 1, 2: " + mf.findMedian());

//         mf.addNum(3);
//         System.out.println("Median after adding 3: " + mf.findMedian());

//         mf.addNum(10);
//         mf.addNum(20);
//         System.out.println("Median after adding 10, 20: " + mf.findMedian());
//     }
// }
// `,
//         "js": `class MedianFinder {
//     constructor() {
//         this.lowerHalf = []; // max-heap (store negated values)
//         this.upperHalf = []; // min-heap
//     }

//     static siftUp(heap) {
//         let i = heap.length - 1;
//         while (i > 0) {
//             const parent = (i - 1) >> 1;
//             if (heap[parent] <= heap[i]) break;
//             [heap[parent], heap[i]] = [heap[i], heap[parent]];
//             i = parent;
//         }
//     }

//     static siftDown(heap) {
//         let i = 0;
//         const n = heap.length;
//         while (true) {
//             let smallest = i;
//             const left = 2 * i + 1;
//             const right = 2 * i + 2;
//             if (left < n && heap[left] < heap[smallest]) smallest = left;
//             if (right < n && heap[right] < heap[smallest]) smallest = right;
//             if (smallest === i) break;
//             [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
//             i = smallest;
//         }
//     }

//     static push(heap, val) {
//         heap.push(val);
//         MedianFinder.siftUp(heap);
//     }

//     static pop(heap) {
//         const top = heap[0];
//         const last = heap.pop();
//         if (heap.length > 0) {
//             heap[0] = last;
//             MedianFinder.siftDown(heap);
//         }
//         return top;
//     }

//     addNum(num) {
//         if (this.lowerHalf.length === 0 || num <= -this.lowerHalf[0]) {
//             MedianFinder.push(this.lowerHalf, -num);
//         } else {
//             MedianFinder.push(this.upperHalf, num);
//         }

//         if (this.lowerHalf.length > this.upperHalf.length + 1) {
//             MedianFinder.push(this.upperHalf, -MedianFinder.pop(this.lowerHalf));
//         } else if (this.upperHalf.length > this.lowerHalf.length) {
//             MedianFinder.push(this.lowerHalf, -MedianFinder.pop(this.upperHalf));
//         }
//     }

//     findMedian() {
//         if (this.lowerHalf.length > this.upperHalf.length) {
//             return -this.lowerHalf[0];
//         }
//         return (-this.lowerHalf[0] + this.upperHalf[0]) / 2;
//     }
// }

// const mf = new MedianFinder();

// mf.addNum(1);
// mf.addNum(2);
// console.log(\`Median after adding 1, 2: \${mf.findMedian()}\`);

// mf.addNum(3);
// console.log(\`Median after adding 3: \${mf.findMedian()}\`);

// mf.addNum(10);
// mf.addNum(20);
// console.log(\`Median after adding 10, 20: \${mf.findMedian()}\`);
// `,
//         "c": `#include <stdio.h>

// // Fixed-capacity array-backed heaps for demonstration purposes.
// #define MAX_N 1000

// int lowerHalf[MAX_N]; // max-heap
// int lowerSize = 0;
// int upperHalf[MAX_N]; // min-heap
// int upperSize = 0;

// void siftUpMax(int* heap, int i) {
//     while (i > 0) {
//         int parent = (i - 1) / 2;
//         if (heap[parent] >= heap[i]) break;
//         int t = heap[parent]; heap[parent] = heap[i]; heap[i] = t;
//         i = parent;
//     }
// }

// void siftDownMax(int* heap, int size) {
//     int i = 0;
//     while (1) {
//         int largest = i, left = 2 * i + 1, right = 2 * i + 2;
//         if (left < size && heap[left] > heap[largest]) largest = left;
//         if (right < size && heap[right] > heap[largest]) largest = right;
//         if (largest == i) break;
//         int t = heap[i]; heap[i] = heap[largest]; heap[largest] = t;
//         i = largest;
//     }
// }

// void siftUpMin(int* heap, int i) {
//     while (i > 0) {
//         int parent = (i - 1) / 2;
//         if (heap[parent] <= heap[i]) break;
//         int t = heap[parent]; heap[parent] = heap[i]; heap[i] = t;
//         i = parent;
//     }
// }

// void siftDownMin(int* heap, int size) {
//     int i = 0;
//     while (1) {
//         int smallest = i, left = 2 * i + 1, right = 2 * i + 2;
//         if (left < size && heap[left] < heap[smallest]) smallest = left;
//         if (right < size && heap[right] < heap[smallest]) smallest = right;
//         if (smallest == i) break;
//         int t = heap[i]; heap[i] = heap[smallest]; heap[smallest] = t;
//         i = smallest;
//     }
// }

// void addNum(int num) {
//     if (lowerSize == 0 || num <= lowerHalf[0]) {
//         lowerHalf[lowerSize++] = num;
//         siftUpMax(lowerHalf, lowerSize - 1);
//     } else {
//         upperHalf[upperSize++] = num;
//         siftUpMin(upperHalf, upperSize - 1);
//     }

//     if (lowerSize > upperSize + 1) {
//         int moved = lowerHalf[0];
//         lowerHalf[0] = lowerHalf[--lowerSize];
//         siftDownMax(lowerHalf, lowerSize);
//         upperHalf[upperSize++] = moved;
//         siftUpMin(upperHalf, upperSize - 1);
//     } else if (upperSize > lowerSize) {
//         int moved = upperHalf[0];
//         upperHalf[0] = upperHalf[--upperSize];
//         siftDownMin(upperHalf, upperSize);
//         lowerHalf[lowerSize++] = moved;
//         siftUpMax(lowerHalf, lowerSize - 1);
//     }
// }

// double findMedian() {
//     if (lowerSize > upperSize) {
//         return lowerHalf[0];
//     }
//     return (lowerHalf[0] + upperHalf[0]) / 2.0;
// }

// int main() {
//     addNum(1);
//     addNum(2);
//     printf("Median after adding 1, 2: %.1f\\n", findMedian());

//     addNum(3);
//     printf("Median after adding 3: %.1f\\n", findMedian());

//     addNum(10);
//     addNum(20);
//     printf("Median after adding 10, 20: %.1f\\n", findMedian());

//     return 0;
// }
// `,
//         "c#": `using System;
// using System.Collections.Generic;
// using System.Linq;

// class MedianFinder {
//     List<int> lowerHalf = new List<int>(); // max-heap semantics via sorted list
//     List<int> upperHalf = new List<int>(); // min-heap semantics via sorted list

//     void InsertSorted(List<int> list, int val, bool descending) {
//         int idx = list.BinarySearch(val, descending
//             ? Comparer<int>.Create((a, b) => b.CompareTo(a))
//             : Comparer<int>.Default);
//         if (idx < 0) idx = ~idx;
//         list.Insert(idx, val);
//     }

//     public void AddNum(int num) {
//         if (lowerHalf.Count == 0 || num <= lowerHalf[0]) {
//             InsertSorted(lowerHalf, num, true);
//         } else {
//             InsertSorted(upperHalf, num, false);
//         }

//         if (lowerHalf.Count > upperHalf.Count + 1) {
//             int moved = lowerHalf[0];
//             lowerHalf.RemoveAt(0);
//             InsertSorted(upperHalf, moved, false);
//         } else if (upperHalf.Count > lowerHalf.Count) {
//             int moved = upperHalf[0];
//             upperHalf.RemoveAt(0);
//             InsertSorted(lowerHalf, moved, true);
//         }
//     }

//     public double FindMedian() {
//         if (lowerHalf.Count > upperHalf.Count) {
//             return lowerHalf[0];
//         }
//         return (lowerHalf[0] + upperHalf[0]) / 2.0;
//     }
// }

// class Program {
//     static void Main() {
//         var mf = new MedianFinder();

//         mf.AddNum(1);
//         mf.AddNum(2);
//         Console.WriteLine($"Median after adding 1, 2: {mf.FindMedian()}");

//         mf.AddNum(3);
//         Console.WriteLine($"Median after adding 3: {mf.FindMedian()}");

//         mf.AddNum(10);
//         mf.AddNum(20);
//         Console.WriteLine($"Median after adding 10, 20: {mf.FindMedian()}");
//     }
// }
// `,
//         "swift": `final class MedianFinder {
//     private var lowerHalf: [Int] = [] // max-heap (store negated values)
//     private var upperHalf: [Int] = [] // min-heap

//     private func siftUp(_ heap: inout [Int]) {
//         var i = heap.count - 1
//         while i > 0 {
//             let parent = (i - 1) / 2
//             if heap[parent] <= heap[i] { break }
//             heap.swapAt(parent, i)
//             i = parent
//         }
//     }

//     private func siftDown(_ heap: inout [Int]) {
//         var i = 0
//         let n = heap.count
//         while true {
//             var smallest = i
//             let left = 2 * i + 1
//             let right = 2 * i + 2
//             if left < n && heap[left] < heap[smallest] { smallest = left }
//             if right < n && heap[right] < heap[smallest] { smallest = right }
//             if smallest == i { break }
//             heap.swapAt(i, smallest)
//             i = smallest
//         }
//     }

//     private func push(_ heap: inout [Int], _ val: Int) {
//         heap.append(val)
//         siftUp(&heap)
//     }

//     private func pop(_ heap: inout [Int]) -> Int {
//         let top = heap[0]
//         let last = heap.removeLast()
//         if !heap.isEmpty {
//             heap[0] = last
//             siftDown(&heap)
//         }
//         return top
//     }

//     func addNum(_ num: Int) {
//         if lowerHalf.isEmpty || num <= -lowerHalf[0] {
//             push(&lowerHalf, -num)
//         } else {
//             push(&upperHalf, num)
//         }

//         if lowerHalf.count > upperHalf.count + 1 {
//             push(&upperHalf, -pop(&lowerHalf))
//         } else if upperHalf.count > lowerHalf.count {
//             push(&lowerHalf, -pop(&upperHalf))
//         }
//     }

//     func findMedian() -> Double {
//         if lowerHalf.count > upperHalf.count {
//             return Double(-lowerHalf[0])
//         }
//         return Double(-lowerHalf[0] + upperHalf[0]) / 2.0
//     }
// }

// let mf = MedianFinder()

// mf.addNum(1)
// mf.addNum(2)
// print("Median after adding 1, 2: \\(mf.findMedian())")

// mf.addNum(3)
// print("Median after adding 3: \\(mf.findMedian())")

// mf.addNum(10)
// mf.addNum(20)
// print("Median after adding 10, 20: \\(mf.findMedian())")
// `,
//         "kotlin": `import java.util.PriorityQueue
// import java.util.Collections

// class MedianFinder {
//     private val lowerHalf = PriorityQueue<Int>(Collections.reverseOrder()) // max-heap
//     private val upperHalf = PriorityQueue<Int>()                          // min-heap

//     fun addNum(num: Int) {
//         if (lowerHalf.isEmpty() || num <= lowerHalf.peek()) {
//             lowerHalf.offer(num)
//         } else {
//             upperHalf.offer(num)
//         }

//         if (lowerHalf.size > upperHalf.size + 1) {
//             upperHalf.offer(lowerHalf.poll())
//         } else if (upperHalf.size > lowerHalf.size) {
//             lowerHalf.offer(upperHalf.poll())
//         }
//     }

//     fun findMedian(): Double {
//         return if (lowerHalf.size > upperHalf.size) {
//             lowerHalf.peek().toDouble()
//         } else {
//             (lowerHalf.peek() + upperHalf.peek()) / 2.0
//         }
//     }
// }

// fun main() {
//     val mf = MedianFinder()

//     mf.addNum(1)
//     mf.addNum(2)
//     println("Median after adding 1, 2: \${mf.findMedian()}")

//     mf.addNum(3)
//     println("Median after adding 3: \${mf.findMedian()}")

//     mf.addNum(10)
//     mf.addNum(20)
//     println("Median after adding 10, 20: \${mf.findMedian()}")
// }
// `,
//         "scala": `import scala.collection.mutable

// class MedianFinder {
//     private val lowerHalf = mutable.PriorityQueue[Int]() // max-heap by default
//     private val upperHalf = mutable.PriorityQueue[Int]()(Ordering.Int.reverse) // min-heap

//     def addNum(num: Int): Unit = {
//         if (lowerHalf.isEmpty || num <= lowerHalf.head) {
//             lowerHalf.enqueue(num)
//         } else {
//             upperHalf.enqueue(num)
//         }

//         if (lowerHalf.size > upperHalf.size + 1) {
//             upperHalf.enqueue(lowerHalf.dequeue())
//         } else if (upperHalf.size > lowerHalf.size) {
//             lowerHalf.enqueue(upperHalf.dequeue())
//         }
//     }

//     def findMedian(): Double = {
//         if (lowerHalf.size > upperHalf.size) {
//             lowerHalf.head.toDouble
//         } else {
//             (lowerHalf.head + upperHalf.head) / 2.0
//         }
//     }
// }

// object Main extends App {
//     val mf = new MedianFinder()

//     mf.addNum(1)
//     mf.addNum(2)
//     println(s"Median after adding 1, 2: \${mf.findMedian()}")

//     mf.addNum(3)
//     println(s"Median after adding 3: \${mf.findMedian()}")

//     mf.addNum(10)
//     mf.addNum(20)
//     println(s"Median after adding 10, 20: \${mf.findMedian()}")
// }
// `,
//         "go": `package main

// import (
//     "container/heap"
//     "fmt"
// )

// // MaxHeap for the lower half.
// type MaxHeap []int

// func (h MaxHeap) Len() int            { return len(h) }
// func (h MaxHeap) Less(i, j int) bool  { return h[i] > h[j] }
// func (h MaxHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *MaxHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
// func (h *MaxHeap) Pop() interface{} {
//     old := *h
//     n := len(old)
//     x := old[n-1]
//     *h = old[:n-1]
//     return x
// }

// // MinHeap for the upper half.
// type MinHeap []int

// func (h MinHeap) Len() int            { return len(h) }
// func (h MinHeap) Less(i, j int) bool  { return h[i] < h[j] }
// func (h MinHeap) Swap(i, j int)       { h[i], h[j] = h[j], h[i] }
// func (h *MinHeap) Push(x interface{}) { *h = append(*h, x.(int)) }
// func (h *MinHeap) Pop() interface{} {
//     old := *h
//     n := len(old)
//     x := old[n-1]
//     *h = old[:n-1]
//     return x
// }

// type MedianFinder struct {
//     lowerHalf *MaxHeap
//     upperHalf *MinHeap
// }

// func NewMedianFinder() *MedianFinder {
//     lower := &MaxHeap{}
//     upper := &MinHeap{}
//     heap.Init(lower)
//     heap.Init(upper)
//     return &MedianFinder{lowerHalf: lower, upperHalf: upper}
// }

// func (mf *MedianFinder) AddNum(num int) {
//     if mf.lowerHalf.Len() == 0 || num <= (*mf.lowerHalf)[0] {
//         heap.Push(mf.lowerHalf, num)
//     } else {
//         heap.Push(mf.upperHalf, num)
//     }

//     if mf.lowerHalf.Len() > mf.upperHalf.Len()+1 {
//         moved := heap.Pop(mf.lowerHalf).(int)
//         heap.Push(mf.upperHalf, moved)
//     } else if mf.upperHalf.Len() > mf.lowerHalf.Len() {
//         moved := heap.Pop(mf.upperHalf).(int)
//         heap.Push(mf.lowerHalf, moved)
//     }
// }

// func (mf *MedianFinder) FindMedian() float64 {
//     if mf.lowerHalf.Len() > mf.upperHalf.Len() {
//         return float64((*mf.lowerHalf)[0])
//     }
//     return float64((*mf.lowerHalf)[0]+(*mf.upperHalf)[0]) / 2.0
// }

// func main() {
//     mf := NewMedianFinder()

//     mf.AddNum(1)
//     mf.AddNum(2)
//     fmt.Printf("Median after adding 1, 2: %.1f\\n", mf.FindMedian())

//     mf.AddNum(3)
//     fmt.Printf("Median after adding 3: %.1f\\n", mf.FindMedian())

//     mf.AddNum(10)
//     mf.AddNum(20)
//     fmt.Printf("Median after adding 10, 20: %.1f\\n", mf.FindMedian())
// }
// `,
//         "rust": `use std::cmp::Reverse;
// use std::collections::BinaryHeap;

// struct MedianFinder {
//     lower_half: BinaryHeap<i32>,         // max-heap
//     upper_half: BinaryHeap<Reverse<i32>>, // min-heap
// }

// impl MedianFinder {
//     fn new() -> Self {
//         MedianFinder {
//             lower_half: BinaryHeap::new(),
//             upper_half: BinaryHeap::new(),
//         }
//     }

//     fn add_num(&mut self, num: i32) {
//         let goes_in_lower = match self.lower_half.peek() {
//             None => true,
//             Some(&top) => num <= top,
//         };

//         if goes_in_lower {
//             self.lower_half.push(num);
//         } else {
//             self.upper_half.push(Reverse(num));
//         }

//         if self.lower_half.len() > self.upper_half.len() + 1 {
//             if let Some(moved) = self.lower_half.pop() {
//                 self.upper_half.push(Reverse(moved));
//             }
//         } else if self.upper_half.len() > self.lower_half.len() {
//             if let Some(Reverse(moved)) = self.upper_half.pop() {
//                 self.lower_half.push(moved);
//             }
//         }
//     }

//     fn find_median(&self) -> f64 {
//         if self.lower_half.len() > self.upper_half.len() {
//             *self.lower_half.peek().unwrap() as f64
//         } else {
//             let lower_top = *self.lower_half.peek().unwrap();
//             let upper_top = self.upper_half.peek().unwrap().0;
//             (lower_top + upper_top) as f64 / 2.0
//         }
//     }
// }

// fn main() {
//     let mut mf = MedianFinder::new();

//     mf.add_num(1);
//     mf.add_num(2);
//     println!("Median after adding 1, 2: {}", mf.find_median());

//     mf.add_num(3);
//     println!("Median after adding 3: {}", mf.find_median());

//     mf.add_num(10);
//     mf.add_num(20);
//     println!("Median after adding 10, 20: {}", mf.find_median());
// }
// `
//       }
//     }

//   ],
//   desc: "Min-heap, max-heap, k-way merge, top-k",
//   complexity: "O(log n)",
//   featured: true
// };

// ─────────────────────────────────────────────────────────────────────────── ^
