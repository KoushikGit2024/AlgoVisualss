import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface BitsetProps {
  value: number | boolean[] | number[];
}

const Bitset = ({ value }: BitsetProps) => {
  let bits: number[] = [];
  
  if (typeof value === 'number') {
    // Determine how many bits to show. E.g. up to 32.
    // Let's find the highest set bit.
    let temp = Math.abs(value);
    let highestBit = 0;
    while(temp > 0) {
      highestBit++;
      temp >>= 1;
    }
    // Show minimum 8 bits, or highestBit + 4, max 32.
    const bitCount = Math.max(8, Math.min(32, highestBit + 4));
    
    for (let i = 0; i < bitCount; i++) {
      bits.push((value & (1 << i)) ? 1 : 0);
    }
  } else if (Array.isArray(value)) {
    bits = value.map(v => v ? 1 : 0);
  }

  // Bits are constructed from least significant (index 0) to most.
  // We reverse for rendering to show MSB to LSB.
  const displayBits = bits.map((b, i) => ({ bit: b, index: i })).reverse();

  return (
    <div className="w-full flex flex-col items-center overflow-x-auto styled-scrollbar pb-6 pt-2 px-4">
      <div className="flex items-center gap-1.5">
        <AnimatePresence mode="popLayout">
          {displayBits.map(({ bit, index }) => {
            const isActive = bit === 1;
            const bgClass = isActive ? "bg-cyan-500/20" : "bg-surface-2";
            const borderClass = isActive ? "border-cyan-400" : "border-border/50";
            const textClass = isActive ? "text-cyan-300 text-[calc(15rem/16)]" : "text-muted/40 text-[calc(13rem/16)]";
            const shadowClass = isActive ? "shadow-[0_0_10px_rgba(34,211,238,0.4)]" : "";
            
            return (
              <motion.div key={index} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                className="flex flex-col items-center gap-1.5"
              >
                <motion.div 
                  layout
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={cn(`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-mono font-bold rounded border transition-all duration-200 ${bgClass} ${borderClass} ${textClass} ${shadowClass}`)}
                >
                  {bit}
                </motion.div>
                <span className="text-[calc(9rem/16)] text-muted/60 font-mono">{index}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default Bitset;
