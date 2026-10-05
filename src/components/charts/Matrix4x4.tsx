import React, { useState } from 'react';
import { AlertCircle, Sparkles } from 'lucide-react';

export interface MatrixCellData {
  potential: number | string; // 1, 2, 3, 4 (or Tier 1, Tier 2, etc.)
  adoptionStage: string; // e.g. Awareness, Consideration, Trial, Adoption
  count: number;
  sharePct?: number;
  isOpportunityGap?: boolean;
  notes?: string;
}

export interface Matrix4x4Props {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  data: MatrixCellData[];
  potentialLabels?: string[]; // rows, default: ['Tier 1 (High)', 'Tier 2 (Medium-High)', 'Tier 3 (Medium)', 'Tier 4 (Low)']
  adoptionLabels?: string[]; // cols, default: ['Awareness', 'Consideration', 'Trial', 'Adoption']
  isProxyData?: boolean;
  proxyNotice?: string;
  className?: string;
  onCellClick?: (cell: MatrixCellData) => void;
}

export const Matrix4x4: React.FC<Matrix4x4Props> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  data,
  potentialLabels = ['Tier 1 (High)', 'Tier 2 (Med-High)', 'Tier 3 (Med-Low)', 'Tier 4 (Low)'],
  adoptionLabels = ['Awareness', 'Consideration', 'Trial', 'Adoption'],
  isProxyData = false,
  proxyNotice = 'Not available in this market — using proxy: rep assessment + PMR',
  className = '',
  onCellClick,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    cell: MatrixCellData;
    rowLabel: string;
    colLabel: string;
    x: number;
    y: number;
  } | null>(null);

  // Maximum count for scaling bubbles
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const totalCount = data.reduce((acc, curr) => acc + curr.count, 0);

  // Helper to retrieve cell matching row index and col index
  const findCell = (rowIndex: number, colIndex: number): MatrixCellData => {
    const pTier = 4 - rowIndex; // Rows are 1 (Tier 1) to 4 (Tier 4) or vice versa
    const colName = adoptionLabels[colIndex];

    const match = data.find(
      (c) =>
        (Number(c.potential) === pTier || c.potential === `Tier ${pTier}` || c.potential === rowIndex + 1) &&
        c.adoptionStage.toLowerCase() === colName.toLowerCase()
    );

    if (match) return match;

    // Fallback: check index match directly
    const fallbackMatch = data.find(
      (c) =>
        (String(c.potential).includes(String(pTier)) || String(c.potential).includes(potentialLabels[rowIndex])) &&
        (c.adoptionStage.toLowerCase() === colName.toLowerCase() || c.adoptionStage.includes(colName))
    );

    return (
      fallbackMatch || {
        potential: pTier,
        adoptionStage: colName,
        count: 0,
        isOpportunityGap: rowIndex <= 1 && colIndex <= 1,
      }
    );
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col shadow-2xs ${className}`}>
      {/* Header */}
      <div className="mb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-section-title text-navy-900 leading-snug">{title}</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-normal italic">{soWhat}</p>
          </div>
          {isProxyData && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded text-amber-800 text-2xs font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
              <span>{proxyNotice}</span>
            </div>
          )}
        </div>
      </div>

      {/* Axis Information Banner */}
      <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
        <span>Y: {yAxisLabel}</span>
        <span>X: {xAxisLabel}</span>
      </div>

      {/* 4x4 Grid Container */}
      <div
        className="relative overflow-x-auto"
        onMouseLeave={() => setHoveredCell(null)}
      >
        <div className="min-w-[540px]">
          {/* Column Headers (X: Adoption Stages) */}
          <div className="grid grid-cols-5 gap-2 mb-2">
            <div className="text-2xs font-semibold text-slate-400 uppercase tracking-wider flex items-end justify-end pr-2 pb-1">
              Potential ↓ / Stage →
            </div>
            {adoptionLabels.map((col, cIdx) => (
              <div
                key={col}
                className="text-center bg-slate-50 border border-slate-200/80 rounded py-1.5 px-1"
              >
                <span className="text-xs font-semibold text-navy-900 block leading-tight">
                  {col}
                </span>
                <span className="text-2xs text-slate-400 font-normal">Stage {cIdx + 1}</span>
              </div>
            ))}
          </div>

          {/* Rows (Y: Potential Tiers) */}
          <div className="space-y-2">
            {potentialLabels.map((rowLabel, rIdx) => {
              return (
                <div key={rowLabel} className="grid grid-cols-5 gap-2">
                  {/* Row Header */}
                  <div className="flex items-center justify-end pr-3 bg-slate-50/70 border border-slate-100 rounded px-2">
                    <span className="text-xs font-semibold text-navy-900 text-right">
                      {rowLabel}
                    </span>
                  </div>

                  {/* 4 Grid Cells */}
                  {adoptionLabels.map((colLabel, cIdx) => {
                    const cell = findCell(rIdx, cIdx);
                    const isGap =
                      cell.isOpportunityGap ?? (rIdx <= 1 && cIdx <= 1); // High potential + early stage = gap
                    const sizeFraction = Math.max(cell.count / maxCount, 0.05);
                    const bubbleSize = 24 + sizeFraction * 36; // 24px to 60px

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        onClick={() => onCellClick?.(cell)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell,
                            rowLabel,
                            colLabel,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        className={`relative h-24 rounded-lg border flex flex-col items-center justify-center p-2 transition-all duration-150 ${
                          isGap
                            ? 'bg-amber-50/40 border-dashed border-amber-400 hover:border-amber-600 hover:bg-amber-50/70'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        } ${onCellClick ? 'cursor-pointer' : ''}`}
                      >
                        {/* Gap Tag if highlighted */}
                        {isGap && (
                          <div className="absolute top-1 right-1 flex items-center gap-0.5 text-3xs font-bold text-amber-700 bg-amber-100/90 px-1 py-0.5 rounded">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Gap</span>
                          </div>
                        )}

                        {/* Sized Bubble */}
                        <div
                          className="rounded-full flex items-center justify-center text-white font-mono font-bold transition-transform duration-150 transform hover:scale-105 shadow-2xs"
                          style={{
                            width: `${bubbleSize}px`,
                            height: `${bubbleSize}px`,
                            backgroundColor: isGap ? '#E9B44C' : '#0E7C86',
                            fontSize: bubbleSize > 38 ? '13px' : '11px',
                          }}
                        >
                          {cell.count}
                        </div>

                        {/* Share percentage */}
                        <div className="text-2xs text-slate-500 font-mono mt-1">
                          {totalCount > 0 ? `${Math.round((cell.count / totalCount) * 100)}%` : '0%'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-navy-900 text-white text-xs rounded-md py-2 px-3 shadow-lg border border-navy-700 max-w-xs"
            style={{ left: hoveredCell.x, top: hoveredCell.y - 6 }}
          >
            <div className="font-semibold text-slate-100 flex items-center gap-1.5 border-b border-navy-700 pb-1 mb-1">
              <span>{hoveredCell.rowLabel}</span>
              <span className="text-slate-400">×</span>
              <span>{hoveredCell.colLabel}</span>
            </div>
            <div className="text-teal-300 font-mono font-bold text-sm">
              {hoveredCell.cell.count.toLocaleString()} HCPs
            </div>
            <div className="text-slate-300 text-2xs mt-0.5">
              {totalCount > 0 ? ((hoveredCell.cell.count / totalCount) * 100).toFixed(1) : 0}% of
              universe
            </div>
            {hoveredCell.cell.isOpportunityGap && (
              <div className="text-amber-300 text-2xs mt-1 pt-1 border-t border-navy-700 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Opportunity Gap: High potential, early adoption stage</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
        <div>
          <span className="font-medium text-slate-600">Rows (Y):</span> {yAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-600">Columns (X):</span> {xAxisLabel}
        </div>
      </div>
    </div>
  );
};
