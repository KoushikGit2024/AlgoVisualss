import type {
  IRFunctionCall,
  IRMethodCall,
  IRNewExpression,
  IRLambdaExpression,
  IRExpression,
  IRFunctionDeclaration,
} from "../../ir/IRNode";
import { ExpressionEvaluator } from "../../evaluator/ExpressionEvaluator";
import { StatementExecutor } from "../../executor/StatementExecutor";
import { IRWalker } from "../../walker/IRWalker";
import { EventType } from "../../types";
import type { CppValue, CppType, StaticStorageKey } from "../../types";
import {
  ReturnSignal,
  BreakpointSignal,
  cloneRuntimeValue,
  makeMockContainer,
} from "../../utils/helpers";
import { handleMathFunction } from "./stdlib/MathFunctions";
import { handleStringMethod } from "./stdlib/StringMethods";
import { handleSetMethod, handleMapMethod, handleArrayMethod } from "./stdlib/ContainerMethods";
import type { EngineContext } from "./EngineContext";
import type { NativeFunctionHandler } from "./NativeFunctionHandler";

export class FunctionInvoker {
  constructor(
    private ctx: EngineContext,
    private nativeHandler: NativeFunctionHandler,
  ) {}

  public invokeFunctionCall(
    callNode: IRFunctionCall,
    currentEvaluator: ExpressionEvaluator,
  ): CppValue {
    const fn = callNode.callee;

    if (!this.ctx.callStack.isEmpty()) {
      const activeScope = this.ctx.callStack.peek().scopeManager;
      try {
        const thisObj = activeScope.getVariable("this")?.value;
        if (thisObj && typeof thisObj === "object" && (thisObj as any).__type) {
          const structDef = this.ctx.classBlueprints.get((thisObj as any).__type);
          if (structDef && structDef.methods && structDef.methods.some((m: any) => m.name === fn)) {
            return this.invokeMethodCall(
              {
                kind: "MethodCall",
                line: callNode.line,
                object: { kind: "Identifier", name: "this", line: callNode.line } as any,
                method: fn,
                arrow: true,
                arguments: callNode.arguments,
              },
              currentEvaluator,
            );
          }
        }
      } catch {}
    }

    if (fn === "swap" && callNode.arguments.length === 2) {
      return this.nativeHandler.nativeSwap(callNode, currentEvaluator);
    }

    if (fn === "__delete") {
      return undefined;
    }

    let localFuncRef: any = undefined;
    try {
      if (!this.ctx.callStack.isEmpty()) {
        const activeScope = this.ctx.callStack.peek().scopeManager;
        const candidate = activeScope.getVariable(fn)?.value;
        if (
          typeof candidate === "function" ||
          typeof candidate === "string" ||
          (candidate &&
            typeof candidate === "object" &&
            "kind" in candidate &&
            (candidate as any).kind === "LambdaExpression")
        ) {
          localFuncRef = candidate;
        }
      }
    } catch {}

    if (localFuncRef || this.ctx.functions.has(fn)) {
      const args = callNode.arguments.map((arg: any) => currentEvaluator.evaluate(arg));
      if (localFuncRef) {
        if (typeof localFuncRef === "function") return localFuncRef(...args);
        if (typeof localFuncRef === "string")
          return this.invokeFunction(localFuncRef, args, callNode.arguments, currentEvaluator);
        if (localFuncRef.kind === "LambdaExpression")
          return this.invokeFunction(localFuncRef, args, callNode.arguments, currentEvaluator);
      }
      return this.invokeFunction(fn, args, callNode.arguments, currentEvaluator);
    }

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

    if (
      fn.startsWith("vector") ||
      fn.startsWith("list") ||
      fn.startsWith("deque") ||
      fn.startsWith("array")
    ) {
      const args = callNode.arguments.map((arg: any) => currentEvaluator.evaluate(arg));
      let size = -1;
      let fill = 0;
      if (args.length >= 1 && typeof args[0] === "number") size = args[0];
      if (args.length >= 2) fill = args[1] as any;
      if (size >= 0) {
        const container = makeMockContainer(new Array(size).fill(fill));
        container.__type = fn;
        container.__isContainer = true;
        return container;
      } else {
        const container = makeMockContainer([]);
        container.__type = fn;
        container.__isContainer = true;
        return container;
      }
    }

    if (["reverse", "max_element", "min_element", "accumulate"].includes(fn)) {
      return this.nativeHandler.nativeContainerAlgorithm(fn, callNode, currentEvaluator);
    }
    if (fn === "sort" || fn === "stable_sort")
      return this.nativeHandler.nativeSort(fn, callNode, currentEvaluator);
    if (fn === "fill" || fn === "fill_n")
      return this.nativeHandler.nativeFill(fn, callNode, currentEvaluator);
    if (fn === "count" || fn === "count_if")
      return this.nativeHandler.nativeCount(fn, callNode, currentEvaluator);
    if (fn === "find") return this.nativeHandler.nativeFind(false, callNode, currentEvaluator);
    if (fn === "find_if") return this.nativeHandler.nativeFind(true, callNode, currentEvaluator);
    if (fn === "all_of")
      return this.nativeHandler.nativeQuantifier("all", callNode, currentEvaluator);
    if (fn === "any_of")
      return this.nativeHandler.nativeQuantifier("any", callNode, currentEvaluator);
    if (fn === "none_of")
      return this.nativeHandler.nativeQuantifier("none", callNode, currentEvaluator);
    if (fn === "for_each") return this.nativeHandler.nativeForEach(callNode, currentEvaluator);
    if (fn === "transform") return this.nativeHandler.nativeTransform(callNode, currentEvaluator);
    if (fn === "remove_if") return this.nativeHandler.nativeRemoveIf(callNode, currentEvaluator);
    if (fn === "iota") return this.nativeHandler.nativeIota(callNode, currentEvaluator);
    if (fn === "rotate") return this.nativeHandler.nativeRotate(callNode, currentEvaluator);
    if (fn === "copy") return this.nativeHandler.nativeCopy(callNode, currentEvaluator);
    if (fn === "partition") return this.nativeHandler.nativePartition(callNode, currentEvaluator);
    if (fn === "unique") return this.nativeHandler.nativeUnique(callNode, currentEvaluator);
    if (fn === "next_permutation" || fn === "prev_permutation")
      return this.nativeHandler.nativePermutation(fn, callNode, currentEvaluator);
    if (fn === "lower_bound" || fn === "upper_bound")
      return this.nativeHandler.nativeBinaryBound(fn, callNode, currentEvaluator);
    if (fn === "binary_search")
      return this.nativeHandler.nativeBinarySearch(callNode, currentEvaluator);

    const evaluatedArgs = callNode.arguments.map((arg: any) => currentEvaluator.evaluate(arg));
    const mathRes = handleMathFunction(fn, evaluatedArgs as number[], callNode.line, this.ctx);
    if (mathRes !== undefined) return mathRes;

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

    if (fn.startsWith("greater"))
      return ((a: number, b: number) => (a > b ? -1 : a < b ? 1 : 0)) as unknown as CppValue;
    if (fn.startsWith("less_equal"))
      return ((a: number, b: number) => (a <= b ? -1 : 1)) as unknown as CppValue;
    if (fn.startsWith("greater_equal"))
      return ((a: number, b: number) => (a >= b ? -1 : 1)) as unknown as CppValue;
    if (fn.startsWith("less"))
      return ((a: number, b: number) => (a < b ? -1 : a > b ? 1 : 0)) as unknown as CppValue;

    if (fn === "make_pair" || fn === "pair") {
      const a0 = currentEvaluator.evaluate(callNode.arguments[0]);
      const a1 =
        callNode.arguments.length > 1 ? currentEvaluator.evaluate(callNode.arguments[1]) : 0;
      return [a0, a1];
    }
    if (fn === "make_tuple") {
      return callNode.arguments.map((a: any) => currentEvaluator.evaluate(a));
    }

    if (fn === "to_string") return String(currentEvaluator.evaluate(callNode.arguments[0]) ?? "");
    if (fn === "stoi" || fn === "stol" || fn === "stoll")
      return parseInt(String(currentEvaluator.evaluate(callNode.arguments[0])), 10);
    if (fn === "stod" || fn === "stof" || fn === "stold")
      return parseFloat(String(currentEvaluator.evaluate(callNode.arguments[0])));
    if (fn === "atoi")
      return parseInt(String(currentEvaluator.evaluate(callNode.arguments[0])), 10);
    if (fn === "atof") return parseFloat(String(currentEvaluator.evaluate(callNode.arguments[0])));

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
    if (Object.prototype.hasOwnProperty.call(charFns, fn)) {
      const c = currentEvaluator.evaluate(callNode.arguments[0]);
      const ch = typeof c === "string" ? c : String.fromCharCode(c as number);
      return charFns[fn](ch);
    }

    if (fn === "printf" || fn === "fprintf") {
      const rawArgs = callNode.arguments.map((a: any) => currentEvaluator.evaluate(a));
      const fmtStr = String(rawArgs[0] ?? "");
      let argIdx = 1;
      const formatted = fmtStr.replace(/%[-+0 #]*\d*(?:\.\d+)?[diouxXeEfgGscpn%lh]/g, (match) =>
        match === "%%" ? "%" : String(rawArgs[argIdx++] ?? ""),
      );
      this.ctx.eventEmitter.emit(callNode.line, EventType.WRITE, { output: formatted });
      return 0;
    }

    if (fn === "assert") {
      const v = currentEvaluator.evaluate(callNode.arguments[0]);
      if (!v)
        throw new Error(`Assertion Failed at line ${callNode.line}: assert() evaluated to false.`);
      return undefined;
    }

    const args = callNode.arguments.map((arg: any) => currentEvaluator.evaluate(arg));
    return this.invokeFunction(fn, args, callNode.arguments, currentEvaluator);
  }

  public invokeMethodCall(
    methodNode: IRMethodCall,
    currentEvaluator: ExpressionEvaluator,
  ): CppValue {
    let objInstance: CppValue;
    try {
      objInstance = currentEvaluator.evaluate(methodNode.object);
    } catch {
      objInstance = undefined as any;
    }

    if (!objInstance) {
      if (methodNode.object.kind === "Identifier") {
        const varName = (methodNode.object as any).name;
        objInstance = [];
        const scope = this.ctx.callStack.peek().scopeManager;
        try {
          scope.assignVariable(varName, objInstance);
        } catch {
          scope.defineVariable(varName, "auto", objInstance);
        }
      } else if (methodNode.object.kind === "SubscriptExpression") {
        const subExpr = methodNode.object as any;
        const parentObj = currentEvaluator.evaluate(subExpr.object);
        const index = currentEvaluator.evaluate(subExpr.index) as string | number;
        if (parentObj) {
          objInstance = [];
          if (parentObj instanceof Map) (parentObj as Map<any, any>).set(index, objInstance);
          else if (Array.isArray(parentObj)) (parentObj as any[])[index as number] = objInstance;
          else if ((parentObj as any)?.data) (parentObj as any).data[index as number] = objInstance;
          else (parentObj as any)[index] = objInstance;
        }
      } else if (methodNode.object.kind === "MemberExpression") {
        const memExpr = methodNode.object as any;
        try {
          const parentObj = currentEvaluator.evaluate(memExpr.object);
          if (parentObj && typeof parentObj === "object") {
            objInstance = [];
            (parentObj as any)[memExpr.property] = objInstance;
          }
        } catch {}
      }
    }

    if (objInstance === undefined || objInstance === null) {
      throw new Error(
        `Memory Access Violation at line ${methodNode.line}: Attempted to call method '${methodNode.method}' on a null reference.`,
      );
    }

    const args = methodNode.arguments.map((arg: any) => currentEvaluator.evaluate(arg));
    const method = methodNode.method;
    const isSet = objInstance instanceof Set;
    const isMap = objInstance instanceof Map;
    const isString = typeof objInstance === "string";
    const isMock =
      !isSet &&
      !isMap &&
      !isString &&
      typeof objInstance === "object" &&
      "data" in (objInstance as any) &&
      Array.isArray((objInstance as any).data);
    const isArr = Array.isArray(objInstance);
    const targetArr = isArr ? (objInstance as any[]) : isMock ? (objInstance as any).data : null;

    this.ctx.eventEmitter.emit(methodNode.line, EventType.FUNCTION_CALL, {
      function: method,
      args,
    });
    let result: any = undefined;
    let handled = false;

    if (isSet) {
      const { handled: h, result: r } = handleSetMethod(method, args, objInstance as Set<any>);
      handled = h;
      result = r;
    } else if (isMap) {
      const { handled: h, result: r } = handleMapMethod(method, args, objInstance as Map<any, any>);
      handled = h;
      result = r;
    } else if (isString) {
      const { handled: h, result: r, newStr } = handleStringMethod(method, args, objInstance as string, this.ctx);
      handled = h;
      result = r;
      if (newStr !== undefined) {
        result = newStr;
        if (methodNode.object.kind === "Identifier") {
          const varName = (methodNode.object as any).name;
          try {
            this.ctx.callStack.peek().scopeManager.assignVariable(varName, newStr);
          } catch {}
        }
      }
    } else if (isMock && typeof (objInstance as any)[method] === "function") {
      result = (objInstance as any)[method](...args);
      handled = true;
    }

    if (
      !handled &&
      objInstance &&
      typeof objInstance === "object" &&
      (objInstance as Record<string, any>).__type
    ) {
      const typeName = (objInstance as Record<string, any>).__type;
      const blueprint = this.ctx.classBlueprints.get(typeName);
      if (blueprint && blueprint.methods) {
        const methodDecl =
          blueprint.methods.find(
            (m: any) => m.name === method && m.parameters.length === args.length,
          ) || blueprint.methods.find((m: any) => m.name === method);
        if (methodDecl) {
          result = this.invokeStructMethod(
            objInstance as Record<string, any>,
            typeName,
            methodDecl,
            args,
          );
          handled = true;
        }
      }
    }

    if (!handled && targetArr !== null) {
      const { handled: h, result: r } = handleArrayMethod(method, args, targetArr, objInstance, isArr);
      handled = h;
      result = r;
    }

    if (!handled && !isSet && !isMap && !isString) {
      const methodFn = (objInstance as Record<string, any>)[method];
      if (typeof methodFn === "function") {
        result = methodFn.call(objInstance, ...args);
        handled = true;
      }
    }

    if (!handled) {
      throw new Error(
        `Linker Error at line ${methodNode.line}: Method '${method}' is not defined on this object type.`,
      );
    }

    this.ctx.eventEmitter.emit(methodNode.line, EventType.FUNCTION_RETURN, {
      function: method,
      returnValue: result,
    });
    return result;
  }

  public invokeFunction(
    target: string | any,
    args: CppValue[],
    rawArgs?: IRExpression[],
    callerEvaluator?: ExpressionEvaluator,
  ): CppValue {
    const isLambda = typeof target === "object" && target?.kind === "LambdaExpression";
    const name = isLambda ? "<lambda>" : (target as string);
    const func = isLambda ? target : this.ctx.functions.get(name);

    const looksLikeType = /^[A-Z]/.test(name);
    if (!func) {
      if (looksLikeType && args.length === 1 && typeof args[0] === "number")
        return new Array(args[0]).fill(0);
      if (looksLikeType && args.length === 2 && typeof args[0] === "number")
        return new Array(args[0]).fill(args[1]);
      throw new Error(`Linker Error: Undefined reference to function '${name}'.`);
    }

    if (args.length > func.parameters.length) {
      throw new Error(
        `Parameter Mismatch: '${name}' expects ${func.parameters.length} argument(s) but received ${args.length}.`,
      );
    }

    const callerScope = this.ctx.callStack.isEmpty()
      ? null
      : this.ctx.callStack.peek().scopeManager;
    const onStaticAssign = (varName: string, value: CppValue) => {
      const sym = frame.scopeManager.getVariable(varName);
      this.ctx.staticStorage.set(`${name}::${varName}` as StaticStorageKey, {
        type: sym.type as CppType,
        value,
      });
    };
    const frame = this.ctx.callStack.push(
      name,
      0,
      this.ctx.globalScopeManager || undefined,
      onStaticAssign,
    );

    this.ctx.eventEmitter.emit(func.line, EventType.FUNCTION_CALL, { function: name, args });

    for (const [key, record] of this.ctx.staticStorage) {
      const [funcName, varName] = (key as string).split("::");
      if (funcName === name) {
        try {
          frame.scopeManager.injectIntoBase(varName, record.type, record.value, false, true);
        } catch {}
      }
    }

    func.parameters.forEach((param: any, index: number) => {
      let paramType = param.type as CppType;
      if (paramType.includes("[]") || paramType.includes("*")) paramType = "array" as any;
      let argValue = index < args.length ? args[index] : undefined;

      if (
        param.isReference &&
        rawArgs &&
        index < rawArgs.length &&
        rawArgs[index].kind === "Identifier"
      ) {
        argValue = { __ref: (rawArgs[index] as any).name, __callerScope: callerScope };
      } else if (argValue === undefined && param.defaultValue && callerEvaluator) {
        argValue = callerEvaluator.evaluate(param.defaultValue);
      }

      if (!param.isReference && argValue !== undefined) {
        argValue = cloneRuntimeValue(argValue);
      }

      frame.scopeManager.defineShadowing(param.name, paramType, argValue);
    });

    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.ctx.eventEmitter);
    evaluator.setInputProvider(this.ctx.provideInput);
    this.attachEvaluationInterceptor(evaluator);

    const executor = new StatementExecutor(
      frame.scopeManager,
      evaluator,
      this.ctx.eventEmitter,
      this.ctx.classBlueprints,
      this.ctx.enumBlueprints,
      this.ctx.typeAliases,
      this.ctx.staticStorage,
      name,
      (typeName: string, args: any[]) =>
        this.instantiateStructAndExecuteConstructor(typeName, args, evaluator),
    );

    const walker = new IRWalker(frame.scopeManager, evaluator, executor, this.ctx.eventEmitter);
    walker.setBreakpoints(this.ctx.breakpoints);

    let returnValue: CppValue = undefined;
    let unwoundByBreakpoint = false;
    try {
      walker.walkBlock(func.body);
    } catch (e: any) {
      if (e instanceof ReturnSignal || e?.name === "ReturnSignal") {
        returnValue = e.value;
      } else if (e instanceof BreakpointSignal || e?.name === "BreakpointSignal") {
        unwoundByBreakpoint = true;
        throw e;
      } else {
        throw e;
      }
    } finally {
      if (!unwoundByBreakpoint) {
        if (name !== "<lambda>" && name !== "__global_init__") {
          const statics = frame.scopeManager.getStaticSymbols();
          for (const [varName, record] of Object.entries(statics)) {
            const key = `${name}::${varName}` as StaticStorageKey;
            this.ctx.staticStorage.set(key, record as any);
          }
        }
        this.ctx.eventEmitter.emit(func.line, EventType.FUNCTION_RETURN, {
          function: name,
          returnValue,
        });
        this.ctx.callStack.pop();
      }
    }

    return returnValue;
  }

  public defaultForFieldType(type: string): CppValue {
    const t = type.toLowerCase();
    if (t.includes("unordered_map") || t.includes("map")) return new Map();
    if (t.includes("unordered_set") || t.includes("set")) return new Set();
    if (
      t.includes("vector") ||
      t.includes("list") ||
      t.includes("deque") ||
      t.includes("stack") ||
      t.includes("queue") ||
      t.includes("priority_queue") ||
      t.includes("array") ||
      t.includes("[]")
    )
      return [];
    if (t === "string" || t === "std::string" || t === "wstring") return "";
    if (t.includes("bool")) return false;
    if (t.includes("*") || t.includes("nullptr")) return null;
    return 0;
  }

  public instantiateStructAndExecuteConstructor(
    typeName: string,
    args: IRExpression[],
    callerEvaluator: ExpressionEvaluator,
  ): Record<string, any> {
    const blueprint = this.ctx.classBlueprints.get(typeName)!;
    const instance: Record<string, any> = { __type: typeName };

    for (const field of blueprint.fields) {
      instance[field.name] = field.defaultValue
        ? callerEvaluator.evaluate(field.defaultValue)
        : this.defaultForFieldType(field.type);
    }

    const evaluatedArgs = args.map((arg) => callerEvaluator.evaluate(arg));

    if (blueprint.constructors && blueprint.constructors.length > 0) {
      const ctor =
        blueprint.constructors.find((c: any) => c.parameters.length === evaluatedArgs.length) ||
        blueprint.constructors[0];
      this.invokeStructMethod(instance, typeName, ctor, evaluatedArgs);
    } else {
      evaluatedArgs.forEach((v, i) => {
        if (i < blueprint.fields.length) instance[blueprint.fields[i].name] = v;
      });
    }

    return instance;
  }

  public invokeStructMethod(
    instance: Record<string, any>,
    typeName: string,
    methodDecl: IRFunctionDeclaration,
    args: CppValue[],
  ): CppValue {
    const staticKeyPrefix = `${typeName}::${methodDecl.name}`;
    const onStaticAssign = (varName: string, value: CppValue) => {
      const sym = frame.scopeManager.getVariable(varName);
      this.ctx.staticStorage.set(`${staticKeyPrefix}::${varName}` as StaticStorageKey, {
        type: sym.type as CppType,
        value,
      });
    };
    const frame = this.ctx.callStack.push(
      `${typeName}::${methodDecl.name}`,
      0,
      this.ctx.globalScopeManager || undefined,
      onStaticAssign,
    );

    frame.scopeManager.defineVariable("this", typeName, instance);

    for (const [key, record] of this.ctx.staticStorage) {
      const keyStr = key as string;
      const prefix = keyStr.split("::").slice(0, -1).join("::");
      const varName = keyStr.split("::").slice(-1)[0];
      if (prefix === staticKeyPrefix) {
        try {
          frame.scopeManager.injectIntoBase(varName, record.type, record.value, false, true);
        } catch {}
      }
    }

    const structScope = {
      getVariable: (name: string) => {
        if (name in instance) return { name, type: "auto", value: instance[name] };
        throw new Error(`Member ${name} not found in ${typeName}`);
      },
      assignVariable: (name: string, value: any) => {
        if (name in instance) instance[name] = value;
        else throw new Error(`Member ${name} not found in ${typeName}`);
      },
    } as any;

    const paramNames = new Set(methodDecl.parameters.map((p: any) => p.name));

    for (const key of Object.keys(instance)) {
      if (key !== "__type" && !paramNames.has(key)) {
        frame.scopeManager.defineVariable(key, "auto", {
          __ref: key,
          __callerScope: structScope,
        });
      }
    }

    methodDecl.parameters.forEach((param: any, index: number) => {
      let paramType = param.type as CppType;
      if (paramType.includes("[]") || paramType.includes("*")) paramType = "array" as any;
      let argValue = index < args.length ? args[index] : undefined;
      if (argValue !== undefined) argValue = cloneRuntimeValue(argValue);
      frame.scopeManager.defineVariable(param.name, paramType, argValue);
    });

    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.ctx.eventEmitter);
    evaluator.setInputProvider(this.ctx.provideInput);
    this.attachEvaluationInterceptor(evaluator);

    const executor = new StatementExecutor(
      frame.scopeManager,
      evaluator,
      this.ctx.eventEmitter,
      this.ctx.classBlueprints,
      this.ctx.enumBlueprints,
      this.ctx.typeAliases,
      this.ctx.staticStorage,
      staticKeyPrefix,
      (tName: string, tArgs: any[]) =>
        this.instantiateStructAndExecuteConstructor(tName, tArgs, evaluator),
    );

    const walker = new IRWalker(frame.scopeManager, evaluator, executor, this.ctx.eventEmitter);
    walker.setBreakpoints(this.ctx.breakpoints);

    let returnValue: CppValue = undefined;
    try {
      walker.walkBlock(methodDecl.body);
    } catch (e: any) {
      if (e instanceof ReturnSignal || e?.name === "ReturnSignal") returnValue = e.value;
      else if (e instanceof BreakpointSignal || e?.name === "BreakpointSignal") throw e;
      else throw e;
    } finally {
      const statics = frame.scopeManager.getStaticSymbols();
      for (const [varName, value] of Object.entries(statics)) {
        this.ctx.staticStorage.set(
          `${staticKeyPrefix}::${varName}` as StaticStorageKey,
          value as any,
        );
      }
      this.ctx.callStack.pop();
    }
    return returnValue;
  }

  public attachEvaluationInterceptor(evaluator: ExpressionEvaluator): void {
    const originalEvaluate = evaluator.evaluate.bind(evaluator);

    evaluator.evaluate = (expr: any): CppValue => {
      if (expr.kind === "FunctionCall")
        return this.invokeFunctionCall(expr as IRFunctionCall, evaluator);
      if (expr.kind === "MethodCall") return this.invokeMethodCall(expr as IRMethodCall, evaluator);
      if (expr.kind === "UnaryExpression" && (expr as any).operator === "*")
        return evaluator.evaluate((expr as any).argument);

      if (expr.kind === "NewExpression") {
        const newExpr = expr as IRNewExpression;
        if (newExpr.typeName.includes("[")) {
          const evaluatedArgs = newExpr.arguments.map((arg: any) => evaluator.evaluate(arg));
          const size = evaluatedArgs[0] as number;
          return typeof size === "number" ? new Array(size).fill(0) : [];
        }
        if (this.ctx.classBlueprints.has(newExpr.typeName)) {
          return this.instantiateStructAndExecuteConstructor(
            newExpr.typeName,
            newExpr.arguments,
            evaluator,
          );
        }
        const evaluatedArgs = newExpr.arguments.map((arg: any) => evaluator.evaluate(arg));
        const newObj: Record<string, any> = {
          val: evaluatedArgs[0] ?? 0,
          value: evaluatedArgs[0] ?? 0,
          data: evaluatedArgs[0] ?? 0,
          next: evaluatedArgs[1] ?? null,
          left: evaluatedArgs[1] ?? null,
          right: evaluatedArgs[2] ?? null,
        };
        return newObj;
      }

      if (expr.kind === "LambdaExpression") {
        const lambdaExpr = expr as IRLambdaExpression;
        if (!(lambdaExpr as any)._id) {
          this.ctx.lambdaCounter = (this.ctx.lambdaCounter || 0) + 1;
          (lambdaExpr as any)._id = `<lambda_${this.ctx.lambdaCounter}>`;
        }
        const lambdaName = (lambdaExpr as any)._id;
        const definitionScope = this.ctx.callStack.peek().scopeManager;
        const captured = definitionScope.captureState();

        return ((...args: any[]) => {
          const lambdaFrame = this.ctx.callStack.push(lambdaName);
          for (const [vName, vSym] of Object.entries(captured)) {
            lambdaFrame.scopeManager.defineVariable(
              vName,
              (vSym as any).type ?? "auto",
              (vSym as any).value,
            );
          }
          lambdaExpr.parameters.forEach((param: any, i: number) => {
            lambdaFrame.scopeManager.defineShadowing(param.name, param.type as CppType, args[i]);
          });

          const localEval = new ExpressionEvaluator(
            lambdaFrame.scopeManager,
            this.ctx.eventEmitter,
          );
          localEval.setInputProvider(this.ctx.provideInput);
          this.attachEvaluationInterceptor(localEval);

          const localExec = new StatementExecutor(
            lambdaFrame.scopeManager,
            localEval,
            this.ctx.eventEmitter,
            this.ctx.classBlueprints,
            this.ctx.enumBlueprints,
            this.ctx.typeAliases,
            this.ctx.staticStorage,
            "<lambda>",
            (typeName: string, args: any[]) =>
              this.instantiateStructAndExecuteConstructor(typeName, args, localEval),
          );
          const localWalker = new IRWalker(
            lambdaFrame.scopeManager,
            localEval,
            localExec,
            this.ctx.eventEmitter,
          );
          localWalker.setBreakpoints(this.ctx.breakpoints);

          let retVal: any = undefined;
          try {
            localWalker.walkBlock(lambdaExpr.body);
          } catch (e: any) {
            if (e instanceof ReturnSignal || e?.name === "ReturnSignal") retVal = e.value;
            else throw e;
          } finally {
            this.ctx.callStack.pop();
          }
          return retVal;
        }) as unknown as CppValue;
      }

      if (expr.kind === "Identifier") {
        if ((expr as any).name === "endl") return "\n";
        if ((expr as any).name === "nullptr" || (expr as any).name === "NULL") return null;
      }

      return originalEvaluate(expr);
    };
  }
}
