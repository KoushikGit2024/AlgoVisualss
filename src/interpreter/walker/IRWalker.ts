// src/interpreter/walker/IRWalker.ts
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
 * The IRWalker is the heart of our execution engine. 
 * It walks down the Intermediate Representation (IR) tree step-by-step, 
 * routing statements to the executor and handling all the messy control flow 
 * (loops, ifs, breaks, continues).
 */
export class IRWalker {
  constructor(
    private scopeManager: ScopeManager,
    private evaluator: ExpressionEvaluator,
    private executor: StatementExecutor,
    private eventEmitter: EventEmitter
  ) {}

  public walkBlock(block: IRBlock): void {
    // Every time we enter a new { block }, we push a new layer of memory.
    // This ensures variables declared inside the block die when the block ends.
    this.scopeManager.enterScope();
    try {
      for (const statement of block.statements) {
        this.walkStatement(statement);
      }
    } finally {
      // The 'finally' block guarantees we pop the memory scope, 
      // even if a 'return' or 'break' signal violently interrupts the flow.
      this.scopeManager.exitScope();
    }
  }

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
        // We simulate C++ jumps by throwing a custom JS error and catching it higher up.
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
        // Just a comment or a trailing semicolon. Do nothing!
        break;
      default:
        // Ignore unhandled nodes at this level (e.g., pure expressions)
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
      
      if (!conditionValue) break; // Condition failed, exit loop naturally.

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, {});
      
      try {
        this.walkBlock(stmt.body);
      } catch (e) {
        // Catch our custom jump signals!
        if (e instanceof BreakSignal) break;
        if (e instanceof ContinueSignal) continue;
        throw e; // If it's a ReturnSignal (or a real crash), keep bubbling it up.
      }
    }

    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, {});
  }

  private walkForStatement(stmt: IRForStatement): void {
    // The for-loop gets its own outer scope so the initializer (e.g., int i = 0)
    // belongs to the loop, not the parent function.
    this.scopeManager.enterScope();
    try {
      if (stmt.init) {
        this.walkStatement(stmt.init);
      }

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, {});

      while (true) {
        if (stmt.condition) {
          const conditionValue = this.evaluator.evaluate(stmt.condition);
          this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
          if (!conditionValue) break;
        }

        this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, {});
        
        try {
          this.walkBlock(stmt.body);
        } catch (e) {
          if (e instanceof BreakSignal) break;
          if (e instanceof ContinueSignal) {
             // Continue skips the rest of the block, but MUST proceed to the update step!
          } else {
             throw e; 
          }
        }

        // Run the update statement (e.g., i++)
        if (stmt.update) {
          if (stmt.update.kind === "Assignment") {
            this.executor.executeAssignment(stmt.update);
          } else {
            this.evaluator.evaluate(stmt.update);
          }
        }
      }
      this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, {});
    } finally {
      this.scopeManager.exitScope(); // Clean up the 'int i = 0' variable
    }
  }

  private walkForRangeStatement(stmt: IRForRangeStatement): void {
    const collection = this.evaluator.evaluate(stmt.collection) as any[];
    
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, {});

    for (const item of collection) {
      // Create a micro-scope for each iteration to hold the current 'item'
      this.scopeManager.enterScope();
      try {
        // Inject the iterator variable (e.g., 'val' in 'for (int val : arr)') into the active scope
        this.scopeManager.defineVariable(stmt.iteratorName, stmt.iteratorType as any, item);
        
        this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { variable: stmt.iteratorName, value: item });
        this.walkBlock(stmt.body);
      } catch (e) {
        if (e instanceof BreakSignal) {
          this.scopeManager.exitScope(); // MUST pop memory before breaking
          break;
        }
        if (e instanceof ContinueSignal) {
           this.scopeManager.exitScope(); // MUST pop memory before skipping to the next lap
           continue;
        }
        throw e;
      }
      this.scopeManager.exitScope(); // Standard cleanup for a successful lap
    }
    
    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, {});
  }
}