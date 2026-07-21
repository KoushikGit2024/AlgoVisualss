import { useMemo } from "react";

// Maps a snapshot step to a dictionary of (variableName -> Array of target data structure names)
export type PointerHistoryMap = Record<number, Record<string, string[]>>;

export function usePointerHistory(snapshots: any[]): PointerHistoryMap {
  return useMemo(() => {
    const history: PointerHistoryMap = {};
    // Tracks the most recent targets for each variable
    const activeBindings: Record<string, Set<string>> = {};

    for (let step = 0; step < snapshots.length; step++) {
      const snap = snapshots[step];
      const event = snap.event;

      if (
        event &&
        (event.type === "READ" ||
          event.type === "ASSIGNMENT" ||
          event.type === "ASSIGN" ||
          event.type === "DECLARE" ||
          event.type === "DECLARATION")
      ) {
        const varString = event.payload?.variable;
        const indexVariables = event.payload?.indexVariables as string[] | undefined;

        if (typeof varString === "string") {
          // If a variable is declared or reassigned, clear its pointer history
          if (
            (event.type === "ASSIGNMENT" ||
              event.type === "ASSIGN" ||
              event.type === "DECLARE" ||
              event.type === "DECLARATION") &&
            !varString.includes("[")
          ) {
            if (activeBindings[varString]) {
              activeBindings[varString].clear();
            }
          }

          // If the interpreter supplied explicit index variables, bind them
          if (indexVariables && indexVariables.length > 0) {
            // Extract the base array/container name from e.g. "arr[0]"
            const arrName = varString.split("[")[0];
            for (const vName of indexVariables) {
              if (!activeBindings[vName]) activeBindings[vName] = new Set();
              activeBindings[vName].add(arrName);
            }
          }
        }
      }

      // Snapshot the state for this frame
      const stepBindings: Record<string, string[]> = {};
      for (const [vName, targets] of Object.entries(activeBindings)) {
        if (targets.size > 0) {
          stepBindings[vName] = Array.from(targets);
        }
      }
      history[step] = stepBindings;
    }

    return history;
  }, [snapshots]);
}
