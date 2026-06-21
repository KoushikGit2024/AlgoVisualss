import type { 
  IRBlock, 
  IRIfStatement, 
  IRWhileStatement, 
  IRForStatement, 
  IRNode,
  IRForRangeStatement
} from "../ir/IRNode";
import { BreakSignal, ContinueSignal } from "../utils/helpers";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { StatementExecutor } from "../executor/StatementExecutor";
import { EventType } from "../types";

/**
 * The `IRWalker` orchestrates the traversal and execution of the Intermediate Representation (IR) tree.
 * It routes nodes to the appropriate executors and manages complex control flow structures,
 * including lexical scope bounds, loop execution, and interrupt signals (breaks/continues).
 */
export class IRWalker {
  constructor(
    private scopeManager: ScopeManager,
    private evaluator: ExpressionEvaluator,
    private executor: StatementExecutor,
    private eventEmitter: EventEmitter
  ) {}

  /**
   * Executes a block of statements within a strictly isolated memory frame.
   * Ensures variables declared within the block are garbage collected upon exit,
   * even if execution is interrupted by a `return` or `break` signal.
   */
  public walkBlock(block: IRBlock): void {
    this.scopeManager.enterScope();
    try {
      for (const statement of block.statements) {
        this.walkStatement(statement);
      }
    } finally {
      this.scopeManager.exitScope();
    }
  }

  /**
   * Routes an IR statement node to its designated execution logic.
   */
  public walkStatement(stmt: IRNode): void {
    switch (stmt.kind) {
      case "VariableDeclaration":
        this.executor.executeVariableDeclaration(stmt);
        break;
      case "Assignment":
        this.executor.executeAssignment(stmt);
        break;
      case "ExpressionStatement":
        this.executor.executeExpressionStatement(stmt);
        break;
      case "CoutStatement":
        this.executor.executeCout(stmt);
        break;
      case "ReturnStatement":
        this.executor.executeReturn(stmt);
        break;
      case "BreakStatement":
        // Simulate C++ jump instructions by throwing a catchable interrupt signal
        throw new BreakSignal();
      case "ContinueStatement":
        throw new ContinueSignal();
      case "IfStatement":
        this.walkIfStatement(stmt);
        break;
      case "WhileStatement":
        this.walkWhileStatement(stmt);
        break;
      case "ForStatement":
        this.walkForStatement(stmt);
        break;
      case "ForRangeStatement":
        this.walkForRangeStatement(stmt);
        break;
      case "Block":
        this.walkBlock(stmt);
        break;
      case "EmptyStatement":
        // No-op for semicolons or comments
        break;
      default:
        // Pure expressions are ignored at the statement level
        break;
    }
  }

  private walkIfStatement(stmt: IRIfStatement): void {
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, {
      condition: stmt.condition,
      result: conditionValue
    });

    if (conditionValue) {
      this.walkBlock(stmt.consequent);
    } else if (stmt.alternate) {
      this.walkBlock(stmt.alternate);
    }
  }

  private walkWhileStatement(stmt: IRWhileStatement): void {
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, {});
    
    while (true) {
      const conditionValue = this.evaluator.evaluate(stmt.condition);
      this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
      
      if (!conditionValue) break; 

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, {});
      
      try {
        this.walkBlock(stmt.body);
      } catch (e: any) {
        // Intercept custom jump signals
        if (e instanceof BreakSignal || e.name === "BreakSignal") break;
        if (e instanceof ContinueSignal || e.name === "ContinueSignal") continue;
        throw e; // Bubble up true runtime exceptions and ReturnSignals
      }
    }

    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, {});
  }

  public walkForStatement(node: IRForStatement): void {
    // Isolate loop initializers (e.g., `int i = 0`) to prevent scope pollution
    this.scopeManager.enterScope();

    try {
      if (node.init) {
        this.walkStatement(node.init);
      }

      while (true) {
        if (node.condition) {
          const conditionResult = this.evaluator.evaluate(node.condition);
          if (!conditionResult) break;
        }

        try {
          this.walkBlock(node.body);
        } catch (e: any) {
          if (e instanceof BreakSignal || e.name === "BreakSignal" || e.message === "BreakSignal") {
            break;
          } else if (e instanceof ContinueSignal || e.name === "ContinueSignal" || e.message === "ContinueSignal") {
            // Signal caught; proceed naturally to the update phase
          } else {
            throw e; 
          }
        }

        if (node.update) {
          if (node.update.kind === "Assignment") {
            this.walkStatement(node.update);
          } else {
            this.evaluator.evaluate(node.update);
          }
        }
      }
    } finally {
      this.scopeManager.exitScope();
    }
  }

  public walkForRangeStatement(node: IRForRangeStatement): void {
    // Resolve the collection reference
    const container = this.evaluator.evaluate(node.collection);
    
    // Normalize duck-typed containers to standard JavaScript arrays
    let targetArray = Array.isArray(container) 
      ? container 
      : (container && typeof container === 'object' && 'data' in container ? (container as any).data : null);

    // Gracefully handle uninitialized or empty adjacency lists
    if (!targetArray || !Array.isArray(targetArray)) {
      targetArray = [];
    }

    const varName = node.iteratorName;
    const varType = node.iteratorType || "auto";

    let safetyCounter = 0;

    for (let i = 0; i < targetArray.length; i++) {
      if (safetyCounter++ > 5000) {
        throw new Error(`Runtime Exception at line ${node.line}: Infinite iteration detected in range-based loop.`);
      }

      // Create a micro-scope for this specific iteration to shadow previous iterator values
      this.scopeManager.enterScope();
      this.scopeManager.defineVariable(varName, varType, targetArray[i]);

      try {
        this.walkBlock(node.body);
      } catch (e: any) {
        if (e instanceof BreakSignal || e.name === "BreakSignal") {
          this.scopeManager.exitScope();
          break;
        }
        if (e instanceof ContinueSignal || e.name === "ContinueSignal") {
          this.scopeManager.exitScope();
          continue;
        }
        throw e;
      }

      this.scopeManager.exitScope();
    }
  }
}