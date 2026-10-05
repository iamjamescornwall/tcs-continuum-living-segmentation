import { z } from 'zod';

export interface LLMGenerateParams<T = unknown> {
  task: 'AI-1' | 'AI-2' | 'AI-3' | 'AI-4' | 'AI-5';
  system: string;
  input: string | Record<string, unknown>;
  schema?: z.ZodType<T>;
}

export interface LLMResponse<T = unknown> {
  data: T;
  provider: string;
  fromCache: boolean;
}

export interface LLMProvider {
  name: string;
  generate<T = unknown>(params: LLMGenerateParams<T>): Promise<LLMResponse<T>>;
}
