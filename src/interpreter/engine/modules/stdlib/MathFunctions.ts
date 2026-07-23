import type { CppValue } from "../../../types";
import { EventType } from "../../../types";
import type { EngineContext } from "../EngineContext";

export const MATH_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  sqrt: Math.sqrt,
  cbrt: Math.cbrt,
  pow: Math.pow,
  exp: Math.exp,
  log: Math.log,
  log2: Math.log2,
  log10: Math.log10,
  floor: Math.floor,
  ceil: Math.ceil,
  round: Math.round,
  trunc: Math.trunc,
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  fabs: Math.abs,
  fabsf: Math.abs,
  fmod: (a, b) => a % b,
  hypot: Math.hypot,
  ldexp: (x, e) => x * 2 ** e,
  max: Math.max,
  min: Math.min,
  abs: Math.abs,
};

export function handleMathFunction(
  fn: string,
  args: number[],
  line: number,
  ctx: EngineContext,
): CppValue | undefined {
  if (Object.prototype.hasOwnProperty.call(MATH_FUNCTIONS, fn)) {
    const result = MATH_FUNCTIONS[fn](...args);
    ctx.eventEmitter.emit(line, EventType.FUNCTION_CALL, { function: fn, args });
    ctx.eventEmitter.emit(line, EventType.FUNCTION_RETURN, {
      function: fn,
      returnValue: result,
    });
    return result;
  }
  return undefined;
}
