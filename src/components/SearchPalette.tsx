import { useState, useEffect, useRef, useMemo, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, CornerDownLeft, Compass, ArrowRight } from "lucide-react";
import ALGODATA from "../Pages/algorithms/data/AlgoData";
import { cn } from "../lib/utils";

// Helper to extract plain text from ContentNodes
const extractText = (blocks: any[] | undefined): string => {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks
    .map((block) => {
      if (block.text) return block.text;
      if (block.items) {
        if (typeof block.items[0] === "string") return block.items.join(" ");
        return block.items.map((i: any) => `${i.term || ""} ${i.desc || ""}`).join(" ");
      }
      if (block.headers && block.rows) {
        return block.headers.join(" ") + " " + block.rows.flat().join(" ");
      }
      return "";
    })
    .join(" ");
};

// Build flat index
type SearchItem = {
  id: string;
  title: string;
  category: string;
  href: string;
  type?: string;
  searchText: string;
  snippet: string;
};

const SEARCH_INDEX: SearchItem[] = [];

ALGODATA.forEach((cat) => {
  const catText = extractText(cat.about);
  SEARCH_INDEX.push({
    id: cat.href,
    title: cat.name,
    category: "Topic",
    href: cat.href,
    searchText: (cat.name + " " + catText).toLowerCase(),
    snippet: catText.length > 120 ? catText.slice(0, 120) + "..." : catText,
  });

  cat.items?.forEach((item) => {
    let itemText = extractText(item.about);

    // Include complexity in search text
    if (item.timeComplexityCalculation) {
      const tc = item.timeComplexityCalculation;
      itemText +=
        " " +
        (tc.notation || "") +
        " " +
        extractText(tc.best) +
        " " +
        extractText(tc.average) +
        " " +
        extractText(tc.worst);
    }
    if (item.spaceComplexityCalculation) {
      const sc = item.spaceComplexityCalculation;
      itemText +=
        " " +
        (sc.notation || "") +
        " " +
        extractText(sc.best) +
        " " +
        extractText(sc.average) +
        " " +
        extractText(sc.worst);
    }

    const snippetText = extractText(item.about);
    SEARCH_INDEX.push({
      id: item.href,
      title: item.name,
      category: cat.name,
      href: item.href,
      type: item.type,
      searchText: (item.name + " " + itemText).toLowerCase(),
      snippet: snippetText.length > 120 ? snippetText.slice(0, 120) + "..." : snippetText,
    });
  });
});

// A handful of topics to surface as quick suggestions when a query misses.
const FALLBACK_TOPICS = SEARCH_INDEX.filter((i) => i.category === "Topic").slice(0, 4);

// Deterministic accent per category so the same topic always reads as the
// same color across a session — a lightweight way to let people pattern-match
// results by category without needing a legend.
const CATEGORY_HUES = [
  "var(--accent)",
  "var(--accent-2)",
  "var(--accent-3)",
  "var(--ds-graph)",
  "var(--ds-tree)",
  "var(--ds-trie)",
  "var(--ds-matrix)",
];
const categoryColor = (category: string) => {
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) | 0;
  return CATEGORY_HUES[Math.abs(hash) % CATEGORY_HUES.length];
};

// Wrap the first matched substring in a <mark> so people can see *why* a
// result surfaced, not just that it did.
const highlight = (text: string, query: string): ReactNode => {
  if (!query.trim() || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-accent/20 text-accent rounded-[3px] px-[1px] font-semibold">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
};

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter results
  const results = useMemo(() => {
    if (!query.trim()) return SEARCH_INDEX.slice(0, 6); // Quick-access default
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter((item) => item.searchText.includes(q)).slice(0, 20);
  }, [query]);

  // Group results by category, preserving first-seen order, so the list
  // reads as sections instead of one undifferentiated stream.
  const groups = useMemo(() => {
    const map = new Map<string, SearchItem[]>();
    results.forEach((item) => {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    });
    return Array.from(map.entries());
  }, [results]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        isOpen ? onClose() : document.dispatchEvent(new CustomEvent("open-search"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Modal Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view (looked up by data-index since the list is
  // now sectioned with header elements interleaved between rows).
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(
        `[data-index="${selectedIndex}"]`,
      ) as HTMLElement | null;
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.href);
    onClose();
  };

  const TYPE_COLORS: Record<string, string> = {
    Easy: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    Medium: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    Hard: "text-red-400 border-red-400/30 bg-red-400/10",
  };

  // Flat counter used to hand out data-index values as we walk the grouped
  // structure, so keyboard nav stays in sync with the visual order.
  let flatIndex = -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="relative w-full max-w-[640px] bg-[var(--bg)] rounded-xl border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Signature gradient hairline — ties the palette to the brand accent trio */}
            {/* <div
              className="h-[3px] w-full shrink-0"
              style={{ background: "linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))" }}
            /> */}

            {/* Input Header */}
            <div className="flex items-center gap-4 px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)] transition-shadow duration-200 focus-within:shadow-[inset_0_-2px_0_var(--accent)]">
              <Search size={20} className="text-[var(--accent)] shrink-0" strokeWidth={2.25} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search algorithms, data structures..."
                className="flex-1 bg-transparent border-none outline-none text-[var(--text)] text-[calc(16rem/16)] md:text-[calc(18rem/16)] placeholder:text-[var(--muted)]/60 font-medium tracking-tight"
              />
              {query && (
                <span className="hidden sm:block text-[calc(11rem/16)] font-mono font-semibold text-[var(--muted)] shrink-0">
                  {results.length} result{results.length === 1 ? "" : "s"}
                </span>
              )}
              <kbd className="hidden sm:flex items-center justify-center h-6 px-2 rounded-[6px] bg-[var(--surface-2)] border border-[var(--border)] text-[calc(11rem/16)] font-mono font-bold text-[var(--muted)] shrink-0 shadow-sm">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div
              ref={listRef}
              className="max-h-[400px] overflow-y-auto styled-scrollbar p-3 flex flex-col gap-1"
            >
              {!query.trim() && (
                <div className="flex items-center gap-2 px-2 pb-1 pt-0.5">
                  <Compass size={12} className="text-[var(--muted)] opacity-70" />
                  <span className="text-[calc(11rem/16)] font-semibold text-[var(--muted)] uppercase tracking-wider">
                    Jump back in
                  </span>
                </div>
              )}

              {results.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
                    <Search size={20} className="text-[var(--muted)] opacity-50" />
                  </div>
                  <span className="text-[calc(14rem/16)] font-medium text-[var(--muted)]">
                    No results for "{query}"
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 px-6">
                    {FALLBACK_TOPICS.map((topic) => (
                      <button
                        key={topic.id}
                        onClick={() => handleSelect(topic)}
                        className="flex items-center gap-1.5 text-[calc(12rem/16)] font-medium text-[var(--text)] bg-[var(--surface-2)] border border-[var(--border)] rounded-full px-3 py-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                      >
                        {topic.title}
                        <ArrowRight size={11} className="opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                groups.map(([category, items]) => (
                  <div key={category} className="flex flex-col gap-1">
                    {/* Section header */}
                    <div className="sticky top-0 z-10 flex items-center gap-2 px-2 pt-2 pb-1 bg-[var(--bg)]">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: categoryColor(category) }}
                      />
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-[var(--muted)]">
                        {category}
                      </span>
                      <span className="text-[calc(10rem/16)] font-mono text-[var(--muted)] opacity-50">
                        {items.length}
                      </span>
                    </div>

                    {items.map((item) => {
                      flatIndex += 1;
                      const idx = flatIndex;
                      const isActive = idx === selectedIndex;
                      const accent = categoryColor(item.category);

                      return (
                        <button
                          key={item.id}
                          data-index={idx}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={cn(
                            `group relative w-full text-left flex items-start gap-3 pl-4 pr-4 py-3 rounded-lg border transition-all duration-150 outline-none ${
                              isActive
                                ? "bg-[var(--surface-2)] border-[var(--border-2)] shadow-sm"
                                : "border-transparent hover:bg-[var(--surface)]"
                            }`,
                          )}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="search-active-pill"
                              className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full"
                              style={{ backgroundColor: accent }}
                              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                          )}

                          <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-semibold text-[calc(15rem/16)] truncate text-[var(--text)]">
                                {highlight(item.title, query)}
                              </span>
                              {item.type && (
                                <span
                                  className={cn(
                                    `text-[calc(10rem/16)] font-bold font-mono tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${TYPE_COLORS[item.type]}`,
                                  )}
                                >
                                  {item.type.toUpperCase()}
                                </span>
                              )}
                            </div>

                            {item.snippet && (
                              <span
                                className={cn(
                                  `text-[calc(13rem/16)] line-clamp-1 leading-relaxed transition-colors ${
                                    isActive
                                      ? "text-[var(--text)] opacity-80"
                                      : "text-[var(--muted)]"
                                  }`,
                                )}
                              >
                                {highlight(item.snippet, query)}
                              </span>
                            )}
                          </div>

                          {isActive && (
                            <div className="hidden sm:flex items-center self-center shrink-0 ml-2">
                              <CornerDownLeft size={16} className="text-[var(--muted)]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[var(--border)] flex items-center justify-between bg-[var(--surface)]">
              <div className="flex items-center gap-5 text-[calc(11rem/16)] text-[var(--muted)] font-medium">
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <kbd className="flex items-center justify-center w-5 h-5 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] shadow-sm text-xs">
                      ↑
                    </kbd>
                    <kbd className="flex items-center justify-center w-5 h-5 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] shadow-sm text-xs">
                      ↓
                    </kbd>
                  </span>
                  Navigate
                </span>
                <span className="flex items-center gap-2">
                  <kbd className="flex items-center justify-center w-5 h-5 rounded-[4px] bg-[var(--surface)] border border-[var(--border)] shadow-sm text-[calc(10rem/16)]">
                    ↵
                  </kbd>
                  Select
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[calc(11rem/16)] font-mono font-bold opacity-80">
                <Command size={11} className="text-[var(--muted)]" />
                <span className="text-[var(--muted)]">AlgoVisuals</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
