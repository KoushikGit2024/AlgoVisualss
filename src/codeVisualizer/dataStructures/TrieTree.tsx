import { useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TrieNodeData {
  id: string;
  value: string | number;      // The character label (e.g. 'a', 'b', or 'root')
  children: string[];          // IDs of child nodes
  isEnd?: boolean;             // True when this node marks end of a word
}

export interface TrieTreeProps {
  nodes: TrieNodeData[];
  rootId?: string;
  pointers?: { name: string; nodeId: string }[];
  highLightNodes?: string[];
  readNodes?: string[];
  writeNodes?: string[];
  compareNodes?: string[];
  deleteNodes?: string[];
  insertNodes?: string[];
  foundNodes?: string[];
}

// ─── Layout engine ───────────────────────────────────────────────────────────
// Two-pass layout for N-ary trees, rendered left-to-right, top-to-bottom:
//   Pass 1 (BFS):  assign every reachable node a depth level.
//   Pass 2 (DFS):  assign every node a horizontal "slot" — leaves get the next
//                  free integer slot in left-to-right order, and each internal
//                  node is centered over the midpoint of its children's slots.
// The canvas grows with both the leaf count (width) and the depth (height),
// so wide/bushy tries naturally get wider instead of nodes overlapping.

const NODE_DIAMETER = 40;  // px, matches the w-10 h-10 node circle
const H_GAP = 28;          // horizontal gap between adjacent leaf slots
const V_GAP = 78;          // vertical gap between depth levels
const PAD_H = 32;          // horizontal canvas padding
const PAD_TOP = 36;        // vertical canvas padding

interface LayoutResult {
  positions: Map<string, { x: number; y: number }>;
  totalLeaves: number;
  maxDepth: number;
  canvasW: number;
  canvasH: number;
}

function layoutTrie(nodes: TrieNodeData[], rootId: string): LayoutResult {
  const nodeMap = new Map<string, TrieNodeData>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // ── 1. BFS depth pass ─────────────────────────────────────────────────────
  const depths = new Map<string, number>();
  const visited = new Set<string>();
  let maxDepth = 0;

  const q: [string, number][] = [[rootId, 0]];
  while (q.length > 0) {
    const [id, d] = q.shift()!;
    if (visited.has(id)) continue;
    visited.add(id);
    depths.set(id, d);
    if (d > maxDepth) maxDepth = d;
    nodeMap.get(id)?.children.forEach(c => {
      if (!visited.has(c)) q.push([c, d + 1]);
    });
  }

  // ── 2. DFS leaf-counter → x slot ──────────────────────────────────────────
  let leaf = 0;
  const xSlot = new Map<string, number>();

  function place(id: string): number {
    if (!visited.has(id)) return leaf;
    const children = (nodeMap.get(id)?.children ?? []).filter(c => visited.has(c));
    if (children.length === 0) {
      const slot = leaf;
      xSlot.set(id, slot);
      leaf += 1;
      return slot;
    }
    const slots = children.map(place);
    const mid = (Math.min(...slots) + Math.max(...slots)) / 2;
    xSlot.set(id, mid);
    return mid;
  }
  place(rootId);

  const totalLeaves = Math.max(leaf, 1);
  const slotPitch = NODE_DIAMETER + H_GAP;
  const canvasW = PAD_H * 2 + (totalLeaves - 1) * slotPitch + NODE_DIAMETER;
  const canvasH = PAD_TOP * 2 + maxDepth * V_GAP + NODE_DIAMETER;

  // ── 3. Slot → pixel ────────────────────────────────────────────────────────
  const positions = new Map<string, { x: number; y: number }>();
  depths.forEach((depth, id) => {
    const slot = xSlot.get(id) ?? 0;
    positions.set(id, {
      x: PAD_H + slot * slotPitch + NODE_DIAMETER / 2,
      y: PAD_TOP + depth * V_GAP + NODE_DIAMETER / 2,
    });
  });

  return { positions, totalLeaves, maxDepth, canvasW, canvasH };
}

// ─── Component ───────────────────────────────────────────────────────────────

const TrieTree = ({
  nodes = [],
  rootId,
  pointers       = [],
  highLightNodes = [],
  readNodes      = [],
  writeNodes     = [],
  compareNodes   = [],
  deleteNodes    = [],
  insertNodes    = [],
  foundNodes     = [],
}: TrieTreeProps) => {

  const { layout, actualRootId, canvasW, canvasH } = useMemo(() => {
    if (nodes.length === 0) return { layout: null, actualRootId: '', canvasW: 320, canvasH: 180 };

    const childSet = new Set<string>();
    nodes.forEach(n => n.children.forEach(c => childSet.add(c)));
    const rid = rootId ?? nodes.find(n => !childSet.has(n.id))?.id ?? nodes[0].id;
    const r = layoutTrie(nodes, rid);
    return { layout: r.positions, actualRootId: rid, canvasW: r.canvasW, canvasH: r.canvasH };
  }, [nodes, rootId]);

  const nodeVariants: Variants = {
    hidden:  { opacity: 0, scale: 0.35 },
    visible: { opacity: 1, scale: 1,   transition: { type: 'spring', stiffness: 300, damping: 20 } },
    exit:    { opacity: 0, scale: 0.3, transition: { duration: 0.13 } },
  };

  if (nodes.length === 0 || !layout) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <span className="text-muted text-[10px] font-mono border border-dashed border-border rounded p-2">
          Awaiting Trie initialization…
        </span>
      </div>
    );
  }

  return (
    // Scrollable wrapper — allows wide tries to overflow horizontally
    <div className="overflow-auto styled-scrollbar w-full h-full relative">
      {/* Pixel-sized canvas — grows with leaf count (width) and depth (height) */}
      <div className="relative shrink-0" style={{ width: canvasW, height: canvasH }}>

        {/* ── SVG layer: tree-style edges (gentle curve down from parent to child) ── */}
        <svg
          className="absolute inset-0 pointer-events-none z-0"
          width={canvasW}
          height={canvasH}
          style={{ overflow: 'visible' }}
        >
          <AnimatePresence>
            {nodes.map(node => {
              const src = layout.get(node.id);
              if (!src) return null;
              return node.children.map(cId => {
                const tgt = layout.get(cId);
                if (!tgt) return null;

                const active =
                  readNodes.includes(node.id) || readNodes.includes(cId) ||
                  writeNodes.includes(cId)    || insertNodes.includes(cId) ||
                  foundNodes.includes(cId);

                // Branch downward from the bottom of the parent circle to the
                // top of the child circle, with a vertical control offset —
                // this reads as a tree branch rather than a flat S-curve.
                const r = NODE_DIAMETER / 2;
                const startY = src.y + r;
                const endY   = tgt.y - r;
                const midY   = (startY + endY) / 2;
                const d = `M${src.x},${startY} C${src.x},${midY} ${tgt.x},${midY} ${tgt.x},${endY}`;

                return (
                  <motion.path
                    key={`e-${node.id}-${cId}`}
                    d={d}
                    fill="none"
                    stroke={active ? 'var(--accent)' : 'var(--border)'}
                    strokeWidth={active ? 2.2 : 1.6}
                    strokeOpacity={active ? 1 : 0.5}
                    initial={{ opacity: 0, pathLength: 0 }}
                    animate={{ opacity: 1, pathLength: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  />
                );
              });
            })}
          </AnimatePresence>
        </svg>

        {/* ── Node layer ───────────────────────────────────────────────── */}
        <AnimatePresence mode="popLayout">
          {nodes.map(node => {
            const pos = layout.get(node.id);
            if (!pos) return null;

            const isFound   = foundNodes.includes(node.id);
            const isDelete  = deleteNodes.includes(node.id);
            const isInsert  = insertNodes.includes(node.id);
            const isWrite   = writeNodes.includes(node.id);
            const isCompare = compareNodes.includes(node.id);
            const isRead    = readNodes.includes(node.id);
            const isHigh    = highLightNodes.includes(node.id);
            const isRoot    = node.id === actualRootId;

            let bg     = isRoot ? 'bg-surface-2/90' : 'bg-surface/70 backdrop-blur-sm';
            let border = isRoot ? 'border-accent/70' : 'border-border';
            let text   = isRoot ? 'text-accent font-bold' : 'text-text';
            let shadow = '';
            let scale  = 1;
            let zIdx   = isRoot ? 5 : 1;

            if      (isFound)   { bg = 'bg-ds-read/20';  border = 'border-ds-read';  text = 'text-ds-read';  shadow = 'shadow-none'; scale = 1.18; zIdx = 30; }
            else if (isDelete)  { bg = 'bg-failure/10';     border = 'border-failure/80';  text = 'text-failure';     shadow = 'shadow-none';  scale = 0.9;  zIdx = 10; }
            else if (isInsert)  { bg = 'bg-ds-write/20'; border = 'border-ds-write'; text = 'text-ds-write'; shadow = 'shadow-none';  scale = 1.15; zIdx = 25; }
            else if (isWrite)   { bg = 'bg-success/15';     border = 'border-success';     text = 'text-success';     shadow = 'shadow-none';  scale = 1.1;  zIdx = 20; }
            else if (isCompare) { bg = 'bg-orange-500/15';  border = 'border-orange-400';  text = 'text-orange-300';  shadow = 'shadow-none';   scale = 1.05; zIdx = 15; }
            else if (isRead)    { bg = 'bg-accent/15';      border = 'border-accent';      text = 'text-accent';      shadow = 'shadow-none';     scale = 1.05; zIdx = 10; }
            else if (isHigh)    { bg = 'bg-accent-2/20';    border = 'border-accent-2';    text = 'text-accent-2';    zIdx = 5; }

            const cellPtrs = pointers.filter(p => p.nodeId === node.id);

            return (
              <motion.div
                key={`n-${node.id}`}
                variants={nodeVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: pos.x, top: pos.y, zIndex: zIdx }}
              >
                <motion.div
                  layout
                  animate={{ scale }}
                  transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                  className={cn(`
                    w-10 h-10 flex items-center justify-center relative
                    font-mono text-[13px] rounded-full border-2 shrink-0
                    transition-colors duration-150
                    ${bg} ${border} ${text} ${shadow}
                  `)}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`l-${node.id}-${String(node.value)}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.08 }}
                      className="select-none leading-none"
                    >
                      {String(node.value)}
                    </motion.span>
                  </AnimatePresence>

                  {/* End-of-word dot */}
                  {node.isEnd && (
                    <span
                      className="absolute -top-[3px] -right-[3px] w-[10px] h-[10px]
                                 rounded-full bg-accent-3 border border-bg
                                 shadow-[0_0_5px_var(--accent-3)]"
                      title="End of word"
                    />
                  )}
                </motion.div>

                {/* Pointer badges */}
                {cellPtrs.length > 0 && (
                  <div className="absolute top-0 right-0 flex flex-col gap-0.5 z-30
                                  translate-x-[45%] -translate-y-[45%]">
                    <AnimatePresence>
                      {cellPtrs.map(ptr => (
                        <motion.div
                          key={ptr.name}
                          layoutId={`ptr-trie-${ptr.name}`}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="bg-accent-3 text-white shadow-md border border-bg
                                     rounded-full px-1.5 py-[2px]"
                        >
                          <span className="text-[8px] font-mono font-bold leading-none uppercase tracking-wider">
                            {ptr.name}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Legend ────────────────────────────────────────────────────── */}
      {/* <div className="sticky bottom-1 left-2 flex items-center gap-2 z-20 pointer-events-none w-fit">
        <span className="flex items-center gap-1 text-[9px] font-mono text-muted bg-bg/70 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="w-2 h-2 rounded-full bg-accent-3 border border-bg shadow-sm inline-block" />
          end of word
        </span>
      </div> */}
    </div>
  );
};

export default TrieTree;