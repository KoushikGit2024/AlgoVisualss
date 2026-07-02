const TRIES_SECTION = {
    name: "Tries",
    href: "/algorithms/tries",
    icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="32" cy="10" r="4"/>
            <line x1="32" y1="14" x2="16" y2="32"/>
            <line x1="32" y1="14" x2="48" y2="32"/>
            <line x1="16" y1="32" x2="8" y2="52"/>
            <line x1="16" y1="32" x2="24" y2="52"/>
            <line x1="48" y1="32" x2="40" y2="52"/>
            <line x1="48" y1="32" x2="56" y2="52"/>
        </svg>
    ),
    hoverIcon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="32" cy="10" r="4" fill="#34D399" stroke="#34D399"/>
            <line x1="32" y1="14" x2="16" y2="32" stroke="#34D399" strokeWidth="4"/>
            <line x1="32" y1="14" x2="48" y2="32"/>
            <line x1="16" y1="32" x2="8" y2="52"/>
            <line x1="16" y1="32" x2="24" y2="52" stroke="#34D399" strokeWidth="4"/>
            <circle cx="24" cy="52" r="4" fill="#34D399" stroke="#34D399"/>
            <line x1="48" y1="32" x2="40" y2="52"/>
            <line x1="48" y1="32" x2="56" y2="52"/>
        </svg>
    ),

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
            ],
            codes: {
    "c++": `#include <iostream>
#include <vector>
#include <string>

using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;
    string word;

    TrieNode() {
        isEndOfWord = false;
        word = "";
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

void insert(TrieNode* root, const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
        int idx = ch - 'a';
        if (!node->children[idx]) {
            node->children[idx] = new TrieNode();
        }
        node = node->children[idx];
    }
    node->isEndOfWord = true;
    node->word = word;
}

void dfs(vector<vector<char>>& board, int r, int c, TrieNode* node, vector<string>& result) {
    char ch = board[r][c];
    if (ch == '#' || !node->children[ch - 'a']) return;

    node = node->children[ch - 'a'];
    
    if (node->isEndOfWord) {
        result.push_back(node->word);
        node->isEndOfWord = false; // Prevent duplicate discoveries
    }

    board[r][c] = '#'; // Mark visited
    
    if (r > 0) dfs(board, r - 1, c, node, result);
    if (r < board.size() - 1) dfs(board, r + 1, c, node, result);
    if (c > 0) dfs(board, r, c - 1, node, result);
    if (c < board[0].size() - 1) dfs(board, r, c + 1, node, result);
    
    board[r][c] = ch; // Unmark visited (Backtrack)
}

vector<string> findWords(vector<vector<char>>& board, const vector<string>& words) {
    TrieNode* root = new TrieNode();
    for (const string& w : words) {
        insert(root, w);
    }
    
    vector<string> result;
    for (int i = 0; i < board.size(); i++) {
        for (int j = 0; j < board[0].size(); j++) {
            dfs(board, i, j, root, result);
        }
    }
    return result;
}

int main() {
    // Expanded word list to create a wider, denser trie
    vector<string> words = {
        "oath", "pea", "eat", "rain", 
        "hike", "oak", "oat", "tea", 
        "tie", "torn", "roam", "hint"
    };
    
    vector<vector<char>> board = {
        {'o','a','a','n'},
        {'e','t','a','e'},
        {'i','h','k','r'},
        {'i','f','l','v'}
    };

    vector<string> ans = findWords(board, words);
    cout << "Words Found:\\n";
    for (const string& word : ans) cout << word << "\\n";

    return 0;
}`,
    "python": `class TrieNode:
    def __init__(self):
        self.children = {}
        self.word = None

def insert(root, word):
    node = root
    for char in word:
        if char not in node.children:
            node.children[char] = TrieNode()
        node = node.children[char]
    node.word = word

def dfs(board, r, c, node, result):
    char = board[r][c]
    if char not in node.children:
        return

    node = node.children[char]
    if node.word:
        result.append(node.word)
        node.word = None  # Prevent duplicates

    board[r][c] = '#' # Mark visited
    
    for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)]:
        nr, nc = r + dr, c + dc
        if 0 <= nr < len(board) and 0 <= nc < len(board[0]) and board[nr][nc] != '#':
            dfs(board, nr, nc, node, result)
            
    board[r][c] = char # Unmark visited (Backtrack)

def find_words(board, words):
    root = TrieNode()
    for word in words:
        insert(root, word)

    result = []
    for r in range(len(board)):
        for c in range(len(board[0])):
            dfs(board, r, c, root, result)
            
    return result

if __name__ == "__main__":
    # Expanded word list to create a wider, denser trie
    words = [
        "oath", "pea", "eat", "rain", 
        "hike", "oak", "oat", "tea", 
        "tie", "torn", "roam", "hint"
    ]
    board = [
        ['o','a','a','n'],
        ['e','t','a','e'],
        ['i','h','k','r'],
        ['i','f','l','v']
    ]
    ans = find_words(board, words)
    print("Words Found:")
    for word in ans: print(word)`,
    "java": `import java.util.ArrayList;
import java.util.List;

public class Main {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        String word = null;
    }

    public static void insert(TrieNode root, String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int idx = c - 'a';
            if (node.children[idx] == null) {
                node.children[idx] = new TrieNode();
            }
            node = node.children[idx];
        }
        node.word = word;
    }

    public static void dfs(char[][] board, int r, int c, TrieNode node, List<String> result) {
        char ch = board[r][c];
        if (ch == '#' || node.children[ch - 'a'] == null) return;
        
        node = node.children[ch - 'a'];
        
        if (node.word != null) {
            result.add(node.word);
            node.word = null; // Prevent duplicates
        }

        board[r][c] = '#'; // Mark visited
        
        if (r > 0) dfs(board, r - 1, c, node, result);
        if (r < board.length - 1) dfs(board, r + 1, c, node, result);
        if (c > 0) dfs(board, r, c - 1, node, result);
        if (c < board[0].length - 1) dfs(board, r, c + 1, node, result);
        
        board[r][c] = ch; // Unmark visited (Backtrack)
    }

    public static List<String> findWords(char[][] board, String[] words) {
        TrieNode root = new TrieNode();
        for (String w : words) insert(root, w);

        List<String> result = new ArrayList<>();
        for (int i = 0; i < board.length; i++) {
            for (int j = 0; j < board[0].length; j++) {
                dfs(board, i, j, root, result);
            }
        }
        return result;
    }

    public static void main(String[] args) {
        // Expanded word list to create a wider, denser trie
        String[] words = {
            "oath", "pea", "eat", "rain", 
            "hike", "oak", "oat", "tea", 
            "tie", "torn", "roam", "hint"
        };
        char[][] board = {
            {'o','a','a','n'},
            {'e','t','a','e'},
            {'i','h','k','r'},
            {'i','f','l','v'}
        };
        
        List<String> ans = findWords(board, words);
        System.out.println("Words Found:");
        for (String w : ans) System.out.println(w);
    }
}`,
    "js": `function createTrieNode() {
    return { children: {}, word: null };
}

function insert(root, word) {
    let node = root;
    for (let char of word) {
        if (!node.children[char]) {
            node.children[char] = createTrieNode();
        }
        node = node.children[char];
    }
    node.word = word;
}

function dfs(board, r, c, node, result) {
    const char = board[r][c];
    if (char === '#' || !node.children[char]) return;

    node = node.children[char];
    if (node.word) {
        result.push(node.word);
        node.word = null; // Prevent duplicates
    }

    board[r][c] = '#'; // Mark visited
    
    if (r > 0) dfs(board, r - 1, c, node, result);
    if (r < board.length - 1) dfs(board, r + 1, c, node, result);
    if (c > 0) dfs(board, r, c - 1, node, result);
    if (c < board[0].length - 1) dfs(board, r, c + 1, node, result);
    
    board[r][c] = char; // Unmark visited (Backtrack)
}

function findWords(board, words) {
    const root = createTrieNode();
    for (let word of words) insert(root, word);

    const result = [];
    for (let r = 0; r < board.length; r++) {
        for (let c = 0; c < board[0].length; c++) {
            dfs(board, r, c, root, result);
        }
    }
    return result;
}

// Expanded word list to create a wider, denser trie
const words = [
    "oath", "pea", "eat", "rain", 
    "hike", "oak", "oat", "tea", 
    "tie", "torn", "roam", "hint"
];
const board = [
    ['o','a','a','n'],
    ['e','t','a','e'],
    ['i','h','k','r'],
    ['i','f','l','v']
];
console.log("Words Found:");
console.log(findWords(board, words));`
            }
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
            ],
            codes: {
    "c++": `#include <iostream>
#include <string>

using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

void insert(TrieNode* root, const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
        int idx = ch - 'a';
        if (!node->children[idx]) {
            node->children[idx] = new TrieNode();
        }
        node = node->children[idx];
    }
    node->isEndOfWord = true;
}

bool search(TrieNode* root, const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
        int idx = ch - 'a';
        if (!node->children[idx]) return false;
        node = node->children[idx];
    }
    return node != nullptr && node->isEndOfWord;
}

bool startsWith(TrieNode* root, const string& prefix) {
    TrieNode* node = root;
    for (char ch : prefix) {
        int idx = ch - 'a';
        if (!node->children[idx]) return false;
        node = node->children[idx];
    }
    return node != nullptr;
}

int main() {
    TrieNode* root = new TrieNode();
    
    // Expanded insertions to create deep branches and distinct root paths
    insert(root, "apple"); 
    insert(root, "app"); 
    insert(root, "application"); 
    insert(root, "apt");
    
    insert(root, "bat"); 
    insert(root, "batter"); 
    insert(root, "batman"); 
    insert(root, "bath");
    
    insert(root, "cat"); 
    insert(root, "cater"); 
    insert(root, "cart");
    
    insert(root, "dog"); 
    insert(root, "dove"); 
    insert(root, "door");
    
    cout << "Search 'apple': " << search(root, "apple") << "\\n";           // 1
    cout << "Search 'batman': " << search(root, "batman") << "\\n";         // 1
    cout << "Search 'cat': " << search(root, "cat") << "\\n";               // 1
    cout << "Search 'do': " << search(root, "do") << "\\n";                 // 0
    
    cout << "Starts with 'app': " << startsWith(root, "app") << "\\n";      // 1
    cout << "Starts with 'batm': " << startsWith(root, "batm") << "\\n";    // 1
    cout << "Starts with 'do': " << startsWith(root, "do") << "\\n";        // 1
    cout << "Starts with 'xyz': " << startsWith(root, "xyz") << "\\n";      // 0
    
    return 0;
}`,
    "python": `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

def insert(root, word):
    node = root
    for char in word:
        if char not in node.children:
            node.children[char] = TrieNode()
        node = node.children[char]
    node.is_end_of_word = True

def search(root, word):
    node = root
    for char in word:
        if char not in node.children:
            return False
        node = node.children[char]
    return node.is_end_of_word

def starts_with(root, prefix):
    node = root
    for char in prefix:
        if char not in node.children:
            return False
        node = node.children[char]
    return True

if __name__ == "__main__":
    root = TrieNode()
    
    # Expanded insertions to create deep branches and distinct root paths
    words_to_insert = [
        "apple", "app", "application", "apt",
        "bat", "batter", "batman", "bath",
        "cat", "cater", "cart",
        "dog", "dove", "door"
    ]
    for w in words_to_insert:
        insert(root, w)
    
    print(f"Search 'apple': {search(root, 'apple')}")           # True
    print(f"Search 'batman': {search(root, 'batman')}")         # True
    print(f"Search 'cat': {search(root, 'cat')}")               # True
    print(f"Search 'do': {search(root, 'do')}")                 # False
    
    print(f"Starts with 'app': {starts_with(root, 'app')}")     # True
    print(f"Starts with 'batm': {starts_with(root, 'batm')}")   # True
    print(f"Starts with 'do': {starts_with(root, 'do')}")       # True
    print(f"Starts with 'xyz': {starts_with(root, 'xyz')}")     # False`,
    "java": `public class Main {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEndOfWord = false;
    }

    public static void insert(TrieNode root, String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) {
                node.children[index] = new TrieNode();
            }
            node = node.children[index];
        }
        node.isEndOfWord = true;
    }

    public static boolean search(TrieNode root, String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) return false;
            node = node.children[index];
        }
        return node.isEndOfWord;
    }

    public static boolean startsWith(TrieNode root, String prefix) {
        TrieNode node = root;
        for (char c : prefix.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) return false;
            node = node.children[index];
        }
        return true;
    }

    public static void main(String[] args) {
        TrieNode root = new TrieNode();
        
        // Expanded insertions to create deep branches and distinct root paths
        String[] wordsToInsert = {
            "apple", "app", "application", "apt",
            "bat", "batter", "batman", "bath",
            "cat", "cater", "cart",
            "dog", "dove", "door"
        };
        for (String w : wordsToInsert) insert(root, w);
        
        System.out.println("Search 'apple': " + search(root, "apple"));           // true
        System.out.println("Search 'batman': " + search(root, "batman"));         // true
        System.out.println("Search 'cat': " + search(root, "cat"));               // true
        System.out.println("Search 'do': " + search(root, "do"));                 // false
        
        System.out.println("Starts with 'app': " + startsWith(root, "app"));      // true
        System.out.println("Starts with 'batm': " + startsWith(root, "batm"));    // true
        System.out.println("Starts with 'do': " + startsWith(root, "do"));        // true
        System.out.println("Starts with 'xyz': " + startsWith(root, "xyz"));      // false
    }
}`,
    "js": `function createTrieNode() {
    return { children: {}, isEndOfWord: false };
}

function insert(root, word) {
    let node = root;
    for (let char of word) {
        if (!node.children[char]) {
            node.children[char] = createTrieNode();
        }
        node = node.children[char];
    }
    node.isEndOfWord = true;
}

function search(root, word) {
    let node = root;
    for (let char of word) {
        if (!node.children[char]) return false;
        node = node.children[char];
    }
    return node.isEndOfWord;
}

function startsWith(root, prefix) {
    let node = root;
    for (let char of prefix) {
        if (!node.children[char]) return false;
        node = node.children[char];
    }
    return true;
}

const root = createTrieNode();

// Expanded insertions to create deep branches and distinct root paths
const wordsToInsert = [
    "apple", "app", "application", "apt",
    "bat", "batter", "batman", "bath",
    "cat", "cater", "cart",
    "dog", "dove", "door"
];
for (let w of wordsToInsert) insert(root, w);

console.log("Search 'apple':", search(root, "apple"));           // true
console.log("Search 'batman':", search(root, "batman"));         // true
console.log("Search 'cat':", search(root, "cat"));               // true
console.log("Search 'do':", search(root, "do"));                 // false

console.log("Starts with 'app':", startsWith(root, "app"));      // true
console.log("Starts with 'batm':", startsWith(root, "batm"));    // true
console.log("Starts with 'do':", startsWith(root, "do"));        // true
console.log("Starts with 'xyz':", startsWith(root, "xyz"));      // false`
            }
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
            ],
            codes: {
    "c++": `#include <iostream>
#include <string>

using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

void addWord(TrieNode* root, const string& word) {
    TrieNode* node = root;
    for (char ch : word) {
        int idx = ch - 'a';
        if (!node->children[idx]) {
            node->children[idx] = new TrieNode();
        }
        node = node->children[idx];
    }
    node->isEndOfWord = true;
}

bool dfsSearch(TrieNode* node, const string& word, int pos) {
    if (!node) return false;
    if (pos == word.length()) return node->isEndOfWord;

    char ch = word[pos];
    if (ch == '.') {
        for (int i = 0; i < 26; i++) {
            if (node->children[i] && dfsSearch(node->children[i], word, pos + 1)) {
                return true;
            }
        }
        return false;
    }
    
    return dfsSearch(node->children[ch - 'a'], word, pos + 1);
}

bool search(TrieNode* root, const string& word) {
    return dfsSearch(root, word, 0);
}

int main() {
    TrieNode* root = new TrieNode();
    
    // Group 1: 'ad' endings
    addWord(root, "bad"); addWord(root, "dad"); 
    addWord(root, "mad"); addWord(root, "pad");
    
    // Group 2: 'at' endings
    addWord(root, "bat"); addWord(root, "cat"); 
    addWord(root, "rat"); addWord(root, "mat");
    
    // Group 3: 'ake' endings
    addWord(root, "bake"); addWord(root, "cake"); 
    addWord(root, "make"); addWord(root, "lake");
    
    // Group 4: 'all' endings
    addWord(root, "ball"); addWord(root, "call"); 
    addWord(root, "fall"); addWord(root, "tall");

    cout << "Search 'pad': " << search(root, "pad") << "\\n";     // 1
    cout << "Search 'bad': " << search(root, "bad") << "\\n";     // 1
    cout << "Search '.ad': " << search(root, ".ad") << "\\n";     // 1
    cout << "Search 'b..': " << search(root, "b..") << "\\n";     // 1
    cout << "Search 'm.ke': " << search(root, "m.ke") << "\\n";   // 1
    cout << "Search 'c.l.': " << search(root, "c.l.") << "\\n";   // 1
    cout << "Search '....': " << search(root, "....") << "\\n";   // 1 (matches 'bake', 'ball', etc.)
    cout << "Search 'b...': " << search(root, "b...") << "\\n";   // 1 (matches 'bake', 'ball')
    cout << "Search 'xyz': " << search(root, "xyz") << "\\n";     // 0
    
    return 0;
}`,
    "python": `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_end_of_word = False

def add_word(root, word):
    node = root
    for char in word:
        if char not in node.children:
            node.children[char] = TrieNode()
        node = node.children[char]
    node.is_end_of_word = True

def dfs_search(node, word, index):
    if index == len(word):
        return node.is_end_of_word
        
    char = word[index]
    if char == '.':
        for child in node.children.values():
            if dfs_search(child, word, index + 1):
                return True
        return False
    else:
        if char not in node.children:
            return False
        return dfs_search(node.children[char], word, index + 1)

def search(root, word):
    return dfs_search(root, word, 0)

if __name__ == "__main__":
    root = TrieNode()
    
    # Expanded word groups to ensure widespread wildcard branching
    words_to_add = [
        "bad", "dad", "mad", "pad",
        "bat", "cat", "rat", "mat",
        "bake", "cake", "make", "lake",
        "ball", "call", "fall", "tall"
    ]
    for w in words_to_add:
        add_word(root, w)
    
    print(f"Search 'pad': {search(root, 'pad')}")       # True
    print(f"Search 'bad': {search(root, 'bad')}")       # True
    print(f"Search '.ad': {search(root, '.ad')}")       # True
    print(f"Search 'b..': {search(root, 'b..')}")       # True
    print(f"Search 'm.ke': {search(root, 'm.ke')}")     # True
    print(f"Search 'c.l.': {search(root, 'c.l.')}")     # True
    print(f"Search '....': {search(root, '....')}")     # True
    print(f"Search 'b...': {search(root, 'b...')}")     # True
    print(f"Search 'xyz': {search(root, 'xyz')}")       # False`,
    "java": `public class Main {
    static class TrieNode {
        TrieNode[] children = new TrieNode[26];
        boolean isEndOfWord = false;
    }

    public static void addWord(TrieNode root, String word) {
        TrieNode node = root;
        for (char c : word.toCharArray()) {
            int index = c - 'a';
            if (node.children[index] == null) {
                node.children[index] = new TrieNode();
            }
            node = node.children[index];
        }
        node.isEndOfWord = true;
    }

    public static boolean dfsSearch(TrieNode node, char[] word, int index) {
        if (node == null) return false;
        if (index == word.length) return node.isEndOfWord;

        char c = word[index];
        if (c == '.') {
            for (int i = 0; i < 26; i++) {
                if (dfsSearch(node.children[i], word, index + 1)) {
                    return true;
                }
            }
            return false;
        } else {
            return dfsSearch(node.children[c - 'a'], word, index + 1);
        }
    }

    public static boolean search(TrieNode root, String word) {
        return dfsSearch(root, word.toCharArray(), 0);
    }

    public static void main(String[] args) {
        TrieNode root = new TrieNode();
        
        // Expanded word groups to ensure widespread wildcard branching
        String[] wordsToAdd = {
            "bad", "dad", "mad", "pad",
            "bat", "cat", "rat", "mat",
            "bake", "cake", "make", "lake",
            "ball", "call", "fall", "tall"
        };
        for (String w : wordsToAdd) addWord(root, w);
        
        System.out.println("Search 'pad': " + search(root, "pad"));       // true
        System.out.println("Search 'bad': " + search(root, "bad"));       // true
        System.out.println("Search '.ad': " + search(root, ".ad"));       // true
        System.out.println("Search 'b..': " + search(root, "b.."));       // true
        System.out.println("Search 'm.ke': " + search(root, "m.ke"));     // true
        System.out.println("Search 'c.l.': " + search(root, "c.l."));     // true
        System.out.println("Search '....': " + search(root, "...."));     // true
        System.out.println("Search 'b...': " + search(root, "b..."));     // true
        System.out.println("Search 'xyz': " + search(root, "xyz"));       // false
    }
}`,
    "js": `function createTrieNode() {
    return { children: {}, isEndOfWord: false };
}

function addWord(root, word) {
    let node = root;
    for (let char of word) {
        if (!node.children[char]) {
            node.children[char] = createTrieNode();
        }
        node = node.children[char];
    }
    node.isEndOfWord = true;
}

function dfsSearch(node, word, index) {
    if (index === word.length) return node.isEndOfWord;

    const char = word[index];
    if (char === '.') {
        for (let key in node.children) {
            if (dfsSearch(node.children[key], word, index + 1)) {
                return true;
            }
        }
        return false;
    } else {
        if (!node.children[char]) return false;
        return dfsSearch(node.children[char], word, index + 1);
    }
}

function search(root, word) {
    return dfsSearch(root, word, 0);
}

const root = createTrieNode();

// Expanded word groups to ensure widespread wildcard branching
const wordsToAdd = [
    "bad", "dad", "mad", "pad",
    "bat", "cat", "rat", "mat",
    "bake", "cake", "make", "lake",
    "ball", "call", "fall", "tall"
];
for (let w of wordsToAdd) addWord(root, w);

console.log("Search 'pad':", search(root, "pad"));       // true
console.log("Search 'bad':", search(root, "bad"));       // true
console.log("Search '.ad':", search(root, ".ad"));       // true
console.log("Search 'b..':", search(root, "b.."));       // true
console.log("Search 'm.ke':", search(root, "m.ke"));     // true
console.log("Search 'c.l.':", search(root, "c.l."));     // true
console.log("Search '....':", search(root, "...."));     // true
console.log("Search 'b...':", search(root, "b..."));     // true
console.log("Search 'xyz':", search(root, "xyz"));       // false`
            }
        }
    ],
    desc: "Prefix trees, autocomplete, word search",
    complexity: "O(m)",
    featured: true
};
export default TRIES_SECTION

/*


const TRIES_SECTION2 = {
  name: "Tries",
  href: "/algorithms/tries",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <line x1="32" y1="14" x2="16" y2="32"/>
        <line x1="32" y1="14" x2="48" y2="32"/>
        <line x1="16" y1="32" x2="8" y2="52"/>
        <line x1="16" y1="32" x2="24" y2="52"/>
        <line x1="48" y1="32" x2="40" y2="52"/>
        <line x1="48" y1="32" x2="56" y2="52"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4" fill="#34D399" stroke="#34D399"/>
        <line x1="32" y1="14" x2="16" y2="32" stroke="#34D399" strokeWidth="4"/>
        <line x1="32" y1="14" x2="48" y2="32"/>
        <line x1="16" y1="32" x2="8" y2="52"/>
        <line x1="16" y1="32" x2="24" y2="52" stroke="#34D399" strokeWidth="4"/>
        <circle cx="24" cy="52" r="4" fill="#34D399" stroke="#34D399"/>
        <line x1="48" y1="32" x2="40" y2="52"/>
        <line x1="48" y1="32" x2="56" y2="52"/>
      </svg>
    ),

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

    // ════════════════════════════════════════════════════════════════════
    //    1. WORD SEARCH II
    // ════════════════════════════════════════════════════════════════════
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
      ],
      codes:{
        "c++":`#include <iostream>
#include <vector>
#include <string>

using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;
    string word;

    TrieNode() {
        isEndOfWord = false;
        word = "";
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

TrieNode* root;

void insert(string word) {
    if (root == nullptr)
        root = new TrieNode();

    TrieNode* node = root;

    for (char ch : word) {
        int idx = ch - 'a';
        if (node->children[idx] == nullptr)
            node->children[idx] = new TrieNode();
        node = node->children[idx];
    }

    node->isEndOfWord = true;
    node->word = word;
}

void dfs(vector<vector<char>>& board, int row, int col, TrieNode* node, vector<string>& ans) {

    if (row < 0 || row >= board.size() || col < 0 || col >= board[0].size())
        return;

    if (board[row][col] == '#')
        return;

    char ch = board[row][col];

    if (node->children[ch - 'a'] == nullptr)
        return;

    node = node->children[ch - 'a'];

    if (node->isEndOfWord) {
        ans.push_back(node->word);
        node->isEndOfWord = false;
    }

    board[row][col] = '#';

    dfs(board, row + 1, col, node, ans);
    dfs(board, row - 1, col, node, ans);
    dfs(board, row, col + 1, node, ans);
    dfs(board, row, col - 1, node, ans);

    board[row][col] = ch;
}

int main() {

    vector<string> words = {
        "oath",
        "pea",
        "eat",
        "rain",
        "hike",
        "oak",
        "oat"
    };

    for (string word : words)
        insert(word);

    vector<vector<char>> board = {
        {'o','a','a','n'},
        {'e','t','a','e'},
        {'i','h','k','r'},
        {'i','f','l','v'}
    };

    vector<string> ans;

    for (int i = 0; i < board.size(); i++) {
        for (int j = 0; j < board[0].size(); j++) {
            dfs(board, i, j, root, ans);
        }
    }

    cout << "Words Found:" << endl;

    for (string word : ans)
        cout << word << endl;

    return 0;
}`
      }
    },

    // ════════════════════════════════════════════════════════════════════
    //    2. IMPLEMENT TRIE
    // ════════════════════════════════════════════════════════════════════
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
      ],
      codes:{
        "c++":`#include <iostream>
#include <string>

using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

TrieNode* root;

void insert(string word) {

    if (root == nullptr)
        root = new TrieNode();

    TrieNode* node = root;

    for (char ch : word) {
        int idx = ch - 'a';

        if (node->children[idx] == nullptr)
            node->children[idx] = new TrieNode();

        node = node->children[idx];
    }

    node->isEndOfWord = true;
}

bool search(string word) {

    if (root == nullptr)
        return false;

    TrieNode* node = root;

    for (char ch : word) {
        int idx = ch - 'a';

        if (node->children[idx] == nullptr)
            return false;

        node = node->children[idx];
    }

    return node->isEndOfWord;
}

bool startsWith(string prefix) {

    if (root == nullptr)
        return false;

    TrieNode* node = root;

    for (char ch : prefix) {
        int idx = ch - 'a';

        if (node->children[idx] == nullptr)
            return false;

        node = node->children[idx];
    }

    return true;
}

int main() {

    // a branch
    insert("apple");
    insert("app");
    insert("apply");
    insert("ape");

    // b branch
    insert("bat");
    insert("bath");
    insert("banana");
    insert("band");

    // c branch
    insert("cat");
    insert("catch");
    insert("cater");
    insert("cap");

    // d branch
    insert("dog");
    insert("door");
    insert("dot");

    // e branch
    insert("ear");
    insert("earth");
    insert("easy");

    // t branch
    insert("tree");
    insert("trie");
    insert("trip");

    cout << search("apple") << endl;
    cout << search("apply") << endl;
    cout << search("banana") << endl;
    cout << search("band") << endl;
    cout << search("cat") << endl;
    cout << search("tree") << endl;
    cout << search("unknown") << endl;

    cout << startsWith("ap") << endl;
    cout << startsWith("ban") << endl;
    cout << startsWith("cat") << endl;
    cout << startsWith("do") << endl;
    cout << startsWith("tri") << endl;
    cout << startsWith("xyz") << endl;

    return 0;
}`
      }
    },

    // ════════════════════════════════════════════════════════════════════
    //    3. ADD AND SEARCH WORDS
    // ════════════════════════════════════════════════════════════════════
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
      ],
      codes:{
        "c++":`#include <iostream>
#include <string>

using namespace std;

struct TrieNode {
    TrieNode* children[26];
    bool isEndOfWord;

    TrieNode() {
        isEndOfWord = false;
        for (int i = 0; i < 26; i++)
            children[i] = nullptr;
    }
};

TrieNode* root;

void insert(string word) {

    if (root == nullptr)
        root = new TrieNode();

    TrieNode* node = root;

    for (char ch : word) {
        int idx = ch - 'a';

        if (node->children[idx] == nullptr)
            node->children[idx] = new TrieNode();

        node = node->children[idx];
    }

    node->isEndOfWord = true;
}

// Renamed the overloaded function to 'searchHelper'
bool searchHelper(string word, int pos, TrieNode* node) {

    if (node == nullptr)
        return false;

    if (pos == word.length())
        return node->isEndOfWord;

    if (word[pos] == '.') {

        for (int i = 0; i < 26; i++) {
            if (searchHelper(word, pos + 1, node->children[i]))
                return true;
        }

        return false;
    }

    return searchHelper(word, pos + 1, node->children[word[pos] - 'a']);
}

// Main search function calls searchHelper
bool search(string word) {
    return searchHelper(word, 0, root);
}

int main() {

    insert("bad");
    insert("dad");
    insert("mad");
    insert("pad");
    insert("bat");
    insert("ball");
    insert("bake");
    insert("make");

    cout << search("pad") << endl;
    cout << search("bad") << endl;
    cout << search(".ad") << endl;
    cout << search("b..") << endl;
    cout << search("ba..") << endl;
    cout << search("m.ke") << endl;
    cout << search("....") << endl;
    cout << search("c..") << endl;

    return 0;
}
`
      }
    }

  ],
  desc: "Prefix trees, autocomplete, word search",
  complexity: "O(m)",
  featured: false
};
*/

