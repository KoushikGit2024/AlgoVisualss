import { useState, useRef, useEffect, useCallback } from "react";
// @ts-ignore
import EngineWorker from "../../../lib/engine.worker?worker";

interface UseEngineWorkerOptions {
  code: string;
  lang: string;
  onSimulationStart: () => void;
}

export function useEngineWorker({ code, lang, onSimulationStart }: UseEngineWorkerOptions) {
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  useEffect(() => {
    setSnapshots([]);
    setError(null);
  }, [code]);

  const handleSimulate = useCallback(() => {
    if (lang !== "c++") return;

    if (workerRef.current) workerRef.current.terminate();

    setIsCompiling(true);
    setError(null);
    setSnapshots([]);

    onSimulationStart();

    const worker = new EngineWorker();
    workerRef.current = worker;

    worker.onmessage = (e) => {
      if (workerRef.current !== worker) return;

      const { success, snapshots: workerSnapshots, error: workerError } = e.data;
      if (success) {
        setSnapshots(workerSnapshots);
      } else {
        console.error("FATAL ENGINE CRASH:", workerError);
        setError(workerError || "Compilation Failed. Check syntax or engine limits.");
      }
      setIsCompiling(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.onerror = (err) => {
      if (workerRef.current !== worker) return;
      console.error("Worker Thread Error:", err);
      setError("A fatal worker error occurred (Out of Memory / Timeout).");
      setIsCompiling(false);
      worker.terminate();
      workerRef.current = null;
    };

    worker.postMessage({ sourceCode: code });
  }, [code, lang, onSimulationStart]);

  const handleResetError = useCallback(() => {
    setError(null);
    setIsCompiling(false);
    setSnapshots([]);
  }, []);

  return {
    snapshots,
    isCompiling,
    error,
    handleSimulate,
    handleResetError,
    setSnapshots,
  };
}
