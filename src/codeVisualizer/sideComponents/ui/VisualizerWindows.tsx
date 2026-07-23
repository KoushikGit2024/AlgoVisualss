import React from "react";
import { DraggableWindow, type WindowState } from "../DraggableWindow";
import type { CanvasState } from "../detectVisualizer";
import { cn } from "../../../lib/utils";

import Graph from "../../dataStructures/Graph";
import D1Array from "../../dataStructures/D1Array";
import D2Array from "../../dataStructures/D2Array";
import LinkedList from "../../dataStructures/LinkedList";
import Queue from "../../dataStructures/Queue";
import Stack from "../../dataStructures/Stack";
import Tree from "../../dataStructures/Tree";
import TrieTree from "../../dataStructures/TrieTree";
import MapComponent from "../../dataStructures/Map";
import SetComponent from "../../dataStructures/Set";
import StringComponent from "../../dataStructures/String";
import Bitset from "../../dataStructures/Bitset";
import SortBars from "../../dataStructures/SortBars";

export function VisualizerWindows({
  groupedStates,
  windowStates,
  updateWindow,
  bringToFront,
  layoutAreaRef,
}: {
  groupedStates: Record<string, CanvasState[]>;
  windowStates: Record<string, WindowState>;
  updateWindow: (id: string, partial: Partial<WindowState>) => void;
  bringToFront: (id: string) => void;
  layoutAreaRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <>
      {Object.keys(groupedStates).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted text-[calc(10rem/16)] font-mono opacity-50 flex-col gap-1">
          <span>No active data structures detected.</span>
        </div>
      )}

      {Object.entries(groupedStates).map(([type, states], idx) => {
        const ws = windowStates[type] || {
          isMinimized: false,
          isMaximized: false,
          snap: "none" as const,
          zIndex: 20,
        };

        const defaultX = (idx % 4) * 40 + 20;
        const defaultY = (idx % 4) * 40 + 20;

        return (
          <DraggableWindow
            key={type}
            id={type}
            title={`${type}s`}
            defaultPosition={{ x: defaultX, y: defaultY }}
            windowState={ws}
            updateWindow={(partial) => updateWindow(type, partial)}
            bringToFront={() => bringToFront(type)}
            parentRef={layoutAreaRef}
          >
            <div className={cn("flex flex-wrap gap-4 items-center justify-center p-2 min-w-[40px] min-h-[150px]")}>
              {states.map((state) => (
                <div
                  key={state.id}
                  className="flex flex-col items-center gap-1 border border-border/50 bg-bg p-2 rounded"
                >
                  <span className="text-[calc(10rem/16)] font-mono font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">
                    {state.id}
                  </span>
                  <div className="flex-1 flex items-center justify-center">
                    {state.type === "graph" && <Graph {...(state.props as any)} />}
                    {state.type === "matrix" && <D2Array {...(state.props as any)} />}
                    {state.type === "array" && <D1Array {...(state.props as any)} />}
                    {state.type === "linkedlist" && <LinkedList {...(state.props as any)} />}
                    {state.type === "queue" && <Queue {...(state.props as any)} />}
                    {state.type === "stack" && <Stack {...(state.props as any)} />}
                    {state.type === "tree" && <Tree {...(state.props as any)} />}
                    {state.type === "trie" && <TrieTree {...(state.props as any)} />}
                    {state.type === "map" && <MapComponent {...(state.props as any)} />}
                    {state.type === "set" && <SetComponent {...(state.props as any)} />}
                    {state.type === "string" && <StringComponent {...(state.props as any)} />}
                    {state.type === "bitset" && <Bitset {...(state.props as any)} />}
                    {state.type === "sortbars" && <SortBars {...(state.props as any)} />}
                  </div>
                </div>
              ))}
            </div>
          </DraggableWindow>
        );
      })}
    </>
  );
}
