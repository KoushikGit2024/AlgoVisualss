import type { CppValue } from "../../../types";
import type { ExpressionEvaluator } from "../../../evaluator/ExpressionEvaluator";
import type { IRFunctionCall } from "../../../ir/IRNode";

export function handleStdStringFuncs(
  fn: string,
  callNode: IRFunctionCall,
  currentEvaluator: ExpressionEvaluator,
): CppValue | undefined {
  if (fn === "to_string") {
    return String(currentEvaluator.evaluate(callNode.arguments[0]) ?? "");
  }
  if (fn === "stoi" || fn === "stol" || fn === "stoll" || fn === "atoi") {
    return parseInt(String(currentEvaluator.evaluate(callNode.arguments[0])), 10);
  }
  if (fn === "stod" || fn === "stof" || fn === "stold" || fn === "atof") {
    return parseFloat(String(currentEvaluator.evaluate(callNode.arguments[0])));
  }

  // Handle generic string constructor logic
  if (fn === "string" || fn === "std::string") {
    const args = callNode.arguments.map((arg: any) => currentEvaluator.evaluate(arg));
    if (args.length === 2 && typeof args[0] === "number") {
      const fillChar =
        typeof args[1] === "string" ? args[1] : String.fromCharCode(args[1] as number);
      return fillChar.repeat(args[0]);
    } else if (args.length === 1) {
      return String(args[0] ?? "");
    } else if (args.length === 0) {
      return "";
    }
  }

  return undefined;
}
