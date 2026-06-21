import type { RuntimeSnapshot, ExecutionEvent, CppType, CppValue } from "../types";
import { CallStack } from "../runtime/CallStack";
import { ScopeManager } from "../runtime/ScopeManager";

// ============================================================================
// DEEP CLONE UTILITY
// JSON.parse(JSON.stringify(...)) silently drops Map, Set, and function values.
// This custom cloner handles all CppValue variants produced by the engine.
// ============================================================================

/**
 * Recursively deep-clones a CppValue, correctly serializing Map, Set, and mock
 * container objects (with a `.data` array) into plain serializable structures
 * so the React frontend can render them without seeing empty `{}` objects.
 */
export function deepCloneCppValue(value: any): any {
  if (value === null || value === undefined) return value;
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "string") return value;
  if (typeof value === "function") return "[Function]";

  // Prevent internal execution engine scope objects from leaking into snapshots
  if (typeof value === "object" && "__ref" in value) {
    return `&${value.__ref}`;
  }

  // std::map / std::unordered_map polyfill — serialize to plain object for display
  if (value instanceof Map) {
    const obj: Record<string, any> = {};
    value.forEach((v: any, k: any) => {
      obj[String(k)] = deepCloneCppValue(v);
    });
    return obj;
  }

  // std::set / std::unordered_set polyfill — serialize to plain array for display
  if (value instanceof Set) {
    return Array.from(value).map(deepCloneCppValue);
  }

  // Native JS arrays (e.g., direct int[] parameters)
  if (Array.isArray(value)) {
    return value.map(deepCloneCppValue);
  }

  // Mock STL container objects (vector, stack, queue, deque, list) — only clone `.data`
  if (typeof value === "object" && "data" in value && Array.isArray(value.data)) {
    return {
      __type: "container",
      data: (value.data as any[]).map(deepCloneCppValue),
    };
  }

  // Plain objects (structs, tree nodes, pair-tuples)
  if (typeof value === "object") {
    const clone: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      const v = value[key];
      // Skip method properties to keep the snapshot lean
      if (typeof v !== "function") {
        clone[key] = deepCloneCppValue(v);
      }
    }
    return clone;
  }

  return value;
}

/**
 * Serializes a complete freeze-frame of the execution engine at a specific step.
 * Uses a type-aware deep clone (instead of JSON round-trip) to correctly capture
 * Map, Set, and mock container values for the React visualizer.
 */
export function createSnapshot(
  event: ExecutionEvent,
  callStack: CallStack,
  activeScopeManager: ScopeManager
): RuntimeSnapshot {
  
  const rawVariables = activeScopeManager.captureState();
  const variables: Record<string, { name: string; type: CppType; value: CppValue }> = {};

  for (const [key, symbol] of Object.entries(rawVariables)) {
    variables[key] = {
      name: symbol.name,
      type: symbol.type,
      value: deepCloneCppValue(symbol.value) as CppValue,
    };
  }
  
  return {
    step: event.step,
    line: event.line,
    event: {
      type: event.type,
      payload: deepCloneCppValue(event.payload),
    },
    state: {
      variables,
      callStack: callStack.getTrace(),
      scopeDepth: activeScopeManager.getDepth(),
    },
  };
}

// ============================================================================
// CONTROL FLOW JUMP SIGNALS
// Utilizes custom JS Error classes to simulate C++ branching (return, break).
// When thrown, these bubble through the walker and are caught by structural boundaries.
// Object.setPrototypeOf is required to fix instanceof checks in transpiled/bundled
// environments where the prototype chain may be broken by class compilation.
// ============================================================================

/**
 * Thrown upon execution of a `return` statement. 
 * Carries the evaluated payload to be intercepted by the ExecutionEngine.
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
 * Thrown upon execution of a `break` statement.
 * Intercepted by the nearest loop construct (For/While/DoWhile/ForRange) in the IRWalker.
 */
export class BreakSignal extends Error {
  constructor() {
    super("BreakSignal");
    Object.setPrototypeOf(this, BreakSignal.prototype);
  }
}

/**
 * Thrown upon execution of a `continue` statement.
 * Forces the nearest loop construct to instantly proceed to its update/condition phase.
 */
export class ContinueSignal extends Error {
  constructor() {
    super("ContinueSignal");
    Object.setPrototypeOf(this, ContinueSignal.prototype);
  }
}