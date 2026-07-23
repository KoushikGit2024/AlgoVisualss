import type {
  IRBlock,
  IRNode,
  IRIfStatement,
  IRWhileStatement,
  IRDoWhileStatement,
  IRForStatement,
  IRForRangeStatement,
  IRSwitchStatement,
  IRTryStatement,
  IRThrowStatement,
  IRGotoStatement,
  IRLabeledStatement,
  IRCommaExpression,
} from "../ir/IRNode";
import { BreakSignal, ContinueSignal, BreakpointSignal } from "../utils/helpers";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { logStepToConsole } from "../utils/helpers";
import { StatementExecutor } from "../executor/StatementExecutor";
import { EventType } from "../types";
import type { Breakpoint } from "../types";

import {
  walkWhileStatement,
  walkDoWhileStatement,
  walkForStatement,
  walkForRangeStatement,
  evaluateCommaExpression,
} from "./modules/LoopWalker";
import { walkIfStatement, walkSwitchStatement } from "./modules/BranchWalker";
import {
  walkTryStatement,
  walkGotoStatement,
  walkLabeledStatement,
} from "./modules/ExceptionWalker";

export class UnsupportedFeatureError extends Error {
  public readonly feature: string;
  constructor(feature: string, detail: string) {
    super(`Unsupported Feature: '${feature}' is not supported by this interpreter. ${detail}`);
    this.feature = feature;
    Object.setPrototypeOf(this, UnsupportedFeatureError.prototype);
  }
}

export class IRWalker {
  private breakpoints: Map<number, Breakpoint>;

  constructor(
    public scopeManager: ScopeManager,
    public evaluator: ExpressionEvaluator,
    public executor: StatementExecutor,
    public eventEmitter: EventEmitter,
  ) {
    this.breakpoints = new Map();
  }

  public setBreakpoints(breakpoints: Breakpoint[]): void {
    this.breakpoints.clear();
    for (const bp of breakpoints) {
      if (bp.enabled !== false) {
        this.breakpoints.set(bp.line, bp);
      }
    }
  }

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

  public walkStatement(stmt: IRNode): void {
    if (this.breakpoints.size > 0) {
      const bp = this.breakpoints.get((stmt as any).line);
      if (bp) {
        let shouldBreak = true;
        if (bp.condition) {
          try {
            const condVal = this.evaluator.evaluate((bp as any).conditionExpr);
            shouldBreak = Boolean(condVal);
          } catch {
            shouldBreak = true;
          }
        }
        if (shouldBreak) {
          this.eventEmitter.emit((stmt as any).line, EventType.BREAKPOINT, {
            line: (stmt as any).line,
            condition: bp.condition,
          });
          throw new BreakpointSignal((stmt as any).line);
        }
      }
    }

    switch (stmt.kind) {
      case "VariableDeclaration":
        this.executor.executeVariableDeclaration(stmt);
        break;
      case "Assignment":
        this.executor.executeAssignment(stmt);
        break;
      case "CoutStatement":
        this.executor.executeCout(stmt);
        break;
      case "ExpressionStatement":
        this.executor.executeExpressionStatement(stmt);
        break;
      case "ReturnStatement":
        this.executor.executeReturn(stmt);
        break;
      case "ThrowStatement":
        this.executor.executeThrow(stmt as IRThrowStatement);
        break;
      case "BreakStatement":
        throw new BreakSignal();
      case "ContinueStatement":
        throw new ContinueSignal();
      case "IfStatement":
        walkIfStatement(stmt as IRIfStatement, this);
        break;
      case "WhileStatement":
        walkWhileStatement(stmt as IRWhileStatement, this);
        break;
      case "DoWhileStatement":
        walkDoWhileStatement(stmt as IRDoWhileStatement, this);
        break;
      case "ForStatement":
        walkForStatement(stmt as IRForStatement, this);
        break;
      case "ForRangeStatement":
        walkForRangeStatement(stmt as IRForRangeStatement, this);
        break;
      case "SwitchStatement":
        walkSwitchStatement(stmt as IRSwitchStatement, this);
        break;
      case "TryStatement":
        walkTryStatement(stmt as IRTryStatement, this);
        break;
      case "GotoStatement":
        walkGotoStatement(stmt as IRGotoStatement);
        break;
      case "LabeledStatement":
        walkLabeledStatement(stmt as IRLabeledStatement, this);
        break;
      case "Block":
        this.walkBlock(stmt as IRBlock);
        break;
      case "EmptyStatement":
        break;
      default:
        logStepToConsole(
          `[IRWalker.walkStatement] Unknown statement kind '${(stmt as any).kind}' at line ${(stmt as any).line}. Skipping.`,
        );
        break;
    }
  }

  public evaluateCommaExpression(expr: IRCommaExpression): any {
    return evaluateCommaExpression(expr, this);
  }
}
