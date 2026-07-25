import { type CanvasState, type VarMap, deepUnwrap } from "./detectors/coreUtils";
import { detectGenericGraph, tryDetectAdjacencyGraph } from "./detectors/graphDetector";
import { detectTrees } from "./detectors/treeDetector";
import { detectLinearStructures } from "./detectors/linearDetector";
import { detectArraysAndMaps } from "./detectors/arrayDetector";

// Re-export core types for backward compatibility
export type { CanvasState, VisualizerType } from "./detectors/coreUtils";
export { deepUnwrap } from "./detectors/coreUtils";

/**
 * detectVisualizer
 * Orchestrator function that routes the detection logic to specialized detectors.
 */
export function detectVisualizer(
  vars: VarMap,
  currentEvent?: any,
  pointerContext: Record<string, string[]> = {},
): CanvasState[] {
  const visualizers: CanvasState[] = [];
  const consumedKeys = new Set<string>();
  const keys = Object.keys(vars);

  const runPass = (passKeys: string[], passVars: VarMap) => {
    // ── 0. Adjacency-list graph ─────────────────────────────────────────────
    for (const name of passKeys) {
      if (consumedKeys.has(name)) continue;
      const type = passVars[name]?.type ?? "";
      const val = deepUnwrap(passVars[name]?.value);

      if (type.includes("vector") && (name.includes("adj") || name.includes("graph"))) {
        const graphState = tryDetectAdjacencyGraph(
          name,
          val,
          type,
          currentEvent,
          passVars,
          passKeys,
          consumedKeys,
          pointerContext,
        );
        if (graphState) {
          graphState.usedKeys.forEach((k) => consumedKeys.add(k));
          visualizers.push(graphState);
        }
      }
    }

    // ── 1. Generic graph ────────────────────────────────────────────────────
    detectGenericGraph(passKeys, passVars, consumedKeys, pointerContext, visualizers);

    // ── 2 & 3. Tries and Trees ──────────────────────────────────────────────
    detectTrees(passKeys, passVars, consumedKeys, pointerContext, visualizers);

    // ── 5, 6 & 7. Linked Lists, Stacks, Queues ──────────────────────────────
    detectLinearStructures(passKeys, passVars, consumedKeys, pointerContext, visualizers);

    // ── 4, 8-13. Matrices, Arrays, Strings, Bitsets, Fallbacks ─────
    detectArraysAndMaps(
      passKeys,
      passVars,
      currentEvent,
      consumedKeys,
      pointerContext,
      visualizers,
    );
  };

  // Run first pass on top-level variables
  runPass(keys, vars);

  // ── 14. Second Pass for Class/Struct Fields ─────────────────────────────
  // If a top-level object wasn't consumed (like an LRUCache instance),
  // extract its fields as virtual variables and run the detectors again.
  const secondPassVars: VarMap = { ...vars };
  const secondPassKeys: string[] = [];

  for (const name of keys) {
    if (consumedKeys.has(name)) continue;
    const val = deepUnwrap(vars[name]?.value);

    if (
      val &&
      typeof val === "object" &&
      !Array.isArray(val) &&
      val.__type !== "map" &&
      val.__type !== "set"
    ) {
      // It's a plain struct/class. Extract its properties.
      for (const [key, propValue] of Object.entries(val)) {
        if (key.startsWith("__")) continue; // ignore internal properties
        const virtualName = `${name}.${key}`;
        secondPassVars[virtualName] = {
          type: typeof propValue === "object" ? "object" : typeof propValue,
          value: propValue,
          name: virtualName,
        } as any;
        secondPassKeys.push(virtualName);
      }
    }
  }

  if (secondPassKeys.length > 0) {
    runPass(secondPassKeys, secondPassVars);
  }

  return visualizers;
}
