// ============================================================================
// ExecutionEngine.ts — Master orchestrator of the C++ interpreter runtime.
//
// The engine owns the complete execution lifecycle for one program run:
//
//   loadProgram()  — Registers functions, structs, enums, and type aliases
//                    from the parsed IRProgram into lookup tables.
//
//   run()          — Initialises all per-run state, evaluates globals, calls
//                    main(), and returns the complete RuntimeSnapshot array.
//
//   invokeFunction()     — Pushes a call stack frame, binds parameters, runs
//                          the function body, mirrors static variables back,
//                          and pops the frame.
//
//   invokeFunctionCall() — Intercepts stdlib polyfills before forwarding to
//                          invokeFunction() for user-defined functions.
//
//   invokeMethodCall()   — Handles all STL container method calls by
//                          dispatching on the backing JS type.
//
//   attachEvaluationInterceptor() — Monkey-patches ExpressionEvaluator.evaluate()
//                                   to redirect FunctionCall / MethodCall /
//                                   NewExpression / LambdaExpression nodes to
//                                   the engine before they reach the evaluator.
//
// Owned state (persists across runs until loadProgram() is called again):
//   functions        — Map<name, IRFunctionDeclaration>
//   classBlueprints  — Map<name, IRStructDeclaration>
//   enumBlueprints   — Map<name, IREnumDeclaration>      v2
//   typeAliases      — Map<alias, target>                v2
//   resolvedEnumValues — Map<memberName, number>         v2
//
// Per-run state (reset at the start of every run()):
//   callStack, eventEmitter (step counter), snapshots, globalVariables,
//   staticStorage, accumulatedOutput, inputQueue
//
// Extension history:
//   v1 — Initial: loadProgram, run, invokeFunction, invokeFunctionCall,
//        invokeMethodCall, attachEvaluationInterceptor.
//   v2 — Added: enumBlueprints / typeAliases registration in loadProgram();
//               resolvedEnumValues injection into every frame;
//               staticStorage map + mirroring in invokeFunction();
//               inputQueue + setInputValues() / provideInput() for cin;
//               breakpoint management + BreakpointSignal catch in run();
//               setEventFilter() / clearEventFilter() delegating to EventEmitter;
//               setMaxDepth() delegating to CallStack;
//               accumulatedOutput for full stdout in snapshots;
//               extended STL intercepts: find_if, all_of, any_of, none_of,
//               for_each, iota, rotate, copy, partition, transform, remove_if,
//               multiset/multimap stubs;
//               getSnapshots() / getOutput() public accessors.
// ============================================================================

import type {
  IRProgram,
  IRFunctionDeclaration,
  IRFunctionCall,
  IRMethodCall,
  IRNewExpression,
  IRLambdaExpression,
  IRStructDeclaration,
  IREnumDeclaration,
  // IRTypeAlias,
  IRExpression,
  IRVariableDeclaration,
} from "../ir/IRNode";
import { CallStack }             from "../runtime/CallStack";
import { EventEmitter }          from "../events/EventEmitter";
import { ExpressionEvaluator }   from "../evaluator/ExpressionEvaluator";
import { StatementExecutor }     from "../executor/StatementExecutor";
import { IRWalker }              from "../walker/IRWalker";
import { ScopeManager }          from "../runtime/ScopeManager";
import { EventType }             from "../types";
import type {
  RuntimeSnapshot,
  CppValue,
  CppType,
  EventFilter,
  Breakpoint,
  StaticStorageKey,
} from "../types";
import {
  createSnapshot,
  ReturnSignal,
  ThrowSignal,
  BreakpointSignal,
  cloneRuntimeValue,
} from "../utils/helpers";


// ─── ExecutionEngine ──────────────────────────────────────────────────────────

export class ExecutionEngine {

  // ── Persistent registries (survive across runs) ───────────────────────────

  /** All parsed function declarations, keyed by function name. */
  private functions:          Map<string, IRFunctionDeclaration>;

  /** All parsed struct / class blueprints, keyed by type name. */
  public  classBlueprints:    Map<string, IRStructDeclaration>;

  /** v2: All parsed enum / enum-class blueprints, keyed by enum name. */
  private enumBlueprints:     Map<string, IREnumDeclaration>;

  /**
   * v2: Flattened enum member → integer value map.
   * Pre-computed from enumBlueprints at loadProgram() time so that per-frame
   * injection is a simple Map iteration rather than re-evaluating expressions.
   * Includes both unqualified names (`NORTH`) and qualified names (`Direction::NORTH`).
   */
  private resolvedEnumValues: Map<string, number>;

  /** v2: Type alias expansions, keyed by alias name. */
  private typeAliases:        Map<string, string>;

  // ── Per-run state ─────────────────────────────────────────────────────────

  public maxSteps: number = 2000000; // Limit execution steps to prevent browser hangs
  public maxSnapshots: number = 30000; // Limit memory to prevent postMessage out-of-memory crashes
  private importanceLevel: number = 0;
  private snapshotSkipFactor: number = 1;
  private stepsSinceLastSnapshot: number = 0;
  private steps: number = 0;
  private callStack:           CallStack;
  private eventEmitter:        EventEmitter;
  private snapshots:           RuntimeSnapshot[];
  private globalDeclarations:  IRVariableDeclaration[];
  private globalVariables:     Map<string, { type: CppType; value: CppValue }>;
  private globalScopeManager:  ScopeManager | null = null;

  /**
   * v2: Persistent storage for static local variables.
   * Key format: "functionName::variableName" (StaticStorageKey branded string).
   * Populated from ScopeManager.getStaticSymbols() in invokeFunction()'s finally.
   * Passed to StatementExecutor so it can detect "already initialised" statics.
   * Reset only when run() is called with resetStatics: true (default: false).
   */
  private staticStorage:       Map<StaticStorageKey, CppValue>;

  /**
   * v2: Queue of pre-supplied stdin tokens for `cin >>` interception.
   * Populated by setInputValues(); consumed one token at a time by the
   * inputProvider closure passed to ExpressionEvaluator.setInputProvider().
   */
  private inputQueue:          CppValue[];

  /**
   * v2: Accumulated stdout string across the entire run.
   * Appended to on every WRITE event and included in every snapshot so the
   * React terminal panel can show the full output at any step without
   * replaying all prior WRITE events.
   */
  private accumulatedOutput:   string;

  /**
   * v2: Registered breakpoints. Passed to each IRWalker instance so the
   * walker can throw BreakpointSignal when a matching line is reached.
   */
  private breakpoints:         Breakpoint[];

  /**
   * v2: Snapshots captured up to the most recent breakpoint pause.
   * Cleared at the start of each run(); populated incrementally if run()
   * is called in stepped mode (future: step() method).
   */
  private pausedAtStep:        number | null;


  constructor() {
    this.callStack          = new CallStack();
    this.eventEmitter       = new EventEmitter();
    this.functions          = new Map();
    this.classBlueprints    = new Map();
    this.enumBlueprints     = new Map();
    this.resolvedEnumValues = new Map();
    this.typeAliases        = new Map();
    this.snapshots          = [];
    this.globalDeclarations = [];
    this.globalVariables    = new Map();
    this.globalScopeManager = null;
    this.staticStorage      = new Map();
    this.inputQueue         = [];
    this.accumulatedOutput  = "";
    this.breakpoints        = [];
    this.pausedAtStep       = null;

    // ── Snapshot capture hook ─────────────────────────────────────────────
    // Registered once in the constructor and preserved across runs.
    // Accumulates stdout and builds a full RuntimeSnapshot on every event.
    this.eventEmitter.subscribe((event) => {
      // Accumulate stdout for the terminal panel.
      if (
        event.type === EventType.WRITE &&
        typeof event.payload.output === "string"
      ) {
        this.accumulatedOutput += event.payload.output as string;
      }

      const activeFrame = this.callStack.isEmpty()
        ? null
        : this.callStack.peek();

      if (activeFrame) {
        if (++this.steps > this.maxSteps) {
          throw new Error(`Runtime Error: Maximum execution steps (${this.maxSteps}) exceeded. Algorithm is taking too long or has an infinite loop.`);
        }
        
        // Filter out less important events if we've escalated the importance level
        let shouldCapture = true;
        if (this.importanceLevel >= 1 && event.type === EventType.READ) shouldCapture = false;
        if (this.importanceLevel >= 2 && (event.type === EventType.CONDITION || String(event.type).startsWith("LOOP_"))) shouldCapture = false;
        if (this.importanceLevel >= 3 && (event.type === EventType.ASSIGNMENT || event.type === EventType.ASSIGN || event.type === EventType.DECLARE)) shouldCapture = false;

        if (shouldCapture) {
          this.stepsSinceLastSnapshot++;
          if (this.stepsSinceLastSnapshot >= this.snapshotSkipFactor) {
            this.snapshots.push(
              createSnapshot(
                event,
                this.callStack,
                activeFrame.scopeManager,
                this.accumulatedOutput,
              )
            );
            this.stepsSinceLastSnapshot = 0;

            // Hierarchical compression: drop less important events first to stay under memory limits
            while (this.snapshots.length >= this.maxSnapshots) {
              if (this.importanceLevel === 0) {
                this.snapshots = this.snapshots.filter(s => s.event.type !== EventType.READ);
                this.importanceLevel = 1;
              } else if (this.importanceLevel === 1) {
                this.snapshots = this.snapshots.filter(s => 
                  s.event.type !== EventType.CONDITION && 
                  !String(s.event.type).startsWith("LOOP_")
                );
                this.importanceLevel = 2;
              } else if (this.importanceLevel === 2) {
                this.snapshots = this.snapshots.filter(s => 
                  s.event.type !== EventType.ASSIGNMENT && 
                  s.event.type !== EventType.ASSIGN && 
                  s.event.type !== EventType.DECLARE
                );
                this.importanceLevel = 3;
              } else {
                // Final fallback: uniformly drop half of the remaining events (e.g. Function calls)
                this.snapshots = this.snapshots.filter((_, i) => i % 2 === 0);
                this.snapshotSkipFactor *= 2;
              }
            }
          }
        }
      }
    });
  }


  // ==========================================================================
  // SECTION 1 — Program loading
  // ==========================================================================

  /**
   * Registers all top-level declarations from a parsed IRProgram into the
   * engine's global lookup tables. Must be called before run().
   *
   * Clears all previous registrations so the same engine instance can be
   * reused across multiple programs without state contamination.
   *
   * v2: Also registers enum blueprints, resolves enum member values, and
   * registers type aliases. Enum resolution uses a simple sequential pass:
   * each member's value is either its explicit initialiser or the previous
   * member's value + 1, matching C++ auto-increment semantics.
   */
  public loadProgram(program: IRProgram): void {
    // ── Functions ─────────────────────────────────────────────────────────
    this.functions.clear();
    for (const func of program.functions) {
      this.functions.set(func.name, func);
    }

    // ── Struct / class blueprints ─────────────────────────────────────────
    this.classBlueprints.clear();
    for (const struct of program.structs ?? []) {
      this.classBlueprints.set(struct.name, struct);
    }

    // ── Enum blueprints + value resolution (v2) ───────────────────────────
    this.enumBlueprints.clear();
    this.resolvedEnumValues.clear();

    for (const enumDecl of program.enums ?? []) {
      this.enumBlueprints.set(enumDecl.name, enumDecl);

      let nextValue = 0;
      for (const member of enumDecl.members) {
        let memberValue = nextValue;

        if (member.value) {
          // Evaluate the explicit initialiser using a temporary lightweight
          // evaluator that only handles literals and simple arithmetic.
          // Full expression evaluation requires a ScopeManager frame which
          // we cannot push during loadProgram() — so only literals are
          // supported for now. Complex enum initialisers (referencing other
          // enum members) may not resolve correctly.
          try {
            memberValue = this.evaluateEnumConstant(member.value);
          } catch {
            // Debug note: If this fires, the enum member's value uses a
            // non-literal expression (e.g. NORTH = OTHER_ENUM + 1). It will
            // default to the auto-incremented value. Full expression support
            // would require deferring resolution to runtime.
            console.warn(
              `[ExecutionEngine.loadProgram] Could not resolve enum member ` +
              `'${enumDecl.name}::${member.name}' — using auto-increment value ${nextValue}.`
            );
            memberValue = nextValue;
          }
        }

        nextValue = memberValue + 1;

        // Register both unqualified and qualified names.
        this.resolvedEnumValues.set(member.name, memberValue);
        this.resolvedEnumValues.set(`${enumDecl.name}::${member.name}`, memberValue);
      }
    }

    // ── Type aliases (v2) ─────────────────────────────────────────────────
    this.typeAliases.clear();
    for (const alias of program.aliases ?? []) {
      this.typeAliases.set(alias.alias, alias.target);
    }

    // ── Global variable declarations ──────────────────────────────────────
    this.globalDeclarations = program.globals ?? [];
  }

  /**
   * Lightweight enum constant evaluator for use during loadProgram().
   * Supports only numeric literals — sufficient for the vast majority of
   * enum declarations in competitive programming.
   *
   * @param expr - The IRExpression from an IREnumMember's value field.
   * @returns      The integer value of the constant.
   * @throws       If the expression is not a supported literal.
   */
  private evaluateEnumConstant(expr: IRExpression): number {
    if (expr.kind === "Literal" && typeof (expr as any).value === "number") {
      return (expr as any).value as number;
    }
    if (expr.kind === "UnaryExpression" && (expr as any).operator === "-") {
      return -this.evaluateEnumConstant((expr as any).argument);
    }
    if (expr.kind === "BinaryExpression") {
      const l = this.evaluateEnumConstant((expr as any).left);
      const r = this.evaluateEnumConstant((expr as any).right);
      switch ((expr as any).operator) {
        case "+": return l + r;
        case "-": return l - r;
        case "*": return l * r;
        case "/": return Math.trunc(l / r);
        case "<<": return l << r;
        case ">>": return l >> r;
        case "|": return l | r;
        case "&": return l & r;
      }
    }
    throw new Error("Non-literal enum constant — cannot resolve at load time.");
  }


  // ==========================================================================
  // SECTION 2 — Runtime configuration
  // ==========================================================================

  /**
   * Pre-loads stdin tokens that `cin >>` extractions will consume.
   *
   * Each string in `inputs` is treated as a whitespace-delimited token.
   * Type coercion (string → int / double / char) is handled by
   * ExpressionEvaluator.coerceCinToken() based on the target variable's
   * declared type.
   *
   * Call this before run() for programs that read from stdin.
   *
   * @param inputs - Array of raw string tokens in the order they should
   *   be consumed. May be pre-split: `["5", "3"]` for `cin >> a >> b`.
   *
   * @example
   * engine.setInputValues(["10", "3.14", "hello"]);
   * engine.run("main");
   */
  public setInputValues(inputs: string[]): void {
    // Store as CppValue[] (strings) so the provider can return them directly.
    // ExpressionEvaluator.coerceCinToken() handles conversion to the right type.
    this.inputQueue = [...inputs];
  }

  /**
   * Pops and returns the next input token from the queue.
   * Called by the inputProvider closure installed in run().
   * Returns undefined when the queue is exhausted.
   */
  private provideInput(): CppValue | undefined {
    return this.inputQueue.length > 0 ? this.inputQueue.shift()! : undefined;
  }

  /**
   * Registers breakpoints for the next run. Replaces any previously
   * registered breakpoints.
   *
   * Disabled breakpoints (enabled: false) are filtered out here so the
   * walker never sees them.
   *
   * @param breakpoints - Array of Breakpoint descriptors.
   */
  public setBreakpoints(breakpoints: Breakpoint[]): void {
    this.breakpoints = breakpoints.filter(bp => bp.enabled !== false);
  }

  /**
   * Clears all registered breakpoints.
   */
  public clearBreakpoints(): void {
    this.breakpoints = [];
  }

  /**
   * Installs an EventFilter on the EventEmitter.
   * Suppresses high-frequency event categories to reduce snapshot count.
   * Takes effect on the next emit() call.
   *
   * @param filter - See EventFilter interface in types.ts for full options.
   */
  public setEventFilter(filter: EventFilter): void {
    this.eventEmitter.setFilter(filter);
  }

  /**
   * Removes the active EventFilter, restoring full event emission.
   */
  public clearEventFilter(): void {
    this.eventEmitter.clearFilter();
  }

  /**
   * Updates the maximum recursion depth on the CallStack.
   * Default is 10,000 frames. Lower values are useful for catching
   * infinite recursion faster in testing; higher values allow genuinely
   * deep recursive algorithms.
   *
   * @param depth - New maximum frame count. Must be >= 1.
   */
  public setMaxDepth(depth: number): void {
    this.callStack.setMaxDepth(depth);
  }


  // ==========================================================================
  // SECTION 3 — Run
  // ==========================================================================

  /**
   * Executes the program from the specified entry point and returns all
   * RuntimeSnapshots generated during execution.
   *
   * Execution sequence:
   *   1. Reset all per-run state.
   *   2. Install input provider on evaluators (for cin >>).
   *   3. Evaluate global variable declarations in a synthetic frame.
   *   4. Call the entry point function.
   *   5. Return all snapshots.
   *
   * BreakpointSignal handling:
   *   If a BreakpointSignal propagates out of invokeFunction(), it is caught
   *   here, the current snapshot count is recorded, and the snapshots array
   *   up to that point is returned. The paused step is exposed via
   *   getPausedAtStep(). Future: a step() method will resume from this point.
   *
   * @param entryPoint     - The function name to call (default: "main").
   * @param resetStatics   - If true, clear staticStorage before running.
   *                         Default: false (static locals persist across runs).
   * @returns                Array of chronological RuntimeSnapshots.
   *
   * @throws {Error} If the entry point function is not registered.
   */
  public run(
    entryPoint:   string  = "main",
    resetStatics: boolean = false,
  ): RuntimeSnapshot[] {

    // ── Reset per-run state ───────────────────────────────────────────────
    this.steps             = 0;
    this.snapshots         = [];
    this.accumulatedOutput = "";
    this.pausedAtStep      = null;
    this.callStack.reset();
    this.eventEmitter.reset();
    if (resetStatics) this.staticStorage.clear();

    if (!this.functions.has(entryPoint)) {
      throw new Error(
        `Linker Error: Entry point '${entryPoint}' not found. ` +
        `Ensure the function is defined and loadProgram() was called with the correct IRProgram.`
      );
    }

    // ── Evaluate global variables ─────────────────────────────────────────
    if (this.globalDeclarations.length > 0) {
      const globalFrame    = this.callStack.push("__global_init__");
      const globalEval     = new ExpressionEvaluator(globalFrame.scopeManager, this.eventEmitter);
      this.attachEvaluationInterceptor(globalEval);
      globalEval.setInputProvider(() => this.provideInput());

      const globalExecutor = new StatementExecutor(
        globalFrame.scopeManager,
        globalEval,
        this.eventEmitter,
        this.classBlueprints,
        this.enumBlueprints,
        this.typeAliases,
        this.staticStorage,
        "__global_init__",
      );

      for (const decl of this.globalDeclarations) {
        try {
          globalExecutor.executeVariableDeclaration(decl);
          const sym = globalFrame.scopeManager.getVariable(decl.name);
          this.globalVariables.set(decl.name, { type: sym.type as CppType, value: sym.value });
        } catch (e) {
          console.warn(
            `[ExecutionEngine.run] Failed to initialise global '${decl.name}': ` +
            `${(e as Error).message}`
          );
        }
      }
      this.globalScopeManager = globalFrame.scopeManager;
      this.callStack.pop();
    }

    // ── Execute entry point ───────────────────────────────────────────────
    try {
      this.invokeFunction(entryPoint, []);
    } catch (e: any) {
      if (e instanceof BreakpointSignal || e?.name === "BreakpointSignal") {
        // Record where we paused and return snapshots up to this point.
        // The call stack is left intact for a future step() / resume() call.
        this.pausedAtStep = e.line;
        return this.snapshots;
      }
      if (e instanceof ThrowSignal || e?.name === "ThrowSignal") {
        // Uncaught C++ exception — surface as a descriptive runtime error.
        throw new Error(
          `Uncaught Exception at line ${(e as ThrowSignal).payload.typeName ?? "unknown"}: ` +
          `Thrown value: ${JSON.stringify((e as ThrowSignal).payload.value)}. ` +
          `Add a try/catch block or ensure all throw paths are handled.`
        );
      }
      throw e;
    }

    return this.snapshots;
  }


  // ==========================================================================
  // SECTION 4 — Public accessors
  // ==========================================================================

  /** Returns the complete snapshot array from the last run. */
  public getSnapshots(): RuntimeSnapshot[] { return this.snapshots; }

  /** Returns the full stdout string accumulated during the last run. */
  public getOutput(): string { return this.accumulatedOutput; }

  /**
   * Returns the source line at which execution was paused by a breakpoint,
   * or null if the last run completed without hitting a breakpoint.
   */
  public getPausedAtStep(): number | null { return this.pausedAtStep; }

  /** Returns telemetry from the EventEmitter for the last run. */
  public getTelemetry(): { emitted: number; suppressed: number; maxDepth: number } {
    return {
      emitted:   this.eventEmitter.getTotalEmitted(),
      suppressed: this.eventEmitter.getSuppressedCount(),
      maxDepth:  this.callStack.getMaxReachedDepth(),
    };
  }


  // ==========================================================================
  // SECTION 5 — Function invocation
  // ==========================================================================

  /**
   * Intercepts function calls: applies stdlib polyfills first, then falls
   * through to user-defined function invocation.
   *
   * The polyfill section is ordered from most-specific to most-general:
   *   1. std::swap (requires raw argument inspection for by-ref swap)
   *   2. STL algorithm functions (sort, reverse, find_if, all_of, …)
   *   3. Math functions (<cmath>)
   *   4. Numeric utilities (gcd, lcm)
   *   5. Comparator functors (greater<>, less<>)
   *   6. String utilities (to_string, stoi, …)
   *   7. Character utilities (<cctype>)
   *   8. I/O (printf, fprintf)
   *   9. Assertions
   *   10. User-defined functions / lambdas
   */
  public invokeFunctionCall(
    callNode:         IRFunctionCall,
    currentEvaluator: ExpressionEvaluator,
  ): CppValue {
    const fn = callNode.callee;

    // ── 1. std::swap ──────────────────────────────────────────────────────
    if (fn === "swap" && callNode.arguments.length === 2) {
      return this.nativeSwap(callNode, currentEvaluator);
    }

    // ── 1.5 User-defined functions / lambdas ──────────────────────────────
    // Prefer user-defined functions or local lambdas over STL polyfills to
    // prevent shadowing bugs (e.g. user defining 'partition' or 'count').
    let localFuncRef: any = undefined;
    try {
      if (!this.callStack.isEmpty()) {
        const activeScope = this.callStack.peek().scopeManager;
        localFuncRef = activeScope.getVariable(fn)?.value;
      }
    } catch { /* Not a local variable */ }

    if (localFuncRef || this.functions.has(fn)) {
      const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
      if (localFuncRef) {
        if (typeof localFuncRef === "function") return localFuncRef(...args);
        if (typeof localFuncRef === "string")   return this.invokeFunction(localFuncRef, args, callNode.arguments, currentEvaluator);
        if (localFuncRef.kind === "LambdaExpression") return this.invokeFunction(localFuncRef, args, callNode.arguments, currentEvaluator);
      }
      return this.invokeFunction(fn, args, callNode.arguments, currentEvaluator);
    }

    // ── 1.8 Container Constructors (e.g. vector<int>(n, INF)) ─────────────
    if (fn === "string" || fn === "std::string") {
      const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
      if (args.length === 2 && typeof args[0] === "number") {
        const fillChar = typeof args[1] === "string" ? args[1] : String.fromCharCode(args[1] as number);
        return fillChar.repeat(args[0]);
      } else if (args.length === 1) {
        return String(args[0] ?? "");
      } else if (args.length === 0) {
        return "";
      }
    }

    if (fn.startsWith("vector") || fn.startsWith("list") || fn.startsWith("deque") || fn.startsWith("array")) {
      const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
      let size = -1;
      let fill = 0;
      if (args.length >= 1 && typeof args[0] === "number") size = args[0];
      if (args.length >= 2) fill = args[1] as any;
      if (size >= 0) {
        const container = {
          data: new Array(size).fill(fill) as any[],
          size: () => container.data.length,
          empty: () => container.data.length === 0,
          push_back: (val: any) => { container.data.push(val); },
          pop_back: () => { container.data.pop(); },
          clear: () => { container.data = []; },
          insert: (pos: number, val: any) => { container.data.splice(pos, 0, val); },
          erase: (pos: number) => { container.data.splice(pos, 1); },
          begin: () => 0,
          end: () => container.data.length,
          front: () => container.data[0],
          back: () => container.data[container.data.length - 1],
          __type: fn,
          __isContainer: true
        };
        return container;
      } else {
        const container = {
          data: [] as any[],
          size: () => container.data.length,
          empty: () => container.data.length === 0,
          push_back: (val: any) => { container.data.push(val); },
          pop_back: () => { container.data.pop(); },
          clear: () => { container.data = []; },
          insert: (pos: number, val: any) => { container.data.splice(pos, 0, val); },
          erase: (pos: number) => { container.data.splice(pos, 1); },
          begin: () => 0,
          end: () => container.data.length,
          front: () => container.data[0],
          back: () => container.data[container.data.length - 1],
          __type: fn,
          __isContainer: true
        };
        return container;
      }
    }

    // ── 2. STL algorithms ─────────────────────────────────────────────────

    // Algorithms that operate on a begin-iterator argument (MethodCall on container).
    if (["reverse", "max_element", "min_element", "accumulate"].includes(fn)) {
      return this.nativeContainerAlgorithm(fn, callNode, currentEvaluator);
    }

    if (fn === "sort" || fn === "stable_sort") {
      return this.nativeSort(fn, callNode, currentEvaluator);
    }

    if (fn === "fill" || fn === "fill_n") {
      return this.nativeFill(fn, callNode, currentEvaluator);
    }

    if (fn === "count" || fn === "count_if") {
      return this.nativeCount(fn, callNode, currentEvaluator);
    }

    if (fn === "find") {
      return this.nativeFind(false, callNode, currentEvaluator);
    }

    if (fn === "find_if") {                                        // v2
      return this.nativeFind(true, callNode, currentEvaluator);
    }

    if (fn === "all_of") {                                         // v2
      return this.nativeQuantifier("all",  callNode, currentEvaluator);
    }
    if (fn === "any_of") {                                         // v2
      return this.nativeQuantifier("any",  callNode, currentEvaluator);
    }
    if (fn === "none_of") {                                        // v2
      return this.nativeQuantifier("none", callNode, currentEvaluator);
    }

    if (fn === "for_each") {                                       // v2
      return this.nativeForEach(callNode, currentEvaluator);
    }

    if (fn === "transform") {                                      // v2
      return this.nativeTransform(callNode, currentEvaluator);
    }

    if (fn === "remove_if") {                                      // v2
      return this.nativeRemoveIf(callNode, currentEvaluator);
    }

    if (fn === "iota") {                                           // v2
      return this.nativeIota(callNode, currentEvaluator);
    }

    if (fn === "rotate") {                                         // v2
      return this.nativeRotate(callNode, currentEvaluator);
    }

    if (fn === "copy") {                                           // v2
      return this.nativeCopy(callNode, currentEvaluator);
    }

    if (fn === "partition") {                                      // v2
      return this.nativePartition(callNode, currentEvaluator);
    }

    if (fn === "unique") {
      return this.nativeUnique(callNode, currentEvaluator);
    }

    if (fn === "next_permutation" || fn === "prev_permutation") {
      return this.nativePermutation(fn, callNode, currentEvaluator);
    }

    if (fn === "lower_bound" || fn === "upper_bound") {
      return this.nativeBinaryBound(fn, callNode, currentEvaluator);
    }

    if (fn === "binary_search") {
      return this.nativeBinarySearch(callNode, currentEvaluator);
    }

    // ── 3. Math functions ─────────────────────────────────────────────────
    const MATH_FUNS: Record<string, (...a: number[]) => number> = {
      sqrt:  Math.sqrt,   cbrt:   Math.cbrt,
      pow:   Math.pow,    exp:    Math.exp,
      log:   Math.log,    log2:   Math.log2,   log10: Math.log10,
      floor: Math.floor,  ceil:   Math.ceil,   round: Math.round,  trunc: Math.trunc,
      sin:   Math.sin,    cos:    Math.cos,    tan:   Math.tan,
      asin:  Math.asin,   acos:   Math.acos,   atan:  Math.atan,   atan2: Math.atan2,
      sinh:  Math.sinh,   cosh:   Math.cosh,   tanh:  Math.tanh,
      fabs:  Math.abs,    fabsf:  Math.abs,    fmod:  (a, b) => a % b,
      hypot: Math.hypot,  ldexp:  (x, e) => x * 2 ** e,
      max:   Math.max,    min:    Math.min,    abs:   Math.abs,
    };
    if (Object.prototype.hasOwnProperty.call(MATH_FUNS, fn)) {
      const args   = callNode.arguments.map(a => currentEvaluator.evaluate(a) as number);
      const result = MATH_FUNS[fn](...args);
      this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL,   { function: fn, args });
      this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, { function: fn, returnValue: result });
      return result;
    }

    // ── 4. Numeric utilities ──────────────────────────────────────────────
    if (fn === "__gcd" || fn === "gcd") {
      let a = Math.abs(currentEvaluator.evaluate(callNode.arguments[0]) as number);
      let b = Math.abs(currentEvaluator.evaluate(callNode.arguments[1]) as number);
      while (b) { [a, b] = [b, a % b]; }
      return a;
    }
    if (fn === "lcm") {
      let a = Math.abs(currentEvaluator.evaluate(callNode.arguments[0]) as number);
      let b = Math.abs(currentEvaluator.evaluate(callNode.arguments[1]) as number);
      if (a === 0 || b === 0) return 0;
      let pa = a, pb = b;
      while (pb) { [pa, pb] = [pb, pa % pb]; }
      return (a / pa) * b;
    }

    // ── 5. Comparator functors ────────────────────────────────────────────
    if (fn.startsWith("greater"))      return ((a: number, b: number) => a > b ? -1 : a < b ? 1 : 0)  as unknown as CppValue;
    if (fn.startsWith("less_equal"))   return ((a: number, b: number) => a <= b ? -1 : 1)              as unknown as CppValue;
    if (fn.startsWith("greater_equal"))return ((a: number, b: number) => a >= b ? -1 : 1)              as unknown as CppValue;
    if (fn.startsWith("less"))         return ((a: number, b: number) => a < b ? -1 : a > b ? 1 : 0)  as unknown as CppValue;

    // ── 6. make_pair / make_tuple / pair ──────────────────────────────────
    if (fn === "make_pair" || fn === "pair") {
      const a0 = currentEvaluator.evaluate(callNode.arguments[0]);
      const a1 = callNode.arguments.length > 1 ? currentEvaluator.evaluate(callNode.arguments[1]) : 0;
      return [a0, a1];
    }
    if (fn === "make_tuple") {
      return callNode.arguments.map(a => currentEvaluator.evaluate(a));
    }

    // ── 7. String utilities ───────────────────────────────────────────────
    if (fn === "to_string")  return String(currentEvaluator.evaluate(callNode.arguments[0]) ?? "");
    if (fn === "stoi"  || fn === "stol"  || fn === "stoll") return parseInt(String(currentEvaluator.evaluate(callNode.arguments[0])), 10);
    if (fn === "stod"  || fn === "stof"  || fn === "stold") return parseFloat(String(currentEvaluator.evaluate(callNode.arguments[0])));
    if (fn === "atoi") return parseInt(String(currentEvaluator.evaluate(callNode.arguments[0])), 10);
    if (fn === "atof") return parseFloat(String(currentEvaluator.evaluate(callNode.arguments[0])));

    // ── 8. Character utilities ────────────────────────────────────────────
    const charFns: Record<string, (ch: string) => CppValue> = {
      toupper:  ch => ch.toUpperCase().charCodeAt(0),
      tolower:  ch => ch.toLowerCase().charCodeAt(0),
      isdigit:  ch => /\d/.test(ch) ? 1 : 0,
      isalpha:  ch => /[a-zA-Z]/.test(ch) ? 1 : 0,
      isalnum:  ch => /[a-zA-Z0-9]/.test(ch) ? 1 : 0,
      islower:  ch => /[a-z]/.test(ch) ? 1 : 0,
      isupper:  ch => /[A-Z]/.test(ch) ? 1 : 0,
      isspace:  ch => /\s/.test(ch) ? 1 : 0,
      ispunct:  ch => /[^\w\s]/.test(ch) ? 1 : 0,
      isprint:  ch => ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) < 127 ? 1 : 0,
    };
    if (Object.prototype.hasOwnProperty.call(charFns, fn)) {
      const c  = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return charFns[fn](ch);
    }

    // ── 9. printf / fprintf ───────────────────────────────────────────────
    if (fn === "printf" || fn === "fprintf") {
      const rawArgs = callNode.arguments.map(a => currentEvaluator.evaluate(a));
      const fmtStr  = String(rawArgs[0] ?? "");
      let   argIdx  = 1;
      const formatted = fmtStr.replace(
        /%[-+0 #]*\d*(?:\.\d+)?[diouxXeEfgGscpn%lh]/g,
        match => match === "%%" ? "%" : String(rawArgs[argIdx++] ?? "")
      );
      this.eventEmitter.emit(callNode.line, EventType.WRITE, { output: formatted });
      return 0;
    }

    // ── 10. assert ────────────────────────────────────────────────────────
    if (fn === "assert") {
      const v = currentEvaluator.evaluate(callNode.arguments[0]);
      if (!v) throw new Error(`Assertion Failed at line ${callNode.line}: assert() evaluated to false.`);
      return undefined;
    }

    // ── 11. Fallback for unrecognized functions ───────────────────────────
    // If we reach here, the function was not an STL polyfill and not defined
    // by the user. We attempt to invoke it anyway, which will throw a linker
    // error inside invokeFunction if it truly doesn't exist.
    const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
    return this.invokeFunction(fn, args, callNode.arguments, currentEvaluator);
  }


  // ==========================================================================
  // SECTION 6 — STL Algorithm Implementations
  // ==========================================================================

  /** Resolves a begin-iterator MethodCall argument to the backing JS array. */
  private resolveContainerArray(
    callNode:         IRFunctionCall,
    currentEvaluator: ExpressionEvaluator,
    argIndex:         number = 0,
  ): any[] | null {
    const arg = callNode.arguments[argIndex];
    if (!arg || arg.kind !== "MethodCall") return null;
    const obj = currentEvaluator.evaluate((arg as any).object);
    return Array.isArray(obj) ? obj : (obj as any)?.data ?? null;
  }

  private nativeSwap(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const [arg1, arg2] = callNode.arguments;

    if (arg1.kind === "SubscriptExpression" && arg2.kind === "SubscriptExpression") {
      const arr1Obj = (arg1 as any).object;
      const arr2Obj = (arg2 as any).object;
      const arr1 = ev.evaluate(arr1Obj);
      const idx1 = ev.evaluate((arg1 as any).index) as number;
      const arr2 = ev.evaluate(arr2Obj);
      const idx2 = ev.evaluate((arg2 as any).index) as number;
      const t1   = Array.isArray(arr1) ? arr1 : (arr1 as any).data;
      const t2   = Array.isArray(arr2) ? arr2 : (arr2 as any).data;
      const tmp  = t1[idx1]; t1[idx1] = t2[idx2]; t2[idx2] = tmp;

      const name1 = arr1Obj.kind === "Identifier" ? arr1Obj.name : "array";
      const name2 = arr2Obj.kind === "Identifier" ? arr2Obj.name : "array";
      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, { variable: `${name1}[${idx1}]`, value: t1[idx1] });
      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, { variable: `${name2}[${idx2}]`, value: t2[idx2] });
    } else if (arg1.kind === "Identifier" && arg2.kind === "Identifier") {
      const v1 = ev.evaluate(arg1);
      const v2 = ev.evaluate(arg2);
      const scope = this.callStack.peek().scopeManager;
      const name1 = (arg1 as any).name;
      const name2 = (arg2 as any).name;
      try { scope.assignVariable(name1, v2); } catch { scope.defineVariable(name1, "auto", v2); }
      try { scope.assignVariable(name2, v1); } catch { scope.defineVariable(name2, "auto", v1); }

      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, { variable: name1, value: v2 });
      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, { variable: name2, value: v1 });
    }
    return undefined;
  }

  private nativeContainerAlgorithm(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return undefined;
    if (fn === "reverse")     { arr.reverse(); return undefined; }
    if (fn === "max_element") return Math.max(...arr);
    if (fn === "min_element") return Math.min(...arr);
    if (fn === "accumulate")  {
      const init = ev.evaluate(callNode.arguments[2]) as number;
      return arr.reduce((acc: number, val: number) => acc + val, init);
    }
    return undefined;
  }

  private nativeSort(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return undefined;
    if (callNode.arguments.length >= 3) {
      const cmp = ev.evaluate(callNode.arguments[2]);
      if (typeof cmp === "function") {
        arr.sort((a, b) => {
          const r = (cmp as Function)(a, b);
          return typeof r === "boolean" ? (r ? -1 : 1) : r as number;
        });
      } else {
        arr.sort((a, b) => a - b);
      }
    } else {
      arr.sort((a, b) => {
        // Lexicographic sort for arrays (pairs/tuples) and strings, numeric for others.
        if (Array.isArray(a) && Array.isArray(b)) {
          for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) return a[i] < b[i] ? -1 : (a[i] > b[i] ? 1 : 0);
          }
          return a.length - b.length;
        }
        if (typeof a === "string" && typeof b === "string") {
          return a < b ? -1 : (a > b ? 1 : 0);
        }
        return (a as any) - (b as any);
      });
    }
    this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL,   { function: fn, args: [] });
    this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, { function: fn, returnValue: undefined });
    return undefined;
  }

  private nativeFill(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return undefined;
    const fillVal = ev.evaluate(callNode.arguments[2]);
    if (fn === "fill_n") {
      const n = ev.evaluate(callNode.arguments[1]) as number;
      for (let i = 0; i < n && i < arr.length; i++) arr[i] = fillVal;
    } else {
      arr.fill(fillVal);
    }
    return undefined;
  }

  private nativeCount(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return 0;
    if (fn === "count") {
      const val = ev.evaluate(callNode.arguments[2]);
      return arr.filter((x: any) => x === val).length;
    }
    const pred = ev.evaluate(callNode.arguments[2]);
    return typeof pred === "function" ? arr.filter((x: any) => (pred as Function)(x)).length : 0;
  }

  /** v2: find and find_if. Returns the 0-based index of the match, or -1. */
  private nativeFind(byPredicate: boolean, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return -1;
    const needle = ev.evaluate(callNode.arguments[2]);
    if (byPredicate) {
      return typeof needle === "function"
        ? arr.findIndex((x: any) => (needle as Function)(x))
        : -1;
    }
    return arr.indexOf(needle);
  }

  /** v2: all_of / any_of / none_of. */
  private nativeQuantifier(
    kind:     "all" | "any" | "none",
    callNode: IRFunctionCall,
    ev:       ExpressionEvaluator,
  ): CppValue {
    const arr  = this.resolveContainerArray(callNode, ev);
    if (!arr) return kind === "all" || kind === "none";
    const pred = ev.evaluate(callNode.arguments[2]);
    if (typeof pred !== "function") return false;
    const fn   = pred as Function;
    if (kind === "all")  return arr.every((x: any)  =>  fn(x));
    if (kind === "any")  return arr.some((x: any)   =>  fn(x));
                         return arr.every((x: any)  => !fn(x));
  }

  /** v2: for_each — applies a function to every element. */
  private nativeForEach(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr  = this.resolveContainerArray(callNode, ev);
    const func = ev.evaluate(callNode.arguments[2]);
    if (arr && typeof func === "function") arr.forEach((x: any) => (func as Function)(x));
    return undefined;
  }

  /** v2: transform — maps each element through a function. */
  private nativeTransform(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const src  = this.resolveContainerArray(callNode, ev, 0);
    const func = ev.evaluate(callNode.arguments[callNode.arguments.length - 1]);
    if (!src || typeof func !== "function") return undefined;
    const mapped = src.map((x: any) => (func as Function)(x));
    // Write back into source array (in-place transform is the most common usage).
    mapped.forEach((v: any, i: number) => { src[i] = v; });
    return undefined;
  }

  /** v2: remove_if — removes elements matching a predicate (in-place). */
  private nativeRemoveIf(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr  = this.resolveContainerArray(callNode, ev);
    const pred = ev.evaluate(callNode.arguments[2]);
    if (!arr || typeof pred !== "function") return arr?.length ?? 0;
    const filtered = arr.filter((x: any) => !(pred as Function)(x));
    arr.splice(0, arr.length, ...filtered);
    return arr.length;
  }

  /** v2: iota — fills range with incrementing values starting at `value`. */
  private nativeIota(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr  = this.resolveContainerArray(callNode, ev);
    const init = ev.evaluate(callNode.arguments[2]) as number;
    if (arr) arr.forEach((_: any, i: number) => { arr[i] = init + i; });
    return undefined;
  }

  /** v2: rotate — left-rotates so middle becomes the new first element. */
  private nativeRotate(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    // middle is the second argument (a number index or iterator value).
    const midVal = callNode.arguments[1];
    if (!arr || !midVal) return undefined;
    let mid: number;
    // If the argument is a MethodCall (e.g. v.begin() + k), extract the value.
    if (midVal.kind === "BinaryExpression") {
      mid = ev.evaluate(midVal) as number;
    } else {
      mid = ev.evaluate(midVal) as number;
    }
    if (mid > 0 && mid < arr.length) {
      arr.push(...arr.splice(0, mid));
    }
    return undefined;
  }

  /** v2: copy — copies elements from source range to destination. */
  private nativeCopy(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const src  = this.resolveContainerArray(callNode, ev, 0);
    const dest = callNode.arguments[2];
    if (!src || !dest) return undefined;
    const destObj = dest.kind === "MethodCall"
      ? ev.evaluate((dest as any).object)
      : ev.evaluate(dest);
    const destArr = Array.isArray(destObj) ? destObj : (destObj as any)?.data;
    if (destArr) src.forEach((v: any, i: number) => { destArr[i] = v; });
    return undefined;
  }

  /** v2: partition — reorders so predicate-true elements precede false ones. */
  private nativePartition(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr  = this.resolveContainerArray(callNode, ev);
    const pred = ev.evaluate(callNode.arguments[2]);
    if (!arr || typeof pred !== "function") return arr?.length ?? 0;
    const trueGroup  = arr.filter((x: any) =>  (pred as Function)(x));
    const falseGroup = arr.filter((x: any) => !(pred as Function)(x));
    trueGroup.push(...falseGroup);
    arr.splice(0, arr.length, ...trueGroup);
    return trueGroup.length; // Returns the partition point index.
  }

  private nativeUnique(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return 0;
    const filtered = arr.filter((v: any, i: number) => i === 0 || v !== arr[i - 1]);
    arr.splice(0, arr.length, ...filtered);
    return arr.length;
  }

  private nativePermutation(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return false;
    const n  = arr.length;
    let   i  = n - 2;
    const isNext = fn === "next_permutation";
    while (i >= 0 && (isNext ? arr[i] >= arr[i+1] : arr[i] <= arr[i+1])) i--;
    if (i < 0) { arr.reverse(); return false; }
    let j = n - 1;
    while (isNext ? arr[j] <= arr[i] : arr[j] >= arr[i]) j--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    arr.splice(i + 1, n - i - 1, ...arr.slice(i + 1).reverse());
    return true;
  }

  private nativeBinaryBound(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev) as number[];
    const val = ev.evaluate(callNode.arguments[2]) as number;
    if (!arr) return 0;
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      (fn === "lower_bound" ? arr[mid] < val : arr[mid] <= val) ? lo = mid + 1 : hi = mid;
    }
    return lo;
  }

  private nativeBinarySearch(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev) as any[];
    const val = ev.evaluate(callNode.arguments[2])!;
    if (!arr) return false;
    let lo = 0, hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if      (arr[mid] < val) lo = mid + 1;
      else if (arr[mid] > val) hi = mid;
      else return true;
    }
    return false;
  }


  // ==========================================================================
  // SECTION 7 — Method call dispatch
  // ==========================================================================

  /**
   * Dispatches STL container method calls by inspecting the backing JS type.
   *
   * Type detection order:
   *   1. Auto-recovery: undefined object → try to create or locate it.
   *   2. JS `Set` / `Map` → dedicated polyfill branch.
   *   3. `string` → string polyfill branch.
   *   4. Array or mock container → array polyfill branch.
   *   5. Direct JS method: if the object has the method as a function, call it.
   */
  public invokeMethodCall(
    methodNode:       IRMethodCall,
    currentEvaluator: ExpressionEvaluator,
  ): CppValue {
    let objInstance: CppValue;
    try {
      objInstance = currentEvaluator.evaluate(methodNode.object);
    } catch {
      objInstance = undefined as any;
    }

    // ── Auto-recovery: undeclared / uninitialized object ─────────────────
    if (!objInstance) {
      if (methodNode.object.kind === "Identifier") {
        const varName = (methodNode.object as any).name;
        objInstance   = [];
        const scope   = this.callStack.peek().scopeManager;
        try { scope.assignVariable(varName, objInstance); }
        catch { scope.defineVariable(varName, "auto", objInstance); }
      } else if (methodNode.object.kind === "SubscriptExpression") {
        const subExpr  = methodNode.object as any;
        const parentObj = currentEvaluator.evaluate(subExpr.object);
        const index     = currentEvaluator.evaluate(subExpr.index) as string | number;
        if (parentObj) {
          objInstance = [];
          if (parentObj instanceof Map) (parentObj as Map<any,any>).set(index, objInstance);
          else if (Array.isArray(parentObj)) (parentObj as any[])[index as number] = objInstance;
          else if ((parentObj as any)?.data) (parentObj as any).data[index as number] = objInstance;
          else (parentObj as any)[index] = objInstance;
        }
      }
    }

    if (objInstance === undefined || objInstance === null) {
      throw new Error(
        `Memory Access Violation at line ${methodNode.line}: ` +
        `Attempted to call method '${methodNode.method}' on a null reference.`
      );
    }

    const args      = methodNode.arguments.map(arg => currentEvaluator.evaluate(arg));
    const method    = methodNode.method;
    const isSet     = objInstance instanceof Set;
    const isMap     = objInstance instanceof Map;
    const isString  = typeof objInstance === "string";
    const isMock    = !isSet && !isMap && !isString &&
                      typeof objInstance === "object" &&
                      "data" in (objInstance as any) &&
                      Array.isArray((objInstance as any).data);
    const isArr     = Array.isArray(objInstance);
    const targetArr = isArr ? objInstance as any[] : (isMock ? (objInstance as any).data : null);

    this.eventEmitter.emit(methodNode.line, EventType.FUNCTION_CALL, { function: method, args });
    let result: any = undefined;
    let handled     = false;

    // ── Set polyfill ───────────────────────────────────────────────────────
    if (isSet) {
      handled = true;
      const s = objInstance as Set<any>;
      switch (method) {
        case "insert":                  s.add(args[0]); result = args[0]; break;
        case "erase": case "remove":    result = s.delete(args[0]); break;
        case "count":
        case "contains":                result = s.has(args[0]) ? 1 : 0; break;
        case "find":                    result = s.has(args[0]) ? args[0] : null; break;
        case "size": case "length":     result = s.size; break;
        case "empty":                   result = s.size === 0; break;
        case "clear":                   s.clear(); break;
        case "begin":                   result = 0; break;
        case "end":                     result = null; break;
        default: handled = false;
      }
    }

    // ── Map polyfill ───────────────────────────────────────────────────────
    else if (isMap) {
      handled = true;
      const m = objInstance as Map<any, any>;
      switch (method) {
        case "insert":
          if (Array.isArray(args[0])) m.set(args[0][0], args[0][1]);
          else if (args.length >= 2)  m.set(args[0], args[1]);
          break;
        case "emplace":                 m.set(args[0], args[1]); break;
        case "erase": case "remove":    result = m.delete(args[0]); break;
        case "count":
        case "contains":                result = m.has(args[0]) ? 1 : 0; break;
        case "find":                    result = m.has(args[0]) ? args[0] : null; break;
        case "at":                      result = m.get(args[0]); break;
        case "size": case "length":     result = m.size; break;
        case "empty":                   result = m.size === 0; break;
        case "clear":                   m.clear(); break;
        case "begin":                   result = 0; break;
        case "end":                     result = null; break;
        default: handled = false;
      }
    }

    // ── String polyfill ────────────────────────────────────────────────────
    else if (isString) {
      handled = true;
      const s = objInstance as string;
      let   newStr: string | undefined;

      switch (method) {
        case "size": case "length":                    result = s.length; break;
        case "empty":                                  result = s.length === 0; break;
        case "at":                                     result = s[args[0] as number] ?? ""; break;
        case "front":                                  result = s[0] ?? ""; break;
        case "back":                                   result = s[s.length - 1] ?? ""; break;
        case "c_str":                                  result = s; break;
        case "substr":
          result = args[1] !== undefined
            ? s.substring(args[0] as number, (args[0] as number) + (args[1] as number))
            : s.substring(args[0] as number);
          break;
        case "find":                                   result = s.indexOf(String(args[0] ?? ""), (args[1] as number) ?? 0); break;
        case "rfind":                                  result = s.lastIndexOf(String(args[0] ?? "")); break;
        case "compare":                                result = s === String(args[0] ?? "") ? 0 : s < String(args[0] ?? "") ? -1 : 1; break;
        case "starts_with":                            result = s.startsWith(String(args[0] ?? "")); break;
        case "ends_with":                              result = s.endsWith(String(args[0] ?? "")); break;
        case "contains":                               result = s.includes(String(args[0] ?? "")); break;
        case "count":                                  result = (s.match(new RegExp(String(args[0] ?? ""), "g")) || []).length; break;
        case "begin":                                  result = 0; break;
        case "end":                                    result = s.length; break;
        // Mutating methods — return new string; write-back to variable.
        case "append": case "push_back":               newStr = s + String(args[0] ?? ""); break;
        case "pop_back":                               newStr = s.slice(0, -1); break;
        case "insert":                                 newStr = s.slice(0, args[0] as number) + String(args[1] ?? "") + s.slice(args[0] as number); break;
        case "erase": {
          const pos = (args[0] as number) ?? 0;
          const n   = (args[1] as number) ?? (s.length - pos);
          newStr = s.slice(0, pos) + s.slice(pos + n);
          break;
        }
        case "replace": {
          const rp = (args[0] as number) ?? 0;
          const rn = (args[1] as number) ?? 0;
          newStr = s.slice(0, rp) + String(args[2] ?? "") + s.slice(rp + rn);
          break;
        }
        case "clear":                                  newStr = ""; break;
        case "resize":                                 newStr = s.substring(0, args[0] as number).padEnd(args[0] as number, String(args[1] ?? "\0")); break;
        case "tolower": case "lower":                  newStr = s.toLowerCase(); break;
        case "toupper": case "upper":                  newStr = s.toUpperCase(); break;
        case "to_string":                              result = s; break;
        default: handled = false;
      }

      // Write-back mutated string to the variable in scope.
      if (newStr !== undefined) {
        result = newStr;
        if (methodNode.object.kind === "Identifier") {
          const varName = (methodNode.object as any).name;
          try {
            this.callStack.peek().scopeManager.assignVariable(varName, newStr);
          } catch { /* Variable may have been defined in a parent frame — benign. */ }
        }
      }
    }

    // ── Mock Container Method ─────────────────────────────────────────────
    else if (isMock && typeof (objInstance as any)[method] === "function") {
      result = (objInstance as any)[method](...args);
      handled = true;
    }

    // ── Struct Method ─────────────────────────────────────────────────────
    if (!handled && objInstance && typeof objInstance === "object" && (objInstance as Record<string, any>).__type) {
      const typeName = (objInstance as Record<string, any>).__type;
      const blueprint = this.classBlueprints.get(typeName);
      if (blueprint && blueprint.methods) {
        // Find best match method (by name and parameter count)
        const methodDecl = blueprint.methods.find(m => m.name === method && m.parameters.length === args.length) || 
                           blueprint.methods.find(m => m.name === method);
        if (methodDecl) {
          result = this.invokeStructMethod((objInstance as Record<string, any>), typeName, methodDecl, args);
          handled = true;
        }
      }
    }

    // ── Array / mock container polyfill fallback ──────────────────────────
    else if (!handled && targetArr !== null) {
      handled = true;
      switch (method) {
        case "size": case "length":     result = targetArr.length; break;
        case "empty":                   result = targetArr.length === 0; break;
        case "push_back": case "push":  targetArr.push(cloneRuntimeValue(args[0])); result = args[0]; break;
        case "push_front":              targetArr.unshift(cloneRuntimeValue(args[0])); result = args[0]; break;
        case "pop_back": case "pop":    result = targetArr.pop(); break;
        case "pop_front":               result = targetArr.shift(); break;
        case "front":                   result = targetArr[0]; break;
        case "back": case "top":        result = targetArr[targetArr.length - 1]; break;
        case "at":                      result = targetArr[args[0] as number]; break;
        case "find": case "search":     result = targetArr.indexOf(args[0]); break;
        case "contains":                result = targetArr.includes(args[0]); break;
        case "begin":                   result = 0; break;
        case "end":                     result = targetArr.length; break;
        case "insert":
          if (args.length === 1) targetArr.push(cloneRuntimeValue(args[0]));
          else if (typeof args[0] === "number") targetArr.splice(args[0] as number, 0, cloneRuntimeValue(args[1]));
          break;
        case "erase": {
          const idx = typeof args[0] === "number" ? args[0] as number : targetArr.indexOf(args[0]);
          if (idx >= 0 && idx < targetArr.length) { targetArr.splice(idx, 1); result = true; }
          else result = false;
          break;
        }
        case "remove": {
          const ri = targetArr.indexOf(args[0]);
          if (ri !== -1) { targetArr.splice(ri, 1); result = true; } else result = false;
          break;
        }
        case "clear":
          if (isArr) (objInstance as any[]).length = 0;
          else (objInstance as any).data = [];
          break;
        case "resize": {
          const newSize = args[0] as number;
          const fill    = args[1] ?? 0;
          while (targetArr.length < newSize) targetArr.push(fill);
          while (targetArr.length > newSize) targetArr.pop();
          break;
        }
        case "assign":                  targetArr.fill(args[1], 0, args[0] as number); break;
        case "swap": {
          const other = Array.isArray(args[0]) ? args[0] : (args[0] as any)?.data;
          if (other) {
            const tmp = [...targetArr];
            targetArr.splice(0, targetArr.length, ...other);
            other.splice(0, other.length, ...tmp);
          }
          break;
        }
        case "print":
          result = `[${targetArr.join(" -> ")}]`;
          console.log(result);
          break;
        default: handled = false;
      }
    }

    // ── Direct JS method fallback ─────────────────────────────────────────
    if (!handled && !isSet && !isMap && !isString) {
      const methodFn = (objInstance as Record<string, any>)[method];
      if (typeof methodFn === "function") {
        result  = methodFn.call(objInstance, ...args);
        handled = true;
      }
    }

    if (!handled) {
      throw new Error(
        `Linker Error at line ${methodNode.line}: ` +
        `Method '${method}' is not defined on this object type.`
      );
    }

    this.eventEmitter.emit(methodNode.line, EventType.FUNCTION_RETURN, {
      function:    method,
      returnValue: result,
    });
    return result;
  }


  // ==========================================================================
  // SECTION 8 — Frame invocation
  // ==========================================================================

  /**
   * Pushes a new execution frame, binds parameters, runs the function body,
   * mirrors static variables back to staticStorage, and pops the frame.
   *
   * v2 additions:
   *   - Enum member constants are injected into every frame's base scope so
   *     user code can reference `NORTH`, `RED`, etc. without qualification.
   *   - Static variables are re-injected from staticStorage on each call and
   *     mirrored back in the `finally` block.
   *   - The input provider is installed on every new ExpressionEvaluator.
   *   - StatementExecutor receives typeAliases, enumBlueprints, staticStorage,
   *     and currentFunction so it can resolve aliases and handle statics.
   */
  private invokeFunction(
    target:          string | any,
    args:            CppValue[],
    rawArgs?:        IRExpression[],
    callerEvaluator?: ExpressionEvaluator,
  ): CppValue {
    const isLambda = typeof target === "object" && target?.kind === "LambdaExpression";
    const name     = isLambda ? "<lambda>" : (target as string);
    const func     = isLambda ? target : this.functions.get(name);

    // ── Constructor auto-recovery for unknown types ────────────────────────
    if (!func) {
      if (args.length === 1 && typeof args[0] === "number") return new Array(args[0]).fill(0);
      if (args.length === 2 && typeof args[0] === "number") return new Array(args[0]).fill(args[1]);
      throw new Error(`Linker Error: Undefined reference to function '${name}'.`);
    }

    if (args.length > func.parameters.length) {
      throw new Error(
        `Parameter Mismatch: '${name}' expects ${func.parameters.length} ` +
        `argument(s) but received ${args.length}.`
      );
    }

    const callerScope = this.callStack.isEmpty() ? null : this.callStack.peek().scopeManager;
    const frame       = this.callStack.push(name);

    this.eventEmitter.emit(func.line, EventType.FUNCTION_CALL, { function: name, args });

    // ── Inject global variables ───────────────────────────────────────────
    for (const [gName, gData] of this.globalVariables) {
      try { 
        frame.scopeManager.injectIntoBase(gName, gData.type, {
           __ref: gName,
           __callerScope: this.globalScopeManager
        }); 
      } catch { /* already present */ }
    }

    // ── Inject enum member constants (v2) ─────────────────────────────────
    // All enum members are visible in every function scope without qualification.
    for (const [memberName, memberValue] of this.resolvedEnumValues) {
      try { frame.scopeManager.injectIntoBase(memberName, "int", memberValue, true, false); } catch { /* already present */ }
    }

    // ── Re-inject static local variables from persistent storage (v2) ─────
    for (const [key, value] of this.staticStorage) {
      const [funcName, varName] = (key as string).split("::");
      if (funcName === name) {
        try { frame.scopeManager.injectIntoBase(varName, "auto", value, false, true); } catch { /* ok */ }
      }
    }

    // ── Bind parameters ───────────────────────────────────────────────────
    func.parameters.forEach((param: any, index: number) => {
      let paramType = param.type as CppType;
      if (paramType.includes("[]") || paramType.includes("*")) paramType = "array" as any;
      let argValue  = index < args.length ? args[index] : undefined;

      // Pass-by-reference: inject a proxy object instead of the value.
      if (
        param.isReference &&
        rawArgs && index < rawArgs.length &&
        rawArgs[index].kind === "Identifier"
      ) {
        argValue = { __ref: (rawArgs[index] as any).name, __callerScope: callerScope };
      }
      // Default parameter value.
      else if (argValue === undefined && param.defaultValue && callerEvaluator) {
        argValue = callerEvaluator.evaluate(param.defaultValue);
      }

      // C++ pass-by-value deep clones all passed structures (maps, vectors, etc).
      if (!param.isReference && argValue !== undefined) {
        argValue = cloneRuntimeValue(argValue);
      }

      frame.scopeManager.defineVariable(param.name, paramType, argValue);
    });

    // ── Set up evaluator, executor, and walker ────────────────────────────
    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.eventEmitter);
    evaluator.setInputProvider(() => this.provideInput());   // v2: cin support
    this.attachEvaluationInterceptor(evaluator);

    const executor = new StatementExecutor(
      frame.scopeManager,
      evaluator,
      this.eventEmitter,
      this.classBlueprints,
      this.enumBlueprints,    // v2
      this.typeAliases,       // v2
      this.staticStorage,     // v2
      name,                   // v2: current function name for static storage keys
      (typeName, args) => this.instantiateStructAndExecuteConstructor(typeName, args, evaluator) // v2
    );

    const walker = new IRWalker(frame.scopeManager, evaluator, executor, this.eventEmitter);
    walker.setBreakpoints(this.breakpoints);                 // v2: debugger

    // ── Execute function body ─────────────────────────────────────────────
    let returnValue: CppValue = undefined;
    try {
      walker.walkBlock(func.body);
    } catch (e) {
      if (e instanceof ReturnSignal)    returnValue = e.value;
      else if (e instanceof BreakpointSignal) throw e;   // Let run() catch it.
      else throw e;
    } finally {
      // v2: Mirror static variable values back to persistent storage.
      if (name !== "<lambda>" && name !== "__global_init__") {
        const statics = frame.scopeManager.getStaticSymbols();
        for (const [varName, value] of Object.entries(statics)) {
          const key = `${name}::${varName}` as StaticStorageKey;
          this.staticStorage.set(key, value);
        }
      }

      this.eventEmitter.emit(func.line, EventType.FUNCTION_RETURN, {
        function:    name,
        returnValue,
      });
      this.callStack.pop();
    }

    return returnValue;
  }


  // ==========================================================================
  // SECTION 9 — Evaluator interceptor
  // ==========================================================================

  /**
   * Instantiates a struct and executes its constructor block.
   */
  private instantiateStructAndExecuteConstructor(
    typeName: string,
    args: IRExpression[],
    callerEvaluator: ExpressionEvaluator
  ): Record<string, any> {
    const blueprint = this.classBlueprints.get(typeName)!;
    const instance: Record<string, any> = { __type: typeName };

    // Apply default field values.
    for (const field of blueprint.fields) {
      instance[field.name] = field.defaultValue
        ? callerEvaluator.evaluate(field.defaultValue)
        : (field.type.includes("[]") ? [] : 0);
    }

    const evaluatedArgs = args.map(arg => callerEvaluator.evaluate(arg));

    if (blueprint.constructors && blueprint.constructors.length > 0) {
      console.log(`[DEBUG] Found ${blueprint.constructors.length} constructors for ${typeName}!`);
      const ctor = blueprint.constructors.find(c => c.parameters.length === evaluatedArgs.length) || blueprint.constructors[0];
      this.invokeStructMethod(instance, typeName, ctor, evaluatedArgs);
    } else {
      // Positional args fallback
      evaluatedArgs.forEach((v, i) => {
        if (i < blueprint.fields.length) instance[blueprint.fields[i].name] = v;
      });
    }

    return instance;
  }

  /**
   * Executes a struct method or constructor.
   */
  private invokeStructMethod(
    instance: Record<string, any>,
    typeName: string,
    methodDecl: IRFunctionDeclaration,
    args: CppValue[]
  ): CppValue {
    const frame = this.callStack.push(`${typeName}::${methodDecl.name}`);
    
    // Inject 'this' pointer
    console.log(`[Engine DEBUG] 🛠 invokeStructMethod for ${typeName}::${methodDecl.name}, instance keys:`, Object.keys(instance));
    frame.scopeManager.defineVariable("this", typeName, instance);
    console.log(`[Engine DEBUG] ✅ 'this' injected. instance =`, instance);
    
    // Support implicit 'this' (e.g. `value = 5;` instead of `this->value = 5;`)
    const structScope = {
      getVariable: (name: string) => {
        if (name in instance) return { name, type: "auto", value: instance[name] };
        throw new Error(`Member ${name} not found in ${typeName}`);
      },
      assignVariable: (name: string, value: any) => {
        if (name in instance) instance[name] = value;
        else throw new Error(`Member ${name} not found in ${typeName}`);
      }
    } as any;
    
    // Collect constructor parameter names FIRST so we can skip member fields
    // that share a name with a parameter (e.g. `TreeNode(int value)` where
    // `value` is also a member field). The parameter wins in the local scope;
    // `this->value` still resolves correctly because `this` is always present.
    const paramNames = new Set(methodDecl.parameters.map((p: any) => p.name));

    for (const key of Object.keys(instance)) {
      if (key !== "__type" && !paramNames.has(key)) {
        frame.scopeManager.defineVariable(key, "auto", {
           __ref: key,
           __callerScope: structScope
        });
      }
    }

    // Bind parameters
    methodDecl.parameters.forEach((param: any, index: number) => {
      let paramType = param.type as CppType;
      if (paramType.includes("[]") || paramType.includes("*")) paramType = "array" as any;
      let argValue  = index < args.length ? args[index] : undefined;
      if (argValue !== undefined) argValue = cloneRuntimeValue(argValue);
      console.log(`[Engine DEBUG] 🔗 Binding param '${param.name}' = ${argValue}`);
      frame.scopeManager.defineVariable(param.name, paramType, argValue);
    });

    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.eventEmitter);
    evaluator.setInputProvider(() => this.provideInput());
    this.attachEvaluationInterceptor(evaluator);

    const executor = new StatementExecutor(
      frame.scopeManager, evaluator, this.eventEmitter,
      this.classBlueprints, this.enumBlueprints, this.typeAliases, this.staticStorage, typeName,
      (tName, tArgs) => this.instantiateStructAndExecuteConstructor(tName, tArgs, evaluator)
    );

    const walker = new IRWalker(frame.scopeManager, evaluator, executor, this.eventEmitter);
    walker.setBreakpoints(this.breakpoints);

    let returnValue: CppValue = undefined;
    try {
      walker.walkBlock(methodDecl.body);
    } catch (e) {
      if (e instanceof ReturnSignal) returnValue = e.value;
      else if (e instanceof BreakpointSignal) throw e;
      else throw e;
    } finally {
      this.callStack.pop();
    }
    return returnValue;
  }

  /**
   * Patches ExpressionEvaluator.evaluate() to redirect the node kinds that
   * require engine-level handling before the evaluator sees them.
   *
   * Intercepted kinds:
   *   FunctionCall    → invokeFunctionCall()
   *   MethodCall      → invokeMethodCall()
   *   NewExpression   → struct/array instantiation
   *   LambdaExpression → closure creation with captured scope
   *   UnaryExpression(*) → pointer dereference no-op
   *   Identifier(endl / nullptr) → sentinel values
   *
   * v2: Also handles SizeofExpression when the operand's type is not in
   * scope (falls back to the type-size table in ExpressionEvaluator).
   */
  private attachEvaluationInterceptor(evaluator: ExpressionEvaluator): void {
    const originalEvaluate = evaluator.evaluate.bind(evaluator);

    evaluator.evaluate = (expr): CppValue => {

      if (expr.kind === "FunctionCall") {
        return this.invokeFunctionCall(expr as IRFunctionCall, evaluator);
      }

      if (expr.kind === "MethodCall") {
        return this.invokeMethodCall(expr as IRMethodCall, evaluator);
      }

      // Pointer dereference is a no-op in the duck-typed JS runtime.
      if (expr.kind === "UnaryExpression" && (expr as any).operator === "*") {
        return evaluator.evaluate((expr as any).argument);
      }

      if (expr.kind === "NewExpression") {
        const newExpr      = expr as IRNewExpression;
        
        // `new T[n]` → array of n zeros.
        if (newExpr.typeName.includes("[")) {
          const evaluatedArgs = newExpr.arguments.map(arg => evaluator.evaluate(arg));
          const size = evaluatedArgs[0] as number;
          return typeof size === "number" ? new Array(size).fill(0) : [];
        }

        // Known struct blueprint.
        if (this.classBlueprints.has(newExpr.typeName)) {
          return this.instantiateStructAndExecuteConstructor(newExpr.typeName, newExpr.arguments, evaluator);
        }

        // Generic node heuristic (linked list / tree node).
        const evaluatedArgs = newExpr.arguments.map(arg => evaluator.evaluate(arg));
        const newObj: Record<string, any> = {
          val:   evaluatedArgs[0] ?? 0,
          value: evaluatedArgs[0] ?? 0,
          data:  evaluatedArgs[0] ?? 0,
          next:  evaluatedArgs[1] ?? null,
          left:  evaluatedArgs[1] ?? null,
          right: evaluatedArgs[2] ?? null,
        };
        return newObj;
      }

      if (expr.kind === "LambdaExpression") {
        const lambdaExpr    = expr as IRLambdaExpression;
        const definitionScope = this.callStack.peek().scopeManager;

        return ((...args: any[]) => {
          const lambdaFrame = this.callStack.push("<lambda>");

          // Capture all variables visible at definition time (capture-by-value).
          const captured = definitionScope.captureState();
          for (const [vName, vSym] of Object.entries(captured)) {
            lambdaFrame.scopeManager.defineVariable(vName, (vSym as any).type ?? "auto", (vSym as any).value);
          }

          // Bind lambda parameters.
          lambdaExpr.parameters.forEach((param, i) => {
            lambdaFrame.scopeManager.defineVariable(param.name, param.type, args[i]);
          });

          const localEval = new ExpressionEvaluator(lambdaFrame.scopeManager, this.eventEmitter);
          localEval.setInputProvider(() => this.provideInput());
          this.attachEvaluationInterceptor(localEval);

          const localExec = new StatementExecutor(
            lambdaFrame.scopeManager, localEval, this.eventEmitter,
            this.classBlueprints, this.enumBlueprints, this.typeAliases,
            this.staticStorage, "<lambda>",
            (typeName, args) => this.instantiateStructAndExecuteConstructor(typeName, args, localEval)
          );
          const localWalker = new IRWalker(
            lambdaFrame.scopeManager, localEval, localExec, this.eventEmitter
          );
          localWalker.setBreakpoints(this.breakpoints);

          let retVal: any = undefined;
          try { localWalker.walkBlock(lambdaExpr.body); }
          catch (e) { if (e instanceof ReturnSignal) retVal = e.value; else throw e; }
          finally   { this.callStack.pop(); }
          return retVal;
        }) as unknown as CppValue;
      }

      // Sentinel identifier overrides (belt-and-suspenders — ExpressionEvaluator
      // also handles these, but the interceptor catches them first).
      if (expr.kind === "Identifier") {
        if ((expr as any).name === "endl")    return "\n";
        if ((expr as any).name === "nullptr" || (expr as any).name === "NULL") return null;
      }

      return originalEvaluate(expr);
    };
  }
}