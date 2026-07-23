import React from "react";
import { Play, Pause, SkipBack, SkipForward, RotateCcw, RefreshCw } from "lucide-react";
import { cn } from "../../../lib/utils";

interface VisualGroundToolbarProps {
  snapshotsLength: number;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  speed: number;
  setSpeed: React.Dispatch<React.SetStateAction<number>>;
  isCompiling: boolean;
  handleSimulate: () => void;
}

export function VisualGroundToolbar({
  snapshotsLength,
  currentStep,
  setCurrentStep,
  isPlaying,
  setIsPlaying,
  speed,
  setSpeed,
  isCompiling,
  handleSimulate,
}: VisualGroundToolbarProps) {
  return (
    <div className="w-full bg-surface-2 border border-border rounded-sm p-1.5 flex flex-col gap-1.5 shrink-0 mt-auto shadow-sm">
      {/* Progress track */}
      <div className="flex items-center gap-2 w-full px-1">
        <span className="text-[calc(9rem/16)] font-mono text-muted whitespace-nowrap min-w-[35px]">
          {snapshotsLength > 0 ? currentStep + 1 : 0} / {snapshotsLength}
        </span>
        <input
          type="range"
          min={0}
          max={Math.max(0, snapshotsLength - 1)}
          value={currentStep}
          onChange={(e) => {
            setIsPlaying(false);
            setCurrentStep(parseInt(e.target.value));
          }}
          disabled={snapshotsLength === 0}
          className="flex-1 h-1 bg-bg rounded-full border border-border accent-accent cursor-pointer disabled:opacity-50"
        />
      </div>

      {/* Button row */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep(0);
            }}
            disabled={snapshotsLength === 0}
            title="Restart Visualization"
            className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent disabled:opacity-50 rounded-sm text-text transition-all"
          >
            <RotateCcw size={10} />
          </button>
          <button
            onClick={handleSimulate}
            disabled={isCompiling}
            title="Compile & Simulate"
            className={cn(
              `px-2 py-1 text-white border border-transparent rounded-sm text-[calc(9rem/16)] font-bold transition-all shadow-sm flex items-center gap-1 ${
                isCompiling ? "bg-accent/50 cursor-not-allowed" : "bg-accent hover:bg-accent-2"
              }`,
            )}
          >
            {isCompiling ? (
              <RefreshCw size={10} className="animate-spin" />
            ) : (
              <Play size={10} fill="currentColor" />
            )}
            {isCompiling ? "Compiling" : "Simulate"}
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            disabled={currentStep === 0 || snapshotsLength === 0}
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((s) => Math.max(0, s - 1));
            }}
            className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded-sm disabled:opacity-50 transition-colors"
          >
            <SkipBack size={10} fill="currentColor" />
          </button>
          <button
            disabled={snapshotsLength === 0}
            onClick={() => setIsPlaying(!isPlaying)}
            className={cn(
              `p-1.5 rounded-sm text-white transition-all shadow-md disabled:opacity-50 ${
                isPlaying
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-success hover:bg-emerald-500"
              }`,
            )}
          >
            {isPlaying ? (
              <Pause size={10} fill="currentColor" />
            ) : (
              <Play size={10} fill="currentColor" />
            )}
          </button>
          <button
            disabled={currentStep >= snapshotsLength - 1 || snapshotsLength === 0}
            onClick={() => {
              setIsPlaying(false);
              setCurrentStep((s) => Math.min(snapshotsLength - 1, s + 1));
            }}
            className="p-1 bg-surface border border-border hover:bg-surface-2 hover:text-accent rounded-sm disabled:opacity-50 transition-colors"
          >
            <SkipForward size={10} fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <input
            type="range"
            className="w-16 accent-accent h-1 bg-border rounded cursor-pointer"
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            min={1}
            max={1000}
            value={speed}
            step={1}
          />
          <div className="flex items-center">
            <input
              type="number"
              className="w-10 bg-transparent hover:bg-surface focus:bg-surface border border-transparent hover:border-border focus:border-accent text-[calc(9rem/16)] text-accent font-mono rounded-sm px-1 py-0.5 text-right outline-none transition-all"
              style={{ WebkitAppearance: "none", MozAppearance: "textfield" }}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val)) setSpeed(Math.min(1000, Math.max(1, val)));
              }}
              min={1}
              max={1000}
              value={speed}
            />
            <span className="text-[calc(9rem/16)] text-accent font-mono pr-1">ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
