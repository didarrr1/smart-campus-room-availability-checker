import { describe, expect, it } from 'vitest';
import { BOOKINGS, ROOMS, bookingsForRoom, findRoom } from '@/data/rooms';

describe('room catalog', () => {
  it('contains at least four rooms', () => {
    expect(ROOMS.length).toBeGreaterThanOrEqual(4);
  });

  it.each(ROOMS.map((room) => [room.id, room] as const))(
    'room %s has id, name, capacity, equipment array and blocked flag',
    (_id, room) => {
      expect(typeof room.id).toBe('string');
      expect(room.id.length).toBeGreaterThan(0);
      expect(typeof room.name).toBe('string');
      expect(typeof room.capacity).toBe('number');
      expect(Array.isArray(room.equipment)).toBe(true);
      expect(typeof room.blocked).toBe('boolean');
    },
  );

  it('uses unique room ids', () => {
    const ids = ROOMS.map((room) => room.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('bookingsForRoom', () => {
  it('returns only the bookings for the requested room', () => {
    const result = bookingsForRoom('R101', BOOKINGS);
    expect(result.map((b) => b.id)).toEqual(['B001', 'B002']);
    expect(result.every((b) => b.roomId === 'R101')).toBe(true);
  });

  it('returns an empty list for a room with no bookings', () => {
    expect(bookingsForRoom('UNKNOWN', BOOKINGS)).toEqual([]);
  });

  it('does not mutate the booking list', () => {
    const snapshot = structuredClone(BOOKINGS);
    bookingsForRoom('R102', BOOKINGS);
    expect(BOOKINGS).toEqual(snapshot);
  });
});

describe('findRoom', () => {
  it('returns the room with the matching id', () => {
    expect(findRoom(ROOMS, 'R102')?.name).toBe('Seminar Room 12');
  });

  it('returns undefined for an unknown or missing id', () => {
    expect(findRoom(ROOMS, 'UNKNOWN')).toBeUndefined();
    expect(findRoom(ROOMS, null)).toBeUndefined();
  });
});
