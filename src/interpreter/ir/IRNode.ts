// src/interpreter/ir/IRNode.ts

// ─── Operator Types ──────────────────────────────────────────────────────────

// We keep these strictly typed so the Evaluator doesn't have to guess what operation to run.
export type BinaryOperator = 
  | "+" | "-" | "*" | "/" | "%" 
  | "<" | ">" | "<=" | ">=" | "==" | "!=" 
  | "&&" | "||" 
  | "&" | "|" | "^" | "<<" | ">>"; // Bitwise operators (crucial for algorithmic platforms)

export type UnaryOperator = "!" | "-" | "+" | "~" | "*" | "&"; // Includes pointer/reference ops
export type UpdateOperator = "++" | "--";
export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>=";

// ─── Core Unions ─────────────────────────────────────────────────────────────

/**
 * Every single node type our AST (Abstract Syntax Tree) supports.
 * The IRWalker uses this union to figure out which execute/walk function to call.
 */
export type IRNode =
  | IRProgram
  | IRFunctionDeclaration
  | IRBlock
  | IRVariableDeclaration
  | IRAssignment
  | IRExpressionStatement
  | IRIfStatement
  | IRWhileStatement
  | IRDoWhileStatement
  | IRForStatement
  | IRForRangeStatement
  | IRReturnStatement
  | IRBreakStatement
  | IRContinueStatement
  | IRCoutStatement
  | IREmptyStatement
  | IRExpression; // Expressions can be nested inside statements

/**
 * Anything that actually evaluates to a value (a number, string, boolean, etc.)
 */
export type IRExpression =
  | IRLiteral
  | IRIdentifier
  | IRUnaryExpression
  | IRBinaryExpression
  | IRFunctionCall
  | IRUpdateExpression
  | IRSubscriptExpression
  | IRTernaryExpression
  | IRInitializerList;

// ─── Base Node ───────────────────────────────────────────────────────────────

/**
 * The bread and butter. Every node MUST tell us what kind it is and what line 
 * of C++ code it came from. The line number is how we sync the React UI animations!
 */
export interface IRBaseNode {
  kind: string;
  line: number;
}

// ─── Structural Nodes ────────────────────────────────────────────────────────

export interface IRProgram extends IRBaseNode {
  kind: "Program";
  functions: IRFunctionDeclaration[];
}

export interface IRFunctionDeclaration extends IRBaseNode {
  kind: "FunctionDeclaration";
  returnType: string;
  name: string;
  parameters: { name: string; type: string }[];
  body: IRBlock;
}

export interface IRBlock extends IRBaseNode {
  kind: "Block";
  statements: IRNode[];
}

// ─── Statements ──────────────────────────────────────────────────────────────

export interface IRVariableDeclaration extends IRBaseNode {
  kind: "VariableDeclaration";
  variableType: string;
  name: string;
  initializer?: IRExpression; // Optional: e.g., `int x;` vs `int x = 5;`
}

/**
 * Notice how `target` is an IRExpression, not just a string name?
 * This is a massive lifesaver! It allows us to assign to arrays (e.g., `arr[i] = x`) 
 * instead of just flat variables (e.g., `id = x`).
 */
export interface IRAssignment extends IRBaseNode {
  kind: "Assignment";
  target: IRExpression;
  operator: AssignmentOperator;
  value: IRExpression;
}

/**
 * For standalone expressions that act as statements (e.g., `myFunction();` by itself).
 */
export interface IRExpressionStatement extends IRBaseNode {
  kind: "ExpressionStatement";
  expression: IRExpression;
}

export interface IRIfStatement extends IRBaseNode {
  kind: "IfStatement";
  condition: IRExpression;
  consequent: IRBlock;
  alternate?: IRBlock; // The 'else' block
}

export interface IRWhileStatement extends IRBaseNode {
  kind: "WhileStatement";
  condition: IRExpression;
  body: IRBlock;
}

export interface IRDoWhileStatement extends IRBaseNode {
  kind: "DoWhileStatement";
  condition: IRExpression;
  body: IRBlock;
}

export interface IRForStatement extends IRBaseNode {
  kind: "ForStatement";
  init?: IRVariableDeclaration | IRAssignment; // e.g., `int i = 0`
  condition?: IRExpression;                    // e.g., `i < 10`
  update?: IRAssignment | IRExpression;        // e.g., `i++`
  body: IRBlock;
}

export interface IRForRangeStatement extends IRBaseNode {
  kind: "ForRangeStatement";
  iteratorType: string;
  iteratorName: string;         // E.g., 'val' in 'for (int val : arr)'
  collection: IRExpression;     // E.g., 'arr'
  body: IRBlock;
}

export interface IRReturnStatement extends IRBaseNode {
  kind: "ReturnStatement";
  argument?: IRExpression; // Void functions return nothing
}

export interface IRBreakStatement extends IRBaseNode {
  kind: "BreakStatement";
}

export interface IRContinueStatement extends IRBaseNode {
  kind: "ContinueStatement";
}

/**
 * We separate CoutStatement entirely from binary expressions to save our sanity.
 * Tree-sitter parses `cout << "hi"` weirdly; trapping it in its own node prevents crashes.
 */
export interface IRCoutStatement extends IRBaseNode {
  kind: "CoutStatement";
  arguments: IRExpression[]; // An array of things to print out left-to-right
}

/**
 * Catch-all for lone semicolons or comments that Tree-sitter might spit out.
 */
export interface IREmptyStatement extends IRBaseNode {
  kind: "EmptyStatement";
}


// ─── Expressions ─────────────────────────────────────────────────────────────

export interface IRLiteral extends IRBaseNode {
  kind: "Literal";
  valueType: string;
  value: number | boolean | string | null; // Null handles `nullptr` in modern C++
}

export interface IRIdentifier extends IRBaseNode {
  kind: "Identifier";
  name: string;
}

export interface IRUnaryExpression extends IRBaseNode {
  kind: "UnaryExpression";
  operator: UnaryOperator;
  argument: IRExpression;
}

export interface IRBinaryExpression extends IRBaseNode {
  kind: "BinaryExpression";
  operator: BinaryOperator;
  left: IRExpression;
  right: IRExpression;
}

export interface IRFunctionCall extends IRBaseNode {
  kind: "FunctionCall";
  callee: string;
  arguments: IRExpression[];
}

export interface IRUpdateExpression extends IRBaseNode {
  kind: "UpdateExpression";
  operator: UpdateOperator;
  argument: IRExpression;
  prefix: boolean; // True for `++i`, false for `i++`
}

/** Array access: `a[i]` */
export interface IRSubscriptExpression extends IRBaseNode {
  kind: "SubscriptExpression";
  object: IRExpression;  // E.g., the array `a`
  index: IRExpression;   // E.g., the index `i`
}

/** Ternary operator: `condition ? consequent : alternate` */
export interface IRTernaryExpression extends IRBaseNode {
  kind: "TernaryExpression";
  condition: IRExpression;
  consequent: IRExpression;
  alternate: IRExpression;
}

/** Handles `{1, 2, 3}` array initializations */
export interface IRInitializerList extends IRBaseNode {
  kind: "InitializerList";
  elements: IRExpression[];
}