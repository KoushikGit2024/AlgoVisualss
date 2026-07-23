import { useBlocker } from "react-router-dom";
import { useEffect } from "react";

export function NavigationBlocker({ 
  when, 
  onConfirm 
}: { 
  when: boolean;
  onConfirm: () => void;
}) {
  const blocker = useBlocker(when);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (when) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [when]);

  if (blocker.state === "blocked") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-surface rounded-lg border border-border shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-text mb-2">Unsaved Changes</h3>
            <p className="text-muted text-sm mb-6">
              You have unsaved changes in your code. Are you sure you want to leave this page? Your unsaved work will be lost.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => blocker.reset()}
                className="px-4 py-2 text-sm font-medium text-text bg-surface-2 hover:bg-surface-3 border border-border rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  blocker.proceed();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
              >
                Leave without saving
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
