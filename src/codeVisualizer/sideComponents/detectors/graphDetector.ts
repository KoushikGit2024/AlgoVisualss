import { type CanvasState, type VarMap, deepUnwrap, is2DArray, matchesPrefix } from './coreUtils';
import { collectGraphPointers } from './pointerCollector';

export const GRAPH_PREFIXES = ['adj', 'graph', 'network', 'edges', 'vertices', 'paths'];

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

export function tryDetectAdjacencyGraph(
  name:          string,
  data:          any,
  type:          string,
  currentEvent:  any,
  vars:          VarMap,
  keys:          string[],
  consumedKeys:  Set<string>,
  pointerContext: Record<string, string[]>
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

  const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars, name, pointerContext);
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

export function detectGenericGraph(
  keys: string[],
  vars: VarMap,
  consumedKeys: Set<string>,
  pointerContext: Record<string, string[]>,
  visualizers: CanvasState[]
) {
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
        
        // Pass the actual key being used for the structure (graphKey or edgeKey) to pointerContext
        const targetName = !isEdgeList ? graphKey : (edgeKey as string);
        const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars, targetName, pointerContext);

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
          id: targetName,
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
}
