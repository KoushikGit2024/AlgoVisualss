import type {
  IRIdentifier,
  IRAssignment,
  IRSubscriptExpression,
  IRTernaryExpression,
  IRInitializerList,
  IRSizeofExpression,
  IRCommaExpression,
} from "../../ir/IRNode";
import { ScopeManager } from "../../runtime/ScopeManager";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import type { CppValue, EvalResult, CppType } from "../../types";
import { cloneRuntimeValue } from "../../utils/helpers";
import type { ExpressionEvaluator } from "../ExpressionEvaluator";
import { TypeConversion } from "./TypeConversion";

const SIZEOF_TABLE: Array<[string, number]> = [
  ["long long", 8],
  ["long double", 16],
  ["double", 8],
  ["float", 4],
  ["long", 8],
  ["unsigned", 4],
  ["short", 2],
  ["int", 4],
  ["char", 1],
  ["bool", 1],
  ["wchar_t", 4],
  ["nullptr_t", 8],
];

function sizeofType(typeName: string): number {
  const lower = typeName.toLowerCase().trim();
  if (lower.includes("*")) return 8;
  for (const [prefix, size] of SIZEOF_TABLE) {
    if (lower.startsWith(prefix)) return size;
  }
  return 4;
}

export class CoreEvaluator {
  constructor(
    private evaluator: ExpressionEvaluator,
    private scopeManager: ScopeManager,
    private eventEmitter: EventEmitter,
  ) {}

  public evaluateIdentifier(expr: IRIdentifier): CppValue {
    return this.evaluateIdentifierTyped(expr).value;
  }

  public evaluateIdentifierTyped(expr: IRIdentifier): EvalResult {
    if (expr.name === "cout")
      return { type: "unknown", value: { __isCout: true } as unknown as CppValue };
    if (expr.name === "cin")
      throw new Error(`Line ${expr.line}: 'cin' is not supported in this environment.`);
    if (expr.name === "nullptr" || expr.name === "NULL") return { type: "nullptr_t", value: null };
    if (expr.name === "endl") return { type: "char", value: "\n" };
    if (expr.name === "true") return { type: "bool", value: true };
    if (expr.name === "false") return { type: "bool", value: false };

    try {
      const symbol = this.scopeManager.getVariable(expr.name);
      let val = symbol.value;
      const seen = new Set<any>();
      while (val && typeof val === "object" && "__ref" in val) {
        if (seen.has(val)) break;
        seen.add(val);
        const refName = val.__ref as string;
        const targetScope = val.__callerScope;
        val = targetScope.getVariable(refName).value;
      }
      this.eventEmitter.emit(expr.line, EventType.READ, { variable: expr.name, value: val });
      return { type: symbol.type, value: val };
    } catch (originalError) {
      try {
        const thisSym = this.scopeManager.getVariable("this");
        if (
          thisSym &&
          thisSym.value &&
          typeof thisSym.value === "object" &&
          expr.name in thisSym.value
        ) {
          const val = (thisSym.value as any)[expr.name];
          this.eventEmitter.emit(expr.line, EventType.READ, {
            variable: `this->${expr.name}`,
            value: val,
          });
          return { type: "unknown", value: val };
        }
      } catch {}

      const constVal = this.resolveGlobalConstant(expr.name);
      if (constVal !== undefined) return { type: "unknown", value: constVal };
      throw new Error(`Memory Access Violation: Variable '${expr.name}' is not defined.`);
    }
  }

  public evaluateSizeof(expr: IRSizeofExpression): CppValue {
    if (expr.operandType) {
      return sizeofType(expr.operandType);
    }
    if (expr.operandExpr) {
      const operandNode = expr.operandExpr;
      if (operandNode.kind === "Identifier") {
        try {
          const sym = this.scopeManager.getVariable((operandNode as IRIdentifier).name);
          return sizeofType(sym.type);
        } catch {
          return 4;
        }
      }
      return 4;
    }
    return 4;
  }

  public evaluateComma(expr: IRCommaExpression): CppValue {
    return this.evaluateCommaTyped(expr).value;
  }

  public evaluateCommaTyped(expr: IRCommaExpression): EvalResult {
    this.evaluator.evaluateWithType(expr.left);
    return this.evaluator.evaluateWithType(expr.right);
  }

  public evaluateAssignment(expr: IRAssignment): CppValue {
    return this.evaluateAssignmentTyped(expr).value;
  }

  public evaluateAssignmentTyped(expr: IRAssignment): EvalResult {
    const rawRes = this.evaluator.evaluateWithType(expr.value);
    let newValue = cloneRuntimeValue(rawRes.value);



    let targetObj: any = null;
    let index: string | number | null = null;
    let identifierName: string | null = null;
    let targetScopeManager = this.scopeManager;

    if (expr.target.kind === "Identifier") {
      identifierName = (expr.target as IRIdentifier).name;
      try {
        let symbol = this.scopeManager.getVariable(identifierName);
        const seen = new Set<any>();
        while (
          symbol.value &&
          typeof symbol.value === "object" &&
          "__ref" in (symbol.value as any)
        ) {
          if (seen.has(symbol.value)) break;
          seen.add(symbol.value);
          const refName = (symbol.value as any).__ref as string;
          identifierName = refName;
          targetScopeManager = (symbol.value as any).__callerScope;
          symbol = targetScopeManager.getVariable(identifierName);
        }
      } catch (originalError) {
        try {
          const thisSym = this.scopeManager.getVariable("this");
          if (
            thisSym &&
            thisSym.value &&
            typeof thisSym.value === "object" &&
            identifierName in thisSym.value
          ) {
            targetObj = thisSym.value;
            index = identifierName;
            identifierName = null;
          } else {
            throw originalError;
          }
        } catch {
          throw originalError;
        }
      }
    } else if (expr.target.kind === "SubscriptExpression") {
      const subNode = expr.target as IRSubscriptExpression;
      targetObj = this.evaluator.evaluate(subNode.object);
      index = this.evaluator.evaluate(subNode.index) as string | number;
      if (targetObj === null || targetObj === undefined) {
        const vName =
          subNode.object.kind === "Identifier"
            ? (subNode.object as IRIdentifier).name
            : "expression";
        throw new Error(
          `Memory Access Violation at line ${expr.line}: ` +
            `Cannot subscript a null or undefined reference (${vName}).`,
        );
      }
    } else if (expr.target.kind === "MemberExpression") {
      const memNode = expr.target as any;
      targetObj = this.evaluator.evaluate(memNode.object);
      index = memNode.property;

      if (targetObj === null || targetObj === undefined) {
        const vName =
          memNode.object.kind === "Identifier" ? (memNode.object as any).name : "object";
        throw new Error(
          `Memory Access Violation at line ${expr.line}: ` +
            `Attempted to write property '${memNode.property}' on a ` +
            `null or undefined object (${vName}).`,
        );
      }

      if (Array.isArray(targetObj) && typeof index === "string") {
        const fieldMap: Record<string, number> = {
          id: 0,
          value: 1,
          left: 2,
          right: 3,
          x: 0,
          y: 1,
          val: 0,
          next: 1,
          first: 0,
          second: 1,
        };
        if (index in fieldMap) index = fieldMap[index];
      }
    } else {
      throw new Error(
        `Syntax Error at line ${expr.line}: Invalid assignment target kind ` +
          `'${(expr.target as any).kind}'.`,
      );
    }

    let resultType: CppType = rawRes.type;

    if (expr.operator && expr.operator !== "=") {
      let existingValue: any = null;
      if (identifierName) {
        existingValue = targetScopeManager.getVariable(identifierName).value;
      } else if (targetObj !== null && index !== null) {
        if (targetObj instanceof Map) {
          existingValue = targetObj.get(index);
        } else if (Array.isArray(targetObj)) {
          existingValue = targetObj[index as number];
        } else if (
          typeof targetObj === "object" &&
          "data" in targetObj &&
          Array.isArray(targetObj.data)
        ) {
          existingValue = targetObj.data[index as number];
        } else {
          existingValue = targetObj[index];
        }
      }

      if (existingValue === undefined || existingValue === null) {
         existingValue = 0; // fallback for uninitialized values in C++
      }

      const op = expr.operator.slice(0, -1); // e.g. "+=" -> "+"
      switch (op) {
        case "+":
          if (typeof existingValue === "string" || typeof newValue === "string") {
            newValue = String(existingValue) + String(newValue);
            resultType = "string";
          } else {
            newValue = (existingValue as number) + (newValue as number);
          }
          break;
        case "-":
          newValue = (existingValue as number) - (newValue as number);
          break;
        case "*":
          newValue = (existingValue as number) * (newValue as number);
          break;
        case "/":
          newValue = Math.trunc((existingValue as number) / (newValue as number));
          break;
        case "%":
          newValue = (existingValue as number) % (newValue as number);
          break;
        case "&":
          newValue = (existingValue as number) & (newValue as number);
          break;
        case "|":
          newValue = (existingValue as number) | (newValue as number);
          break;
        case "^":
          newValue = (existingValue as number) ^ (newValue as number);
          break;
        case "<<":
          newValue = (existingValue as number) << (newValue as number);
          break;
        case ">>":
          newValue = (existingValue as number) >> (newValue as number);
          break;
      }
    }

    if (identifierName) {
      const symbol = targetScopeManager.getVariable(identifierName);
      const convertedRes = TypeConversion.convert(
        { type: resultType, value: newValue },
        symbol.type,
      );
      newValue = convertedRes.value;
      resultType = convertedRes.type;
      targetScopeManager.assignVariable(identifierName, newValue);
    } else if (targetObj !== null && index !== null) {
      if (targetObj instanceof Map) {
        targetObj.set(index, newValue);
      } else if (Array.isArray(targetObj)) {
        targetObj[index as number] = newValue;
      } else if (
        typeof targetObj === "object" &&
        "data" in targetObj &&
        Array.isArray(targetObj.data)
      ) {
        targetObj.data[index as number] = newValue;
      } else {
        targetObj[index] = newValue;
      }
    }

    this.eventEmitter.emit(expr.line, EventType.ASSIGNMENT, {
      target: identifierName ?? String(index),
      value: newValue,
    });

    return { type: resultType, value: newValue };
  }

  public evaluateSubscript(expr: IRSubscriptExpression): CppValue {
    return this.evaluateSubscriptTyped(expr).value;
  }

  public evaluateSubscriptTyped(expr: IRSubscriptExpression): EvalResult {
    const targetObj = this.evaluator.evaluate(expr.object) as any;
    const index = this.evaluator.evaluate(expr.index) as string | number;

    const indexVariables: string[] = [];
    let currIndexNode = expr.index;
    if (currIndexNode.kind === "Identifier") {
      indexVariables.push((currIndexNode as any).name);
    }

    let currObjNode = expr.object;
    while (currObjNode.kind === "SubscriptExpression") {
      const innerSub = currObjNode as IRSubscriptExpression;
      if (innerSub.index.kind === "Identifier") {
        indexVariables.push((innerSub.index as any).name);
      }
      currObjNode = innerSub.object;
    }

    if (targetObj === null || targetObj === undefined) {
      const vName =
        expr.object.kind === "Identifier" ? (expr.object as IRIdentifier).name : "expression";
      throw new Error(
        `Memory Access Violation at line ${expr.line}: ` +
          `Cannot subscript a null or undefined reference (${vName}).`,
      );
    }

    let val: any;
    if (targetObj instanceof Map) {
      val = targetObj.get(index);
    } else if (Array.isArray(targetObj)) {
      val = targetObj[index as number];
    } else if (
      typeof targetObj === "object" &&
      "data" in targetObj &&
      Array.isArray(targetObj.data)
    ) {
      val = targetObj.data[index as number];
    } else {
      val = targetObj[index];
    }

    const safeName =
      currObjNode.kind === "Identifier" ? (currObjNode as IRIdentifier).name : "container";

    this.eventEmitter.emit(expr.line, EventType.READ, {
      variable: `${safeName}[${index}]`,
      value: val,
      indexVariables: indexVariables.length > 0 ? indexVariables : undefined,
    });

    // Subscript into a string yields a char
    if (expr.object.kind === "Identifier") {
      try {
        const type = this.scopeManager.getVariable((expr.object as IRIdentifier).name).type;
        if (type === "string" || type === "std::string" || type === "char*") {
          return { type: "char", value: val };
        }
      } catch {}
    }

    return { type: "unknown", value: val };
  }

  public evaluateMember(expr: any): CppValue {
    return this.evaluateMemberTyped(expr).value;
  }

  public evaluateMemberTyped(expr: any): EvalResult {
    const targetObj = this.evaluator.evaluate(expr.object) as any;

    if (targetObj === null || targetObj === undefined) {
      const vName = expr.object.kind === "Identifier" ? (expr.object as any).name : "object";
      throw new Error(
        `Memory Access Violation at line ${expr.line}: ` +
          `Attempted to access property '${expr.property}' on a ` +
          `null or undefined object (${vName}).`,
      );
    }

    let val = targetObj[expr.property];

    if (val === undefined && Array.isArray(targetObj)) {
      const fieldMap: Record<string, number> = {
        id: 0,
        value: 1,
        left: 2,
        right: 3,
        x: 0,
        y: 1,
        val: 0,
        next: 1,
        first: 0,
        second: 1,
      };
      if (expr.property in fieldMap) {
        val = targetObj[fieldMap[expr.property as string]];
      }
    }

    const safeName = expr.object.kind === "Identifier" ? (expr.object as any).name : "object";

    this.eventEmitter.emit(expr.line, EventType.READ, {
      variable: `${safeName}.${expr.property}`,
      value: val,
    });

    return { type: "unknown", value: val };
  }

  public evaluateTernary(expr: IRTernaryExpression): CppValue {
    return this.evaluateTernaryTyped(expr).value;
  }

  public evaluateTernaryTyped(expr: IRTernaryExpression): EvalResult {
    return this.evaluator.evaluate(expr.condition)
      ? this.evaluator.evaluateWithType(expr.consequent)
      : this.evaluator.evaluateWithType(expr.alternate);
  }

  public evaluateInitList(expr: IRInitializerList): CppValue {
    return expr.elements.map((e) => this.evaluator.evaluate(e));
  }

  private resolveGlobalConstant(name: string): number | undefined {
    switch (name) {
      case "string::npos":
      case "std::string::npos":
        return -1;
      case "INT_MAX":
        return 2_147_483_647;
      case "INT_MIN":
        return -2_147_483_648;
      case "LONG_MAX":
        return Number.MAX_SAFE_INTEGER;
      case "LONG_MIN":
        return -Number.MAX_SAFE_INTEGER;
      case "LLONG_MAX":
        return Number.MAX_SAFE_INTEGER;
      case "LLONG_MIN":
        return -Number.MAX_SAFE_INTEGER;
      case "UINT_MAX":
        return 4_294_967_295;
      case "ULLONG_MAX":
        return Number.MAX_SAFE_INTEGER;
      case "CHAR_MAX":
        return 127;
      case "CHAR_MIN":
        return -128;
      case "UCHAR_MAX":
        return 255;
      case "SHORT_MAX":
        return 32_767;
      case "SHORT_MIN":
        return -32_768;
      case "SIZE_MAX":
        return Number.MAX_SAFE_INTEGER;
      case "DBL_MAX":
        return Number.MAX_VALUE;
      case "DBL_MIN":
        return Number.MIN_VALUE;
      case "FLT_MAX":
        return 3.4028235e38;
      case "FLT_MIN":
        return 1.17549435e-38;
      case "M_PI":
        return Math.PI;
      case "M_E":
        return Math.E;
      case "M_LN2":
        return Math.LN2;
      case "M_LN10":
        return Math.LN10;
      case "M_LOG2E":
        return Math.LOG2E;
      case "M_LOG10E":
        return Math.LOG10E;
      case "M_SQRT2":
        return Math.SQRT2;
      case "M_SQRT1_2":
        return 1 / Math.SQRT2;
      case "INFINITY":
      case "INF":
      case "HUGE_VAL":
        return Infinity;
      case "NAN":
      case "NaN":
        return NaN;
      default:
        return undefined;
    }
  }

  public evaluateCastTyped(expr: any): EvalResult {
    const innerRes = this.evaluator.evaluateWithType(expr.argument);
    return TypeConversion.convert(innerRes, expr.targetType);
  }
}
