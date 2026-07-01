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
  setCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const getTheme = () =>
    document.documentElement.getAttribute("data-theme") === "dark"
      ? "custom-dark"
      : "custom-light";

  const [editorTheme, setEditorTheme] = useState(getTheme);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Light Theme
    monaco.editor.defineTheme("custom-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#1A1523",

        "editorLineNumber.foreground": "#6B6787",
        "editorLineNumber.activeForeground": "#6366F1",

        "editorCursor.foreground": "#6366F1",
        "editor.selectionBackground": "#CFC9FF66",
        "editor.inactiveSelectionBackground": "#E2DEFF88",

        "editor.lineHighlightBackground": "#F0EFFE",
      },
    });

    // Dark Theme
    monaco.editor.defineTheme("custom-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#13101F",
        "editor.foreground": "#EDE9FF",

        "editorLineNumber.foreground": "#8878B0",
        "editorLineNumber.activeForeground": "#818CF8",

        "editorCursor.foreground": "#818CF8",
        "editor.selectionBackground": "#3730A366",
        "editor.inactiveSelectionBackground": "#3730A344",

        "editor.lineHighlightBackground": "#1A1630",
      },
    });

    monaco.editor.setTheme(getTheme());

    updateHighlight(highlightLine);
  };

  const updateHighlight = (line?: number) => {
    if (!editorRef.current) return;

    if (!line || line <= 0) {
      decorationIdsRef.current = editorRef.current.deltaDecorations(
        decorationIdsRef.current,
        []
      );
      return;
    }

    decorationIdsRef.current = editorRef.current.deltaDecorations(
      decorationIdsRef.current,
      [
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
      ]
    );

    editorRef.current.revealLineInCenterIfOutsideViewport(line);
  };

  useEffect(() => {
    updateHighlight(highlightLine);
  }, [highlightLine]);

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      const theme = getTheme();

      setEditorTheme(theme);

      const monaco = (window as any).monaco;
      if (monaco) {
        monaco.editor.setTheme(theme);
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
          background: var(--glow-soft);
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
        theme={editorTheme}
        value={code}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
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