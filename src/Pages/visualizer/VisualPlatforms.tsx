import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PLATFORMDATA from "./data/PlatformData";
import SEO from "../../components/SEO";
import "./VisualPlatforms.css";
/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function VisualPlatforms() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-(--bg,#0D0B14) text-(--text,#F8FAFC) font-['Syne',system-ui,sans-serif] relative overflow-x-hidden">
      <SEO
        title="Visualizer Profiles"
        description="Select an algorithmic platform to visualize and trace C++ code execution step-by-step."
      />
      {/* Background */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 pt-8 pb-16 md:px-7 md:pt-12 md:pb-25">
        {/* ── Header ── */}
        <header
          className="mb-12"
          style={{ animation: "vpHdr 0.55s cubic-bezier(0.2,0,0,1) forwards" }}
        >
          <div className="inline-flex items-center gap-2.5 font-['JetBrains_Mono','Fira_Code',monospace] text-[10px] text-(--accent,#818CF8) uppercase tracking-[0.2em] mb-4">
            <span 
              className="w-1.5 h-1.5 rounded-full bg-(--accent,#818CF8) shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.6)]" 
              style={{ animation: "vpBlink 2s ease-in-out infinite" }}
              aria-hidden="true" 
            />
            Live Platform Index
          </div>

          <h1 className="text-[clamp(32px,5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] mb-4 text-(--text,#F8FAFC)">
            Visualizer Profiles
          </h1>

          <div
            className="w-full h-px bg-(--border,#2A2445) my-4 md:mb-5"
            style={{ animation: "vpFade 0.6s ease 0.3s both" }}
            role="separator"
          />

          <p
            className="text-[15px] text-(--muted,#94A3B8) max-w-150 leading-[1.6]"
            style={{ animation: "vpFade 0.6s ease 0.35s both" }}
          >
            Find your question and generate beautiful, insightful performance metrics.
          </p>
        </header>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3 md:gap-4">
          {PLATFORMDATA.map((platform, i) => (
            <PlatformCard
              key={platform.href}
              platform={platform}
              index={i}
              mounted={mounted}
              featured={platform.featured}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Card sub-component ─────────────────────────────────────────────────────── */
function PlatformCard({
  platform,
  index,
  mounted,
  featured,
}: {
  platform: any;
  index: number;
  mounted: boolean;
  featured: boolean;
}) {
  return (
    <Link
      to={featured ? platform.href : "#"}
      className="group relative flex flex-col h-full bg-(--surface,#13101F) border border-(--border,#2A2445) rounded-2xl p-6 md:py-8 md:px-7 cursor-pointer overflow-hidden opacity-0 no-underline transition-all duration-300 ease-in-out hover:border-(--brand-color) hover:bg-(--surface-2,#1A1630) hover:-translate-y-1 hover:shadow-[0_12px_40px_color-mix(in_srgb,var(--brand-color)_15%,transparent)]"
      style={
        {
          "--brand-color": platform.color,
          animation: mounted
            ? `vpCard 0.45s cubic-bezier(0.2,0,0,1) ${index * 80}ms forwards`
            : "none",
          opacity: mounted ? undefined : 0,
        } as React.CSSProperties
      }
      aria-label={`Connect ${platform.name} profile`}
    >
      {/* Top accent bar for visualizer - inherits brand color */}
      <div className="absolute top-0 left-7 right-7 h-0.75 bg-(--brand-color) rounded-b opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:left-4 group-hover:right-4" />

      {/* Dual Hover Icon Wrapper */}
      <div className="relative w-10 h-10 mb-6 text-(--muted,#94A3B8)" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out opacity-100 translate-y-0 scale-100 group-hover:opacity-0 group-hover:-translate-y-2.5 group-hover:scale-[0.85] [&>svg]:w-full [&>svg]:h-full">
          {platform.icon}
        </div>
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-in-out opacity-0 translate-y-2.5 scale-[0.85] group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-[1.1] [&>svg]:w-full [&>svg]:h-full">
          {platform.hoverIcon}
        </div>
      </div>

      {/* Tags List */}
      {!platform.featured && (
        <div className="flex gap-1.5 mb-3">
          <span className="font-['JetBrains_Mono','Fira_Code',monospace] text-[9px] uppercase tracking-[0.12em] text-[#d38634] border border-[rgba(187,62,4,0.3)] bg-[rgba(52,211,153,0.05)] py-0.75 px-2 rounded">
            Under Developement
          </span>
        </div>
      )}

      {/* Name with Dynamic Underline */}
      <div className="mb-2">
        <h2 className="text-[20px ] font-bold text-(--text,#F8FAFC) tracking-[-0.02em] leading-[1.2] relative inline-block">
          {platform.name}
          <span className="absolute left-0 -bottom-0.5 w-full h-0.5 bg-(--brand-color) origin-right scale-x-0 transition-transform duration-300 ease-in-out group-hover:scale-x-100 group-hover:origin-left" />
        </h2>
      </div>

      {/* Description */}
      <p className="text-[13.5px] text-(--muted,#94A3B8) leading-[1.6] mb-6 transition-colors duration-300 ease-in-out group-hover:text-(--text,#F8FAFC)">
        {platform.desc}
      </p>

      {/* Stats List */}
      <div className="flex flex-col gap-2.5 mb-7 grow">
        {platform.stats.map((stat: string) => (
          <div
            key={stat}
            className="flex items-center gap-2.5 text-[12.5px] text-(--muted,#94A3B8) transition-colors duration-300 ease-in-out group-hover:text-[rgba(248,250,252,0.85)]"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              className="text-(--border,#2A2445) transition-colors duration-300 ease-in-out group-hover:text-(--brand-color)"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{stat}</span>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="flex items-center justify-start border-t border-(--border,#2A2445) pt-4.5 transition-colors duration-300 ease-in-out group-hover:border-[color-mix(in_srgb,var(--brand-color)_20%,transparent)]">
        <span className="font-['Syne',system-ui,sans-serif] font-semibold text-[13px] text-(--muted,#94A3B8) flex items-center gap-1.5 transition-colors duration-300 ease-in-out group-hover:text-(--brand-color)">
          Let's Go
          <span
            aria-hidden="true"
            className="opacity-0 -translate-x-0.5 transition-all duration-300 ease-in-out group-hover:opacity-100 group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
