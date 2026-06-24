import type { 
  IRExpression, 
  IRBinaryExpression, 
  IRUnaryExpression, 
  IRUpdateExpression,
  IRInitializerList,
  IRSubscriptExpression,
  IRTernaryExpression,
  IRIdentifier,
  IRAssignment
} from "../ir/IRNode";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { EventType } from "../types";
import type { CppValue } from "../types";
import { safeLog } from "../utils/helpers";

/**
 * The `ExpressionEvaluator` handles the resolution of abstract syntax trees into concrete runtime values.
 * It recursively processes mathematics, logical operations, memory lookups, and pointer dereferencing.
 */
export class ExpressionEvaluator {
  constructor(
    private scopeManager: ScopeManager,
    private eventEmitter: EventEmitter
  ) {}

  /**
   * Recursively evaluates an Intermediate Representation (IR) expression into a native JavaScript value.
   * @param expr - The IR expression node to evaluate.
   * @returns The resolved JavaScript primitive or object reference.
   */
  public evaluate(expr: IRExpression): CppValue {
    const result = this._evaluateInternal(expr);
    safeLog(`[ExpressionEvaluator] Evaluated Object:`, expr, result);
    return result;
  }

  private _evaluateInternal(expr: IRExpression): CppValue {
    switch (expr.kind) {
      case "Literal":
        return expr.value;

      case "Identifier": {
        // Special sentinel: cout is not a real variable — return a proxy marker object
        if (expr.name === "cout") return { __isCout: true } as unknown as CppValue;
        // C++ nullptr / NULL keyword
        if (expr.name === "nullptr" || expr.name === "NULL") return null;
        // C++ endl manipulator
        if (expr.name === "endl") return "\n";
        // Boolean literals that appear as identifiers
        if (expr.name === "true") return true;
        if (expr.name === "false") return false;

        // ─── C++ GLOBAL CONSTANTS ──────────────────────────────────────────────────
        // Numeric limits from <climits>, <cfloat>, and common macros
        const GLOBAL_CONSTANTS: Record<string, number> = {
          INT_MAX:     2_147_483_647,
          INT_MIN:    -2_147_483_648,
          LONG_MAX:    2_147_483_647,
          LONG_MIN:   -2_147_483_648,
          LLONG_MAX:   Number.MAX_SAFE_INTEGER,   // 9,007,199,254,740,991
          LLONG_MIN:  -Number.MAX_SAFE_INTEGER,
          UINT_MAX:    4_294_967_295,
          ULLONG_MAX:  Number.MAX_SAFE_INTEGER,
          DBL_MAX:     Number.MAX_VALUE,
          DBL_MIN:     Number.MIN_VALUE,
          FLT_MAX:     3.4028235e+38,
          FLT_MIN:     1.17549435e-38,
          M_PI:        Math.PI,
          M_E:         Math.E,
          M_LN2:       Math.LN2,
          M_LOG2E:     Math.LOG2E,
          M_SQRT2:     Math.SQRT2,
          SIZE_MAX:    Number.MAX_SAFE_INTEGER,
          CHAR_MAX:    127,
          CHAR_MIN:    -128,
          UCHAR_MAX:   255,
          SHORT_MAX:   32_767,
          SHORT_MIN:  -32_768,
        };
        if (Object.prototype.hasOwnProperty.call(GLOBAL_CONSTANTS, expr.name)) {
          return GLOBAL_CONSTANTS[expr.name];
        }
        if (expr.name === "INFINITY" || expr.name === "INF" || expr.name === "HUGE_VAL") return Infinity;
        if (expr.name === "NAN" || expr.name === "NaN") return NaN;

        // Standard variable lookup — propagate errors clearly instead of creating phantom variables
        const symbol = this.scopeManager.getVariable(expr.name);
        
        let val = symbol.value;
        // Unwrap pass-by-reference wrapper object
        while (val && typeof val === "object" && "__ref" in val) {
          const callerScope = val.__callerScope as any;
          val = callerScope.getVariable(val.__ref).value;
        }

        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: expr.name,
          value: val
        });
        
        return val;
      }

      case "UnaryExpression":
        return this.evaluateUnary(expr);

      case "BinaryExpression":
        return this.evaluateBinary(expr);

      case "LambdaExpression":
        return expr; // Return the AST node itself so it can be stored as a callable value
        
      case "FunctionCall":
        throw new Error("Execution Context Violation: FunctionCalls must be orchestrated by the ExecutionEngine, not the ExpressionEvaluator.");
        
      case "Assignment": {
        const assignExpr = expr as IRAssignment;
        const targetNode = assignExpr.target;
        const newValue = this.evaluate(assignExpr.value);
        let targetObj: any;
        let index: string | number | null = null;
        let identifierName: string | null = null;
        let targetScopeManager = this.scopeManager;

        if (targetNode.kind === "Identifier") {
          identifierName = (targetNode as IRIdentifier).name;
          let symbol = this.scopeManager.getVariable(identifierName);
          while (symbol.value && typeof symbol.value === "object" && "__ref" in symbol.value) {
            identifierName = symbol.value.__ref;
            targetScopeManager = symbol.value.__callerScope as any;
            symbol = targetScopeManager.getVariable(identifierName!);
          }
        } else if (targetNode.kind === "SubscriptExpression") {
          const subNode = targetNode as IRSubscriptExpression;
          targetObj = this.evaluate(subNode.object);
          index = this.evaluate(subNode.index) as string | number;
          if (targetObj === null || targetObj === undefined) {
             const varName = subNode.object.kind === "Identifier" ? (subNode.object as any).name : "expression";
             throw new Error(`Memory Access Violation at line ${expr.line}: Cannot subscript a null or undefined reference (${varName}).`);
          }
        } else if (targetNode.kind === "MemberExpression") {
          const memNode = targetNode as any;
          targetObj = this.evaluate(memNode.object);
          index = memNode.property;
          
          if (targetObj === null || targetObj === undefined) {
             const varName = memNode.object.kind === "Identifier" ? (memNode.object as any).name : "object";
             throw new Error(`Memory Access Violation at line ${expr.line}: Attempted to write property '${memNode.property}' on a null or undefined object (${varName}).`);
          }
          
          // ── AUTO-RECOVERY FOR STRUCT ARRAYS ──
          if (Array.isArray(targetObj) && index !== null && targetObj[index as keyof typeof targetObj] === undefined) {
             const fieldMap: Record<string, number> = { id: 0, value: 1, left: 2, right: 3, x: 0, y: 1, val: 0, next: 1, first: 0, second: 1 };
             if (index in fieldMap) index = fieldMap[index as string];
          }
        } else {
          throw new Error(`Syntax Error at line ${expr.line}: Invalid assignment target.`);
        }

        // Apply mutation
        if (identifierName) {
          targetScopeManager.assignVariable(identifierName, newValue);
        } else if (targetObj && index !== null) {
          if (targetObj instanceof Map) targetObj.set(index, newValue);
          else if (Array.isArray(targetObj)) targetObj[index as number] = newValue;
          else if (typeof targetObj === 'object' && 'data' in targetObj && Array.isArray(targetObj.data)) targetObj.data[index as number] = newValue;
          else if (targetObj) targetObj[index] = newValue;
        }

        this.eventEmitter.emit(expr.line, EventType.ASSIGNMENT, { 
          target: identifierName || `${index}`, 
          value: newValue 
        });

        return newValue;
      }
      
      case "UpdateExpression":
        return this.evaluateUpdate(expr as IRUpdateExpression);
        
      case "InitializerList":
        return (expr as IRInitializerList).elements.map((e: IRExpression) => this.evaluate(e));

      case "SubscriptExpression": {
        // Resolves memory access for arrays and maps (e.g., arr[i] or map["key"])
        const subExpr = expr as IRSubscriptExpression;
        const targetObj = this.evaluate(subExpr.object) as any;
        const index = this.evaluate(subExpr.index) as string | number;
        
        if (targetObj === null || targetObj === undefined) {
          const varName = subExpr.object.kind === "Identifier" ? (subExpr.object as any).name : "expression";
          throw new Error(`Memory Access Violation at line ${expr.line}: Cannot subscript a null or undefined reference (${varName}).`);
        }
        
        let val: any;
        if (targetObj instanceof Map) {
          val = targetObj.get(index);
        } else if (Array.isArray(targetObj)) {
          val = targetObj[index as number];
        } else if (targetObj && typeof targetObj === 'object' && Array.isArray(targetObj.data)) {
          val = targetObj.data[index as number];
        } else if (targetObj) {
          val = targetObj[index];
        }

        const safeName = subExpr.object.kind === "Identifier" 
          ? (subExpr.object as IRIdentifier).name 
          : "container";
          
        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: `${safeName}[${index}]`,
          value: val
        });
        
        return val;
      }

      case "MemberExpression": {
        const memExpr = expr as any;
        const targetObj = this.evaluate(memExpr.object) as any;
        
        if (targetObj === null || targetObj === undefined) {
          const varName = memExpr.object.kind === "Identifier" ? (memExpr.object as any).name : "object";
          throw new Error(`Memory Access Violation at line ${expr.line}: Attempted to access property '${memExpr.property}' on a null or undefined object (${varName}).`);
        }
        
        let val = targetObj[memExpr.property];

        // ── AUTO-RECOVERY FOR STRUCT ARRAYS ──
        if (val === undefined && Array.isArray(targetObj)) {
           const fieldMap: Record<string, number> = { id: 0, value: 1, left: 2, right: 3, x: 0, y: 1, val: 0, next: 1, first: 0, second: 1 };
           if (memExpr.property in fieldMap) val = targetObj[fieldMap[memExpr.property]];
        }

        const safeName = memExpr.object.kind === "Identifier" 
          ? (memExpr.object as any).name 
          : "object";
          
        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: `${safeName}.${memExpr.property}`,
          value: val
        });
        
        return val;
      }

      case "TernaryExpression": {
        const ternExpr = expr as IRTernaryExpression;
        const condition = this.evaluate(ternExpr.condition);
        return condition ? this.evaluate(ternExpr.consequent) : this.evaluate(ternExpr.alternate);
      }
      
      default:
        throw new Error(`Syntax Parsing Error: Unsupported expression kind encountered - ${(expr as any).kind}`);
    }
  }

  /**
   * Resolves unary operations, including arithmetic negation, logical NOT, and bitwise NOT.
   */
  private evaluateUnary(expr: IRUnaryExpression): CppValue {
    const argValue = this.evaluate(expr.argument);
    
    switch (expr.operator) {
      case "-": return -(argValue as number);
      case "+": return +(argValue as number);
      case "!": return !(argValue as boolean);
      case "~": return ~(argValue as number); // Bitwise NOT
      // Address-of (&) and dereference (*) are no-ops in this duck-typed context:
      // pointers are represented as direct JS references, so no indirection is needed.
      case "&": return argValue;
      case "*": return argValue;
      default:
        throw new Error(`Runtime Exception: Unsupported unary operator: ${expr.operator}`);
    }
  }

  /**
   * Resolves binary operations, including arithmetic, logical short-circuiting, bitwise ops, and C++ streams.
   */
  private evaluateBinary(expr: IRBinaryExpression): CppValue {
    // ─── C++ STREAM OPERATOR INTERCEPTION ───
    if (expr.operator === "<<") {
      const left = this.evaluate(expr.left);
      const right = this.evaluate(expr.right);
      
      // If the left operand is our intercepted 'cout' proxy object
      if (left && typeof left === "object" && (left as any).__isCout) {
        if (right === "\n") {
          console.log(""); 
        } else {
          console.log(`[C++]: ${right}`); 
        }
        // Return the proxy object to permit continuous chaining (e.g., cout << a << b;)
        return { __isCout: true } as unknown as CppValue; 
      }
      
      // Standard Bitwise Left Shift (e.g., 1 << 3)
      return (left as number) << (right as number);
    }

    // ─── LOGICAL SHORT-CIRCUITING ───
    if (expr.operator === "&&") {
      const leftVal = this.evaluate(expr.left);
      if (!leftVal) return false;
      return !!(this.evaluate(expr.right));
    }

    if (expr.operator === "||") {
      const leftVal = this.evaluate(expr.left);
      if (leftVal) return true;
      return !!(this.evaluate(expr.right));
    }

    // ─── STANDARD ARITHMETIC & COMPARISON & BITWISE ───
    const left = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      case "+":
        if (typeof left === "string" || typeof right === "string") {
          return String(left) + String(right);
        }
        return (left as number) + (right as number);
      case "-": return (left as number) - (right as number);
      case "*": return (left as number) * (right as number);
      case "/": 
        if (right === 0) throw new Error("Math Exception: Division by zero is undefined.");
        // Integer division: C++ truncates toward zero for int/int
        return Math.trunc((left as number) / (right as number));
      case "%": return (left as number) % (right as number);
      case "<":  return (left as number) < (right as number);
      case ">":  return (left as number) > (right as number);
      case "<=": return (left as number) <= (right as number);
      case ">=": return (left as number) >= (right as number);
      case "==": return left === right;
      case "!=": return left !== right;
      // ─── BITWISE OPERATORS ───────────────────────────────────────────────────
      case "&":  return (left as number) & (right as number);
      case "|":  return (left as number) | (right as number);
      case "^":  return (left as number) ^ (right as number);
      case ">>": return (left as number) >> (right as number);
      default:
        throw new Error(`Runtime Exception: Unsupported binary operator: ${expr.operator}`);
    }
  }

  /**
   * Resolves in-place mutation operations (Prefix/Postfix Increments and Decrements).
   */
  private evaluateUpdate(node: IRUpdateExpression): CppValue {
    let currentValue: number = 0;
    let targetObject: any = null;
    let targetKey: string | number | null = null;
    let identifierName: string | null = null;

    // Helper to safely extract integer values from deep memory symbols
    const parseNumber = (rawVal: any): number => {
      if (rawVal && typeof rawVal === 'object' && 'value' in rawVal) {
        rawVal = rawVal.value;
      }
      if (typeof rawVal === "number") return rawVal;
      if (rawVal === undefined || rawVal === null) return 0;
      
      const parsed = Number(rawVal);
      return isNaN(parsed) ? 0 : parsed;
    };

    let targetScopeManager = this.scopeManager;

    // 1. Resolve Memory Location and Current Value
    if (node.argument.kind === "Identifier") {
      identifierName = node.argument.name;
      let symbol = this.scopeManager.getVariable(identifierName);
      
      // Unwrap chained pass-by-reference variables
      while (symbol.value && typeof symbol.value === "object" && "__ref" in symbol.value) {
        identifierName = symbol.value.__ref;
        targetScopeManager = symbol.value.__callerScope as any;
        symbol = targetScopeManager.getVariable(identifierName!);
      }

      currentValue = parseNumber(symbol.value);

    } else if (node.argument.kind === "SubscriptExpression") {
      targetObject = this.evaluate(node.argument.object);
      targetKey = this.evaluate(node.argument.index) as string | number;
      
      if (!targetObject || targetKey === null || targetKey === undefined) {
        throw new Error(`Memory Access Violation at line ${node.line}: Invalid subscript update.`);
      }
      
      let rawVal: unknown;
      if (targetObject instanceof Map) {
        rawVal = targetObject.get(targetKey);
      } else if (Array.isArray(targetObject)) {
        rawVal = targetObject[targetKey as number];
      } else if (typeof targetObject === 'object' && Array.isArray(targetObject.data)) {
        rawVal = targetObject.data[targetKey as number];
      } else {
        rawVal = targetObject[targetKey];
      }
      currentValue = parseNumber(rawVal);

    } else if (node.argument.kind === "MemberExpression") {
      targetObject = this.evaluate(node.argument.object);
      targetKey = node.argument.property;
      
      if (!targetObject) throw new Error(`Memory Access Violation at line ${node.line}: Target object is null.`);
      currentValue = parseNumber(targetObject[targetKey as string]);

    } else {
      throw new Error(`Syntax Error at line ${node.line}: Update operators (++ / --) require an l-value reference.`);
    }

    // 2. Compute Mutation
    const newValue = node.operator === "++" ? currentValue + 1 : currentValue - 1;

    // 3. Write Back to Memory Frame
    if (identifierName) {
      targetScopeManager.assignVariable(identifierName, newValue);
    } else if (targetObject && targetKey !== null) {
      if (targetObject instanceof Map) {
        targetObject.set(targetKey, newValue);
      } else if (Array.isArray(targetObject)) {
        targetObject[targetKey as number] = newValue;
      } else if (typeof targetObject === 'object' && Array.isArray(targetObject.data)) {
        targetObject.data[targetKey as number] = newValue;
      } else {
        targetObject[targetKey] = newValue;
      }
    }

    // Emit mutation event for the UI Visualizer
    this.eventEmitter.emit(node.line, EventType.ASSIGNMENT, { 
      target: identifierName || `${targetKey}`, 
      value: newValue 
    });

    // 4. Return correct value based on C++ Prefix (++i) vs Postfix (i++) mechanics
    return node.prefix ? newValue : currentValue;
  }
}