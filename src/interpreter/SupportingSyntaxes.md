# Supported C++ Syntaxes (Tree-Sitter)

This document tracks the `tree-sitter-cpp` keywords and syntax nodes that are officially supported by the AlgoVisuals interpreter, verified against the internal `IRBuilder.ts` and `ExecutionEngine.ts` logic.

## 1. Program Structure & Scope Blocks
These nodes define the boundaries of code blocks and state management limits.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `translation_unit` | Absolute root node of the file | (The entire file) | ✅ |
| `compound_statement` | Block of code | `{ ... }` | ✅ |
| `expression_statement` | Code evaluating an expression | `x = 5;` | ✅ |
| `declaration_statement` | Variable declarations | `int x = 5;` | ✅ |
| `empty_statement` | A standalone semicolon | `;` | ✅ |

## 2. Variables, Complex Declarations & Types
To track state, values, arrays, aliases, and initializations.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `declaration` | Standard variable declaration | `int x = 5;` | ✅ |
| `primitive_type` | Basic data types | `int`, `float`, `bool` | ✅ |
| `identifier` | Variable or function name | `x`, `arr` | ✅ |
| `number_literal` | Numeric constants | `42`, `3.14` | ✅ |
| `boolean_literal` | Boolean constants | `true`, `false` | ✅ |
| `null` | Null pointer constant | `nullptr` | ✅ |
| `init_declarator` | Variable with initial value | `x = 5` inside declaration | ✅ |
| `reference_declarator` | Reference types | `int& ref = x;` | ✅ (Parsed dynamically) |
| `initializer_list` | Brace initialization | `vector<int> v = {1, 2}` | ✅ |
| `type_definition` | C-style typedef | `typedef vector<int> vi;` | ✅ (Added support) |
| `alias_declaration` | Modern C++ using | `using vi = vector<int>;` | ✅ (Added support) |

## 3. Expressions & Operations (The Math & Logic)
Crucial for visualizing comparisons, sizing, and calculations.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `assignment_expression` | Assigning values | `x = 5`, `x += 2` | ✅ |
| `binary_expression` | Arithmetic/logic | `left < right`, `i + 1` | ✅ |
| `unary_expression` | Single operand operations | `!found`, `-x`, `&x`, `*ptr` | ✅ |
| `update_expression` | Increment / decrement | `i++`, `--j` | ✅ |
| `conditional_expression` | Ternary conditional | `a > b ? a : b` | ✅ |
| `sizeof_expression` | Size of a type or variable | `sizeof(int)` | ✅ |
| `comma_expression` | Multiple chained expressions | `i++, j--` | ✅ |
| `parenthesized_expression`| Grouped logic | `(a + b)` | ✅ |
| `cast_expression` | C-style casts | `(int)x` | ✅ (Added bypass) |
| `template_function` | C++ style casts / templates | `static_cast<int>(x)` | ✅ (Added bypass) |

## 4. Control Flow, Loops, & Jump Targets
These define the step-by-step execution path the visualizer traces.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `if_statement` | Conditional branching | `if (x > 0) { ... }` | ✅ |
| `condition_clause` | Condition inside `if`/`while` | `(x > 0)` | ✅ |
| `for_statement` | Standard loop | `for(int i=0; i<n; i++)` | ✅ |
| `for_range_loop` | Range-based loop | `for(auto x : arr)` | ✅ |
| `while_statement` | While loop | `while(node != nullptr)` | ✅ |
| `do_statement` | Do-while loop | `do { ... } while(x);` | ✅ |
| `switch_statement` | Switch block | `switch(x) { ... }` | ✅ |
| `case_statement` | Switch case | `case 1:`, `default:` | ✅ |
| `labeled_statement` | Jump targets | `start_loop:` | ✅ |
| `goto_statement` | Jumping to targets | `goto start_loop;` | ✅ |
| `break_statement` | Exiting a loop early | `break;` | ✅ |
| `continue_statement` | Skipping to next iteration | `continue;` | ✅ |
| `return_statement` | Returning from a function | `return x;` | ✅ |

## 5. Arrays, Advanced Functions & Lambdas
To visualize array algorithms, recursive call stacks, and constructors.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `array_declarator` | Declaring an array type | `int arr[10];` | ✅ |
| `subscript_expression` | Array element access | `arr[i]` | ✅ |
| `function_definition` | Defining a function | `void sort() { ... }` | ✅ |
| `function_declarator` | The signature of a function | `void sort(int arr[])` | ✅ |
| `call_expression` | Calling a function | `sort(arr, 0, n-1)` | ✅ |
| `argument_list` | Passed arguments in a call | `(arr, 0, n-1)` | ✅ |
| `parameter_list` | Defined parameters | `(int arr[], int l)` | ✅ |
| `field_initializer_list`| Constructor initializers | `: count(0)` | ✅ |
| `lambda_expression` | Anonymous functions | `[]() { ... }` | ❌ (Not supported) |
| `capture_list` | Lambda closure arguments | `[x, &y]` | ❌ (Not supported) |
| `trailing_return_type` | Auto return typing | `-> int` | ❌ (Not supported) |

## 6. Memory & Pointers (Trees, Graphs, Linked Lists)
Crucial for navigating trees and dynamically allocating nodes.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `pointer_declarator` | Pointer declaration | `Node* root;` | ✅ |
| `new_expression` | Dynamic memory allocation | `new Node(1)` | ✅ |
| `delete_expression` | Dynamic memory deallocation| `delete node;` | ✅ |
| `member_expression` | Accessing object members | `node.value`, `node->left` | ✅ |

## 7. Object-Oriented Structures, Generics & Exceptions
How DSA nodes and graphs are wrapped in code, plus namespaces and macros.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `class_specifier` | Class definition | `class Graph { ... };` | ✅ |
| `struct_specifier` | Struct definition | `struct Node { ... };` | ✅ |
| `access_specifier` | Access modifiers | `public:`, `private:` | ✅ (Parsed, ignored) |
| `field_declaration` | Member variables | `int val; Node* next;` | ✅ |
| `method_definition` | Class/struct methods | `void insert(int v) { }`| ✅ |
| `enum_specifier` | Enum definition | `enum Color { RED };` | ✅ |
| `template_declaration` | Generic type declarations | `template <typename T>` | ✅ (Parsed dynamically) |
| `template_argument_list`| Instantiation arguments | `<int, string>` | ✅ |
| `try_statement` | Try block | `try { ... }` | ✅ |
| `catch_clause` | Catch block | `catch (exception e) { }` | ✅ |
| `throw_statement` | Throwing an exception | `throw "Error";` | ✅ |
| `namespace_definition` | Scoped code blocks | `namespace MyAlgo { }` | ❌ (Ignored) |
| `using_declaration` | Namespace imports | `using namespace std;` | ❌ (Ignored) |
| `base_class_clause` | Class inheritance | `: public BaseTree` | ❌ (Ignored) |
| `preproc_include` | Header inclusion | `#include <vector>` | ❌ (Ignored) |
| `preproc_def` | Macros | `#define MAX 100` | ❌ (Ignored) |

## 8. Modern C++ (C++17 & C++20 Features)
Visualizing advanced paradigms like unpacking variables, template constraints, or lazy evaluation.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `structured_binding_declarator`| Unpacking tuple/struct | `auto [x, y] = point;` | ❌ (Not supported) |
| `fold_expression` | Variadic template folds | `(... + args)` | ❌ (Not supported) |
| `concept_definition` | C++20 Concepts | `concept Eq = ...` | ❌ (Not supported) |
| `requires_clause` | Template requirements | `requires (T a)` | ❌ (Not supported) |
| `requires_expression` | Expression requirements | `requires { a.run(); }`| ❌ (Not supported) |
| `co_await_expression` | Coroutine await | `co_await task;` | ❌ (Not supported) |
| `co_yield_expression` | Coroutine yield | `co_yield val;` | ❌ (Not supported) |
| `co_return_statement` | Coroutine return | `co_return;` | ❌ (Not supported) |
| `module_declaration` | C++20 Modules | `module Math;` | ❌ (Not supported) |
| `export_declaration` | Exporting modules | `export class A {};` | ❌ (Not supported) |
| `import_declaration` | Importing modules | `import std;` | ❌ (Not supported) |

## 9. Strings, Literals & Escapes
Tracking strings distinctly from normal code.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `string_literal` | Standard string | `"Hello"` | ✅ |
| `raw_string_literal` | Raw string | `R"(...)"` | ✅ (Added support) |
| `concatenated_string` | Adjacent strings | `"Hello " "World"` | ✅ (Added support) |
| `escape_sequence` | String escapes | `\n`, `\t` | ✅ (Parsed internally) |
| `user_defined_literal`| Custom suffixes | `10s`, `3.14_rad` | ❌ (Not supported) |

## 10. Attributes, Metadata & Casts
Compiler instructions and advanced Type introspections.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `attribute_specifier` | Attribute block | `[[nodiscard]]` | ✅ (Parsed, ignored) |
| `attribute` | Specific tag | `nodiscard` | ✅ (Parsed, ignored) |
| `attribute_declaration`| Standalone attribute | `[[maybe_unused]];` | ✅ (Parsed, ignored) |
| `type_trait` | Compiler built-ins | `__is_trivial(T)` | ❌ (Not supported) |
| `typeid_expression` | Type info extraction | `typeid(x)` | ❌ (Not supported) |
| `noexcept_expression` | Exception guarantee | `noexcept(x + y)` | ❌ (Not supported) |

## 11. Advanced Operators, Layouts, & Pointers to Members
Deep memory layouts and overloaded syntax.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `operator_name` | Overloaded operators | `operator++` | ❌ (Not supported) |
| `pointer_to_member_declarator`| Ptr to class member | `int Class::*ptr` | ❌ (Not supported) |
| `pointer_to_member_expression`| Access via member ptr | `obj.*ptr` | ❌ (Not supported) |
| `bitfield_clause` | Memory bitfields | `int flags : 4;` | ❌ (Ignored) |

## 12. Declarator Edge Cases
Nodes used by Tree-Sitter to resolve C++ ambiguities.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `parenthesized_declarator` | Wrapped declarators | `int (*func_ptr)(int)`| ❌ (Not supported) |
| `abstract_reference_declarator`| Nameless reference | `static_cast<int&&>` | ✅ (Bypassed) |
| `abstract_pointer_declarator` | Nameless pointer | `static_cast<int*>` | ✅ (Bypassed) |

## 13. Complex Declarators & Modifiers
Nodes detailing variadic pointers, attributes, and compiler-level storage qualifiers.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `type_qualifier` | Const/volatile tags | `const int` | ✅ (Parsed, ignored) |
| `storage_class_specifier` | Memory storage | `static`, `extern` | ✅ (Parsed, ignored) |
| `variadic_declarator` | Variadic args | `Args... args` | ❌ (Not supported) |
| `variadic_reference_declarator`| Variadic ref args | `Args&&... args`| ❌ (Not supported) |
| `virtual_function_specifier` | Virtual method | `virtual void f() = 0;`| ❌ (Ignored) |
| `friend_declaration` | Friend class/func | `friend class A;` | ❌ (Ignored) |
| `ms_declspec_modifier` | MSVC declspec | `__declspec(dllexport)`| ❌ (Not supported) |
| `ms_call_modifier` | MSVC calling conv | `__cdecl`, `__stdcall` | ❌ (Not supported) |

## 14. Advanced Parameters & Requirements
Concepts, optional parameters, and lambda captures.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `parameter_declaration` | Standard parameter | `(int x)` | ✅ |
| `optional_parameter_declaration`| Default argument | `(int x = 5)` | ✅ |
| `variadic_parameter_declaration`| Variadic templates | `(Args... args)` | ❌ (Not supported) |
| `lambda_capture_specifier`| Lambda captures | `[=, &x]` | ❌ (Not supported) |
| `requirement_seq` | Requirements block | `requires { ... }` | ❌ (Not supported) |
| `simple_requirement` | Concept rule | `sizeof(T) > 4;` | ❌ (Not supported) |
| `compound_requirement` | Strict concept rule | `{ a.run() } -> T;` | ❌ (Not supported) |
| `type_requirement` | Type concept rule | `typename T::type;` | ❌ (Not supported) |
| `nested_requirement` | Nested requires | `requires Eq<T>;` | ❌ (Not supported) |

## 15. Advanced Type Resolution
Parsing templates, dependent types, and auto.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `template_type` | Template types | `vector<int>` | ✅ |
| `auto_type` | Auto deduction | `auto x = 5;` | ✅ (Treated dynamically) |
| `dependent_type` | Unresolved type | `typename T::type` | ❌ (Not supported) |
| `dependent_identifier`| Unresolved name | `t.template f()` | ❌ (Not supported) |
| `decltype` | Type deduction | `decltype(x)` | ❌ (Not supported) |

## 16. Statements & Class Composition
Specific layout components of structures and blocks.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `declaration_list` | Body of struct/class | `{ int x; }` | ✅ |
| `init_statement` | Initializer blocks | `for(int i=0; ...)` | ✅ |
| `default_method_clause`| Explicit default | `= default;` | ❌ (Not supported) |
| `delete_method_clause` | Explicit delete | `= delete;` | ❌ (Not supported) |
| `static_assert_declaration`| Compile-time assert| `static_assert(true);`| ❌ (Not supported) |

## 17. Expanded Preprocessor Directives
Tree-sitter maps C preprocessor commands distinctly into the AST.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `preproc_function_def` | Macro functions | `#define MACRO(x)` | ❌ (Ignored) |
| `preproc_call` | Invoking macro | `MACRO(5)` | ❌ (Ignored) |
| `preproc_if` | If directive | `#if 1` | ❌ (Ignored) |
| `preproc_ifdef` | Ifdef directive | `#ifdef DEBUG` | ❌ (Ignored) |
| `preproc_elif` | Elif directive | `#elif 1` | ❌ (Ignored) |
| `preproc_else` | Else directive | `#else` | ❌ (Ignored) |

## 18. Expressions (Math, Logic, and Assignment)
Nodes that evaluate to a value and dictate primary execution.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `binary_expression` | Operations on 2 terms | `a + b`, `x == y` | ✅ |
| `unary_expression` | Operations on 1 term | `-x`, `!found`, `*ptr`| ✅ |
| `update_expression` | Increment/Decrement | `i++`, `--j` | ✅ |
| `assignment_expression`| Assigning logic | `x = 5`, `y += 10` | ✅ |
| `conditional_expression`| Ternary operator | `a > b ? a : b` | ✅ |
| `comma_expression` | Chaining expressions | `a = 1, b = 2` | ✅ |
| `sizeof_expression` | Size byte fetching | `sizeof(int)` | ✅ |
| `alignof_expression` | Alignment bytes | `alignof(MyStruct)` | ❌ (Not supported) |

## 19. Literals and Constants
The raw data values hardcoded into the source.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `number_literal` | Numeric values | `42`, `3.14f` | ✅ |
| `char_literal` | Character values | `'A'`, `'\n'` | ✅ |
| `string_literal` | String values | `"Hello"` | ✅ |
| `raw_string_literal` | Raw string literals | `R"(...)"` | ✅ |
| `user_defined_literal` | Custom suffixes | `10_km` | ❌ (Not supported) |
| `escape_sequence` | String formatting | `\n`, `\t` | ✅ |
| `true` | Boolean true | `true` | ✅ |
| `false` | Boolean false | `false` | ✅ |
| `null` | Null pointer | `nullptr`, `NULL` | ✅ |

## 20. Core Statements (Control Flow)
The nodes that dictate execution jumps.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `return_statement` | Exiting function | `return 0;` | ✅ |
| `break_statement` | Breaking loops/switch| `break;` | ✅ |
| `continue_statement` | Skipping loop cycle | `continue;` | ✅ |
| `goto_statement` | Absolute jumping | `goto start;` | ✅ |
| `labeled_statement` | Jump targets | `start:` | ✅ |
| `expression_statement` | Line evaluating code | `print();` | ✅ |
| `compound_statement` | Scope block | `{ ... }` | ✅ |

## 21. Template & Type Internals
Used when resolving generic types in DSA (like a `Node<T>`).

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `template_declaration` | Template wrapper | `template <typename T>`| ✅ |
| `template_argument_list`| Supplied types | `<int, float>` | ✅ |
| `template_instantiation`| Explicit instancing | `template class vec;` | ❌ (Not supported) |
| `type_parameter_declaration`| Defining generic | `typename T` | ❌ (Ignored) |
| `variadic_type_parameter_declaration`| Variadic generic | `typename... Args` | ❌ (Not supported) |
| `template_template_parameter_declaration`| Template of templates | `template <typename> class C` | ❌ (Not supported) |

## 22. Comments & System Strings
Nodes containing human text or compiler hooks.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `comment` | Code commentary | `// doc`, `/* doc */` | ✅ (Parsed, ignored) |
| `system_lib_string` | Global imports | `<iostream>` | ❌ (Ignored) |

## 23. Error Handling
Special built-in nodes generated when Tree-Sitter encounters invalid C++ syntax.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `ERROR` | Malformed/broken code| `int a = ;` | ✅ (Throws explicit Compilation Error) |
| `MISSING` | Absent required token| `int a = 5` (no `;`) | ✅ (Throws explicit Compilation Error) |

## 24. The Anatomy of Lambdas
Internal lambda closure nodes.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `lambda_default_capture`| Capture default | `[=]` or `[&]` | ❌ (Not supported) |
| `lambda_capture_specifier`| Specific capture | `[x, &y]` | ❌ (Not supported) |
| `trailing_return_type` | Return type arrow | `-> bool` | ❌ (Not supported) |

## 25. Enumerations & Constants
State tracking structures.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `enum_specifier` | Standard Enum | `enum State { }` | ✅ |
| `scoped_enum_specifier`| Modern Enum Class| `enum class State` | ✅ (Added support) |
| `enumerator_list` | Enum body | `{ VISITED = 1 }` | ✅ |
| `enumerator` | Enum values | `VISITED = 1` | ✅ |

## 26. Advanced Pointers & Operator Overloads
Deep object-oriented C++ patterns.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `destructor_name` | Destructors | `~Node` | ❌ (Not supported) |
| `operator_cast` | Custom casting | `operator bool()` | ❌ (Not supported) |
| `spaceship_operator` | C++20 comparator | `<=>` | ❌ (Not supported) |

## 27. Obscure Type Definitions & Qualifiers
Namespaces, aliases, and memory alignment tools.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `namespace_alias_definition`| Renaming namespaces| `namespace ds = std;` | ❌ (Ignored) |
| `placeholder_type_specifier`| Auto/decltype types| `decltype(auto)` | ❌ (Not supported) |

## 28. Anonymous Nodes (The Hidden Tokens)
Tree-sitter also outputs literal string punctuation without node names (e.g., `";"`, `","`, `"."`, `"->"`, `"{"`, `"}"`, `"["`, `"]"`, `"("`, `")"`, `"::"`). 
The interpreter ignores these structurally during execution, relying instead on the named tree-sitter parent nodes (like `compound_statement` or `member_expression`) to deduce block limits and logical structures.

## 29. Preprocessor & Top-Level Directives
Global C++ structure and compile-time boundaries.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `preproc_if` / `preproc_ifdef` | Preprocessor logic | `#ifdef DEBUG` | ✅ (Ignored safely) |
| `preproc_include` | File inclusion | `#include <iostream>` | ✅ (Ignored safely) |
| `preproc_def` | Macros | `#define MAX 100` | ✅ (Ignored safely) |
| `namespace_definition` | Namespaces | `namespace std { }` | ✅ (Ignored safely) |
| `using_declaration` | Scope inclusion | `using namespace std;` | ✅ (Ignored safely) |
| `module_declaration` | C++20 Modules | `export module M;` | ✅ (Ignored safely) |

## 30. Compiler-Specific Extensions (SEH & Assembly)
Low-level operating system hooks and memory barriers.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `seh_try_statement` | Windows SEH | `__try { }` | ✅ (Ignored safely) |
| `seh_except_clause` | Windows SEH | `__except(1)` | ✅ (Ignored safely) |
| `seh_leave_statement` | Windows SEH | `__leave;` | ✅ (Ignored safely) |
| `gnu_asm_expression` | Inline assembly | `__asm__("nop")` | ✅ (Evaluates to 0) |

## 31. Deep Memory and Object Metaprogramming
Compiler intrinsics used by templates and allocators.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `offsetof_expression` | Memory offset | `offsetof(S, m)` | ✅ (Evaluates to 0) |
| `_alignof_expression` | Alignment bytes | `__alignof__(int)` | ✅ (Evaluates to inner argument) |
| `pack_expansion_expression`| Variadic expansion | `args...` | ✅ (Evaluates to inner argument) |
| `sizeof_pack_expression`| Variadic size | `sizeof...(args)`| ✅ (Evaluates to inner argument) |
| `type_trait` | Type properties | `__is_trivial(T)` | ✅ (Evaluates to inner argument) |

## 32. The C-Legacy Graveyard
Valid but antiquated C structures.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `union_specifier` | Shared memory structs| `union { int x; }` | ✅ (Ignored safely) |
| `old_style_function_definition`| K&R C functions| `int main(argc)` | ✅ (Ignored safely) |
| `bitfield_clause` | Bit packing | `int x : 4;` | ❌ (Not supported) |

## 33. Scope Resolution Operators
Namespaces and static member access.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `scoped_identifier` | Scoped variables | `Node::count` | ✅ (Evaluates as identifier) |
| `scoped_type_identifier` | Scoped types | `std::vector` | ✅ (Evaluates as identifier) |
| `scoped_namespace_identifier` | Scoped prefix | `std::` | ✅ (Evaluates as identifier) |

## 34. The Instance Pointer
Object-oriented self-reference.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `this` / `this_expression` | Instance pointer | `this->left` | ✅ (Mapped to Identifier `this`) |

## 35. Class and Struct Internal Layouts
Data containers within object structures.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `field_declaration_list` | Struct block body | `{ int data; }` | ✅ (Parsed inside struct builder) |

## 36. External Linkage
Compatible C-bindings.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `linkage_specification` | Extern definitions | `extern "C"` | ✅ (Ignored safely) |

## 37. Initialization Modifiers
Dynamic sizing and type inspection.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `new_declarator` | Dynamic array size | `new int[size]` | ✅ (Bypassed) |
| `type_descriptor` | Type argument | `sizeof(int)` | ✅ (Bypassed) |

## 38. Condition Declarations
Evaluating assignment results mid-condition.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `condition_declaration` | In-line assignment | `if (Node* x = n)` | ✅ (Extracted as assignment) |

## 39. Designated Initializers (C++20)
Explicit struct initialization.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `designated_initializer_list` | Initialization block | `{ .x = 1 }` | ✅ (Evaluated as initializer list) |
| `designated_initializer_clause` | Assignment clause | `.x = 1` | ✅ (Bypassed) |
| `designator` | Field identifier | `.x` | ✅ (Bypassed) |

## 40. Function-Level Try Blocks
Catch blocks spanning entire object lifecycles.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `function_try_block` | Global try wraps | `f() try {}` | ✅ (Parsed as standard block) |

## 41. Dynamic Exception Specifications
Legacy C++ exception contracts.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `dynamic_exception_specification`| Legacy throw list | `throw(int)` | ✅ (Bypassed) |

## 42. Template Parameter Pack Expansions (Types)
Variadic type templates.

| Tree-Sitter Node | Meaning in AST | C++ Syntax Example | Supported |
| :--- | :--- | :--- | :---: |
| `type_parameter_pack_expansion` | Variadic types | `Values... args` | ✅ (Bypassed) |