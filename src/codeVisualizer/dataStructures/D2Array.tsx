import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface GridCoordinate { row: number; col: number; }
export interface GridRange { startRow: number; endRow: number; startCol: number; endCol: number; }

export interface D2ArrayProps {
  value: ((number | string)[] | string)[];
  pointers?: { name: string; row: number; col: number }[];
  highLightIndices?: GridCoordinate[];
  readIndices?: GridCoordinate[];
  writeIndices?: GridCoordinate[];
  compareIndices?: GridCoordinate[];
  swapIndices?: GridCoordinate[];
  deleteIndices?: GridCoordinate[];
  insertIndices?: GridCoordinate[]; 
  foundIndices?: GridCoordinate[];  
  highLightRange?: GridRange[];
}

const D2Array = ({
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
}: D2ArrayProps) => {

  const isMatch = (arr: GridCoordinate[] | undefined, r: number, c: number) => {
    if (!arr) return false;
    return arr.some((coord) => coord.row === r && coord.col === c);
  };

  const rangePointerPairs = [
    ['left', 'right'],
    ['l', 'r'],
    ['start', 'end'],
    ['low', 'high'],
    ['first', 'last'],
    ['topleft', 'bottomright'],
    ['startrow', 'endrow'],
    ['startcol', 'endcol']
  ];

  const effectiveRanges = [...highLightRange];

  if (pointers && pointers.length > 0) {
    rangePointerPairs.forEach(([startName, endName]) => {
      const startPtrs = pointers.filter(p => p.name.toLowerCase() === startName || p.name.toLowerCase().endsWith(`_${startName}`));
      const endPtrs = pointers.filter(p => p.name.toLowerCase() === endName || p.name.toLowerCase().endsWith(`_${endName}`));
      
      startPtrs.forEach(start => {
        endPtrs.forEach(end => {
          if (start.row <= end.row && start.col <= end.col) {
            effectiveRanges.push({
              startRow: start.row,
              endRow: end.row,
              startCol: start.col,
              endCol: end.col
            });
          }
        });
      });
    });
  }

  const isInRange = (r: number, c: number) => {
    if (effectiveRanges.length === 0) return false;
    return effectiveRanges.some(
      (range) => r >= range.startRow && r <= range.endRow && c >= range.startCol && c <= range.endCol
    );
  };

  const gridVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const rowVariants = { hidden: { opacity: 0, x: -5 }, show: { opacity: 1, x: 0, transition: { staggerChildren: 0.02 } } };
  const cellVariants : Variants = { hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } } };

  const safeValue = Array.isArray(value) ? value : [];
  let numCols = 0;
  for (const row of safeValue) {
    const len = Array.isArray(row) ? row.length : (typeof row === 'string' ? row.length : 0);
    if (len > numCols) {
      numCols = len;
    }
  }

  if (safeValue.length === 0 || numCols === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-muted text-[10px] font-mono border border-dashed border-border rounded p-2">
          Awaiting valid 2D Matrix initialization...
        </span>
      </div>
    );
  }
  
  return (
    <div className="w-full flex flex-col items-start overflow-auto styled-scrollbar pb-6 pt-2 px-2">
      <motion.div variants={gridVariants} initial="hidden" animate="show" className="flex flex-col gap-1.5 relative w-full min-w-max">
        
        {/* Column Indices */}
        <div className="flex items-center gap-1.5 mb-0.5 w-full">
          <div className="w-6 h-6 shrink-0" />
          {Array.from({ length: numCols }).map((_, c) => (
            <div key={`col-idx-${c}`} className="w-12 flex justify-center shrink-0">
              <span className="text-[10px] text-muted font-mono">{c}</span>
            </div>
          ))}
        </div>

        <AnimatePresence mode="popLayout">
          {safeValue.map((row, r) => {
            const safeRow = Array.isArray(row) ? row : (typeof row === 'string' ? row.split('') : []);

            return (
              <motion.div key={`row-${r}`} variants={rowVariants} layout className="flex items-center gap-1.5 w-full">
                
                {/* Row Index */}
                <div className="w-6 flex justify-end pr-2 shrink-0">
                  <span className="text-[10px] text-muted font-mono">{r}</span>
                </div>

                {/* CRITICAL: Mapping exactly over safeRow for jagged arrays */}
                {safeRow.map((val: any, c: number) => {
                  const isDelete = isMatch(deleteIndices, r, c);
                  const isSwap = isMatch(swapIndices, r, c);
                  const isWrite = isMatch(writeIndices, r, c);
                  const isInsert = isMatch(insertIndices, r, c);
                  const isFound = isMatch(foundIndices, r, c);
                  const isCompare = isMatch(compareIndices, r, c);
                  const isRead = isMatch(readIndices, r, c);
                  const isHighlight = isMatch(highLightIndices, r, c);
                  const isRange = isInRange(r, c);

                  const cellPointers = pointers?.filter((p) => p.row === r && p.col === c) || [];

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

                  const safeValToDisplay = typeof val === 'object' ? JSON.stringify(val) : String(val);
                  const valLen = safeValToDisplay.length;
                  const fontSizeClass = valLen > 4 ? (valLen > 6 ? (valLen > 8 ? 'text-[8px]' : 'text-[9.5px]') : 'text-[11px]') : 'text-[14px]';

                  return (
                    <motion.div key={`cell-${r}-${c}`} layout variants={cellVariants} className="relative flex flex-col items-center w-12 shrink-0">
                      
                      <motion.div
                        layout initial={false}
                        animate={{ scale: activeScale, zIndex: activeZIndex }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={cn(`
                          w-full aspect-square px-1 flex items-center justify-center font-mono font-medium 
                          rounded-sm border transition-colors duration-200 shrink-0
                          ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                        `)}
                      >
                        <AnimatePresence mode="wait">
                          <motion.span key={`val-${safeValToDisplay}-${r}-${c}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }} className={cn("break-all leading-tight text-center w-full", fontSizeClass)} style={{ wordBreak: 'break-word' }}>
                            {safeValToDisplay}
                          </motion.span>
                        </AnimatePresence>
                      </motion.div>

                      {/* Corner Anchored Pointers */}
                      <div className="absolute top-0 right-0 flex flex-col gap-0.5 z-30 translate-x-[30%] -translate-y-[30%] pointer-events-none">
                        <AnimatePresence>
                          {cellPointers.map((ptr) => (
                            <motion.div
                              key={ptr.name} layoutId={`pointer-2d-${ptr.name}`}
                              initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                              className="bg-accent-3 text-white shadow-md border border-bg rounded px-1 py-[1px] flex items-center justify-center"
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
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default D2Array;