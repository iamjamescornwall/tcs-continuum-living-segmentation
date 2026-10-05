import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Video,
  Monitor,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { SegmentAgeChip } from '../components/ui/SegmentAgeChip';
import { ApproverPill } from '../components/ui/ApproverPill';
import { ConfidenceChip } from '../components/ui/ConfidenceChip';
import { StatusBadge } from '../components/ui/StatusBadge';
import { AIBadge } from '../components/ui/AIBadge';
import { ConfirmChangeModal } from '../components/ui/ConfirmChangeModal';
import { Toast, ToastMessage } from '../components/ui/Toast';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import governanceService from '../services/governanceService';
import { RejectionReason } from '../types';

export const D01_Customer360: React.FC = () => {
  const { type = 'hcp', id = 'HCP-B-0001' } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const { currentPersona, proposals, approveProposal, rejectProposal } = useAppStore();

  const isHcp = type.toLowerCase() === 'hcp';
  const hcp = isHcp ? dataService.getHcpById(id) : undefined;
  const account = !isHcp ? dataService.getAccountById(id) : undefined;
  const customerName = hcp?.display_name || account?.name || id;

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    actionType: 'approve' | 'reject';
  }>({
    isOpen: false,
    actionType: 'approve',
  });

  // Current customer proposal
  const openProposal = proposals.find((p) => p.customer_id === id);

  // Common customer data
  const repNotes = isHcp
    ? dataService.getRepNotes({ hcpId: id })
    : dataService.getRepNotes({ hcoId: id });
  const affiliations = isHcp
    ? dataService.getAffiliations({ hcpId: id })
    : dataService.getAffiliations({ hcoId: id });
  const formularyStatuses = !isHcp ? dataService.getFormularyStatus({ hcoId: id }) : [];

  // Prescriber sales query (Market C proxy protection)
  const salesResult = isHcp ? dataService.getSales({ entityId: id, market: hcp?.market_code }) : null;

  // Governed dimensions for HCP
  const governedDimensions = [
    { dim: 'SEGMENT', label: 'Commercial Segment', value: openProposal?.current_value || 'Segment B', owner: 'P2', date: '2026-05-04' },
    { dim: 'POTENTIAL', label: 'Prescriber Potential Tier', value: 'Tier 1 (High)', owner: 'P1', date: '2026-01-10' },
    { dim: 'ADOPTION', label: 'Customer Adoption Stage', value: 'Trial Phase', owner: 'P4', date: '2026-09-18' },
    { dim: 'BEHAVIOURAL', label: 'Behavioural Archetype', value: 'Scientific Fast Follower', owner: 'P1', date: '2026-01-10' },
    { dim: 'DIGITAL', label: 'Digital Engagement Score', value: '82nd Percentile (High)', owner: 'P4', date: '2026-10-02' },
    { dim: 'CHANNEL_PREF', label: 'Preferred Channel', value: 'Remote Video & Rep Email', owner: 'P4', date: '2026-08-15' },
  ];

  // Actions
  const handleApproveProposal = () => {
    if (!openProposal) return;
    const check = governanceService.canApprove(currentPersona, openProposal.market_code, openProposal.dimension_code);
    if (!check.allowed) {
      alert(check.reason || 'Your role cannot approve this field in this market.');
      return;
    }
    setConfirmModal({ isOpen: true, actionType: 'approve' });
  };

  const handleRejectProposal = () => {
    if (!openProposal) return;
    if (currentPersona === 'P6') {
      alert('Executive role is read-only.');
      return;
    }
    setConfirmModal({ isOpen: true, actionType: 'reject' });
  };

  const handleConfirmDecision = (reason?: string) => {
    if (!openProposal) return;
    if (confirmModal.actionType === 'approve') {
      approveProposal(openProposal.proposal_id, currentPersona, reason);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'success',
        message: 'Proposal Approved · Queued for Publish to CRM',
        subtext: `${customerName} moved to ${openProposal.proposed_value}.`,
      });
    } else {
      const rejReason = (reason as RejectionReason) || 'Field knowledge contradicts signal';
      rejectProposal(openProposal.proposal_id, rejReason, currentPersona);
      setToast({
        id: `toast-${Date.now()}`,
        type: 'warning',
        message: 'Proposal Rejected · Recorded for Model Recalibration',
        subtext: `Reason: ${rejReason}. Fed into S13 without autonomous retrain.`,
      });
    }
    setConfirmModal({ isOpen: false, actionType: 'approve' });
  };

  if (!hcp && !account) {
    return (
      <div className="p-12 text-center">
        <h3 className="text-body font-semibold text-navy-900">Customer record not found</h3>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-navy-900 text-white rounded text-xs font-semibold"
        >
          Return to previous view
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-navy-900 flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to previous screen</span>
        </button>
        <span>/</span>
        <span className="text-navy-900 font-semibold">
          Customer 360 ({isHcp ? 'Prescriber' : 'Account'})
        </span>
      </div>

      {/* HEADER SECTION */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-navy-900 shrink-0">
              {isHcp ? <User className="w-6 h-6" /> : <Building2 className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-page-title text-navy-900">
                  {isHcp ? hcp?.display_name : account?.name}
                </h1>
                {id === 'HCP-B-0001' && (
                  <span className="text-2xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-300">
                    HERO HCP
                  </span>
                )}
                {id === 'ACC-B-001' && (
                  <span className="text-2xs font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-300">
                    HERO ACCOUNT
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isHcp
                  ? `${hcp?.specialty} · ${hcp?.practice_type} · Territory ${hcp?.territory_id} · ${hcp?.market_code}`
                  : `${account?.archetype} · ${account?.hco_type} · ${account?.region} · ${account?.market_code}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xs text-slate-500 uppercase font-semibold">Active Governed Segment</div>
              <div className="flex items-center gap-2 mt-0.5 justify-end">
                <span className="text-body font-bold text-navy-900">
                  {openProposal ? openProposal.current_value : 'Segment B'}
                </span>
                <SegmentAgeChip days={openProposal ? openProposal.segment_age_days : 164} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OPEN PROPOSAL BANNER (IF PRESENT) */}
      {openProposal && (
        <div className="bg-gradient-to-r from-teal-50/80 to-indigo-50/80 border border-teal-200 rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AIBadge providerName="MockProvider" />
              <span className="text-xs font-semibold text-navy-900 uppercase tracking-wide">
                Living Loop Change Proposal Pending Human Decision
              </span>
            </div>
            <StatusBadge status={openProposal.status} />
          </div>

          {(() => {
            const aiCard = openProposal ? (dataService.getAiCache('AI-3', openProposal.explanation_key || openProposal.proposal_id) as any) : null;
            const proposalHeadline = aiCard?.headline || `Proposed ${openProposal.dimension_code} change from ${openProposal.current_value} to ${openProposal.proposed_value}`;
            return (
              <>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-body font-bold text-navy-900 leading-snug">
                      {proposalHeadline}
                    </h3>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="font-mono text-slate-600">Proposed Move:</span>
                      <span className="font-mono font-bold text-slate-500">{openProposal.current_value}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                        {openProposal.proposed_value}
                      </span>
                      <span className="text-slate-300">·</span>
                      <ConfidenceChip confidence={openProposal.confidence} />
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">Owner: {openProposal.approver_role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {openProposal.status === 'Held' ? (
                      <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded border border-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        <span>Held by rule {openProposal.policy_rule_ref}</span>
                      </div>
                    ) : openProposal.status === 'Approved' ? (
                      <div className="text-xs text-teal-800 bg-teal-50 px-3 py-1.5 rounded border border-teal-300 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-teal-600" />
                        <span>Approved · Queued for CRM write-back</span>
                      </div>
                    ) : openProposal.status === 'Rejected' ? (
                      <div className="text-xs text-red-800 bg-red-50 px-3 py-1.5 rounded border border-red-300 flex items-center gap-1.5 font-medium">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span>Rejected · Logged to recalibration</span>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={handleRejectProposal}
                          className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-white hover:bg-red-50 border border-red-300 rounded shadow-2xs"
                        >
                          Reject with Reason
                        </button>
                        <button
                          onClick={handleApproveProposal}
                          className="px-4 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded shadow-2xs flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Approve Proposal</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Evidence drivers */}
                <div className="pt-3 border-t border-teal-200/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {openProposal.drivers.map((d, idx) => {
                    const dir = (d as any).direction;
                    const isUp = dir === 'up' || dir === 'Up' || (typeof d.value === 'string' && d.value.startsWith('+'));
                    return (
                      <div key={idx} className="bg-white p-2.5 rounded border border-teal-100 text-xs flex justify-between">
                        <span className="text-slate-600">{d.label}</span>
                        <span className="font-mono font-bold text-teal-700">
                          {isUp ? '▲ ' : ''}{d.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* HCP CONTENT */}
      {isHcp && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Governed Dimensions & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Governed Dimensions Table */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-section-title text-navy-900">Governed Customer Dimensions</h3>
              <div className="divide-y divide-slate-100">
                {governedDimensions.map((row) => (
                  <div key={row.dim} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-navy-900">{row.label}</div>
                      <div className="text-2xs text-slate-500 font-mono">{row.dim}</div>
                    </div>
                    <div className="font-mono font-bold text-navy-900">{row.value}</div>
                    <div className="flex items-center gap-2">
                      <ApproverPill role={row.owner} />
                      <span className="text-slate-400 font-mono text-2xs">{row.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signal Telemetry: Rx & CRM Activity */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-4">
              <h3 className="text-section-title text-navy-900">Observed Prescribing &amp; Engagement Telemetry</h3>

              {salesResult && !salesResult.available ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold">Sales Signal Policy: </span>
                    <span>{salesResult.proxy || 'Not available in this market — using proxy: rep assessment + PMR'}</span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs flex justify-between font-mono">
                  <span>Weekly Aurelix TRx Volume: <strong>48 Scripts (+34% QoQ)</strong></span>
                  <span className="text-teal-700 font-semibold">NBRx New Starts: 14 (+56%)</span>
                </div>
              )}

              {/* Rep Notes with AI-5 Extraction */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                  Recent Rep Notes &amp; Signal Extraction (AI-5)
                </h4>
                {repNotes.length > 0 ? (
                  repNotes.map((note) => (
                    <div key={note.note_id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-2xs text-slate-500">
                        <span>{note.rep_user_id} · {note.date}</span>
                        <AIBadge providerName="MockProvider" size="sm" />
                      </div>
                      <p className="text-xs text-navy-900 italic">&ldquo;{note.text}&rdquo;</p>
                      {note.extracted_signals?.map((sig, sIdx) => (
                        <div key={sIdx} className="p-2 bg-indigo-50 border border-indigo-200 rounded text-2xs text-indigo-900 flex justify-between items-center">
                          <span>Extracted: <strong>{sig.dimension_code} ({sig.direction} &rarr; {sig.proposed_value})</strong></span>
                          <ConfidenceChip confidence={sig.confidence} />
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">No field notes logged in current cycle.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Consent, Affiliations, History */}
          <div className="space-y-6">
            {/* Consent & Channel Preference */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-section-title text-navy-900">Consent &amp; Channel Preference</h3>
              <p className="text-2xs text-slate-500">Downstream campaigns respect explicit consent ticks.</p>
              <div className="space-y-2 pt-1 text-xs">
                {[
                  { channel: 'Face-to-Face Detailing', granted: true, icon: <User className="w-3.5 h-3.5 text-teal-600" /> },
                  { channel: 'Remote Video Calls', granted: true, icon: <Video className="w-3.5 h-3.5 text-teal-600" /> },
                  { channel: 'Rep-Triggered Email', granted: true, icon: <Mail className="w-3.5 h-3.5 text-teal-600" /> },
                  { channel: 'Self-Serve HCP Portal', granted: true, icon: <Monitor className="w-3.5 h-3.5 text-teal-600" /> },
                  { channel: 'Educational Events', granted: false, icon: <Calendar className="w-3.5 h-3.5 text-slate-400" /> },
                ].map((c) => (
                  <div key={c.channel} className="flex items-center justify-between p-2 rounded bg-slate-50">
                    <div className="flex items-center gap-2">
                      {c.icon}
                      <span className="text-navy-900">{c.channel}</span>
                    </div>
                    {c.granted ? (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                        Consented
                      </span>
                    ) : (
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        Withdrawn
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Primary HCO Affiliations */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="text-section-title text-navy-900">Primary Account Affiliation</h3>
              {affiliations.map((af) => (
                <div
                  key={af.hco_id}
                  onClick={() => navigate(`/customer/hco/${af.hco_id}`)}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:border-teal-500 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-navy-900">St. Jude Medical Center</span>
                    <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <div className="text-2xs text-slate-500 font-mono mt-1">{af.hco_id} · Primary Affiliation (80% Weight)</div>
                  <div className="text-2xs text-teal-700 font-medium mt-1">Formulary: Preferred on Aurelix &amp; Zentrova</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT CONTENT */}
      {!isHcp && account && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <div className="text-2xs text-slate-500 uppercase font-semibold">Account Archetype</div>
              <div className="text-body font-bold text-navy-900 mt-1">{account.archetype}</div>
              <div className="text-xs text-slate-500 mt-0.5">{account.hco_type}</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <div className="text-2xs text-slate-500 uppercase font-semibold">Formulary Access</div>
              <div className="text-body font-bold text-teal-700 mt-1">
                {formularyStatuses[0]?.status || 'Preferred / Unrestricted'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">Zentrova win active</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <div className="text-2xs text-slate-500 uppercase font-semibold">Decision Model</div>
              <div className="text-body font-bold text-navy-900 mt-1">{account.decision_model}</div>
              <div className="text-xs text-slate-500 mt-0.5">{account.procurement_model}</div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <div className="text-2xs text-slate-500 uppercase font-semibold">Affiliated Prescribers</div>
              <div className="text-body font-bold text-navy-900 mt-1">
                {account.affiliated_hcp_count} Specialists
              </div>
              <div className="text-xs text-teal-700 mt-0.5">Propagation eligible</div>
            </div>
          </div>

          {/* Affiliated HCPs Table */}
          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs space-y-4">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Affiliated Specialist Prescribers</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Account formulary wins propagate potential upgrades to affiliated prescribers.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {affiliations.length || account.affiliated_hcp_count} linked HCPs
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {[
                { id: 'HCP-B-0001', name: 'Dr. Hanna Vogel', spec: 'Rheumatology', seg: 'Segment B', prop: 'Segment A', reason: 'Formulary preferred pull-through' },
                { id: 'HCP-B-0002', name: 'Dr. Marcus Webb', spec: 'Medical Oncology', seg: 'Segment B', prop: 'Segment A', reason: 'Zentrova institutional formulary win' },
                { id: 'HCP-B-0003', name: 'Dr. Elena Rostova', spec: 'Hematology', seg: 'Segment C', prop: 'Segment B', reason: 'Zentrova institutional formulary win' },
              ].map((row) => (
                <div
                  key={row.id}
                  onClick={() => navigate(`/customer/hcp/${row.id}`)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-semibold text-xs text-navy-900">{row.name}</div>
                    <div className="text-2xs text-slate-500 font-mono">{row.id} · {row.spec}</div>
                  </div>
                  <div className="text-xs font-mono">
                    <span className="text-slate-500">{row.seg}</span>
                    <ArrowRight className="w-3 h-3 inline mx-1.5 text-slate-400" />
                    <span className="text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                      {row.prop}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 italic">{row.reason}</div>
                  <button className="text-xs font-medium text-teal-600 flex items-center gap-1">
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && openProposal && (
        <ConfirmChangeModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, actionType: 'approve' })}
          onConfirm={handleConfirmDecision}
          title={confirmModal.actionType === 'approve' ? 'Approve Customer Segment Change' : 'Reject Change Proposal'}
          customerName={customerName}
          customerId={openProposal.customer_id}
          dimensionName={openProposal.dimension_code}
          beforeValue={openProposal.current_value}
          afterValue={openProposal.proposed_value}
          approverRole={currentPersona}
          actionType={confirmModal.actionType}
          confirmLabel={confirmModal.actionType === 'approve' ? 'Approve & Queue' : 'Confirm Rejection'}
          isDestructive={confirmModal.actionType === 'reject'}
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

export default D01_Customer360;
