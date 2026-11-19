import { describe, expect, it } from 'vitest';
import { parseInterval } from '@/domain/time';

describe('parseInterval', () => {
  it('parses a valid start and end into minutes from midnight', () => {
    expect(parseInterval('09:30', '10:45')).toEqual({ start: 570, end: 645 });
  });

  it('returns null for an invalid start and keeps a valid end', () => {
    expect(parseInterval('9:30', '10:45')).toEqual({ start: null, end: 645 });
  });

  it('returns null for an invalid end and keeps a valid start', () => {
    expect(parseInterval('09:30', '25:00')).toEqual({ start: 570, end: null });
  });

  it('returns nulls for two invalid values', () => {
    expect(parseInterval('', 'noon')).toEqual({ start: null, end: null });
  });
});
