// components/DocLayout.tsx
import React from 'react';
import { MDXProvider } from '@mdx-js/react';

// Define how standard Markdown elements should be styled globally
const mdxComponents = {
  h1: (props: any) => <h1 className="text-3xl md:text-4xl font-extrabold mt-8 mb-4 text-[var(--text)]" {...props} />,
  h2: (props: any) => <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-3 text-[var(--text)]" {...props} />,
  p: (props: any) => <p className="leading-[1.75] text-[var(--text)] mb-4" {...props} />,
  a: (props: any) => (
    <a 
      className="text-[var(--accent)] hover:underline font-semibold transition-colors duration-200 underline-offset-4 decoration-2 decoration-[color-mix(in_srgb,var(--accent)_40%,transparent)] hover:decoration-[var(--accent)]" 
      target="_blank" 
      rel="noopener noreferrer"
      {...props} 
    />
  ),
  ul: (props: any) => <ul className="space-y-3 list-none pl-1 my-4 mx-4" {...props} />,
  li: (props: any) => (
    <li className="relative pl-[1.5em] text-[var(--muted)] leading-relaxed before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-[0.35em] before:h-[0.35em] before:bg-[var(--accent)] before:rounded-full" {...props} />
  ),
  // Add tables, blockquotes, etc., here just like you did in the MarkdownParser!
};

export default function DocLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <MDXProvider components={mdxComponents}>
        {children}
      </MDXProvider>
    </div>
  );
}