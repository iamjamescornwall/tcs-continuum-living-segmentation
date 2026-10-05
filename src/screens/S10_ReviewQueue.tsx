import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  CheckCheck,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { ConfidenceChip } from '../components/ui/ConfidenceChip';
import { SegmentAgeChip } from '../components/ui/SegmentAgeChip';
import { ApproverPill } from '../components/ui/ApproverPill';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AIBadge } from '../components/ui/AIBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { ConfirmChangeModal } from '../components/ui/ConfirmChangeModal';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import governanceService from '../services/governanceService';
import { dataService } from '../services/dataService';
import { Proposal, RejectionReason } from '../types';

export const S10_ReviewQueue: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    currentPersona,
    currentMarket,
    currentBrand,
    proposals,
    approveProposal,
    rejectProposal,
  } = useAppStore();

  const isP3 = currentPersona === 'P3';
  const isP4 = currentPersona === 'P4';
  const isP6 = currentPersona === 'P6';

  const defaultType = isP3 ? 'HCO' : searchParams.get('filter') === 'accounts' ? 'HCO' : 'ALL';
  const [typeFilter, setTypeFilter] = useState<string>(defaultType);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeProposal, setActiveProposal] = useState<Proposal | null>(null);

  // Modals & Toast State
  const [actionModalConfig, setActionModalConfig] = useState<{
    isOpen: boolean;
    proposal: Proposal | null;
    actionType: 'approve' | 'reject';
  }>({
    isOpen: false,
    proposal: null,
    actionType: 'approve',
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filter proposals according to persona rights and active filters
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      // Market and brand filter
      const matchMarket = currentMarket === 'ALL' || p.market_code === currentMarket;
      const matchBrand = currentBrand === 'ALL' || p.brand_code === currentBrand;
      const matchType = typeFilter === 'ALL' || p.customer_type === typeFilter;
      const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;

      // P4 Field Rep: only territory prescribers
      if (isP4) {
        const inTerritory = p.customer_type === 'HCP' && (p.customer_id.startsWith('HCP-B') || p.customer_id === 'HCP-B-0001');
        return matchMarket && matchBrand && matchStatus && inTerritory;
      }

      return matchMarket && matchBrand && matchType && matchStatus;
    });
  }, [proposals, currentMarket, currentBrand, typeFilter, statusFilter, isP4]);

  // Set initial active proposal to Hero record if available
  React.useEffect(() => {
    if (!activeProposal && filteredProposals.length > 0) {
      const hero = filteredProposals.find((p) => p.customer_id === 'HCP-B-0001') || filteredProposals[0];
      setActiveProposal(hero);
    }
  }, [filteredProposals, activeProposal]);

  // Check if current persona can approve proposal
  const canPersonaAct = (p: Proposal): { allowed: boolean; reason?: string } => {
    if (isP6) {
      return { allowed: false, reason: 'Executive/Compliance role is read-only.' };
    }
    if (p.status === 'Held') {
      return { allowed: false, reason: `Proposal held by ${p.policy_rule_ref}: ${p.hold_reason}` };
    }
    const right = governanceService.canApprove(currentPersona, p.market_code, p.dimension_code);
    if (!right.allowed) {
      return { allowed: false, reason: right.reason || 'Your role cannot approve this field in this market.' };
    }
    return { allowed: true };
  };

  // Actions
  const handleApprove = (proposal: Proposal) => {
    const check = canPersonaAct(proposal);
    if (!check.allowed) {
      alert(check.reason);
      return;
    }
    setActionModalConfig({ isOpen: true, proposal, actionType: 'approve' });
  };

  const handleReject = (proposal: Proposal) => {
    if (isP6) {
      alert('Your role cannot reject proposals (read-only compliance access).');
      return;
    }
    setActionModalConfig({ isOpen: true, proposal, actionType: 'reject' });
  };

  const getCustomerName = (p: Proposal) => {
    if (p.customer_type === 'HCO' || p.customer_id.startsWith('ACC-')) {
      return dataService.getAccountById(p.customer_id)?.name || p.customer_id;
    }
    return dataService.getHcpById(p.customer_id)?.display_name || p.customer_id;
  };

  const handleConfirmAction = (reason?: string) => {
    if (!actionModalConfig.proposal) return;
    const p = actionModalConfig.proposal;

    if (actionModalConfig.actionType === 'approve') {
      approveProposal(p.proposal_id, currentPersona, reason);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        message: 'Proposal Approved · Queued for CRM Publish',
        subtext: `${getCustomerName(p)} updated to ${p.proposed_value}. Unapproved write-backs: 0.`,
      });
    } else {
      const rejReason = (reason as RejectionReason) || 'Field knowledge contradicts signal';
      rejectProposal(p.proposal_id, rejReason, currentPersona);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'warning',
        message: 'Proposal Rejected · Feedback Recorded for Recalibration',
        subtext: `Reason: ${rejReason}. Fed into S13 without automated model retrain.`,
      });
    }

    setActionModalConfig({ isOpen: false, proposal: null, actionType: 'approve' });
  };

  // Bulk Approve High Confidence (P2 only)
  const handleBulkApproveHighConfidence = () => {
    if (currentPersona !== 'P2') {
      alert('Only Market Back Office (P2) can execute bulk approvals for High-confidence proposals.');
      return;
    }

    const highConfProps = filteredProposals.filter(
      (p) => p.status === 'Proposed' && p.confidence === 'High' && canPersonaAct(p).allowed
    );

    highConfProps.forEach((p) => {
      approveProposal(p.proposal_id, currentPersona, 'Bulk approved via High-confidence queue action');
    });

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: `${highConfProps.length} High-Confidence Proposals Approved`,
      subtext: 'All changes queued for Publish to CRM (S11). Audit log updated.',
    });
  };

  // Columns definition
  const columns: Column<Proposal>[] = [
    {
      key: 'customer',
      header: 'Customer',
      render: (p) => {
        const isHeroHcp = p.customer_id === 'HCP-B-0001';
        const isPropagation = p.customer_id.startsWith('HCP-B-000') && p.customer_id !== 'HCP-B-0001';
        const customerName = getCustomerName(p);
        return (
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-navy-900">
              <span>{customerName}</span>
              {isHeroHcp && (
                <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 border border-teal-300">
                  HERO HCP
                </span>
              )}
              {p.customer_id === 'ACC-B-001' && (
                <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                  HERO ACCOUNT
                </span>
              )}
              {isPropagation && (
                <span className="text-2xs font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800 border border-purple-300">
                  PROPAGATION
                </span>
              )}
            </div>
            <div className="text-2xs text-slate-500 font-mono">
              {p.customer_id} · {p.market_code} · {p.customer_type}
            </div>
          </div>
        );
      },
    },
    {
      key: 'dimension_code',
      header: 'Dimension',
      render: (p) => <span className="text-xs font-medium text-slate-800">{p.dimension_code}</span>,
    },
    {
      key: 'transition',
      header: 'Current → Proposed',
      render: (p) => (
        <div className="flex items-center gap-1.5 text-xs font-bold font-mono">
          <span className="text-slate-500">{p.current_value}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
            {p.proposed_value}
          </span>
        </div>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      render: (p) => <ConfidenceChip confidence={p.confidence} />,
    },
    {
      key: 'segment_age_days',
      header: 'Segment Age',
      render: (p) => <SegmentAgeChip days={p.segment_age_days} />,
    },
    {
      key: 'approver_role',
      header: 'Owner',
      render: (p) => <ApproverPill role={p.approver_role} />,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'quick_actions',
      header: 'Action',
      align: 'right',
      render: (p) => {
        const actCheck = canPersonaAct(p);
        if (p.status === 'Approved' || p.status === 'Written back') {
          return (
            <span className="text-2xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
              Approved
            </span>
          );
        }
        if (p.status === 'Rejected') {
          return (
            <span className="text-2xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded">
              Rejected
            </span>
          );
        }
        if (p.status === 'Held') {
          return (
            <span
              className="text-2xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300 cursor-help"
              title={`Held by ${p.policy_rule_ref}: ${p.hold_reason}`}
            >
              Held ({p.policy_rule_ref})
            </span>
          );
        }
        return (
          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleApprove(p)}
              disabled={!actCheck.allowed}
              title={actCheck.allowed ? 'Approve change' : actCheck.reason}
              className={`p-1 rounded text-teal-700 hover:bg-teal-50 border border-teal-300 transition-colors ${
                !actCheck.allowed ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleReject(p)}
              disabled={isP6}
              title={isP6 ? 'Read only' : 'Reject proposal'}
              className="p-1 rounded text-red-700 hover:bg-red-50 border border-red-300 transition-colors"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={isP4 ? 'My Customers (Territory 101)' : 'Review Queue'}
        question="What do I need to decide?"
        actions={
          currentPersona === 'P2' ? (
            <button
              onClick={handleBulkApproveHighConfidence}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Bulk Approve High-Confidence</span>
            </button>
          ) : undefined
        }
      />

      {/* Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase">Customer Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 bg-white text-navy-900"
            >
              <option value="ALL">HCP &amp; Account</option>
              <option value="HCP">Prescribers (HCP)</option>
              <option value="HCO">Accounts (HCO)</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 bg-white text-navy-900"
            >
              <option value="ALL">All Proposals</option>
              <option value="Proposed">Pending Decision</option>
              <option value="Held">Held for Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong>{filteredProposals.length}</strong> items in queue
        </div>
      </div>

      {/* Main Layout: Table on Left + AI-3 Explanation Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Proposals Table */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
          <DataTable
            data={filteredProposals}
            columns={columns}
            rowKey={(p) => p.proposal_id}
            onRowClick={(p) => setActiveProposal(p)}
            pageSize={10}
          />
        </div>

        {/* AI-3 Explanation Card Panel */}
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-5 sticky top-20">
          {activeProposal ? (() => {
            const aiCard = dataService.getAiCache('AI-3', activeProposal.explanation_key || activeProposal.proposal_id) as {
              headline?: string;
              drivers?: Array<{ label: string; value: string; direction?: string; source_category?: string; data_age_days?: number }>;
              confidence?: string;
              data_age?: string;
              what_would_move_next?: string;
            } | undefined;
            const headline = aiCard?.headline || `Proposed ${activeProposal.dimension_code} change from ${activeProposal.current_value} to ${activeProposal.proposed_value}`;
            const dataAge = aiCard?.data_age || `${activeProposal.segment_age_days}d`;
            const driversList = aiCard?.drivers || activeProposal.drivers;
            const moveNext = aiCard?.what_would_move_next || 'A drop of >15% in quarterly prescribing volume or reversal of account formulary access would trigger downward recalibration review.';

            return (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <AIBadge providerName="MockProvider" />
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      AI-3 Explanation Card
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      navigate(
                        `/customer/${activeProposal.customer_type.toLowerCase() === 'hco' ? 'account' : activeProposal.customer_type.toLowerCase()}/${activeProposal.customer_id}`
                      )
                    }
                    className="text-xs font-medium text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>Customer 360</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <h3 className="text-body font-bold text-navy-900 leading-snug">
                    {headline}
                  </h3>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-mono">{activeProposal.customer_id}</span>
                    <span className="text-slate-300">·</span>
                    <ConfidenceChip confidence={activeProposal.confidence} />
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500">Data age: {dataAge}</span>
                  </div>
                </div>

                {/* Observed Telemetry Drivers */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wide">
                    Grounded Evidence Drivers
                  </h4>
                  <div className="space-y-1.5">
                    {driversList.map((d, idx) => {
                      const dir = (d as any).direction;
                      const isUp = dir === 'Up' || dir === 'up' || (typeof d.value === 'string' && d.value.startsWith('+'));
                      const isDown = dir === 'Down' || dir === 'down' || (typeof d.value === 'string' && d.value.startsWith('-'));
                      return (
                        <div
                          key={idx}
                          className="p-2.5 bg-slate-50 rounded border border-slate-200 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="text-slate-700 font-medium">{d.label}</span>
                            <span className="text-2xs text-slate-400 block font-mono">{d.source_category} · {d.data_age_days}d ago</span>
                          </div>
                          <span
                            className={`font-mono font-bold ${
                              isUp
                                ? 'text-teal-700'
                                : isDown
                                ? 'text-red-700'
                                : 'text-slate-700'
                            }`}
                          >
                            {isUp ? '▲ ' : isDown ? '▼ ' : ''}
                            {d.value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* What would move it next */}
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <div className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>What Would Move It Next?</span>
                  </div>
                  <p className="text-xs text-indigo-800 leading-relaxed">
                    {moveNext}
                  </p>
                </div>

                {/* Decision Action Area */}
                <div className="pt-4 border-t border-slate-100">
                  {activeProposal.status === 'Held' ? (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold">Held by Stability Policy ({activeProposal.policy_rule_ref})</div>
                        <div className="mt-0.5 text-2xs">{activeProposal.hold_reason}</div>
                      </div>
                    </div>
                  ) : activeProposal.status === 'Approved' ? (
                    <div className="p-3 bg-teal-50 border border-teal-200 rounded text-xs text-teal-800 font-medium flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-600" />
                      <span>Approved by named owner. Queued for CRM sync.</span>
                    </div>
                  ) : activeProposal.status === 'Rejected' ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 font-medium flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Rejected. Reason logged to recalibration feed.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleReject(activeProposal)}
                        disabled={isP6}
                        className="w-1/2 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-300 rounded-md transition-colors"
                      >
                        Reject with Reason
                      </button>
                      <button
                        onClick={() => handleApprove(activeProposal)}
                        disabled={!canPersonaAct(activeProposal).allowed}
                        title={canPersonaAct(activeProposal).reason}
                        className={`w-1/2 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors shadow-2xs ${
                          !canPersonaAct(activeProposal).allowed ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Approve Proposal
                      </button>
                    </div>
                  )}
                </div>
              </>
            );
          })() : (
            <div className="p-8 text-center text-xs text-slate-400">
              Select a customer from the queue to inspect grounded AI explanation.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {actionModalConfig.isOpen && actionModalConfig.proposal && (
        <ConfirmChangeModal
          isOpen={actionModalConfig.isOpen}
          onClose={() => setActionModalConfig({ isOpen: false, proposal: null, actionType: 'approve' })}
          onConfirm={handleConfirmAction}
          title={
            actionModalConfig.actionType === 'approve'
              ? `Approve Segment Change for ${getCustomerName(actionModalConfig.proposal)}`
              : `Reject Segment Change for ${getCustomerName(actionModalConfig.proposal)}`
          }
          customerName={getCustomerName(actionModalConfig.proposal)}
          customerId={actionModalConfig.proposal.customer_id}
          dimensionName={actionModalConfig.proposal.dimension_code}
          beforeValue={actionModalConfig.proposal.current_value}
          afterValue={actionModalConfig.proposal.proposed_value}
          approverRole={currentPersona}
          actionType={actionModalConfig.actionType}
          confirmLabel={actionModalConfig.actionType === 'approve' ? 'Approve & Queue for CRM' : 'Confirm Rejection'}
          isDestructive={actionModalConfig.actionType === 'reject'}
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

export default S10_ReviewQueue;
