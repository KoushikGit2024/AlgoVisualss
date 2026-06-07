// ─── Segment Types (for paragraphs) ───
export type TextSegment = {
  type: "text";
  value: string;
};

export type LinkSegment = {
  type: "link";
  value: string;
  href: string;
};

export type ParagraphSegment = TextSegment | LinkSegment;

// ─── Block Types ───
export interface ParagraphBlock {
  type: "p";
  segments: ParagraphSegment[];
}

export interface HeadingBlock {
  type: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  content: string; 
}

export interface CodeWindowBlock {
  type: "codeWindow";
  code: string;
  output?: string;
  editorLanguage?: string;
  showLang?: boolean;
}

export interface TableBlock {
  type: "table";
  header: string[];
  body: (string | number)[][]; // Accepts 2D arrays of strings or numbers
}

export interface ListBlock {
  type: "ul";
  items: string[];
}

export interface ImageBlock {
  type: "img";
  src: string;
  alt?: string;
  height?: string;
  width?: string;
}

// ─── The Main Union Type ───
export type DocBlock =
  | ParagraphBlock
  | HeadingBlock
  | CodeWindowBlock
  | TableBlock
  | ListBlock
  | ImageBlock;

// ─── Component Props ───
export interface DocParserProps {
  blocks: DocBlock[];
  fontSize?: 'sm' | 'md' | 'lg';
}