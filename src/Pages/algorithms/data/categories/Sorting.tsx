const SORTING_SECTION = {
  name: "Sorting",
  href: "/algorithms/sorting",
  icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <rect x="8" y="36" width="8" height="20"/>
        <rect x="22" y="26" width="8" height="30"/>
        <rect x="36" y="14" width="8" height="42"/>
        <rect x="50" y="6" width="8" height="50"/>
      </svg>
    ),
    hoverIcon: (
        <svg viewBox="0 0 64 64" fill="#34D399">
        {/* Sorted order */}
        <rect x="8" y="44" width="8" height="12"/>
        <rect x="22" y="32" width="8" height="24"/>
        <rect x="36" y="18" width="8" height="38"/>
        <rect x="50" y="6" width="8" height="50"/>
        {/* Arrow indicating sort */}
        <path d="M 60 56 L 60 16 L 56 22 M 60 16 L 64 22" stroke="#34D399" strokeWidth="2" fill="none"/>
        </svg>
    ),
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

  ],
  desc: "Bubble, merge, quick, heap, counting sort",
  complexity: "O(n log n)",
  featured: true
};

export default SORTING_SECTION;