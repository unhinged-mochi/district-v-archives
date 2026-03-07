import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  Character,
  Day,
  Faction,
  Relationship,
  Sighting,
  WindowData,
} from "../types";
import Boot from "./Boot";
import CaseFileView from "./CaseFileView";
import CommandPalette from "./CommandPalette";
import CRTOverlay from "./CRTOverlay";
import Desktop from "./Desktop";
import DossierView from "./DossierView";
import FactionView from "./FactionView";
import FolderView from "./FolderView";
import NetworkGraph from "./NetworkGraph";
import SettingsPanel from "./SettingsPanel";
import Taskbar from "./Taskbar";
import TerminalBackground from "./TerminalBackground";
import Window from "./Window";

const TRAILING_DOT_RE = /\.$/;

function topmostWindow(wins: WindowData[]) {
  return wins.reduce((top, w) => (w.zIndex > top.zIndex ? w : top), wins[0]);
}

function resolveNames(
  ids: string[],
  characterMap: Map<string, Character>
): Array<{ id: string; name: string }> {
  return ids.flatMap((mId) => {
    const ch = characterMap.get(mId);
    return ch ? [{ id: ch.id, name: ch.name }] : [];
  });
}

interface EffectsSettings {
  backgroundEnabled: boolean;
  crtEnabled: boolean;
  flickerEnabled: boolean;
}

function loadSettings(): EffectsSettings {
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const defaults: EffectsSettings = {
    crtEnabled: !prefersReduced,
    flickerEnabled: !prefersReduced,
    backgroundEnabled: !prefersReduced,
  };
  try {
    const stored = localStorage.getItem("district-v-settings");
    if (stored) {
      return { ...defaults, ...JSON.parse(stored) };
    }
  } catch {
    /* ignore corrupt localStorage */
  }
  return defaults;
}

interface DesktopAppProps {
  characters: Character[];
  days: Day[];
  factions: Faction[];
  relationships: Relationship[];
  sightings: Sighting[];
}

const README_TEXT = `DISTRICT V ARCHIVE
==================
Last modified: 2026-03-04 23:59:00 PST
Size: 2.4 MB | Classification: LEVEL 5

An interactive archive of the District V GTA RP event.
February 21 - March 4, 2026

Hosted by Luca Kaneshiro & Yu Q. Wilson
Server: Custom GTA V RP

This terminal contains classified LSPD case files,
suspect dossiers, faction intelligence, and network
analysis gathered during the 12-day operation.

All VOD timestamps link to original streams.

NAVIGATION
==========
- Double-click desktop icons to open folders
- Drag window title bars to reposition
- Ctrl+K / Cmd+K to search all records
- ESC to close windows
- [*] for terminal settings

> AUTHORIZED PERSONNEL ONLY
> LSPD INTERNAL USE

[SYSTEM INFO]
Terminal: LSPD-TERM-v5.0.2
Build: district-v-archive
Clearance: LEVEL 5 REQUIRED`;

export default function DesktopApp({
  characters,
  days,
  factions,
  relationships,
  sightings,
}: DesktopAppProps) {
  const [booting, setBooting] = useState(true);
  const [windows, setWindows] = useState<WindowData[]>([]);
  const nextZIndexRef = useRef(100);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<EffectsSettings>(loadSettings);

  const characterMap = useMemo(
    () => new Map(characters.map((c) => [c.id, c])),
    [characters]
  );
  const sightingMap = useMemo(
    () => new Map(sightings.map((s) => [s.id, s])),
    [sightings]
  );
  const dayMap = useMemo(
    () => new Map(days.map((d) => [d.id, d])),
    [days]
  );
  const factionMap = useMemo(() => {
    const m = new Map<string, Faction>();
    factions.forEach((f) => {
      m.set(f.id, f);
      m.set(f.name, f);
    });
    return m;
  }, [factions]);

  const toggleSetting = useCallback((key: keyof EffectsSettings) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem("district-v-settings", JSON.stringify(next));
      } catch {
        /* ignore quota errors */
      }
      return next;
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (!existing) {
        return prev;
      }
      const newZ = ++nextZIndexRef.current;
      return prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w));
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, closing: true } : w))
    );
  }, []);

  const removeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const addWindow = useCallback((win: Omit<WindowData, "zIndex">) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === win.id);
      const newZ = ++nextZIndexRef.current;
      if (existing) {
        return prev.map((w) => (w.id === win.id ? { ...w, zIndex: newZ } : w));
      }
      return [...prev, { ...win, zIndex: newZ }];
    });
  }, []);

  const openCharacter = useCallback(
    (id: string) => {
      const character = characterMap.get(id);
      if (!character) {
        return;
      }
      const faction = factionMap.get(character.faction);
      const factionName = faction ? faction.name : character.faction;
      addWindow({
        id: `dossier-${id}`,
        title:
          "LSPD // DOSSIERS // " +
          factionName.toUpperCase() +
          " // " +
          character.name.toUpperCase(),
        type: "dossier",
        content: { character },
      });
    },
    [characterMap, factionMap, addWindow]
  );

  const openDay = useCallback(
    (id: string) => {
      const day = dayMap.get(id);
      if (!day) {
        return;
      }
      addWindow({
        id: `casefile-${id}`,
        title:
          "LSPD // CASE FILES // DAY " +
          day.day +
          " - " +
          day.title.toUpperCase(),
        type: "casefile",
        content: { day },
      });
    },
    [dayMap, addWindow]
  );

  const openFaction = useCallback(
    (id: string) => {
      const faction = factionMap.get(id);
      if (!faction) {
        return;
      }
      const memberNames = resolveNames(faction.members, characterMap);
      if (
        faction.leader !== "none" &&
        !memberNames.some((m) => m.id === faction.leader)
      ) {
        const leaderCh = characterMap.get(faction.leader);
        if (leaderCh) {
          memberNames.unshift({ id: leaderCh.id, name: leaderCh.name });
        }
      }
      const formerMemberNames = resolveNames(
        faction.formerMembers ?? [],
        characterMap
      );
      addWindow({
        id: `faction-${id}`,
        title: `LSPD // FACTIONS // ${faction.name.toUpperCase()}`,
        type: "faction",
        content: { faction, memberNames, formerMemberNames },
      });
    },
    [factionMap, characterMap, addWindow]
  );

  const openFolder = useCallback(
    (folderId: string) => {
      switch (folderId) {
        case "case-files": {
          const items = days.map((d) => ({
            id: d.id,
            label: "DAY_" + String(d.day).padStart(2, "0") + ".log",
            type: "file" as const,
            meta: d.date,
          }));
          addWindow({
            id: "folder-case-files",
            title: "LSPD // CASE FILES",
            type: "folder",
            content: {
              items,
              handler: "day",
            },
          });
          break;
        }
        case "suspects": {
          const items = [...factions]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((f) => ({
              id: f.id,
              label: f.name.toUpperCase(),
              type: "dir" as const,
              meta: `${resolveNames(f.members, characterMap).length} MEMBER(S)`,
            }));
          addWindow({
            id: "folder-suspects",
            title: "LSPD // DOSSIERS",
            type: "folder",
            content: {
              items,
              handler: "faction-members",
            },
          });
          break;
        }
        case "factions": {
          const items = [...factions]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((f) => ({
              id: f.id,
              label: `${f.name.toUpperCase()}.dat`,
              type: "file" as const,
              meta: f.type,
            }));
          addWindow({
            id: "folder-factions",
            title: "LSPD // FACTIONS",
            type: "folder",
            content: {
              items,
              handler: "faction",
            },
          });
          break;
        }
        case "network": {
          addWindow({
            id: "network-analysis",
            title: "LSPD // NETWORK ANALYSIS",
            type: "network",
            content: {},
          });
          break;
        }
        case "readme": {
          addWindow({
            id: "readme",
            title: "LSPD // README.txt",
            type: "readme",
            content: {},
          });
          break;
        }
        case "sightings": {
          const items = [...sightings]
            .sort((a, b) =>
              (a.date ?? a.title).localeCompare(b.date ?? b.title)
            )
            .map((s) => ({
              id: s.id,
              label: s.title.toUpperCase(),
              type: "file" as const,
              meta: [s.author, s.date].filter(Boolean).join(" // "),
            }));
          addWindow({
            id: "folder-sightings",
            title: "LSPD // SIGHTINGS",
            type: "folder",
            content: {
              items,
              handler: "sighting",
            },
          });
          break;
        }
        default: {
          // Check if it's a faction subfolder for suspects
          const faction = factionMap.get(folderId);
          if (faction) {
            const resolved = faction.members
              .map((mId) => characterMap.get(mId))
              .filter((ch): ch is Character => !!ch)
              .sort((a, b) => a.name.localeCompare(b.name));
            const items = resolved.map((ch) => ({
              id: ch.id,
              label: `${ch.name.replace(TRAILING_DOT_RE, "").toUpperCase()}.dossier`,
              type: "file" as const,
              meta: ch.status,
            }));
            addWindow({
              id: `folder-suspects-${folderId}`,
              title: `LSPD // DOSSIERS // ${faction.name.toUpperCase()}`,
              type: "folder",
              content: {
                items,
                handler: "character",
              },
            });
          }
          break;
        }
      }
    },
    [days, factionMap, sightings, characterMap, addWindow]
  );

  const windowsRef = useRef(windows);
  windowsRef.current = windows;

  const commandPaletteOpenRef = useRef(commandPaletteOpen);
  commandPaletteOpenRef.current = commandPaletteOpen;

  const settingsOpenRef = useRef(settingsOpen);
  settingsOpenRef.current = settingsOpen;

  const handleFolderOpen = useCallback(
    (windowId: string, itemId: string, _itemType: string) => {
      const win = windowsRef.current.find((w) => w.id === windowId);
      if (!win) {
        return;
      }

      const handler = win.content?.handler;
      switch (handler) {
        case "day":
          openDay(itemId);
          break;
        case "faction":
          openFaction(itemId);
          break;
        case "faction-members":
          openFolder(itemId);
          break;
        case "character":
          openCharacter(itemId);
          break;
        case "sighting": {
          const sighting = sightingMap.get(itemId);
          if (sighting) {
            window.open(sighting.url, "_blank", "noopener,noreferrer");
          }
          break;
        }
      }
    },
    [openDay, openFaction, openFolder, openCharacter, sightingMap]
  );

  const moveWindow = useCallback((id: string, x: number, y: number) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position: { x, y } } : w))
    );
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, minimized: true } : w))
    );
  }, []);

  const restoreOrFocusWindow = useCallback((id: string) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (!win) {
        return prev;
      }
      const newZ = ++nextZIndexRef.current;
      return prev.map((w) =>
        w.id === id ? { ...w, minimized: false, zIndex: newZ } : w
      );
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K / Cmd+K / Ctrl+F / Cmd+F — toggle command palette
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "f")) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Escape — close overlays first, then topmost window
      if (e.key === "Escape") {
        if (settingsOpenRef.current) {
          setSettingsOpen(false);
          return;
        }
        if (commandPaletteOpenRef.current) {
          setCommandPaletteOpen(false);
          return;
        }
        // Close topmost non-closing window
        const visible = windowsRef.current.filter(
          (w) => !(w.closing || w.minimized)
        );
        if (visible.length > 0) {
          closeWindow(topmostWindow(visible).id);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeWindow]);

  // Find the active (topmost) window
  const activeWindowId = useMemo(
    () => (windows.length > 0 ? topmostWindow(windows).id : null),
    [windows]
  );

  if (booting) {
    return <Boot onComplete={() => setBooting(false)} />;
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-terminal-bg">
      <TerminalBackground enabled={settings.backgroundEnabled} />
      <div
        id="crt-content-wrapper"
        style={{ position: "fixed", inset: 0, zIndex: 1 }}
      >
        <Desktop onOpenFolder={openFolder} />

        {/* Windows */}
        {windows.map((win, index) => (
          <Window
            id={win.id}
            isActive={win.id === activeWindowId}
            isClosing={win.closing}
            key={win.id}
            minimized={win.minimized}
            onClose={closeWindow}
            onCloseComplete={removeWindow}
            onFocus={focusWindow}
            onMinimize={minimizeWindow}
            onMove={moveWindow}
            position={win.position}
            title={win.title}
            windowIndex={index}
            zIndex={win.zIndex}
          >
            {win.type === "folder" && (
              <FolderView
                items={win.content.items}
                onOpen={(itemId, itemType) =>
                  handleFolderOpen(win.id, itemId, itemType)
                }
              />
            )}
            {win.type === "dossier" && (
              <DossierView
                allCharacters={characters}
                character={win.content.character}
                onOpenCharacter={openCharacter}
              />
            )}
            {win.type === "casefile" && (
              <CaseFileView
                day={win.content.day}
                onOpenCharacter={openCharacter}
              />
            )}
            {win.type === "faction" && (
              <FactionView
                faction={win.content.faction}
                formerMemberNames={win.content.formerMemberNames ?? []}
                memberNames={win.content.memberNames}
                onOpenCharacter={openCharacter}
              />
            )}
            {win.type === "network" && (
              <NetworkGraph
                characters={characters}
                factions={factions}
                onOpenCharacter={openCharacter}
                relationships={relationships}
              />
            )}
            {win.type === "readme" && (
              <div className="whitespace-pre-wrap font-mono text-sm text-terminal-amber">
                {README_TEXT}
              </div>
            )}
          </Window>
        ))}
      </div>

      <Taskbar
        activeWindowId={activeWindowId}
        onFocusWindow={restoreOrFocusWindow}
        onSearch={() => setCommandPaletteOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        windows={windows}
      />

      {commandPaletteOpen && (
        <CommandPalette
          characters={characters}
          days={days}
          factions={factions}
          onClose={() => setCommandPaletteOpen(false)}
          onOpenCharacter={openCharacter}
          onOpenDay={openDay}
          onOpenFaction={openFaction}
        />
      )}

      {settingsOpen && (
        <SettingsPanel
          onClose={() => setSettingsOpen(false)}
          onToggle={toggleSetting}
          settings={settings}
        />
      )}

      <CRTOverlay
        crtEnabled={settings.crtEnabled}
        flickerEnabled={settings.flickerEnabled}
      />
    </div>
  );
}
