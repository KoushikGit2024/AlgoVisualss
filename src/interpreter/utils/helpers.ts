// ============================================================================
// helpers.ts — Shared utilities for the interpreter runtime.
//
// Contains three independent subsystems:
//
//   1. DEEP CLONE UTILITY (deepCloneCppValue)
//      Recursively serialises any CppValue into a plain, JSON-safe structure
//      that the React frontend can render. Handles Map, Set, mock containers,
//      pass-by-reference proxy objects, and JS closures stored as lambdas.
//
//   2. SNAPSHOT FACTORY (createSnapshot)
//      Assembles a complete RuntimeSnapshot from the current CallStack and
//      ScopeManager state. Aggregates variables across all active frames so
//      the UI retains outer-frame context during deep recursion.
//
//   3. CONTROL-FLOW JUMP SIGNALS
//      Custom Error subclasses used to simulate C++ branching semantics.
//      Thrown intentionally and caught by structural boundaries in IRWalker
//      and ExecutionEngine — they are never "real" errors.
//
//      Signal hierarchy:
//        ReturnSignal    → return <value>;        caught by invokeFunction
//        BreakSignal     → break;                 caught by loop / switch walker
//        ContinueSignal  → continue;              caught by loop walker
//        ThrowSignal     → throw <expr>;          caught by walkTryStatement
//        BreakpointSignal → debugger breakpoint   caught by ExecutionEngine.run()
//
// ============================================================================

import type { RuntimeSnapshot, ExecutionEvent, CppType, CppValue, SnapshotVariable, ThrowPayload } from "../types";
import { CallStack } from "../runtime/CallStack";
import { ScopeManager } from "../runtime/ScopeManager";


// ============================================================================
// SECTION 1 — DEEP CLONE UTILITY
// ============================================================================

/**
 * Recursively deep-clones a CppValue into a plain, serialisable structure.
 *
 * Why not JSON.parse(JSON.stringify(...))?
 *   - `JSON.stringify` silently converts Map and Set to `{}` (empty object).
 *   - It drops all `function` values entirely, making lambda-holding variables
 *     vanish from the snapshot.
 *   - It cannot handle circular references (e.g. linked list nodes pointing
 *     back to themselves during construction).
 *
 * This custom cloner handles every CppValue variant the engine can produce:
 *
 *   Primitives      → identity copy (number, boolean, string, null, undefined)
 *   Functions       → replaced with the sentinel string "[Function]"
 *   __ref proxy     → resolved through callerScope and stored as
 *                     { __ref, __resolved } so the UI can show the alias
 *   Map             → { __type: "map", entries: [[k,v], ...] }
 *   Set             → plain Array.from(set)
 *   Array           → recursively cloned element-by-element
 *   Mock container  → { __type: "container", data: [...] }  (strips methods)
 *   Plain object    → shallow-key enumeration, skipping function properties
 *
 * @param value - Any CppValue produced by the execution engine.
 * @returns     A plain, JSON-safe clone suitable for the React frontend.
 */
export function deepCloneCppValue(value: any): any {
  // ── Primitives: copy by value ────────────────────────────────────────────
  if (value === null || value === undefined) return value;
  if (
    typeof value === "number"  ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) return value;

  // ── JS closures / lambdas: replace with a sentinel so the variable still
  //    appears in the snapshot panel rather than silently disappearing. ──────
  if (typeof value === "function") return "[Function]";

  // ── Pass-by-reference proxy: { __ref: "varName", __callerScope: Scope }
  //    Resolve to the current value of the aliased variable so the UI can
  //    show what the reference points to without leaking the ScopeManager. ──
  if (typeof value === "object" && "__ref" in value) {
    const callerScope = value.__callerScope;
    if (callerScope && typeof callerScope.getVariable === "function") {
      try {
        const symbol = callerScope.getVariable(value.__ref);
        return {
          __ref:      value.__ref,
          __resolved: deepCloneCppValue(symbol.value),
        };
      } catch {
        // Variable no longer in scope (e.g. caller frame was already popped).
        return `&${value.__ref}`;
      }
    }
    return `&${value.__ref}`;
  }

  // ── std::map / std::unordered_map: serialise to an array of [key, value]
  //    tuples so that non-string keys (e.g. int, pair) are preserved.
  //    The React frontend checks __type === "map" to render a table. ─────────
  if (value instanceof Map) {
    const entries: [any, any][] = [];
    value.forEach((v: any, k: any) => {
      entries.push([deepCloneCppValue(k), deepCloneCppValue(v)]);
    });
    return { __type: "map", entries };
  }

  // ── std::set / std::unordered_set: flatten to a plain array. ─────────────
  if (value instanceof Set) {
    return Array.from(value).map(deepCloneCppValue);
  }

  // ── Plain JS arrays (raw C-style arrays, pairs, tuples, InitializerLists).─
  if (Array.isArray(value)) {
    return value.map(deepCloneCppValue);
  }

  // ── Mock STL containers (vector, stack, queue, deque, list, priority_queue)
  //    produced by StatementExecutor.createMockContainer().
  //    These objects have a `.data` array AND several function-valued methods
  //    (push_back, pop, etc.). We only clone `.data` to keep snapshots lean. ─
  if (
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as Record<string, any>).data)
  ) {
    return {
      __type: "container",
      data: (value.data as any[]).map(deepCloneCppValue),
    };
  }

  // ── Plain objects: struct instances, tree/list nodes, pair-tuples.
  //    Enumerate own keys and skip any function-valued properties so that
  //    method-bearing objects (e.g. ones with .toString overrides) don't
  //    bloat the snapshot with "[Function]" entries for every method. ────────
  if (typeof value === "object") {
    const clone: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      const prop = (value as Record<string, any>)[key];
      if (typeof prop !== "function") {
        clone[key] = deepCloneCppValue(prop);
      }
    }
    return clone;
  }

  // Fallback: return as-is for any exotic type not covered above.
  return value;
}

/**
 * Deep clones a CppValue for RUNTIME execution (unlike deepCloneCppValue which
 * is used to produce serialisable UI snapshots).
 *
 * This cloner preserves mock container methods, actual Map/Set objects, and
 * closures, while deeply cloning the underlying data structures. This ensures
 * that C++ pass-by-value and assignment semantics are respected.
 */
export function cloneRuntimeValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val !== "object") return val;

  // Do not clone pass-by-reference proxies.
  if ("__ref" in val) return val;

  // Mock STL Containers (vector, priority_queue, etc.)
  // These objects mix a `data` array with prototype-less method functions.
  if ("data" in val && Array.isArray(val.data) && "push_back" in val) {
    const clone: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      if (key === "data") {
        clone.data = val.data.map((item: any) => cloneRuntimeValue(item));
      } else if (typeof val[key] === "function") {
        clone[key] = val[key]; // Preserve method references.
      } else {
        clone[key] = val[key]; // Primitives (__isHeap, __cmp, etc).
      }
    }
    return clone;
  }

  // Plain JS Arrays (e.g. tuples, InitializerLists).
  if (Array.isArray(val)) {
    return val.map((item) => cloneRuntimeValue(item));
  }

  // std::map / std::unordered_map
  if (val instanceof Map) {
    const clone = new Map();
    val.forEach((v, k) => clone.set(cloneRuntimeValue(k), cloneRuntimeValue(v)));
    return clone;
  }

  // std::set / std::unordered_set
  if (val instanceof Set) {
    const clone = new Set();
    val.forEach((v) => clone.add(cloneRuntimeValue(v)));
    return clone;
  }

  // Struct instances or plain objects.
  const clone: Record<string, any> = {};
  for (const key of Object.keys(val)) {
    if (typeof val[key] !== "function") {
      clone[key] = cloneRuntimeValue(val[key]);
    } else {
      clone[key] = val[key]; // Preserve method references if any.
    }
  }
  return clone;
}


// ============================================================================
// SECTION 2 — SNAPSHOT FACTORY
// ============================================================================

/**
 * Serialises a complete freeze-frame of the execution engine at a single step.
 *
 * Variable aggregation strategy:
 *   Iterates all CallStack frames from bottom (root / global) to top (active).
 *   Inner frames overwrite outer frames for variables with the same name,
 *   which correctly models C++ variable shadowing in the visualiser.
 *   Retaining all frames (not just the active one) means the UI continues to
 *   show graph adjacency lists, DP tables, etc. even during deep recursion
 *   into a helper function that doesn't know about those variables.
 *
 * Output accumulation:
 *   The optional `accumulatedOutput` parameter carries the full stdout string
 *   produced so far in the current run. It is appended to the snapshot so the
 *   React terminal panel can display the complete output at any step without
 *   replaying all WRITE events itself.
 *
 * @param event              - The execution event that triggered this snapshot.
 * @param callStack          - The current call stack (all frames).
 * @param activeScopeManager - The scope manager of the top-most frame.
 * @param accumulatedOutput  - Full stdout string accumulated so far (optional).
 * @returns                    A complete RuntimeSnapshot ready for the frontend.
 */
export function createSnapshot(
  event:              ExecutionEvent,
  callStack:          CallStack,
  activeScopeManager: ScopeManager,
  accumulatedOutput?: string,
): RuntimeSnapshot {

  const variables: Record<string, SnapshotVariable> = {};

  // ── Aggregate variables across every active frame (bottom → top). ─────────
  if (typeof callStack.getAllFrames === "function") {
    for (const frame of callStack.getAllFrames()) {
      const rawVariables = frame.scopeManager.captureState();
      for (const [key, symbol] of Object.entries(rawVariables)) {
        // Skip internal engine symbols injected for reference proxies.
        if (key.startsWith("__")) continue;

        variables[key] = {
          name:  symbol.name,
          type:  symbol.type as CppType,
          value: deepCloneCppValue(symbol.value) as CppValue,
        };
      }
    }
  } else {
    // Fallback path: CallStack.getAllFrames() not available (older engine build).
    // Debug note: This branch should never fire in production; if it does,
    // check that CallStack was imported from the correct module path.
    console.warn("[createSnapshot] CallStack.getAllFrames() unavailable — falling back to active scope only.");
    const rawVariables = activeScopeManager.captureState();
    for (const [key, symbol] of Object.entries(rawVariables)) {
      if (key.startsWith("__")) continue;
      variables[key] = {
        name:  symbol.name,
        type:  symbol.type as CppType,
        value: deepCloneCppValue(symbol.value) as CppValue,
      };
    }
  }

  return {
    step: event.step,
    line: event.line,
    event: {
      type:    event.type,
      payload: deepCloneCppValue(event.payload) as Record<string, unknown>,
    },
    state: {
      variables,
      callStack:  callStack.getTrace(),
      scopeDepth: activeScopeManager.getDepth(),
      // Only include the output field when there is something to show, keeping
      // snapshot objects lean for steps that produce no output.
      ...(accumulatedOutput !== undefined && accumulatedOutput !== ""
        ? { output: accumulatedOutput }
        : {}),
    },
  };
}


// ============================================================================
// SECTION 3 — CONTROL-FLOW JUMP SIGNALS
// ============================================================================
//
// All signals extend Error so they can propagate through the JavaScript call
// stack via throw/catch without any special runtime support.
//
// Object.setPrototypeOf() is called in every constructor to fix instanceof
// checks in environments where TypeScript compiles classes to ES5 functions.
// Without it, `e instanceof ReturnSignal` can return false even when `e` was
// constructed with `new ReturnSignal(...)`, because the prototype chain is
// broken by the compilation target.
//
// DO NOT add business logic to these classes. They are pure control-flow
// vehicles; keep them as thin as possible so catch clauses stay fast.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Thrown by StatementExecutor.executeReturn() when a C++ `return` statement
 * is executed. Carries the evaluated return value to ExecutionEngine.invokeFunction(),
 * which catches it and treats it as the function's result.
 *
 * @example
 * // Inside invokeFunction's try block:
 * try { walker.walkBlock(func.body); }
 * catch (e) { if (e instanceof ReturnSignal) returnValue = e.value; else throw e; }
 */
export class ReturnSignal extends Error {
  public readonly value: CppValue;

  constructor(value: CppValue) {
    super("ReturnSignal");
    this.value = value;
    Object.setPrototypeOf(this, ReturnSignal.prototype);
  }
}


/**
 * Thrown by IRWalker.walkStatement() when a C++ `break` statement is executed.
 * Propagates up until caught by the nearest enclosing loop walker method
 * (walkWhileStatement, walkForStatement, etc.) or by walkSwitchStatement.
 *
 * Nesting note: A `break` inside a `switch` nested inside a `for` loop is
 * caught by walkSwitchStatement first, correctly exiting only the switch.
 * The `for` loop continues normally. This is the standard C++ break scoping rule.
 */
export class BreakSignal extends Error {
  constructor() {
    super("BreakSignal");
    Object.setPrototypeOf(this, BreakSignal.prototype);
  }
}


/**
 * Thrown by IRWalker.walkStatement() when a C++ `continue` statement is executed.
 * Caught by the nearest enclosing loop walker method, which skips the remainder
 * of the current iteration body and jumps to the update / condition-check phase.
 *
 * Not caught by walkSwitchStatement — `continue` inside a switch that is itself
 * inside a loop correctly skips to the next loop iteration.
 */
export class ContinueSignal extends Error {
  constructor() {
    super("ContinueSignal");
    Object.setPrototypeOf(this, ContinueSignal.prototype);
  }
}


/**
 * Thrown when a C++ `throw` statement is executed.
 *
 * Carries both the thrown CppValue and an optional C++ type name so that
 * `catch (SomeType e)` clauses can perform type-based matching in
 * IRWalker.walkTryStatement().
 *
 * Propagation:
 *   - If a matching `catch` clause exists in the current or enclosing
 *     try-block, walkTryStatement catches ThrowSignal and executes the
 *     catch body.
 *   - If no matching catch is found, ThrowSignal continues propagating up
 *     the JS call stack exactly like any uncaught exception, eventually
 *     surfacing as a runtime error in ExecutionEngine.run().
 *
 * @example C++ source:
 *   throw 42;                        → ThrowSignal { value: 42, typeName: "int" }
 *   throw std::runtime_error("msg"); → ThrowSignal { value: "msg", typeName: "std::runtime_error" }
 */
export class ThrowSignal extends Error {
  public readonly payload: ThrowPayload;

  constructor(payload: ThrowPayload) {
    super("ThrowSignal");
    this.payload = payload;
    Object.setPrototypeOf(this, ThrowSignal.prototype);
  }
}


/**
 * Thrown by IRWalker.walkStatement() when execution reaches a line that has
 * a registered — and enabled — breakpoint whose optional condition is truthy.
 *
 * Unlike the other signals, BreakpointSignal is caught at the top level in
 * ExecutionEngine.run() (or in a future step() method), not inside the walker.
 * This allows the engine to pause and expose the current snapshot to the UI
 * without discarding the call stack.
 *
 * The `line` field matches the source line so the UI can highlight it even
 * before the full snapshot is assembled.
 */
export class BreakpointSignal extends Error {
  public readonly line: number;

  constructor(line: number) {
    super("BreakpointSignal");
    this.line = line;
    Object.setPrototypeOf(this, BreakpointSignal.prototype);
  }
}