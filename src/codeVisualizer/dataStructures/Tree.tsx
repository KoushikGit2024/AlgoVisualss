import { useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export interface TreeNode {
  id: string;
  value: string | number;
  left?: string | null;  // ID of the left child
  right?: string | null; // ID of the right child
}

export interface TreeProps {
  nodes: TreeNode[];
  rootId?: string; // Optional: Will auto-detect if omitted
  pointers?: { name: string; nodeId: string }[];
  
  // Highlighting Operations
  highLightNodes?: string[];
  readNodes?: string[];
  writeNodes?: string[];
  compareNodes?: string[];
  swapNodes?: string[];
  deleteNodes?: string[];
  insertNodes?: string[];
  foundNodes?: string[];
}

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

  // ─── Auto-Layout Engine (Hierarchical) ──────────────────────────────────
  const layoutInfo = useMemo(() => {
    const nodeMap = new Map<string, TreeNode>();
    const childSet = new Set<string>();

    // 1. Build relations and identify children
    nodes.forEach(n => {
      nodeMap.set(n.id, n);
      if (n.left) childSet.add(n.left);
      if (n.right) childSet.add(n.right);
    });

    // 2. Find the Root Node
    let actualRootId = rootId;
    if (!actualRootId && nodes.length > 0) {
      const rootNode = nodes.find(n => !childSet.has(n.id));
      actualRootId = rootNode ? rootNode.id : nodes[0].id;
    }

    const layout = new Map<string, { x: number; y: number }>();
    let xRank = 0;
    let maxDepth = 0;

    // 3. In-Order Traversal for perfect Binary Tree X-spacing
    const traverse = (nodeId: string | null | undefined, depth: number) => {
      if (!nodeId) return;
      const node = nodeMap.get(nodeId);
      if (!node) return;

      if (depth > maxDepth) maxDepth = depth;

      // Traverse Left
      traverse(node.left, depth + 1);

      // Process Current
      layout.set(nodeId, { x: xRank++, y: depth });

      // Traverse Right
      traverse(node.right, depth + 1);
    };

    traverse(actualRootId, 0);

    // 4. Normalize coordinates to percentages (10% to 90% of the canvas)
    const xStep = xRank > 1 ? 80 / (xRank - 1) : 0;
    const yStep = maxDepth > 0 ? 70 / maxDepth : 0; // 70 to leave room at the bottom

    const finalLayout = new Map<string, { x: number; y: number }>();
    layout.forEach((pos, id) => {
      finalLayout.set(id, {
        x: xRank === 1 ? 50 : 10 + pos.x * xStep,
        y: maxDepth === 0 ? 50 : 15 + pos.y * yStep,
      });
    });

    return { finalLayout, nodeMap };
  }, [nodes, rootId]);

  const getNodePos = (id: string) => layoutInfo.finalLayout.get(id) || { x: 50, y: 50 };

  // ─── Animation Variants ───
  const nodeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5, y: -20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.2 } }
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
    <div className="relative w-full h-full min-h-[450px] flex items-center justify-center p-4 overflow-hidden">
      
      {/* ─── 1. SVG LAYER (Edges) ─── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
        <AnimatePresence>
          {nodes.map((node) => {
            const sourcePos = getNodePos(node.id);
            const edges = [];

            if (node.left && layoutInfo.finalLayout.has(node.left)) {
              const targetPos = getNodePos(node.left);
              edges.push(
                <motion.line
                  key={`${node.id}-${node.left}`}
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  x1={`${sourcePos.x}%`} y1={`${sourcePos.y}%`}
                  x2={`${targetPos.x}%`} y2={`${targetPos.y}%`}
                  className="stroke-border-2 transition-colors duration-300"
                  strokeWidth="2"
                />
              );
            }
            if (node.right && layoutInfo.finalLayout.has(node.right)) {
              const targetPos = getNodePos(node.right);
              edges.push(
                <motion.line
                  key={`${node.id}-${node.right}`}
                  initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  x1={`${sourcePos.x}%`} y1={`${sourcePos.y}%`}
                  x2={`${targetPos.x}%`} y2={`${targetPos.y}%`}
                  className="stroke-border-2 transition-colors duration-300"
                  strokeWidth="2"
                />
              );
            }
            return edges;
          })}
        </AnimatePresence>
      </svg>

      {/* ─── 2. HTML LAYER (Nodes) ─── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence mode="popLayout">
          {nodes.map((node) => {
            const isDelete = deleteNodes?.includes(node.id);
            const isSwap = swapNodes?.includes(node.id);
            const isWrite = writeNodes?.includes(node.id);
            const isInsert = insertNodes?.includes(node.id);
            const isFound = foundNodes?.includes(node.id);
            const isCompare = compareNodes?.includes(node.id);
            const isRead = readNodes?.includes(node.id);
            const isHighlight = highLightNodes?.includes(node.id);

            const cellPointers = pointers?.filter((p) => p.nodeId === node.id) || [];

            let bgClass = "bg-surface"; let borderClass = "border-border"; let textClass = "text-text";
            let shadowClass = "shadow-sm"; let activeScale = 1; let activeZIndex = 1;

            if (isFound) {
              bgClass = "bg-purple-500/20"; borderClass = "border-purple-500"; textClass = "text-purple-400";
              shadowClass = "shadow-[0_0_12px_#a855f7]"; activeScale = 1.1; activeZIndex = 30;
            } else if (isDelete) {
              bgClass = "bg-failure/10"; borderClass = "border-failure/80"; textClass = "text-failure";
              shadowClass = "shadow-[0_0_6px_var(--failure)]"; activeScale = 0.95; activeZIndex = 10;
            } else if (isSwap) {
              bgClass = "bg-accent-3/15"; borderClass = "border-accent-3"; textClass = "text-accent-3";
              shadowClass = "shadow-[0_0_6px_var(--accent-3)]"; activeScale = 1.05; activeZIndex = 20;
            } else if (isInsert) {
              bgClass = "bg-emerald-500/20"; borderClass = "border-emerald-500"; textClass = "text-emerald-500";
              shadowClass = "shadow-[0_0_8px_#10b981]"; activeScale = 1.08; activeZIndex = 25;
            } else if (isWrite) {
              bgClass = "bg-success/15"; borderClass = "border-success"; textClass = "text-success";
              shadowClass = "shadow-[0_0_6px_var(--success)]"; activeScale = 1.05; activeZIndex = 20;
            } else if (isCompare) {
              bgClass = "bg-orange-500/15"; borderClass = "border-orange-500"; textClass = "text-orange-500";
              shadowClass = "shadow-[0_0_6px_#f97316]"; activeScale = 1.02; activeZIndex = 15;
            } else if (isRead) {
              bgClass = "bg-accent/15"; borderClass = "border-accent"; textClass = "text-accent";
              shadowClass = "shadow-[0_0_6px_var(--glow)]"; activeScale = 1.02; activeZIndex = 10;
            } else if (isHighlight) {
              bgClass = "bg-accent-2/20"; borderClass = "border-accent-2"; textClass = "text-accent-2"; activeZIndex = 5;
            }

            const pos = getNodePos(node.id);
            const safeValToDisplay = typeof node.value === 'object' ? JSON.stringify(node.value) : String(node.value);

            return (
              <motion.div
                key={`node-${node.id}`} variants={nodeVariants} initial="hidden" animate="show" exit="exit"
                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <motion.div
                  layout initial={false} animate={{ scale: activeScale, zIndex: activeZIndex }} transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`
                    w-12 h-12 flex items-center justify-center font-mono text-[14px] font-bold 
                    rounded-full border transition-colors duration-200 shrink-0
                    ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                  `}
                >
                  <AnimatePresence mode="wait">
                    <motion.span key={`val-${safeValToDisplay}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                      {safeValToDisplay}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                {/* Corner Anchored Pointers */}
                <div className="absolute top-0 right-0 flex flex-col gap-0.5 z-30 translate-x-[40%] translate-y-[-40%] pointer-events-none">
                  <AnimatePresence>
                    {cellPointers.map((ptr) => (
                      <motion.div
                        key={ptr.name} layoutId={`pointer-tree-${ptr.name}`}
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tree;