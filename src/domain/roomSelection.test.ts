import { describe, expect, it } from 'vitest';
import { ROOMS } from '@/data/rooms';
import { nextSelectedRoomId } from '@/domain/roomSelection';

describe('nextSelectedRoomId', () => {
  it('keeps the current room when it is still visible', () => {
    expect(nextSelectedRoomId('R102', ROOMS)).toBe('R102');
  });

  it('clears the selection when the current room is no longer visible', () => {
    const visible = ROOMS.filter((room) => room.id !== 'R102');
    expect(nextSelectedRoomId('R102', visible)).toBeNull();
  });

  it('returns null when no room is selected', () => {
    expect(nextSelectedRoomId(null, ROOMS)).toBeNull();
  });

  it('returns null when no rooms are visible', () => {
    expect(nextSelectedRoomId('R101', [])).toBeNull();
  });
});
