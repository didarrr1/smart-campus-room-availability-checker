import { Lock, Users } from 'lucide-react';
import type { Room } from '@/types';

interface RoomPickerProps {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RoomPicker({ rooms, selectedId, onSelect }: RoomPickerProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {rooms.map((room) => {
        const isSelected = room.id === selectedId;
        return (
          <button
            key={room.id}
            type="button"
            onClick={() => onSelect(room.id)}
            className={`text-left rounded-xl border-2 p-4 transition-all ${
              isSelected
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold text-slate-800 text-sm">{room.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{room.building}</div>
              </div>
              {room.blocked && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">
                  <Lock size={12} /> Blocked
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
              <Users size={14} />
              <span>Capacity: {room.capacity}</span>
              <span className="mx-1">·</span>
              <span className="font-mono">{room.id}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {room.equipment.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                  {item}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}
