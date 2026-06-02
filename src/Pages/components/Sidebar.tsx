import { useState, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { NAV } from "../../lib/docsNav.tsx";

type NavGroup = (typeof NAV)[keyof typeof NAV];

// ─── Search Highlight ─────────────────────────────────────────────────────────
function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        className="px-[2px]"
        style={{ background: "color-mix(in srgb, var(--accent) 25%, transparent)", color: "var(--accent)" }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

// ─── Group Section ────────────────────────────────────────────────────────────
function GroupSection({
  group, isOpen, onToggle, pathname, query, collapsed,
}: {
  group: NavGroup; isOpen: boolean; onToggle: () => void;
  pathname: string; query: string; collapsed: boolean;
}) {
  const filtered = useMemo(() => {
    if (!query) return group.items;
    const q = query.toLowerCase();
    return group.items.filter((i) => i.label.toLowerCase().includes(q));
  }, [group.items, query]);

  if (query && filtered.length === 0) return null;

  const isExpanded = (!collapsed && isOpen) || query.length > 0;

  return (
    <div className="px-3 py-1">
      {/* Group header */}
      <button
        onClick={onToggle}
        title={collapsed ? group.label : undefined}
        className={cn(
          "w-full flex items-center gap-2.5 px-2.5 py-2 transition-all duration-150 outline-none",
          "hover:bg-[color-mix(in_srgb,var(--accent)_6%,transparent)]",
          collapsed && "justify-center"
        )}
      >
        <span style={{ color: group.color }} className="shrink-0">
          {group.icon}
        </span>
        {!collapsed && (
          <>
            <span
              className="flex-1 text-xs font-semibold tracking-wide text-left truncate"
              style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}
            >
              {group.label.toUpperCase()}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5"
              style={{ background: "var(--surface-2)", color: "var(--muted)" }}
            >
              {filtered.length}
            </span>
            <motion.span
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ color: "var(--muted)" }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.span>
          </>
        )}
      </button>

      {/* Items accordion */}
      <AnimatePresence initial={false}>
        {isExpanded && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pt-1 pb-2 flex flex-col gap-0.5">
              {filtered.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 px-3 py-1.5 text-sm transition-all duration-150",
                      "outline-none focus-visible:ring-2 ring-(--accent) group"
                    )}
                    style={{
                      background: isActive
                        ? "color-mix(in srgb, var(--accent) 12%, transparent)"
                        : "transparent",
                      color: isActive ? "var(--text)" : "var(--muted)",
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background =
                          "color-mix(in srgb, var(--accent) 6%, transparent)";
                        (e.currentTarget as HTMLElement).style.color = "var(--text)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                      }
                    }}
                  >
                    {/* Active dot */}
                    {/* <span
                      className="w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200"
                      style={{
                        background: isActive ? "var(--accent)" : "var(--border-2)",
                        opacity: isActive ? 1 : 0.6,
                        transform: isActive ? "scale(1.3)" : "scale(1)",
                      }}
                    /> */}
                    <span className="w-4 h-2"/>
                    <span className="truncate text-[13px]">
                      <Highlighted text={item.label} query={query} />
                    </span>
                    {/* Active indicator line */}
                    {isActive && (
                      <motion.span
                        layoutId={`active-pill-${group.id}`}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                        style={{ background: "var(--accent)" }}
                        transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar() {
  const pathname = useLocation().pathname;
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (pathname.startsWith("/algorithms"))   initial.add("algorithms");
    else if (pathname.startsWith("/documentation")) initial.add("documentation");
    else if (pathname.startsWith("/visualizer"))    initial.add("visualizer");
    else initial.add("algorithms");
    return initial;
  });

  const isSidebarPage =
    pathname.startsWith("/algorithms/") ||
    pathname.startsWith("/documentation/") ||
    pathname.startsWith("/visualizer/");

  if (!isSidebarPage) return null;

  const activeKey   = pathname.split("/")[1] as keyof typeof NAV;
  const activeGroup = NAV[activeKey];

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const handleGroupClick = (id: string) => {
    if (collapsed) setCollapsed(false);
    toggleGroup(id);
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 60 : 256 }}
      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
      className="shrink-0 flex flex-col h-full"
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Search + collapse header */}
      <div
        className={cn(
          "flex items-center gap-2 p-3 border-b",
          collapsed && "justify-center"
        )}
        style={{ borderColor: "var(--border)" }}
      >
        {!collapsed && (
          <div
            className="flex items-center flex-1 gap-2 px-3 py-1.5 rounded-lg"
            style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
          >
            <svg className="shrink-0 opacity-50" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {/* FIXED BUG-03: removed bg-blue-800 debug class */}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="flex-1 bg-transparent text-[13px] outline-none min-w-0"
              style={{ color: "var(--text)" }}
              suppressHydrationWarning
              
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                style={{ color: "var(--muted)" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6"  y2="18" />
                  <line x1="6"  y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "shrink-0 w-7 h-7 flex items-center justify-center transition-all duration-150",
            "hover:bg-[color-mix(in_srgb,var(--accent)_8%,transparent)]"
          )}
          style={{ color: "var(--muted)" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={cn("transition-transform duration-300", collapsed && "rotate-180")}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Nav content */}
      <nav className="flex-1 overflow-y-auto py-2">
        {activeGroup && (
          <GroupSection
            group={activeGroup}
            isOpen={openGroups.has(activeGroup.id)}
            onToggle={() => handleGroupClick(activeGroup.id)}
            pathname={pathname}
            query={query}
            collapsed={collapsed}
          />
        )}
      </nav>
    </motion.aside>
  );
}