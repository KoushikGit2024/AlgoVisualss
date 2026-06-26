import { motion } from 'framer-motion';

export interface ScalarVisualizerProps {
  name: string;
  value: string | number | boolean;
}

const ScalarVisualizer = ({ value }: ScalarVisualizerProps) => {
  const displayValue = typeof value === 'boolean' ? (value ? "true" : "false") : String(value);

  return (
    <div className="flex items-center justify-center p-1">
      <motion.div 
        key={displayValue} // Forces re-animation when value changes
        initial={{ scale: 0.9, opacity: 0, filter: 'blur(4px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex flex-col items-center bg-surface-2 border border-accent/40 rounded-[8px] px-3 py-2 shadow-[0_0_12px_rgba(var(--accent-rgb),0.12)] relative overflow-hidden"
      >
        {/* Subtle background glow effect */}
        <motion.div 
           className="absolute inset-0 bg-accent/10 rounded-lg"
           animate={{ opacity: [0.5, 0] }}
           transition={{ duration: 0.8 }}
        />

        {/* <span className="text-[11px] font-mono font-bold text-accent mb-2 uppercase tracking-widest z-10">{name}</span> */}
        <motion.span 
          className="text-base font-mono font-bold text-text tracking-tight z-10"
          animate={{ scale: [1.1, 1], color: ['#a855f7', '#e2e8f0'] }} // Flash purple then fade to text color
          transition={{ duration: 0.5 }}
        >
          {displayValue}
        </motion.span>
      </motion.div>
    </div>
  );
};
export default ScalarVisualizer;
