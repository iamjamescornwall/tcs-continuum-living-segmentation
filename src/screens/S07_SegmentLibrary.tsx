import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RefreshCw,
  Eye,
  ArrowRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DataTable, Column } from '../components/ui/DataTable';
import { Drawer } from '../components/ui/Drawer';
import { ConfirmChangeModal } from '../components/ui/ConfirmChangeModal';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { Sankey, SankeyNodeData, SankeyLinkData } from '../components/charts/Sankey';
import { useAppStore } from '../store/useAppStore';
import { SegmentLibraryVersion } from '../types';

export const S07_SegmentLibrary: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentMarket,
    currentBrand,
    currentPersona,
    libraryVersions,
    approveLibraryVersion,
    activateLibraryVersion,
  } = useAppStore();

  const [selectedMarketFilter, setSelectedMarketFilter] = useState<string>(
    currentMarket === 'ALL' ? 'ALL' : currentMarket
  );
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>(
    currentBrand === 'ALL' ? 'ALL' : currentBrand
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');

  const [inspectVersion, setInspectVersion] = useState<SegmentLibraryVersion | null>(null);
  const [bulkRefreshVersion, setBulkRefreshVersion] = useState<SegmentLibraryVersion | null>(null);

  // Confirmation Modal state
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    version: SegmentLibraryVersion | null;
    actionType: 'approve' | 'activate';
  }>({
    isOpen: false,
    version: null,
    actionType: 'approve',
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Filtered versions
  const filteredVersions = useMemo(() => {
    return libraryVersions.filter((v) => {
      const matchMarket = selectedMarketFilter === 'ALL' || v.market_code === selectedMarketFilter;
      const matchBrand = selectedBrandFilter === 'ALL' || v.brand_code === selectedBrandFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || v.status === selectedStatusFilter;
      return matchMarket && matchBrand && matchStatus;
    });
  }, [libraryVersions, selectedMarketFilter, selectedBrandFilter, selectedStatusFilter]);

  // Bulk Refresh Sankey Data
  const bulkRefreshNodes: SankeyNodeData[] = [
    { id: 'curr_A', name: 'Active: Seg A', color: '#0E7C86' },
    { id: 'curr_B', name: 'Active: Seg B', color: '#3CA5AE' },
    { id: 'curr_C', name: 'Active: Seg C', color: '#5B6ABF' },
    { id: 'curr_D', name: 'Active: Seg D', color: '#E9B44C' },
    { id: 'curr_E', name: 'Active: Seg E', color: '#8A6D1F' },

    { id: 'prop_A', name: 'Proposed: Seg A', color: '#0E7C86' },
    { id: 'prop_B', name: 'Proposed: Seg B', color: '#3CA5AE' },
    { id: 'prop_C', name: 'Proposed: Seg C', color: '#5B6ABF' },
    { id: 'prop_D', name: 'Proposed: Seg D', color: '#E9B44C' },
    { id: 'prop_E', name: 'Proposed: Seg E', color: '#8A6D1F' },
  ];

  const bulkRefreshLinks: SankeyLinkData[] = [
    { source: 'curr_A', target: 'prop_A', value: 820, color: '#0E7C86' },
    { source: 'curr_B', target: 'prop_A', value: 145, color: '#0E7C86' }, // Rising into A
    { source: 'curr_B', target: 'prop_B', value: 1450, color: '#3CA5AE' },
    { source: 'curr_C', target: 'prop_B', value: 210, color: '#3CA5AE' }, // Rising into B
    { source: 'curr_C', target: 'prop_C', value: 2100, color: '#5B6ABF' },
    { source: 'curr_D', target: 'prop_C', value: 110, color: '#5B6ABF' },
    { source: 'curr_D', target: 'prop_D', value: 1650, color: '#E9B44C' },
    { source: 'curr_E', target: 'prop_E', value: 1400, color: '#8A6D1F' },
  ];

  // Actions
  const handleApproveConfirm = () => {
    if (!confirmModalConfig.version) return;
    approveLibraryVersion(confirmModalConfig.version.version_id, `USR-${currentPersona}`);
    setConfirmModalConfig({ isOpen: false, version: null, actionType: 'approve' });
    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: `Version ${confirmModalConfig.version.name} Approved`,
      subtext: 'Global standards verified. Ready for activation by Global Lead (P1).',
    });
  };

  const handleActivateConfirm = () => {
    if (!confirmModalConfig.version) return;
    activateLibraryVersion(confirmModalConfig.version.version_id);
    setConfirmModalConfig({ isOpen: false, version: null, actionType: 'activate' });
    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: `Version ${confirmModalConfig.version.name} is now ACTIVE`,
      subtext: 'Previous active version has been retired. Only Active versions publish to CRM.',
    });
  };

  const handleSendBulkRefreshToReview = () => {
    setBulkRefreshVersion(null);
    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: '465 Bulk Refresh Proposals Routed to Review Queue (S10)',
      subtext: 'Each change includes driver evidence and confidence score. Human approval required.',
    });
    setTimeout(() => {
      navigate('/review-queue');
    }, 1500);
  };

  const columns: Column<SegmentLibraryVersion>[] = [
    {
      key: 'name',
      header: 'Version Name & ID',
      render: (v) => (
        <div>
          <div className="font-semibold text-navy-900">{v.name}</div>
          <div className="text-xs text-slate-500 font-mono">{v.version_id}</div>
        </div>
      ),
    },
    {
      key: 'market_brand',
      header: 'Market / Brand',
      render: (v) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
          {v.market_code} · {v.brand_code}
        </span>
      ),
    },
    {
      key: 'method',
      header: 'Methodology',
      render: (v) => (
        <span className="text-xs text-slate-700">
          {v.method === 'KMEANS_RULES'
            ? 'K-Means + Overlay'
            : v.method === 'RULES_DECILE_CLUSTERS'
            ? 'Deciles + Behavioural'
            : 'Rules Template'}
        </span>
      ),
    },
    {
      key: 'records_segmented',
      header: 'Universe',
      align: 'right',
      render: (v) => (
        <span className="font-mono text-xs font-bold text-navy-900">
          {v.records_segmented.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'created_date',
      header: 'Created',
      render: (v) => (
        <div>
          <div className="text-xs font-mono text-slate-700">{v.created_date}</div>
          <div className="text-2xs text-slate-500">{v.author_user_id}</div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (v) => <StatusBadge status={v.status} />,
    },
    {
      key: 'actions',
      header: 'Lifecycle Actions',
      align: 'right',
      render: (v) => (
        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setInspectVersion(v)}
            title="Inspect Version Details"
            className="p-1.5 text-slate-500 hover:text-navy-900 hover:bg-slate-100 rounded"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Draft -> Approve (P1 only) */}
          {v.status === 'Draft' && (
            <button
              onClick={() => {
                if (currentPersona !== 'P1') {
                  alert('Your role cannot approve this version. Global Segmentation Lead (P1) sign-off required.');
                  return;
                }
                setConfirmModalConfig({ isOpen: true, version: v, actionType: 'approve' });
              }}
              className="px-2.5 py-1 text-2xs font-semibold rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-300"
            >
              Approve
            </button>
          )}

          {/* Approved -> Activate (P1 only) */}
          {v.status === 'Approved' && (
            <button
              onClick={() => {
                if (currentPersona !== 'P1') {
                  alert('Your role cannot activate this version. Global Segmentation Lead (P1) sign-off required.');
                  return;
                }
                setConfirmModalConfig({ isOpen: true, version: v, actionType: 'activate' });
              }}
              className="px-2.5 py-1 text-2xs font-semibold rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-300"
            >
              Activate
            </button>
          )}

          {/* Active -> Bulk Refresh */}
          {v.status === 'Active' && (
            <button
              onClick={() => setBulkRefreshVersion(v)}
              className="px-2.5 py-1 text-2xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 flex items-center gap-1 shadow-2xs"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Bulk Refresh</span>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Segment Library & Versions"
        question="Which segmentation versions do we have?"
        actions={
          <button
            onClick={() => navigate('/studio')}
            className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Version in Studio</span>
          </button>
        }
      />

      {/* Filter Strip */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase">Market</label>
            <select
              value={selectedMarketFilter}
              onChange={(e) => setSelectedMarketFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 bg-white text-navy-900"
            >
              <option value="ALL">All Markets</option>
              <option value="MKT_A">Market A (Data-rich)</option>
              <option value="MKT_B">Market B (Signal-enriched)</option>
              <option value="MKT_C">Market C (Survey-led)</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase">Brand</label>
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 bg-white text-navy-900"
            >
              <option value="ALL">All Brands</option>
              <option value="AUR">Aurelix</option>
              <option value="ZEN">Zentrova</option>
              <option value="CRD">Cardivance</option>
              <option value="NEU">Neurelle</option>
              <option value="BRV">Brevanta</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-slate-500 uppercase">Lifecycle Status</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded p-1.5 bg-white text-navy-900"
            >
              <option value="ALL">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="Active">Active</option>
              <option value="Retired">Retired</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong>{filteredVersions.length}</strong> of {libraryVersions.length} Governed Versions
        </div>
      </div>

      {/* Main Versions Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
        <DataTable
          data={filteredVersions}
          columns={columns}
          rowKey={(v) => v.version_id}
          onRowClick={(v) => setInspectVersion(v)}
          pageSize={10}
        />
      </div>

      {/* Version Detail Drawer */}
      <Drawer
        isOpen={inspectVersion !== null}
        onClose={() => setInspectVersion(null)}
        title={inspectVersion?.name || 'Version Details'}
        subtitle={`${inspectVersion?.version_id} · ${inspectVersion?.market_code} · ${inspectVersion?.brand_code}`}
        width="560px"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500">
              Only Active versions publish to CRM.
            </span>
            <button
              onClick={() => setInspectVersion(null)}
              className="px-4 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        }
      >
        {inspectVersion && (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-xs text-slate-600 font-medium">Lifecycle Status</span>
              <StatusBadge status={inspectVersion.status} />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wide mb-2">
                Algorithm &amp; Parameters
              </h4>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
                <div><strong>Method:</strong> {inspectVersion.method}</div>
                <div><strong>Records Segmented:</strong> {inspectVersion.records_segmented.toLocaleString()}</div>
                <div><strong>Mapped to Global Standard:</strong> {inspectVersion.mapped_to_global ? 'Yes (A–E)' : 'No'}</div>
                {inspectVersion.parameters.k && <div><strong>k Clusters:</strong> {inspectVersion.parameters.k}</div>}
                {inspectVersion.parameters.weights && (
                  <div><strong>Weights:</strong> {JSON.stringify(inspectVersion.parameters.weights)}</div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wide mb-2">
                Audit &amp; Governance Traceability
              </h4>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Created Date:</span>
                  <span className="font-mono text-navy-900">{inspectVersion.created_date}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Author:</span>
                  <span className="font-mono text-navy-900">{inspectVersion.author_user_id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Approved By:</span>
                  <span className="font-mono text-navy-900">{inspectVersion.approved_by || 'Pending Sign-off'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Activated Date:</span>
                  <span className="font-mono text-navy-900">{inspectVersion.activated_date || 'Not Active'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-navy-900 uppercase tracking-wide mb-1">
                Release Notes
              </h4>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200 italic">
                {inspectVersion.notes}
              </p>
            </div>
          </div>
        )}
      </Drawer>

      {/* Bulk Refresh Simulation Drawer */}
      <Drawer
        isOpen={bulkRefreshVersion !== null}
        onClose={() => setBulkRefreshVersion(null)}
        title="Bulk Refresh Simulation"
        subtitle={`Re-evaluating ${bulkRefreshVersion?.name} against current data telemetry`}
        width="640px"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-xs text-slate-500">
              Generates proposals; never overwrites.
            </span>
            <button
              onClick={handleSendBulkRefreshToReview}
              className="px-4 py-2 bg-teal-600 text-white text-xs font-semibold rounded hover:bg-teal-700 flex items-center gap-1.5 shadow-2xs"
            >
              <span>Send 465 Proposals to Review Queue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-body-sm font-semibold text-teal-900">
                Governed Bulk Refresh Rule (Principle 1 &amp; 2)
              </h4>
              <p className="text-xs text-teal-800 mt-1">
                Re-running the active model on fresh telemetry detects aggregate drift. All detected migrations are routed as <strong>proposals</strong> to the named commercial owners. No CRM record is modified without explicit human approval.
              </p>
            </div>
          </div>

          <Sankey
            title="Projected Prescriber Migration Under Bulk Refresh"
            soWhat="145 Segment B prescribers qualify for Segment A upgrade based on sustained Rx adoption momentum."
            xAxisLabel="Migration Path"
            yAxisLabel="Prescribers"
            nodes={bulkRefreshNodes}
            links={bulkRefreshLinks}
            height={360}
          />
        </div>
      </Drawer>

      {/* Confirmation Modals */}
      {confirmModalConfig.isOpen && confirmModalConfig.version && (
        <ConfirmChangeModal
          isOpen={confirmModalConfig.isOpen}
          onClose={() => setConfirmModalConfig({ isOpen: false, version: null, actionType: 'approve' })}
          onConfirm={confirmModalConfig.actionType === 'approve' ? handleApproveConfirm : handleActivateConfirm}
          title={
            confirmModalConfig.actionType === 'approve'
              ? `Approve Version ${confirmModalConfig.version.name}`
              : `Activate Version ${confirmModalConfig.version.name}`
          }
          dimensionName="Segment Library Lifecycle"
          beforeValue={confirmModalConfig.version.status}
          afterValue={confirmModalConfig.actionType === 'approve' ? 'Approved' : 'Active'}
          approverRole={currentPersona}
          actionType={confirmModalConfig.actionType === 'approve' ? 'approve' : 'activate'}
          confirmLabel={confirmModalConfig.actionType === 'approve' ? 'Approve Version' : 'Activate & Retire Previous'}
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

export default S07_SegmentLibrary;
