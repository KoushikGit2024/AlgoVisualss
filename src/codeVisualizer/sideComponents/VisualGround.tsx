import React, { useState, useRef, useEffect, useMemo } from 'react';
// The ?worker flag is Vite's magic syntax to bundle this as a background thread!
import EngineWorker from '../../lib/engine.worker?worker';
import {
  InfoIcon,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RefreshCw,
  Activity,
  Terminal,
  Cpu,
  ChevronDown,
  ChevronRight,
  // PanelRightClose,
  PanelRightOpen
} from 'lucide-react';

import Graph from '../dataStructures/Graph';
import D1Array from '../dataStructures/D1Array';
import D2Array from '../dataStructures/D2Array';
import LinkedList from '../dataStructures/LinkedList';
import Queue from '../dataStructures/Queue';
import Stack from '../dataStructures/Stack';
import Tree from '../dataStructures/Tree';
import TrieTree from '../dataStructures/TrieTree';
import { MapVisualizer } from '../dataStructures/MapVisualizer';
import StringVisualizer from '../dataStructures/StringVisualizer';
import BitsetVisualizer from '../dataStructures/BitsetVisualizer';
import ScalarVisualizer from '../dataStructures/ScalarVisualizer';
import { DraggableWindow, type WindowState } from './DraggableWindow';
import { detectVisualizer, deepUnwrap, type CanvasState } from './detectVisualizer';
import { cn } from '../../lib/utils';

const VisualGround = ({
  code,
  lang,
  setHighlightLine,
}: {
  code: string;
  lang: string;
  setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [speed, setSpeed] = useState<number>(100);
  const [error, setError] = useState<string | null>(null);

  const [hSplit, setHSplit] = useState<number>(65);
  const [vSplit, setVSplit] = useState<number>(30);
  const [draggingDiv, setDraggingDiv] = useState<'v' | 'h' | null>(null);

  const [isCallStackCollapsed, setIsCallStackCollapsed] = useState(false);
  const [isVariablesCollapsed, setIsVariablesCollapsed] = useState(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);
  const [expandedVars, setExpandedVars] = useState<Set<string>>(new Set());

  const toggleVarExpand = (id: string) => {
    const newSet = new Set(expandedVars);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedVars(newSet);
  };

  const isRightPanelCollapsed = isCallStackCollapsed && isVariablesCollapsed && isConsoleCollapsed;

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const layoutAreaRef = useRef<HTMLDivElement>(null);

  // ─── WINDOW MANAGER STATE ───
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});
  const globalZRef = useRef(20);

  const updateWindow = (id: string, partial: Partial<WindowState>) => {
    setWindowStates((prev) => {
      const curr = prev[id] || {
        isMinimized: false,
        isMaximized: false,
        snap: 'none',
        zIndex: globalZRef.current,
      };
      return { ...prev, [id]: { ...curr, ...partial } };
    });
  };

  const bringToFront = (id: string) => {
    globalZRef.current += 1;
    updateWindow(id, { zIndex: globalZRef.current });
  };

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  // ─── RESET ON CODE CHANGE ───
  useEffect(() => {
    setSnapshots([]);
    setCurrentStep(0);
    setIsPlaying(false);
    setError(null);
    setWindowStates({});
  }, [code]);

  const handleSimulate = () => {
    if (lang !== 'c++') return;

    // Kill any existing worker
    if (workerRef.current) workerRef.current.terminate();

    setIsCompiling(true);
    setError(null);
    setIsPlaying(false);
    setSnapshots([]);

    // FIX 7 ─ Reset window layout on every new simulation.
    // Without this, stale WindowState entries from the previous run linger
    // and the initial-layout logic (which triggers on first-seen keys) never
    // fires again for data structures that appeared in the previous run.
    setWindowStates({});
    globalZRef.current = 20;

    const worker = new EngineWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      const { success, snapshots, error } = e.data;
      if (success) {
        console.log(`[Main] Received ${snapshots.length} snapshots`);
        setSnapshots(snapshots);
        setCurrentStep(0);
      } else {
        console.error('FATAL ENGINE CRASH:', error);
        setError(error || 'Compilation Failed. Check syntax or engine limits.');
      }
      setIsCompiling(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = (err) => {
      console.error('Worker Thread Error:', err);
      setError('A fatal worker error occurred (Out of Memory / Timeout).');
      setIsCompiling(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ sourceCode: code });
  };

  const handleResetError = () => {
    setError(null);
    setIsCompiling(false);
    setSnapshots([]);
  };

  // ─── KEYBOARD CONTROLS ───
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if user is typing in an input, textarea, or the Monaco Editor
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        activeEl?.isContentEditable ||
        activeEl?.closest('.monaco-editor') ||
        activeEl?.closest('.monaco-mouse-cursor-text')
      ) {
        return;
      }

      if (snapshots.length === 0) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep((s) => Math.min(snapshots.length - 1, s + 1));
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep((s) => Math.max(0, s - 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [snapshots.length]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentStep < snapshots.length - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
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

  // ─── STATE EXTRACTION ───
  const currentSnapshot = snapshots[currentStep] || null;
  const rawVars = currentSnapshot?.state?.variables || {};
  const currentEvent = currentSnapshot?.event || { type: 'IDLE', payload: {} };
  const activeFunction =
    currentSnapshot?.state?.callStack?.[currentSnapshot.state.callStack.length - 1] || 'global';

  const vars = useMemo(() => {
    const clean: Record<string, any> = {};
    for (const [key, variable] of Object.entries(rawVars)) {
      clean[key] = { ...(variable as any), value: deepUnwrap((variable as any).value) };
    }
    return clean;
  }, [rawVars]);

  const overviewVars: any[] = [];

  Object.entries(vars).forEach(([name, data]: [string, any]) => {
    const val = data.value;
    const isTarget = currentEvent.payload?.variable === name;
    let opStyle = 'text-text';

    if (isTarget) {
      if (currentEvent.type === 'WRITE')
        opStyle = 'bg-success/20 text-success border-success/30 font-bold';
      else if (currentEvent.type === 'READ')
        opStyle = 'bg-accent/20 text-accent border-accent/30 font-bold';
    }

    const formatVariableValue = (v: any): string => {
      if (v === null) return 'null';
      if (v === undefined) return 'undefined';
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) {
          return '[' + v.map(item => formatVariableValue(item)).join(', ') + ']';
      }
      if (typeof v === 'object') {
          if (v.__type === 'container' && Array.isArray(v.data)) {
              return '[' + v.data.map((item: any) => formatVariableValue(item)).join(', ') + ']';
          }
          let typeName = v.__type || '';
          let props: string[] = [];
          for (let [k, propVal] of Object.entries(v)) {
              if (k.startsWith('__')) continue;
              if (typeof propVal === 'string' && propVal.startsWith('&')) continue;
              if (propVal === null && (k === 'left' || k === 'right' || k === 'next')) continue;
              props.push(k + ': ' + formatVariableValue(propVal));
          }
          let content = props.length > 0 ? '{ ' + props.join(', ') + ' }' : '{}';
          return typeName ? typeName + ' ' + content : content;
      }
      return String(v);
    };

    let displayValue = formatVariableValue(val);

    overviewVars.push({
      id: name,
      type: data.type,
      name,
      value: displayValue,
      opStyle,
      func: activeFunction,
    });
  });

  // ─── TERMINAL OUTPUT ───
  const consoleOutput = useMemo(() => {
    let out = '';
    for (let i = 0; i <= currentStep; i++) {
      if (snapshots[i]?.event?.type === 'WRITE' && snapshots[i].event.payload?.output) {
        out += snapshots[i].event.payload.output;
      }
    }
    return out;
  }, [snapshots, currentStep]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [consoleOutput]);

  // ─── VISUALIZER DETECTION ───
  const canvasStates: CanvasState[] = useMemo(() => detectVisualizer(vars, currentEvent), [vars, currentEvent]);

  const groupedStates = useMemo(() => {
    const groups: Record<string, CanvasState[]> = {};
    canvasStates.forEach((state) => {
      if (state.type === 'none') return;
      if (!groups[state.type]) groups[state.type] = [];
      groups[state.type].push(state);
    });
    return groups;
  }, [canvasStates]);

  // ─── WINDOW LAYOUT INITIALISATION ───
  // FIX 8 ─ Replaced the `initializedLayout` boolean flag with a smarter
  // effect that handles two distinct cases:
  //
  //   Case A — First appearance (windowStates is empty):
  //     Apply the "opinionated" initial tiling: maximise for 1 window,
  //     snap-left / snap-right for 2 windows, free-float for 3+.
  //
  //   Case B — New key discovered mid-simulation (e.g., a graph only appears
  //     at step 40 when the variable comes into scope):
  //     Give it a free-floating position without touching existing windows.
  //
  // The old `initializedLayout = true` flag caused Case B windows to never
  // receive an initial WindowState at all, making them invisible.
  useEffect(() => {
    const keys = Object.keys(groupedStates);
    if (keys.length === 0) return;

    setWindowStates((prev) => {
      const newKeys = keys.filter((k) => !prev[k]);
      if (newKeys.length === 0) return prev; // Nothing to do

      const isFirstBatch = Object.keys(prev).length === 0;
      const next = { ...prev };
      let z = globalZRef.current;

      if (isFirstBatch) {
        // Case A: full initial layout
        keys.forEach((key, idx) => {
          z += 1;
          if (keys.length === 1) {
            // Scalars stay small in the corner even when alone
            if (key === 'scalar') {
              next[key] = { isMinimized: false, isMaximized: false, snap: 'none', zIndex: z };
            } else {
              next[key] = { isMinimized: false, isMaximized: true, snap: 'none', zIndex: z };
            }

          } else if (keys.length === 2) {
            next[key] = {
              isMinimized: false,
              isMaximized: false,
              // If one of the two is a scalar, give it corner treatment
              snap: key === 'scalar' ? 'none' : (idx === 0 ? 'left' : 'right'),
              zIndex: z,
            };
          } else {
            // FIX 9 ─ Stagger diagonally in small steps so windows never
            // spawn off-screen (old code used idx * 360px which pushed the
            // 3rd window to x=720 — off-screen on most monitors).
            next[key] = { isMinimized: false, isMaximized: false, snap: 'none', zIndex: z };
          }
        });
      } else {
        // Case B: new key appeared mid-simulation → free-floating, no snap
        newKeys.forEach((key) => {
          z += 1;
          next[key] = { isMinimized: false, isMaximized: false, snap: 'none', zIndex: z };
        });
      }

      globalZRef.current = z;
      return next;
    });
  }, [groupedStates]);

  // ─── PANE DRAG / RESIZE ───
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingDiv) return;
      if (draggingDiv === 'h' && mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 768;
        const raw = isDesktop
          ? ((e.clientX - rect.left) / rect.width) * 100
          : ((e.clientY - rect.top) / rect.height) * 100;
        setHSplit(Math.max(25, Math.min(raw, 75)));
      } else if (draggingDiv === 'v' && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const raw = ((e.clientY - rect.top) / rect.height) * 100;
        setVSplit(Math.max(15, Math.min(raw, 85)));
      }
    };
    const handleMouseUp = () => setDraggingDiv(null);
    if (draggingDiv) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingDiv]);

  // ─── EARLY RETURNS ───
  if (lang !== 'c++') {
    return (
      <div className="w-full">
        <div className="flex items-start gap-2 rounded-sm border border-cyan-500/25 bg-cyan-500/8 px-2.5 py-2 shadow-sm">
          <InfoIcon size={16} className="text-cyan-400 shrink-0 mt-px" strokeWidth={2.2} />
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-cyan-300 leading-tight">
              Visualization unavailable
            </p>
            <p className="text-[10px] text-muted leading-tight mt-0.5">
              Currently supported only for C++.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-2 text-center bg-bg">
        <div className="bg-failure/10 border border-failure/40 p-4 rounded-sm max-w-md w-full shadow-lg flex flex-col gap-3">
          <h3 className="text-failure font-bold text-sm flex items-center justify-center gap-1">
            <Cpu size={16} /> Engine Crash
          </h3>
          <div className="bg-bg/50 p-2 rounded border border-failure/20 overflow-auto max-h-32">
            <p className="text-[10px] text-failure font-mono text-left">{error}</p>
          </div>
          <button
            onClick={handleResetError}
            className="self-center flex items-center gap-1 px-3 py-1.5 bg-surface border border-border hover:bg-surface-2 text-text text-[11px] rounded-sm transition-colors"
          >
            <RefreshCw size={12} /> Dismiss & Reset
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ───
  return (
    <div className="flex flex-col h-full w-full text-text font-display gap-0 overflow-hidden pb-1">

      {/* ─── LIVE HEADER ─── */}
      <div className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-sm px-2 py-1 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-mono text-muted uppercase tracking-wider">Status</span>
          <code className="bg-bg px-1.5 py-0.5 rounded-sm border border-border text-accent-3 font-bold">
            {currentSnapshot?.state?.callStack?.[
              currentSnapshot.state.callStack.length - 1
            ] || 'Idle()'}
          </code>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="font-mono text-muted uppercase tracking-wider flex items-center gap-1">
            <Activity size={10} className="text-accent" /> Event
          </span>
          <code className="bg-bg px-1.5 py-0.5 rounded-sm border border-border text-text font-bold">
            {currentEvent.type}{' '}
            {currentEvent.payload?.variable
              ? `'${currentEvent.payload.variable}'`
              : currentEvent.payload?.function
              ? `${currentEvent.payload.function}()`
              : ''}
          </code>
        </div>
      </div>

      {/* ─── MAIN IDE LAYOUT ─── */}
      <div
        ref={mainContainerRef}
        className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 gap-0"
      >
        {/* LEFT PANE: Visual Canvas */}
        <div
          style={{ flex: `${hSplit} 1 0%` }}
          className="shrink-0 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden relative"
        >
          <div className="bg-surface-2/50 border-b border-border px-2 py-1 flex items-center shrink-0">
            <h4 className="text-[9px] uppercase tracking-widest text-accent font-bold">Stage</h4>
          </div>

          {/* Layout Area — this is the DraggableWindow parent */}
          <div
            ref={layoutAreaRef}
            className="flex-1 overflow-auto styled-scrollbar relative p-0"
            style={{ perspective: '1000px' }}
          >
            {Object.keys(groupedStates).length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted text-[10px] font-mono opacity-50 flex-col gap-1">
                <span>No active data structures detected.</span>
              </div>
            )}

            {Object.entries(groupedStates).map(([type, states], idx) => {
              const ws = windowStates[type] || {
                isMinimized: false,
                isMaximized: false,
                snap: 'none' as const,
                zIndex: 20,
              };

              // FIX 9 (continued) ─ Small diagonal stagger so the 3rd, 4th…
              // windows never spawn off-screen. Each is offset by 40px from
              // the previous one, capped at 4 positions with modulo.
              const defaultX = (idx % 4) * 40 + 20;
              const defaultY = (idx % 4) * 40 + 20;
              // Scalars: pin to bottom-right corner
              const isScalar    = type === 'scalar';

              return (
                <DraggableWindow
                  key={type}
                  id={type}
                  title={`${type}s`}
                  defaultPosition={{ x: isScalar ? 0 : defaultX, y: isScalar ? 0 : defaultY }}
                  defaultSize={isScalar ? { width: 250, minWidth: 150, height: 150, minHeight: 100 } : undefined}
                  cornerAnchor={isScalar ? 'bottom-right' : undefined}
                  windowState={ws}
                  updateWindow={(partial) => updateWindow(type, partial)}
                  bringToFront={() => bringToFront(type)}
                  parentRef={layoutAreaRef}
                >
                  <div className={cn(`flex flex-wrap gap-4 items-center justify-center p-2 ${isScalar ? '' : 'min-w-[40px] min-h-[150px]'}`)}>
                    {states.map((state) => (
                      <div
                        key={state.id}
                        className="flex flex-col items-center gap-1 border border-border/50 bg-bg p-2 rounded"
                      >
                        <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                          {state.id}
                        </span>
                        <div className="flex-1 flex items-center justify-center">
                          {state.type === 'graph'      && <Graph       {...(state.props as any)} />}
                          {state.type === 'matrix'     && <D2Array     {...(state.props as any)} />}
                          {state.type === 'array'      && <D1Array     {...(state.props as any)} />}
                          {state.type === 'linkedlist' && <LinkedList  {...(state.props as any)} />}
                          {state.type === 'queue'      && <Queue       {...(state.props as any)} />}
                          {state.type === 'stack'      && <Stack       {...(state.props as any)} />}
                          {state.type === 'tree'       && <Tree        {...(state.props as any)} />}
                          {state.type === 'trie'       && <TrieTree    {...(state.props as any)} />}
                          {state.type === 'map'        && <MapVisualizer {...(state.props as any)} />}
                          {state.type === 'string'     && <StringVisualizer {...(state.props as any)} />}
                          {state.type === 'bitset'     && <BitsetVisualizer {...(state.props as any)} />}
                          {state.type === 'scalar'     && <ScalarVisualizer {...(state.props as any)} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </DraggableWindow>
              );
            })}
          </div>

          {/* ─── TASKBAR ─── */}
          <div className="w-full bg-surface-2 border-t border-border px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-inner z-50 min-h-[36px]">
            {Object.keys(groupedStates).map((type) => {
              const ws = windowStates[type] || { isMinimized: false, zIndex: 20 };
              const isActive = !ws.isMinimized && ws.zIndex === globalZRef.current;

              return (
                <button
                  key={type}
                  onClick={() => {
                    if (!ws.isMinimized && isActive) {
                      updateWindow(type, { isMinimized: true });
                    } else {
                      updateWindow(type, { isMinimized: false });
                      bringToFront(type);
                    }
                  }}
                  className={cn(`px-3 py-1 border rounded-sm text-[10px] font-bold transition-all flex items-center gap-1.5 min-w-[80px] max-w-[150px] truncate justify-center hover:-translate-y-px active:translate-y-0
                    ${
                      isActive
                        ? 'bg-surface-3 border-accent/50 text-accent shadow-sm'
                        : ws.isMinimized
                        ? 'bg-bg border-border text-muted hover:bg-surface opacity-70'
                        : 'bg-surface border-border text-text hover:bg-surface-2'
                    }`)}
                >
                  {type}s
                </button>
              );
            })}
            {Object.keys(groupedStates).length === 0 && (
              <span className="text-[10px] text-muted opacity-50 font-mono italic">
                No windows open
              </span>
            )}
          </div>
        </div>

        {/* H-Divider */}
        {!isRightPanelCollapsed && (
        <div
          onMouseDown={() => setDraggingDiv('h')}
          className="flex items-center justify-center w-1 cursor-col-resize z-10 shrink-0 hover:bg-surface-2 transition-colors"
        >
          <div className="w-[1px] h-12 rounded-full bg-border" />
        </div>
        )}

        {/* RIGHT PANE: Inspectors */}
        {isRightPanelCollapsed ? (
           <div className="flex flex-col items-center justify-start p-1 bg-surface-2 border-l border-border shrink-0 cursor-pointer hover:bg-surface-3 transition-colors z-10" onClick={() => { setIsCallStackCollapsed(false); setIsVariablesCollapsed(false); setIsConsoleCollapsed(false); }} title="Expand Inspectors">
             <PanelRightOpen size={14} className="text-muted mb-4" />
             <span className="text-[9px] font-semibold text-muted uppercase tracking-widest" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Inspectors</span>
           </div>
        ) : (
        <div
          ref={rightPanelRef}
          style={{ flex: `${100 - hSplit} 1 0%` }}
          className="flex flex-col overflow-hidden min-h-0 shrink-0 gap-1"
        >
          {/* Call Stack */}
          <div
            style={isCallStackCollapsed ? { flex: '0 0 auto' } : { flex: isVariablesCollapsed ? '1 1 0%' : `${vSplit} 1 0%` }}
            className={cn(`w-full flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden ${isCallStackCollapsed ? 'min-h-0' : 'min-h-[80px]'}`)}
          >
            <div className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center justify-between cursor-pointer hover:bg-surface-3" onClick={() => setIsCallStackCollapsed(!isCallStackCollapsed)}>
              <h4 className="text-[9px] uppercase tracking-widest text-muted font-semibold flex items-center gap-1">
                {isCallStackCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />} Call Stack
              </h4>
            </div>
            {!isCallStackCollapsed && (
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-1 flex flex-col gap-1 p-1.5">
              {currentSnapshot?.state?.callStack
                ?.slice()
                .reverse()
                .map((frame: string, idx: number) => {
                  const isTop = idx === 0;
                  return (
                    <div
                      key={idx}
                      className={cn(`px-2 py-1 rounded-sm border shadow-sm text-[9px] font-mono flex items-center justify-between
                        ${
                          isTop
                            ? 'border-accent-3 bg-accent-3/10  text-accent-3 font-bold'
                            : 'border-border bg-surface text-muted opacity-70'
                        }`)}
                    >
                      <span>{frame}()</span>
                      {isTop && (
                        <span className="text-[8px] bg-bg px-1 border border-border rounded">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
            </div>
            )}
          </div>

          {/* V-Divider */}
          {!isCallStackCollapsed && !isVariablesCollapsed && (
          <div
            onMouseDown={() => setDraggingDiv('v')}
            className="flex items-center justify-center h-1 cursor-row-resize z-10 shrink-0 hover:bg-surface-2 transition-colors my-[-2px]"
          >
            <div className="h-[1px] w-12 rounded-full bg-border" />
          </div>
          )}

          {/* Variables + Console */}
          <div
            style={isVariablesCollapsed ? { flex: '0 0 auto' } : { flex: isCallStackCollapsed ? '1 1 0%' : `${100 - vSplit} 1 0%` }}
            className={cn(`w-full flex flex-col gap-1 overflow-hidden ${isVariablesCollapsed ? 'min-h-0' : 'min-h-[120px]'}`)}
          >
            {/* Variables */}
            <div className="flex-1 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden">
              <div className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center justify-between cursor-pointer hover:bg-surface-3" onClick={() => setIsVariablesCollapsed(!isVariablesCollapsed)}>
                <h4 className="text-[9px] uppercase tracking-widest text-muted font-semibold flex items-center gap-1">
                  {isVariablesCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />} Variables
                </h4>
              </div>
              {!isVariablesCollapsed && (
              <div className="flex-1 overflow-y-auto styled-scrollbar p-1">
                <div className="flex flex-col gap-px">
                  {overviewVars.length === 0 && (
                    <span className="text-[9px] text-muted font-mono p-1">No locals.</span>
                  )}
                  {overviewVars.map((v) => {
                    const isExp = expandedVars.has(v.id);
                    let formattedVal = v.value;
                    try {
                       const parsed = JSON.parse(v.value);
                       formattedVal = JSON.stringify(parsed, null, 2);
                    } catch(e) {
                       let indent = 0;
                       let res = '';
                       for(let i=0; i<v.value.length; i++) {
                           const c = v.value[i];
                           if(c === '{' || c === '[') {
                               indent += 2;
                               res += c + '\n' + ' '.repeat(indent);
                           } else if(c === '}' || c === ']') {
                               indent = Math.max(0, indent - 2);
                               res += '\n' + ' '.repeat(indent) + c;
                           } else if(c === ',') {
                               res += ',\n' + ' '.repeat(indent);
                           } else {
                               res += c;
                           }
                       }
                       formattedVal = res;
                    }

                    return (
                    <div
                      key={v.id}
                      onClick={() => toggleVarExpand(v.id)}
                      className={cn(`flex flex-col px-1.5 py-1 text-[10px] font-mono rounded-sm border border-transparent transition-colors cursor-pointer hover:bg-surface-3 ${v.opStyle}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-muted shrink-0">{isExp ? <ChevronDown size={10} /> : <ChevronRight size={10} />}</span>
                          <span className="text-accent-2 opacity-80 text-[8px] uppercase shrink-0">
                            {v.type}
                          </span>
                          <span className="font-bold shrink-0">{v.name}</span>
                          <span className="opacity-50 shrink-0">=</span>
                          {!isExp && (
                            <span className="text-accent-3 font-bold truncate max-w-[150px]">
                              {v.value}
                            </span>
                          )}
                        </div>
                        <span className="text-[8px] text-muted opacity-50 shrink-0 ml-1">
                          in {v.func}()
                        </span>
                      </div>
                      {isExp && (
                        <div className="mt-1.5 w-full text-accent-3 font-bold whitespace-pre-wrap break-all bg-bg/80 p-2 rounded border border-border/50 h-auto overflow-visible shadow-inner">
                          {formattedVal}
                        </div>
                      )}
                    </div>
                  );})}
                </div>
              </div>
              )}
            </div>

            {/* Console Output */}
            <div className={cn(`shrink-0 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden ${isConsoleCollapsed ? 'min-h-0 h-auto' : 'h-28'}`)}>
              <div className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center justify-between cursor-pointer hover:bg-surface-3" onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}>
                <div className="flex items-center gap-1">
                  <Terminal size={10} className="text-muted" />
                  <h4 className="text-[9px] uppercase tracking-widest text-muted font-semibold flex items-center gap-1">
                    {isConsoleCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />} Console Output
                  </h4>
                </div>
              </div>
              {!isConsoleCollapsed && (
              <div
                ref={outputRef}
                className="flex-1 overflow-y-auto styled-scrollbar p-2 font-mono text-[10px] text-text whitespace-pre-wrap"
              >
                {consoleOutput || (
                  <span className="text-muted opacity-50 italic">No output...</span>
                )}
              </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ─── CONTROLS BAR ─── */}
      <div className="w-full bg-surface-2 border border-border rounded-sm p-1.5 flex flex-col gap-1.5 shrink-0 mt-auto shadow-sm">
        {/* Progress track */}
        <div className="flex items-center gap-2 w-full px-1">
          <span className="text-[9px] font-mono text-muted whitespace-nowrap min-w-[35px]">
            {snapshots.length > 0 ? currentStep + 1 : 0} / {snapshots.length}
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, snapshots.length - 1)}
            value={currentStep}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentStep(parseInt(e.target.value));
            }}
            disabled={snapshots.length === 0}
            className="flex-1 h-1 bg-bg rounded-full border border-border accent-accent cursor-pointer disabled:opacity-50"
          />
        </div>

        {/* Button row */}
        <div className="flex flex-wrap items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setIsPlaying(false); setCurrentStep(0); }}
              disabled={snapshots.length === 0}
              title="Restart Visualization"
              className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent disabled:opacity-50 rounded-sm text-text transition-all"
            >
              <RotateCcw size={10} />
            </button>
            <button
              onClick={handleSimulate}
              disabled={isCompiling}
              title="Compile & Simulate"
              className={cn(`px-2 py-1 text-white border border-transparent rounded-sm text-[9px] font-bold transition-all shadow-sm flex items-center gap-1 ${
                isCompiling ? 'bg-accent/50 cursor-not-allowed' : 'bg-accent hover:bg-accent-2'
              }`)}
            >
              {isCompiling ? (
                <RefreshCw size={10} className="animate-spin" />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
              {isCompiling ? 'Compiling' : 'Simulate'}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentStep === 0 || snapshots.length === 0}
              onClick={() => { setIsPlaying(false); setCurrentStep((s) => Math.max(0, s - 1)); }}
              className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded-sm disabled:opacity-50 transition-colors"
            >
              <SkipBack size={10} fill="currentColor" />
            </button>
            <button
              disabled={snapshots.length === 0}
              onClick={() => setIsPlaying(!isPlaying)}
              className={cn(`p-1.5 rounded-sm text-white transition-all shadow-md disabled:opacity-50 ${
                isPlaying ? 'bg-orange-500 hover:bg-orange-600' : 'bg-success hover:bg-emerald-500'
              }`)}
            >
              {isPlaying ? (
                <Pause size={10} fill="currentColor" />
              ) : (
                <Play size={10} fill="currentColor" />
              )}
            </button>
            <button
              disabled={currentStep >= snapshots.length - 1 || snapshots.length === 0}
              onClick={() => {
                setIsPlaying(false);
                setCurrentStep((s) => Math.min(snapshots.length - 1, s + 1));
              }}
              className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded-sm disabled:opacity-50 transition-colors"
            >
              <SkipForward size={10} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <input
              type="range"
              className="w-16 accent-accent h-1 bg-border rounded cursor-pointer"
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              min={1}
              max={1000}
              value={speed}
              step={1}
            />
            <div className="flex items-center">
              <input
                type="number"
                className="w-10 bg-transparent hover:bg-surface focus:bg-surface border border-transparent hover:border-border focus:border-accent text-[9px] text-accent font-mono rounded-sm px-1 py-0.5 text-right outline-none transition-all"
                style={{ WebkitAppearance: 'none', MozAppearance: 'textfield' }}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setSpeed(Math.min(1000, Math.max(1, val)));
                }}
                min={1}
                max={1000}
                value={speed}
              />
              <span className="text-[9px] text-accent font-mono pr-1">ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VisualGround);
