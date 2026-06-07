// src/components/MdxLayout.tsx
import React from 'react';
import { MDXProvider } from '@mdx-js/react';

// This maps Markdown elements to Tailwind-styled HTML
const components = {
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-extrabold mt-8 mb-4 text-[var(--text)]" {...props} />,
  h2: (props: any) => <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-3 text-[var(--text)]" {...props} />,
  p: (props: any) => <p className="leading-[1.75] text-[var(--text)] mb-4 tracking-tight" {...props} />,
  a: (props: any) => <a className="text-[var(--accent)] hover:underline font-semibold" target="_blank" rel="noopener noreferrer" {...props} />,
  ul: (props: any) => <ul className="space-y-2 list-disc list-inside mb-4 text-[var(--muted)]" {...props} />,
  li: (props: any) => <li className="leading-relaxed" {...props} />,
  // If you use inline code like `this`
  code: (props: any) => <code className="bg-[var(--surface-2)] text-[var(--text)] font-mono text-[0.85em] px-1.5 py-0.5 rounded-md border border-[var(--border)]" {...props} />
};

export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </div>
  );
}