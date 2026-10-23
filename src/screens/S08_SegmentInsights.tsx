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
import { EmptyState } from '../components/ui/EmptyState';
import { DataTable, Column } from '../components/ui/DataTable';
import { Matrix4x4, MatrixCellData } from '../components/charts/Matrix4x4';
import { Sankey, SankeyNodeData, SankeyLinkData } from '../components/charts/Sankey';
import { Heatmap, HeatmapHeaderItem, HeatmapCell } from '../components/charts/Heatmap';
import { BarChartComponent, BarSeries } from '../components/charts/BarChart';
import { useAppStore } from '../store/useAppStore';
import {
  SEGMENTS,
  SegmentCode,
  AFFINITY_CHANNELS,
  AccountInsightRow,
  buildCustomerViews,
  computeProfiles,
  computeOpportunity,
  computeMigration,
  computeAccountRows,
  computeCrossMarket,
  computeChannelAffinity,
  computeTargeting,
} from '../services/insightsService';
import { formatNumber, formatPercent } from '../utils/formatters';
import { MarketCode } from '../types';

// Global vocabulary definitions for the A–E value segment (labels, not data)
const SEGMENT_DEFINITIONS: Record<SegmentCode, { archetype: string; description: string }> = {
  A: { archetype: 'High Volume Innovator', description: 'Key prescribing leaders driving guideline adoption and rapid brand uptake.' },
  B: { archetype: 'Fast Follower / Rising Prescriber', description: 'High potential prescribers moving into active trial; primary living loop growth target.' },
  C: { archetype: 'Pragmatist / Guideline Dependent', description: 'Moderate volume requiring peer evidence and digital engagement before first script.' },
  D: { archetype: 'Conservative Prescriber', description: 'Established prescribers loyal to standard-of-care alternatives.' },
  E: { archetype: 'Low Potential / Non-Target', description: 'Infrequent prescribers supported primarily via low-cost digital touchpoints.' },
};

const SEGMENT_COLORS: Record<SegmentCode, string> = {
  A: '#0E7C86',
  B: '#3CA5AE',
  C: '#5B6ABF',
  D: '#E9B44C',
  E: '#8A6D1F',
};

const MARKET_META: Record<MarketCode, { name: string; method: string; driver: string; badge: string; accent: string }> = {
  MKT_A: { name: 'Market A · Data-rich', method: 'K-Means', driver: 'Rx claims driven', badge: 'text-teal-700 bg-teal-50', accent: 'text-teal-700' },
  MKT_B: { name: 'Market B · Signal-enriched', method: 'Deciles + Rules', driver: 'Brick sales + rep notes', badge: 'text-indigo-700 bg-indigo-50', accent: 'text-indigo-700' },
  MKT_C: { name: 'Market C · Survey-led', method: 'Agency Grid', driver: 'Rep assessment + PMR', badge: 'text-amber-700 bg-amber-50', accent: 'text-amber-700' },
};

export const S08_SegmentInsights: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentMarket, currentBrand, currentPersona, proposals } = useAppStore();

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

  // Segments are captured per brand; "All brands" falls back to the hero brand and says so
  const brand = currentBrand === 'ALL' ? 'AUR' : currentBrand;
  const scope = useMemo(() => ({ market: currentMarket, brand }), [currentMarket, brand]);
  const isMarketC = currentMarket === 'MKT_C';

  // Every derivation re-runs when proposals change, i.e. after approvals are written back to CRM
  const views = useMemo(() => buildCustomerViews(scope, proposals), [scope, proposals]);
  const profiles = useMemo(() => computeProfiles(views), [views]);
  const opportunity = useMemo(() => computeOpportunity(views, scope), [views, scope]);
  const migration = useMemo(() => computeMigration(views), [views]);
  const accountRows = useMemo(() => computeAccountRows(scope, proposals), [scope, proposals]);
  const crossMarket = useMemo(() => computeCrossMarket(brand, proposals), [brand, proposals]);
  const affinity = useMemo(() => computeChannelAffinity(views, scope), [views, scope]);
  const targeting = useMemo(() => computeTargeting(views, scope), [views, scope]);

  const sampleSize = views.length;
  const estimatedUniverse = profiles.reduce((acc, p) => acc + p.count, 0);
  const sampleNote = `Estimated from a ${formatNumber(sampleSize)}-HCP sample, scaled to ${formatNumber(estimatedUniverse)} HCPs${
    currentBrand === 'ALL' ? ' · Showing Aurelix — select a brand to change' : ''
  }.`;

  // 1. Profiles
  const abProfiles = profiles.filter((p) => p.code === 'A' || p.code === 'B');
  const abShare = abProfiles.reduce((acc, p) => acc + p.share, 0);
  const abCount = abProfiles.reduce((acc, p) => acc + p.count, 0);
  const abTrialOrBetter =
    abCount > 0 ? abProfiles.reduce((acc, p) => acc + p.count * (p.adoptingShare + p.trialShare), 0) / abCount : 0;

  // 2. Opportunity Matrix (rows: potential 4 = high … 1 = low)
  const matrixCells: MatrixCellData[] = opportunity.cells.map((c) => ({
    potential: c.potential,
    adoptionStage: c.adoptionStage,
    count: c.count,
    isOpportunityGap: c.isOpportunityGap,
    notes: c.isOpportunityGap ? 'Opportunity gap: potential 3–4 not yet past consideration' : undefined,
  }));

  // 3. Migration Sankey (only segments that carry flow, so empty nodes never render)
  const usedFrom = new Set(migration.flows.map((f) => f.from));
  const usedTo = new Set(migration.flows.map((f) => f.to));
  const sankeyNodes: SankeyNodeData[] = [
    ...SEGMENTS.filter((s) => usedFrom.has(s)).map((s) => ({ id: `prev_${s}`, name: `Cycle ${s}`, color: SEGMENT_COLORS[s] })),
    ...SEGMENTS.filter((s) => usedTo.has(s)).map((s) => ({ id: `curr_${s}`, name: `Living ${s}`, color: SEGMENT_COLORS[s] })),
  ];
  const sankeyLinks: SankeyLinkData[] = migration.flows.map((f) => ({
    source: `prev_${f.from}`,
    target: `curr_${f.to}`,
    value: f.count,
    color: SEGMENT_COLORS[f.to],
  }));

  // 4. Accounts
  const tier1 = accountRows.filter((a) => a.tier === 'Tier 1');
  const totalAccountPotential = accountRows.reduce((acc, a) => acc + a.potential, 0);
  const tier1PotentialShare = totalAccountPotential > 0 ? tier1.reduce((acc, a) => acc + a.potential, 0) / totalAccountPotential : 0;
  const listedAccounts = accountRows.filter((a) => a.accessStatus === 'Listed').length;

  const accountColumns: Column<AccountInsightRow>[] = [
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
          row.accessStatus === 'Listed'
            ? 'bg-teal-50 text-teal-700'
            : row.accessStatus === 'Restricted' || row.accessStatus === 'Under review'
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

  // 5. Cross-Market
  const [crossMarketStandardized, setCrossMarketStandardized] = useState<boolean>(true);

  // 6. Channel Affinity Heatmap (status banded relative to the strongest channel reach)
  const heatmapRows: HeatmapHeaderItem[] = SEGMENTS.map((s) => ({
    id: s,
    label: `Segment ${s} (${SEGMENT_DEFINITIONS[s].archetype.split(' / ')[0]})`,
  }));
  const heatmapCols: HeatmapHeaderItem[] = AFFINITY_CHANNELS.map((c) => ({ id: c.id, label: c.label }));
  const maxReach = Math.max(...affinity.map((c) => c.reachPct), 1);
  const heatmapCells: HeatmapCell[] = affinity.map((c) => ({
    rowId: c.segment,
    colId: c.channel,
    value: c.reachPct,
    displayValue: `${c.reachPct}%`,
    status: c.reachPct >= maxReach * 0.66 ? 'high' : c.reachPct >= maxReach * 0.33 ? 'medium' : 'low',
  }));
  const segBAffinity = affinity.filter((c) => c.segment === 'B').sort((a, b) => b.reachPct - a.reachPct);
  const channelLabel = (id: string) => AFFINITY_CHANNELS.find((c) => c.id === id)?.label ?? id;

  // 7. Targeting Alignment
  const targetingSeries: BarSeries[] = [
    { dataKey: 'currentCalls', name: 'Calls Delivered (Last 90 Days)', color: '#94A3B8' },
    { dataKey: 'recommendedCalls', name: 'Living Aligned Recommendation', color: '#0E7C86' },
  ];
  const abShift = targeting.abShareRecommended - targeting.abShareCurrent;

  if (sampleSize === 0 && currentTab !== 'accounts' && currentTab !== 'cross-market') {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <PageHeader title="Segment Insights" question="What do our segments tell us?" />
        <Tabs tabs={visibleTabs} activeTab={currentTab} onChange={handleTabChange} />
        <EmptyState
          title="No segment assignments for this brand in this market"
          description="This brand is not commercialised in the selected market. Choose another market or brand."
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Segment Insights"
        question="What do our segments tell us?"
      />

      {/* Tabs */}
      <Tabs tabs={visibleTabs} activeTab={currentTab} onChange={handleTabChange} />

      {currentTab !== 'accounts' && currentTab !== 'cross-market' && (
        <p className="text-xs text-slate-500 -mt-2">{sampleNote}</p>
      )}

      {/* TAB 1: PROFILES */}
      {currentTab === 'profiles' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {profiles.map((item) => (
              <div
                key={item.code}
                className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs flex flex-col justify-between"
                style={{ borderTop: `4px solid ${SEGMENT_COLORS[item.code]}` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">Segment {item.code}</span>
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
                      <div className="font-semibold text-navy-900">{SEGMENT_DEFINITIONS[item.code].archetype}</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Avg Potential:</span>
                      <div className="font-mono text-slate-700">{item.avgPotential.toFixed(1)} / 4.0</div>
                    </div>
                    <div>
                      <span className="text-slate-500">Adoption Mix:</span>
                      <div className="text-slate-600 font-mono text-2xs">
                        {formatPercent(item.adoptingShare)} Adopting · {formatPercent(item.trialShare)} Trial · {formatPercent(item.earlierShare)} Earlier
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-500">Top Channel Preference:</span>
                      <div className="text-slate-600 font-mono text-2xs">
                        {item.topChannels.map((c) => `${formatPercent(c.share)} ${c.value}`).join(' · ') || '—'}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500">Median Segment Age:</span>
                      <SegmentAgeChip days={item.medianAgeDays} />
                    </div>
                  </div>
                </div>

                <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 italic">
                  {SEGMENT_DEFINITIONS[item.code].description}
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
                  Segments A and B hold {formatPercent(abShare)} of prescribers ({formatNumber(abCount)} HCPs);{' '}
                  {formatPercent(abTrialOrBetter)} of them are already in Trial or beyond.
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
              value={`${formatNumber(opportunity.gapCount)} HCPs`}
              delta={{
                value: 'Potential 3–4 · not past Consideration',
                direction: 'up',
                isPositive: true,
              }}
              tooltip="Prescribers with potential 3 or 4 who remain in Unaware, Aware or Consideration stage"
            />
            <KpiTile
              label="Gap Without a Call in 90 Days"
              value={`${formatNumber(opportunity.gapUncontacted)} HCPs`}
              delta={{ value: 'No completed F2F or remote call', direction: 'neutral' }}
              tooltip="Opportunity-gap HCPs with no completed in-person or remote call since 2026-07-17"
            />
            <KpiTile
              label="Gap at Formulary-Listed Accounts"
              value={`${formatNumber(opportunity.gapAtListedAccounts)} HCPs`}
              delta={{ value: 'Access unlocked at primary account', direction: 'up', isPositive: true }}
              tooltip="Opportunity-gap HCPs whose primary account lists the brand on formulary"
            />
          </div>

          <Matrix4x4
            title="Potential × Adoption Opportunity Matrix"
            soWhat="Prescribers with potential 3–4 still in Awareness or Consideration are the highest-yield growth candidates."
            xAxisLabel="Adoption Stage"
            yAxisLabel="Prescriber Potential"
            data={matrixCells}
            potentialLabels={['Potential 4 (High)', 'Potential 3', 'Potential 2', 'Potential 1 (Low)']}
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
              label="Upgraded Since Planning Cycle"
              value={`+${formatNumber(migration.upgraded)} HCPs`}
              delta={{ value: 'Living changes written back to CRM', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Downgraded Since Planning Cycle"
              value={`-${formatNumber(migration.downgraded)} HCPs`}
              delta={{ value: 'Effort released for redeployment', direction: 'down', isPositive: true }}
            />
            <KpiTile
              label="Segment Stability Index"
              value={formatPercent(migration.stabilityIndex)}
              delta={{ value: '1 − customers changed ÷ customers', direction: 'neutral' }}
            />
          </div>

          <Sankey
            title="Segment Movement: Planning-Cycle Assignment → Living Active (After Write-Back)"
            soWhat={
              migration.upgraded + migration.downgraded > 0
                ? 'Approved living changes move prescribers between segments without waiting for the annual review cycle.'
                : 'No segment changes written back yet for this scope — approve and publish proposals to see movement.'
            }
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
              value={formatNumber(accountRows.length)}
              delta={{ value: 'Hospitals, clinics & IDNs (sample)', direction: 'neutral' }}
            />
            <KpiTile
              label="Tier 1 Strategic Accounts"
              value={tier1.length}
              delta={{ value: `Holding ${formatPercent(tier1PotentialShare)} of account potential`, direction: 'neutral' }}
            />
            <KpiTile
              label="Formulary-Listed Accounts"
              value={`${listedAccounts} Accounts`}
              delta={{ value: 'Listed status for the selected brand', direction: 'up', isPositive: true }}
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
            {crossMarket.map((entry) => {
              const meta = MARKET_META[entry.market];
              return (
                <div key={entry.market} className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="font-semibold text-navy-900">{meta.name}</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded ${meta.badge}`}>{meta.method}</span>
                  </div>
                  {!entry.available ? (
                    <p className="mt-4 text-xs text-slate-500">Brand not commercialised in this market.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {entry.segments.map((seg) => (
                        <div key={seg.code} className="p-3 bg-slate-50 rounded border border-slate-100">
                          <div className="text-xs text-slate-500 font-medium">Mapped Representation</div>
                          <div className={`text-body font-bold mt-0.5 ${meta.accent}`}>
                            {crossMarketStandardized
                              ? `Segment ${seg.code} · ${SEGMENT_DEFINITIONS[seg.code].archetype.split(' / ')[0]}`
                              : `Local value: ${seg.localLabel ?? 'Unmapped'}`}
                          </div>
                          <div className="text-xs text-slate-600 mt-1 font-mono">
                            {formatPercent(seg.share)} Universe · {seg.avgPotential.toFixed(1)} Avg Potential · {meta.driver}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
                Segment × Channel Cross-Segmentation
              </h4>
              <p className="text-body-sm text-indigo-800 mt-1">
                Segment B prescribers are most often reached through {channelLabel(segBAffinity[0]?.channel)} ({segBAffinity[0]?.reachPct ?? 0}%)
                and {channelLabel(segBAffinity[1]?.channel)} ({segBAffinity[1]?.reachPct ?? 0}%). Combining value segment with channel
                reach lets the field team plan hybrid engagement rather than relying purely on in-person visits.
              </p>
            </div>
          </div>

          <Heatmap
            title="Segment × Channel Reach Heatmap"
            soWhat="Share of HCPs in each segment engaged at least once per channel — calls in the last 90 days, digital in the last 6 months."
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
              label="Effort Share on Segments A + B"
              value={`${formatPercent(targeting.abShareRecommended)}`}
              delta={{
                value: `${abShift >= 0 ? '+' : ''}${formatPercent(abShift)} vs ${formatPercent(targeting.abShareCurrent)} delivered`,
                direction: abShift >= 0 ? 'up' : 'down',
                isPositive: abShift >= 0,
              }}
            />
            <KpiTile
              label="Calls Redirected from Segments D/E"
              value={`${formatNumber(targeting.callsRedirectedFromDE)} Calls`}
              delta={{ value: 'Per 90 days, at constant call capacity', direction: 'down', isPositive: true }}
            />
            <KpiTile
              label="Downstream Consumer Sync"
              value={`${targeting.downstreamConsumers.length} Systems`}
              delta={{ value: targeting.downstreamConsumers.join(', ') || 'None in scope', direction: 'neutral' }}
            />
          </div>

          <BarChartComponent
            title="Sales Force Effort Alignment: Delivered Calls vs Living Recommended"
            soWhat="The same call capacity re-allocated by current segment size and segment priority weights (A 5 · B 4 · C 2 · D 1 · E 0.25)."
            xAxisLabel="Segment Tier"
            yAxisLabel="Completed F2F + Remote Calls (90 Days)"
            data={targeting.rows.map((r) => ({ ...r, segment: `Segment ${r.segment}` }))}
            series={targetingSeries}
            height={340}
          />

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 flex items-center justify-between">
            <span>
              Recommendations recompute after each CRM write-back and feed Call Planning targets downstream.
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
