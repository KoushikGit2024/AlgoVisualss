import { motion } from "framer-motion";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      className="relative flex h-full min-h-[60vh] flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Background glow — tuned to failure, not the brand accent trio */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, color-mix(in srgb, var(--failure) 8%, transparent), transparent 70%)",
        }}
      />

      {/* Icon — a snapped edge between two nodes, the same visual language
          as the visualizer's own graph/tree components, rather than a
          generic triangle-alert glyph borrowed from any other app. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className="w-16 h-16 flex items-center justify-center rounded-2xl mb-6"
        style={{
          background: "color-mix(in srgb, var(--failure) 10%, transparent)",
          border: "1px solid color-mix(in srgb, var(--failure) 25%, transparent)",
        }}
      >
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <circle cx="7" cy="15" r="3.5" stroke="var(--failure)" strokeWidth="1.8" fill="none" />
          <circle cx="23" cy="15" r="3.5" stroke="var(--failure)" strokeWidth="1.8" fill="none" />
          <line x1="10.5" y1="15" x2="14" y2="15" stroke="var(--failure)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16" y1="15" x2="19.5" y2="15" stroke="var(--failure)" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="0.5 3" />
          <line x1="13.5" y1="12" x2="16.5" y2="18" stroke="var(--failure)" strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16.5" y1="12" x2="13.5" y2="18" stroke="var(--failure)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="text-[11px] font-mono font-semibold uppercase tracking-[0.15em]"
        style={{ color: "var(--failure)" }}
      >
        Runtime error
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.22 }}
        className="mt-2 text-xl font-semibold"
        style={{ color: "var(--text)" }}
      >
        Something went wrong
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="mt-2 text-sm max-w-sm"
        style={{ color: "var(--muted)" }}
      >
        {error?.message || "An unexpected error occurred. Please try again."}
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        onClick={reset}
        className="mt-8 px-6 py-2.5 rounded-full text-sm font-semibold text-white transition-shadow duration-200 hover:shadow-[0_0_24px_6px_var(--glow)]"
        style={{ background: "var(--accent)" }}
      >
        Try again
      </motion.button>
    </div>
  );
}