import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X,  Search, Command } from "lucide-react";
import { cn } from '../../lib/utils';
import SearchPalette from "./SearchPalette";
import Logo from "./Logo";

const navItems = [
  { name: "Algorithms",    href: "/algorithms" },
  { name: "Visualizer",    href: "/visualizer" },
  { name: "Editor",        href: "/editor" },
];

// ─── Theme Toggle Icon ────────────────────────────────────────────────────────
function ThemeIcon({ theme }: { theme: "light" | "dark" }) {
  return theme === "light" ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}



// ─── Mobile Drawer ────────────────────────────────────────────────────────────
function MobileDrawer({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string; }) {
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.15 }
    },
    exit: { 
      opacity: 0,
      transition: { staggerChildren: 0.05, staggerDirection: -1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, x: 10, transition: { duration: 0.2 } }
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
                onClick={onClose} 
                className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:bg-(--surface-2) active:scale-95"
              >
                <X size={18} strokeWidth={2.5} />
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
                  className={cn("group relative flex w-full items-center px-5 py-4 rounded-sm text-base font-semibold transition-all duration-200 ease overflow-hidden text-(--muted) hover:bg-(--surface-2) hover:text-(--muted)")}
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
                      className={cn(`group relative flex w-full items-center px-5 py-4 rounded-sm text-base font-semibold transition-all duration-200 ease overflow-hidden ${
                        isActive 
                          ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-(--muted)" 
                          : "text-(--muted) hover:bg-(--surface-2) hover:text-(--muted)"
                      }`)}
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
                      <span className={cn(`transition-transform duration-200 ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`)}>
                        {item.name}
                      </span>
                    </Link>
                    
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Footer with Added Links for Mobile */}
            <div className="mt-auto flex flex-col items-center gap-4 p-6 border-t border-(--border)">

              <a 
                href="https://github.com/KoushikGit2024/AlgoVisualss" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-(--muted) hover:text-(--muted) transition-transform hover:scale-110 duration-200"
                aria-label="GitHub Repository"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
                </svg>
              </a>
                

              <div className="text-center text-[11px] text-(--muted) font-[var(--font-geist-mono),monospace]">
                <p>AlgoVisuals <span className="opacity-50">v2.1.0</span></p>
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
  const [theme, setTheme]   = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) {
      setTheme(saved);
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setTheme(mediaQuery.matches ? "dark" : "light");
      
      const handleChange = (e: MediaQueryListEvent) => {
        if (!localStorage.getItem("theme")) {
          setTheme(e.matches ? "dark" : "light");
        }
      };
      
      mediaQuery.addEventListener("change", handleChange);
    if (saved) setTheme(saved);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

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

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

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
                    className={cn(`relative flex items-center justify-center text-sm font-medium transition-colors duration-200 rounded-lg z-10 hover:text-(--muted) ${
                      isActive ? "text-(--muted)" : "text-(--muted)"
                    }`)}
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
                <kbd className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-(--surface-2) border border-(--border) text-[10px] font-[var(--font-geist-mono),monospace] font-semibold text-(--muted)">
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
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
                </svg>
              </a>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {mounted ? <ThemeIcon theme={theme} /> : <div className="w-4 h-4" />}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center justify-center w-[38px] h-[38px] bg-transparent border cursor-pointer md:hidden rounded-[10px] border-(--border) text-(--muted) transition-all duration-200 ease-in-out hover:text-(--muted) hover:border-(--border) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                aria-label="Open menu"
              >
                <Menu size={18} />
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