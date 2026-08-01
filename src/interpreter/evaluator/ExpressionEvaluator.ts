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
import { ScopeManager } from "../runtime/ScopeManager";
import { EventEmitter } from "../events/EventEmitter";
import type { CppValue, EvalResult } from "../types";

import { BinaryEvaluator } from "./modules/BinaryEvaluator";
import { UnaryUpdateEvaluator } from "./modules/UnaryUpdateEvaluator";
import { CinInputEvaluator } from "./modules/CinInputEvaluator";
import { CoreEvaluator } from "./modules/CoreEvaluator";

export class ExpressionEvaluator {
  private binary: BinaryEvaluator;
  private unaryUpdate: UnaryUpdateEvaluator;
  private cinInput: CinInputEvaluator;
  public core: CoreEvaluator;

  constructor(scopeManager: ScopeManager, eventEmitter: EventEmitter) {
    this.cinInput = new CinInputEvaluator(this, scopeManager, eventEmitter);
    this.core = new CoreEvaluator(this, scopeManager, eventEmitter);
    this.binary = new BinaryEvaluator(this, eventEmitter, this.cinInput);
    this.unaryUpdate = new UnaryUpdateEvaluator(this, scopeManager, eventEmitter);
  }

  public setInputProvider(provider: (() => CppValue | undefined) | null): void {
    this.cinInput.setInputProvider(provider);
  }

  public evaluate(expr: IRExpression): CppValue {
    return this.evaluateWithType(expr).value;
  }

  public evaluateWithType(expr: IRExpression): EvalResult {
    try {
      switch (expr.kind) {
        case "Literal":
          return { type: (expr as any).valueType || "unknown", value: (expr as any).value };
        case "Identifier":
          return this.core.evaluateIdentifierTyped(expr as IRIdentifier);
        case "SizeofExpression":
          return { type: "int", value: this.core.evaluateSizeof(expr as IRSizeofExpression) };
        case "CommaExpression":
          return this.core.evaluateCommaTyped(expr as IRCommaExpression);
        case "UnaryExpression":
          return this.unaryUpdate.evaluateUnaryTyped(expr as IRUnaryExpression);
        case "BinaryExpression":
          return this.binary.evaluateBinaryTyped(expr as IRBinaryExpression);
        case "UpdateExpression":
          return this.unaryUpdate.evaluateUpdateTyped(expr as IRUpdateExpression);
        case "Assignment":
          return this.core.evaluateAssignmentTyped(expr as IRAssignment);
        case "SubscriptExpression":
          return this.core.evaluateSubscriptTyped(expr as IRSubscriptExpression);
        case "MemberExpression":
          return this.core.evaluateMemberTyped(expr as any);
        case "TernaryExpression":
          return this.core.evaluateTernaryTyped(expr as IRTernaryExpression);
        case "InitializerList":
          return { type: "unknown", value: this.core.evaluateInitList(expr as IRInitializerList) };
        case "LambdaExpression":
          return { type: "unknown", value: expr as unknown as CppValue };
        case "CastExpression":
          return this.core.evaluateCastTyped(expr as any);
        case "FunctionCall":
          throw new Error(
            "Execution Context Violation: FunctionCall nodes must be intercepted " +
              "by ExecutionEngine.attachEvaluationInterceptor() before reaching " +
              "ExpressionEvaluator.evaluate(). This is a bug in the interceptor setup.",
          );
        case "MethodCall":
          throw new Error(
            "Execution Context Violation: MethodCall nodes must be intercepted " +
              "by ExecutionEngine.attachEvaluationInterceptor().",
          );
        default:
          throw new Error(
            `Unsupported expression kind '${(expr as any).kind}'. ` +
              `This node type is not supported in this environment.`,
          );
      }
    } catch (e: any) {
      if (
        e instanceof Error &&
        e.name !== "ThrowSignal" &&
        e.name !== "BreakpointSignal" &&
        !e.message.match(/^Line \d+:/)
      ) {
        e.message = `Line ${expr.line}: ${e.message}`;
      }
      throw e;
    }
  }
}
