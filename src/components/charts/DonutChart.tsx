import React from 'react';
import {
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export interface DonutDataItem {
  name: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  title: string;
  soWhat: string;
  data: DonutDataItem[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  centerLabel?: string;
  centerValue?: string | number;
  height?: number;
  formatValue?: (val: number) => string;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  title,
  soWhat,
  data,
  xAxisLabel = 'Categories',
  yAxisLabel = 'Share / Distribution',
  centerLabel,
  centerValue,
  height = 280,
  formatValue,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col shadow-2xs ${className}`}>
      {/* Header */}
      <div className="mb-2">
        <h3 className="text-section-title text-navy-900 leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-normal italic">{soWhat}</p>
      </div>

      {/* Axis Information Banner */}
      <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
        <span>Y: {yAxisLabel}</span>
        <span>X: {xAxisLabel}</span>
      </div>

      <div className="relative" style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={1} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B2740',
                borderRadius: '6px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: any) => [formatValue ? formatValue(Number(val)) : val, '']}
            />
            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
            />
          </RechartsPieChart>
        </ResponsiveContainer>

        {/* Center label */}
        {(centerValue !== undefined || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
            {centerValue !== undefined && (
              <span className="text-xl font-bold text-navy-900">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
        <div>
          <span className="font-medium text-slate-600">Metric (Y):</span> {yAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-600">Breakdown (X):</span> {xAxisLabel}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
