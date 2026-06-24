import { SymbolTable } from "./SymbolTable";
import type { Symbol } from "./SymbolTable";
import type { CppType, CppValue } from "../types";

/**
 * Manages lexical environments and the call stack memory frames.
 * Functions as a stack of `SymbolTable` instances, pushing new tables upon
 * entering a block `{}` and popping them upon exit to prevent memory leaks.
 * * Handles "Duck-Typed C++" mechanics by storing generic JS references 
 * (arrays, maps, objects) agnostically as C++ pointers and containers.
 */
export class ScopeManager {
  private scopes: SymbolTable[];

  constructor() {
    // Every execution context initializes with a base global/root memory frame.
    this.scopes = [new SymbolTable()];
  }

  /**
   * Pushes a new memory frame onto the stack.
   * Called whenever the engine evaluates a BlockStatement or initiates a loop.
   */
  public enterScope(): void {
    this.scopes.push(new SymbolTable());
  }

  /**
   * Pops the active memory frame off the stack.
   * Destroys all variables declared within that block, accurately mimicking C++ garbage collection.
   * @throws {Error} If attempting to pop the root execution scope.
   */
  public exitScope(): void {
    if (this.scopes.length <= 1) {
      throw new Error("Fatal: Cannot exit the root scope of this context.");
    }
    this.scopes.pop();
  }

  /**
   * Allocates a new variable in the current (top-most) memory frame.
   * @param name - The identifier of the variable.
   * @param type - The resolved C++ type (e.g., "int", "vector<int>").
   * @param value - The underlying duck-typed JS value representing the C++ data.
   */
  public defineVariable(name: string, type: CppType, value: CppValue): void {
    // console.log(`[ScopeManager] Defining '${name}' of type '${type}' =`, value);
    const currentScope = this.scopes[this.scopes.length - 1];
    currentScope.define(name, type, value);
  }

  /**
   * Traverses the scope chain from inner-most to outer-most to reassign an existing variable.
   * @param name - The identifier to update.
   * @param value - The new value to assign.
   * @throws {Error} If the variable is not found in any active scope.
   */
  public assignVariable(name: string, value: CppValue): void {
    // console.log(`[ScopeManager] Assigning '${name}' =`, value);
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        this.scopes[i].assign(name, value);
        return;
      }
    }
    throw new Error(`Memory Access Violation: Variable '${name}' is not defined in the current scope chain.`);
  }

  /**
   * Resolves a variable by traversing the scope chain.
   * Perfectly mimics C++ variable shadowing by returning the first match found from the top down.
   * @param name - The identifier to resolve.
   * @returns The complete Symbol object containing the type and value.
   * @throws {Error} If the variable does not exist.
   */
  public getVariable(name: string): Symbol {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name);
      }
    }
    throw new Error(`Memory Access Violation: Variable '${name}' is not defined.`);
  }

  /**
   * Returns the current depth of the scope chain.
   * NOTE: Returns 1 when only the root scope is active (constructor initializes one scope).
   * A value of 2 means one nested block is currently in scope, and so on.
   */
  public getDepth(): number {
    return this.scopes.length;
  }

  /**
   * Flattens the entire scope stack into a single state snapshot for the React frontend.
   * Inner scopes gracefully overwrite outer scopes to accurately reflect shadowed variables.
   * @returns A serialized record of all active variables and their symbols in memory.
   */
  public captureState(): Record<string, Symbol> {
    const state: Record<string, Symbol> = {};
    
    // Iterate from root scope (outermost) to the active scope (innermost).
    // Inner scopes overwrite outer ones in the flattened result, which correctly
    // models C++ variable shadowing: inner declarations hide outer ones in the visualizer.
    for (const scope of this.scopes) {
      Object.assign(state, scope.getAll());
    }
    
    return state;
  }
}