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

  // ── 0. Adjacency-list graph ─────────────────────────────────────────────
  for (const name of keys) {
    if (consumedKeys.has(name)) continue;
    const type = vars[name]?.type ?? "";
    const val = deepUnwrap(vars[name]?.value);

    if (type.includes("vector") && (name.includes("adj") || name.includes("graph"))) {
      const graphState = tryDetectAdjacencyGraph(
        name,
        val,
        type,
        currentEvent,
        vars,
        keys,
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
  detectGenericGraph(keys, vars, consumedKeys, pointerContext, visualizers);

  // ── 2 & 3. Tries and Trees ──────────────────────────────────────────────
  detectTrees(keys, vars, consumedKeys, pointerContext, visualizers);

  // ── 5, 6 & 7. Linked Lists, Stacks, Queues ──────────────────────────────
  detectLinearStructures(keys, vars, consumedKeys, pointerContext, visualizers);

  // ── 4, 8-13. Matrices, Arrays, Strings, Bitsets, Fallbacks ─────
  detectArraysAndMaps(keys, vars, currentEvent, consumedKeys, pointerContext, visualizers);

  return visualizers;
}
