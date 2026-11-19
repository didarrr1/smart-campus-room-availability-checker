import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { ExplainOutcome } from '@/explain/explainService';
import { explain } from '@/explain/explainService';
import type { ExplainAdapter } from '@/explain/mockAdapter';
import type { ExplainRequest } from '@/explain/contract';

interface ExplainBoxProps {
  request: ExplainRequest;
  adapter: ExplainAdapter;
}

export function ExplainBox({ request, adapter }: ExplainBoxProps) {
  const [question, setQuestion] = useState('');
  const [outcome, setOutcome] = useState<ExplainOutcome | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleExplain() {
    setLoading(true);
    try {
      const trimmed = question.trim();
      const result = await explain(
        trimmed.length > 0 ? { ...request, question: trimmed } : request,
        adapter,
      );
      setOutcome(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
      <label className="block">
        <span className="text-xs font-medium text-slate-600">Your question (optional)</span>
        <input
          type="text"
          value={question}
          maxLength={200}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
        />
      </label>
      <button
        type="button"
        onClick={handleExplain}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-600 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Sparkles size={16} />
        {loading ? 'Explaining…' : 'Explain availability'}
      </button>
      {outcome && 'error' in outcome && (
        <div className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3">
          <p className="text-sm text-red-700" role="alert">{outcome.error}</p>
        </div>
      )}
      {outcome && 'text' in outcome && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 rounded-lg border border-slate-300 bg-slate-50 p-3"
        >
          <p className="text-xs font-semibold text-slate-500">
            {outcome.source === 'mock'
              ? 'AI explanation (mock) — not a booking confirmation'
              : 'Standard explanation'}
          </p>
          <p className="text-sm text-slate-700 mt-1">{outcome.text}</p>
        </div>
      )}
    </div>
  );
}
