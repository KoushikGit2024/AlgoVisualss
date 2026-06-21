import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DndContext, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// The ?worker flag is Vite's magic syntax to bundle this as a background thread!
import EngineWorker from '../../lib/engine.worker?worker';
import { InfoIcon, Play, Pause, SkipBack, SkipForward, RotateCcw, RefreshCw, Activity, Terminal } from 'lucide-react';

import Graph from '../dataStructures/Graph'; 
import D1Array from '../dataStructures/D1Array';
import D2Array from '../dataStructures/D2Array';
import LinkedList from '../dataStructures/LinkedList';
import Queue from '../dataStructures/Queue';
import Stack from '../dataStructures/Stack';
import Tree from '../dataStructures/Tree';

// ─── THE STL UNWRAPPER ───────────────────────────────────────────────
const unwrapSTL = (val: any): any => {
  if (val === null || val === undefined) return val;
  if (typeof val === 'object' && !Array.isArray(val) && 'data' in val && Array.isArray(val.data)) {
    return unwrapSTL(val.data);
  }
  if (Array.isArray(val)) {
    return val.map(unwrapSTL);
  }
  return val;
};

// ─── Sortable Memory Card ──────────────────────────────────────────────────
const SortableMemoryCard = ({ id, label, value, takefullWidth = false }: { id: string, label: string, value: any, takefullWidth?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`shrink-0 touch-none inline-flex ${takefullWidth ? 'w-full' : ''}`}>
      <div className={`bg-surface border rounded-sm p-1.5 transition-colors flex flex-col h-[120px] resize-x overflow-hidden group
          ${isDragging ? 'border-accent shadow-md glow-accent' : 'border-border shadow-sm hover:border-accent/50'}
        `}
        style={{ width: takefullWidth ? '100%' : '180px', minWidth: '120px', maxWidth: '100%' }}
      >
        <div className="flex items-center gap-1 mb-1 shrink-0 border-b border-border pb-1">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 -ml-0.5 text-muted hover:text-accent hover:bg-surface-2 rounded transition-colors">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
            </svg>
          </div>
          <span className="text-[9px] font-mono font-bold text-text truncate">{label}</span>
        </div>
        <div className="text-[9px] text-text/70 italic overflow-y-auto styled-scrollbar pr-1 flex-1 leading-tight">
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

const VisualGround = ({
  code,
  lang,
  setHighlightLine
}: {
  code: string;
  lang: string;
  setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const [hSplit, setHSplit] = useState<number>(65); 
  const [vSplit, setVSplit] = useState<number>(30); 
  const [draggingDiv, setDraggingDiv] = useState<'v' | 'h' | null>(null);
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // ADD THIS:
  const workerRef = useRef<Worker | null>(null);

  // ADD THIS: Cleanup the worker if the user navigates away from the page
  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);
  
  const handleSimulate = () => {
    if (lang !== 'C++') return;

    // 1. If the user spams the simulate button, kill the previous worker
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsCompiling(true); 
    setError(null); 
    setIsPlaying(false); 
    setSnapshots([]);

    // 2. Spin up the background thread
    const worker = new EngineWorker();
    workerRef.current = worker;

    // 3. Listen for the result coming back from the worker
    worker.onmessage = (e) => {
      const { success, snapshots, error } = e.data;
      
      if (success) {
        setSnapshots(snapshots); 
        setCurrentStep(0);
      } else {
        console.error("FATAL ENGINE CRASH:", error);
        setError(error || "Compilation Failed. Check syntax or engine limits.");
      }
      
      // Clean up
      setIsCompiling(false);
      worker.terminate();
      workerRef.current = null;
    };

    // Fallback error handler for extreme worker crashes (e.g., out of memory)
    worker.onerror = (err) => {
      console.error("Worker Thread Error:", err);
      setError("A fatal worker error occurred (Out of Memory / Timeout).");
      setIsCompiling(false);
      worker.terminate();
      workerRef.current = null;
    };

    // 4. Send the code to the worker to start the process!
    worker.postMessage({ sourceCode: code });
  };

  const handleResetError = () => {
    setError(null); setIsCompiling(false); setSnapshots([]);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentStep < snapshots.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => prev + 1);
      }, 10 / speed);
    } else if (currentStep >= snapshots.length - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, snapshots.length, speed]);

  useEffect(() => {
    if (snapshots.length > 0 && snapshots[currentStep]) {
      setHighlightLine(snapshots[currentStep].line || 0);
    }
  }, [currentStep, snapshots, setHighlightLine]);

  // ─── STATE EXTRACTION WITH INTERCEPTOR ───
  const currentSnapshot = snapshots[currentStep] || null;
  const rawVars = currentSnapshot?.state?.variables || {};
  const currentEvent = currentSnapshot?.event || { type: 'IDLE', payload: {} };
  const activeFunction = currentSnapshot?.state?.callStack?.[currentSnapshot.state.callStack.length - 1] || 'global';

  const vars = useMemo(() => {
    const clean: Record<string, any> = {};
    for (const [key, variable] of Object.entries(rawVars)) {
      clean[key] = { ...(variable as any), value: unwrapSTL((variable as any).value) };
    }
    return clean;
  }, [rawVars]);

  const overviewVars: any[] = [];
  const complexVars: any[] = [];
  
  Object.entries(vars).forEach(([name, data]: [string, any]) => {
    const val = data.value;
    
    if (Array.isArray(val) || (val && typeof val === 'object')) {
      complexVars.push({ id: name, label: name, type: data.type, value: val });
    }

    const isTarget = currentEvent.payload?.variable === name;
    let opStyle = "text-text"; 
    
    if (isTarget) {
      if (currentEvent.type === 'WRITE') opStyle = "bg-success/20 text-success border-success/30 font-bold";
      else if (currentEvent.type === 'READ') opStyle = "bg-accent/20 text-accent border-accent/30 font-bold";
    }

    let displayValue = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (displayValue.length > 40) displayValue = displayValue.substring(0, 40) + "...";

    overviewVars.push({ id: name, type: data.type, name: name, value: displayValue, opStyle, func: activeFunction });
  });

  // ─── TERMINAL OUTPUT TRACKER ───
  const consoleOutput = useMemo(() => {
    let out = "";
    for (let i = 0; i <= currentStep; i++) {
      if (snapshots[i]?.event?.type === 'WRITE' && snapshots[i].event.payload?.output) {
        out += snapshots[i].event.payload.output;
      }
    }
    return out;
  }, [snapshots, currentStep]);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  type CanvasState = { type: 'graph' | 'matrix' | 'array' | 'linkedlist' | 'queue' | 'stack' | 'tree' | 'none'; props?: any; usedKeys: string[] };

  // ─── PREFIX-BASED CANVAS ADAPTER ───
  const canvasData: CanvasState = useMemo(() => {
    const keys = Object.keys(vars);

    // 1. Graph Detection
    // FIX: use ?? fallback to also match keys that merely include 'adj'
    const graphKey = keys.find(k => k.startsWith('adj') || k.startsWith('graph')) ?? keys.find(k => k.includes('adj'));
    if (graphKey) {
      const edgeKey = keys.find(k => k.includes('edge'));

      // FIX: always call unwrapSTL at point-of-use so { data: [...] } wrappers are stripped
      const rawEdges = edgeKey ? unwrapSTL(vars[edgeKey]?.value || []) : [];

      // FIX: prefer the first adj* key whose value is already a plain array (e.g. adj_list(n))
      // over the fallback graphKey which may hold {} when the engine hasn't populated it yet
      const adjListKey = keys.find(k => k.startsWith('adj') && Array.isArray(vars[k]?.value));
      const adjList = adjListKey ? vars[adjListKey]?.value : vars[graphKey]?.value;
      let n = Array.isArray(adjList) ? adjList.length : (vars['n']?.value || 0);

      // Infer n from edge list when adjacency list is empty
      if (n === 0 && Array.isArray(rawEdges) && rawEdges.length > 0) {
        let maxNode = -1;
        rawEdges.forEach((e: any) => {
          if (Array.isArray(e)) {
            if (e[0] > maxNode) maxNode = e[0];
            if (e[1] > maxNode) maxNode = e[1];
          }
        });
        n = maxNode + 1;
      }

      // FIX: bail out early so we don't render a graph shell with zero nodes
      if (n === 0) return { type: 'none', usedKeys: [], props: {} };

      const visitedKey = keys.find(k => k.includes('visit'));
      const visited = visitedKey ? (vars[visitedKey]?.value || []) : [];
      const nodeKey = keys.find(k => k.startsWith('ptr_n') || k.includes('node') || k === 'curr' || k === 'u' || k === 'v');
      const activeNode = nodeKey ? vars[nodeKey]?.value : undefined;

      const usedKeys = [graphKey, edgeKey, visitedKey, nodeKey, 'n'].filter(Boolean) as string[];

      // FIX: compute circular layout instead of leaving all nodes at (0, 0)
      const buildNodes = (count: number) =>
        Array.from({ length: count }).map((_, i) => {
          const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2;
          const radius = count <= 3 ? 28 : count <= 6 ? 33 : 38;
          return {
            id: String(i),
            label: String(i),
            x: 50 + radius * Math.cos(angle),
            y: 50 + radius * Math.sin(angle),
          };
        });

      // FIX: filter malformed edge entries before mapping
      const buildEdges = (edges: any[]) =>
        Array.isArray(edges)
          ? edges
              .filter((e: any) => Array.isArray(e) && e.length >= 2)
              .map((e: any[]) => ({ id: `${e[0]}-${e[1]}`, source: String(e[0]), target: String(e[1]) }))
          : [];

      return {
        type: 'graph',
        usedKeys,
        props: {
          nodes: buildNodes(n),
          edges: buildEdges(rawEdges),
          highLightNodes: Array.isArray(visited)
            ? visited.map((v: number, i: number) => v === 1 ? String(i) : null).filter(Boolean)
            : [],
          pointers: activeNode !== undefined
            ? [{ name: nodeKey || 'curr', nodeId: String(activeNode) }]
            : [],
        },
      };
    }

    // 2. Tree Detection
    const treeKey = keys.find(k => k.startsWith('tree_') || k.startsWith('bst_') || k.startsWith('trie_'));
    if (treeKey) {
      const treeData = vars[treeKey]?.value;
      const pointers: { name: string, nodeId: string }[] = [];
      const usedKeys = [treeKey];

      ['root', 'curr', 'parent', 'left', 'right', 'temp'].forEach(ptrName => {
        const matchedKey = keys.find(k => k === ptrName || k.endsWith(`_${ptrName}`) || k.startsWith(`ptr_${ptrName}`));
        if (matchedKey && vars[matchedKey]?.value !== undefined && vars[matchedKey]?.value !== null) {
          pointers.push({ name: ptrName, nodeId: String(vars[matchedKey].value) });
          usedKeys.push(matchedKey);
        }
      });
      return { type: 'tree', usedKeys, props: { nodes: Array.isArray(treeData) ? treeData : [], pointers } };
    }

    // 3. Matrix Detection
    const matrixKey = keys.find(k => k.startsWith('mat') || k.startsWith('grid') || k.startsWith('board') || k.startsWith('dp'));
    if (matrixKey) {
      const grid = vars[matrixKey]?.value;
      const pointers: { name: string, row: number, col: number }[] = [];
      const usedKeys = [matrixKey];

      // FIX: extended patterns to also match r_curr / c_curr style names
      const rowKey = keys.find(k => k === 'r' || k.includes('row') || k.endsWith('_r') || k.startsWith('r_'));
      const colKey = keys.find(k => k === 'c' || k.includes('col') || k.endsWith('_c') || k.startsWith('c_'));

      if (rowKey && colKey && vars[rowKey]?.value !== undefined && vars[colKey]?.value !== undefined) {
        pointers.push({ name: rowKey.replace('_', ''), row: vars[rowKey].value, col: vars[colKey].value });
        usedKeys.push(rowKey, colKey);
      }

      // FIX: validate grid is actually a 2D array before passing to D2Array
      const safeGrid = Array.isArray(grid) && Array.isArray(grid[0]) ? grid : [];
      return { type: 'matrix', usedKeys, props: { value: safeGrid, pointers } };
    }

    // 4. Linked List Detection
    const llKey = keys.find(k => k.startsWith('ll_') || k === 'head');
    if (llKey) {
      const llData = vars[llKey]?.value;
      const pointers: { name: string, nodeId: string }[] = [];
      const usedKeys = [llKey];

      ['head', 'tail', 'curr', 'prev', 'next', 'slow', 'fast'].forEach(ptrName => {
        const matchedKey = keys.find(k => k === ptrName || k.endsWith(`_${ptrName}`));
        if (matchedKey && vars[matchedKey]?.value !== undefined && vars[matchedKey]?.value !== null) {
          pointers.push({ name: ptrName, nodeId: String(vars[matchedKey].value) });
          usedKeys.push(matchedKey);
        }
      });
      return { type: 'linkedlist', usedKeys, props: { nodes: Array.isArray(llData) ? llData : [], pointers } };
    }

    // 5. Queue Detection
    const queueKey = keys.find(k => k.startsWith('q_') || k.startsWith('queue') || k.startsWith('deque'));
    if (queueKey) {
      const qVar = vars[queueKey]?.value;
      const pointers: { name: string, index: number }[] = [];
      const usedKeys = [queueKey];

      ['front', 'back', 'rear', 'head', 'tail', 'curr'].forEach(ptrName => {
        const matchedKey = keys.find(k => k === ptrName || k.endsWith(`_${ptrName}`) || k.startsWith(`ptr_${ptrName}`));
        if (matchedKey && vars[matchedKey]?.value !== undefined) {
          pointers.push({ name: ptrName, index: vars[matchedKey].value });
          usedKeys.push(matchedKey);
        }
      });
      return { type: 'queue', usedKeys, props: { value: qVar, pointers } };
    }

    // 6. Stack Detection
    const stackKey = keys.find(k => k.startsWith('st_') || k.startsWith('stack'));
    if (stackKey) {
      const stVar = vars[stackKey]?.value;
      const pointers: { name: string, index: number }[] = [];
      const usedKeys = [stackKey];

      ['top', 'peek', 'curr'].forEach(ptrName => {
        const matchedKey = keys.find(k => k === ptrName || k.endsWith(`_${ptrName}`) || k.startsWith(`ptr_${ptrName}`));
        if (matchedKey && vars[matchedKey]?.value !== undefined) {
          pointers.push({ name: ptrName, index: vars[matchedKey].value });
          usedKeys.push(matchedKey);
        }
      });
      return { type: 'stack', usedKeys, props: { value: stVar, pointers } };
    }

    // 7. Array Detection
    const arrayKey = keys.find(k => k.startsWith('arr') || k.startsWith('vec') || k.startsWith('num') || k.startsWith('seq'));
    if (arrayKey) {
      const arr = vars[arrayKey]?.value;
      const pointers: { name: string, index: number }[] = [];
      const usedKeys = [arrayKey];

      ['i', 'j', 'k', 'left', 'right', 'mid', 'curr', 'ptr'].forEach(ptrName => {
        const matchedKey = keys.find(k => k === ptrName || k.endsWith(`_${ptrName}`) || k.startsWith(`ptr_${ptrName}`));
        if (matchedKey && vars[matchedKey]?.value !== undefined) {
          pointers.push({ name: ptrName, index: vars[matchedKey].value });
          usedKeys.push(matchedKey);
        }
      });
      return { type: 'array', usedKeys, props: { value: arr, pointers } };
    }

    return { type: 'none', usedKeys: [], props: {} };
  }, [vars]);

  // Exclude primary visualizer variables from the memory cards so they don't duplicate
  const stageComplexVars = useMemo(() => {
    return complexVars.filter(v => !canvasData.usedKeys.includes(v.id));
  }, [complexVars, canvasData.usedKeys]);

  // ─── DRAG & DROP LOGIC (Resizing Panes) ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingDiv) return;
      if (draggingDiv === 'h' && mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 768;
        let newPercentage = isDesktop ? ((e.clientX - rect.left) / rect.width) * 100 : ((e.clientY - rect.top) / rect.height) * 100;
        setHSplit(Math.max(25, Math.min(newPercentage, 75)));
      } else if (draggingDiv === 'v' && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        let newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
        setVSplit(Math.max(15, Math.min(newPercentage, 85)));
      }
    };
    const handleMouseUp = () => setDraggingDiv(null);
    if (draggingDiv) {
      document.addEventListener('mousemove', handleMouseMove); document.addEventListener('mouseup', handleMouseUp); document.body.style.userSelect = 'none';
    } else { document.body.style.userSelect = ''; }
    return () => { document.removeEventListener('mousemove', handleMouseMove); document.removeEventListener('mouseup', handleMouseUp); };
  }, [draggingDiv]);

  const [memoryOrder, setMemoryOrder] = useState<string[]>([]);
  useEffect(() => {
    setMemoryOrder(prev => {
      const newOrder = [...prev];
      stageComplexVars.forEach(v => { if (!newOrder.includes(v.id)) newOrder.push(v.id); });
      return newOrder.filter(id => stageComplexVars.some(v => v.id === id));
    });
  }, [stageComplexVars.length]);

  const handleMemoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMemoryOrder((items) => arrayMove(items, items.indexOf(active.id as string), items.indexOf(over.id as string)));
    }
  };

  // ─── RENDERERS ───
  if (lang !== "C++") {
    return (
      <div className="w-full">
        <div className="flex items-start gap-2 rounded-sm border border-cyan-500/25 bg-cyan-500/8 px-2.5 py-2 shadow-sm">
          <InfoIcon size={16} className="text-cyan-400 shrink-0 mt-px" strokeWidth={2.2} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-cyan-300 leading-tight">Visualization unavailable</p>
            <p className="text-[10px] text-muted leading-tight mt-0.5">Currently supported only for C++.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-2 text-center bg-bg">
        <div className="bg-failure/10 border border-failure/40 p-4 rounded-sm max-w-md w-full shadow-lg flex flex-col gap-3">
           <h3 className="text-failure font-bold text-sm flex items-center justify-center gap-1"><Activity size={16}/> Engine Crash</h3>
           <div className="bg-bg/50 p-2 rounded border border-failure/20 overflow-auto max-h-32">
             <p className="text-[10px] text-failure font-mono text-left">{error}</p>
           </div>
           <button onClick={handleResetError} className="self-center flex items-center gap-1 px-3 py-1.5 bg-surface border border-border hover:bg-surface-2 text-text text-[11px] rounded-sm transition-colors">
             <RefreshCw size={12}/> Dismiss & Reset
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-text font-display gap-1 overflow-hidden pb-1">
      
      {/* ─── LIVE HEADER ─── */}
      <div className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-sm px-2 py-1 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-mono text-muted uppercase tracking-wider">Status</span>
          <code className="bg-bg px-1.5 py-0.5 rounded-sm border border-border text-accent-3 font-bold">
            {currentSnapshot?.state?.callStack?.[currentSnapshot.state.callStack.length - 1] || 'Idle()'}
          </code>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-mono text-muted uppercase tracking-wider flex items-center gap-1"><Activity size={10} className="text-accent"/> Event</span>
          <code className="bg-bg px-1.5 py-0.5 rounded-sm border border-border text-text font-bold">
             {currentEvent.type} {currentEvent.payload?.variable ? `'${currentEvent.payload.variable}'` : currentEvent.payload?.function ? `${currentEvent.payload.function}()` : ''}
          </code>
        </div>
      </div>

      {/* ─── MAIN IDE LAYOUT ─── */}
      <div ref={mainContainerRef} className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 gap-1">
        
        {/* LEFT PANE: Visual Canvas */}
        <div style={{ flex: `${hSplit} 1 0%` }} className="shrink-0 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden relative">
          <div className="bg-surface-2/50 border-b border-border px-2 py-1 flex items-center shrink-0">
             <h4 className="text-[9px] uppercase tracking-widest text-accent font-bold">
               Stage {canvasData.type !== 'none' ? `(${canvasData.type})` : ''}
             </h4>
          </div>
          
          {/* Main Layout Area */}
          <div className="flex-1 flex flex-col items-center justify-center overflow-auto styled-scrollbar relative p-2">
            
            {/* 1. Primary Visualizer */}
            {canvasData.type !== 'none' && (
              <div className="w-full flex-1 min-h-[250px] flex items-center justify-center mb-2">
                {canvasData.type === 'graph' && <Graph {...(canvasData.props as any)} />}
                {canvasData.type === 'matrix' && <D2Array {...(canvasData.props as any)} />}
                {canvasData.type === 'array' && <D1Array {...(canvasData.props as any)} />}
                {canvasData.type === 'linkedlist' && <LinkedList {...(canvasData.props as any)} />}
                {canvasData.type === 'queue' && <Queue {...(canvasData.props as any)} />}
                {canvasData.type === 'stack' && <Stack {...(canvasData.props as any)} />}
                {canvasData.type === 'tree' && <Tree {...(canvasData.props as any)} />}
              </div>
            )}
            
            {canvasData.type === 'none' && stageComplexVars.length === 0 && (
              <div className="text-muted text-[10px] font-mono opacity-50 flex flex-col items-center gap-1">
                <span>No active data structures detected.</span>
              </div>
            )}

            {/* 2. Secondary Complex Memory Cards (Bottom of Stage) */}
            {stageComplexVars.length > 0 && (
              <div className={`w-full flex flex-wrap gap-2 content-start pt-2 ${canvasData.type !== 'none' ? 'border-t border-border/50' : 'h-full'}`}>
                <DndContext collisionDetection={closestCenter} onDragEnd={handleMemoryDragEnd}>
                  <SortableContext items={memoryOrder} strategy={rectSortingStrategy}>
                    {memoryOrder.map((id) => {
                      const variable = stageComplexVars.find(v => v.id === id);
                      if (!variable) return null;
                      return <SortableMemoryCard key={variable.id} id={variable.id} label={variable.label} value={variable.value} />;
                    })}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </div>

        {/* H-Divider */}
        <div onMouseDown={() => setDraggingDiv('h')} className="flex items-center justify-center w-2 cursor-col-resize z-10 shrink-0 hover:bg-surface-2 transition-colors">
          <div className="w-[2px] h-12 rounded-full bg-border" />
        </div>

        {/* RIGHT PANE: Inspectors */}
        <div ref={rightPanelRef} style={{ flex: `${100 - hSplit} 1 0%` }} className="flex flex-col overflow-hidden min-h-0 shrink-0 gap-1">
          
          {/* Top Right: Call Stack */}
          <div style={{ flex: `${vSplit} 1 0%` }} className="w-full flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden min-h-[80px]">
            <div className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0">
               <h4 className="text-[9px] uppercase tracking-widest text-muted font-semibold">Call Stack</h4>
            </div>
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-1 flex flex-col gap-1 p-1.5">
              {currentSnapshot?.state?.callStack?.slice().reverse().map((frame: string, idx: number) => {
                const isTop = idx === 0;
                return (
                  <div key={idx} className={`px-2 py-1 rounded-sm border shadow-sm text-[9px] font-mono flex items-center justify-between
                    ${isTop ? 'border-accent-3 bg-accent-3/10 glow-accent text-accent-3 font-bold' : 'border-border bg-surface text-muted opacity-70'}
                  `}>
                    <span>{frame}()</span>
                    {isTop && <span className="text-[8px] bg-bg px-1 border border-border rounded">Active</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* V-Divider */}
          <div onMouseDown={() => setDraggingDiv('v')} className="flex items-center justify-center h-2 cursor-row-resize z-10 shrink-0 hover:bg-surface-2 transition-colors">
            <div className="h-[2px] w-12 rounded-full bg-border" />
          </div>

          {/* Bottom Right: Variables & Output container */}
          <div style={{ flex: `${100 - vSplit} 1 0%` }} className="w-full flex flex-col gap-1 overflow-hidden min-h-[120px]">
            
            {/* Variables Overview */}
            <div className="flex-1 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden">
              <div className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0">
                <h4 className="text-[9px] uppercase tracking-widest text-muted font-semibold">Variables</h4>
              </div>
              <div className="flex-1 overflow-y-auto styled-scrollbar p-1">
                <div className="flex flex-col gap-px">
                  {overviewVars.length === 0 && <span className="text-[9px] text-muted font-mono p-1">No locals.</span>}
                  {overviewVars.map((v) => (
                    <div key={v.id} className={`flex items-center justify-between px-1.5 py-1 text-[10px] font-mono rounded-sm border border-transparent transition-colors ${v.opStyle}`}>
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <span className="text-accent-2 opacity-80 text-[8px] uppercase shrink-0">{v.type}</span>
                        <span className="font-bold shrink-0">{v.name}</span>
                        <span className="opacity-50 shrink-0">=</span>
                        <span className="text-accent-3 font-bold truncate max-w-[100px]">{v.value}</span>
                      </div>
                      <span className="text-[8px] text-muted opacity-50 shrink-0 ml-1">in {v.func}()</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Console Output Terminal */}
            <div className="h-28 shrink-0 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden">
              <div className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center gap-1">
                <Terminal size={10} className="text-muted" />
                <h4 className="text-[9px] uppercase tracking-widest text-muted font-semibold">Console Output</h4>
              </div>
              <div ref={outputRef} className="flex-1 overflow-y-auto styled-scrollbar p-2 font-mono text-[10px] text-text whitespace-pre-wrap">
                {consoleOutput || <span className="text-muted opacity-50 italic">No output...</span>}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ─── CONTROLS BAR ─── */}
      <div className="w-full bg-surface-2 border border-border rounded-sm p-1.5 flex flex-col gap-1.5 shrink-0 mt-auto shadow-sm">
        <div className="flex items-center gap-2 w-full px-1">
          <span className="text-[9px] font-mono text-muted whitespace-nowrap min-w-[35px]">
            {snapshots.length > 0 ? currentStep + 1 : 0} / {snapshots.length}
          </span>
          <div className="flex-1 h-1 bg-bg rounded-full overflow-hidden border border-border relative">
            <div 
              className="absolute left-0 top-0 h-full bg-accent transition-all duration-300"
              style={{ width: snapshots.length > 1 ? `${((currentStep) / (snapshots.length - 1)) * 100}%` : '0%' }}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-1">
            <button onClick={() => { setIsPlaying(false); setCurrentStep(0); }} disabled={snapshots.length === 0} title="Restart Visualization" className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent disabled:opacity-50 rounded-sm text-text transition-all">
              <RotateCcw size={10} />
            </button>
            <button onClick={handleSimulate} disabled={isCompiling} title="Compile & Simulate" className={`px-2 py-1 text-white border border-transparent rounded-sm text-[9px] font-bold transition-all shadow-sm flex items-center gap-1 ${isCompiling ? 'bg-accent/50 cursor-not-allowed' : 'bg-accent hover:bg-accent-2'}`}>
              {isCompiling ? <RefreshCw size={10} className="animate-spin"/> : <Play size={10} fill="currentColor"/>}
              {isCompiling ? 'Compiling' : 'Simulate'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button disabled={currentStep === 0 || snapshots.length === 0} onClick={() => { setIsPlaying(false); setCurrentStep(s => Math.max(0, s - 1)); }} className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded-sm disabled:opacity-50 transition-colors">
              <SkipBack size={10} fill="currentColor" />
            </button>
            <button disabled={snapshots.length === 0} onClick={() => setIsPlaying(!isPlaying)} className={`p-1.5 rounded-sm text-white transition-all shadow-md disabled:opacity-50 ${isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-success hover:bg-emerald-500'}`}>
              {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
            </button>
            <button disabled={currentStep >= snapshots.length - 1 || snapshots.length === 0} onClick={() => { setIsPlaying(false); setCurrentStep(s => Math.min(snapshots.length - 1, s + 1)); }} className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded-sm disabled:opacity-50 transition-colors">
              <SkipForward size={10} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input type="range" className="w-12 accent-accent h-1 bg-border rounded cursor-pointer" onChange={(e) => setSpeed(parseFloat(e.target.value))} min={0.25} max={5} value={speed} step={0.25} />
            <span className="text-[9px] text-accent font-mono w-5">{speed}x</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default VisualGround;