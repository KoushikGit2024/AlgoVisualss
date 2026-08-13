import { motion, AnimatePresence, type Variants } from "framer-motion";
import { cn } from "../../lib/utils";

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
  const safeValue = typeof value === "string" ? value.split("") : Array.isArray(value) ? value : [];

  const isInRange = (idx: number) => {
    if (!highLightRange || highLightRange.length === 0) return false;
    return highLightRange.some(([start, end]) => idx >= start && idx <= end);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const cellVariants: Variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  if (safeValue.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-muted/60 text-[10px] font-mono border border-dashed border-border rounded p-2">
          "" (Empty String)
        </span>
      </div>
    );
  }

  return (
    <div
      className="overflow-auto styled-scrollbar w-full h-full relative grid"
      style={{ placeItems: "safe center" }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex items-center justify-center gap-1 relative w-max px-8 py-16"
      >
        {/* Opening Quote */}
        <span className="text-accent/60 text-3xl font-mono font-light leading-none mr-3 self-center translate-y-2">
          "
        </span>

        <div className="flex items-start">
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

              // Clean tactile styling (Keyboard key aesthetic without gradients/glows)
              let bgClass = "bg-surface";
              let borderClass =
                "border border-b-[3px] border-border/80 hover:border-accent/50 hover:bg-accent/5";
              let textClass = "text-accent";
              let shadowClass = "shadow-sm";
              let activeScale = 1;
              let activeZIndex = 1;

              if (isFound) {
                bgClass = "bg-ds-read/10";
                borderClass = "border border-b-[3px] border-ds-read";
                textClass = "text-ds-read";
                shadowClass = "shadow-md";
                activeScale = 1.1;
                activeZIndex = 30;
              } else if (isDelete) {
                bgClass = "bg-failure/10";
                borderClass = "border border-b-[3px] border-failure";
                textClass = "text-failure";
                shadowClass = "shadow-md";
                activeScale = 0.95;
                activeZIndex = 10;
              } else if (isSwap) {
                bgClass = "bg-accent-3/10";
                borderClass = "border border-b-[3px] border-accent-3";
                textClass = "text-accent-3";
                shadowClass = "shadow-md";
                activeScale = 1.05;
                activeZIndex = 20;
              } else if (isInsert) {
                bgClass = "bg-ds-write/10";
                borderClass = "border border-b-[3px] border-ds-write";
                textClass = "text-ds-write";
                shadowClass = "shadow-md";
                activeScale = 1.05;
                activeZIndex = 20;
              } else if (isWrite) {
                bgClass = "bg-ds-write/10";
                borderClass = "border border-b-[3px] border-ds-write";
                textClass = "text-ds-write";
                shadowClass = "shadow-md";
                activeScale = 1.1;
                activeZIndex = 20;
              } else if (isCompare) {
                bgClass = "bg-accent-3/10";
                borderClass = "border border-b-[3px] border-accent-3";
                textClass = "text-accent-3";
                shadowClass = "shadow-md";
                activeScale = 1.1;
                activeZIndex = 25;
              } else if (isRead) {
                bgClass = "bg-ds-read/10";
                borderClass = "border border-b-[3px] border-ds-read";
                textClass = "text-ds-read";
                shadowClass = "shadow-md";
                activeScale = 1.05;
                activeZIndex = 15;
              } else if (isHighlight) {
                bgClass = "bg-accent/10";
                borderClass = "border border-b-[3px] border-accent/60";
                textClass = "text-accent font-black";
                activeScale = 1.05;
                activeZIndex = 5;
              } else if (isRange) {
                bgClass = "bg-surface/80";
                borderClass = "border border-b-[3px] border-text/30";
              }

              const safeValToDisplay = String(val) === " " ? "\u00A0" : String(val);

              return (
                <motion.div
                  key={`cell-container-${idx}`}
                  layout
                  variants={cellVariants}
                  className="flex flex-col items-center relative flex-1 min-w-8 max-w-12 mx-0.5"
                >
                  <motion.span
                    layout
                    className="text-[9px] text-accent/50 font-mono mb-1"
                  >
                    {idx}
                  </motion.span>

                  <motion.div
                    layout
                    initial={false}
                    animate={{ scale: activeScale, zIndex: activeZIndex }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className={cn(`
                    w-full aspect-square flex items-center justify-center font-mono 
                    rounded-md transition-all duration-200 shrink-0
                    ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                  `)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={`val-${safeValToDisplay}-${idx}`}
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 2 }}
                        transition={{ duration: 0.1 }}
                        className="truncate max-w-full text-lg font-semibold tracking-wide"
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
                          key={ptr.name}
                          layoutId={`pointer-${ptr.name}`}
                          initial={{ opacity: 0, y: 5, scale: 0.8 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -5, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.8 }}
                          className="flex flex-col items-center text-ds-write z-30"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mb-0.5 opacity-80"
                          >
                            <path d="M12 19V5M5 12l7-7 7 7" />
                          </svg>
                          <span className="text-[9px] font-mono font-bold bg-ds-string/50 text-ds-string px-1 rounded border border-ds-string/30 truncate max-w-full">
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

        {/* Closing Quote */}
        <span className="text-accent/60 text-3xl font-mono font-light leading-none ml-3 self-center translate-y-2">
          "
        </span>
      </motion.div>
    </div>
  );
};

export default StringComponent;
