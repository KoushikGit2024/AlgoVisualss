import { motion, AnimatePresence, type Variants } from 'framer-motion';

export interface StackProps {
  value: (number | string)[];
  pointers?: { name: string; index: number }[];
  
  // Highlighting Operations
  highLightIndices?: number[];
  readIndices?: number[];   // e.g., peek() or top()
  writeIndices?: number[];
  compareIndices?: number[];
  swapIndices?: number[];
  deleteIndices?: number[]; // e.g., pop()
  insertIndices?: number[]; // e.g., push()
  foundIndices?: number[];
}

const Stack = ({
  value = [],
  pointers = [],
  highLightIndices = [],
  readIndices = [],
  writeIndices = [],
  compareIndices = [],
  swapIndices = [],
  deleteIndices = [],
  insertIndices = [],
  foundIndices = [],
}: StackProps) => {

  // 1. Bulletproof validation
  const safeValue = Array.isArray(value) ? value : [];

  // ─── Directional LIFO Animations (Vertical) ───
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  // Push slides in from top (-y), Pop slides out to top (-y)
  const cellVariants: Variants = {
    hidden: { opacity: 0, y: -30, scale: 0.9 }, // Enter from Top
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 350, damping: 25 } },
    exit: { opacity: 0, y: -40, scale: 0.8, transition: { duration: 0.2, ease: "easeIn" } } // Exit to Top
  };

  if (safeValue.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        {/* Empty Stack Bucket */}
        <div className="w-24 h-32 border-x-2 border-b-2 border-dashed border-border/50 bg-surface-2/10 rounded-b-md flex items-end justify-center pb-4 relative">
            <span className="absolute -top-6 text-[10px] font-mono text-muted uppercase tracking-widest flex flex-col items-center">
              <span>Top</span>
              <span>&darr;</span>
            </span>
            <span className="text-muted text-[10px] font-mono opacity-50">Empty</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto styled-scrollbar py-8 px-4">
      
      {/* ─── Stack Bucket Container ─── */}
      <div className="relative flex flex-col items-center min-h-[150px]">
        
        {/* The Open-Top Bucket Visual */}
        <div className="absolute inset-y-[-12px] -inset-x-4 border-x-2 border-b-2 border-dashed border-border/50 bg-surface-2/10 rounded-b-md pointer-events-none" />

        {/* Structural Indicator */}
        <div className="absolute -top-8 w-full flex items-center justify-center text-[10px] font-bold font-mono text-muted uppercase tracking-widest gap-1">
          <span>Top</span>
        </div>

        {/* Using flex-col-reverse ensures index 0 stays locked at the bottom, 
          and new elements push the stack upwards natively.
        */}
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col-reverse gap-1.5 relative z-10 w-[4.5rem]">
          <AnimatePresence mode="popLayout">
            {safeValue.map((val, idx) => {
              const isDelete = deleteIndices?.includes(idx);
              const isSwap = swapIndices?.includes(idx);
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

              const safeValToDisplay = typeof val === 'object' ? JSON.stringify(val) : String(val);

              return (
                <motion.div key={`stack-cell-${idx}`} layout variants={cellVariants} className="flex items-center justify-center relative w-full h-[2.5rem]">
                  
                  {/* Left Side: Array Index */}
                  <div className="absolute right-full mr-2 text-[10px] text-muted font-mono opacity-60">
                    {idx}
                  </div>

                  {/* Right Side: Pointers (e.g., 'top') */}
                  <div className="absolute left-full ml-2 flex items-center gap-1">
                    <AnimatePresence>
                      {cellPointers.map((ptr) => (
                        <motion.div
                          key={ptr.name} layoutId={`pointer-stack-${ptr.name}`}
                          initial={{ opacity: 0, x: -10, scale: 0.8 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 10, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                          className="flex items-center text-accent-3 z-30"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-0.5 opacity-80 rotate-90">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                          </svg>
                          <span className="text-[9px] font-mono font-bold bg-surface-2 text-accent-3 px-1.5 py-[1px] rounded border border-accent-3/30 truncate max-w-[60px]">
                            {ptr.name}
                          </span>
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
                    className={`
                      w-full h-full px-1 flex items-center justify-center font-mono text-[14px] font-bold 
                      rounded-sm border transition-colors duration-200 shrink-0
                      ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                    `}
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

export default Stack;