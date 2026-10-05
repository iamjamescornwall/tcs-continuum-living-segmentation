import React from 'react';
import { Clock } from 'lucide-react';

export interface SegmentAgeChipProps {
  days: number;
  label?: string; // override label, e.g. "164 days"
  showIcon?: boolean;
  className?: string;
}

export const SegmentAgeChip: React.FC<SegmentAgeChipProps> = ({
  days,
  label,
  showIcon = true,
  className = '',
}) => {
  const getStyles = () => {
    if (days < 90) {
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-300',
        icon: 'text-emerald-600',
        category: 'Fresh (<90d)',
      };
    } else if (days <= 180) {
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: 'text-amber-600',
        category: 'Aging (90–180d)',
      };
    } else {
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        icon: 'text-red-600',
        category: 'Stale (>180d)',
      };
    }
  };

  const style = getStyles();
  const displayLabel = label || `${days} days`;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
      title={`Segment set ${days} days ago — ${style.category}`}
    >
      {showIcon && <Clock className={`w-3 h-3 mr-1 inline ${style.icon}`} />}
      {displayLabel}
    </span>
  );
};

export default SegmentAgeChip;
