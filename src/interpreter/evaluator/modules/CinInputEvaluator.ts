import type { IRExpression, IRIdentifier, IRSubscriptExpression } from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import { ScopeManager } from "../../runtime/ScopeManager";
import { logStepToConsole } from "../../utils/helpers";
import type { CppValue } from "../../types";
import type { ExpressionEvaluator } from "../ExpressionEvaluator";

export class CinInputEvaluator {
  private inputProvider: (() => CppValue | undefined) | null = null;

  constructor(
    private evaluator: ExpressionEvaluator,
    private scopeManager: ScopeManager,
    private eventEmitter: EventEmitter,
  ) {}

  public setInputProvider(provider: (() => CppValue | undefined) | null): void {
    this.inputProvider = provider;
  }

  public assignCinInput(targetExpr: IRExpression, line: number): void {
    let targetName = "unknown";
    let targetType = "auto";
    let writeTarget: ((val: CppValue) => void) | null = null;

    if (targetExpr.kind === "Identifier") {
      targetName = (targetExpr as IRIdentifier).name;
      try {
        const symbol = this.scopeManager.getVariable(targetName);
        targetType = symbol.type;
        writeTarget = (val) => this.scopeManager.assignVariable(targetName, val);
      } catch {
        writeTarget = (val) => this.scopeManager.defineVariable(targetName, "auto", val);
      }
    } else if (targetExpr.kind === "SubscriptExpression") {
      const subExpr = targetExpr as IRSubscriptExpression;
      const targetObj = this.evaluator.evaluate(subExpr.object) as any;
      const index = this.evaluator.evaluate(subExpr.index) as string | number;
      targetName =
        subExpr.object.kind === "Identifier"
          ? (subExpr.object as IRIdentifier).name
          : `expr[${index}]`;
      writeTarget = (val) => {
        if (targetObj instanceof Map) targetObj.set(index, val);
        else if (Array.isArray(targetObj)) targetObj[index as number] = val;
        else if (targetObj?.data) targetObj.data[index as number] = val;
        else targetObj[index] = val;
      };
    }

    this.eventEmitter.emit(line, EventType.INPUT, {
      variable: targetName,
      type: targetType,
    });

    const rawToken = this.inputProvider?.();
    if (rawToken === undefined || rawToken === null) {
      logStepToConsole(
        `[ExpressionEvaluator] cin >> ${targetName}: input queue is empty. ` +
          `Variable retains its current value. ` +
          `Call ExecutionEngine.setInputValues() to supply stdin before run().`,
      );
      return;
    }

    const coerced = this.coerceCinToken(rawToken, targetType);
    writeTarget?.(coerced);

    this.eventEmitter.emit(line, EventType.ASSIGNMENT, {
      variable: targetName,
      value: coerced,
    });
  }

  private coerceCinToken(raw: CppValue, type: string): CppValue {
    if (typeof raw !== "string") return raw;

    const lower = type.toLowerCase();

    if (lower.includes("int") || lower.includes("long") || lower.includes("short"))
      return parseInt(raw, 10);

    if (lower.includes("double") || lower.includes("float")) {
      return parseFloat(raw);
    }

    if (lower.includes("char")) {
      return raw.length > 0 ? raw[0] : "";
    }

    if (lower.includes("bool")) {
      return raw === "1" || raw.toLowerCase() === "true";
    }

    return raw;
  }
}
