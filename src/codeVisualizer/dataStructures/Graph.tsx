import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface GraphNode {
  id: string;
  label?: string | number;
  x: number;
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

interface Vec { x: number; y: number }

function runForceLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
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

  nodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    pos[node.id] = {
      x: cx + Math.cos(angle) * (width * 0.2),
      y: cy + Math.sin(angle) * (height * 0.2),
    };
  });

  const area = width * height;
  // Enforce a minimum equilibrium distance (k) so edges always have breathing room
  const k = Math.max(Math.sqrt(area / Math.max(nodes.length, 1)) * 0.8, NODE_R * 5.5);
  let temperature = width / 8;
  const iterations = 180;
  const PADDING = NODE_R + 12;

  for (let iter = 0; iter < iterations; iter++) {
    const disp: Record<string, Vec> = {};
    for (const n of nodes) disp[n.id] = { x: 0, y: 0 };

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const u = nodes[i].id;
        const v = nodes[j].id;
        const dx = pos[u].x - pos[v].x;
        const dy = pos[u].y - pos[v].y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist === 0) dist = 0.01;

        let force = (k * k) / dist;
        // Strong collision penalty if nodes get too close to guarantee they never cover each other
        if (dist < NODE_R * 4) {
          force += (NODE_R * 4 - dist) * 100;
        }
        
        const dispX = (dx / dist) * force;
        const dispY = (dy / dist) * force;

        disp[u].x += dispX;
        disp[u].y += dispY;
        disp[v].x -= dispX;
        disp[v].y -= dispY;
      }
    }

    for (const e of edges) {
      const u = e.source;
      const v = e.target;
      if (!pos[u] || !pos[v]) continue;

      const dx = pos[v].x - pos[u].x;
      const dy = pos[v].y - pos[u].y;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) dist = 0.01;

      const force = (dist * dist) / k;
      const dispX = (dx / dist) * force;
      const dispY = (dy / dist) * force;

      disp[u].x += dispX;
      disp[u].y += dispY;
      disp[v].x -= dispX;
      disp[v].y -= dispY;
    }

    for (const n of nodes) {
      const u = n.id;
      const dx = cx - pos[u].x;
      const dy = cy - pos[u].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        disp[u].x += (dx / dist) * (dist * 0.05);
        disp[u].y += (dy / dist) * (dist * 0.05);
      }
    }

    for (const n of nodes) {
      const u = n.id;
      const dLen = Math.sqrt(disp[u].x * disp[u].x + disp[u].y * disp[u].y);
      if (dLen > 0) {
        const limitedDist = Math.min(dLen, temperature);
        pos[u].x += (disp[u].x / dLen) * limitedDist;
        pos[u].y += (disp[u].y / dLen) * limitedDist;
      }

      pos[u].x = Math.max(PADDING, Math.min(width - PADDING, pos[u].x));
      pos[u].y = Math.max(PADDING, Math.min(height - PADDING, pos[u].y));
    }

    temperature *= 0.95;
  }

  return pos;
}

const NODE_R = 22;

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
  const [size, setSize] = useState({ w: 380, h: 340 });
  const [positions, setPositions] = useState<Record<string, Vec>>({});

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

  const nodeKey = nodes.map(n => n.id).join(',');
  const edgeKey = edges.map(e => `${e.source}-${e.target}`).join(',');
  useEffect(() => {
    if (nodes.length === 0) { setPositions({}); return; }
    const result = runForceLayout(nodes, edges, size.w, size.h);
    setPositions(result);
  }, [nodeKey, edgeKey, size.w, size.h]);

  const defs = (
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
          refX="9" 
          refY="5"
          markerWidth="6.5"
          markerHeight="6.5"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 10 5 L 0 9 z" className={cls} />
        </marker>
      ))}


    </defs>
  );

  const nodeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show:   { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 280, damping: 22 } },
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-w-[320px] min-h-[300px] rounded-2xl overflow-hidden"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {defs}
      </svg>

      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-[1]">
        <AnimatePresence>
          {[...edges].sort((a, b) => {
            const aRead = readEdges.includes(a.id) ? 1 : 0;
            const aHighlight = highLightEdges.includes(a.id) ? 1 : 0;
            const bRead = readEdges.includes(b.id) ? 1 : 0;
            const bHighlight = highLightEdges.includes(b.id) ? 1 : 0;
            return (aRead * 2 + aHighlight) - (bRead * 2 + bHighlight);
          }).map(edge => {
            const src = positions[edge.source];
            const tgt = positions[edge.target];
            if (!src || !tgt) return null;

            const isRead      = readEdges.includes(edge.id);
            const isHighlight = highLightEdges.includes(edge.id);
            const isActive    = isRead || isHighlight;

            let strokeCls = 'stroke-border-2 opacity-50';
            let strokeW   = 1.5;
            let markerId  = 'arr-default';

            if (isRead)        { strokeCls = 'stroke-accent opacity-100';   strokeW = 2.5; markerId = 'arr-read';      }
            else if (isHighlight) { strokeCls = 'stroke-accent-2 opacity-100'; strokeW = 2;   markerId = 'arr-highlight'; }

            // Increased GAP slightly so the arrowhead doesn't clip into the node border
            const dx   = tgt.x - src.x;
            const dy   = tgt.y - src.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const GAP  = NODE_R + 6.5; 

            const x1 = src.x + (dx / dist) * GAP;
            const y1 = src.y + (dy / dist) * GAP;
            const x2 = tgt.x - (dx / dist) * GAP;
            const y2 = tgt.y - (dy / dist) * GAP;

            const isBidirectional = edge.isDirected && edges.some(
              e => e.source === edge.target && e.target === edge.source
            );

            let midX = (src.x + tgt.x) / 2;
            let midY = (src.y + tgt.y) / 2;
            let pathD = `M ${x1} ${y1} L ${x2} ${y2}`;

            if (isBidirectional) {
              const nx = -dy / dist;
              const ny = dx / dist;
              const curveOffset = Math.min(28, Math.max(14, dist * 0.18));
              const ctrlX = midX + nx * curveOffset;
              const ctrlY = midY + ny * curveOffset;

              pathD = `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
              midX = (midX + ctrlX) / 2;
              midY = (midY + ctrlY) / 2;
            }

            return (
              <g key={edge.id}>
                <motion.path
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1, strokeDashoffset: isActive ? [0, -20] : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    opacity: { duration: 0.4 },
                    pathLength: { duration: 0.5, ease: 'easeOut' },
                    strokeDashoffset: { repeat: Infinity, duration: 1.2, ease: 'linear' },
                  }}
                  d={pathD}
                  className={cn('fill-transparent transition-[stroke] duration-300', strokeCls)}
                  strokeWidth={strokeW}
                  strokeLinecap="round"
                  strokeDasharray={isActive ? '4 4' : '0'}
                  markerEnd={edge.isDirected ? `url(#${markerId})` : undefined}
                />
                {edge.weight != null && (
                  <motion.g
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transform={`translate(${midX}, ${midY})`}
                  >
                    <rect
                      x={-12} y={-9} width={24} height={18} rx={6}
                      className="fill-surface/90 backdrop-blur-sm stroke-border-2"
                      strokeWidth={0.5}
                    />
                    <text
                      textAnchor="middle" dy="3.5"
                      className="fill-muted font-mono text-[calc(10rem/16)] font-semibold tracking-wide"
                    >
                      {edge.weight}
                    </text>
                  </motion.g>
                )}
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence mode="popLayout">
          {nodes.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;

            const isDelete    = deleteNodes.includes(node.id);
            const isWrite     = writeNodes.includes(node.id);
            const isCompare   = compareNodes.includes(node.id);
            const isRead      = readNodes.includes(node.id);
            const isHighlight = highLightNodes.includes(node.id);
            const isActive    = isDelete || isWrite || isCompare || isRead || isHighlight;

            const cellPointers = pointers.filter(p => p.nodeId === node.id);

            // Using backdrop-blur-sm (4px) instead of [2px] for a cleaner frosted glass effect
            let bgCls     = 'bg-surface/70 backdrop-blur-sm';
            let borderCls = 'border-border';
            let textCls   = 'text-text';
            let ringCls   = '';
            let scale     = 1;
            let zIdx      = 1;

            if (isDelete)          { bgCls = 'bg-failure/20 backdrop-blur-sm';    borderCls = 'border-failure';    textCls = 'text-failure';    ringCls = 'ring-4 ring-failure/15';    scale = 0.94; zIdx = 10; }
            else if (isWrite)      { bgCls = 'bg-success/25 backdrop-blur-sm';    borderCls = 'border-success';    textCls = 'text-success';    ringCls = 'ring-4 ring-success/20';    scale = 1.06; zIdx = 20; }
            else if (isCompare)    { bgCls = 'bg-orange-500/25 backdrop-blur-sm'; borderCls = 'border-orange-500'; textCls = 'text-orange-500'; ringCls = 'ring-4 ring-orange-500/15'; scale = 1.04; zIdx = 15; }
            else if (isRead)       { bgCls = 'bg-accent/25 backdrop-blur-sm';     borderCls = 'border-accent';     textCls = 'text-accent';     ringCls = 'ring-4 ring-accent/15';     scale = 1.04; zIdx = 10; }
            else if (isHighlight)  { bgCls = 'bg-accent-2/30 backdrop-blur-sm';   borderCls = 'border-accent-2';   textCls = 'text-accent-2';   ringCls = 'ring-4 ring-accent-2/15';   zIdx = 5;  }

            return (
              <motion.div
                key={`node-${node.id}`}
                variants={nodeVariants}
                initial="hidden"
                animate={{ ...nodeVariants.show as object, x: pos.x, y: pos.y }}
                exit="hidden"
                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                style={{ left: 0, top: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  layout
                  initial={false}
                  animate={{ scale, zIndex: zIdx }}
                  transition={{ type: 'spring', stiffness: 340, damping: 22 }}
                  className={cn(
                    'w-11 h-11 flex items-center justify-center font-mono text-[calc(13rem/16)] font-semibold tracking-wide',
                    'rounded-full border-[1.5px] shrink-0 transition-colors duration-200 cursor-default',
                    bgCls, borderCls, textCls, ringCls,
                  )}
                >
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={`val-${node.label ?? node.id}`}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {node.label ?? node.id}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                {/* Pulse Ring — Smoothed out the expansion */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      key={`pulse-${node.id}-${isWrite ? 'w' : isDelete ? 'd' : isCompare ? 'c' : isRead ? 'r' : 'h'}`}
                      initial={{ opacity: 0.5, scale: 0.85 }}
                      animate={{ opacity: 0, scale: 1.8 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className={cn('absolute inset-0 rounded-full border-2 pointer-events-none', borderCls)}
                    />
                  )}
                </AnimatePresence>

                {/* Pointer badges - Centered perfectly to the corner */}
                <div className="absolute top-0 right-0 flex flex-col items-end gap-1 z-30 translate-x-1/2 -translate-y-1/2 pointer-events-none">
                  <AnimatePresence>
                    {cellPointers.map(ptr => (
                      <motion.div
                        key={ptr.name}
                        layoutId={`pointer-graph-${ptr.name}`}
                        initial={{ opacity: 0, scale: 0.5, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25, mass: 0.8 }}
                        className="flex items-center bg-accent-3 text-white border border-bg rounded-full px-2 py-[3px]"
                      >
                        <span className="text-[calc(9rem/16)] font-mono font-bold leading-none uppercase tracking-wider">
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
