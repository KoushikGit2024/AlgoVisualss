import React from "react";
import D1Array from "./D1Array";
import D2Array from "./D2Array";
import MapComponent from "./Map";
import SetComponent from "./Set";
import StringComponent from "./String";
import Queue from "./Queue";
import Stack from "./Stack";
import Bitset from "./Bitset";

export interface DynamicPrimitiveProps {
  value: any;
  depth?: number;
}

export const DynamicPrimitive: React.FC<DynamicPrimitiveProps> = ({ value, depth = 0 }) => {
  // Prevent infinite recursion in case of cyclic objects, although the unwrap layer should handle cycles
  if (depth > 5) {
    return <span className="text-muted font-mono italic">[Max Depth Reached]</span>;
  }

  if (value === null) return <span className="text-muted font-mono italic">null</span>;
  if (value === undefined) return <span className="text-muted font-mono italic">undefined</span>;

  if (typeof value === "boolean") {
    return <span className="text-purple-400 font-mono font-bold">{value ? "true" : "false"}</span>;
  }

  if (typeof value === "number") {
    return <span className="text-blue-400 font-mono">{value}</span>;
  }

  if (typeof value === "string") {
    return <span className="text-green-400 font-mono">"{value}"</span>;
  }

  // Arrays (Recursive visualization using D1Array or D2Array)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted font-mono">[]</span>;

    // Check for 2D Array
    if (Array.isArray(value[0])) {
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center">
          <D2Array value={value} />
        </div>
      );
    }

    return (
      <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center">
        <D1Array value={value} />
      </div>
    );
  }

  // Maps / Objects mapped as maps
  if (typeof value === "object") {
    if (value.__type === "map" && Array.isArray(value.entries)) {
      if (value.entries.length === 0) return <span className="text-muted font-mono">{"{}"}</span>;
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center">
          <MapComponent entries={value.entries} />
        </div>
      );
    } else if (value.__type === "set" && Array.isArray(value.values)) {
      if (value.values.length === 0) return <span className="text-muted font-mono">{"Set{}"}</span>;
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center">
          <SetComponent values={value.values} />
        </div>
      );
    } else if (value.__type === "string") {
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center">
          <StringComponent value={value.data || value} />
        </div>
      );
    } else if (value.__type === "queue" && Array.isArray(value.data)) {
      if (value.data.length === 0) return <span className="text-muted font-mono">{"Queue[]"}</span>;
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center overflow-x-auto">
          <Queue value={value.data} />
        </div>
      );
    } else if (value.__type === "stack" && Array.isArray(value.data)) {
      if (value.data.length === 0) return <span className="text-muted font-mono">{"Stack[]"}</span>;
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center overflow-x-auto">
          <Stack value={value.data} />
        </div>
      );
    } else if (value.__type === "bitset") {
      return (
        <div className="transform scale-[0.85] origin-center my-1 w-full flex items-center justify-center overflow-x-auto">
          <Bitset value={value.data || ""} />
        </div>
      );
    } else if (value.__type === "container" && Array.isArray(value.data)) {
      return <DynamicPrimitive value={value.data} depth={depth} />;
    }
    
    // Generic Object
    const entries = Object.entries(value).filter(([k]) => !k.startsWith("__"));
    if (entries.length === 0) return <span className="text-muted font-mono">{"{}"}</span>;

    return (
      <div className="flex flex-col items-center justify-center gap-1 border border-border/50 bg-bg/50 rounded-sm p-1.5 min-w-[60px] w-full">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex flex-row items-stretch justify-center gap-2 text-[calc(11rem/16)] w-full">
            <div className="bg-surface px-1.5 py-0.5 border border-border/50 rounded-sm font-mono font-bold text-accent-2 flex items-center justify-center shrink-0">
              <DynamicPrimitive value={k} depth={depth + 1} />
            </div>
            <span className="text-muted opacity-60 flex items-center justify-center shrink-0">→</span>
            <div className="bg-surface px-1.5 py-0.5 border border-border/50 rounded-sm font-mono flex-1 flex items-center justify-center overflow-hidden">
              <DynamicPrimitive value={v} depth={depth + 1} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
};
