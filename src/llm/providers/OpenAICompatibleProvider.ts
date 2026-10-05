import { LLMProvider, LLMGenerateParams, LLMResponse } from '../LLMProvider';
import { LLMConfig } from '../llmConfig';

export class OpenAICompatibleProvider implements LLMProvider {
  name = 'OpenAI-Compatible';
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.name = `OpenAI-Compatible (${config.model})`;
  }

  async generate<T = unknown>(params: LLMGenerateParams<T>): Promise<LLMResponse<T>> {
    const { system, input, schema } = params;
    const timeout = this.config.timeoutMs || 6000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const endpoint = this.config.baseUrl.endsWith('/chat/completions')
      ? this.config.baseUrl
      : `${this.config.baseUrl.replace(/\/+$/, '')}/chat/completions`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
      }

      const inputContent =
        typeof input === 'string' ? input : JSON.stringify(input, null, 2);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: this.config.model,
          temperature: this.config.temperature ?? 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `${system}\nIMPORTANT: You must return valid JSON only.` },
            { role: 'user', content: inputContent },
          ],
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${endpoint}: ${response.statusText}`);
      }

      const json = await response.json();
      const rawText = json?.choices?.[0]?.message?.content || '{}';
      const parsedData = JSON.parse(rawText);

      let validatedData = parsedData;
      if (schema) {
        const result = schema.safeParse(parsedData);
        if (result.success) {
          validatedData = result.data;
        } else {
          console.warn('[OpenAICompatibleProvider] Schema validation warning:', result.error);
        }
      }

      return {
        data: validatedData as T,
        provider: this.name,
        fromCache: false,
      };
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[OpenAICompatibleProvider] Call failed (${err.message}), triggering cache fallback.`);
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

export default OpenAICompatibleProvider;
