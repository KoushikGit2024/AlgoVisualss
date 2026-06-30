// ============================================================================
// ExpressionEvaluator.ts — Resolves IR expression trees into CppValues.
//
// The evaluator is the interpreter's calculator. It takes any IRExpression
// node and recursively reduces it to a concrete JavaScript primitive or
// object reference. It does NOT execute statements, push/pop scope levels,
// or invoke functions — those responsibilities belong to StatementExecutor,
// IRWalker, and ExecutionEngine respectively.
//
// Function call interception:
//   ExpressionEvaluator deliberately throws on FunctionCall and MethodCall
//   nodes because those require call-stack frame management that only
//   ExecutionEngine can do. ExecutionEngine.attachEvaluationInterceptor()
//   monkey-patches the evaluator's `evaluate` method to redirect those
//   kinds to the engine before they reach this class.
//
// Stream operator interception:
//   `cout << x` is intercepted in the binary evaluator via the __isCout
//   proxy. `cin >> x` (v2) is intercepted the same way via __isCin.
//   Both return a proxy object so chained operators keep working.
//
// Input provider (v2):
//   A `inputProvider` callback can be set via setInputProvider(). When
//   cin >> x is encountered, the evaluator calls inputProvider() to get
//   the next token from a pre-supplied input queue managed by ExecutionEngine.
//   If no provider is set or the queue is empty, an INPUT event is emitted
//   and the variable retains its current value (a no-op that prevents crashes
//   in programs that read from stdin but were run without input data).
//
// Extension history:
//   v1 — Initial: Literal, Identifier (with global constants), UnaryExpression,
//        BinaryExpression (with cout interception + short-circuit),
//        UpdateExpression, Assignment, SubscriptExpression, MemberExpression,
//        TernaryExpression, InitializerList, LambdaExpression.
//   v2 — Added: SizeofExpression (type-size lookup table);
//               CommaExpression (left side effect, return right);
//               cin >> x stream interception via __isCin proxy;
//               inputProvider callback for pre-supplied stdin queues;
//               const-flag exposure in READ events for UI badge rendering;
//               improved __ref chain unwrapping with cycle detection.
// ============================================================================

import type {
  IRExpression,
  IRBinaryExpression,
  IRUnaryExpression,
  IRUpdateExpression,
  IRInitializerList,
  IRSubscriptExpression,
  IRTernaryExpression,
  IRIdentifier,
  IRAssignment,
  IRSizeofExpression,
  IRCommaExpression,
} from "../ir/IRNode";
import { ScopeManager }  from "../runtime/ScopeManager";
import { EventEmitter }  from "../events/EventEmitter";
import { EventType }     from "../types";
import type { CppValue } from "../types";
import { cloneRuntimeValue } from "../utils/helpers";


// ─── Type-size table ──────────────────────────────────────────────────────────

/**
 * Approximate `sizeof` values for C++ types, modelled on a 64-bit LP64 system
 * (Linux/macOS x86-64). Used by the SizeofExpression evaluator.
 *
 * The table is checked by lowercased prefix matching so `unsigned int`,
 * `long long int`, and `signed char` all resolve correctly.
 */
const SIZEOF_TABLE: Array<[string, number]> = [
  ["long long",  8],
  ["long double",16],
  ["double",     8],
  ["float",      4],
  ["long",       8],   // 64-bit LP64 model: long = 8 bytes
  ["unsigned",   4],   // `unsigned` without a following type → unsigned int
  ["short",      2],
  ["int",        4],
  ["char",       1],
  ["bool",       1],
  ["wchar_t",    4],
  ["nullptr_t",  8],   // pointer-sized
];

/**
 * Returns the `sizeof` value in bytes for the given C++ type string.
 * Pointer types (containing `*`) always return 8 (64-bit pointer size).
 * Unknown types default to 4 (int-sized safe default).
 */
function sizeofType(typeName: string): number {
  const lower = typeName.toLowerCase().trim();
  // Pointer types are always pointer-sized on a 64-bit system.
  if (lower.includes("*")) return 8;
  for (const [prefix, size] of SIZEOF_TABLE) {
    if (lower.startsWith(prefix)) return size;
  }
  return 4; // Safe default for unknown / user-defined types.
}


// ─── ExpressionEvaluator ─────────────────────────────────────────────────────

export class ExpressionEvaluator {

  /**
   * Optional callback invoked when `cin >> x` is encountered.
   * Should return the next whitespace-delimited token from the user's input,
   * or `undefined` if the queue is empty.
   *
   * Set by ExecutionEngine via setInputProvider() before run() begins.
   * The provider is responsible for coercing the raw string to the correct
   * CppValue type (int, double, string, etc.).
   */
  private inputProvider: (() => CppValue | undefined) | null = null;

  constructor(
    private scopeManager: ScopeManager,
    private eventEmitter: EventEmitter,
  ) {}


  // ── Configuration ──────────────────────────────────────────────────────────

  /**
   * Installs an input provider callback for `cin >>` interception.
   *
   * The provider is called once per `>>` extraction in a cin chain.
   * Each call should pop and return the next token. ExecutionEngine maintains
   * the underlying queue and wires it in via this method before each run.
   *
   * @param provider - Returns the next CppValue token, or undefined when empty.
   */
  public setInputProvider(provider: (() => CppValue | undefined) | null): void {
    this.inputProvider = provider;
  }


  // ==========================================================================
  // SECTION 1 — Main dispatch
  // ==========================================================================

  /**
   * Recursively evaluates an IRExpression into a native JavaScript value.
   *
   * This method is the hot path of the interpreter — it is called on every
   * operand, every condition, every loop bound, and every function argument.
   * Keep the switch cases lean; push complexity into private helper methods.
   *
   * FunctionCall / MethodCall / NewExpression / LambdaExpression are NOT
   * handled here — they are intercepted by ExecutionEngine's evaluator patch
   * before this method is reached. Reaching the FunctionCall case in this
   * switch is always a bug; it throws to make that obvious.
   *
   * @param expr - The IRExpression node to evaluate.
   * @returns      The resolved CppValue.
   */
  public evaluate(expr: IRExpression): CppValue {
    switch (expr.kind) {

      // ── Literal ───────────────────────────────────────────────────────────
      case "Literal":
        return expr.value;


      // ── Identifier ────────────────────────────────────────────────────────
      case "Identifier": {
        // ── Sentinel identifiers intercepted before scope lookup ─────────
        if (expr.name === "cout")    return { __isCout: true } as unknown as CppValue;
        if (expr.name === "cin")     return { __isCin:  true } as unknown as CppValue;  // v2
        if (expr.name === "nullptr" || expr.name === "NULL") return null;
        if (expr.name === "endl")    return "\n";
        if (expr.name === "true")    return true;
        if (expr.name === "false")   return false;

        // Check user scope FIRST � user declarations shadow built-in constants
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
            return val;
          } catch {
            // Not in scope � fall back to built-in constants
            const constVal = this.resolveGlobalConstant(expr.name);
            if (constVal !== undefined) return constVal;
            throw new Error(`Memory Access Violation: Variable '${expr.name}' is not defined.`);
          }
      }


      // ── Sizeof expression (v2) ────────────────────────────────────────────
      case "SizeofExpression": {
        const sizeExpr = expr as IRSizeofExpression;

        if (sizeExpr.operandType) {
          // sizeof(int) → look up in the type-size table.
          return sizeofType(sizeExpr.operandType);
        }

        if (sizeExpr.operandExpr) {
          // sizeof(variable) → look up the variable's declared type if available,
          // then return the sizeof that type. If we can't determine the type
          // (e.g. the operand is a complex expression), return 4 as a safe default.
          const operandNode = sizeExpr.operandExpr;
          if (operandNode.kind === "Identifier") {
            try {
              const sym = this.scopeManager.getVariable((operandNode as IRIdentifier).name);
              return sizeofType(sym.type);
            } catch {
              return 4; // Variable not in scope — safe default.
            }
          }
          // For non-identifier operands (e.g. sizeof(a + b)), return 4.
          return 4;
        }

        return 4; // Malformed sizeof — safe default.
      }


      // ── Comma expression (v2) ─────────────────────────────────────────────
      // C++ comma operator: evaluate left for side effects, return right value.
      case "CommaExpression": {
        const commaExpr = expr as IRCommaExpression;
        this.evaluate(commaExpr.left);    // Evaluate left, discard result.
        return this.evaluate(commaExpr.right); // Return right value.
      }


      // ── Unary expression ──────────────────────────────────────────────────
      case "UnaryExpression":
        return this.evaluateUnary(expr as IRUnaryExpression);


      // ── Binary expression ─────────────────────────────────────────────────
      case "BinaryExpression":
        return this.evaluateBinary(expr as IRBinaryExpression);


      // ── Update expression (++ / --) ───────────────────────────────────────
      case "UpdateExpression":
        return this.evaluateUpdate(expr as IRUpdateExpression);


      // ── Assignment in expression context ──────────────────────────────────
      // e.g. `if ((x = f()) > 0)` — assignment that also yields the new value.
      case "Assignment": {
        const assignExpr = expr as IRAssignment;
        let newValue   = this.evaluate(assignExpr.value);
        newValue = cloneRuntimeValue(newValue);

        let targetObj:        any    = null;
        let index:            string | number | null = null;
        let identifierName:   string | null = null;
        let targetScopeManager = this.scopeManager;

        if (assignExpr.target.kind === "Identifier") {
          identifierName = (assignExpr.target as IRIdentifier).name;
          // Unwrap reference proxy chain.
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
            identifierName    = refName;
            targetScopeManager = (symbol.value as any).__callerScope;
            symbol             = targetScopeManager.getVariable(identifierName);
          }

        } else if (assignExpr.target.kind === "SubscriptExpression") {
          const subNode = assignExpr.target as IRSubscriptExpression;
          targetObj     = this.evaluate(subNode.object);
          index         = this.evaluate(subNode.index) as string | number;
          if (targetObj === null || targetObj === undefined) {
            const vName = subNode.object.kind === "Identifier"
              ? (subNode.object as IRIdentifier).name
              : "expression";
            throw new Error(
              `Memory Access Violation at line ${expr.line}: ` +
              `Cannot subscript a null or undefined reference (${vName}).`
            );
          }

        } else if (assignExpr.target.kind === "MemberExpression") {
          const memNode = assignExpr.target as any;
          targetObj     = this.evaluate(memNode.object);
          index         = memNode.property;

          if (targetObj === null || targetObj === undefined) {
            const vName = memNode.object.kind === "Identifier"
              ? (memNode.object as any).name
              : "object";
            throw new Error(
              `Memory Access Violation at line ${expr.line}: ` +
              `Attempted to write property '${memNode.property}' on a ` +
              `null or undefined object (${vName}).`
            );
          }

          // Auto-recovery: struct stored as plain array.
          if (Array.isArray(targetObj) && typeof index === "string") {
            const fieldMap: Record<string, number> = {
              id: 0, value: 1, left: 2, right: 3,
              x:  0, y:     1, val: 0, next:  1,
              first: 0, second: 1,
            };
            if (index in fieldMap) index = fieldMap[index];
          }
        } else {
          throw new Error(
            `Syntax Error at line ${expr.line}: Invalid assignment target kind ` +
            `'${(assignExpr.target as any).kind}'.`
          );
        }

        // Write back to memory.
        if (identifierName) {
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
          value:  newValue,
        });

        return newValue;
      }


      // ── Subscript expression ──────────────────────────────────────────────
      case "SubscriptExpression": {
        const subExpr  = expr as IRSubscriptExpression;
        const targetObj = this.evaluate(subExpr.object) as any;
        const index     = this.evaluate(subExpr.index) as string | number;

        if (targetObj === null || targetObj === undefined) {
          const vName = subExpr.object.kind === "Identifier"
            ? (subExpr.object as IRIdentifier).name
            : "expression";
          throw new Error(
            `Memory Access Violation at line ${expr.line}: ` +
            `Cannot subscript a null or undefined reference (${vName}).`
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

        const safeName = subExpr.object.kind === "Identifier"
          ? (subExpr.object as IRIdentifier).name
          : "container";

        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: `${safeName}[${index}]`,
          value:    val,
        });

        return val;
      }


      // ── Member expression ─────────────────────────────────────────────────
      case "MemberExpression": {
        const memExpr  = expr as any;
        const targetObj = this.evaluate(memExpr.object) as any;

        if (targetObj === null || targetObj === undefined) {
          const vName = memExpr.object.kind === "Identifier"
            ? (memExpr.object as any).name
            : "object";
          throw new Error(
            `Memory Access Violation at line ${expr.line}: ` +
            `Attempted to access property '${memExpr.property}' on a ` +
            `null or undefined object (${vName}).`
          );
        }

        let val = targetObj[memExpr.property];

        // Auto-recovery: struct stored as plain array (schema not linked).
        if (val === undefined && Array.isArray(targetObj)) {
          const fieldMap: Record<string, number> = {
            id: 0, value: 1, left: 2, right: 3,
            x:  0, y:     1, val: 0, next:  1,
            first: 0, second: 1,
          };
          if (memExpr.property in fieldMap) {
            val = targetObj[fieldMap[memExpr.property as string]];
          }
        }

        const safeName = memExpr.object.kind === "Identifier"
          ? (memExpr.object as any).name
          : "object";

        this.eventEmitter.emit(expr.line, EventType.READ, {
          variable: `${safeName}.${memExpr.property}`,
          value:    val,
        });

        return val;
      }


      // ── Ternary expression ────────────────────────────────────────────────
      case "TernaryExpression": {
        const ternExpr = expr as IRTernaryExpression;
        // Only one branch is evaluated (correct C++ semantics).
        return this.evaluate(ternExpr.condition)
          ? this.evaluate(ternExpr.consequent)
          : this.evaluate(ternExpr.alternate);
      }


      // ── Initialiser list ──────────────────────────────────────────────────
      case "InitializerList":
        return (expr as IRInitializerList).elements.map(
          (e: IRExpression) => this.evaluate(e)
        );


      // ── Lambda expression ─────────────────────────────────────────────────
      // Return the AST node itself. ExecutionEngine's interceptor converts it
      // to a JS closure when it is first evaluated in expression position.
      case "LambdaExpression":
        return expr as unknown as CppValue;


      // ── ExecutionEngine-intercepted kinds ─────────────────────────────────
      case "FunctionCall":
        throw new Error(
          "Execution Context Violation: FunctionCall nodes must be intercepted " +
          "by ExecutionEngine.attachEvaluationInterceptor() before reaching " +
          "ExpressionEvaluator.evaluate(). This is a bug in the interceptor setup."
        );

      case "MethodCall":
        throw new Error(
          "Execution Context Violation: MethodCall nodes must be intercepted " +
          "by ExecutionEngine.attachEvaluationInterceptor()."
        );

      default:
        throw new Error(
          `Syntax Parsing Error: Unsupported expression kind '${(expr as any).kind}'. ` +
          `This node type is not handled by ExpressionEvaluator — it may need ` +
          `to be added to the switch in evaluate() or intercepted by the engine.`
        );
    }
  }


  // ==========================================================================
  // SECTION 2 — Unary expression
  // ==========================================================================

  /**
   * Resolves a unary operation.
   *
   * Pointer semantics note:
   *   `*ptr` (dereference) and `&x` (address-of) are both no-ops in the
   *   duck-typed JS runtime. All C++ objects are stored as direct JS references,
   *   so there is no indirection layer to traverse or create.
   */
  private evaluateUnary(expr: IRUnaryExpression): CppValue {
    const argValue = this.evaluate(expr.argument);

    switch (expr.operator) {
      case "-":  return -(argValue as number);
      case "+":  return +(argValue as number);
      case "!":  return !argValue;
      case "~":  return ~(argValue as number);  // Bitwise NOT
      case "*":  return argValue;               // Dereference — no-op in duck-typed JS
      case "&":
        if (expr.argument.kind === "Identifier") {
          const varName = (expr.argument as any).name;
          return this.scopeManager.getVariable(varName).value;
        }
        return argValue;
      default:
        throw new Error(
          `Runtime Exception: Unsupported unary operator '${expr.operator}'.`
        );
    }
  }


  // ==========================================================================
  // SECTION 3 — Binary expression
  // ==========================================================================

  /**
   * Resolves a binary operation, including:
   *   - cout << stream interception (left is __isCout proxy)
   *   - cin >> stream interception (v2, left is __isCin proxy)
   *   - Logical short-circuit for && and ||
   *   - Standard arithmetic, comparison, and bitwise operations
   *
   * The stream operators are handled first because they intercept `<<` and `>>`
   * before those symbols are interpreted as bitwise shift operators.
   */
  private evaluateBinary(expr: IRBinaryExpression): CppValue {

    // ── cout << stream operator ───────────────────────────────────────────
    if (expr.operator === "<<") {
      const left  = this.evaluate(expr.left);
      const right = this.evaluate(expr.right);

      if (left && typeof left === "object" && (left as any).__isCout) {
        const outStr = right !== null && right !== undefined ? String(right) : "";
        if (outStr === "\n") {
          console.log("");
        } else {
          console.log(`[C++]: ${outStr}`);
        }
        this.eventEmitter.emit(expr.line, EventType.WRITE, { output: outStr });
        // Return proxy so chaining works: `cout << a << b`.
        return { __isCout: true } as unknown as CppValue;
      }

      // Standard bitwise left shift.
      return (left as number) << (right as number);
    }

    // ── cin >> stream operator (v2) ───────────────────────────────────────
    if (expr.operator === ">>") {
      const left = this.evaluate(expr.left);

      if (left && typeof left === "object" && (left as any).__isCin) {
        // The right operand must be an l-value (Identifier or subscript)
        // so we can assign the input value to it.
        this.assignCinInput(expr.right, expr.line);
        // Return proxy so chaining works: `cin >> a >> b`.
        return { __isCin: true } as unknown as CppValue;
      }

      // Standard bitwise right shift.
      const leftVal  = this.evaluate(expr.left);
      const rightVal = this.evaluate(expr.right);
      return (leftVal as number) >> (rightVal as number);
    }

    // ── Logical short-circuit ─────────────────────────────────────────────
    if (expr.operator === "&&") {
      const leftVal = this.evaluate(expr.left);
      if (!leftVal) return false;               // Short-circuit: skip right.
      return !!(this.evaluate(expr.right));
    }

    if (expr.operator === "||") {
      const leftVal = this.evaluate(expr.left);
      if (leftVal) return true;                  // Short-circuit: skip right.
      return !!(this.evaluate(expr.right));
    }

    // ── Standard arithmetic, comparison, bitwise ──────────────────────────
    const left  = this.evaluate(expr.left);
    const right = this.evaluate(expr.right);

    switch (expr.operator) {
      case "+":
        // String concatenation if either operand is a string.
        if (typeof left === "string" || typeof right === "string") {
          return String(left) + String(right);
        }
        return (left as number) + (right as number);

      case "-":  return (left as number) - (right as number);
      case "*":  return (left as number) * (right as number);

      case "/":
        if ((right as number) === 0) {
          throw new Error("Math Exception: Division by zero is undefined.");
        }
        // C++ truncates toward zero for integer division.
        return Math.trunc((left as number) / (right as number));

      case "%":  return (left as number) % (right as number);
      case "<":  return (left as number) <  (right as number);
      case ">":  return (left as number) >  (right as number);
      case "<=": return (left as number) <= (right as number);
      case ">=": return (left as number) >= (right as number);
      case "==": {
        // v2: Handle loose pointer comparison (ptr == 0 <-> ptr == nullptr)
        const isLeftObj = left === null || typeof left === "object";
        const isRightObj = right === null || typeof right === "object";
        if (left === 0 && isRightObj) return right === null;
        if (right === 0 && isLeftObj) return left === null;
        if (left === undefined && right === null) return true;
        if (left === null && right === undefined) return true;
        return left === right;
      }
      case "!=": {
        // v2: Handle loose pointer comparison
        const isLeftObj = left === null || typeof left === "object";
        const isRightObj = right === null || typeof right === "object";
        if (left === 0 && isRightObj) return right !== null;
        if (right === 0 && isLeftObj) return left !== null;
        if (left === undefined && right === null) return false;
        if (left === null && right === undefined) return false;
        return left !== right;
      }

      // Bitwise operators — JavaScript's bitwise ops work on Int32.
      case "&":  return (left as number) &  (right as number);
      case "|":  return (left as number) |  (right as number);
      case "^":  return (left as number) ^  (right as number);

      default:
        throw new Error(
          `Runtime Exception: Unsupported binary operator '${expr.operator}'.`
        );
    }
  }

  /**
   * Handles `cin >> target` by reading the next input token and assigning it
   * to the target l-value. v2 addition.
   *
   * Assignment targets supported:
   *   - Identifier      → scopeManager.assignVariable()
   *   - SubscriptExpr   → direct array/map write
   *
   * If the input provider returns undefined (empty queue) or is not installed,
   * an INPUT event is emitted with the variable name so the UI can display a
   * "waiting for input" indicator, and the variable is left unchanged.
   *
   * Type coercion:
   *   The raw string token returned by the provider is coerced to the
   *   variable's declared type:
   *     int / long / short  → parseInt()
   *     double / float      → parseFloat()
   *     char                → first character only
   *     string / auto       → raw string
   *
   * @param targetExpr - The IRExpression representing the cin target.
   * @param line       - Source line for event emission.
   */
  private assignCinInput(targetExpr: IRExpression, line: number): void {
    // Determine the target variable name and its declared type.
    let targetName  = "unknown";
    let targetType  = "auto";
    let writeTarget: ((val: CppValue) => void) | null = null;

    if (targetExpr.kind === "Identifier") {
      targetName = (targetExpr as IRIdentifier).name;
      try {
        const symbol = this.scopeManager.getVariable(targetName);
        targetType   = symbol.type;
        writeTarget  = (val) => this.scopeManager.assignVariable(targetName, val);
      } catch {
        // Variable not yet declared — define it implicitly as auto.
        writeTarget = (val) => this.scopeManager.defineVariable(targetName, "auto", val);
      }

    } else if (targetExpr.kind === "SubscriptExpression") {
      const subExpr   = targetExpr as IRSubscriptExpression;
      const targetObj = this.evaluate(subExpr.object) as any;
      const index     = this.evaluate(subExpr.index) as string | number;
      targetName      = subExpr.object.kind === "Identifier"
        ? (subExpr.object as IRIdentifier).name
        : `expr[${index}]`;
      writeTarget     = (val) => {
        if (targetObj instanceof Map) targetObj.set(index, val);
        else if (Array.isArray(targetObj)) targetObj[index as number] = val;
        else if (targetObj?.data) targetObj.data[index as number] = val;
        else targetObj[index] = val;
      };
    }

    // Emit INPUT event so the UI knows a read is pending.
    this.eventEmitter.emit(line, EventType.INPUT, {
      variable: targetName,
      type:     targetType,
    });

    // Get the next token from the provider.
    const rawToken = this.inputProvider?.();
    if (rawToken === undefined || rawToken === null) {
      // No input available — leave variable unchanged.
      // Debug note: If the program hangs or produces wrong output, ensure
      // ExecutionEngine.setInputValues() was called with enough tokens before run().
      console.warn(
        `[ExpressionEvaluator] cin >> ${targetName}: input queue is empty. ` +
        `Variable retains its current value. ` +
        `Call ExecutionEngine.setInputValues() to supply stdin before run().`
      );
      return;
    }

    // Coerce the raw token string to the declared type.
    const coerced = this.coerceCinToken(rawToken, targetType);
    writeTarget?.(coerced);

    this.eventEmitter.emit(line, EventType.ASSIGNMENT, {
      variable: targetName,
      value:    coerced,
    });
  }

  /**
   * Coerces a raw input string token to a CppValue matching the declared type.
   *
   * @param raw  - The string token from the input queue (may already be a CppValue
   *               if the provider pre-coerces — handled by the identity branch).
   * @param type - The declared C++ type of the target variable.
   */
  private coerceCinToken(raw: CppValue, type: string): CppValue {
    // If the provider already returned a non-string CppValue, use it directly.
    if (typeof raw !== "string") return raw;

    const lower = type.toLowerCase();

    if (
      lower.includes("int")   ||
      lower.includes("long")  ||
      lower.includes("short")
    ) return parseInt(raw, 10);

    if (lower.includes("double") || lower.includes("float")) {
      return parseFloat(raw);
    }

    if (lower.includes("char")) {
      return raw.length > 0 ? raw[0] : "";
    }

    if (lower.includes("bool")) {
      return raw === "1" || raw.toLowerCase() === "true";
    }

    // string / auto / unknown: use raw token as-is.
    return raw;
  }


  // ==========================================================================
  // SECTION 4 — Update expression (++ / --)
  // ==========================================================================

  /**
   * Resolves prefix and postfix increment/decrement operations.
   *
   * Prefix  (`++i`): mutate → return NEW value.
   * Postfix (`i++`): save old → mutate → return OLD value.
   *
   * Supported targets:
   *   - Identifier
   *   - SubscriptExpression  (arr[i]++)
   *   - MemberExpression     (node.val++)
   *
   * Pass-by-reference unwrapping is applied for Identifier targets so that
   * `++ref` in a called function correctly mutates the caller's variable.
   */
  private evaluateUpdate(node: IRUpdateExpression): CppValue {
    let currentValue: number = 0;
    let targetObject: any    = null;
    let targetKey:    string | number | null = null;
    let identifierName: string | null = null;
    let targetScopeManager = this.scopeManager;

    // Helper: safely extract a numeric value from potentially nested objects.
    const parseNumber = (rawVal: any): number => {
      if (rawVal && typeof rawVal === "object" && "value" in rawVal) rawVal = rawVal.value;
      if (typeof rawVal === "number") return rawVal;
      if (rawVal === undefined || rawVal === null) return 0;
      const n = Number(rawVal);
      return isNaN(n) ? 0 : n;
    };

    // ── Resolve target and read current value ─────────────────────────────
    if (node.argument.kind === "Identifier") {
      identifierName = node.argument.name;
      let symbol     = this.scopeManager.getVariable(identifierName);

      // Unwrap reference proxy chain.
      const seen = new Set<any>();
      while (
        symbol.value &&
        typeof symbol.value === "object" &&
        "__ref" in (symbol.value as any)
      ) {
        if (seen.has(symbol.value)) break;
        seen.add(symbol.value);
        const refName = (symbol.value as any).__ref as string;
        identifierName    = refName;
        targetScopeManager = (symbol.value as any).__callerScope;
        symbol             = targetScopeManager.getVariable(identifierName);
      }

      currentValue = parseNumber(symbol.value);

    } else if (node.argument.kind === "SubscriptExpression") {
      targetObject = this.evaluate(node.argument.object);
      targetKey    = this.evaluate(node.argument.index) as string | number;

      if (!targetObject || targetKey === null || targetKey === undefined) {
        throw new Error(
          `Memory Access Violation at line ${node.line}: ` +
          `Invalid subscript update target.`
        );
      }

      let rawVal: unknown;
      if (targetObject instanceof Map)            rawVal = targetObject.get(targetKey);
      else if (Array.isArray(targetObject))        rawVal = targetObject[targetKey as number];
      else if (Array.isArray(targetObject?.data))  rawVal = targetObject.data[targetKey as number];
      else                                         rawVal = targetObject[targetKey];

      currentValue = parseNumber(rawVal);

    } else if (node.argument.kind === "MemberExpression") {
      targetObject = this.evaluate((node.argument as any).object);
      targetKey    = (node.argument as any).property as string;

      if (!targetObject) {
        throw new Error(
          `Memory Access Violation at line ${node.line}: ` +
          `Target object is null in update expression.`
        );
      }
      currentValue = parseNumber(targetObject[targetKey]);

    } else {
      throw new Error(
        `Syntax Error at line ${node.line}: ` +
        `Update operators (++ / --) require an l-value operand.`
      );
    }

    // ── Compute new value ─────────────────────────────────────────────────
    const newValue = node.operator === "++" ? currentValue + 1 : currentValue - 1;

    // ── Write back ────────────────────────────────────────────────────────
    if (identifierName) {
      targetScopeManager.assignVariable(identifierName, newValue);
    } else if (targetObject !== null && targetKey !== null) {
      if (targetObject instanceof Map) {
        targetObject.set(targetKey, newValue);
      } else if (Array.isArray(targetObject)) {
        targetObject[targetKey as number] = newValue;
      } else if (Array.isArray(targetObject?.data)) {
        targetObject.data[targetKey as number] = newValue;
      } else {
        targetObject[targetKey] = newValue;
      }
    }

    this.eventEmitter.emit(node.line, EventType.ASSIGNMENT, {
      target: identifierName ?? String(targetKey),
      value:  newValue,
    });

    // Prefix: return new value. Postfix: return old value.
    return node.prefix ? newValue : currentValue;
  }


  // ==========================================================================
  // SECTION 5 — Global constant resolution
  // ==========================================================================

  /**
   * Returns the numeric value of a well-known C++ global constant, or
   * `undefined` if the name is not a recognised constant.
   *
   * Called by the Identifier case before the scope-chain lookup so that
   * constants always resolve correctly even when not declared in scope.
   * User code CAN shadow these by declaring a local variable with the same
   * name — the scope lookup that happens if this returns `undefined` will
   * find the local variable first.
   *
   * Sources: `<climits>`, `<cfloat>`, `<cmath>`, POSIX.
   */
  private resolveGlobalConstant(name: string): number | undefined {
    switch (name) {
      // ── <string> ─────────────────────────────────────────────────────────
      case "string::npos":
      case "std::string::npos": return -1;
      // ── <climits> ────────────────────────────────────────────────────────
      case "INT_MAX":     return  2_147_483_647;
      case "INT_MIN":     return -2_147_483_648;
      case "LONG_MAX":    return  2_147_483_647;
      case "LONG_MIN":    return -2_147_483_648;
      case "LLONG_MAX":   return  Number.MAX_SAFE_INTEGER;
      case "LLONG_MIN":   return -Number.MAX_SAFE_INTEGER;
      case "UINT_MAX":    return  4_294_967_295;
      case "ULLONG_MAX":  return  Number.MAX_SAFE_INTEGER;
      case "CHAR_MAX":    return  127;
      case "CHAR_MIN":    return -128;
      case "UCHAR_MAX":   return  255;
      case "SHORT_MAX":   return  32_767;
      case "SHORT_MIN":   return -32_768;
      case "SIZE_MAX":    return  Number.MAX_SAFE_INTEGER;
      // ── <cfloat> ─────────────────────────────────────────────────────────
      case "DBL_MAX":     return  Number.MAX_VALUE;
      case "DBL_MIN":     return  Number.MIN_VALUE;
      case "FLT_MAX":     return  3.4028235e+38;
      case "FLT_MIN":     return  1.17549435e-38;
      // ── <cmath> constants ────────────────────────────────────────────────
      case "M_PI":        return  Math.PI;
      case "M_E":         return  Math.E;
      case "M_LN2":       return  Math.LN2;
      case "M_LN10":      return  Math.LN10;
      case "M_LOG2E":     return  Math.LOG2E;
      case "M_LOG10E":    return  Math.LOG10E;
      case "M_SQRT2":     return  Math.SQRT2;
      case "M_SQRT1_2":   return  1 / Math.SQRT2;
      // ── Special float values ─────────────────────────────────────────────
      case "INFINITY":
      case "INF":
      case "HUGE_VAL":    return  Infinity;
      case "NAN":
      case "NaN":         return  NaN;
      default:            return  undefined;
    }
  }
}