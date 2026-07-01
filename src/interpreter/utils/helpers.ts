// ============================================================================
// helpers.ts — Shared utilities for the interpreter runtime.
//
// Contains three independent subsystems:
//
//   1. DEEP CLONE UTILITY (deepCloneCppValue)
//      For SNAPSHOTS only — serialises any CppValue into a plain, JSON-safe
//      structure that the React frontend can render. This always deep-copies.
//
//   2. RUNTIME CLONE UTILITY (cloneRuntimeValue)
//      For EXECUTION — clones values that need value-semantics (containers,
//      primitives, arrays) while preserving JS object references for struct
//      instances so that pointer operations work correctly.
//
//      KEY CHANGE: Plain objects (struct instances) are NO LONGER cloned.
//      This restores correct pointer semantics:
//
//        Node* temp = head;     ← temp must point to head's actual object
//        temp->next = curr;     ← must mutate the original node in the list
//
//   3. CONTROL-FLOW JUMP SIGNALS
//      ReturnSignal, BreakSignal, ContinueSignal, ThrowSignal, BreakpointSignal
//
// ============================================================================

import type { RuntimeSnapshot, ExecutionEvent, CppType, CppValue, SnapshotVariable, ThrowPayload } from "../types";
import { CallStack } from "../runtime/CallStack";
import { ScopeManager } from "../runtime/ScopeManager";


// ============================================================================
// SECTION 1 — DEEP CLONE UTILITY  (for UI snapshots only — always deep-copies)
// ============================================================================

const globalIdMap = new WeakMap<any, number>();
let globalIdCounter = 1;

export function resetGlobalIdCounter() {
  globalIdCounter = 1;
}

function getObjectId(obj: any): string {
  if (!globalIdMap.has(obj)) {
    globalIdMap.set(obj, globalIdCounter++);
  }
  return globalIdMap.get(obj)!.toString();
}

export function deepCloneCppValue(rootValue: any): any {
  const isPrimitive = (val: any) => val === null || val === undefined || typeof val === "number" || typeof val === "boolean" || typeof val === "string";
  if (isPrimitive(rootValue)) return rootValue;
  if (rootValue.kind === "LambdaExpression") return "[Lambda]";
  if (typeof rootValue === "function") return "[Function]";

  const resultContainer: { val: any } = { val: undefined };
  
  type Task = {
    source: any;
    target: any;
    key: string | number;
    state: "enter" | "exit";
  };

  const stack: Task[] = [{ source: rootValue, target: resultContainer, key: "val", state: "enter" }];
  const seen = new Set<any>();

  while (stack.length > 0) {
    const task = stack.pop()!;

    if (task.state === "exit") {
      seen.delete(task.source);
      continue;
    }

    const val = task.source;

    if (isPrimitive(val)) {
      task.target[task.key] = val;
      continue;
    }
    if (val.kind === "LambdaExpression") {
      task.target[task.key] = "[Lambda]";
      continue;
    }
    if (typeof val === "function") {
      task.target[task.key] = "[Function]";
      continue;
    }

    if (seen.has(val)) {
      task.target[task.key] = { __circular_ref: getObjectId(val) };
      continue;
    }

    seen.add(val);
    stack.push({ source: val, target: null, key: "", state: "exit" });

    if (typeof val === "object" && "__ref" in val) {
      const callerScope = val.__callerScope;
      let resolved = false;
      if (callerScope && typeof callerScope.getVariable === "function") {
        try {
          const symbol = callerScope.getVariable(val.__ref);
          const refObj = { __ref: val.__ref, __resolved: undefined };
          task.target[task.key] = refObj;
          stack.push({ source: symbol.value, target: refObj, key: "__resolved", state: "enter" });
          resolved = true;
        } catch {}
      }
      if (!resolved) {
        task.target[task.key] = `&${val.__ref}`;
      }
      continue;
    }

    if (val instanceof Map) {
      const entries: [any, any][] = [];
      const mapObj = { __type: "map", entries };
      task.target[task.key] = mapObj;
      const valEntries = Array.from(val.entries());
      for (let i = valEntries.length - 1; i >= 0; i--) {
        const entryArr = [undefined, undefined];
        entries.unshift(entryArr as any);
        stack.push({ source: valEntries[i][1], target: entryArr, key: 1, state: "enter" });
        stack.push({ source: valEntries[i][0], target: entryArr, key: 0, state: "enter" });
      }
      continue;
    }

    if (val instanceof Set) {
      const arr: any[] = [];
      task.target[task.key] = arr;
      const values = Array.from(val.values());
      for (let i = values.length - 1; i >= 0; i--) {
        stack.push({ source: values[i], target: arr, key: i, state: "enter" });
      }
      continue;
    }

    if (Array.isArray(val)) {
      const arr: any[] = new Array(val.length);
      task.target[task.key] = arr;
      for (let i = val.length - 1; i >= 0; i--) {
        stack.push({ source: val[i], target: arr, key: i, state: "enter" });
      }
      continue;
    }

    if ("data" in val && Array.isArray(val.data)) {
      const arr: any[] = new Array(val.data.length);
      const containerObj = { __type: "container", data: arr };
      task.target[task.key] = containerObj;
      for (let i = val.data.length - 1; i >= 0; i--) {
        stack.push({ source: val.data[i], target: arr, key: i, state: "enter" });
      }
      continue;
    }

    // Plain object
    const clone: Record<string, any> = {};
    Object.defineProperty(clone, '__original_ref_id', {
      value: getObjectId(val),
      enumerable: true
    });
    task.target[task.key] = clone;
    
    const keys = Object.keys(val);
    for (let i = keys.length - 1; i >= 0; i--) {
      const k = keys[i];
      if (typeof val[k] !== "function") {
        stack.push({ source: val[k], target: clone, key: k, state: "enter" });
      }
    }
  }

  return resultContainer.val;
}


// ============================================================================
// SECTION 2 — RUNTIME CLONE UTILITY
// ============================================================================

/**
 * Clones a CppValue for RUNTIME execution, preserving pointer semantics.
 *
 * CRITICAL DESIGN DECISION — Struct instances (plain JS objects) are returned
 * AS-IS (same reference). This correctly models C++ pointer behavior:
 *
 *   C++:   Node* temp = head;   →  temp and head address the same memory
 *   JS:    temp = head;         →  temp and head reference the same object ✓
 *
 * Without this, every pointer assignment in linked-list / tree code would
 * operate on a stale copy, silently producing wrong results.
 *
 * What IS cloned (value semantics):
 *   - Mock STL containers (vector, stack, queue…)  ← copying a vector copies its data
 *   - Plain JS arrays  (C-style arrays, pairs as arrays)
 *   - Map / Set        (STL associative containers)
 *   - Primitives       (always copied by value in JS already)
 *
 * What is NOT cloned (reference / pointer semantics):
 *   - Plain objects     (struct / class instances accessed via pointer)
 *   - __ref proxies     (pass-by-reference markers)
 */
export function cloneRuntimeValue(val: any): any {
  if (val === null || val === undefined) return val;
  if (typeof val !== "object") return val;   // primitives copy by value automatically

  // Do not clone pass-by-reference proxies.
  if ("__ref" in val) return val;

  // ── Mock STL Containers (vector, priority_queue, stack, queue…) ──────────
  // These have a `.data` array AND prototype-less method functions.
  // Cloning gives value semantics: `vector<int> copy = original` is independent.
  if ("data" in val && Array.isArray(val.data) && "push_back" in val) {
    const clone: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      if (key === "data") {
        clone.data = val.data.map((item: any) => cloneRuntimeValue(item));
      } else if (typeof val[key] === "function") {
        clone[key] = val[key];           // Preserve method references.
      } else {
        clone[key] = val[key];           // Primitives (__isHeap, __cmp, etc.).
      }
    }
    return clone;
  }

  // ── Plain JS Arrays (C-style arrays, pairs/tuples stored as arrays) ───────
  if (Array.isArray(val)) {
    return val.map((item) => cloneRuntimeValue(item));
  }

  // ── std::map / std::unordered_map ─────────────────────────────────────────
  if (val instanceof Map) {
    const clone = new Map();
    val.forEach((v, k) => clone.set(cloneRuntimeValue(k), cloneRuntimeValue(v)));
    return clone;
  }

  // ── std::set / std::unordered_set ─────────────────────────────────────────
  if (val instanceof Set) {
    const clone = new Set();
    val.forEach((v) => clone.add(cloneRuntimeValue(v)));
    return clone;
  }

  // ── Struct instances (plain objects) — return the SAME JS reference ───────
  //
  // This is the KEY FIX for pointer-based code.
  //
  // In C++, when you write:
  //   Node* temp = head;
  // both `temp` and `head` hold the same memory address. Any write through
  // either pointer affects the single underlying Node object.
  //
  // JS objects are naturally reference-typed. Returning `val` unchanged lets
  // JS reference semantics do exactly what C++ pointer semantics require:
  //
  //   Node* temp = head;        ← temp IS head's JS object (not a copy) ✓
  //   temp->next = curr;        ← mutates the original node in the list   ✓
  //   head = prev;              ← changes head's binding, not temp's       ✓
  //
  // The only C++ feature this relaxes is passing a struct BY VALUE:
  //   void foo(Node n) { n.value = 99; }   ← would incorrectly affect caller
  // That pattern is extremely rare in algorithm code (pointers/refs are used
  // instead), so this tradeoff is safe for the interpreter's target use cases.
  return val;
}


// ============================================================================
// SECTION 3 — SNAPSHOT FACTORY
// ============================================================================

export function createSnapshot(
  event:              ExecutionEvent,
  callStack:          CallStack,
  activeScopeManager: ScopeManager,
  accumulatedOutput?: string,
): RuntimeSnapshot {

  const variables: Record<string, SnapshotVariable> = {};
  const perFrameVariables: Record<string, SnapshotVariable>[] = [];

  if (typeof callStack.getAllFrames === "function") {
    for (const frame of callStack.getAllFrames()) {
      const rawVariables = frame.scopeManager.captureState();
      const frameVars: Record<string, SnapshotVariable> = {};
      for (const [key, symbol] of Object.entries(rawVariables)) {
        if (key.startsWith("__")) continue;
        let val = symbol.value;
        const seen = new Set<any>();
        while (val && typeof val === "object" && "__ref" in val) {
          if (seen.has(val)) break;
          seen.add(val);
          const refName = val.__ref as string;
          const targetScope = val.__callerScope;
          val = targetScope.getVariable(refName).value;
        }

        const snapVar = {
          name:  symbol.name,
          type:  symbol.type as CppType,
          value: deepCloneCppValue(val) as CppValue,
        };
        variables[key] = snapVar;
        frameVars[key] = snapVar;
      }
      perFrameVariables.push(frameVars);
    }
  } else {
    console.warn("[createSnapshot] CallStack.getAllFrames() unavailable — falling back to active scope only.");
    const rawVariables = activeScopeManager.captureState();
    for (const [key, symbol] of Object.entries(rawVariables)) {
      if (key.startsWith("__")) continue;
      let val = symbol.value;
      const seen = new Set<any>();
      while (val && typeof val === "object" && "__ref" in val) {
        if (seen.has(val)) break;
        seen.add(val);
        const refName = val.__ref as string;
        const targetScope = val.__callerScope;
        val = targetScope.getVariable(refName).value;
      }

      variables[key] = {
        name:  symbol.name,
        type:  symbol.type as CppType,
        value: deepCloneCppValue(val) as CppValue,
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
      perFrameVariables,
      callStack:  callStack.getTrace(),
      scopeDepth: activeScopeManager.getDepth(),
      ...(accumulatedOutput !== undefined && accumulatedOutput !== ""
        ? { output: accumulatedOutput }
        : {}),
    },
  };
}


// ============================================================================
// SECTION 4 — CONTROL-FLOW JUMP SIGNALS
// ============================================================================

export class ReturnSignal extends Error {
  public readonly value: CppValue;
  constructor(value: CppValue) {
    super("ReturnSignal");
    this.value = value;
    Object.setPrototypeOf(this, ReturnSignal.prototype);
  }
}

export class BreakSignal extends Error {
  constructor() {
    super("BreakSignal");
    Object.setPrototypeOf(this, BreakSignal.prototype);
  }
}

export class ContinueSignal extends Error {
  constructor() {
    super("ContinueSignal");
    Object.setPrototypeOf(this, ContinueSignal.prototype);
  }
}

export class ThrowSignal extends Error {
  public readonly payload: ThrowPayload;
  constructor(payload: ThrowPayload) {
    super("ThrowSignal");
    this.payload = payload;
    Object.setPrototypeOf(this, ThrowSignal.prototype);
  }
}

export class BreakpointSignal extends Error {
  public readonly line: number;
  constructor(line: number) {
    super("BreakpointSignal");
    this.line = line;
    Object.setPrototypeOf(this, BreakpointSignal.prototype);
  }
}

// ============================================================================
// SECTION 4 — SHARED MOCK CONTAINER FACTORY
// ============================================================================

/**
 * Creates a generic Mock Container to back C++ vector/deque/etc structures in JS.
 * Used by StatementExecutor and ExecutionEngine for consistency.
 */
export function makeMockContainer(initialData: any[]): Record<string, any> {
  return {
    data: [...initialData],
    size() { return this.data.length; },
    empty() { return this.data.length === 0; },
    push_back(val: any) { this.data.push(val); return val; },
    pop_back() { return this.data.pop(); },
    clear() { this.data = []; },
    insert(pos: number, val: any) { this.data.splice(pos, 0, val); },
    erase(pos: number) { this.data.splice(pos, 1); },
    begin() { return 0; },
    end() { return this.data.length; },
    front() { return this.data[0]; },
    back() { return this.data[this.data.length - 1]; },
  };
}