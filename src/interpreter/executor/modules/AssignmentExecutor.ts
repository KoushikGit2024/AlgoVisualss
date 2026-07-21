import type {
  IRAssignment,
  IRIdentifier,
  IRSubscriptExpression,
  IRMemberExpression,
  IRExpression,
} from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import { ScopeManager } from "../../runtime/ScopeManager";
import type { CppValue } from "../../types";
import { ExpressionEvaluator } from "../../evaluator/ExpressionEvaluator";
import { cloneRuntimeValue } from "../../utils/helpers";

export class AssignmentExecutor {
  constructor(
    private scopeManager: ScopeManager,
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
  ) {}

  public executeAssignment(stmt: IRAssignment): void {
    let newValue = this.evaluator.evaluate(stmt.value);
    newValue = cloneRuntimeValue(newValue);

    if (stmt.target.kind === "Identifier") {
      const varName = (stmt.target as IRIdentifier).name;

      let targetVarName = varName;
      let targetScopeManager = this.scopeManager;

      try {
        let symbol = this.scopeManager.getVariable(targetVarName);
        const seen = new Set<any>();
        while (
          symbol.value &&
          typeof symbol.value === "object" &&
          "__ref" in (symbol.value as any)
        ) {
          if (seen.has(symbol.value)) break;
          seen.add(symbol.value);

          targetVarName = (symbol.value as any).__ref;
          targetScopeManager = (symbol.value as any).__callerScope;
          symbol = targetScopeManager.getVariable(targetVarName);
        }
      } catch {}

      let resolvedValue: CppValue;
      try {
        const symbol = targetScopeManager.getVariable(targetVarName);
        const existing = symbol.value;
        resolvedValue =
          stmt.operator === "="
            ? newValue
            : this.computeCompoundValue(stmt.operator, existing, newValue);

        if (
          (symbol.type === "char" || symbol.type === "const char") &&
          typeof resolvedValue === "number"
        ) {
          resolvedValue = String.fromCharCode(resolvedValue);
        }

        targetScopeManager.assignVariable(targetVarName, resolvedValue);
      } catch (e: any) {
        if (e?.constructor?.name === "ConstAssignmentError") throw e;
        resolvedValue = newValue;
        targetScopeManager.defineVariable(targetVarName, "auto", resolvedValue);
      }

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: varName,
        value: resolvedValue,
      });
    } else if (stmt.target.kind === "SubscriptExpression") {
      const targetNode = stmt.target as IRSubscriptExpression;
      const index = this.evaluator.evaluate(targetNode.index) as string | number;

      const indexVariables: string[] = [];
      let currIndexNode = targetNode.index;
      if (currIndexNode.kind === "Identifier") {
        indexVariables.push((currIndexNode as any).name);
      }

      let currObjNode = targetNode.object;
      while (currObjNode.kind === "SubscriptExpression") {
        const innerSub = currObjNode as IRSubscriptExpression;
        if (innerSub.index.kind === "Identifier") {
          indexVariables.push((innerSub.index as any).name);
        }
        currObjNode = innerSub.object;
      }

      let targetObj: any = null;
      let arrayName =
        currObjNode.kind === "Identifier" ? (currObjNode as IRIdentifier).name : "container";

      if (targetNode.object.kind === "Identifier") {
        try {
          targetObj = this.evaluator.evaluate(targetNode.object);
        } catch {
          targetObj = new Map();
          this.scopeManager.defineVariable(arrayName, "auto", targetObj);
        }
      } else {
        targetObj = this.evaluator.evaluate(targetNode.object);
      }

      if (!targetObj) {
        throw new Error(
          `Memory Access Violation at line ${stmt.line}: ` +
            `Cannot assign to subscript of undefined reference '${arrayName}'.`,
        );
      }

      let existingValue: any = undefined;
      if (stmt.operator !== "=") {
        existingValue = this.readSubscript(targetObj, index);
      }

      const finalValue =
        stmt.operator === "="
          ? newValue
          : this.computeCompoundValue(stmt.operator, existingValue ?? 0, newValue);

      if (typeof targetObj === "string") {
        const i = typeof index === "string" ? parseInt(index) : (index as number);
        const newStr = targetObj.substring(0, i) + String(finalValue) + targetObj.substring(i + 1);
        this.writeBackString(targetNode.object, newStr, stmt.line);
      } else {
        this.writeSubscript(targetObj, index, finalValue);
      }

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: `${arrayName}[${index}]`,
        value: finalValue,
        indexVariables: indexVariables.length > 0 ? indexVariables : undefined,
      });
    } else if (stmt.target.kind === "MemberExpression") {
      const targetNode = stmt.target as IRMemberExpression;
      const targetObj = this.evaluator.evaluate(targetNode.object) as any;
      let property: string | number = targetNode.property;

      if (Array.isArray(targetObj)) {
        const fieldMap: Record<string, number> = {
          id: 0,
          value: 1,
          left: 2,
          right: 3,
          x: 0,
          y: 1,
          val: 0,
          next: 1,
          first: 0,
          second: 1,
        };
        if (property in fieldMap) property = fieldMap[property as string];
      }

      if (!targetObj) {
        throw new Error(
          `Memory Access Violation at line ${stmt.line}: ` +
            `Cannot assign property '${property}' on a null or undefined reference.`,
        );
      }

      const existingValue = stmt.operator !== "=" ? targetObj[property] : undefined;
      const finalValue =
        stmt.operator === "="
          ? newValue
          : this.computeCompoundValue(stmt.operator, existingValue ?? 0, newValue);

      targetObj[property] = finalValue;

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: String(property),
        value: finalValue,
      });
    } else {
      throw new Error(
        `Syntax Error at line ${stmt.line}: ` +
          `Unsupported assignment target kind '${(stmt.target as any).kind}'.`,
      );
    }
  }

  private readSubscript(targetObj: any, index: string | number): any {
    if (targetObj instanceof Map) return targetObj.get(index);
    if (Array.isArray(targetObj)) return targetObj[index as number];
    if (typeof targetObj === "object" && "data" in targetObj && Array.isArray(targetObj.data))
      return targetObj.data[index as number];
    return targetObj[index];
  }

  private writeBackString(targetExpr: IRExpression, newStr: string, line: number): void {
    if (targetExpr.kind === "Identifier") {
      const varName = (targetExpr as IRIdentifier).name;
      try {
        this.scopeManager.assignVariable(varName, newStr);
      } catch {
        this.scopeManager.defineVariable(varName, "string", newStr);
      }
      this.eventEmitter.emit(line, EventType.ASSIGNMENT, { variable: varName, value: newStr });
    } else if (targetExpr.kind === "SubscriptExpression") {
      const subExpr = targetExpr as IRSubscriptExpression;
      const parentObj = this.evaluator.evaluate(subExpr.object) as any;
      const parentIndex = this.evaluator.evaluate(subExpr.index) as string | number;
      if (typeof parentObj === "string") {
        const pIndex =
          typeof parentIndex === "string" ? parseInt(parentIndex) : (parentIndex as number);
        const newParentStr =
          parentObj.substring(0, pIndex) + newStr + parentObj.substring(pIndex + 1);
        this.writeBackString(subExpr.object, newParentStr, line);
      } else if (parentObj !== null && parentObj !== undefined) {
        this.writeSubscript(parentObj, parentIndex, newStr);
        const parentName =
          subExpr.object.kind === "Identifier"
            ? (subExpr.object as IRIdentifier).name
            : "container";
        this.eventEmitter.emit(line, EventType.ASSIGNMENT, {
          variable: `${parentName}[${parentIndex}]`,
          value: newStr,
        });
      }
    }
  }

  private writeSubscript(targetObj: any, index: string | number, value: any): void {
    if (targetObj instanceof Map) {
      targetObj.set(index, value);
    } else if (Array.isArray(targetObj)) {
      targetObj[index as number] = value;
    } else if (
      typeof targetObj === "object" &&
      "data" in targetObj &&
      Array.isArray(targetObj.data)
    ) {
      targetObj.data[index as number] = value;
    } else {
      targetObj[index] = value;
    }
  }

  private computeCompoundValue(
    operator: IRAssignment["operator"],
    existing: any,
    incoming: CppValue,
  ): CppValue {
    if (operator === "+=" && typeof existing === "string") {
      return existing + String(incoming ?? "");
    }

    const lhs = Number(existing);
    const rhs = Number(incoming);

    switch (operator) {
      case "+=":
        return lhs + rhs;
      case "-=":
        return lhs - rhs;
      case "*=":
        return lhs * rhs;
      case "/=":
        if (rhs === 0) throw new Error("Math Exception: Division by zero in compound assignment.");
        return Math.trunc(lhs / rhs);
      case "%=":
        return lhs % rhs;
      case "&=":
        return lhs & rhs;
      case "|=":
        return lhs | rhs;
      case "^=":
        return lhs ^ rhs;
      case "<<=":
        return lhs << rhs;
      case ">>=":
        return lhs >> rhs;
      default:
        return incoming;
    }
  }
}
