import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useMatch, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import {
  Search,
  X,
  ChevronRight,
  AlertCircle,
  BadgeInfo,
  Settings,
  BookOpen,
  Code2,
} from "lucide-react";
import ALGODATA from "../Pages/algorithms/data/AlgoData";
import PLATFORMDATA from "../Pages/visualizer/data/PlatformData";
import { CategoryIcon } from "./icons";
import { cn } from "../lib/utils";
import ThemeSelector from "./ThemeSelector";

// ─── Types ────────────────────────────────────────────────────────────────────
export type NavItem = {
  id: string;
  label: string;
  url?: string;
  icon?: any;
  hoverIcon?: any;
  badge?: string;
  children?: NavItem[];
};

// ─── Utilities ────────────────────────────────────────────────────────────────

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="px-1 py-px rounded-[4px] bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-[var(--accent)] font-semibold shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_40%,transparent)]">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function filterNavTree(items: NavItem[], query: string): NavItem[] {
  if (!query) return items;
  const q = query.toLowerCase();

  return items.reduce<NavItem[]>((acc, item) => {
    const matchesNode = item.label.toLowerCase().includes(q);
    if (item.children) {
      const filteredChildren = filterNavTree(item.children, query);
      if (matchesNode || filteredChildren.length > 0) {
        acc.push({
          ...item,
          children: filteredChildren.length > 0 ? filteredChildren : item.children,
        });
      }
    } else if (matchesNode) {
      acc.push(item);
    }
    return acc;
  }, []);
}

// ─── UI States ────────────────────────────────────────────────────────────────
function SidebarSkeleton() {
  const stagger: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } },
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="px-4 py-4 flex flex-col gap-5"
    >
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <motion.div
            variants={item}
            className="h-5 rounded-md bg-[var(--surface-2)] animate-pulse w-2/3"
          />
          <motion.div
            variants={item}
            className="h-4 rounded-md bg-[var(--surface-2)] animate-pulse w-5/6 ml-4 opacity-60"
          />
          <motion.div
            variants={item}
            className="h-4 rounded-md bg-[var(--surface-2)] animate-pulse w-3/4 ml-4 opacity-60"
          />
        </div>
      ))}
    </motion.div>
  );
}

function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-48 text-[var(--muted)] text-center p-6 text-[calc(13rem/16)]"
    >
      <AlertCircle size={28} className="mb-3 opacity-40 text-[var(--accent)]" />
      <p className="font-semibold text-sm mb-0.5 text-[var(--text)] tracking-tight">
        No Results Found
      </p>
      <p className="opacity-80">Try tweaking your search index query.</p>
    </motion.div>
  );
}

// ─── Recursive Component ──────────────────────────────────────────────────────
function RecursiveNavNode({
  item,
  level = 0,
  pathname,
  query,
  collapsed,
  onExpandSidebar,
  search,
}: {
  item: NavItem;
  level?: number;
  pathname: string;
  query: string;
  collapsed: boolean;
  onExpandSidebar: () => void;
  search: string;
}) {
  const isFolder = !!item.children && item.children.length > 0;
  const isActiveLink = pathname === item.url;
  const isTopLevel = level === 0;

  const [isOpen, setIsOpen] = useState(isTopLevel);
  const isExpanded = (isOpen || query.length > 0) && !collapsed;

  const handleClick = (e: React.MouseEvent) => {
    if (collapsed) onExpandSidebar();
    if (isFolder) {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="flex flex-col">
      <div
        onClick={handleClick}
        className={cn(`group relative w-full flex items-center py-2 rounded-[4px] cursor-pointer transition-all duration-200 ease-out outline-none my-[2px]
          ${collapsed ? "justify-center px-0" : "pr-3"}
          ${
            isActiveLink
              ? "text-[var(--accent)] font-semibold"
              : isTopLevel
                ? "text-[var(--text)] font-medium tracking-tight hover:bg-[var(--surface-2)]"
                : "text-[var(--muted)] font-normal hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--surface-2)_40%,transparent)]"
          }`)}
        style={{ paddingLeft: collapsed ? "0px" : `${16 + level * 12}px` }}
      >
        {/* Shared Layout Track Hover Ring & Pill System */}
        {isActiveLink && !isFolder && (
          <motion.div
            layoutId="sidebar-premium-pill"
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] rounded-0 border-l-2 border-[var(--accent)]"
            initial={false}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <div
          className={cn(
            `relative z-10 flex items-center w-full gap-2 ${collapsed ? "justify-center" : "justify-between"}`,
          )}
        >
          <div
            className={cn(
              `flex items-center gap-2 flex-1 min-w-0 ${collapsed ? "justify-center" : ""}`,
            )}
          >
            {/* SVG Swap magic driven by CSS classes */}
            {item.icon && typeof item.icon !== "string" && (
              <div className="w-5 h-5 flex items-center justify-center shrink-0 text-[var(--muted)] group-hover:hidden transition-opacity">
                {item.icon}
              </div>
            )}
            {item.hoverIcon && (
              <div className="w-5 h-5 items-center justify-center shrink-0 hidden group-hover:flex">
                {item.hoverIcon}
              </div>
            )}

            {/* Supress text and badges when collapsed */}
            {!collapsed && (
              <>
                <Link to={item.url ? `${item.url}${search}` : "#"} className="flex-1 min-w-0">
                  <span
                    title={item.label}
                    className={cn(
                      `block truncate ${isTopLevel ? "text-[calc(14rem/16)] font-semibold" : "text-[calc(13rem/16)]"}`,
                    )}
                  >
                    <Highlighted text={item.label} query={query} />
                  </span>
                </Link>

                {/* Difficulty Badge System */}
                {item.badge && (
                  <span
                    className={cn(`text-[calc(9rem/16)] font-bold px-1.5 py-0.5 rounded-sm shrink-0 whitespace-nowrap uppercase tracking-widest
                    ${
                      item.badge === "Easy"
                        ? "text-[#34D399] bg-[#34D399]/10"
                        : item.badge === "Medium"
                          ? "text-[#FBBF24] bg-[#FBBF24]/10"
                          : item.badge === "Hard"
                            ? "text-[#EF4444] bg-[#EF4444]/10"
                            : "text-[var(--muted)] bg-[var(--surface-2)]"
                    }
                  `)}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Suppress chevron when collapsed */}
          {isFolder && !collapsed && (
            <ChevronRight
              size={14}
              className={cn(
                `shrink-0 transition-transform duration-300 ease-out text-[var(--muted)] group-hover:text-[var(--text)] ${isExpanded ? "rotate-90" : ""}`,
              )}
            />
          )}
        </div>
      </div>

      {/* Recursive Nested Groups */}
      <AnimatePresence initial={false}>
        {isFolder && isExpanded && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-l border-[color-mix(in_srgb,var(--border)_50%,transparent)] ml-[23px] pl-1"
          >
            <div className="flex flex-col py-0.5">
              {item.children!.map((subItem) => (
                <RecursiveNavNode
                  key={subItem.id}
                  item={subItem}
                  level={level + 1}
                  pathname={pathname}
                  query={query}
                  collapsed={collapsed}
                  onExpandSidebar={onExpandSidebar}
                  search={search}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar Master Component ─────────────────────────────────────────────────
export default function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;

  // Extract parameters for visualizer or algorithms routes
  const visParams = useMatch("/visualizer/:platform/:qid?/*");
  const algoParams = useMatch("/algorithms/:topic/:subTopic?/*");

  const { platform } = visParams?.params || { platform: null };
  const { topic: algoTopic, subTopic } = algoParams?.params || { topic: null, subTopic: null };

  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get("openCode") === "true" ? "visualizer" : "docs";

  const handleViewChange = (view: "docs" | "visualizer") => {
    const newParams = new URLSearchParams(searchParams);
    if (view === "visualizer") {
      newParams.set("openCode", "true");
    } else {
      newParams.delete("openCode");
    }
    setSearchParams(newParams, { replace: true });
  };

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

  // Resizing and Collapsing State
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);

  const [query, setQuery] = useState("");
  const [data, setData] = useState<NavItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isAlgo = pathname.startsWith("/algorithms/");
  const isVis = pathname.startsWith("/visualizer/");

  const isSidebarPage = isAlgo || isVis;

  // const currentTopic = isAlgo ? (algoTopic || "algorithms") : (platform || "visualizer");

  const normalizedTopic = algoTopic?.toLowerCase().replace(/_/g, " ");
  const normalizedPlatform = platform?.toLowerCase().replace(/_/g, " ");

  const quickLinks = useMemo(() => {
    if (isAlgo && normalizedTopic && normalizedTopic !== "algorithms") {
      return ALGODATA.filter((a) => a.name.toLowerCase() !== normalizedTopic).map((a) => {
        return {
          name: a.name,
          href: a.href,
          icon: <CategoryIcon name={a.iconId} />,
          hoverIcon: <CategoryIcon name={a.hoverIconId || a.iconId} hover={true} />,
          featured: (a as any).featured,
        };
      });
    }
    if (isVis && normalizedPlatform && normalizedPlatform !== "visualizer") {
      return PLATFORMDATA.filter((p: any) => p.name.toLowerCase() !== normalizedPlatform).map(
        (p: any) => ({
          name: p.name,
          href: p.href,
          icon: p.icon,
          hoverIcon: p.hoverIcon,
          featured: p.featured,
        }),
      );
    }
    return [];
  }, [isAlgo, isVis, normalizedTopic, normalizedPlatform]);

  // Auto-collapse sidebar when opening CodeWindow (Algorithms route)
  useEffect(() => {
    if (isAlgo) {
      setCollapsed(true);
    }
  }, [isAlgo]);

  // ─── Drag to Resize Logic ──────────────────────────────────────────
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      let newWidth = e.clientX;

      // Snapping to collapse threshold
      if (newWidth < 150) {
        setCollapsed(true);
        newWidth = 72; // Snap to compact width
      } else {
        setCollapsed(false);
        // Add max-width limitation so they don't break the layout
        if (newWidth > 600) newWidth = 600;
      }

      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "default";
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // ─── Data Fetching ───────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    if (!isSidebarPage) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // ─── PLATFORMDATA Mapping Logic ────────────────────────────────────
    if (isVis) {
      // Filter to specific platform if applicable, otherwise load everything
      const targetPlatforms =
        normalizedPlatform && normalizedPlatform !== "visualizer"
          ? PLATFORMDATA.filter((p) => p.name.toLowerCase() === normalizedPlatform)
          : PLATFORMDATA;

      const dataToMapVis = targetPlatforms.length > 0 ? targetPlatforms : PLATFORMDATA;

      // Map PLATFORMDATA structure strictly to NavItem type
      const visNavItems: NavItem[] = dataToMapVis.map((p: any) => ({
        id: p.name.toLowerCase().replace(/\s+/g, "-"),
        label: p.name,
        url: p.href,
        icon: p.icon,
        hoverIcon: p.hoverIcon,
        // Optional mapping in case PLATFORMDATA eventually includes nested `items`
        children: p.items?.map((sub: any) => ({
          id: sub.name.toLowerCase().replace(/\s+/g, "-"),
          label: sub.name,
          url: sub.href,
          badge: sub.type,
        })),
      }));

      if (isMounted) {
        setData(visNavItems);
        setLoading(false);
      }
      return;
    }

    // ─── ALGODATA Mapping Logic ────────────────────────────────────
    if (isAlgo) {
      // Filter to specific topic if applicable, otherwise load everything
      const targetAlgos =
        normalizedTopic && normalizedTopic !== "algorithms"
          ? ALGODATA.filter((algo) => algo.name.toLowerCase() === normalizedTopic)
          : ALGODATA;

      // Fallback in case a user enters an invalid route so sidebar doesn't blank out
      const dataToMap = targetAlgos.length > 0 ? targetAlgos : ALGODATA;

      // Map ALGODATA structure strictly to NavItem type
      const algoNavItems: NavItem[] = dataToMap.map((algo) => {
        return {
          id: algo.name.toLowerCase().replace(/\s+/g, "-"),
          label: algo.name,
          url: algo.href,
          icon: <CategoryIcon name={algo.iconId} />,
          hoverIcon: <CategoryIcon name={algo.hoverIconId || algo.iconId} hover={true} />,
          children: algo.items?.map((sub: any) => ({
            id: sub.name.toLowerCase().replace(/\s+/g, "-"),
            label: sub.name,
            url: sub.href,
            badge: sub.type,
          })),
        };
      });

      if (isMounted) {
        setData(algoNavItems);
        setLoading(false);
      }
      return;
    }

    if (isMounted) setLoading(false);

    return () => {
      isMounted = false;
    };
  }, [algoTopic, isSidebarPage, isAlgo, isVis, platform, normalizedTopic, normalizedPlatform]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterNavTree(data, query);
  }, [data, query]);

  if (!isSidebarPage) return null;

  return (
    <motion.aside
      initial={false}
      // Animate seamlessly switches between snapped collapse or dynamic width
      animate={{ width: collapsed ? 72 : sidebarWidth }}
      // Prevent Framer easing delay while actively resizing by setting duration: 0
      transition={isResizing ? { duration: 0 } : { type: "tween", bounce: 0, duration: 0.4 }}
      className={cn(
        `h-[calc(100vh-64px)] flex flex-col bg-[var(--surface)] border-r border-[var(--border)] z-20 shrink-0 ${isResizing ? "select-none" : ""}`,
      )}
    >
      {/* Sidebar Header Section (Replaces the large banner) */}
      <div
        className={cn(
          "flex items-center p-3 shrink-0 transition-all duration-300 border-b border-[color-mix(in_srgb,var(--border)_50%,transparent)]",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 overflow-hidden">
            <span className="text-[calc(12rem/16)] font-semibold text-[var(--muted)] uppercase tracking-wider truncate">
              {isAlgo ? "Algorithm Explorer" : "Visualizer"}
            </span>
          </div>
        )}
        <button
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
              if (sidebarWidth < 150) setSidebarWidth(288);
            } else {
              setCollapsed(true);
            }
          }}
          className="flex items-center justify-center w-8 aspect-square rounded-[6px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)] transition-colors shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <path d="M15 15l-3-3 3-3" />
            </svg>
          </motion.div>
        </button>
      </div>

      {/* Input controls layout */}
      <div
        className={cn(
          "flex items-center p-4 transition-all duration-300 ease-in-out",
          collapsed ? "justify-center" : "",
        )}
      >
        {!collapsed ? (
          <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[4px] transition-all duration-200 focus-within:border-[var(--accent)] focus-within:ring-[3px] focus-within:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] shadow-sm">
            <Search size={15} className="text-[var(--muted)] shrink-0" />
            <input
              value={query}
              aria-label="search-question"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isVis ? "Search by title or ID..." : "Quick search index…"}
              className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-[13.5px] text-[var(--text)] font-medium truncate placeholder:text-[var(--muted)] placeholder:font-normal"
            />
            {isVis && (
              <div
                title="For LeetCode, CodeForces and CodeChef IDs"
                className="shrink-0 flex items-center"
              >
                <BadgeInfo size={16} className="text-[var(--muted)]" />
              </div>
            )}
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="text-[var(--muted)] hover:text-[var(--text)] transition-colors shrink-0 flex items-center"
              >
                <X size={14} strokeWidth={3} aria-hidden="true" />
              </button>
            )}
          </div>
        ) : (
          <button
            aria-label="Search"
            onClick={() => {
              setCollapsed(false);
              if (sidebarWidth < 150) setSidebarWidth(288);
            }}
            className="flex items-center justify-center w-8 aspect-square rounded-[6px] text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
            title="Search"
          >
            <Search size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-6 styled-scrollbar">
        {loading ? (
          <SidebarSkeleton />
        ) : isVis && !query && !collapsed && data?.length === 0 ? ( // Updated conditional since mock problem IDs are removed
          /* Visualizer Empty Search State */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-48 text-[var(--muted)] text-center p-6 text-[calc(13rem/16)]"
          >
            <Search size={28} className="mb-3 opacity-40 text-[var(--accent)]" />
            <p className="font-semibold text-sm mb-0.5 text-[var(--text)] tracking-tight">
              Search Questions
            </p>
            <p className="opacity-80">
              Type a problem ID or name (e.g., "Two Sum") to see if it's available.
            </p>
          </motion.div>
        ) : error || !data || data.length === 0 || filteredData.length === 0 ? (
          <NotFound />
        ) : (
          <div className="flex flex-col pb-4" style={{ gap: collapsed ? 10 : 0 }}>
            {filteredData.map((item) => (
              <RecursiveNavNode
                key={item.id}
                item={item}
                pathname={pathname}
                query={query}
                collapsed={collapsed}
                onExpandSidebar={() => {
                  setCollapsed(false);
                  if (sidebarWidth < 150) setSidebarWidth(288);
                }}
                search={search}
              />
            ))}
          </div>
        )}

        {/* New Quick Links Section */}
        {quickLinks.length > 0 && !loading && !error && !query && (
          <div
            className={cn(
              "mt-2 pt-4 pb-2 border-t border-[color-mix(in_srgb,var(--border)_50%,transparent)]",
              collapsed ? "flex flex-col items-center gap-3" : "w-full overflow-hidden",
            )}
          >
            {!collapsed && (
              <span className="text-[9.5px] font-bold text-[var(--muted)] uppercase tracking-widest mb-2.5 block px-1">
                Explore More
              </span>
            )}

            <div
              className={cn(
                "flex gap-2",
                collapsed
                  ? "flex-col items-center"
                  : "overflow-x-auto snap-x snap-mandatory px-1 pb-3 pt-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
              )}
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  title={link.name}
                  className={cn(
                    "relative flex items-center justify-center transition-all group shrink-0 snap-start",
                    collapsed
                      ? "w-8 h-8 rounded-md hover:bg-[var(--surface-2)]"
                      : "flex-col gap-1 w-[80px] h-[64px] rounded-[8px] bg-[var(--surface-2)] border border-[color-mix(in_srgb,var(--border)_50%,transparent)] hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_5%,transparent)] hover:text-[var(--text)] text-[calc(10rem/16)] text-[var(--muted)] font-medium shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5",
                  )}
                >
                  {/* {link.featured && (
                    <div className={cn("absolute", collapsed ? "-top-1 -right-1" : "top-1 right-1")} title="Featured Topic">
                      <Sparkles size={collapsed ? 8 : 10} className="text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.5)] animate-pulse" />
                    </div>
                  )} */}
                  <div
                    className={cn(
                      "shrink-0 transition-all flex items-center justify-center",
                      collapsed
                        ? "w-4 h-4 text-[var(--muted)] opacity-70 group-hover:text-[var(--accent)] group-hover:opacity-100"
                        : "w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:text-[var(--accent)] group-hover:scale-110",
                    )}
                  >
                    {link.hoverIcon ? (
                      <>
                        <div className="flex items-center justify-center group-hover:hidden transition-opacity w-full h-full">
                          {link.icon}
                        </div>
                        <div className="hidden items-center justify-center group-hover:flex w-full h-full">
                          {link.hoverIcon}
                        </div>
                      </>
                    ) : (
                      link.icon
                    )}
                  </div>
                  {!collapsed && (
                    <span className="truncate w-full text-center px-1 font-semibold tracking-tight">
                      {link.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Sidebar Footer ─── */}
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

      {/* ─── Drag Handle ─── */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent)] active:bg-[var(--accent)] z-50 transition-colors"
        title="Drag to resize"
      />
    </motion.aside>
  );
}
