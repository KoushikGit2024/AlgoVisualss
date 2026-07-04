import React from 'react';
import { motion, useDragControls, type PanInfo } from 'framer-motion';
import { Maximize2, Minimize2, Move } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface WindowState {
  isMinimized: boolean;
  isMaximized: boolean;
  snap: 'none' | 'left' | 'right';
  zIndex: number;
}

interface DraggableWindowProps {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?:     { width: string | number; minWidth?: number; height?: string | number; minHeight?: number };
  cornerAnchor?:    'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  windowState: WindowState;
  updateWindow: (partial: Partial<WindowState>) => void;
  bringToFront: () => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

export function DraggableWindow({
  id,
  title,
  children,
  defaultPosition = { x: 0, y: 0 },
  defaultSize,
  cornerAnchor,
  windowState,
  updateWindow,
  bringToFront,
  parentRef,
}: DraggableWindowProps) {
  const dragControls = useDragControls();

  const toggleMinimize = () =>
    updateWindow({ isMinimized: !windowState.isMinimized, isMaximized: false });

  const toggleMaximize = () =>
    updateWindow({ isMaximized: !windowState.isMaximized, isMinimized: false, snap: 'none' });

  const handleDragStart = () => {
    bringToFront();
    // Unsnap / un-maximize as soon as the user starts dragging
    if (windowState.snap !== 'none' || windowState.isMaximized) {
      updateWindow({ snap: 'none', isMaximized: false });
    }
  };

  // Framer Motion calls onDragEnd as (event, info).
  // We use info.point.x / info.point.y (the global page coordinates).
  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    if (!parentRef.current) return;
    const parentRect = parentRef.current.getBoundingClientRect();
    const { x: pointerX, y: pointerY } = info.point;

    // 30 px hot-zones at each edge
    if (pointerY - parentRect.top < 30) {
      updateWindow({ isMaximized: true, snap: 'none' });
    } else if (pointerX - parentRect.left < 30) {
      updateWindow({ snap: 'left', isMaximized: false });
    } else if (parentRect.right - pointerX < 30) {
      updateWindow({ snap: 'right', isMaximized: false });
    } else if (
      pointerX < parentRect.left || pointerX > parentRect.right ||
      pointerY < parentRect.top  || pointerY > parentRect.bottom
    ) {
      // Dragged fully outside the visible canvas - minimize it so it can
      // be recovered from the taskbar instead of becoming unreachable.
      updateWindow({ snap: 'none', isMaximized: false, isMinimized: true });
    }
  };

  // Build the animate object without ever setting x/y to `undefined`.
  // undefined causes framer-motion to jump back to layout bounds.
  const animateProps: any = {
    opacity: windowState.isMinimized ? 0 : 1,
    scale:   windowState.isMinimized ? 0.8 : 1,
  };

  if (windowState.isMaximized || windowState.snap !== 'none') {
    animateProps.width = windowState.isMaximized ? '100%' : '50%';
    animateProps.height = '100%';
  }

  if (windowState.isMaximized || windowState.snap === 'left') {
    animateProps.x = 0;
    animateProps.y = 0;
  } else if (windowState.snap === 'right') {
    // translateX(100%) on a 50%-wide element = 50% of parent = right half ✓
    animateProps.x = '100%';
    animateProps.y = 0;
  }

  // Disable drag when maximized OR minimized.
  const isDraggable = !windowState.isMaximized && !windowState.isMinimized;

  return (
    <motion.div
      // id must be bound so Framer Motion can track instances
      // across re-renders (prevents "lost drag" on hot re-renders).
      id={id}
      onMouseDownCapture={bringToFront}
      onTouchStartCapture={bringToFront}
      drag={isDraggable}
      dragControls={dragControls}
      // dragListener:false means we only start the drag from the
      // title bar (which explicitly calls dragControls.start).
      // This allows clicking inside the window content without dragging it.
      dragListener={false}
      dragMomentum={false}
      // No dragConstraints. Adding them while a window spawns
      // off-screen (due to manual overlapping logic) forces it to snap.
      // Free-dragging is fine for these floating tools.
      initial={defaultPosition}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={animateProps}
      transition={{ type: 'spring', bounce: 0.05, duration: 0.3 }}
      className={cn(`absolute flex flex-col bg-bg/95 border border-border rounded-md shadow-xl overflow-hidden ${
        windowState.isMaximized ? 'inset-0' : 'min-w-[60px]'
      }`)}
      style={{
        zIndex: windowState.zIndex,
        // Corner anchor: use CSS right/bottom instead of Framer's x/y
        ...(cornerAnchor === 'bottom-right' && {
          right:  8,
          bottom: 8,
          left:   'unset',
          top:    'unset',
          width:  defaultSize?.width ?? '10%',
          minWidth: defaultSize?.minWidth ?? 40,
          height:  defaultSize?.height ?? '10%',
          minHeight: defaultSize?.minHeight ?? 40,
          transform: 'none',   // neutralise Framer's translate
        }),
        // Only allow CSS resize when the window is free-floating
        resize:
          !windowState.isMinimized &&
          !windowState.isMaximized &&
          windowState.snap === 'none'
            ? 'both'
            : 'none',
        pointerEvents: windowState.isMinimized ? 'none' : 'auto',
        // Prevent the minimised ghost from being visible during the opacity
        // fade-out by hiding overflow so scaled-down content clips cleanly.
        overflow: 'hidden',
      }}
    >
      {/* ─── Title Bar / Drag Handle ─── */}
      <div
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-2 py-1 bg-surface-2 border-b border-border cursor-grab active:cursor-grabbing shrink-0 group"
      >
        <div className="flex items-center gap-1.5 text-text/80">
          <Move size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="text-[calc(10rem/16)] font-bold uppercase tracking-widest">{title}</span>
        </div>

        {/* Stop pointer-down here so clicking buttons doesn't also start a drag */}
        <div
          className="flex items-center gap-1 ml-4"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={toggleMinimize}
            title={windowState.isMinimized ? 'Restore' : 'Minimise'}
            className="p-1 hover:bg-surface rounded text-muted hover:text-text transition-colors"
          >
            <Minimize2 size={10} />
          </button>
          <button
            onClick={toggleMaximize}
            title={windowState.isMaximized ? 'Restore' : 'Maximise'}
            className="p-1 hover:bg-surface rounded text-muted hover:text-text transition-colors"
          >
            <Maximize2 size={10} />
          </button>
        </div>
      </div>

      {/* ─── Content Body ─── */}
      <div className={cn(`flex-1 overflow-auto styled-scrollbar p-2 relative flex flex-col ${!cornerAnchor && 'min-h-[100px]'}`)}>
        {/* m-auto centers when content fits; collapses to 0 when content overflows,
            left-aligning it so the left edge is never clipped */}
            
        <div className="m-auto">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
