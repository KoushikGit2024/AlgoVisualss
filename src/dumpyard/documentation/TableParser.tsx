import type { TableBlock } from "../../Pages/documentation/components/types";

export default function TableParser({ data }: { data: TableBlock }) {
  return (
    <div className="w-full flex items-center justify-center my-4">
      <div className="overflow-x-auto rounded-sm border border-[var(--border)] shadow-sm bg-[var(--surface)] w-[90%] flex">
        <table className="text-left border-collapse w-full">
          <thead className="bg-[var(--surface-2)] border-b border-[var(--border)]">
            <tr>
              {data.header.map((col, i) => (
                <th 
                  key={i} 
                  dangerouslySetInnerHTML={{ __html: col }}
                  className="px-5 py-4 font-bold text-[var(--text)] tracking-wide" 
                />
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {data.body.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[color-mix(in_srgb,var(--surface-2)_50%,transparent)] transition-colors duration-150">
                {row.map((cell, cellIndex) => (
                  <td 
                    key={cellIndex} 
                    dangerouslySetInnerHTML={{ __html: String(cell) }} 
                    className="px-5 py-3.5 text-[var(--muted)]" 
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>  
    </div>
  );
}