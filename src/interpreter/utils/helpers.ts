import type { RuntimeSnapshot, ExecutionEvent, CppType, CppValue } from "../types";
import { CallStack } from "../runtime/CallStack";
import { ScopeManager } from "../runtime/ScopeManager";

/**
 * Serializes a complete freeze-frame of the execution engine at a specific step.
 * Performs a deep copy via JSON serialization to ensure historical immutability,
 * allowing the React UI to rewind/fast-forward without corrupting state.
 */
export function createSnapshot(
  event: ExecutionEvent,
  callStack: CallStack,
  activeScopeManager: ScopeManager
): RuntimeSnapshot {
  
  // Serialize the nested Symbol records into a safe UI format
  const variables = JSON.parse(
    JSON.stringify(activeScopeManager.captureState())
  ) as Record<string, { name: string; type: CppType; value: CppValue }>;
  
  return {
    step: event.step,
    line: event.line,
    event: {
      type: event.type,
      payload: event.payload,
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
// When thrown, these bubbles through the walker and are caught by structural boundaries.
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
 * Intercepted by the nearest loop construct (For/While/ForRange) in the IRWalker.
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