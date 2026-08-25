import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Monitor, Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";
import ThemeSelector from "../ThemeSelector";

// ─── Theme Toggle Icon ────────────────────────────────────────────────────────
export function ThemeIcon({
  theme,
  size = 16,
}: {
  theme: "light" | "dark" | "system";
  size?: number;
}) {
  if (theme === "system") return <Monitor size={size} strokeWidth={2} />;
  return theme === "light" ? (
    <Sun size={size} strokeWidth={2} />
  ) : (
    <Moon size={size} strokeWidth={2} />
  );
}

interface NavbarSettingsDropdownProps {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
  themeDropdownOpen: boolean;
  setThemeDropdownOpen: (open: boolean) => void;
}

export function NavbarSettingsDropdown({
  theme,
  setTheme,
  dropdownRef,
  themeDropdownOpen,
  setThemeDropdownOpen,
}: NavbarSettingsDropdownProps) {
  const [fontSize, setFontSize] = useState<"sm" | "md" | "lg">(
    () => (localStorage.getItem("appFontSize") as "sm" | "md" | "lg") || "md",
  );

  useEffect(() => {
    const root = document.documentElement;
    if (fontSize === "sm") root.style.fontSize = "12px";
    else if (fontSize === "lg") root.style.fontSize = "20px";
    else root.style.fontSize = "16px";
    localStorage.setItem("appFontSize", fontSize);
    window.dispatchEvent(new Event("font-size-change"));
  }, [fontSize]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
        className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
        aria-label="Settings"
      >
        <Settings size={18} />
      </button>

      <AnimatePresence>
        {themeDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-72 rounded-lg bg-(--surface) border border-(--border) shadow-[0_12px_40px_rgba(0,0,0,0.15)] overflow-hidden origin-top-right z-50 flex flex-col"
          >
            <div className="px-4 py-3 border-b border-(--border) bg-(--surface-2)">
              <span className="text-[12px] font-bold uppercase tracking-wider text-(--text)">
                Settings
              </span>
            </div>

            <div className="p-4 flex flex-col gap-5">
              {/* Appearance */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-(--muted) uppercase tracking-wider">
                  Appearance
                </span>
                <div className="flex bg-(--surface-2) p-1 rounded-lg border border-(--border)">
                  {(["light", "dark", "system"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "flex flex-1 justify-center items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                        theme === t
                          ? "bg-(--surface) text-(--accent) shadow-sm border border-(--border)"
                          : "text-(--muted) hover:text-(--text) border border-transparent"
                      )}
                    >
                      <ThemeIcon theme={t} size={14} />
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palette */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-(--muted) uppercase tracking-wider">
                  Color Palette
                </span>
                <div className="pt-1">
                  <ThemeSelector className="justify-start" />
                </div>
              </div>

              {/* Font Size */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-(--muted) uppercase tracking-wider">
                  Font Size
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize("sm")}
                    className={cn(
                      "flex-1 py-1.5 rounded-md border text-[12px] transition-all",
                      fontSize === "sm"
                        ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border-(--accent) text-(--accent) font-semibold"
                        : "bg-(--surface-2) border-(--border) text-(--text) font-medium hover:border-(--accent) hover:text-(--accent)",
                    )}
                  >
                    Sm
                  </button>
                  <button
                    onClick={() => setFontSize("md")}
                    className={cn(
                      "flex-1 py-1.5 rounded-md border text-[12px] transition-all",
                      fontSize === "md"
                        ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border-(--accent) text-(--accent) font-semibold"
                        : "bg-(--surface-2) border-(--border) text-(--text) font-medium hover:border-(--accent) hover:text-(--accent)",
                    )}
                  >
                    Md
                  </button>
                  <button
                    onClick={() => setFontSize("lg")}
                    className={cn(
                      "flex-1 py-1.5 rounded-md border text-[12px] transition-all",
                      fontSize === "lg"
                        ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border-(--accent) text-(--accent) font-semibold"
                        : "bg-(--surface-2) border-(--border) text-(--text) font-medium hover:border-(--accent) hover:text-(--accent)",
                    )}
                  >
                    Lg
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
