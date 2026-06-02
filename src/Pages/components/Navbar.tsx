import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  ) : (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    <Link to="/" className="flex items-center gap-2 shrink-0">
      <svg className="h-11" viewBox="0 0 320 90" preserveAspectRatio="xMinYMid meet" xmlns="http://www.w3.org/2000/svg">
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

        {/* Icon */}
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
          <circle cx="70" cy="32" r="4"   fill="#34D399"  opacity="0.9" />
          <circle cx="58" cy="60" r="3.5" fill="#A78BFA"  opacity="0.85" />
          <circle cx="30" cy="60" r="3.5" fill="#F472B6"  opacity="0.85" />
          <circle cx="44" cy="40" r="5"   fill={`url(#${gradId})`} />
        </g>

        {/* Wordmark */}
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
function MobileDrawer({
  open, onClose, pathname,
}: {
  open: boolean; onClose: () => void; pathname: string;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-72 flex flex-col p-6 md:hidden"
            style={{ background: "var(--surface)", borderLeft: "1px solid var(--border)" }}
          >
            <button
              onClick={onClose}
              className="self-end mb-8 p-2 rounded-lg transition-colors"
              style={{ color: "var(--muted)" }}
            >
              <X size={20} />
            </button>

            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className="px-4 py-3 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: isActive ? "color-mix(in srgb, var(--accent) 12%, transparent)" : "transparent",
                      color: isActive ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <>
      <nav
        className="w-full h-14 sticky top-0 z-30 px-4 flex items-center justify-center"
        style={{
          background: mounted
            ? theme === "dark"
              ? "rgba(13, 11, 20, 0.85)"
              : "rgba(245, 244, 255, 0.85)"
            : "rgba(13, 11, 20, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="mx-4 h-full px-6 sm:px-8 lg:px-10 flex items-center justify-between w-full">
          {/* Logo */}
          <Logo
            gradId={gradId}
            lineGradId={lineGradId}
            glowId={glowId}
            mounted={mounted}
            theme={theme}
          />
          <div className="flex items-center justify-end h-full w-full gap-4">
            {/* Desktop nav */}
            <div className="hidden md:flex items-center justify-around gap-1 flex-1 w-full max-w-3xl mx-8">
              {navItems.map((item) => {
                const isActive = pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="relative px-4 py-2 text-sm font-medium transition-colors duration-200"
                    style={{
                      color: isActive ? "var(--accent)" : "var(--muted)",
                    }}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute -inset-1 rounded-[2px]"
                        style={{
                          background:
                            "color-mix(in srgb, var(--accent) 12%, transparent)",
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.5,
                        }}
                      />
                    )}

                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2 mx-4">
              <button
                onClick={toggleTheme}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200"
                style={{
                  background: "transparent",
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--accent)";
                  e.currentTarget.style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--muted)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {mounted ? (
                  <ThemeIcon theme={theme} />
                ) : (
                  <div className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                style={{
                  color: "var(--muted)",
                  border: "1px solid var(--border)",
                }}
                aria-label="Open menu"
              >
                <Menu size={16} />
              </button>
            </div>
            <div className="h-1 w-auto"></div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} pathname={pathname} />
    </>
  );
}