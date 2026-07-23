import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  lastModified: number;
}

export function useSnippets(initialCode: string) {
  const location = useLocation();
  const isEditor = location.pathname.startsWith("/editor");
  const isAlgorithms = location.pathname.startsWith("/algorithms");
  const algoId = isAlgorithms ? location.pathname : null;

  const [snippets, setSnippets] = useState<CodeSnippet[]>([]);
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);
  const [activeCode, setActiveCode] = useState(initialCode);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load from local storage
  useEffect(() => {
    if (isEditor) {
      try {
        const stored = localStorage.getItem("editor-snippets");
        if (stored) {
          const parsed: CodeSnippet[] = JSON.parse(stored);
          if (parsed.length > 0) {
            setSnippets(parsed);
            setActiveSnippetId(parsed[0].id);
            setActiveCode(parsed[0].code);
            return;
          }
        }
      } catch (e) {
        console.error("Failed to parse snippets", e);
      }

      // Fallback to legacy or initial
      const legacyCode = localStorage.getItem("editor-code");
      const codeToUse = legacyCode || initialCode;
      
      const defaultSnippet: CodeSnippet = {
        id: Date.now().toString(),
        title: "Untitled-1",
        code: codeToUse,
        lastModified: Date.now(),
      };
      
      setSnippets([defaultSnippet]);
      setActiveSnippetId(defaultSnippet.id);
      setActiveCode(codeToUse);
    } else if (isAlgorithms && algoId) {
      // In algorithms page
      try {
        const stored = localStorage.getItem(`algo-modifications-${algoId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          setActiveCode(parsed.code);
          setHasUnsavedChanges(true);
          return;
        }
      } catch {}
      setActiveCode(initialCode);
      setHasUnsavedChanges(false);
    } else {
      // In other pages
      setActiveCode(initialCode);
      setHasUnsavedChanges(false);
    }
  }, [isEditor, isAlgorithms, algoId, initialCode]);

  // Update active code
  const updateCode = useCallback((newCode: string) => {
    setActiveCode(newCode);
    if (isEditor && activeSnippetId) {
      const original = snippets.find(s => s.id === activeSnippetId);
      if (original) {
        setHasUnsavedChanges(newCode !== original.code);
      }
    } else if (isAlgorithms && algoId) {
      setHasUnsavedChanges(newCode !== initialCode);
      // Auto-save algorithm modifications
      if (newCode !== initialCode) {
        localStorage.setItem(`algo-modifications-${algoId}`, JSON.stringify({ code: newCode, lastModified: Date.now() }));
      } else {
        localStorage.removeItem(`algo-modifications-${algoId}`);
      }
    }
  }, [isEditor, activeSnippetId, snippets, isAlgorithms, algoId, initialCode]);

  const restoreOriginalAlgoCode = useCallback(() => {
    if (!isAlgorithms || !algoId) return;
    localStorage.removeItem(`algo-modifications-${algoId}`);
    setActiveCode(initialCode);
    setHasUnsavedChanges(false);
  }, [isAlgorithms, algoId, initialCode]);

  // Save snippet
  const saveSnippet = useCallback((newTitle?: string) => {
    if (!isEditor || !activeSnippetId) return;
    
    setSnippets(prev => {
      const updated = prev.map(s => {
        if (s.id === activeSnippetId) {
          return {
            ...s,
            title: newTitle || s.title,
            code: activeCode,
            lastModified: Date.now(),
          };
        }
        return s;
      });
      localStorage.setItem("editor-snippets", JSON.stringify(updated));
      return updated;
    });
    setHasUnsavedChanges(false);
  }, [isEditor, activeSnippetId, activeCode]);

  // Create snippet
  const createSnippet = useCallback(() => {
    const newSnippet: CodeSnippet = {
      id: Date.now().toString(),
      title: `Untitled-${snippets.length + 1}`,
      code: "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello, World!\" << endl;\n    return 0;\n}",
      lastModified: Date.now(),
    };
    
    setSnippets(prev => {
      const updated = [...prev, newSnippet];
      localStorage.setItem("editor-snippets", JSON.stringify(updated));
      return updated;
    });
    setActiveSnippetId(newSnippet.id);
    setActiveCode(newSnippet.code);
    setHasUnsavedChanges(false);
  }, [snippets.length]);

  // Delete snippet
  const deleteSnippet = useCallback((id: string) => {
    if (snippets.length <= 1) return; // Don't delete the last snippet
    
    setSnippets(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem("editor-snippets", JSON.stringify(updated));
      return updated;
    });
    
    if (activeSnippetId === id) {
      const remaining = snippets.filter(s => s.id !== id);
      setActiveSnippetId(remaining[0].id);
      setActiveCode(remaining[0].code);
      setHasUnsavedChanges(false);
    }
  }, [snippets, activeSnippetId]);

  // Switch snippet
  const switchSnippet = useCallback((id: string) => {
    if (hasUnsavedChanges && isEditor) {
      const confirm = window.confirm("You have unsaved changes. Do you want to discard them?");
      if (!confirm) return;
    }
    
    const target = snippets.find(s => s.id === id);
    if (target) {
      setActiveSnippetId(target.id);
      setActiveCode(target.code);
      setHasUnsavedChanges(false);
    }
  }, [snippets, hasUnsavedChanges, isEditor]);

  // Rename snippet
  const renameSnippet = useCallback((id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    setSnippets(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, title: newTitle.trim() } : s);
      localStorage.setItem("editor-snippets", JSON.stringify(updated));
      return updated;
    });
  }, []);

  return {
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
    restoreOriginalAlgoCode
  };
}
