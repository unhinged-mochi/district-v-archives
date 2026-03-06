import { useEffect, useMemo, useRef, useState } from "react";
import type { Character, Day, Faction } from "../types";

const PLACEHOLDERS = [
  "SEARCH FILES, DOSSIERS, FACTIONS...",
  "QUERY LSPD DATABASE...",
  "ENTER SUSPECT NAME OR CASE NUMBER...",
  "SEARCH CLASSIFIED RECORDS...",
  "ACCESS INTELLIGENCE FILES...",
];

interface CommandPaletteProps {
  characters: Character[];
  days: Day[];
  factions: Faction[];
  onClose: () => void;
  onOpenCharacter: (id: string) => void;
  onOpenDay: (id: string) => void;
  onOpenFaction: (id: string) => void;
}

interface SearchItem {
  category:
    | "SUSPECT"
    | "OFFICER"
    | "MEDIC"
    | "LEGAL"
    | "CIVILIAN"
    | "EMPLOYEE"
    | "CASE FILE"
    | "FACTION";
  handler: () => void;
  id: string;
  label: string;
  searchKey: string;
}

/**
 * Fuzzy match query against target. Returns a numeric score (lower = better match)
 * or null if the query doesn't match at all.
 *
 * Scoring rules:
 *  - Exact substring → strongest bonus (-10000 + position, so earlier = better)
 *  - Consecutive char run in fuzzy match → bonus proportional to run length
 *  - Gap between matched chars → penalty
 */
function fuzzyScore(query: string, target: string): number | null {
  const q = query.toLowerCase();
  const t = target.toLowerCase();

  // Exact substring wins outright
  const exactIdx = t.indexOf(q);
  if (exactIdx !== -1) {
    return -10_000 + exactIdx;
  }

  // Fuzzy: every char in query must appear in order in target
  let score = 0;
  let ti = 0;
  let qi = 0;
  let lastMatch = -1;
  let consecutive = 0;

  while (qi < q.length && ti < t.length) {
    if (q[qi] === t[ti]) {
      if (lastMatch === ti - 1) {
        consecutive++;
        score -= consecutive * 4; // reward runs
      } else {
        consecutive = 0;
        score += (ti - lastMatch - 1) * 2; // gap penalty
      }
      lastMatch = ti;
      qi++;
    }
    ti++;
  }

  if (qi < q.length) {
    return null; // not all query chars found
  }
  return score;
}

const FACTION_CATEGORY: Record<string, SearchItem["category"]> = {
  police: "OFFICER",
  ems: "MEDIC",
  doj: "LEGAL",
  civilian: "CIVILIAN",
  "burger-shot": "EMPLOYEE",
  "mechanic-shop": "EMPLOYEE",
  hospital: "EMPLOYEE",
  "vanilla-unicorn": "EMPLOYEE",
  "uwu-cafe": "EMPLOYEE",
};

export default function CommandPalette({
  characters,
  days,
  factions,
  onOpenCharacter,
  onOpenDay,
  onOpenFaction,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [placeholder] = useState(
    () => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]
  );

  // Build flat search index
  const searchItems = useMemo<SearchItem[]>(() => {
    const items = [
      ...characters.map((c) => ({
        id: c.id,
        label: c.name,
        searchKey: `${c.name} ${c.streamer}`,
        category: FACTION_CATEGORY[c.faction] || "SUSPECT",
        handler: () => onOpenCharacter(c.id),
      })),
      ...days.map((d) => {
        const label = `Day ${d.day} - ${d.title}`;
        return {
          id: d.id,
          label,
          searchKey: label,
          category: "CASE FILE",
          handler: () => onOpenDay(d.id),
        };
      }),
      ...factions.map((f) => ({
        id: f.id,
        label: f.name,
        searchKey: f.name,
        category: "FACTION",
        handler: () => onOpenFaction(f.id),
      })),
    ];
    return items.sort((a, b) => a.label.localeCompare(b.label));
  }, [characters, days, factions, onOpenCharacter, onOpenDay, onOpenFaction]);

  // Filter and rank results
  const results = useMemo(() => {
    if (!query.trim()) {
      return searchItems;
    }
    return searchItems
      .map((item) => ({ item, score: fuzzyScore(query, item.searchKey) }))
      .filter(({ score }) => score !== null)
      .sort((a, b) => (a.score as number) - (b.score as number))
      .map(({ item }) => item);
  }, [query, searchItems]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    const selectedEl = list.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + results.length) % results.length
        );
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].handler();
          onClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  const getCategoryColor = (category: SearchItem["category"]) => {
    switch (category) {
      case "SUSPECT":
        return "var(--color-status-danger)";
      case "OFFICER":
        return "var(--color-faction-police)";
      case "MEDIC":
        return "var(--color-faction-ems)";
      case "LEGAL":
        return "var(--color-status-info)";
      case "CIVILIAN":
        return "var(--color-status-neutral)";
      case "EMPLOYEE":
        return "var(--color-status-warning)";
      case "CASE FILE":
        return "var(--color-status-info)";
      case "FACTION":
        return "var(--color-status-safe)";
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
    >
      <div
        className="mx-4 w-full max-w-lg font-mono"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div className="flex items-center border-2 border-terminal-amber bg-terminal-bg px-3">
          <span className="mr-2 text-sm text-terminal-amber-dim">{">"}</span>
          <input
            className="w-full bg-transparent py-3 text-sm text-terminal-amber caret-terminal-amber outline-none"
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            ref={inputRef}
            type="text"
            value={query}
          />
          <span className="shrink-0 text-terminal-amber-dim text-xs">ESC</span>
        </div>

        {/* Results list */}
        <div
          className="max-h-[50vh] overflow-y-auto border border-terminal-amber border-t-0 bg-terminal-bg"
          ref={listRef}
        >
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-terminal-amber-dim">
              NO RESULTS FOUND
            </div>
          ) : (
            results.map((item, i) => (
              <button
                className="flex w-full cursor-pointer items-center gap-3 border-none bg-transparent px-4 py-2 text-left text-sm text-terminal-amber"
                key={item.id + item.category}
                onClick={() => {
                  item.handler();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
                style={{
                  backgroundColor:
                    i === selectedIndex
                      ? "color-mix(in oklch, var(--color-terminal-amber) 15%, transparent)"
                      : "transparent",
                }}
                type="button"
              >
                <span
                  className="shrink-0 border px-1.5 py-0.5 text-[10px]"
                  style={{
                    color: getCategoryColor(item.category),
                    borderColor: getCategoryColor(item.category),
                  }}
                >
                  {item.category}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="mt-1 flex justify-between px-1 text-[10px] text-terminal-amber-dim">
          <span>{results.length} RECORD(S) FOUND</span>
          <span>↑↓ NAVIGATE / ENTER SELECT / ESC CLOSE</span>
        </div>
      </div>
    </div>
  );
}
