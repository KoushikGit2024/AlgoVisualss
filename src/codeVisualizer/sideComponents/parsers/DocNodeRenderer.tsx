import { Lightbulb, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../../lib/utils";
import type { ContentBlock } from "./types";

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
            className={cn(
              `text-xl font-bold text-accent mb-3 pb-2 border-b border-border ${
                isInsideCard ? "mt-0" : "mt-6 first:mt-0"
              }`,
            )}
          >
            {node.text}
          </h1>
        );
      case "h2":
        return (
          <h2 key={index} className="text-base font-semibold text-text mt-5 mb-2 first:mt-0">
            {node.text}
          </h2>
        );
      case "h3":
        return (
          <h3
            key={index}
            className="text-[calc(13rem/16)] font-semibold text-text/80 mt-4 mb-1.5 uppercase tracking-wide"
          >
            {node.text}
          </h3>
        );
      case "h4":
        return (
          <h4 key={index} className="text-[calc(13rem/16)] font-medium text-text/70 mt-3 mb-1">
            {node.text}
          </h4>
        );

      /* ── Paragraph ─────────────────────────────────────────────────── */
      case "p":
        return (
          <p
            key={index}
            className="text-[calc(13rem/16)] leading-relaxed text-muted mb-3 last:mb-0"
          >
            {node.text}
          </p>
        );

      /* ── Blockquote ────────────────────────────────────────────────── */
      case "blockquote":
        return (
          <blockquote
            key={index}
            className="border-l-[3px] border-accent bg-accent/5 px-3 py-2 my-3 rounded-r-md italic text-[calc(13rem/16)] text-muted leading-relaxed"
          >
            {node.text}
          </blockquote>
        );

      /* ── Lists ─────────────────────────────────────────────────────── */
      case "ul":
        return (
          <ul
            key={index}
            className="list-disc pl-5 mb-3 text-[calc(13rem/16)] text-muted space-y-1.5 last:mb-0"
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
            className="list-decimal pl-5 mb-3 text-[calc(13rem/16)] text-muted space-y-1.5 last:mb-0"
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
          <dl key={index} className="mb-3 flex flex-col gap-2 text-[calc(13rem/16)]">
            {node.items.map((item, i) => (
              <div key={i} className="bg-surface-2 p-2.5 rounded-md border border-border">
                <dt className="font-semibold text-accent mb-0.5">{item.term}</dt>
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
              <span className="font-mono text-[calc(10rem/16)] text-muted uppercase tracking-widest">
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
            classes: "border-green-500/30 bg-green-500/10 text-[var(--text)]",
            iconClass: "text-green-500",
            label: "TIP",
            labelClass: "text-green-500 font-bold",
          },
          warning: {
            icon: <AlertTriangle size={15} />,
            classes: "border-yellow-500/30 bg-yellow-500/10 text-[var(--text)]",
            iconClass: "text-yellow-500",
            label: "WARNING",
            labelClass: "text-yellow-500 font-bold",
          },
          info: {
            icon: <Info size={15} />,
            classes: "border-blue-500/30 bg-blue-500/10 text-[var(--text)]",
            iconClass: "text-blue-500",
            label: "NOTE",
            labelClass: "text-blue-500 font-bold",
          },
        };
        const c = cfg[node.variant] ?? cfg.info;

        return (
          <div
            key={index}
            className={cn(`my-3 p-3 rounded-lg border ${c.classes} flex items-start gap-2.5`)}
          >
            <div className={cn(`${c.iconClass} shrink-0 mt-0.5`)}>{c.icon}</div>
            <div>
              <span
                className={cn(
                  `${c.labelClass} font-mono text-[calc(10rem/16)] tracking-widest mr-2`,
                )}
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
            className="font-mono text-accent my-3 p-3 bg-surface-2 border border-border rounded-lg text-center text-[calc(13rem/16)]"
          >
            {node.text}
          </div>
        );

      default:
        return null;
    }
  });
};
