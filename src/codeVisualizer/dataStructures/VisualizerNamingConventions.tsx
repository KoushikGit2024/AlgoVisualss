import {
  Network,
  GitMerge,
  Grid,
  List,
  Link as LinkIcon,
  ArrowRightLeft,
  Layers,
  ShieldAlert,
  Zap,
  Info,
  ListOrdered,
  Database,
  Type,
  Binary,
  Hash
} from "lucide-react";

const DATA_STRUCTURES = [
  {
    title: "Graphs — <Graph />",
    icon: <Network className="text-accent" size={18} />,
    color: "border-accent/30 bg-accent/5",
    textColor: "text-accent",
    description: "Renders a circular node-edge network.",
    prefixes: [
      { prefix: "adj", example: "vector<vector<int>> adj_list" },
      { prefix: "graph", example: "unordered_map<int, vector<int>> graph_map" },
      { prefix: "network", example: "vector<vector<int>> network_nodes" }
    ],
    shape: "Value must be a 2D array (adjacency list). Inherently renders as directed edges.",
    auxiliary: [
      { role: "Edge list", trigger: "Any variable containing `edge` (e.g., `graph_edges`)", notes: "Expected format: `[[u, v], [x, y]]`" },
      { role: "Visited state", trigger: "Any variable containing `visit`", notes: "Elements set to `1` pulse with the highlight color" },
      { role: "Pointer badges", trigger: "`node`, `curr`, `u`, `v`, or `ptr_n*` prefix", notes: "All matching variables render as floating badges simultaneously" },
      { role: "Active node", trigger: "A variable exactly named `current`", notes: "Highlights the node as actively being processed (e.g., in BFS/DFS)" }
    ]
  },
  {
    title: "Trees & BSTs — <Tree />",
    icon: <GitMerge className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description: "Renders a top-down hierarchical tree. Node coordinates are auto-calculated using an in-order layout algorithm.",
    prefixes: [
      { prefix: "tree", example: "vector<TreeNode> tree_nodes" },
      { prefix: "bst", example: "vector<Node> bst_data" },
      { prefix: "trie", example: "vector<TrieNode> trie_nodes" },
      { prefix: "root", example: "TreeNode* root" },
      { prefix: "heap", example: "vector<int> heap" },
      { prefix: "forest", example: "vector<TreeNode> forest" }
    ],
    shape: "Can be a pointer-based tree (struct with `value` + `left`/`right` pointers) OR an array of objects with `id` and `value` fields.",
    auxiliary: [
      { role: "Core pointers", trigger: "`root`, `curr`, `parent`, `temp`", notes: "Stores target node's `id`" },
      { role: "Branch pointers", trigger: "`left`, `right`", notes: "Badges attach above the target node" }
    ]
  },
  {
    title: "2D Matrices — <D2Array />",
    icon: <Grid className="text-accent-2" size={18} />,
    color: "border-accent-2/30 bg-accent-2/5",
    textColor: "text-accent-2",
    description: "Renders a 2D grid/matrix layout. Automatically handles and aligns jagged/irregular arrays where rows have varying lengths.",
    prefixes: [
      { prefix: "mat", example: "vector<vector<int>> mat_grid" },
      { prefix: "grid", example: "vector<vector<int>> grid" },
      { prefix: "board", example: "char board[8][8]" },
      { prefix: "dp", example: "vector<vector<int>> dp_table" },
      { prefix: "table", example: "int table[5][5]" },
      { prefix: "matrix", example: "vector<vector<int>> matrix_data" },
      { prefix: "vec2d", example: "vector<vector<int>> vec2d_arr" },
      { prefix: "array2d", example: "vector<vector<int>> array2d_nums" },
      { prefix: "grid2d", example: "vector<vector<int>> grid2d_board" },
      { prefix: "matrix2d", example: "vector<vector<int>> matrix2d_dp" },
      { prefix: "table2d", example: "int table2d[10][10]" },
      { prefix: "res", example: "vector<vector<int>> res_out" }
    ],
    shape: "Value must be a 2D array (array of arrays). Supports jagged/irregular rows.",
    auxiliary: [
      { role: "Row", trigger: "`r`, `row`, `*_r`, `r_*`", notes: "Both a row and column variable must exist to drop a pointer." },
      { role: "Column", trigger: "`c`, `col`, `*_c`, `c_*`", notes: "" }
    ]
  },
  {
    title: "1D Arrays — <D1Array />",
    icon: <List className="text-accent-3" size={18} />,
    color: "border-accent-3/30 bg-accent-3/5",
    textColor: "text-accent-3",
    description: "Renders a linear array.",
    prefixes: [
      { prefix: "arr", example: "vector<int> arr" },
      { prefix: "vec", example: "vector<string> vec_names" },
      { prefix: "nums", example: "vector<int> nums" },
      { prefix: "seq", example: "vector<float> seq" },
      { prefix: "list", example: "vector<int> list_items" },
      { prefix: "buffer", example: "char buffer[256]" },
      { prefix: "cache", example: "vector<int> cache_arr" },
      { prefix: "res", example: "vector<int> res_out" },
      { prefix: "array", example: "array<int, 5> array_data" },
      { prefix: "tuple", example: "vector<int> tuple_vals" },
      { prefix: "valarray", example: "valarray<int> valarray_nums" },
      { prefix: "collection", example: "vector<int> collection_list" },
      { prefix: "items", example: "vector<int> items" },
      { prefix: "elements", example: "vector<int> elements" }
    ],
    shape: "Value must be a flat array of primitives (numbers, strings, booleans).",
    auxiliary: [
      { role: "Generic indexers", trigger: "`i`, `j`, `k`", notes: "" },
      { role: "Algorithmic pointers", trigger: "`left`, `right`, `mid`, `curr`, `ptr`", notes: "" },
      { role: "Composite examples", trigger: "`ptr_i`, `left_idx`", notes: "" },
      { role: "Range Highlighting", trigger: "Pairs: `left`/`right`, `l`/`r`, `start`/`end`, `low`/`high`, `first`/`last`", notes: "If a pointer pair exists in the scope, the elements between them are automatically highlighted as a range." }
    ]
  },
  {
    title: "Linked Lists — <LinkedList />",
    icon: <LinkIcon className="text-accent" size={18} />,
    color: "border-accent/30 bg-accent/5",
    textColor: "text-accent",
    description: "Renders a sequence of memory blocks connected by pointers. Detection is completely automatic based on structure, no naming prefix is required!",
    prefixes: [
      { prefix: "ANY NAME", example: "Node* start = new Node(10);" },
      { prefix: "ANY NAME", example: "Node* slow = head;" }
    ],
    shape: "A struct/class containing a 'value' (or 'val') field and a 'next' pointer.",
    auxiliary: [
      { role: "All Pointers", trigger: "Any variable pointing to a node", notes: "Regardless of variable name, it will be attached as a floating pointer above the node." }
    ]
  },
  {
    title: "Queues & Deques — <Queue />",
    icon: <ArrowRightLeft className="text-accent-2" size={18} />,
    color: "border-accent-2/30 bg-accent-2/5",
    textColor: "text-accent-2",
    description: "Renders a horizontal FIFO tube where items slide in from the right and exit from the left.",
    prefixes: [
      { prefix: "q_", example: "queue<int> q_nodes" },
      { prefix: "queue", example: "deque<string> queue_names" },
      { prefix: "deque", example: "deque<int> deque_window" },
      { prefix: "buffer_q", example: "queue<char> buffer_q" }
    ],
    shape: "Value must be a flat array of primitives.",
    auxiliary: [
      { role: "Standard ends", trigger: "`front`, `back`, `rear`, `head`, `tail`", notes: "" },
      { role: "General trackers", trigger: "`curr`, `ptr_front`", notes: "" }
    ]
  },
  {
    title: "Stacks — <Stack />",
    icon: <Layers className="text-accent-3" size={18} />,
    color: "border-accent-3/30 bg-accent-3/5",
    textColor: "text-accent-3",
    description: "Renders a vertical LIFO bucket where elements animate strictly top-down.",
    prefixes: [
      { prefix: "st_", example: "stack<int> st_nodes" },
      { prefix: "stack", example: "vector<string> stack_names" },
      { prefix: "stk", example: "stack<char> stk_chars" }
    ],
    shape: "Value must be a flat array of primitives.",
    auxiliary: [
      { role: "Stack pointers", trigger: "`top`, `peek`, `curr`", notes: "Pointer badges attach to the right side of the element." }
    ]
  },
  {
    title: "Strings \u2014 <StringVisualizer />",
    icon: <Type className="text-emerald-500" size={18} />,
    color: "border-emerald-500/30 bg-emerald-500/5",
    textColor: "text-emerald-500",
    description: "Renders characters continuously with distinct text-specific styling.",
    prefixes: [
      { prefix: "str", example: "string str_val" },
      { prefix: "text", example: "string text_data" },
      { prefix: "word", example: "string word" },
      { prefix: "chars", example: "vector<char> chars" },
      { prefix: "msg", example: "string msg" },
      { prefix: "string", example: "string string_data" },
      { prefix: "sentence", example: "string sentence" },
      { prefix: "paragraph", example: "string paragraph" },
      { prefix: "pattern", example: "string pattern" },
      { prefix: "substring", example: "string substring" },
      { prefix: "sub", example: "string sub" }
    ],
    shape: "Value must be a Javascript primitive string or an array of characters.",
    auxiliary: [
      { role: "Indexers", trigger: "`i`, `j`, `k`, `left`, `right`, `mid`, `curr`, `ptr`", notes: "" }
    ]
  },
  {
    title: "Maps & Sets — <MapVisualizer />",
    icon: <Database className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description: "Renders key-value pairs or set elements.",
    prefixes: [
      { prefix: "map", example: "unordered_map<int, int> map_freq" },
      { prefix: "dict", example: "map<string, int> dict" },
      { prefix: "freq", example: "unordered_map<char, int> freq" },
      { prefix: "count", example: "unordered_map<int, int> count" },
      { prefix: "hash", example: "unordered_set<int> hash_set" },
      { prefix: "seen", example: "unordered_set<int> seen" },
      { prefix: "visited", example: "unordered_set<int> visited_nodes" },
      { prefix: "memo", example: "unordered_map<int, int> memo" },
      { prefix: "set", example: "unordered_set<int> set_data" },
      { prefix: "cache_map", example: "unordered_map<int, int> cache_map" }
    ],
    shape: "Value must be a map or set object internally emitted by the engine.",
    auxiliary: []
  },
  {
    title: "Bitsets & Masks \u2014 <BitsetVisualizer />",
    icon: <Binary className="text-cyan-400" size={18} />,
    color: "border-cyan-400/30 bg-cyan-400/5",
    textColor: "text-cyan-400",
    description: "Renders an integer or boolean array as a strip of glowing bits.",
    prefixes: [
      { prefix: "mask", example: "int mask = 5" },
      { prefix: "bits", example: "vector<bool> bits" },
      { prefix: "flags", example: "int flags" },
      { prefix: "bitset", example: "bitset<32> b" },
      { prefix: "state_mask", example: "int state_mask" },
      { prefix: "b", example: "int b" }
    ],
    shape: "Value must be a Javascript primitive number or an array of booleans.",
    auxiliary: []
  },
  {
    title: "Standalone Scalars \u2014 <ScalarVisualizer />",
    icon: <Hash className="text-purple-400" size={18} />,
    color: "border-purple-400/30 bg-purple-400/5",
    textColor: "text-purple-400",
    description: "Renders a large, prominent dashboard counter for crucial tracking variables.",
    prefixes: [
      { prefix: "ans", example: "int ans = 0" },
      { prefix: "sum", example: "long long sum = 0" },
      { prefix: "count", example: "int count" },
      { prefix: "total", example: "int total" },
      { prefix: "result", example: "int result" },
      { prefix: "max_val", example: "int max_val" },
      { prefix: "min_val", example: "int min_val" },
      { prefix: "cnt", example: "int cnt" },
      { prefix: "res_val", example: "int res_val" },
      { prefix: "diff", example: "int diff" }
    ],
    shape: "Value must be a primitive number, string, or boolean.",
    auxiliary: []
  }
];

export default function VisualizerNamingConventions() {
  return (
    <div className="flex flex-col gap-8 pb-10 text-text">
      
      {/* Introduction */}
      <section className="bg-surface-2 p-5 rounded-xl border border-border">
        <h1 className="text-xl font-bold text-accent mb-3 flex items-center gap-2">
          <Info size={22} />
          Detection Philosophy
        </h1>
        <p className="text-sm text-muted leading-relaxed mb-4">
          The <strong className="text-text">VisualGround</strong> engine's heuristic detector parses the AST runtime scope and automatically mounts the correct React component based on variable naming prefixes and value shape.
        </p>
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2 bg-surface p-3 rounded-lg border border-border">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <p className="text-[13px] text-muted"><strong className="text-text">PREFIX match</strong> — Does the variable name start with a known trigger prefix?</p>
          </div>
          <div className="flex items-start gap-2 bg-surface p-3 rounded-lg border border-border">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p className="text-[13px] text-muted"><strong className="text-text">SHAPE validation</strong> — Is the runtime value actually the correct data shape?</p>
          </div>
        </div>
        <p className="text-[12px] text-muted mt-3 italic">
          Example: `numRows = 5` will not trigger &lt;D1Array /&gt; even though it starts with `num`, because `5` is a scalar. Only variables whose value passes both checks get visualized.
        </p>
      </section>

      {/* Priority Table */}
      <section>
        <h2 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <ListOrdered className="text-accent-2" size={20} />
          Priority Order
        </h2>
        <div className="overflow-x-auto border border-border rounded-lg styled-scrollbar">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface-2">
                <th className="px-4 py-3 border-b border-r border-border font-semibold text-text">Priority</th>
                <th className="px-4 py-3 border-b border-r border-border font-semibold text-text">Component</th>
                <th className="px-4 py-3 border-b border-border font-semibold text-text">Why first?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { p: 1, c: "<Graph />", w: "Most specific prefix (`adj_`, `graph_`)" },
                { p: 2, c: "<Tree />", w: "Requires `tree_`/`bst_` + node objects" },
                { p: 3, c: "<D2Array />", w: "2D array shape (matrix)" },
                { p: 4, c: "<LinkedList />", w: "Automatic structure detection (`value` + `next` fields)" },
                { p: 5, c: "<Stack />", w: "Flat array with LIFO semantics" },
                { p: 6, c: "<Queue />", w: "Flat array with FIFO semantics" },
                { p: 7, c: "<D1Array />", w: "Generic flat array fallback" },
                { p: 8, c: "<StringVisualizer />", w: "Specific text/string matching" },
                { p: 9, c: "<BitsetVisualizer />", w: "Bitmask matching" },
                { p: 10, c: "<ScalarVisualizer />", w: "Scalar matching" }
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0 even:bg-surface-2/30 hover:bg-surface-3 transition-colors">
                  <td className="px-4 py-2.5 border-r border-border text-muted font-mono">{row.p}</td>
                  <td className="px-4 py-2.5 border-r border-border text-accent-3 font-mono">{row.c}</td>
                  <td className="px-4 py-2.5 text-muted">{row.w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Data Structures */}
      <div className="flex flex-col gap-6">
        {DATA_STRUCTURES.map((ds, idx) => (
          <section key={idx} className={`border rounded-xl overflow-hidden ${ds.color.split(" ")[0]} bg-surface`}>
            {/* Header */}
            <div className={`px-4 py-3 border-b ${ds.color.split(" ")[0]} ${ds.color.split(" ")[1]} flex items-center gap-2`}>
              {ds.icon}
              <h2 className="font-bold text-[14px] text-text">{ds.title}</h2>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <p className="text-[13px] text-muted">{ds.description}</p>
              
              {/* Prefixes */}
              <div>
                <h3 className="text-[11px] font-bold text-text uppercase tracking-wider mb-2">Primary Structure Prefixes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {ds.prefixes.map((pref, i) => (
                    <div key={i} className="flex flex-col bg-surface-2 p-2.5 rounded-lg border border-border">
                      <span className={`font-mono ${ds.textColor} text-[12px] font-semibold mb-1`}>{pref.prefix}</span>
                      <code className="text-[11px] text-text bg-surface px-2 py-1 rounded border border-border/50">
                        {pref.example}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Shape */}
              <div className="bg-surface-2/50 border-l-2 border-accent-2 px-3 py-2 text-[12.5px] text-muted italic">
                <strong className="text-text not-italic">Shape:</strong> {ds.shape}
              </div>

              {/* Auxiliary Variables */}
              {ds.auxiliary.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-bold text-text uppercase tracking-wider mb-2 mt-2">Auxiliary Variables (Auto-Bound)</h3>
                  <div className="overflow-x-auto border border-border rounded-lg styled-scrollbar">
                    <table className="w-full text-left border-collapse text-[12.5px]">
                      <thead>
                        <tr className="bg-surface-2">
                          <th className="px-3 py-2 border-b border-r border-border font-semibold text-text whitespace-nowrap">Role</th>
                          <th className="px-3 py-2 border-b border-r border-border font-semibold text-text whitespace-nowrap">Trigger</th>
                          <th className="px-3 py-2 border-b border-border font-semibold text-text">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ds.auxiliary.map((aux, i) => (
                          <tr key={i} className="border-b border-border last:border-b-0 even:bg-surface-2/30">
                            <td className="px-3 py-2 border-r border-border text-muted whitespace-nowrap">{aux.role}</td>
                            <td className="px-3 py-2 border-r border-border text-accent-3 font-mono">{aux.trigger}</td>
                            <td className="px-3 py-2 text-muted">{aux.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* Reserved Variables */}
      <section className="bg-surface-2 p-5 rounded-xl border border-border">
        <h2 className="text-lg font-bold text-failure mb-3 flex items-center gap-2">
          <ShieldAlert size={20} />
          Reserved Variables
        </h2>
        <p className="text-[13px] text-muted mb-4">
          These variable names are <strong className="text-text">never consumed</strong> by the detector and will always appear in the Variables panel:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { v: "n, m", why: "Common loop bounds or sizes" },
            { v: "x, y, z", why: "Generic math or coordinate variables" },
            { v: "tmp, _", why: "Placeholders (Note: 'temp' animates in Trees!)" },
            { v: "val, value", why: "Storage for extracted values" },
            { v: "idx, index", why: "Iterators (Note: 'i', 'j', 'k' animate in Arrays!)" },
            { v: "len, size", why: "Length trackers" }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-surface p-3 rounded-lg border border-border">
              <code className="text-failure font-mono text-[12.5px] bg-failure/10 px-2 py-0.5 rounded shrink-0">{item.v}</code>
              <span className="text-[12px] text-muted">{item.why}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Reference */}
      <section>
        <h2 className="text-lg font-bold text-accent-3 mb-4 flex items-center gap-2">
          <Zap size={20} />
          Quick Reference
        </h2>
        <div className="overflow-x-auto border border-border rounded-lg styled-scrollbar">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="bg-surface-2">
                <th className="px-3 py-2.5 border-b border-r border-border font-semibold text-text whitespace-nowrap">Component</th>
                <th className="px-3 py-2.5 border-b border-r border-border font-semibold text-text whitespace-nowrap">Primary Prefixes</th>
                <th className="px-3 py-2.5 border-b border-r border-border font-semibold text-text whitespace-nowrap">Shape Required</th>
                <th className="px-3 py-2.5 border-b border-border font-semibold text-text">Key Auxiliary Variables</th>
              </tr>
            </thead>
            <tbody>
              {[
                { c: "<Graph />", p: "adj, graph, network", s: "2D array", a: "*edge*, *visit*, node/curr/u/v" },
                { c: "<Tree />", p: "tree, bst, trie, root, heap, forest", s: "Struct OR Array", a: "root, curr, parent, temp, left, right" },
                { c: "<D2Array />", p: "mat, grid, board, dp, table, matrix, res", s: "2D array (Jagged allowed)", a: "r/row/r_*, c/col/c_* (both req)" },
                { c: "<D1Array />", p: "arr, vec, nums, seq, list, buffer, cache, res", s: "Flat array", a: "i, j, k, left, right, mid, curr, ptr" },
                { c: "<LinkedList />", p: "(Any Name)", s: "Struct with `value` & `next`", a: "All node pointers automatically attach" },
                { c: "<Queue />", p: "q_, queue, deque, buffer_q", s: "Flat array", a: "front, back, rear, head, tail, curr" },
                { c: "<Stack />", p: "st_, stack, stk", s: "Flat array", a: "top, peek" },
                { c: "<MapVisualizer />", p: "map, dict, freq, count, hash, cache_map, memo, set, seen, visited", s: "Map/Set Object", a: "None" },
                { c: "<StringVisualizer />", p: "str, text, word, chars, msg, string, sentence, paragraph, pattern, substring, sub", s: "String / Char Array", a: "i, j, k, left, right, mid, curr, ptr" },
                { c: "<BitsetVisualizer />", p: "mask, bits, flags, bitset, state_mask", s: "Number / Bool Array", a: "None" },
                { c: "<ScalarVisualizer />", p: "ans, sum, count, total, result, max_val, min_val, cnt, res_val, diff, target", s: "Primitive", a: "None" }
              ].map((row, i) => (
                <tr key={i} className="border-b border-border last:border-b-0 hover:bg-surface-2 transition-colors">
                  <td className="px-3 py-2 border-r border-border text-text font-mono whitespace-nowrap">{row.c}</td>
                  <td className="px-3 py-2 border-r border-border text-accent font-mono">{row.p}</td>
                  <td className="px-3 py-2 border-r border-border text-muted whitespace-nowrap">{row.s}</td>
                  <td className="px-3 py-2 text-muted font-mono">{row.a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Engine Architecture & Limits */}
      <section className="bg-surface-2 p-5 rounded-xl border border-border mt-4">
        <h2 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
          <Database size={20} />
          Engine Limits & Semantic Compression
        </h2>
        <p className="text-[13px] text-muted leading-relaxed mb-4">
          To prevent browser out-of-memory crashes on enormous algorithms (like backtracking), the VisualGround engine features a smart <strong className="text-text">Semantic Hierarchical Compression</strong> system.
        </p>
        <ul className="flex flex-col gap-2 mb-4 text-[13px] text-muted list-disc list-inside marker:text-emerald-400">
          <li><strong>Max Execution Steps:</strong> The engine will halt execution if a single run exceeds <code className="text-text">2,000,000</code> operations to prevent infinite loops.</li>
          <li><strong>Smart Frame Dropping:</strong> If the visualizer accumulates over <code className="text-text">30,000</code> animation frames, it automatically begins dropping less-important events to save memory.</li>
          <li>It first drops <code className="text-text">READ</code> events (which usually make up 90% of a loop), keeping all your assignments, function calls, and console logs completely intact!</li>
          <li>If memory pressure continues, it drops <code className="text-text">CONDITION</code> and loop events, meaning variables will jump cleanly to their next states without showing the intermediate loop overhead.</li>
        </ul>
        <p className="text-[13px] text-muted italic border-l-2 border-accent pl-3 py-1 bg-surface/50 rounded-r">
          <strong>Playback Tip:</strong> The playback speed slider directly sets the exact delay between frames in milliseconds (<code className="text-text">1ms - 1000ms</code>) for precise, real-time timing control. You can also click the value to type an exact number.
        </p>
      </section>

    </div>
  );
}
