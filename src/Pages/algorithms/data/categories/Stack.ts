const STACKS_SECTION = {
  name: "Stacks",
  href: "/algorithms/stacks",
    iconId: "Stack",
    hoverIconId: "Stack",

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
`function isValidParentheses(strPars):
    stkOpener ← empty stack
    closingToOpening ← { ')': '(', ']': '[', '}': '{' }

    for character in strPars:
        if character in "([{":
            push(stkOpener, character)
        else:                              // character is a closing bracket
            if stkOpener is empty:
                return false               // nothing to match against
            topOpener ← pop(stkOpener)
            if topOpener != closingToOpening[character]:
                return false               // wrong type of opener

    return stkOpener is empty            // true only if every opener was matched` },
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
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
#include <string>
using namespace std;

// Returns true if every opening bracket in strPars has a matching closing bracket
// of the same type, correctly nested.
bool isValidParentheses(const string& strPars) {
    vector<char> stkOpener;

    for (char character : strPars) {
        if (character == '(' || character == '{' || character == '[') {
            // Opening bracket: remember it, waiting to be matched later.
            stkOpener.push_back(character);
            continue;
        }

        // Character is a closing bracket. If nothing is waiting to be
        // matched, this closer is definitely invalid.
        if (stkOpener.empty()) {
            return false;
        }

        char topOpener = stkOpener.back();

        if (character == ')' && topOpener != '(') return false;
        if (character == '}' && topOpener != '{') return false;
        if (character == ']' && topOpener != '[') return false;

        // Matched correctly: the most recent opener has now been closed.
        stkOpener.pop_back();
    }

    // Valid only if every opener found a matching closer.
    return stkOpener.empty();
}

int main() {
    string strPars = "{[()]}";

    cout << "String: " << strPars << endl;
    cout << (isValidParentheses(strPars) ? "Valid Parentheses" : "Invalid Parentheses") << endl;

    return 0;
}
`,
        "python": `def is_valid_parentheses(strPars):
    """Return True if every opening bracket in strPars has a matching closing
    bracket of the same type, correctly nested.
    """
    opener_stack = []
    closing_to_opening = {')': '(', ']': '[', '}': '{'}

    for character in strPars:
        if character in "([{":
            # Opening bracket: remember it, waiting to be matched later.
            opener_stack.append(character)
            continue

        # Character is a closing bracket. If nothing is waiting to be
        # matched, this closer is definitely invalid.
        if not opener_stack:
            return False

        top_opener = opener_stack.pop()
        if top_opener != closing_to_opening[character]:
            return False

    # Valid only if every opener found a matching closer.
    return len(opener_stack) == 0


if __name__ == "__main__":
    strPars = "{[()]}"

    print(f"String: {strPars}")
    print("Valid Parentheses" if is_valid_parentheses(strPars) else "Invalid Parentheses")
`,
        "java": `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

public class Main {

    // Returns true if every opening bracket in strPars has a matching closing
    // bracket of the same type, correctly nested.
    static boolean isValidParentheses(String strPars) {
        Deque<Character> stkOpener = new ArrayDeque<>();
        Map<Character, Character> closingToOpening = Map.of(
            ')', '(',
            ']', '[',
            '}', '{'
        );

        for (char character : strPars.toCharArray()) {
            if (character == '(' || character == '{' || character == '[') {
                // Opening bracket: remember it, waiting to be matched later.
                stkOpener.push(character);
                continue;
            }

            // Character is a closing bracket. If nothing is waiting to be
            // matched, this closer is definitely invalid.
            if (stkOpener.isEmpty()) {
                return false;
            }

            char topOpener = stkOpener.pop();
            if (topOpener != closingToOpening.get(character)) {
                return false;
            }
        }

        // Valid only if every opener found a matching closer.
        return stkOpener.isEmpty();
    }

    public static void main(String[] args) {
        String strPars = "{[()]}";

        System.out.println("String: " + strPars);
        System.out.println(isValidParentheses(strPars) ? "Valid Parentheses" : "Invalid Parentheses");
    }
}
`,
        "js": `// Returns true if every opening bracket in strPars has a matching closing
// bracket of the same type, correctly nested.
function isValidParentheses(strPars) {
    const stkOpener = [];
    const closingToOpening = { ")": "(", "]": "[", "}": "{" };

    for (const character of strPars) {
        if (character === "(" || character === "{" || character === "[") {
            // Opening bracket: remember it, waiting to be matched later.
            stkOpener.push(character);
            continue;
        }

        // Character is a closing bracket. If nothing is waiting to be
        // matched, this closer is definitely invalid.
        if (stkOpener.length === 0) {
            return false;
        }

        const topOpener = stkOpener.pop();
        if (topOpener !== closingToOpening[character]) {
            return false;
        }
    }

    // Valid only if every opener found a matching closer.
    return stkOpener.length === 0;
}

const strPars = "{[()]}";

console.log(\`String: \${strPars}\`);
console.log(isValidParentheses(strPars) ? "Valid Parentheses" : "Invalid Parentheses");
`,
        "c": `#include <stdio.h>
#include <string.h>

#define MAX_LENGTH 1024

// Returns 1 if every opening bracket in strPars has a matching closing bracket
// of the same type, correctly nested; otherwise returns 0.
int isValidParentheses(const char* strPars) {
    char stkOpener[MAX_LENGTH];
    int stackTop = -1; // index of the top element; -1 means empty

    for (int i = 0; strPars[i] != '\\0'; i++) {
        char character = strPars[i];

        if (character == '(' || character == '{' || character == '[') {
            // Opening bracket: remember it, waiting to be matched later.
            stackTop++;
            stkOpener[stackTop] = character;
            continue;
        }

        // Character is a closing bracket. If nothing is waiting to be
        // matched, this closer is definitely invalid.
        if (stackTop == -1) {
            return 0;
        }

        char topOpener = stkOpener[stackTop];
        stackTop--; // pop

        if (character == ')' && topOpener != '(') return 0;
        if (character == '}' && topOpener != '{') return 0;
        if (character == ']' && topOpener != '[') return 0;
    }

    // Valid only if every opener found a matching closer.
    return stackTop == -1;
}

int main() {
    const char* strPars = "{[()]}";

    printf("String: %s\\n", strPars);
    printf("%s\\n", isValidParentheses(strPars) ? "Valid Parentheses" : "Invalid Parentheses");

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    // Returns true if every opening bracket in strPars has a matching closing
    // bracket of the same type, correctly nested.
    static bool IsValidParentheses(string strPars) {
        var stkOpener = new Stack<char>();
        var closingToOpening = new Dictionary<char, char> {
            [')'] = '(',
            [']'] = '[',
            ['}'] = '{'
        };

        foreach (char character in strPars) {
            if (character == '(' || character == '{' || character == '[') {
                // Opening bracket: remember it, waiting to be matched later.
                stkOpener.Push(character);
                continue;
            }

            // Character is a closing bracket. If nothing is waiting to be
            // matched, this closer is definitely invalid.
            if (stkOpener.Count == 0) {
                return false;
            }

            char topOpener = stkOpener.Pop();
            if (topOpener != closingToOpening[character]) {
                return false;
            }
        }

        // Valid only if every opener found a matching closer.
        return stkOpener.Count == 0;
    }

    static void Main() {
        string strPars = "{[()]}";

        Console.WriteLine($"String: {strPars}");
        Console.WriteLine(IsValidParentheses(strPars) ? "Valid Parentheses" : "Invalid Parentheses");
    }
}
`,
        "swift": `import Foundation

// Returns true if every opening bracket in strPars has a matching closing
// bracket of the same type, correctly nested.
func isValidParentheses(_ strPars: String) -> Bool {
    var stkOpener: [Character] = []
    let closingToOpening: [Character: Character] = [")": "(", "]": "[", "}": "{"]

    for character in strPars {
        if character == "(" || character == "{" || character == "[" {
            // Opening bracket: remember it, waiting to be matched later.
            stkOpener.append(character)
            continue
        }

        // Character is a closing bracket. If nothing is waiting to be
        // matched, this closer is definitely invalid.
        guard let topOpener = stkOpener.popLast() else {
            return false
        }

        if topOpener != closingToOpening[character] {
            return false
        }
    }

    // Valid only if every opener found a matching closer.
    return stkOpener.isEmpty
}

let strPars = "{[()]}"

print("String: \\(strPars)")
print(isValidParentheses(strPars) ? "Valid Parentheses" : "Invalid Parentheses")
`,
        "kotlin": `fun isValidParentheses(strPars: String): Boolean {
    val stkOpener = ArrayDeque<Char>()
    val closingToOpening = mapOf(')' to '(', ']' to '[', '}' to '{')

    for (character in strPars) {
        if (character == '(' || character == '{' || character == '[') {
            // Opening bracket: remember it, waiting to be matched later.
            stkOpener.addLast(character)
            continue
        }

        // Character is a closing bracket. If nothing is waiting to be
        // matched, this closer is definitely invalid.
        if (stkOpener.isEmpty()) {
            return false
        }

        val topOpener = stkOpener.removeLast()
        if (topOpener != closingToOpening[character]) {
            return false
        }
    }

    // Valid only if every opener found a matching closer.
    return stkOpener.isEmpty()
}

fun main() {
    val strPars = "{[()]}"

    println("String: $strPars")
    println(if (isValidParentheses(strPars)) "Valid Parentheses" else "Invalid Parentheses")
}
`,
        "scala": `object Main extends App {
    // Returns true if every opening bracket in strPars has a matching closing
    // bracket of the same type, correctly nested.
    def isValidParentheses(strPars: String): Boolean = {
        val stkOpener = scala.collection.mutable.Stack[Char]()
        val closingToOpening = Map(')' -> '(', ']' -> '[', '}' -> '{')

        for (character <- strPars) {
            if (character == '(' || character == '{' || character == '[') {
                // Opening bracket: remember it, waiting to be matched later.
                stkOpener.push(character)
            } else {
                // Character is a closing bracket. If nothing is waiting to
                // be matched, this closer is definitely invalid.
                if (stkOpener.isEmpty) return false

                val topOpener = stkOpener.pop()
                if (topOpener != closingToOpening(character)) return false
            }
        }

        // Valid only if every opener found a matching closer.
        stkOpener.isEmpty
    }

    val strPars = "{[()]}"

    println(s"String: $strPars")
    println(if (isValidParentheses(strPars)) "Valid Parentheses" else "Invalid Parentheses")
}
`,
        "go": `package main

import "fmt"

// isValidParentheses returns true if every opening bracket in strPars has a
// matching closing bracket of the same type, correctly nested.
func isValidParentheses(strPars string) bool {
    stkOpener := []rune{}
    closingToOpening := map[rune]rune{')': '(', ']': '[', '}': '{'}

    for _, character := range strPars {
        if character == '(' || character == '{' || character == '[' {
            // Opening bracket: remember it, waiting to be matched later.
            stkOpener = append(stkOpener, character)
            continue
        }

        // Character is a closing bracket. If nothing is waiting to be
        // matched, this closer is definitely invalid.
        if len(stkOpener) == 0 {
            return false
        }

        topOpener := stkOpener[len(stkOpener)-1]
        stkOpener = stkOpener[:len(stkOpener)-1]

        if topOpener != closingToOpening[character] {
            return false
        }
    }

    // Valid only if every opener found a matching closer.
    return len(stkOpener) == 0
}

func main() {
    strPars := "{[()]}"

    fmt.Printf("String: %s\\n", strPars)
    if isValidParentheses(strPars) {
        fmt.Println("Valid Parentheses")
    } else {
        fmt.Println("Invalid Parentheses")
    }
}
`,
        "rust": `// Returns true if every opening bracket in strPars has a matching closing
// bracket of the same type, correctly nested.
fn is_valid_parentheses(strPars: &str) -> bool {
    let mut opener_stack: Vec<char> = Vec::new();

    for character in strPars.chars() {
        match character {
            '(' | '{' | '[' => {
                // Opening bracket: remember it, waiting to be matched later.
                opener_stack.push(character);
            }
            ')' | '}' | ']' => {
                // Character is a closing bracket. If nothing is waiting to
                // be matched, this closer is definitely invalid.
                let expected_opener = match character {
                    ')' => '(',
                    '}' => '{',
                    ']' => '[',
                    _ => unreachable!(),
                };

                match opener_stack.pop() {
                    Some(top_opener) if top_opener == expected_opener => {}
                    _ => return false,
                }
            }
            _ => {}
        }
    }

    // Valid only if every opener found a matching closer.
    opener_stack.is_empty()
}

fn main() {
    let strPars = "{[()]}";

    println!("String: {}", strPars);
    println!("{}", if is_valid_parentheses(strPars) { "Valid Parentheses" } else { "Invalid Parentheses" });
}
`
      }
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
    stackMain ← empty stack
    stackMinTracking ← empty stack

    function push(value):
        push(stackMain, value)
        if stackMinTracking is empty or value <= top(stackMinTracking):
            push(stackMinTracking, value)
        else:
            push(stackMinTracking, top(stackMinTracking))   // duplicate current min

    function pop():
        pop(stackMain)
        pop(stackMinTracking)

    function top():
        return top(stackMain)

    function getMin():
        return top(stackMinTracking)` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain two stacks in perfect lockstep: stackMain holds the actual data, and stackMinTracking holds, at every position, what the minimum of the main stack was AT THE TIME that position's element was pushed.",
          "On push: always push the new value onto stackMain. For stackMinTracking, push the new value if it's a new minimum (≤ the current top of stackMinTracking), otherwise push a DUPLICATE of the current minimum — this keeps both stacks exactly the same height at all times.",
          "On pop: pop from both stacks simultaneously — since they're always the same height, this correctly 'rewinds' the minimum tracking back to whatever it was before the popped element was pushed.",
          "getMin simply peeks the top of stackMinTracking, which by construction always holds the current minimum of everything still in stackMain."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Invariant: at every point, stackMinTracking.top() equals the minimum value among all elements currently in stackMain. This holds by induction on the sequence of operations: initially (both stacks empty) it holds vacuously. On push, the new stackMinTracking top is set to min(new value, previous stackMinTracking top) — exactly the new overall minimum after adding the new value. On pop, since both stacks are popped together, stackMinTracking's new top correctly reverts to whatever the minimum was immediately before the just-removed element was pushed — which is, by the same invariant applied one step earlier, exactly the correct minimum of the now-smaller stackMain." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
struct MinStack {
    vector<int> stackMain;
    vector<int> stackMinTracking;

    void push(int value) {
        stackMain.push_back(value);

        // Keep stackMinTracking the same height as stackMain: push the new
        // running minimum (which may be a duplicate of the previous one).
        if (stackMinTracking.empty() || value <= stackMinTracking.back()) {
            stackMinTracking.push_back(value);
        } else {
            stackMinTracking.push_back(stackMinTracking.back());
        }
    }

    void pop() {
        if (stackMain.empty()) return;
        stackMain.pop_back();
        stackMinTracking.pop_back();
    }

    int top() {
        if (stackMain.empty()) return -1; // sentinel meaning "empty"
        return stackMain.back();
    }

    int getMin() {
        if (stackMinTracking.empty()) return -1; // sentinel meaning "empty"
        return stackMinTracking.back();
    }
};

void printState(MinStack& stack) {
    cout << "Top: " << stack.top() << ", Min: " << stack.getMin() << endl;
}

int main() {
    MinStack stack;

    stack.push(5);
    stack.push(2);
    stack.push(8);
    stack.push(1);
    stack.push(4);
    printState(stack); // Top: 4, Min: 1

    stack.pop(); // removes 4
    printState(stack); // Top: 1, Min: 1

    stack.pop(); // removes 1
    printState(stack); // Top: 8, Min: 2

    return 0;
}
`,
        "python": `class MinStack:
    """A stack that also supports retrieving its minimum element in O(1),
    achieved by maintaining a second stack that tracks the running minimum
    in lockstep with the main stack.
    """

    def __init__(self):
        self.main_stack = []
        self.min_tracking_stack = []

    def push(self, value):
        self.main_stack.append(value)

        # Keep min_tracking_stack the same height as main_stack: push the
        # new running minimum (which may be a duplicate of the previous one).
        if not self.min_tracking_stack or value <= self.min_tracking_stack[-1]:
            self.min_tracking_stack.append(value)
        else:
            self.min_tracking_stack.append(self.min_tracking_stack[-1])

    def pop(self):
        if not self.main_stack:
            return
        self.main_stack.pop()
        self.min_tracking_stack.pop()

    def top(self):
        if not self.main_stack:
            return -1  # sentinel meaning "empty"
        return self.main_stack[-1]

    def get_min(self):
        if not self.min_tracking_stack:
            return -1  # sentinel meaning "empty"
        return self.min_tracking_stack[-1]


def print_state(stack):
    print(f"Top: {stack.top()}, Min: {stack.get_min()}")


if __name__ == "__main__":
    stack = MinStack()

    stack.push(5)
    stack.push(2)
    stack.push(8)
    stack.push(1)
    stack.push(4)
    print_state(stack)  # Top: 4, Min: 1

    stack.pop()  # removes 4
    print_state(stack)  # Top: 1, Min: 1

    stack.pop()  # removes 1
    print_state(stack)  # Top: 8, Min: 2
`,
        "java": `import java.util.ArrayDeque;
import java.util.Deque;

public class Main {

    // A stack that also supports retrieving its minimum element in O(1),
    // achieved by maintaining a second stack that tracks the running
    // minimum in lockstep with the main stack.
    static class MinStack {
        private final Deque<Integer> stackMain = new ArrayDeque<>();
        private final Deque<Integer> stackMinTracking = new ArrayDeque<>();

        void push(int value) {
            stackMain.push(value);

            // Keep stackMinTracking the same height as stackMain: push the
            // new running minimum (which may be a duplicate of the previous one).
            if (stackMinTracking.isEmpty() || value <= stackMinTracking.peek()) {
                stackMinTracking.push(value);
            } else {
                stackMinTracking.push(stackMinTracking.peek());
            }
        }

        void pop() {
            if (stackMain.isEmpty()) return;
            stackMain.pop();
            stackMinTracking.pop();
        }

        int top() {
            if (stackMain.isEmpty()) return -1; // sentinel meaning "empty"
            return stackMain.peek();
        }

        int getMin() {
            if (stackMinTracking.isEmpty()) return -1; // sentinel meaning "empty"
            return stackMinTracking.peek();
        }
    }

    static void printState(MinStack stack) {
        System.out.println("Top: " + stack.top() + ", Min: " + stack.getMin());
    }

    public static void main(String[] args) {
        MinStack stack = new MinStack();

        stack.push(5);
        stack.push(2);
        stack.push(8);
        stack.push(1);
        stack.push(4);
        printState(stack); // Top: 4, Min: 1

        stack.pop(); // removes 4
        printState(stack); // Top: 1, Min: 1

        stack.pop(); // removes 1
        printState(stack); // Top: 8, Min: 2
    }
}
`,
        "js": `// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
class MinStack {
    constructor() {
        this.stackMain = [];
        this.stackMinTracking = [];
    }

    push(value) {
        this.stackMain.push(value);

        // Keep stackMinTracking the same height as stackMain: push the new
        // running minimum (which may be a duplicate of the previous one).
        if (this.stackMinTracking.length === 0 || value <= this.stackMinTracking[this.stackMinTracking.length - 1]) {
            this.stackMinTracking.push(value);
        } else {
            this.stackMinTracking.push(this.stackMinTracking[this.stackMinTracking.length - 1]);
        }
    }

    pop() {
        if (this.stackMain.length === 0) return;
        this.stackMain.pop();
        this.stackMinTracking.pop();
    }

    top() {
        if (this.stackMain.length === 0) return -1; // sentinel meaning "empty"
        return this.stackMain[this.stackMain.length - 1];
    }

    getMin() {
        if (this.stackMinTracking.length === 0) return -1; // sentinel meaning "empty"
        return this.stackMinTracking[this.stackMinTracking.length - 1];
    }
}

function printState(stack) {
    console.log(\`Top: \${stack.top()}, Min: \${stack.getMin()}\`);
}

const stack = new MinStack();

stack.push(5);
stack.push(2);
stack.push(8);
stack.push(1);
stack.push(4);
printState(stack); // Top: 4, Min: 1

stack.pop(); // removes 4
printState(stack); // Top: 1, Min: 1

stack.pop(); // removes 1
printState(stack); // Top: 8, Min: 2
`,
        "c": `#include <stdio.h>

#define MAX_CAPACITY 1024

// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
typedef struct {
    int stackMain[MAX_CAPACITY];
    int stackMinTracking[MAX_CAPACITY];
    int size;
} MinStack;

void initMinStack(MinStack* stack) {
    stack->size = 0;
}

void minStackPush(MinStack* stack, int value) {
    stack->stackMain[stack->size] = value;

    // Keep stackMinTracking the same height as stackMain: push the new
    // running minimum (which may be a duplicate of the previous one).
    if (stack->size == 0 || value <= stack->stackMinTracking[stack->size - 1]) {
        stack->stackMinTracking[stack->size] = value;
    } else {
        stack->stackMinTracking[stack->size] = stack->stackMinTracking[stack->size - 1];
    }

    stack->size++;
}

void minStackPop(MinStack* stack) {
    if (stack->size == 0) return;
    stack->size--;
}

int minStackTop(MinStack* stack) {
    if (stack->size == 0) return -1; // sentinel meaning "empty"
    return stack->stackMain[stack->size - 1];
}

int minStackGetMin(MinStack* stack) {
    if (stack->size == 0) return -1; // sentinel meaning "empty"
    return stack->stackMinTracking[stack->size - 1];
}

void printState(MinStack* stack) {
    printf("Top: %d, Min: %d\\n", minStackTop(stack), minStackGetMin(stack));
}

int main() {
    MinStack stack;
    initMinStack(&stack);

    minStackPush(&stack, 5);
    minStackPush(&stack, 2);
    minStackPush(&stack, 8);
    minStackPush(&stack, 1);
    minStackPush(&stack, 4);
    printState(&stack); // Top: 4, Min: 1

    minStackPop(&stack); // removes 4
    printState(&stack); // Top: 1, Min: 1

    minStackPop(&stack); // removes 1
    printState(&stack); // Top: 8, Min: 2

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
class MinStack {
    private readonly Stack<int> stackMain = new();
    private readonly Stack<int> stackMinTracking = new();

    public void Push(int value) {
        stackMain.Push(value);

        // Keep stackMinTracking the same height as stackMain: push the new
        // running minimum (which may be a duplicate of the previous one).
        if (stackMinTracking.Count == 0 || value <= stackMinTracking.Peek()) {
            stackMinTracking.Push(value);
        } else {
            stackMinTracking.Push(stackMinTracking.Peek());
        }
    }

    public void Pop() {
        if (stackMain.Count == 0) return;
        stackMain.Pop();
        stackMinTracking.Pop();
    }

    public int Top() {
        if (stackMain.Count == 0) return -1; // sentinel meaning "empty"
        return stackMain.Peek();
    }

    public int GetMin() {
        if (stackMinTracking.Count == 0) return -1; // sentinel meaning "empty"
        return stackMinTracking.Peek();
    }
}

class Program {
    static void PrintState(MinStack stack) {
        Console.WriteLine($"Top: {stack.Top()}, Min: {stack.GetMin()}");
    }

    static void Main() {
        var stack = new MinStack();

        stack.Push(5);
        stack.Push(2);
        stack.Push(8);
        stack.Push(1);
        stack.Push(4);
        PrintState(stack); // Top: 4, Min: 1

        stack.Pop(); // removes 4
        PrintState(stack); // Top: 1, Min: 1

        stack.Pop(); // removes 1
        PrintState(stack); // Top: 8, Min: 2
    }
}
`,
        "swift": `import Foundation

// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
final class MinStack {
    private var stackMain: [Int] = []
    private var stackMinTracking: [Int] = []

    func push(_ value: Int) {
        stackMain.append(value)

        // Keep stackMinTracking the same height as stackMain: push the new
        // running minimum (which may be a duplicate of the previous one).
        if let currentMin = stackMinTracking.last, value > currentMin {
            stackMinTracking.append(currentMin)
        } else {
            stackMinTracking.append(value)
        }
    }

    func pop() {
        guard !stackMain.isEmpty else { return }
        stackMain.removeLast()
        stackMinTracking.removeLast()
    }

    func top() -> Int {
        return stackMain.last ?? -1 // sentinel meaning "empty"
    }

    func getMin() -> Int {
        return stackMinTracking.last ?? -1 // sentinel meaning "empty"
    }
}

func printState(_ stack: MinStack) {
    print("Top: \\(stack.top()), Min: \\(stack.getMin())")
}

let stack = MinStack()

stack.push(5)
stack.push(2)
stack.push(8)
stack.push(1)
stack.push(4)
printState(stack) // Top: 4, Min: 1

stack.pop() // removes 4
printState(stack) // Top: 1, Min: 1

stack.pop() // removes 1
printState(stack) // Top: 8, Min: 2
`,
        "kotlin": `// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
class MinStack {
    private val stackMain = ArrayDeque<Int>()
    private val stackMinTracking = ArrayDeque<Int>()

    fun push(value: Int) {
        stackMain.addLast(value)

        // Keep stackMinTracking the same height as stackMain: push the new
        // running minimum (which may be a duplicate of the previous one).
        val currentMin = stackMinTracking.lastOrNull()
        if (currentMin == null || value <= currentMin) {
            stackMinTracking.addLast(value)
        } else {
            stackMinTracking.addLast(currentMin)
        }
    }

    fun pop() {
        if (stackMain.isEmpty()) return
        stackMain.removeLast()
        stackMinTracking.removeLast()
    }

    fun top(): Int = stackMain.lastOrNull() ?: -1 // sentinel meaning "empty"

    fun getMin(): Int = stackMinTracking.lastOrNull() ?: -1 // sentinel meaning "empty"
}

fun printState(stack: MinStack) {
    println("Top: \${stack.top()}, Min: \${stack.getMin()}")
}

fun main() {
    val stack = MinStack()

    stack.push(5)
    stack.push(2)
    stack.push(8)
    stack.push(1)
    stack.push(4)
    printState(stack) // Top: 4, Min: 1

    stack.pop() // removes 4
    printState(stack) // Top: 1, Min: 1

    stack.pop() // removes 1
    printState(stack) // Top: 8, Min: 2
}
`,
        "scala": `import scala.collection.mutable

// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
class MinStack {
    private val stackMain = mutable.Stack[Int]()
    private val stackMinTracking = mutable.Stack[Int]()

    def push(value: Int): Unit = {
        stackMain.push(value)

        // Keep stackMinTracking the same height as stackMain: push the new
        // running minimum (which may be a duplicate of the previous one).
        if (stackMinTracking.isEmpty || value <= stackMinTracking.top) {
            stackMinTracking.push(value)
        } else {
            stackMinTracking.push(stackMinTracking.top)
        }
    }

    def pop(): Unit = {
        if (stackMain.isEmpty) return
        stackMain.pop()
        stackMinTracking.pop()
    }

    def top(): Int = if (stackMain.isEmpty) -1 else stackMain.top // -1: "empty"

    def getMin(): Int = if (stackMinTracking.isEmpty) -1 else stackMinTracking.top // -1: "empty"
}

object Main extends App {
    def printState(stack: MinStack): Unit = {
        println(s"Top: \${stack.top()}, Min: \${stack.getMin()}")
    }

    val stack = new MinStack()

    stack.push(5)
    stack.push(2)
    stack.push(8)
    stack.push(1)
    stack.push(4)
    printState(stack) // Top: 4, Min: 1

    stack.pop() // removes 4
    printState(stack) // Top: 1, Min: 1

    stack.pop() // removes 1
    printState(stack) // Top: 8, Min: 2
}
`,
        "go": `package main

import "fmt"

// MinStack is a stack that also supports retrieving its minimum element in
// O(1), achieved by maintaining a second stack that tracks the running
// minimum in lockstep with the main stack.
type MinStack struct {
    stackMain         []int
    stackMinTracking  []int
}

func newMinStack() *MinStack {
    return &MinStack{stackMain: []int{}, stackMinTracking: []int{}}
}

func (stack *MinStack) Push(value int) {
    stack.stackMain = append(stack.stackMain, value)

    // Keep stackMinTracking the same height as stackMain: push the new
    // running minimum (which may be a duplicate of the previous one).
    if len(stack.stackMinTracking) == 0 || value <= stack.stackMinTracking[len(stack.stackMinTracking)-1] {
        stack.stackMinTracking = append(stack.stackMinTracking, value)
    } else {
        currentMin := stack.stackMinTracking[len(stack.stackMinTracking)-1]
        stack.stackMinTracking = append(stack.stackMinTracking, currentMin)
    }
}

func (stack *MinStack) Pop() {
    if len(stack.stackMain) == 0 {
        return
    }
    stack.stackMain = stack.stackMain[:len(stack.stackMain)-1]
    stack.stackMinTracking = stack.stackMinTracking[:len(stack.stackMinTracking)-1]
}

func (stack *MinStack) Top() int {
    if len(stack.stackMain) == 0 {
        return -1 // sentinel meaning "empty"
    }
    return stack.stackMain[len(stack.stackMain)-1]
}

func (stack *MinStack) GetMin() int {
    if len(stack.stackMinTracking) == 0 {
        return -1 // sentinel meaning "empty"
    }
    return stack.stackMinTracking[len(stack.stackMinTracking)-1]
}

func printState(stack *MinStack) {
    fmt.Printf("Top: %d, Min: %d\\n", stack.Top(), stack.GetMin())
}

func main() {
    stack := newMinStack()

    stack.Push(5)
    stack.Push(2)
    stack.Push(8)
    stack.Push(1)
    stack.Push(4)
    printState(stack) // Top: 4, Min: 1

    stack.Pop() // removes 4
    printState(stack) // Top: 1, Min: 1

    stack.Pop() // removes 1
    printState(stack) // Top: 8, Min: 2
}
`,
        "rust": `// A stack that also supports retrieving its minimum element in O(1),
// achieved by maintaining a second stack that tracks the running minimum
// in lockstep with the main stack.
struct MinStack {
    main_stack: Vec<i32>,
    min_tracking_stack: Vec<i32>,
}

impl MinStack {
    fn new() -> Self {
        MinStack { main_stack: Vec::new(), min_tracking_stack: Vec::new() }
    }

    fn push(&mut self, value: i32) {
        self.main_stack.push(value);

        // Keep min_tracking_stack the same height as main_stack: push the
        // new running minimum (which may be a duplicate of the previous one).
        let new_min = match self.min_tracking_stack.last() {
            Some(&current_min) if current_min < value => current_min,
            _ => value,
        };
        self.min_tracking_stack.push(new_min);
    }

    fn pop(&mut self) {
        if self.main_stack.is_empty() {
            return;
        }
        self.main_stack.pop();
        self.min_tracking_stack.pop();
    }

    fn top(&self) -> i32 {
        *self.main_stack.last().unwrap_or(&-1) // sentinel meaning "empty"
    }

    fn get_min(&self) -> i32 {
        *self.min_tracking_stack.last().unwrap_or(&-1) // sentinel meaning "empty"
    }
}

fn print_state(stack: &MinStack) {
    println!("Top: {}, Min: {}", stack.top(), stack.get_min());
}

fn main() {
    let mut stack = MinStack::new();

    stack.push(5);
    stack.push(2);
    stack.push(8);
    stack.push(1);
    stack.push(4);
    print_state(&stack); // Top: 4, Min: 1

    stack.pop(); // removes 4
    print_state(&stack); // Top: 1, Min: 1

    stack.pop(); // removes 1
    print_state(&stack); // Top: 8, Min: 2
}
`
      }
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
            "Best case still requires the full pass to correctly resolve every element"
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
`function nextGreaterElement(nums):
    n ← length(nums)
    result ← array of size n, filled with −1
    stackPendingIndex ← empty stack            // stores INDICES, not values

    for i from 0 to n − 1:
        while stackPendingIndex is not empty and nums[top(stackPendingIndex)] < nums[i]:
            resolvedIndex ← pop(stackPendingIndex)
            result[resolvedIndex] ← nums[i]     // nums[i] is the next greater element for resolvedIndex

        push(stackPendingIndex, i)

    return result                               // any index left on the stack has no next greater element` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a stack of INDICES (not values), representing elements that are still 'waiting' for their next-greater-element to appear.",
          "For each new element nums[i], check if it's larger than the value at the index currently on top of the stack.",
          "While that's true, pop the stack — the just-popped index has found its answer: nums[i] is its next greater element. Record this in the result array.",
          "Continue popping while the new element keeps beating the (new) stack top, since one large element can resolve many smaller waiting elements at once.",
          "Once the stack top is no longer smaller than nums[i] (or the stack is empty), push i onto the stack — it's now waiting for ITS next greater element.",
          "After processing all elements, any index still left on the stack never found a next greater element, correctly leaving its result entry as -1 (the initialised default)."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "Stack invariant: at every point, the indices on the stack form a sequence with strictly decreasing values from bottom to top — every element on the stack is genuinely still waiting, because if a larger element had already appeared to its right, it would have been popped and resolved already. When processing nums[i], any index resolvedIndex popped off the stack is correctly resolved because nums[i] is, by construction, the FIRST element to resolvedIndex's right that exceeds nums[resolvedIndex] — every index between resolvedIndex and i (if any) was either already popped before resolvedIndex (meaning it was smaller than something even closer to resolvedIndex, contradicting being 'between' — actually meaning those were already resolved and removed) or simply never violated the monotonic decreasing order, meaning none of them exceeded nums[resolvedIndex] either. This guarantees the very first popping element encountered while scanning left-to-right is indeed the correct, FIRST next-greater element." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

// For each element in nums, returns the first element to its right that is
// strictly greater than it, or -1 if no such element exists.
vector<int> nextGreaterElement(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> result(n, -1);
    vector<int> stackPendingIndex; // indices whose next-greater is not yet found

    for (int i = 0; i < n; i++) {
        // The new value resolves every smaller pending index it beats.
        while (!stackPendingIndex.empty() && nums[stackPendingIndex.back()] < nums[i]) {
            int resolvedIndex = stackPendingIndex.back();
            stackPendingIndex.pop_back();
            result[resolvedIndex] = nums[i];
        }

        stackPendingIndex.push_back(i);
    }

    // Any index still on the stack has no next greater element (stays -1).
    return result;
}

int main() {
    vector<int> nums = {2, 1, 2, 4, 3};

    vector<int> result = nextGreaterElement(nums);

    cout << "Nums:               ";
    for (int value : nums) cout << value << " ";
    cout << endl;

    cout << "Next Greater Element: ";
    for (int value : result) cout << value << " ";
    cout << endl;

    return 0;
}
`,
        "python": `def next_greater_element(nums):
    """Return, for each element in nums, the first element to its right that
    is strictly greater than it, or -1 if no such element exists.
    """
    n = len(nums)
    result = [-1] * n
    pending_index_stack = []  # indices whose next-greater is not yet found

    for i in range(n):
        # The new value resolves every smaller pending index it beats.
        while pending_index_stack and nums[pending_index_stack[-1]] < nums[i]:
            resolved_index = pending_index_stack.pop()
            result[resolved_index] = nums[i]

        pending_index_stack.append(i)

    # Any index still on the stack has no next greater element (stays -1).
    return result


if __name__ == "__main__":
    nums = [2, 1, 2, 4, 3]

    result = next_greater_element(nums)

    print("Nums:                ", nums)
    print("Next Greater Element:", result)
`,
        "java": `import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Main {

    // For each element in nums, returns the first element to its right that
    // is strictly greater than it, or -1 if no such element exists.
    static int[] nextGreaterElement(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);

        Deque<Integer> stackPendingIndex = new ArrayDeque<>(); // indices whose next-greater is not yet found

        for (int i = 0; i < n; i++) {
            // The new value resolves every smaller pending index it beats.
            while (!stackPendingIndex.isEmpty() && nums[stackPendingIndex.peek()] < nums[i]) {
                int resolvedIndex = stackPendingIndex.pop();
                result[resolvedIndex] = nums[i];
            }

            stackPendingIndex.push(i);
        }

        // Any index still on the stack has no next greater element (stays -1).
        return result;
    }

    public static void main(String[] args) {
        int[] nums = { 2, 1, 2, 4, 3 };

        int[] result = nextGreaterElement(nums);

        System.out.println("Nums:                 " + Arrays.toString(nums));
        System.out.println("Next Greater Element: " + Arrays.toString(result));
    }
}
`,
        "js": `// For each element in nums, returns the first element to its right that is
// strictly greater than it, or -1 if no such element exists.
function nextGreaterElement(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);
    const stackPendingIndex = []; // indices whose next-greater is not yet found

    for (let i = 0; i < n; i++) {
        // The new value resolves every smaller pending index it beats.
        while (
            stackPendingIndex.length > 0 &&
            nums[stackPendingIndex[stackPendingIndex.length - 1]] < nums[i]
        ) {
            const resolvedIndex = stackPendingIndex.pop();
            result[resolvedIndex] = nums[i];
        }

        stackPendingIndex.push(i);
    }

    // Any index still on the stack has no next greater element (stays -1).
    return result;
}

const nums = [2, 1, 2, 4, 3];

const result = nextGreaterElement(nums);

console.log("Nums:                ", nums);
console.log("Next Greater Element:", result);
`,
        "c": `#include <stdio.h>

#define MAX_LENGTH 1024

// For each element in nums, writes into result the first element to its
// right that is strictly greater than it, or -1 if no such element exists.
void nextGreaterElement(int* nums, int n, int* result) {
    int stackPendingIndex[MAX_LENGTH];
    int stackTop = -1; // index of the top element; -1 means empty

    for (int i = 0; i < n; i++) result[i] = -1;

    for (int i = 0; i < n; i++) {
        // The new value resolves every smaller pending index it beats.
        while (stackTop != -1 && nums[stackPendingIndex[stackTop]] < nums[i]) {
            int resolvedIndex = stackPendingIndex[stackTop];
            stackTop--; // pop
            result[resolvedIndex] = nums[i];
        }

        stackTop++;
        stackPendingIndex[stackTop] = i;
    }

    // Any index still on the stack has no next greater element (stays -1).
}

int main() {
    int nums[] = {2, 1, 2, 4, 3};
    int n = 5;
    int result[5];

    nextGreaterElement(nums, n, result);

    printf("Nums:                 ");
    for (int i = 0; i < n; i++) printf("%d ", nums[i]);
    printf("\\n");

    printf("Next Greater Element: ");
    for (int i = 0; i < n; i++) printf("%d ", result[i]);
    printf("\\n");

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    // For each element in nums, returns the first element to its right that
    // is strictly greater than it, or -1 if no such element exists.
    static int[] NextGreaterElement(int[] nums) {
        int n = nums.Length;
        int[] result = new int[n];
        Array.Fill(result, -1);

        var stackPendingIndex = new Stack<int>(); // indices whose next-greater is not yet found

        for (int i = 0; i < n; i++) {
            // The new value resolves every smaller pending index it beats.
            while (stackPendingIndex.Count > 0 && nums[stackPendingIndex.Peek()] < nums[i]) {
                int resolvedIndex = stackPendingIndex.Pop();
                result[resolvedIndex] = nums[i];
            }

            stackPendingIndex.Push(i);
        }

        // Any index still on the stack has no next greater element (stays -1).
        return result;
    }

    static void Main() {
        int[] nums = { 2, 1, 2, 4, 3 };

        int[] result = NextGreaterElement(nums);

        Console.WriteLine("Nums:                 " + string.Join(" ", nums));
        Console.WriteLine("Next Greater Element: " + string.Join(" ", result));
    }
}
`,
        "swift": `import Foundation

// For each element in nums, returns the first element to its right that is
// strictly greater than it, or -1 if no such element exists.
func nextGreaterElement(_ nums: [Int]) -> [Int] {
    let n = nums.count
    var result = Array(repeating: -1, count: n)
    var stackPendingIndex: [Int] = [] // indices whose next-greater is not yet found

    for i in 0..<n {
        // The new value resolves every smaller pending index it beats.
        while let topIndex = stackPendingIndex.last, nums[topIndex] < nums[i] {
            stackPendingIndex.removeLast()
            result[topIndex] = nums[i]
        }

        stackPendingIndex.append(i)
    }

    // Any index still on the stack has no next greater element (stays -1).
    return result
}

let nums = [2, 1, 2, 4, 3]

let result = nextGreaterElement(nums)

print("Nums:                ", nums)
print("Next Greater Element:", result)
`,
        "kotlin": `fun nextGreaterElement(nums: IntArray): IntArray {
    val n = nums.size
    val result = IntArray(n) { -1 }
    val stackPendingIndex = ArrayDeque<Int>() // indices whose next-greater is not yet found

    for (i in 0 until n) {
        // The new value resolves every smaller pending index it beats.
        while (stackPendingIndex.isNotEmpty() && nums[stackPendingIndex.last()] < nums[i]) {
            val resolvedIndex = stackPendingIndex.removeLast()
            result[resolvedIndex] = nums[i]
        }

        stackPendingIndex.addLast(i)
    }

    // Any index still on the stack has no next greater element (stays -1).
    return result
}

fun main() {
    val nums = intArrayOf(2, 1, 2, 4, 3)

    val result = nextGreaterElement(nums)

    println("Nums:                 \${nums.joinToString(" ")}")
    println("Next Greater Element: \${result.joinToString(" ")}")
}
`,
        "scala": `object Main extends App {
    // For each element in nums, returns the first element to its right that
    // is strictly greater than it, or -1 if no such element exists.
    def nextGreaterElement(nums: Array[Int]): Array[Int] = {
        val n = nums.length
        val result = Array.fill(n)(-1)
        val stackPendingIndex = scala.collection.mutable.Stack[Int]() // indices whose next-greater is not yet found

        for (i <- 0 until n) {
            // The new value resolves every smaller pending index it beats.
            while (stackPendingIndex.nonEmpty && nums(stackPendingIndex.top) < nums(i)) {
                val resolvedIndex = stackPendingIndex.pop()
                result(resolvedIndex) = nums(i)
            }

            stackPendingIndex.push(i)
        }

        // Any index still on the stack has no next greater element (stays -1).
        result
    }

    val nums = Array(2, 1, 2, 4, 3)

    val result = nextGreaterElement(nums)

    println(s"Nums:                 \${nums.mkString(" ")}")
    println(s"Next Greater Element: \${result.mkString(" ")}")
}
`,
        "go": `package main

import "fmt"

// nextGreaterElement returns, for each element in nums, the first element
// to its right that is strictly greater than it, or -1 if no such element
// exists.
func nextGreaterElement(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }

    stackPendingIndex := []int{} // indices whose next-greater is not yet found

    for i := 0; i < n; i++ {
        // The new value resolves every smaller pending index it beats.
        for len(stackPendingIndex) > 0 && nums[stackPendingIndex[len(stackPendingIndex)-1]] < nums[i] {
            resolvedIndex := stackPendingIndex[len(stackPendingIndex)-1]
            stackPendingIndex = stackPendingIndex[:len(stackPendingIndex)-1]
            result[resolvedIndex] = nums[i]
        }

        stackPendingIndex = append(stackPendingIndex, i)
    }

    // Any index still on the stack has no next greater element (stays -1).
    return result
}

func main() {
    nums := []int{2, 1, 2, 4, 3}

    result := nextGreaterElement(nums)

    fmt.Println("Nums:                ", nums)
    fmt.Println("Next Greater Element:", result)
}
`,
        "rust": `// For each element in nums, returns the first element to its right that is
// strictly greater than it, or -1 if no such element exists.
fn next_greater_element(nums: &[i32]) -> Vec<i32> {
    let n = nums.len();
    let mut result = vec![-1; n];
    let mut pending_index_stack: Vec<usize> = Vec::new(); // indices whose next-greater is not yet found

    for i in 0..n {
        // The new value resolves every smaller pending index it beats.
        while let Some(&top_index) = pending_index_stack.last() {
            if nums[top_index] < nums[i] {
                pending_index_stack.pop();
                result[top_index] = nums[i];
            } else {
                break;
            }
        }

        pending_index_stack.push(i);
    }

    // Any index still on the stack has no next greater element (stays -1).
    result
}

fn main() {
    let nums = vec![2, 1, 2, 4, 3];

    let result = next_greater_element(&nums);

    println!("Nums:                 {:?}", nums);
    println!("Next Greater Element: {:?}", result);
}
`
      }
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
`function previousSmallerElement(nums):
    n ← length(nums)
    result ← array of size n, filled with −1
    stackCandidateIndex ← empty stack             // increasing stack of indices

    for i from 0 to n − 1:
        while stackCandidateIndex is not empty and nums[top(stackCandidateIndex)] >= nums[i]:
            pop(stackCandidateIndex)               // these can never be a "previous smaller" for anything later either

        if stackCandidateIndex is not empty:
            result[i] ← nums[top(stackCandidateIndex)]

        push(stackCandidateIndex, i)

    return result` },
        { tag: "h2", text: "Step-by-step reasoning" },
        { tag: "ol", items: [
          "Maintain a stack of indices kept in strictly increasing order of VALUE from bottom to top — the stack only ever holds 'candidates' that could still be a valid previous-smaller-element answer for some future index.",
          "Before processing index i, pop off every stack index whose value is ≥ nums[i] — those values can never be the 'previous smaller element' for index i (since nums[i] itself is smaller or equal), and crucially, they can never be the answer for ANY future index either, since nums[i] is now strictly closer and at least as small.",
          "Once the stack is correctly 'cleaned' (everything remaining is genuinely smaller than nums[i]), whatever remains on top — if anything — is exactly the nearest smaller element to i's left.",
          "Record that answer (or leave -1 if the stack is empty, meaning no smaller element exists to the left), then push i onto the stack as a new candidate for future indices."
        ]},
        { tag: "h2", text: "Why it's correct" },
        { tag: "p", text: "The crucial correctness argument is WHY popped elements can be safely discarded forever, not just for the current index: if nums[top(stackCandidateIndex)] ≥ nums[i], then for any future index k > i, nums[i] is BOTH closer to k than the popped element AND at least as small — so the popped element could never be the correct (nearest) answer for k either, since nums[i] would always be preferred. This means discarding it permanently loses no correctness. After this cleanup, the stack's new top (if it exists) is, by the maintained increasing-stack invariant, guaranteed to be both smaller than nums[i] and the closest such index to i's left among all currently-valid candidates — exactly the definition of the previous smaller element." }
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

// For each index i, finds the nearest index to its left whose value is
// strictly smaller than nums[i], using a monotonic (increasing) stack.
vector<int> previousSmallerElement(const vector<int>& nums) {
    int n = (int)nums.size();
    vector<int> result(n, -1);
    vector<int> stackCandidateIndex; // strictly increasing stack of indices

    for (int i = 0; i < n; i++) {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        while (!stackCandidateIndex.empty() && nums[stackCandidateIndex.back()] >= nums[i]) {
            stackCandidateIndex.pop_back();
        }

        if (!stackCandidateIndex.empty()) {
            result[i] = nums[stackCandidateIndex.back()];
        }

        stackCandidateIndex.push_back(i);
    }

    return result;
}

int main() {
    vector<int> nums = {5, 3, 7, 2, 6, 1, 4};

    vector<int> result = previousSmallerElement(nums);

    cout << "Nums:                    ";
    for (int value : nums) cout << value << " ";
    cout << endl;

    cout << "Previous Smaller Element: ";
    for (int value : result) cout << value << " ";
    cout << endl;

    return 0;
}
`,
        "python": `def previous_smaller_element(nums):
    """For each index, find the nearest index to its left whose value is
    strictly smaller than nums[i], using a monotonic (increasing) stack.
    """
    n = len(nums)
    result = [-1] * n
    candidate_index_stack = []  # strictly increasing stack of indices

    for i in range(n):
        # Discard candidates that can never be a valid answer for i or
        # anything after it, since nums[i] is closer and at least as small.
        while candidate_index_stack and nums[candidate_index_stack[-1]] >= nums[i]:
            candidate_index_stack.pop()

        if candidate_index_stack:
            result[i] = nums[candidate_index_stack[-1]]

        candidate_index_stack.append(i)

    return result


if __name__ == "__main__":
    nums = [5, 3, 7, 2, 6, 1, 4]

    result = previous_smaller_element(nums)

    print("Nums:                    ", nums)
    print("Previous Smaller Element:", result)
`,
        "java": `import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Main {

    // For each index, finds the nearest index to its left whose value is
    // strictly smaller than nums[i], using a monotonic (increasing) stack.
    static int[] previousSmallerElement(int[] nums) {
        int n = nums.length;
        int[] result = new int[n];
        Arrays.fill(result, -1);

        Deque<Integer> stackCandidateIndex = new ArrayDeque<>(); // strictly increasing stack of indices

        for (int i = 0; i < n; i++) {
            // Discard candidates that can never be a valid answer for i or
            // anything after it, since nums[i] is closer and at least as small.
            while (!stackCandidateIndex.isEmpty() && nums[stackCandidateIndex.peek()] >= nums[i]) {
                stackCandidateIndex.pop();
            }

            if (!stackCandidateIndex.isEmpty()) {
                result[i] = nums[stackCandidateIndex.peek()];
            }

            stackCandidateIndex.push(i);
        }

        return result;
    }

    public static void main(String[] args) {
        int[] nums = { 5, 3, 7, 2, 6, 1, 4 };

        int[] result = previousSmallerElement(nums);

        System.out.println("Nums:                     " + Arrays.toString(nums));
        System.out.println("Previous Smaller Element: " + Arrays.toString(result));
    }
}
`,
        "js": `// For each index, finds the nearest index to its left whose value is
// strictly smaller than nums[i], using a monotonic (increasing) stack.
function previousSmallerElement(nums) {
    const n = nums.length;
    const result = new Array(n).fill(-1);
    const stackCandidateIndex = []; // strictly increasing stack of indices

    for (let i = 0; i < n; i++) {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        while (
            stackCandidateIndex.length > 0 &&
            nums[stackCandidateIndex[stackCandidateIndex.length - 1]] >= nums[i]
        ) {
            stackCandidateIndex.pop();
        }

        if (stackCandidateIndex.length > 0) {
            result[i] = nums[stackCandidateIndex[stackCandidateIndex.length - 1]];
        }

        stackCandidateIndex.push(i);
    }

    return result;
}

const nums = [5, 3, 7, 2, 6, 1, 4];

const result = previousSmallerElement(nums);

console.log("Nums:                    ", nums);
console.log("Previous Smaller Element:", result);
`,
        "c": `#include <stdio.h>

#define MAX_LENGTH 1024

// For each index, writes into result the nearest index to its left whose
// value is strictly smaller than nums[i], using a monotonic (increasing)
// stack.
void previousSmallerElement(int* nums, int n, int* result) {
    int stackCandidateIndex[MAX_LENGTH]; // strictly increasing stack of indices
    int stackTop = -1; // index of the top element; -1 means empty

    for (int i = 0; i < n; i++) result[i] = -1;

    for (int i = 0; i < n; i++) {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        while (stackTop != -1 && nums[stackCandidateIndex[stackTop]] >= nums[i]) {
            stackTop--; // pop
        }

        if (stackTop != -1) {
            result[i] = nums[stackCandidateIndex[stackTop]];
        }

        stackTop++;
        stackCandidateIndex[stackTop] = i;
    }
}

int main() {
    int nums[] = {5, 3, 7, 2, 6, 1, 4};
    int n = 7;
    int result[7];

    previousSmallerElement(nums, n, result);

    printf("Nums:                     ");
    for (int i = 0; i < n; i++) printf("%d ", nums[i]);
    printf("\\n");

    printf("Previous Smaller Element: ");
    for (int i = 0; i < n; i++) printf("%d ", result[i]);
    printf("\\n");

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    // For each index, finds the nearest index to its left whose value is
    // strictly smaller than nums[i], using a monotonic (increasing) stack.
    static int[] PreviousSmallerElement(int[] nums) {
        int n = nums.Length;
        int[] result = new int[n];
        Array.Fill(result, -1);

        var stackCandidateIndex = new Stack<int>(); // strictly increasing stack of indices

        for (int i = 0; i < n; i++) {
            // Discard candidates that can never be a valid answer for i or
            // anything after it, since nums[i] is closer and at least as small.
            while (stackCandidateIndex.Count > 0 && nums[stackCandidateIndex.Peek()] >= nums[i]) {
                stackCandidateIndex.Pop();
            }

            if (stackCandidateIndex.Count > 0) {
                result[i] = nums[stackCandidateIndex.Peek()];
            }

            stackCandidateIndex.Push(i);
        }

        return result;
    }

    static void Main() {
        int[] nums = { 5, 3, 7, 2, 6, 1, 4 };

        int[] result = PreviousSmallerElement(nums);

        Console.WriteLine("Nums:                     " + string.Join(" ", nums));
        Console.WriteLine("Previous Smaller Element: " + string.Join(" ", result));
    }
}
`,
        "swift": `import Foundation

// For each index, finds the nearest index to its left whose value is
// strictly smaller than nums[i], using a monotonic (increasing) stack.
func previousSmallerElement(_ nums: [Int]) -> [Int] {
    let n = nums.count
    var result = Array(repeating: -1, count: n)
    var stackCandidateIndex: [Int] = [] // strictly increasing stack of indices

    for i in 0..<n {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        while let topIndex = stackCandidateIndex.last, nums[topIndex] >= nums[i] {
            stackCandidateIndex.removeLast()
        }

        if let topIndex = stackCandidateIndex.last {
            result[i] = nums[topIndex]
        }

        stackCandidateIndex.append(i)
    }

    return result
}

let nums = [5, 3, 7, 2, 6, 1, 4]

let result = previousSmallerElement(nums)

print("Nums:                    ", nums)
print("Previous Smaller Element:", result)
`,
        "kotlin": `fun previousSmallerElement(nums: IntArray): IntArray {
    val n = nums.size
    val result = IntArray(n) { -1 }
    val stackCandidateIndex = ArrayDeque<Int>() // strictly increasing stack of indices

    for (i in 0 until n) {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        while (stackCandidateIndex.isNotEmpty() && nums[stackCandidateIndex.last()] >= nums[i]) {
            stackCandidateIndex.removeLast()
        }

        if (stackCandidateIndex.isNotEmpty()) {
            result[i] = nums[stackCandidateIndex.last()]
        }

        stackCandidateIndex.addLast(i)
    }

    return result
}

fun main() {
    val nums = intArrayOf(5, 3, 7, 2, 6, 1, 4)

    val result = previousSmallerElement(nums)

    println("Nums:                     \${nums.joinToString(" ")}")
    println("Previous Smaller Element: \${result.joinToString(" ")}")
}
`,
        "scala": `object Main extends App {
    // For each index, finds the nearest index to its left whose value is
    // strictly smaller than nums(i), using a monotonic (increasing) stack.
    def previousSmallerElement(nums: Array[Int]): Array[Int] = {
        val n = nums.length
        val result = Array.fill(n)(-1)
        val stackCandidateIndex = scala.collection.mutable.Stack[Int]() // strictly increasing stack of indices

        for (i <- 0 until n) {
            // Discard candidates that can never be a valid answer for i or
            // anything after it, since nums(i) is closer and at least as small.
            while (stackCandidateIndex.nonEmpty && nums(stackCandidateIndex.top) >= nums(i)) {
                stackCandidateIndex.pop()
            }

            if (stackCandidateIndex.nonEmpty) {
                result(i) = nums(stackCandidateIndex.top)
            }

            stackCandidateIndex.push(i)
        }

        result
    }

    val nums = Array(5, 3, 7, 2, 6, 1, 4)

    val result = previousSmallerElement(nums)

    println(s"Nums:                     \${nums.mkString(" ")}")
    println(s"Previous Smaller Element: \${result.mkString(" ")}")
}
`,
        "go": `package main

import "fmt"

// previousSmallerElement finds, for each index, the nearest index to its
// left whose value is strictly smaller than nums[i], using a monotonic
// (increasing) stack.
func previousSmallerElement(nums []int) []int {
    n := len(nums)
    result := make([]int, n)
    for i := range result {
        result[i] = -1
    }

    stackCandidateIndex := []int{} // strictly increasing stack of indices

    for i := 0; i < n; i++ {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        for len(stackCandidateIndex) > 0 && nums[stackCandidateIndex[len(stackCandidateIndex)-1]] >= nums[i] {
            stackCandidateIndex = stackCandidateIndex[:len(stackCandidateIndex)-1]
        }

        if len(stackCandidateIndex) > 0 {
            result[i] = nums[stackCandidateIndex[len(stackCandidateIndex)-1]]
        }

        stackCandidateIndex = append(stackCandidateIndex, i)
    }

    return result
}

func main() {
    nums := []int{5, 3, 7, 2, 6, 1, 4}

    result := previousSmallerElement(nums)

    fmt.Println("Nums:                    ", nums)
    fmt.Println("Previous Smaller Element:", result)
}
`,
        "rust": `// For each index, finds the nearest index to its left whose value is
// strictly smaller than nums[i], using a monotonic (increasing) stack.
fn previous_smaller_element(nums: &[i32]) -> Vec<i32> {
    let n = nums.len();
    let mut result = vec![-1; n];
    let mut candidate_index_stack: Vec<usize> = Vec::new(); // strictly increasing stack of indices

    for i in 0..n {
        // Discard candidates that can never be a valid answer for i or
        // anything after it, since nums[i] is closer and at least as small.
        while let Some(&top_index) = candidate_index_stack.last() {
            if nums[top_index] >= nums[i] {
                candidate_index_stack.pop();
            } else {
                break;
            }
        }

        if let Some(&top_index) = candidate_index_stack.last() {
            result[i] = nums[top_index];
        }

        candidate_index_stack.push(i);
    }

    result
}

fn main() {
    let nums = vec![5, 3, 7, 2, 6, 1, 4];

    let result = previous_smaller_element(&nums);

    println!("Nums:                     {:?}", nums);
    println!("Previous Smaller Element: {:?}", result);
}
`
      }
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
    stackBarIndex ← empty stack               // increasing stack of indices
    maxArea ← 0
    extendedHeights ← heights + [0]            // sentinel: forces final cleanup

    for i from 0 to length(extendedHeights) − 1:
        while stackBarIndex is not empty and extendedHeights[top(stackBarIndex)] > extendedHeights[i]:
            barHeight ← extendedHeights[pop(stackBarIndex)]
            // width = distance between the new stack top (exclusive)
            // and current index i (exclusive)
            barWidth ← i if stackBarIndex is empty else i − top(stackBarIndex) − 1
            maxArea ← max(maxArea, barHeight * barWidth)

        push(stackBarIndex, i)

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
      ],

      codes: {
        "c++": `#include <iostream>
#include <vector>
using namespace std;

// Returns the area of the largest rectangle that can be formed from
// contiguous bars in the histogram represented by heights.
int largestRectangleArea(const vector<int>& heights) {
    vector<int> stackBarIndex; // strictly increasing stack of indices
    int maxArea = 0;

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == heights.size() forces every remaining stack entry to be
    // popped and processed, with no separate cleanup loop needed.
    for (int i = 0; i <= (int)heights.size(); i++) {
        int currentHeight = (i == (int)heights.size()) ? 0 : heights[i];

        while (!stackBarIndex.empty() && heights[stackBarIndex.back()] > currentHeight) {
            int barHeight = heights[stackBarIndex.back()];
            stackBarIndex.pop_back();

            int barWidth = stackBarIndex.empty() ? i : i - stackBarIndex.back() - 1;
            maxArea = max(maxArea, barHeight * barWidth);
        }

        stackBarIndex.push_back(i);
    }

    return maxArea;
}

int main() {
    vector<int> heights = {2, 1, 5, 6, 2, 3};

    int result = largestRectangleArea(heights);
    cout << "Largest Rectangle Area: " << result << endl;

    return 0;
}
`,
        "python": `def largest_rectangle_area(heights):
    """Return the area of the largest rectangle that can be formed from
    contiguous bars in the histogram represented by heights.
    """
    bar_index_stack = []  # strictly increasing stack of indices
    max_area = 0

    # Iterate one step past the real bars; the implicit height-0 "bar" at
    # index == len(heights) forces every remaining stack entry to be popped
    # and processed, with no separate cleanup loop needed.
    for i in range(len(heights) + 1):
        current_height = 0 if i == len(heights) else heights[i]

        while bar_index_stack and heights[bar_index_stack[-1]] > current_height:
            bar_height = heights[bar_index_stack.pop()]
            bar_width = i if not bar_index_stack else i - bar_index_stack[-1] - 1
            max_area = max(max_area, bar_height * bar_width)

        bar_index_stack.append(i)

    return max_area


if __name__ == "__main__":
    heights = [2, 1, 5, 6, 2, 3]

    result = largest_rectangle_area(heights)
    print(f"Largest Rectangle Area: {result}")
`,
        "java": `import java.util.ArrayDeque;
import java.util.Deque;

public class Main {

    // Returns the area of the largest rectangle that can be formed from
    // contiguous bars in the histogram represented by heights.
    static int largestRectangleArea(int[] heights) {
        Deque<Integer> stackBarIndex = new ArrayDeque<>(); // strictly increasing stack of indices
        int maxArea = 0;

        // Iterate one step past the real bars; the implicit height-0 "bar"
        // at index == heights.length forces every remaining stack entry to
        // be popped and processed, with no separate cleanup loop needed.
        for (int i = 0; i <= heights.length; i++) {
            int currentHeight = (i == heights.length) ? 0 : heights[i];

            while (!stackBarIndex.isEmpty() && heights[stackBarIndex.peek()] > currentHeight) {
                int barHeight = heights[stackBarIndex.pop()];
                int barWidth = stackBarIndex.isEmpty() ? i : i - stackBarIndex.peek() - 1;
                maxArea = Math.max(maxArea, barHeight * barWidth);
            }

            stackBarIndex.push(i);
        }

        return maxArea;
    }

    public static void main(String[] args) {
        int[] heights = { 2, 1, 5, 6, 2, 3 };

        int result = largestRectangleArea(heights);
        System.out.println("Largest Rectangle Area: " + result);
    }
}
`,
        "js": `// Returns the area of the largest rectangle that can be formed from
// contiguous bars in the histogram represented by heights.
function largestRectangleArea(heights) {
    const stackBarIndex = []; // strictly increasing stack of indices
    let maxArea = 0;

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == heights.length forces every remaining stack entry to be
    // popped and processed, with no separate cleanup loop needed.
    for (let i = 0; i <= heights.length; i++) {
        const currentHeight = i === heights.length ? 0 : heights[i];

        while (
            stackBarIndex.length > 0 &&
            heights[stackBarIndex[stackBarIndex.length - 1]] > currentHeight
        ) {
            const barHeight = heights[stackBarIndex.pop()];
            const barWidth =
                stackBarIndex.length === 0 ? i : i - stackBarIndex[stackBarIndex.length - 1] - 1;
            maxArea = Math.max(maxArea, barHeight * barWidth);
        }

        stackBarIndex.push(i);
    }

    return maxArea;
}

const heights = [2, 1, 5, 6, 2, 3];

const result = largestRectangleArea(heights);
console.log(\`Largest Rectangle Area: \${result}\`);
`,
        "c": `#include <stdio.h>

#define MAX_LENGTH 1024

// Returns the area of the largest rectangle that can be formed from
// contiguous bars in the histogram represented by heights.
int largestRectangleArea(int* heights, int n) {
    int stackBarIndex[MAX_LENGTH + 1]; // strictly increasing stack of indices
    int stackTop = -1; // index of the top element; -1 means empty
    int maxArea = 0;

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == n forces every remaining stack entry to be popped and
    // processed, with no separate cleanup loop needed.
    for (int i = 0; i <= n; i++) {
        int currentHeight = (i == n) ? 0 : heights[i];

        while (stackTop != -1 && heights[stackBarIndex[stackTop]] > currentHeight) {
            int barHeight = heights[stackBarIndex[stackTop]];
            stackTop--; // pop

            int barWidth = (stackTop == -1) ? i : i - stackBarIndex[stackTop] - 1;
            int area = barHeight * barWidth;
            if (area > maxArea) maxArea = area;
        }

        stackTop++;
        stackBarIndex[stackTop] = i;
    }

    return maxArea;
}

int main() {
    int heights[] = {2, 1, 5, 6, 2, 3};
    int n = 6;

    int result = largestRectangleArea(heights, n);
    printf("Largest Rectangle Area: %d\\n", result);

    return 0;
}
`,
        "c#": `using System;
using System.Collections.Generic;

class Program {
    // Returns the area of the largest rectangle that can be formed from
    // contiguous bars in the histogram represented by heights.
    static int LargestRectangleArea(int[] heights) {
        var stackBarIndex = new Stack<int>(); // strictly increasing stack of indices
        int maxArea = 0;

        // Iterate one step past the real bars; the implicit height-0 "bar"
        // at index == heights.Length forces every remaining stack entry to
        // be popped and processed, with no separate cleanup loop needed.
        for (int i = 0; i <= heights.Length; i++) {
            int currentHeight = (i == heights.Length) ? 0 : heights[i];

            while (stackBarIndex.Count > 0 && heights[stackBarIndex.Peek()] > currentHeight) {
                int barHeight = heights[stackBarIndex.Pop()];
                int barWidth = stackBarIndex.Count == 0 ? i : i - stackBarIndex.Peek() - 1;
                maxArea = Math.Max(maxArea, barHeight * barWidth);
            }

            stackBarIndex.Push(i);
        }

        return maxArea;
    }

    static void Main() {
        int[] heights = { 2, 1, 5, 6, 2, 3 };

        int result = LargestRectangleArea(heights);
        Console.WriteLine($"Largest Rectangle Area: {result}");
    }
}
`,
        "swift": `import Foundation

// Returns the area of the largest rectangle that can be formed from
// contiguous bars in the histogram represented by heights.
func largestRectangleArea(_ heights: [Int]) -> Int {
    var stackBarIndex: [Int] = [] // strictly increasing stack of indices
    var maxArea = 0

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == heights.count forces every remaining stack entry to be
    // popped and processed, with no separate cleanup loop needed.
    for i in 0...heights.count {
        let currentHeight = (i == heights.count) ? 0 : heights[i]

        while let topIndex = stackBarIndex.last, heights[topIndex] > currentHeight {
            let barHeight = heights[topIndex]
            stackBarIndex.removeLast()

            let barWidth = stackBarIndex.isEmpty ? i : i - stackBarIndex.last! - 1
            maxArea = max(maxArea, barHeight * barWidth)
        }

        stackBarIndex.append(i)
    }

    return maxArea
}

let heights = [2, 1, 5, 6, 2, 3]

let result = largestRectangleArea(heights)
print("Largest Rectangle Area: \\(result)")
`,
        "kotlin": `fun largestRectangleArea(heights: IntArray): Int {
    val stackBarIndex = ArrayDeque<Int>() // strictly increasing stack of indices
    var maxArea = 0

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == heights.size forces every remaining stack entry to be
    // popped and processed, with no separate cleanup loop needed.
    for (i in 0..heights.size) {
        val currentHeight = if (i == heights.size) 0 else heights[i]

        while (stackBarIndex.isNotEmpty() && heights[stackBarIndex.last()] > currentHeight) {
            val barHeight = heights[stackBarIndex.removeLast()]
            val barWidth = if (stackBarIndex.isEmpty()) i else i - stackBarIndex.last() - 1
            maxArea = maxOf(maxArea, barHeight * barWidth)
        }

        stackBarIndex.addLast(i)
    }

    return maxArea
}

fun main() {
    val heights = intArrayOf(2, 1, 5, 6, 2, 3)

    val result = largestRectangleArea(heights)
    println("Largest Rectangle Area: $result")
}
`,
        "scala": `object Main extends App {
    // Returns the area of the largest rectangle that can be formed from
    // contiguous bars in the histogram represented by heights.
    def largestRectangleArea(heights: Array[Int]): Int = {
        val stackBarIndex = scala.collection.mutable.Stack[Int]() // strictly increasing stack of indices
        var maxArea = 0

        // Iterate one step past the real bars; the implicit height-0 "bar"
        // at index == heights.length forces every remaining stack entry to
        // be popped and processed, with no separate cleanup loop needed.
        for (i <- 0 to heights.length) {
            val currentHeight = if (i == heights.length) 0 else heights(i)

            while (stackBarIndex.nonEmpty && heights(stackBarIndex.top) > currentHeight) {
                val barHeight = heights(stackBarIndex.pop())
                val barWidth = if (stackBarIndex.isEmpty) i else i - stackBarIndex.top - 1
                maxArea = math.max(maxArea, barHeight * barWidth)
            }

            stackBarIndex.push(i)
        }

        maxArea
    }

    val heights = Array(2, 1, 5, 6, 2, 3)

    val result = largestRectangleArea(heights)
    println(s"Largest Rectangle Area: $result")
}
`,
        "go": `package main

import "fmt"

// largestRectangleArea returns the area of the largest rectangle that can
// be formed from contiguous bars in the histogram represented by heights.
func largestRectangleArea(heights []int) int {
    stackBarIndex := []int{} // strictly increasing stack of indices
    maxArea := 0
    n := len(heights)

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == n forces every remaining stack entry to be popped and
    // processed, with no separate cleanup loop needed.
    for i := 0; i <= n; i++ {
        currentHeight := 0
        if i < n {
            currentHeight = heights[i]
        }

        for len(stackBarIndex) > 0 && heights[stackBarIndex[len(stackBarIndex)-1]] > currentHeight {
            barHeight := heights[stackBarIndex[len(stackBarIndex)-1]]
            stackBarIndex = stackBarIndex[:len(stackBarIndex)-1]

            barWidth := i
            if len(stackBarIndex) > 0 {
                barWidth = i - stackBarIndex[len(stackBarIndex)-1] - 1
            }

            area := barHeight * barWidth
            if area > maxArea {
                maxArea = area
            }
        }

        stackBarIndex = append(stackBarIndex, i)
    }

    return maxArea
}

func main() {
    heights := []int{2, 1, 5, 6, 2, 3}

    result := largestRectangleArea(heights)
    fmt.Printf("Largest Rectangle Area: %d\\n", result)
}
`,
        "rust": `// Returns the area of the largest rectangle that can be formed from
// contiguous bars in the histogram represented by heights.
fn largest_rectangle_area(heights: &[i32]) -> i32 {
    let mut bar_index_stack: Vec<usize> = Vec::new(); // strictly increasing stack of indices
    let mut max_area = 0;
    let n = heights.len();

    // Iterate one step past the real bars; the implicit height-0 "bar" at
    // index == n forces every remaining stack entry to be popped and
    // processed, with no separate cleanup loop needed.
    for i in 0..=n {
        let current_height = if i == n { 0 } else { heights[i] };

        while let Some(&top_index) = bar_index_stack.last() {
            if heights[top_index] > current_height {
                let bar_height = heights[top_index];
                bar_index_stack.pop();

                let bar_width = match bar_index_stack.last() {
                    Some(&newTopIndex) => (i - newTopIndex - 1) as i32,
                    None => i as i32,
                };

                max_area = max_area.max(bar_height * bar_width);
            } else {
                break;
            }
        }

        bar_index_stack.push(i);
    }

    max_area
}

fn main() {
    let heights = vec![2, 1, 5, 6, 2, 3];

    let result = largest_rectangle_area(&heights);
    println!("Largest Rectangle Area: {}", result);
}
`
      }
    }

  ],
  desc: "Monotonic stack, bracket matching, next greater",
  complexity: "O(n)",
  featured: true
};

export default STACKS_SECTION;
