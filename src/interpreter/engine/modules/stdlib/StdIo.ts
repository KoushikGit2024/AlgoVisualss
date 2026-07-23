import type { CppValue } from "../../../types";
import type { ExpressionEvaluator } from "../../../evaluator/ExpressionEvaluator";
import type { IRFunctionCall } from "../../../ir/IRNode";
import { EventType } from "../../../types";
import type { EngineContext } from "../EngineContext";

export function handleStdIo(
  fn: string,
  callNode: IRFunctionCall,
  currentEvaluator: ExpressionEvaluator,
  ctx: EngineContext
): CppValue | undefined {
  if (fn === "printf" || fn === "fprintf") {
    const rawArgs = callNode.arguments.map((a: any) => currentEvaluator.evaluate(a));
    const fmtStr = String(rawArgs[0] ?? "");
    let argIdx = 1;
    const formatted = fmtStr.replace(/%[-+0 #]*\d*(?:\.\d+)?[diouxXeEfgGscpn%lh]/g, (match) =>
      match === "%%" ? "%" : String(rawArgs[argIdx++] ?? ""),
    );
    ctx.eventEmitter.emit(callNode.line, EventType.WRITE, { output: formatted });
    return 0;
  }
  return undefined;
}
