import type {
  IRStructDeclaration,
  IREnumDeclaration,
  IREnumMember,
  IRTypeAlias,
  IRFunctionDeclaration,
  IRExpression,
  IRNode,
} from "../IRNode";
import { logStepToConsole } from "../../utils/helpers";
import type { SyntaxNode, IRBuilder } from "../IRBuilder";

export function buildFunctionDeclaration(
  node: SyntaxNode,
  builder: IRBuilder,
): IRFunctionDeclaration {
  let declaratorNode = node.children.find(
    (c: any) =>
      c.type === "function_declarator" ||
      c.type === "pointer_declarator" ||
      c.type === "reference_declarator",
  );
  let typeNode: any = node.child(0);
  if (
    typeNode &&
    declaratorNode &&
    ((typeof typeNode.equals === "function"
      ? typeNode.equals(declaratorNode)
      : (typeNode as any).id === (declaratorNode as any).id) ||
      typeNode.type === declaratorNode.type)
  ) {
    typeNode = null;
  }
  const bodyNode = node.namedChildren.find((c: any) => c.type === "compound_statement");
  const initializerList = node.namedChildren.find((c: any) => c.type === "field_initializer_list");
  const initializerStatements: IRNode[] = [];
  if (initializerList) {
    for (const initNode of initializerList.namedChildren) {
      if (initNode.type === "field_initializer") {
        const fieldName = initNode.child(0)?.text;
        const argList = initNode.namedChildren.find((c: any) => c.type === "argument_list");
        if (fieldName && argList) {
          const args: IRExpression[] = [
            {
              kind: "Literal",
              type: "string",
              value: `"${fieldName}"`,
              line: initNode.startPosition.row + 1,
            } as any,
          ];
          for (const argNode of argList.namedChildren) {
            if (argNode.type === "(" || argNode.type === ")" || argNode.type === ",") continue;
            args.push(builder.buildExpression(argNode));
          }
          initializerStatements.push({
            kind: "ExpressionStatement",
            line: initNode.startPosition.row + 1,
            expression: {
              kind: "FunctionCall",
              line: initNode.startPosition.row + 1,
              callee: "__init_field",
              arguments: args,
            },
          });
        }
      }
    }
  }

  if (!declaratorNode || !bodyNode)
    throw new Error(
      `Compilation Error at line ${node.startPosition.row + 1}: Malformed function definition.`,
    );

  while (
    declaratorNode &&
    (declaratorNode.type === "pointer_declarator" || declaratorNode.type === "reference_declarator")
  ) {
    declaratorNode = declaratorNode.child(1) as SyntaxNode;
  }

  const functionName = declaratorNode?.child(0)?.text ?? "unknown";
  const parametersNode = declaratorNode?.child(1);
  const parameters: IRFunctionDeclaration["parameters"] = [];

  if (parametersNode?.type === "parameter_list") {
    for (const param of parametersNode.namedChildren) {
      if (param.type !== "parameter_declaration" && param.type !== "optional_parameter_declaration")
        continue;
      let paramTypeParts: string[] = [];
      let paramDeclNode: SyntaxNode | undefined;
      for (const c of param.namedChildren) {
        if (
          [
            "identifier",
            "pointer_declarator",
            "reference_declarator",
            "array_declarator",
            "function_declarator",
          ].includes(c.type)
        ) {
          paramDeclNode = c;
          break;
        }
        paramTypeParts.push(c.text);
      }
      let paramType = paramTypeParts.join(" ") || "unknown",
        paramName = "unknown",
        isReference = false,
        defaultValue: IRExpression | undefined;
      if (param.type === "optional_parameter_declaration") {
        const lastChild = param.namedChildren[param.namedChildren.length - 1];
        if (lastChild && lastChild !== paramDeclNode) {
          try {
            defaultValue = builder.buildExpression(lastChild);
          } catch {}
        }
      }
      while (
        paramDeclNode &&
        ["array_declarator", "pointer_declarator", "reference_declarator"].includes(
          paramDeclNode.type,
        )
      ) {
        if (paramDeclNode.type === "reference_declarator") {
          isReference = true;
          paramDeclNode = paramDeclNode.child(1) ?? undefined;
        } else if (paramDeclNode.type === "array_declarator") {
          paramType += "[]";
          paramDeclNode = paramDeclNode.child(0) ?? undefined;
        } else paramDeclNode = paramDeclNode.child(1) ?? undefined;
      }
      if (paramDeclNode) paramName = paramDeclNode.text;
      parameters.push({ type: paramType, name: paramName, isReference, defaultValue });
    }
  }

  const bodyBlock = builder.buildBlock(bodyNode);
  if (initializerStatements.length > 0) bodyBlock.statements.unshift(...initializerStatements);

  return {
    kind: "FunctionDeclaration",
    line: node.startPosition.row + 1,
    returnType: typeNode?.text ?? "void",
    name: functionName,
    parameters,
    body: bodyBlock,
  };
}

export function buildStructDeclaration(node: SyntaxNode, builder: IRBuilder): IRStructDeclaration {
  const nameNode = node.namedChildren.find((c: any) => c.type === "type_identifier");
  const name = nameNode?.text ?? "anonymous_struct";
  const bodyNode = node.namedChildren.find((c: any) => c.type === "field_declaration_list");
  const fields: IRStructDeclaration["fields"] = [];
  const constructors: IRFunctionDeclaration[] = [];
  const methods: IRFunctionDeclaration[] = [];

  if (bodyNode) {
    for (const field of bodyNode.namedChildren) {
      if (field.type === "function_definition" || field.type === "declaration") {
        const hasBody = field.namedChildren.some((c: any) => c.type === "compound_statement");
        if (hasBody) {
          try {
            const funcDecl = buildFunctionDeclaration(field, builder);
            if (funcDecl.name === name) constructors.push(funcDecl);
            else methods.push(funcDecl);
          } catch (e) {
            logStepToConsole(
              `[IRBuilder] Skipping struct method parse error: ${(e as Error).message}`,
            );
          }
          continue;
        }
      }
      if (field.type !== "field_declaration") continue;
      let type = field.child(0)?.text ?? "unknown";
      let decl = field.namedChildren.find((c: any) =>
        [
          "field_identifier",
          "array_declarator",
          "pointer_declarator",
          "reference_declarator",
        ].includes(c.type),
      );
      let fieldName = "unknown";
      if (decl) {
        let currDecl = decl;
        while (currDecl.type === "pointer_declarator" || currDecl.type === "reference_declarator") {
          if (currDecl.type === "pointer_declarator") type += "*";
          if (currDecl.type === "reference_declarator") type += "&";
          currDecl = currDecl.child(1) as SyntaxNode;
        }
        if (currDecl.type === "array_declarator") {
          type += "[]";
          currDecl = currDecl.child(0) as SyntaxNode;
        }
        fieldName = currDecl?.text ?? "unknown";
      }
      let defaultValue: IRExpression | undefined;
      const eqIndex = field.children.findIndex((c: any) => c.text === "=");
      if (eqIndex !== -1 && eqIndex + 1 < field.childCount) {
        const defaultNode = field.child(eqIndex + 1);
        if (defaultNode?.isNamed) {
          try {
            defaultValue = builder.buildExpression(defaultNode);
          } catch {}
        }
      }
      if (fieldName !== "unknown") fields.push({ name: fieldName, type, defaultValue });
    }
  }

  return {
    kind: "StructDeclaration",
    line: node.startPosition.row + 1,
    name,
    fields,
    constructors,
    methods,
  };
}

export function buildEnumDeclaration(node: SyntaxNode, builder: IRBuilder): IREnumDeclaration {
  const isClass = node.children.some((c: any) => c.text === "class" || c.text === "struct");
  const nameNode = node.namedChildren.find((c: any) => c.type === "type_identifier");
  const name = nameNode?.text ?? "anonymous_enum";
  let underlyingType = "int";
  const colonIdx = node.children.findIndex((c: any) => c.text === ":");
  if (colonIdx !== -1 && colonIdx + 1 < node.childCount) {
    const typeNode = node.child(colonIdx + 1);
    if (typeNode?.isNamed) underlyingType = typeNode.text;
  }
  const listNode = node.namedChildren.find((c: any) => c.type === "enumerator_list");
  const members: IREnumMember[] = [];
  if (listNode) {
    for (const enumerator of listNode.namedChildren) {
      if (enumerator.type !== "enumerator") continue;
      const memberName = enumerator.namedChildren.find((c: any) => c.type === "identifier")?.text;
      if (!memberName) continue;
      let value: IRExpression | undefined;
      const memberEqIdx = enumerator.children.findIndex((c: any) => c.text === "=");
      if (memberEqIdx !== -1 && memberEqIdx + 1 < enumerator.childCount) {
        const valNode = enumerator.child(memberEqIdx + 1);
        if (valNode?.isNamed) {
          try {
            value = builder.buildExpression(valNode);
          } catch {}
        }
      }
      members.push({ name: memberName, value });
    }
  }
  return {
    kind: "EnumDeclaration",
    line: node.startPosition.row + 1,
    name,
    isClass,
    underlyingType,
    members,
  };
}

export function buildTypeAlias(node: SyntaxNode): IRTypeAlias {
  let alias = "unknown",
    target = "unknown";
  if (node.type === "type_alias_declaration") {
    const nameNode = node.namedChildren.find((c: any) => c.type === "type_identifier");
    alias = nameNode?.text ?? "unknown";
    const eqIdx = node.children.findIndex((c: any) => c.text === "=");
    if (eqIdx !== -1 && eqIdx + 1 < node.childCount) {
      target = node.children
        .slice(eqIdx + 1)
        .filter((c: any) => c.type !== ";" && c.isNamed)
        .map((c: any) => c.text)
        .join(" ")
        .trim();
    }
  } else {
    const named = node.namedChildren,
      aliasNode = named[named.length - 1];
    alias = aliasNode?.text ?? "unknown";
    target = named
      .slice(0, -1)
      .map((c: any) => c.text)
      .join(" ")
      .trim();
  }
  return { kind: "TypeAlias", line: node.startPosition.row + 1, alias, target };
}
