// ============================================================================
// CallStack.ts — The execution call stack and individual frame containers.
//
// Contains two classes:
//
//   StackFrame   — A single function invocation context. Owns a ScopeManager
//                  that holds all variables for that function call. Immutable
//                  after construction: only the ScopeManager's contents change.
//
//   CallStack    — A stack of StackFrames. Manages push/pop lifecycle, enforces
//                  a configurable recursion-depth limit to prevent browser tab
//                  hangs from infinite recursion, and exposes introspection
//                  methods used by the snapshot system and the debugger.
//
// Relationship to other components:
//   - ExecutionEngine.invokeFunction() calls push() before executing a function
//     body and pop() (in a finally block) after it returns or throws.
//   - createSnapshot() in helpers.ts calls getAllFrames() to aggregate variables
//     across the entire call stack for the React frontend.
//   - The debugger's call-stack panel reads getTrace() and getDetailedTrace().
//
// What this class does NOT do:
//   - Scope-chain management (ScopeManager's responsibility).
//   - Variable lookup or mutation (ScopeManager / SymbolTable).
//   - Snapshot serialisation (helpers.createSnapshot).
// ============================================================================

import { ScopeManager } from "./ScopeManager";


// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Default maximum call-stack depth before the engine aborts with a
 * descriptive StackOverflowError.
 *
 * Rationale for 10,000:
 *   - Enough for deeply recursive algorithms (merge sort on 2^13 elements,
 *     DFS on graphs with ~5,000 nodes) without hitting the limit legitimately.
 *   - Low enough to abort runaway mutual recursion before the JS engine's own
 *     "Maximum call stack size exceeded" RangeError fires, which would surface
 *     as an opaque crash rather than a friendly engine message.
 *
 * Override via CallStack constructor or setMaxDepth() for testing.
 */
const DEFAULT_MAX_RECURSION_DEPTH = 10_000;


// ─── StackOverflowError ───────────────────────────────────────────────────────

/**
 * Thrown by CallStack.push() when the active frame count exceeds maxDepth.
 *
 * Extends Error (not a control-flow signal) because stack overflow is a fatal
 * runtime condition, not a structured C++ jump. ExecutionEngine.run() does not
 * catch this — it propagates to the top-level caller as an execution failure.
 *
 * The `depth` field allows the UI to display the recursion depth at the point
 * of overflow, and `trace` carries the last N function names on the stack so
 * the user can identify the recursive call chain.
 */
export class StackOverflowError extends Error {
  public readonly depth: number;
  public readonly trace: string[];

  constructor(depth: number, trace: string[]) {
    super(
      `Stack Overflow: Recursion depth exceeded ${depth} frames. ` +
      `Last calls: ${trace.slice(-8).join(" → ")}. ` +
      `Check for infinite or missing base-case recursion.`
    );
    this.depth = depth;
    this.trace = trace;
    Object.setPrototypeOf(this, StackOverflowError.prototype);
  }
}


// ─── StackFrame ───────────────────────────────────────────────────────────────

/**
 * A single function-invocation context on the call stack.
 *
 * Every time ExecutionEngine.invokeFunction() is called — whether for a
 * user-defined function, a lambda, or the synthetic "__global_init__" frame —
 * a new StackFrame is created and pushed onto the CallStack.
 *
 * The frame is immutable after construction. Only the ScopeManager's internal
 * state (variables, scope depth) changes during execution.
 *
 * Fields:
 *   functionName — The C++ function name as it appears in source. Used in
 *                  stack traces and the React call-stack panel. Special names:
 *                    "__global_init__"  → global variable initialisation phase
 *                    "<lambda>"         → anonymous lambda invocation
 *
 *   scopeManager — The lexical scope chain for this invocation. Starts with a
 *                  single base SymbolTable; blocks push/pop additional tables
 *                  as they are entered and exited during execution.
 *
 *   enteredAt    — The 1-based C++ source line where this function was called.
 *                  Stored for the debugger's detailed stack trace display so
 *                  the UI can show "called from line 42" for each frame.
 *
 *   callDepth    — The 1-based depth of this frame within the CallStack at the
 *                  moment it was pushed. Stored on the frame itself so it can
 *                  be read without holding a reference to the owning CallStack.
 */
export class StackFrame {
  public readonly functionName: string;
  public readonly scopeManager: ScopeManager;
  public readonly enteredAt:    number;
  public readonly callDepth:    number;

  constructor(functionName: string, enteredAt: number = 0, callDepth: number = 1) {
    this.functionName = functionName;
    this.scopeManager = new ScopeManager();
    this.enteredAt    = enteredAt;
    this.callDepth    = callDepth;
  }
}


// ─── CallStack ────────────────────────────────────────────────────────────────

/**
 * Manages the function-invocation stack for a single execution run.
 *
 * The stack is a plain array of StackFrames:
 *   frames[0]               = the bottom-most frame (always "main" for typical programs)
 *   frames[frames.length-1] = the currently executing frame (top / active)
 *
 * Invariant: The stack is empty between runs. ExecutionEngine.run() calls
 * push("main") as its first action and the finally block of invokeFunction()
 * always calls pop(), so the stack is guaranteed empty when run() returns.
 *
 * Thread safety: The interpreter is single-threaded (JS event loop), so no
 * locking is needed.
 */
export class CallStack {

  /**
   * The frame stack. Index 0 is the bottom (oldest); the last index is the
   * top (currently executing). Direct array access is private — all mutations
   * go through push() and pop() to enforce depth checking and invariants.
   */
  private frames: StackFrame[];

  /**
   * Maximum number of simultaneously active frames before StackOverflowError
   * is thrown. Configurable via the constructor or setMaxDepth().
   */
  private maxDepth: number;

  /**
   * Running high-water mark: the deepest the stack has ever been during this
   * run. Exposed via getMaxReachedDepth() for the profiling panel in the UI.
   */
  private maxReachedDepth: number;

  /**
   * @param maxDepth - Override the default recursion limit. Primarily used in
   *   tests to set a low limit (e.g. 10) and verify StackOverflowError is
   *   thrown at the right depth without running a genuinely deep recursion.
   */
  constructor(maxDepth: number = DEFAULT_MAX_RECURSION_DEPTH) {
    this.frames          = [];
    this.maxDepth        = maxDepth;
    this.maxReachedDepth = 0;
  }


  // ── Frame Lifecycle ───────────────────────────────────────────────────────

  /**
   * Creates a new StackFrame and pushes it onto the stack.
   *
   * @param functionName - The C++ function name (e.g. "main", "dfs", "<lambda>").
   * @param enteredAt    - The 1-based source line of the call site. Used by the
   *                       debugger to display "called from line N" in stack traces.
   *                       Defaults to 0 when the call site line is unavailable
   *                       (e.g. for the synthetic "__global_init__" frame).
   * @returns              The newly created StackFrame, returned so the caller
   *                       (ExecutionEngine.invokeFunction) can bind parameters
   *                       into the frame's ScopeManager immediately.
   *
   * @throws {StackOverflowError} If pushing this frame would exceed maxDepth.
   *   The error is thrown BEFORE the frame is added so the stack remains in a
   *   consistent state — getTrace() still reflects the call chain leading up
   *   to the overflow point.
   */
  public push(functionName: string, enteredAt: number = 0): StackFrame {
    // Depth check before mutating the stack so the error message can include
    // an accurate trace of the frames that led to overflow.
    if (this.frames.length >= this.maxDepth) {
      throw new StackOverflowError(this.maxDepth, this.getTrace());
    }

    const depth = this.frames.length + 1; // 1-based depth of the new frame
    const frame = new StackFrame(functionName, enteredAt, depth);
    this.frames.push(frame);

    // Update high-water mark.
    if (depth > this.maxReachedDepth) {
      this.maxReachedDepth = depth;
    }

    return frame;
  }

  /**
   * Removes and returns the top-most StackFrame from the stack.
   *
   * Called from the `finally` block of ExecutionEngine.invokeFunction() so
   * the frame is always popped regardless of whether the function returned
   * normally, threw a ReturnSignal, or propagated an exception.
   *
   * @returns The popped StackFrame (rarely needed by callers, but returned
   *   for symmetry with push() and to simplify testing assertions).
   *
   * @throws {Error} If the stack is already empty (stack underflow).
   *   This represents an engine bug — a pop() without a matching push().
   *   Debug note: Check that every invokeFunction() call has a corresponding
   *   pop() in its finally block, including polyfill intercepts that call
   *   push() for native functions.
   */
  public pop(): StackFrame {
    if (this.isEmpty()) {
      throw new Error(
        "Fatal: Call stack underflow. Attempted to pop a frame from an empty stack. " +
        "This indicates a missing push() call or a double pop() in ExecutionEngine."
      );
    }
    return this.frames.pop() as StackFrame;
  }

  /**
   * Returns the currently active (top-most) StackFrame without removing it.
   *
   * Called frequently by ExpressionEvaluator (via the interceptor in
   * ExecutionEngine.attachEvaluationInterceptor) to access the active scope,
   * and by createSnapshot() to read the active frame's scope depth.
   *
   * @throws {Error} If the stack is empty — no function is currently executing.
   *   Debug note: If this fires outside of a run() call, check that run() was
   *   called before any expression evaluation is attempted.
   */
  public peek(): StackFrame {
    if (this.isEmpty()) {
      throw new Error(
        "Fatal: Call stack is empty. No active execution frame to peek at. " +
        "Ensure ExecutionEngine.run() has been called and has not yet returned."
      );
    }
    return this.frames[this.frames.length - 1];
  }


  // ── Introspection ─────────────────────────────────────────────────────────

  /**
   * Returns all active StackFrames in order from bottom (oldest) to top (active).
   *
   * Used by helpers.createSnapshot() to aggregate variables across all frames:
   * iterating bottom-to-top means outer-frame variables are written first and
   * inner-frame variables overwrite them, correctly reflecting shadowing.
   *
   * Also used by the debugger's call-stack panel to render the full frame list.
   *
   * The returned array is a shallow copy — callers may iterate it safely even
   * if push() or pop() are called concurrently (though the interpreter is
   * single-threaded, defensive copying avoids surprises in test code).
   */
  public getAllFrames(): StackFrame[] {
    // Return a shallow copy to prevent external mutation of the internal array.
    return [...this.frames];
  }

  /**
   * Returns true if no frames are currently on the stack.
   * Used as a guard in peek() / pop() and in ExecutionEngine to detect whether
   * a run is in progress.
   */
  public isEmpty(): boolean {
    return this.frames.length === 0;
  }

  /**
   * Returns the current number of active frames (call stack depth).
   * 0 means no function is executing; 1 means only "main" is on the stack.
   */
  public getDepth(): number {
    return this.frames.length;
  }

  /**
   * Returns the highest stack depth reached during the current run.
   *
   * Exposed for the UI profiling panel so users can see the peak recursion
   * depth of their algorithm. Reset to 0 on the next call to reset().
   */
  public getMaxReachedDepth(): number {
    return this.maxReachedDepth;
  }


  // ── Configuration ─────────────────────────────────────────────────────────

  /**
   * Updates the maximum allowed recursion depth.
   *
   * Takes effect immediately: if the stack is already at or above the new
   * limit, the next push() will throw StackOverflowError.
   *
   * Primary use cases:
   *   - Lower the limit in unit tests to verify overflow handling cheaply.
   *   - Raise the limit for known deeply-recursive programs (use with caution:
   *     the JS engine itself has its own stack limit, typically ~10,000–15,000
   *     frames depending on the environment and frame size).
   *
   * @param depth - The new maximum depth. Must be >= 1.
   */
  public setMaxDepth(depth: number): void {
    if (depth < 1) {
      throw new Error(
        `[CallStack.setMaxDepth] Invalid depth ${depth}: must be >= 1.`
      );
    }
    this.maxDepth = depth;
  }


  // ── Serialisation ─────────────────────────────────────────────────────────

  /**
   * Returns an ordered array of function names currently on the stack.
   *
   * Format: [bottommost, ..., topmost]
   * Example: ["main", "dfs", "dfs"]  (main called dfs which called dfs recursively)
   *
   * Used by:
   *   - RuntimeSnapshot.state.callStack (the primary consumer).
   *   - StackOverflowError constructor to include the chain in the error message.
   *   - The React call-stack panel's simple name-list display.
   */
  public getTrace(): string[] {
    return this.frames.map((frame) => frame.functionName);
  }

  /**
   * Returns a richer stack trace including entry-line and depth information.
   *
   * Each entry includes:
   *   name      — The C++ function name.
   *   enteredAt — The source line of the call site (0 if unknown).
   *   depth     — The 1-based frame depth at the time of the call.
   *
   * Used by the debugger's detailed stack panel and by StackOverflowError
   * when it needs to report more than just function names.
   *
   * @returns An array of frame descriptor objects, bottom → top.
   */
  public getDetailedTrace(): Array<{ name: string; enteredAt: number; depth: number }> {
    return this.frames.map((frame) => ({
      name:      frame.functionName,
      enteredAt: frame.enteredAt,
      depth:     frame.callDepth,
    }));
  }


  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Resets the call stack to its initial empty state.
   *
   * Called by ExecutionEngine.run() at the start of each new execution to
   * clear any state left over from a previous (possibly crashed) run.
   * Also resets the high-water mark so profiling data reflects only the
   * current run.
   *
   * Note: Does NOT reset maxDepth — configuration survives resets so the
   * caller does not need to re-apply setMaxDepth() between runs.
   */
  public reset(): void {
    this.frames          = [];
    this.maxReachedDepth = 0;
  }
}