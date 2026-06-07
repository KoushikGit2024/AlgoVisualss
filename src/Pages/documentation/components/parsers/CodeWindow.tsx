import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Code2, Terminal, Check, Copy } from "lucide-react";

type CodeWindowProps = {
  code: string;
  output?: string;
  editorLanguage?: string;
  outputLanguage?: string;
  showLang?: boolean;
  height?: string;
  readOnly?: boolean;
};

export default function CodeWindow({
  code,
  output,
  editorLanguage = "cpp",
  outputLanguage = "plaintext",
  showLang = true,
  height = "450px",
  readOnly = true,
}: CodeWindowProps) {
  const [activeTab, setActiveTab] = useState<"code" | "output">("code");
  const [copied, setCopied] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"vs-dark" | "light">("vs-dark");

  useEffect(() => {
    const syncTheme = () => {
      const currentTheme = document.documentElement.getAttribute("data-theme");
      setEditorTheme(currentTheme === "dark" ? "vs-dark" : "light");
    };

    syncTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          syncTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoOptions = {
    readOnly: readOnly,
    domReadOnly: readOnly,
    readOnlyMessage: { value: "" },
    minimap: { enabled: false },
    padding: { top: 0, bottom: 16 },
    scrollBeyondLastLine: false,
    fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
    fontSize: 14,
    fontLigatures: true,
    tabSize: 4,
    insertSpaces: true,
    smoothScrolling: true,
    cursorBlinking: "smooth" as const,
    wordWrap: "off" as const,
    renderLineHighlight: "none" as const,
    scrollbar: {
      vertical: "hidden" as const,
      horizontal: "hidden" as const,
    },
    overviewRulerLanes: 0,
    hideCursorInOverviewRuler: true,
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="relative rounded-[6px] border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden flex flex-col my-6 w-[90%]">
        
        {/* ─── Header & Navigation ─── */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--border)]">
          <div className="flex items-center justify-start gap-3 rounded-[2px] overflow-hidden">
            {showLang && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text)] bg-transparent px-2 py-1 rounded-0 shadow-sm">
                {editorLanguage}
              </span>
            )}

            {output && (
              <div className="flex md:hidden bg-[var(--bg)] rounded-0 border border-[var(--border)]">
                <button
                  onClick={() => setActiveTab("code")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-0 text-xs font-medium transition-colors ${
                    activeTab === "code"
                      ? "bg-[var(--surface-2)] text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Code2 size={14} /> Code
                </button>
                <button
                  onClick={() => setActiveTab("output")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-0 text-xs font-medium transition-colors ${
                    activeTab === "output"
                      ? "bg-[var(--surface-2)] text-[var(--text)] shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  <Terminal size={14} /> Output
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-[var(--muted)] text-xs font-medium">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--text)] transition-colors p-1.5 rounded-md hover:bg-[var(--surface)]"
              title="Copy Code"
            >
              {copied ? <Check size={15} className="text-[#34D399]" /> : <Copy size={15} />}
            </button>
          </div>
        </div>

        {/* ─── Editor Layout ─── */}
        <div className="flex flex-col md:flex-row w-full" style={{ height }}>
          <div className={`flex-1 w-full md:w-1/2 h-full bg-[var(--bg)] ${activeTab === "code" ? "block" : "hidden md:block"}`}>
            <Editor
              height="100%"
              language={editorLanguage}
              value={code}
              theme={editorTheme}
              options={{ ...monacoOptions, lineNumbers: "off" }}
              className="z-10"
            />
          </div>

          {output && (
            <div className={`flex-1 w-full md:w-1/2 h-full bg-[color-mix(in_srgb,var(--surface-2)_40%,transparent)] border-t md:border-t-0 md:border-l border-[var(--border)] ${activeTab === "output" ? "block" : "hidden md:block"}`}>
              <Editor
                height="100%"
                language={outputLanguage}
                value={output}
                theme={editorTheme}
                options={{
                  ...monacoOptions,
                  lineNumbers: "off",
                  padding: { top: 4, bottom: 16 }
                }}
                className="z-10"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}