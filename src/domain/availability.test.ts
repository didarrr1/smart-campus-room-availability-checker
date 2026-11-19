import { describe, expect, it } from 'vitest';
import { checkAvailability, overlaps } from '@/domain/availability';
import type { Booking, Room } from '@/types';

const CURRENT_TIME = 540;
const ROOM_ID = 'R1';
const OTHER_ROOM_ID = 'R2';

function createFixtures(bookings: Booking[] = [
  { id: 'B1', roomId: ROOM_ID, start: 600, end: 660, bookedBy: 'Test Booker' },
]): { rooms: Room[]; bookings: Booking[] } {
  return {
    rooms: [
      { id: ROOM_ID, name: 'Test Room', building: 'Test Building', capacity: 20, equipment: [], blocked: false },
      { id: OTHER_ROOM_ID, name: 'Other Room', building: 'Test Building', capacity: 20, equipment: [], blocked: false },
    ],
    bookings,
  };
}

type Case = {
  id: string;
  roomId?: string;
  start: number;
  end: number;
  expected: 'available' | 'unavailable';
  bookings?: Booking[];
};

const cases: Case[] = [
  { id: 'T01', start: 660, end: 720, expected: 'available' },
  { id: 'T02', start: 540, end: 570, expected: 'unavailable' },
  { id: 'T03', start: 720, end: 720, expected: 'unavailable' },
  { id: 'T04', start: 750, end: 720, expected: 'unavailable' },
  { id: 'T05', start: 1380, end: 1441, expected: 'unavailable' },
  { id: 'T06', start: 720, end: 840, expected: 'available' },
  { id: 'T07', start: 720, end: 841, expected: 'unavailable' },
  { id: 'T08', start: 570, end: 600, expected: 'available' },
  { id: 'T09', start: 630, end: 690, expected: 'unavailable' },
  { id: 'T10', start: 570, end: 690, expected: 'unavailable' },
  { id: 'T11', start: 615, end: 645, expected: 'unavailable' },
  { id: 'T12', start: 600, end: 660, expected: 'unavailable' },
  { id: 'T14', start: 630, end: 690, expected: 'available', bookings: [] },
  { id: 'T16', roomId: OTHER_ROOM_ID, start: 630, end: 690, expected: 'available' },
  { id: 'T17', start: 1380, end: 1440, expected: 'available' },
];

describe('checkAvailability', () => {
  it.each(cases)('$id: $start–$end → $expected', ({ roomId = ROOM_ID, start, end, expected, bookings }) => {
    const { rooms, bookings: fixtureBookings } = createFixtures(bookings);
    const bookingsBefore = structuredClone(fixtureBookings);

    const result = checkAvailability(
      { roomId, start, end, currentTime: CURRENT_TIME },
      rooms,
      fixtureBookings,
    );

    expect(result.decision).toBe(expected);
    expect(fixtureBookings).toEqual(bookingsBefore);
  });

  it('T02 reports that the start cannot be equal to the current time (AC1)', () => {
    const { rooms, bookings } = createFixtures();

    const result = checkAvailability(
      { roomId: ROOM_ID, start: 540, end: 570, currentTime: CURRENT_TIME },
      rooms,
      bookings,
    );

    expect(result).toEqual({
      decision: 'unavailable',
      reasons: ['Start time must be after the current time.'],
    });
  });

  it('T05 rejects an end time past 24:00 but keeps the exact range reason (AC1)', () => {
    const { rooms, bookings } = createFixtures();

    const result = checkAvailability(
      { roomId: ROOM_ID, start: 1380, end: 1441, currentTime: CURRENT_TIME },
      rooms,
      bookings,
    );

    expect(result).toEqual({
      decision: 'unavailable',
      reasons: ['The requested time is outside the allowed range (00:00–24:00).'],
    });
  });

  it('T09 reports the exact conflicting booking reason (AC4)', () => {
    const { rooms, bookings } = createFixtures();

    const result = checkAvailability(
      { roomId: ROOM_ID, start: 630, end: 690, currentTime: CURRENT_TIME },
      rooms,
      bookings,
    );

    expect(result).toEqual({
      decision: 'unavailable',
      reasons: ['Overlaps an existing booking (10:00–11:00, Test Booker).'],
    });
  });

  it('T13 rejects a valid interval in a blocked room with the exact blocking reason (AC3)', () => {
    const { rooms, bookings } = createFixtures();
    const blockedRooms = rooms.map((room) =>
      room.id === ROOM_ID ? { ...room, blocked: true } : room,
    );

    const result = checkAvailability(
      { roomId: ROOM_ID, start: 660, end: 720, currentTime: CURRENT_TIME },
      blockedRooms,
      bookings,
    );

    expect(result).toEqual({
      decision: 'unavailable',
      reasons: ['Test Room is currently blocked and cannot be booked.'],
    });
  });

  it('T15 does not change the booking data while checking (AC5)', () => {
    const { rooms, bookings } = createFixtures();
    const bookingsBefore = structuredClone(bookings);

    const result = checkAvailability(
      { roomId: ROOM_ID, start: 630, end: 690, currentTime: CURRENT_TIME },
      rooms,
      bookings,
    );

    expect(result.decision).toBe('unavailable');
    expect(bookings).toEqual(bookingsBefore);
  });
});

// ---- Practice 08: regression tests proposed by the two AI runs for BUG-A ----
describe('REG-A baseline AI: overlaps endpoint boundaries (AC4)', () => {
  it.each([
    [660, 720, 600, 660, false],
    [570, 600, 600, 660, false],
    [659, 720, 600, 660, true],
    [570, 601, 600, 660, true],
    [600, 660, 600, 660, true],
  ])('overlaps(%i, %i, %i, %i) → %s', (aS, aE, bS, bE, expected) => {
    expect(overlaps(aS, aE, bS, bE)).toBe(expected);
    expect(overlaps(bS, bE, aS, aE)).toBe(expected);
  });

  it('touching bookings on both sides are available with no reasons', () => {
    const { rooms, bookings } = createFixtures();
    for (const [start, end] of [[570, 600], [660, 720]]) {
      expect(
        checkAvailability({ roomId: ROOM_ID, start, end, currentTime: CURRENT_TIME }, rooms, bookings),
      ).toEqual({ decision: 'available', reasons: [] });
    }
  });
});

describe('REG-A skill AI: touching endpoints are not overlaps (AC4)', () => {
  it.each([
    { a: [660, 720], b: [600, 660], expected: false },
    { a: [570, 600], b: [600, 660], expected: false },
    { a: [659, 720], b: [600, 660], expected: true },
    { a: [570, 601], b: [600, 660], expected: true },
  ])('$a vs $b → $expected', ({ a, b, expected }) => {
    expect(overlaps(a[0], a[1], b[0], b[1])).toBe(expected);
  });

  it('back-to-back booking is available with no reasons', () => {
    const { rooms, bookings } = createFixtures();
    const result = checkAvailability(
      { roomId: 'R1', start: 660, end: 720, currentTime: 540 },
      rooms,
      bookings,
    );
    expect(result).toEqual({ decision: 'available', reasons: [] });
  });
});

describe('REG-B: checking must not reorder or change the bookings array (AC5)', () => {
  it('T18 keeps an unsorted multi-booking array exactly as it was', () => {
    const { rooms, bookings } = createFixtures([
      { id: 'B2', roomId: ROOM_ID, start: 720, end: 780, bookedBy: 'Second Booker' },
      { id: 'B1', roomId: ROOM_ID, start: 600, end: 660, bookedBy: 'Test Booker' },
    ]);
    const bookingsBefore = structuredClone(bookings);
    const firstBefore = bookings[0];

    const result = checkAvailability(
      { roomId: ROOM_ID, start: 660, end: 720, currentTime: CURRENT_TIME },
      rooms,
      bookings,
    );

    expect(result.decision).toBe('available');
    expect(bookings).toEqual(bookingsBefore);
    expect(bookings[0]).toBe(firstBefore);
  });
});
