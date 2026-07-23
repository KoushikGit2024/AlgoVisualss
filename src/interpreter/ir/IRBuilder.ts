import type {
  IRProgram,
  IRFunctionDeclaration,
  IRStructDeclaration,
  IREnumDeclaration,
  IRTypeAlias,
  IRVariableDeclaration,
} from "./IRNode";

import { logStepToConsole } from "../utils/helpers";
import {
  buildStructDeclaration,
  buildEnumDeclaration,
  buildTypeAlias,
  buildVariableDeclaration,
  buildFunctionDeclaration,
  getDeclaratorName,
} from "./modules/DeclarationBuilder";
import { buildBlock, buildStatement } from "./modules/StatementBuilder";
import { buildExpression } from "./modules/ExpressionBuilder";

export interface SyntaxNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  child(index: number): SyntaxNode | null;
  childCount: number;
  children: SyntaxNode[];
  namedChildren: SyntaxNode[];
  isNamed: boolean;
}

export class IRBuilder {
  public build(rootNode: SyntaxNode): IRProgram {
    if (rootNode.type !== "translation_unit") {
      throw new Error(
        `Compilation Error: IRBuilder.build() expects a translation_unit root node. Received: '${rootNode.type}'.`,
      );
    }

    const functions: IRFunctionDeclaration[] = [];
    const structs: IRStructDeclaration[] = [];
    const enums: IREnumDeclaration[] = [];
    const aliases: IRTypeAlias[] = [];
    const globals: IRVariableDeclaration[] = [];

    const processNode = (child: SyntaxNode) => {
      try {
        switch (child.type) {
          case "template_declaration":
            for (const c of child.namedChildren) {
              if (c.type !== "template_parameter_list") {
                processNode(c);
              }
            }
            break;
          case "function_definition":
            functions.push(this.buildFunctionDeclaration(child));
            break;
          case "struct_specifier":
          case "class_specifier":
            structs.push(this.buildStructDeclaration(child));
            break;
          case "enum_specifier":
          case "scoped_enum_specifier":
            enums.push(this.buildEnumDeclaration(child));
            break;
          case "type_alias_declaration":
          case "alias_declaration":
          case "typedef_declaration":
          case "type_definition":
            aliases.push(this.buildTypeAlias(child));
            break;
          case "declaration": {
            const structSpec = child.namedChildren.find(
              (c) => c.type === "struct_specifier" || c.type === "class_specifier",
            );
            const enumSpec = child.namedChildren.find((c) => c.type === "enum_specifier");
            if (structSpec) structs.push(this.buildStructDeclaration(structSpec));
            else if (enumSpec) enums.push(this.buildEnumDeclaration(enumSpec));
            else {
              try {
                globals.push(...this.buildVariableDeclaration(child));
              } catch {
                /* skip */
              }
            }
            break;
          }
          default:
            break;
        }
      } catch (e) {
        logStepToConsole(
          `[IRBuilder.build] Skipping node '${child.type}' at line ${child.startPosition.row + 1} due to parse error: ${(e as Error).message}`,
        );
      }
    };

    for (const child of rootNode.namedChildren) {
      processNode(child);
    }

    return { kind: "Program", line: 1, functions, structs, enums, aliases, globals };
  }

  // --- Delegate Methods for Modules ---
  public buildFunctionDeclaration(node: SyntaxNode) {
    return buildFunctionDeclaration(node, this);
  }
  public buildStructDeclaration(node: SyntaxNode) {
    return buildStructDeclaration(node, this);
  }
  public buildEnumDeclaration(node: SyntaxNode) {
    return buildEnumDeclaration(node, this);
  }
  public buildTypeAlias(node: SyntaxNode) {
    return buildTypeAlias(node);
  }
  public buildVariableDeclaration(node: SyntaxNode) {
    return buildVariableDeclaration(node, this);
  }
  public buildBlock(node: SyntaxNode) {
    return buildBlock(node, this);
  }
  public buildStatement(node: SyntaxNode) {
    return buildStatement(node, this);
  }
  public buildExpression(node: SyntaxNode) {
    return buildExpression(node, this);
  }
  public getDeclaratorName(node: SyntaxNode) {
    return getDeclaratorName(node);
  }
}
