import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { Menu, Search, Command } from "lucide-react";
import { cn } from "../lib/utils";
import SearchPalette from "./SearchPalette";
import Logo from "./Logo";
import { NavbarMobileDrawer } from "./navbar/NavbarMobileDrawer";
import { NavbarThemeDropdown } from "./navbar/NavbarThemeDropdown";
import { NavbarPaletteDropdown } from "./navbar/NavbarPaletteDropdown";

const navItems = [
  { name: "Algorithms", href: "/algorithms" },
  { name: "Visualizer", href: "/visualizer" },
  { name: "Editor", href: "/editor" },
];

export default function Navbar() {
  const pathname = useLocation().pathname;
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [systemPref, setSystemPref] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setThemeDropdownOpen(false);
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

              {/* Theme Color Palette Dropdown */}
              <NavbarPaletteDropdown />

              {/* Theme Palette Dropdown */}
              <NavbarThemeDropdown
                theme={theme}
                setTheme={setTheme}
                dropdownRef={dropdownRef}
                themeDropdownOpen={themeDropdownOpen}
                setThemeDropdownOpen={setThemeDropdownOpen}
              />

              {/* Mobile Menu Button */}
              <button
                className="flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border border-transparent bg-transparent text-(--muted) cursor-pointer transition-all duration-200 ease-in-out hover:bg-(--surface-2) hover:border-(--border) active:scale-95 md:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={22} strokeWidth={2.5} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <NavbarMobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        pathname={pathname}
      />

      <AnimatePresence>
        {isSearchOpen && (
          <SearchPalette
            isOpen={isSearchOpen}
            onClose={() => setIsSearchOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
