import { motion } from "framer-motion";
import { cn } from "../lib/utils";

interface LoaderProps {
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export default function Loader({
  text = "Loading...",
  className,
  fullScreen = false,
}: LoaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullScreen ? "fixed inset-0 bg-(--bg) z-50" : "flex-1 w-full h-full min-h-50",
        className,
      )}
    >
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Outer glowing dashed ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-[color-mix(in_srgb,var(--accent)_40%,transparent)]"
        />

        {/* Inner spinning solid ring */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border-2 border-transparent border-t-(--accent) border-l-(--accent) shadow-[0_0_15px_color-mix(in_srgb,var(--accent)_50%,transparent)]"
        />

        {/* Center pulsing core */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-2.5 h-2.5 bg-(--accent) rounded-full shadow-[0_0_12px_var(--accent)]"
        />
      </div>

      {text && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5 text-(--muted) font-semibold text-[11px] tracking-[0.2em] uppercase"
        >
          {text}
        </motion.div>
      )}
    </div>
  );
}
