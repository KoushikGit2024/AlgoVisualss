import type { 
  IRBlock, 
  IRIfStatement, 
  IRWhileStatement,
  IRDoWhileStatement,
  IRForStatement, 
  IRNode,
  IRForRangeStatement,
  IRSwitchStatement
} from "../ir/IRNode";
import { BreakSignal, ContinueSignal } from "../utils/helpers";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { StatementExecutor } from "../executor/StatementExecutor";
import { EventType } from "../types";

// Maximum iterations for any loop before an infinite-loop safety abort.
const MAX_LOOP_ITERATIONS = 100_000;

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
      case "DoWhileStatement":
        this.walkDoWhileStatement(stmt);
        break;
      case "ForStatement":
        this.walkForStatement(stmt);
        break;
      case "ForRangeStatement":
        this.walkForRangeStatement(stmt);
        break;
      case "SwitchStatement":
        this.walkSwitchStatement(stmt);
        break;
      case "Block":
        this.walkBlock(stmt);
        break;
      case "EmptyStatement":
        // No-op for semicolons, comments, or preprocessor directives
        break;
      default:
        // Ignore unrecognized statement kinds rather than crashing
        break;
    }
  }

  private walkIfStatement(stmt: IRIfStatement): void {
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, {
      result: conditionValue
    });

    if (conditionValue) {
      this.walkBlock(stmt.consequent);
    } else if (stmt.alternate) {
      this.walkBlock(stmt.alternate);
    }
  }

  private walkSwitchStatement(stmt: IRSwitchStatement): void {
    const conditionValue = this.evaluator.evaluate(stmt.condition);
    this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
    
    // We don't push a new scope for the switch block itself per C++ standard
    // (Variables declared in switch cases share the same outer scope unless wrapped in `{}`)
    
    let fallthrough = false;

    try {
      for (const caseClause of stmt.cases) {
        if (!fallthrough && !caseClause.isDefault) {
          const caseValue = caseClause.value ? this.evaluator.evaluate(caseClause.value) : undefined;
          if (caseValue === conditionValue) {
            fallthrough = true;
          }
        }
        
        if (caseClause.isDefault) {
          fallthrough = true; // default catches everything if nothing matched before, or if fallthrough is active
        }

        if (fallthrough) {
          for (const caseStmt of caseClause.statements) {
            this.walkStatement(caseStmt);
          }
        }
      }
    } catch (e: any) {
      // Catch 'break' to exit the switch block, but re-throw 'continue' or 'return'
      if (e instanceof BreakSignal || e.name === "BreakSignal") {
         // Break successfully caught; exit switch
      } else {
         throw e;
      }
    }
  }

  private walkWhileStatement(stmt: IRWhileStatement): void {
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "while" });
    
    let safetyCounter = 0;
    while (true) {
      if (++safetyCounter > MAX_LOOP_ITERATIONS) {
        throw new Error(`Runtime Exception at line ${stmt.line}: Infinite loop detected (exceeded ${MAX_LOOP_ITERATIONS} iterations).`);
      }

      const conditionValue = this.evaluator.evaluate(stmt.condition);
      this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
      
      if (!conditionValue) break; 

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });
      
      try {
        this.walkBlock(stmt.body);
      } catch (e: any) {
        // Intercept custom jump signals
        if (e instanceof BreakSignal || e.name === "BreakSignal") break;
        if (e instanceof ContinueSignal || e.name === "ContinueSignal") continue;
        throw e; // Bubble up true runtime exceptions and ReturnSignals
      }
    }

    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "while" });
  }

  /**
   * Executes a do-while loop — body runs at least once before condition is checked.
   * Previously missing entirely from the walker, causing do-while blocks to silently no-op.
   */
  private walkDoWhileStatement(stmt: IRDoWhileStatement): void {
    this.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "do-while" });

    let safetyCounter = 0;
    do {
      if (++safetyCounter > MAX_LOOP_ITERATIONS) {
        throw new Error(`Runtime Exception at line ${stmt.line}: Infinite loop detected in do-while (exceeded ${MAX_LOOP_ITERATIONS} iterations).`);
      }

      this.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });

      try {
        this.walkBlock(stmt.body);
      } catch (e: any) {
        if (e instanceof BreakSignal || e.name === "BreakSignal") {
          this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "do-while" });
          return;
        }
        if (e instanceof ContinueSignal || e.name === "ContinueSignal") {
          // Continue proceeds to the condition check — do nothing special here
        } else {
          throw e;
        }
      }

      const conditionValue = this.evaluator.evaluate(stmt.condition);
      this.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });

      if (!conditionValue) break;
    } while (true);

    this.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "do-while" });
  }

  public walkForStatement(node: IRForStatement): void {
    // Isolate loop initializers (e.g., `int i = 0`) to prevent scope pollution
    this.scopeManager.enterScope();
    this.eventEmitter.emit(node.line, EventType.LOOP_ENTER, { loopType: "for" });

    let safetyCounter = 0;
    try {
      if (node.init) {
        if (Array.isArray(node.init)) {
          for (const initStmt of node.init) {
            this.walkStatement(initStmt);
          }
        } else {
          this.walkStatement(node.init);
        }
      }

      while (true) {
        if (++safetyCounter > MAX_LOOP_ITERATIONS) {
          throw new Error(`Runtime Exception at line ${node.line}: Infinite loop detected in for loop (exceeded ${MAX_LOOP_ITERATIONS} iterations).`);
        }

        if (node.condition) {
          const conditionResult = this.evaluator.evaluate(node.condition);
          this.eventEmitter.emit(node.line, EventType.CONDITION, { result: conditionResult });
          if (!conditionResult) break;
        }

        this.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });

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
      this.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for" });
      this.scopeManager.exitScope();
    }
  }

  public walkForRangeStatement(node: IRForRangeStatement): void {
    // Resolve the collection reference
    const container = this.evaluator.evaluate(node.collection);
    
    // Normalize duck-typed containers to standard JavaScript arrays
    let targetArray = Array.isArray(container) 
      ? container 
      : (container && typeof container === 'object' && 'data' in container 
          ? (container as any).data 
          : null);

    // Handle Map iteration (for-range over std::map iterates over [key, value] pairs)
    if (!targetArray && container instanceof Map) {
      targetArray = Array.from(container.entries());
    }

    // Handle Set iteration
    if (!targetArray && container instanceof Set) {
      targetArray = Array.from(container);
    }

    // Gracefully handle uninitialized or empty adjacency lists
    if (!targetArray || !Array.isArray(targetArray)) {
      targetArray = [];
    }

    const varName = node.iteratorName;
    const varType = node.iteratorType || "auto";

    this.eventEmitter.emit(node.line, EventType.LOOP_ENTER, { loopType: "for-range", collection: varName });

    for (let i = 0; i < targetArray.length; i++) {
      this.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: i + 1 });

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
        this.scopeManager.exitScope();
        throw e;
      }

      this.scopeManager.exitScope();
    }

    this.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for-range" });
  }
}