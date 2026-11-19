import { describe, expect, it } from 'vitest';
import {
  fallbackExplanation,
  toExplainRequest,
  validateExplainRequest,
  validateExplanation,
  type ExplainRequest,
} from './contract';
import { ROOMS, findRoom } from '@/data/rooms';

const room = findRoom(ROOMS, 'R101')!;

const baseRequest: ExplainRequest = {
  roomLabel: 'Lecture Hall A',
  start: '09:30',
  end: '10:30',
  isAvailable: true,
  reasonCode: 'AVAILABLE',
};

describe('toExplainRequest', () => {
  it('maps an available result to AVAILABLE', () => {
    const req = toExplainRequest(room, '09:30', '10:30', { decision: 'available', reasons: [] });
    expect(req.reasonCode).toBe('AVAILABLE');
    expect(req.isAvailable).toBe(true);
    expect(req.roomLabel).toBe('Lecture Hall A');
  });

  it('maps an overlap result and never copies booker names', () => {
    const req = toExplainRequest(room, '09:30', '10:30', {
      decision: 'unavailable',
      reasons: ['Overlaps an existing booking (10:00–11:00, Dr. Smith).'],
    });
    expect(req.reasonCode).toBe('OVERLAP');
    expect(JSON.stringify(req)).not.toContain('Dr. Smith');
  });

  it('maps blocked, past, invalid, too-long and unknown-room results', () => {
    expect(
      toExplainRequest(room, '09:30', '10:30', {
        decision: 'unavailable',
        reasons: ['Lecture Hall A is currently blocked and cannot be booked.'],
      }).reasonCode,
    ).toBe('BLOCKED');
    expect(
      toExplainRequest(room, '09:30', '10:30', {
        decision: 'unavailable',
        reasons: ['Start time must be after the current time.'],
      }).reasonCode,
    ).toBe('PAST_TIME');
    expect(
      toExplainRequest(room, '09:30', '10:30', {
        decision: 'unavailable',
        reasons: ['Start time must be earlier than end time.'],
      }).reasonCode,
    ).toBe('INVALID_TIME');
    expect(
      toExplainRequest(room, '09:30', '10:30', {
        decision: 'unavailable',
        reasons: ['Bookings cannot be longer than 120 minutes.'],
      }).reasonCode,
    ).toBe('TOO_LONG');
    expect(
      toExplainRequest(room, '09:30', '10:30', {
        decision: 'unavailable',
        reasons: ['The selected room does not exist.'],
      }).reasonCode,
    ).toBe('UNKNOWN_ROOM');
  });
});

describe('validateExplainRequest', () => {
  it('accepts a valid request', () => {
    expect(validateExplainRequest(baseRequest)).toEqual({ ok: true });
  });

  it('rejects an empty label', () => {
    expect(validateExplainRequest({ ...baseRequest, roomLabel: '' }).ok).toBe(false);
  });

  it('rejects a label over 60 characters', () => {
    expect(validateExplainRequest({ ...baseRequest, roomLabel: 'x'.repeat(61) }).ok).toBe(false);
  });

  it('rejects bad time formats', () => {
    expect(validateExplainRequest({ ...baseRequest, start: '9:30' }).ok).toBe(false);
    expect(validateExplainRequest({ ...baseRequest, end: '25:00' }).ok).toBe(false);
  });

  it('rejects an unknown reason code', () => {
    const bad = { ...baseRequest, reasonCode: 'SOMETHING' } as unknown as ExplainRequest;
    expect(validateExplainRequest(bad).ok).toBe(false);
  });

  it('rejects a question over 200 characters', () => {
    expect(validateExplainRequest({ ...baseRequest, question: 'x'.repeat(201) }).ok).toBe(false);
  });
});

describe('validateExplanation', () => {
  it('accepts a valid explanation', () => {
    expect(validateExplanation('The room is free.', true)).toEqual({ ok: true });
  });

  it('rejects an empty explanation', () => {
    expect(validateExplanation('   ', true).ok).toBe(false);
  });

  it('rejects an explanation over 300 characters', () => {
    expect(validateExplanation('x'.repeat(301), true).ok).toBe(false);
  });

  it('rejects more than 2 sentences', () => {
    expect(validateExplanation('One. Two. Three.', true).ok).toBe(false);
  });

  it('rejects a contradiction of the decision', () => {
    expect(validateExplanation('The room is not available.', true).ok).toBe(false);
    expect(validateExplanation('The room is available then.', false).ok).toBe(false);
  });

  it('accepts a negated word inside an unavailable explanation', () => {
    expect(validateExplanation('The room is not available then.', false)).toEqual({ ok: true });
  });
});

describe('fallbackExplanation', () => {
  it('builds text from the reason code only', () => {
    expect(fallbackExplanation(baseRequest)).toBe('The room is free for the requested time.');
    expect(
      fallbackExplanation({ ...baseRequest, isAvailable: false, reasonCode: 'OVERLAP' }),
    ).toBe('The requested time overlaps an existing booking, so the room is not available.');
  });
});
