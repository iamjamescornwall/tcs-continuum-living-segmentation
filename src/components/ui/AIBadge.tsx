import React from 'react';
import { Sparkles } from 'lucide-react';

export interface AIBadgeProps {
  providerName?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const AIBadge: React.FC<AIBadgeProps> = ({
  providerName = 'MockProvider (offline)',
  className = '',
  size = 'md',
}) => {
  const tooltipText = `AI-drafted · reviewed by owner before use · Provider: ${providerName}`;
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-help ${sizeClasses} ${className}`}
      title={tooltipText}
    >
      <Sparkles className="w-3 h-3 text-indigo-500 mr-1 shrink-0" />
      <span>AI-drafted</span>
    </span>
  );
};

export default AIBadge;
