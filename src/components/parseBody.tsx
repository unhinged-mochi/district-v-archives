import type React from "react";

const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

interface ParseBodyOptions {
  headingStyle?: "dossier" | "casefile";
  onOpenCharacter?: (id: string) => void;
}

export function parseBody(
  body: string,
  options: ParseBodyOptions = {}
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = body.split("\n");
  let key = 0;

  function processInline(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const boldRe = /\*\*(.+?)\*\*/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRe.exec(text)) !== null) {
      if (m.index > lastIdx) {
        nodes.push(<span key={key++}>{text.slice(lastIdx, m.index)}</span>);
      }
      nodes.push(<strong key={key++}>{m[1]}</strong>);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx === 0) {
      return [<span key={key++}>{text}</span>];
    }
    if (lastIdx < text.length) {
      nodes.push(<span key={key++}>{text.slice(lastIdx)}</span>);
    }
    return nodes;
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const heading = line.slice(3).toUpperCase();
      parts.push(
        <div
          className="mt-4 mb-2 border-terminal-amber border-b pb-1 font-bold"
          key={key++}
        >
          {options.headingStyle === "casefile"
            ? `=== ${heading} ===`
            : `>>> ${heading}`}
        </div>
      );
      continue;
    }

    const lineparts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    linkRegex.lastIndex = 0;

    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        lineparts.push(...processInline(line.slice(lastIndex, match.index)));
      }

      const text = match[1];
      const href = match[2];

      if (href.startsWith("dossier:")) {
        const charId = href.slice("dossier:".length);
        lineparts.push(
          <button
            className="cursor-pointer text-terminal-amber underline hover:opacity-80"
            key={key++}
            onClick={() => options.onOpenCharacter?.(charId)}
            type="button"
          >
            {text}
          </button>
        );
      } else if (text.startsWith(">")) {
        const vodLabel = text.slice(1).trim();
        lineparts.push(
          <a
            aria-label={`VOD timestamp: ${vodLabel}`}
            className="vod-badge"
            href={href}
            key={key++}
            rel="noopener noreferrer"
            target="_blank"
          >
            {vodLabel}
          </a>
        );
      } else {
        lineparts.push(
          <a
            className="underline hover:opacity-80"
            href={href}
            key={key++}
            rel="noopener noreferrer"
            target="_blank"
          >
            {text}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < line.length) {
      lineparts.push(...processInline(line.slice(lastIndex)));
    }

    if (line.startsWith("- ")) {
      parts.push(
        <div className="pl-4 leading-relaxed" key={key++}>
          <span className="mr-2 opacity-50">&gt;</span>
          {lineparts.length > 0 ? lineparts : line.slice(2)}
        </div>
      );
    } else {
      parts.push(
        <div className="leading-relaxed" key={key++}>
          {lineparts.length > 0 ? lineparts : "\u00A0"}
        </div>
      );
    }
  }

  return parts;
}
