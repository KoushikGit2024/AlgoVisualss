# Language Specification & Internal Mechanics

## A Complete Technical Reference for the TypeScript C++ Browser Interpreter

---

> **What this document is:** An exhaustive, low-level manual describing every feature, polyfill, heuristic, and quirk of the interpreter. Every section explains both the **C++ behavior** being emulated and the **TypeScript/JavaScript mechanics** used to emulate it. This is the ground truth for contributors, debuggers, and curious readers.

---

## Table of Contents

1. [The Execution Lifecycle](#1-the-execution-lifecycle)
2. [Control Flow & Structural Statements](#2-control-flow--structural-statements)
3. [Data Types & Memory Semantics](#3-data-types--memory-semantics)
4. [Expressions & Assignment](#4-expressions--assignment)
5. [The STL Polyfill Matrix](#5-the-stl-polyfill-matrix)
6. [Standard Algorithms & Utilities](#6-standard-algorithms--utilities)
7. [Constants & Macros](#7-constants--macros)
8. [Advanced Duck-Typing & Auto-Recovery](#8-advanced-duck-typing--auto-recovery)
9. [AST Node Mapping](#9-ast-node-mapping)
10. [Appendix: EventType Reference](#10-appendix-eventtype-reference)

---

## 1. The Execution Lifecycle

The interpreter translates raw C++ source text into runtime behavior through a **five-stage pipeline**. Understanding each stage is essential for debugging and extending the engine.

```
C++ Source Text
      │
      ▼
┌─────────────────────────────────┐
│  Stage 1: Tree-sitter Parsing   │  → Raw Syntax Tree (SyntaxNode)
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  Stage 2: IR Compilation        │  → IRProgram (IRBuilder)
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  Stage 3: Program Loading       │  → Function + Struct Registry (ExecutionEngine)
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  Stage 4: Execution             │  → CallStack + ScopeManager mutation
│  (IRWalker → StatementExecutor  │
│   → ExpressionEvaluator)        │
└─────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────┐
│  Stage 5: Snapshot Emission     │  → RuntimeSnapshot[] (for React UI)
└─────────────────────────────────┘
```

---

### 1.1 Stage 1 — Tree-sitter Parsing

**What it means:** The C++ source code is parsed by `web-tree-sitter` (a WebAssembly port of the Tree-sitter incremental parser) using the `tree-sitter-cpp` grammar. The result is a concrete syntax tree (CST) of raw `SyntaxNode` objects. Tree-sitter handles comments, preprocessor directives, and whitespace as named child nodes within the tree.

**How it works:** The interpreter consumes `SyntaxNode` objects through the following interface, which is intentionally thin to decouple the engine from the tree-sitter API version:

```typescript
export interface SyntaxNode {
  type: string;                               // e.g., "function_definition", "for_statement"
  text: string;                               // Raw source text for this node
  startPosition: { row: number; column: number };
  child(index: number): SyntaxNode | null;    // Positional child access
  childCount: number;
  children: SyntaxNode[];                     // All children including unnamed (punctuation)
  namedChildren: SyntaxNode[];                // Only semantic children (no parens, braces)
  isNamed: boolean;
}
```

> **Critical distinction:** `children` includes every token (`(`, `)`, `{`, `;`) as anonymous nodes. `namedChildren` filters these out and returns only semantically meaningful nodes. The `IRBuilder` almost exclusively uses `namedChildren` for robustness, falling back to `child(index)` only when positional children are definitively known (e.g., `binary_expression` has `left = child(0)`, `operator = child(1)`, `right = child(2)`).

---

### 1.2 Stage 2 — IR Compilation (`IRBuilder`)

**What it means:** The raw Tree-sitter CST is translated into a strictly typed **Intermediate Representation (IR)** — a clean, normalized AST defined entirely in `IRNode.ts`. The IR eliminates C++ syntax noise (pointer wrappers, template parameters, `using namespace`, `#include`) and normalizes every construct into a predictable schema.

**How it works:** `IRBuilder.build(rootNode)` walks the top-level `translation_unit` node and dispatches each child by its `.type` string:

| Tree-sitter Node Type | `IRBuilder` Method | Produces |
|---|---|---|
| `function_definition` | `buildFunctionDeclaration()` | `IRFunctionDeclaration` |
| `struct_specifier` / `class_specifier` | `buildStructDeclaration()` | `IRStructDeclaration` |
| `declaration` (top-level) | `buildVariableDeclaration()` | `IRVariableDeclaration[]` |
| `preproc_include` | *(skipped as `EmptyStatement`)* | — |
| `using_declaration` | *(skipped as `EmptyStatement`)* | — |

The root output is an `IRProgram`:

```typescript
interface IRProgram {
  kind: "Program";
  line: 1;
  functions: IRFunctionDeclaration[];   // All functions registered globally
  structs:   IRStructDeclaration[];     // All struct/class blueprints
  globals?:  IRVariableDeclaration[];   // Top-level variable declarations
}
```

**Pointer/Reference Unwrapping:** A key responsibility of `IRBuilder` is stripping C++ declarator wrappers before extracting a name. The method `getDeclaratorName(node)` recursively pierces through:

```
pointer_declarator  → child(1)
reference_declarator → child(1)
array_declarator    → child(0)
function_declarator → child(0)   ← handles "vector<int> v(n)" misparse
identifier          → .text
```

This ensures `int* ptr`, `int& ref`, `int arr[]`, and `vector<int> v(n)` all yield clean identifier names (`ptr`, `ref`, `arr`, `v`) without brackets or asterisks.

---

### 1.3 Stage 3 — Program Loading (`ExecutionEngine.loadProgram`)

**What it means:** Before any line of C++ runs, the engine registers all top-level declarations into global lookup tables so any function can call any other function regardless of declaration order.

**How it works:** `loadProgram(program: IRProgram)` populates two `Map` instances:

```typescript
private functions:      Map<string, IRFunctionDeclaration>;  // "main" → IRFunctionDeclaration
private classBlueprints: Map<string, IRStructDeclaration>;   // "TreeNode" → IRStructDeclaration
```

It also stores `program.globals` as `globalDeclarations: IRVariableDeclaration[]` for evaluation just before `main()` begins.

**Global Variable Initialization:** Global variables (e.g., `int dirs[4][2] = {{-1,0},{1,0},{0,-1},{0,1}};`) are evaluated in a special temporary frame:

```typescript
const tempFrame = this.callStack.push("__global_init__");
const tempEvaluator = new ExpressionEvaluator(tempFrame.scopeManager, this.eventEmitter);
const tempExecutor  = new StatementExecutor(tempFrame.scopeManager, tempEvaluator, ...);

for (const globalDecl of this.globalDeclarations) {
  tempExecutor.executeVariableDeclaration(globalDecl);
  const symbol = tempFrame.scopeManager.getVariable(globalDecl.name);
  this.globalVariables.set(globalDecl.name, { type: symbol.type, value: symbol.value });
}
this.callStack.pop(); // Discard temporary frame
```

After this phase, `this.globalVariables` is a `Map<string, {type, value}>`. When any new function frame is pushed, these global variables are injected into the base scope first — before parameters — via:

```typescript
for (const [gName, gData] of this.globalVariables) {
  frame.scopeManager.defineVariable(gName, gData.type, gData.value);
}
```

---

### 1.4 Stage 4 — Execution

Execution is divided across three collaborating classes:

#### `IRWalker` — The Control Flow Router

`IRWalker` is the highest-level execution coordinator. It receives an `IRBlock` (a list of statements) and dispatches each one by its `.kind` string. It manages loop iteration, scope entry/exit, and catches control-flow jump signals.

```typescript
walkStatement(stmt: IRNode): void {
  switch (stmt.kind) {
    case "VariableDeclaration":  executor.executeVariableDeclaration(stmt); break;
    case "Assignment":           executor.executeAssignment(stmt);          break;
    case "ForStatement":         this.walkForStatement(stmt);               break;
    case "BreakStatement":       throw new BreakSignal();
    case "ContinueStatement":    throw new ContinueSignal();
    // ...
  }
}
```

#### `StatementExecutor` — The Mutation Engine

Handles statements that change state: variable declarations, assignments, `cout`, and `return`. It is the only component that calls `scopeManager.defineVariable()` and `scopeManager.assignVariable()`.

#### `ExpressionEvaluator` — The Value Resolver

Handles expressions that **produce values** without direct mutation (though assignments are also expressions in C++). It recursively evaluates `IRExpression` nodes into `CppValue` primitives.

The `ExecutionEngine` **intercepts** `evaluate()` by wrapping it after each frame is created:

```typescript
private attachEvaluationInterceptor(evaluator: ExpressionEvaluator) {
  const originalEvaluate = evaluator.evaluate.bind(evaluator);
  evaluator.evaluate = (expr) => {
    if (expr.kind === "FunctionCall") return this.invokeFunctionCall(expr, evaluator);
    if (expr.kind === "MethodCall")   return this.invokeMethodCall(expr,   evaluator);
    // ... NewExpression, LambdaExpression, Identifier sentinels ...
    return originalEvaluate(expr);
  };
}
```

This intercept pattern is critical: the `ExpressionEvaluator` alone cannot handle function calls (which require pushing new `CallStack` frames), so the engine monkey-patches the evaluator's `evaluate` method to redirect those cases.

---

### 1.5 Stage 5 — Snapshot Emission (`EventEmitter` + `createSnapshot`)

**What it means:** Every time a significant runtime event occurs (a variable is assigned, a loop iterates, a function returns), the engine captures a complete freeze-frame of memory called a `RuntimeSnapshot`. The React frontend replays these snapshots to animate execution.

**How it works:** The `EventEmitter` implements the Observer pattern:

```typescript
class EventEmitter {
  private listeners: EventCallback[] = [];
  private stepCounter: number = 0;

  emit(line: number, type: EventType, payload: Record<string, unknown>): void {
    const event: ExecutionEvent = {
      id:   crypto.randomUUID(),    // Unique React reconciliation key
      step: ++this.stepCounter,     // Chronological order (never resets mid-run)
      line,
      type,
      payload,
    };
    for (const listener of this.listeners) listener(event);
  }
}
```

The `ExecutionEngine` constructor registers a single subscriber that fires on every event:

```typescript
this.eventEmitter.subscribe((event) => {
  const activeFrame = this.callStack.peek();
  this.snapshots.push(
    createSnapshot(event, this.callStack, activeFrame.scopeManager)
  );
});
```

`createSnapshot` iterates **every frame** in the call stack (bottom to top) and flattens their scopes into a single `variables` map. Inner scopes overwrite outer scopes, accurately reflecting C++ variable shadowing. All values are deep-cloned through `deepCloneCppValue()` before being stored — this handles `Map`, `Set`, arrays, and mock container objects correctly (plain `JSON.stringify` would silently drop `Map` and `Set` entries).

**`deepCloneCppValue` type dispatch:**

| Input type | Clone strategy |
|---|---|
| `number`, `boolean`, `string`, `null` | Identity copy |
| `function` | Replaced with `"[Function]"` string |
| `{ __ref, __callerScope }` | Resolved to `{ __ref, __resolved: value }` |
| `instanceof Map` | Serialized to `{ __type: "map", entries: [[k,v],...] }` |
| `instanceof Set` | Serialized to plain `Array.from(set)` |
| `Array` | `value.map(deepCloneCppValue)` |
| `{ data: Array }` (mock container) | `{ __type: "container", data: [...] }` |
| Plain object (struct, node) | Shallow key enumeration, skipping `function` values |

---

## 2. Control Flow & Structural Statements

### 2.1 `if` / `else if` / `else`

**C++ behavior:** Evaluates a condition expression; if truthy, executes the `consequent` block; otherwise executes the optional `alternate` block. `else if` chains are represented as nested `if` statements inside an `alternate`.

**Internal mechanics (`IRWalker.walkIfStatement`):**

```typescript
private walkIfStatement(stmt: IRIfStatement): void {
  const conditionValue = this.evaluator.evaluate(stmt.condition);
  this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });

  if (conditionValue) {
    this.walkBlock(stmt.consequent);     // Enters a new scope
  } else if (stmt.alternate) {
    this.walkBlock(stmt.alternate);      // else / else-if block
  }
}
```

A `CONDITION` event is always emitted so the UI can highlight the condition line regardless of branch taken. Both branches call `walkBlock()`, which always creates a new lexical scope (`scopeManager.enterScope()`) and tears it down in a `finally` block — even if a `ReturnSignal` is thrown mid-block.

**`IRBuilder` parsing:**

```
if_statement
  ├── condition_clause   (or parenthesized_expression)
  │     └── [condition expression]
  ├── [consequent block]
  └── else_clause
        └── [alternate block or nested if_statement]
```

The builder finds the `condition_clause` (or `parenthesized_expression`), extracts `namedChildren[0]` as the actual expression, then wraps both branches in `IRBlock` via `wrapInBlock()`. `wrapInBlock` handles inline single-statement branches (`if (x) y = 1;`) by wrapping them in a synthetic `IRBlock`.

---

### 2.2 `while` Loop

**C++ behavior:** Tests a condition; executes the body repeatedly as long as the condition is truthy.

**Internal mechanics:**

```typescript
private walkWhileStatement(stmt: IRWhileStatement): void {
  this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "while" });
  let safetyCounter = 0;
  while (true) {
    if (++safetyCounter > MAX_LOOP_ITERATIONS)
      throw new Error(`Infinite loop detected...`);
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
    if (!conditionValue) break;
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });
    try {
      this.walkBlock(stmt.body);
    } catch (e) {
      if (e instanceof BreakSignal)    break;
      if (e instanceof ContinueSignal) continue;
      throw e;
    }
  }
  this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "while" });
}
```

The `MAX_LOOP_ITERATIONS` constant is **100,000**. This prevents browser tab hangs from true infinite loops. A `BreakSignal` (thrown by `walkStatement("BreakStatement")`) exits the loop; a `ContinueSignal` skips to the next iteration; any other exception (including `ReturnSignal`) bubbles up.

---

### 2.3 `do-while` Loop

**C++ behavior:** Executes the body **at least once**, then checks the condition before each subsequent iteration.

**Internal mechanics:** The body runs before the condition is evaluated:

```typescript
private walkDoWhileStatement(stmt: IRDoWhileStatement): void {
  let safetyCounter = 0;
  do {
    if (++safetyCounter > MAX_LOOP_ITERATIONS) throw new Error(...);
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });
    try {
      this.walkBlock(stmt.body);
    } catch (e) {
      if (e instanceof BreakSignal)    { /* exit */ return; }
      if (e instanceof ContinueSignal) { /* fall through to condition check */ }
      else throw e;
    }
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
    if (!conditionValue) break;
  } while (true);
}
```

> **Historical note:** `do-while` was previously missing from `IRWalker` entirely. Encountering a `DoWhileStatement` would silently no-op because the `default` branch in `walkStatement` does nothing. This was fixed by adding `case "DoWhileStatement": this.walkDoWhileStatement(stmt)`.

---

### 2.4 `for` Loop

**C++ behavior:** Executes an initializer once; tests a condition before each iteration; executes an update expression after each body execution.

**Internal mechanics:** The initializer scope is isolated from the outer scope by wrapping the entire loop in an `enterScope()` / `exitScope()` pair:

```typescript
public walkForStatement(node: IRForStatement): void {
  this.scopeManager.enterScope();   // Isolates `int i = 0`
  this.eventEmitter.emit(node.line, EventType.LOOP_ENTER, { loopType: "for" });
  try {
    // 1. Execute initializer (may be IRVariableDeclaration[], IRAssignment, or expression)
    if (node.init) { ... this.walkStatement(node.init); }

    while (true) {
      if (++safetyCounter > MAX_LOOP_ITERATIONS) throw new Error(...);

      // 2. Check condition
      if (node.condition) {
        const conditionResult = this.evaluator.evaluate(node.condition);
        this.eventEmitter.emit(node.line, EventType.CONDITION, { result: conditionResult });
        if (!conditionResult) break;
      }
      this.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });

      // 3. Execute body (new scope per iteration via walkBlock)
      try {
        this.walkBlock(node.body);
      } catch (e) {
        if (e instanceof BreakSignal)    break;
        if (e instanceof ContinueSignal) { /* fall through to update */ }
        else throw e;
      }

      // 4. Execute update
      if (node.update) {
        if (node.update.kind === "Assignment") this.walkStatement(node.update);
        else this.evaluator.evaluate(node.update);
      }
    }
  } finally {
    this.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for" });
    this.scopeManager.exitScope();
  }
}
```

The `init` field can be one of three types depending on how `IRBuilder` parsed it:

| C++ Syntax | Tree-sitter Type | IR Type |
|---|---|---|
| `int i = 0` | `declaration` | `IRVariableDeclaration[]` |
| `i = 0` (existing variable) | `assignment_expression` | `IRAssignment` |
| `i++` | `update_expression` | `IRExpression` (via `buildExpressionStatement`) |

---

### 2.5 Range-Based `for` Loop

**C++ behavior:** `for (auto x : container)` iterates over every element of a collection without an explicit counter.

**C++ example:**
```cpp
vector<int> v = {1, 2, 3};
for (auto x : v) { cout << x << endl; }

// Structured binding (C++17):
for (auto [key, val] : my_map) { cout << key << " " << val; }
```

**Internal mechanics:** The `IRWalker.walkForRangeStatement` method:

1. **Evaluates the collection** expression to get the raw JS value.
2. **Normalizes it** to a plain JavaScript array through duck-typed dispatch:

```typescript
let targetArray = Array.isArray(container)
  ? container
  : (container?.data !== undefined ? container.data : null);  // mock container

if (!targetArray && container instanceof Map)
  targetArray = Array.from(container.entries());   // map → [key, val] pairs

if (!targetArray && container instanceof Set)
  targetArray = Array.from(container);
```

3. **Injects a hidden scope** per iteration with `enterScope()`, defines the iterator variable, executes the body, then calls `exitScope()`:

```typescript
for (let i = 0; i < targetArray.length; i++) {
  this.scopeManager.enterScope();
  this.scopeManager.defineVariable(varName, varType, targetArray[i]);
  try {
    this.walkBlock(node.body);     // body may also add its own scope
  } catch (e) {
    this.scopeManager.exitScope();
    if (e instanceof BreakSignal)    break;
    if (e instanceof ContinueSignal) continue;
    throw e;
  }
  this.scopeManager.exitScope();
}
```

**Structured bindings** (`auto [a, b]`) are handled by checking if `varName` starts with `[` and ends with `]`, then splitting on commas and defining each part as a separate variable in the scope:

```typescript
if (varName.startsWith("[") && varName.endsWith("]")) {
  const parts = varName.slice(1, -1).split(",").map(s => s.trim());
  if (Array.isArray(val)) {
    parts.forEach((p, idx) => scopeManager.defineVariable(p, varType, val[idx]));
  } else if (typeof val === 'object') {
    const keys = Object.keys(val);
    parts.forEach((p, idx) => scopeManager.defineVariable(p, varType, val[keys[idx]]));
  }
}
```

---

### 2.6 `switch` / `case` / `default` with Fallthrough

**C++ behavior:** Evaluates a condition, jumps to the matching `case` label, and executes all statements from that point until a `break` or end of switch (fallthrough).

**Internal mechanics:**

```typescript
private walkSwitchStatement(stmt: IRSwitchStatement): void {
  const conditionValue = this.evaluator.evaluate(stmt.condition);
  let fallthrough = false;

  try {
    for (const caseClause of stmt.cases) {
      // Activate matching case or default
      if (!fallthrough && !caseClause.isDefault) {
        const caseValue = this.evaluator.evaluate(caseClause.value!);
        if (caseValue === conditionValue) fallthrough = true;
      }
      if (caseClause.isDefault) fallthrough = true;

      if (fallthrough) {
        for (const caseStmt of caseClause.statements) {
          this.walkStatement(caseStmt);  // Can throw BreakSignal
        }
      }
    }
  } catch (e) {
    if (e instanceof BreakSignal) { /* exit switch */ }
    else throw e;
  }
}
```

Fallthrough is correctly modeled: once `fallthrough = true`, every subsequent case executes without re-checking its value. A `BreakSignal` thrown from any statement inside any case terminates the switch. A `ContinueSignal` or `ReturnSignal` is re-thrown to be caught by the enclosing loop or function.

**Note:** The switch does not push a new scope (matching C++ standard behavior where variables declared in switch cases share the outer scope unless wrapped in `{}`).

---

### 2.7 `break` and `continue`

**C++ behavior:** `break` exits the nearest enclosing loop or switch. `continue` skips the remainder of the current iteration and jumps to the update/condition phase.

**How it works:** These statements are modeled as **custom error subclasses** that are thrown and propagate up the JavaScript call stack until caught by the correct enclosing construct:

```typescript
export class BreakSignal extends Error {
  constructor() { super("BreakSignal"); Object.setPrototypeOf(this, BreakSignal.prototype); }
}
export class ContinueSignal extends Error {
  constructor() { super("ContinueSignal"); Object.setPrototypeOf(this, ContinueSignal.prototype); }
}
```

`Object.setPrototypeOf` is mandatory. Without it, TypeScript classes that extend `Error` may fail `instanceof` checks in bundled/transpiled environments where the prototype chain is broken by the compilation target.

---

### 2.8 `return`

**C++ behavior:** Exits the current function, optionally yielding a value to the caller.

**How it works:** A `ReturnSignal` is thrown from `StatementExecutor.executeReturn()`:

```typescript
public executeReturn(stmt: IRReturnStatement): never {
  const value = stmt.argument ? this.evaluator.evaluate(stmt.argument) : undefined;
  throw new ReturnSignal(value);
}
```

In `ExecutionEngine.invokeFunction()`, the `IRWalker.walkBlock` call is wrapped in a `try/catch` that catches `ReturnSignal` and extracts the value:

```typescript
try {
  walker.walkBlock(func.body);
} catch (e) {
  if (e instanceof ReturnSignal) returnValue = e.value;
  else throw e;
} finally {
  this.eventEmitter.emit(func.line, EventType.FUNCTION_RETURN, { function: name, returnValue });
  this.callStack.pop();
}
```

The `finally` block guarantees that the call stack frame is always popped and a `FUNCTION_RETURN` event is always emitted, even if the function throws an exception.

---

## 3. Data Types & Memory Semantics

### 3.1 Primitive Type Storage

All C++ primitive types are stored as native JavaScript primitives. No boxing or wrapper objects are used.

| C++ Type | JS Storage | Notes |
|---|---|---|
| `int`, `long`, `short`, `unsigned int` | `number` | No 32-bit overflow enforcement |
| `long long` | `number` | JS `number` is a 64-bit float; large integers may lose precision above `Number.MAX_SAFE_INTEGER` |
| `double`, `float` | `number` | Full IEEE 754 precision |
| `char` | `string` (length 1) or `number` | Depends on context; char arithmetic uses `charCodeAt(0)` |
| `bool` | `boolean` | `true` / `false` |
| `std::string` | `string` | Immutable JS string; mutation returns new strings |
| `void` | `undefined` | Functions returning `void` produce `undefined` |
| `nullptr` / `NULL` | `null` | |

**Default initialization by type** (when no initializer is provided) is handled in `StatementExecutor.executeVariableDeclaration()`:

```typescript
if (typeLower.includes("int") || typeLower.includes("long") || ...) value = 0;
else if (typeLower.includes("bool"))   value = false;
else if (typeLower.includes("string")) value = "";
else if (typeLower === "auto")         value = 0;
```

**Integer division truncation:** C++ truncates toward zero for `int/int` division. The evaluator enforces this:

```typescript
case "/":
  if (right === 0) throw new Error("Math Exception: Division by zero.");
  return Math.trunc((left as number) / (right as number));
```

---

### 3.2 Struct / Class Instantiation

**C++ behavior:** A `struct` or `class` with named fields is instantiated into an object where each field maps to a named property.

**C++ example:**
```cpp
struct TreeNode {
  int val;
  TreeNode* left;
  TreeNode* right;
  TreeNode(int v) : val(v), left(nullptr), right(nullptr) {}
};
TreeNode* root = new TreeNode(5);
```

**How it works:**

1. **Registration:** During `loadProgram`, `buildStructDeclaration` extracts field names, types, and optional default values into `IRStructDeclaration.fields`.

2. **Instantiation via `new`:** When the interceptor in `attachEvaluationInterceptor` detects `expr.kind === "NewExpression"` and finds the type name in `classBlueprints`:

```typescript
const blueprint = this.classBlueprints.get(newExpr.typeName)!;
const instance: Record<string, any> = {};
for (const field of blueprint.fields) {
  instance[field.name] = field.defaultValue
    ? evaluator.evaluate(field.defaultValue)
    : 0;
}
// Override with explicit constructor arguments
for (let i = 0; i < evaluatedArgs.length && i < blueprint.fields.length; i++) {
  instance[blueprint.fields[i].name] = evaluatedArgs[i];
}
return instance;
```

So `new TreeNode(5)` produces: `{ val: 5, left: null, right: null }` as a plain JS object.

3. **Fallback for unknown types:** If a `new SomeType(a, b, c)` is encountered and `SomeType` is not in `classBlueprints`, the engine auto-generates a generic node:

```typescript
const newObj: Record<string, any> = {};
newObj.val   = evaluatedArgs[0];
newObj.value = evaluatedArgs[0];
newObj.data  = evaluatedArgs[0];
newObj.next  = null;
newObj.left  = evaluatedArgs[1] ?? null;
newObj.right = evaluatedArgs[2] ?? null;
return newObj;
```

This heuristic successfully handles linked list nodes (`new Node(val, next)`) and binary tree nodes (`new Node(val, left, right)`) without requiring an explicit struct definition.

---

### 3.3 Pass-by-Reference — The `__ref` Proxy Pattern

**C++ behavior:** When a function parameter is declared with `&`, mutations to that parameter inside the function mutate the caller's variable directly:

```cpp
void increment(int& x) { x++; }
int n = 5;
increment(n);
// n is now 6
```

**The problem:** JavaScript has no native pass-by-reference for primitives. Passing `5` to a function gives the function a copy.

**How it works — the `__ref` proxy object:**

When `invokeFunction` processes a parameter marked `isReference: true` and the caller passed an `Identifier` expression, instead of evaluating the identifier to its value, it creates a proxy object:

```typescript
if (param.isReference && rawArgs && index < rawArgs.length
    && rawArgs[index].kind === "Identifier") {
  argValue = {
    __ref:         (rawArgs[index] as any).name,   // "n" (the caller's variable name)
    __callerScope: callerScope                      // The caller's ScopeManager
  };
}
```

This proxy is stored in the function's local scope under the parameter name (e.g., `x`). When the function reads or writes `x`:

**On read** (`ExpressionEvaluator`, `case "Identifier"`):
```typescript
let val = symbol.value;
while (val && typeof val === "object" && "__ref" in val) {
  const callerScope = val.__callerScope as ScopeManager;
  val = callerScope.getVariable(val.__ref).value;  // Dereference into caller's scope
}
```

**On write** (`evaluateUpdate`, `case "Identifier"`):
```typescript
let symbol = this.scopeManager.getVariable(identifierName);
while (symbol.value && typeof symbol.value === "object" && "__ref" in symbol.value) {
  identifierName = symbol.value.__ref;
  targetScopeManager = symbol.value.__callerScope as ScopeManager;
  symbol = targetScopeManager.getVariable(identifierName);
}
// Write-back happens to targetScopeManager (the caller's scope), not the local scope
targetScopeManager.assignVariable(identifierName, newValue);
```

This chain-following pattern even supports **chained references** (references to references), because the `while` loop keeps unwrapping `__ref` objects until it hits a concrete value.

**Limitation:** The `__ref` pattern only works when the raw AST argument is an `Identifier`. Passing a subscript expression (e.g., `increment(arr[i])`) to a reference parameter will pass the value by copy. This matches reasonable behavior for most competitive programming use cases.

---

### 3.4 Lexical Scope & The `ScopeManager` Stack

**What it means:** C++ has lexical block scoping: variables declared inside `{}` are destroyed when the block exits. Nested blocks can shadow outer variables.

**How it works:** `ScopeManager` maintains a `SymbolTable[]` stack. Each `SymbolTable` is a `Map<string, Symbol>`.

```
ScopeManager internal stack (example during nested for loop):
  [0] global/function base scope: { "n": 5, "result": 0 }
  [1] for-loop initializer scope: { "i": 0 }
  [2] loop body scope:            { "temp": 3 }
       ↑ active (innermost)
```

Operations:

| Method | Behavior |
|---|---|
| `enterScope()` | Pushes a new empty `SymbolTable` |
| `exitScope()` | Pops the top `SymbolTable` (destroys its variables) |
| `defineVariable(name, type, value)` | Defines in the **topmost** scope |
| `assignVariable(name, value)` | Searches from top to bottom; writes to the first matching scope |
| `getVariable(name)` | Searches from top to bottom; returns first match (shadowing) |
| `captureState()` | Flattens all scopes bottom-to-top into one `Record<string, Symbol>` |

**Shadowing** is automatically correct: `getVariable` returns the topmost match, so an inner `int n = 99` hides an outer `n = 5` for the duration of that block.

---

### 3.5 Default Function Parameters

**C++ behavior:**
```cpp
int add(int a, int b = 10) { return a + b; }
add(5);    // returns 15
add(5, 3); // returns 8
```

**How it works:** `IRBuilder` recognizes `optional_parameter_declaration` nodes and parses the default value expression:

```typescript
if (param.type === "optional_parameter_declaration") {
  const lastChild = param.namedChildren[param.namedChildren.length - 1];
  if (lastChild && lastChild !== paramDeclNode) {
    defaultValue = this.buildExpression(lastChild);
  }
}
```

At call time, if `argValue === undefined && param.defaultValue && callerEvaluator`:

```typescript
argValue = callerEvaluator.evaluate(param.defaultValue);
```

The default expression is evaluated in the **caller's** evaluator context (where the caller's variables are accessible), matching C++ semantics.

---

## 4. Expressions & Assignment

### 4.1 The Expression Evaluation Hierarchy

`ExpressionEvaluator.evaluate(expr)` dispatches on `expr.kind`:

| `expr.kind` | Description | Returns |
|---|---|---|
| `"Literal"` | A number, string, bool, or null constant | The literal value |
| `"Identifier"` | A variable name lookup | The variable's value from scope chain |
| `"BinaryExpression"` | Two-operand operation (`+`, `&&`, `<<`, etc.) | Computed result |
| `"UnaryExpression"` | Single-operand operation (`!`, `-`, `~`) | Computed result |
| `"UpdateExpression"` | `++i` or `i++` | Pre/post increment/decrement value |
| `"Assignment"` | `x = 5` or `arr[i] += 1` in expression context | New value |
| `"SubscriptExpression"` | `arr[i]` or `map[key]` | Element value |
| `"MemberExpression"` | `node.val` or `ptr->next` | Property value |
| `"TernaryExpression"` | `cond ? a : b` | Consequent or alternate |
| `"InitializerList"` | `{1, 2, 3}` | `CppValue[]` |
| `"LambdaExpression"` | `[](int x){ return x*2; }` | The IR node itself (stored for later invocation) |
| `"FunctionCall"` | Any `f(args)` | **Intercepted by `ExecutionEngine`** |
| `"MethodCall"` | Any `obj.method(args)` | **Intercepted by `ExecutionEngine`** |
| `"NewExpression"` | `new T(args)` | **Intercepted by `ExecutionEngine`** |

---

### 4.2 Short-Circuit Evaluation

**C++ behavior:** In `&&`, if the left side is falsy, the right side is never evaluated. In `||`, if the left side is truthy, the right side is never evaluated.

**How it works:** The `<<` (stream) operator is checked first, then logical operators before arithmetic ones — because logical operators require evaluation of only the left operand first:

```typescript
if (expr.operator === "&&") {
  const leftVal = this.evaluate(expr.left);
  if (!leftVal) return false;                    // Short-circuit: right never evaluated
  return !!(this.evaluate(expr.right));
}
if (expr.operator === "||") {
  const leftVal = this.evaluate(expr.left);
  if (leftVal) return true;                      // Short-circuit: right never evaluated
  return !!(this.evaluate(expr.right));
}
```

The standard arithmetic/comparison path evaluates both operands before the switch.

---

### 4.3 C++ Stream Operator Interception (`cout <<`)

**C++ behavior:** `cout << a << b << endl;` prints values to standard output.

**The problem:** Tree-sitter parses `cout << a << b` as nested `shift_expression` nodes (because `<<` is the bitwise left-shift operator in the grammar). There's no `cout_statement` node type in tree-sitter-cpp.

**`IRBuilder` interception (parse phase):**

```typescript
if (exprNode.type === "shift_expression" || exprNode.type === "binary_expression") {
  let isCout = false;
  let current = exprNode;
  while (current.type === "shift_expression" || ...) {
    if (current.child(0)?.text === "cout") { isCout = true; break; }
    current = current.child(0) as SyntaxNode;
  }
  if (isCout) {
    // Traverse right-hand sides from deepest to shallowest and collect arguments
    const args: IRExpression[] = [];
    current = exprNode;
    while (current.type === "shift_expression" || ...) {
      args.unshift(this.buildExpression(current.child(2) as SyntaxNode));
      current = current.child(0) as SyntaxNode;
    }
    return { kind: "CoutStatement", line: ..., arguments: args };
  }
}
```

The result is an `IRCoutStatement` with an ordered list of arguments. The `StatementExecutor.executeCout` method evaluates them and emits a `WRITE` event:

```typescript
public executeCout(stmt: IRCoutStatement): void {
  const outputs = stmt.arguments.map(arg => {
    const val = this.evaluator.evaluate(arg);
    return val === "\n" ? "\n" : String(val ?? "");
  });
  this.eventEmitter.emit(stmt.line, EventType.WRITE, { output: outputs.join("") });
}
```

**`ExpressionEvaluator` fallback (expression context):**

When `cout <<` appears in expression context (e.g., assigned to a variable), the `ExpressionEvaluator`'s `evaluateBinary` catches it:

```typescript
if (expr.operator === "<<") {
  const left  = this.evaluate(expr.left);
  const right = this.evaluate(expr.right);
  if (left && typeof left === "object" && (left as any).__isCout) {
    if (right === "\n") console.log("");
    else console.log(`[C++]: ${right}`);
    return { __isCout: true } as unknown as CppValue;  // Return proxy for chaining
  }
  return (left as number) << (right as number);  // Standard bitwise shift fallback
}
```

The `__isCout` proxy propagates through chains (`cout << a << b`) because each `<<` sees the proxy as the left operand and recurses.

`endl` is intercepted in `ExpressionEvaluator` as an `Identifier` sentinel:
```typescript
case "Identifier":
  if (expr.name === "endl") return "\n";
```

---

### 4.4 Compound Assignment Operators

**C++ behavior:** `x += 5`, `arr[i] -= 1`, `bits &= mask`, etc.

**How it works:** `StatementExecutor.executeAssignment` reads the existing value, applies `computeCompoundValue`, then writes back:

```typescript
private computeCompoundValue(operator, existing, incoming): CppValue {
  const lhs = Number(existing);
  const rhs = Number(incoming);
  switch (operator) {
    case "+=":  return lhs + rhs;
    case "-=":  return lhs - rhs;
    case "*=":  return lhs * rhs;
    case "/=":  return Math.trunc(lhs / rhs);   // C++ integer truncation
    case "%=":  return lhs % rhs;
    case "&=":  return lhs & rhs;               // Bitwise AND
    case "|=":  return lhs | rhs;               // Bitwise OR
    case "^=":  return lhs ^ rhs;               // Bitwise XOR
    case "<<=": return lhs << rhs;              // Left shift
    case ">>=": return lhs >> rhs;              // Right shift
    default:    return incoming;
  }
}
```

This works for simple identifiers, subscript targets (`arr[i] *= 2`), and member expression targets (`node.val += 1`).

---

### 4.5 Bitwise Operators

All standard C++ bitwise operators are supported:

| Operator | C++ | JS equivalent |
|---|---|---|
| `&` | Bitwise AND | `(a as number) & (b as number)` |
| `\|` | Bitwise OR | `(a as number) \| (b as number)` |
| `^` | Bitwise XOR | `(a as number) ^ (b as number)` |
| `<<` | Left shift | `(a as number) << (b as number)` |
| `>>` | Right shift | `(a as number) >> (b as number)` |
| `~` | Bitwise NOT (unary) | `~(a as number)` |

Note that `<<` and `>>` in C++ expression context are standard bitwise shifts; only `cout << x` is intercepted as a stream operator.

---

### 4.6 `UpdateExpression` — `++i` vs `i++`

**C++ behavior:**
- **Prefix** (`++i`): Increments `i` and returns the **new** value.
- **Postfix** (`i++`): Increments `i` and returns the **old** value.

```typescript
const newValue = node.operator === "++" ? currentValue + 1 : currentValue - 1;
// ... write newValue back to memory ...
return node.prefix ? newValue : currentValue;
//                   ^^^^^^^^   ^^^^^^^^^^^^
//                   prefix     postfix returns old value
```

The update works on identifiers, subscript expressions (`arr[i]++`), and member expressions (`node.val++`), with each target type resolved and written back to the correct scope or object.

---

### 4.7 `Assignment` in Expression Context

In C++, `x = 5` is itself an expression that evaluates to `5`. This is supported:

```typescript
case "Assignment": {
  const assignExpr = expr as IRAssignment;
  const newValue = this.evaluate(assignExpr.value);
  // ... resolve target and write to memory ...
  return newValue;  // Returns the assigned value for use in expressions like if (x = f())
}
```

---

### 4.8 Ternary Operator

```typescript
case "TernaryExpression": {
  const condition = this.evaluate(ternExpr.condition);
  return condition
    ? this.evaluate(ternExpr.consequent)
    : this.evaluate(ternExpr.alternate);
}
```

Only the chosen branch is evaluated — the same short-circuit semantics as C++.

---

### 4.9 Cast Expressions

**C++ behavior:** `(int)x`, `(double)n`, `static_cast<int>(x)`, etc.

**How it works:** Cast expressions are handled in `buildExpression`, `case "cast_expression"`. The type descriptor is stripped and the underlying expression is returned as-is — this is the "duck-typed" approach. For `(int)` and `(long)` casts specifically, the engine emits a `FunctionCall` to the built-in `trunc` function:

```typescript
const isIntCast = node.text.replace(/\s+/g, "").startsWith("(int)")
               || node.text.replace(/\s+/g, "").startsWith("(long)");
if (isIntCast) {
  return { kind: "FunctionCall", callee: "trunc", arguments: [innerExpr] };
}
return innerExpr;  // All other casts: strip and pass through
```

`trunc` is in the `MATH_FUNS` table and maps to `Math.trunc`, giving the correct integer truncation behavior.

---

## 5. The STL Polyfill Matrix

All STL containers are emulated using a small set of JavaScript native types. The choice of backing type controls which polyfill paths are activated.

### 5.1 Container Backing Type Dispatch

When `invokeMethodCall` is called, the engine inspects the object to determine its type and routes accordingly:

```typescript
const isPlainArray   = Array.isArray(objInstance);
const isMockContainer = objInstance?.data !== undefined && Array.isArray(objInstance.data);
const isSet          = objInstance instanceof Set;
const isMap          = objInstance instanceof Map;
const isString       = typeof objInstance === "string";
const targetArray    = isPlainArray ? objInstance : (isMockContainer ? objInstance.data : null);
```

| C++ Type | JS Backing | `invokeMethodCall` path |
|---|---|---|
| `vector<T>` | Mock container `{ data: [] }` | `targetArray` branch |
| `deque<T>` | Mock container `{ data: [] }` | `targetArray` branch |
| `stack<T>` | Mock container `{ data: [] }` | `targetArray` branch |
| `queue<T>` | Mock container `{ data: [] }` | `targetArray` branch |
| `list<T>` | Mock container `{ data: [] }` | `targetArray` branch |
| `priority_queue<T>` | Mock container `{ data: [] }` | `targetArray` branch |
| `array<T,N>` | Mock container `{ data: [] }` | `targetArray` branch |
| `set<T>` | `Set` | `isSet` branch |
| `unordered_set<T>` | `Set` | `isSet` branch |
| `map<K,V>` | `Map` | `isMap` branch |
| `unordered_map<K,V>` | `Map` | `isMap` branch |
| `string` | `string` | `isString` branch |
| `pair<A,B>` / `tuple<...>` | `[A, B, ...]` (plain array) | Indexed directly |
| Raw arrays `int[]` | Plain JS `Array` | `isPlainArray` branch |

---

### 5.2 `vector` / `deque` / `stack` / `queue` / `list` — Mock Container

All sequential STL containers share the same "mock container" object produced by `StatementExecutor.createMockContainer(initialData)`.

**The mock container object structure:**
```typescript
{
  data: any[],          // The actual backing array
  // Methods are defined inline on the object
  push_back, push, push_front, pop_back, pop, pop_front,
  insert, remove, erase, find, contains, search,
  front, back, top, at,
  size, length, empty, clear, print
}
```

#### Full Method Polyfill Table

| C++ Method | Applies to | JS Implementation | Return |
|---|---|---|---|
| `push_back(v)` | vector, deque, list | `data.push(v)` | `v` |
| `push(v)` | stack, queue, priority_queue | `data.push(v)` | `v` |
| `push_front(v)` | deque, list | `data.unshift(v)` | `v` |
| `pop_back()` | vector, deque, list | `data.pop()` | popped value |
| `pop()` | stack, queue | `data.pop()` | popped value |
| `pop_front()` | deque, list | `data.shift()` | shifted value |
| `front()` | vector, deque, list | `data[0]` | first element |
| `back()` | vector, deque, list | `data[data.length-1]` | last element |
| `top()` | stack, priority_queue | `data[data.length-1]` | last element |
| `at(i)` | vector, array | `data[i]` (bounds checked) | element at index |
| `size()` | all | `data.length` | `number` |
| `length()` | all | `data.length` | `number` |
| `empty()` | all | `data.length === 0` | `boolean` |
| `clear()` | all | `data = []` (reset array) | `void` |
| `insert(v)` | all (1-arg) | `data.push(v)` | `v` |
| `insert(i, v)` | vector (2-arg, int first) | `data.splice(i, 0, v)` | `void` |
| `erase(i)` | vector | `data.splice(i, 1)` | `void` |
| `remove(v)` | list | `data.splice(data.indexOf(v), 1)` | `boolean` |
| `find(v)` | list, vector | `data.indexOf(v)` | index (`-1` if not found) |
| `contains(v)` | all | `data.includes(v)` | `boolean` |
| `search(v)` | list | `data.indexOf(v)` | index |
| `print()` | debug | `[${data.join(" -> ")}]` | `string` |

> **`priority_queue` note:** The engine does **not** automatically maintain heap ordering. Elements are pushed to the back and `top()` returns the last element. For programs that rely on priority ordering, the user must sort explicitly or use a comparator with `std::sort`.

---

### 5.3 `set` / `unordered_set` — JS `Set` Polyfill

Backed by JavaScript's native `Set` object. Method dispatch in `invokeMethodCall`:

| C++ Method | JS Implementation | Notes |
|---|---|---|
| `insert(v)` | `set.add(v)` | JS `Set.add` is idempotent |
| `erase(v)` / `remove(v)` | `set.delete(v)` | Returns `boolean` |
| `count(v)` / `find(v)` / `contains(v)` | `set.has(v) ? 1 : 0` | Mimics `count()` returning 0 or 1 |
| `size()` / `length()` | `set.size` | |
| `empty()` | `set.size === 0` | |
| `clear()` | `set.clear()` | |

Iteration over a `set` in a range-based for loop converts it via `Array.from(container)`.

---

### 5.4 `map` / `unordered_map` — JS `Map` Polyfill

Backed by JavaScript's native `Map` object. Method dispatch:

| C++ Method | JS Implementation | Notes |
|---|---|---|
| `insert({key, val})` / `insert([key,val])` | `map.set(args[0][0], args[0][1])` | Takes a pair argument |
| `erase(key)` | `map.delete(key)` | |
| `count(key)` / `find(key)` / `contains(key)` | `map.has(key) ? 1 : 0` | |
| `size()` / `length()` | `map.size` | |
| `empty()` | `map.size === 0` | |
| `clear()` | `map.clear()` | |

**Subscript access** (`map[key]`) uses the `SubscriptExpression` evaluation path in `ExpressionEvaluator`:

```typescript
if (targetObj instanceof Map) {
  val = targetObj.get(index);
}
```

**Subscript write** (`map[key] = val`) uses the `Assignment` path:

```typescript
if (targetObj instanceof Map) {
  targetObj.set(index, finalValue);
}
```

**Map iteration** in range-based for: `Array.from(container.entries())` converts the map to `[key, value]` pairs, which structured bindings then unpack: `auto [k, v] : myMap`.

---

### 5.5 `string` Polyfill

Strings are JS `string` primitives. Since JS strings are immutable, methods that would mutate the string in C++ **return new strings**. The caller must use the return value (which works correctly for assignment contexts like `s = s.substr(1)`).

| C++ Method | JS Implementation | Returns |
|---|---|---|
| `size()` / `length()` | `s.length` | `number` |
| `empty()` | `s.length === 0` | `boolean` |
| `at(i)` | `s[i]` | `string` (1 char) |
| `front()` | `s[0]` | `string` (1 char) |
| `back()` | `s[s.length-1]` | `string` (1 char) |
| `substr(pos, len)` | `s.substring(pos, pos+len)` | `string` |
| `find(sub, start)` | `s.indexOf(sub, start)` | `number` (index or -1) |
| `rfind(sub)` | `s.lastIndexOf(sub)` | `number` |
| `c_str()` | `s` (identity) | `string` |
| `compare(t)` | `s === t ? 0 : s < t ? -1 : 1` | `number` |
| `starts_with(prefix)` | `s.startsWith(prefix)` | `boolean` |
| `ends_with(suffix)` | `s.endsWith(suffix)` | `boolean` |
| `contains(sub)` | `s.includes(sub)` | `boolean` |
| `append(t)` | `s + t` (returns new) | `string` |
| `push_back(c)` | `s + c` (returns new) | `string` |
| `insert(pos, sub)` | `s.slice(0,pos) + sub + s.slice(pos)` | `string` |
| `erase(pos, n)` | `s.slice(0,pos) + s.slice(pos+n)` | `string` |
| `replace(pos,n,sub)` | `s.slice(0,pos) + sub + s.slice(pos+n)` | `string` |
| `clear()` | `""` (returns new) | `string` |
| `tolower()` / `lower()` | `s.toLowerCase()` | `string` |
| `toupper()` / `upper()` | `s.toUpperCase()` | `string` |
| `count(sub)` | `(s.match(new RegExp(sub,"g")) \|\| []).length` | `number` |
| `begin()` | `0` | `number` |
| `end()` | `s.length` | `number` |

---

### 5.6 `pair<A,B>` and `tuple<...>`

Pairs and tuples are stored as plain JavaScript arrays: `pair<int,int>(3,4)` becomes `[3, 4]`.

**Creation:**
- `make_pair(a, b)` → `[a, b]`
- `pair<T,U>(a, b)` → `[a, b]` (same intercept)
- `make_tuple(a, b, c)` → `[a, b, c]`

**Member access:**
- `.first` → `pair[0]` (via `MemberExpression` auto-recovery fieldMap)
- `.second` → `pair[1]` (via `MemberExpression` auto-recovery fieldMap)

**Auto-recovery for `.first` / `.second`:**

```typescript
const fieldMap: Record<string, number> = {
  id: 0, value: 1, left: 2, right: 3,
  x: 0, y: 1, val: 0, next: 1,
  first: 0, second: 1     // ← pair access
};
if (val === undefined && Array.isArray(targetObj)) {
  if (memExpr.property in fieldMap) val = targetObj[fieldMap[memExpr.property]];
}
```

**Structured bindings** (`auto [a, b] = myPair`) are handled in both `StatementExecutor.executeVariableDeclaration` and `IRWalker.walkForRangeStatement`:

```typescript
if (node.name.startsWith("[") && node.name.endsWith("]")) {
  const parts = node.name.slice(1, -1).split(",").map(s => s.trim());
  if (Array.isArray(value)) {
    parts.forEach((p, idx) => scopeManager.defineVariable(p, node.variableType, value[idx]));
  }
}
```

---

### 5.7 Constructor Initialization Forms

The `StatementExecutor` handles three distinct C++ initialization syntaxes:

| C++ Syntax | Tree-sitter type | IR field | Handling |
|---|---|---|---|
| `vector<int> v = {1,2,3}` | `init_declarator` (with `=`) | `initializer` | Evaluates `InitializerList` |
| `vector<int> v(n, 0)` | `init_declarator` (with `argument_list`) | `constructorArgs` | Sizes array to `n` filled with `0` |
| `vector<int> v(n)` | `function_declarator` (Tree-sitter misparse) | `constructorArgs` | Sizes array to `n` filled with `0` |
| `vector<int> v` | bare declarator | *(no fields set)* | Default: empty mock container |

**Constructor size/fill logic:**

```typescript
const size = typeof arg0 === "number" && arg0 >= 0 && arg0 < 1_000_000 ? arg0 : -1;
const fillVal = arg1 !== undefined ? arg1 : 0;

if (typeLower.includes("vector") || typeLower.includes("list") || ...) {
  value = size >= 0
    ? this.createMockContainer(new Array(size).fill(fillVal))
    : this.createMockContainer([]);
}
```

**2D vector initialization:** `vector<vector<int>> dp(n, vector<int>(m, 0))`:
- Outer constructor: `arg0 = n`, `arg1 = createMockContainer([0,0,...,0])`
- Result: mock container whose `.data` is an array of `n` identical inner mock containers

**Nested array wrapping:** When an `InitializerList` produces a nested array and the type is a container, the executor deep-wraps each nested array into a `MockContainer`:

```typescript
const wrapContainer = (arr: any[]): Record<string, any> => {
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) arr[i] = wrapContainer(arr[i]);
  }
  return this.createMockContainer(arr);
};
value = wrapContainer(value as any[]);
```

---

## 6. Standard Algorithms & Utilities

### 6.1 `<algorithm>` Intercepts

All algorithm intercepts live in `ExecutionEngine.invokeFunctionCall()` and are processed before the standard function lookup.

#### `std::swap`

**C++ behavior:** Swaps two values in-place.

**Subscript form** (`swap(arr[i], arr[j])`):

```typescript
const temp = target1[idx1];
target1[idx1] = target2[idx2];
target2[idx2] = temp;
```

**Identifier form** (`swap(a, b)`): Reads both values, then assigns cross-wise using the active scope.

#### `std::sort` / `std::stable_sort`

**C++ behavior:**
```cpp
sort(v.begin(), v.end());                   // Ascending
sort(v.begin(), v.end(), greater<int>());   // Descending
sort(v.begin(), v.end(), [](int a, int b) { return a > b; });  // Custom lambda
```

**How it works:** Detects that the first argument is a `MethodCall` (`.begin()`), evaluates the object to get the backing array, then calls `Array.sort()`:

```typescript
if (callNode.arguments.length >= 3) {
  const cmpVal = currentEvaluator.evaluate(callNode.arguments[2]);
  if (typeof cmpVal === "function") {
    arr.sort((a, b) => {
      const r = (cmpVal as Function)(a, b);
      return typeof r === "boolean" ? (r ? -1 : 1) : (r as number);
    });
  }
} else {
  arr.sort((a, b) => a - b);  // Default ascending numeric sort
}
```

The comparator (`cmpVal`) can be a JS `function` produced by:
- **Lambda expression evaluation** → stored as a JS closure
- **`greater<int>()` intercept** → returns `(a,b) => a > b ? -1 : a < b ? 1 : 0`
- **`less<int>()` intercept** → returns `(a,b) => a < b ? -1 : a > b ? 1 : 0`

#### `std::reverse`

Calls `targetArray.reverse()` in-place on the detected backing array.

#### `std::fill` / `std::fill_n`

| Function | C++ | JS Implementation |
|---|---|---|
| `fill(begin, end, val)` | Fill all elements with `val` | `arr.fill(fillVal)` |
| `fill_n(begin, n, val)` | Fill first `n` elements | `for (let i=0;i<n&&i<arr.length;i++) arr[i]=fillVal` |

#### `std::count` / `std::count_if`

| Function | JS Implementation |
|---|---|
| `count(begin, end, val)` | `arr.filter(x => x === val).length` |
| `count_if(begin, end, pred)` | `arr.filter(x => (pred as Function)(x)).length` |

#### `std::unique`

Removes consecutive duplicates in-place (C++ behavior). Modifies the array using `splice`:

```typescript
const filtered = arr.filter((v, i) => i === 0 || v !== arr[i-1]);
arr.splice(0, arr.length, ...filtered);
return arr.length;   // Returns iterator to new end (as index)
```

#### `std::next_permutation` / `std::prev_permutation`

Full implementation of the standard library algorithm:

```
next_permutation:
  1. Find largest i such that arr[i] < arr[i+1]
  2. If none: arr.reverse() and return false (was last permutation)
  3. Find largest j such that arr[j] > arr[i]
  4. Swap arr[i] and arr[j]
  5. Reverse suffix from arr[i+1] onward
  6. Return true
```

`prev_permutation` uses `>=` and `<=` comparisons to find the previous permutation.

#### `std::lower_bound` / `std::upper_bound`

Binary search implementations:

| Function | Condition to advance `lo` | Returns |
|---|---|---|
| `lower_bound(begin, end, val)` | `arr[mid] < val` | First index where `arr[i] >= val` |
| `upper_bound(begin, end, val)` | `arr[mid] <= val` | First index where `arr[i] > val` |

```typescript
let lo = 0, hi = arr.length;
while (lo < hi) {
  const mid = (lo + hi) >>> 1;   // Unsigned right shift = fast integer half
  const shouldAdvance = functionName === "lower_bound"
    ? arr[mid] < val
    : arr[mid] <= val;
  if (shouldAdvance) lo = mid + 1; else hi = mid;
}
return lo;
```

#### `std::binary_search`

Returns `true` if the value is found in a sorted range; `false` otherwise.

#### `std::max_element` / `std::min_element` / `std::accumulate`

| Function | JS Implementation |
|---|---|
| `max_element(begin, end)` | `Math.max(...targetArray)` |
| `min_element(begin, end)` | `Math.min(...targetArray)` |
| `accumulate(begin, end, init)` | `arr.reduce((acc, val) => acc + val, initial)` |

---

### 6.2 Comparator Functors

These return JavaScript comparator functions that sort arrays in the specified order:

| C++ Functor | JS Return Value | Sort effect |
|---|---|---|
| `greater<T>()` | `(a,b) => a>b ? -1 : a<b ? 1 : 0` | Descending |
| `less<T>()` | `(a,b) => a<b ? -1 : a>b ? 1 : 0` | Ascending (same as default) |
| `greater_equal<T>()` | `(a,b) => a>=b ? -1 : 1` | Descending (stable) |
| `less_equal<T>()` | `(a,b) => a<=b ? -1 : 1` | Ascending (stable) |

These functors are matched by `functionName.startsWith("greater")` / `.startsWith("less")` to handle template parameterizations like `greater<int>` or `greater<pair<int,int>>`.

---

### 6.3 `<cmath>` — Math Functions

All standard C math functions are mapped through the `MATH_FUNS` table:

| C++ Function | JS Equivalent | Notes |
|---|---|---|
| `sqrt(x)` | `Math.sqrt(x)` | |
| `cbrt(x)` | `Math.cbrt(x)` | |
| `pow(x, y)` | `Math.pow(x, y)` | |
| `exp(x)` | `Math.exp(x)` | |
| `log(x)` | `Math.log(x)` | Natural logarithm |
| `log2(x)` | `Math.log2(x)` | |
| `log10(x)` | `Math.log10(x)` | |
| `floor(x)` | `Math.floor(x)` | |
| `ceil(x)` | `Math.ceil(x)` | |
| `round(x)` | `Math.round(x)` | |
| `trunc(x)` | `Math.trunc(x)` | Also used by `(int)` cast |
| `sin(x)` | `Math.sin(x)` | |
| `cos(x)` | `Math.cos(x)` | |
| `tan(x)` | `Math.tan(x)` | |
| `asin(x)` | `Math.asin(x)` | |
| `acos(x)` | `Math.acos(x)` | |
| `atan(x)` | `Math.atan(x)` | |
| `atan2(y, x)` | `Math.atan2(y, x)` | |
| `sinh(x)` | `Math.sinh(x)` | |
| `cosh(x)` | `Math.cosh(x)` | |
| `tanh(x)` | `Math.tanh(x)` | |
| `fabs(x)` / `fabsf(x)` | `Math.abs(x)` | |
| `fmod(a, b)` | `a % b` | |
| `hypot(a, b)` | `Math.hypot(a, b)` | |
| `ldexp(x, e)` | `x * Math.pow(2, e)` | |
| `max(a, b)` | `Math.max(a, b)` | |
| `min(a, b)` | `Math.min(a, b)` | |
| `abs(x)` | `Math.abs(x)` | |

---

### 6.4 `<numeric>` — GCD and LCM

| C++ Function | Implementation |
|---|---|
| `__gcd(a, b)` / `gcd(a, b)` | Euclidean algorithm: `while (b) [a,b] = [b, a%b]; return a;` |
| `lcm(a, b)` | `(a / gcd(a,b)) * b` (with zero check) |

---

### 6.5 `<string>` — String Conversion Utilities

| C++ Function | JS Equivalent | Input/Output |
|---|---|---|
| `to_string(v)` | `String(v)` | number → string |
| `stoi(s)` / `stol(s)` / `stoll(s)` | `parseInt(s, 10)` | string → integer |
| `stod(s)` / `stof(s)` / `stold(s)` | `parseFloat(s)` | string → float |
| `atoi(s)` | `parseInt(s, 10)` | C-style string → int |
| `atof(s)` | `parseFloat(s)` | C-style string → float |

---

### 6.6 `<cctype>` — Character Classification

All character functions accept either a `string` character or a `number` (ASCII code):

```typescript
const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
```

| C++ Function | JS Test | Return |
|---|---|---|
| `toupper(c)` | `ch.toUpperCase()` | ASCII code of uppercased char |
| `tolower(c)` | `ch.toLowerCase()` | ASCII code of lowercased char |
| `isdigit(c)` | `/\d/.test(ch)` | `1` or `0` |
| `isalpha(c)` | `/[a-zA-Z]/.test(ch)` | `1` or `0` |
| `isalnum(c)` | `/[a-zA-Z0-9]/.test(ch)` | `1` or `0` |
| `islower(c)` | `/[a-z]/.test(ch)` | `1` or `0` |
| `isupper(c)` | `/[A-Z]/.test(ch)` | `1` or `0` |
| `isspace(c)` | `/\s/.test(ch)` | `1` or `0` |

---

### 6.7 `<cstdio>` — `printf` / `fprintf`

`printf` and `fprintf` emit formatted output to the visualizer via a `WRITE` event:

```typescript
const fmtStr = String(rawArgs[0]);
let argIdx = 1;
const formatted = fmtStr.replace(
  /%[-+0 #]*\d*(?:\.\d+)?[diouxXeEfgGscpn%lh]/g,
  (match) => {
    if (match === "%%") return "%";
    return String(rawArgs[argIdx++] ?? "");
  }
);
this.eventEmitter.emit(callNode.line, EventType.WRITE, { output: formatted });
return 0;
```

The regex handles all standard format specifiers (`%d`, `%f`, `%s`, `%ld`, `%lld`, etc.) and replaces them with stringified argument values. `%%` is converted to a literal `%`.

---

### 6.8 Lambda Expressions

**C++ behavior:**
```cpp
auto cmp = [](int a, int b) { return a > b; };
sort(v.begin(), v.end(), cmp);

// Capture by value/reference:
int base = 10;
auto f = [base](int x) { return x + base; };
```

**How it works:**

When `attachEvaluationInterceptor` encounters a `LambdaExpression`, it **captures the current scope** and returns a JavaScript closure:

```typescript
if (expr.kind === "LambdaExpression") {
  const lambdaExpr = expr as IRLambdaExpression;
  const definitionScope = this.callStack.peek().scopeManager;

  return (...args: any[]) => {
    const lambdaFrame = this.callStack.push("lambda");

    // Capture all variables visible at definition time (capture-by-value semantics)
    const capturedState = definitionScope.captureState();
    for (const [vName, vSymbol] of Object.entries(capturedState)) {
      lambdaFrame.scopeManager.defineVariable(vName, vSymbol.type, vSymbol.value);
    }

    // Bind call-time parameters
    lambdaExpr.parameters.forEach((param, index) => {
      lambdaFrame.scopeManager.defineVariable(param.name, param.type, args[index]);
    });

    const localEvaluator = new ExpressionEvaluator(lambdaFrame.scopeManager, this.eventEmitter);
    this.attachEvaluationInterceptor(localEvaluator);
    // ... walk body, catch ReturnSignal, pop frame ...
  };
}
```

The closure captures `definitionScope.captureState()` — a snapshot of all variables at the point of lambda definition. **Limitation:** This always behaves as capture-by-value (`[=]`). True capture-by-reference (`[&]`) is not differentiated.

**Storing lambdas as variables:**

```cpp
auto cmp = [](int a, int b) { return a > b; };
```

The lambda expression evaluates to a JS closure, which is then stored as a `CppValue` in the scope. When called via `invokeFunctionCall`, the engine checks the scope for a local function reference:

```typescript
let localFuncRef = activeScope.getVariable(functionName)?.value;
if (typeof localFuncRef === "function") {
  return localFuncRef(...args);  // Direct JS call
}
```

---

### 6.9 Function Pointers

Functions can be passed as values. When a function name is looked up in the scope and found to be a `string` (a function name reference), it is redirected through `invokeFunction`:

```typescript
if (typeof localFuncRef === "string") targetCallee = localFuncRef;
return this.invokeFunction(targetCallee, args, callNode.arguments, currentEvaluator);
```

This allows patterns like:
```cpp
bool myCompare(int a, int b) { return a > b; }
sort(v.begin(), v.end(), myCompare);
```

---

## 7. Constants & Macros

### 7.1 `#include` is Ignored

**What it means:** All `#include <iostream>`, `#include <vector>`, etc. are recognized by Tree-sitter as `preproc_include` nodes and mapped to `IREmptyStatement` (no-op) in the `IRBuilder`:

```typescript
case "preproc_include":
case "preproc_def":
case "using_declaration":
  return { kind: "EmptyStatement", line: ... };
```

**What this means in practice:** Standard library functionality is **not loaded from any actual headers**. Instead, the engine ships built-in polyfills for every commonly used symbol. `using namespace std;` is similarly ignored.

---

### 7.2 Globally Injected Constants

Constants are injected in `ExpressionEvaluator`, `case "Identifier"`, before the scope chain lookup:

```typescript
const GLOBAL_CONSTANTS: Record<string, number> = {
  INT_MAX:    2_147_483_647,
  INT_MIN:   -2_147_483_648,
  LONG_MAX:   2_147_483_647,
  LONG_MIN:  -2_147_483_648,
  LLONG_MAX:  Number.MAX_SAFE_INTEGER,    // 9,007,199,254,740,991
  LLONG_MIN: -Number.MAX_SAFE_INTEGER,
  UINT_MAX:   4_294_967_295,
  ULLONG_MAX: Number.MAX_SAFE_INTEGER,
  DBL_MAX:    Number.MAX_VALUE,
  DBL_MIN:    Number.MIN_VALUE,
  FLT_MAX:    3.4028235e+38,
  FLT_MIN:    1.17549435e-38,
  M_PI:       Math.PI,                   // 3.141592653589793
  M_E:        Math.E,                    // 2.718281828459045
  M_LN2:      Math.LN2,
  M_LOG2E:    Math.LOG2E,
  M_SQRT2:    Math.SQRT2,
  SIZE_MAX:   Number.MAX_SAFE_INTEGER,
  CHAR_MAX:   127,
  CHAR_MIN:  -128,
  UCHAR_MAX:  255,
  SHORT_MAX:  32_767,
  SHORT_MIN: -32_768,
};
```

Special infinity/NaN constants use separate checks:

```typescript
if (expr.name === "INFINITY" || expr.name === "INF" || expr.name === "HUGE_VAL") return Infinity;
if (expr.name === "NAN" || expr.name === "NaN") return NaN;
```

Other sentinels recognized as `Identifier` nodes:
- `nullptr` / `NULL` → `null`
- `endl` → `"\n"`
- `true` → `true`
- `false` → `false`
- `cout` → `{ __isCout: true }` (stream proxy)

---

### 7.3 `assert`

```cpp
assert(x > 0);
```

Intercepted in `invokeFunctionCall`:

```typescript
if (functionName === "assert") {
  const v = currentEvaluator.evaluate(callNode.arguments[0]);
  if (!v) throw new Error(`Assertion Failed at line ${callNode.line}`);
  return undefined;
}
```

---

## 8. Advanced Duck-Typing & Auto-Recovery

This section documents the engine's heuristic fallback behaviors — the "magic" that keeps programs running when the AST is ambiguous or Tree-sitter misparsed a construct.

---

### 8.1 Uninitialized Container Auto-Recovery

**Scenario:**
```cpp
// User forgot to declare: vector<int> adj[n];
adj[0].push_back(1);
```

Tree-sitter may parse `adj` as a valid declaration in some contexts, but if the variable lookup throws (because `adj` was never declared in scope), the engine catches this in `invokeMethodCall`:

```typescript
let objInstance: CppValue;
try {
  objInstance = currentEvaluator.evaluate(methodNode.object);
} catch (e) {
  objInstance = undefined as any;
}

if (!objInstance) {
  // Recovery path 1: Simple undeclared identifier (e.g., queue<int> q;)
  if (methodNode.object.kind === "Identifier") {
    const varName = (methodNode.object as any).name;
    objInstance = [];  // Assume it's an array
    const activeScope = this.callStack.peek().scopeManager;
    try {
      activeScope.assignVariable(varName, objInstance);
    } catch (e) {
      activeScope.defineVariable(varName, "auto", objInstance);
    }
  }
```

**Scenario 2:** `adj[0].push_back(1)` where `adj` is declared but `adj[0]` is `undefined` (uninitialized inner array):

```typescript
  // Recovery path 2: Undeclared subscript element (e.g., adj[i].push_back(v))
  else if (methodNode.object.kind === "SubscriptExpression") {
    const subExpr = methodNode.object as any;
    const parentObj = currentEvaluator.evaluate(subExpr.object);  // adj
    const index = currentEvaluator.evaluate(subExpr.index) as number;  // 0

    if (parentObj) {
      objInstance = [];  // Create a new empty array for adj[0]
      if (parentObj instanceof Map) parentObj.set(index, objInstance);
      else if (Array.isArray(parentObj)) parentObj[index] = objInstance;
      else if (parentObj.data && Array.isArray(parentObj.data)) parentObj.data[index] = objInstance;
      else parentObj[index] = objInstance;
    }
  }
}
```

This recovers adjacency-list graph construction patterns extremely reliably. When `adj[0].push_back(1)` is called on an uninitialized `adj[0]`, the engine creates an empty array at `adj[0]` and then immediately calls `push_back(1)` on it.

---

### 8.2 Constructor Auto-Recovery for Unknown Types

**Scenario:**
```cpp
SomeUndeclaredType x(5, 10);   // Not in classBlueprints
```

When `invokeFunction` cannot find the function in `this.functions` and it's called with numeric arguments, it falls back to array construction:

```typescript
if (!func) {
  if (args.length === 1 && typeof args[0] === "number")
    return new Array(args[0]).fill(0);        // T(n) → [0,0,...,0] of length n
  if (args.length === 2 && typeof args[0] === "number")
    return new Array(args[0]).fill(args[1]);  // T(n, val) → [val,...,val]
  throw new Error(`Linker Error: Undefined reference to '${name}'.`);
}
```

This handles `vector<int>(n, 0)` even when Tree-sitter parses the type as a function call instead of a constructor.

---

### 8.3 Struct Array Field Tuple Recovery

**Scenario:** Tree-sitter parses a struct instance stored in an array as a plain array index rather than a named property:

```cpp
struct Point { int x; int y; };
Point p = {3, 4};
cout << p.x;  // Tree-sitter might store this as p[0] if schema wasn't linked
```

In `ExpressionEvaluator`, `case "MemberExpression"`:

```typescript
let val = targetObj[memExpr.property];

// If property lookup fails and the object is actually a plain array (struct stored as array):
if (val === undefined && Array.isArray(targetObj)) {
  const fieldMap: Record<string, number> = {
    id:    0,   // struct field named "id"   → index 0
    value: 1,   // struct field named "value" → index 1
    left:  2,   // binary tree left child    → index 2
    right: 3,   // binary tree right child   → index 3
    x:     0,   // 2D point x               → index 0
    y:     1,   // 2D point y               → index 1
    val:   0,   // common "val" field        → index 0
    next:  1,   // linked list next pointer  → index 1
    first: 0,   // pair.first               → index 0
    second:1,   // pair.second              → index 1
  };
  if (memExpr.property in fieldMap) {
    val = targetObj[fieldMap[memExpr.property]];
  }
}
```

The same `fieldMap` recovery is applied in **assignment** contexts (`ExpressionEvaluator`, `case "Assignment"`, `MemberExpression` branch) and in `StatementExecutor.executeAssignment`.

---

### 8.4 Unary Dereference No-Op (`*ptr`)

**C++ behavior:** `*ptr` dereferences a pointer.

**Duck-typed equivalent:** Since all C++ objects are stored as direct JS references (there is no indirection layer), dereferencing is a no-op:

```typescript
case "UnaryExpression":
  return this.evaluateUnary(expr);
// Inside evaluateUnary:
case "*": return argValue;   // Pass-through: JS refs are already "dereferenced"
case "&": return argValue;   // Address-of is also a no-op
```

In the interceptor in `attachEvaluationInterceptor`:
```typescript
if (expr.kind === "UnaryExpression" && (expr as any).operator === "*") {
  return evaluator.evaluate((expr as any).argument);
}
```

This handles `(*root).val` and `root->val` identically — both just look up the object and access its `val` property.

---

### 8.5 Map Subscript Auto-Initialization

**C++ behavior:** `myMap[key]` on an `unordered_map` default-initializes the entry to `0` if it doesn't exist.

**How it works:** In `SubscriptExpression` evaluation, if `targetObj instanceof Map`:

```typescript
val = targetObj.get(index);
```

JS `Map.get` returns `undefined` for missing keys. The engine returns `undefined` as `CppValue` without throwing. When this value is then used in arithmetic (e.g., `dp[key]++`), the `evaluateUpdate` method's `parseNumber` helper converts `undefined` to `0`:

```typescript
const parseNumber = (rawVal: any): number => {
  if (rawVal === undefined || rawVal === null) return 0;
  return isNaN(Number(rawVal)) ? 0 : Number(rawVal);
};
```

When `myMap[key] = someValue` is executed afterward, the map entry is created normally via `map.set(key, value)`. This replicates the auto-initialization behavior of C++ map's `operator[]`.

---

### 8.6 `map[key] += value` Pattern

**C++ behavior:**
```cpp
unordered_map<string, int> freq;
freq["apple"]++;    // Auto-initializes to 0, then increments to 1
```

This works because:
1. `freq["apple"]` subscript is evaluated → `undefined`
2. `parseNumber(undefined)` → `0`
3. `++` produces `newValue = 1`
4. Write-back: `map.set("apple", 1)` (in the `UpdateExpression` write-back path)

---

### 8.7 Global Variable Scope Injection

**The problem:** Functions defined after `main` need access to global variables like `int N; int grid[100][100];` declared at file scope.

**How it works:** Every time `invokeFunction` pushes a new call stack frame, it injects all global variables from `this.globalVariables` into the new frame's base scope **before** processing parameters:

```typescript
for (const [gName, gData] of this.globalVariables) {
  try {
    frame.scopeManager.defineVariable(gName, gData.type, gData.value);
  } catch { /* already defined — skip */ }
}
```

Because these are injected as actual scope variables (not a separate global namespace), the scope chain lookup in `assignVariable` will find and mutate them normally. However, this means mutations to global variables inside a function **do not propagate back** to `this.globalVariables` itself — they modify the local scope's copy. Global mutation between function calls is a known limitation.

---

### 8.8 for-statement `init` Polymorphism

Tree-sitter can parse the initializer clause of a `for` loop in several different ways depending on the code:

| C++ init clause | Tree-sitter type | IR representation |
|---|---|---|
| `int i = 0` | `declaration` | `IRVariableDeclaration[]` |
| `i = 0` (pre-declared) | `assignment_expression` | `IRAssignment` |
| `i++` | `update_expression` | Wrapped as `IRExpressionStatement` |
| *(empty)* | *(absent)* | `undefined` |

`walkForStatement` handles all of these:

```typescript
if (Array.isArray(node.init)) {
  for (const initStmt of node.init) this.walkStatement(initStmt);
} else {
  this.walkStatement(node.init);  // Single statement polymorphism via walkStatement dispatch
}
```

---

## 9. AST Node Mapping

This section provides a complete reference dictionary mapping `tree-sitter-cpp` node types to their internal IR representations and the C++ code patterns that produce them.

### 9.1 Top-Level Nodes

| Tree-sitter type | C++ Example | IR Produced | `IRBuilder` Method |
|---|---|---|---|
| `translation_unit` | *(whole file)* | `IRProgram` | `build()` |
| `function_definition` | `int main() { ... }` | `IRFunctionDeclaration` | `buildFunctionDeclaration()` |
| `struct_specifier` | `struct Node { int val; };` | `IRStructDeclaration` | `buildStructDeclaration()` |
| `class_specifier` | `class MyClass { public: int x; };` | `IRStructDeclaration` | `buildStructDeclaration()` |
| `declaration` (at root) | `int N = 100;` | `IRVariableDeclaration[]` (in `globals`) | `buildVariableDeclaration()` |
| `preproc_include` | `#include <vector>` | `IREmptyStatement` | `buildStatement()` |
| `preproc_def` | `#define MAX 1000` | `IREmptyStatement` | `buildStatement()` |
| `using_declaration` | `using namespace std;` | `IREmptyStatement` | `buildStatement()` |

---

### 9.2 Statement Nodes

| Tree-sitter type | C++ Example | IR Produced | Notes |
|---|---|---|---|
| `declaration` | `int x = 5;` | `IRVariableDeclaration[]` | Array because one declaration can define multiple variables |
| `expression_statement` | `f(); arr[i] = 5;` | `IRExpressionStatement` or `IRAssignment` or `IRCoutStatement` | Assignment and cout are elevated to their own IR kinds |
| `if_statement` | `if (x > 0) { ... } else { ... }` | `IRIfStatement` | `else if` is a nested `IRIfStatement` in `alternate` |
| `while_statement` | `while (i < n) { ... }` | `IRWhileStatement` | |
| `do_statement` | `do { ... } while (cond);` | `IRDoWhileStatement` | Previously missing; now fully supported |
| `for_statement` | `for (int i=0; i<n; i++) { ... }` | `IRForStatement` | `init` can be `IRVariableDeclaration[]` or `IRAssignment` |
| `for_range_loop` | `for (auto x : v) { ... }` | `IRForRangeStatement` | Detects structured bindings via `[a, b]` iterator name |
| `switch_statement` | `switch (x) { case 1: ... break; }` | `IRSwitchStatement` | |
| `case_statement` | `case 1: ... default: ...` | `IRCaseClause` | `isDefault: true` for `default:` |
| `return_statement` | `return x + 1;` | `IRReturnStatement` | `argument` is `undefined` for bare `return;` |
| `break_statement` | `break;` | `IRBreakStatement` | Throws `BreakSignal` at runtime |
| `continue_statement` | `continue;` | `IRContinueStatement` | Throws `ContinueSignal` at runtime |
| `compound_statement` | `{ int x = 0; x++; }` | `IRBlock` | Pushed as an isolated scope block |
| `comment` | `// foo` / `/* bar */` | `IREmptyStatement` | Silently ignored |

---

### 9.3 Expression Nodes

| Tree-sitter type | C++ Example | IR Produced | Notes |
|---|---|---|---|
| `number_literal` | `42`, `3.14f`, `0x1F`, `100ULL` | `IRLiteral` (valueType: "double") | Suffix chars (`f`, `u`, `l`, `ll`) stripped before `Number()` |
| `true` | `true` | `IRLiteral` (valueType: "bool", value: true) | Bare keyword node |
| `false` | `false` | `IRLiteral` (valueType: "bool", value: false) | Bare keyword node |
| `string_literal` | `"hello\nworld"` | `IRLiteral` (valueType: "string") | Escape sequences `\n`, `\t`, `\"` are unescaped |
| `char_literal` | `'a'`, `'\n'` | `IRLiteral` (valueType: "char") | Returned as a 1-character string |
| `null` / `nullptr` | `nullptr` | `IRLiteral` (valueType: "nullptr", value: null) | |
| `identifier` | `myVar`, `i`, `n` | `IRIdentifier` | |
| `qualified_identifier` | `std::pair`, `std::make_pair` | `IRIdentifier` (full name) | Entire qualified name becomes the identifier text |
| `type_identifier` | `MyStruct` (in expression) | `IRIdentifier` | User-defined type names in expression context |
| `primitive_type` | `int` (in cast like `sizeof(int)`) | `IRIdentifier` | |
| `sized_type_specifier` | `long long`, `unsigned int` | `IRIdentifier` | |
| `binary_expression` | `a + b`, `x && y`, `a \| b` | `IRBinaryExpression` | `operator` is the literal token text |
| `shift_expression` | `a << 3`, `cout << x` | `IRBinaryExpression` (operator: "<<") | Forwarded to same path; cout detected later |
| `unary_expression` | `!x`, `-n`, `~bits` | `IRUnaryExpression` | `operator` = `child(0).text`, `argument` = `child(1)` |
| `pointer_expression` | `*ptr`, `&x` | `IRUnaryExpression` | Same handler as unary; `*` and `&` are no-ops at runtime |
| `update_expression` | `i++`, `--j`, `++k` | `IRUpdateExpression` | `prefix` distinguishes pre/post |
| `assignment_expression` | `x = 5`, `arr[i] += 1` | `IRAssignment` | Elevated to statement or kept as expression |
| `subscript_expression` | `arr[i]`, `matrix[r][c]` | `IRSubscriptExpression` | Index extracted from `subscript_argument_list` if present |
| `field_expression` | `node.val`, `ptr->next` | `IRMemberExpression` | `arrow: true` for `->`, `false` for `.` |
| `call_expression` (method) | `v.push_back(x)`, `s.size()` | `IRMethodCall` | Detected when `callee` is a `field_expression` |
| `call_expression` (function) | `sort(...)`, `max(a,b)` | `IRFunctionCall` | Template params stripped: `sort<int>` → `"sort"` |
| `conditional_expression` | `a > b ? a : b` | `IRTernaryExpression` | `namedChildren[0,1,2]` = condition, consequent, alternate |
| `initializer_list` | `{1, 2, 3}`, `{{1,0},{-1,0}}` | `IRInitializerList` | Nested lists produce nested arrays |
| `new_expression` | `new TreeNode(5)` | `IRNewExpression` | `typeName` from first named child, `arguments` from `argument_list` |
| `lambda_expression` | `[](int x){ return x; }` | `IRLambdaExpression` | Parameters extracted via `extractParams` recursive walk |
| `cast_expression` | `(int)x`, `(double)n` | `IRFunctionCall("trunc",...)` or `IRExpression` | `(int)` → trunc call; others strip cast |
| `parenthesized_expression` | `(a + b)` | *(inner expression)* | Transparent passthrough |
| `template_function` | `make_pair<int,int>(a,b)` | `IRFunctionCall` (callee: "make_pair") | Template params stripped from callee name |

---

### 9.4 Declarator Nodes (within declarations)

These nodes appear **inside** declaration nodes and are handled by `buildVariableDeclaration` and `getDeclaratorName`:

| Tree-sitter type | C++ Example | Handling |
|---|---|---|
| `init_declarator` (with `=`) | `int x = 5` | Sets `initializer` field |
| `init_declarator` (with `argument_list`) | `vector<int> v(n, 0)` | Sets `constructorArgs` field |
| `function_declarator` | `vector<int> v(n)` | **Misparse recovery:** extracted as `constructorArgs` |
| `pointer_declarator` | `int* ptr` | Pierced via `getDeclaratorName` recursion |
| `reference_declarator` | `int& ref` | Sets `isReference: true` on parameter; name extracted |
| `array_declarator` | `int arr[10]` | Appends `[]` to type; name extracted from child |

---

### 9.5 Special Parsing Cases & Their C++ Triggers

The following table documents **surprising Tree-sitter behaviors** that require special handling in `IRBuilder`:

#### Case A: `function_declarator` Misparse

**C++ code:** `vector<int> v(n);`

**Expected parse:** `init_declarator` with `argument_list`

**Actual parse:** Tree-sitter sometimes produces:
```
declaration
  ├── template_type: "vector<int>"
  └── function_declarator
        ├── identifier: "v"
        └── parameter_list
              └── parameter_declaration
                    ├── primitive_type: "int"
                    └── identifier: "n"
```

Tree-sitter confuses the constructor call `v(n)` with a function declaration `v` taking parameter `int n`. The `IRBuilder` detects `function_declarator` and extracts `n` from the `parameter_list` as a `constructorArgs` argument:

```typescript
else if (declaratorNode.type === "function_declarator") {
  const nameNode = declaratorNode.child(0);
  name = this.getDeclaratorName(nameNode);
  const paramList = declaratorNode.namedChildren.find(c =>
    c.type === "parameter_list" || c.type === "argument_list"
  );
  if (paramList) {
    for (const param of paramList.namedChildren) {
      if (param.type === "parameter_declaration") {
        // Extract identifier "n" from "int n"
        const lastChild = param.namedChildren[param.namedChildren.length - 1];
        rawArgs.push(this.buildExpression(lastChild));
      }
    }
  }
}
```

**Result:** `IRVariableDeclaration { name: "v", constructorArgs: [IRIdentifier("n")] }`

---

#### Case B: `condition_clause` vs `parenthesized_expression`

**C++ code:** `while (i < n)` vs `if (x > 0)`

Depending on the tree-sitter-cpp grammar version, the condition may be wrapped in a `condition_clause` node or directly in a `parenthesized_expression`. Both are handled:

```typescript
let conditionNode = node.namedChildren.find(c =>
  c.type === "condition_clause" || c.type === "parenthesized_expression"
);
if (conditionNode.type === "condition_clause") {
  conditionNode = conditionNode.namedChildren[0];  // Unwrap
}
```

---

#### Case C: Inline Single-Statement Bodies

**C++ code:**
```cpp
if (x > 0) return x;     // No braces
for (int i = 0; i < n; i++) arr[i] = i;  // No braces
```

Tree-sitter does not wrap single-statement bodies in `compound_statement`. The `wrapInBlock` helper normalizes these:

```typescript
private wrapInBlock(n: SyntaxNode): IRBlock {
  if (n.type === "compound_statement") return this.buildBlock(n);
  // Inline statement: wrap in synthetic IRBlock
  const stmt = this.buildStatement(n);
  return {
    kind: "Block",
    line: n.startPosition.row + 1,
    statements: Array.isArray(stmt) ? stmt : [stmt]
  };
}
```

---

#### Case D: `subscript_argument_list` Wrapper

**Modern tree-sitter-cpp versions** wrap the subscript index in an intermediate `subscript_argument_list` node:

```
subscript_expression
  ├── identifier: "arr"
  └── subscript_argument_list   ← intermediate wrapper
        └── identifier: "i"
```

Handled in `buildSubscriptExpression`:
```typescript
let actualIndexNode = indexNode;
if (indexNode.type === "subscript_argument_list") {
  actualIndexNode = indexNode.namedChildren[0];  // Unwrap
}
```

---

#### Case E: Nested Binary `<<` for `cout` Chaining

**C++ code:** `cout << a << " " << b << endl;`

**Tree-sitter parse:**
```
shift_expression
  ├── shift_expression
  │     ├── shift_expression
  │     │     ├── shift_expression
  │     │     │     ├── identifier: "cout"
  │     │     │     ├── "<<"
  │     │     │     └── identifier: "a"
  │     │     ├── "<<"
  │     │     └── string_literal: " "
  │     ├── "<<"
  │     └── identifier: "b"
  ├── "<<"
  └── identifier: "endl"
```

`buildExpressionStatement` traverses left-recursively to detect `cout`, then **unwinds rightward** collecting arguments:

```typescript
while (current.type === "shift_expression" || ...) {
  args.unshift(this.buildExpression(current.child(2)));  // right child
  current = current.child(0) as SyntaxNode;              // go deeper left
}
// Result: args = [a, " ", b, endl]
```

---

#### Case F: `qualified_identifier` for `std::` Namespaces

**C++ code:** `std::sort(v.begin(), v.end());`

Tree-sitter produces:
```
call_expression
  ├── qualified_identifier: "std::sort"
  └── argument_list: ...
```

`buildExpression` treats the entire `qualified_identifier` as a single `IRIdentifier` with name `"std::sort"`. In `invokeFunctionCall`, the `std::` prefix is stripped:

```typescript
if (calleeName.startsWith("std::")) calleeName = calleeName.slice(5);
```

So `std::sort` → `sort`, `std::make_pair` → `make_pair`, etc.

---

#### Case G: `ERROR` Nodes

When Tree-sitter encounters syntax it cannot parse (e.g., complex C++ templates, SFINAE), it produces `ERROR` nodes. The `IRBuilder` throws a descriptive error:

```typescript
case "ERROR":
  throw new Error(
    `Syntax Error at line ${node.startPosition.row + 1}: ` +
    `Unrecognized expression structure. Tree-Sitter occasionally fails ` +
    `on ambiguous pointer syntax or complex C++ template parameters.`
  );
```

At the **statement level**, `ERROR` nodes also throw. At the **expression level** in `buildExpression`, unknown types instead emit a warning and return a `null` literal to avoid cascading failures:

```typescript
default:
  console.warn(`[IRBuilder] Unsupported expression type '${node.type}'...`);
  return { kind: "Literal", valueType: "nullptr", value: null };
```

---

## 10. Appendix: EventType Reference

The `EventEmitter` emits these event types during execution. Each is consumed by the React frontend's snapshot system.

| EventType | When emitted | Key payload fields |
|---|---|---|
| `DECLARE` | A variable is allocated in scope | `variable`, `type`, `value` |
| `ASSIGNMENT` | A variable or subscript is mutated | `variable` (or `target`), `value` |
| `ASSIGN` | *(deprecated alias for ASSIGNMENT)* | Same as ASSIGNMENT |
| `READ` | A variable is read from scope | `variable`, `value` |
| `WRITE` | `cout` or `printf` produces output | `output` (string) |
| `CONDITION` | An `if`, `while`, `for`, or `switch` condition is evaluated | `result` (boolean) |
| `LOOP_ENTER` | A loop block is entered for the first time | `loopType` ("for" / "while" / "do-while" / "for-range") |
| `LOOP_ITERATION` | A subsequent loop iteration begins | `iteration` (1-based counter) |
| `LOOP_EXIT` | A loop terminates (condition false or break) | `loopType` |
| `FUNCTION_CALL` | A function frame is pushed to the call stack | `function` (name), `args` |
| `FUNCTION_RETURN` | A function frame is popped from the call stack | `function` (name), `returnValue` |

> **Implementation note on duplicate events:** Some operations emit both a `FUNCTION_CALL` and `FUNCTION_RETURN` in rapid succession within a single native intercept (e.g., `std::swap`, `std::reverse`). These are intentional — they represent the call and return of the polyfilled function even though no actual JS call stack frame was pushed. The React frontend uses them to display the function call in the visualizer timeline.

---

## 11. Lambda Expressions & Closures

**C++ behavior:** Lambdas (`[captures](args) { body }`) are anonymous functions that can capture variables from their enclosing scope.

**Internal mechanics:**
Tree-sitter parses lambdas as `lambda_expression`. The `IRBuilder` translates this into an `IRLambdaExpression` node, which functions similarly to an `IRFunctionDeclaration` but is treated as an expression.

```typescript
// Example IR processing for lambda
case "LambdaExpression":
  return expr; // Evaluator returns the AST node itself to be callable
```

When a lambda is passed to a function like `std::sort` or stored in a variable `auto f = ...`, the engine stores the `IRLambdaExpression` directly. 

When invoked:
1. **Scope Binding:** The engine pushes a new frame onto the `CallStack`.
2. **Closure Simulation:** To simulate `[&]` or `[=]` captures, the engine binds the lambda's execution environment to its parent's `ScopeManager`. Because the engine searches scopes from top to bottom, variables captured by reference (`[&]`) naturally fall through to the parent scope, allowing mutations to affect the original variables!
3. **Execution:** The `IRWalker` walks the lambda's body block and catches any `ReturnSignal` just like a normal function.

---

## 12. Struct Methods and `this` Pointers

**C++ behavior:** Structs and classes can have member functions. Inside these methods, `this` is a pointer to the calling instance.

**Internal mechanics:**
If a struct definition contains methods:
1. The `IRBuilder` registers the method ASTs inside the `IRStructDeclaration` blueprint.
2. When the object is instantiated via `new`, the engine attaches these functions to the resulting JS object.
3. **`this` Binding:** When a method is called (`node.update()`), `ExecutionEngine.invokeMethodCall` extracts the target object (`node`). It then injects a special variable `this` into the top of the local `ScopeManager` for that function call, pointing directly to the JS object reference of `node`.
4. **Implicit `this->` Resolution:** C++ allows calling `val` instead of `this->val`. If the `ExpressionEvaluator` encounters an undefined variable inside a struct method, it auto-recovers by checking if `this` exists in scope, and if so, checks if `this.val` exists, mapping it seamlessly!

---

## 13. Dynamic Memory Allocation (`new` and `delete`)

**C++ behavior:** `new` allocates memory on the heap and returns a pointer. `delete` frees it.

**Internal mechanics:**
Since JavaScript is garbage collected, the engine fakes heap management:
- **`new Type(args)`**: Intercepted by `ExpressionEvaluator`. Finds the struct blueprint, creates a JS object `{...}`, executes the constructor logic, and returns the JS object reference.
- **`new int[10]`**: Translated to `new Array(10).fill(0)`.
- **`delete ptr`**: In JS, you cannot explicitly free memory. The engine polyfills `delete` by simply ignoring it or setting the variable reference to `null`. The actual memory cleanup is delegated safely to the V8 JavaScript Garbage Collector once no scopes hold a reference to the object.

---

## 14. Template Metaprogramming Limitations

**What it means:** C++ uses `template <typename T>` to generate polymorphic code at compile time.

**Internal mechanics:**
The interpreter **completely ignores** C++ templates during execution.
Why? Because JavaScript is dynamically typed! 
- In C++, `vector<int>` and `vector<string>` generate two completely different binary classes. 
- In AlgoVisuals, `IRBuilder` strips the `<int>` and `<string>` tokens away. The engine simply initializes an empty JS Array `[]` for both. 
- As a result, C++ templates are visually validated by Tree-sitter for syntax highlighting, but mechanically irrelevant. You can write complex template headers, and the engine will bypass them, executing the underlying logic using duck-typing.

---

## 15. `cin`, `getline`, and `std::stringstream`

**C++ behavior:** Reading input from standard input or string buffers.

**Internal mechanics:**
- **`cin >> x;`**: The visualizer UI allows users to provide an "Input Payload" string. The engine tokenizes this string by whitespace into an array of strings. When `cin >> x` executes, it shifts the first token off the input array, attempts to cast it to `x`'s type (e.g., `parseInt` for `int`), and mutates `x` via `ScopeManager.assignVariable()`.
- **`getline(cin, str)`**: Shifts tokens until a newline `\n` is encountered, joining them into `str`.
- **`std::stringstream`**: Polyfilled as a virtual input array. `stringstream ss(text);` creates an object containing `text.split(" ")`. `ss >> var;` shifts from this internal array.

---

## 16. The Engine's Performance Overhead (Time/Space Complexity)

**What it means:** Why doesn't the interpreter run as fast as native C++?

**Internal mechanics:**
To visualize code, the engine must capture its state.
- **Time Complexity Overhead:** A native loop `for (int i=0; i<N; i++)` runs in $O(N)$. However, on every single iteration, `IRWalker` emits a `LOOP_ITERATION` event. The `EventEmitter` then triggers `createSnapshot()`, which deep-clones the entire `ScopeManager` (all variables, arrays, and objects in memory). Thus, the visualizer loop runs in $O(N \times M)$ where $M$ is the size of the active memory.
- **Iteration Limits:** To prevent the browser tab from crashing due to infinite loops or massive data cloning, the engine enforces a strict `MAX_LOOP_ITERATIONS = 100,000` hard limit.
- **Space Complexity:** Deep-cloning memory for thousands of execution steps creates a massive array of Snapshots. To optimize this, identical consecutive memory states are squashed, and primitives are copied by value, but huge matrices will quickly eat JS heap memory.

---

## 17. Stack Traces & Error Mapping

**What it means:** When code crashes, how does the error map back to the UI?

**Internal mechanics:**
Every `IRNode` generated by `IRBuilder` contains a `line: number` property extracted directly from Tree-sitter's `startPosition.row + 1`.

When the `ExpressionEvaluator` or `StatementExecutor` encounters an invalid state (e.g., `Division by zero`, `Cannot subscript a null reference`), it throws a standard JavaScript `Error`:
```typescript
throw new Error(`Memory Access Violation at line ${expr.line}: Attempted to write property '${memNode.property}' on a null reference.`);
```
The overarching `try/catch` block in the React UI intercepts this error, parses the `line` number using Regex, and highlights that exact line in Red inside the Monaco Code Editor, displaying the custom error message in the terminal.

---

## 18. Type Casting & Coercion

**C++ behavior:** C++ enforces strict type casting like `(int)x`, `static_cast<int>(x)`, or `reinterpret_cast<void*>(x)`.

**Internal mechanics:**
Because all numbers in JavaScript are 64-bit floats, explicit type boundaries (like `short` vs `int` vs `long long`) do not strictly exist in memory.
- **C-Style Casts (`(int)x`):** The `IRBuilder` parses the `cast_expression`, completely ignores the type being casted to, and simply evaluates the inner expression `x`. If the target is an integer type, the `ExpressionEvaluator` applies `Math.trunc()` to strip decimals.
- **C++ Style Casts (`static_cast<int>(x)`):** Similarly, Tree-sitter parses `static_cast` as a template function call. The engine ignores the `<int>` template, evaluates `x`, and applies the necessary truncation.
- **`reinterpret_cast` / `dynamic_cast`:** These are practically no-ops in AlgoVisuals. Since pointers are faked, reinterpreting memory blocks is unsupported and simply returns the original object reference.

---

## 19. Multidimensional Arrays & Matrices

**C++ behavior:** Competitive programmers frequently use matrices like `int grid[10][10];` or `vector<vector<int>> grid(10, vector<int>(10, 0));`.

**Internal mechanics:**
- **Static Matrices (`int grid[10][10];`):** When the engine encounters consecutive array declarators, it translates them into nested JS arrays. It recursively builds `new Array(10).fill(0).map(() => new Array(10).fill(0))`.
- **Vector Matrices (`vector<vector<int>> grid(n, vector<int>(m, 0));`):** The `IRBuilder` struggles with nested templates in constructor arguments. However, because `ExecutionEngine` auto-recovers array indexing, if you initialize `grid` as an empty array and `push_back` rows into it, it works flawlessly. If a user writes `grid[i][j] = 1;` and `grid[i]` is undefined, the Auto-Recovery system intercepts the error, initializes `grid[i] = []`, and assigns the value!

---

## 20. Function Overloading Limitations

**C++ behavior:** C++ allows multiple functions with the same name as long as their parameters differ (e.g., `void solve(int a)` and `void solve(double a)`).

**Internal mechanics:**
JavaScript does not support function overloading. 
When the `ExecutionEngine.loadProgram()` registers functions, it uses a `Map<string, IRFunctionDeclaration>` keyed purely by the **function name**.
- **Limitation:** If you declare two functions named `solve`, the interpreter will overwrite the first one. The second declaration becomes the only globally accessible `solve` function.
- **Workaround:** Competitive programmers typically do not overload functions in single-file contest submissions. If necessary, use default parameters (`void solve(int a, int b = 0)`) which the engine supports perfectly.

---

## 21. Recursion & Call Stack Limits

**C++ behavior:** Deep recursion (like DFS on a $10^5$ node graph) requires large stack memory and can cause Stack Overflow (Segfault).

**Internal mechanics:**
The interpreter manages its own `CallStack` array, independent of the V8 engine's internal call stack.
- **Recursion Depth:** Because we push plain JS objects onto our `CallStack` array, we do not hit the V8 `Maximum call stack size exceeded` error! You can comfortably recurse 100,000 levels deep.
- **Snapshot Overhead:** However, every recursive call emits a `FUNCTION_CALL` event and takes a snapshot. Visualizing $10^5$ recursive calls will freeze the frontend React UI. To protect the browser, the visualizer limits timeline playback to a reasonable number of chronological steps, though the background engine can calculate the full answer.

---

## 22. The Web Worker Integration

**What it means:** Why doesn't an infinite `while(true)` loop crash the entire browser window?

**Internal mechanics:**
The `ExecutionEngine` does not run on the main browser thread. It is compiled by Vite as a Web Worker (`engine.worker.js`).
1. The user clicks "Run". The main thread sends the C++ string to the Web Worker via `postMessage()`.
2. The Worker spins up `web-tree-sitter` (WASM), compiles the IR, and executes the `IRWalker`.
3. As the `EventEmitter` fires events (`ASSIGNMENT`, `LOOP_ITERATION`), the Worker pushes them into a buffer.
4. The Worker periodically sends batches of `RuntimeSnapshot` objects back to the main thread via `postMessage()`.
5. If the Worker detects a timeout or infinite loop (via the `MAX_LOOP_ITERATIONS` check), it gracefully halts and sends an `ERROR` payload. The main thread UI remains perfectly responsive and displays the breakpoint.

---

## 23. Global Variable Initialization Phase

**C++ behavior:** Global variables defined outside `main()` are initialized before `main()` executes.

**Internal mechanics:**
The engine handles globals meticulously to preserve scope isolation:
1. During Stage 3 (`loadProgram`), the engine isolates all top-level `IRVariableDeclaration` nodes.
2. It pushes a temporary, phantom stack frame called `__global_init__`.
3. It uses a temporary `StatementExecutor` to execute all global initializations (e.g., `int MAXN = 100000;`, `int dp[1005][1005];`).
4. These resolved values are dumped into a persistent `Map` called `globalVariables`.
5. The temporary frame is destroyed.
6. Whenever a *new* function is invoked (including `main`), the engine injects every variable from `globalVariables` into the base of the function's `ScopeManager`. This guarantees that global variables are universally accessible but safely isolated from JS prototype pollution.

---

## 24. Explicitly Unsupported C++ Features

For absolute transparency, here is a list of features the interpreter **will ignore or fail to execute**:

- **`goto` and Labels:** Jump labels are not parsed by the `IRBuilder`. Flow control must be managed by loops and functions.
- **Multithreading (`std::thread`, `std::mutex`):** The JS environment is strictly single-threaded. Concurrency libraries are unsupported.
- **File I/O (`std::ifstream`, `std::ofstream`):** `cin` and `cout` are redirected to virtual strings. Reading real files from the OS is impossible in the browser sandbox.
- **Inline Assembly (`__asm__`):** Hardware-level registers cannot be accessed.
- **`setjmp` / `longjmp`:** C-style non-local jumps bypass the strict `IRWalker` logic and are unsupported.
- **Virtual Function Polymorphism:** Dynamic dispatch (`virtual void func() = 0`) and v-table simulation for abstract classes is currently not polyfilled. Base structs are treated identically.

---

*End of FEATURES.md — Language Specification & Internal Mechanics*
*Generated from source: `ExecutionEngine.ts`, `ExpressionEvaluator.ts`, `StatementExecutor.ts`, `IRBuilder.ts`, `IRNode.ts`, `IRWalker.ts`, `ScopeManager.ts`, `SymbolTable.ts`, `CallStack.ts`, `EventEmitter.ts`, `helpers.ts`, `types.ts`*