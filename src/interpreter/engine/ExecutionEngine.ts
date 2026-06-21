import type { IRProgram, IRFunctionDeclaration, IRFunctionCall, IRMethodCall, IRNewExpression, IRLambdaExpression } from "../ir/IRNode";
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
  private snapshots: RuntimeSnapshot[];

  constructor() {
    this.callStack = new CallStack();
    this.eventEmitter = new EventEmitter();
    this.functions = new Map<string, IRFunctionDeclaration>();
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
  }

  /**
   * Initiates the execution sequence from a specified entry point.
   * @param entryPoint - The designated starting function (defaults to "main").
   * @returns The complete array of chronological memory snapshots.
   */
  public run(entryPoint: string = "main"): RuntimeSnapshot[] {
    this.snapshots = [];
    this.eventEmitter.reset();
    
    if (!this.functions.has(entryPoint)) {
      throw new Error(`Linker Error: Entry point '${entryPoint}' not found in the parsed translation unit.`);
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

    // ─── STANDARD FUNCTION INVOCATION ───────────────────────────────────
    const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
    let targetCallee = callNode.callee;
    try {
      const localFuncRef = currentEvaluator.evaluate({ kind: "Identifier", name: callNode.callee, line: callNode.line });
      if (typeof localFuncRef === "string") targetCallee = localFuncRef; 
    } catch (e) { /* Fallback to global registry */ }

    return this.invokeFunction(targetCallee, args);
  }

  /**
   * Resolves object-oriented method calls (e.g., container.push_back(), str.substr()).
   */
  public invokeMethodCall(methodNode: IRMethodCall, currentEvaluator: ExpressionEvaluator): CppValue {
    let objInstance = currentEvaluator.evaluate(methodNode.object);

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
      switch (methodName) {
        case "substr":
          const start = args[0] as number;
          const length = args[1] as number;
          result = (objInstance as string).substring(start, length ? start + length : undefined);
          break;
        case "size":
        case "length": result = (objInstance as string).length; break;
        case "empty": result = (objInstance as string).length === 0; break;
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
  private invokeFunction(name: string, args: CppValue[]): CppValue {
    const func = this.functions.get(name);
    
    // ─── CONSTRUCTOR AUTO-RECOVERY ──────────────────────────────────────────
    if (!func) {
      if (args.length === 1 && typeof args[0] === "number") return new Array(args[0]).fill(0);
      if (args.length === 2 && typeof args[0] === "number") return new Array(args[0]).fill(args[1]);
      
      throw new Error(`Linker Error: Undefined reference to function '${name}'.`);
    }

    if (args.length !== func.parameters.length) {
      throw new Error(`Parameter Mismatch: Function '${name}' expects ${func.parameters.length} arguments, but received ${args.length}.`);
    }

    const frame = this.callStack.push(name);
    this.eventEmitter.emit(func.line, EventType.FUNCTION_CALL, { function: name, args });

    func.parameters.forEach((param, index) => {
      let paramType = param.type as CppType;
      if (paramType.includes("[]") || paramType.includes("*")) paramType = "array" as any; 
      frame.scopeManager.defineVariable(param.name, paramType, args[index]);
    });

    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.eventEmitter);
    
    // ─── AST EVALUATION INTERCEPTOR ─────────────────────────────────────────
    // Overrides the core evaluator to inject scope-aware resolution for method 
    // calls, pointers, struct instantiation, and lambda functions.
    const originalEvaluate = evaluator.evaluate.bind(evaluator);
    
    evaluator.evaluate = (expr) => {
      if (expr.kind === "FunctionCall") return this.invokeFunctionCall(expr as IRFunctionCall, evaluator);
      if (expr.kind === "MethodCall") return this.invokeMethodCall(expr as IRMethodCall, evaluator);
      
      if (expr.kind === "MemberExpression") {
        const objInstance = evaluator.evaluate((expr as any).object);
        if (!objInstance) throw new Error(`Memory Access Violation at line ${expr.line}: Attempted to access property '${(expr as any).property}' on a null or undefined object.`);
        
        // Pair Auto-Mapper: Translates C++ pair.first/second to JS tuple indices
        if (Array.isArray(objInstance)) {
          if ((expr as any).property === "first") return objInstance[0];
          if ((expr as any).property === "second") return objInstance[1];
        }
        return (objInstance as Record<string, any>)[(expr as any).property];
      }
      
      if (expr.kind === "UnaryExpression" && (expr as any).operator === "*") {
        return evaluator.evaluate((expr as any).argument);
      }

      if (expr.kind === "NewExpression") {
        const newExpr = expr as IRNewExpression;
        const evaluatedArgs = newExpr.arguments.map(arg => evaluator.evaluate(arg));
        if (newExpr.typeName.includes("[")) return [];
        
        // Enforces C++ strict null initialization to prevent undefined property crashes
        const newObj: Record<string, any> = { next: null, left: null, right: null }; 
        if (evaluatedArgs.length > 0) { newObj.val = evaluatedArgs[0]; newObj.value = evaluatedArgs[0]; newObj.data = evaluatedArgs[0]; }
        if (evaluatedArgs.length > 1) { newObj.next = evaluatedArgs[1]; newObj.left = evaluatedArgs[1]; }
        if (evaluatedArgs.length > 2) { newObj.right = evaluatedArgs[2]; }
        return newObj;
      }
      
      if (expr.kind === "LambdaExpression") {
        const lambdaExpr = expr as IRLambdaExpression;
        return (...args: any[]) => {
          const lambdaFrame = this.callStack.push("lambda");
          lambdaExpr.parameters.forEach((param, index) => {
            lambdaFrame.scopeManager.defineVariable(param.name, param.type, args[index]);
          });
          const localEvaluator = new ExpressionEvaluator(lambdaFrame.scopeManager, this.eventEmitter);
          localEvaluator.evaluate = evaluator.evaluate;
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
}