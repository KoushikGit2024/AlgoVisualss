import React from "react";

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

  // Arrays (Recursive visualization of internal elements)
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted font-mono">[]</span>;

    return (
      <div className="flex flex-row items-center gap-1 border border-border/50 bg-bg/50 rounded-sm p-1">
        {value.map((v, i) => (
          <div
            key={i}
            className="px-1.5 py-0.5 min-w-[20px] text-center border border-border/30 bg-surface rounded-sm flex items-center justify-center"
          >
            <DynamicPrimitive value={v} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  }

  // Maps / Objects mapped as maps
  if (typeof value === "object") {
    // If it's explicitly tagged as a map or we have an object
    let entries: [any, any][] = [];
    let isSet = false;

    if (value.__type === "map" && Array.isArray(value.entries)) {
      entries = value.entries;
    } else if (value.__type === "set" && Array.isArray(value.values)) {
      entries = value.values.map((v: any) => [v, true]);
      isSet = true;
    } else if (value.__type === "container" && Array.isArray(value.data)) {
      return <DynamicPrimitive value={value.data} depth={depth} />;
    } else {
      // Generic Object
      entries = Object.entries(value).filter(([k]) => !k.startsWith("__"));
    }

    if (entries.length === 0)
      return <span className="text-muted font-mono">{isSet ? "Set{}" : "{}"}</span>;

    return (
      <div className="flex flex-col gap-1 border border-border/50 bg-bg/50 rounded-sm p-1.5 min-w-[60px]">
        {entries.map(([k, v], i) => (
          <div key={i} className="flex flex-row items-center gap-2 text-[calc(11rem/16)]">
            <div className="bg-surface px-1.5 py-0.5 border border-border/50 rounded-sm font-mono font-bold text-accent-2">
              <DynamicPrimitive value={k} depth={depth + 1} />
            </div>
            {!isSet && (
              <>
                <span className="text-muted opacity-60">→</span>
                <div className="bg-surface px-1.5 py-0.5 border border-border/50 rounded-sm font-mono">
                  <DynamicPrimitive value={v} depth={depth + 1} />
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <span>{String(value)}</span>;
};
