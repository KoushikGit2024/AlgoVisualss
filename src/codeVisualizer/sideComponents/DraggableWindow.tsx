import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { Maximize2, Minimize2, Move } from 'lucide-react';

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
  defaultPosition?: { x: number, y: number };
  windowState: WindowState;
  updateWindow: (partial: Partial<WindowState>) => void;
  bringToFront: () => void;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

export function DraggableWindow({ 
  // id, 
  title, children, defaultPosition = { x: 0, y: 0 },
  windowState, updateWindow, bringToFront, parentRef
}: DraggableWindowProps) {
  const dragControls = useDragControls();

  const toggleMinimize = () => updateWindow({ isMinimized: !windowState.isMinimized, isMaximized: false });
  const toggleMaximize = () => updateWindow({ isMaximized: !windowState.isMaximized, isMinimized: false, snap: 'none' });

  const handleDragStart = () => {
    bringToFront();
    // Unsnap on drag start
    if (windowState.snap !== 'none' || windowState.isMaximized) {
      updateWindow({ snap: 'none', isMaximized: false });
    }
  };

  const handleDragEnd = (info: any) => {
    if (!parentRef.current) return;
    const parentRect = parentRef.current.getBoundingClientRect();
    const pointerX = info.point.x;
    const pointerY = info.point.y;
    
    // Snap thresholds (30px from edge)
    if (pointerY - parentRect.top < 30) {
      updateWindow({ isMaximized: true, snap: 'none' });
    } else if (pointerX - parentRect.left < 30) {
      updateWindow({ snap: 'left', isMaximized: false });
    } else if (parentRect.right - pointerX < 30) {
      updateWindow({ snap: 'right', isMaximized: false });
    }
  };

  return (
    <motion.div
      onMouseDownCapture={bringToFront}
      onTouchStartCapture={bringToFront}
      drag={!windowState.isMaximized}
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      initial={defaultPosition}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={{
        width: windowState.isMaximized ? '100%' : windowState.snap !== 'none' ? '50%' : 'auto',
        height: windowState.isMaximized || windowState.snap !== 'none' ? '100%' : 'auto',
        x: windowState.isMaximized || windowState.snap === 'left' ? 0 : windowState.snap === 'right' ? '100%' : undefined,
        y: windowState.isMaximized || windowState.snap !== 'none' ? 0 : undefined,
        opacity: windowState.isMinimized ? 0 : 1,
        scale: windowState.isMinimized ? 0.8 : 1,
      }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      className={`absolute flex flex-col bg-bg/95 border border-border rounded-md shadow-xl overflow-hidden ${
        windowState.isMaximized ? 'inset-0' : 'min-w-[200px]'
      }`}
      style={{
        zIndex: windowState.zIndex,
        resize: !windowState.isMinimized && !windowState.isMaximized && windowState.snap === 'none' ? 'both' : 'none',
        pointerEvents: windowState.isMinimized ? 'none' : 'auto',
      }}
    >
      {/* Title Bar (Drag Handle) */}
      <div 
        onPointerDown={(e) => dragControls.start(e)}
        className="flex items-center justify-between px-2 py-1 bg-surface-2 border-b border-border cursor-grab active:cursor-grabbing shrink-0 group"
      >
        <div className="flex items-center gap-1.5 text-text/80">
          <Move size={10} className="opacity-50 group-hover:opacity-100 transition-opacity" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
        </div>
        
        <div className="flex items-center gap-1 ml-4" onPointerDown={(e) => e.stopPropagation()}>
          <button 
            onClick={toggleMinimize}
            className="p-1 hover:bg-surface rounded text-muted hover:text-text transition-colors"
          >
            <Minimize2 size={10} />
          </button>
          <button 
            onClick={toggleMaximize}
            className="p-1 hover:bg-surface rounded text-muted hover:text-text transition-colors"
          >
            <Maximize2 size={10} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-auto styled-scrollbar p-2 relative flex flex-col items-center justify-center min-h-[100px]">
        {children}
      </div>
    </motion.div>
  );
}
