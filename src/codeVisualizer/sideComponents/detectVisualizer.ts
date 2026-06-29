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

export type VisualizerType = 'graph' | 'matrix' | 'array' | 'linkedlist' | 'queue' | 'stack' | 'tree' | 'map' | 'string' | 'bitset' | 'scalar' | 'none';

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
  return val.some(row => Array.isArray(row) || typeof row === 'string');
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

/**
 * Traverses a pointer-based linked list and flattens it into an array of nodes.
 */
function unrollPointerLinkedList(headNode: any): { nodes: any[], cycleTo?: string } {
  if (!headNode || typeof headNode !== 'object' || Array.isArray(headNode)) return { nodes: [] };
  if (!('value' in headNode) && !('val' in headNode)) return { nodes: [] };

  const nodes = [];
  let curr = headNode;
  let id = 0;
  const refToNodeId = new Map<string, string>();
  let cycleTo: string | undefined = undefined;
  
  while (curr && typeof curr === 'object') {
    if (curr.__circular_ref !== undefined) {
      cycleTo = refToNodeId.get(curr.__circular_ref);
      break;
    }
    
    if (curr.__original_ref_id !== undefined) {
      refToNodeId.set(curr.__original_ref_id, String(id));
    }
    
    nodes.push({
      id: String(id),
      value: curr.value !== undefined ? curr.value : curr.val,
      __raw: curr
    });
    
    curr = curr.next;
    id++;
  }
  return { nodes, cycleTo };
}

/**
 * Traverses a pointer-based binary tree and flattens it into an array of nodes.
 */
function unrollPointerTree(rootNode: any): any[] {
  if (!rootNode || typeof rootNode !== 'object' || Array.isArray(rootNode)) return [];
  if (!('value' in rootNode) && !('val' in rootNode)) return [];

  const nodes: any[] = [];
  let idCounter = 0;
  const seen = new Set();

  function traverse(node: any): string | null {
    if (!node || typeof node !== 'object') return null;
    if (seen.has(node)) return null;
    seen.add(node);

    const currentId = String(idCounter++);
    const leftId = traverse(node.left);
    const rightId = traverse(node.right);

    nodes.push({
      id: currentId,
      value: node.value !== undefined ? node.value : node.val,
      left: leftId,
      right: rightId,
      __raw: node
    });

    return currentId;
  }

  traverse(rootNode);
  return nodes;
}

// ─── PREFIX MATCHERS ────────────────────────────────────────────────────────

const GRAPH_PREFIXES   = ['adj', 'graph', 'network'];
const TREE_PREFIXES    = ['tree_', 'bst_', 'trie_', 'root_', 'heap_', 'forest_'];
const MATRIX_PREFIXES  = ['mat', 'grid', 'board', 'dp', 'table', 'matrix', 'vec2d', 'array2d', 'grid2d', 'matrix2d', 'table2d', 'res'];
const STACK_PREFIXES   = ['st_', 'stack', 'stk'];
const QUEUE_PREFIXES   = ['q_', 'queue', 'deque', 'buffer_q'];
const ARRAY_PREFIXES   = ['arr', 'vec', 'nums', 'seq', 'list', 'buffer', 'cache', 'res', 'array', 'tuple', 'valarray', 'collection', 'items', 'elements'];
const MAP_PREFIXES     = ['map', 'dict', 'freq', 'count', 'hash', 'cache_map', 'memo', 'set', 'seen', 'visited'];
const STRING_PREFIXES  = ['str', 'text', 'word', 'chars', 'msg', 'string', 'sentence', 'paragraph', 'pattern', 'substring', 'sub'];
const BITSET_PREFIXES  = ['mask', 'bits', 'flags', 'bitset', 'state_mask', 'b'];
const SCALAR_PREFIXES  = ['ans', 'sum', 'count', 'total', 'result', 'max_val', 'min_val', 'cnt', 'res_val', 'diff'];

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

function collectNodePointers(keys: string[], vars: VarMap, patterns: string[], nodeArray?: any[]): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isNameMatch = patterns.length === 0 || patterns.some(p => 
      lower === p || lower.endsWith(`_${p}`) || lower.startsWith(`ptr_${p}`)
    );

    let val = vars[key]?.value;
    if (val !== undefined && val !== null) {
      val = deepUnwrap(val);
      
      if (typeof val === 'object' && nodeArray) {
        const targetRefId = val.__circular_ref !== undefined ? val.__circular_ref : val.__original_ref_id;
        
        let match;
        if (targetRefId !== undefined) {
          match = nodeArray.find(n => n.__raw && n.__raw.__original_ref_id === targetRefId);
        } else {
          // Fallback for non-ref structures
          const valStr = JSON.stringify(val);
          match = nodeArray.find(n => JSON.stringify(n.__raw) === valStr);
        }
        
        if (match) {
          pointers.push({ name: key, nodeId: String(match.id) });
          usedKeys.push(key);
          continue;
        }
      }
      
      if (isNameMatch) {
        pointers.push({ name: key, nodeId: String(val) });
        usedKeys.push(key);
      }
    }
  }
  return { pointers, usedKeys };
}

// ─── MAIN DETECTOR ──────────────────────────────────────────────────────────

interface GraphNode {
  id: string;
  label?: string | number;
  x: number;
  y: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: string | number;
  isDirected?: boolean;
}

function tryDetectAdjacencyGraph(
  name: string,
  data: any,
  type: string,
  currentEvent: any,
  vars: VarMap,
  keys: string[],
  consumedKeys: Set<string>
): CanvasState | null {
  const isAdjList =
    (name.includes('_adj') || name.includes('adj_') || name.includes('graph')) &&
    type.includes('vector') &&
    Array.isArray(data);

  if (!isAdjList) return null;

  // data is the unwrapped outer array: data[i] is either 0 (uninitialized) or an array of neighbors
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();

  data.forEach((neighbors: any, i: number) => {
    nodes.push({ id: String(i), label: i, x: 50, y: 50 });

    if (!Array.isArray(neighbors)) return; // not yet initialized

    neighbors.forEach((j: number) => {
      // Treat every entry in the adjacency list as a directed edge
      const key = `${i}-${j}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        edges.push({
          id: key,
          source: String(i),
          target: String(j),
          isDirected: true,
        });
      }
    });
  });

  if (nodes.length === 0) return null;

  // Highlight the currently active node from BFS (look for "current" variable)
  let activeNodes: string[] = [];
  const readNodes: string[] = [];
  const highLightEdges: string[] = [];
  const readEdges: string[] = [];

  if (currentEvent?.payload?.variable === 'current') {
    const cur = currentEvent.payload.value;
    if (cur !== undefined) readNodes.push(String(cur));
  } else if (vars['current']) {
    const cur = vars['current'].value;
    if (cur !== undefined) readNodes.push(String(cur));
  }

  // Extract visited array for node highlighting
  const visitedKey = keys.find(k => k.toLowerCase().includes('visit') && !consumedKeys.has(k));
  if (visitedKey) {
    const visited = deepUnwrap(vars[visitedKey]?.value) || [];
    if (Array.isArray(visited)) {
      activeNodes = visited.map((v: number, i: number) => v === 1 ? String(i) : null).filter(Boolean) as string[];
    }
  }

  // Extract parent array for edge highlighting
  const parentKey = keys.find(k => k.toLowerCase().includes('parent') && !consumedKeys.has(k));
  if (parentKey) {
    const parent = deepUnwrap(vars[parentKey]?.value) || [];
    if (Array.isArray(parent)) {
      parent.forEach((p: number, i: number) => {
        if (p !== -1 && p !== undefined && p !== null) {
          highLightEdges.push(`${p}-${i}`);
        }
      });
    }
  }

  // Read current exploring edge
  if (vars['current'] && vars['v']) {
    const cur = vars['current'].value;
    const nbr = vars['v'].value;
    if (cur !== undefined && nbr !== undefined) {
      readEdges.push(`${cur}-${nbr}`);
    }
  }

  // Extract pointer badges
  const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars);

  const usedKeys = [name, 'current', 'v', visitedKey, parentKey, ...ptrKeys].filter(k => k && vars[k as string]) as string[];

  return {
    id: name,
    type: 'graph',
    usedKeys,
    props: {
      nodes,
      edges,
      pointers,
      highLightNodes: activeNodes,
      readNodes,
      highLightEdges,
      readEdges,
    }
  };
}

export function detectVisualizer(vars: VarMap, currentEvent?: any): CanvasState[] {
  const visualizers: CanvasState[] = [];
  const consumedKeys = new Set<string>();

  // Helper to extract read/write for arrays and matrices
  const extractEventIndices = (targetName: string, is2D: boolean = false) => {
    const reads: any[] = [];
    const writes: any[] = [];
    
    if (currentEvent && currentEvent.payload?.variable) {
      const varName = String(currentEvent.payload.variable);
      
      if (!is2D) {
        // Match 1D array: "arr[2]"
        const match = varName.match(new RegExp(`^${targetName}\\[(\\d+)\\]$`));
        if (match) {
          const idx = parseInt(match[1], 10);
          if (currentEvent.type === 'READ') reads.push(idx);
          if (currentEvent.type === 'ASSIGNMENT' || currentEvent.type === 'ASSIGN') writes.push(idx);
        }
      } else {
        // Match 2D array: "matrix[1][2]"
        const match = varName.match(new RegExp(`^${targetName}\\[(\\d+)\\]\\[(\\d+)\\]$`));
        if (match) {
          const r = parseInt(match[1], 10);
          const c = parseInt(match[2], 10);
          if (currentEvent.type === 'READ') reads.push({ row: r, col: c });
          if (currentEvent.type === 'ASSIGNMENT' || currentEvent.type === 'ASSIGN') writes.push({ row: r, col: c });
        }
      }
    }
    return { reads, writes };
  };

  const keys = Object.keys(vars);

  // 0. ADJACENCY LIST GRAPH DETECTION
  for (const name of keys) {
    if (consumedKeys.has(name)) continue;
    const type = vars[name]?.type ?? '';
    const val = deepUnwrap(vars[name]?.value);

    if (
      type.includes('vector') &&
      type.includes('vector') && // vector<vector<...>>
      (name.includes('adj') || name.includes('graph'))
    ) {
      const graphState = tryDetectAdjacencyGraph(name, val, type, currentEvent, vars, keys, consumedKeys);
      if (graphState) {
        // Mark the keys used by this graph as consumed
        graphState.usedKeys.forEach(k => consumedKeys.add(k));
        visualizers.push(graphState);
      }
    }
  }

  // 1. GRAPH DETECTION
  keys.filter(k => matchesPrefix(k, GRAPH_PREFIXES)).forEach(graphKey => {
    if (consumedKeys.has(graphKey)) return;

    const isEdgeList = graphKey.toLowerCase().includes('edge');
    let rawVal = deepUnwrap(vars[graphKey]?.value);
    
    let edgeKey = keys.find(k => k !== graphKey && k.toLowerCase().includes('edge') && !consumedKeys.has(k));
    
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

        visualizers.push({
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
    let treeData = deepUnwrap(vars[treeKey]?.value);
    
    if (treeData && typeof treeData === 'object' && !Array.isArray(treeData) && ('value' in treeData || 'val' in treeData) && ('left' in treeData || 'right' in treeData)) {
      treeData = unrollPointerTree(treeData);
    }
    
    if (isNodeArray(treeData)) {
      const normalizedNodes = normalizeNodeArray(treeData);
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(keys, vars, ['root', 'curr', 'parent', 'left', 'right', 'temp'], normalizedNodes);
      const usedKeys = [treeKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: treeKey, type: 'tree', usedKeys, props: { nodes: normalizedNodes, pointers } });
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
      const { reads, writes } = extractEventIndices(matrixKey, true);
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: matrixKey, type: 'matrix', usedKeys, props: { value: rawGrid, pointers, readIndices: reads, writeIndices: writes } });
    }
  });

  // 4. LINKED LIST DETECTION
  const candidateLists: any[] = [];
  
  keys.forEach(k => {
    if (consumedKeys.has(k)) return;
    const llData = deepUnwrap(vars[k]?.value);
    
    if (llData && typeof llData === 'object' && !Array.isArray(llData) && ('value' in llData || 'val' in llData) && 'next' in llData) {
      const unrolled = unrollPointerLinkedList(llData);
      const isDoublyLinked = 'prev' in llData;
      if (isNodeArray(unrolled.nodes)) {
        candidateLists.push({
           key: k,
           nodes: unrolled.nodes,
           cycleTo: unrolled.cycleTo,
           isDoublyLinked
        });
      }
    }
  });

  // Filter out candidates whose nodes are entirely contained within another candidate's nodes
  const finalLists = candidateLists.filter(cand => {
     const candRefIds = new Set(cand.nodes.map((n: any) => n.__raw?.__original_ref_id).filter(Boolean));
     if (candRefIds.size === 0) return true; // Keep it if it has no IDs for some reason
     
     // Is there any OTHER candidate that contains ALL our nodes?
     const isSublist = candidateLists.some(other => {
        if (other === cand) return false;
        const otherRefIds = new Set(other.nodes.map((n: any) => n.__raw?.__original_ref_id).filter(Boolean));
        
        const allContained = Array.from(candRefIds).every(id => otherRefIds.has(id as string));
        if (!allContained) return false;
        
        if (otherRefIds.size > candRefIds.size) return true;
        if (otherRefIds.size === candRefIds.size && other.key < cand.key) return true;
        
        return false;
     });
     
     return !isSublist;
  });

  finalLists.forEach(list => {
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(keys, vars, [], list.nodes);
      
      if (!ptrKeys.includes(list.key)) {
         pointers.unshift({ name: list.key, nodeId: list.nodes.length > 0 ? list.nodes[0].id : "0" });
         ptrKeys.push(list.key);
      }

      const usedKeys = [...new Set([list.key, ...ptrKeys])];
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: list.key, type: 'linkedlist', usedKeys, props: { nodes: list.nodes, pointers, cycleTo: list.cycleTo, isDoublyLinked: list.isDoublyLinked } });
  });

  // 5. STACK DETECTION
  keys.filter(k => matchesPrefix(k, STACK_PREFIXES)).forEach(stackKey => {
    if (consumedKeys.has(stackKey)) return;
    const stackVal = deepUnwrap(vars[stackKey]?.value);
    if (isFlatArray(stackVal)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(keys, vars, ['top', 'peek', 'curr']);
      const usedKeys = [stackKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: stackKey, type: 'stack', usedKeys, props: { value: stackVal, pointers } });
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
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: queueKey, type: 'queue', usedKeys, props: { value: queueVal, pointers } });
    }
  });

  // 7. 1D ARRAY DETECTION
  keys.filter(k => matchesPrefix(k, ARRAY_PREFIXES)).forEach(arrayKey => {
    if (consumedKeys.has(arrayKey)) return;
    const arrayVal = deepUnwrap(vars[arrayKey]?.value);
    if (isFlatArray(arrayVal)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']);
      const usedKeys = [arrayKey, ...ptrKeys];
      const { reads, writes } = extractEventIndices(arrayKey, false);
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: arrayKey, type: 'array', usedKeys, props: { value: arrayVal, pointers, readIndices: reads, writeIndices: writes } });
    }
  });

  // 8. MAP DETECTION
  keys.filter(k => matchesPrefix(k, MAP_PREFIXES)).forEach(mapKey => {
    if (consumedKeys.has(mapKey)) return;
    const mapVal = deepUnwrap(vars[mapKey]?.value);
    if (mapVal && typeof mapVal === 'object' && mapVal.__type === 'map' && Array.isArray(mapVal.entries)) {
      consumedKeys.add(mapKey);
      consumedKeys.add(mapKey);
      visualizers.push({ id: mapKey, type: 'map', usedKeys: [mapKey], props: { entries: mapVal.entries } });
    }
  });

  // 9. STRING DETECTION
  keys.filter(k => matchesPrefix(k, STRING_PREFIXES)).forEach(stringKey => {
    if (consumedKeys.has(stringKey)) return;
    const stringVal = deepUnwrap(vars[stringKey]?.value);
    
    // Check if it's an actual Javascript string or a 1D array of characters/numbers
    if (typeof stringVal === 'string' || isFlatArray(stringVal)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']);
      const usedKeys = [stringKey, ...ptrKeys];
      const { reads, writes } = extractEventIndices(stringKey, false);
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({ id: stringKey, type: 'string', usedKeys, props: { value: stringVal, pointers, readIndices: reads, writeIndices: writes } });
    }
  });

  // 10. BITSET DETECTION
  keys.filter(k => matchesPrefix(k, BITSET_PREFIXES)).forEach(bitKey => {
    if (consumedKeys.has(bitKey)) return;
    const bitVal = deepUnwrap(vars[bitKey]?.value);
    
    if (typeof bitVal === 'number' || (isFlatArray(bitVal) && bitVal.every(v => typeof v === 'boolean' || v === 0 || v === 1))) {
      consumedKeys.add(bitKey);
      consumedKeys.add(bitKey);
      visualizers.push({ id: bitKey, type: 'bitset', usedKeys: [bitKey], props: { value: bitVal } });
    }
  });

  // 11. SCALAR DETECTION
  keys.filter(k => matchesPrefix(k, SCALAR_PREFIXES)).forEach(scalarKey => {
    if (consumedKeys.has(scalarKey)) return;
    const scalarVal = deepUnwrap(vars[scalarKey]?.value);
    
    if (typeof scalarVal === 'number' || typeof scalarVal === 'string' || typeof scalarVal === 'boolean') {
      consumedKeys.add(scalarKey);
      consumedKeys.add(scalarKey);
      visualizers.push({ id: scalarKey, type: 'scalar', usedKeys: [scalarKey], props: { value: scalarVal, name: scalarKey } });
    }
  });

  // 12. AUTO-FALLBACK DETECTION
  // If a variable wasn't consumed by any prefix rules, try to render it based on its shape.
  // keys.forEach(key => {
  //   if (consumedKeys.has(key)) return;
  //   const rawVal = deepUnwrap(vars[key]?.value);
    
  //   if (is2DArray(rawVal)) {
  //     consumedKeys.add(key);
  //     visualizers.push({ id: key, type: 'matrix', usedKeys: [key], props: { value: rawVal, pointers: [], readIndices: [], writeIndices: [] } });
  //   } else if (isFlatArray(rawVal)) {
  //     consumedKeys.add(key);
  //     visualizers.push({ id: key, type: 'array', usedKeys: [key], props: { value: rawVal, pointers: [], readIndices: [], writeIndices: [] } });
  //   } else if (typeof rawVal === 'number' || typeof rawVal === 'string' || typeof rawVal === 'boolean') {
  //     consumedKeys.add(key);
  //     visualizers.push({ id: key, type: 'scalar', usedKeys: [key], props: { value: rawVal, name: key } });
  //   }
  // });

  return visualizers;
}
