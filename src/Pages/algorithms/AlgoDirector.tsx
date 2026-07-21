import { useState, useEffect } from "react";
import ALGODATA from "./data/AlgoData";
import "./AlgoDirector.css";
import { cn } from "../../lib/utils";
import SEO from "../../components/SEO";
import { CategoryIcon } from "../../components/icons";

/* ─── Complexity filter config ──────────────────────────────────────────────── */
type Algorithm = (typeof ALGODATA)[number];
const FILTERS = [
  { label: "All", test: () => true },
  { label: "O(1)", test: (a: Algorithm) => a.complexity && a.complexity.startsWith("O(1)") },
  {
    label: "O(log n)",
    test: (a: Algorithm) => a.complexity === "O(log n)" || a.complexity === "O(m)",
  },
  {
    label: "O(n)",
    test: (a: Algorithm) => a.complexity && ["O(n)", "O(n + m)", "O(V + E)"].includes(a.complexity),
  },
  { label: "O(n log n)", test: (a: Algorithm) => a.complexity === "O(n log n)" },
  {
    label: "Complex",
    test: (a: Algorithm) => a.complexity === "O(n²)" || a.complexity === "O(2ⁿ)",
  },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AlgoDirector() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const currentFilter = FILTERS.find((f) => f.label === activeFilter) ?? FILTERS[0];

  const filtered = ALGODATA.filter((a) => {
    const matchSearch =
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      (a.desc && a.desc.toLowerCase().includes(query.toLowerCase()));
    return matchSearch && currentFilter.test(a);
  });

  const totalPatterns = ALGODATA.reduce((s, a) => s + (a.items?.length || 0), 0);
  const filteredPatt = filtered.reduce((s, a) => s + (a.items?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[var(--bg,#0D0B14)] text-[var(--text,#EDE9FF)] font-['Syne',system-ui,sans-serif] relative overflow-x-hidden">
      <SEO
        title="Algorithm Reference Index"
        description="Explore our comprehensive library of algorithms and data structures. Filter by complexity and discover patterns."
        canonical="https://algovisuals-na1c.onrender.com/algorithms"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Algorithm Reference Index",
          url: "https://algovisuals-na1c.onrender.com/algorithms",
          description: "Explore our comprehensive library of algorithms and data structures.",
          isPartOf: {
            "@type": "WebSite",
            name: "AlgoVisuals",
            url: "https://algovisuals-na1c.onrender.com/",
          },
        }}
      />
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle,rgba(129,140,248,0.055)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-[18px] pt-[32px] pb-[64px] sm:px-[28px] sm:pt-[48px] sm:pb-[100px]">
        {/* ── Header ── */}
        <header
          className="mb-10"
          style={{ animation: "adHdr 0.55s cubic-bezier(0.2,0,0,1) forwards" }}
        >
          <div className="inline-flex items-center gap-[10px] font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(10rem/16)] text-[var(--accent,#818CF8)] uppercase tracking-[0.2em] mb-4">
            <span
              className="w-[5px] h-[5px] rounded-full bg-[var(--accent,#818CF8)] shrink-0"
              style={{ animation: "adBlink 2.4s ease-in-out infinite" }}
              aria-hidden="true"
            />
            Algorithm Reference Index
          </div>

          <h1 className="text-[clamp(32px,5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] mb-4 text-[var(--text,#EDE9FF)]">
            Algorithm Reference
          </h1>

          <div
            className="w-full h-px bg-[var(--border,#2A2445)] my-4"
            style={{ animation: "adFade 0.6s ease 0.3s both" }}
            role="separator"
          />

          <div
            className="flex items-center gap-0 flex-wrap"
            style={{ animation: "adFade 0.5s ease 0.25s both" }}
          >
            <div className="font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] sm:text-[calc(12rem/16)] text-[var(--muted,#6B6487)] px-[12px] sm:px-[18px] border-r border-[var(--border,#2A2445)] first:pl-0">
              <strong className="text-[var(--text,#EDE9FF)] font-medium">{ALGODATA.length}</strong>{" "}
              topics
            </div>
            <div className="font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] sm:text-[calc(12rem/16)] text-[var(--muted,#6B6487)] px-[12px] sm:px-[18px] border-r border-[var(--border,#2A2445)]">
              <strong className="text-[var(--text,#EDE9FF)] font-medium">{totalPatterns}</strong>{" "}
              patterns
            </div>
            <div className="font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] sm:text-[calc(12rem/16)] text-[var(--muted,#6B6487)] px-[12px] sm:px-[18px]">
              v2.1
            </div>
          </div>
        </header>

        {/* ── Controls ── */}
        <div
          className="flex flex-col gap-3 mb-8"
          style={{ animation: "adFade 0.5s ease 0.2s both" }}
        >
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(15rem/16)] text-[var(--accent,#818CF8)] pointer-events-none select-none opacity-50"
              aria-hidden="true"
            >
              /
            </span>
            <input
              className="w-full py-[13px] pr-4 pl-10 bg-[var(--surface,#13101F)] border border-[var(--border,#2A2445)] rounded-[10px] text-[var(--text,#EDE9FF)] font-['JetBrains_Mono','Fira_Code',monospace] text-[13.5px] outline-none transition-[border-color,box-shadow] duration-200 caret-[var(--accent,#818CF8)] placeholder:text-[rgba(107,100,135,0.5)] focus:border-[var(--accent,#818CF8)] focus:shadow-[0_0_0_3px_rgba(129,140,248,0.08)]"
              placeholder="search topics and patterns…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Algorithms"
            />
          </div>

          <div className="flex gap-[6px] flex-wrap" role="group" aria-label="Filter by complexity">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                className={cn(
                  `font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] px-[14px] py-[5px] rounded-[7px] border bg-transparent cursor-pointer transition-colors duration-150 tracking-[0.04em] hover:border-[var(--accent,#818CF8)] hover:text-[var(--accent,#818CF8)] ${
                    activeFilter === f.label
                      ? "bg-[rgba(129,140,248,0.10)] border-[var(--accent,#818CF8)] text-[var(--accent,#818CF8)]"
                      : "border-[var(--border,#2A2445)] text-[var(--muted,#6B6487)]"
                  }`,
                )}
                onClick={() => setActiveFilter(f.label)}
                aria-pressed={activeFilter === f.label}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex items-center justify-between mb-[18px] font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] text-[rgba(107,100,135,0.6)] tracking-[0.06em]"
          style={{ animation: "adFade 0.4s ease both" }}
          aria-live="polite"
        >
          <span>
            {filtered.length} topics · {filteredPatt} patterns
          </span>
          {query && <span>&ldquo;{query}&rdquo;</span>}
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-2 sm:gap-[10px]">
          {filtered.length === 0 ? (
            <div className="col-span-full py-[90px] text-center text-[rgba(107,100,135,0.4)]">
              <span className="text-[calc(38rem/16)] block mb-3.5 opacity-40" aria-hidden="true">
                ◌
              </span>
              <p className="font-['JetBrains_Mono','Fira_Code',monospace] text-xs tracking-[0.06em]">
                no algorithms match your query
              </p>
            </div>
          ) : (
            filtered.map((algo, i) => (
              <AlgoCard key={algo.href} algo={algo} index={i} mounted={mounted} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Card sub-component ─────────────────────────────────────────────────────── */
type AlgoCardProps = {
  algo: Algorithm;
  index: number;
  mounted: boolean;
};

function AlgoCard({ algo, index, mounted }: AlgoCardProps) {
  const patternCount = algo.items?.length || 0;

  return (
    <a
      href={algo.href}
      className="group relative flex flex-col h-full bg-[var(--surface,#13101F)] border border-[var(--border,#2A2445)] rounded-xl py-[22px] px-6 cursor-pointer overflow-hidden opacity-0 no-underline transition-all duration-[0.22s] ease-in-out hover:border-[rgba(129,140,248,0.25)] hover:bg-[var(--surface-2,#1A1630)] hover:-translate-y-[3px] hover:shadow-[0_18px_52px_rgba(0,0,0,0.38)]"
      style={{
        animation: mounted
          ? `adCard 0.45s cubic-bezier(0.2,0,0,1) ${index * 42}ms forwards`
          : "none",
        opacity: mounted ? undefined : 0,
      }}
      aria-label={`${algo.name} — ${algo.complexity}`}
    >
      {/* Left hover accent bar */}
      <div className="absolute left-0 top-[24%] bottom-[24%] w-[2px] bg-[var(--accent,#818CF8)] rounded-r-[2px] opacity-0 transition-all duration-[0.22s] ease-in-out group-hover:opacity-100 group-hover:top-[16%] group-hover:bottom-[16%]" />

      {/* Background Number */}
      <span
        className="absolute -bottom-[6px] right-[10px] font-['Syne',system-ui,sans-serif] font-extrabold text-[calc(72rem/16)] text-[rgba(129,140,248,0.04)] leading-none pointer-events-none select-none transition-colors duration-[0.22s] ease-in-out group-hover:text-[rgba(129,140,248,0.065)]"
        aria-hidden="true"
      >
        {patternCount}
      </span>

      <span
        className="absolute top-[18px] right-[18px] font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(10rem/16)] text-[var(--border,#2A2445)] tracking-[0.06em] transition-colors duration-[0.22s] ease-in-out group-hover:text-[rgba(129,140,248,0.35)]"
        aria-hidden="true"
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Animated Icons */}
      <div className="relative w-8 h-8 mb-5 text-[var(--accent,#818CF8)]" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-100 translate-y-0 scale-100 group-hover:opacity-0 group-hover:-translate-y-2.5 group-hover:scale-[0.85] [&>svg]:w-full [&>svg]:h-full">
          <CategoryIcon name={algo.iconId} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 translate-y-2.5 scale-[0.85] group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 [&>svg]:w-full [&>svg]:h-full">
          <CategoryIcon name={algo.hoverIconId || algo.iconId} hover={true} />
        </div>
      </div>

      {!algo.featured && (
        <div className="flex gap-1.5 mb-3">
          <span className="font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(9rem/16)] uppercase tracking-[0.12em] text-[var(--accent,#818CF8)] border border-[rgba(129,140,248,0.25)] py-[2px] px-2 rounded-[4px]">
            Under Development
          </span>
        </div>
      )}

      {/* Title wrap to ensure the underline hugs the text length */}
      <div className="mb-[7px]">
        <h2 className="text-[calc(17rem/16)] font-bold text-[var(--text,#EDE9FF)] tracking-[-0.025em] leading-[1.2] relative inline-block">
          {algo.name}
          <span className="absolute left-0 -bottom-[3px] w-full h-[2px] bg-[var(--success,#34D399)] origin-right scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100 group-hover:origin-left" />
        </h2>
      </div>

      <p className="text-[12.5px] text-[var(--muted,#6B6487)] leading-[1.65] mb-[18px] flex-grow transition-colors duration-[0.22s] ease-in-out group-hover:text-[rgba(173,165,195,0.85)]">
        {algo.desc}
      </p>

      <div className="flex items-center justify-between border-t border-[var(--border,#2A2445)] pt-[14px] transition-colors duration-[0.22s] ease-in-out group-hover:border-[rgba(129,140,248,0.12)]">
        <code className="font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] text-[var(--success,#34D399)] bg-[rgba(52,211,153,0.07)] border border-[rgba(52,211,153,0.14)] py-[3px] px-[9px] rounded-[5px] tracking-[0.02em]">
          {algo.complexity}
        </code>
        <span className="font-['JetBrains_Mono','Fira_Code',monospace] text-[calc(11rem/16)] text-[rgba(107,100,135,0.55)] flex items-center gap-[6px] transition-colors duration-[0.22s] ease-in-out group-hover:text-[var(--muted,#6B6487)]">
          <span
            className="w-[3px] h-[3px] rounded-full bg-[var(--border,#2A2445)] transition-colors duration-[0.22s] ease-in-out group-hover:bg-[var(--accent,#818CF8)]"
            aria-hidden="true"
          />
          {patternCount} patterns
        </span>
      </div>
    </a>
  );
}
