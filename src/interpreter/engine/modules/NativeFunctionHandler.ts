import type { IRFunctionCall } from "../../ir/IRNode";
import { ExpressionEvaluator } from "../../evaluator/ExpressionEvaluator";
import { CallStack } from "../../runtime/CallStack";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import type { CppValue } from "../../types";

export class NativeFunctionHandler {
  constructor(
    private callStack: CallStack,
    private eventEmitter: EventEmitter,
  ) {}

  public getContainerObject(
    callNode: IRFunctionCall,
    currentEvaluator: ExpressionEvaluator,
    argIndex: number = 0,
  ): any {
    const arg = callNode.arguments[argIndex];
    if (!arg || arg.kind !== "MethodCall") return null;
    return currentEvaluator.evaluate((arg as any).object);
  }

  public updateStringInScope(
    callNode: IRFunctionCall,
    ev: ExpressionEvaluator,
    newVal: string,
    argIndex: number = 0,
  ): void {
    const arg = callNode.arguments[argIndex];
    if (arg && arg.kind === "MethodCall") {
      const targetObj = (arg as any).object;
      if (targetObj && targetObj.kind === "Identifier") {
        try {
          this.callStack.peek().scopeManager.assignVariable(targetObj.name, newVal);
          this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, {
            variable: targetObj.name,
            value: newVal,
          });
        } catch {}
      } else if (targetObj && targetObj.kind === "SubscriptExpression") {
        const arrObj = ev.evaluate((targetObj as any).object);
        const idx = ev.evaluate((targetObj as any).index) as number;
        const targetArr = Array.isArray(arrObj) ? arrObj : (arrObj as any)?.data;
        if (targetArr) {
          targetArr[idx] = newVal;
          const name = (targetObj as any).object?.name || "array";
          this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, {
            variable: `${name}[${idx}]`,
            value: newVal,
          });
        }
      }
    }
  }

  public resolveContainerArray(
    callNode: IRFunctionCall,
    currentEvaluator: ExpressionEvaluator,
    argIndex: number = 0,
  ): any[] | null {
    const obj = this.getContainerObject(callNode, currentEvaluator, argIndex);
    if (typeof obj === "string") return obj.split("");
    return Array.isArray(obj) ? obj : ((obj as any)?.data ?? null);
  }

  public nativeSwap(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const [arg1, arg2] = callNode.arguments;

    if (arg1.kind === "SubscriptExpression" && arg2.kind === "SubscriptExpression") {
      const arr1Obj = (arg1 as any).object;
      const arr2Obj = (arg2 as any).object;
      const arr1 = ev.evaluate(arr1Obj);
      const idx1 = ev.evaluate((arg1 as any).index) as number;
      const arr2 = ev.evaluate(arr2Obj);
      const idx2 = ev.evaluate((arg2 as any).index) as number;
      const t1 = Array.isArray(arr1) ? arr1 : (arr1 as any).data;
      const t2 = Array.isArray(arr2) ? arr2 : (arr2 as any).data;
      const tmp = t1[idx1];
      t1[idx1] = t2[idx2];
      t2[idx2] = tmp;

      const name1 = arr1Obj.kind === "Identifier" ? arr1Obj.name : "array";
      const name2 = arr2Obj.kind === "Identifier" ? arr2Obj.name : "array";
      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, {
        variable: `${name1}[${idx1}]`,
        value: t1[idx1],
      });
      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, {
        variable: `${name2}[${idx2}]`,
        value: t2[idx2],
      });
    } else if (arg1.kind === "Identifier" && arg2.kind === "Identifier") {
      const v1 = ev.evaluate(arg1);
      const v2 = ev.evaluate(arg2);
      const scope = this.callStack.peek().scopeManager;
      const name1 = (arg1 as any).name;
      const name2 = (arg2 as any).name;
      try {
        scope.assignVariable(name1, v2);
      } catch {
        scope.defineVariable(name1, "auto", v2);
      }
      try {
        scope.assignVariable(name2, v1);
      } catch {
        scope.defineVariable(name2, "auto", v1);
      }

      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, { variable: name1, value: v2 });
      this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, { variable: name2, value: v1 });
    } else if (arg1.kind === "MemberExpression" && arg2.kind === "MemberExpression") {
      const obj1 = ev.evaluate((arg1 as any).object) as any;
      const obj2 = ev.evaluate((arg2 as any).object) as any;
      const prop1 = (arg1 as any).property as string;
      const prop2 = (arg2 as any).property as string;
      if (obj1 && obj2) {
        const tmp = obj1[prop1];
        obj1[prop1] = obj2[prop2];
        obj2[prop2] = tmp;
        this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, {
          variable: prop1,
          value: obj1[prop1],
        });
        this.eventEmitter.emit(callNode.line, EventType.ASSIGNMENT, {
          variable: prop2,
          value: obj2[prop2],
        });
      }
    }
    return undefined;
  }

  public nativeContainerAlgorithm(
    fn: string,
    callNode: IRFunctionCall,
    ev: ExpressionEvaluator,
  ): CppValue {
    const isStr = typeof this.getContainerObject(callNode, ev) === "string";
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return undefined;
    if (fn === "reverse") {
      arr.reverse();
      if (isStr) this.updateStringInScope(callNode, ev, arr.join(""));
      return undefined;
    }
    if (fn === "max_element") return Math.max(...arr);
    if (fn === "min_element") return Math.min(...arr);
    if (fn === "accumulate") {
      const init = ev.evaluate(callNode.arguments[2]) as number;
      return arr.reduce((acc: number, val: number) => acc + val, init);
    }
    return undefined;
  }

  public nativeSort(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const isStr = typeof this.getContainerObject(callNode, ev) === "string";
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return undefined;
    if (callNode.arguments.length >= 3) {
      const cmp = ev.evaluate(callNode.arguments[2]);
      if (typeof cmp === "function") {
        arr.sort((a, b) => {
          const r = (cmp as Function)(a, b);
          return typeof r === "boolean" ? (r ? -1 : 1) : (r as number);
        });
      } else {
        arr.sort((a, b) => a - b);
      }
    } else {
      arr.sort((a, b) => {
        if (Array.isArray(a) && Array.isArray(b)) {
          for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) return a[i] < b[i] ? -1 : a[i] > b[i] ? 1 : 0;
          }
          return a.length - b.length;
        }
        if (typeof a === "string" && typeof b === "string") {
          return a < b ? -1 : a > b ? 1 : 0;
        }
        return (a as any) - (b as any);
      });
    }
    if (isStr) this.updateStringInScope(callNode, ev, arr.join(""));
    this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL, { function: fn, args: [] });
    this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, {
      function: fn,
      returnValue: undefined,
    });
    return undefined;
  }

  public nativeFill(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return undefined;
    const fillVal = ev.evaluate(callNode.arguments[2]);
    if (fn === "fill_n") {
      const n = ev.evaluate(callNode.arguments[1]) as number;
      for (let i = 0; i < n && i < arr.length; i++) arr[i] = fillVal;
    } else {
      arr.fill(fillVal);
    }
    return undefined;
  }

  public nativeCount(fn: string, callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return 0;
    if (fn === "count") {
      const val = ev.evaluate(callNode.arguments[2]);
      return arr.filter((x: any) => x === val).length;
    }
    const pred = ev.evaluate(callNode.arguments[2]);
    return typeof pred === "function" ? arr.filter((x: any) => (pred as Function)(x)).length : 0;
  }

  public nativeFind(
    byPredicate: boolean,
    callNode: IRFunctionCall,
    ev: ExpressionEvaluator,
  ): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return -1;
    const needle = ev.evaluate(callNode.arguments[2]);
    if (byPredicate) {
      return typeof needle === "function" ? arr.findIndex((x: any) => (needle as Function)(x)) : -1;
    }
    return arr.indexOf(needle);
  }

  public nativeQuantifier(
    kind: "all" | "any" | "none",
    callNode: IRFunctionCall,
    ev: ExpressionEvaluator,
  ): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return kind === "all" || kind === "none";
    const pred = ev.evaluate(callNode.arguments[2]);
    if (typeof pred !== "function") return false;
    const fn = pred as Function;
    if (kind === "all") return arr.every((x: any) => fn(x));
    if (kind === "any") return arr.some((x: any) => fn(x));
    return arr.every((x: any) => !fn(x));
  }

  public nativeForEach(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    const func = ev.evaluate(callNode.arguments[2]);
    if (arr && typeof func === "function") arr.forEach((x: any) => (func as Function)(x));
    return undefined;
  }

  public nativeTransform(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const src = this.resolveContainerArray(callNode, ev, 0);
    const func = ev.evaluate(callNode.arguments[callNode.arguments.length - 1]);
    if (!src || typeof func !== "function") return undefined;
    const mapped = src.map((x: any) => (func as Function)(x));
    mapped.forEach((v: any, i: number) => {
      src[i] = v;
    });
    return undefined;
  }

  public nativeRemoveIf(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    const pred = ev.evaluate(callNode.arguments[2]);
    if (!arr || typeof pred !== "function") return arr?.length ?? 0;
    const filtered = arr.filter((x: any) => !(pred as Function)(x));
    arr.splice(0, arr.length, ...filtered);
    return arr.length;
  }

  public nativeIota(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    const init = ev.evaluate(callNode.arguments[2]) as number;
    if (arr)
      arr.forEach((_: any, i: number) => {
        arr[i] = init + i;
      });
    return undefined;
  }

  public nativeRotate(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    const midVal = callNode.arguments[1];
    if (!arr || !midVal) return undefined;
    let mid: number;
    if (midVal.kind === "BinaryExpression") {
      mid = ev.evaluate(midVal) as number;
    } else {
      mid = ev.evaluate(midVal) as number;
    }
    if (mid > 0 && mid < arr.length) {
      arr.push(...arr.splice(0, mid));
    }
    return undefined;
  }

  public nativeCopy(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const src = this.resolveContainerArray(callNode, ev, 0);
    const dest = callNode.arguments[2];
    if (!src || !dest) return undefined;
    const destObj =
      dest.kind === "MethodCall" ? ev.evaluate((dest as any).object) : ev.evaluate(dest);
    const destArr = Array.isArray(destObj) ? destObj : (destObj as any)?.data;
    if (destArr)
      src.forEach((v: any, i: number) => {
        destArr[i] = v;
      });
    return undefined;
  }

  public nativePartition(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    const pred = ev.evaluate(callNode.arguments[2]);
    if (!arr || typeof pred !== "function") return arr?.length ?? 0;
    const trueGroup = arr.filter((x: any) => (pred as Function)(x));
    const falseGroup = arr.filter((x: any) => !(pred as Function)(x));
    trueGroup.push(...falseGroup);
    arr.splice(0, arr.length, ...trueGroup);
    return trueGroup.length;
  }

  public nativeUnique(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return 0;
    const filtered = arr.filter((v: any, i: number) => i === 0 || v !== arr[i - 1]);
    arr.splice(0, arr.length, ...filtered);
    return arr.length;
  }

  public nativePermutation(
    fn: string,
    callNode: IRFunctionCall,
    ev: ExpressionEvaluator,
  ): CppValue {
    const arr = this.resolveContainerArray(callNode, ev);
    if (!arr) return false;
    const n = arr.length;
    let i = n - 2;
    const isNext = fn === "next_permutation";
    while (i >= 0 && (isNext ? arr[i] >= arr[i + 1] : arr[i] <= arr[i + 1])) i--;
    if (i < 0) {
      arr.reverse();
      return false;
    }
    let j = n - 1;
    while (isNext ? arr[j] <= arr[i] : arr[j] >= arr[i]) j--;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    arr.splice(i + 1, n - i - 1, ...arr.slice(i + 1).reverse());
    return true;
  }

  public nativeBinaryBound(
    fn: string,
    callNode: IRFunctionCall,
    ev: ExpressionEvaluator,
  ): CppValue {
    const arr = this.resolveContainerArray(callNode, ev) as number[];
    const val = ev.evaluate(callNode.arguments[2]) as number;
    if (!arr) return 0;
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      (fn === "lower_bound" ? arr[mid] < val : arr[mid] <= val) ? (lo = mid + 1) : (hi = mid);
    }
    return lo;
  }

  public nativeBinarySearch(callNode: IRFunctionCall, ev: ExpressionEvaluator): CppValue {
    const arr = this.resolveContainerArray(callNode, ev) as any[];
    const val = ev.evaluate(callNode.arguments[2])!;
    if (!arr) return false;
    let lo = 0,
      hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (arr[mid] < val) lo = mid + 1;
      else if (arr[mid] > val) hi = mid;
      else return true;
    }
    return false;
  }
}
