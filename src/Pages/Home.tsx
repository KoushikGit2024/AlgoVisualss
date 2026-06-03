import { motion } from "framer-motion";
import { useRef,useState,useEffect } from "react";
import { Link } from "react-router-dom";
import getFlowData from "../lib/treeSitter";

// const CppVisualizer = dynamic(() => import('@/actions/CppVisualizer'), { 
//   ssr: false,
//   loading: () => <div className="p-8 text-center animate-pulse">Loading C++ Parser Engine...</div>
// });

// ─── Constants ────────────────────────────────────────────────────────────────
const BARS = [42, 18, 67, 31, 85, 24, 58, 73, 12, 90, 47, 36, 61, 79, 28];

const FEATURES = [
  {
    gradient: "from-[#818CF8] to-[#A78BFA]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="11" width="3.5" height="9" rx="1" fill="currentColor" />
        <rect x="7.5" y="7"  width="3.5" height="13" rx="1" fill="currentColor" />
        <rect x="13" y="3"  width="3.5" height="17" rx="1" fill="currentColor" />
        <rect x="18" y="9"  width="2.5" height="11" rx="1" fill="currentColor" />
      </svg>
    ),
    title: "Step-by-Step Execution",
    desc: "Pause, rewind, and advance through each operation with full control over execution speed.",
  },
  {
    gradient: "from-[#A78BFA] to-[#F472B6]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 7v4.5l3.5 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Complexity Analysis",
    desc: "Real-time Big-O notation display with time and space complexity for every algorithm.",
  },
  {
    gradient: "from-[#F472B6] to-[#FB923C]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 9h16M9 3v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Custom Input",
    desc: "Load your own arrays and graphs. Test edge cases and pathological inputs instantly.",
  },
  {
    gradient: "from-[#34D399] to-[#818CF8]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="5"  cy="5"  r="2.5" fill="currentColor" />
        <circle cx="17" cy="5"  r="2.5" fill="currentColor" />
        <circle cx="5"  cy="17" r="2.5" fill="currentColor" />
        <circle cx="17" cy="17" r="2.5" fill="currentColor" />
        <circle cx="11" cy="11" r="2.5" fill="currentColor" />
        <path d="M5 5l6 6M17 5l-6 6M5 17l6-6M17 17l-6-6" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
    title: "Graph Traversals",
    desc: "Visualize DFS, BFS, Dijkstra and more on interactive, fully editable graph canvases.",
  },
  {
    gradient: "from-[#818CF8] to-[#34D399]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M2 20l5-9 4.5 4.5 5-7.5L21 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: "Side-by-Side Compare",
    desc: "Run two algorithms simultaneously and compare performance on identical datasets.",
  },
  {
    gradient: "from-[#F472B6] to-[#818CF8]",
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9h8M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    title: "Annotated Code",
    desc: "Each visual step highlights the corresponding code line. Learn by seeing and reading.",
  },
];

const STATS = [
  { val: "40+",  label: "Algorithms" },
  { val: "6",    label: "Categories" },
  { val: "60fps", label: "Animation" },
];

// ─── Animated Sorting Bars ────────────────────────────────────────────────────
function SortingBars() {
  const [bars, setBars] = useState(BARS);
  const [active, setActive] = useState<[number, number]>([-1, -1]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => {
    const tmp = [...BARS];
    const steps: { arr: number[]; a: number; b: number }[] = [];

    for (let i = 0; i < tmp.length; i++) {
      for (let j = 0; j < tmp.length - i - 1; j++) {
        steps.push({ arr: [...tmp], a: j, b: j + 1 });
        if (tmp[j] > tmp[j + 1]) [tmp[j], tmp[j + 1]] = [tmp[j + 1], tmp[j]];
      }
    }
    steps.push({ arr: [...tmp], a: -1, b: -1 });

    let idx = 0;
    const run = () => {
      if (idx >= steps.length) {
        timerRef.current = setTimeout(() => {
          setBars(BARS);
          setActive([-1, -1]);
          idx = 0;
          timerRef.current = setTimeout(run, 800);
        }, 1400);
        return;
      }
      const s = steps[idx++];
      setBars(s.arr);
      setActive([s.a, s.b]);
      timerRef.current = setTimeout(run, 42);
    };
    timerRef.current = setTimeout(run, 600);
    return () => clearTimeout(timerRef.current);
  }, []);

  const max = Math.max(...bars);

  return (
    <div className="flex items-end gap-0.75 h-28" aria-hidden>
      {bars.map((h, i) => {
        const isActive = i === active[0] || i === active[1];
        return (
          <motion.div
            key={i}
            animate={{ height: `${(h / max) * 100}%` }}
            transition={{ type: "spring", stiffness: 900, damping: 40 }}
            className="flex-1 rounded-sm min-w-0"
            style={{
              background: isActive
                ? "var(--accent)"
                : "color-mix(in srgb, var(--accent) 25%, var(--surface-2))",
            }}
          />
        );
      })}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative w-full overflow-hidden pb-24">
      {/* Mesh gradient bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 55% at 50% -5%, var(--glow), transparent 65%),
            radial-gradient(ellipse 35% 40% at 95% 85%, rgba(167, 139, 250, 0.10), transparent 60%),
            radial-gradient(ellipse 30% 35% at 5%  80%, rgba(244,  114, 182, 0.08), transparent 60%)
          `,
        }}
      />
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, transparent, var(--bg))" }}
      />

      <div className="relative w-full px-6 pt-16 pb-4 md:pt-24 flex flex-col lg:flex-row items-start gap-12 md:gap-16">
        {/* Left text */}
        <div className="flex-1 min-w-0">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{
              background: "color-mix(in srgb, var(--accent) 10%, transparent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "var(--accent)" }} />
            <span className="text-xs font-medium tracking-wide" style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono, monospace)" }}>
              Interactive Learning Platform
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-none tracking-tight mb-6"
            style={{ color: "var(--text)" }}
          >
            See
            <br />
            Algorithms
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 50%, var(--accent-3) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Evolve.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.14 }}
            className="text-base leading-relaxed mb-10 max-w-md"
            style={{ color: "var(--muted)" }}
          >
            Experience algorithms as they execute — not just as code, but as dynamic systems.
            Step through sorting, searching, and graph traversals with real-time visual feedback.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, delay: 0.22 }}
            className="flex flex-wrap gap-3"
          >
            <Link
              to="/algorithms"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 group"
              style={{
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 0 0 0 var(--glow)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px 6px var(--glow)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 var(--glow)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              Start Visualizing
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-0.5">
                <path d="M2 7h10M8 4l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              to="/visualizer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
              style={{
                background: "transparent",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
              }}
            >
              View Demo
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.34 }}
            className="flex flex-wrap gap-8 mt-12"
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>{s.val}</div>
                <div className="text-xs mt-0.5 tracking-wide" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full md:w-90 lg:w-100 shrink-0 rounded-2xl overflow-hidden"
          style={{
            border: "1px solid var(--border)",
            background: "var(--surface)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.25), 0 0 40px var(--glow-soft)",
          }}
        >
          {/* Card header */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}>
              bubble_sort.ts
            </span>
            <div className="flex gap-1.5">
              {["#EF4444", "#EAB308", "#22C55E"].map((c) => (
                <span key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Bars */}
          <div className="px-5 pt-5 pb-2">
            <SortingBars />
          </div>

          {/* Controls */}
          <div
            className="flex items-center gap-2 px-5 py-3"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            {["⏮", "⏸", "⏭"].map((icon) => (
              <button
                key={icon}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-sm transition-all duration-150"
                style={{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                }}
              >
                {icon}
              </button>
            ))}
            <div className="flex-1 h-px mx-2" style={{ background: "var(--border)" }} />
            <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}>
              O(n²)
            </span>
          </div>

          {/* Code snippet */}
          <div
            className="px-5 py-4 text-xs leading-loose rounded-b-2xl"
            style={{
              fontFamily: "var(--font-geist-mono, monospace)",
              background: "var(--surface-2)",
              borderTop: "1px solid var(--border)",
              color: "var(--muted)",
            }}
          >
            <span style={{ color: "var(--accent)" }}>for</span> (i = 0; i &lt; n; i++) {"{"}
            <br />
            &nbsp;&nbsp;<span style={{ color: "var(--accent)" }}>for</span> (j = 0; j &lt; n-i; j++) {"{"}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: "var(--success)" }}>swap</span>(arr[j], arr[j+1])
            <br />
            &nbsp;&nbsp;{"}"}
            <br />
            {"}"}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section className="w-full px-6 pb-24">
      {/* Header */}
      <div className="mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-4 pb-8" style={{ borderBottom: "1px solid var(--border)" }}>
        <div>
          <div className="text-xs font-medium tracking-widest mb-3" style={{ color: "var(--accent)", fontFamily: "var(--font-geist-mono, monospace)" }}>
            CAPABILITIES
          </div>
          <h2 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Built for clarity.
          </h2>
        </div>
        <p className="text-sm leading-relaxed max-w-xs" style={{ color: "var(--muted)" }}>
          Every feature designed around one goal: making algorithmic thinking visible and intuitive.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className="group flex flex-col gap-4 p-6 rounded-2xl transition-all duration-300 cursor-default"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "color-mix(in srgb, var(--accent) 40%, transparent)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px var(--glow-soft), 0 0 0 1px color-mix(in srgb, var(--accent) 15%, transparent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {/* Icon with gradient bg */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-xl bg-linear-to-br ${f.gradient}`}
              style={{ color: "#fff" }}
            >
              {f.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--text)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="w-full px-6 pb-24">
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-12 md:px-14 flex flex-col md:flex-row items-center justify-between gap-8"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--surface)) 0%, color-mix(in srgb, var(--accent-2) 8%, var(--surface)) 100%)",
          border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 left-1/4 w-64 h-64 -translate-y-1/2 rounded-full pointer-events-none"
          style={{ background: "var(--glow)", filter: "blur(60px)", opacity: 0.5 }}
        />
        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight mb-2" style={{ color: "var(--text)" }}>
            Ready to visualize?
          </h2>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            No account required. Open in your browser. Free forever.
          </p>
        </div>
        <Link
          to="/algorithms"
          className="relative inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold shrink-0 transition-all duration-300 group"
          style={{
            background: "var(--accent)",
            color: "#fff",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 32px 8px var(--glow)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
            (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
          }}
        >
          Launch AlgoVisuals
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="transition-transform group-hover:translate-x-0.5">
            <path d="M2 7h10M8 4l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="w-full px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div className="text-xs font-medium tracking-wider" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}>
          AlgoVisuals — See Algorithms Think
        </div>
        <div className="flex gap-6">
          {["GitHub", "Twitter", "Discord", "Docs"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-xs tracking-wide transition-colors duration-150"
              style={{ color: "var(--muted)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--accent)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--muted)")}
            >
              {link}
            </a>
          ))}
        </div>
        <div className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}>
          © {new Date().getFullYear()} AlgoVisuals
        </div>
      </div>
    </footer>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HomePage() {
    async function testParser() {

      const code = `
#include <iostream>
#include <vector>
#include <map>
#include <fstream>
#include <algorithm>
#include <functional>

using namespace std;

// 1. Recursive Function (Stack & Scope Visualization)
int factorial(int n) {
    if (n <= 1) {
        return 1;
    }
    return n * factorial(n - 1);
}

// 2. Algorithmic Sorting (Nested Loops & Subscript Swapping)
void bubbleSort(int arr[], int size) {
    for (int i = 0; i < size - 1; i++) {
        for (int j = 0; j < size - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

// 3. Binary Search (Math Precedence, While Loops, Multiple Assignments)
int binarySearch(int arr[], int size, int target) {
    int left = 0;
    int right = size - 1;
    
    while (left <= right) {
        // Prevents integer overflow, tests parenthesis evaluation
        int mid = left + (right - left) / 2; 
        
        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    return -1; // Target not found
}

// 4. Data Aggregation (Procedural Logic)
double calculateTotalSalary(double salaries[], int count) {
    double sum = 0;
    for (int i = 0; i < count; i++) {
        sum = sum + salaries[i]; 
    }
    return sum;
}

int main() {
    // --- PRIMITIVES & INITIALIZATION ---
    int x = 10;
    char grade = 'B';
    
    // Arrays (Tests InitializerList & SubscriptExpression)
    int nums[] = {5, 3, 1, 4, 2};
    int numsSize = 5;

    // --- ALGORITHM VISUALIZATION ---
    // 1. Sort the array
    bubbleSort(nums, numsSize);

    // 2. Search the sorted array
    int searchIndex = binarySearch(nums, numsSize, 4);

    // --- MODERN C++ LOOPS (Tests ForRangeStatement) ---
    
    for (int val : nums) {
    }

    // --- CONTROL FLOW ABUSE (Tests Break, Continue, Ternary) ---
    for (int i = 0; i < 10; i++) {
        // Skip number 4
        if (i == 4) {
            continue; 
        }
        
        // Stop entirely at 8
        if (i == 8) {
            break; 
        }
        
        // Ternary operator
        int isEven = (i % 2 == 0) ? 1 : 0;
    }

    // --- ITERATIVE FIBONACCI (Tests Updates ++ and Multiple Assignments) ---
    int a = 0;
    int b = 1;
    int fibCount = 0;
    
    while (fibCount < 5) {
        int next = a + b;
        a = b;
        b = next;
        fibCount++; // Tests UpdateExpression
    }

    // --- FUNCTION CALLS & PROCEDURAL LOGIC ---
    int factResult = factorial(4);
    
    double salaries[] = {50000.0, 45000.0, 62500.0};
    double total = calculateTotalSalary(salaries, 3);
    cout << "hi";
    return 0;
}
      `;

      // const flowData = await getFlowData(code);

      // console.log(flowData);
    }

    testParser();
  return (
    <div className="relative w-full" style={{ background: "var(--bg)" }}>
      {/* <Hero />
      <Features />
      <CTABanner />
      <Footer /> */}
      hi
      {/* <CppVisualizer/> */}
      {/* <CodeEditor/> */}
    </div>
  );
}