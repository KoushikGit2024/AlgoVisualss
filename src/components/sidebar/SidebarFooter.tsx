import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, X, BookOpen, Code2 } from "lucide-react";
import { cn } from "../../lib/utils";
import ThemeSelector from "../ThemeSelector";

interface SidebarFooterProps {
  isAlgo: boolean;
  subTopic?: string | null;
  collapsed: boolean;
  activeView: string;
  handleViewChange: (view: "docs" | "visualizer") => void;
}

export function SidebarFooter({
  isAlgo,
  subTopic,
  collapsed,
  activeView,
  handleViewChange,
}: SidebarFooterProps) {
  const [showSettings, setShowSettings] = useState(false);
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
    <div className="shrink-0 flex flex-col border-t border-[var(--border)] bg-[var(--surface)] p-3 gap-3 relative z-30">
      {/* Toggle Docs/Visualizer */}
      {isAlgo && subTopic && !collapsed && (
        <div className="flex items-center bg-[var(--surface-2)] rounded-lg p-1 shadow-inner">
          <button
            onClick={() => handleViewChange("docs")}
            className={cn(
              `flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[calc(12rem/16)] font-semibold transition-all duration-300 ${
                activeView === "docs"
                  ? "bg-[var(--accent)] text-[#ffffff] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)]"
              }`,
            )}
          >
            <BookOpen size={14} /> Theory
          </button>
          <button
            onClick={() => handleViewChange("visualizer")}
            className={cn(
              `flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[calc(12rem/16)] font-semibold transition-all duration-300 ${
                activeView === "visualizer"
                  ? "bg-[var(--accent)] text-[#ffffff] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)]"
              }`,
            )}
          >
            <Code2 size={14} /> Visualize
          </button>
        </div>
      )}

      {/* Settings Menu Popover */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              `absolute bottom-[calc(100%+8px)] ${collapsed ? "left-14" : "left-3 right-3"} bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50`,
            )}
            style={{ minWidth: collapsed ? "200px" : "auto" }}
          >
            <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--surface-2)]">
              <span className="text-[calc(13rem/16)] font-bold text-[var(--text)]">
                Preferences
              </span>
              <button
                aria-label="Close settings"
                onClick={() => setShowSettings(false)}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[calc(11rem/16)] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Font Size
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFontSize("sm")}
                    className={cn(
                      "flex-1 py-1.5 rounded-md border text-[calc(12rem/16)] transition-all",
                      fontSize === "sm"
                        ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border-[var(--accent)] text-[var(--accent)] font-semibold"
                        : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]",
                    )}
                  >
                    Sm
                  </button>
                  <button
                    onClick={() => setFontSize("md")}
                    className={cn(
                      "flex-1 py-1.5 rounded-md border text-[calc(12rem/16)] transition-all",
                      fontSize === "md"
                        ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border-[var(--accent)] text-[var(--accent)] font-semibold"
                        : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]",
                    )}
                  >
                    Md
                  </button>
                  <button
                    onClick={() => setFontSize("lg")}
                    className={cn(
                      "flex-1 py-1.5 rounded-md border text-[calc(12rem/16)] transition-all",
                      fontSize === "lg"
                        ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] border-[var(--accent)] text-[var(--accent)] font-semibold"
                        : "bg-[var(--surface-2)] border-[var(--border)] text-[var(--text)] font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]",
                    )}
                  >
                    Lg
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-[calc(11rem/16)] font-bold text-[var(--muted)] uppercase tracking-wider">
                  Theme
                </span>
                <div className="pt-2">
                  <ThemeSelector />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer Bar */}
      <div
        className={cn(
          `flex items-center justify-between ${collapsed ? "flex-col gap-3 justify-center" : ""}`,
        )}
      >
        <button
          aria-label="Settings"
          onClick={() => setShowSettings(!showSettings)}
          className={cn(
            `flex items-center justify-center p-2 rounded-[8px] transition-colors ${showSettings ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-[var(--accent)] shadow-sm" : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]"}`,
          )}
          title="Settings"
        >
          <Settings size={16} aria-hidden="true" />
        </button>

        {!collapsed && (
          <div className="text-[calc(10rem/16)] font-medium text-[var(--muted)] px-1 truncate">
            Crafted with passion by <span className="text-[var(--text)] font-bold">Koushik</span>
          </div>
        )}
      </div>
    </div>
  );
}
