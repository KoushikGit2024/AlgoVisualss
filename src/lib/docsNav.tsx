// src/lib/docsNav.js
// Navigation data for the sidebar.
const NAV = {
  algorithms: {
    id: "algorithms",
    label: "Algorithms",
    color: "#818CF8",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <rect x="1" y="8"   width="2.5" height="6" rx="1" fill="currentColor" />
        <rect x="5" y="5"   width="2.5" height="9" rx="1" fill="currentColor" />
        <rect x="9" y="2"   width="2.5" height="12" rx="1" fill="currentColor" />
        <rect x="13" y="6"  width="2"   height="8"  rx="1" fill="currentColor" />
      </svg>
    ),
    items: [
      { label: "Arrays",               href: "/algorithms/arrays" },
      { label: "Bit Manipulation",     href: "/algorithms/bit_manipulation" },
      { label: "Dynamic Programming",  href: "/algorithms/dynamic_programming" },
      { label: "Graphs",               href: "/algorithms/graphs" },
      { label: "Greedy",               href: "/algorithms/greedy" },
      { label: "Hash Maps",            href: "/algorithms/hash_maps" },
      { label: "Heap",                 href: "/algorithms/heap" },
      { label: "Linked Lists",         href: "/algorithms/linked_lists" },
      { label: "Queues",               href: "/algorithms/queues" },
      { label: "Range Structures",     href: "/algorithms/range_structures" },
      { label: "Recursion",            href: "/algorithms/recursion" },
      { label: "Sorting",              href: "/algorithms/sorting" },
      { label: "Stacks",               href: "/algorithms/stacks" },
      { label: "Strings",              href: "/algorithms/strings" },
      { label: "Trees",                href: "/algorithms/trees" },
      { label: "Tries",                href: "/algorithms/tries" },
    ],
  },

  documentation: {
    id: "documentation",
    label: "Documentation",
    color: "#34D399",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <path d="M2 2h8l3 3v8H2V2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M10 2v3h3M4 8h7M4 10.5h5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    ),
    items: [
      // FIXED BUG-05: hrefs now match the actual folder names
      { label: "JavaScript",   href: "/documentation/javascript" },
      { label: "PostgreSQL",   href: "/documentation/postgre" },
      { label: "React",        href: "/documentation/react" },
      { label: "Tailwind CSS", href: "/documentation/tailwind" },
    ],
  },

  visualizer: {
    id: "visualizer",
    label: "Visualizer",
    color: "#F472B6",
    icon: (
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M7.5 4.5v3.5l2.5 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    items: [
      { label: "LeetCode",   href: "/visualizer/leetcode" },
      { label: "Codeforces", href: "/visualizer/codeforces" },
      { label: "CodeChef",   href: "/visualizer/codechef" },
    ],
  },
};


export { NAV };