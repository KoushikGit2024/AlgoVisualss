// ============================================================================
// types.ts — Ground-truth type contracts for the entire interpreter pipeline.
//
// Every other module imports from here. Changes to this file ripple outward to
// IRBuilder, ExpressionEvaluator, StatementExecutor, ExecutionEngine, and the
// React frontend snapshot consumer. Keep this file lean: pure types and enums
// only — no logic, no class constructors, no side effects.
//
// Extension history:
//   v1  – Initial: primitives, EventType, ExecutionEvent, RuntimeSnapshot.
//   v2  – Added: THROW / BREAKPOINT / INPUT event types; EventFilter interface;
//          ThrowPayload; BreakpointPayload; InputRequest; StaticStorageKey;
//          extended CppType alias; SnapshotDelta for diff-based transport.
// ============================================================================


// ─── Primitive Type Aliases ───────────────────────────────────────────────────

/**
 * Supported C++ type strings within the execution engine.
 *
 * The literal union covers every type whose default initialisation or
 * container-detection logic is explicitly branched in StatementExecutor.
 * The trailing `string` catch-all accommodates complex nested templates
 * (e.g. "vector<pair<int,int>>") passed down verbatim from the Tree-sitter AST
 * without requiring an exhaustive union member for every possible template.
 */
export type CppType =
  | "int"
  | "long"
  | "long long"
  | "short"
  | "unsigned int"
  | "unsigned long"
  | "unsigned long long"
  | "double"
  | "float"
  | "bool"
  | "char"
  | "string"
  | "void"
  | "auto"
  | "nullptr_t"
  | string; // catch-all for template types and user-defined types


/**
 * The cross-compiled JavaScript equivalent of any C++ runtime value.
 *
 * Design rationale:
 *   - `number`              → int, long, double, float, char (ASCII code)
 *   - `boolean`             → bool
 *   - `string`              → std::string, char literal
 *   - `null`                → nullptr / NULL
 *   - `undefined`           → void return / uninitialised slot
 *   - `CppValue[]`          → C-style arrays, std::pair, std::tuple, InitializerList
 *   - `Record<string, any>` → struct instances, mock STL containers ({ data: [] })
 *   - `Set<any>`            → std::set / std::unordered_set polyfill
 *   - `Map<any, any>`       → std::map / std::unordered_map polyfill
 *   - `(...args) => any`    → lambdas and function pointers compiled to JS closures
 */
export type CppValue =
  | number
  | boolean
  | string
  | undefined
  | null
  | CppValue[]
  | Record<string, any>
  | Set<any>
  | Map<any, any>
  | ((...args: any[]) => any);


// ─── Opaque Key Types ─────────────────────────────────────────────────────────

/**
 * Canonical key for the ExecutionEngine's static-variable store.
 *
 * Format: `"<functionName>::<variableName>"`
 * Example: `"fibonacci::callCount"`
 *
 * Using a branded string prevents accidental key collisions with plain strings
 * and makes storage intent explicit at call sites.
 */
export type StaticStorageKey = `${string}::${string}`;


// ─── Event System ─────────────────────────────────────────────────────────────

/**
 * Execution milestones broadcast by EventEmitter during program execution.
 *
 * The React frontend subscribes to these to trigger animations and state
 * updates. Every new event type must be added here AND handled in:
 *   1. EventEmitter.emit() call sites (execution engine / walker)
 *   2. createSnapshot() in helpers.ts (if it affects snapshot shape)
 *   3. The React visualiser's event renderer
 *
 * Ordering within the enum is alphabetical for readability only — the numeric
 * values have no runtime significance.
 */
export enum EventType {
  // ── Memory operations ──────────────────────────────────────────────────────
  /** A new variable is allocated in the current lexical scope. */
  DECLARE        = "DECLARE",

  /** A variable, array element, or struct field is mutated. (canonical name) */
  ASSIGNMENT     = "ASSIGNMENT",

  /**
   * @deprecated Alias kept for backward-compatibility with older event
   * consumers. New code should emit ASSIGNMENT instead.
   */
  ASSIGN         = "ASSIGN",

  /** A variable or memory location is read (looked up in the scope chain). */
  READ           = "READ",

  // ── I/O operations ────────────────────────────────────────────────────────
  /** std::cout / printf output was written to the output stream. */
  WRITE          = "WRITE",

  /**
   * std::cin or scanf is requesting user input.
   *
   * Payload shape: `{ variable: string; type: CppType }`
   * The engine pauses execution and waits for the UI to supply a value via
   * ExecutionEngine.provideInput(). See InputRequest for the full contract.
   */
  INPUT          = "INPUT",

  // ── Control flow ─────────────────────────────────────────────────────────
  /** A branching condition (if / while / for / switch / ternary) was evaluated. */
  CONDITION      = "CONDITION",

  /** A loop block was entered for the first time. */
  LOOP_ENTER     = "LOOP_ENTER",

  /** A subsequent iteration of an already-entered loop began. */
  LOOP_ITERATION = "LOOP_ITERATION",

  /** A loop terminated (condition false, break, or exhausted range). */
  LOOP_EXIT      = "LOOP_EXIT",

  // ── Call stack ────────────────────────────────────────────────────────────
  /** A new function frame was pushed onto the call stack. */
  FUNCTION_CALL   = "FUNCTION_CALL",

  /** A function frame was popped from the call stack (return / end of body). */
  FUNCTION_RETURN = "FUNCTION_RETURN",

  // ── Exception handling ────────────────────────────────────────────────────
  /**
   * A C++ `throw` statement was executed.
   *
   * Payload shape: `{ value: CppValue; typeName?: string }`
   * Emitted before the ThrowSignal propagates up the walker chain so the UI
   * can highlight the throw site even if no matching catch is found.
   */
  THROW          = "THROW",

  /**
   * A `catch` clause matched a thrown value and began executing.
   *
   * Payload shape: `{ value: CppValue; typeName?: string }`
   */
  CATCH          = "CATCH",

  // ── Debugger ──────────────────────────────────────────────────────────────
  /**
   * Execution reached a line that has a registered breakpoint.
   *
   * Payload shape: `{ line: number; condition?: string }`
   * The engine throws a BreakpointSignal after emitting this event; the
   * calling code is responsible for catching it and entering paused state.
   */
  BREAKPOINT     = "BREAKPOINT",
}


/**
 * An isolated event payload generated by the engine at a single execution step.
 *
 * The `id` field is a UUID used by React as a stable reconciliation key.
 * The `step` counter is monotonically increasing across the entire run and
 * is reset to zero when ExecutionEngine.run() is called.
 */
export interface ExecutionEvent {
  /** UUID v4 — unique across the entire lifetime of an engine instance. */
  id:      string;
  /** 1-based chronological position within the current run. */
  step:    number;
  /** 1-based C++ source line where the event occurred. */
  line:    number;
  /** Category of the event (see EventType). */
  type:    EventType;
  /** Contextual data specific to the event category. */
  payload: Record<string, unknown>;
}


// ─── Snapshot System ──────────────────────────────────────────────────────────

/**
 * A single variable entry inside a RuntimeSnapshot's state.variables map.
 * Carrying the CppType alongside the value allows the React frontend to
 * render typed labels (e.g. "int", "vector<int>") without re-parsing the source.
 */
export interface SnapshotVariable {
  name:  string;
  type:  CppType;
  value: CppValue;
}

/**
 * The definitive, fully serialised execution state at a specific step.
 *
 * Consumed by the React frontend to render the execution time-machine.
 * All CppValues inside `state.variables` have been deep-cloned via
 * deepCloneCppValue() so they are safe to freeze, diff, or JSON-serialise.
 */
export interface RuntimeSnapshot {
  /** Matches ExecutionEvent.step — used to index into the snapshot array. */
  step: number;
  /** C++ source line that triggered this snapshot. */
  line: number;
  event: {
    type:    EventType;
    payload: Record<string, unknown>;
  };
  state: {
    /**
     * Flat map of every variable visible at this step.
     * Inner-scope variables shadow outer-scope variables (same name → inner wins).
     * Aggregated bottom-to-top across all active CallStack frames so the UI
     * retains context variables (e.g. graph adjacency list) during deep recursion.
     */
    variables:  Record<string, SnapshotVariable>;
    /** Ordered function names currently on the call stack, bottom → top. */
    callStack:  string[];
    /**
     * Number of nested scopes in the active (top) frame's ScopeManager.
     * 1 = only the frame base scope; each nested block increments this.
     */
    scopeDepth: number;
    /**
     * Non-empty only when the most recent event was a WRITE.
     * Accumulated across the run so the UI can render the full output buffer.
     */
    output?:    string;
  };
}

/**
 * A diff between two consecutive RuntimeSnapshots.
 *
 * Used by the snapshot transport layer (WebWorker → main thread) to reduce
 * payload size. The React frontend applies the delta to the previous full
 * snapshot to reconstruct the current state, rather than receiving a full
 * copy of every variable on every step.
 *
 * When `isFull` is true, the receiver should replace its entire cached state
 * with `variables` rather than merging. This is sent on the first snapshot and
 * whenever a full re-sync is needed (e.g. after a function call introduces many
 * new variables at once).
 */
export interface SnapshotDelta {
  step:      number;
  line:      number;
  event:     RuntimeSnapshot["event"];
  isFull:    boolean;
  /** Variables that were added or whose value changed since the last step. */
  changed:   Record<string, SnapshotVariable>;
  /** Names of variables that went out of scope since the last step. */
  removed:   string[];
  callStack: string[];
  scopeDepth: number;
  output?:   string;
}


// ─── Event Filtering ──────────────────────────────────────────────────────────

/**
 * Configuration object passed to EventEmitter to suppress categories of events
 * that the caller does not need.
 *
 * Suppressing READ events (which fire on every variable access) is the single
 * most effective way to reduce snapshot count for tight loops. A program with
 * a 10,000-iteration sort can produce 500,000+ READ snapshots that the UI
 * never shows individually.
 *
 * All fields default to `false` (nothing suppressed) when omitted.
 *
 * @example
 * // Suppress reads and loop iterations for a compact step-through mode:
 * engine.setEventFilter({ suppressRead: true, suppressLoopIteration: true });
 */
export interface EventFilter {
  /** Suppress EventType.READ — variable lookup events. */
  suppressRead?:          boolean;
  /** Suppress EventType.LOOP_ITERATION — per-cycle loop events. */
  suppressLoopIteration?: boolean;
  /** Suppress EventType.LOOP_ENTER and EventType.LOOP_EXIT. */
  suppressLoopBounds?:    boolean;
  /** Suppress EventType.FUNCTION_CALL and EventType.FUNCTION_RETURN for STL polyfills only. */
  suppressNativeCalls?:   boolean;
  /**
   * Maximum number of snapshots to retain before the engine stops emitting.
   * Prevents out-of-memory errors on pathological inputs. Default: 500_000.
   */
  maxSnapshots?:          number;
}


// ─── Input / cin Support ──────────────────────────────────────────────────────

/**
 * Describes a pending input request from `std::cin` or `scanf`.
 *
 * When the engine encounters `cin >> x`, it emits an INPUT event carrying an
 * InputRequest and then suspends. The UI presents an input field, the user
 * types a value, and the UI calls ExecutionEngine.provideInput(value) to
 * resume. Multiple consecutive `>>` extractions each produce one InputRequest.
 */
export interface InputRequest {
  /** The C++ variable name that will receive the value. */
  variable: string;
  /** The declared C++ type of the target variable (used for coercion). */
  type:     CppType;
  /**
   * Optional prompt string extracted from a preceding cout or string literal.
   * E.g. `cout << "Enter n: "; cin >> n;` → prompt = "Enter n: ".
   */
  prompt?:  string;
}


// ─── Debugger Contracts ───────────────────────────────────────────────────────

/**
 * A registered breakpoint in the debugger subsystem.
 *
 * `condition` is an optional C++ expression string that, when provided, means
 * the breakpoint only fires when the expression evaluates to truthy.
 * The engine parses it through IRBuilder on first hit and caches the IRExpression.
 *
 * @example
 * // Break on line 14 only when i equals 5:
 * engine.addBreakpoint({ line: 14, condition: "i == 5" });
 */
export interface Breakpoint {
  /** 1-based source line number. */
  line:       number;
  /** Optional C++ condition expression evaluated in the current scope. */
  condition?: string;
  /** Whether this breakpoint is currently active. Defaults to true. */
  enabled?:   boolean;
}


// ─── Exception Handling ───────────────────────────────────────────────────────

/**
 * The payload carried by a THROW event and by ThrowSignal.
 *
 * `typeName` is the C++ type string from the throw expression (e.g. "int",
 * "std::runtime_error", "MyException"). It may be undefined when the thrown
 * value is a plain literal with no explicit type context.
 */
export interface ThrowPayload {
  value:      CppValue;
  typeName?:  string;
}