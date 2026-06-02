// src/interpreter/runtime/CallStack.ts
import { ScopeManager } from "./ScopeManager";

/**
 * A StackFrame represents a single function call (like `main()` or `bubbleSort()`).
 * The most important thing here is that every frame gets its completely own, 
 * brand-new ScopeManager. This isolates memory so `factorial(5)` doesn't accidentally 
 * overwrite the variables inside `factorial(4)`.
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
 * Keeps track of who called who. 
 * E.g., main -> bubbleSort -> swap
 */
export class CallStack {
  private frames: StackFrame[];

  constructor() {
    this.frames = [];
  }

  public push(functionName: string): StackFrame {
    const frame = new StackFrame(functionName);
    this.frames.push(frame);
    return frame;
  }

  public pop(): StackFrame {
    if (this.isEmpty()) {
      throw new Error("Call stack underflow. Tried to return from a function that doesn't exist.");
    }
    // When we pop a frame, the garbage collector eats its ScopeManager. Memory cleared!
    return this.frames.pop() as StackFrame;
  }

  public peek(): StackFrame {
    if (this.isEmpty()) {
      throw new Error("Call stack is empty.");
    }
    return this.frames[this.frames.length - 1];
  }

  public isEmpty(): boolean {
    return this.frames.length === 0;
  }

  /**
   * Gives the React UI a simple string array of the current stack.
   * E.g., ["main", "factorial", "factorial", "factorial"]
   */
  public getTrace(): string[] {
    return this.frames.map((frame) => frame.functionName);
  }
}