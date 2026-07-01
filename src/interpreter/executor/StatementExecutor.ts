// ============================================================================
// StatementExecutor.ts — The mutation engine of the interpreter.
//
// Responsible for all statements that change state:
//   - Variable declaration and initialisation (executeVariableDeclaration)
//   - Variable / subscript / member assignment (executeAssignment)
//   - Standard output (executeCout)
//   - Function return (executeReturn)
//   - C++ throw (executeThrow)           ← v2 addition
//
// The executor is intentionally stateless between calls — it does not cache
// values across statements. All state lives in ScopeManager (via the frame's
// SymbolTable stack) and in ExecutionEngine's staticStorage / enumBlueprints /
// typeAliases maps, which are passed in at construction time.
//
// Type resolution order in executeVariableDeclaration:
//   1. Resolve type aliases (typedef / using)  ← v2
//   2. Check enum blueprints                   ← v2
//   3. Check class blueprints (struct / class)
//   4. STL container detection (vector, stack, queue, …)
//   5. Primitive default initialisation
//
// Static local variables (v2):
//   When a declaration carries isStatic = true, the executor checks
//   staticStorage for a previously persisted value. If found, that value is
//   used instead of re-evaluating the initialiser, matching C++ semantics
//   where a static local is initialised only on the first call. The value is
//   stored in the frame's scope normally; ExecutionEngine.invokeFunction()
//   mirrors it back to staticStorage in its finally block via
//   ScopeManager.getStaticSymbols().
//
// Extension history:
//   v1 — Initial: executeVariableDeclaration, executeAssignment,
//        executeCout, executeReturn, createMockContainer.
//   v2 — Added: executeThrow; isConst / isStatic threading; type alias
//               resolution; enum member injection; static variable handling;
//               priority_queue min-heap via comparator; improved string
//               mutation write-back for append / push_back / insert / erase;
//               computeCompoundValue extended with string concatenation for +=.
// ============================================================================

import type {
  IRVariableDeclaration,
  IRAssignment,
  IRExpressionStatement,
  IRCoutStatement,
  IRReturnStatement,
  IRThrowStatement,
  IRIdentifier,
  IRSubscriptExpression,
  IRMemberExpression,
  IRStructDeclaration,
  IREnumDeclaration,
  IRExpression,
} from "../ir/IRNode";
import { ScopeManager }        from "../runtime/ScopeManager";
import { EventEmitter }        from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { EventType }           from "../types";
import type { CppValue, CppType, StaticStorageKey } from "../types";
import { ReturnSignal, ThrowSignal, cloneRuntimeValue, makeMockContainer }       from "../utils/helpers";


// ─── StatementExecutor ────────────────────────────────────────────────────────

export class StatementExecutor {

  constructor(
    private scopeManager:    ScopeManager,
    private evaluator:       ExpressionEvaluator,
    private eventEmitter:    EventEmitter,
    /**
     * Struct / class blueprints registered by ExecutionEngine.loadProgram().
     * Consulted during variable declaration to instantiate user-defined types.
     */
    private classBlueprints?: Map<string, IRStructDeclaration>,
    /**
     * v2: Enum blueprints registered by ExecutionEngine.loadProgram().
     * When a variable's resolved type matches an enum name, the enum's
     * members are used as the valid initialiser range.
     */
    private enumBlueprints?:  Map<string, IREnumDeclaration>,
    /**
     * v2: Resolved type aliases (typedef / using) registered by
     * ExecutionEngine.loadProgram(). Consulted before all type checks so
     * `vi v(n, 0)` resolves to `vector<int> v(n, 0)`.
     */
    private typeAliases?:     Map<string, string>,
    /**
     * v2: Persistent storage for static local variables, keyed by
     * `"functionName::variableName"`. Owned by ExecutionEngine and shared
     * across all StatementExecutor instances (one per frame).
     * The current function name is needed to form the key.
     */
    private staticStorage?:   Map<StaticStorageKey, { type: CppType, value: CppValue }>,
    /**
     * v2: The name of the function this executor belongs to.
     * Used to form StaticStorageKey for static local variables.
     */
    private currentFunction?: string,
    /**
     * v2: Callback to ExecutionEngine to instantiate a struct and execute its constructor.
     */
    private instantiateCallback?: (typeName: string, args: IRExpression[]) => CppValue,
  ) {}


  // ==========================================================================
  // SECTION 1 — Variable declaration
  // ==========================================================================

  /**
   * Allocates a new variable in the current lexical scope.
   *
   * Initialisation priority order:
   *   0. Static variable: check staticStorage for a persisted value first.  (v2)
   *   1. Explicit initialiser: `int x = 5;` or `vector<int> v = {1,2,3};`
   *   2. Constructor args:    `vector<int> v(n, 0);` or `string s(5, 'x');`
   *   3. Nested array wrapping for initialiser-list vectors.
   *   4. Type-directed default: enum, struct, STL container, or primitive.
   *
   * After the value is determined, the variable is defined in the scope via
   * ScopeManager.defineVariable() with the isConst and isStatic flags.
   * For static variables, ScopeManager.defineStatic() is used instead.
   *
   * Structured bindings (`auto [a, b] = expr;`) are handled at the end by
   * splitting the bracketed name and defining each part individually.
   */
  public executeVariableDeclaration(node: IRVariableDeclaration): void {
    const isConst  = node.isConst  ?? false;
    const isStatic = node.isStatic ?? false;

    // ── Step 0: Resolve type alias ─────────────────────────────────────────
    // `using vi = vector<int>;` → `vi` becomes `vector<int>` before any check.
    let resolvedType = node.variableType;
    if (this.typeAliases) {
      // Iteratively expand aliases to support chained aliases:
      // `using ll = long long; using vll = vector<ll>;` → `vector<long long>`
      let expanded = this.typeAliases.get(resolvedType);
      const visited = new Set<string>();
      while (expanded && !visited.has(resolvedType)) {
        visited.add(resolvedType);
        resolvedType = expanded;
        expanded     = this.typeAliases.get(resolvedType);
      }
    }
    const typeLower = resolvedType.toLowerCase();

    // ── Step 0b: Static variable persistence check ─────────────────────────
    // If this is a static local and we have a persisted value from a previous
    // call, use it instead of re-evaluating the initialiser.
    if (isStatic && this.staticStorage && this.currentFunction) {
      const storageKey = `${this.currentFunction}::${node.name}` as StaticStorageKey;
      if (this.staticStorage.has(storageKey)) {
        const persistedRecord = this.staticStorage.get(storageKey)!;
        const persistedValue = persistedRecord.value;
        this.scopeManager.defineStatic(node.name, resolvedType, persistedValue);
        this.eventEmitter.emit(node.line, EventType.DECLARE, {
          variable: node.name,
          type:     resolvedType,
          value:    persistedValue,
          isStatic: true,
        });
        return; // Skip all initialisation — use persisted value.
      }
      // First call: fall through to normal initialisation, then the value
      // will be persisted by ExecutionEngine.invokeFunction()'s finally block.
    }

    let value: CppValue | undefined;

    // ── Step 1: Explicit initialiser ──────────────────────────────────────
    if (node.initializer) {
      try {
        value = this.evaluator.evaluate(node.initializer);
      } catch (e) {
        console.warn(
          `[StatementExecutor] Failed to evaluate initializer for '${node.name}': ` +
          `${(e as Error).message}`
        );
      }
    }

    // ── Step 2: Constructor arguments ──────────────────────────────────────
    if (value === undefined && node.constructorArgs && node.constructorArgs.length > 0) {
      try {
        const arg0 = this.evaluator.evaluate(node.constructorArgs[0]);
        const arg1 = node.constructorArgs.length > 1
          ? this.evaluator.evaluate(node.constructorArgs[1])
          : undefined;
        const size = typeof arg0 === "number" && arg0 >= 0 && arg0 < 1_000_000 ? arg0 : -1;

        // string s(n, 'c') → repeat character n times.
        const isBareStringType = (
          typeLower === "string"      ||
          typeLower === "std::string" ||
          typeLower === "wstring"     ||
          typeLower === "std::wstring"
        );
        if (isBareStringType && size >= 0 && arg1 !== undefined) {
          value = String(arg1).repeat(size);
        }
        // vector / list / deque / stack / queue / priority_queue / array (n, fill).
        else if (this.isContainerType(typeLower)) {
            if (size >= 0) {
              let fillVal = arg1;
              if (fillVal === undefined) {
                const innerMatch = typeLower.match(/<(.*)>/);
                if (innerMatch) {
                  fillVal = this.defaultValueForType(innerMatch[1], innerMatch[1].toLowerCase(), []);
                } else {
                  fillVal = 0;
                }
              }
              value = this.createMockContainer(
                Array.from({ length: size }, () =>
                  Array.isArray(fillVal) ? [...fillVal] :
                  (fillVal && typeof fillVal === "object" && Array.isArray((fillVal as any).data))
                    ? { ...(fillVal as any), data: [...(fillVal as any).data] }
                    : fillVal
                ),
                typeLower
              );
            } else {
              value = this.createMockContainer([], typeLower);
            }
          }
        // pair<T,U> p(a, b) → [a, b]
        else if (typeLower.includes("pair")) {
          value = [arg0, arg1 !== undefined ? arg1 : 0];
        }
        // Custom struct / class initialized with constructor args
        else if (this.classBlueprints?.has(resolvedType)) {
          value = this.instantiateStruct(resolvedType, node.constructorArgs);
        }
        // Scalar: int x(5) → 5
        else {
          value = arg0;
        }
      } catch (e) {
        console.warn(
          `[StatementExecutor] Failed to evaluate constructor args for '${node.name}': ` +
          `${(e as Error).message}`
        );
      }
    }

    // ── Step 3: Deep-wrap nested initialiser-list arrays ───────────────────
    // `vector<vector<int>> dp = {{1,2},{3,4}};` → array of mock containers.
    if (value !== undefined && Array.isArray(value) && this.isContainerType(typeLower)) {
        const extractInnerType = (type: string): string => {
          const match = type.match(/^(?:vector|list|deque|stack|queue|array|priority_queue)<(.+)>$/);
          return match ? match[1].trim() : "";
        };
        const innerType = extractInnerType(typeLower);

        if (this.isContainerType(innerType)) {
          const wrapContainer = (arr: any[]): Record<string, any> => {
            for (let i = 0; i < arr.length; i++) {
              if (Array.isArray(arr[i])) arr[i] = wrapContainer(arr[i]);
            }
            return this.createMockContainer(arr, typeLower);
          };
          value = wrapContainer(value as any[]);
        } else {
          value = this.createMockContainer(value as any[], typeLower);
        }
      }

    // ── Step 4: Type-directed default initialisation ───────────────────────
    if (value === undefined) {
      value = this.defaultValueForType(resolvedType, typeLower, node.constructorArgs ?? []);
    }

    // ── Step 5: Deep Clone Value for Memory Safety ─────────────────────────
    if (value !== undefined) {
      value = cloneRuntimeValue(value);
    }

    // Coerce numbers assigned to char variables back to char strings.
    if ((resolvedType === "char" || resolvedType === "const char") && typeof value === "number") {
      value = String.fromCharCode(value);
    }

    // ── Structured binding support: `auto [a, b] = expr;` ─────────────────
    if (node.name.startsWith("[") && node.name.endsWith("]")) {
      this.defineStructuredBinding(node, resolvedType, value, isConst);
      return;
    }

    // ── Define in scope ────────────────────────────────────────────────────
    if (isStatic) {
      this.scopeManager.defineStatic(node.name, resolvedType, value);
      // Persist to staticStorage immediately so recursive calls see it before this frame pops
      if (this.staticStorage && this.currentFunction) {
        this.staticStorage.set(`${this.currentFunction}::${node.name}` as StaticStorageKey, { type: resolvedType, value });
      }
    } else {
      this.scopeManager.defineVariable(node.name, resolvedType, value, isConst, false);
    }

    this.eventEmitter.emit(node.line, EventType.DECLARE, {
      variable: node.name,
      type:     resolvedType,
      value,
      isConst,
      isStatic,
    });
  }

  /**
   * Returns true when the (lowercased) type string corresponds to a sequential
   * STL container that should be backed by a mock container object.
   */
  private isContainerType(typeLower: string): boolean {
    const baseType = typeLower.split('<')[0].replace("std::", "").trim();
    return (
      baseType === "vector" ||
      baseType === "list" ||
      baseType === "array" ||
      baseType === "deque" ||
      baseType === "stack" ||
      baseType === "queue" ||
      baseType === "priority_queue"
    );
  }

  /**
   * Produces the default initial value for a type when no initialiser or
   * constructor args were provided.
   *
   * Resolution order:
   *   1. User-defined struct / class blueprint
   *   2. Enum blueprint                    (v2)
   *   3. STL sequential containers
   *   4. std::set / unordered_set
   *   5. std::map / unordered_map
   *   6. std::string
   *   7. bool
   *   8. Numeric primitives (int, long, double, float, char, auto)
   *   9. nullptr / pointer types
   *
   * @param resolvedType - The fully expanded C++ type string.
   * @param typeLower    - Lowercased version of resolvedType for fast prefix checks.
   * @param constructorArgs - Raw constructor arg expressions (for struct init).
   */
  private defaultValueForType(
    resolvedType:    string,
    typeLower:       string,
    constructorArgs: IRExpression[],
  ): CppValue {

    // 1. Custom struct / class
    if (this.classBlueprints?.has(resolvedType)) {
      return this.instantiateStruct(resolvedType, constructorArgs);
    }

    // v2: 2. Enum type — default to 0 (the first member's value).
    if (this.enumBlueprints?.has(resolvedType)) {
      return 0;
    }

    // 3. Sequential STL containers
    if (this.isContainerType(typeLower)) {
      return this.createMockContainer([], typeLower);
    }

    // 4. Set types
    if (typeLower.includes("unordered_set") || typeLower.includes("set")) {
      return new Set();
    }

    // 5. Map types
    if (typeLower.includes("unordered_map") || typeLower.includes("map")) {
      return new Map();
    }

    // 6. String — exact match only (not substring, to avoid matching vector<string> etc.)
    if (
      typeLower === "string"      ||
      typeLower === "std::string" ||
      typeLower === "wstring"     ||
      typeLower === "std::wstring"
    ) return "";

    // 7. Bool
    if (typeLower.includes("bool")) return false;

    // 8. Numeric primitives
    if (
      typeLower.includes("int")    ||
      typeLower.includes("long")   ||
      typeLower.includes("short")  ||
      typeLower.includes("double") ||
      typeLower.includes("float")  ||
      typeLower.includes("char")   ||
      typeLower === "auto"
    ) return 0;

    // 9. Pointer / nullptr
    if (typeLower.includes("*") || typeLower.includes("nullptr")) return null;

    // Unknown type: default to 0.
    return 0;
  }

  /**
   * Defines a structured binding by splitting the bracketed name and defining
   * each part as a separate variable in the current scope.
   *
   * `auto [d, u] = pq.top()` → defines `d` and `u` from the pair/tuple value.
   *
   * Three value shapes are handled:
   *   Array         → parts[i] gets value[i]
   *   Plain object  → parts[i] gets value[Object.keys(value)[i]]
   *   Primitive     → all parts get the same value (fallback)
   */
  private defineStructuredBinding(
    node:         IRVariableDeclaration,
    resolvedType: string,
    value:        CppValue,
    isConst:      boolean,
  ): void {
    const parts = node.name.slice(1, -1).split(",").map(s => s.trim());

    if (Array.isArray(value)) {
      parts.forEach((p, idx) => {
        if (p) this.scopeManager.defineVariable(p, resolvedType, (value as any[])[idx], isConst);
      });
    } else if (value && typeof value === "object" && !(value instanceof Map) && !(value instanceof Set)) {
      const keys = Object.keys(value as Record<string, any>);
      parts.forEach((p, idx) => {
        if (p) this.scopeManager.defineVariable(p, resolvedType, (value as any)[keys[idx]], isConst);
      });
    } else {
      parts.forEach(p => {
        if (p) this.scopeManager.defineVariable(p, resolvedType, value, isConst);
      });
    }

    this.eventEmitter.emit(node.line, EventType.DECLARE, {
      variable: node.name,
      type:     resolvedType,
      value,
    });
  }

  /**
   * Instantiates a user-defined struct / class from its blueprint.
   * Applies field default values first, then overlays explicit constructor args.
   */
  private instantiateStruct(
    typeName:        string,
    constructorArgs: IRExpression[],
  ): Record<string, any> {
    if (this.instantiateCallback) {
      return this.instantiateCallback(typeName, constructorArgs) as Record<string, any>;
    }
    const blueprint = this.classBlueprints!.get(typeName)!;
    const instance: Record<string, any> = { __type: typeName };

    // Apply default field values with proper type-directed defaults.
    // H1 (Review 1): Replaces previous hardcoded `0` which gave wrong defaults
    // for string (should be ""), bool (should be false), and pointer (null) fields.
    for (const field of blueprint.fields) {
      if (field.defaultValue) {
        instance[field.name] = this.evaluator.evaluate(field.defaultValue);
      } else {
        const t = field.type.toLowerCase();
        if (t.includes("[]")) instance[field.name] = [];
        else if (t === "string" || t === "std::string" || t === "wstring") instance[field.name] = "";
        else if (t.includes("bool")) instance[field.name] = false;
        else if (t.includes("*") || t.includes("nullptr")) instance[field.name] = null;
        else instance[field.name] = 0;
      }
    }

    // Overlay explicit constructor arguments positionally.
    for (let i = 0; i < constructorArgs.length && i < blueprint.fields.length; i++) {
      instance[blueprint.fields[i].name] = this.evaluator.evaluate(constructorArgs[i]);
    }

    return instance;
  }

  /**
   * Factory for mock STL sequential container objects.
   *
   * All sequential containers (vector, deque, stack, queue, list,
   * priority_queue, array) share this backing structure:
   *   { data: CppValue[], <method functions> }
   *
   * The `typeLower` parameter is used to detect priority_queue so a
   * comparator-aware heapify can be installed when the type is detected.
   * Standard priority_queue (max-heap) uses the default numeric comparator.
   *
   * v2: priority_queue now maintains heap ordering on push/pop.
   *
   * @param initialData - Pre-populated elements (from constructor args or
   *   initialiser lists). May be empty.
   * @param typeLower   - Lowercased resolved type, used to detect priority_queue.
   */
  private createMockContainer(
    initialData: any[],
    typeLower:   string = "",
  ): Record<string, any> {
    const isPriorityQueue = typeLower.includes("priority_queue");
    const isQueue = typeLower === "queue" || (typeLower.includes("queue") && !isPriorityQueue);

    const container: Record<string, any> = {
      ...makeMockContainer(initialData),

      // ── Insertion ─────────────────────────────────────────────────────────
      push_back(val: any)  { this.data.push(cloneRuntimeValue(val));           return val; },
      push(val: any) {
        this.data.push(cloneRuntimeValue(val));
        if (this.__isHeap) this.__siftUp(this.data.length - 1);
        return val;
      },
      push_front(val: any) { this.data.unshift(cloneRuntimeValue(val));        return val; },

      insert(arg1: any, arg2?: any) {
        if (arg2 !== undefined) {
          // Typically insert(iterator, value)
          const pos = typeof arg1 === "number" ? arg1 : 0;
          this.data.splice(pos, 0, cloneRuntimeValue(arg2));
          return arg2;
        } else {
          // Fallback if only 1 arg is provided (shouldn't happen for vector/deque, but just in case)
          this.data.push(cloneRuntimeValue(arg1));
          return arg1;
        }
      },

      // ── Deletion ──────────────────────────────────────────────────────────
      pop_back()  { return this.data.pop(); },
      pop() {
        if (this.__isHeap && this.data.length > 0) {
          // Swap root with last, pop last, sift root down to restore heap.
          const top = this.data[0];
          const last = this.data.pop();
          if (this.data.length > 0 && last !== undefined) {
            this.data[0] = last;
            this.__siftDown(0);
          }
          return top;
        }
        if (this.__isQueue) {
          return this.data.shift();
        }
        return this.data.pop();
      },
      pop_front() { return this.data.shift(); },

      remove(val: any) {
        const idx = this.data.indexOf(val);
        if (idx !== -1) { this.data.splice(idx, 1); return true; }
        return false;
      },
      erase(val: any) {
        if (typeof val === "number" && val >= 0 && val < this.data.length) {
          this.data.splice(val, 1);
        } else {
          const idx = this.data.indexOf(val);
          if (idx !== -1) this.data.splice(idx, 1);
        }
      },

      // ── Access ────────────────────────────────────────────────────────────
      front() { return this.data.length > 0 ? this.data[0]                    : undefined; },
      back()  { return this.data.length > 0 ? this.data[this.data.length - 1] : undefined; },
      top()   {
        // For a priority_queue, top() is always the heap root (index 0).
        if (this.__isHeap) return this.data.length > 0 ? this.data[0] : undefined;
        return this.data.length > 0 ? this.data[this.data.length - 1] : undefined;
      },
      at(index: number) {
        if (index < 0 || index >= this.data.length) {
          throw new Error(
            `Memory Access Violation: Index ${index} is out of bounds ` +
            `(container size: ${this.data.length}).`
          );
        }
        return this.data[index];
      },

      // ── Lookup ────────────────────────────────────────────────────────────
      search(val: any)   { return this.data.indexOf(val); },
      find(val: any)     { return this.data.indexOf(val); },
      contains(val: any) { return this.data.includes(val); },

      // ── Info ──────────────────────────────────────────────────────────────
      size()   { return this.data.length; },
      length() { return this.data.length; },
      empty()  { return this.data.length === 0; },
      clear()  { this.data = []; },
      print()  { return `[${this.data.join(" -> ")}]`; },

      // ── Heap internals (priority_queue only) ───────────────────────────────
      // Stored on the object so push/pop/top can access them without closure.
      __isHeap:    false,
      __isQueue:   false,
      __cmp:       null as ((a: any, b: any) => number) | null,

      __siftUp(i: number) {
        const cmp = this.__cmp ?? ((a: any, b: any) => b - a); // max-heap default
        while (i > 0) {
          const parent = (i - 1) >> 1;
          if (cmp(this.data[i], this.data[parent]) < 0) {
            [this.data[i], this.data[parent]] = [this.data[parent], this.data[i]];
            i = parent;
          } else break;
        }
      },
      __siftDown(i: number) {
        const n   = this.data.length;
        const cmp = this.__cmp ?? ((a: any, b: any) => b - a);
        while (true) {
          let best  = i;
          const l   = 2 * i + 1;
          const r   = 2 * i + 2;
          if (l < n && cmp(this.data[l], this.data[best]) < 0) best = l;
          if (r < n && cmp(this.data[r], this.data[best]) < 0) best = r;
          if (best === i) break;
          [this.data[i], this.data[best]] = [this.data[best], this.data[i]];
          i = best;
        }
      },
      __heapify() {
        for (let i = Math.floor(this.data.length / 2) - 1; i >= 0; i--) {
          this.__siftDown(i);
        }
      },
    };

    // v2: Enable heap mode for priority_queue and heapify existing data.
    if (isPriorityQueue) {
      container.__isHeap = true;
      if (initialData.length > 0) container.__heapify();
    } else if (isQueue) {
      container.__isQueue = true;
    }

    return container;
  }


  // ==========================================================================
  // SECTION 2 — Assignment
  // ==========================================================================

  /**
   * Evaluates an assignment target and mutates the corresponding memory location.
   *
   * Three target shapes:
   *   CASE 1: Identifier    → `x = 5`, `x += 3`
   *   CASE 2: Subscript     → `arr[i] = 5`, `map["key"] += 1`
   *   CASE 3: MemberExpr    → `node.val = 5`, `ptr->next = nullptr`
   *
   * Pass-by-reference is handled transparently for CASE 1: if the variable's
   * value is a `{ __ref, __callerScope }` proxy, the assignment is redirected
   * to the referenced variable in the caller's scope.
   *
   * v2: String mutation write-back — string methods like append / push_back /
   * insert / erase return new strings (JS strings are immutable). For the
   * pattern `s = s.append("x")`, the assignment already handles write-back
   * correctly. For direct method calls (`s.push_back('a')`), write-back is
   * handled in ExecutionEngine.invokeMethodCall().
   */
  public executeAssignment(stmt: IRAssignment): void {
    let newValue = this.evaluator.evaluate(stmt.value);
    newValue = cloneRuntimeValue(newValue);

    // ── CASE 1: Identifier assignment ─────────────────────────────────────
    if (stmt.target.kind === "Identifier") {
      const varName = (stmt.target as IRIdentifier).name;

      let targetVarName      = varName;
      let targetScopeManager = this.scopeManager;

      // Unwrap pass-by-reference proxy chain.
      try {
        let symbol = this.scopeManager.getVariable(targetVarName);
        const seen = new Set<any>();
        while (
          symbol.value &&
          typeof symbol.value === "object" &&
          "__ref" in (symbol.value as any)
        ) {
          if (seen.has(symbol.value)) break;
          seen.add(symbol.value);

          targetVarName      = (symbol.value as any).__ref;
          targetScopeManager = (symbol.value as any).__callerScope;
          symbol             = targetScopeManager.getVariable(targetVarName);
        }
      } catch { /* Variable not found — handled below. */ }

      let resolvedValue: CppValue;
      try {
        const symbol = targetScopeManager.getVariable(targetVarName);
        const existing = symbol.value;
        resolvedValue  = stmt.operator === "="
          ? newValue
          : this.computeCompoundValue(stmt.operator, existing, newValue);
          
        if ((symbol.type === "char" || symbol.type === "const char") && typeof resolvedValue === "number") {
          resolvedValue = String.fromCharCode(resolvedValue);
        }
        
        targetScopeManager.assignVariable(targetVarName, resolvedValue);
      } catch (e: any) {
        // Re-throw ConstAssignmentError — it is a user-visible error.
        if (e?.constructor?.name === "ConstAssignmentError") throw e;
        // Auto-recovery: variable not declared. Define it implicitly.
        // Debug note: This fires when the IR missed a declaration (e.g. Tree-sitter
        // emitted a function_declarator that was not caught as a variable decl).
        resolvedValue = newValue;
        targetScopeManager.defineVariable(targetVarName, "auto", resolvedValue);
      }

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: varName,
        value:    resolvedValue,
      });
    }

    // ── CASE 2: Subscript mutation ─────────────────────────────────────────
    else if (stmt.target.kind === "SubscriptExpression") {
      const targetNode = stmt.target as IRSubscriptExpression;
      const index      = this.evaluator.evaluate(targetNode.index) as string | number;

      let targetObj: any  = null;
      let arrayName       = "container";

      if (targetNode.object.kind === "Identifier") {
        arrayName = (targetNode.object as IRIdentifier).name;
        try {
          targetObj = this.evaluator.evaluate(targetNode.object);
        } catch {
          // Auto-recovery: undeclared subscript target → create a Map.
          targetObj = new Map();
          this.scopeManager.defineVariable(arrayName, "auto", targetObj);
        }
      } else {
        targetObj = this.evaluator.evaluate(targetNode.object);
      }

      if (!targetObj) {
        throw new Error(
          `Memory Access Violation at line ${stmt.line}: ` +
          `Cannot assign to subscript of undefined reference '${arrayName}'.`
        );
      }

      // Read existing value for compound operators.
      let existingValue: any = undefined;
      if (stmt.operator !== "=") {
        existingValue = this.readSubscript(targetObj, index);
      }

      const finalValue = stmt.operator === "="
        ? newValue
        : this.computeCompoundValue(stmt.operator, existingValue ?? 0, newValue);

      if (typeof targetObj === "string") {
        // String character mutation: board[row][col] = 'Q'
        // Walk up the subscript chain to find the root variable and rebuild.
        const i = typeof index === "string" ? parseInt(index) : (index as number);
        const newStr = targetObj.substring(0, i) + String(finalValue) + targetObj.substring(i + 1);
        this.writeBackString(targetNode.object, newStr, stmt.line);
      } else {
        this.writeSubscript(targetObj, index, finalValue);
      }

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: `${arrayName}[${index}]`,
        value:    finalValue,
      });
    }

    // ── CASE 3: Member mutation ────────────────────────────────────────────
    else if (stmt.target.kind === "MemberExpression") {
      const targetNode = stmt.target as IRMemberExpression;
      const targetObj  = this.evaluator.evaluate(targetNode.object) as any;
      let   property: string | number = targetNode.property;

      // Auto-recovery: struct stored as plain array (schema not linked).
      if (Array.isArray(targetObj)) {
        const fieldMap: Record<string, number> = {
          id: 0, value: 1, left: 2, right: 3,
          x:  0, y:     1, val: 0, next:  1,
          first: 0, second: 1,
        };
        if (property in fieldMap) property = fieldMap[property as string];
      }

      if (!targetObj) {
        throw new Error(
          `Memory Access Violation at line ${stmt.line}: ` +
          `Cannot assign property '${property}' on a null or undefined reference.`
        );
      }

      const existingValue = stmt.operator !== "=" ? targetObj[property] : undefined;
      const finalValue    = stmt.operator === "="
        ? newValue
        : this.computeCompoundValue(stmt.operator, existingValue ?? 0, newValue);

      targetObj[property] = finalValue;

      this.eventEmitter.emit(stmt.line, EventType.ASSIGNMENT, {
        variable: String(property),
        value:    finalValue,
      });
    }

    else {
      throw new Error(
        `Syntax Error at line ${stmt.line}: ` +
        `Unsupported assignment target kind '${(stmt.target as any).kind}'.`
      );
    }
  }

  /**
   * Reads a value from a subscript target, dispatching on the backing type.
   */
  private readSubscript(targetObj: any, index: string | number): any {
    if (targetObj instanceof Map) return targetObj.get(index);
    if (Array.isArray(targetObj))  return targetObj[index as number];
    if (
      typeof targetObj === "object" &&
      "data" in targetObj &&
      Array.isArray(targetObj.data)
    ) return targetObj.data[index as number];
    return targetObj[index];
  }

  /**
   * Writes a value to a subscript target, dispatching on the backing type.
   */
  /**
   * Walks up a potentially-nested subscript/identifier chain and writes a
   * new string value back to the root container.
   *
   * Handles:
   *   board[row][col] = 'Q'  → board[row] = newString
   *   s[i] = 'x'            → s = newString
   *
   * This avoids the infinite recursion caused by calling executeAssignment
   * recursively when the target is itself a SubscriptExpression.
   */
  private writeBackString(targetExpr: IRExpression, newStr: string, line: number): void {
    if (targetExpr.kind === "Identifier") {
      // Base case: simple variable — just assign.
      const varName = (targetExpr as IRIdentifier).name;
      try {
        this.scopeManager.assignVariable(varName, newStr);
      } catch {
        this.scopeManager.defineVariable(varName, "string", newStr);
      }
      this.eventEmitter.emit(line, EventType.ASSIGNMENT, { variable: varName, value: newStr });
    } else if (targetExpr.kind === "SubscriptExpression") {
      // Nested case: board[row] — evaluate the parent object and write to it.
      const subExpr = targetExpr as IRSubscriptExpression;
      const parentObj = this.evaluator.evaluate(subExpr.object) as any;
      const parentIndex = this.evaluator.evaluate(subExpr.index) as string | number;
      if (typeof parentObj === "string") {
        const pIndex = typeof parentIndex === "string" ? parseInt(parentIndex) : (parentIndex as number);
        const newParentStr = parentObj.substring(0, pIndex) + newStr + parentObj.substring(pIndex + 1);
        this.writeBackString(subExpr.object, newParentStr, line);
      } else if (parentObj !== null && parentObj !== undefined) {
        this.writeSubscript(parentObj, parentIndex, newStr);
        const parentName = subExpr.object.kind === "Identifier"
          ? (subExpr.object as IRIdentifier).name
          : "container";
        this.eventEmitter.emit(line, EventType.ASSIGNMENT, {
          variable: `${parentName}[${parentIndex}]`,
          value: newStr,
        });
      }
    }
  }

  private writeSubscript(targetObj: any, index: string | number, value: any): void {
    if (targetObj instanceof Map) {
      targetObj.set(index, value);
    } else if (Array.isArray(targetObj)) {
      targetObj[index as number] = value;
    } else if (
      typeof targetObj === "object" &&
      "data" in targetObj &&
      Array.isArray(targetObj.data)
    ) {
      targetObj.data[index as number] = value;
    } else {
      targetObj[index] = value;
    }
  }

  /**
   * Computes the result of a compound assignment operator.
   *
   * v2: Handles string `+=` concatenation natively so `s += "world"` works
   * without going through the numeric Number() coercion path.
   */
  private computeCompoundValue(
    operator: IRAssignment["operator"],
    existing: any,
    incoming: CppValue,
  ): CppValue {
    // v2: String concatenation for +=
    if (operator === "+=" && typeof existing === "string") {
      return existing + String(incoming ?? "");
    }

    const lhs = Number(existing);
    const rhs = Number(incoming);

    switch (operator) {
      case "+=":  return lhs + rhs;
      case "-=":  return lhs - rhs;
      case "*=":  return lhs * rhs;
      case "/=":
        if (rhs === 0) throw new Error("Math Exception: Division by zero in compound assignment.");
        return Math.trunc(lhs / rhs);
      case "%=":  return lhs % rhs;
      case "&=":  return lhs & rhs;
      case "|=":  return lhs | rhs;
      case "^=":  return lhs ^ rhs;
      case "<<=": return lhs << rhs;
      case ">>=": return lhs >> rhs;
      default:    return incoming;
    }
  }


  // ==========================================================================
  // SECTION 3 — I/O and control flow statements
  // ==========================================================================

  /**
   * Evaluates a standalone expression for its side effects.
   * Used for void function calls (`sort(v.begin(), v.end())`), update
   * expressions (`i++`), and any expression not elevated to a specific IR kind.
   */
  public executeExpressionStatement(stmt: IRExpressionStatement): void {
    this.evaluator.evaluate(stmt.expression);
  }

  /**
   * Evaluates all cout arguments and emits a WRITE event with the
   * concatenated output string.
   *
   * `endl` and `"\n"` are converted to newline characters so the UI terminal
   * can render line breaks correctly.
   */
  public executeCout(stmt: IRCoutStatement): void {
    const parts = stmt.arguments.map(arg => {
      const val = this.evaluator.evaluate(arg);
      return val === "\n" ? "\n" : String(val ?? "");
    });

    this.eventEmitter.emit(stmt.line, EventType.WRITE, {
      output: parts.join(""),
    });
  }

  /**
   * Evaluates the return value and throws a ReturnSignal to unwind the
   * call stack to ExecutionEngine.invokeFunction()'s catch block.
   *
   * @throws {ReturnSignal} Always — this method never returns normally.
   */
  public executeReturn(stmt: IRReturnStatement): never {
    const value = stmt.argument ? this.evaluator.evaluate(stmt.argument) : undefined;
    throw new ReturnSignal(value);
  }

  /**
   * Evaluates a C++ throw expression, emits a THROW event, and propagates
   * the value upward as a ThrowSignal. v2 addition.
   *
   * The ThrowSignal carries:
   *   - `value`    — the evaluated CppValue of the throw expression
   *   - `typeName` — the C++ type string extracted from the IR node's
   *                  argument kind where possible (e.g. "int" for `throw 42;`,
   *                  "std::runtime_error" for `throw std::runtime_error("x");`)
   *
   * Bare re-throw (`throw;`) with no argument produces `value: undefined`.
   * The walker (walkTryStatement) must handle this by re-throwing the
   * currently active ThrowSignal from its catch scope.
   *
   * @throws {ThrowSignal} Always.
   */
  public executeThrow(stmt: IRThrowStatement): never {
    let value:    CppValue = undefined;
    let typeName: string | undefined;

    if (stmt.argument) {
      value = this.evaluator.evaluate(stmt.argument);

      // Best-effort type name extraction for catch-clause matching.
      // For `throw 42;`            → typeName: "int"   (from Literal.valueType)
      // For `throw "msg";`         → typeName: "string"
      // For `throw MyError(...);`  → typeName: "MyError" (from FunctionCall.callee)
      // For `throw someVar;`       → typeName: type from scope if available
      const arg = stmt.argument;
      if (arg.kind === "Literal") {
        typeName = (arg as any).valueType as string;
        // Normalise Literal valueType to standard C++ type names.
        if (typeName === "double") typeName = "int"; // Number literals → int by default
      } else if (arg.kind === "FunctionCall") {
        typeName = (arg as any).callee as string;
      } else if (arg.kind === "NewExpression") {
        typeName = (arg as any).typeName as string;
      } else if (arg.kind === "Identifier") {
        // Try to read the type from the scope.
        try {
          const symbol = this.scopeManager.getVariable((arg as any).name);
          typeName     = symbol.type;
        } catch { /* Variable not in scope — typeName stays undefined. */ }
      }
    }

    // Emit the THROW event so the UI can highlight the throw statement line
    // even if the ThrowSignal is caught by an enclosing try block.
    this.eventEmitter.emit(stmt.line, EventType.THROW, {
      value,
      typeName,
    });

    // ThrowSignal propagates up through walkBlock → walkTryStatement (if any).
    throw new ThrowSignal({ value, typeName });
  }
}