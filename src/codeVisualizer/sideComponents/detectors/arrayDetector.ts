import {
  type CanvasState,
  type VarMap,
  deepUnwrap,
  isFlatArray,
  is2DArray,
  extractEventIndices,
} from "./coreUtils";
import { collectIndexPointers } from "./pointerCollector";

export function detectArraysAndMaps(
  keys: string[],
  vars: VarMap,
  currentEvent: any,
  consumedKeys: Set<string>,
  pointerContext: Record<string, string[]>,
  visualizers: CanvasState[],
) {
  keys.forEach((key) => {
    if (consumedKeys.has(key)) return;
    const val = deepUnwrap(vars[key]?.value);

    // Ignore null/undefined
    if (val === null || val === undefined) return;

    // We completely ignore primitives
    if (typeof val === "number" || typeof val === "boolean" || typeof val === "function") return;

    // ── 1. MAP ─────────────────────────────────────────────────────────
    if (typeof val === "object" && val.__type === "map" && Array.isArray(val.entries)) {
      consumedKeys.add(key);
      visualizers.push({
        id: key,
        type: "map",
        usedKeys: [key],
        props: { entries: val.entries },
      });
      return;
    }

    // ── 2. SET ─────────────────────────────────────────────────────────
    if (typeof val === "object" && val.__type === "set" && Array.isArray(val.values)) {
      consumedKeys.add(key);
      visualizers.push({
        id: key,
        type: "set",
        usedKeys: [key],
        props: { values: val.values },
      });
      return;
    }

    // ── 3. STRING ───────────────────────────────────────────────────────
    if (typeof val === "string") {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
        keys,
        vars,
        key,
        pointerContext,
        ["i", "j", "k", "left", "right", "mid", "curr", "ptr"],
      );
      const usedKeys = [key, ...ptrKeys];
      const { reads, writes } = extractEventIndices(currentEvent, key, false);
      usedKeys.forEach((k) => consumedKeys.add(k));
      visualizers.push({
        id: key,
        type: "string",
        usedKeys,
        props: { value: val, pointers, readIndices: reads, writeIndices: writes },
      });
      return;
    }

    // ── 4. MATRIX (2D Array) ────────────────────────────────────────────
    if (is2DArray(val)) {
      const pointers: { name: string; row: number; col: number }[] = [];
      const usedKeys = [key];

      const potentialRowKeys = keys.filter(
        (k) =>
          !consumedKeys.has(k) &&
          (k.toLowerCase() === "r" ||
            k.toLowerCase() === "i" ||
            k.toLowerCase().includes("row") ||
            k.toLowerCase().endsWith("_r") ||
            k.toLowerCase().startsWith("r_")),
      );
      const potentialColKeys = keys.filter(
        (k) =>
          !consumedKeys.has(k) &&
          (k.toLowerCase() === "c" ||
            k.toLowerCase() === "j" ||
            k.toLowerCase().includes("col") ||
            k.toLowerCase().endsWith("_c") ||
            k.toLowerCase().startsWith("c_")),
      );

      let foundPair = false;
      for (const rKey of potentialRowKeys) {
        for (const cKey of potentialColKeys) {
          if (rKey === cKey) continue;

          // Verify context logic: either explicit, or in pointerContext, or fallback
          const rContext = pointerContext[rKey]?.includes(key);
          const cContext = pointerContext[cKey]?.includes(key);

          const rBoundElsewhere =
            pointerContext[rKey] && !rContext && pointerContext[rKey].length > 0;
          const cBoundElsewhere =
            pointerContext[cKey] && !cContext && pointerContext[cKey].length > 0;

          if (rBoundElsewhere || cBoundElsewhere) continue;

          const rVal = vars[rKey]?.value;
          const cVal = vars[cKey]?.value;
          if (typeof rVal !== "number" || typeof cVal !== "number") continue;

          const numRows = val.length;
          const firstRow: any = val[0];
          const numCols = Array.isArray(firstRow)
            ? firstRow.length
            : typeof firstRow === "string"
              ? firstRow.length
              : 0;

          if (rVal >= 0 && rVal < numRows && cVal >= 0 && cVal < numCols) {
            pointers.push({ name: `${rKey},${cKey}`, row: rVal, col: cVal });
            usedKeys.push(rKey, cKey);
            foundPair = true;
            break;
          }
        }
        if (foundPair) break;
      }

      const { reads, writes } = extractEventIndices(currentEvent, key, true);
      usedKeys.forEach((k) => consumedKeys.add(k));
      visualizers.push({
        id: key,
        type: "matrix",
        usedKeys,
        props: { value: val, pointers, readIndices: reads, writeIndices: writes },
      });
      return;
    }

    // ── 5. BITSET ───────────────────────────────────────────────────────
    if (
      isFlatArray(val) &&
      (val as any[]).every((v) => typeof v === "boolean" || v === 0 || v === 1)
    ) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
        keys,
        vars,
        key,
        pointerContext,
        ["i", "j", "k", "left", "right", "mid", "curr", "ptr"],
      );
      const usedKeys = [key, ...ptrKeys];
      const { reads, writes } = extractEventIndices(currentEvent, key, false);
      usedKeys.forEach((k) => consumedKeys.add(k));
      visualizers.push({
        id: key,
        type: "array",
        usedKeys,
        props: { value: val, pointers, readIndices: reads, writeIndices: writes },
      });
      return;
    }

    // ── 6. 1D ARRAY (or generic container) ──────────────────────────────
    if (Array.isArray(val) || val.__type === "container") {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
        keys,
        vars,
        key,
        pointerContext,
        ["i", "j", "k", "left", "right", "mid", "curr", "ptr"],
      );
      const usedKeys = [key, ...ptrKeys];
      const { reads, writes } = extractEventIndices(currentEvent, key, false);
      usedKeys.forEach((k) => consumedKeys.add(k));

      let arrayType: any = "array";
      if (
        typeof window !== "undefined" &&
        window.location.href.includes("/algorithms/sorting") &&
        key === "arr"
      ) {
        arrayType = "sortbars";
      }

      visualizers.push({
        id: key,
        type: arrayType,
        usedKeys,
        props: { value: val, pointers, readIndices: reads, writeIndices: writes },
      });
      return;
    }
  });
}
