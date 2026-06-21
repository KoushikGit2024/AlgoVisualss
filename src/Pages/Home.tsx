// import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Pause, FastForward, Activity, Code2, Network, Braces, ChevronRight, CornerDownRight } from "lucide-react";
// import NetworkBackground1 from "./components/NetworkBackground";
import NetworkBackground from "./components/HomeBackgroundAnimation";
import D1Array from "../codeVisualizer/dataStructures/D1Array";
import D2Array from "../codeVisualizer/dataStructures/D2Array";
import ComponentTester from "../dumpyard/Tester";
// import getFlowData from "../lib/treeSitter";
// import CodeWindow from "../codeVisualizer/CodeWindow";

// ─── Main Landing Page Component (Unchanged) ──────────────────────────────────
export default function HomePage() {


  return (
    // <div className="relative flex flex-col flex-1 items-center bg-[var(--bg)] overflow-hidden selection:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)] selection:text-[var(--text)]">
      
    //   {/* ─── Clean Dot Grid Background ─── */}
    //   <div className="absolute inset-0 bg-[radial-gradient(circle,color-mix(in_srgb,var(--text)_8%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-60" />

    //   {/* ─── Hero Section ─── */}
    //   <main className="relative flex flex-col items-center justify-center w-full px-6 pt-32 pb-24 text-center">
        
    //     {/* The Animated Raining Text Background */}
    //     <NetworkBackground/>

    //     <div className="relative z-10 flex flex-col items-center">
    //       <motion.div
    //         initial={{ opacity: 0, y: 10 }}
    //         animate={{ opacity: 1, y: 0 }}
    //         transition={{ duration: 0.4 }}
    //         className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[var(--surface-2)] border border-[var(--border)] text-[12px] font-[var(--font-geist-mono)] text-[var(--text)] mb-8 tracking-wide uppercase shadow-sm"
    //       >
    //         <Activity size={14} className="text-[var(--accent)]" />
    //         AlgoVisuals Engine v2.0
    //       </motion.div>

    //       <motion.h1
    //         initial={{ opacity: 0, y: 15 }}
    //         animate={{ opacity: 1, y: 0 }}
    //         transition={{ duration: 0.5, delay: 0.1 }}
    //         className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[var(--text)] leading-[1.1] mb-6"
    //       >
    //         Don't just read code. <br />
    //         <span className="text-[var(--accent)]">
    //           Watch it execute.
    //         </span>
    //       </motion.h1>

    //       <motion.p
    //         initial={{ opacity: 0, y: 15 }}
    //         animate={{ opacity: 1, y: 0 }}
    //         transition={{ duration: 0.5, delay: 0.2 }}
    //         className="text-lg sm:text-xl text-[var(--muted)] max-w-2xl font-normal leading-relaxed mb-10"
    //       >
    //         A high-fidelity sandbox to visualize data structures, trace algorithms step-by-step, and deeply understand software architecture.
    //       </motion.p>

    //       <motion.div
    //         initial={{ opacity: 0, y: 15 }}
    //         animate={{ opacity: 1, y: 0 }}
    //         transition={{ duration: 0.5, delay: 0.3 }}
    //         className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center"
    //       >
    //         <Link
    //           to="/visualizer"
    //           className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-[8px] bg-[var(--accent)] text-[#ffffff] font-bold shadow-sm transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
    //         >
    //           Launch Visualizer <ChevronRight size={18} />
    //         </Link>
    //         <Link
    //           to="/algorithms"
    //           className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] font-semibold transition-colors duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)]"
    //         >
    //           Explore Library
    //         </Link>
    //       </motion.div>
    //     </div>
    //   </main>

    //   {/* ─── Structural Feature Grid ─── */}
    //   <section className="relative z-10 w-full max-w-6xl px-6 pb-32">
        
    //     <div className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[var(--border)] pb-6">
    //       <div>
    //         <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] mb-2">Engineered for clarity.</h2>
    //         <p className="text-[var(--muted)]">Core features designed to make complex logic entirely transparent.</p>
    //       </div>
    //     </div>

    //     <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-auto gap-4">
          
    //       {/* Box 1: Execution Control (Spans 2 columns) */}
    //       <motion.div 
    //         initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    //         className="md:col-span-2 flex flex-col justify-between p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden transition-colors hover:border-[var(--muted)]"
    //       >
    //         <div>
    //           <div className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] mb-6">
    //             <Activity size={20} />
    //           </div>
    //           <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Granular Execution Control</h3>
    //           <p className="text-[var(--muted)] text-[15px] leading-relaxed max-w-md">
    //             Take the wheel. Pause, rewind, fast-forward, or step through algorithms line-by-line to observe state mutations at every cycle.
    //           </p>
    //         </div>
            
    //         {/* Minimal Player UI */}
    //         <div className="mt-10 flex items-center justify-center gap-3 p-3 rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] w-fit shadow-sm">
    //           <button className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] transition-colors"><Pause size={16} fill="currentColor" /></button>
    //           <button className="p-2.5 rounded-md bg-[var(--accent)] text-[#ffffff] hover:opacity-90 transition-opacity">
    //             <Play size={18} fill="currentColor" />
    //           </button>
    //           <button className="p-2 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--text)_10%,transparent)] transition-colors"><FastForward size={16} fill="currentColor" /></button>
    //         </div>
    //       </motion.div>

    //       {/* Box 2: Code Integration */}
    //       <motion.div 
    //         initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.1 }}
    //         className="flex flex-col p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors hover:border-[var(--muted)]"
    //       >
    //         <div className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] mb-6">
    //           <Code2 size={20} />
    //         </div>
    //         <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Live Code Tracing</h3>
    //         <p className="text-[var(--muted)] text-[15px] leading-relaxed">
    //           Visuals synchronize perfectly with actual code. Watch the execution pointer move natively through C++, JS, or Python.
    //         </p>
    //       </motion.div>

    //       {/* Box 3: Graph Editor */}
    //       <motion.div 
    //         initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.2 }}
    //         className="flex flex-col p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] transition-colors hover:border-[var(--muted)]"
    //       >
    //         <div className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] mb-6">
    //           <Network size={20} />
    //         </div>
    //         <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Interactive Graphs</h3>
    //         <p className="text-[var(--muted)] text-[15px] leading-relaxed">
    //           Construct custom nodes and edges on a drag-and-drop canvas to stress-test pathfinding and routing algorithms.
    //         </p>
    //       </motion.div>

    //       {/* Box 4: State Monitoring (Spans 2 columns) */}
    //       <motion.div 
    //         initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.3 }}
    //         className="md:col-span-2 flex flex-col md:flex-row items-center justify-between p-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden transition-colors hover:border-[var(--muted)]"
    //       >
    //         <div className="mb-8 md:mb-0 max-w-sm">
    //           <div className="w-10 h-10 flex items-center justify-center rounded-[8px] bg-[var(--surface-2)] border border-[var(--border)] text-[var(--text)] mb-6">
    //             <Braces size={20} />
    //           </div>
    //           <h3 className="text-lg font-semibold text-[var(--text)] mb-2">State Introspection</h3>
    //           <p className="text-[var(--muted)] text-[15px] leading-relaxed">
    //             A dedicated variable scope window updates instantly. Keep exact track of pointers, accumulators, and the call-stack without console logs.
    //           </p>
    //         </div>

    //         {/* Clean Monospace State UI */}
    //         <div className="w-full md:w-auto bg-[var(--surface-2)] border border-[var(--border)] rounded-[6px] p-5 font-[var(--font-geist-mono)] text-[13px] shadow-sm text-left min-w-[240px]">
    //           <div className="flex items-center gap-2 text-[var(--text)] mb-3 pb-2 border-b border-[var(--border)] font-semibold">
    //             <CornerDownRight size={14} className="text-[var(--accent)]" /> <span>Scope State</span>
    //           </div>
    //           <div className="flex justify-between mb-1">
    //             <span className="text-[var(--muted)]">target</span>
    //             <span className="text-[var(--accent)] font-bold">42</span>
    //           </div>
    //           <div className="flex justify-between mb-1">
    //             <span className="text-[var(--muted)]">left</span>
    //             <span className="text-[var(--accent)] font-bold">0</span>
    //           </div>
    //           <div className="flex justify-between mb-3">
    //             <span className="text-[var(--muted)]">right</span>
    //             <span className="text-[var(--accent)] font-bold">9</span>
    //           </div>
    //           <div className="flex items-center gap-2 text-[#ffffff] bg-[var(--accent)] px-2 py-1 -mx-2 rounded">
    //             <span>▶</span> <span className="font-semibold">mid = 4</span>
    //           </div>
    //         </div>
    //       </motion.div>

    //     </div>
    //   </section>

    //   {/* ─── CTA ─── */}
    //   <section className="w-full max-w-4xl px-6 pb-32">
    //     <div className="flex flex-col items-center justify-center p-12 sm:p-16 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-center shadow-sm">
    //       <h2 className="text-3xl font-bold tracking-tight text-[var(--text)] mb-3">
    //         Start mastering algorithms.
    //       </h2>
    //       <p className="text-[var(--muted)] text-[15px] mb-8 max-w-md">
    //         Jump into the algorithm library or load up the visualizer sandbox to begin building your mental models.
    //       </p>
    //       {/* Fixed Contrast: Solid Accent with White Text */}
    //       <Link
    //         to="/algorithms"
    //         className="px-8 py-3.5 rounded-[8px] bg-[var(--accent)] text-[#ffffff] font-bold shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
    //       >
    //         Explore Library
    //       </Link>
    //     </div>
    //   </section>

    // </div>
    // <CodeWindow/>
    <>
      <ComponentTester/>
    </>
  );
}