export type SupportedProvider = 'mock' | 'openai' | 'anthropic' | 'gemini';

export interface LLMConfig {
  provider: SupportedProvider;
  model: string;
  baseUrl: string;
  temperature: number;
  timeoutMs: number;
  useProxy: boolean;
  apiKey?: string;
}

export const defaultLLMConfig: LLMConfig = {
  provider: 'mock',
  model: 'mock-model',
  baseUrl: 'http://localhost:3001/api/llm',
  temperature: 0.2,
  timeoutMs: 6000,
  useProxy: false,
};
