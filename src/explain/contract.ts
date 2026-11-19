import type { CheckResult, Room } from '@/types';

export type ReasonCode =
  | 'AVAILABLE'
  | 'OVERLAP'
  | 'BLOCKED'
  | 'PAST_TIME'
  | 'INVALID_TIME'
  | 'TOO_LONG'
  | 'UNKNOWN_ROOM';

export interface ExplainRequest {
  roomLabel: string;
  start: string;
  end: string;
  isAvailable: boolean;
  reasonCode: ReasonCode;
  question?: string;
}

export type ExplanationSource = 'mock' | 'fallback';

export interface Explanation {
  text: string;
  source: ExplanationSource;
}

export type ValidateResult = { ok: true } | { ok: false; error: string };

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
export const MAX_LABEL_LENGTH = 60;
export const MAX_QUESTION_LENGTH = 200;
export const MAX_EXPLANATION_LENGTH = 300;

const REASON_CODE_MESSAGES: Record<ReasonCode, string> = {
  AVAILABLE: 'The room is free for the requested time.',
  OVERLAP: 'The requested time overlaps an existing booking, so the room is not available.',
  BLOCKED: 'The room is currently blocked and cannot be booked.',
  PAST_TIME: 'The start time is not after the current time, so the request is not available.',
  INVALID_TIME: 'The requested times are not valid, so the room cannot be checked.',
  TOO_LONG: 'The requested booking is longer than the maximum duration, so it is not available.',
  UNKNOWN_ROOM: 'The selected room does not exist, so availability cannot be confirmed.',
};

export function toExplainRequest(
  room: Room,
  startStr: string,
  endStr: string,
  result: CheckResult,
): ExplainRequest {
  return {
    roomLabel: room.name,
    start: startStr,
    end: endStr,
    isAvailable: result.decision === 'available',
    reasonCode: mapReasonCode(room, result),
  };
}

function mapReasonCode(room: Room, result: CheckResult): ReasonCode {
  if (result.decision === 'available') return 'AVAILABLE';
  if (result.reasons.some((r) => r.includes('does not exist'))) return 'UNKNOWN_ROOM';
  if (result.reasons.some((r) => r.includes('currently blocked'))) return 'BLOCKED';
  if (result.reasons.some((r) => r.includes('Overlaps an existing booking'))) return 'OVERLAP';
  if (result.reasons.some((r) => r.includes('longer than'))) return 'TOO_LONG';
  if (result.reasons.some((r) => r.includes('after the current time'))) return 'PAST_TIME';
  if (result.reasons.some((r) => r.includes('time is outside') || r.includes('earlier than end')))
    return 'INVALID_TIME';
  return 'INVALID_TIME';
}

export function validateExplainRequest(req: ExplainRequest): ValidateResult {
  if (req.roomLabel.length === 0 || req.roomLabel.length > MAX_LABEL_LENGTH) {
    return { ok: false, error: 'Room label must be between 1 and 60 characters.' };
  }
  if (!TIME_PATTERN.test(req.start) || !TIME_PATTERN.test(req.end)) {
    return { ok: false, error: 'Times must be in HH:MM format.' };
  }
  if (!(req.reasonCode in REASON_CODE_MESSAGES)) {
    return { ok: false, error: 'Unknown reason code.' };
  }
  if (req.question !== undefined && req.question.length > MAX_QUESTION_LENGTH) {
    return { ok: false, error: 'Question must be at most 200 characters.' };
  }
  return { ok: true };
}

export function validateExplanation(text: string, isAvailable: boolean): ValidateResult {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: 'Explanation must not be empty.' };
  }
  if (trimmed.length > MAX_EXPLANATION_LENGTH) {
    return { ok: false, error: 'Explanation must be at most 300 characters.' };
  }
  const sentences = trimmed.split(/[.!?]+/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (sentences.length > 2) {
    return { ok: false, error: 'Explanation must be at most 2 sentences.' };
  }
  const lower = trimmed.toLowerCase();
  if (isAvailable) {
    if (/unavailable|not available|cannot be booked|is booked/.test(lower)) {
      return { ok: false, error: 'Explanation contradicts the available decision.' };
    }
  } else if (lower.replace(/not available|unavailable/g, '').includes('available')) {
    return { ok: false, error: 'Explanation contradicts the unavailable decision.' };
  }
  return { ok: true };
}

export function fallbackExplanation(request: ExplainRequest): string {
  return REASON_CODE_MESSAGES[request.reasonCode];
}
