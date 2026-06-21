import { ScopeManager } from "./ScopeManager";

/**
 * Represents a single execution frame within the call stack.
 * Encapsulates the execution context of a function invocation, ensuring 
 * memory isolation via a dedicated `ScopeManager`.
 */
export class StackFrame {
  public readonly functionName: string;
  public readonly scopeManager: ScopeManager;

  constructor(functionName: string) {
    this.functionName = functionName;
    this.scopeManager = new ScopeManager();
  }
}

/**
 * Manages the execution context hierarchy (Call Stack).
 * Tracks the active function calls, pushing frames upon invocation 
 * and popping them upon return, which inherently triggers garbage collection 
 * of the associated memory scopes.
 */
export class CallStack {
  private frames: StackFrame[];

  constructor() {
    this.frames = [];
  }

  /**
   * Pushes a new execution frame onto the stack for a function call.
   */
  public push(functionName: string): StackFrame {
    const frame = new StackFrame(functionName);
    this.frames.push(frame);
    return frame;
  }

  /**
   * Pops the active execution frame off the stack.
   * @throws {Error} If attempting to pop from an empty stack (Stack Underflow).
   */
  public pop(): StackFrame {
    if (this.isEmpty()) {
      throw new Error("Fatal: Call stack underflow. Attempted to return from a non-existent function context.");
    }
    return this.frames.pop() as StackFrame;
  }

  /**
   * Returns the currently active execution frame without popping it.
   */
  public peek(): StackFrame {
    if (this.isEmpty()) {
      throw new Error("Fatal: Call stack is empty. No active execution frame.");
    }
    return this.frames[this.frames.length - 1];
  }

  public isEmpty(): boolean {
    return this.frames.length === 0;
  }

  /**
   * Serializes the current call stack sequence for the visualizer frontend.
   * @returns An array of function names currently on the stack (e.g., ["main", "bubbleSort"]).
   */
  public getTrace(): string[] {
    return this.frames.map((frame) => frame.functionName);
  }
}