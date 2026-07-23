import React, { useState, useRef, useEffect, useMemo } from "react";
import { InfoIcon, Activity, Cpu, RefreshCw, PanelRightOpen } from "lucide-react";
import { detectVisualizer, type CanvasState } from "./detectVisualizer";
import { usePointerHistory } from "./hooks/usePointerHistory";
import { cn } from "../../lib/utils";

import { useEngineWorker } from "./hooks/useEngineWorker";
import { usePlayback } from "./hooks/usePlayback";
import { useVariableParser } from "./hooks/useVariableParser";
import { useWindowLayout } from "./hooks/useWindowLayout";

import { VisualizerWindows } from "./ui/VisualizerWindows";
import { VisualGroundToolbar } from "./ui/VisualGroundToolbar";
import { VisualGroundRightPanel } from "./ui/VisualGroundRightPanel";

const VisualGround = ({
  code,
  lang,
  setHighlightLine,
}: {
  code: string;
  lang: string;
  setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const {
    snapshots,
    isCompiling,
    error,
    handleSimulate,
    handleResetError,
  } = useEngineWorker({
    code,
    lang,
    onSimulationStart: () => {
      resetWindowStates();
    },
  });

  const {
    currentStep,
    setCurrentStep,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
  } = usePlayback({
    snapshotsLength: snapshots.length,
    code,
  });

  // UI state
  const [hSplit, setHSplit] = useState<number>(65);
  const [vSplit, setVSplit] = useState<number>(30);
  const [draggingDiv, setDraggingDiv] = useState<"v" | "h" | null>(null);

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

  const mainContainerRef = useRef<HTMLDivElement>(null!);
  const rightPanelRef = useRef<HTMLDivElement>(null!);
  const outputRef = useRef<HTMLDivElement>(null!);
  const layoutAreaRef = useRef<HTMLDivElement>(null!);

  // Sync highlight line
  useEffect(() => {
    if (snapshots.length > 0 && snapshots[currentStep]) {
      setHighlightLine(snapshots[currentStep].line || 0);
    }
  }, [currentStep, snapshots, setHighlightLine]);

  // Variables parsing
  const currentSnapshot = snapshots[currentStep] || null;
  const { vars, overviewVars, currentEvent, activeFunction } = useVariableParser(currentSnapshot);

  // Console output
  const consoleOutput = useMemo(() => {
    for (let i = currentStep; i >= 0; i--) {
      const snap = snapshots[i];
      if (snap?.state?.output !== undefined) return snap.state.output as string;
    }
    let out = "";
    for (let i = 0; i <= currentStep; i++) {
      if (snapshots[i]?.event?.type === "WRITE" && snapshots[i].event.payload?.output) {
        out += snapshots[i].event.payload.output;
      }
    }
    return out;
  }, [snapshots, currentStep]);

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [consoleOutput]);

  // Visualizer detection
  const pointerHistory = usePointerHistory(snapshots);
  const currentPointerContext = pointerHistory[currentStep] || {};
  const canvasStates: CanvasState[] = useMemo(
    () => detectVisualizer(vars, currentEvent, currentPointerContext),
    [vars, currentEvent, currentPointerContext],
  );

  const groupedStates = useMemo(() => {
    const groups: Record<string, CanvasState[]> = {};
    canvasStates.forEach((state) => {
      if (state.type === "none") return;
      if (!groups[state.type]) groups[state.type] = [];
      groups[state.type].push(state);
    });
    return groups;
  }, [canvasStates]);

  // Window layout
  const { windowStates, updateWindow, bringToFront, resetWindowStates, activeWindowId } = useWindowLayout(groupedStates);

  // Drag resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingDiv) return;
      if (draggingDiv === "h" && mainContainerRef.current) {
        const rect = mainContainerRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 768;
        const raw = isDesktop
          ? ((e.clientX - rect.left) / rect.width) * 100
          : ((e.clientY - rect.top) / rect.height) * 100;
        setHSplit(Math.max(25, Math.min(raw, 75)));
      } else if (draggingDiv === "v" && rightPanelRef.current) {
        const rect = rightPanelRef.current.getBoundingClientRect();
        const raw = ((e.clientY - rect.top) / rect.height) * 100;
        setVSplit(Math.max(15, Math.min(raw, 85)));
      }
    };
    const handleMouseUp = () => setDraggingDiv(null);
    if (draggingDiv) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "none";
    } else {
      document.body.style.userSelect = "";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingDiv]);

  // Early returns
  if (lang !== "c++") {
    return (
      <div className="w-full">
        <div className="flex items-start gap-2 rounded-sm border border-cyan-500/25 bg-cyan-500/8 px-2.5 py-2 shadow-sm">
          <InfoIcon size={16} className="text-cyan-400 shrink-0 mt-px" strokeWidth={2.2} />
          <div className="min-w-0">
            <p className="text-[calc(11rem/16)] font-medium text-cyan-300 leading-tight">
              Visualization unavailable
            </p>
            <p className="text-[calc(10rem/16)] text-muted leading-tight mt-0.5">
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
            <p className="text-[calc(10rem/16)] text-failure font-mono text-left">{error}</p>
          </div>
          <button
            onClick={handleResetError}
            className="self-center flex items-center gap-1 px-3 py-1.5 bg-surface border border-border hover:bg-surface-2 text-text text-[calc(11rem/16)] rounded-sm transition-colors"
          >
            <RefreshCw size={12} /> Dismiss & Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-text font-display gap-0 overflow-hidden pb-1">
      {/* ─── LIVE HEADER ─── */}
      <div className="w-full flex items-center justify-between bg-surface-2 border border-border rounded-sm px-2 py-1 shadow-sm shrink-0">
        <div className="flex items-center gap-1.5 text-[calc(10rem/16)]">
          <span className="font-mono text-muted uppercase tracking-wider">Status</span>
          <code className="bg-bg px-1.5 py-0.5 rounded-sm border border-border text-accent-3 font-bold">
            {activeFunction || "Idle()"}
          </code>
        </div>
        <div className="flex items-center gap-1.5 text-[calc(10rem/16)]">
          <span className="font-mono text-muted uppercase tracking-wider flex items-center gap-1">
            <Activity size={10} className="text-accent" /> Event
          </span>
          <code className="bg-bg px-1.5 py-0.5 rounded-sm border border-border text-text font-bold">
            {currentEvent.type}{" "}
            {currentEvent.payload?.variable
              ? `'${currentEvent.payload.variable}'`
              : currentEvent.payload?.function
                ? `${currentEvent.payload.function}()`
                : ""}
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
          <div
            ref={layoutAreaRef}
            className="flex-1 overflow-auto styled-scrollbar relative p-0"
            style={{ perspective: "1000px" }}
          >
            <VisualizerWindows
              groupedStates={groupedStates}
              windowStates={windowStates}
              updateWindow={updateWindow}
              bringToFront={bringToFront}
              layoutAreaRef={layoutAreaRef}
            />
          </div>

          {/* ─── TASKBAR ─── */}
          <div className="w-full bg-surface-2 border-t border-border px-2 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 shadow-inner z-50 min-h-[36px]">
            {Object.keys(groupedStates).map((type) => {
              const ws = windowStates[type] || { isMinimized: false, zIndex: 20 };
              const isActive = type === activeWindowId;

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
                  className={cn(`px-3 py-1 border rounded-sm text-[calc(10rem/16)] font-bold transition-all flex items-center gap-1.5 min-w-[80px] max-w-[150px] truncate justify-center hover:-translate-y-px active:translate-y-0
                    ${
                      isActive
                        ? "bg-surface-3 border-accent/50 text-accent shadow-sm"
                        : ws.isMinimized
                          ? "bg-bg border-border text-muted hover:bg-surface opacity-70"
                          : "bg-surface border-border text-text hover:bg-surface-2"
                    }`)}
                >
                  {type}s
                </button>
              );
            })}
            {Object.keys(groupedStates).length === 0 && (
              <span className="text-[calc(10rem/16)] text-muted opacity-50 font-mono italic">
                No windows open
              </span>
            )}
          </div>
        </div>

        {/* H-Divider */}
        {!isRightPanelCollapsed && (
          <div
            onMouseDown={() => setDraggingDiv("h")}
            className="flex items-center justify-center w-1 cursor-col-resize z-10 shrink-0 hover:bg-surface-2 transition-colors"
          >
            <div className="w-px h-12 rounded-full bg-border" />
          </div>
        )}

        {/* RIGHT PANE: Inspectors */}
        {isRightPanelCollapsed ? (
          <div
            className="flex flex-col items-center justify-start p-1 bg-surface-2 border-l border-border shrink-0 cursor-pointer hover:bg-surface-3 transition-colors z-10"
            onClick={() => {
              setIsCallStackCollapsed(false);
              setIsVariablesCollapsed(false);
              setIsConsoleCollapsed(false);
            }}
            title="Expand Inspectors"
          >
            <PanelRightOpen size={14} className="text-muted mb-4" />
            <span
              className="text-[calc(9rem/16)] font-semibold text-muted uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Inspectors
            </span>
          </div>
        ) : (
          <VisualGroundRightPanel
            currentSnapshot={currentSnapshot}
            overviewVars={overviewVars}
            consoleOutput={consoleOutput}
            isCallStackCollapsed={isCallStackCollapsed}
            setIsCallStackCollapsed={setIsCallStackCollapsed}
            isVariablesCollapsed={isVariablesCollapsed}
            setIsVariablesCollapsed={setIsVariablesCollapsed}
            isConsoleCollapsed={isConsoleCollapsed}
            setIsConsoleCollapsed={setIsConsoleCollapsed}
            expandedVars={expandedVars}
            toggleVarExpand={toggleVarExpand}
            vSplit={vSplit}
            setDraggingDiv={setDraggingDiv}
            rightPanelRef={rightPanelRef}
            outputRef={outputRef}
            hSplit={hSplit}
          />
        )}
      </div>

      <VisualGroundToolbar
        snapshotsLength={snapshots.length}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
        speed={speed}
        setSpeed={setSpeed}
        isCompiling={isCompiling}
        handleSimulate={handleSimulate}
      />
    </div>
  );
};

export default React.memo(VisualGround);
