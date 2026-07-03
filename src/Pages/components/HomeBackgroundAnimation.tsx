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

import { useEffect, useRef } from "react";

type Road = {
  x1: number; y1: number;
  x2: number; y2: number;
  cpx: number; cpy: number;
  tier: number;
  lit: number; litT: number;
  id: number;
};

type Pulse = {
  road: Road;
  color: string;
  t: number;
  born: number;
  speed: number;
};

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = () => window.devicePixelRatio || 1;
    const resize = () => {
      const d = dpr();
      canvas.width  = canvas.offsetWidth  * d;
      canvas.height = canvas.offsetHeight * d;
    };
    resize();
    const ro = new ResizeObserver(() => { resize(); init(); });
    ro.observe(canvas);

    // Seeded PRNG for reproducible layout
    let seed = 42;
    const sr = () => { seed = (seed * 16807 + 0) % 2147483647; return (seed - 1) / 2147483646; };

    const W = () => canvas.width;
    const H = () => canvas.height;

    const TIER_COLOR      = ['#818CF8', '#9ca3f0', '#6b7bdc', '#4a5580'];
    const TIER_COLOR_PATH = ['#F472B6', '#e879a8', '#d46898', '#c05888'];
    const TIER_W_BASE     = [2.8, 1.6, 0.9, 0.55];
    const TIER_GLOW       = [8, 5, 3, 1.5];
    const DIM_COLOR       = ['#4a4870', '#35335a', '#252345', '#1a1935'];
    const DIM_W           = [1.4, 0.9, 0.55, 0.3];
    const DIM_A           = [0.42, 0.32, 0.22, 0.14];

    let roads: Road[]   = [];
    let pulses: Pulse[] = [];
    let adj: number[][] = [];

    // ── Generate the city road network ──
    function init() {
      seed = 42;
      roads = []; pulses = [];
      const w = W(), h = H();
      const cx = w * 0.5, cy = h * 0.52;

      // 1. Arterial roads — thick radiating highways with jogs
      const artCount = 14;
      for (let i = 0; i < artCount; i++) {
        const angle = (i / artCount) * Math.PI * 2 + sr() * 0.3;
        const len   = (0.32 + sr() * 0.22) * Math.min(w, h);
        const pts: [number, number][] = [[cx, cy]];
        let x = cx, y = cy;
        const segs = 4 + Math.floor(sr() * 4);
        for (let s = 0; s < segs; s++) {
          const t = (s + 1) / segs;
          const jog  = (sr() - 0.5) * 0.12 * len;
          const perp = angle + Math.PI / 2;
          x = cx + Math.cos(angle) * len * t + Math.cos(perp) * jog;
          y = cy + Math.sin(angle) * len * t + Math.sin(perp) * jog;
          pts.push([x, y]);
        }
        for (let s = 0; s < pts.length - 1; s++) {
          roads.push({
            x1: pts[s][0], y1: pts[s][1],
            x2: pts[s+1][0], y2: pts[s+1][1],
            cpx: (pts[s][0] + pts[s+1][0]) / 2 + (sr() - 0.5) * 40,
            cpy: (pts[s][1] + pts[s+1][1]) / 2 + (sr() - 0.5) * 40,
            tier: 0, lit: 0, litT: 0, id: roads.length,
          });
        }
      }

      // 2. Ring roads — irregular concentric partial rings
      [0.18, 0.32, 0.48].forEach((rf, ri) => {
        const r    = rf * Math.min(w, h);
        const segs = 18 + ri * 8;
        const startAng = sr() * Math.PI * 2;
        const arcFrac  = 0.55 + sr() * 0.35;
        for (let s = 0; s < Math.floor(segs * arcFrac); s++) {
          const a1 = startAng + (s / segs) * Math.PI * 2;
          const a2 = startAng + ((s + 1) / segs) * Math.PI * 2;
          const r1 = r * (0.85 + sr() * 0.3);
          const r2 = r * (0.85 + sr() * 0.3);
          roads.push({
            x1: cx + Math.cos(a1) * r1, y1: cy + Math.sin(a1) * r1,
            x2: cx + Math.cos(a2) * r2, y2: cy + Math.sin(a2) * r2,
            cpx: cx + Math.cos((a1 + a2) / 2) * r1 * 1.05,
            cpy: cy + Math.sin((a1 + a2) / 2) * r1 * 1.05,
            tier: 1, lit: 0, litT: 0, id: roads.length,
          });
        }
      });

      // 3. Street grids — dense irregular grids at various zones
      const gridZones = [
        { cx: cx,          cy: cy,          gw: w*0.28, gh: h*0.28, sx: w*0.035, sy: h*0.035, jitter: 6,  tier: 2 },
        { cx: cx+w*0.18,   cy: cy+h*0.12,   gw: w*0.18, gh: h*0.16, sx: w*0.028, sy: h*0.028, jitter: 8,  tier: 2 },
        { cx: cx-w*0.15,   cy: cy+h*0.15,   gw: w*0.15, gh: h*0.14, sx: w*0.03,  sy: h*0.03,  jitter: 10, tier: 2 },
        { cx: cx+w*0.05,   cy: cy-h*0.18,   gw: w*0.12, gh: h*0.12, sx: w*0.025, sy: h*0.025, jitter: 5,  tier: 2 },
        { cx: cx-w*0.20,   cy: cy-h*0.10,   gw: w*0.13, gh: h*0.10, sx: w*0.03,  sy: h*0.03,  jitter: 12, tier: 3 },
      ];
      gridZones.forEach(z => {
        const cols = Math.floor(z.gw / z.sx);
        const rows = Math.floor(z.gh / z.sy);
        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c < cols; c++) {
            const y1 = z.cy - z.gh/2 + r*z.sy + (sr()-0.5)*z.jitter;
            const x1 = z.cx - z.gw/2 + c*z.sx + (sr()-0.5)*z.jitter;
            const x2 = z.cx - z.gw/2 + (c+1)*z.sx + (sr()-0.5)*z.jitter;
            const y2 = y1 + (sr()-0.5)*z.jitter*0.5;
            if (sr() < 0.88) roads.push({ x1, y1, x2, y2, cpx:(x1+x2)/2, cpy:(y1+y2)/2, tier:z.tier, lit:0, litT:0, id:roads.length });
          }
        }
        for (let c = 0; c <= cols; c++) {
          for (let r = 0; r < rows; r++) {
            const x1 = z.cx - z.gw/2 + c*z.sx + (sr()-0.5)*z.jitter;
            const y1 = z.cy - z.gh/2 + r*z.sy + (sr()-0.5)*z.jitter;
            const y2 = z.cy - z.gh/2 + (r+1)*z.sy + (sr()-0.5)*z.jitter;
            const x2 = x1 + (sr()-0.5)*z.jitter*0.5;
            if (sr() < 0.88) roads.push({ x1, y1, x2, y2, cpx:(x1+x2)/2, cpy:(y1+y2)/2, tier:z.tier, lit:0, litT:0, id:roads.length });
          }
        }
      });

      // 4. Suburb tendrils — organic branching roads
      for (let i = 0; i < 20; i++) {
        const startAng = sr() * Math.PI * 2;
        const startR   = (0.15 + sr() * 0.1) * Math.min(w, h);
        let x = cx + Math.cos(startAng) * startR;
        let y = cy + Math.sin(startAng) * startR;
        let ang = startAng + (sr() - 0.5) * 1.2;
        const steps = 6 + Math.floor(sr() * 12);
        for (let s = 0; s < steps; s++) {
          ang += (sr() - 0.5) * 0.5;
          const len = (0.03 + sr() * 0.05) * Math.min(w, h);
          const nx = x + Math.cos(ang) * len;
          const ny = y + Math.sin(ang) * len;
          roads.push({ x1:x, y1:y, x2:nx, y2:ny, cpx:(x+nx)/2+(sr()-0.5)*20, cpy:(y+ny)/2+(sr()-0.5)*20, tier:2, lit:0, litT:0, id:roads.length });
          if (sr() < 0.3) {
            const bang = ang + (sr() < 0.5 ? 1 : -1) * (0.4 + sr() * 0.6);
            const blen = (0.02 + sr() * 0.03) * Math.min(w, h);
            roads.push({ x1:nx, y1:ny, x2:nx+Math.cos(bang)*blen, y2:ny+Math.sin(bang)*blen, cpx:nx+Math.cos(bang)*blen*0.5+(sr()-0.5)*12, cpy:ny+Math.sin(bang)*blen*0.5+(sr()-0.5)*12, tier:3, lit:0, litT:0, id:roads.length });
          }
          x = nx; y = ny;
        }
      }

      buildAdj();
      startWave();
    }

    // ── Adjacency (roads sharing endpoints) ──
    function buildAdj() {
      const EPS = 30;
      adj = roads.map(() => []);
      for (let i = 0; i < roads.length; i++) {
        for (let j = i + 1; j < roads.length; j++) {
          const a = roads[i], b = roads[j];
          if (
            Math.hypot(a.x2-b.x1, a.y2-b.y1) < EPS ||
            Math.hypot(a.x2-b.x2, a.y2-b.y2) < EPS ||
            Math.hypot(a.x1-b.x1, a.y1-b.y1) < EPS ||
            Math.hypot(a.x1-b.x2, a.y1-b.y2) < EPS
          ) { adj[i].push(j); adj[j].push(i); }
        }
      }
    }

    // ── Wave expansion from center ──
    let waveQueue: number[] = [];
    let waveSeen  = new Set<number>();
    let wavePhase = 'spreading';
    let waveStart = 0;
    let lastWave  = 0;
    let lastPulse = 0;
    const WAVE_INTERVAL = 18;

    function startWave() {
      roads.forEach(r => { r.litT = 0; r.lit = 0; });
      pulses.length = 0;
      waveSeen  = new Set();
      waveQueue = roads.filter(r => r.tier === 0).slice(0, 8).map(r => r.id);
      waveQueue.forEach(id => waveSeen.add(id));
      wavePhase = 'spreading';
      waveStart = performance.now();
    }

    function spawnPulse(road: Road, color: string) {
      pulses.push({ road, color, t: 0, born: animT, speed: 600 + sr() * 400 });
    }

    let animT = 0;
    let initialized = false;
    let raf: number | null = null;

    const loop = (t: number) => {
      animT = t;
      const ctx = canvas.getContext('2d');
      if (!ctx) { raf = requestAnimationFrame(loop); return; }
      const w = W(), h = H(), dp = dpr();

      if (!initialized) { init(); initialized = true; }

      // Wave expansion
      if (wavePhase === 'spreading' && t - lastWave > WAVE_INTERVAL && waveQueue.length > 0) {
        lastWave = t;
        const batch = Math.min(3, waveQueue.length);
        for (let b = 0; b < batch; b++) {
          const id = waveQueue.shift();
          if (id === undefined) break;
          roads[id].litT = 1;
          if (roads[id].tier <= 1) spawnPulse(roads[id], TIER_COLOR[roads[id].tier]);
          adj[id]?.forEach(nid => { if (!waveSeen.has(nid)) { waveSeen.add(nid); waveQueue.push(nid); } });
        }
        if (waveQueue.length === 0) { wavePhase = 'hold'; waveStart = t; }
      }

      if (wavePhase === 'hold'  && t - waveStart > 3500) { wavePhase = 'fade'; waveStart = t; }
      if (wavePhase === 'fade') {
        const p = Math.max(0, 1 - (t - waveStart) / 1200);
        if (p <= 0) { roads.forEach(r => { r.lit = 0; r.litT = 0; }); pulses.length = 0; startWave(); wavePhase = 'spreading'; lastWave = t; }
        else { roads.forEach(r => { r.litT *= 0.998; }); }
      }

      // Lerp
      roads.forEach(r => { r.lit += (r.litT - r.lit) * 0.04; });

      // Pulse progress
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].t = Math.min(1, (t - pulses[i].born) / pulses[i].speed);
        if (pulses[i].t >= 1) pulses.splice(i, 1);
      }

      // Spawn ambient pulses on lit arterials
      if (t - lastPulse > 320) {
        lastPulse = t;
        const litArt = roads.filter(r => r.tier <= 1 && r.lit > 0.5);
        if (litArt.length > 0) {
          const r = litArt[Math.floor(sr() * litArt.length)];
          spawnPulse(r, Math.random() < 0.3 ? TIER_COLOR_PATH[0] : TIER_COLOR[0]);
        }
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h);

      // Draw roads back-to-front by tier
      ([3, 2, 1, 0] as const).forEach(tier => {
        roads.filter(r => r.tier === tier).forEach(road => {
          const lv = road.lit;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';

          if (lv > 0.01) {
            const col = TIER_COLOR[tier];
            // Glow
            ctx.beginPath(); ctx.moveTo(road.x1, road.y1);
            ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
            ctx.strokeStyle = col; ctx.lineWidth = TIER_GLOW[tier] * dp; ctx.globalAlpha = lv * 0.08; ctx.stroke();
            // Body
            ctx.beginPath(); ctx.moveTo(road.x1, road.y1);
            ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
            ctx.lineWidth = TIER_W_BASE[tier] * dp * 1.8; ctx.globalAlpha = lv * 0.35; ctx.stroke();
            // Bright core
            ctx.beginPath(); ctx.moveTo(road.x1, road.y1);
            ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
            ctx.strokeStyle = '#d0ceff'; ctx.lineWidth = TIER_W_BASE[tier] * dp * 0.5; ctx.globalAlpha = lv * 0.85; ctx.stroke();
          } else {
            // Dim base — always visible like a dark map
            ctx.beginPath(); ctx.moveTo(road.x1, road.y1);
            ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
            ctx.strokeStyle = DIM_COLOR[tier]; ctx.lineWidth = DIM_W[tier] * dp; ctx.globalAlpha = DIM_A[tier]; ctx.stroke();
          }
        });
      });
      ctx.globalAlpha = 1;

      // Draw pulses — comet traveling along quadratic bezier
      pulses.forEach(p => {
        const r = p.road;
        const ease = p.t < 0.5 ? 2*p.t*p.t : 1 - Math.pow(-2*p.t+2, 2)/2;
        for (let tr = 0; tr < 5; tr++) {
          const tp = Math.max(0, ease - tr * 0.07);
          const mt = 1 - tp;
          const tx = mt*mt*r.x1 + 2*mt*tp*r.cpx + tp*tp*r.x2;
          const ty = mt*mt*r.y1 + 2*mt*tp*r.cpy + tp*tp*r.y2;
          const rad = dp * (3.5 - tr * 0.55);
          const alpha = (1 - p.t) * (1 - tr * 0.18) * 0.95;
          if (alpha <= 0 || rad <= 0) continue;
          if (tr === 0) {
            ctx.beginPath(); ctx.arc(tx, ty, rad*3.5, 0, Math.PI*2);
            ctx.fillStyle = p.color; ctx.globalAlpha = alpha*0.15; ctx.fill();
          }
          ctx.beginPath(); ctx.arc(tx, ty, rad, 0, Math.PI*2);
          ctx.fillStyle = p.color; ctx.globalAlpha = alpha; ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf!); ro.disconnect(); };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.28] sm:opacity-[0.45]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Vignette — dark edges like a city map receding into darkness */}
      <div
        className="absolute inset-0"
        // style={{ background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 35%, rgba(13,11,20,0.7) 75%, var(--bg) 100%)' }}
      />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--bg)] to-transparent" />
    </div>
  );
}