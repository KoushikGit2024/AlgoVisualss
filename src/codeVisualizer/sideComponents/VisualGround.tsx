import React, { useState, useRef, useEffect } from 'react';
import { 
  DndContext, 
  closestCenter, 
} from "@dnd-kit/core";

// Correctly imported as a type!
import type { DragEndEvent } from '@dnd-kit/core';

import { 
  SortableContext, 
  rectSortingStrategy, 
  arrayMove,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── 1. Sortable Memory Card (Draggable + Resizable) ─────────────────────────
const SortableMemoryCard = ({ id, label, takefullWidth = false }: { id: string, label: string, takefullWidth?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex-shrink-0 touch-none max-w-full inline-flex ${takefullWidth ? 'w-full' : ''}`}
    >
      <div
        className={`bg-surface border rounded p-2 transition-colors flex flex-col h-[100px] resize-x overflow-hidden group
          ${isDragging ? 'border-accent shadow-md glow-accent' : 'border-border shadow-sm hover:border-accent/50'}
        `}
        style={{ width: takefullWidth ? '100%' : '160px', minWidth: '120px', maxWidth: '100%' }}
      >
        <div className="flex items-center gap-1 mb-1 shrink-0">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-muted hover:text-accent hover:bg-surface-2 rounded transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/>
            </svg>
          </div>
          <span className="text-[10px] font-mono font-bold text-text">{label}</span>
        </div>
        <div className="text-[10px] text-text/60 italic overflow-y-auto styled-scrollbar pr-1 flex-1 leading-relaxed flex gap-2">
          <span>hi1</span>
          <span>hi2</span>
          <span>hi3</span>
          <span>hi4</span>
          <span>hi5</span>
          <span>hi6</span>
          <span>hi7</span>
          <span>hi8</span>
          <span>hi9</span>
          <span>hi10</span>
          <span>hi11</span>
          <span>hi12</span>
          <span>hi13</span>
          <span>hi14</span>
          <span>hi15</span>
          <span>hi16</span>
          <span>hi17</span>
          <span>hi18</span>
          <span>hi19</span>
          <span>hi20</span>
          <span>hi21</span>
          <span>hi22</span>
          <span>hi23</span>
          <span>hi24</span>
          <span>hi25</span>
          <span>hi26</span>
          <span>hi27</span>
          <span>hi28</span>
          <span>hi29</span>
          <span>hi30</span>
          <span>hi31</span>
          <span>hi32</span>
          <span>hi33</span>
          <span>hi34</span>
          <span>hi35</span>
          <span>hi36</span>
          <span>hi37</span>
          <span>hi38</span>
          <span>hi39</span>
          <span>hi40</span>
          <span>hi41</span>
          <span>hi42</span>
          <span>hi43</span>
          <span>hi44</span>
          <span>hi45</span>
          <span>hi46</span>
          <span>hi47</span>
          <span>hi48</span>
          <span>hi49</span>
          <span>hi50</span>
        </div>
      </div>
    </div>
  );
};

// ─── 2. Static Variable Card (Resizable) ─────────────────────────────────────
const VariableCard = ({ type, name, value, takefullWidth = false }: { type: string, name: string, value: string, takefullWidth?: boolean }) => {
  return (
    <div className={`flex-shrink-0 h-[80px] ${takefullWidth ? 'w-full' : ''}`}>
      <div 
        className="bg-surface border border-border rounded p-2 shadow-sm flex flex-col justify-between h-full hover:border-accent-2/50 transition-colors resize-x overflow-hidden"
        style={{ width: takefullWidth ? '100%' : '160px', minWidth: '120px', maxWidth: '100%' }}
      >
        <div className="flex items-center justify-between mb-1 shrink-0">
          <span className="text-[10px] font-mono font-bold text-text">{name}</span>
          <span className="text-[8px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-surface-2 text-accent-2 border border-border">
            {type}
          </span>
        </div>
        <div className="text-[10px] font-mono text-text/80 bg-bg p-1 rounded border border-border break-all overflow-y-auto styled-scrollbar flex-1">
          {value}
        </div>
      </div>
    </div>
  );
};

// ─── 3. Main Visualizer Component ────────────────────────────────────────────
const VisualGround = ({
  code,
  lang,
  setHighlightLine
}: {
  code: string;
  lang: string;
  setHighlightLine: React.Dispatch<React.SetStateAction<number>>;
}) => {
  // Application Data States
  const [memoryItems, setMemoryItems] = useState([
    { id: 'integers', label: 'integers', takefullWidth: true },
    { id: 'arrays', label: 'arrays', takefullWidth: false },
    { id: 'objects', label: 'objects', takefullWidth: false },
    { id: 'floats', label: 'floats', takefullWidth: false },
    { id: 'chars', label: 'chars', takefullWidth: false },
    { id: 'pointers', label: 'pointers', takefullWidth: false },
    { id: 'linkedList', label: 'linkedList', takefullWidth: false },
  ]);

  const [callStack] = useState([
    { id: 'frame-1', func: 'main()', line: 18, active: false },
    { id: 'frame-2', func: 'bubbleSort(arr)', line: 4, active: true },
    { id: 'frame-3', func: 'bubbleSort(arr)', line: 4, active: true },
    { id: 'frame-4', func: 'main()', line: 18, active: false },
    { id: 'frame-5', func: 'bubbleSort(arr)', line: 4, active: true },
    { id: 'frame-6', func: 'main()', line: 18, active: false },
    { id: 'frame-7', func: 'bubbleSort(arr)', line: 4, active: true }
  ]);

  const [overviewVars] = useState([
    { id: 'var-1', type: 'int[]', name: 'arr', value: '[5, 1, 4, 2, 8, 9, 10, 11]', takefullWidth: true },
    { id: 'var-2', type: 'int', name: 'n', value: '5', takefullWidth: false },
    { id: 'var-3', type: 'int', name: 'i', value: '0', takefullWidth: false },
    { id: 'var-4', type: 'bool', name: 'swapped', value: 'false', takefullWidth: false },
    { id: 'var-5', type: 'int', name: 'temp', value: '5', takefullWidth: false }
  ]);
  
  const [speed, setSpeed] = useState<number>(1);

  // Split Pane States
  const [vSplit, setVSplit] = useState<number>(45); // Height percentage for top pane
  const [hSplit, setHSplit] = useState<number>(33); // Width percentage for bottom-left pane
  
  // 'v' = vertical sizing (horizontal bar), 'h' = horizontal sizing (vertical bar)
  const [draggingDiv, setDraggingDiv] = useState<'v' | 'h' | null>(null);
  
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const bottomContainerRef = useRef<HTMLDivElement>(null);

  // Resize Handler Hook
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingDiv) return;

      if (draggingDiv === 'v' && mainContainerRef.current) {
        // Handle Top vs Bottom height split
        const rect = mainContainerRef.current.getBoundingClientRect();
        let newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
        if (newPercentage < 15) newPercentage = 15;
        if (newPercentage > 85) newPercentage = 85;
        setVSplit(newPercentage);
      } 
      else if (draggingDiv === 'h' && bottomContainerRef.current) {
        // Handle Left vs Right width split
        const rect = bottomContainerRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 768; // Matches tailwind 'md'
        
        let newPercentage = 50;
        if (isDesktop) {
          // On desktop, elements are side-by-side (X axis)
          newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
        } else {
          // On mobile, elements are stacked (Y axis)
          newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
        }

        if (newPercentage < 15) newPercentage = 15;
        if (newPercentage > 85) newPercentage = 85;
        setHSplit(newPercentage);
      }
    };

    const handleMouseUp = () => setDraggingDiv(null);

    if (draggingDiv) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent highlighting text during drag
    } else {
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingDiv]);

  // Handle Memory Drags
  const handleMemoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMemoryItems((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (lang !== "cpp") {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-2 text-center overflow-hidden">
        <div className="bg-surface-2 border border-border p-4 rounded-[6px] max-w-sm w-full shadow-lg">
          <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-500/20">
            <span className="text-red-400 font-mono text-lg">!</span>
          </div>
          <h3 className="text-sm font-semibold mb-1">Language Not Supported</h3>
          <p className="text-[10px] text-muted">
            The execution visualizer currently only supports memory mapping and stepping for <strong>C++</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-text font-display gap-2 overflow-hidden pb-1">
      
      {/* ─── Top Process Header ─────────────────────────────────────────────── */}
      <div className="w-full bg-surface-2 border border-border rounded-[6px] p-1.5 text-[10px] text-center shadow-sm shrink-0 flex items-center justify-center gap-2">
        <span className="font-mono text-accent">Process Status:</span> 
        <span>Executing <code className="bg-bg px-1 py-0.5 rounded border border-border">bubbleSort</code></span>
      </div>

      {/* ─── Main Internal Area (Holds the 3 partitions) ────────────────────── */}
      <div ref={mainContainerRef} className="flex-1 flex flex-col overflow-hidden min-h-0">
        
        {/* Section 1: Memory Allocations (Top) */}
        <div 
          style={{ flex: `${vSplit} 1 0%` }} 
          className="shrink-0 flex flex-col rounded-[6px] border border-border bg-bg/90 backdrop-blur-sm p-2 shadow-sm overflow-hidden"
        >
          <h4 className="text-[10px] uppercase tracking-widest text-muted mb-2 font-semibold flex items-center gap-1 shrink-0">
            <div className="w-1.5 h-1.5 rounded-[6px] bg-accent-2"></div>
            Memory Allocations
          </h4>
          <div className="flex-1 overflow-y-auto styled-scrollbar pr-1 pb-1">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleMemoryDragEnd}>
              <div className="flex flex-wrap gap-2">
                <SortableContext items={memoryItems.map(m => m.id)} strategy={rectSortingStrategy}>
                  {memoryItems.map((item) => (
                    <SortableMemoryCard 
                      key={item.id} 
                      id={item.id} 
                      label={item.label} 
                      takefullWidth={item.takefullWidth} 
                    />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          </div>
        </div>

        {/* --- Resize Handler (Horizontal Bar / Adjusts Height) --- */}
        <div 
          onMouseDown={() => setDraggingDiv('v')}
          className="flex items-center justify-center py-1 cursor-row-resize group z-10 shrink-0"
        >
          <div className={`w-12 h-1 rounded-full transition-colors duration-200 ${draggingDiv === 'v' ? 'bg-accent' : 'bg-border group-hover:bg-accent-2'}`} />
        </div>

        {/* Section 2 & 3 Container (Bottom Left and Bottom Right) */}
        <div ref={bottomContainerRef} style={{ flex: `${100 - vSplit} 1 0%` }} className="flex flex-col md:flex-row overflow-hidden min-h-0 shrink-0">
          
          {/* Section 2: Call Stack (Left) */}
          <div 
            style={{ flex: `${hSplit} 1 0%` }}
            className="w-full flex flex-col rounded-[6px] border border-border bg-bg/90 backdrop-blur-sm p-2 shadow-sm overflow-hidden min-h-0"
          >
            <h4 className="text-[10px] uppercase tracking-widest text-muted mb-2 font-semibold flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 rounded-[6px] bg-accent-3"></div>
              Call Stack
            </h4>
            
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-1 flex flex-col gap-1.5 border-b-2 border-border rounded-b-sm pb-1">
              {[...callStack].reverse().map((frame) => (
                <div 
                  key={frame.id}
                  className={`p-2 rounded border shadow-sm transition-all shrink-0
                    ${frame.active 
                      ? 'border-accent-3 bg-accent-3/10 shadow-[0_0_8px_rgba(236,72,153,0.15)]' 
                      : 'border-border bg-surface opacity-70'}
                  `}
                >
                  <div className="flex justify-between items-start mb-0.5">
                    <span className={`text-[10px] font-mono font-bold ${frame.active ? 'text-accent-3' : 'text-text'}`}>
                      {frame.func}
                    </span>
                  </div>
                  <div className="text-[8px] text-muted font-mono flex items-center gap-1">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>
                    Line {frame.line}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* --- Resize Handler (Vertical Bar / Adjusts Width) --- */}
          <div 
            onMouseDown={() => setDraggingDiv('h')}
            className="flex items-center justify-center py-1 px-1 md:py-0 md:px-1 cursor-row-resize md:cursor-col-resize group z-10 shrink-0"
          >
            <div className={`w-12 h-1 md:w-1 md:h-12 rounded-full transition-colors duration-200 ${draggingDiv === 'h' ? 'bg-accent' : 'bg-border group-hover:bg-accent-2'}`} />
          </div>

          {/* Section 3: Variables Overview (Right) */}
          <div 
            style={{ flex: `${100 - hSplit} 1 0%` }}
            className="w-full flex flex-col rounded-[6px] border border-border bg-bg/90 backdrop-blur-sm p-2 shadow-sm overflow-hidden min-h-0"
          >
            <h4 className="text-[10px] uppercase tracking-widest text-muted mb-2 font-semibold flex items-center gap-1 shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-success"></div>
              Variables Overview
            </h4>
            
            <div className="flex-1 overflow-y-auto styled-scrollbar pr-1 pb-1">
              <div className="flex flex-wrap gap-2">
                {overviewVars.map((variable) => (
                  <VariableCard 
                    key={variable.id} 
                    type={variable.type}
                    name={variable.name}
                    value={variable.value}
                    takefullWidth={variable.takefullWidth}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── Execution Controls Bar (Fixed at bottom) ─────────────────────── */}
      <div className="w-full bg-surface-2 border border-border rounded-md p-2 shadow-sm flex flex-col gap-2 shrink-0 mt-auto">
        <div className="flex items-center gap-2 w-full">
          <span className="text-[10px] font-mono text-muted whitespace-nowrap">Step 4 / 15</span>
          <div className="flex-1 h-1.5 bg-bg rounded-full overflow-hidden border border-border relative">
            <div className="absolute left-0 top-0 h-full bg-accent transition-all duration-300 w-[26%]"></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button className="px-2 py-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded text-[10px] font-medium transition-all shadow-sm">Restart</button>
            <button className="px-2 py-1 bg-accent hover:bg-accent-2 text-white border border-transparent rounded text-[10px] font-medium transition-all shadow-sm">Simulate</button>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button className="p-1.5 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded transition-all shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
            </button>
            <button className="px-4 py-1.5 bg-success hover:bg-emerald-400 text-bg rounded text-[10px] font-bold transition-all shadow-md">
              Run
            </button>
            <button className="p-1.5 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded transition-all shadow-sm">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-muted uppercase font-semibold hidden sm:block">Speed</span>
            <button onClick={() => setSpeed(s => Math.max(0.25, s - 0.25))} className="p-0.5 text-muted hover:text-accent transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <input 
              type="range" className="w-12 sm:w-16 accent-accent h-1 bg-border rounded appearance-none cursor-pointer"
              onChange={(e) => setSpeed(parseFloat(e.target.value))} min={0.25} max={5} value={speed} step={0.25}
            />
            <button onClick={() => setSpeed(s => Math.min(5, s + 0.25))} className="p-0.5 text-muted hover:text-accent transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <span className="text-[8px] text-accent font-mono w-4">{speed}x</span>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default VisualGround;