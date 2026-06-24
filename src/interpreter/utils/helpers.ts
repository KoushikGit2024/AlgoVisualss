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

  // Resolve pass-by-reference variables for the snapshot without leaking the scope manager
  if (typeof value === "object" && "__ref" in value) {
    const callerScope = value.__callerScope;
    if (callerScope && typeof callerScope.getVariable === 'function') {
      try {
        const symbol = callerScope.getVariable(value.__ref);
        return {
          __ref: value.__ref,
          __resolved: deepCloneCppValue(symbol.value)
        };
      } catch (e) {
        return `&${value.__ref}`;
      }
    }
    return `&${value.__ref}`;
  }

  // std::map / std::unordered_map polyfill — serialize to array of tuples to preserve key types
  if (value instanceof Map) {
    const entries: [any, any][] = [];
    value.forEach((v: any, k: any) => {
      entries.push([deepCloneCppValue(k), deepCloneCppValue(v)]);
    });
    return {
      __type: "map",
      entries
    };
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
  
  const variables: Record<string, { name: string; type: CppType; value: CppValue }> = {};

  // Aggregate variables from all stack frames (bottom to top).
  // This allows the visualizer to retain context (like graph_edges) during recursive calls.
  // Inner scopes naturally overwrite outer scope variables with the same name.
  if (typeof callStack.getAllFrames === 'function') {
    for (const frame of callStack.getAllFrames()) {
      const rawVariables = frame.scopeManager.captureState();
      for (const [key, symbol] of Object.entries(rawVariables)) {
        variables[key] = {
          name: symbol.name,
          type: symbol.type,
          value: deepCloneCppValue(symbol.value) as CppValue,
        };
      }
    }
  } else {
    // Fallback if CallStack wasn't updated
    const rawVariables = activeScopeManager.captureState();
    for (const [key, symbol] of Object.entries(rawVariables)) {
      variables[key] = {
        name: symbol.name,
        type: symbol.type,
        value: deepCloneCppValue(symbol.value) as CppValue,
      };
    }
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

export function safeLog(label: string, obj: any, obj2?: any): void {
  // try {
  //   const seen = new WeakSet();
  //   const safeStr = JSON.stringify(obj, (key, value) => {
  //     if (typeof value === "object" && value !== null) {
  //       if (seen.has(value)) return "[Circular]";
  //       seen.add(value);
  //     }
  //     return value;
  //   }, 2);

  //   if (obj2 !== undefined) {
  //      const seen2 = new WeakSet();
  //      const safeStr2 = JSON.stringify(obj2, (k, v) => {
  //        if (typeof v === "object" && v !== null) {
  //          if (seen2.has(v)) return "[Circular]";
  //          seen2.add(v);
  //        }
  //        return v;
  //      }, 2);
  //      console.log(`${label}\n${safeStr}\n${safeStr2}`);
  //   } else {
  //      console.log(`${label}\n${safeStr}`);
  //   }
  // } catch (e) {
  //   console.log(label, obj, obj2);
  // }
  label&&obj&&obj2;
}