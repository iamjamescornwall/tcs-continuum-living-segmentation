import React from 'react';

export type ConfidenceType = 'High' | 'Medium' | 'Low' | string;

export interface ConfidenceChipProps {
  confidence: ConfidenceType;
  gapFilled?: boolean;
  className?: string;
  showDot?: boolean;
}

export const ConfidenceChip: React.FC<ConfidenceChipProps> = ({
  confidence,
  gapFilled = false,
  className = '',
  showDot = true,
}) => {
  const getStyles = () => {
    switch (confidence) {
      case 'High':
        return {
          bg: 'bg-teal-50',
          text: 'text-teal-700',
          border: gapFilled ? 'border-dashed border-teal-600' : 'border-teal-300',
          dot: 'bg-teal-600',
        };
      case 'Medium':
        return {
          bg: 'bg-orange-50',
          text: 'text-rust-600',
          border: gapFilled ? 'border-dashed border-rust-600' : 'border-rust-600/30',
          dot: 'bg-rust-600',
        };
      case 'Low':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: gapFilled ? 'border-dashed border-red-600' : 'border-red-300',
          dot: 'bg-red-700',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-600',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStyles();

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
      title={gapFilled ? `${confidence} confidence (gap-filled proxy)` : `${confidence} confidence`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${style.dot}`} />}
      {confidence}
      {gapFilled && <span className="ml-1 text-[10px] text-slate-500 font-normal">(proxy)</span>}
    </span>
  );
};

export default ConfidenceChip;
