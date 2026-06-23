# AlgoVisuals — Feature Specification

> A dark-native algorithm visualization platform built for competitive programmers who think in C++.
>
> **Navigation:** [Root README](README.md) | [Interpreter Architecture](src/interpreter/README.md) | [Visualizer UI Architecture](src/codeVisualizer/README.md)

---

## Table of Contents

1. [Project Foundation](#1-project-foundation)
2. [The Parsing Engine](#2-the-parsing-engine)
3. [Visual Primitives & The Player](#3-visual-primitives--the-player)
4. [Standard Algorithm Visualizers](#4-standard-algorithm-visualizers)
5. [Competitive Programming Hub](#5-competitive-programming-hub)
6. [My Journey & Documentation Hub](#6-my-journey--documentation-hub)

---

## 1. Project Foundation

*Setting up the environment and embedding the design language.*

### Tooling & Build

- **React + Vite** scaffolded with TypeScript (`react-ts` template) for fast HMR and near-zero config bundling.
- **WebAssembly Pipeline** — `tree-sitter.wasm` and `tree-sitter-cpp.wasm` are served from `/public/wasm/` so Vite never attempts to bundle them, eliminating parser collisions entirely.

### Design System (Tailwind)

The entire UI lives inside a strict dark theme. Every surface has a designated token — nothing is an ad-hoc hex.

| Token | Value | Used For |
|---|---|---|
| `bg-main` | `#0d1117` | Root app background |
| `bg-panel` | `#161b22` | Editors, sidebars, visualizer containers |
| `bg-card` | `#21262d` | Array nodes, tree nodes, floating cards |
| `border-subtle` | `#30363d` | Dividers, panel outlines |
| `accent-blue` | — | Active pointers & cursor indicators |
| `accent-green` | — | Sorted / found / completed states |
| `accent-yellow` | — | Elements currently being compared |
| `accent-purple` | — | AST node type tags |
| `accent-red` | — | Swapped / misplaced elements |

### Global Layout

A persistent navigation bar (sticky top or side) provides instant switching between the three top-level sections:

- **Standard Algos** — Classic CS visualizers
- **CP Visualizer** — LeetCode / Codeforces workspace
- **My Journey** — Personal notes and progress dashboard

---

## 2. The Parsing Engine

*The background machinery that turns raw C++ source into animation frames.*

### Type Contracts (`types.ts`)

A single `RuntimeSnapshot` interface is the universal currency passed between the parser, the engine, and every visual component:

```ts
interface RuntimeSnapshot {
  id:            number;
  type:          'ARRAY' | 'TREE' | 'GRAPH';
  data:          any;
  pointers:      Record<string, number>;
  explanation:   string;
  lineHighlight: number;
}
```

### Parser Cache (`treeSitter.ts`)

A system that encapsulates the entire parser lifecycle:

- Loads **web-tree-sitter** asynchronously on mount.
- Fetches the C++ grammar from `/public/wasm/`.
- Maintains a stable parser instance across re-renders.
- **Garbage collection** — calls `tree.delete()` on every parse cycle to prevent memory leaks during heavy interactive use. This is non-negotiable for long sessions.

### Execution Engine (`ExecutionEngine.ts`)

Pure TypeScript runtime that evaluates the transpiled IR:

- Walk the syntax tree to detect **loops**, **swaps**, **comparisons**, and **assignments**.
- Emit one `RuntimeSnapshot` per meaningful state transition.
- Stateless by design — given the same AST, the output is always identical and fully replayable.

---

## 3. Visual Primitives & The Player

*The "dumb" rendering components that paint data to screen. They know nothing about algorithms — they only know how to draw.*

### `VisualGround.tsx`

The master wrapper that controls playback state for any visualizer:

- **Controls** — Play, Pause, Step Forward, Step Back.
- **Timeline Scrubber** — A full-width slider (YouTube-style) to jump to any frame in the execution sequence instantly.
- Accepts an array of `RuntimeSnapshot` objects as its only data dependency; completely agnostic to the algorithm producing them.

### `D1Array.tsx` / `D2Array.tsx`

Renders array state as a horizontal row of blocks:

- Base block style: `bg-[#21262d]` with `border-subtle` outline.
- **Pointer indicators** — if pointer `i` targets index `2`, block `2` receives a `border-blue-400` ring and a small floating `i` label below it. Multiple pointers render simultaneously without conflict.
- Smooth transition animations between states so swaps feel physical, not instant.

### `Tree.tsx` / `Graph.tsx`

SVG-based renderers inside `bg-panel` containers:

- Nodes change border color and emit a soft glow when **visited** or **on the current call stack**.
- Edges animate directionally (dashed stroke-dashoffset) during traversal.
- Supports both rooted trees (hierarchical layout) and arbitrary graphs (force-directed or grid layout).

### Split-Pane Workspace

A reusable two-panel layout used across multiple sections:

| Panel | Contents |
|---|---|
| **Left** | C++ code editor (`textarea` or Monaco) on `bg-panel` with live line highlighting |
| **Right** | Visualizer output + step-by-step execution explanation in plain English |

---

## 4. Standard Algorithm Visualizers

*Classic CS algorithms brought to life using the primitives above.*

### Sorting — `D1Array.tsx`

| Algorithm | Visual Behavior |
|---|---|
| **Bubble Sort** | Compared pair highlighted in yellow; swapped pair flashes green |
| **Merge Sort** | Sub-array boundaries shown with bracket overlays; merged segments fade green |
| **Quick Sort** | Pivot block highlighted in purple; partition sweep shown with left/right pointer labels |

### Searching — `D1Array.tsx`

- **Binary Search** — The discarded half of the array dims (reduced opacity + desaturated) on each step, leaving only the active search range at full brightness. The mid-pointer is always labeled.

### Graph Traversal — `Graph.tsx`

Three distinct visual states, each with its own color:

| State | Style |
|---|---|
| **Unvisited** | Default `bg-card` fill |
| **In Queue / Stack** | `accent-yellow` border glow |
| **Fully Visited** | `accent-green` fill |

Covers both **BFS** (queue-based, level-by-level spreading) and **DFS** (stack-based, depth-first branching).

---

## 5. Competitive Programming Hub

*A purpose-built workspace for understanding real contest problems.*

### Three-Panel Problem Workspace

An upgraded split-pane layout divided into thirds:

| Column | Contents |
|---|---|
| **Left** | Problem description rendered in Markdown |
| **Center** | C++ code editor with syntax highlighting |
| **Right** | `VisualGround` + active visualizer |

### Live Variable Tracker

A floating debug table anchored below the visualizer. As the player steps through frames, this table updates in real time to show the current value of every extracted key variable — `sum`, `max_val`, `left`, `right`, `dp[i]`, and so on. No more mentally tracing values by hand.

### LeetCode Problem Set

Pre-loaded visualizer configurations for canonical LeetCode patterns:

- Two Sum (hash map probe sequence)
- Sliding Window Maximum (deque state at each step)
- Merge Intervals (interval sweep with overlap detection)

### Codeforces Problem Set

Pre-loaded configurations focused on typical CF constraint patterns:

- Prefix sum array construction and range query resolution
- Greedy selection sequences with running decision log

---

## 6. My Journey & Documentation Hub

*A personal knowledge base, blog, and progress tracker — integrated directly into the app.*

### Documentation Layout (`Algorithms.tsx` & `DocParser.tsx`)

A clean, centered reading column modeled after Tailwind CSS / MDN documentation:

- **Sidebar** — Collapsible navigation tree covering topics like *JavaScript Notes*, *React Patterns*, *System Design*, and *CP Contest Logs*.
- Comfortable reading width with generous line-height, rendered on `bg-main`.

### Markdown Renderer

All notes are written as plain `.md` files and rendered using `react-markdown`:

- Full syntax-highlighted code blocks (Shiki or Prism) styled to the `#0d1117` theme.
- Supports tables, blockquotes, task lists, and footnotes out of the box.

### Embedded Mini-Visualizers ✦ *Signature Feature*

The `VisualGround` player can be dropped directly into the middle of any Markdown note as a React component. Write an article explaining Dijkstra's algorithm and place a fully interactive, playable visualization right inside the second paragraph. Reading and understanding happen in the same place, at the same time.

### Progress & Journey Dashboard

A landing page for the *My Journey* section featuring:

- **Contest Rating Graph** — Line chart of Codeforces / LeetCode rating over time.
- **Activity Heatmap** — GitHub contribution-style grid showing days coded.
- **Recently Solved** — A card grid of the last N problems with difficulty badges and tags.

---

*AlgoVisuals is designed to be the tool you wish existed when you first opened a competitive programming editorial and had no idea what the array was doing.*