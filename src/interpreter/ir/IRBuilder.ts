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

/**
 * Dependency Boundary: Abstract representation of a Tree-sitter node.
 */
export interface SyntaxNode {
  type: string;
  text: string;
  startPosition: { row: number; column: number };
  child(index: number): SyntaxNode | null;
  childCount: number;
  namedChildren: SyntaxNode[];
}

/**
 * The `IRBuilder` serves as the crucial translation layer between the raw Tree-sitter AST
 * and the engine's strictly-typed Intermediate Representation (IR). It normalizes
 * C++ syntax quirks (e.g., inline blocks, pointer wrappers) into a predictable schema.
 */
export class IRBuilder {
  
  // ─── Core Builder ────────────────────────────────────────────────────────────

  /**
   * Initializes the translation process from the root translation unit.
   */
  public build(rootNode: SyntaxNode): IRProgram {
    if (rootNode.type !== "translation_unit") {
      throw new Error("Compilation Error: Root node must be a translation_unit");
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

  /**
   * Parses function declarations, securely unwrapping return type modifiers.
   */
  private buildFunctionDeclaration(node: SyntaxNode): IRFunctionDeclaration {
    const typeNode = node.child(0);
    let declaratorNode = node.child(1);
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");

    if (!typeNode || !declaratorNode || !bodyNode) {
      throw new Error(`Compilation Error at line ${node.startPosition.row + 1}: Malformed function definition.`);
    }

    // ─── POINTER & REFERENCE UNWRAPPING ──────────────────────────────────────────
    // Tree-Sitter wraps functions returning pointers/references (e.g., BSTNode* insert) 
    // inside modifier blocks. We must recursively drill down to the core declarator.
    while (declaratorNode && (declaratorNode.type === "pointer_declarator" || declaratorNode.type === "reference_declarator")) {
      declaratorNode = declaratorNode.child(1) as SyntaxNode;
    }

    const functionNameNode = declaratorNode?.child(0);
    const functionName = functionNameNode?.text || "unknown";
    const parametersNode = declaratorNode?.child(1);

    const parameters: { name: string; type: string }[] = [];
    
    if (parametersNode && parametersNode.type === "parameter_list") {
      for (const param of parametersNode.namedChildren) {
        if (param.type === "parameter_declaration") {
          let paramType = param.child(0)?.text || "unknown";
          let paramDeclNode = param.child(1);
          let paramName = "unknown";

          // Unpack pointer/array brackets attached to the variable name
          while (paramDeclNode && (paramDeclNode.type === "array_declarator" || paramDeclNode.type === "pointer_declarator" || paramDeclNode.type === "reference_declarator")) {
            if (paramDeclNode.type === "array_declarator") {
              paramType += "[]";
              paramDeclNode = paramDeclNode.child(0); 
            } else {
              paramDeclNode = paramDeclNode.child(1); 
            }
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
      returnType: typeNode?.text || "unknown",
      name: functionName,
      parameters,
      body: this.buildBlock(bodyNode),
    };
  }

  /**
   * Constructs a strictly scoped execution block `{ ... }`.
   */
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
      case "ERROR":
        throw new Error(
          `Syntax Error at line ${node.startPosition.row + 1}: Unexpected token sequence. ` +
          `Verify C++ syntax, missing semicolons, or mismatched braces.`
        );
      default:
        throw new Error(`Compilation Error: Unsupported AST statement type '${node.type}' at line ${node.startPosition.row + 1}`);
    }
  }

  private buildVariableDeclaration(node: SyntaxNode): IRVariableDeclaration {
    const typeNode = node.child(0);
    const declaratorNode = node.child(1);

    if (!typeNode || !declaratorNode) {
       throw new Error(`Compilation Error at line ${node.startPosition.row + 1}: Malformed variable declaration.`);
    }

    let name = "unknown";
    let initializer: IRExpression | undefined = undefined;

    // Condition A: Explicit assignment initializer (e.g., int x = 5;)
    if (declaratorNode.type === "init_declarator") {
      const coreDeclarator = declaratorNode.child(0) as SyntaxNode;
      name = this.getDeclaratorName(coreDeclarator);
      
      const valueNode = declaratorNode.child(2);
      if (valueNode) {
        initializer = this.buildExpression(valueNode);
      }
    } else {
      // Condition B: Pure declaration (e.g., vector<int> list;)
      name = this.getDeclaratorName(declaratorNode);
    }

    return {
      kind: "VariableDeclaration",
      line: node.startPosition.row + 1,
      variableType: typeNode.text,
      name,
      initializer,
    };
  }

  /**
   * Recursively pierces through Tree-sitter pointer/reference/array wrappers 
   * to extract the raw identifier text.
   */
  private getDeclaratorName(node: SyntaxNode): string {
    if (!node) return "unknown";
    if (node.type === "identifier") return node.text;
    
    if (node.type === "pointer_declarator" || node.type === "reference_declarator") {
      const innerDeclarator = node.child(1);
      return innerDeclarator ? this.getDeclaratorName(innerDeclarator) : "unknown";
    }
    
    if (node.type === "array_declarator") {
      const innerDeclarator = node.child(0);
      return innerDeclarator ? this.getDeclaratorName(innerDeclarator) : "unknown";
    }
    
    return node.text || "unknown";
  }

  /**
   * Processes standard expressions, escalating assignments and isolating C++ streams.
   */
  private buildExpressionStatement(node: SyntaxNode): IRExpressionStatement | IRAssignment | IRCoutStatement {
    const exprNode = node.namedChildren[0];
    
    // Elevate native assignments to root-level AST statements
    if (exprNode.type === "assignment_expression") {
      return {
        kind: "Assignment",
        line: node.startPosition.row + 1,
        target: this.buildExpression(exprNode.child(0) as SyntaxNode),
        operator: (exprNode.child(1)?.text || "=") as IRAssignment["operator"],
        value: this.buildExpression(exprNode.child(2) as SyntaxNode),
      };
    }

    // ─── C++ STD::COUT INTERCEPTION ──────────────────────────────────────────────
    // Tree-sitter parses `cout << a << b` as deeply nested shift/binary expressions.
    // This traverses the left-most operand to detect a `cout` stream target.
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
           
           // Ascend the tree to collect all stream arguments
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
    // ─────────────────────────────────────────────────────────────────────────────

    return {
      kind: "ExpressionStatement",
      line: node.startPosition.row + 1,
      expression: this.buildExpression(exprNode),
    };
  }

  /**
   * Helper to gracefully wrap inline statements (e.g., `if (true) x = 1;`)
   * into strict `IRBlock` structures to guarantee safe scope management.
   */
  private wrapInBlock(n: SyntaxNode): IRBlock {
    if (n.type === "compound_statement") {
      return this.buildBlock(n);
    }
    return {
      kind: "Block",
      line: n.startPosition.row + 1,
      statements: [this.buildStatement(n)]
    };
  }

  private buildIfStatement(node: SyntaxNode): IRIfStatement {
    const conditionNode = node.namedChildren.find(
      (c) => c.type === "condition_clause" || c.type === "parenthesized_expression"
    );
    
    const conditionIndex = node.namedChildren.indexOf(conditionNode as SyntaxNode);
    const consequentNode = node.namedChildren[conditionIndex + 1];
    
    const elseClause = node.namedChildren.find((c) => c.type === "else_clause");
    const alternateNode = elseClause ? elseClause.namedChildren[0] : undefined;

    if (!conditionNode || !consequentNode) {
      throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed if statement.`);
    }

    const conditionExpr = conditionNode.type === "condition_clause" 
      ? conditionNode.namedChildren[0] 
      : conditionNode;

    return {
      kind: "IfStatement",
      line: node.startPosition.row + 1,
      condition: this.buildExpression(conditionExpr),
      consequent: this.wrapInBlock(consequentNode),
      alternate: alternateNode ? this.wrapInBlock(alternateNode) : undefined,
    };
  }

  private buildWhileStatement(node: SyntaxNode): IRWhileStatement {
    const conditionNode = node.namedChildren.find((c) => c.type === "condition_clause")?.namedChildren[0] 
                          || node.namedChildren.find((c) => c.type === "parenthesized_expression");
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");

    if (!conditionNode || !bodyNode) throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed while loop.`);

    return {
      kind: "WhileStatement",
      line: node.startPosition.row + 1,
      condition: this.buildExpression(conditionNode),
      body: this.wrapInBlock(bodyNode), // Safely handles inline loops
    };
  }

  private buildDoWhileStatement(node: SyntaxNode): IRDoWhileStatement {
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
    const conditionNode = node.namedChildren.find((c) => c.type === "parenthesized_expression");

    if (!conditionNode || !bodyNode) throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed do-while loop.`);

    return {
      kind: "DoWhileStatement",
      line: node.startPosition.row + 1,
      body: this.wrapInBlock(bodyNode),
      condition: this.buildExpression(conditionNode),
    };
  }

  private buildForStatement(node: SyntaxNode): IRForStatement {
    const initNode = node.namedChildren[0];
    const conditionNode = node.namedChildren[1];
    const updateNode = node.namedChildren[2];

    let bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
    
    // Resolve inline body without braces
    if (!bodyNode) {
      bodyNode = node.namedChildren[node.namedChildren.length - 1];
    }

    if (!bodyNode) throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed for loop.`);

    let init: IRVariableDeclaration | IRAssignment | undefined;
    if (initNode.type === "declaration") {
      init = this.buildVariableDeclaration(initNode);
    } else if (initNode.type === "assignment_expression") {
       init = {
         kind: "Assignment",
         line: initNode.startPosition.row + 1,
         target: this.buildExpression(initNode.child(0) as SyntaxNode),
         operator: (initNode.child(1)?.text || "=") as IRAssignment["operator"],
         value: this.buildExpression(initNode.child(2) as SyntaxNode)
       };
    }

    let update: IRAssignment | IRExpression | undefined;
    if (updateNode.type === "assignment_expression") {
      update = {
         kind: "Assignment",
         line: updateNode.startPosition.row + 1,
         target: this.buildExpression(updateNode.child(0) as SyntaxNode),
         operator: (updateNode.child(1)?.text || "=") as IRAssignment["operator"],
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
      body: this.wrapInBlock(bodyNode),
    };
  }

  private buildForRangeStatement(node: SyntaxNode): IRForRangeStatement {
    const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
    if (!bodyNode) throw new Error(`Syntax Error at line ${node.startPosition.row + 1}: Malformed range-based for loop.`);

    const bodyIndex = node.namedChildren.indexOf(bodyNode as SyntaxNode);
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
      body: this.wrapInBlock(bodyNode),
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

        // Intercept method calls on objects (e.g., list.insert)
        if (calleeNode && calleeNode.type === "field_expression") {
          const objectNode = calleeNode.child(0) as SyntaxNode;
          const operatorNode = calleeNode.child(1);
          const propertyNode = calleeNode.child(2);

          return {
            kind: "MethodCall",
            line: node.startPosition.row + 1,
            object: this.buildExpression(objectNode),
            method: propertyNode?.text || "unknown",
            arguments: args,
            arrow: operatorNode?.text === "->",
          } as unknown as IRExpression; 
        }

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
      
      // ─── C++11 BRACE INITIALIZATION ───────────────────────────────────────────
      case "initializer_list":
      case "parameter_pack_expansion": {
        const elements = node.namedChildren.map(child => this.buildExpression(child));
        return {
          kind: "InitializerList",
          elements: elements,
          line: node.startPosition.row + 1
        } as unknown as IRExpression; 
      }
      // ──────────────────────────────────────────────────────────────────────────

      case "field_expression": {
        const objectNode = node.child(0) as SyntaxNode;
        const operatorNode = node.child(1);
        const propertyNode = node.child(2);

        return {
          kind: "MemberExpression",
          line: node.startPosition.row + 1,
          object: this.buildExpression(objectNode),
          property: propertyNode?.text || "unknown",
          arrow: operatorNode?.text === "->",
        };
      }
      
      case "new_expression": {
        const typeNode = node.namedChildren[0];
        const argListNode = node.namedChildren.find((c) => c.type === "argument_list");
        const args = argListNode ? argListNode.namedChildren.map((c) => this.buildExpression(c)) : [];

        return {
          kind: "NewExpression",
          line: node.startPosition.row + 1,
          typeName: typeNode?.text || "unknown",
          arguments: args,
        } as unknown as IRExpression;
      }
      
      case "lambda_expression": {
        const bodyNode = node.namedChildren.find((c) => c.type === "compound_statement");
        const parameters: { name: string; type: string }[] = [];

        // Recursively extract parameter declarations across capture/declarator boundaries
        const extractParams = (n: SyntaxNode) => {
          if (n.type === "parameter_declaration") {
            const pType = n.child(0)?.text || "unknown";
            const pDecl = n.child(1);
            parameters.push({
              type: pType,
              name: pDecl ? this.getDeclaratorName(pDecl) : "unknown",
            });
          } else {
            n.namedChildren.forEach(extractParams);
          }
        };
        node.namedChildren.forEach(extractParams);

        return {
          kind: "LambdaExpression",
          line: node.startPosition.row + 1,
          parameters,
          body: bodyNode ? this.buildBlock(bodyNode) : { kind: "Block", statements: [] },
        } as unknown as IRExpression;
      }
      
      case "ERROR":
        throw new Error(
          `Compilation Error at line ${node.startPosition.row + 1}: Unrecognized expression structure. ` + 
          `Tree-Sitter occasionally fails on ambiguous pointer syntax or complex C++ template parameters.`
        );
      default:
        throw new Error(`Compilation Error: Unsupported expression type '${node.type}' at line ${node.startPosition.row + 1}`);
    }
  }

  private buildSubscriptExpression(node: SyntaxNode): IRSubscriptExpression {
    const objectNode = node.namedChildren[0];
    const indexNode = node.namedChildren[1];

    if (!objectNode || !indexNode) {
      throw new Error(`Compilation Error at line ${node.startPosition.row + 1}: Malformed array subscript expression.`);
    }

    // Modern Tree-sitter isolates the index expression inside a `subscript_argument_list` container
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