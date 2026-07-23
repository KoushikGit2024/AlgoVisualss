import type { CppValue } from "../../../types";
import type { ExpressionEvaluator } from "../../../evaluator/ExpressionEvaluator";
import type { IRFunctionCall } from "../../../ir/IRNode";

export function handleStdMathExtra(
  fn: string,
  callNode: IRFunctionCall,
  currentEvaluator: ExpressionEvaluator,
): CppValue | undefined {
  if (fn === "__gcd" || fn === "gcd") {
    let a = Math.abs(currentEvaluator.evaluate(callNode.arguments[0]) as number);
    let b = Math.abs(currentEvaluator.evaluate(callNode.arguments[1]) as number);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }
  
  if (fn === "lcm") {
    let a = Math.abs(currentEvaluator.evaluate(callNode.arguments[0]) as number);
    let b = Math.abs(currentEvaluator.evaluate(callNode.arguments[1]) as number);
    if (a === 0 || b === 0) return 0;
    let pa = a,
      pb = b;
    while (pb) {
      [pa, pb] = [pb, pa % pb];
    }
    return (a / pa) * b;
  }

  if (fn.startsWith("greater_equal"))
    return ((a: number, b: number) => (a >= b ? -1 : 1)) as unknown as CppValue;
  if (fn.startsWith("greater"))
    return ((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0)) as unknown as CppValue;
  if (fn.startsWith("less_equal"))
    return ((a: number, b: number) => (a <= b ? -1 : 1)) as unknown as CppValue;
  if (fn.startsWith("less"))
    return ((a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0)) as unknown as CppValue;

  return undefined;
}
