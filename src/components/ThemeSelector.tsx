import { useEffect, useState, useCallback } from "react";
import { cn } from "../lib/utils";
import { Check } from "lucide-react";

export const THEMES = [
  { id: "default", name: "Default", bg: "#0D0B14", accent: "#818CF8", lightBg: "#F5F4FF", lightAccent: "#6366F1" },
  { id: "ocean", name: "Ocean", bg: "#0F172A", accent: "#38BDF8", lightBg: "#E0F2FE", lightAccent: "#0284C7" },
  { id: "monokai", name: "Monokai", bg: "#272822", accent: "#F92672", lightBg: "#F9F8F5", lightAccent: "#D81A5D" },
  { id: "solarized", name: "Solarized", bg: "#002B36", accent: "#268BD2", lightBg: "#FDF6E3", lightAccent: "#268BD2" },
  { id: "nord", name: "Nord", bg: "#2E3440", accent: "#88C0D0", lightBg: "#ECEFF4", lightAccent: "#5E81AC" },
  { id: "dracula", name: "Dracula", bg: "#282A36", accent: "#FF79C6", lightBg: "#F8F8F2", lightAccent: "#E03C9E" },
  { id: "tokyo-night", name: "Tokyo Night", bg: "#1A1B26", accent: "#7AA2F7", lightBg: "#D5D6DB", lightAccent: "#2E7DE9" }
];

interface ThemeSelectorProps {
  className?: string;
}

export default function ThemeSelector({ className }: ThemeSelectorProps) {
  const [activePalette, setActivePalette] = useState<string>(
    () => localStorage.getItem("themePalette") || "default"
  );
  const [isDarkResolved, setIsDarkResolved] = useState<boolean>(() => {
    const current = document.documentElement.getAttribute("data-theme") || "";
    return current.includes("dark");
  });

  useEffect(() => {
    const handleThemeChange = () => {
      setActivePalette(localStorage.getItem("themePalette") || "default");
      setIsDarkResolved(document.documentElement.getAttribute("data-theme")?.includes("dark") ?? false);
    };

    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  const switchTheme = useCallback((themeId: string) => {
    const savedMode = localStorage.getItem("themeMode") || "dark";
    const mode = savedMode === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : savedMode;
    const finalTheme = themeId === "default" ? mode : `${themeId}-${mode}`;
    
    document.documentElement.setAttribute("data-theme", finalTheme);
    localStorage.setItem("themePalette", themeId);
    
    setActivePalette(themeId);
    window.dispatchEvent(new Event("theme-change"));
  }, []);

  return (
    <div 
      className={cn(
        "flex flex-wrap items-center justify-center gap-3.5", 
        className
      )}
      role="radiogroup"
      aria-label="Select a theme palette"
    >
      {THEMES.map((theme) => {
        const isActive = activePalette === theme.id;
        const displayBg = !isDarkResolved ? theme.lightBg : theme.bg;
        const displayAccent = !isDarkResolved ? (theme.lightAccent || theme.accent) : theme.accent;
        
        return (
          <button
            key={theme.id}
            role="radio"
            aria-checked={isActive}
            onClick={() => switchTheme(theme.id)}
            className={cn(
              "group relative flex items-center justify-center w-8 h-8 rounded-full outline-none transition-all duration-300 ease-out",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              isActive 
                ? "scale-110 shadow-lg z-10" 
                : "hover:scale-110 hover:shadow-md hover:-translate-y-0.5 hover:z-10 cursor-pointer"
            )}
            style={{ 
              background: `linear-gradient(135deg, ${displayBg} 50%, ${displayAccent} 50%)`,
              // Uses CSS variables for the gap ring to dynamically match the app's background
              boxShadow: isActive 
                ? `0 0 0 2px var(--surface, ${!isDarkResolved ? '#ffffff' : '#0D0B14'}), 0 0 0 4px ${displayAccent}` 
                : `0 0 0 1px inset rgba(128, 128, 128, 0.2)`
            }}
          >
            {/* Elegant Hover Tooltip */}
            <span className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 px-2.5 py-1 bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-800 text-[calc(11rem/16)] font-medium rounded-md pointer-events-none whitespace-nowrap shadow-xl">
              {theme.name}
              {/* Tooltip triangle indicator */}
              <svg className="absolute text-zinc-800 dark:text-zinc-100 h-1.5 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
              </svg>
            </span>

            {/* Animated Inner Dot */}
            <div 
              className={cn(
                "flex items-center justify-center rounded-full transition-all duration-300 ease-out",
                isActive ? "w-5 h-5 opacity-100 scale-100 shadow-sm" : "w-0 h-0 opacity-0 scale-50"
              )}
              style={{ backgroundColor: 'var(--surface)' }}
            >
              <Check 
                size={12} 
                strokeWidth={4} 
                color={displayAccent} 
                className={cn(
                  "transition-transform duration-300 delay-75", 
                  isActive ? "scale-100" : "scale-0"
                )}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
