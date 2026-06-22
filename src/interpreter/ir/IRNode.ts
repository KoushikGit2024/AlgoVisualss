// ─── Operator Types ──────────────────────────────────────────────────────────

/**
 * Supported binary operators for mathematical, logical, and bitwise operations.
 * Strictly typed to ensure the ExpressionEvaluator routes logic safely.
 */
export type BinaryOperator = 
  | "+" | "-" | "*" | "/" | "%" 
  | "<" | ">" | "<=" | ">=" | "==" | "!=" 
  | "&&" | "||" 
  | "&" | "|" | "^" | "<<" | ">>"; 

/**
 * Supported unary operators, including logical negation and pointer referencing.
 */
export type UnaryOperator = "!" | "-" | "+" | "~" | "*" | "&"; 

export type UpdateOperator = "++" | "--";

export type AssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>=";

// ─── Core Unions ─────────────────────────────────────────────────────────────

/**
 * Represents any valid Intermediate Representation node within the execution engine.
 * The `IRWalker` utilizes this union to determine statement execution routing.
 */
export type IRNode =
  | IRProgram
  | IRFunctionDeclaration
  | IRStructDeclaration
  | IRBlock
  | IRVariableDeclaration
  | IRAssignment
  | IRExpressionStatement
  | IRIfStatement
  | IRWhileStatement
  | IRDoWhileStatement  // Previously missing from union — do-while loops were silently skipped
  | IRForStatement
  | IRForRangeStatement
  | IRSwitchStatement
  | IRReturnStatement
  | IRBreakStatement
  | IRContinueStatement
  | IRCoutStatement
  | IREmptyStatement
  | IRExpression; 

/**
 * Represents nodes that evaluate to a concrete runtime value.
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
  | IRInitializerList
  | IRMemberExpression
  | IRMethodCall
  | IRNewExpression
  | IRLambdaExpression
  | IRAssignment;

// ─── Base Node ───────────────────────────────────────────────────────────────

/**
 * The foundational interface for all Intermediate Representation nodes.
 * The `line` property is strictly enforced to synchronize the React UI visualizer 
 * with the active execution state.
 */
export interface IRBaseNode {
  kind: string;
  line: number;
}

// ─── Structural Nodes ────────────────────────────────────────────────────────

export interface IRProgram extends IRBaseNode {
  kind: "Program";
  functions: IRFunctionDeclaration[];
  structs: IRStructDeclaration[];
  globals?: IRVariableDeclaration[];
}

export interface IRStructDeclaration extends IRBaseNode {
  kind: "StructDeclaration";
  name: string;
  fields: { name: string; type: string; defaultValue?: IRExpression }[];
}

export interface IRFunctionDeclaration extends IRBaseNode {
  kind: "FunctionDeclaration";
  returnType: string;
  name: string;
  parameters: { name: string; type: string; isReference?: boolean; defaultValue?: IRExpression }[];
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
  initializer?: IRExpression;
  /**
   * Present when the declaration uses C++ constructor-call syntax: `Type v(arg1, arg2)`.
   * Distinct from `initializer` (which is for `=` assignments) so the executor
   * can correctly size/fill containers (e.g., `vector<int> v(n, 0)` → n zeros).
   */
  constructorArgs?: IRExpression[];
}

/**
 * Represents an assignment operation. 
 * The `target` is an `IRExpression` to support complex L-values like array 
 * subscripts (arr[i]) and object properties (ptr->val), rather than just raw identifiers.
 */
export interface IRAssignment extends IRBaseNode {
  kind: "Assignment";
  target: IRExpression;
  operator: AssignmentOperator;
  value: IRExpression;
}

/**
 * Represents a standalone expression executed for its side effects 
 * (e.g., a void function call: `bubbleSort(nums);`).
 */
export interface IRExpressionStatement extends IRBaseNode {
  kind: "ExpressionStatement";
  expression: IRExpression;
}

export interface IRIfStatement extends IRBaseNode {
  kind: "IfStatement";
  condition: IRExpression;
  consequent: IRBlock;
  alternate?: IRBlock;
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
  init?: IRVariableDeclaration | IRVariableDeclaration[] | IRAssignment;
  condition?: IRExpression;
  update?: IRAssignment | IRExpression;
  body: IRBlock;
}

export interface IRForRangeStatement extends IRBaseNode {
  kind: "ForRangeStatement";
  iteratorType: string;
  iteratorName: string;
  collection: IRExpression;
  body: IRBlock;
}

export interface IRCaseClause extends IRBaseNode {
  kind: "CaseClause";
  isDefault: boolean;
  value?: IRExpression; // undefined if isDefault is true
  statements: IRNode[];
}

export interface IRSwitchStatement extends IRBaseNode {
  kind: "SwitchStatement";
  condition: IRExpression;
  cases: IRCaseClause[];
}

export interface IRReturnStatement extends IRBaseNode {
  kind: "ReturnStatement";
  argument?: IRExpression;
}

export interface IRBreakStatement extends IRBaseNode {
  kind: "BreakStatement";
}

export interface IRContinueStatement extends IRBaseNode {
  kind: "ContinueStatement";
}

/**
 * Isolates C++ standard output streams to prevent parsing ambiguities.
 * Tree-sitter evaluates `cout << "hi"` natively as shift expressions, which are
 * safely sequestered into this node during the IR building phase.
 */
export interface IRCoutStatement extends IRBaseNode {
  kind: "CoutStatement";
  arguments: IRExpression[];
}

/**
 * Represents a no-op, typically resulting from lone semicolons or parsed comments.
 */
export interface IREmptyStatement extends IRBaseNode {
  kind: "EmptyStatement";
}

// ─── Expressions ─────────────────────────────────────────────────────────────

export interface IRLiteral extends IRBaseNode {
  kind: "Literal";
  valueType: string;
  value: number | boolean | string | null;
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
  prefix: boolean; // Indicates pre-increment (++i) vs post-increment (i++)
}

export interface IRSubscriptExpression extends IRBaseNode {
  kind: "SubscriptExpression";
  object: IRExpression;
  index: IRExpression;
}

export interface IRTernaryExpression extends IRBaseNode {
  kind: "TernaryExpression";
  condition: IRExpression;
  consequent: IRExpression;
  alternate: IRExpression;
}

export interface IRInitializerList extends IRBaseNode {
  kind: "InitializerList";
  elements: IRExpression[];
}

export interface IRMemberExpression extends IRBaseNode {
  kind: "MemberExpression";
  object: IRExpression;
  property: string;
  arrow: boolean; // True for `->`, false for `.`
}

export interface IRMethodCall extends IRBaseNode {
  kind: "MethodCall";
  object: IRExpression;
  method: string;
  arguments: IRExpression[];
  arrow: boolean;
}

export interface IRNewExpression extends IRBaseNode {
  kind: "NewExpression";
  typeName: string;
  arguments: IRExpression[];
}

export interface IRLambdaExpression extends IRBaseNode {
  kind: "LambdaExpression";
  parameters: { name: string; type: string }[];
  body: IRBlock; // Fixed from `any`
}