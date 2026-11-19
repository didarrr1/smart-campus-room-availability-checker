import type { Room } from '@/types';

export type RoomRequirements = { attendees: number; equipment: string[] };

export function filterRooms(rooms: Room[], requirements: RoomRequirements): Room[] {
  return rooms.filter(
    (room) =>
      room.capacity >= requirements.attendees &&
      requirements.equipment.every((item) => room.equipment.includes(item)),
  );
}
