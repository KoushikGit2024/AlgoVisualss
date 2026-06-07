import type { ParagraphBlock } from "../../Pages/documentation/components/types";

export default function ParagraphParser({ data }: { data: ParagraphBlock }) {
  return (
    <p className="leading-[1.75] text-[var(--text)] tracking-[-0.01em] mx-4">
      {data.segments.map((segment, i) => {
        if (segment.type === "link") {
          return (
            <a 
              key={i} 
              href={segment.href} 
              target="_blank" 
              rel="noopener noreferrer"
              dangerouslySetInnerHTML={{ __html: segment.value }}
              className="text-[var(--accent)] hover:underline font-semibold transition-colors duration-200 underline-offset-4 decoration-2 decoration-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:decoration-[var(--accent)]"
            />
          );
        }
        return <span key={i} dangerouslySetInnerHTML={{ __html: segment.value }} />;
      })}
    </p>
  );
}