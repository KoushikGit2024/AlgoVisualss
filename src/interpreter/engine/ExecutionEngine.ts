import type { IRProgram, IRFunctionDeclaration, IRFunctionCall, IRMethodCall, IRNewExpression, IRLambdaExpression, IRStructDeclaration, IRExpression, IRVariableDeclaration } from "../ir/IRNode";
import { CallStack } from "../runtime/CallStack";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { StatementExecutor } from "../executor/StatementExecutor";
import { IRWalker } from "../walker/IRWalker";
import { EventType } from "../types";
import type { RuntimeSnapshot, CppValue, CppType } from "../types";
import { createSnapshot, ReturnSignal } from "../utils/helpers";

/**
 * The `ExecutionEngine` is the master orchestrator of the runtime environment.
 * It initializes the global memory space, resolves function definitions, and 
 * drives the execution of the Intermediate Representation (IR) tree.
 * Crucially, it manages the `EventEmitter` subscription that generates chronological 
 * `RuntimeSnapshot` objects for the React visualization frontend.
 */
export class ExecutionEngine {
  private callStack: CallStack;
  private eventEmitter: EventEmitter;
  private functions: Map<string, IRFunctionDeclaration>;
  public classBlueprints: Map<string, IRStructDeclaration>;
  private snapshots: RuntimeSnapshot[];
  private globalDeclarations: IRVariableDeclaration[] = [];
  private globalVariables: Map<string, { type: CppType; value: CppValue }> = new Map();

  constructor() {
    this.callStack = new CallStack();
    this.eventEmitter = new EventEmitter();
    this.functions = new Map<string, IRFunctionDeclaration>();
    this.classBlueprints = new Map<string, IRStructDeclaration>();
    this.snapshots = [];

    // State Capture Hook: Generates a distinct memory snapshot upon any milestone event
    this.eventEmitter.subscribe((event) => {
      const activeFrame = this.callStack.peek();
      this.snapshots.push(createSnapshot(event, this.callStack, activeFrame.scopeManager));
    });
  }

  /**
   * Loads a parsed Intermediate Representation program into the engine's global registry.
   */
  public loadProgram(program: IRProgram): void {
    this.functions.clear();
    for (const func of program.functions) {
      this.functions.set(func.name, func);
    }
    this.classBlueprints.clear();
    if (program.structs) {
      for (const structDecl of program.structs) {
        this.classBlueprints.set(structDecl.name, structDecl);
      }
    }
    // Store global variable declarations for evaluation at runtime
    this.globalDeclarations = program.globals || [];
  }

  /**
   * Initiates the execution sequence from a specified entry point.
   * @param entryPoint - The designated starting function (defaults to "main").
   * @returns The complete array of chronological memory snapshots.
   */
  public run(entryPoint: string = "main"): RuntimeSnapshot[] {
    this.snapshots = [];
    this.eventEmitter.reset();
    this.globalVariables.clear();
    
    if (!this.functions.has(entryPoint)) {
      throw new Error(`Linker Error: Entry point '${entryPoint}' not found in the parsed translation unit.`);
    }

    // ─── GLOBAL VARIABLE INITIALIZATION ──────────────────────────────────
    // Evaluate all global declarations before any function runs.
    // Uses a temporary frame to evaluate initializers, then stores results.
    if (this.globalDeclarations.length > 0) {
      const tempFrame = this.callStack.push("__global_init__");
      const tempEvaluator = new ExpressionEvaluator(tempFrame.scopeManager, this.eventEmitter);
      const tempExecutor = new StatementExecutor(tempFrame.scopeManager, tempEvaluator, this.eventEmitter, this.classBlueprints);

      for (const globalDecl of this.globalDeclarations) {
        try {
          tempExecutor.executeVariableDeclaration(globalDecl);
          const symbol = tempFrame.scopeManager.getVariable(globalDecl.name);
          this.globalVariables.set(globalDecl.name, {
            type: symbol.type as CppType,
            value: symbol.value
          });
        } catch (e) {
          console.warn(`[Engine] Failed to initialize global '${globalDecl.name}': ${(e as Error).message}`);
        }
      }
      this.callStack.pop(); // Remove temporary frame
    }

    this.invokeFunction(entryPoint, []);
    return this.snapshots;
  }

  /**
   * Resolves function calls, including native interception for C++ STL utilities.
   * Supports passing function pointers and comparators dynamically.
   */
  public invokeFunctionCall(callNode: IRFunctionCall, currentEvaluator: ExpressionEvaluator): CppValue {
    const functionName = callNode.callee;

    // ─── NATIVE C++ STD LIBRARY INTERCEPTS ──────────────────────────────
    // Handle std::swap natively to enforce pass-by-reference semantics in JS
    if (functionName === "swap" && callNode.arguments.length === 2) {
      const arg1 = callNode.arguments[0];
      const arg2 = callNode.arguments[1];

      if (arg1.kind === "SubscriptExpression" && arg2.kind === "SubscriptExpression") {
        const arr1 = currentEvaluator.evaluate((arg1 as any).object);
        const idx1 = currentEvaluator.evaluate((arg1 as any).index) as number;
        const arr2 = currentEvaluator.evaluate((arg2 as any).object);
        const idx2 = currentEvaluator.evaluate((arg2 as any).index) as number;

        const target1 = Array.isArray(arr1) ? arr1 : (arr1 as Record<string, any>).data;
        const target2 = Array.isArray(arr2) ? arr2 : (arr2 as Record<string, any>).data;

        const temp = target1[idx1];
        target1[idx1] = target2[idx2];
        target2[idx2] = temp;

        this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL, { function: "swap", args: [target1[idx1], target2[idx2]] });
        this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, { function: "swap", returnValue: undefined });
        return undefined;
      }

      if (arg1.kind === "Identifier" && arg2.kind === "Identifier") {
        const val1 = currentEvaluator.evaluate(arg1);
        const val2 = currentEvaluator.evaluate(arg2);
        const activeScope = this.callStack.peek().scopeManager;
        
        try { activeScope.assignVariable((arg1 as any).name, val2); } 
        catch { activeScope.defineVariable((arg1 as any).name, "auto", val2); }

        try { activeScope.assignVariable((arg2 as any).name, val1); } 
        catch { activeScope.defineVariable((arg2 as any).name, "auto", val1); }
        
        return undefined;
      }
    }

    // Handle STL Algorithm utilities natively
    if (["reverse", "max_element", "min_element", "accumulate"].includes(functionName)) {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const targetArray = Array.isArray(targetObj) ? targetObj : (targetObj as Record<string, any>).data;

        if (functionName === "reverse") {
          targetArray.reverse();
          this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL, { function: "reverse", args: [] });
          this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, { function: "reverse", returnValue: undefined });
          return undefined;
        }
        if (functionName === "max_element") return Math.max(...targetArray);
        if (functionName === "min_element") return Math.min(...targetArray);
        if (functionName === "accumulate") {
          const initial = currentEvaluator.evaluate(callNode.arguments[2]) as number;
          return targetArray.reduce((acc: number, val: number) => acc + val, initial);
        }
      }
    }

    // Handle standard C++ math utilities
    if (functionName === "max" || functionName === "min" || functionName === "abs") {
      const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
      if (functionName === "max") return Math.max(...(args as number[]));
      if (functionName === "min") return Math.min(...(args as number[]));
      if (functionName === "abs") return Math.abs(args[0] as number);
    }

    // ─── EXTENDED C++ STANDARD LIBRARY INTERCEPTS ──────────────────────────────

    // MATH LIBRARY (<cmath>)
    const MATH_FUNS: Record<string, (...a: number[]) => number> = {
      sqrt:  Math.sqrt,   cbrt:  Math.cbrt,
      pow:   Math.pow,    exp:   Math.exp,
      log:   Math.log,    log2:  Math.log2,    log10: Math.log10,
      floor: Math.floor,  ceil:  Math.ceil,    round: Math.round, trunc: Math.trunc,
      sin:   Math.sin,    cos:   Math.cos,     tan:   Math.tan,
      asin:  Math.asin,   acos:  Math.acos,    atan:  Math.atan,  atan2: Math.atan2,
      sinh:  Math.sinh,   cosh:  Math.cosh,    tanh:  Math.tanh,
      fabs:  Math.abs,    fabsf: Math.abs,     fmod:  (a, b) => a % b,
      hypot: Math.hypot,  ldexp: (x, e) => x * Math.pow(2, e),
    };
    if (Object.prototype.hasOwnProperty.call(MATH_FUNS, functionName)) {
      const args = callNode.arguments.map(a => currentEvaluator.evaluate(a) as number);
      const result = MATH_FUNS[functionName](...args);
      this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL, { function: functionName, args });
      this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, { function: functionName, returnValue: result });
      return result;
    }

    // GCD & LCM (<numeric>)
    if (functionName === "__gcd" || functionName === "gcd") {
      let a = Math.abs(currentEvaluator.evaluate(callNode.arguments[0]) as number);
      let b = Math.abs(currentEvaluator.evaluate(callNode.arguments[1]) as number);
      while (b) { [a, b] = [b, a % b]; }
      return a;
    }
    if (functionName === "lcm") {
      let a = Math.abs(currentEvaluator.evaluate(callNode.arguments[0]) as number);
      let b = Math.abs(currentEvaluator.evaluate(callNode.arguments[1]) as number);
      if (a === 0 || b === 0) return 0;
      let pa = a, pb = b;
      while (pb) { [pa, pb] = [pb, pa % pb]; }
      return (a / pa) * b;
    }

    // COMPARATOR FUNCTORS — greater<>() / less<>() / greater_equal<>() / less_equal<>()
    // These are callable objects used as sort comparators. Return a JS comparator function.
    if (functionName.startsWith("greater") || functionName === "greater") {
      return ((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0)) as unknown as CppValue;
    }
    if (functionName.startsWith("less") || functionName === "less") {
      return ((a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0)) as unknown as CppValue;
    }
    if (functionName.startsWith("greater_equal")) {
      return ((a: number, b: number) => (a >= b ? -1 : 1)) as unknown as CppValue;
    }
    if (functionName.startsWith("less_equal")) {
      return ((a: number, b: number) => (a <= b ? -1 : 1)) as unknown as CppValue;
    }

    // STL SORT with optional comparator (<algorithm>)
    // Handles: sort(v.begin(), v.end()) and sort(v.begin(), v.end(), greater<int>())
    if (functionName === "sort" || functionName === "stable_sort") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data;
        if (arr && Array.isArray(arr)) {
          if (callNode.arguments.length >= 3) {
            const cmpVal = currentEvaluator.evaluate(callNode.arguments[2]);
            if (typeof cmpVal === "function") {
              arr.sort((a: any, b: any) => {
                const r = (cmpVal as Function)(a, b);
                return typeof r === "boolean" ? (r ? -1 : 1) : (r as number);
              });
            } else {
              arr.sort((a: any, b: any) => a - b);
            }
          } else {
            arr.sort((a: any, b: any) => a - b);
          }
          this.eventEmitter.emit(callNode.line, EventType.FUNCTION_CALL, { function: functionName, args: [] });
          this.eventEmitter.emit(callNode.line, EventType.FUNCTION_RETURN, { function: functionName, returnValue: undefined });
        }
      }
      return undefined;
    }

    // FILL / FILL_N (<algorithm>)
    if (functionName === "fill" || functionName === "fill_n") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data;
        if (arr && Array.isArray(arr)) {
          const fillVal = currentEvaluator.evaluate(
            functionName === "fill_n" ? callNode.arguments[2] : callNode.arguments[2]
          );
          if (functionName === "fill_n") {
            const n = currentEvaluator.evaluate(callNode.arguments[1]) as number;
            for (let i = 0; i < n && i < arr.length; i++) arr[i] = fillVal;
          } else {
            arr.fill(fillVal);
          }
        }
      }
      return undefined;
    }

    // COUNT / COUNT_IF (<algorithm>)
    if (functionName === "count" || functionName === "count_if") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data;
        if (arr && Array.isArray(arr)) {
          if (functionName === "count") {
            const val = currentEvaluator.evaluate(callNode.arguments[2]);
            return arr.filter((x: any) => x === val).length;
          } else {
            const pred = currentEvaluator.evaluate(callNode.arguments[2]);
            if (typeof pred === "function") {
              return arr.filter((x: any) => (pred as Function)(x)).length;
            }
          }
        }
      }
      return 0;
    }

    // UNIQUE (<algorithm>) — removes consecutive duplicates in-place
    if (functionName === "unique") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data;
        if (arr && Array.isArray(arr)) {
          const filtered = arr.filter((v: any, i: number) => i === 0 || v !== arr[i - 1]);
          arr.splice(0, arr.length, ...filtered);
          return arr.length; // C++ unique returns iterator to new end
        }
      }
      return 0;
    }

    // NEXT_PERMUTATION / PREV_PERMUTATION (<algorithm>)
    if (functionName === "next_permutation" || functionName === "prev_permutation") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data;
        if (arr && Array.isArray(arr)) {
          const n = arr.length;
          let i = n - 2;
          if (functionName === "next_permutation") {
            while (i >= 0 && arr[i] >= arr[i + 1]) i--;
            if (i < 0) { arr.reverse(); return false; }
            let j = n - 1;
            while (arr[j] <= arr[i]) j--;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            arr.splice(i + 1, n - i - 1, ...arr.slice(i + 1).reverse());
          } else {
            while (i >= 0 && arr[i] <= arr[i + 1]) i--;
            if (i < 0) { arr.reverse(); return false; }
            let j = n - 1;
            while (arr[j] >= arr[i]) j--;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            arr.splice(i + 1, n - i - 1, ...arr.slice(i + 1).reverse());
          }
          return true;
        }
      }
      return false;
    }

    // BINARY SEARCH — lower_bound / upper_bound (<algorithm>)
    if (functionName === "lower_bound" || functionName === "upper_bound") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = (Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data) as number[];
        const val = currentEvaluator.evaluate(callNode.arguments[2]) as number;
        if (arr && Array.isArray(arr)) {
          let lo = 0, hi = arr.length;
          while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            const shouldAdvance = functionName === "lower_bound"
              ? arr[mid] < val
              : arr[mid] <= val;
            if (shouldAdvance) lo = mid + 1; else hi = mid;
          }
          return lo;
        }
      }
      return 0;
    }

    // BINARY_SEARCH (<algorithm>) — returns bool
    if (functionName === "binary_search") {
      const arg1 = callNode.arguments[0];
      if (arg1 && arg1.kind === "MethodCall") {
        const targetObj = currentEvaluator.evaluate((arg1 as any).object);
        const arr = (Array.isArray(targetObj) ? targetObj : (targetObj as any)?.data) as any[];
        const val = currentEvaluator.evaluate(callNode.arguments[2])!;
        if (arr && Array.isArray(arr)) {
          let lo = 0, hi = arr.length;
          while (lo < hi) {
            const mid = (lo + hi) >>> 1;
            if (arr[mid] < val) lo = mid + 1;
            else if (arr[mid] > val) hi = mid;
            else return true;
          }
          return false;
        }
      }
      return false;
    }

    // MAKE_PAIR / MAKE_TUPLE
    if (functionName === "make_pair" || functionName === "pair") {
      const a0 = currentEvaluator.evaluate(callNode.arguments[0]);
      const a1 = callNode.arguments.length > 1 ? currentEvaluator.evaluate(callNode.arguments[1]) : undefined;
      return [a0, a1 !== undefined ? a1 : 0];
    }
    if (functionName === "make_tuple") {
      return callNode.arguments.map(a => currentEvaluator.evaluate(a));
    }

    // STRING UTILITIES (<string>, <sstream>)
    if (functionName === "to_string") {
      const v = currentEvaluator.evaluate(callNode.arguments[0]);
      return String(v ?? "");
    }
    if (functionName === "stoi" || functionName === "stol" || functionName === "stoll") {
      const s = currentEvaluator.evaluate(callNode.arguments[0]) as string;
      return parseInt(String(s), 10);
    }
    if (functionName === "stod" || functionName === "stof" || functionName === "stold") {
      const s = currentEvaluator.evaluate(callNode.arguments[0]) as string;
      return parseFloat(String(s));
    }
    if (functionName === "atoi") {
      const s = currentEvaluator.evaluate(callNode.arguments[0]) as string;
      return parseInt(String(s), 10);
    }
    if (functionName === "atof") {
      const s = currentEvaluator.evaluate(callNode.arguments[0]) as string;
      return parseFloat(String(s));
    }
    // toupper / tolower for char arithmetic
    if (functionName === "toupper" || functionName === "tolower") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      const out = functionName === "toupper" ? ch.toUpperCase() : ch.toLowerCase();
      return out.charCodeAt(0);
    }
    if (functionName === "isdigit") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return /\d/.test(ch) ? 1 : 0;
    }
    if (functionName === "isalpha") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return /[a-zA-Z]/.test(ch) ? 1 : 0;
    }
    if (functionName === "isalnum") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return /[a-zA-Z0-9]/.test(ch) ? 1 : 0;
    }
    if (functionName === "islower") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return /[a-z]/.test(ch) ? 1 : 0;
    }
    if (functionName === "isupper") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return /[A-Z]/.test(ch) ? 1 : 0;
    }
    if (functionName === "isspace") {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return /\s/.test(ch) ? 1 : 0;
    }

    // PRINTF (<cstdio>) — emits formatted output to the visualizer
    if (functionName === "printf" || functionName === "fprintf") {
      const rawArgs = callNode.arguments.map(a => currentEvaluator.evaluate(a));
      const fmtStr = String(rawArgs[0] ?? "");
      let argIdx = 1;
      const formatted = fmtStr.replace(/%[-+0 #]*\d*(?:\.\d+)?[diouxXeEfgGscpn%lh]/g, (match) => {
        if (match === "%%") return "%";
        return String(rawArgs[argIdx++] ?? "");
      });
      this.eventEmitter.emit(callNode.line, EventType.WRITE, { output: formatted });
      return 0;
    }

    // ASSERT — throw on false assertion
    if (functionName === "assert") {
      const v = currentEvaluator.evaluate(callNode.arguments[0]);
      if (!v) throw new Error(`Assertion Failed at line ${callNode.line}: assert(${callNode.arguments[0] ? "expr" : ""}) evaluated to false.`);
      return undefined;
    }

    // ─── STANDARD FUNCTION INVOCATION ───────────────────────────────────
    const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
    let targetCallee: string | any = callNode.callee;
    let localFuncRef: any = undefined;
    try { 
      const activeScope = this.callStack.peek().scopeManager;
      localFuncRef = activeScope.getVariable(functionName)?.value;
    } catch (e) { /* Fallback to global registry */ }
    
    if (typeof localFuncRef === "function") {
        return localFuncRef(...args);
    }
    
    if (typeof localFuncRef === "string") targetCallee = localFuncRef; 
    else if (localFuncRef && typeof localFuncRef === "object" && (localFuncRef as any).kind === "LambdaExpression") {
        targetCallee = localFuncRef;
    }

    return this.invokeFunction(targetCallee, args, callNode.arguments, currentEvaluator);
  }

  /**
   * 
   * Resolves object-oriented method calls (e.g., container.push_back(), str.substr()).
   */
  public invokeMethodCall(methodNode: IRMethodCall, currentEvaluator: ExpressionEvaluator): CppValue {
    // Evaluate the object instance. Wrapped in try-catch so that if the object's
    // variable wasn't declared (e.g., due to a constructor-syntax parsing failure),
    // the auto-recovery block below can still attempt to create it rather than crashing.
    let objInstance: CppValue;
    try {
      objInstance = currentEvaluator.evaluate(methodNode.object);
    } catch (e) {
      objInstance = undefined as any;
    }

    // ─── UNIVERSAL OBJECT AUTO-RECOVERY ───────────────────────────────────
    if (!objInstance) {
      // 1. Recover uninitialized standard identifiers (e.g., queue<int> q;)
      if (methodNode.object.kind === "Identifier") {
        const varName = (methodNode.object as any).name;
        objInstance = []; 
        const activeScope = this.callStack.peek().scopeManager;
        
        try {
          activeScope.assignVariable(varName, objInstance);
        } catch (e) {
          activeScope.defineVariable(varName, "auto", objInstance);
        }
      }
      // 2. Recover uninitialized 2D nested structures (e.g., adj[0].push_back(1))
      else if (methodNode.object.kind === "SubscriptExpression") {
        const subExpr = methodNode.object as any;
        const parentObj = currentEvaluator.evaluate(subExpr.object);
        const index = currentEvaluator.evaluate(subExpr.index) as string | number;
        
        if (parentObj) {
          objInstance = []; 
          if (parentObj instanceof Map) {
              parentObj.set(index, objInstance); 
          } else if (Array.isArray(parentObj)) {
              parentObj[index as number] = objInstance;
          } else if ((parentObj as Record<string, any>).data && Array.isArray((parentObj as Record<string, any>).data)) {
              (parentObj as Record<string, any>).data[index as number] = objInstance;
          } else {
              (parentObj as Record<string, any>)[index] = objInstance;
          }
        }
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    const args = methodNode.arguments.map(arg => currentEvaluator.evaluate(arg));

    if (objInstance === undefined || objInstance === null) {
      throw new Error(`Memory Access Violation at line ${methodNode.line}: Attempted to call method '${methodNode.method}' on a null or undefined reference.`);
    }

    const methodName = methodNode.method;

    const isPlainArray = Array.isArray(objInstance);
    const isMockContainer = objInstance && typeof objInstance === "object" && "data" in objInstance && Array.isArray((objInstance as Record<string, any>).data);
    const isSet = objInstance instanceof Set;
    const isMap = objInstance instanceof Map;
    const isString = typeof objInstance === "string"; 
    const targetArray = isPlainArray ? (objInstance as any[]) : (isMockContainer ? (objInstance as Record<string, any>).data : null);

    this.eventEmitter.emit(methodNode.line, EventType.FUNCTION_CALL, { function: `${methodName}`, args });

    let result: any = undefined;
    let handled = false;

    // Direct Javascript Method Execution
    if (!isSet && !isMap && !isString && typeof (objInstance as Record<string, any>)[methodName] === "function") {
      result = (objInstance as Record<string, any>)[methodName](...args);
      handled = true;
    } 
    // Set & Map STL Polyfills
    else if (isSet || isMap) {
      handled = true;
      const targetSet = objInstance as unknown as Set<any>;
      const targetMap = objInstance as unknown as Map<any, any>;

      switch (methodName) {
        case "insert":
          if (isSet) { targetSet.add(args[0]); result = args[0]; }
          else if (isMap && Array.isArray(args[0])) targetMap.set(args[0][0], args[0][1]);
          break;
        case "erase":
        case "remove": result = isSet ? targetSet.delete(args[0]) : targetMap.delete(args[0]); break;
        case "count":
        case "contains":
        case "find": result = isSet ? (targetSet.has(args[0]) ? 1 : 0) : (targetMap.has(args[0]) ? 1 : 0); break;
        case "size":
        case "length": result = isSet ? targetSet.size : targetMap.size; break;
        case "empty": result = isSet ? targetSet.size === 0 : targetMap.size === 0; break;
        case "clear": isSet ? targetSet.clear() : targetMap.clear(); break;
        default: handled = false;
      }
    }
    // String STL Polyfills
    else if (isString) {
      handled = true;
      const s = objInstance as string;
      switch (methodName) {
        case "substr": {
          const start = (args[0] as number) ?? 0;
          const len = args[1] as number;
          result = len !== undefined ? s.substring(start, start + len) : s.substring(start);
          break;
        }
        case "size":
        case "length": result = s.length; break;
        case "empty": result = s.length === 0; break;
        case "at":    result = s[args[0] as number] ?? ""; break;
        case "front": result = s[0] ?? ""; break;
        case "back":  result = s[s.length - 1] ?? ""; break;
        case "c_str": result = s; break;
        case "find":  result = s.indexOf(String(args[0] ?? ""), args[1] as number ?? 0); break;
        case "rfind": result = s.lastIndexOf(String(args[0] ?? ""), args[1] as number ?? s.length); break;
        case "compare": result = s === String(args[0] ?? "") ? 0 : s < String(args[0] ?? "") ? -1 : 1; break;
        case "starts_with": result = s.startsWith(String(args[0] ?? "")); break;
        case "ends_with":   result = s.endsWith(String(args[0] ?? "")); break;
        case "contains":    result = s.includes(String(args[0] ?? "")); break;
        case "count":       result = (s.match(new RegExp(String(args[0] ?? ""), "g")) || []).length; break;
        case "to_string":   result = s; break;
        case "begin":       result = 0; break;
        case "end":         result = s.length; break;
        // Note: append/insert/erase/replace return a new string — must update variable via assignment
        // These return the result; the calling code must handle write-back if needed.
        case "append":    result = s + String(args[0] ?? ""); break;
        case "push_back": result = s + String(args[0] ?? ""); break;
        case "insert":    result = s.slice(0, args[0] as number) + String(args[1] ?? "") + s.slice(args[0] as number); break;
        case "erase": {
          const pos = (args[0] as number) ?? 0;
          const n = (args[1] as number) ?? (s.length - pos);
          result = s.slice(0, pos) + s.slice(pos + n);
          break;
        }
        case "replace": {
          const rpos = (args[0] as number) ?? 0;
          const rlen = (args[1] as number) ?? 0;
          result = s.slice(0, rpos) + String(args[2] ?? "") + s.slice(rpos + rlen);
          break;
        }
        case "clear": result = ""; break;
        case "tolower":
        case "lower":  result = s.toLowerCase(); break;
        case "toupper":
        case "upper":  result = s.toUpperCase(); break;
        default: handled = false;
      }
    }
    // Array & Vector STL Polyfills
    else if (targetArray) {
      handled = true;
      switch (methodName) {
        case "size":
        case "length": result = targetArray.length; break;
        case "empty": result = targetArray.length === 0; break;
        case "push_back":
        case "push": targetArray.push(args[0]); result = args[0]; break;
        case "push_front": targetArray.unshift(args[0]); result = args[0]; break;
        case "insert":
          if (args.length === 1) targetArray.push(args[0]);
          else if (args.length === 2 && typeof args[0] === "number") targetArray.splice(args[0], 0, args[1]);
          break;
        case "remove":
        case "erase": {
          const findIdx = (typeof args[0] === "number" && methodName === "erase") ? args[0] : targetArray.indexOf(args[0]);
          if (findIdx !== -1 && findIdx >= 0 && findIdx < targetArray.length) { targetArray.splice(findIdx, 1); result = true; } 
          else result = false;
          break;
        }
        case "pop_back":
        case "pop": result = targetArray.pop(); break;
        case "pop_front": result = targetArray.shift(); break;
        case "front": result = targetArray[0]; break;
        case "back":
        case "top": result = targetArray[targetArray.length - 1]; break;
        case "at": result = targetArray[args[0] as number]; break;
        case "search":
        case "find": result = targetArray.indexOf(args[0]); break;
        case "contains": result = targetArray.includes(args[0]); break;
        case "begin": result = 0; break;
        case "end": result = targetArray.length; break;
        case "clear":
          if (isPlainArray) (objInstance as any[]).length = 0;
          else (objInstance as Record<string, any>).data = [];
          break;
        case "print": result = `[${targetArray.join(" -> ")}]`; console.log(result); break;
        default: handled = false;
      }
    }

    if (!handled) throw new Error(`Linker Error: Method '${methodName}' is not defined on this object structure.`);
    this.eventEmitter.emit(methodNode.line, EventType.FUNCTION_RETURN, { function: `${methodName}`, returnValue: result });
    return result;
  }

  /**
   * Pushes a new execution frame onto the call stack and executes the targeted function block.
   */
  private invokeFunction(target: string | any, args: CppValue[], rawArgs?: IRExpression[], callerEvaluator?: ExpressionEvaluator): CppValue {
    const isLambda = typeof target === "object" && target.kind === "LambdaExpression";
    const name = isLambda ? "<lambda>" : target;
    const func = isLambda ? target : this.functions.get(name);
    
    // ─── CONSTRUCTOR AUTO-RECOVERY ──────────────────────────────────────────
    if (!func) {
      if (args.length === 1 && typeof args[0] === "number") return new Array(args[0]).fill(0);
      if (args.length === 2 && typeof args[0] === "number") return new Array(args[0]).fill(args[1]);
      
      throw new Error(`Linker Error: Undefined reference to function '${name}'.`);
    }

    if (args.length > func.parameters.length) {
      throw new Error(`Parameter Mismatch: Function '${name}' expects ${func.parameters.length} arguments, but received ${args.length}.`);
    }

    const callerScope = this.callStack.isEmpty() ? null : this.callStack.peek().scopeManager;
    const frame = this.callStack.push(name);
    this.eventEmitter.emit(func.line, EventType.FUNCTION_CALL, { function: name, args });

    // ─── INJECT GLOBAL VARIABLES ──────────────────────────────────────────
    // Global variables must be accessible from every function's scope.
    // Define them in the base scope of each new frame before parameters.
    for (const [gName, gData] of this.globalVariables) {
      try { frame.scopeManager.defineVariable(gName, gData.type, gData.value); } catch { /* already defined */ }
    }

    // Process arguments: handle pass-by-reference and default parameters
    func.parameters.forEach((param: any, index: number) => {
      let paramType = param.type as CppType;
      if (paramType.includes("[]") || paramType.includes("*")) paramType = "array" as any; 
      
      let argValue = index < args.length ? args[index] : undefined;

      // Feature 1: Pass-by-Reference
      // If parameter is a reference, and we received a raw identifier, pass a special __ref object
      if (param.isReference && rawArgs && index < rawArgs.length && rawArgs[index].kind === "Identifier") {
        argValue = { __ref: (rawArgs[index] as any).name, __callerScope: callerScope };
      } 
      // Feature 5: Default Function Parameters
      // Evaluate default value if argument is missing
      else if (argValue === undefined && param.defaultValue && callerEvaluator) {
        argValue = callerEvaluator.evaluate(param.defaultValue);
      }

      frame.scopeManager.defineVariable(param.name, paramType, argValue);
    });

    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.eventEmitter);
    this.attachEvaluationInterceptor(evaluator);
    // ────────────────────────────────────────────────────────────────────────

    const executor = new StatementExecutor(frame.scopeManager, evaluator, this.eventEmitter);
    const walker = new IRWalker(frame.scopeManager, evaluator, executor, this.eventEmitter);

    let returnValue: CppValue = undefined;
    try { 
      walker.walkBlock(func.body); 
    } catch (e) { 
      if (e instanceof ReturnSignal) returnValue = e.value; 
      else throw e; 
    } finally {
      this.eventEmitter.emit(func.line, EventType.FUNCTION_RETURN, { function: name, returnValue });
      this.callStack.pop();
    }
    
    return returnValue;
  }

  private attachEvaluationInterceptor(evaluator: ExpressionEvaluator) {
    const originalEvaluate = evaluator.evaluate.bind(evaluator);
    
    evaluator.evaluate = (expr) => {
      if (expr.kind === "FunctionCall") return this.invokeFunctionCall(expr as IRFunctionCall, evaluator);
      if (expr.kind === "MethodCall") return this.invokeMethodCall(expr as IRMethodCall, evaluator);
      
      if (expr.kind === "UnaryExpression" && (expr as any).operator === "*") {
        return evaluator.evaluate((expr as any).argument);
      }

      if (expr.kind === "NewExpression") {
        const newExpr = expr as IRNewExpression;
        const evaluatedArgs = newExpr.arguments.map(arg => evaluator.evaluate(arg));

        if (newExpr.typeName.includes("[")) {
          const size = evaluatedArgs[0] as number;
          return typeof size === "number" ? new Array(size).fill(0) : [];
        }
        
        if (this.classBlueprints && this.classBlueprints.has(newExpr.typeName)) {
           const blueprint = this.classBlueprints.get(newExpr.typeName)!;
           const instance: Record<string, any> = {};
           for (const field of blueprint.fields) {
             instance[field.name] = field.defaultValue ? evaluator.evaluate(field.defaultValue) : 0;
           }
           for (let i = 0; i < evaluatedArgs.length && i < blueprint.fields.length; i++) {
             instance[blueprint.fields[i].name] = evaluatedArgs[i];
           }
           return instance;
        }
        
        const newObj: Record<string, any> = {};
        if (evaluatedArgs.length > 0) {
          newObj.val = evaluatedArgs[0];
          newObj.value = evaluatedArgs[0];
          newObj.data = evaluatedArgs[0];
          newObj.next = null;
          newObj.left = null;
          newObj.right = null;
        }
        if (evaluatedArgs.length > 1) { 
          newObj.next = evaluatedArgs[1]; 
          newObj.left = evaluatedArgs[1]; 
        }
        if (evaluatedArgs.length > 2) { 
          newObj.right = evaluatedArgs[2]; 
        }
        return newObj;
      }
      
      if (expr.kind === "LambdaExpression") {
        const lambdaExpr = expr as IRLambdaExpression;
        const definitionScope = this.callStack.peek().scopeManager;
        
        return (...args: any[]) => {
          const lambdaFrame = this.callStack.push("lambda");
          
          const capturedState = definitionScope.captureState();
          for (const [vName, vSymbol] of Object.entries(capturedState)) {
             lambdaFrame.scopeManager.defineVariable(vName, (vSymbol as any).type || "auto", (vSymbol as any).value);
          }
          
          lambdaExpr.parameters.forEach((param, index) => {
            lambdaFrame.scopeManager.defineVariable(param.name, param.type, args[index]);
          });
          const localEvaluator = new ExpressionEvaluator(lambdaFrame.scopeManager, this.eventEmitter);
          this.attachEvaluationInterceptor(localEvaluator);
          const localExecutor = new StatementExecutor(lambdaFrame.scopeManager, localEvaluator, this.eventEmitter);
          const localWalker = new IRWalker(lambdaFrame.scopeManager, localEvaluator, localExecutor, this.eventEmitter);
          
          let retVal: any = undefined;
          try { localWalker.walkBlock(lambdaExpr.body); } 
          catch (e) { if (e instanceof ReturnSignal) retVal = e.value; else throw e; } 
          finally { this.callStack.pop(); }
          
          return retVal;
        };
      }
      
      if (expr.kind === "Identifier") {
        if ((expr as any).name === "endl") return "\n";
        if ((expr as any).name === "nullptr" || (expr as any).name === "NULL") return null;
      }
      
      return originalEvaluate(expr);
    };
  }
}