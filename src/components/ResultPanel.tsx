import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { CheckResult } from '@/types';

interface ResultPanelProps {
  result: CheckResult;
  roomName: string;
  startStr: string;
  endStr: string;
}

export function ResultPanel({ result, roomName, startStr, endStr }: ResultPanelProps) {
  return (
    <section
      className={`rounded-xl border-2 p-4 sm:p-6 transition-all ${
        result.decision === 'available'
          ? 'border-green-300 bg-green-50'
          : 'border-red-300 bg-red-50'
      }`}
    >
      <div className="flex items-start gap-3">
        {result.decision === 'available' ? (
          <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={24} />
        ) : (
          <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} />
        )}
        <div className="flex-1">
          <h3 className={`font-bold text-base ${result.decision === 'available' ? 'text-green-700' : 'text-red-700'}`}>
            {roomName} — {result.decision === 'available' ? 'Available' : 'Unavailable'}
          </h3>
          {result.decision === 'available' ? (
            <p className="text-sm text-green-700/80 mt-1">
              The room is available from {startStr} to {endStr}. You may proceed with your booking.
            </p>
          ) : (
            <ul className="text-sm text-red-700/80 mt-1 space-y-0.5 list-disc list-inside">
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
