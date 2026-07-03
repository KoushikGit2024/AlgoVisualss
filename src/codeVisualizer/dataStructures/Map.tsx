import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapProps {
  entries: [any, any][];
}

const formatValue = (v: any): string => {
  if (v === null) return 'null';
  if (v === undefined) return 'undefined';
  if (typeof v !== 'object') return String(v);
  if (Array.isArray(v)) return `[${v.map(formatValue).join(', ')}]`;
  if (v.__type === 'container' && Array.isArray(v.data)) return `[${v.data.map(formatValue).join(', ')}]`;
  if (v.__type === 'map' && Array.isArray(v.entries)) return `{${v.entries.map((e: any) => `${formatValue(e[0])}:${formatValue(e[1])}`).join(', ')}}`;
  if (v.__type === 'set' && Array.isArray(v.values)) return `{${v.values.map(formatValue).join(', ')}}`;
  return '{...}';
};

export default function Map({ entries = [] }: MapProps) {
  if (!entries || entries.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-muted text-[10px] font-mono opacity-50">
        Empty Map
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 w-full max-w-[300px]">
      {entries.map(([k, v], i) => (
        <motion.div 
          key={i}
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, delay: i * 0.05 }}
          className="flex items-center justify-between p-1.5 bg-surface rounded border border-border shadow-sm"
        >
          {/* Key Node */}
          <div className="flex-1 flex justify-end">
            <span className="px-2 py-0.5 bg-accent/20 text-accent font-bold font-mono text-[11px] rounded shrink-0 border border-accent/30 max-w-[100px] truncate" title={String(k)}>
              {formatValue(k)}
            </span>
          </div>
          
          {/* Arrow */}
          <div className="px-2 shrink-0 flex items-center justify-center">
            <ArrowRight size={12} className="text-muted opacity-50" />
          </div>

          {/* Value Node */}
          <div className="flex-1 flex justify-start">
            <span className="px-2 py-0.5 bg-success/20 text-success font-bold font-mono text-[11px] rounded shrink-0 border border-success/30 max-w-[100px] truncate" title={String(v)}>
              {formatValue(v)}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
