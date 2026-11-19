import { describe, expect, it } from 'vitest';
import { checkFromInput } from '@/domain/checkFromInput';
import { BOOKINGS as SAMPLE_BOOKINGS, ROOMS as SAMPLE_ROOMS } from '@/data/rooms';
import type { Booking, Room } from '@/types';

const CURRENT_TIME = 540; // 09:00
const ROOM_ID = 'R1';

function makeFixtures(
  options: { blocked?: boolean; bookings?: Booking[] } = {},
): { rooms: Room[]; bookings: Booking[] } {
  return {
    rooms: [
      { id: ROOM_ID, name: 'Test Room', building: 'Test Building', capacity: 20, equipment: [], blocked: options.blocked ?? false },
    ],
    bookings: options.bookings ?? [
      { id: 'B1', roomId: ROOM_ID, start: 600, end: 660, bookedBy: 'Test Booker' },
    ],
  };
}

function run(startStr: string, endStr: string, fixtures = makeFixtures()) {
  return checkFromInput(startStr, endStr, ROOM_ID, CURRENT_TIME, fixtures.rooms, fixtures.bookings);
}

describe('checkFromInput: invalid input', () => {
  it.each([
    ['', '10:30'],
    ['09:30', ''],
    ['25:00', '10:30'],
    ['09:30', '10:75'],
    ['9:30', '10:30'],
  ])('rejects invalid input start=%j end=%j with the format message', (startStr, endStr) => {
    expect(run(startStr, endStr)).toEqual({
      decision: 'unavailable',
      reasons: ['Please enter valid times in HH:MM format.'],
    });
  });
});

describe('checkFromInput: AC1 past and reversed intervals', () => {
  it('rejects a start time before the current time (AC1)', () => {
    // 08:00 is before the 09:00 current time, so the request is in the past.
    expect(run('08:00', '08:30')).toEqual({
      decision: 'unavailable',
      reasons: ['Start time must be after the current time.'],
    });
  });

  it('rejects a reversed interval where end is before start (AC1)', () => {
    // 11:00 to 10:00 is reversed; no other rule fires, so only this reason appears.
    expect(run('11:00', '10:00')).toEqual({
      decision: 'unavailable',
      reasons: ['Start time must be earlier than end time.'],
    });
  });
});

describe('checkFromInput: AC2 duration limit', () => {
  it('rejects a 121-minute booking (AC2)', () => {
    // 11:00 to 13:01 is 121 minutes and does not touch the 10:00-11:00 booking.
    expect(run('11:00', '13:01')).toEqual({
      decision: 'unavailable',
      reasons: ['Bookings cannot be longer than 120 minutes.'],
    });
  });

  it('accepts a booking of exactly 120 minutes (AC2)', () => {
    expect(run('11:00', '13:00')).toEqual({ decision: 'available', reasons: [] });
  });
});

describe('checkFromInput: AC3 blocked room', () => {
  it('rejects a valid slot in a blocked room (AC3)', () => {
    expect(run('11:00', '12:00', makeFixtures({ blocked: true }))).toEqual({
      decision: 'unavailable',
      reasons: ['Test Room is currently blocked and cannot be booked.'],
    });
  });
});

describe('checkFromInput: AC4 overlaps and touching endpoints', () => {
  it('rejects a slot that overlaps an existing booking (AC4)', () => {
    expect(run('10:30', '11:30')).toEqual({
      decision: 'unavailable',
      reasons: ['Overlaps an existing booking (10:00–11:00, Test Booker).'],
    });
  });

  it('allows a slot that ends exactly when a booking starts (AC4)', () => {
    expect(run('09:30', '10:00')).toEqual({ decision: 'available', reasons: [] });
  });

  it('allows a slot that starts exactly when a booking ends (AC4)', () => {
    expect(run('11:00', '12:00')).toEqual({ decision: 'available', reasons: [] });
  });

  it('returns available with no reasons for a free valid slot (AC4)', () => {
    expect(run('11:00', '11:30')).toEqual({
      decision: 'available',
      reasons: [],
    });
  });
});

describe('checkFromInput: AC5 unchanged data', () => {
  it('leaves an unsorted two-booking array and its order unchanged (AC5)', () => {
    const fixtures = makeFixtures({
      bookings: [
        { id: 'B2', roomId: ROOM_ID, start: 720, end: 780, bookedBy: 'Second Booker' },
        { id: 'B1', roomId: ROOM_ID, start: 600, end: 660, bookedBy: 'Test Booker' },
      ],
    });
    const snapshot = structuredClone(fixtures.bookings);

    expect(run('10:30', '11:30', fixtures).decision).toBe('unavailable');
    expect(run('11:00', '12:00', fixtures).decision).toBe('available');

    expect(fixtures.bookings).toEqual(snapshot);
    expect(fixtures.bookings[0].id).toBe('B2');
  });

  it('leaves SAMPLE_ROOMS and SAMPLE_BOOKINGS unchanged after checks (AC5)', () => {
    const roomsBefore = structuredClone(SAMPLE_ROOMS);
    const bookingsBefore = structuredClone(SAMPLE_BOOKINGS);

    checkFromInput('13:00', '14:00', 'R101', 510, SAMPLE_ROOMS, SAMPLE_BOOKINGS);
    checkFromInput('10:00', '11:00', 'R201', 510, SAMPLE_ROOMS, SAMPLE_BOOKINGS);

    expect(SAMPLE_ROOMS).toEqual(roomsBefore);
    expect(SAMPLE_BOOKINGS).toEqual(bookingsBefore);
  });
});
