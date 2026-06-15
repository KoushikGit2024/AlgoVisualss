import React, { useEffect, useState, useRef } from 'react';
import CodeEditor from './sideComponents/CodeEditor';
import VisualGround from './sideComponents/VisualGround';

const CodeWindow = ({
  codeArray = [
    [
      'cpp',
      '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!";\n    return 0;\n}'
    ]
  ]
}: {
  codeArray?: [string, string][];
}) => {
  const [lang, setLang] = useState<string>(codeArray[0][0]);
  const [code, setCode] = useState<string>(codeArray[0][1]);
  const [highlightLine, setHighlightLine] = useState<number>(1);
  
  const [splitOffset, setSplitOffset] = useState<number>(35);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCode(codeArray.find((item) => item[0] === lang)?.[1] || '');
  }, [lang, codeArray]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1024; 
      
      let newPercentage = 50;
      if (isDesktop) {
        newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
      }

      if (newPercentage < 20) newPercentage = 20;
      if (newPercentage > 80) newPercentage = 80;
      
      setSplitOffset(newPercentage);
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
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
  }, [isDragging]);

  const langArray: string[] = ['cpp', 'java', 'python', 'js'];

  return (
    <div 
      ref={containerRef}
      className="flex flex-col lg:flex-row items-stretch w-full h-full p-1 lg:p-2 bg-bg text-text overflow-hidden min-h-0"
    >
      
      {/* ─── Left Pane: Code Editor ────────────────────────────────────────── */}
      <div 
        style={{ flex: `${splitOffset} 1 0%` }} 
        // Changed rounded-xl to rounded-lg
        className="flex flex-col glass rounded-lg overflow-hidden shadow-lg border border-border min-h-0 min-w-0 max-h-screen"
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-surface-2 border-b border-border shrink-0">
          <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border shadow-sm">
            {langArray.map((item, index) => (
              <button
                key={index}
                onClick={() => setLang(item)}
                className={`px-3 py-1 text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                  lang === item
                    ? 'nav-pill-active shadow-sm'
                    : 'text-muted hover:text-text hover:bg-surface-2 rounded-full'
                }`}
              >
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Editor</span>
        </div>

        <div className="flex-1 relative bg-surface styled-scrollbar overflow-hidden min-h-0">
          <CodeEditor code={code} lang={lang} highlightLine={highlightLine} />
        </div>
      </div>

      {/* ─── Expandable/Resizable Divider ──────────────────────────────────── */}
      <div 
        onMouseDown={() => setIsDragging(true)}
        className="flex items-center justify-center p-1 lg:p-0 lg:w-3 shrink-0 cursor-row-resize lg:cursor-col-resize group z-10"
      >
        <div className={`
          w-12 h-1 lg:w-1 lg:h-12 rounded-full transition-colors duration-200
          ${isDragging ? 'bg-accent' : 'bg-border group-hover:bg-accent-2'}
        `} />
      </div>

      {/* ─── Right Pane: Visual Ground ─────────────────────────────────────── */}
      <div 
        style={{ flex: `${100 - splitOffset} 1 0%` }}
        // Changed rounded-xl to rounded-lg
        className="flex flex-col glass rounded-lg overflow-hidden shadow-lg border border-border min-h-0 min-w-0 max-h-screen"
      >
        <div className="px-3 py-1.5 bg-surface-2 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[10px] font-semibold text-muted uppercase tracking-wider font-display">
            Visualizer Output
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted font-mono">
              Status: {lang === "cpp" ? "Active" : "Inactive"}
            </span>
            <div className={`w-2 h-2 rounded-full shadow-sm ${lang === "cpp" ? 'bg-success animate-pulse glow-accent' : 'bg-red-500/80'}`}></div>
          </div>
        </div>
        
        <div className="flex-1 relative bg-surface mesh-bg p-1 overflow-auto flex flex-col min-h-0 min-w-0 ">
          <VisualGround code={code} lang={lang} setHighlightLine={setHighlightLine} />
        </div>
      </div>
      
    </div>
  );
};

export default CodeWindow;