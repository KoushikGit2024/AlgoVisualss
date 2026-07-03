import { motion } from 'framer-motion';

export interface ScalarProps {
  name: string;
  value: string | number | boolean;
}

const Scalar = ({ value }: ScalarProps) => {
  const displayValue = typeof value === 'boolean' ? (value ? "true" : "false") : String(value);

  return (
    <div className="flex flex-col items-center justify-center p-2">
      {/* Variable Name Badge */}
      {/* <span className="text-[10px] font-mono font-bold text-accent-3 bg-accent-3/10 px-2 py-0.5 rounded border border-accent-3/30 mb-1.5 whitespace-nowrap shadow-sm">
        {name}
      </span> */}

      {/* Variable Value Box */}
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, filter: 'blur(4px)' }}
        animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="flex items-center justify-center bg-surface-2 border border-accent/40 rounded-md min-w-[3rem] h-12 px-3 relative overflow-hidden shrink-0"
      >
        {/* Subtle background glow effect that triggers on value change */}
        <motion.div 
           key={`bg-${displayValue}`}
           className="absolute inset-0 bg-accent/20"
           initial={{ opacity: 0.5 }}
           animate={{ opacity: 0 }}
           transition={{ duration: 0.8 }}
        />

        <motion.span 
          key={`text-${displayValue}`}
          className="text-[14px] font-mono font-bold text-text tracking-tight z-10 truncate max-w-full"
          initial={{ scale: 1.2, color: '#a855f7' }}
          animate={{ scale: 1, color: 'var(--text)' }}
          transition={{ duration: 0.4 }}
        >
          {displayValue}
        </motion.span>
      </motion.div>
    </div>
  );
};

export default Scalar;
