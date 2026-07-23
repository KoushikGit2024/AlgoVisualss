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
import type { CppValue } from "../types";

import { BinaryEvaluator } from "./modules/BinaryEvaluator";
import { UnaryUpdateEvaluator } from "./modules/UnaryUpdateEvaluator";
import { CinInputEvaluator } from "./modules/CinInputEvaluator";
import { CoreEvaluator } from "./modules/CoreEvaluator";

export class ExpressionEvaluator {
  private binary: BinaryEvaluator;
  private unaryUpdate: UnaryUpdateEvaluator;
  private cinInput: CinInputEvaluator;
  private core: CoreEvaluator;

  constructor(scopeManager: ScopeManager, eventEmitter: EventEmitter) {
    this.cinInput = new CinInputEvaluator(this, scopeManager, eventEmitter);
    this.core = new CoreEvaluator(this, scopeManager, eventEmitter);
    this.binary = new BinaryEvaluator(this, eventEmitter, this.cinInput, this.core);
    this.unaryUpdate = new UnaryUpdateEvaluator(this, scopeManager, eventEmitter);
  }

  public setInputProvider(provider: (() => CppValue | undefined) | null): void {
    this.cinInput.setInputProvider(provider);
  }

  public evaluate(expr: IRExpression): CppValue {
    switch (expr.kind) {
      case "Literal":
        return (expr as any).value;
      case "Identifier":
        return this.core.evaluateIdentifier(expr as IRIdentifier);
      case "SizeofExpression":
        return this.core.evaluateSizeof(expr as IRSizeofExpression);
      case "CommaExpression":
        return this.core.evaluateComma(expr as IRCommaExpression);
      case "UnaryExpression":
        return this.unaryUpdate.evaluateUnary(expr as IRUnaryExpression);
      case "BinaryExpression":
        return this.binary.evaluateBinary(expr as IRBinaryExpression);
      case "UpdateExpression":
        return this.unaryUpdate.evaluateUpdate(expr as IRUpdateExpression);
      case "Assignment":
        return this.core.evaluateAssignment(expr as IRAssignment);
      case "SubscriptExpression":
        return this.core.evaluateSubscript(expr as IRSubscriptExpression);
      case "MemberExpression":
        return this.core.evaluateMember(expr as any);
      case "TernaryExpression":
        return this.core.evaluateTernary(expr as IRTernaryExpression);
      case "InitializerList":
        return this.core.evaluateInitList(expr as IRInitializerList);
      case "LambdaExpression":
        return expr as unknown as CppValue;
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
          `Line ${expr.line}: Unsupported expression kind '${(expr as any).kind}'. ` +
            `This node type is not supported in this environment.`,
        );
    }
  }
}
