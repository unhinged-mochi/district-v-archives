import { useCallback, useState } from "react";

const isTouchDevice =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

interface DesktopProps {
  onOpenFolder: (folderId: string) => void;
}

function FolderIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="40"
      viewBox="0 0 48 40"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
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
    <svg
      aria-hidden="true"
      fill="none"
      height="48"
      viewBox="0 0 40 48"
      width="40"
      xmlns="http://www.w3.org/2000/svg"
    >
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
      <line
        opacity="0.4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="10"
        x2="30"
        y1="18"
        y2="18"
      />
      <line
        opacity="0.4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="10"
        x2="26"
        y1="23"
        y2="23"
      />
      <line
        opacity="0.4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="10"
        x2="28"
        y1="28"
        y2="28"
      />
      <line
        opacity="0.4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="10"
        x2="22"
        y1="33"
        y2="33"
      />
    </svg>
  );
}

function NetworkIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="40"
      viewBox="0 0 48 40"
      width="48"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Nodes */}
      <circle
        cx="24"
        cy="12"
        fill="rgba(255, 176, 0, 0.15)"
        r="4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
      <circle
        cx="10"
        cy="30"
        fill="rgba(255, 176, 0, 0.15)"
        r="4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
      <circle
        cx="38"
        cy="30"
        fill="rgba(255, 176, 0, 0.15)"
        r="4"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
      />
      <circle
        cx="24"
        cy="34"
        fill="rgba(255, 176, 0, 0.15)"
        r="3"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
      />
      {/* Edges */}
      <line
        opacity="0.6"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="24"
        x2="10"
        y1="16"
        y2="26"
      />
      <line
        opacity="0.6"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="24"
        x2="38"
        y1="16"
        y2="26"
      />
      <line
        opacity="0.6"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="10"
        x2="24"
        y1="30"
        y2="34"
      />
      <line
        opacity="0.6"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1"
        x1="38"
        x2="24"
        y1="30"
        y2="34"
      />
      <line
        opacity="0.4"
        stroke="var(--color-status-danger)"
        strokeDasharray="3 2"
        strokeWidth="1"
        x1="10"
        x2="38"
        y1="30"
        y2="30"
      />
    </svg>
  );
}

const ICONS = [
  { id: "case-files", label: "CASE FILES", icon: "folder" },
  { id: "suspects", label: "DOSSIERS", icon: "folder" },
  { id: "factions", label: "FACTIONS", icon: "folder" },
  { id: "sightings", label: "SIGHTINGS", icon: "folder" },
  { id: "network", label: "NETWORK\nANALYSIS", icon: "network" },
  { id: "readme", label: "README.txt", icon: "file" },
];

export default function Desktop({ onOpenFolder }: DesktopProps) {
  const [accessDenied, setAccessDenied] = useState(false);

  const handleClassifiedClick = useCallback(() => {
    if (accessDenied) {
      return;
    }
    setAccessDenied(true);
    setTimeout(() => setAccessDenied(false), 2000);
  }, [accessDenied]);

  return (
    <main
      aria-label="LSPD Terminal Desktop"
      className="grid-bg fixed inset-0"
      role="application"
      style={{ paddingBottom: "40px" }}
    >
      {/* ACCESS DENIED overlay */}
      {accessDenied && (
        <div
          className="pointer-events-none fixed inset-0 z-[9000] flex items-center justify-center"
          style={{ backgroundColor: "rgba(255, 68, 68, 0.05)" }}
        >
          <div
            className="glow-text font-bold font-mono text-xl"
            style={{
              color: "var(--color-status-danger)",
              textShadow:
                "0 0 20px var(--color-status-danger), 0 0 40px var(--color-status-danger)",
            }}
          >
            ⚠ ACCESS DENIED ⚠
          </div>
        </div>
      )}

      {/* Top bar */}
      <header
        className="desktop-topbar flex items-center gap-2 border-terminal-amber border-b px-4 py-2 font-mono text-terminal-amber text-xs"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <span>LSPD TERMINAL</span>
        {/* biome-ignore lint/suspicious/noCommentText: intentional UI separator text */}
        <span className="opacity-40">//</span>
        <span className="hidden sm:inline">CASE #DV-2026-0221</span>
        {/* biome-ignore lint/suspicious/noCommentText: intentional UI separator text */}
        <span className="hidden opacity-40 sm:inline">//</span>
        <button
          className="cursor-pointer select-none border-none bg-transparent p-0 font-mono text-terminal-amber text-xs"
          onDoubleClick={handleClassifiedClick}
          type="button"
        >
          CLASSIFIED
        </button>
        <span className="cursor-blink">_</span>
      </header>

      {/* Desktop icons — vertical column on desktop, horizontal grid on mobile */}
      <ul aria-label="Desktop shortcuts" className="desktop-icons-grid">
        {ICONS.map((icon) => (
          <li key={icon.id}>
            <button
              aria-label={`Open ${icon.label.replace("\n", " ")}`}
              className="desktop-icon rounded border-none bg-transparent px-2 py-2"
              onClick={isTouchDevice ? () => onOpenFolder(icon.id) : undefined}
              onDoubleClick={
                isTouchDevice ? undefined : () => onOpenFolder(icon.id)
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onOpenFolder(icon.id);
                }
              }}
              type="button"
            >
              <div className="flex cursor-pointer select-none flex-col items-center font-mono text-terminal-amber">
                <div className="mb-1">
                  {icon.icon === "folder" && <FolderIcon />}
                  {icon.icon === "file" && <FileIcon />}
                  {icon.icon === "network" && <NetworkIcon />}
                </div>
                <div className="whitespace-pre-line text-center text-[10px] leading-tight">
                  {icon.label}
                </div>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
