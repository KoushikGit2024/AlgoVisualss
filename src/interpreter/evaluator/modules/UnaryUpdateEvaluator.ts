import type { IRUnaryExpression, IRUpdateExpression } from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import { ScopeManager } from "../../runtime/ScopeManager";
import type { CppValue } from "../../types";
import type { ExpressionEvaluator } from "../ExpressionEvaluator";

export class UnaryUpdateEvaluator {
  constructor(
    private evaluator: ExpressionEvaluator,
    private scopeManager: ScopeManager,
    private eventEmitter: EventEmitter,
  ) {}

  public evaluateUnary(expr: IRUnaryExpression): CppValue {
    const argValue = this.evaluator.evaluate(expr.argument);

    switch (expr.operator) {
      case "-":
        return -(argValue as number);
      case "+":
        return +(argValue as number);
      case "!":
        return !argValue;
      case "~":
        return ~(argValue as number); // Bitwise NOT
      case "*":
        return argValue; // Dereference — no-op in duck-typed JS
      case "&":
        if (expr.argument.kind === "Identifier") {
          const varName = (expr.argument as any).name;
          return this.scopeManager.getVariable(varName).value;
        }
        return argValue;
      default:
        throw new Error(`Runtime Exception: Unsupported unary operator '${expr.operator}'.`);
    }
  }

  public evaluateUpdate(node: IRUpdateExpression): CppValue {
    let currentValue: number = 0;
    let targetObject: any = null;
    let targetKey: string | number | null = null;
    let identifierName: string | null = null;
    let targetScopeManager = this.scopeManager;

    const parseNumber = (rawVal: any): number => {
      if (rawVal && typeof rawVal === "object" && "value" in rawVal) rawVal = rawVal.value;
      if (typeof rawVal === "number") return rawVal;
      if (rawVal === undefined || rawVal === null) return 0;
      const n = Number(rawVal);
      return isNaN(n) ? 0 : n;
    };

    if (node.argument.kind === "Identifier") {
      identifierName = (node.argument as any).name;
      let symbol = this.scopeManager.getVariable(identifierName!);

      const seen = new Set<any>();
      while (symbol.value && typeof symbol.value === "object" && "__ref" in (symbol.value as any)) {
        if (seen.has(symbol.value)) break;
        seen.add(symbol.value);
        const refName = (symbol.value as any).__ref as string;
        identifierName = refName;
        targetScopeManager = (symbol.value as any).__callerScope;
        symbol = targetScopeManager.getVariable(identifierName);
      }

      currentValue = parseNumber(symbol.value);
    } else if (node.argument.kind === "SubscriptExpression") {
      targetObject = this.evaluator.evaluate((node.argument as any).object);
      targetKey = this.evaluator.evaluate((node.argument as any).index) as string | number;

      if (!targetObject || targetKey === null || targetKey === undefined) {
        throw new Error(
          `Memory Access Violation at line ${node.line}: ` + `Invalid subscript update target.`,
        );
      }

      let rawVal: unknown;
      if (targetObject instanceof Map) rawVal = targetObject.get(targetKey);
      else if (Array.isArray(targetObject)) rawVal = targetObject[targetKey as number];
      else if (Array.isArray(targetObject?.data)) rawVal = targetObject.data[targetKey as number];
      else rawVal = targetObject[targetKey];

      currentValue = parseNumber(rawVal);
    } else if (node.argument.kind === "MemberExpression") {
      targetObject = this.evaluator.evaluate((node.argument as any).object);
      targetKey = (node.argument as any).property as string;

      if (!targetObject) {
        throw new Error(
          `Memory Access Violation at line ${node.line}: ` +
            `Target object is null in update expression.`,
        );
      }
      currentValue = parseNumber(targetObject[targetKey]);
    } else {
      throw new Error(
        `Syntax Error at line ${node.line}: ` +
          `Update operators (++ / --) require an l-value operand.`,
      );
    }

    const newValue = node.operator === "++" ? currentValue + 1 : currentValue - 1;

    if (identifierName) {
      targetScopeManager.assignVariable(identifierName, newValue);
    } else if (targetObject !== null && targetKey !== null) {
      if (targetObject instanceof Map) {
        targetObject.set(targetKey, newValue);
      } else if (Array.isArray(targetObject)) {
        targetObject[targetKey as number] = newValue;
      } else if (Array.isArray(targetObject?.data)) {
        targetObject.data[targetKey as number] = newValue;
      } else {
        targetObject[targetKey] = newValue;
      }
    }

    this.eventEmitter.emit(node.line, EventType.ASSIGNMENT, {
      target: identifierName ?? String(targetKey),
      value: newValue,
    });

    return node.prefix ? newValue : currentValue;
  }
}
