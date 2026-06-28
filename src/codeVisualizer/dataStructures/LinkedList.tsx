import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export interface LLNode {
  id: string; // The memory address or unique identifier
  value: string | number;
}

export interface LinkedListProps {
  nodes: LLNode[];
  pointers?: { name: string; nodeId: string }[];
  cycleTo?: string;
  isDoublyLinked?: boolean;
  
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

const LinkedList = ({
  nodes = [],
  pointers = [],
  cycleTo,
  isDoublyLinked = false,
  highLightNodes = [],
  readNodes = [],
  writeNodes = [],
  compareNodes = [],
  swapNodes = [],
  deleteNodes = [],
  insertNodes = [],
  foundNodes = [],
}: LinkedListProps) => {

  // 1. Bulletproof validation
  const safeNodes = Array.isArray(nodes) ? nodes : [];
  
  const [cyclePath, setCyclePath] = React.useState("");

  React.useLayoutEffect(() => {
    if (!cycleTo || safeNodes.length === 0) {
      setCyclePath("");
      return;
    }
    
    // Allow React layout to settle
    const timer = setTimeout(() => {
      const targetNode = document.getElementById(`ll-node-${cycleTo}`);
      const lastNode = document.getElementById(`ll-node-${safeNodes[safeNodes.length - 1].id}`);
      
      if (targetNode && lastNode) {
        const p1x = lastNode.offsetLeft + lastNode.offsetWidth / 2;
        const p1y = lastNode.offsetTop + 48; // Bottom of the node block
        
        const p2x = targetNode.offsetLeft + targetNode.offsetWidth / 2;
        const p2y = targetNode.offsetTop + 48;
        
        const dx = Math.abs(p1x - p2x);
        const depth = Math.max(50, dx * 0.3);
        
        // Draw cubic bezier curve looping down
        const cp1x = p1x;
        const cp1y = p1y + depth;
        const cp2x = p2x;
        const cp2y = p2y + depth;
        
        setCyclePath(`M ${p1x} ${p1y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2x} ${p2y}`);
      }
    }, 50); // slight delay for framer-motion settling
    
    return () => clearTimeout(timer);
  }, [cycleTo, safeNodes]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const cellVariants: Variants = {
    hidden: { opacity: 0, x: -20, scale: 0.9 },
    show: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
    exit: { opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.2 } }
  };

  if (safeNodes.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-muted text-[10px] font-mono border border-dashed border-border rounded p-2">
          Awaiting valid Linked List initialization...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start overflow-x-auto styled-scrollbar pb-16 pt-4 px-4 relative">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex items-center gap-2 relative min-w-max">
        <AnimatePresence mode="popLayout">
          {safeNodes.map((node, idx) => {
            const isDelete = deleteNodes?.includes(node.id);
            const isSwap = swapNodes?.includes(node.id);
            const isWrite = writeNodes?.includes(node.id);
            const isInsert = insertNodes?.includes(node.id);
            const isFound = foundNodes?.includes(node.id);
            const isCompare = compareNodes?.includes(node.id);
            const isRead = readNodes?.includes(node.id);
            const isHighlight = highLightNodes?.includes(node.id);

            const cellPointers = pointers?.filter((p) => p.nodeId === node.id) || [];
            const isLastNode = idx === safeNodes.length - 1;

            // Dynamic Styling
            let bgClass = "bg-surface";
            let borderClass = "border-border";
            let textClass = "text-text";
            let shadowClass = "shadow-sm";
            let activeScale = 1;
            let activeZIndex = 1;

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
              bgClass = "bg-accent-2/20"; borderClass = "border-accent-2"; textClass = "text-accent-2";
              activeZIndex = 5;
            }

            const safeValToDisplay = typeof node.value === 'object' ? JSON.stringify(node.value) : String(node.value);

            return (
              <motion.div key={node.id} layout variants={cellVariants} initial="hidden" animate="show" exit="exit" className="flex items-center gap-2">
                {/* ─── THE FRONT NULL TERMINATOR (If First Node & Doubly Linked) ─── */}
                {isDoublyLinked && idx === 0 && (
                  <>
                    <motion.div layout className="flex items-center justify-center shrink-0 opacity-60">
                      <div className="flex items-center justify-center px-2 py-0.5 rounded bg-surface border-2 border-dashed border-border-2 shadow-sm">
                        <span className="text-[10px] font-mono font-bold text-muted">NULL</span>
                      </div>
                    </motion.div>
                    
                    <motion.div layout className="flex items-center justify-center w-8 shrink-0 relative z-0">
                      <motion.svg width="32" height="24" viewBox="0 0 32 24" fill="none" className="absolute">
                        <motion.path 
                          d="M0 12 L32 12" 
                          stroke="currentColor" 
                          className="text-border-2 opacity-70" 
                          strokeWidth="2" 
                          markerEnd="url(#normalArrowhead)" 
                          markerStart="url(#reverseArrowhead)"
                          initial={{ pathLength: 0, opacity: 0 }} 
                          animate={{ pathLength: 1, opacity: 1 }} 
                          transition={{ duration: 0.3 }}
                        />
                      </motion.svg>
                    </motion.div>
                  </>
                )}

                {/* ─── THE LIST NODE ─── */}
                <motion.div id={`ll-node-${node.id}`} layout className="relative flex flex-col items-center shrink-0 mt-8 mb-6">
                  
                  {/* Anchored Pointers (e.g. 'head', 'slow', 'fast') */}
                  <div className="absolute -top-14 flex items-end justify-center gap-1.5 w-full flex-wrap pointer-events-none">
                    <AnimatePresence>
                      {cellPointers.map((ptr) => (
                        <motion.div
                          key={ptr.name} layoutId={`pointer-ll-${ptr.name}`}
                          initial={{ opacity: 0, y: -10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                          className="flex flex-col items-center text-accent-3 z-30 pointer-events-auto"
                        >
                          <span className="text-[10px] font-mono font-bold bg-surface-2 text-accent-3 px-1.5 py-0.5 rounded shadow-sm border border-accent-3/30 truncate max-w-[70px]">
                            {ptr.name}
                          </span>
                          <div className="w-0.5 h-3 bg-accent-3/70 rounded-full mt-0.5 mb-0.5" />
                          <div className="w-2 h-2 rounded-full bg-accent-3 shadow-[0_0_6px_var(--accent-3)]" />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <motion.div
                    layout initial={false}
                    animate={{ scale: activeScale, zIndex: activeZIndex }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                      flex items-stretch font-mono text-[14px] font-medium 
                      rounded-md border-2 transition-colors duration-200 shadow-md
                      ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                      overflow-hidden
                    `}
                    style={{ height: '3.2rem', minWidth: '5rem' }}
                  >
                    {/* Prev Pointer Block (Doubly Linked) */}
                    {isDoublyLinked && (
                      <div className={`w-8 border-r-2 flex flex-col items-center justify-center bg-surface/60 ${borderClass}`}>
                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isRead || isWrite || isInsert ? 'bg-current shadow-current' : 'bg-muted/80 shadow-none'}`} />
                      </div>
                    )}

                    {/* Value Block */}
                    <div className="flex-1 flex items-center justify-center px-4 min-w-[3rem] bg-bg/40 backdrop-blur-sm">
                      <AnimatePresence mode="wait">
                        <motion.span key={`val-${safeValToDisplay}`} initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 2 }} transition={{ duration: 0.1 }} className="truncate max-w-[80px]">
                          {safeValToDisplay}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    {/* Next Pointer Block */}
                    <div className={`w-8 border-l-2 flex flex-col items-center justify-center bg-surface/60 ${borderClass}`}>
                      <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${isRead || isWrite || isInsert ? 'bg-current shadow-current' : 'bg-muted/80 shadow-none'}`} />
                    </div>
                  </motion.div>

                  {/* Node Address / ID Label */}
                  {/* <span className="absolute -bottom-6 text-[9px] text-muted font-mono bg-bg/80 px-1 rounded border border-border/50">
                    {node.id}
                  </span> */}
                </motion.div>

                {/* ─── THE CONNECTING ARROW ─── */}
                <motion.div layout className="flex items-center justify-center w-10 shrink-0 relative z-0">
                  <motion.svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="absolute">
                    <defs>
                      <marker id="normalArrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L6,3 L0,6 Z" className="fill-border-2" />
                      </marker>
                      <marker id="reverseArrowhead" markerWidth="6" markerHeight="6" refX="1" refY="3" orient="auto" markerUnits="strokeWidth">
                        <path d="M6,0 L0,3 L6,6 Z" className="fill-border-2" />
                      </marker>
                    </defs>
                    <motion.path 
                      d="M0 12 L36 12" 
                      stroke="currentColor" 
                      className="text-border-2 opacity-70" 
                      strokeWidth="2" 
                      markerEnd="url(#normalArrowhead)" 
                      markerStart={isDoublyLinked ? "url(#reverseArrowhead)" : undefined}
                      initial={{ pathLength: 0, opacity: 0 }} 
                      animate={{ pathLength: 1, opacity: 1 }} 
                      transition={{ duration: 0.3 }}
                    />
                  </motion.svg>
                </motion.div>

                {/* ─── THE NULL TERMINATOR (If Last Node) ─── */}
                {isLastNode && (
                  <motion.div layout className="flex items-center justify-center shrink-0 opacity-60">
                    <div className="flex items-center justify-center px-2 py-0.5 rounded bg-surface border-2 border-dashed border-border-2 shadow-sm">
                      <span className="text-[10px] font-mono font-bold text-muted">NULL</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ─── CYCLE SVG OVERLAY ─── */}
        <AnimatePresence>
          {cyclePath && (
            <motion.svg
              initial={{ opacity: 0, pathLength: 0 }}
              animate={{ opacity: 1, pathLength: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 overflow-visible"
            >
            <defs>
              <marker
                id="cycleArrowhead"
                markerWidth="6"
                markerHeight="6"
                refX="5"
                refY="3"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent-3, #f43f5e)" />
              </marker>
            </defs>
            <motion.path
              d={cyclePath}
              fill="none"
              stroke="var(--accent-3, #f43f5e)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="6 6"
              markerEnd="url(#cycleArrowhead)"
              className="opacity-70 drop-shadow-sm"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LinkedList;