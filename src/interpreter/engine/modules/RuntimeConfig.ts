import { EventEmitter } from "../../events/EventEmitter";
import { CallStack } from "../../runtime/CallStack";
import type { EventFilter, Breakpoint, CppValue } from "../../types";

export class RuntimeConfig {
  public maxSteps: number = 2000000;
  public maxSnapshots: number = 30000;

  public inputQueue: CppValue[] = [];
  public breakpoints: Breakpoint[] = [];

  constructor(
    private eventEmitter: EventEmitter,
    private callStack: CallStack,
  ) {}

  public setInputValues(inputs: string[]): void {
    this.inputQueue = [...inputs];
  }

  public provideInput(): CppValue | undefined {
    return this.inputQueue.length > 0 ? this.inputQueue.shift()! : undefined;
  }

  public setBreakpoints(breakpoints: Breakpoint[]): void {
    this.breakpoints = breakpoints.filter((bp) => bp.enabled !== false);
  }

  public clearBreakpoints(): void {
    this.breakpoints = [];
  }

  public setEventFilter(filter: EventFilter): void {
    this.eventEmitter.setFilter(filter);
  }

  public clearEventFilter(): void {
    this.eventEmitter.clearFilter();
  }

  public setMaxDepth(depth: number): void {
    this.callStack.setMaxDepth(depth);
  }
}
