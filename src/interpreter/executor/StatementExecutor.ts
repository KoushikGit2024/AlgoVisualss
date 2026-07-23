import type {
  IRVariableDeclaration,
  IRAssignment,
  IRExpressionStatement,
  IRCoutStatement,
  IRReturnStatement,
  IRThrowStatement,
  IRStructDeclaration,
  IREnumDeclaration,
  IRExpression,
} from "../ir/IRNode";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import type { CppValue, CppType, StaticStorageKey } from "../types";

import { DeclarationExecutor } from "./modules/DeclarationExecutor";
import { AssignmentExecutor } from "./modules/AssignmentExecutor";
import { IOExecutor } from "./modules/IOExecutor";
import { ControlFlowExecutor } from "./modules/ControlFlowExecutor";

export class StatementExecutor {
  private declarationExecutor: DeclarationExecutor;
  private assignmentExecutor: AssignmentExecutor;
  private ioExecutor: IOExecutor;
  private controlFlowExecutor: ControlFlowExecutor;

  constructor(
    scopeManager: ScopeManager,
    evaluator: ExpressionEvaluator,
    eventEmitter: EventEmitter,
    classBlueprints?: Map<string, IRStructDeclaration>,
    enumBlueprints?: Map<string, IREnumDeclaration>,
    typeAliases?: Map<string, string>,
    staticStorage?: Map<StaticStorageKey, { type: CppType; value: CppValue }>,
    currentFunction?: string,
    instantiateCallback?: (typeName: string, args: IRExpression[]) => CppValue,
  ) {
    this.declarationExecutor = new DeclarationExecutor(
      scopeManager,
      evaluator,
      eventEmitter,
      classBlueprints,
      enumBlueprints,
      typeAliases,
      staticStorage,
      currentFunction,
      instantiateCallback,
    );
    this.assignmentExecutor = new AssignmentExecutor(scopeManager, evaluator, eventEmitter);
    this.ioExecutor = new IOExecutor(evaluator, eventEmitter);
    this.controlFlowExecutor = new ControlFlowExecutor(
      evaluator,
      eventEmitter,
      scopeManager,
      this.declarationExecutor,
      classBlueprints,
    );
  }

  public executeVariableDeclaration(node: IRVariableDeclaration): void {
    this.declarationExecutor.executeVariableDeclaration(node);
  }

  public executeAssignment(stmt: IRAssignment): void {
    this.assignmentExecutor.executeAssignment(stmt);
  }

  public executeExpressionStatement(stmt: IRExpressionStatement): void {
    this.controlFlowExecutor.executeExpressionStatement(stmt);
  }

  public executeCout(stmt: IRCoutStatement): void {
    this.ioExecutor.executeCout(stmt);
  }

  public executeReturn(stmt: IRReturnStatement): never {
    this.controlFlowExecutor.executeReturn(stmt);
  }

  public executeThrow(stmt: IRThrowStatement): never {
    this.controlFlowExecutor.executeThrow(stmt);
  }
}
