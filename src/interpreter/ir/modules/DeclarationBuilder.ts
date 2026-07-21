import type {
  IRVariableDeclaration,
  IRExpression,
} from "../../ir/IRNode";
import type { SyntaxNode, IRBuilder } from "../IRBuilder";
import {
  buildFunctionDeclaration,
  buildStructDeclaration,
  buildEnumDeclaration,
  buildTypeAlias,
} from "./TypeDeclarationBuilder";

export function getDeclaratorName(node: SyntaxNode): string {
  if (!node) return "unknown";
  if (node.type === "identifier") return node.text;

  if (node.type === "pointer_declarator" || node.type === "reference_declarator") {
    if (node.namedChildren.length > 0) return getDeclaratorName(node.namedChildren[0]);
    return node.child(1) ? getDeclaratorName(node.child(1)!) : "unknown";
  }

  if (node.type === "array_declarator") {
    if (node.namedChildren.length > 0) return getDeclaratorName(node.namedChildren[0]);
    return node.child(0) ? getDeclaratorName(node.child(0)!) : "unknown";
  }

  if (node.type === "function_declarator") {
    if (node.namedChildren.length > 0) return getDeclaratorName(node.namedChildren[0]);
    return node.child(0) ? getDeclaratorName(node.child(0)!) : "unknown";
  }

  return node.text || "unknown";
}

export function buildVariableDeclaration(
  node: SyntaxNode,
  builder: IRBuilder,
): IRVariableDeclaration[] {
  const typeNode = node.child(0);
  if (!typeNode) {
    throw new Error(
      `Compilation Error at line ${node.startPosition.row + 1}: Malformed variable declaration — missing type node.`,
    );
  }

  const allTokenTexts = node.children.map((c) => c.text);
  const isConst = allTokenTexts.includes("const");
  const isStatic = allTokenTexts.includes("static");

  const declarators = node.namedChildren.filter(
    (c) =>
      c.type !== "primitive_type" &&
      c.type !== "type_identifier" &&
      c.type !== "sized_type_specifier" &&
      c.type !== "template_type" &&
      c.type !== "type_qualifier" &&
      c.type !== "storage_class_specifier" &&
      c.type !== "struct_specifier" &&
      c.type !== "enum_specifier",
  );

  const targetDeclarators = declarators.length > 0 ? declarators : node.namedChildren.slice(1);
  const declarations: IRVariableDeclaration[] = [];

  for (const declaratorNode of targetDeclarators) {
    let name: string = "unknown";
    let initializer: IRExpression | undefined;
    let constructorArgs: IRExpression[] | undefined;

    if (declaratorNode.type === "init_declarator") {
      const coreDeclarator = declaratorNode.child(0) as SyntaxNode;
      name = getDeclaratorName(coreDeclarator);

      const child1 = declaratorNode.child(1);
      if (child1?.type === "argument_list") {
        constructorArgs = child1.namedChildren
          .map((c) => {
            try {
              return builder.buildExpression(c);
            } catch {
              return null;
            }
          })
          .filter((e): e is IRExpression => e !== null);
      } else {
        const valueNode =
          (declaratorNode as any).childForFieldName?.("value") ?? declaratorNode.namedChildren[1];
        if (valueNode) {
          try {
            initializer = builder.buildExpression(valueNode);
          } catch {
            /* skip */
          }
        }
      }
    } else if (declaratorNode.type === "function_declarator") {
      const nameNode = declaratorNode.child(0);
      name = nameNode ? getDeclaratorName(nameNode) : "unknown";
      const paramList = declaratorNode.namedChildren.find(
        (c) => c.type === "parameter_list" || c.type === "argument_list",
      );
      if (paramList) {
        let innerText = paramList.text.slice(1, -1).trim();
        const splitArgs = (text: string): string[] => {
          const result: string[] = [];
          let current = "";
          let depth = 0,
            inStr = false,
            inChar = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i],
              prev = i > 0 ? text[i - 1] : "";
            if (char === '"' && prev !== "\\" && !inChar) inStr = !inStr;
            else if (char === "'" && prev !== "\\" && !inStr) inChar = !inChar;
            else if (!inStr && !inChar) {
              if (char === "(" || char === "<") depth++;
              else if (char === ")" || char === ">") depth--;
              else if (char === "," && depth === 0) {
                result.push(current.trim());
                current = "";
                continue;
              }
            }
            current += char;
          }
          if (current.trim()) result.push(current.trim());
          return result;
        };

        const argStrings = splitArgs(innerText);
        const rawArgs: IRExpression[] = [];
        for (const argStr of argStrings) {
          if (!isNaN(Number(argStr))) {
            rawArgs.push({
              kind: "Literal",
              line: node.startPosition.row + 1,
              type: "number",
              value: argStr,
            } as any);
          } else if (
            argStr.match(/^([a-zA-Z_][a-zA-Z0-9_]*\s*<\s*[a-zA-Z0-9_:\s]+\s*>)\s*\((.*)\)$/)
          ) {
            const match = argStr.match(
              /^([a-zA-Z_][a-zA-Z0-9_]*\s*<\s*[a-zA-Z0-9_:\s]+\s*>)\s*\((.*)\)$/,
            );
            const innerArgs = splitArgs(match![2]).filter((s) => s);
            rawArgs.push({
              kind: "FunctionCall",
              line: node.startPosition.row + 1,
              callee: match![1],
              arguments: innerArgs.map((a) =>
                !isNaN(Number(a))
                  ? ({
                      kind: "Literal",
                      type: "number",
                      value: a,
                      line: node.startPosition.row + 1,
                    } as any)
                  : ({ kind: "Identifier", name: a, line: node.startPosition.row + 1 } as any),
              ),
            });
          } else if (argStr.match(/^([a-zA-Z_][a-zA-Z0-9_:]*)\s*\((.*)\)$/)) {
            const match = argStr.match(/^([a-zA-Z_][a-zA-Z0-9_:]*)\s*\((.*)\)$/);
            const innerArgs = splitArgs(match![2]).filter((s) => s);
            rawArgs.push({
              kind: "FunctionCall",
              line: node.startPosition.row + 1,
              callee: match![1],
              arguments: innerArgs.map((a) => {
                if (!isNaN(Number(a)))
                  return {
                    kind: "Literal",
                    type: "number",
                    value: Number(a),
                    line: node.startPosition.row + 1,
                  } as any;
                if (a.startsWith("'") && a.endsWith("'"))
                  return {
                    kind: "Literal",
                    type: "string",
                    value: a.slice(1, -1),
                    line: node.startPosition.row + 1,
                  } as any;
                if (a.startsWith('"') && a.endsWith('"'))
                  return {
                    kind: "Literal",
                    type: "string",
                    value: a.slice(1, -1),
                    line: node.startPosition.row + 1,
                  } as any;
                return { kind: "Identifier", name: a, line: node.startPosition.row + 1 } as any;
              }),
            });
          } else {
            rawArgs.push({
              kind: "Identifier",
              name: argStr,
              line: node.startPosition.row + 1,
            } as any);
          }
        }
        if (rawArgs.length > 0) constructorArgs = rawArgs;
      }
    } else {
      name = getDeclaratorName(declaratorNode);
    }

    let actualType = typeNode.text;
    let currDecl = declaratorNode;
    while (
      currDecl &&
      (currDecl.type === "pointer_declarator" || currDecl.type === "reference_declarator")
    ) {
      if (currDecl.type === "pointer_declarator") actualType += "*";
      if (currDecl.type === "reference_declarator") actualType += "&";
      currDecl = currDecl.child(1) as SyntaxNode;
    }

    declarations.push({
      kind: "VariableDeclaration",
      line: node.startPosition.row + 1,
      variableType: actualType,
      name,
      initializer,
      constructorArgs,
      isConst,
      isStatic,
    });
  }

  return declarations;
}

export { buildFunctionDeclaration, buildStructDeclaration, buildEnumDeclaration, buildTypeAlias };
