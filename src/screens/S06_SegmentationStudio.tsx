import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Play,
  Save,
  AlertTriangle,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StepIndicator, StepItem } from '../components/ui/StepIndicator';
import { AIBadge } from '../components/ui/AIBadge';
import { BoxPlot, BoxPlotItem } from '../components/charts/BoxPlot';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import aiService from '../services/aiService';
import { MarketCode, BrandCode, CustomerType, StudioMethod } from '../types';

type BuildMethod = 'KMEANS_RULES' | 'RULES_DECILE_CLUSTERS' | 'RULES_TEMPLATE';

interface ReviewGroup {
  key: string;
  label: string;
  defaultName: string;
  defaultSegment: string;
  share: number;
  box: [number, number, number, number, number];
  color: string;
}

interface ReviewProfile {
  unitLabel: string;
  aiNamed: boolean;
  chartTitle: string;
  soWhat: string;
  yAxisLabel: string;
  groups: ReviewGroup[];
}

const GROUP_COLORS = ['#8A6D1F', '#E9B44C', '#5B6ABF', '#3CA5AE', '#0E7C86'];

// Review-step output per build method. Each method only plots inputs its market actually has:
// Market C (rules template) has no HCP-level sales, so it is scored on rep assessment + PMR only.
const REVIEW_PROFILES: Record<BuildMethod, ReviewProfile> = {
  KMEANS_RULES: {
    unitLabel: 'Cluster',
    aiNamed: true,
    chartTitle: 'Cluster Feature Distribution: Prescribing Volume & Momentum',
    soWhat: 'Cluster 4 captures hyper-responsive growth prescribers with median volume 2.4x higher than standard baseline.',
    yAxisLabel: 'Prescription Index (NBRx Momentum)',
    groups: [
      { key: 'cluster_0', label: 'Cluster 0', defaultName: 'Low Prescribing / Traditional', defaultSegment: 'E', share: 0.2, box: [10, 18, 24, 32, 45], color: GROUP_COLORS[0] },
      { key: 'cluster_1', label: 'Cluster 1', defaultName: 'Pragmatic Adopters', defaultSegment: 'D', share: 0.25, box: [25, 35, 44, 56, 68], color: GROUP_COLORS[1] },
      { key: 'cluster_2', label: 'Cluster 2', defaultName: 'Digital Fast Followers', defaultSegment: 'C', share: 0.3, box: [40, 52, 65, 78, 92], color: GROUP_COLORS[2] },
      { key: 'cluster_3', label: 'Cluster 3', defaultName: 'High-Volume Commercial Champions', defaultSegment: 'B', share: 0.15, box: [60, 75, 88, 104, 122], color: GROUP_COLORS[3] },
      { key: 'cluster_4', label: 'Cluster 4', defaultName: 'Early Scientific Innovators', defaultSegment: 'A', share: 0.1, box: [85, 110, 135, 160, 195], color: GROUP_COLORS[4] },
    ],
  },
  RULES_DECILE_CLUSTERS: {
    unitLabel: 'Decile band',
    aiNamed: true,
    chartTitle: 'Decile Band Distribution: Brick Sales Index with Digital Overlay',
    soWhat: 'Deciles 9–10 concentrate brick-level volume; the digital overlay separates rising adopters within deciles 7–8.',
    yAxisLabel: 'Brick Sales Index (Decile Baseline + Digital Overlay)',
    groups: [
      { key: 'band_1_4', label: 'D1–4', defaultName: 'Deciles 1–4 · Low Volume', defaultSegment: 'E', share: 0.3, box: [5, 12, 18, 24, 32], color: GROUP_COLORS[0] },
      { key: 'band_5_6', label: 'D5–6', defaultName: 'Deciles 5–6 · Steady Base', defaultSegment: 'D', share: 0.24, box: [28, 36, 42, 50, 58], color: GROUP_COLORS[1] },
      { key: 'band_7_8_core', label: 'D7–8 core', defaultName: 'Deciles 7–8 · Core Prescribers', defaultSegment: 'C', share: 0.18, box: [48, 56, 63, 70, 78], color: GROUP_COLORS[2] },
      { key: 'band_7_8_digital', label: 'D7–8 digital', defaultName: 'Deciles 7–8 · Digitally Rising', defaultSegment: 'B', share: 0.16, box: [58, 66, 74, 82, 90], color: GROUP_COLORS[3] },
      { key: 'band_9_10', label: 'D9–10', defaultName: 'Deciles 9–10 · Commercial Leaders', defaultSegment: 'A', share: 0.12, box: [80, 86, 92, 96, 100], color: GROUP_COLORS[4] },
    ],
  },
  RULES_TEMPLATE: {
    unitLabel: 'Grid tier',
    aiNamed: false,
    chartTitle: 'Potential Grid Score by Tier (Rep Assessment + PMR)',
    soWhat: 'Tiers come from the weighted potential × adoption grid. No HCP-level sales are used — scores rely on rep assessment and PMR survey responses.',
    yAxisLabel: 'Potential Grid Score (0–100)',
    groups: [
      { key: 'tier_5', label: 'Tier 5', defaultName: 'Grid Tier 5 · Low Potential / Aware', defaultSegment: 'E', share: 0.26, box: [4, 10, 16, 22, 30], color: GROUP_COLORS[0] },
      { key: 'tier_4', label: 'Tier 4', defaultName: 'Grid Tier 4 · Moderate Potential / Aware', defaultSegment: 'D', share: 0.24, box: [24, 32, 38, 44, 52], color: GROUP_COLORS[1] },
      { key: 'tier_3', label: 'Tier 3', defaultName: 'Grid Tier 3 · Moderate Potential / Trialling', defaultSegment: 'C', share: 0.22, box: [42, 50, 56, 62, 70], color: GROUP_COLORS[2] },
      { key: 'tier_2', label: 'Tier 2', defaultName: 'Grid Tier 2 · High Potential / Considering', defaultSegment: 'B', share: 0.16, box: [60, 67, 73, 79, 86], color: GROUP_COLORS[3] },
      { key: 'tier_1', label: 'Tier 1', defaultName: 'Grid Tier 1 · High Potential / Adopting', defaultSegment: 'A', share: 0.12, box: [76, 82, 88, 93, 100], color: GROUP_COLORS[4] },
    ],
  },
};

const getReviewProfile = (method: StudioMethod): ReviewProfile =>
  REVIEW_PROFILES[(method in REVIEW_PROFILES ? method : 'RULES_TEMPLATE') as BuildMethod];

const defaultNames = (profile: ReviewProfile) =>
  Object.fromEntries(profile.groups.map((g) => [g.key, g.defaultName]));

const defaultMappings = (profile: ReviewProfile) =>
  Object.fromEntries(profile.groups.map((g) => [g.key, g.defaultSegment]));

export const S06_SegmentationStudio: React.FC = () => {
  const navigate = useNavigate();
  const { currentMarket, currentBrand, currentPersona, createLibraryVersion } = useAppStore();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedMarket, setSelectedMarket] = useState<MarketCode>(
    currentMarket === 'ALL' ? 'MKT_A' : currentMarket
  );
  const [selectedBrand, setSelectedBrand] = useState<BrandCode>(
    currentBrand === 'ALL' ? 'AUR' : currentBrand
  );
  const [customerType, setCustomerType] = useState<CustomerType>('HCP');
  const [method, setMethod] = useState<StudioMethod>('KMEANS_RULES');
  const [kClusters, setKClusters] = useState<number>(5);
  const [gridWeightPotential, setGridWeightPotential] = useState<number>(60);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(false);
  // Profile of the last run; names/mappings are re-seeded on every run so they always match its method
  const [reviewProfile, setReviewProfile] = useState<ReviewProfile>(REVIEW_PROFILES.KMEANS_RULES);
  const [clusterNames, setClusterNames] = useState<Record<string, string>>(defaultNames(REVIEW_PROFILES.KMEANS_RULES));
  const [clusterMappings, setClusterMappings] = useState<Record<string, string>>(
    defaultMappings(REVIEW_PROFILES.KMEANS_RULES)
  );

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // A changed market or method invalidates the previous run's review output
  useEffect(() => {
    setHasRun(false);
  }, [selectedMarket, method]);

  const steps: StepItem[] = [
    { step: 1, title: 'Scope & Filter', description: 'Universe definition' },
    { step: 2, title: 'Method & Build', description: 'K-Means or Rules grid' },
    { step: 3, title: 'Review Profiles', description: 'AI-2 naming & box plots' },
    { step: 4, title: 'Map to Standard', description: 'Harmonize to A–E' },
  ];

  const fullAggregates = dataService.getFullAggregatesData();
  const universeCount = fullAggregates.markets[selectedMarket]?.hcp_universe || 8000;

  // Enforce studio method based on market maturity
  const availableMethods: { id: StudioMethod; label: string; desc: string; allowed: boolean }[] = [
    {
      id: 'KMEANS_RULES',
      label: 'K-Means Machine Learning',
      desc: 'Clustering on multidimensional continuous feature vectors (Market A data-rich)',
      allowed: selectedMarket === 'MKT_A',
    },
    {
      id: 'RULES_DECILE_CLUSTERS',
      label: 'Deciling + Behavioural Clusters',
      desc: 'Sales deciles overlaid with consented digital telemetry (Market B signal-enriched)',
      allowed: selectedMarket === 'MKT_B' || selectedMarket === 'MKT_A',
    },
    {
      id: 'RULES_TEMPLATE',
      label: 'Global Rules Template (Weighted Grid)',
      desc: 'Potential grid with editable weights (Market C survey-led or cross-market standard)',
      allowed: true,
    },
  ];

  // Run studio simulation
  const handleRunAlgorithm = async () => {
    const profile = getReviewProfile(method);
    setReviewProfile(profile);
    setClusterNames(defaultNames(profile));
    setClusterMappings(defaultMappings(profile));
    setIsRunning(true);
    try {
      // Rules-template tiers come from the grid definition, not from AI-2 cluster naming
      if (profile.aiNamed) {
        await aiService.nameClusters('VER-STUDIO-NEW', { market: selectedMarket, method });
      }
      setHasRun(true);
      setActiveStep(3);
    } catch (err) {
      console.error(err);
      setHasRun(true);
      setActiveStep(3);
    } finally {
      setIsRunning(false);
    }
  };

  const isProxyMarket = selectedMarket === 'MKT_C';
  const boxPlotData: BoxPlotItem[] = reviewProfile.groups.map((g) => {
    const [min, q1, median, q3, max] = g.box;
    return { group: `${g.label} (${g.defaultSegment})`, min, q1, median, q3, max, color: g.color };
  });
  const groupSize = (key: string) =>
    Math.round(universeCount * (reviewProfile.groups.find((g) => g.key === key)?.share ?? 0));

  // Save as Version in Segment Library
  const handleSaveVersion = () => {
    if (currentPersona === 'P6') {
      alert('Your role cannot create or modify segmentations (read-only compliance access).');
      return;
    }
    if (currentPersona === 'P2' && selectedMarket !== 'MKT_B') {
      alert('Your role cannot build segmentation for markets other than your assigned home market (Market B).');
      return;
    }

    createLibraryVersion({
      name: `${selectedBrand} ${selectedMarket} Studio Build v2.3`,
      market_code: selectedMarket,
      brand_code: selectedBrand,
      customer_type: customerType,
      method,
      status: 'Draft',
      records_segmented: universeCount,
      mapped_to_global: true,
      notes: `Studio run using ${method}. Parameters: k=${kClusters}, gridWeight=${gridWeightPotential}%.`,
      parameters: {
        k: method === 'KMEANS_RULES' ? kClusters : undefined,
        weights: method === 'RULES_TEMPLATE' ? { potential: gridWeightPotential, adoption: 100 - gridWeightPotential } : undefined,
      },
    });

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: 'Segmentation version saved as Draft in Segment Library (S07)',
      subtext: 'Awaiting Global Lead (P1) review and activation.',
    });

    setTimeout(() => {
      navigate('/library');
    }, 1600);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Segmentation Studio"
        question="Build a segmentation within my market's rights."
      />

      {/* Stepper */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs">
        <StepIndicator
          steps={steps}
          currentStep={activeStep}
          totalSteps={4}
          onStepChange={(step) => {
            if (hasRun || step <= 2) setActiveStep(step);
          }}
        />
      </div>

      {/* STEP 1: SCOPE & FILTER */}
      {activeStep === 1 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-section-title text-navy-900 pb-3 border-b border-slate-100">
              Customer Universe Parameters
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Target Market Scope
                </label>
                <select
                  value={selectedMarket}
                  onChange={(e) => {
                    const m = e.target.value as MarketCode;
                    setSelectedMarket(m);
                    if (m === 'MKT_C') setMethod('RULES_TEMPLATE');
                    else if (m === 'MKT_B') setMethod('RULES_DECILE_CLUSTERS');
                    else setMethod('KMEANS_RULES');
                  }}
                  className="w-full text-body-sm border border-slate-300 rounded-md p-2 bg-white text-navy-900"
                >
                  <option value="MKT_A">Market A · Data-rich (Continuous K-means)</option>
                  <option value="MKT_B">Market B · Signal-enriched (Deciles + CRM)</option>
                  <option value="MKT_C">Market C · Survey-led (Rules Template)</option>
                </select>
                <p className="text-2xs text-slate-500 mt-1">
                  Enforces market methodology constraints from governance standards.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Commercial Brand
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value as BrandCode)}
                  className="w-full text-body-sm border border-slate-300 rounded-md p-2 bg-white text-navy-900"
                >
                  <option value="AUR">Aurelix (Hero Immunology Launch)</option>
                  <option value="ZEN">Zentrova (Oncology Growth)</option>
                  <option value="CRD">Cardivance (Cardiometabolic Mature)</option>
                  <option value="NEU">Neurelle (Neuroscience Digital)</option>
                  <option value="BRV">Brevanta (Respiratory Mature)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Customer Unit
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-body-sm text-navy-900 cursor-pointer">
                    <input
                      type="radio"
                      checked={customerType === 'HCP'}
                      onChange={() => setCustomerType('HCP')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Prescriber (HCP)</span>
                  </label>
                  <label className="flex items-center gap-2 text-body-sm text-navy-900 cursor-pointer">
                    <input
                      type="radio"
                      checked={customerType === 'HCO'}
                      onChange={() => setCustomerType('HCO')}
                      className="text-teal-600 focus:ring-teal-500"
                    />
                    <span>Account / Hospital (HCO)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                  Estimated Universe Count
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-body-sm font-mono font-bold text-navy-900 flex items-center justify-between">
                  <span>{universeCount.toLocaleString()} Prescribers</span>
                  <span className="text-xs text-teal-700 font-sans font-medium">100% Lakehouse Matched</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActiveStep(2)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5"
              >
                <span>Proceed to Build Method</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: METHOD & BUILD */}
      {activeStep === 2 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-section-title text-navy-900">
                Methodology Selection (Market Rights Governed)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Available algorithms are restricted to match each market&apos;s data readiness reality.
              </p>
            </div>

            <div className="space-y-3">
              {availableMethods.map((m) => (
                <div
                  key={m.id}
                  onClick={() => {
                    if (m.allowed) setMethod(m.id);
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    !m.allowed
                      ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                      : method === m.id
                      ? 'border-teal-600 bg-teal-50/50 shadow-2xs cursor-pointer'
                      : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        disabled={!m.allowed}
                        checked={method === m.id}
                        onChange={() => setMethod(m.id)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <div className="font-semibold text-body-sm text-navy-900">{m.label}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{m.desc}</div>
                      </div>
                    </div>
                    {!m.allowed && (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                        Unavailable in {selectedMarket}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Algorithm Parameters */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
              <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wide">
                Algorithm Hyperparameters
              </h4>

              {method === 'KMEANS_RULES' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      Cluster Count (k)
                    </label>
                    <input
                      type="number"
                      min={3}
                      max={7}
                      value={kClusters}
                      onChange={(e) => setKClusters(Number(e.target.value))}
                      className="border border-slate-300 rounded p-1.5 text-xs w-24 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-700 font-medium mb-1">
                      Selected Feature Store Inputs
                    </label>
                    <div className="text-xs text-slate-600">
                      <code>trx_qoq_change</code>, <code>portal_visits_3m</code>, <code>pmr_attitudinal</code>
                    </div>
                  </div>
                </div>
              )}

              {method === 'RULES_TEMPLATE' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-700 font-medium">
                    <span>Potential Weight: {gridWeightPotential}%</span>
                    <span>Adoption Stage Weight: {100 - gridWeightPotential}%</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    value={gridWeightPotential}
                    onChange={(e) => setGridWeightPotential(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>
              )}

              {method === 'RULES_DECILE_CLUSTERS' && (
                <div className="text-xs text-slate-600">
                  Using 10-decile brick volume baseline with digital engagement score overlay (threshold &ge; 70th percentile).
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveStep(1)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleRunAlgorithm}
                disabled={isRunning}
                className="px-5 py-2.5 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors shadow-2xs flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Running Model Convergence...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Segmentation Algorithm</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW PROFILES */}
      {activeStep === 3 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center gap-3">
              {reviewProfile.aiNamed && <AIBadge providerName="MockProvider" />}
              <div>
                <h4 className="text-body font-semibold text-navy-900">
                  {reviewProfile.aiNamed ? `${reviewProfile.unitLabel} Profiling` : 'Potential Grid Tiers'}
                </h4>
                <p className="text-xs text-slate-500">
                  {reviewProfile.aiNamed
                    ? `Generated ${reviewProfile.groups.length} ${reviewProfile.unitLabel.toLowerCase()}s with AI-assisted behavioral naming.`
                    : `Scored ${reviewProfile.groups.length} tiers from the global grid template (potential ${gridWeightPotential}% · adoption ${100 - gridWeightPotential}%).`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep(2)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5"
              >
                <span>Proceed to Global Mapping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {isProxyMarket && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold">Sales Signal Policy: </span>
                <span>Not available in this market — using proxy: rep assessment + PMR</span>
              </div>
            </div>
          )}

          <BoxPlot
            title={reviewProfile.chartTitle}
            soWhat={reviewProfile.soWhat}
            xAxisLabel={`Formed ${reviewProfile.unitLabel}`}
            yAxisLabel={reviewProfile.yAxisLabel}
            data={boxPlotData}
            height={320}
          />

          {/* Group Name Editing */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
            <h4 className="text-section-title text-navy-900">
              Review &amp; Edit {reviewProfile.unitLabel} Titles
            </h4>

            <div className="space-y-3">
              {Object.keys(clusterNames).map((key) => (
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="w-1/4">
                    <span className="font-mono text-xs font-bold text-navy-900">{key}</span>
                    <div className="text-2xs text-slate-500">Size: {groupSize(key).toLocaleString()} HCPs</div>
                  </div>
                  <div className="w-1/2">
                    <input
                      type="text"
                      value={clusterNames[key]}
                      onChange={(e) => setClusterNames({ ...clusterNames, [key]: e.target.value })}
                      className="w-full text-xs border border-slate-300 rounded px-2.5 py-1.5 bg-white text-navy-900"
                    />
                  </div>
                  <div className="w-1/5 text-right">
                    <span className="text-2xs text-teal-700 font-semibold bg-teal-50 px-2 py-1 rounded border border-teal-200">
                      {reviewProfile.aiNamed ? 'AI Suggested' : 'Template Default'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: MAP TO STANDARD */}
      {activeStep === 4 && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-section-title text-navy-900">
                Map Formed {reviewProfile.unitLabel}s to Global Vocabulary Standard
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every {reviewProfile.unitLabel.toLowerCase()} must map to a global segment value (A–E) before it can enter the living loop or publish to CRM.
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              {Object.keys(clusterMappings).map((key) => (
                <div key={key} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                  <div className="w-1/2">
                    <div className="font-semibold text-body-sm text-navy-900">{clusterNames[key]}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{key}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 font-medium">Maps to Global Segment:</span>
                    <select
                      value={clusterMappings[key]}
                      onChange={(e) => setClusterMappings({ ...clusterMappings, [key]: e.target.value })}
                      className="border border-slate-300 rounded px-3 py-1.5 text-xs font-bold bg-white text-navy-900"
                    >
                      <option value="A">Segment A (High Volume Innovator)</option>
                      <option value="B">Segment B (Fast Follower / Rising)</option>
                      <option value="C">Segment C (Pragmatist)</option>
                      <option value="D">Segment D (Conservative)</option>
                      <option value="E">Segment E (Low Potential)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => setActiveStep(3)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-navy-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                onClick={handleSaveVersion}
                className="px-5 py-2.5 bg-teal-600 text-white text-body-sm font-semibold rounded-md hover:bg-teal-700 transition-colors shadow-2xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save as Version (Create Draft in Library)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          toast={toast}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default S06_SegmentationStudio;
