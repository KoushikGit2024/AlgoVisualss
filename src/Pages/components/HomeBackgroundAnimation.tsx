import { useEffect, useRef } from "react";

export default function NetworkBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Crisp canvas sizing ──
    const resize = () => {
      const d = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * d;
      canvas.height = canvas.offsetHeight * d;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── Organic Node Generation (Poisson-like scatter) ──
    const R = [];
    const TARGET_NODES = 85; 
    const MIN_DIST = 8; // Prevents nodes from clumping too closely

    // Throw "darts" at the canvas and keep them if they are far enough apart
    for (let attempts = 0; attempts < 2000; attempts++) {
      // Bias slightly away from the absolute edges for a softer framing
      const x = 2 + Math.random() * 96;
      const y = 2 + Math.random() * 96;

      let isTooClose = false;
      for (let i = 0; i < R.length; i++) {
        const dx = x - R[i][0];
        const dy = y - R[i][1];
        if (Math.sqrt(dx * dx + dy * dy) < MIN_DIST) {
          isTooClose = true;
          break;
        }
      }

      if (!isTooClose) {
        R.push([x, y]);
        if (R.length >= TARGET_NODES) break;
      }
    }
    const N = R.length;

    // ── Build graph edges ──
    const CONN = 18.5; // Slightly larger radius to ensure the random scatter connects
    const edges = [];
    for (let i = 0; i < N; i++) {
      for (let j = i + 1; j < N; j++) {
        const dx = R[i][0] - R[j][0];
        const dy = R[i][1] - R[j][1];
        if (dx * dx + dy * dy < CONN * CONN) {
          edges.push([i, j]);
        }
      }
    }

    const adj = Array.from({ length: N }, () => []);
    edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });

    const eIdx = {};
    edges.forEach(([a, b], i) => {
      eIdx[`${Math.min(a, b)}-${Math.max(a, b)}`] = i;
    });
    const ek = (a, b) => `${Math.min(a, b)}-${Math.max(a, b)}`;

    // ── Nearest node ──
    const nearest = (cx, cy) => {
      let best = 0, bd = Infinity;
      R.forEach(([x, y], i) => {
        const d = (x - cx) ** 2 + (y - cy) ** 2;
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    };

    const centerNode = nearest(50, 50);
    const corners = [
      nearest(0, 0), nearest(100, 0), nearest(0, 100), nearest(100, 100),
    ];

    // ── A* pathfinding ──
    const astar = (src, dst) => {
      const h  = i => Math.hypot(R[i][0] - R[dst][0], R[i][1] - R[dst][1]);
      const g  = Array(N).fill(Infinity);
      const pv = Array(N).fill(-1);
      const open = new Set([src]);
      g[src] = 0;
      let safe = 0;
      while (open.size > 0 && safe++ < N * 15) {
        let curr = -1, bF = Infinity;
        open.forEach(i => { const f = g[i] + h(i); if (f < bF) { bF = f; curr = i; } });
        if (curr === dst) break;
        open.delete(curr);
        adj[curr].forEach(nb => {
          const ng = g[curr] + 1;
          if (ng < g[nb]) { g[nb] = ng; pv[nb] = curr; open.add(nb); }
        });
      }
      const path = [];
      for (let c = dst; c !== -1; c = pv[c]) path.unshift(c);
      return path[0] === src ? path : [];
    };

    // ── Visual state ──
    const nodeGlowTarget = new Float32Array(N);
    const nodeGlowActual = new Float32Array(N);
    const edgeBfs        = new Float32Array(edges.length); 
    const edgeBfsAlive   = new Float32Array(edges.length); 
    const edgePath       = new Float32Array(edges.length);
    const edgePathAlive  = new Float32Array(edges.length);

    nodeGlowTarget[centerNode] = 1;
    nodeGlowActual[centerNode] = 1;

    // ── Pulse pool ──
    const pulses = [];

    // ── Phase machine ──
    let phase      = 'bfs';
    let activeNode = centerNode;

    let bfsQ     = [centerNode];
    let bfsSeen  = new Set([centerNode]);
    let lastBfsT = 0;
    const BFS_MS = 200;

    let pathNodes = [], pathEIs = [], pathStep = 0, lastPathT = 0;
    const PATH_MS = 240;

    let holdStart = 0;
    const HOLD_MS = 3200;
    let fadeStart = 0;
    const FADE_MS = 1400;

    let raf = null;

    const loop = t => {
      const ctx = canvas.getContext('2d');
      const W = canvas.width, H = canvas.height;
      const d = window.devicePixelRatio || 1;
      const sx = x => (x / 100) * W;
      const sy = y => (y / 100) * H;

      const cs    = getComputedStyle(document.documentElement);
      const cBfs  = cs.getPropertyValue('--accent').trim()   || '#6366F1';
      const cPath = cs.getPropertyValue('--accent-3').trim() || '#EC4899';
      const cDim  = cs.getPropertyValue('--border').trim()   || '#E2DEFF';

      // ── Phase transitions ──
      if (phase === 'bfs' && t - lastBfsT > BFS_MS) {
        lastBfsT = t;
        if (bfsQ.length > 0) {
          const curr = bfsQ.shift();
          activeNode = curr;
          adj[curr].forEach((nb, idx) => {
            if (!bfsSeen.has(nb)) {
              bfsSeen.add(nb);
              bfsQ.push(nb);
              nodeGlowTarget[nb] = 1;
              const ei = eIdx[ek(curr, nb)];
              if (ei !== undefined) edgeBfs[ei] = 1;
              pulses.push([
                R[curr][0], R[curr][1],
                R[nb][0],   R[nb][1],
                t + idx * 30, 480, 0,
              ]);
            }
          });
        } else {
          phase = 'path-anim';
          const pair = Math.random() < 0.5 ? [0, 3] : [1, 2];
          pathNodes = astar(corners[pair[0]], corners[pair[1]]);
          pathEIs   = [];
          for (let i = 0; i < pathNodes.length - 1; i++) {
            const ei = eIdx[ek(pathNodes[i], pathNodes[i + 1])];
            if (ei !== undefined) pathEIs.push(ei);
          }
          pathStep  = 0;
          lastPathT = t;
          activeNode = pathNodes[0] ?? centerNode;
        }
      }

      if (phase === 'path-anim' && t - lastPathT > PATH_MS) {
        lastPathT = t;
        if (pathStep < pathEIs.length) {
          edgePath[pathEIs[pathStep]] = 1;
          const a = pathNodes[pathStep], b = pathNodes[pathStep + 1];
          pulses.push([R[a][0], R[a][1], R[b][0], R[b][1], t, 520, 1]);
          activeNode = b;
          pathStep++;
        } else {
          phase = 'hold';
          holdStart = t;
          activeNode = -1;
        }
      }

      if (phase === 'hold' && t - holdStart > HOLD_MS) {
        phase = 'fade';
        fadeStart = t;
      }

      let gf = 1;
      if (phase === 'fade') {
        gf = Math.max(0, 1 - (t - fadeStart) / FADE_MS);
        if (gf <= 0) {
          phase      = 'bfs';
          bfsQ       = [centerNode];
          bfsSeen    = new Set([centerNode]);
          activeNode = centerNode;
          lastBfsT   = t;
          pathNodes  = []; pathEIs = [];
          nodeGlowTarget.fill(0); nodeGlowActual.fill(0);
          nodeGlowTarget[centerNode] = 1;
          nodeGlowActual[centerNode] = 1;
          edgeBfs.fill(0);      edgeBfsAlive.fill(0);
          edgePath.fill(0);     edgePathAlive.fill(0);
          pulses.length = 0;
          gf = 1;
        }
      }

      const lerpN = 0.08, lerpE = 0.06;
      for (let i = 0; i < N; i++)
        nodeGlowActual[i] += (nodeGlowTarget[i] - nodeGlowActual[i]) * lerpN;
      for (let i = 0; i < edges.length; i++) {
        edgeBfsAlive[i]  += (edgeBfs[i]  - edgeBfsAlive[i])  * lerpE;
        edgePathAlive[i] += (edgePath[i] - edgePathAlive[i]) * lerpE;
      }

      // ── Draw ──
      ctx.clearRect(0, 0, W, H);

      edges.forEach(([a, b], i) => {
        const pv = edgePathAlive[i] * gf;
        const bv = edgeBfsAlive[i]  * gf;
        const ax = sx(R[a][0]), ay = sy(R[a][1]);
        const bx = sx(R[b][0]), by = sy(R[b][1]);

        if (pv > 0.01) {
          ctx.beginPath();
          ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.strokeStyle = cPath;
          ctx.lineWidth   = d * 2.2;
          ctx.globalAlpha = pv * 0.18;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.lineWidth   = d * 0.65;
          ctx.globalAlpha = pv * 0.95;
          ctx.stroke();
        } else if (bv > 0.01) {
          ctx.beginPath();
          ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.strokeStyle = cBfs;
          ctx.lineWidth   = d * 1.6;
          ctx.globalAlpha = bv * 0.12;
          ctx.stroke();
          
          ctx.beginPath();
          ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.lineWidth   = d * 0.5;
          ctx.globalAlpha = bv * 0.80;
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
          ctx.strokeStyle = cDim;
          ctx.lineWidth   = d * 0.3;
          ctx.globalAlpha = 0.35;
          ctx.stroke();
        }
      });
      ctx.globalAlpha = 1;

      for (let i = pulses.length - 1; i >= 0; i--) {
        const [px, py, tx, ty, born, dur, ip] = pulses[i];
        const elapsed = t - born;
        if (elapsed < 0) continue; 
        const prog = elapsed / dur;
        if (prog >= 1) { pulses.splice(i, 1); continue; }

        const color = ip ? cPath : cBfs;
        const ease  = 1 - (1 - prog) * (1 - prog); 

        for (let trail = 0; trail < 4; trail++) {
          const tp   = Math.max(0, ease - trail * 0.07);
          const ix   = sx(px + (tx - px) * tp);
          const iy   = sy(py + (ty - py) * tp);
          const tr   = d * (2.4 - trail * 0.45);
          const ta   = ((1 - prog) * (1 - trail * 0.22)) * 0.88 * gf;
          if (ta <= 0 || tr <= 0) continue;
          ctx.beginPath();
          ctx.arc(ix, iy, tr, 0, Math.PI * 2);
          ctx.fillStyle   = color;
          ctx.globalAlpha = ta;
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      const pathSet = new Set(pathNodes);
      R.forEach(([nx, ny], i) => {
        const isActive = i === activeNode;
        const gv       = nodeGlowActual[i] * gf;
        const onPath   = pathSet.has(i) && phase !== 'bfs';
        const color    = onPath ? cPath : (gv > 0.05 ? cBfs : cDim);
        const r        = isActive ? d * 3.4 : (gv > 0.05 ? d * 2.0 : d * 1.2);
        const alpha    = isActive ? gf : (gv > 0.05 ? 0.9 * gv * gf : 0.28 * gf);

        if (isActive) {
          const hc = onPath ? cPath : cBfs;
          const cx = sx(nx), cy = sy(ny);

          const breathe = 0.75 + 0.25 * Math.sin(t / 600);
          const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, d * 18 * breathe);
          gr.addColorStop(0, hc + '40');
          gr.addColorStop(0.5, hc + '18');
          gr.addColorStop(1, 'transparent');
          ctx.globalAlpha = gf * breathe;
          ctx.beginPath();
          ctx.arc(cx, cy, d * 18 * breathe, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();

          const rp1 = (t % 1100) / 1100;
          ctx.beginPath();
          ctx.arc(cx, cy, d * 3.4 + rp1 * d * 18, 0, Math.PI * 2);
          ctx.strokeStyle = hc;
          ctx.lineWidth   = d * 0.6;
          ctx.globalAlpha = (1 - rp1) * 0.55 * gf;
          ctx.stroke();

          const rp2 = ((t + 550) % 1100) / 1100;
          ctx.beginPath();
          ctx.arc(cx, cy, d * 3.4 + rp2 * d * 10, 0, Math.PI * 2);
          ctx.lineWidth   = d * 0.4;
          ctx.globalAlpha = (1 - rp2) * 0.35 * gf;
          ctx.stroke();

          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(sx(nx), sy(ny), r, 0, Math.PI * 2);
        ctx.fillStyle   = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden opacity-[0.16] sm:opacity-[0.24]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[var(--bg)] to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_18%,color-mix(in_srgb,var(--accent)_6%,transparent),transparent)]" />
    </div>
  );
}