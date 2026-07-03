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

export type VisualizerType =
  | 'graph' | 'matrix' | 'array' | 'linkedlist' | 'queue' | 'stack'
  | 'tree'  | 'trie'   | 'map'   | 'set' | 'string'     | 'bitset' | 'scalar'
  | 'none';

export interface CanvasState {
  id:       string;
  type:     VisualizerType;
  props:    Record<string, any>;
  usedKeys: string[];
}

interface VarEntry {
  name:  string;
  type:  string;
  value: any;
}

type VarMap = Record<string, VarEntry>;

// ─── DEEP UNWRAP ────────────────────────────────────────────────────────────

export function deepUnwrap(val: any): any {
  if (val === null || val === undefined) return val;

  if (
    typeof val === 'object' && !Array.isArray(val) &&
    '__ref' in val && '__resolved' in val
  ) {
    return deepUnwrap(val.__resolved);
  }

  // Unwrap MockContainer → its .data array
  if (
    typeof val === 'object' && !Array.isArray(val) &&
    'data' in val && Array.isArray(val.data)
  ) {
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
  return val.every(
    v => typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean'
  );
}

function is2DArray(val: any): val is any[][] {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.some(row => Array.isArray(row) || typeof row === 'string');
}

/** Returns true only for binary-tree node arrays (have id + value, no N-ary children array). */
function isBinaryNodeArray(val: any): boolean {
  if (!Array.isArray(val) || val.length === 0) return false;
  // Case 1: Named object nodes — {id, value, left?, right?}  (NO children array)
  if (
    val.every(
      (v: any) =>
        typeof v === 'object' && v !== null && !Array.isArray(v) &&
        'id' in v && 'value' in v &&
        !Array.isArray(v.children)
    )
  ) return true;
  // Case 2: Positional tuple nodes — [id, value, left, right]
  if (
    val.every(
      (v: any) =>
        Array.isArray(v) && v.length >= 3 && v.length <= 5 &&
        v.every((x: any) => typeof x === 'number')
    )
  ) return true;
  return false;
}

/** Returns true for trie node arrays (have id + value + children: string[]). */
function isTrieNodeArray(val: any): boolean {
  if (!Array.isArray(val) || val.length === 0) return false;
  return val.every(
    (v: any) =>
      typeof v === 'object' && v !== null && !Array.isArray(v) &&
      'id' in v && 'value' in v &&
      Array.isArray(v.children)
  );
}

/**
 * Normalizes an array of binary-tree nodes from either format into named-object form.
 */
function normalizeNodeArray(val: any[]): any[] {
  if (val.length === 0) return val;
  return val.map((v: any) => {
    if (Array.isArray(v) && v.length >= 3) {
      const leftVal  = v[2] !== undefined ? v[2] : -1;
      const rightVal = v[3] !== undefined ? v[3] : -1;
      return {
        id:    String(v[0]),
        value: v[1],
        left:  leftVal  !== -1 ? String(leftVal)  : null,
        right: rightVal !== -1 ? String(rightVal) : null,
      };
    }
    if (typeof v === 'object' && v !== null && 'id' in v) {
      return {
        ...v,
        id:    String(v.id),
        left:  v.left  != null && v.left  !== -1 && v.left  !== '-1' ? String(v.left)  : null,
        right: v.right != null && v.right !== -1 && v.right !== '-1' ? String(v.right) : null,
      };
    }
    return v;
  });
}

/**
 * Traverses a pointer-based linked list and flattens it into an array of nodes.
 */
function unrollPointerLinkedList(
  headNode: any
): { nodes: any[]; cycleTo?: string } {
  if (
    !headNode || typeof headNode !== 'object' || Array.isArray(headNode)
  ) return { nodes: [] };
  if (!('value' in headNode) && !('val' in headNode)) return { nodes: [] };

  const nodes: any[]                    = [];
  let   curr  = headNode;
  let   id    = 0;
  const refToNodeId = new Map<string, string>();
  let   cycleTo: string | undefined;

  while (curr && typeof curr === 'object') {
    if (curr.__circular_ref !== undefined) {
      cycleTo = refToNodeId.get(curr.__circular_ref);
      break;
    }
    if (curr.__original_ref_id !== undefined) {
      refToNodeId.set(curr.__original_ref_id, String(id));
    }
    nodes.push({
      id:     String(id),
      value:  curr.value !== undefined ? curr.value : curr.val,
      __raw:  curr,
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
  if (
    !rootNode || typeof rootNode !== 'object' || Array.isArray(rootNode)
  ) return [];
  if (!('value' in rootNode) && !('val' in rootNode)) return [];

  const nodes: any[] = [];
  let   idCounter    = 0;
  const seen         = new Set<any>();

  function traverse(node: any): string | null {
    if (!node || typeof node !== 'object') return null;
    if (seen.has(node)) return null;
    seen.add(node);

    const currentId = String(idCounter++);
    const leftId    = traverse(node.left);
    const rightId   = traverse(node.right);

    nodes.push({
      id:    currentId,
      value: node.value !== undefined ? node.value : node.val,
      left:  leftId,
      right: rightId,
      __raw: node,
    });
    return currentId;
  }

  traverse(rootNode);
  return nodes;
}

/**
 * Traverses a pointer-based N-ary Trie and flattens it into TrieNodeData[].
 *
 * BUG FIXES vs original:
 *  1. Root node now gets label 'root' (not '*').
 *  2. Children are detected via multiple field names: children / links / next / edges.
 *  3. Sparse array handled: only non-null slots are visited; char derived from
 *     slot index OR from a Map key, whichever is available.
 *  4. isEnd resolved from isEndOfWord | isEnd | endOfWord | end fields.
 *  5. Produces TrieNodeData format: { id, value, children: string[], isEnd }.
 */
/** Returns true if the given object looks like a raw (un-unrolled) Trie node. */
function looksLikeTrieNode(obj: any): boolean {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;
  return (
    Array.isArray(obj.children) ||
    Array.isArray(obj.links)    ||
    Array.isArray(obj.edges)    ||
    obj.children instanceof Map ||
    obj.links    instanceof Map ||
    'isEndOfWord' in obj ||
    'isEnd'       in obj ||
    'endOfWord'   in obj ||
    'terminal'    in obj
  );
}

function unrollPointerTrie(rootNode: any): any[] {
  if (!rootNode || typeof rootNode !== 'object' || Array.isArray(rootNode)) {
    return [];
  }

  const nodes: any[] = [];
  let   idCounter    = 0;
  const seen         = new Set<any>();

  /**
   * Returns the children field of a trie node as an iterable of
   * [charKey, childNode] pairs, regardless of the field name / storage type.
   */
  function getChildEntries(node: any): [string, any][] {
    const entries: [string, any][] = [];

    // Prefer an explicit Map (char → node)
    const mapField = node.children instanceof Map ? node.children
                   : node.links   instanceof Map ? node.links
                   : null;
    if (mapField) {
      mapField.forEach((child: any, key: any) => {
        if (child) entries.push([String(key), child]);
      });
      return entries;
    }

    // Dense / sparse array indexed by char-code (most common: children[26])
    const arrField: any[] | null =
        Array.isArray(node.children) ? node.children
      : Array.isArray(node.links)    ? node.links
      : Array.isArray(node.edges)    ? node.edges
      : null;

    if (arrField) {
      arrField.forEach((child, i) => {
        if (child !== null && child !== undefined && typeof child === 'object') {
          // Derive char: lowercase Latin a–z for indices 0–25, else use index
          const char =
            i >= 0 && i < 26
              ? String.fromCharCode(97 + i)
              : String(i);
          entries.push([char, child]);
        }
      });
      return entries;
    }

    // Plain object map { 'a': node, 'b': node, … }
    if (node.children && typeof node.children === 'object') {
      Object.entries(node.children).forEach(([k, v]) => {
        if (v && typeof v === 'object') entries.push([k, v]);
      });
      return entries;
    }

    // next pointer on node (non-linked-list context – rare but handle it)
    if (
      node.next && typeof node.next === 'object' &&
      !Array.isArray(node.next) &&
      // Guard: must look like a trie node, not a linked-list node
      !('val' in node.next) && !('value' in node.next && 'next' in (node.next.next ?? {}))
    ) {
      entries.push(['→', node.next]);
    }

    return entries;
  }

  function resolveIsEnd(node: any): boolean {
    return !!(
      node.isEndOfWord || node.isEnd || node.endOfWord ||
      node.end || node.terminal || node.word
    );
  }

  function traverse(node: any, charKey?: string): string | null {
    if (!node || typeof node !== 'object' || Array.isArray(node)) return null;
    if (seen.has(node)) return null;
    seen.add(node);

    const currentId    = String(idCounter++);
    const childEntries = getChildEntries(node);
    const childIds: string[] = [];

    for (const [char, child] of childEntries) {
      const childId = traverse(child, char);
      if (childId !== null) childIds.push(childId);
    }

    const isEnd = resolveIsEnd(node);

    // Label: use the char that leads TO this node (from parent edge).
    // Root has no charKey → label it 'root'.
    const label = charKey !== undefined ? charKey : 'root';

    nodes.push({
      id:       currentId,
      value:    label,
      children: childIds,
      isEnd,
      __raw:    node,
    });

    return currentId;
  }

  traverse(rootNode);
  return nodes;
}

// ─── PREFIX MATCHERS ────────────────────────────────────────────────────────

const GRAPH_PREFIXES   = ['adj', 'graph', 'network', 'edges', 'vertices', 'paths'];
const TREE_PREFIXES    = ['tree', 'bst', 'root', 'heap', 'forest', 'leaves', 'nodes'];
const TRIE_PREFIXES    = ['trie', 'prefix_tree', 'ptree', 'dictionary_tree', 'suffix_tree'];
const MATRIX_PREFIXES  = [
  'mat', 'grid', 'board', 'table', 'matrix', 'vec2d', 'array2d', 'dp',
  'grid2d', 'matrix2d', 'table2d', 'res', 'map2d', 'pixels', 'image', 'layout'
];
const STACK_PREFIXES   = ['stack', 'stk', 'history', 'undo', 'frames'];
const QUEUE_PREFIXES   = ['queue', 'deque', 'line', 'queue_nodes', 'tasks'];
const ARRAY_PREFIXES   = [
  'arr', 'vec', 'nums', 'seq', 'list', 'cache', 'res', 'dp',
  'array', 'tuple', 'valarray', 'collection', 'items', 'elements', 'values', 'data', 'records', 'buffer'
];

const STRING_PREFIXES  = [
  'str', 'text', 'word', 'chars', 'msg', 'string', 'sentence', 'paragraph',
  'pattern', 'substring', 'sub', 'letters', 'characters'
];
const BITSET_PREFIXES  = ['mask', 'bits', 'flags', 'bitset', 'state_mask', 'status_bits', 'binary_flags', 'bitmask'];
const SCALAR_PREFIXES  = [
  'ans', 'sum', 'count', 'total', 'result', 'max_val', 'min_val', 'cnt',
  'res_val', 'diff', 'target',
];

function matchesPrefix(name: string, prefixes: string[]): boolean {
  const lower = name.toLowerCase();
  return prefixes.some(p => lower.startsWith(p));
}

// ─── POINTER COLLECTORS ─────────────────────────────────────────────────────

function collectGraphPointers(
  keys: string[], vars: VarMap
): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointerPatterns = ['node', 'curr', 'u', 'v'];
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isMatch = pointerPatterns.some(
      p =>
        lower === p ||
        lower.startsWith(`ptr_${p}`) ||
        lower.startsWith(`${p}_`) ||
        lower.endsWith(`_${p}`)
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

function collectIndexPointers(
  keys: string[], vars: VarMap, patterns: string[]
): { pointers: { name: string; index: number }[]; usedKeys: string[] } {
  const pointers: { name: string; index: number }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isMatch = patterns.some(
      p =>
        lower === p ||
        lower.startsWith(`ptr_${p}`) ||
        lower.startsWith(`${p}_`) ||
        lower.endsWith(`_${p}`)
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

function collectNodePointers(
  keys: string[], vars: VarMap, patterns: string[], nodeArray?: any[]
): { pointers: { name: string; nodeId: string }[]; usedKeys: string[] } {
  const pointers: { name: string; nodeId: string }[] = [];
  const usedKeys: string[] = [];

  for (const key of keys) {
    const lower = key.toLowerCase();
    const isNameMatch =
      patterns.length === 0 ||
      patterns.some(
        p =>
          lower === p ||
          lower.endsWith(`_${p}`) ||
          lower.startsWith(`ptr_${p}`)
      );

    let val = vars[key]?.value;
    if (val !== undefined && val !== null) {
      val = deepUnwrap(val);

      if (typeof val === 'object' && nodeArray) {
        const targetRefId =
          val.__circular_ref !== undefined
            ? val.__circular_ref
            : val.__original_ref_id;

        let match: any;
        if (targetRefId !== undefined) {
          match = nodeArray.find(
            n => n.__raw && n.__raw.__original_ref_id === targetRefId
          );
        } else {
          match = nodeArray.find(n => n.__raw === val);
          if (!match) {
            const valStr = JSON.stringify(val);
            const matches = nodeArray.filter(n => JSON.stringify(n.__raw) === valStr);
            if (matches.length === 1) {
              match = matches[0];
            } else if (matches.length > 1) {
              console.warn(`[detectVisualizer] Ambiguous pointer match for '${key}': multiple nodes have identical content and no __original_ref_id is present.`);
              // match remains undefined to prevent attaching to the wrong node
            }
          }
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

// ─── GRAPH HELPERS ───────────────────────────────────────────────────────────

interface GraphNode {
  id:     string;
  label?: string | number;
  x:      number;
  y:      number;
}
interface GraphEdge {
  id:         string;
  source:     string;
  target:     string;
  weight?:    string | number;
  isDirected?: boolean;
}

function tryDetectAdjacencyGraph(
  name:          string,
  data:          any,
  type:          string,
  currentEvent:  any,
  vars:          VarMap,
  keys:          string[],
  consumedKeys:  Set<string>
): CanvasState | null {
  const isAdjList =
    (name.includes('_adj') || name.includes('adj_') || name.includes('graph')) &&
    type.includes('vector') &&
    Array.isArray(data);

  if (!isAdjList) return null;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenEdges          = new Set<string>();

  data.forEach((neighbors: any, i: number) => {
    nodes.push({ id: String(i), label: i, x: 50, y: 50 });
    if (!Array.isArray(neighbors)) return;
    neighbors.forEach((j: number) => {
      const key = `${i}-${j}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        edges.push({ id: key, source: String(i), target: String(j), isDirected: true });
      }
    });
  });

  if (nodes.length === 0) return null;

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

  const visitedKey = keys.find(
    k => k.toLowerCase().includes('visit') && !consumedKeys.has(k)
  );
  if (visitedKey) {
    const visited = deepUnwrap(vars[visitedKey]?.value) || [];
    if (Array.isArray(visited)) {
      activeNodes = visited
        .map((v: number, i: number) => (v === 1 ? String(i) : null))
        .filter(Boolean) as string[];
    }
  }

  const parentKey = keys.find(
    k => k.toLowerCase().includes('parent') && !consumedKeys.has(k)
  );
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

  if (vars['current'] && vars['v']) {
    const cur = vars['current'].value;
    const nbr = vars['v'].value;
    if (cur !== undefined && nbr !== undefined) readEdges.push(`${cur}-${nbr}`);
  }

  const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars);
  const usedKeys = [
    name, 'current', 'v', visitedKey, parentKey, ...ptrKeys,
  ].filter(k => k && vars[k as string]) as string[];

  return {
    id: name, type: 'graph', usedKeys,
    props: {
      nodes, edges, pointers,
      highLightNodes: activeNodes,
      readNodes,
      highLightEdges,
      readEdges,
    },
  };
}

// ─── MAIN DETECTOR ──────────────────────────────────────────────────────────

export function detectVisualizer(vars: VarMap, currentEvent?: any): CanvasState[] {
  const visualizers:   CanvasState[] = [];
  const consumedKeys   = new Set<string>();

  // Helper to extract read/write indices from the current event
  const extractEventIndices = (targetName: string, is2D = false) => {
    const reads:  any[] = [];
    const writes: any[] = [];

    if (currentEvent?.payload?.variable) {
      const varName = String(currentEvent.payload.variable);

      if (!is2D) {
        const match = varName.match(
          new RegExp(`^${targetName}\\[(\\d+)\\]$`)
        );
        if (match) {
          const idx = parseInt(match[1], 10);
          if (currentEvent.type === 'READ') reads.push(idx);
          if (
            currentEvent.type === 'ASSIGNMENT' ||
            currentEvent.type === 'ASSIGN'
          ) writes.push(idx);
        }
      } else {
        const match = varName.match(
          new RegExp(`^${targetName}\\[(\\d+)\\]\\[(\\d+)\\]$`)
        );
        if (match) {
          const r = parseInt(match[1], 10);
          const c = parseInt(match[2], 10);
          if (currentEvent.type === 'READ') reads.push({ row: r, col: c });
          if (
            currentEvent.type === 'ASSIGNMENT' ||
            currentEvent.type === 'ASSIGN'
          ) writes.push({ row: r, col: c });
        }
      }
    }
    return { reads, writes };
  };

  const keys = Object.keys(vars);

  // ── 0. Adjacency-list graph ─────────────────────────────────────────────
  for (const name of keys) {
    if (consumedKeys.has(name)) continue;
    const type = vars[name]?.type ?? '';
    const val  = deepUnwrap(vars[name]?.value);

    if (
      type.includes('vector') &&
      (name.includes('adj') || name.includes('graph'))
    ) {
      const graphState = tryDetectAdjacencyGraph(
        name, val, type, currentEvent, vars, keys, consumedKeys
      );
      if (graphState) {
        graphState.usedKeys.forEach(k => consumedKeys.add(k));
        visualizers.push(graphState);
      }
    }
  }

  // ── 1. Generic graph ────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, GRAPH_PREFIXES)).forEach(graphKey => {
    if (consumedKeys.has(graphKey)) return;

    const isEdgeList = graphKey.toLowerCase().includes('edge');
    let   rawVal     = deepUnwrap(vars[graphKey]?.value);
    let   edgeKey    = keys.find(
      k => k !== graphKey && k.toLowerCase().includes('edge') && !consumedKeys.has(k)
    );

    if (isEdgeList) { edgeKey = graphKey; rawVal = []; }

    if (
      is2DArray(rawVal) ||
      (Array.isArray(rawVal) && rawVal.length > 0) ||
      isEdgeList
    ) {
      const rawEdges = edgeKey ? deepUnwrap(vars[edgeKey]?.value) || [] : [];
      let   n        = Array.isArray(rawVal) ? rawVal.length : 0;

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
        const visitedKey = keys.find(
          k => k.toLowerCase().includes('visit') && !consumedKeys.has(k)
        );
        const visited = visitedKey
          ? deepUnwrap(vars[visitedKey]?.value) || []
          : [];
        const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars);

        const usedKeys = [
          !isEdgeList ? graphKey : null, edgeKey, visitedKey, ...ptrKeys,
        ].filter(Boolean) as string[];
        usedKeys.forEach(k => consumedKeys.add(k));

        const nodes = Array.from({ length: n }).map((_, i) => {
          const angle  = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
          const radius = n <= 3 ? 28 : n <= 6 ? 33 : 38;
          return {
            id: String(i), label: String(i),
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle),
          };
        });

        const edges = Array.isArray(rawEdges)
          ? rawEdges
              .filter((e: any) => Array.isArray(e) && e.length >= 2)
              .map((e: any[]) => ({
                id:     `${e[0]}-${e[1]}`,
                source: String(e[0]),
                target: String(e[1]),
              }))
          : [];

        visualizers.push({
          id:   !isEdgeList ? graphKey : (edgeKey as string),
          type: 'graph',
          usedKeys,
          props: {
            nodes, edges, pointers,
            highLightNodes: Array.isArray(visited)
              ? visited
                  .map((v: number, i: number) => (v === 1 ? String(i) : null))
                  .filter(Boolean)
              : [],
          },
        });
      }
    }
  });

  // ── 2. TRIE DETECTION (must come BEFORE binary-tree detection) ──────────
  //
  // FIX: Tries are now detected via their own TRIE_PREFIXES list, or by the
  //      presence of 'trie' anywhere in the variable name, BEFORE the generic
  //      TREE_PREFIXES loop.  The two paths also properly produce TrieNodeData
  //      (with children: string[]) rather than BinaryTreeNode (left/right).
  keys.forEach(trieKey => {
    if (consumedKeys.has(trieKey)) return;

    const isTrie =
      matchesPrefix(trieKey, TRIE_PREFIXES) ||
      trieKey.toLowerCase().includes('trie');

    if (!isTrie) return;

    let trieData = deepUnwrap(vars[trieKey]?.value);

    // Pointer-based trie node (struct with children / links / edges array OR trie bool flags)
    if (trieData && typeof trieData === 'object' && !Array.isArray(trieData) && looksLikeTrieNode(trieData)) {
      trieData = unrollPointerTrie(trieData);
    }

    if (isTrieNodeArray(trieData)) {
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(
        keys, vars, ['curr', 'node', 'ptr', 'temp'], trieData
      );
      const usedKeys = [trieKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({
        id: trieKey, type: 'trie', usedKeys,
        props: { nodes: trieData, pointers },
      });
    }
  });

  // ── 3. TREE & BST DETECTION (binary only — trie already handled above) ──
  keys.filter(k => matchesPrefix(k, TREE_PREFIXES)).forEach(treeKey => {
    if (consumedKeys.has(treeKey)) return;

    let treeData = deepUnwrap(vars[treeKey]?.value);

    if (treeData && typeof treeData === 'object' && !Array.isArray(treeData)) {
      // Case A: pure trie node (has children[] or trie boolean flags, no value/val)
      if (looksLikeTrieNode(treeData) && !('left' in treeData) && !('right' in treeData)) {
        treeData = unrollPointerTrie(treeData);
        if (isTrieNodeArray(treeData)) {
          const { pointers, usedKeys: ptrKeys } = collectNodePointers(
            keys, vars, ['root', 'curr', 'parent', 'left', 'right', 'temp', 'node'],
            treeData
          );
          const usedKeys = [treeKey, ...ptrKeys];
          usedKeys.forEach(k => consumedKeys.add(k));
          visualizers.push({
            id: treeKey, type: 'trie', usedKeys,
            props: { nodes: treeData, pointers },
          });
          return;
        }
      }
      // Case B: standard binary-tree node (has value/val + left/right)
      if ('value' in treeData || 'val' in treeData) {
        if ('left' in treeData || 'right' in treeData) {
          treeData = unrollPointerTree(treeData);
        }
      }
    }

    if (isBinaryNodeArray(treeData)) {
      const normalizedNodes = normalizeNodeArray(treeData);
      const { pointers, usedKeys: ptrKeys } = collectNodePointers(
        keys, vars,
        ['root', 'curr', 'parent', 'left', 'right', 'temp', 'node'],
        normalizedNodes
      );
      const usedKeys = [treeKey, ...ptrKeys];
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({
        id: treeKey, type: 'tree', usedKeys,
        props: { nodes: normalizedNodes, pointers },
      });
    }
  });

  // ── 4. MATRIX ───────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, MATRIX_PREFIXES)).forEach(matrixKey => {
    if (consumedKeys.has(matrixKey)) return;
    const rawGrid = deepUnwrap(vars[matrixKey]?.value);
    if (!is2DArray(rawGrid)) return;

    const pointers: { name: string; row: number; col: number }[] = [];
    const usedKeys = [matrixKey];

    const potentialRowKeys = keys.filter(
      k =>
        !consumedKeys.has(k) &&
        (
          k.toLowerCase() === 'r'  || k.toLowerCase() === 'i'  ||
          k.toLowerCase().includes('row') ||
          k.toLowerCase().endsWith('_r')  || k.toLowerCase().startsWith('r_')
        )
    );
    const potentialColKeys = keys.filter(
      k =>
        !consumedKeys.has(k) &&
        (
          k.toLowerCase() === 'c'  || k.toLowerCase() === 'j'  ||
          k.toLowerCase().includes('col') ||
          k.toLowerCase().endsWith('_c')  || k.toLowerCase().startsWith('c_')
        )
    );

    let foundPair = false;
    for (const rKey of potentialRowKeys) {
      for (const cKey of potentialColKeys) {
        if (rKey === cKey) continue;
        const rVal = vars[rKey]?.value;
        const cVal = vars[cKey]?.value;
        if (typeof rVal !== 'number' || typeof cVal !== 'number') continue;

        const numRows = rawGrid.length;
        const firstRow: any = rawGrid[0];
        const numCols = Array.isArray(firstRow)
          ? firstRow.length
          : typeof firstRow === 'string'
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

    const { reads, writes } = extractEventIndices(matrixKey, true);
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: matrixKey, type: 'matrix', usedKeys,
      props: { value: rawGrid, pointers, readIndices: reads, writeIndices: writes },
    });
  });

  // ── 5. LINKED LIST ──────────────────────────────────────────────────────
  const candidateLists: any[] = [];

  keys.forEach(k => {
    if (consumedKeys.has(k)) return;
    const llData = deepUnwrap(vars[k]?.value);

    if (
      llData &&
      typeof llData === 'object' &&
      !Array.isArray(llData) &&
      ('value' in llData || 'val' in llData) &&
      'next' in llData
    ) {
      const unrolled      = unrollPointerLinkedList(llData);
      const isDoublyLinked = 'prev' in llData;
      if (unrolled.nodes.length > 0) {
        candidateLists.push({
          key: k,
          nodes: unrolled.nodes,
          cycleTo: unrolled.cycleTo,
          isDoublyLinked,
        });
      }
    }
  });

  // Remove sublists fully contained in a larger list
  const finalLists = candidateLists.filter(cand => {
    const candRefIds = new Set(
      cand.nodes
        .map((n: any) => n.__raw?.__original_ref_id)
        .filter(Boolean)
    );
    if (candRefIds.size === 0) return true;

    return !candidateLists.some(other => {
      if (other === cand) return false;
      const otherRefIds = new Set(
        other.nodes
          .map((n: any) => n.__raw?.__original_ref_id)
          .filter(Boolean)
      );
      const allContained = Array.from(candRefIds).every(id =>
        otherRefIds.has(id as string)
      );
      if (!allContained) return false;
      return (
        otherRefIds.size > candRefIds.size ||
        (otherRefIds.size === candRefIds.size && other.key < cand.key)
      );
    });
  });

  finalLists.forEach(list => {
    const { pointers, usedKeys: ptrKeys } = collectNodePointers(
      keys, vars, [], list.nodes
    );

    if (!ptrKeys.includes(list.key)) {
      pointers.unshift({
        name:   list.key,
        nodeId: list.nodes.length > 0 ? list.nodes[0].id : '0',
      });
      ptrKeys.push(list.key);
    }

    const usedKeys = [...new Set([list.key, ...ptrKeys])];
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: list.key, type: 'linkedlist', usedKeys,
      props: {
        nodes:          list.nodes,
        pointers,
        cycleTo:        list.cycleTo,
        isDoublyLinked: list.isDoublyLinked,
      },
    });
  });

  // ── 6. STACK ────────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, STACK_PREFIXES)).forEach(stackKey => {
    if (consumedKeys.has(stackKey)) return;
    const stackVal = deepUnwrap(vars[stackKey]?.value);
    if (!isFlatArray(stackVal)) return;

    const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
      keys, vars, ['top', 'peek', 'curr']
    );
    const usedKeys = [stackKey, ...ptrKeys];
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: stackKey, type: 'stack', usedKeys,
      props: { value: stackVal, pointers },
    });
  });

  // ── 7. QUEUE ────────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, QUEUE_PREFIXES)).forEach(queueKey => {
    if (consumedKeys.has(queueKey)) return;
    const queueVal = deepUnwrap(vars[queueKey]?.value);
    if (!isFlatArray(queueVal)) return;

    const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
      keys, vars, ['front', 'back', 'rear', 'head', 'tail', 'curr']
    );
    const usedKeys = [queueKey, ...ptrKeys];
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: queueKey, type: 'queue', usedKeys,
      props: { value: queueVal, pointers },
    });
  });

  // ── 8. 1D ARRAY ─────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, ARRAY_PREFIXES)).forEach(arrayKey => {
    if (consumedKeys.has(arrayKey)) return;
    const arrayVal = deepUnwrap(vars[arrayKey]?.value);
    if (!isFlatArray(arrayVal)) return;

    const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
      keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']
    );
    const usedKeys = [arrayKey, ...ptrKeys];
    const { reads, writes } = extractEventIndices(arrayKey, false);
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: arrayKey, type: 'array', usedKeys,
      props: { value: arrayVal, pointers, readIndices: reads, writeIndices: writes },
    });
  });

  // ── 9. MAP ─────────────────────────────────────────────────────────
  keys.forEach(mapKey => {
    if (consumedKeys.has(mapKey)) return;
    const mapVal = deepUnwrap(vars[mapKey]?.value);
    if (
      mapVal &&
      typeof mapVal === 'object' &&
      mapVal.__type === 'map' &&
      Array.isArray(mapVal.entries)
    ) {
      consumedKeys.add(mapKey);
      visualizers.push({
        id: mapKey, type: 'map', usedKeys: [mapKey],
        props: { entries: mapVal.entries },
      });
    }
  });

  // ── 9b. SET ─────────────────────────────────────────────────────────
  keys.forEach(setKey => {
    if (consumedKeys.has(setKey)) return;
    const setVal = deepUnwrap(vars[setKey]?.value);
    if (
      setVal &&
      typeof setVal === 'object' &&
      setVal.__type === 'set' &&
      Array.isArray(setVal.values)
    ) {
      consumedKeys.add(setKey);
      visualizers.push({
        id: setKey, type: 'set', usedKeys: [setKey],
        props: { values: setVal.values },
      });
    }
  });


  // ── 10. STRING ───────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, STRING_PREFIXES)).forEach(stringKey => {
    if (consumedKeys.has(stringKey)) return;
    const stringVal = deepUnwrap(vars[stringKey]?.value);
    if (typeof stringVal !== 'string' && !isFlatArray(stringVal)) return;

    const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
      keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']
    );
    const usedKeys = [stringKey, ...ptrKeys];
    const { reads, writes } = extractEventIndices(stringKey, false);
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: stringKey, type: 'string', usedKeys,
      props: { value: stringVal, pointers, readIndices: reads, writeIndices: writes },
    });
  });

  // ── 11. BITSET ───────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, BITSET_PREFIXES)).forEach(bitKey => {
    if (consumedKeys.has(bitKey)) return;
    const bitVal = deepUnwrap(vars[bitKey]?.value);

    if (
      typeof bitVal === 'number' ||
      (
        isFlatArray(bitVal) &&
        (bitVal as any[]).every(v => typeof v === 'boolean' || v === 0 || v === 1)
      )
    ) {
      consumedKeys.add(bitKey);
      visualizers.push({
        id: bitKey, type: 'bitset', usedKeys: [bitKey],
        props: { value: bitVal },
      });
    } else if (isFlatArray(bitVal)) {
      // Non-binary values — render as a plain array instead
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
        keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']
      );
      const usedKeys = [bitKey, ...ptrKeys];
      const { reads, writes } = extractEventIndices(bitKey, false);
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({
        id: bitKey, type: 'array', usedKeys,
        props: { value: bitVal, pointers, readIndices: reads, writeIndices: writes },
      });
    }
  });

  // ── 12. SCALAR ───────────────────────────────────────────────────────────
  keys.filter(k => matchesPrefix(k, SCALAR_PREFIXES)).forEach(scalarKey => {
    if (consumedKeys.has(scalarKey)) return;
    const scalarVal = deepUnwrap(vars[scalarKey]?.value);

    if (
      typeof scalarVal === 'number' ||
      typeof scalarVal === 'string'  ||
      typeof scalarVal === 'boolean'
    ) {
      consumedKeys.add(scalarKey);
      visualizers.push({
        id: scalarKey, type: 'scalar', usedKeys: [scalarKey],
        props: { value: scalarVal, name: scalarKey },
      });
    }
  });

  // ── 13. FALLBACK ANIMATOR (Anything except Scalars) ──────────────────────
  keys.forEach(key => {
    if (consumedKeys.has(key)) return;
    const val = deepUnwrap(vars[key]?.value);
    
    // Ignore scalars, nulls, functions
    if (val === null || val === undefined) return;
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'boolean' || typeof val === 'function') return;

    // Detect type
    if (is2DArray(val)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
        keys, vars, ['i', 'j', 'k', 'r', 'c', 'row', 'col', 'curr', 'ptr']
      );
      const usedKeys = [key, ...ptrKeys];
      const { reads, writes } = extractEventIndices(key, true);
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({
        id: key, type: 'matrix', usedKeys,
        props: { value: val, pointers, readIndices: reads, writeIndices: writes },
      });
    } else if (Array.isArray(val)) {
      const { pointers, usedKeys: ptrKeys } = collectIndexPointers(
        keys, vars, ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr']
      );
      const usedKeys = [key, ...ptrKeys];
      const { reads, writes } = extractEventIndices(key, false);
      usedKeys.forEach(k => consumedKeys.add(k));
      visualizers.push({
        id: key, type: 'array', usedKeys,
        props: { value: val, pointers, readIndices: reads, writeIndices: writes },
      });
    } else if (typeof val === 'object') {
      // Prevent structural nodes (like Linked List or Tree nodes) from randomly popping up as Maps
      const isStructuralNode = 'next' in val || 'prev' in val || 'left' in val || 'right' in val || 
                               ('children' in val && Array.isArray(val.children)) || 
                               ('neighbors' in val && Array.isArray(val.neighbors));
      
      if (isStructuralNode) return;

      // REMOVED: Fallback for generic objects/structs. 
      // This prevents internal structs (like LFUCache) and their nested maps 
      // from randomly popping up in the visualizer as generic Maps.
      /*
      const entries = Object.entries(val)
        .filter(([k]) => !k.startsWith('__'))
        .map(([k, v]) => [k, v]);
      consumedKeys.add(key);
      visualizers.push({
        id: key, type: 'map', usedKeys: [key],
        props: { entries },
      });
      */
    }
  });

  return visualizers;
}
