import {
  Lightbulb,
  AlertTriangle,
  Info,
  Clock,
  HardDrive,
  Terminal,
} from "lucide-react";

/* ─── Schema types ─────────────────────────────────────────────────────────── */
export type ContentNode =
  | { tag: "h1" | "h2" | "h3" | "h4"; text: string }
  | { tag: "p"; text: string }
  | { tag: "blockquote"; text: string }
  | { tag: "ul" | "ol"; items: string[] }
  | { tag: "dl"; items: { term: string; desc: string }[] }
  | { tag: "code"; language: string; text: string }
  | { tag: "table"; headers: string[]; rows: string[][] }
  | { tag: "note"; variant: "tip" | "warning" | "info"; text: string }
  | { tag: "katex" | "math"; text: string };

export type ContentBlock = ContentNode[];

export interface AlgorithmItem {
  name: string;
  href: string;
  type: "Easy" | "Medium" | "Hard";
  about: ContentBlock;
  timeComplexityCalculation: {
    notation: string;
    best: ContentBlock;
    average: ContentBlock;
    worst: ContentBlock;
  };
  spaceComplexityCalculation: {
    notation: string;
    best: ContentBlock;
    average: ContentBlock;
    worst: ContentBlock;
  };
  pseudoCodeandStepexplanation: ContentBlock;
  codes?: Record<string, string>;
}

export interface TopicItem {
  name: string;
  href: string;
  about: ContentBlock;
  items: AlgorithmItem[];
}

/* ─── Node renderer ────────────────────────────────────────────────────────── */
export const renderNodes = (nodes: ContentBlock, isInsideCard = false) => {
  if (!nodes || !Array.isArray(nodes)) return null;

  return nodes.map((node, index) => {
    if (!node || !node.tag) return null;

    switch (node.tag) {
      /* ── Headings ──────────────────────────────────────────────────── */
      case "h1":
        return (
          <h1
            key={index}
            className={`text-xl font-bold text-accent mb-3 pb-2 border-b border-border ${
              isInsideCard ? "mt-0" : "mt-6 first:mt-0"
            }`}
          >
            {node.text}
          </h1>
        );
      case "h2":
        return (
          <h2
            key={index}
            className="text-base font-semibold text-text mt-5 mb-2 first:mt-0"
          >
            {node.text}
          </h2>
        );
      case "h3":
        return (
          <h3
            key={index}
            className="text-[13px] font-semibold text-text/80 mt-4 mb-1.5 uppercase tracking-wide"
          >
            {node.text}
          </h3>
        );
      case "h4":
        return (
          <h4
            key={index}
            className="text-[13px] font-medium text-text/70 mt-3 mb-1"
          >
            {node.text}
          </h4>
        );

      /* ── Paragraph ─────────────────────────────────────────────────── */
      case "p":
        return (
          <p
            key={index}
            className="text-[13px] leading-relaxed text-muted mb-3 last:mb-0"
          >
            {node.text}
          </p>
        );

      /* ── Blockquote ────────────────────────────────────────────────── */
      case "blockquote":
        return (
          <blockquote
            key={index}
            className="border-l-[3px] border-accent bg-accent/5 px-3 py-2 my-3 rounded-r-md italic text-[13px] text-muted leading-relaxed"
          >
            {node.text}
          </blockquote>
        );

      /* ── Lists ─────────────────────────────────────────────────────── */
      case "ul":
        return (
          <ul
            key={index}
            className="list-disc pl-5 mb-3 text-[13px] text-muted space-y-1.5 last:mb-0"
          >
            {node.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
      case "ol":
        return (
          <ol
            key={index}
            className="list-decimal pl-5 mb-3 text-[13px] text-muted space-y-1.5 last:mb-0"
          >
            {node.items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ol>
        );

      /* ── Definition list ───────────────────────────────────────────── */
      case "dl":
        return (
          <dl key={index} className="mb-3 flex flex-col gap-2 text-[13px]">
            {node.items.map((item, i) => (
              <div
                key={i}
                className="bg-surface-2 p-2.5 rounded-md border border-border"
              >
                <dt className="font-semibold text-accent mb-0.5">
                  {item.term}
                </dt>
                <dd className="text-muted leading-relaxed">{item.desc}</dd>
              </div>
            ))}
          </dl>
        );

      /* ── Code block ────────────────────────────────────────────────── */
      case "code":
        return (
          <div
            key={index}
            className="my-3 rounded-lg overflow-hidden border border-border bg-[#0D0D0D]"
          >
            {/* Header bar */}
            <div className="flex items-center justify-between bg-surface-2 px-3 py-1.5 border-b border-border">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              </div>
              <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                {node.language || "text"}
              </span>
            </div>
            {/* Code content */}
            <pre className="p-4 overflow-x-auto text-[12.5px] font-mono text-[#C9D1D9] leading-relaxed styled-scrollbar">
              <code>{node.text}</code>
            </pre>
          </div>
        );

      /* ── Table ─────────────────────────────────────────────────────── */
      case "table":
        return (
          <div
            key={index}
            className="my-4 overflow-x-auto rounded-lg border border-border styled-scrollbar"
          >
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="bg-surface-2">
                  {node.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-3 py-2 border-b border-r border-border font-semibold text-text last:border-r-0 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {node.rows.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-border last:border-b-0 odd:bg-surface even:bg-surface-2/40 hover:bg-accent/5 transition-colors"
                  >
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className="px-3 py-2 border-r border-border last:border-r-0 text-muted"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      /* ── Note / Callout ────────────────────────────────────────────── */
      case "note": {
        const cfg = {
          tip: {
            icon: <Lightbulb size={15} />,
            classes:
              "border-green-400/30 bg-green-400/5 text-green-100/90",
            iconClass: "text-green-400",
            label: "TIP",
            labelClass: "text-green-400",
          },
          warning: {
            icon: <AlertTriangle size={15} />,
            classes:
              "border-yellow-400/30 bg-yellow-400/5 text-yellow-100/90",
            iconClass: "text-yellow-400",
            label: "WARNING",
            labelClass: "text-yellow-400",
          },
          info: {
            icon: <Info size={15} />,
            classes: "border-blue-400/30 bg-blue-400/5 text-blue-100/90",
            iconClass: "text-blue-400",
            label: "NOTE",
            labelClass: "text-blue-400",
          },
        };
        const c = cfg[node.variant] ?? cfg.info;

        return (
          <div
            key={index}
            className={`my-3 p-3 rounded-lg border ${c.classes} flex items-start gap-2.5`}
          >
            <div className={`${c.iconClass} shrink-0 mt-0.5`}>{c.icon}</div>
            <div>
              <span
                className={`${c.labelClass} font-mono text-[10px] font-bold tracking-widest mr-2`}
              >
                {c.label}
              </span>
              <span className="text-[12.5px] leading-relaxed">{node.text}</span>
            </div>
          </div>
        );
      }

      /* ── Math / KaTeX ──────────────────────────────────────────────── */
      case "katex":
      case "math":
        return (
          <div
            key={index}
            className="font-mono text-accent my-3 p-3 bg-surface-2 border border-border rounded-lg text-center text-[13px]"
          >
            {node.text}
          </div>
        );

      default:
        return null;
    }
  });
};

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Thin horizontal rule between best / average / worst case blocks */
const CaseDivider = () => (
  <div
    className="flex items-center gap-2 my-1"
    role="separator"
    aria-hidden="true"
  >
    <div className="flex-1 h-px bg-border" />
    <span className="text-[10px] font-mono text-border tracking-widest">
      ···
    </span>
    <div className="flex-1 h-px bg-border" />
  </div>
);

/** Type-difficulty badge */
const TYPE_STYLES: Record<string, string> = {
  Easy:   "bg-green-400/10  text-green-400  border-green-400/25",
  Medium: "bg-yellow-400/10 text-yellow-400 border-yellow-400/25",
  Hard:   "bg-red-400/10   text-red-400    border-red-400/25",
};

/* ─── Complexity card ──────────────────────────────────────────────────────── */
interface ComplexityCardProps {
  title: string;
  icon: React.ReactNode;
  iconColorClass: string;
  notationColorClass: string;  // for the badge bg/text/border
  notation?: string;
  best?: ContentBlock;
  average?: ContentBlock;
  worst?: ContentBlock;
}

const ComplexityCard = ({
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
      <span className={`${iconColorClass} shrink-0`}>{icon}</span>
      <h3 className="font-semibold text-[13px] text-text">{title}</h3>
      {notation && (
        <span
          className={`ml-auto font-mono text-[11px] px-2 py-0.5 rounded border ${notationColorClass}`}
        >
          {notation}
        </span>
      )}
    </div>

    {/* Best / Average / Worst */}
    <div className="p-4 flex flex-col">
      {best    && <div>{renderNodes(best, true)}</div>}
      {average && <><CaseDivider /><div>{renderNodes(average, true)}</div></>}
      {worst   && <><CaseDivider /><div>{renderNodes(worst, true)}</div></>}
    </div>
  </section>
);

/* ─── Main component ───────────────────────────────────────────────────────── */
const DocParser = ({ data }: { data: any }) => {
  /* No data */
  if (!data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-muted p-6 bg-bg">
        <AlertTriangle size={40} className="mb-3 opacity-40" />
        <p className="font-mono text-sm">No data available.</p>
      </div>
    );
  }

  /* ── TOPIC VIEW ─────────────────────────────────────────────────────────── */
  // A topic has `items[]`; a subtopic does not.
  if (Array.isArray(data.items)) {
    const topic = data as TopicItem;
    return (
      <div className="w-full h-full overflow-y-auto styled-scrollbar bg-bg">
        <div className="max-w-4xl mx-auto px-6 py-8 pb-16">
          {renderNodes(topic.about)}
        </div>
      </div>
    );
  }

  /* ── SUBTOPIC VIEW ──────────────────────────────────────────────────────── */
  const sub = data as AlgorithmItem;

  return (
    <div className="w-full h-full overflow-y-auto styled-scrollbar bg-bg">
      <div className="max-w-4xl mx-auto px-5 py-6 pb-16 flex flex-col gap-7">

        {/* ── Section 1: About / Introduction ─────────────────────────── */}
        <section>
          {/* Difficulty badge */}
          {sub.type && (
            <span
              className={`inline-block font-mono text-[10px] font-semibold tracking-widest px-2.5 py-0.5 rounded-full border mb-4 ${
                TYPE_STYLES[sub.type] ?? TYPE_STYLES.Medium
              }`}
            >
              {sub.type.toUpperCase()}
            </span>
          )}
          {renderNodes(sub.about)}
        </section>
        {/* ── Section 2: Pseudocode & step explanation ─────────────────── */}
        {Array.isArray(sub.pseudoCodeandStepexplanation) &&
          sub.pseudoCodeandStepexplanation.length > 0 && (
            <section className="bg-surface border border-border rounded-lg overflow-hidden">
              {/* Section header */}
              <div className="bg-surface-2 px-4 py-2.5 border-b border-border flex items-center gap-2">
                <Terminal size={15} className="text-accent-3 shrink-0" />
                <h3 className="font-semibold text-[13px] text-text">
                  Implementation &amp; Reasoning
                </h3>
              </div>

              {/* Content — rendered in the ORIGINAL authored order.
                  The data already follows the pattern:
                    h1 title → p intro → code block → h2 steps → ol → h2 why → p
                  No reordering needed; trust the schema. */}
              <div className="p-4">
                {renderNodes(sub.pseudoCodeandStepexplanation, true)}
              </div>
            </section>
          )}

        {/* ── Section 3: Complexity grid ───────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <ComplexityCard
            title="Time Complexity"
            icon={<Clock size={15} />}
            iconColorClass="text-accent"
            notationColorClass="bg-accent/10 text-accent border-accent/20"
            notation={sub.timeComplexityCalculation?.notation}
            best={sub.timeComplexityCalculation?.best}
            average={sub.timeComplexityCalculation?.average}
            worst={sub.timeComplexityCalculation?.worst}
          />
          <ComplexityCard
            title="Space Complexity"
            icon={<HardDrive size={15} />}
            iconColorClass="text-accent-2"
            notationColorClass="bg-accent-2/10 text-accent-2 border-accent-2/20"
            notation={sub.spaceComplexityCalculation?.notation}
            best={sub.spaceComplexityCalculation?.best}
            average={sub.spaceComplexityCalculation?.average}
            worst={sub.spaceComplexityCalculation?.worst}
          />
        </div>  
      </div>
    </div>
  );
};

export default DocParser;