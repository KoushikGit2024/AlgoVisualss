import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface StringProps {
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

const StringComponent = ({
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
}: StringProps) => {
  
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
        <span className="text-ds-string/50 text-[calc(10rem/16)] font-mono border border-dashed border-ds-string/30 rounded p-2">
          "" (Empty String)
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start overflow-x-auto styled-scrollbar pb-8 pt-2 px-2">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex items-start relative w-full">
        {/* Opening Quote */}
        <span className="text-ds-string/50 text-2xl font-mono leading-none mr-2 mt-2">"</span>
        
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
            let bgClass = "bg-ds-string/10";
            let borderClass = "border-ds-string/30";
            let textClass = "text-ds-write";
            let shadowClass = "shadow-sm";
            let activeScale = 1;
            let activeZIndex = 1;

            if (isFound) {
              bgClass = "bg-ds-read/20"; borderClass = "border-ds-read"; textClass = "text-ds-read";
              shadowClass = "shadow-none"; activeScale = 1.1; activeZIndex = 30;
            } else if (isDelete) {
              bgClass = "bg-failure/20"; borderClass = "border-failure"; textClass = "text-failure";
              shadowClass = "shadow-none"; activeScale = 0.95; activeZIndex = 10;
            } else if (isSwap) {
              bgClass = "bg-accent-3/20"; borderClass = "border-accent-3"; textClass = "text-accent-3";
              shadowClass = "shadow-none"; activeScale = 1.05; activeZIndex = 20;
            } else if (isInsert) {
              bgClass = "bg-ds-string/30"; borderClass = "border-ds-string"; textClass = "text-ds-string";
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
              bgClass = "bg-ds-string/30"; borderClass = "border-ds-string/60"; textClass = "text-ds-write";
              activeZIndex = 5;
            } else if (isRange) {
              bgClass = "bg-ds-string/20"; borderClass = "border-ds-string/40";
            }

            const safeValToDisplay = String(val) === ' ' ? '\u00A0' : String(val);

            return (
              <motion.div key={`cell-container-${idx}`} layout variants={cellVariants} className="flex flex-col items-center relative flex-1 min-w-[2rem] max-w-[3rem] mx-0.5">
                <motion.span layout className="text-[calc(9rem/16)] text-ds-string/40 font-mono mb-1">
                  {idx}
                </motion.span>

                <motion.div
                  layout
                  initial={false}
                  animate={{ scale: activeScale, zIndex: activeZIndex }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(`
                    w-full aspect-square px-1 flex items-center justify-center font-mono text-[calc(16rem/16)] font-medium 
                    rounded-sm border transition-colors duration-200 shrink-0
                    ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                  `)}
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
                        className="flex flex-col items-center text-ds-write z-30"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5 opacity-80">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        <span className="text-[calc(9rem/16)] font-mono font-bold bg-ds-string/50 text-ds-string px-1 rounded border border-ds-string/30 truncate max-w-full">
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
        <span className="text-ds-string/50 text-2xl font-mono leading-none ml-2 mt-2">"</span>
      </motion.div>
    </div>
  );
};

export default StringComponent;
