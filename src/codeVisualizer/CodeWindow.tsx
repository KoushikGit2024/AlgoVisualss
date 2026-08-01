import { useEffect, useState, useRef } from "react";
import CodeEditor from "./sideComponents/CodeEditor";
import { useSnippets } from "./hooks/useSnippets";
import { NavigationBlocker } from "../components/NavigationBlocker";
import VisualGround from "./sideComponents/VisualGround";
import {
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Code,
  MonitorPlay,
  Save,
  FilePlus,
  RotateCcw,
  Edit2,
  ChevronDown,
  Check,
  Trash2,
  Share2,
} from "lucide-react";
import VisualizerNamingConventions from "./namingConventions/VisualizerNamingConventions";
// import { ALGODATA } from '../Pages/algorithms/data/categories/AlgoData';
import { cn } from "../lib/utils";
import { useSearchParams } from "react-router-dom";
import LZString from "lz-string";

const CodeWindow = ({ codeObject }: { codeObject: Record<string, string> }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlLang = searchParams.get("lang");

  // Initialize with URL lang if valid, otherwise fallback to "c++" (or first available)
  const initialLang =
    urlLang && codeObject[urlLang]
      ? urlLang
      : codeObject["c++"]
        ? "c++"
        : Object.keys(codeObject)[0];

  const [lang, setLang] = useState<string>(initialLang);
  const [highlightLine, setHighlightLine] = useState<number>(1);

  // Sync language selection to URL
  useEffect(() => {
    if (lang !== searchParams.get("lang")) {
      setSearchParams(
        (prev) => {
          prev.set("lang", lang);
          return prev;
        },
        { replace: true },
      );
    }
  }, [lang, searchParams, setSearchParams]);

  const {
    isEditor,
    isAlgorithms,
    snippets,
    activeSnippetId,
    activeCode,
    hasUnsavedChanges,
    updateCode,
    saveSnippet,
    createSnippet,
    deleteSnippet,
    switchSnippet,
    renameSnippet,
    restoreOriginalAlgoCode,
  } = useSnippets(codeObject[initialLang] || "");

  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTitleSubmit = (id: string) => {
    if (editingTitleValue.trim()) {
      renameSnippet(id, editingTitleValue);
    }
    setEditingTitleId(null);
  };

  const [splitOffset, setSplitOffset] = useState<number>(35);
  const [ghostOffset, setGhostOffset] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isVisualizerCollapsed, setIsVisualizerCollapsed] = useState(false);
  const [hasViewedConventions, setHasViewedConventions] = useState(() => {
    return localStorage.getItem("hasViewedConventions") === "true";
  });
  const [hideMobileWarning, setHideMobileWarning] = useState(() => {
    return localStorage.getItem("hideMobileWarning") === "true";
  });
  const [shareCopied, setShareCopied] = useState(false);

  const handleShareCode = () => {
    const url = new URL(window.location.href);
    if (isAlgorithms && !hasUnsavedChanges) {
      url.searchParams.delete("code");
    } else {
      const compressed = LZString.compressToEncodedURIComponent(activeCode);
      url.searchParams.set("code", compressed);
    }
    navigator.clipboard.writeText(url.toString());
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const handleShowInfo = () => {
    setShowInfo(true);
    if (!hasViewedConventions) {
      localStorage.setItem("hasViewedConventions", "true");
      setHasViewedConventions(true);
    }
  };
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only reset code if we switch language, not on every re-render
    // But since useSnippets handles local state, we can just call updateCode
    // if we wanted to sync it back. For now, we only support C++ multi-files properly.
  }, [lang, codeObject]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1024;

      let newPercentage;
      if (isDesktop) {
        newPercentage = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        newPercentage = ((e.clientY - rect.top) / rect.height) * 100;
      }

      const minMargin = isDesktop ? 20 : 10;
      const maxMargin = isDesktop ? 80 : 90;
      const collapseMin = isDesktop ? 10 : 5;
      const collapseMax = isDesktop ? 90 : 95;

      if (newPercentage < collapseMin) {
        setIsEditorCollapsed(true);
        setIsDragging(false);
        setGhostOffset(null);
      } else if (newPercentage > collapseMax) {
        setIsVisualizerCollapsed(true);
        setIsDragging(false);
        setGhostOffset(null);
      } else {
        if (newPercentage < minMargin) newPercentage = minMargin;
        if (newPercentage > maxMargin) newPercentage = maxMargin;
        setGhostOffset(newPercentage);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setGhostOffset((prevGhost) => {
        if (prevGhost !== null) setSplitOffset(prevGhost);
        return null;
      });
    };

    if (isDragging) {
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
  }, [isDragging]);

  const langArray: string[] = Object.keys(codeObject);

  return (
    <>
      <NavigationBlocker when={isEditor && hasUnsavedChanges} onConfirm={() => {}} />
      <div
        ref={containerRef}
        className="relative flex flex-col lg:flex-row items-stretch w-full h-full p-1 bg-bg text-text overflow-hidden min-h-0"
      >
        {/* Small Screen Warning Banner */}
        {!hideMobileWarning && (
          <div className="lg:hidden w-full flex items-center justify-between gap-2 px-3 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[calc(11rem/16)] font-medium shrink-0 rounded-sm mb-1 z-20">
            <div className="flex items-center gap-2">
              <MonitorPlay className="w-4 h-4 shrink-0" />
              <span>
                This visualizer is optimized for desktop. For the best experience, please use a
                larger screen.
              </span>
            </div>
            <button
              onClick={() => {
                setHideMobileWarning(true);
                localStorage.setItem("hideMobileWarning", "true");
              }}
              className="p-1 hover:bg-orange-500/20 rounded shrink-0 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ─── Left Pane: Code Editor ────────────────────────────────────────── */}
        {isEditorCollapsed ? (
          <div
            className="flex flex-row lg:flex-col items-center justify-center py-3 lg:py-4 px-4 lg:px-2 glass rounded-lg border border-border shrink-0 cursor-pointer hover:bg-surface-2 transition-colors z-10"
            onClick={() => setIsEditorCollapsed(false)}
            title="Expand Editor"
          >
            <Code size={16} className="text-muted mr-3 lg:mr-0 lg:mb-4 shrink-0" />
            <span className="text-[calc(10rem/16)] font-semibold text-muted uppercase tracking-widest lg:hidden">
              Code Editor
            </span>
            <span
              className="hidden lg:block text-[calc(10rem/16)] font-semibold text-muted uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Code Editor
            </span>
          </div>
        ) : (
          <div
            style={{
              flex:
                lang === "c++"
                  ? isVisualizerCollapsed
                    ? "1 1 0%"
                    : `${splitOffset} 1 0%`
                  : "1 1 0%",
            }}
            className="flex flex-col glass rounded-sm overflow-hidden shadow-lg border border-border min-h-0 min-w-0 max-h-screen transition-all duration-300"
          >
            <div className="flex items-center justify-between px-2 lg:px-3 py-1 lg:py-1.5 bg-surface-2 border-b border-border shrink-0">
              <div className="flex items-center gap-1 bg-surface rounded-full p-0.5 border border-border shadow-sm max-w-[40%] lg:max-w-1/2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">
                {langArray.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setLang(item)}
                    className={cn(
                      `px-3 py-1 text-xs font-mono font-medium transition-all duration-200 cursor-pointer ${
                        lang === item
                          ? "nav-pill-active shadow-sm"
                          : "text-muted hover:text-text hover:bg-surface-2 rounded-full"
                      }`,
                    )}
                  >
                    {item.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  {!hasViewedConventions && (
                    <span className="absolute inset-0 rounded-full border-[2px] border-amber-500 animate-ping opacity-75 pointer-events-none"></span>
                  )}
                  <button
                    onClick={handleShowInfo}
                    className={cn(
                      `p-1 rounded-full transition-colors relative z-10 ${
                        !hasViewedConventions
                          ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                          : "text-accent hover:bg-surface-3"
                      }`,
                    )}
                    title="Visualizer Naming Conventions"
                  >
                    <Info size={14} />
                  </button>
                </div>
                {(isEditor || isAlgorithms) && (
                  <button
                    onClick={handleShareCode}
                    className={cn(
                      "flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors",
                      shareCopied
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-surface-3 text-muted hover:text-text",
                    )}
                    title={isAlgorithms ? "Share your custom algorithm mod" : "Copy Shareable Link"}
                  >
                    {shareCopied ? <Check size={12} /> : <Share2 size={12} />}
                    {shareCopied ? "Copied" : "Share"}
                  </button>
                )}
                <span className="text-[calc(10rem/16)] font-semibold text-muted uppercase tracking-wider ml-1">
                  Editor
                </span>
                <button
                  onClick={() => setIsEditorCollapsed(true)}
                  className="p-1 hover:bg-surface-3 rounded text-muted transition-colors ml-1"
                  title="Collapse Editor"
                >
                  <ChevronLeft size={14} className="hidden lg:block" />
                  <ChevronUp size={14} className="lg:hidden" />
                </button>
              </div>
            </div>

            <div className="flex-1 w-full relative min-h-0 min-w-0">
              <CodeEditor
                code={activeCode}
                lang={lang}
                highlightLine={highlightLine}
                setCode={updateCode}
              />
            </div>

            {/* Bottom Toolbar: Snippets and Actions */}
            <div className="bg-surface-2 border-t border-border px-2 lg:px-3 py-1 lg:py-2 flex items-center justify-between z-20 w-full shrink-0 min-h-[40px]">
              {isEditor && lang === "c++" ? (
                <div className="flex items-center gap-2">
                  <div className="relative" ref={dropdownRef}>
                    {editingTitleId === activeSnippetId ? (
                      <input
                        type="text"
                        autoFocus
                        value={editingTitleValue}
                        onChange={(e) => setEditingTitleValue(e.target.value)}
                        onBlur={() => handleTitleSubmit(activeSnippetId!)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleTitleSubmit(activeSnippetId!);
                          if (e.key === "Escape") setEditingTitleId(null);
                        }}
                        className="bg-surface text-text text-sm rounded-md border border-accent px-3 py-1 outline-none w-40 font-medium shadow-sm"
                      />
                    ) : (
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          const snippet = snippets.find((s) => s.id === activeSnippetId);
                          if (snippet) {
                            setEditingTitleId(snippet.id);
                            setEditingTitleValue(snippet.title);
                            setIsDropdownOpen(false);
                          }
                        }}
                        className="flex items-center justify-between w-40 bg-surface hover:bg-surface-3 text-text text-sm rounded-md border border-border px-3 py-1 transition-colors focus:outline-none shadow-sm"
                      >
                        <span className="truncate font-medium">
                          {snippets.find((s) => s.id === activeSnippetId)?.title ||
                            "Select Snippet"}
                          {hasUnsavedChanges && <span className="text-accent ml-1">*</span>}
                        </span>
                        <ChevronDown
                          size={14}
                          className={cn(
                            "text-muted transition-transform duration-200",
                            isDropdownOpen && "rotate-180",
                          )}
                        />
                      </button>
                    )}

                    {isDropdownOpen && !editingTitleId && (
                      <div className="absolute bottom-full left-0 mb-1 w-48 bg-surface border border-border rounded-md shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        {snippets.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              switchSnippet(s.id);
                              setIsDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-surface-2 text-text transition-colors flex items-center justify-between group"
                          >
                            <span className="truncate pr-2">
                              {s.title}
                              {activeSnippetId === s.id && hasUnsavedChanges && (
                                <span className="text-accent ml-1">*</span>
                              )}
                            </span>
                            {activeSnippetId === s.id && (
                              <Check size={14} className="text-accent shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1 border-l border-border/50 pl-2 ml-1">
                    <button
                      onClick={createSnippet}
                      className="p-1.5 hover:bg-surface-3 rounded-md text-muted hover:text-text transition-colors"
                      title="New Snippet"
                    >
                      <FilePlus size={14} />
                    </button>
                    {editingTitleId !== activeSnippetId && (
                      <button
                        onClick={() => {
                          const snippet = snippets.find((s) => s.id === activeSnippetId);
                          if (snippet) {
                            setEditingTitleId(snippet.id);
                            setEditingTitleValue(snippet.title);
                            setIsDropdownOpen(false);
                          }
                        }}
                        className="p-1.5 hover:bg-surface-3 rounded-md text-muted hover:text-text transition-colors"
                        title="Rename Snippet"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                    {snippets.length > 1 && (
                      <button
                        onClick={() => {
                          deleteSnippet(activeSnippetId!);
                          setIsDropdownOpen(false);
                        }}
                        className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md text-muted transition-colors"
                        title="Delete Current Snippet"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                {isEditor && (
                  <button
                    onClick={() => saveSnippet()}
                    disabled={!hasUnsavedChanges}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                      hasUnsavedChanges
                        ? "bg-accent text-white hover:bg-accent-2 shadow-sm cursor-pointer"
                        : "bg-surface-3 text-muted cursor-not-allowed opacity-50",
                    )}
                    title="Save Snippet"
                  >
                    <Save size={14} />
                    <span>Save</span>
                  </button>
                )}
                {isAlgorithms && hasUnsavedChanges && (
                  <button
                    onClick={restoreOriginalAlgoCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 transition-colors cursor-pointer"
                    title="Restore Original Source Code"
                  >
                    <RotateCcw size={14} />
                    <span>Restore</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        {/* ─── Expandable/Resizable Divider ──────────────────────────────────── */}
        {lang === "c++" && !isEditorCollapsed && !isVisualizerCollapsed && (
          <div
            onMouseDown={() => {
              setIsDragging(true);
              setGhostOffset(splitOffset);
            }}
            className="flex items-center justify-center p-px lg:p-0 lg:w-3 shrink-0 cursor-row-resize lg:cursor-col-resize group z-10"
          >
            <div
              className={cn(`
            w-12 h-1 lg:w-1 lg:h-12 rounded-full transition-colors duration-200
            ${isDragging ? "bg-accent" : "bg-border group-hover:bg-accent-2"}
          `)}
            />
          </div>
        )}

        {/* ─── Right Pane: Visual Ground ─────────────────────────────────────── */}
        {isVisualizerCollapsed ? (
          <div
            className="flex flex-row lg:flex-col items-center justify-center py-3 lg:py-4 px-4 lg:px-2 glass rounded-lg border border-border shrink-0 cursor-pointer hover:bg-surface-2 transition-colors z-10"
            onClick={() => setIsVisualizerCollapsed(false)}
            title="Expand Visualizer"
          >
            <MonitorPlay size={16} className="text-muted mr-3 lg:mr-0 lg:mb-4 shrink-0" />
            <span className="text-[calc(10rem/16)] font-semibold text-muted uppercase tracking-widest lg:hidden">
              Visual Output
            </span>
            <span
              className="hidden lg:block text-[calc(10rem/16)] font-semibold text-muted uppercase tracking-widest"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              Visual Output
            </span>
          </div>
        ) : (
          <div
            style={
              lang === "c++"
                ? {
                    flex: isEditorCollapsed ? "1 1 0%" : `${100 - splitOffset} 1 0%`,
                    position: "relative",
                  }
                : {
                    position: "absolute",
                    bottom: "0.75rem",
                    right: "0.75rem",
                    zIndex: 20,
                  }
            }
            className={cn(
              `flex flex-col overflow-hidden glass rounded-sm shadow-lg border border-border transition-all duration-300 ${
                lang === "c++"
                  ? "min-h-0 min-w-0 max-h-screen"
                  : "w-[calc(100vw-1rem)] sm:w-[320px] max-w-1/2 bg-surface/90 backdrop-blur-md"
              }`,
            )}
          >
            <div className="px-2 lg:px-3 py-1 lg:py-1.5 bg-surface-2 border-b border-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsVisualizerCollapsed(true)}
                  className="p-1 hover:bg-surface-3 rounded text-muted transition-colors"
                  title="Collapse Visualizer"
                >
                  <ChevronRight size={14} className="hidden lg:block" />
                  <ChevronDown size={14} className="lg:hidden" />
                </button>
                <span className="text-[calc(9rem/16)] sm:text-[calc(10rem/16)] font-semibold text-muted uppercase tracking-wider font-display">
                  Visualizer Output
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[calc(9rem/16)] sm:text-[calc(10rem/16)] text-muted font-mono">
                  {lang === "c++" ? "Active" : "Inactive"}
                </span>

                <div
                  className={cn(
                    `w-2 h-2 rounded-full aspect-square shadow-sm ${
                      lang === "c++" ? "bg-success animate-pulse" : "bg-red-400"
                    }`,
                  )}
                />
              </div>
            </div>

            <div className="flex-1 relative bg-surface overflow-hidden flex flex-col min-h-0 min-w-0 p-1">
              <VisualGround code={activeCode} lang={lang} setHighlightLine={setHighlightLine} />
            </div>
          </div>
        )}
        {/* ─── Naming Conventions Modal ──────────────────────────────────────── */}
        {showInfo && (
          <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-border rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2 shrink-0">
                <h2 className="text-sm font-bold text-text flex items-center gap-2">
                  <Info size={16} className="text-accent" /> Visualizer Naming Conventions
                </h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-surface-3 rounded text-muted hover:text-text transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 md:p-6 styled-scrollbar bg-bg">
                <VisualizerNamingConventions />
              </div>
            </div>
          </div>
        )}

        {/* ─── Ghost Drag Indicator (The "Feature") ────────────────────────── */}
        {isDragging && ghostOffset !== null && (
          <div
            className="absolute z-50 pointer-events-none transition-none shadow-[0_0_15px_rgba(var(--accent-rgb),0.6)] rounded-full bg-accent"
            style={{
              ...(window.innerWidth >= 1024
                ? {
                    left: `${ghostOffset}%`,
                    top: "10px",
                    bottom: "10px",
                    width: "3px",
                    transform: "translateX(-50%)",
                  }
                : {
                    top: `${ghostOffset}%`,
                    left: "10px",
                    right: "10px",
                    height: "3px",
                    transform: "translateY(-50%)",
                  }),
            }}
          />
        )}
      </div>
    </>
  );
};

export default CodeWindow;
