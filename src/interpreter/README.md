# The AlgoVisuals C++ Interpreter Engine

> **Navigation:** [Root README](../../README.md) | [Visualizer UI Architecture](../codeVisualizer/README.md) | [Feature Specs](../../FEATURES.md)

Welcome to the core of AlgoVisuals. This document serves as a comprehensive architectural deep-dive into the custom C++ Intermediate Representation (IR) Execution Engine built entirely in TypeScript.

## 1. Core Philosophy

**Why build a custom C++ interpreter in TypeScript?**
Traditional C++ visualizers compile code to WebAssembly using Emscripten or trace execution on a backend server using GDB. While accurate, these approaches treat the execution environment as a black box. 

AlgoVisuals requires granular, frame-by-frame interception of state changes (e.g., watching a pointer move across an array, or a variable assignment inside a nested loop) to construct highly interactive visualizations. By building our own AST-to-IR interpreter in TypeScript, we gain 100% control over the execution context. We can pause execution, rewind scope, inspect the call stack, and emit custom memory snapshots whenever a semantic milestone is reached.

---

## 2. Architecture Data Flow

The interpreter processes user code through a strict 4-stage pipeline:

1. **Parsing (CST Generation):** The raw C++ string is passed to `web-tree-sitter` (via `tree-sitter-cpp.wasm`), which generates a Concrete Syntax Tree (CST).
2. **Transpilation (IR Generation):** `IRBuilder.ts` walks the CST and translates it into our custom Intermediate Representation (`IRNode.ts`). This strips away C++ syntactic sugar and leaves a normalized execution tree.
3. **Execution (Walking the IR):** The `ExecutionEngine.ts` spins up a global scope and pushes a `main` frame to the `CallStack`. The `IRWalker.ts` traverses the IR, passing expressions to `ExpressionEvaluator` and statements to `StatementExecutor`.
4. **Snapshot Emission:** Whenever a meaningful operation occurs (variable assignment, swap, function call), the `EventEmitter.ts` fires. The engine captures a `RuntimeSnapshot` (a deep clone of the current Call Stack and Variables) and pushes it to an array. The React UI later consumes this array to animate the algorithm.

---

## 3. Directory Breakdown

```text
interpreter/
├── engine/
│   └── ExecutionEngine.ts    // Master orchestrator, STL polyfills, global memory
├── evaluator/
│   └── ExpressionEvaluator.ts// Computes math, conditionals, object instantiations
├── executor/
│   └── StatementExecutor.ts  // Handles imperative control flow (loops, if, assign)
├── events/
│   └── EventEmitter.ts       // Pub/sub event hooks for snapshot capturing
├── ir/
│   ├── IRBuilder.ts          // Transpiles Tree-Sitter CST into IR
│   └── IRNode.ts             // Typings for Intermediate Representation nodes
├── runtime/
│   ├── CallStack.ts          // Manages LIFO execution frames
│   ├── ScopeManager.ts       // Handles lexical environments and variable shadowing
│   └── SymbolTable.ts        // Stores deterministic variable types and values
├── utils/
│   └── helpers.ts            // Snapshot cloning logic and ReturnSignals
├── walker/
│   └── IRWalker.ts           # Walks the IR tree nodes recursively
└── types.ts                  # Core runtime typings (RuntimeSnapshot, CppType)
```

---

## 4. The Intermediate Representation (IR) Layer (`IRBuilder.ts`)

The C++ AST produced by Tree-Sitter is highly verbose. The `IRBuilder` strips out punctuation nodes, resolves typedefs, and flattens declarations into an easy-to-evaluate JSON-like structure. 

### Pointer & Reference Unwrapping
One of the most complex tasks of the `IRBuilder` is stripping away C++ memory decorators. When it encounters `int* ptr` or `vector<int>& ref`, it recursively pierces through `pointer_declarator` and `reference_declarator` nodes until it finds the root `identifier`. This allows the interpreter to track the variable name cleanly without storing the asterisks or ampersands.

### Block Wrapping
To guarantee safe scope management, the `IRBuilder` forces inline C++ statements (e.g., `if (true) x = 1;`) to be wrapped in strict `IRBlock` `{}` structures. This ensures that the runtime `ScopeManager` always has a predictable block entry and exit point to prevent memory leaks.

---

## 5. Runtime Memory Model

To simulate C++ memory semantics in Javascript, we rely on three key constructs:

### A. The Symbol Table (`SymbolTable.ts`)
A map of variable names to their exact `CppType` (e.g., `int`, `vector<int>`, `string`) and `CppValue` (the underlying JS data representation).

### B. The Scope Manager (`ScopeManager.ts`)
Handles lexical scoping by maintaining a stack of `SymbolTable` instances. 
- **Block Entry/Exit:** When a `{` is encountered, a new empty `SymbolTable` is pushed. When `}` is encountered, it is popped, destroying all local variables created within it.
- **Variable Shadowing:** When a variable is requested, the manager iterates from the innermost scope (top of stack) downwards to the global scope. The first match is returned. This perfectly mimics C++ variable shadowing, where an inner variable `int x` hides an outer variable `int x`.

### C. The Call Stack (`CallStack.ts`)
Handles execution frames. When `invokeFunction()` is called, a new execution frame is pushed onto the stack. Each frame contains its own base `ScopeManager`. When a function returns (via `ReturnSignal`), the frame is popped.

---

## 6. Execution Core

### `IRWalker.ts` (The Dispatcher)
Given a block of IR nodes, the Walker iterates over them. If it encounters a statement, it passes it to the `StatementExecutor`.

### `StatementExecutor.ts` (The State Mutator)
Responsible for altering the state of the program.
- **Variable Allocation Strategies:** Variables are instantiated based on a 3-tier priority:
  1. *Explicit Initializer:* `int x = 5;` evaluates the right side.
  2. *Constructor Args:* `vector<int> v(n, 0);` detects the arguments and generates an array of size `n` filled with `0`.
  3. *Default Initialization:* If no arguments are provided, it infers the default value from the type (e.g., `0` for `int`, `[]` for `vector`).
- **Structured Bindings:** Fully supports modern C++ destructuring like `auto [d, u] = pq.top()`, breaking tuples into independent scope variables.
- **Compound Assignments:** Safely reads the existing memory value, applies operators like `+=`, `/=`, `<<=`, and overwrites the memory address.

### `ExpressionEvaluator.ts` (The Calculator)
Strictly responsible for returning values. 
- Processes arithmetic (`+`, `-`, `*`), bitwise operations (`<<`, `^`), and logical operators (`&&`, `||`).
- Evaluates object literals and `NewExpression` constructs.

---

## 7. The C++ Standard Library (STL) Polyfill System

Because we are running C++ code inside a JavaScript sandbox, standard headers like `<vector>` and `<map>` do not actually exist. The engine polyfills them natively.

### The Mock Container Factory
In `StatementExecutor.ts`, any C++ container (`vector`, `stack`, `queue`, `deque`) is initialized as a **Mock Container** — a Javascript object holding an internal `data: []` array. 
The object is injected with Javascript methods that proxy C++ behavior:
- `push_back(val)` → `this.data.push(val)`
- `pop()` → `this.data.pop()`
- `front()` → `this.data[0]`
- `size()` → `this.data.length`

When `target.method(args)` is called in C++, the `ExecutionEngine` simply invokes these proxy methods natively in Javascript.

### Function Interception
When global functions are called:
- **Math:** Intercepts `sqrt`, `pow`, `abs` and passes them to JS `Math.sqrt`.
- **Algorithms:** `std::sort`, `std::reverse`, `std::next_permutation` are fully polyfilled. 
- **Comparators:** If `std::greater<int>()` is passed to a sort, the engine injects a JS comparator function `(a, b) => a > b ? -1 : 1`.

---

## 8. Event Emitter & Snapshot Generation

The execution happens instantly, usually in under 5 milliseconds. To visualize it, we must capture state across time.

Whenever `StatementExecutor` performs a meaningful action, it fires an event:
```typescript
this.eventEmitter.emit(lineNumber, EventType.VARIABLE_ASSIGN, payload);
```

The `ExecutionEngine` subscribes to this emitter. Upon receiving an event:
1. It looks at the current `CallStack`.
2. It deep-clones the entire variable state in the current scope using `createSnapshot()`.
3. It pushes this immutable `RuntimeSnapshot` into the `snapshots` array.

When the interpreter finishes running, it returns the array of `RuntimeSnapshot` objects to the React UI.

---

## 9. Error Handling & Duck-Typed Auto-Recovery

Competitive programming code is notoriously brittle, and Tree-Sitter sometimes generates incomplete ASTs for complex macros or templates. To prevent the visualizer from crashing on uninitialized structures, the engine implements **Universal Object Auto-Recovery**.

If a method like `q.push(5)` is called on a variable `q` that the IR Builder failed to extract a declaration for:
1. The `StatementExecutor` catches the `undefined reference` error.
2. It automatically infers the object type based on the operation.
3. It declares `q = []` (or `new Map()`) dynamically in the active scope as an `auto` type.
4. Execution continues seamlessly.

This duck-typing fail-safe guarantees that even heavily macro-obfuscated CP templates will visualize correctly as long as standard STL method names are invoked.
