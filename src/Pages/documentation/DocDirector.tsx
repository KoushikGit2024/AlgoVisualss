import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DOCS } from "./pagesDatas/cats";
import "./DocDirector.css";

/* ─── Data ──────────────────────────────────────────────────────────────────── */

const CATEGORIES = ["All", "Frontend", "Backend", "Databases", "AI/ML", "Languages"];

/* ─── Component ─────────────────────────────────────────────────────────────── */
const DocDirector = () => {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const filteredDocs = DOCS.filter((doc) => {
    const matchesSearch =
      !query ||
      doc.name.toLowerCase().includes(query.toLowerCase()) ||
      doc.desc.toLowerCase().includes(query.toLowerCase());
    
    const matchesCategory = activeTab === "All" || doc.category === activeTab;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--bg,#0D0B14)] text-[var(--text,#F8FAFC)] font-['Syne',system-ui,sans-serif] relative overflow-x-hidden">
      
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(circle,rgba(96,165,250,0.04)_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 max-w-[1280px] mx-auto px-[18px] pt-[32px] pb-[64px] sm:px-[28px] sm:pt-[48px] sm:pb-[100px]">

        {/* ── Header ── */}
        <header className="mb-10" style={{ animation: "ddHdr 0.55s cubic-bezier(0.2,0,0,1) forwards" }}>
          {/* <div className="inline-flex items-center gap-[10px] font-['JetBrains_Mono','Fira_Code',monospace] text-[10px] text-[var(--accent,#60A5FA)] uppercase tracking-[0.2em] mb-4">
            <span 
              className="w-[5px] h-[5px] rounded-full bg-[var(--accent,#60A5FA)] shrink-0" 
              style={{ animation: "ddBlink 2.4s ease-in-out infinite" }}
              aria-hidden="true" 
            />
            Knowledge Base
          </div> */}
          
          <h1 className="text-[clamp(32px,5vw,48px)] font-bold leading-[1.1] tracking-[-0.02em] mb-4 text-[var(--text,#F8FAFC)]">
            Documentation Hub
          </h1>
          
          <div 
            className="w-full h-px bg-[var(--border,#2A2445)] my-4" 
            style={{ animation: "ddFade 0.6s ease 0.3s both" }}
            role="separator" 
          />
          
          <div className="flex items-center gap-0 flex-wrap" style={{ animation: "ddFade 0.5s ease 0.25s both" }}>
            <div className="font-['JetBrains_Mono','Fira_Code',monospace] text-[11px] sm:text-[12px] text-[var(--muted,#94A3B8)] px-[12px] sm:px-[18px] border-r border-[var(--border,#2A2445)] first:pl-0">
              <strong className="text-[var(--text,#F8FAFC)] font-medium">{DOCS.length}</strong> core technologies
            </div>
            <div className="font-['JetBrains_Mono','Fira_Code',monospace] text-[11px] sm:text-[12px] text-[var(--muted,#94A3B8)] px-[12px] sm:px-[18px] border-r border-[var(--border,#2A2445)]">
              <strong className="text-[var(--text,#F8FAFC)] font-medium">5</strong> categories
            </div>
            <div className="font-['JetBrains_Mono','Fira_Code',monospace] text-[11px] sm:text-[12px] text-[var(--muted,#94A3B8)] px-[12px] sm:px-[18px]">
              v1.0
            </div>
          </div>
        </header>

        {/* ── Controls ── */}
        <div className="flex flex-col gap-3 mb-8" style={{ animation: "ddFade 0.5s ease 0.2s both" }}>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-['JetBrains_Mono','Fira_Code',monospace] text-[15px] text-[var(--accent,#60A5FA)] pointer-events-none select-none opacity-50" aria-hidden="true">
              /
            </span>
            <input
              className="w-full py-[13px] pr-4 pl-10 bg-[var(--surface,#13101F)] border border-[var(--border,#2A2445)] rounded-[10px] text-[var(--text,#F8FAFC)] font-['JetBrains_Mono','Fira_Code',monospace] text-[13.5px] outline-none transition-[border-color,box-shadow] duration-200 caret-[var(--accent,#60A5FA)] placeholder:text-slate-400/50 focus:border-[var(--accent,#60A5FA)] focus:shadow-[0_0_0_3px_rgba(96,165,250,0.08)]"
              placeholder="search frameworks, databases, and languages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documentation"
            />
          </div>

          <div className="flex gap-[6px] flex-wrap" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`font-['JetBrains_Mono','Fira_Code',monospace] text-[11px] px-[14px] py-[5px] rounded-[7px] border bg-transparent cursor-pointer transition-colors duration-150 tracking-[0.04em] hover:border-[var(--accent,#60A5FA)] hover:text-[var(--accent,#60A5FA)] ${
                  activeTab === cat 
                    ? "bg-[rgba(96,165,250,0.10)] border-[var(--accent,#60A5FA)] text-[var(--accent,#60A5FA)]" 
                    : "border-[var(--border,#2A2445)] text-[var(--muted,#94A3B8)]"
                }`}
                onClick={() => setActiveTab(cat)}
                aria-pressed={activeTab === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div 
          className="flex items-center justify-between mb-[18px] font-['JetBrains_Mono','Fira_Code',monospace] text-[11px] text-slate-400/60 tracking-[0.06em]" 
          style={{ animation: "ddFade 0.4s ease both" }}
          aria-live="polite"
        >
          <span>
            {filteredDocs.length} {filteredDocs.length === 1 ? "document" : "documents"} found
          </span>
          {query && <span>&ldquo;{query}&rdquo;</span>}
        </div>

        {/* ── Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-2 sm:gap-3">
          {filteredDocs.length === 0 ? (
            <div className="col-span-full py-[90px] text-center text-slate-400/40">
              <span className="text-[38px] block mb-3.5 opacity-40" aria-hidden="true">◌</span>
              <p className="font-['JetBrains_Mono','Fira_Code',monospace] text-xs tracking-[0.06em]">no documentation matches your query</p>
            </div>
          ) : (
            filteredDocs.map((doc, i) => (
              <DocCard key={doc.to} doc={doc} index={i} mounted={mounted} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default DocDirector;

/* ─── Card sub-component ─────────────────────────────────────────────────────── */
function DocCard({ doc, index, mounted }: { doc: any, index: number, mounted: boolean }) {
  return (
    <Link
      to={doc.to}
      className="group relative flex flex-col h-full bg-[var(--surface,#13101F)] border border-[var(--border,#2A2445)] rounded-xl p-6 cursor-pointer overflow-hidden opacity-0 no-underline transition-all duration-[0.22s] ease-in-out hover:border-[rgba(96,165,250,0.25)] hover:bg-[var(--surface-2,#1A1630)] hover:-translate-y-[3px] hover:shadow-[0_18px_52px_rgba(0,0,0,0.38)]"
      style={{
        animation: mounted
          ? `ddCard 0.45s cubic-bezier(0.2,0,0,1) ${index * 42}ms forwards`
          : "none",
        opacity: mounted ? undefined : 0,
      }}
      aria-label={`${doc.name} documentation`}
    >
      {/* Top hover accent bar */}
      <div className="absolute top-0 left-6 right-6 h-[2px] bg-[var(--accent,#60A5FA)] rounded-b opacity-0 transition-all duration-[0.22s] ease-in-out group-hover:opacity-100 group-hover:left-3 group-hover:right-3" />

      {/* Animated Icons */}
      <div className="relative w-8 h-8 mb-5 text-[var(--accent,#60A5FA)]" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-100 translate-y-0 scale-100 group-hover:opacity-0 group-hover:-translate-y-2.5 group-hover:scale-[0.85] [&>svg]:w-full [&>svg]:h-full">
          {doc.icon}
        </div>
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] opacity-0 translate-y-2.5 scale-[0.85] group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 [&>svg]:w-full [&>svg]:h-full">
          {doc.hoverIcon} 
        </div>
      </div>

      <div className="flex gap-1.5 mb-3">
        <span className="font-['JetBrains_Mono','Fira_Code',monospace] text-[9px] uppercase tracking-[0.12em] text-[var(--accent,#60A5FA)] border border-[rgba(96,165,250,0.25)] bg-[rgba(96,165,250,0.05)] py-[3px] px-2 rounded">
          {doc.category}
        </span>
      </div>

      <div className="mb-[7px]">
        <h2 className="text-[18px] font-bold text-[var(--text,#F8FAFC)] tracking-[-0.025em] leading-[1.2] relative inline-block">
          {doc.name}
          {/* Growing Title Underline */}
          <span className="absolute left-0 -bottom-[3px] w-full h-[2px] bg-[var(--accent,#60A5FA)] origin-right scale-x-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-x-100 group-hover:origin-left" />
        </h2>
      </div>

      <p className="text-[13px] text-[var(--muted,#94A3B8)] leading-[1.6] mb-6 flex-grow transition-colors duration-[0.22s] ease-in-out group-hover:text-[var(--text,#F8FAFC)]">
        {doc.desc}
      </p>

      <div className="flex items-center justify-between border-t border-[var(--border,#2A2445)] pt-4 transition-colors duration-[0.22s] ease-in-out group-hover:border-[rgba(96,165,250,0.15)]">
        <span className="font-['JetBrains_Mono','Fira_Code',monospace] text-[11px] text-[var(--muted,#94A3B8)] tracking-[0.02em]">
          {doc.version}
        </span>
        <span className="font-['Syne',system-ui,sans-serif] font-semibold text-xs text-[var(--accent,#60A5FA)] flex items-center gap-1 transition-transform duration-[0.22s] ease-in-out group-hover:translate-x-1">
          Read Docs <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}