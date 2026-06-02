import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ────────────────────────────────────────────────────────────────────
type Frame = {
  array: number[];
  comparing: number[];
  swapping: number[];
  sorted: number[];
  pivot?: number;
};

type AlgorithmKey = "bubble" | "insertion" | "selection" | "merge";

type AlgorithmMeta = {
  label: string;
  timeComplexity: string;
  spaceComplexity: string;
  stable: boolean;
  description: string;
};

// ─── Algorithm Metadata ───────────────────────────────────────────────────────
const ALGO_META: Record<AlgorithmKey, AlgorithmMeta> = {
  bubble: {
    label: "Bubble Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stable: true,
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they're in the wrong order.",
  },
  insertion: {
    label: "Insertion Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stable: true,
    description: "Builds a sorted array one element at a time by shifting elements to make room for the current element.",
  },
  selection: {
    label: "Selection Sort",
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)",
    stable: false,
    description: "Finds the minimum element and places it at the beginning, repeating for the rest of the array.",
  },
  merge: {
    label: "Merge Sort",
    timeComplexity: "O(n log n)",
    spaceComplexity: "O(n)",
    stable: true,
    description: "Divides the array into halves, recursively sorts them, then merges the sorted halves together.",
  },
};

// ─── Frame Generators ─────────────────────────────────────────────────────────
function getBubbleSortFrames(initial: number[]): Frame[] {
  const frames: Frame[] = [];
  const arr = [...initial];
  const sorted: number[] = [];

  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });

  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - i - 1; j++) {
      frames.push({ array: [...arr], comparing: [j, j + 1], swapping: [], sorted: [...sorted] });
      if (arr[j] > arr[j + 1]) {
        frames.push({ array: [...arr], comparing: [], swapping: [j, j + 1], sorted: [...sorted] });
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });
      }
    }
    sorted.unshift(arr.length - 1 - i);
  }
  sorted.unshift(0);
  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });
  return frames;
}

function getInsertionSortFrames(initial: number[]): Frame[] {
  const frames: Frame[] = [];
  const arr = [...initial];
  const sorted: number[] = [0];

  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });

  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0) {
      frames.push({ array: [...arr], comparing: [j, j - 1], swapping: [], sorted: [...sorted] });
      if (arr[j] < arr[j - 1]) {
        frames.push({ array: [...arr], comparing: [], swapping: [j, j - 1], sorted: [...sorted] });
        [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
        j--;
        frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });
      } else {
        break;
      }
    }
    sorted.push(i);
  }
  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: arr.length }, (_, k) => k) });
  return frames;
}

function getSelectionSortFrames(initial: number[]): Frame[] {
  const frames: Frame[] = [];
  const arr = [...initial];
  const sorted: number[] = [];

  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [] });

  for (let i = 0; i < arr.length - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < arr.length; j++) {
      frames.push({ array: [...arr], comparing: [minIdx, j], swapping: [], sorted: [...sorted], pivot: i });
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      frames.push({ array: [...arr], comparing: [], swapping: [i, minIdx], sorted: [...sorted] });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });
    }
    sorted.push(i);
  }
  sorted.push(arr.length - 1);
  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });
  return frames;
}

function getMergeSortFrames(initial: number[]): Frame[] {
  const frames: Frame[] = [];
  const arr = [...initial];
  const sorted: number[] = [];

  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [] });

  function merge(arr: number[], left: number, mid: number, right: number) {
    const L = arr.slice(left, mid + 1);
    const R = arr.slice(mid + 1, right + 1);
    let i = 0, j = 0, k = left;
    while (i < L.length && j < R.length) {
      frames.push({ array: [...arr], comparing: [left + i, mid + 1 + j], swapping: [], sorted: [...sorted] });
      if (L[i] <= R[j]) {
        arr[k++] = L[i++];
      } else {
        arr[k++] = R[j++];
      }
      frames.push({ array: [...arr], comparing: [], swapping: [k - 1], sorted: [...sorted] });
    }
    while (i < L.length) { arr[k++] = L[i++]; }
    while (j < R.length) { arr[k++] = R[j++]; }
    frames.push({ array: [...arr], comparing: [], swapping: [], sorted: [...sorted] });
  }

  function mergeSort(arr: number[], left: number, right: number) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
  }

  mergeSort(arr, 0, arr.length - 1);
  frames.push({ array: [...arr], comparing: [], swapping: [], sorted: Array.from({ length: arr.length }, (_, k) => k) });
  return frames;
}

const FRAME_GENERATORS: Record<AlgorithmKey, (arr: number[]) => Frame[]> = {
  bubble:    getBubbleSortFrames,
  insertion: getInsertionSortFrames,
  selection: getSelectionSortFrames,
  merge:     getMergeSortFrames,
};

// ─── Playback Hook ────────────────────────────────────────────────────────────
function useVisualizer(frames: Frame[], speedMs: number) {
  const [idx, setIdx]         = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => { 
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIdx(0); 
    setPlaying(false); 
  }, [frames]);

  useEffect(() => {
    if (!playing || idx >= frames.length - 1) {
      if (idx >= frames.length - 1) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPlaying(false);
      }
      return;
    }
    const t = setTimeout(() => setIdx((p) => p + 1), speedMs);
    return () => clearTimeout(t);
  }, [playing, idx, frames.length, speedMs]);

  const play    = useCallback(() => setPlaying(true),  []);
  const pause   = useCallback(() => setPlaying(false), []);
  const reset   = useCallback(() => { setPlaying(false); setIdx(0); }, []);
  const stepFwd = useCallback(() => { setPlaying(false); setIdx((p) => Math.min(p + 1, frames.length - 1)); }, [frames.length]);
  const stepBwd = useCallback(() => { setPlaying(false); setIdx((p) => Math.max(p - 1, 0)); }, []);

  return {
    frame: frames[idx],
    idx,
    total: frames.length,
    playing,
    play, pause, reset, stepFwd, stepBwd,
    progress: frames.length > 1 ? idx / (frames.length - 1) : 0,
  };
}

// ─── Bar Colors ───────────────────────────────────────────────────────────────
function barColor(i: number, frame: Frame): string {
  if (frame.sorted.includes(i))    return "var(--success)";
  if (frame.swapping.includes(i))  return "var(--accent-3)";
  if (frame.comparing.includes(i)) return "var(--accent)";
  if (frame.pivot === i)           return "var(--accent-2)";
  return "color-mix(in srgb, var(--accent) 22%, var(--surface-2))";
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SortingVisualizer() {
  const [algo, setAlgo]       = useState<AlgorithmKey>("bubble");
  const [speed, setSpeed]     = useState(120);
  const [arraySize, setArraySize] = useState(20);
  const [inputArr, setInputArr] = useState<number[]>(() =>
    Array.from({ length: 20 }, () => Math.floor(Math.random() * 90) + 10)
  );

  const frames = useMemo(() => FRAME_GENERATORS[algo](inputArr), [algo, inputArr]);
  const { frame, idx, total, playing, play, pause, reset, stepFwd, stepBwd, progress } = useVisualizer(frames, speed);

  const meta = ALGO_META[algo];
  const isDone = idx === total - 1;

  const randomize = useCallback(() => {
    setInputArr(Array.from({ length: arraySize }, () => Math.floor(Math.random() * 90) + 10));
  }, [arraySize]);

  const handleSizeChange = useCallback((n: number) => {
    setArraySize(n);
    setInputArr(Array.from({ length: n }, () => Math.floor(Math.random() * 90) + 10));
  }, []);

  const max = Math.max(...frame.array);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "var(--bg)", color: "var(--text)" }}
    >
      {/* ── Header bar ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div>
          <h1 className="text-base font-semibold" style={{ color: "var(--text)" }}>
            Sorting Visualizer
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>
            {meta.description}
          </p>
        </div>
        {/* Complexity badges */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Time",  val: meta.timeComplexity },
            { label: "Space", val: meta.spaceComplexity },
            { label: "Stable", val: meta.stable ? "Yes" : "No" },
          ].map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                fontFamily: "var(--font-geist-mono, monospace)",
              }}
            >
              <span style={{ color: "var(--accent)" }}>{b.label}</span>
              <span style={{ color: "var(--text)", fontWeight: 600 }}>{b.val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Algorithm selector + controls ── */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 px-6 py-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {/* Algorithm tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          {(Object.keys(ALGO_META) as AlgorithmKey[]).map((key) => (
            <button
              key={key}
              onClick={() => { setAlgo(key); reset(); }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: algo === key ? "var(--accent)" : "transparent",
                color: algo === key ? "#fff" : "var(--muted)",
              }}
            >
              {ALGO_META[key].label}
            </button>
          ))}
        </div>

        {/* Config controls */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Array size */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--muted)" }}>Size</label>
            <input
              type="range" min={8} max={40} value={arraySize}
              onChange={(e) => handleSizeChange(Number(e.target.value))}
              className="w-20 accent-(--accent)"
            />
            <span className="text-xs w-6 text-right" style={{ color: "var(--text)", fontFamily: "var(--font-geist-mono, monospace)" }}>
              {arraySize}
            </span>
          </div>
          {/* Speed */}
          <div className="flex items-center gap-2">
            <label className="text-xs" style={{ color: "var(--muted)" }}>Speed</label>
            <input
              type="range" min={20} max={500} value={500 - speed + 20}
              onChange={(e) => setSpeed(500 - Number(e.target.value) + 20)}
              className="w-20 accent-(--accent)"
            />
          </div>
          {/* Randomize */}
          <button
            onClick={randomize}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--accent)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            }}
          >
            Randomize
          </button>
        </div>
      </div>

      {/* ── Visualizer area ── */}
      <div className="flex-1 flex flex-col px-6 py-6 gap-4 overflow-hidden">
        {/* Legend */}
        <div className="flex items-center gap-5">
          {[
            { label: "Comparing", color: "var(--accent)" },
            { label: "Swapping",  color: "var(--accent-3)" },
            { label: "Sorted",    color: "var(--success)" },
            { label: "Default",   color: "color-mix(in srgb, var(--accent) 22%, var(--surface-2))" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
              <span className="text-xs" style={{ color: "var(--muted)" }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* Bars */}
        <div
          className="flex-1 flex items-end gap-[2px] rounded-2xl p-4 min-h-0"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
          }}
        >
          <AnimatePresence initial={false}>
            {frame.array.map((val, i) => (
              <motion.div
                key={i}
                layout
                animate={{
                  height: `${(val / max) * 100}%`,
                  backgroundColor: barColor(i, frame),
                }}
                transition={{ type: "spring", stiffness: 700, damping: 35 }}
                className="flex-1 min-w-0 rounded-t-sm"
                title={String(val)}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <motion.div
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }}
          />
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs" style={{ color: "var(--muted)", fontFamily: "var(--font-geist-mono, monospace)" }}>
            Frame {idx + 1} / {total}
          </span>

          <div className="flex items-center gap-2">
            {/* Step back */}
            <button
              onClick={stepBwd}
              disabled={idx === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-30"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" />
              </svg>
            </button>

            {/* Play / Pause */}
            <button
              onClick={playing ? pause : (isDone ? reset : play)}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
              style={{
                background: "var(--accent)",
                color: "#fff",
                boxShadow: "0 0 0 0 var(--glow)",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px 4px var(--glow)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 0 var(--glow)"; }}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                </svg>
              ) : playing ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            {/* Step forward */}
            <button
              onClick={stepFwd}
              disabled={idx >= total - 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 disabled:opacity-30"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" />
              </svg>
            </button>

            {/* Reset */}
            <button
              onClick={reset}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150 ml-1"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent-3)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-3)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
              </svg>
            </button>
          </div>

          {isDone && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--success) 12%, transparent)",
                color: "var(--success)",
                border: "1px solid color-mix(in srgb, var(--success) 25%, transparent)",
              }}
            >
              ✓ Sorted!
            </motion.span>
          )}
        </div>
      </div>
    </div>
  );
}