import type {
  IRBlock,
  IRNode,
  IREmptyStatement,
  IRExpressionStatement,
  IRAssignment,
  IRCoutStatement,
  IRExpression
} from "../../ir/IRNode";
import { logStepToConsole } from "../../utils/helpers";
import type { SyntaxNode, IRBuilder } from "../IRBuilder";
import { buildVariableDeclaration } from "./DeclarationBuilder";
import {
  buildIfStatement,
  buildWhileStatement,
  buildDoWhileStatement,
  buildForStatement,
  buildForRangeStatement,
  buildSwitchStatement,
  buildTryStatement,
  buildThrowStatement,
  buildGotoStatement,
  buildLabeledStatement,
  buildReturnStatement,
  buildBreakStatement,
  buildContinueStatement,
} from "./ControlFlowBuilder";

export function buildBlock(node: SyntaxNode, builder: IRBuilder): IRBlock {
  const statements: IRNode[] = [];
  if (node.type !== "compound_statement") {
    const stmt = buildStatement(node, builder);
    if (Array.isArray(stmt)) statements.push(...stmt);
    else statements.push(stmt);
    return { kind: "Block", line: node.startPosition.row + 1, statements };
  }
  for (const child of node.namedChildren) {
    try {
      const stmt = buildStatement(child, builder);
      if (Array.isArray(stmt)) statements.push(...stmt);
      else statements.push(stmt);
    } catch (e) {
      logStepToConsole(
        `[IRBuilder.buildBlock] Skipping statement '${child.type}' at line ${child.startPosition.row + 1}: ${(e as Error).message}`,
      );
      statements.push({ kind: "EmptyStatement", line: child.startPosition.row + 1 });
    }
  }
  return { kind: "Block", line: node.startPosition.row + 1, statements };
}

export function buildStatement(node: SyntaxNode, builder: IRBuilder): IRNode | IRNode[] {
  switch (node.type) {
    case "ERROR":
    case "MISSING":
      throw new Error(
        `Syntax error at line ${node.startPosition.row + 1}: Unrecognized or incomplete code. Tree-Sitter failed to parse node text: "${node.text}"`,
      );
    case "declaration":
      return buildVariableDeclaration(node, builder);
    case "expression_statement":
      return buildExpressionStatement(node, builder);
    case "if_statement":
      return buildIfStatement(node, builder);
    case "while_statement":
      return buildWhileStatement(node, builder);
    case "do_statement":
      return buildDoWhileStatement(node, builder);
    case "for_statement":
      return buildForStatement(node, builder);
    case "for_range_loop":
      return buildForRangeStatement(node, builder);
    case "switch_statement":
      return buildSwitchStatement(node, builder);
    case "try_statement":
      return buildTryStatement(node, builder);
    case "throw_statement":
      return buildThrowStatement(node, builder);
    case "goto_statement":
      return buildGotoStatement(node, builder);
    case "labeled_statement":
      return buildLabeledStatement(node, builder);
    case "return_statement":
      return buildReturnStatement(node, builder);
    case "break_statement":
      return buildBreakStatement(node, builder);
    case "continue_statement":
      return buildContinueStatement(node, builder);
    case "comment":
    case "preproc_include":
    case "preproc_def":
    case "using_declaration":
      return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;
    case "compound_statement":
    case "function_try_block":
      return buildBlock(node, builder);
    case "type_alias_declaration":
    case "typedef_declaration":
      return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;
    case "co_yield_statement":
    case "co_return_statement":
    case "seh_leave_statement":
    case "seh_try_statement":
    case "seh_except_clause":
    case "seh_finally_clause":
    case "expansion_statement":
    case "preproc_if":
    case "preproc_ifdef":
    case "preproc_function_def":
    case "preproc_call":
    case "preproc_else":
    case "preproc_elif":
    case "preproc_elifdef":
    case "namespace_definition":
    case "concept_definition":
    case "namespace_alias_definition":
    case "static_assert_declaration":
    case "consteval_block_declaration":
    case "template_instantiation":
    case "module_declaration":
    case "export_declaration":
    case "import_declaration":
    case "global_module_fragment_declaration":
    case "private_module_fragment_declaration":
    case "linkage_specification":
    case "type_definition":
    case "alias_declaration":
    case "attributed_statement":
    case "union_specifier":
    case "old_style_function_definition":
      return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;
    default:
      logStepToConsole(
        `[IRBuilder.buildStatement] Skipping unsupported node type '${node.type}' at line ${node.startPosition.row + 1}.`,
      );
      return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;
  }
}

export function buildExpressionStatement(
  node: SyntaxNode,
  builder: IRBuilder,
): IRExpressionStatement | IRAssignment | IRCoutStatement {
  const exprNode = node.namedChildren[0];
  if (exprNode.type === "assignment_expression") {
    return {
      kind: "Assignment",
      line: node.startPosition.row + 1,
      target: builder.buildExpression(exprNode.child(0) as SyntaxNode),
      operator: (exprNode.child(1)?.text ?? "=") as IRAssignment["operator"],
      value: builder.buildExpression(exprNode.child(2) as SyntaxNode),
    };
  }
  if (exprNode.type === "shift_expression" || exprNode.type === "binary_expression") {
    let isCout = false,
      current = exprNode;
    while (current.type === "shift_expression" || current.type === "binary_expression") {
      if (current.child(0)?.text === "cout") {
        isCout = true;
        break;
      }
      const left = current.child(0);
      if (left) current = left as SyntaxNode;
      else break;
    }
    if (isCout) {
      const args: IRExpression[] = [];
      current = exprNode;
      while (current.type === "shift_expression" || current.type === "binary_expression") {
        const right = current.child(2);
        if (right) args.unshift(builder.buildExpression(right as SyntaxNode));
        current = current.child(0) as SyntaxNode;
      }
      return { kind: "CoutStatement", line: node.startPosition.row + 1, arguments: args };
    }
  }
  return {
    kind: "ExpressionStatement",
    line: node.startPosition.row + 1,
    expression: builder.buildExpression(exprNode),
  };
}


