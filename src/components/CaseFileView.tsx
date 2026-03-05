import type { Day } from '../types';
import { parseBody } from './parseBody';
import { useStaggerIn } from './useStaggerIn';

interface CaseFileViewProps {
  day: Day;
  onOpenCharacter?: (id: string) => void;
}

export default function CaseFileView({ day, onOpenCharacter }: CaseFileViewProps) {
  const containerRef = useStaggerIn();
  const caseNumber = 'DV-2026-0221-D' + String(day.day).padStart(2, '0');

  return (
    <div ref={containerRef} className="font-mono text-sm text-terminal-amber">
      {/* Header */}
      <div className="mb-4 text-center">
        <div className="font-bold">LOS SANTOS POLICE DEPARTMENT</div>
        <div className="font-bold">DAILY INCIDENT REPORT</div>
        <div className="my-1">========================</div>
        <div className="text-left">
          <div>
            <span className="text-terminal-amber-dim">CASE: </span>#{caseNumber}
          </div>
          <div>
            <span className="text-terminal-amber-dim">DATE: </span>
            {day.date}
          </div>
          <div>
            <span className="text-terminal-amber-dim">TITLE: </span>
            {day.title}
          </div>
        </div>
        <div className="my-1">========================</div>
      </div>

      {/* Body */}
      <div className="mb-6">{parseBody(day.body, { headingStyle: 'casefile', onOpenCharacter })}</div>

      {/* Footer */}
      <div
        className="border-t border-terminal-amber pt-2 text-xs text-terminal-amber-dim text-center"
      >
        END OF REPORT // CASE #{caseNumber} // LSPD INTERNAL USE ONLY
      </div>
    </div>
  );
}
