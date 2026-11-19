import type { Booking, Room } from '@/types';
import { fmtTime } from '@/domain/time';

interface TimelineProps {
  rooms: Room[];
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
}

const START_HR = 7;
const END_HR = 19;
const SPAN = (END_HR - START_HR) * 60;

function pct(min: number): string {
  return `${((min - START_HR * 60) / SPAN) * 100}%`;
}

export function Timeline({ rooms, bookings, candidateStart, candidateEnd }: TimelineProps) {
  const hours: number[] = [];
  for (let h = START_HR; h <= END_HR; h++) hours.push(h);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">Booking Overview ({fmtTime(START_HR * 60)}–{fmtTime(END_HR * 60)})</h3>
      <div className="space-y-3">
        {rooms.map((room) => {
          const roomBookings = bookings.filter((b) => b.roomId === room.id);
          return (
            <div key={room.id} className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-40 shrink-0 text-xs font-medium text-slate-600 truncate">
                {room.name}
                {room.blocked && <span className="ml-1 text-red-500">(blocked)</span>}
              </div>
              <div className="relative h-8 w-full sm:flex-1 rounded-lg bg-slate-100 overflow-hidden">
                {/* hour grid lines */}
                {hours.map((h, i) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-slate-200"
                    style={{ left: `${(i / (hours.length - 1)) * 100}%` }}
                  />
                ))}
                {/* existing bookings */}
                {roomBookings.map((b) => (
                  <div
                    key={b.id}
                    className="absolute top-1 bottom-1 rounded bg-slate-400/80 px-1 flex items-center overflow-hidden"
                    style={{
                      left: pct(Math.max(START_HR * 60, b.start)),
                      width: `calc(${pct(Math.min(END_HR * 60, b.end))} - ${pct(Math.max(START_HR * 60, b.start))})`,
                    }}
                    title={`${fmtTime(b.start)}–${fmtTime(b.end)} (${b.bookedBy})`}
                  >
                    <span className="text-[10px] text-white font-medium whitespace-nowrap">
                      {fmtTime(b.start)}
                    </span>
                  </div>
                ))}
                {/* candidate interval */}
                {candidateStart !== null && candidateEnd !== null && candidateStart < candidateEnd && (
                  <div
                    className="absolute top-0 bottom-0 border-2 border-dashed border-blue-500 bg-blue-400/20 rounded"
                    style={{
                      left: pct(Math.max(START_HR * 60, candidateStart)),
                      width: `calc(${pct(Math.min(END_HR * 60, candidateEnd))} - ${pct(Math.max(START_HR * 60, candidateStart))})`,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* hour labels */}
      <div className="flex mt-2 ml-0 sm:ml-40">
        <div className="relative flex-1 h-4">
          {hours.map((h, i) => (
            <span
              key={h}
              className="absolute text-[10px] text-slate-400 -translate-x-1/2"
              style={{ left: `${(i / (hours.length - 1)) * 100}%` }}
            >
              {String(h).padStart(2, '0')}:00
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
