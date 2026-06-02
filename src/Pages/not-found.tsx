import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div
      className="relative flex h-full min-h-[60vh] flex-col items-center justify-center px-6 text-center overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      {/* Mesh glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, var(--glow-soft), transparent 70%)",
        }}
      />

      {/* 404 number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className="relative text-[9rem] font-bold leading-none tracking-tight select-none"
        style={{
          background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        404
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12 }}
        className="mt-4 text-xl font-semibold"
        style={{ color: "var(--text)" }}
      >
        Page not found
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-2 text-sm max-w-sm"
        style={{ color: "var(--muted)" }}
      >
        The algorithm you&apos;re looking for doesn&apos;t exist yet — or it&apos;s been moved.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.28 }}
        className="mt-8 flex items-center gap-3"
      >
        <Link
          to="/"
          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
          style={{ background: "var(--accent)", color: "#fff" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px 6px var(--glow)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
        >
          Go Home
        </Link>
        <Link
          to="/algorithms"
          className="px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-150"
          style={{ border: "1px solid var(--border)", color: "var(--muted)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.color = "var(--muted)";
          }}
        >
          Browse Algorithms
        </Link>
      </motion.div>
    </div>
  );
}