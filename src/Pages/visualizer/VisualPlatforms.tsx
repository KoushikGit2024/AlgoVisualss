import { Link } from "react-router-dom";
import { motion } from "framer-motion";

// FIXED BUG-04: all hrefs now use /visualizer/* (not /visualizers/*)
const PLATFORMS = [
  {
    name: "LeetCode",
    href: "/visualizer/leetcode",
    gradient: "from-[#FB923C] to-[#F59E0B]",
    dot: "#FB923C",
    desc: "Track your submission stats, acceptance rates, and problem-solving heatmap.",
    stats: ["Daily streaks", "Acceptance rate", "Difficulty breakdown"],
  },
  {
    name: "Codeforces",
    href: "/visualizer/codeforces",
    gradient: "from-[#818CF8] to-[#6366F1]",
    dot: "#818CF8",
    desc: "Visualize your rating progression, contest history, and tag-level performance.",
    stats: ["Rating graph", "Contest history", "Tag analysis"],
  },
  {
    name: "CodeChef",
    href: "/visualizer/codechef",
    gradient: "from-[#34D399] to-[#059669]",
    dot: "#34D399",
    desc: "Monitor your long and short contest rankings with visual performance charts.",
    stats: ["Star rating", "Contest rank", "Division tracking"],
  },
];

export default function VisualPlatforms() {
  return (
    <div className="p-6 pb-16" style={{ background: "var(--bg)" }}>
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
          Visualizer
        </h1>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Connect your competitive programming profiles and visualize your progress.
        </p>
      </div>

      {/* Platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PLATFORMS.map((p, i) => (
          <motion.div
            key={p.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            whileHover={{ y: -4 }}
          >
            <Link
              to={p.href}
              className="group flex flex-col gap-5 p-6 rounded-2xl h-full transition-all duration-300"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "color-mix(in srgb, var(--accent) 35%, transparent)";
                el.style.boxShadow = "0 8px 32px var(--glow-soft)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "var(--border)";
                el.style.boxShadow = "none";
              }}
            >
              {/* Platform icon + name */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold bg-linear-to-br ${p.gradient}`}
                >
                  {p.name.slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sm transition-colors group-hover:text-(--accent)" style={{ color: "var(--text)" }}>
                    {p.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.dot }} />
                    <span className="text-[11px]" style={{ color: "var(--muted)" }}>Live data</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm leading-relaxed flex-1" style={{ color: "var(--muted)" }}>
                {p.desc}
              </p>

              {/* Stats list */}
              <div className="flex flex-col gap-1.5 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                {p.stats.map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{s}</span>
                  </div>
                ))}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}