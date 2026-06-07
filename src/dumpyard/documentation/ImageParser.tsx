import type { ImageBlock } from "../../Pages/documentation/components/types";

export default function ImageParser({ data }: { data: ImageBlock }) {
  return (
    <figure 
      className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface-2)] my-5 mx-4 shadow-sm group"
      // CRITICAL: Dynamic dimensions must use the style prop, not Tailwind template literals
      style={{ 
        width: data.width || 'auto', 
        height: data.height || 'auto' 
      }}
    >
      <img 
        src={data.src} 
        alt={data.alt || "Documentation figure"} 
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-95"
        loading="lazy"
      />
      {data.alt && (
        <figcaption className="px-5 py-3 text-center text-[0.85em] font-medium text-[var(--muted)] border-t border-[var(--border)] bg-[var(--surface)]">
          {data.alt}
        </figcaption>
      )}
    </figure>
  );
}