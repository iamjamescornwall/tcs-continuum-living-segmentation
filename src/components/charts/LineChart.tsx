import React from 'react';
import {
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export interface LineSeries {
  dataKey: string;
  color: string;
  name?: string;
  strokeDasharray?: string;
  strokeWidth?: number;
}

export interface LineChartProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: Array<Record<string, any>>;
  series: LineSeries[];
  height?: number;
  formatY?: (val: number) => string;
  className?: string;
}

export const LineChartComponent: React.FC<LineChartProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  data,
  series,
  height = 280,
  formatY,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col shadow-2xs ${className}`}>
      {/* Header with Title and "So What" caption */}
      <div className="mb-3">
        <h3 className="text-section-title text-navy-900 leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-normal italic">{soWhat}</p>
      </div>

      <div style={{ height, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 10, right: 15, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#5C7080', fontSize: 12 }}
              tickLine={false}
              label={{
                value: xAxisLabel,
                position: 'insideBottom',
                offset: -10,
                fill: '#5C7080',
                fontSize: 11,
              }}
            />
            <YAxis
              tick={{ fill: '#5C7080', fontSize: 12 }}
              tickLine={false}
              tickFormatter={formatY}
              label={{
                value: yAxisLabel,
                angle: -90,
                position: 'insideLeft',
                fill: '#5C7080',
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0B2740',
                borderRadius: '6px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
              formatter={(val: any) => [formatY ? formatY(Number(val)) : val, '']}
            />
            {series.length > 1 && (
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '8px', fontSize: '11px' }}
              />
            )}
            {series.map((s) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                stroke={s.color}
                name={s.name || s.dataKey}
                strokeWidth={s.strokeWidth || 2}
                strokeDasharray={s.strokeDasharray}
                dot={{ r: 3, fill: s.color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChartComponent;
