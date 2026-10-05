import { z } from 'zod';

// AI-1: Vendor column and value mapping
export const AI1ColumnMappingSchema = z.object({
  source_column: z.string(),
  global_field: z.string(),
  confidence: z.enum(['High', 'Medium', 'Low']),
});

export const AI1OutputSchema = z.object({
  column_mappings: z.array(AI1ColumnMappingSchema),
  value_maps: z.record(z.string(), z.record(z.string(), z.string())),
  confidence: z.object({
    overall: z.enum(['High', 'Medium', 'Low']),
    match_rate: z.number(),
    conformance: z.number(),
  }),
});

export type AI1Output = z.infer<typeof AI1OutputSchema>;

// AI-2: Cluster naming & description
export const AI2ClusterSchema = z.object({
  cluster_id: z.string(),
  name: z.string(),
  description: z.string(),
  global_value: z.string(),
});

export const AI2OutputSchema = z.array(AI2ClusterSchema);
export type AI2Output = z.infer<typeof AI2OutputSchema>;

// AI-3: Explanation card
export const AI3DriverSchema = z.object({
  label: z.string(),
  value: z.string(),
  direction: z.enum(['Up', 'Down', 'None']).optional(),
  source_category: z.string(),
  data_age_days: z.number(),
});

export const AI3ExplanationSchema = z.object({
  headline: z.string(),
  drivers: z.array(AI3DriverSchema),
  confidence: z.enum(['High', 'Medium', 'Low']),
  data_age: z.string(),
  what_would_move_next: z.string(),
});

export type AI3Explanation = z.infer<typeof AI3ExplanationSchema>;

// AI-4: Ask Continuum Q&A
export const AI4AnswerSchema = z.object({
  answer: z.string(),
  table: z.array(z.record(z.string(), z.unknown())).optional(),
  link: z.string().optional(),
});

export type AI4Answer = z.infer<typeof AI4AnswerSchema>;

// AI-5: Rep-note signal extraction
export const AI5SignalSchema = z.object({
  dimension_code: z.string(),
  direction: z.enum(['Up', 'Down', 'None']),
  proposed_value: z.string(),
  evidence_quote: z.string(),
  confidence: z.enum(['High', 'Medium', 'Low']),
});

export const AI5NoteExtractionSchema = z.object({
  signals: z.array(AI5SignalSchema),
});

export type AI5NoteExtraction = z.infer<typeof AI5NoteExtractionSchema>;
