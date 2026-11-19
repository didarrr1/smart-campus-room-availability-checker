import type { Booking, Room } from '@/types';
import { findRoom } from '@/data/rooms';
import { fmtTime } from '@/domain/time';

interface BookingsTableProps {
  rooms: Room[];
  bookings: Booking[];
}

export function BookingsTable({ rooms, bookings }: BookingsTableProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">Existing bookings (unchanged)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400 border-b border-slate-100">
              <th className="py-2 pr-4">Room</th>
              <th className="py-2 pr-4">Booked by</th>
              <th className="py-2 pr-4">From</th>
              <th className="py-2">To</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => {
              const r = findRoom(rooms, b.roomId);
              return (
                <tr key={b.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 pr-4 font-medium text-slate-700">{r?.name ?? b.roomId}</td>
                  <td className="py-2 pr-4 text-slate-600">{b.bookedBy}</td>
                  <td className="py-2 pr-4 font-mono text-slate-600">{fmtTime(b.start)}</td>
                  <td className="py-2 font-mono text-slate-600">{fmtTime(b.end)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
