import type {
  IRWhileStatement,
  IRDoWhileStatement,
  IRForStatement,
  IRForRangeStatement,
  IRCommaExpression,
} from "../../ir/IRNode";
import { BreakSignal, ContinueSignal } from "../../utils/helpers";
import { logStepToConsole } from "../../utils/helpers";
import { EventType } from "../../types";
import type { IRWalker } from "../IRWalker";

const MAX_LOOP_ITERATIONS = 100_000;

export function walkWhileStatement(stmt: IRWhileStatement, walker: IRWalker): void {
  walker.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "while" });
  let safetyCounter = 0;
  while (true) {
    if (++safetyCounter > MAX_LOOP_ITERATIONS) {
      throw new Error(
        `Runtime Exception at line ${stmt.line}: Infinite loop detected — while loop exceeded ${MAX_LOOP_ITERATIONS} iterations. Check your loop condition.`,
      );
    }
    const conditionValue = walker.evaluator.evaluate(stmt.condition);
    walker.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
    if (!conditionValue) break;
    walker.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });
    try {
      walker.walkBlock(stmt.body);
    } catch (e: any) {
      if (e instanceof BreakSignal || e?.name === "BreakSignal") break;
      if (e instanceof ContinueSignal || e?.name === "ContinueSignal") continue;
      throw e;
    }
  }
  walker.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "while" });
}

export function walkDoWhileStatement(stmt: IRDoWhileStatement, walker: IRWalker): void {
  walker.eventEmitter.emit(stmt.line, EventType.LOOP_ENTER, { loopType: "do-while" });
  let safetyCounter = 0;
  do {
    if (++safetyCounter > MAX_LOOP_ITERATIONS) {
      throw new Error(
        `Runtime Exception at line ${stmt.line}: Infinite loop detected — do-while loop exceeded ${MAX_LOOP_ITERATIONS} iterations.`,
      );
    }
    walker.eventEmitter.emit(stmt.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });
    try {
      walker.walkBlock(stmt.body);
    } catch (e: any) {
      if (e instanceof BreakSignal || e?.name === "BreakSignal") {
        walker.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "do-while" });
        return;
      }
      if (e instanceof ContinueSignal || e?.name === "ContinueSignal") {
        // Fall through
      } else {
        throw e;
      }
    }
    const conditionValue = walker.evaluator.evaluate(stmt.condition);
    walker.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });
    if (!conditionValue) break;
  } while (true);
  walker.eventEmitter.emit(stmt.line, EventType.LOOP_EXIT, { loopType: "do-while" });
}

export function walkForStatement(node: IRForStatement, walker: IRWalker): void {
  walker.scopeManager.enterScope();
  walker.eventEmitter.emit(node.line, EventType.LOOP_ENTER, { loopType: "for" });
  let safetyCounter = 0;
  try {
    if (node.init) {
      if (Array.isArray(node.init)) {
        for (const initStmt of node.init) walker.walkStatement(initStmt);
      } else {
        walker.walkStatement(node.init);
      }
    }
    while (true) {
      if (++safetyCounter > MAX_LOOP_ITERATIONS) {
        throw new Error(
          `Runtime Exception at line ${node.line}: Infinite loop detected — for loop exceeded ${MAX_LOOP_ITERATIONS} iterations.`,
        );
      }
      if (node.condition) {
        const conditionResult = walker.evaluator.evaluate(node.condition);
        walker.eventEmitter.emit(node.line, EventType.CONDITION, { result: conditionResult });
        if (!conditionResult) break;
      }
      walker.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: safetyCounter });
      try {
        walker.walkBlock(node.body);
      } catch (e: any) {
        if (e instanceof BreakSignal || e?.name === "BreakSignal") break;
        if (e instanceof ContinueSignal || e?.name === "ContinueSignal") {
          // Fall through
        } else {
          throw e;
        }
      }
      if (node.update) {
        if (node.update.kind === "Assignment") {
          walker.walkStatement(node.update);
        } else if (node.update.kind === "CommaExpression") {
          walker.evaluateCommaExpression(node.update as IRCommaExpression);
        } else {
          walker.evaluator.evaluate(node.update);
        }
      }
    }
  } finally {
    walker.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for" });
    walker.scopeManager.exitScope();
  }
}

export function walkForRangeStatement(node: IRForRangeStatement, walker: IRWalker): void {
  const container = walker.evaluator.evaluate(node.collection);
  let targetArray: any[] | null = null;
  if (Array.isArray(container)) {
    targetArray = container;
  } else if (
    container &&
    typeof container === "object" &&
    "data" in container &&
    Array.isArray((container as any).data)
  ) {
    targetArray = (container as any).data;
  } else if (container instanceof Map) {
    targetArray = Array.from(container.entries());
  } else if (container instanceof Set) {
    targetArray = Array.from(container);
  } else if (typeof container === "string") {
    targetArray = Array.from(container);
  }
  if (!targetArray) {
    logStepToConsole(
      `[IRWalker.walkForRangeStatement] Collection at line ${node.line} could not be iterated — defaulting to empty. Type: ${typeof container}.`,
    );
    targetArray = [];
  }
  const varName = node.iteratorName;
  const varType = node.iteratorType || "auto";
  walker.eventEmitter.emit(node.line, EventType.LOOP_ENTER, {
    loopType: "for-range",
    collection: varName,
  });
  for (let i = 0; i < targetArray.length; i++) {
    walker.eventEmitter.emit(node.line, EventType.LOOP_ITERATION, { iteration: i + 1 });
    walker.scopeManager.enterScope();
    const val = targetArray[i];
    if (varName.startsWith("[") && varName.endsWith("]")) {
      const parts = varName
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim());
      if (Array.isArray(val)) {
        parts.forEach((p, idx) => {
          if (p) walker.scopeManager.defineVariable(p, varType, val[idx], node.isConst);
        });
      } else if (val && typeof val === "object") {
        const keys = Object.keys(val);
        parts.forEach((p, idx) => {
          if (p)
            walker.scopeManager.defineVariable(p, varType, (val as any)[keys[idx]], node.isConst);
        });
      } else {
        parts.forEach((p) => {
          if (p) walker.scopeManager.defineVariable(p, varType, val, node.isConst);
        });
      }
    } else {
      walker.scopeManager.defineVariable(varName, varType, val, node.isConst);
    }
    try {
      walker.walkBlock(node.body);
    } catch (e: any) {
      walker.scopeManager.exitScope();
      if (e instanceof BreakSignal || e?.name === "BreakSignal") break;
      if (e instanceof ContinueSignal || e?.name === "ContinueSignal") continue;
      throw e;
    }
    walker.scopeManager.exitScope();
  }
  walker.eventEmitter.emit(node.line, EventType.LOOP_EXIT, { loopType: "for-range" });
}

export function evaluateCommaExpression(expr: IRCommaExpression, walker: IRWalker): any {
  if (expr.left.kind === "CommaExpression") {
    evaluateCommaExpression(expr.left as IRCommaExpression, walker);
  } else if (expr.left.kind === "Assignment") {
    walker.walkStatement(expr.left);
  } else {
    walker.evaluator.evaluate(expr.left);
  }
  if (expr.right.kind === "Assignment") {
    walker.walkStatement(expr.right);
    return undefined;
  }
  return walker.evaluator.evaluate(expr.right);
}
