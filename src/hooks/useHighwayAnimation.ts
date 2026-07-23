import { useEffect } from "react";

type Road = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cpx: number;
  cpy: number;
  tier: number;
  lit: number;
  litT: number;
  id: number;
};

type Pulse = {
  road: Road;
  color: string;
  t: number;
  born: number;
  speed: number;
};

export function useHighwayAnimation(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = () => window.devicePixelRatio || 1;
    const resize = () => {
      const d = dpr();
      canvas.width = canvas.offsetWidth * d;
      canvas.height = canvas.offsetHeight * d;
    };
    resize();
    const ro = new ResizeObserver(() => {
      resize();
      init();
    });
    ro.observe(canvas);

    // Seeded PRNG for reproducible layout
    let seed = 42;
    const sr = () => {
      seed = (seed * 16807 + 0) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const W = () => canvas.width;
    const H = () => canvas.height;

    let TIER_COLOR = ["#818CF8", "#9ca3f0", "#6b7bdc", "#4a5580"];
    let TIER_COLOR_PATH = ["#F472B6", "#e879a8", "#d46898", "#c05888"];
    const TIER_W_BASE = [2.8, 1.6, 0.9, 0.55];
    const TIER_GLOW = [8, 5, 3, 1.5];
    let DIM_COLOR = ["#4a4870", "#35335a", "#252345", "#1a1935"];
    const DIM_W = [1.4, 0.9, 0.55, 0.3];
    const DIM_A = [0.42, 0.32, 0.22, 0.14];

    const updateColors = () => {
      const root = document.documentElement;
      const style = getComputedStyle(root);
      const isDark = root.getAttribute("data-theme")?.includes("dark");

      const accent = style.getPropertyValue("--accent").trim() || (isDark ? "#818CF8" : "#6366F1");
      const accent3 =
        style.getPropertyValue("--accent-3").trim() || (isDark ? "#F472B6" : "#EC4899");
      const dim = style.getPropertyValue("--border-2").trim() || (isDark ? "#352B5A" : "#CBD5E1");
      const bg = style.getPropertyValue("--bg").trim() || (isDark ? "#0D0B14" : "#F8FAFC");

      const hex2rgb = (hex: string) => {
        const h = hex.replace("#", "");
        if (h.length === 3) return h.split("").map((c) => parseInt(c + c, 16));
        if (h.length === 6)
          return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
          ];
        return [128, 128, 128];
      };

      const mix = (c1: string, c2: string, p: number) => {
        try {
          const rgb1 = hex2rgb(c1);
          const rgb2 = hex2rgb(c2);
          return `rgb(${Math.round(rgb1[0] * p + rgb2[0] * (1 - p))}, ${Math.round(rgb1[1] * p + rgb2[1] * (1 - p))}, ${Math.round(rgb1[2] * p + rgb2[2] * (1 - p))})`;
        } catch (e) {
          return c1;
        }
      };

      TIER_COLOR = [accent, mix(accent, bg, 0.7), mix(accent, bg, 0.4), mix(accent, bg, 0.2)];
      TIER_COLOR_PATH = [
        accent3,
        mix(accent3, bg, 0.7),
        mix(accent3, bg, 0.4),
        mix(accent3, bg, 0.2),
      ];
      DIM_COLOR = [dim, mix(dim, bg, 0.7), mix(dim, bg, 0.4), mix(dim, bg, 0.2)];
    };

    updateColors();
    const themeObserver = new MutationObserver(updateColors);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    let roads: Road[] = [];
    let pulses: Pulse[] = [];
    let adj: number[][] = [];

    // ── Generate the city road network ──
    function init() {
      seed = 42;
      roads = [];
      pulses = [];
      const w = W(),
        h = H();
      const cx = w * 0.5,
        cy = h * 0.52;

      // 1. Arterial roads — thick radiating highways with jogs
      const artCount = 14;
      for (let i = 0; i < artCount; i++) {
        const angle = (i / artCount) * Math.PI * 2 + sr() * 0.3;
        const len = (0.32 + sr() * 0.22) * Math.min(w, h);
        const pts: [number, number][] = [[cx, cy]];
        let x = cx,
          y = cy;
        const segs = 4 + Math.floor(sr() * 4);
        for (let s = 0; s < segs; s++) {
          const t = (s + 1) / segs;
          const jog = (sr() - 0.5) * 0.12 * len;
          const perp = angle + Math.PI / 2;
          x = cx + Math.cos(angle) * len * t + Math.cos(perp) * jog;
          y = cy + Math.sin(angle) * len * t + Math.sin(perp) * jog;
          pts.push([x, y]);
        }
        for (let s = 0; s < pts.length - 1; s++) {
          roads.push({
            x1: pts[s][0],
            y1: pts[s][1],
            x2: pts[s + 1][0],
            y2: pts[s + 1][1],
            cpx: (pts[s][0] + pts[s + 1][0]) / 2 + (sr() - 0.5) * 40,
            cpy: (pts[s][1] + pts[s + 1][1]) / 2 + (sr() - 0.5) * 40,
            tier: 0,
            lit: 0,
            litT: 0,
            id: roads.length,
          });
        }
      }

      // 2. Ring roads — irregular concentric partial rings
      [0.18, 0.32, 0.48].forEach((rf, ri) => {
        const r = rf * Math.min(w, h);
        const segs = 18 + ri * 8;
        const startAng = sr() * Math.PI * 2;
        const arcFrac = 0.55 + sr() * 0.35;
        for (let s = 0; s < Math.floor(segs * arcFrac); s++) {
          const a1 = startAng + (s / segs) * Math.PI * 2;
          const a2 = startAng + ((s + 1) / segs) * Math.PI * 2;
          const r1 = r * (0.85 + sr() * 0.3);
          const r2 = r * (0.85 + sr() * 0.3);
          roads.push({
            x1: cx + Math.cos(a1) * r1,
            y1: cy + Math.sin(a1) * r1,
            x2: cx + Math.cos(a2) * r2,
            y2: cy + Math.sin(a2) * r2,
            cpx: cx + Math.cos((a1 + a2) / 2) * r1 * 1.05,
            cpy: cy + Math.sin((a1 + a2) / 2) * r1 * 1.05,
            tier: 1,
            lit: 0,
            litT: 0,
            id: roads.length,
          });
        }
      });

      // 3. Street grids — dense irregular grids at various zones
      const gridZones = [
        {
          cx: cx,
          cy: cy,
          gw: w * 0.28,
          gh: h * 0.28,
          sx: w * 0.035,
          sy: h * 0.035,
          jitter: 6,
          tier: 2,
        },
        {
          cx: cx + w * 0.18,
          cy: cy + h * 0.12,
          gw: w * 0.18,
          gh: h * 0.16,
          sx: w * 0.028,
          sy: h * 0.028,
          jitter: 8,
          tier: 2,
        },
        {
          cx: cx - w * 0.15,
          cy: cy + h * 0.15,
          gw: w * 0.15,
          gh: h * 0.14,
          sx: w * 0.03,
          sy: h * 0.03,
          jitter: 10,
          tier: 2,
        },
        {
          cx: cx + w * 0.05,
          cy: cy - h * 0.18,
          gw: w * 0.12,
          gh: h * 0.12,
          sx: w * 0.025,
          sy: h * 0.025,
          jitter: 5,
          tier: 2,
        },
        {
          cx: cx - w * 0.2,
          cy: cy - h * 0.1,
          gw: w * 0.13,
          gh: h * 0.1,
          sx: w * 0.03,
          sy: h * 0.03,
          jitter: 12,
          tier: 3,
        },
      ];
      gridZones.forEach((z) => {
        const cols = Math.floor(z.gw / z.sx);
        const rows = Math.floor(z.gh / z.sy);
        for (let r = 0; r <= rows; r++) {
          for (let c = 0; c < cols; c++) {
            const y1 = z.cy - z.gh / 2 + r * z.sy + (sr() - 0.5) * z.jitter;
            const x1 = z.cx - z.gw / 2 + c * z.sx + (sr() - 0.5) * z.jitter;
            const x2 = z.cx - z.gw / 2 + (c + 1) * z.sx + (sr() - 0.5) * z.jitter;
            const y2 = y1 + (sr() - 0.5) * z.jitter * 0.5;
            if (sr() < 0.88)
              roads.push({
                x1,
                y1,
                x2,
                y2,
                cpx: (x1 + x2) / 2,
                cpy: (y1 + y2) / 2,
                tier: z.tier,
                lit: 0,
                litT: 0,
                id: roads.length,
              });
          }
        }
        for (let c = 0; c <= cols; c++) {
          for (let r = 0; r < rows; r++) {
            const x1 = z.cx - z.gw / 2 + c * z.sx + (sr() - 0.5) * z.jitter;
            const y1 = z.cy - z.gh / 2 + r * z.sy + (sr() - 0.5) * z.jitter;
            const y2 = z.cy - z.gh / 2 + (r + 1) * z.sy + (sr() - 0.5) * z.jitter;
            const x2 = x1 + (sr() - 0.5) * z.jitter * 0.5;
            if (sr() < 0.88)
              roads.push({
                x1,
                y1,
                x2,
                y2,
                cpx: (x1 + x2) / 2,
                cpy: (y1 + y2) / 2,
                tier: z.tier,
                lit: 0,
                litT: 0,
                id: roads.length,
              });
          }
        }
      });

      // 4. Suburb tendrils — organic branching roads
      for (let i = 0; i < 20; i++) {
        const startAng = sr() * Math.PI * 2;
        const startR = (0.15 + sr() * 0.1) * Math.min(w, h);
        let x = cx + Math.cos(startAng) * startR;
        let y = cy + Math.sin(startAng) * startR;
        let ang = startAng + (sr() - 0.5) * 1.2;
        const steps = 6 + Math.floor(sr() * 12);
        for (let s = 0; s < steps; s++) {
          ang += (sr() - 0.5) * 0.5;
          const len = (0.03 + sr() * 0.05) * Math.min(w, h);
          const nx = x + Math.cos(ang) * len;
          const ny = y + Math.sin(ang) * len;
          roads.push({
            x1: x,
            y1: y,
            x2: nx,
            y2: ny,
            cpx: (x + nx) / 2 + (sr() - 0.5) * 20,
            cpy: (y + ny) / 2 + (sr() - 0.5) * 20,
            tier: 2,
            lit: 0,
            litT: 0,
            id: roads.length,
          });
          if (sr() < 0.3) {
            const bang = ang + (sr() < 0.5 ? 1 : -1) * (0.4 + sr() * 0.6);
            const blen = (0.02 + sr() * 0.03) * Math.min(w, h);
            roads.push({
              x1: nx,
              y1: ny,
              x2: nx + Math.cos(bang) * blen,
              y2: ny + Math.sin(bang) * blen,
              cpx: nx + Math.cos(bang) * blen * 0.5 + (sr() - 0.5) * 12,
              cpy: ny + Math.sin(bang) * blen * 0.5 + (sr() - 0.5) * 12,
              tier: 3,
              lit: 0,
              litT: 0,
              id: roads.length,
            });
          }
          x = nx;
          y = ny;
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
          const a = roads[i],
            b = roads[j];
          if (
            Math.hypot(a.x2 - b.x1, a.y2 - b.y1) < EPS ||
            Math.hypot(a.x2 - b.x2, a.y2 - b.y2) < EPS ||
            Math.hypot(a.x1 - b.x1, a.y1 - b.y1) < EPS ||
            Math.hypot(a.x1 - b.x2, a.y1 - b.y2) < EPS
          ) {
            adj[i].push(j);
            adj[j].push(i);
          }
        }
      }
    }

    // ── Wave expansion from center ──
    let waveQueue: number[] = [];
    let waveSeen = new Set<number>();
    let wavePhase = "spreading";
    let waveStart = 0;
    let lastWave = 0;
    let lastPulse = 0;
    const WAVE_INTERVAL = 18;

    function startWave() {
      roads.forEach((r) => {
        r.litT = 0;
        r.lit = 0;
      });
      pulses.length = 0;
      waveSeen = new Set();
      waveQueue = roads
        .filter((r) => r.tier === 0)
        .slice(0, 8)
        .map((r) => r.id);
      waveQueue.forEach((id) => waveSeen.add(id));
      wavePhase = "spreading";
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
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        raf = requestAnimationFrame(loop);
        return;
      }
      const w = W(),
        h = H(),
        dp = dpr();

      if (!initialized) {
        init();
        initialized = true;
      }

      // Wave expansion
      if (wavePhase === "spreading" && t - lastWave > WAVE_INTERVAL && waveQueue.length > 0) {
        lastWave = t;
        const batch = Math.min(3, waveQueue.length);
        for (let b = 0; b < batch; b++) {
          const id = waveQueue.shift();
          if (id === undefined) break;
          roads[id].litT = 1;
          if (roads[id].tier <= 1) spawnPulse(roads[id], TIER_COLOR[roads[id].tier]);
          adj[id]?.forEach((nid) => {
            if (!waveSeen.has(nid)) {
              waveSeen.add(nid);
              waveQueue.push(nid);
            }
          });
        }
        if (waveQueue.length === 0) {
          wavePhase = "hold";
          waveStart = t;
        }
      }

      if (wavePhase === "hold" && t - waveStart > 3500) {
        wavePhase = "fade";
        waveStart = t;
      }
      if (wavePhase === "fade") {
        const p = Math.max(0, 1 - (t - waveStart) / 1200);
        if (p <= 0) {
          roads.forEach((r) => {
            r.lit = 0;
            r.litT = 0;
          });
          pulses.length = 0;
          startWave();
          wavePhase = "spreading";
          lastWave = t;
        } else {
          roads.forEach((r) => {
            r.litT *= 0.998;
          });
        }
      }

      // Lerp
      roads.forEach((r) => {
        r.lit += (r.litT - r.lit) * 0.04;
      });

      // Pulse progress
      for (let i = pulses.length - 1; i >= 0; i--) {
        pulses[i].t = Math.min(1, (t - pulses[i].born) / pulses[i].speed);
        if (pulses[i].t >= 1) pulses.splice(i, 1);
      }

      // Spawn ambient pulses on lit arterials
      if (t - lastPulse > 320) {
        lastPulse = t;
        const litArt = roads.filter((r) => r.tier <= 1 && r.lit > 0.5);
        if (litArt.length > 0) {
          const r = litArt[Math.floor(sr() * litArt.length)];
          spawnPulse(r, Math.random() < 0.3 ? TIER_COLOR_PATH[0] : TIER_COLOR[0]);
        }
      }

      // ── Draw ──
      ctx.clearRect(0, 0, w, h);

      // Draw roads back-to-front by tier
      ([3, 2, 1, 0] as const).forEach((tier) => {
        roads
          .filter((r) => r.tier === tier)
          .forEach((road) => {
            const lv = road.lit;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            if (lv > 0.01) {
              const col = TIER_COLOR[tier];
              // Glow
              ctx.beginPath();
              ctx.moveTo(road.x1, road.y1);
              ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
              ctx.strokeStyle = col;
              ctx.lineWidth = TIER_GLOW[tier] * dp;
              ctx.globalAlpha = lv * 0.08;
              ctx.stroke();
              // Body
              ctx.beginPath();
              ctx.moveTo(road.x1, road.y1);
              ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
              ctx.lineWidth = TIER_W_BASE[tier] * dp * 1.8;
              ctx.globalAlpha = lv * 0.35;
              ctx.stroke();
              // Bright core
              ctx.beginPath();
              ctx.moveTo(road.x1, road.y1);
              ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
              ctx.strokeStyle = "#d0ceff";
              ctx.lineWidth = TIER_W_BASE[tier] * dp * 0.5;
              ctx.globalAlpha = lv * 0.85;
              ctx.stroke();
            } else {
              // Dim base — always visible like a dark map
              ctx.beginPath();
              ctx.moveTo(road.x1, road.y1);
              ctx.quadraticCurveTo(road.cpx, road.cpy, road.x2, road.y2);
              ctx.strokeStyle = DIM_COLOR[tier];
              ctx.lineWidth = DIM_W[tier] * dp;
              ctx.globalAlpha = DIM_A[tier];
              ctx.stroke();
            }
          });
      });
      ctx.globalAlpha = 1;

      // Draw pulses — comet traveling along quadratic bezier
      pulses.forEach((p) => {
        const r = p.road;
        const ease = p.t < 0.5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2;
        for (let tr = 0; tr < 5; tr++) {
          const tp = Math.max(0, ease - tr * 0.07);
          const mt = 1 - tp;
          const tx = mt * mt * r.x1 + 2 * mt * tp * r.cpx + tp * tp * r.x2;
          const ty = mt * mt * r.y1 + 2 * mt * tp * r.cpy + tp * tp * r.y2;
          const rad = dp * (3.5 - tr * 0.55);
          const alpha = (1 - p.t) * (1 - tr * 0.18) * 0.95;
          if (alpha <= 0 || rad <= 0) continue;
          if (tr === 0) {
            ctx.beginPath();
            ctx.arc(tx, ty, rad * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha * 0.15;
            ctx.fill();
          }
          ctx.beginPath();
          ctx.arc(tx, ty, rad, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      });
      ctx.globalAlpha = 1;

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf!);
      ro.disconnect();
      themeObserver.disconnect();
    };
  }, [canvasRef]);
}
