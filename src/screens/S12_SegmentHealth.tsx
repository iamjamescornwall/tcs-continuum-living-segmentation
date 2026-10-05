import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  FileSpreadsheet,
  Info,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { KpiTile } from '../components/ui/KpiTile';
import { SegmentAgeChip } from '../components/ui/SegmentAgeChip';
import { DataTable, Column } from '../components/ui/DataTable';
import { BarChartComponent, BarSeries } from '../components/charts/BarChart';
import { LineChartComponent, LineSeries } from '../components/charts/LineChart';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { formatNumber, formatPercent, formatDaysAge } from '../utils/formatters';

export const S12_SegmentHealth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'standardisation';

  const { currentMarket, proposals } = useAppStore();
  const fullAggregates = dataService.getFullAggregatesData();
  const marketAgg = dataService.getAggregates(currentMarket);

  const hcps = dataService.getHcps({ market: currentMarket });
  const accounts = dataService.getAccounts({ market: currentMarket });

  // Handle Tab Switching
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'standardisation', label: 'Standardisation' },
    { id: 'age', label: 'Age & Freshness' },
    { id: 'pipeline', label: 'Pipeline KPIs' },
    { id: 'time-to-update', label: 'Time to Update' },
    { id: 'field-trust', label: 'Field Trust' },
  ];

  // 1. Standardisation Data
  const standardisationData = [
    {
      marketCode: 'MKT_A',
      name: 'Market A',
      profile: 'Data-rich',
      dimensionsMapped: '71%',
      processType: 'In-house K-Means Model',
      refreshCadence: 'Quarterly refresh + continuous scoring',
      comparability: 'High',
      statusColor: 'teal',
      details: 'Prescriber-level claims and Rx data directly available. High alignment with global A–E segments.',
    },
    {
      marketCode: 'MKT_B',
      name: 'Market B',
      profile: 'Signal-enriched',
      dimensionsMapped: '65%',
      processType: 'Commercial Platform (Deciling + Behavioural)',
      refreshCadence: 'Annual refresh + rep adjustments',
      comparability: 'Moderate',
      statusColor: 'indigo',
      details: 'Brick-level sales, rich CRM notes and digital telemetry. Decile definitions mapped to global standard.',
    },
    {
      marketCode: 'MKT_C',
      name: 'Market C',
      profile: 'Survey-led / manual',
      dimensionsMapped: '42%',
      processType: 'Local Agency Excel File',
      refreshCadence: 'Annual PMR survey + field judgement',
      comparability: 'Low (Pre-intake)',
      statusColor: 'amber',
      details: 'No HCP-level sales. Uses proprietary agency survey tiers. Requires S05 AI Data Intake to map to global standard.',
    },
  ];

  // 2. Oldest Segments Table Data
  type StaleRecord = {
    id: string;
    name: string;
    type: 'HCP' | 'HCO';
    market: string;
    specialtyOrArchetype: string;
    currentSegment: string;
    ageDays: number;
    lastRefreshed: string;
  };

  const oldestSegments: StaleRecord[] = useMemo(() => {
    const list: StaleRecord[] = [];
    hcps.forEach((h) => {
      // Find matching proposal or generate mock age relative to demo
      const prop = proposals.find((p) => p.customer_id === h.hcp_id);
      const age = prop ? prop.segment_age_days : h.market_code === 'MKT_C' ? 330 : h.market_code === 'MKT_B' ? 210 : 75;
      list.push({
        id: h.hcp_id,
        name: h.display_name,
        type: 'HCP',
        market: h.market_code,
        specialtyOrArchetype: h.specialty,
        currentSegment: prop ? prop.current_value : 'Segment B',
        ageDays: age,
        lastRefreshed: age > 180 ? '2025-11-10' : '2026-05-14',
      });
    });

    accounts.forEach((a) => {
      const prop = proposals.find((p) => p.customer_id === a.hco_id);
      const age = prop ? prop.segment_age_days : a.market_code === 'MKT_C' ? 310 : a.market_code === 'MKT_B' ? 185 : 80;
      list.push({
        id: a.hco_id,
        name: a.name,
        type: 'HCO',
        market: a.market_code,
        specialtyOrArchetype: a.archetype,
        currentSegment: prop ? prop.current_value : a.archetype,
        ageDays: age,
        lastRefreshed: age > 180 ? '2025-12-01' : '2026-04-20',
      });
    });

    // Sort descending by age, hero records still prominent
    return list.sort((a, b) => b.ageDays - a.ageDays).slice(0, 15);
  }, [hcps, accounts, proposals]);

  const staleColumns: Column<StaleRecord>[] = [
    {
      key: 'name',
      header: 'Customer',
      render: (row) => (
        <div>
          <div className="font-medium text-navy-900">{row.name}</div>
          <div className="text-xs text-slate-500 font-mono">{row.id} · {row.market}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {row.type}
        </span>
      ),
    },
    {
      key: 'specialtyOrArchetype',
      header: 'Specialty / Archetype',
    },
    {
      key: 'currentSegment',
      header: 'Current Segment',
      render: (row) => (
        <span className="font-medium text-navy-900">{row.currentSegment}</span>
      ),
    },
    {
      key: 'ageDays',
      header: 'Segment Age',
      render: (row) => <SegmentAgeChip days={row.ageDays} />,
    },
    {
      key: 'lastRefreshed',
      header: 'Last Refreshed',
      render: (row) => (
        <span className="font-mono text-xs text-slate-600">{row.lastRefreshed}</span>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/customer/${row.type.toLowerCase()}/${row.id}`);
          }}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          <span>Customer 360</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  // 3. Time to Update Chart Data
  const timeToUpdateData = [
    {
      market: 'Market A (Data-rich)',
      legacy: fullAggregates.markets.MKT_A.time_to_update_days.baseline,
      living: fullAggregates.markets.MKT_A.time_to_update_days.current,
    },
    {
      market: 'Market B (Signal-enriched)',
      legacy: fullAggregates.markets.MKT_B.time_to_update_days.baseline,
      living: fullAggregates.markets.MKT_B.time_to_update_days.current,
    },
    {
      market: 'Market C (Survey-led)',
      legacy: fullAggregates.markets.MKT_C.time_to_update_days.baseline,
      living: fullAggregates.markets.MKT_C.time_to_update_days.current,
    },
    {
      market: 'Global Average',
      legacy: fullAggregates.markets.ALL.time_to_update_days.baseline,
      living: fullAggregates.markets.ALL.time_to_update_days.current,
    },
  ];

  const timeSeries: BarSeries[] = [
    { dataKey: 'legacy', name: 'Legacy Planning Cycle (Days)', color: '#94A3B8' },
    { dataKey: 'living', name: 'Continuum Living Loop (Days)', color: '#0E7C86' },
  ];

  // 4. Pipeline Trend Line Data (30-day weekly buckets)
  const pipelineTrendData = [
    { period: 'Week 1', events: 280, flags: 70, proposals: 42, approved: 22 },
    { period: 'Week 2', events: 310, flags: 82, proposals: 48, approved: 26 },
    { period: 'Week 3', events: 325, flags: 78, proposals: 46, approved: 24 },
    { period: 'Week 4', events: 325, flags: 82, proposals: 50, approved: 25 },
  ];

  const pipelineSeries: LineSeries[] = [
    { dataKey: 'events', name: 'Signal Events', color: '#0E7C86' },
    { dataKey: 'flags', name: 'Drift Flags', color: '#3CA5AE' },
    { dataKey: 'proposals', name: 'Proposals', color: '#E9B44C' },
    { dataKey: 'approved', name: 'Approved', color: '#8A6D1F' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Segment Health & Governance"
        question="Are our segments current and trusted?"
      />

      {/* Navigation Tabs */}
      <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* TAB 1: STANDARDISATION */}
      {currentTab === 'standardisation' && (
        <div className="space-y-6">
          {/* Hero Step 1 Callout Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-body font-semibold text-amber-900">
                Hero Storyline — Step 1: The Cross-Market Problem
              </h4>
              <p className="text-body-sm text-amber-800 mt-1">
                &ldquo;Three markets, three processes — segments cannot be compared until mapped to the global standard.&rdquo;
                Without standardisation, headquarters has no comparable view of prescriber potential or brand momentum across launch markets.
              </p>
            </div>
          </div>

          {/* Market Process Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {standardisationData.map((item) => (
              <div
                key={item.marketCode}
                className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-section-title text-navy-900">{item.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {item.profile}
                    </span>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">Process Archetype</div>
                      <div className="text-body-sm font-semibold text-navy-900 mt-0.5">{item.processType}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 font-medium">Refresh Cadence</div>
                      <div className="text-body-sm text-slate-700 mt-0.5">{item.refreshCadence}</div>
                    </div>

                    <div>
                      <div className="text-xs text-slate-500 font-medium">Dimensions Mapped</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.marketCode === 'MKT_A'
                                ? 'bg-teal-600'
                                : item.marketCode === 'MKT_B'
                                ? 'bg-indigo-600'
                                : 'bg-amber-600'
                            }`}
                            style={{ width: item.dimensionsMapped }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-navy-900">
                          {item.dimensionsMapped}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500">Cross-Market Comparability</div>
                      <div className="text-body-sm font-medium text-navy-900 mt-0.5 flex items-center justify-between">
                        <span>{item.comparability}</span>
                        {item.marketCode === 'MKT_C' && (
                          <span className="text-xs text-rust-600 font-medium">Needs Intake</span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-100">
                      {item.details}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  {item.marketCode === 'MKT_C' ? (
                    <button
                      onClick={() => navigate('/intake')}
                      className="w-full py-1.5 px-3 bg-amber-600 text-white rounded text-xs font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Onboard Market C in Data Intake</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/standards')}
                      className="w-full py-1.5 px-3 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>View Dimension Catalogue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cross-Market Comparison CTA */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 flex items-center justify-between">
            <div>
              <h4 className="text-body font-semibold text-navy-900">
                Continue Hero Step 1: Compare Normalized Segments
              </h4>
              <p className="text-body-sm text-slate-600 mt-0.5">
                Inspect how local definitions translate to the unified global A–E standard in Segment Insights.
              </p>
            </div>
            <button
              onClick={() => navigate('/insights?tab=cross-market')}
              className="px-4 py-2 bg-navy-900 text-white text-body-sm font-medium rounded-md hover:bg-navy-700 transition-colors flex items-center gap-2 shrink-0"
            >
              <span>Open Cross-Market Insights</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: AGE & FRESHNESS */}
      {currentTab === 'age' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Median Segment Age"
              value={formatDaysAge(marketAgg.segment_age.median_days)}
              delta={{ value: 'Target: <90 days', direction: 'neutral' }}
            />
            <KpiTile
              label="Stale Segments (>180d)"
              value={formatPercent(marketAgg.segment_age.pct_stale_180)}
              delta={{
                value: marketAgg.segment_age.pct_stale_180 > 0.5 ? 'Critical in Market C' : 'Under Control',
                direction: marketAgg.segment_age.pct_stale_180 > 0.5 ? 'up' : 'down',
                isPositive: marketAgg.segment_age.pct_stale_180 <= 0.3,
              }}
            />
            <KpiTile
              label="Active Living Loop Coverage"
              value={formatPercent(1 - marketAgg.segment_age.pct_stale_180)}
              delta={{ value: '+24% since living loop inception', direction: 'up', isPositive: true }}
            />
          </div>

          {/* Stale Segments Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Oldest Customer Segments Requiring Verification</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customers whose segmentation attributes have not undergone review in &gt;180 days. Click row to inspect Customer 360.
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Prioritised for Review
              </span>
            </div>
            <DataTable
              data={oldestSegments}
              columns={staleColumns}
              rowKey={(row) => row.id}
              onRowClick={(row) => navigate(`/customer/${row.type.toLowerCase()}/${row.id}`)}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE KPIS */}
      {currentTab === 'pipeline' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiTile
              label="Signal Events (30d)"
              value={formatNumber(marketAgg.pipeline_30d.change_events)}
              delta={{ value: 'Claims, Rx, Notes, CRM', direction: 'neutral' }}
            />
            <KpiTile
              label="Drift Detection Flags"
              value={formatNumber(marketAgg.pipeline_30d.drift_flags)}
              delta={{ value: 'Confidence >= 0.70', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Proposals Generated"
              value={formatNumber(marketAgg.pipeline_30d.proposals)}
              delta={{ value: `${marketAgg.pipeline_30d.held} held by stability rules`, direction: 'neutral' }}
            />
            <KpiTile
              label="Field Acceptance Rate"
              value={formatPercent(marketAgg.acceptance_rate)}
              delta={{ value: 'Target: >75%', direction: 'up', isPositive: true }}
            />
          </div>

          <LineChartComponent
            title="Living Loop Pipeline Activity (Weekly Trends)"
            soWhat="Steady event intake and drift filtering ensures commercial leads review only high-confidence material moves."
            xAxisLabel="Week"
            yAxisLabel="Volume Count"
            data={pipelineTrendData}
            series={pipelineSeries}
            height={320}
          />
        </div>
      )}

      {/* TAB 4: TIME TO UPDATE */}
      {currentTab === 'time-to-update' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <KpiTile
              label="Global Median Time to Update"
              value="12 Days"
              delta={{
                value: 'Down from 148 days legacy cycle',
                direction: 'down',
                isPositive: true,
              }}
              tooltip="Days elapsed from material signal detection to approved CRM write-back"
            />
            <KpiTile
              label="Approval Cycle Duration"
              value={`${marketAgg.approval_cycle_days} Days`}
              delta={{
                value: 'Median human review speed',
                direction: 'down',
                isPositive: true,
              }}
              tooltip="Days a proposal stays in Review Queue before owner sign-off"
            />
          </div>

          <BarChartComponent
            title="Time to Update: Legacy Planning Cycle vs Continuum Living Loop"
            soWhat="Living segmentation reduces customer attribute latency by over 90% across every market data tier."
            xAxisLabel="Market Archetype"
            yAxisLabel="Days to Update CRM"
            data={timeToUpdateData}
            series={timeSeries}
            height={320}
          />
        </div>
      )}

      {/* TAB 5: FIELD TRUST */}
      {currentTab === 'field-trust' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Commercial Acceptance Rate"
              value={formatPercent(marketAgg.acceptance_rate)}
              delta={{ value: '+12% vs initial rollout', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Field Override Rate"
              value={formatPercent(marketAgg.override_rate.after)}
              delta={{
                value: `Reduced from ${formatPercent(marketAgg.override_rate.before)}`,
                direction: 'down',
                isPositive: true,
              }}
            />
            <KpiTile
              label="Field Trust Index"
              value="8.4 / 10"
              delta={{ value: 'Quarterly field survey', direction: 'up', isPositive: true }}
            />
          </div>

          {/* Top Rejection Reasons Breakdown */}
          <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs">
            <h3 className="text-section-title text-navy-900">Top Rejection Reasons (Governance Feedback Loop)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              When reps or back office reject a proposal, mandatory structured reasons feed Model Recalibration (S13) without automated retraining.
            </p>

            <div className="mt-4 space-y-3">
              {[
                { reason: 'Field knowledge contradicts signal', count: 46, pct: '46%' },
                { reason: 'Temporary customer behaviour', count: 28, pct: '28%' },
                { reason: 'Data quality issue or lag', count: 14, pct: '14%' },
                { reason: 'Freeze period / compliance', count: 8, pct: '8%' },
                { reason: 'Other structured operational cause', count: 4, pct: '4%' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-body-sm">
                  <span className="text-navy-900 font-medium w-1/3">{item.reason}</span>
                  <div className="w-1/2 bg-slate-100 rounded-full h-2.5 mx-4">
                    <div
                      className="bg-rust-500 h-2.5 rounded-full"
                      style={{ width: item.pct }}
                    />
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-700 w-16 text-right">
                    {item.pct}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Inspect how rejected feedback shapes recalibration thresholds
              </span>
              <button
                onClick={() => navigate('/audit?tab=recalibration')}
                className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Open Recalibration in Audit &amp; Learning</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default S12_SegmentHealth;
