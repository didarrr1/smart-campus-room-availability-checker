import {
  fallbackExplanation,
  validateExplainRequest,
  type ExplainRequest,
  type Explanation,
} from './contract';
import { SYSTEM_INSTRUCTION } from './prompt';

export interface MockAdapterOptions {
  delayMs?: number;
  failWith?: Error;
}

export interface ExplainAdapter {
  (request: ExplainRequest, question: string | undefined): Promise<Explanation>;
}

export function createMockAdapter(options: MockAdapterOptions = {}): ExplainAdapter {
  return async (request, question) => {
    if (options.failWith) {
      throw options.failWith;
    }
    if (options.delayMs && options.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, options.delayMs));
    }
    const validation = validateExplainRequest(request);
    if (!validation.ok) {
      throw new Error(`Invalid explain request: ${validation.error}`);
    }
    // The question is untrusted data: it is validated-length-checked by the
    // contract but never copied into the output or followed.
    void question;
    return {
      text: fallbackExplanation(request),
      source: 'mock',
    };
  };
}

export { SYSTEM_INSTRUCTION };
