import type {
  IRExpression,
  IRSizeofExpression,
  IRCommaExpression,
  UnaryOperator,
  BinaryOperator,
  UpdateOperator,
  IRAssignment,
  IRSubscriptExpression,
  IRTernaryExpression,
  IRFunctionCall,
} from "../../ir/IRNode";
import { logStepToConsole } from "../../utils/helpers";
import type { SyntaxNode, IRBuilder } from "../IRBuilder";
import { getDeclaratorName } from "./DeclarationBuilder";

export function buildExpression(node: SyntaxNode, builder: IRBuilder): IRExpression {
  switch (node.type) {
    case "number_literal": {
      const clean = node.text.replace(/[fFuUlL]+$/, "");
      return {
        kind: "Literal",
        line: node.startPosition.row + 1,
        valueType: "double",
        value: Number(clean),
      };
    }
    case "true":
      return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: true };
    case "false":
      return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: false };
    case "string_literal":
    case "raw_string_literal":
    case "concatenated_string": {
      const unescaped = node.text
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\r/g, "\r")
        .replace(/\\\\/g, "\\");
      return {
        kind: "Literal",
        line: node.startPosition.row + 1,
        valueType: "string",
        value: unescaped,
      };
    }
    case "char_literal": {
      const unescaped = node.text
        .slice(1, -1)
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\'/g, "'")
        .replace(/\\\\/g, "\\");
      return {
        kind: "Literal",
        line: node.startPosition.row + 1,
        valueType: "char",
        value: unescaped,
      };
    }
    case "null":
    case "nullptr":
      return {
        kind: "Literal",
        line: node.startPosition.row + 1,
        valueType: "nullptr",
        value: null,
      };
    case "identifier":
    case "qualified_identifier":
    case "type_identifier":
    case "primitive_type":
    case "sized_type_specifier":
    case "scoped_identifier":
    case "scoped_type_identifier":
    case "scoped_namespace_identifier":
    case "field_identifier":
      return { kind: "Identifier", line: node.startPosition.row + 1, name: node.text };
    case "this":
    case "this_expression":
      return { kind: "Identifier", line: node.startPosition.row + 1, name: "this" };
    case "sizeof_expression": {
      const operandNode = node.namedChildren[0];
      if (!operandNode)
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "int", value: 4 };
      const isTypeName = [
        "type_descriptor",
        "primitive_type",
        "type_identifier",
        "sized_type_specifier",
      ].includes(operandNode.type);
      if (isTypeName)
        return {
          kind: "SizeofExpression",
          line: node.startPosition.row + 1,
          operandType: operandNode.text,
        } as IRSizeofExpression;
      return {
        kind: "SizeofExpression",
        line: node.startPosition.row + 1,
        operandExpr: builder.buildExpression(operandNode),
      } as IRSizeofExpression;
    }
    case "comma_expression": {
      const left = node.namedChildren[0],
        right = node.namedChildren[node.namedChildren.length - 1];
      return {
        kind: "CommaExpression",
        line: node.startPosition.row + 1,
        left: builder.buildExpression(left),
        right: builder.buildExpression(right),
      } as IRCommaExpression;
    }
    case "unary_expression":
    case "pointer_expression":
      return {
        kind: "UnaryExpression",
        line: node.startPosition.row + 1,
        operator: node.child(0)?.text as UnaryOperator,
        argument: builder.buildExpression(node.child(1) as SyntaxNode),
      };
    case "shift_expression":
    case "binary_expression":
      return {
        kind: "BinaryExpression",
        line: node.startPosition.row + 1,
        left: builder.buildExpression(node.child(0) as SyntaxNode),
        operator: node.child(1)?.text as BinaryOperator,
        right: builder.buildExpression(node.child(2) as SyntaxNode),
      };
    case "update_expression": {
      const isPrefix = node.child(0)?.text === "++" || node.child(0)?.text === "--";
      return {
        kind: "UpdateExpression",
        line: node.startPosition.row + 1,
        operator: (isPrefix ? node.child(0)?.text : node.child(1)?.text) as UpdateOperator,
        argument: builder.buildExpression(node.child(isPrefix ? 1 : 0) as SyntaxNode),
        prefix: isPrefix,
      };
    }
    case "assignment_expression":
      return {
        kind: "Assignment",
        line: node.startPosition.row + 1,
        target: builder.buildExpression(node.child(0) as SyntaxNode),
        operator: (node.child(1)?.text ?? "=") as IRAssignment["operator"],
        value: builder.buildExpression(node.child(2) as SyntaxNode),
      };
    case "subscript_expression":
      return buildSubscriptExpression(node, builder);
    case "conditional_expression":
      return buildTernaryExpression(node, builder);
    case "initializer_list":
    case "parameter_pack_expansion":
    case "designated_initializer_list":
      return {
        kind: "InitializerList",
        line: node.startPosition.row + 1,
        elements: node.namedChildren
          .filter((c) => c.type !== "comment")
          .map((c) => builder.buildExpression(c)),
      };
    case "field_expression":
      return {
        kind: "MemberExpression",
        line: node.startPosition.row + 1,
        object: builder.buildExpression(node.child(0) as SyntaxNode),
        property: node.child(2)?.text ?? "unknown",
        arrow: node.child(1)?.text === "->",
      };
    case "cast_expression": {
      const castValueNode = node.namedChildren.find(
        (c) => c.type !== "type_descriptor" && c.type !== "abstract_type",
      );
      let innerExpr: IRExpression;
      if (castValueNode) innerExpr = builder.buildExpression(castValueNode);
      else {
        const last = node.namedChildren[node.namedChildren.length - 1];
        innerExpr = last
          ? builder.buildExpression(last)
          : { kind: "Literal", line: node.startPosition.row + 1, valueType: "int", value: 0 };
      }
      const stripped = node.text.replace(/\s+/g, "");
      if (stripped.startsWith("(int)") || stripped.startsWith("(long)"))
        return {
          kind: "FunctionCall",
          line: node.startPosition.row + 1,
          callee: "trunc",
          arguments: [innerExpr],
        } as IRFunctionCall;
      return innerExpr;
    }
    case "call_expression": {
      const calleeNode = node.child(0),
        argListNode = node.namedChildren.find((c) => c.type === "argument_list");
      const args = argListNode
        ? argListNode.namedChildren.map((c) => builder.buildExpression(c))
        : [];
      if (calleeNode?.type === "field_expression")
        return {
          kind: "MethodCall",
          line: node.startPosition.row + 1,
          object: builder.buildExpression(calleeNode.child(0) as SyntaxNode),
          method: calleeNode.child(2)?.text ?? "unknown",
          arguments: args,
          arrow: calleeNode.child(1)?.text === "->",
        };
      let calleeName = calleeNode?.text ?? "unknown";
      if (calleeNode?.type === "template_function")
        calleeName = calleeNode.child(0)?.text ?? calleeName;
      if (calleeName.startsWith("std::")) calleeName = calleeName.slice(5);
      return {
        kind: "FunctionCall",
        line: node.startPosition.row + 1,
        callee: calleeName,
        arguments: args,
      };
    }
    case "parenthesized_expression":
      return builder.buildExpression(node.namedChildren[0]);
    case "new_expression": {
      const typeNode = node.namedChildren[0],
        argListNode = node.namedChildren.find((c) => c.type === "argument_list");
      const args = argListNode
        ? argListNode.namedChildren.map((c) => builder.buildExpression(c))
        : [];
      return {
        kind: "NewExpression",
        line: node.startPosition.row + 1,
        typeName: typeNode?.text ?? "unknown",
        arguments: args,
      };
    }
    case "lambda_expression": {
      const lambdaBodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
      const parameters: { name: string; type: string }[] = [];
      const extractParams = (n: SyntaxNode) => {
        if (n.type === "parameter_declaration") {
          const pType =
            (n as any).childForFieldName?.("type")?.text ?? n.child(0)?.text ?? "unknown";
          let pDeclNode: SyntaxNode | undefined = (n as any).childForFieldName?.("declarator");
          if (!pDeclNode) {
            for (const c of n.namedChildren) {
              if (
                [
                  "identifier",
                  "pointer_declarator",
                  "reference_declarator",
                  "array_declarator",
                  "function_declarator",
                ].includes(c.type)
              ) {
                pDeclNode = c;
                break;
              }
            }
          }
          parameters.push({
            type: pType,
            name: pDeclNode ? getDeclaratorName(pDeclNode) : "unknown",
          });
        } else if (n.type !== "compound_statement") {
          n.namedChildren.forEach(extractParams);
        }
      };
      node.namedChildren.forEach(extractParams);
      return {
        kind: "LambdaExpression",
        line: node.startPosition.row + 1,
        parameters,
        body: lambdaBodyNode
          ? builder.buildBlock(lambdaBodyNode)
          : { kind: "Block", line: node.startPosition.row + 1, statements: [] },
      };
    }
    case "ERROR":
      throw new Error(
        `Compilation Error at line ${node.startPosition.row + 1}: Tree-sitter could not parse this expression.`,
      );
    case "delete_expression":
      return {
        kind: "FunctionCall",
        line: node.startPosition.row + 1,
        callee: "__delete",
        arguments: [builder.buildExpression(node.child(1) ?? node)],
      } as IRFunctionCall;
    case "alignof_expression":
    case "offsetof_expression":
    case "user_defined_literal":
    case "gnu_asm_expression":
    case "fold_expression":
      return { kind: "Literal", line: node.startPosition.row + 1, valueType: "int", value: 0 };
    case "requires_expression":
      return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: true };
    case "typeid_expression":
      return {
        kind: "Literal",
        line: node.startPosition.row + 1,
        valueType: "string",
        value: "typeid",
      };
    case "co_await_expression":
    case "compound_literal_expression":
    case "generic_expression":
    case "parameter_pack_expansion":
    case "pack_expansion_expression":
    case "sizeof_pack_expression":
    case "type_trait":
    case "reflect_expression":
    case "splice_expression":
    case "_alignof_expression":
    case "designated_initializer_list":
    case "designated_initializer_clause":
    case "designator":
    case "dynamic_exception_specification":
    case "type_parameter_pack_expansion":
    case "new_declarator":
    case "type_descriptor":
      return builder.buildExpression(node.namedChildren[0] ?? node.child(0) ?? node);
    case "condition_declaration":
      return builder.buildExpression(
        node.namedChildren.find(
          (c) => c.type !== "primitive_type" && c.type !== "type_identifier",
        ) ?? node,
      );
    default:
      logStepToConsole(
        `[IRBuilder.buildExpression] ❌ Unsupported expression type '${node.type}' at line ${node.startPosition.row + 1}. Substituting null. TEXT: '${node.text}'`,
      );
      return {
        kind: "Literal",
        line: node.startPosition.row + 1,
        valueType: "nullptr",
        value: null,
      };
  }
}

function buildSubscriptExpression(node: SyntaxNode, builder: IRBuilder): IRSubscriptExpression {
  const objectNode = node.namedChildren[0],
    indexNode = node.namedChildren[1];
  if (!objectNode || !indexNode)
    throw new Error(
      `Compilation Error at line ${node.startPosition.row + 1}: Malformed subscript expression — missing object or index.`,
    );
  const actualIndex =
    indexNode.type === "subscript_argument_list" ? indexNode.namedChildren[0] : indexNode;
  return {
    kind: "SubscriptExpression",
    line: node.startPosition.row + 1,
    object: builder.buildExpression(objectNode),
    index: builder.buildExpression(actualIndex),
  };
}

function buildTernaryExpression(node: SyntaxNode, builder: IRBuilder): IRTernaryExpression {
  return {
    kind: "TernaryExpression",
    line: node.startPosition.row + 1,
    condition: builder.buildExpression(node.namedChildren[0]),
    consequent: builder.buildExpression(node.namedChildren[1]),
    alternate: builder.buildExpression(node.namedChildren[2]),
  };
}
