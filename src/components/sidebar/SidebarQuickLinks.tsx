import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

interface QuickLink {
  name: string;
  href: string;
  icon: any;
  hoverIcon: any;
  featured?: boolean;
}

interface SidebarQuickLinksProps {
  quickLinks: QuickLink[];
  collapsed: boolean;
}

export function SidebarQuickLinks({ quickLinks, collapsed }: SidebarQuickLinksProps) {
  if (quickLinks.length === 0) return null;

  return (
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
  );
}
