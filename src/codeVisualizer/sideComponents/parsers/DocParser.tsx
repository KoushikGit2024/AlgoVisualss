import { AlertTriangle, Clock, HardDrive, Terminal } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { AlgorithmItem, TopicItem } from "./types";
import { renderNodes } from "./DocNodeRenderer";
import { ComplexityCard, TYPE_STYLES } from "./ComplexityCard";

const DocParser = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted p-6 bg-bg">
        <AlertTriangle size={40} className="mb-3 opacity-40" />
        <p className="font-mono text-sm">No data available.</p>
      </div>
    );
  }

  /* ── TOPIC VIEW ─────────────────────────────────────────────────────────── */

  if (Array.isArray(data.items)) {
    const topic = data as TopicItem;
    return (
      <div className="w-full h-full overflow-y-auto styled-scrollbar bg-bg">
        <article className="max-w-4xl mx-auto px-6 py-8 pb-16">{renderNodes(topic.about)}</article>
      </div>
    );
  }

  /* ── SUBTOPIC VIEW ──────────────────────────────────────────────────────── */
  const sub = data as AlgorithmItem;

  return (
    <div className="w-full h-full overflow-y-auto styled-scrollbar bg-bg">
      <article className="max-w-4xl mx-auto px-5 py-6 pb-16 flex flex-col gap-7">
        <section>
          {sub.about && sub.about.length > 0 && sub.about[0].tag === "h1" ? (
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border mt-6 first:mt-0">
              <h1 className="text-xl font-bold text-accent m-0 p-0 border-none">
                {sub.about[0].text}
              </h1>
              {sub.type && (
                <span
                  className={cn(
                    `shrink-0 inline-block font-mono text-[calc(10rem/16)] font-semibold tracking-widest px-2.5 py-0.5 rounded-full border ${
                      TYPE_STYLES[sub.type] ?? TYPE_STYLES.Medium
                    }`,
                  )}
                >
                  {sub.type.toUpperCase()}
                </span>
              )}
            </div>
          ) : (
            sub.type && (
              <div className="flex justify-end mb-4">
                <span
                  className={cn(
                    `inline-block font-mono text-[calc(10rem/16)] font-semibold tracking-widest px-2.5 py-0.5 rounded-full border ${
                      TYPE_STYLES[sub.type] ?? TYPE_STYLES.Medium
                    }`,
                  )}
                >
                  {sub.type.toUpperCase()}
                </span>
              </div>
            )
          )}
          {sub.about && sub.about.length > 0 && sub.about[0].tag === "h1"
            ? renderNodes(sub.about.slice(1))
            : renderNodes(sub.about)}
        </section>

        {sub.timeComplexityCalculation && sub.spaceComplexityCalculation && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sub.timeComplexityCalculation && (
              <ComplexityCard
                title="Time Complexity"
                icon={<Clock size={16} />}
                iconColorClass="text-accent"
                notationColorClass="border-accent/30 bg-accent/10 text-accent"
                notation={sub.timeComplexityCalculation.notation}
                best={sub.timeComplexityCalculation.best}
                average={sub.timeComplexityCalculation.average}
                worst={sub.timeComplexityCalculation.worst}
              />
            )}
            {sub.spaceComplexityCalculation && (
              <ComplexityCard
                title="Space Complexity"
                icon={<HardDrive size={16} />}
                iconColorClass="text-accent-3"
                notationColorClass="border-accent-3/30 bg-accent-3/10 text-accent-3"
                notation={sub.spaceComplexityCalculation.notation}
                best={sub.spaceComplexityCalculation.best}
                average={sub.spaceComplexityCalculation.average}
                worst={sub.spaceComplexityCalculation.worst}
              />
            )}
          </div>
        )}

        {sub.pseudoCodeandStepexplanation && (
          <section className="bg-surface-2 border border-border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-surface-3 px-4 py-2.5 border-b border-border flex items-center gap-2 shrink-0">
              <Terminal size={16} className="text-accent-2 shrink-0" />
              <h2 className="font-semibold text-[calc(13rem/16)] text-text">
                Algorithm Walkthrough
              </h2>
            </div>
            <div className="p-4">{renderNodes(sub.pseudoCodeandStepexplanation, true)}</div>
          </section>
        )}
      </article>
    </div>
  );
};

export default DocParser;
