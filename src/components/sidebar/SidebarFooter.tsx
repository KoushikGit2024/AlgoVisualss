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
    <div className="shrink-0 flex flex-col border-t border-(--border) bg-(--surface) p-3 gap-3 relative z-30">
      {/* Toggle Docs/Visualizer */}
      {isAlgo && subTopic && (
        collapsed ? (
          <button
            onClick={() => handleViewChange(activeView === "docs" ? "visualizer" : "docs")}
            title={`Switch to ${activeView === "docs" ? 'Visualize' : 'Theory'}`}
            className="flex items-center justify-center p-2 rounded-lg transition-all duration-300 mx-auto w-10 h-10 border border-(--border) bg-(--surface-2) text-(--muted) hover:text-(--accent) hover:border-(--accent)/50 hover:bg-(--accent)/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15)]"
          >
            {activeView === "docs" ? <Code2 size={20} /> : <BookOpen size={20} />}
          </button>
        ) : (
          <div className="flex items-center bg-(--surface-2) rounded-lg p-1 shadow-inner">
            <button
              onClick={() => handleViewChange("docs")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-300",
                activeView === "docs"
                  ? "bg-(--accent) text-[#ffffff] shadow-sm"
                  : "text-(--muted) hover:text-(--text) hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)]"
              )}
            >
              <BookOpen size={14} /> Theory
            </button>
            <button
              onClick={() => handleViewChange("visualizer")}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[12px] font-semibold transition-all duration-300",
                activeView === "visualizer"
                  ? "bg-(--accent) text-[#ffffff] shadow-sm"
                  : "text-(--muted) hover:text-(--text) hover:bg-[color-mix(in_srgb,var(--text)_5%,transparent)]"
              )}
            >
              <Code2 size={14} /> Visualize
            </button>
          </div>
        )
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
              `absolute bottom-[calc(100%+8px)] ${collapsed ? "left-14" : "left-3 right-3"} bg-(--surface) border border-(--border) rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden z-50`,
            )}
            style={{ minWidth: collapsed ? "200px" : "auto" }}
          >
            <div className="flex items-center justify-between p-3 border-b border-(--border) bg-(--surface-2)">
              <span className="text-[13px]] font-bold text-(--text)">
                Preferences
              </span>
              <button
                aria-label="Close settings"
                onClick={() => setShowSettings(false)}
                className="text-(--muted) hover:text-(--text) transition-colors"
              >
                <X size={14} aria-hidden="true" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
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
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-bold text-(--muted) uppercase tracking-wider">
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
            `flex items-center justify-center p-2 rounded-md transition-colors ${showSettings ? "bg-[color-mix(in_srgb,var(--accent)_15%,transparent)] text-(--accent) shadow-sm" : "text-(--muted) hover:text-(--text) hover:bg-(--surface-2)"}`,
          )}
          title="Settings"
        >
          <Settings size={16} aria-hidden="true" />
        </button>

        {!collapsed && (
          <div className="text-[10px] font-medium text-(--muted) px-1 truncate">
            Crafted with passion by <span className="text-(--text) font-bold">Koushik</span>
          </div>
        )}
      </div>
    </div>
  );
}
