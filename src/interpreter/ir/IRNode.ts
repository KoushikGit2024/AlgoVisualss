// ============================================================================
// IRNode.ts — Type definitions for every node in the Intermediate Representation.
//
// The IR is the interpreter's internal AST — a strictly-typed, normalised
// representation that sits between the raw Tree-sitter CST and the execution
// engine. IRBuilder translates Tree-sitter nodes into IR nodes; IRWalker,
// StatementExecutor, and ExpressionEvaluator consume them.
//
// File organisation:
//   1. Operator type aliases      (BinaryOperator, UnaryOperator, …)
//   2. Core union types           (IRNode, IRExpression)
//   3. Base interface             (IRBaseNode)
//   4. Structural nodes           (IRProgram, IRBlock, IRFunctionDeclaration, …)
//   5. Statement nodes            (IRVariableDeclaration, IRAssignment, IRIfStatement, …)
//   6. New statement nodes v2     (IRTryStatement, IRThrowStatement, IREnumDeclaration, …)
//   7. Expression nodes           (IRLiteral, IRBinaryExpression, IRFunctionCall, …)
//   8. New expression nodes v2    (IRSizeofExpression, IRCommaExpression)
//
// Extension history:
//   v1 — Initial full set of nodes covering core C++ control flow, expressions,
//        STL containers, lambdas, structs, and switch statements.
//   v2 — Added: IRTryStatement, IRThrowStatement, IRCatchClause (exception handling);
//               IREnumDeclaration, IREnumMember (enum / enum class);
//               IRTypeAlias (typedef / using type aliases);
//               IRGotoStatement, IRLabeledStatement (goto — surface as error);
//               IRSizeofExpression (sizeof operator);
//               IRCommaExpression (comma operator in for-loop updates);
//               Updated IRNode and IRExpression unions to include all new nodes.
// ============================================================================

// ─── 1. Operator Type Aliases ─────────────────────────────────────────────────

/**
 * Every binary operator the ExpressionEvaluator can evaluate.
 *
 * Arithmetic:   +  -  *  /  %
 * Comparison:   <  >  <=  >=  ==  !=
 * Logical:      &&  ||          (short-circuit evaluated)
 * Bitwise:      &  |  ^  <<  >>
 *
 * Note: `<<` and `>>` serve dual roles — bitwise shift in arithmetic context,
 * stream insertion/extraction for cout/cin. The IRBuilder emits them as
 * BinaryExpression; ExpressionEvaluator and StatementExecutor detect the
 * cout/cin proxy object and route to the stream path.
 */
export type BinaryOperator =
  | "+"
  | "-"
  | "*"
  | "/"
  | "%"
  | "<"
  | ">"
  | "<="
  | ">="
  | "=="
  | "!="
  | "&&"
  | "||"
  | "&"
  | "|"
  | "^"
  | "<<"
  | ">>";

/**
 * Every unary operator the ExpressionEvaluator can evaluate.
 *
 * Arithmetic:   -  +
 * Logical:      !
 * Bitwise:      ~
 * Pointer:      *  &   (both are no-ops in the duck-typed JS runtime —
 *                       all C++ objects are already direct JS references)
 */
export type UnaryOperator = "!" | "-" | "+" | "~" | "*" | "&";

/** Pre-increment / post-increment and pre-decrement / post-decrement. */
export type UpdateOperator = "++" | "--";

/**
 * Simple and compound assignment operators.
 * Compound variants (+=, -=, …) are handled by StatementExecutor.computeCompoundValue().
 */
export type AssignmentOperator =
  "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "&=" | "|=" | "^=" | "<<=" | ">>=";

// ─── 2. Core Union Types ──────────────────────────────────────────────────────

/**
 * Every valid IR node that can appear as a statement inside an IRBlock.
 *
 * IRWalker.walkStatement() switches on `kind` to route to the correct handler.
 * Adding a new statement node type requires:
 *   1. Defining the interface below (IRXxxStatement).
 *   2. Adding it to this union.
 *   3. Adding a case to IRWalker.walkStatement().
 *   4. Adding a build method to IRBuilder.
 *   5. Updating IRBuilder.buildStatement()'s switch to call the new builder.
 */
export type IRNode =
  // ── Structural ──────────────────────────────────────────────────────────
  | IRProgram
  | IRFunctionDeclaration
  | IRStructDeclaration
  | IREnumDeclaration // v2: enum / enum class
  | IRTypeAlias // v2: typedef / using
  | IRBlock
  // ── Statements ──────────────────────────────────────────────────────────
  | IRVariableDeclaration
  | IRAssignment
  | IRExpressionStatement
  | IRIfStatement
  | IRWhileStatement
  | IRDoWhileStatement
  | IRForStatement
  | IRForRangeStatement
  | IRSwitchStatement
  | IRTryStatement // v2: try { } catch (T e) { } [finally { }]
  | IRThrowStatement // v2: throw <expr>;
  | IRGotoStatement // v2: goto <label>; (surfaced as a runtime error)
  | IRLabeledStatement // v2: <label>: <statement>
  | IRReturnStatement
  | IRBreakStatement
  | IRContinueStatement
  | IRCoutStatement
  | IREmptyStatement
  // ── Expressions as statements ────────────────────────────────────────────
  | IRExpression;

/**
 * Every IR node that evaluates to a concrete CppValue at runtime.
 *
 * ExpressionEvaluator.evaluate() switches on `kind` to route to the correct
 * handler. The FunctionCall, MethodCall, NewExpression, and LambdaExpression
 * kinds are intercepted by ExecutionEngine before they reach the evaluator.
 *
 * Adding a new expression node requires:
 *   1. Defining the interface below.
 *   2. Adding it to this union.
 *   3. Adding a case to ExpressionEvaluator.evaluate() (or the engine interceptor).
 *   4. Adding a build case to IRBuilder.buildExpression().
 */
export type IRExpression =
  | IRLiteral
  | IRIdentifier
  | IRUnaryExpression
  | IRBinaryExpression
  | IRUpdateExpression
  | IRSubscriptExpression
  | IRTernaryExpression
  | IRInitializerList
  | IRMemberExpression
  | IRMethodCall
  | IRFunctionCall
  | IRNewExpression
  | IRLambdaExpression
  | IRAssignment
  | IRSizeofExpression // v2: sizeof(type) / sizeof(expr)
  | IRCommaExpression; // v2: expr1, expr2  (comma operator)

// ─── 3. Base Interface ────────────────────────────────────────────────────────

/**
 * The foundational interface implemented by every IR node.
 *
 * `kind`  — A string literal discriminant used by switch statements throughout
 *            the engine to route nodes to the correct handler. Must be unique
 *            across all IR node types.
 *
 * `line`  — The 1-based C++ source line number where this construct begins.
 *            Threaded through every IR node so the EventEmitter can include the
 *            source line in every event, enabling the React UI to highlight the
 *            currently executing line.
 */
export interface IRBaseNode {
  kind: string;
  line: number;
}

// ─── 4. Structural Nodes ─────────────────────────────────────────────────────

/**
 * The root node of every parsed program. Produced by IRBuilder.build() from
 * a Tree-sitter `translation_unit` node.
 *
 * `globals` holds variable declarations that appear at file scope (outside any
 * function). They are evaluated before main() in a synthetic "__global_init__"
 * frame inside ExecutionEngine.run().
 */
export interface IRProgram extends IRBaseNode {
  kind: "Program";
  functions: IRFunctionDeclaration[];
  structs: IRStructDeclaration[];
  enums?: IREnumDeclaration[]; // v2: collected at top level
  aliases?: IRTypeAlias[]; // v2: collected at top level
  globals?: IRVariableDeclaration[];
}

/**
 * A struct or class blueprint. Produced from `struct_specifier` or
 * `class_specifier` Tree-sitter nodes.
 *
 * Stored in ExecutionEngine.classBlueprints and consulted whenever a
 * NewExpression or VariableDeclaration references the type name.
 */
export interface IRStructDeclaration extends IRBaseNode {
  kind: "StructDeclaration";
  name: string;
  fields: {
    name: string;
    type: string;
    defaultValue?: IRExpression;
  }[];
  constructors?: IRFunctionDeclaration[]; // v2: explicitly defined constructors
  methods?: IRFunctionDeclaration[]; // v2: struct member functions
}

/**
 * An enum or enum class declaration. v2 addition.
 *
 * Produced from `enum_specifier` Tree-sitter nodes. Stored in
 * ExecutionEngine.enumBlueprints and expanded into integer constants
 * injected into every function frame's base scope, just like global variables.
 *
 * `isClass`      — true for `enum class Color { ... }` (scoped enum).
 *                   Scoped enums require `Color::RED` syntax in C++; the engine
 *                   supports both `RED` and `Color::RED` for simplicity.
 * `underlyingType` — the explicit underlying integer type, e.g. `uint8_t`.
 *                   Defaults to "int" when omitted.
 *
 * @example C++:
 *   enum Direction { NORTH = 0, SOUTH, EAST, WEST };
 *   enum class Color : uint8_t { RED = 1, GREEN, BLUE };
 */
export interface IREnumDeclaration extends IRBaseNode {
  kind: "EnumDeclaration";
  name: string;
  isClass: boolean;
  underlyingType: string;
  members: IREnumMember[];
}

/**
 * A single member of an enum declaration.
 *
 * `value` is the explicit initialiser expression (e.g. `= 42`). When absent,
 * ExecutionEngine assigns the previous member's value + 1 (or 0 for the first
 * member), matching C++ auto-increment semantics.
 */
export interface IREnumMember {
  name: string;
  value?: IRExpression;
}

/**
 * A type alias declaration. v2 addition.
 *
 * Covers both C++11 `using` aliases and C-style `typedef`:
 *   using ll   = long long;          → { alias: "ll",   target: "long long" }
 *   typedef vector<int> vi;          → { alias: "vi",   target: "vector<int>" }
 *   using Graph = vector<vector<int>>; → { alias: "Graph", target: "vector<vector<int>>" }
 *
 * Stored in ExecutionEngine.typeAliases and consulted by StatementExecutor
 * before all typeLower checks, so `vi v(n, 0)` resolves to `vector<int> v(n, 0)`.
 */
export interface IRTypeAlias extends IRBaseNode {
  kind: "TypeAlias";
  alias: string;
  target: string;
}

/**
 * A parsed function definition. Produced from `function_definition`
 * Tree-sitter nodes.
 *
 * `parameters` carries the full parameter metadata including:
 *   - `isReference` — for pass-by-reference `int& x` parameters
 *   - `defaultValue` — for optional parameters `int x = 0`
 * Both are used by ExecutionEngine.invokeFunction() when binding arguments.
 */
export interface IRFunctionDeclaration extends IRBaseNode {
  kind: "FunctionDeclaration";
  returnType: string;
  name: string;
  parameters: {
    name: string;
    type: string;
    isReference?: boolean;
    defaultValue?: IRExpression;
  }[];
  body: IRBlock;
}

/**
 * A strictly scoped block of statements `{ ... }`.
 *
 * IRWalker.walkBlock() pushes a new ScopeManager scope before executing the
 * statements and pops it (in a finally block) after — even if a signal or
 * exception propagates through mid-execution.
 */
export interface IRBlock extends IRBaseNode {
  kind: "Block";
  statements: IRNode[];
}

// ─── 5. Statement Nodes (v1) ──────────────────────────────────────────────────

/**
 * A local variable declaration, optionally with an initialiser or constructor
 * arguments. Produced from `declaration` Tree-sitter nodes.
 *
 * The three initialisation strategies in priority order:
 *   1. `initializer`     — explicit `=` assignment: `int x = 5;`
 *   2. `constructorArgs` — constructor-call syntax: `vector<int> v(n, 0);`
 *   3. Default by type   — bare declaration: `vector<int> v;`
 *
 * `isConst`  — true when the declaration includes the `const` qualifier.
 * `isStatic` — true when the declaration includes the `static` qualifier.
 *              StatementExecutor routes to ScopeManager.defineStatic() when set.
 */
export interface IRVariableDeclaration extends IRBaseNode {
  kind: "VariableDeclaration";
  variableType: string;
  name: string;
  initializer?: IRExpression;
  constructorArgs?: IRExpression[];
  isConst?: boolean; // v2: const qualifier
  isStatic?: boolean; // v2: static storage-class specifier
}

/**
 * An assignment statement or compound assignment.
 *
 * `target` is an IRExpression (not just a name string) to support complex
 * l-values: subscripts (`arr[i] = v`), member access (`node.val = 5`),
 * and dereferenced pointers (`*ptr = x` — treated as identity in duck-typed JS).
 */
export interface IRAssignment extends IRBaseNode {
  kind: "Assignment";
  target: IRExpression;
  operator: AssignmentOperator;
  value: IRExpression;
}

/**
 * A standalone expression executed purely for its side effects.
 * Covers void function calls (`sort(...)`), update expressions (`i++`),
 * and any expression statement not elevated to a more specific IR kind.
 */
export interface IRExpressionStatement extends IRBaseNode {
  kind: "ExpressionStatement";
  expression: IRExpression;
}

/** An if / else-if / else statement. `alternate` is undefined for a bare `if`. */
export interface IRIfStatement extends IRBaseNode {
  kind: "IfStatement";
  condition: IRExpression;
  consequent: IRBlock;
  alternate?: IRBlock;
}

/** A while loop. Body executes only when condition is truthy. */
export interface IRWhileStatement extends IRBaseNode {
  kind: "WhileStatement";
  condition: IRExpression;
  body: IRBlock;
}

/** A do-while loop. Body executes at least once before condition is checked. */
export interface IRDoWhileStatement extends IRBaseNode {
  kind: "DoWhileStatement";
  condition: IRExpression;
  body: IRBlock;
}

/**
 * A traditional for loop.
 *
 * `init` may be:
 *   - `IRVariableDeclaration[]` — from a `declaration` node (`int i = 0`)
 *   - `IRAssignment`           — from an `assignment_expression` node (`i = 0`)
 *   - `undefined`              — for an empty initialiser (`for (;;)`)
 *
 * `update` may be:
 *   - `IRAssignment` — `i += 2`
 *   - `IRExpression` — `i++`, `i--`, or a comma expression `i++, j--`
 *   - `undefined`    — for an empty update clause
 */
export interface IRForStatement extends IRBaseNode {
  kind: "ForStatement";
  init?: IRVariableDeclaration | IRVariableDeclaration[] | IRAssignment;
  condition?: IRExpression;
  update?: IRAssignment | IRExpression;
  body: IRBlock;
}

/**
 * A C++11 range-based for loop: `for (auto x : container)`.
 *
 * `iteratorName` may be a structured-binding string like `"[key, val]"`,
 * which IRWalker.walkForRangeStatement() splits and defines as separate
 * variables for each iteration.
 */
export interface IRForRangeStatement extends IRBaseNode {
  kind: "ForRangeStatement";
  iteratorType: string;
  iteratorName: string;
  isConst?: boolean;
  collection: IRExpression;
  body: IRBlock;
}

/** A single case or default clause within a switch statement. */
export interface IRCaseClause extends IRBaseNode {
  kind: "CaseClause";
  isDefault: boolean;
  value?: IRExpression; // undefined when isDefault is true
  statements: IRNode[];
}

/**
 * A switch statement with fallthrough semantics.
 * IRWalker.walkSwitchStatement() sets a `fallthrough` flag once a matching
 * case is found and continues executing all subsequent cases until a
 * BreakSignal is thrown or all cases are exhausted.
 */
export interface IRSwitchStatement extends IRBaseNode {
  kind: "SwitchStatement";
  condition: IRExpression;
  cases: IRCaseClause[];
}

/** A return statement, with an optional return value expression. */
export interface IRReturnStatement extends IRBaseNode {
  kind: "ReturnStatement";
  argument?: IRExpression;
}

/**
 * A break statement. IRWalker.walkStatement() throws BreakSignal immediately,
 * which propagates to the nearest enclosing loop walker or walkSwitchStatement.
 */
export interface IRBreakStatement extends IRBaseNode {
  kind: "BreakStatement";
}

/**
 * A continue statement. IRWalker.walkStatement() throws ContinueSignal,
 * which propagates to the nearest enclosing loop walker and skips to the
 * update / condition phase.
 */
export interface IRContinueStatement extends IRBaseNode {
  kind: "ContinueStatement";
}

/**
 * An intercepted C++ stream output statement.
 *
 * Tree-sitter parses `cout << a << b` as deeply nested shift_expression nodes.
 * IRBuilder.buildExpressionStatement() detects the `cout` sentinel, unwinds
 * the chain, and collects all arguments into this node. StatementExecutor
 * evaluates each argument and emits a WRITE event with the concatenated string.
 */
export interface IRCoutStatement extends IRBaseNode {
  kind: "CoutStatement";
  arguments: IRExpression[];
}

/**
 * A no-op statement. Produced for:
 *   - Lone semicolons (`;`)
 *   - Comments (`// ...`, `/* ... * /`)
 *   - Preprocessor directives (`#include`, `#define`)
 *   - `using namespace std;`
 * All of these are legal C++ but have no runtime effect in the interpreter.
 */
export interface IREmptyStatement extends IRBaseNode {
  kind: "EmptyStatement";
}

// ─── 6. New Statement Nodes (v2) ─────────────────────────────────────────────

/**
 * A C++ try / catch / [finally] statement. v2 addition.
 *
 * Produced from `try_statement` Tree-sitter nodes.
 * IRWalker.walkTryStatement() executes `body` and catches ThrowSignal.
 * For each catch clause (in order), it checks whether the thrown type matches
 * `catchType` before executing the handler body.
 *
 * `catchAll` is true when the clause is `catch (...)` — matches any thrown value.
 *
 * `finallyBlock` is optional (C++ has no `finally`, but the field is reserved
 * for potential future extension or RAII-simulation purposes).
 *
 * @example C++:
 *   try {
 *     throw 42;
 *   } catch (int e) {
 *     cout << e;
 *   } catch (...) {
 *     cout << "unknown";
 *   }
 */
export interface IRTryStatement extends IRBaseNode {
  kind: "TryStatement";
  body: IRBlock;
  handlers: IRCatchClause[];
  finallyBlock?: IRBlock;
}

/**
 * A single catch clause within an IRTryStatement. v2 addition.
 *
 * `catchType`    — The C++ type string to match against ThrowSignal.payload.typeName.
 *                  Examples: "int", "std::exception", "MyError".
 *                  Undefined when `catchAll` is true.
 * `catchParam`   — The name of the caught-exception variable (e.g. `e` in
 *                  `catch (int e)`). May be undefined for `catch (int)`.
 * `catchAll`     — True for `catch (...)` — matches any ThrowSignal regardless
 *                  of typeName.
 * `body`         — The handler block executed when this clause matches.
 */
export interface IRCatchClause extends IRBaseNode {
  kind: "CatchClause";
  catchType?: string;
  catchParam?: string;
  catchAll: boolean;
  body: IRBlock;
}

/**
 * A C++ throw statement. v2 addition.
 *
 * Produced from `throw_statement` Tree-sitter nodes.
 * StatementExecutor.executeThrow() evaluates `argument`, emits a THROW event,
 * and throws a ThrowSignal. IRWalker.walkTryStatement() catches ThrowSignal;
 * if no matching handler exists, ThrowSignal propagates to ExecutionEngine
 * and surfaces as a runtime error.
 *
 * `argument` is undefined for a bare re-throw (`throw;`) inside a catch block.
 *
 * @example C++:
 *   throw 42;                         → argument: IRLiteral(42)
 *   throw std::runtime_error("oops"); → argument: IRFunctionCall(...)
 *   throw;                            → argument: undefined (re-throw)
 */
export interface IRThrowStatement extends IRBaseNode {
  kind: "ThrowStatement";
  argument?: IRExpression;
}

/**
 * A goto statement. v2 addition. Surfaced as a descriptive runtime error.
 *
 * Full goto support would require two-pass IR compilation to resolve label
 * targets before execution begins. Instead, IRWalker.walkStatement() throws
 * an UnsupportedFeatureError when it encounters this node, giving the user a
 * clear message rather than a silent no-op.
 *
 * `label` — the target label name (e.g. `goto cleanup;` → label: "cleanup").
 */
export interface IRGotoStatement extends IRBaseNode {
  kind: "GotoStatement";
  label: string;
}

/**
 * A labeled statement. v2 addition.
 *
 * C++ labels are targets for goto. Since goto is unsupported, labeled
 * statements execute their inner statement normally but the label is ignored.
 * This avoids crashing on code that has labels without goto (e.g. some
 * macros expand to label-statement pairs).
 *
 * `label`     — the label identifier string.
 * `statement` — the statement that follows the label.
 */
export interface IRLabeledStatement extends IRBaseNode {
  kind: "LabeledStatement";
  label: string;
  statement: IRNode;
}

// ─── 7. Expression Nodes (v1) ─────────────────────────────────────────────────

/** A compile-time constant: number, boolean, string, char, or null. */
export interface IRLiteral extends IRBaseNode {
  kind: "Literal";
  valueType: string;
  value: number | boolean | string | null;
}

/**
 * A variable reference or C++ keyword used in expression position.
 *
 * Special names intercepted at evaluation time (ExpressionEvaluator case "Identifier"):
 *   `cout`    → `{ __isCout: true }` stream proxy
 *   `cin`     → `{ __isCin: true }` stream proxy
 *   `nullptr` → `null`
 *   `NULL`    → `null`
 *   `endl`    → `"\n"`
 *   `true`    → `true`
 *   `false`   → `false`
 *   INT_MAX, M_PI, etc. → numeric constants from GLOBAL_CONSTANTS table
 */
export interface IRIdentifier extends IRBaseNode {
  kind: "Identifier";
  name: string;
}

/** A unary operation: `!x`, `-n`, `~bits`, `*ptr`, `&x`. */
export interface IRUnaryExpression extends IRBaseNode {
  kind: "UnaryExpression";
  operator: UnaryOperator;
  argument: IRExpression;
}

/**
 * A binary operation: arithmetic, comparison, logical, or bitwise.
 *
 * Short-circuit evaluation for `&&` and `||` is implemented in
 * ExpressionEvaluator.evaluateBinary() by evaluating the right operand only
 * when necessary.
 */
export interface IRBinaryExpression extends IRBaseNode {
  kind: "BinaryExpression";
  operator: BinaryOperator;
  left: IRExpression;
  right: IRExpression;
}

/**
 * A function call expression. Intercepted by ExecutionEngine before reaching
 * ExpressionEvaluator, which checks for native polyfills, lambda/function-pointer
 * resolution, and finally calls invokeFunction() for user-defined functions.
 */
export interface IRFunctionCall extends IRBaseNode {
  kind: "FunctionCall";
  callee: string;
  arguments: IRExpression[];
}

/**
 * An in-place increment or decrement.
 *
 * `prefix` — true for `++i` (returns new value); false for `i++` (returns old value).
 * Evaluated by ExpressionEvaluator.evaluateUpdate(), which reads the current
 * value, computes the new value, writes back, and returns the appropriate one.
 */
export interface IRUpdateExpression extends IRBaseNode {
  kind: "UpdateExpression";
  operator: UpdateOperator;
  argument: IRExpression;
  prefix: boolean;
}

/**
 * An array / map subscript: `arr[i]`, `matrix[r][c]`, `map["key"]`.
 * ExpressionEvaluator dispatches on the backing type (Array, Map, mock container).
 */
export interface IRSubscriptExpression extends IRBaseNode {
  kind: "SubscriptExpression";
  object: IRExpression;
  index: IRExpression;
}

/** A ternary / conditional expression: `cond ? consequent : alternate`. */
export interface IRTernaryExpression extends IRBaseNode {
  kind: "TernaryExpression";
  condition: IRExpression;
  consequent: IRExpression;
  alternate: IRExpression;
}

/**
 * A brace-enclosed initialiser list: `{1, 2, 3}` or `{{0,1},{1,0}}`.
 * Evaluates each element and returns a plain JS array `CppValue[]`.
 * StatementExecutor.executeVariableDeclaration() may deep-wrap the result in
 * mock containers if the target type is a vector/list/etc.
 */
export interface IRInitializerList extends IRBaseNode {
  kind: "InitializerList";
  elements: IRExpression[];
}

/**
 * A struct member or pointer-member access: `node.val`, `ptr->next`.
 * `arrow` is true for `->`, false for `.`.
 * ExpressionEvaluator looks up `targetObj[property]` with auto-recovery
 * for the struct-array field-map heuristic.
 */
export interface IRMemberExpression extends IRBaseNode {
  kind: "MemberExpression";
  object: IRExpression;
  property: string;
  arrow: boolean;
}

/**
 * A method call on an object: `v.push_back(x)`, `s.substr(1, 3)`.
 * Intercepted by ExecutionEngine.invokeMethodCall(), which dispatches on the
 * backing JS type (Array, Set, Map, string, mock container).
 */
export interface IRMethodCall extends IRBaseNode {
  kind: "MethodCall";
  object: IRExpression;
  method: string;
  arguments: IRExpression[];
  arrow: boolean;
}

/**
 * A `new` expression: `new TreeNode(5)`, `new int[n]`.
 * Intercepted by the evaluator interceptor in ExecutionEngine:
 *   - Array type (`new int[n]`) → `new Array(n).fill(0)`
 *   - Known struct/class        → instantiated from classBlueprints
 *   - Unknown type              → generic node heuristic (val/next/left/right)
 */
export interface IRNewExpression extends IRBaseNode {
  kind: "NewExpression";
  typeName: string;
  arguments: IRExpression[];
}

/**
 * A lambda expression: `[](int x) { return x * 2; }`.
 *
 * Evaluating an IRLambdaExpression in the interceptor produces a JS closure
 * that captures the current scope state (capture-by-value semantics) and
 * executes the body in a new lambda frame when called.
 */
export interface IRLambdaExpression extends IRBaseNode {
  kind: "LambdaExpression";
  parameters: { name: string; type: string }[];
  body: IRBlock;
}

// ─── 8. New Expression Nodes (v2) ────────────────────────────────────────────

/**
 * A sizeof expression: `sizeof(int)`, `sizeof(x)`, `sizeof x`. v2 addition.
 *
 * Produced from `sizeof_expression` Tree-sitter nodes.
 * ExpressionEvaluator resolves it using a static type-size table:
 *   char / bool          → 1
 *   short                → 2
 *   int / float / long   → 4
 *   long long / double   → 8
 *   pointer types        → 8  (64-bit model)
 *   unknown / auto       → 4  (safe default)
 *
 * `operandType` is set when sizeof is applied to a type name directly.
 * `operandExpr` is set when sizeof is applied to an expression.
 * Exactly one of the two will be defined.
 */
export interface IRSizeofExpression extends IRBaseNode {
  kind: "SizeofExpression";
  operandType?: string; // sizeof(int) → "int"
  operandExpr?: IRExpression; // sizeof(x)   → IRIdentifier("x")
}

/**
 * A comma expression: `expr1, expr2`. v2 addition.
 *
 * In C++, the comma operator evaluates both operands left-to-right and
 * returns the value of the right operand. The left operand is evaluated
 * purely for its side effects.
 *
 * Most commonly appears in for-loop update clauses:
 *   `for (int i=0, j=n-1; i<j; i++, j--)` → update: IRCommaExpression
 *
 * ExpressionEvaluator evaluates `left` (discarding the result), then
 * evaluates and returns `right`.
 */
export interface IRCommaExpression extends IRBaseNode {
  kind: "CommaExpression";
  left: IRExpression;
  right: IRExpression;
}
