import { useMemo } from "react";
import type { Character } from "../types";
import { parseBody } from "./parseBody";
import { useStaggerIn } from "./useStaggerIn";

interface DossierViewProps {
  allCharacters?: Character[];
  character: Character;
  onOpenCharacter: (id: string) => void;
}

function getStatusColor(status: Character["status"]): string {
  switch (status) {
    case "AT LARGE":
      return "var(--color-status-danger)";
    case "IN CUSTODY":
      return "var(--color-status-warning)";
    case "DECEASED":
      return "var(--color-status-neutral)";
    case "ACTIVE DUTY":
      return "var(--color-status-safe)";
    case "DISCHARGED":
      return "var(--color-status-warning)";
    case "EMPLOYED":
      return "var(--color-status-info)";
    default:
      return "var(--color-terminal-amber)";
  }
}

function getThreatColor(level: number): string {
  if (level <= 3) {
    return "var(--color-status-safe)";
  }
  if (level <= 6) {
    return "var(--color-status-warning)";
  }
  return "var(--color-status-danger)";
}

export default function DossierView({
  character,
  allCharacters = [],
  onOpenCharacter,
}: DossierViewProps) {
  const containerRef = useStaggerIn();
  const allCharactersMap = useMemo(
    () => new Map(allCharacters.map((c) => [c.id, c])),
    [allCharacters]
  );

  return (
    <div className="font-mono text-sm text-terminal-amber" ref={containerRef}>
      {/* Top section: mugshot + metadata */}
      <div className="mb-6 flex gap-6">
        {/* Mugshot */}
        <div
          className="flex h-40 w-32 shrink-0 items-center justify-center border border-terminal-amber"
          style={{
            backgroundColor:
              "color-mix(in oklch, var(--color-terminal-amber) 5%, transparent)",
          }}
        >
          {character.mugshot ? (
            <img
              alt={character.name}
              className="h-full w-full object-cover"
              src={character.mugshot}
            />
          ) : (
            <span className="text-terminal-amber-dim text-xs">NO PHOTO</span>
          )}
        </div>

        {/* Metadata */}
        <div className="flex-1 space-y-1">
          <div>
            <span className="text-terminal-amber-dim">NAME: </span>
            <span className="font-bold">{character.name}</span>
          </div>
          <div>
            <span className="text-terminal-amber-dim">STREAMER: </span>
            {character.youtube || character.twitch ? (
              <a
                className="underline hover:opacity-80"
                href={character.youtube ?? character.twitch}
                rel="noopener noreferrer"
                target="_blank"
              >
                {character.streamer}
              </a>
            ) : (
              <span>{character.streamer}</span>
            )}
          </div>
          <div>
            <span className="text-terminal-amber-dim">AGENCY: </span>
            <span>{character.agency}</span>
          </div>
          <div>
            <span className="text-terminal-amber-dim">FACTION: </span>
            <span className="uppercase">
              {character.faction.replace(/-/g, " ")}
            </span>
          </div>
          <div>
            <span className="text-terminal-amber-dim">STATUS: </span>
            <span
              style={{
                color: getStatusColor(character.status),
                fontWeight: "bold",
              }}
            >
              {character.status}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-terminal-amber-dim">THREAT LEVEL: </span>
            <span>{character.threatLevel}/10</span>
            <div className="threat-bar mt-1">
              <div
                className="threat-bar-fill"
                style={{
                  width: `${character.threatLevel * 10}%`,
                  backgroundColor: getThreatColor(character.threatLevel),
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Known Associates */}
      {character.associates.length > 0 && (
        <div className="mb-6">
          <div className="mb-2 border-terminal-amber border-b pb-1 font-bold">
            KNOWN ASSOCIATES
          </div>
          <div className="flex flex-wrap gap-2">
            {character.associates.map((assocId) => {
              const assoc = allCharactersMap.get(assocId);
              const displayName = assoc ? assoc.name : assocId;
              return (
                <button
                  className="cursor-pointer text-terminal-amber underline hover:opacity-80"
                  key={assocId}
                  onClick={() => onOpenCharacter(assocId)}
                  type="button"
                >
                  {displayName}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Case Notes */}
      <div className="mb-6">
        <div className="mb-2 border-terminal-amber border-b pb-1 font-bold">
          CASE NOTES
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">
          {parseBody(character.body, { onOpenCharacter })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-terminal-amber border-t pt-2 text-center text-terminal-amber-dim text-xs">
        {/* biome-ignore lint/suspicious/noCommentText: intentional terminal UI text */}
        LSPD FILE // CLASSIFIED // DO NOT DISTRIBUTE
      </div>
    </div>
  );
}
