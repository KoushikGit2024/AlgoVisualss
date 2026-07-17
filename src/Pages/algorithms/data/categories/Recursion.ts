const RECURSION_SECTION = {
  name: "Recursion",
  href: "/algorithms/recursion",
    iconId: "Recursion",
    hoverIconId: "Recursion",

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
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> res;

void generateSubsets(vector<int>& nums, vector<int>& curr, int i) {
    if (i == nums.size()) {
        res.push_back(curr);
        return;
    }

    // Don't take nums[i]
    generateSubsets(nums, curr, i + 1);

    // Take nums[i]
    curr.push_back(nums[i]);
    generateSubsets(nums, curr, i + 1);
    curr.pop_back();
}

int main() {
    vector<int> nums = {1, 2, 3};
    vector<int> curr;
    generateSubsets(nums, curr, 0);

    cout << "Subsets:" << endl;
    for (auto subset : res) {
        cout << "{ ";
        for (int value : subset) cout << value << " ";
        cout << "}" << endl;
    }
    return 0;
}`,
        "python": `res = []

def generate_subsets(nums, curr, i):
    if i == len(nums):
        res.append(list(curr))
        return

    # Don't take nums[i]
    generate_subsets(nums, curr, i + 1)

    # Take nums[i]
    curr.append(nums[i])
    generate_subsets(nums, curr, i + 1)
    curr.pop()

if __name__ == "__main__":
    nums = [1, 2, 3]
    generate_subsets(nums, [], 0)
    print("Subsets:")
    for subset in res:
        print(f"{{ {' '.join(map(str, subset))} }}")`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<List<Integer>> res = new ArrayList<>();

    public static void generateSubsets(int[] nums, List<Integer> curr, int i) {
        if (i == nums.length) {
            res.add(new ArrayList<>(curr));
            return;
        }

        // Don't take nums[i]
        generateSubsets(nums, curr, i + 1);

        // Take nums[i]
        curr.add(nums[i]);
        generateSubsets(nums, curr, i + 1);
        curr.remove(curr.size() - 1);
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        generateSubsets(nums, new ArrayList<>(), 0);

        System.out.println("Subsets:");
        for (List<Integer> subset : res) {
            System.out.print("{ ");
            for (int val : subset) System.out.print(val + " ");
            System.out.println("}");
        }
    }
}`,
        "js": `const res = [];

function generateSubsets(nums, curr, i) {
    if (i === nums.length) {
        res.push([...curr]);
        return;
    }

    // Don't take nums[i]
    generateSubsets(nums, curr, i + 1);

    // Take nums[i]
    curr.push(nums[i]);
    generateSubsets(nums, curr, i + 1);
    curr.pop();
}

const nums = [1, 2, 3];
generateSubsets(nums, [], 0);

console.log("Subsets:");
res.forEach(subset => {
    console.log("{ " + subset.join(" ") + (subset.length ? " " : "") + "}");
});`,
        "c": `#include <stdio.h>
#include <stdlib.h>

void generateSubsets(int* nums, int numsSize, int* curr, int currSize, int i) {
    if (i == numsSize) {
        printf("{ ");
        for (int j = 0; j < currSize; j++) {
            printf("%d ", curr[j]);
        }
        printf("}\\n");
        return;
    }

    // Don't take nums[i]
    generateSubsets(nums, numsSize, curr, currSize, i + 1);

    // Take nums[i]
    curr[currSize] = nums[i];
    generateSubsets(nums, numsSize, curr, currSize + 1, i + 1);
}

int main() {
    int nums[] = {1, 2, 3};
    int curr[3];
    printf("Subsets:\\n");
    generateSubsets(nums, 3, curr, 0, 0);
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static List<List<int>> res = new List<List<int>>();

    static void GenerateSubsets(int[] nums, List<int> curr, int i) {
        if (i == nums.Length) {
            res.Add(new List<int>(curr));
            return;
        }

        // Don't take nums[i]
        GenerateSubsets(nums, curr, i + 1);

        // Take nums[i]
        curr.Add(nums[i]);
        GenerateSubsets(nums, curr, i + 1);
        curr.RemoveAt(curr.Count - 1);
    }

    static void Main() {
        int[] nums = {1, 2, 3};
        GenerateSubsets(nums, new List<int>(), 0);

        Console.WriteLine("Subsets:");
        foreach (var subset in res) {
            Console.WriteLine($"{{ {string.Join(" ", subset)} {(subset.Count > 0 ? "" : "")}}}");
        }
    }
}`,
        "swift": `var res = [[Int]]()

func generateSubsets(_ nums: [Int], _ curr: inout [Int], _ i: Int) {
    if i == nums.count {
        res.append(curr)
        return
    }

    // Don't take nums[i]
    generateSubsets(nums, &curr, i + 1)

    // Take nums[i]
    curr.append(nums[i])
    generateSubsets(nums, &curr, i + 1)
    curr.removeLast()
}

let nums = [1, 2, 3]
var curr = [Int]()
generateSubsets(nums, &curr, 0)

print("Subsets:")
for subset in res {
    let str = subset.map { String($0) }.joined(separator: " ")
    print("{ \\(str)\\(_: subset.isEmpty ? "" : " ")}")
}`,
        "kotlin": `val res = mutableListOf<List<Int>>()

fun generateSubsets(nums: IntArray, curr: MutableList<Int>, i: Int) {
    if (i == nums.size) {
        res.add(curr.toList())
        return
    }

    // Don't take nums[i]
    generateSubsets(nums, curr, i + 1)

    // Take nums[i]
    curr.add(nums[i])
    generateSubsets(nums, curr, i + 1)
    curr.removeAt(curr.size - 1)
}

fun main() {
    val nums = intArrayOf(1, 2, 3)
    generateSubsets(nums, mutableListOf(), 0)

    println("Subsets:")
    for (subset in res) {
        print("{ ")
        for (value in subset) print("$value ")
        println("}")
    }
}`,
        "scala": `import scala.collection.mutable.ListBuffer

object Main extends App {
    val res = ListBuffer[List[Int]]()

    def generateSubsets(nums: Array[Int], curr: ListBuffer[Int], i: Int): Unit = {
        if (i == nums.length) {
            res += curr.toList
            return
        }

        // Don't take nums[i]
        generateSubsets(nums, curr, i + 1)

        // Take nums[i]
        curr += nums(i)
        generateSubsets(nums, curr, i + 1)
        curr.remove(curr.length - 1)
    }

    val nums = Array(1, 2, 3)
    generateSubsets(nums, ListBuffer[Int](), 0)

    println("Subsets:")
    for (subset <- res) {
        println(s"{ \${subset.mkString(" ")} \${if(subset.nonEmpty) " " else ""}}")
    }
}`,
        "go": `package main

import "fmt"

var res [][]int

func generateSubsets(nums []int, curr []int, i int) {
    if i == len(nums) {
        temp := make([]int, len(curr))
        copy(temp, curr)
        res = append(res, temp)
        return
    }

    // Don't take nums[i]
    generateSubsets(nums, curr, i+1)

    // Take nums[i]
    curr = append(curr, nums[i])
    generateSubsets(nums, curr, i+1)
    curr = curr[:len(curr)-1] // Pop
}

func main() {
    nums := []int{1, 2, 3}
    generateSubsets(nums, []int{}, 0)

    fmt.Println("Subsets:")
    for _, subset := range res {
        fmt.Printf("{ ")
        for _, val := range subset {
            fmt.Printf("%d ", val)
        }
        fmt.Printf("}\\n")
    }
}`,
        "rust": `fn generate_subsets(nums: &Vec<i32>, curr: &mut Vec<i32>, i: usize, res: &mut Vec<Vec<i32>>) {
    if i == nums.len() {
        res.push(curr.clone());
        return;
    }

    // Don't take nums[i]
    generate_subsets(nums, curr, i + 1, res);

    // Take nums[i]
    curr.push(nums[i]);
    generate_subsets(nums, curr, i + 1, res);
    curr.pop();
}

fn main() {
    let nums = vec![1, 2, 3];
    let mut curr = Vec::new();
    let mut res = Vec::new();
    
    generate_subsets(&nums, &mut curr, 0, &mut res);

    println!("Subsets:");
    for subset in res {
        print!("{{ ");
        for val in subset {
            print!("{} ", val);
        }
        println!("}}");
    }
}`
      }
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
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

vector<vector<vector<int>>> res;

bool isSafe(vector<vector<int>>& board, int row, int col) {
    for (int r = 0; r < row; r++)
        if (board[r][col] == 1) return false;

    for (int r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--)
        if (board[r][c] == 1) return false;

    for (int r = row - 1, c = col + 1; r >= 0 && c < board.size(); r--, c++)
        if (board[r][c] == 1) return false;

    return true;
}

void solve(vector<vector<int>>& board, int row) {
    if (row == board.size()) {
        res.push_back(board);
        return;
    }

    for (int col = 0; col < board.size(); col++) {
        if (!isSafe(board, row, col)) continue;
        board[row][col] = 1;
        solve(board, row + 1);
        board[row][col] = 0;
    }
}

int main() {
    int n = 4;
    vector<vector<int>> board(n, vector<int>(n, 0));
    solve(board, 0);

    for (auto solution : res) {
        for (auto row : solution) {
            for (int cell : row) cout << cell << " ";
            cout << endl;
        }
        cout << endl;
    }
    return 0;
}`,
        "python": `res = []

def is_safe(board, row, col, n):
    for r in range(row):
        if board[r][col] == 1: return False
    
    r, c = row - 1, col - 1
    while r >= 0 and c >= 0:
        if board[r][c] == 1: return False
        r -= 1; c -= 1
    
    r, c = row - 1, col + 1
    while r >= 0 and c < n:
        if board[r][c] == 1: return False
        r -= 1; c += 1
    
    return True

def solve(board, row, n):
    if row == n:
        res.append([list(r) for r in board])
        return

    for col in range(n):
        if not is_safe(board, row, col, n): continue
        board[row][col] = 1
        solve(board, row + 1, n)
        board[row][col] = 0

if __name__ == "__main__":
    n = 4
    board = [[0]*n for _ in range(n)]
    solve(board, 0, n)
    
    for solution in res:
        for row in solution:
            print(" ".join(map(str, row)))
        print()`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<int[][]> res = new ArrayList<>();

    static boolean isSafe(int[][] board, int row, int col) {
        for (int r = 0; r < row; r++)
            if (board[r][col] == 1) return false;

        for (int r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--)
            if (board[r][c] == 1) return false;

        for (int r = row - 1, c = col + 1; r >= 0 && c < board.length; r--, c++)
            if (board[r][c] == 1) return false;

        return true;
    }

    static void solve(int[][] board, int row) {
        if (row == board.length) {
            int[][] copy = new int[board.length][board.length];
            for (int i = 0; i < board.length; i++)
                System.arraycopy(board[i], 0, copy[i], 0, board.length);
            res.add(copy);
            return;
        }

        for (int col = 0; col < board.length; col++) {
            if (!isSafe(board, row, col)) continue;
            board[row][col] = 1;
            solve(board, row + 1);
            board[row][col] = 0;
        }
    }

    public static void main(String[] args) {
        int n = 4;
        int[][] board = new int[n][n];
        solve(board, 0);

        for (int[][] solution : res) {
            for (int[] row : solution) {
                for (int cell : row) System.out.print(cell + " ");
                System.out.println();
            }
            System.out.println();
        }
    }
}`,
        "js": `const res = [];

function isSafe(board, row, col) {
    for (let r = 0; r < row; r++) {
        if (board[r][col] === 1) return false;
    }
    for (let r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--) {
        if (board[r][c] === 1) return false;
    }
    for (let r = row - 1, c = col + 1; r >= 0 && c < board.length; r--, c++) {
        if (board[r][c] === 1) return false;
    }
    return true;
}

function solve(board, row) {
    if (row === board.length) {
        res.push(board.map(r => [...r]));
        return;
    }

    for (let col = 0; col < board.length; col++) {
        if (!isSafe(board, row, col)) continue;
        board[row][col] = 1;
        solve(board, row + 1);
        board[row][col] = 0;
    }
}

const n = 4;
const board = Array.from({length: n}, () => Array(n).fill(0));
solve(board, 0);

for (const solution of res) {
    for (const r of solution) {
        console.log(r.join(" "));
    }
    console.log("");
}`,
        "c": `#include <stdio.h>

void printBoard(int board[4][4], int n) {
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) {
            printf("%d ", board[r][c]);
        }
        printf("\\n");
    }
    printf("\\n");
}

int isSafe(int board[4][4], int row, int col, int n) {
    for (int r = 0; r < row; r++)
        if (board[r][col] == 1) return 0;

    for (int r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--)
        if (board[r][c] == 1) return 0;

    for (int r = row - 1, c = col + 1; r >= 0 && c < n; r--, c++)
        if (board[r][c] == 1) return 0;

    return 1;
}

void solve(int board[4][4], int row, int n) {
    if (row == n) {
        printBoard(board, n);
        return;
    }

    for (int col = 0; col < n; col++) {
        if (!isSafe(board, row, col, n)) continue;
        board[row][col] = 1;
        solve(board, row + 1, n);
        board[row][col] = 0;
    }
}

int main() {
    int n = 4;
    int board[4][4] = {0};
    solve(board, 0, n);
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static List<int[][]> res = new List<int[][]>();

    static bool IsSafe(int[][] board, int row, int col) {
        for (int r = 0; r < row; r++)
            if (board[r][col] == 1) return false;

        for (int r = row - 1, c = col - 1; r >= 0 && c >= 0; r--, c--)
            if (board[r][c] == 1) return false;

        for (int r = row - 1, c = col + 1; r >= 0 && c < board.Length; r--, c++)
            if (board[r][c] == 1) return false;

        return true;
    }

    static void Solve(int[][] board, int row) {
        if (row == board.Length) {
            int[][] copy = new int[board.Length][];
            for (int i = 0; i < board.Length; i++) {
                copy[i] = new int[board.Length];
                Array.Copy(board[i], copy[i], board.Length);
            }
            res.Add(copy);
            return;
        }

        for (int col = 0; col < board.Length; col++) {
            if (!IsSafe(board, row, col)) continue;
            board[row][col] = 1;
            Solve(board, row + 1);
            board[row][col] = 0;
        }
    }

    static void Main() {
        int n = 4;
        int[][] board = new int[n][];
        for (int i = 0; i < n; i++) board[i] = new int[n];
        Solve(board, 0);

        foreach (var solution in res) {
            foreach (var row in solution) {
                Console.WriteLine(string.Join(" ", row));
            }
            Console.WriteLine();
        }
    }
}`,
        "swift": `var res = [[[Int]]]()

func isSafe(_ board: [[Int]], _ row: Int, _ col: Int) -> Bool {
    let n = board.count
    for r in 0..<row {
        if board[r][col] == 1 { return false }
    }
    
    var r = row - 1, c = col - 1
    while r >= 0 && c >= 0 {
        if board[r][c] == 1 { return false }
        r -= 1; c -= 1
    }
    
    r = row - 1; c = col + 1
    while r >= 0 && c < n {
        if board[r][c] == 1 { return false }
        r -= 1; c += 1
    }
    return true
}

func solve(_ board: inout [[Int]], _ row: Int) {
    let n = board.count
    if row == n {
        res.append(board)
        return
    }

    for col in 0..<n {
        if !isSafe(board, row, col) { continue }
        board[row][col] = 1
        solve(&board, row + 1)
        board[row][col] = 0
    }
}

let n = 4
var board = Array(repeating: Array(repeating: 0, count: n), count: n)
solve(&board, 0)

for solution in res {
    for row in solution {
        print(row.map { String($0) }.joined(separator: " "))
    }
    print()
}`,
        "kotlin": `val res = mutableListOf<Array<IntArray>>()

fun isSafe(board: Array<IntArray>, row: Int, col: Int): Boolean {
    val n = board.size
    for (r in 0 until row) {
        if (board[r][col] == 1) return false
    }
    
    var r = row - 1
    var c = col - 1
    while (r >= 0 && c >= 0) {
        if (board[r][c] == 1) return false
        r--; c--
    }
    
    r = row - 1
    c = col + 1
    while (r >= 0 && c < n) {
        if (board[r][c] == 1) return false
        r--; c++
    }
    return true
}

fun solve(board: Array<IntArray>, row: Int) {
    val n = board.size
    if (row == n) {
        res.add(Array(n) { i -> board[i].clone() })
        return
    }

    for (col in 0 until n) {
        if (!isSafe(board, row, col)) continue
        board[row][col] = 1
        solve(board, row + 1)
        board[row][col] = 0
    }
}

fun main() {
    val n = 4
    val board = Array(n) { IntArray(n) }
    solve(board, 0)

    for (solution in res) {
        for (row in solution) {
            println(row.joinToString(" "))
        }
        println()
    }
}`,
        "scala": `import scala.collection.mutable.ListBuffer

object Main extends App {
    val res = ListBuffer[Array[Array[Int]]]()

    def isSafe(board: Array[Array[Int]], row: Int, col: Int): Boolean = {
        val n = board.length
        for (r <- 0 until row) if (board(r)(col) == 1) return false
        
        var r = row - 1; var c = col - 1
        while (r >= 0 && c >= 0) {
            if (board(r)(c) == 1) return false
            r -= 1; c -= 1
        }
        
        r = row - 1; c = col + 1
        while (r >= 0 && c < n) {
            if (board(r)(c) == 1) return false
            r -= 1; c += 1
        }
        true
    }

    def solve(board: Array[Array[Int]], row: Int): Unit = {
        val n = board.length
        if (row == n) {
            res += board.map(_.clone)
            return
        }

        for (col <- 0 until n) {
            if (isSafe(board, row, col)) {
                board(row)(col) = 1
                solve(board, row + 1)
                board(row)(col) = 0
            }
        }
    }

    val n = 4
    val board = Array.fill(n, n)(0)
    solve(board, 0)

    for (solution <- res) {
        for (row <- solution) {
            println(row.mkString(" "))
        }
        println()
    }
}`,
        "go": `package main

import "fmt"

var res [][][]int

func isSafe(board [][]int, row, col, n int) bool {
    for r := 0; r < row; r++ {
        if board[r][col] == 1 {
            return false
        }
    }
    for r, c := row-1, col-1; r >= 0 && c >= 0; r, c = r-1, c-1 {
        if board[r][c] == 1 {
            return false
        }
    }
    for r, c := row-1, col+1; r >= 0 && c < n; r, c = r-1, c+1 {
        if board[r][c] == 1 {
            return false
        }
    }
    return true
}

func solve(board [][]int, row, n int) {
    if row == n {
        copyBoard := make([][]int, n)
        for i := 0; i < n; i++ {
            copyBoard[i] = make([]int, n)
            copy(copyBoard[i], board[i])
        }
        res = append(res, copyBoard)
        return
    }

    for col := 0; col < n; col++ {
        if !isSafe(board, row, col, n) {
            continue
        }
        board[row][col] = 1
        solve(board, row+1, n)
        board[row][col] = 0
    }
}

func main() {
    n := 4
    board := make([][]int, n)
    for i := range board {
        board[i] = make([]int, n)
    }
    solve(board, 0, n)

    for _, solution := range res {
        for _, row := range solution {
            for _, cell := range row {
                fmt.Printf("%d ", cell)
            }
            fmt.Println()
        }
        fmt.Println()
    }
}`,
        "rust": `fn is_safe(board: &Vec<Vec<i32>>, row: usize, col: usize, n: usize) -> bool {
    for r in 0..row {
        if board[r][col] == 1 { return false; }
    }
    
    let mut r = row as isize - 1;
    let mut c = col as isize - 1;
    while r >= 0 && c >= 0 {
        if board[r as usize][c as usize] == 1 { return false; }
        r -= 1; c -= 1;
    }
    
    let mut r = row as isize - 1;
    let mut c = col as isize + 1;
    while r >= 0 && c < n as isize {
        if board[r as usize][c as usize] == 1 { return false; }
        r -= 1; c += 1;
    }
    true
}

fn solve(board: &mut Vec<Vec<i32>>, row: usize, n: usize, res: &mut Vec<Vec<Vec<i32>>>) {
    if row == n {
        res.push(board.clone());
        return;
    }

    for col in 0..n {
        if !is_safe(board, row, col, n) { continue; }
        board[row][col] = 1;
        solve(board, row + 1, n, res);
        board[row][col] = 0;
    }
}

fn main() {
    let n = 4;
    let mut board = vec![vec![0; n]; n];
    let mut res = Vec::new();
    solve(&mut board, 0, n, &mut res);

    for solution in res {
        for row in solution {
            for cell in row {
                print!("{} ", cell);
            }
            println!();
        }
        println!();
    }
}`
      }
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
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

int rowMask[9] = {0};
int colMask[9] = {0};
int boxMask[9] = {0};

vector<int> emptyRows;
vector<int> emptyCols;

bool solve(vector<vector<int>>& board, int idx) {
    if (idx == emptyRows.size()) return true;

    int r = emptyRows[idx];
    int c = emptyCols[idx];
    int box = (r / 3) * 3 + (c / 3);

    for (int num = 1; num <= 9; num++) {
        int mask = 1 << num;
        if (!(rowMask[r] & mask) && !(colMask[c] & mask) && !(boxMask[box] & mask)) {
            board[r][c] = num;
            rowMask[r] |= mask;
            colMask[c] |= mask;
            boxMask[box] |= mask;

            if (solve(board, idx + 1)) return true;

            board[r][c] = 0;
            rowMask[r] &= ~mask;
            colMask[c] &= ~mask;
            boxMask[box] &= ~mask;
        }
    }
    return false;
}

int main() {
    vector<vector<int>> board = {
        {5,3,0,0,7,0,0,0,0}, {6,0,0,1,9,5,0,0,0}, {0,9,8,0,0,0,0,6,0},
        {8,0,0,0,6,0,0,0,3}, {4,0,0,8,0,3,0,0,1}, {7,0,0,0,2,0,0,0,6},
        {0,6,0,0,0,0,2,8,0}, {0,0,0,4,1,9,0,0,5}, {0,0,0,0,8,0,0,7,9}
    };

    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (board[r][c] != 0) {
                int num = board[r][c];
                int box = (r / 3) * 3 + (c / 3);
                int mask = 1 << num;
                rowMask[r] |= mask;
                colMask[c] |= mask;
                boxMask[box] |= mask;
            } else {
                emptyRows.push_back(r);
                emptyCols.push_back(c);
            }
        }
    }

    solve(board, 0);

    for (auto row : board) {
        for (int cell : row) cout << cell << " ";
        cout << endl;
    }
    return 0;
}`,
        "python": `row_mask = [0]*9
col_mask = [0]*9
box_mask = [0]*9
empty_cells = []

def solve(board, idx):
    if idx == len(empty_cells): return True
    
    r, c = empty_cells[idx]
    box = (r // 3) * 3 + (c // 3)
    
    for num in range(1, 10):
        mask = 1 << num
        if not (row_mask[r] & mask) and not (col_mask[c] & mask) and not (box_mask[box] & mask):
            board[r][c] = num
            row_mask[r] |= mask
            col_mask[c] |= mask
            box_mask[box] |= mask
            
            if solve(board, idx + 1): return True
            
            board[r][c] = 0
            row_mask[r] &= ~mask
            col_mask[c] &= ~mask
            box_mask[box] &= ~mask
    return False

if __name__ == "__main__":
    board = [
        [5,3,0,0,7,0,0,0,0], [6,0,0,1,9,5,0,0,0], [0,9,8,0,0,0,0,6,0],
        [8,0,0,0,6,0,0,0,3], [4,0,0,8,0,3,0,0,1], [7,0,0,0,2,0,0,0,6],
        [0,6,0,0,0,0,2,8,0], [0,0,0,4,1,9,0,0,5], [0,0,0,0,8,0,0,7,9]
    ]
    
    for r in range(9):
        for c in range(9):
            if board[r][c] != 0:
                num = board[r][c]
                box = (r // 3) * 3 + (c // 3)
                mask = 1 << num
                row_mask[r] |= mask
                col_mask[c] |= mask
                box_mask[box] |= mask
            else:
                empty_cells.append((r, c))
                
    solve(board, 0)
    for row in board:
        print(" ".join(map(str, row)))`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {
    static int[] rowMask = new int[9];
    static int[] colMask = new int[9];
    static int[] boxMask = new int[9];
    static List<Integer> emptyRows = new ArrayList<>();
    static List<Integer> emptyCols = new ArrayList<>();

    static boolean solve(int[][] board, int idx) {
        if (idx == emptyRows.size()) return true;

        int r = emptyRows.get(idx);
        int c = emptyCols.get(idx);
        int box = (r / 3) * 3 + (c / 3);

        for (int num = 1; num <= 9; num++) {
            int mask = 1 << num;
            if ((rowMask[r] & mask) == 0 && (colMask[c] & mask) == 0 && (boxMask[box] & mask) == 0) {
                board[r][c] = num;
                rowMask[r] |= mask;
                colMask[c] |= mask;
                boxMask[box] |= mask;

                if (solve(board, idx + 1)) return true;

                board[r][c] = 0;
                rowMask[r] &= ~mask;
                colMask[c] &= ~mask;
                boxMask[box] &= ~mask;
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int[][] board = {
            {5,3,0,0,7,0,0,0,0}, {6,0,0,1,9,5,0,0,0}, {0,9,8,0,0,0,0,6,0},
            {8,0,0,0,6,0,0,0,3}, {4,0,0,8,0,3,0,0,1}, {7,0,0,0,2,0,0,0,6},
            {0,6,0,0,0,0,2,8,0}, {0,0,0,4,1,9,0,0,5}, {0,0,0,0,8,0,0,7,9}
        };

        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] != 0) {
                    int mask = 1 << board[r][c];
                    rowMask[r] |= mask;
                    colMask[c] |= mask;
                    boxMask[(r / 3) * 3 + (c / 3)] |= mask;
                } else {
                    emptyRows.add(r);
                    emptyCols.add(c);
                }
            }
        }

        solve(board, 0);

        for (int[] row : board) {
            for (int cell : row) System.out.print(cell + " ");
            System.out.println();
        }
    }
}`,
        "js": `const rowMask = new Int32Array(9);
const colMask = new Int32Array(9);
const boxMask = new Int32Array(9);
const emptyCells = [];

function solve(board, idx) {
    if (idx === emptyCells.length) return true;

    const [r, c] = emptyCells[idx];
    const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);

    for (let num = 1; num <= 9; num++) {
        const mask = 1 << num;
        if (!(rowMask[r] & mask) && !(colMask[c] & mask) && !(boxMask[box] & mask)) {
            board[r][c] = num;
            rowMask[r] |= mask;
            colMask[c] |= mask;
            boxMask[box] |= mask;

            if (solve(board, idx + 1)) return true;

            board[r][c] = 0;
            rowMask[r] &= ~mask;
            colMask[c] &= ~mask;
            boxMask[box] &= ~mask;
        }
    }
    return false;
}

const board = [
    [5,3,0,0,7,0,0,0,0], [6,0,0,1,9,5,0,0,0], [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3], [4,0,0,8,0,3,0,0,1], [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0], [0,0,0,4,1,9,0,0,5], [0,0,0,0,8,0,0,7,9]
];

for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
        if (board[r][c] !== 0) {
            const mask = 1 << board[r][c];
            rowMask[r] |= mask;
            colMask[c] |= mask;
            boxMask[Math.floor(r / 3) * 3 + Math.floor(c / 3)] |= mask;
        } else {
            emptyCells.push([r, c]);
        }
    }
}

solve(board, 0);
board.forEach(row => console.log(row.join(" ")));`,
        "c": `#include <stdio.h>

int rowMask[9] = {0};
int colMask[9] = {0};
int boxMask[9] = {0};

int emptyRows[81];
int emptyCols[81];
int emptyCount = 0;

int solve(int board[9][9], int idx) {
    if (idx == emptyCount) return 1;

    int r = emptyRows[idx];
    int c = emptyCols[idx];
    int box = (r / 3) * 3 + (c / 3);

    for (int num = 1; num <= 9; num++) {
        int mask = 1 << num;
        if (!(rowMask[r] & mask) && !(colMask[c] & mask) && !(boxMask[box] & mask)) {
            board[r][c] = num;
            rowMask[r] |= mask;
            colMask[c] |= mask;
            boxMask[box] |= mask;

            if (solve(board, idx + 1)) return 1;

            board[r][c] = 0;
            rowMask[r] &= ~mask;
            colMask[c] &= ~mask;
            boxMask[box] &= ~mask;
        }
    }
    return 0;
}

int main() {
    int board[9][9] = {
        {5,3,0,0,7,0,0,0,0}, {6,0,0,1,9,5,0,0,0}, {0,9,8,0,0,0,0,6,0},
        {8,0,0,0,6,0,0,0,3}, {4,0,0,8,0,3,0,0,1}, {7,0,0,0,2,0,0,0,6},
        {0,6,0,0,0,0,2,8,0}, {0,0,0,4,1,9,0,0,5}, {0,0,0,0,8,0,0,7,9}
    };

    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            if (board[r][c] != 0) {
                int mask = 1 << board[r][c];
                rowMask[r] |= mask;
                colMask[c] |= mask;
                boxMask[(r / 3) * 3 + (c / 3)] |= mask;
            } else {
                emptyRows[emptyCount] = r;
                emptyCols[emptyCount] = c;
                emptyCount++;
            }
        }
    }

    solve(board, 0);

    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            printf("%d ", board[r][c]);
        }
        printf("\\n");
    }
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static int[] rowMask = new int[9];
    static int[] colMask = new int[9];
    static int[] boxMask = new int[9];
    static List<int> emptyRows = new List<int>();
    static List<int> emptyCols = new List<int>();

    static bool Solve(int[][] board, int idx) {
        if (idx == emptyRows.Count) return true;

        int r = emptyRows[idx];
        int c = emptyCols[idx];
        int box = (r / 3) * 3 + (c / 3);

        for (int num = 1; num <= 9; num++) {
            int mask = 1 << num;
            if ((rowMask[r] & mask) == 0 && (colMask[c] & mask) == 0 && (boxMask[box] & mask) == 0) {
                board[r][c] = num;
                rowMask[r] |= mask;
                colMask[c] |= mask;
                boxMask[box] |= mask;

                if (Solve(board, idx + 1)) return true;

                board[r][c] = 0;
                rowMask[r] &= ~mask;
                colMask[c] &= ~mask;
                boxMask[box] &= ~mask;
            }
        }
        return false;
    }

    static void Main() {
        int[][] board = new int[][] {
            new int[] {5,3,0,0,7,0,0,0,0}, new int[] {6,0,0,1,9,5,0,0,0}, new int[] {0,9,8,0,0,0,0,6,0},
            new int[] {8,0,0,0,6,0,0,0,3}, new int[] {4,0,0,8,0,3,0,0,1}, new int[] {7,0,0,0,2,0,0,0,6},
            new int[] {0,6,0,0,0,0,2,8,0}, new int[] {0,0,0,4,1,9,0,0,5}, new int[] {0,0,0,0,8,0,0,7,9}
        };

        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] != 0) {
                    int mask = 1 << board[r][c];
                    rowMask[r] |= mask;
                    colMask[c] |= mask;
                    boxMask[(r / 3) * 3 + (c / 3)] |= mask;
                } else {
                    emptyRows.Add(r);
                    emptyCols.Add(c);
                }
            }
        }

        Solve(board, 0);

        foreach (var row in board) {
            Console.WriteLine(string.Join(" ", row));
        }
    }
}`,
        "swift": `var rowMask = Array(repeating: 0, count: 9)
var colMask = Array(repeating: 0, count: 9)
var boxMask = Array(repeating: 0, count: 9)
var emptyCells = [(Int, Int)]()

func solve(_ board: inout [[Int]], _ idx: Int) -> Bool {
    if idx == emptyCells.count { return true }

    let r = emptyCells[idx].0
    let c = emptyCells[idx].1
    let box = (r / 3) * 3 + (c / 3)

    for num in 1...9 {
        let mask = 1 << num
        if (rowMask[r] & mask) == 0 && (colMask[c] & mask) == 0 && (boxMask[box] & mask) == 0 {
            board[r][c] = num
            rowMask[r] |= mask
            colMask[c] |= mask
            boxMask[box] |= mask

            if solve(&board, idx + 1) { return true }

            board[r][c] = 0
            rowMask[r] &= ~mask
            colMask[c] &= ~mask
            boxMask[box] &= ~mask
        }
    }
    return false
}

var board = [
    [5,3,0,0,7,0,0,0,0], [6,0,0,1,9,5,0,0,0], [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3], [4,0,0,8,0,3,0,0,1], [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0], [0,0,0,4,1,9,0,0,5], [0,0,0,0,8,0,0,7,9]
]

for r in 0..<9 {
    for c in 0..<9 {
        if board[r][c] != 0 {
            let mask = 1 << board[r][c]
            rowMask[r] |= mask
            colMask[c] |= mask
            boxMask[(r / 3) * 3 + (c / 3)] |= mask
        } else {
            emptyCells.append((r, c))
        }
    }
}

_ = solve(&board, 0)
for row in board {
    print(row.map { String($0) }.joined(separator: " "))
}`,
        "kotlin": `val rowMask = IntArray(9)
val colMask = IntArray(9)
val boxMask = IntArray(9)
val emptyRows = mutableListOf<Int>()
val emptyCols = mutableListOf<Int>()

fun solve(board: Array<IntArray>, idx: Int): Boolean {
    if (idx == emptyRows.size) return true

    val r = emptyRows[idx]
    val c = emptyCols[idx]
    val box = (r / 3) * 3 + (c / 3)

    for (num in 1..9) {
        val mask = 1 shl num
        if ((rowMask[r] and mask) == 0 && (colMask[c] and mask) == 0 && (boxMask[box] and mask) == 0) {
            board[r][c] = num
            rowMask[r] = rowMask[r] or mask
            colMask[c] = colMask[c] or mask
            boxMask[box] = boxMask[box] or mask

            if (solve(board, idx + 1)) return true

            board[r][c] = 0
            rowMask[r] = rowMask[r] and mask.inv()
            colMask[c] = colMask[c] and mask.inv()
            boxMask[box] = boxMask[box] and mask.inv()
        }
    }
    return false
}

fun main() {
    val board = arrayOf(
        intArrayOf(5,3,0,0,7,0,0,0,0), intArrayOf(6,0,0,1,9,5,0,0,0), intArrayOf(0,9,8,0,0,0,0,6,0),
        intArrayOf(8,0,0,0,6,0,0,0,3), intArrayOf(4,0,0,8,0,3,0,0,1), intArrayOf(7,0,0,0,2,0,0,0,6),
        intArrayOf(0,6,0,0,0,0,2,8,0), intArrayOf(0,0,0,4,1,9,0,0,5), intArrayOf(0,0,0,0,8,0,0,7,9)
    )

    for (r in 0..8) {
        for (c in 0..8) {
            if (board[r][c] != 0) {
                val mask = 1 shl board[r][c]
                rowMask[r] = rowMask[r] or mask
                colMask[c] = colMask[c] or mask
                boxMask[(r / 3) * 3 + (c / 3)] = boxMask[(r / 3) * 3 + (c / 3)] or mask
            } else {
                emptyRows.add(r)
                emptyCols.add(c)
            }
        }
    }

    solve(board, 0)
    for (row in board) {
        println(row.joinToString(" "))
    }
}`,
        "scala": `object Main extends App {
    val rowMask = Array.fill(9)(0)
    val colMask = Array.fill(9)(0)
    val boxMask = Array.fill(9)(0)
    val emptyCells = scala.collection.mutable.ArrayBuffer[(Int, Int)]()

    def solve(board: Array[Array[Int]], idx: Int): Boolean = {
        if (idx == emptyCells.length) return true

        val (r, c) = emptyCells(idx)
        val box = (r / 3) * 3 + (c / 3)

        for (num <- 1 to 9) {
            val mask = 1 << num
            if ((rowMask(r) & mask) == 0 && (colMask(c) & mask) == 0 && (boxMask(box) & mask) == 0) {
                board(r)(c) = num
                rowMask(r) |= mask
                colMask(c) |= mask
                boxMask(box) |= mask

                if (solve(board, idx + 1)) return true

                board(r)(c) = 0
                rowMask(r) &= ~mask
                colMask(c) &= ~mask
                boxMask(box) &= ~mask
            }
        }
        false
    }

    val board = Array(
        Array(5,3,0,0,7,0,0,0,0), Array(6,0,0,1,9,5,0,0,0), Array(0,9,8,0,0,0,0,6,0),
        Array(8,0,0,0,6,0,0,0,3), Array(4,0,0,8,0,3,0,0,1), Array(7,0,0,0,2,0,0,0,6),
        Array(0,6,0,0,0,0,2,8,0), Array(0,0,0,4,1,9,0,0,5), Array(0,0,0,0,8,0,0,7,9)
    )

    for (r <- 0 until 9; c <- 0 until 9) {
        if (board(r)(c) != 0) {
            val mask = 1 << board(r)(c)
            rowMask(r) |= mask
            colMask(c) |= mask
            boxMask((r / 3) * 3 + (c / 3)) |= mask
        } else {
            emptyCells.append((r, c))
        }
    }

    solve(board, 0)
    board.foreach(r => println(r.mkString(" ")))
}`,
        "go": `package main

import "fmt"

var rowMask, colMask, boxMask [9]int
var emptyCells [][2]int

func solve(board [][]int, idx int) bool {
    if idx == len(emptyCells) {
        return true
    }

    r, c := emptyCells[idx][0], emptyCells[idx][1]
    box := (r/3)*3 + (c / 3)

    for num := 1; num <= 9; num++ {
        mask := 1 << num
        if rowMask[r]&mask == 0 && colMask[c]&mask == 0 && boxMask[box]&mask == 0 {
            board[r][c] = num
            rowMask[r] |= mask
            colMask[c] |= mask
            boxMask[box] |= mask

            if solve(board, idx+1) {
                return true
            }

            board[r][c] = 0
            rowMask[r] &= ^mask
            colMask[c] &= ^mask
            boxMask[box] &= ^mask
        }
    }
    return false
}

func main() {
    board := [][]int{
        {5, 3, 0, 0, 7, 0, 0, 0, 0}, {6, 0, 0, 1, 9, 5, 0, 0, 0}, {0, 9, 8, 0, 0, 0, 0, 6, 0},
        {8, 0, 0, 0, 6, 0, 0, 0, 3}, {4, 0, 0, 8, 0, 3, 0, 0, 1}, {7, 0, 0, 0, 2, 0, 0, 0, 6},
        {0, 6, 0, 0, 0, 0, 2, 8, 0}, {0, 0, 0, 4, 1, 9, 0, 0, 5}, {0, 0, 0, 0, 8, 0, 0, 7, 9},
    }

    for r := 0; r < 9; r++ {
        for c := 0; c < 9; c++ {
            if board[r][c] != 0 {
                mask := 1 << board[r][c]
                rowMask[r] |= mask
                colMask[c] |= mask
                boxMask[(r/3)*3+(c/3)] |= mask
            } else {
                emptyCells = append(emptyCells, [2]int{r, c})
            }
        }
    }

    solve(board, 0)
    for _, row := range board {
        for _, val := range row {
            fmt.Printf("%d ", val)
        }
        fmt.Println()
    }
}`,
        "rust": `fn solve(
    board: &mut Vec<Vec<i32>>,
    idx: usize,
    empty_cells: &Vec<(usize, usize)>,
    row_mask: &mut [i32; 9],
    col_mask: &mut [i32; 9],
    box_mask: &mut [i32; 9]
) -> bool {
    if idx == empty_cells.len() { return true; }

    let (r, c) = empty_cells[idx];
    let bx = (r / 3) * 3 + (c / 3);

    for num in 1..=9 {
        let mask = 1 << num;
        if (row_mask[r] & mask) == 0 && (col_mask[c] & mask) == 0 && (box_mask[bx] & mask) == 0 {
            board[r][c] = num;
            row_mask[r] |= mask;
            col_mask[c] |= mask;
            box_mask[bx] |= mask;

            if solve(board, idx + 1, empty_cells, row_mask, col_mask, box_mask) {
                return true;
            }

            board[r][c] = 0;
            row_mask[r] &= !mask;
            col_mask[c] &= !mask;
            box_mask[bx] &= !mask;
        }
    }
    false
}

fn main() {
    let mut board = vec![
        vec![5,3,0,0,7,0,0,0,0], vec![6,0,0,1,9,5,0,0,0], vec![0,9,8,0,0,0,0,6,0],
        vec![8,0,0,0,6,0,0,0,3], vec![4,0,0,8,0,3,0,0,1], vec![7,0,0,0,2,0,0,0,6],
        vec![0,6,0,0,0,0,2,8,0], vec![0,0,0,4,1,9,0,0,5], vec![0,0,0,0,8,0,0,7,9]
    ];

    let mut row_mask = [0; 9];
    let mut col_mask = [0; 9];
    let mut box_mask = [0; 9];
    let mut empty_cells = Vec::new();

    for r in 0..9 {
        for c in 0..9 {
            if board[r][c] != 0 {
                let mask = 1 << board[r][c];
                row_mask[r] |= mask;
                col_mask[c] |= mask;
                box_mask[(r / 3) * 3 + (c / 3)] |= mask;
            } else {
                empty_cells.push((r, c));
            }
        }
    }

    solve(&mut board, 0, &empty_cells, &mut row_mask, &mut col_mask, &mut box_mask);

    for row in board {
        for cell in row {
            print!("{} ", cell);
        }
        println!();
    }
}`
      }
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
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

vector<vector<int>> res;

void generatePermutations(vector<int>& nums, int curr) {
    if (curr == nums.size()) {
        res.push_back(nums);
        return;
    }
    for (int i = curr; i < nums.size(); i++) {
        swap(nums[curr], nums[i]);
        generatePermutations(nums, curr + 1);
        swap(nums[curr], nums[i]);
    }
}

int main() {
    vector<int> nums = {1, 2, 3};
    generatePermutations(nums, 0);

    cout << "Permutations:" << endl;
    for (auto permutation : res) {
        cout << "{ ";
        for (int value : permutation) cout << value << " ";
        cout << "}" << endl;
    }
    return 0;
}`,
        "python": `res = []

def generate_permutations(nums, curr):
    if curr == len(nums):
        res.append(list(nums))
        return
    for i in range(curr, len(nums)):
        nums[curr], nums[i] = nums[i], nums[curr]
        generate_permutations(nums, curr + 1)
        nums[curr], nums[i] = nums[i], nums[curr]

if __name__ == "__main__":
    nums = [1, 2, 3]
    generate_permutations(nums, 0)
    print("Permutations:")
    for perm in res:
        print(f"{{ {' '.join(map(str, perm))} }}")`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<List<Integer>> res = new ArrayList<>();

    static void swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    static void generatePermutations(int[] nums, int curr) {
        if (curr == nums.length) {
            List<Integer> perm = new ArrayList<>();
            for (int n : nums) perm.add(n);
            res.add(perm);
            return;
        }
        for (int i = curr; i < nums.length; i++) {
            swap(nums, curr, i);
            generatePermutations(nums, curr + 1);
            swap(nums, curr, i);
        }
    }

    public static void main(String[] args) {
        int[] nums = {1, 2, 3};
        generatePermutations(nums, 0);

        System.out.println("Permutations:");
        for (List<Integer> perm : res) {
            System.out.print("{ ");
            for (int val : perm) System.out.print(val + " ");
            System.out.println("}");
        }
    }
}`,
        "js": `const res = [];

function swap(nums, i, j) {
    const temp = nums[i];
    nums[i] = nums[j];
    nums[j] = temp;
}

function generatePermutations(nums, curr) {
    if (curr === nums.length) {
        res.push([...nums]);
        return;
    }
    for (let i = curr; i < nums.length; i++) {
        swap(nums, curr, i);
        generatePermutations(nums, curr + 1);
        swap(nums, curr, i);
    }
}

const nums = [1, 2, 3];
generatePermutations(nums, 0);

console.log("Permutations:");
res.forEach(perm => {
    console.log("{ " + perm.join(" ") + " }");
});`,
        "c": `#include <stdio.h>

void swap(int* a, int* b) {
    int t = *a;
    *a = *b;
    *b = t;
}

void generatePermutations(int* nums, int size, int curr) {
    if (curr == size) {
        printf("{ ");
        for (int i = 0; i < size; i++) {
            printf("%d ", nums[i]);
        }
        printf("}\\n");
        return;
    }
    for (int i = curr; i < size; i++) {
        swap(&nums[curr], &nums[i]);
        generatePermutations(nums, size, curr + 1);
        swap(&nums[curr], &nums[i]);
    }
}

int main() {
    int nums[] = {1, 2, 3};
    printf("Permutations:\\n");
    generatePermutations(nums, 3, 0);
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static List<List<int>> res = new List<List<int>>();

    static void Swap(int[] nums, int i, int j) {
        int temp = nums[i];
        nums[i] = nums[j];
        nums[j] = temp;
    }

    static void GeneratePermutations(int[] nums, int curr) {
        if (curr == nums.Length) {
            res.Add(new List<int>(nums));
            return;
        }
        for (int i = curr; i < nums.Length; i++) {
            Swap(nums, curr, i);
            GeneratePermutations(nums, curr + 1);
            Swap(nums, curr, i);
        }
    }

    static void Main() {
        int[] nums = {1, 2, 3};
        GeneratePermutations(nums, 0);

        Console.WriteLine("Permutations:");
        foreach (var perm in res) {
            Console.WriteLine($"{{ {string.Join(" ", perm)} }}");
        }
    }
}`,
        "swift": `var res = [[Int]]()

func generatePermutations(_ nums: inout [Int], _ curr: Int) {
    if curr == nums.count {
        res.append(nums)
        return
    }
    for i in curr..<nums.count {
        nums.swapAt(curr, i)
        generatePermutations(&nums, curr + 1)
        nums.swapAt(curr, i)
    }
}

var nums = [1, 2, 3]
generatePermutations(&nums, 0)

print("Permutations:")
for perm in res {
    print("{ \\(perm.map { String($0) }.joined(separator: " ")) }")
}`,
        "kotlin": `val res = mutableListOf<List<Int>>()

fun generatePermutations(nums: IntArray, curr: Int) {
    if (curr == nums.size) {
        res.add(nums.toList())
        return
    }
    for (i in curr until nums.size) {
        val temp = nums[curr]
        nums[curr] = nums[i]
        nums[i] = temp
        
        generatePermutations(nums, curr + 1)
        
        nums[i] = nums[curr]
        nums[curr] = temp
    }
}

fun main() {
    val nums = intArrayOf(1, 2, 3)
    generatePermutations(nums, 0)

    println("Permutations:")
    for (perm in res) {
        println("{ \${perm.joinToString(" ")} }")
    }
}`,
        "scala": `import scala.collection.mutable.ListBuffer

object Main extends App {
    val res = ListBuffer[List[Int]]()

    def generatePermutations(nums: Array[Int], curr: Int): Unit = {
        if (curr == nums.length) {
            res += nums.toList
            return
        }
        for (i <- curr until nums.length) {
            val temp = nums(curr)
            nums(curr) = nums(i)
            nums(i) = temp
            
            generatePermutations(nums, curr + 1)
            
            nums(i) = nums(curr)
            nums(curr) = temp
        }
    }

    val nums = Array(1, 2, 3)
    generatePermutations(nums, 0)

    println("Permutations:")
    for (perm <- res) {
        println(s"{ \${perm.mkString(" ")} }")
    }
}`,
        "go": `package main

import "fmt"

var res [][]int

func generatePermutations(nums []int, curr int) {
    if curr == len(nums) {
        temp := make([]int, len(nums))
        copy(temp, nums)
        res = append(res, temp)
        return
    }
    for i := curr; i < len(nums); i++ {
        nums[curr], nums[i] = nums[i], nums[curr]
        generatePermutations(nums, curr+1)
        nums[curr], nums[i] = nums[i], nums[curr]
    }
}

func main() {
    nums := []int{1, 2, 3}
    generatePermutations(nums, 0)

    fmt.Println("Permutations:")
    for _, perm := range res {
        fmt.Printf("{ ")
        for _, val := range perm {
            fmt.Printf("%d ", val)
        }
        fmt.Printf("}\\n")
    }
}`,
        "rust": `fn generate_permutations(nums: &mut Vec<i32>, curr: usize, res: &mut Vec<Vec<i32>>) {
    if curr == nums.len() {
        res.push(nums.clone());
        return;
    }
    for i in curr..nums.len() {
        nums.swap(curr, i);
        generate_permutations(nums, curr + 1, res);
        nums.swap(curr, i);
    }
}

fn main() {
    let mut nums = vec![1, 2, 3];
    let mut res = Vec::new();
    generate_permutations(&mut nums, 0, &mut res);

    println!("Permutations:");
    for perm in res {
        print!("{{ ");
        for val in perm {
            print!("{} ", val);
        }
        println!("}}");
    }
}`
      }
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
      ],
      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> res;

void combinationSum(vector<int>& nums, vector<int>& curr, int i, int sum) {
    if (sum == 0) {
        res.push_back(curr);
        return;
    }
    if (i == nums.size() || sum < 0) return;

    // Take current number
    curr.push_back(nums[i]);
    combinationSum(nums, curr, i, sum - nums[i]);
    curr.pop_back();

    // Skip current number
    combinationSum(nums, curr, i + 1, sum);
}

int main() {
    vector<int> nums = {2, 3, 6, 7};
    int sum = 7;
    vector<int> curr;
    combinationSum(nums, curr, 0, sum);

    cout << "Combinations:" << endl;
    for (auto combination : res) {
        cout << "{ ";
        for (int value : combination) cout << value << " ";
        cout << "}" << endl;
    }
    return 0;
}`,
        "python": `res = []

def combination_sum(nums, curr, i, target):
    if target == 0:
        res.append(list(curr))
        return
    if i == len(nums) or target < 0:
        return

    # Take current number
    curr.append(nums[i])
    combination_sum(nums, curr, i, target - nums[i])
    curr.pop()

    # Skip current number
    combination_sum(nums, curr, i + 1, target)

if __name__ == "__main__":
    nums = [2, 3, 6, 7]
    target = 7
    combination_sum(nums, [], 0, target)

    print("Combinations:")
    for combo in res:
        print(f"{{ {' '.join(map(str, combo))} }}")`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {
    static List<List<Integer>> res = new ArrayList<>();

    static void combinationSum(int[] nums, List<Integer> curr, int i, int sum) {
        if (sum == 0) {
            res.add(new ArrayList<>(curr));
            return;
        }
        if (i == nums.length || sum < 0) return;

        // Take current number
        curr.add(nums[i]);
        combinationSum(nums, curr, i, sum - nums[i]);
        curr.remove(curr.size() - 1);

        // Skip current number
        combinationSum(nums, curr, i + 1, sum);
    }

    public static void main(String[] args) {
        int[] nums = {2, 3, 6, 7};
        int sum = 7;
        combinationSum(nums, new ArrayList<>(), 0, sum);

        System.out.println("Combinations:");
        for (List<Integer> combination : res) {
            System.out.print("{ ");
            for (int val : combination) System.out.print(val + " ");
            System.out.println("}");
        }
    }
}`,
        "js": `const res = [];

function combinationSum(nums, curr, i, sum) {
    if (sum === 0) {
        res.push([...curr]);
        return;
    }
    if (i === nums.length || sum < 0) return;

    // Take current number
    curr.push(nums[i]);
    combinationSum(nums, curr, i, sum - nums[i]);
    curr.pop();

    // Skip current number
    combinationSum(nums, curr, i + 1, sum);
}

const nums = [2, 3, 6, 7];
const sum = 7;
combinationSum(nums, [], 0, sum);

console.log("Combinations:");
res.forEach(combination => {
    console.log("{ " + combination.join(" ") + " }");
});`,
        "c": `#include <stdio.h>

void combinationSum(int* nums, int numsSize, int* curr, int currSize, int i, int sum) {
    if (sum == 0) {
        printf("{ ");
        for (int j = 0; j < currSize; j++) {
            printf("%d ", curr[j]);
        }
        printf("}\\n");
        return;
    }
    if (i == numsSize || sum < 0) return;

    // Take current number
    curr[currSize] = nums[i];
    combinationSum(nums, numsSize, curr, currSize + 1, i, sum - nums[i]);

    // Skip current number
    combinationSum(nums, numsSize, curr, currSize, i + 1, sum);
}

int main() {
    int nums[] = {2, 3, 6, 7};
    int sum = 7;
    int curr[100]; // Assuming max combination length < 100
    printf("Combinations:\\n");
    combinationSum(nums, 4, curr, 0, 0, sum);
    return 0;
}`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    static List<List<int>> res = new List<List<int>>();

    static void CombinationSum(int[] nums, List<int> curr, int i, int sum) {
        if (sum == 0) {
            res.Add(new List<int>(curr));
            return;
        }
        if (i == nums.Length || sum < 0) return;

        // Take current number
        curr.Add(nums[i]);
        CombinationSum(nums, curr, i, sum - nums[i]);
        curr.RemoveAt(curr.Count - 1);

        // Skip current number
        CombinationSum(nums, curr, i + 1, sum);
    }

    static void Main() {
        int[] nums = {2, 3, 6, 7};
        int sum = 7;
        CombinationSum(nums, new List<int>(), 0, sum);

        Console.WriteLine("Combinations:");
        foreach (var combination in res) {
            Console.WriteLine($"{{ {string.Join(" ", combination)} }}");
        }
    }
}`,
        "swift": `var res = [[Int]]()

func combinationSum(_ nums: [Int], _ curr: inout [Int], _ i: Int, _ sum: Int) {
    if sum == 0 {
        res.append(curr)
        return
    }
    if i == nums.count || sum < 0 { return }

    // Take current number
    curr.append(nums[i])
    combinationSum(nums, &curr, i, sum - nums[i])
    curr.removeLast()

    // Skip current number
    combinationSum(nums, &curr, i + 1, sum)
}

let nums = [2, 3, 6, 7]
let sum = 7
var curr = [Int]()
combinationSum(nums, &curr, 0, sum)

print("Combinations:")
for combination in res {
    print("{ \\(combination.map { String($0) }.joined(separator: " ")) }")
}`,
        "kotlin": `val res = mutableListOf<List<Int>>()

fun combinationSum(nums: IntArray, curr: MutableList<Int>, i: Int, sum: Int) {
    if (sum == 0) {
        res.add(curr.toList())
        return
    }
    if (i == nums.size || sum < 0) return

    // Take current number
    curr.add(nums[i])
    combinationSum(nums, curr, i, sum - nums[i])
    curr.removeAt(curr.size - 1)

    // Skip current number
    combinationSum(nums, curr, i + 1, sum)
}

fun main() {
    val nums = intArrayOf(2, 3, 6, 7)
    val sum = 7
    combinationSum(nums, mutableListOf(), 0, sum)

    println("Combinations:")
    for (combination in res) {
        println("{ \${combination.joinToString(" ")} }")
    }
}`,
        "scala": `import scala.collection.mutable.ListBuffer

object Main extends App {
    val res = ListBuffer[List[Int]]()

    def combinationSum(nums: Array[Int], curr: ListBuffer[Int], i: Int, sum: Int): Unit = {
        if (sum == 0) {
            res += curr.toList
            return
        }
        if (i == nums.length || sum < 0) return

        // Take current number
        curr += nums(i)
        combinationSum(nums, curr, i, sum - nums(i))
        curr.remove(curr.length - 1)

        // Skip current number
        combinationSum(nums, curr, i + 1, sum)
    }

    val nums = Array(2, 3, 6, 7)
    val sum = 7
    combinationSum(nums, ListBuffer[Int](), 0, sum)

    println("Combinations:")
    for (combination <- res) {
        println(s"{ \${combination.mkString(" ")} }")
    }
}`,
        "go": `package main

import "fmt"

var res [][]int

func combinationSum(nums []int, curr []int, i int, sum int) {
    if sum == 0 {
        temp := make([]int, len(curr))
        copy(temp, curr)
        res = append(res, temp)
        return
    }
    if i == len(nums) || sum < 0 {
        return
    }

    // Take current number
    curr = append(curr, nums[i])
    combinationSum(nums, curr, i, sum-nums[i])
    curr = curr[:len(curr)-1]

    // Skip current number
    combinationSum(nums, curr, i+1, sum)
}

func main() {
    nums := []int{2, 3, 6, 7}
    sum := 7
    combinationSum(nums, []int{}, 0, sum)

    fmt.Println("Combinations:")
    for _, combination := range res {
        fmt.Printf("{ ")
        for _, val := range combination {
            fmt.Printf("%d ", val)
        }
        fmt.Printf("}\\n")
    }
}`,
        "rust": `fn combination_sum(nums: &Vec<i32>, curr: &mut Vec<i32>, i: usize, sum: i32, res: &mut Vec<Vec<i32>>) {
    if sum == 0 {
        res.push(curr.clone());
        return;
    }
    if i == nums.len() || sum < 0 {
        return;
    }

    // Take current number
    curr.push(nums[i]);
    combination_sum(nums, curr, i, sum - nums[i], res);
    curr.pop();

    // Skip current number
    combination_sum(nums, curr, i + 1, sum, res);
}

fn main() {
    let nums = vec![2, 3, 6, 7];
    let sum = 7;
    let mut curr = Vec::new();
    let mut res = Vec::new();

    combination_sum(&nums, &mut curr, 0, sum, &mut res);

    println!("Combinations:");
    for combination in res {
        print!("{{ ");
        for val in combination {
            print!("{} ", val);
        }
        println!("}}");
    }
}`
      }
    }

  ],
  desc: "Backtracking, permutations, divide & conquer",
  complexity: "O(2ⁿ)",
  featured: true,
};

export default RECURSION_SECTION;
