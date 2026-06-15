import { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

const CodeEditor = ({
  code,
  lang,
  highlightLine
}: {
  code: string;
  lang: string;
  highlightLine?: number;
}) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  
  // We store the IDs of the active decorations so we can clear/replace them 
  // when the highlightLine prop changes.
  const decorationIdsRef = useRef<string[]>([]);

  // Called once when the Monaco instance is fully loaded
  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    updateHighlight(highlightLine);
  };

  // Function to apply the highlight decoration to the specific line
  const updateHighlight = (line?: number) => {
    if (!editorRef.current) return;
    
    // Clear existing decorations if line is 0 or undefined
    if (!line || line <= 0) {
      decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, []);
      return;
    }

    // Apply new decoration
    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, [
      {
        // Define the range (start and end on the exact same line)
        range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
        options: {
          isWholeLine: true,
          className: 'active-line-highlight',
          linesDecorationsClassName: 'active-line-gutter'
        }
      }
    ]);
    
    // Ensure the highlighted line is scrolled into view
    editorRef.current.revealLineInCenterIfOutsideViewport(line);
  };

  // Re-run the highlight function whenever the prop changes
  useEffect(() => {
    updateHighlight(highlightLine);
  }, [highlightLine]);

  return (
    <div className="flex-1 h-full w-full bg-[#1e1e1e] relative">
      
      {/* Injecting custom styles for the Monaco decorations using your Tailwind variables.
        This gives the active line a soft glow and an accent border in the gutter.
      */}
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
        language={lang}
        theme="vs-dark"
        value={code}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "var(--font-mono)",
          smoothScrolling: true,
          scrollBeyondLastLine: false,
          padding: { top: 16 },
          // Optional: Uncomment the line below to lock the editor while simulating
          // readOnly: true 
        }}
      />
    </div>
  );
};

export default CodeEditor;