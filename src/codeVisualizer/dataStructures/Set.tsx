import { motion } from 'framer-motion';
import { DynamicPrimitive } from './DynamicPrimitive';

interface SetProps {
  values: any[];
}

// formatValue replaced by DynamicPrimitive
export default function Set({ values = [] }: SetProps) {
  if (!values || values.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-muted text-[calc(10rem/16)] font-mono opacity-50">
        Empty Set
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 w-full max-w-[300px]">
      {values.map((v, i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className="flex items-center justify-center px-3 py-1 bg-success/10 rounded-full border border-success/30 shadow-sm"
        >
          <span className="text-success font-bold font-mono text-[calc(11rem/16)] flex items-center max-w-[200px] overflow-x-auto styled-scrollbar">
            <DynamicPrimitive value={v} />
          </span>
        </motion.div>
      ))}
    </div>
  );
}
