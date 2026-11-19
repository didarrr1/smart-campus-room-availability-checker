import { describe, expect, it } from 'vitest';
import { BOOKINGS, ROOMS, bookingsForRoom } from '@/data/rooms';
import { checkAvailability } from '@/domain/availability';
import { filterRooms } from '@/domain/roomFilter';

const ids = (rooms: { id: string }[]) => rooms.map((r) => r.id);

describe('filterRooms', () => {
  it('keeps a room whose capacity exactly matches the attendees', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 30, equipment: [] }))).toContain('R102');
  });

  it('excludes a room that is one seat short', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 31, equipment: [] }))).not.toContain('R102');
  });

  it('requires all requested equipment', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 0, equipment: ['projector', 'microphone'] }))).toEqual([
      'R101',
      'R305',
    ]);
  });

  it('returns every room that has the single requested item', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 0, equipment: ['whiteboard'] }))).toEqual([
      'R101',
      'R102',
      'R202',
    ]);
  });

  it('returns all rooms when there are no attendee or equipment requirements', () => {
    expect(ids(filterRooms(ROOMS, { attendees: 0, equipment: [] }))).toEqual(ids(ROOMS));
  });

  it('returns an empty list for an unknown equipment item', () => {
    expect(filterRooms(ROOMS, { attendees: 0, equipment: ['hologram'] })).toEqual([]);
  });

  it('does not mutate the rooms or the requirements', () => {
    const rooms = structuredClone(ROOMS);
    const requirements = { attendees: 10, equipment: ['projector'] };
    const requirementsBefore = structuredClone(requirements);
    filterRooms(rooms, requirements);
    expect(rooms).toEqual(ROOMS);
    expect(requirements).toEqual(requirementsBefore);
  });
});

describe('blocked rooms (F3)', () => {
  const blockedRooms = ROOMS.filter((room) => room.blocked);

  it('has at least one blocked room to check', () => {
    expect(blockedRooms.length).toBeGreaterThan(0);
  });

  it.each(blockedRooms.map((room) => [room.id, room] as const))(
    'room %s is unavailable for 11:00-12:00 at 09:00',
    (roomId) => {
      const result = checkAvailability(
        { roomId, start: 660, end: 720, currentTime: 540 },
        ROOMS,
        BOOKINGS,
      );
      expect(result.decision).toBe('unavailable');
      expect(result.reasons).toContain(`${ROOMS.find((r) => r.id === roomId)?.name} is currently blocked and cannot be booked.`);
    },
  );
});

describe('per-room bookings', () => {
  const request = { start: 720, end: 780, currentTime: 540 };

  it('blocks 12:00-13:00 in R101 where a booking already exists', () => {
    const result = checkAvailability(
      { ...request, roomId: 'R101' },
      ROOMS,
      bookingsForRoom('R101', BOOKINGS),
    );
    expect(result.decision).toBe('unavailable');
  });

  it('allows 12:00-13:00 in R305 which has no conflicting booking', () => {
    const result = checkAvailability(
      { ...request, roomId: 'R305' },
      ROOMS,
      bookingsForRoom('R305', BOOKINGS),
    );
    expect(result.decision).toBe('available');
  });
});
