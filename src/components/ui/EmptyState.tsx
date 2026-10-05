import React from 'react';
import { Inbox, Loader2, Database } from 'lucide-react';

export type EmptyStateVariant = 'empty' | 'loading' | 'notAvailableInMarket';

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  proxyMessage?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = 'empty',
  title,
  description,
  proxyMessage = 'Not available in this market — using proxy: rep assessment + PMR',
  action,
  className = '',
}) => {
  if (variant === 'loading') {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
        <Loader2 className="w-8 h-8 text-teal-600 animate-spin mb-3" />
        <h4 className="text-sm font-semibold text-navy-900">{title || 'Loading data...'}</h4>
        {description && <p className="text-xs text-slate-500 mt-1 max-w-sm">{description}</p>}
      </div>
    );
  }

  if (variant === 'notAvailableInMarket') {
    return (
      <div className={`bg-slate-50 border border-slate-200 rounded-lg p-8 text-center flex flex-col items-center justify-center ${className}`}>
        <div className="w-10 h-10 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-500 mb-3">
          <Database className="w-5 h-5" />
        </div>
        <h4 className="text-sm font-semibold text-navy-900 mb-1">
          {title || 'Market Data Reality'}
        </h4>
        <p className="text-xs text-slate-600 font-medium max-w-md bg-white border border-slate-200 px-3 py-1.5 rounded">
          {proxyMessage}
        </p>
        {description && (
          <p className="text-xs text-slate-500 mt-2 max-w-md">{description}</p>
        )}
      </div>
    );
  }

  // Default 'empty'
  return (
    <div className={`p-10 text-center flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg bg-white/50 ${className}`}>
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Inbox className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-navy-900">{title || 'No records found'}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        {description || 'There are no items matching the selected filters or search criteria.'}
      </p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
