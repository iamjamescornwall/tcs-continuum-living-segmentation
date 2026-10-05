import React from 'react';

export interface PageHeaderProps {
  title: string;
  question: string;
  category?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  question,
  category,
  actions,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-slate-200/80 ${className}`}
    >
      <div>
        {category && (
          <div className="text-3xs font-bold uppercase tracking-wider text-slate-400 mb-1">
            {category}
          </div>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-normal italic mt-0.5">
          "{question}"
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0 sm:self-center">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
