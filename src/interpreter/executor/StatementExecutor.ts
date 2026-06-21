import type {
  IRVariableDeclaration, 
  IRAssignment, 
  IRExpressionStatement, 
  IRCoutStatement, 
  IRReturnStatement,
  IRIdentifier,
  IRSubscriptExpression,
  IRMemberExpression,
  IRStructDeclaration,
  IRExpression
} from "../ir/IRNode";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { EventType } from "../types";
import type { CppValue } from "../types";
import { ReturnSignal } from "../utils/helpers";

/**
 * The `StatementExecutor` is the mutation engine of the interpreter.
 * It is responsible for enacting concrete state changes: allocating variables,
 * writing to memory, executing system streams (cout), and triggering return signals.
 */
export class StatementExecutor {
  constructor(
    private scopeManager: ScopeManager,
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
    private classBlueprints?: Map<string, IRStructDeclaration>
  ) {}

  /**
   * Allocates a new variable in the current lexical scope.
   * Handles three initialization strategies in priority order:
   * 1. Explicit assignment initializer (e.g., `int x = 5`)
   * 2. Constructor-call args (e.g., `vector<int> v(n, 0)`)
   * 3. Default initialization by type
   */
  public executeVariableDeclaration(node: IRVariableDeclaration): void {
    let value: CppValue | undefined = undefined;
    const typeLower = node.variableType.toLowerCase();

    // ── PRIORITY 1: Explicit assignment initializer (e.g., int x = 5; or int x = {1,2,3};)
    if (node.initializer) {
      try {
        value = this.evaluator.evaluate(node.initializer);
      } catch (e) {
        console.warn(`[Executor] Failed to evaluate initializer for '${node.name}': ${(e as Error).message}`);
      }
    }

    // ── PRIORITY 2: Constructor-call args (e.g., vector<int> v(n) or vector<int> v(n, 0))
    if (value === undefined && node.constructorArgs && node.constructorArgs.length > 0) {
      try {
        const arg0 = this.evaluator.evaluate(node.constructorArgs[0]);
        const arg1 = node.constructorArgs.length > 1
          ? this.evaluator.evaluate(node.constructorArgs[1])
          : undefined;
        const size = typeof arg0 === "number" && arg0 >= 0 && arg0 < 1_000_000 ? arg0 : -1;

        // string s(n, 'c') → repeat character n times
        if (typeLower.includes("string") && size >= 0 && arg1 !== undefined) {
          value = String(arg1).repeat(size);
        }
        // vector<T> v(n) or v(n, val) → pre-sized container
        else if (
          typeLower.includes("vector") || typeLower.includes("list") ||
          typeLower.includes("array") || typeLower.includes("deque") ||
          typeLower.includes("stack") || typeLower.includes("queue") ||
          typeLower.includes("priority_queue")
        ) {
          if (size >= 0) {
            // If fill value is undefined (only 1 arg), default inner elements to 0
            // (for nested vectors like adj_list, elements start as 0 but are auto-upgraded
            // to arrays by the invokeMethodCall auto-recovery on first push_back)
            const fillVal = arg1 !== undefined ? arg1 : 0;
            value = this.createMockContainer(new Array(size).fill(fillVal));
          } else {
            value = this.createMockContainer([]);
          }
        }
        // pair<T,U> p(a, b) → [a, b] tuple
        else if (typeLower.includes("pair")) {
          value = [arg0, arg1 !== undefined ? arg1 : 0];
        }
        // Scalar types: int x(5) → 5
        else {
          value = arg0;
        }
      } catch (e) {
        console.warn(`[Executor] Failed to evaluate constructor args for '${node.name}': ${(e as Error).message}`);
      }
    }

    // ── PRIORITY 3: Initializer list handling (nested arrays)
    // If value is an array (from an InitializerList), recursively wrap nested arrays in MockContainers
    // if the underlying type is a vector/list/etc.
    if (value && Array.isArray(value)) {
      const isContainer = typeLower.includes("vector") || typeLower.includes("list") || 
                          typeLower.includes("array") || typeLower.includes("deque") || 
                          typeLower.includes("stack") || typeLower.includes("queue");
      if (isContainer) {
        // Deep wrap function
        const wrapContainer = (arr: any[]): Record<string, any> => {
           for (let i = 0; i < arr.length; i++) {
             if (Array.isArray(arr[i])) arr[i] = wrapContainer(arr[i]);
           }
           return this.createMockContainer(arr);
        };
        value = wrapContainer(value);
      }
    }

    // ── PRIORITY 3: Default initialization by type (no initializer, no constructor args)
    if (value === undefined) {
      // ─── CUSTOM STRUCT/CLASS BLUEPRINT INITIALIZATION ───────────────────────
      if (this.classBlueprints && this.classBlueprints.has(node.variableType)) {
        value = this.instantiateStruct(node.variableType, node.constructorArgs || []);
      }
      // ─── STL CONTAINER POLYMORPHISM ──────────────────────────────────────────
      else if (typeLower.includes("vector") || typeLower.includes("list") || 
          typeLower.includes("array") || typeLower.includes("deque") || 
          typeLower.includes("stack") || typeLower.includes("queue") ||
          typeLower.includes("priority_queue")) {
        value = this.createMockContainer([]);
      } else if (typeLower.includes("unordered_set") || typeLower.includes("set")) {
        value = new Set();
      } else if (typeLower.includes("unordered_map") || typeLower.includes("map")) {
        value = new Map();
      } else if (typeLower.includes("string")) {
        value = "";
      } else if (typeLower.includes("bool")) {
        value = false;
      } else if (
        typeLower.includes("int") || typeLower.includes("long") ||
        typeLower.includes("short") || typeLower.includes("double") ||
        typeLower.includes("float") || typeLower.includes("char") ||
        typeLower === "auto"
      ) {
        value = 0;
      }
    }

    this.scopeManager.defineVariable(node.name, node.variableType, value);
    this.eventEmitter.emit(node.line, EventType.DECLARE, {
      variable: node.name,
      type: node.variableType,
      value,
    });
  }

  /**
   * Instantiates a custom struct/class from a blueprint, applying constructor args and default values.
   */
  private instantiateStruct(typeName: string, constructorArgs: IRExpression[]): Record<string, any> {
    const blueprint = this.classBlueprints!.get(typeName)!;
    const instance: Record<string, any> = {};

    // First apply default values
    for (const field of blueprint.fields) {
      if (field.defaultValue) {
        instance[field.name] = this.evaluator.evaluate(field.defaultValue);
      } else {
        instance[field.name] = 0; // standard fallback
      }
    }

    // Then overwrite with explicit constructor arguments
    for (let i = 0; i < constructorArgs.length && i < blueprint.fields.length; i++) {
       instance[blueprint.fields[i].name] = this.evaluator.evaluate(constructorArgs[i]);
    }

    return instance;
  }

  /**
   * Factory for the universal mock STL container object.
   * Produces a container with `.data` pre-populated with the given elements.
   * Used for vectors, stacks, queues, deques, and lists.
   */
  private createMockContainer(initialData: any[]): Record<string, any> {
    return {
      data: initialData,

      // Insertion
      insert(val: any) { this.data.push(val); return val; },
      push_back(val: any) { this.data.push(val); },
      push(val: any) { this.data.push(val); },
      push_front(val: any) { this.data.unshift(val); },

      // Deletion
      remove(val: any) {
        const idx = this.data.indexOf(val);
        if (idx !== -1) { this.data.splice(idx, 1); return true; }
        return false;
      },
      erase(val: any) {
        if (typeof val === "number" && val >= 0 && val < this.data.length) {
          this.data.splice(val, 1);
        } else {
          const idx = this.data.indexOf(val);
          if (idx !== -1) this.data.splice(idx, 1);
        }
      },
      pop_back() { return this.data.pop(); },
      pop() { return this.data.pop(); },
      pop_front() { return this.data.shift(); },

      // Query
      search(val: any) { return this.data.indexOf(val); },
      find(val: any) { return this.data.indexOf(val); },
      contains(val: any) { return this.data.includes(val); },

      // Accessors
      front() { return this.data.length > 0 ? this.data[0] : undefined; },
      back() { return this.data.length > 0 ? this.data[this.data.length - 1] : undefined; },
      top() { return this.data.length > 0 ? this.data[this.data.length - 1] : undefined; },
      at(index: number) {
        if (index >= 0 && index < this.data.length) return this.data[index];
        throw new Error(`Memory Access Violation: Index ${index} is out of bounds.`);
      },

      // Utilities
      print() { return `[${this.data.join(" -> ")}]`; },
      size() { return this.data.length; },
      length() { return this.data.length; },
      empty() { return this.data.length === 0; },
      clear() { this.data = []; },
    };
  }

  /**
   * Evaluates an assignment target and mutates the corresponding memory location.
   * Supports compound operators (+=, -=, *=, /=, %=, &=, |=, ^=, <<=, >>=).
   */
  public executeAssignment(stmt: IRAssignment): void {
    const newValue = this.evaluator.evaluate(stmt.value);

    // CASE 1: Standard variable assignment (e.g., x = 5 or x += 5)
    if (stmt.target.kind === "Identifier") {
      const targetNode = stmt.target as IRIdentifier;
      const varName = targetNode.name;
      
      let targetVarName = varName;
      let targetScopeManager = this.scopeManager;

      try {
        const symbol = this.scopeManager.getVariable(varName);
        if (symbol.value && typeof symbol.value === "object" && "__ref" in symbol.value) {
          targetVarName = symbol.value.__ref;
          targetScopeManager = symbol.value.__callerScope as any;
        }
      } catch (e) { /* ignore */ }
      
      let resolvedValue: CppValue;
      try {
        let existing = targetScopeManager.getVariable(targetVarName).value;
        resolvedValue = stmt.operator === "=" ? newValue : this.computeCompoundValue(stmt.operator, existing, newValue);
        targetScopeManager.assignVariable(targetVarName, resolvedValue);
      } catch (e) {
        // Auto-recovery: If the AST missed the declaration, define it gracefully
        resolvedValue = newValue;
        targetScopeManager.defineVariable(targetVarName, "auto", resolvedValue);
      }
      
      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: varName, // visually report the local name
        value: resolvedValue
      });
    } 
    // CASE 2: Subscript mutation (e.g., arr[i] = 5 or visited[start] = true)
    else if (stmt.target.kind === "SubscriptExpression") {
      const targetNode = stmt.target as IRSubscriptExpression;
      const index = this.evaluator.evaluate(targetNode.index) as string | number;
      
      let targetObj: any = null;
      let arrayName = "container";

      if (targetNode.object.kind === "Identifier") {
        arrayName = (targetNode.object as IRIdentifier).name;
        try {
          const symbol = this.scopeManager.getVariable(arrayName);
          targetObj = symbol.value;
        } catch (e) {
          targetObj = new Map(); 
          this.scopeManager.defineVariable(arrayName, "auto", targetObj);
        }
      } else {
        targetObj = this.evaluator.evaluate(targetNode.object);
      }

      if (!targetObj) throw new Error(`Memory Access Violation at line ${stmt.line}: Cannot assign to subscript of undefined reference.`);

      // For compound operators on subscripts, read the existing value first
      let existingValue: any = undefined;
      if (stmt.operator !== "=") {
        if (targetObj instanceof Map) existingValue = targetObj.get(index);
        else if (Array.isArray(targetObj)) existingValue = targetObj[index as number];
        else if (typeof targetObj === 'object' && 'data' in targetObj && Array.isArray(targetObj.data)) existingValue = targetObj.data[index as number];
        else existingValue = targetObj[index];
      }

      const finalValue = stmt.operator === "=" 
        ? newValue 
        : this.computeCompoundValue(stmt.operator, existingValue ?? 0, newValue);

      if (targetObj instanceof Map) {
        targetObj.set(index, finalValue);
      } else if (Array.isArray(targetObj)) {
        targetObj[index as number] = finalValue;
      } else if (typeof targetObj === 'object' && 'data' in targetObj && Array.isArray(targetObj.data)) {
        targetObj.data[index as number] = finalValue;
      } else {
        targetObj[index] = finalValue;
      }

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: `${arrayName}[${index}]`,
        value: finalValue
      });
    } 
    // CASE 3: Struct/Object property mutation (e.g., root->left = new TreeNode(2))
    else if (stmt.target.kind === "MemberExpression") {
      const targetNode = stmt.target as IRMemberExpression;
      const targetObj = this.evaluator.evaluate(targetNode.object) as any;
      const property = targetNode.property;
      
      if (!targetObj) throw new Error(`Memory Access Violation at line ${stmt.line}: Cannot assign property '${property}' to an undefined object pointer.`);
      
      const existingValue = stmt.operator !== "=" ? targetObj[property] : undefined;
      const finalValue = stmt.operator === "=" 
        ? newValue 
        : this.computeCompoundValue(stmt.operator, existingValue ?? 0, newValue);
      
      targetObj[property] = finalValue;

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: property,
        value: finalValue
      });
    } 
    else {
      throw new Error(`Syntax Error: Unsupported assignment target kind '${stmt.target.kind}'`);
    }
  }



  /**
   * Applies a compound assignment operator to produce the final value.
   */
  private computeCompoundValue(operator: IRAssignment["operator"], existing: any, incoming: CppValue): CppValue {
    const lhs = Number(existing);
    const rhs = Number(incoming);
    switch (operator) {
      case "+=":  return lhs + rhs;
      case "-=":  return lhs - rhs;
      case "*=":  return lhs * rhs;
      case "/=":  
        if (rhs === 0) throw new Error("Math Exception: Division by zero in compound assignment.");
        return Math.trunc(lhs / rhs);
      case "%=":  return lhs % rhs;
      case "&=":  return lhs & rhs;
      case "|=":  return lhs | rhs;
      case "^=":  return lhs ^ rhs;
      case "<<=": return lhs << rhs;
      case ">>=": return lhs >> rhs;
      default:    return incoming;
    }
  }

  /**
   * Executes a standalone expression that yields no assignment (e.g., `bubbleSort(nums, 5);`).
   */
  public executeExpressionStatement(stmt: IRExpressionStatement): void {
    this.evaluator.evaluate(stmt.expression);
  }

  /**
   * Intercepts C++ stream outputs, evaluates the segments, and emits them to the visualizer.
   */
  public executeCout(stmt: IRCoutStatement): void {
    const outputs = stmt.arguments.map(arg => {
      const val = this.evaluator.evaluate(arg);
      return val === "\n" ? "\n" : String(val ?? "");
    });
    const outputString = outputs.join("");
    
    this.eventEmitter.emit(stmt.line, EventType.WRITE, {
      output: outputString
    });
  }

  /**
   * Triggers an interruption signal to simulate C++ call stack unwinding.
   * @throws {ReturnSignal} Always throws to bubble the return value to the ExecutionEngine.
   */
  public executeReturn(stmt: IRReturnStatement): never {
    const value = stmt.argument ? this.evaluator.evaluate(stmt.argument) : undefined;
    throw new ReturnSignal(value);
  }
}