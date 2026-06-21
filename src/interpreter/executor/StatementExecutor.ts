import type {
  IRVariableDeclaration, 
  IRAssignment, 
  IRExpressionStatement, 
  IRCoutStatement, 
  IRReturnStatement,
  IRIdentifier,
  IRSubscriptExpression,
  IRMemberExpression // Added for strict typing
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
    private eventEmitter: EventEmitter
  ) {}

  /**
   * Allocates a new variable in the current lexical scope.
   * Dynamically constructs Javascript proxy objects for complex C++ STL containers
   * (e.g., vectors, queues, stacks, maps).
   */
  public executeVariableDeclaration(node: IRVariableDeclaration): void {
    let value: CppValue | undefined = undefined;

    if (node.initializer) {
      value = this.evaluator.evaluate(node.initializer);
    } else {
      const typeLower = node.variableType.toLowerCase();
      
      // ─── STL CONTAINER POLYMORPHISM ──────────────────────────────────────────
      // Instantiates a universal container object that mimics C++ STL methods,
      // mapping them to a standard Javascript array under the hood.
      if (typeLower.includes("vector") || typeLower.includes("list") || 
          typeLower.includes("array") || typeLower.includes("deque") || 
          typeLower.includes("stack") || typeLower.includes("queue")) {
        
        value = {
          data: [] as any[],
          
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
          print() {
            const outputString = `[${this.data.join(" -> ")}]`;
            return outputString; 
          },
          size() { return this.data.length; },
          length() { return this.data.length; },
          empty() { return this.data.length === 0; },
          clear() { this.data = []; }
        };
      } else if (typeLower.includes("set")) {
        value = new Set();
      } else if (typeLower.includes("map")) {
        value = new Map();
      }
    }

    this.scopeManager.defineVariable(node.name, node.variableType, value);
  }

  /**
   * Evaluates an assignment target and mutates the corresponding memory location.
   */
  public executeAssignment(stmt: IRAssignment): void {
    const value = this.evaluator.evaluate(stmt.value);

    // CASE 1: Standard variable assignment (e.g., x = 5)
    if (stmt.target.kind === "Identifier") {
      const targetNode = stmt.target as IRIdentifier;
      const varName = targetNode.name;
      
      // Auto-recovery: If the AST missed the declaration, define it gracefully
      try {
        this.scopeManager.assignVariable(varName, value);
      } catch (e) {
        this.scopeManager.defineVariable(varName, "auto", value);
      }
      
      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: varName,
        value: value
      });
    } 
    // CASE 2: Subscript mutation (e.g., arr[i] = 5 or visited[start] = true)
    else if (stmt.target.kind === "SubscriptExpression") {
      const targetNode = stmt.target as IRSubscriptExpression;
      const index = this.evaluator.evaluate(targetNode.index) as string | number;
      
      let targetObj: any = null;
      let arrayName = "container";

      // Look up the underlying object (e.g., 'visited')
      if (targetNode.object.kind === "Identifier") {
        arrayName = (targetNode.object as IRIdentifier).name;
        
        try {
          const symbol = this.scopeManager.getVariable(arrayName);
          targetObj = symbol.value;
        } catch (e) {
          // UNIVERSAL ASSIGNMENT AUTO-RECOVERY
          // If completely undefined, dynamically construct a Map
          targetObj = new Map(); 
          this.scopeManager.defineVariable(arrayName, "auto", targetObj);
        }
      } else {
        // Fallback for nested 2D arrays (e.g., graph[0][1] = 5)
        targetObj = this.evaluator.evaluate(targetNode.object);
      }

      if (!targetObj) throw new Error(`Memory Access Violation at line ${stmt.line}: Cannot assign to subscript of undefined reference.`);

      // Safely mutate based on underlying JS data structure
      if (targetObj instanceof Map) {
        targetObj.set(index, value);
      } else if (Array.isArray(targetObj)) {
        targetObj[index as number] = value;
      } else if (typeof targetObj === 'object' && 'data' in targetObj && Array.isArray(targetObj.data)) {
        targetObj.data[index as number] = value;
      } else {
        targetObj[index] = value;
      }

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: `${arrayName}[${index}]`,
        value: value
      });
    } 
    // CASE 3: Struct/Object property mutation (e.g., root->left = new TreeNode(2))
    else if (stmt.target.kind === "MemberExpression") {
      const targetNode = stmt.target as IRMemberExpression;
      const targetObj = this.evaluator.evaluate(targetNode.object) as any;
      const property = targetNode.property;
      
      if (!targetObj) throw new Error(`Memory Access Violation at line ${stmt.line}: Cannot assign property '${property}' to an undefined object pointer.`);
      
      targetObj[property] = value;

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: property,
        value: value
      });
    } 
    else {
      throw new Error(`Syntax Error: Unsupported assignment target kind '${stmt.target.kind}'`);
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
    const outputs = stmt.arguments.map(arg => this.evaluator.evaluate(arg));
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