import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./VisualPlatforms.css";

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const PLATFORMS = [
  {
    name: "LeetCode",
    href: "/visualizer/leetcode",
    color: "#FFA116",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l5.066 4.708c.501.467 1.217.765 1.933.765.716 0 1.436-.298 1.936-.765l5.063-4.708a5.997 5.997 0 0 0 1.494-2.148 5.89 5.89 0 0 0 .154-.586c.015-.097.026-.192.033-.284a5.56 5.56 0 0 0-.083-2.457 5.8 5.8 0 0 0-.38-1.02 5.964 5.964 0 0 0-1.215-1.524l-3.846-4.11L14.45.432A1.36 1.36 0 0 0 13.483 0zm-2.846 14.12h7.625c.57 0 1.034.467 1.034 1.042 0 .574-.465 1.041-1.034 1.041H10.637c-.568 0-1.033-.467-1.033-1.041 0-.575.465-1.042 1.033-1.042z" />
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 24 24" fill="#FFA116">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.939 5.939 0 0 0 1.271 1.543l5.066 4.708c.501.467 1.217.765 1.933.765.716 0 1.436-.298 1.936-.765l5.063-4.708a5.997 5.997 0 0 0 1.494-2.148 5.89 5.89 0 0 0 .154-.586c.015-.097.026-.192.033-.284a5.56 5.56 0 0 0-.083-2.457 5.8 5.8 0 0 0-.38-1.02 5.964 5.964 0 0 0-1.215-1.524l-3.846-4.11L14.45.432A1.36 1.36 0 0 0 13.483 0zm-2.846 14.12h7.625c.57 0 1.034.467 1.034 1.042 0 .574-.465 1.041-1.034 1.041H10.637c-.568 0-1.033-.467-1.033-1.041 0-.575.465-1.042 1.033-1.042z" />
      </svg>
    ),
    desc: "Track your submission stats, acceptance rates, and problem-solving heatmap.",
    stats: ["Daily streaks", "Acceptance rate", "Difficulty breakdown"],
  },
  {
    name: "Codeforces",
    href: "/visualizer/codeforces",
    color: "#3B82F6",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3zm9 7.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" />
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3z" fill="#FBBF24" />
        <path d="M13.5 3c.828 0 1.5.672 1.5 1.5v15c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5v-15c0-.828.672-1.5 1.5-1.5h3z" fill="#3B82F6" />
        <path d="M22.5 10.5c.828 0 1.5.672 1.5 1.5v7.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V12c0-.828.672-1.5 1.5-1.5h3z" fill="#F87171" />
      </svg>
    ),
    desc: "Visualize your rating progression, contest history, and tag-level performance.",
    stats: ["Rating graph", "Contest history", "Tag analysis"],
  },
  {
    name: "CodeChef",
    href: "/visualizer/codechef",
    color: "#8B6B53",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.015 1.34L.925 7.74l2.58 14.92h17.02l2.55-14.92-11.06-6.4zm0 2.22l8.22 4.76-1.93 11.23H5.7l-1.92-11.23 8.23-4.76zm-5.74 6.64v8.58h1.61v-8.58H6.27zm9.86 0v8.58h1.6v-8.58h-1.6zm-4.94.7c-2.02 0-3.66 1.63-3.66 3.65 0 2.02 1.64 3.65 3.66 3.65 2.01 0 3.65-1.63 3.65-3.65 0-2.02-1.64-3.65-3.65-3.65zm0 1.62c1.12 0 2.04.9 2.04 2.03s-.92 2.03-2.04 2.03c-1.13 0-2.04-.9-2.04-2.03s.91-2.03 2.04-2.03z"/>
      </svg>
    ),
    hoverIcon: (
      <svg viewBox="0 0 24 24" fill="#8B6B53">
         <path d="M12.015 1.34L.925 7.74l2.58 14.92h17.02l2.55-14.92-11.06-6.4zm0 2.22l8.22 4.76-1.93 11.23H5.7l-1.92-11.23 8.23-4.76zm-5.74 6.64v8.58h1.61v-8.58H6.27zm9.86 0v8.58h1.6v-8.58h-1.6zm-4.94.7c-2.02 0-3.66 1.63-3.66 3.65 0 2.02 1.64 3.65 3.66 3.65 2.01 0 3.65-1.63 3.65-3.65 0-2.02-1.64-3.65-3.65-3.65zm0 1.62c1.12 0 2.04.9 2.04 2.03s-.92 2.03-2.04 2.03c-1.13 0-2.04-.9-2.04-2.03s.91-2.03 2.04-2.03z"/>
      </svg>
    ),
    desc: "Monitor your long and short contest rankings with visual performance charts.",
    stats: ["Star rating", "Contest rank", "Division tracking"],
  },
];

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function VisualPlatforms() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="vp-root">
      <div className="vp-inner">
        
        {/* ── Header ── */}
        <header className="vp-header">
          <div className="vp-eyebrow">
            <span className="vp-eyebrow-dot" aria-hidden="true" />
            Analytics Hub
          </div>
          <h1 className="vp-title">Visualizer Profiles</h1>
          <div className="vp-divider" role="separator" />
          <p className="vp-subtitle">
            Connect your competitive programming profiles. We fetch your live data to generate beautiful, insightful performance metrics.
          </p>
        </header>

        {/* ── Grid ── */}
        <div className="vp-grid">
          {PLATFORMS.map((platform, i) => (
            <PlatformCard 
              key={platform.href} 
              platform={platform} 
              index={i} 
              mounted={mounted} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}

/* ─── Card sub-component ─────────────────────────────────────────────────────── */
function PlatformCard({ platform, index, mounted }) {
  return (
    <Link
      to={platform.href}
      className="vp-card"
      /* Pass the brand color to CSS via a custom property */
      style={{
        '--brand-color': platform.color,
        animation: mounted
          ? `vp-card 0.45s cubic-bezier(0.2,0,0,1) ${index * 80}ms forwards`
          : "none",
        opacity: mounted ? undefined : 0,
      } as React.CSSProperties}
      aria-label={`Connect ${platform.name} profile`}
    >
      
      {/* Dual Hover Icon Wrapper */}
      <div className="card-icon-wrapper" aria-hidden="true">
        <div className="card-icon-default">
          {platform.icon}
        </div>
        <div className="card-icon-hover">
          {platform.hoverIcon} 
        </div>
      </div>

      <div className="card-badges">
        <span className="card-badge">Live Sync</span>
      </div>

      {/* Name with Dynamic Underline */}
      <div className="card-name-wrapper">
        <h2 className="card-name">{platform.name}</h2>
      </div>

      {/* Description */}
      <p className="card-desc">{platform.desc}</p>

      {/* Stats List */}
      <div className="card-stats">
        {platform.stats.map((stat) => (
          <div key={stat} className="stat-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="stat-check">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{stat}</span>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="card-footer">
        <span className="platform-action">
          Connect Profile <span aria-hidden="true" className="arrow">→</span>
        </span>
      </div>
      
    </Link>
  );
}