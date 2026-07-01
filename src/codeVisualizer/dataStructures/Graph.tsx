import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface GraphNode {
  id: string;
  label?: string | number;
  x: number; // 0–100 — used as initial seed, then overridden by force layout
  y: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight?: string | number;
  isDirected?: boolean;
}

export interface GraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  pointers?: { name: string; nodeId: string }[];
  highLightNodes?: string[];
  readNodes?: string[];
  writeNodes?: string[];
  compareNodes?: string[];
  deleteNodes?: string[];
  highLightEdges?: string[];
  readEdges?: string[];
}

// ─── Tiny force-directed simulation (no d3 dependency) ───────────────────────
interface Vec { x: number; y: number }

function runConcentricLayout(
  nodes: GraphNode[],
  width: number,
  height: number
): Record<string, Vec> {
  const pos: Record<string, Vec> = {};
  if (nodes.length === 0) return pos;

  const cx = width / 2;
  const cy = height / 2;

  if (nodes.length === 1) {
    pos[nodes[0].id] = { x: cx, y: cy };
    return pos;
  }

  // Predefined concentric rings for typical layout
  const rings = [
    { count: 1, radius: 0 },
    { count: 6, radius: 65 },
    { count: 12, radius: 130 },
    { count: 18, radius: 195 },
    { count: 24, radius: 260 },
  ];

  let nodeIdx = 0;
  for (const ring of rings) {
    if (nodeIdx >= nodes.length) break;

    const remaining = nodes.length - nodeIdx;
    const countInRing = Math.min(ring.count, remaining);

    for (let i = 0; i < countInRing; i++) {
      const node = nodes[nodeIdx++];
      if (ring.radius === 0) {
        pos[node.id] = { x: cx, y: cy };
      } else {
        const angle = (2 * Math.PI * i) / countInRing;
        pos[node.id] = {
          x: cx + ring.radius * Math.cos(angle),
          y: cy + ring.radius * Math.sin(angle),
        };
      }
    }
  }

  // If there are still nodes left, pack them in an outer circle
  const remaining = nodes.length - nodeIdx;
  if (remaining > 0) {
    const radius = 320;
    for (let i = 0; i < remaining; i++) {
      const node = nodes[nodeIdx++];
      const angle = (2 * Math.PI * i) / remaining;
      pos[node.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
      };
    }
  }

  return pos;
}

// ─── Component ───────────────────────────────────────────────────────────────
const NODE_R = 22; // radius in px — must match the w/h class below

const Graph = ({
  nodes = [],
  edges = [],
  pointers = [],
  highLightNodes = [],
  readNodes = [],
  writeNodes = [],
  compareNodes = [],
  deleteNodes = [],
  highLightEdges = [],
  readEdges = [],
}: GraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize]         = useState({ w: 380, h: 340 });
  const [positions, setPositions] = useState<Record<string, Vec>>({});

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-run layout whenever the node set or container size changes
  const nodeKey = nodes.map(n => n.id).join(',');
  useEffect(() => {
    if (nodes.length === 0) { setPositions({}); return; }
    const result = runConcentricLayout(nodes, size.w, size.h);
    setPositions(result);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodeKey, size.w, size.h]);

  // ─── Arrow markers (inline in the SVG so IDs are local) ──────────────────
  // We define one marker per state so the arrowhead colour matches the stroke.
  const markerDefs = (
    <defs>
      {[
        { id: 'arr-default',   cls: 'fill-border-2'  },
        { id: 'arr-highlight', cls: 'fill-accent-2'  },
        { id: 'arr-read',      cls: 'fill-accent'    },
        { id: 'arr-write',     cls: 'fill-success'   },
      ].map(({ id, cls }) => (
        <marker
          key={id}
          id={id}
          viewBox="0 0 10 10"
          refX="9"   // tip of arrow — we'll shorten the line to NODE_R + a gap
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" className={cls} />
        </marker>
      ))}
    </defs>
  );

  const nodeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show:   { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-w-[320px] min-h-[300px]"
    >
      {/* ─── SVG layer: edges ─────────────────────────────────────────────── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
        {markerDefs}
        <AnimatePresence>
          {[...edges].sort((a, b) => {
            const aRead = readEdges.includes(a.id) ? 1 : 0;
            const aHighlight = highLightEdges.includes(a.id) ? 1 : 0;
            const bRead = readEdges.includes(b.id) ? 1 : 0;
            const bHighlight = highLightEdges.includes(b.id) ? 1 : 0;
            // Read > Highlight > Default
            const aScore = aRead * 2 + aHighlight;
            const bScore = bRead * 2 + bHighlight;
            return aScore - bScore;
          }).map(edge => {
            const src = positions[edge.source];
            const tgt = positions[edge.target];
            if (!src || !tgt) return null;

            const isRead      = readEdges.includes(edge.id);
            const isHighlight = highLightEdges.includes(edge.id);

            let strokeCls  = 'stroke-border-2 opacity-60'; // Default with transparency to see covered edges
            let strokeW    = 1.5;
            let markerId   = 'arr-default';

            if (isRead)      { strokeCls = 'stroke-accent opacity-100';   strokeW = 2.5; markerId = 'arr-read';      }
            else if (isHighlight) { strokeCls = 'stroke-accent-2 opacity-100'; strokeW = 2;   markerId = 'arr-highlight'; }

            // Shorten the line so it ends at the node circle's edge (not center)
            const dx   = tgt.x - src.x;
            const dy   = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const GAP  = NODE_R + 4; // stop the line GAP px before target center

            const x1 = src.x + (dx / dist) * GAP;
            const y1 = src.y + (dy / dist) * GAP;
            const x2 = tgt.x - (dx / dist) * GAP;
            const y2 = tgt.y - (dy / dist) * GAP;

            const midX = (src.x + tgt.x) / 2;
            const midY = (src.y + tgt.y) / 2;

            return (
              <g key={edge.id}>
                <motion.line
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1, strokeDashoffset: (isRead || isHighlight) ? [0, -20] : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    opacity: { duration: 0.5 }, 
                    pathLength: { duration: 0.5, ease: 'easeOut' },
                    strokeDashoffset: { repeat: Infinity, duration: 1, ease: 'linear' } 
                  }}
                  x1={x1} y1={y1}
                  x2={x2} y2={y2}
                  className={cn(`${strokeCls} transition-all duration-300`)}
                  strokeWidth={strokeW}
                  strokeDasharray={(isRead || isHighlight) ? '4 4' : '0'}
                  markerEnd={edge.isDirected ? `url(#${markerId})` : undefined}
                />
                {edge.weight != null && (
                  <motion.text
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    x={midX} y={midY}
                    dy="-5"
                    textAnchor="middle"
                    className="fill-muted font-mono text-[9px] font-bold"
                    fontSize={9}
                  >
                    {edge.weight}
                  </motion.text>
                )}
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* ─── HTML layer: nodes ────────────────────────────────────────────── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence mode="popLayout">
          {nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isDelete   = deleteNodes.includes(node.id);
            const isWrite    = writeNodes.includes(node.id);
            const isCompare  = compareNodes.includes(node.id);
            const isRead     = readNodes.includes(node.id);
            const isHighlight = highLightNodes.includes(node.id);

            const cellPointers = pointers.filter(p => p.nodeId === node.id);

            let bgCls     = 'bg-surface/60 backdrop-blur-[2px]'; // Increased transparency
            let borderCls = 'border-border';
            let textCls   = 'text-text';
            let shadowCls = 'shadow-sm';
            let scale     = 1;
            let zIdx      = 1;

            if (isDelete)       { bgCls = 'bg-failure/20 backdrop-blur-[2px]'; borderCls = 'border-failure'; textCls = 'text-failure'; shadowCls = 'shadow-none'; scale = 0.95; zIdx = 10; }
            else if (isWrite)   { bgCls = 'bg-success/25 backdrop-blur-[2px]'; borderCls = 'border-success';    textCls = 'text-success'; shadowCls = 'shadow-none'; scale = 1.05; zIdx = 20; }
            else if (isCompare) { bgCls = 'bg-orange-500/25 backdrop-blur-[2px]'; borderCls = 'border-orange-500'; textCls = 'text-orange-500'; shadowCls = 'shadow-none'; scale = 1.02; zIdx = 15; }
            else if (isRead)    { bgCls = 'bg-accent/25 backdrop-blur-[2px]';   borderCls = 'border-accent';    textCls = 'text-accent'; shadowCls = 'shadow-none'; scale = 1.02; zIdx = 10; }
            else if (isHighlight) { bgCls = 'bg-accent-2/30 backdrop-blur-[2px]'; borderCls = 'border-accent-2'; textCls = 'text-accent-2'; zIdx = 5; }

            return (
              <motion.div
                key={`node-${node.id}`}
                variants={nodeVariants}
                initial="hidden"
                animate={{ ...nodeVariants.show as object, x: pos.x, y: pos.y }}
                exit="hidden"
                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                // position via animate so Framer interpolates smoothly on re-layout
                style={{ left: 0, top: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 28 }}
              >
                <motion.div
                  layout
                  initial={false}
                  animate={{ scale, zIndex: zIdx }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  // w-11 h-11 = 44px ≈ NODE_R*2
                  className={cn(`
                    w-11 h-11 flex items-center justify-center font-mono text-[13px] font-bold
                    rounded-full border transition-colors duration-200 shrink-0
                    ${bgCls} ${borderCls} ${textCls} ${shadowCls}
                  `)}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`val-${node.label ?? node.id}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.1 }}
                    >
                      {node.label ?? node.id}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                {/* Pointer badges */}
                <div className="absolute top-0 right-0 flex flex-col gap-0.5 z-30 translate-x-[40%] -translate-y-[40%]">
                  <AnimatePresence>
                    {cellPointers.map(ptr => (
                      <motion.div
                        key={ptr.name}
                        layoutId={`pointer-graph-${ptr.name}`}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                        className="bg-accent-3 text-white shadow-md border border-bg rounded-full px-1.5 py-[2px]"
                      >
                        <span className="text-[8px] font-mono font-bold leading-none uppercase tracking-wider">
                          {ptr.name}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Graph;