import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { KpiTile } from '../components/ui/KpiTile';
import { BarChartComponent, BarSeries } from '../components/charts/BarChart';
import { Funnel, FunnelStage } from '../components/charts/Funnel';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { formatNumber, formatPercent, formatDaysAge } from '../utils/formatters';

export const S01_ExecutiveCockpit: React.FC = () => {
  const navigate = useNavigate();
  const { currentMarket, currentBrand, currentPersona, proposals, publishLog } = useAppStore();

  const fullAggregates = dataService.getFullAggregatesData();
  const marketAgg = dataService.getAggregates(currentMarket);

  // Compute live proposals and published counters from store
  const marketProposals = proposals.filter((p) => {
    const mMatch = currentMarket === 'ALL' || p.market_code === currentMarket;
    const bMatch = currentBrand === 'ALL' || p.brand_code === currentBrand;
    return mMatch && bMatch;
  });

  const liveApprovedCount = marketProposals.filter(
    (p) => p.status === 'Approved' || p.status === 'Written back'
  ).length;

  const liveHeldCount = marketProposals.filter((p) => p.status === 'Held').length;

  const liveWrittenBackCount = publishLog.reduce((acc, log) => {
    if (currentMarket === 'ALL' || log.market_code === currentMarket) {
      return acc + log.records_written;
    }
    return acc;
  }, 0);

  // Pipeline metrics combining baseline + store actions
  const totalApproved = marketAgg.pipeline_30d.approved + (liveApprovedCount > 3 ? liveApprovedCount - 3 : 0);
  const totalWrittenBack =
    marketAgg.pipeline_30d.written_back + (liveWrittenBackCount > 0 ? liveWrittenBackCount : 0);

  // Row 1 KPI Calculations
  const histogram = marketAgg.segment_age.histogram;
  const currentCount = (histogram.find((h) => h.range === '<30d')?.count || 0) +
    (histogram.find((h) => h.range === '30-90d')?.count || 0);
  const currentPct = marketAgg.hcp_universe > 0 ? currentCount / marketAgg.hcp_universe : 0.51;

  // Age by market stacked bar chart data
  const ageBarData = [
    {
      market: 'Market A (Data-rich)',
      code: 'MKT_A',
      current: fullAggregates.markets.MKT_A.segment_age.histogram[0].count +
        fullAggregates.markets.MKT_A.segment_age.histogram[1].count,
      aging: fullAggregates.markets.MKT_A.segment_age.histogram[2].count,
      stale: fullAggregates.markets.MKT_A.segment_age.histogram[3].count,
    },
    {
      market: 'Market B (Signal-enriched)',
      code: 'MKT_B',
      current: fullAggregates.markets.MKT_B.segment_age.histogram[0].count +
        fullAggregates.markets.MKT_B.segment_age.histogram[1].count,
      aging: fullAggregates.markets.MKT_B.segment_age.histogram[2].count,
      stale: fullAggregates.markets.MKT_B.segment_age.histogram[3].count,
    },
    {
      market: 'Market C (Survey-led)',
      code: 'MKT_C',
      current: fullAggregates.markets.MKT_C.segment_age.histogram[0].count +
        fullAggregates.markets.MKT_C.segment_age.histogram[1].count,
      aging: fullAggregates.markets.MKT_C.segment_age.histogram[2].count,
      stale: fullAggregates.markets.MKT_C.segment_age.histogram[3].count,
    },
  ];

  const ageBarSeries: BarSeries[] = [
    { dataKey: 'current', name: '<90 days (Current)', color: '#0E7C86', stackId: 'age' },
    { dataKey: 'aging', name: '90–180 days (Aging)', color: '#E9B44C', stackId: 'age' },
    { dataKey: 'stale', name: '>180 days (Stale)', color: '#B03A2E', stackId: 'age' },
  ];

  // Living Loop Funnel Data
  const funnelStages: FunnelStage[] = [
    {
      name: '1. Signal Watch',
      count: marketAgg.pipeline_30d.change_events,
      subtext: 'Observed signal events (claims, Rx, CRM, digital, notes)',
      color: '#0E7C86',
    },
    {
      name: '2. Drift Detection',
      count: marketAgg.pipeline_30d.drift_flags,
      subtext: 'ML flags exceeding market volatility thresholds',
      color: '#3CA5AE',
    },
    {
      name: '3. Proposal & Routing',
      count: marketAgg.pipeline_30d.proposals,
      subtext: 'Explanations grounded in drivers routed to named owners',
      color: '#E9B44C',
      holdCount: liveHeldCount > 0 ? liveHeldCount : marketAgg.pipeline_30d.held,
    },
    {
      name: '4. Human Decisions',
      count: totalApproved,
      subtext: 'Approved by authorized commercial lead (100% human gate)',
      color: '#8A6D1F',
    },
    {
      name: '5. Written Back',
      count: totalWrittenBack,
      subtext: 'Pushed to CRM and downstream orchestration',
      color: '#0E7C86',
    },
  ];

  const handleExport = () => {
    const csvContent = [
      'Market,Universe HCPs,Universe Accounts,Median Segment Age (Days),Current (<90d) %,Stale (>180d) %,Change Events,Drift Flags,Proposals,Approved,Written Back,Unapproved Write-backs',
      `Market A,${fullAggregates.markets.MKT_A.hcp_universe},${fullAggregates.markets.MKT_A.account_universe},${fullAggregates.markets.MKT_A.segment_age.median_days},70%,12%,${fullAggregates.markets.MKT_A.pipeline_30d.change_events},${fullAggregates.markets.MKT_A.pipeline_30d.drift_flags},${fullAggregates.markets.MKT_A.pipeline_30d.proposals},${fullAggregates.markets.MKT_A.pipeline_30d.approved},${fullAggregates.markets.MKT_A.pipeline_30d.written_back},0`,
      `Market B,${fullAggregates.markets.MKT_B.hcp_universe},${fullAggregates.markets.MKT_B.account_universe},${fullAggregates.markets.MKT_B.segment_age.median_days},29%,58%,${fullAggregates.markets.MKT_B.pipeline_30d.change_events},${fullAggregates.markets.MKT_B.pipeline_30d.drift_flags},${fullAggregates.markets.MKT_B.pipeline_30d.proposals},${fullAggregates.markets.MKT_B.pipeline_30d.approved},${fullAggregates.markets.MKT_B.pipeline_30d.written_back},0`,
      `Market C,${fullAggregates.markets.MKT_C.hcp_universe},${fullAggregates.markets.MKT_C.account_universe},${fullAggregates.markets.MKT_C.segment_age.median_days},10%,81%,${fullAggregates.markets.MKT_C.pipeline_30d.change_events},${fullAggregates.markets.MKT_C.pipeline_30d.drift_flags},${fullAggregates.markets.MKT_C.pipeline_30d.proposals},${fullAggregates.markets.MKT_C.pipeline_30d.approved},${fullAggregates.markets.MKT_C.pipeline_30d.written_back},0`,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `continuum_executive_cockpit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Cockpit"
        question="Is segmentation healthy and worth it?"
        actions={
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-body-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
            title={currentPersona === 'P6' ? 'Executive Export enabled' : 'Export executive summary'}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        }
      />

      {/* Row 1: KPI Tiles (Max 4) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile
          label="Segments Current (<90d)"
          value={formatPercent(currentPct)}
          delta={{
            value: '+14.2% vs baseline',
            direction: 'up',
            isPositive: true,
          }}
          tooltip="Proportion of customer segments updated or confirmed within the last 90 days"
        />

        <KpiTile
          label="Median Segment Age"
          value={formatDaysAge(marketAgg.segment_age.median_days)}
          delta={{
            value: `${marketAgg.time_to_update_days.baseline - marketAgg.time_to_update_days.current}d cycle reduction`,
            direction: 'down',
            isPositive: true,
          }}
          tooltip="Median age of current active segment assignments across customer universe"
        />

        <KpiTile
          label="Proposals Approved (Q4)"
          value={formatNumber(totalApproved)}
          delta={{
            value: `${liveApprovedCount} live decisions in session`,
            direction: 'up',
            isPositive: true,
          }}
          tooltip="Customer segment changes formally verified and approved by commercial owners"
        />

        <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-slate-500 font-medium">Unapproved Write-Backs</span>
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-teal-50 text-teal-600">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-navy-900">0</span>
            <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              100% Governed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Strict human approval gate enforced before CRM sync.
          </p>
        </div>
      </div>

      {/* Row 2: Charts (Max 2 above the fold) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChartComponent
          title="Segment Freshness Distribution by Market"
          soWhat="Market C exhibits 81% stale segments under manual annual cycle; Market A maintains continuous freshness."
          xAxisLabel="Market"
          yAxisLabel="HCP Universe Count"
          data={ageBarData}
          series={ageBarSeries}
          height={300}
        />

        <Funnel
          title="Living Loop Pipeline Funnel (30-Day Window)"
          soWhat="From 1,240 change events detected by autonomous agent watch, 97 verified changes were published to CRM."
          xAxisLabel="Pipeline Stage"
          yAxisLabel="Volume"
          stages={funnelStages}
          onStageClick={(stage) => {
            if (stage.name.includes('Watch')) navigate('/changes');
            else if (stage.name.includes('Drift')) navigate('/changes');
            else if (stage.name.includes('Proposal')) navigate('/review-queue');
            else if (stage.name.includes('Human')) navigate('/review-queue');
            else if (stage.name.includes('Written')) navigate('/publish');
          }}
        />
      </div>

      {/* Row 3: Market Maturity Strip & Value Link */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Market A Card */}
        <div
          onClick={() => navigate('/market-data')}
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-teal-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Market A · Data-rich
              </span>
              <span className="text-xs text-slate-500 font-mono">8,000 HCPs</span>
            </div>
            <h4 className="text-body font-semibold text-navy-900 mt-2">In-House K-Means</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              HCP-level Rx & claims with near-continuous rescoring and rules overlay.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Refresh: <strong>Continuous</strong></span>
            <span className="text-teal-700 font-medium">71% Conformance</span>
          </div>
        </div>

        {/* Market B Card */}
        <div
          onClick={() => navigate('/market-data')}
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Market B · Signal-enriched
              </span>
              <span className="text-xs text-slate-500 font-mono">4,000 HCPs</span>
            </div>
            <h4 className="text-body font-semibold text-navy-900 mt-2">Rules + Behavioural</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              Brick-level sales, rich CRM activity, consented digital and rep notes.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Refresh: <strong>Event-driven</strong></span>
            <span className="text-indigo-700 font-medium">65% Conformance</span>
          </div>
        </div>

        {/* Market C Card */}
        <div
          onClick={() => navigate('/intake')}
          className="bg-white rounded-lg border border-slate-200 p-4 hover:border-rust-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                Market C · Survey-led
              </span>
              <span className="text-xs text-slate-500 font-mono">1,500 HCPs</span>
            </div>
            <h4 className="text-body font-semibold text-navy-900 mt-2">Vendor PMR & Rep Grid</h4>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">
              No HCP sales. Yearly agency Excel spreadsheet with rep judgements.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Refresh: <strong>Annual Excel</strong></span>
            <span className="text-amber-700 font-medium">42% Conformance</span>
          </div>
        </div>

        {/* Value to Date Card */}
        <div
          onClick={() => navigate('/value-calculator')}
          className="bg-gradient-to-br from-navy-900 to-navy-700 text-white rounded-lg p-4 flex flex-col justify-between shadow-sm hover:ring-2 hover:ring-teal-500 transition-all cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/10 text-teal-300 border border-white/20">
                Living Loop ROI
              </span>
              <Sparkles className="w-4 h-4 text-gold-500" />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-white">$2.4M</span>
              <span className="text-xs text-slate-300 ml-1.5">estimated annualised</span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Captured across 420 rising prescribers + 3,100 wasted calls avoided.
            </p>
          </div>

          <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-xs font-medium text-teal-300">
            <span>Open Value Calculator</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default S01_ExecutiveCockpit;
