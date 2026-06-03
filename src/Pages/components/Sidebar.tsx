import { useState, useMemo, useEffect } from "react";
import { Link, useLocation, useMatch } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Search, X, ChevronRight, AlertCircle, Code, Database, Activity, Box, Cpu, FileText, MonitorPlay, BadgeInfo } from "lucide-react";
import { ALGORITHMSNAV } from "../algorithms/categories/AlgoData";

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
// This simulates the available questions that can be searched for the visualizer.
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
  return <FileText className="w-6 h-6 text-(--accent)" />;
}

function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="px-1 py-px rounded-[4px] bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] text-(--accent) font-semibold shadow-[0_0_8px_color-mix(in_srgb,var(--accent)_40%,transparent)]">
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
          <motion.div variants={item} className="h-5 rounded-md bg-(--surface-2) animate-pulse w-2/3" />
          <motion.div variants={item} className="h-4 rounded-md bg-(--surface-2) animate-pulse w-5/6 ml-4 opacity-60" />
          <motion.div variants={item} className="h-4 rounded-md bg-(--surface-2) animate-pulse w-3/4 ml-4 opacity-60" />
        </div>
      ))}
    </motion.div>
  );
}

function NotFound() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-(--muted) text-center p-6 text-[13px]">
      <AlertCircle size={28} className="mb-3 opacity-40 text-(--accent)" />
      <p className="font-semibold text-sm mb-0.5 text-(--text) tracking-tight">No Results Found</p>
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
      <Link
        to={item.url || "#"}
        onClick={handleClick}
        className={`group relative w-full flex items-center py-2 rounded-xl cursor-pointer transition-all duration-200 ease-out outline-none my-[2px]
          ${collapsed ? "justify-center px-0" : "pr-3"}
          ${isActiveLink 
            ? "text-(--accent) font-semibold" 
            : isTopLevel
              ? "text-(--text) font-medium tracking-tight hover:bg-(--surface-2)"
              : "text-(--muted) font-normal hover:text-(--text) hover:bg-[color-mix(in_srgb,var(--surface-2)_40%,transparent)]"
          }`}
        style={{ paddingLeft: collapsed ? "0px" : `${16 + level * 12}px` }}
      >
        {/* Shared Layout Track Hover Ring & Pill System */}
        {isActiveLink && !isFolder && (
          <motion.div
            layoutId="sidebar-premium-pill"
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] rounded-xl border-l-2 border-(--accent)"
            initial={false}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}

        <div className={`relative z-10 flex items-center w-full gap-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          <div className={`flex items-center gap-2 truncate ${collapsed ? "justify-center w-full" : "w-9/10"}`}>
            {/* SVG Swap magic driven by CSS classes */}
            {item.icon && (typeof item.icon !== "string") && (
              <div className="w-5 h-5 flex items-center justify-center shrink-0 text-(--muted) group-hover:hidden transition-opacity">
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
                <span className={`truncate ${isTopLevel ? "text-[14px] font-semibold" : "text-[13px]"}`}>
                  <Highlighted text={item.label} query={query} />
                </span>
                
                {/* Difficulty Badge System */}
                {item.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm shrink-0 uppercase tracking-widest
                    ${item.badge === 'Easy' ? 'text-[#34D399] bg-[#34D399]/10' :
                      item.badge === 'Medium' ? 'text-[#FBBF24] bg-[#FBBF24]/10' :
                      item.badge === 'Hard' ? 'text-[#EF4444] bg-[#EF4444]/10' :
                      'text-(--muted) bg-(--surface-2)'}
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
              className={`shrink-0 transition-transform duration-300 ease-out text-(--muted) group-hover:text-(--text) ${isExpanded ? "rotate-90" : ""}`} 
            />
          )}
        </div>
      </Link>

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
  
  // Extract parameters for doc or visualizer routes
  const docParams = useMatch("/documentation/:topic/:subTopic?/*");
  const visParams = useMatch("/visualizer/:platform/:qid?/*");
  
  const { topic } = docParams?.params || { topic: null };
  const { platform } = visParams?.params || { platform: null };
  
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  
  const [data, setData] = useState<NavItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isDoc = pathname.startsWith("/documentation/");
  const isAlgo = pathname.startsWith("/algorithms");
  const isVis = pathname.startsWith("/visualizer");
  
  const isSidebarPage = isDoc || isAlgo || isVis;
  
  const currentTopic = isAlgo ? "algorithms" : isVis ? (platform || "visualizer") : topic;

  useEffect(() => {
    let isMounted = true;
    
    if (!isSidebarPage) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    // 1. Visualizer Data 
    if (isVis) {
      if (isMounted) {
        setData(VISUALIZER_NAV);
        setLoading(false);
      }
      return;
    }

    // 2. Algorithms Data
    if (isAlgo) {
      const algoNavItems: NavItem[] = ALGORITHMSNAV.map(algo => ({
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

    // 3. Dynamic Documentation Topics
    if (isDoc && topic) {
      const modules = import.meta.glob("../documentation/data/categories/*Topics.{ts,tsx}");
      const normalizedTopic = topic.toLowerCase();

      const matchingKey = Object.keys(modules).find((key) => {
        const lowerKey = key.toLowerCase(); 
        return lowerKey.includes(`/${normalizedTopic}topics.ts`) || lowerKey.includes(`/${normalizedTopic}topics.tsx`);
      });

      const importModule = matchingKey ? modules[matchingKey] : undefined;

      if (importModule) {
        (importModule as () => Promise<any>)()
          .then((module) => {
            if (isMounted) {
              setData(module.default || module.data);
              setLoading(false);
            }
          })
          .catch((err) => {
            console.error("Failed to load sidebar data:", err);
            if (isMounted) {
              setError(true);
              setLoading(false);
            }
          });
      } else {
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    } else {
       if (isMounted) setLoading(false);
    }
    
    return () => { isMounted = false; };
  }, [topic, isSidebarPage, isAlgo, isVis, pathname]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return filterNavTree(data, query);
  }, [data, query]);

  if (!isSidebarPage) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 288 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="h-[calc(100vh-64px)] flex flex-col bg-(--surface) border-r border-(--border) z-20 shrink-0 sticky top-[64px]"
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
            <div className="w-10 h-10 rounded-xl bg-(--surface-2) border border-(--border) flex items-center justify-center shadow-inner">
              {getTopicHeroIcon(currentTopic)}
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[15px] font-bold text-(--text) tracking-tight capitalize truncate">
                {currentTopic} Index
              </h2>
              <span className="text-[10px] font-mono tracking-widest text-(--muted) uppercase">
                {isVis ? "Platform Integration" : "Core Engine Documentation"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input controls layout */}
      <div 
        className="flex items-center gap-3 p-4 transition-all duration-300 ease-in-out"
        style={{ justifyContent: collapsed ? "center" : "space-between" }}
      >
        {!collapsed && (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-(--bg) border border-(--border) rounded-xl transition-all duration-200 focus-within:border-(--accent) focus-within:ring-[3px] focus-within:ring-[color-mix(in_srgb,var(--accent)_15%,transparent)] shadow-sm">
            <Search size={15} className="text-(--muted)" />
            <input
              value={query}
              aria-label="search-question"
              onChange={(e) => setQuery(e.target.value)}
              placeholder={isVis ? "Search by title or ID..." : "Quick search index…"}
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-(--text) font-medium min-w-0 placeholder:text-(--muted) placeholder:font-normal"
            />
            {isVis && (
              <div title="For LeetCode , CodeForces and CodeChef IDs starts as LC, CF and CC respectively">
                <BadgeInfo size={16} className="text-(--muted)" />
              </div>
            )}
            {query && (
              <button onClick={() => setQuery("")} className="text-(--muted) hover:text-(--text) transition-colors">
                <X size={14} strokeWidth={3} />
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-[34px] h-[34px] rounded-xl text-(--muted) bg-(--bg) border border-(--border) transition-all duration-200 hover:border-(--accent) hover:bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] hover:text-(--accent) shadow-sm shrink-0"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-48 text-(--muted) text-center p-6 text-[13px]">
            <Search size={28} className="mb-3 opacity-40 text-(--accent)" />
            <p className="font-semibold text-sm mb-0.5 text-(--text) tracking-tight">Search Questions</p>
            <p className="opacity-80">Type a problem ID or name (e.g., "Two Sum") to see if it's available.</p>
          </motion.div>
        ) : error || !data || data.length === 0 || (filteredData.length === 0) ? (
          <NotFound />
        ) : (
          <div className="flex flex-col">
            {filteredData.map((item) => (
              <RecursiveNavNode
                key={item.id}
                item={item}
                pathname={pathname}
                query={query}
                collapsed={collapsed}
                onExpandSidebar={() => setCollapsed(false)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.aside>
  );
}