// src/interpreter/runtime/SymbolTable.ts
import type { CppType, CppValue } from "../types";

export interface Symbol {
  name: string;
  type: CppType;
  value: CppValue;
}

/**
 * A SymbolTable represents a single, flat layer of memory.
 * Think of it as a dictionary for a specific block of code (like inside an if-statement).
 * It doesn't know about outside variables; it only cares about what's declared right here.
 */
export class SymbolTable {
  private symbols: Map<string, Symbol>;

  constructor() {
    this.symbols = new Map<string, Symbol>();
  }

  public define(name: string, type: CppType, value: CppValue): void {
    // C++ doesn't let you say `int x = 1; int x = 2;` in the exact same block.
    if (this.symbols.has(name)) {
      throw new Error(`Variable '${name}' is already defined in this scope.`);
    }
    this.symbols.set(name, { name, type, value });
  }

  public assign(name: string, value: CppValue): void {
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(`Variable '${name}' is not defined.`);
    }
    symbol.value = value;
  }

  public get(name: string): Symbol {
    const symbol = this.symbols.get(name);
    if (!symbol) {
      throw new Error(`Variable '${name}' is not defined.`);
    }
    return symbol;
  }

  public has(name: string): boolean {
    return this.symbols.has(name);
  }

  /**
   * Dumps everything in this specific memory layer.
   * Super useful for building the final snapshot for the React UI.
   */
  public getAll(): Record<string, CppValue> {
    const record: Record<string, CppValue> = {};
    for (const [name, symbol] of this.symbols.entries()) {
      record[name] = symbol.value;
    }
    return record;
  }
}