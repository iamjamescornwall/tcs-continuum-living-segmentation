import React from 'react';
import Modal from '../ui/Modal';
import { appConfig } from '../../config/appConfig';
import { ShieldCheck, Cpu, Database, UserCheck, Layers } from 'lucide-react';

export interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="About Continuum" maxWidth="lg">
      <div className="space-y-4 text-xs text-navy-900 leading-relaxed">
        {/* Positioning Banner */}
        <div className="bg-navy-900 text-white rounded-lg p-4 border border-navy-700 shadow-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-bold text-base tracking-tight">{appConfig.appName}</span>
            <span className="text-2xs font-mono bg-teal-600/30 text-teal-300 border border-teal-500/40 px-1.5 py-0.5 rounded">
              v2.0 Enterprise
            </span>
          </div>
          <p className="text-teal-300 font-medium text-xs mb-2">
            {appConfig.tagline}
          </p>
          <blockquote className="text-slate-300 text-xs italic border-l-2 border-teal-500 pl-3 my-2">
            "{appConfig.positioningLine}"
          </blockquote>
        </div>

        {/* Living Segmentation Definition */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
          <h4 className="font-bold text-xs text-navy-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Definition of Living Segmentation</span>
          </h4>
          <p className="text-slate-700 leading-normal">
            {appConfig.definition}
          </p>
        </div>

        {/* Non-Negotiable Product Principles */}
        <div>
          <h4 className="font-bold text-xs text-navy-900 uppercase tracking-wider mb-2">
            Non-Negotiable Architecture Principles
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-2xs text-slate-600">
            <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded">
              <UserCheck className="w-3.5 h-3.5 text-gold-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-navy-900">AI proposes, people decide:</strong> No AI model
                ever writes directly to customer records. Every change requires named human approval.
              </span>
            </div>

            <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded">
              <Database className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-navy-900">Zero unapproved write-backs:</strong> Synchronizations
                to CRM (Veeva / OCE) happen strictly after human gate sign-off.
              </span>
            </div>

            <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-navy-900">Stability policy enforced:</strong> Freeze windows,
                frequency limits (max 2 changes/180d), and conflicting signals routed to Hold.
              </span>
            </div>

            <div className="flex items-start gap-2 p-2 bg-white border border-slate-200 rounded">
              <Cpu className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-navy-900">Controlled learning:</strong> Rejections and
                overrides feed recalibration recommendations; the system never shows auto-retraining.
              </span>
            </div>
          </div>
        </div>

        {/* Demo World Summary */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
          <span>Demo "Today": <strong className="text-navy-900 font-mono">2026-10-15</strong></span>
          <span>Coverage: 3 Markets · 5 Brands · 6 Personas</span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-navy-900 text-white rounded text-xs font-semibold hover:bg-navy-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
