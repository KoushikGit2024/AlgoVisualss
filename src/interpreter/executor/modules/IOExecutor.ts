import type { IRCoutStatement } from "../../ir/IRNode";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import { ExpressionEvaluator } from "../../evaluator/ExpressionEvaluator";

export class IOExecutor {
  constructor(
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
  ) {}

  public executeCout(stmt: IRCoutStatement): void {
    const parts = stmt.arguments.map((arg) => {
      const val = this.evaluator.evaluate(arg);
      return val === "\n" ? "\n" : String(val ?? "");
    });

    this.eventEmitter.emit(stmt.line, EventType.WRITE, {
      output: parts.join(""),
    });
  }
}
