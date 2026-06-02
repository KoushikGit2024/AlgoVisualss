// src/interpreter/runtime/ScopeManager.ts
import { SymbolTable } from "./SymbolTable";
import type { Symbol } from "./SymbolTable";
import type { CppType, CppValue } from "../types";

/**
 * The ScopeManager acts like a stack of pancakes, where each pancake is a SymbolTable.
 * When we enter a new { block }, we throw a new pancake on top.
 * When we look for a variable, we search from the top pancake downwards.
 */
export class ScopeManager {
  private scopes: SymbolTable[];

  constructor() {
    // Every function starts with a base "root" scope.
    this.scopes = [new SymbolTable()];
  }

  public enterScope(): void {
    this.scopes.push(new SymbolTable());
  }

  public exitScope(): void {
    if (this.scopes.length <= 1) {
      throw new Error("Cannot exit the root scope of this context.");
    }
    // Popping the scope destroys all variables declared inside it. No memory leaks!
    this.scopes.pop();
  }

  public defineVariable(name: string, type: CppType, value: CppValue): void {
    // Always define new variables in the CURRENT (top-most) scope.
    const currentScope = this.scopes[this.scopes.length - 1];
    currentScope.define(name, type, value);
  }

  public assignVariable(name: string, value: CppValue): void {
    // Start at the innermost scope and work our way out to the global/root scope.
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        this.scopes[i].assign(name, value);
        return;
      }
    }
    throw new Error(`Variable '${name}' is not defined in current scope chain.`);
  }

  public getVariable(name: string): Symbol {
    // Same deal: search from the inside out. 
    // This perfectly mimics C++ "variable shadowing".
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i].has(name)) {
        return this.scopes[i].get(name);
      }
    }
    throw new Error(`Variable '${name}' is not defined.`);
  }

  public getDepth(): number {
    return this.scopes.length;
  }

  /**
   * Flattens the entire scope stack into a single object for the React frontend.
   */
  public captureState(): Record<string, CppValue> {
    let state: Record<string, CppValue> = {};
    
    // We iterate from root (outer) to active (inner) scope.
    // Why? If the root has `x=1` and the inner scope has `x=2` (shadowing),
    // the inner scope will overwrite the outer scope in the final state object!
    for (const scope of this.scopes) {
      state = { ...state, ...scope.getAll() };
    }
    return state;
  }
}