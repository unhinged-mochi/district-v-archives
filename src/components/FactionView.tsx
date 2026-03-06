import type { Faction } from "../types";
import { parseBody } from "./parseBody";
import { useStaggerIn } from "./useStaggerIn";

function MemberList({
  label,
  members,
  color,
  emptyMessage,
  onOpenCharacter,
}: {
  label: string;
  members: Array<{ id: string; name: string }>;
  color?: string;
  emptyMessage?: string;
  onOpenCharacter: (id: string) => void;
}) {
  return (
    <div className="mb-6">
      <div
        className={
          "mb-2 border-terminal-amber border-b pb-1 font-bold" +
          (color ? "" : " text-terminal-amber-dim")
        }
        style={color ? { color } : undefined}
      >
        {label} ({members.length})
      </div>
      <div className="space-y-1">
        {members.length === 0 && emptyMessage ? (
          <div className="py-2 text-terminal-amber-dim">{emptyMessage}</div>
        ) : (
          members.map((member) => (
            <button
              className={`block cursor-pointer underline hover:opacity-80${color ? "" : " text-terminal-amber-dim"}`}
              key={member.id}
              onClick={() => onOpenCharacter(member.id)}
              style={color ? { color } : undefined}
              type="button"
            >
              {`> ${member.name}`}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

interface FactionViewProps {
  faction: Faction;
  formerMemberNames: Array<{ id: string; name: string }>;
  memberNames: Array<{ id: string; name: string }>;
  onOpenCharacter: (id: string) => void;
}

export default function FactionView({
  faction,
  memberNames,
  formerMemberNames,
  onOpenCharacter,
}: FactionViewProps) {
  const containerRef = useStaggerIn();

  return (
    <div className="font-mono text-sm text-terminal-amber" ref={containerRef}>
      {/* Header with colored top border */}
      <div
        className="mb-4 border-t-4 pt-2"
        style={{ borderColor: faction.color }}
      >
        <div className="font-bold text-lg" style={{ color: faction.color }}>
          {faction.name}
        </div>
        <div
          className="mt-1 inline-block border px-2 py-0.5 text-xs"
          style={{
            borderColor: faction.color,
            color: faction.color,
          }}
        >
          {faction.type}
        </div>
      </div>

      {/* Leader */}
      {faction.leader !== "none" && (
        <div className="mb-4">
          <span className="text-terminal-amber-dim">LEADER: </span>
          {(() => {
            const leader = memberNames.find((m) => m.id === faction.leader);
            return leader ? (
              <button
                className="cursor-pointer font-bold underline hover:opacity-80"
                onClick={() => onOpenCharacter(faction.leader)}
                style={{ color: faction.color }}
                type="button"
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
      <MemberList
        color={faction.color}
        emptyMessage="NO KNOWN MEMBERS ON FILE"
        label="ROSTER"
        members={memberNames}
        onOpenCharacter={onOpenCharacter}
      />

      {/* Former Members */}
      {formerMemberNames.length > 0 && (
        <MemberList
          label="FORMER MEMBERS"
          members={formerMemberNames}
          onOpenCharacter={onOpenCharacter}
        />
      )}

      {/* Body */}
      <div className="mb-6">
        <div className="mb-2 border-terminal-amber border-b pb-1 font-bold">
          INTELLIGENCE REPORT
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">
          {parseBody(faction.body, { onOpenCharacter })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-terminal-amber border-t pt-2 text-center text-terminal-amber-dim text-xs">
        {/* biome-ignore lint/suspicious/noCommentText: intentional terminal UI text */}
        LSPD INTELLIGENCE DIVISION // CLASSIFIED
      </div>
    </div>
  );
}
