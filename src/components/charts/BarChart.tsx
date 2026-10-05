import React from 'react';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export interface BarSeries {
  dataKey: string;
  color: string;
  name?: string;
  stackId?: string;
}

export interface BarChartProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: Array<Record<string, any>>;
  series: BarSeries[];
  height?: number;
  layout?: 'horizontal' | 'vertical';
  formatY?: (val: number) => string;
  className?: string;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  data,
  series,
  height = 280,
  layout = 'horizontal',
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
          <RechartsBarChart
            data={data}
            layout={layout}
            margin={{ top: 10, right: 15, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            {layout === 'horizontal' ? (
              <>
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
              </>
            ) : (
              <>
                <XAxis
                  type="number"
                  tick={{ fill: '#5C7080', fontSize: 12 }}
                  tickFormatter={formatY}
                  label={{
                    value: xAxisLabel,
                    position: 'insideBottom',
                    offset: -10,
                    fill: '#5C7080',
                    fontSize: 11,
                  }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#5C7080', fontSize: 12 }}
                  tickLine={false}
                  width={90}
                  label={{
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    fill: '#5C7080',
                    fontSize: 11,
                  }}
                />
              </>
            )}
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
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                fill={s.color}
                name={s.name || s.dataKey}
                stackId={s.stackId}
                radius={s.stackId ? undefined : [4, 4, 0, 0]}
              />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartComponent;
