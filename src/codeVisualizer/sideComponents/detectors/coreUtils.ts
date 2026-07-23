export type VisualizerType =
  | "graph"
  | "matrix"
  | "array"
  | "linkedlist"
  | "queue"
  | "stack"
  | "tree"
  | "trie"
  | "map"
  | "set"
  | "string"
  | "bitset"
  | "none"
  | "sortbars";

export interface CanvasState {
  id: string;
  type: VisualizerType;
  props: Record<string, any>;
  usedKeys: string[];
}

export interface VarEntry {
  name: string;
  type: string;
  value: any;
}

export type VarMap = Record<string, VarEntry>;

// ─── DEEP UNWRAP ────────────────────────────────────────────────────────────
export function deepUnwrap(val: any): any {
  if (val === null || val === undefined) return val;

  if (typeof val === "object" && !Array.isArray(val) && "__ref" in val && "__resolved" in val) {
    return deepUnwrap(val.__resolved);
  }

  // Unwrap MockContainer → its .data array
  if (typeof val === "object" && !Array.isArray(val) && "data" in val && Array.isArray(val.data)) {
    return deepUnwrap(val.data);
  }

  // Recursively unwrap array elements
  if (Array.isArray(val)) {
    return val.map(deepUnwrap);
  }

  return val;
}

// ─── SHAPE VALIDATORS ───────────────────────────────────────────────────────
export function isFlatArray(val: any): val is (number | string | boolean)[] {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.every((v) => typeof v === "number" || typeof v === "string" || typeof v === "boolean");
}

export function is2DArray(val: any): val is any[][] {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.some((row) => Array.isArray(row) || typeof row === "string");
}

export function matchesPrefix(name: string, prefixes: string[]): boolean {
  const lower = name.toLowerCase();
  return prefixes.some((p) => lower.startsWith(p));
}

export const extractEventIndices = (currentEvent: any, targetName: string, is2D = false) => {
  const reads: any[] = [];
  const writes: any[] = [];

  if (currentEvent?.payload?.variable) {
    const varName = String(currentEvent.payload.variable);

    if (!is2D) {
      const match = varName.match(new RegExp(`^${targetName}\\[(\\d+)\\]$`));
      if (match) {
        const idx = parseInt(match[1], 10);
        if (currentEvent.type === "READ") reads.push(idx);
        if (currentEvent.type === "ASSIGNMENT" || currentEvent.type === "ASSIGN") writes.push(idx);
      }
    } else {
      const match = varName.match(new RegExp(`^${targetName}\\[(\\d+)\\]\\[(\\d+)\\]$`));
      if (match) {
        const r = parseInt(match[1], 10);
        const c = parseInt(match[2], 10);
        if (currentEvent.type === "READ") reads.push({ row: r, col: c });
        if (currentEvent.type === "ASSIGNMENT" || currentEvent.type === "ASSIGN")
          writes.push({ row: r, col: c });
      }
    }
  }
  return { reads, writes };
};
