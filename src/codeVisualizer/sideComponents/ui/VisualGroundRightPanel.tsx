import React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";

interface VisualGroundRightPanelProps {
  currentSnapshot: any;
  overviewVars: any[];
  consoleOutput: string;
  isCallStackCollapsed: boolean;
  setIsCallStackCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isVariablesCollapsed: boolean;
  setIsVariablesCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isConsoleCollapsed: boolean;
  setIsConsoleCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  expandedVars: Set<string>;
  toggleVarExpand: (id: string) => void;
  vSplit: number;
  setDraggingDiv: React.Dispatch<React.SetStateAction<"v" | "h" | null>>;
  rightPanelRef: React.RefObject<HTMLDivElement>;
  outputRef: React.RefObject<HTMLDivElement>;
  hSplit: number;
}

export function VisualGroundRightPanel({
  currentSnapshot,
  overviewVars,
  consoleOutput,
  isCallStackCollapsed,
  setIsCallStackCollapsed,
  isVariablesCollapsed,
  setIsVariablesCollapsed,
  isConsoleCollapsed,
  setIsConsoleCollapsed,
  expandedVars,
  toggleVarExpand,
  vSplit,
  setDraggingDiv,
  rightPanelRef,
  outputRef,
  hSplit,
}: VisualGroundRightPanelProps) {
  return (
    <div
      ref={rightPanelRef}
      style={{ flex: `${100 - hSplit} 1 0%` }}
      className="flex flex-col overflow-hidden min-h-0 shrink-0 gap-1"
    >
      {/* Call Stack */}
      <div
        style={
          isCallStackCollapsed
            ? { flex: "0 0 auto" }
            : { flex: isVariablesCollapsed ? "1 1 0%" : `${vSplit} 1 0%` }
        }
        className={cn(
          `w-full flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden ${isCallStackCollapsed ? "min-h-0" : "min-h-[80px]"}`,
        )}
      >
        <div
          className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center justify-between cursor-pointer hover:bg-surface-3"
          onClick={() => setIsCallStackCollapsed(!isCallStackCollapsed)}
        >
          <h4 className="text-[calc(9rem/16)] uppercase tracking-widest text-muted font-semibold flex items-center gap-1">
            {isCallStackCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}{" "}
            Call Stack
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
                    className={cn(`px-2 py-1 rounded-sm border shadow-sm text-[calc(9rem/16)] font-mono flex items-center justify-between
                  ${
                    isTop
                      ? "border-accent-3 bg-accent-3/10  text-accent-3 font-bold"
                      : "border-border bg-surface text-muted opacity-70"
                  }`)}
                  >
                    <span>{frame}()</span>
                    {isTop && (
                      <span className="text-[calc(8rem/16)] bg-bg px-1 border border-border rounded">
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
          onMouseDown={() => setDraggingDiv("v")}
          className="flex items-center justify-center h-1 cursor-row-resize z-10 shrink-0 hover:bg-surface-2 transition-colors my-[-2px]"
        >
          <div className="h-px w-12 rounded-full bg-border" />
        </div>
      )}

      {/* Variables + Console */}
      <div
        style={
          isVariablesCollapsed
            ? { flex: "0 0 auto" }
            : { flex: isCallStackCollapsed ? "1 1 0%" : `${100 - vSplit} 1 0%` }
        }
        className={cn(
          `w-full flex flex-col gap-1 overflow-hidden ${isVariablesCollapsed ? "min-h-0" : "min-h-[120px]"}`,
        )}
      >
        {/* Variables */}
        <div className="flex-1 flex flex-col min-h-0 rounded-sm border border-border bg-bg/90 overflow-hidden">
          <div
            className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center justify-between cursor-pointer hover:bg-surface-3"
            onClick={() => setIsVariablesCollapsed(!isVariablesCollapsed)}
          >
            <h4 className="text-[calc(9rem/16)] uppercase tracking-widest text-muted font-semibold flex items-center gap-1">
              {isVariablesCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}{" "}
              Variables
            </h4>
          </div>
          {!isVariablesCollapsed && (
            <div className="flex-1 overflow-y-auto styled-scrollbar p-1">
              <div className="flex flex-col gap-px">
                {overviewVars.length === 0 && (
                  <span className="text-[calc(9rem/16)] text-muted font-mono p-1">
                    No locals.
                  </span>
                )}
                {overviewVars.map((v) => {
                  const isExp = expandedVars.has(v.id);
                  let formattedVal = v.value;
                  try {
                    const parsed = JSON.parse(v.value);
                    formattedVal = JSON.stringify(parsed, null, 2);
                  } catch (e) {
                    let indent = 0;
                    let res = "";
                    for (let i = 0; i < v.value.length; i++) {
                      const c = v.value[i];
                      if (c === "{" || c === "[") {
                        indent += 2;
                        res += c + "\n" + " ".repeat(indent);
                      } else if (c === "}" || c === "]") {
                        indent = Math.max(0, indent - 2);
                        res += "\n" + " ".repeat(indent) + c;
                      } else if (c === ",") {
                        res += ",\n" + " ".repeat(indent);
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
                      className={cn(
                        `flex flex-col px-1.5 py-1 text-[calc(10rem/16)] font-mono rounded-sm border border-transparent transition-colors cursor-pointer hover:bg-surface-3 ${v.opStyle}`,
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <span className="text-muted shrink-0">
                            {isExp ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                          </span>
                          <span className="text-accent-2 opacity-80 text-[calc(8rem/16)] uppercase shrink-0">
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
                        <span className="text-[calc(8rem/16)] text-muted opacity-50 shrink-0 ml-1">
                          in {v.func}()
                        </span>
                      </div>
                      {isExp && (
                        <div className="mt-1.5 w-full text-accent-3 font-bold whitespace-pre-wrap break-all bg-bg/80 p-2 rounded border border-border/50 h-auto overflow-visible shadow-inner">
                          {formattedVal}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Console Output */}
        <div
          className={cn(
            `shrink-0 flex flex-col rounded-sm border border-border bg-bg/90 overflow-hidden ${isConsoleCollapsed ? "min-h-0 h-auto" : "h-28"}`,
          )}
        >
          <div
            className="bg-surface-2/50 border-b border-border px-2 py-1 shrink-0 flex items-center justify-between cursor-pointer hover:bg-surface-3"
            onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
          >
            <div className="flex items-center gap-1">
              <h4 className="text-[calc(9rem/16)] uppercase tracking-widest text-muted font-semibold flex items-center gap-1">
                {isConsoleCollapsed ? <ChevronRight size={10} /> : <ChevronDown size={10} />}{" "}
                Console Output
              </h4>
            </div>
          </div>
          {!isConsoleCollapsed && (
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto styled-scrollbar p-2 font-mono text-[calc(10rem/16)] text-text whitespace-pre-wrap"
            >
              {consoleOutput || (
                <span className="text-muted opacity-50 italic">No output...</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
