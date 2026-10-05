import { LLMProvider, LLMGenerateParams, LLMResponse } from '../LLMProvider';
import aiCacheData from '../../../data/ai_cache.json';

const aiCache = aiCacheData as Record<string, any>;

export class MockProvider implements LLMProvider {
  name = 'MockProvider';

  async generate<T = unknown>(params: LLMGenerateParams<T>): Promise<LLMResponse<T>> {
    const { task, input, schema } = params;
    const taskCache = aiCache[task] || {};

    let resultData: any = null;

    if (task === 'AI-1') {
      // Vendor file column and value mapping
      resultData = taskCache['vendor_mkt_c_v1'] || Object.values(taskCache)[0];
    } else if (task === 'AI-2') {
      // Cluster naming & description
      const key = typeof input === 'string' ? input : (input as any)?.version_id || 'VER-0001';
      resultData = taskCache[key] || taskCache['VER-0001'] || Object.values(taskCache)[0];
    } else if (task === 'AI-3') {
      // Explanation card for proposal
      const proposalId = typeof input === 'string' ? input : (input as any)?.proposal_id || 'PRP-000001';
      resultData = taskCache[proposalId] || taskCache['PRP-000001'] || Object.values(taskCache)[0];
    } else if (task === 'AI-4') {
      // Ask Continuum Q&A
      const queryStr = typeof input === 'string' ? input : (input as any)?.query || '';
      const queryLower = queryStr.toLowerCase();

      // Find best match in AI-4 cache
      const matchedKey = Object.keys(taskCache).find(
        (q) => queryLower.includes(q.toLowerCase()) || q.toLowerCase().includes(queryLower)
      );

      if (matchedKey) {
        resultData = taskCache[matchedKey];
      } else {
        // Fallback Q&A response
        resultData = {
          answer: `Continuum monitors live market signals across data sources to propose governed customer changes. For "${queryStr}", please refer to the Executive Cockpit or Segment Insights.`,
          table: undefined,
          link: '/cockpit',
        };
      }
    } else if (task === 'AI-5') {
      // Rep-note signal extraction
      const noteId = typeof input === 'string' && input.startsWith('NOTE-') ? input : (input as any)?.note_id;
      if (noteId && taskCache[noteId]) {
        resultData = taskCache[noteId];
      } else {
        // Check hero Tomás Ferreira note
        resultData = taskCache['NOTE-000001'] || {
          signals: [
            {
              dimension_code: 'ADOPTION',
              direction: 'Up',
              proposed_value: 'Expansion',
              evidence_quote: 'started 4 new patients and requested patient support materials',
              confidence: 'High',
            },
            {
              dimension_code: 'DIGITAL',
              direction: 'Up',
              proposed_value: 'Savvy',
              evidence_quote: 'Prefers to receive updates through the portal',
              confidence: 'Medium',
            },
          ],
        };
      }
    }

    // Optional validation with schema
    if (schema) {
      const parsed = schema.safeParse(resultData);
      if (parsed.success) {
        resultData = parsed.data;
      }
    }

    return {
      data: resultData as T,
      provider: this.name,
      fromCache: true,
    };
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'MockProvider ready: 35 offline cached AI tasks loaded from ai_cache.json.',
    };
  }
}

export default MockProvider;
