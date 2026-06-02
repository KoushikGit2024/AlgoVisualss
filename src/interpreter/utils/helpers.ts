// src/interpreter/utils/helpers.ts
import type { RuntimeSnapshot, ExecutionEvent, CppValue } from "../types";
import { CallStack } from "../runtime/CallStack";
import { ScopeManager } from "../runtime/ScopeManager";

/**
 * Grabs a complete freeze-frame of the execution engine at a specific microsecond.
 * We do a deep copy (JSON stringify) of the memory so the React UI can safely 
 * store history without accidentally mutating previous states!
 */
export function createSnapshot(
  event: ExecutionEvent,
  callStack: CallStack,
  activeScopeManager: ScopeManager
): RuntimeSnapshot {
  
  const variables = JSON.parse(JSON.stringify(activeScopeManager.captureState())) as Record<string, CppValue>;
  
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
// We use custom JS Error classes to simulate C++ jumps (return, break, continue).
// When one of these is "thrown", it bubbles up through the execution engine 
// and gets caught by the nearest loop or function boundary!
// ============================================================================

/**
 * Thrown when a `return` statement is hit. Carries the return value back to the caller.
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
 * Thrown when a `break;` statement is hit.
 */
export class BreakSignal extends Error {
  constructor() {
    super("BreakSignal");
    Object.setPrototypeOf(this, BreakSignal.prototype);
  }
}

/**
 * Thrown when a `continue;` statement is hit.
 */
export class ContinueSignal extends Error {
  constructor() {
    super("ContinueSignal");
    Object.setPrototypeOf(this, ContinueSignal.prototype);
  }
}