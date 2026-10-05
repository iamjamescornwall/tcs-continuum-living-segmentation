import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line } from 'recharts';

export interface KpiTileProps {
  label: string;
  value: string | number;
  delta?: {
    value: string | number;
    direction?: 'up' | 'down' | 'neutral';
    isPositive?: boolean; // if undefined, 'up' is green/teal, 'down' is red
    subtext?: string;
  };
  sparklineData?: Array<{ value: number }>;
  tooltip?: string;
  className?: string;
}

export const KpiTile: React.FC<KpiTileProps> = ({
  label,
  value,
  delta,
  sparklineData,
  tooltip,
  className = '',
}) => {
  const getDeltaColor = () => {
    if (!delta) return '';
    if (delta.direction === 'neutral') return 'text-slate-500';
    
    // In pharma / analytics: usually up = positive unless specified otherwise
    const isGood = delta.isPositive !== undefined ? delta.isPositive : delta.direction === 'up';
    return isGood ? 'text-teal-600' : 'text-red-700';
  };

  const DeltaIcon = () => {
    if (!delta || !delta.direction || delta.direction === 'neutral') {
      return <Minus className="w-3.5 h-3.5 inline mr-0.5" />;
    }
    return delta.direction === 'up' ? (
      <ArrowUp className="w-3.5 h-3.5 inline mr-0.5" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 inline mr-0.5" />
    );
  };

  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col justify-between shadow-sm hover:border-slate-300 transition-all ${className}`}
      title={tooltip}
    >
      <div className="text-label-caps text-slate-500 mb-1 truncate">{label}</div>
      <div className="flex items-baseline justify-between gap-2 my-1">
        <div className="text-[26px] font-semibold tracking-tight text-navy-900 leading-none">
          {value}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="w-20 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0E7C86"
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {delta && (
        <div className="flex items-center text-xs mt-1">
          <span className={`font-medium flex items-center ${getDeltaColor()}`}>
            <DeltaIcon />
            {delta.value}
          </span>
          {delta.subtext && (
            <span className="text-slate-500 ml-1.5 truncate">{delta.subtext}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default KpiTile;
