import React, { useState } from 'react';

export interface HeatmapCell {
  rowId: string;
  colId: string;
  value: number | string;
  displayValue?: string;
  status?: 'available' | 'partial' | 'none' | 'high' | 'medium' | 'low';
  color?: string;
  tooltip?: string;
  metadata?: Record<string, any>;
}

export interface HeatmapHeaderItem {
  id: string;
  label: string;
  sublabel?: string;
}

export interface HeatmapProps {
  title: string;
  soWhat: string;
  xAxisLabel: string;
  yAxisLabel: string;
  rows: HeatmapHeaderItem[];
  columns: HeatmapHeaderItem[];
  data: HeatmapCell[];
  cellColor?: (cell: HeatmapCell) => string;
  onCellClick?: (cell: HeatmapCell) => void;
  height?: number | string;
  className?: string;
}

export const Heatmap: React.FC<HeatmapProps> = ({
  title,
  soWhat,
  xAxisLabel,
  yAxisLabel,
  rows,
  columns,
  data,
  cellColor,
  onCellClick,
  height,
  className = '',
}) => {
  const [hoveredCell, setHoveredCell] = useState<{
    cell: HeatmapCell;
    row: HeatmapHeaderItem;
    col: HeatmapHeaderItem;
    x: number;
    y: number;
  } | null>(null);

  // Helper to find cell by row and col
  const getCell = (rowId: string, colId: string): HeatmapCell | undefined => {
    return data.find((c) => c.rowId === rowId && c.colId === colId);
  };

  // Default color resolver
  const resolveColor = (cell?: HeatmapCell): { bg: string; text: string; border: string } => {
    if (!cell) return { bg: '#F8FAFC', text: '#94A3B8', border: '#E2E8F0' };

    if (cellColor) {
      const customBg = cellColor(cell);
      return { bg: customBg, text: '#FFFFFF', border: 'transparent' };
    }

    if (cell.color) {
      return { bg: cell.color, text: '#FFFFFF', border: 'transparent' };
    }

    // Status-based defaults
    if (cell.status === 'available') {
      return { bg: '#0E7C86', text: '#FFFFFF', border: 'transparent' };
    }
    if (cell.status === 'partial') {
      return { bg: '#FDE68A', text: '#854D0E', border: '#FCD34D' }; // warm amber
    }
    if (cell.status === 'none') {
      return { bg: '#F1F5F9', text: '#94A3B8', border: '#E2E8F0' };
    }

    // Numeric continuous defaults (0 to 1 or 0 to 100)
    if (typeof cell.value === 'number') {
      const val = cell.value > 1 ? cell.value / 100 : cell.value;
      if (val >= 0.8) return { bg: '#0E7C86', text: '#FFFFFF', border: 'transparent' };
      if (val >= 0.6) return { bg: '#3CA5AE', text: '#FFFFFF', border: 'transparent' };
      if (val >= 0.4) return { bg: '#83CCD2', text: '#0B2740', border: 'transparent' };
      if (val >= 0.2) return { bg: '#CFE0EA', text: '#13293D', border: 'transparent' };
      return { bg: '#F1F5F9', text: '#5C7080', border: '#E2E8F0' };
    }

    return { bg: '#E2E8F0', text: '#1E293B', border: 'transparent' };
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-4 flex flex-col shadow-2xs ${className}`}>
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-section-title text-navy-900 leading-snug">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 font-normal italic">{soWhat}</p>
      </div>

      {/* Axis Information Banner */}
      <div className="flex items-center justify-between text-2xs font-semibold uppercase tracking-wider text-slate-400 mb-2 px-1">
        <span>Y: {yAxisLabel}</span>
        <span>X: {xAxisLabel}</span>
      </div>

      {/* Grid container with relative wrapper for custom tooltip */}
      <div
        className="overflow-x-auto relative"
        style={{ minHeight: height || 'auto' }}
        onMouseLeave={() => setHoveredCell(null)}
      >
        <table className="w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="p-2 border-b border-r border-slate-200 bg-slate-50 text-xs font-semibold text-navy-900 w-44 min-w-36">
                {yAxisLabel} / {xAxisLabel}
              </th>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className="p-2 border-b border-slate-200 bg-slate-50 text-xs font-medium text-navy-700 text-center min-w-28"
                >
                  <div>{col.label}</div>
                  {col.sublabel && (
                    <div className="text-2xs text-slate-400 font-normal">{col.sublabel}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="p-2 border-b border-r border-slate-200 text-xs font-medium text-navy-900 bg-slate-50/80">
                  <div>{row.label}</div>
                  {row.sublabel && (
                    <div className="text-2xs text-slate-500 font-normal">{row.sublabel}</div>
                  )}
                </td>
                {columns.map((col) => {
                  const cell = getCell(row.id, col.id);
                  const colors = resolveColor(cell);
                  return (
                    <td
                      key={`${row.id}-${col.id}`}
                      className="p-1.5 border-b border-slate-100 text-center"
                    >
                      <button
                        type="button"
                        onClick={() => cell && onCellClick?.(cell)}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredCell({
                            cell: cell || { rowId: row.id, colId: col.id, value: 'N/A' },
                            row,
                            col,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                          });
                        }}
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          borderColor: colors.border,
                        }}
                        className={`w-full py-2.5 px-2 rounded font-mono text-xs font-medium border transition-all duration-150 ${
                          onCellClick ? 'cursor-pointer hover:ring-2 hover:ring-teal-600 hover:ring-offset-1' : 'cursor-default'
                        }`}
                      >
                        {cell ? (cell.displayValue ?? String(cell.value)) : '—'}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Floating Tooltip */}
        {hoveredCell && (
          <div
            className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-navy-900 text-white text-xs rounded-md py-1.5 px-2.5 shadow-lg border border-navy-700 max-w-xs"
            style={{
              left: hoveredCell.x,
              top: hoveredCell.y - 6,
            }}
          >
            <div className="font-semibold text-slate-100 mb-0.5">
              {hoveredCell.row.label} × {hoveredCell.col.label}
            </div>
            <div className="text-teal-300 font-mono">
              Value: {hoveredCell.cell.displayValue ?? String(hoveredCell.cell.value)}
            </div>
            {hoveredCell.cell.status && (
              <div className="text-slate-300 capitalize text-2xs mt-0.5">
                Status: {hoveredCell.cell.status}
              </div>
            )}
            {hoveredCell.cell.tooltip && (
              <div className="text-slate-300 text-2xs mt-1 border-t border-navy-700 pt-1">
                {hoveredCell.cell.tooltip}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Axis Footer */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
        <div>
          <span className="font-medium text-slate-600">Rows:</span> {yAxisLabel}
        </div>
        <div>
          <span className="font-medium text-slate-600">Columns:</span> {xAxisLabel}
        </div>
      </div>
    </div>
  );
};
