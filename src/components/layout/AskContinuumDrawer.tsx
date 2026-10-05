import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Drawer from '../ui/Drawer';
import { aiService } from '../../services/aiService';
import { AI4Answer } from '../../llm/schemas';
import { Sparkles, Send, ArrowRight, Loader2 } from 'lucide-react';
import AIBadge from '../ui/AIBadge';

export const AskContinuumDrawer: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ query: string; response: AI4Answer; timestamp: string }>
  >([
    {
      query: 'Which market has the oldest segments?',
      response: {
        answer:
          'Market C has the oldest segments with a median age of 330 days, where 81% of customer segment assignments are older than 180 days due to reliance on an annual agency spreadsheet refresh.',
        table: [
          { Market: 'Market A', 'Median Age': '70 days', 'Stale (>180d)': '12%' },
          { Market: 'Market B', 'Median Age': '210 days', 'Stale (>180d)': '58%' },
          { Market: 'Market C', 'Median Age': '330 days', 'Stale (>180d)': '81%' },
        ],
        link: '/health',
      },
      timestamp: '10:14 AM',
    },
  ]);

  const quickPrompts = [
    'Which market has the oldest segments?',
    'Why is Dr. Hanna Vogel proposed to move to Segment A?',
    'Where is the biggest opportunity gap for Aurelix?',
    'What is living segmentation worth?',
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
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-navy-900 text-white hover:bg-navy-800 border border-teal-500/50 shadow-lg rounded-full px-4 py-2.5 flex items-center gap-2 text-xs font-semibold transition-all transform hover:scale-105"
        title="Ask Continuum commercial AI assistant"
      >
        <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
        <span>Ask Continuum</span>
      </button>

      {/* Slide-over Drawer */}
      <Drawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Ask Continuum"
        subtitle="Governed commercial segmentation intelligence"
        width="max-w-lg"
      >
        <div className="flex flex-col h-[calc(100vh-8rem)] justify-between text-xs">
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-2xs text-slate-400 font-medium">Session Q&A</span>
              <AIBadge providerName="MockProvider" size="sm" />
            </div>

            {conversation.map((entry, idx) => (
              <div key={idx} className="space-y-2">
                {/* User Prompt Bubble */}
                <div className="flex justify-end">
                  <div className="bg-slate-100 text-navy-900 rounded-lg px-3 py-2 max-w-[85%] font-medium">
                    {entry.query}
                  </div>
                </div>

                {/* Assistant Response Bubble */}
                <div className="flex justify-start">
                  <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 max-w-[95%] space-y-2 text-navy-950">
                    <p className="leading-relaxed">{entry.response.answer}</p>

                    {/* Table if present */}
                    {entry.response.table && entry.response.table.length > 0 && (
                      <div className="overflow-x-auto rounded border border-slate-200 bg-white">
                        <table className="w-full text-2xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                              {Object.keys(entry.response.table[0]).map((k) => (
                                <th key={k} className="p-1.5 text-left font-semibold text-slate-600">
                                  {k}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {entry.response.table.map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-slate-100 last:border-0">
                                {Object.values(row).map((v, cIdx) => (
                                  <td key={cIdx} className="p-1.5 font-mono text-slate-800">
                                    {String(v)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Deep-link action button */}
                    {entry.response.link && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            navigate(entry.response.link!);
                          }}
                          className="inline-flex items-center gap-1 text-2xs font-semibold text-teal-700 hover:text-teal-900 bg-white px-2 py-1 rounded border border-teal-200 hover:border-teal-400 transition"
                        >
                          <span>Open related screen: {entry.response.link}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-500 text-2xs italic py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                <span>Continuum is evaluating grounded drivers...</span>
              </div>
            )}
          </div>

          {/* Bottom Prompt Bar & Suggestions */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleAsk(p)}
                  className="text-3xs text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full transition"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Ask about segment drift, data quality, value..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-md text-xs text-navy-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
              />
              <button
                type="button"
                onClick={() => handleAsk()}
                disabled={loading || !query.trim()}
                className="p-2 bg-navy-900 text-white rounded-md hover:bg-navy-800 disabled:opacity-40 transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default AskContinuumDrawer;
