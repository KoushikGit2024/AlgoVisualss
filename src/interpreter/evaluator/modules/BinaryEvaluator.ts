import type { IRBinaryExpression } from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import { logStepToConsole } from "../../utils/helpers";
import type { CppValue, EvalResult } from "../../types";
import type { ExpressionEvaluator } from "../ExpressionEvaluator";
import { StreamFormatter } from "./StreamFormatter";
import { TypeConversion } from "./TypeConversion";
import type { CinInputEvaluator } from "./CinInputEvaluator";

export class BinaryEvaluator {
  constructor(
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
    private cinInput: CinInputEvaluator,
  ) {}

  public evaluateBinary(expr: IRBinaryExpression): CppValue {
    return this.evaluateBinaryTyped(expr).value;
  }

  public evaluateBinaryTyped(expr: IRBinaryExpression): EvalResult {
    // ── cout << stream operator ───────────────────────────────────────────
    if (expr.operator === "<<") {
      const left = this.evaluator.evaluateWithType(expr.left);
      const right = this.evaluator.evaluateWithType(expr.right);

      if (left.value && typeof left.value === "object" && (left.value as any).__isCout) {
        const outStr = StreamFormatter.format(right);
        if (outStr === "\n") {
          logStepToConsole("");
        } else {
          logStepToConsole(`[C++]: ${outStr}`);
        }
        this.eventEmitter.emit(expr.line, EventType.WRITE, { output: outStr });
        // Return proxy so chaining works: `cout << a << b`.
        return { type: "unknown", value: { __isCout: true } as unknown as CppValue };
      }

      // Standard bitwise left shift.
      return { type: "int", value: (left.value as number) << (right.value as number) };
    }

    // ── cin >> stream operator (v2) ───────────────────────────────────────
    if (expr.operator === ">>") {
      const left = this.evaluator.evaluateWithType(expr.left);

      if (left.value && typeof left.value === "object" && (left.value as any).__isCin) {
        // The right operand must be an l-value (Identifier or subscript)
        // so we can assign the input value to it.
        this.cinInput.assignCinInput(expr.right, expr.line);
        // Return proxy so chaining works: `cin >> a >> b`.
        return { type: "unknown", value: { __isCin: true } as unknown as CppValue };
      }

      // Standard bitwise right shift.
      const leftVal = this.evaluator.evaluateWithType(expr.left);
      const rightVal = this.evaluator.evaluateWithType(expr.right);
      return { type: "int", value: (leftVal.value as number) >> (rightVal.value as number) };
    }

    // ── Logical short-circuit ─────────────────────────────────────────────
    if (expr.operator === "&&") {
      const leftVal = this.evaluator.evaluateWithType(expr.left);
      if (!leftVal.value) return { type: "bool", value: false }; // Short-circuit: skip right.
      return { type: "bool", value: !!this.evaluator.evaluateWithType(expr.right).value };
    }

    if (expr.operator === "||") {
      const leftVal = this.evaluator.evaluateWithType(expr.left);
      if (leftVal.value) return { type: "bool", value: true }; // Short-circuit: skip right.
      return { type: "bool", value: !!this.evaluator.evaluateWithType(expr.right).value };
    }

    // ── Standard arithmetic, comparison, bitwise ──────────────────────────
    const leftRes = this.evaluator.evaluateWithType(expr.left);
    const rightRes = this.evaluator.evaluateWithType(expr.right);

    const leftStr = leftRes.type === "string" || leftRes.type === "std::string";
    const rightStr = rightRes.type === "string" || rightRes.type === "std::string";

    if (expr.operator === "+") {
      if (leftStr || rightStr) {
        const lStr = StreamFormatter.format(leftRes);
        const rStr = StreamFormatter.format(rightRes);
        return { type: "string", value: lStr + rStr };
      }
    }

    const { resultType, leftVal, rightVal } = TypeConversion.promote(leftRes, rightRes);

    switch (expr.operator) {
      case "+":
        return { type: resultType, value: leftVal + rightVal };
      case "-":
        return { type: resultType, value: leftVal - rightVal };
      case "*":
        return { type: resultType, value: leftVal * rightVal };
      case "/":
        if (rightVal === 0) {
          throw new Error("Math Exception: Division by zero is undefined.");
        }
        if (
          resultType === "int" ||
          resultType === "long" ||
          resultType === "long long" ||
          resultType === "short" ||
          resultType === "char"
        ) {
          return { type: resultType, value: Math.trunc(leftVal / rightVal) };
        }
        return { type: resultType, value: leftVal / rightVal };
      case "%":
        return { type: resultType, value: leftVal % rightVal };
      case "<":
        return { type: "bool", value: leftVal < rightVal };
      case ">":
        return { type: "bool", value: leftVal > rightVal };
      case "<=":
        return { type: "bool", value: leftVal <= rightVal };
      case ">=":
        return { type: "bool", value: leftVal >= rightVal };
      case "==": {
        const left = leftRes.value;
        const right = rightRes.value;
        const isLeftObj = left === null || typeof left === "object";
        const isRightObj = right === null || typeof right === "object";
        if (
          isLeftObj &&
          isRightObj &&
          left &&
          right &&
          (left as any).__isListIter &&
          (right as any).__isListIter
        ) {
          return {
            type: "bool",
            value:
              (left as any).__iterIndex === (right as any).__iterIndex &&
              (left as any).__targetArr === (right as any).__targetArr,
          };
        }
        if (left === 0 && isRightObj) return { type: "bool", value: right === null };
        if (right === 0 && isLeftObj) return { type: "bool", value: left === null };
        if (left === undefined && right === null) return { type: "bool", value: true };
        if (left === null && right === undefined) return { type: "bool", value: true };
        return { type: "bool", value: left === right };
      }
      case "!=": {
        const left = leftRes.value;
        const right = rightRes.value;
        const isLeftObj = left === null || typeof left === "object";
        const isRightObj = right === null || typeof right === "object";
        if (
          isLeftObj &&
          isRightObj &&
          left &&
          right &&
          (left as any).__isListIter &&
          (right as any).__isListIter
        ) {
          return {
            type: "bool",
            value:
              (left as any).__iterIndex !== (right as any).__iterIndex ||
              (left as any).__targetArr !== (right as any).__targetArr,
          };
        }
        if (left === 0 && isRightObj) return { type: "bool", value: right !== null };
        if (right === 0 && isLeftObj) return { type: "bool", value: left !== null };
        if (left === undefined && right === null) return { type: "bool", value: false };
        if (left === null && right === undefined) return { type: "bool", value: false };
        return { type: "bool", value: left !== right };
      }

      // Bitwise operators — JavaScript's bitwise ops work on Int32.
      case "&":
        return { type: "int", value: leftVal & rightVal };
      case "|":
        return { type: "int", value: leftVal | rightVal };
      case "^":
        return { type: "int", value: leftVal ^ rightVal };

      default:
        throw new Error(`Runtime Exception: Unsupported binary operator '${expr.operator}'.`);
    }
  }
}
