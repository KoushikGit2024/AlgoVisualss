import type {
  IRFunctionDeclaration,
  IRStructDeclaration,
  IREnumDeclaration,
} from "../../ir/IRNode";
import type { StaticStorageKey, CppType, CppValue, Breakpoint } from "../../types";
import { CallStack } from "../../runtime/CallStack";
import { EventEmitter } from "../../events/EventEmitter";
import type { ScopeManager } from "../../runtime/ScopeManager";

export interface EngineContext {
  functions: Map<string, IRFunctionDeclaration>;
  classBlueprints: Map<string, IRStructDeclaration>;
  enumBlueprints: Map<string, IREnumDeclaration>;
  typeAliases: Map<string, string>;
  staticStorage: Map<StaticStorageKey, { type: CppType; value: CppValue }>;
  callStack: CallStack;
  eventEmitter: EventEmitter;
  breakpoints: Breakpoint[];
  globalScopeManager: ScopeManager | null;
  lambdaCounter: number;
  provideInput: () => CppValue | undefined;
}
