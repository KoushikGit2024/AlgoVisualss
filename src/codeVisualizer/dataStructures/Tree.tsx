import { useMemo, useRef } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TreeNode {
  id: string;
  value: string | number;
  left?: string | null;
  right?: string | null;
  __raw?: any;
}

export interface TreeProps {
  nodes: TreeNode[];
  rootId?: string;
  pointers?: { name: string; nodeId: string }[];
  highLightNodes?: string[];
  readNodes?: string[];
  writeNodes?: string[];
  compareNodes?: string[];
  swapNodes?: string[];
  deleteNodes?: string[];
  insertNodes?: string[];
  foundNodes?: string[];
}

// ─── Auto-detect tree kind from __raw metadata ───────────────────────────────

type TreeKind = "segment" | "avl" | "redblack" | "generic";

function detectTreeKind(nodes: TreeNode[]): TreeKind {
  const sample = nodes.find((n) => n.__raw)?.__raw;
  if (!sample) return "generic";
  if ("start" in sample && "end" in sample) return "segment";
  if ("l" in sample && "r" in sample) return "segment";
  if ("height" in sample) return "avl";
  if ("color" in sample || "colour" in sample) return "redblack";
  return "generic";
}

interface NodeMeta {
  rangeLabel?: string;
  subLabel?: string;
  colorTag?: "red" | "black";
}

function extractMeta(raw: any, kind: TreeKind): NodeMeta {
  if (!raw) return {};
  const meta: NodeMeta = {};

  if (kind === "segment") {
    if ("start" in raw && "end" in raw) meta.rangeLabel = `[${raw.start}, ${raw.end}]`;
    else if ("l" in raw && "r" in raw) meta.rangeLabel = `[${raw.l}, ${raw.r}]`;
  }

  if (kind === "avl") {
    const h = raw.height ?? raw.h;
    const bf = raw.balance ?? raw.balanceFactor ?? raw.bf;
    const parts: string[] = [];
    if (h !== undefined) parts.push(`h:${h}`);
    if (bf !== undefined) parts.push(`bf:${bf}`);
    if (parts.length) meta.subLabel = parts.join("  ");
  }

  if (kind === "redblack") {
    const c = raw.color ?? raw.colour;
    if (c === "red" || c === 1 || c === "RED") meta.colorTag = "red";
    else if (c === "black" || c === 0 || c === "BLACK") meta.colorTag = "black";
  }

  return meta;
}

// ─── Layout Engine ───────────────────────────────────────────────────────────

function buildLayout(nodes: TreeNode[], rootId?: string) {
  const nodeMap = new Map<string, TreeNode>();
  const childSet = new Set<string>();

  nodes.forEach((n) => {
    nodeMap.set(n.id, n);
    if (n.left) childSet.add(n.left);
    if (n.right) childSet.add(n.right);
  });

  let actualRootId = rootId;
  if (!actualRootId && nodes.length > 0) {
    const rootNode = nodes.find((n) => !childSet.has(n.id));
    actualRootId = rootNode ? rootNode.id : nodes[0].id;
  }

  const layout = new Map<string, { x: number; y: number }>();
  let xRank = 0;
  let maxDepth = 0;

  const traverse = (id: string | null | undefined, depth: number) => {
    if (!id) return;
    const node = nodeMap.get(id);
    if (!node) return;
    if (depth > maxDepth) maxDepth = depth;
    traverse(node.left, depth + 1);
    layout.set(id, { x: xRank++, y: depth });
    traverse(node.right, depth + 1);
  };
  traverse(actualRootId, 0);

  const xStep = xRank > 1 ? Math.min(80 / (xRank - 1), 13) : 0;
  const totalW = (xRank > 1 ? xRank - 1 : 0) * xStep;
  const startX = 50 - totalW / 2;

  const yStep = maxDepth > 0 ? Math.min(75 / maxDepth, 20) : 0;
  const startY = 14;

  const finalLayout = new Map<string, { x: number; y: number }>();
  layout.forEach((pos, id) => {
    finalLayout.set(id, {
      x: xRank === 1 ? 50 : startX + pos.x * xStep,
      y: maxDepth === 0 ? 50 : startY + pos.y * yStep,
    });
  });

  return { finalLayout, nodeMap, treeWidth: totalW, treeDepth: maxDepth };
}

// ─── Component ───────────────────────────────────────────────────────────────

const Tree = ({
  nodes = [],
  rootId,
  pointers = [],
  highLightNodes = [],
  readNodes = [],
  writeNodes = [],
  compareNodes = [],
  swapNodes = [],
  deleteNodes = [],
  insertNodes = [],
  foundNodes = [],
}: TreeProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const treeKind = useMemo(() => detectTreeKind(nodes), [nodes]);

  const { finalLayout, treeWidth, treeDepth } = useMemo(
    () => buildLayout(nodes, rootId),
    [nodes, rootId]
  );

  const getPos = (id: string) => finalLayout.get(id) ?? { x: 50, y: 50 };
  const isLarge = treeWidth > 80 || treeDepth > 5;

  const kindLabel: Record<TreeKind, string> = {
    segment: "Segment Tree",
    avl: "AVL Tree",
    redblack: "Red-Black Tree",
    generic: "",
  };

  const nodeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.4, y: -15 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 24 } },
    exit: { opacity: 0, scale: 0.4, transition: { duration: 0.15 } },
  };

  if (!nodes || nodes.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <span className="text-muted text-[10px] font-mono border border-dashed border-border rounded p-2">
          Awaiting valid Tree initialization...
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-w-[350px] min-h-[420px] flex items-center justify-center overflow-hidden bg-bg/40"
    >
      {treeKind !== "generic" && (
        <div className="absolute top-2 left-2 z-50 pointer-events-none">
          <span className="text-[9px] font-mono uppercase tracking-widest text-muted/60 border border-border/40 rounded px-1.5 py-0.5">
            {kindLabel[treeKind]}
          </span>
        </div>
      )}

      <motion.div
        className="absolute inset-0 w-full h-full"
        drag
        dragConstraints={containerRef}
        dragElastic={isLarge ? 0.15 : 0}
        dragMomentum={false}
        whileTap={{ cursor: "grabbing" }}
        style={{ cursor: isLarge ? "grab" : "default" }}
      >
        {/* SVG Edge Layer */}
        <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
          <AnimatePresence>
            {nodes.map((node) => {
              const src = getPos(node.id);
              const edges: React.ReactNode[] = [];
              const isSegTree = treeKind === "segment";

              for (const [childId, label] of [
                [node.left, "L"],
                [node.right, "R"],
              ] as [string | null | undefined, string][]) {
                if (!childId || !finalLayout.has(childId)) continue;
                const tgt = getPos(childId);
                edges.push(
                  <g key={`${node.id}-${childId}`}>
                    <motion.line
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      x1={`${src.x}%`} y1={`${src.y}%`}
                      x2={`${tgt.x}%`} y2={`${tgt.y}%`}
                      className="stroke-border transition-colors duration-300"
                      strokeWidth={isSegTree ? 1.5 : 2}
                      strokeDasharray={isSegTree ? "4 2" : undefined}
                    />
                    {isSegTree && (
                      <text
                        x={`${(src.x + tgt.x) / 2}%`}
                        y={`${(src.y + tgt.y) / 2}%`}
                        className="fill-muted"
                        fontSize="8"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        opacity={0.5}
                      >
                        {label}
                      </text>
                    )}
                  </g>
                );
              }
              return edges;
            })}
          </AnimatePresence>
        </svg>

        {/* HTML Node Layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <AnimatePresence mode="popLayout">
            {nodes.map((node) => {
              const meta = extractMeta(node.__raw, treeKind);

              const isDelete    = deleteNodes?.includes(node.id);
              const isSwap      = swapNodes?.includes(node.id);
              const isWrite     = writeNodes?.includes(node.id);
              const isInsert    = insertNodes?.includes(node.id);
              const isFound     = foundNodes?.includes(node.id);
              const isCompare   = compareNodes?.includes(node.id);
              const isRead      = readNodes?.includes(node.id);
              const isHighlight = highLightNodes?.includes(node.id);

              let bg     = meta.colorTag === "red"   ? "bg-red-500/15"
                         : meta.colorTag === "black" ? "bg-zinc-800/40"
                         : "bg-surface";
              let border = meta.colorTag === "red"   ? "border-red-500"
                         : meta.colorTag === "black" ? "border-zinc-500"
                         : "border-border";
              let text   = "text-text";
              let shadow = "shadow-sm";
              let scale  = 1;
              let zIdx   = 1;

              if      (isFound)     { bg = "bg-purple-500/20";  border = "border-purple-500";  text = "text-purple-400";  shadow = "shadow-[0_0_12px_#a855f7]"; scale = 1.12; zIdx = 30; }
              else if (isDelete)    { bg = "bg-failure/10";      border = "border-failure/80";  text = "text-failure";     shadow = "shadow-[0_0_6px_var(--failure)]"; scale = 0.93; zIdx = 10; }
              else if (isSwap)      { bg = "bg-accent-3/15";     border = "border-accent-3";    text = "text-accent-3";    shadow = "shadow-[0_0_6px_var(--accent-3)]"; scale = 1.06; zIdx = 20; }
              else if (isInsert)    { bg = "bg-emerald-500/20";  border = "border-emerald-500"; text = "text-emerald-400"; shadow = "shadow-[0_0_10px_#10b981]"; scale = 1.10; zIdx = 25; }
              else if (isWrite)     { bg = "bg-success/15";      border = "border-success";     text = "text-success";     shadow = "shadow-[0_0_6px_var(--success)]"; scale = 1.06; zIdx = 20; }
              else if (isCompare)   { bg = "bg-orange-500/15";   border = "border-orange-500";  text = "text-orange-400";  shadow = "shadow-[0_0_6px_#f97316]"; scale = 1.03; zIdx = 15; }
              else if (isRead)      { bg = "bg-accent/15";       border = "border-accent";      text = "text-accent";      shadow = "shadow-[0_0_6px_var(--glow)]"; scale = 1.03; zIdx = 10; }
              else if (isHighlight) { border = "border-accent-2"; text = "text-accent-2"; zIdx = 5; }

              const pos      = getPos(node.id);
              const dispVal  = typeof node.value === "object" ? JSON.stringify(node.value) : String(node.value);
              const cellPtrs = pointers.filter((p) => p.nodeId === node.id);
              const nodeSize = treeKind === "segment" ? "w-10 h-10 text-[11px]" : "w-12 h-12 text-[13px]";

              return (
                <motion.div
                  key={`node-${node.id}`}
                  variants={nodeVariants} initial="hidden" animate="show" exit="exit"
                  className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, zIndex: zIdx }}
                >
                  {/* Range label above node (Segment Tree) */}
                  {meta.rangeLabel && (
                    <div className="mb-0.5 pointer-events-none">
                      <span className="text-[8px] font-mono font-semibold text-accent/70 whitespace-nowrap bg-accent/5 border border-accent/20 px-1 rounded">
                        {meta.rangeLabel}
                      </span>
                    </div>
                  )}

                  {/* Main node circle */}
                  <motion.div
                    layout
                    animate={{ scale, zIndex: zIdx }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                      ${nodeSize}
                      flex items-center justify-center font-mono font-bold
                      rounded-full border-[1.5px] transition-colors duration-200
                      backdrop-blur-sm shrink-0
                      ${bg} ${border} ${text} ${shadow}
                    `}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`v-${dispVal}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.08 }}
                      >
                        {dispVal}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>

                  {/* Sub-label below node (AVL height, balance factor) */}
                  {meta.subLabel && (
                    <div className="mt-0.5 pointer-events-none">
                      <span className="text-[8px] font-mono text-muted/70 whitespace-nowrap">
                        {meta.subLabel}
                      </span>
                    </div>
                  )}

                  {/* Corner pointer badges */}
                  {cellPtrs.length > 0 && (
                    <div className="absolute top-0 right-0 flex flex-col gap-0.5 z-30 translate-x-[45%] translate-y-[-45%]">
                      <AnimatePresence>
                        {cellPtrs.map((ptr) => (
                          <motion.div
                            key={ptr.name}
                            layoutId={`ptr-tree-${ptr.name}`}
                            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                            className="bg-accent-3 text-white shadow-md border border-bg rounded-full px-1.5 py-[2px] flex items-center justify-center"
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
      </motion.div>

      {/* Pan hint for large trees */}
      {isLarge && (
        <div className="absolute bottom-2 right-2 z-50 pointer-events-none opacity-40">
          <span className="text-[8px] font-mono text-muted">drag to pan</span>
        </div>
      )}
    </div>
  );
};

export default Tree;
