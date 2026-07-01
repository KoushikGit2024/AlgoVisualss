// ============================================================================
// EventEmitter.ts — The Observer-pattern event bus for the execution engine.
//
// Every significant runtime action (variable declared, loop iterated, function
// called, cout written) is broadcast through this class. The ExecutionEngine
// subscribes a single listener in its constructor that converts each event into
// a RuntimeSnapshot and appends it to the snapshot array returned by run().
//
// Design principles:
//   - One emitter instance lives on one ExecutionEngine instance.
//   - Subscribers register via subscribe() and receive a cleanup function.
//   - reset() clears the step counter between runs but preserves subscribers
//     so the engine's snapshot-capture subscription survives across runs.
//   - EventFilter lets callers suppress high-frequency event categories
//     (READ, LOOP_ITERATION) to dramatically reduce snapshot count for tight
//     loops without sacrificing correctness of the displayed state.
//   - A maxSnapshots ceiling prevents out-of-memory crashes on pathological
//     inputs by stopping emission once the limit is reached.
//
// Extension history:
//   v1 — Initial: subscribe / emit / reset.
//   v2 — Added: EventFilter (category suppression + maxSnapshots ceiling);
//               suppressedCount / totalEmitted telemetry accessors;
//               isSuppressed() predicate for external inspection;
//               filter mutation via setFilter() / clearFilter().
// ============================================================================

import { EventType }          from "../types";
import type { ExecutionEvent, EventFilter } from "../types";


// ─── Callback Type ────────────────────────────────────────────────────────────

/**
 * Signature for event listener callbacks.
 * Receives the fully constructed ExecutionEvent and may inspect or transform it.
 * Must be synchronous — the emitter does not await async callbacks.
 */
export type EventCallback = (event: ExecutionEvent) => void;


// ─── Default filter values ────────────────────────────────────────────────────

/**
 * Absolute upper bound on snapshots emitted in a single run when no explicit
 * maxSnapshots is provided in the EventFilter. Prevents tab OOM on programs
 * with millions of iterations (e.g. forgot to add a break condition).
 *
 * 500,000 snapshots at ~2 KB each ≈ 1 GB — the hard cap is well below that.
 * Typical interactive programs produce < 10,000 snapshots.
 */
const ABSOLUTE_MAX_SNAPSHOTS = 10_000_000;


// ─── EventEmitter ─────────────────────────────────────────────────────────────

/**
 * Broadcasts execution milestones to all registered listeners.
 *
 * The emitter is intentionally agnostic about what listeners do with events —
 * it does not know about RuntimeSnapshots, React, or the UI. That coupling
 * lives in ExecutionEngine, which registers its own listener and builds
 * snapshots from the events it receives.
 *
 * Filtering behaviour:
 *   When an EventFilter is active, emit() silently drops events whose category
 *   is suppressed before incrementing the step counter or notifying listeners.
 *   This means suppressed events leave no gap in step numbers — the counter
 *   only advances for events that actually reach listeners, keeping snapshot
 *   step indices contiguous.
 *
 * Ceiling behaviour:
 *   Once totalEmitted reaches the maxSnapshots ceiling, all subsequent emit()
 *   calls are silently dropped. A single WRITE event with the message
 *   "[Engine] Snapshot limit reached — output truncated." is emitted just
 *   before the ceiling takes effect, so the UI can display a warning.
 */
export class EventEmitter {

  /** Registered listener callbacks. */
  private listeners: EventCallback[];

  /**
   * Monotonically increasing step counter. Advanced only for events that pass
   * the filter and are actually delivered to listeners. Reset to 0 by reset().
   */
  private stepCounter: number;

  /**
   * Active filter configuration. Null means no filtering — all events pass.
   * Set via setFilter() / clearFilter(); read by isSuppressed() and emit().
   */
  private filter: EventFilter | null;

  /**
   * Number of events dropped by the active filter in the current run.
   * Exposed via getSuppressedCount() for the UI's "N events suppressed" badge.
   */
  private suppressedCount: number;

  /**
   * Number of events successfully delivered to listeners in the current run.
   * Exposed via getTotalEmitted() for telemetry and the UI snapshot counter.
   */
  private totalEmitted: number;

  /**
   * True after the ceiling warning event has been emitted. Prevents the
   * warning from being emitted multiple times if emit() is called again
   * after the ceiling is reached.
   */
  private ceilingWarningEmitted: boolean;

  constructor() {
    this.listeners              = [];
    this.stepCounter            = 0;
    this.filter                 = null;
    this.suppressedCount        = 0;
    this.totalEmitted           = 0;
    this.ceilingWarningEmitted  = false;
  }


  // ── Subscription ──────────────────────────────────────────────────────────

  /**
   * Registers a callback to receive execution events.
   *
   * Callbacks are invoked synchronously in registration order on every emit()
   * call that passes the active filter. Throwing inside a callback will
   * propagate the error through emit() to the caller (IRWalker / StatementExecutor),
   * so callbacks should be defensive.
   *
   * @param callback - The function to invoke on each event.
   * @returns          A cleanup function. Call it to unsubscribe the listener
   *                   and prevent memory leaks when the engine is discarded.
   *
   * @example
   * const unsubscribe = emitter.subscribe(event => console.log(event.type));
   * // Later:
   * unsubscribe();
   */
  public subscribe(callback: EventCallback): () => void {
    this.listeners.push(callback);

    // Return a stable unsubscribe function that filters by reference equality.
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }


  // ── Emission ──────────────────────────────────────────────────────────────

  /**
   * Broadcasts an execution event to all registered listeners.
   *
   * Processing pipeline:
   *   1. Check ceiling — if totalEmitted >= maxSnapshots, drop silently
   *      (emitting a one-time warning event just before the first drop).
   *   2. Check filter — if the event category is suppressed, increment
   *      suppressedCount and return without advancing the step counter.
   *   3. Build the ExecutionEvent with a unique id and the next step number.
   *   4. Deliver to all listeners in registration order.
   *   5. Increment totalEmitted.
   *
   * @param line    - 1-based C++ source line where the event originated.
   * @param type    - The event category (see EventType enum).
   * @param payload - Contextual data for this specific event.
   */
  public emit(
    line:    number,
    type:    EventType,
    payload: Record<string, unknown>,
  ): void {

    // ── Step 1: Ceiling check ─────────────────────────────────────────────
    const ceiling = this.filter?.maxSnapshots ?? ABSOLUTE_MAX_SNAPSHOTS;

    if (this.totalEmitted >= ceiling) {
      // Emit the ceiling warning exactly once, then stop all further emission.
      if (!this.ceilingWarningEmitted) {
        this.ceilingWarningEmitted = true;
        // Deliver the warning directly to listeners, bypassing all filters,
        // so the UI always sees it regardless of current filter configuration.
        this.deliverEvent(line, EventType.WRITE, {
          output:
            `\n[Engine] Snapshot limit of ${ceiling.toLocaleString()} reached. ` +
            `Execution output has been truncated. ` +
            `Use EventFilter.maxSnapshots or suppress READ / LOOP_ITERATION events ` +
            `to extend the visible range.`,
        });
      }
      return;
    }

    // ── Step 2: Category filter ───────────────────────────────────────────
    if (this.isSuppressed(type, payload)) {
      this.suppressedCount++;
      return; // Step counter NOT advanced — suppressed steps leave no gap.
    }

    // ── Steps 3–5: Build event, deliver, record ───────────────────────────
    this.deliverEvent(line, type, payload);
  }

  /**
   * Internal helper: constructs the ExecutionEvent, advances the step counter,
   * delivers to all listeners, and increments totalEmitted.
   *
   * Extracted from emit() so the ceiling-warning path can bypass the filter
   * while still going through the same delivery logic.
   *
   * @param line    - Source line.
   * @param type    - Event category.
   * @param payload - Event payload.
   */
  private deliverEvent(
    line:    number,
    type:    EventType,
    payload: Record<string, unknown>,
  ): void {
    const event: ExecutionEvent = {
      // Prefer the Web Crypto API for UUID generation; fall back to a
      // Math.random-based approach for environments without crypto support
      // (e.g. some Jest test environments without jsdom).
      id: (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2, 11) +
          Math.random().toString(36).slice(2, 11),
      step:    ++this.stepCounter,
      line,
      type,
      payload,
    };

    for (const listener of this.listeners) {
      listener(event);
    }

    this.totalEmitted++;
  }


  // ── Filter Management ─────────────────────────────────────────────────────

  /**
   * Installs or replaces the active EventFilter.
   *
   * Takes effect immediately: the next emit() call will apply the new filter.
   * Can be called mid-run to dynamically change suppression behaviour, though
   * the typical usage is to set the filter once before calling run().
   *
   * @param filter - The new filter configuration. All fields are optional and
   *   default to false / undefined (nothing suppressed). Pass an empty object
   *   `{}` to install a filter that only enforces maxSnapshots.
   *
   * @example
   * // Suppress reads and loop iterations; cap at 50,000 snapshots:
   * emitter.setFilter({
   *   suppressRead:          true,
   *   suppressLoopIteration: true,
   *   maxSnapshots:          50_000,
   * });
   */
  public setFilter(filter: EventFilter): void {
    this.filter = filter;
  }

  /**
   * Removes the active EventFilter, restoring full event emission.
   * All subsequent emit() calls will pass until a new filter is set or the
   * absolute ceiling (ABSOLUTE_MAX_SNAPSHOTS) is reached.
   */
  public clearFilter(): void {
    this.filter = null;
  }

  /**
   * Returns true if the given EventType would be suppressed by the active
   * filter. Returns false if no filter is active or if the type is not
   * covered by any suppression flag.
   *
   * Used externally by ExecutionEngine to skip building complex payloads for
   * events that will be dropped anyway (avoids wasted allocations on hot paths
   * like READ events inside tight loops).
   *
   * @param type - The event category to test.
   * @param payload - Optional event payload (needed for native call suppression check).
   */
  public isSuppressed(type: EventType, payload?: any): boolean {
    if (!this.filter) return false;

    switch (type) {
      case EventType.READ:
        return this.filter.suppressRead === true;

      case EventType.LOOP_ITERATION:
        return this.filter.suppressLoopIteration === true;

      case EventType.LOOP_ENTER:
      case EventType.LOOP_EXIT:
        return this.filter.suppressLoopBounds === true;

      case EventType.FUNCTION_CALL:
      case EventType.FUNCTION_RETURN:
        return this.filter?.suppressNativeCalls === true && (payload as any)?.isNative === true;

      default:
        // All other event types (DECLARE, ASSIGNMENT, WRITE, CONDITION,
        // THROW, CATCH, BREAKPOINT, INPUT) are always delivered.
        return false;
    }
  }


  // ── Telemetry ─────────────────────────────────────────────────────────────

  /**
   * Returns the number of events suppressed by the active filter in the
   * current run. Reset to 0 by reset(). Used by the UI to display a
   * "N events hidden" badge when a filter is active.
   */
  public getSuppressedCount(): number {
    return this.suppressedCount;
  }

  /**
   * Returns the total number of events successfully delivered to listeners
   * in the current run. Matches the final step counter value at end of run.
   */
  public getTotalEmitted(): number {
    return this.totalEmitted;
  }

  /**
   * Returns the current step counter value — the step number that will be
   * assigned to the NEXT emitted event. Used by ExecutionEngine to label
   * the snapshot array before a run begins.
   */
  public getCurrentStep(): number {
    return this.stepCounter;
  }


  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Resets all per-run state in preparation for a new execution.
   *
   * Resets:
   *   - stepCounter          → 0   (step numbers restart from 1)
   *   - suppressedCount      → 0   (telemetry for the new run)
   *   - totalEmitted         → 0   (telemetry for the new run)
   *   - ceilingWarningEmitted → false (warning may fire again next run)
   *
   * Deliberately preserves:
   *   - listeners   — The engine's snapshot-capture subscription is registered
   *                   once in the ExecutionEngine constructor and must survive
   *                   between runs. Re-registering on every run() call would
   *                   cause duplicate snapshot entries.
   *   - filter      — The caller sets the filter once before run() and expects
   *                   it to remain active for the next run without re-applying it.
   *
   * Called by ExecutionEngine.run() as its first action before any execution
   * begins, ensuring a clean slate even if a previous run crashed mid-way.
   */
  public reset(): void {
    this.stepCounter           = 0;
    this.suppressedCount       = 0;
    this.totalEmitted          = 0;
    this.ceilingWarningEmitted = false;
    // Intentionally NOT resetting: this.listeners, this.filter
  }
}