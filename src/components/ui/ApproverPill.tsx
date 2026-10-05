import React from 'react';
import { ShieldCheck } from 'lucide-react';

export interface ApproverPillProps {
  role: string;
  showIcon?: boolean;
  className?: string;
}

export const ApproverPill: React.FC<ApproverPillProps> = ({
  role,
  showIcon = true,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-gold-500 text-navy-900 bg-gold-500/15 shadow-2xs ${className}`}
      title={`Approval required by: ${role}`}
    >
      {showIcon && <ShieldCheck className="w-3 h-3 text-amber-700 mr-1 inline shrink-0" />}
      <span>{role}</span>
    </span>
  );
};

export default ApproverPill;
