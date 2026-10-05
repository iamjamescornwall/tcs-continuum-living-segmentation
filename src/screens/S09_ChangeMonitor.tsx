import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Link as LinkIcon,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { PipelineFlow } from '../components/charts/PipelineFlow';
import { ConfidenceChip } from '../components/ui/ConfidenceChip';
import { AIBadge } from '../components/ui/AIBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { ChangeEvent, DriftFlag } from '../types';

export const S09_ChangeMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'pipeline';

  const { currentMarket, currentBrand, proposals, publishLog } = useAppStore();
  const marketAgg = dataService.getAggregates(currentMarket);

  const changeEvents = dataService.getChangeEvents({
    market: currentMarket,
    brand: currentBrand,
  });

  const driftFlags = dataService.getDriftFlags({
    market: currentMarket,
    brand: currentBrand,
  });

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'pipeline', label: '1. Architecture Pipeline' },
    { id: 'signal-feed', label: '2. Signal Feed' },
    { id: 'drift-flags', label: '3. Drift Flags' },
  ];

  // Compute live pipeline numbers
  const marketProposals = proposals.filter((p) => {
    const mMatch = currentMarket === 'ALL' || p.market_code === currentMarket;
    const bMatch = currentBrand === 'ALL' || p.brand_code === currentBrand;
    return mMatch && bMatch;
  });

  const getCustomerName = (id: string, type?: string) => {
    if (type === 'Account' || type === 'HCO' || id.startsWith('ACC-')) {
      return dataService.getAccountById(id)?.name || id;
    }
    return dataService.getHcpById(id)?.display_name || id;
  };

  const liveHeldCount = marketProposals.filter((p) => p.status === 'Held').length;

  const liveWrittenBackCount = publishLog.reduce((acc, log) => {
    if (currentMarket === 'ALL' || log.market_code === currentMarket) {
      return acc + log.records_written;
    }
    return acc;
  }, 0);

  const stageCounts = {
    events: marketAgg.pipeline_30d.change_events,
    flags: marketAgg.pipeline_30d.drift_flags,
    cards: marketAgg.pipeline_30d.explanations,
    proposals: marketAgg.pipeline_30d.proposals,
    holds: liveHeldCount > 0 ? liveHeldCount : marketAgg.pipeline_30d.held,
    writtenBack: marketAgg.pipeline_30d.written_back + liveWrittenBackCount,
  };

  // Signal Feed Columns
  const eventColumns: Column<ChangeEvent>[] = [
    {
      key: 'timestamp',
      header: 'Detected',
      render: (e) => <span className="font-mono text-xs text-slate-700">{e.detected_at.replace('T', ' ')}</span>,
    },
    {
      key: 'customer_id',
      header: 'Customer',
      render: (e) => (
        <div>
          <div className="font-semibold text-navy-900">{getCustomerName(e.customer_id, e.customer_type)}</div>
          <div className="text-2xs text-slate-500 font-mono">
            {e.customer_id} · {e.market_code} · {e.customer_type}
          </div>
        </div>
      ),
    },
    {
      key: 'signal_type',
      header: 'Signal Stream',
      render: (e) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {e.signal_type}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Observed Telemetry & AI Extraction',
      render: (e) => {
        const isHeroAcc = e.customer_id === 'ACC-B-001';
        const isHeroHcp = e.customer_id === 'HCP-B-0001';

        if (isHeroAcc) {
          return (
            <div className="space-y-1">
              <div className="text-xs font-semibold text-teal-800 flex items-center gap-1.5">
                <span>Formulary status upgraded to Preferred on Zentrova</span>
              </div>
              <div className="text-2xs text-slate-600 flex items-center gap-2">
                <span>Account pull-through unlocked</span>
                <button
                  onClick={() => navigate('/review-queue?filter=accounts')}
                  className="text-teal-600 font-bold hover:underline flex items-center gap-0.5"
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>Propagation: 5 affiliated HCPs eligible</span>
                </button>
              </div>
            </div>
          );
        }

        if (isHeroHcp && (e.detected_by === 'GenAI' || e.signal_type === 'Rep note')) {
          return (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AIBadge providerName="MockProvider" size="sm" />
                <span className="text-xs font-semibold text-navy-900">
                  {e.signal_type} · {e.direction} ({e.magnitude})
                </span>
              </div>
              <p className="text-xs italic text-slate-600">
                &ldquo;{e.description}&rdquo;
              </p>
            </div>
          );
        }

        return (
          <div>
            <div className="text-xs text-navy-900">{e.description}</div>
            <div className="text-2xs text-slate-500 font-mono mt-0.5">
              Source: {e.source_category} · Magnitude: {e.magnitude}
            </div>
          </div>
        );
      },
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (e) => (
        <button
          onClick={() => navigate(`/customer/${e.customer_type.toLowerCase() === 'hco' ? 'account' : e.customer_type.toLowerCase()}/${e.customer_id}`)}
          className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
        >
          <span>360</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  // Drift Flags Columns
  const flagColumns: Column<DriftFlag>[] = [
    {
      key: 'customer_id',
      header: 'Customer',
      render: (f) => (
        <div>
          <div className="font-semibold text-navy-900">{getCustomerName(f.customer_id, f.customer_type)}</div>
          <div className="text-2xs text-slate-500 font-mono">{f.customer_id} · {f.market_code}</div>
        </div>
      ),
    },
    {
      key: 'dimension_code',
      header: 'Governed Dimension',
      render: (f) => <span className="font-medium text-navy-900 text-xs">{f.dimension_code}</span>,
    },
    {
      key: 'threshold_vs_observed',
      header: 'Observed vs Market Threshold',
      render: (f) => (
        <div>
          <div className="text-xs font-mono font-bold text-navy-900">
            Shift: {f.current_value} &rarr; {f.indicated_value} (Score: {f.drift_score})
          </div>
          <div className="text-2xs text-slate-500 font-mono mt-0.5">
            Rule: {f.threshold_ref} · {f.independent_signal_count} signals
          </div>
        </div>
      ),
    },
    {
      key: 'ml_confidence',
      header: 'ML Confidence',
      render: (f) => (
        <div className="flex items-center gap-2">
          <ConfidenceChip confidence={f.confidence} />
          <span className="font-mono text-xs text-slate-500">Score: {(f.drift_score * 100).toFixed(0)}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Pipeline Routing',
      render: (f) => {
        const linkedProposal = proposals.find((p) => p.flag_ids?.includes(f.flag_id));
        const isHeld = linkedProposal?.status === 'Held';

        return (
          <div>
            {isHeld ? (
              <div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300">
                  Held: {linkedProposal?.policy_rule_ref || 'STAB-POLICY'}
                </span>
                <div className="text-2xs text-slate-500 mt-0.5">{linkedProposal?.hold_reason}</div>
              </div>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                Routed to Review Queue &rarr;
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Change Monitor"
        question="What changed, and is it material?"
      />

      <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* TAB 1: PIPELINE FLOW (SIGNATURE ARCHITECTURE SCREEN) */}
      {currentTab === 'pipeline' && (
        <div className="space-y-6">
          <PipelineFlow
            title="Living Segmentation Reference Pipeline Flow"
            soWhat="Stage 4 Human Gate guarantees that no AI or model output directly modifies governed CRM segments."
            xAxisLabel="Architecture Stage"
            yAxisLabel="Volume Count"
            counts={stageCounts}
            onStageClick={(stageId) => {
              if (stageId === 1) handleTabChange('signal-feed');
              else if (stageId === 2) handleTabChange('drift-flags');
              else if (stageId === 3 || stageId === 4) navigate('/review-queue');
              else if (stageId === 5) navigate('/publish');
            }}
          />
        </div>
      )}

      {/* TAB 2: SIGNAL FEED */}
      {currentTab === 'signal-feed' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Live Change Event Stream</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Continuously ingested telemetry across Rx, claims, CRM interactions and rep notes. Hero events pinned on top.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {changeEvents.length} events detected
              </span>
            </div>

            <DataTable
              data={changeEvents}
              columns={eventColumns}
              rowKey={(e) => e.event_id}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 3: DRIFT FLAGS */}
      {currentTab === 'drift-flags' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Drift Detection Flags</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Observed changes that cross market volatility thresholds. Checked against stability policy rules.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {driftFlags.length} drift flags
              </span>
            </div>

            <DataTable
              data={driftFlags}
              columns={flagColumns}
              rowKey={(f) => f.flag_id}
              pageSize={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default S09_ChangeMonitor;
