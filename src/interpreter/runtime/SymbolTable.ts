import type { CppType, CppValue } from "../types";

/**
 * Represents a single variable in memory, tracking both its underlying value
 * and its explicit C++ type for the frontend visualizer.
 */
export interface Symbol {
  name: string;
  type: CppType;
  value: CppValue;
}

/**
 * Represents a single, flat lexical environment (memory block).
 * Maintains a map of identifiers to their corresponding Symbols.
 */
export class SymbolTable {
  private symbols: Map<string, Symbol>;

  constructor() {
    this.symbols = new Map<string, Symbol>();
  }

  /**
   * Allocates a new variable in the current memory block.
   * @throws {Error} If the variable is already declared in this exact scope.
   */
  public define(name: string, type: CppType, value: CppValue): void {
    // console.log(`[SymbolTable] -> define: '${name}' of type '${type}' =`, value);
    if (this.symbols.has(name)) {
      throw new Error(`Compiler Error: Variable '${name}' is already defined in this scope.`);
    }
    this.symbols.set(name, { name, type, value });
  }

  /**
   * Mutates an existing variable in the current memory block.
   */
  public assign(name: string, value: CppValue): void {
    // console.log(`[SymbolTable] -> assign: '${name}' =`, value);
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(`Memory Access Violation: Variable '${name}' is not defined.`);
    }
    symbol.value = value;
  }

  /**
   * Retrieves the full Symbol object for a given identifier.
   */
  public get(name: string): Symbol {
    // console.log(`[SymbolTable] <- get: '${name}'`);
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(`Memory Access Violation: Variable '${name}' is not defined.`);
    }
    return symbol;
  }

  public has(name: string): boolean {
    return this.symbols.has(name);
  }

  /**
   * Serializes all symbols in this specific memory layer.
   * UI FIX: Returns the full Symbol (with `.type`), not just the raw value.
   */
  public getAll(): Record<string, Symbol> {
    const record: Record<string, Symbol> = {};
    for (const [name, symbol] of this.symbols.entries()) {
      record[name] = symbol;
    }
    return record;
  }
}