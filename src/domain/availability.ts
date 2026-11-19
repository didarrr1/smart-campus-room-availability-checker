import type { Booking, CheckRequest, CheckResult, Room } from '@/types';
import { findRoom } from '@/data/rooms';
import { fmtTime } from '@/domain/time';

const MINUTES_PER_DAY = 1440;
export const MAX_DURATION = 120;

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  // Touching endpoints are allowed — overlap requires strict crossing.
  return aStart < bEnd && bStart < aEnd;
}

export function checkAvailability(
  req: CheckRequest,
  rooms: Room[],
  bookings: Booking[],
): CheckResult {
  const reasons: string[] = [];
  const { start, end, currentTime, roomId } = req;

  // AC1: valid interval & start after current time
  if (start < 0 || end > MINUTES_PER_DAY) {
    reasons.push('The requested time is outside the allowed range (00:00–24:00).');
  }
  if (start >= end) {
    reasons.push('Start time must be earlier than end time.');
  }
  if (start <= currentTime) {
    reasons.push('Start time must be after the current time.');
  }

  // AC2: booking longer than 120 minutes
  if (end - start > MAX_DURATION) {
    reasons.push('Bookings cannot be longer than 120 minutes.');
  }

  // AC3: room blocked
  const room = findRoom(rooms, roomId);
  if (!room) {
    reasons.push('The selected room does not exist.');
  } else if (room.blocked) {
    reasons.push(`${room.name} is currently blocked and cannot be booked.`);
  }

  // AC4: overlap with existing bookings (touching endpoints allowed)
  if (room) {
    const conflicts = bookings.filter(
      (b) => b.roomId === roomId && overlaps(start, end, b.start, b.end),
    );
    for (const c of conflicts) {
      reasons.push(
        `Overlaps an existing booking (${fmtTime(c.start)}–${fmtTime(c.end)}, ${c.bookedBy}).`,
      );
    }
  }

  return {
    decision: reasons.length === 0 ? 'available' : 'unavailable',
    reasons,
  };
}
