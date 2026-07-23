import { useMemo } from "react";
import type { NavItem } from "../types";

export function filterNavTree(items: NavItem[], query: string): NavItem[] {
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

export function useSidebarSearch(data: NavItem[] | null, query: string) {
  return useMemo(() => {
    if (!data) return [];
    return filterNavTree(data, query);
  }, [data, query]);
}
