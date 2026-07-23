import { useState, useEffect } from "react";
import { useLocation, useMatch, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, X, BadgeInfo } from "lucide-react";
import { cn } from "../lib/utils";
import { RecursiveNavNode } from "./sidebar/SidebarItem";
import { SidebarSkeleton, NotFound } from "./sidebar/SidebarSkeleton";
import { useSidebarSearch } from "./sidebar/hooks/useSidebarSearch";
import { useSidebarData } from "./sidebar/hooks/useSidebarData";
import { SidebarQuickLinks } from "./sidebar/SidebarQuickLinks";
import { SidebarFooter } from "./sidebar/SidebarFooter";

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

  // Resizing and Collapsing State
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(288);
  const [isResizing, setIsResizing] = useState(false);

  const [query, setQuery] = useState("");

  const isAlgo = pathname.startsWith("/algorithms/");
  const isVis = pathname.startsWith("/visualizer/");

  const isSidebarPage = isAlgo || isVis;

  const normalizedTopic = algoTopic?.toLowerCase().replace(/_/g, " ");
  const normalizedPlatform = platform?.toLowerCase().replace(/_/g, " ");

  const { data, loading, error, quickLinks } = useSidebarData(
    isSidebarPage,
    isAlgo,
    isVis,
    normalizedTopic,
    normalizedPlatform,
    algoTopic ?? undefined,
    platform ?? undefined
  );

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
      if (newWidth < 150) {
        setCollapsed(true);
        newWidth = 72;
      } else {
        setCollapsed(false);
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

  const filteredData = useSidebarSearch(data, query);

  if (!isSidebarPage) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : sidebarWidth }}
      transition={isResizing ? { duration: 0 } : { type: "tween", bounce: 0, duration: 0.4 }}
      className={cn(
        `h-[calc(100vh-64px)] flex flex-col bg-[var(--surface)] border-r border-[var(--border)] z-20 shrink-0 ${isResizing ? "select-none" : ""}`,
      )}
    >
      {/* Sidebar Header Section */}
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
        ) : isVis && !query && !collapsed && data?.length === 0 ? (
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

        <SidebarQuickLinks quickLinks={quickLinks} collapsed={collapsed} />
      </div>

      <SidebarFooter
        isAlgo={isAlgo}
        subTopic={subTopic}
        collapsed={collapsed}
        activeView={activeView}
        handleViewChange={handleViewChange}
      />

      {/* Drag Handle */}
      <div
        onMouseDown={startResizing}
        className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[var(--accent)] active:bg-[var(--accent)] z-50 transition-colors"
        title="Drag to resize"
      />
    </motion.aside>
  );
}
