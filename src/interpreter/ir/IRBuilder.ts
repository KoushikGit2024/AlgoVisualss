// src/interpreter/ir/IRBuilder.ts
import type {
  IRNode,
  IRProgram,
  IRFunctionDeclaration,
  IRBlock,
  IRVariableDeclaration,
  IRAssignment,
  IRExpressionStatement,
  IRIfStatement,
  IRWhileStatement,
  IRDoWhileStatement,
  IRForStatement,
  IRReturnStatement,
  IRBreakStatement,
  IRContinueStatement,
  IRCoutStatement,
  IRExpression,
  IRSubscriptExpression,
  IRTernaryExpression,
  BinaryOperator,
  UnaryOperator,
  UpdateOperator,
  IREmptyStatement,
  IRForRangeStatement,
} from "./IRNode";

// Dependency Boundary: Abstract representation of a Tree-sitter node.
export interface SyntaxNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  child(index: number): SyntaxNode | null;
  childCount: number;
  namedChildren: SyntaxNode[];
}

/**
 * The IRBuilder translates the messy, often unpredictable Tree-sitter AST 
 * into our clean, strictly-typed Intermediate Representation (IR).
 */
export class IRBuilder {
  
  // ─── Core Builder ────────────────────────────────────────────────────────────

  public build(rootNode: SyntaxNode): IRProgram {
    if (rootNode.type !== "translation_unit") {
      throw new Error("Root node must be a translation_unit");
    }

    const functions: IRFunctionDeclaration[] = [];
    for (const child of rootNode.namedChildren) {
      if (child.type === "function_definition") {
        functions.push(this.buildFunctionDeclaration(child));
      }
    }

    return {
      kind: "Program",
      line: rootNode.startPosition.row + 1,
      functions,
    };
  }

  private buildFunctionDeclaration(node: SyntaxNode): IRFunctionDeclaration {
    const typeNode = node.child(0);
    const declaratorNode = node.child(1);
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");

    if (!typeNode || !declaratorNode || !bodyNode) {
      throw new Error("Malformed function definition encountered by IRBuilder.");
    }

    const nameNode = declaratorNode.child(0);
    const parametersNode = declaratorNode.child(1);

    const parameters: { name: string; type: string }[] = [];
    if (parametersNode && parametersNode.type === "parameter_list") {
      for (const param of parametersNode.namedChildren) {
        if (param.type === "parameter_declaration") {
          let paramType = param.child(0)?.text || "unknown";
          let paramDeclNode = param.child(1);
          let paramName = "unknown";

          // Tree-sitter attaches pointer/array brackets to the variable name 
          // rather than the type. We unwrap it here so "arr[]" becomes "arr".
          while (paramDeclNode && (paramDeclNode.type === "array_declarator" || paramDeclNode.type === "pointer_declarator" || paramDeclNode.type === "reference_declarator")) {
              if (paramDeclNode.type === "array_declarator") paramType += "[]";
              paramDeclNode = paramDeclNode.child(0);
          }

          if (paramDeclNode) {
              paramName = paramDeclNode.text;
          }

          parameters.push({
            type: paramType,
            name: paramName,
          });
        }
      }
    }

    return {
      kind: "FunctionDeclaration",
      line: node.startPosition.row + 1,
      returnType: typeNode.text,
      name: nameNode?.text || "unknown",
      parameters,
      body: this.buildBlock(bodyNode),
    };
  }

  private buildBlock(node: SyntaxNode): IRBlock {
    const statements: IRNode[] = [];
    for (const child of node.namedChildren) {
      statements.push(this.buildStatement(child));
    }
    return {
      kind: "Block",
      line: node.startPosition.row + 1,
      statements,
    };
  }

  // ─── Statements ──────────────────────────────────────────────────────────────

  private buildStatement(node: SyntaxNode): IRNode {
    switch (node.type) {
      case "declaration":
        return this.buildVariableDeclaration(node);
      case "expression_statement":
        return this.buildExpressionStatement(node);
      case "if_statement":
        return this.buildIfStatement(node);
      case "while_statement":
        return this.buildWhileStatement(node);
      case "do_statement":
        return this.buildDoWhileStatement(node);
      case "for_statement":
        return this.buildForStatement(node);
      case "return_statement":
        return this.buildReturnStatement(node);
      case "break_statement":
        return this.buildBreakStatement(node);
      case "continue_statement":
        return this.buildContinueStatement(node);
      case "comment":
        return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;
      case "for_range_loop":
        return this.buildForRangeStatement(node);
      default:
        throw new Error(`Unsupported AST statement type: ${node.type} at line ${node.startPosition.row + 1}`);
    }
  }

  private buildVariableDeclaration(node: SyntaxNode): IRVariableDeclaration {
    const typeNode = node.child(0);
    const declaratorNode = node.child(1);

    if (!typeNode || !declaratorNode) {
       throw new Error("Malformed variable declaration");
    }

    let nameNode = declaratorNode.child(0);
    const equalNode = declaratorNode.child(1);
    const valueNode = declaratorNode.child(2);

    let varType = typeNode.text;

    // Same unwrap logic as parameters: strip brackets off the identifier!
    while (nameNode && (nameNode.type === "array_declarator" || nameNode.type === "pointer_declarator" || nameNode.type === "reference_declarator")) {
        if (nameNode.type === "array_declarator") {
            varType += "[]"; 
        }
        nameNode = nameNode.child(0);
    }

    let initializer: IRExpression | undefined = undefined;
    if (equalNode?.text === "=" && valueNode) {
       initializer = this.buildExpression(valueNode);
    }

    return {
      kind: "VariableDeclaration",
      line: node.startPosition.row + 1,
      variableType: varType,
      name: nameNode?.text || "unknown",
      initializer,
    };
  }

  private buildExpressionStatement(node: SyntaxNode): IRExpressionStatement | IRAssignment | IRCoutStatement {
    const exprNode = node.namedChildren[0];
    
    // Natively escalate assignments into full-blown statements 
    // rather than keeping them as generic expressions.
    if (exprNode.type === "assignment_expression") {
      return {
        kind: "Assignment",
        line: node.startPosition.row + 1,
        target: this.buildExpression(exprNode.child(0) as SyntaxNode),
        operator: exprNode.child(1)?.text as any || "=",
        value: this.buildExpression(exprNode.child(2) as SyntaxNode),
      };
    }

    // --- BULLETPROOF COUT DETECTION ---
    // Tree-sitter might parse standard output as a "shift_expression" OR a "binary_expression".
    // We walk down the left side to see if the root operand is exactly "cout".
    if (exprNode.type === "shift_expression" || exprNode.type === "binary_expression") {
        let isCout = false;
        let current = exprNode;

        while (current.type === "shift_expression" || current.type === "binary_expression") {
            const leftChild = current.child(0);
            if (leftChild && leftChild.text === "cout") {
                isCout = true;
                break;
            }
            if (leftChild) {
                current = leftChild as SyntaxNode;
            } else {
                break;
            }
        }

        if (isCout) {
           const args: IRExpression[] = [];
           current = exprNode;
           
           // Now walk back down and grab everything on the right side of the << operators
           while (current.type === "shift_expression" || current.type === "binary_expression") {
              const rightChild = current.child(2);
              if (rightChild) {
                  args.unshift(this.buildExpression(rightChild as SyntaxNode));
              }
              current = current.child(0) as SyntaxNode;
           }

           return {
             kind: "CoutStatement",
             line: node.startPosition.row + 1,
             arguments: args
           };
        }
    }
    // ------------------------------------------------

    return {
      kind: "ExpressionStatement",
      line: node.startPosition.row + 1,
      expression: this.buildExpression(exprNode),
    };
  }

  private buildIfStatement(node: SyntaxNode): IRIfStatement {
    const conditionNode = node.namedChildren.find(
      (c) => c.type === "condition_clause" || c.type === "parenthesized_expression"
    );
    
    const conditionIndex = node.namedChildren.indexOf(conditionNode as any);
    const consequentNode = node.namedChildren[conditionIndex + 1];
    
    const elseClause = node.namedChildren.find((c) => c.type === "else_clause");
    const alternateNode = elseClause ? elseClause.namedChildren[0] : undefined;

    if (!conditionNode || !consequentNode) {
      throw new Error(`Malformed if statement at line ${node.startPosition.row + 1}`);
    }

    // If the user forgot braces `if (true) x = 1;`, wrap it in a block anyway!
    const wrapInBlock = (n: SyntaxNode): IRBlock => {
      if (n.type === "compound_statement") {
        return this.buildBlock(n);
      }
      return {
        kind: "Block",
        line: n.startPosition.row + 1,
        statements: [this.buildStatement(n)]
      };
    };

    const conditionExpr = conditionNode.type === "condition_clause" 
      ? conditionNode.namedChildren[0] 
      : conditionNode;

    return {
      kind: "IfStatement",
      line: node.startPosition.row + 1,
      condition: this.buildExpression(conditionExpr),
      consequent: wrapInBlock(consequentNode),
      alternate: alternateNode ? wrapInBlock(alternateNode) : undefined,
    };
  }

  private buildWhileStatement(node: SyntaxNode): IRWhileStatement {
    const conditionNode = node.namedChildren.find((c) => c.type === "condition_clause")?.namedChildren[0] 
                          || node.namedChildren.find((c) => c.type === "parenthesized_expression");
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");

    if (!conditionNode || !bodyNode) throw new Error("Malformed while statement");

    return {
      kind: "WhileStatement",
      line: node.startPosition.row + 1,
      condition: this.buildExpression(conditionNode),
      body: this.buildBlock(bodyNode),
    };
  }

  private buildDoWhileStatement(node: SyntaxNode): IRDoWhileStatement {
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
    const conditionNode = node.namedChildren.find((c) => c.type === "parenthesized_expression");

    if (!conditionNode || !bodyNode) throw new Error("Malformed do-while statement");

    return {
      kind: "DoWhileStatement",
      line: node.startPosition.row + 1,
      body: this.buildBlock(bodyNode),
      condition: this.buildExpression(conditionNode),
    };
  }

  private buildForStatement(node: SyntaxNode): IRForStatement {
    const initNode = node.namedChildren[0];
    const conditionNode = node.namedChildren[1];
    const updateNode = node.namedChildren[2];
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");

    if (!bodyNode) throw new Error("Malformed for statement");

    let init: IRVariableDeclaration | IRAssignment | undefined;
    if (initNode.type === "declaration") {
      init = this.buildVariableDeclaration(initNode);
    } else if (initNode.type === "assignment_expression") {
       init = {
         kind: "Assignment",
         line: initNode.startPosition.row + 1,
         target: this.buildExpression(initNode.child(0) as SyntaxNode),
         operator: initNode.child(1)?.text as any || "=",
         value: this.buildExpression(initNode.child(2) as SyntaxNode)
       };
    }

    let update: IRAssignment | IRExpression | undefined;
    if (updateNode.type === "assignment_expression") {
      update = {
         kind: "Assignment",
         line: updateNode.startPosition.row + 1,
         target: this.buildExpression(updateNode.child(0) as SyntaxNode),
         operator: updateNode.child(1)?.text as any || "=",
         value: this.buildExpression(updateNode.child(2) as SyntaxNode)
       };
    } else {
      update = this.buildExpression(updateNode);
    }

    return {
      kind: "ForStatement",
      line: node.startPosition.row + 1,
      init,
      condition: conditionNode ? this.buildExpression(conditionNode) : undefined,
      update,
      body: this.buildBlock(bodyNode),
    };
  }

  private buildForRangeStatement(node: SyntaxNode): IRForRangeStatement {
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
    if (!bodyNode) throw new Error("Malformed for-range statement");

    // Tree-sitter varies wildly here. Usually, the "collection" (e.g. `arr`) 
    // is the named child immediately preceding the body block.
    const bodyIndex = node.namedChildren.indexOf(bodyNode as any);
    const collectionNode = node.namedChildren[bodyIndex - 1];

    let varType = "auto";
    let varName = "unknown";
    const firstNode = node.namedChildren[0];
    
    if (firstNode.type === "declaration") {
       varType = firstNode.child(0)?.text || "auto";
       varName = firstNode.child(1)?.text || "unknown";
    } else {
       varType = firstNode.text;
       varName = node.namedChildren[1].text;
    }

    return {
      kind: "ForRangeStatement",
      line: node.startPosition.row + 1,
      iteratorType: varType,
      iteratorName: varName,
      collection: this.buildExpression(collectionNode),
      body: this.buildBlock(bodyNode),
    };
  }

  private buildReturnStatement(node: SyntaxNode): IRReturnStatement {
    const argNode = node.namedChildren[0];
    return {
      kind: "ReturnStatement",
      line: node.startPosition.row + 1,
      argument: argNode ? this.buildExpression(argNode) : undefined,
    };
  }

  private buildBreakStatement(node: SyntaxNode): IRBreakStatement {
    return { kind: "BreakStatement", line: node.startPosition.row + 1 };
  }

  private buildContinueStatement(node: SyntaxNode): IRContinueStatement {
    return { kind: "ContinueStatement", line: node.startPosition.row + 1 };
  }

  // ─── Expressions ─────────────────────────────────────────────────────────────

  private buildExpression(node: SyntaxNode): IRExpression {
    switch (node.type) {
      case "number_literal":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "double", value: Number(node.text) };
      case "true":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: true };
      case "false":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: false };
      case "string_literal":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "string", value: node.text.slice(1, -1) };
      case "char_literal":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "char", value: node.text.slice(1, -1) };
      case "null":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "nullptr", value: null };
      case "identifier":
        return { kind: "Identifier", line: node.startPosition.row + 1, name: node.text };
      
      case "subscript_expression":
        return this.buildSubscriptExpression(node);
      case "conditional_expression":
        return this.buildTernaryExpression(node);

      case "unary_expression":
      case "pointer_expression":
        return {
          kind: "UnaryExpression",
          line: node.startPosition.row + 1,
          operator: node.child(0)?.text as UnaryOperator,
          argument: this.buildExpression(node.child(1) as SyntaxNode),
        };
      case "binary_expression":
        return {
          kind: "BinaryExpression",
          line: node.startPosition.row + 1,
          left: this.buildExpression(node.child(0) as SyntaxNode),
          operator: node.child(1)?.text as BinaryOperator,
          right: this.buildExpression(node.child(2) as SyntaxNode),
        };
      case "call_expression": {
        const calleeNode = node.child(0);
        const argListNode = node.namedChildren.find((c) => c.type === "argument_list");
        const args = argListNode ? argListNode.namedChildren.map((c) => this.buildExpression(c)) : [];
        return {
          kind: "FunctionCall",
          line: node.startPosition.row + 1,
          callee: calleeNode?.text || "unknown",
          arguments: args,
        };
      }
      case "parenthesized_expression":
        return this.buildExpression(node.namedChildren[0]);
      case "update_expression": {
        const isPrefix = node.child(0)?.text === "++" || node.child(0)?.text === "--";
        const operator = (isPrefix ? node.child(0)?.text : node.child(1)?.text) as UpdateOperator;
        const argumentNode = node.child(isPrefix ? 1 : 0) as SyntaxNode;

        return {
          kind: "UpdateExpression",
          line: node.startPosition.row + 1,
          operator,
          argument: this.buildExpression(argumentNode),
          prefix: isPrefix,
        };
      }
      case "initializer_list": {
        const elements: IRExpression[] = [];
        // Extract values inside array initializers {1, 2, 3}.
        // We only grab namedChildren to safely ignore the brace syntax tokens.
        for (const child of node.namedChildren) {
             elements.push(this.buildExpression(child));
        }
        return {
          kind: "InitializerList",
          line: node.startPosition.row + 1,
          elements,
        };
      }
      default:
        throw new Error(`Unsupported expression type: ${node.type} at line ${node.startPosition.row + 1}`);
    }
  }

  private buildSubscriptExpression(node: SyntaxNode): IRSubscriptExpression {
    const objectNode = node.namedChildren[0];
    const indexNode = node.namedChildren[1];

    if (!objectNode || !indexNode) {
      throw new Error("Malformed subscript expression (array access).");
    }

    // Modern tree-sitter wraps the index inside `[i]` as a "subscript_argument_list".
    // We have to pierce through that wrapper to get the actual `i` expression!
    let actualIndexNode = indexNode;
    if (indexNode.type === "subscript_argument_list") {
       actualIndexNode = indexNode.namedChildren[0];
    }

    return {
      kind: "SubscriptExpression",
      line: node.startPosition.row + 1,
      object: this.buildExpression(objectNode),
      index: this.buildExpression(actualIndexNode),
    };
  }

  private buildTernaryExpression(node: SyntaxNode): IRTernaryExpression {
    return {
      kind: "TernaryExpression",
      line: node.startPosition.row + 1,
      condition: this.buildExpression(node.namedChildren[0]),
      consequent: this.buildExpression(node.namedChildren[1]),
      alternate: this.buildExpression(node.namedChildren[2]),
    };
  }
}