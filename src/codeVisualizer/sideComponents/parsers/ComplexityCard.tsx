import React from "react";
import { cn } from "../../../lib/utils";
import type { ContentBlock } from "./types";
import { renderNodes } from "./DocNodeRenderer";

export const CaseDivider = () => (
  <div className="flex items-center gap-2 my-1" role="separator" aria-hidden="true">
    <div className="flex-1 h-px bg-border" />
    <span className="text-[calc(10rem/16)] font-mono text-border tracking-widest">···</span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

export const TYPE_STYLES: Record<string, string> = {
  Easy: "bg-green-400/10  text-green-400  border-green-400/25",
  Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/25",
  Hard: "bg-red-400/10   text-red-400    border-red-400/25",
};

interface ComplexityCardProps {
  title: string;
  icon: React.ReactNode;
  iconColorClass: string;
  notationColorClass: string;
  notation?: string;
  best?: ContentBlock;
  average?: ContentBlock;
  worst?: ContentBlock;
}

export const ComplexityCard = ({
  title,
  icon,
  iconColorClass,
  notationColorClass,
  notation,
  best,
  average,
  worst,
}: ComplexityCardProps) => (
  <section className="bg-surface border border-border rounded-lg overflow-hidden flex flex-col">
    {/* Card header */}
    <div className="bg-surface-2 px-4 py-2.5 border-b border-border flex items-center gap-2 shrink-0">
      <span className={cn(`${iconColorClass} shrink-0`)}>{icon}</span>
      <h2 className="font-semibold text-[calc(13rem/16)] text-text">{title}</h2>
      {notation && (
        <span
          className={cn(
            `ml-auto font-mono text-[calc(11rem/16)] px-2 py-0.5 rounded border ${notationColorClass}`,
          )}
        >
          {notation}
        </span>
      )}
    </div>

    {/* Best / Average / Worst */}
    <div className="p-4 flex flex-col">
      {best && <div>{renderNodes(best, true)}</div>}
      {average && (
        <>
          <CaseDivider />
          <div>{renderNodes(average, true)}</div>
        </>
      )}
      {worst && (
        <>
          <CaseDivider />
          <div>{renderNodes(worst, true)}</div>
        </>
      )}
    </div>
  </section>
);
