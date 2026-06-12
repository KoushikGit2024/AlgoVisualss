import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from "@mdx-js/rollup";
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import remarkGfm from 'remark-gfm';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    { 
      enforce: 'pre', 
      ...mdx({
        remarkPlugins: [
          remarkFrontmatter, // Tells MDX to ignore the --- block
          remarkMdxFrontmatter, // Exposes frontmatter as JS exports
          remarkGfm // Tells MDX how to parse tables and strikethroughs
        ]
      }) 
    },
    react({ include: /\.(jsx|tsx|mdx)$/ }),
    tailwindcss()
  ],
})