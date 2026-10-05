import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Database,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react';
import { PageHeader } from '../components/layout/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { KpiTile } from '../components/ui/KpiTile';
import { SegmentAgeChip } from '../components/ui/SegmentAgeChip';
import { DataTable, Column } from '../components/ui/DataTable';
import { Heatmap, HeatmapHeaderItem, HeatmapCell } from '../components/charts/Heatmap';
import { useAppStore } from '../store/useAppStore';
import dataService from '../services/dataService';
import { formatPercent } from '../utils/formatters';
import { FeatureStoreItem } from '../types';

export const S04_MarketData: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentMarket, currentPersona } = useAppStore();

  const isP2 = currentPersona === 'P2';
  const activeMarket = isP2 ? 'MKT_B' : currentMarket;

  const currentTab = searchParams.get('tab') || 'readiness';
  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'readiness', label: 'Data Readiness Heatmap' },
    { id: 'data-quality', label: 'Data Quality' },
    { id: 'signal-freshness', label: 'Signal Freshness' },
    { id: 'feature-store', label: 'Feature Store' },
  ];

  const fullAggregates = dataService.getFullAggregatesData();
  const featureStoreItems = dataService.getFeatureStore();

  // 1. Readiness Heatmap Rows and Columns
  const heatmapRows: HeatmapHeaderItem[] = useMemo(() => {
    const all = [
      { id: 'MKT_A', label: 'Market A (Data-rich)', sublabel: 'Continuous rescoring' },
      { id: 'MKT_B', label: 'Market B (Signal-enriched)', sublabel: 'Moving telemetry' },
      { id: 'MKT_C', label: 'Market C (Survey-led)', sublabel: 'Vendor Excel file' },
    ];
    if (isP2) return all.filter((r) => r.id === 'MKT_B');
    if (activeMarket !== 'ALL') return all.filter((r) => r.id === activeMarket);
    return all;
  }, [activeMarket, isP2]);

  const heatmapCols: HeatmapHeaderItem[] = [
    { id: 'pmr', label: 'Survey & PMR' },
    { id: 'crm', label: 'CRM Activity & Notes' },
    { id: 'sales', label: 'Prescriber Sales / Rx' },
    { id: 'claims', label: 'Claims & Formulary' },
    { id: 'digital', label: 'Digital Telemetry' },
    { id: 'affiliations', label: 'Master & Affiliations' },
  ];

  const heatmapCells: HeatmapCell[] = [
    // Market A
    { rowId: 'MKT_A', colId: 'pmr', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Annual survey & quarterly PMR panels' },
    { rowId: 'MKT_A', colId: 'crm', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Veeva CRM interactions & rep call notes' },
    { rowId: 'MKT_A', colId: 'sales', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'HCP-level TRx & NBRx weekly feeds' },
    { rowId: 'MKT_A', colId: 'claims', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Longitudinal patient claims & formulary access' },
    { rowId: 'MKT_A', colId: 'digital', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Web portal, email telemetry & webinar engagement' },
    { rowId: 'MKT_A', colId: 'affiliations', value: 'Available', displayValue: 'Full', status: 'available', tooltip: '94% primary HCO affiliation match' },

    // Market B
    { rowId: 'MKT_B', colId: 'pmr', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Perception studies and local research' },
    { rowId: 'MKT_B', colId: 'crm', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Detailed call logs & structured field notes' },
    { rowId: 'MKT_B', colId: 'sales', value: 'Partial', displayValue: 'Brick', status: 'partial', tooltip: 'Brick-level sales volume; no HCP-level Rx' },
    { rowId: 'MKT_B', colId: 'claims', value: 'Partial', displayValue: 'Regional', status: 'partial', tooltip: 'Regional access & hospital formulary status' },
    { rowId: 'MKT_B', colId: 'digital', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Consented email opens & event attendance' },
    { rowId: 'MKT_B', colId: 'affiliations', value: 'Available', displayValue: 'Full', status: 'available', tooltip: '91% primary HCO affiliation match' },

    // Market C
    { rowId: 'MKT_C', colId: 'pmr', value: 'Available', displayValue: 'Full', status: 'available', tooltip: 'Annual market research spreadsheet' },
    { rowId: 'MKT_C', colId: 'crm', value: 'Partial', displayValue: 'Basic', status: 'partial', tooltip: 'Call frequency only; rep observations' },
    { rowId: 'MKT_C', colId: 'sales', value: 'None', displayValue: 'None', status: 'none', tooltip: 'Not available in this market — using proxy: rep assessment + PMR' },
    { rowId: 'MKT_C', colId: 'claims', value: 'None', displayValue: 'None', status: 'none', tooltip: 'No public claims or institutional registry' },
    { rowId: 'MKT_C', colId: 'digital', value: 'None', displayValue: 'None', status: 'none', tooltip: 'Limited consented digital engagement' },
    { rowId: 'MKT_C', colId: 'affiliations', value: 'Partial', displayValue: 'Partial', status: 'partial', tooltip: '84% match rate to customer master' },
  ];

  // 2. Data Quality Table Data
  type QualityRecord = {
    field: string;
    category: string;
    mktA: string;
    mktB: string;
    mktC: string;
    target: string;
    status: 'Good' | 'Fair' | 'Poor';
  };

  const qualityData: QualityRecord[] = [
    { field: 'HCP Master Match Rate', category: 'Identity', mktA: '97.2%', mktB: '94.1%', mktC: '88.4%', target: '>90%', status: 'Good' },
    { field: 'Duplicate Prescriber Rate', category: 'Identity', mktA: '1.0%', mktB: '2.0%', mktC: '4.0%', target: '<2%', status: 'Fair' },
    { field: 'Primary HCO Affiliation Coverage', category: 'Affiliations', mktA: '94.0%', mktB: '91.2%', mktC: '84.0%', target: '>85%', status: 'Good' },
    { field: 'Specialty Taxonomy Standardization', category: 'Attributes', mktA: '99.5%', mktB: '98.0%', mktC: '91.5%', target: '>95%', status: 'Good' },
    { field: 'Prescribing Volume Signals', category: 'Commercial', mktA: '98.0%', mktB: '85.0% (Brick)', mktC: 'Proxy Only', target: '>80%', status: 'Fair' },
    { field: 'Consent & Preference Completeness', category: 'Compliance', mktA: '92.4%', mktB: '89.1%', mktC: '76.0%', target: '>85%', status: 'Fair' },
  ];

  const qualityColumns: Column<QualityRecord>[] = [
    {
      key: 'field',
      header: 'Quality Dimension',
      render: (row) => (
        <div>
          <div className="font-semibold text-navy-900">{row.field}</div>
          <div className="text-xs text-slate-500">{row.category}</div>
        </div>
      ),
    },
    { key: 'mktA', header: 'Market A', align: 'center' },
    { key: 'mktB', header: 'Market B', align: 'center' },
    {
      key: 'mktC',
      header: 'Market C',
      align: 'center',
      render: (row) => (
        <span className={row.mktC.includes('Proxy') ? 'text-rust-600 font-medium' : ''}>
          {row.mktC}
        </span>
      ),
    },
    { key: 'target', header: 'Governance Target', align: 'center' },
    {
      key: 'status',
      header: 'Conformance',
      align: 'center',
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
          row.status === 'Good'
            ? 'bg-teal-50 text-teal-700'
            : row.status === 'Fair'
            ? 'bg-amber-50 text-amber-800'
            : 'bg-red-50 text-red-700'
        }`}>
          {row.status}
        </span>
      ),
    },
  ];

  // 3. Signal Freshness Table Data
  type FreshnessRecord = {
    id: string;
    signalName: string;
    sourceCategory: string;
    cadence: string;
    lastRefresh: string;
    ageDays: number;
    isLate: boolean;
  };

  const freshnessData: FreshnessRecord[] = [
    { id: 'SIG-01', signalName: 'Weekly HCP NBRx & TRx Feed', sourceCategory: 'Prescriptions', cadence: 'Weekly', lastRefresh: '2026-10-10', ageDays: 5, isLate: false },
    { id: 'SIG-02', signalName: 'Monthly Longitudinal Patient Claims', sourceCategory: 'Claims', cadence: 'Monthly', lastRefresh: '2026-09-30', ageDays: 15, isLate: false },
    { id: 'SIG-03', signalName: 'Veeva CRM Rep Call Details & Notes', sourceCategory: 'CRM Activity', cadence: 'Daily', lastRefresh: '2026-10-14', ageDays: 1, isLate: false },
    { id: 'SIG-04', signalName: 'Consented Email & Portal Telemetry', sourceCategory: 'Digital', cadence: 'Weekly', lastRefresh: '2026-10-08', ageDays: 7, isLate: false },
    { id: 'SIG-05', signalName: 'Institutional Formulary Decisions', sourceCategory: 'Access', cadence: 'Event-driven', lastRefresh: '2026-10-12', ageDays: 3, isLate: false },
    { id: 'SIG-06', signalName: 'Market C Local Vendor PMR Spreadsheet', sourceCategory: 'Survey', cadence: 'Annual', lastRefresh: '2025-11-20', ageDays: 329, isLate: true },
  ];

  const freshnessColumns: Column<FreshnessRecord>[] = [
    {
      key: 'signalName',
      header: 'Signal Stream',
      render: (row) => (
        <div>
          <div className="font-semibold text-navy-900">{row.signalName}</div>
          <div className="text-xs text-slate-500 font-mono">{row.id} · {row.sourceCategory}</div>
        </div>
      ),
    },
    { key: 'cadence', header: 'Expected Cadence' },
    {
      key: 'lastRefresh',
      header: 'Last Refresh',
      render: (row) => <span className="font-mono text-xs text-slate-700">{row.lastRefresh}</span>,
    },
    {
      key: 'ageDays',
      header: 'Data Age',
      render: (row) => <SegmentAgeChip days={row.ageDays} />,
    },
    {
      key: 'isLate',
      header: 'Status',
      align: 'center',
      render: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
          row.isLate
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-teal-50 text-teal-700 border border-teal-200'
        }`}>
          {row.isLate ? 'Late / Stale' : 'On Schedule'}
        </span>
      ),
    },
  ];

  // 4. Feature Store Columns
  const featureColumns: Column<FeatureStoreItem>[] = [
    {
      key: 'feature_name',
      header: 'Feature Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-navy-900">{row.feature_name}</div>
          <div className="text-xs text-slate-500 font-mono">{row.feature_id}</div>
        </div>
      ),
    },
    { key: 'source_category', header: 'Source' },
    { key: 'refresh_cadence', header: 'Cadence' },
    {
      key: 'data_age_days',
      header: 'Data Age',
      render: (row) => {
        const targetMkt = activeMarket === 'ALL' ? 'MKT_A' : activeMarket;
        const days = row.data_age_days[targetMkt];
        return days != null ? <SegmentAgeChip days={days} /> : <span className="text-xs text-slate-400">N/A</span>;
      },
    },
    {
      key: 'mktA',
      header: 'Market A',
      align: 'center',
      render: (row) => (
        row.availability.MKT_A === 'Available' ? (
          <CheckCircle2 className="w-4 h-4 text-teal-600 inline" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-300 inline" />
        )
      ),
    },
    {
      key: 'mktB',
      header: 'Market B',
      align: 'center',
      render: (row) => (
        row.availability.MKT_B === 'Available' ? (
          <CheckCircle2 className="w-4 h-4 text-teal-600 inline" />
        ) : row.availability.MKT_B === 'Partial' ? (
          <span className="text-xs text-amber-700 font-medium">Partial</span>
        ) : (
          <XCircle className="w-4 h-4 text-slate-300 inline" />
        )
      ),
    },
    {
      key: 'mktC',
      header: 'Market C',
      align: 'center',
      render: (row) => (
        row.availability.MKT_C === 'Available' ? (
          <CheckCircle2 className="w-4 h-4 text-teal-600 inline" />
        ) : (
          <XCircle className="w-4 h-4 text-slate-300 inline" />
        )
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Market Data & Readiness"
        question="Is each market's data ready?"
      />

      <Tabs tabs={tabs} activeTab={currentTab} onChange={handleTabChange} />

      {/* TAB 1: READINESS HEATMAP */}
      {currentTab === 'readiness' && (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-teal-700 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-body-sm font-semibold text-navy-900">
                Data Maturity Reality: Why Segmentation Methods Differ
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Market A operates on prescriber-level claims and Rx telemetry suitable for K-means clustering.
                Market B leverages rich CRM interactions and brick sales for deciling.
                Market C operates in a strict survey-led regime where sales data cannot be collected at the HCP level.
              </p>
            </div>
          </div>

          <Heatmap
            title="Cross-Market Data Source Availability Heatmap"
            soWhat="Availability dictates whether a market builds segments via K-means, deciling rules, or survey grids."
            xAxisLabel="Commercial Data Domain"
            yAxisLabel="Market Archetype"
            rows={heatmapRows}
            columns={heatmapCols}
            data={heatmapCells}
            height={260}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-teal-50 text-teal-700">
                Market A · Data-rich
              </span>
              <div className="text-body-sm font-semibold text-navy-900 mt-2">K-Means + Rules Overlay</div>
              <p className="text-xs text-slate-600 mt-1">
                Near-continuous re-scoring enabled by claims feeds and Rx volume.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                Market B · Signal-enriched
              </span>
              <div className="text-body-sm font-semibold text-navy-900 mt-2">Deciling + Behavioural</div>
              <p className="text-xs text-slate-600 mt-1">
                Event-driven updates driven by rep notes, digital telemetry, and brick trends.
              </p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                Market C · Survey-led
              </span>
              <div className="text-body-sm font-semibold text-navy-900 mt-2">Vendor Grid Template</div>
              <p className="text-xs text-slate-600 mt-1">
                Proxy-backed living loop using PMR observations and rep qualitative inputs.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA QUALITY */}
      {currentTab === 'data-quality' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Customer Master Match Rate"
              value={formatPercent(fullAggregates.markets[activeMarket === 'ALL' ? 'ALL' : activeMarket].data_quality.hcp_match_rate)}
              delta={{ value: 'Target: >90%', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Duplicate Record Rate"
              value={formatPercent(fullAggregates.markets[activeMarket === 'ALL' ? 'ALL' : activeMarket].data_quality.duplicate_rate)}
              delta={{ value: 'Target: <2%', direction: 'down', isPositive: true }}
            />
            <KpiTile
              label="Primary Affiliation Coverage"
              value={formatPercent(fullAggregates.markets[activeMarket === 'ALL' ? 'ALL' : activeMarket].data_quality.pct_primary_affiliation)}
              delta={{ value: 'Linked to governed HCO', direction: 'up', isPositive: true }}
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-section-title text-navy-900">Data Quality Metrics by Market</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Core master data readiness indicators ensuring valid living segmentation routing.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Customer Master Lakehouse v4.2
              </span>
            </div>

            <DataTable
              data={qualityData}
              columns={qualityColumns}
              rowKey={(row) => row.field}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 3: SIGNAL FRESHNESS */}
      {currentTab === 'signal-freshness' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiTile
              label="Signals Monitored Daily"
              value="6 Active Streams"
              delta={{ value: 'Claims, Rx, Notes, CRM, Portal', direction: 'neutral' }}
            />
            <KpiTile
              label="Signals on Target Cadence"
              value="5 / 6"
              delta={{ value: '83% on time', direction: 'up', isPositive: true }}
            />
            <KpiTile
              label="Late Feeds Flagged"
              value="1 Feed (Market C PMR)"
              delta={{ value: 'Stale by 149 days', direction: 'down', isPositive: false }}
            />
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-section-title text-navy-900">Signal Ingestion Freshness Registry</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuum tracks data freshness continuously to prevent outdated signals from generating spurious drift flags.
              </p>
            </div>

            <DataTable
              data={freshnessData}
              columns={freshnessColumns}
              rowKey={(row) => row.id}
              pageSize={10}
            />
          </div>
        </div>
      )}

      {/* TAB 4: FEATURE STORE */}
      {currentTab === 'feature-store' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div>
              <h3 className="text-section-title text-navy-900">Enterprise Commercial Feature Store</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardised, versioned customer features accessible to Segmentation Studio and Living Drift Detectors.
              </p>
            </div>
            <button
              onClick={() => navigate('/studio')}
              className="px-3 py-1.5 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Use in Segmentation Studio</span>
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs">
            <DataTable
              data={featureStoreItems}
              columns={featureColumns}
              rowKey={(row) => row.feature_id}
              pageSize={10}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default S04_MarketData;
