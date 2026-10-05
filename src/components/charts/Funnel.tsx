import React, { useState } from 'react';

export interface FunnelStage {
  name: string;
  count: number;
  subtext?: string;
  color?: string;
  holdCount?: number;
  conversionFromPrev?: number | string;
}

export interface FunnelProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  stages: FunnelStage[];
  height?: number;
  className?: string;
  onStageClick?: (stage: FunnelStage, index: number) => void;
}

export const Funnel: React.FC<FunnelProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  stages,
  className = '',
  onStageClick,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Maximum value for proportional widths/bars
  const maxVal = stages.length > 0 ? Math.max(...stages.map((s) => s.count), 1) : 1;
  const topVal = stages.length > 0 ? (stages[0].count || 1) : 1;

  // Default color palette for stages (Teal -> Indigo -> Gold -> Teal)
  const defaultColors = [
    '#0E7C86', // Signal watch (Teal)
    '#3CA5AE', // Drift detection
    '#5B6ABF', // Explanation (Indigo)
    '#E9B44C', // Proposal & routing (Gold - Human gate)
    '#0E7C86', // Written back / Recorded
  ];

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col shadow-2xs ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-section-title text-navy-900 leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-normal italic">{soWhat}</p>
      </div>

      {/* Axis Information Banner */}
      <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-4 px-1">
        <span>Y: {yAxisLabel}</span>
        <span>X: {xAxisLabel}</span>
      </div>

      {/* Funnel Flow Representation */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const color = stage.color || defaultColors[idx % defaultColors.length];
          const pctOfTop = Math.round((stage.count / topVal) * 100);
          const prevStage = idx > 0 ? stages[idx - 1] : null;
          const convRate =
            stage.conversionFromPrev !== undefined
              ? stage.conversionFromPrev
              : prevStage && prevStage.count > 0
              ? `${Math.round((stage.count / prevStage.count) * 100)}%`
              : null;

          const barWidthPct = Math.max(Math.round((stage.count / maxVal) * 100), 12);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={stage.name}
              className={`group transition-all rounded-md p-2.5 border ${
                isHovered
                  ? 'border-slate-300 bg-slate-50 shadow-xs'
                  : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50'
              } ${onStageClick ? 'cursor-pointer' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              onClick={() => onStageClick?.(stage, idx)}
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center bg-navy-900 text-white font-mono text-2xs font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-navy-900">{stage.name}</span>
                  {stage.subtext && (
                    <span className="text-slate-400 text-2xs">({stage.subtext})</span>
                  )}
                </div>

                <div className="flex items-center gap-3 font-mono">
                  {convRate && (
                    <span className="text-2xs text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {convRate} of prev
                    </span>
                  )}
                  <span className="font-bold text-sm text-navy-900">
                    {stage.count.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-slate-200/70 h-3 rounded-full overflow-hidden flex">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidthPct}%`,
                    backgroundColor: color,
                  }}
                />
              </div>

              {/* Auxiliary Info below bar (e.g. Holds, conversion from top) */}
              <div className="flex items-center justify-between text-2xs text-slate-500 mt-1 px-0.5">
                <span>{pctOfTop}% of total universe volume</span>
                {stage.holdCount !== undefined && stage.holdCount > 0 && (
                  <span className="text-amber-700 font-medium">
                    +{stage.holdCount} held for stability review
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Axis Footer */}
      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
        <div>
          <span className="font-medium text-slate-600">Metric (Y):</span> {yAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-600">Sequence (X):</span> {xAxisLabel}
        </div>
      </div>
    </div>
  );
};
