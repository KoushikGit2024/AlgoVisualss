// src/interpreter/events/EventEmitter.ts
import { EventType } from "../types";
import type { ExecutionEvent } from "../types";

export type EventCallback = (event: ExecutionEvent) => void;

/**
 * The intercom system for the execution engine.
 * Every time the interpreter does something interesting (assigns a variable, enters a loop),
 * it yells it into this emitter. The ExecutionEngine listens to this to build the snapshots.
 */
export class EventEmitter {
  private listeners: EventCallback[] = [];
  private stepCounter: number = 0;

  public subscribe(callback: EventCallback): () => void {
    this.listeners.push(callback);
    // Return an unsubscribe function so React can clean up if the component unmounts
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  public emit(line: number, type: EventType, payload: Record<string, unknown>): void {
    const event: ExecutionEvent = {
      // Fallback for older browsers that don't support crypto.randomUUID
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      step: ++this.stepCounter, // Chronological step number
      line,
      type,
      payload,
    };

    for (const listener of this.listeners) {
      listener(event);
    }
  }

  public reset(): void {
    this.stepCounter = 0;
  }
}