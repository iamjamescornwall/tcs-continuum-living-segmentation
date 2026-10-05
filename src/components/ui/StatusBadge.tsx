import React from 'react';

export type StatusType =
  | 'Draft'
  | 'Approved'
  | 'Active'
  | 'Retired'
  | 'Proposed'
  | 'Held'
  | 'Rejected'
  | 'Written back'
  | string;

export interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getStyles = () => {
    switch (status) {
      case 'Active':
        return 'bg-navy-900 text-white border-navy-900';
      case 'Approved':
        return 'bg-teal-50 text-teal-700 border-teal-600';
      case 'Written back':
        return 'bg-teal-600 text-white border-teal-600 font-medium';
      case 'Proposed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-500';
      case 'Held':
        return 'bg-amber-50 text-amber-800 border-amber-600';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-600';
      case 'Draft':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'Retired':
        return 'bg-slate-50 text-slate-400 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${sizeClasses} ${getStyles()} ${className}`}
    >
      {status === 'Written back' && (
        <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 inline-block" />
      )}
      {status === 'Held' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mr-1.5 inline-block" />
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
