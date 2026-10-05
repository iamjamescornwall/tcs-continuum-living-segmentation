import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Lock,
  Edit2,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { ApproverPill } from '../components/ui/ApproverPill';
import { DataTable, Column } from '../components/ui/DataTable';
import { ConfirmChangeModal } from '../components/ui/ConfirmChangeModal';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { Dimension, ApprovalRight, Threshold } from '../types';

export const S03_GlobalStandards: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dimensions';

  const { currentPersona, proposals } = useAppStore();

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'dimensions', label: '1. Dimension Catalogue' },
    { id: 'approval-rights', label: '2. Approval Rights Matrix' },
    { id: 'thresholds', label: '3. Volatility Thresholds' },
    { id: 'stability-policy', label: '4. Stability Policy & Freezes' },
  ];

  const dimensions = dataService.getDimensions();
  const approvalRights = dataService.getApprovalRights();
  const [thresholdsList, setThresholdsList] = useState<Threshold[]>(dataService.getThresholds());

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [editingThreshold, setEditingThreshold] = useState<Threshold | null>(null);

  // Compute live proposals held by stability rules
  const heldProposals = proposals.filter((p) => p.status === 'Held');

  // Handle Threshold Edit Save
  const handleSaveThreshold = (newVal?: string) => {
    if (!editingThreshold) return;

    if (currentPersona !== 'P1' && currentPersona !== 'P2') {
      alert('Your role cannot edit governance thresholds.');
      return;
    }

    setThresholdsList((prev) =>
      prev.map((t) =>
        t.market_code === editingThreshold.market_code &&
        t.dimension_code === editingThreshold.dimension_code &&
        t.signal_type === editingThreshold.signal_type
          ? { ...t, threshold_value: newVal || t.threshold_value }
          : t
      )
    );

    setEditingThreshold(null);
    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: `Threshold Updated for ${editingThreshold.dimension_code}`,
      subtext: 'Drift detection engine updated immediately. Live proposals re-evaluated.',
    });
  };

  // Dimensions Columns
  const dimensionColumns: Column<Dimension>[] = [
    {
      key: 'name',
      header: 'Dimension',
      render: (d) => (
        <div>
          <div className="font-semibold text-navy-900">{d.name}</div>
          <div className="text-2xs text-slate-500 font-mono">{d.dimension_code}</div>
        </div>
      ),
    },
    {
      key: 'customer_type',
      header: 'Scope',
      render: (d) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
          {d.customer_type === 'HCP' ? 'Prescriber' : 'Account'}
        </span>
      ),
    },
    {
      key: 'allowed_values',
      header: 'Governed Standard Values',
      render: (d) => (
        <span className="text-xs font-mono text-slate-700">
          {d.allowed_values.join(', ')}
        </span>
      ),
    },
    {
      key: 'layer',
      header: 'Strategic Layer',
      render: (d) => (
        <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-800">
          {d.layer}
        </span>
      ),
    },
    {
      key: 'refreshable_between_cycles',
      header: 'Living Refresh',
      render: (d) => (
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${d.refreshable_between_cycles ? 'bg-teal-50 text-teal-800 border border-teal-200' : 'bg-slate-100 text-slate-500'}`}>
          {d.refreshable_between_cycles ? 'Between Cycles (Living)' : 'Cycle Only'}
        </span>
      ),
    },
  ];

  // Approval Rights Columns
  const rightsColumns: Column<ApprovalRight>[] = [
    {
      key: 'dimension_code',
      header: 'Dimension Code',
      render: (r) => <span className="font-mono text-xs font-bold text-navy-900">{r.dimension_code}</span>,
    },
    {
      key: 'market_code',
      header: 'Market Archetype',
      render: (r) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {r.market_code}
        </span>
      ),
    },
    {
      key: 'approver_role',
      header: 'Designated Approving Persona',
      render: (r) => (
        <div className="flex items-center gap-2">
          <ApproverPill role={r.approver_role} />
          {currentPersona === 'P1' && (
            <button
              onClick={() => alert(`Editing approval rights for ${r.dimension_code} (${r.market_code}) requires Global Lead elevation.`)}
              className="text-2xs text-teal-600 hover:underline flex items-center gap-0.5"
            >
              <Edit2 className="w-3 h-3" />
              <span>Edit</span>
            </button>
          )}
        </div>
      ),
    },
    {
      key: 'escalation_path',
      header: 'Co-Approver / Escalation',
      render: (r) => <span className="text-xs text-slate-500 font-mono">{r.co_approver_role || 'Global Lead (P1)'}</span>,
    },
  ];

  // Thresholds Columns
  const thresholdColumns: Column<Threshold>[] = [
    {
      key: 'dimension_code',
      header: 'Dimension',
      render: (t) => (
        <div>
          <span className="font-mono text-xs font-bold text-navy-900">{t.dimension_code}</span>
          <div className="text-2xs text-slate-500">{t.market_code}</div>
        </div>
      ),
    },
    {
      key: 'signal_stream',
      header: 'Monitoring Signal',
      render: (t) => <span className="text-xs font-medium text-slate-700">{t.signal_type}</span>,
    },
    {
      key: 'threshold_value',
      header: 'Drift Threshold Value',
      render: (t) => (
        <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
          {t.threshold_value} {t.unit}
        </span>
      ),
    },
    {
      key: 'min_evidence',
      header: 'Min Evidence Required',
      render: (t) => <span className="text-xs text-slate-600 font-mono">{t.min_independent_signals} Signals</span>,
    },
    {
      key: 'evaluation_cadence',
      header: 'Lookback Window',
      render: (t) => <span className="text-xs text-slate-600 font-mono">{t.lookback_days} days</span>,
    },
    {
      key: 'action',
      header: '',
      align: 'right',
      render: (t) => (
        <button
          onClick={() => setEditingThreshold(t)}
          className="text-xs text-teal-600 hover:text-teal-700 font-semibold"
        >
          Modify
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Global Standards & Governance"
        question="What are the global rules?"
      />

      <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* TAB 1: DIMENSIONS */}
      {currentTab === 'dimensions' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Governed Dimension Catalogue</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standardized definitions across all markets. Local algorithms map to these allowed values.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {dimensions.length} Governed Dimensions
              </span>
            </div>

            <DataTable
              data={dimensions}
              columns={dimensionColumns}
              rowKey={(d) => d.dimension_code}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL RIGHTS */}
      {currentTab === 'approval-rights' && (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-body font-semibold text-amber-900">
                Principle 5: Global Vocabulary, Local Control
              </h4>
              <p className="text-body-sm text-amber-800 mt-0.5">
                Headquarters defines dimensions and allowed values. Local commercial operations configure signal thresholds and own approval rights within their market jurisdiction.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Maintenance &amp; Approval Rights Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Designated persona required to approve segment transitions before CRM publish.
                </p>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                P1 Modification Rights Only
              </span>
            </div>

            <DataTable
              data={approvalRights}
              columns={rightsColumns}
              rowKey={(r) => `${r.dimension_code}_${r.market_code}`}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 3: THRESHOLDS */}
      {currentTab === 'thresholds' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Market Volatility &amp; Drift Thresholds</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Defines the magnitude of observed change required to trigger a drift flag in S09.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {thresholdsList.length} Active Rules
              </span>
            </div>

            <DataTable
              data={thresholdsList}
              columns={thresholdColumns}
              rowKey={(t) => `${t.market_code}_${t.dimension_code}_${t.signal_type}`}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 4: STABILITY POLICY & FREEZES */}
      {currentTab === 'stability-policy' && (
        <div className="space-y-6">
          <div className="bg-white border border-teal-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-body font-bold text-navy-900">
                  Proposals Currently Held by Policy Rules: {heldProposals.length}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Proposals violating stability policy are automatically held. They never bypass the human gate.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300">
              Active Protection
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Freeze Windows */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calendar className="w-4 h-4 text-teal-600" />
                <h4 className="text-body-sm font-semibold text-navy-900">Governed Freeze Windows</h4>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Q4 Commercial Planning Freeze', window: '2026-11-15 to 2026-12-31', market: 'All Markets', status: 'Scheduled' },
                  { name: 'Aurelix Launch Week Window', window: '2026-06-01 to 2026-06-15', market: 'Market B', status: 'Past' },
                  { name: 'Annual Territory Alignment Lock', window: '2026-12-01 to 2027-01-10', market: 'Market A', status: 'Scheduled' },
                ].map((fw, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded border border-slate-200 flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-navy-900">{fw.name}</div>
                      <div className="text-2xs text-slate-500 font-mono mt-0.5">{fw.window} · {fw.market}</div>
                    </div>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {fw.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stability Rules */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Lock className="w-4 h-4 text-amber-700" />
                <h4 className="text-body-sm font-semibold text-navy-900">Core Stability Rules</h4>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="font-semibold text-navy-900">STAB-CONFLICT: Conflicting Signals Rule</div>
                  <p className="text-xs text-slate-600 mt-1">
                    When simultaneous positive and negative signals are detected (e.g. Rx increase + low rep perception), proposal is placed on <strong>Hold for Review</strong>. Never auto-proposed.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="font-semibold text-navy-900">STAB-FREQ: Change Frequency Limit</div>
                  <p className="text-xs text-slate-600 mt-1">
                    Maximum 1 approved segment change per customer per 180-day window to prevent field whiplash.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="font-semibold text-navy-900">STAB-EVID: Minimum Evidence Requirement</div>
                  <p className="text-xs text-slate-600 mt-1">
                    At least 2 distinct signal events across separate channels required before a drift flag is promoted to a proposal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modify Threshold Modal */}
      {editingThreshold && (
        <ConfirmChangeModal
          isOpen={editingThreshold !== null}
          onClose={() => setEditingThreshold(null)}
          onConfirm={(reason) => handleSaveThreshold(reason)}
          title={`Modify Threshold for ${editingThreshold.dimension_code}`}
          dimensionName={editingThreshold.dimension_code}
          beforeValue={editingThreshold.threshold_value}
          afterValue="+25% sustained QoQ momentum"
          approverRole={currentPersona}
          actionType="generic"
          confirmLabel="Update Threshold"
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

export default S03_GlobalStandards;
