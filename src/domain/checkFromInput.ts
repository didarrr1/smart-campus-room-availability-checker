import type { Booking, CheckResult, Room } from '@/types';
import { checkAvailability } from '@/domain/availability';
import { parseInterval } from '@/domain/time';

export function checkFromInput(
  startStr: string,
  endStr: string,
  roomId: string,
  currentTime: number,
  rooms: Room[],
  bookings: Booking[],
): CheckResult {
  const { start, end } = parseInterval(startStr, endStr);
  if (start === null || end === null) {
    return { decision: 'unavailable', reasons: ['Please enter valid times in HH:MM format.'] };
  }
  return checkAvailability({ roomId, start, end, currentTime }, rooms, bookings);
}
