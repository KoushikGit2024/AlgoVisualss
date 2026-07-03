import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// A tiny broken traversal — three nodes, the middle edge severed — stands in
// for the generic "404" numeral. It's the one visual idea this page gets to
// keep: the path you wanted doesn't connect, same as an unreachable node in
// any graph this app already knows how to draw.
const BrokenPath = () => (
  <svg width="180" height="72" viewBox="0 0 180 72" fill="none">
    {/* solid edge: start -> broken point */}
    <motion.path
      d="M20 36 H72"
      stroke="var(--border-2)"
      strokeWidth="2"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.5, delay: 0.15 }}
    />
    {/* dashed edge: broken point -> target, never resolves */}
    <motion.path
      d="M108 36 H160"
      stroke="var(--accent-3)"
      strokeWidth="2"
      strokeDasharray="5 5"
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.6 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    />

    {/* origin node */}
    <motion.circle
      cx="20" cy="36" r="8"
      fill="var(--surface)" stroke="var(--accent)" strokeWidth="2"
      initial={{ scale: 0 }} animate={{ scale: 1 }}
      transition={{ type: "spring", bounce: 0.5, delay: 0.05 }}
    />
    {/* broken node — the one you asked for */}
    <motion.circle
      cx="90" cy="36" r="10"
      fill="color-mix(in srgb, var(--accent-3) 15%, var(--surface))"
      stroke="var(--accent-3)" strokeWidth="2"
      initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }}
      transition={{ duration: 0.5, delay: 0.3 }}
    />
    <motion.g
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
    >
      <line x1="86" y1="32" x2="94" y2="40" stroke="var(--accent-3)" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="94" y1="32" x2="86" y2="40" stroke="var(--accent-3)" strokeWidth="1.6" strokeLinecap="round" />
    </motion.g>
    {/* target node, unreached — dimmer, dashed ring */}
    <motion.circle
      cx="160" cy="36" r="8"
      fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeDasharray="3 3"
      initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
      transition={{ delay: 0.6 }}
    />
  </svg>
);

export default function NotFound() {
  return (
    <div
      className="relative flex h-full min-h-[60vh] flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >


      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <BrokenPath />
      </motion.div>

      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-3 text-[11px] font-mono font-semibold uppercase tracking-[0.15em]"
        style={{ color: "var(--accent-3)" }}
      >
        Node unreachable · 404
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.58 }}
        className="mt-3 text-xl font-semibold"
        style={{ color: "var(--text)" }}
      >
        Page not found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.64 }}
        className="mt-2 text-sm max-w-sm"
        style={{ color: "var(--muted)" }}
      >
        There's no route to this page — it may have moved, or never existed.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.72 }}
        className="mt-8 flex items-center gap-3"
      >
        <Link
          to="/"
          className="group relative px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-shadow duration-200"
          style={{ background: "var(--accent)" }}
        >
          Go home
        </Link>
        <Link
          to="/algorithms"
          className="px-5 py-2.5 rounded-full text-sm font-medium border transition-colors duration-150 hover:border-[var(--accent)] hover:text-[var(--accent)]"
          style={{ borderColor: "var(--border)", color: "var(--muted)" }}
        >
          Browse algorithms
        </Link>
      </motion.div>
    </div>
  );
}