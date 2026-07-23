// import { useEffect, useRef } from "react";

// type Pulse = [number, number, number, number, number, number, number];

// export default function NetworkBackground() {
//   const canvasRef = useRef<HTMLCanvasElement | null>(null);

//   useEffect(() => {
//     const canvas = canvasRef.current;
//     if (!canvas) return;

//     const resize = () => {
//       const d = window.devicePixelRatio || 1;
//       canvas.width  = canvas.offsetWidth  * d;
//       canvas.height = canvas.offsetHeight * d;
//     };
//     resize();
//     const ro = new ResizeObserver(resize);
//     ro.observe(canvas);

//     // ── Color palette (matches your design tokens) ──
//     const C = {
//       accent:  '#818CF8',  // --accent dark mode indigo
//       accent3: '#F472B6',  // --accent-3 dark mode pink
//       dim:     '#2A2445',  // --border dark mode
//       dimMid:  '#352B5A',  // --border-2 dark mode
//     };

//     // ── Poisson-ish node scatter ──
//     const R: [number, number][] = [];
//     const TARGET = 72, MIND = 9;
//     for (let a = 0; a < 3000 && R.length < TARGET; a++) {
//       const x = 3 + Math.random() * 94;
//       const y = 3 + Math.random() * 94;
//       let ok = true;
//       for (const [rx, ry] of R) {
//         if ((x - rx) ** 2 + (y - ry) ** 2 < MIND * MIND) { ok = false; break; }
//       }
//       if (ok) R.push([x, y]);
//     }
//     const N = R.length;

//     // ── Build graph edges ──
//     const CONN = 20;
//     const edges: number[][] = [];
//     for (let i = 0; i < N; i++)
//       for (let j = i + 1; j < N; j++) {
//         const dx = R[i][0] - R[j][0], dy = R[i][1] - R[j][1];
//         if (dx * dx + dy * dy < CONN * CONN) edges.push([i, j]);
//       }

//     const adj: number[][] = Array.from({ length: N }, () => []);
//     edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });

//     const eIdx: Record<string, number> = {};
//     edges.forEach(([a, b], i) => { eIdx[`${Math.min(a, b)}-${Math.max(a, b)}`] = i; });
//     const ek = (a: number, b: number) => `${Math.min(a, b)}-${Math.max(a, b)}`;

//     // ── Nearest node helper ──
//     const nearest = (cx: number, cy: number): number => {
//       let best = 0, bd = Infinity;
//       R.forEach(([x, y], i) => {
//         const d = (x - cx) ** 2 + (y - cy) ** 2;
//         if (d < bd) { bd = d; best = i; }
//       });
//       return best;
//     };

//     const center  = nearest(50, 50);
//     const corners = [nearest(2, 2), nearest(98, 2), nearest(2, 98), nearest(98, 98)];

//     // ── A* pathfinding ──
//     const astar = (src: number, dst: number): number[] => {
//       const h  = (i: number) => Math.hypot(R[i][0] - R[dst][0], R[i][1] - R[dst][1]);
//       const g  = Array(N).fill(Infinity);
//       const pv = Array(N).fill(-1);
//       const open = new Set([src]);
//       g[src] = 0;
//       let safe = 0;
//       while (open.size && safe++ < N * 20) {
//         let curr = -1, bF = Infinity;
//         open.forEach(i => { const f = g[i] + h(i); if (f < bF) { bF = f; curr = i; } });
//         if (curr === dst) break;
//         open.delete(curr);
//         adj[curr].forEach(nb => {
//           const ng = g[curr] + 1;
//           if (ng < g[nb]) { g[nb] = ng; pv[nb] = curr; open.add(nb); }
//         });
//       }
//       const path: number[] = [];
//       for (let c = dst; c !== -1; c = pv[c]) path.unshift(c);
//       return path[0] === src ? path : [];
//     };

//     // ── Visual state arrays ──
//     const nGlowT = new Float32Array(N);
//     const nGlowA = new Float32Array(N);
//     const eBfsT  = new Float32Array(edges.length);
//     const eBfsA  = new Float32Array(edges.length);
//     const ePathT = new Float32Array(edges.length);
//     const ePathA = new Float32Array(edges.length);

//     nGlowT[center] = 1;
//     nGlowA[center] = 1;

//     // ── Pulse pool ──
//     const pulses: Pulse[] = [];

//     // ── Phase machine ──
//     let phase: 'bfs' | 'path-anim' | 'hold' | 'fade' = 'bfs';
//     let activeNode = center;
//     let bfsQ = [center], bfsSeen = new Set([center]), lastBfsT = 0;
//     const BFS_MS = 180;

//     let pathNodes: number[] = [], pathEIs: number[] = [], pathStep = 0, lastPathT = 0;
//     const PATH_MS = 230;

//     let holdStart = 0;
//     const HOLD_MS = 3000;
//     let fadeStart = 0;
//     const FADE_MS = 1200;

//     let raf: number | null = null;

//     const loop = (t: number) => {
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;
//       const W = canvas.width, H = canvas.height;
//       const d = window.devicePixelRatio || 1;
//       const sx = (x: number) => (x / 100) * W;
//       const sy = (y: number) => (y / 100) * H;

//       // ── Read CSS vars for light/dark mode support ──
//       const cs     = getComputedStyle(document.documentElement);
//       const cBfs   = cs.getPropertyValue('--accent').trim()   || C.accent;
//       const cPath  = cs.getPropertyValue('--accent-3').trim() || C.accent3;
//       const cBorder2 = cs.getPropertyValue('--border-2').trim() || C.dimMid;

//       // ── Phase transitions ──
//       if (phase === 'bfs' && t - lastBfsT > BFS_MS) {
//         lastBfsT = t;
//         if (bfsQ.length > 0) {
//           const curr = bfsQ.shift()!;
//           activeNode = curr;
//           adj[curr].forEach((nb, idx) => {
//             if (!bfsSeen.has(nb)) {
//               bfsSeen.add(nb);
//               bfsQ.push(nb);
//               nGlowT[nb] = 1;
//               const ei = eIdx[ek(curr, nb)];
//               if (ei !== undefined) eBfsT[ei] = 1;
//               pulses.push([R[curr][0], R[curr][1], R[nb][0], R[nb][1], t + idx * 25, 420, 0]);
//             }
//           });
//         } else {
//           phase = 'path-anim';
//           const pair = Math.random() < 0.5 ? [0, 3] : [1, 2];
//           pathNodes = astar(corners[pair[0]], corners[pair[1]]);
//           pathEIs   = [];
//           for (let i = 0; i < pathNodes.length - 1; i++) {
//             const ei = eIdx[ek(pathNodes[i], pathNodes[i + 1])];
//             if (ei !== undefined) pathEIs.push(ei);
//           }
//           pathStep = 0; lastPathT = t;
//           activeNode = pathNodes[0] ?? center;
//         }
//       }

//       if (phase === 'path-anim' && t - lastPathT > PATH_MS) {
//         lastPathT = t;
//         if (pathStep < pathEIs.length) {
//           ePathT[pathEIs[pathStep]] = 1;
//           const a = pathNodes[pathStep], b = pathNodes[pathStep + 1];
//           pulses.push([R[a][0], R[a][1], R[b][0], R[b][1], t, 480, 1]);
//           activeNode = b;
//           pathStep++;
//         } else {
//           phase = 'hold'; holdStart = t; activeNode = -1;
//         }
//       }

//       if (phase === 'hold' && t - holdStart > HOLD_MS) { phase = 'fade'; fadeStart = t; }

//       let gf = 1;
//       if (phase === 'fade') {
//         gf = Math.max(0, 1 - (t - fadeStart) / FADE_MS);
//         if (gf <= 0) {
//           phase = 'bfs';
//           bfsQ = [center]; bfsSeen = new Set([center]);
//           activeNode = center; lastBfsT = t;
//           pathNodes = []; pathEIs = [];
//           nGlowT.fill(0); nGlowA.fill(0);
//           nGlowT[center] = 1; nGlowA[center] = 1;
//           eBfsT.fill(0); eBfsA.fill(0);
//           ePathT.fill(0); ePathA.fill(0);
//           pulses.length = 0; gf = 1;
//         }
//       }

//       // ── Lerp visual state ──
//       const lN = 0.07, lE = 0.055;
//       for (let i = 0; i < N; i++)
//         nGlowA[i] += (nGlowT[i] - nGlowA[i]) * lN;
//       for (let i = 0; i < edges.length; i++) {
//         eBfsA[i]  += (eBfsT[i]  - eBfsA[i])  * lE;
//         ePathA[i] += (ePathT[i] - ePathA[i]) * lE;
//       }

//       // ── Clear ──
//       ctx.clearRect(0, 0, W, H);

//       // ── Draw edges ──
//       edges.forEach(([a, b], i) => {
//         const pv = ePathA[i] * gf;
//         const bv = eBfsA[i]  * gf;
//         const ax = sx(R[a][0]), ay = sy(R[a][1]);
//         const bx = sx(R[b][0]), by = sy(R[b][1]);
//         ctx.lineCap = 'round';

//         if (pv > 0.01) {
//           // Path edge — 3-layer: wide glow + mid + crisp core
//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.strokeStyle = cPath;
//           ctx.lineWidth   = d * 8;
//           ctx.globalAlpha = pv * 0.12;
//           ctx.stroke();

//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.lineWidth   = d * 2.5;
//           ctx.globalAlpha = pv * 0.55;
//           ctx.stroke();

//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.lineWidth   = d * 1.0;
//           ctx.globalAlpha = pv * 0.95;
//           ctx.stroke();

//         } else if (bv > 0.01) {
//           // BFS edge — 3-layer: wide glow + mid + crisp core
//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.strokeStyle = cBfs;
//           ctx.lineWidth   = d * 6;
//           ctx.globalAlpha = bv * 0.10;
//           ctx.stroke();

//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.lineWidth   = d * 2.0;
//           ctx.globalAlpha = bv * 0.45;
//           ctx.stroke();

//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.lineWidth   = d * 0.8;
//           ctx.globalAlpha = bv * 0.88;
//           ctx.stroke();

//         } else {
//           // Rest edge — clearly visible dim state
//           ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
//           ctx.strokeStyle = cBorder2;
//           ctx.lineWidth   = d * 0.9;
//           ctx.globalAlpha = 0.55;
//           ctx.stroke();
//         }
//       });
//       ctx.globalAlpha = 1;

//       // ── Draw pulses ──
//       for (let i = pulses.length - 1; i >= 0; i--) {
//         const [px, py, tx, ty, born, dur, ip] = pulses[i];
//         const elapsed = t - born;
//         if (elapsed < 0) continue;
//         const prog = elapsed / dur;
//         if (prog >= 1) { pulses.splice(i, 1); continue; }

//         const color = ip ? cPath : cBfs;
//         const ease  = 1 - (1 - prog) * (1 - prog);

//         for (let tr = 0; tr < 5; tr++) {
//           const tp  = Math.max(0, ease - tr * 0.065);
//           const ix  = sx(px + (tx - px) * tp);
//           const iy  = sy(py + (ty - py) * tp);
//           const r   = d * (3.2 - tr * 0.5);
//           const ta  = ((1 - prog) * (1 - tr * 0.18)) * 0.9 * gf;
//           if (ta <= 0 || r <= 0) continue;

//           // Outer glow on lead dot
//           if (tr === 0) {
//             ctx.beginPath(); ctx.arc(ix, iy, r * 3.5, 0, Math.PI * 2);
//             ctx.fillStyle = color; ctx.globalAlpha = ta * 0.15; ctx.fill();
//           }

//           ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI * 2);
//           ctx.fillStyle   = color;
//           ctx.globalAlpha = ta;
//           ctx.fill();
//         }
//       }
//       ctx.globalAlpha = 1;

//       // ── Draw nodes ──
//       const pathSet = new Set(pathNodes);
//       R.forEach(([nx, ny], i) => {
//         const isActive = i === activeNode;
//         const gv       = nGlowA[i] * gf;
//         const onPath   = pathSet.has(i) && phase !== 'bfs';
//         const color    = onPath ? cPath : (gv > 0.05 ? cBfs : cBorder2);
//         const bright   = onPath ? cPath : cBfs;
//         const cx = sx(nx), cy = sy(ny);

//         if (isActive) {
//           const breathe = 0.80 + 0.20 * Math.sin(t / 550);

//           // Large ambient halo
//           const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, d * 28 * breathe);
//           g1.addColorStop(0, bright + '50');
//           g1.addColorStop(0.45, bright + '20');
//           g1.addColorStop(1, 'transparent');
//           ctx.globalAlpha = gf * breathe;
//           ctx.beginPath(); ctx.arc(cx, cy, d * 28 * breathe, 0, Math.PI * 2);
//           ctx.fillStyle = g1; ctx.fill();

//           // Ripple 1
//           const rp1 = (t % 1200) / 1200;
//           ctx.beginPath(); ctx.arc(cx, cy, d * 4 + rp1 * d * 22, 0, Math.PI * 2);
//           ctx.strokeStyle = bright; ctx.lineWidth = d * 1.2;
//           ctx.globalAlpha = (1 - rp1) * 0.65 * gf; ctx.stroke();

//           // Ripple 2 (offset phase)
//           const rp2 = ((t + 600) % 1200) / 1200;
//           ctx.beginPath(); ctx.arc(cx, cy, d * 4 + rp2 * d * 14, 0, Math.PI * 2);
//           ctx.lineWidth = d * 0.7;
//           ctx.globalAlpha = (1 - rp2) * 0.40 * gf; ctx.stroke();

//           ctx.globalAlpha = 1;
//         }

//         // Glow halo on lit nodes
//         if (gv > 0.05 || onPath) {
//           const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, d * 7);
//           gr.addColorStop(0, bright + '55');
//           gr.addColorStop(1, 'transparent');
//           ctx.globalAlpha = gv * gf * 0.7;
//           ctx.beginPath(); ctx.arc(cx, cy, d * 7, 0, Math.PI * 2);
//           ctx.fillStyle = gr; ctx.fill();
//           ctx.globalAlpha = 1;
//         }

//         // Core dot
//         const r     = isActive ? d * 4.0 : (gv > 0.05 ? d * 2.8 : d * 1.5);
//         const alpha = isActive ? gf : (gv > 0.05 ? 0.95 * gv * gf : 0.45 * gf);
//         ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
//         ctx.fillStyle   = color;
//         ctx.globalAlpha = alpha;
//         ctx.fill();

//         // Specular highlight on lit/active nodes
//         if (gv > 0.3 || isActive) {
//           ctx.beginPath(); ctx.arc(cx - r * 0.25, cy - r * 0.25, r * 0.45, 0, Math.PI * 2);
//           ctx.fillStyle   = '#ffffff';
//           ctx.globalAlpha = (isActive ? 0.7 : 0.35 * gv) * gf;
//           ctx.fill();
//         }

//         ctx.globalAlpha = 1;
//       });

//       raf = requestAnimationFrame(loop);
//     };

//     raf = requestAnimationFrame(loop);
//     return () => { cancelAnimationFrame(raf!); ro.disconnect(); };
//   }, []);

//   return (
//     <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.22] sm:opacity-[0.38]">
//       <canvas ref={canvasRef} className="w-full h-full block" />
//       <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--bg)] to-transparent" />
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_18%,color-mix(in_srgb,var(--accent)_6%,transparent),transparent)]" />
//     </div>
//   );
// }

import { useRef } from "react";
import { useHighwayAnimation } from "../hooks/useHighwayAnimation";

export default function HomeBackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useHighwayAnimation(canvasRef);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.28] sm:opacity-[0.45]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Vignette — dark edges like a city map receding into darkness */}
      <div className="absolute inset-0" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </div>
  );
}
