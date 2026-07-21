import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';
import { DynamicPrimitive } from './DynamicPrimitive';

export interface D1ArrayProps {
  value: (number | string)[];
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

const D1Array = ({
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
}: D1ArrayProps) => {
  
  // 1. Bulletproof validation
  const safeValue = Array.isArray(value) ? value : [];

  // Auto-detect ranges from pointer pairs
  const rangePointerPairs = [
    ['left', 'right'],
    ['l', 'r'],
    ['start', 'end'],
    ['low', 'high'],
    ['first', 'last']
  ];

  const effectiveRanges = [...highLightRange];
  
  if (pointers && pointers.length > 0) {
    rangePointerPairs.forEach(([startName, endName]) => {
      const startPtrs = pointers.filter(p => p.name.toLowerCase() === startName || p.name.toLowerCase().endsWith(`_${startName}`));
      const endPtrs = pointers.filter(p => p.name.toLowerCase() === endName || p.name.toLowerCase().endsWith(`_${endName}`));
      
      startPtrs.forEach(start => {
        endPtrs.forEach(end => {
          if (start.index <= end.index) {
            effectiveRanges.push([start.index, end.index]);
          }
        });
      });
    });
  }

  const isInRange = (idx: number) => {
    if (effectiveRanges.length === 0) return false;
    return effectiveRanges.some(([start, end]) => idx >= start && idx <= end);
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
        <span className="text-muted text-[calc(10rem/16)] font-mono border border-dashed border-border rounded p-2">
          Awaiting valid 1D Array initialization...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start overflow-x-auto styled-scrollbar pb-12 pt-2 px-6">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex items-start gap-1.5 relative w-full">
        <AnimatePresence mode="popLayout">
          {/* CRITICAL: Mapping over safeValue, never value */}
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
            } else if (isSwap) {
              bgClass = "bg-accent-3/20"; borderClass = "border-accent-3"; textClass = "text-accent-3";
              shadowClass = "shadow-none"; activeScale = 1.05; activeZIndex = 20;
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
            } else if (isRange) {
              bgClass = "bg-surface-2"; borderClass = "border-border-2";
            }

            const isComplex = typeof val === 'object' && val !== null;
            const safeValToDisplay = isComplex ? JSON.stringify(val) : String(val);
            const valLen = safeValToDisplay.length;
            const fontSizeClass = valLen > 4 ? (valLen > 6 ? (valLen > 8 ? 'text-[calc(8rem/16)]' : 'text-[9.5px]') : 'text-[calc(11rem/16)]') : 'text-[calc(14rem/16)]';

            return (
              <motion.div key={`cell-container-${idx}`} layout variants={cellVariants} className="flex flex-col items-center relative min-w-[3rem] shrink-0">
                <motion.span layout className="text-[calc(10rem/16)] text-muted font-mono mb-1">
                  {idx}
                </motion.span>

                <motion.div
                  layout
                  initial={false}
                  animate={{ scale: activeScale, zIndex: activeZIndex }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(`
                    min-w-full min-h-[3rem] px-1.5 py-1.5 flex items-center justify-center font-mono font-medium 
                    rounded-sm border transition-colors duration-200 shrink-0
                    ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                  `)}
                >
                  {isComplex ? (
                     <div className="w-full h-full flex items-center justify-center">
                        <DynamicPrimitive value={val} />
                     </div>
                  ) : (
                     <span className={cn("break-all leading-tight text-center w-full", fontSizeClass)} style={{ wordBreak: 'break-word' }}>
                       {safeValToDisplay}
                     </span>
                  )}
                </motion.div>

                {/* Bottom Pointers */}
                <div className="absolute top-full mt-1 flex flex-col items-center w-full z-30 pointer-events-none">
                  <AnimatePresence>
                    {cellPointers.length > 0 && (
                      <motion.div
                        key={`ptr-group-${idx}`}
                        initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                        className="flex flex-col items-center text-accent-3"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-0.5 opacity-80">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                        <div className="flex flex-row flex-wrap justify-center gap-1 w-max max-w-[8rem]">
                          {cellPointers.map((ptr) => (
                            <motion.span
                              key={ptr.name} layoutId={`pointer-${ptr.name}`}
                              transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                              className="text-[calc(9rem/16)] font-mono font-bold bg-surface-2 text-accent-3 px-1 rounded border border-accent-3/30 whitespace-nowrap"
                            >
                              {ptr.name}
                            </motion.span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default D1Array;
