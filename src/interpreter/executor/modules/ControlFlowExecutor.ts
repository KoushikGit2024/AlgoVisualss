import type {
  IRExpressionStatement,
  IRReturnStatement,
  IRThrowStatement,
  IRStructDeclaration,
} from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import type { CppValue } from "../../types";
import { ExpressionEvaluator } from "../../evaluator/ExpressionEvaluator";
import { ScopeManager } from "../../runtime/ScopeManager";
import { ReturnSignal, ThrowSignal } from "../../utils/helpers";
import type { DeclarationExecutor } from "./DeclarationExecutor";

export class ControlFlowExecutor {
  constructor(
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
    private scopeManager: ScopeManager,
    private declarationExecutor: DeclarationExecutor,
    private classBlueprints?: Map<string, IRStructDeclaration>,
  ) {}

  public executeExpressionStatement(stmt: IRExpressionStatement): void {
    if (stmt.expression.kind === "FunctionCall" && stmt.expression.callee === "__init_field") {
      const call = stmt.expression as any;
      const fieldName = (call.arguments[0] as any).value.replace(/"/g, "");
      const args = call.arguments.slice(1).map((a: any) => this.evaluator.evaluate(a));

      const thisObj = this.scopeManager.getVariable("this")?.value;
      if (thisObj && typeof thisObj === "object" && (thisObj as any).__type) {
        const blueprint = this.classBlueprints!.get((thisObj as any).__type);
        const fieldDef = blueprint?.fields.find((f: any) => f.name === fieldName);
        if (fieldDef) {
          const typeLower = fieldDef.type.toLowerCase();
          if (this.declarationExecutor.isContainerType(typeLower)) {
            const size = args[0] || 0;
            let fillVal = args[1];
            if (fillVal === undefined) {
              const innerMatch = typeLower.match(/<(.*)>/);
              if (innerMatch) {
                fillVal = this.declarationExecutor.defaultValueForType(
                  innerMatch[1],
                  innerMatch[1].toLowerCase(),
                  [],
                );
              } else {
                fillVal = 0;
              }
            }
            (thisObj as any)[fieldName] = this.declarationExecutor.createMockContainer(
              Array.from({ length: size }, () =>
                Array.isArray(fillVal)
                  ? [...fillVal]
                  : fillVal && typeof fillVal === "object" && Array.isArray((fillVal as any).data)
                    ? { ...(fillVal as any), data: [...(fillVal as any).data] }
                    : fillVal,
              ),
              typeLower,
            );
          } else {
            (thisObj as any)[fieldName] = args[0];
          }
          this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
            variable: `this->${fieldName}`,
            value: (thisObj as any)[fieldName],
          });
          return;
        }
      }
    }

    this.evaluator.evaluate(stmt.expression);
  }

  public executeReturn(stmt: IRReturnStatement): never {
    const value = stmt.argument ? this.evaluator.evaluate(stmt.argument) : undefined;
    throw new ReturnSignal(value);
  }

  public executeThrow(stmt: IRThrowStatement): never {
    let value: CppValue = undefined;
    let typeName: string | undefined;

    if (stmt.argument) {
      value = this.evaluator.evaluate(stmt.argument);
      const arg = stmt.argument;
      if (arg.kind === "Literal") {
        typeName = (arg as any).valueType as string;
        if (typeName === "double") typeName = "int";
      } else if (arg.kind === "FunctionCall") {
        typeName = (arg as any).callee as string;
      } else if (arg.kind === "NewExpression") {
        typeName = (arg as any).typeName as string;
      } else if (arg.kind === "Identifier") {
        try {
          const symbol = this.scopeManager.getVariable((arg as any).name);
          typeName = symbol.type;
        } catch {}
      }
    }

    this.eventEmitter.emit(stmt.line, EventType.THROW, {
      value,
      typeName,
    });

    throw new ThrowSignal({ value, typeName });
  }
}
