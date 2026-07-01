import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface QueueProps {
  value: (number | string)[];
  pointers?: { name: string; index: number }[];
  
  // Highlighting Operations
  highLightIndices?: number[];
  readIndices?: number[];   // E.g., reading front()
  writeIndices?: number[];
  compareIndices?: number[];
  deleteIndices?: number[]; // E.g., pop() - Item exiting left
  insertIndices?: number[]; // E.g., push() - Item entering right
  foundIndices?: number[];
}

const Queue = ({
  value = [],
  pointers = [],
  highLightIndices = [],
  readIndices = [],
  writeIndices = [],
  compareIndices = [],
  deleteIndices = [],
  insertIndices = [],
  foundIndices = [],
}: QueueProps) => {

  // 1. Bulletproof validation
  const safeValue = Array.isArray(value) ? value : [];

  // ─── Directional FIFO Animations ───
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  // Enqueue slides from right (+x), Dequeue slides to left (-x)
  const cellVariants: Variants = {
    hidden: { opacity: 0, x: 30, scale: 0.9 }, // Enter from Rear
    show: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } },
    exit: { opacity: 0, x: -40, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } } // Exit from Front
  };

  if (safeValue.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-muted text-[10px] font-mono border border-dashed border-border rounded p-2 flex items-center gap-2">
          {/* <span>Front &larr;</span> */}
          <span className="opacity-50">Empty Queue</span>
          {/* <span>&larr; Rear</span> */}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center overflow-x-auto styled-scrollbar pb-8 pt-24 px-4">
      
      {/* ─── Queue Tube Container ─── */}
      <div className="relative flex items-center min-w-[200px] min-h-[5rem] mx-24">
        
        {/* The Queue Track (Clean Pipe) */}
        <div className="absolute inset-y-[-16px] -inset-x-12 border-y-2 border-accent/40 bg-surface-2/10 rounded-sm pointer-events-none" />

        {/* Structural Indicators (Front / Rear Labels) */}
        <div className="absolute -left-20 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black font-mono text-ds-write uppercase tracking-widest bg-emerald-400/10 px-2 py-0.5 rounded border border-ds-write/30 mb-1">Front</span>
          {/* <span className="text-ds-write/70 text-xs font-black tracking-widest animate-pulse">← OUT</span> */}
        </div>

        <div className="absolute -right-20 flex flex-col items-center justify-center">
          <span className="text-[10px] font-black font-mono text-accent-3 uppercase tracking-widest bg-accent-3/10 px-2 py-0.5 rounded border border-accent-3/30 mb-1">Rear</span>
          {/* <span className="text-accent-3/70 text-xs font-black tracking-widest animate-pulse">IN ←</span> */}
        </div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex items-center gap-2 relative z-10 px-2 w-full justify-start">
          <AnimatePresence mode="popLayout">
            {safeValue.map((val, idx) => {
              const isDelete = deleteIndices?.includes(idx);
              const isWrite = writeIndices?.includes(idx);
              const isInsert = insertIndices?.includes(idx);
              const isFound = foundIndices?.includes(idx);
              const isCompare = compareIndices?.includes(idx);
              const isRead = readIndices?.includes(idx);
              const isHighlight = highLightIndices?.includes(idx);

              const cellPointers = pointers?.filter((p) => p.index === idx) || [];

              // Dynamic Styling
              let bgClass = "bg-surface";
              let borderClass = "border-border";
              let textClass = "text-text";
              let shadowClass = "shadow-sm";
              let activeScale = 1;
              let activeZIndex = 1;

              if (isFound) {
                bgClass = "bg-ds-read/20"; borderClass = "border-ds-read"; textClass = "text-ds-read";
                shadowClass = "shadow-none"; activeScale = 1.1; activeZIndex = 30;
              } else if (isDelete) {
                bgClass = "bg-failure/20"; borderClass = "border-failure"; textClass = "text-failure";
                shadowClass = "shadow-none"; activeScale = 0.95; activeZIndex = 10;
              } else if (isInsert) {
                bgClass = "bg-ds-write/20"; borderClass = "border-ds-write"; textClass = "text-ds-write";
                shadowClass = "shadow-none"; activeScale = 1.08; activeZIndex = 25;
              } else if (isWrite) {
                bgClass = "bg-success/20"; borderClass = "border-success"; textClass = "text-success";
                shadowClass = "shadow-none"; activeScale = 1.05; activeZIndex = 20;
              } else if (isCompare) {
                bgClass = "bg-orange-500/20"; borderClass = "border-orange-500"; textClass = "text-orange-500";
                shadowClass = "shadow-none"; activeScale = 1.02; activeZIndex = 15;
              } else if (isRead) {
                bgClass = "bg-accent/20"; borderClass = "border-accent"; textClass = "text-accent";
                shadowClass = "shadow-none"; activeScale = 1.02; activeZIndex = 10;
              } else if (isHighlight) {
                bgClass = "bg-accent-2/20"; borderClass = "border-accent-2"; textClass = "text-accent-2";
                activeZIndex = 5;
              }

              const safeValToDisplay = typeof val === 'object' ? JSON.stringify(val) : String(val);

              return (
                <motion.div key={`queue-cell-${val}-${idx}`} layout variants={cellVariants} className="flex flex-col items-center relative flex-1 min-w-[3rem] max-w-[4.5rem]">
                  
                  {/* Top Pointers (Front/Rear/Indices) */}
                  <div className="absolute bottom-full mb-1.5 flex flex-col items-center gap-0.5 w-full">
                    <AnimatePresence>
                      {cellPointers.map((ptr) => (
                        <motion.div
                          key={ptr.name} layoutId={`pointer-queue-${ptr.name}`}
                          initial={{ opacity: 0, y: 5, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                          className="flex flex-col items-center text-accent-3 z-30"
                        >
                          <span className="text-[9px] font-mono font-bold bg-surface-2 text-accent-3 px-1.5 py-[1px] rounded border border-accent-3/30 truncate max-w-full">
                            {ptr.name}
                          </span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 opacity-80">
                            <path d="M12 5v14M19 12l-7 7-7-7" />
                          </svg>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {/* Main Data Cell */}
                  <motion.div
                    layout
                    initial={false}
                    animate={{ scale: activeScale, zIndex: activeZIndex }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(`
                      w-full aspect-square px-1 flex items-center justify-center font-mono text-[15px] font-bold 
                      rounded-md border transition-colors duration-200 shrink-0
                      ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                    `)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`val-${safeValToDisplay}`}
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.15 }} className="truncate max-w-full"
                      >
                        {safeValToDisplay}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                  
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Queue;