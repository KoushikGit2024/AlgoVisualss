import { useState, useEffect } from "react";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const ALGORITHMS = [
  {
    name: "Arrays",
    href: "/algorithms/arrays",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="4">
        <rect x="6" y="20" width="12" height="24"/>
        <rect x="20" y="20" width="12" height="24"/>
        <rect x="34" y="20" width="12" height="24"/>
        <rect x="48" y="20" width="12" height="24"/>
      </svg>
    ),
    desc: "Two pointers, sliding window, prefix sums",
    complexity: "O(n)",
    count: 12,
  },
  {
    name: "Sorting",
    href: "/algorithms/sorting",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <rect x="8" y="36" width="8" height="20"/>
        <rect x="22" y="26" width="8" height="30"/>
        <rect x="36" y="14" width="8" height="42"/>
        <rect x="50" y="6" width="8" height="50"/>
      </svg>
    ),
    desc: "Bubble, merge, quick, heap, counting sort",
    complexity: "O(n log n)",
    count: 8,
    featured: true,
  },
  {
    name: "Graphs",
    href: "/algorithms/graphs",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="12" cy="32" r="5"/>
        <circle cx="32" cy="12" r="5"/>
        <circle cx="52" cy="32" r="5"/>
        <circle cx="32" cy="52" r="5"/>
        <line x1="12" y1="32" x2="32" y2="12"/>
        <line x1="32" y1="12" x2="52" y2="32"/>
        <line x1="52" y1="32" x2="32" y2="52"/>
        <line x1="32" y1="52" x2="12" y2="32"/>
      </svg>
    ),
    desc: "BFS, DFS, Dijkstra, Bellman-Ford, Floyd",
    complexity: "O(V + E)",
    count: 10,
  },
  {
    name: "Trees",
    href: "/algorithms/trees",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <circle cx="38" cy="52" r="5"/>
        <circle cx="54" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
        <line x1="46" y1="37" x2="38" y2="47"/>
        <line x1="46" y1="37" x2="54" y2="47"/>
      </svg>
    ),
    desc: "BST, AVL, segment tree, traversals",
    complexity: "O(log n)",
    count: 9,
  },
  {
    name: "Dynamic Programming",
    href: "/algorithms/dynamic_programming",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="8" y="8" width="16" height="16"/>
        <rect x="24" y="8" width="16" height="16"/>
        <rect x="40" y="8" width="16" height="16"/>
        <rect x="8" y="24" width="16" height="16"/>
        <rect x="24" y="24" width="16" height="16"/>
        <rect x="40" y="24" width="16" height="16"/>
        <rect x="8" y="40" width="16" height="16"/>
        <rect x="24" y="40" width="16" height="16"/>
        <rect x="40" y="40" width="16" height="16"/>
      </svg>
    ),
    desc: "Memoization, tabulation, optimal substructure",
    complexity: "O(n²)",
    count: 14,
  },
  {
    name: "Linked Lists",
    href: "/algorithms/linked_lists",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12" rx="2"/>
        <rect x="26" y="24" width="12" height="12" rx="2"/>
        <rect x="48" y="24" width="12" height="12" rx="2"/>
        <line x1="16" y1="30" x2="26" y2="30"/>
        <line x1="38" y1="30" x2="48" y2="30"/>
        <polyline points="22,26 26,30 22,34"/>
        <polyline points="44,26 48,30 44,34"/>
      </svg>
    ),
    desc: "Reversal, cycle detection, merge, Floyd's",
    complexity: "O(n)",
    count: 7,
  },

  {
    name: "Stacks",
    href: "/algorithms/stacks",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="18" y="42" width="28" height="10"/>
        <rect x="18" y="30" width="28" height="10"/>
        <rect x="18" y="18" width="28" height="10"/>
      </svg>
    ),
    desc: "Monotonic stack, bracket matching, next greater",
    complexity: "O(n)",
    count: 6,
  },

  {
    name: "Queues",
    href: "/algorithms/queues",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <rect x="4" y="24" width="12" height="12"/>
        <rect x="20" y="24" width="12" height="12"/>
        <rect x="36" y="24" width="12" height="12"/>
        <line x1="52" y1="30" x2="60" y2="30"/>
        <polyline points="56,26 60,30 56,34"/>
      </svg>
    ),
    desc: "Deque, sliding window max, BFS patterns",
    complexity: "O(n)",
    count: 5,
  },

  {
    name: "Hash Maps",
    href: "/algorithms/hash_maps",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="20" y1="8" x2="20" y2="56"/>
        <line x1="44" y1="8" x2="44" y2="56"/>
        <line x1="8" y1="20" x2="56" y2="20"/>
        <line x1="8" y1="44" x2="56" y2="44"/>
      </svg>
    ),
    desc: "Frequency count, anagram, LRU cache",
    complexity: "O(1) avg",
    count: 8,
  },

  {
    name: "Heap",
    href: "/algorithms/heap",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="12" r="5"/>
        <circle cx="18" cy="32" r="5"/>
        <circle cx="46" cy="32" r="5"/>
        <circle cx="10" cy="52" r="5"/>
        <circle cx="26" cy="52" r="5"/>
        <line x1="32" y1="17" x2="18" y2="27"/>
        <line x1="32" y1="17" x2="46" y2="27"/>
        <line x1="18" y1="37" x2="10" y2="47"/>
        <line x1="18" y1="37" x2="26" y2="47"/>
      </svg>
    ),
    desc: "Min-heap, max-heap, k-way merge, top-k",
    complexity: "O(log n)",
    count: 6,
  },

  {
    name: "Recursion",
    href: "/algorithms/recursion",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <path d="M22 22 A12 12 0 1 1 22 42"/>
        <polyline points="22,16 22,22 28,22"/>
      </svg>
    ),
    desc: "Backtracking, permutations, divide & conquer",
    complexity: "O(2ⁿ)",
    count: 9,
  },

  {
    name: "Strings",
    href: "/algorithms/strings",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text
          x="8"
          y="42"
          fontSize="26"
          fontFamily="monospace"
        >
          Aa
        </text>
      </svg>
    ),
    desc: "KMP, Rabin-Karp, Z-algorithm, trie patterns",
    complexity: "O(n + m)",
    count: 10,
  },

  {
    name: "Tries",
    href: "/algorithms/tries",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <line x1="32" y1="14" x2="16" y2="32"/>
        <line x1="32" y1="14" x2="48" y2="32"/>
        <line x1="16" y1="32" x2="8" y2="52"/>
        <line x1="16" y1="32" x2="24" y2="52"/>
        <line x1="48" y1="32" x2="40" y2="52"/>
        <line x1="48" y1="32" x2="56" y2="52"/>
      </svg>
    ),
    desc: "Prefix trees, autocomplete, word search",
    complexity: "O(m)",
    count: 5,
  },

  {
    name: "Greedy",
    href: "/algorithms/greedy",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <path d="M32 8l6 14 16 2-12 10 4 16-14-8-14 8 4-16-12-10 16-2z"/>
      </svg>
    ),
    desc: "Interval scheduling, Huffman, activity selection",
    complexity: "O(n log n)",
    count: 7,
  },

  {
    name: "Bit Manipulation",
    href: "/algorithms/bit_manipulation",
    icon: (
      <svg viewBox="0 0 64 64" fill="currentColor">
        <text
          x="7"
          y="40"
          fontSize="18"
          fontFamily="monospace"
        >
          1010
        </text>
      </svg>
    ),
    desc: "XOR tricks, bitmasking, power of two",
    complexity: "O(1)",
    count: 6,
  },

  {
    name: "Range Structures",
    href: "/algorithms/range_structures",
    icon: (
      <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3">
        <circle cx="32" cy="10" r="4"/>
        <circle cx="16" cy="30" r="4"/>
        <circle cx="48" cy="30" r="4"/>
        <circle cx="8" cy="50" r="4"/>
        <circle cx="24" cy="50" r="4"/>
        <circle cx="40" cy="50" r="4"/>
        <circle cx="56" cy="50" r="4"/>
        <line x1="32" y1="14" x2="16" y2="26"/>
        <line x1="32" y1="14" x2="48" y2="26"/>
        <line x1="16" y1="34" x2="8" y2="46"/>
        <line x1="16" y1="34" x2="24" y2="46"/>
        <line x1="48" y1="34" x2="40" y2="46"/>
        <line x1="48" y1="34" x2="56" y2="46"/>
      </svg>
    ),
    desc: "Segment trees, BIT/Fenwick, range queries",
    complexity: "O(log n)",
    count: 5,
  },
];

/* ─── Complexity filter config ──────────────────────────────────────────────── */
const FILTERS = [
  { label: "All",         test: () => true },
  { label: "O(1)",        test: (a) => a.complexity.startsWith("O(1)") },
  { label: "O(log n)",    test: (a) => a.complexity === "O(log n)" || a.complexity === "O(m)" },
  { label: "O(n)",        test: (a) => ["O(n)", "O(n + m)", "O(V + E)"].includes(a.complexity) },
  { label: "O(n log n)",  test: (a) => a.complexity === "O(n log n)" },
  { label: "Complex",     test: (a) => a.complexity === "O(n²)" || a.complexity === "O(2ⁿ)" },
];

/* ─── Styles (injected once as a <style> tag) ───────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

.ad-root {
  --ad-font:      'Syne', system-ui, sans-serif;
  --ad-mono:      'JetBrains Mono', 'Fira Code', monospace;
  --ad-bg:        var(--bg, #0D0B14);
  --ad-surface:   var(--surface, #13101F);
  --ad-surface2:  var(--surface-2, #1A1630);
  --ad-border:    var(--border, #2A2445);
  --ad-border2:   rgba(129,140,248,0.25);
  --ad-accent:    var(--accent, #818CF8);
  --ad-text:      var(--text, #EDE9FF);
  --ad-muted:     var(--muted, #6B6487);
  --ad-dim:       rgba(129,140,248,0.35);
  --ad-green:     var(--success, #34D399);
  font-family:    var(--ad-font);
  background:     var(--ad-bg);
  color:          var(--ad-text);
  min-height:     100vh;
  overflow-x:     hidden;
  position:       relative;
}

/* Subtle dot-grid texture */
.ad-root::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: radial-gradient(circle, rgba(129,140,248,0.055) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
  z-index: 0;
}

.ad-inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 72px 28px 100px;
}

/* ── Animations ── */
@keyframes ad-hdr {
  from { opacity: 0; transform: translateY(-14px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes ad-card {
  from { opacity: 0; transform: translateY(20px) scale(0.975); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes ad-fade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes ad-blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

/* ── Header ── */
.ad-header {
  animation: ad-hdr 0.55s cubic-bezier(0.2,0,0,1) forwards;
  margin-bottom: 56px;
}

.ad-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--ad-mono);
  font-size: 10px;
  color: var(--ad-accent);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 24px;
}
.ad-eyebrow-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ad-accent);
  flex-shrink: 0;
  animation: ad-blink 2.4s ease-in-out infinite;
}

.ad-title {
  font-size: clamp(54px, 8.5vw, 96px);
  font-weight: 800;
  line-height: 0.92;
  letter-spacing: -0.04em;
  margin-bottom: 22px;
}
.ad-title-solid  { color: var(--ad-text); }
.ad-title-stroke {
  /* Hollow outline treatment — the key differentiator */
  color: transparent;
  -webkit-text-stroke: 1.5px var(--ad-accent);
}

.ad-divider {
  width: 100%;
  height: 1px;
  background: var(--ad-border);
  margin: 20px 0;
  animation: ad-fade 0.6s ease 0.3s both;
}

.ad-meta-row {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
  animation: ad-fade 0.5s ease 0.25s both;
}
.ad-meta-item {
  font-family: var(--ad-mono);
  font-size: 12px;
  color: var(--ad-muted);
  padding: 0 18px;
  border-right: 1px solid var(--ad-border);
}
.ad-meta-item:first-child { padding-left: 0; }
.ad-meta-item:last-child  { border-right: none; }
.ad-meta-item strong {
  color: var(--ad-text);
  font-weight: 500;
}

/* ── Controls ── */
.ad-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 40px;
  animation: ad-fade 0.5s ease 0.2s both;
}
.ad-search-wrap { position: relative; }
.ad-search-prefix {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--ad-mono);
  font-size: 15px;
  color: var(--ad-accent);
  pointer-events: none;
  user-select: none;
  opacity: 0.5;
}
.ad-search {
  width: 100%;
  padding: 13px 16px 13px 40px;
  background: var(--ad-surface);
  border: 1px solid var(--ad-border);
  border-radius: 10px;
  color: var(--ad-text);
  font-family: var(--ad-mono);
  font-size: 13.5px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  caret-color: var(--ad-accent);
}
.ad-search::placeholder { color: rgba(107,100,135,0.5); }
.ad-search:focus {
  border-color: var(--ad-accent);
  box-shadow: 0 0 0 3px rgba(129,140,248,0.08);
}

.ad-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.ad-filter {
  font-family: var(--ad-mono);
  font-size: 11px;
  padding: 5px 14px;
  border-radius: 7px;
  border: 1px solid var(--ad-border);
  background: transparent;
  color: var(--ad-muted);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
  letter-spacing: 0.04em;
}
.ad-filter:hover {
  border-color: var(--ad-accent);
  color: var(--ad-accent);
}
.ad-filter.active {
  background: rgba(129,140,248,0.10);
  border-color: var(--ad-accent);
  color: var(--ad-accent);
}

/* ── Results row ── */
.ad-results-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  font-family: var(--ad-mono);
  font-size: 11px;
  color: rgba(107,100,135,0.6);
  letter-spacing: 0.06em;
  animation: ad-fade 0.4s ease both;
}

/* ── Grid ── */
.ad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 10px;
}

/* ── Card ── */
.ad-card {
  background: var(--ad-surface);
  border: 1px solid var(--ad-border);
  border-radius: 12px;
  padding: 22px 24px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transition:
    border-color   0.22s ease,
    background     0.22s ease,
    transform      0.22s ease,
    box-shadow     0.22s ease;
  text-decoration: none;
  display: block;
}
.ad-card:hover {
  border-color: var(--ad-border2);
  background: var(--ad-surface2);
  transform: translateY(-3px);
  box-shadow: 0 18px 52px rgba(0,0,0,0.38);
}

/* Left accent bar — appears on hover */
.ad-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 24%;
  bottom: 24%;
  width: 2px;
  background: var(--ad-accent);
  border-radius: 0 2px 2px 0;
  opacity: 0;
  transition: opacity 0.22s ease, top 0.3s ease, bottom 0.3s ease;
}
.ad-card:hover::before {
  opacity: 1;
  top: 16%;
  bottom: 16%;
}

/* Faint count watermark in card background */
.ad-card::after {
  content: attr(data-count);
  position: absolute;
  bottom: -6px;
  right: 10px;
  font-family: var(--ad-font);
  font-weight: 800;
  font-size: 72px;
  color: rgba(129,140,248,0.04);
  line-height: 1;
  pointer-events: none;
  user-select: none;
  transition: color 0.22s ease;
}
.ad-card:hover::after {
  color: rgba(129,140,248,0.065);
}

.card-index {
  position: absolute;
  top: 18px;
  right: 18px;
  font-family: var(--ad-mono);
  font-size: 10px;
  color: var(--ad-border);
  letter-spacing: 0.06em;
  transition: color 0.22s ease;
}
.ad-card:hover .card-index { color: var(--ad-dim); }

.card-icon {
  display: block;
  font-size: 22px;
  color: var(--ad-accent);
  margin-bottom: 16px;
  line-height: 1;
  transition: transform 0.22s ease;
}
.ad-card:hover .card-icon { transform: scale(1.15) rotate(-4deg); }

.card-badges {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}
.card-badge {
  font-family: var(--ad-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--ad-accent);
  border: 1px solid rgba(129,140,248,0.25);
  padding: 2px 8px;
  border-radius: 4px;
}

.card-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--ad-text);
  letter-spacing: -0.025em;
  margin-bottom: 7px;
  line-height: 1.2;
  transition: color 0.22s ease;
}
.ad-card:hover .card-name { color: #fff; }

.card-desc {
  font-size: 12.5px;
  color: var(--ad-muted);
  line-height: 1.65;
  margin-bottom: 18px;
  transition: color 0.22s ease;
}
.ad-card:hover .card-desc { color: rgba(173,165,195,0.85); }

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--ad-border);
  padding-top: 14px;
  transition: border-color 0.22s ease;
}
.ad-card:hover .card-footer { border-color: rgba(129,140,248,0.12); }

.complexity-pill {
  font-family: var(--ad-mono);
  font-size: 11px;
  color: var(--ad-green);
  background: rgba(52,211,153,0.07);
  border: 1px solid rgba(52,211,153,0.14);
  padding: 3px 9px;
  border-radius: 5px;
  letter-spacing: 0.02em;
}

.card-count {
  font-family: var(--ad-mono);
  font-size: 11px;
  color: rgba(107,100,135,0.55);
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 0.22s ease;
}
.ad-card:hover .card-count { color: var(--ad-muted); }
.card-count-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--ad-border);
  transition: background 0.22s ease;
}
.ad-card:hover .card-count-dot { background: var(--ad-accent); }

/* ── Empty state ── */
.ad-empty {
  grid-column: 1 / -1;
  padding: 90px 0;
  text-align: center;
  color: rgba(107,100,135,0.4);
}
.ad-empty-glyph {
  font-size: 38px;
  display: block;
  margin-bottom: 14px;
  opacity: 0.4;
}
.ad-empty-text {
  font-family: var(--ad-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
}

/* ── Responsive ── */
@media (max-width: 640px) {
  .ad-inner { padding: 48px 18px 64px; }
  .ad-meta-item { font-size: 11px; padding: 0 12px; }
  .ad-grid { grid-template-columns: 1fr; gap: 8px; }
}
`;

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function AlgoDirector() {
  const [query,       setQuery]       = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [mounted,     setMounted]     = useState(false);

  /* Inject fonts + component CSS once */
  useEffect(() => {
    const id = "algo-director-styles";
    if (!document.getElementById(id)) {
      const el = document.createElement("style");
      el.id = id;
      el.textContent = CSS;
      document.head.appendChild(el);
    }
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const currentFilter = FILTERS.find((f) => f.label === activeFilter) ?? FILTERS[0];

  const filtered = ALGORITHMS.filter((a) => {
    const matchSearch =
      !query ||
      a.name.toLowerCase().includes(query.toLowerCase()) ||
      a.desc.toLowerCase().includes(query.toLowerCase());
    return matchSearch && currentFilter.test(a);
  });

  const totalPatterns  = ALGORITHMS.reduce((s, a) => s + a.count, 0);
  const filteredPatt   = filtered.reduce((s, a) => s + a.count, 0);

  return (
    <div className="ad-root">
      <div className="ad-inner">

        {/* ── Header ── */}
        <header className="ad-header">
          <div className="ad-eyebrow">
            <span className="ad-eyebrow-dot" aria-hidden="true" />
            Algorithm Reference Index
          </div>

          <h1 className="ad-title">
            <span className="ad-title-solid">Choose Your</span>
            <span className="ad-title-stroke">Algorithm</span>
          </h1>

          <div className="ad-divider" role="separator" />

          <div className="ad-meta-row">
            <div className="ad-meta-item">
              <strong>{ALGORITHMS.length}</strong> topics
            </div>
            <div className="ad-meta-item">
              <strong>{totalPatterns}</strong> patterns
            </div>
            <div className="ad-meta-item">
              v2.0
            </div>
          </div>
        </header>

        {/* ── Controls ── */}
        <div className="ad-controls">
          <div className="ad-search-wrap">
            <span className="ad-search-prefix" aria-hidden="true">/</span>
            <input
              className="ad-search"
              placeholder="search topics and patterns…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search algorithms"
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

        {/* ── Results meta ── */}
        <div className="ad-results-row" aria-live="polite">
          <span>
            {filtered.length} topics · {filteredPatt} patterns
          </span>
          {query && (
            <span>&ldquo;{query}&rdquo;</span>
          )}
        </div>

        {/* ── Grid ── */}
        <div className="ad-grid">
          {filtered.length === 0 ? (
            <div className="ad-empty">
              <span className="ad-empty-glyph" aria-hidden="true">◌</span>
              <p className="ad-empty-text">no algorithms match your query</p>
            </div>
          ) : (
            filtered.map((algo, i) => (
              <AlgoCard
                key={algo.href}
                algo={algo}
                index={i}
                mounted={mounted}
              />
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
      {/* Card index number */}
      <span className="card-index" aria-hidden="true">
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Icon */}
      <span className="card-icon" aria-hidden="true">{algo.icon}</span>

      {/* Badges */}
      {algo.featured && (
        <div className="card-badges">
          <span className="card-badge">Featured</span>
        </div>
      )}

      {/* Name */}
      <h2 className="card-name">{algo.name}</h2>

      {/* Description */}
      <p className="card-desc">{algo.desc}</p>

      {/* Footer */}
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