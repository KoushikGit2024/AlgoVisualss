import type {
  IRProgram,
  IRFunctionDeclaration,
  IRStructDeclaration,
  IREnumDeclaration,
  IRVariableDeclaration,
} from "../ir/IRNode";
import { CallStack } from "../runtime/CallStack";
import { EventEmitter } from "../events/EventEmitter";
import { ExpressionEvaluator } from "../evaluator/ExpressionEvaluator";
import { StatementExecutor } from "../executor/StatementExecutor";
import { ScopeManager } from "../runtime/ScopeManager";
import { EventType } from "../types";
import type {
  RuntimeSnapshot,
  CppValue,
  CppType,
  EventFilter,
  Breakpoint,
  StaticStorageKey,
} from "../types";
import {
  createSnapshot,
  ThrowSignal,
  BreakpointSignal,
  resetGlobalIdCounter,
  logStepToConsole,
} from "../utils/helpers";

import { RuntimeConfig } from "./modules/RuntimeConfig";
import { ProgramLoader } from "./modules/ProgramLoader";
import { NativeFunctionHandler } from "./modules/NativeFunctionHandler";
import { FunctionInvoker } from "./modules/FunctionInvoker";
import type { EngineContext } from "./modules/EngineContext";

export class ExecutionEngine {
  public functions: Map<string, IRFunctionDeclaration> = new Map();
  public classBlueprints: Map<string, IRStructDeclaration> = new Map();
  public enumBlueprints: Map<string, IREnumDeclaration> = new Map();
  public resolvedEnumValues: Map<string, number> = new Map();
  public typeAliases: Map<string, string> = new Map();

  public callStack: CallStack = new CallStack();
  public eventEmitter: EventEmitter = new EventEmitter();

  public globalDeclarations: IRVariableDeclaration[] = [];
  public globalVariables: Map<string, { type: CppType; value: CppValue }> = new Map();
  public globalScopeManager: ScopeManager | null = null;
  public staticStorage: Map<StaticStorageKey, { type: CppType; value: CppValue }> = new Map();

  private config: RuntimeConfig;
  private loader: ProgramLoader;
  private nativeHandler: NativeFunctionHandler;
  private invoker: FunctionInvoker;
  private engineContext: EngineContext;

  public maxSteps: number = 2000000;
  public maxSnapshots: number = 30000;
  private importanceLevel: number = 0;
  private snapshotSkipFactor: number = 1;
  private stepsSinceLastSnapshot: number = 0;
  private steps: number = 0;

  private snapshots: RuntimeSnapshot[] = [];
  private accumulatedOutput: string = "";
  private pausedAtStep: number | null = null;

  constructor() {
    this.config = new RuntimeConfig(this.eventEmitter, this.callStack);
    this.loader = new ProgramLoader(
      this.functions,
      this.classBlueprints,
      this.enumBlueprints,
      this.resolvedEnumValues,
      this.typeAliases,
      this,
    );
    this.nativeHandler = new NativeFunctionHandler(this.callStack, this.eventEmitter);

    const self = this;
    this.engineContext = {
      functions: this.functions,
      classBlueprints: this.classBlueprints,
      enumBlueprints: this.enumBlueprints,
      typeAliases: this.typeAliases,
      staticStorage: this.staticStorage,
      callStack: this.callStack,
      eventEmitter: this.eventEmitter,
      get breakpoints() {
        return self.config.breakpoints;
      },
      get globalScopeManager() {
        return self.globalScopeManager;
      },
      lambdaCounter: 0,
      provideInput: () => this.config.provideInput(),
    };

    this.invoker = new FunctionInvoker(this.engineContext, this.nativeHandler);

    this.eventEmitter.subscribe((event) => {
      if (event.type === EventType.WRITE && typeof event.payload.output === "string") {
        this.accumulatedOutput += event.payload.output as string;
      }

      const activeFrame = this.callStack.isEmpty() ? null : this.callStack.peek();

      if (activeFrame) {
        if (++this.steps > this.maxSteps) {
          throw new Error(
            `Runtime Error: Maximum execution steps (${this.maxSteps}) exceeded. Algorithm is taking too long or has an infinite loop.`,
          );
        }

        let shouldCapture = true;
        if (this.importanceLevel >= 1 && event.type === EventType.READ) shouldCapture = false;
        if (
          this.importanceLevel >= 2 &&
          (event.type === EventType.CONDITION || String(event.type).startsWith("LOOP_"))
        )
          shouldCapture = false;
        if (
          this.importanceLevel >= 3 &&
          (event.type === EventType.ASSIGNMENT ||
            event.type === EventType.ASSIGN ||
            event.type === EventType.DECLARE)
        )
          shouldCapture = false;

        if (shouldCapture) {
          this.stepsSinceLastSnapshot++;
          if (this.stepsSinceLastSnapshot >= this.snapshotSkipFactor) {
            const snapshot = createSnapshot(
              event,
              this.callStack,
              activeFrame.scopeManager,
              this.accumulatedOutput,
            );
            this.snapshots.push(snapshot);
            logStepToConsole(snapshot, this.steps);
            this.stepsSinceLastSnapshot = 0;

            while (this.snapshots.length >= this.maxSnapshots) {
              if (this.importanceLevel === 0) {
                this.snapshots = this.snapshots.filter((s) => s.event.type !== EventType.READ);
                this.importanceLevel = 1;
                this.snapshots.push({
                  step: this.steps,
                  line: 0,
                  event: {
                    type: EventType.WRITE,
                    payload: {
                      output:
                        "\n[Engine] Downsampling Level 1: Dropped READ events to save memory.\n",
                    },
                  },
                  state: {
                    variables: {},
                    perFrameVariables: [],
                    callStack: [],
                    scopeDepth: 0,
                    output: this.accumulatedOutput,
                  },
                } as any);
              } else if (this.importanceLevel === 1) {
                this.snapshots = this.snapshots.filter(
                  (s) =>
                    s.event.type !== EventType.CONDITION &&
                    !String(s.event.type).startsWith("LOOP_"),
                );
                this.importanceLevel = 2;
                this.snapshots.push({
                  step: this.steps,
                  line: 0,
                  event: {
                    type: EventType.WRITE,
                    payload: {
                      output:
                        "\n[Engine] Downsampling Level 2: Dropped LOOP/CONDITION events to save memory.\n",
                    },
                  },
                  state: {
                    variables: {},
                    perFrameVariables: [],
                    callStack: [],
                    scopeDepth: 0,
                    output: this.accumulatedOutput,
                  },
                } as any);
              } else if (this.importanceLevel === 2) {
                this.snapshots = this.snapshots.filter(
                  (s) =>
                    s.event.type !== EventType.ASSIGNMENT &&
                    s.event.type !== EventType.ASSIGN &&
                    s.event.type !== EventType.DECLARE,
                );
                this.importanceLevel = 3;
                this.snapshots.push({
                  step: this.steps,
                  line: 0,
                  event: {
                    type: EventType.WRITE,
                    payload: {
                      output:
                        "\n[Engine] Downsampling Level 3: Dropped ASSIGN/DECLARE events to save memory.\n",
                    },
                  },
                  state: {
                    variables: {},
                    perFrameVariables: [],
                    callStack: [],
                    scopeDepth: 0,
                    output: this.accumulatedOutput,
                  },
                } as any);
              } else {
                const last = this.snapshots[this.snapshots.length - 1];
                const kept = this.snapshots.filter((_, i) => i % 2 === 0);
                if (kept[kept.length - 1] !== last) kept.push(last);
                this.snapshots = kept;
                this.snapshotSkipFactor *= 2;
                this.snapshots.push({
                  step: this.steps,
                  line: 0,
                  event: {
                    type: EventType.WRITE,
                    payload: {
                      output: `\n[Engine] Downsampling Level 4+: Subsampling rate 1/${this.snapshotSkipFactor} to save memory.\n`,
                    },
                  },
                  state: {
                    variables: {},
                    perFrameVariables: [],
                    callStack: [],
                    scopeDepth: 0,
                    output: this.accumulatedOutput,
                  },
                } as any);
              }
            }
          }
        }
      }
    });
  }

  public loadProgram(program: IRProgram): void {
    this.loader.loadProgram(program);
  }

  public setInputValues(inputs: string[]): void {
    this.config.setInputValues(inputs);
  }

  public setBreakpoints(breakpoints: Breakpoint[]): void {
    this.config.setBreakpoints(breakpoints);
  }

  public clearBreakpoints(): void {
    this.config.clearBreakpoints();
  }

  public setEventFilter(filter: EventFilter): void {
    this.config.setEventFilter(filter);
  }

  public clearEventFilter(): void {
    this.config.clearEventFilter();
  }

  public setMaxDepth(depth: number): void {
    this.config.setMaxDepth(depth);
  }

  public run(entryPoint: string = "main", resetStatics: boolean = false): RuntimeSnapshot[] {
    this.steps = 0;
    this.snapshots = [];
    this.accumulatedOutput = "";
    this.pausedAtStep = null;
    this.importanceLevel = 0;
    this.snapshotSkipFactor = 1;
    this.stepsSinceLastSnapshot = 0;
    this.callStack.reset();
    this.eventEmitter.reset();
    resetGlobalIdCounter();
    if (resetStatics) this.staticStorage.clear();

    if (!this.functions.has(entryPoint)) {
      throw new Error(
        `Linker Error: Entry point '${entryPoint}' not found. ` +
          `Ensure the function is defined and loadProgram() was called with the correct IRProgram.`,
      );
    }

    const globalFrame = this.callStack.push("__global_init__");
    globalFrame.scopeManager.defineVariable("fixed", "__iomanip", "");
    globalFrame.scopeManager.defineVariable("left", "__iomanip", "");
    globalFrame.scopeManager.defineVariable("right", "__iomanip", "");
    const globalEval = new ExpressionEvaluator(globalFrame.scopeManager, this.eventEmitter);
    this.invoker.attachEvaluationInterceptor(globalEval);
    globalEval.setInputProvider(() => this.config.provideInput());

    const globalExecutor = new StatementExecutor(
      globalFrame.scopeManager,
      globalEval,
      this.eventEmitter,
      this.classBlueprints,
      this.enumBlueprints,
      this.typeAliases,
      this.staticStorage,
      "__global_init__",
    );

    if (this.globalDeclarations.length > 0) {
      for (const decl of this.globalDeclarations) {
        try {
          globalExecutor.executeVariableDeclaration(decl);
          const sym = globalFrame.scopeManager.getVariable(decl.name);
          this.globalVariables.set(decl.name, { type: sym.type as CppType, value: sym.value });
        } catch (e) {
          logStepToConsole(
            `[ExecutionEngine.run] Failed to initialise global '${decl.name}': ` +
              `${(e as Error).message}`,
          );
        }
      }
    }

    for (const [memberName, memberValue] of this.resolvedEnumValues) {
      try {
        globalFrame.scopeManager.injectIntoBase(memberName, "int", memberValue, true, false);
      } catch {}
    }

    this.globalScopeManager = globalFrame.scopeManager;
    this.callStack.pop();

    try {
      this.invoker.invokeFunction(entryPoint, []);
    } catch (e: any) {
      if (e instanceof RangeError) {
        throw new Error(
          `Runtime Error: Maximum call stack size exceeded (JS engine limit). ` +
            `Try reducing max depth or checking for infinite recursion.`,
        );
      }
      if (e instanceof BreakpointSignal || e?.name === "BreakpointSignal") {
        this.pausedAtStep = e.line;
        return this.snapshots;
      }
      if (e instanceof ThrowSignal || e?.name === "ThrowSignal") {
        throw new Error(
          `Uncaught Exception at line ${(e as ThrowSignal).payload.typeName ?? "unknown"}: ` +
            `Thrown value: ${JSON.stringify((e as ThrowSignal).payload.value)}. ` +
            `Add a try/catch block or ensure all throw paths are handled.`,
        );
      }
      throw e;
    }

    return this.snapshots;
  }

  public getSnapshots(): RuntimeSnapshot[] {
    return this.snapshots;
  }
  public getOutput(): string {
    return this.accumulatedOutput;
  }
  public getPausedAtStep(): number | null {
    return this.pausedAtStep;
  }
  public getTelemetry(): { emitted: number; suppressed: number; maxDepth: number } {
    return {
      emitted: this.eventEmitter.getTotalEmitted(),
      suppressed: this.eventEmitter.getSuppressedCount(),
      maxDepth: this.callStack.getMaxReachedDepth(),
    };
  }
}
