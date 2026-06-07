import React from 'react';
import type { DocParserProps } from './types';

// Sub-components
import ParagraphParser from '../../../dumpyard/documentation/ParagraphParser';
import TableParser from '../../../dumpyard/documentation/TableParser';
import ListParser from '../../../dumpyard/documentation/ListParser';
import ImageParser from '../../../dumpyard/documentation/ImageParser';

// Import your CodeWindow directly
import CodeWindow from './parsers/CodeWindow';

export default function DocParser({ blocks, fontSize = 'md' }: DocParserProps) {
  if (!Array.isArray(blocks)) {
    return (
      <div className="p-4 text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg font-medium text-sm">
        Error: Document structure must be an array.
      </div>
    );
  }

  // Maps the font size prop to Tailwind text sizing and gap spacing
  const sizeClasses = {
    sm: 'text-sm gap-4',
    md: 'text-[15.5px] gap-6',
    lg: 'text-lg gap-8'
  };

  return (
    <article className={`flex flex-col w-full max-w-4xl mx-auto ${sizeClasses[fontSize]}`}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'p':
            return <ParagraphParser key={index} data={block} />;
          
          case 'codeWindow':
            // Rendering CodeWindow directly without the wrapper
            return (
              <CodeWindow 
                key={index}
                code={block.code}
                output={block.output}
                editorLanguage={block.editorLanguage || "plaintext"}
                showLang={block.showLang ?? true}
                readOnly={true} 
              />
            );
            
          case 'table':
            return <TableParser key={index} data={block} />;
            
          case 'ul':
            return <ListParser key={index} data={block} />;
            
          case 'img':
            return <ImageParser key={index} data={block} />;
            
          default:
            console.warn(`Unsupported block type encountered.`);
            return null;
        }
      })}
    </article>
  );
}