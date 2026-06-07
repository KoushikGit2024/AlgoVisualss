import type { HeadingBlock } from "../../Pages/documentation/components/types";

export default function HeadingParser({ data }: { data: HeadingBlock }) {
  // Map heading types to Tailwind sizes
  const styles = {
    h1: "text-3xl md:text-4xl font-extrabold mt-8 mb-4",
    h2: "text-2xl md:text-3xl font-bold mt-8 mb-3",
    h3: "text-xl md:text-2xl font-bold mt-6 mb-2",
    h4: "text-lg md:text-xl font-semibold mt-4 mb-2",
    h5: "text-base font-semibold mt-4 mb-1 uppercase tracking-wider text-[var(--muted)]",
    h6: "text-sm font-semibold mt-4 mb-1 uppercase tracking-widest text-[var(--muted)]",
  };

  const Tag = data.type; // Dynamically renders <h1>, <h2>, etc.

  return (
    <Tag 
      className={`${styles[data.type]} text-[var(--text)] tracking-tight leading-snug`}
      dangerouslySetInnerHTML={{ __html: data.content }}
    />
  );
}