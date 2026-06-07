import type { ListBlock } from "../../Pages/documentation/components/types";

export default function ListParser({ data }: { data: ListBlock }) {
  return (
    <ul className="space-y-3 list-none pl-1 my-2 mx-4">
      {data.items.map((item, i) => (
        <li 
          key={i} 
          dangerouslySetInnerHTML={{ __html: item }}
          // Using 'em' units ensures the bullet scales perfectly with the parent font size
          className="relative pl-[1.5em] text-[var(--muted)] leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-[0.35em] before:h-[0.35em] before:bg-[var(--accent)] before:rounded-full"
        />
      ))}
    </ul>
  );
}