import React from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';

export interface LLNode {
  id: string; // The memory address or unique identifier
  value: string | number;
}

export interface LinkedListProps {
  nodes: LLNode[];
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

const LinkedList = ({
  nodes = [],
  pointers = [],
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
    <div className="w-full flex flex-col items-start overflow-x-auto styled-scrollbar pb-10 pt-4 px-4">
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
              <React.Fragment key={`fragment-${node.id}`}>
                {/* ─── THE LIST NODE ─── */}
                <motion.div layout variants={cellVariants} exit="exit" className="relative flex flex-col items-center shrink-0">
                  
                  <motion.div
                    layout initial={false}
                    animate={{ scale: activeScale, zIndex: activeZIndex }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={`
                      flex items-stretch font-mono text-[14px] font-medium 
                      rounded-sm border transition-colors duration-200 shadow-sm
                      ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                    `}
                    style={{ height: '3rem', minWidth: '4.5rem' }}
                  >
                    {/* Value Block */}
                    <div className="flex-1 flex items-center justify-center px-3 min-w-[2.5rem]">
                      <AnimatePresence mode="wait">
                        <motion.span key={`val-${safeValToDisplay}`} initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 2 }} transition={{ duration: 0.1 }} className="truncate max-w-[80px]">
                          {safeValToDisplay}
                        </motion.span>
                      </AnimatePresence>
                    </div>

                    {/* Next Pointer Block */}
                    <div className={`w-6 border-l flex items-center justify-center ${borderClass}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${isRead || isWrite || isInsert ? 'bg-current' : 'bg-muted'}`} />
                    </div>
                  </motion.div>

                  {/* Node Address / ID Label */}
                  <span className="absolute -top-4 text-[8px] text-muted font-mono bg-bg/80 px-1 rounded">
                    {node.id}
                  </span>

                  {/* Anchored Pointers (e.g. 'head', 'curr', 'prev') */}
                  <div className="absolute top-full mt-2 flex flex-col items-center gap-1 w-full">
                    <AnimatePresence>
                      {cellPointers.map((ptr) => (
                        <motion.div
                          key={ptr.name} layoutId={`pointer-ll-${ptr.name}`}
                          initial={{ opacity: 0, y: -10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                          className="flex flex-col items-center text-accent-3 z-30"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5 opacity-80 rotate-180">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                          </svg>
                          <span className="text-[9px] font-mono font-bold bg-surface-2 text-accent-3 px-1 rounded border border-accent-3/30 truncate max-w-[60px]">
                            {ptr.name}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* ─── THE CONNECTING ARROW ─── */}
                <motion.div layout variants={cellVariants} className="flex items-center text-border-2 px-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </motion.div>

                {/* ─── THE NULL TERMINATOR (If Last Node) ─── */}
                {isLastNode && (
                  <motion.div layout variants={cellVariants} className="flex items-center justify-center h-12 px-2 shrink-0">
                    <span className="text-[12px] font-mono text-muted font-bold opacity-60 border-b-2 border-muted border-dashed pb-0.5">
                      null
                    </span>
                  </motion.div>
                )}
              </React.Fragment>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LinkedList;