import { motion } from "framer-motion";
import { DynamicPrimitive } from "./DynamicPrimitive";

interface SetProps {
  values: any[];
}

export default function Set({ values = [] }: SetProps) {
  if (!values || values.length === 0) {
    return (
      <div className="w-full flex items-center justify-center p-4">
        <span className="text-muted/60 text-[calc(10rem/16)] font-mono border border-dashed border-border rounded px-4 py-2">
          Set {"{}"}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center overflow-x-auto styled-scrollbar pb-6 pt-2">
      <div className="flex items-center justify-center min-w-full w-max px-4">
        <span className="text-muted/50 text-3xl font-mono font-light mr-3 mt-1">{"{"}</span>

        <div className="flex items-center gap-2.5">
          {values.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8, y: 5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
              className="flex items-center justify-center px-4 py-2 bg-surface rounded-md border border-border shadow-sm hover:border-accent/50 hover:bg-accent/5 transition-colors"
            >
              <span className="text-text font-bold font-mono text-[calc(12rem/16)] flex items-center shrink-0">
                <DynamicPrimitive value={v} />
              </span>
            </motion.div>
          ))}
        </div>

        <span className="text-muted/50 text-3xl font-mono font-light ml-3 mt-1">{"}"}</span>
      </div>
    </div>
  );
}
