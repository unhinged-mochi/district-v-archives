import React from 'react';

interface ParseBodyOptions {
  headingStyle?: 'dossier' | 'casefile';
  onOpenCharacter?: (id: string) => void;
}

export function parseBody(body: string, options: ParseBodyOptions = {}): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const lines = body.split('\n');
  let key = 0;
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

  function processInline(text: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    const boldRe = /\*\*(.+?)\*\*/g;
    let lastIdx = 0;
    let m: RegExpExecArray | null;
    while ((m = boldRe.exec(text)) !== null) {
      if (m.index > lastIdx) nodes.push(<span key={key++}>{text.slice(lastIdx, m.index)}</span>);
      nodes.push(<strong key={key++}>{m[1]}</strong>);
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx === 0) return [<span key={key++}>{text}</span>];
    if (lastIdx < text.length) nodes.push(<span key={key++}>{text.slice(lastIdx)}</span>);
    return nodes;
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      const heading = line.slice(3).toUpperCase();
      parts.push(
        <div
          key={key++}
          className="font-bold mt-4 mb-2 border-b border-terminal-amber pb-1"
        >
          {options.headingStyle === 'casefile'
            ? '=== ' + heading + ' ==='
            : '>>> ' + heading}
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

      if (href.startsWith('dossier:')) {
        const charId = href.slice('dossier:'.length);
        lineparts.push(
          <button
            key={key++}
            className="underline cursor-pointer hover:opacity-80 text-terminal-amber"
            onClick={() => options.onOpenCharacter?.(charId)}
          >
            {text}
          </button>
        );
      } else if (text.startsWith('>')) {
        const vodLabel = text.slice(1).trim();
        lineparts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="vod-badge"
            aria-label={`VOD timestamp: ${vodLabel}`}
          >
            {vodLabel}
          </a>
        );
      } else {
        lineparts.push(
          <a
            key={key++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:opacity-80"
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

    if (line.startsWith('- ')) {
      parts.push(
        <div key={key++} className="leading-relaxed pl-4">
          <span className="opacity-50 mr-2">&gt;</span>
          {lineparts.length > 0 ? lineparts : line.slice(2)}
        </div>
      );
    } else {
      parts.push(
        <div key={key++} className="leading-relaxed">
          {lineparts.length > 0 ? lineparts : '\u00A0'}
        </div>
      );
    }
  }

  return parts;
}
