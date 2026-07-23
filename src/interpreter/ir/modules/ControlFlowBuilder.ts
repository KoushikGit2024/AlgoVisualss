import type {
  IRBlock,
  IRNode,
  IRIfStatement,
  IRWhileStatement,
  IRDoWhileStatement,
  IRForStatement,
  IRForRangeStatement,
  IRSwitchStatement,
  IRCaseClause,
  IRTryStatement,
  IRCatchClause,
  IRThrowStatement,
  IRGotoStatement,
  IRLabeledStatement,
  IRReturnStatement,
  IRBreakStatement,
  IRContinueStatement,
  IRAssignment,
} from "../IRNode";
import type { SyntaxNode, IRBuilder } from "../IRBuilder";
import { getDeclaratorName, buildVariableDeclaration } from "./DeclarationBuilder";
import { buildBlock, buildStatement, buildExpressionStatement } from "./StatementBuilder";

export function wrapInBlock(n: SyntaxNode, builder: IRBuilder): IRBlock {
  if (n.type === "compound_statement") return buildBlock(n, builder);
  const stmt = buildStatement(n, builder);
  return {
    kind: "Block",
    line: n.startPosition.row + 1,
    statements: Array.isArray(stmt) ? stmt : [stmt],
  };
}

export function buildIfStatement(node: SyntaxNode, builder: IRBuilder): IRIfStatement {
  const conditionNode = node.namedChildren.find(
    (c: any) => c.type === "condition_clause" || c.type === "parenthesized_expression",
  );
  const conditionIndex = node.namedChildren.indexOf(conditionNode as SyntaxNode);
  const consequentNode = node.namedChildren[conditionIndex + 1];
  const elseClause = node.namedChildren.find((c: any) => c.type === "else_clause");
  const alternateNode = elseClause?.namedChildren[0];
  if (!conditionNode || !consequentNode)
    throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed if statement.`);
  const conditionExpr =
    conditionNode.type === "condition_clause" ? conditionNode.namedChildren[0] : conditionNode;
  return {
    kind: "IfStatement",
    line: node.startPosition.row + 1,
    condition: builder.buildExpression(conditionExpr),
    consequent: wrapInBlock(consequentNode, builder),
    alternate: alternateNode ? wrapInBlock(alternateNode, builder) : undefined,
  };
}

export function buildWhileStatement(node: SyntaxNode, builder: IRBuilder): IRWhileStatement {
  let conditionNode =
    (node as any).childForFieldName?.("condition") ??
    node.namedChildren.find(
      (c: any) => c.type === "condition_clause" || c.type === "parenthesized_expression",
    );
  if (conditionNode?.type === "condition_clause") conditionNode = conditionNode.namedChildren[0];
  let bodyNode =
    ((node as any).childForFieldName?.("body") as SyntaxNode | undefined) ??
    node.namedChildren.find(
      (c: any) => c.type === "compound_statement" || c.type === "expression_statement",
    ) ??
    node.namedChildren[node.namedChildren.length - 1];
  if (!conditionNode || !bodyNode)
    throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed while loop.`);
  return {
    kind: "WhileStatement",
    line: node.startPosition.row + 1,
    condition: builder.buildExpression(conditionNode),
    body: wrapInBlock(bodyNode, builder),
  };
}

export function buildDoWhileStatement(node: SyntaxNode, builder: IRBuilder): IRDoWhileStatement {
  let bodyNode =
    ((node as any).childForFieldName?.("body") as SyntaxNode | undefined) ??
    node.namedChildren.find(
      (c: any) => c.type === "compound_statement" || c.type === "expression_statement",
    );
  let conditionNode =
    (node as any).childForFieldName?.("condition") ??
    node.namedChildren.find((c: any) => c.type === "parenthesized_expression");
  if (conditionNode?.type === "condition_clause") conditionNode = conditionNode.namedChildren[0];
  if (!conditionNode || !bodyNode)
    throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed do-while loop.`);
  return {
    kind: "DoWhileStatement",
    line: node.startPosition.row + 1,
    body: wrapInBlock(bodyNode, builder),
    condition: builder.buildExpression(conditionNode),
  };
}

export function buildForStatement(node: SyntaxNode, builder: IRBuilder): IRForStatement {
  const nativeNode = node as any;
  const initNode = nativeNode.childForFieldName?.("initializer") as SyntaxNode | undefined;
  const conditionNode = nativeNode.childForFieldName?.("condition") as SyntaxNode | undefined;
  const updateNode = nativeNode.childForFieldName?.("update") as SyntaxNode | undefined;
  let bodyNode =
    (nativeNode.childForFieldName?.("body") as SyntaxNode | undefined) ??
    node.namedChildren[node.namedChildren.length - 1];
  if (!bodyNode)
    throw new Error(
      `Syntax Error at line ${node.startPosition.row + 1}: Malformed for loop — missing body.`,
    );

  let init: IRForStatement["init"];
  if (initNode) {
    if (initNode.type === "declaration") init = buildVariableDeclaration(initNode, builder);
    else if (initNode.type === "assignment_expression") {
      init = {
        kind: "Assignment",
        line: initNode.startPosition.row + 1,
        target: builder.buildExpression(initNode.child(0) as SyntaxNode),
        operator: (initNode.child(1)?.text ?? "=") as IRAssignment["operator"],
        value: builder.buildExpression(initNode.child(2) as SyntaxNode),
      };
    } else init = buildExpressionStatement(initNode, builder) as any;
  }

  let update: IRForStatement["update"];
  if (updateNode) {
    if (updateNode.type === "assignment_expression") {
      update = {
        kind: "Assignment",
        line: updateNode.startPosition.row + 1,
        target: builder.buildExpression(updateNode.child(0) as SyntaxNode),
        operator: (updateNode.child(1)?.text ?? "=") as IRAssignment["operator"],
        value: builder.buildExpression(updateNode.child(2) as SyntaxNode),
      };
    } else update = builder.buildExpression(updateNode);
  }
  return {
    kind: "ForStatement",
    line: node.startPosition.row + 1,
    init,
    condition: conditionNode ? builder.buildExpression(conditionNode) : undefined,
    update,
    body: wrapInBlock(bodyNode, builder),
  };
}

export function buildForRangeStatement(node: SyntaxNode, builder: IRBuilder): IRForRangeStatement {
  let bodyNode =
    ((node as any).childForFieldName?.("body") as SyntaxNode | undefined) ??
    node.namedChildren[node.namedChildren.length - 1];
  let collectionNode = (node as any).childForFieldName?.("right") as SyntaxNode | undefined;
  if (!collectionNode) {
    const bodyIndex = node.namedChildren.findIndex((c: any) => (c as any).id === (bodyNode as any)?.id);
    collectionNode = node.namedChildren[bodyIndex - 1];
  }
  if (!bodyNode || !collectionNode)
    throw new Error(
      `Syntax Error at line ${node.startPosition.row + 1}: Malformed range-based for loop.`,
    );
  let varType = "auto",
    varName = "unknown",
    isConst = false;
  const firstNode = node.namedChildren[0];
  if (firstNode?.type === "declaration") {
    let typeParts: string[] = [],
      declaratorChild: SyntaxNode | undefined;
    for (const c of firstNode.namedChildren) {
      if (
        [
          "identifier",
          "pointer_declarator",
          "reference_declarator",
          "array_declarator",
          "function_declarator",
          "structured_binding_declarator",
        ].includes(c.type)
      ) {
        declaratorChild = c;
        break;
      }
      typeParts.push(c.text);
    }
    varType = typeParts.join(" ") || "auto";
    isConst = typeParts.includes("const");
    varName = declaratorChild ? getDeclaratorName(declaratorChild) : "unknown";
  } else {
    let typeParts: string[] = [],
      declaratorChild: SyntaxNode | undefined;
    for (const c of node.namedChildren) {
      if ((c as any).id === (collectionNode as any).id) break;
      if (
        [
          "identifier",
          "pointer_declarator",
          "reference_declarator",
          "array_declarator",
          "function_declarator",
          "structured_binding_declarator",
        ].includes(c.type)
      ) {
        declaratorChild = c;
        break;
      }
      typeParts.push(c.text);
    }
    varType = typeParts.join(" ") || "auto";
    isConst = typeParts.includes("const");
    varName = declaratorChild ? getDeclaratorName(declaratorChild) : "unknown";
  }
  return {
    kind: "ForRangeStatement",
    line: node.startPosition.row + 1,
    iteratorType: varType,
    iteratorName: varName,
    isConst,
    collection: builder.buildExpression(collectionNode),
    body: wrapInBlock(bodyNode, builder),
  };
}

export function buildSwitchStatement(node: SyntaxNode, builder: IRBuilder): IRSwitchStatement {
  const conditionNode = node.child(1)?.child(1),
    bodyNode = node.namedChildren.find((c: any) => c.type === "compound_statement");
  if (!conditionNode || !bodyNode)
    throw new Error(
      `Compilation Error at line ${node.startPosition.row + 1}: Malformed switch statement.`,
    );
  const cases: IRCaseClause[] = [];
  for (const child of bodyNode.namedChildren) {
    if (child.type !== "case_statement") continue;
    const isDefault = child.child(0)?.text === "default";
    let valueNode: SyntaxNode | undefined,
      statementStartIndex = 0;
    if (isDefault) statementStartIndex = 2;
    else {
      valueNode = child.namedChildren[0];
      statementStartIndex = child.children.findIndex((c: any) => c.text === ":") + 1;
    }
    const caseStatements: IRNode[] = [];
    for (let i = statementStartIndex; i < child.childCount; i++) {
      const c = child.child(i);
      if (c?.isNamed) {
        try {
          const stmt = buildStatement(c, builder);
          if (Array.isArray(stmt)) caseStatements.push(...stmt);
          else caseStatements.push(stmt);
        } catch {}
      }
    }
    cases.push({
      kind: "CaseClause",
      line: child.startPosition.row + 1,
      isDefault,
      value: valueNode ? builder.buildExpression(valueNode) : undefined,
      statements: caseStatements,
    });
  }
  return {
    kind: "SwitchStatement",
    line: node.startPosition.row + 1,
    condition: builder.buildExpression(conditionNode),
    cases,
  };
}

export function buildTryStatement(node: SyntaxNode, builder: IRBuilder): IRTryStatement {
  const bodyNode = node.namedChildren.find((c: any) => c.type === "compound_statement");
  if (!bodyNode)
    throw new Error(
      `Syntax Error at line ${node.startPosition.row + 1}: Malformed try statement — missing body.`,
    );
  const handlers: IRCatchClause[] = [];
  for (const child of node.namedChildren)
    if (child.type === "catch_clause") handlers.push(buildCatchClause(child, builder));
  return {
    kind: "TryStatement",
    line: node.startPosition.row + 1,
    body: buildBlock(bodyNode, builder),
    handlers,
  };
}

function buildCatchClause(node: SyntaxNode, builder: IRBuilder): IRCatchClause {
  const bodyNode = node.namedChildren.find((c: any) => c.type === "compound_statement");
  if (!bodyNode)
    throw new Error(
      `Syntax Error at line ${node.startPosition.row + 1}: Malformed catch clause — missing body.`,
    );
  const isCatchAll = node.children.some((c: any) => c.text === "...");
  if (isCatchAll)
    return {
      kind: "CatchClause",
      line: node.startPosition.row + 1,
      catchAll: true,
      body: buildBlock(bodyNode, builder),
    };
  const paramNode = node.namedChildren.find((c: any) => c.type === "parameter_declaration");
  let catchType: string | undefined, catchParam: string | undefined;
  if (paramNode) {
    const typeParts: string[] = [];
    let declNode: SyntaxNode | undefined;
    for (const c of paramNode.namedChildren) {
      if (["identifier", "pointer_declarator", "reference_declarator"].includes(c.type)) {
        declNode = c;
        break;
      }
      typeParts.push(c.text);
    }
    catchType = typeParts.join(" ").trim() || undefined;
    catchParam = declNode ? getDeclaratorName(declNode) : undefined;
  }
  return {
    kind: "CatchClause",
    line: node.startPosition.row + 1,
    catchType,
    catchParam,
    catchAll: false,
    body: buildBlock(bodyNode, builder),
  };
}

export function buildThrowStatement(node: SyntaxNode, builder: IRBuilder): IRThrowStatement {
  const argNode = node.namedChildren[0];
  return {
    kind: "ThrowStatement",
    line: node.startPosition.row + 1,
    argument: argNode ? builder.buildExpression(argNode) : undefined,
  };
}

export function buildGotoStatement(node: SyntaxNode, _builder: IRBuilder): IRGotoStatement {
  const labelNode = node.namedChildren.find((c: any) => c.type === "identifier");
  return {
    kind: "GotoStatement",
    line: node.startPosition.row + 1,
    label: labelNode?.text ?? "unknown",
  };
}

export function buildLabeledStatement(node: SyntaxNode, builder: IRBuilder): IRLabeledStatement {
  const labelNode = node.namedChildren.find((c: any) => c.type === "identifier");
  const statementNode = node.namedChildren.find((c: any) => c.type !== "identifier");
  if (!statementNode)
    return {
      kind: "LabeledStatement",
      line: node.startPosition.row + 1,
      label: labelNode?.text ?? "unknown",
      statement: { kind: "EmptyStatement", line: node.startPosition.row + 1 },
    };
  const stmt = buildStatement(statementNode, builder);
  return {
    kind: "LabeledStatement",
    line: node.startPosition.row + 1,
    label: labelNode?.text ?? "unknown",
    statement: Array.isArray(stmt)
      ? (stmt[0] ?? { kind: "EmptyStatement", line: node.startPosition.row + 1 })
      : stmt,
  };
}

export function buildReturnStatement(node: SyntaxNode, builder: IRBuilder): IRReturnStatement {
  const argNode = node.namedChildren[0];
  return {
    kind: "ReturnStatement",
    line: node.startPosition.row + 1,
    argument: argNode ? builder.buildExpression(argNode) : undefined,
  };
}

export function buildBreakStatement(node: SyntaxNode, _builder: IRBuilder): IRBreakStatement {
  return { kind: "BreakStatement", line: node.startPosition.row + 1 };
}
export function buildContinueStatement(node: SyntaxNode, _builder: IRBuilder): IRContinueStatement {
  return { kind: "ContinueStatement", line: node.startPosition.row + 1 };
}
