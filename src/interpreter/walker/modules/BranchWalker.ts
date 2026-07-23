import type { IRIfStatement, IRSwitchStatement } from "../../ir/IRNode";
import { BreakSignal } from "../../utils/helpers";
import { EventType } from "../../types";
import type { IRWalker } from "../IRWalker";

export function walkIfStatement(stmt: IRIfStatement, walker: IRWalker): void {
  const conditionValue = walker.evaluator.evaluate(stmt.condition);
  walker.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });

  if (conditionValue) {
    walker.walkBlock(stmt.consequent);
  } else if (stmt.alternate) {
    walker.walkBlock(stmt.alternate);
  }
}

export function walkSwitchStatement(stmt: IRSwitchStatement, walker: IRWalker): void {
  const conditionValue = walker.evaluator.evaluate(stmt.condition);
  walker.eventEmitter.emit(stmt.line, EventType.CONDITION, { result: conditionValue });

  let fallthrough = false;

  try {
    for (const caseClause of stmt.cases) {
      if (!fallthrough && !caseClause.isDefault) {
        const caseValue = caseClause.value
          ? walker.evaluator.evaluate(caseClause.value)
          : undefined;
        if (caseValue === conditionValue) fallthrough = true;
      }

      if (caseClause.isDefault && !fallthrough) fallthrough = true;

      if (fallthrough) {
        for (const caseStmt of caseClause.statements) {
          walker.walkStatement(caseStmt);
        }
      }
    }
  } catch (e: any) {
    if (e instanceof BreakSignal || e?.name === "BreakSignal") return;
    throw e;
  }
}
