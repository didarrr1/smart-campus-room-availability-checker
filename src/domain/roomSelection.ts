import type { Room } from '@/types';

export function nextSelectedRoomId(currentId: string | null, visibleRooms: Room[]): string | null {
  return visibleRooms.some((room) => room.id === currentId) ? currentId : null;
}
