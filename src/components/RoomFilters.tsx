import { useId } from 'react';
import { Users } from 'lucide-react';
import { ROOMS } from '@/data/rooms';

interface RoomFiltersProps {
  attendees: string;
  onAttendeesChange: (value: string) => void;
  selectedEquipment: string[];
  onToggleEquipment: (item: string) => void;
}

const EQUIPMENT_OPTIONS = Array.from(new Set(ROOMS.flatMap((room) => room.equipment)));

export function RoomFilters({
  attendees,
  onAttendeesChange,
  selectedEquipment,
  onToggleEquipment,
}: RoomFiltersProps) {
  const headingId = useId();

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6" role="group" aria-labelledby={headingId}>
      <h2 id={headingId} className="text-sm font-semibold text-slate-700 mb-4">1. Set your requirements</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Attendees</span>
          <div className="mt-1 relative">
            <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={(e) => onAttendeesChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
            />
          </div>
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-xs font-medium text-slate-600 mb-1">Equipment</legend>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((item) => {
              const checked = selectedEquipment.includes(item);
              return (
                <label
                  key={item}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm cursor-pointer transition-colors ${
                    checked
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEquipment(item)}
                    className="accent-blue-600"
                  />
                  {item}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>
    </div>
  );
}
