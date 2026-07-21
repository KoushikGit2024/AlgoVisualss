import { cn } from '../../lib/utils';
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
  Binary
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
      { prefix: "network", example: "vector<vector<int>> network_nodes" },
      { prefix: "edges", example: "vector<vector<int>> edges" },
      { prefix: "vertices", example: "vector<Node> vertices" },
      { prefix: "paths", example: "vector<vector<int>> paths" }
    ],
    shape: "Value must be a 2D array (adjacency list). Inherently renders as directed edges.",
    auxiliary: [
      { role: "Edge list", trigger: "Any variable containing `edge` (e.g., `graph_edges`)", notes: "Expected format: `[[u, v], [x, y]]`" },
      { role: "Visited state", trigger: "Any variable containing `visit`", notes: "Elements set to `1` pulse with the highlight color" },
      { role: "Pointer badges", trigger: "Any pointer variable or index", notes: "Automatically tracked by the engine. Renders as floating badges." },
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
      { prefix: "root", example: "TreeNode* root" },
      { prefix: "heap", example: "vector<int> heap" },
      { prefix: "forest", example: "vector<TreeNode> forest" },
      { prefix: "leaves", example: "vector<TreeNode> leaves" },
      { prefix: "nodes", example: "vector<TreeNode> nodes" }
    ],
    shape: "Can be a pointer-based tree (struct with `value` + `left`/`right` pointers) OR an array of objects with `id` and `value` fields.",
    auxiliary: [
      { role: "Pointers", trigger: "Any pointer variable", notes: "Automatically tracked by the engine. Stores target node's `id`" }
    ]
  },
  {
    title: "Tries — <TrieTree />",
    icon: <Network className="text-ds-trie" size={18} />,
    color: "border-ds-trie/30 bg-ds-trie/5",
    textColor: "text-ds-trie",
    description: "Renders an N-ary prefix tree (Trie). Auto-detects child mappings and terminal nodes.",
    prefixes: [
      { prefix: "trie", example: "vector<TrieNode> trie_nodes" },
      { prefix: "prefix_tree", example: "TrieNode* prefix_tree" },
      { prefix: "ptree", example: "TrieNode* ptree" },
      { prefix: "dictionary_tree", example: "TrieNode* dictionary_tree" },
      { prefix: "suffix_tree", example: "TrieNode* suffix_tree" }
    ],
    shape: "A struct containing a `children` map/array OR an array of objects with `id`, `value`, and `children`.",
    auxiliary: [
      { role: "Pointers", trigger: "Any pointer variable", notes: "Automatically tracked by the engine." }
    ]
  },
  {
    title: "2D Matrices — <D2Array />",
    icon: <Grid className="text-accent-2" size={18} />,
    color: "border-accent-2/30 bg-accent-2/5",
    textColor: "text-accent-2",
    description: "Renders a 2D grid/matrix layout. Automatically handles and aligns jagged/irregular arrays where rows have varying lengths.",
    prefixes: [
      { prefix: "ANY NAME", example: "vector<vector<int>> matrix_data" },
      { prefix: "ANY NAME", example: "int table2d[10][10]" }
    ],
    shape: "Value must be a 2D array (array of arrays). Supports jagged/irregular rows. Detection is completely automatic based on structure, no naming prefix is required!",
    auxiliary: [
      { role: "Row/Column pointers", trigger: "Any variables used as 2D indices (e.g., `mat[r][c]`)", notes: "Automatically tracked by the engine during access." }
    ]
  },
  {
    title: "1D Arrays — <D1Array />",
    icon: <List className="text-accent-3" size={18} />,
    color: "border-accent-3/30 bg-accent-3/5",
    textColor: "text-accent-3",
    description: "Renders a linear array.",
    prefixes: [
      { prefix: "ANY NAME", example: "vector<int> arr" },
      { prefix: "ANY NAME", example: "array<int, 5> array_data" }
    ],
    shape: "Value must be a flat array of primitives (numbers, strings, booleans). Detection is completely automatic based on structure, no naming prefix is required!",
    auxiliary: [
      { role: "Indexers / Pointers", trigger: "Any variable used as an index (e.g., `arr[i]`)", notes: "Automatically tracked by the engine." },
      { role: "Range Highlighting", trigger: "Pairs: `left`/`right`, `l`/`r`, `start`/`end`, `low`/`high`, `first`/`last`", notes: "If a pointer pair exists in the scope, the elements between them are automatically highlighted as a range." }
    ]
  },
  {
    title: "Sorting Bars — <SortBars />",
    icon: <List className="text-accent" size={18} />,
    color: "border-accent/30 bg-accent/5",
    textColor: "text-accent",
    description: "Renders an array as vertical bars proportional to their value. Automatically triggered instead of <D1Array /> when the variable is exactly named `arr` and the current page is a sorting algorithm.",
    prefixes: [
      { prefix: "arr", example: "vector<int> arr" }
    ],
    shape: "Flat numeric array. Triggers automatically based on URL routing (`/algorithms/sorting`).",
    auxiliary: [
      { role: "Pointers", trigger: "Any variable used as an index", notes: "Automatically tracked by the engine." }
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
      { prefix: "queue", example: "deque<string> queue_names" },
      { prefix: "deque", example: "deque<int> deque_window" },
      { prefix: "buffer", example: "queue<char> buffer" },
      { prefix: "line", example: "queue<int> line" },
      { prefix: "queue_nodes", example: "queue<Node> queue_nodes" },
      { prefix: "tasks", example: "queue<Task> tasks" }
    ],
    shape: "Value must be a flat array of primitives.",
    auxiliary: [
      { role: "Pointers", trigger: "Any pointer variable", notes: "Automatically tracked by the engine." }
    ]
  },
  {
    title: "Stacks — <Stack />",
    icon: <Layers className="text-accent-3" size={18} />,
    color: "border-accent-3/30 bg-accent-3/5",
    textColor: "text-accent-3",
    description: "Renders a vertical LIFO bucket where elements animate strictly top-down.",
    prefixes: [
      { prefix: "stack", example: "vector<string> stack_names" },
      { prefix: "stk", example: "stack<char> stk_chars" },
      { prefix: "history", example: "stack<int> history" },
      { prefix: "undo", example: "stack<Action> undo" },
      { prefix: "frames", example: "stack<Frame> frames" }
    ],
    shape: "Value must be a flat array of primitives.",
    auxiliary: [
      { role: "Stack pointers", trigger: "Any pointer variable", notes: "Automatically tracked by the engine. Pointer badges attach to the right side." }
    ]
  },
  {
    title: "Strings \u2014 <String />",
    icon: <Type className="text-ds-string" size={18} />,
    color: "border-ds-string/30 bg-ds-string/5",
    textColor: "text-ds-string",
    description: "Renders characters continuously with distinct text-specific styling.",
    prefixes: [
      { prefix: "ANY NAME", example: "string string_data" },
      { prefix: "ANY NAME", example: "vector<char> chars" }
    ],
    shape: "Value must be a Javascript primitive string or an array of characters. Detection is completely automatic based on structure.",
    auxiliary: [
      { role: "Indexers", trigger: "Any variable used as an index", notes: "Automatically tracked by the engine." }
    ]
  },
  {
    title: "Maps — <Map />",
    icon: <Database className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description: "Renders key-value pairs.",
    prefixes: [
      { prefix: "ANY NAME", example: "unordered_map<int, int> map_freq" },
      { prefix: "ANY NAME", example: "map<string, int> dict" }
    ],
    shape: "Value must be a map object internally emitted by the engine. Detection is automatic.",
    auxiliary: []
  },
  {
    title: "Sets — <Set />",
    icon: <Database className="text-success" size={18} />,
    color: "border-success/30 bg-success/5",
    textColor: "text-success",
    description: "Renders unique set elements as distinct badges.",
    prefixes: [
      { prefix: "ANY NAME", example: "unordered_set<int> set_data" },
      { prefix: "ANY NAME", example: "set<int> unique_vals" }
    ],
    shape: "Value must be a set object internally emitted by the engine. Detection is automatic.",
    auxiliary: []
  },
  {
    title: "Bitsets & Masks \u2014 <Bitset />",
    icon: <Binary className="text-ds-bitset" size={18} />,
    color: "border-ds-bitset/30 bg-ds-bitset/5",
    textColor: "text-ds-bitset",
    description: "Renders an integer or boolean array as a strip of glowing bits.",
    prefixes: [
      { prefix: "ANY NAME", example: "vector<bool> bits" },
      { prefix: "ANY NAME", example: "bitset<32> b" }
    ],
    shape: "Value must be a Javascript primitive number or an array of booleans. Detection is automatic.",
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
            <p className="text-[calc(13rem/16)] text-muted"><strong className="text-text">PREFIX match</strong> — Does the variable name start with a known trigger prefix?</p>
          </div>
          <div className="flex items-start gap-2 bg-surface p-3 rounded-lg border border-border">
            <span className="w-5 h-5 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold shrink-0">2</span>
            <p className="text-[calc(13rem/16)] text-muted"><strong className="text-text">SHAPE validation</strong> — Is the runtime value actually the correct data shape?</p>
          </div>
        </div>
        <p className="text-[calc(12rem/16)] text-muted mt-3 italic">
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
          <table className="w-full text-left border-collapse text-[calc(13rem/16)]">
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
                { p: 2, c: "<TrieTree />", w: "Specific N-ary tree check before binary trees" },
                { p: 3, c: "<Tree />", w: "Requires `tree_`/`bst_` + node objects" },
                { p: 4, c: "<D2Array />", w: "2D array shape (matrix)" },
                { p: 5, c: "<LinkedList />", w: "Automatic structure detection (`value` + `next` fields)" },
                { p: 6, c: "<Stack />", w: "Flat array with LIFO semantics" },
                { p: 7, c: "<Queue />", w: "Flat array with FIFO semantics" },
                { p: 8, c: "<D1Array />", w: "Generic flat array fallback" },
                { p: 9, c: "<Map />", w: "Checks for internal `__type === 'map'`" },
                { p: 10, c: "<Set />", w: "Checks for internal `__type === 'set'`" },
                { p: 11, c: "<String />", w: "Specific text/string matching" },
                { p: 12, c: "<Bitset />", w: "Bitmask matching" },
                { p: 13, c: "<Scalar />", w: "Scalar matching" }
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
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {DATA_STRUCTURES.map((ds, idx) => (
          <section key={idx} className={cn(`border rounded-xl overflow-hidden ${ds.color.split(" ")[0]} bg-surface`)}>
            {/* Header */}
            <div className={cn(`px-4 py-3 border-b ${ds.color.split(" ")[0]} ${ds.color.split(" ")[1]} flex items-center gap-2`)}>
              {ds.icon}
              <h2 className="font-bold text-[calc(14rem/16)] text-text">{ds.title}</h2>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <p className="text-[calc(13rem/16)] text-muted">{ds.description}</p>
              
              {/* Prefixes */}
              <div>
                <h3 className="text-[calc(11rem/16)] font-bold text-text uppercase tracking-wider mb-2">Primary Structure Prefixes</h3>
                <div className="flex flex-wrap gap-1.5">
                  {ds.prefixes.map((pref, i) => (
                    <div 
                      key={i} 
                      className="group relative flex items-center bg-surface-2 px-2 py-0.5 rounded border border-border cursor-help"
                    >
                      <span className={cn(`font-mono ${ds.textColor} text-[11.5px] font-semibold`)}>
                        {pref.prefix}
                      </span>
                      {/* Tooltip for example */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 whitespace-nowrap bg-bg border border-border px-2 py-1 rounded shadow-lg">
                        <code className="text-[calc(10rem/16)] font-mono text-muted">{pref.example}</code>
                      </div>
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
                  <h3 className="text-[calc(11rem/16)] font-bold text-text uppercase tracking-wider mb-2 mt-2">Auxiliary Variables (Auto-Bound)</h3>
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
        <p className="text-[calc(13rem/16)] text-muted mb-4">
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
              <span className="text-[calc(12rem/16)] text-muted">{item.why}</span>
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
          <table className="w-full text-left border-collapse text-[calc(12rem/16)]">
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
                { c: "<TrieTree />", p: "trie, prefix_tree, ptree", s: "Struct OR Array", a: "curr, node, ptr, temp" },
                { c: "<Tree />", p: "tree, bst, root, heap, forest", s: "Struct OR Array", a: "root, curr, parent, temp, left, right" },
                { c: "<D2Array />", p: "(Any Name)", s: "2D array (Jagged allowed)", a: "r/row/r_*, c/col/c_* (both req)" },
                { c: "<D1Array />", p: "(Any Name)", s: "Flat array", a: "i, j, k, left, right, mid, curr, ptr" },
                { c: "<SortBars />", p: "arr", s: "Numeric array on sorting pages", a: "i, j, k" },
                { c: "<LinkedList />", p: "(Any Name)", s: "Struct with `value` & `next`", a: "All node pointers automatically attach" },
                { c: "<Queue />", p: "queue, deque, line, queue_nodes, tasks", s: "Flat array", a: "front, back, rear, head, tail, curr" },
                { c: "<Stack />", p: "stack, stk, history, undo, frames", s: "Flat array", a: "top, peek" },
                { c: "<Map />", p: "(Any Name)", s: "Map Object", a: "None" },
                { c: "<Set />", p: "(Any Name)", s: "Set Object", a: "None" },
                { c: "<String />", p: "(Any Name)", s: "String / Char Array", a: "i, j, k, left, right, mid, curr, ptr" },
                { c: "<Bitset />", p: "(Any Name)", s: "Number / Bool Array", a: "None" }
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
        <h2 className="text-lg font-bold text-ds-string mb-3 flex items-center gap-2">
          <Database size={20} />
          Engine Limits & Semantic Compression
        </h2>
        <p className="text-[calc(13rem/16)] text-muted leading-relaxed mb-4">
          To prevent browser out-of-memory crashes on enormous algorithms (like backtracking), the VisualGround engine features a smart <strong className="text-text">Semantic Hierarchical Compression</strong> system.
        </p>
        <ul className="flex flex-col gap-2 mb-4 text-[calc(13rem/16)] text-muted list-disc list-inside marker:text-ds-string">
          <li><strong>Max Execution Steps:</strong> The engine will halt execution if a single run exceeds <code className="text-text">2,000,000</code> operations to prevent infinite loops.</li>
          <li><strong>Smart Frame Dropping:</strong> If the visualizer accumulates over <code className="text-text">30,000</code> animation frames, it automatically begins dropping less-important events to save memory.</li>
          <li>It first drops <code className="text-text">READ</code> events (which usually make up 90% of a loop), keeping all your assignments, function calls, and console logs completely intact!</li>
          <li>If memory pressure continues, it drops <code className="text-text">CONDITION</code> and loop events, meaning variables will jump cleanly to their next states without showing the intermediate loop overhead.</li>
        </ul>
        <p className="text-[calc(13rem/16)] text-muted italic border-l-2 border-accent pl-3 py-1 bg-surface/50 rounded-r">
          <strong>Playback Tip:</strong> The playback speed slider directly sets the exact delay between frames in milliseconds (<code className="text-text">1ms - 1000ms</code>) for precise, real-time timing control. You can also click the value to type an exact number.
        </p>
      </section>

    </div>
  );
}
