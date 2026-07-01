import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Command, CornerDownLeft } from "lucide-react";
import ALGODATA from "../algorithms/data/categories/AlgoData";
import { cn } from "../../lib/utils";

// Helper to extract plain text from ContentNodes
const extractText = (blocks: any[] | undefined): string => {
  if (!blocks || !Array.isArray(blocks)) return "";
  return blocks.map(block => {
    if (block.text) return block.text;
    if (block.items) {
      if (typeof block.items[0] === 'string') return block.items.join(" ");
      return block.items.map((i: any) => `${i.term || ''} ${i.desc || ''}`).join(" ");
    }
    if (block.headers && block.rows) {
      return block.headers.join(" ") + " " + block.rows.flat().join(" ");
    }
    return "";
  }).join(" ");
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

ALGODATA.forEach(cat => {
  const catText = extractText(cat.about);
  SEARCH_INDEX.push({
    id: cat.href,
    title: cat.name,
    category: "Topic",
    href: cat.href,
    searchText: (cat.name + " " + catText).toLowerCase(),
    snippet: catText.length > 120 ? catText.slice(0, 120) + "..." : catText
  });

  cat.items?.forEach(item => {
    let itemText = extractText(item.about);
    
    // Include complexity in search text
    if (item.timeComplexityCalculation) {
      const tc = item.timeComplexityCalculation;
      itemText += " " + (tc.notation || "") + " " + 
        extractText(tc.best) + " " + 
        extractText(tc.average) + " " + 
        extractText(tc.worst);
    }
    if (item.spaceComplexityCalculation) {
      const sc = item.spaceComplexityCalculation;
      itemText += " " + (sc.notation || "") + " " + 
        extractText(sc.best) + " " + 
        extractText(sc.average) + " " + 
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
      snippet: snippetText.length > 120 ? snippetText.slice(0, 120) + "..." : snippetText
    });
  });
});

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
    if (!query.trim()) return SEARCH_INDEX.slice(0, 5); // Show first 5 by default
    const q = query.toLowerCase();
    return SEARCH_INDEX.filter(item => item.searchText.includes(q)).slice(0, 8); // Max 8 results
  }, [query]);

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

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  const handleSelect = (item: SearchItem) => {
    navigate(item.href);
    onClose();
  };

  const TYPE_COLORS: Record<string, string> = {
    "Easy": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    "Medium": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    "Hard": "text-red-400 border-red-400/30 bg-red-400/10"
  };

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
            className="relative w-full max-w-xl bg-surface rounded-xl border border-border shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Input Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-surface-2/50">
              <Search size={18} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search algorithms, structures, or complexities..."
                className="flex-1 bg-transparent border-none outline-none text-text text-[15px] placeholder:text-muted/70"
              />
              <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-surface border border-border text-[10px] font-mono font-semibold text-muted shrink-0">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div 
              ref={listRef}
              className="max-h-[340px] overflow-y-auto styled-scrollbar p-2 flex flex-col"
            >
              {results.length === 0 ? (
                <div className="py-10 text-center text-muted text-[13px]">
                  No results found for "{query}"
                </div>
              ) : (
                results.map((item, idx) => {
                  const isActive = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 ${
                        isActive ? "bg-surface-2 shadow-sm" : "hover:bg-surface-2/50"
                      }`)}
                    >
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[14px] text-text truncate">{item.title}</span>
                          <span className="text-[10px] text-muted border border-border px-1.5 rounded-sm shrink-0">
                            {item.category}
                          </span>
                          {item.type && (
                            <span className={cn(`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm border shrink-0 ${TYPE_COLORS[item.type]}`)}>
                              {item.type.toUpperCase()}
                            </span>
                          )}
                        </div>
                        {item.snippet && (
                          <span className="text-[12px] text-muted line-clamp-1 leading-relaxed">
                            {item.snippet}
                          </span>
                        )}
                      </div>
                      
                      {isActive && (
                        <div className="hidden sm:flex items-center shrink-0 mt-1">
                          <CornerDownLeft size={14} className="text-accent" />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-surface-2 border-t border-border flex items-center justify-between">
              <div className="flex items-center gap-4 text-[10px] text-muted font-medium">
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface border border-border">↑</kbd> <kbd className="px-1 py-0.5 rounded bg-surface border border-border">↓</kbd> to navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 rounded bg-surface border border-border">↵</kbd> to select</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-muted/70">
                <Command size={10} /> AlgoSearch
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
