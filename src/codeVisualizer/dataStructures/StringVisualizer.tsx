import { motion, AnimatePresence, type Variants } from 'framer-motion';

export interface StringVisualizerProps {
  value: string | (number | string)[];
  pointers?: { name: string; index: number }[];
  highLightIndices?: number[];
  readIndices?: number[];
  writeIndices?: number[];
  compareIndices?: number[];
  swapIndices?: number[];
  deleteIndices?: number[];
  insertIndices?: number[]; 
  foundIndices?: number[];  
  highLightRange?: [number, number][];
}

const StringVisualizer = ({
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
  highLightRange = [],
}: StringVisualizerProps) => {
  
  // Convert string to array of chars, or use array as is
  const safeValue = typeof value === 'string' ? value.split('') : Array.isArray(value) ? value : [];

  const isInRange = (idx: number) => {
    if (!highLightRange || highLightRange.length === 0) return false;
    return highLightRange.some(([start, end]) => idx >= start && idx <= end);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const cellVariants : Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  if (safeValue.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-emerald-500/50 text-[10px] font-mono border border-dashed border-emerald-500/30 rounded p-2">
          "" (Empty String)
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start overflow-x-auto styled-scrollbar pb-8 pt-2 px-2">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex items-start relative w-full">
        {/* Opening Quote */}
        <span className="text-emerald-500/50 text-2xl font-mono leading-none mr-2 mt-2">"</span>
        
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
            const isRange = isInRange(idx);

            const cellPointers = pointers?.filter((p) => p.index === idx) || [];

            // Default Text-specific styling (Green tint)
            let bgClass = "bg-emerald-500/10";
            let borderClass = "border-emerald-500/30";
            let textClass = "text-emerald-400";
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
              bgClass = "bg-emerald-500/30"; borderClass = "border-emerald-500"; textClass = "text-emerald-300";
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
              bgClass = "bg-emerald-500/30"; borderClass = "border-emerald-500/60"; textClass = "text-emerald-200";
              activeZIndex = 5;
            } else if (isRange) {
              bgClass = "bg-emerald-500/20"; borderClass = "border-emerald-500/40";
            }

            const safeValToDisplay = String(val) === ' ' ? '\u00A0' : String(val);

            return (
              <motion.div key={`cell-container-${idx}`} layout variants={cellVariants} className="flex flex-col items-center relative flex-1 min-w-[2rem] max-w-[3rem] mx-0.5">
                <motion.span layout className="text-[9px] text-emerald-500/40 font-mono mb-1">
                  {idx}
                </motion.span>

                <motion.div
                  layout
                  initial={false}
                  animate={{ scale: activeScale, zIndex: activeZIndex }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`
                    w-full aspect-square px-1 flex items-center justify-center font-mono text-[16px] font-medium 
                    rounded-sm border transition-colors duration-200 shrink-0
                    ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                  `}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`val-${safeValToDisplay}-${idx}`}
                      initial={{ opacity: 0, y: -2 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 2 }}
                      transition={{ duration: 0.1 }} className="truncate max-w-full"
                    >
                      {safeValToDisplay}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                {/* Bottom Pointers */}
                <div className="absolute top-full mt-1.5 flex flex-col items-center gap-1 w-full">
                  <AnimatePresence>
                    {cellPointers.map((ptr) => (
                      <motion.div
                        key={ptr.name} layoutId={`pointer-${ptr.name}`}
                        initial={{ opacity: 0, y: 5, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: 0.8 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                        className="flex flex-col items-center text-emerald-400 z-30"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5 opacity-80">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        <span className="text-[9px] font-mono font-bold bg-emerald-900/50 text-emerald-300 px-1 rounded border border-emerald-500/30 truncate max-w-full">
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
        
        {/* Closing Quote */}
        <span className="text-emerald-500/50 text-2xl font-mono leading-none ml-2 mt-2">"</span>
      </motion.div>
    </div>
  );
};

export default StringVisualizer;
