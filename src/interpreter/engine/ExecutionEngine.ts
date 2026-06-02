// src/interpreter/engine/ExecutionEngine.ts
import type { IRProgram, IRFunctionDeclaration, IRFunctionCall } from "../ir/IRNode";
import { CallStack } from "../runtime/CallStack";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { StatementExecutor } from "../executor/StatementExecutor";
import { IRWalker } from "../walker/IRWalker";
import { EventType } from "../types";
import type { RuntimeSnapshot, CppValue, CppType } from "../types";
import { createSnapshot, ReturnSignal } from "../utils/helpers";

/**
 * The Master Controller.
 * This class sets up the environment, loads the parsed code, and kicks off the execution.
 * It also holds the master array of snapshots that eventually gets sent to React!
 */
export class ExecutionEngine {
  private callStack: CallStack;
  private eventEmitter: EventEmitter;
  private functions: Map<string, IRFunctionDeclaration>;
  private snapshots: RuntimeSnapshot[];

  constructor() {
    this.callStack = new CallStack();
    this.eventEmitter = new EventEmitter();
    this.functions = new Map<string, IRFunctionDeclaration>();
    this.snapshots = [];

    // The secret sauce: Every single time the emitter fires an event (like an assignment),
    // we instantly take a photo of the current memory state and save it to the timeline.
    this.eventEmitter.subscribe((event) => {
      const activeFrame = this.callStack.peek();
      this.snapshots.push(createSnapshot(event, this.callStack, activeFrame.scopeManager));
    });
  }

  public loadProgram(program: IRProgram): void {
    this.functions.clear();
    for (const func of program.functions) {
      this.functions.set(func.name, func);
    }
  }

  public run(entryPoint: string = "main"): RuntimeSnapshot[] {
    this.snapshots = [];
    this.eventEmitter.reset();
    
    if (!this.functions.has(entryPoint)) {
      throw new Error(`Entry point '${entryPoint}' not found.`);
    }

    this.invokeFunction(entryPoint, []);
    return this.snapshots;
  }

  // Exposed so the ExpressionEvaluator can call it when it hits a math equation
  // that secretly has a function inside it (e.g., `x = 5 + getNumber()`)
  public invokeFunctionCall(callNode: IRFunctionCall, currentEvaluator: ExpressionEvaluator): CppValue {
    const args = callNode.arguments.map(arg => currentEvaluator.evaluate(arg));
    return this.invokeFunction(callNode.callee, args);
  }

  private invokeFunction(name: string, args: CppValue[]): CppValue {
    const func = this.functions.get(name);
    if (!func) {
      throw new Error(`Undefined reference to function '${name}'.`);
    }

    if (args.length !== func.parameters.length) {
      throw new Error(`Function '${name}' expects ${func.parameters.length} arguments, got ${args.length}.`);
    }

    // 1. Create a brand new isolated memory frame for this specific function run
    const frame = this.callStack.push(name);
    this.eventEmitter.emit(func.line, EventType.FUNCTION_CALL, { function: name, args });

    // 2. Bind the arguments to the parameter names in the new scope
    func.parameters.forEach((param, index) => {
      const paramName = param.name;
      let paramType = param.type as CppType;
      
      // If it's an array parameter, treat it as a generic JS array reference
      if (paramType.includes("[]") || paramType.includes("*")) {
          paramType = "array" as any; 
      }

      frame.scopeManager.defineVariable(paramName, paramType, args[index]);
    });

    const evaluator = new ExpressionEvaluator(frame.scopeManager, this.eventEmitter);
    
    // --- THE MONKEY PATCH ---
    // We overwrite the evaluator's evaluate function specifically for FunctionCalls.
    // This perfectly bridges the gap between the Evaluator and the Engine without circular imports.
    const originalEvaluate = evaluator.evaluate.bind(evaluator);
    evaluator.evaluate = (expr) => {
      if (expr.kind === "FunctionCall") {
        return this.invokeFunctionCall(expr as IRFunctionCall, evaluator);
      }
      return originalEvaluate(expr);
    };

    const executor = new StatementExecutor(frame.scopeManager, evaluator, this.eventEmitter);
    const walker = new IRWalker(frame.scopeManager, evaluator, executor, this.eventEmitter);

    let returnValue: CppValue = undefined;

    // 3. Actually run the block of code!
    try {
      walker.walkBlock(func.body);
    } catch (e) {
      // If the code hit a `return x;`, it throws a ReturnSignal. 
      // We catch it here and extract the value gracefully!
      if (e instanceof ReturnSignal) {
        returnValue = e.value;
      } else {
        throw e; // A real error occurred, let it crash.
      }
    } finally {
      // 4. Clean up: Announce the return and destroy the memory frame.
      this.eventEmitter.emit(func.line, EventType.FUNCTION_RETURN, { 
        function: name, 
        returnValue 
      });
      this.callStack.pop();
    }

    return returnValue;
  }
}