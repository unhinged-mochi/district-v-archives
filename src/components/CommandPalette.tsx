import { useState, useEffect, useRef, useMemo } from 'react';
import type { Character, Day, Faction } from '../types';

const PLACEHOLDERS = [
  'SEARCH FILES, DOSSIERS, FACTIONS...',
  'QUERY LSPD DATABASE...',
  'ENTER SUSPECT NAME OR CASE NUMBER...',
  'SEARCH CLASSIFIED RECORDS...',
  'ACCESS INTELLIGENCE FILES...',
];

interface CommandPaletteProps {
  characters: Character[];
  days: Day[];
  factions: Faction[];
  onOpenCharacter: (id: string) => void;
  onOpenDay: (id: string) => void;
  onOpenFaction: (id: string) => void;
  onClose: () => void;
}

interface SearchItem {
  id: string;
  label: string;
  searchKey: string;
  category: 'SUSPECT' | 'OFFICER' | 'MEDIC' | 'LEGAL' | 'CIVILIAN' | 'EMPLOYEE' | 'CASE FILE' | 'FACTION';
  handler: () => void;
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
  if (exactIdx !== -1) return -10000 + exactIdx;

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

  if (qi < q.length) return null; // not all query chars found
  return score;
}

const FACTION_CATEGORY: Record<string, SearchItem['category']> = {
  'police': 'OFFICER',
  'ems': 'MEDIC',
  'doj': 'LEGAL',
  'civilian': 'CIVILIAN',
  'burger-shot': 'EMPLOYEE',
  'mechanic-shop': 'EMPLOYEE',
  'hospital': 'EMPLOYEE',
  'vanilla-unicorn': 'EMPLOYEE',
  'uwu-cafe': 'EMPLOYEE',
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
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [placeholder] = useState(() => PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);

  // Build flat search index
  const searchItems = useMemo<SearchItem[]>(() => {
    const items: SearchItem[] = [];

    characters.forEach((c) => {
      items.push({
        id: c.id,
        label: c.name,
        searchKey: c.name + ' ' + c.streamer,
        category: FACTION_CATEGORY[c.faction] || 'SUSPECT',
        handler: () => onOpenCharacter(c.id),
      });
    });

    days.forEach((d) => {
      const label = `Day ${d.day} - ${d.title}`;
      items.push({
        id: d.id,
        label,
        searchKey: label,
        category: 'CASE FILE',
        handler: () => onOpenDay(d.id),
      });
    });

    factions.forEach((f) => {
      items.push({
        id: f.id,
        label: f.name,
        searchKey: f.name,
        category: 'FACTION',
        handler: () => onOpenFaction(f.id),
      });
    });

    items.sort((a, b) => a.label.localeCompare(b.label));
    return items;
  }, [characters, days, factions, onOpenCharacter, onOpenDay, onOpenFaction]);

  // Filter and rank results
  const results = useMemo(() => {
    if (!query.trim()) return searchItems;
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
    if (!list) return;
    const selectedEl = list.children[selectedIndex] as HTMLElement;
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].handler();
          onClose();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  const getCategoryColor = (category: SearchItem['category']) => {
    switch (category) {
      case 'SUSPECT': return 'var(--color-status-danger)';
      case 'OFFICER': return 'var(--color-faction-police)';
      case 'MEDIC': return 'var(--color-faction-ems)';
      case 'LEGAL': return 'var(--color-status-info)';
      case 'CIVILIAN': return 'var(--color-status-neutral)';
      case 'EMPLOYEE': return 'var(--color-status-warning)';
      case 'CASE FILE': return 'var(--color-status-info)';
      case 'FACTION': return 'var(--color-status-safe)';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9000] flex items-start justify-center pt-[15vh]"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-4 font-mono"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input */}
        <div
          className="border-2 border-terminal-amber bg-terminal-bg flex items-center px-3"
        >
          <span className="text-sm mr-2 text-terminal-amber-dim">
            {'>'}
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full py-3 text-sm bg-transparent outline-none text-terminal-amber caret-terminal-amber"
          />
          <span
            className="text-xs text-terminal-amber-dim shrink-0"
          >
            ESC
          </span>
        </div>

        {/* Results list */}
        <div
          ref={listRef}
          className="border border-t-0 border-terminal-amber bg-terminal-bg max-h-[50vh] overflow-y-auto"
        >
          {results.length === 0 ? (
            <div
              className="px-4 py-3 text-sm text-terminal-amber-dim"
            >
              NO RESULTS FOUND
            </div>
          ) : (
            results.map((item, i) => (
              <div
                key={item.id + item.category}
                className="px-4 py-2 text-sm cursor-pointer flex items-center gap-3 text-terminal-amber"
                style={{
                  backgroundColor:
                    i === selectedIndex
                      ? 'color-mix(in oklch, var(--color-terminal-amber) 15%, transparent)'
                      : 'transparent',
                }}
                onClick={() => {
                  item.handler();
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <span
                  className="text-[10px] px-1.5 py-0.5 border shrink-0"
                  style={{
                    color: getCategoryColor(item.category),
                    borderColor: getCategoryColor(item.category),
                  }}
                >
                  {item.category}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div
          className="text-[10px] mt-1 text-terminal-amber-dim flex justify-between px-1"
        >
          <span>{results.length} RECORD(S) FOUND</span>
          <span>↑↓ NAVIGATE / ENTER SELECT / ESC CLOSE</span>
        </div>
      </div>
    </div>
  );
}
