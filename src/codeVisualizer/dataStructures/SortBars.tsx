import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';
import { type D1ArrayProps } from './D1Array';

const SortBars = ({
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
  
  const safeValue = Array.isArray(value) ? value : [];
  
  // Calculate max value for relative bar heights
  const numericValues = safeValue.map(v => Number(v)).filter(v => !isNaN(v));
  // Default to 100 if empty or no numeric values
  const maxVal = numericValues.length > 0 ? Math.max(...numericValues) : 100;
  // Ensure we don't divide by zero if maxVal is 0
  const safeMax = maxVal === 0 ? 1 : maxVal;

  const effectiveRanges = [...highLightRange];
  
  const rangePointerPairs = [
    ['left', 'right'],
    ['l', 'r'],
    ['start', 'end'],
    ['low', 'high'],
    ['first', 'last']
  ];

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
    show: { opacity: 1, transition: { staggerChildren: 0.02 } },
  };

  const barVariants: Variants = {
    hidden: { opacity: 0, height: 0 },
    show: { opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  if (safeValue.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-muted text-[calc(10rem/16)] font-mono border border-dashed border-border rounded p-2">
          Awaiting sort array initialization...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center overflow-x-auto styled-scrollbar pb-12 pt-6 px-6">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="flex items-end justify-center gap-1.5 relative w-full h-[180px]"
      >
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

            let bgClass = "bg-surface-3";
            let borderClass = "border-border";
            let textClass = "text-text text-muted-foreground";
            let activeZIndex = 1;

            if (isFound) {
              bgClass = "bg-ds-read"; borderClass = "border-ds-read"; textClass = "text-bg"; activeZIndex = 30;
            } else if (isDelete) {
              bgClass = "bg-failure"; borderClass = "border-failure"; textClass = "text-bg"; activeZIndex = 10;
            } else if (isSwap) {
              bgClass = "bg-accent-3"; borderClass = "border-accent-3"; textClass = "text-bg"; activeZIndex = 20;
            } else if (isInsert) {
              bgClass = "bg-ds-write"; borderClass = "border-ds-write"; textClass = "text-bg"; activeZIndex = 25;
            } else if (isWrite) {
              bgClass = "bg-success"; borderClass = "border-success"; textClass = "text-bg"; activeZIndex = 20;
            } else if (isCompare) {
              bgClass = "bg-orange-500"; borderClass = "border-orange-500"; textClass = "text-bg"; activeZIndex = 15;
            } else if (isRead) {
              bgClass = "bg-accent"; borderClass = "border-accent"; textClass = "text-bg"; activeZIndex = 10;
            } else if (isHighlight) {
              bgClass = "bg-accent-2"; borderClass = "border-accent-2"; textClass = "text-bg"; activeZIndex = 5;
            } else if (isRange) {
              bgClass = "bg-surface-2"; borderClass = "border-border-2"; textClass = "text-text";
            }

            const numVal = Number(val);
            const heightPercent = !isNaN(numVal) ? Math.max(5, (numVal / safeMax) * 100) : 10;
            
            const safeValToDisplay = typeof val === 'object' ? JSON.stringify(val) : String(val);
            const valLen = safeValToDisplay.length;
            const fontSizeClass = valLen > 3 ? 'text-[calc(8rem/16)]' : 'text-[calc(10rem/16)]';

            return (
              <div key={`bar-container-${idx}`} className="flex flex-col items-center justify-end h-full w-8 shrink-0 relative group">
                <motion.div
                  layout
                  variants={barVariants}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ zIndex: activeZIndex }}
                  className={cn(
                    "w-full rounded-t-md border flex flex-col justify-start items-center overflow-hidden transition-colors duration-200",
                    bgClass,
                    borderClass
                  )}
                >
                  <span className={cn("mt-1 font-mono font-bold transition-colors duration-200", fontSizeClass, textClass)}>
                    {safeValToDisplay}
                  </span>
                </motion.div>
                
                {/* Index below the bar */}
                <motion.span layout className="text-[calc(9rem/16)] text-muted font-mono mt-1 absolute top-full">
                  {idx}
                </motion.span>

                {/* Pointers (if any) hovering above the bar */}
                <AnimatePresence>
                  {cellPointers.map((ptr, pIdx) => (
                    <motion.div
                      key={`ptr-${idx}-${ptr.name}`}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      style={{ bottom: `calc(${heightPercent}% + ${pIdx * 16 + 8}px)`, zIndex: 50 }}
                      className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none"
                    >
                      <div className="bg-bg text-text text-[calc(9rem/16)] font-bold px-1.5 py-0.5 rounded border border-border whitespace-nowrap shadow-sm">
                        {ptr.name}
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-t-[4px] border-t-border" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default SortBars;
