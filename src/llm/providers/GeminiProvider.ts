import { LLMProvider, LLMGenerateParams, LLMResponse } from '../LLMProvider';
import { LLMConfig } from '../llmConfig';

export class GeminiProvider implements LLMProvider {
  name = 'Gemini';
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.name = `Gemini (${config.model || 'gemini-1.5-flash'})`;
  }

  async generate<T = unknown>(params: LLMGenerateParams<T>): Promise<LLMResponse<T>> {
    const { system, input, schema } = params;
    const timeout = this.config.timeoutMs || 6000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const modelName = this.config.model || 'gemini-1.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.config.apiKey || ''}`;

    try {
      const inputContent =
        typeof input === 'string' ? input : JSON.stringify(input, null, 2);

      const promptText = `SYSTEM INSTRUCTION:\n${system}\n\nINPUT DATA:\n${inputContent}\n\nIMPORTANT: Return valid JSON matching the schema only. No markdown fences.`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: {
            temperature: this.config.temperature ?? 0.2,
            responseMimeType: 'application/json',
          },
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from Gemini REST: ${response.statusText}`);
      }

      const json = await response.json();
      const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsedData = JSON.parse(rawText);

      let validatedData = parsedData;
      if (schema) {
        const result = schema.safeParse(parsedData);
        if (result.success) {
          validatedData = result.data;
        } else {
          console.warn('[GeminiProvider] Schema validation warning:', result.error);
        }
      }

      return {
        data: validatedData as T,
        provider: this.name,
        fromCache: false,
      };
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[GeminiProvider] Call failed (${err.message}), triggering cache fallback.`);
      throw err;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await this.generate({
        task: 'AI-4',
        system: 'Return valid JSON: {"status": "ok"}',
        input: 'Ping',
      });
      return {
        success: true,
        message: `Connected successfully to ${this.name}. Response: ${JSON.stringify(res.data)}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Connection failed: ${err.message}`,
      };
    }
  }
}

export default GeminiProvider;
