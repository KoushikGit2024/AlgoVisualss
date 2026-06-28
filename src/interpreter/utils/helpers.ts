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

function getObjectId(obj: any): string {
  if (!globalIdMap.has(obj)) {
    globalIdMap.set(obj, globalIdCounter++);
  }
  return globalIdMap.get(obj)!.toString();
}

/**
 * Deep clones a CppValue for use in SNAPSHOTS.
 * It always makes full copies so the UI sees a stable frozen state at each step.
 * Do NOT use this for runtime value assignment — use cloneRuntimeValue instead.
 */
export function deepCloneCppValue(value: any, seen = new Set()): any {
  if (value === null || value === undefined) return value;
  if (
    typeof value === "number"  ||
    typeof value === "boolean" ||
    typeof value === "string"
  ) return value;

  if (typeof value === "function") return "[Function]";

  if (typeof value === "object") {
    if (seen.has(value)) {
      return { __circular_ref: getObjectId(value) };
    }
    seen.add(value);
  }

  if (typeof value === "object" && "__ref" in value) {
    const callerScope = value.__callerScope;
    if (callerScope && typeof callerScope.getVariable === "function") {
      try {
        const symbol = callerScope.getVariable(value.__ref);
        return {
          __ref:      value.__ref,
          __resolved: deepCloneCppValue(symbol.value, seen),
        };
      } catch {
        return `&${value.__ref}`;
      }
    }
    return `&${value.__ref}`;
  }

  if (value instanceof Map) {
    const entries: [any, any][] = [];
    value.forEach((v: any, k: any) => {
      entries.push([deepCloneCppValue(k, seen), deepCloneCppValue(v, seen)]);
    });
    return { __type: "map", entries };
  }

  if (value instanceof Set) {
    return Array.from(value).map(v => deepCloneCppValue(v, seen));
  }

  if (Array.isArray(value)) {
    return value.map(v => deepCloneCppValue(v, seen));
  }

  if (
    typeof value === "object" &&
    "data" in value &&
    Array.isArray((value as Record<string, any>).data)
  ) {
    return {
      __type: "container",
      data: (value.data as any[]).map(v => deepCloneCppValue(v, seen)),
    };
  }

  if (typeof value === "object") {
    const clone: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      const prop = (value as Record<string, any>)[key];
      if (typeof prop !== "function") {
        clone[key] = deepCloneCppValue(prop, seen);
      }
    }
    Object.defineProperty(clone, '__original_ref_id', {
      value: getObjectId(value),
      enumerable: true
    });
    return clone;
  }

  return value;
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

  if (typeof callStack.getAllFrames === "function") {
    for (const frame of callStack.getAllFrames()) {
      const rawVariables = frame.scopeManager.captureState();
      for (const [key, symbol] of Object.entries(rawVariables)) {
        if (key.startsWith("__")) continue;
        variables[key] = {
          name:  symbol.name,
          type:  symbol.type as CppType,
          value: deepCloneCppValue(symbol.value) as CppValue,
        };
      }
    }
  } else {
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