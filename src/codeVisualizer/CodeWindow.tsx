import { useEffect, useState, useRef } from 'react';
import CodeEditor from './sideComponents/CodeEditor';
import VisualGround from './sideComponents/VisualGround';
import { Info, X } from 'lucide-react';
import VisualizerNamingConventions from './dataStructures/VisualizerNamingConventions';
// import { ALGODATA } from '../Pages/algorithms/data/categories/AlgoData';

const CodeWindow = ({ codeObject }: {codeObject: Record<string, string>}) => {
  const [lang, setLang] = useState<string>("c++");
  const [code, setCode] = useState<string>(codeObject["c++"]);
  const [highlightLine, setHighlightLine] = useState<number>(1);
  
  const [splitOffset, setSplitOffset] = useState<number>(35);
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ✅ FIX 1: Only reset the code when the 'lang' tab changes!
  useEffect(() => {
    // console.log(codeObject)
    setCode(codeObject[lang] as string);
  }, [lang,codeObject]);

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

  const langArray: string[] = Object.keys(codeObject);
  
  return (
    <div 
      ref={containerRef}
      className="relative flex flex-col lg:flex-row items-stretch w-full h-full p-1 lg:p-2 bg-bg text-text overflow-hidden min-h-0"
    >
      
      {/* ─── Left Pane: Code Editor ────────────────────────────────────────── */}
      <div 
        style={{ flex: lang === 'c++' ? `${splitOffset} 1 0%` : '1 1 0%' }} 
        className="flex flex-col glass rounded-lg overflow-hidden shadow-lg border border-border min-h-0 min-w-0 max-h-screen transition-all duration-300"
      >
        <div className="flex items-center justify-between px-3 py-1.5 bg-surface-2 border-b border-border shrink-0">
          <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border shadow-sm max-w-1/2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
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
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowInfo(true)}
              className="p-1 text-accent hover:bg-surface-3 rounded transition-colors"
              title="Visualizer Naming Conventions"
            >
              <Info size={14} />
            </button>
            <span className="text-[10px] font-semibold text-muted uppercase tracking-wider">Editor</span>
          </div>
        </div>

        <div className="flex-1 relative bg-surface styled-scrollbar overflow-hidden min-h-0">
          <CodeEditor code={code} lang={lang} highlightLine={highlightLine} setCode={setCode}/>
        </div>
      </div>

      {/* ─── Expandable/Resizable Divider ──────────────────────────────────── */}
      {lang === 'c++' && (
        <div 
          onMouseDown={() => setIsDragging(true)}
          className="flex items-center justify-center p-1 lg:p-0 lg:w-3 shrink-0 cursor-row-resize lg:cursor-col-resize group z-10"
        >
          <div className={`
            w-12 h-1 lg:w-1 lg:h-12 rounded-full transition-colors duration-200
            ${isDragging ? 'bg-accent' : 'bg-border group-hover:bg-accent-2'}
          `} />
        </div>
      )}

      {/* ─── Right Pane: Visual Ground ─────────────────────────────────────── */}
      <div
        style={
          lang === "c++"
            ? {
                flex: `${100 - splitOffset} 1 0%`,
                position: "relative",
              }
            : {
                position: "absolute",
                bottom: "0.75rem",
                right: "0.75rem",
                zIndex: 20,
              }
        }
        className={`flex flex-col overflow-hidden glass rounded-lg shadow-lg border border-border transition-all duration-300 ${
          lang === "c++"
            ? "min-h-0 min-w-0 max-h-screen"
            : "w-[calc(100vw-1rem)] sm:w-[320px] max-w-1/2 bg-surface/90 backdrop-blur-md"
        }`}
      >
        <div className="px-2.5 sm:px-3 py-1.5 bg-surface-2 border-b border-border flex items-center justify-between shrink-0">
          <span className="text-[9px] sm:text-[10px] font-semibold text-muted uppercase tracking-wider font-display">
            Visualizer Output
          </span>

          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] text-muted font-mono">
              {lang === "c++" ? "Active" : "Inactive"}
            </span>

          <div
              className={`w-2 h-2 rounded-full aspect-square shadow-sm ${
                lang === "c++"
                  ? "bg-success animate-pulse glow-accent"
                  : "bg-red-400"
              }`}
            />
          </div>
        </div>

        <div className="flex-1 relative bg-surface mesh-bg overflow-hidden flex flex-col min-h-0 min-w-0 p-2">
          <VisualGround
            code={code}
            lang={lang}
            setHighlightLine={setHighlightLine}
          />
        </div>
      </div> 
      {/* ─── Naming Conventions Modal ──────────────────────────────────────── */}
      {showInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2 shrink-0">
              <h2 className="text-sm font-bold text-text flex items-center gap-2">
                <Info size={16} className="text-accent" /> Visualizer Naming Conventions
              </h2>
              <button onClick={() => setShowInfo(false)} className="p-1 hover:bg-surface-3 rounded text-muted hover:text-text transition-colors">
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-8 styled-scrollbar bg-bg">
              <VisualizerNamingConventions />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeWindow;
