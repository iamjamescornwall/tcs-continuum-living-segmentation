import React, { useState } from 'react';

export interface BoxPlotItem {
  group: string;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers?: number[];
  color?: string;
}

export interface BoxPlotProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: BoxPlotItem[];
  height?: number;
  formatY?: (val: number) => string;
  className?: string;
  onBoxClick?: (item: BoxPlotItem) => void;
}

export const BoxPlot: React.FC<BoxPlotProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  data,
  height = 300,
  formatY = (v) => v.toLocaleString(),
  className = '',
  onBoxClick,
}) => {
  const [hoveredItem, setHoveredItem] = useState<{
    item: BoxPlotItem;
    x: number;
    y: number;
  } | null>(null);

  // Compute global min and max across all data items (including outliers)
  const allValues = data.flatMap((d) => [
    d.min,
    d.q1,
    d.median,
    d.q3,
    d.max,
    ...(d.outliers || []),
  ]);
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const maxVal = allValues.length ? Math.max(...allValues) : 100;
  const padding = (maxVal - minVal) * 0.1 || 10;
  const yDomainMin = Math.max(0, Math.floor(minVal - padding));
  const yDomainMax = Math.ceil(maxVal + padding);

  const defaultColors = ['#0E7C86', '#5B6ABF', '#E9B44C', '#B0603C', '#5C7080'];

  const svgWidth = 600;
  const margin = { top: 20, right: 30, bottom: 40, left: 60 };
  const innerWidth = svgWidth - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const yScale = (val: number) => {
    return innerHeight - ((val - yDomainMin) / (yDomainMax - yDomainMin)) * innerHeight;
  };

  const numTicks = 5;
  const yTicks = Array.from({ length: numTicks + 1 }, (_, i) => {
    return yDomainMin + (i * (yDomainMax - yDomainMin)) / numTicks;
  });

  const groupWidth = data.length > 0 ? innerWidth / data.length : innerWidth;
  const boxWidth = Math.min(Math.max(groupWidth * 0.45, 24), 60);

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

      <div className="relative w-full overflow-x-auto" onMouseLeave={() => setHoveredItem(null)}>
        <svg
          viewBox={`0 0 ${svgWidth} ${height}`}
          className="w-full h-auto select-none"
          style={{ minHeight: height }}
        >
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* Horizontal Grid lines */}
            {yTicks.map((tickVal, i) => {
              const y = yScale(tickVal);
              return (
                <g key={`tick-${i}`}>
                  <line
                    x1={0}
                    y1={y}
                    x2={innerWidth}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={-10}
                    y={y}
                    dy="0.32em"
                    textAnchor="end"
                    className="text-2xs fill-slate-500 font-mono"
                  >
                    {formatY(tickVal)}
                  </text>
                </g>
              );
            })}

            {/* Boxes for each group */}
            {data.map((item, idx) => {
              const centerX = idx * groupWidth + groupWidth / 2;
              const color = item.color || defaultColors[idx % defaultColors.length];
              const yMin = yScale(item.min);
              const yQ1 = yScale(item.q1);
              const yMed = yScale(item.median);
              const yQ3 = yScale(item.q3);
              const yMax = yScale(item.max);

              const isHovered = hoveredItem?.item.group === item.group;

              return (
                <g
                  key={item.group}
                  className="cursor-pointer group"
                  onClick={() => onBoxClick?.(item)}
                  onMouseEnter={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHoveredItem({
                      item,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                >
                  {/* Whisker line from Min to Max */}
                  <line
                    x1={centerX}
                    y1={yMin}
                    x2={centerX}
                    y2={yMax}
                    stroke="#5C7080"
                    strokeWidth={1.5}
                  />

                  {/* Whisker Top Cap (Max) */}
                  <line
                    x1={centerX - boxWidth / 4}
                    y1={yMax}
                    x2={centerX + boxWidth / 4}
                    y2={yMax}
                    stroke="#5C7080"
                    strokeWidth={1.5}
                  />

                  {/* Whisker Bottom Cap (Min) */}
                  <line
                    x1={centerX - boxWidth / 4}
                    y1={yMin}
                    x2={centerX + boxWidth / 4}
                    y2={yMin}
                    stroke="#5C7080"
                    strokeWidth={1.5}
                  />

                  {/* IQR Box (Q3 to Q1) */}
                  <rect
                    x={centerX - boxWidth / 2}
                    y={Math.min(yQ1, yQ3)}
                    width={boxWidth}
                    height={Math.max(Math.abs(yQ1 - yQ3), 2)}
                    fill={color}
                    fillOpacity={isHovered ? 0.9 : 0.75}
                    stroke={color}
                    strokeWidth={2}
                    rx={2}
                    className="transition-all duration-150"
                  />

                  {/* Median Line */}
                  <line
                    x1={centerX - boxWidth / 2}
                    y1={yMed}
                    x2={centerX + boxWidth / 2}
                    y2={yMed}
                    stroke="#FFFFFF"
                    strokeWidth={2.5}
                  />

                  {/* Outlier Dots */}
                  {item.outliers?.map((val, outIdx) => (
                    <circle
                      key={`outlier-${outIdx}`}
                      cx={centerX}
                      cy={yScale(val)}
                      r={3}
                      fill="#B03A2E"
                      stroke="#FFFFFF"
                      strokeWidth={1}
                    />
                  ))}

                  {/* Group Label on X-axis */}
                  <text
                    x={centerX}
                    y={innerHeight + 20}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-navy-900 group-hover:fill-teal-700"
                  >
                    {item.group}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Floating Tooltip */}
        {hoveredItem && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-navy-900 text-white text-xs rounded-md py-2 px-3 shadow-lg border border-navy-700 max-w-xs font-mono"
            style={{ left: hoveredItem.x, top: hoveredItem.y - 6 }}
          >
            <div className="font-sans font-bold text-slate-100 mb-1 border-b border-navy-700 pb-1">
              {hoveredItem.item.group}
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-2xs">
              <span className="text-slate-400">Max:</span>
              <span className="text-slate-100 text-right">{formatY(hoveredItem.item.max)}</span>
              <span className="text-slate-400">Q3 (75%):</span>
              <span className="text-slate-100 text-right">{formatY(hoveredItem.item.q3)}</span>
              <span className="text-teal-300 font-bold">Median:</span>
              <span className="text-teal-300 font-bold text-right">
                {formatY(hoveredItem.item.median)}
              </span>
              <span className="text-slate-400">Q1 (25%):</span>
              <span className="text-slate-100 text-right">{formatY(hoveredItem.item.q1)}</span>
              <span className="text-slate-400">Min:</span>
              <span className="text-slate-100 text-right">{formatY(hoveredItem.item.min)}</span>
              {hoveredItem.item.outliers && hoveredItem.item.outliers.length > 0 && (
                <>
                  <span className="text-rust-400">Outliers:</span>
                  <span className="text-rust-300 text-right">
                    {hoveredItem.item.outliers.length} detected
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
        <div>
          <span className="font-medium text-slate-600">Distribution (Y):</span> {yAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-600">Cohorts (X):</span> {xAxisLabel}
        </div>
      </div>
    </div>
  );
};
