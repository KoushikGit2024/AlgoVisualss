import type { IRTryStatement, IRGotoStatement, IRLabeledStatement } from "../../ir/IRNode";
import { ThrowSignal } from "../../utils/helpers";
import { EventType } from "../../types";
import type { IRWalker } from "../IRWalker";
import { UnsupportedFeatureError } from "../IRWalker";

export function walkTryStatement(stmt: IRTryStatement, walker: IRWalker): void {
  let caughtSignal: ThrowSignal | null = null;

  try {
    walker.walkBlock(stmt.body);
  } catch (e: any) {
    if (e instanceof ThrowSignal || e?.name === "ThrowSignal") {
      caughtSignal = e as ThrowSignal;
    } else {
      throw e;
    }
  }

  if (!caughtSignal) return;

  let matched = false;
  for (const handler of stmt.handlers) {
    const doesMatch =
      handler.catchAll ||
      !handler.catchType ||
      handler.catchType === caughtSignal.payload.typeName ||
      (handler.catchType &&
        (caughtSignal.payload.typeName === handler.catchType ||
          caughtSignal.payload.typeName?.endsWith("::" + handler.catchType)));

    if (doesMatch) {
      matched = true;

      walker.eventEmitter.emit(handler.line, EventType.CATCH, {
        value: caughtSignal.payload.value,
        typeName: caughtSignal.payload.typeName,
      });

      walker.scopeManager.enterScope();
      if (handler.catchParam) {
        walker.scopeManager.defineVariable(
          handler.catchParam,
          handler.catchType ?? "auto",
          caughtSignal.payload.value,
        );
      }

      try {
        for (const handlerStmt of handler.body.statements) {
          walker.walkStatement(handlerStmt);
        }
      } finally {
        walker.scopeManager.exitScope();
      }

      break;
    }
  }

  if (!matched) {
    throw caughtSignal;
  }

  if (stmt.finallyBlock) {
    walker.walkBlock(stmt.finallyBlock);
  }
}

export function walkGotoStatement(stmt: IRGotoStatement): void {
  throw new UnsupportedFeatureError(
    "goto",
    `'goto ${stmt.label}' encountered at line ${stmt.line}. ` +
      `The goto statement requires two-pass label resolution which is not ` +
      `currently implemented. Consider refactoring to use loops or functions.`,
  );
}

export function walkLabeledStatement(stmt: IRLabeledStatement, walker: IRWalker): void {
  walker.walkStatement(stmt.statement);
}
