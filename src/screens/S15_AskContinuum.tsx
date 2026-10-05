import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Send,
  ArrowRight,
  Loader2,
  Table as TableIcon,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { AIBadge } from '../components/ui/AIBadge';
import aiService from '../services/aiService';
import { AI4Answer } from '../llm/schemas';

export const S15_AskContinuum: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ query: string; response: AI4Answer; timestamp: string }>
  >([
    {
      query: 'Which market has the oldest segments?',
      response: {
        answer:
          'Market C exhibits the oldest segments with a median age of 330 days. Over 81% of customer segment assignments in Market C exceed 180 days due to reliance on an annual vendor survey refresh.',
        table: [
          { Market: 'Market A (Data-rich)', 'Median Age': '70 days', 'Stale (>180d)': '12%' },
          { Market: 'Market B (Signal-enriched)', 'Median Age': '210 days', 'Stale (>180d)': '58%' },
          { Market: 'Market C (Survey-led)', 'Median Age': '330 days', 'Stale (>180d)': '81%' },
        ],
        link: '/health?tab=age',
      },
      timestamp: '10:14 AM',
    },
    {
      query: 'Why is Dr. Hanna Vogel (HCP-B-0001) proposed to move to Segment A?',
      response: {
        answer:
          'Dr. Hanna Vogel (Hero Prescriber, Market B) is proposed for promotion to Segment A with High Confidence (0.94). Grounded drivers include a +38% quarterly increase in Aurelix TRx volume, attendance at the regional Immunology symposium, and rep notes citing intentions to initiate 3 new biologic patients.',
        table: [
          { Driver: 'Aurelix TRx Momentum', Observed: '+38% QoQ', Direction: '▲ Upward' },
          { Driver: 'Regional Symposium', Observed: 'Attended Q3', Direction: '▲ Upward' },
          { Driver: 'Field Rep Note Quote', Observed: '3 new patients', Direction: '▲ Upward' },
        ],
        link: '/review-queue',
      },
      timestamp: '10:16 AM',
    },
  ]);

  const quickPrompts = [
    'Which market has the oldest segments?',
    'Why is Dr. Hanna Vogel (HCP-B-0001) proposed to move to Segment A?',
    'What accounts have had formulary wins for Zentrova?',
    'Where is the biggest opportunity gap for Aurelix?',
    'What is living segmentation worth?',
    'Why was HCP-A-0001 held for review?',
  ];

  const handleAsk = async (textToAsk?: string) => {
    const q = textToAsk || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await aiService.askContinuum(q.trim());
      setConversation((prev) => [
        ...prev,
        {
          query: q.trim(),
          response: res.data,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setQuery('');
    } catch (err) {
      console.error('Ask error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Ask Continuum"
        question="Grounding and natural language Q&A across living segmentation"
        actions={
          <div className="flex items-center gap-2">
            <AIBadge providerName="MockProvider (offline)" />
          </div>
        }
      />

      {/* Suggested Questions Grid */}
      <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wide">
          <HelpCircle className="w-4 h-4 text-teal-600" />
          <span>Suggested Grounded Questions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 transition-colors border border-slate-200 text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation Thread */}
      <div className="space-y-4">
        {conversation.map((item, idx) => (
          <div key={idx} className="space-y-3 animate-in fade-in duration-200">
            {/* User message */}
            <div className="flex justify-end">
              <div className="bg-navy-900 text-white rounded-2xl rounded-tr-xs px-4 py-2.5 max-w-xl text-xs shadow-2xs">
                {item.query}
              </div>
            </div>

            {/* AI Assistant response */}
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-5 max-w-2xl text-xs shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-teal-700">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Continuum Intelligence</span>
                  </div>
                  <span className="text-2xs text-slate-400 font-mono">{item.timestamp}</span>
                </div>

                <p className="text-slate-800 leading-relaxed text-body-sm">
                  {item.response.answer}
                </p>

                {/* Render Structured Table if present */}
                {item.response.table && item.response.table.length > 0 && (
                  <div className="border border-slate-200 rounded overflow-hidden">
                    <div className="bg-slate-50 px-3 py-1.5 text-2xs font-semibold text-slate-600 uppercase border-b border-slate-200 flex items-center gap-1">
                      <TableIcon className="w-3 h-3 text-slate-400" />
                      <span>Grounded Data Slice</span>
                    </div>
                    <table className="w-full text-left text-xs divide-y divide-slate-100">
                      <thead className="bg-slate-50/50">
                        <tr>
                          {Object.keys(item.response.table[0]).map((key) => (
                            <th key={key} className="px-3 py-1.5 font-semibold text-slate-600">
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {item.response.table.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50">
                            {Object.values(row).map((val: any, vIdx) => (
                              <td key={vIdx} className="px-3 py-1.5 text-slate-700 font-mono text-2xs">
                                {val}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Deep Link to Relevant Screen */}
                {item.response.link && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => navigate(item.response.link!)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                    >
                      <span>Open in Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Query Input Bar */}
      <div className="sticky bottom-6 bg-white border border-slate-200 rounded-xl p-3 shadow-lg flex items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask Continuum about segments, change events, data readiness, or value..."
          className="flex-1 text-body-sm px-3 py-2 border-0 focus:ring-0 focus:outline-hidden text-navy-900 placeholder:text-slate-400"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !query.trim()}
          className={`p-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors shadow-2xs ${
            loading || !query.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default S15_AskContinuum;
