// ============================================================================
// SymbolTable.ts — A single flat lexical memory block (one scope level).
//
// Each ScopeManager owns a stack of SymbolTables. When a new block `{}` is
// entered, a fresh SymbolTable is pushed. When the block exits, it is popped
// and all variables declared inside are garbage-collected automatically.
//
// Responsibilities:
//   - Allocate new variables in the current block (define).
//   - Mutate existing variables while enforcing const-correctness (assign).
//   - Resolve variable lookups within this single block (get / has).
//   - Serialise all symbols to a plain record for snapshot capture (getAll).
//   - Support silent re-injection of static variables whose values already
//     live in ExecutionEngine.staticStorage (redefine).
//
// What this class does NOT do:
//   - Scope-chain traversal (that is ScopeManager's responsibility).
//   - Type coercion or value validation (ExpressionEvaluator's responsibility).
//   - Snapshot deep-cloning (helpers.deepCloneCppValue's responsibility).
// ============================================================================

import type { CppType, CppValue } from "../types";

// ─── Symbol Interface ─────────────────────────────────────────────────────────

/**
 * A single variable entry stored inside a SymbolTable.
 *
 * Extended fields over the original v1 design:
 *
 *   `isConst`  — mirrors C++ `const` qualifier. When true, any call to
 *                assign() targeting this symbol throws a ConstAssignmentError.
 *                Set once at definition time and never changed.
 *
 *   `isStatic` — mirrors C++ `static` local-variable semantics. When true,
 *                the symbol's value is authoritative in ExecutionEngine's
 *                staticStorage map, not in this SymbolTable. The SymbolTable
 *                entry acts as a per-frame alias; mutations must be mirrored
 *                back to staticStorage by ExecutionEngine.invokeFunction().
 *
 * Both flags default to false so existing call sites that omit them continue
 * to compile and behave identically to the v1 behaviour.
 */
export interface Symbol {
  /** The identifier as it appears in C++ source (used by the UI label). */
  name: string;
  /** Resolved C++ type string (e.g. "int", "vector<int>", "auto"). */
  type: CppType;
  /** The duck-typed JavaScript value representing the C++ runtime value. */
  value: CppValue;
  /**
   * True when the variable was declared with the `const` qualifier.
   * Enforced by assign(): a ConstAssignmentError is thrown on any write attempt.
   */
  isConst: boolean;
  /**
   * True when the variable was declared with the `static` qualifier inside
   * a function body. The engine stores the persistent value in
   * ExecutionEngine.staticStorage and injects it here on each call.
   */
  isStatic: boolean;
}

// ─── ConstAssignmentError ────────────────────────────────────────────────────

/**
 * Thrown by SymbolTable.assign() when a caller attempts to mutate a symbol
 * that was declared `const`.
 *
 * Extends Error (not a custom signal like ReturnSignal) because this represents
 * a genuine compile-time contract violation — the C++ compiler would reject this
 * code entirely. We surface it as a descriptive runtime error so the UI can
 * display a useful message rather than a cryptic JS TypeError.
 */
export class ConstAssignmentError extends Error {
  public readonly variableName: string;

  constructor(name: string) {
    super(
      `Const Violation: Cannot assign to '${name}' because it was declared const. ` +
        `In C++, this would be a compile-time error.`,
    );
    this.variableName = name;
    Object.setPrototypeOf(this, ConstAssignmentError.prototype);
  }
}

// ─── SymbolTable ─────────────────────────────────────────────────────────────

/**
 * Represents a single, flat lexical environment — one `{}` block's worth of
 * declared variables.
 *
 * The internal `Map<string, Symbol>` is keyed by variable name. Because C++
 * prohibits re-declaring a variable in the same scope, define() throws if
 * the name already exists. Shadowing (declaring the same name in an inner
 * block) is handled correctly by ScopeManager, which pushes a new SymbolTable
 * for each nested block.
 */
export class SymbolTable {
  /** Internal storage: identifier → Symbol metadata + value. */
  private symbols: Map<string, Symbol>;

  constructor() {
    this.symbols = new Map<string, Symbol>();
  }

  // ── Core API ──────────────────────────────────────────────────────────────

  /**
   * Allocates a new variable in this memory block.
   *
   * @param name     - The C++ identifier (e.g. "n", "dp", "root").
   * @param type     - The resolved C++ type string.
   * @param value    - The initial duck-typed JS value.
   * @param isConst  - Whether the variable is const-qualified. Default: false.
   * @param isStatic - Whether the variable is a static local. Default: false.
   *
   * @throws {Error} If `name` is already defined in this exact scope.
   *   This enforces the C++ rule against redeclaring in the same block.
   *   Shadowing an outer scope is not an error — ScopeManager handles that
   *   by pushing a new SymbolTable, so this table never sees the outer name.
   */
  public define(
    name: string,
    type: CppType,
    value: CppValue,
    isConst: boolean = false,
    isStatic: boolean = false,
  ): void {
    if (this.symbols.has(name)) {
      throw new Error(
        `Compiler Error: Variable '${name}' is already defined in this scope. ` +
          `Redeclaration in the same block is not permitted in C++.`,
      );
    }
    this.symbols.set(name, { name, type, value, isConst, isStatic });
  }

  /**
   * Silently overwrites an existing symbol's value and metadata.
   *
   * Used exclusively by ExecutionEngine.invokeFunction() to re-inject static
   * variables into a new frame's scope without triggering the "already defined"
   * guard in define(). Also used by the global-variable injection path for the
   * same reason: globals are defined once and then re-injected into every new
   * function frame.
   *
   * Callers outside ExecutionEngine should use assign() instead.
   *
   * @param name  - The identifier to overwrite.
   * @param value - The new value (e.g. the persisted static value).
   *
   * @throws {Error} If `name` does not exist in this table. Redefine is an
   *   update operation, not a create operation — call define() for new entries.
   */
  public redefine(name: string, value: CppValue): void {
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(
        `[SymbolTable.redefine] Internal error: '${name}' not found. ` +
          `Call define() before redefine().`,
      );
    }
    // Preserve all metadata (type, isConst, isStatic); only update value.
    symbol.value = value;
  }

  /**
   * Mutates an existing variable's value in this memory block.
   *
   * Enforces const-correctness: if the symbol was defined with isConst = true,
   * a ConstAssignmentError is thrown before any mutation occurs.
   *
   * @param name  - The identifier to update.
   * @param value - The new value to store.
   *
   * @throws {ConstAssignmentError} If the target symbol is const-qualified.
   * @throws {Error}                If the identifier is not in this table.
   *   (ScopeManager.assignVariable handles traversal; this method only writes
   *    to the table it owns.)
   */
  public assign(name: string, value: CppValue): void {
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(
        `Memory Access Violation: Variable '${name}' is not defined in this scope block.`,
      );
    }

    // Enforce C++ const immutability.
    if (symbol.isConst) {
      throw new ConstAssignmentError(name);
    }

    symbol.value = value;
  }

  /**
   * Retrieves the full Symbol object for a given identifier.
   *
   * Returns the Symbol (not just the value) so callers can inspect type,
   * isConst, and isStatic metadata. The ScopeManager uses this to check
   * isConst before forwarding an assign() call down the chain.
   *
   * @param name - The identifier to look up.
   * @returns      The Symbol stored under that name.
   * @throws {Error} If the identifier is not in this table.
   */
  public get(name: string): Symbol {
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(`Memory Access Violation: Variable '${name}' is not defined.`);
    }
    return symbol;
  }

  /**
   * Returns true if this table contains an entry for the given identifier.
   * Used by ScopeManager to walk the scope chain from inner to outer.
   */
  public has(name: string): boolean {
    return this.symbols.has(name);
  }

  /**
   * Returns true if the given identifier is const-qualified in this table.
   * ScopeManager calls this before forwarding an assignVariable() so it can
   * surface a ConstAssignmentError with the correct variable name even when
   * the assignment originates from an inner scope.
   *
   * Returns false (not throws) when the name is not in this table, allowing
   * the caller to continue searching outer scopes.
   */
  public isConst(name: string): boolean {
    return this.symbols.get(name)?.isConst ?? false;
  }

  /**
   * Returns true if the given identifier is a static local in this table.
   * Used by ExecutionEngine.invokeFunction() to identify which symbols need
   * their values mirrored back to staticStorage after the function returns.
   */
  public isStatic(name: string): boolean {
    return this.symbols.get(name)?.isStatic ?? false;
  }

  // ── Snapshot Support ──────────────────────────────────────────────────────

  /**
   * Serialises all symbols in this memory block to a plain record.
   *
   * Returns full Symbol objects (with type, isConst, isStatic) rather than
   * raw values, so the React frontend can render typed labels and badges
   * (e.g. a lock icon for const variables).
   *
   * Used by ScopeManager.captureState(), which merges the output of all
   * SymbolTables (from outermost to innermost) into a single flat snapshot.
   *
   * @returns A `Record<name, Symbol>` covering every variable in this block.
   */
  public getAll(): Record<string, Symbol> {
    const record: Record<string, Symbol> = {};
    for (const [name, symbol] of this.symbols.entries()) {
      record[name] = symbol;
    }
    return record;
  }

  // ── Debug Utilities ───────────────────────────────────────────────────────

  /**
   * Returns the number of variables currently allocated in this block.
   * Useful for assertions in tests and for the scope-depth display in the UI.
   */
  public size(): number {
    return this.symbols.size;
  }

  /**
   * Returns the names of all variables in this block.
   * Used by the debugger watch-expression evaluator to enumerate visible names.
   */
  public keys(): string[] {
    return Array.from(this.symbols.keys());
  }

  /**
   * Removes a symbol from this table by name.
   *
   * Used exclusively by ScopeManager.defineShadowing() to clear a
   * pre-injected global/enum/static entry before re-defining it as a
   * function parameter. This allows a parameter to legitimately shadow
   * an engine-injected binding without triggering the "already defined"
   * guard in define().
   *
   * Callers outside ScopeManager.defineShadowing() should not call this
   * directly — all normal scoping and shadowing is handled by the
   * SymbolTable stack in ScopeManager.
   *
   * @param name - The identifier to remove.
   * @returns true if the symbol existed and was removed; false otherwise.
   */
  public delete(name: string): boolean {
    return this.symbols.delete(name);
  }
}
