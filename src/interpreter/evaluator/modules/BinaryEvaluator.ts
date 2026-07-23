import type { IRBinaryExpression } from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import { logStepToConsole } from "../../utils/helpers";
import type { CppValue } from "../../types";
import type { ExpressionEvaluator } from "../ExpressionEvaluator";
import type { CinInputEvaluator } from "./CinInputEvaluator";
import type { CoreEvaluator } from "./CoreEvaluator";

export class BinaryEvaluator {
  constructor(
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
    private cinInput: CinInputEvaluator,
    private core: CoreEvaluator,
  ) {}

  public evaluateBinary(expr: IRBinaryExpression): CppValue {
    // ── cout << stream operator ───────────────────────────────────────────
    if (expr.operator === "<<") {
      const left = this.evaluator.evaluate(expr.left);
      const right = this.evaluator.evaluate(expr.right);

      if (left && typeof left === "object" && (left as any).__isCout) {
        const outStr = right !== null && right !== undefined ? String(right) : "";
        if (outStr === "\n") {
          logStepToConsole("");
        } else {
          logStepToConsole(`[C++]: ${outStr}`);
        }
        this.eventEmitter.emit(expr.line, EventType.WRITE, { output: outStr });
        // Return proxy so chaining works: `cout << a << b`.
        return { __isCout: true } as unknown as CppValue;
      }

      // Standard bitwise left shift.
      return (left as number) << (right as number);
    }

    // ── cin >> stream operator (v2) ───────────────────────────────────────
    if (expr.operator === ">>") {
      const left = this.evaluator.evaluate(expr.left);

      if (left && typeof left === "object" && (left as any).__isCin) {
        // The right operand must be an l-value (Identifier or subscript)
        // so we can assign the input value to it.
        this.cinInput.assignCinInput(expr.right, expr.line);
        // Return proxy so chaining works: `cin >> a >> b`.
        return { __isCin: true } as unknown as CppValue;
      }

      // Standard bitwise right shift.
      const leftVal = this.evaluator.evaluate(expr.left);
      const rightVal = this.evaluator.evaluate(expr.right);
      return (leftVal as number) >> (rightVal as number);
    }

    // ── Logical short-circuit ─────────────────────────────────────────────
    if (expr.operator === "&&") {
      const leftVal = this.evaluator.evaluate(expr.left);
      if (!leftVal) return false; // Short-circuit: skip right.
      return !!this.evaluator.evaluate(expr.right);
    }

    if (expr.operator === "||") {
      const leftVal = this.evaluator.evaluate(expr.left);
      if (leftVal) return true; // Short-circuit: skip right.
      return !!this.evaluator.evaluate(expr.right);
    }

    // ── Standard arithmetic, comparison, bitwise ──────────────────────────
    let left = this.evaluator.evaluate(expr.left);
    let right = this.evaluator.evaluate(expr.right);

    // Coerce single-character strings to their ASCII character codes for C++ char math
    if (typeof left === "string" && left.length === 1 && typeof right === "number") {
      left = left.charCodeAt(0);
    }
    if (typeof right === "string" && right.length === 1 && typeof left === "number") {
      right = right.charCodeAt(0);
    }
    if (
      typeof left === "string" &&
      left.length === 1 &&
      typeof right === "string" &&
      right.length === 1
    ) {
      if (expr.operator === "-" || expr.operator === "*" || expr.operator === "/") {
        left = left.charCodeAt(0);
        right = right.charCodeAt(0);
      } else if (expr.operator === "+") {
        if (this.core.isTypeChar(expr.left) && this.core.isTypeChar(expr.right)) {
          left = left.charCodeAt(0);
          right = right.charCodeAt(0);
        }
      }
    }

    switch (expr.operator) {
      case "+":
        // String concatenation if either operand is a string.
        if (typeof left === "string" || typeof right === "string") {
          return String(left) + String(right);
        }
        return (left as number) + (right as number);

      case "-":
        return (left as number) - (right as number);
      case "*":
        return (left as number) * (right as number);

      case "/":
        if ((right as number) === 0) {
          throw new Error("Math Exception: Division by zero is undefined.");
        }
        // C++ truncates toward zero for integer division.
        return Math.trunc((left as number) / (right as number));

      case "%":
        return (left as number) % (right as number);
      case "<":
        return (left as number) < (right as number);
      case ">":
        return (left as number) > (right as number);
      case "<=":
        return (left as number) <= (right as number);
      case ">=":
        return (left as number) >= (right as number);
      case "==": {
        // v2: Handle loose pointer comparison (ptr == 0 <-> ptr == nullptr)
        const isLeftObj = left === null || typeof left === "object";
        const isRightObj = right === null || typeof right === "object";
        if (left === 0 && isRightObj) return right === null;
        if (right === 0 && isLeftObj) return left === null;
        if (left === undefined && right === null) return true;
        if (left === null && right === undefined) return true;
        return left === right;
      }
      case "!=": {
        // v2: Handle loose pointer comparison
        const isLeftObj = left === null || typeof left === "object";
        const isRightObj = right === null || typeof right === "object";
        if (left === 0 && isRightObj) return right !== null;
        if (right === 0 && isLeftObj) return left !== null;
        if (left === undefined && right === null) return false;
        if (left === null && right === undefined) return false;
        return left !== right;
      }

      // Bitwise operators — JavaScript's bitwise ops work on Int32.
      case "&":
        return (left as number) & (right as number);
      case "|":
        return (left as number) | (right as number);
      case "^":
        return (left as number) ^ (right as number);

      default:
        throw new Error(`Runtime Exception: Unsupported binary operator '${expr.operator}'.`);
    }
  }
}
