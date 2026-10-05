import React, { useState } from 'react';
import Modal from './Modal';
import ApproverPill from './ApproverPill';
import { ArrowRight, AlertTriangle } from 'lucide-react';

export interface ConfirmChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  title: string;
  customerName?: string;
  customerId?: string;
  dimensionName: string;
  beforeValue: string;
  afterValue: string;
  approverRole: string;
  actionType: 'approve' | 'reject' | 'publish' | 'activate' | 'generic';
  confirmLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmChangeModal: React.FC<ConfirmChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  customerName,
  customerId,
  dimensionName,
  beforeValue,
  afterValue,
  approverRole,
  actionType,
  confirmLabel,
  isDestructive = false,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('Field knowledge contradicts signal');
  const [customNotes, setCustomNotes] = useState<string>('');

  const rejectionReasons = [
    'Field knowledge contradicts signal',
    'Temporary behaviour',
    'Data quality issue',
    'Freeze period',
    'Other',
  ];

  const handleConfirm = () => {
    if (actionType === 'reject') {
      const fullReason = selectedReason === 'Other' && customNotes ? `Other: ${customNotes}` : selectedReason;
      onConfirm(fullReason);
    } else {
      onConfirm(customNotes || undefined);
    }
  };

  const getButtonText = () => {
    if (confirmLabel) return confirmLabel;
    if (actionType === 'approve') return 'Approve Change';
    if (actionType === 'reject') return 'Confirm Rejection';
    if (actionType === 'publish') return 'Confirm Publish to CRM';
    if (actionType === 'activate') return 'Activate Version';
    return 'Confirm';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Governed change review and audit trail recording"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 border border-slate-300 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`px-4 py-1.5 rounded-md text-xs font-medium text-white transition-colors ${
              actionType === 'reject' || isDestructive
                ? 'bg-red-700 hover:bg-red-800'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {getButtonText()}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Customer & Approver Info */}
        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            {customerName && <div className="font-semibold text-navy-900 text-sm">{customerName}</div>}
            {customerId && <div className="text-xs text-slate-500 font-mono">{customerId}</div>}
          </div>
          <ApproverPill role={approverRole} />
        </div>

        {/* Before -> After Comparison */}
        <div>
          <label className="text-label-caps text-slate-500 block mb-1.5">{dimensionName}</label>
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
            <div className="text-center flex-1">
              <span className="text-xs text-slate-400 block mb-0.5">Current Value</span>
              <span className="font-bold text-navy-900 text-base">{beforeValue}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 shrink-0 mx-2" />
            <div className="text-center flex-1">
              <span className="text-xs text-slate-400 block mb-0.5">Proposed Value</span>
              <span className={`font-bold text-base ${actionType === 'reject' ? 'text-red-700' : 'text-teal-600'}`}>
                {afterValue}
              </span>
            </div>
          </div>
        </div>

        {/* Rejection Reason Selector */}
        {actionType === 'reject' && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-navy-900 block flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rust-600" />
              Rejection Reason <span className="text-red-700">*</span>
            </label>
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2 text-xs text-navy-900 bg-white focus:outline-hidden focus:border-teal-600"
            >
              {rejectionReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

            {selectedReason === 'Other' && (
              <textarea
                placeholder="Specify rejection details for the recalibration loop..."
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                rows={2}
                className="w-full border border-slate-300 rounded-md p-2 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
              />
            )}
          </div>
        )}

        {/* Governance notice */}
        <p className="text-[11px] text-slate-500 italic">
          This decision will be immutably recorded in the Continuum audit log with your persona ID, timestamp, and supporting signal evidence.
        </p>
      </div>
    </Modal>
  );
};

export default ConfirmChangeModal;
