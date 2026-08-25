import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Link } from "react-router-dom";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import ThemeSelector from "../ThemeSelector";
import { useState, useEffect } from "react";

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
            className="fixed top-0 right-0 bottom-0 z-50 flex w-70 sm:w-[320px] flex-col bg-(--bg)/95 backdrop-blur-xl border-l border-(--border) shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-3.5 border-b border-(--border)">
              <span className="text-sm font-semibold uppercase tracking-widest text-(--muted)">
                Menu
              </span>
              <button
                aria-label="Close menu"
                onClick={onClose}
                className="flex items-center justify-center w-9 h-9 rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--text) hover:bg-(--surface-2) active:scale-95"
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
                    "group relative flex w-full items-center px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ease overflow-hidden text-(--muted) hover:bg-(--surface-2) hover:text-(--text)",
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
                            ? "bg-(--surface-2) text-(--text)"
                            : "text-(--muted) hover:bg-(--surface-2) hover:text-(--text)"
                        }`,
                      )}
                    >
                      {/* Animated Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="mobile-active-pill"
                          className="absolute left-0 top-[20%] bottom-[20%] w-0.75 bg-(--accent) rounded-r-xs"
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
              
              <div className="flex flex-col items-center gap-4 w-full">
                {/* Social Icon Links */}
                <div className="flex items-center gap-6">
                  <a
                    href="https://github.com/KoushikGit2024/AlgoVisualss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--muted) hover:text-(--text) transition-transform hover:scale-110 duration-200"
                    aria-label="GitHub Repository"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
                    </svg>
                  </a>

                  <a
                    href="https://www.linkedin.com/in/koushik-kar-409489329/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--muted) hover:text-[#0A66C2] transition-transform hover:scale-110 duration-200"
                    aria-label="LinkedIn Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </a>

                  <a
                    href="https://instagram.com/chidanand013"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--muted) hover:text-[#E4405F] transition-transform hover:scale-110 duration-200"
                    aria-label="Instagram Profile"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M7.75 2C4.574 2 2 4.574 2 7.75v8.5C2 19.426 4.574 22 7.75 22h8.5C19.426 22 22 19.426 22 16.25v-8.5C22 4.574 19.426 2 16.25 2zm0 2h8.5A3.75 3.75 0 0 1 20 7.75v8.5A3.75 3.75 0 0 1 16.25 20h-8.5A3.75 3.75 0 0 1 4 16.25v-8.5A3.75 3.75 0 0 1 7.75 4zm8.75 1a1.25 1.25 0 1 0 0 2.5A1.25 1.25 0 0 0 16.5 5zM12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10zm0 2a3 3 0 1 1 0 6a3 3 0 0 1 0-6z" />
                    </svg>
                  </a>
                </div>

                {/* Creator Brand */}
                <div className="text-(--muted) font-medium text-[12px] text-center">
                  <span>
                    Crafted with passion by <span className="text-(--text) font-bold">Koushik</span>
                  </span>
                </div>
              </div>

              <div className="text-center text-[11px] text-(--muted) font-[var(--font-geist-mono),monospace]">
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
