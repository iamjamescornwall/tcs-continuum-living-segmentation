import React, { useState, useMemo } from 'react';
import {
  Send,
  CheckCircle2,
  ArrowRight,
  Server,
  Target,
  PhoneCall,
  Zap,
  Radio,
  BarChart3,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { SegmentAgeChip } from '../components/ui/SegmentAgeChip';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { ConfirmChangeModal } from '../components/ui/ConfirmChangeModal';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import { dataService } from '../services/dataService';
import { Proposal, PublishLogEntry } from '../types';

export const S11_PublishToCrm: React.FC = () => {
  const {
    currentPersona,
    currentMarket,
    currentBrand,
    proposals,
    publishLog,
    publishToCrm,
    crmRecords,
  } = useAppStore();

  const isP2 = currentPersona === 'P2';
  const isP3 = currentPersona === 'P3';
  const canPublish = isP2 || isP3 || currentPersona === 'P1';

  // Approved proposals ready for publish
  const readyProposals = useMemo(() => {
    return proposals.filter((p) => {
      const matchMarket = currentMarket === 'ALL' || p.market_code === currentMarket;
      const matchBrand = currentBrand === 'ALL' || p.brand_code === currentBrand;
      return matchMarket && matchBrand && p.status === 'Approved';
    });
  }, [proposals, currentMarket, currentBrand]);

  const [selectedProposalIds, setSelectedProposalIds] = useState<string[]>(
    readyProposals.map((p) => p.proposal_id)
  );

  const [previewCustomerId, setPreviewCustomerId] = useState<string>(
    readyProposals.find((p) => p.customer_id === 'HCP-B-0001')?.customer_id ||
      readyProposals[0]?.customer_id ||
      'HCP-B-0001'
  );

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const getCustomerName = (p?: Proposal | null) => {
    if (!p) return 'Customer';
    if (p.customer_type === 'HCO' || p.customer_id.startsWith('ACC-')) {
      return dataService.getAccountById(p.customer_id)?.name || p.customer_id;
    }
    return dataService.getHcpById(p.customer_id)?.display_name || p.customer_id;
  };

  // Toggle selection
  const handleSelectAll = () => {
    if (selectedProposalIds.length === readyProposals.length) {
      setSelectedProposalIds([]);
    } else {
      setSelectedProposalIds(readyProposals.map((p) => p.proposal_id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedProposalIds.includes(id)) {
      setSelectedProposalIds(selectedProposalIds.filter((pId) => pId !== id));
    } else {
      setSelectedProposalIds([...selectedProposalIds, id]);
    }
  };

  // Preview Customer Mock CRM Record
  const activeProposalForPreview = readyProposals.find((p) => p.customer_id === previewCustomerId) || readyProposals[0];
  const crmRecord = crmRecords.find((r) => r.customer_id === previewCustomerId);

  // Execution
  const handleExecutePublish = () => {
    if (!canPublish) {
      alert('Your role cannot execute CRM publish. Market Back Office (P2) or KAM (P3) permission required.');
      return;
    }

    const { publishedCount } = publishToCrm(currentMarket);
    setIsConfirmModalOpen(false);

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: `Published ${publishedCount} Approved Segment Updates to Veeva CRM`,
      subtext: 'Segment age reset to 0d. Downstream consumers synchronized immediately.',
    });
  };

  // Columns for Ready Proposals Table
  const readyColumns: Column<Proposal>[] = [
    {
      key: 'select',
      header: '',
      render: (p) => (
        <input
          type="checkbox"
          checked={selectedProposalIds.includes(p.proposal_id)}
          onChange={() => handleToggleSelect(p.proposal_id)}
          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
          onClick={(e) => e.stopPropagation()}
        />
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (p) => (
        <div>
          <div className="font-semibold text-navy-900">{getCustomerName(p)}</div>
          <div className="text-2xs text-slate-500 font-mono">
            {p.customer_id} · {p.market_code} · {p.customer_type}
          </div>
        </div>
      ),
    },
    {
      key: 'dimension',
      header: 'Dimension',
      render: (p) => <span className="text-xs text-slate-700">{p.dimension_code}</span>,
    },
    {
      key: 'transition',
      header: 'Current → Approved',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
          <span className="text-slate-500">{p.current_value}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            {p.proposed_value}
          </span>
        </div>
      ),
    },
    {
      key: 'segment_age_days',
      header: 'Pre-Writeback Age',
      render: (p) => <SegmentAgeChip days={p.segment_age_days} />,
    },
    {
      key: 'status',
      header: 'Approval Status',
      render: () => <StatusBadge status="Approved" />,
    },
  ];

  // Publish Log Columns
  const logColumns: Column<PublishLogEntry>[] = [
    {
      key: 'published_at',
      header: 'Timestamp',
      render: (l) => <span className="font-mono text-xs text-slate-700">{l.published_at.replace('T', ' ')}</span>,
    },
    {
      key: 'publish_id',
      header: 'Publish Job ID',
      render: (l) => <span className="font-mono text-xs text-navy-900 font-semibold">{l.publish_id}</span>,
    },
    {
      key: 'market_code',
      header: 'Market',
      render: (l) => <span className="font-mono text-xs font-semibold">{l.market_code}</span>,
    },
    {
      key: 'records_written',
      header: 'Records Synced',
      align: 'right',
      render: (l) => <span className="font-mono text-xs font-bold text-teal-700">{l.records_written}</span>,
    },
    {
      key: 'target_systems',
      header: 'Downstream Consumers',
      render: (l) => (
        <span className="text-xs text-slate-600">
          {l.target_systems.join(', ')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (l) => (
        <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
          {l.status}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Publish to CRM & Orchestration"
        question="What reaches the field, and what changes downstream?"
        actions={
          <button
            onClick={() => setIsConfirmModalOpen(true)}
            disabled={!canPublish || selectedProposalIds.length === 0}
            title={
              !canPublish
                ? 'Your role cannot publish to CRM.'
                : selectedProposalIds.length === 0
                ? 'Select at least one approved customer.'
                : 'Execute CRM write-back'
            }
            className={`px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors shadow-2xs flex items-center gap-1.5 ${
              !canPublish || selectedProposalIds.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Publish {selectedProposalIds.length} Approved Changes to CRM</span>
          </button>
        }
      />

      {/* Governed Write-Back Banner */}
      <div className="bg-white border border-teal-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-body font-bold text-navy-900 flex items-center gap-2">
              <span>Unapproved Write-Backs: 0</span>
              <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                100% Governed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuum guarantees zero model hallucinations or unapproved suggestions ever enter commercial CRM fields.
            </p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-400 font-mono">
          Veeva CRM API v24.2 Connected
        </div>
      </div>

      {/* Coexistence architecture callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 flex items-center justify-between">
        <span>
          <strong>Architecture Principle 10: </strong> &ldquo;Continuum publishes to these downstream systems; it replaces none of them.&rdquo;
        </span>
        <span className="font-mono text-2xs text-slate-400">REST &amp; Event Bus Sync</span>
      </div>

      {/* MAIN SECTION: Ready Queue on Left, Mock CRM Record on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Approved Queue */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-4">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedProposalIds.length === readyProposals.length && readyProposals.length > 0}
                onChange={handleSelectAll}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <h3 className="text-section-title text-navy-900">Approved Segments Ready for CRM Sync</h3>
                <p className="text-xs text-slate-500">
                  Select records to publish. Segment age will reset to 0 days upon write-back.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-500">
              {readyProposals.length} approved
            </span>
          </div>

          <DataTable
            data={readyProposals}
            columns={readyColumns}
            rowKey={(p) => p.proposal_id}
            onRowClick={(p) => setPreviewCustomerId(p.customer_id)}
            pageSize={10}
          />
        </div>

        {/* Mock CRM Record View */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-5 sticky top-20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs font-semibold text-navy-900 uppercase tracking-wide">
              <Server className="w-4 h-4 text-teal-600" />
              <span>Mock Veeva CRM Customer Record</span>
            </div>
            <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              {activeProposalForPreview?.customer_id || previewCustomerId}
            </span>
          </div>

          <div>
            <h4 className="text-body font-bold text-navy-900">
              {activeProposalForPreview ? getCustomerName(activeProposalForPreview) : (crmRecord?.customer_name || 'Dr. Hanna Vogel')}
            </h4>
            <div className="text-xs text-slate-500 mt-0.5">
              Account Affiliation: St. Jude Medical Center · Territory 101
            </div>
          </div>

          {/* Before & After CRM Field View */}
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
              <div className="text-2xs font-bold text-slate-500 uppercase tracking-wider">
                Current Live CRM State (Pre-Writeback)
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-600 font-mono">Core_Segment__c:</span>
                <span className="font-mono font-bold text-navy-900">
                  {crmRecord?.segment || activeProposalForPreview?.current_value || 'Segment B'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-600 font-mono">Proposed_Segment__c:</span>
                <span className="font-mono font-bold text-teal-700">
                  {crmRecord?.proposed_segment || activeProposalForPreview?.proposed_value || 'Segment A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-600 font-mono">Segment_Age__c:</span>
                <SegmentAgeChip days={crmRecord?.segment_age_days || activeProposalForPreview?.segment_age_days || 164} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-mono">Sync_Status__c:</span>
                <span className="text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded text-2xs">
                  Pending Publish
                </span>
              </div>
            </div>

            <div className="p-3 bg-teal-50/70 rounded-lg border border-teal-200 space-y-2">
              <div className="text-2xs font-bold text-teal-800 uppercase tracking-wider flex items-center justify-between">
                <span>Projected CRM State Post-Writeback</span>
                <span className="text-teal-600 font-sans">Atomic Update</span>
              </div>
              <div className="flex justify-between border-b border-teal-200 pb-1.5">
                <span className="text-slate-600 font-mono">Core_Segment__c:</span>
                <span className="font-mono font-bold text-teal-800">
                  {activeProposalForPreview?.proposed_value || 'Segment A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-teal-200 pb-1.5">
                <span className="text-slate-600 font-mono">Proposed_Segment__c:</span>
                <span className="font-mono text-slate-400 italic">null (cleared)</span>
              </div>
              <div className="flex justify-between border-b border-teal-200 pb-1.5">
                <span className="text-slate-600 font-mono">Segment_Age__c:</span>
                <SegmentAgeChip days={0} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-mono">Sync_Status__c:</span>
                <span className="text-teal-800 font-semibold bg-teal-100 px-2 py-0.5 rounded text-2xs">
                  Synced &amp; Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOWNSTREAM CONSUMER TILES */}
      <div className="space-y-4">
        <div>
          <h3 className="text-section-title text-navy-900">Synchronized Downstream Consumers</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Systems that automatically re-weight audiences and detail frequencies upon CRM write-back.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-semibold text-xs">
              <Target className="w-4 h-4 text-teal-600" />
              <span>Targeting Engine</span>
            </div>
            <div className="text-2xl font-bold font-mono text-navy-900">790 HCPs</div>
            <p className="text-xs text-slate-500">Call frequency adjusted based on new segment weights.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-semibold text-xs">
              <PhoneCall className="w-4 h-4 text-teal-600" />
              <span>Call Planning (Veeva Align)</span>
            </div>
            <div className="text-2xl font-bold font-mono text-navy-900">24 Territories</div>
            <p className="text-xs text-slate-500">Weekly call goals updated across active territory plans.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-semibold text-xs">
              <Zap className="w-4 h-4 text-teal-600" />
              <span>NBA Engine</span>
            </div>
            <div className="text-2xl font-bold font-mono text-navy-900">182 Triggers</div>
            <p className="text-xs text-slate-500">High-propensity next actions refreshed for rising prescribers.</p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-semibold text-xs">
              <Radio className="w-4 h-4 text-teal-600" />
              <span>Marketing Journeys</span>
            </div>
            <div className="text-2xl font-bold font-mono text-navy-900">410 HCPs</div>
            <p className="text-xs text-slate-500">
              Enrolled in launch email nurture (<strong>excludes 38</strong> non-consented channels).
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-navy-900 font-semibold text-xs">
              <BarChart3 className="w-4 h-4 text-teal-600" />
              <span>Segment Health Dashboard</span>
            </div>
            <div className="text-2xl font-bold font-mono text-teal-700">97 Resets</div>
            <p className="text-xs text-slate-500">Segment age reset to 0d; freshness KPIs immediately advance.</p>
          </div>
        </div>
      </div>

      {/* PUBLISH LOG TABLE */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-4">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-section-title text-navy-900">Publish to CRM Audit History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Historical record of verified write-back jobs executed by commercial leads.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {publishLog.length} jobs completed
          </span>
        </div>

        <DataTable
          data={publishLog}
          columns={logColumns}
          rowKey={(l) => l.publish_id}
          pageSize={10}
        />
      </div>

      {/* Confirm Publish Modal */}
      {isConfirmModalOpen && (
        <ConfirmChangeModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleExecutePublish}
          title={`Publish ${selectedProposalIds.length} Approved Segments to CRM`}
          dimensionName="Core_Segment__c"
          beforeValue="Current Segments"
          afterValue="Approved Segments"
          approverRole={currentPersona}
          actionType="publish"
          confirmLabel="Execute Write-Back"
        />
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

export default S11_PublishToCrm;
