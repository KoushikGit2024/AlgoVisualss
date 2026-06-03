import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./DocDirector.css";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const DOCS = [
  // --- Languages ---
  {
    name: "C++",
    category: "Languages",
    to: "/documentation/cpp",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19h16M4 15h16M14 9V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14M14 9l6 6m-6-6v4"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2"><path d="M4 19h16M4 15h16M14 9V5a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14M14 9l6 6m-6-6v4" strokeDasharray="4 4"/></svg>,
    desc: "High-performance systems, competitive programming, and core logic.",
    version: "C++20",
  },
  {
    name: "JavaScript",
    category: "Languages",
    to: "/documentation/javascript",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M9 16v-6a2 2 0 0 1 4 0v6M15 16s1.5-2 3-2-3-5-3-5"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" fill="#FBBF24" fillOpacity="0.2"/><path d="M9 16v-6a2 2 0 0 1 4 0v6M15 16s1.5-2 3-2-3-5-3-5"/></svg>,
    desc: "The core language of the web. DOM manipulation, async logic, and APIs.",
    version: "ES2023",
  },
  {
    name: "Python",
    category: "Languages",
    to: "/documentation/python",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth="3"/></svg>,
    desc: "Data analysis (Pandas), scripting, and backend automation.",
    version: "3.12",
  },

  // --- Frontend ---
  {
    name: "React",
    category: "Frontend",
    to: "/documentation/react",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="2"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2"><circle cx="12" cy="12" r="2" fill="#38BDF8"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" strokeDasharray="3 3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" strokeDasharray="3 3"/><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(90 12 12)" strokeDasharray="3 3"/></svg>,
    desc: "Component-based UI library for building interactive web applications.",
    version: "v18.2",
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    to: "/documentation/tailwind",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 14.5C4 11.5 6.5 9 9.5 9c2 0 3.5 1 4.5 2.5C15 8 17.5 6 20.5 6 22 6 23 7 23 8.5c0 3-2.5 5.5-5.5 5.5-2 0-3.5-1-4.5-2.5C12 14.5 9.5 17 6.5 17 5 17 4 16 4 14.5z"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#06B6D4" strokeWidth="2"><path d="M4 14.5C4 11.5 6.5 9 9.5 9c2 0 3.5 1 4.5 2.5C15 8 17.5 6 20.5 6 22 6 23 7 23 8.5c0 3-2.5 5.5-5.5 5.5-2 0-3.5-1-4.5-2.5C12 14.5 9.5 17 6.5 17 5 17 4 16 4 14.5z" fill="#06B6D4" fillOpacity="0.2"/></svg>,
    desc: "Utility-first CSS framework for rapid UI development.",
    version: "v3.4",
  },

  // --- Backend ---
  {
    name: "Node.js",
    category: "Backend",
    to: "/documentation/nodejs",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#4ADE80" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="#4ADE80" fillOpacity="0.2"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
    desc: "V8 JavaScript runtime for building scalable network applications.",
    version: "v20 LTS",
  },
  {
    name: "Express.js",
    category: "Backend",
    to: "/documentation/express",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 9l3 3-3 3M13 15h3"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M8 9l3 3-3 3M13 15h3" strokeWidth="3"/></svg>,
    desc: "Fast, unopinionated, minimalist web framework for Node.js.",
    version: "v4.18",
  },
  {
    name: "Socket.IO",
    category: "Backend",
    to: "/documentation/socketio",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#FCD34D" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="#FCD34D" fillOpacity="0.3"/></svg>,
    desc: "Bidirectional and low-latency communication for real-time apps.",
    version: "v4.7",
  },

  // --- Databases ---
  {
    name: "MongoDB",
    category: "Databases",
    to: "/documentation/mongodb",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2c-3 3-4 7-4 12 0 4 2 6 4 8 2-2 4-4 4-8 0-5-1-9-4-12z"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2"><path d="M12 2c-3 3-4 7-4 12 0 4 2 6 4 8 2-2 4-4 4-8 0-5-1-9-4-12z" fill="#22C55E" fillOpacity="0.2"/></svg>,
    desc: "NoSQL document database designed for ease of development and scaling.",
    version: "v7.0",
  },
  {
    name: "PostgreSQL",
    category: "Databases",
    to: "/documentation/postgresql",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#60A5FA" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" fill="#60A5FA" fillOpacity="0.2"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
    desc: "Advanced open-source relational database with strong ACID compliance.",
    version: "v16",
  },
  {
    name: "Redis",
    category: "Databases",
    to: "/documentation/redis",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill="#EF4444" fillOpacity="0.2"/></svg>,
    desc: "In-memory data structure store, used as a database, cache, and message broker.",
    version: "v7.2",
  },

  // --- AI/ML ---
  {
    name: "TensorFlow",
    category: "AI/ML",
    to: "/documentation/tensorflow",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    hoverIcon: <svg viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeDasharray="3 3"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12" strokeWidth="3"/></svg>,
    desc: "End-to-end open source platform for machine learning and neural networks.",
    version: "v2.15",
  }
];

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
    <div className="dd-root">
      <div className="dd-inner">

        <header className="dd-header">
          <div className="dd-eyebrow">
            <span className="dd-eyebrow-dot" aria-hidden="true" />
            Knowledge Base
          </div>
          <h1 className="dd-title">Documentation Hub</h1>
          <div className="dd-divider" role="separator" />
          <div className="dd-meta-row">
            <div className="dd-meta-item">
              <strong>{DOCS.length}</strong> core technologies
            </div>
            <div className="dd-meta-item">
              <strong>5</strong> categories
            </div>
            <div className="dd-meta-item">v1.0</div>
          </div>
        </header>

        <div className="dd-controls">
          <div className="dd-search-wrap">
            <span className="dd-search-prefix" aria-hidden="true">/</span>
            <input
              className="dd-search"
              placeholder="search frameworks, databases, and languages…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search documentation"
            />
          </div>

          <div className="dd-filters" role="group" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`dd-filter ${activeTab === cat ? "active" : ""}`}
                onClick={() => setActiveTab(cat)}
                aria-pressed={activeTab === cat}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="dd-results-row" aria-live="polite">
          <span>
            {filteredDocs.length} {filteredDocs.length === 1 ? "document" : "documents"} found
          </span>
          {query && <span>&ldquo;{query}&rdquo;</span>}
        </div>

        <div className="dd-grid">
          {filteredDocs.length === 0 ? (
            <div className="dd-empty">
              <span className="dd-empty-glyph" aria-hidden="true">◌</span>
              <p className="dd-empty-text">no documentation matches your query</p>
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
function DocCard({ doc, index, mounted }) {
  return (
    <Link
      to={doc.to}
      className="dd-card"
      style={{
        animation: mounted
          ? `dd-card 0.45s cubic-bezier(0.2,0,0,1) ${index * 42}ms forwards`
          : "none",
        opacity: mounted ? undefined : 0,
      }}
      aria-label={`${doc.name} documentation`}
    >
      <div className="card-icon-wrapper" aria-hidden="true">
        <div className="card-icon-default">
          {doc.icon}
        </div>
        <div className="card-icon-hover">
          {doc.hoverIcon} 
        </div>
      </div>

      <div className="card-badges">
        <span className="card-badge">{doc.category}</span>
      </div>

      <div className="card-name-wrapper">
        <h2 className="card-name">{doc.name}</h2>
      </div>

      <p className="card-desc">{doc.desc}</p>

      <div className="card-footer">
        <span className="doc-version">{doc.version}</span>
        <span className="doc-read-more">
          Read Docs <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}