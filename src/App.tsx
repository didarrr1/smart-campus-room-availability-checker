import { useState } from 'react';
import { Clock, Search } from 'lucide-react';
import type { CheckResult } from '@/types';
import { BOOKINGS, ROOMS, bookingsForRoom, findRoom } from '@/data/rooms';
import { fmtTime, parseInterval, parseTime } from '@/domain/time';
import { checkFromInput } from '@/domain/checkFromInput';
import { MAX_DURATION } from '@/domain/availability';
import { filterRooms } from '@/domain/roomFilter';
import { nextSelectedRoomId } from '@/domain/roomSelection';
import { toExplainRequest } from '@/explain/contract';
import { createMockAdapter } from '@/explain/mockAdapter';
import { BookingsTable } from '@/components/BookingsTable';
import { ExplainBox } from '@/components/ExplainBox';
import { ResultPanel } from '@/components/ResultPanel';
import { RoomFilters } from '@/components/RoomFilters';
import { RoomPicker } from '@/components/RoomPicker';
import { Timeline } from '@/components/Timeline';

const DEFAULT_CURRENT = 510; // 08:30

const mockAdapter = createMockAdapter();

function parseAttendees(value: string): number {
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? 1 : Math.max(1, n);
}

function App() {
  const [rooms] = useState(ROOMS);
  const [bookings] = useState(BOOKINGS);
  const [roomId, setRoomId] = useState<string | null>(ROOMS[0].id);
  const [attendeesInput, setAttendeesInput] = useState('1');
  const [equipment, setEquipment] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(DEFAULT_CURRENT);
  const [startStr, setStartStr] = useState('09:30');
  const [endStr, setEndStr] = useState('10:30');
  const [result, setResult] = useState<CheckResult | null>(null);

  const { start, end } = parseInterval(startStr, endStr);

  const visibleRooms = filterRooms(rooms, { attendees: parseAttendees(attendeesInput), equipment });

  const room = findRoom(rooms, roomId);

  function applyFilters(nextAttendeesInput: string, nextEquipment: string[]) {
    const nextVisible = filterRooms(rooms, {
      attendees: parseAttendees(nextAttendeesInput),
      equipment: nextEquipment,
    });
    setAttendeesInput(nextAttendeesInput);
    setEquipment(nextEquipment);
    setRoomId((current) => nextSelectedRoomId(current, nextVisible));
    setResult(null);
  }

  function handleToggleEquipment(item: string) {
    const nextEquipment = equipment.includes(item)
      ? equipment.filter((e) => e !== item)
      : [...equipment, item];
    applyFilters(attendeesInput, nextEquipment);
  }

  function handleCheck() {
    if (roomId === null) return;
    setResult(
      checkFromInput(startStr, endStr, roomId, currentTime, rooms, bookingsForRoom(roomId, bookings)),
    );
  }

  const currentStr = fmtTime(currentTime);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Clock className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Smart Campus Room Availability Checker</h1>
              <p className="text-sm text-slate-500">Check whether a campus room is free for your requested time slot.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Requirements */}
        <RoomFilters
          attendees={attendeesInput}
          onAttendeesChange={(value) => applyFilters(value, equipment)}
          selectedEquipment={equipment}
          onToggleEquipment={handleToggleEquipment}
        />

        {/* Room selection */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">2. Select a room</h2>
          {visibleRooms.length > 0 ? (
            <RoomPicker
              rooms={visibleRooms}
              selectedId={roomId}
              onSelect={(id) => { setRoomId(id); setResult(null); }}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
              No rooms match your requirements. Lower the number of attendees or remove some equipment.
            </div>
          )}
        </section>

        {/* Time inputs */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-4">3. Enter your requested interval</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Start time</span>
              <input
                type="time"
                value={startStr}
                onChange={(e) => { setStartStr(e.target.value); setResult(null); }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">End time</span>
              <input
                type="time"
                value={endStr}
                onChange={(e) => { setEndStr(e.target.value); setResult(null); }}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-slate-600">Current time</span>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="time"
                  value={currentStr}
                  onChange={(e) => {
                    const v = parseTime(e.target.value);
                    if (v !== null) setCurrentTime(v);
                    setResult(null);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            </label>
          </div>

          <p className="text-xs text-slate-400 mt-3">
            Times are in 24-hour format. Max booking duration is {MAX_DURATION} minutes. Touching endpoints (e.g. 09:00–10:00 and 10:00–11:00) are allowed.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCheck}
              disabled={roomId === null}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 disabled:shadow-none disabled:hover:bg-slate-300"
            >
              <Search size={16} />
              Check Availability
            </button>
            {roomId === null && (
              <span className="text-xs text-slate-500">Select a room first</span>
            )}
          </div>
        </section>

        {result && (
          <section className="space-y-4">
            <ResultPanel
              result={result}
              roomName={room?.name ?? 'Unknown room'}
              startStr={startStr}
              endStr={endStr}
            />
            {room && (
              <ExplainBox
                request={toExplainRequest(room, startStr, endStr, result)}
                adapter={mockAdapter}
              />
            )}
          </section>
        )}

        {/* Timeline */}
        <section>
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Room schedule overview</h2>
          <Timeline
            rooms={visibleRooms}
            bookings={bookings}
            candidateStart={start}
            candidateEnd={end}
          />
        </section>

        <BookingsTable rooms={rooms} bookings={bookings} />
      </main>

      <footer className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-slate-400">
        Fictional sample data only · No data is modified when checking availability
      </footer>
    </div>
  );
}

export default App;
