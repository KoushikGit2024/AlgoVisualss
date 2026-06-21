import { EventType } from "../types";
import type { ExecutionEvent } from "../types";

/**
 * Callback signature for execution event listeners.
 */
export type EventCallback = (event: ExecutionEvent) => void;

/**
 * The `EventEmitter` implements the Observer pattern for the execution engine.
 * It broadcasts execution milestones (e.g., variable assignments, loop iterations)
 * to all registered subscribers. The `ExecutionEngine` utilizes this stream
 * to construct chronological `RuntimeSnapshot` objects for the frontend visualizer.
 */
export class EventEmitter {
  private listeners: EventCallback[] = [];
  private stepCounter: number = 0;

  /**
   * Registers a callback function to listen for execution events.
   * @param callback - The function to be invoked when an event is emitted.
   * @returns A cleanup function to unsubscribe the listener, preventing memory leaks.
   */
  public subscribe(callback: EventCallback): () => void {
    this.listeners.push(callback);
    
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Broadcasts an execution event to all registered listeners.
   * * @param line - The source code line number where the event occurred.
   * @param type - The specific category of the event (e.g., ASSIGNMENT, CONDITION).
   * @param payload - Contextual data associated with the event (e.g., variable values).
   */
  public emit(line: number, type: EventType, payload: Record<string, unknown>): void {
    const event: ExecutionEvent = {
      // Safely check for crypto to prevent ReferenceErrors in unsupported environments
      id: typeof crypto !== "undefined" && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 11),
      step: ++this.stepCounter,
      line,
      type,
      payload,
    };

    for (const listener of this.listeners) {
      listener(event);
    }
  }

  /**
   * Resets the internal step counter to zero. Typically called before initiating
   * a new execution run to ensure chronological consistency across snapshots.
   * NOTE: Intentionally preserves registered listeners — the ExecutionEngine's
   * snapshot subscription is set up once in the constructor and must survive resets.
   */
  public reset(): void {
    this.stepCounter = 0;
  }
}