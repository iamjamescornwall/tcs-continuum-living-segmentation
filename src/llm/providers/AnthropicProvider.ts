import { LLMProvider, LLMGenerateParams, LLMResponse } from '../LLMProvider';
import { LLMConfig } from '../llmConfig';

export class AnthropicProvider implements LLMProvider {
  name = 'Anthropic';
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
    this.name = `Anthropic (${config.model || 'Claude'})`;
  }

  async generate<T = unknown>(params: LLMGenerateParams<T>): Promise<LLMResponse<T>> {
    const { system, input, schema } = params;
    const timeout = this.config.timeoutMs || 6000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    const endpoint = this.config.baseUrl.includes('/v1/messages')
      ? this.config.baseUrl
      : 'https://api.anthropic.com/v1/messages';

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      };
      if (this.config.apiKey) {
        headers['x-api-key'] = this.config.apiKey;
      }

      const inputContent =
        typeof input === 'string' ? input : JSON.stringify(input, null, 2);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          model: this.config.model || 'claude-3-5-sonnet-20241022',
          max_tokens: 2048,
          temperature: this.config.temperature ?? 0.2,
          system: `${system}\nIMPORTANT: You must return valid JSON only. Do not enclose in markdown blocks or backticks.`,
          messages: [{ role: 'user', content: inputContent }],
        }),
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status} from ${endpoint}: ${response.statusText}`);
      }

      const json = await response.json();
      const rawText = json?.content?.[0]?.text || '{}';
      const cleanedText = rawText.replace(/^```json/g, '').replace(/```$/g, '').trim();
      const parsedData = JSON.parse(cleanedText);

      let validatedData = parsedData;
      if (schema) {
        const result = schema.safeParse(parsedData);
        if (result.success) {
          validatedData = result.data;
        } else {
          console.warn('[AnthropicProvider] Schema validation warning:', result.error);
        }
      }

      return {
        data: validatedData as T,
        provider: this.name,
        fromCache: false,
      };
    } catch (err: any) {
      clearTimeout(timer);
      console.warn(`[AnthropicProvider] Call failed (${err.message}), triggering cache fallback.`);
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

export default AnthropicProvider;
