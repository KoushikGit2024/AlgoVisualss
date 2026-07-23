export type ContentNode =
  | { tag: "h1" | "h2" | "h3" | "h4"; text: string }
  | { tag: "p"; text: string }
  | { tag: "blockquote"; text: string }
  | { tag: "ul" | "ol"; items: string[] }
  | { tag: "dl"; items: { term: string; desc: string }[] }
  | { tag: "code"; language: string; text: string }
  | { tag: "table"; headers: string[]; rows: string[][] }
  | { tag: "note"; variant: "tip" | "warning" | "info"; text: string }
  | { tag: "katex" | "math"; text: string };

export type ContentBlock = ContentNode[];

export interface AlgorithmItem {
  name: string;
  href: string;
  type: "Easy" | "Medium" | "Hard";
  about: ContentBlock;
  timeComplexityCalculation: {
    notation: string;
    best: ContentBlock;
    average: ContentBlock;
    worst: ContentBlock;
  };
  spaceComplexityCalculation: {
    notation: string;
    best: ContentBlock;
    average: ContentBlock;
    worst: ContentBlock;
  };
  pseudoCodeandStepexplanation: ContentBlock;
  codes?: Record<string, string>;
  related?: { name: string; href: string }[];
}

export interface TopicItem {
  name: string;
  href: string;
  about: ContentBlock;
  items: AlgorithmItem[];
}
