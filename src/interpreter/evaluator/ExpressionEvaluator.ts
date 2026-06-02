// src/interpreter/evaluator/ExpressionEvaluator.ts
import type { 
  IRExpression, 
  IRBinaryExpression, 
  IRUnaryExpression, 
  IRUpdateExpression,
  IRInitializerList,
  IRSubscriptExpression,
  IRTernaryExpression,
  IRIdentifier
} from "../ir/IRNode";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { EventType } from "../types";
import type { CppValue } from "../types";

/**
 * The math department. Give this class an expression (like `2 + 2` or `arr[i]`), 
 * and it will crunch the numbers and return the raw JavaScript value.
 */
export class ExpressionEvaluator {
  constructor(
    private scopeManager: ScopeManager,
    private eventEmitter: EventEmitter
  ) {}

  public evaluate(expr: IRExpression): CppValue {
    switch (expr.kind) {
      case "Literal":
        return expr.value;

      case "Identifier": {
        const symbol = this.scopeManager.getVariable(expr.name);
        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: expr.name,
          value: symbol.value
        });
        return symbol.value;
      }

      case "UnaryExpression":
        return this.evaluateUnary(expr);

      case "BinaryExpression":
        return this.evaluateBinary(expr);

      case "FunctionCall":
        // Why throw an error here? Because calling a function requires creating a new StackFrame.
        // If we imported ExecutionEngine here to do that, we'd create a circular import crash!
        // Instead, the ExecutionEngine intercepts this specific call. (See ExecutionEngine.ts).
        throw new Error("FunctionCall evaluation must be orchestrated by the ExecutionEngine.");
        
      case "UpdateExpression":
        return this.evaluateUpdate(expr as IRUpdateExpression);
        
      case "InitializerList":
        // Evaluate every element in the {1, 2, 3} list and return as a JS array
        return (expr as IRInitializerList).elements.map((e: IRExpression) => this.evaluate(e));

      case "SubscriptExpression": {
        // Handle array reading: arr[i]
        const subExpr = expr as IRSubscriptExpression;
        if (subExpr.object.kind !== "Identifier") {
            throw new Error("Complex array pointers not supported in Phase 1.");
        }
        
        const arrayName = (subExpr.object as IRIdentifier).name;
        const index = this.evaluate(subExpr.index) as number;
        const arr = this.scopeManager.getVariable(arrayName).value as CppValue[];
        
        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: `${arrayName}[${index}]`,
          value: arr[index]
        });
        
        return arr[index];
      }

      case "TernaryExpression": {
        // Handle conditional logic: condition ? true : false
        const ternExpr = expr as IRTernaryExpression;
        const condition = this.evaluate(ternExpr.condition);
        // Only evaluate the branch that actually runs! (Short-circuiting)
        return condition ? this.evaluate(ternExpr.consequent) : this.evaluate(ternExpr.alternate);
      }
      default:
        throw new Error(`Unsupported expression kind: ${(expr as any).kind}`);
    }
  }

  private evaluateUnary(expr: IRUnaryExpression): CppValue {
    const argValue = this.evaluate(expr.argument);
    
    switch (expr.operator) {
      case "-": return -(argValue as number);
      case "+": return +(argValue as number);
      case "!": return !(argValue as boolean);
      default:
        throw new Error(`Unsupported unary operator: ${expr.operator}`);
    }
  }

  private evaluateBinary(expr: IRBinaryExpression): CppValue {
    // We MUST process && and || first to support short-circuiting!
    // If the left side of an && is false, C++ doesn't even look at the right side.
    if (expr.operator === "&&") {
      const leftVal = this.evaluate(expr.left);
      if (!leftVal) return false;
      return this.evaluate(expr.right) as boolean;
    }

    if (expr.operator === "||") {
      const leftVal = this.evaluate(expr.left);
      if (leftVal) return true;
      return this.evaluate(expr.right) as boolean;
    }

    // For standard math, evaluate both sides
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      case "+":
        if (typeof left === "string" || typeof right === "string") {
          return String(left) + String(right);
        }
        return (left as number) + (right as number);
      case "-": return (left as number) - (right as number);
      case "*": return (left as number) * (right as number);
      case "/": 
        if (right === 0) throw new Error("Division by zero error.");
        // Note: JS division yields floats. If we wanted strict C++ int division, 
        // we'd use Math.trunc() here if both left and right were 'int' types.
        return (left as number) / (right as number);
      case "%": return (left as number) % (right as number);
      case "<": return (left as number) < (right as number);
      case ">": return (left as number) > (right as number);
      case "<=": return (left as number) <= (right as number);
      case ">=": return (left as number) >= (right as number);
      case "==": return left === right;
      case "!=": return left !== right;
      default:
        throw new Error(`Unsupported binary operator: ${expr.operator}`);
    }
  }

  private evaluateUpdate(expr: IRUpdateExpression): CppValue {
    if (expr.argument.kind !== "Identifier") {
      throw new Error("Update expressions (++ / --) require an identifier.");
    }

    const varName = (expr.argument as IRIdentifier).name;
    const currentValue = this.scopeManager.getVariable(varName).value as number;
    const newValue = expr.operator === "++" ? currentValue + 1 : currentValue - 1;

    // Actually mutate the variable in memory
    this.scopeManager.assignVariable(varName, newValue);

    this.eventEmitter.emit(expr.line, EventType.ASSIGN, {
      variable: varName,
      value: newValue
    });

    // Remember: postfix (i++) returns the OLD value, prefix (++i) returns the NEW value!
    return expr.prefix ? newValue : currentValue;
  }
}