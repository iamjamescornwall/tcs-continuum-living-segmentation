import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';
import { MarketCode, BrandCode, CustomerType } from '../../types';

export interface FilterState {
  market: MarketCode | 'ALL';
  brand: BrandCode | 'ALL';
  customerType?: CustomerType | 'ALL';
  searchQuery?: string;
  statusFilter?: string;
}

export interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  showCustomerType?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: string[];
  showSearch?: boolean;
  searchPlaceholder?: string;
  availableMarkets?: Array<{ code: MarketCode | 'ALL'; label: string }>;
  availableBrands?: Array<{ code: BrandCode | 'ALL'; label: string }>;
  className?: string;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  showCustomerType = true,
  showStatusFilter = false,
  statusOptions = ['All', 'Proposed', 'Held', 'Approved', 'Rejected'],
  showSearch = true,
  searchPlaceholder = 'Search customer name or ID...',
  availableMarkets = [
    { code: 'ALL', label: 'All markets' },
    { code: 'MKT_A', label: 'Market A (Data-rich)' },
    { code: 'MKT_B', label: 'Market B (Signal-enriched)' },
    { code: 'MKT_C', label: 'Market C (Survey-led)' },
  ],
  availableBrands = [
    { code: 'AUR', label: 'Aurelix (Hero)' },
    { code: 'ZEN', label: 'Zentrova' },
    { code: 'CRD', label: 'Cardivance' },
    { code: 'NEU', label: 'Neurelle' },
    { code: 'BRV', label: 'Brevanta' },
  ],
  className = '',
  onReset,
}) => {
  return (
    <div
      className={`bg-white rounded-lg border border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center text-slate-500 font-medium">
          <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <span>Filters:</span>
        </div>

        {/* Market Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-500">Market:</label>
          <select
            value={filters.market}
            onChange={(e) =>
              onFilterChange({ ...filters, market: e.target.value as MarketCode | 'ALL' })
            }
            className="border border-slate-200 rounded px-2 py-1 bg-white text-navy-900 font-medium focus:outline-hidden focus:border-teal-600"
          >
            {availableMarkets.map((m) => (
              <option key={m.code} value={m.code}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-slate-500">Brand:</label>
          <select
            value={filters.brand}
            onChange={(e) =>
              onFilterChange({ ...filters, brand: e.target.value as BrandCode | 'ALL' })
            }
            className="border border-slate-200 rounded px-2 py-1 bg-white text-navy-900 font-medium focus:outline-hidden focus:border-teal-600"
          >
            {availableBrands.map((b) => (
              <option key={b.code} value={b.code}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Type Filter */}
        {showCustomerType && (
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500">Type:</label>
            <div className="inline-flex rounded border border-slate-200 overflow-hidden bg-slate-50">
              {(['ALL', 'HCP', 'HCO'] as const).map((t) => {
                const isActive = (filters.customerType || 'ALL') === t;
                const label = t === 'ALL' ? 'All' : t === 'HCP' ? 'Prescribers' : 'Accounts';
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onFilterChange({ ...filters, customerType: t })}
                    className={`px-2 py-1 text-xs transition-colors ${
                      isActive
                        ? 'bg-navy-900 text-white font-medium'
                        : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Filter */}
        {showStatusFilter && (
          <div className="flex items-center gap-1.5">
            <label className="text-slate-500">Status:</label>
            <select
              value={filters.statusFilter || 'All'}
              onChange={(e) =>
                onFilterChange({ ...filters, statusFilter: e.target.value })
              }
              className="border border-slate-200 rounded px-2 py-1 bg-white text-navy-900 font-medium focus:outline-hidden focus:border-teal-600"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search and Reset */}
      <div className="flex items-center gap-2">
        {showSearch && (
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="border border-slate-200 rounded px-2.5 py-1 w-48 text-xs text-navy-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600"
          />
        )}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            title="Reset filters"
            className="p-1 text-slate-400 hover:text-navy-900 rounded hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
