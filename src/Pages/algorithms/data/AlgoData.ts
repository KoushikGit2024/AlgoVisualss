/* ───────────────────── Flexible Content Nodes ─────────────────────────────────────
 *
 *  Why this changed:
 *  The old shape `{ h1: string, p: string, ul: { content, li } }` hard-coded
 *  exactly one heading, one paragraph, and one list per block. Real
 *  explanations need multiple paragraphs, sub-headings, code samples,
 *  comparison tables, and callouts in any order. So every "block" is now an
 *  ORDERED ARRAY of typed nodes. A renderer just maps node.tag -> component.
 *
 *  ContentBlock = ContentNode[]
 *
 *  ContentNode (discriminated by `tag`):
 *    { tag: "h1"|"h2"|"h3"|"h4",            text: string }
 *    { tag: "p",                            text: string }
 *    { tag: "blockquote",                   text: string }
 *    { tag: "ul" | "ol",                    items: string[] }
 *    { tag: "dl",                           items: { term: string, desc: string }[] }
 *    { tag: "code",                         language: string, text: string }
 *    { tag: "table",                        headers: string[], rows: string[][] }
 *    { tag: "note",                         variant: "tip"|"warning"|"info", text: string }
 *    { tag: "katex" | "math",               text: string }   // inline/block math expressions
 *
 *  This is a strict superset of the old shape — a parser can still special-case
 *  "h1"/"p"/"ul" if it wants the old look, but now has room for everything else.
 *
 *  AlgorithmItem = {
 *    name, href, type: "Easy"|"Medium"|"Hard",
 *    about: ContentBlock,
 *    timeComplexityCalculation:  { notation: string, best: ContentBlock, average: ContentBlock, worst: ContentBlock },
 *    spaceComplexityCalculation: { notation: string, best: ContentBlock, average: ContentBlock, worst: ContentBlock },
 *    pseudoCodeandStepexplanation: ContentBlock,
 *  }
 * ─────────────────────────────────────────────────────────────────────────── */

import ARRAYS_SECTION from "./categories/Array";
import LINKED_LISTS_SECTION from "./categories/LinkedList";
import STACKS_SECTION from "./categories/Stack";
import HASH_MAPS_SECTION from "./categories/Hashmap";
import STRINGS_SECTION from "./categories/String";
import SORTING_SECTION from "./categories/Sorting";
import HEAP_SECTION from "./categories/Heap";
import TRIES_SECTION from "./categories/Trie";
import QUEUES_SECTION from "./categories/Queue";
import TREES_SECTION from "./categories/Tree";
import DYNAMIC_PROGRAMMING_SECTION from "./categories/DynamicPrograming";
import GRAPHS_SECTION from "./categories/Graph";
import BIT_MANIPULATION_SECTION from "./categories/Bits";
import RANGE_STRUCTURES_SECTION from "./categories/RangeStructures";
import RECURSION_SECTION from "./categories/Recursion";
import GREEDY_SECTION from "./categories/Greedy";
// ─────────────────────────────────────────────────────────────────────────── ^

const ALGODATA = [
  /* ══════════════════════════════════════════════════════════════════════════
     ARRAYS
  ══════════════════════════════════════════════════════════════════════════ */
  ARRAYS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     SORTING
  ══════════════════════════════════════════════════════════════════════════ */
  SORTING_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     GRAPHS
  ══════════════════════════════════════════════════════════════════════════ */
  GRAPHS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     TREES
  ══════════════════════════════════════════════════════════════════════════ */
  TREES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     DYNAMIC PROGRAMMING
  ══════════════════════════════════════════════════════════════════════════ */
  DYNAMIC_PROGRAMMING_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     LINKED LISTS
  ══════════════════════════════════════════════════════════════════════════ */
  LINKED_LISTS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     STACKS
  ══════════════════════════════════════════════════════════════════════════ */
  STACKS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     QUEUES
  ══════════════════════════════════════════════════════════════════════════ */
  QUEUES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     HASH MAPS
  ══════════════════════════════════════════════════════════════════════════ */
  HASH_MAPS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     HEAP
  ══════════════════════════════════════════════════════════════════════════ */
  HEAP_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     RECURSION
  ══════════════════════════════════════════════════════════════════════════ */
  RECURSION_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     STRINGS
  ══════════════════════════════════════════════════════════════════════════ */
  STRINGS_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     TRIES
  ══════════════════════════════════════════════════════════════════════════ */
  TRIES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     GREEDY
  ══════════════════════════════════════════════════════════════════════════ */
  GREEDY_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     BIT MANIPULATION
  ══════════════════════════════════════════════════════════════════════════ */
  BIT_MANIPULATION_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     RANGE STRUCTURES
  ══════════════════════════════════════════════════════════════════════════ */
  RANGE_STRUCTURES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     MATH
  ══════════════════════════════════════════════════════════════════════════ */
  // MATH_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     ADVANCED DATA STRUCTURES
  ══════════════════════════════════════════════════════════════════════════ */
  // ADVANCED_DATA_STRUCTURES_SECTION,

  /* ══════════════════════════════════════════════════════════════════════════
     MISCELLANEOUS
  ══════════════════════════════════════════════════════════════════════════ */
  // MISCELLANEOUS_SECTION,
];

export default ALGODATA;
