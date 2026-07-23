import { useState, useEffect } from "react";

interface UsePlaybackOptions {
  snapshotsLength: number;
  code: string;
}

export function usePlayback({ snapshotsLength, code }: UsePlaybackOptions) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(100);

  // Reset on code change
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [code]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement | null;
      if (
        activeEl?.tagName === "INPUT" ||
        activeEl?.tagName === "TEXTAREA" ||
        activeEl?.isContentEditable ||
        activeEl?.closest(".monaco-editor") ||
        activeEl?.closest(".monaco-mouse-cursor-text")
      ) {
        return;
      }

      if (snapshotsLength === 0) return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "ArrowRight":
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep((s) => Math.min(snapshotsLength - 1, s + 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setIsPlaying(false);
          setCurrentStep((s) => Math.max(0, s - 1));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [snapshotsLength]);

  // Interval playback
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && currentStep < snapshotsLength - 1) {
      interval = setInterval(() => {
        setCurrentStep((prev) => prev + 1);
      }, speed);
    } else if (currentStep >= snapshotsLength - 1) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStep, snapshotsLength, speed]);

  return {
    currentStep,
    setCurrentStep,
    isPlaying,
    setIsPlaying,
    speed,
    setSpeed,
  };
}
