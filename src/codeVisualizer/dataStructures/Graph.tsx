import { motion, AnimatePresence, type Variants } from 'framer-motion';

export interface GraphNode {
  id: string;
  label?: string | number; // Display value
  x: number; // 0 to 100 (percentage based for responsive positioning)
  y: number; // 0 to 100 
}

export interface GraphEdge {
  id: string; // e.g., 'A-B'
  source: string; // Node ID
  target: string; // Node ID
  weight?: string | number;
  isDirected?: boolean;
}

export interface GraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  pointers?: { name: string; nodeId: string }[];
  
  // Node Operations
  highLightNodes?: string[];
  readNodes?: string[];
  writeNodes?: string[];
  compareNodes?: string[];
  deleteNodes?: string[];
  
  // Edge Operations
  highLightEdges?: string[];
  readEdges?: string[]; // E.g., when traversing an edge
}

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

  const getNodePos = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  // ─── Animation Variants ───
  const nodeVariants : Variants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 20 } },
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center p-4">
      
      {/* ─── 1. SVG LAYER (Edges) ─── */}
      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none z-0">
        <defs>
          <marker id="arrow-default" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-border-2" />
          </marker>
          <marker id="arrow-highlight" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent-2" />
          </marker>
          <marker id="arrow-read" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-accent" />
          </marker>
        </defs>

        <AnimatePresence>
          {edges.map((edge) => {
            const sourcePos = getNodePos(edge.source);
            const targetPos = getNodePos(edge.target);
            
            const isRead = readEdges.includes(edge.id);
            const isHighlight = highLightEdges.includes(edge.id);

            // Edge Styling Logic
            let strokeColor = "stroke-border-2";
            let strokeWidth = 2;
            let marker = edge.isDirected ? "url(#arrow-default)" : "";
            let zIndex = 0;

            if (isRead) {
              strokeColor = "stroke-accent";
              strokeWidth = 3;
              marker = edge.isDirected ? "url(#arrow-read)" : "";
              zIndex = 10;
            } else if (isHighlight) {
              strokeColor = "stroke-accent-2";
              strokeWidth = 2.5;
              marker = edge.isDirected ? "url(#arrow-highlight)" : "";
            }

            // Calculate midpoint for edge weight labels
            const midX = (sourcePos.x + targetPos.x) / 2;
            const midY = (sourcePos.y + targetPos.y) / 2;

            return (
              <g key={edge.id} style={{ zIndex }}>
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  x1={`${sourcePos.x}%`} y1={`${sourcePos.y}%`}
                  x2={`${targetPos.x}%`} y2={`${targetPos.y}%`}
                  className={`${strokeColor} transition-colors duration-300`}
                  strokeWidth={strokeWidth}
                  markerEnd={marker}
                />
                {edge.weight && (
                  <motion.text
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    x={`${midX}%`} y={`${midY}%`}
                    dy="-6" // Lift slightly above the line
                    textAnchor="middle"
                    className="fill-muted font-mono text-[10px] font-bold bg-bg drop-shadow-sm"
                  >
                    {edge.weight}
                  </motion.text>
                )}
              </g>
            );
          })}
        </AnimatePresence>
      </svg>

      {/* ─── 2. HTML LAYER (Nodes) ─── */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <AnimatePresence mode="popLayout">
          {nodes.map((node) => {
            const isDelete = deleteNodes?.includes(node.id);
            const isWrite = writeNodes?.includes(node.id);
            const isCompare = compareNodes?.includes(node.id);
            const isRead = readNodes?.includes(node.id);
            const isHighlight = highLightNodes?.includes(node.id);

            const cellPointers = pointers?.filter((p) => p.nodeId === node.id) || [];

            // Node Styling Logic (Matches your custom Theme Arrays)
            let bgClass = "bg-surface";
            let borderClass = "border-border";
            let textClass = "text-text";
            let shadowClass = "shadow-sm";
            let activeScale = 1;
            let activeZIndex = 1;

            if (isDelete) {
              bgClass = "bg-failure/10"; borderClass = "border-failure/80"; textClass = "text-failure";
              shadowClass = "shadow-[0_0_6px_var(--failure)]"; activeScale = 0.95; activeZIndex = 10;
            } else if (isWrite) {
              bgClass = "bg-success/15"; borderClass = "border-success"; textClass = "text-success";
              shadowClass = "shadow-[0_0_6px_var(--success)]"; activeScale = 1.05; activeZIndex = 20;
            } else if (isCompare) {
              bgClass = "bg-orange-500/15"; borderClass = "border-orange-500"; textClass = "text-orange-500";
              shadowClass = "shadow-[0_0_6px_#f97316]"; activeScale = 1.02; activeZIndex = 15;
            } else if (isRead) {
              bgClass = "bg-accent/15"; borderClass = "border-accent"; textClass = "text-accent";
              shadowClass = "shadow-[0_0_6px_var(--glow)]"; activeScale = 1.02; activeZIndex = 10;
            } else if (isHighlight) {
              bgClass = "bg-accent-2/20"; borderClass = "border-accent-2"; textClass = "text-accent-2";
              activeZIndex = 5;
            }

            return (
              <motion.div
                key={`node-${node.id}`}
                variants={nodeVariants}
                initial="hidden" animate="show" exit="hidden"
                className="absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {/* Main Node Circle */}
                <motion.div
                  layout
                  initial={false}
                  animate={{ scale: activeScale, zIndex: activeZIndex }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`
                    w-11 h-11 flex items-center justify-center font-mono text-[14px] font-bold 
                    rounded-full border transition-colors duration-200 shrink-0
                    ${bgClass} ${borderClass} ${textClass} ${shadowClass}
                  `}
                >
                  <AnimatePresence mode="wait">
                    <motion.span key={`val-${node.label || node.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                      {node.label || node.id}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>

                {/* Corner Anchored Pointers (Same as D2Array) */}
                <div className="absolute top-0 right-0 flex flex-col gap-0.5 z-30 translate-x-[40%] -translate-y-[40%]">
                  <AnimatePresence>
                    {cellPointers.map((ptr) => (
                      <motion.div
                        key={ptr.name} layoutId={`pointer-graph-${ptr.name}`}
                        initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                        className="bg-accent-3 text-white shadow-md border border-bg rounded-full px-1.5 py-[2px] flex items-center justify-center"
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