export interface FeatureFlags {
  enableAiProxy: boolean;
  enableLiveLlm: boolean;
  enableGuidedDemo: boolean;
  enableExport: boolean;
}

export interface AppConfig {
  appName: string;
  tagline: string;
  positioningLine: string;
  definition: string;
  demoToday: string; // ISO date 'YYYY-MM-DD'
  features: FeatureFlags;
}

export const appConfig: AppConfig = {
  appName: 'Continuum',
  tagline: 'Governed, living segmentation across every market.',
  positioningLine: 'Analyst workbenches build segments. Continuum runs segmentation as a governed global process — every market, every data reality, from studio to CRM.',
  definition: 'Living segmentation is the governed capability to detect, explain, approve and operationalise material changes in customer segment attributes between formal planning cycles. It is not constant automated re-clustering.',
  demoToday: '2026-10-15',
  features: {
    enableAiProxy: false,
    enableLiveLlm: false,
    enableGuidedDemo: true,
    enableExport: true,
  },
};
