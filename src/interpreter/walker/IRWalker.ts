// ============================================================================
// IRWalker.ts — Control-flow orchestrator for the IR execution tree.
//
// The IRWalker is the sole owner of loop/block/try-catch control-flow logic.
// It receives an IRBlock and executes each statement by dispatching to one of:
//   - StatementExecutor  (for declarations, assignments, cout, return, throw)
//   - ExpressionEvaluator (for expression statements and loop conditions)
//   - Its own private walk* methods (for all structural/control-flow nodes)
//
// Signal protocol:
//   All C++ jump semantics are modelled as custom Error subclasses thrown
//   through the JS call stack and caught at the appropriate structural boundary:
//
//     Signal            Thrown by              Caught by
//     ─────────────────────────────────────────────────────────────────────
//     ReturnSignal      executeReturn()        ExecutionEngine.invokeFunction
//     BreakSignal       walkStatement(Break)   loop walkers + walkSwitchStatement
//     ContinueSignal    walkStatement(Continue) loop walkers only
//     ThrowSignal       executeThrow()         walkTryStatement (or propagates)
//     BreakpointSignal  walkStatement (all)    ExecutionEngine.run()
//
// Scope management:
//   walkBlock() is the ONLY place that calls enterScope() / exitScope().
//   It wraps the exit in a `finally` block so the scope is always cleaned up
//   even when a signal propagates mid-block.
//   walkForStatement() adds one extra scope level for the loop initialiser
//   (`int i = 0`) so it is isolated from the surrounding function scope.
//
// Loop safety:
//   Every loop walker maintains a safety counter and throws a descriptive
//   Error (not a signal) when MAX_LOOP_ITERATIONS is exceeded. This prevents
//   browser tab hangs from infinite loops in user code.
//
// Extension history:
//   v1 — Initial: walkBlock, walkIfStatement, walkWhileStatement,
//        walkDoWhileStatement, walkForStatement, walkForRangeStatement,
//        walkSwitchStatement.
//   v2 — Added: walkTryStatement (with ThrowSignal type matching);
//               IRThrowStatement dispatch → StatementExecutor.executeThrow();
//               IRGotoStatement dispatch → descriptive UnsupportedFeatureError;
//               IRLabeledStatement dispatch → label ignored, inner stmt runs;
//               comma expression evaluation in for-loop update clause;
//               BreakpointSignal check in walkStatement (debugger support).
// ============================================================================

import type {
  IRBlock,
  IRNode,
  IRIfStatement,
  IRWhileStatement,
  IRDoWhileStatement,
  IRForStatement,
  IRForRangeStatement,
  IRSwitchStatement,
  IRTryStatement,
  IRThrowStatement,
  IRGotoStatement,
  IRLabeledStatement,
  IRCommaExpression,
} from "../ir/IRNode";
import {
  BreakSignal,
  ContinueSignal,
  ThrowSignal,
  BreakpointSignal,
} from "../utils/helpers";
import { ScopeManager }        from "../runtime/ScopeManager";
import { EventEmitter }        from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { StatementExecutor }   from "../executor/StatementExecutor";
import { EventType }           from "../types";
import type { Breakpoint }     from "../types";


// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Maximum iterations allowed for any single loop before the engine aborts.
 *
 * 100,000 is enough for O(n²) algorithms on n=300 inputs and O(n log n)
 * algorithms on n=10,000 inputs — both common in competitive programming.
 * Infinite loops are caught well before the browser becomes unresponsive.
 *
 * Note: This limit applies per-loop, not per-run. A program with two
 * sequential loops of 50,000 iterations each will run without hitting it.
 */
const MAX_LOOP_ITERATIONS = 100_000;


// ─── UnsupportedFeatureError ──────────────────────────────────────────────────

/**
 * Thrown when the walker encounters a valid C++ construct that the engine
 * does not yet support (currently: goto).
 *
 * Distinct from a generic Error so the UI can render a targeted
 * "unsupported feature" message rather than a generic runtime error panel.
 */
export class UnsupportedFeatureError extends Error {
  public readonly feature: string;

  constructor(feature: string, detail: string) {
    super(
      `Unsupported Feature: '${feature}' is not supported by this interpreter. ${detail}`
    );
    this.feature = feature;
    Object.setPrototypeOf(this, UnsupportedFeatureError.prototype);
  }
}


// ─── IRWalker ─────────────────────────────────────────────────────────────────

export class IRWalker {

  /**
   * Active breakpoints. Populated by ExecutionEngine via setBreakpoints().
   * Keyed by 1-based line number for O(1) lookup in walkStatement.
   */
  private breakpoints: Map<number, Breakpoint>;

  constructor(
    private scopeManager:  ScopeManager,
    private evaluator:     ExpressionEvaluator,
    private executor:      StatementExecutor,
    private eventEmitter:  EventEmitter,
  ) {
    this.breakpoints = new Map();
  }


  // ── Debugger Configuration ────────────────────────────────────────────────

  /**
   * Installs the set of active breakpoints. Called by ExecutionEngine before
   * run() begins. The walker checks `this.breakpoints` at the top of every
   * walkStatement() call.
   *
   * @param breakpoints - Array of Breakpoint descriptors (line, condition, enabled).
   */
  public setBreakpoints(breakpoints: Breakpoint[]): void {
    this.breakpoints.clear();
    for (const bp of breakpoints) {
      if (bp.enabled !== false) {
        this.breakpoints.set(bp.line, bp);
      }
    }
  }


  // ==========================================================================
  // SECTION 1 — Block execution
  // ==========================================================================

  /**
   * Executes a block of statements inside a strictly isolated memory scope.
   *
   * Scope lifecycle:
   *   enterScope() is called before any statement runs.
   *   exitScope() is called in `finally` so the scope is always cleaned up,
   *   even when ReturnSignal, BreakSignal, ThrowSignal, or BreakpointSignal
   *   propagates out of the block mid-execution.
   *
   * This is the ONLY method that calls enterScope / exitScope.
   * walkForStatement adds its own extra scope for the loop initialiser,
   * but that scope is also cleaned up in its own `finally` block.
   *
   * @param block - The IRBlock whose statements are to be executed.
   */
  public walkBlock(block: IRBlock): void {
    this.scopeManager.enterScope();
    try {
      for (const statement of block.statements) {
        this.walkStatement(statement);
      }
    } finally {
      // Always exit the scope, even if a signal or exception propagates.
      this.scopeManager.exitScope();
    }
  }


  // ==========================================================================
  // SECTION 2 — Statement dispatcher
  // ==========================================================================

  /**
   * Routes an IR statement node to the correct execution handler.
   *
   * Breakpoint check:
   *   Before dispatching, walkStatement checks whether the statement's line
   *   has a registered breakpoint. If so, it:
   *     1. Evaluates the optional condition expression (if any).
   *     2. Emits a BREAKPOINT event.
   *     3. Throws BreakpointSignal.
   *   ExecutionEngine.run() catches BreakpointSignal and enters paused state.
   *
   * @param stmt - Any IRNode that can appear inside an IRBlock.
   */
  public walkStatement(stmt: IRNode): void {

    // ── Breakpoint check ─────────────────────────────────────────────────────
    if (this.breakpoints.size > 0) {
      const bp = this.breakpoints.get((stmt as any).line);
      if (bp) {
        // Evaluate condition if present; fire only when condition is truthy (or absent).
        let shouldBreak = true;
        if (bp.condition) {
          try {
            // The condition expression was pre-parsed by ExecutionEngine and
            // stored as an IRExpression on the Breakpoint object.
            const condVal = this.evaluator.evaluate((bp as any).conditionExpr);
            shouldBreak   = Boolean(condVal);
          } catch {
            // If condition evaluation fails, default to firing the breakpoint.
            shouldBreak = true;
          }
        }

        if (shouldBreak) {
          this.eventEmitter.emit((stmt as any).line, EventType.BREAKPOINT, {
            line:      (stmt as any).line,
            condition: bp.condition,
          });
          throw new BreakpointSignal((stmt as any).line);
        }
      }
    }

    // ── Statement routing ─────────────────────────────────────────────────────
    switch (stmt.kind) {

      // ── Memory mutations ───────────────────────────────────────────────────
      case "VariableDeclaration":
        this.executor.executeVariableDeclaration(stmt);
        break;

      case "Assignment":
        this.executor.executeAssignment(stmt);
        break;

      // ── I/O ───────────────────────────────────────────────────────────────
      case "CoutStatement":
        this.executor.executeCout(stmt);
        break;

      // ── Expression statements ──────────────────────────────────────────────
      case "ExpressionStatement":
        this.executor.executeExpressionStatement(stmt);
        break;

      // ── Control flow — jumps ───────────────────────────────────────────────
      case "ReturnStatement":
        this.executor.executeReturn(stmt);   // Always throws ReturnSignal
        break;

      case "ThrowStatement":                 // v2
        this.executor.executeThrow(stmt as IRThrowStatement);  // Throws ThrowSignal
        break;

      case "BreakStatement":
        // Throw BreakSignal to exit the nearest enclosing loop or switch.
        throw new BreakSignal();

      case "ContinueStatement":
        // Throw ContinueSignal to skip to the update/condition of the nearest loop.
        throw new ContinueSignal();

      // ── Control flow — structural ──────────────────────────────────────────
      case "IfStatement":
        this.walkIfStatement(stmt as IRIfStatement);
        break;

      case "WhileStatement":
        this.walkWhileStatement(stmt as IRWhileStatement);
        break;

      case "DoWhileStatement":
        this.walkDoWhileStatement(stmt as IRDoWhileStatement);
        break;

      case "ForStatement":
        this.walkForStatement(stmt as IRForStatement);
        break;

      case "ForRangeStatement":
        this.walkForRangeStatement(stmt as IRForRangeStatement);
        break;

      case "SwitchStatement":
        this.walkSwitchStatement(stmt as IRSwitchStatement);
        break;

      case "TryStatement":                   // v2
        this.walkTryStatement(stmt as IRTryStatement);
        break;

      case "GotoStatement":                  // v2
        this.walkGotoStatement(stmt as IRGotoStatement);
        break;

      case "LabeledStatement":               // v2
        this.walkLabeledStatement(stmt as IRLabeledStatement);
        break;

      case "Block":
        // Standalone nested block `{ ... }` appearing as a statement.
        this.walkBlock(stmt as IRBlock);
        break;

      case "EmptyStatement":
        // No-op: semicolons, comments, preprocessor directives.
        break;

      default:
        // Unknown statement kind: emit a warning but do not crash.
        // This prevents a single unrecognised node from aborting the whole run.
        console.warn(
          `[IRWalker.walkStatement] Unknown statement kind '${(stmt as any).kind}' ` +
          `at line ${(stmt as any).line}. Skipping.`
        );
        break;
    }
  }


  // ==========================================================================
  // SECTION 3 — Conditional / branch walkers
  // ==========================================================================

  /**
   * Executes an if / else-if / else chain.
   *
   * Always emits a CONDITION event so the UI can highlight the condition line
   * and show the evaluation result, regardless of which branch is taken.
   */
  private walkIfStatement(stmt: IRIfStatement): void {
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });

    if (conditionValue) {
      this.walkBlock(stmt.consequent);
    } else if (stmt.alternate) {
      this.walkBlock(stmt.alternate);
    }
  }

  /**
   * Executes a switch / case / default statement with correct fallthrough semantics.
   *
   * Fallthrough model:
   *   Once a matching case is found (or default is reached), `fallthrough` is set
   *   to true and all subsequent case bodies execute without re-checking values.
   *   A BreakSignal exits the switch; any other signal (ContinueSignal,
   *   ReturnSignal, ThrowSignal) is re-thrown to be caught by the enclosing
   *   loop, function, or try block.
   *
   * Scope note:
   *   No extra scope is pushed for the switch body (matching C++ semantics where
   *   variables declared in cases share the outer scope unless wrapped in `{}`).
   */
  private walkSwitchStatement(stmt: IRSwitchStatement): void {
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });

    let fallthrough = false;

    try {
      for (const caseClause of stmt.cases) {
        // Activate the matching case.
        if (!fallthrough && !caseClause.isDefault) {
          const caseValue = caseClause.value
            ? this.evaluator.evaluate(caseClause.value)
            : undefined;
          if (caseValue === conditionValue) fallthrough = true;
        }

        // `default` always activates fallthrough when reached.
        if (caseClause.isDefault && !fallthrough) fallthrough = true;

        if (fallthrough) {
          for (const caseStmt of caseClause.statements) {
            this.walkStatement(caseStmt);
          }
        }
      }
    } catch (e: any) {
      // BreakSignal exits the switch — this is the correct behaviour.
      if (e instanceof BreakSignal || e?.name === "BreakSignal") return;
      // All other signals (Continue, Return, Throw, Breakpoint) propagate.
      throw e;
    }
  }


  // ==========================================================================
  // SECTION 4 — Loop walkers
  // ==========================================================================

  /**
   * Executes a while loop.
   *
   * The condition is re-evaluated before every iteration. A CONDITION event is
   * emitted each time so the UI can show which iteration caused the loop to exit.
   * BreakSignal exits the loop; ContinueSignal restarts from the condition check.
   */
  private walkWhileStatement(stmt: IRWhileStatement): void {
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "while" });

    let safetyCounter = 0;
    while (true) {
      if (++safetyCounter > MAX_LOOP_ITERATIONS) {
        throw new Error(
          `Runtime Exception at line ${stmt.line}: ` +
          `Infinite loop detected — while loop exceeded ${MAX_LOOP_ITERATIONS} iterations. ` +
          `Check your loop condition.`
        );
      }

      const conditionValue = this.evaluator.evaluate(stmt.condition);
      this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
      if (!conditionValue) break;

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });

      try {
        this.walkBlock(stmt.body);
      } catch (e: any) {
        if (e instanceof BreakSignal    || e?.name === "BreakSignal")    break;
        if (e instanceof ContinueSignal || e?.name === "ContinueSignal") continue;
        throw e;  // ReturnSignal, ThrowSignal, BreakpointSignal bubble up.
      }
    }

    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "while" });
  }

  /**
   * Executes a do-while loop.
   *
   * The body executes at least once before the condition is checked.
   * ContinueSignal falls through to the condition check at the bottom of the
   * loop body, then decides whether to iterate again.
   */
  private walkDoWhileStatement(stmt: IRDoWhileStatement): void {
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "do-while" });

    let safetyCounter = 0;
    do {
      if (++safetyCounter > MAX_LOOP_ITERATIONS) {
        throw new Error(
          `Runtime Exception at line ${stmt.line}: ` +
          `Infinite loop detected — do-while loop exceeded ${MAX_LOOP_ITERATIONS} iterations.`
        );
      }

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });

      try {
        this.walkBlock(stmt.body);
      } catch (e: any) {
        if (e instanceof BreakSignal || e?.name === "BreakSignal") {
          this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "do-while" });
          return;
        }
        if (e instanceof ContinueSignal || e?.name === "ContinueSignal") {
          // Fall through to the condition check below — do NOT `continue` the JS loop.
        } else {
          throw e;
        }
      }

      const conditionValue = this.evaluator.evaluate(stmt.condition);
      this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
      if (!conditionValue) break;

    } while (true);

    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "do-while" });
  }

  /**
   * Executes a traditional for loop.
   *
   * An extra scope level is pushed before the initialiser and popped in the
   * `finally` block, isolating `int i = 0` from the enclosing function scope.
   *
   * The update clause supports three forms:
   *   - IRAssignment    → executeAssignment()
   *   - IRCommaExpression (v2) → evaluateCommaExpression() (left then right)
   *   - Any IRExpression → evaluator.evaluate()
   *
   * ContinueSignal skips the body remainder but still runs the update clause
   * and rechecks the condition, which is the correct C++ continue semantics.
   */
  public walkForStatement(node: IRForStatement): void {
    // Extra scope isolates the loop initialiser.
    this.scopeManager.enterScope();
    this.eventEmitter.emit(node.line, EventType.LOOP_ENTER, { loopType: "for" });

    let safetyCounter = 0;
    try {
      // ── Initialiser ───────────────────────────────────────────────────────
      if (node.init) {
        if (Array.isArray(node.init)) {
          for (const initStmt of node.init) this.walkStatement(initStmt);
        } else {
          this.walkStatement(node.init);
        }
      }

      while (true) {
        if (++safetyCounter > MAX_LOOP_ITERATIONS) {
          throw new Error(
            `Runtime Exception at line ${node.line}: ` +
            `Infinite loop detected — for loop exceeded ${MAX_LOOP_ITERATIONS} iterations.`
          );
        }

        // ── Condition ────────────────────────────────────────────────────────
        if (node.condition) {
          const conditionResult = this.evaluator.evaluate(node.condition);
          this.eventEmitter.emit(node.line, EventType.CONDITION, { result: conditionResult });
          if (!conditionResult) break;
        }

        this.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });

        // ── Body ─────────────────────────────────────────────────────────────
        try {
          this.walkBlock(node.body);
        } catch (e: any) {
          if (e instanceof BreakSignal    || e?.name === "BreakSignal")    break;
          if (e instanceof ContinueSignal || e?.name === "ContinueSignal") {
            // Fall through to the update clause below.
          } else {
            throw e;
          }
        }

        // ── Update ───────────────────────────────────────────────────────────
        if (node.update) {
          if (node.update.kind === "Assignment") {
            this.walkStatement(node.update);
          } else if (node.update.kind === "CommaExpression") {    // v2
            this.evaluateCommaExpression(node.update as IRCommaExpression);
          } else {
            this.evaluator.evaluate(node.update);
          }
        }
      }
    } finally {
      this.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for" });
      this.scopeManager.exitScope();  // Always pop the initialiser scope.
    }
  }

  /**
   * Evaluates a comma expression for its side effects.
   *
   * In C++, `expr1, expr2` evaluates `expr1` (discarding the result) then
   * evaluates and returns `expr2`. This is most commonly seen in for-loop
   * update clauses: `i++, j--`.
   *
   * Handles arbitrarily nested comma chains because `a, b, c` is parsed by
   * Tree-sitter as `(a, b), c` — the recursive call on `left` handles the
   * inner chain naturally.
   *
   * @param expr - The IRCommaExpression to evaluate.
   * @returns      The value of the right-hand operand.
   */
  private evaluateCommaExpression(expr: IRCommaExpression): any {
    // Evaluate left side for its side effects (e.g. `i++`).
    if (expr.left.kind === "CommaExpression") {
      this.evaluateCommaExpression(expr.left as IRCommaExpression);
    } else if (expr.left.kind === "Assignment") {
      this.walkStatement(expr.left);
    } else {
      this.evaluator.evaluate(expr.left);
    }

    // Evaluate right side and return its value.
    if (expr.right.kind === "Assignment") {
      this.walkStatement(expr.right);
      return undefined;
    }
    return this.evaluator.evaluate(expr.right);
  }

  /**
   * Executes a range-based for loop: `for (auto x : container)`.
   *
   * Container normalisation:
   *   The collection is evaluated to a CppValue and normalised to a plain
   *   JS array through duck-typed dispatch:
   *     Mock container ({ data: [] }) → container.data
   *     JS Map                        → Array.from(map.entries()) → [key, val] pairs
   *     JS Set                        → Array.from(set)
   *     Plain array                   → used directly
   *     null / undefined              → treated as empty array (no iterations)
   *
   * Structured bindings (`auto [a, b] : container`) are handled by checking
   * whether the iterator name starts with `[` and splitting on commas.
   *
   * A micro-scope is pushed for each iteration so the iterator variable
   * shadows any outer variable of the same name and is destroyed at the end
   * of each iteration body, matching C++ semantics.
   */
  public walkForRangeStatement(node: IRForRangeStatement): void {
    const container = this.evaluator.evaluate(node.collection);

    let targetArray: any[] | null = null;

    if (Array.isArray(container)) {
      targetArray = container;
    } else if (
      container &&
      typeof container === "object" &&
      "data" in container &&
      Array.isArray((container as any).data)
    ) {
      targetArray = (container as any).data;
    } else if (container instanceof Map) {
      targetArray = Array.from(container.entries());
    } else if (container instanceof Set) {
      targetArray = Array.from(container);
    } else if (typeof container === "string") {
      targetArray = Array.from(container);
    }

    // Graceful fallback: uninitialized or unsupported collection type.
    if (!targetArray) {
      console.warn(
        `[IRWalker.walkForRangeStatement] Collection at line ${node.line} ` +
        `could not be iterated — defaulting to empty. ` +
        `Type: ${typeof container}.`
      );
      targetArray = [];
    }

    const varName = node.iteratorName;
    const varType = node.iteratorType || "auto";

    this.eventEmitter.emit(node.line, EventType.LOOP_ENTER, {
      loopType:   "for-range",
      collection: varName,
    });

    for (let i = 0; i < targetArray.length; i++) {
      this.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: i + 1 });

      // Micro-scope for this iteration's iterator variable.
      this.scopeManager.enterScope();
      const val = targetArray[i];

      // ── Structured binding: `auto [a, b] : map` ──────────────────────────
      if (varName.startsWith("[") && varName.endsWith("]")) {
        const parts = varName.slice(1, -1).split(",").map(s => s.trim());
        if (Array.isArray(val)) {
          parts.forEach((p, idx) => {
            if (p) this.scopeManager.defineVariable(p, varType, val[idx], node.isConst);
          });
        } else if (val && typeof val === "object") {
          const keys = Object.keys(val);
          parts.forEach((p, idx) => {
            if (p) this.scopeManager.defineVariable(p, varType, (val as any)[keys[idx]], node.isConst);
          });
        } else {
          parts.forEach(p => {
            if (p) this.scopeManager.defineVariable(p, varType, val, node.isConst);
          });
        }
      } else {
        // Standard iterator variable.
        this.scopeManager.defineVariable(varName, varType, val, node.isConst);
      }

      try {
        this.walkBlock(node.body);
      } catch (e: any) {
        this.scopeManager.exitScope();
        if (e instanceof BreakSignal    || e?.name === "BreakSignal")    break;
        if (e instanceof ContinueSignal || e?.name === "ContinueSignal") continue;
        throw e;
      }

      this.scopeManager.exitScope();
    }

    this.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for-range" });
  }


  // ==========================================================================
  // SECTION 5 — Exception handling (v2)
  // ==========================================================================

  /**
   * Executes a try / catch block. v2 addition.
   *
   * Execution model:
   *   1. Execute the try body normally.
   *   2. If no ThrowSignal is thrown, continue past the try statement.
   *   3. If a ThrowSignal is thrown, iterate the catch handlers in order:
   *        a. If handler.catchAll → always matches.
   *        b. If handler.catchType matches signal.payload.typeName → matches.
   *        c. If handler.catchType is undefined → matches any (bare `catch(e)`).
   *   4. If a matching handler is found, define the catch parameter in a new
   *      scope and execute the handler body.
   *   5. If no handler matches, re-throw the ThrowSignal so it propagates to
   *      an outer try block or surfaces as a runtime error.
   *   6. If a `finallyBlock` is present, execute it regardless of outcome
   *      (currently reserved — C++ has no `finally`, but the field exists for
   *      potential RAII simulation in future versions).
   *
   * Type matching:
   *   Matching is performed on the string typeName from the ThrowSignal payload.
   *   Inheritance hierarchies are not modelled — only exact string matches and
   *   the catch-all pattern `catch (...)` are supported. This is sufficient for
   *   the most common competitive programming patterns (catch int, catch string).
   *
   * @param stmt - The IRTryStatement to execute.
   */
  private walkTryStatement(stmt: IRTryStatement): void {
    let caughtSignal: ThrowSignal | null = null;

    // ── Execute try body ───────────────────────────────────────────────────
    try {
      this.walkBlock(stmt.body);
    } catch (e: any) {
      if (e instanceof ThrowSignal || e?.name === "ThrowSignal") {
        caughtSignal = e as ThrowSignal;
      } else {
        // ReturnSignal, BreakSignal, ContinueSignal, BreakpointSignal, and
        // genuine engine errors are not C++ exceptions — re-throw immediately.
        throw e;
      }
    }

    // ── If nothing was thrown, we are done ────────────────────────────────
    if (!caughtSignal) return;

    // ── Find a matching catch handler ─────────────────────────────────────
    let matched = false;
    for (const handler of stmt.handlers) {

      const doesMatch =
        handler.catchAll ||
        !handler.catchType ||   // bare `catch(e)` with no type — matches anything
        handler.catchType === caughtSignal.payload.typeName ||
        // Allow matching base type names: `catch (exception& e)` catches
        // `std::exception`-derived throws when the namespace prefix matches.
        (handler.catchType &&
         (caughtSignal.payload.typeName === handler.catchType ||
          caughtSignal.payload.typeName?.endsWith("::" + handler.catchType)));

      if (doesMatch) {
        matched = true;

        // Emit a CATCH event so the UI can highlight the catch clause.
        this.eventEmitter.emit(handler.line, EventType.CATCH, {
          value:    caughtSignal.payload.value,
          typeName: caughtSignal.payload.typeName,
        });

        // Define the caught-exception variable in a new scope.
        this.scopeManager.enterScope();
        if (handler.catchParam) {
          this.scopeManager.defineVariable(
            handler.catchParam,
            handler.catchType ?? "auto",
            caughtSignal.payload.value,
          );
        }

        try {
          // Note: walkBlock would push ANOTHER scope on top of ours.
          // Execute statements directly to avoid the double-scope.
          for (const handlerStmt of handler.body.statements) {
            this.walkStatement(handlerStmt);
          }
        } finally {
          this.scopeManager.exitScope();
        }

        break; // Only the first matching handler runs.
      }
    }

    // ── No matching handler — re-throw ────────────────────────────────────
    if (!matched) {
      // Debug note: The ThrowSignal will propagate to an outer walkTryStatement
      // or to ExecutionEngine.invokeFunction(), which will surface it as a
      // runtime error with the thrown value and type name in the message.
      throw caughtSignal;
    }

    // ── Finally block (reserved for future RAII simulation) ───────────────
    if (stmt.finallyBlock) {
      this.walkBlock(stmt.finallyBlock);
    }
  }


  // ==========================================================================
  // SECTION 6 — Unsupported / no-op statement walkers (v2)
  // ==========================================================================

  /**
   * Handles a goto statement by throwing UnsupportedFeatureError. v2 addition.
   *
   * Full goto support requires two-pass IR compilation to resolve label targets
   * before execution begins. Rather than silently skipping the goto (which
   * would produce wrong results), the engine surfaces a descriptive error.
   *
   * If the user's program uses goto only for labels that never branch backwards,
   * the LabeledStatement handler below executes the labelled statement normally,
   * so the effect is often correct even without goto support.
   *
   * @param stmt - The IRGotoStatement to handle.
   */
  private walkGotoStatement(stmt: IRGotoStatement): void {
    throw new UnsupportedFeatureError(
      "goto",
      `'goto ${stmt.label}' encountered at line ${stmt.line}. ` +
      `The goto statement requires two-pass label resolution which is not ` +
      `currently implemented. Consider refactoring to use loops or functions.`
    );
  }

  /**
   * Executes a labeled statement, ignoring the label itself. v2 addition.
   *
   * In C++, `label: statement` is only meaningful as a goto target.
   * Since goto is unsupported, the label is a no-op and the inner statement
   * executes normally. This allows programs that use labels without matching
   * gotos (e.g. some macro-generated code) to run without crashing.
   *
   * @param stmt - The IRLabeledStatement to execute.
   */
  private walkLabeledStatement(stmt: IRLabeledStatement): void {
    // Debug note: If this fires and the program relies on goto to reach this
    // label, the goto walker above will have already thrown UnsupportedFeatureError.
    // Reaching here means the label exists but no goto targeted it — safe to execute.
    this.walkStatement(stmt.statement);
  }
}