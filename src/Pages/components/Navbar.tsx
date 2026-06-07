import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState, useId } from "react";
import { Menu, X } from "lucide-react";

const navItems = [
  { name: "Algorithms",    href: "/algorithms" },
  { name: "Documentation", href: "/documentation" },
  { name: "Visualizer",    href: "/visualizer" },
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

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ gradId, lineGradId, glowId, mounted, theme }: {
  gradId: string; lineGradId: string; glowId: string;
  mounted: boolean; theme: "light" | "dark";
}) {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0 transition-opacity hover:opacity-80">
      <svg className="h-10" viewBox="0 0 320 90" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#818CF8" />
            <stop offset="50%"  stopColor="#A78BFA" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <linearGradient id={lineGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#F472B6" stopOpacity="0.3" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform="translate(12, 10)" filter={`url(#${glowId})`}>
          <g stroke={`url(#${lineGradId})`} strokeWidth="1.5" strokeLinecap="round">
            <line x1="18" y1="32" x2="44" y2="10" />
            <line x1="44" y1="10" x2="70" y2="32" />
            <line x1="70" y1="32" x2="58" y2="60" />
            <line x1="58" y1="60" x2="30" y2="60" />
            <line x1="30" y1="60" x2="18" y2="32" />
            <line x1="44" y1="40" x2="18" y2="32" />
            <line x1="44" y1="40" x2="44" y2="10" />
            <line x1="44" y1="40" x2="70" y2="32" />
          </g>
          <circle cx="18" cy="32" r="4"   fill="#818CF8" opacity="0.9" />
          <circle cx="44" cy="10" r="5.5" fill={`url(#${gradId})`} />
          <circle cx="70" cy="32" r="4"   fill="#34D399" opacity="0.9" />
          <circle cx="58" cy="60" r="3.5" fill="#A78BFA" opacity="0.85" />
          <circle cx="30" cy="60" r="3.5" fill="#F472B6" opacity="0.85" />
          <circle cx="44" cy="40" r="5"   fill={`url(#${gradId})`} />
        </g>

        <text x="96" y="50" fontFamily="var(--font-geist-sans), system-ui, sans-serif" fontSize="26" fontWeight="700" letterSpacing="-0.5">
          <tspan fill={mounted ? (theme === "dark" ? "#EDE9FF" : "#1A1523") : "#EDE9FF"}>Algo</tspan>
          <tspan fill={`url(#${gradId})`}>Visuals</tspan>
        </text>
        <text x="96" y="67" fontFamily="var(--font-geist-mono), monospace" fontSize="9" fontWeight="500" letterSpacing="2.5"
          fill={mounted ? (theme === "dark" ? "#8878B0" : "#6B6787") : "#8878B0"}>
          SEE ALGORITHMS EVOLVE
        </text>
      </svg>
    </Link>
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
            className="fixed top-0 right-0 bottom-0 z-50 flex w-[280px] sm:w-[320px] flex-col bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] backdrop-blur-xl border-l border-[var(--border)] shadow-2xl md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 sm:px-4 py-3.5 border-b border-[var(--border)]">
              <span className="text-sm font-semibold uppercase tracking-widest text-[var(--muted)]">
                Menu
              </span>
              <button 
                onClick={onClose} 
                className="flex items-center justify-center w-[36px] h-[36px] rounded-[10px] border border-[var(--border)] bg-transparent text-[var(--muted)] cursor-pointer transition-all duration-200 ease-in-out hover:text-[var(--text)] hover:bg-[var(--surface-2)] active:scale-95"
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
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <motion.div key={item.name} variants={itemVariants} className="w-full block">
                    
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`group relative flex w-full items-center px-5 py-4 rounded-[4px] text-base font-semibold transition-all duration-200 ease overflow-hidden ${
                        isActive 
                          ? "bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-[var(--accent)]" 
                          : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                      }`}
                    >
                      {/* Animated Active Indicator */}
                      {isActive && (
                        <motion.div 
                          layoutId="mobile-active-pill"
                          className="absolute left-0 top-[25%] bottom-[25%] w-[3px] bg-[var(--accent)] rounded-r-[4px] shadow-[0_0_10px_var(--accent)]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                        />
                      )}
                      
                      {/* Text with Hover Slide */}
                      <span className={`transition-transform duration-200 ${isActive ? "translate-x-1" : "group-hover:translate-x-1"}`}>
                        {item.name}
                      </span>
                    </Link>
                    
                  </motion.div>
                );
              })}
            </motion.nav>

            {/* Footer */}
            <div className="p-2 border-t border-[var(--border)] text-center text-[11px] text-[var(--muted)] font-[var(--font-geist-mono),monospace] absolute bottom-0 w-full">
              <p>AlgoVisuals <span className="opacity-50">v2.1.0</span></p>
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

  const rawId      = useId().replace(/:/g, "");
  const gradId     = `nb-grad-${rawId}`;
  const lineGradId = `nb-line-${rawId}`;
  const glowId     = `nb-glow-${rawId}`;

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
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

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <>
      <nav className="sticky top-0 z-50 w-full h-[64px] border-b border-(--border) bg-[color-mix(in_srgb,var(--bg)_75%,transparent)] backdrop-blur-xl transition-[background,border-color] duration-300 ease-in-out">
        <div className="flex items-center justify-between h-full px-6 mx-auto max-w-[1480px]">
          
          <Logo gradId={gradId} lineGradId={lineGradId} glowId={glowId} mounted={mounted} theme={theme} />
          
          {/* FIXED: Changed to items-center and used gap for natural spacing instead of forced widths */}
          <div className="flex items-center gap-8 md:gap-12">
            
            <div className="hidden w-full md:flex md:items-center md:gap-12">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`relative flex items-center justify-center text-sm font-medium transition-colors duration-200 rounded-lg z-10 hover:text-(--text) ${
                      isActive ? "text-(--accent)" : "text-(--muted)"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        /* FIXED: Kept -inset-2 but removed conflicting px-4 py-2 on the absolute element */
                        className="absolute -inset-2 rounded-[6px] -z-10 bg-[color-mix(in_srgb,var(--accent)_12%,transparent)]"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-(--border) bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:text-(--accent) hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {mounted ? <ThemeIcon theme={theme} /> : <div className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setDrawerOpen(true)}
                className="flex items-center justify-center w-[38px] h-[38px] bg-transparent border cursor-pointer md:hidden rounded-[10px] border-(--border) text-(--muted) transition-all duration-200 ease-in-out hover:text-(--accent) hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] hover:-translate-y-px hover:shadow-[0_4px_12px_color-mix(in_srgb,var(--accent)_10%,transparent)] active:translate-y-px"
                aria-label="Open menu"
              >
                <Menu size={18} />
              </button>
            </div>

          </div>
        </div>
      </nav>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} />
    </>
  );
}