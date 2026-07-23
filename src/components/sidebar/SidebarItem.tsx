import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import type { NavItem } from "./types";

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

export function RecursiveNavNode({
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
