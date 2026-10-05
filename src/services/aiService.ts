import { LLMProvider, LLMResponse } from '../llm/LLMProvider';
import { LLMConfig, defaultLLMConfig } from '../llm/llmConfig';
import MockProvider from '../llm/providers/MockProvider';
import OpenAICompatibleProvider from '../llm/providers/OpenAICompatibleProvider';
import AnthropicProvider from '../llm/providers/AnthropicProvider';
import GeminiProvider from '../llm/providers/GeminiProvider';
import {
  AI1OutputSchema,
  AI1Output,
  AI2OutputSchema,
  AI2Output,
  AI3ExplanationSchema,
  AI3Explanation,
  AI4AnswerSchema,
  AI4Answer,
  AI5NoteExtractionSchema,
  AI5NoteExtraction,
} from '../llm/schemas';

class AIService {
  private currentConfig: LLMConfig = { ...defaultLLMConfig };
  private activeProvider: LLMProvider;
  private mockFallback: MockProvider;

  constructor() {
    this.mockFallback = new MockProvider();
    this.activeProvider = this.instantiateProvider(this.currentConfig);
  }

  private instantiateProvider(config: LLMConfig): LLMProvider {
    switch (config.provider) {
      case 'openai':
        return new OpenAICompatibleProvider(config);
      case 'anthropic':
        return new AnthropicProvider(config);
      case 'gemini':
        return new GeminiProvider(config);
      case 'mock':
      default:
        return this.mockFallback;
    }
  }

  public getConfig(): LLMConfig {
    return { ...this.currentConfig };
  }

  public setConfig(newConfig: Partial<LLMConfig>): void {
    this.currentConfig = { ...this.currentConfig, ...newConfig };
    this.activeProvider = this.instantiateProvider(this.currentConfig);
  }

  public async testConnection(): Promise<{ success: boolean; message: string }> {
    if (this.activeProvider === this.mockFallback) {
      return this.mockFallback.testConnection();
    }
    try {
      if ('testConnection' in this.activeProvider && typeof (this.activeProvider as any).testConnection === 'function') {
        return await (this.activeProvider as any).testConnection();
      }
      return { success: true, message: `Connected to ${this.activeProvider.name}` };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  }

  /**
   * AI-1: Vendor column and value mapping for S05 Data Intake
   */
  public async mapVendorColumns(input: unknown = 'vendor_mkt_c_v1'): Promise<LLMResponse<AI1Output>> {
    const system = `You are a life sciences commercial data harmonization agent.
Map vendor column headers and proprietary classification values into Continuum global standard dimensions.
Return strictly valid JSON conforming to the schema. No promotional language.`;

    try {
      return await this.activeProvider.generate<AI1Output>({
        task: 'AI-1',
        system,
        input: typeof input === 'string' ? input : (input as any),
        schema: AI1OutputSchema,
      });
    } catch (error) {
      console.warn('[aiService] Fallback to cached response for AI-1:', error);
      return await this.mockFallback.generate<AI1Output>({
        task: 'AI-1',
        system,
        input: 'vendor_mkt_c_v1',
        schema: AI1OutputSchema,
      });
    }
  }

  /**
   * AI-2: Cluster naming and description for S06 Segmentation Studio
   */
  public async nameClusters(
    versionId: string,
    clusterData: unknown
  ): Promise<LLMResponse<AI2Output>> {
    const system = `You are an enterprise commercial segmentation analyst.
Examine cluster centroid stats, box stats, and feature importance to synthesize clinical, factual cluster names, descriptions, and global standard value mappings (Segment A-E).
Ground explanations strictly in feature drivers without promotional phrasing. Return valid JSON only.`;

    try {
      return await this.activeProvider.generate<AI2Output>({
        task: 'AI-2',
        system,
        input: { version_id: versionId, clusters: clusterData },
        schema: AI2OutputSchema,
      });
    } catch (error) {
      console.warn('[aiService] Fallback to cached response for AI-2:', error);
      return await this.mockFallback.generate<AI2Output>({
        task: 'AI-2',
        system,
        input: versionId,
        schema: AI2OutputSchema,
      });
    }
  }

  /**
   * AI-3: Explanation card generation for S10 Review Queue & D01 Customer 360
   */
  public async explainProposal(
    proposalId: string,
    proposalContext?: unknown
  ): Promise<LLMResponse<AI3Explanation>> {
    const system = `You are an AI explanation engine for commercial life sciences segmentation.
Synthesize the primary drivers for a proposed customer segment change into a clear headline, key driver points, confidence level, data age, and next expected movement.
Use factual wording only. No promotional claims. Return valid JSON only.`;

    try {
      return await this.activeProvider.generate<AI3Explanation>({
        task: 'AI-3',
        system,
        input: (proposalContext as Record<string, unknown>) || proposalId,
        schema: AI3ExplanationSchema,
      });
    } catch (error) {
      console.warn(`[aiService] Fallback to cached response for AI-3 (${proposalId}):`, error);
      return await this.mockFallback.generate<AI3Explanation>({
        task: 'AI-3',
        system,
        input: proposalId,
        schema: AI3ExplanationSchema,
      });
    }
  }

  /**
   * AI-4: Ask Continuum conversational assistant (S15)
   */
  public async askContinuum(query: string): Promise<LLMResponse<AI4Answer>> {
    const system = `You are Ask Continuum, the governed commercial intelligence assistant.
Provide concise, factually grounded answers regarding customer segments, market data readiness, governance rules, and value metrics.
Where helpful, include structured comparison table data and deep-link screen routes. Return valid JSON only.`;

    try {
      return await this.activeProvider.generate<AI4Answer>({
        task: 'AI-4',
        system,
        input: { query },
        schema: AI4AnswerSchema,
      });
    } catch (error) {
      console.warn(`[aiService] Fallback to cached response for AI-4:`, error);
      return await this.mockFallback.generate<AI4Answer>({
        task: 'AI-4',
        system,
        input: query,
        schema: AI4AnswerSchema,
      });
    }
  }

  /**
   * AI-5: Rep-note signal extraction for S09 Signal Feed & D01 Customer 360
   */
  public async extractRepNote(
    noteText: string,
    noteId?: string
  ): Promise<LLMResponse<AI5NoteExtraction>> {
    const system = `You are a commercial signal extraction engine.
Parse unstructured field sales representative notes to extract objective segment-relevant signals (ADOPTION stage, DIGITAL affinity, CHANNEL preference).
Extract verbatim quote evidence, indicate direction (Up/Down/None), and assign confidence (High/Medium/Low). Return valid JSON only.`;

    try {
      return await this.activeProvider.generate<AI5NoteExtraction>({
        task: 'AI-5',
        system,
        input: { note_id: noteId, text: noteText },
        schema: AI5NoteExtractionSchema,
      });
    } catch (error) {
      console.warn(`[aiService] Fallback to cached response for AI-5 (${noteId || 'custom'}):`, error);
      return await this.mockFallback.generate<AI5NoteExtraction>({
        task: 'AI-5',
        system,
        input: noteId || noteText,
        schema: AI5NoteExtractionSchema,
      });
    }
  }
}

export const aiService = new AIService();
export default aiService;
