import { type CanvasState,type VarMap, deepUnwrap, isFlatArray, matchesPrefix } from './coreUtils';
import { collectIndexPointers, collectNodePointers } from './pointerCollector';

export const STACK_PREFIXES   = ['stack', 'stk', 'history', 'undo', 'frames'];
export const QUEUE_PREFIXES   = ['queue', 'deque', 'line', 'queue_nodes', 'tasks'];

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

export function detectLinearStructures(
  keys: string[],
  vars: VarMap,
  consumedKeys: Set<string>,
  pointerContext: Record<string, string[]>,
  visualizers: CanvasState[]
) {
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
      keys, vars, list.key, pointerContext, [], list.nodes
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
      keys, vars, stackKey, pointerContext, ['top', 'peek', 'curr']
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
      keys, vars, queueKey, pointerContext, ['front', 'back', 'rear', 'head', 'tail', 'curr']
    );
    const usedKeys = [queueKey, ...ptrKeys];
    usedKeys.forEach(k => consumedKeys.add(k));
    visualizers.push({
      id: queueKey, type: 'queue', usedKeys,
      props: { value: queueVal, pointers },
    });
  });
}
