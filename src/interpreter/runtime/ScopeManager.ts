// ============================================================================
// ScopeManager.ts — Lexical scope chain for a single call-stack frame.
//
// Each StackFrame owns exactly one ScopeManager. The ScopeManager owns a
// stack of SymbolTables — one per nested block `{}`. The stack starts with a
// single "base" table for the function's top-level scope and grows/shrinks as
// blocks are entered and exited.
//
// Scope chain operations always walk from innermost (top of stack) to
// outermost (bottom / base), matching C++ name-lookup and shadowing rules:
//
//   int x = 1;          // base scope   [0]: x=1
//   {                   // enter scope  [1]: (empty)
//     int x = 2;        // define in    [1]: x=2
//     cout << x;        // getVariable → [1].x = 2  (inner shadows outer)
//   }                   // exit scope   [1] popped
//   cout << x;          // getVariable → [0].x = 1  (outer restored)
//
// Responsibilities:
//   - Block scope lifecycle (enterScope / exitScope).
//   - Variable definition with const / static metadata (defineVariable).
//   - Const-safe variable mutation across the chain (assignVariable).
//   - Variable resolution with shadowing (getVariable).
//   - Static local variable registration and retrieval (defineStatic / getStaticSymbols).
//   - Full-state snapshot for the React frontend (captureState).
//   - Watch-expression support: enumerate all visible names (getVisibleNames).
//
// What this class does NOT do:
//   - Deep-cloning values for snapshots (helpers.deepCloneCppValue).
//   - Persisting static values across calls (ExecutionEngine.staticStorage).
//   - Cross-frame variable lookup (each frame has its own ScopeManager).
// ============================================================================

import { SymbolTable } from "./SymbolTable";
import type { Symbol } from "./SymbolTable";
import type { CppType, CppValue } from "../types";


export class ScopeManager {

  /**
   * The scope chain for this frame, ordered outermost-first.
   *   scopes[0] = base / function-level scope (globals + parameters).
   *   scopes[N] = innermost active block (highest N is always active).
   *
   * Invariant: scopes.length >= 1 at all times. exitScope() enforces this by
   * refusing to pop the last table.
   */
  private scopes: SymbolTable[];

  /**
   * Names of all variables in this frame that were declared `static`.
   * Populated by defineStatic() and read by ExecutionEngine.invokeFunction()
   * after the function returns, to mirror updated values back to staticStorage.
   *
   * Stored as a Set rather than derived on demand so the lookup in the
   * post-return mirror loop is O(1) per variable instead of O(scope depth).
   */
  private staticNames: Set<string>;

  constructor() {
    // Every frame starts with exactly one base scope table.
    this.scopes = [new SymbolTable()];
    this.staticNames = new Set();
  }


  // ── Block Scope Lifecycle ─────────────────────────────────────────────────

  /**
   * Pushes a new empty SymbolTable onto the scope chain.
   *
   * Called by IRWalker.walkBlock() before executing any statement in a `{}`
   * block, and by walkForStatement() to isolate the loop initialiser
   * (e.g. `int i = 0`) from the enclosing function scope.
   */
  public enterScope(): void {
    this.scopes.push(new SymbolTable());
  }

  /**
   * Pops the innermost SymbolTable from the scope chain.
   *
   * All variables declared inside that block are implicitly garbage-collected
   * when the table is discarded, matching C++ RAII / block-scope semantics.
   *
   * Called from the `finally` block of IRWalker.walkBlock() so the scope is
   * always cleaned up even when a ReturnSignal, BreakSignal, or ThrowSignal
   * propagates through the block mid-execution.
   *
   * @throws {Error} If called when only the base scope remains. This would
   *   represent a scope-exit mismatch bug in IRWalker (more exits than enters).
   */
  public exitScope(): void {
    if (this.scopes.length <= 1) {
      // Debug note: If this fires, check IRWalker for unbalanced enterScope /
      // exitScope pairs. Common cause: a walkBlock() that returns early without
      // hitting its finally block (should never happen with correct try/finally).
      throw new Error(
        "Fatal: Cannot exit the root scope of this execution frame. " +
        "This indicates an unbalanced enterScope/exitScope pair in IRWalker."
      );
    }
    this.scopes.pop();
  }


  // ── Variable Definition ───────────────────────────────────────────────────

  /**
   * Allocates a new variable in the current (innermost) scope block.
   *
   * This is the primary entry point for variable creation. It threads the
   * `isConst` and `isStatic` flags down to SymbolTable.define() so they are
   * stored alongside the value and enforced on every subsequent write.
   *
   * @param name     - The C++ identifier (e.g. "n", "dp", "root").
   * @param type     - The resolved C++ type string from IRVariableDeclaration.
   * @param value    - The initial duck-typed JS value (may be undefined for
   *                   uninitialized declarations that receive a default later).
   * @param isConst  - True when the C++ declaration included `const`.
   *                   Enforced by SymbolTable.assign(); defaults to false.
   * @param isStatic - True when the C++ declaration included `static`.
   *                   Records the name in staticNames; defaults to false.
   *
   * @throws {Error} If the name is already defined in the innermost scope
   *   (redeclaration in the same block — a C++ compile-time error).
   */
  public defineVariable(
    name:     string,
    type:     CppType,
    value:    CppValue,
    isConst:  boolean = false,
    isStatic: boolean = false,
  ): void {
    const currentScope = this.scopes[this.scopes.length - 1];
    currentScope.define(name, type, value, isConst, isStatic);

    // Track static names separately for fast post-call mirroring.
    if (isStatic) {
      this.staticNames.add(name);
    }
  }

  /**
   * Defines a variable in the current (innermost) scope, silently removing
   * any existing entry with the same name first.
   *
   * This is used exclusively for parameter binding in `invokeFunction` and
   * the lambda closure, where a parameter is allowed to shadow a global
   * variable, enum constant, or static local that was pre-injected into the
   * same base scope by the engine. In valid C++, a parameter always wins over
   * a same-named global in the function body.
   *
   * Unlike `defineVariable()`, which throws on redeclaration to catch genuine
   * user-code errors (e.g., `int x; int x;` in the same block), this method
   * is intentionally non-throwing for the specific shadowing case. It must NOT
   * be used for ordinary variable declarations.
   *
   * @param name     - The C++ parameter identifier.
   * @param type     - The resolved C++ type string.
   * @param value    - The initial value (the evaluated argument).
   * @param isConst  - True when the parameter is const-qualified.
   * @param isStatic - True when the parameter is static (extremely rare).
   */
  public defineShadowing(
    name:     string,
    type:     CppType,
    value:    CppValue,
    isConst:  boolean = false,
    isStatic: boolean = false,
  ): void {
    const currentScope = this.scopes[this.scopes.length - 1];
    // Remove any pre-existing entry (e.g., a global or enum constant injected
    // by the engine) so the subsequent define() call does not throw.
    currentScope.delete(name);
    currentScope.define(name, type, value, isConst, isStatic);
    if (isStatic) this.staticNames.add(name);
  }

  /**
   * Injects a variable into the base (outermost) scope of this frame without
   * triggering the "already defined" guard.
   *
   * Used exclusively by ExecutionEngine.invokeFunction() for two purposes:
   *   1. Re-injecting global variables before parameters are bound.
   *   2. Re-injecting static local variables whose persisted value lives in
   *      ExecutionEngine.staticStorage.
   *
   * If the name already exists in the base scope (e.g. globals injected on a
   * recursive call), the existing entry's value is silently updated via
   * SymbolTable.redefine() rather than throwing a redeclaration error.
   *
   * @param name     - The identifier to inject.
   * @param type     - The C++ type string.
   * @param value    - The value to store (typically the persisted static value).
   * @param isConst  - Const flag; preserved across the redefine.
   * @param isStatic - Static flag; adds the name to staticNames when true.
   */
  public injectIntoBase(
    name:     string,
    type:     CppType,
    value:    CppValue,
    isConst:  boolean = false,
    isStatic: boolean = false,
  ): void {
    const baseScope = this.scopes[0];
    if (baseScope.has(name)) {
      // Update the existing entry's value without changing its metadata.
      baseScope.redefine(name, value);
    } else {
      baseScope.define(name, type, value, isConst, isStatic);
    }
    if (isStatic) {
      this.staticNames.add(name);
    }
  }


  // ── Static Local Variable Support ─────────────────────────────────────────

  /**
   * Defines a static local variable — syntactic sugar over defineVariable that
   * always sets isStatic = true and records the name in staticNames.
   *
   * Called by StatementExecutor.executeVariableDeclaration() when it detects
   * the `static` storage-class specifier on a local variable declaration.
   *
   * @param name  - The C++ identifier.
   * @param type  - The C++ type string.
   * @param value - The initial value (from ExecutionEngine.staticStorage if
   *                the function has been called before, or the declaration's
   *                initializer on the very first call).
   */
  public defineStatic(name: string, type: CppType, value: CppValue): void {
    this.defineVariable(name, type, value, false, true);
  }

  /**
   * Returns the current values of all static local variables in this frame,
   * keyed by name.
   *
   * Called by ExecutionEngine.invokeFunction() in its `finally` block so the
   * engine can mirror updated static values back to staticStorage before the
   * frame is popped. Without this mirror step, mutations to a static variable
   * inside a function would be lost when the StackFrame is discarded.
   *
   * @returns A `Record<name, CppValue>` for every static variable in this frame.
   */
  public getStaticSymbols(): Record<string, CppValue> {
    const result: Record<string, CppValue> = {};
    for (const name of this.staticNames) {
      try {
        result[name] = this.getVariable(name).value;
      } catch {
        // Debug note: Should never happen — a name is only added to staticNames
        // when defineVariable/defineStatic successfully creates the symbol.
        // If this fires, a static symbol was deleted from scope mid-execution.
        console.warn(`[ScopeManager.getStaticSymbols] Static variable '${name}' not found during mirror.`);
      }
    }
    return result;
  }


  // ── Variable Mutation ─────────────────────────────────────────────────────

  /**
   * Traverses the scope chain from innermost to outermost and mutates the
   * first matching variable.
   *
   * Correctly models C++ assignment semantics:
   *   - An assignment to `x` updates the nearest `x` in the chain, whether
   *     that is in the current block, an enclosing block, or the function base.
   *   - Const variables are blocked at the SymbolTable level; ConstAssignmentError
   *     propagates up unchanged so the caller sees the original variable name.
   *
   * @param name  - The C++ identifier to update.
   * @param value - The new value to store.
   *
   * @throws {ConstAssignmentError} If the found variable is const-qualified.
   * @throws {Error}                If no variable with that name exists in
   *   the entire chain (undeclared variable assignment).
   */
  public assignVariable(name: string, value: CppValue): void {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        // ConstAssignmentError thrown here propagates naturally to the caller.
        this.scopes[i].assign(name, value);
        return;
      }
    }
    throw new Error(
      `Memory Access Violation: Variable '${name}' is not defined in the current scope chain. ` +
      `Did you forget to declare it, or is it out of scope?`
    );
  }


  // ── Variable Resolution ───────────────────────────────────────────────────

  /**
   * Traverses the scope chain from innermost to outermost and returns the
   * Symbol for the first matching name.
   *
   * Returns the full Symbol (not just the value) so callers can inspect type,
   * isConst, and isStatic metadata without a second lookup.
   *
   * Correctly models C++ variable shadowing: an inner `int x` hides an outer
   * `int x` for the duration of the inner block.
   *
   * @param name - The C++ identifier to resolve.
   * @returns      The Symbol stored under the first matching name.
   *
   * @throws {Error} If the name is not found in any scope in the chain.
   *   The error message names the missing variable so the UI can display
   *   "Variable 'foo' is not defined" rather than a cryptic undefined-access.
   */
  public getVariable(name: string): Symbol {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name);
      }
    }
    throw new Error(
      `Memory Access Violation: Variable '${name}' is not defined. ` +
      `Check for typos, missing declarations, or use before initialisation.`
    );
  }

  /**
   * Returns true if the given name is visible anywhere in the scope chain.
   * Used by StatementExecutor's auto-recovery path to decide whether to call
   * defineVariable (first time) or assignVariable (already declared).
   */
  public hasVariable(name: string): boolean {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) return true;
    }
    return false;
  }


  // ── Scope Introspection ───────────────────────────────────────────────────

  /**
   * Returns the current depth of the scope chain.
   *
   * Semantics:
   *   1 = only the base scope is active (no nested blocks).
   *   2 = one nested block is open (e.g. inside a for-loop body).
   *   N = N-1 nested blocks are open.
   *
   * Used by createSnapshot() to populate RuntimeSnapshot.state.scopeDepth,
   * which the React frontend uses to render indented scope panels.
   */
  public getDepth(): number {
    return this.scopes.length;
  }

  /**
   * Returns a deduplicated list of all variable names visible in the current
   * scope chain, from innermost to outermost (inner names shadow outer ones).
   *
   * Used by the debugger's watch-expression evaluator to provide auto-complete
   * and to validate that a watch expression's identifiers are in scope.
   *
   * @returns An array of unique visible identifier strings.
   */
  public getVisibleNames(): string[] {
    const seen = new Set<string>();
    // Walk innermost → outermost so inner names come first.
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      for (const key of this.scopes[i].keys()) {
        seen.add(key);
      }
    }
    return Array.from(seen);
  }


  // ── Snapshot Support ──────────────────────────────────────────────────────

  /**
   * Flattens the entire scope chain into a single record for snapshot capture.
   *
   * Merges all SymbolTables from outermost (index 0) to innermost (index N).
   * Because later entries overwrite earlier ones for the same key, inner-scope
   * variables automatically shadow outer-scope variables in the result — which
   * is exactly what the React frontend should display at the current step.
   *
   * Returning full Symbol objects (with type, isConst, isStatic) rather than
   * raw values allows the frontend to render:
   *   - Typed labels: "int n = 5"
   *   - Const badges: a lock icon next to const variables
   *   - Static badges: a persist icon next to static locals
   *
   * Internal symbols whose names start with `__` (e.g. `__ref`, `__callerScope`
   * proxy markers injected by the reference-passing mechanism) are excluded so
   * they don't appear in the variable panel.
   *
   * @returns A `Record<name, Symbol>` representing the fully merged visible state.
   */
  public captureState(): Record<string, Symbol> {
    const state: Record<string, Symbol> = {};

    // Outer → inner so that inner entries overwrite outer entries correctly.
    for (const scope of this.scopes) {
      for (const [name, symbol] of Object.entries(scope.getAll())) {
        // Filter out internal engine proxy symbols.
        if (name.startsWith("__")) continue;
        state[name] = symbol;
      }
    }

    return state;
  }
}