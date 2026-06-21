// import React, { useState, useEffect } from 'react';
// import D1Array from '../codeVisualizer/dataStructures/D1Array';
// import D2Array from '../codeVisualizer/dataStructures/D2Array';

// // ─── 1. Mock Timeline Data ───────────────────────────────────────────────────

// // Simulating a sequence of operations (e.g., finding a target, swapping, deleting)
// const timeline1D = [
//   { desc: "Initial State", value: [34, 7, 23, 32, 5, 8], pointers: [{ name: 'i', index: 0 }, { name: 'j', index: 1 }] },
//   { desc: "Compare i and j", value: [34, 7, 23, 32, 5, 8], pointers: [{ name: 'i', index: 0 }, { name: 'j', index: 1 }], compareIndices: [0, 1] },
//   { desc: "Swap i and j", value: [7, 34, 23, 32, 5, 8], pointers: [{ name: 'i', index: 0 }, { name: 'j', index: 1 }], swapIndices: [0, 1] },
//   { desc: "Advance Pointers", value: [7, 34, 23, 32, 5, 8], pointers: [{ name: 'i', index: 1 }, { name: 'j', index: 2 }] },
//   { desc: "Compare i and j", value: [7, 34, 23, 32, 5, 8], pointers: [{ name: 'i', index: 1 }, { name: 'j', index: 2 }], compareIndices: [1, 2] },
//   { desc: "Swap i and j", value: [7, 23, 34, 32, 5, 8], pointers: [{ name: 'i', index: 1 }, { name: 'j', index: 2 }], swapIndices: [1, 2] },
//   { desc: "Read Index 3", value: [7, 23, 34, 32, 5, 8], pointers: [{ name: 'i', index: 1 }, { name: 'j', index: 2 }, { name: 'curr', index: 3 }], readIndices: [3] },
//   { desc: "Write to Index 3", value: [7, 23, 34, 99, 5, 8], pointers: [{ name: 'i', index: 1 }, { name: 'j', index: 2 }, { name: 'curr', index: 3 }], writeIndices: [3] },
//   { desc: "Delete Index 5", value: [7, 23, 34, 99, 5, ''], pointers: [{ name: 'i', index: 1 }, { name: 'j', index: 2 }], deleteIndices: [5] },
// ];

// // Simulating a 2D matrix traversal (e.g., BFS/DFS or Grid Search)
// const timeline2D = [
//   { desc: "Initial Grid", value: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], pointers: [{ name: 'curr', row: 0, col: 0 }] },
//   { desc: "Read (0,0)", value: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], pointers: [{ name: 'curr', row: 0, col: 0 }], readIndices: [{ row: 0, col: 0 }] },
//   { desc: "Move Right & Compare", value: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], pointers: [{ name: 'curr', row: 0, col: 1 }], compareIndices: [{ row: 0, col: 1 }] },
//   { desc: "Move Down & Compare", value: [[1, 2, 3], [4, 5, 6], [7, 8, 9]], pointers: [{ name: 'curr', row: 1, col: 1 }], compareIndices: [{ row: 1, col: 1 }] },
//   { desc: "Write to (1,1)", value: [[1, 2, 3], [4, 99, 6], [7, 8, 9]], pointers: [{ name: 'curr', row: 1, col: 1 }], writeIndices: [{ row: 1, col: 1 }] },
//   { desc: "Highlight Target Range", value: [[1, 2, 3], [4, 99, 6], [7, 8, 9]], pointers: [{ name: 'curr', row: 1, col: 1 }], highLightRange: [{ startRow: 1, endRow: 2, startCol: 1, endCol: 2 }] },
//   { desc: "Swap (1,1) & (2,2)", value: [[1, 2, 3], [4, 9, 6], [7, 8, 99]], pointers: [{ name: 'p1', row: 1, col: 1 }, { name: 'p2', row: 2, col: 2 }], swapIndices: [{ row: 1, col: 1 }, { row: 2, col: 2 }] },
//   { desc: "Delete (2,0)", value: [[1, 2, 3], [4, 9, 6], ['X', 8, 99]], pointers: [{ name: 'curr', row: 2, col: 0 }], deleteIndices: [{ row: 2, col: 0 }] },
// ];

// // ─── 2. Main Tester Component ────────────────────────────────────────────────

// const DynamicTester = () => {
//   const [step1D, setStep1D] = useState(0);
//   const [step2D, setStep2D] = useState(0);
//   const [isPlaying1D, setIsPlaying1D] = useState(false);
//   const [isPlaying2D, setIsPlaying2D] = useState(false);

//   // Auto-play logic for 1D Array
//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;
//     if (isPlaying1D && step1D < timeline1D.length - 1) {
//       interval = setInterval(() => setStep1D(s => s + 1), 1000);
//     } else if (step1D >= timeline1D.length - 1) {
//       setIsPlaying1D(false);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying1D, step1D]);

//   // Auto-play logic for 2D Array
//   useEffect(() => {
//     let interval: ReturnType<typeof setInterval>;
//     if (isPlaying2D && step2D < timeline2D.length - 1) {
//       interval = setInterval(() => setStep2D(s => s + 1), 1200); // Slightly slower for 2D visual parsing
//     } else if (step2D >= timeline2D.length - 1) {
//       setIsPlaying2D(false);
//     }
//     return () => clearInterval(interval);
//   }, [isPlaying2D, step2D]);

//   const frame1D = timeline1D[step1D];
//   const frame2D = timeline2D[step2D];

//   return (
//     <div className="min-h-screen bg-bg p-4 md:p-8 flex flex-col gap-8 font-display text-text">
      
//       {/* ─── 1D Array Section ─── */}
//       <section className="glass p-6 flex flex-col gap-4 border border-border rounded-xl shadow-md">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
//           <div>
//             <h2 className="text-xl font-bold text-accent mb-1">1D Array Engine Test</h2>
//             <p className="text-xs text-muted font-mono">Status: {frame1D.desc}</p>
//           </div>
          
//           {/* Timeline Controls */}
//           <div className="flex items-center gap-2 bg-surface p-1.5 rounded-md border border-border shadow-sm">
//             <button onClick={() => { setIsPlaying1D(false); setStep1D(s => Math.max(0, s - 1)); }} disabled={step1D === 0} className="px-3 py-1.5 text-xs bg-surface-2 hover:bg-border rounded disabled:opacity-50 transition-colors">Prev</button>
//             <button onClick={() => setIsPlaying1D(!isPlaying1D)} className={`px-4 py-1.5 text-xs font-bold text-white rounded transition-colors shadow-sm ${isPlaying1D ? 'bg-orange-500 hover:bg-orange-600' : 'bg-success hover:bg-emerald-500'}`}>
//               {isPlaying1D ? 'Pause' : 'Play'}
//             </button>
//             <button onClick={() => { setIsPlaying1D(false); setStep1D(s => Math.min(timeline1D.length - 1, s + 1)); }} disabled={step1D === timeline1D.length - 1} className="px-3 py-1.5 text-xs bg-surface-2 hover:bg-border rounded disabled:opacity-50 transition-colors">Next</button>
//             <div className="w-px h-6 bg-border mx-1" />
//             <span className="text-[10px] font-mono text-muted w-12 text-center">
//               {step1D + 1} / {timeline1D.length}
//             </span>
//           </div>
//         </div>

//         {/* Component Render */}
//         <div className="min-h-[140px] flex items-center justify-center bg-surface-2/50 rounded-lg border border-border-2 border-dashed p-4">
//           <D1Array 
//             value={frame1D.value}
//             pointers={frame1D.pointers}
//             compareIndices={frame1D.compareIndices}
//             swapIndices={frame1D.swapIndices}
//             readIndices={frame1D.readIndices}
//             writeIndices={frame1D.writeIndices}
//             deleteIndices={frame1D.deleteIndices}
//           />
//         </div>
//       </section>

//       {/* ─── 2D Array Section ─── */}
//       <section className="glass p-6 flex flex-col gap-4 border border-border rounded-xl shadow-md">
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
//           <div>
//             <h2 className="text-xl font-bold text-accent-2 mb-1">2D Matrix Engine Test</h2>
//             <p className="text-xs text-muted font-mono">Status: {frame2D.desc}</p>
//           </div>
          
//           {/* Timeline Controls */}
//           <div className="flex items-center gap-2 bg-surface p-1.5 rounded-md border border-border shadow-sm">
//             <button onClick={() => { setIsPlaying2D(false); setStep2D(s => Math.max(0, s - 1)); }} disabled={step2D === 0} className="px-3 py-1.5 text-xs bg-surface-2 hover:bg-border rounded disabled:opacity-50 transition-colors">Prev</button>
//             <button onClick={() => setIsPlaying2D(!isPlaying2D)} className={`px-4 py-1.5 text-xs font-bold text-white rounded transition-colors shadow-sm ${isPlaying2D ? 'bg-orange-500 hover:bg-orange-600' : 'bg-success hover:bg-emerald-500'}`}>
//               {isPlaying2D ? 'Pause' : 'Play'}
//             </button>
//             <button onClick={() => { setIsPlaying2D(false); setStep2D(s => Math.min(timeline2D.length - 1, s + 1)); }} disabled={step2D === timeline2D.length - 1} className="px-3 py-1.5 text-xs bg-surface-2 hover:bg-border rounded disabled:opacity-50 transition-colors">Next</button>
//             <div className="w-px h-6 bg-border mx-1" />
//             <span className="text-[10px] font-mono text-muted w-12 text-center">
//               {step2D + 1} / {timeline2D.length}
//             </span>
//           </div>
//         </div>

//         {/* Component Render */}
//         <div className="min-h-[260px] flex items-center justify-center bg-surface-2/50 rounded-lg border border-border-2 border-dashed p-4">
//           <D2Array 
//             value={frame2D.value}
//             pointers={frame2D.pointers}
//             compareIndices={frame2D.compareIndices}
//             swapIndices={frame2D.swapIndices}
//             readIndices={frame2D.readIndices}
//             writeIndices={frame2D.writeIndices}
//             deleteIndices={frame2D.deleteIndices}
//             highLightRange={frame2D.highLightRange}
//           />
//         </div>
//       </section>

//     </div>
//   );
// };

// export default DynamicTester;
import React, { useState, useEffect } from 'react';
import Graph, { type GraphNode, type GraphEdge } from '../codeVisualizer/dataStructures/Graph';

// ─── Base Topology ──────────────────────────────────────────────────────────
const baseNodes: GraphNode[] = [
  { id: 'A', label: 'A(0)', x: 10, y: 50 },
  { id: 'B', label: 'B(∞)', x: 35, y: 20 },
  { id: 'C', label: 'C(∞)', x: 30, y: 80 },
  { id: 'D', label: 'D(∞)', x: 65, y: 20 },
  { id: 'E', label: 'E(∞)', x: 65, y: 80 },
  { id: 'F', label: 'Target', x: 90, y: 50 },
  { id: 'G', label: 'G(∞)', x: 45, y: 50 }, // Central Hub
];

const baseEdges: GraphEdge[] = [
  { id: 'A-B', source: 'A', target: 'B', weight: 3, isDirected: true },
  { id: 'A-C', source: 'A', target: 'C', weight: 5, isDirected: true },
  { id: 'B-G', source: 'B', target: 'G', weight: 1, isDirected: true },
  { id: 'C-G', source: 'C', target: 'G', weight: 2, isDirected: true },
  { id: 'B-D', source: 'B', target: 'D', weight: 6, isDirected: true },
  { id: 'C-E', source: 'C', target: 'E', weight: 4, isDirected: true },
  { id: 'G-D', source: 'G', target: 'D', weight: 1, isDirected: true },
  { id: 'G-E', source: 'G', target: 'E', weight: 2, isDirected: true },
  { id: 'D-F', source: 'D', target: 'F', weight: 2, isDirected: true },
  { id: 'E-F', source: 'E', target: 'F', weight: 5, isDirected: true },
];

// Helper to clone and update node labels for the timeline
const updateLabels = (updates: Record<string, string>) => {
  return baseNodes.map(n => ({ ...n, label: updates[n.id] || n.label }));
};

// ─── Complex Simulation Frames (Dijkstra's Algorithm) ────────────────────────
const timelineGraph = [
  { desc: "Init: Start at A. Distances set to ∞", nodes: baseNodes, pointers: [{ name: 'curr', nodeId: 'A' }] },
  
  { desc: "Explore neighbors of A: B(3) and C(5)", nodes: baseNodes, pointers: [{ name: 'curr', nodeId: 'A' }], highLightEdges: ['A-B', 'A-C'] },
  { desc: "Relax B & C distances", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)' }), pointers: [{ name: 'curr', nodeId: 'A' }], writeNodes: ['B', 'C'] },
  
  { desc: "Extract Min: Move to B (dist: 3)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)' }), pointers: [{ name: 'curr', nodeId: 'B' }], readEdges: ['A-B'], highLightNodes: ['A'] },
  { desc: "Explore neighbors of B: G & D", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)' }), pointers: [{ name: 'curr', nodeId: 'B' }], highLightEdges: ['B-G', 'B-D'] },
  { desc: "Relax G(3+1=4) and D(3+6=9)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(9)' }), pointers: [{ name: 'curr', nodeId: 'B' }], writeNodes: ['G', 'D'] },

  { desc: "Extract Min: Move to G (dist: 4)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(9)' }), pointers: [{ name: 'curr', nodeId: 'G' }], readEdges: ['B-G'], highLightNodes: ['A', 'B'] },
  { desc: "Explore neighbors of G: D & E", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(9)' }), pointers: [{ name: 'curr', nodeId: 'G' }], highLightEdges: ['G-D', 'G-E'] },
  { desc: "Relax E(4+2=6). Crucial: D relaxed to 5 via G! (was 9)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)' }), pointers: [{ name: 'curr', nodeId: 'G' }], writeNodes: ['D', 'E'], compareNodes: ['D'] },

  { desc: "Extract Min: Move to C (dist: 5)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)' }), pointers: [{ name: 'curr', nodeId: 'C' }], readEdges: ['A-C'], highLightNodes: ['A', 'B', 'G'] },
  { desc: "Explore C. G is already visited. E is 5+4=9 (No update)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)' }), pointers: [{ name: 'curr', nodeId: 'C' }], highLightEdges: ['C-E'], deleteNodes: ['E'] },

  { desc: "Extract Min: Move to D (dist: 5)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)' }), pointers: [{ name: 'curr', nodeId: 'D' }], readEdges: ['G-D'], highLightNodes: ['A', 'B', 'G', 'C'] },
  { desc: "Explore neighbors of D: F", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)' }), pointers: [{ name: 'curr', nodeId: 'D' }], highLightEdges: ['D-F'] },
  { desc: "Relax Target F (5+2=7)", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)', 'F': 'Target(7)' }), pointers: [{ name: 'curr', nodeId: 'D' }], writeNodes: ['F'] },

  { desc: "Shortest Path Found: A -> B -> G -> D -> F", nodes: updateLabels({ 'B': 'B(3)', 'C': 'C(5)', 'G': 'G(4)', 'D': 'D(5)', 'E': 'E(6)', 'F': 'Target(7)' }), pointers: [{ name: 'target', nodeId: 'F' }], highLightNodes: ['A', 'B', 'G', 'D', 'F'], readEdges: ['A-B', 'B-G', 'G-D', 'D-F'] }
];

const GraphTester = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && step < timelineGraph.length - 1) {
      interval = setInterval(() => setStep(s => s + 1), 1600); // 1.6s gives enough time to read dynamic label updates
    } else if (step >= timelineGraph.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, step]);

  const frame = timelineGraph[step];

  return (
    <div className="min-h-screen bg-bg p-4 md:p-8 flex flex-col font-display text-text">
      <section className="glass p-6 flex flex-col gap-4 border border-border rounded-xl shadow-md w-full max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl font-bold text-accent-3 mb-1">Dijkstra Routing Simulation</h2>
            <p className="text-xs text-muted font-mono">Status: {frame.desc}</p>
          </div>
          
          <div className="flex items-center gap-2 bg-surface p-1.5 rounded-md border border-border shadow-sm">
            <button onClick={() => { setIsPlaying(false); setStep(s => Math.max(0, s - 1)); }} disabled={step === 0} className="px-3 py-1.5 text-xs bg-surface-2 hover:bg-border rounded disabled:opacity-50 transition-colors">Prev</button>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`px-4 py-1.5 text-xs font-bold text-white rounded transition-colors shadow-sm ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-success hover:bg-emerald-500'}`}>
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button onClick={() => { setIsPlaying(false); setStep(s => Math.min(timelineGraph.length - 1, s + 1)); }} disabled={step === timelineGraph.length - 1} className="px-3 py-1.5 text-xs bg-surface-2 hover:bg-border rounded disabled:opacity-50 transition-colors">Next</button>
            <div className="w-px h-6 bg-border mx-1" />
            <span className="text-[10px] font-mono text-muted w-14 text-center">
              {step + 1} / {timelineGraph.length}
            </span>
          </div>
        </div>

        <div className="bg-surface-2/30 rounded-lg border border-border-2 border-dashed relative overflow-hidden" style={{ height: '500px' }}>
          <Graph 
            nodes={frame.nodes}
            edges={baseEdges}
            pointers={frame.pointers}
            highLightNodes={frame.highLightNodes}
            compareNodes={frame.compareNodes}
            writeNodes={frame.writeNodes}
            deleteNodes={frame.deleteNodes}
            readEdges={frame.readEdges}
            highLightEdges={frame.highLightEdges}
          />
        </div>
      </section>
    </div>
  );
};

export default GraphTester;