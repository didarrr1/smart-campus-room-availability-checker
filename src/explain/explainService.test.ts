import { describe, expect, it } from 'vitest';
import { explain } from './explainService';
import type { ExplainRequest } from './contract';

const request: ExplainRequest = {
  roomLabel: 'Lecture Hall A',
  start: '09:30',
  end: '10:30',
  isAvailable: false,
  reasonCode: 'OVERLAP',
};

describe('explain', () => {
  it('returns the mock explanation for a valid request', async () => {
    const outcome = await explain(request, async () => ({
      text: 'The requested time overlaps an existing booking, so the room is not available.',
      source: 'mock',
    }));
    expect(outcome.source).toBe('mock');
  });

  it('falls back when the adapter is missing', async () => {
    const outcome = await explain(request, undefined);
    expect(outcome.source).toBe('fallback');
    if (outcome.source !== 'rejected') {
      expect(outcome.text).toBe(
        'The requested time overlaps an existing booking, so the room is not available.',
      );
    }
  });

  it('falls back after the 2000 ms timeout', async () => {
    const outcome = await explain(request, () => new Promise(() => undefined));
    expect(outcome.source).toBe('fallback');
  });

  it('falls back when the adapter throws', async () => {
    const outcome = await explain(request, async () => {
      throw new Error('boom');
    });
    expect(outcome.source).toBe('fallback');
  });

  it('falls back on invalid output', async () => {
    const outcome = await explain(request, async () => ({
      text: 'One. Two. Three.',
      source: 'mock',
    }));
    expect(outcome.source).toBe('fallback');
  });

  it('rejects invalid input with the validation error instead of falling back', async () => {
    const outcome = await explain({ ...request, roomLabel: '' }, async () => ({
      text: 'Fine.',
      source: 'mock',
    }));
    expect(outcome.source).toBe('rejected');
    expect(outcome).toEqual({ source: 'rejected', error: 'Room label must be between 1 and 60 characters.' });
  });

  it('rejects invalid input with the validation error and no text', async () => {
    const outcome = await explain({ ...request, question: 'x'.repeat(201) }, async () => ({
      text: 'Fine.',
      source: 'mock',
    }));
    expect(outcome).toEqual({ source: 'rejected', error: 'Question must be at most 200 characters.' });
  });

  it('returns the mock source with a short question present', async () => {
    const outcome = await explain({ ...request, question: 'Can I use it for a club meeting?' }, async () => ({
      text: 'The room is not available.',
      source: 'mock',
    }));
    expect(outcome.source).toBe('mock');
  });
});
