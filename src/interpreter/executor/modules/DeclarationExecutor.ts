import type {
  IRVariableDeclaration,
  IRExpression,
  IRStructDeclaration,
  IREnumDeclaration,
} from "../../ir/IRNode";
import { ScopeManager } from "../../runtime/ScopeManager";
import { EventEmitter } from "../../events/EventEmitter";
import { EventType } from "../../types";
import type { CppValue, CppType, StaticStorageKey } from "../../types";
import { ExpressionEvaluator } from "../../evaluator/ExpressionEvaluator";
import { cloneRuntimeValue, logStepToConsole } from "../../utils/helpers";
import { createMockContainer } from "./helpers/MockContainerBuilder";

export class DeclarationExecutor {
  constructor(
    private scopeManager: ScopeManager,
    private evaluator: ExpressionEvaluator,
    private eventEmitter: EventEmitter,
    private classBlueprints?: Map<string, IRStructDeclaration>,
    private enumBlueprints?: Map<string, IREnumDeclaration>,
    private typeAliases?: Map<string, string>,
    private staticStorage?: Map<StaticStorageKey, { type: CppType; value: CppValue }>,
    private currentFunction?: string,
    private instantiateCallback?: (typeName: string, args: IRExpression[]) => CppValue,
  ) {}

  public executeVariableDeclaration(node: IRVariableDeclaration): void {
    const isConst = node.isConst ?? false;
    const isStatic = node.isStatic ?? false;

    let resolvedType = node.variableType;
    if (this.typeAliases) {
      let expanded = this.typeAliases.get(resolvedType);
      const visited = new Set<string>();
      while (expanded && !visited.has(resolvedType)) {
        visited.add(resolvedType);
        resolvedType = expanded;
        expanded = this.typeAliases.get(resolvedType);
      }
    }
    const typeLower = resolvedType.toLowerCase();

    if (isStatic && this.staticStorage && this.currentFunction) {
      const storageKey = `${this.currentFunction}::${node.name}` as StaticStorageKey;
      if (this.staticStorage.has(storageKey)) {
        const persistedRecord = this.staticStorage.get(storageKey)!;
        const persistedValue = persistedRecord.value;
        this.scopeManager.defineStatic(node.name, resolvedType, persistedValue);
        this.eventEmitter.emit(node.line, EventType.DECLARE, {
          variable: node.name,
          type: resolvedType,
          value: persistedValue,
          isStatic: true,
        });
        return;
      }
    }

    let value: CppValue | undefined;

    if (node.initializer) {
      try {
        value = this.evaluator.evaluate(node.initializer);
      } catch (e) {
        logStepToConsole(
          `[StatementExecutor] Failed to evaluate initializer for '${node.name}': ` +
            `${(e as Error).message}`,
        );
      }
    }

    if (value === undefined && node.constructorArgs && node.constructorArgs.length > 0) {
      try {
        const arg0 = this.evaluator.evaluate(node.constructorArgs[0]);
        const arg1 =
          node.constructorArgs.length > 1
            ? this.evaluator.evaluate(node.constructorArgs[1])
            : undefined;
        const size = typeof arg0 === "number" && arg0 >= 0 && arg0 < 1_000_000 ? arg0 : -1;

        const isBareStringType =
          typeLower === "string" ||
          typeLower === "std::string" ||
          typeLower === "wstring" ||
          typeLower === "std::wstring";
        if (isBareStringType && size >= 0 && arg1 !== undefined) {
          value = String(arg1).repeat(size);
        } else if (this.isContainerType(typeLower)) {
          const arg0Node = node.constructorArgs[0] as any;
          const isRange =
            node.constructorArgs.length >= 2 &&
            (arg0Node?.method === "begin" || arg0Node?.function?.property === "begin");

          if (isRange) {
            let elements: any[] = [];
            const targetNode = arg0Node.object || arg0Node.function?.object;
            if (targetNode) {
              try {
                const container = this.evaluator.evaluate(targetNode);
                if (container && Array.isArray(container)) elements = container;
                else if (
                  container &&
                  (container as any).data &&
                  Array.isArray((container as any).data)
                )
                  elements = (container as any).data;
              } catch (e) {}
            }
            value = this.createMockContainer([...elements], typeLower);
          } else if (size >= 0) {
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
                Array.isArray(fillVal)
                  ? [...fillVal]
                  : fillVal && typeof fillVal === "object" && Array.isArray((fillVal as any).data)
                    ? { ...(fillVal as any), data: [...(fillVal as any).data] }
                    : fillVal,
              ),
              typeLower,
            );
          } else {
            value = this.createMockContainer([], typeLower);
          }
        } else if (typeLower.includes("unordered_set") || typeLower.includes("set")) {
          let elements: any[] = [];
          if (node.constructorArgs && node.constructorArgs.length >= 2) {
            const arg0Node = node.constructorArgs[0] as any;
            if (arg0Node?.method === "begin" || arg0Node?.function?.property === "begin") {
              const targetNode = arg0Node.object || arg0Node.function?.object;
              if (targetNode) {
                try {
                  const container = this.evaluator.evaluate(targetNode);
                  if (container && Array.isArray(container)) elements = container;
                  else if (
                    container &&
                    (container as any).data &&
                    Array.isArray((container as any).data)
                  )
                    elements = (container as any).data;
                } catch (e) {}
              }
            }
          }
          value = new Set(elements);
        } else if (typeLower.includes("unordered_map") || typeLower.includes("map")) {
          let elements: any[] = [];
          if (node.constructorArgs && node.constructorArgs.length >= 2) {
            const arg0Node = node.constructorArgs[0] as any;
            if (arg0Node?.method === "begin" || arg0Node?.function?.property === "begin") {
              const targetNode = arg0Node.object || arg0Node.function?.object;
              if (targetNode) {
                try {
                  const container = this.evaluator.evaluate(targetNode);
                  if (container && Array.isArray(container)) elements = container;
                  else if (
                    container &&
                    (container as any).data &&
                    Array.isArray((container as any).data)
                  )
                    elements = (container as any).data;
                } catch (e) {}
              }
            }
          }
          value = new Map(elements);
        } else if (typeLower.includes("pair")) {
          value = [arg0, arg1 !== undefined ? arg1 : 0];
        } else if (this.classBlueprints?.has(resolvedType)) {
          value = this.instantiateStruct(resolvedType, node.constructorArgs);
        } else {
          value = arg0;
        }
      } catch (e) {
        logStepToConsole(
          `[StatementExecutor] Failed to evaluate constructor args for '${node.name}': ` +
            `${(e as Error).message}`,
        );
      }
    }

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

    if (value === undefined) {
      value = this.defaultValueForType(resolvedType, typeLower, node.constructorArgs ?? []);
    }

    if (value !== undefined) {
      value = cloneRuntimeValue(value);
    }

    if ((resolvedType === "char" || resolvedType === "const char") && typeof value === "number") {
      value = String.fromCharCode(value);
    }

    if (node.name.startsWith("[") && node.name.endsWith("]")) {
      this.defineStructuredBinding(node, resolvedType, value, isConst);
      return;
    }

    if (isStatic) {
      this.scopeManager.defineStatic(node.name, resolvedType, value);
      if (this.staticStorage && this.currentFunction) {
        this.staticStorage.set(`${this.currentFunction}::${node.name}` as StaticStorageKey, {
          type: resolvedType,
          value,
        });
      }
    } else {
      this.scopeManager.defineVariable(node.name, resolvedType, value, isConst, false);
    }

    this.eventEmitter.emit(node.line, EventType.DECLARE, {
      variable: node.name,
      type: resolvedType,
      value,
      isConst,
      isStatic,
    });
  }

  public isContainerType(typeLower: string): boolean {
    const baseType = typeLower.split("<")[0].replace("std::", "").trim();
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

  public defaultValueForType(
    resolvedType: string,
    typeLower: string,
    constructorArgs: IRExpression[],
  ): CppValue {
    if (this.classBlueprints?.has(resolvedType)) {
      return this.instantiateStruct(resolvedType, constructorArgs);
    }
    if (this.enumBlueprints?.has(resolvedType)) {
      return 0;
    }
    if (this.isContainerType(typeLower)) {
      return this.createMockContainer([], typeLower);
    }
    if (typeLower.includes("unordered_set") || typeLower.includes("set")) {
      return new Set();
    }
    if (typeLower.includes("unordered_map") || typeLower.includes("map")) {
      return new Map();
    }
    if (
      typeLower === "string" ||
      typeLower === "std::string" ||
      typeLower === "wstring" ||
      typeLower === "std::wstring"
    )
      return "";
    if (typeLower.includes("bool")) return false;
    if (
      typeLower.includes("int") ||
      typeLower.includes("long") ||
      typeLower.includes("short") ||
      typeLower.includes("double") ||
      typeLower.includes("float") ||
      typeLower.includes("char") ||
      typeLower === "auto"
    )
      return 0;
    if (typeLower.includes("*") || typeLower.includes("nullptr")) return null;
    return 0;
  }

  private defineStructuredBinding(
    node: IRVariableDeclaration,
    resolvedType: string,
    value: CppValue,
    isConst: boolean,
  ): void {
    const parts = node.name
      .slice(1, -1)
      .split(",")
      .map((s) => s.trim());

    if (Array.isArray(value)) {
      parts.forEach((p, idx) => {
        if (p) this.scopeManager.defineVariable(p, resolvedType, (value as any[])[idx], isConst);
      });
    } else if (
      value &&
      typeof value === "object" &&
      !(value instanceof Map) &&
      !(value instanceof Set)
    ) {
      const keys = Object.keys(value as Record<string, any>);
      parts.forEach((p, idx) => {
        if (p)
          this.scopeManager.defineVariable(p, resolvedType, (value as any)[keys[idx]], isConst);
      });
    } else {
      parts.forEach((p) => {
        if (p) this.scopeManager.defineVariable(p, resolvedType, value, isConst);
      });
    }

    this.eventEmitter.emit(node.line, EventType.DECLARE, {
      variable: node.name,
      type: resolvedType,
      value,
    });
  }

  private instantiateStruct(
    typeName: string,
    constructorArgs: IRExpression[],
  ): Record<string, any> {
    if (this.instantiateCallback) {
      return this.instantiateCallback(typeName, constructorArgs) as Record<string, any>;
    }
    const blueprint = this.classBlueprints!.get(typeName)!;
    const instance: Record<string, any> = { __type: typeName };

    for (const field of blueprint.fields) {
      if (field.defaultValue) {
        instance[field.name] = this.evaluator.evaluate(field.defaultValue);
      } else {
        const t = field.type.toLowerCase();
        if (t.includes("unordered_map") || t.includes("map")) instance[field.name] = new Map();
        else if (t.includes("unordered_set") || t.includes("set")) instance[field.name] = new Set();
        else if (
          t.includes("vector") ||
          t.includes("list") ||
          t.includes("deque") ||
          t.includes("queue") ||
          t.includes("stack")
        ) {
          instance[field.name] = this.createMockContainer([], t);
        } else if (t.includes("[]")) instance[field.name] = [];
        else if (t === "string" || t === "std::string" || t === "wstring")
          instance[field.name] = "";
        else if (t.includes("bool")) instance[field.name] = false;
        else if (t.includes("*") || t.includes("nullptr")) instance[field.name] = null;
        else instance[field.name] = 0;
      }
    }

    for (let i = 0; i < constructorArgs.length && i < blueprint.fields.length; i++) {
      instance[blueprint.fields[i].name] = this.evaluator.evaluate(constructorArgs[i]);
    }

    return instance;
  }

  public createMockContainer(initialData: any[], typeLower: string = ""): Record<string, any> {
    return createMockContainer(initialData, typeLower);
  }
}
