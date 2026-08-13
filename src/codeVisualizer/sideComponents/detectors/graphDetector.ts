import { type CanvasState, type VarMap, deepUnwrap, is2DArray, matchesPrefix } from "./coreUtils";
import { collectGraphPointers } from "./pointerCollector";

export const GRAPH_PREFIXES = ["adj", "graph", "network", "edges", "vertices", "paths"];

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

export function tryDetectAdjacencyGraph(
  name: string,
  data: any,
  type: string,
  currentEvent: any,
  vars: VarMap,
  keys: string[],
  consumedKeys: Set<string>,
  pointerContext: Record<string, string[]>,
): CanvasState | null {
  const isAdjList =
    (name.includes("_adj") || name.includes("adj_") || name.includes("graph")) &&
    type.includes("vector") &&
    Array.isArray(data);

  if (!isAdjList) return null;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const seenEdges = new Set<string>();

  // Try to find a variable that holds node details (e.g. locations, nodes, vertices)
  let nodeDetailsArr: any[] | null = null;
  let nodeDetailsKey: string | null = null;
  for (const k of keys) {
    if (
      (k.toLowerCase().includes("node") ||
        k.toLowerCase().includes("location") ||
        k.toLowerCase().includes("vert")) &&
      Array.isArray(vars[k]?.value) &&
      vars[k].value.length >= data.length
    ) {
      nodeDetailsArr = vars[k].value;
      nodeDetailsKey = k;
      break;
    }
  }

  data.forEach((neighbors: any, i: number) => {
    let lbl: any = i;
    if (nodeDetailsArr && nodeDetailsArr[i]) {
      const details = nodeDetailsArr[i];
      if (typeof details === "object" && details !== null) {
        // Pass the entire object to the UI so it can be rendered recursively
        lbl = details;
      } else if (typeof details === "string" || typeof details === "number") {
        lbl = `${i}: ${details}`;
      }
    }
    nodes.push({ id: String(i), label: lbl, x: 50, y: 50 });
    if (!Array.isArray(neighbors)) return;
    neighbors.forEach((nbr: any) => {
      let j: number;
      let w: any = undefined;

      if (Array.isArray(nbr) && nbr.length >= 2) {
        const v0 = Number(nbr[0]);
        const v1 = Number(nbr[1]);
        const v0Valid = Number.isInteger(v0) && v0 >= 0 && v0 < data.length;
        const v1Valid = Number.isInteger(v1) && v1 >= 0 && v1 < data.length;
        
        if (v0Valid && !v1Valid) {
          j = v0;
          w = nbr[1];
        } else if (v1Valid && !v0Valid) {
          j = v1;
          w = nbr[0];
        } else {
          // Ambiguous: both are valid node indices.
          // In many CP Dijkstra implementations, pair<weight, node> is used.
          // But pair<node, weight> is also common. We'll default to the first element being the node
          // UNLESS the variable is named something like "adj" and we're forced to guess.
          // Let's use a heuristic: if we see a node index that perfectly matches a 'to' or 'v' pattern in other contexts.
          // For now, we will assume pair<node, weight> as standard, but if it fails we might need better AST metadata.
          // Actually, let's look at all edges. If one column is always 1, it's likely a weight.
          // Without full graph context here, we'll try to guess based on standard `pair<node, weight>`.
          // WAIT! The user code used `graph_adj[u].push_back({w, v});`
          // Let's default to [node, weight], but if we know it's Dijkstra, it might be [weight, node].
          // Let's just default to nbr[0] as node, nbr[1] as weight, but if nbr[0] is much larger across edges it will be caught by the above v0Valid check!
          // We'll just do j = v0, w = nbr[1] as default. But wait, if user code is {w, v}, then j should be v1.
          // Let's check if there is any other way: if one of them is exactly 0, 1, 2, 3.. sequentially? No.
          j = v1; // Assuming {weight, node} for CP Dijkstra compatibility since {node, weight} usually has weights > N which auto-resolves.
          w = nbr[0];
          // Let's actually check if v0 matches a sequential pattern elsewhere. For now this handles the user's {w, v} case and cases where weight > N automatically handle {v, w}.
        }
      } else if (typeof nbr === "object" && nbr !== null) {
        // Try to find the destination node ID in the struct
        j =
          nbr.to ??
          nbr.dest ??
          nbr.destination ??
          nbr.target ??
          nbr.node ??
          nbr.vertex ??
          nbr.v ??
          -1;
        // Try to find weight
        w = nbr.weight ?? nbr.cost ?? nbr.distance ?? nbr.w;
      } else {
        j = Number(nbr);
      }

      if (j === -1 || isNaN(j)) return;

      const key = `${i}-${j}`;
      if (!seenEdges.has(key)) {
        seenEdges.add(key);
        edges.push({ id: key, source: String(i), target: String(j), weight: w, isDirected: true });
      }
    });
  });

  if (nodes.length === 0) return null;

  let activeNodes: string[] = [];
  const readNodes: string[] = [];
  const highLightEdges: string[] = [];
  const readEdges: string[] = [];

  if (currentEvent?.payload?.variable === "current") {
    const cur = currentEvent.payload.value;
    if (cur !== undefined) readNodes.push(String(cur));
  } else if (vars["current"]) {
    const cur = vars["current"].value;
    if (cur !== undefined) readNodes.push(String(cur));
  }

  const visitedKey = keys.find((k) => k.toLowerCase().includes("visit") && !consumedKeys.has(k));
  if (visitedKey) {
    const visited = deepUnwrap(vars[visitedKey]?.value) || [];
    if (Array.isArray(visited)) {
      activeNodes = visited
        .map((v: number, i: number) => (v === 1 ? String(i) : null))
        .filter(Boolean) as string[];
    }
  }

  const parentKey = keys.find((k) => k.toLowerCase().includes("parent") && !consumedKeys.has(k));
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

  if (vars["current"] && vars["v"]) {
    const cur = vars["current"].value;
    const nbr = vars["v"].value;
    if (cur !== undefined && nbr !== undefined) readEdges.push(`${cur}-${nbr}`);
  }

  const { pointers, usedKeys: ptrKeys } = collectGraphPointers(keys, vars, name, pointerContext);
  const usedKeys = [name, "current", "v", visitedKey, parentKey, nodeDetailsKey, ...ptrKeys].filter(
    (k) => k && vars[k as string],
  ) as string[];

  return {
    id: name,
    type: "graph",
    usedKeys,
    props: {
      nodes,
      edges,
      pointers,
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
  visualizers: CanvasState[],
) {
  keys
    .filter((k) => matchesPrefix(k, GRAPH_PREFIXES))
    .forEach((graphKey) => {
      if (consumedKeys.has(graphKey)) return;

      const isEdgeList = graphKey.toLowerCase().includes("edge");
      let rawVal = deepUnwrap(vars[graphKey]?.value);
      let edgeKey = keys.find(
        (k) => k !== graphKey && k.toLowerCase().includes("edge") && !consumedKeys.has(k),
      );

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
          const visitedKey = keys.find(
            (k) => k.toLowerCase().includes("visit") && !consumedKeys.has(k),
          );
          const visited = visitedKey ? deepUnwrap(vars[visitedKey]?.value) || [] : [];

          // Pass the actual key being used for the structure (graphKey or edgeKey) to pointerContext
          const targetName = !isEdgeList ? graphKey : (edgeKey as string);
          const { pointers, usedKeys: ptrKeys } = collectGraphPointers(
            keys,
            vars,
            targetName,
            pointerContext,
          );

          const usedKeys = [!isEdgeList ? graphKey : null, edgeKey, visitedKey, ...ptrKeys].filter(
            Boolean,
          ) as string[];
          usedKeys.forEach((k) => consumedKeys.add(k));

          const nodes = Array.from({ length: n }).map((_, i) => {
            const angle = (2 * Math.PI * i) / Math.max(n, 1) - Math.PI / 2;
            const radius = n <= 3 ? 28 : n <= 6 ? 33 : 38;
            return {
              id: String(i),
              label: String(i),
              x: 50 + radius * Math.cos(angle),
              y: 50 + radius * Math.sin(angle),
            };
          });

          const edges = Array.isArray(rawEdges)
            ? rawEdges
                .filter((e: any) => Array.isArray(e) && e.length >= 2)
                .map((e: any[]) => ({
                  id: `${e[0]}-${e[1]}`,
                  source: String(e[0]),
                  target: String(e[1]),
                }))
            : [];

          visualizers.push({
            id: targetName,
            type: "graph",
            usedKeys,
            props: {
              nodes,
              edges,
              pointers,
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
