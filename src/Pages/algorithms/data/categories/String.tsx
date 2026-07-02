const STRINGS_SECTION = {
  name: "Strings",
  href: "/algorithms/strings",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text x="8" y="42" fontSize="26" fontFamily="monospace">Aa</text>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text x="8" y="42" fontSize="26" fontFamily="monospace">A<tspan fill="#34D399">a</tspan></text>
        <rect x="25" y="46" width="16" height="3" fill="#34D399"/>
      </svg>
    ),

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
       1. LONGEST SUBSTRING WITHOUT REPEATING CHARACTERS
    ════════════════════════════════════════════════════════════════════ */
    {
      name: "Longest Substring Without Repeating Characters",
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
        { tag: "note", variant: "tip", text: "This problem is cross-referenced in the Arrays section's Sliding Window entry — they're the same algorithmic technique, just framed around strings here. Recognising that a 'string problem' is actually a generic array/sequence technique in disguise is itself a useful pattern-recognition skill." }
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
`function lengthOfLongestSubstring(strInput):
    seenCharacters ← empty hash set
    j   ← 0
    bestLength  ← 0

    for i from 0 to length(strInput) − 1:
        while strInput[i] is in seenCharacters:
            remove strInput[j] from seenCharacters
            j ← j + 1

        add strInput[i] to seenCharacters
        bestLength ← max(bestLength, i − j + 1)

    return bestLength` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "i scans the string forward one character at a time, always trying to extend the current window.",
          "Before admitting strInput[i] into the window, check whether it would create a duplicate within the window's current contents.",
          "If it would, shrink from the left — removing characters one at a time from the tracking set and advancing j — until the duplicate is eliminated and the window is valid again.",
          "Once the window is confirmed valid (no duplicates), add strInput[i] and check if the current window length is a new best.",
          "Repeat until i reaches the end of the string; the recorded bestLength is the answer."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at the top of every outer-loop iteration, strInput[j..rightIndex−1] contains no duplicate characters. The inner while-loop correctly restores this invariant whenever adding strInput[i] would violate it, by removing characters from the left one at a time until the specific conflicting character is gone — and because j only ever moves forward (never resets), no valid window is ever skipped over or incorrectly re-examined, exactly matching the general Sliding Window correctness argument from the Arrays section." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <string>
#include <unordered_set>
using namespace std;

// Returns the length of the longest contiguous substring of 'strInput'
// that contains no repeated characters, using the sliding window technique.
int lengthOfLongestSubstring(const string& strInput) {
    // 'seenCharacters' tracks which characters currently sit inside the window.
    unordered_set<char> seenCharacters;

    int j = 0;   // left boundary of the current window (inclusive)
    int bestLength = 0;  // longest valid window length found so far

    // 'i' expands the window one character at a time.
    for (int i = 0; i < (int)strInput.length(); i++) {
        char candidateChar = strInput[i];

        // If the candidate character already exists in the window,
        // shrink the window from the left until the duplicate is removed.
        while (seenCharacters.find(candidateChar) != seenCharacters.end()) {
            char leftChar = strInput[j];
            seenCharacters.erase(leftChar);
            j++;
        }

        // The window [j, i] is now guaranteed duplicate-free.
        seenCharacters.insert(candidateChar);

        int currentWindowLength = i - j + 1;
        if (currentWindowLength > bestLength) {
            bestLength = currentWindowLength;
        }
    }

    return bestLength;
}

int main() {
    // Static demonstration data — deterministic output on every run.
    string sampleText = "abcabcbb";

    int result = lengthOfLongestSubstring(sampleText);
    cout << "Input string: " << sampleText << endl;
    cout << "Longest substring length without repeats: " << result << endl;

    return 0;
}
`,
        "python": `def length_of_longest_substring(input_string):
    """
    Returns the length of the longest contiguous substring of
    'input_string' that contains no repeated characters, using
    the sliding window technique.
    """
    # 'seen_characters' tracks which characters currently sit inside the window.
    seen_characters = set()

    left_index = 0   # left boundary of the current window (inclusive)
    best_length = 0  # longest valid window length found so far

    # 'right_index' expands the window one character at a time.
    for right_index in range(len(input_string)):
        candidate_char = input_string[right_index]

        # If the candidate character already exists in the window,
        # shrink the window from the left until the duplicate is removed.
        while candidate_char in seen_characters:
            left_char = input_string[left_index]
            seen_characters.remove(left_char)
            left_index += 1

        # The window [left_index, right_index] is now guaranteed duplicate-free.
        seen_characters.add(candidate_char)

        current_window_length = right_index - left_index + 1
        best_length = max(best_length, current_window_length)

    return best_length


def main():
    # Static demonstration data - deterministic output on every run.
    sample_text = "abcabcbb"

    result = length_of_longest_substring(sample_text)
    print(f"Input string: {sample_text}")
    print(f"Longest substring length without repeats: {result}")


if __name__ == "__main__":
    main()
`,
        "java": `import java.util.HashSet;
import java.util.Set;

public class Main {

    // Returns the length of the longest contiguous substring of
    // 'strInput' that contains no repeated characters, using
    // the sliding window technique.
    static int lengthOfLongestSubstring(String strInput) {
        // 'seenCharacters' tracks which characters currently sit inside the window.
        Set<Character> seenCharacters = new HashSet<>();

        int j = 0;   // left boundary of the current window (inclusive)
        int bestLength = 0;  // longest valid window length found so far

        // 'i' expands the window one character at a time.
        for (int i = 0; i < strInput.length(); i++) {
            char candidateChar = strInput.charAt(i);

            // If the candidate character already exists in the window,
            // shrink the window from the left until the duplicate is removed.
            while (seenCharacters.contains(candidateChar)) {
                char leftChar = strInput.charAt(j);
                seenCharacters.remove(leftChar);
                j++;
            }

            // The window [j, i] is now guaranteed duplicate-free.
            seenCharacters.add(candidateChar);

            int currentWindowLength = i - j + 1;
            bestLength = Math.max(bestLength, currentWindowLength);
        }

        return bestLength;
    }

    public static void main(String[] args) {
        // Static demonstration data — deterministic output on every run.
        String sampleText = "abcabcbb";

        int result = lengthOfLongestSubstring(sampleText);
        System.out.println("Input string: " + sampleText);
        System.out.println("Longest substring length without repeats: " + result);
    }
}
`,
        "js": `// Returns the length of the longest contiguous substring of
// 'strInput' that contains no repeated characters, using
// the sliding window technique.
function lengthOfLongestSubstring(strInput) {
    // 'seenCharacters' tracks which characters currently sit inside the window.
    const seenCharacters = new Set();

    let j = 0;   // left boundary of the current window (inclusive)
    let bestLength = 0;  // longest valid window length found so far

    // 'i' expands the window one character at a time.
    for (let i = 0; i < strInput.length; i++) {
        const candidateChar = strInput[i];

        // If the candidate character already exists in the window,
        // shrink the window from the left until the duplicate is removed.
        while (seenCharacters.has(candidateChar)) {
            const leftChar = strInput[j];
            seenCharacters.delete(leftChar);
            j++;
        }

        // The window [j, i] is now guaranteed duplicate-free.
        seenCharacters.add(candidateChar);

        const currentWindowLength = i - j + 1;
        bestLength = Math.max(bestLength, currentWindowLength);
    }

    return bestLength;
}

function main() {
    // Static demonstration data — deterministic output on every run.
    const sampleText = "abcabcbb";

    const result = lengthOfLongestSubstring(sampleText);
    console.log("Input string: " + sampleText);
    console.log("Longest substring length without repeats: " + result);
}

main();
`,
        "c": `#include <stdio.h>
#include <string.h>

// Returns the length of the longest contiguous substring of
// 'strInput' that contains no repeated characters, using
// the sliding window technique. Uses a fixed-size 256-entry
// table (one slot per possible byte value) instead of a hash set.
int lengthOfLongestSubstring(const char* strInput) {
    int lastSeenIndex[256];   // lastSeenIndex[c] = most recent index of char c, or -1
    for (int i = 0; i < 256; i++) {
        lastSeenIndex[i] = -1;
    }

    int j = 0;   // left boundary of the current window (inclusive)
    int bestLength = 0;  // longest valid window length found so far
    int inputLength = (int)strlen(strInput);

    // 'i' expands the window one character at a time.
    for (int i = 0; i < inputLength; i++) {
        unsigned char candidateChar = (unsigned char)strInput[i];

        // If the candidate character was already seen INSIDE the current
        // window, jump the left boundary just past its previous occurrence.
        if (lastSeenIndex[candidateChar] >= j) {
            j = lastSeenIndex[candidateChar] + 1;
        }

        lastSeenIndex[candidateChar] = i;

        int currentWindowLength = i - j + 1;
        if (currentWindowLength > bestLength) {
            bestLength = currentWindowLength;
        }
    }

    return bestLength;
}

int main() {
    /* Static demonstration data - deterministic output on every run. */
    const char* sampleText = "abcabcbb";

    int result = lengthOfLongestSubstring(sampleText);
    printf("Input string: %s\\n", sampleText);
    printf("Longest substring length without repeats: %d\\n", result);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {

    // Returns the length of the longest contiguous substring of
    // 'strInput' that contains no repeated characters, using
    // the sliding window technique.
    static int LengthOfLongestSubstring(string strInput) {
        // 'seenCharacters' tracks which characters currently sit inside the window.
        var seenCharacters = new HashSet<char>();

        int j = 0;   // left boundary of the current window (inclusive)
        int bestLength = 0;  // longest valid window length found so far

        // 'i' expands the window one character at a time.
        for (int i = 0; i < strInput.Length; i++) {
            char candidateChar = strInput[i];

            // If the candidate character already exists in the window,
            // shrink the window from the left until the duplicate is removed.
            while (seenCharacters.Contains(candidateChar)) {
                char leftChar = strInput[j];
                seenCharacters.Remove(leftChar);
                j++;
            }

            // The window [j, i] is now guaranteed duplicate-free.
            seenCharacters.Add(candidateChar);

            int currentWindowLength = i - j + 1;
            bestLength = Math.Max(bestLength, currentWindowLength);
        }

        return bestLength;
    }

    static void Main() {
        // Static demonstration data — deterministic output on every run.
        string sampleText = "abcabcbb";

        int result = LengthOfLongestSubstring(sampleText);
        Console.WriteLine("Input string: " + sampleText);
        Console.WriteLine("Longest substring length without repeats: " + result);
    }
}
`,
        "swift": `import Foundation

// Returns the length of the longest contiguous substring of
// 'strInput' that contains no repeated characters, using
// the sliding window technique.
func lengthOfLongestSubstring(_ strInput: String) -> Int {
    let characters = Array(strInput)

    // 'seenCharacters' tracks which characters currently sit inside the window.
    var seenCharacters = Set<Character>()

    var j = 0    // left boundary of the current window (inclusive)
    var bestLength = 0   // longest valid window length found so far

    // 'i' expands the window one character at a time.
    for i in 0..<characters.count {
        let candidateChar = characters[i]

        // If the candidate character already exists in the window,
        // shrink the window from the left until the duplicate is removed.
        while seenCharacters.contains(candidateChar) {
            let leftChar = characters[j]
            seenCharacters.remove(leftChar)
            j += 1
        }

        // The window [j, i] is now guaranteed duplicate-free.
        seenCharacters.insert(candidateChar)

        let currentWindowLength = i - j + 1
        bestLength = max(bestLength, currentWindowLength)
    }

    return bestLength
}

// Static demonstration data — deterministic output on every run.
let sampleText = "abcabcbb"

let result = lengthOfLongestSubstring(sampleText)
print("Input string: \\(sampleText)")
print("Longest substring length without repeats: \\(result)")
`,
        "kotlin": `// Returns the length of the longest contiguous substring of
// 'strInput' that contains no repeated characters, using
// the sliding window technique.
fun lengthOfLongestSubstring(strInput: String): Int {
    // 'seenCharacters' tracks which characters currently sit inside the window.
    val seenCharacters = HashSet<Char>()

    var j = 0    // left boundary of the current window (inclusive)
    var bestLength = 0   // longest valid window length found so far

    // 'i' expands the window one character at a time.
    for (i in strInput.indices) {
        val candidateChar = strInput[i]

        // If the candidate character already exists in the window,
        // shrink the window from the left until the duplicate is removed.
        while (seenCharacters.contains(candidateChar)) {
            val leftChar = strInput[j]
            seenCharacters.remove(leftChar)
            j++
        }

        // The window [j, i] is now guaranteed duplicate-free.
        seenCharacters.add(candidateChar)

        val currentWindowLength = i - j + 1
        bestLength = maxOf(bestLength, currentWindowLength)
    }

    return bestLength
}

fun main() {
    // Static demonstration data — deterministic output on every run.
    val sampleText = "abcabcbb"

    val result = lengthOfLongestSubstring(sampleText)
    println("Input string: $sampleText")
    println("Longest substring length without repeats: $result")
}
`,
        "scala": `import scala.collection.mutable

object Main extends App {

  // Returns the length of the longest contiguous substring of
  // 'strInput' that contains no repeated characters, using
  // the sliding window technique.
  def lengthOfLongestSubstring(strInput: String): Int = {
    // 'seenCharacters' tracks which characters currently sit inside the window.
    val seenCharacters = mutable.HashSet[Char]()

    var j = 0    // left boundary of the current window (inclusive)
    var bestLength = 0   // longest valid window length found so far

    // 'i' expands the window one character at a time.
    for (i <- strInput.indices) {
      val candidateChar = strInput(i)

      // If the candidate character already exists in the window,
      // shrink the window from the left until the duplicate is removed.
      while (seenCharacters.contains(candidateChar)) {
        val leftChar = strInput(j)
        seenCharacters.remove(leftChar)
        j += 1
      }

      // The window [j, i] is now guaranteed duplicate-free.
      seenCharacters.add(candidateChar)

      val currentWindowLength = i - j + 1
      bestLength = math.max(bestLength, currentWindowLength)
    }

    bestLength
  }

  // Static demonstration data — deterministic output on every run.
  val sampleText = "abcabcbb"

  val result = lengthOfLongestSubstring(sampleText)
  println(s"Input string: $sampleText")
  println(s"Longest substring length without repeats: $result")
}
`,
        "go": `package main

import "fmt"

// lengthOfLongestSubstring returns the length of the longest contiguous
// substring of strInput that contains no repeated characters, using
// the sliding window technique.
func lengthOfLongestSubstring(strInput string) int {
	// seenCharacters tracks which characters currently sit inside the window.
	seenCharacters := make(map[byte]bool)

	j := 0  // left boundary of the current window (inclusive)
	bestLength := 0 // longest valid window length found so far

	// i expands the window one character at a time.
	for i := 0; i < len(strInput); i++ {
		candidateChar := strInput[i]

		// If the candidate character already exists in the window,
		// shrink the window from the left until the duplicate is removed.
		for seenCharacters[candidateChar] {
			leftChar := strInput[j]
			delete(seenCharacters, leftChar)
			j++
		}

		// The window [j, i] is now guaranteed duplicate-free.
		seenCharacters[candidateChar] = true

		currentWindowLength := i - j + 1
		if currentWindowLength > bestLength {
			bestLength = currentWindowLength
		}
	}

	return bestLength
}

func main() {
	// Static demonstration data - deterministic output on every run.
	sampleText := "abcabcbb"

	result := lengthOfLongestSubstring(sampleText)
	fmt.Println("Input string:", sampleText)
	fmt.Println("Longest substring length without repeats:", result)
}
`,
        "rust": `use std::collections::HashSet;

// Returns the length of the longest contiguous substring of
// 'input_string' that contains no repeated characters, using
// the sliding window technique.
fn length_of_longest_substring(input_string: &str) -> usize {
    let characters: Vec<char> = input_string.chars().collect();

    // 'seen_characters' tracks which characters currently sit inside the window.
    let mut seen_characters: HashSet<char> = HashSet::new();

    let mut left_index: usize = 0;   // left boundary of the current window (inclusive)
    let mut best_length: usize = 0;  // longest valid window length found so far

    // 'right_index' expands the window one character at a time.
    for right_index in 0..characters.len() {
        let candidate_char = characters[right_index];

        // If the candidate character already exists in the window,
        // shrink the window from the left until the duplicate is removed.
        while seen_characters.contains(&candidate_char) {
            let left_char = characters[left_index];
            seen_characters.remove(&left_char);
            left_index += 1;
        }

        // The window [left_index, right_index] is now guaranteed duplicate-free.
        seen_characters.insert(candidate_char);

        let current_window_length = right_index - left_index + 1;
        if current_window_length > best_length {
            best_length = current_window_length;
        }
    }

    best_length
}

fn main() {
    // Static demonstration data - deterministic output on every run.
    let sample_text = "abcabcbb";

    let result = length_of_longest_substring(sample_text);
    println!("Input string: {}", sample_text);
    println!("Longest substring length without repeats: {}", result);
}
`
      }
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
`function rabinKarpSearch(text, pattern):
    textLength    ← length(text)
    patternLength ← length(pattern)
    if patternLength > textLength: return []

    BASE ← 256; MODULUS ← a large prime (e.g. 1_000_000_007)
    highOrderTerm ← BASE^(patternLength − 1) mod MODULUS   // removes the leading character's contribution

    patternHash ← polynomialHash(pattern, BASE, MODULUS)
    windowHash  ← polynomialHash(text[0 .. patternLength − 1], BASE, MODULUS)
    matchIndices ← empty list

    for i_windowStart from 0 to textLength − patternLength:
        if windowHash == patternHash:
            if text[i_windowStart .. i_windowStart + patternLength − 1] == pattern:   // verify to rule out a false-positive collision
                matchIndices.append(i_windowStart)

        if i_windowStart < textLength − patternLength:
            // Roll the hash forward: remove text[i_windowStart], add text[i_windowStart + patternLength]
            windowHash ← (windowHash − text[i_windowStart] * highOrderTerm) * BASE + text[i_windowStart + patternLength]
            windowHash ← windowHash mod MODULUS

    return matchIndices` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Compute the pattern's hash once, and the FIRST text window's hash (covering text[0..patternLength-1]) using the same polynomial hash formula.",
          "At each window position, compare the window's hash against the pattern's hash. If they DON'T match, the window definitely isn't the pattern — move on immediately with no character comparison needed.",
          "If the hashes DO match, this is only a CANDIDATE match — verify it with an actual character-by-character comparison, since different strings can occasionally collide to the same hash value.",
          "To advance to the next window, compute its hash in O(1) using the rolling-hash update: subtract the outgoing character's weighted contribution, then shift and add the incoming character — avoiding recomputing the entire window's hash from scratch.",
          "Repeat until every possible window position (0 through textLength−patternLength) has been checked."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The algorithm never reports a false match, because every hash match is explicitly verified with a direct character comparison before being added to the results — so correctness (no false positives) is guaranteed regardless of hash quality. The algorithm also never MISSES a true match, because a genuine pattern occurrence always produces an identical hash to the pattern itself (since the hash function is deterministic and computed identically for both), guaranteeing the hash comparison passes and triggers verification at every true match position. The rolling hash update formula is correct because polynomial hashing treats the string as coefficients of a polynomial in BASE — removing the leading term's contribution (subtracting text[i_windowStart] × BASE^(patternLength-1)) and then shifting (multiplying by BASE) and adding the new trailing term (text[i_windowStart+patternLength]) exactly recomputes what the hash of the new window would be if computed from scratch, by the standard algebraic properties of polynomial evaluation." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Finds every starting index of 'pattern' inside 'text' using the
// Rabin-Karp rolling-hash algorithm, and prints each match found.
void searchRabinKarp(const string& text, const string& pattern) {
    int patternLength = (int)pattern.length();
    int textLength = (int)text.length();

    const int ALPHABET_SIZE = 256; // number of possible character values
    const int HASH_MODULUS = 101;  // a small prime used to keep hash values bounded

    int patternHash = 0; // rolling hash of the pattern
    int windowHash = 0;  // rolling hash of the current text window
    int highOrderTerm = 1; // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

    // Precompute the value used to "remove" the leading character
    // of a window when the window slides forward by one position.
    for (int i = 0; i < patternLength - 1; i++) {
        highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS;
    }

    // Compute the initial hash of the pattern and of the first text window.
    for (int i = 0; i < patternLength; i++) {
        patternHash = (ALPHABET_SIZE * patternHash + pattern[i]) % HASH_MODULUS;
        windowHash = (ALPHABET_SIZE * windowHash + text[i]) % HASH_MODULUS;
    }

    // Slide the window across the text, one position at a time.
    for (int i_windowStart = 0; i_windowStart <= textLength - patternLength; i_windowStart++) {
        bool hashesMatch = (patternHash == windowHash);

        if (hashesMatch) {
            // Hash equality is only a CANDIDATE match; verify character by character
            // to rule out an accidental hash collision.
            bool isRealMatch = true;
            for (int j_offset = 0; j_offset < patternLength; j_offset++) {
                if (text[i_windowStart + j_offset] != pattern[j_offset]) {
                    isRealMatch = false;
                    break;
                }
            }
            if (isRealMatch) {
                cout << "Pattern found at index " << i_windowStart << endl;
            }
        }

        // Roll the hash forward to cover the next window, in O(1).
        if (i_windowStart < textLength - patternLength) {
            windowHash = (ALPHABET_SIZE * (windowHash - text[i_windowStart] * highOrderTerm)
                          + text[i_windowStart + patternLength]) % HASH_MODULUS;

            // The modulus operation in C++ can return a negative result;
            // normalize it back into the range [0, HASH_MODULUS).
            if (windowHash < 0) {
                windowHash += HASH_MODULUS;
            }
        }
    }
}

int main() {
    // Static demonstration data — deterministic output on every run.
    string text = "ABCCDDAEFG";
    string pattern = "CDD";

    cout << "Text: " << text << endl;
    cout << "Pattern: " << pattern << endl;
    searchRabinKarp(text, pattern);

    return 0;
}
`,
        "python": `def search_rabin_karp(text, pattern):
    """
    Finds every starting index of 'pattern' inside 'text' using the
    Rabin-Karp rolling-hash algorithm, and returns the list of matches.
    """
    pattern_length = len(pattern)
    text_length = len(text)

    ALPHABET_SIZE = 256  # number of possible character values
    HASH_MODULUS = 101   # a small prime used to keep hash values bounded

    pattern_hash = 0   # rolling hash of the pattern
    window_hash = 0    # rolling hash of the current text window
    high_order_term = 1  # ALPHABET_SIZE^(pattern_length - 1) % HASH_MODULUS

    # Precompute the value used to "remove" the leading character
    # of a window when the window slides forward by one position.
    for _ in range(pattern_length - 1):
        high_order_term = (high_order_term * ALPHABET_SIZE) % HASH_MODULUS

    # Compute the initial hash of the pattern and of the first text window.
    for i in range(pattern_length):
        pattern_hash = (ALPHABET_SIZE * pattern_hash + ord(pattern[i])) % HASH_MODULUS
        window_hash = (ALPHABET_SIZE * window_hash + ord(text[i])) % HASH_MODULUS

    match_indices = []

    # Slide the window across the text, one position at a time.
    for window_start in range(text_length - pattern_length + 1):
        if pattern_hash == window_hash:
            # Hash equality is only a CANDIDATE match; verify character by
            # character to rule out an accidental hash collision.
            candidate_window = text[window_start:window_start + pattern_length]
            if candidate_window == pattern:
                match_indices.append(window_start)

        # Roll the hash forward to cover the next window, in O(1).
        if window_start < text_length - pattern_length:
            outgoing_char = ord(text[window_start])
            incoming_char = ord(text[window_start + pattern_length])
            window_hash = (ALPHABET_SIZE * (window_hash - outgoing_char * high_order_term)
                           + incoming_char) % HASH_MODULUS

            # Normalize a possible negative result back into [0, HASH_MODULUS).
            if window_hash < 0:
                window_hash += HASH_MODULUS

    return match_indices


def main():
    # Static demonstration data - deterministic output on every run.
    text = "ABCCDDAEFG"
    pattern = "CDD"

    print(f"Text: {text}")
    print(f"Pattern: {pattern}")

    matches = search_rabin_karp(text, pattern)
    for index in matches:
        print(f"Pattern found at index {index}")


if __name__ == "__main__":
    main()
`,
        "java": `public class Main {

    // Finds every starting index of 'pattern' inside 'text' using the
    // Rabin-Karp rolling-hash algorithm, and prints each match found.
    static void searchRabinKarp(String text, String pattern) {
        int patternLength = pattern.length();
        int textLength = text.length();

        final int ALPHABET_SIZE = 256; // number of possible character values
        final int HASH_MODULUS = 101;  // a small prime used to keep hash values bounded

        int patternHash = 0; // rolling hash of the pattern
        int windowHash = 0;  // rolling hash of the current text window
        int highOrderTerm = 1; // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

        // Precompute the value used to "remove" the leading character
        // of a window when the window slides forward by one position.
        for (int i = 0; i < patternLength - 1; i++) {
            highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS;
        }

        // Compute the initial hash of the pattern and of the first text window.
        for (int i = 0; i < patternLength; i++) {
            patternHash = (ALPHABET_SIZE * patternHash + pattern.charAt(i)) % HASH_MODULUS;
            windowHash = (ALPHABET_SIZE * windowHash + text.charAt(i)) % HASH_MODULUS;
        }

        // Slide the window across the text, one position at a time.
        for (int i_windowStart = 0; i_windowStart <= textLength - patternLength; i_windowStart++) {
            if (patternHash == windowHash) {
                // Hash equality is only a CANDIDATE match; verify character by
                // character to rule out an accidental hash collision.
                boolean isRealMatch = true;
                for (int j_offset = 0; j_offset < patternLength; j_offset++) {
                    if (text.charAt(i_windowStart + j_offset) != pattern.charAt(j_offset)) {
                        isRealMatch = false;
                        break;
                    }
                }
                if (isRealMatch) {
                    System.out.println("Pattern found at index " + i_windowStart);
                }
            }

            // Roll the hash forward to cover the next window, in O(1).
            if (i_windowStart < textLength - patternLength) {
                windowHash = (ALPHABET_SIZE * (windowHash - text.charAt(i_windowStart) * highOrderTerm)
                              + text.charAt(i_windowStart + patternLength)) % HASH_MODULUS;

                if (windowHash < 0) {
                    windowHash += HASH_MODULUS;
                }
            }
        }
    }

    public static void main(String[] args) {
        // Static demonstration data — deterministic output on every run.
        String text = "ABCCDDAEFG";
        String pattern = "CDD";

        System.out.println("Text: " + text);
        System.out.println("Pattern: " + pattern);
        searchRabinKarp(text, pattern);
    }
}
`,
        "js": `// Finds every starting index of 'pattern' inside 'text' using the
// Rabin-Karp rolling-hash algorithm, and returns the list of matches.
function searchRabinKarp(text, pattern) {
    const patternLength = pattern.length;
    const textLength = text.length;

    const ALPHABET_SIZE = 256; // number of possible character values
    const HASH_MODULUS = 101;  // a small prime used to keep hash values bounded

    let patternHash = 0; // rolling hash of the pattern
    let windowHash = 0;  // rolling hash of the current text window
    let highOrderTerm = 1; // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

    // Precompute the value used to "remove" the leading character
    // of a window when the window slides forward by one position.
    for (let i = 0; i < patternLength - 1; i++) {
        highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS;
    }

    // Compute the initial hash of the pattern and of the first text window.
    for (let i = 0; i < patternLength; i++) {
        patternHash = (ALPHABET_SIZE * patternHash + pattern.charCodeAt(i)) % HASH_MODULUS;
        windowHash = (ALPHABET_SIZE * windowHash + text.charCodeAt(i)) % HASH_MODULUS;
    }

    const matchIndices = [];

    // Slide the window across the text, one position at a time.
    for (let i_windowStart = 0; i_windowStart <= textLength - patternLength; i_windowStart++) {
        if (patternHash === windowHash) {
            // Hash equality is only a CANDIDATE match; verify character by
            // character to rule out an accidental hash collision.
            const candidateWindow = text.substring(i_windowStart, i_windowStart + patternLength);
            if (candidateWindow === pattern) {
                matchIndices.push(i_windowStart);
            }
        }

        // Roll the hash forward to cover the next window, in O(1).
        if (i_windowStart < textLength - patternLength) {
            const outgoingChar = text.charCodeAt(i_windowStart);
            const incomingChar = text.charCodeAt(i_windowStart + patternLength);
            windowHash = (ALPHABET_SIZE * (windowHash - outgoingChar * highOrderTerm)
                          + incomingChar) % HASH_MODULUS;

            if (windowHash < 0) {
                windowHash += HASH_MODULUS;
            }
        }
    }

    return matchIndices;
}

function main() {
    // Static demonstration data — deterministic output on every run.
    const text = "ABCCDDAEFG";
    const pattern = "CDD";

    console.log("Text: " + text);
    console.log("Pattern: " + pattern);

    const matches = searchRabinKarp(text, pattern);
    for (const index of matches) {
        console.log("Pattern found at index " + index);
    }
}

main();
`,
        "c": `#include <stdio.h>
#include <string.h>

// Finds every starting index of 'pattern' inside 'text' using the
// Rabin-Karp rolling-hash algorithm, and prints each match found.
void searchRabinKarp(const char* text, const char* pattern) {
    int patternLength = (int)strlen(pattern);
    int textLength = (int)strlen(text);

    const int ALPHABET_SIZE = 256; /* number of possible character values */
    const int HASH_MODULUS = 101;  /* a small prime used to keep hash values bounded */

    int patternHash = 0; /* rolling hash of the pattern */
    int windowHash = 0;  /* rolling hash of the current text window */
    int highOrderTerm = 1; /* ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS */

    /* Precompute the value used to "remove" the leading character
       of a window when the window slides forward by one position. */
    for (int i = 0; i < patternLength - 1; i++) {
        highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS;
    }

    /* Compute the initial hash of the pattern and of the first text window. */
    for (int i = 0; i < patternLength; i++) {
        patternHash = (ALPHABET_SIZE * patternHash + pattern[i]) % HASH_MODULUS;
        windowHash = (ALPHABET_SIZE * windowHash + text[i]) % HASH_MODULUS;
    }

    /* Slide the window across the text, one position at a time. */
    for (int i_windowStart = 0; i_windowStart <= textLength - patternLength; i_windowStart++) {
        if (patternHash == windowHash) {
            /* Hash equality is only a CANDIDATE match; verify character by
               character to rule out an accidental hash collision. */
            int isRealMatch = 1;
            for (int j_offset = 0; j_offset < patternLength; j_offset++) {
                if (text[i_windowStart + j_offset] != pattern[j_offset]) {
                    isRealMatch = 0;
                    break;
                }
            }
            if (isRealMatch) {
                printf("Pattern found at index %d\\n", i_windowStart);
            }
        }

        /* Roll the hash forward to cover the next window, in O(1). */
        if (i_windowStart < textLength - patternLength) {
            windowHash = (ALPHABET_SIZE * (windowHash - text[i_windowStart] * highOrderTerm)
                          + text[i_windowStart + patternLength]) % HASH_MODULUS;

            if (windowHash < 0) {
                windowHash += HASH_MODULUS;
            }
        }
    }
}

int main() {
    /* Static demonstration data - deterministic output on every run. */
    const char* text = "ABCCDDAEFG";
    const char* pattern = "CDD";

    printf("Text: %s\\n", text);
    printf("Pattern: %s\\n", pattern);
    searchRabinKarp(text, pattern);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {

    // Finds every starting index of 'pattern' inside 'text' using the
    // Rabin-Karp rolling-hash algorithm, and returns the list of matches.
    static List<int> SearchRabinKarp(string text, string pattern) {
        int patternLength = pattern.Length;
        int textLength = text.Length;

        const int ALPHABET_SIZE = 256; // number of possible character values
        const int HASH_MODULUS = 101;  // a small prime used to keep hash values bounded

        int patternHash = 0; // rolling hash of the pattern
        int windowHash = 0;  // rolling hash of the current text window
        int highOrderTerm = 1; // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

        // Precompute the value used to "remove" the leading character
        // of a window when the window slides forward by one position.
        for (int i = 0; i < patternLength - 1; i++) {
            highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS;
        }

        // Compute the initial hash of the pattern and of the first text window.
        for (int i = 0; i < patternLength; i++) {
            patternHash = (ALPHABET_SIZE * patternHash + pattern[i]) % HASH_MODULUS;
            windowHash = (ALPHABET_SIZE * windowHash + text[i]) % HASH_MODULUS;
        }

        var matchIndices = new List<int>();

        // Slide the window across the text, one position at a time.
        for (int i_windowStart = 0; i_windowStart <= textLength - patternLength; i_windowStart++) {
            if (patternHash == windowHash) {
                // Hash equality is only a CANDIDATE match; verify character by
                // character to rule out an accidental hash collision.
                string candidateWindow = text.Substring(i_windowStart, patternLength);
                if (candidateWindow == pattern) {
                    matchIndices.Add(i_windowStart);
                }
            }

            // Roll the hash forward to cover the next window, in O(1).
            if (i_windowStart < textLength - patternLength) {
                windowHash = (ALPHABET_SIZE * (windowHash - text[i_windowStart] * highOrderTerm)
                              + text[i_windowStart + patternLength]) % HASH_MODULUS;

                if (windowHash < 0) {
                    windowHash += HASH_MODULUS;
                }
            }
        }

        return matchIndices;
    }

    static void Main() {
        // Static demonstration data — deterministic output on every run.
        string text = "ABCCDDAEFG";
        string pattern = "CDD";

        Console.WriteLine("Text: " + text);
        Console.WriteLine("Pattern: " + pattern);

        List<int> matches = SearchRabinKarp(text, pattern);
        foreach (int index in matches) {
            Console.WriteLine("Pattern found at index " + index);
        }
    }
}
`,
        "swift": `import Foundation

// Finds every starting index of 'pattern' inside 'text' using the
// Rabin-Karp rolling-hash algorithm, and returns the list of matches.
func searchRabinKarp(_ text: String, _ pattern: String) -> [Int] {
    let textChars = Array(text.utf8)
    let patternChars = Array(pattern.utf8)

    let patternLength = patternChars.count
    let textLength = textChars.count

    let ALPHABET_SIZE = 256 // number of possible character values
    let HASH_MODULUS = 101  // a small prime used to keep hash values bounded

    var patternHash = 0 // rolling hash of the pattern
    var windowHash = 0  // rolling hash of the current text window
    var highOrderTerm = 1 // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

    // Precompute the value used to "remove" the leading character
    // of a window when the window slides forward by one position.
    if patternLength > 0 {
        for _ in 0..<(patternLength - 1) {
            highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS
        }
    }

    // Compute the initial hash of the pattern and of the first text window.
    for i in 0..<patternLength {
        patternHash = (ALPHABET_SIZE * patternHash + Int(patternChars[i])) % HASH_MODULUS
        windowHash = (ALPHABET_SIZE * windowHash + Int(textChars[i])) % HASH_MODULUS
    }

    var matchIndices: [Int] = []

    // Slide the window across the text, one position at a time.
    var i_windowStart = 0
    while i_windowStart <= textLength - patternLength {
        if patternHash == windowHash {
            // Hash equality is only a CANDIDATE match; verify character by
            // character to rule out an accidental hash collision.
            var isRealMatch = true
            for j_offset in 0..<patternLength {
                if textChars[i_windowStart + j_offset] != patternChars[j_offset] {
                    isRealMatch = false
                    break
                }
            }
            if isRealMatch {
                matchIndices.append(i_windowStart)
            }
        }

        // Roll the hash forward to cover the next window, in O(1).
        if i_windowStart < textLength - patternLength {
            let outgoingChar = Int(textChars[i_windowStart])
            let incomingChar = Int(textChars[i_windowStart + patternLength])
            windowHash = (ALPHABET_SIZE * (windowHash - outgoingChar * highOrderTerm)
                          + incomingChar) % HASH_MODULUS

            if windowHash < 0 {
                windowHash += HASH_MODULUS
            }
        }

        i_windowStart += 1
    }

    return matchIndices
}

// Static demonstration data — deterministic output on every run.
let text = "ABCCDDAEFG"
let pattern = "CDD"

print("Text: \\(text)")
print("Pattern: \\(pattern)")

let matches = searchRabinKarp(text, pattern)
for index in matches {
    print("Pattern found at index \\(index)")
}
`,
        "kotlin": `// Finds every starting index of 'pattern' inside 'text' using the
// Rabin-Karp rolling-hash algorithm, and returns the list of matches.
fun searchRabinKarp(text: String, pattern: String): List<Int> {
    val patternLength = pattern.length
    val textLength = text.length

    val ALPHABET_SIZE = 256 // number of possible character values
    val HASH_MODULUS = 101  // a small prime used to keep hash values bounded

    var patternHash = 0 // rolling hash of the pattern
    var windowHash = 0  // rolling hash of the current text window
    var highOrderTerm = 1 // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

    // Precompute the value used to "remove" the leading character
    // of a window when the window slides forward by one position.
    for (i in 0 until patternLength - 1) {
        highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS
    }

    // Compute the initial hash of the pattern and of the first text window.
    for (i in 0 until patternLength) {
        patternHash = (ALPHABET_SIZE * patternHash + pattern[i].code) % HASH_MODULUS
        windowHash = (ALPHABET_SIZE * windowHash + text[i].code) % HASH_MODULUS
    }

    val matchIndices = mutableListOf<Int>()

    // Slide the window across the text, one position at a time.
    for (i_windowStart in 0..(textLength - patternLength)) {
        if (patternHash == windowHash) {
            // Hash equality is only a CANDIDATE match; verify character by
            // character to rule out an accidental hash collision.
            val candidateWindow = text.substring(i_windowStart, i_windowStart + patternLength)
            if (candidateWindow == pattern) {
                matchIndices.add(i_windowStart)
            }
        }

        // Roll the hash forward to cover the next window, in O(1).
        if (i_windowStart < textLength - patternLength) {
            val outgoingChar = text[i_windowStart].code
            val incomingChar = text[i_windowStart + patternLength].code
            windowHash = (ALPHABET_SIZE * (windowHash - outgoingChar * highOrderTerm)
                          + incomingChar) % HASH_MODULUS

            if (windowHash < 0) {
                windowHash += HASH_MODULUS
            }
        }
    }

    return matchIndices
}

fun main() {
    // Static demonstration data — deterministic output on every run.
    val text = "ABCCDDAEFG"
    val pattern = "CDD"

    println("Text: $text")
    println("Pattern: $pattern")

    val matches = searchRabinKarp(text, pattern)
    for (index in matches) {
        println("Pattern found at index $index")
    }
}
`,
        "scala": `object Main extends App {

  // Finds every starting index of 'pattern' inside 'text' using the
  // Rabin-Karp rolling-hash algorithm, and returns the list of matches.
  def searchRabinKarp(text: String, pattern: String): List[Int] = {
    val patternLength = pattern.length
    val textLength = text.length

    val ALPHABET_SIZE = 256 // number of possible character values
    val HASH_MODULUS = 101  // a small prime used to keep hash values bounded

    var patternHash = 0 // rolling hash of the pattern
    var windowHash = 0  // rolling hash of the current text window
    var highOrderTerm = 1 // ALPHABET_SIZE^(patternLength - 1) % HASH_MODULUS

    // Precompute the value used to "remove" the leading character
    // of a window when the window slides forward by one position.
    for (_ <- 0 until patternLength - 1) {
      highOrderTerm = (highOrderTerm * ALPHABET_SIZE) % HASH_MODULUS
    }

    // Compute the initial hash of the pattern and of the first text window.
    for (i <- 0 until patternLength) {
      patternHash = (ALPHABET_SIZE * patternHash + pattern(i).toInt) % HASH_MODULUS
      windowHash = (ALPHABET_SIZE * windowHash + text(i).toInt) % HASH_MODULUS
    }

    var matchIndices = List[Int]()

    // Slide the window across the text, one position at a time.
    for (i_windowStart <- 0 to (textLength - patternLength)) {
      if (patternHash == windowHash) {
        // Hash equality is only a CANDIDATE match; verify character by
        // character to rule out an accidental hash collision.
        val candidateWindow = text.substring(i_windowStart, i_windowStart + patternLength)
        if (candidateWindow == pattern) {
          matchIndices = matchIndices :+ i_windowStart
        }
      }

      // Roll the hash forward to cover the next window, in O(1).
      if (i_windowStart < textLength - patternLength) {
        val outgoingChar = text(i_windowStart).toInt
        val incomingChar = text(i_windowStart + patternLength).toInt
        windowHash = (ALPHABET_SIZE * (windowHash - outgoingChar * highOrderTerm)
          + incomingChar) % HASH_MODULUS

        if (windowHash < 0) {
          windowHash += HASH_MODULUS
        }
      }
    }

    matchIndices
  }

  // Static demonstration data — deterministic output on every run.
  val text = "ABCCDDAEFG"
  val pattern = "CDD"

  println(s"Text: $text")
  println(s"Pattern: $pattern")

  val matches = searchRabinKarp(text, pattern)
  matches.foreach(index => println(s"Pattern found at index $index"))
}
`,
        "go": `package main

import "fmt"

// searchRabinKarp finds every starting index of pattern inside text using
// the Rabin-Karp rolling-hash algorithm, and returns the list of matches.
func searchRabinKarp(text string, pattern string) []int {
	patternLength := len(pattern)
	textLength := len(text)

	const alphabetSize = 256 // number of possible character values
	const hashModulus = 101  // a small prime used to keep hash values bounded

	patternHash := 0   // rolling hash of the pattern
	windowHash := 0    // rolling hash of the current text window
	highOrderTerm := 1 // alphabetSize^(patternLength - 1) % hashModulus

	// Precompute the value used to "remove" the leading character
	// of a window when the window slides forward by one position.
	for i := 0; i < patternLength-1; i++ {
		highOrderTerm = (highOrderTerm * alphabetSize) % hashModulus
	}

	// Compute the initial hash of the pattern and of the first text window.
	for i := 0; i < patternLength; i++ {
		patternHash = (alphabetSize*patternHash + int(pattern[i])) % hashModulus
		windowHash = (alphabetSize*windowHash + int(text[i])) % hashModulus
	}

	matchIndices := []int{}

	// Slide the window across the text, one position at a time.
	for i_windowStart := 0; i_windowStart <= textLength-patternLength; i_windowStart++ {
		if patternHash == windowHash {
			// Hash equality is only a CANDIDATE match; verify character by
			// character to rule out an accidental hash collision.
			candidateWindow := text[i_windowStart : i_windowStart+patternLength]
			if candidateWindow == pattern {
				matchIndices = append(matchIndices, i_windowStart)
			}
		}

		// Roll the hash forward to cover the next window, in O(1).
		if i_windowStart < textLength-patternLength {
			outgoingChar := int(text[i_windowStart])
			incomingChar := int(text[i_windowStart+patternLength])
			windowHash = (alphabetSize*(windowHash-outgoingChar*highOrderTerm) + incomingChar) % hashModulus

			if windowHash < 0 {
				windowHash += hashModulus
			}
		}
	}

	return matchIndices
}

func main() {
	// Static demonstration data - deterministic output on every run.
	text := "ABCCDDAEFG"
	pattern := "CDD"

	fmt.Println("Text:", text)
	fmt.Println("Pattern:", pattern)

	matches := searchRabinKarp(text, pattern)
	for _, index := range matches {
		fmt.Println("Pattern found at index", index)
	}
}
`,
        "rust": `// Finds every starting index of 'pattern' inside 'text' using the
// Rabin-Karp rolling-hash algorithm, and returns the list of matches.
fn search_rabin_karp(text: &str, pattern: &str) -> Vec<usize> {
    let text_bytes = text.as_bytes();
    let pattern_bytes = pattern.as_bytes();

    let pattern_length = pattern_bytes.len();
    let text_length = text_bytes.len();

    const ALPHABET_SIZE: i64 = 256; // number of possible character values
    const HASH_MODULUS: i64 = 101;  // a small prime used to keep hash values bounded

    let mut pattern_hash: i64 = 0; // rolling hash of the pattern
    let mut window_hash: i64 = 0;  // rolling hash of the current text window
    let mut high_order_term: i64 = 1; // ALPHABET_SIZE^(pattern_length - 1) % HASH_MODULUS

    // Precompute the value used to "remove" the leading character
    // of a window when the window slides forward by one position.
    for _ in 0..pattern_length.saturating_sub(1) {
        high_order_term = (high_order_term * ALPHABET_SIZE) % HASH_MODULUS;
    }

    // Compute the initial hash of the pattern and of the first text window.
    for i in 0..pattern_length {
        pattern_hash = (ALPHABET_SIZE * pattern_hash + pattern_bytes[i] as i64) % HASH_MODULUS;
        window_hash = (ALPHABET_SIZE * window_hash + text_bytes[i] as i64) % HASH_MODULUS;
    }

    let mut match_indices: Vec<usize> = Vec::new();

    if pattern_length == 0 || pattern_length > text_length {
        return match_indices;
    }

    // Slide the window across the text, one position at a time.
    for window_start in 0..=(text_length - pattern_length) {
        if pattern_hash == window_hash {
            // Hash equality is only a CANDIDATE match; verify character by
            // character to rule out an accidental hash collision.
            let candidate_window = &text_bytes[window_start..window_start + pattern_length];
            if candidate_window == pattern_bytes {
                match_indices.push(window_start);
            }
        }

        // Roll the hash forward to cover the next window, in O(1).
        if window_start < text_length - pattern_length {
            let outgoing_char = text_bytes[window_start] as i64;
            let incoming_char = text_bytes[window_start + pattern_length] as i64;
            window_hash = (ALPHABET_SIZE * (window_hash - outgoing_char * high_order_term)
                + incoming_char) % HASH_MODULUS;

            if window_hash < 0 {
                window_hash += HASH_MODULUS;
            }
        }
    }

    match_indices
}

fn main() {
    // Static demonstration data - deterministic output on every run.
    let text = "ABCCDDAEFG";
    let pattern = "CDD";

    println!("Text: {}", text);
    println!("Pattern: {}", pattern);

    let matches = search_rabin_karp(text, pattern);
    for index in matches {
        println!("Pattern found at index {}", index);
    }
}
`
      }
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
    patternLength ← length(pattern)
    failure ← array of size patternLength, all zero
    prefixLength ← 0                    // length of the previous longest prefix-suffix

    for i from 1 to patternLength − 1:
        while prefixLength > 0 and pattern[i] != pattern[prefixLength]:
            prefixLength ← failure[prefixLength − 1]   // fall back to a shorter candidate prefix-suffix
        if pattern[i] == pattern[prefixLength]:
            prefixLength ← prefixLength + 1
        failure[i] ← prefixLength

    return failure

function kmpSearch(text, pattern):
    textLength ← length(text); patternLength ← length(pattern)
    failure ← buildFailureFunction(pattern)
    matchIndices ← empty list
    matchedLength ← 0                   // number of pattern characters currently matched

    for i from 0 to textLength − 1:
        while matchedLength > 0 and text[i] != pattern[matchedLength]:
            matchedLength ← failure[matchedLength − 1]   // skip ahead using precomputed knowledge
        if text[i] == pattern[matchedLength]:
            matchedLength ← matchedLength + 1
        if matchedLength == patternLength:
            matchIndices.append(i − patternLength + 1)   // full match found
            matchedLength ← failure[matchedLength − 1]    // continue searching for overlapping matches

    return matchIndices` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Build the failure function once, in O(m): failure[i] stores the length of the longest proper prefix of pattern[0..i] that's also a suffix of it — computed incrementally using ALREADY-COMPUTED failure values for shorter prefixes, exactly like a 1D dynamic program.",
          "Scan the text once, maintaining matchedLength = the number of pattern characters currently matched in a row.",
          "On a mismatch (text[i] != pattern[matchedLength]) with matchedLength > 0, don't restart from matchedLength=0 — instead, jump matchedLength back to failure[matchedLength-1], the longest prefix of the pattern that could STILL be a valid partial match given everything matched so far, then retry the comparison.",
          "On a match, advance matchedLength by one — one more pattern character has been successfully matched in sequence.",
          "If matchedLength ever reaches patternLength (the full pattern length), a complete match has been found ending at position i — record it, then set matchedLength to failure[matchedLength-1] to continue searching for any further (possibly overlapping) matches without losing the progress already made."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The failure function correctly captures 'how much of the pattern is reusable' after a mismatch because of the following invariant: if pattern[0..matchedLength-1] matched text ending just before the mismatch, and failure[matchedLength-1] = k, then pattern[0..k-1] is GUARANTEED to also be a suffix of what was just matched in the text (since it's defined as a suffix of pattern[0..matchedLength-1], which IS what was just matched) — meaning the text already contains a valid match for pattern[0..k-1] ending at the current text position, so resuming comparison from pattern[k] (rather than pattern[0]) is provably safe and loses no possible match. The amortised O(n) bound for the main scan follows because i (the text pointer) only ever increases, while matchedLength only decreases via failure-function lookups — and since matchedLength is always bounded between 0 and its current value, the total decrease across the ENTIRE scan can never exceed the total increase, capping total work at O(n) despite the apparent nested-loop structure." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Builds the KMP "failure function" (also called the prefix function)
// for 'pattern'. failureFunction[i] stores the length of the longest
// proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
vector<int> computeFailureFunction(const string& pattern) {
    int patternLength = (int)pattern.length();
    vector<int> failureFunction(patternLength, 0);

    int prefixLength = 0; // length of the previous longest prefix-suffix match

    for (int i = 1; i < patternLength; i++) {
        // Fall back to shorter candidate prefixes while the characters don't match.
        while (prefixLength > 0 && pattern[i] != pattern[prefixLength]) {
            prefixLength = failureFunction[prefixLength - 1];
        }

        // Extend the match if the current characters agree.
        if (pattern[i] == pattern[prefixLength]) {
            prefixLength++;
        }

        failureFunction[i] = prefixLength;
    }

    return failureFunction;
}

// Searches 'text' for every occurrence of 'pattern' using the failure
// function to skip ahead intelligently after a mismatch, and prints
// the starting index of each match found.
void kmpSearch(const string& text, const string& pattern) {
    int textLength = (int)text.length();
    int patternLength = (int)pattern.length();

    vector<int> failureFunction = computeFailureFunction(pattern);

    int matchedLength = 0; // number of pattern characters currently matched in a row

    for (int i = 0; i < textLength; i++) {
        // Fall back using the failure function while characters disagree.
        while (matchedLength > 0 && text[i] != pattern[matchedLength]) {
            matchedLength = failureFunction[matchedLength - 1];
        }

        // Extend the current match if the characters agree.
        if (text[i] == pattern[matchedLength]) {
            matchedLength++;
        }

        // A full match has been found when the matched length equals
        // the pattern's full length.
        if (matchedLength == patternLength) {
            int matchStartIndex = i - patternLength + 1;
            cout << "Pattern found at index " << matchStartIndex << endl;

            // Continue searching for further (possibly overlapping) matches
            // without losing the progress already recorded by the failure function.
            matchedLength = failureFunction[matchedLength - 1];
        }
    }
}

int main() {
    // Static demonstration data — deterministic output on every run.
    string text = "ABABDABACDABABCABAB";
    string pattern = "ABABCABAB";

    cout << "Text: " << text << endl;
    cout << "Pattern: " << pattern << endl;
    kmpSearch(text, pattern);

    return 0;
}
`,
        "python": `def compute_failure_function(pattern):
    """
    Builds the KMP "failure function" (also called the prefix function)
    for 'pattern'. failure_function[i] stores the length of the longest
    proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
    """
    pattern_length = len(pattern)
    failure_function = [0] * pattern_length

    prefix_length = 0  # length of the previous longest prefix-suffix match

    for i in range(1, pattern_length):
        # Fall back to shorter candidate prefixes while the characters don't match.
        while prefix_length > 0 and pattern[i] != pattern[prefix_length]:
            prefix_length = failure_function[prefix_length - 1]

        # Extend the match if the current characters agree.
        if pattern[i] == pattern[prefix_length]:
            prefix_length += 1

        failure_function[i] = prefix_length

    return failure_function


def kmp_search(text, pattern):
    """
    Searches 'text' for every occurrence of 'pattern' using the failure
    function to skip ahead intelligently after a mismatch, and returns
    the list of starting indices where matches were found.
    """
    text_length = len(text)
    pattern_length = len(pattern)

    failure_function = compute_failure_function(pattern)
    match_indices = []

    matched_length = 0  # number of pattern characters currently matched in a row

    for i in range(text_length):
        # Fall back using the failure function while characters disagree.
        while matched_length > 0 and text[i] != pattern[matched_length]:
            matched_length = failure_function[matched_length - 1]

        # Extend the current match if the characters agree.
        if text[i] == pattern[matched_length]:
            matched_length += 1

        # A full match has been found when the matched length equals
        # the pattern's full length.
        if matched_length == pattern_length:
            match_start_index = i - pattern_length + 1
            match_indices.append(match_start_index)

            # Continue searching for further (possibly overlapping) matches
            # without losing the progress already recorded by the failure function.
            matched_length = failure_function[matched_length - 1]

    return match_indices


def main():
    # Static demonstration data - deterministic output on every run.
    text = "ABABDABACDABABCABAB"
    pattern = "ABABCABAB"

    print(f"Text: {text}")
    print(f"Pattern: {pattern}")

    matches = kmp_search(text, pattern)
    for index in matches:
        print(f"Pattern found at index {index}")


if __name__ == "__main__":
    main()
`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {

    // Builds the KMP "failure function" (also called the prefix function)
    // for 'pattern'. failureFunction[i] stores the length of the longest
    // proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
    static int[] computeFailureFunction(String pattern) {
        int patternLength = pattern.length();
        int[] failureFunction = new int[patternLength];

        int prefixLength = 0; // length of the previous longest prefix-suffix match

        for (int i = 1; i < patternLength; i++) {
            // Fall back to shorter candidate prefixes while the characters don't match.
            while (prefixLength > 0 && pattern.charAt(i) != pattern.charAt(prefixLength)) {
                prefixLength = failureFunction[prefixLength - 1];
            }

            // Extend the match if the current characters agree.
            if (pattern.charAt(i) == pattern.charAt(prefixLength)) {
                prefixLength++;
            }

            failureFunction[i] = prefixLength;
        }

        return failureFunction;
    }

    // Searches 'text' for every occurrence of 'pattern' using the failure
    // function to skip ahead intelligently after a mismatch, and returns
    // the list of starting indices where matches were found.
    static List<Integer> kmpSearch(String text, String pattern) {
        int textLength = text.length();
        int patternLength = pattern.length();

        int[] failureFunction = computeFailureFunction(pattern);
        List<Integer> matchIndices = new ArrayList<>();

        int matchedLength = 0; // number of pattern characters currently matched in a row

        for (int i = 0; i < textLength; i++) {
            // Fall back using the failure function while characters disagree.
            while (matchedLength > 0 && text.charAt(i) != pattern.charAt(matchedLength)) {
                matchedLength = failureFunction[matchedLength - 1];
            }

            // Extend the current match if the characters agree.
            if (text.charAt(i) == pattern.charAt(matchedLength)) {
                matchedLength++;
            }

            // A full match has been found when the matched length equals
            // the pattern's full length.
            if (matchedLength == patternLength) {
                int matchStartIndex = i - patternLength + 1;
                matchIndices.add(matchStartIndex);

                // Continue searching for further (possibly overlapping) matches
                // without losing the progress already recorded by the failure function.
                matchedLength = failureFunction[matchedLength - 1];
            }
        }

        return matchIndices;
    }

    public static void main(String[] args) {
        // Static demonstration data — deterministic output on every run.
        String text = "ABABDABACDABABCABAB";
        String pattern = "ABABCABAB";

        System.out.println("Text: " + text);
        System.out.println("Pattern: " + pattern);

        List<Integer> matches = kmpSearch(text, pattern);
        for (int index : matches) {
            System.out.println("Pattern found at index " + index);
        }
    }
}
`,
        "js": `// Builds the KMP "failure function" (also called the prefix function)
// for 'pattern'. failureFunction[i] stores the length of the longest
// proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
function computeFailureFunction(pattern) {
    const patternLength = pattern.length;
    const failureFunction = new Array(patternLength).fill(0);

    let prefixLength = 0; // length of the previous longest prefix-suffix match

    for (let i = 1; i < patternLength; i++) {
        // Fall back to shorter candidate prefixes while the characters don't match.
        while (prefixLength > 0 && pattern[i] !== pattern[prefixLength]) {
            prefixLength = failureFunction[prefixLength - 1];
        }

        // Extend the match if the current characters agree.
        if (pattern[i] === pattern[prefixLength]) {
            prefixLength++;
        }

        failureFunction[i] = prefixLength;
    }

    return failureFunction;
}

// Searches 'text' for every occurrence of 'pattern' using the failure
// function to skip ahead intelligently after a mismatch, and returns
// the list of starting indices where matches were found.
function kmpSearch(text, pattern) {
    const textLength = text.length;
    const patternLength = pattern.length;

    const failureFunction = computeFailureFunction(pattern);
    const matchIndices = [];

    let matchedLength = 0; // number of pattern characters currently matched in a row

    for (let i = 0; i < textLength; i++) {
        // Fall back using the failure function while characters disagree.
        while (matchedLength > 0 && text[i] !== pattern[matchedLength]) {
            matchedLength = failureFunction[matchedLength - 1];
        }

        // Extend the current match if the characters agree.
        if (text[i] === pattern[matchedLength]) {
            matchedLength++;
        }

        // A full match has been found when the matched length equals
        // the pattern's full length.
        if (matchedLength === patternLength) {
            const matchStartIndex = i - patternLength + 1;
            matchIndices.push(matchStartIndex);

            // Continue searching for further (possibly overlapping) matches
            // without losing the progress already recorded by the failure function.
            matchedLength = failureFunction[matchedLength - 1];
        }
    }

    return matchIndices;
}

function main() {
    // Static demonstration data — deterministic output on every run.
    const text = "ABABDABACDABABCABAB";
    const pattern = "ABABCABAB";

    console.log("Text: " + text);
    console.log("Pattern: " + pattern);

    const matches = kmpSearch(text, pattern);
    for (const index of matches) {
        console.log("Pattern found at index " + index);
    }
}

main();
`,
        "c": `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Builds the KMP "failure function" (also called the prefix function)
// for 'pattern'. failureFunction[i] stores the length of the longest
// proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
void computeFailureFunction(const char* pattern, int patternLength, int* failureFunction) {
    failureFunction[0] = 0;
    int prefixLength = 0; /* length of the previous longest prefix-suffix match */

    for (int i = 1; i < patternLength; i++) {
        /* Fall back to shorter candidate prefixes while the characters don't match. */
        while (prefixLength > 0 && pattern[i] != pattern[prefixLength]) {
            prefixLength = failureFunction[prefixLength - 1];
        }

        /* Extend the match if the current characters agree. */
        if (pattern[i] == pattern[prefixLength]) {
            prefixLength++;
        }

        failureFunction[i] = prefixLength;
    }
}

// Searches 'text' for every occurrence of 'pattern' using the failure
// function to skip ahead intelligently after a mismatch, and prints
// the starting index of each match found.
void kmpSearch(const char* text, const char* pattern) {
    int textLength = (int)strlen(text);
    int patternLength = (int)strlen(pattern);

    int* failureFunction = (int*)malloc(patternLength * sizeof(int));
    computeFailureFunction(pattern, patternLength, failureFunction);

    int matchedLength = 0; /* number of pattern characters currently matched in a row */

    for (int i = 0; i < textLength; i++) {
        /* Fall back using the failure function while characters disagree. */
        while (matchedLength > 0 && text[i] != pattern[matchedLength]) {
            matchedLength = failureFunction[matchedLength - 1];
        }

        /* Extend the current match if the characters agree. */
        if (text[i] == pattern[matchedLength]) {
            matchedLength++;
        }

        /* A full match has been found when the matched length equals
           the pattern's full length. */
        if (matchedLength == patternLength) {
            int matchStartIndex = i - patternLength + 1;
            printf("Pattern found at index %d\\n", matchStartIndex);

            /* Continue searching for further (possibly overlapping) matches
               without losing the progress already recorded by the failure function. */
            matchedLength = failureFunction[matchedLength - 1];
        }
    }

    free(failureFunction);
}

int main() {
    /* Static demonstration data - deterministic output on every run. */
    const char* text = "ABABDABACDABABCABAB";
    const char* pattern = "ABABCABAB";

    printf("Text: %s\\n", text);
    printf("Pattern: %s\\n", pattern);
    kmpSearch(text, pattern);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {

    // Builds the KMP "failure function" (also called the prefix function)
    // for 'pattern'. failureFunction[i] stores the length of the longest
    // proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
    static int[] ComputeFailureFunction(string pattern) {
        int patternLength = pattern.Length;
        int[] failureFunction = new int[patternLength];

        int prefixLength = 0; // length of the previous longest prefix-suffix match

        for (int i = 1; i < patternLength; i++) {
            // Fall back to shorter candidate prefixes while the characters don't match.
            while (prefixLength > 0 && pattern[i] != pattern[prefixLength]) {
                prefixLength = failureFunction[prefixLength - 1];
            }

            // Extend the match if the current characters agree.
            if (pattern[i] == pattern[prefixLength]) {
                prefixLength++;
            }

            failureFunction[i] = prefixLength;
        }

        return failureFunction;
    }

    // Searches 'text' for every occurrence of 'pattern' using the failure
    // function to skip ahead intelligently after a mismatch, and returns
    // the list of starting indices where matches were found.
    static List<int> KmpSearch(string text, string pattern) {
        int textLength = text.Length;
        int patternLength = pattern.Length;

        int[] failureFunction = ComputeFailureFunction(pattern);
        var matchIndices = new List<int>();

        int matchedLength = 0; // number of pattern characters currently matched in a row

        for (int i = 0; i < textLength; i++) {
            // Fall back using the failure function while characters disagree.
            while (matchedLength > 0 && text[i] != pattern[matchedLength]) {
                matchedLength = failureFunction[matchedLength - 1];
            }

            // Extend the current match if the characters agree.
            if (text[i] == pattern[matchedLength]) {
                matchedLength++;
            }

            // A full match has been found when the matched length equals
            // the pattern's full length.
            if (matchedLength == patternLength) {
                int matchStartIndex = i - patternLength + 1;
                matchIndices.Add(matchStartIndex);

                // Continue searching for further (possibly overlapping) matches
                // without losing the progress already recorded by the failure function.
                matchedLength = failureFunction[matchedLength - 1];
            }
        }

        return matchIndices;
    }

    static void Main() {
        // Static demonstration data — deterministic output on every run.
        string text = "ABABDABACDABABCABAB";
        string pattern = "ABABCABAB";

        Console.WriteLine("Text: " + text);
        Console.WriteLine("Pattern: " + pattern);

        List<int> matches = KmpSearch(text, pattern);
        foreach (int index in matches) {
            Console.WriteLine("Pattern found at index " + index);
        }
    }
}
`,
        "swift": `import Foundation

// Builds the KMP "failure function" (also called the prefix function)
// for 'pattern'. failureFunction[i] stores the length of the longest
// proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
func computeFailureFunction(_ pattern: [Character]) -> [Int] {
    let patternLength = pattern.count
    var failureFunction = [Int](repeating: 0, count: patternLength)

    var prefixLength = 0 // length of the previous longest prefix-suffix match

    if patternLength == 0 { return failureFunction }

    var i = 1
    while i < patternLength {
        // Fall back to shorter candidate prefixes while the characters don't match.
        while prefixLength > 0 && pattern[i] != pattern[prefixLength] {
            prefixLength = failureFunction[prefixLength - 1]
        }

        // Extend the match if the current characters agree.
        if pattern[i] == pattern[prefixLength] {
            prefixLength += 1
        }

        failureFunction[i] = prefixLength
        i += 1
    }

    return failureFunction
}

// Searches 'text' for every occurrence of 'pattern' using the failure
// function to skip ahead intelligently after a mismatch, and returns
// the list of starting indices where matches were found.
func kmpSearch(_ text: String, _ pattern: String) -> [Int] {
    let textChars = Array(text)
    let patternChars = Array(pattern)

    let textLength = textChars.count
    let patternLength = patternChars.count

    let failureFunction = computeFailureFunction(patternChars)
    var matchIndices: [Int] = []

    var matchedLength = 0 // number of pattern characters currently matched in a row

    for i in 0..<textLength {
        // Fall back using the failure function while characters disagree.
        while matchedLength > 0 && textChars[i] != patternChars[matchedLength] {
            matchedLength = failureFunction[matchedLength - 1]
        }

        // Extend the current match if the characters agree.
        if textChars[i] == patternChars[matchedLength] {
            matchedLength += 1
        }

        // A full match has been found when the matched length equals
        // the pattern's full length.
        if matchedLength == patternLength {
            let matchStartIndex = i - patternLength + 1
            matchIndices.append(matchStartIndex)

            // Continue searching for further (possibly overlapping) matches
            // without losing the progress already recorded by the failure function.
            matchedLength = failureFunction[matchedLength - 1]
        }
    }

    return matchIndices
}

// Static demonstration data — deterministic output on every run.
let text = "ABABDABACDABABCABAB"
let pattern = "ABABCABAB"

print("Text: \\(text)")
print("Pattern: \\(pattern)")

let matches = kmpSearch(text, pattern)
for index in matches {
    print("Pattern found at index \\(index)")
}
`,
        "kotlin": `// Builds the KMP "failure function" (also called the prefix function)
// for 'pattern'. failureFunction[i] stores the length of the longest
// proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
fun computeFailureFunction(pattern: String): IntArray {
    val patternLength = pattern.length
    val failureFunction = IntArray(patternLength)

    var prefixLength = 0 // length of the previous longest prefix-suffix match

    for (i in 1 until patternLength) {
        // Fall back to shorter candidate prefixes while the characters don't match.
        while (prefixLength > 0 && pattern[i] != pattern[prefixLength]) {
            prefixLength = failureFunction[prefixLength - 1]
        }

        // Extend the match if the current characters agree.
        if (pattern[i] == pattern[prefixLength]) {
            prefixLength++
        }

        failureFunction[i] = prefixLength
    }

    return failureFunction
}

// Searches 'text' for every occurrence of 'pattern' using the failure
// function to skip ahead intelligently after a mismatch, and returns
// the list of starting indices where matches were found.
fun kmpSearch(text: String, pattern: String): List<Int> {
    val textLength = text.length
    val patternLength = pattern.length

    val failureFunction = computeFailureFunction(pattern)
    val matchIndices = mutableListOf<Int>()

    var matchedLength = 0 // number of pattern characters currently matched in a row

    for (i in 0 until textLength) {
        // Fall back using the failure function while characters disagree.
        while (matchedLength > 0 && text[i] != pattern[matchedLength]) {
            matchedLength = failureFunction[matchedLength - 1]
        }

        // Extend the current match if the characters agree.
        if (text[i] == pattern[matchedLength]) {
            matchedLength++
        }

        // A full match has been found when the matched length equals
        // the pattern's full length.
        if (matchedLength == patternLength) {
            val matchStartIndex = i - patternLength + 1
            matchIndices.add(matchStartIndex)

            // Continue searching for further (possibly overlapping) matches
            // without losing the progress already recorded by the failure function.
            matchedLength = failureFunction[matchedLength - 1]
        }
    }

    return matchIndices
}

fun main() {
    // Static demonstration data — deterministic output on every run.
    val text = "ABABDABACDABABCABAB"
    val pattern = "ABABCABAB"

    println("Text: $text")
    println("Pattern: $pattern")

    val matches = kmpSearch(text, pattern)
    for (index in matches) {
        println("Pattern found at index $index")
    }
}
`,
        "scala": `object Main extends App {

  // Builds the KMP "failure function" (also called the prefix function)
  // for 'pattern'. failureFunction(i) stores the length of the longest
  // proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
  def computeFailureFunction(pattern: String): Array[Int] = {
    val patternLength = pattern.length
    val failureFunction = new Array[Int](patternLength)

    var prefixLength = 0 // length of the previous longest prefix-suffix match

    for (i <- 1 until patternLength) {
      // Fall back to shorter candidate prefixes while the characters don't match.
      while (prefixLength > 0 && pattern(i) != pattern(prefixLength)) {
        prefixLength = failureFunction(prefixLength - 1)
      }

      // Extend the match if the current characters agree.
      if (pattern(i) == pattern(prefixLength)) {
        prefixLength += 1
      }

      failureFunction(i) = prefixLength
    }

    failureFunction
  }

  // Searches 'text' for every occurrence of 'pattern' using the failure
  // function to skip ahead intelligently after a mismatch, and returns
  // the list of starting indices where matches were found.
  def kmpSearch(text: String, pattern: String): List[Int] = {
    val textLength = text.length
    val patternLength = pattern.length

    val failureFunction = computeFailureFunction(pattern)
    var matchIndices = List[Int]()

    var matchedLength = 0 // number of pattern characters currently matched in a row

    for (i <- 0 until textLength) {
      // Fall back using the failure function while characters disagree.
      while (matchedLength > 0 && text(i) != pattern(matchedLength)) {
        matchedLength = failureFunction(matchedLength - 1)
      }

      // Extend the current match if the characters agree.
      if (text(i) == pattern(matchedLength)) {
        matchedLength += 1
      }

      // A full match has been found when the matched length equals
      // the pattern's full length.
      if (matchedLength == patternLength) {
        val matchStartIndex = i - patternLength + 1
        matchIndices = matchIndices :+ matchStartIndex

        // Continue searching for further (possibly overlapping) matches
        // without losing the progress already recorded by the failure function.
        matchedLength = failureFunction(matchedLength - 1)
      }
    }

    matchIndices
  }

  // Static demonstration data — deterministic output on every run.
  val text = "ABABDABACDABABCABAB"
  val pattern = "ABABCABAB"

  println(s"Text: $text")
  println(s"Pattern: $pattern")

  val matches = kmpSearch(text, pattern)
  matches.foreach(index => println(s"Pattern found at index $index"))
}
`,
        "go": `package main

import "fmt"

// computeFailureFunction builds the KMP "failure function" (also called
// the prefix function) for pattern. failureFunction[i] stores the length
// of the longest proper prefix of pattern[0..i] that is also a suffix
// of pattern[0..i].
func computeFailureFunction(pattern string) []int {
	patternLength := len(pattern)
	failureFunction := make([]int, patternLength)

	prefixLength := 0 // length of the previous longest prefix-suffix match

	for i := 1; i < patternLength; i++ {
		// Fall back to shorter candidate prefixes while the characters don't match.
		for prefixLength > 0 && pattern[i] != pattern[prefixLength] {
			prefixLength = failureFunction[prefixLength-1]
		}

		// Extend the match if the current characters agree.
		if pattern[i] == pattern[prefixLength] {
			prefixLength++
		}

		failureFunction[i] = prefixLength
	}

	return failureFunction
}

// kmpSearch searches text for every occurrence of pattern using the
// failure function to skip ahead intelligently after a mismatch, and
// returns the list of starting indices where matches were found.
func kmpSearch(text string, pattern string) []int {
	textLength := len(text)
	patternLength := len(pattern)

	failureFunction := computeFailureFunction(pattern)
	matchIndices := []int{}

	matchedLength := 0 // number of pattern characters currently matched in a row

	for i := 0; i < textLength; i++ {
		// Fall back using the failure function while characters disagree.
		for matchedLength > 0 && text[i] != pattern[matchedLength] {
			matchedLength = failureFunction[matchedLength-1]
		}

		// Extend the current match if the characters agree.
		if text[i] == pattern[matchedLength] {
			matchedLength++
		}

		// A full match has been found when the matched length equals
		// the pattern's full length.
		if matchedLength == patternLength {
			matchStartIndex := i - patternLength + 1
			matchIndices = append(matchIndices, matchStartIndex)

			// Continue searching for further (possibly overlapping) matches
			// without losing the progress already recorded by the failure function.
			matchedLength = failureFunction[matchedLength-1]
		}
	}

	return matchIndices
}

func main() {
	// Static demonstration data - deterministic output on every run.
	text := "ABABDABACDABABCABAB"
	pattern := "ABABCABAB"

	fmt.Println("Text:", text)
	fmt.Println("Pattern:", pattern)

	matches := kmpSearch(text, pattern)
	for _, index := range matches {
		fmt.Println("Pattern found at index", index)
	}
}
`,
        "rust": `// Builds the KMP "failure function" (also called the prefix function)
// for 'pattern'. failure_function[i] stores the length of the longest
// proper prefix of pattern[0..i] that is also a suffix of pattern[0..i].
fn compute_failure_function(pattern: &[u8]) -> Vec<usize> {
    let pattern_length = pattern.len();
    let mut failure_function = vec![0usize; pattern_length];

    let mut prefix_length: usize = 0; // length of the previous longest prefix-suffix match

    let mut i = 1;
    while i < pattern_length {
        // Fall back to shorter candidate prefixes while the characters don't match.
        while prefix_length > 0 && pattern[i] != pattern[prefix_length] {
            prefix_length = failure_function[prefix_length - 1];
        }

        // Extend the match if the current characters agree.
        if pattern[i] == pattern[prefix_length] {
            prefix_length += 1;
        }

        failure_function[i] = prefix_length;
        i += 1;
    }

    failure_function
}

// Searches 'text' for every occurrence of 'pattern' using the failure
// function to skip ahead intelligently after a mismatch, and returns
// the list of starting indices where matches were found.
fn kmp_search(text: &str, pattern: &str) -> Vec<usize> {
    let text_bytes = text.as_bytes();
    let pattern_bytes = pattern.as_bytes();

    let text_length = text_bytes.len();
    let pattern_length = pattern_bytes.len();

    if pattern_length == 0 {
        return Vec::new();
    }

    let failure_function = compute_failure_function(pattern_bytes);
    let mut match_indices: Vec<usize> = Vec::new();

    let mut matched_length: usize = 0; // number of pattern characters currently matched in a row

    for i in 0..text_length {
        // Fall back using the failure function while characters disagree.
        while matched_length > 0 && text_bytes[i] != pattern_bytes[matched_length] {
            matched_length = failure_function[matched_length - 1];
        }

        // Extend the current match if the characters agree.
        if text_bytes[i] == pattern_bytes[matched_length] {
            matched_length += 1;
        }

        // A full match has been found when the matched length equals
        // the pattern's full length.
        if matched_length == pattern_length {
            let match_start_index = i - pattern_length + 1;
            match_indices.push(match_start_index);

            // Continue searching for further (possibly overlapping) matches
            // without losing the progress already recorded by the failure function.
            matched_length = failure_function[matched_length - 1];
        }
    }

    match_indices
}

fn main() {
    // Static demonstration data - deterministic output on every run.
    let text = "ABABDABACDABABCABAB";
    let pattern = "ABABCABAB";

    println!("Text: {}", text);
    println!("Pattern: {}", pattern);

    let matches = kmp_search(text, pattern);
    for index in matches {
        println!("Pattern found at index {}", index);
    }
}
`
      }
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
            "j and i together make a combined total of n character visits as they converge toward the middle: O(n)",
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
          { tag: "ul", items: ["j, i pointers — O(1)"] }
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
`function isPalindrome(strInput):
    j  ← 0
    i ← length(strInput) − 1

    while j < i:
        while j < i and not isAlphanumeric(strInput[j]):
            j ← j + 1
        while j < i and not isAlphanumeric(strInput[i]):
            i ← i − 1

        if toLowerCase(strInput[j]) != toLowerCase(strInput[i]):
            return false

        j  ← j + 1
        i ← i − 1

    return true` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Initialise j at the start and i at the end of the string.",
          "Before comparing, skip past any non-alphanumeric characters from BOTH ends — this performs normalisation on the fly without needing to build a separate cleaned string.",
          "Compare the two characters (case-folded to lowercase) at the current j and i positions. If they differ, the string is definitively not a palindrome — return false immediately.",
          "If they match, move both pointers inward by one and repeat.",
          "If the pointers meet or cross (j >= i) without ever finding a mismatch, every symmetric pair of characters matched — the string is a valid palindrome."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "A string is a palindrome if and only if, for every valid index i, the character at position i equals the character at the mirrored position (length − 1 − i). The two-pointer approach directly checks exactly this condition for every symmetric pair, working from the outside in: j and i always represent a mirrored pair relative to the (normalised) string's center, and since j only increases and i only decreases, every pair is checked exactly once, with no pair skipped or double-checked. Skipping non-alphanumeric characters from both ends before each comparison correctly implements the 'ignore punctuation and spaces' normalisation rule without altering the fundamental mirrored-pair-checking logic." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

// Returns true if 'strInput' is a palindrome once punctuation and
// spacing are ignored and case is folded to lowercase, using the
// two-pointer technique to compare mirrored characters from both ends.
bool isPalindrome(const string& strInput) {
    int j = 0;
    int i = (int)strInput.length() - 1;

    while (j < i) {
        // Skip non-alphanumeric characters approaching from the left.
        while (j < i && !isalnum((unsigned char)strInput[j])) {
            j++;
        }

        // Skip non-alphanumeric characters approaching from the right.
        while (j < i && !isalnum((unsigned char)strInput[i])) {
            i--;
        }

        // Compare the two mirrored characters, case-insensitively.
        char leftChar = (char)tolower((unsigned char)strInput[j]);
        char rightChar = (char)tolower((unsigned char)strInput[i]);

        if (leftChar != rightChar) {
            return false;
        }

        j++;
        i--;
    }

    return true;
}

int main() {
    // Static demonstration data — deterministic output on every run.
    string sampleText = "A man, a plan, a canal: Panama";

    bool result = isPalindrome(sampleText);
    cout << "Input string: " << sampleText << endl;
    cout << "Is valid palindrome? " << (result ? "true" : "false") << endl;

    return 0;
}
`,
        "python": `def is_palindrome(input_string):
    """
    Returns True if 'input_string' is a palindrome once punctuation and
    spacing are ignored and case is folded to lowercase, using the
    two-pointer technique to compare mirrored characters from both ends.
    """
    left_index = 0
    right_index = len(input_string) - 1

    while left_index < right_index:
        # Skip non-alphanumeric characters approaching from the left.
        while left_index < right_index and not input_string[left_index].isalnum():
            left_index += 1

        # Skip non-alphanumeric characters approaching from the right.
        while left_index < right_index and not input_string[right_index].isalnum():
            right_index -= 1

        # Compare the two mirrored characters, case-insensitively.
        left_char = input_string[left_index].lower()
        right_char = input_string[right_index].lower()

        if left_char != right_char:
            return False

        left_index += 1
        right_index -= 1

    return True


def main():
    # Static demonstration data - deterministic output on every run.
    sample_text = "A man, a plan, a canal: Panama"

    result = is_palindrome(sample_text)
    print(f"Input string: {sample_text}")
    print(f"Is valid palindrome? {'true' if result else 'false'}")


if __name__ == "__main__":
    main()
`,
        "java": `public class Main {

    // Returns true if 'strInput' is a palindrome once punctuation and
    // spacing are ignored and case is folded to lowercase, using the
    // two-pointer technique to compare mirrored characters from both ends.
    static boolean isPalindrome(String strInput) {
        int j = 0;
        int i = strInput.length() - 1;

        while (j < i) {
            // Skip non-alphanumeric characters approaching from the left.
            while (j < i && !Character.isLetterOrDigit(strInput.charAt(j))) {
                j++;
            }

            // Skip non-alphanumeric characters approaching from the right.
            while (j < i && !Character.isLetterOrDigit(strInput.charAt(i))) {
                i--;
            }

            // Compare the two mirrored characters, case-insensitively.
            char leftChar = Character.toLowerCase(strInput.charAt(j));
            char rightChar = Character.toLowerCase(strInput.charAt(i));

            if (leftChar != rightChar) {
                return false;
            }

            j++;
            i--;
        }

        return true;
    }

    public static void main(String[] args) {
        // Static demonstration data — deterministic output on every run.
        String sampleText = "A man, a plan, a canal: Panama";

        boolean result = isPalindrome(sampleText);
        System.out.println("Input string: " + sampleText);
        System.out.println("Is valid palindrome? " + result);
    }
}
`,
        "js": `// Returns true if 'strInput' is a palindrome once punctuation and
// spacing are ignored and case is folded to lowercase, using the
// two-pointer technique to compare mirrored characters from both ends.
function isPalindrome(strInput) {
    const isAlphanumeric = (char) => /[a-zA-Z0-9]/.test(char);

    let j = 0;
    let i = strInput.length - 1;

    while (j < i) {
        // Skip non-alphanumeric characters approaching from the left.
        while (j < i && !isAlphanumeric(strInput[j])) {
            j++;
        }

        // Skip non-alphanumeric characters approaching from the right.
        while (j < i && !isAlphanumeric(strInput[i])) {
            i--;
        }

        // Compare the two mirrored characters, case-insensitively.
        const leftChar = strInput[j].toLowerCase();
        const rightChar = strInput[i].toLowerCase();

        if (leftChar !== rightChar) {
            return false;
        }

        j++;
        i--;
    }

    return true;
}

function main() {
    // Static demonstration data — deterministic output on every run.
    const sampleText = "A man, a plan, a canal: Panama";

    const result = isPalindrome(sampleText);
    console.log("Input string: " + sampleText);
    console.log("Is valid palindrome? " + result);
}

main();
`,
        "c": `#include <stdio.h>
#include <string.h>
#include <ctype.h>

// Returns 1 if 'strInput' is a palindrome once punctuation and
// spacing are ignored and case is folded to lowercase, using the
// two-pointer technique to compare mirrored characters from both ends.
int isPalindrome(const char* strInput) {
    int j = 0;
    int i = (int)strlen(strInput) - 1;

    while (j < i) {
        /* Skip non-alphanumeric characters approaching from the left. */
        while (j < i && !isalnum((unsigned char)strInput[j])) {
            j++;
        }

        /* Skip non-alphanumeric characters approaching from the right. */
        while (j < i && !isalnum((unsigned char)strInput[i])) {
            i--;
        }

        /* Compare the two mirrored characters, case-insensitively. */
        char leftChar = (char)tolower((unsigned char)strInput[j]);
        char rightChar = (char)tolower((unsigned char)strInput[i]);

        if (leftChar != rightChar) {
            return 0;
        }

        j++;
        i--;
    }

    return 1;
}

int main() {
    /* Static demonstration data - deterministic output on every run. */
    const char* sampleText = "A man, a plan, a canal: Panama";

    int result = isPalindrome(sampleText);
    printf("Input string: %s\\n", sampleText);
    printf("Is valid palindrome? %s\\n", result ? "true" : "false");

    return 0;
}
`,
        "c#": `using System;

class Program {

    // Returns true if 'strInput' is a palindrome once punctuation and
    // spacing are ignored and case is folded to lowercase, using the
    // two-pointer technique to compare mirrored characters from both ends.
    static bool IsPalindrome(string strInput) {
        int j = 0;
        int i = strInput.Length - 1;

        while (j < i) {
            // Skip non-alphanumeric characters approaching from the left.
            while (j < i && !char.IsLetterOrDigit(strInput[j])) {
                j++;
            }

            // Skip non-alphanumeric characters approaching from the right.
            while (j < i && !char.IsLetterOrDigit(strInput[i])) {
                i--;
            }

            // Compare the two mirrored characters, case-insensitively.
            char leftChar = char.ToLower(strInput[j]);
            char rightChar = char.ToLower(strInput[i]);

            if (leftChar != rightChar) {
                return false;
            }

            j++;
            i--;
        }

        return true;
    }

    static void Main() {
        // Static demonstration data — deterministic output on every run.
        string sampleText = "A man, a plan, a canal: Panama";

        bool result = IsPalindrome(sampleText);
        Console.WriteLine("Input string: " + sampleText);
        Console.WriteLine("Is valid palindrome? " + (result ? "true" : "false"));
    }
}
`,
        "swift": `import Foundation

// Returns true if 'strInput' is a palindrome once punctuation and
// spacing are ignored and case is folded to lowercase, using the
// two-pointer technique to compare mirrored characters from both ends.
func isPalindrome(_ strInput: String) -> Bool {
    let characters = Array(strInput)

    var j = 0
    var i = characters.count - 1

    while j < i {
        // Skip non-alphanumeric characters approaching from the left.
        while j < i && !characters[j].isLetter && !characters[j].isNumber {
            j += 1
        }

        // Skip non-alphanumeric characters approaching from the right.
        while j < i && !characters[i].isLetter && !characters[i].isNumber {
            i -= 1
        }

        // Compare the two mirrored characters, case-insensitively.
        let leftChar = Character(characters[j].lowercased())
        let rightChar = Character(characters[i].lowercased())

        if leftChar != rightChar {
            return false
        }

        j += 1
        i -= 1
    }

    return true
}

// Static demonstration data — deterministic output on every run.
let sampleText = "A man, a plan, a canal: Panama"

let result = isPalindrome(sampleText)
print("Input string: \\(sampleText)")
print("Is valid palindrome? \\(result)")
`,
        "kotlin": `// Returns true if 'strInput' is a palindrome once punctuation and
// spacing are ignored and case is folded to lowercase, using the
// two-pointer technique to compare mirrored characters from both ends.
fun isPalindrome(strInput: String): Boolean {
    var j = 0
    var i = strInput.length - 1

    while (j < i) {
        // Skip non-alphanumeric characters approaching from the left.
        while (j < i && !strInput[j].isLetterOrDigit()) {
            j++
        }

        // Skip non-alphanumeric characters approaching from the right.
        while (j < i && !strInput[i].isLetterOrDigit()) {
            i--
        }

        // Compare the two mirrored characters, case-insensitively.
        val leftChar = strInput[j].lowercaseChar()
        val rightChar = strInput[i].lowercaseChar()

        if (leftChar != rightChar) {
            return false
        }

        j++
        i--
    }

    return true
}

fun main() {
    // Static demonstration data — deterministic output on every run.
    val sampleText = "A man, a plan, a canal: Panama"

    val result = isPalindrome(sampleText)
    println("Input string: $sampleText")
    println("Is valid palindrome? $result")
}
`,
        "scala": `object Main extends App {

  // Returns true if 'strInput' is a palindrome once punctuation and
  // spacing are ignored and case is folded to lowercase, using the
  // two-pointer technique to compare mirrored characters from both ends.
  def isPalindrome(strInput: String): Boolean = {
    var j = 0
    var i = strInput.length - 1

    while (j < i) {
      // Skip non-alphanumeric characters approaching from the left.
      while (j < i && !strInput(j).isLetterOrDigit) {
        j += 1
      }

      // Skip non-alphanumeric characters approaching from the right.
      while (j < i && !strInput(i).isLetterOrDigit) {
        i -= 1
      }

      // Compare the two mirrored characters, case-insensitively.
      val leftChar = strInput(j).toLower
      val rightChar = strInput(i).toLower

      if (leftChar != rightChar) {
        return false
      }

      j += 1
      i -= 1
    }

    true
  }

  // Static demonstration data — deterministic output on every run.
  val sampleText = "A man, a plan, a canal: Panama"

  val result = isPalindrome(sampleText)
  println(s"Input string: $sampleText")
  println(s"Is valid palindrome? $result")
}
`,
        "go": `package main

import (
	"fmt"
	"unicode"
)

// isPalindrome returns true if strInput is a palindrome once
// punctuation and spacing are ignored and case is folded to lowercase,
// using the two-pointer technique to compare mirrored characters
// from both ends.
func isPalindrome(strInput string) bool {
	runes := []rune(strInput)

	j := 0
	i := len(runes) - 1

	for j < i {
		// Skip non-alphanumeric characters approaching from the left.
		for j < i && !unicode.IsLetter(runes[j]) && !unicode.IsDigit(runes[j]) {
			j++
		}

		// Skip non-alphanumeric characters approaching from the right.
		for j < i && !unicode.IsLetter(runes[i]) && !unicode.IsDigit(runes[i]) {
			i--
		}

		// Compare the two mirrored characters, case-insensitively.
		leftChar := unicode.ToLower(runes[j])
		rightChar := unicode.ToLower(runes[i])

		if leftChar != rightChar {
			return false
		}

		j++
		i--
	}

	return true
}

func main() {
	// Static demonstration data - deterministic output on every run.
	sampleText := "A man, a plan, a canal: Panama"

	result := isPalindrome(sampleText)
	fmt.Println("Input string:", sampleText)
	fmt.Println("Is valid palindrome?", result)
}
`,
        "rust": `// Returns true if 'input_string' is a palindrome once punctuation and
// spacing are ignored and case is folded to lowercase, using the
// two-pointer technique to compare mirrored characters from both ends.
fn is_palindrome(input_string: &str) -> bool {
    let characters: Vec<char> = input_string.chars().collect();

    if characters.is_empty() {
        return true;
    }

    let mut left_index: usize = 0;
    let mut right_index: usize = characters.len() - 1;

    while left_index < right_index {
        // Skip non-alphanumeric characters approaching from the left.
        while left_index < right_index && !characters[left_index].is_alphanumeric() {
            left_index += 1;
        }

        // Skip non-alphanumeric characters approaching from the right.
        while left_index < right_index && !characters[right_index].is_alphanumeric() {
            right_index -= 1;
        }

        // Compare the two mirrored characters, case-insensitively.
        let left_char = characters[left_index].to_ascii_lowercase();
        let right_char = characters[right_index].to_ascii_lowercase();

        if left_char != right_char {
            return false;
        }

        left_index += 1;
        right_index -= 1;
    }

    true
}

fn main() {
    // Static demonstration data - deterministic output on every run.
    let sample_text = "A man, a plan, a canal: Panama";

    let result = is_palindrome(sample_text);
    println!("Input string: {}", sample_text);
    println!("Is valid palindrome? {}", result);
}
`
      }
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
`function computeZArray(strInput):
    stringLength ← length(strInput)
    zValues ← array of size stringLength, all zero
    j_BoxLeft ← 0; i_BoxRight ← 0          // current Z-box boundaries [j_BoxLeft, i_BoxRight)

    for i from 1 to stringLength − 1:
        if i < i_BoxRight:
            // i is inside the current Z-box — reuse previously computed info
            zValues[i] ← min(i_BoxRight − i, zValues[i − j_BoxLeft])

        // Try to extend the match beyond what's currently known
        while i + zValues[i] < stringLength and strInput[zValues[i]] == strInput[i + zValues[i]]:
            zValues[i] ← zValues[i] + 1

        // Update the Z-box if this match extends further right than before
        if i + zValues[i] > i_BoxRight:
            j_BoxLeft ← i
            i_BoxRight ← i + zValues[i]

    return zValues

function zSearch(text, pattern):
    combinedString ← pattern + '#' + text       // '#' must not appear in either string
    zValues ← computeZArray(combinedString)
    matchIndices ← empty list

    for i from length(pattern) + 1 to length(combinedString) − 1:
        if zValues[i] == length(pattern):
            matchIndices.append(i − length(pattern) − 1)    // convert to a position in 'text'

    return matchIndices` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a 'Z-box': the range [j_BoxLeft, i_BoxRight) representing the rightmost-extending substring discovered so far that matches the string's own prefix.",
          "For each position i, if it falls WITHIN the current Z-box, its Z-value can be partially inferred from the already-computed Z-value at the MIRRORED position (i − j_BoxLeft) within the prefix — bounded by how much of the box remains (i_BoxRight − i), since the match can't be guaranteed to extend beyond the box's known boundary without further checking.",
          "After this initial inference (or starting from 0 if outside any Z-box), try to EXTEND the match further by directly comparing characters beyond what's currently known/guaranteed.",
          "If this extension pushes the match further right than the current Z-box's boundary, update the Z-box to reflect this new, further-reaching match.",
          "For pattern matching specifically: concatenate pattern + a separator character (guaranteed not to appear in either string) + text, compute the Z-array of this combined string, and any position (within the text portion) where the Z-value equals the pattern's length indicates exactly where a full pattern match occurs."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The Z-box-based shortcut is correct because of a key property of prefix-matching: if position i falls within an existing Z-box [j_BoxLeft, i_BoxRight) known to match the prefix, then the substring starting at i is GUARANTEED to match the prefix for AT LEAST min(i_BoxRight − i, zValues[i − j_BoxLeft]) characters — this follows because the substring at i, by virtue of being inside the Z-box, is itself a copy of the corresponding substring starting at (i − j_BoxLeft) in the prefix, so whatever the prefix matches starting at (i − j_BoxLeft) is mirrored exactly at i, UP TO the point where the Z-box's own boundary might cut off that guarantee. The subsequent direct-comparison extension step correctly verifies and extends beyond this guaranteed minimum where possible. The amortised O(n) bound follows because the Z-box's right boundary, i_BoxRight, only ever moves forward across the algorithm's entire execution — every direct character comparison performed during the extension step either successfully extends i_BoxRight further (contributing to its bounded total forward movement) or fails immediately (costing only O(1) and ending that position's extension attempt), so total comparison work across the whole algorithm is provably bounded by O(n)." }
      ],
      codes: {
        "c++": `#include <iostream>
#include <string>
#include <vector>
using namespace std;

// Computes the Z-array of 'strInput'. zValues[i] is the length of the
// longest substring starting at index i that matches a prefix of the
// entire string. zValues[0] is left as 0 by convention (a degenerate case).
vector<int> computeZArray(const string& strInput) {
    int stringLength = (int)strInput.length();
    vector<int> zValues(stringLength, 0);

    int j_BoxLeft = 0;   // left boundary of the current Z-box
    int i_BoxRight = 0;  // right boundary (exclusive) of the current Z-box

    for (int i = 1; i < stringLength; i++) {
        if (i < i_BoxRight) {
            // 'i' is inside the current Z-box, so we can reuse the
            // already-computed value from the mirrored prefix position.
            zValues[i] = min(i_BoxRight - i, zValues[i - j_BoxLeft]);
        }

        // Attempt to extend the match beyond what is currently guaranteed.
        while (i + zValues[i] < stringLength &&
               strInput[zValues[i]] == strInput[i + zValues[i]]) {
            zValues[i]++;
        }

        // If this match extends further right than the current box,
        // update the box to reflect the new, further-reaching match.
        if (i + zValues[i] > i_BoxRight) {
            j_BoxLeft = i;
            i_BoxRight = i + zValues[i];
        }
    }

    return zValues;
}

// Searches 'text' for every occurrence of 'pattern' by building the
// Z-array of the concatenated string pattern + '#' + text, and prints
// the index of each match found within 'text'.
void zSearch(const string& text, const string& pattern) {
    string combinedString = pattern + "#" + text;
    vector<int> zValues = computeZArray(combinedString);

    int patternLength = (int)pattern.length();
    int combinedLength = (int)combinedString.length();

    for (int i = patternLength + 1; i < combinedLength; i++) {
        if (zValues[i] == patternLength) {
            int matchIndexInText = i - patternLength - 1;
            cout << "Pattern found at index " << matchIndexInText << endl;
        }
    }
}

int main() {
    // Static demonstration data — deterministic output on every run.
    string text = "AABAACAADAABAABA";
    string pattern = "AABA";

    cout << "Text: " << text << endl;
    cout << "Pattern: " << pattern << endl;
    zSearch(text, pattern);

    return 0;
}
`,
        "python": `def compute_z_array(input_string):
    """
    Computes the Z-array of 'input_string'. z_values[i] is the length of
    the longest substring starting at index i that matches a prefix of
    the entire string. z_values[0] is left as 0 by convention.
    """
    string_length = len(input_string)
    z_values = [0] * string_length

    box_left = 0   # left boundary of the current Z-box
    box_right = 0  # right boundary (exclusive) of the current Z-box

    for i in range(1, string_length):
        if i < box_right:
            # 'i' is inside the current Z-box, so we can reuse the
            # already-computed value from the mirrored prefix position.
            z_values[i] = min(box_right - i, z_values[i - box_left])

        # Attempt to extend the match beyond what is currently guaranteed.
        while (i + z_values[i] < string_length and
               input_string[z_values[i]] == input_string[i + z_values[i]]):
            z_values[i] += 1

        # If this match extends further right than the current box,
        # update the box to reflect the new, further-reaching match.
        if i + z_values[i] > box_right:
            box_left = i
            box_right = i + z_values[i]

    return z_values


def z_search(text, pattern):
    """
    Searches 'text' for every occurrence of 'pattern' by building the
    Z-array of the concatenated string pattern + '#' + text, and returns
    the list of match indices found within 'text'.
    """
    combined_string = pattern + "#" + text
    z_values = compute_z_array(combined_string)

    pattern_length = len(pattern)
    combined_length = len(combined_string)

    match_indices = []
    for i in range(pattern_length + 1, combined_length):
        if z_values[i] == pattern_length:
            match_index_in_text = i - pattern_length - 1
            match_indices.append(match_index_in_text)

    return match_indices


def main():
    # Static demonstration data - deterministic output on every run.
    text = "AABAACAADAABAABA"
    pattern = "AABA"

    print(f"Text: {text}")
    print(f"Pattern: {pattern}")

    matches = z_search(text, pattern)
    for index in matches:
        print(f"Pattern found at index {index}")


if __name__ == "__main__":
    main()
`,
        "java": `import java.util.ArrayList;
import java.util.List;

public class Main {

    // Computes the Z-array of 'strInput'. zValues[i] is the length of the
    // longest substring starting at index i that matches a prefix of the
    // entire string. zValues[0] is left as 0 by convention.
    static int[] computeZArray(String strInput) {
        int stringLength = strInput.length();
        int[] zValues = new int[stringLength];

        int j_BoxLeft = 0;   // left boundary of the current Z-box
        int i_BoxRight = 0;  // right boundary (exclusive) of the current Z-box

        for (int i = 1; i < stringLength; i++) {
            if (i < i_BoxRight) {
                // 'i' is inside the current Z-box, so we can reuse the
                // already-computed value from the mirrored prefix position.
                zValues[i] = Math.min(i_BoxRight - i, zValues[i - j_BoxLeft]);
            }

            // Attempt to extend the match beyond what is currently guaranteed.
            while (i + zValues[i] < stringLength &&
                   strInput.charAt(zValues[i]) == strInput.charAt(i + zValues[i])) {
                zValues[i]++;
            }

            // If this match extends further right than the current box,
            // update the box to reflect the new, further-reaching match.
            if (i + zValues[i] > i_BoxRight) {
                j_BoxLeft = i;
                i_BoxRight = i + zValues[i];
            }
        }

        return zValues;
    }

    // Searches 'text' for every occurrence of 'pattern' by building the
    // Z-array of the concatenated string pattern + '#' + text, and returns
    // the list of match indices found within 'text'.
    static List<Integer> zSearch(String text, String pattern) {
        String combinedString = pattern + "#" + text;
        int[] zValues = computeZArray(combinedString);

        int patternLength = pattern.length();
        int combinedLength = combinedString.length();

        List<Integer> matchIndices = new ArrayList<>();
        for (int i = patternLength + 1; i < combinedLength; i++) {
            if (zValues[i] == patternLength) {
                int matchIndexInText = i - patternLength - 1;
                matchIndices.add(matchIndexInText);
            }
        }

        return matchIndices;
    }

    public static void main(String[] args) {
        // Static demonstration data — deterministic output on every run.
        String text = "AABAACAADAABAABA";
        String pattern = "AABA";

        System.out.println("Text: " + text);
        System.out.println("Pattern: " + pattern);

        List<Integer> matches = zSearch(text, pattern);
        for (int index : matches) {
            System.out.println("Pattern found at index " + index);
        }
    }
}
`,
        "js": `// Computes the Z-array of 'strInput'. zValues[i] is the length of the
// longest substring starting at index i that matches a prefix of the
// entire string. zValues[0] is left as 0 by convention.
function computeZArray(strInput) {
    const stringLength = strInput.length;
    const zValues = new Array(stringLength).fill(0);

    let j_BoxLeft = 0;  // left boundary of the current Z-box
    let i_BoxRight = 0; // right boundary (exclusive) of the current Z-box

    for (let i = 1; i < stringLength; i++) {
        if (i < i_BoxRight) {
            // 'i' is inside the current Z-box, so we can reuse the
            // already-computed value from the mirrored prefix position.
            zValues[i] = Math.min(i_BoxRight - i, zValues[i - j_BoxLeft]);
        }

        // Attempt to extend the match beyond what is currently guaranteed.
        while (i + zValues[i] < stringLength &&
               strInput[zValues[i]] === strInput[i + zValues[i]]) {
            zValues[i]++;
        }

        // If this match extends further right than the current box,
        // update the box to reflect the new, further-reaching match.
        if (i + zValues[i] > i_BoxRight) {
            j_BoxLeft = i;
            i_BoxRight = i + zValues[i];
        }
    }

    return zValues;
}

// Searches 'text' for every occurrence of 'pattern' by building the
// Z-array of the concatenated string pattern + '#' + text, and returns
// the list of match indices found within 'text'.
function zSearch(text, pattern) {
    const combinedString = pattern + "#" + text;
    const zValues = computeZArray(combinedString);

    const patternLength = pattern.length;
    const combinedLength = combinedString.length;

    const matchIndices = [];
    for (let i = patternLength + 1; i < combinedLength; i++) {
        if (zValues[i] === patternLength) {
            const matchIndexInText = i - patternLength - 1;
            matchIndices.push(matchIndexInText);
        }
    }

    return matchIndices;
}

function main() {
    // Static demonstration data — deterministic output on every run.
    const text = "AABAACAADAABAABA";
    const pattern = "AABA";

    console.log("Text: " + text);
    console.log("Pattern: " + pattern);

    const matches = zSearch(text, pattern);
    for (const index of matches) {
        console.log("Pattern found at index " + index);
    }
}

main();
`,
        "c": `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// Computes the Z-array of 'strInput' into 'zValues'. zValues[i] is the
// length of the longest substring starting at index i that matches a
// prefix of the entire string. zValues[0] is left as 0 by convention.
void computeZArray(const char* strInput, int stringLength, int* zValues) {
    for (int i = 0; i < stringLength; i++) {
        zValues[i] = 0;
    }

    int j_BoxLeft = 0;  /* left boundary of the current Z-box */
    int i_BoxRight = 0; /* right boundary (exclusive) of the current Z-box */

    for (int i = 1; i < stringLength; i++) {
        if (i < i_BoxRight) {
            /* 'i' is inside the current Z-box, so we can reuse the
               already-computed value from the mirrored prefix position. */
            int remainingBoxWidth = i_BoxRight - i;
            int mirroredValue = zValues[i - j_BoxLeft];
            zValues[i] = (remainingBoxWidth < mirroredValue) ? remainingBoxWidth : mirroredValue;
        }

        /* Attempt to extend the match beyond what is currently guaranteed. */
        while (i + zValues[i] < stringLength &&
               strInput[zValues[i]] == strInput[i + zValues[i]]) {
            zValues[i]++;
        }

        /* If this match extends further right than the current box,
           update the box to reflect the new, further-reaching match. */
        if (i + zValues[i] > i_BoxRight) {
            j_BoxLeft = i;
            i_BoxRight = i + zValues[i];
        }
    }
}

// Searches 'text' for every occurrence of 'pattern' by building the
// Z-array of the concatenated string pattern + '#' + text, and prints
// the index of each match found within 'text'.
void zSearch(const char* text, const char* pattern) {
    int textLength = (int)strlen(text);
    int patternLength = (int)strlen(pattern);
    int combinedLength = patternLength + 1 + textLength;

    char* combinedString = (char*)malloc((combinedLength + 1) * sizeof(char));
    snprintf(combinedString, combinedLength + 1, "%s#%s", pattern, text);

    int* zValues = (int*)malloc(combinedLength * sizeof(int));
    computeZArray(combinedString, combinedLength, zValues);

    for (int i = patternLength + 1; i < combinedLength; i++) {
        if (zValues[i] == patternLength) {
            int matchIndexInText = i - patternLength - 1;
            printf("Pattern found at index %d\\n", matchIndexInText);
        }
    }

    free(combinedString);
    free(zValues);
}

int main() {
    /* Static demonstration data - deterministic output on every run. */
    const char* text = "AABAACAADAABAABA";
    const char* pattern = "AABA";

    printf("Text: %s\\n", text);
    printf("Pattern: %s\\n", pattern);
    zSearch(text, pattern);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {

    // Computes the Z-array of 'strInput'. zValues[i] is the length of the
    // longest substring starting at index i that matches a prefix of the
    // entire string. zValues[0] is left as 0 by convention.
    static int[] ComputeZArray(string strInput) {
        int stringLength = strInput.Length;
        int[] zValues = new int[stringLength];

        int j_BoxLeft = 0;  // left boundary of the current Z-box
        int i_BoxRight = 0; // right boundary (exclusive) of the current Z-box

        for (int i = 1; i < stringLength; i++) {
            if (i < i_BoxRight) {
                // 'i' is inside the current Z-box, so we can reuse the
                // already-computed value from the mirrored prefix position.
                zValues[i] = Math.Min(i_BoxRight - i, zValues[i - j_BoxLeft]);
            }

            // Attempt to extend the match beyond what is currently guaranteed.
            while (i + zValues[i] < stringLength &&
                   strInput[zValues[i]] == strInput[i + zValues[i]]) {
                zValues[i]++;
            }

            // If this match extends further right than the current box,
            // update the box to reflect the new, further-reaching match.
            if (i + zValues[i] > i_BoxRight) {
                j_BoxLeft = i;
                i_BoxRight = i + zValues[i];
            }
        }

        return zValues;
    }

    // Searches 'text' for every occurrence of 'pattern' by building the
    // Z-array of the concatenated string pattern + '#' + text, and returns
    // the list of match indices found within 'text'.
    static List<int> ZSearch(string text, string pattern) {
        string combinedString = pattern + "#" + text;
        int[] zValues = ComputeZArray(combinedString);

        int patternLength = pattern.Length;
        int combinedLength = combinedString.Length;

        var matchIndices = new List<int>();
        for (int i = patternLength + 1; i < combinedLength; i++) {
            if (zValues[i] == patternLength) {
                int matchIndexInText = i - patternLength - 1;
                matchIndices.Add(matchIndexInText);
            }
        }

        return matchIndices;
    }

    static void Main() {
        // Static demonstration data — deterministic output on every run.
        string text = "AABAACAADAABAABA";
        string pattern = "AABA";

        Console.WriteLine("Text: " + text);
        Console.WriteLine("Pattern: " + pattern);

        List<int> matches = ZSearch(text, pattern);
        foreach (int index in matches) {
            Console.WriteLine("Pattern found at index " + index);
        }
    }
}
`,
        "swift": `import Foundation

// Computes the Z-array of 'strInput'. zValues[i] is the length of the
// longest substring starting at index i that matches a prefix of the
// entire string. zValues[0] is left as 0 by convention.
func computeZArray(_ strInput: [Character]) -> [Int] {
    let stringLength = strInput.count
    var zValues = [Int](repeating: 0, count: stringLength)

    var j_BoxLeft = 0  // left boundary of the current Z-box
    var i_BoxRight = 0 // right boundary (exclusive) of the current Z-box

    var i = 1
    while i < stringLength {
        if i < i_BoxRight {
            // 'i' is inside the current Z-box, so we can reuse the
            // already-computed value from the mirrored prefix position.
            zValues[i] = min(i_BoxRight - i, zValues[i - j_BoxLeft])
        }

        // Attempt to extend the match beyond what is currently guaranteed.
        while i + zValues[i] < stringLength &&
              strInput[zValues[i]] == strInput[i + zValues[i]] {
            zValues[i] += 1
        }

        // If this match extends further right than the current box,
        // update the box to reflect the new, further-reaching match.
        if i + zValues[i] > i_BoxRight {
            j_BoxLeft = i
            i_BoxRight = i + zValues[i]
        }

        i += 1
    }

    return zValues
}

// Searches 'text' for every occurrence of 'pattern' by building the
// Z-array of the concatenated string pattern + '#' + text, and returns
// the list of match indices found within 'text'.
func zSearch(_ text: String, _ pattern: String) -> [Int] {
    let combinedString = Array(pattern + "#" + text)
    let zValues = computeZArray(combinedString)

    let patternLength = pattern.count
    let combinedLength = combinedString.count

    var matchIndices: [Int] = []
    var i = patternLength + 1
    while i < combinedLength {
        if zValues[i] == patternLength {
            let matchIndexInText = i - patternLength - 1
            matchIndices.append(matchIndexInText)
        }
        i += 1
    }

    return matchIndices
}

// Static demonstration data — deterministic output on every run.
let text = "AABAACAADAABAABA"
let pattern = "AABA"

print("Text: \\(text)")
print("Pattern: \\(pattern)")

let matches = zSearch(text, pattern)
for index in matches {
    print("Pattern found at index \\(index)")
}
`,
        "kotlin": `// Computes the Z-array of 'strInput'. zValues[i] is the length of the
// longest substring starting at index i that matches a prefix of the
// entire string. zValues[0] is left as 0 by convention.
fun computeZArray(strInput: String): IntArray {
    val stringLength = strInput.length
    val zValues = IntArray(stringLength)

    var j_BoxLeft = 0  // left boundary of the current Z-box
    var i_BoxRight = 0 // right boundary (exclusive) of the current Z-box

    for (i in 1 until stringLength) {
        if (i < i_BoxRight) {
            // 'i' is inside the current Z-box, so we can reuse the
            // already-computed value from the mirrored prefix position.
            zValues[i] = minOf(i_BoxRight - i, zValues[i - j_BoxLeft])
        }

        // Attempt to extend the match beyond what is currently guaranteed.
        while (i + zValues[i] < stringLength &&
               strInput[zValues[i]] == strInput[i + zValues[i]]) {
            zValues[i]++
        }

        // If this match extends further right than the current box,
        // update the box to reflect the new, further-reaching match.
        if (i + zValues[i] > i_BoxRight) {
            j_BoxLeft = i
            i_BoxRight = i + zValues[i]
        }
    }

    return zValues
}

// Searches 'text' for every occurrence of 'pattern' by building the
// Z-array of the concatenated string pattern + '#' + text, and returns
// the list of match indices found within 'text'.
fun zSearch(text: String, pattern: String): List<Int> {
    val combinedString = "$pattern#$text"
    val zValues = computeZArray(combinedString)

    val patternLength = pattern.length
    val combinedLength = combinedString.length

    val matchIndices = mutableListOf<Int>()
    for (i in (patternLength + 1) until combinedLength) {
        if (zValues[i] == patternLength) {
            val matchIndexInText = i - patternLength - 1
            matchIndices.add(matchIndexInText)
        }
    }

    return matchIndices
}

fun main() {
    // Static demonstration data — deterministic output on every run.
    val text = "AABAACAADAABAABA"
    val pattern = "AABA"

    println("Text: $text")
    println("Pattern: $pattern")

    val matches = zSearch(text, pattern)
    for (index in matches) {
        println("Pattern found at index $index")
    }
}
`,
        "scala": `object Main extends App {

  // Computes the Z-array of 'strInput'. zValues(i) is the length of the
  // longest substring starting at index i that matches a prefix of the
  // entire string. zValues(0) is left as 0 by convention.
  def computeZArray(strInput: String): Array[Int] = {
    val stringLength = strInput.length
    val zValues = new Array[Int](stringLength)

    var j_BoxLeft = 0  // left boundary of the current Z-box
    var i_BoxRight = 0 // right boundary (exclusive) of the current Z-box

    for (i <- 1 until stringLength) {
      if (i < i_BoxRight) {
        // 'i' is inside the current Z-box, so we can reuse the
        // already-computed value from the mirrored prefix position.
        zValues(i) = math.min(i_BoxRight - i, zValues(i - j_BoxLeft))
      }

      // Attempt to extend the match beyond what is currently guaranteed.
      while (i + zValues(i) < stringLength &&
             strInput(zValues(i)) == strInput(i + zValues(i))) {
        zValues(i) += 1
      }

      // If this match extends further right than the current box,
      // update the box to reflect the new, further-reaching match.
      if (i + zValues(i) > i_BoxRight) {
        j_BoxLeft = i
        i_BoxRight = i + zValues(i)
      }
    }

    zValues
  }

  // Searches 'text' for every occurrence of 'pattern' by building the
  // Z-array of the concatenated string pattern + '#' + text, and returns
  // the list of match indices found within 'text'.
  def zSearch(text: String, pattern: String): List[Int] = {
    val combinedString = pattern + "#" + text
    val zValues = computeZArray(combinedString)

    val patternLength = pattern.length
    val combinedLength = combinedString.length

    var matchIndices = List[Int]()
    for (i <- (patternLength + 1) until combinedLength) {
      if (zValues(i) == patternLength) {
        val matchIndexInText = i - patternLength - 1
        matchIndices = matchIndices :+ matchIndexInText
      }
    }

    matchIndices
  }

  // Static demonstration data — deterministic output on every run.
  val text = "AABAACAADAABAABA"
  val pattern = "AABA"

  println(s"Text: $text")
  println(s"Pattern: $pattern")

  val matches = zSearch(text, pattern)
  matches.foreach(index => println(s"Pattern found at index $index"))
}
`,
        "go": `package main

import "fmt"

// computeZArray computes the Z-array of strInput. zValues[i] is the
// length of the longest substring starting at index i that matches a
// prefix of the entire string. zValues[0] is left as 0 by convention.
func computeZArray(strInput string) []int {
	stringLength := len(strInput)
	zValues := make([]int, stringLength)

	j_BoxLeft := 0  // left boundary of the current Z-box
	i_BoxRight := 0 // right boundary (exclusive) of the current Z-box

	for i := 1; i < stringLength; i++ {
		if i < i_BoxRight {
			// i is inside the current Z-box, so we can reuse the
			// already-computed value from the mirrored prefix position.
			remainingBoxWidth := i_BoxRight - i
			mirroredValue := zValues[i-j_BoxLeft]
			if remainingBoxWidth < mirroredValue {
				zValues[i] = remainingBoxWidth
			} else {
				zValues[i] = mirroredValue
			}
		}

		// Attempt to extend the match beyond what is currently guaranteed.
		for i+zValues[i] < stringLength && strInput[zValues[i]] == strInput[i+zValues[i]] {
			zValues[i]++
		}

		// If this match extends further right than the current box,
		// update the box to reflect the new, further-reaching match.
		if i+zValues[i] > i_BoxRight {
			j_BoxLeft = i
			i_BoxRight = i + zValues[i]
		}
	}

	return zValues
}

// zSearch searches text for every occurrence of pattern by building the
// Z-array of the concatenated string pattern + "#" + text, and returns
// the list of match indices found within text.
func zSearch(text string, pattern string) []int {
	combinedString := pattern + "#" + text
	zValues := computeZArray(combinedString)

	patternLength := len(pattern)
	combinedLength := len(combinedString)

	matchIndices := []int{}
	for i := patternLength + 1; i < combinedLength; i++ {
		if zValues[i] == patternLength {
			matchIndexInText := i - patternLength - 1
			matchIndices = append(matchIndices, matchIndexInText)
		}
	}

	return matchIndices
}

func main() {
	// Static demonstration data - deterministic output on every run.
	text := "AABAACAADAABAABA"
	pattern := "AABA"

	fmt.Println("Text:", text)
	fmt.Println("Pattern:", pattern)

	matches := zSearch(text, pattern)
	for _, index := range matches {
		fmt.Println("Pattern found at index", index)
	}
}
`,
        "rust": `// Computes the Z-array of 'input_string'. z_values[i] is the length of
// the longest substring starting at index i that matches a prefix of
// the entire string. z_values[0] is left as 0 by convention.
fn compute_z_array(input_string: &[u8]) -> Vec<usize> {
    let string_length = input_string.len();
    let mut z_values = vec![0usize; string_length];

    let mut box_left: usize = 0;  // left boundary of the current Z-box
    let mut box_right: usize = 0; // right boundary (exclusive) of the current Z-box

    let mut i = 1;
    while i < string_length {
        if i < box_right {
            // 'i' is inside the current Z-box, so we can reuse the
            // already-computed value from the mirrored prefix position.
            let remaining_box_width = box_right - i;
            let mirrored_value = z_values[i - box_left];
            z_values[i] = remaining_box_width.min(mirrored_value);
        }

        // Attempt to extend the match beyond what is currently guaranteed.
        while i + z_values[i] < string_length
            && input_string[z_values[i]] == input_string[i + z_values[i]]
        {
            z_values[i] += 1;
        }

        // If this match extends further right than the current box,
        // update the box to reflect the new, further-reaching match.
        if i + z_values[i] > box_right {
            box_left = i;
            box_right = i + z_values[i];
        }

        i += 1;
    }

    z_values
}

// Searches 'text' for every occurrence of 'pattern' by building the
// Z-array of the concatenated string pattern + "#" + text, and returns
// the list of match indices found within 'text'.
fn z_search(text: &str, pattern: &str) -> Vec<usize> {
    let combined_string = format!("{}#{}", pattern, text);
    let combined_bytes = combined_string.as_bytes();
    let z_values = compute_z_array(combined_bytes);

    let pattern_length = pattern.len();
    let combined_length = combined_bytes.len();

    let mut match_indices: Vec<usize> = Vec::new();
    for i in (pattern_length + 1)..combined_length {
        if z_values[i] == pattern_length {
            let match_index_in_text = i - pattern_length - 1;
            match_indices.push(match_index_in_text);
        }
    }

    match_indices
}

fn main() {
    // Static demonstration data - deterministic output on every run.
    let text = "AABAACAADAABAABA";
    let pattern = "AABA";

    println!("Text: {}", text);
    println!("Pattern: {}", pattern);

    let matches = z_search(text, pattern);
    for index in matches {
        println!("Pattern found at index {}", index);
    }
}
`
      }
    }

  ],
  desc: "KMP, Rabin-Karp, Z-algorithm, trie patterns",
  complexity: "O(n + m)",
  featured: true
};

export default STRINGS_SECTION;