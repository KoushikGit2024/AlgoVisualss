import { useRef, useEffect, useState, memo } from "react";
import { Copy, Check } from "lucide-react";
import Editor from "@monaco-editor/react";
import type { OnMount } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import languageMap from "./languages/langMap";

const CodeEditor = ({
  code,
  lang,
  highlightLine,
  setCode,
}: {
  code: string;
  lang: string;
  highlightLine?: number;
  setCode: (value: string) => void;
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const [copied, setCopied] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(() => {
    const f = localStorage.getItem("appFontSize") || "md";
    if (f === "sm") return 11;
    if (f === "lg") return 18;
    return 14;
  });

  useEffect(() => {
    const handleFontSizeChange = () => {
      const f = localStorage.getItem("appFontSize") || "md";
      if (f === "sm") setEditorFontSize(11);
      else if (f === "lg") setEditorFontSize(18);
      else setEditorFontSize(14);
    };
    window.addEventListener("font-size-change", handleFontSizeChange);
    return () => window.removeEventListener("font-size-change", handleFontSizeChange);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const applyDynamicTheme = (monaco: any) => {
    if (!monaco) return;

    const root = document.documentElement;
    const style = getComputedStyle(root);
    const isDark = root.getAttribute("data-theme")?.includes("dark");

    const normalizeColor = (color: string) => {
      // Monaco's internal token parser crashes on 3-digit hex colors (like #fff).
      // We must expand them to 6-digit (#ffffff).
      if (color && color.length === 4 && color.startsWith("#")) {
        return "#" + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
      }
      return color;
    };

    // Fallback colors just in case styles haven't loaded
    const bg = normalizeColor(
      style.getPropertyValue("--surface").trim() || (isDark ? "#13101F" : "#FFFFFF"),
    );
    const text = normalizeColor(
      style.getPropertyValue("--text").trim() || (isDark ? "#EDE9FF" : "#1A1523"),
    );
    const muted = normalizeColor(
      style.getPropertyValue("--muted").trim() || (isDark ? "#8878B0" : "#6B6787"),
    );
    const accent = normalizeColor(
      style.getPropertyValue("--accent").trim() || (isDark ? "#818CF8" : "#6366F1"),
    );
    const surface2 = normalizeColor(
      style.getPropertyValue("--surface-2").trim() || (isDark ? "#1A1630" : "#F0EFFE"),
    );

    monaco.editor.defineTheme("dynamic-theme", {
      base: isDark ? "vs-dark" : "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": bg,
        "editor.foreground": text,
        "editorLineNumber.foreground": muted,
        "editorLineNumber.activeForeground": accent,
        "editorCursor.foreground": accent,
        "editor.selectionBackground": accent + "40", // 25% opacity
        "editor.inactiveSelectionBackground": accent + "20",
        "editor.lineHighlightBackground": surface2,
      },
    });

    monaco.editor.setTheme("dynamic-theme");
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    applyDynamicTheme(monaco);

    updateHighlight(highlightLine);
  };

  const updateHighlight = (line?: number) => {
    if (!editorRef.current) return;

    if (!line || line <= 0) {
      decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, []);
      return;
    }

    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, [
      {
        range: {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "active-line-highlight",
          linesDecorationsClassName: "active-line-gutter",
        },
      },
    ]);

    editorRef.current.revealLineInCenterIfOutsideViewport(line);
  };

  useEffect(() => {
    updateHighlight(highlightLine);
  }, [highlightLine]);

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      const monaco = (window as any).monaco;
      if (monaco) {
        applyDynamicTheme(monaco);
      }
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);
  return (
    <div className="flex-1 h-full w-full relative group">
      <style>{`
        .active-line-highlight {
          background: color-mix(in srgb, var(--accent) 15%, transparent);
        }

        .active-line-gutter {
          background: var(--accent);
          width: 4px !important;
          margin-left: 3px;
        }
      `}</style>

      <button
        onClick={handleCopy}
        className="absolute top-3 right-4 z-10 p-1.5 bg-surface/80 hover:bg-surface border border-border rounded text-muted hover:text-text opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
        title="Copy Code"
      >
        {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
      </button>

      <Editor
        height="100%"
        width="100%"
        language={languageMap[lang.toLowerCase()]}
        theme="dynamic-theme"
        value={code}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: editorFontSize,
          fontFamily: "var(--font-mono)",
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 76 },

          automaticLayout: true,

          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
        }}
        onChange={(value) => {
          if (value !== undefined) {
            setCode(value);
          }
        }}
      />
    </div>
  );
};

export default memo(CodeEditor);
