import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useMatch } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Search, X, ChevronRight, AlertCircle, Code, Database, Activity, Box, Cpu, FileText, MonitorPlay, BadgeInfo } from "lucide-react";
import { ALGORITHMSNAV } from "../algorithms/data/categories/AlgoCategories";

// ─── Types ────────────────────────────────────────────────────────────────────
export type NavItem = {
  id: string;
  label: string;
  url?: string;
  icon?: React.ReactNode; 
  hoverIcon?: React.ReactNode;
  badge?: string;
  children?: NavItem[];
};

// ─── Mock Data for Visualizer ─────────────────────────────────────────────────
const VISUALIZER_NAV: NavItem[] = [
  {
    id: "leetcode",
    label: "LeetCode",
    icon: <Code className="w-4 h-4" />,
    children: [
      { id: "lc-1", label: "1. Two Sum", url: "/visualizer/leetcode/1", badge: "Easy" },
      { id: "lc-15", label: "15. 3Sum", url: "/visualizer/leetcode/15", badge: "Medium" },
      { id: "lc-42", label: "42. Trapping Rain Water", url: "/visualizer/leetcode/42", badge: "Hard" },
      { id: "lc-206", label: "206. Reverse Linked List", url: "/visualizer/leetcode/206", badge: "Easy" },
    ]
  },
  {
    id: "codeforces",
    label: "Codeforces",
    icon: <Activity className="w-4 h-4" />,
    children: [
      { id: "cf-4a", label: "4A. Watermelon", url: "/visualizer/codeforces/4A", badge: "Easy" },
      { id: "cf-158a", label: "158A. Next Round", url: "/visualizer/codeforces/158A", badge: "Easy" },
      { id: "cf-71a", label: "71A. Way Too Long Words", url: "/visualizer/codeforces/71A", badge: "Easy" },
    ]
  },
  {
    id: "cses",
    label: "CSES Problem Set",
    icon: <Database className="w-4 h-4" />,
    children: [
      { id: "cses-1068", label: "1068. Weird Algorithm", url: "/visualizer/cses/1068", badge: "Easy" },
      { id: "cses-1083", label: "1083. Missing Number", url: "/visualizer/cses/1083", badge: "Easy" },
    ]
  }
];

// ─── Utilities ────────────────────────────────────────────────────────────────
function getTopicHeroIcon(topicName: string | null) {
  const norm = topicName?.toLowerCase() || "";
  if (norm.includes("visualizer") || norm.includes("leetcode")) return <MonitorPlay className="w-6 h-6 text-[#EC4899]" />;
  if (norm.includes("algo")) return <Box className="w-6 h-6 text-[#8B5CF6]" />;
  if (norm.includes("cpp") || norm.includes("c++")) return <Code className="w-6 h-6 text-[#34D399]" />;
  if (norm.includes("javascript") || norm.includes("js")) return <Code className="w-6 h-6 text-[#FBBF24]" />;
  if (norm.includes("python")) return <Code className="w-6 h-6 text-[#60A5FA]" />;
  if (norm.includes("react")) return <Cpu className="w-6 h-6 text-[#38BDF8]" />;
  if (norm.includes("tailwind")) return <Box className="w-6 h-6 text-[#06B6D4]" />;
  if (norm.includes("node")) return <Cpu className="w-6 h-6 text-[#4ADE80]" />;
  if (norm.includes("express")) return <Activity className="w-6 h-6 text-[#9CA3AF]" />;
  if (norm.includes("socket")) return <Activity className="w-6 h-6 text-[#FCD34D]" />;
  if (norm.includes("mongo")) return <Database className="w-6 h-6 text-[#22C55E]" />;
  if (norm.includes("postgres")) return <Database className="w-6 h-6 text-[#60A5FA]" />;
  if (norm.includes("redis")) return <Database className="w-6 h-6 text-[#EF4444]" />;
  if (norm.includes("tensorflow")) return <Cpu className="w-6 h-6 text-[#F97316]" />;
  return <FileText className="w-6 h-6 text-[var(--accent)]" />;
}

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
        acc.push({ ...item, children: filteredChildren.length > 0 ? filteredChildren : item.children });
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
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 22 } }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="px-4 py-4 flex flex-col gap-5">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <motion.div variants={item} className="h-5 rounded-md bg-[var(--surface-2)] animate-pulse w-2/3" />
          <motion.div variants={item} className="h-4 rounded-md bg-[var(--surface-2)] animate-pulse w-5/6 ml-4 opacity-60" />
          <motion.div variants={item} className="h-4 rounded-md bg-[var(--surface-2)] animate-pulse w-3/4 ml-4 opacity-60" />
        </div>
      ))}
    </motion.div>
  );
}

function NotFound() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-[var(--muted)] text-center p-6 text-[13px]">
      <AlertCircle size={28} className="mb-3 opacity-40 text-[var(--accent)]" />
      <p className="font-semibold text-sm mb-0.5 text-[var(--text)] tracking-tight">No Results Found</p>
      <p className="opacity-80">Try tweaking your search index query.</p>
    </motion.div>
  );
}

// ─── Recursive Component ──────────────────────────────────────────────────────
function RecursiveNavNode({
  item, level = 0, pathname, query, collapsed, onExpandSidebar
}: {
  item: NavItem; level?: number; pathname: string; query: string;
  collapsed: boolean; onExpandSidebar: () => void;
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
        // to={item.url || "#"}
        onClick={handleClick}
        className={`group relative w-full flex items-center py-2 rounded-[4px] cursor-pointer transition-all duration-200 ease-out outline-none my-[2px]
          ${collapsed ? "justify-center px-0" : "pr-3"}
          ${isActiveLink 
            ? "text-[var(--accent)] font-semibold" 
            : isTopLevel
              ? "text-[var(--text)] font-medium tracking-tight hover:bg-[var(--surface-2)]"
              : "text-[var(--muted)] font-normal hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--surface-2)_40%,transparent)]"
          }`}
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

        <div className={`relative z-10 flex items-center w-full gap-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-2 truncate ${collapsed ? "justify-center w-full" : "w-9/10"} ${!isFolder && "justify-between"}`}>
            {/* SVG Swap magic driven by CSS classes */}
            {item.icon && (typeof item.icon !== "string") && (
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
                <Link to={item.url || "#"}>
                  <span title={item.label} className={`truncate ${isTopLevel ? "text-[14px] font-semibold" : "text-[13px]"}`}>
                    <Highlighted text={item.label} query={query} />
                  </span>
                </Link>
                
                {/* Difficulty Badge System */}
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-widest
                    ${item.badge === 'Easy' ? 'text-[#34D399] bg-[#34D399]/10' :
                      item.badge === 'Medium' ? 'text-[#FBBF24] bg-[#FBBF24]/10' :
                      item.badge === 'Hard' ? 'text-[#EF4444] bg-[#EF4444]/10' :
                      'text-[var(--muted)] bg-[var(--surface-2)]'}
                  `}>
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
              className={`shrink-0 transition-transform duration-300 ease-out text-[var(--muted)] group-hover:text-[var(--text)] ${isExpanded ? "rotate-90" : ""}`} 
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
  const pathname = useLocation().pathname;
  
  // Extract parameters for visualizer or algorithms routes
  const visParams = useMatch("/visualizer/:platform/:qid?/*");
  const algoParams = useMatch("/algorithms/:topic/:subTopic?/*");
  
  const { platform } = visParams?.params || { platform: null };
  const { topic: algoTopic } = algoParams?.params || { topic: null };

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
  
  const currentTopic = isAlgo ? (algoTopic || "algorithms") : (platform || "visualizer");

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
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = 'col-resize';
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

    if (isVis) {
      if (isMounted) {
        setData(VISUALIZER_NAV);
        setLoading(false);
      }
      return;
    }

    if (isAlgo) {
      const targetAlgos = algoTopic
        ? ALGORITHMSNAV.filter((algo) => algo.name.toLowerCase() === (algoTopic.toLowerCase()).replace('_',' '))
        : ALGORITHMSNAV;

      const algoNavItems: NavItem[] = targetAlgos.map(algo => ({
        id: algo.name.toLowerCase().replace(/\s+/g, '-'),
        label: algo.name,
        url: algo.href,
        icon: algo.icon,
        hoverIcon: algo.hoverIcon,
        children: algo.items?.map(sub => ({
          id: sub.name.toLowerCase().replace(/\s+/g, '-'),
          label: sub.name,
          url: sub.href,
          badge: sub.type
        }))
      }));

      if (isMounted) {
        setData(algoNavItems);
        setLoading(false);
      }
      return;
    }

    if (isMounted) setLoading(false);
    
    return () => { isMounted = false; };
  }, [algoTopic, isSidebarPage, isAlgo, isVis, pathname, platform]);

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
      className={`h-[calc(100vh-64px)] flex flex-col bg-[var(--surface)] border-r border-[var(--border)] z-20 shrink-0 sticky top-[64px] relative ${isResizing ? 'select-none' : ''}`}
    >
      {/* Premium Main Topic Banner Header Section */}
      <AnimatePresence mode="wait">
        {!collapsed && currentTopic && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-5 pt-5 pb-2 flex items-center gap-3.5"
          >
            <div className="w-10 h-10 rounded-sm bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center shadow-inner">
              {getTopicHeroIcon(currentTopic)}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] font-bold text-[var(--text)] tracking-tight capitalize truncate">
                {currentTopic} Index
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input controls layout */}
      <div 
        className="flex items-center gap-0.5 p-4 transition-all duration-300 ease-in-out"
        style={{ justifyContent: collapsed ? "center" : "space-between" }}
      >
        {!collapsed && (
          // 1. Added `overflow-hidden` to the wrapper so it absolutely cannot push past the sidebar width
          <div className="flex-1 min-w-0 overflow-hidden flex items-center gap-2 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-[4px] transition-all duration-200 focus-within:border-[var(--accent)] focus-within:ring-[3px] focus-within:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] shadow-sm">
            
            <Search size={15} className="text-[var(--muted)] shrink-0" />
            
            <input
              value={query}
              aria-label="search-question"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isVis ? "Search by title or ID..." : "Quick search index…"}
              // 2. Added `w-full` and `min-w-0`. This breaks the browser's default 150px minimum width limit, 
              // allowing the input to be squeezed infinitely small while dragging.
              className="flex-1 w-full min-w-0 bg-transparent border-none outline-none text-[13.5px] text-[var(--text)] font-medium truncate placeholder:text-[var(--muted)] placeholder:font-normal"
            />
            
            {isVis && (
              <div title="For LeetCode , CodeForces and CodeChef IDs starts as LC, CF and CC respectively" className="shrink-0 flex items-center">
                <BadgeInfo size={16} className="text-[var(--muted)]" />
              </div>
            )}
            
            {query && (
              <button onClick={() => setQuery("")} className="text-[var(--muted)] hover:text-[var(--text)] transition-colors shrink-0 flex items-center">
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
              // Ensure it opens with a usable width if previously dragged shut
              if (sidebarWidth < 150) setSidebarWidth(288);
            } else {
              setCollapsed(true);
            }
          }}
          className="flex items-center justify-center w-9 aspect-square rounded-[4px] text-[var(--muted)] bg-[var(--bg)] border border-[var(--border)] transition-all duration-200 hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-[var(--accent)] shadow-sm shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <svg className="h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </motion.div>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 pb-16 styled-scrollbar">
        {loading ? (
          <SidebarSkeleton />
        ) : isVis && !query && !collapsed ? (
          /* Visualizer Empty Search State */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-[var(--muted)] text-center p-6 text-[13px]">
            <Search size={28} className="mb-3 opacity-40 text-[var(--accent)]" />
            <p className="font-semibold text-sm mb-0.5 text-[var(--text)] tracking-tight">Search Questions</p>
            <p className="opacity-80">Type a problem ID or name (e.g., "Two Sum") to see if it's available.</p>
          </motion.div>
        ) : error || !data || data.length === 0 || (filteredData.length === 0) ? (
          <NotFound />
        ) : (
          <div className="flex flex-col" style={{ gap: collapsed ? 10 : 0 }}>
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
              />
            ))}
          </div>
        )}
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