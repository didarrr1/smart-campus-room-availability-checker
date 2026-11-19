import {
  fallbackExplanation,
  validateExplainRequest,
  validateExplanation,
  type ExplainRequest,
  type Explanation,
} from './contract';
import type { ExplainAdapter } from './mockAdapter';

const TIMEOUT_MS = 2000;

export type ExplainOutcome =
  | { text: string; source: Explanation['source'] }
  | { source: 'rejected'; error: string };

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));
}

export async function explain(
  request: ExplainRequest,
  adapter: ExplainAdapter | undefined,
): Promise<ExplainOutcome> {
  const inputValidation = validateExplainRequest(request);
  if (!inputValidation.ok) {
    return { source: 'rejected', error: inputValidation.error };
  }
  if (adapter === undefined) {
    return { text: fallbackExplanation(request), source: 'fallback' };
  }
  try {
    const outcome = await Promise.race([adapter(request, request.question), timeout(TIMEOUT_MS)]);
    if (
      !outcome ||
      typeof outcome.text !== 'string' ||
      !['mock', 'fallback'].includes(outcome.source)
    ) {
      return { text: fallbackExplanation(request), source: 'fallback' };
    }
    const outputValidation = validateExplanation(outcome.text, request.isAvailable);
    if (!outputValidation.ok) {
      return { text: fallbackExplanation(request), source: 'fallback' };
    }
    return { text: outcome.text.trim(), source: outcome.source };
  } catch {
    return { text: fallbackExplanation(request), source: 'fallback' };
  }
}

export { TIMEOUT_MS };
