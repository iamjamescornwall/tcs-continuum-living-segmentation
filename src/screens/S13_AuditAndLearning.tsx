import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Download,
  CheckCircle2,
  Sliders,
  Check,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { KpiTile } from '../components/ui/KpiTile';
import { ApproverPill } from '../components/ui/ApproverPill';
import { DataTable, Column } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { AuditLogEntry, RecalibrationRecommendation } from '../types';

export const S13_AuditAndLearning: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'change-log';

  const { currentPersona, currentMarket, auditLog, libraryVersions } = useAppStore();

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'change-log', label: '1. Governed Change Log' },
    { id: 'version-history', label: '2. Version History' },
    { id: 'recalibration', label: '3. Model Recalibration' },
  ];

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [recalibrationList, setRecalibrationList] = useState<RecalibrationRecommendation[]>(
    dataService.getRecalibrations()
  );

  // Filtered Audit Log
  const filteredAuditLog = auditLog.filter((a) => {
    return currentMarket === 'ALL' || a.market_code === currentMarket;
  });

  // Handle CSV Export
  const handleExportCsv = () => {
    const header = 'Timestamp,Actor Persona,Action,Entity Type,Entity ID,Market,Before,After,Reason\n';
    const rows = filteredAuditLog
      .map(
        (a) =>
          `"${a.timestamp}","${a.actor_persona}","${a.action}","${a.entity_type}","${a.entity_id}","${a.market_code}","${a.before_value}","${a.after_value}","${a.reason}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `continuum_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Recalibration Actions (P1 only)
  const handleValidateRecalibration = (recId: string) => {
    if (currentPersona !== 'P1') {
      alert('Only Global Segmentation Lead (P1) can validate recalibration recommendations.');
      return;
    }

    setRecalibrationList((prev) =>
      prev.map((r) => (r.recommendation_id === recId ? { ...r, status: 'Approved' as const } : r))
    );

    setToast({
      id: `toast-${Date.now()}`,
      type: 'success',
      message: 'Recalibration Recommendation Validated',
      subtext: 'Threshold parameters adjusted. Controlled learning policy recorded in audit log.',
    });
  };

  const handleDeclineRecalibration = (recId: string) => {
    if (currentPersona !== 'P1') {
      alert('Only Global Segmentation Lead (P1) can decline recalibration recommendations.');
      return;
    }

    setRecalibrationList((prev) =>
      prev.map((r) => (r.recommendation_id === recId ? { ...r, status: 'Declined' as const } : r))
    );

    setToast({
      id: `toast-${Date.now()}`,
      type: 'info',
      message: 'Recalibration Recommendation Declined',
      subtext: 'Existing drift detection sensitivity maintained.',
    });
  };

  // Change Log Columns
  const auditColumns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (a) => <span className="font-mono text-xs text-slate-700">{a.timestamp.replace('T', ' ')}</span>,
    },
    {
      key: 'actor_persona',
      header: 'Decision Maker',
      render: (a) => <ApproverPill role={a.actor_persona} />,
    },
    {
      key: 'action',
      header: 'Action',
      render: (a) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
          a.action.includes('approved') || a.action.includes('activated') || a.action.includes('back')
            ? 'bg-teal-50 text-teal-700 border border-teal-200'
            : a.action.includes('rejected')
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-slate-100 text-slate-800'
        }`}>
          {a.action}
        </span>
      ),
    },
    {
      key: 'entity',
      header: 'Customer',
      render: (a) => (
        <div>
          <span className="font-mono text-xs font-bold text-navy-900">{a.entity_id}</span>
          <div className="text-2xs text-slate-500">{a.entity_type} · {a.market_code}</div>
        </div>
      ),
    },
    {
      key: 'transition',
      header: 'Before → After',
      render: (a) => (
        <div className="text-xs font-mono">
          <span className="text-slate-500">{a.before_value}</span>
          <span className="mx-1 text-slate-400">&rarr;</span>
          <span className="font-bold text-navy-900">{a.after_value}</span>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Evidence / Reason',
      render: (a) => <span className="text-xs text-slate-600 line-clamp-2">{a.reason}</span>,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Audit Trail & Controlled Learning"
        question="Can we prove every change, and are we learning safely?"
        actions={
          currentTab === 'change-log' ? (
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit CSV</span>
            </button>
          ) : undefined
        }
      />

      <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* TAB 1: CHANGE LOG */}
      {currentTab === 'change-log' && (
        <div className="space-y-6">
          {/* Strict Invariant Banner */}
          <div className="bg-white border border-teal-200 rounded-lg p-4 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-body font-bold text-navy-900 flex items-center gap-2">
                  <span>Audit Trail Invariant: 0 Unapproved Write-Backs</span>
                  <span className="text-2xs font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Every segment attribute modification in Veeva CRM is mapped 1:1 to an approved audit ledger entry with actor, timestamp, and grounded evidence.
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-slate-400">
              {filteredAuditLog.length} Immutable Entries
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <DataTable
              data={filteredAuditLog}
              columns={auditColumns}
              rowKey={(a) => a.audit_id}
              pageSize={15}
            />
          </div>
        </div>
      )}

      {/* TAB 2: VERSION HISTORY */}
      {currentTab === 'version-history' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
            <h3 className="text-section-title text-navy-900">
              Segmentation Lifecycle Timeline by Market &amp; Brand
            </h3>

            <div className="space-y-6">
              {libraryVersions.map((v, idx) => (
                <div key={v.version_id} className="flex items-start gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-8 h-8 rounded-full bg-navy-50 text-navy-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-body-sm text-navy-900">{v.name}</span>
                        <StatusBadge status={v.status} />
                      </div>
                      <span className="text-xs font-mono text-slate-500">{v.created_date}</span>
                    </div>

                    <p className="text-xs text-slate-600 font-mono">
                      {v.version_id} · Market {v.market_code} · Brand {v.brand_code} · {v.method} · {v.records_segmented.toLocaleString()} HCPs
                    </p>

                    <p className="text-xs text-slate-500 italic mt-1">
                      {v.notes}
                    </p>

                    <div className="flex items-center gap-4 text-2xs text-slate-500 pt-1">
                      <span>Author: <strong>{v.author_user_id}</strong></span>
                      {v.approved_by && <span>Approved by: <strong>{v.approved_by}</strong></span>}
                      {v.activated_date && <span>Activated: <strong>{v.activated_date}</strong></span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: MODEL RECALIBRATION */}
      {currentTab === 'recalibration' && (
        <div className="space-y-6">
          {/* Feedback loop telemetry cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <KpiTile
              label="Field Proposal Acceptance"
              value="80.2%"
              delta={{ value: '+5.2% vs previous quarter', direction: 'up', isPositive: true }}
              tooltip="Percentage of generated living proposals accepted by named owners"
            />
            <KpiTile
              label="Field Override Rate"
              value="8.4%"
              delta={{ value: 'Down from 21.0% baseline', direction: 'down', isPositive: true }}
              tooltip="Manual customer adjustments required in field"
            />
            <KpiTile
              label="Coverage of Rising Prescribers"
              value="94.2%"
              delta={{ value: 'Captured 420 rising HCPs', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Top Rejection Reason"
              value="Knowledge Contradicts (46%)"
              delta={{ value: 'Drives threshold recalibration', direction: 'neutral' }}
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Sliders className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-body font-semibold text-amber-900">
                Principle 7: Controlled Learning Policy
              </h4>
              <p className="text-body-sm text-amber-800 mt-0.5">
                &ldquo;Approvals, rejections and downstream outcomes feed a recalibration recommendation that a model owner validates. The application NEVER exhibits autonomous automated retraining.&rdquo;
              </p>
            </div>
          </div>

          {/* Recalibration Recommendations Grid */}
          <div className="space-y-4">
            <h3 className="text-section-title text-navy-900">
              Active Drift Recalibration Recommendations (Model Owner Review)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recalibrationList.map((rec) => (
                <div
                  key={rec.recommendation_id}
                  className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {rec.recommendation_id} · {rec.market_code}
                      </span>
                      <span
                        className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                          rec.status === 'Approved'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : rec.status === 'Declined'
                            ? 'bg-slate-100 text-slate-500'
                            : rec.status === 'Under validation'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {rec.status === 'Approved'
                          ? 'Approved & Validated'
                          : rec.status === 'Declined'
                          ? 'Declined'
                          : rec.status === 'Under validation'
                          ? 'Under Validation'
                          : 'Recommended'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-semibold text-body-sm text-navy-900">{rec.issue}</h4>
                      <p className="text-xs text-slate-600 mt-1">{rec.recommendation}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Dimension:</span>
                        <span className="font-bold text-navy-900">{rec.dimension_code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Top Rejection Reason:</span>
                        <span className="text-slate-700 font-semibold">{rec.evidence.top_reason} ({rec.evidence.rejections} rejections)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rejection Rate:</span>
                        <span>{(rec.evidence.rejection_rate * 100).toFixed(0)}%</span>
                      </div>
                      <div className="flex justify-between text-teal-700 font-bold">
                        <span>Rising Coverage:</span>
                        <span>{(rec.evidence.coverage_of_rising_customers * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-2xs text-slate-400">Requires Global Lead (P1) sign-off</span>

                    {rec.status === 'Recommended' || rec.status === 'Under validation' ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeclineRecalibration(rec.recommendation_id)}
                          className="px-3 py-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium rounded border border-slate-300"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleValidateRecalibration(rec.recommendation_id)}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded shadow-2xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Validate &amp; Apply</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        Decision recorded in audit log ({rec.status})
                      </span>
                    )}
                  </div>
                </div>
              ))}
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

export default S13_AuditAndLearning;
