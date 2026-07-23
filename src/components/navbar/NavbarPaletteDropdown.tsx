import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import ThemeSelector from "../ThemeSelector";

export function NavbarPaletteDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
        aria-label="Toggle color palette"
      >
        <Palette size={18} strokeWidth={2.2} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 rounded-[12px] p-4 bg-(--surface) border border-(--border) shadow-[0_12px_40px_rgba(0,0,0,0.15)] origin-top-right z-50 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-(--border)">
              <span className="text-[11px] font-bold uppercase tracking-wider text-(--muted)">
                Appearances
              </span>
            </div>
            <ThemeSelector />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
