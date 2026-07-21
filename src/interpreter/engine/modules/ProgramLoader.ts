import type {
  IRProgram,
  IRFunctionDeclaration,
  IRStructDeclaration,
  IREnumDeclaration,
  IRExpression,
  IRVariableDeclaration,
} from "../../ir/IRNode";
import type { CppType, CppValue } from "../../types";
import { logStepToConsole } from "../../utils/helpers";
import type { ScopeManager } from "../../runtime/ScopeManager";

export class ProgramLoader {
  constructor(
    private functions: Map<string, IRFunctionDeclaration>,
    private classBlueprints: Map<string, IRStructDeclaration>,
    private enumBlueprints: Map<string, IREnumDeclaration>,
    private resolvedEnumValues: Map<string, number>,
    private typeAliases: Map<string, string>,
    private engineState: {
      globalDeclarations: IRVariableDeclaration[];
      globalVariables: Map<string, { type: CppType; value: CppValue }>;
      globalScopeManager: ScopeManager | null;
    },
  ) {}

  public loadProgram(program: IRProgram): void {
    this.functions.clear();
    for (const func of program.functions) {
      this.functions.set(func.name, func);
    }

    this.classBlueprints.clear();
    for (const struct of program.structs ?? []) {
      this.classBlueprints.set(struct.name, struct);
    }

    this.enumBlueprints.clear();
    this.resolvedEnumValues.clear();

    for (const enumDecl of program.enums ?? []) {
      this.enumBlueprints.set(enumDecl.name, enumDecl);

      let nextValue = 0;
      for (const member of enumDecl.members) {
        let memberValue = nextValue;

        if (member.value) {
          try {
            memberValue = this.evaluateEnumConstant(member.value);
          } catch {
            logStepToConsole(
              `[ExecutionEngine.loadProgram] Could not resolve enum member ` +
                `'${enumDecl.name}::${member.name}' — using auto-increment value ${nextValue}.`,
            );
            memberValue = nextValue;
          }
        }

        nextValue = memberValue + 1;

        this.resolvedEnumValues.set(member.name, memberValue);
        this.resolvedEnumValues.set(`${enumDecl.name}::${member.name}`, memberValue);
      }
    }

    this.typeAliases.clear();
    for (const alias of program.aliases ?? []) {
      this.typeAliases.set(alias.alias, alias.target);
    }

    this.engineState.globalDeclarations = program.globals ?? [];
    this.engineState.globalVariables.clear();
    this.engineState.globalScopeManager = null;
  }

  private evaluateEnumConstant(expr: IRExpression): number {
    if (expr.kind === "Literal" && typeof (expr as any).value === "number") {
      return (expr as any).value as number;
    }
    if (expr.kind === "UnaryExpression" && (expr as any).operator === "-") {
      return -this.evaluateEnumConstant((expr as any).argument);
    }
    if (expr.kind === "BinaryExpression") {
      const l = this.evaluateEnumConstant((expr as any).left);
      const r = this.evaluateEnumConstant((expr as any).right);
      switch ((expr as any).operator) {
        case "+":
          return l + r;
        case "-":
          return l - r;
        case "*":
          return l * r;
        case "/":
          return Math.trunc(l / r);
        case "<<":
          return l << r;
        case ">>":
          return l >> r;
        case "|":
          return l | r;
        case "&":
          return l & r;
      }
    }
    throw new Error("Non-literal enum constant — cannot resolve at load time.");
  }
}
