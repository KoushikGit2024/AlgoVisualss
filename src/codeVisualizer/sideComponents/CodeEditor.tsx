import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import languageMap from './languages/langMap';
const CodeEditor = ({
  code,
  lang,
  highlightLine,
  setCode
}: {
  code: string;
  lang: string;
  highlightLine?: number;
  setCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
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
        range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
        options: {
          isWholeLine: true,
          className: 'active-line-highlight',
          linesDecorationsClassName: 'active-line-gutter'
        }
      }
    ]);
    
    editorRef.current.revealLineInCenterIfOutsideViewport(line);
  };

  useEffect(() => {
    updateHighlight(highlightLine);
  }, [highlightLine]);
  // console.log(languageMap[lang.toLowerCase()]," ",lang)
  return (
    <div className="flex-1 h-full w-full bg-[#1e1e1e] relative">
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

      <Editor
        height="100%"
        width="100%"
        language={languageMap[lang.toLowerCase()]}
        theme="light"
        value={code}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
        }}
        onChange={(value) => {
          if (value !== undefined) setCode(value);
        }}
      />
    </div>
  );
};

export default CodeEditor;