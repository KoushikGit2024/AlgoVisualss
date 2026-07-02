import { motion } from 'framer-motion';

interface SetVisualizerProps {
  values: any[];
}

export function SetVisualizer({ values = [] }: SetVisualizerProps) {
  if (!values || values.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-muted text-[10px] font-mono opacity-50">
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
          <span className="text-success font-bold font-mono text-[11px] max-w-[100px] truncate" title={String(v)}>
            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
