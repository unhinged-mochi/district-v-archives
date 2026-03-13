import { useStaggerIn } from "./useStaggerIn";

interface FolderViewProps {
  items: Array<{
    id: string;
    label: string;
    type: "dir" | "file";
    meta?: string;
  }>;
  onOpen: (id: string, type: string) => void;
}

function SmallFolderIcon() {
  return (
    <svg
      aria-hidden="true"
      className="inline-block shrink-0"
      fill="none"
      height="16"
      viewBox="0 0 48 40"
      width="20"
    >
      <path
        d="M2 6C2 4.89543 2.89543 4 4 4H16L20 8H44C45.1046 8 46 8.89543 46 10V34C46 35.1046 45.1046 36 44 36H4C2.89543 36 2 35.1046 2 34V6Z"
        fill="rgba(255, 176, 0, 0.12)"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="2.5"
      />
      <path
        d="M2 14H46V34C46 35.1046 45.1046 36 44 36H4C2.89543 36 2 35.1046 2 34V14Z"
        fill="rgba(255, 176, 0, 0.08)"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="2.5"
      />
    </svg>
  );
}

function SmallFileIcon() {
  return (
    <svg
      aria-hidden="true"
      className="inline-block shrink-0"
      fill="none"
      height="18"
      viewBox="0 0 40 48"
      width="16"
    >
      <path
        d="M4 2H28L36 10V44C36 45.1046 35.1046 46 34 46H6C4.89543 46 4 45.1046 4 44V4C4 2.89543 4.89543 2 6 2Z"
        fill="rgba(255, 176, 0, 0.06)"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="2.5"
      />
      <path
        d="M28 2V10H36"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="2.5"
      />
      <line
        opacity="0.3"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
        x1="10"
        x2="30"
        y1="20"
        y2="20"
      />
      <line
        opacity="0.3"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
        x1="10"
        x2="26"
        y1="27"
        y2="27"
      />
      <line
        opacity="0.3"
        stroke="var(--color-terminal-amber, #ffb000)"
        strokeWidth="1.5"
        x1="10"
        x2="22"
        y1="34"
        y2="34"
      />
    </svg>
  );
}

export default function FolderView({ items, onOpen }: FolderViewProps) {
  const containerRef = useStaggerIn({
    selector: ".file-row",
    y: 6,
    duration: 0.15,
    stagger: 0.03,
  });

  return (
    <div className="font-mono text-sm" ref={containerRef}>
      {/* Header row */}
      <div className="mb-1 flex items-center gap-4 border-terminal-amber border-b px-3 py-1 text-terminal-amber-dim">
        <span className="w-8" />
        <span className="flex-1">NAME</span>
        <span className="w-32 text-right">INFO</span>
      </div>

      {/* File rows */}
      {items.length === 0 ? (
        <div className="px-3 py-4 text-center text-terminal-amber-dim">
          NO RECORDS ON FILE
        </div>
      ) : (
        items.map((item) => (
          <button
            aria-label={`${item.type === "dir" ? "Directory" : "File"}: ${item.label}${item.meta ? `, ${item.meta}` : ""}`}
            className="file-row flex w-full cursor-pointer items-center gap-4 border-none bg-transparent px-3 py-2 text-left"
            key={item.id}
            onClick={() => onOpen(item.id, item.type)}
            type="button"
          >
            <span className="flex w-8 items-center justify-center">
              {item.type === "dir" ? <SmallFolderIcon /> : <SmallFileIcon />}
            </span>
            <span className="flex-1 text-terminal-amber">{item.label}</span>
            <span className="w-32 text-right text-terminal-amber-dim">
              {item.meta || ""}
            </span>
          </button>
        ))
      )}

      {/* Footer */}
      <div className="mt-2 flex justify-between border-terminal-amber border-t px-3 py-2 text-terminal-amber-dim text-xs">
        <span>{items.length} FILE(S)</span>
        <span>CLASSIFIED - LEVEL 5</span>
      </div>
    </div>
  );
}
