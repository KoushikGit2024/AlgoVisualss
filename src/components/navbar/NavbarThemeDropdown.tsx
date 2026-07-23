import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";

// ─── Theme Toggle Icon ────────────────────────────────────────────────────────
export function ThemeIcon({ theme, size = 16 }: { theme: "light" | "dark" | "system", size?: number }) {
  if (theme === "system") return <Monitor size={size} strokeWidth={2} />;
  return theme === "light" ? <Sun size={size} strokeWidth={2} /> : <Moon size={size} strokeWidth={2} />;
}

interface NavbarThemeDropdownProps {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  themeDropdownOpen: boolean;
  setThemeDropdownOpen: (open: boolean) => void;
}

export function NavbarThemeDropdown({
  theme,
  setTheme,
  dropdownRef,
  themeDropdownOpen,
  setThemeDropdownOpen,
}: NavbarThemeDropdownProps) {
  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
        className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
        aria-label="Toggle palette"
      >
        <ThemeIcon theme={theme} size={18} />
      </button>

      <AnimatePresence>
        {themeDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 rounded-[12px] bg-(--surface) border border-(--border) shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden origin-top-right z-50"
          >
            <div className="px-3 py-2 border-b border-(--border) bg-(--surface-2)">
              <span className="text-[11px] font-bold uppercase tracking-wider text-(--muted)">
                Theme
              </span>
            </div>
            <div className="p-1.5 flex flex-col gap-0.5">
              {(["light", "dark", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setThemeDropdownOpen(false);
                  }}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 text-[13px] font-medium rounded-[8px] transition-all duration-200",
                    theme === t
                      ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-(--accent)"
                      : "text-(--muted) hover:bg-(--surface-2) hover:text-(--muted)"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <ThemeIcon theme={t} />
                    <span className="capitalize">{t}</span>
                  </div>
                  {theme === t && <Check size={14} className="text-(--accent)" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
