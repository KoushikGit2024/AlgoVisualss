// ============================================================================
// IRBuilder.ts — Translates the raw Tree-sitter CST into the typed IR.
//
// This is the boundary between the parser and the execution engine. It takes
// the Tree-sitter `translation_unit` root node and emits an `IRProgram` whose
// nodes are consumed exclusively by IRWalker, StatementExecutor, and
// ExpressionEvaluator. Nothing downstream touches Tree-sitter nodes directly.
//
// Design rules:
//   - Every public/private method is responsible for exactly one grammar
//     construct. Build methods are named `build<NodeType>` and accept the
//     Tree-sitter node for that construct.
//   - Parse failures are handled in two ways:
//       • Fatal (throw)  — for constructs that cannot be safely skipped
//         (e.g. a malformed function body would corrupt all downstream parsing).
//       • Graceful skip  — for top-level constructs and unrecognised node types
//         that can be treated as no-ops (e.g. `using namespace std`).
//   - No business logic. The builder only translates syntax → IR. Type
//     resolution, default-value injection, and STL detection happen in
//     StatementExecutor and ExecutionEngine.
//
// Extension history:
//   v1 — Initial: functions, structs, all core statements, all expressions.
//   v2 — Added: try/catch/throw parsing; enum / enum class; typedef / using
//               type aliases; goto / labeled statements; sizeof expression;
//               comma expression (for-loop multi-update); const and static
//               qualifier detection in variable declarations; enums and aliases
//               collected into IRProgram.enums and IRProgram.aliases.
// ============================================================================

import type {
  IRProgram,
  IRFunctionDeclaration,
  IRFunctionCall,
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
  IRStructDeclaration,
  IRSwitchStatement,
  IRCaseClause,
  IRNode,
  IRTryStatement,
  IRThrowStatement,
  IRCatchClause,
  IREnumDeclaration,
  IREnumMember,
  IRTypeAlias,
  IRGotoStatement,
  IRLabeledStatement,
  IRSizeofExpression,
  IRCommaExpression,
} from "../ir/IRNode";


// ─── Tree-sitter Adapter ──────────────────────────────────────────────────────

/**
 * Minimal interface over a Tree-sitter SyntaxNode.
 * Kept intentionally thin to decouple the builder from any specific
 * tree-sitter API version or WASM binding.
 */
export interface SyntaxNode {
  type:            string;
  text:            string;
  startPosition:   { row: number; column: number };
  child(index: number): SyntaxNode | null;
  childCount:      number;
  children:        SyntaxNode[];
  namedChildren:   SyntaxNode[];
  isNamed:         boolean;
}


// ─── IRBuilder ────────────────────────────────────────────────────────────────

export class IRBuilder {

  // ==========================================================================
  // SECTION 1 — Top-level program builder
  // ==========================================================================

  /**
   * Entry point. Walks the `translation_unit` root node and dispatches each
   * top-level child to the appropriate builder.
   *
   * Top-level children fall into five categories:
   *   1. `function_definition`           → IRFunctionDeclaration
   *   2. `struct_specifier` / `class_specifier` → IRStructDeclaration
   *   3. `enum_specifier`                → IREnumDeclaration         (v2)
   *   4. `type_alias_declaration` /
   *      `typedef_declaration`           → IRTypeAlias               (v2)
   *   5. `declaration` (variable)        → IRVariableDeclaration[]   (global)
   *
   * All other top-level nodes (comments, preprocessor, using declarations)
   * are silently skipped — they have no runtime effect.
   *
   * @throws {Error} If `rootNode` is not a `translation_unit`.
   */
  public build(rootNode: SyntaxNode): IRProgram {
    if (rootNode.type !== "translation_unit") {
      throw new Error(
        "Compilation Error: IRBuilder.build() expects a translation_unit root node. " +
        `Received: '${rootNode.type}'.`
      );
    }

    const functions: IRFunctionDeclaration[] = [];
    const structs:   IRStructDeclaration[]   = [];
    const enums:     IREnumDeclaration[]     = [];
    const aliases:   IRTypeAlias[]           = [];
    const globals:   IRVariableDeclaration[] = [];

    for (const child of rootNode.namedChildren) {
      try {
        switch (child.type) {
          case "function_definition":
            functions.push(this.buildFunctionDeclaration(child));
            break;

          case "struct_specifier":
          case "class_specifier":
            structs.push(this.buildStructDeclaration(child));
            break;

          case "enum_specifier":          // v2
            enums.push(this.buildEnumDeclaration(child));
            break;

          case "type_alias_declaration":  // v2: `using ll = long long;`
          case "typedef_declaration":     // v2: `typedef vector<int> vi;`
            aliases.push(this.buildTypeAlias(child));
            break;

          case "declaration": {
            // A top-level declaration may be a struct/enum wrapped in a
            // typedef, a global variable, or `using namespace std` (skip).
            const structSpec = child.namedChildren.find(
              c => c.type === "struct_specifier" || c.type === "class_specifier"
            );
            const enumSpec = child.namedChildren.find(
              c => c.type === "enum_specifier"
            );

            if (structSpec) {
              structs.push(this.buildStructDeclaration(structSpec));
            } else if (enumSpec) {
              enums.push(this.buildEnumDeclaration(enumSpec));
            } else {
              // May throw for `using namespace std;` — catch and skip.
              try {
                globals.push(...this.buildVariableDeclaration(child));
              } catch {
                // Graceful skip: unrecognised or un-parseable global declarations.
              }
            }
            break;
          }

          // Silently skip anything else (comments, preproc, using declarations).
          default:
            break;
        }
      } catch (e) {
        // A fatal parse error in one top-level node should not prevent the
        // rest of the program from being compiled. Log and continue.
        console.warn(
          `[IRBuilder.build] Skipping top-level node '${child.type}' at line ` +
          `${child.startPosition.row + 1} due to parse error: ${(e as Error).message}`
        );
      }
    }

    return {
      kind:      "Program",
      line:      1,
      functions,
      structs,
      enums,
      aliases,
      globals,
    };
  }


  // ==========================================================================
  // SECTION 2 — Struct / enum / type-alias builders
  // ==========================================================================

  /**
   * Builds an IRStructDeclaration from a `struct_specifier` or `class_specifier`.
   *
   * Tree-sitter structure:
   *   struct_specifier
   *     type_identifier     ← struct name
   *     field_declaration_list
   *       field_declaration  ← one per field
   *         primitive_type | type_identifier   ← field type
   *         field_identifier | array_declarator ← field name
   *         [= <default_value>]
   */
  private buildStructDeclaration(node: SyntaxNode): IRStructDeclaration {
    const nameNode = node.namedChildren.find(c => c.type === "type_identifier");
    const name     = nameNode?.text ?? "anonymous_struct";

    const bodyNode = node.namedChildren.find(c => c.type === "field_declaration_list");
    const fields: IRStructDeclaration["fields"] = [];
    const constructors: IRFunctionDeclaration[] = [];
    const methods: IRFunctionDeclaration[]      = [];

    if (bodyNode) {
      for (const field of bodyNode.namedChildren) {
        if (field.type === "function_definition" || field.type === "declaration") {
          // A constructor is often parsed as a declaration if it lacks a return type, but contains a compound_statement
          const hasBody = field.namedChildren.some(c => c.type === "compound_statement");
          if (hasBody) {
            try {
              const funcDecl = this.buildFunctionDeclaration(field);
              if (funcDecl.name === name) {
                console.log(`[DEBUG] Pushed constructor ${funcDecl.name} to ${name}`);
                constructors.push(funcDecl);
              } else {
                methods.push(funcDecl);
              }
            } catch (e) {
              console.warn(`[IRBuilder] Skipping struct method parse error: ${(e as Error).message}`);
            }
            continue;
          }
        }

        if (field.type !== "field_declaration") {
          console.log(`[IRBuilder] Skipping struct field type: ${field.type}`);
          continue;
        }

        let type = field.child(0)?.text ?? "unknown";
        let decl = field.namedChildren.find(
          c => c.type === "field_identifier" || c.type === "array_declarator" || c.type === "pointer_declarator" || c.type === "reference_declarator"
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

        // Look for a default initialiser: `int x = 0;`
        let defaultValue: IRExpression | undefined;
        const eqIndex = field.children.findIndex(c => c.text === "=");
        if (eqIndex !== -1 && eqIndex + 1 < field.childCount) {
          const defaultNode = field.child(eqIndex + 1);
          if (defaultNode?.isNamed) {
            try { defaultValue = this.buildExpression(defaultNode); } catch { /* skip */ }
          }
        }

        if (fieldName !== "unknown") {
          fields.push({ name: fieldName, type, defaultValue });
        }
      }
    }

    return {
      kind:   "StructDeclaration",
      line:   node.startPosition.row + 1,
      name,
      fields,
      constructors,
      methods,
    };
  }

  /**
   * Builds an IREnumDeclaration from an `enum_specifier` node. v2 addition.
   *
   * Handles both plain enums and scoped enum classes:
   *   `enum Direction { NORTH, SOUTH }` → isClass: false
   *   `enum class Color : uint8_t { RED = 1, GREEN }` → isClass: true
   *
   * Tree-sitter structure:
   *   enum_specifier
   *     [class / struct keyword] ← present for `enum class`
   *     type_identifier          ← enum name
   *     [: primitive_type]       ← underlying type (enum class only)
   *     enumerator_list
   *       enumerator             ← one per member
   *         identifier           ← member name
   *         [= number_literal]   ← explicit value
   */
  private buildEnumDeclaration(node: SyntaxNode): IREnumDeclaration {
    // Check for `enum class` or `enum struct` keyword presence.
    const isClass = node.children.some(
      c => c.text === "class" || c.text === "struct"
    );

    const nameNode = node.namedChildren.find(c => c.type === "type_identifier");
    const name     = nameNode?.text ?? "anonymous_enum";

    // Underlying type comes after `:` in `enum class Color : uint8_t`.
    let underlyingType = "int";
    const colonIdx = node.children.findIndex(c => c.text === ":");
    if (colonIdx !== -1 && colonIdx + 1 < node.childCount) {
      const typeNode = node.child(colonIdx + 1);
      if (typeNode?.isNamed) underlyingType = typeNode.text;
    }

    const listNode  = node.namedChildren.find(c => c.type === "enumerator_list");
    const members: IREnumMember[] = [];

    if (listNode) {
      for (const enumerator of listNode.namedChildren) {
        if (enumerator.type !== "enumerator") continue;

        const memberName = enumerator.namedChildren.find(
          c => c.type === "identifier"
        )?.text;

        if (!memberName) continue;

        // Look for explicit value: `NORTH = 5`
        let value: IRExpression | undefined;
        const memberEqIdx = enumerator.children.findIndex(c => c.text === "=");
        if (memberEqIdx !== -1 && memberEqIdx + 1 < enumerator.childCount) {
          const valNode = enumerator.child(memberEqIdx + 1);
          if (valNode?.isNamed) {
            try { value = this.buildExpression(valNode); } catch { /* skip */ }
          }
        }

        members.push({ name: memberName, value });
      }
    }

    return {
      kind:           "EnumDeclaration",
      line:           node.startPosition.row + 1,
      name,
      isClass,
      underlyingType,
      members,
    };
  }

  /**
   * Builds an IRTypeAlias from a `type_alias_declaration` or `typedef_declaration`.
   * v2 addition.
   *
   * Handles:
   *   `using ll = long long;`      → alias: "ll",   target: "long long"
   *   `typedef vector<int> vi;`    → alias: "vi",   target: "vector<int>"
   *
   * Tree-sitter for `using`:
   *   type_alias_declaration
   *     type_identifier   ← alias name
   *     type_descriptor   ← target type
   *
   * Tree-sitter for `typedef`:
   *   typedef_declaration
   *     [type descriptor children…]  ← target type is all but the last child
   *     identifier | type_identifier ← alias name is the last named child
   */
  private buildTypeAlias(node: SyntaxNode): IRTypeAlias {
    let alias  = "unknown";
    let target = "unknown";

    if (node.type === "type_alias_declaration") {
      // `using alias = target;`
      const nameNode   = node.namedChildren.find(c => c.type === "type_identifier");
      alias            = nameNode?.text ?? "unknown";
      // Target is everything after the `=`.
      const eqIdx      = node.children.findIndex(c => c.text === "=");
      if (eqIdx !== -1 && eqIdx + 1 < node.childCount) {
        target = node.children
          .slice(eqIdx + 1)
          .filter(c => c.type !== ";" && c.isNamed)
          .map(c => c.text)
          .join(" ")
          .trim();
      }
    } else {
      // `typedef target alias;`
      const named      = node.namedChildren;
      const aliasNode  = named[named.length - 1];
      alias            = aliasNode?.text ?? "unknown";
      // Target is all named children except the last (the alias name).
      target           = named.slice(0, -1).map(c => c.text).join(" ").trim();
    }

    return {
      kind:   "TypeAlias",
      line:   node.startPosition.row + 1,
      alias,
      target,
    };
  }


  // ==========================================================================
  // SECTION 3 — Function declaration builder
  // ==========================================================================

  /**
   * Builds an IRFunctionDeclaration from a `function_definition` node.
   *
   * Handles pointer/reference return types by unwrapping declarator wrappers
   * until the function's name and parameter list are reached. Parses every
   * parameter for its type, name, isReference flag, and optional default value.
   */
  private buildFunctionDeclaration(node: SyntaxNode): IRFunctionDeclaration {
    let declaratorNode = node.children.find(c => 
      c.type === "function_declarator" || 
      c.type === "pointer_declarator" || 
      c.type === "reference_declarator"
    );
    let typeNode: any = node.child(0);
    if (typeNode && declaratorNode && ((typeof typeNode.equals === 'function' ? typeNode.equals(declaratorNode) : (typeNode as any).id === (declaratorNode as any).id) || typeNode.type === declaratorNode.type)) {
      // It's a constructor, so it has no return type
      typeNode = null;
    }
    const bodyNode = node.namedChildren.find(c => c.type === "compound_statement");

    if (!declaratorNode || !bodyNode) {
      throw new Error(
        `Compilation Error at line ${node.startPosition.row + 1}: ` +
        `Malformed function definition — missing declarator or body.`
      );
    }

    // Unwrap pointer / reference decorators on the return type declarator.
    while (
      declaratorNode &&
      (declaratorNode.type === "pointer_declarator" ||
       declaratorNode.type === "reference_declarator")
    ) {
      declaratorNode = declaratorNode.child(1) as SyntaxNode;
    }

    const functionName  = declaratorNode?.child(0)?.text ?? "unknown";
    const parametersNode = declaratorNode?.child(1);
    const parameters: IRFunctionDeclaration["parameters"] = [];

    if (parametersNode?.type === "parameter_list") {
      for (const param of parametersNode.namedChildren) {
        if (
          param.type !== "parameter_declaration" &&
          param.type !== "optional_parameter_declaration"
        ) continue;

        // Separate type tokens from the declarator node.
        let   paramTypeParts: string[]            = [];
        let   paramDeclNode:  SyntaxNode | undefined;

        for (const c of param.namedChildren) {
          if (
            c.type === "identifier"            ||
            c.type === "pointer_declarator"    ||
            c.type === "reference_declarator"  ||
            c.type === "array_declarator"      ||
            c.type === "function_declarator"
          ) {
            paramDeclNode = c;
            break;
          }
          paramTypeParts.push(c.text);
        }

        let paramType = paramTypeParts.join(" ") || "unknown";
        let paramName = "unknown";
        let isReference = false;
        let defaultValue: IRExpression | undefined;

        // Detect default value for optional parameters.
        if (param.type === "optional_parameter_declaration") {
          const lastChild = param.namedChildren[param.namedChildren.length - 1];
          if (lastChild && lastChild !== paramDeclNode) {
            try { defaultValue = this.buildExpression(lastChild); } catch { /* skip */ }
          }
        }

        // Unwrap pointer / reference / array declarators from the parameter name.
        while (
          paramDeclNode &&
          (paramDeclNode.type === "array_declarator"     ||
           paramDeclNode.type === "pointer_declarator"   ||
           paramDeclNode.type === "reference_declarator")
        ) {
          if (paramDeclNode.type === "reference_declarator") {
            isReference  = true;
            paramDeclNode = paramDeclNode.child(1) ?? undefined;
          } else if (paramDeclNode.type === "array_declarator") {
            paramType    += "[]";
            paramDeclNode = paramDeclNode.child(0) ?? undefined;
          } else {
            paramDeclNode = paramDeclNode.child(1) ?? undefined;
          }
        }

        if (paramDeclNode) paramName = paramDeclNode.text;
        parameters.push({ type: paramType, name: paramName, isReference, defaultValue });
      }
    }

    return {
      kind:       "FunctionDeclaration",
      line:       node.startPosition.row + 1,
      returnType: typeNode?.text ?? "void",
      name:       functionName,
      parameters,
      body:       this.buildBlock(bodyNode),
    };
  }


  // ==========================================================================
  // SECTION 4 — Block builder
  // ==========================================================================

  /**
   * Builds an IRBlock from a `compound_statement` node or wraps a single
   * statement in a synthetic block (for inline if/loop bodies without braces).
   *
   * Each statement in the block is dispatched through buildStatement(), which
   * may return a single IRNode or an array (for declarations that define
   * multiple variables: `int a = 1, b = 2;`).
   */
  private buildBlock(node: SyntaxNode): IRBlock {
    const statements: IRNode[] = [];

    if (node.type !== "compound_statement") {
      // Inline body (no braces): wrap the single statement.
      const stmt = this.buildStatement(node);
      if (Array.isArray(stmt)) statements.push(...stmt);
      else statements.push(stmt);
      return { kind: "Block", line: node.startPosition.row + 1, statements };
    }

    for (const child of node.namedChildren) {
      try {
        const stmt = this.buildStatement(child);
        if (Array.isArray(stmt)) statements.push(...stmt);
        else statements.push(stmt);
      } catch (e) {
        // A parse failure in one statement should not abort the whole block.
        console.warn(
          `[IRBuilder.buildBlock] Skipping statement '${child.type}' at line ` +
          `${child.startPosition.row + 1}: ${(e as Error).message}`
        );
        statements.push({ kind: "EmptyStatement", line: child.startPosition.row + 1 });
      }
    }

    return { kind: "Block", line: node.startPosition.row + 1, statements };
  }


  // ==========================================================================
  // SECTION 5 — Statement dispatcher
  // ==========================================================================

  /**
   * Routes a Tree-sitter node to the correct statement builder.
   *
   * Returns `IRNode | IRNode[]` because variable declarations can define
   * multiple variables in one statement (`int a = 1, b = 2;`) and are
   * represented as an array of IRVariableDeclarations. Callers (buildBlock)
   * spread arrays into the surrounding statements list.
   *
   * Unrecognised node types emit a console warning and produce an
   * IREmptyStatement rather than throwing, preventing a single unknown
   * construct from aborting compilation of the entire function body.
   */
  private buildStatement(node: SyntaxNode): IRNode | IRNode[] {
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

      case "for_range_loop":
        return this.buildForRangeStatement(node);

      case "switch_statement":
        return this.buildSwitchStatement(node);

      case "try_statement":          // v2
        return this.buildTryStatement(node);

      case "throw_statement":        // v2
        return this.buildThrowStatement(node);

      case "goto_statement":         // v2
        return this.buildGotoStatement(node);

      case "labeled_statement":      // v2
        return this.buildLabeledStatement(node);

      case "return_statement":
        return this.buildReturnStatement(node);

      case "break_statement":
        return this.buildBreakStatement(node);

      case "continue_statement":
        return this.buildContinueStatement(node);

      // Preprocessor directives and using declarations are no-ops at runtime.
      case "comment":
      case "preproc_include":
      case "preproc_def":
      case "using_declaration":
        return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;

      case "compound_statement":
        // Standalone blocks: `{ int x = 0; x++; }` appearing as a statement.
        return this.buildBlock(node);

      case "type_alias_declaration": // v2: `using` inside a function — treat as no-op
      case "typedef_declaration":    // v2: `typedef` inside a function — treat as no-op
        return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;

      case "ERROR":
        throw new Error(
          `Syntax Error at line ${node.startPosition.row + 1}: ` +
          `Tree-sitter encountered an unrecognised token sequence. ` +
          `Check for missing semicolons, mismatched braces, or unsupported C++ syntax.`
        );

      default:
        console.warn(
          `[IRBuilder.buildStatement] Skipping unsupported node type '${node.type}' ` +
          `at line ${node.startPosition.row + 1}.`
        );
        return { kind: "EmptyStatement", line: node.startPosition.row + 1 } as IREmptyStatement;
    }
  }


  // ==========================================================================
  // SECTION 6 — Individual statement builders
  // ==========================================================================

  /**
   * Builds IRVariableDeclaration(s) from a `declaration` node.
   *
   * A single declaration statement may define multiple variables:
   *   `int a = 1, b = 2, c = 3;` → [IRVarDecl(a), IRVarDecl(b), IRVarDecl(c)]
   *
   * Three declarator forms are handled:
   *   A. `init_declarator` with `=`           → sets `initializer`
   *   B. `init_declarator` with `argument_list` → sets `constructorArgs`
   *   C. `function_declarator`                → Tree-sitter misparse of `T v(n)`
   *      Recovered by extracting args from the "parameter list".
   *   D. Bare declarator                      → no initializer, no args
   *
   * v2: Detects `const` and `static` storage-class/type-qualifier tokens
   * in the declaration's child list and sets `isConst` / `isStatic` flags.
   */
  private buildVariableDeclaration(node: SyntaxNode): IRVariableDeclaration[] {
    const typeNode = node.child(0);
    if (!typeNode) {
      throw new Error(
        `Compilation Error at line ${node.startPosition.row + 1}: ` +
        `Malformed variable declaration — missing type node.`
      );
    }

    // v2: Detect const and static qualifiers anywhere in the declaration children.
    const allTokenTexts = node.children.map(c => c.text);
    const isConst  = allTokenTexts.includes("const");
    const isStatic = allTokenTexts.includes("static");

    // Filter out type and qualifier nodes; what remains are declarators.
    const declarators = node.namedChildren.filter(c =>
      c.type !== "primitive_type"          &&
      c.type !== "type_identifier"         &&
      c.type !== "sized_type_specifier"    &&
      c.type !== "template_type"           &&
      c.type !== "type_qualifier"          &&
      c.type !== "storage_class_specifier" &&
      c.type !== "struct_specifier"        &&
      c.type !== "enum_specifier"
    );

    const targetDeclarators = declarators.length > 0
      ? declarators
      : node.namedChildren.slice(1);

    const declarations: IRVariableDeclaration[] = [];

    for (const declaratorNode of targetDeclarators) {
      let name:            string              = "unknown";
      let initializer:     IRExpression | undefined;
      let constructorArgs: IRExpression[] | undefined;

      // ── Case A / B: init_declarator ──────────────────────────────────────
      if (declaratorNode.type === "init_declarator") {
        const coreDeclarator = declaratorNode.child(0) as SyntaxNode;
        name = this.getDeclaratorName(coreDeclarator);

        const child1 = declaratorNode.child(1);
        if (child1?.type === "argument_list") {
          // Case B: constructor-call syntax `vector<int> v(n, 0)`.
          constructorArgs = child1.namedChildren
            .map(c => { try { return this.buildExpression(c); } catch { return null; } })
            .filter((e): e is IRExpression => e !== null);
        } else {
          // Case A: standard assignment `int x = 5`.
          const valueNode =
            (declaratorNode as any).childForFieldName?.("value") ??
            declaratorNode.namedChildren[1];
          if (valueNode) {
            try { initializer = this.buildExpression(valueNode); } catch { /* skip */ }
          }
        }
      }

      // ── Case C: function_declarator misparse ─────────────────────────────
      // Tree-sitter treats `vector<int> v(n)` as a function declaration.
      // Recover by extracting the "parameters" as constructor arguments.
      else if (declaratorNode.type === "function_declarator") {
        const nameNode = declaratorNode.child(0);
        name = nameNode ? this.getDeclaratorName(nameNode) : "unknown";

        const paramList = declaratorNode.namedChildren.find(
            c => c.type === "parameter_list" || c.type === "argument_list"
          );
          if (paramList) {
            let innerText = paramList.text.slice(1, -1).trim();
            const splitArgs = (text: string): string[] => {
              const result: string[] = [];
              let current = "";
              let depth = 0;
              let inStr = false;
              let inChar = false;
              for (let i = 0; i < text.length; i++) {
                const char = text[i];
                const prev = i > 0 ? text[i - 1] : '';
                if (char === '"' && prev !== '\\' && !inChar) inStr = !inStr;
                else if (char === "'" && prev !== '\\' && !inStr) inChar = !inChar;
                else if (!inStr && !inChar) {
                  if (char === '(' || char === '<') depth++;
                  else if (char === ')' || char === '>') depth--;
                  else if (char === ',' && depth === 0) {
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
                rawArgs.push({ kind: "Literal", line: node.startPosition.row + 1, type: "number", value: argStr } as any);
              } else if (argStr.match(/^([a-zA-Z_][a-zA-Z0-9_]*\s*<\s*[a-zA-Z0-9_:\s]+\s*>)\s*\((.*)\)$/)) {
                const match = argStr.match(/^([a-zA-Z_][a-zA-Z0-9_]*\s*<\s*[a-zA-Z0-9_:\s]+\s*>)\s*\((.*)\)$/);
                const callee = match![1];
                const innerArgs = splitArgs(match![2]).filter(s => s);
                rawArgs.push({
                  kind: "FunctionCall",
                  line: node.startPosition.row + 1,
                  callee: callee,
                  arguments: innerArgs.map(a => !isNaN(Number(a))
                    ? { kind: "Literal", type: "number", value: a, line: node.startPosition.row + 1 } as any
                    : { kind: "Identifier", name: a, line: node.startPosition.row + 1 } as any)
                });
              } else if (argStr.match(/^([a-zA-Z_][a-zA-Z0-9_:]*)\s*\((.*)\)$/)) {
                const match = argStr.match(/^([a-zA-Z_][a-zA-Z0-9_:]*)\s*\((.*)\)$/);
                const callee = match![1];
                const innerArgs = splitArgs(match![2]).filter(s => s);
                rawArgs.push({
                  kind: "FunctionCall",
                  line: node.startPosition.row + 1,
                  callee: callee,
                  arguments: innerArgs.map(a => {
                    if (!isNaN(Number(a))) return { kind: "Literal", type: "number", value: Number(a), line: node.startPosition.row + 1 } as any;
                    if (a.startsWith("'") && a.endsWith("'")) return { kind: "Literal", type: "string", value: a.slice(1, -1), line: node.startPosition.row + 1 } as any;
                    if (a.startsWith('"') && a.endsWith('"')) return { kind: "Literal", type: "string", value: a.slice(1, -1), line: node.startPosition.row + 1 } as any;
                    return { kind: "Identifier", name: a, line: node.startPosition.row + 1 } as any;
                  })
                });
              } else {
                rawArgs.push({ kind: "Identifier", name: argStr, line: node.startPosition.row + 1 } as any);
              }
            }
            if (rawArgs.length > 0) constructorArgs = rawArgs;
          }
      }

      // ── Case D: Bare declarator (no initializer, no constructor args) ─────
      else {
        name = this.getDeclaratorName(declaratorNode);
      }

      let actualType = typeNode.text;
      let currDecl = declaratorNode;
      while (currDecl && (currDecl.type === "pointer_declarator" || currDecl.type === "reference_declarator")) {
        if (currDecl.type === "pointer_declarator") actualType += "*";
        if (currDecl.type === "reference_declarator") actualType += "&";
        currDecl = currDecl.child(1) as SyntaxNode;
      }

      declarations.push({
        kind:         "VariableDeclaration",
        line:         node.startPosition.row + 1,
        variableType: actualType,
        name,
        initializer,
        constructorArgs,
        isConst,    // v2
        isStatic,   // v2
      });
    }

    return declarations;
  }

  /**
   * Recursively extracts the raw identifier string from a declarator node,
   * piercing through pointer/reference/array/function wrappers.
   *
   * Examples:
   *   `int* ptr`             → pointer_declarator → "ptr"
   *   `int& ref`             → reference_declarator → "ref"
   *   `int arr[10]`          → array_declarator → "arr"
   *   `vector<int> v(n)`     → function_declarator → "v"  (misparse recovery)
   *   `identifier`           → "identifier text"
   */
  private getDeclaratorName(node: SyntaxNode): string {
    if (!node) return "unknown";
    if (node.type === "identifier") return node.text;

    if (
      node.type === "pointer_declarator"   ||
      node.type === "reference_declarator"
    ) {
      if (node.namedChildren.length > 0) {
        return this.getDeclaratorName(node.namedChildren[0]);
      }
      return node.child(1) ? this.getDeclaratorName(node.child(1)!) : "unknown";
    }

    if (node.type === "array_declarator") {
      if (node.namedChildren.length > 0) {
        return this.getDeclaratorName(node.namedChildren[0]);
      }
      return node.child(0) ? this.getDeclaratorName(node.child(0)!) : "unknown";
    }

    // Tree-sitter misparse: `vector<int> v(n)` → function_declarator.
    // child(0) is the name identifier; child(1) is the fake parameter list.
    if (node.type === "function_declarator") {
      if (node.namedChildren.length > 0) {
        return this.getDeclaratorName(node.namedChildren[0]);
      }
      return node.child(0) ? this.getDeclaratorName(node.child(0)!) : "unknown";
    }

    return node.text || "unknown";
  }

  /**
   * Builds an expression statement, an assignment statement, or a
   * cout statement from an `expression_statement` node.
   *
   * Assignments are elevated to IRAssignment (a distinct IR kind) so
   * StatementExecutor can handle them without going through the expression
   * evaluator path (which returns values but also has to handle l-values).
   *
   * Cout streams are intercepted here by detecting a `cout` identifier
   * on the left-most operand of a chain of shift_expressions.
   */
  private buildExpressionStatement(
    node: SyntaxNode
  ): IRExpressionStatement | IRAssignment | IRCoutStatement {
    const exprNode = node.namedChildren[0];

    // Elevate assignment expressions to root-level statements.
    if (exprNode.type === "assignment_expression") {
      return {
        kind:     "Assignment",
        line:     node.startPosition.row + 1,
        target:   this.buildExpression(exprNode.child(0) as SyntaxNode),
        operator: (exprNode.child(1)?.text ?? "=") as IRAssignment["operator"],
        value:    this.buildExpression(exprNode.child(2) as SyntaxNode),
      };
    }

    // ── cout interception ────────────────────────────────────────────────────
    // Tree-sitter represents `cout << a << b` as deeply nested shift_expression
    // nodes. Traverse left-most operands to detect the `cout` sentinel, then
    // unwind right-operands to collect all arguments in order.
    if (
      exprNode.type === "shift_expression" ||
      exprNode.type === "binary_expression"
    ) {
      let isCout  = false;
      let current = exprNode;

      // Walk left to find the root operand.
      while (
        current.type === "shift_expression" ||
        current.type === "binary_expression"
      ) {
        if (current.child(0)?.text === "cout") { isCout = true; break; }
        const left = current.child(0);
        if (left) current = left as SyntaxNode;
        else break;
      }

      if (isCout) {
        const args: IRExpression[] = [];
        current = exprNode;
        // Unwind right-hand operands from deepest to shallowest.
        while (
          current.type === "shift_expression" ||
          current.type === "binary_expression"
        ) {
          const right = current.child(2);
          if (right) args.unshift(this.buildExpression(right as SyntaxNode));
          current = current.child(0) as SyntaxNode;
        }
        return { kind: "CoutStatement", line: node.startPosition.row + 1, arguments: args };
      }
    }

    return {
      kind:       "ExpressionStatement",
      line:       node.startPosition.row + 1,
      expression: this.buildExpression(exprNode),
    };
  }

  /** Wraps any single-statement inline body into an IRBlock. */
  private wrapInBlock(n: SyntaxNode): IRBlock {
    if (n.type === "compound_statement") return this.buildBlock(n);
    const stmt = this.buildStatement(n);
    return {
      kind:       "Block",
      line:       n.startPosition.row + 1,
      statements: Array.isArray(stmt) ? stmt : [stmt],
    };
  }

  private buildIfStatement(node: SyntaxNode): IRIfStatement {
    const conditionNode = node.namedChildren.find(
      c => c.type === "condition_clause" || c.type === "parenthesized_expression"
    );
    const conditionIndex = node.namedChildren.indexOf(conditionNode as SyntaxNode);
    const consequentNode = node.namedChildren[conditionIndex + 1];
    const elseClause     = node.namedChildren.find(c => c.type === "else_clause");
    const alternateNode  = elseClause?.namedChildren[0];

    if (!conditionNode || !consequentNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed if statement.`
      );
    }

    const conditionExpr = conditionNode.type === "condition_clause"
      ? conditionNode.namedChildren[0]
      : conditionNode;

    return {
      kind:       "IfStatement",
      line:       node.startPosition.row + 1,
      condition:  this.buildExpression(conditionExpr),
      consequent: this.wrapInBlock(consequentNode),
      alternate:  alternateNode ? this.wrapInBlock(alternateNode) : undefined,
    };
  }

  private buildWhileStatement(node: SyntaxNode): IRWhileStatement {
    let conditionNode =
      (node as any).childForFieldName?.("condition") ??
      node.namedChildren.find(
        c => c.type === "condition_clause" || c.type === "parenthesized_expression"
      );

    if (conditionNode?.type === "condition_clause") {
      conditionNode = conditionNode.namedChildren[0];
    }

    let bodyNode =
      (node as any).childForFieldName?.("body") as SyntaxNode | undefined ??
      node.namedChildren.find(
        c => c.type === "compound_statement" || c.type === "expression_statement"
      ) ??
      node.namedChildren[node.namedChildren.length - 1];

    if (!conditionNode || !bodyNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed while loop.`
      );
    }

    return {
      kind:      "WhileStatement",
      line:      node.startPosition.row + 1,
      condition: this.buildExpression(conditionNode),
      body:      this.wrapInBlock(bodyNode),
    };
  }

  private buildDoWhileStatement(node: SyntaxNode): IRDoWhileStatement {
    let bodyNode =
      (node as any).childForFieldName?.("body") as SyntaxNode | undefined ??
      node.namedChildren.find(
        c => c.type === "compound_statement" || c.type === "expression_statement"
      );

    let conditionNode =
      (node as any).childForFieldName?.("condition") ??
      node.namedChildren.find(c => c.type === "parenthesized_expression");

    if (conditionNode?.type === "condition_clause") {
      conditionNode = conditionNode.namedChildren[0];
    }

    if (!conditionNode || !bodyNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed do-while loop.`
      );
    }

    return {
      kind:      "DoWhileStatement",
      line:      node.startPosition.row + 1,
      body:      this.wrapInBlock(bodyNode),
      condition: this.buildExpression(conditionNode),
    };
  }

  private buildForStatement(node: SyntaxNode): IRForStatement {
    const nativeNode    = node as any;
    const initNode      = nativeNode.childForFieldName?.("initializer") as SyntaxNode | undefined;
    const conditionNode = nativeNode.childForFieldName?.("condition")   as SyntaxNode | undefined;
    const updateNode    = nativeNode.childForFieldName?.("update")      as SyntaxNode | undefined;
    let   bodyNode      =
      nativeNode.childForFieldName?.("body") as SyntaxNode | undefined ??
      node.namedChildren[node.namedChildren.length - 1];

    if (!bodyNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed for loop — missing body.`
      );
    }

    // Build the initialiser.
    let init: IRForStatement["init"];
    if (initNode) {
      if (initNode.type === "declaration") {
        init = this.buildVariableDeclaration(initNode);
      } else if (initNode.type === "assignment_expression") {
        init = {
          kind:     "Assignment",
          line:     initNode.startPosition.row + 1,
          target:   this.buildExpression(initNode.child(0) as SyntaxNode),
          operator: (initNode.child(1)?.text ?? "=") as IRAssignment["operator"],
          value:    this.buildExpression(initNode.child(2) as SyntaxNode),
        };
      } else {
        init = this.buildExpressionStatement(initNode) as any;
      }
    }

    // Build the update. v2: detect comma expressions for `i++, j--`.
    let update: IRForStatement["update"];
    if (updateNode) {
      if (updateNode.type === "assignment_expression") {
        update = {
          kind:     "Assignment",
          line:     updateNode.startPosition.row + 1,
          target:   this.buildExpression(updateNode.child(0) as SyntaxNode),
          operator: (updateNode.child(1)?.text ?? "=") as IRAssignment["operator"],
          value:    this.buildExpression(updateNode.child(2) as SyntaxNode),
        };
      } else {
        update = this.buildExpression(updateNode);
      }
    }

    return {
      kind:      "ForStatement",
      line:      node.startPosition.row + 1,
      init,
      condition: conditionNode ? this.buildExpression(conditionNode) : undefined,
      update,
      body:      this.wrapInBlock(bodyNode),
    };
  }

  private buildForRangeStatement(node: SyntaxNode): IRForRangeStatement {
    let bodyNode =
      (node as any).childForFieldName?.("body") as SyntaxNode | undefined ??
      node.namedChildren[node.namedChildren.length - 1];

    let collectionNode =
      (node as any).childForFieldName?.("right") as SyntaxNode | undefined;

    if (!collectionNode) {
      const bodyIndex = node.namedChildren.findIndex(
        c => (c as any).id === (bodyNode as any)?.id
      );
      collectionNode = node.namedChildren[bodyIndex - 1];
    }

    if (!bodyNode || !collectionNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed range-based for loop.`
      );
    }

    let varType = "auto";
    let varName = "unknown";
    let isConst = false;
    const firstNode = node.namedChildren[0];

    if (firstNode?.type === "declaration") {
      let typeParts:     string[]              = [];
      let declaratorChild: SyntaxNode | undefined;

      for (const c of firstNode.namedChildren) {
        if (
          c.type === "identifier"                  ||
          c.type === "pointer_declarator"          ||
          c.type === "reference_declarator"        ||
          c.type === "array_declarator"            ||
          c.type === "function_declarator"         ||
          c.type === "structured_binding_declarator"
        ) {
          declaratorChild = c;
          break;
        }
        typeParts.push(c.text);
      }
      varType = typeParts.join(" ") || "auto";
      isConst = typeParts.includes("const");
      varName = declaratorChild ? this.getDeclaratorName(declaratorChild) : "unknown";
    } else {
      let typeParts: string[] = [];
      let declaratorChild: SyntaxNode | undefined;
      // In tree-sitter, the children before `collectionNode` comprise the type and declarator.
      for (const c of node.namedChildren) {
        if ((c as any).id === (collectionNode as any).id) break;
        if (
          c.type === "identifier"                  ||
          c.type === "pointer_declarator"          ||
          c.type === "reference_declarator"        ||
          c.type === "array_declarator"            ||
          c.type === "function_declarator"         ||
          c.type === "structured_binding_declarator"
        ) {
          declaratorChild = c;
          // Stop accumulating type parts once we hit the declarator
          break;
        }
        typeParts.push(c.text);
      }
      varType = typeParts.join(" ") || "auto";
      isConst = typeParts.includes("const");
      varName = declaratorChild ? this.getDeclaratorName(declaratorChild) : "unknown";
    }

    return {
      kind:         "ForRangeStatement",
      line:         node.startPosition.row + 1,
      iteratorType: varType,
      iteratorName: varName,
      isConst,
      collection:   this.buildExpression(collectionNode),
      body:         this.wrapInBlock(bodyNode),
    };
  }

  private buildSwitchStatement(node: SyntaxNode): IRSwitchStatement {
    const conditionNode = node.child(1)?.child(1); // switch ( <condition> )
    const bodyNode      = node.namedChildren.find(c => c.type === "compound_statement");

    if (!conditionNode || !bodyNode) {
      throw new Error(
        `Compilation Error at line ${node.startPosition.row + 1}: Malformed switch statement.`
      );
    }

    const cases: IRCaseClause[] = [];

    for (const child of bodyNode.namedChildren) {
      if (child.type !== "case_statement") continue;

      const isDefault = child.child(0)?.text === "default";
      let   valueNode: SyntaxNode | undefined;
      let   statementStartIndex = 0;

      if (isDefault) {
        statementStartIndex = 2; // `default :`
      } else {
        valueNode           = child.namedChildren[0];
        statementStartIndex = child.children.findIndex(c => c.text === ":") + 1;
      }

      const caseStatements: IRNode[] = [];
      for (let i = statementStartIndex; i < child.childCount; i++) {
        const c = child.child(i);
        if (c?.isNamed) {
          try {
            const stmt = this.buildStatement(c);
            if (Array.isArray(stmt)) caseStatements.push(...stmt);
            else caseStatements.push(stmt);
          } catch { /* skip unparseable case body statements */ }
        }
      }

      cases.push({
        kind:      "CaseClause",
        line:      child.startPosition.row + 1,
        isDefault,
        value:     valueNode ? this.buildExpression(valueNode) : undefined,
        statements: caseStatements,
      });
    }

    return {
      kind:      "SwitchStatement",
      line:      node.startPosition.row + 1,
      condition: this.buildExpression(conditionNode),
      cases,
    };
  }

  // ── v2: Exception handling ─────────────────────────────────────────────────

  /**
   * Builds an IRTryStatement from a `try_statement` node. v2 addition.
   *
   * Tree-sitter structure:
   *   try_statement
   *     compound_statement          ← try body
   *     catch_clause*               ← zero or more handlers
   *
   *   catch_clause
   *     parameter_declaration       ← `int e`, `std::exception& e`, or `...`
   *     compound_statement          ← handler body
   */
  private buildTryStatement(node: SyntaxNode): IRTryStatement {
    const bodyNode = node.namedChildren.find(c => c.type === "compound_statement");
    if (!bodyNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed try statement — missing body.`
      );
    }

    const handlers: IRCatchClause[] = [];
    for (const child of node.namedChildren) {
      if (child.type === "catch_clause") {
        handlers.push(this.buildCatchClause(child));
      }
    }

    return {
      kind:     "TryStatement",
      line:     node.startPosition.row + 1,
      body:     this.buildBlock(bodyNode),
      handlers,
    };
  }

  /**
   * Builds an IRCatchClause from a `catch_clause` node. v2 addition.
   *
   * Handles:
   *   catch (int e)               → catchType: "int",  catchParam: "e"
   *   catch (std::exception& e)   → catchType: "std::exception", catchParam: "e"
   *   catch (int)                 → catchType: "int",  catchParam: undefined
   *   catch (...)                 → catchAll: true
   */
  private buildCatchClause(node: SyntaxNode): IRCatchClause {
    const bodyNode = node.namedChildren.find(c => c.type === "compound_statement");

    if (!bodyNode) {
      throw new Error(
        `Syntax Error at line ${node.startPosition.row + 1}: Malformed catch clause — missing body.`
      );
    }

    // Detect catch-all: `catch (...)`
    const isCatchAll = node.children.some(c => c.text === "...");
    if (isCatchAll) {
      return {
        kind:     "CatchClause",
        line:     node.startPosition.row + 1,
        catchAll: true,
        body:     this.buildBlock(bodyNode),
      };
    }

    // Find the parameter declaration inside the catch parentheses.
    const paramNode = node.namedChildren.find(c => c.type === "parameter_declaration");
    let catchType:  string | undefined;
    let catchParam: string | undefined;

    if (paramNode) {
      // Type: all named children except the last declarator.
      const typeParts: string[] = [];
      let   declNode: SyntaxNode | undefined;

      for (const c of paramNode.namedChildren) {
        if (
          c.type === "identifier"           ||
          c.type === "pointer_declarator"   ||
          c.type === "reference_declarator"
        ) {
          declNode = c;
          break;
        }
        typeParts.push(c.text);
      }

      catchType  = typeParts.join(" ").trim() || undefined;
      catchParam = declNode ? this.getDeclaratorName(declNode) : undefined;
    }

    return {
      kind:      "CatchClause",
      line:      node.startPosition.row + 1,
      catchType,
      catchParam,
      catchAll:  false,
      body:      this.buildBlock(bodyNode),
    };
  }

  /**
   * Builds an IRThrowStatement from a `throw_statement` node. v2 addition.
   *
   * `throw;` (bare re-throw) has no named children → argument: undefined.
   * `throw 42;` has one named child → argument: IRLiteral(42).
   */
  private buildThrowStatement(node: SyntaxNode): IRThrowStatement {
    const argNode = node.namedChildren[0];
    return {
      kind:      "ThrowStatement",
      line:      node.startPosition.row + 1,
      argument:  argNode ? this.buildExpression(argNode) : undefined,
    };
  }

  /**
   * Builds an IRGotoStatement from a `goto_statement` node. v2 addition.
   *
   * Full goto support requires two-pass compilation to resolve labels before
   * execution. IRWalker surfaces this as an UnsupportedFeatureError at runtime
   * rather than crashing during parsing.
   */
  private buildGotoStatement(node: SyntaxNode): IRGotoStatement {
    // Label identifier is typically the first (and only) named child.
    const labelNode = node.namedChildren.find(c => c.type === "identifier");
    return {
      kind:  "GotoStatement",
      line:  node.startPosition.row + 1,
      label: labelNode?.text ?? "unknown",
    };
  }

  /**
   * Builds an IRLabeledStatement from a `labeled_statement` node. v2 addition.
   *
   * The label itself is a no-op at runtime (goto is unsupported); the inner
   * statement is executed normally. This avoids crashing when label-statement
   * patterns appear without a matching goto (common in macro-generated code).
   */
  private buildLabeledStatement(node: SyntaxNode): IRLabeledStatement {
    const labelNode     = node.namedChildren.find(c => c.type === "identifier");
    const statementNode = node.namedChildren.find(c => c.type !== "identifier");

    if (!statementNode) {
      return {
        kind:      "LabeledStatement",
        line:      node.startPosition.row + 1,
        label:     labelNode?.text ?? "unknown",
        statement: { kind: "EmptyStatement", line: node.startPosition.row + 1 },
      };
    }

    const stmt = this.buildStatement(statementNode);
    return {
      kind:      "LabeledStatement",
      line:      node.startPosition.row + 1,
      label:     labelNode?.text ?? "unknown",
      statement: Array.isArray(stmt) ? stmt[0] ?? { kind: "EmptyStatement", line: node.startPosition.row + 1 } : stmt,
    };
  }

  private buildReturnStatement(node: SyntaxNode): IRReturnStatement {
    const argNode = node.namedChildren[0];
    return {
      kind:     "ReturnStatement",
      line:     node.startPosition.row + 1,
      argument: argNode ? this.buildExpression(argNode) : undefined,
    };
  }

  private buildBreakStatement(node: SyntaxNode): IRBreakStatement {
    return { kind: "BreakStatement", line: node.startPosition.row + 1 };
  }

  private buildContinueStatement(node: SyntaxNode): IRContinueStatement {
    return { kind: "ContinueStatement", line: node.startPosition.row + 1 };
  }


  // ==========================================================================
  // SECTION 7 — Expression builder
  // ==========================================================================

  /**
   * Recursively translates a Tree-sitter expression node into an IRExpression.
   *
   * Falls through to a safe null-literal default for unrecognised node types
   * rather than throwing, preventing a single unknown expression from aborting
   * compilation of the surrounding statement.
   */
  private buildExpression(node: SyntaxNode): IRExpression {
    switch (node.type) {

      // ── Literals ─────────────────────────────────────────────────────────
      case "number_literal": {
        // Strip numeric suffixes (f, u, l, ll, ULL, …) before parsing.
        const clean = node.text.replace(/[fFuUlL]+$/, "");
        return {
          kind:      "Literal",
          line:      node.startPosition.row + 1,
          valueType: "double",
          value:     Number(clean),
        };
      }

      case "true":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: true };

      case "false":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "bool", value: false };

      case "string_literal": {
        const unescaped = node.text
          .slice(1, -1)
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\"/g, '"')
          .replace(/\\r/g, "\r")
          .replace(/\\\\/g, "\\");
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "string", value: unescaped };
      }

      case "char_literal": {
        const unescaped = node.text
          .slice(1, -1)
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "\t")
          .replace(/\\'/g, "'")
          .replace(/\\\\/g, "\\");
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "char", value: unescaped };
      }

      case "null":
      case "nullptr":
        return { kind: "Literal", line: node.startPosition.row + 1, valueType: "nullptr", value: null };

      // ── Identifiers ───────────────────────────────────────────────────────
      case "identifier":
      case "qualified_identifier":  // std::pair → single identifier "std::pair"
      case "type_identifier":       // User-defined type names in expression position
      case "primitive_type":        // `int` in sizeof(int)
      case "sized_type_specifier":  // `long long` in expression context
        return { kind: "Identifier", line: node.startPosition.row + 1, name: node.text };

      // ── `this` keyword ────────────────────────────────────────────────────
      // Tree-sitter parses `this` inside struct/class bodies as a node with
      // type "this" (confirmed via debug). Map it to Identifier "this" so
      // `this->field` and `this.field` member assignments resolve correctly.
      case "this":
      case "this_expression":
        console.log(`[IRBuilder DEBUG] ✅ '${node.type}' hit at line ${node.startPosition.row + 1} → mapping to Identifier 'this'`);
        return { kind: "Identifier", line: node.startPosition.row + 1, name: "this" };

      // ── Sizeof expression ─────────────────────────────────────────────────
      // v2: `sizeof(int)`, `sizeof(x)`, `sizeof x`
      case "sizeof_expression": {
        // The operand is the first named child.
        const operandNode = node.namedChildren[0];
        if (!operandNode) {
          return { kind: "Literal", line: node.startPosition.row + 1, valueType: "int", value: 4 };
        }
        // If the operand looks like a type name, record it as operandType.
        const isTypeName =
          operandNode.type === "type_descriptor"   ||
          operandNode.type === "primitive_type"     ||
          operandNode.type === "type_identifier"    ||
          operandNode.type === "sized_type_specifier";

        if (isTypeName) {
          return {
            kind:        "SizeofExpression",
            line:        node.startPosition.row + 1,
            operandType: operandNode.text,
          } as IRSizeofExpression;
        }
        return {
          kind:        "SizeofExpression",
          line:        node.startPosition.row + 1,
          operandExpr: this.buildExpression(operandNode),
        } as IRSizeofExpression;
      }

      // ── Comma expression ──────────────────────────────────────────────────
      // v2: `i++, j--` in for-loop update position, or standalone comma expr.
      case "comma_expression": {
        const left  = node.namedChildren[0];
        const right = node.namedChildren[node.namedChildren.length - 1];
        // For chains `a, b, c`, Tree-sitter nests as `(a, b), c`.
        // Recursing on `left` handles the nesting naturally.
        return {
          kind:  "CommaExpression",
          line:  node.startPosition.row + 1,
          left:  this.buildExpression(left),
          right: this.buildExpression(right),
        } as IRCommaExpression;
      }

      // ── Unary expressions ─────────────────────────────────────────────────
      case "unary_expression":
      case "pointer_expression":
        return {
          kind:     "UnaryExpression",
          line:     node.startPosition.row + 1,
          operator: node.child(0)?.text as UnaryOperator,
          argument: this.buildExpression(node.child(1) as SyntaxNode),
        };

      // ── Binary / shift expressions ────────────────────────────────────────
      // shift_expression and binary_expression share the same left/op/right structure.
      case "shift_expression":
      case "binary_expression":
        return {
          kind:     "BinaryExpression",
          line:     node.startPosition.row + 1,
          left:     this.buildExpression(node.child(0) as SyntaxNode),
          operator: node.child(1)?.text as BinaryOperator,
          right:    this.buildExpression(node.child(2) as SyntaxNode),
        };

      // ── Update expressions ────────────────────────────────────────────────
      case "update_expression": {
        const isPrefix = node.child(0)?.text === "++" || node.child(0)?.text === "--";
        return {
          kind:     "UpdateExpression",
          line:     node.startPosition.row + 1,
          operator: (isPrefix ? node.child(0)?.text : node.child(1)?.text) as UpdateOperator,
          argument: this.buildExpression(node.child(isPrefix ? 1 : 0) as SyntaxNode),
          prefix:   isPrefix,
        };
      }

      // ── Assignment in expression context ──────────────────────────────────
      case "assignment_expression":
        return {
          kind:     "Assignment",
          line:     node.startPosition.row + 1,
          target:   this.buildExpression(node.child(0) as SyntaxNode),
          operator: (node.child(1)?.text ?? "=") as IRAssignment["operator"],
          value:    this.buildExpression(node.child(2) as SyntaxNode),
        };

      // ── Subscript expression ──────────────────────────────────────────────
      case "subscript_expression":
        return this.buildSubscriptExpression(node);

      // ── Conditional / ternary expression ─────────────────────────────────
      case "conditional_expression":
        return this.buildTernaryExpression(node);

      // ── Initializer list ─────────────────────────────────────────────────
      case "initializer_list":
      case "parameter_pack_expansion":
        return {
          kind:     "InitializerList",
          line:     node.startPosition.row + 1,
          elements: node.namedChildren
            .filter(c => c.type !== "comment")
            .map(c => this.buildExpression(c)),
        };

      // ── Field / member access ─────────────────────────────────────────────
      case "field_expression":
        return {
          kind:     "MemberExpression",
          line:     node.startPosition.row + 1,
          object:   this.buildExpression(node.child(0) as SyntaxNode),
          property: node.child(2)?.text ?? "unknown",
          arrow:    node.child(1)?.text === "->",
        };

      // ── Cast expression ───────────────────────────────────────────────────
      // Strip the cast and evaluate the inner expression. For (int) and (long)
      // casts, emit a FunctionCall to `trunc` to enforce integer truncation.
      case "cast_expression": {
        const castValueNode = node.namedChildren.find(
          c => c.type !== "type_descriptor" && c.type !== "abstract_type"
        );
        let innerExpr: IRExpression;
        if (castValueNode) {
          innerExpr = this.buildExpression(castValueNode);
        } else {
          const last = node.namedChildren[node.namedChildren.length - 1];
          innerExpr  = last
            ? this.buildExpression(last)
            : { kind: "Literal", line: node.startPosition.row + 1, valueType: "int", value: 0 };
        }

        const stripped = node.text.replace(/\s+/g, "");
        if (stripped.startsWith("(int)") || stripped.startsWith("(long)")) {
          return {
            kind:      "FunctionCall",
            line:      node.startPosition.row + 1,
            callee:    "trunc",
            arguments: [innerExpr],
          } as IRFunctionCall;
        }
        return innerExpr;
      }

      // ── Call expression ───────────────────────────────────────────────────
      case "call_expression": {
        const calleeNode  = node.child(0);
        const argListNode = node.namedChildren.find(c => c.type === "argument_list");
        const args        = argListNode
          ? argListNode.namedChildren.map(c => this.buildExpression(c))
          : [];

        // Method call: callee is a field_expression (object.method or object->method).
        if (calleeNode?.type === "field_expression") {
          return {
            kind:      "MethodCall",
            line:      node.startPosition.row + 1,
            object:    this.buildExpression(calleeNode.child(0) as SyntaxNode),
            method:    calleeNode.child(2)?.text ?? "unknown",
            arguments: args,
            arrow:     calleeNode.child(1)?.text === "->",
          };
        }

        // Strip template params from the callee name: `sort<int>` → `sort`.
        let calleeName = calleeNode?.text ?? "unknown";
        if (calleeNode?.type === "template_function") {
          calleeName = calleeNode.child(0)?.text ?? calleeName;
        }
        // Strip std:: namespace prefix for cleaner polyfill resolution.
        if (calleeName.startsWith("std::")) calleeName = calleeName.slice(5);

        return {
          kind:      "FunctionCall",
          line:      node.startPosition.row + 1,
          callee:    calleeName,
          arguments: args,
        };
      }

      // ── Parenthesised expression ──────────────────────────────────────────
      case "parenthesized_expression":
        return this.buildExpression(node.namedChildren[0]);

      // ── New expression ────────────────────────────────────────────────────
      case "new_expression": {
        const typeNode    = node.namedChildren[0];
        const argListNode = node.namedChildren.find(c => c.type === "argument_list");
        const args        = argListNode
          ? argListNode.namedChildren.map(c => this.buildExpression(c))
          : [];
        return {
          kind:      "NewExpression",
          line:      node.startPosition.row + 1,
          typeName:  typeNode?.text ?? "unknown",
          arguments: args,
        };
      }

      // ── Lambda expression ─────────────────────────────────────────────────
      case "lambda_expression": {
        const lambdaBodyNode = node.namedChildren.find(c => c.type === "compound_statement");
        const parameters: { name: string; type: string }[] = [];

        const extractParams = (n: SyntaxNode) => {
          if (n.type === "parameter_declaration") {
            const pType =
              (n as any).childForFieldName?.("type")?.text ??
              n.child(0)?.text ??
              "unknown";
            let pDeclNode: SyntaxNode | undefined =
              (n as any).childForFieldName?.("declarator");
            if (!pDeclNode) {
              for (const c of n.namedChildren) {
                if (
                  c.type === "identifier"           ||
                  c.type === "pointer_declarator"   ||
                  c.type === "reference_declarator" ||
                  c.type === "array_declarator"     ||
                  c.type === "function_declarator"
                ) {
                  pDeclNode = c;
                  break;
                }
              }
            }
            parameters.push({
              type: pType,
              name: pDeclNode ? this.getDeclaratorName(pDeclNode) : "unknown",
            });
          } else if (n.type !== "compound_statement") {
            n.namedChildren.forEach(extractParams);
          }
        };
        node.namedChildren.forEach(extractParams);

        return {
          kind:       "LambdaExpression",
          line:       node.startPosition.row + 1,
          parameters,
          body:       lambdaBodyNode
            ? this.buildBlock(lambdaBodyNode)
            : { kind: "Block", line: node.startPosition.row + 1, statements: [] },
        };
      }

      case "ERROR":
        throw new Error(
          `Compilation Error at line ${node.startPosition.row + 1}: ` +
          `Tree-sitter could not parse this expression. ` +
          `Common causes: complex C++ templates, SFINAE, or ambiguous pointer syntax.`
        );

      default:
        // Emit a warning but return a safe null literal so the surrounding
        // statement can still compile rather than aborting the whole function.
        console.warn(
          `[IRBuilder.buildExpression] ❌ Unsupported expression type '${node.type}' ` +
          `at line ${node.startPosition.row + 1}. Substituting null. TEXT: '${node.text}'`
        );
        return {
          kind:      "Literal",
          line:      node.startPosition.row + 1,
          valueType: "nullptr",
          value:     null,
        };
    }
  }

  // ── Expression sub-builders ───────────────────────────────────────────────

  private buildSubscriptExpression(node: SyntaxNode): IRSubscriptExpression {
    const objectNode = node.namedChildren[0];
    const indexNode  = node.namedChildren[1];

    if (!objectNode || !indexNode) {
      throw new Error(
        `Compilation Error at line ${node.startPosition.row + 1}: ` +
        `Malformed subscript expression — missing object or index.`
      );
    }

    // Modern tree-sitter wraps the index in a `subscript_argument_list` node.
    const actualIndex = indexNode.type === "subscript_argument_list"
      ? indexNode.namedChildren[0]
      : indexNode;

    return {
      kind:   "SubscriptExpression",
      line:   node.startPosition.row + 1,
      object: this.buildExpression(objectNode),
      index:  this.buildExpression(actualIndex),
    };
  }

  private buildTernaryExpression(node: SyntaxNode): IRTernaryExpression {
    return {
      kind:       "TernaryExpression",
      line:       node.startPosition.row + 1,
      condition:  this.buildExpression(node.namedChildren[0]),
      consequent: this.buildExpression(node.namedChildren[1]),
      alternate:  this.buildExpression(node.namedChildren[2]),
    };
  }
}