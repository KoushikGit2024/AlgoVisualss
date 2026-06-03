import { useState, useEffect } from "react";
import "./AlgoDirector.css";
import { ALGORITHMSNAV } from "./categories/AlgoData";

/* ─── Complexity filter config ──────────────────────────────────────────────── */
const FILTERS = [
  { label: "All",         test: () => true },
  { label: "O(1)",        test: (a) => a.complexity.startsWith("O(1)") },
  { label: "O(log n)",    test: (a) => a.complexity === "O(log n)" || a.complexity === "O(m)" },
  { label: "O(n)",        test: (a) => ["O(n)", "O(n + m)", "O(V + E)"].includes(a.complexity) },
  { label: "O(n log n)",  test: (a) => a.complexity === "O(n log n)" },
  { label: "Complex",     test: (a) => a.complexity === "O(n²)" || a.complexity === "O(2ⁿ)" },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AlgoDirector() {
  const [query,       setQuery]       = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [mounted,     setMounted]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const currentFilter = FILTERS.find((f) => f.label === activeFilter) ?? FILTERS[0];

  const filtered = ALGORITHMSNAV.filter((a) => {
    const matchSearch =
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase());
    return matchSearch && currentFilter.test(a);
  });

  const totalPatterns  = ALGORITHMSNAV.reduce((s, a) => s + a.count, 0);
  const filteredPatt   = filtered.reduce((s, a) => s + a.count, 0);

  return (
    <div className="ad-root">
      <div className="ad-inner">

        <header className="ad-header">
          <div className="ad-eyebrow">
            <span className="ad-eyebrow-dot" aria-hidden="true" />
            Algorithm Reference Index
          </div>
          <h1 className="ad-title">Algorithm Reference</h1>
          <div className="ad-divider" role="separator" />
          <div className="ad-meta-row">
            <div className="ad-meta-item">
              <strong>{ALGORITHMSNAV.length}</strong> topics
            </div>
            <div className="ad-meta-item">
              <strong>{totalPatterns}</strong> patterns
            </div>
            <div className="ad-meta-item">v2.1</div>
          </div>
        </header>

        <div className="ad-controls">
          <div className="ad-search-wrap">
            <span className="ad-search-prefix" aria-hidden="true">/</span>
            <input
              className="ad-search"
              placeholder="search topics and patterns…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search ALGORITHMSNAV"
            />
          </div>

          <div className="ad-filters" role="group" aria-label="Filter by complexity">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                className={`ad-filter${activeFilter === f.label ? " active" : ""}`}
                onClick={() => setActiveFilter(f.label)}
                aria-pressed={activeFilter === f.label}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ad-results-row" aria-live="polite">
          <span>
            {filtered.length} topics · {filteredPatt} patterns
          </span>
          {query && <span>&ldquo;{query}&rdquo;</span>}
        </div>

        <div className="ad-grid">
          {filtered.length === 0 ? (
            <div className="ad-empty">
              <span className="ad-empty-glyph" aria-hidden="true">◌</span>
              <p className="ad-empty-text">no ALGORITHMSNAV match your query</p>
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
function AlgoCard({ algo, index, mounted }) {
  return (
    <a
      href={algo.href}
      className="ad-card"
      data-count={algo.count}
      style={{
        animation: mounted
          ? `ad-card 0.45s cubic-bezier(0.2,0,0,1) ${index * 42}ms forwards`
          : "none",
        opacity: mounted ? undefined : 0,
      }}
      aria-label={`${algo.name} — ${algo.complexity}`}
    >
      <span className="card-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="card-icon-wrapper" aria-hidden="true">
        <div className="card-icon-default">
          {algo.icon}
        </div>
        <div className="card-icon-hover">
          {algo.hoverIcon} 
        </div>
      </div>

      {!algo.featured && (
        <div className="card-badges">
          <span className="card-badge">Under Development</span>
        </div>
      )}

      {/* Title wrap to ensure the underline hugs the text length */}
      <div className="card-name-wrapper">
        <h2 className="card-name">{algo.name}</h2>
      </div>

      <p className="card-desc">{algo.desc}</p>

      <div className="card-footer">
        <code className="complexity-pill">{algo.complexity}</code>
        <span className="card-count">
          <span className="card-count-dot" aria-hidden="true" />
          {algo.count} patterns
        </span>
      </div>
    </a>
  );
}