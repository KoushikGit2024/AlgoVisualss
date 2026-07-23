import { useState, useRef, useEffect, useMemo } from "react";
import type { WindowState } from "../DraggableWindow";
import type { CanvasState } from "../detectVisualizer";

export function useWindowLayout(groupedStates: Record<string, CanvasState[]>) {
  const [windowStates, setWindowStates] = useState<Record<string, WindowState>>({});
  const globalZRef = useRef(20);

  const updateWindow = (id: string, partial: Partial<WindowState>) => {
    setWindowStates((prev) => {
      const curr = prev[id] || {
        isMinimized: false,
        isMaximized: false,
        snap: "none",
        zIndex: globalZRef.current,
      };
      return { ...prev, [id]: { ...curr, ...partial } };
    });
  };

  const bringToFront = (id: string) => {
    globalZRef.current += 1;
    updateWindow(id, { zIndex: globalZRef.current });
  };

  const resetWindowStates = () => {
    setWindowStates({});
    globalZRef.current = 20;
  };

  const activeWindowId = useMemo(() => {
    let maxZ = -1;
    let activeId: string | null = null;
    for (const [id, state] of Object.entries(windowStates)) {
      if (!state.isMinimized && state.zIndex > maxZ) {
        maxZ = state.zIndex;
        activeId = id;
      }
    }
    return activeId;
  }, [windowStates]);

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
            next[key] = { isMinimized: false, isMaximized: true, snap: "none", zIndex: z };
          } else if (keys.length === 2) {
            next[key] = {
              isMinimized: false,
              isMaximized: false,
              snap: idx === 0 ? "left" : "right",
              zIndex: z,
            };
          } else {
            // Stagger diagonally so windows don't completely eclipse each other.
            next[key] = { isMinimized: false, isMaximized: false, snap: "none", zIndex: z };
          }
        });
      } else {
        // Case B: new key appeared mid-simulation → free-floating, no snap
        newKeys.forEach((key) => {
          z += 1;
          next[key] = { isMinimized: false, isMaximized: false, snap: "none", zIndex: z };
        });
      }

      globalZRef.current = z;
      return next;
    });
  }, [groupedStates]);

  return { windowStates, updateWindow, bringToFront, resetWindowStates, activeWindowId };
}
