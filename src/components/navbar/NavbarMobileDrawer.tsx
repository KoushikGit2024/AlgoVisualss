import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import ThemeSelector from "../ThemeSelector";

const navItems = [
  { name: "Algorithms", href: "/algorithms" },
  { name: "Visualizer", href: "/visualizer" },
  { name: "Editor", href: "/editor" },
];

export function NavbarMobileDrawer({
  open,
  onClose,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  pathname: string;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 },
    },
    exit: {
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[280px] sm:w-[320px] flex-col bg-[var(--bg)]/95 backdrop-blur-xl border-l border-[var(--border)] shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-3.5 border-b border-(--border)">
              <span className="text-sm font-semibold uppercase tracking-widest text-(--muted)">
                Menu
              </span>
              <button
                aria-label="Close menu"
                onClick={onClose}
                className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] border border-[var(--border)] bg-transparent text-[var(--muted)] cursor-pointer transition-all duration-200 ease-in-out hover:text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95"
              >
                <X size={18} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>

            {/* Navigation Links - FIXED SPACING */}
            <motion.nav
              className="flex flex-col w-full gap-4 p-6 overflow-y-auto"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <motion.div variants={itemVariants} className="w-full block">
                <button
                  onClick={() => {
                    onClose();
                    document.dispatchEvent(new Event("open-search"));
                  }}
                  className={cn(
                    "group relative flex w-full items-center px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ease overflow-hidden text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Search size={18} strokeWidth={2.25} />
                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                      Search...
                    </span>
                  </div>
                </button>
              </motion.div>

              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <motion.div key={item.name} variants={itemVariants} className="w-full block">
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        `group relative flex w-full items-center px-4 py-3 rounded-[6px] text-base font-semibold transition-all duration-200 ease overflow-hidden ${
                          isActive
                            ? "bg-[var(--surface-2)] text-[var(--text)]"
                            : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                        }`,
                      )}
                    >
                      {/* Animated Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="mobile-active-pill"
                          className="absolute left-0 top-[20%] bottom-[20%] w-[3px] bg-[var(--accent)] rounded-r-[2px]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}

                      {/* Text with Hover Slide */}
                      <span
                        className={cn(
                          `transition-transform duration-200 ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`,
                        )}
                      >
                        {item.name}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Footer with Added Links for Mobile */}
            <div className="mt-auto flex flex-col items-center gap-6 p-6 border-t border-(--border)">
              <div className="flex flex-col items-center gap-3 w-full">
                <span className="text-[calc(11rem/16)] font-bold text-(--muted) uppercase tracking-wider">
                  Theme
                </span>
                <ThemeSelector className="justify-center" />
              </div>

              <div className="text-center text-[calc(11rem/16)] text-(--muted) font-[var(--font-geist-mono),monospace]">
                <p>
                  AlgoVisuals <span className="opacity-50">v2.1.0</span>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
