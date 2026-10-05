import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { aiService } from '../../services/aiService';
import { SupportedProvider } from '../../llm/llmConfig';
import { CheckCircle2, AlertCircle, Loader2, Key, Shield } from 'lucide-react';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = aiService.getConfig();

  const [provider, setProvider] = useState<SupportedProvider>(currentConfig.provider);
  const [model, setModel] = useState(currentConfig.model);
  const [baseUrl, setBaseUrl] = useState(currentConfig.baseUrl);
  const [temperature, setTemperature] = useState(currentConfig.temperature);
  const [timeoutMs, setTimeoutMs] = useState(currentConfig.timeoutMs);
  const [useProxy, setUseProxy] = useState(currentConfig.useProxy);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');

  const [testStatus, setTestStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
  }>({ loading: false });

  const handleProviderChange = (p: SupportedProvider) => {
    setProvider(p);
    if (p === 'mock') {
      setModel('mock-model');
      setBaseUrl('offline');
    } else if (p === 'openai') {
      setModel('gpt-4o-mini');
      setBaseUrl('https://api.openai.com/v1');
    } else if (p === 'anthropic') {
      setModel('claude-3-5-sonnet-20241022');
      setBaseUrl('https://api.anthropic.com/v1/messages');
    } else if (p === 'gemini') {
      setModel('gemini-1.5-flash');
      setBaseUrl('https://generativelanguage.googleapis.com');
    }
  };

  const handleTestConnection = async () => {
    setTestStatus({ loading: true });
    // Apply temporary session config for test
    aiService.setConfig({
      provider,
      model,
      baseUrl,
      temperature,
      timeoutMs,
      useProxy,
      apiKey: apiKey.trim() || undefined,
    });

    const result = await aiService.testConnection();
    setTestStatus({
      loading: false,
      success: result.success,
      message: result.message,
    });
  };

  const handleSave = () => {
    aiService.setConfig({
      provider,
      model,
      baseUrl,
      temperature,
      timeoutMs,
      useProxy,
      apiKey: apiKey.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Engine Configuration"
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs text-navy-900">
        <p className="text-slate-500">
          Continuum is fully LLM-agnostic. The default offline provider serves pre-generated synthetic
          responses from <code className="font-mono text-navy-700 bg-slate-100 px-1 py-0.5 rounded">ai_cache.json</code>.
          You can attach any live LLM model endpoint below.
        </p>

        {/* Provider selection */}
        <div>
          <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            LLM Provider Adapter
          </label>
          <select
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as SupportedProvider)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-medium text-navy-900 focus:outline-none focus:ring-1 focus:ring-teal-600"
          >
            <option value="mock">MockProvider (Default Offline · Zero SDKs)</option>
            <option value="openai">OpenAI-Compatible (OpenAI, Azure, Mistral, Groq, Ollama)</option>
            <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
            <option value="gemini">Google Gemini REST API</option>
          </select>
        </div>

        {/* Model and Base URL */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Model Identifier
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={provider === 'mock'}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Base URL / Host
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              disabled={provider === 'mock'}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Temperature and Timeout */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Temperature ({temperature})
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              disabled={provider === 'mock'}
              className="w-full accent-teal-600"
            />
          </div>
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Timeout (ms)
            </label>
            <input
              type="number"
              value={timeoutMs}
              onChange={(e) => setTimeoutMs(parseInt(e.target.value) || 6000)}
              step="500"
              min="1000"
              max="30000"
              disabled={provider === 'mock'}
              className="w-full px-3 py-1 bg-white border border-slate-300 rounded-md text-xs font-mono disabled:bg-slate-100 disabled:text-slate-400"
            />
          </div>
        </div>

        {/* Proxy toggle & Session API Key */}
        {provider !== 'mock' && (
          <div className="pt-2 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span className="font-semibold text-xs">Route through local LLM proxy</span>
              </div>
              <input
                type="checkbox"
                checked={useProxy}
                onChange={(e) => setUseProxy(e.target.checked)}
                className="rounded accent-teal-600"
              />
            </div>

            <div>
              <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Session API Key (Ephemeral)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="sk-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-600"
                />
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              </div>
              <p className="text-3xs text-amber-700 mt-1">
                Held in session memory only. Never persisted, stored, or bundled into application code.
              </p>
            </div>
          </div>
        )}

        {/* Test Connection Banner */}
        {testStatus.message && (
          <div
            className={`p-2.5 rounded-md border text-2xs flex items-start gap-2 ${
              testStatus.success
                ? 'bg-teal-50 border-teal-200 text-teal-900'
                : 'bg-red-50 border-red-200 text-red-900'
            }`}
          >
            {testStatus.success ? (
              <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="break-all">{testStatus.message}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testStatus.loading}
            className="px-3 py-1.5 bg-slate-100 text-navy-800 border border-slate-300 rounded-md text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {testStatus.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-white text-slate-600 border border-slate-300 rounded-md text-xs font-semibold hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 bg-navy-900 text-white rounded-md text-xs font-semibold hover:bg-navy-800 transition"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
