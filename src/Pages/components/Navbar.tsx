import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { useEffect, useState, useId } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css"; 

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
  
  // FIX: Explicitly type these objects as framer-motion Variants
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
          <motion.div
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="drawer-backdrop"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ x: "100%" }} 
            animate={{ x: 0 }} 
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.45 }}
            className="drawer-panel"
          >
            <div className="drawer-header">
              <span className="drawer-title">Navigation</span>
              <button onClick={onClose} className="nav-icon-btn">
                <X size={20} />
              </button>
            </div>

            <motion.nav 
              className="drawer-content"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <motion.div key={item.name} variants={itemVariants}>
                    <Link
                      to={item.href}
                      onClick={onClose}
                      className={`drawer-link ${isActive ? "active" : ""}`}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <div className="drawer-footer">
              <p>AlgoVisuals v2.1.0</p>
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
      <nav className="nav-root">
        <div className="nav-inner">
          
          <Logo gradId={gradId} lineGradId={lineGradId} glowId={glowId} mounted={mounted} theme={theme} />
          
          <div className="flex items-center gap-6">
            
            <div className="nav-links-container">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link ${isActive ? "active" : ""}`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="nav-pill"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            <div className="nav-controls">
              <button
                onClick={toggleTheme}
                className="nav-icon-btn"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {mounted ? <ThemeIcon theme={theme} /> : <div className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setDrawerOpen(true)}
                className="nav-icon-btn mobile-menu-btn"
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