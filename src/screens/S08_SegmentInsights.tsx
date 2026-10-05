import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { KpiTile } from '../components/ui/KpiTile';
import { SegmentAgeChip } from '../components/ui/SegmentAgeChip';
import { DataTable, Column } from '../components/ui/DataTable';
import { Matrix4x4, MatrixCellData } from '../components/charts/Matrix4x4';
import { Sankey, SankeyNodeData, SankeyLinkData } from '../components/charts/Sankey';
import { Heatmap, HeatmapHeaderItem, HeatmapCell } from '../components/charts/Heatmap';
import { BarChartComponent, BarSeries } from '../components/charts/BarChart';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { formatNumber, formatPercent } from '../utils/formatters';

export const S08_SegmentInsights: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentMarket, currentBrand, currentPersona } = useAppStore();

  const isP3 = currentPersona === 'P3';
  const defaultTab = isP3 ? 'accounts' : searchParams.get('tab') || 'profiles';
  const currentTab = isP3 ? 'accounts' : defaultTab;

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // Seven Tabs per Prompt Pack
  const allTabs = [
    { id: 'profiles', label: 'Profiles' },
    { id: 'opportunity', label: 'Opportunity Matrix' },
    { id: 'migration', label: 'Migration (Sankey)' },
    { id: 'accounts', label: 'Accounts (HCO)' },
    { id: 'cross-market', label: 'Cross-Market' },
    { id: 'cross-segmentation', label: 'Channel Affinity' },
    { id: 'targeting', label: 'Targeting Alignment' },
  ];

  // For P3 (KAM / Account Lead), only the Accounts tab is visible
  const visibleTabs = isP3 ? allTabs.filter((t) => t.id === 'accounts') : allTabs;

  const marketAgg = dataService.getAggregates(currentMarket);
  const accounts = dataService.getAccounts({ market: currentMarket });
  const affiliations = dataService.getAffiliations();

  // 1. Profiles Data
  const segmentColors: Record<string, string> = {
    A: '#0E7C86',
    B: '#3CA5AE',
    C: '#5B6ABF',
    D: '#E9B44C',
    E: '#8A6D1F',
  };

  const segmentMix = (marketAgg.segment_mix as any)[currentBrand === 'ALL' ? 'AUR' : currentBrand] ||
    (marketAgg.segment_mix as any).AUR;

  const profilesData = [
    {
      segment: 'Segment A',
      code: 'A',
      share: segmentMix.A,
      count: Math.round(marketAgg.hcp_universe * segmentMix.A),
      avgPotential: '3.9 / 4.0',
      adoptionMix: '62% Adoption · 28% Trial · 10% Cons.',
      channelMix: '55% F2F · 25% Remote · 20% Digital',
      archetype: 'High Volume Innovator',
      description: 'Key prescribing leaders driving guideline adoption and rapid brand uptake.',
    },
    {
      segment: 'Segment B',
      code: 'B',
      share: segmentMix.B,
      count: Math.round(marketAgg.hcp_universe * segmentMix.B),
      avgPotential: '3.4 / 4.0',
      adoptionMix: '34% Adoption · 46% Trial · 20% Cons.',
      channelMix: '45% F2F · 30% Remote · 25% Digital',
      archetype: 'Fast Follower / Rising Prescriber',
      description: 'High potential prescribers moving into active trial; primary living loop growth target.',
    },
    {
      segment: 'Segment C',
      code: 'C',
      share: segmentMix.C,
      count: Math.round(marketAgg.hcp_universe * segmentMix.C),
      avgPotential: '2.8 / 4.0',
      adoptionMix: '15% Adoption · 40% Trial · 45% Cons.',
      channelMix: '30% F2F · 35% Remote · 35% Digital',
      archetype: 'Pragmatist / Guideline Dependent',
      description: 'Moderate volume requiring peer evidence and digital engagement before first script.',
    },
    {
      segment: 'Segment D',
      code: 'D',
      share: segmentMix.D,
      count: Math.round(marketAgg.hcp_universe * segmentMix.D),
      avgPotential: '2.1 / 4.0',
      adoptionMix: '5% Adoption · 25% Trial · 70% Aware',
      channelMix: '20% F2F · 40% Remote · 40% Digital',
      archetype: 'Conservative Prescriber',
      description: 'Established prescribers loyal to standard-of-care alternatives.',
    },
    {
      segment: 'Segment E',
      code: 'E',
      share: segmentMix.E,
      count: Math.round(marketAgg.hcp_universe * segmentMix.E),
      avgPotential: '1.2 / 4.0',
      adoptionMix: '2% Adoption · 8% Trial · 90% Aware',
      channelMix: '10% F2F · 30% Remote · 60% Digital',
      archetype: 'Low Potential / Non-Target',
      description: 'Infrequent prescribers supported primarily via low-cost digital touchpoints.',
    },
  ];

  // 2. Opportunity Matrix Data (Matrix4x4)
  const isMarketC = currentMarket === 'MKT_C';
  const matrixCells: MatrixCellData[] = [
    // Tier 1 (High)
    { potential: 1, adoptionStage: 'Awareness', count: isMarketC ? 25 : 120, isOpportunityGap: true, notes: 'Prime opportunity: high potential unaware of new indications' },
    { potential: 1, adoptionStage: 'Consideration', count: isMarketC ? 45 : 340, isOpportunityGap: true, notes: 'Immediate priority: pending peer review and formulary pull' },
    { potential: 1, adoptionStage: 'Trial', count: isMarketC ? 65 : 420, isOpportunityGap: false },
    { potential: 1, adoptionStage: 'Adoption', count: isMarketC ? 70 : 580, isOpportunityGap: false },

    // Tier 2 (Med-High)
    { potential: 2, adoptionStage: 'Awareness', count: isMarketC ? 60 : 280, isOpportunityGap: true, notes: 'Secondary opportunity gap' },
    { potential: 2, adoptionStage: 'Consideration', count: isMarketC ? 110 : 610, isOpportunityGap: true, notes: 'Target for remote detailing blitz' },
    { potential: 2, adoptionStage: 'Trial', count: isMarketC ? 140 : 790, isOpportunityGap: false },
    { potential: 2, adoptionStage: 'Adoption', count: isMarketC ? 115 : 640, isOpportunityGap: false },

    // Tier 3 (Med-Low)
    { potential: 3, adoptionStage: 'Awareness', count: isMarketC ? 150 : 540, isOpportunityGap: false },
    { potential: 3, adoptionStage: 'Consideration', count: isMarketC ? 180 : 820, isOpportunityGap: false },
    { potential: 3, adoptionStage: 'Trial', count: isMarketC ? 130 : 640, isOpportunityGap: false },
    { potential: 3, adoptionStage: 'Adoption', count: isMarketC ? 60 : 380, isOpportunityGap: false },

    // Tier 4 (Low)
    { potential: 4, adoptionStage: 'Awareness', count: isMarketC ? 220 : 950, isOpportunityGap: false },
    { potential: 4, adoptionStage: 'Consideration', count: isMarketC ? 140 : 620, isOpportunityGap: false },
    { potential: 4, adoptionStage: 'Trial', count: isMarketC ? 35 : 190, isOpportunityGap: false },
    { potential: 4, adoptionStage: 'Adoption', count: isMarketC ? 15 : 70, isOpportunityGap: false },
  ];

  // 3. Migration Sankey Data
  const sankeyNodes: SankeyNodeData[] = [
    { id: 'prev_A', name: 'Prev: Seg A', color: '#0E7C86' },
    { id: 'prev_B', name: 'Prev: Seg B', color: '#3CA5AE' },
    { id: 'prev_C', name: 'Prev: Seg C', color: '#5B6ABF' },
    { id: 'prev_D', name: 'Prev: Seg D', color: '#E9B44C' },
    { id: 'prev_E', name: 'Prev: Seg E', color: '#8A6D1F' },

    { id: 'curr_A', name: 'Active: Seg A', color: '#0E7C86' },
    { id: 'curr_B', name: 'Active: Seg B', color: '#3CA5AE' },
    { id: 'curr_C', name: 'Active: Seg C', color: '#5B6ABF' },
    { id: 'curr_D', name: 'Active: Seg D', color: '#E9B44C' },
    { id: 'curr_E', name: 'Active: Seg E', color: '#8A6D1F' },
  ];

  const sankeyLinks: SankeyLinkData[] = [
    { source: 'prev_A', target: 'curr_A', value: 820, color: '#0E7C86' },
    { source: 'prev_B', target: 'curr_A', value: 210, color: '#0E7C86' }, // Rising into A
    { source: 'prev_B', target: 'curr_B', value: 1450, color: '#3CA5AE' },
    { source: 'prev_C', target: 'curr_B', value: 340, color: '#3CA5AE' }, // Rising into B
    { source: 'prev_C', target: 'curr_C', value: 2100, color: '#5B6ABF' },
    { source: 'prev_D', target: 'curr_C', value: 180, color: '#5B6ABF' },
    { source: 'prev_D', target: 'curr_D', value: 1650, color: '#E9B44C' },
    { source: 'prev_C', target: 'curr_D', value: 95, color: '#E9B44C' }, // Declining
    { source: 'prev_E', target: 'curr_E', value: 1400, color: '#8A6D1F' },
  ];

  // 4. Accounts Table Data
  type AccountRow = {
    id: string;
    name: string;
    market: string;
    archetype: string;
    tier: string;
    accessStatus: string;
    affiliatedHcps: number;
    segmentAge: number;
  };

  const accountRows: AccountRow[] = useMemo(() => {
    const formularyStatuses = dataService.getFormularyStatus();
    return accounts.map((acc) => {
      const affCount = affiliations.filter((af) => af.hco_id === acc.hco_id).length || acc.affiliated_hcp_count;
      const fStatus = formularyStatuses.find((f) => f.hco_id === acc.hco_id && (f.brand_code === (currentBrand === 'ALL' ? 'AUR' : currentBrand)));
      const tier = (acc.beds && acc.beds > 300) || acc.hco_type === 'IDN' ? 'Tier 1' : (acc.beds && acc.beds > 100) ? 'Tier 2' : 'Tier 3';
      return {
        id: acc.hco_id,
        name: acc.name,
        market: acc.market_code,
        archetype: acc.archetype,
        tier,
        accessStatus: fStatus?.status || 'Unrestricted',
        affiliatedHcps: affCount,
        segmentAge: acc.market_code === 'MKT_C' ? 310 : acc.market_code === 'MKT_B' ? 180 : 75,
      };
    });
  }, [accounts, affiliations, currentBrand]);

  const accountColumns: Column<AccountRow>[] = [
    {
      key: 'name',
      header: 'Account Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-navy-900">{row.name}</div>
          <div className="text-xs text-slate-500 font-mono">{row.id} · {row.market}</div>
        </div>
      ),
    },
    {
      key: 'archetype',
      header: 'Archetype',
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {row.archetype}
        </span>
      ),
    },
    {
      key: 'tier',
      header: 'Account Tier',
      render: (row) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          row.tier === 'Tier 1'
            ? 'bg-teal-50 text-teal-700 border border-teal-200'
            : row.tier === 'Tier 2'
            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            : 'bg-slate-100 text-slate-700'
        }`}>
          {row.tier}
        </span>
      ),
    },
    {
      key: 'accessStatus',
      header: 'Formulary Status',
      render: (row) => (
        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
          row.accessStatus === 'Preferred' || row.accessStatus === 'Unrestricted'
            ? 'bg-teal-50 text-teal-700'
            : row.accessStatus === 'Prior Auth Required'
            ? 'bg-amber-50 text-amber-800'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {row.accessStatus}
        </span>
      ),
    },
    {
      key: 'affiliatedHcps',
      header: 'Affiliated HCPs',
      align: 'right',
      render: (row) => (
        <span className="font-mono text-body-sm font-semibold text-navy-900">
          {row.affiliatedHcps}
        </span>
      ),
    },
    {
      key: 'segmentAge',
      header: 'Segment Age',
      render: (row) => <SegmentAgeChip days={row.segmentAge} />,
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customer/hco/${row.id}`);
          }}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          <span>Account 360</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  // 5. Cross-Market Data
  const [crossMarketStandardized, setCrossMarketStandardized] = useState<boolean>(true);

  // 6. Cross-Segmentation (Neurelle Channel Affinity Heatmap)
  const heatmapRows: HeatmapHeaderItem[] = [
    { id: 'segA', label: 'Segment A (Leader)' },
    { id: 'segB', label: 'Segment B (Rising)' },
    { id: 'segC', label: 'Segment C (Pragmatist)' },
    { id: 'segD', label: 'Segment D (Conservative)' },
    { id: 'segE', label: 'Segment E (Low Potential)' },
  ];

  const heatmapCols: HeatmapHeaderItem[] = [
    { id: 'f2f', label: 'In-Person Detailing' },
    { id: 'remote', label: 'Remote Detailing' },
    { id: 'email', label: 'Rep Email' },
    { id: 'portal', label: 'Self-Serve Portal' },
    { id: 'webinar', label: 'Medical Webinar' },
  ];

  const heatmapCells: HeatmapCell[] = [
    { rowId: 'segA', colId: 'f2f', value: 88, displayValue: '88%', status: 'high' },
    { rowId: 'segA', colId: 'remote', value: 65, displayValue: '65%', status: 'medium' },
    { rowId: 'segA', colId: 'email', value: 42, displayValue: '42%', status: 'low' },
    { rowId: 'segA', colId: 'portal', value: 38, displayValue: '38%', status: 'low' },
    { rowId: 'segA', colId: 'webinar', value: 74, displayValue: '74%', status: 'high' },

    { rowId: 'segB', colId: 'f2f', value: 72, displayValue: '72%', status: 'high' },
    { rowId: 'segB', colId: 'remote', value: 85, displayValue: '85%', status: 'high' },
    { rowId: 'segB', colId: 'email', value: 78, displayValue: '78%', status: 'high' },
    { rowId: 'segB', colId: 'portal', value: 82, displayValue: '82%', status: 'high' },
    { rowId: 'segB', colId: 'webinar', value: 68, displayValue: '68%', status: 'medium' },

    { rowId: 'segC', colId: 'f2f', value: 45, displayValue: '45%', status: 'medium' },
    { rowId: 'segC', colId: 'remote', value: 60, displayValue: '60%', status: 'medium' },
    { rowId: 'segC', colId: 'email', value: 65, displayValue: '65%', status: 'medium' },
    { rowId: 'segC', colId: 'portal', value: 70, displayValue: '70%', status: 'high' },
    { rowId: 'segC', colId: 'webinar', value: 52, displayValue: '52%', status: 'medium' },

    { rowId: 'segD', colId: 'f2f', value: 30, displayValue: '30%', status: 'low' },
    { rowId: 'segD', colId: 'remote', value: 40, displayValue: '40%', status: 'low' },
    { rowId: 'segD', colId: 'email', value: 50, displayValue: '50%', status: 'medium' },
    { rowId: 'segD', colId: 'portal', value: 45, displayValue: '45%', status: 'medium' },
    { rowId: 'segD', colId: 'webinar', value: 25, displayValue: '25%', status: 'low' },

    { rowId: 'segE', colId: 'f2f', value: 12, displayValue: '12%', status: 'low' },
    { rowId: 'segE', colId: 'remote', value: 20, displayValue: '20%', status: 'low' },
    { rowId: 'segE', colId: 'email', value: 35, displayValue: '35%', status: 'low' },
    { rowId: 'segE', colId: 'portal', value: 40, displayValue: '40%', status: 'low' },
    { rowId: 'segE', colId: 'webinar', value: 15, displayValue: '15%', status: 'low' },
  ];

  // 7. Targeting Alignment Data
  const targetingBarData = [
    { segment: 'Segment A', currentCalls: 1240, recommendedCalls: 1580 },
    { segment: 'Segment B', currentCalls: 1680, recommendedCalls: 2150 },
    { segment: 'Segment C', currentCalls: 1450, recommendedCalls: 1120 },
    { segment: 'Segment D', currentCalls: 980, recommendedCalls: 540 },
    { segment: 'Segment E', currentCalls: 450, recommendedCalls: 120 },
  ];

  const targetingSeries: BarSeries[] = [
    { dataKey: 'currentCalls', name: 'Current Cycle Call Plan', color: '#94A3B8' },
    { dataKey: 'recommendedCalls', name: 'Living Aligned Recommendation', color: '#0E7C86' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Segment Insights"
        question="What do our segments tell us?"
      />

      {/* Tabs */}
      <Tabs tabs={visibleTabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* TAB 1: PROFILES */}
      {currentTab === 'profiles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {profilesData.map((item) => (
              <div
                key={item.code}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between"
                style={{ borderTop: `4px solid ${segmentColors[item.code]}` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">{item.segment}</span>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100">
                      {formatPercent(item.share)}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    {formatNumber(item.count)} HCPs
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500">Archetype:</span>
                      <div className="font-semibold text-navy-900">{item.archetype}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Avg Potential:</span>
                      <div className="font-mono text-slate-700">{item.avgPotential}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Channel Mix:</span>
                      <div className="text-slate-600 font-mono text-2xs">{item.channelMix}</div>
                    </div>
                  </div>
                </div>

                <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 italic">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-teal-600" />
              <div>
                <h4 className="text-body-sm font-semibold text-navy-900">
                  Living Segment Calibration Active
                </h4>
                <p className="text-xs text-slate-600">
                  Segments A and B capture 30% of total prescriber volume while generating 68% of new patient start momentum.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/studio')}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>Inspect in Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: OPPORTUNITY MATRIX */}
      {currentTab === 'opportunity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Identified Opportunity Gap"
              value={isMarketC ? '130 HCPs' : '740 HCPs'}
              delta={{
                value: 'High Potential / Low Adoption',
                direction: 'up',
                isPositive: true,
              }}
              tooltip="Prescribers in Tier 1 or Tier 2 potential who remain in Awareness or Consideration stage"
            />
            <KpiTile
              label="Prioritized Next-Step Actions"
              value="310 Detailing Triggers"
              delta={{ value: 'Routed to Call Planning', direction: 'neutral' }}
            />
            <KpiTile
              label="Potential Value at Risk"
              value="$1.8M ARR"
              delta={{ value: 'If unaddressed by next cycle', direction: 'down', isPositive: false }}
            />
          </div>

          <Matrix4x4
            title="Potential × Adoption Opportunity Matrix"
            soWhat="Prescribers in Tier 1 & 2 with Awareness/Consideration represent highest-yield growth candidates."
            xAxisLabel="Adoption Stage"
            yAxisLabel="Prescriber Potential Tier"
            data={matrixCells}
            isProxyData={isMarketC}
            proxyNotice="Not available in this market — using proxy: rep assessment + PMR"
          />
        </div>
      )}

      {/* TAB 3: MIGRATION (SANKEY) */}
      {currentTab === 'migration' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Net Upgraded to Tier A/B"
              value="+550 HCPs"
              delta={{ value: '+14% growth in priority tiers', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Downgraded to Support Tiers"
              value="-95 HCPs"
              delta={{ value: 'Saved 620 wasted sales calls', direction: 'down', isPositive: true }}
            />
            <KpiTile
              label="Quarterly Segment Stability"
              value="88.2%"
              delta={{ value: 'Conforms to stability policy limit', direction: 'neutral' }}
            />
          </div>

          <Sankey
            title="Segment Movement Between Versions (Last Planning Cycle → Living Active)"
            soWhat="Living segmentation continuously captures rising prescribers without waiting for the annual review cycle."
            xAxisLabel="Version Lifecycle Stage"
            yAxisLabel="Customer Volume"
            nodes={sankeyNodes}
            links={sankeyLinks}
            height={420}
          />
        </div>
      )}

      {/* TAB 4: ACCOUNTS (HCO) */}
      {currentTab === 'accounts' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Total Governed Accounts"
              value={formatNumber(accounts.length)}
              delta={{ value: 'Hospitals, clinics & IDNs', direction: 'neutral' }}
            />
            <KpiTile
              label="Tier 1 Strategic Accounts"
              value={accountRows.filter((a) => a.tier === 'Tier 1').length}
              delta={{ value: 'Holding 64% of regional potential', direction: 'neutral' }}
            />
            <KpiTile
              label="Formulary Win Propagation"
              value="24 Accounts Active"
              delta={{ value: 'Zentrova hero account active', direction: 'up', isPositive: true }}
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Governed Account Portfolio</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Accounts determine access caps and propagate formulary wins to affiliated HCPs.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Live KAM Scope
              </span>
            </div>

            <DataTable
              data={accountRows}
              columns={accountColumns}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/customer/hco/${row.id}`)}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 5: CROSS-MARKET */}
      {currentTab === 'cross-market' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4">
            <div>
              <h3 className="text-section-title text-navy-900">Standardised Global Vocabulary Comparison</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle between local market definitions and normalized Continuum Global Standard.
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setCrossMarketStandardized(false)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  !crossMarketStandardized
                    ? 'bg-white text-navy-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Local Labels (Pre-Continuum)
              </button>
              <button
                onClick={() => setCrossMarketStandardized(true)}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  crossMarketStandardized
                    ? 'bg-teal-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Global Standard (A–E)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Market A Comparison */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-navy-900">Market A · Data-rich</span>
                <span className="text-xs font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  K-Means
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                  <div className="text-body font-bold text-teal-700 mt-0.5">
                    {crossMarketStandardized ? 'Segment A · High Volume' : 'Cluster 1: High Rx Innovators'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    8% Universe · 3.9 Avg Potential · Rx Claims Driven
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                  <div className="text-body font-bold text-teal-700 mt-0.5">
                    {crossMarketStandardized ? 'Segment B · Fast Follower' : 'Cluster 3: Mid-Tier Digital'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    17% Universe · 3.3 Avg Potential · Dynamic Re-scoring
                  </div>
                </div>
              </div>
            </div>

            {/* Market B Comparison */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-navy-900">Market B · Signal-enriched</span>
                <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Deciles + Rules
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                  <div className="text-body font-bold text-indigo-700 mt-0.5">
                    {crossMarketStandardized ? 'Segment A · High Volume' : 'Decile 9-10 Commercial Leaders'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    12% Universe · 3.8 Avg Potential · Brick Sales + Rep Notes
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                  <div className="text-body font-bold text-indigo-700 mt-0.5">
                    {crossMarketStandardized ? 'Segment B · Fast Follower' : 'Decile 7-8 Rising Adopters'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    22% Universe · 3.4 Avg Potential · Moving Digital Signals
                  </div>
                </div>
              </div>
            </div>

            {/* Market C Comparison */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-semibold text-navy-900">Market C · Survey-led</span>
                <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Agency Grid
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                  <div className="text-body font-bold text-amber-700 mt-0.5">
                    {crossMarketStandardized ? 'Segment A · High Volume' : 'Survey Tier 1: KOL Champions'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    20% Universe · 3.6 Avg Potential · Rep Perception + PMR
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded border border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                  <div className="text-body font-bold text-amber-700 mt-0.5">
                    {crossMarketStandardized ? 'Segment B · Fast Follower' : 'Survey Tier 2: Regular Prescribers'}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 font-mono">
                    30% Universe · 3.1 Avg Potential · Agency Spreadsheet
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CHANNEL AFFINITY (CROSS-SEGMENTATION) */}
      {currentTab === 'cross-segmentation' && (
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-body font-semibold text-indigo-900">
                Neurelle Cross-Segmentation Storyline
              </h4>
              <p className="text-body-sm text-indigo-800 mt-1">
                Prescribers in Segment B demonstrate an 85% remote detailing responsiveness and 82% portal affinity.
                Combining behavioural segment with channel preference allows the field team to deploy hybrid engagements rather than relying purely on in-person visits.
              </p>
            </div>
          </div>

          <Heatmap
            title="Segment × Channel Affinity Engagement Heatmap"
            soWhat="Segment B prescribers show exceptionally high responsiveness to remote video and rep-triggered email."
            xAxisLabel="Omnichannel Touchpoint"
            yAxisLabel="Customer Segment"
            rows={heatmapRows}
            columns={heatmapCols}
            data={heatmapCells}
            height={320}
          />
        </div>
      )}

      {/* TAB 7: TARGETING ALIGNMENT */}
      {currentTab === 'targeting' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Effort Redirected to Rising Prescribers"
              value="+18.4%"
              delta={{ value: 'Targeting alignment post-publish', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Wasted Detail Calls Eliminated"
              value="770 Details"
              delta={{ value: 'Reallocated from declining Segment D/E', direction: 'down', isPositive: true }}
            />
            <KpiTile
              label="Downstream Consumer Sync"
              value="5 Systems Live"
              delta={{ value: 'Targeting, Call Plan, NBA, Journeys', direction: 'neutral' }}
            />
          </div>

          <BarChartComponent
            title="Sales Force Effort Alignment: Current Cycle Plan vs Living Recommended"
            soWhat="Publishing living segmentation directly re-allocates 790 call targets into high-momentum Segments A & B."
            xAxisLabel="Segment Tier"
            yAxisLabel="Quarterly Planned Detail Calls"
            data={targetingBarData}
            series={targetingSeries}
            height={340}
          />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Downstream impact verified: targeting rules re-weighted in Call Planning &amp; Veeva Align.
            </span>
            <button
              onClick={() => navigate('/publish')}
              className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
            >
              <span>View CRM Publish Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default S08_SegmentInsights;
