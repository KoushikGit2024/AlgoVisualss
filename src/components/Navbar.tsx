import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Menu, X, Search, Command, Palette, Check } from "lucide-react";
import { cn } from "../lib/utils";
import SearchPalette from "./SearchPalette";
import Logo from "./Logo";
import ThemeSelector from "./ThemeSelector";
const navItems = [
  { name: "Algorithms", href: "/algorithms" },
  { name: "Visualizer", href: "/visualizer" },
  { name: "Editor", href: "/editor" },
];

// ─── Theme Toggle Icon ────────────────────────────────────────────────────────
function ThemeIcon({ theme }: { theme: "light" | "dark" | "system" }) {
  if (theme === "system") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    );
  }
  return theme === "light" ? (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ) : (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({
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
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[280px] sm:w-[320px] flex-col bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] backdrop-blur-xl border-l border-(--border) shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-3.5 border-b border-(--border)">
              <span className="text-sm font-semibold uppercase tracking-widest text-(--muted)">
                Menu
              </span>
              <button
                aria-label="Close menu"
                onClick={onClose}
                className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:bg-(--surface-2) active:scale-95"
              >
                <X size={18} strokeWidth={2.5} aria-hidden="true" />
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
                    "group relative flex w-full items-center px-5 py-4 rounded-sm text-base font-semibold transition-all duration-200 ease overflow-hidden text-(--muted) hover:bg-(--surface-2) hover:text-(--muted)",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Search size={18} />
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
                        `group relative flex w-full items-center px-5 py-4 rounded-sm text-base font-semibold transition-all duration-200 ease overflow-hidden ${
                          isActive
                            ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-(--muted)"
                            : "text-(--muted) hover:bg-(--surface-2) hover:text-(--muted)"
                        }`,
                      )}
                    >
                      {/* Animated Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="mobile-active-pill"
                          className="absolute left-0 top-[25%] bottom-[25%] w-[3px] bg-(--surface-2) rounded-r-[4px] shadow-[0_0_10px_var(--accent)]"
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

              {/* <a 
                href="https://github.com/KoushikGit2024/AlgoVisualss" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-(--muted) hover:text-(--muted) transition-transform hover:scale-110 duration-200"
                aria-label="GitHub Repository"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
                </svg>
              </a> */}

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

// ─── Navbar ───────────────────────────────────────────────────────────────────
export default function Navbar() {
  const pathname = useLocation().pathname;
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [systemPref, setSystemPref] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setThemeDropdownOpen(false);
      }
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(target)) {
        setModeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPref(mediaQuery.matches ? "dark" : "light");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPref(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
    if (savedMode) {
      setTheme(savedMode);
    } else {
      setTheme("system");
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const resolvedTheme = theme === "system" ? systemPref : theme;
    const savedPalette = localStorage.getItem("themePalette") || "default";
    const themeName =
      savedPalette === "default" ? resolvedTheme : `${savedPalette}-${resolvedTheme}`;

    document.documentElement.setAttribute("data-theme", themeName);
    localStorage.setItem("themeMode", theme);
    window.dispatchEvent(new Event("theme-change"));
  }, [theme, systemPref, mounted]);

  useEffect(() => {
    const handleThemeChange = () => {
      const savedMode = localStorage.getItem("themeMode") as "light" | "dark" | "system" | null;
      if (savedMode && savedMode !== theme) {
        setTheme(savedMode);
      } else if (mounted) {
        const resolvedTheme = theme === "system" ? systemPref : theme;
        const savedPalette = localStorage.getItem("themePalette") || "default";
        const themeName =
          savedPalette === "default" ? resolvedTheme : `${savedPalette}-${resolvedTheme}`;
        document.documentElement.setAttribute("data-theme", themeName);
      }
    };
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, [theme, systemPref, mounted]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    document.addEventListener("open-search", handleOpenSearch);
    return () => document.removeEventListener("open-search", handleOpenSearch);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-[64px] border-b border-(--border) bg-[color-mix(in_srgb,var(--bg)_75%,transparent)] backdrop-blur-xl transition-[background,border-color] duration-300 ease-in-out">
        <div className="flex items-center justify-between h-full px-6 mx-auto max-w-[1480px]">
          <Logo />

          <div className="flex items-center gap-6 md:gap-8">
            {/* Centered Main Nav Links */}
            <div className="hidden w-full md:flex md:items-center md:gap-8">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      `relative flex items-center justify-center text-sm font-medium transition-colors duration-200 rounded-lg z-10 hover:text-(--muted) ${
                        isActive ? "text-(--muted)" : "text-(--muted)"
                      }`,
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute -inset-2 rounded-[6px] -z-10 bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Side Tools & Functionalities */}
            <div className="flex items-center gap-3 border-l border-transparent md:border-(--border) md:pl-6 transition-colors">
              {/* Aesthetic Global Search Mockup (Desktop Only) */}
              <button
                className="hidden lg:flex items-center gap-3 px-3 py-1.5 h-[38px] rounded-[10px] bg-[color-mix(in_srgb,var(--surface)_50%,transparent)] border border-(--border) text-(--muted) hover:text-(--muted) hover:border-(--border) transition-all duration-200"
                onClick={() => setIsSearchOpen(true)}
              >
                <div className="flex items-center gap-2 text-sm">
                  <Search size={15} />
                  <span className="font-normal tracking-tight">Search...</span>
                </div>
                <kbd className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-(--surface-2) border border-(--border) text-[calc(10rem/16)] font-[var(--font-geist-mono),monospace] font-semibold text-(--muted)">
                  <Command size={10} /> K
                </kbd>
              </button>

              {/* GitHub Repository Link */}
              <a
                href="https://github.com/KoushikGit2024/AlgoVisualss"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--surface-2)_50%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--text)_5%,transparent)] active:translate-y-px"
                aria-label="GitHub Repository"
              >
                <svg
                  aria-hidden="true"
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

              {/* Theme Palette Dropdown */}
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
                  className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                  aria-label="Toggle palette"
                >
                  <Palette size={16} aria-hidden="true" />
                </button>
                <AnimatePresence>
                  {themeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[calc(100%+8px)] right-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-4 z-50 min-w-[200px]"
                    >
                      <div className="flex flex-col gap-3">
                        <span className="text-[calc(11rem/16)] font-bold text-[var(--muted)] uppercase tracking-wider">
                          Select Palette
                        </span>
                        <ThemeSelector />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle Dropdown */}
              <div className="relative hidden md:block" ref={modeDropdownRef}>
                <button
                  onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
                  className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-[var(--border)] bg-transparent text-[var(--muted)] cursor-pointer transition-all duration-200 ease-in-out hover:text-[var(--text)] hover:border-[var(--border)] hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                  aria-label="Toggle theme mode"
                  suppressHydrationWarning
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div
                      className={cn(
                        "absolute transition-all duration-300",
                        theme === "light"
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-90 scale-50",
                      )}
                    >
                      <ThemeIcon theme="light" />
                    </div>
                    <div
                      className={cn(
                        "absolute transition-all duration-300",
                        theme === "dark"
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-90 scale-50",
                      )}
                    >
                      <ThemeIcon theme="dark" />
                    </div>
                    <div
                      className={cn(
                        "absolute transition-all duration-300",
                        theme === "system"
                          ? "opacity-100 rotate-0 scale-100"
                          : "opacity-0 -rotate-90 scale-50",
                      )}
                    >
                      <ThemeIcon theme="system" />
                    </div>
                  </div>
                </button>
                <AnimatePresence>
                  {modeDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-[calc(100%+8px)] right-0 bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.4)] p-2 z-50 min-w-[140px] flex flex-col gap-1"
                    >
                      {(["light", "dark", "system"] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => {
                            setTheme(mode);
                            setModeDropdownOpen(false);
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                            theme === mode
                              ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]"
                              : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                          )}
                        >
                          <ThemeIcon theme={mode} />
                          <span className="capitalize">{mode}</span>
                          {theme === mode && <Check size={14} className="ml-auto" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center justify-center w-[38px] h-[38px] bg-transparent border cursor-pointer md:hidden rounded-[10px] border-(--border) text-(--muted) transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                aria-label="Open menu"
              >
                <Menu size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} />
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
