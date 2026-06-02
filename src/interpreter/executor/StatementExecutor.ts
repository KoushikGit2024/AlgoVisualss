// src/interpreter/executor/StatementExecutor.ts
import type {
  IRVariableDeclaration, 
  IRAssignment, 
  IRExpressionStatement, 
  IRCoutStatement, 
  IRReturnStatement,
  IRIdentifier,          // <-- Imported for strict type casting
  IRSubscriptExpression  // <-- Imported for strict type casting
} from "../ir/IRNode";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { EventType } from "../types";
import type { CppValue, CppType } from "../types";
import { ReturnSignal } from "../utils/helpers";

/**
 * The StatementExecutor is the muscle of the interpreter. 
 * While the IRWalker handles the flow/routing, this class actually *does* the work:
 * allocating memory, mutating variables, printing to the console, and firing returns.
 */
export class StatementExecutor {
  constructor(
    private scopeManager: ScopeManager,
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter
  ) {}

  public executeVariableDeclaration(stmt: IRVariableDeclaration): void {
    // If they don't provide an initial value, we default to an empty array [] 
    // for arrays, or 0 for standard primitives (like C++ naturally does).
    let value: CppValue = stmt.variableType.includes("[]") ? [] : 0; 
    
    if (stmt.initializer) {
      value = this.evaluator.evaluate(stmt.initializer);
    }

    this.scopeManager.defineVariable(stmt.name, stmt.variableType as CppType, value);
    
    this.eventEmitter.emit(stmt.line, EventType.DECLARE, {
      variable: stmt.name,
      type: stmt.variableType,
      value: value
    });
  }

  public executeAssignment(stmt: IRAssignment): void {
    const value = this.evaluator.evaluate(stmt.value);

    // CASE 1: Standard flat variable assignment (e.g., x = 5)
    if (stmt.target.kind === "Identifier") {
      // Tell TypeScript strictly that this is an Identifier so it allows the .name property
      const targetNode = stmt.target as IRIdentifier;
      const varName = targetNode.name;
      
      this.scopeManager.assignVariable(varName, value);
      
      this.eventEmitter.emit(stmt.line, EventType.ASSIGN, {
        variable: varName,
        value: value
      });
    } 
    // CASE 2: Array index mutation (e.g., arr[i] = 5)
    else if (stmt.target.kind === "SubscriptExpression") {
      // Cast it so TypeScript knows we can access .object and .index
      const targetNode = stmt.target as IRSubscriptExpression;
      
      // In Phase 1, the array being accessed MUST be a simple name (like 'arr')
      if (targetNode.object.kind !== "Identifier") {
        throw new Error("Complex array pointers not supported in Phase 1.");
      }
      
      const arrayName = (targetNode.object as IRIdentifier).name;
      const index = this.evaluator.evaluate(targetNode.index) as number;
      
      // Because JS passes arrays by reference, we grab the array from our memory stack,
      // mutate the specific index, and then deliberately re-assign it so our UI snapshot 
      // knows the memory state changed.
      const arr = this.scopeManager.getVariable(arrayName).value as CppValue[];
      arr[index] = value;
      this.scopeManager.assignVariable(arrayName, arr);

      this.eventEmitter.emit(stmt.line, EventType.ASSIGN, {
        variable: `${arrayName}[${index}]`,
        value: value
      });
    } else {
      // If we ever add struct properties (e.g., `user.age = 10`), it would go here!
      throw new Error(`Unsupported assignment target kind: ${stmt.target.kind}`);
    }
  }

  public executeExpressionStatement(stmt: IRExpressionStatement): void {
    // Sometimes expressions are standalone (like a function call: `bubbleSort(nums, 5);`)
    // We just evaluate it and throw away the result since it's not being assigned to anything.
    this.evaluator.evaluate(stmt.expression);
  }

  public executeCout(stmt: IRCoutStatement): void {
    // Evaluate every part of the `cout << a << b` chain, convert them to strings, and glue them together.
    const outputs = stmt.arguments.map(arg => this.evaluator.evaluate(arg));
    const outputString = outputs.join("");
    
    this.eventEmitter.emit(stmt.line, EventType.WRITE, {
      output: outputString
    });
  }

  public executeReturn(stmt: IRReturnStatement): never {
    // Evaluate the return value (if any) and violently throw it up the call stack!
    // The ExecutionEngine's function wrapper will catch this signal.
    const value = stmt.argument ? this.evaluator.evaluate(stmt.argument) : undefined;
    throw new ReturnSignal(value);
  }
}