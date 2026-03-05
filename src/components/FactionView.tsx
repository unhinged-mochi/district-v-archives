import type { Faction } from '../types';
import { parseBody } from './parseBody';
import { useStaggerIn } from './useStaggerIn';

interface FactionViewProps {
  faction: Faction;
  memberNames: Array<{ id: string; name: string }>;
  onOpenCharacter: (id: string) => void;
}

export default function FactionView({ faction, memberNames, onOpenCharacter }: FactionViewProps) {
  const containerRef = useStaggerIn();

  return (
    <div ref={containerRef} className="font-mono text-sm text-terminal-amber">
      {/* Header with colored top border */}
      <div
        className="border-t-4 mb-4 pt-2"
        style={{ borderColor: faction.color }}
      >
        <div className="text-lg font-bold" style={{ color: faction.color }}>
          {faction.name}
        </div>
        <div
          className="inline-block px-2 py-0.5 mt-1 text-xs border"
          style={{
            borderColor: faction.color,
            color: faction.color,
          }}
        >
          {faction.type}
        </div>
      </div>

      {/* Leader */}
      {faction.leader !== 'none' && (
        <div className="mb-4">
          <span className="text-terminal-amber-dim">LEADER: </span>
          {(() => {
            const leader = memberNames.find((m) => m.id === faction.leader);
            return leader ? (
              <button
                className="font-bold underline cursor-pointer hover:opacity-80"
                style={{ color: faction.color }}
                onClick={() => onOpenCharacter(faction.leader)}
              >
                {leader.name}
              </button>
            ) : (
              <span className="font-bold">{faction.leader}</span>
            );
          })()}
        </div>
      )}

      {/* Roster */}
      <div className="mb-6">
        <div
          className="border-b border-terminal-amber pb-1 mb-2 font-bold"
        >
          ROSTER ({memberNames.length})
        </div>
        <div className="space-y-1">
          {memberNames.length === 0 ? (
            <div className="text-terminal-amber-dim py-2">NO KNOWN MEMBERS ON FILE</div>
          ) : (
            memberNames.map((member) => (
              <button
                key={member.id}
                className="block underline cursor-pointer hover:opacity-80"
                style={{ color: faction.color }}
                onClick={() => onOpenCharacter(member.id)}
              >
                {'> ' + member.name}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mb-6">
        <div
          className="border-b border-terminal-amber pb-1 mb-2 font-bold"
        >
          INTELLIGENCE REPORT
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{parseBody(faction.body, { onOpenCharacter })}</div>
      </div>

      {/* Footer */}
      <div
        className="border-t border-terminal-amber pt-2 text-xs text-terminal-amber-dim text-center"
      >
        LSPD INTELLIGENCE DIVISION // CLASSIFIED
      </div>
    </div>
  );
}
