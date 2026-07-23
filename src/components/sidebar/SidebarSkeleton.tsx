import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { AlertCircle } from "lucide-react";

export function SidebarSkeleton() {
  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="px-4 py-4 flex flex-col gap-5"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <motion.div
            variants={item}
            className="h-5 rounded-md bg-[var(--surface-2)] animate-pulse w-2/3"
          />
          <motion.div
            variants={item}
            className="h-4 rounded-md bg-[var(--surface-2)] animate-pulse w-5/6 ml-4 opacity-60"
          />
          <motion.div
            variants={item}
            className="h-4 rounded-md bg-[var(--surface-2)] animate-pulse w-3/4 ml-4 opacity-60"
          />
        </div>
      ))}
    </motion.div>
  );
}

export function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-48 text-[var(--muted)] text-center p-6 text-[calc(13rem/16)]"
    >
      <AlertCircle size={28} className="mb-3 opacity-40 text-[var(--accent)]" />
      <p className="font-semibold text-sm mb-0.5 text-[var(--text)] tracking-tight">
        No Results Found
      </p>
      <p className="opacity-80">Try tweaking your search index query.</p>
    </motion.div>
  );
}
