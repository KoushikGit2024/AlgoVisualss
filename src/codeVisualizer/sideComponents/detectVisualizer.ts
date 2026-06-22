/**
 * detectVisualizer.ts
 * 
 * Pure, testable detection engine that scans the runtime variable scope
 * and determines which React data-structure components to mount.
 * 
 * Detection uses a two-phase approach:
 *   1. PREFIX match — variable name starts with a known trigger prefix
 *   2. SHAPE validation — the runtime value must actually be the right data shape
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

export type VisualizerType = 'graph' | 'matrix' | 'array' | 'linkedlist' | 'queue' | 'stack' | 'tree' | 'map' | 'none';

export interface CanvasState {
  id: string;
  type: VisualizerType;
  props: Record<string, any>;
  usedKeys: string[];
}

interface VarEntry {
  name: string;
  type: string;
  value: any;
}

type VarMap = Record<string, VarEntry>;

// ─── DEEP UNWRAP ────────────────────────────────────────────────────────────

export function deepUnwrap(val: any): any {
  if (val === null || val === undefined) return val;

  if (typeof val === 'object' && !Array.isArray(val) && '__ref' in val && '__resolved' in val) {
    return deepUnwrap(val.__resolved);
  }

  // Unwrap MockContainer → its .data array
  if (typeof val === 'object' && !Array.isArray(val) && 'data' in val && Array.isArray(val.data)) {
    return deepUnwrap(val.data);
  }

  // Recursively unwrap array elements
  if (Array.isArray(val)) {
    return val.map(deepUnwrap);
  }

  return val;
}

// ─── SHAPE VALIDATORS ───────────────────────────────────────────────────────

function isFlatArray(val: any): val is (number | string)[] {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.every(v => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean');
}

function is2DArray(val: any): val is any[][] {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.some(row => Array.isArray(row));
}

function isNodeArray(val: any): boolean {
  if (!Array.isArray(val) || val.length === 0) return false;
  // Case 1: Named object nodes — {id, value, left?, right?}
  if (val.every((v: any) => typeof v === 'object' && v !== null && !Array.isArray(v) && 'id' in v && 'value' in v)) {
    return true;
  }
  // Case 2: Array-as-struct nodes — [id, value, left, right]
  // Each element is a 3-4 element numeric array (struct stored as positional tuple)
  if (val.every((v: any) => Array.isArray(v) && v.length >= 3 && v.length <= 5 && v.every((x: any) => typeof x === 'number'))) {
    return true;
  }
  return false;
}

/**
 * Normalizes an array of tree nodes from either format into named-object form.
 * - If nodes are already objects with `id`/`value`, returns as-is.
 * - If nodes are positional arrays `[id, value, left, right]`, converts them.
 */
function normalizeNodeArray(val: any[]): any[] {
  if (val.length === 0) return val;
  // Convert [id, value, left, right] → {id, value, left, right}
  return val.map((v: any) => {
    if (Array.isArray(v) && v.length >= 3) {
      const leftVal = v[2] !== undefined ? v[2] : -1;
      const rightVal = v[3] !== undefined ? v[3] : -1;
      return { 
        id: String(v[0]), 
        value: v[1], 
        left: leftVal !== -1 ? String(leftVal) : null, 
        right: rightVal !== -1 ? String(rightVal) : null 
      };
    }
    // Also ensure named objects are stringified
    if (typeof v === 'object' && v !== null && 'id' in v) {
      const leftVal = v.left;
      const rightVal = v.right;
      return {
        ...v,
        id: String(v.id),
        left: (leftVal !== undefined && leftVal !== -1 && leftVal !== "-1") ? String(leftVal) : null,
        right: (rightVal !== undefined && rightVal !== -1 && rightVal !== "-1") ? String(rightVal) : null
      };
    }
    return v;
  });
}

// ─── PREFIX MATCHERS ────────────────────────────────────────────────────────

const GRAPH_PREFIXES   = ['adj', 'graph'];
const TREE_PREFIXES    = ['tree_', 'bst_', 'trie_'];
const MATRIX_PREFIXES  = ['mat', 'grid', 'board', 'dp'];
const LL_PREFIXES      = ['ll_'];
const STACK_PREFIXES   = ['st_', 'stack'];
const QUEUE_PREFIXES   = ['q_', 'queue', 'deque'];
const ARRAY_PREFIXES   = ['arr', 'vec', 'nums', 'seq'];
const MAP_PREFIXES     = ['map', 'dict', 'freq'];

function matchesPrefix(name: string, prefixes: string[]): boolean {
  const lower = name.toLowerCase();
  return prefixes.some(p => lower.startsWith(p));
}

// ─── POINTER COLLECTORS ─────────────────────────────────────────────────────

function collectGraphPointers(keys: string[], vars: VarMap): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointerPatterns = ['node', 'curr', 'u', 'v'];
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isMatch = pointerPatterns.some(p => 
      lower === p || lower.startsWith(`ptr_${p}`) || lower.startsWith(`${p}_`) || lower.endsWith(`_${p}`)
    );

    if (isMatch) {
      const val = vars[key]?.value;
      if (typeof val === 'number' || typeof val === 'string') {
        pointers.push({ name: key, nodeId: String(val) });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}

function collectIndexPointers(keys: string[], vars: VarMap, patterns: string[]): { pointers: { name: string; index: number }[]; usedKeys: string[] } {
  const pointers: { name: string; index: number }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isMatch = patterns.some(p => 
      lower === p || lower.startsWith(`ptr_${p}`) || lower.startsWith(`${p}_`) || lower.endsWith(`_${p}`)
    );

    if (isMatch) {
      const val = vars[key]?.value;
      if (typeof val === 'number') {
        pointers.push({ name: key, index: val });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}

function collectNodePointers(keys: string[], vars: VarMap, patterns: string[]): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isMatch = patterns.some(p => 
      lower === p || lower.endsWith(`_${p}`) || lower.startsWith(`ptr_${p}`)
    );

    if (isMatch) {
      const val = vars[key]?.value;
      if (val !== undefined && val !== null) {
        pointers.push({ name: key, nodeId: String(val) });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}

// ─── MAIN DETECTOR ──────────────────────────────────────────────────────────

export function detectVisualizer(vars: VarMap): CanvasState[] {
  const keys = Object.keys(vars);
  const states: CanvasState[] = [];
  const consumedKeys = new Set<string>();

  // 1. GRAPH DETECTION
  keys.filter(k => matchesPrefix(k, GRAPH_PREFIXES)).forEach(graphKey => {
    if (consumedKeys.has(graphKey)) return;

    const isEdgeList = graphKey.toLowerCase().includes('edge');
    let rawVal = deepUnwrap(vars[graphKey]?.value);
    
    let edgeKey = keys.find(k => k !== graphKey && k.toLowerCase().includes('edge') && !consumedKeys.has(k));
    
    // If graphKey itself is the edge list, treat it as such and calculate nodes from edges
    if (isEdgeList) {
      edgeKey = graphKey;
      rawVal = []; 
    }

    if (is2DArray(rawVal) || (Array.isArray(rawVal) && rawVal.length > 0) || isEdgeList) {
      const rawEdges = edgeKey ? deepUnwrap(vars[edgeKey]?.value) || [] : [];
      let n = Array.isArray(rawVal) ? rawVal.length : 0;

      if (n === 0 && Array.isArray(rawEdges) && rawEdges.length > 0) {
        let maxNode = -1;
        rawEdges.forEach((e: any) => {
          if (Array.isArray(e)) {
            if (e[0] > maxNode) maxNode = e[0];
            if (e[1] > maxNode) maxNode = e[1];
          }
        });
        n = maxNode + 1;
      }

      if (n > 0) {
        const visitedKey = keys.find(k => k.toLowerCase().includes('visit') && !consumedKeys.has(k));
        const visited = visitedKey ? deepUnwrap(vars[visitedKey]?.value) || [] : [];
        const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars);
        
        const usedKeys = [!isEdgeList ? graphKey : null, edgeKey, visitedKey, ...ptrKeys].filter(Boolean) as string[];
        usedKeys.forEach(k => consumedKeys.add(k));

        const nodes = Array.from({ length: n }).map((_, i) => {
          const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
          const radius = n <= 3 ? 28 : n <= 6 ? 33 : 38;
          return { id: String(i), label: String(i), x: 50 + radius * Math.cos(angle), y: 50 + radius * Math.sin(angle) };
        });

        const edges = Array.isArray(rawEdges) ? rawEdges.filter((e: any) => Array.isArray(e) && e.length >= 2).map((e: any[]) => ({ id: `${e[0]}-${e[1]}`, source: String(e[0]), target: String(e[1]) })) : [];

        states.push({
          id: !isEdgeList ? graphKey : (edgeKey as string), type: 'graph', usedKeys,
          props: {
            nodes, edges, pointers,
            highLightNodes: Array.isArray(visited) ? visited.map((v: number, i: number) => v === 1 ? String(i) : null).filter(Boolean) : []
          }
        });
      }
    }
  });

  // 2. TREE DETECTION
  keys.filter(k => matchesPrefix(k, TREE_PREFIXES)).forEach(treeKey => {
    if (consumedKeys.has(treeKey)) return;
    const treeData = deepUnwrap(vars[treeKey]?.value);
    if (isNodeArray(treeData)) {
      const normalizedNodes = normalizeNodeArray(treeData);
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(keys, vars, ['root', 'curr', 'parent', 'left', 'right', 'temp']);
      const usedKeys = [treeKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      states.push({ id: treeKey, type: 'tree', usedKeys, props: { nodes: normalizedNodes, pointers } });
    }
  });

  // 3. MATRIX DETECTION
  keys.filter(k => matchesPrefix(k, MATRIX_PREFIXES)).forEach(matrixKey => {
    if (consumedKeys.has(matrixKey)) return;
    const rawGrid = deepUnwrap(vars[matrixKey]?.value);
    if (is2DArray(rawGrid)) {
      const pointers: { name: string; row: number; col: number }[] = [];
      const usedKeys = [matrixKey];
      const rowKey = keys.find(k => !consumedKeys.has(k) && (k.toLowerCase() === 'r' || k.toLowerCase().includes('row') || k.toLowerCase().endsWith('_r') || k.toLowerCase().startsWith('r_')));
      const colKey = keys.find(k => !consumedKeys.has(k) && (k.toLowerCase() === 'c' || k.toLowerCase().includes('col') || k.toLowerCase().endsWith('_c') || k.toLowerCase().startsWith('c_')));

      if (rowKey && colKey && typeof vars[rowKey]?.value === 'number' && typeof vars[colKey]?.value === 'number') {
        pointers.push({ name: `${rowKey},${colKey}`, row: vars[rowKey].value, col: vars[colKey].value });
        usedKeys.push(rowKey, colKey);
      }
      usedKeys.forEach(k => consumedKeys.add(k));
      states.push({ id: matrixKey, type: 'matrix', usedKeys, props: { value: rawGrid, pointers } });
    }
  });

  // 4. LINKED LIST DETECTION
  keys.filter(k => matchesPrefix(k, LL_PREFIXES) || k === 'head').forEach(llKey => {
    if (consumedKeys.has(llKey)) return;
    const llData = deepUnwrap(vars[llKey]?.value);
    if (isNodeArray(llData)) {
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(keys, vars, ['head', 'tail', 'curr', 'prev', 'next', 'slow', 'fast']);
      const usedKeys = [llKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      states.push({ id: llKey, type: 'linkedlist', usedKeys, props: { nodes: llData, pointers } });
    }
  });

  // 5. STACK DETECTION
  keys.filter(k => matchesPrefix(k, STACK_PREFIXES)).forEach(stackKey => {
    if (consumedKeys.has(stackKey)) return;
    const stackVal = deepUnwrap(vars[stackKey]?.value);
    if (isFlatArray(stackVal)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(keys, vars, ['top', 'peek', 'curr']);
      const usedKeys = [stackKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      states.push({ id: stackKey, type: 'stack', usedKeys, props: { value: stackVal, pointers } });
    }
  });

  // 6. QUEUE DETECTION
  keys.filter(k => matchesPrefix(k, QUEUE_PREFIXES)).forEach(queueKey => {
    if (consumedKeys.has(queueKey)) return;
    const queueVal = deepUnwrap(vars[queueKey]?.value);
    if (isFlatArray(queueVal)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(keys, vars, ['front', 'back', 'rear', 'head', 'tail', 'curr']);
      const usedKeys = [queueKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      states.push({ id: queueKey, type: 'queue', usedKeys, props: { value: queueVal, pointers } });
    }
  });

  // 7. 1D ARRAY DETECTION
  keys.filter(k => matchesPrefix(k, ARRAY_PREFIXES)).forEach(arrayKey => {
    if (consumedKeys.has(arrayKey)) return;
    const arrayVal = deepUnwrap(vars[arrayKey]?.value);
    if (isFlatArray(arrayVal)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']);
      const usedKeys = [arrayKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      states.push({ id: arrayKey, type: 'array', usedKeys, props: { value: arrayVal, pointers } });
    }
  });

  // 8. MAP DETECTION
  keys.filter(k => matchesPrefix(k, MAP_PREFIXES)).forEach(mapKey => {
    if (consumedKeys.has(mapKey)) return;
    const mapVal = deepUnwrap(vars[mapKey]?.value);
    if (mapVal && typeof mapVal === 'object' && mapVal.__type === 'map' && Array.isArray(mapVal.entries)) {
      consumedKeys.add(mapKey);
      states.push({ id: mapKey, type: 'map', usedKeys: [mapKey], props: { entries: mapVal.entries } });
    }
  });

  return states;
}
