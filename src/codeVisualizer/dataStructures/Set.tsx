import { motion } from 'framer-motion';

interface SetProps {
  values: any[];
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
          <span className="text-success font-bold font-mono text-[calc(11rem/16)] max-w-[100px] truncate" title={String(v)}>
            {formatValue(v)}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
