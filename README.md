# Algo Visuals

> A dark-native algorithm visualization platform built for competitive programmers who think in C++.

![Algo Visuals Banner](https://via.placeholder.com/1200x400/0d1117/ffffff?text=Algo+Visuals)

Algo Visuals is an interactive platform that executes and visualizes C++ algorithms directly in the browser. Unlike traditional visualizers that require special API calls to animate state or rely on backend servers to run code, **Algo Visuals runs your raw C++ code natively in the browser** using a custom-built Intermediate Representation (IR) Execution Engine. It automatically intercepts data structures, memory changes, and STL functions to generate step-by-step visual animation frames.

---

## 📖 Table of Contents

> 💡 **Looking for deeply technical documentation?** Check out:
> - [Interpreter Architecture Deep Dive](src/interpreter/README.md)
> - [Visualizer UI Architecture](src/codeVisualizer/README.md)
> - [High-Level Feature Specifications](FEATURES.md)

1. [Project Vision & Overview](#-project-vision--overview)
2. [Core Features](#-core-features)
3. [The Execution Engine (Deep Dive)](#-the-execution-engine-deep-dive)
4. [Visualizer Auto-Detection](#-visualizer-auto-detection)
5. [Detailed Folder Structure](#-detailed-folder-structure)
6. [Tech Stack](#-tech-stack)
7. [Installation & Setup](#-installation--setup)
8. [Writing Code for the Visualizer](#-writing-code-for-the-visualizer)
9. [Architecture Guidelines](#-architecture-guidelines)
10. [License](#-license)

---

## 🚀 Project Vision & Overview

Competitive programming requires an intuitive understanding of how data structures mutate over time. Staring at static code or printing variables to the console is often insufficient for complex algorithms like Graph Traversals (BFS/DFS), Dynamic Programming, or Advanced Tree structures.

Algo Visuals was built to bridge this gap. You paste standard C++ code into the editor, and the platform automatically extracts the abstract syntax tree, converts it into our custom Intermediate Representation (IR), and executes it line by line.

Every time a variable is assigned, a pointer is moved, or a standard library function (like `std::sort` or `std::swap`) is called, our engine captures a memory snapshot. The React frontend then uses these chronological snapshots to animate the data structures visually. 

---

## ✨ Core Features

### 1. In-Browser C++ Runtime Engine
We built a robust execution engine in TypeScript. It parses your source using `web-tree-sitter`, converts it into an AST/IR, and executes it step-by-step. The engine maintains a true runtime `CallStack`, `ScopeManager`, and global memory.

### 2. Auto-Magic Visualization (Heuristics)
You do not need to learn a custom visualizer API. The visualizer (`VisualGround`) automatically mounts the correct React component (Graphs, Trees, 2D Arrays, Linked Lists, etc.) based purely on **variable name prefixes** and **data shapes**. If you name your 2D array `adj_list`, the engine renders a Graph. If you name it `dp`, it renders a 2D Matrix.

### 3. Rich C++ STL Support
The runtime natively polyfills C++ standard library utilities so your competitive programming templates work out of the box. Supported STL features include:
- Containers: `<vector>`, `<map>`, `<unordered_map>`, `<set>`, `<unordered_set>`, `<queue>`, `<deque>`, `<stack>`, `<string>`.
- Algorithms (`<algorithm>`): `sort()`, `stable_sort()`, `reverse()`, `fill()`, `count()`, `binary_search()`, `lower_bound()`, `next_permutation()`, `unique()`.
- Math (`<cmath>`): `sqrt`, `pow`, `log`, `floor`, `abs`, `__gcd`.

### 4. Interactive Dual-Pane Workspace
A resizable split-pane layout featuring a Monaco Editor on the left and a fully interactive Visualizer player on the right. You can scrub back and forth through time using the timeline slider.

### 5. MDX Documentation Hub
An integrated documentation parser that renders Markdown. The platform includes a "Standard Algorithms" section with articles and dual-pane views combining the text and the live code visualizer.

---

## 🧠 The Execution Engine (Deep Dive)

The magic of Algo Visuals happens inside `/src/interpreter/`. It is essentially a multi-stage compiler and runtime built in TypeScript.

### Stage 1: Parsing
When code is submitted, we use `web-tree-sitter` (via `tree-sitter-cpp.wasm`) to parse the raw C++ code into a concrete syntax tree (CST).

### Stage 2: IR Generation
The `IRBuilder.ts` traverses the Tree-Sitter CST and transpiles it into our own Intermediate Representation (IR). This IR normalizes C++ constructs (like loops, conditionals, and classes) into a format our engine can easily evaluate.

### Stage 3: Execution & Memory Management
The `ExecutionEngine.ts` is the orchestrator:
1. **Global Memory:** Evaluates global variables and registers function signatures.
2. **Call Stack:** When a function is invoked, a new Frame is pushed onto the `CallStack`.
3. **Scope Management:** The `ScopeManager.ts` handles lexical scoping, variable shadowing, and references (`&`).
4. **Evaluation:** `ExpressionEvaluator.ts` and `StatementExecutor.ts` process the IR nodes recursively.

### Stage 4: Snapshot Generation
To visualize the execution, we use an Event-Driven architecture. Every time a memory mutation occurs (e.g., assignment, swap), an `EventEmitter` triggers. The `ExecutionEngine` captures a `RuntimeSnapshot` consisting of the current local scope, call stack, and global memory. The UI iterates over an array of these snapshots to animate the state.

---

## 📂 Detailed Folder Structure

The application follows a strictly modular architecture, separating the C++ runtime engine from the React UI components, routing, and shared utilities.

```text
AlgoVisuals/
├── public/                 # Static assets
│   └── wasm/               # Pre-compiled web-tree-sitter and C++ grammar wasm files
├── src/
│   ├── App.tsx             # Root React component and Theme Provider configuration
│   ├── main.tsx            # Vite Entry point
│   ├── index.css           # Tailwind base, typography, and custom theme tokens
│   │
│   ├── lib/                # Web Workers and System Utilities
│   │   ├── engine.worker.ts# Web worker for offloading heavy IR execution from main thread
│   │   ├── treeSitter.ts   # Tree-Sitter WASM initialization and parser cache
│   │   └── utils.js        # Generic helper functions
│   │
│   ├── Pages/              # Route-level components and Page Layouts
│   │   ├── algorithms/     # Main Hub for exploring algorithms (Docs + Code)
│   │   │   ├── Algorithms.tsx       # Dual-pane view controller routing between Docs vs Visualizer
│   │   │   ├── AlgoDirector.tsx     # Handles route mapping and topic navigation sidebar
│   │   │   └── data/                # Hardcoded logic, categories, and preloaded MDX content
│   │   │
│   │   ├── components/     # Global, reusable UI building blocks
│   │   │   ├── Navbar.tsx           # Persistent top navigation bar
│   │   │   ├── Sidebar.tsx          # Collapsible contextual side navigation
│   │   │   ├── HomeBackgroundAnimation.tsx # Landing page visual effects
│   │   │   └── NetworkBackground.tsx# Interactive background node network
│   │   │
│   │   ├── visualizer/     # The dedicated Competitive Programming visualizer workspace
│   │   │   ├── Visualizer.tsx       # The 3-pane layout for CP problem solving
│   │   │   └── VisualPlatforms.tsx  # Layout specific to LeetCode / Codeforces styles
│   │   │
│   │   ├── error.tsx       # 404 and global React Error boundary pages
│   │   └── Home.tsx        # Landing page layout and heroic entry
│   │
│   ├── codeVisualizer/     # The UI Rendering layer for the runtime state
│   │   ├── CodeWindow.tsx           # Split-pane manager containing the Editor and Visualizer
│   │   ├── dataStructures/          # The SVG/DOM Visual primitive components
│   │   │   ├── Graph.tsx            # Force-directed network graphs
│   │   │   ├── Tree.tsx             # Hierarchical AST / BST trees
│   │   │   ├── D1Array.tsx          # 1D arrays, vectors, and string sequences
│   │   │   ├── D2Array.tsx          # 2D Matrices and DP grid tables
│   │   │   ├── LinkedList.tsx       # Connected node sequences
│   │   │   ├── Queue.tsx            # Sliding FIFO horizontal tubes
│   │   │   ├── Stack.tsx            # Dropping LIFO vertical buckets
│   │   │   ├── MapVisualizer.tsx    # Key-value dictionary stores
│   │   │   └── VisualizerNamingConventions.tsx # Informational Modal detailing naming heuristics
│   │   │
│   │   └── sideComponents/          # Panels, controls, and sub-components
│   │       ├── CodeEditor.tsx       # Monaco Editor wrapper configuring C++ language features
│   │       ├── VisualGround.tsx     # The primary Visualizer Canvas and Snapshot Player controls
│   │       ├── detectVisualizer.ts  # The Heuristic Engine (Prefix + Shape regex matching)
│   │       ├── languages/           # Language mapping utilities (C++, Python, etc.)
│   │       └── parsers/
│   │           └── DocParser.tsx    # Custom MDX markdown renderer for integrated tutorials
│   │
│   └── interpreter/        # The Core C++ Runtime Engine (Custom AST/IR Interpreter)
│       ├── engine/
│       │   └── ExecutionEngine.ts   # Master orchestrator. Polyfills C++ STL (math, algo, vectors)
│       ├── evaluator/
│       │   └── ExpressionEvaluator.ts # Recursively computes math, conditionals, and object literals
│       ├── executor/
│       │   └── StatementExecutor.ts   # Handles imperative control flow (loops, if-statements, assigns)
│       ├── events/
│       │   └── EventEmitter.ts      # Pub/Sub architecture for capturing execution state milestones
│       ├── ir/
│       │   ├── IRBuilder.ts         # Transpiles concrete Tree-Sitter CST into the custom IR
│       │   └── IRNode.ts            # TypeScript interfaces for all Intermediate Representation nodes
│       ├── runtime/
│       │   ├── CallStack.ts         # Manages LIFO execution frames and stack traces
│       │   ├── ScopeManager.ts      # Handles lexical environments, variable shadowing, and references
│       │   └── SymbolTable.ts       # Stores deterministic variable types and current memory values
│       ├── utils/
│       │   └── helpers.ts           # Utilities for memory snapshots and ReturnSignals
│       ├── walker/
│       │   └── IRWalker.ts          # Walks and dispatches the IR tree nodes recursively
│       └── types.ts                 # Core runtime typings (RuntimeSnapshot, CppType, EventType)
├── index.html              # Vite HTML application entry point
├── package.json            # Node.js dependencies, metadata, and build scripts
├── vite.config.ts          # Vite bundler configuration
├── tsconfig.json           # TypeScript compiler configuration (along with app/node versions)
├── eslint.config.js        # ESLint flat config for code quality and linting rules
└── FEATURES.md             # High-level feature specification document
```

---

## 🎨 Visualizer Auto-Detection (Heuristics)

The visualizer (`VisualGround`) intelligently decides what to draw by inspecting your variable names (Prefix matching) and their runtime values (Shape validation). 

You MUST adhere to these naming conventions in your C++ code.

### 1. Graphs (`<Graph />`)
- **Prefixes:** `adj_`, `graph_`, `network_`
- **Shape:** Must be a 2D Array or adjacency list.
- **Example:** `vector<vector<int>> adj_list;`
- **Auxiliary Pointers:** Variables containing `edge`, `visit` (colors node green), or specific node trackers like `node`, `u`, `v`.

### 2. Trees & BSTs (`<Tree />`)
- **Prefixes:** `tree_`, `bst_`, `root_`, `trie_`, `heap_`, `forest_`
- **Shape:** Array of node objects (must have `id` and `value`).
- **Auxiliary Pointers:** `root`, `curr`, `parent`, `left`, `right`.

### 3. 2D Matrices (`<D2Array />`)
- **Prefixes:** `mat`, `grid`, `board`, `dp`, `table`, `matrix`
- **Shape:** 2D array (Array of arrays).
- **Auxiliary Pointers:** `r`, `row`, `c`, `col`.

### 4. 1D Arrays (`<D1Array />`)
- **Prefixes:** `arr`, `vec`, `nums`, `seq`, `str`, `res`, `buffer`, `list`
- **Shape:** Flat array of primitives.
- **Auxiliary Pointers:** `i`, `j`, `k`, `left`, `right`, `mid`, `curr`, `ptr`. (These render as floating badges pointing at the array index).

### 5. Linked Lists (`<LinkedList />`)
- **Prefixes:** `ll_`, `head`, `list_node`, `linked_list`
- **Shape:** Array of node objects.
- **Auxiliary Pointers:** `head`, `tail`, `slow`, `fast`, `prev`, `next`.

### 6. Stacks & Queues
- **Stack Prefixes:** `st_`, `stack`, `stk` (Renders a vertical LIFO bucket).
- **Queue Prefixes:** `q_`, `queue`, `deque` (Renders a horizontal FIFO tube).

### 7. Maps & Sets
- **Prefixes:** `map`, `dict`, `freq`, `count`, `seen`, `visited`, `memo`

*Note: Variables named `n`, `maxVal`, `minVal`, `result`, `ans`, and `temp` are reserved scalar values. They will be displayed in the Variables panel but will not trigger complex visual components.*

---

## 🛠 Tech Stack

- **Core Framework**: React 19 (Hooks, Context, Functional Components)
- **Language**: TypeScript (Strict mode enabled)
- **Styling**: Tailwind CSS v4.3 with a highly customized dark-theme system (`bg-bg`, `bg-surface`, `text-accent`, etc.)
- **Build Tooling**: Vite
- **Code Editor**: `@monaco-editor/react` for the Monaco syntax experience
- **AST Parsing**: `web-tree-sitter` and `tree-sitter-cpp`
- **Animations**: `framer-motion` for smooth layout transitions and array swaps
- **Icons**: `lucide-react`
- **Routing**: `react-router-dom` v7
- **Markdown parsing**: `@mdx-js/react`, `remark-gfm`

---

## 🚀 Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) (v18+ recommended) installed.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/algovisuals.git
   cd algovisuals
   ```

2. **Install all NPM dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will spin up Vite. Navigate to `http://localhost:5173` to see the app.

4. **Build for Production:**
   ```bash
   npm run build
   ```
   This compiles TypeScript and builds an optimized Vite bundle in the `/dist` directory.

5. **Preview the Build:**
   ```bash
   npm run preview
   ```

---

## 📐 Architecture Guidelines

If you plan to contribute to this repository, please adhere to these strict guidelines:

1. **Do not use ad-hoc Tailwind Colors**: Always use the design system tokens defined in `index.css`. Use `bg-bg` for roots, `bg-surface` for cards, `text-accent` for highlights, and `border-border` for dividers.
2. **Interpreter Separation**: Do not mix UI logic with Interpreter logic. The `ExecutionEngine` should only emit raw data (`RuntimeSnapshots`). The React layer (`VisualGround`) is entirely responsible for interpreting that data visually.
3. **AST Polyfills**: If you add new C++ standard library features, intercept them natively inside `ExecutionEngine.ts` (`invokeFunctionCall` or `invokeMethodCall`) and ensure they emit the proper `EventType`.
4. **Performance**: The interpreter generates hundreds of snapshots per second. Ensure React components are memoized properly and avoid deep cloning state inside render loops.

---

## 📄 License

This project is open-source. Build algorithms, understand the array, and happy coding.

---
*Built for developers to understand the array, not just trace it.*
