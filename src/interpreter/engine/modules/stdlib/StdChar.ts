import type { CppValue } from "../../../types";
import type { ExpressionEvaluator } from "../../../evaluator/ExpressionEvaluator";
import type { IRFunctionCall } from "../../../ir/IRNode";

const charFns: Record<string, (ch: string) => CppValue> = {
  toupper: (ch) => ch.toUpperCase().charCodeAt(0),
  tolower: (ch) => ch.toLowerCase().charCodeAt(0),
  isdigit: (ch) => (/\d/.test(ch) ? 1 : 0),
  isalpha: (ch) => (/[a-zA-Z]/.test(ch) ? 1 : 0),
  isalnum: (ch) => (/[a-zA-Z0-9]/.test(ch) ? 1 : 0),
  islower: (ch) => (/[a-z]/.test(ch) ? 1 : 0),
  isupper: (ch) => (/[A-Z]/.test(ch) ? 1 : 0),
  isspace: (ch) => (/\s/.test(ch) ? 1 : 0),
  ispunct: (ch) => (/[^\w\s]/.test(ch) ? 1 : 0),
  isprint: (ch) => (ch.charCodeAt(0) >= 32 && ch.charCodeAt(0) < 127 ? 1 : 0),
};

export function handleStdChar(
  fn: string,
  callNode: IRFunctionCall,
  currentEvaluator: ExpressionEvaluator,
): CppValue | undefined {
  if (Object.prototype.hasOwnProperty.call(charFns, fn)) {
    const c = currentEvaluator.evaluate(callNode.arguments[0]);
    const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
    return charFns[fn](ch);
  }
  return undefined;
}
