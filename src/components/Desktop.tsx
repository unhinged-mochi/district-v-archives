import { useState, useCallback } from 'react';

interface DesktopProps {
  onOpenFolder: (folderId: string) => void;
}

function FolderIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Folder tab */}
      <path
        d="M2 6C2 4.89543 2.89543 4 4 4H16L20 8H44C45.1046 8 46 8.89543 46 10V34C46 35.1046 45.1046 36 44 36H4C2.89543 36 2 35.1046 2 34V6Z"
        fill="rgba(255, 176, 0, 0.1)"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
      {/* Folder front face */}
      <path
        d="M2 14H46V34C46 35.1046 45.1046 36 44 36H4C2.89543 36 2 35.1046 2 34V14Z"
        fill="rgba(255, 176, 0, 0.08)"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="40" height="48" viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Page shape with folded corner */}
      <path
        d="M4 2H28L36 10V44C36 45.1046 35.1046 46 34 46H6C4.89543 46 4 45.1046 4 44V4C4 2.89543 4.89543 2 6 2Z"
        fill="rgba(255, 176, 0, 0.06)"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
      {/* Folded corner */}
      <path
        d="M28 2V10H36"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
      {/* Text lines */}
      <line x1="10" y1="18" x2="30" y2="18" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="23" x2="26" y2="23" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="28" x2="28" y2="28" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.4" />
      <line x1="10" y1="33" x2="22" y2="33" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Nodes */}
      <circle cx="24" cy="12" r="4" fill="rgba(255, 176, 0, 0.15)" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1.5" />
      <circle cx="10" cy="30" r="4" fill="rgba(255, 176, 0, 0.15)" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1.5" />
      <circle cx="38" cy="30" r="4" fill="rgba(255, 176, 0, 0.15)" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1.5" />
      <circle cx="24" cy="34" r="3" fill="rgba(255, 176, 0, 0.15)" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" />
      {/* Edges */}
      <line x1="24" y1="16" x2="10" y2="26" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.6" />
      <line x1="24" y1="16" x2="38" y2="26" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="30" x2="24" y2="34" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.6" />
      <line x1="38" y1="30" x2="24" y2="34" stroke="var(--color-terminal-amber, #ffb000)" strokeWidth="1" opacity="0.6" />
      <line x1="10" y1="30" x2="38" y2="30" stroke="var(--color-status-danger)" strokeWidth="1" opacity="0.4" strokeDasharray="3 2" />
    </svg>
  );
}

const ICONS = [
  { id: 'case-files', label: 'CASE FILES', icon: 'folder' },
  { id: 'suspects', label: 'DOSSIERS', icon: 'folder' },
  { id: 'factions', label: 'FACTIONS', icon: 'folder' },
  { id: 'network', label: 'NETWORK\nANALYSIS', icon: 'network' },
  { id: 'readme', label: 'README.txt', icon: 'file' },
];

export default function Desktop({ onOpenFolder }: DesktopProps) {
  const isTouchDevice = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const [accessDenied, setAccessDenied] = useState(false);

  const handleClassifiedClick = useCallback(() => {
    if (accessDenied) return;
    setAccessDenied(true);
    setTimeout(() => setAccessDenied(false), 2000);
  }, [accessDenied]);

  return (
    <main className="grid-bg fixed inset-0" role="application" aria-label="LSPD Terminal Desktop" style={{ paddingBottom: '40px' }}>
      {/* ACCESS DENIED overlay */}
      {accessDenied && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center pointer-events-none"
          style={{ backgroundColor: 'rgba(255, 68, 68, 0.05)' }}
        >
          <div className="font-mono text-xl font-bold glow-text" style={{ color: 'var(--color-status-danger)', textShadow: '0 0 20px var(--color-status-danger), 0 0 40px var(--color-status-danger)' }}>
            ⚠ ACCESS DENIED ⚠
          </div>
        </div>
      )}

      {/* Top bar */}
      <header
        className="font-mono text-xs px-4 py-2 border-b border-terminal-amber text-terminal-amber flex items-center gap-2 desktop-topbar"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      >
        <span>LSPD TERMINAL</span>
        <span className="opacity-40">//</span>
        <span className="hidden sm:inline">CASE #DV-2026-0221</span>
        <span className="hidden sm:inline opacity-40">//</span>
        <span
          className="cursor-pointer select-none"
          onDoubleClick={handleClassifiedClick}
        >
          CLASSIFIED
        </span>
        <span className="cursor-blink">_</span>
      </header>

      {/* Desktop icons — vertical column on desktop, horizontal grid on mobile */}
      <div className="desktop-icons-grid" role="list" aria-label="Desktop shortcuts">
        {ICONS.map((icon) => (
          <button
            key={icon.id}
            className="desktop-icon rounded px-2 py-2 bg-transparent border-none"
            role="listitem"
            aria-label={`Open ${icon.label.replace('\n', ' ')}`}
            onClick={isTouchDevice ? () => onOpenFolder(icon.id) : undefined}
            onDoubleClick={!isTouchDevice ? () => onOpenFolder(icon.id) : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenFolder(icon.id);
            }}
          >
            <div
              className="flex flex-col items-center font-mono cursor-pointer select-none text-terminal-amber"
            >
              <div className="mb-1">
                {icon.icon === 'folder' && <FolderIcon />}
                {icon.icon === 'file' && <FileIcon />}
                {icon.icon === 'network' && <NetworkIcon />}
              </div>
              <div className="whitespace-pre-line text-[10px] leading-tight text-center">{icon.label}</div>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}
